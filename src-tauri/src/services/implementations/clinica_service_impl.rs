use crate::services::clinica_service::{ClinicaService, ClinicaServiceError};
use crate::models::repositories::clinica_repository::{ClinicaRepository};
use crate::models::entities::clinica::{Clinica, ClinicaCreateRequest, ClinicaUpdateRequest};
pub struct ClinicaServiceImpl<R: ClinicaRepository>{
    repo: R
}

impl<R: ClinicaRepository> ClinicaServiceImpl<R>{
    pub fn new(repo: R) -> Self{
        Self { repo }
    }
}

impl<R: ClinicaRepository + Sync> ClinicaService for ClinicaServiceImpl<R>{

    async fn registrar_nueva_clinica(&self, request: ClinicaCreateRequest) -> 
     Result<Clinica,ClinicaServiceError > {
        
        validar_create_request(&request)?;

        let clinica = Clinica::new(
            request.razon_social,
            request.direccion, 
            request.localidad, 
            request.cuit, 
            request.condicion_iva, 
            request.contacto);


        Ok(self.repo.create(clinica).await?)    
    }

    async fn find_by_id(&self, clinica_id: i64) 
     -> Result<Option<Clinica>,ClinicaServiceError> {
        Ok(self.repo.find_by_id(clinica_id).await?)
    }

    async  fn listar_clinicas(&self) 
     -> Result<Vec<Clinica>, ClinicaServiceError> {
        Ok(self.repo.find_all().await?)
    }

    async fn update_clinica(&self, clinica_id: i64, request: ClinicaUpdateRequest) 
     -> Result<Option<Clinica>, ClinicaServiceError> {
        validar_update_request(&request)?;

        Ok(self.repo.update(clinica_id, request).await?)
    }  
}


fn validar_create_request(request: &ClinicaCreateRequest) -> Result<(),ClinicaServiceError>{
        if request.direccion.len() == 0 {return Err(ClinicaServiceError::VoidField)}
        if request.localidad.len() == 0 {return Err(ClinicaServiceError::VoidField)}
        if request.razon_social.len() == 0 {return Err(ClinicaServiceError::VoidField)}
        validar_cuit(&request.cuit)
}

fn validar_update_request(request: &ClinicaUpdateRequest) -> Result<(),ClinicaServiceError>{
        if request.direccion.len() == 0 {return Err(ClinicaServiceError::VoidField)}
        if request.localidad.len() == 0 {return Err(ClinicaServiceError::VoidField)}
        if request.razon_social.len() == 0 {return Err(ClinicaServiceError::VoidField)}
        Ok(())
}


const PESOS_CUIT: [u32; 10] = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

fn validar_cuit(cuit: &str) -> Result<(), ClinicaServiceError> {
    let digitos: Vec<u32> = cuit.chars().filter_map(|c| c.to_digit(10)).collect();

    if digitos.len() != 11 {
        return Err(ClinicaServiceError::InvalidFormatCuit);
    }

    let suma: u32 = digitos[..10]
        .iter()
        .zip(PESOS_CUIT.iter())
        .map(|(digito, peso)| digito * peso)
        .sum();

    let resto = suma % 11;
    let verificador_esperado = match resto {
        0 => 0,
        1 => return Err(ClinicaServiceError::InvalidCuit),
        _ => 11 - resto,
    };

    if verificador_esperado == digitos[10] {
        Ok(())
    } else {
        Err(ClinicaServiceError::InvalidCuit)
    }
}