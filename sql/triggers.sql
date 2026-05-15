-- ================================================================================
-- TRIGGERS
-- ================================================================================

-- -----------------------------------------------------
-- Trigger 1
-- Validar stock disponible
-- -----------------------------------------------------
DELIMITER //

CREATE TRIGGER tr_control_stock
BEFORE INSERT ON E01_DETALLE_FACTURA
FOR EACH ROW
BEGIN
	DECLARE stock_actual INT;
    
    SELECT stock 
    INTO stock_actual
    FROM E01_PRODUCTO
    WHERE codigo_producto = NEW.codigo_producto;
    
    IF stock_actual < NEW.cantidad THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = '¡Stock insuficiente!';
	END IF;
END //

DELIMITER ;

-- -----------------------------------------------------
-- Trigger 2
-- Descontar stock
-- -----------------------------------------------------
DELIMITER //

CREATE TRIGGER tr_actualizar_stock
AFTER INSERT ON E01_DETALLE_FACTURA
FOR EACH ROW
BEGIN
	UPDATE E01_PRODUCTO
    SET stock = stock - NEW.cantidad
    WHERE codigo_producto = NEW.codigo_producto;
END //

DELIMITER ;

-- -----------------------------------------------------
-- Trigger 3
-- Calcular total con IVA
-- -----------------------------------------------------
DELIMITER //

CREATE TRIGGER tr_total_factura
BEFORE INSERT ON E01_FACTURA
FOR EACH ROW
BEGIN
	SET NEW.total_con_iva = NEW.total_sin_iva + NEW.iva;
END //

DELIMITER ;
