package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
)

/*
PLAN

For caching results... I should create a separate repository file
this enables me to move it easily into a sqliteDB


*/

type CachedQueryResult struct {
	LogGroup string
	QueryId  string
	Logs     []map[string]string
}

// NOTE: for now this is stored in memory, but will eventually move this to SQLite DB instead...
// If I did something like | queryId | BLOB | , I would have 1GB max on the BLOB (should be enough...)
// assume large messages (15KB per message), probably only getting in the 2-5 MB range...
var (
	// cache identities to reduce required query parameters
	queryIdToIdentity map[string]Identity
)

// FIXME: I need to evict items from the cache as time goes on...
// Or I should limit the size of the cache

type LogGroups struct {
	LogGroups []string `json:"logGroups"`
}

// listLogGroups will write a repsonse containing a list of log groups
//
// GET /cl/log-groups?profile=abc&region=us-east-1&filter=abinc
//
// where the filter is an encoded search string
func listLogGroups(w http.ResponseWriter, r *http.Request) {
	// NOTE: to get query parameters, just use query := r.URL.Query()
	queryParameters := r.URL.Query()
	profile := queryParameters.Get("profile")
	region := queryParameters.Get("region")
	filter := queryParameters.Get("filter")
	filter, err := url.QueryUnescape(filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("%s, %s", profile, region)

	// now just try using the QueryBuilder
	qb, err := NewQueryBuilder(r.Context(), Identity{profile: profile, region: region})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	groups, err := qb.ListLogGroups(r.Context(), filter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responseBody, err := json.Marshal(LogGroups{
		LogGroups: groups,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}

func search(w http.ResponseWriter, r *http.Request) {
	log.Printf("method %s", r.Method)
	// POST /cl/search
	if r.Method == http.MethodPost {
		executeSearch(w, r)
		return
	}

	path := r.URL.Path
	segments := strings.Split(path, "/") // [0] == ""

	if len(segments) < 5 {
		http.Error(w, "no such route", http.StatusNotFound)
		return
	}

	// GET /cl/search/{query-id}
	if r.Method == http.MethodGet {
		queryStatus(w, r)
		return
	}

	w.WriteHeader(http.StatusNotFound)
}

// return a query_id that can be used later on (job ID)

type QueryReference struct {
	Id string `json:"queryId"`
}

type QueryRequest struct {
	Profile   string `json:"profile"`
	Region    string `json:"region"`
	LogGroup  string `json:"logGroup"`
	Query     string `json:"query"`
	StartTime int64  `json:"startTime"`
	EndTime   int64  `json:"endTime"`
}

// executeSearch to start a new query
// POST /cl/search
//
// Expected Body
//
//		{
//		    "logGroup": <string>,
//	        "profile": <string>,
//	        "region": <string>,
//		    "query": <string>,
//		    "startTime": <number>,
//		    "endTime": <number>
//		}
func executeSearch(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var query QueryRequest
	err := json.NewDecoder(r.Body).Decode(&query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("%+v", query)

	// now just try using the QueryBuilder
	qb, err := NewQueryBuilder(r.Context(), Identity{profile: query.Profile, region: query.Region})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	queryId, err := qb.WithLogGroup(query.LogGroup).
		WithQuery(query.Query).
		WithStartTime(query.StartTime).
		WithEndTime(query.EndTime).
		ExecuteQuery(r.Context())

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := QueryReference{Id: queryId}
	responseBody, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}

const (
	Ready      = "Ready"
	InProgress = "InProgress"
	Complete   = "Complete"
	Failed     = "Failed"
)

type SearchResults struct {
	// the query-id that the AWS SDK retursn
	Id string `json:"queryId"`
	// the query status (Complete) when done
	Status string `json:"status"`
	// the logs associated with the query
	Logs []map[string]string `json:"logs"`
}

// queryStatus to check if the query has Completed. Will
// also return the logs once the status is marked Completed
// GET /cl/search/{query-id}
func queryStatus(w http.ResponseWriter, r *http.Request) {
	queryId := strings.Split(r.URL.Path, "/")[3]

	log.Printf("%s", queryId)

	if cachedIdentity, ok := queryIdToIdentity[queryId]; ok {
		qb, err := NewQueryBuilder(r.Context(), cachedIdentity)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		queryStatus, err := qb.QueryStatus(r.Context(), queryId)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		response := SearchResults{
			Id:     queryId,
			Status: queryStatus.Status,
			Logs:   queryStatus.Logs,
		}
		responseBody, err := json.Marshal(response)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Add("Content-Type", "application/json")
		w.Write(responseBody)
		w.WriteHeader(http.StatusOK)
	} else {
		// 404
		http.Error(w, "query-id not found", http.StatusNotFound)
	}
}

func main() {
	// setup in-memory store
	// FIXME: we will move this to sqliteDB
	queryIdToIdentity = make(map[string]Identity)

	http.HandleFunc("/cl/log-groups", listLogGroups)
	http.HandleFunc("/cl/search", search)  // <-- have to include the "/" at the end to push all sub-routes as well
	http.HandleFunc("/cl/search/", search) // <-- have to include the "/" at the end to push all sub-routes as well

	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Server failed to start %v\n", err)
	}

}
