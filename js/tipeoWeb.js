// CALCULO DE TOTALES
function actualizarTotales() {
    let totalAndreani = 0, totalAndesmar = 0, totalOCA = 0, totalCDS = 0;
    let bultosAndreani = { bigger: 0, paqueteria: 0 };
    let bultosAndesmar = 0, bultosOCA = 0, bultosCDS = 0;
    let montoAndreani = 0, montoAndesmar = 0, montoOCA = 0, montoCDS = 0;

    const filas = document.querySelectorAll('#tabla-despacho-body tr');

    filas.forEach(fila => {
        const logistica = fila.querySelector('.logistica-tabla-despacho').textContent.trim();
        const seguimiento = fila.querySelector('.seguimiento-tabla-despacho').textContent.trim(); // Asegúrate de tener esta clase
        const bultos = parseInt(fila.querySelector('.bultos-tabla-despacho').textContent) || 0;
        const valorTexto = fila.querySelector('.valor-tabla-despacho').textContent;

        // Extraer solo el número del valor
        const valorNumerico = parseFloat(valorTexto.replace(/\$|\.|\,/g, '').replace(/(\d+)(\d{2})$/, '$1.$2')) || 0;

        // Sumar totales por logística
        if (logistica === 'Andreani') {
            totalAndreani += 1; // Contar la fila

            // Sumar bultos según el prefijo del seguimiento
            if (seguimiento.startsWith('36')) {
                bultosAndreani.paqueteria += bultos; // Incrementar bultos de paquetería
            } else if (seguimiento.startsWith('40')) {
                bultosAndreani.bigger += bultos; // Incrementar bultos bigger
            }

            montoAndreani += valorNumerico;
        } else if (logistica === 'Andesmar') {
            totalAndesmar += 1;
            bultosAndesmar += bultos;
            montoAndesmar += valorNumerico;
        } else if (logistica === 'Oca') {
            totalOCA += 1;
            bultosOCA += bultos;
            montoOCA += valorNumerico;
        } else if (logistica === 'Cruz del Sur') {
            totalCDS += 1;
            bultosCDS += bultos;
            montoCDS += valorNumerico;
        }
    });

    // Actualizar los elementos en el DOM
    document.querySelector('.total-andreani').textContent = totalAndreani || 0;
    document.querySelector('.total-bigger-andreani').textContent = bultosAndreani.bigger || 0;
    document.querySelector('.total-paqueteria-andreani').textContent = bultosAndreani.paqueteria || 0;
    document.querySelector('.total-andesmar').textContent = totalAndesmar || 0;
    document.querySelector('.total-bigger-andesmar').textContent = bultosAndesmar || 0;
    document.querySelector('.total-oca').textContent = totalOCA || 0;
    document.querySelector('.total-bigger-oca').textContent = bultosOCA || 0;
    document.querySelector('.total-cds').textContent = totalCDS || 0;
    document.querySelector('.total-bigger-cds').textContent = bultosCDS || 0;

    document.querySelector('.total-monto-andreani').textContent = formatearPesos2(montoAndreani);
    document.querySelector('.total-monto-andesmar').textContent = formatearPesos2(montoAndesmar);
    document.querySelector('.total-monto-oca').textContent = formatearPesos2(montoOCA);
    document.querySelector('.total-monto-cds').textContent = formatearPesos2(montoCDS);
}

// Función para formatear el monto en pesos argentinos
function formatearPesos2(valor) {
    // Convertir el valor a un número entero de centavos
    const valorEntero = Math.floor(valor);
    const valorDecimal = Math.round((valor - valorEntero) * 100);

    // Formatear la parte entera
    const parteEnteraFormateada = valorEntero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Formatear la parte decimal
    const parteDecimalFormateada = valorDecimal > 0 ? `,${valorDecimal.toString().padStart(2, '0')}` : '';

    // Devolver el resultado final
    return `$ ${parteEnteraFormateada}${parteDecimalFormateada}`;
}
// FIN CALCULO DE TOTALES

// RENDERIZADO DE FILAS EN LA TABLA
window.onload = async () => {
    cargarDespachos(); 
};

function cargarDespachos() {
    dbTipeo.ref('despachosDelDia').on('value', (snapshot) => {
        const data = snapshot.val();
        tablaBody.innerHTML = ''; // Limpiar la tabla antes de volver a cargar
        if (data) {
            Object.keys(data).forEach((remito) => {
                const despacho = data[remito];
                agregarFilaTabla(remito, despacho);
            });
        } else {
            mostrarMensajeNoHayDespachos();
        }
        spinner.style.display = 'none'; // Ocultar el spinner
    }, (error) => {
        console.error("Error al cargar despachos:", error);
    });
}

