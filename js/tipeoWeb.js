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
    let logistica = '', bultos = '';

    if (/^(36|40)\d{13}$/.test(val)) {
      logistica = 'Andreani';
      inputBultos.value = '1'; // Siempre se establece en 1
      inputBultos.disabled = true;
    } else if (/^1141\d{8}\d{4}$/.test(val)) {
      logistica = 'Cruz del Sur';
      bultos = parseInt(val.slice(-4), 10);
      inputBultos.value = bultos; // Establece el bulto
      inputBultos.disabled = true;
      inputEtiqueta.value = val.slice(4, -4); // Solo toma "78406107"
    } else if (/^4146\d{15,}-\d+$/.test(val)) {
      logistica = 'Oca';
      const partes = val.split('-');
      inputEtiqueta.value = partes[0];
      inputBultos.value = parseInt(partes[1], 10);
      inputBultos.disabled = true;
    } else if (/^(NOV|BNA|ME1)/.test(val)) {
      logistica = 'Andesmar';
      // No se establece bultos automáticamente
      Swal.fire('Atención', 'La guía no tiene un formato de tracking conocido para Andesmar. Lo agregaré igual pero te recomiendo verificarlo.', 'warning');
      inputBultos.focus(); // Enfoca el campo de bultos
    } else {
      inputEtiqueta.classList.add('is-invalid');
      e.preventDefault();
      return;
    }

    if (!logistica) {
      inputEtiqueta.classList.add('is-invalid');
      e.preventDefault();
      return;
    }

    inputEtiqueta.classList.remove('is-invalid');
    inputLogistica.value = logistica;
    e.preventDefault();
    inputValor.focus();
  }
});

inputBultos.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    inputValor.focus();
  }
});

inputValor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const remito = inputRemito.value.trim();
    const etiqueta = inputEtiqueta.value.trim();
    const bultos = inputBultos.value.trim();
    const valor = inputValor.value.trim();
    const logistica = inputLogistica.value.trim();

    const valorFormateado = formatearPesos(valor);
    if (!valorFormateado) {
      inputValor.classList.add('is-invalid');
      return;
    }

    const fecha = new Date().toLocaleString('es-AR');
    let seguimientoLink = etiqueta;

    if (logistica === 'Andreani') {
      seguimientoLink = `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${etiqueta}`;
    } else if (logistica === 'Andesmar') {
      // Se agrega sin NIC
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

const modalDespacho = document.getElementById('modalDespacho');
modalDespacho.addEventListener('shown.bs.modal', () => {
  inputRemito.focus();
});