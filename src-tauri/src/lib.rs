// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use std::collections::HashMap;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct RQuestion {
    id: u32,
    question: String,
    options: Option<HashMap<String, String>>,
    answer: String,
}

#[tauri::command]
fn sample_questions() -> Vec<RQuestion> {
    let mut opts = HashMap::new();
    opts.insert("A".into(), "Yes".into());
    opts.insert("B".into(), "No".into());
    vec![RQuestion { id: 1, question: "Example?".into(), options: Some(opts), answer: "A".into() }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, sample_questions])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
