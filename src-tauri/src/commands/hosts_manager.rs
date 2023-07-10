use crate::state::OSResponse;
use crate::utils::{to_failure, to_success};
use std::os::unix::fs::PermissionsExt;
use std::process::{Command, Stdio};
use std::{fs, fs::OpenOptions, io::Write};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
pub fn read_hosts(file_path: &str) -> OSResponse<String> {
    match fs::read_to_string(file_path) {
        Ok(data) => to_success(data),
        Err(_) => to_failure(format!("Failed to read {}!", file_path)),
    }
}

#[tauri::command]
pub fn write_hosts(file_path: &str, content: &str) -> OSResponse<String> {
    match OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(file_path)
    {
        Ok(mut file) => match file.write_all(content.as_bytes()) {
            Ok(_) => to_success(String::new()),
            Err(_) => to_failure(format!("Failed to write data to {}!", file_path)),
        },
        Err(_) => to_failure(format!("Failed to open {}!", file_path)),
    }
}

#[tauri::command]
#[cfg(not(unix))]
pub fn is_file_readonly(file_path: &str) -> OSResponse<bool> {
    match fs::metadata(file_path) {
        Ok(md) => to_success(md.permissions().readonly()),
        Err(_) => to_failure(format!("Failed to find {}!", file_path)),
    }
}

#[tauri::command]
#[cfg(unix)]
pub fn is_file_readonly(file_path: &str) -> OSResponse<bool> {
    match fs::metadata(file_path) {
        Ok(md) => {
            // https://doc.rust-lang.org/std/fs/struct.Permissions.html#unix-including-macos
            let permission = md.permissions();
            let mode = permission.mode(); // 此处是10进制表示，转二进制吼再取从右往左第八位是当前用户的写权限
            let is_write = mode & 256 == 256; // 256是2进制8位，取and得是否是1

            to_success(is_write)
        }
        Err(_) => to_failure(format!("Failed to find {}!", file_path)),
    }
}

#[tauri::command]
pub fn change_file_writable(file_path: &str, password: &str, is_windows: bool) -> OSResponse<bool> {
    match is_windows {
        true => to_failure(format!("Windows is not supported right now!")),
        false => match Command::new("sudo")
            .stdin(Stdio::piped())
            .args(["-S", "chmod", "ugo+rw", file_path])
            .spawn()
        {
            Ok(mut child) => {
                child
                    .stdin
                    .as_ref()
                    .unwrap()
                    .write(password.as_bytes())
                    .unwrap();

                match child.wait() {
                    Ok(es) => match es.success() {
                        true => to_success(true),
                        false => to_failure(format!("Password might be incorrect!")),
                    },
                    Err(_) => to_failure(format!("Failed to using password!")),
                }
            }
            Err(_) => to_failure(format!("Failed to change permission {}!", file_path)),
        },
    }
}
