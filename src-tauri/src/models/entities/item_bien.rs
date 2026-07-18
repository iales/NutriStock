use crate::models::entities::bien::Bien;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ItemBien{
    pub bien: Bien,
    pub cantidad: u32
}

impl ItemBien{
    pub fn new(bien:Bien, cantidad: u32) -> Self{
        Self { bien, cantidad }
    }

    pub fn precio_total(&self) -> u64{
        self.bien.precio_centavos * u64::from(self.cantidad)
    }

    pub fn peso_total(&self) -> f64{
        self.bien.peso_kg * f64::from(self.cantidad)
    }

}