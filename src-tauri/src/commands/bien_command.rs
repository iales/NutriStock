use crate::models::entities::bien::{Bien, BienCreateRequest, BienSetRequest, BienUpdateRequest};
use crate::errors::AppError;
use crate::models::repositories::implementations::bien_repository_impl::BienRepositoryImpl;
use crate::services::bien_service::BienService;
use crate::services::implementations::bien_service_impl::BienServiceImpl;

#[tauri::command]
pub async fn crear_bien_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: BienCreateRequest,
) -> Result<Bien, AppError> {
    Ok(bien_service(pool.inner()).crear_bien(request).await?)
}

#[tauri::command]
pub async fn listar_bienes_command(
    pool: tauri::State<'_, sqlx::SqlitePool>) 
    -> Result<Vec<Bien>, AppError> {

    Ok(bien_service(pool.inner()).listar_bienes().await?)
}


#[tauri::command]
pub async fn ajustar_stock_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: BienUpdateRequest
    ) -> Result<Bien, AppError> { 
       Ok(bien_service(pool.inner()).ajustar_stock(request).await?)
}

#[tauri::command]
pub async fn setear_bien_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: BienSetRequest
    ) -> Result<Bien, AppError> { 
       Ok(bien_service(pool.inner()).setear_bien(request).await?)
}

fn bien_service(pool: &sqlx::SqlitePool) -> impl BienService {
    let repo = BienRepositoryImpl::new(pool.clone());
    BienServiceImpl::new(repo)
}