function agregarFilaTabla(remito, despacho) {
    const fecha = new Date(despacho.fecha).toLocaleString('es-AR');
    const row = document.createElement('tr');

    // Crear el contenedor para el texto y el círculo
    const logisticaDiv = document.createElement('div');
    logisticaDiv.classList.add('logistica-contenedor');

    // Crear el círculo
    let circuloDiv = document.createElement('div');
    circuloDiv.classList.add('logistica-circulo');

    let img = document.createElement('img');
    const logistica = despacho.logistica;

    switch (logistica) {
        case 'Andreani':
            circuloDiv.classList.add('andreani-tablita');
            img.src = './Img/andreani-tini.png';
            break;
        case 'Andesmar':
            circuloDiv.classList.add('andesmar-tablita');
            img.src = './Img/andesmar-tini.png';
            break;
        case 'Oca':
            circuloDiv.classList.add('oca-tablita');
            img.src = './Img/oca-tini.png';
            break;
        case 'Cruz del Sur':
            circuloDiv.classList.add('cruz-del-sur-tablita');
            img.src = './Img/Cruz-del-Sur-tini.png';
            break;
        default:
            return;
    }

    circuloDiv.appendChild(img);

    // Crear un span para el texto de logística y ocultarlo
    const logisticaTexto = document.createElement('span');
    logisticaTexto.textContent = logistica; // Agregar el texto de logística
    logisticaTexto.classList.add('logistica-texto'); // Clase para aplicar estilos

    logisticaDiv.appendChild(logisticaTexto); // Agregar el texto al contenedor
    logisticaDiv.appendChild(circuloDiv); // Agregar el círculo al contenedor
    // Modificación aquí para agregar "NIC-" si la logística es "Cruz del Sur"
    const etiquetaConPrefijo = logistica === 'Cruz del Sur' ? `NIC-${despacho.etiqueta}` : despacho.etiqueta;

    row.innerHTML = `
        <td class="fecha-tabla-despacho">${fecha}</td>
        <td class="logistica-tabla-despacho"></td> <!-- Se dejará vacío para insertar el contenedor -->
        <td class="seguimiento-tabla-despacho">
            <div class="seguimiento-contenedor">
                <a href="${getSeguimientoLink(despacho.logistica, despacho.etiqueta)}" target="_blank">
                    ${etiquetaConPrefijo} 
                    <i class="bi bi-box-arrow-up-right"></i>
                </a>
            </div>
        </td>
        <td class="bultos-tabla-despacho">
        <div class="bultos-box" data-bultos="${despacho.bultos}">${despacho.bultos}</div>
        </td>
        <td class="remito-tabla-despacho">${remito}</td>
        <td>
            <div class="valor-tabla-despacho">${despacho.valor}</div>
        </td>
        <td class="info-tabla-despacho">OK</td>
        <td class="delete-tabla-despacho">
            <button class="btn btn-danger btn-sm" onclick="confirmarEliminacion('${remito}')">
                <i class="bi bi-trash3-fill"></i>
            </button>
        </td>
    `;
      
    // Insertar el contenedor en la celda correspondiente
    const logisticaCell = row.querySelector('.logistica-tabla-despacho');
    logisticaCell.appendChild(logisticaDiv);

    tablaBody.appendChild(row);
    actualizarTotales();
}

function mostrarMensajeNoHayDespachos() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="8" class="text-center">
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
            return `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${etiqueta}`;
        default:
            return '#';
    }
}

// Confirmar eliminación del despacho
function confirmarEliminacion(remito) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás deshacer esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarDespacho(remito);
        }
    });
}

// Eliminar despacho de Firebase y de la tabla
function eliminarDespacho(remito) {
    dbTipeo.ref(`despachosDelDia/${remito}`).remove()
        .then(() => {
            Swal.fire(
                'Borrado!',
                'El despacho ha sido eliminado.',
                'success'
            );
        })
        .catch((error) => {
            console.error("Error al eliminar despacho:", error);
            Swal.fire(
                'Error!',
                'No se pudo eliminar el despacho.',
                'error'
            );
        });
}
// FIN RENDERIZADO DE FILAS EN LA TABLA

// TIPEO DE DESPACHO
const verificarRemitoYEtiqueta = async (remito, etiqueta) => {
    try {
      // Verificar remito en Firebase
      const remitoSnapshot = await dbTipeo.ref(`despachosHistoricosRemitos/${remito}`).once('value');
      const remitoExiste = remitoSnapshot.exists();
  
      // Verificar etiqueta en Firebase
      const etiquetaSnapshot = await dbTipeo.ref(`despachosHistoricosEtiquetas/${etiqueta}`).once('value');
      const etiquetaExiste = etiquetaSnapshot.exists();
  
      // Verificar si el remito ya está en la tabla
      const filas = tablaBody.getElementsByTagName('tr');
      const remitoEnTabla = Array.from(filas).some(row => row.querySelector('.remito-tabla-despacho').textContent === remito);
      const etiquetaEnTabla = Array.from(filas).some(row => row.querySelector('.seguimiento-tabla-despacho a').textContent === etiqueta);
  
      // Si el remito o la etiqueta ya existen, mostrar un error
      if (remitoExiste || remitoEnTabla) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El remito ya fue despachado anteriormente. Esta acción fue notificada por email.',
          allowOutsideClick: false
        });
        return false; // Indicar que la verificación falló
      }
  
      if (etiquetaExiste || etiquetaEnTabla) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La etiqueta ya fue utilizada antes. Esta acción fue notificada por email.',
          allowOutsideClick: false
        });
        return false; // Indicar que la verificación falló
      }
  
      return true; // Todo está bien
    } catch (error) {
      console.error("Error al verificar remito y etiqueta:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al verificar los datos.',
        allowOutsideClick: false
      });
      return false; // Indicar que hubo un error
    }
};
  
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

