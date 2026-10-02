# Skill de IA: Guía Estándar para Adicionar un Endpoint GET de Sub-recurso

## Objetivo
Instruir a la Inteligencia Artificial para que añada de forma automatizada y estructurada un nuevo endpoint de tipo `GET` que consulte sub-recursos asociados a un recurso principal (por ejemplo, obtener tareas o eventos por `materiaId`), respetando estrictamente la arquitectura en capas, las anotaciones JSDoc y la seguridad por ID de usuario (`userId`).

---

## Patrón de Arquitectura en Capas (Flujo de Datos)
Cada vez que se requiera crear un endpoint de este tipo, se deben modificar obligatoriamente 4 capas en orden descendente:

1. **Capa de Repositorio** (`src/repositories/`)
2. **Capa de Servicio** (`src/services/`)
3. **Capa de Controlador** (`src/controllers/`)
4. **Capa de Rutas** (`src/routes/`)

---

## Paso 1: Capa de Repositorio
* **Ubicación:** `src/repositories/materias.repositorio.js`
* **Propósito:** Ejecutar la consulta SQL utilizando un `INNER JOIN` con la tabla principal para garantizar el blindaje de seguridad mediante el `userId`.

### Plantilla de Código:
javascript
/**
 * Consulta en la base de datos los elementos secundarios asociados a una materia, blindados por el ID del usuario.
 *
 * @async
 * @function findEntidadesByMateriaId (o nombre específico)
 * @param {number|string} materiaId - ID de la materia principal.
 * @param {number|string} userId - ID del usuario autenticado.
 * @returns {Promise<Array<Object>>} Lista de registros obtenidos de la base de datos.
 */
export async function findEntidadesByMateriaId(materiaId, userId) {
  const [rows] = await pool.execute(
    `SELECT e.* 
     FROM nombre_tabla_hija e
     INNER JOIN materia m ON e.id_materia = m.id_materia
     WHERE e.id_materia = ? AND m.id_usuario = ?
     ORDER BY e.created_at DESC`,
    [materiaId, userId]
  );

  return rows;
}

## Paso 2: Capa de Servicio
Ubicación: src/services/materias.service.js
Propósito: Aplicar la regla de negocio validando primero que el recurso principal (la materia) exista y le pertenezca al usuario antes de consultar los sub-recursos.
/**
 * Obtiene los elementos de una materia, validando la propiedad mediante el userId.
 *
 * @async
 * @function getEntidadesByMateria
 * @param {number|string} materiaId - ID de la materia.
 * @param {number|string} userId - ID del usuario autenticado.
 * @returns {Promise<Array<Object>>} Lista de elementos asociados.
 * @throws {HttpError} Código 404 si la materia no existe o no pertenece al usuario.
 */
export async function getEntidadesByMateria(materiaId, userId) {
  const materia = await materiasRepository.findByIdAndUserId(materiaId, userId);
  
  if (!materia) {
    throw new HttpError(404, "NOT_FOUND", "La materia no existe o no tienes acceso a ella.");
  }

  return materiasRepository.findEntidadesByMateriaId(materiaId, userId);
}

## Paso 3: Capa de Controlador 
Ubicación: src/controllers/materias.controller.js
Propósito: Recibir la petición HTTP (request), extraer y validar el parámetro de la URL, invocar al servicio y retornar una respuesta exitosa mediante sendSuccess.
/**
 * Obtiene la lista de elementos asociados a una materia específica.
 *
 * @async
 * @function getEntidadesByMateria
 * @param {import('express').Request} request - Requiere `request.params.id` y `request.user.id`.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function getEntidadesByMateria(request, response, next) {
  try {
    const materiaId = validateMateriaId(request.params.id);
    const resultado = await materiasService.getEntidadesByMateria(materiaId, request.user.id);
    return sendSuccess(response, resultado);
  } catch (error) {
    return next(error);
  }
}

## Paso 4: Capa de Rutas
Ubicación: src/routes/materias.routes.js
Propósito: Exponer el endpoint bajo el prefijo RESTful adecuado incorporando el controlador importado.
// Importar la función del controlador junto a las demás:
import {
  // ... otros controladores ...
  getEntidadesByMateria,
} from "../controllers/materias.controller.js";

// Definir la ruta bajo el recurso principal:
router.get("/:id/entidades", getEntidadesByMateria);
