use crate::models::repositories::bien_repository::{BienRepository,BienRepositoryError};
use crate::models::entities::bien::Bien;
use sqlx::SqlitePool;

pub struct BienRepositoryImpl{
    pool: sqlx::SqlitePool,
}

impl BienRepositoryImpl{
    pub fn new(pool: SqlitePool)-> Self {Self { pool }} 
}

impl BienRepository for BienRepositoryImpl{
    async fn crear(&self, bien: Bien) -> 
    Result<Bien,BienRepositoryError> {
        let bien_creado 
        = sqlx::query_as::<_,Bien>("INSERT INTO bien (descripcion, peso_kg, precio_centavos, stock_actual) VALUES (?,?,?,?) RETURNING *")
        .bind(&bien.descripcion)
        .bind(bien.peso_kg)
        .bind(bien.precio_centavos as i64)
        .bind(bien.stock_actual)
        .fetch_one(&self.pool)
        .await?;
        
        Ok(bien_creado)
    }

    async fn listar_bienes(&self) 
    -> Result<Vec<Bien>, BienRepositoryError> {
        let bienes =
        sqlx::query_as::<_,Bien>("SELECT * FROM bien")
        .fetch_all(&self.pool)
        .await?;

        Ok(bienes)    
    }
    async fn ajustar_stock(&self, bien_id: i64, delta: i32) 
    -> Result<Option<Bien>, BienRepositoryError> {
        let bien = 
        sqlx::query_as::<_,Bien>
        ("UPDATE bien SET stock_actual = stock_actual + ? WHERE id = ? AND stock_actual + ? >= 0 RETURNING *")
        .bind(delta)
        .bind(bien_id)
        .bind(delta)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(bien)
    }

    async fn setear_stock(&self, bien_id: i64, value: u32) 
        -> Result<Option<Bien>, BienRepositoryError> {
        let bien = sqlx::query_as::<_,Bien>
        ("UPDATE bien set stock_actual = ? WHERE id = ? RETURNING *")
        .bind(value)
        .bind(bien_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(bien)
    }

    async fn find_by_id(&self, bien_id: i64) 
        -> Result<Option<Bien>, BienRepositoryError> {
        let bien = sqlx::query_as::<_,Bien>
        ("SELECT * FROM bien WHERE id = ?")
        .bind(bien_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(bien)
    }

    async fn delete(&self, bien_id: i64) -> Result<bool, BienRepositoryError> {
        let resultado = sqlx::query("DELETE FROM bien WHERE id = ?")
            .bind(bien_id)
            .execute(&self.pool)
            .await?;

        Ok(resultado.rows_affected() > 0)
    }

    async fn setear_descripcion(&self, bien_id: i64, descripcion: String) 
     -> Result<Option<Bien>, BienRepositoryError> {
        let bien = sqlx::query_as::<_, Bien>
            ("UPDATE bien SET nombre = ? WHERE id = ? RETURNING *")
            .bind(descripcion)
            .bind(bien_id)
            .fetch_optional(&self.pool)
            .await?;

        Ok(bien)
    } 
}