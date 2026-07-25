use nutristock_lib::models::entities::bien::Bien;
use nutristock_lib::models::entities::clinica::{Clinica, CondicionIva};
use nutristock_lib::models::entities::entrega::Entrega;
use nutristock_lib::models::entities::item_bien::ItemBien;
use nutristock_lib::models::repositories::bien_repository::BienRepository;
use nutristock_lib::models::repositories::clinica_repository::ClinicaRepository;
use nutristock_lib::models::repositories::entrega_repository::{EntregaRepository, EntregaRepositoryError};
use nutristock_lib::models::repositories::implementations::bien_repository_impl::BienRepositoryImpl;
use nutristock_lib::models::repositories::implementations::clinica_repository_impl::ClinicaRepositoryImpl;
use nutristock_lib::models::repositories::implementations::entrega_repository_impl::EntregaRepositoryImpl;
use sqlx::SqlitePool;

async fn setup_pool() -> SqlitePool {
    let pool = SqlitePool::connect(":memory:").await.expect("no se pudo abrir sqlite en memoria");
    sqlx::migrate!("./migrations").run(&pool).await.expect("fallo la migracion");
    pool
}

async fn crear_clinica_de_prueba(pool: &SqlitePool) -> Clinica {
    let repo = ClinicaRepositoryImpl::new(pool.clone());
    let clinica = Clinica::new(
        "Clinica Test".into(),
        "Calle Falsa 123".into(),
        "CABA".into(),
        "20304050607".into(),
        CondicionIva::ResponsableInscripto,
        None,
    );
    repo.create(clinica).await.expect("no se pudo crear la clinica de prueba")
}

async fn crear_bien_de_prueba(pool: &SqlitePool, stock_inicial: u32) -> Bien {
    let repo = BienRepositoryImpl::new(pool.clone());
    let mut bien = Bien::new("Leche en polvo".into(), 1.0, 50000);
    bien.stock_actual = stock_inicial;
    repo.crear(bien).await.expect("no se pudo crear el bien de prueba")
}

#[tokio::test]
async fn crear_entrega_descuenta_stock_y_devuelve_id() {
    let pool = setup_pool().await;
    let clinica = crear_clinica_de_prueba(&pool).await;
    let bien = crear_bien_de_prueba(&pool, 10).await;

    let item = ItemBien::new(bien.clone(), 3, bien.precio_centavos);
    let entrega = Entrega::new(None, clinica, vec![item], chrono::Local::now().naive_local());

    let repo = EntregaRepositoryImpl::new(pool.clone());
    let creada = repo.crear(entrega).await.expect("crear() no debería fallar con stock suficiente");

    assert!(creada.id.is_some(), "la entrega devuelta debería tener id asignado");

    let bien_repo = BienRepositoryImpl::new(pool.clone());
    let bien_actualizado = bien_repo
        .find_by_id(bien.id.unwrap())
        .await
        .expect("no debería fallar la consulta")
        .expect("el bien debería seguir existiendo");
    assert_eq!(bien_actualizado.stock_actual, 7, "el stock debería haber bajado de 10 a 7");
}

#[tokio::test]
async fn crear_entrega_con_stock_insuficiente_no_persiste_nada() {
    let pool = setup_pool().await;
    let clinica = crear_clinica_de_prueba(&pool).await;
    let bien = crear_bien_de_prueba(&pool, 2).await;

    let item = ItemBien::new(bien.clone(), 5, bien.precio_centavos);
    let entrega = Entrega::new(None, clinica, vec![item], chrono::Local::now().naive_local());

    let repo = EntregaRepositoryImpl::new(pool.clone());
    let resultado = repo.crear(entrega).await;

    assert!(
        matches!(resultado, Err(EntregaRepositoryError::StockInsuficiente(_))),
        "se esperaba StockInsuficiente, se obtuvo: {:?}",
        resultado
    );

    let bien_repo = BienRepositoryImpl::new(pool.clone());
    let bien_sin_tocar = bien_repo
        .find_by_id(bien.id.unwrap())
        .await
        .expect("no debería fallar la consulta")
        .expect("el bien debería seguir existiendo");
    assert_eq!(bien_sin_tocar.stock_actual, 2, "el stock no debería haber cambiado (rollback)");

    let entregas = repo.listar_entregas().await.expect("no debería fallar listar");
    assert!(entregas.is_empty(), "no debería haber quedado ninguna entrega persistida");
}

#[tokio::test]
async fn find_by_id_reconstruye_la_entrega_completa() {
    let pool = setup_pool().await;
    let clinica = crear_clinica_de_prueba(&pool).await;
    let bien = crear_bien_de_prueba(&pool, 10).await;

    let item = ItemBien::new(bien.clone(), 4, bien.precio_centavos);
    let entrega = Entrega::new(None, clinica.clone(), vec![item], chrono::Local::now().naive_local());

    let repo = EntregaRepositoryImpl::new(pool.clone());
    let creada = repo.crear(entrega).await.expect("crear() no debería fallar");

    let encontrada = repo
        .find_by_id(creada.id.unwrap())
        .await
        .expect("no debería fallar la consulta")
        .expect("debería encontrar la entrega recién creada");

    assert_eq!(encontrada.id, creada.id);
    assert_eq!(encontrada.clinica.razon_social, clinica.razon_social);
    assert_eq!(encontrada.items.len(), 1);
    assert_eq!(encontrada.items[0].cantidad, 4);
    assert_eq!(encontrada.items[0].bien.id, bien.id);
}

#[tokio::test]
async fn find_by_id_con_id_inexistente_devuelve_none() {
    let pool = setup_pool().await;
    let repo = EntregaRepositoryImpl::new(pool.clone());

    let resultado = repo.find_by_id(9999).await.expect("no debería fallar la consulta");
    assert!(resultado.is_none(), "no debería encontrar una entrega con id inexistente");
}
