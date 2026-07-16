pub mod commands;
pub mod models;
pub mod services; 
pub mod errors; 

use crate::commands::login_command::login_command;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![login_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
