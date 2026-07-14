use crate::models::entities::auth::User;

pub trait UserRepository {
    fn get_user(&self) -> User;
}