CREATE TABLE datos_empresa (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    razon_social TEXT NOT NULL,
    cuit TEXT NOT NULL,
    domicilio TEXT NOT NULL,
    condicion_iva TEXT NOT NULL
);
