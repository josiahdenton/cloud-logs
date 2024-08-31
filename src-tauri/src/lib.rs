use anyhow::Result;
use engine::SearchEngine;

pub mod client_builder;
pub mod commands;
pub mod engine;

// shove all tauri commands in here...
//
// 1. run query
// 2. list log groups

// NOTE: planning...
// - ( ) setup app state
// - ( ) connect to aws
// - ( ) list log groups
// - ( ) run query on log group

/// search_logs takes in a query and returns
/// a vec containing a list of all possible results
/// **open question*
/// - how do I pass a message that isn't a string?
/// - will it need to be stringified json??
///
pub struct AppData {
    pub search_engine: SearchEngine,
    pub profiles: Vec<String>,
}
