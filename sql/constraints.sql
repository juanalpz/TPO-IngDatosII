-- ================================================================================
-- CHECK CONSTRAINTS
-- ================================================================================

USE mydb;

-- -----------------------------------------------------
-- Check 1
-- Verificar precio no negativo
-- -----------------------------------------------------
ALTER TABLE E01_PRODUCTO
ADD CONSTRAINT chk_producto_precio
CHECK (precio >= 0);

-- -----------------------------------------------------
-- Check 2
-- Verificar stock no negativo
-- -----------------------------------------------------
ALTER TABLE E01_PRODUCTO
ADD CONSTRAINT chk_producto_stock
CHECK (stock >= 0);

-- -----------------------------------------------------
-- Check 3
-- Verificar cantidad mayor a 0
-- -----------------------------------------------------
ALTER TABLE E01_DETALLE_FACTURA
ADD CONSTRAINT chk_detalle_cantidad
CHECK (cantidad > 0);

-- -----------------------------------------------------
-- Check 4
-- Verificar totales no negativos
-- -----------------------------------------------------
ALTER TABLE E01_FACTURA
ADD CONSTRAINT chk_factura_total
CHECK ( total_sin_iva >= 0 AND total_con_iva >= 0);
