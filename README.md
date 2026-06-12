# 📦 Sistema de Gestión y Facturación - Ingeniería de Datos II

**Segunda Entrega - Trabajo Práctico Obligatorio**
Materia: "Ingeniería de datos II" | UADE - 1° Cuatrimestre 2026

## 👥 Integrantes
- Juana López
- Aron Lovey

---

## 🚀 Descripción del Proyecto
Este trabajo práctico consiste en el diseño e implementación de un sistema completo de facturación para la gestión de clientes, productos y ventas. 

Para esta **segunda entrega**, el sistema evolucionó hacia una **arquitectura políglota** con una interfaz gráfica funcional, permitiendo:
- **Gestión Maestra (MySQL):** Registrar clientes y gestionar el catálogo de productos con control de stock estricto usando *triggers* y *stored procedures*.
- **Gestión Documental (MongoDB):** Las facturas y sus detalles ahora se almacenan como documentos JSON en MongoDB, aprovechando su flexibilidad y velocidad para lecturas de historiales.
- **Interfaz Gráfica (Frontend):** Un panel visual interactivo y moderno para administrar toda la información de forma sencilla.

---

## 🛠 Tecnologías Utilizadas

**Bases de Datos:**
- 🐬 **MySQL 8.0**: Para datos estructurados y críticos (Clientes, Productos, Teléfonos).
- 🍃 **MongoDB**: Para el almacenamiento documental de las Facturas.

**Backend:**
- 🐍 **Python 3 / Flask**: API RESTful que orquesta la comunicación entre el frontend y ambas bases de datos.

**Frontend:**
- 🌐 **HTML5, CSS3, Vanilla JavaScript**: Interfaz minimalista, limpia y sin dependencias externas complejas.

---

## ⚙️ Cómo hacer funcionar el proyecto

### 1. Configurar las Bases de Datos
1. **MySQL:** Ejecutar el archivo `tpo.sql` en tu MySQL Workbench para crear el esquema, los stored procedures iniciales y cargar los datos de prueba.
2. **MongoDB:** Asegurate de tener MongoDB ejecutándose localmente en el puerto `27017`. La base de datos y colecciones se crearán automáticamente al emitir la primera factura.

### 2. Levantar el Backend (API)
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
# Instalar dependencias necesarias
pip install -r requirements.txt

# Iniciar el servidor Flask
python backend/app.py
```
*El servidor backend quedará escuchando peticiones en `http://localhost:5000`.*

### 3. Abrir el Frontend (Interfaz Visual)
Para visualizar y usar el sistema, **no necesitas levantar ningún servidor web ni subir el código a internet**. 
Simplemente navega a la carpeta `frontend/` y **haz doble clic en el archivo `index.html`** para abrirlo directamente en tu navegador (Chrome, Edge, Firefox, etc.). El frontend se conectará automáticamente al backend local.

---

## 🧠 Decisiones de Diseño de esta Entrega

- **Migración a MongoDB:** Decidimos migrar las tablas de `Facturas` y `DetalleFacturas` desde MySQL hacia MongoDB. En el código SQL (`tpo.sql`) hemos comentado la implementación original para que quede constancia del esquema relacional de la primera entrega, pero actualmente el sistema consolida los detalles de una venta en un único documento JSON en MongoDB, optimizando enormemente la estructura y velocidad de lectura.
- **Validaciones Híbridas:** La emisión de facturas (MongoDB) impacta y valida automáticamente el stock restante en la base de datos MySQL en tiempo real.
- **Cálculos en Tiempo Real:** El IVA del 21% y los totales se calculan dinámicamente al momento de la lectura y visualización, garantizando precisión sin persistir datos calculados innecesarios que puedan corromperse.
- **Experiencia de Usuario (UX):** Desarrollamos una interfaz estilo *Single-Page Application*, estructurada de manera "humana", con validaciones asíncronas, filtrados muy rápidos en memoria y notificaciones visuales emergentes (*toasts*) para que el usuario siempre sepa qué ocurrió.
