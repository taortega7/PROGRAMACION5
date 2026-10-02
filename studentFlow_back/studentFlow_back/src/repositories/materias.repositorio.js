import { pool } from "../config/database.js";

const sortableFields = {
  id: "m.id_materia",
  nombre: "m.nombre",
  codigo: "m.codigo",
  creditos: "m.creditos",
  color: "m.color",
  activa: "m.activa",
  createdAt: "m.created_at",
  updatedAt: "m.updated_at",
};

/**
 * Normaliza y mapea el campo de ordenamiento.
 *
 * @function normalizeSort
 * @param {string} sort - Campo a ordenar.
 * @param {string} order - Dirección del ordenamiento.
 * @returns {string}
 */
function normalizeSort(sort, order) {
  const column = sortableFields[sort] || sortableFields.nombre;
  const direction = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
  return `${column} ${direction}`;
}

/**
 * Mapea las columnas de MySQL al objeto de dominio.
 *
 * @function mapMateria
 * @param {Object} row - Fila cruda de MySQL.
 * @returns {Object}
 */
function mapMateria(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    codigo: row.codigo,
    creditos: row.creditos,
    color: row.color,
    activa: Boolean(row.activa),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Obtiene un listado paginado y filtrado de materias.
 *
 * @async
 * @function findAllByUserId
 * @param {number|string} userId - ID del usuario.
 * @param {Object} [filters={}] - Filtros de búsqueda.
 * @returns {Promise<Object>}
 */
export async function findAllByUserId(userId, filters = {}) {
  const conditions = ["m.id_usuario = ?"];
  const params = [userId];

  if (typeof filters.activa === "boolean") {
    conditions.push("m.activa = ?");
    params.push(filters.activa ? 1 : 0);
  }

  if (filters.search) {
    conditions.push("(m.nombre LIKE ? OR m.codigo LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM materia m
     WHERE ${conditions.join(" AND ")}`,
    params,
  );

  const orderBy = normalizeSort(filters.sort, filters.order);
  const limit = filters.limit || 20;
  const offset = ((filters.page || 1) - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT
      m.id_materia AS id,
      m.id_usuario AS userId,
      m.nombre,
      m.codigo,
      m.color,
      m.creditos,
      m.activa,
      m.created_at AS createdAt,
      m.updated_at AS updatedAt
    FROM materia m
    WHERE ${conditions.join(" AND ")}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  return {
    materias: rows.map(mapMateria),
    total: countRows[0].total,
  };
}

/**
 * Busca una materia específica por su ID.
 *
 * @async
 * @function findByIdAndUserId
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Object|null>}
 */
export async function findByIdAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
      m.id_materia AS id,
      m.id_usuario AS userId,
      m.nombre,
      m.codigo,
      m.color,
      m.creditos,
      m.activa,
      m.created_at AS createdAt,
      m.updated_at AS updatedAt
    FROM materia m
    WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId],
  );

  return rows[0] ? mapMateria(rows[0]) : null;
}

/**
 * Inserta un nuevo registro de materia.
 *
 * @async
 * @function createMateria
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Datos de la materia.
 * @returns {Promise<Object>}
 */
export async function createMateria(userId, materia) {
  const [result] = await pool.execute(
    `INSERT INTO materia (id_usuario, nombre, codigo, color, creditos, activa)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      materia.nombre,
      materia.codigo,
      materia.color,
      materia.creditos,
      materia.activa ? 1 : 0,
    ],
  );

  return findByIdAndUserId(result.insertId, userId);
}

/**
 * Realiza un reemplazo completo de los datos.
 *
 * @async
 * @function updateMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Nuevos datos.
 * @returns {Promise<Object>}
 */
export async function updateMateria(id, userId, materia) {
  await pool.execute(
    `UPDATE materia
     SET nombre = ?, codigo = ?, color = ?, creditos = ?, activa = ?
     WHERE id_materia = ? AND id_usuario = ?`,
    [
      materia.nombre,
      materia.codigo,
      materia.color,
      materia.creditos,
      materia.activa ? 1 : 0,
      id,
      userId,
    ],
  );

  return findByIdAndUserId(id, userId);
}

/**
 * Ejecuta una actualización parcial dinámicamente.
 *
 * @async
 * @function patchMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} partialMateria - Campos a actualizar.
 * @returns {Promise<Object>}
 */
export async function patchMateria(id, userId, partialMateria) {
  const fields = [];
  const params = [];

  if (partialMateria.nombre !== undefined) {
    fields.push("nombre = ?");
    params.push(partialMateria.nombre);
  }
  if (partialMateria.codigo !== undefined) {
    fields.push("codigo = ?");
    params.push(partialMateria.codigo);
  }
  if (partialMateria.color !== undefined) {
    fields.push("color = ?");
    params.push(partialMateria.color);
  }
  if (partialMateria.creditos !== undefined) {
    fields.push("creditos = ?");
    params.push(partialMateria.creditos);
  }
  if (partialMateria.activa !== undefined) {
    fields.push("activa = ?");
    params.push(partialMateria.activa ? 1 : 0);
  }

  if (fields.length === 0) {
    return findByIdAndUserId(id, userId);
  }

  params.push(id, userId);

  await pool.execute(
    `UPDATE materia
     SET ${fields.join(", ")}
     WHERE id_materia = ? AND id_usuario = ?`,
    params,
  );

  return findByIdAndUserId(id, userId);
}

/**
 * Elimina físicamente el registro.
 *
 * @async
 * @function deleteMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<boolean>}
 */
export async function deleteMateria(id, userId) {
  const [result] = await pool.execute(
    "DELETE FROM materia WHERE id_materia = ? AND id_usuario = ?",
    [id, userId],
  );

  return result.affectedRows > 0;
}

/**
 * Verifica existencia de código.
 *
 * @async
 * @function existsByCode
 * @param {number|string} userId - ID del usuario.
 * @param {string} codigo - Código.
 * @param {number|string} [excludeId] - ID a ignorar.
 * @returns {Promise<boolean>}
 */
export async function existsByCode(userId, codigo, excludeId) {
  const params = [userId, codigo];
  let sql = "SELECT 1 FROM materia WHERE id_usuario = ? AND codigo = ?";

  if (excludeId) {
    sql += " AND id_materia <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

/**
 * Verifica existencia de nombre.
 *
 * @async
 * @function existsByName
 * @param {number|string} userId - ID del usuario.
 * @param {string} nombre - Nombre.
 * @param {number|string} [excludeId] - ID a ignorar.
 * @returns {Promise<boolean>}
 */
export async function existsByName(userId, nombre, excludeId) {
  const params = [userId, nombre];
  let sql = "SELECT 1 FROM materia WHERE id_usuario = ? AND nombre = ?";

  if (excludeId) {
    sql += " AND id_materia <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

/**
 * Consulta las tareas asociadas a una materia y validadas por el ID de usuario.
 *
 * @async
 * @function findTareasByMateriaAndUserId
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array<Object>>}
 */
export async function findTareasByMateriaAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
       t.id_tarea AS id,
       t.id_materia AS materiaId,
       t.titulo,
       t.descripcion,
       t.fecha_entrega AS fechaEntrega,
       t.hora_entrega AS horaEntrega,
       t.prioridad,
       t.estado,
       t.carga_estimada_minutos AS cargaEstimadaMinutos,
       t.porcentaje_avance AS porcentajeAvance,
       t.created_at AS createdAt,
       t.updated_at AS updatedAt
     FROM tarea t
     INNER JOIN materia m ON m.id_materia = t.id_materia
     WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );
  return rows;
}

/**
 * Consulta los eventos asociados a una materia y validados por el ID de usuario.
 *
 * @async
 * @function findEventosByMateriaAndUserId
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array<Object>>}
 */
export async function findEventosByMateriaAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
       e.id_evento AS id,
       e.id_materia AS materiaId,
       e.titulo,
       e.descripcion,
       e.fecha,
       e.hora_inicio AS horaInicio,
       e.hora_fin AS horaFin,
       e.tipo,
       e.created_at AS createdAt,
       e.updated_at AS updatedAt
     FROM evento e
     INNER JOIN materia m ON m.id_materia = e.id_materia
     WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );
  return rows;
}