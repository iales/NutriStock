use thiserror::Error;
use crate::models::repositories::autorizacion_remito_repository::AutorizacionRemitoRepositoryError;
use crate::models::repositories::entrega_repository::EntregaRepositoryError;
use crate::models::entities::autorizacion_remito::{AutorizacionRemito, AutorizacionRemitoCreateRequest, SugerenciaRemito};
use std::future::Future;

#[derive(Debug, Error)]
pub enum AutorizacionRemitoServiceError {
    #[error(transparent)]
    AutorizacionRemitoRepository(#[from] AutorizacionRemitoRepositoryError),

    #[error(transparent)]
    EntregaRepository(#[from] EntregaRepositoryError),

    #[error("el rango de numeración no es válido")]
    RangoInvalido,
}

pub trait  AutorizacionRemitoService{
    fn crear(&self, autorizacion: AutorizacionRemitoCreateRequest) -> impl Future<Output = Result<AutorizacionRemito, AutorizacionRemitoServiceError>> + Send;
    fn find_ultima(&self) -> impl Future<Output = Result<Option<AutorizacionRemito>, AutorizacionRemitoServiceError>> + Send;
    fn listar(&self) -> impl Future<Output = Result<Vec<AutorizacionRemito>, AutorizacionRemitoServiceError>> + Send;
    fn sugerir_numero_remito(&self) -> impl Future<Output = Result<SugerenciaRemito, AutorizacionRemitoServiceError>> + Send;
}