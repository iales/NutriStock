use crate::models::{entities::bien::{Bien, BienDescripcionRequest ,BienCreateRequest,BienUpdateRequest, BienSetRequest}, repositories::bien_repository::BienRepositoryError};
use thiserror::Error;

pub trait BienService{
    fn crear_bien(&self, bien_request: BienCreateRequest) -> impl std::future::Future<Output = Result<Bien, BienServiceError>> + Send;
    fn listar_bienes(&self) -> impl std::future::Future<Output = Result<Vec<Bien>, BienServiceError>> + Send;
    fn ajustar_stock(&self, update_request: BienUpdateRequest) -> impl std::future::Future<Output = Result<Bien, BienServiceError>> + Send;
    fn setear_stock(&self,update_request: BienSetRequest) -> impl std::future::Future<Output = Result<Bien,BienServiceError>> + Send;
    fn find_by_id(&self, id: i64) -> impl std::future::Future<Output = Result<Option<Bien>,BienServiceError>> + Send;
    fn delete(&self, id: i64) -> impl std::future::Future<Output = Result<(),BienServiceError>> + Send;
    fn setear_descripcion(&self, request: BienDescripcionRequest) -> impl std::future::Future<Output = Result<Bien,BienServiceError>> + Send;
}

#[derive(Debug, Error)]
pub enum BienServiceError{
    #[error(transparent)]
    BienRepository(#[from] BienRepositoryError),

    #[error("el peso no puede ser negativo")]
    InvalidWeight,

    #[error("Falta Stock para {0}")]
    InsufficientStock(String),

    #[error("no existe un bien con id {0}")]
    NotFoundBien(i64),
}