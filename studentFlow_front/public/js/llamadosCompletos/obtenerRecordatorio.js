import { obtenerRecordatorio } from '../api/recordatorios.js';

const formulario = document.getElementById('form-consultar-recordatorio');
const mensajeEstado = document.getElementById('mensaje-estado');
const resultado = document.getElementById('resultado-recordatorio');
const botonConsultar = document.getElementById('btn-consultar');

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = document.getElementById('recordatorioId').value.trim();

    resultado.hidden = true;
    mensajeEstado.textContent = '';

    if (!id || Number(id) < 1) {
        mostrarMensaje('Ingresa un ID válido.', 'error-text');
        return;
    }

    botonConsultar.disabled = true;

    try {
        const registro = await obtenerRecordatorio(id);

        if (!registro || typeof registro !== 'object') {
            throw new Error('No se encontraron datos para ese recordatorio.');
        }

        ponerTexto('dato-id', registro.id ?? registro.id_recordatorio);
        ponerTexto('dato-tarea', registro.tareaId ?? registro.id_tarea);
        ponerTexto('dato-mensaje', registro.mensaje);
        ponerTexto('dato-fecha', registro.fechaHora ?? registro.fecha_hora);
        ponerTexto('dato-canal', registro.canal);

        const leido = registro.leido;
        ponerTexto(
            'dato-leido',
            leido === undefined || leido === null
                ? 'No disponible'
                : (leido === true || leido === 1 || leido === '1' ? 'Sí' : 'No')
        );

        resultado.hidden = false;
        mostrarMensaje('Recordatorio consultado correctamente.', 'success-text');
    } catch (error) {
        console.error('Error al consultar recordatorio:', error);
        mostrarMensaje(
            error.message || 'No fue posible consultar el recordatorio.',
            'error-text'
        );
    } finally {
        botonConsultar.disabled = false;
    }
});

function ponerTexto(id, valor) {
    document.getElementById(id).textContent =
        valor === undefined || valor === null || valor === ''
            ? 'No disponible'
            : String(valor);
}

function mostrarMensaje(texto, clase) {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = clase;
}