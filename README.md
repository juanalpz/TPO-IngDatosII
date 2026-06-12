# Sistema de Gestión y Facturación - Ingeniería de Datos II

**Trabajo Práctico Obligatorio**
Materia: "Ingeniería de datos II" | UADE - 1° Cuatrimestre 2026

## Integrantes
- Juana López
- Aron Lovey

---

## Descripción del Proyecto
Este trabajo práctico consiste en el diseño e implementación de un sistema completo de facturación para la gestión de clientes, productos y ventas. 

En esta segunda entrega, el sistema evoluciona hacia una **arquitectura políglota**, combinando enfoques de almacenamiento y procesamiento de datos:
- **MySQL (modelo relacional):** utilizado para la gestión de datos estructurados y críticos como clientes, productos, teléfonos y control de stock.
- **MongoDB (modelo documental):** utilizado para el almacenamiento de facturas y sus detalles, aprovechando su flexibilidad para representar documentos complejos.
- **API REST con Flask:** intermediario entre frontend y base de datos, encargado de la lógica de negocio.
- **Frontend web:** interfaz interactiva tipo panel de administración.

---

## Funcionalidades del sistema
El sistema permite:
- Registrar, modificar e inactivar clientes
- Gestionar productos con control de stock
- Generar facturas con cálculo automático de IVA (21%)
- Mantener integridad de datos mediante constraints, triggers y stored procedures
- Consultar información mediante queries y vistas
- Visualizar facturas históricas almacenadas en MongoDB
- Interacción completa mediante interfaz web

---

## Modelado de datos
# Entidades principales (MySQL)
- **Cliente:** información personal y estado del cliente
- **Teléfono:** múltiples contactos por cliente
- **Producto:** catálogo con stock y precios

# Entidades de facturación (MongoDB)
- **Factura (documento):**:
-- datos del cliente
-- ítems comprados
-- totales
-- IVA
-- fecha de emisión

---

## Relaciones principales
- Un cliente puede tener múltiples teléfonos
- Un client epuede tener múltiples facturas
- Una factura contiene múltiples productos (relación N:N resuelta en MongoDB como array de items)

---

## Tecnologías Utilizadas

**Bases de Datos:**
- MySQL 8.0
- MongoDB

**Backend:**
- Python 3
- Flask (API REST)

**Frontend:**
- HTML5
- CSS3
- JavaScript

---

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/juanalpz/TPO-IngDatosII.git
```

### 2. Configurar bases de datos
1. **MySQL:** El proyecto está modularizado en scripts independientes dentro de la carpeta:
```bash
/sql
```
Ejecutar los scripts en el siguiente orden:
1. schema.sql
2. constraints.sql
3. indexes.sql
4. triggers.sql
5. procedures.sql
6. views.sql
7. load_data.sql
8. queries.sql

2. **MongoDB:** Asegurarse de tener MongoDB ejecutándose en el puerto 27017. La base de datos y colección **facturas** se crearán automáticamente al emitir la primera factura.

3. **Levantar backend (Flask API):**
```bash
pip install -r requirements.txt
python backend/app.py
```

4. **Abrir frontend:**
- Abrir la carpeta **frontend/**
- Hacer doble clic en el archivo **index.html**
- Se abrirá una nueva ventana en el navegador

---

## Decisiones de diseño
- **Arquitectura modular:** El proyecto está dividido en scripts SQL independientes para facilitar mantenimiento, escalabilidad y orden.
- **Migración a MongoDB:** Las facturas fueron migradas desde modelo relacional hacia documentos JSON embebidos.
- **Separación de responsabilidades:**
-- MySQL: Datos estructurados y transaccionales.
-- MongoDB: Datos no estructurados y flexibilidad.
- **Integridad de datos:**
-- Stored procedures para ABM
-- Triggers para control de stock
-- Constraints para validaciones críticas
- **Cálculo dinámico de impuestos:** IVA calculado en tiempo real al generar la factura.
- **UX tipo SPA:**
-- Navegación fluida
-- Filtrado dinámico
-- Feedback visual en tiempo real

---

## Estado del proyecto
El proyecto se encuentra finalizado. Segunda entrega funcional completa.
