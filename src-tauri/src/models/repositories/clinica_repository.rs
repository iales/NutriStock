use thiserror::Error;
use crate::models::entities::clinica::{Clinica, ClinicaUpdateRequest};

pub trait ClinicaRepository{
    fn create(&self, clinica: Clinica) -> impl std::future::Future<Output = Result<Clinica,ClinicaRepositoryError>> + Send;
    fn find_all(&self) -> impl std::future::Future<Output = Result<Vec<Clinica>, ClinicaRepositoryError>> + Send;
    fn find_by_id(&self, clinica_id: i64) -> impl std::future::Future<Output = Result<Option<Clinica>,ClinicaRepositoryError>> + Send;
    fn update(&self, clinica_id: i64, request: ClinicaUpdateRequest) -> impl std::future::Future<Output = Result<Option<Clinica>,ClinicaRepositoryError>> + Send;
    fn delete(&self, clinica_id: i64) -> impl std::future::Future<Output = Result<bool, ClinicaRepositoryError>> + Send;
}

#[derive(Debug,Error)]
pub enum ClinicaRepositoryError{
    #[error(transparent)]
    DataBase(#[from] sqlx::Error),

    #[error("no se puede eliminar: la clínica tiene entregas registradas")]
    TieneEntregas,
}