use crate::models::repositories::lote_bien_repository::LoteBienRepository;
use crate::models::entities::lote_bien::{LoteBien, LoteBienCreateRequest};
use crate::services::bien_service::BienService;
use crate::services::lote_bien_service::{LoteBienService, LoteBienServiceError};

pub struct LoteBienServiceImpl<LR: LoteBienRepository, BS: BienService> {
    lote_repo: LR,
    bien_service: BS,
}

impl<LR: LoteBienRepository, BS: BienService> LoteBienServiceImpl<LR, BS> {
    pub fn new(lote_repo: LR, bien_service: BS) -> Self {
        Self { lote_repo, bien_service }
    }
}

impl<LR: LoteBienRepository + Sync, BS: BienService + Sync> LoteBienService for LoteBienServiceImpl<LR, BS> {
    async fn recibir_lote(&self, request: LoteBienCreateRequest) -> Result<LoteBien, LoteBienServiceError> {
        if request.cantidad == 0 {
            return Err(LoteBienServiceError::InvalidCantidad);
        }

        self.bien_service.find_by_id(request.bien_id).await?
            .ok_or(LoteBienServiceError::NotFoundBien(request.bien_id))?;

        match request.vencimiento {
            Some(vencimiento) => Ok(self.lote_repo
                .crear(LoteBien::new(request.bien_id, request.cantidad, Some(vencimiento)))
                .await?),
            None => Ok(self.lote_repo.agregar_manual(request.bien_id, request.cantidad).await?),
        }
    }

    async fn listar_por_bien(&self, bien_id: i64) -> Result<Vec<LoteBien>, LoteBienServiceError> {
        Ok(self.lote_repo.listar_por_bien(bien_id).await?)
    }
}
