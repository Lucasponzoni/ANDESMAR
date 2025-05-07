// Cargar datos de Firebase al cargar la página
window.onload = () => {
    cargarDespachos();
};

function cargarDespachos() {
    dbTipeo.ref('despachosDelDia').once('value')
        .then((snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.keys(data).forEach((remito) => {
                    const despacho = data[remito];
                    agregarFilaTabla(remito, despacho);
                });
            } else {
                mostrarMensajeNoHayDespachos();
            }
        })
        .catch((error) => {
            console.error("Error al cargar despachos:", error);
        })
        .finally(() => {
            spinner.style.display = 'none'; // Ocultar el spinner
        });
}

function agregarFilaTabla(remito, despacho) {
    const fecha = new Date(despacho.fecha).toLocaleString('es-AR');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="fecha-tabla-despacho">${fecha}</td>
        <td class="logistica-tabla-despacho">${despacho.logistica}</td>
        <td class="seguimiento-tabla-despacho">
            <a href="${getSeguimientoLink(despacho.logistica, despacho.etiqueta)}" target="_blank">${despacho.etiqueta}</a>
        </td>
        <td class="bultos-tabla-despacho">${despacho.bultos}</td>
        <td class="remito-tabla-despacho">${remito}</td>
        <td class="valor-tabla-despacho">${despacho.valor}</td>
        <td class="info-tabla-despacho">OK</td>
    `;
    tablaBody.appendChild(row);
}

function mostrarMensajeNoHayDespachos() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="7" class="text-center">
            No hay despachos para cargar <i class="bi bi-exclamation-circle"></i>
        </td>
    `;
    tablaBody.appendChild(row);
}

function getSeguimientoLink(logistica, etiqueta) {
    switch (logistica) {
        case 'Andreani':
            return `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${etiqueta}`;
        case 'Andesmar':
            return `https://andesmarcargas.com/seguimiento.html?numero=${etiqueta}&tipo=remito&cod=`;
        case 'Oca':
            return `https://www.aftership.com/es/track/oca-ar/${etiqueta}`;
        case 'Cruz del Sur':
            return `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=NIC-${etiqueta}`;
        default:
            return '#';
    }
}

// TIPEO DE DESPACHO
const inputRemito = document.getElementById('inputRemito');
const inputEtiqueta = document.getElementById('inputEtiqueta');
const inputBultos = document.getElementById('inputBultos');
const inputValor = document.getElementById('inputValor');
const inputLogistica = document.getElementById('inputLogistica');
const tablaBody = document.getElementById('tabla-despacho-body');

const validPrefixes = ['83', '89', '230', '231', '233', '254'];

const formatearPesos = (valor) => {
  const num = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  if (isNaN(num)) return null;
  return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

inputRemito.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = inputRemito.value.trim();
    const esValido = validPrefixes.some(pref => val.startsWith(pref)) && val.length >= 10 && val.length <= 11;
    if (!esValido) {
      inputRemito.classList.add('is-invalid');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Remito inválido. Debe iniciar con 83, 89, 230, 231, 233 o 254 y tener entre 10 y 11 caracteres.',
        allowOutsideClick: false // Evitar que se cierre el modal
      });
      e.preventDefault();
      return;
    }
    inputRemito.classList.remove('is-invalid');
    e.preventDefault();
    inputEtiqueta.focus();
  }
});

inputEtiqueta.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = inputEtiqueta.value.trim();
    let logistica = '';

    if (/^36\d{13}$/.test(val)) {
      logistica = 'Andreani';
      inputBultos.value = '1'; // Establecer bulto en 1
      inputBultos.disabled = true; // Deshabilitar el campo de bultos
      inputValor.focus(); // Saltar al campo de valor
    } else if (/^40\d{13}$/.test(val)) {
      logistica = 'Andreani';
      inputBultos.disabled = false; // Habilitar el campo de bultos
      inputBultos.focus(); // Hacer foco en bultos
    } else if (/^1141\d{8}\d{4}$/.test(val)) {
      logistica = 'Cruz del Sur';
      inputBultos.value = parseInt(val.slice(-4), 10); // Establecer el bulto
      inputBultos.disabled = true; // Deshabilitar el campo de bultos
      inputEtiqueta.value = val.slice(4, -4); // Solo toma "78406107"
      inputValor.focus(); // Saltar al campo de valor
    } else if (/^4146\d{15,}-\d+$/.test(val)) {
      logistica = 'Oca';
      const partes = val.split('-');
      inputEtiqueta.value = partes[0];
      inputBultos.value = parseInt(partes[1], 10);
      inputBultos.disabled = true; // Deshabilitar el campo de bultos
      inputValor.focus(); // Saltar al campo de valor
    } else if (/^(NOV|BNA|ME1)/.test(val)) {
      logistica = 'Andesmar';
      inputBultos.focus(); // Enfocar el campo de bultos
    } else {
      inputEtiqueta.classList.add('is-invalid');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Etiqueta inválida o formato desconocido.',
        allowOutsideClick: false // Evitar que se cierre el modal
      });
      e.preventDefault();
      return;
    }

    if (!logistica) {
      inputEtiqueta.classList.add('is-invalid');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Etiqueta inválida o formato desconocido.',
        allowOutsideClick: false // Evitar que se cierre el modal
      });
      e.preventDefault();
      return;
    }

    inputEtiqueta.classList.remove('is-invalid');
    inputLogistica.value = logistica;
    e.preventDefault();
  }
});

