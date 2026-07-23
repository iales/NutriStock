use crate::errors::AppError;
use crate::models::entities::clinica::{Clinica, ClinicaCreateRequest, ClinicaUpdateRequest};
use crate ::models::repositories::implementations::clinica_repository_impl::ClinicaRepositoryImpl;
use crate::services::clinica_service::ClinicaService;
use crate::services::implementations::clinica_service_impl::ClinicaServiceImpl;

#[tauri::command]
pub async fn find_clinica_by_id_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    id: i64,
) -> Result<Option<Clinica>, AppError>{
    Ok(clinica_service(pool.inner()).find_by_id(id).await?)
}

#[tauri::command]
pub async fn listar_clinicas_command(
    pool: tauri::State<'_, sqlx::SqlitePool>
) -> Result<Vec<Clinica>, AppError>{
    Ok(clinica_service(pool.inner()).listar_clinicas().await?)
}

#[tauri::command]
pub async fn registrar_nueva_clinica_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: ClinicaCreateRequest
) -> Result<Clinica, AppError> {
    Ok(clinica_service(pool.inner()).registrar_nueva_clinica(request).await?)
}

#[tauri::command]
pub async fn update_clinica_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    id: i64,
    request: ClinicaUpdateRequest
) -> Result<Option<Clinica>, AppError>{
    Ok(clinica_service(pool.inner()).update_clinica(id, request).await?)
}


fn clinica_service(pool: &sqlx::SqlitePool) -> impl ClinicaService{
    let repo = ClinicaRepositoryImpl::new(pool.clone());

    return ClinicaServiceImpl::new(repo)
}