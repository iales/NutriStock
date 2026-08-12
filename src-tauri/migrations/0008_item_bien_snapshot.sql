-- Congela el nombre y peso del producto en el momento de la entrega, para que
-- renombrar un Bien despues no cambie retroactivamente entregas/remitos ya emitidos.
ALTER TABLE item_bien ADD COLUMN descripcion TEXT NOT NULL DEFAULT '';
ALTER TABLE item_bien ADD COLUMN peso_kg REAL NOT NULL DEFAULT 0;

-- Backfill best-effort para filas ya existentes: no tenemos el dato historico real,
-- así que usamos el valor actual del Bien como aproximacion.
UPDATE item_bien
SET descripcion = (SELECT descripcion FROM bien WHERE bien.id = item_bien.bien_id),
    peso_kg = (SELECT peso_kg FROM bien WHERE bien.id = item_bien.bien_id)
WHERE EXISTS (SELECT 1 FROM bien WHERE bien.id = item_bien.bien_id);
