use crate::models::repositories::bien_repository::{BienRepository,BienRepositoryError};
use crate::models::entities::bien::{Bien, CategoriaNutricional};
use sqlx::SqlitePool;

pub struct BienRepositoryImpl{
    pool: sqlx::SqlitePool,
}

impl BienRepositoryImpl{
    pub fn new(pool: SqlitePool)-> Self {Self { pool }}
}

/// stock_actual ya no es una columna: se calcula sumando los lotes vigentes
/// del bien. Se comparte con entrega_repository_impl.rs para no duplicar el
/// SQL (el nombre de las columnas seleccionadas debe matchear los campos de Bien).
pub(crate) const BIEN_SELECT_AGREGADO: &str = "
    SELECT b.id, b.descripcion, b.peso_kg, b.precio_centavos, b.categoria_nutricional,
           COALESCE(SUM(lb.cantidad), 0) AS stock_actual,
           MIN(CASE WHEN lb.cantidad > 0 THEN lb.vencimiento END) AS proximo_vencimiento
    FROM bien b
    LEFT JOIN lote_bien lb ON lb.bien_id = b.id
";

impl BienRepository for BienRepositoryImpl{
    async fn crear(&self, bien: Bien) ->
    Result<Bien,BienRepositoryError> {
        let bien_id: i64 = sqlx::query_scalar
        ("INSERT INTO bien (descripcion, peso_kg, precio_centavos, categoria_nutricional) VALUES (?,?,?,?) RETURNING id")
        .bind(&bien.descripcion)
        .bind(bien.peso_kg)
        .bind(bien.precio_centavos as i64)
        .bind(bien.categoria_nutricional)
        .fetch_one(&self.pool)
        .await?;

        let bien_creado = self.find_by_id(bien_id).await?
            .expect("el bien recien insertado deberia existir");

        Ok(bien_creado)
    }

    async fn listar_bienes(&self)
    -> Result<Vec<Bien>, BienRepositoryError> {
        let query = format!("{BIEN_SELECT_AGREGADO} GROUP BY b.id");
        let bienes =
        sqlx::query_as::<_,Bien>(&query)
        .fetch_all(&self.pool)
        .await?;

        Ok(bienes)
    }

    async fn find_by_id(&self, bien_id: i64)
        -> Result<Option<Bien>, BienRepositoryError> {
        let query = format!("{BIEN_SELECT_AGREGADO} WHERE b.id = ? GROUP BY b.id");
        let bien = sqlx::query_as::<_,Bien>(&query)
        .bind(bien_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(bien)
    }

    async fn delete(&self, bien_id: i64) -> Result<bool, BienRepositoryError> {
        let mut transaction = self.pool.begin().await?;

        let stock_actual: i64 = sqlx::query_scalar
            ("SELECT COALESCE(SUM(cantidad), 0) FROM lote_bien WHERE bien_id = ?")
            .bind(bien_id)
            .fetch_one(&mut *transaction)
            .await?;

        if stock_actual > 0 {
            return Err(BienRepositoryError::TieneStock);
        }

        // stock en 0 => son solo lotes vacíos (historial), se limpian para poder borrar el bien.
        sqlx::query("DELETE FROM lote_bien WHERE bien_id = ?")
            .bind(bien_id)
            .execute(&mut *transaction)
            .await?;

        let resultado = sqlx::query("DELETE FROM bien WHERE id = ?")
            .bind(bien_id)
            .execute(&mut *transaction)
            .await
            .map_err(|e| match &e {
                sqlx::Error::Database(db_err) if db_err.is_foreign_key_violation() => BienRepositoryError::TieneEntregas,
                _ => BienRepositoryError::DataBase(e),
            })?;

        transaction.commit().await?;
        Ok(resultado.rows_affected() > 0)
    }

    async fn actualizar_bien(&self, bien_id: i64, descripcion: String, precio_centavos: u64, categoria_nutricional: CategoriaNutricional)
     -> Result<Option<Bien>, BienRepositoryError> {
        sqlx::query
            ("UPDATE bien SET descripcion = ?, precio_centavos = ?, categoria_nutricional = ? WHERE id = ?")
            .bind(descripcion)
            .bind(precio_centavos as i64)
            .bind(categoria_nutricional)
            .bind(bien_id)
            .execute(&self.pool)
            .await?;

    self.find_by_id(bien_id).await
}
}
