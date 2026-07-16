use crate::models::entities::auth::User;
use crate::models::repositories::user_repository::{UserRepository,UserRepositoryError};
pub struct UserRepositoryImpl;


impl UserRepositoryImpl{
    pub fn new() -> Self{
        Self{}
    }
    
}

impl UserRepository for UserRepositoryImpl {
    fn get_user(&self) -> Result<User,UserRepositoryError> {
        let username = std::env::var("ADMIN_USER")
        .map_err(|_| UserRepositoryError::MissingEnvVar("ADMIN_USER".to_string()))?;
        let password = std::env::var("ADMIN_PASS")
        .map_err(|_| UserRepositoryError::MissingEnvVar("ADMIN_PASS".to_string()))?;
        
        Ok(User::new(username, password))
    }
}