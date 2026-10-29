import { listarRecordatorios } from '../api/recordatorios.js';

document.addEventListener('DOMContentLoaded', () => {
    const botonActualizar = document.getElementById('btn-actualizar');

    if (botonActualizar) {
        botonActualizar.addEventListener('click', cargarRecordatorios);
    }

    cargarRecordatorios();
});

async function cargarRecordatorios() {
    const tbody = document.querySelector('#tabla-recordatorios tbody');
    const mensajeEstado = document.getElementById('mensaje-estado');
    const resumenDatos = document.getElementById('resumen-datos');
    const botonActualizar = document.getElementById('btn-actualizar');

    if (!tbody) {
        console.error('No se encontró la tabla de recordatorios.');
        return;
    }

    if (botonActualizar) botonActualizar.disabled = true;

    mostrarEstado(mensajeEstado, 'Cargando recordatorios...', 'info-text');
    tbody.replaceChildren();

    const filaCarga = document.createElement('tr');
    const celdaCarga = document.createElement('td');

    celdaCarga.colSpan = 5;
    celdaCarga.textContent = 'Cargando...';

    filaCarga.appendChild(celdaCarga);
    tbody.appendChild(filaCarga);

    try {
        const resultado = await listarRecordatorios();

        if (!Array.isArray(resultado)) {
            throw new Error('La respuesta del servidor no contiene una lista válida.');
        }

        tbody.replaceChildren();

        if (resultado.length === 0) {
            mostrarFila(tbody, 'No hay recordatorios registrados.');
            if (resumenDatos) {
                resumenDatos.textContent = 'Total: 0 recordatorios.';
            }

            mostrarEstado(
                mensajeEstado,
                'No se encontraron recordatorios.',
                'info-text'
            );

            return;
        }

        resultado.forEach((recordatorio) => {
            const fila = document.createElement('tr');

            agregarCelda(
                fila,
                recordatorio.id_recordatorio ??
                recordatorio.idRecordatorio ??
                recordatorio.id
            );

            agregarCelda(
                fila,
                recordatorio.id_tarea ??
                recordatorio.idTarea ??
                recordatorio.tareaId
            );

            agregarCelda(fila, recordatorio.mensaje);

            agregarCelda(
                fila,
                formatearFecha(
                    recordatorio.fecha_hora ??
                    recordatorio.fechaHora
                )
            );

            agregarCelda(fila, recordatorio.canal);

            tbody.appendChild(fila);
        });

        if (resumenDatos) {
            resumenDatos.textContent =
                `Total: ${resultado.length} recordatorio(s).`;
        }

        mostrarEstado(
            mensajeEstado,
            'Recordatorios cargados correctamente.',
            'success-text'
        );

    } catch (error) {
        console.error('Error al cargar recordatorios:', error);

        tbody.replaceChildren();
        mostrarFila(tbody, 'No fue posible cargar los recordatorios.');

        if (resumenDatos) {
            resumenDatos.textContent = 'Error al consultar los datos.';
        }

        mostrarEstado(
            mensajeEstado,
            error.message || 'Ocurrió un error inesperado.',
            'error-text'
        );

    } finally {
        if (botonActualizar) botonActualizar.disabled = false;
    }
}

function agregarCelda(fila, valor) {
    const celda = document.createElement('td');

    celda.textContent =
        valor === null || valor === undefined ? '' : String(valor);

    fila.appendChild(celda);
}

function mostrarFila(tbody, mensaje) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');

    celda.colSpan = 5;
    celda.textContent = mensaje;

    fila.appendChild(celda);
    tbody.appendChild(fila);
}

function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';

    const fechaNormalizada =
        typeof fecha === 'string' ? fecha.replace(' ', 'T') : fecha;

    const fechaObjeto = new Date(fechaNormalizada);

    if (Number.isNaN(fechaObjeto.getTime())) {
        return String(fecha);
    }

    return fechaObjeto.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function mostrarEstado(elemento, mensaje, clase) {
    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.className = clase;
}