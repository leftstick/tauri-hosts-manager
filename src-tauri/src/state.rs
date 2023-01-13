use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct OSResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: String,
}
