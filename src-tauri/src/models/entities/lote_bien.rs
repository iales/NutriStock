#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct LoteBien {
    pub id: Option<i64>,
    pub bien_id: i64,
    pub cantidad: u32,
    pub vencimiento: Option<chrono::NaiveDate>,
}

impl LoteBien {
    pub fn new(bien_id: i64, cantidad: u32, vencimiento: Option<chrono::NaiveDate>) -> Self {
        Self { id: None, bien_id, cantidad, vencimiento }
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct LoteBienCreateRequest {
    pub bien_id: i64,
    pub cantidad: u32,
    pub vencimiento: Option<chrono::NaiveDate>,
}
