// src/controllers/recordatorios.controller.js

import * as recordatoriosService from '../services/recordatorios.service.js';

/**
 * GET /recordatorios
 */
export async function listar(req, res, next) {
    try {
        const userId = req.user.id;

        const recordatorios = await recordatoriosService.listar(
            userId
        );

        return res.status(200).json(recordatorios);
    } catch (error) {
        return next(error);
    }
}

/**
 * GET /recordatorios/:id
 */
export async function obtenerPorId(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const recordatorio =
            await recordatoriosService.obtenerPorId(
                id,
                userId
            );

        return res.status(200).json(recordatorio);
    } catch (error) {
        return next(error);
    }
}

/**
 * POST /recordatorios
 */
export async function crear(req, res, next) {
    try {
        const {
            tareaId,
            mensaje,
            fechaHora,
            canal
        } = req.body;

        const userId = req.user.id;

        const nuevoRecordatorio =
            await recordatoriosService.crear(
                {
                    tareaId,
                    mensaje,
                    fechaHora,
                    canal
                },
                userId
            );

        return res.status(201).json(nuevoRecordatorio);
    } catch (error) {
        return next(error);
    }
}

/**
 * PUT /recordatorios/:id
 */
export async function actualizar(req, res, next) {
    try {
        const { id } = req.params;

        const {
            mensaje,
            fechaHora,
            canal
        } = req.body;

        const userId = req.user.id;

        const recordatorioActualizado =
            await recordatoriosService.actualizar(
                id,
                {
                    mensaje,
                    fechaHora,
                    canal
                },
                userId
            );

        return res.status(200).json(
            recordatorioActualizado
        );
    } catch (error) {
        return next(error);
    }
}

/**
 * DELETE /recordatorios/:id
 */
export async function eliminar(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await recordatoriosService.eliminar(id, userId);

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}