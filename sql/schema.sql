-- ================================================================================
-- CREACIÓN DE TABLAS
-- Usando MySQL Workbench Forward Engineering
-- ================================================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Tabla: E01_CLIENTE
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_CLIENTE` (
  `nro_cliente`		INT NOT NULL,
  `nombre`			VARCHAR(45) NOT NULL,
  `apellido`		VARCHAR(45) NOT NULL,
  `direccion`		VARCHAR(45) NOT NULL,
  `activo`			TINYINT NOT NULL,
  
  PRIMARY KEY (`nro_cliente`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla: E01_TELEFONO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_TELEFONO` (
  `codigo_area`		INT(3) NOT NULL,
  `nro_telefono`	INT(7) NOT NULL,
  `tipo`			CHAR(1) NOT NULL,
  `nro_cliente`		INT NOT NULL,
  
  PRIMARY KEY (`codigo_area`, `nro_telefono`),
  INDEX `nro_cliente_idx` (`nro_cliente` ASC) VISIBLE,
  CONSTRAINT `nro_cliente`
    FOREIGN KEY (`nro_cliente`)
    REFERENCES `mydb`.`E01_CLIENTE` (`nro_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla: E01_FACTURA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_FACTURA` (
  `nro_factura`		INT NOT NULL,
  `fecha`			DATE NOT NULL,
  `total_sin_iva`	DOUBLE NOT NULL,
  `iva`				DOUBLE NOT NULL,
  `total_con_iva`	DOUBLE NOT NULL,
  `nro_cliente`		INT NOT NULL,
  
  PRIMARY KEY (`nro_factura`),
  INDEX `nro_cliente_idx` (`nro_cliente` ASC) VISIBLE,
  CONSTRAINT `nro_cliente2`
    FOREIGN KEY (`nro_cliente`)
    REFERENCES `mydb`.`E01_CLIENTE` (`nro_cliente`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla: E01_PRODUCTO
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_PRODUCTO` (
  `codigo_producto`		INT NOT NULL,
  `marca`				VARCHAR(45) NOT NULL,
  `nombre`				VARCHAR(45) NOT NULL,
  `descripcion`			VARCHAR(45) NOT NULL,
  `precio`				FLOAT NOT NULL,
  `stock`				INT NOT NULL,
  
  PRIMARY KEY (`codigo_producto`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla: E01_DETALLE_FACTURA
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`E01_DETALLE_FACTURA` (
  `nro_factura`			INT NOT NULL,
  `nro_item`			INT NOT NULL,
  `cantidad`			FLOAT NOT NULL,
  `codigo_producto`		INT NOT NULL,
  
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
