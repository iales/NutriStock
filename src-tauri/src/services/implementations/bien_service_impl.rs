
use crate::models::repositories::bien_repository::BienRepository;
use crate::models::repositories::lote_bien_repository::LoteBienRepository;
use crate::services::bien_service::BienServiceError;
use crate::services::bien_service::BienService;
use crate::models::entities::bien::{Bien, BienActualizarRequest, BienCreateRequest, BienUpdateRequest, BienSetRequest};


pub struct BienServiceImpl<R: BienRepository, LR: LoteBienRepository>{
    repo: R,
    lote_repo: LR,
}
impl<R: BienRepository, LR: LoteBienRepository> BienServiceImpl<R, LR>{
    pub fn new(repo: R, lote_repo: LR) -> Self{
        Self {repo, lote_repo}
    }
}

impl<R: BienRepository + Sync, LR: LoteBienRepository + Sync> BienService for BienServiceImpl<R, LR>{
   async fn crear_bien(&self, bien_request: BienCreateRequest)
   -> Result<Bien, BienServiceError>{
        if bien_request.peso_kg < 0.0 {
            return Err(BienServiceError::InvalidWeight);
        }

        let bien: Bien = Bien::new(
            bien_request.descripcion,
            bien_request.peso_kg,
            bien_request.precio_centavos,
            bien_request.categoria_nutricional);

        let  response = self.repo.crear(bien).await?;

        Ok(response)
   }

   async fn ajustar_stock(&self, update_request: BienUpdateRequest)
   -> Result<Bien, BienServiceError> {
        if update_request.delta > 0 {
            self.lote_repo.agregar_manual(update_request.bien_id, update_request.delta as u32).await?;
        } else if update_request.delta < 0 {
            let satisfecho = self.lote_repo.consumir(update_request.bien_id, (-update_request.delta) as u32).await?;
            if !satisfecho {
                return Err(BienServiceError::InsufficientStock
                    ("no existe Stock Suficiente para este bien".to_string()));
            }
        }

        self.repo.find_by_id(update_request.bien_id).await?
            .ok_or(BienServiceError::NotFoundBien(update_request.bien_id))
   }

   async fn listar_bienes(&self) -> Result<Vec<Bien>, BienServiceError> {
       Ok(self.repo.listar_bienes().await?)
   }

    async fn setear_stock(&self,update_request: BienSetRequest)
    -> Result<Bien,BienServiceError>{
        let actual = self.repo.find_by_id(update_request.bien_id).await?
            .ok_or(BienServiceError::NotFoundBien(update_request.bien_id))?;

        let delta = update_request.value as i64 - actual.stock_actual as i64;

        if delta > 0 {
            self.lote_repo.agregar_manual(update_request.bien_id, delta as u32).await?;
        } else if delta < 0 {
            self.lote_repo.consumir(update_request.bien_id, (-delta) as u32).await?;
        }

        self.repo.find_by_id(update_request.bien_id).await?
            .ok_or(BienServiceError::NotFoundBien(update_request.bien_id))
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
        self.repo.actualizar_bien(request.bien_id, request.descripcion, request.precio_centavos, request.categoria_nutricional)
        .await?
        .ok_or_else(|| BienServiceError::NotFoundBien(request.bien_id))
}

}


