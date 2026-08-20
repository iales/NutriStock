use thiserror::Error;
use crate::services::clinica_service::ClinicaServiceError;
use crate::services::bien_service::BienServiceError;
use crate::services::lote_bien_service::LoteBienServiceError;
use crate::services::entrega_service::EntregaServiceError;
use crate::services::autorizacion_remito_service::AutorizacionRemitoServiceError;
use crate::services::datos_empresa_service::DatosEmpresaServiceError;

#[derive(Debug, Error)]
pub enum AppError{
    #[error(transparent)]
    Bien(#[from] BienServiceError),

    #[error(transparent)]
    LoteBien(#[from] LoteBienServiceError),

    #[error(transparent)]
    Clinica(#[from] ClinicaServiceError),

    #[error(transparent)]
    Entrega(#[from] EntregaServiceError),

    #[error(transparent)]
    AutorizacionRemito(#[from] AutorizacionRemitoServiceError),

    #[error(transparent)]
    DatosEmpresa(#[from] DatosEmpresaServiceError)
}

impl AppError {
    fn tipo(&self) -> &'static str {
        match self {
            AppError::Bien(err) => match err {
                BienServiceError::BienRepository(_) => "BienRepositorio",
                BienServiceError::InvalidWeight => "PesoInvalido",
                BienServiceError::InsufficientStock(_) => "StockInsuficiente",
                BienServiceError::NotFoundBien(_) => "BienNoEncontrado",
                BienServiceError::LoteBienRepository(_) => "LoteBienRepositorio",
            },
            AppError::LoteBien(err) => match err {
                LoteBienServiceError::LoteBienRepository(_) => "LoteBienRepositorio",
                LoteBienServiceError::BienService(_) => "BienService",
                LoteBienServiceError::InvalidCantidad => "CantidadInvalida",
                LoteBienServiceError::NotFoundBien(_) => "BienNoEncontrado",
            },
            AppError::Clinica(err) => match err{
                ClinicaServiceError::ClinicaRepository(_) => "ClinicaRepository",
                ClinicaServiceError::InvalidFormatCuit => "Formato Invalido",
                ClinicaServiceError::InvalidCuit => "Cuit Invalido",
                ClinicaServiceError::DuplicateCuit => "Cuit ya existente",
                ClinicaServiceError::VoidField => "Existen campos vacios",
                ClinicaServiceError::ClinicaNotFound(_) => "ClinicaNoEncontrada",

            },
            AppError::Entrega(err) => match err {
                EntregaServiceError::Repository(_) => "EntregaRepository",
                EntregaServiceError::BienServiceError(_) => "BienService",
                EntregaServiceError::EntregaNotFound(_) => "EntregaNoEncontrada",
                EntregaServiceError::ClinicaServiceError(_) => "ClinicaService",
                EntregaServiceError::RemitoIncompleto => "EntregaService",
                EntregaServiceError::SinItems => "EntregaService",
                EntregaServiceError::RemitoInvalido => "EntregaService",
            },
            AppError::AutorizacionRemito(err) => match err {
                AutorizacionRemitoServiceError::AutorizacionRemitoRepository(_) => "AutorizacionRemitoRepository",
                AutorizacionRemitoServiceError::EntregaRepository(_) => "EntregaRepository",
                AutorizacionRemitoServiceError::RangoInvalido => "RangoInvalido",
            },
            AppError::DatosEmpresa(err) => match err {
                DatosEmpresaServiceError::DatosEmpresaRepository(_) => "DatosEmpresaRepository",
                DatosEmpresaServiceError::VoidField => "CamposVacios",
            }

        }
    }
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut estado = serializer.serialize_struct("AppError", 2)?;
        estado.serialize_field("tipo", self.tipo())?;
        estado.serialize_field("mensaje", &self.to_string())?;
        estado.end()
    }
}

