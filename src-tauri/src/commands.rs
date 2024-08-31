use std::collections::HashMap;

use tauri::async_runtime::Mutex;

use crate::AppData;

#[tauri::command]
pub async fn choose_log_group(
    state: tauri::State<'_, Mutex<AppData>>,
    group: String,
) -> Result<(), String> {
    let mut state = state.lock().await;
    state.search_engine.choose_log_group(&group);
    Ok(())
}

#[tauri::command]
pub async fn choose_region(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    let mut state = state.lock().await;
    state.search_engine.choose_region("TODO");
    Ok(())
}

#[tauri::command]
pub async fn choose_profile(
    state: tauri::State<'_, Mutex<AppData>>,
    profile: String,
) -> Result<(), String> {
    let mut state = state.lock().await;
    state.search_engine.choose_profile(&profile);
    state
        .search_engine
        .load_client()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn get_all_profile_options(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<Vec<String>, String> {
    // TODO: should instead save these profiles to a json file?? / sqlite DB
    let state = state.lock().await;
    Ok(state.profiles.clone())
}

#[tauri::command]
pub async fn save_profile_option(
    state: tauri::State<'_, Mutex<AppData>>,
    profile: String,
) -> Result<(), String> {
    let mut state = state.lock().await;
    // TODO: should instead save these profiles to a json file?? / sqlite DB
    state.profiles.push(profile);
    Ok(())
}

//#[tauri::command]
//pub async fn load_client(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
//    let mut state = state.lock().await;
//    state
//        .search_engine
//        .load_client()
//        .await
//        .map_err(|err| err.to_string())
//}

#[tauri::command] // NOTE: list_log_groups must be called after load_client
pub async fn list_log_groups(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<Vec<String>, String> {
    let state = state.lock().await;
    state
        .search_engine
        .list_log_groups()
        .await
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub async fn search(
    state: tauri::State<'_, Mutex<AppData>>,
    query: String,
    look_behind: i64,
) -> Result<Vec<HashMap<String, String>>, String> {
    let mut state = state.lock().await;
    state
        .search_engine
        .search(&query, look_behind)
        .await
        .map_err(|err| err.to_string())
}
