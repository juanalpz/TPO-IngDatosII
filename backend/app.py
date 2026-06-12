"""
Módulo Principal de la API (app.py)
-----------------------------------
Este script implementa el backend del sistema de gestión (Clientes, Productos y Facturas).
Utiliza Flask para exponer endpoints RESTful, conectándose a MySQL para los datos maestros 
y a MongoDB para almacenar los documentos de las facturas emitidas.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from config import Config
from pymongo import MongoClient
from datetime import datetime

from pprint import pprint


app = Flask(__name__)
CORS(app)

# ==============================================================================
# Configuración de Base de Datos
# ==============================================================================

# Conexión a MongoDB (para almacenar documentos JSON de facturas)
mongo_client = MongoClient(Config.MONGO_HOST, Config.MONGO_PORT)
mongo_db = mongo_client[Config.MONGO_DATABASE]
facturas_collection = mongo_db['facturas']

def get_db_connection():
    """
    Establece y devuelve una conexión a la base de datos MySQL.
    Utiliza los parámetros definidos en el archivo config.py.
    """
    return mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DATABASE,
        port=Config.MYSQL_PORT
    )

def handle_db_error(e):
    """
    Maneja los errores capturados de MySQL y los formatea como respuesta JSON.
    Especialmente útil para capturar errores SIGNAL lanzados desde los Stored Procedures.
    """
    message = e.msg if hasattr(e, 'msg') else str(e)
    return jsonify({
        "status": "error",
        "message": message
    }), 400

# ==============================================================================
# Endpoints de Clientes
# ==============================================================================

@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    """
    Obtiene la lista de clientes.
    Si se envía el parámetro '?activo=1', devuelve solo los clientes activos.
    Si se envía '?activo=0', devuelve los inactivos. Por defecto devuelve todos.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        activo_param = request.args.get('activo')
        if activo_param is not None:
            if int(activo_param) > 0:
                cursor.execute("SELECT * FROM E01_CLIENTE WHERE activo > 0")
            else:
                cursor.execute("SELECT * FROM E01_CLIENTE WHERE activo = 0")
        else:
            cursor.execute("SELECT * FROM E01_CLIENTE")
            
        rows = cursor.fetchall()
        return jsonify({
            "status": "success",
            "data": rows
        }), 200
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/clientes/<int:nro_cliente>', methods=['GET'])
def get_cliente(nro_cliente):
    """
    Obtiene los datos de un cliente específico según su número de cliente.
    Retorna error 404 si el cliente no existe.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM E01_CLIENTE WHERE nro_cliente = %s", (nro_cliente,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"status": "error", "message": "El cliente no existe."}), 404
        return jsonify({
            "status": "success",
            "data": row
        }), 200
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/clientes', methods=['POST'])
def alta_cliente():
    """
    Registra un nuevo cliente en la base de datos llamando al stored procedure correspondiente.
    """
    data = request.get_json()
    
    # Validaciones básicas de parámetros
    nro_cliente = data.get('nro_cliente')
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    direccion = data.get('direccion')
    activo = data.get('activo', 1)  # Por defecto activo = 1 (ALTA)

    if not all([nro_cliente, nombre, apellido, direccion]):
        return jsonify({"status": "error", "message": "Faltan parámetros requeridos."}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Llamada al stored procedure sp_abm_cliente
        # Parámetros: sp_accion, sp_nro_cliente, sp_nombre, sp_apellido, sp_direccion, sp_activo
        cursor.callproc('sp_abm_cliente', ('ALTA', int(nro_cliente), nombre, apellido, direccion, int(activo)))
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Cliente registrado exitosamente."
        }), 201
        
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/clientes/<int:nro_cliente>', methods=['PUT'])
def modificar_cliente(nro_cliente):
    """
    Modifica los datos de un cliente existente.
    """
    data = request.get_json()
    
    nombre = data.get('nombre')
    apellido = data.get('apellido')
    direccion = data.get('direccion')
    activo = data.get('activo', 1)

    if not all([nombre, apellido, direccion]):
        return jsonify({"status": "error", "message": "Faltan parámetros requeridos."}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Llamada al stored procedure sp_abm_cliente con acción MODIFICAR
        cursor.callproc('sp_abm_cliente', ('MODIFICAR', nro_cliente, nombre, apellido, direccion, int(activo)))
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Cliente modificado exitosamente."
        }), 200
        
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/clientes/<int:nro_cliente>', methods=['DELETE'])
def baja_cliente(nro_cliente):
    """
    Realiza una baja lógica del cliente (cambia su estado a inactivo)
    sin eliminar el registro físico de la base de datos.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Llamada al stored procedure sp_abm_cliente con acción BAJA
        # Pasamos strings vacíos y activo=0 ya que BAJA no modifica estos campos pero el procedure los requiere de firma
        cursor.callproc('sp_abm_cliente', ('BAJA', nro_cliente, '', '', '', 0))
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Cliente dado de baja (inactivado) exitosamente."
        }), 200
        
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# ==============================================================================
# Endpoints de Productos
# ==============================================================================

