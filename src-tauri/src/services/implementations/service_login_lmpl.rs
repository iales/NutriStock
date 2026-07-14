use crate::models::entities::auth::LoginResponse;
use crate::models::repositories::user_repository::UserRepository;


pub struct ServiceLoginImpl<R: UserRepository>{
    repo: R
}

impl <R: UserRepository> ServiceLoginImpl<R>{

    pub fn new(repo: R) -> Self{
        Self{repo}
    }

    pub fn login(&self, username: String, password: String) -> LoginResponse{
        let admin_user = self.repo.get_user();
        return LoginResponse::new(username == admin_user.username && password == admin_user.password);
    } 
}


