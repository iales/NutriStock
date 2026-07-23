use crate::models::{entities::auth::{LoginRequest, LoginResponse}, 
repositories::user_repository::UserRepositoryError};
use thiserror::Error; 

pub trait ServiceLogin{
    fn login(request: LoginRequest ) -> Result<LoginResponse,LoginServiceError>;
}

#[derive(Debug,Error)]
pub enum LoginServiceError{
    #[error(transparent)]
    Repository(#[from] UserRepositoryError),
}