use thiserror::Error;
use crate::models::entities::lote_bien::{LoteBien, LoteBienCreateRequest};
use crate::models::repositories::lote_bien_repository::LoteBienRepositoryError;
use crate::services::bien_service::BienServiceError;

pub trait LoteBienService {
    fn recibir_lote(&self, request: LoteBienCreateRequest) -> impl std::future::Future<Output = Result<LoteBien, LoteBienServiceError>> + Send;
    fn listar_por_bien(&self, bien_id: i64) -> impl std::future::Future<Output = Result<Vec<LoteBien>, LoteBienServiceError>> + Send;
}

#[derive(Debug, Error)]
pub enum LoteBienServiceError {
    #[error(transparent)]
    LoteBienRepository(#[from] LoteBienRepositoryError),

    #[error(transparent)]
    BienService(#[from] BienServiceError),

    #[error("la cantidad debe ser mayor a cero")]
    InvalidCantidad,

    #[error("no existe un bien con id {0}")]
    NotFoundBien(i64),
}
