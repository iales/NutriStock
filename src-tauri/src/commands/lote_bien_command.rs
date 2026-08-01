use crate::models::entities::lote_bien::{LoteBien, LoteBienCreateRequest};
use crate::errors::AppError;
use crate::models::repositories::implementations::bien_repository_impl::BienRepositoryImpl;
use crate::models::repositories::implementations::lote_bien_repository_impl::LoteBienRepositoryImpl;
use crate::services::implementations::bien_service_impl::BienServiceImpl;
use crate::services::implementations::lote_bien_service_impl::LoteBienServiceImpl;
use crate::services::lote_bien_service::LoteBienService;

#[tauri::command]
pub async fn recibir_lote_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    request: LoteBienCreateRequest,
) -> Result<LoteBien, AppError> {
    Ok(lote_bien_service(pool.inner()).recibir_lote(request).await?)
}

#[tauri::command]
pub async fn listar_lotes_por_bien_command(
    pool: tauri::State<'_, sqlx::SqlitePool>,
    bien_id: i64,
) -> Result<Vec<LoteBien>, AppError> {
    Ok(lote_bien_service(pool.inner()).listar_por_bien(bien_id).await?)
}

fn lote_bien_service(pool: &sqlx::SqlitePool) -> impl LoteBienService {
    let lote_repo = LoteBienRepositoryImpl::new(pool.clone());
    let bien_service = BienServiceImpl::new(
        BienRepositoryImpl::new(pool.clone()),
        LoteBienRepositoryImpl::new(pool.clone()),
    );
    LoteBienServiceImpl::new(lote_repo, bien_service)
}
