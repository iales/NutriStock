#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct Bien{
    pub id: Option<i64>,
    pub descripcion: String,
    pub peso_kg: f64,
    pub precio_centavos: u64,
    pub stock_actual: u32,
    pub categoria_nutricional: CategoriaNutricional,
    pub proximo_vencimiento: Option<chrono::NaiveDate>
}
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize, sqlx::Type)]
#[sqlx(type_name = "TEXT", rename_all = "snake_case")]
pub enum CategoriaNutricional{
    Lacteos,
    Cereales,
    Harinas,
    Postres,
    FrutosSecos,
    Aceites,
    Azucares
} 

impl Bien{
    pub fn new(descripcion: String, 
        peso_kg: f64, 
        precio_centavos: u64,
        categoria_nutricional: CategoriaNutricional
    ) -> Self{
            Self {id: None, descripcion, peso_kg, precio_centavos, stock_actual: 0, categoria_nutricional, proximo_vencimiento: None }
        } 
}
#[derive(Debug, serde::Deserialize)]
pub struct BienCreateRequest{
    pub descripcion: String,
    pub peso_kg: f64,
    pub precio_centavos: u64,
    pub categoria_nutricional: CategoriaNutricional
}
#[derive(Debug, serde::Deserialize)]
pub struct BienUpdateRequest{
    pub bien_id: i64,
    pub delta: i32
} 
#[derive(Debug, serde::Deserialize)]
pub struct BienSetRequest{
    pub bien_id: i64,
    pub value: u32
}

#[derive(Debug, serde::Deserialize)]
pub struct BienActualizarRequest {
    pub bien_id: i64, 
    pub descripcion: String,
    pub precio_centavos: u64,
    pub categoria_nutricional: CategoriaNutricional
}
