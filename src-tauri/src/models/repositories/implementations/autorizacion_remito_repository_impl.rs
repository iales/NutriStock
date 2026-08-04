use crate::models::repositories::autorizacion_remito_repository::{AutorizacionRemitoRepository, AutorizacionRemitoRepositoryError};
use crate::models::entities::autorizacion_remito::AutorizacionRemito;
pub struct AutorizacionRemitoRepositoryImpl{
    pool: sqlx::SqlitePool
}

impl AutorizacionRemitoRepositoryImpl{
    pub fn new(pool: sqlx::SqlitePool) -> Self{
        Self{pool}
    }
}

impl AutorizacionRemitoRepository for AutorizacionRemitoRepositoryImpl{
    async fn crear(&self, autorizacion: AutorizacionRemito)
     -> Result<AutorizacionRemito, AutorizacionRemitoRepositoryError> {
        let autorizacion = sqlx::query_as
        ("INSERT INTO autorizacion_remito (cai, punto_venta, numero_desde, numero_hasta, vencimiento) VALUES (?,?,?,?,?)  RETURNING *")
        .bind(autorizacion.cai)
        .bind(autorizacion.punto_venta)
        .bind(autorizacion.numero_desde)
        .bind(autorizacion.numero_hasta)
        .bind(autorizacion.vencimiento)
        .fetch_one(&self.pool)
        .await?;

        Ok(autorizacion)
    }

    async fn find_ultima(&self) 
     -> Result<Option<AutorizacionRemito>, AutorizacionRemitoRepositoryError> {
        let autotizacion = sqlx::query_as
        ("SELECT * FROM autorizacion_remito ORDER BY id DESC LIMIT 1")
        .fetch_optional(&self.pool)
        .await?;

        Ok(autotizacion)
    }

    async fn listar(&self) 
     -> Result<Vec<AutorizacionRemito>, AutorizacionRemitoRepositoryError> {
        let autotizaciones = sqlx::query_as
        ("SELECT * FROM autorizacion_remito ORDER BY id DESC")
        .fetch_all(&self.pool)
        .await?;

        Ok(autotizaciones)
    }
}