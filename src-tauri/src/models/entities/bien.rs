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
