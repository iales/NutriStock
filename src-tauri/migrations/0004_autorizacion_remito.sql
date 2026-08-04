CREATE TABLE autorizacion_remito (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cai TEXT NOT NULL,
    punto_venta INTEGER NOT NULL,
    numero_desde INTEGER NOT NULL,
    numero_hasta INTEGER NOT NULL,
    vencimiento TEXT NOT NULL
);

ALTER TABLE entrega ADD COLUMN remito_punto_venta INTEGER;
ALTER TABLE entrega ADD COLUMN remito_numero INTEGER;
