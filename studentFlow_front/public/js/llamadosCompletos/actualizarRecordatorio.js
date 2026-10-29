import { actualizarRecordatorio } from '../api/recordatorios.js';

const formulario = document.getElementById('form-actualizar-recordatorio');
const mensajeEstado = document.getElementById('mensaje-estado');
const botonActualizar = document.getElementById('btn-actualizar');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    mensajeEstado.textContent = '';

    const id = document.getElementById('recordatorioId').value.trim();

    const datos = {
        tareaId: Number(document.getElementById('tareaId').value),
        mensaje: document.getElementById('mensaje').value.trim(),
        fechaHora: document.getElementById('fechaHora').value,
        canal: document.getElementById('canal').value
    };

    if (!id || Number(id) < 1) {
        mostrarMensaje('Ingresa un ID de recordatorio válido.', 'error-text');
        return;
    }

    if (
        !Number.isInteger(datos.tareaId) ||
        datos.tareaId < 1 ||
        !datos.mensaje ||
        !datos.fechaHora ||
        !datos.canal
    ) {
        mostrarMensaje('Completa todos los campos correctamente.', 'error-text');
        return;
    }

    botonActualizar.disabled = true;

    try {
        await actualizarRecordatorio(id, datos);

        mostrarMensaje('¡Recordatorio actualizado correctamente!', 'success-text');
    } catch (error) {
        console.error('Error al actualizar recordatorio:', error);

        mostrarMensaje(
            error.message || 'No fue posible actualizar el recordatorio.',
            'error-text'
        );
    } finally {
        botonActualizar.disabled = false;
    }
});

function mostrarMensaje(texto, clase) {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = clase;
}