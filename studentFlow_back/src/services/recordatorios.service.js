// src/services/recordatorios.service.js

import * as recordatoriosRepository from '../repositories/recordatorios.repository.js';
import { HttpError } from '../utils/http-error.js';

/**
 * LISTAR RECORDATORIOS
 */
export async function listar(userId) {
    return recordatoriosRepository.findAllByUserId(userId);
}

/**
 * OBTENER UN RECORDATORIO
 */
export async function obtenerPorId(id, userId) {
    const recordatorio =
        await recordatoriosRepository.findByIdAndUserId(
            id,
            userId
        );

    if (!recordatorio) {
        throw new HttpError(
            'Recordatorio no encontrado o no tienes permisos.',
            404
        );
    }

    return recordatorio;
}

/**
 * CREAR UN RECORDATORIO
 */
export async function crear(datos, userId) {
    let insertId;

    try {
        insertId = await recordatoriosRepository.create(
            datos.tareaId,
            datos.mensaje,
            datos.fechaHora,
            datos.canal,
            userId
        );
    } catch (error) {
        if (error.code === 'UNAUTHORIZED_ACTION') {
            throw new HttpError(
                'No tienes permisos para asignar recordatorios a esta tarea.',
                403
            );
        }

        // Los errores inesperados se delegan al middleware global.
        throw error;
    }

    // Consultamos el recurso creado mediante una consulta
    // que también valida la propiedad del usuario.
    const recordatorio =
        await recordatoriosRepository.findByIdAndUserId(
            insertId,
            userId
        );

    if (!recordatorio) {
        throw new HttpError(
            'El recordatorio fue creado, pero no se pudo recuperar.',
            500
        );
    }

    return recordatorio;
}

/**
 * ACTUALIZAR UN RECORDATORIO
 */
export async function actualizar(id, datos, userId) {
    const actualizado = await recordatoriosRepository.update(
        id,
        datos.mensaje,
        datos.fechaHora,
        datos.canal,
        userId
    );

    if (!actualizado) {
        throw new HttpError(
            'Recordatorio no encontrado o no tienes permisos para modificarlo.',
            404
        );
    }

    // Devolvemos la representación actual del registro.
    return obtenerPorId(id, userId);
}

/**
 * ELIMINAR UN RECORDATORIO
 */
export async function eliminar(id, userId) {
    const eliminado = await recordatoriosRepository.remove(
        id,
        userId
    );

    if (!eliminado) {
        throw new HttpError(
            'Recordatorio no encontrado o no tienes permisos para eliminarlo.',
            404
        );
    }

    return true;
}