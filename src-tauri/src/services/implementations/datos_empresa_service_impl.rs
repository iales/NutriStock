use crate::models::repositories::datos_empresa_repository::DatosEmpresaRepository;
use crate::models::entities::datos_empresa::{DatosEmpresa, DatosEmpresaCreateRequest};
use crate::services::datos_empresa_service::{DatosEmpresaService, DatosEmpresaServiceError};

pub struct DatosEmpresaServiceImpl<R: DatosEmpresaRepository> {
    repo: R,
}

impl<R: DatosEmpresaRepository> DatosEmpresaServiceImpl<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }
}

impl<R: DatosEmpresaRepository + Sync> DatosEmpresaService for DatosEmpresaServiceImpl<R> {
    async fn guardar(&self, request: DatosEmpresaCreateRequest) -> Result<DatosEmpresa, DatosEmpresaServiceError> {
        if request.razon_social.is_empty() || request.cuit.is_empty() || request.domicilio.is_empty() {
            return Err(DatosEmpresaServiceError::VoidField);
        }

        let datos = DatosEmpresa {
            razon_social: request.razon_social,
            subtitulo: request.subtitulo,
            cuit: request.cuit,
            domicilio: request.domicilio,
            email: request.email,
            condicion_iva: request.condicion_iva,
            ingresos_brutos: request.ingresos_brutos,
            inicio_actividades: request.inicio_actividades,
        };

        Ok(self.repo.guardar(datos).await?)
    }

    async fn obtener(&self) -> Result<Option<DatosEmpresa>, DatosEmpresaServiceError> {
        Ok(self.repo.obtener().await?)
    }
}
