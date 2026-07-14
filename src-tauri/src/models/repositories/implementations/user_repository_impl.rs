use crate::models::entities::auth::User;
use crate::models::repositories::user_repository::UserRepository;
pub struct UserRepositoryImpl;


impl UserRepositoryImpl{
    pub fn new() -> Self{
        Self{}
    }
    
}

impl UserRepository for UserRepositoryImpl {
    fn get_user(&self) -> User {
        let username = std::env::var("ADMIN_USER").unwrap_or_else(|_| "admin".to_string());
        let password = std::env::var("ADMIN_PASS").unwrap_or_else(|_| "1234".to_string());
        
        User::new(username, password)
    }
}