// src/repositories/recordatorios.repository.js

import { pool } from '../config/database.js';

const mapRecordatorio = (row) => ({
    id: row.id_recordatorio,
    tareaId: row.id_tarea,
    mensaje: row.mensaje,
    fechaHora: row.fecha_hora,
    canal: row.canal,
    leido: Boolean(row.leido),
    createdAt: row.created_at
});

/**
 * LISTAR: solo recordatorios de tareas del usuario.
 */
export async function findAllByUserId(userId) {
    const [rows] = await pool.execute(
        `SELECT
            r.id_recordatorio,
            r.id_tarea,
            r.mensaje,
            r.fecha_hora,
            r.canal,
            r.leido,
            r.created_at
         FROM recordatorio AS r
         INNER JOIN tarea AS t
            ON t.id_tarea = r.id_tarea
         INNER JOIN materia AS m
            ON m.id_materia = t.id_materia
         WHERE m.id_usuario = ?
         ORDER BY r.fecha_hora ASC`,
        [userId]
    );

    return rows.map(mapRecordatorio);
}

/**
 * OBTENER POR ID: comprueba la propiedad del registro.
 */
export async function findByIdAndUserId(id, userId) {
    const [rows] = await pool.execute(
        `SELECT
            r.id_recordatorio,
            r.id_tarea,
            r.mensaje,
            r.fecha_hora,
            r.canal,
            r.leido,
            r.created_at
         FROM recordatorio AS r
         INNER JOIN tarea AS t
            ON t.id_tarea = r.id_tarea
         INNER JOIN materia AS m
            ON m.id_materia = t.id_materia
         WHERE r.id_recordatorio = ?
           AND m.id_usuario = ?
         LIMIT 1`,
        [id, userId]
    );

    return rows.length ? mapRecordatorio(rows[0]) : null;
}

/**
 * CREAR: valida la tarea e inserta únicamente en recordatorio.
 */
export async function create(
    tareaId,
    mensaje,
    fechaHora,
    canal,
    userId
) {
    // Comprobación previa solicitada.
    const [tareas] = await pool.execute(
        `SELECT t.id_tarea
         FROM tarea AS t
         INNER JOIN materia AS m
            ON m.id_materia = t.id_materia
         WHERE t.id_tarea = ?
           AND m.id_usuario = ?
         LIMIT 1`,
        [tareaId, userId]
    );

    if (tareas.length === 0) {
        const error = new Error(
            'La tarea no existe o no pertenece al usuario.'
        );
        error.code = 'UNAUTHORIZED_ACTION';
        throw error;
    }

    // Se vuelve a comprobar la propiedad en la operación de escritura.
    const [result] = await pool.execute(
        `INSERT INTO recordatorio (
            id_tarea,
            mensaje,
            fecha_hora,
            canal,
            leido,
            created_at
         )
         SELECT
            t.id_tarea,
            ?,
            ?,
            ?,
            FALSE,
            NOW()
         FROM tarea AS t
         INNER JOIN materia AS m
            ON m.id_materia = t.id_materia
         WHERE t.id_tarea = ?
           AND m.id_usuario = ?`,
        [mensaje, fechaHora, canal, tareaId, userId]
    );

    if (result.affectedRows !== 1) {
        const error = new Error(
            'No fue posible crear el recordatorio.'
        );
        error.code = 'UNAUTHORIZED_ACTION';
        throw error;
    }

    return result.insertId;
}

/**
 * ACTUALIZAR: solo modifica columnas de recordatorio.
 */
export async function update(
    id,
    mensaje,
    fechaHora,
    canal,
    userId
) {
    const [result] = await pool.execute(
        `UPDATE recordatorio AS r
         INNER JOIN tarea AS t
            ON t.id_tarea = r.id_tarea
         INNER JOIN materia AS m
            ON m.id_materia = t.id_materia
         SET
            r.mensaje = ?,
            r.fecha_hora = ?,
            r.canal = ?
         WHERE r.id_recordatorio = ?
           AND m.id_usuario = ?`,
        [mensaje, fechaHora, canal, id, userId]
    );

    if (result.affectedRows > 0) {
        return true;
    }

    // MySQL puede reportar cero cambios si los valores son idénticos.
    const existente = await findByIdAndUserId(id, userId);
    return existente !== null;
}

/**
 * ELIMINAR: solo borra de recordatorio.
 */
export async function remove(id, userId) {
    const [result] = await pool.execute(
        `DELETE r
         FROM recordatorio AS r
         INNER JOIN tarea AS t
            ON t.id_tarea = r.id_tarea
         INNER JOIN materia AS m
            ON m.id_materia = t.id_materia
         WHERE r.id_recordatorio = ?
           AND m.id_usuario = ?`,
        [id, userId]
    );

    return result.affectedRows > 0;
}