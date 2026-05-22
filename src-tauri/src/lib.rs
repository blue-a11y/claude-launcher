use serde::{Deserialize, Serialize};
use std::fs;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::command;

const CONFIG_DIR: &str = ".claude-launcher";
const PROVIDERS_FILE: &str = "providers.json";
const SETTINGS_FILE: &str = "settings.json";

// ── Data Types ──

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Provider {
    pub id: String,
    pub name: String,
    pub base_url: String,
    pub api_key: String,
    #[serde(default = "default_auth_type")]
    pub auth_type: String,
    pub model: String,
    pub note: String,
}

fn default_auth_type() -> String {
    "auth_token".to_string()
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub providers: Vec<Provider>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    #[serde(default = "default_terminal")]
    pub terminal: String,
}

fn default_terminal() -> String {
    "terminal".to_string()
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            terminal: default_terminal(),
        }
    }
}

// ── Config Helpers ──

fn config_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(CONFIG_DIR)
}

fn ensure_config_dir() -> Result<PathBuf, String> {
    let dir = config_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    }
    Ok(dir)
}

// ── Provider Settings ──

fn write_provider_settings(
    base_url: &str,
    api_key: &str,
    auth_type: &str,
    model: &str,
    ts: u128,
) -> Result<PathBuf, String> {
    let auth_key = match auth_type {
        "api_key" => "ANTHROPIC_API_KEY",
        _ => "ANTHROPIC_AUTH_TOKEN",
    };
    let mut env = serde_json::Map::new();
    env.insert("ANTHROPIC_BASE_URL".into(), serde_json::json!(base_url));
    env.insert(auth_key.into(), serde_json::json!(api_key));
    env.insert("ANTHROPIC_MODEL".into(), serde_json::json!(model));
    env.insert("ANTHROPIC_DEFAULT_HAIKU_MODEL".into(), serde_json::json!(model));
    env.insert("ANTHROPIC_DEFAULT_SONNET_MODEL".into(), serde_json::json!(model));
    env.insert("ANTHROPIC_DEFAULT_OPUS_MODEL".into(), serde_json::json!(model));

    let settings = serde_json::json!({ "env": env });
    let dir = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(CONFIG_DIR)
        .join("scripts");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join(format!("settings-{}.json", ts));
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(path)
}

fn write_launch_script(
    base_url: &str,
    api_key: &str,
    auth_type: &str,
    model: &str,
    banner: &str,
) -> Result<PathBuf, String> {
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();

    let dir = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(CONFIG_DIR)
        .join("scripts");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let provider_settings = write_provider_settings(base_url, api_key, auth_type, model, ts)?;
    let settings_str = provider_settings.to_string_lossy().to_string();
    let real_home_str = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .to_string_lossy()
        .to_string();

    let path = dir.join(format!("launch-{}.sh", ts));
    let content = format!(
        "#!/bin/bash\n\
         echo '{}'\n\
         cd '{}'\n\
         claude --settings '{}'\n\
         status=$?\n\
         rm -f '{}'\n\
         exit $status\n",
        banner.replace('\'', "'\\''"),
        real_home_str.replace('\'', "'\\''"),
        settings_str.replace('\'', "'\\''"),
        settings_str.replace('\'', "'\\''"),
    );
    fs::write(&path, content).map_err(|e| e.to_string())?;
    fs::set_permissions(&path, fs::Permissions::from_mode(0o755))
        .map_err(|e| e.to_string())?;
    Ok(path)
}

// ── Tauri Commands ──

#[command]
fn load_providers() -> Result<Vec<Provider>, String> {
    let path = config_dir().join(PROVIDERS_FILE);
    if !path.exists() {
        return Ok(vec![]);
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: Config = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config.providers)
}

