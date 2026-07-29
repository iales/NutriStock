
use crate::models::repositories::bien_repository::BienRepository;
use crate::services::bien_service::BienServiceError;
use crate::services::bien_service::BienService;
use crate::models::entities::bien::{Bien, BienActualizarRequest, BienCreateRequest, BienUpdateRequest, BienSetRequest};


pub struct BienServiceImpl<R: BienRepository>{
    repo: R,
}
impl<R: BienRepository> BienServiceImpl<R>{
    pub fn new(repo: R) -> Self{
        Self {repo}
    }
}

impl<R: BienRepository + Sync> BienService for BienServiceImpl<R>{
   async fn crear_bien(&self, bien_request: BienCreateRequest) 
   -> Result<Bien, BienServiceError>{     
        if bien_request.peso_kg < 0.0 {
            return Err(BienServiceError::InvalidWeight);
        }

        let bien: Bien = Bien::new(
            bien_request.nombre,
            bien_request.peso_kg,
            bien_request.precio_centavos);

        let  response = self.repo.crear(bien).await?;
        
        Ok(response)
   }

   async fn ajustar_stock(&self, update_request: BienUpdateRequest) 
   -> Result<Bien, BienServiceError> {
        self.repo
        .ajustar_stock(update_request.bien_id, update_request.delta)
        .await?
        .ok_or_else(|| BienServiceError::InsufficientStock
            ("no existe Stock Suficiente para este bien".to_string()))
   }

   async fn listar_bienes(&self) -> Result<Vec<Bien>, BienServiceError> {
       Ok(self.repo.listar_bienes().await?)
   }

    async fn setear_stock(&self,update_request: BienSetRequest)
    -> Result<Bien,BienServiceError>{
        self.repo.setear_stock(update_request.bien_id, update_request.value)
        .await?.ok_or_else(|| BienServiceError::NotFoundBien(update_request.bien_id))
    }

    async fn find_by_id(&self, id: i64) 
        -> Result<Option<Bien>,BienServiceError> {
        Ok(self.repo.find_by_id(id).await?)
    }

    async fn delete(&self, id: i64) -> Result<(),BienServiceError> {
        let borrado = self.repo.delete(id).await?;
        if borrado {
            Ok(())
        } else {
            Err(BienServiceError::NotFoundBien(id))
        }
    }

    async fn actualizar_bien(&self, request: BienActualizarRequest)
     -> Result<Bien, BienServiceError> {
        self.repo.actualizar_bien(request.bien_id, request.descripcion, request.precio_centavos)
        .await?
        .ok_or_else(|| BienServiceError::NotFoundBien(request.bien_id))
}

}



