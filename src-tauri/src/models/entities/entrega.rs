use crate::models::entities::clinica::Clinica;
use crate::models::entities::item_bien::{ItemBien,ItemBienRequest};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Entrega{
    pub id: Option<i64>,
    pub clinica: Clinica,
    pub items: Vec<ItemBien>,
    pub fecha: chrono::NaiveDateTime,
    pub condicion_venta: Option<String>,
}

impl Entrega{
    pub fn new(
        id: Option<i64>,
        clinica: Clinica,
        items: Vec<ItemBien>,
        fecha: chrono::NaiveDateTime,
        condicion_venta: Option<String>,
     ) -> Self{
        Self { 
            id,
            clinica,
            items,
            fecha,
            condicion_venta
        }
     }

    pub fn precio_total_centavos(&self) -> u64{
        self.items.iter().map(|item: &ItemBien| item.precio_total()).sum()
    }

    pub fn peso_total_kg(&self) -> f64{
        self.items.iter().map(|item:&ItemBien| item.peso_total()).sum()
    }

}


#[derive(Debug, serde::Deserialize)]
pub struct EntregaCreateRequest{ pub clinica_id: i64, pub  items: Vec<ItemBienRequest>, pub condicion_venta: Option<String> }