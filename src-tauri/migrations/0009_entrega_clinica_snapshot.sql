-- Mismo problema que 0008 pero del lado de la clínica: si editás la razón
-- social o la condición de IVA de una clínica despues de una entrega, el
-- remito viejo no debería cambiar retroactivamente. Congelamos los dos
-- campos que el remito realmente muestra (no cuit, que ya es inmutable;
-- no direccion/localidad, que no se imprimen en el remito preimpreso).
ALTER TABLE entrega ADD COLUMN clinica_razon_social TEXT NOT NULL DEFAULT '';
ALTER TABLE entrega ADD COLUMN clinica_condicion_iva TEXT NOT NULL DEFAULT 'responsable_inscripto';

UPDATE entrega
SET clinica_razon_social = (SELECT razon_social FROM clinica WHERE clinica.id = entrega.clinica_id),
    clinica_condicion_iva = (SELECT condicion_iva FROM clinica WHERE clinica.id = entrega.clinica_id)
WHERE EXISTS (SELECT 1 FROM clinica WHERE clinica.id = entrega.clinica_id);
