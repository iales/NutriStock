use crate::models::entities::clinica::CondicionIva;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct DatosEmpresa {
    pub razon_social: String,
    pub subtitulo: Option<String>,
    pub cuit: String,
    pub domicilio: String,
    pub email: Option<String>,
    pub condicion_iva: CondicionIva,
    pub ingresos_brutos: Option<String>,
    pub inicio_actividades: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub struct DatosEmpresaCreateRequest {
    pub razon_social: String,
    pub subtitulo: Option<String>,
    pub cuit: String,
    pub domicilio: String,
    pub email: Option<String>,
    pub condicion_iva: CondicionIva,
    pub ingresos_brutos: Option<String>,
    pub inicio_actividades: Option<String>,
}
