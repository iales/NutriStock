use crate::models::repositories::datos_empresa_repository::{DatosEmpresaRepository, DatosEmpresaRepositoryError};
use crate::models::entities::datos_empresa::DatosEmpresa;
use sqlx::SqlitePool;

pub struct DatosEmpresaRepositoryImpl {
    pool: SqlitePool,
}

impl DatosEmpresaRepositoryImpl {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}

impl DatosEmpresaRepository for DatosEmpresaRepositoryImpl {
    async fn guardar(&self, datos: DatosEmpresa) -> Result<DatosEmpresa, DatosEmpresaRepositoryError> {
        let guardado = sqlx::query_as::<_, DatosEmpresa>(
            "INSERT INTO datos_empresa (id, razon_social, subtitulo, cuit, domicilio, email, condicion_iva, ingresos_brutos, inicio_actividades) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                razon_social = excluded.razon_social,
                subtitulo = excluded.subtitulo,
                cuit = excluded.cuit,
                domicilio = excluded.domicilio,
                email = excluded.email,
                condicion_iva = excluded.condicion_iva,
                ingresos_brutos = excluded.ingresos_brutos,
                inicio_actividades = excluded.inicio_actividades
             RETURNING razon_social, subtitulo, cuit, domicilio, email, condicion_iva, ingresos_brutos, inicio_actividades"
        )
        .bind(datos.razon_social)
        .bind(datos.subtitulo)
        .bind(datos.cuit)
        .bind(datos.domicilio)
        .bind(datos.email)
        .bind(datos.condicion_iva)
        .bind(datos.ingresos_brutos)
        .bind(datos.inicio_actividades)
        .fetch_one(&self.pool)
        .await?;

        Ok(guardado)
    }

    async fn obtener(&self) -> Result<Option<DatosEmpresa>, DatosEmpresaRepositoryError> {
        let datos = sqlx::query_as::<_, DatosEmpresa>(
            "SELECT razon_social, subtitulo, cuit, domicilio, email, condicion_iva, ingresos_brutos, inicio_actividades FROM datos_empresa WHERE id = 1"
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(datos)
    }
}
