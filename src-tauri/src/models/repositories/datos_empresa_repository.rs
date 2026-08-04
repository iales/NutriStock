use thiserror::Error;
use crate::models::entities::datos_empresa::DatosEmpresa;

pub trait DatosEmpresaRepository {
    fn guardar(&self, datos: DatosEmpresa) -> impl std::future::Future<Output = Result<DatosEmpresa, DatosEmpresaRepositoryError>> + Send;
    fn obtener(&self) -> impl std::future::Future<Output = Result<Option<DatosEmpresa>, DatosEmpresaRepositoryError>> + Send;
}

#[derive(Debug, Error)]
pub enum DatosEmpresaRepositoryError {
    #[error(transparent)]
    DataBase(#[from] sqlx::Error),
}
