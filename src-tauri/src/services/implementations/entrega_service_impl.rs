
use crate::models::entities::entrega::{Entrega, EntregaCreateRequest};
use crate::models::entities::item_bien::ItemBien;
use crate::models::repositories::entrega_repository::EntregaRepository;
use crate::services::bien_service::{BienService, BienServiceError};
use crate::services::clinica_service::{ClinicaService, ClinicaServiceError};
use crate::services::entrega_service::{EntregaService, EntregaServiceError};

pub struct EntregaServiceImpl<ER: EntregaRepository, BS: BienService, CS: ClinicaService> {
    entrega_repo: ER,
    bien_service: BS,
    clinica_service: CS,
}

impl<ER: EntregaRepository, BS: BienService, CS: ClinicaService> EntregaServiceImpl<ER, BS, CS> {
    pub fn new(entrega_repo: ER, bien_service: BS, clinica_service: CS) -> Self {
        Self { entrega_repo, bien_service, clinica_service }
    }
}

impl <ER: EntregaRepository + Sync, BR: BienService + Sync, CR: ClinicaService + Sync>
    EntregaService for EntregaServiceImpl<ER, BR, CR>{
        
        async fn crear_entrega(&self, request: EntregaCreateRequest) -> 
            Result<Entrega, EntregaServiceError>  {
            let clinica = self.clinica_service.find_by_id(request.clinica_id).await?
                .ok_or_else(|| ClinicaServiceError::ClinicaNotFound(request.clinica_id))?;
            
            let mut items: Vec<ItemBien> = Vec::new();
            for item in request.items{
                let bien= self.bien_service.find_by_id(item.bien_id).await?.
                    ok_or_else(|| BienServiceError::NotFoundBien(item.bien_id))?;
                
                let precio = item.precio_unitario_centavos.unwrap_or(bien.precio_centavos);

                
                items.push(ItemBien::new(
                    bien, 
                    item.cantidad,
                    item.precio_unitario_centavos.unwrap_or(precio)
                 ));
            }

            Ok(Entrega::new(None, clinica, items, chrono::Local::now().naive_local()))
        }

        async fn find_by_id(&self, entrega_id: i64 ) 
            -> Result<Entrega, EntregaServiceError> {
            let entrega = self.entrega_repo.find_by_id(entrega_id)
            .await?
            .ok_or_else(|| EntregaServiceError::EntregaNotFound(entrega_id))?;

            Ok(entrega)
        }

        async fn listar_entregas(&self)
            -> Result<Vec<Entrega>, EntregaServiceError> {
            let entregas = self.entrega_repo.listar_entregas()
                .await?;

            Ok(entregas)
        }

}