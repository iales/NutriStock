use crate::errors::AppError;
use crate::models::entities::autorizacion_remito::{AutorizacionRemito, AutorizacionRemitoCreateRequest, SugerenciaRemito};
use crate::models::repositories::implementations::autorizacion_remito_repository_impl::AutorizacionRemitoRepositoryImpl;
use crate::models::repositories::implementations::entrega_repository_impl::EntregaRepositoryImpl;
use crate::services::autorizacion_remito_service::AutorizacionRemitoService;
use crate::services::implementations::autorizacion_remito_service_impl::AutorizacionRemitoServiceImpl;

#[tauri::command]
pub async fn registrar_autorizacion_remito_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: AutorizacionRemitoCreateRequest,
) -> Result<AutorizacionRemito, AppError> {
    Ok(autorizacion_remito_service(pool.inner()).crear(request).await?)
}

#[tauri::command]
pub async fn listar_autorizaciones_remito_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
) -> Result<Vec<AutorizacionRemito>, AppError> {
    Ok(autorizacion_remito_service(pool.inner()).listar().await?)
}

#[tauri::command]
pub async fn sugerir_numero_remito_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
) -> Result<SugerenciaRemito, AppError> {
    Ok(autorizacion_remito_service(pool.inner()).sugerir_numero_remito().await?)
}

fn autorizacion_remito_service(pool: &sqlx::SqlitePool) -> impl AutorizacionRemitoService {
    let autorizacion_repo = AutorizacionRemitoRepositoryImpl::new(pool.clone());
    let entrega_repo = EntregaRepositoryImpl::new(pool.clone());
    AutorizacionRemitoServiceImpl::new(autorizacion_repo, entrega_repo)
}
