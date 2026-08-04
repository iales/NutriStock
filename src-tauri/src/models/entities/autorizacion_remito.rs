#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct AutorizacionRemito{
    pub id: Option<i64>,
    pub cai: String, 
    pub punto_venta:i64,
    pub numero_desde: i64,
    pub numero_hasta: i64,
    pub vencimiento: chrono::NaiveDate,
}

impl AutorizacionRemito{
    pub fn new(
        cai: String, 
        punto_venta:i64,
        numero_desde: i64,
        numero_hasta: i64,
        vencimiento: chrono::NaiveDate,
    ) -> Self{
        Self{
            id: None, 
            cai, 
            punto_venta, 
            numero_desde, 
            numero_hasta,
            vencimiento
        }

    }
}

#[derive(Debug, serde::Deserialize)]
pub struct AutorizacionRemitoCreateRequest{
    pub cai: String, 
    pub punto_venta:i64,
    pub numero_desde: i64,
    pub numero_hasta: i64,
    pub vencimiento: chrono::NaiveDate
} 

#[derive(Debug, Clone, serde::Serialize)]
pub struct SugerenciaRemito {
    pub punto_venta: Option<i64>,
    pub numero: Option<i64>,
    pub avisos: Vec<String>,
}