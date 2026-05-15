-- -----------------------------------------------------
-- Requerimiento 11
-- Se necesita una vista que devuelva los datos de las facturas ordenadas por fecha
-- -----------------------------------------------------

USE mydb;

CREATE VIEW vw_facturas_ordenadas AS
SELECT * FROM E01_FACTURA F
ORDER BY fecha;

-- -----------------------------------------------------
-- Requerimiento 12
-- Se necesita una vista que devuelva todos los productos que aún no han sido facturados
-- -----------------------------------------------------
CREATE VIEW vw_productos_sin_facturar AS
SELECT * FROM E01_PRODUCTO P 
WHERE NOT EXISTS (
	SELECT 1
    FROM E01_DETALLE_FACTURA D
    WHERE D.codigo_producto = P.codigo_producto
);