#[command]
fn save_providers(providers: Vec<Provider>) -> Result<(), String> {
    ensure_config_dir()?;
    let path = config_dir().join(PROVIDERS_FILE);
    let config = Config { providers };
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[command]
fn load_settings() -> Result<Settings, String> {
    let path = config_dir().join(SETTINGS_FILE);
    if !path.exists() {
        return Ok(Settings::default());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[command]
fn save_settings(settings: Settings) -> Result<(), String> {
    ensure_config_dir()?;
    let path = config_dir().join(SETTINGS_FILE);
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[command]
fn launch_terminal(
    terminal: String,
    name: String,
    base_url: String,
    api_key: String,
    auth_type: String,
    model: String,
) -> Result<(), String> {
    let banner = format!("\u{1F680} {} | {}", name, model);

    if terminal == "ghostty" {
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let provider_settings = write_provider_settings(&base_url, &api_key, &auth_type, &model, ts)?;
        let settings_str = provider_settings.to_string_lossy().to_string();
        let real_home_str = dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .to_string_lossy()
            .to_string();

        let cmd = format!(
            "cd '{}' && claude --settings '{}'; rm -f '{}'",
            real_home_str.replace('\'', "'\\''"),
            settings_str.replace('\'', "'\\''"),
            settings_str.replace('\'', "'\\''")
        );
        return launch_ghostty(&cmd);
    }

    let script = write_launch_script(&base_url, &api_key, &auth_type, &model, &banner)?;
    let script_str = script.to_string_lossy().to_string();

    match terminal.as_str() {
        "iterm" => launch_iterm(&script_str),
        "warp" => launch_warp(&script_str),
        "alacritty" => launch_alacritty(&script_str),
        "kitty" => launch_kitty(&script_str),
        _ => launch_macos_terminal(&script_str),
    }
}

// ── Terminal Launchers ──

fn launch_ghostty(cmd: &str) -> Result<(), String> {
    let candidates = [
        "ghostty",
        "/Applications/Ghostty.app/Contents/MacOS/ghostty",
    ];
    for bin in &candidates {
        let result = std::process::Command::new(bin)
            .args(["-e", "bash", "-c", cmd])
            .spawn();
        if result.is_ok() {
            return Ok(());
        }
    }
    Err("Ghostty not found. Install Ghostty or add it to PATH.".to_string())
}

fn launch_iterm(script: &str) -> Result<(), String> {
    let escaped = script.replace('\\', "\\\\").replace('"', "\\\"");
    let apple = format!(
        "tell application \"iTerm\"\nactivate\ncreate window with default profile\n\
         tell current session of current window\nwrite text \"bash '{}'\"\nend tell\nend tell",
        escaped
    );
    run_osascript(&apple)
}

fn launch_macos_terminal(script: &str) -> Result<(), String> {
    let escaped = script.replace('\\', "\\\\").replace('"', "\\\"");
    let apple = format!(
        "tell application \"Terminal\"\nactivate\ndo script \"bash '{}'\"\nend tell",
        escaped
    );
    run_osascript(&apple)
}

fn launch_warp(script: &str) -> Result<(), String> {
    let candidates = [
        "warp",
        "/Applications/Warp.app/Contents/MacOS/stable",
    ];
    for bin in &candidates {
        let result = std::process::Command::new(bin)
            .args(["--", "bash", script])
            .spawn();
        if result.is_ok() {
            return Ok(());
        }
    }
    std::process::Command::new("open")
        .args(["-na", "Warp"])
        .spawn()
        .map_err(|e| format!("Failed to open Warp: {}", e))?;
    let escaped = script.replace('\\', "\\\\").replace('"', "\\\"").replace('\'', "\\'");
    let apple = format!(
        "delay 0.8\ntell application \"System Events\"\nkeystroke \"bash {}\"\nkeystroke return\nend tell",
        escaped
    );
    run_osascript(&apple)
}

fn launch_alacritty(script: &str) -> Result<(), String> {
    let candidates = [
        "alacritty",
        "/Applications/Alacritty.app/Contents/MacOS/alacritty",
    ];
    for bin in &candidates {
        let result = std::process::Command::new(bin)
            .args(["-e", "bash", script])
            .spawn();
        if result.is_ok() {
            return Ok(());
        }
    }
    Err("Alacritty not found.".to_string())
}

fn launch_kitty(script: &str) -> Result<(), String> {
    std::process::Command::new("kitty")
        .args(["bash", script])
        .spawn()
        .map_err(|e| format!("Failed to launch kitty: {}", e))?;
    Ok(())
}

fn run_osascript(script: &str) -> Result<(), String> {
    std::process::Command::new("osascript")
        .arg("-e")
        .arg(script)
        .spawn()
        .map_err(|e| format!("Failed to run osascript: {}", e))?;
    Ok(())
}

// ── CC Switch Import ──

#[command]
fn import_from_cc_switch() -> Result<Vec<Provider>, String> {
    let db_path = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".cc-switch")
        .join("cc-switch.db");

    if !db_path.exists() {
        return Err("CC Switch database not found. Install CC Switch and add providers first.".to_string());
    }

    let conn = rusqlite::Connection::open(&db_path)
        .map_err(|e| format!("Failed to open CC Switch DB: {}", e))?;

    let mut stmt = conn
        .prepare(
            "SELECT id, name, settings_config, notes FROM providers WHERE app_type = 'claude' ORDER BY sort_index"
        )
        .map_err(|e| format!("Query failed: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let config_str: String = row.get(2)?;
            let notes: Option<String> = row.get(3)?;
            Ok((id, name, config_str, notes))
        })
        .map_err(|e| format!("Query failed: {}", e))?;

    let mut providers = Vec::new();
    for row in rows {
        let (id, name, config_str, notes) = row.map_err(|e| format!("Row error: {}", e))?;
        let config: serde_json::Value = serde_json::from_str(&config_str).unwrap_or(serde_json::Value::Null);

        let env = config.get("env").and_then(|v| v.as_object());
        let base_url = env
            .and_then(|e| e.get("ANTHROPIC_BASE_URL"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let model = env
            .and_then(|e| e.get("ANTHROPIC_MODEL"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let (api_key, auth_type) = if let Some(key) = env.and_then(|e| e.get("ANTHROPIC_API_KEY")).and_then(|v| v.as_str()) {
            (key.to_string(), "api_key".to_string())
        } else if let Some(key) = env.and_then(|e| e.get("ANTHROPIC_AUTH_TOKEN")).and_then(|v| v.as_str()) {
            (key.to_string(), "auth_token".to_string())
        } else {
            ("".to_string(), "auth_token".to_string())
        };

        providers.push(Provider {
            id,
            name,
            base_url,
            api_key,
            auth_type,
            model,
            note: notes.unwrap_or_default(),
        });
    }

    Ok(providers)
}

// ── Import/Export ──

#[command]
fn export_config(providers: Vec<Provider>) -> Result<String, String> {
    let exported: Vec<Provider> = providers
        .into_iter()
        .map(|mut p| {
            p.api_key = "".to_string();
            p
        })
        .collect();
    serde_json::to_string_pretty(&Config { providers: exported }).map_err(|e| e.to_string())
}

#[command]
fn import_config(json: String) -> Result<Vec<Provider>, String> {
    let config: Config = serde_json::from_str(&json).map_err(|e| format!("Invalid JSON: {}", e))?;
    Ok(config.providers)
}

// ── Main ──

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_providers,
            save_providers,
            launch_terminal,
            load_settings,
            save_settings,
            export_config,
            import_config,
            import_from_cc_switch,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
