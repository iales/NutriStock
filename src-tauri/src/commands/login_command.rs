use crate::models::repositories::implementations::user_repository_impl::UserRepositoryImpl;
use crate::services::implementations::service_login_lmpl::ServiceLoginImpl;
use crate::models::entities::auth::{LoginRequest, LoginResponse};

#[tauri::command]
pub fn login_command(request: LoginRequest)
 -> LoginResponse{
    let repo = UserRepositoryImpl::new();
    let service = ServiceLoginImpl::new(repo);
    
    return service.login(request.username ,request.password);
}