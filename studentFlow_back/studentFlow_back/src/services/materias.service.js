import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Valida que el código y el nombre de una materia sean únicos para un usuario.
 *
 * @async
 * @function ensureUniqueFields
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Objeto de materia a verificar.
 * @param {number|string} [excludeId] - ID opcional a excluir.
 * @returns {Promise<void>}
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
 * Obtiene todas las materias de un usuario.
 *
 * @async
 * @function getAllMaterias
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Object>}
 */
export async function getAllMaterias(userId) {
  return materiasRepository.findAllByUserId(userId);
}

/**
 * Obtiene una materia por su ID.
 *
 * @async
 * @function getMateriaById
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Object>}
 */
export async function getMateriaById(id, userId) {
  const materia = await materiasRepository.findByIdAndUserId(id, userId);
  if (!materia) {
    throw new HttpError(404, "NOT_FOUND", "Materia no encontrada");
  }
  return materia;
}

/**
 * Crea una nueva materia.
 *
 * @async
 * @function createMateria
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Datos de la materia.
 * @returns {Promise<Object>}
 */
export async function createMateria(userId, materia) {
  await ensureUniqueFields(userId, materia);
  return materiasRepository.createMateria(userId, materia);
}

/**
 * Reemplaza una materia existente.
 *
 * @async
 * @function replaceMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Nuevos datos de la materia.
 * @returns {Promise<Object>}
 */
export async function replaceMateria(id, userId, materia) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, materia, id);
  return materiasRepository.updateMateria(id, userId, materia);
}

/**
 * Actualiza parcialmente una materia.
 *
 * @async
 * @function updateMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} partialMateria - Datos parciales.
 * @returns {Promise<Object>}
 */
export async function updateMateria(id, userId, partialMateria) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, partialMateria, id);
  return materiasRepository.patchMateria(id, userId, partialMateria);
}

/**
 * Elimina una materia.
 *
 * @async
 * @function removeMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<void>}
 */
export async function removeMateria(id, userId) {
  await getMateriaById(id, userId);
  await materiasRepository.deleteMateria(id, userId);
}

/**
 * Obtiene las tareas de una materia.
 *
 * @async
 * @function listTareasByMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array<Object>>}
 */
export async function listTareasByMateria(id, userId) {
  return materiasRepository.findTareasByMateriaAndUserId(id, userId);
}

/**
 * Obtiene los eventos de una materia.
 *
 * @async
 * @function listEventosByMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array<Object>>}
 */
export async function listEventosByMateria(id, userId) {
  return materiasRepository.findEventosByMateriaAndUserId(id, userId);
}