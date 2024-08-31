// this is the file where we store the search engine
// search engine will be responsible for
// - managing clients (cross-account)
// -

use std::{
    collections::{HashMap, HashSet},
    vec,
};

use anyhow::{anyhow, Context, Result};
use aws_sdk_cloudwatchlogs::{
    types::{QueryStatus, ResultField},
    Client,
};
use chrono::Utc;

use crate::client_builder::{log_client_from_env, US_EAST};

// NOTE: why? easier to implement for now
const CLIENT_LIMIT: usize = 1;

// TODO: add this to app state on start up
#[derive(Default, Debug)]
pub struct SearchEngine {
    client: Option<Client>,
    region: Option<String>,
    profile: Option<String>,
    log_groups: Vec<String>,
    /// track active queries
    query_ids: Vec<String>,
    /// passing query status
    status_done: HashSet<QueryStatus>,
}

// TODO: should wrap all pub fn's in commands
impl SearchEngine {
    pub fn new() -> Self {
        Self {
            client: None,
            region: Some(String::from(US_EAST)),
            profile: None,
            log_groups: vec![],
            query_ids: vec![],
            status_done: HashSet::from([
                QueryStatus::Complete,
                QueryStatus::Failed,
                QueryStatus::Cancelled,
                QueryStatus::Timeout,
            ]),
        }
    }

    pub fn choose_log_group(&mut self, log_group: &str) {
        if self.log_groups.len() >= CLIENT_LIMIT {
            return;
        }

        self.log_groups.push(String::from(log_group));
    }

    pub fn choose_region(&mut self, region: &str) {
        self.region = Some(String::from(region))
    }

    pub fn choose_profile(&mut self, profile: &str) {
        self.profile = Some(String::from(profile))
    }

    // first fn to be called when starting query
    pub async fn load_client(&mut self) -> Result<()> {
        if let (Some(profile), Some(region)) = (&self.profile, &self.region) {
            self.client = Some(log_client_from_env(profile, region).await);
            return Ok(());
        }

        Err(anyhow!("failed to load client, no profile selected"))
    }

    pub async fn list_log_groups(&self) -> Result<Vec<String>> {
        if let Some(client) = &self.client {
            let resp = client
                .describe_log_groups()
                .send()
                .await
                .context("failed to fetch log groups")?;
            if let Some(log_groups) = resp.log_groups {
                return Ok(log_groups
                    .iter()
                    .map(|group| String::from(group.log_group_name().unwrap_or("")))
                    .filter(|group| !group.is_empty())
                    .collect());
            }
        }

        Ok(vec![])
    }

    pub async fn search(
        &mut self,
        query: &str,
        look_behind: i64,
    ) -> Result<Vec<HashMap<String, String>>> {
        if let (Some(client), Some(log_group)) = (&self.client, self.log_groups.first()) {
            let now = Utc::now().timestamp();
            let look_back_till = now - look_behind;
            // TODO: once called, will need to check the status of the query
            let resp = client
                .start_query()
                .log_group_name(log_group)
                .query_string(query)
                .start_time(now)
                .end_time(look_back_till)
                .limit(10_000)
                .send()
                .await?;
            if let Some(id) = resp.query_id() {
                let resp = self.get_query_result(id).await?;
                return Ok(resp
                    .iter()
                    .map(|log_entry| {
                        log_entry
                            .iter()
                            .map(|entry_kv| {
                                if let (Some(field), Some(value)) =
                                    (entry_kv.field(), entry_kv.value())
                                {
                                    return (String::from(field), String::from(value));
                                }
                                (String::from(""), String::from(""))
                            })
                            .collect::<HashMap<String, String>>()
                    })
                    .collect::<Vec<HashMap<String, String>>>());
            }
        }

        Ok(vec![])
    }

    async fn get_query_result(&self, query_id: &str) -> Result<Vec<Vec<ResultField>>> {
        if let Some(client) = &self.client {
            while let Ok(resp) = client.get_query_results().query_id(query_id).send().await {
                match resp.status {
                    Some(status) => {
                        if self.status_done.contains(&status) {
                            return resp.results.ok_or_else(|| anyhow!("no results in query!"));
                        }
                        // info!("continuing")
                    }
                    None => return Err(anyhow!("no status found when getting query")),
                }
            }
        }

        Ok(vec![])
    }
}