inputBultos.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = inputBultos.value.trim();
    // Tomar los últimos 3 caracteres y convertir a número, eliminando ceros a la izquierda
    const bultosFinal = val.slice(-3).replace(/^0+/, '');
    inputBultos.value = bultosFinal || '1'; // Si no hay valor, establecer en 1
    inputBultos.disabled = true; // Deshabilitar el campo de bultos
    inputValor.focus(); // Saltar al campo de valor
  }
});

inputValor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const remito = inputRemito.value.trim();
    const etiqueta = inputEtiqueta.value.trim();
    const bultos = inputBultos.value.trim();
    const valor = inputValor.value.trim();
    const logistica = inputLogistica.value.trim();

    // Validar que todos los campos estén completos
    if (!remito || !etiqueta || !bultos || !valor || !logistica) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor, complete todos los campos antes de agregar a la tabla.',
        allowOutsideClick: false // Evitar que se cierre el modal
      });
      return;
    }

    const valorFormateado = formatearPesos(valor);
    if (!valorFormateado) {
      inputValor.classList.add('is-invalid');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Valor inválido.',
        allowOutsideClick: false // Evitar que se cierre el modal
      });
      return;
    }

    agregarDespacho(remito, etiqueta, bultos, valorFormateado, logistica);

    const fecha = new Date().toLocaleString('es-AR');
    let seguimientoLink = etiqueta;

    if (logistica === 'Andreani') {
      seguimientoLink = `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${etiqueta}`;
    } else if (logistica === 'Andesmar') {
      seguimientoLink = `https://andesmarcargas.com/seguimiento.html?numero=${etiqueta}&tipo=remito&cod=`;
    } else if (logistica === 'Oca') {
      seguimientoLink = `https://www.aftership.com/es/track/oca-ar/${etiqueta}`;
    } else if (logistica === 'Cruz del Sur') {
      seguimientoLink = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=NIC-${etiqueta}`;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="fecha-tabla-despacho">${fecha}</td>
      <td class="logistica-tabla-despacho">${logistica}</td>
      <td class="seguimiento-tabla-despacho"><a href="${seguimientoLink}" target="_blank">${logistica === 'Cruz del Sur' ? `NIC-${etiqueta}` : etiqueta}</a></td>
      <td class="bultos-tabla-despacho">${bultos}</td>
      <td class="remito-tabla-despacho">${remito}</td>
      <td class="valor-tabla-despacho">${valorFormateado}</td>
      <td class="info-tabla-despacho">OK</td>
    `;
    tablaBody.prepend(row);

    // Reset
    inputRemito.value = '';
    inputEtiqueta.value = '';
    inputBultos.value = '';
    inputValor.value = '';
    inputLogistica.value = '';
    inputBultos.disabled = false;
    inputRemito.focus();
  }
});

// Función para limpiar el feedback de validación
const limpiarValidacion = (input) => {
  input.classList.remove('is-invalid');
};

// Limpia el feedback de validación al escribir
[inputRemito, inputEtiqueta, inputBultos, inputValor].forEach(input => {
  input.addEventListener('input', () => limpiarValidacion(input));
});

const modalDespacho = document.getElementById('modalDespacho');
modalDespacho.addEventListener('shown.bs.modal', () => {
  inputRemito.focus();
});

// Función para agregar datos a la base de datos
function agregarDespacho(remito, etiqueta, bultos, valor, logistica) {
    const despachoData = {
        etiqueta: etiqueta,
        bultos: bultos,
        valor: valor,
        logistica: logistica,
        fecha: new Date().toISOString() // Agrega la fecha actual
    };

    dbTipeo.ref(`despachosDelDia/${remito}`).set(despachoData)
        .then(() => {
            console.log("Despacho agregado correctamente:", despachoData);
        })
        .catch((error) => {
            console.error("Error al agregar despacho:", error);
        });
}
// FIN TIPEO DE DESPACHO