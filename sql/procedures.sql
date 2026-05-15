-- -----------------------------------------------------
-- Requerimiento 13
-- Implementar la funcionalidad que permita crear nuevos clientes, eliminar y modificar los ya existentes
-- -----------------------------------------------------
DELIMITER // 

CREATE PROCEDURE sp_abm_cliente (
	IN sp_accion		VARCHAR(10),
    IN sp_nro_cliente	INT,
    IN sp_nombre		VARCHAR(45),
    IN sp_apellido		VARCHAR(45),
    IN sp_direccion		VARCHAR(45),
    IN sp_activo		TINYINT
)
BEGIN
	IF sp_accion = 'ALTA' THEN
		INSERT INTO E01_CLIENTE
		VALUES (
			sp_nro_cliente, 
			sp_nombre, 
			sp_apellido, 
			sp_direccion, 
			sp_activo
		);
            
	ELSEIF sp_accion = 'BAJA' THEN
		UPDATE E01_CLIENTE
		SET activo = 0
		WHERE nro_cliente = sp_nro_cliente;
            
	ELSEIF sp_accion = 'MODIFICAR' THEN
		UPDATE E01_CLIENTE
		SET
			nombre    = sp_nombre,
			apellido  = sp_apellido,
			direccion = sp_direccion,
			activo    = sp_activo
		WHERE nro_cliente = sp_nro_cliente;
	
	ELSE
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = '¡Acción inválida!';
	END IF;
END //
    
DELIMITER ;
    
-- -----------------------------------------------------
-- Requerimiento 14
-- Implementar la funcionalidad que permita crear nuevos productos y modificar los ya existentes. Tener en cuenta que el precio de un producto es sin IVA
-- -----------------------------------------------------
DELIMITER //

CREATE PROCEDURE sp_abm_producto (
	IN sp_accion			VARCHAR(10),
	IN sp_codigo_producto	INT,
    IN sp_marca				VARCHAR(45),
    IN sp_nombre			VARCHAR(45),
    IN sp_descripcion		VARCHAR(45),
	IN sp_precio			FLOAT,
    IN sp_stock				INT
)
BEGIN
	IF sp_accion = 'ALTA' THEN
		INSERT INTO E01_PRODUCTO
        VALUES (
			sp_codigo_producto, 
            sp_marca, 
            sp_nombre, 
            sp_descripcion, 
            sp_precio, 
            sp_stock
		);
	ELSEIF sp_accion = 'MODIFICAR' THEN
		UPDATE E01_PRODUCTO
        SET
			marca       = sp_marca,
            nombre      = sp_nombre,
            descripcion = sp_descripcion,
            precio      = sp_precio,
            stock       = sp_stock
		WHERE codigo_producto = sp_codigo_producto;
	
    ELSE
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = '¡Acción inválida!';
	END IF;
END //

DELIMITER ;

