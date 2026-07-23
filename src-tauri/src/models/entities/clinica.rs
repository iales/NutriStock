#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize, sqlx::Type)]
#[sqlx(type_name = "TEXT", rename_all = "snake_case")]
pub enum CondicionIva {
    ResponsableInscripto,
    Monotributo,
    Exento,
}

#[derive(Debug,Clone,serde::Serialize,serde::Deserialize,sqlx::FromRow)]
pub struct Clinica{
    pub id: Option<i64>,
    pub razon_social: String,
    pub direccion: String,
    pub localidad: String,
    pub cuit: String,
    pub condicion_iva: CondicionIva,
    pub contacto: Option<String>
}

impl Clinica{
    pub fn new(
        razon_social: String,
        direccion: String,
        localidad: String,
        cuit: String,
        condicion_iva: CondicionIva,
        contacto: Option<String>
    ) -> Self{
        Self {
            id: None,
            razon_social,
            direccion,
            localidad,
            cuit,
            condicion_iva,
            contacto
        }
    }
}


pub struct ClinicaCreateRequest{
    pub razon_social: String,
    pub direccion: String,
    pub localidad: String,
    pub cuit: String,
    pub condicion_iva: CondicionIva,
    pub contacto: Option<String>
}

pub struct ClinicaUpdateRequest{
    pub razon_social: String,
    pub direccion: String,
    pub localidad: String,
    pub condicion_iva: CondicionIva,
    pub contacto: Option<String>
}