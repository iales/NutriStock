use crate::errors::AppError;
use crate::models::entities::clinica::{Clinica, ClinicaCreateRequest, ClinicaUpdateRequest};
use crate ::models::repositories::implementations::clinica_repository_impl::ClinicaRepositoryImpl;
use crate::services::clinica_service::ClinicaService;
use crate::services::implementations::clinica_service_impl::ClinicaServiceImpl;

#[tauri::command]
async fn find_clinica_by_id(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    id: i64,
) -> Result<Option<Clinica>, AppError>{
    Ok(clinica_service(pool.inner()).find_by_id(id).await?)
}


fn clinica_service(pool: &sqlx::SqlitePool) -> impl ClinicaService{
    let repo = ClinicaRepositoryImpl::new(pool.clone());

    return ClinicaServiceImpl::new(repo)
}