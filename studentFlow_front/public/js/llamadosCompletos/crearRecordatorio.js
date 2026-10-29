import { crearRecordatorio } from '../api/recordatorios.js';

const formulario = document.getElementById('form-crear-recordatorio');
const mensajeEstado = document.getElementById('mensaje-estado');
const botonCrear = document.getElementById('btn-crear');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    mensajeEstado.textContent = '';

    const datos = {
        tareaId: Number(document.getElementById('tareaId').value),
        mensaje: document.getElementById('mensaje').value.trim(),
        fechaHora: document.getElementById('fechaHora').value,
        canal: document.getElementById('canal').value
    };

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

    botonCrear.disabled = true;

    try {
        await crearRecordatorio(datos);

        mostrarMensaje('¡Recordatorio creado correctamente!', 'success-text');
        formulario.reset();
    } catch (error) {
        console.error('Error al crear recordatorio:', error);

        mostrarMensaje(
            error.message || 'No fue posible crear el recordatorio.',
            'error-text'
        );
    } finally {
        botonCrear.disabled = false;
    }
});

function mostrarMensaje(texto, clase) {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = clase;
}