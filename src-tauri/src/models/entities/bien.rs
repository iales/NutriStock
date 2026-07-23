#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct Bien{
    pub id: Option<i64>,
    pub nombre: String,
    pub peso_kg: f64,
    pub precio_centavos: u64,
    pub stock_actual: u32
}

impl Bien{
    pub fn new(nombre: String, 
        peso_kg: f64, 
        precio_centavos: u64) -> Self{
            Self {id: None,nombre, peso_kg, precio_centavos, stock_actual: 0 }
        } 
}
#[derive(Debug, serde::Deserialize)]
pub struct BienCreateRequest{
    pub nombre: String,
    pub peso_kg: f64,
    pub precio_centavos: u64
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