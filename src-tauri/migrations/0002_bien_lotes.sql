ALTER TABLE bien ADD COLUMN categoria_nutricional TEXT NOT NULL DEFAULT 'conservas';

CREATE TABLE lote_bien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bien_id INTEGER NOT NULL REFERENCES bien(id),
    cantidad INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    vencimiento TEXT
);

CREATE INDEX idx_lote_bien_bien_id ON lote_bien(bien_id, vencimiento);

-- a lo sumo un lote "sin vencimiento" (balde manual) por bien
CREATE UNIQUE INDEX idx_lote_bien_manual_unico ON lote_bien(bien_id) WHERE vencimiento IS NULL;

-- migrar el stock_actual existente a un lote sin vencimiento antes de borrar la columna
INSERT INTO lote_bien (bien_id, cantidad, vencimiento)
SELECT id, stock_actual, NULL FROM bien WHERE stock_actual > 0;

ALTER TABLE bien DROP COLUMN stock_actual;
