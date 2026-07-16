use crate::models::entities::auth::User;
use thiserror::Error; 

pub trait UserRepository {
    fn get_user(&self) -> Result<User, UserRepositoryError>;
}

#[derive(Debug,Error)]
pub enum UserRepositoryError{
    #[error("no se encontro la variable de entrono: {0}")]
    MissingEnvVar(String),
}
