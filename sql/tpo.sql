-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`E01_CLIENTE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_CLIENTE` (
  `nro_cliente` INT NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido` VARCHAR(45) NOT NULL,
  `direccion` VARCHAR(45) NOT NULL,
  `activo` TINYINT NOT NULL,
  PRIMARY KEY (`nro_cliente`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`E01_TELEFONO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_TELEFONO` (
  `codigo_area` INT(3) NOT NULL,
  `nro_telefono` INT(7) NOT NULL,
  `tipo` CHAR(1) NOT NULL,
  `nro_cliente` INT NOT NULL,
  PRIMARY KEY (`codigo_area`, `nro_telefono`),
  INDEX `nro_cliente_idx` (`nro_cliente` ASC) VISIBLE,
  CONSTRAINT `nro_cliente`
    FOREIGN KEY (`nro_cliente`)
    REFERENCES `mydb`.`E01_CLIENTE` (`nro_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`E01_FACTURA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_FACTURA` (
  `nro_factura` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `total_sin_iva` DOUBLE NOT NULL,
  `iva` DOUBLE NOT NULL,
  `total_con_iva` DOUBLE NOT NULL,
  `nro_cliente` INT NOT NULL,
  PRIMARY KEY (`nro_factura`),
  INDEX `nro_cliente_idx` (`nro_cliente` ASC) VISIBLE,
  CONSTRAINT `nro_cliente2`
    FOREIGN KEY (`nro_cliente`)
    REFERENCES `mydb`.`E01_CLIENTE` (`nro_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`E01_PRODUCTO`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_PRODUCTO` (
  `codigo_producto` INT NOT NULL,
  `marca` VARCHAR(45) NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `descripcion` VARCHAR(45) NOT NULL,
  `precio` FLOAT NOT NULL,
  `stock` INT NOT NULL,
  PRIMARY KEY (`codigo_producto`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`E01_DETALLE_FACTURA`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_DETALLE_FACTURA` (
  `nro_factura` INT NOT NULL,
  `nro_item` INT NOT NULL,
  `cantidad` FLOAT NOT NULL,
  `codigo_producto` INT NOT NULL,
  PRIMARY KEY (`nro_factura`, `nro_item`),
  INDEX `codigo_producto_idx` (`codigo_producto` ASC) VISIBLE,
  CONSTRAINT `nro_factura`
    FOREIGN KEY (`nro_factura`)
    REFERENCES `mydb`.`E01_FACTURA` (`nro_factura`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `codigo_producto`
    FOREIGN KEY (`codigo_producto`)
    REFERENCES `mydb`.`E01_PRODUCTO` (`codigo_producto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- ------------------------------------------------------------------------------------------------------------------------------------------ --
-- Carga de datos usando  LOAD DATA INFILE
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_cliente.csv'
INTO TABLE E01_CLIENTE
CHARACTER SET latin1
FIELDS TERMINATED BY ";"
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_telefono.csv'
INTO TABLE E01_TELEFONO
CHARACTER SET latin1
FIELDS TERMINATED BY ";"
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_detalle_factura.csv'
INTO TABLE E01_DETALLE_FACTURA
CHARACTER SET latin1
FIELDS TERMINATED BY ";"
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_factura.csv'
INTO TABLE E01_FACTURA
CHARACTER SET latin1
FIELDS TERMINATED BY ";"
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_producto.csv'
INTO TABLE E01_PRODUCTO
CHARACTER SET latin1
FIELDS TERMINATED BY ";"
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

SHOW VARIABLES LIKE 'secure_file_priv';
-- ------------------------------------------------------------------------------------------------------------------------------------------

-- 1. Obtener los datos de los clientes junto con sus teléfonos
SELECT C.*, CONCAT(T.codigo_area, " ", T.nro_telefono) AS telefono
FROM E01_CLIENTE C
INNER JOIN E01_TELEFONO T
ON C.nro_cliente = T.nro_cliente;

-- 2. Obtener el/los teléfono/s y el número de cliente del cliente con nombre
-- "Jacob" y apellido "Cooper"
SELECT C.nro_cliente, T.nro_telefono
FROM E01_CLIENTE C
JOIN E01_TELEFONO T
ON C.nro_cliente = T.nro_cliente
WHERE C.nombre = "Jacob" AND C.apellido = "Cooper";

-- 3. Mostrar cada teléfono junto con los datos del cliente.
SELECT CONCAT(T.codigo_area, " ", T.nro_telefono) AS telefono, C.*
FROM E01_TELEFONO T
INNER JOIN E01_CLIENTE C
ON T.nro_cliente = C.nro_cliente;

-- 4. Obtener todos los clientes que tengan registrada al menos una factura
SELECT * FROM E01_CLIENTE C
WHERE EXISTS (
	SELECT 1
	FROM E01_FACTURA
    WHERE nro_cliente = C.nro_cliente
);

-- 5. Identificar todos los clientes que NO tengan registrada ninguna factura
SELECT * FROM E01_CLIENTE C
WHERE NOT EXISTS (
	SELECT 1
	FROM E01_FACTURA
    WHERE nro_cliente = C.nro_cliente
);

-- 6. Devolver todos los clientes, con la cantidad de facturas que tienen
-- registradas (si no tienen considerar cantidad en 0)
SELECT C.nro_cliente, COUNT(F.nro_cliente) AS cant_facturas
FROM E01_CLIENTE C
LEFT JOIN E01_FACTURA F ON C.nro_cliente = F.nro_cliente
GROUP BY nro_cliente;

-- 7. Listar los datos de todas las facturas que hayan sido compradas por el cliente
-- de nombre "Kai" y apellido "Bullock"
SELECT * FROM E01_FACTURA F
WHERE F.nro_cliente IN (
	SELECT C.nro_cliente
    FROM E01_CLIENTE C
    WHERE C.nombre = "Kai" AND C.apellido = "Bullock"
    );
    
-- 8. Seleccionar los productos que han sido facturados al menos 1 vez
SELECT * FROM E01_PRODUCTO P 
WHERE EXISTS (
	SELECT 1
    FROM E01_DETALLE_FACTURA D
    WHERE D.codigo_producto = P.codigo_producto
    );
    
-- 9. Listar los datos de todas las facturas que contengan productos de las
-- marcas "Ipsum"
SELECT * FROM E01_DETALLE_FACTURA D
WHERE D.codigo_producto IN (
	SELECT P.codigo_producto
	FROM E01_PRODUCTO P
    WHERE P.marca LIKE '%Ipsum%'
    );
    
-- 10. Mostrar nombre y apellido de cada cliente junto con lo que gastó
-- en total, con IVA incluido
SELECT C.nombre, C.apellido, ROUND(SUM(F.total_con_iva),2) AS total_gastado
FROM E01_CLIENTE C
INNER JOIN E01_FACTURA F
ON C.nro_cliente = F.nro_cliente
GROUP BY C.nombre, C.apellido;

-- 11. Se necesita una vista que devuelva los datos de las facturas ordenadas
-- for fecha
-- CREATE VIEW vw_facturas_ordenadas AS
SELECT * FROM E01_FACTURA F
ORDER BY fecha;

-- 12. Se necesita una vista que devuelva todos los productos que aún no han
-- sido facturados
-- CREATE VIEW vw_productos_sin_facturar AS
SELECT * FROM E01_PRODUCTO P 
WHERE NOT EXISTS (
	SELECT 1
    FROM E01_DETALLE_FACTURA D
    WHERE D.codigo_producto = P.codigo_producto
    );
    
-- 13. Implementar la funcionalidad que permita crear nuevos clientes, eliminar y
-- modificar los ya existentes

-- Asumo que:
-- - Es un solo procedimiento que tiene que hacer las 3 cosas
-- - Hay que borrar al cliente de la db y no pasarlo a inactivo
-- - No se puede modificar el nro_cliente de un cliente

DELIMITER // 

CREATE PROCEDURE sp_abm_cliente (
	IN sp_accion VARCHAR(10),
    IN sp_nro_cliente INT,
    IN sp_nombre VARCHAR(45),
    IN sp_apellido VARCHAR(45),
    IN sp_direccion VARCHAR(45),
    IN sp_activo TINYINT
    )
    BEGIN
		IF sp_accion = 'ALTA' THEN
			INSERT INTO E01_CLIENTE
            VALUES (sp_nro_cliente, sp_nombre, sp_apellido, sp_direccion, sp_activo);
            
		ELSEIF sp_accion = 'BAJA' THEN
			DELETE FROM E01_CLIENTE
            WHERE nro_cliente = sp_nro_cliente;
            
		ELSE
			UPDATE E01_CLIENTE
            SET
				nombre = sp_nombre,
                apellido = sp_apellido,
                direccion = sp_direccion,
                activo = sp_activo
			WHERE nro_cliente = sp_nro_cliente;
		END IF;
    END //
    
    DELIMITER ;
    
-- 14. Implementar la funcionalidad que permita crear nuevos productos y modificar los ya
-- existentes. Tener en cuenta que el precio de un producto es sin IVA

DELIMITER //
CREATE PROCEDURE sp_am_productos (
	IN sp_accion VARCHAR(10),
	IN sp_codigo_producto INT,
    IN sp_marca VARCHAR(45),
    IN sp_nombre VARCHAR(45),
    IN sp_descripcion VARCHAR(45),
	IN sp_precio FLOAT,
    IN stock INT
)
BEGIN
	IF sp_accion = 'ALTA' THEN
		INSERT INTO E01_PRODUCTO
        VALUES (sp_codigo_producto, sp_marca, sp_nombre, sp_descripcion, sp_precio, sp_stock);
	ELSE
		UPDATE E01_PRODUCTO
        SET
			marca = sp_marca,
            nombre = sp_nombre,
            descripcion = sp_descripcion,
            precio = sp_precio,
            stock = sp_stock
		WHERE codigo_producto = sp_codigo_producto;
	END IF;
END //
DELIMITER ;






