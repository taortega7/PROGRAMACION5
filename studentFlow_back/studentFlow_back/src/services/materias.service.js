import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Valida que el código y el nombre de una materia sean únicos para un usuario.
 *
 * @async
 * @function ensureUniqueFields
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Objeto con las propiedades `codigo` y/o `nombre`.
 * @param {number|string} [excludeId] - ID opcional de la materia a excluir (usado en actualizaciones).
 * @returns {Promise<void>}
 * @throws {HttpError} Código 409 si el código o nombre ya están registrados.
 */
async function ensureUniqueFields(userId, materia, excludeId) {
  if (materia.codigo) {
    const duplicatedCode = await materiasRepository.existsByCode(userId, materia.codigo, excludeId);
    if (duplicatedCode) {
      throw new HttpError(409, "DUPLICATE_CODE", "Ya existe una materia con ese código.");
    }
  }

  if (materia.nombre) {
    const duplicatedName = await materiasRepository.existsByName(userId, materia.nombre, excludeId);
    if (duplicatedName) {
      throw new HttpError(409, "DUPLICATE_NAME", "Ya existe una materia con ese nombre.");
    }
  }
}

/**
 * Crea una materia verificando la no duplicidad de datos.
 *
 * @async
 * @function createMateria
 * @param {number|string} userId - ID del usuario propietario.
 * @param {Object} materia - Objeto con los datos de la materia a crear.
 * @returns {Promise<Object>} Promesa que resuelve con la materia creada.
 */
export async function createMateria(userId, materia) {
  await ensureUniqueFields(userId, materia);
  return materiasRepository.createMateria(userId, materia);
}

/**
 * Reemplaza completamente los datos de una materia.
 *
 * @async
 * @function replaceMateria
 * @param {number|string} id - ID de la materia a reemplazar.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Nuevos datos completos para la materia.
 * @returns {Promise<Object>} Promesa que resuelve con la materia reemplazada.
 */
export async function replaceMateria(id, userId, materia) {
  await materiasRepository.findByIdAndUserId(id, userId);
  await ensureUniqueFields(userId, materia, id);
  return materiasRepository.updateMateria(id, userId, materia);
}

/**
 * Actualiza de forma parcial los datos de una materia.
 *
 * @async
 * @function updateMateria
 * @param {number|string} id - ID de la materia a actualizar.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} partialMateria - Datos parciales a modificar.
 * @returns {Promise<Object>} Promesa que resuelve con la materia actualizada.
 */
export async function updateMateria(id, userId, partialMateria) {
  await materiasRepository.findByIdAndUserId(id, userId);
  await ensureUniqueFields(userId, partialMateria, id);
  return materiasRepository.patchMateria(id, userId, partialMateria);
}

/**
 * Elimina una materia validando previamente que exista y pertenezca al usuario.
 *
 * @async
 * @function removeMateria
 * @param {number|string} id - ID de la materia a eliminar.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<void>}
 */
export async function removeMateria(id, userId) {
  await materiasRepository.findByIdAndUserId(id, userId);
  await materiasRepository.deleteMateria(id, userId);
}

/**
 * Obtiene las tareas de una materia, garantizando mediante el userId que el usuario tiene permisos.
 *
 * @async
 * @function getTareasByMateria
 * @param {number|string} materiaId - ID de la materia.
 * @param {number|string} userId - ID del usuario autenticado.
 * @returns {Promise<Array<Object>>} Promesa que resuelve con la lista de tareas.
 */
export async function getTareasByMateria(materiaId, userId) {
  // 1. Validar explícitamente que la materia exista y le pertenezca a este usuario.
  // Reutilizamos la función del repositorio que ya tienes. Si no existe, lanzará error o retornará null.
  const materia = await materiasRepository.findByIdAndUserId(materiaId, userId);
  
  if (!materia) {
    throw new HttpError(404, "NOT_FOUND", "La materia no existe o no tienes acceso a ella.");
  }

  // 2. Si pasa el filtro de seguridad, buscamos las tareas.
  return materiasRepository.findTareasByMateriaId(materiaId, userId);
}