use thiserror::Error;
use crate::services::service_login::LoginServiceError;

#[derive(Debug, Error)]
pub enum AppError{
    #[error(transparent)]
    Login(#[from] LoginServiceError),
}   

impl serde::Serialize for AppError{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::Serializer,
        { serializer.serialize_str(&self.to_string()) }
}