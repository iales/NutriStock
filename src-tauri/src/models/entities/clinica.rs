#[derive(Debug,Clone,serde::Serialize,serde::Deserialize,sqlx::FromRow)]
pub struct Clinica{
    pub id: Option<i64>,
    pub nombre: String,
    pub direccion: String,
    pub codigo_postal: String,
    pub cuit: String
}

impl Clinica{
    pub fn new(
        nombre: String,
        direccion: String,
        codigo_postal: String,
        cuit: String
    ) -> Self{
        Self {
            id: None,
            nombre,
            direccion,
            codigo_postal,
            cuit
        }
    }
}