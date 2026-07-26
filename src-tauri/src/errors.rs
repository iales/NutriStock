use thiserror::Error;
use crate::services::clinica_service::ClinicaServiceError;
use crate::services::service_login::LoginServiceError;
use crate::services::bien_service::BienServiceError;
use crate::services::entrega_service::EntregaServiceError;

#[derive(Debug, Error)]
pub enum AppError{
    #[error(transparent)]
    Login(#[from] LoginServiceError),

    #[error(transparent)]
    Bien(#[from] BienServiceError),

    #[error(transparent)]
    Clinica(#[from] ClinicaServiceError),

    #[error(transparent)]
    Entrega(#[from] EntregaServiceError)
}

impl AppError {
    fn tipo(&self) -> &'static str {
        match self {
            AppError::Login(_) => "Login",
            AppError::Bien(err) => match err {
                BienServiceError::BienRepository(_) => "BienRepositorio",
                BienServiceError::InvalidWeight => "PesoInvalido",
                BienServiceError::InsufficientStock(_) => "StockInsuficiente",
                BienServiceError::NotFoundBien(_) => "BienNoEncontrado",
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

