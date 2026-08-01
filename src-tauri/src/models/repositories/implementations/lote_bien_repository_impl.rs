use crate::models::repositories::lote_bien_repository::{LoteBienRepository, LoteBienRepositoryError};
use crate::models::entities::lote_bien::LoteBien;
use sqlx::SqlitePool;

pub struct LoteBienRepositoryImpl {
    pool: SqlitePool,
}

impl LoteBienRepositoryImpl {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

impl LoteBienRepository for LoteBienRepositoryImpl {
    async fn crear(&self, lote: LoteBien) -> Result<LoteBien, LoteBienRepositoryError> {
        let lote_creado = sqlx::query_as::<_, LoteBien>
            ("INSERT INTO lote_bien (bien_id, cantidad, vencimiento) VALUES (?,?,?) RETURNING *")
            .bind(lote.bien_id)
            .bind(lote.cantidad)
            .bind(lote.vencimiento)
            .fetch_one(&self.pool)
            .await?;

        Ok(lote_creado)
    }

    async fn listar_por_bien(&self, bien_id: i64) -> Result<Vec<LoteBien>, LoteBienRepositoryError> {
        let lotes = sqlx::query_as::<_, LoteBien>
            ("SELECT * FROM lote_bien WHERE bien_id = ? ORDER BY (vencimiento IS NULL) ASC, vencimiento ASC")
            .bind(bien_id)
            .fetch_all(&self.pool)
            .await?;

        Ok(lotes)
    }

    async fn agregar_manual(&self, bien_id: i64, cantidad: u32) -> Result<LoteBien, LoteBienRepositoryError> {
        let actualizado = sqlx::query_as::<_, LoteBien>
            ("UPDATE lote_bien SET cantidad = cantidad + ? WHERE bien_id = ? AND vencimiento IS NULL RETURNING *")
            .bind(cantidad)
            .bind(bien_id)
            .fetch_optional(&self.pool)
            .await?;

        if let Some(lote) = actualizado {
            return Ok(lote);
        }

        let creado = sqlx::query_as::<_, LoteBien>
            ("INSERT INTO lote_bien (bien_id, cantidad, vencimiento) VALUES (?,?,NULL) RETURNING *")
            .bind(bien_id)
            .bind(cantidad)
            .fetch_one(&self.pool)
            .await?;

        Ok(creado)
    }

    async fn consumir(&self, bien_id: i64, cantidad: u32) -> Result<bool, LoteBienRepositoryError> {
        let mut transaction = self.pool.begin().await?;

        let satisfecho = consumir_fifo(&mut transaction, bien_id, cantidad as i64).await?;

        transaction.commit().await?;
        Ok(satisfecho)
    }
}

/// Descuenta `cantidad_requerida` de los lotes de `bien_id`, empezando por el
/// que vence antes (el lote sin vencimiento se consume último). Corre sobre
/// una conexión ya abierta para poder participar de una transacción externa
/// (ver EntregaRepositoryImpl::crear). Devuelve `false` si el stock total no
/// alcanzó — en ese caso no se dejó nada relevante pendiente de commitear.
pub(crate) async fn consumir_fifo(
    conn: &mut sqlx::SqliteConnection,
    bien_id: i64,
    cantidad_requerida: i64,
) -> Result<bool, sqlx::Error> {
    let lotes: Vec<(i64, i64)> = sqlx::query_as(
        "SELECT id, cantidad FROM lote_bien WHERE bien_id = ? AND cantidad > 0 \
         ORDER BY (vencimiento IS NULL) ASC, vencimiento ASC"
    )
    .bind(bien_id)
    .fetch_all(&mut *conn)
    .await?;

    let mut restante = cantidad_requerida;
    for (lote_id, disponible) in lotes {
        if restante <= 0 {
            break;
        }
        let tomar = restante.min(disponible);
        sqlx::query("UPDATE lote_bien SET cantidad = cantidad - ? WHERE id = ?")
            .bind(tomar)
            .bind(lote_id)
            .execute(&mut *conn)
            .await?;
        restante -= tomar;
    }

    Ok(restante <= 0)
}
