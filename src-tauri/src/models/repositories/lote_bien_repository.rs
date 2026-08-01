use thiserror::Error;
use crate::models::entities::lote_bien::LoteBien;

pub trait LoteBienRepository {
    fn crear(&self, lote: LoteBien) -> impl std::future::Future<Output = Result<LoteBien, LoteBienRepositoryError>> + Send;
    fn listar_por_bien(&self, bien_id: i64) -> impl std::future::Future<Output = Result<Vec<LoteBien>, LoteBienRepositoryError>> + Send;
    fn agregar_manual(&self, bien_id: i64, cantidad: u32) -> impl std::future::Future<Output = Result<LoteBien, LoteBienRepositoryError>> + Send;
    fn consumir(&self, bien_id: i64, cantidad: u32) -> impl std::future::Future<Output = Result<bool, LoteBienRepositoryError>> + Send;
}

#[derive(Debug, Error)]
pub enum LoteBienRepositoryError {
    #[error(transparent)]
    DataBase(#[from] sqlx::Error),
}
