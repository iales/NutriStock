use crate::models::repositories::implementations::user_repository_impl::UserRepositoryImpl;
use crate::services::implementations::service_login_lmpl::ServiceLoginImpl;
use crate::models::entities::auth::{LoginRequest, LoginResponse};
use crate::errors::AppError;

#[tauri::command] // <--  Logica protocolo IPC
pub fn login_command(request: LoginRequest)
 -> Result<LoginResponse,AppError>{
        let repo = UserRepositoryImpl::new();
        let service = ServiceLoginImpl::new(repo);
        
        Ok(service.login(request.username ,request.password)?)
}