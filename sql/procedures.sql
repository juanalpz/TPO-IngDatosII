-- -----------------------------------------------------
-- Requerimiento 13
-- Implementar la funcionalidad que permita crear nuevos clientes, eliminar y modificar los ya existentes
-- -----------------------------------------------------

USE mydb;

drop procedure sp_abm_cliente;
drop procedure sp_abm_producto;

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
	DECLARE existe INT;
    DECLARE estado_actual TINYINT;
    
    SELECT COUNT(*)
    INTO existe
    FROM E01_CLIENTE
    WHERE nro_cliente = sp_nro_cliente;
    
    IF sp_accion IN ('MODIFICAR', 'BAJA') AND existe = 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '¡El cliente no existe!';
        
	ELSEIF sp_accion = 'ALTA' AND existe > 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '¡El cliente ya existe!';
        
	ELSE
		IF sp_accion = 'ALTA' THEN
			INSERT INTO E01_CLIENTE
			VALUES (sp_nro_cliente, sp_nombre, sp_apellido, sp_direccion, sp_activo);
            
		ELSEIF sp_accion = 'MODIFICAR' THEN
			UPDATE E01_CLIENTE
			SET
				nombre    = sp_nombre,
				apellido  = sp_apellido,
				direccion = sp_direccion,
				activo    = sp_activo
			WHERE nro_cliente = sp_nro_cliente;
            
		ELSEIF sp_accion = 'BAJA' THEN
			SELECT activo
			INTO estado_actual
			FROM E01_cliente
			WHERE nro_cliente = sp_nro_cliente;
                
			IF estado_actual = 0 THEN
				SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = '¡El cliente ya está inactivo!';
				
			ELSE
				UPDATE E01_CLIENTE
				SET activo = 0
				WHERE nro_cliente = sp_nro_cliente;
			END IF;
	
		ELSE
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = '¡Acción inválida!';
		END IF;
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
	DECLARE existe INT;
    
    SELECT COUNT(*)
    INTO existe
    FROM E01_PRODUCTO
    WHERE codigo_producto = sp_codigo_producto;
    
    IF sp_accion = 'MODIFICAR' AND existe = 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '¡El producto no existe!';
        
	ELSEIF sp_accion = 'ALTA' AND existe > 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '¡El producto ya existe!';
        
	ELSE
		IF sp_accion = 'ALTA' THEN
			INSERT INTO E01_PRODUCTO
			VALUES (sp_codigo_producto, sp_marca, sp_nombre, sp_descripcion, sp_precio, sp_stock);
            
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
	END IF;
END //

DELIMITER ;

