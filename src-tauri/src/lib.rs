// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::{HashMap, BTreeMap}, fs, path::PathBuf};
use tauri::Manager;

/// Example command exposed to the frontend for testing the bridge.
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
    images: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize)]
struct RQuestionBank {
    subjects: BTreeMap<String, BTreeMap<String, Vec<RQuestion>>>,
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

/// Return a small built in question bank used when no data exists yet.
#[tauri::command]
fn sample_questions() -> RQuestionBank {
    let mut opts = HashMap::new();
    opts.insert("A".into(), "Yes".into());
    opts.insert("B".into(), "No".into());

    let question = RQuestion {
        id: 1,
        question: "Example?".into(),
        options: Some(opts),
        answer: Value::String("A".into()),
        images: None,
    };

    let mut src_map = BTreeMap::new();
    src_map.insert("Sample".into(), vec![question]);
    let mut subj_map = BTreeMap::new();
    subj_map.insert("General".into(), src_map);

    RQuestionBank { subjects: subj_map }
}

/// Determine the default directory used to store application data.
#[tauri::command]
fn default_data_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    Ok(app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string())
}

/// Helper to resolve a file path relative to either a custom directory or the application data dir.
fn resolve_path(
    app_handle: &tauri::AppHandle,
    dir: Option<String>,
    file: &str,
) -> Result<PathBuf, String> {
    if let Some(d) = dir {
        let mut p = PathBuf::from(d);
        // Treat the provided value as a directory path when it either exists as
        // one or appears to be a directory path (e.g. does not end with
        // `.json`). This avoids mistakenly treating paths such as
        // `com.qastella.honemik` on Windows as files.
        let looks_like_file = p
            .extension()
            .map(|ext| ext == "json")
            .unwrap_or(false);
        if p.is_dir() || !looks_like_file {
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

/// Load questions from the filesystem into a `RQuestionBank` structure.
#[tauri::command]
fn load_questions(
    app_handle: tauri::AppHandle,
    dir: Option<String>,
) -> Result<RQuestionBank, String> {
    let path = resolve_path(&app_handle, dir, "question_bank.json")?;
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).map_err(|e| e.to_string()),
        Err(_) => Ok(RQuestionBank { subjects: BTreeMap::new() }),
    }
}

/// Save the provided question bank to disk.
#[tauri::command]
fn save_questions(
    app_handle: tauri::AppHandle,
    dir: Option<String>,
    bank: RQuestionBank,
) -> Result<(), String> {
    let path = resolve_path(&app_handle, dir, "question_bank.json")?;
    println!("Saving question bank to {}", path.display());
    if let Some(parent) = path.parent() {
        if parent.exists() && parent.is_file() {
            fs::remove_file(parent).map_err(|e| e.to_string())?;
        }
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_vec_pretty(&bank).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

/// Load the exam history records from disk.
#[tauri::command]
fn load_history(
    app_handle: tauri::AppHandle,
    dir: Option<String>,
) -> Result<Vec<RExamResult>, String> {
    let path = resolve_path(&app_handle, dir, "history.json")?;
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).map_err(|e| e.to_string()),
        Err(_) => Ok(Vec::new()),
    }
}

/// Persist history records to disk.
#[tauri::command]
fn save_history(
    app_handle: tauri::AppHandle,
    dir: Option<String>,
    history: Vec<RExamResult>,
) -> Result<(), String> {
    let path = resolve_path(&app_handle, dir, "history.json")?;
    println!("Saving history to {}", path.display());
    if let Some(parent) = path.parent() {
        if parent.exists() && parent.is_file() {
            fs::remove_file(parent).map_err(|e| e.to_string())?;
        }
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let data = serde_json::to_vec_pretty(&history).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// Initialise Tauri and run the desktop application.
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
