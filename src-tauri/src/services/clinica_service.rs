use crate::models::entities::clinica::{Clinica, ClinicaCreateRequest, ClinicaUpdateRequest};
use thiserror::Error; 
use crate::models::repositories::clinica_repository::ClinicaRepositoryError;


#[derive(Debug, Error)]
pub enum ClinicaServiceError{
    #[error(transparent)]
    ClinicaRepository(#[from] ClinicaRepositoryError),

    #[error("Cuit con formato invalido")]
    InvalidFormatCuit,

    #[error("Cuit Invalido")]
    InvalidCuit,

    #[error("Cuit Duplicado, ya existe")]
    DuplicateCuit,

    #[error("Faltan completar Campos")]
    VoidField,

    #[error("no existe una clinica con id {0}")]
    ClinicaNotFound(i64),
}

pub trait ClinicaService{
    fn registrar_nueva_clinica(&self, request: ClinicaCreateRequest) -> impl std::future::Future<Output = Result<Clinica,ClinicaServiceError>> + Send;
    fn listar_clinicas(&self) -> impl std::future::Future<Output = Result<Vec<Clinica>, ClinicaServiceError>> + Send;
    fn find_by_id(&self, clinica_id: i64) -> impl std::future::Future<Output = Result<Option<Clinica>,ClinicaServiceError>> + Send;
    fn update_clinica(&self, clinica_id: i64, request: ClinicaUpdateRequest) -> impl std::future::Future<Output = Result<Option<Clinica>, ClinicaServiceError>> + Send;
}