pub struct Producto {
    pub id: Option<i32>,
    pub descripcion: String,
    pub peso_unitario_kg: f64, // TODO: Checkear que el peso sea en kilogramos y si hace falta una unidad de medida 
    pub stock_actual: i32, // FIXME: Checkear si es necesario un stock minimo y maximo
}