@app.route('/api/productos/<int:codigo_producto>', methods=['GET'])
def get_producto(codigo_producto):
    """
    Obtiene la información de un producto específico mediante su código.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM E01_PRODUCTO WHERE codigo_producto = %s", (codigo_producto,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"status": "error", "message": "El producto no existe."}), 404
        return jsonify({
            "status": "success",
            "data": row
        }), 200
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/productos', methods=['GET'])
def get_productos():
    """
    Obtiene la lista de todos los productos.
    Soporta búsqueda por nombre, marca o código enviando el parámetro '?search=...'.
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        search = request.args.get('search', '')
        if search:
            cursor.execute(
                "SELECT * FROM E01_PRODUCTO WHERE nombre LIKE %s OR marca LIKE %s OR CAST(codigo_producto AS CHAR) LIKE %s",
                (f"%{search}%", f"%{search}%", f"%{search}%")
            )
        else:
            cursor.execute("SELECT * FROM E01_PRODUCTO")
            
        rows = cursor.fetchall()
        return jsonify({
            "status": "success",
            "data": rows
        }), 200
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/productos', methods=['POST'])
def alta_producto():
    """
    Carga un producto nuevo a la base de datos llamando al stored procedure 'sp_abm_producto'.
    """
    data = request.get_json()
    
    codigo_producto = data.get('codigo_producto')
    marca = data.get('marca')
    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    precio = data.get('precio')
    stock = data.get('stock')

    if not all([codigo_producto, marca, nombre, descripcion, precio is not None, stock is not None]):
        return jsonify({"status": "error", "message": "Faltan parámetros requeridos."}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Llamada al stored procedure sp_abm_producto
        # Parámetros: sp_accion, sp_codigo_producto, sp_marca, sp_nombre, sp_descripcion, sp_precio, sp_stock
        cursor.callproc('sp_abm_producto', ('ALTA', int(codigo_producto), marca, nombre, descripcion, float(precio), int(stock)))
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Producto registrado exitosamente."
        }), 201
        
    except Error as e:
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@app.route('/api/productos/<int:codigo_producto>', methods=['PUT'])
def modificar_producto(codigo_producto):
    """
    Modifica los datos de un producto (como precio, stock, descripción).
    """
    data = request.get_json()
    
    marca = data.get('marca')
    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    precio = data.get('precio')
    stock = data.get('stock')

    if not all([marca, nombre, descripcion, precio is not None, stock is not None]):
        return jsonify({"status": "error", "message": "Faltan parámetros requeridos."}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Llamada al stored procedure sp_abm_producto con acción MODIFICAR
        cursor.callproc('sp_abm_producto', ('MODIFICAR', codigo_producto, marca, nombre, descripcion, float(precio), int(stock)))
        conn.commit()
        
        return jsonify({
            "status": "success",
            "message": "Producto modificado exitosamente."
        }), 200
        
    except Error as e:
        print("ERROR MYSQL:", e)
        return handle_db_error(e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# ==============================================================================
# Endpoints de Facturas (MongoDB)
# ==============================================================================

@app.route('/api/facturas', methods=['POST'])
def emitir_factura():
    """
    Emite una nueva factura. Este proceso realiza dos acciones importantes:
    1. Descuenta el stock de los productos vendidos en MySQL.
    2. Guarda el documento final de la factura en MongoDB para su persistencia.
    """
    data = request.get_json()
    
    nro_factura = data.get('nro_factura')
    nro_cliente = data.get('nro_cliente')
    items = data.get('items', [])

    if not all([nro_factura, nro_cliente]) or not isinstance(items, list) or len(items) == 0:
        return jsonify({"status": "error", "message": "Datos inválidos"}), 400

    if facturas_collection.find_one({"nro_factura": int(nro_factura)}):
        return jsonify({"status": "error", "message": "Factura ya existe"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT nombre, apellido FROM E01_CLIENTE WHERE nro_cliente=%s AND activo>0",
            (int(nro_cliente),)
        )
        cliente = cursor.fetchone()

        if not cliente:
            return jsonify({"status": "error", "message": "Cliente inválido"}), 400

        items_factura = []
        total_sin_iva = 0

        for i, item in enumerate(items):

            try:
                codigo_producto = int(item["codigo_producto"])
                cantidad = int(item["cantidad"])
            except:
                return jsonify({"status": "error", "message": f"Ítem {i+1} inválido"}), 400

            cursor.execute("""
                SELECT codigo_producto, nombre, marca, precio
                FROM E01_PRODUCTO
                WHERE codigo_producto = %s
            """, (codigo_producto,))

            producto = cursor.fetchone()

            if not producto:
                return jsonify({"status": "error", "message": f"Producto {codigo_producto} no existe"}), 400

            cursor.callproc('sp_descontar_stock', (codigo_producto, cantidad))

            subtotal = float(producto["precio"]) * cantidad
            total_sin_iva += subtotal

            items_factura.append({
                "codigo_producto": codigo_producto,
                "nombre_producto": producto["nombre"],
                "marca": producto["marca"],
                "precio_unitario": float(producto["precio"]),
                "cantidad": cantidad,
                "subtotal": round(subtotal, 2)
            })

        iva = round(total_sin_iva * 0.21, 2)

        factura_doc = {
            "nro_factura": int(nro_factura),
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "nro_cliente": int(nro_cliente),
            "nombre_cliente": f"{cliente['nombre']} {cliente['apellido']}",
            "items": items_factura,
            "total_sin_iva": round(total_sin_iva, 2),
            "iva": iva,
            "total_con_iva": round(total_sin_iva + iva, 2)
        }

        facturas_collection.insert_one(factura_doc)
        conn.commit()

        return jsonify({"status": "success"}), 201

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


@app.route('/api/facturas', methods=['GET'])
def listar_facturas():
    """
    Devuelve las facturas emitidas, ordenadas por fecha (de la más nueva a la más antigua).
    Opcionalmente, se pueden filtrar por número de cliente.
    """
    nro_cliente = request.args.get('nro_cliente')
    
    query = {}
    if nro_cliente:
        query['nro_cliente'] = int(nro_cliente)
    
    facturas = list(facturas_collection.find(query, {'_id': 0}).sort('fecha', -1))
    
    # Obtener todos los productos de MySQL para enriquecer facturas eficientemente
    conn = None
    productos_dict = {}
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT codigo_producto, nombre, marca, precio FROM E01_PRODUCTO")
        for row in cursor.fetchall():
            productos_dict[int(row['codigo_producto'])] = row
    except Exception as e:
        print("Error al obtener productos para completar facturas:", e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

    # Enriquecer cada factura
    for f in facturas:
        total_sin_iva = 0
        for item in f.get('items', []):
            cod = int(item.get('codigo_producto', 0))
            prod = productos_dict.get(cod)
            if prod:
                if 'nombre_producto' not in item or not item['nombre_producto']:
                    item['nombre_producto'] = prod['nombre']
                if 'marca' not in item or not item['marca']:
                    item['marca'] = prod['marca']
                if 'precio_unitario' not in item or item['precio_unitario'] is None:
                    item['precio_unitario'] = float(prod['precio'])
                
                cant = float(item.get('cantidad', 0))
                subtotal = float(item['precio_unitario']) * cant
                item['subtotal'] = round(subtotal, 2)
            else:
                if 'nombre_producto' not in item:
                    item['nombre_producto'] = 'SIN NOMBRE'
                if 'marca' not in item:
                    item['marca'] = 'SIN MARCA'
                if 'precio_unitario' not in item:
                    item['precio_unitario'] = 0.0
                cant = float(item.get('cantidad', 0))
                subtotal = float(item['precio_unitario']) * cant
                item['subtotal'] = round(subtotal, 2)
            
            total_sin_iva += item['subtotal']
        
        # Si la factura no tenía totales o estaban en cero, los recalculamos
        if 'total_sin_iva' not in f or f['total_sin_iva'] is None or f['total_sin_iva'] == 0:
            f['total_sin_iva'] = round(total_sin_iva, 2)
            f['iva'] = round(total_sin_iva * 0.21, 2)
            f['total_con_iva'] = round(f['total_sin_iva'] + f['iva'], 2)
        else:
            f['total_sin_iva'] = round(f['total_sin_iva'], 2)
            f['iva'] = round(f['iva'], 2)
            f['total_con_iva'] = round(f['total_con_iva'], 2)
            
    return jsonify({
        "status": "success",
        "data": facturas
    }), 200


@app.route('/api/facturas/<int:nro_factura>', methods=['GET'])
def get_factura(nro_factura):
    """
    Busca una factura por su número en MongoDB y la devuelve enriquecida
    con los datos actuales de los productos en MySQL.
    """
    factura = facturas_collection.find_one({"nro_factura": nro_factura}, {'_id': 0})
    
    if not factura:
        return jsonify({"status": "error", "message": "La factura no existe."}), 404
    
    # Obtener productos de MySQL para enriquecer la factura
    conn = None
    productos_dict = {}
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT codigo_producto, nombre, marca, precio FROM E01_PRODUCTO")
        for row in cursor.fetchall():
            productos_dict[int(row['codigo_producto'])] = row
    except Exception as e:
        print("Error al obtener productos para completar factura:", e)
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

    # Enriquecer la factura
    total_sin_iva = 0
    for item in factura.get('items', []):
        cod = int(item.get('codigo_producto', 0))
        prod = productos_dict.get(cod)
        if prod:
            if 'nombre_producto' not in item or not item['nombre_producto']:
                item['nombre_producto'] = prod['nombre']
            if 'marca' not in item or not item['marca']:
                item['marca'] = prod['marca']
            if 'precio_unitario' not in item or item['precio_unitario'] is None:
                item['precio_unitario'] = float(prod['precio'])
            
            cant = float(item.get('cantidad', 0))
            subtotal = float(item['precio_unitario']) * cant
            item['subtotal'] = round(subtotal, 2)
        else:
            if 'nombre_producto' not in item:
                item['nombre_producto'] = 'SIN NOMBRE'
            if 'marca' not in item:
                item['marca'] = 'SIN MARCA'
            if 'precio_unitario' not in item:
                item['precio_unitario'] = 0.0
            cant = float(item.get('cantidad', 0))
            subtotal = float(item['precio_unitario']) * cant
            item['subtotal'] = round(subtotal, 2)
        
        total_sin_iva += item['subtotal']
        
    if 'total_sin_iva' not in factura or factura['total_sin_iva'] is None or factura['total_sin_iva'] == 0:
        factura['total_sin_iva'] = round(total_sin_iva, 2)
        factura['iva'] = round(total_sin_iva * 0.21, 2)
        factura['total_con_iva'] = round(factura['total_sin_iva'] + factura['iva'], 2)
    else:
        factura['total_sin_iva'] = round(factura['total_sin_iva'], 2)
        factura['iva'] = round(factura['iva'], 2)
        factura['total_con_iva'] = round(factura['total_con_iva'], 2)
    
    return jsonify({
        "status": "success",
        "data": factura
    }), 200

if __name__ == '__main__':
    # Ejecutar en el puerto 5000 en modo debug local
    app.run(host='127.0.0.1', port=5000, debug=True)
