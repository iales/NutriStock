CREATE TABLE bien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    peso_kg REAL NOT NULL,
    precio_centavos INTEGER NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE clinica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razon_social TEXT NOT NULL,
    direccion TEXT NOT NULL,
    localidad TEXT NOT NULL,
    cuit TEXT NOT NULL,
    condicion_iva TEXT NOT NULL,
    contacto TEXT
);

CREATE TABLE entrega (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinica_id INTEGER NOT NULL REFERENCES clinica(id),
    fecha TEXT NOT NULL
);

CREATE TABLE item_bien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entrega_id INTEGER NOT NULL REFERENCES entrega(id),
    bien_id INTEGER NOT NULL REFERENCES bien(id),
    cantidad INTEGER NOT NULL
);
