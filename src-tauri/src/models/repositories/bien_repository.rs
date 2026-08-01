use thiserror::Error;
use crate::models::entities::bien::{Bien, CategoriaNutricional};

pub trait  BienRepository{
    fn crear(&self, bien: Bien) -> impl std::future::Future<Output = Result<Bien,BienRepositoryError>> + Send;
    fn listar_bienes(&self) -> impl std::future::Future<Output = Result<Vec<Bien>, BienRepositoryError>> + Send;
    fn find_by_id(&self, bien_id: i64) -> impl std::future::Future<Output = Result<Option<Bien>, BienRepositoryError>> + Send;
    fn delete(&self, bien_id: i64) -> impl std::future::Future<Output = Result<bool, BienRepositoryError>> + Send;
    fn actualizar_bien(&self, bien_id: i64, descripcion: String, precio_centavos: u64, categoria_nutricional: CategoriaNutricional) -> impl std::future::Future<Output = Result<Option<Bien>, BienRepositoryError>> + Send;
}

#[derive(Debug,Error)]
pub enum BienRepositoryError{
    #[error(transparent)]
    DataBase(#[from] sqlx::Error),

    #[error("no se puede eliminar: el producto todavía tiene stock")]
    TieneStock,

    #[error("no se puede eliminar: el producto tiene entregas registradas")]
    TieneEntregas,
}