import os

class Config:
    # Configuración de MySQL
    # Se leen variables de entorno o se usan valores por defecto para entorno local
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'aronlovey3112!')
    MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'mydb')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))

    # Configuración de MongoDB
    MONGO_HOST = os.environ.get('MONGO_HOST', 'localhost')
    MONGO_PORT = int(os.environ.get('MONGO_PORT', 27017))
    MONGO_DATABASE = os.environ.get('MONGO_DATABASE', 'facturas')
