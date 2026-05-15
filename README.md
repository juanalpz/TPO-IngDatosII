# Sistema de Facturación - Ingeniería de Datos II
Trabajo Práctico Obligatorio correspondiente a la materia **"Ingeniería de datos II"**
UADE - 1° Cuatrimestre 2026

## Integrantes
- Juana López
- Aron Lovey

---

# Descripción del Proyecto
El proyecto consiste en el desarrollo de un sistema de facturación orientado a la gestión de:
- Clientes
- Teléfonos
- Productos
- Facturas
- Detalles de facturación

El sistema permite registrar compras realizadas por clientes, controlar el stock disponible de productos y calcular automáticamente los montos correspondientes incluyendo IVA.

Además, se implementaron distintos mecanismos de validación e integridad mediante:
- Constraints
- Triggers
- Procedimientos almacenados
- Índices
- Vistas

---

# Tecnologías Utilizadas

## Base de Datos
- MySQL 8.0

## Control de versiones
- Git
- Github

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

# Ejecución

## 1. Clonar repositorio
```bash
git clone https://github.com/juanalpz/TPO-IngDatosII.git
```

## 2. Ejecutar scripts SQL

Orden recomendado:
1. schema.sql
2. constraints.sql
3. indexes.sql
4. triggers.sql
5. procedures.sql
6. views.sql
7. load_data.sql
8. queries.sql

---
# Estado del Proyecto

En desarrollo
