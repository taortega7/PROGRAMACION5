import { HttpError } from "../utils/http-error.js";

/**
 * Convierte y valida un valor recibido a un tipo booleano.
 *
 * @function parseBoolean
 * @param {*} value - Valor a evaluar (booleano, string "true"/"false" o indefinido).
 * @returns {boolean|undefined} Retorna `true`, `false` o `undefined` si no se envió el valor.
 * @throws {HttpError} Código 422 si el valor no corresponde a un booleano válido.
 */
function parseBoolean(value) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new HttpError(
    422,
    "VALIDATION_ERROR",
    "El filtro 'activa' debe ser true o false.",
  );
}

/**
 * Valida y convierte un valor a un número entero entero positivo o cero.
 *
 * @function parsePositiveInteger
 * @param {*} value - Valor numérico o string a parsear.
 * @param {string} fieldName - Nombre del campo para personalizar el mensaje de error.
 * @returns {number|null} Retorna el entero parseado o `null` si el valor es vacío.
 * @throws {HttpError} Código 422 si no es un número entero mayor o igual a cero.
 */
function parsePositiveInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      `El campo '${fieldName}' debe ser un entero positivo o cero.`,
    );
  }

  return parsed;
}

/**
 * Valida que una cadena de texto no esté vacía y la remueve de espacios innecesarios.
 *
 * @function normalizeString
 * @param {*} value - Cadena de texto a validar.
 * @param {string} fieldName - Nombre del campo para el mensaje de error.
 * @returns {string} Texto sin espacios a los extremos.
 * @throws {HttpError} Código 422 si el campo no es string o está vacío.
 */
function normalizeString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      `El campo '${fieldName}' es obligatorio.`,
    );
  }

  return value.trim();
}

/**
 * Valida que un string tenga un formato de color hexadecimal de 6 dígitos (#RRGGBB).
 *
 * @function validateColor
 * @param {string} color - Código de color a evaluar.
 * @returns {void}
 * @throws {HttpError} Código 422 si el formato no coincide con el patrón hexadecimal.
 */
function validateColor(color) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "El campo 'color' debe tener formato hexadecimal #RRGGBB.",
    );
  }
}

/**
 * Valida y sanitiza los parámetros de consulta (query params) para el listado paginado de materias.
 *
 * @function validateMateriaListQuery
 * @param {Object} query - Objeto de consulta recibido de la petición HTTP (`req.query`).
 * @param {*} [query.page] - Número de página deseada.
 * @param {*} [query.limit] - Límite de elementos por página.
 * @param {*} [query.activa] - Filtro de estado activo.
 * @param {string} [query.search] - Término de búsqueda.
 * @param {string} [query.sort] - Campo de ordenamiento.
 * @param {string} [query.order] - Dirección de orden ('asc' o 'desc').
 * @returns {{activa: boolean|undefined, search: string, sort: *, order: *, page: number, limit: number}} Objeto con los parámetros parseados y validados.
 * @throws {HttpError} Código 422 si `page` o `limit` están fuera de los rangos válidos.
 */
export function validateMateriaListQuery(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  if (!Number.isInteger(page) || page < 1) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "El parámetro 'page' debe ser un entero mayor o igual a 1.",
    );
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "El parámetro 'limit' debe ser un entero entre 1 y 100.",
    );
  }

  return {
    activa: parseBoolean(query.activa),
    search: typeof query.search === "string" ? query.search.trim() : "",
    sort: query.sort,
    order: query.order,
    page,
    limit,
  };
}

/**
 * Valida que el identificador numérico de la materia recibido en la URL sea un número positivo válido.
 *
 * @function validateMateriaId
 * @param {string|number} id - Parámetro `id` extraído de `req.params`.
 * @returns {number} ID validado como número entero positivo.
 * @throws {HttpError} Código 400 si el ID no es un número entero mayor o igual a 1.
 */
export function validateMateriaId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId < 1) {
    throw new HttpError(
      400,
      "INVALID_ID",
      "El identificador de materia no es válido.",
    );
  }

  return parsedId;
}

/**
 * Valida la estructura y tipos de datos del cuerpo de la petición para crear una nueva materia.
 *
 * @function validateCreateMateria
 * @param {Object} body - Objeto recibido en `req.body`.
 * @returns {{nombre: string, codigo: string, color: string, creditos: number|null, activa: boolean}} Payload formateado para persistir.
 * @throws {HttpError} Código 422 si alguno de los campos requeridos no cumple con las reglas.
 */
export function validateCreateMateria(body) {
  const nombre = normalizeString(body.nombre, "nombre");
  const codigo = normalizeString(body.codigo, "codigo");
  const color = normalizeString(body.color, "color");
  const creditos = parsePositiveInteger(body.creditos, "creditos");
  const activa = body.activa === undefined ? true : parseBoolean(body.activa);

  validateColor(color);

  return {
    nombre,
    codigo,
    color,
    creditos,
    activa,
  };
}

/**
 * Valida los campos parciales enviados en la petición para actualizar una materia (PATCH).
 *
 * @function validatePatchMateria
 * @param {Object} body - Objeto recibido en `req.body`.
 * @returns {Object} Objeto con los campos validados que se van a actualizar.
 * @throws {HttpError} Código 422 si el cuerpo no contiene ningún campo válido a actualizar o sus valores fallan la validación.
 */
export function validatePatchMateria(body) {
  const payload = {};

  if (body.nombre !== undefined) {
    payload.nombre = normalizeString(body.nombre, "nombre");
  }

  if (body.codigo !== undefined) {
    payload.codigo = normalizeString(body.codigo, "codigo");
  }

  if (body.color !== undefined) {
    payload.color = normalizeString(body.color, "color");
    validateColor(payload.color);
  }

  if (body.creditos !== undefined) {
    payload.creditos = parsePositiveInteger(body.creditos, "creditos");
  }

  if (body.activa !== undefined) {
    payload.activa = parseBoolean(body.activa);
  }

  if (Object.keys(payload).length === 0) {
    throw new HttpError(
      422,
      "VALIDATION_ERROR",
      "No se enviaron campos válidos para actualizar.",
    );
  }

  return payload;
}