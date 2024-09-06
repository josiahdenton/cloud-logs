package main

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatchlogs"
	cloudwatchtypes "github.com/aws/aws-sdk-go-v2/service/cloudwatchlogs/types"
)

/*
Cloudwatch.go

What does this do
- build queries to send to CW Insights API
- query the status of the query on demand
- cache all results into a map FIXME: remove all caching and allow the cl-api the orchestrate that instead
*/
type Query struct {
	logGroup  string
	query     string
	startTime int64
	endTime   int64
}

type QueryBuilder struct {
	client        *cloudwatchlogs.Client
	preparedQuery Query
}

type Identity struct {
	profile string
	region  string
}

// NewQueryBuilder should be run unique for each request as each
// CW client will be unique per region, account, etc.
// TODO: we can improve NewQueryBuilder by caching clients
// a profile + region pair make up an Identity
func NewQueryBuilder(ctx context.Context, identity Identity) (*QueryBuilder, error) {
	awsConfig, err := config.LoadDefaultConfig(
		ctx,
		config.WithSharedConfigProfile(identity.profile),
		config.WithRegion(identity.region),
	)
	if err != nil {
		return nil, err
	}

	client := cloudwatchlogs.NewFromConfig(awsConfig)

	return &QueryBuilder{client: client}, nil
}

// ListLogGroups based off of a filter string for the name
func (q *QueryBuilder) ListLogGroups(ctx context.Context, filter string) ([]string, error) {
	results, err := q.client.DescribeLogGroups(ctx, &cloudwatchlogs.DescribeLogGroupsInput{
		LogGroupNamePattern: aws.String(filter),
	})
	if err != nil {
		return nil, err
	}
	logGroups := make([]string, len(results.LogGroups))
	for i, name := range results.LogGroups {
		logGroups[i] = *name.LogGroupName
	}
	return logGroups, nil
}

// ExecuteQuery will run the query based on the With* settings used
func (q *QueryBuilder) ExecuteQuery(ctx context.Context) (string, error) {
	results, err := q.client.StartQuery(ctx, &cloudwatchlogs.StartQueryInput{
		StartTime:     aws.Int64(q.preparedQuery.startTime),
		EndTime:       aws.Int64(q.preparedQuery.endTime),
		QueryString:   aws.String(q.preparedQuery.query),
		LogGroupNames: []string{q.preparedQuery.logGroup},
	})

	if err != nil {
		return "", err
	}

	queryId := *results.QueryId

	return queryId, nil
}

func (q *QueryBuilder) WithLogGroup(group string) *QueryBuilder {
	q.preparedQuery.logGroup = group
	return q
}

func (q *QueryBuilder) WithStartTime(t int64) *QueryBuilder {
	q.preparedQuery.startTime = t
	return q
}

func (q *QueryBuilder) WithEndTime(t int64) *QueryBuilder {
	q.preparedQuery.endTime = t
	return q
}

func (q *QueryBuilder) WithQuery(query string) *QueryBuilder {
	q.preparedQuery.query = query
	return q
}

type QueryStatus struct {
	Status string              `json:"status"`
	Logs   []map[string]string `json:"logs"`
}

// QueryStatus the status of a specific queryId. Queries are unique to
// the account (profile) and region they were requested in.
func (q *QueryBuilder) QueryStatus(ctx context.Context, queryId string) (*QueryStatus, error) {
	result, err := q.client.GetQueryResults(ctx, &cloudwatchlogs.GetQueryResultsInput{
		QueryId: aws.String(queryId),
	})
	if err != nil {
		return nil, err
	}

	var qr QueryStatus
	qr.Status = string(result.Status)
	log.Printf("%+v", result.ResultMetadata)
	if result.Status == cloudwatchtypes.QueryStatusComplete {
		qr.Logs = parseQueryResults(result.Results)
	}

	return &qr, nil
}

func parseQueryResults(results [][]cloudwatchtypes.ResultField) []map[string]string {
	parsed := make([]map[string]string, len(results))

	for _, result := range results {
		// go through each k_v and put to map
		parsedObj := make(map[string]string)
		for _, kv := range result {
			parsedObj[*kv.Field] = parsedObj[*kv.Value]
		}
		parsed = append(parsed, parsedObj)
	}

	return parsed
}
