
use crate::errors::AppError;
use crate::models::entities::entrega::{Entrega, EntregaCreateRequest};
use crate::models::repositories::implementations::bien_repository_impl::BienRepositoryImpl;
use crate::models::repositories::implementations::clinica_repository_impl::ClinicaRepositoryImpl;
use crate::models::repositories::implementations::entrega_repository_impl::EntregaRepositoryImpl;
use crate::services::entrega_service::EntregaService;
use crate::services::implementations::bien_service_impl::BienServiceImpl;
use crate::services::implementations::clinica_service_impl::ClinicaServiceImpl;
use crate::services::implementations::entrega_service_impl::EntregaServiceImpl;

#[tauri::command]
pub async fn crear_entrega_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: EntregaCreateRequest,
) -> Result<Entrega, AppError> {
    Ok(entrega_service(pool.inner()).crear_entrega(request).await?)
}

#[tauri::command]
pub async fn find_entrega_by_id_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    id: i64,
) -> Result<Entrega, AppError> {
    Ok(entrega_service(pool.inner()).find_by_id(id).await?)
}

#[tauri::command]
pub async fn listar_entregas_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
) -> Result<Vec<Entrega>, AppError> {
    Ok(entrega_service(pool.inner()).listar_entregas().await?)
}

fn entrega_service(
    pool: &sqlx::SqlitePool,
) -> impl EntregaService {
    let entrega_repo = EntregaRepositoryImpl::new(pool.clone());
    let bien_service = BienServiceImpl::new(BienRepositoryImpl::new(pool.clone()));
    let clinica_service = ClinicaServiceImpl::new(ClinicaRepositoryImpl::new(pool.clone()));
    EntregaServiceImpl::new(entrega_repo, bien_service, clinica_service)
}
