import * as materiasService from "../services/materias.service.js";
import {
  validateMateriaId,
  validateCreateMateria,
  validatePatchMateria,
} from "../validators/materias.validator.js";
import { sendSuccess, sendNoContent } from "../utils/api-response.js";

/**
 * Obtiene la lista completa de materias del usuario autenticado.
 *
 * @async
 * @function listMaterias
 * @param {import('express').Request} request - Objeto de petición Express.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function listMaterias(request, response, next) {
  try {
    const materias = await materiasService.getAllMaterias(request.user.id);
    return sendSuccess(response, materias);
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtiene el detalle de una materia por su ID.
 *
 * @async
 * @function getMateria
 * @param {import('express').Request} request - Requiere request.params.id.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function getMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const materia = await materiasService.getMateriaById(id, request.user.id);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Crea una nueva materia en el sistema.
 *
 * @async
 * @function createMateria
 * @param {import('express').Request} request - Requiere request.body.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function createMateria(request, response, next) {
  try {
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.createMateria(request.user.id, payload);
    return sendSuccess(response, materia, 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * Reemplaza completamente los datos de una materia existente (PUT).
 *
 * @async
 * @function replaceMateria
 * @param {import('express').Request} request - Requiere request.params.id y request.body.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function replaceMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.replaceMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Actualiza parcialmente los campos de una materia (PATCH).
 *
 * @async
 * @function updateMateria
 * @param {import('express').Request} request - Requiere request.params.id y request.body.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function updateMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validatePatchMateria(request.body);
    const materia = await materiasService.updateMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Elimina una materia de la base de datos por su ID.
 *
 * @async
 * @function deleteMateria
 * @param {import('express').Request} request - Requiere request.params.id.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function deleteMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    await materiasService.removeMateria(id, request.user.id);
    return sendNoContent(response);
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtiene la lista de tareas asociadas a una materia específica.
 *
 * @async
 * @function listTareasByMateria
 * @param {import('express').Request} request - Requiere request.params.id.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function listTareasByMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const tareas = await materiasService.listTareasByMateria(id, request.user.id);
    return sendSuccess(response, tareas);
  } catch (error) {
    return next(error);
  }
}

/**
 * Obtiene la lista de eventos asociados a una materia específica.
 *
 * @async
 * @function listEventosByMateria
 * @param {import('express').Request} request - Requiere request.params.id.
 * @param {import('express').Response} response - Objeto de respuesta Express.
 * @param {import('express').NextFunction} next - Middleware para manejo de errores.
 * @returns {Promise<void>}
 */
export async function listEventosByMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const eventos = await materiasService.listEventosByMateria(id, request.user.id);
    return sendSuccess(response, eventos);
  } catch (error) {
    return next(error);
  }
}