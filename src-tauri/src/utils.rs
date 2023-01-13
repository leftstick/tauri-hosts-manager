use crate::state::OSResponse;

pub fn to_success<T>(data: T) -> OSResponse<T> {
    OSResponse {
        success: true,
        data: Some(data),
        message: String::new(),
    }
}

pub fn to_failure<T>(message: String) -> OSResponse<T> {
    OSResponse {
        success: false,
        data: None,
        message,
    }
}
