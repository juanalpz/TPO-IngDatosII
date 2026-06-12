"""
Script para migrar los datos de facturas y detalles desde CSV a MongoDB.
Lee los archivos CSV de la carpeta data/ y los agrupa como documentos MongoDB.
"""
import csv
import os
from pymongo import MongoClient
from config import Config

# Conexión a MongoDB
client = MongoClient(Config.MONGO_HOST, Config.MONGO_PORT)
db = client[Config.MONGO_DATABASE]
collection = db['facturas']

# Rutas a los CSV
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
FACTURA_CSV = os.path.join(DATA_DIR, 'e01_factura.csv')
DETALLE_CSV = os.path.join(DATA_DIR, 'e01_detalle_factura.csv')

def cargar_facturas():
    """Lee el CSV de facturas y devuelve un diccionario indexado por nro_factura."""
    facturas = {}
    with open(FACTURA_CSV, 'r', encoding='latin1') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            nro = int(row['nro_factura'])
            facturas[nro] = {
                'nro_factura': nro,
                'fecha': row['fecha'].strip(),
                'nro_cliente': int(row['nro_cliente']),
                'total_sin_iva': float(row['total_sin_iva']),
                'iva': float(row['iva']),
                'total_con_iva': float(row['total_con_iva']),
                'items': []
            }
    return facturas

def cargar_detalles(facturas):
    """Lee el CSV de detalles y los anida dentro de cada factura."""
    with open(DETALLE_CSV, 'r', encoding='latin1') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            nro_factura = int(row['nro_factura'])
            if nro_factura in facturas:
                facturas[nro_factura]['items'].append({
                    'nro_item': int(row['nro_item']),
                    'codigo_producto': int(row['codigo_producto']),
                    'cantidad': float(row['cantidad'])
                })
    return facturas

def migrar():
    print('Leyendo CSVs...')
    facturas = cargar_facturas()
    facturas = cargar_detalles(facturas)
    
    documentos = list(facturas.values())
    
    if len(documentos) == 0:
        print('No se encontraron facturas para migrar.')
        return
    
    # Limpiar colección existente
    collection.drop()
    
    # Insertar documentos
    collection.insert_many(documentos)
    print(f'Migración completa: {len(documentos)} facturas insertadas en MongoDB.')

if __name__ == '__main__':
    migrar()
