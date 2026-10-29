import { request } from './http.js';

const BASE_URL = '/recordatorios';

function extraerRegistro(respuesta) {
  return respuesta?.data?.recordatorio
    ?? respuesta?.data
    ?? respuesta?.recordatorio
    ?? respuesta;
}

export async function listarRecordatorios() {
  const respuesta = await request(BASE_URL);

  const lista = Array.isArray(respuesta)
    ? respuesta
    : respuesta?.data?.recordatorios
      ?? respuesta?.data
      ?? respuesta?.recordatorios;

  if (!Array.isArray(lista)) {
    throw new Error('El servidor no devolvió una lista de recordatorios válida.');
  }

  return lista;
}

export async function obtenerRecordatorio(id) {
  const respuesta = await request(`${BASE_URL}/${encodeURIComponent(id)}`);
  return extraerRegistro(respuesta);
}

export async function crearRecordatorio(datos) {
  const respuesta = await request(BASE_URL, {
    method: 'POST',
    body: datos
  });
  return respuesta === null ? null : extraerRegistro(respuesta);
}

export async function actualizarRecordatorio(id, datos) {
  const respuesta = await request(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: datos
  });
  return respuesta === null ? null : extraerRegistro(respuesta);
}

export async function eliminarRecordatorio(id) {
  return request(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}