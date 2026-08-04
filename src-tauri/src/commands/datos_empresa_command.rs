use crate::errors::AppError;
use crate::models::entities::datos_empresa::{DatosEmpresa, DatosEmpresaCreateRequest};
use crate::models::repositories::implementations::datos_empresa_repository_impl::DatosEmpresaRepositoryImpl;
use crate::services::datos_empresa_service::DatosEmpresaService;
use crate::services::implementations::datos_empresa_service_impl::DatosEmpresaServiceImpl;

#[tauri::command]
pub async fn guardar_datos_empresa_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: DatosEmpresaCreateRequest,
) -> Result<DatosEmpresa, AppError> {
    Ok(datos_empresa_service(pool.inner()).guardar(request).await?)
}

#[tauri::command]
pub async fn obtener_datos_empresa_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
) -> Result<Option<DatosEmpresa>, AppError> {
    Ok(datos_empresa_service(pool.inner()).obtener().await?)
}

fn datos_empresa_service(pool: &sqlx::SqlitePool) -> impl DatosEmpresaService {
    let repo = DatosEmpresaRepositoryImpl::new(pool.clone());
    DatosEmpresaServiceImpl::new(repo)
}
