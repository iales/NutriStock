use thiserror::Error;
use crate::models::entities::entrega::Entrega;
use std::future::Future;

#[derive(Debug,Error)]
pub enum EntregaRepositoryError {
    #[error(transparent)]
    DataBase(#[from] sqlx::Error),

    #[error("No hay suficiente stock de \"{0}\" en depósito")]
    StockInsuficiente(String),
}

pub trait EntregaRepository {
    fn crear(&self, entrega: Entrega) -> impl Future<Output = Result<Entrega, EntregaRepositoryError>> + Send;
    fn find_by_id(&self, entrega_id: i64) -> impl Future<Output = Result<Option<Entrega>, EntregaRepositoryError>> + Send;
    fn listar_entregas(&self) -> impl Future<Output = Result<Vec<Entrega>, EntregaRepositoryError>> + Send;
    fn max_remito_numero(&self, punto_venta: i64, numero_desde: i64, numero_hasta: i64) -> impl Future<Output = Result<Option<i64>, EntregaRepositoryError>> + Send;

}