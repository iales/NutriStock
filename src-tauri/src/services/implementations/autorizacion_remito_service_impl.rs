use crate::services::autorizacion_remito_service::{AutorizacionRemitoService, AutorizacionRemitoServiceError};
use crate::models::entities::autorizacion_remito::{AutorizacionRemito, AutorizacionRemitoCreateRequest, SugerenciaRemito};
use crate::models::repositories::entrega_repository::EntregaRepository;
use crate::models::repositories::autorizacion_remito_repository::AutorizacionRemitoRepository;
pub struct AutorizacionRemitoServiceImpl<AR: AutorizacionRemitoRepository, ER: EntregaRepository> {
    autorizacion_repo: AR,
    entrega_repo: ER,
}
 
impl<AR: AutorizacionRemitoRepository, ER: EntregaRepository> AutorizacionRemitoServiceImpl<AR, ER>{
    pub fn new(autorizacion_repo: AR, entrega_repo: ER)-> Self{
        Self { autorizacion_repo, entrega_repo }
    } 
}


impl<AR: AutorizacionRemitoRepository + Sync, ER: EntregaRepository + Sync> AutorizacionRemitoService for AutorizacionRemitoServiceImpl<AR, ER> {

    async fn crear(&self, request: AutorizacionRemitoCreateRequest) 
     -> Result<AutorizacionRemito, AutorizacionRemitoServiceError> {
        if request.numero_desde > request.numero_hasta || request.numero_desde <= 0 || request.punto_venta <= 0 {
            return Err(AutorizacionRemitoServiceError::RangoInvalido);
        }

        let autorizacion= AutorizacionRemito::new(request.cai, request.punto_venta, request.numero_desde, request.numero_hasta, request.vencimiento);
        Ok(self.autorizacion_repo.crear(autorizacion).await?)
    }

    async fn find_ultima(&self) -> Result<Option<AutorizacionRemito>, AutorizacionRemitoServiceError> {
        Ok(self.autorizacion_repo.find_ultima().await?)
    }

    async fn listar(&self) -> Result<Vec<AutorizacionRemito>, AutorizacionRemitoServiceError> {
        Ok(self.autorizacion_repo.listar().await?)
    }

    //Logica mas fuerte REPASAR
    async fn sugerir_numero_remito(&self) -> Result<SugerenciaRemito, AutorizacionRemitoServiceError> {
       let Some(autorizacion) = self.autorizacion_repo.find_ultima().await? else {
            return Ok(SugerenciaRemito {
                punto_venta: None,
                numero: None,
                avisos: vec!["No hay ninguna autorización de CAI registrada. Podés cargar el remito manualmente.".to_string()]
            })
        };  
        let mut avisos: Vec<String> = Vec::new();
        if autorizacion.vencimiento < chrono::Local::now().date_naive() {
            avisos.push(format!("El CAI {} venció el {}.", autorizacion.cai, autorizacion.vencimiento));
        }
        let max_usado = self
        .entrega_repo
        .max_remito_numero(autorizacion.punto_venta, autorizacion.numero_desde, autorizacion.numero_hasta)
        .await?;
        
        let siguiente = max_usado.map(|m| m + 1).unwrap_or(autorizacion.numero_desde);
        if siguiente > autorizacion.numero_hasta {
            avisos.push("Se agotó el rango de numeración autorizado. Registrá un nuevo CAI o cargá el número manualmente.".to_string())
        } 
        Ok(SugerenciaRemito { punto_venta: Some(autorizacion.punto_venta), numero: Some(siguiente), avisos })
    }    
}