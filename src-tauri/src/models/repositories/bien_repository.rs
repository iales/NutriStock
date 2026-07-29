use thiserror::Error;
use crate::models::entities::bien::Bien;

pub trait  BienRepository{
    fn crear(&self, bien: Bien) -> impl std::future::Future<Output = Result<Bien,BienRepositoryError>> + Send;
    fn listar_bienes(&self) -> impl std::future::Future<Output = Result<Vec<Bien>, BienRepositoryError>> + Send;
    fn ajustar_stock(&self, bien_id: i64, delta: i32) -> impl std::future::Future<Output = Result<Option<Bien>, BienRepositoryError>> + Send;
    fn setear_stock(&self, bien_id: i64, value: u32) -> impl std::future::Future<Output = Result<Option<Bien>, BienRepositoryError>> + Send;
    fn find_by_id(&self, bien_id: i64) -> impl std::future::Future<Output = Result<Option<Bien>, BienRepositoryError>> + Send;
    fn delete(&self, bien_id: i64) -> impl std::future::Future<Output = Result<bool, BienRepositoryError>> + Send;
    fn actualizar_bien(&self, bien_id: i64, descripcion: String, precio_centavos: u64, stock_actual: u32) -> impl std::future::Future<Output = Result<Option<Bien>, BienRepositoryError>> + Send;
}

#[derive(Debug,Error)]
pub enum BienRepositoryError{
    #[error(transparent)]
    DataBase(#[from] sqlx::Error),
}