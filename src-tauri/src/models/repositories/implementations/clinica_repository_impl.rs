use crate::models::entities::clinica::{Clinica, ClinicaUpdateRequest};
use crate::models::repositories::clinica_repository::{ClinicaRepository, ClinicaRepositoryError};

pub struct ClinicaRepositoryImpl{
    pool: sqlx::SqlitePool,
}

impl ClinicaRepositoryImpl{
    pub fn new(pool: sqlx::SqlitePool)-> Self {Self { pool }} 
}

impl ClinicaRepository for ClinicaRepositoryImpl{
    async fn find_by_id(&self, clinica_id: i64) 
     -> Result<Option<Clinica>, ClinicaRepositoryError> {
        let clinica = sqlx::query_as::<_,Clinica>
        ("SELECT * FROM clinica WHERE id = ?")
        .bind(clinica_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(clinica)
    }

    async fn find_all(&self) 
     -> Result<Vec<Clinica>, ClinicaRepositoryError> {
        let clinica = sqlx::query_as::<_,Clinica>("SELECT * FROM clinica")
        .fetch_all(&self.pool)
        .await?;

        Ok(clinica)
    }

    async fn create(&self, request: Clinica) 
     -> Result<Clinica,ClinicaRepositoryError> {
        
        let clinica = 
        sqlx::query_as::<_,Clinica>
        ("INSERT INTO clinica (razon_social, direccion, localidad, cuit, condicion_iva, contacto) VALUES (?,?,?,?,?,?) RETURNING* ")
        .bind(request.razon_social)
        .bind(request.direccion)
        .bind(request.localidad)
        .bind(request.cuit)
        .bind(request.condicion_iva)
        .bind(request.contacto)
        .fetch_one(&self.pool)
        .await?;

        Ok(clinica)
    }

    async fn update(&self, clinica_id: i64,request: ClinicaUpdateRequest) 
     -> Result<Option<Clinica>,ClinicaRepositoryError> {
        let clinica = sqlx::query_as::<_,Clinica>
        ("UPDATE clinica SET razon_social = ?, direccion = ?, localidad = ?, 
        condicion_iva = ?, contacto = ? WHERE id = ? RETURNING * ")
        .bind(&request.razon_social)
        .bind(request.direccion)
        .bind(request.localidad)
        .bind(request.condicion_iva)
        .bind(request.contacto)
        .bind(clinica_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(clinica)
    }

}