inputRemito.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = inputRemito.value.trim();
      const esValido = validPrefixes.some(pref => val.startsWith(pref)) && val.length >= 10 && val.length <= 11;
      
      if (!esValido) {
        inputRemito.classList.add('is-invalid');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Remito inválido. Debe iniciar con 83, 89, 230, 231, 233 o 254 y tener entre 10 y 11 caracteres.',
          allowOutsideClick: false
        });
        e.preventDefault();
        return;
      }
  
      const etiqueta = inputEtiqueta.value.trim();
      const verificacion = await verificarRemitoYEtiqueta(val, etiqueta);
      if (!verificacion) {
        e.preventDefault();
        return; // Detener el flujo si hay un error
      }
  
      inputRemito.classList.remove('is-invalid');
      e.preventDefault();
      inputEtiqueta.focus();
    }
});

inputEtiqueta.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = inputEtiqueta.value.trim();
      let logistica = '';
  
      // Verificar remito y etiqueta antes de continuar
      const remito = inputRemito.value.trim();
      const verificacion = await verificarRemitoYEtiqueta(remito, val);
      if (!verificacion) {
        e.preventDefault();
        return; // Detener el flujo si hay un error
      }
  
      // Lógica existente para determinar la logística
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
      } else if (/^(NOV|BNA|.*ME1)$/.test(val)) {
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

    const etiquetaConPrefijo = logistica === 'Cruz del Sur' ? `NIC-${etiqueta}` : etiqueta;

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
    const circuloDiv = crearCirculo(logistica); // Llama a la función para crear el círculo
    
    row.innerHTML = `
      <td class="fecha-tabla-despacho">${fecha}</td>
      <td class="logistica-tabla-despacho"></td> <!-- Se dejará vacío para insertar el contenedor -->
      <td class="seguimiento-tabla-despacho">
        <div class="seguimiento-contenedor">
            <a href="${getSeguimientoLink(logistica, etiqueta)}" target="_blank">
                ${etiquetaConPrefijo} 
                <i class="bi bi-box-arrow-up-right"></i>
            </a>
        </div>
      </td>
      <td class="bultos-tabla-despacho">
      <div class="bultos-box" data-bultos="${bultos}">${bultos}</div>
      </td>
      <td class="remito-tabla-despacho">${remito}</td>
      <td>
            <div class="valor-tabla-despacho">${valorFormateado}</div>
      </td>
      <td class="info-tabla-despacho">OK</td>
      <td class="delete-tabla-despacho">
          <button class="btn btn-danger btn-sm" onclick="confirmarEliminacion('${remito}')">
              <i class="bi bi-trash3-fill"></i>
          </button>
      </td>
    `;

    // Insertar el círculo en la celda correspondiente
    const logisticaCell = row.querySelector('.logistica-tabla-despacho');
    if (circuloDiv) {
        logisticaCell.appendChild(circuloDiv);
    }
    
    tablaBody.prepend(row);
    actualizarTotales();    
    
    // Reset
    inputRemito.value = '';
    inputEtiqueta.value = '';
    inputBultos.value = '';
    inputValor.value = '';
    inputLogistica.value = '';
    inputBultos.disabled = false;
    inputRemito.focus();
  }

  function crearCirculo(logistica) {
    if (!logistica) return null;

    // Crear el contenedor principal
    const logisticaDiv = document.createElement('div');
    logisticaDiv.classList.add('logistica-contenedor');

    // Crear el span con el texto
    const logisticaTexto = document.createElement('span');
    logisticaTexto.textContent = logistica;
    logisticaTexto.classList.add('logistica-texto'); // Clase opcional para estilo
    logisticaDiv.appendChild(logisticaTexto);

    // Crear el círculo con la imagen
    const circuloDiv = document.createElement('div');
    circuloDiv.classList.add('logistica-circulo');

    const img = document.createElement('img');

    switch (logistica) {
        case 'Andreani':
            circuloDiv.classList.add('andreani-tablita');
            img.src = './Img/andreani-tini.png';
            break;
        case 'Andesmar':
            circuloDiv.classList.add('andesmar-tablita');
            img.src = './Img/andesmar-tini.png';
            break;
        case 'Oca':
            circuloDiv.classList.add('oca-tablita');
            img.src = './Img/oca-tini.png';
            break;
        case 'Cruz del Sur':
            circuloDiv.classList.add('cruz-del-sur-tablita');
            img.src = './Img/Cruz-del-Sur-tini.png';
            break;
        default:
            return null;
    }

    circuloDiv.appendChild(img);
    circuloDiv.classList.add('logistica-circulo-oculto'); // Ocultar círculo si es necesario
    logisticaDiv.appendChild(circuloDiv);

    return logisticaDiv;
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

