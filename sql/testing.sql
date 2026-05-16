-- ================================================================================
-- ÍNDICES
-- ================================================================================

USE mydb;

-- -----------------------------------------------------
-- 1. Test: CLIENTES (ALTA / MODIFICACIÓN / BAJA)
-- -----------------------------------------------------

-- Alta cliente
CALL sp_abm_cliente(
	'ALTA',
    999,
    'Test',
    'User',
    'Direccion 123',
    1
);

-- Alta duplicado (debe fallar)
-- CALL sp_abm_cliente(
--	'ALTA',
--  999,
--  'Juan',
--  'Perez',
--  'Calle 123',
--  1
-- );

-- Modificación cliente
CALL sp_abm_cliente(
	'MODIFICAR',
    999,
    'TestMod',
    'UserMod',
    'Nueva direccion',
    1
);

-- Modificar inexistente (debe fallar)
-- CALL sp_abm_cliente(
--     'MODIFICAR',
--     99999,
--     'No',
--     'Existe',
--     'NA',
--     1
-- );

-- Baja lógica (activo = 0)
CALL sp_abm_cliente(
	'BAJA',
    999,
    NULL,
    NULL,
    NULL,
    NULL
);

SELECT * FROM E01_CLIENTE WHERE nro_cliente = 999;

-- Baja nuevamente (debe fallar)
-- CALL sp_abm_cliente(
--     'BAJA',
--     999,
--     NULL,
--     NULL,
--     NULL,
--     NULL
-- );


-- Acción inválida (debe fallar)
-- CALL sp_abm_cliente(
--     'BORRAR',
--     999,
--     NULL,
--     NULL,
--     NULL,
--     NULL
-- );

-- -----------------------------------------------------
-- 2. Test: PRODUCTOS (ABM + CHECKS + TRIGGERS)
-- -----------------------------------------------------

-- Alta de producto
CALL sp_abm_producto (
	'ALTA',
	20412,
    'Corona',
    'Cerveza',
    'Corona 330cc',
    150,
    20
);

SELECT * FROM E01_PRODUCTO WHERE codigo_producto = 20412;

-- Alta duplicado (debe fallar)
-- CALL sp_abm_productos(
--     'ALTA',
--     20412,
--     'X',
--     'X',
--     'X',
--     10,
--     10
-- );

-- Modificación producto
CALL sp_abm_producto (
	'MODIFICAR',
    20412,
    'Corona',
    'Cerveza',
    'Corona Porron 330cc',
    300,
    20
);

-- Modificar inexistente (debe fallar)
-- CALL sp_abm_productos(
--     'MODIFICAR',
--     999,
--     'X',
--     'X',
--     'X',
--     10,
--     10
-- );

-- CHECK: precio negativo (debe fallar)
-- CALL sp_abm_productos(
--     'ALTA',
--     9991,
--     'Test',
--     'Test',
--     'Test',
--     -50,
--     10
-- );

-- CHECK: stock negativo (debe fallar)
-- CALL sp_abm_productos(
--     'ALTA',
--     9992,
--     'Test',
--     'Test',
--     'Test',
--     50,
--     -5
-- );

-- -----------------------------------------------------
-- 3. Test: Facturas (IVA + Check)
-- -----------------------------------------------------

-- Alta factura
INSERT INTO E01_FACTURA (
	nro_factura,
    fecha,
    total_sin_iva,
    iva,
    total_con_iva,
    nro_cliente
) VALUES (
	7001, CURDATE(), 100, 21, 121, 999
    );
    
SELECT * FROM E01_FACTURA WHERE nro_factura = 7001;

-- Factura con total negativo (Debe fallar)
-- INSERT INTO E01_FACTURA (
--    nro_factura,
--    fecha,
--    total_sin_iva,
--    iva,
--    total_con_iva,
--    nro_cliente
-- ) VALUES (
-- 7001, CURDATE(), -100, 21, -121, 999
--    );

-- -----------------------------------------------------
-- 4. Test: Detalle_Factura (Stock + FK + Check)
-- -----------------------------------------------------
    
-- Venta normal (descuenta stock)
INSERT INTO E01_DETALLE_FACTURA (
	nro_factura,
    nro_item,
    cantidad,
    codigo_producto
) VALUES (
	7001, 1, 2, 20412);
    
SELECT codigo_producto, stock
FROM E01_PRODUCTO
WHERE codigo_producto = 20412;
    
-- Check: Cantidad <= 0 (Debe fallar)
-- INSERT INTO E01_DETALLE_FACTURA (
-- 	   nro_factura,
--     nro_item,
--     cantidad,
--     codigo_producto
-- ) VALUES (
-- 	   7001, 2, 0, 20412);
    
-- Trigger: Stock insuficiente (Debe fallar)
-- INSERT INTO E01_DETALLE_fACTURA (
--    nro_factura,
--    nro_item,
--    cantidad,
--    codigo_producto
-- ) VALUES (
-- 	  7001, 3, 1000, 20412);
    
-- FK error: Producto inexistente (Debe fallar)
-- INSERT INTO E01_DETALLE_FACTURA (
-- 	   nro_factura,
--     nro_item,
--     cantidad,
--     codigo_producto
-- ) VALUES (
-- 	   7001, 4, 1, 9999);
    
-- -----------------------------------------------------
-- 4. Test: Vistas
-- -----------------------------------------------------

SELECT * FROM vw_facturas_ordenadas;

SELECT * FROM vw_productos_sin_facturar;
