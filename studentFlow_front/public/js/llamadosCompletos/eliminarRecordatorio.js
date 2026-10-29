import { eliminarRecordatorio } from '../api/recordatorios.js';

const formulario = document.getElementById('form-eliminar-recordatorio');
const mensajeEstado = document.getElementById('mensaje-estado');
const botonEliminar = document.getElementById('btn-eliminar');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    mensajeEstado.textContent = '';

    const id = document.getElementById('recordatorioId').value.trim();

    if (!id || !Number.isInteger(Number(id)) || Number(id) < 1) {
        mostrarMensaje('Ingresa un ID válido.', 'error-text');
        return;
    }

    const confirmado = window.confirm(
        `¿Estás seguro de que deseas eliminar el recordatorio ${id}?`
    );

    if (!confirmado) {
        return;
    }

    botonEliminar.disabled = true;

    try {
        await eliminarRecordatorio(id);

        mostrarMensaje('Recordatorio eliminado correctamente.', 'success-text');
        formulario.reset();
    } catch (error) {
        console.error('Error al eliminar recordatorio:', error);

        mostrarMensaje(
            error.message || 'No fue posible eliminar el recordatorio.',
            'error-text'
        );
    } finally {
        botonEliminar.disabled = false;
    }
});

function mostrarMensaje(texto, clase) {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = clase;
}