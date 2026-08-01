UPDATE bien SET categoria_nutricional = 'cereales' WHERE categoria_nutricional = 'conservas' AND descripcion LIKE '%ARROZ%';
UPDATE bien SET categoria_nutricional = 'aceites' WHERE categoria_nutricional = 'conservas' AND descripcion LIKE '%ACEITE%';
UPDATE bien SET categoria_nutricional = 'azucares' WHERE categoria_nutricional = 'conservas' AND descripcion LIKE '%AZUCAR%';
UPDATE bien SET categoria_nutricional = 'harinas' WHERE categoria_nutricional = 'conservas' AND descripcion LIKE '%FIDEO%';
UPDATE bien SET categoria_nutricional = 'lacteos' WHERE categoria_nutricional = 'conservas' AND descripcion LIKE '%LECHE%';

-- cualquier resto que no matcheo ninguna regla anterior: placeholder valido, a corregir a mano
UPDATE bien SET categoria_nutricional = 'cereales' WHERE categoria_nutricional = 'conservas';
