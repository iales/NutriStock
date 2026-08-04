use std::future::Future;
use crate::models::entities::autorizacion_remito::AutorizacionRemito;
use thiserror::Error;

pub trait AutorizacionRemitoRepository {
    fn crear(&self, autorizacion: AutorizacionRemito) -> impl Future<Output = Result<AutorizacionRemito, AutorizacionRemitoRepositoryError>> + Send;
    fn find_ultima(&self) -> impl Future<Output = Result<Option<AutorizacionRemito>, AutorizacionRemitoRepositoryError>> + Send;
    fn listar(&self) -> impl Future<Output = Result<Vec<AutorizacionRemito>, AutorizacionRemitoRepositoryError>> + Send;
}

#[derive(Debug,Error)]
pub enum AutorizacionRemitoRepositoryError{
    #[error(transparent)]
    DataBase(#[from] sqlx::Error)
}