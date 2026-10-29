# StudentFlow - Backend (API RESTful)

Servicio Backend para la gestión académica de estudiantes (**StudentFlow**), desarrollado en Node.js y Express. Este proyecto implementa una arquitectura por capas estructurada (rutas, controladores, servicios, repositorios y validadores) conectada a una base de datos MySQL.

## 🚀 Tecnologías Utilizadas

* **Runtime:** Node.js
* **Framework Web:** Express.js
* **Base de Datos:** MySQL (a través del driver `mysql2/promise` con `pool.execute`)
* **Manejo de Variables de Entorno:** `dotenv`
* **Arquitectura:** Layered Architecture (Separación limpia de responsabilidades)

## 📁 Estructura del Proyecto

```text
src/
├── config/         # Configuración de base de datos (Pool MySQL)
├── controllers/    # Manejo de peticiones y respuestas HTTP
├── middlewares/    # Middlewares de error, contexto e inyección de usuario
├── repositories/   # Consultas SQL directas a la base de datos
├── routes/         # Definición de endpoints y enrutamiento
├── services/       # Lógica de negocio y reglas de dominio
├── utils/          # Helpers de respuesta API y gestión de HttpError
└── validators/     # Funciones de sanitización y validación de entrada
