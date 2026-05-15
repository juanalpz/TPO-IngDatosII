-- ================================================================================
-- CARGA DE DATOS
-- Usando LOAD DATA INFILE
-- ================================================================================

-- IMPORTANTE:
-- Los archivos CSV deben ubicarse en la carpeta permitida por secure_file_priv

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_cliente.csv'
INTO TABLE E01_CLIENTE
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

LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/e01_factura.csv'
INTO TABLE E01_FACTURA
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
