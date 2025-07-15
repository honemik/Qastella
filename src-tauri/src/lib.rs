// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashMap, fs, path::PathBuf};
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

#[derive(Serialize, Deserialize)]
struct RAnswerRecord {
    question: RQuestion,
    answer: Value,
    correct: bool,
}

#[derive(Serialize, Deserialize)]
struct RExamResult {
    records: Vec<RAnswerRecord>,
    elapsed: u64,
    timestamp: String,
}

#[tauri::command]
fn sample_questions() -> Vec<RQuestion> {
    let mut opts = HashMap::new();
    opts.insert("A".into(), "Yes".into());
    opts.insert("B".into(), "No".into());
    vec![RQuestion { id: 1, question: "Example?".into(), options: Some(opts), answer: Value::String("A".into()) }]
}

#[tauri::command]
fn default_data_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    Ok(app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string())
}

fn resolve_path(app_handle: &tauri::AppHandle, dir: Option<String>, file: &str) -> Result<PathBuf, String> {
    if let Some(d) = dir {
        let mut p = PathBuf::from(d);
        if p.is_dir() {
            p.push(file);
        }
        Ok(p)
    } else {
        Ok(app_handle
            .path()
            .app_data_dir()
            .map_err(|e| e.to_string())?
            .join(file))
    }
}

#[tauri::command]
fn load_questions(app_handle: tauri::AppHandle, dir: Option<String>) -> Result<Vec<RQuestion>, String> {
    let path = resolve_path(&app_handle, dir, "question_bank.json")?;
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).map_err(|e| e.to_string()),
        Err(_) => Ok(Vec::new()),
    }
}

#[tauri::command]
fn save_questions(app_handle: tauri::AppHandle, dir: Option<String>, questions: Vec<RQuestion>) -> Result<(), String> {
    let path = resolve_path(&app_handle, dir, "question_bank.json")?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_vec_pretty(&questions).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_history(app_handle: tauri::AppHandle, dir: Option<String>) -> Result<Vec<RExamResult>, String> {
    let path = resolve_path(&app_handle, dir, "history.json")?;
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).map_err(|e| e.to_string()),
        Err(_) => Ok(Vec::new()),
    }
}

#[tauri::command]
fn save_history(app_handle: tauri::AppHandle, dir: Option<String>, history: Vec<RExamResult>) -> Result<(), String> {
    let path = resolve_path(&app_handle, dir, "history.json")?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_vec_pretty(&history).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            sample_questions,
            default_data_dir,
            load_questions,
            save_questions,
            load_history,
            save_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
