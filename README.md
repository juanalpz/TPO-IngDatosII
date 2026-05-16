# Sistema de Facturación - Ingeniería de Datos II
Trabajo Práctico Obligatorio correspondiente a la materia **"Ingeniería de datos II"**
UADE - 1° Cuatrimestre 2026

## Integrantes
- Juana López
- Aron Lovey

---

# Descripción del Proyecto
Este trabajo práctico consiste en el diseño e implementación de un sistema de facturación para la gestión de clientes, productos y ventas.

El sistema permite:
- Registrar clientes y sus datos de contacto
- Gestionar productos con control de stock
- Generar facturas con cálculo de IVA
- Mantener integridad de los datos mediante constraints, triggers y procedimientos almacenados
- Consultar información mediante queries y vistas

---

# Modelo de datos

El sistema se basa en las siguientes entidades principales:
- **Cliente**: información personal y estado del cliente
- **Teléfono**: múltiples contactos por cliente
- **Producto**: catálogo con stock y precios
- **Factura**: cabecera de venta con totales e impuestos
- **DetalleFactura**: relación entre facturas y productos

Relaciones principales:
- Un cliente puede tener múltiples teléfonos
- Un cliente puede tener múltiples facturas
- Una factura cintiene múltiples productos (relación N:N resuelta con detalle)

---

# Tecnologías Utilizadas

- MySQL
- MySQL Workbench

---

# Estructura del Proyecto

```text
TPO-IngDatosII/
│
├── data/
│   └── *.csv
│
├── docs/
│   ├── DER.jpg
│   └── TRABAJO_PRACTICO_OBLIGATORIO_2026.pdf
│
├── sql/
│   ├── schema.sql
│   ├── load_data.sql
│   ├── queries.sql
│   ├── views.sql
│   ├── procedures.sql
│   ├── triggers.sql
│   ├── constraints.sql
│   └── indexes.sql
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

# Orden de Ejecución

## 1. Clonar repositorio
```bash
git clone https://github.com/juanalpz/TPO-IngDatosII.git
```

## 2. Ejecutar scripts SQL

Ejecutar los scripts en el siguiente orden:

1. schema.sql
2. constraints.sql
3. indexes.sql
4. triggers.sql
5. procedures.sql
6. views.sql
7. load_data.sql
8. queries.sql

---

# Decisiones de Diseño
- Se implementaron **constraints CHECK** para validar datos críticos (precio, stock, cantidades)
- Se utilizaron **triggers** para automatizar el control de stock y el cálculo de totales con IVA
- Se aplicaron **procedimientos almacenados** para centralizar operaciones de ABM
- Se incorporaron **índices** para mejorar el rendimiento de consultas frecuentes
- Se separó la lógica en scripts independientes para facilitar mantenimiento y lectura

# Estado del Proyecto

En desarrollo
