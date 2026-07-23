pub mod commands;
pub mod models;
pub mod services;
pub mod errors;

use crate::commands::login_command::login_command;
use crate::commands::bien_command::{
    crear_bien_command, listar_bienes_command, ajustar_stock_command, setear_bien_command,
};
use tauri::Manager;

fn init_db_pool(app: &tauri::App) -> Result<sqlx::SqlitePool, Box<dyn std::error::Error>> {
    let app_data_dir = app.path().app_data_dir()?;
    std::fs::create_dir_all(&app_data_dir)?;
    let db_path = app_data_dir.join("nutristock.db");

    tauri::async_runtime::block_on(async {
        let options = sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true);
        let pool = sqlx::SqlitePool::connect_with(options).await?;
        sqlx::migrate!("./migrations").run(&pool).await?;
        Ok::<_, Box<dyn std::error::Error>>(pool)
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let pool = init_db_pool(app)?;
            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            login_command,
            crear_bien_command,
            listar_bienes_command,
            ajustar_stock_command,
            setear_bien_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
