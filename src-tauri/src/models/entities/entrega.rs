use crate::models::entities::clinica::Clinica;
use crate::models::entities::item_bien::ItemBien;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Entrega{
    pub id: Option<i64>,
    pub clinica: Clinica,
    pub items: Vec<ItemBien>,
    pub fecha: chrono::NaiveDateTime,
}

impl Entrega{
    pub fn new(
        clinica: Clinica,
        items: Vec<ItemBien>
     ) -> Self{
        Self { 
            id: None,
            clinica,
            items,
            fecha: chrono::Local::now().naive_local() 
        }
     }

    pub fn precio_total_centavos(&self) -> u64{
        self.items.iter().map(|item: &ItemBien| item.precio_total()).sum()
    }

    pub fn peso_total_kg(&self) -> f64{
        self.items.iter().map(|item:&ItemBien| item.peso_total()).sum()
    }

}