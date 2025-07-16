// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Entry point for the Tauri application.
fn main() {
    qastella_lib::run()
}
