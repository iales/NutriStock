use thiserror::Error;
use crate::models::entities::datos_empresa::{DatosEmpresa, DatosEmpresaCreateRequest};
use crate::models::repositories::datos_empresa_repository::DatosEmpresaRepositoryError;

#[derive(Debug, Error)]
pub enum DatosEmpresaServiceError {
    #[error(transparent)]
    DatosEmpresaRepository(#[from] DatosEmpresaRepositoryError),

    #[error("hay campos vacíos")]
    VoidField,
}

pub trait DatosEmpresaService {
    fn guardar(&self, request: DatosEmpresaCreateRequest) -> impl std::future::Future<Output = Result<DatosEmpresa, DatosEmpresaServiceError>> + Send;
    fn obtener(&self) -> impl std::future::Future<Output = Result<Option<DatosEmpresa>, DatosEmpresaServiceError>> + Send;
}
