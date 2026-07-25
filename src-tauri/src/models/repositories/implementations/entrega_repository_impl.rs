use crate::models::entities::item_bien::ItemBien;
use crate::models::repositories::entrega_repository::{EntregaRepository, EntregaRepositoryError};
use crate::models::entities::entrega::Entrega;
use crate::models::entities::bien::Bien;
use crate::models::entities::clinica::Clinica;

pub struct EntregaRepositoryImpl{
    pool: sqlx::SqlitePool
}

impl EntregaRepositoryImpl{
    pub fn new(pool: sqlx::SqlitePool) -> Self{
        Self{ pool }
    }
}

impl EntregaRepository for EntregaRepositoryImpl{
    async fn crear(&self, entrega: Entrega) 
    -> Result<Entrega, EntregaRepositoryError>  {
        let mut transaction = self.pool.begin().await?;
         
         let entrega_id: i64 = sqlx::query_scalar(
            "INSERT INTO entrega (clinica_id, fecha) VALUES (?, ?) RETURNING id"
        )
        .bind(entrega.clinica.id)
        .bind(entrega.fecha)
        .fetch_one(&mut *transaction)
        .await?;

        for item in &entrega.items {
            let bien_id = item.bien.id
                .expect("Bien sin id al crear entrega — debería estar persistido");

            sqlx::query_as::<_, Bien>
                ("UPDATE bien SET stock_actual = stock_actual - ? WHERE id = ? AND stock_actual - ? >= 0 RETURNING *")
                .bind(item.cantidad)
                .bind(bien_id)
                .bind(item.cantidad)
                .fetch_optional(&mut *transaction)
                .await?
                .ok_or_else(|| EntregaRepositoryError::StockInsuficiente(bien_id))?;

            sqlx::query("INSERT INTO item_bien (entrega_id,bien_id,cantidad,precio_unitario_centavos) VALUES (?,?,?,?)")
                .bind(entrega_id)
                .bind(bien_id)
                .bind(item.cantidad)
                .bind(item.precio_unitario_centavos as i64)
                .execute(&mut *transaction)
                .await?;

        }

        transaction.commit().await?;
        Ok(Entrega{id: Some(entrega_id), ..entrega })
    }

    async fn find_by_id(&self, entrega_id: i64) 
    -> Result<Option<Entrega>, EntregaRepositoryError> {
        let items_bien: Vec<ItemBienRow> = sqlx::query_as::<_,ItemBienRow>
            ("SELECT * FROM item_bien WHERE entrega_id = ?")
            .bind(entrega_id)
            .fetch_all(&self.pool)
            .await?;

        let mut items: Vec<ItemBien> = Vec::new();
        
        for item in items_bien {
            let bien =  sqlx::query_as::<_, Bien>
                ("SELECT * FROM bien WHERE id = ?")
                .bind(item.bien_id)
                .fetch_one(&self.pool)
                .await?;
            
            items.push(ItemBien::new(bien,item.cantidad as u32,item.precio_unitario_centavos as u64));
        }

        let Some(entrega_row) = sqlx::query_as::<_,EntregaRow>
            ("SELECT * FROM entrega WHERE id = ?")
            .bind(entrega_id)
            .fetch_optional(&self.pool)
            .await?
        else {
            return Ok(None);
        };

        let clinica: Clinica = sqlx::query_as
            ("SELECT * FROM clinica WHERE id = ?")
            .bind(entrega_row.clinica_id)
            .fetch_one(&self.pool)
            .await?;
        
        

        Ok(Some(Entrega::new(Some(entrega_row.id) ,clinica, items, entrega_row.fecha)))
    }

    async fn listar_entregas(&self) 
     -> Result<Vec<Entrega>, EntregaRepositoryError> {
        let entregas_row = sqlx::query_as::<_,EntregaRow>
            ("SELECT * FROM entrega")
            .fetch_all(&self.pool)
            .await?;
        let mut entregas: Vec<Entrega> = Vec::new();

        for entrega_row in entregas_row{
            let items_bien: Vec<ItemBienRow> = sqlx::query_as::<_,ItemBienRow>
            ("SELECT * FROM item_bien WHERE entrega_id = ?")
            .bind(entrega_row.id)
            .fetch_all(&self.pool)
            .await?;

            let mut items: Vec<ItemBien> = Vec::new();
        
            for item in items_bien {
                let bien =  sqlx::query_as::<_, Bien>
                    ("SELECT * FROM bien WHERE id = ?")
                    .bind(item.bien_id)
                    .fetch_one(&self.pool)
                    .await?;
                
                items.push(ItemBien::new(bien,item.cantidad as u32,item.precio_unitario_centavos as u64));
            }
            
            let clinica: Clinica = sqlx::query_as
                ("SELECT * FROM clinica WHERE id = ?")
                .bind(entrega_row.clinica_id)
                .fetch_one(&self.pool)
                .await?;

            entregas.push(Entrega::new(Some(entrega_row.id) ,clinica, items, entrega_row.fecha));
        }

        Ok(entregas)
    }
}


#[derive(sqlx::FromRow)]
struct EntregaRow {
    id: i64,
    clinica_id: i64,
    fecha: chrono::NaiveDateTime,
}

#[derive(sqlx::FromRow)]
struct ItemBienRow {
    bien_id: i64,
    cantidad: i64,
    precio_unitario_centavos: i64,
}

