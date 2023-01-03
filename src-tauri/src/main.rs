#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn can_write(file_path: &str) -> bool {

    // Check if able to write inside directory
    match fs::metadata(file_path) {
        Ok(md) => !md.permissions().readonly(),
        Err(_) => false,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, can_write])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
