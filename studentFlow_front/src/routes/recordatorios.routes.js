import { Router } from 'express';

import * as recordatoriosController from '../controllers/recordatorios.controller.js';

import {
    validarCreacion,
    validarActualizacion
} from '../validators/recordatorios.validator.js';

const router = Router();

// Listar los recordatorios del usuario autenticado.
router.get('/', recordatoriosController.listar);

// Obtener un recordatorio por ID.
router.get('/:id', recordatoriosController.obtenerPorId);

// Crear un recordatorio.
router.post(
    '/',
    validarCreacion,
    recordatoriosController.crear
);

// Actualizar un recordatorio.
router.put(
    '/:id',
    validarActualizacion,
    recordatoriosController.actualizar
);

// Eliminar un recordatorio.
router.delete(
    '/:id',
    recordatoriosController.eliminar
);

export default router;