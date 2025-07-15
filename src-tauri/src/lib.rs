// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashMap, fs};
use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize)]
struct RQuestion {
    id: u32,
    question: String,
    options: Option<HashMap<String, String>>,
    answer: Value,
}

#[tauri::command]
fn sample_questions() -> Vec<RQuestion> {
    let mut opts = HashMap::new();
    opts.insert("A".into(), "Yes".into());
    opts.insert("B".into(), "No".into());
    vec![RQuestion { id: 1, question: "Example?".into(), options: Some(opts), answer: Value::String("A".into()) }]
}

#[tauri::command]
fn save_questions(app_handle: tauri::AppHandle, questions: Vec<RQuestion>) -> Result<(), String> {
    let path = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("question_bank.json");
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_vec_pretty(&questions).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, sample_questions, save_questions])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
