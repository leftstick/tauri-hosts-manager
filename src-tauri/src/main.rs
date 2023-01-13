#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod state;
mod utils;

use crate::commands::hosts_manager::{
    change_file_writable, is_file_readonly, read_hosts, write_hosts,
};
use crate::commands::say_hello::greet;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_hosts,
            write_hosts,
            is_file_readonly,
            change_file_writable
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
