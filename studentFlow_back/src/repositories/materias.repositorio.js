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
 * Normaliza y mapea el campo y dirección de ordenamiento para la consulta SQL.
 *
 * @function normalizeSort
 * @param {string} sort - Campo por el cual se desea ordenar.
 * @param {string} order - Dirección del ordenamiento ('asc' o 'desc').
 * @returns {string} Fragmento SQL de ordenamiento sanitizado (ej. "m.nombre ASC").
 */
function normalizeSort(sort, order) {
  const column = sortableFields[sort] || sortableFields.nombre;
  const direction = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";

  return `${column} ${direction}`;
}

/**
 * Mapea las columnas de la base de datos a un objeto de dominio formateado en JavaScript.
 *
 * @function mapMateria
 * @param {Object} row - Fila obtenida directamente de la consulta MySQL.
 * @returns {Object} Objeto materia con nombres de claves camelCase y tipos casteados.
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
 * Obtiene un listado paginado y filtrado de materias asociadas a un usuario.
 *
 * @async
 * @function findAllByUserId
 * @param {number|string} userId - ID del usuario dueño de las materias.
 * @param {Object} [filters={}] - Opciones de filtrado, ordenamiento y paginación.
 * @param {boolean} [filters.activa] - Filtro opcional por estado activo/inactivo.
 * @param {string} [filters.search] - Término de búsqueda para coincidencia en nombre o código.
 * @param {string} [filters.sort] - Campo por el cual ordenar los resultados.
 * @param {string} [filters.order] - Dirección del ordenamiento ('asc' o 'desc').
 * @param {number} [filters.limit=10] - Cantidad de registros a retornar por página.
 * @param {number} [filters.page=1] - Número de página actual.
 * @returns {Promise<{materias: Array<Object>, total: number}>} Lista de materias mapeadas y el conteo total de registros.
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
  const limit = filters.limit;
  const offset = (filters.page - 1) * limit;

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
 * Busca una materia específica por su ID y por el ID de usuario propietario.
 *
 * @async
 * @function findByIdAndUserId
 * @param {number|string} id - ID de la materia a consultar.
 * @param {number|string} userId - ID del usuario autenticado.
 * @returns {Promise<Object|null>} Promesa que resuelve con la materia formateada o `null` si no existe.
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
 * Inserta un nuevo registro de materia en la base de datos.
 *
 * @async
 * @function createMateria
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Objeto con los datos de la materia (nombre, codigo, color, creditos, activa).
 * @returns {Promise<Object>} Objeto de la materia recién creada obtenido vía `findByIdAndUserId`.
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
 * Realiza un reemplazo completo (UPDATE) de los datos de una materia.
 *
 * @async
 * @function updateMateria
 * @param {number|string} id - ID de la materia a actualizar.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Objeto con los datos completos actualizados.
 * @returns {Promise<Object>} Objeto de la materia actualizada.
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
 * Ejecuta una actualización parcial dinámicamente según los campos provistos.
 *
 * @async
 * @function patchMateria
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} partialMateria - Objeto con los campos específicos a actualizar.
 * @returns {Promise<Object>} Objeto de la materia tras aplicar los cambios.
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
 * Elimina físicamente el registro de una materia de la base de datos.
 *
 * @async
 * @function deleteMateria
 * @param {number|string} id - ID de la materia a eliminar.
 * @param {number|string} userId - ID del usuario dueño de la materia.
 * @returns {Promise<boolean>} Retorna `true` si la fila fue eliminada exitosamente.
 */
export async function deleteMateria(id, userId) {
  const [result] = await pool.execute(
    "DELETE FROM materia WHERE id_materia = ? AND id_usuario = ?",
    [id, userId],
  );

  return result.affectedRows > 0;
}

/**
 * Verifica si un código de materia ya existe en la base de datos para determinado usuario.
 *
 * @async
 * @function existsByCode
 * @param {number|string} userId - ID del usuario.
 * @param {string} codigo - Código de la materia a verificar.
 * @param {number|string} [excludeId] - ID opcional de materia a ignorar en la verificación.
 * @returns {Promise<boolean>} Retorna `true` si ya existe un registro con ese código.
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
 * Verifica si un nombre de materia ya existe en la base de datos para determinado usuario.
 *
 * @async
 * @function existsByName
 * @param {number|string} userId - ID del usuario.
 * @param {string} nombre - Nombre de la materia a verificar.
 * @param {number|string} [excludeId] - ID opcional de materia a ignorar en la verificación.
 * @returns {Promise<boolean>} Retorna `true` si ya existe un registro con ese nombre.
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
 * Consulta en la base de datos las tareas asociadas a una materia, blindadas por el ID del usuario.
 *
 * @async
 * @function findTareasByMateriaId
 * @param {number|string} materiaId - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array<Object>>} Lista de tareas crudas de la base de datos.
 */
export async function findTareasByMateriaId(materiaId, userId) {
  const [rows] = await pool.execute(
    `SELECT t.* 
     FROM tarea t
     INNER JOIN materia m ON t.id_materia = m.id_materia
     WHERE t.id_materia = ? AND m.id_usuario = ?
     ORDER BY t.created_at DESC`,
    [materiaId, userId],
  );

  // Si tienes una función mapTarea(row) similar a mapMateria, úsala aquí: rows.map(mapTarea)
  return rows;
}

/**
 * Consulta en la base de datos los eventos asociados a una materia, blindados por el ID del usuario.
 *
 * @async
 * @function findEventosByMateriaAndUserId
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array<Object>>} Lista de eventos asociados a la materia.
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
    [id, userId],
  );

  return rows;
}
