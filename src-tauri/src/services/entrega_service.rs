use std::future::Future;
use thiserror::Error;
use crate::models::entities::entrega::{Entrega, EntregaCreateRequest};
use crate::models::repositories::entrega_repository::EntregaRepositoryError;
use crate::services::bien_service::BienServiceError;
use crate::services::clinica_service::ClinicaServiceError;

#[derive(Debug,Error)]
pub enum EntregaServiceError{
    #[error(transparent)]
    Repository(#[from] EntregaRepositoryError),

    #[error(transparent)]
    BienServiceError(#[from] BienServiceError),

    #[error("no existe una entrega con id {0}")]
    EntregaNotFound(i64),
    
    #[error(transparent)]
    ClinicaServiceError(#[from] ClinicaServiceError),

    #[error("Faltan datos para poder generar el remito")]
    RemitoIncompleto,

    #[error("la entrega necesita al menos un producto")]
    SinItems,

    #[error("el número de remito tiene que ser mayor a cero")]
    RemitoInvalido,
}

pub trait EntregaService{
    fn crear_entrega(&self, request: EntregaCreateRequest) -> impl Future<Output= Result<Entrega, EntregaServiceError>> + Send;
    fn find_by_id(&self, entrega_id: i64 ) -> impl Future<Output= Result<Entrega, EntregaServiceError>> + Send;
    fn listar_entregas(&self) -> impl Future<Output= Result<Vec<Entrega>, EntregaServiceError>> + Send;
}


