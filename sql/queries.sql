-- ================================================================================
-- QUERIES
-- ================================================================================

USE mydb;

-- -----------------------------------------------------
-- Requerimiento 1
-- Obtener los datos de los clientes junto con sus teléfonos
-- -----------------------------------------------------
SELECT C.*, CONCAT(T.codigo_area, " ", T.nro_telefono) AS telefono
FROM E01_CLIENTE C
INNER JOIN E01_TELEFONO T
ON C.nro_cliente = T.nro_cliente;

-- -----------------------------------------------------
-- Requerimiento 2
-- Obtener el/los teléfono/s y el número de cliente del cliente con nombre "Jacob" y apellido "Cooper"
-- -----------------------------------------------------
SELECT C.nro_cliente, T.nro_telefono
FROM E01_CLIENTE C
JOIN E01_TELEFONO T
ON C.nro_cliente = T.nro_cliente
WHERE C.nombre = "Jacob" 
AND C.apellido = "Cooper";

-- -----------------------------------------------------
-- Requerimiento 3
-- Mostrar cada teléfono junto con los datos del cliente
-- -----------------------------------------------------
SELECT CONCAT(T.codigo_area, " ", T.nro_telefono) AS telefono, C.*
FROM E01_TELEFONO T
INNER JOIN E01_CLIENTE C
ON T.nro_cliente = C.nro_cliente;

-- -----------------------------------------------------
-- Requerimiento 4
-- Obtener todos los clientes que tengan registrada al menos una factura
-- -----------------------------------------------------
SELECT * FROM E01_CLIENTE C
WHERE EXISTS (
	SELECT 1
	FROM E01_FACTURA
    WHERE nro_cliente = C.nro_cliente
);

-- -----------------------------------------------------
-- Requerimiento 5
-- Identificar todos los clientes que NO tengan registrada ninguna factura
-- -----------------------------------------------------
SELECT * FROM E01_CLIENTE C
WHERE NOT EXISTS (
	SELECT 1
	FROM E01_FACTURA
    WHERE nro_cliente = C.nro_cliente
);

-- -----------------------------------------------------
-- Requerimiento 6
-- Devolver todos los clientes, con la cantidad de facturas que tienen registradas (si no tienen considerar cantidad en 0)
-- -----------------------------------------------------
SELECT C.*, COUNT(F.nro_cliente) AS cant_facturas
FROM E01_CLIENTE C
LEFT JOIN E01_FACTURA F 
ON C.nro_cliente = F.nro_cliente
GROUP BY C.nro_cliente;

-- -----------------------------------------------------
-- Requerimiento 7
-- Listar los datos de todas las facturas que hayan sido compradas por el cliente de nombre "Kai" y apellido "Bullock"
-- -----------------------------------------------------
SELECT * FROM E01_FACTURA F
WHERE F.nro_cliente IN (
	SELECT C.nro_cliente
    FROM E01_CLIENTE C
    WHERE C.nombre = "Kai" 
    AND C.apellido = "Bullock"
    );
    
-- -----------------------------------------------------
-- Requerimiento 8
-- Seleccionar los productos que han sido facturados al menos 1 vez
-- -----------------------------------------------------
SELECT * FROM E01_PRODUCTO P 
WHERE EXISTS (
	SELECT 1
    FROM E01_DETALLE_FACTURA D
    WHERE D.codigo_producto = P.codigo_producto
    );
    
-- -----------------------------------------------------
-- Requerimiento 9
-- Listar los datos de todas las facturas que contengan productos de las marcas "Ipsum"
-- -----------------------------------------------------
SELECT DISTINCT F.*
FROM E01_FACTURA F
INNER JOIN E01_DETALLE_FACTURA D
ON F.nro_factura = D.nro_factura
INNER JOIN E01_PRODUCTO P
ON D.codigo_producto = P.codigo_producto
WHERE P.marca LIKE '%Ipsum%';
    
-- -----------------------------------------------------
-- Requerimiento 10
-- Mostrar nombre y apellido de cada cliente junto con lo que gastó en total, con IVA incluido
-- -----------------------------------------------------
SELECT C.nombre, C.apellido, ROUND(SUM(F.total_con_iva),2) AS total_gastado
FROM E01_CLIENTE C
INNER JOIN E01_FACTURA F
ON C.nro_cliente = F.nro_cliente
GROUP BY C.nro_cliente, C.nombre, C.apellido;
