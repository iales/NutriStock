use crate::models::entities::item_bien::ItemBien;
use crate::models::repositories::entrega_repository::{EntregaRepository, EntregaRepositoryError};
use crate::models::entities::entrega::Entrega;
use crate::models::entities::bien::Bien;
use crate::models::entities::clinica::Clinica;
use crate::models::repositories::implementations::bien_repository_impl::BIEN_SELECT_AGREGADO;
use crate::models::repositories::implementations::lote_bien_repository_impl::consumir_fifo;

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
            "INSERT INTO entrega (clinica_id, fecha, condicion_venta, remito_punto_venta, remito_numero) VALUES (?, ?, ?, ?, ?) RETURNING id"
        )
        .bind(entrega.clinica.id)
        .bind(entrega.fecha)
        .bind(entrega.condicion_venta.clone())
        .bind(entrega.remito_punto_venta)
        .bind(entrega.remito_numero)
        .fetch_one(&mut *transaction)
        .await?;

        for item in &entrega.items {
            let bien_id = item.bien.id
                .expect("Bien sin id al crear entrega — debería estar persistido");

            let satisfecho = consumir_fifo(&mut transaction, bien_id, item.cantidad as i64).await?;
            if !satisfecho {
                return Err(EntregaRepositoryError::StockInsuficiente(bien_id));
            }

            sqlx::query("INSERT INTO item_bien (entrega_id,bien_id,cantidad,precio_unitario_centavos,descripcion,peso_kg) VALUES (?,?,?,?,?,?)")
                .bind(entrega_id)
                .bind(bien_id)
                .bind(item.cantidad)
                .bind(item.precio_unitario_centavos as i64)
                .bind(&item.bien.descripcion)
                .bind(item.bien.peso_kg)
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
            let bien_query = format!("{BIEN_SELECT_AGREGADO} WHERE b.id = ? GROUP BY b.id");
            let mut bien = sqlx::query_as::<_, Bien>(&bien_query)
                .bind(item.bien_id)
                .fetch_one(&self.pool)
                .await?;
            bien.descripcion = item.descripcion;
            bien.peso_kg = item.peso_kg;

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
        
        

        Ok(Some(Entrega::new(
            Some(entrega_row.id),
            clinica,
            items,
            entrega_row.fecha,
            entrega_row.condicion_venta,
            entrega_row.remito_punto_venta,
            entrega_row.remito_numero,
        )))

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
                let bien_query = format!("{BIEN_SELECT_AGREGADO} WHERE b.id = ? GROUP BY b.id");
                let mut bien = sqlx::query_as::<_, Bien>(&bien_query)
                    .bind(item.bien_id)
                    .fetch_one(&self.pool)
                    .await?;
                bien.descripcion = item.descripcion;
                bien.peso_kg = item.peso_kg;

                items.push(ItemBien::new(bien,item.cantidad as u32,item.precio_unitario_centavos as u64));
            }
            
            let clinica: Clinica = sqlx::query_as
                ("SELECT * FROM clinica WHERE id = ?")
                .bind(entrega_row.clinica_id)
                .fetch_one(&self.pool)
                .await?;

            entregas.push(Entrega::new(
                Some(entrega_row.id),
                clinica,
                items,
                entrega_row.fecha,
                entrega_row.condicion_venta,
                entrega_row.remito_punto_venta,
                entrega_row.remito_numero,
            ));
        }

        Ok(entregas)
    }
    async fn max_remito_numero(&self, punto_venta: i64, numero_desde: i64, numero_hasta: i64)
      -> Result<Option<i64>, EntregaRepositoryError> {
        Ok(sqlx::query_scalar
            ("SELECT MAX(remito_numero) FROM entrega WHERE remito_punto_venta = ? AND remito_numero >= ? AND remito_numero <= ?")
            .bind(punto_venta)
            .bind(numero_desde)
            .bind(numero_hasta)
            .fetch_one(&self.pool)
            .await?
        )
    }
}


#[derive(sqlx::FromRow)]
struct EntregaRow {
    id: i64,
    clinica_id: i64,
    fecha: chrono::NaiveDateTime,
    condicion_venta: Option<String>,
    remito_punto_venta: Option<i64>,
    remito_numero: Option<i64>,
}

#[derive(sqlx::FromRow)]
struct ItemBienRow {
    bien_id: i64,
    cantidad: i64,
    precio_unitario_centavos: i64,
    descripcion: String,
    peso_kg: f64,
}

