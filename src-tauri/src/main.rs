// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use cloud_logs::{self, commands, engine::SearchEngine, AppData};
use tauri::{async_runtime::Mutex, Manager};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(AppData {
                search_engine: SearchEngine::new(),
                profiles: vec![],
            }));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::choose_log_group,
            commands::choose_region,
            commands::choose_profile,
            commands::search,
            commands::list_log_groups,
            commands::get_all_profile_options,
            commands::save_profile_option,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
