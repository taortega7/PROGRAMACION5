export function validarCreacion(req, res, next) {
    const { tareaId, mensaje, fechaHora, canal } = req.body;
    const errores = [];

    // 1. Validar tareaId (Existencia y tipo estricto)
    if (!tareaId || isNaN(tareaId) || parseInt(tareaId) <= 0) {
        errores.push('El campo tareaId es obligatorio y debe ser un número entero positivo.');
    }

    // 2. Validar mensaje (No puede estar vacío o ser un tipo extraño)
    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim().length === 0) {
        errores.push('El campo mensaje es obligatorio y debe contener texto.');
    } else if (mensaje.length > 255) { // Ajusta el límite según tu VARCHAR en la BD
        errores.push('El mensaje excede la longitud máxima permitida.');
    }

    // 3. Validar fechaHora (Debe poder parsearse como fecha real)
    if (!fechaHora || isNaN(Date.parse(fechaHora))) {
        errores.push('El campo fechaHora es obligatorio y debe ser una fecha válida (ej. YYYY-MM-DD HH:mm:ss).');
    }

    // 4. Validar canal (Restringido estrictamente a los ENUM de tu DER)
    // Revisa en tu diagrama exacto cuáles son los valores de 'recordatorio_canal_enum'
    const canalesValidos = ['email', 'notificacion_push', 'sms']; 
    if (!canal || typeof canal !== 'string' || !canalesValidos.includes(canal.trim().toLowerCase())) {
        errores.push(`El canal es obligatorio y debe ser exacto a: ${canalesValidos.join(', ')}.`);
    }

    // Si hay errores, cortamos el flujo inmediatamente con un 400 Bad Request
    if (errores.length > 0) {
        return res.status(400).json({ 
            estado: 'error', 
            mensaje: 'Fallo en la validación de los datos enviados', 
            detalles: errores 
        });
    }

    // Sanitización básica: reasignar valores limpios al req.body para que el controlador reciba datos puros
    req.body.tareaId = parseInt(tareaId);
    req.body.mensaje = mensaje.trim();
    req.body.canal = canal.trim().toLowerCase();

    // Pasar el control al siguiente middleware o controlador
    next();
}

export function validarActualizacion(req, res, next) {
    // Para el PUT, reutilizas la lógica pero validas también que el ID venga en la ruta
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ estado: 'error', mensaje: 'El ID del recordatorio es inválido.' });
    }

    // Llama a la misma validación de creación para el cuerpo
    validarCreacion(req, res, next);
}