use crate::models::entities::bien::Bien;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ItemBien{
    pub bien: Bien,
    pub cantidad: u32,
    pub precio_unitario_centavos: u64
}

impl ItemBien{
    pub fn new(bien:Bien, cantidad: u32, precio_unitario_centavos: u64) -> Self{
        Self { bien, cantidad, precio_unitario_centavos}
    }

    pub fn precio_total(&self) -> u64{
        self.precio_unitario_centavos * u64::from(self.cantidad)
    }

    pub fn peso_total(&self) -> f64{
        self.bien.peso_kg * f64::from(self.cantidad)
    }

}

#[derive(Debug, serde::Deserialize)]
pub struct ItemBienRequest {
    pub bien_id: i64,
    pub cantidad: u32,
    pub precio_unitario_centavos: Option<u64>,   
}