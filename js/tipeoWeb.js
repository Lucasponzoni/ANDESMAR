// CALCULO DE TOTALES
function actualizarTotales() {
    let totalAndreani = 0, totalAndesmar = 0, totalOCA = 0, totalCDS = 0;
    let bultosAndreani = { bigger: 0, paqueteria: 0 };
    let bultosAndesmar = 0, bultosOCA = 0, bultosCDS = 0;
    let montoAndreani = 0, montoAndesmar = 0, montoOCA = 0, montoCDS = 0;

    const filas = document.querySelectorAll('#tabla-despacho-body tr');

    // Verificar si la tabla está vacía
    if (filas.length === 0) {
        const tablaBody = document.querySelector('#tabla-despacho-body');
        tablaBody.innerHTML = `<tr>
            <td colspan="8" class="text-center">
                No hay despachos para cargar <i class="bi bi-exclamation-circle"></i>
            </td>
        </tr>`;
        return; // Salir de la función si no hay despachos
    }

    filas.forEach(fila => {
        const logisticaElem = fila.querySelector('.logistica-tabla-despacho');
        const seguimientoElem = fila.querySelector('.seguimiento-tabla-despacho');
        const bultosElem = fila.querySelector('.bultos-tabla-despacho');
        const valorElem = fila.querySelector('.valor-tabla-despacho');

        // Verificar si los elementos existen antes de acceder a sus propiedades
        if (logisticaElem && seguimientoElem && bultosElem && valorElem) {
            const logistica = logisticaElem.textContent.trim();
            const seguimiento = seguimientoElem.textContent.trim();
            const bultos = parseInt(bultosElem.textContent) || 0;
            const valorTexto = valorElem.textContent;

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

// IMPRESION DE TABLA
function imprimirTabla() {
    const now = new Date();

    const fechaHoraStr = now.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    document.querySelectorAll('.fecha-impresion').forEach(el => {
        el.innerText = fechaHoraStr;
    });

    const tituloModal = document.getElementById('modalDespachoPorLogisticaLabel')?.innerText.trim() || 'Impresión';
    const tituloFinal = `${tituloModal} - ${fechaHoraStr}`;

    const tabla = $('#tabla-container-xLogistica');
    const ultimaColumna = tabla.find('tr').find('td:last-child, th:last-child');
    ultimaColumna.hide();

    const filas = tabla.find('tbody tr').filter(function () {
        return $(this).find('td').length > 0;
    });

    if (filas.length === 0) {
        alert('No hay contenido para imprimir.');
        ultimaColumna.show();
        return;
    }

    const cantidadEtiquetas = filas.length;
    let totalBultos = 0;

    filas.each(function () {
        const bultosCell = $(this).find('.bultos-box');
        const bultos = parseInt(bultosCell.data('bultos')) || 0;
        totalBultos += bultos;
    });

    const resumenHTML = `
        <div style="
            display: flex;
            justify-content: center;
            gap: 40px;
            margin: 30px auto 20px auto;
            padding: 16px;
            border: 2px solid #444;
            border-radius: 8px;
            background-color: #f1f1f1;
            max-width: 800px;
            text-align: center;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        ">
            <div style="
                flex: 1;
                background-color: #e0e0e0;
                border: 1px solid #999;
                border-radius: 6px;
                padding: 16px;
                font-size: 16px;
                font-weight: 700;
                color: #222;
            ">
                CANTIDAD DE ETIQUETAS<br>
                <span style="font-size: 28px; color: #000;">${cantidadEtiquetas}</span>
            </div>
            <div style="
                flex: 1;
                background-color: #e0e0e0;
                border: 1px solid #999;
                border-radius: 6px;
                padding: 16px;
                font-size: 16px;
                font-weight: 700;
                color: #222;
            ">
                CANTIDAD DE BULTOS<br>
                <span style="font-size: 28px; color: #000;">${totalBultos}</span>
            </div>
        </div>
    `;

    const contenido = tabla.clone();
    const pieHTML = $('.pie-por-hoja-print').html();

    // Reemplazo de logos
    contenido.find('.logistica-tabla-despacho').each(function () {
        const original = $(this);
        const texto = original.find('.logistica-texto').text().trim().toLowerCase();

        let src = '';
        if (texto === 'andreani') src = 'https://lucasponzoni.github.io/ANDESMAR/Img/andreani-tini.png';
        else if (texto === 'andesmar') src = 'https://lucasponzoni.github.io/ANDESMAR/Img/andesmar-tini.png';
        else if (texto === 'oca') src = 'https://lucasponzoni.github.io/ANDESMAR/Img/oca-tini.png';
        else if (texto === 'cruz del sur') src = 'https://lucasponzoni.github.io/ANDESMAR/Img/Cruz-del-Sur-tini.png';

        if (src) {
            const nuevoLogo = `
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 2px solid #000;
                    background-color: black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: auto;
                ">
                    <img src="${src}" style="width: 22px; height: auto; filter: invert(1);">
                </div>
            `;
            original.html(nuevoLogo);
        }
    });

    const contenedor = $('<div></div>').append(resumenHTML);
    const todasLasFilas = contenido.find('tbody tr').toArray();

    let bloqueTbody = $('<tbody></tbody>');
    let alturaAcumulada = 0;
    const maxAlturaHoja = 1900; // Ajustar según impresora y papel
    const alturaPie = 150;
    const alturaHeaderPrimeraHoja = 150; // Espacio total para título + resumen (aproximado)
    let esPrimeraHoja = true;

    todasLasFilas.forEach((fila, index) => {
        const tempDiv = $('<table style="visibility:hidden; position:absolute;"></table>').append('<tbody></tbody>').appendTo('body');
        tempDiv.find('tbody').append($(fila).clone());
        const alturaFila = tempDiv.height();
        tempDiv.remove();

        const maxAlturaDisponible = esPrimeraHoja ? (maxAlturaHoja - alturaHeaderPrimeraHoja - alturaPie) : (maxAlturaHoja - alturaPie);

        if ((alturaAcumulada + alturaFila) > maxAlturaDisponible) {
            const tablaBloque = $('<table class="table table-bordered table-striped"></table>')
                .append(contenido.find('thead').clone())
                .append(bloqueTbody.clone());
            contenedor.append(tablaBloque);
            contenedor.append(`<div class="pie-por-hoja-print" style="page-break-after: always;">${pieHTML}</div>`);

            bloqueTbody = $('<tbody></tbody>');
            alturaAcumulada = 0;
            esPrimeraHoja = false;
        }

        bloqueTbody.append($(fila).clone());
        alturaAcumulada += alturaFila;

        if (index === todasLasFilas.length - 1 && bloqueTbody.children().length > 0) {
            const tablaFinal = $('<table class="table table-bordered table-striped"></table>')
                .append(contenido.find('thead').clone())
                .append(bloqueTbody.clone());
            contenedor.append(tablaFinal);
            contenedor.append(`<div class="pie-por-hoja-print">${pieHTML}</div>`);
        }
    });

    // Eliminar cualquier pie que haya quedado solo sin tabla
    contenedor.find('.pie-por-hoja-print').each(function () {
        if ($(this).prev('table').length === 0) $(this).remove();
    });

    // ====== FORMATEO ESPECIAL COLUMNA INFO PARA IMPRESION ======
    contenido.find('td').each(function () {
        const celda = $(this);

        if (celda.find('.infoMacOsy').length > 0) {
            // Limitar ancho y forzar quiebre de línea
            celda.css({
                'max-width': '120px',      // ajustá según te convenga
                'white-space': 'normal',   // permitir saltos de línea
                'word-wrap': 'break-word',
                'overflow-wrap': 'break-word',
                'vertical-align': 'top'   
            });

            // También a infoDetalleMacOsy, para reforzar
            celda.find('.infoDetalleMacOsy').css({
                'max-width': '120px',
                'white-space': 'normal',
                'word-wrap': 'break-word',
                'overflow-wrap': 'break-word'
            });
        }
    });

    contenedor.printThis({
        importCSS: true,
        importStyle: true,
        loadCSS: "/styles.css",
        pageTitle: tituloFinal,
        header: `<h2 style="text-align:center; margin-bottom:20px;">${tituloFinal}</h2>`,
        footer: "",
        base: false,
        removeInline: false,
        printDelay: 500,
        canvas: true,
        debug: false
    });

    ultimaColumna.show();
}
// FIN IMPRESION DE TABLA

// RENDERIZADO DE TABLA POR LOGISTICA EN MODAL
function abrirModalTabla(logistica) {
    logisticaActual = logistica;
    const spinner = document.getElementById('spinnerPorLogistica');
    const tablaContainer = document.getElementById('tabla-container-xLogistica');
    const tablaBody = document.getElementById('tabla-despacho-xLogistica-body');

    const modalTitle = $('#modalDespachoPorLogistica').find('.modal-title');
    modalTitle.text(`Datos de Despacho - ${logistica}`);

    spinner.style.display = 'block';
    tablaContainer.style.display = 'none';

    cargarDespachosPorLogistica(logistica, tablaBody, spinner, tablaContainer);
}

function cargarDespachosPorLogistica(logistica, tablaBody, spinner, tablaContainer) {
    console.log("Cargando despachos para la logística:", logistica);
    dbTipeo.ref('despachosDelDia').orderByChild('logistica').equalTo(logistica).once('value', (snapshot) => {
        const data = snapshot.val();
        console.log("Datos obtenidos de Firebase:", data);

        tablaBody.innerHTML = '';

        if (data) {
            Object.keys(data).forEach((remito) => {
                const despacho = data[remito];
                agregarFilaTabla(remito, despacho, tablaBody);
            });

            tablaContainer.style.display = 'block';
            $('#modalDespachoPorLogistica').modal('show'); // SOLO SE ABRE SI HAY DATOS
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos logísticos',
                text: 'No hay datos logísticos cargados para el día.',
                confirmButtonColor: '#3085d6'
            });
        }

        spinner.style.display = 'none';
    }, (error) => {
        console.error("Error al cargar despachos:", error);
        spinner.style.display = 'none';
    });
}

async function finalizarColecta() {
    const tablaBody = document.getElementById('tabla-despacho-xLogistica-body');
    const filas = tablaBody.querySelectorAll('tr');
    if (filas.length === 0) {
        Swal.fire('Atención', 'No hay despachos para finalizar.', 'warning');
        return;
    }

    // Deshabilitar inputs
    filas.forEach(fila => {
        const inputs = fila.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.disabled = true);
    });

    // Cerrar modal inicial
    $('#modalDespachoPorLogistica').modal('hide');

Swal.fire({
    title: '',
    html: `
        <style>
            .macos-header {
                background: linear-gradient(135deg, #f9f9fb, #ffffff);
                padding: 15px 20px;
                border-radius: 14px;
                margin-bottom: 20px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0 -1px 0 rgba(0,0,0,0.06);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 20px;
                color: #1c1c1e;
                text-align: center;
                font-weight: 600;
            }

            .swal2-input {
                border: 1px solid #d0d0d5;
                border-radius: 10px;
                padding: 12px 16px;
                margin: 6px 0;
                font-size: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                width: 100%;
                background-color: #f4f4f7;
                transition: border-color 0.2s, box-shadow 0.2s;
                color: #1c1c1e;
            }

            .swal2-input:focus {
                border-color: #007aff;
                outline: none;
                background-color: #ffffff;
                box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25);
            }

            .swal2-popup {
                border-radius: 16px;
                padding: 30px;
                background: #ffffff;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }

            #cantidadDePallets {
                background: #fffdf5;
                border: 2px solid #f8c56c;
                color: #8a5b00;
                font-weight: 600;
                box-shadow: 0 0 8px rgba(255, 200, 80, 0.3);
            }

            #cantidadDePallets::placeholder {
                color: #a77c22;
                font-weight: 500;
            }

            hr {
                margin: 20px 0;
                border: none;
                border-top: 1px solid #e0e0e5;
            }
        </style>

        <div class="macos-header">📦 Detalles del Transporte</div>

        <input id="cantidadDePallets" class="swal2-input" placeholder="🪵 Pallets utilizados" required>

        <hr>

        <input id="nombreTransportista" class="swal2-input" placeholder="👤 Nombre del transportista" required>
        <input id="dniTransportista" class="swal2-input" placeholder="🪪 DNI del transportista" required>
        <input id="marcaCamion" class="swal2-input" placeholder="🚚 Marca del camión" required>
        <input id="patenteCamion" class="swal2-input" placeholder="🔠 Patente del camión" required>
        <input id="marcaChasis" class="swal2-input" placeholder="🛠️ Marca del chasis (opcional)">
        <input id="patenteChasis" class="swal2-input" placeholder="🔡 Patente del chasis (opcional)">

        <script>
            const ids = ['cantidadDePallets','nombreTransportista','dniTransportista','marcaCamion','patenteCamion','marcaChasis','patenteChasis'];
            ids.forEach((id, i) => {
                setTimeout(() => {
                    const input = document.getElementById(id);
                    if (input) {
                        input.addEventListener('keydown', e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const next = document.getElementById(ids[i+1]);
                                if (next) next.focus();
                            }
                        });
                    }
                }, 50);
            });
        </script>
    `,
    confirmButtonText: 'Guardar 🚀',
    confirmButtonColor: '#007aff',
    focusConfirm: false,
    didOpen: () => {
        document.getElementById('cantidadDePallets').focus();
    },
        preConfirm: () => {
            const pallets = document.getElementById('cantidadDePallets').value;
            const nombre = document.getElementById('nombreTransportista').value;
            const dni = document.getElementById('dniTransportista').value;
            const marcaCamion = document.getElementById('marcaCamion').value;
            const patenteCamion = document.getElementById('patenteCamion').value;

            if (!pallets || !nombre || !dni || !marcaCamion || !patenteCamion) {
                Swal.showValidationMessage('⚠️ Por favor, completá todos los campos obligatorios.');
            }

            return {
                pallets,
                nombre,
                dni,
                marcaCamion,
                patenteCamion,
                marcaChasis: document.getElementById('marcaChasis').value,
                patenteChasis: document.getElementById('patenteChasis').value
            };
        }  
    }).then(async (result) => {
        $('#modalDespachoPorLogistica').modal('show');

        filas.forEach(fila => {
            const inputs = fila.querySelectorAll('input, select, textarea');
            inputs.forEach(input => input.disabled = false);
        });

if (result.isConfirmed) {
    const { pallets, nombre, dni, marcaCamion, patenteCamion } = result.value;
    const Totalpallets = document.getElementById('cantidadDePallets').value || '';
    const marcaChasis = document.getElementById('marcaChasis').value || '';
    const patenteChasis = document.getElementById('patenteChasis').value || '';
    const fechaHoy = new Date();
    const fechaFormateada = `${fechaHoy.getFullYear()}-${(fechaHoy.getMonth() + 1).toString().padStart(2, '0')}-${fechaHoy.getDate().toString().padStart(2, '0')}`;
    const rutaBase = `DespachosHistoricos${logisticaActual.replace(/\s/g, '')}/${fechaFormateada}`;
    const despachos = [];
    let entregasNotificadas = 0;
    let montoTotal = 0;

    // Iterar sobre las filas de la tabla
    for (const fila of filas) {
        const columnas = fila.querySelectorAll('td');
        const remito = columnas[4].querySelector('.remito-tipeo-os')?.textContent.trim() || '';

        try {
            const remitoSnapshot = await dbTipeo.ref(`despachosDelDia/${remito}`).once('value');
            let info = 'Presea ❌'; // Valor por defecto

            if (remitoSnapshot.exists()) {
                const remitoData = remitoSnapshot.val();
                if (remitoData.Info) {
                    info = remitoData.Info;
                }
            }

            const valor = parseFloat(columnas[5].textContent.replace(/\./g, '').replace(',', '.').replace('$', '').trim()) || 0;
            montoTotal += valor;

            const despacho = {
                fechaHora: columnas[0].textContent.trim() || '',
                camion: columnas[1].textContent.trim() || '',
                seguimiento: columnas[2].textContent.trim() || '',
                bultos: columnas[3].textContent.trim() || '',
                remito: remito || '',
                valor: columnas[5].textContent.trim() || '',
                info: info 
            };
            despachos.push(despacho);
        } catch (error) {
            console.error("Error al buscar el remito:", error);
        }
    }

    dbTipeo.ref(rutaBase).once('value', snapshot => {
        const nuevoCamion = `CAMION ${Object.keys(snapshot.val() || {}).length + 1}`;

        Swal.fire({
            title: "Despachando en Logipaq...",
            html: "Por favor, espere mientras se actualizan los despachos.",
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const promises = despachos.map(despacho => {
            const remito = despacho.remito;
            const seguimiento = despacho.seguimiento;

            return dbMeli.ref(`/DespachosLogisticos/${remito}`).once('value').then(snapshot => {
                if (snapshot.exists()) {
                    const fechaHoraDeDespacho = new Date().toLocaleString('es-ES', { timeZone: 'UTC' });
                    return dbMeli.ref(`/DespachosLogisticos/${remito}`).update({
                        operadorLogistico: logisticaActual,
                        fechaHoraDeDespacho: fechaHoraDeDespacho,
                        numeroDeEnvio: seguimiento,
                        estado: "Despachado"
                    }).then(() => {
                        entregasNotificadas++;
                    });
                }
            });
        });

                Promise.all(promises).then(async () => {
                    // Guardar los remitos directamente bajo el camión
                    despachos.forEach(despacho => {
                        const remito = despacho.remito;
                        dbTipeo.ref(`${rutaBase}/${nuevoCamion}/${remito}`).set(despacho);
                    });

                    // Guardar los remitos en despachosHistoricosRemitos
                    despachos.forEach(despacho => {
                        const remito = despacho.remito;
                        dbTipeo.ref(`/despachosHistoricosRemitos/${remito}`).update({
                            remito: remito // Guardar el remito
                        });
                    });

                    // Guardar solo el seguimiento en despachosHistoricosEtiquetas
                    despachos.forEach(despacho => {
                        const seguimiento = despacho.seguimiento;
                        dbTipeo.ref(`/despachosHistoricosEtiquetas/${seguimiento}`).update({
                            seguimiento: despacho.seguimiento // Guardar el seguimiento
                        });
                    });

                    // Formatear el monto total en formato argentino sin decimales
                    const montoFormateado = `$ ${montoTotal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

                    const viajeData = {
                        nombreTransportista: nombre,
                        dniTransportista: dni,
                        marcaCamion: marcaCamion,
                        patenteCamion: patenteCamion,
                        marcaChasis: marcaChasis,
                        patenteChasis: patenteChasis,
                        montoTotal: montoFormateado,
                        fecha: fechaFormateada,
                        viaje: "Alvear, Santa Fe",
                        planta: logisticaActual,
                        kmArecorrer: "Varios",
                        pallets: Totalpallets,
                        claseDeMercaderia: "ELECTRODOMESTICOS"
                    };

                    // Push a carpeta especial según la logística
                    let carpetaLogistica = '';
                    switch (logisticaActual.toLowerCase()) {
                        case 'andreani': carpetaLogistica = 'seguroAndreani'; break;
                        case 'cruz del sur': carpetaLogistica = 'seguroCDS'; break;
                        case 'andesmar': carpetaLogistica = 'SeguroAndesmar'; break;
                        case 'oca': carpetaLogistica = 'SeguroOca'; break;
                    }

                    if (carpetaLogistica) {
                        dbTipeo.ref(`${carpetaLogistica}/${fechaFormateada}/${nuevoCamion}/`).set(viajeData);
                    }

                    // Generar y subir el Excel para obtener la URL de descarga
                    const downloadURL = await generarYSubirExcel(logisticaActual, nuevoCamion);

                    // Enviar correos electrónicos
                    const correos = await obtenerCorreosPorLogistica(logisticaActual);
                    const emailBody = generarCuerpoEmail(tablaBody, logisticaActual, montoFormateado, Totalpallets, downloadURL)

                    for (const destinatarioEmail of correos) {
                        await enviarCorreoConDetalles(destinatarioEmail, destinatarioEmail.split('@')[0], `Logística: ${logisticaActual}, Camión: ${nuevoCamion}, Fecha: ${fechaFormateada}`, new Date().toLocaleString(), emailBody);
                    }

                    Swal.fire({
                        title: '¡Finalizado con Éxito!',
                        html: `
                            <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 15px;">
                                    <p style="font-size: 16px; color: #333;">Guardada como <strong>"${nuevoCamion}"</strong> en <strong>${fechaFormateada}</strong>.</p>
                                    <div style="background-color: #A3D8FDFF; padding: 15px; border-radius: 10px; margin-top: 10px; color: #0d47a1; border: 1px solid #71BFFFFF;">
                                        <span style="font-size: 20px;">📦 Total de entregas notificadas: <strong>${entregasNotificadas}</strong></span>
                                    </div>
                                </div>
                            </div>
                        `,
                        icon: 'success',
                        showCloseButton: true,
                        focusConfirm: false,
                        confirmButtonText: 'Aceptar'
                    });

                    finalizarColectaMensaje()
                    limpiarDespachosDelDia();
                    actualizarTotales();
                });
            });
        }
    });
}

function finalizarColectaMensaje() {
    // Obtener la referencia a la tabla
    const tablaBody = document.getElementById('tabla-despacho-xLogistica-body');

    // Borrar todas las filas de la tabla
    while (tablaBody.firstChild) {
        tablaBody.removeChild(tablaBody.firstChild);
    }

    // Crear una nueva fila para el mensaje
    const nuevaFila = document.createElement('tr');
    const nuevaColumna = document.createElement('td');

    // Ajustar el colspan a 8
    nuevaColumna.colSpan = 8;
    nuevaColumna.className = 'text-center'; // Centrar el texto

    // Crear el mensaje con icono de Bootstrap
    nuevaColumna.innerHTML = `
        <span class="text-success">Se ha finalizado la colecta con éxito <i class="bi bi-check-circle-fill"></i></span>
    `;

    // Agregar la nueva columna a la nueva fila
    nuevaFila.appendChild(nuevaColumna);

    // Agregar la nueva fila al cuerpo de la tabla
    tablaBody.appendChild(nuevaFila);
}

async function enviarCorreoConDetalles(destinatarioEmail, nombreDestinatario, nombreTanda, horaSubida, emailBody) {
    const fecha = new Date().toLocaleDateString();
    const Subject = `📦NOVOGAR: LogiPaq - ${nombreTanda}`;
    const smtpU = 's154745_3';
    const smtpP = 'QbikuGyHqJ';

    const emailData = {
        "Html": {
            "DocType": null,
            "Head": null,
            "Body": emailBody,
            "BodyTag": "<body>"
        },
        "Text": "",
        "Subject": Subject,
        "From": {
            "Name": "Posventa Novogar",
            "Email": "posventa@novogar.com.ar"
        },
        "To": [
            {
                "Name": nombreDestinatario,
                "Email": destinatarioEmail
            }
        ],
        "Cc": [],
        "Bcc": ["webnovagar@gmail.com", "posventa@novogar.com.ar"],
        "CharSet": "utf-8",
        "User": {
            "Username": smtpU,
            "Secret": smtpP,
        }
    };

    try {
        const response = await fetch('https://proxy.cors.sh/https://send.mailup.com/API/v2.0/messages/sendmessage', {
            method: 'POST',
            headers: {
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        if (result.Status === 'done') {
            console.log(`Email enviado a ${destinatarioEmail}, Motivo: ${nombreTanda}`);
            showAlertPosventa(`Email enviado a ${destinatarioEmail}, Motivo: ${nombreTanda}`);
        } else {
            console.log(`Error al enviar el email: ${result.Message}`);
            showAlertErrorPosventa(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${horaSubida}`);
        }
    } catch (error) {
        console.error('Error al enviar el email:', error);
        showAlertErrorPosventa(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${horaSubida}`);
    }
}

// FUNCIÓN PARA GENERAR Y SUBIR EXCEL A FIREBASE STORAGE
async function generarYSubirExcel(logisticaActual, nuevoCamion) {
    try {
        const fechaHora = new Date();

        // Formatear la fecha y la hora
        const fechaFormateada = fechaHora.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const horaFormateada = fechaHora.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // Formato HH-MM-SS

        // Crear el nombre del archivo y la ruta de almacenamiento
        const nombreArchivo = `DatosDespacho_${logisticaActual}_${fechaFormateada}_${horaFormateada}.xlsx`;
        const storagePath = `ExcelDespachos/${logisticaActual}_${fechaFormateada}_${horaFormateada}`;

        // Crear el workbook como en tu función original
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Datos de Despacho');

        const headers = ['Fecha y hora', 'Transporte', 'Seguimiento', 'Bultos', 'Remito', 'Valor', 'Info'];
        worksheet.addRow(headers);

        const borderStyle = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FF000000' }, name: "Arial", size: 12 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFBFBFBF' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = borderStyle;
        });
        headerRow.height = 25;

        // Agregar datos de la tabla
        const filas = document.querySelectorAll('#tabla-despacho-xLogistica-body tr');
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            const rowData = [];

            celdas.forEach((celda, index) => {
                if (index === 1) {
                    rowData.push(logisticaActual);
                } else if (index < celdas.length - 1) {
                    if (index === 2) {
                        const link = celda.querySelector('a');
                        if (link) {
                            rowData.push({
                                text: link.innerText.trim(),
                                hyperlink: link.href
                            });
                        } else {
                            rowData.push(celda.innerText.trim());
                        }
                    } else {
                        rowData.push(celda.innerText.trim());
                    }
                }
            });

            const nuevaFila = worksheet.addRow(rowData);

            // Colores según transportista (como en tu código original)
            let colorTransporte = 'FFFFFFFF';
            if (logisticaActual === 'Andreani') colorTransporte = 'FFFFE0E0';
            else if (logisticaActual === 'Andesmar') colorTransporte = 'FFB2EBF2';
            else if (logisticaActual === 'Cruz del Sur') colorTransporte = 'FF90CAF9';
            else if (logisticaActual === 'Oca') colorTransporte = 'FFE6E6FA';

            const transporteCell = nuevaFila.getCell(2);
            transporteCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: colorTransporte }
            };

            const bultosCell = nuevaFila.getCell(4);
            const bultos = parseInt(bultosCell.value);
            if (!isNaN(bultos) && bultos > 1) {
                bultosCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFF0F0' }
                };
            }

            const seguimientoCell = nuevaFila.getCell(3);
            if (typeof seguimientoCell.value === 'object' && seguimientoCell.value.hyperlink) {
                seguimientoCell.font = {
                    color: { argb: 'FF0000FF' },
                    underline: true
                };
            }
        });

        // Aplicar bordes y alineación a todas las celdas
        const lastRow = worksheet.lastRow.number;
        for (let rowNumber = 1; rowNumber <= lastRow; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            row.eachCell(cell => {
                cell.border = borderStyle;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
        }

        // Autoajustar ancho de columnas
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                if (cell.value) {
                    const value = typeof cell.value === 'object' ? cell.value.text : cell.value;
                    maxLength = Math.max(maxLength, value.toString().length);
                }
            });
            column.width = maxLength + 2;
        });

        // Filtro y congelar cabecera
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: headers.length }
        };
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Generar buffer del Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // Subir a Firebase Storage
        const storageMeli = firebase.storage(appMeli); // Usa la instancia MELI
        const fileRef = storageMeli.ref().child(`ExcelDespachos/${logisticaActual}_${new Date().toISOString().split('T')[0]}_${nuevoCamion}.xlsx`);        
        await fileRef.put(buffer);
        
        // Obtener URL de descarga
        const downloadURL = await fileRef.getDownloadURL();
        console.log('Link descarga de Excel:',downloadURL)
        return downloadURL;
        

    } catch (error) {
        console.error('Error al generar o subir el archivo Excel:', error);
        throw error;
    }
}
// FIN FUNCIÓN PARA GENERAR Y SUBIR EXCEL A FIREBASE STORAGE

// FUNCIÓN MODIFICADA PARA GENERAR CUERPO DE EMAIL CON LINK A EXCEL
function generarCuerpoEmail(tablaBody, logisticaActual, montoFormateado, Totalpallets, downloadURL) {
    let totalBultos = 0;
    let totalBultosBigger = 0;
    let totalBultosPaqueteria = 0;
    let totalEtiquetas = 0;

    const filas = tablaBody.querySelectorAll('tr');
    totalEtiquetas = filas.length; // Total de filas

    filas.forEach(fila => {
        const columnas = fila.querySelectorAll('td');
        const bultos = parseInt(columnas[3].textContent.trim());
        const valor = parseFloat(columnas[5].textContent.replace(/[$.]/g, '').replace(',', '.').trim());

        totalBultos += bultos;

        // Contar bultos según el tipo para Andreani
        if (logisticaActual === 'Andreani') {
            if (columnas[2].textContent.trim().startsWith('40')) {
                totalBultosBigger += bultos;
            } else if (columnas[2].textContent.trim().startsWith('36')) {
                totalBultosPaqueteria += bultos;
            }
        }
    });

    let cuerpoEmail = `
    <div style="margin-bottom: 20px; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; text-align: center;">Detalles de Envío</h2>
        <div style="padding: 15px; margin: 10px 0; text-align: center; border: 1px solid #007aff; border-radius: 8px; background-color: #f0f8ff;">
            <strong>Total de Etiquetas:</strong> <strong style="color: #007aff;">${totalEtiquetas}</strong>
        </div>
        <div style="padding: 15px; margin: 10px 0; text-align: center; border: 1px solid #007aff; border-radius: 8px; background-color: #f0f8ff;">
            <strong>Total de Bultos:</strong> <strong style="color: #007aff;">${totalBultos}</strong>
        </div>
        <div style="padding: 15px; margin: 10px 0; text-align: center; border: 1px solid #4CAF50; border-radius: 8px; background-color: #e8f5e9;">
            <strong>Valor Declarado:</strong> <strong style="color: #4CAF50;">${montoFormateado}</strong>
        </div>
        <hr>
        <div style="padding: 15px; margin: 10px 0; text-align: center; border: 1px solid #FF9800; border-radius: 8px; background-color: #fff3e0;">
            <strong>Pallets Utilizados:</strong> <strong>${Totalpallets}</strong>
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <a href="${downloadURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Descargar Tabla en Excel</a>
        </div>
    </div>
    `;

    if (logisticaActual === 'Andreani') {
        cuerpoEmail += `
            <div style="margin-bottom: 20px; padding: 20px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h3 style="color: #333333; text-align: center;">Detalles de Bultos Andreani</h3>
                <div style="padding: 15px; margin: 10px 0; text-align: center; border: 1px solid #007aff; border-radius: 8px; background-color: #f0f8ff;">
                    <strong>Total Bultos Bigger:</strong> <strong style="color: #007aff;">${totalBultosBigger}</strong>
                </div>
                <div style="padding: 15px; margin: 10px 0; text-align: center; border: 1px solid #007aff; border-radius: 8px; background-color: #f0f8ff;">
                    <strong>Total Bultos Paquetería:</strong> <strong style="color: #007aff;">${totalBultosPaqueteria}</strong>
                </div>
            </div>
        `;
    }

    cuerpoEmail += `
        <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr style="background-color: #007aff; color: #ffffff;">
                    <th style="border: 1px solid #cccccc; padding: 8px;">Fecha/Hora</th>
                    <th style="border: 1px solid #cccccc; padding: 8px;">Camión</th>
                    <th style="border: 1px solid #cccccc; padding: 8px;">Seguimiento</th>
                    <th style="border: 1px solid #cccccc; padding: 8px;">Bultos</th>
                    <th style="border: 1px solid #cccccc; padding: 8px;">Remito</th>
                    <th style="border: 1px solid #cccccc; padding: 8px;">Valor</th>
                    <th style="border: 1px solid #cccccc; padding: 8px;">Info</th>
                </tr>
            </thead>
            <tbody>
    `;

    filas.forEach(fila => {
        cuerpoEmail += '<tr>';
        const columnas = fila.querySelectorAll('td');

        // Iterar solo hasta la penúltima columna para omitir la última
        for (let index = 0; index < columnas.length - 1; index++) {
            const columna = columnas[index];
            if (index === 2) {
                // Extraer el hipervínculo en la tercera columna
                const link = columna.querySelector('a');
                if (link) {
                    cuerpoEmail += `<td style="border: 1px solid #cccccc; padding: 8px;"><a href="${link.href}" style="text-decoration: none; color: #007aff;">${link.textContent.trim()}</a></td>`;
                } else {
                    cuerpoEmail += `<td style="border: 1px solid #cccccc; padding: 8px;">${columna.textContent.trim()}</td>`;
                }
            } else if (index === 3) {
                // Estilo para la columna "Bultos"
                const bultos = parseInt(columna.textContent.trim());
                cuerpoEmail += `
                                <td style="border: 1px solid #cccccc; padding: 8px; font-weight: bold;">
                                    ${bultos}
                                </td>
                            `;
            } else if (index === 4) {
                // Estilo para la columna "Remito"
                const remito = columna.textContent.trim();
                cuerpoEmail += `<td style="border: 1px solid #cccccc; padding: 8px; font-weight: bold;">${remito}</td>`;
            } else if (index === 5) {
                // Estilo para la columna "Valor"
                const valor = columna.textContent.trim();
                cuerpoEmail += `<td style="border: 1px solid #cccccc; padding: 8px; font-weight: bold;">${valor}</td>`;
            } else {
                cuerpoEmail += `<td style="border: 1px solid #cccccc; padding: 8px;">${columna.textContent.trim()}</td>`;
            }
        }
        
        cuerpoEmail += '</tr>';
    });

    cuerpoEmail += `
            </tbody>
        </table>
    `;
    return cuerpoEmail;
}

async function obtenerCorreosPorLogistica(logistica) {
    const rutaCorreos = `Emails${logistica.charAt(0).toUpperCase() + logistica.slice(1)}`;
    const snapshot = await dbTipeo.ref(rutaCorreos).once('value');
    const correos = [];

    snapshot.forEach(child => {
        correos.push(child.val());
    });

    return correos;
}

function limpiarDespachosDelDia() {
    dbTipeo.ref('despachosDelDia')
        .orderByChild('logistica')
        .equalTo(logisticaActual)
        .once('value', snapshot => {
            snapshot.forEach(child => {
                dbTipeo.ref(`despachosDelDia/${child.key}`).remove();
            });
        });
}
// FIN RENDERIZADO DE TABLA POR LOGISTICA EN MODAL

// ALERT EMAIL
let alertCount = 0;

function showAlertPosventa(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    document.body.appendChild(alertElement);
    alertElement.style.bottom = `${20 + alertCount * 70}px`;
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    alertElement.querySelector('.close').onclick = () => {
        closeAlert(alertElement);
    };
    setTimeout(() => {
        closeAlert(alertElement);
    }, 8000);
    alertCount++;
    }
    
    function showAlertErrorPosventa(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alertError';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    document.body.appendChild(alertElement);
    alertElement.style.bottom = `${20 + alertCount * 70}px`;
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    alertElement.querySelector('.close').onclick = () => {
        closeAlert(alertElement);
    };
    setTimeout(() => {
        closeAlert(alertElement);
    }, 8000);
    alertCount++;
    }
    
    function closeAlert(alertElement) {
    alertElement.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(alertElement);
        alertCount--;
        updateAlertPositions();
    }, 300);
    }

    function updateAlertPositions() {
        const alerts = document.querySelectorAll('.alert, .alertError');
        alerts.forEach((alert, index) => {
            alert.style.bottom = `${20 + index * 70}px`;
        });
    }
// FIN ALERT EMAIL

// RENDERIZADO DE FILAS EN LA TABLA
window.onload = async () => {
    await cargarDespachos(); 
    console.log("Despachos cargados");
    setTimeout(async () => {
        await actualizarTotales();
        console.log("Totales actualizados");
    }, 2000);
    await verificarDocumentacionPendiente();
    await setInterval(verificarDocumentacionPendiente, 30 * 60 * 1000); // Cada 30 minutos
};

function cargarDespachos() {
    dbTipeo.ref('despachosDelDia').on('value', (snapshot) => {
        const data = snapshot.val();
        tablaBody.innerHTML = ''; 
        if (data) {
            Object.keys(data).forEach((remito) => {
                const despacho = data[remito];
                const tablaBody = document.getElementById('tabla-despacho-body');
                agregarFilaTabla(remito, despacho, tablaBody);
            });
        } else {
            mostrarMensajeNoHayDespachos();
        }
        spinner.style.display = 'none'; 
    }, (error) => {
        console.error("Error al cargar despachos:", error);
    });
}

function agregarFilaTabla(remito, despacho, tablaBody) {
    const fecha = new Date(despacho.fecha).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });    
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

    const logisticaTexto = document.createElement('span');
    logisticaTexto.textContent = logistica; 
    logisticaTexto.classList.add('logistica-texto'); 

    logisticaDiv.appendChild(logisticaTexto); 
    logisticaDiv.appendChild(circuloDiv); 

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
    <td class="remito-tabla-despacho">
        <div class="remito-tipeo-os">${remito}</div>
        ${despacho.Info ? generarProductosRemito(despacho.Info) : ''}
    </td>
    <td><div class="valor-tabla-despacho">${despacho.valor}</div></td>
    <td class="info-tabla-despacho">
        ${despacho.Info ? generarInfoCliente(despacho.Info) : 'Presea ❌'}
    </td>
    <td class="delete-tabla-despacho">
        <button class="btn btn-danger btn-sm" onclick="confirmarEliminacion('${remito}')">
            <i class="ml-1 bi bi-trash3-fill"></i>
        </button>
    </td>
`;

const logisticaCell = row.querySelector('.logistica-tabla-despacho');
logisticaCell.appendChild(logisticaDiv);

tablaBody.appendChild(row);
actualizarTotales();
}

function generarInfoCliente(info) {
    return `
        <div class="infoMacOsy">
            <div class="infoHeaderMacOsy"></div>
            <div class="infoDetalleMacOsy">
                <span class="infoUserMac"><i>👤</i> ${info.cliente}</span>
                <span><i>🏷️</i> ${info.nombre}</span>
                <span><i>📍</i> ${info.localidad} (${info.cp})</span>
            </div>
        </div>
    `;
}

function generarProductosRemito(info) {
    const productos = [];
    for (let i = 1; i <= 2; i++) {
        const producto = info[`producto${i}`];
        const cantidad = info[`cantidad${i}`];
        const descripcion = info[`descripcion${i}`];

        if (producto && producto !== 'ENVIO' && producto !== '110') {
            // Determinar la clase de cantidad según el valor
            const cantidadClass = cantidad === 1 ? 'productoCantidadMacOsy' : 'productoCantidadMacOsyMasDos';

            productos.push(`
                <div class="productoMacOsy">
                    <div class="productoTopMacOsy">
                        <div class="productoNombreMacOsy">📦 ${producto}</div>
                        <div class="${cantidadClass}">${cantidad}</div>
                    </div>
                    <div class="productoDescripcionMacOsy">📝 ${descripcion}</div>
                </div>
            `);
        }
    }

    return `<div class="productosRemitoMacOsy">${productos.join('')}</div>`;
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
            actualizarTotales()
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
const emailsError = [
  { nombre: "Lucas Ponzoni", email: "lucas.ponzoni@novogar.com.ar" },
  { nombre: "Lucas Ponzoni", email: "lucasponzoninovogar@gmail.com" },
  { nombre: "Esperanza Toffalo", email: "esperanza.toffalo@novogar.com.ar" },
  { nombre: "Mauricio Daffonchio", email: "mauricio.daffonchio@novogar.com.ar" }
];

const verificarRemitoYEtiqueta = async (remito, etiqueta) => {
  try {
    // Verificar si el remito está en el rango
    if (remito >= '23000006572' && remito <= '23000006590') {
      console.log('No se requiere verificación para el remito:', remito);
      return true;
    }

    const filas = tablaBody.getElementsByTagName('tr');
    const remitosEnTabla = new Set(Array.from(filas).map(row => row.querySelector('.remito-tipeo-os')?.textContent.trim()));
    const etiquetasEnTabla = new Set(Array.from(filas).map(row => row.querySelector('.seguimiento-tabla-despacho a')?.textContent.trim()));

    const [remitosSnapshot, etiquetasSnapshot] = await Promise.all([
      dbTipeo.ref('despachosHistoricosRemitos').once('value'),
      dbTipeo.ref('despachosHistoricosEtiquetas').once('value')
    ]);

    const remitosFirebase = new Set(Object.values(remitosSnapshot.val() || {}).map(item => item.remito));
    const etiquetasFirebase = new Set(Object.values(etiquetasSnapshot.val() || {}).map(item => item.seguimiento));

    const remitoDuplicado = remitosEnTabla.has(remito) || remitosFirebase.has(remito);
    const etiquetaDuplicada = etiquetasEnTabla.has(etiqueta) || etiquetasFirebase.has(etiqueta);

    if (remitoDuplicado) {
      await manejarError('Remito duplicado 📦', remito, etiqueta, true, false);
      return false;
    }

    if (etiquetaDuplicada) {
      await manejarError('Etiqueta duplicada 🏷️', remito, etiqueta, false, true);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Error en la verificación:", error);
    await manejarError('Error', remito, etiqueta, error.message);
    return false;
  }
};

const manejarError = async (titulo, remito, etiqueta, remitoFirebase = false, etiquetaFirebase = false) => {
  Swal.fire({
    icon: 'error',
    title: titulo,
    text: `El ${titulo.includes('Remito') ? 'remito' : 'etiqueta'} ya fue utilizado anteriormente.`,
    allowOutsideClick: false
  });

  const emailBody = generarEmailErrorHTML(remito, etiqueta, remitoFirebase, false, etiquetaFirebase, false);
  await enviarCorreosDeError(titulo, emailBody);
};

const enviarCorreosDeError = async (nombreTanda, emailBody) => {
  const hora = new Date().toLocaleTimeString();
  for (const contacto of emailsError) {
    await enviarCorreoConDetalles(contacto.email, contacto.nombre, nombreTanda, hora, emailBody);
  }
};

const generarEmailErrorHTML = (remito, etiqueta, remitoFirebase, remitoTabla, etiquetaFirebase, etiquetaTabla) => {
  let contenido = `<h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 8px;">📢 LogiPaq Informa</h2>
  <p style="font-family: 'Menlo', monospace; color: #333;">🔍 Se escaneó:</p>
  <ul style="color: #333;">
    <li>📦 <strong>Remito:</strong> ${remito}</li>
    <li>🏷️ <strong>Etiqueta:</strong> ${etiqueta}</li>
  </ul>
  <p style="font-family: 'Menlo', monospace; color: #555;">Resultado de verificación:</p>
  <ul style="color: #d32f2f;">`;

  if (remitoFirebase) contenido += `<li>✅ Remito ya existe en Firebase (<code>despachosHistoricosRemitos</code>)</li>`;
  if (remitoTabla) contenido += `<li>✅ Remito ya está en la tabla actual</li>`;
  if (etiquetaFirebase) contenido += `<li>✅ Etiqueta ya existe en Firebase (<code>despachosHistoricosEtiquetas</code>)</li>`;
  if (etiquetaTabla) contenido += `<li>✅ Etiqueta ya está en la tabla actual</li>`;

  contenido += `</ul>
  <p style="color: #333;">⚠️ Esta acción fue bloqueada automáticamente.</p>
  <p style="font-size: 13px; color: #999;">Enviado por LogiPaq - ${new Date().toLocaleString()}</p>`;

  return contenido;
};

const inputRemito = document.getElementById('inputRemito');
const inputEtiqueta = document.getElementById('inputEtiqueta');
const inputBultos = document.getElementById('inputBultos');
const inputValor = document.getElementById('inputValor');
const inputLogistica = document.getElementById('inputLogistica');
const tablaBody = document.getElementById('tabla-despacho-body');

const validPrefixes = ['83', '89', '230', '238', '231', '233', '254'];

const formatearPesos = (valor) => {
  const num = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
  if (isNaN(num)) return null;
  return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

inputRemito.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
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
            return;
        }

        // Verificar si el checkbox de múltiples etiquetas está activo
        const checkboxEtiquetas = document.getElementById('checkboxEtiquetas');
        
        if (checkboxEtiquetas.checked) {
            // Buscar remitos existentes (ignorando M+número al final)
            const remitosExistentes = Array.from(document.querySelectorAll('.remito-tipeo-os'));
            const baseRemito = val.replace(/M\d+$/, '');
            
            // Filtrar coincidencias (sin considerar M+número)
            const coincidencias = remitosExistentes.filter(remito => {
                return remito.textContent.trim().replace(/M\d+$/, '') === baseRemito;
            });

            if (coincidencias.length > 0) {
                // Agregar M+número secuencial
                inputRemito.value = baseRemito + 'M' + (coincidencias.length + 1);
            }
        }

        const etiqueta = inputEtiqueta.value.trim();
        const verificacion = await verificarRemitoYEtiqueta(inputRemito.value.trim(), etiqueta);
        
        if (!verificacion) {
            return; // Detener el flujo si hay un error
        }

        inputRemito.classList.remove('is-invalid');
        inputEtiqueta.focus();
    }
});

inputEtiqueta.addEventListener('input', (e) => {
    // Reemplazar comillas simples por guiones y convertir a mayúsculas en el input
    inputEtiqueta.value = inputEtiqueta.value.trim().replace(/'/g, '-').toUpperCase();
  });
  
  inputEtiqueta.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      const val = inputEtiqueta.value.trim(); // No es necesario procesar de nuevo
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
      } else if (/^\d{16}$/.test(val)) {
        logistica = 'Cruz del Sur';
        inputBultos.value = parseInt(val.slice(-4), 10);        // últimos 4 dígitos
        inputBultos.disabled = true;
        inputEtiqueta.value = val.slice(3, 12);
        inputValor.focus();    
      } else if (/^4146\d{15,}-\d+$/.test(val)) {
        logistica = 'Oca';
        const partes = val.split('-');
        inputEtiqueta.value = partes[0];
        inputBultos.value = parseInt(partes[1], 10);
        inputBultos.disabled = true; 
        inputValor.focus(); 
      } else if (/^NOV/.test(val) || /^PTO/.test(val) || /^CP/.test(val) || /^BNA/.test(val) || /ME1$/.test(val)) {
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
    inputBultos.value = bultosFinal || '1'; 
    inputBultos.disabled = true; 
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

    const fecha = new Date().toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
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
      <td class="info-tabla-despacho" data-remito=${remito}>Esperando...</td>
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
    
    // Reset
    inputRemito.value = '';
    inputEtiqueta.value = '';
    inputBultos.value = '';
    inputValor.value = '';
    inputLogistica.value = '';
    inputBultos.disabled = false;

    // Desmarcar el checkbox
    document.getElementById('checkboxRepuesto').checked = false;
    document.getElementById('checkboxEtiquetas').checked = false;

    inputRemito.focus();

  }

  function crearCirculo(logistica) {
    if (!logistica) return null;

    const logisticaDiv = document.createElement('div');
    logisticaDiv.classList.add('logistica-contenedor');

    const logisticaTexto = document.createElement('span');
    logisticaTexto.textContent = logistica;
    logisticaTexto.classList.add('logistica-texto'); 
    logisticaDiv.appendChild(logisticaTexto);

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
    circuloDiv.classList.add('logistica-circulo-oculto');
    logisticaDiv.appendChild(circuloDiv);

    return logisticaDiv;
}
});

const limpiarValidacion = (input) => {
  input.classList.remove('is-invalid');
};

[inputRemito, inputEtiqueta, inputBultos, inputValor].forEach(input => {
  input.addEventListener('input', () => limpiarValidacion(input));
});

const modalDespacho = document.getElementById('modalDespacho');
modalDespacho.addEventListener('shown.bs.modal', () => {
  inputRemito.focus();
  // Desmarcar el checkbox
  document.getElementById('checkboxRepuesto').checked = false;
  document.getElementById('checkboxEtiquetas').checked = false;
});

const agregarDespachoSiNoExiste = async (remito, etiqueta, logistica) => {

    const remitoOriginal = remito;

    // Convertir el remito a número para la comparación
    const remitoLimpio = remito.replace(/M=?\d+$/, '');
    
    // Convertir a número (según tu nueva solicitud)
    const remitoNumero = parseInt(remitoLimpio);

    // Verificar si el remito está entre 6572 y 6590 (repuestos posventa)
    const esRepuestoPosventa = remitoNumero >= 23000006572 && remitoNumero <= 23000006590;

    if (esRepuestoPosventa) {
        console.log("El remito es un repuesto de Posventa. Solo se agregará a Info.");
        try {
            const remitoSnapshot = await dbStock.ref(`RemitosWeb/${remitoLimpio}`).once('value');
            if (remitoSnapshot.exists()) {
                await dbTipeo.ref(`despachosDelDia/${remitoOriginal}/Info`).set(remitoSnapshot.val());
                console.log("Remito de posventa agregado en 'Info'");
            }
        } catch (error) {
            console.error("Error al procesar remito de posventa:", error);
        }
        return;
    }

    if (logistica.toLowerCase() === "oca") {
        console.log("La logística es 'oca', no se ejecutará la búsqueda de Logística Propia");
        return;
    }

    try {
        const remitoSnapshot = await dbStock.ref(`RemitosWeb/${remitoLimpio}`).once('value');

        if (remitoSnapshot.exists()) {
            const remitoData = remitoSnapshot.val();
            const cp = remitoData.cp;

            // Buscar CP en las rutas de logística propia
            const carpetas = [
                { nombre: 'CamionBsAs', etiqueta: 'Buenos Aires' },
                { nombre: 'CamionRafaela', etiqueta: 'Rafaela' },
                { nombre: 'CamionRosario', etiqueta: 'Rosario' },
                { nombre: 'CamionSNicolas', etiqueta: 'San Nicolás' },
                { nombre: 'CamionStaFe', etiqueta: 'Santa Fe' }
            ];

            let coincidencia = null;

            for (let i = 0; i < carpetas.length; i++) {
                const snapshot = await dbLogisticasNovo.ref(`${carpetas[i].nombre}/${cp}`).once('value');
                if (snapshot.exists()) {
                    coincidencia = carpetas[i].etiqueta;
                    break;
                }
            }

            if (coincidencia) {
                await Swal.fire({
                    icon: 'warning',
                    title: '⚠️ CP incluido en Logística Propia',
                    text: `Estás intentando despachar un producto que podría estar incluido en Logística Propia: ${coincidencia}. Se notificará al gerente, pero podés continuar.`
                });

                // Crear cuerpo del email con estilo MacOS
                const emailBody = `
                <h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 8px;">📢 LogiPaq Informa</h2>
                <p style="font-family: 'Helvetica', sans-serif; color: #555;">🚨 <strong>Alerta</strong>: Estan intentando despachar un producto con un código postal (CP) que podría estar incluido en logística propia. 🌍</p>
                <p style="font-family: 'Helvetica', sans-serif; color: #555;">👉 El remito <strong>${remito}</strong> tiene el CP <strong>${cp}</strong> y está relacionado con <strong>${coincidencia}</strong> (camión de logística propia). Se esta intentando despachar por ${logistica} con etiqueta ${etiqueta}</p>

                <div style="background-color: #f5f5f5; border-radius: 12px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: 'Helvetica', sans-serif; color: #333; margin-top: 20px;">
                    <p style="font-size: 18px; font-weight: bold; color: #1976d2;">📝 Detalles del Remito:</p>
                    <pre style="background-color: #fff; padding: 15px; border-radius: 10px; font-size: 14px; color: #333; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); white-space: pre-wrap;">
                        ${JSON.stringify(remitoData, null, 4)}
                    </pre>
                </div>

                <p style="font-family: 'Helvetica', sans-serif; color: #555; margin-top: 20px;">📢 Se notifica un error en el despacho.</p>
                <p style="font-family: 'Helvetica', sans-serif; color: #555;">🖥️ Este es un aviso automático generado para asegurar la correcta gestión de los envíos. Gracias por tu atención. 🚚</p>
                `;

                enviarCorreosDeError("Alerta Logística Propia - Remito " + remito, emailBody);
            }

            // Guardar en Info para todos los casos (incluyendo repuestos posventa)
            await dbTipeo.ref(`despachosDelDia/${remitoOriginal}/Info`).set(remitoData);
            console.log("Remito encontrado y agregado en 'Info':", remitoData);
        } else {
            console.log("Remito no encontrado:", remito);
        }
    } catch (error) {
        console.error("Error al procesar el remito:", error);

        // Enviar un correo en caso de error con el detalle del remito (excepto para repuestos posventa)
        if (!esRepuestoPosventa) {
            const emailBody = `
            <h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 8px;">📢 LogiPaq Informa</h2>
            <p style="font-family: 'Helvetica', sans-serif; color: #555;">❌ Se produjo un error inesperado verificando el remito <strong>${remito}</strong>.</p>
            <p style="font-family: 'Helvetica', sans-serif; color: #555;"><strong>Error técnico:</strong> ${error.message}</p>
                    `;
            enviarCorreosDeError("Error de sistema - Verificación de Remito", emailBody);
        }
    }
};

function agregarDespacho(remito, etiqueta, bultos, valor, logistica) {
    // Limpiar el remito quitando "M+número" si existe
    const remitoLimpio = remito.replace(/M\d+$/, '');
    
    const despachoData = {
        etiqueta: etiqueta,
        bultos: bultos,
        valor: valor,
        logistica: logistica,
        fecha: new Date().toISOString() 
    };

    // Llama a la función para agregar el remito (usando la versión limpia)
    agregarDespachoSiNoExiste(remito, etiqueta, logistica);

    // Agregar el despacho actual usando el remito limpio
    dbTipeo.ref(`despachosDelDia/${remito}`).set(despachoData)
        .then(() => {
            console.log("Despacho agregado correctamente:", despachoData);
        })
        .catch((error) => {
            console.error("Error al agregar despacho:", error);
        });
}
// FIN TIPEO DE DESPACHO

// MODAL EMAILS
// Función para mostrar alertas
function mostrarAlerta(alertContainerId, mensaje, tipo) {
    const alertContainer = document.getElementById(alertContainerId);
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="${tipo === 'danger' ? 'fas fa-exclamation-triangle' : 'fas fa-check'}"></i>
            ${mensaje}
        </div>
    `;
    alertContainer.style.display = 'block'; // Mostrar alerta

    // Ocultar alerta después de 5 segundos
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 3000);
}

// Función para cargar emails desde Firebase
function cargarEmails(logistica) {
    const emailBody = document.getElementById('EmailBody');
    emailBody.innerHTML = ''; // Limpiar la tabla

    dbTipeo.ref(`/Emails${logistica}`).once('value').then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const email = childSnapshot.val();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${email}</td>
                    <td>
                        <button class="btn btn-danger btn-sm deleteEmail" data-id="${childSnapshot.key}"><i class="ml-1 bi bi-trash3-fill"></i></button>
                    </td>
                `;
                emailBody.appendChild(row);
            });
        } else {
            const noEmailsRow = document.createElement('tr');
            noEmailsRow.innerHTML = `<td colspan="2">No hay Emails de notificaciones para esta logística <i class="bi bi-exclamation-circle"></i></td>`;
            emailBody.appendChild(noEmailsRow);
        }
    });
}

// Evento para abrir el modal y cargar datos
document.querySelectorAll('.btn.emailAndreani, .btn.emailAndesmar, .btn.emailOca, .btn.emailCDS').forEach(button => {
    button.addEventListener('click', function() {
        const logistica = this.getAttribute('data-logistica');
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = `Emails de notificaciones - ${logistica}`;

        // Mostrar el spinner
        const loadingSpinner = document.getElementById('loadingSpinnerPlaceIt');
        loadingSpinner.style.display = 'block';

        // Cargar los datos desde Firebase
        cargarEmails(logistica);
        loadingSpinner.style.display = 'none'; // Ocultar el spinner
    });
});

// Evento para agregar emails
document.getElementById('addEmailPorLogistica').addEventListener('click', function() {
    const newEmail = document.getElementById('newEmailPorLogistica').value;
    const logistica = document.getElementById('modalTitle').textContent.split('-')[1].trim();

    dbTipeo.ref(`/Emails${logistica}`).once('value').then(snapshot => {
        let emailExists = false;
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.val() === newEmail) {
                emailExists = true;
            }
        });

        if (emailExists) {
            mostrarAlerta('alertContainerEmail', 'El Email ya existe en el listado', 'danger');
        } else {
            // Agregar el email a Firebase y obtener un ID único
            dbTipeo.ref(`/Emails${logistica}`).push(newEmail).then(() => {
                mostrarAlerta('alertContainerEmail', 'Se ha agregado el Email al listado', 'success');
                cargarEmails(logistica); // Recargar la tabla
                document.getElementById('newEmailPorLogistica').value = ''; // Limpiar el campo de entrada
            });
        }
    });
});

// Evento para eliminar emails
document.getElementById('EmailBody').addEventListener('click', function(event) {
    const deleteBtn = event.target.closest('.deleteEmail');
    if (deleteBtn) {
        const idToDelete = deleteBtn.getAttribute('data-id');
        const logistica = document.getElementById('modalTitle').textContent.split('-')[1].trim();

        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás deshacer esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar!'
        }).then((result) => {
            if (result.isConfirmed) {
                dbTipeo.ref(`/Emails${logistica}/${idToDelete}`).remove().then(() => {
                    mostrarAlerta('alertContainerEmail', 'Email eliminado con éxito', 'success');
                    cargarEmails(logistica); // Recargar la tabla
                }).catch(error => {
                    mostrarAlerta('alertContainerEmail', 'Error al eliminar el Email: ' + error.message, 'danger');
                });
            }
        });
    }
});
// FIN MODAL EMAILS

// DESCARGAR TABLA EN EXCEL
function descargarTablaExcel() {
    const modalTitle = document.getElementById('modalDespachoPorLogisticaLabel').innerText;
    const transportista = modalTitle.split('-')[1].trim();
    const fechaHora = new Date().toLocaleString();
    const nombreArchivo = `Datos de Despacho - ${transportista} ${fechaHora}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos de Despacho');

    const headers = ['Fecha y hora', 'Transporte', 'Seguimiento', 'Bultos', 'Remito', 'Valor', 'Info'];
    worksheet.addRow(headers);

    const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FF000000' }, name: "Arial", size: 12 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFBFBFBF' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = borderStyle;
    });
    headerRow.height = 25;

    const filas = document.querySelectorAll('#tabla-despacho-xLogistica-body tr');
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        const rowData = [];

        celdas.forEach((celda, index) => {
            if (index === 1) {
                // Transporte
                rowData.push(transportista);
            } else if (index < celdas.length - 1) {
                if (index === 2) {
                    const link = celda.querySelector('a');
                    if (link) {
                        rowData.push({
                            text: link.innerText.trim(),
                            hyperlink: link.href
                        });
                    } else {
                        rowData.push(celda.innerText.trim());
                    }
                } else {
                    rowData.push(celda.innerText.trim());
                }
            }
        });

        const nuevaFila = worksheet.addRow(rowData);

        // Colores según transportista
        let colorTransporte = 'FFFFFFFF'; // blanco por defecto
        if (transportista === 'Andreani') colorTransporte = 'FFFFE0E0';       // rojo claro
        else if (transportista === 'Andesmar') colorTransporte = 'FFB2EBF2';  // celeste claro
        else if (transportista === 'Cruz del Sur') colorTransporte = 'FF90CAF9'; // azul claro
        else if (transportista === 'Oca') colorTransporte = 'FFE6E6FA';       // lila claro

        // Aplicar color al campo "Transporte" (columna 2)
        const transporteCell = nuevaFila.getCell(2);
        transporteCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorTransporte }
        };

        // Aplicar color al campo "Bultos" (columna 4) si es mayor a 1
        const bultosCell = nuevaFila.getCell(4);
        const bultos = parseInt(bultosCell.value);
        if (!isNaN(bultos) && bultos > 1) {
            bultosCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF0F0' } // rojo claro para bultos > 1
            };
        }

        // Estilo de hipervínculo en columna 3 si lo hay
        const seguimientoCell = nuevaFila.getCell(3);
        if (typeof seguimientoCell.value === 'object' && seguimientoCell.value.hyperlink) {
            seguimientoCell.font = {
                color: { argb: 'FF0000FF' }, // azul
                underline: true
            };
        }
    });

    // Bordes y alineación a todas las celdas
    const lastRow = worksheet.lastRow.number;
    for (let rowNumber = 1; rowNumber <= lastRow; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        row.eachCell(cell => {
            cell.border = borderStyle;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
    }

    // Autoajustar ancho
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            if (cell.value) {
                const value = typeof cell.value === 'object' ? cell.value.text : cell.value;
                maxLength = Math.max(maxLength, value.toString().length);
            }
        });
        column.width = maxLength + 2;
    });

    // Filtro y congelar cabecera
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length }
    };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = nombreArchivo;
        link.click();
    }).catch(error => {
        console.error('Error al generar el archivo Excel:', error);
    });
}
// FIN DESCARGAR TABLA EN EXCEL

// CALENDARIO HISTORIAL DE TIPEO
// Evento al hacer clic en los botones de historial
$('.historial-Andreani, .historial-Andesmar, .historial-oca, .historial-cds').on('click', function () {
    const btn = $(this);
    const offset = btn.offset();

    // Detectar la logística
    let logistica = '';
    if (btn.hasClass('historial-Andreani')) logistica = 'DespachosHistoricosAndreani';
    else if (btn.hasClass('historial-Andesmar')) logistica = 'DespachosHistoricosAndesmar';
    else if (btn.hasClass('historial-oca')) logistica = 'DespachosHistoricosOca';
    else if (btn.hasClass('historial-cds')) logistica = 'DespachosHistoricosCruzdelSur';

    const datePickerContainer = $('<input type="text" style="position:absolute; z-index:-1; width:0; height:0; opacity:0; pointer-events:none;">');
    $('body').append(datePickerContainer);

    dbTipeo.ref(logistica).once('value', function (snapshot) {
        const fechasConCamiones = {};

        snapshot.forEach(child => {
            const fecha = child.key;
            const camiones = Object.keys(child.val());
            fechasConCamiones[fecha] = camiones;
        });

        flatpickr(datePickerContainer[0], {
            mode: 'single',
            dateFormat: 'Y-m-d',
            maxDate: new Date(),
            locale: 'es',
            onDayCreate: function (dObj, dStr, fp, dayElem) {
                const fechaStr = dayElem.dateObj.toISOString().split('T')[0];
                if (fechasConCamiones[fechaStr]) {
                    const cantidad = fechasConCamiones[fechaStr].length;
                    const badge = document.createElement('span');
                    badge.textContent = cantidad;
                    badge.className = 'badge-camiones-historial-tipeo';
                    dayElem.appendChild(badge);
                }
            },
            onClose: function (selectedDates) {
                const fechaKey = selectedDates[0].toISOString().split('T')[0];
                const camiones = fechasConCamiones[fechaKey];

                if (camiones && camiones.length > 0) {
                    mostrarSelectorDeCamiones(camiones, fechaKey, logistica);
                } else {
                    Swal.fire('Sin datos', 'No hay camiones para esta fecha.', 'info');
                }
                datePickerContainer.remove();
            }
        });

        datePickerContainer.css({ top: offset.top + btn.outerHeight(), left: offset.left }).focus();
    });
});

function mostrarSelectorDeCamiones(camiones, fechaKey, logistica) {
    camiones.sort((a, b) => {
        const numeroA = parseInt(a.replace(/\D/g, ''));  // Extraer el número de "camion X"
        const numeroB = parseInt(b.replace(/\D/g, ''));
        return numeroA - numeroB;  // Ordenar por el número
    });

    let htmlCamiones = '<div class="selector-camiones-historial-tipeo">';
    camiones.forEach(camion => {
        const camionNombre = camion.charAt(0).toUpperCase() + camion.slice(1).toLowerCase();
        htmlCamiones += `
            <button class="btn btn-outline-primary camion-opcion-historial-tipeo" data-camion="${camion}">
                <i class="bi bi-box-seam-fill"></i> ${camionNombre}
            </button>
        `;
    });
    htmlCamiones += '</div>';

    Swal.fire({
        title: 'Seleccionar camión',
        html: htmlCamiones,
        showConfirmButton: false
    });

    $(document).off('click', '.camion-opcion-historial-tipeo').on('click', '.camion-opcion-historial-tipeo', function () {
        const camionSeleccionado = $(this).data('camion');
        cargarYMostrarTabla(camionSeleccionado, fechaKey, logistica);
        Swal.close();
    });
}

function cargarYMostrarTabla(camion, fechaKey, logistica) {
    dbTipeo.ref(`${logistica}/${fechaKey}/${camion}`).once('value', snapshot => {
        let rowsHTML = '';
        snapshot.forEach(child => {
            const despacho = child.val();

            const imgSrc = {
                'Andreani': './Img/andreani-tini.png',
                'Andesmar': './Img/andesmar-tini.png',
                'Oca': './Img/oca-tini.png',
                'Cruz del Sur': './Img/Cruz-del-Sur-tini.png'
            }[despacho.camion] || '';

            const iconClass = {
                'Andreani': 'andreani-tablita',
                'Andesmar': 'andesmar-tablita',
                'Oca': 'oca-tablita',
                'Cruz del Sur': 'cruz-del-sur-tablita'
            }[despacho.camion] || '';

            let seguimiento = despacho.seguimiento.startsWith('NIC-') 
                ? despacho.seguimiento.slice(4) 
                : despacho.seguimiento;

            const etiqueta = despacho.camion === 'Cruz del Sur' 
                ? `NIC-${seguimiento}` 
                : seguimiento;

            rowsHTML += `
                <tr>
                    <td>${despacho.fechaHora}</td>
                    <td>
                        <div class="logistica-contenedor">
                            <span class="logistica-texto">${despacho.camion}</span>
                            <div class="logistica-circulo ${iconClass}">
                                <img src="${imgSrc}" alt="${despacho.camion}">
                            </div>
                        </div>
                    </td>
                    <td class="seguimiento-tabla-despacho">
                        <div class="seguimiento-contenedor">
                            <a href="${getSeguimientoLink(despacho.camion, despacho.seguimiento)}" target="_blank">
                                ${etiqueta} 
                                <i class="bi bi-box-arrow-up-right ml-1 text-primary"></i>
                            </a>
                        </div>
                    </td>
                    <td class="bultos-tabla-despacho">
                        <div class="bultos-box" data-bultos="${despacho.bultos}">${despacho.bultos}</div>
                    </td>
                    <td>
                        <div class="remito-tipeo-os">${despacho.remito}</div>
                        ${despacho.info ? generarProductosRemito(despacho.info) : ''}
                    </td>
                    <td>
                        <div class="valor-tabla-despacho">${despacho.valor}</div>
                    </td>
                    <td class="info-tabla-despacho">
                        ${typeof despacho.info === 'object' ? generarInfoCliente(despacho.info) : 'Presea ❌'}
                    </td>
                </tr>
            `;
        });

        const tablaHTML = `
            <div class="mb-4">
                <div class="d-flex gap-3 mb-3 conjuntoDeBtnnes">
                    <button id="btnExcelDescarga" class="btn btn-success" disabled>
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Buscando Excel...
                    </button>
                    <button id="btnPdfDescarga" class="btn btn-primary">
                        <i class="bi bi-file-earmark-pdf-fill me-2"></i> Descargar Documentación de envío
                    </button>
                </div>
                <div id="infoTransporte" class="bg-white p-4 rounded shadow-sm border" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; font-size: 1.05rem;"></div>
            </div>
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th><i class="bi bi-calendar-event"></i> Fecha y hora</th>
                            <th><i class="bi bi-truck"></i> Transporte</th>
                            <th><i class="bi bi-link-45deg"></i> Seguimiento</th>
                            <th><i class="bi bi-box-seam"></i> Bultos</th>
                            <th><i class="bi bi-receipt"></i> Remito</th>
                            <th><i class="bi bi-cash"></i> Valor</th>
                            <th><i class="bi bi-info-circle"></i> Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>
        `;

        Swal.fire({
            title: `Historial: ${camion}`,
            html: tablaHTML,
            width: '90%',
            customClass: 'swal-wide',
            showCloseButton: true,
            didOpen: () => {
                const btnExcel = document.getElementById('btnExcelDescarga');
                const btnPdf = document.getElementById('btnPdfDescarga');
                const infoDiv = document.getElementById('infoTransporte');

                // 1. Verificar disponibilidad de documentación
                let logisticaNormalizada = logistica;
                if (logistica === 'DespachosHistoricosAndreani') {
                    logisticaNormalizada = 'Andreani';
                } else if (logistica === 'DespachosHistoricosAndesmar') {
                    logisticaNormalizada = 'Andesmar';
                } else if (logistica === 'DespachosHistoricosOca') {
                    logisticaNormalizada = 'Oca';
                } else if (logistica === 'DespachosHistoricosCruzdelSur') {
                    logisticaNormalizada = 'Cruz del Sur';
                }

                const docRef = storageMeli.ref(`DocumentacionDespachos/${fechaKey}/${logisticaNormalizada}/${camion}`);
                console.log("Verificando documentación en:", `DocumentacionDespachos/${fechaKey}/${logisticaNormalizada}/${camion}`);
                
                docRef.listAll().then(result => {
                    if (result.items.length === 0) {
                        btnPdf.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Documentación PDF no disponible';
                        btnPdf.classList.remove('btn-primary');
                        btnPdf.classList.add('btn-secondary');
                        btnPdf.disabled = true;
                    }
                }).catch(error => {
                    console.error("Error verificando documentación:", error);
                    btnPdf.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Error al verificar';
                    btnPdf.classList.remove('btn-primary');
                    btnPdf.classList.add('btn-danger');
                    btnPdf.disabled = true;
                });

                // 2. Configurar evento de descarga PDF
                btnPdf.addEventListener('click', async () => {
                    const originalContent = btnPdf.innerHTML;
                    btnPdf.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Generando PDF...';
                    btnPdf.disabled = true;

                    try {
                        // Obtener todas las imágenes de la documentación
                        const result = await docRef.listAll();
                        const downloadUrls = await Promise.all(
                            result.items.map(item => item.getDownloadURL())
                        );

                        // Crear PDF con jsPDF
                        const { jsPDF } = window.jspdf;
                        const pdf = new jsPDF({
                            orientation: 'portrait',
                            unit: 'mm'
                        });

                        const corsProxy = "https://proxy.cors.sh/";
                        const corsApiKey = "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd";

                        // Agregar cada imagen al PDF usando el proxy
                        for (let i = 0; i < downloadUrls.length; i++) {
                            if (i > 0) pdf.addPage();

                            // Usar fetch + proxy para evitar CORS
                            const proxiedUrl = corsProxy + downloadUrls[i];
                            const response = await fetch(proxiedUrl, {
                                headers: {
                                    'x-cors-api-key': corsApiKey
                                }
                            });
                            const blob = await response.blob();
                            const imgUrl = URL.createObjectURL(blob);

                            const img = new Image();
                            img.crossOrigin = "anonymous";
                            img.src = imgUrl;

                            await new Promise(resolve => {
                                img.onload = () => {
                                    const width = pdf.internal.pageSize.getWidth() - 20;
                                    const height = (img.height * width) / img.width;
                                    pdf.addImage(img, 'JPEG', 10, 10, width, height);
                                    URL.revokeObjectURL(imgUrl); // Limpia el blob cuando termina
                                    resolve();
                                };
                            });
                        }

                        // Descargar PDF
                        pdf.save(`Documentacion_${logisticaNormalizada}_${camion}_${fechaKey}.pdf`);

                    } catch (error) {
                        console.error("Error generando PDF:", error);
                        Swal.fire('Error', 'No se pudo generar el PDF', 'error');
                    } finally {
                        btnPdf.innerHTML = originalContent;
                        btnPdf.disabled = false;
                    }
                });

                // Resto del código (búsqueda de Excel y info de transporte)
                let logisticaLimpia = logistica.replace(/^DespachosHistoricos_?/, '');
                let logisticaLimpia2;
                if (logisticaLimpia === 'CruzdelSur') {
                    logisticaLimpia2 = 'Cruz del Sur';
                } else {
                    logisticaLimpia2 = logisticaLimpia;
                }
                const nombreArchivo = `${logisticaLimpia2}_${fechaKey}_${camion}.xlsx`;
                const storageRef = storageMeli.ref().child(`ExcelDespachos/${nombreArchivo}`);

                // Buscar Excel
                storageRef.getDownloadURL()
                    .then((url) => {
                        btnExcel.innerHTML = `<i class="bi bi-file-earmark-excel-fill me-2"></i> Descargar Camión en EXCEL`;
                        btnExcel.classList.add('btn-success');
                        btnExcel.disabled = false;
                        btnExcel.onclick = () => window.open(url, '_blank');
                    })
                    .catch((error) => {
                        console.warn("Excel no disponible:", error);
                        btnExcel.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i> Excel No disponible ⚠️`;
                        btnExcel.classList.remove('btn-success');
                        btnExcel.classList.add('btn-danger');
                        btnExcel.disabled = true;
                    });

                // Determinar ruta segura según logística
                let rutaSeguro = '';
                switch (logisticaLimpia) {
                    case 'CruzdelSur':
                        rutaSeguro = 'seguroCDS';
                        break;
                    case 'Oca':
                        rutaSeguro = 'SeguroOca';
                        break;
                    case 'Andreani':
                        rutaSeguro = 'seguroAndreani';
                        break;
                    case 'Andesmar':
                        rutaSeguro = 'SeguroAndesmar';
                        break;
                    default:
                        rutaSeguro = 'seguroDesconocido';
                        break;
                }

                // Mostrar info del transporte
                dbTipeo.ref(`${rutaSeguro}/${fechaKey}/${camion}`).once('value')
                    .then(snapshot => {
                        console.log(`${rutaSeguro}/${fechaKey}/${camion}`);
                        const data = snapshot.val();
                        if (!data) {
                            infoDiv.innerHTML = `<div class="text-muted"><i class="bi bi-info-circle me-1"></i> Sin datos del transporte.</div>`;
                            return;
                        }

                        const infoHTML = `
                            <div class="transport-info-grid">
                                <div><i class="bi bi-person-fill text-primary"></i> <strong>Transportista:</strong> ${data.nombreTransportista || '-'}</div>
                                <div><i class="bi bi-card-text text-primary"></i> <strong>DNI:</strong> ${data.dniTransportista || '-'}</div>
                                <div><i class="bi bi-truck-front text-success"></i> <strong>Camión:</strong> ${data.marcaCamion || '-'} - ${data.patenteCamion || '-'}</div>
                                ${data.patenteChasis && data.marcaChasis ? `<div><i class="bi bi-car-front text-secondary"></i> <strong>Chasis:</strong> ${data.marcaChasis} - ${data.patenteChasis}</div>` : ''}
                                <div><i class="bi bi-geo-alt-fill text-danger"></i> <strong>Planta:</strong> ${data.planta || '-'}</div>
                                <div><i class="bi bi-stack text-warning"></i> <strong>Pallets:</strong> ${data.pallets || '0'}</div>
                                <div><i class="bi bi-currency-dollar text-success"></i> <strong>Total:</strong> ${data.montoTotal || '0,00'}</div>
                            </div>
                        `;

                        infoDiv.innerHTML = infoHTML;
                    });
            }
        });
    });
}

function getSeguimientoLink(logistica, etiqueta) {
    switch (logistica) {
        case 'Andreani':
            return `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${etiqueta}`; 
        case 'Andesmar':
            return `https://andesmarcargas.com/seguimiento.html?numero=${etiqueta}&tipo=remito&cod=`;
        case 'Oca':
            return `aftership.com/es/track/oca-ar/${etiqueta}`;
        case 'Cruz del Sur':
        // Eliminar el prefijo "NIC-" si está presente
        const etiquetaSinNic = etiqueta.startsWith('NIC-') ? etiqueta.substring(4) : etiqueta;
        return `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${etiquetaSinNic}`;
        default:
            return '#';
    }
}
// FIN CALENDARIO HISTORIAL DE TIPEO

// BUSCADOR
document.getElementById('searchDespachosLogistica').addEventListener('input', function () {
    const filtro = this.value.trim().toLowerCase();
    const filas = document.querySelectorAll('#tabla-despacho-body tr');

    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        if (textoFila.includes(filtro)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });

    // Si se borra el input, mostrar todas las filas
    if (filtro === '') {
        filas.forEach(fila => {
            fila.style.display = '';
        });
    }
});
// FIN BUSCADOR

// ESTADISTICAS
$(document).ready(function() {
    // ██████████████████████████ 1. INICIALIZACIÓN ██████████████████████████
    $("#rangoFechas").flatpickr({
        mode: "range",
        dateFormat: "Y-m-d",
        maxDate: new Date(),
        locale: "es"
    });

    // ██████████████████████████ 2. VARIABLES GLOBALES ██████████████████████████
    let datosFiltrados = [];
    let chartPrincipal = null;
    let chartSecundario = null;
    let tipoGraficoActual = 'productos';
    let tipoVisualizacion = $('#selectTipoGrafico').val() || 'bar';
    let topN = parseInt($('#selectTop').val()) || 10;
    let fechaInicioGlobal = null;
    let fechaFinGlobal = null;

// ██████████████████████████ 3. FUNCIÓN PRINCIPAL - CARGAR DATOS ██████████████████████████
async function cargarDatos(logistica, fechaInicio, fechaFin) {
    console.log(fechaInicio);
    console.log(fechaFin);
    
    try {
        const canvasPrincipal = document.getElementById('graficoPrincipal');
        const canvasSecundario = document.getElementById('graficoSecundario');
        
        if (!canvasPrincipal || !canvasSecundario) {
            throw new Error(`
                Error: Contenedores de gráficos no encontrados. 
                Asegúrese de tener estos elementos en su HTML:
                <canvas id="graficoPrincipal"></canvas>
                <canvas id="graficoSecundario"></canvas>
            `);
        }

        showLoading();
        
        const camionesPorLogistica = {};
        const camionesUnicos = new Set();

        if (logistica === 'todas') {
            const refs = [
                dbTipeo.ref('DespachosHistoricosAndesmar'),
                dbTipeo.ref('DespachosHistoricosAndreani'),
                dbTipeo.ref('DespachosHistoricosCruzdelSur'),
                dbTipeo.ref('DespachosHistoricosOca')
            ];
            
            const snapshots = await Promise.all(refs.map(ref => ref.once('value')));
            
            snapshots.forEach(snapshot => {
                const logisticaKey = snapshot.key.replace('DespachosHistoricos', '');
                camionesPorLogistica[logisticaKey] = [];
                
                snapshot.forEach(fechaSnap => {
                    const fecha = fechaSnap.key;
                    if ((!fechaInicio || fecha >= fechaInicio) && (!fechaFin || fecha <= fechaFin)) {
                        fechaSnap.forEach(camionSnap => {
                            const camionKey = `${logisticaKey}|${camionSnap.key}`;
                            camionesUnicos.add(camionKey);
                            camionesPorLogistica[logisticaKey].push(camionSnap.key);

                            camionSnap.forEach(remitoSnap => {
                                const remitoData = remitoSnap.val();
                                if (remitoData) {
                                    datosFiltrados.push({
                                        ...remitoData,
                                        logistica: obtenerNombreLogistica(logisticaKey),
                                        fecha: fecha,
                                        camionKey: camionKey
                                    });
                                }
                            });
                        });
                    }
                });
            });
        } else {
            const refPath = `DespachosHistoricos${logistica}`;
            const ref = dbTipeo.ref(refPath);
            const snapshot = await ref.once('value');
            
            camionesPorLogistica[logistica] = [];
            
            snapshot.forEach(fechaSnap => {
                const fecha = fechaSnap.key;
                if ((!fechaInicio || fecha >= fechaInicio) && (!fechaFin || fecha <= fechaFin)) {
                    fechaSnap.forEach(camionSnap => {
                        const camionKey = `${logistica}|${camionSnap.key}`;
                        camionesUnicos.add(camionKey);
                        camionesPorLogistica[logistica].push(camionSnap.key);

                        camionSnap.forEach(remitoSnap => {
                            const remitoData = remitoSnap.val();
                            if (remitoData) {
                                datosFiltrados.push({
                                    ...remitoData,
                                    logistica: obtenerNombreLogistica(logistica),
                                    fecha: fecha,
                                    camionKey: camionKey
                                });
                            }
                        });
                    });
                }
            });
        }
        
        // Debugging: Mostrar los camiones únicos y por logística

        let camionesGlobal = Object.values(camionesPorLogistica).reduce((total, lista) => total + lista.length, 0);

        // Guardar fechas para el reporte
        fechaInicioGlobal = fechaInicio;
        fechaFinGlobal = fechaFin;
        
        procesarDatos(camionesGlobal, camionesPorLogistica);
        console.log(`Total Camiones:`, camionesGlobal);
    } catch (error) {
        console.error("Error completo en cargarDatos:", error);
        mostrarErrorGraficos(error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar datos',
            html: `<small>${error.message}</small>`
        });
    } finally {
        hideLoading();
    }
}

// ██████████████████████████ 4. PROCESAMIENTO DE DATOS ██████████████████████████
function procesarDatos(totalCamiones, camionesPorLogistica) {
    try {
        // ► Validación de datos vacíos
        if (!datosFiltrados || datosFiltrados.length === 0) {
            throw new Error("No hay datos para los filtros seleccionados");
        }

        // ► Cálculo de resumen general
        let totalEnvios = datosFiltrados.length;
        let totalBultos = 0;
        let totalValor = 0;
        
        // ► Cálculo por logística
        const resumenLogisticas = {};
        const enviosPorLogistica = {};
        const bultosPorLogistica = {};
        const valorPorLogistica = {};
        
        datosFiltrados.forEach(remito => {
            const logistica = remito.logistica;
            
            if (!enviosPorLogistica[logistica]) {
                enviosPorLogistica[logistica] = 0;
                bultosPorLogistica[logistica] = 0;
                valorPorLogistica[logistica] = 0;
            }
            
            enviosPorLogistica[logistica]++;
            bultosPorLogistica[logistica] += parseInt(remito.bultos) || 0;
            
            const valorStr = remito.valor.replace(/[^\d,]/g, '').replace(',', '.');
            const valor = parseFloat(valorStr) || 0;
            valorPorLogistica[logistica] += valor;
            
            totalBultos += parseInt(remito.bultos) || 0;
            totalValor += valor;
        });

        // ► Actualización de la UI
        $('#totalCamiones').text(totalCamiones);
        $('#totalEnvios').text(totalEnvios);
        $('#totalBultos').text(totalBultos);
        $('#valorTotal').text(formatearMoneda(totalValor).replace(/,00$/, ''));

        // ► Contar camiones totales por logística
        const camionesTotalesPorLogistica = {};
        for (const [logistica, camiones] of Object.entries(camionesPorLogistica)) {
            // Asegúrate de que 'camiones' sea un array de objetos que contengan la cantidad
            if (Array.isArray(camiones)) {
                camionesTotalesPorLogistica[logistica] = camiones.reduce((total, camion) => {
                    return total + (camion.cantidad || 1); // Asumiendo que cada camión tiene una propiedad 'cantidad'
                }, 0);
            } else {
                camionesTotalesPorLogistica[logistica] = 0; // Si no es un array, asignar 0
            }
        }

        // Mostrar total de camiones por logística
        console.log(camionesTotalesPorLogistica); // Esto mostrará el conteo por logística

        // Actualiza el resumen
        actualizarDetalleResumen('#detalleCamiones', camionesTotalesPorLogistica, 'camiones');
        actualizarDetalleResumen('#detalleEnvios', enviosPorLogistica, 'envíos');
        actualizarDetalleResumen('#detalleBultos', bultosPorLogistica, 'bultos');
        actualizarDetalleResumen('#detalleValor', valorPorLogistica, 'valor', true);

        // ► Procesamiento para gráficos
        const productosMap = new Map();
        const localidadesMap = new Map();
        const logisticasMap = new Map();
        const provinciasMap = new Map();
        
        datosFiltrados.forEach(remito => {
            // Procesamiento de productos
            if (typeof remito.info === 'object' && remito.info !== null) {
                let i = 1;
                while (remito.info[`producto${i}`]) {
                    const producto = remito.info[`producto${i}`];
                    const descripcion = remito.info[`descripcion${i}`] || 'Sin descripción';
                    
                    if (!['110', 'ENVIO', 'COSTO DE ENVIO', 'ENVIO LOGISTICA WEB'].includes(producto.toUpperCase())) {
                        const cantidad = parseInt(remito.info[`cantidad${i}`]) || 1;
                        
                        if (productosMap.has(producto)) {
                            productosMap.get(producto).cantidad += cantidad;
                        } else {
                            productosMap.set(producto, {
                                cantidad: cantidad,
                                descripcion: descripcion
                            });
                        }
                    }
                    i++;
                }
                
                // Procesamiento de localidades
                if (remito.info.localidad && remito.info.cp) {
                    const localidadKey = `${remito.info.localidad} (${remito.info.cp})`;
                    localidadesMap.set(localidadKey, (localidadesMap.get(localidadKey) || 0) + 1);
                }
                
                // ► Procesamiento de provincias (integrado dentro del forEach)
                if (remito.info.cp) {
                    const provincia = determinarProvincia(remito.info.cp);
                    if (provincia) {
                        provinciasMap.set(provincia, (provinciasMap.get(provincia) || 0) + 1);
                    }
                }
            }
            
            // Procesamiento de logísticas
            logisticasMap.set(remito.logistica, (logisticasMap.get(remito.logistica) || 0) + 1);
        });

        // ► Generación de datos ordenados
        const productosTop = Array.from(productosMap.entries())
            .sort((a, b) => b[1].cantidad - a[1].cantidad)
            .slice(0, topN);
            
        const localidadesTop = Array.from(localidadesMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);
            
        const logisticasTop = Array.from(logisticasMap.entries())
            .sort((a, b) => b[1] - a[1]);
            
        const provinciasTop = Array.from(provinciasMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN);

        // ► Generación de gráficos e informe
        generarGraficos(productosTop, localidadesTop, logisticasTop, enviosPorLogistica, bultosPorLogistica, valorPorLogistica, provinciasTop);
        generarReporteDetallado(
            fechaInicioGlobal, fechaFinGlobal, 
            totalCamiones, totalEnvios, totalBultos, totalValor, 
            productosTop, localidadesTop, logisticasTop, 
            camionesPorLogistica, enviosPorLogistica, 
            bultosPorLogistica, valorPorLogistica,
            provinciasTop
        );

    } catch (error) {
        console.error("Error en procesarDatos:", error);
        mostrarErrorGraficos(error.message);
        Swal.fire('Error', error.message, 'error');
    }
}

// ARRAY SIN USO (EJEMPLO)
    const provinciasCP = {
  "Buenos Aires": ["1600-1999", "2700-2919", "6000-6439", "6500-6740", "7000-7539", "7600-8179", "8500-8999"],
  "CABA": ["C1000-C1499", "C1400-C1499"],
  "Catamarca": ["4700-4749"],
  "Chaco": ["3500-3639", "3700-3749"],
  "Chubut": ["9000-9219", "9100-9121", "9200-9219", "U9100-U9121"],
  "Córdoba": ["5000-5299", "5800-5879", "5900-5949"],
  "Corrientes": ["3400-3489", "W3400-W3489"],
  "Entre Ríos": ["3100-3269", "E3100-E3269"],
  "Formosa": ["3600-3639"],
  "Jujuy": ["4600-4649"],
  "La Pampa": ["6300-6389"],
  "La Rioja": ["5300-5389"],
  "Mendoza": ["5500-5619", "M5500-M5619"],
  "Misiones": ["3300-3389", "N3300-N3389"],
  "Neuquén": ["8300-8379", "Q8300-Q8379"],
  "Río Negro": ["8400-8439", "8500-8599", "R8400-R8439"],
  "Salta": ["4400-4539", "A4400-A4539"],
  "San Juan": ["5400-5469", "J5400-J5469"],
  "San Luis": ["5700-5759", "D5700-D5759"],
  "Santa Cruz": ["9300-9419", "Z9300-Z9419"],
  "Santa Fe": ["2000-2249", "3000-3089", "S2000-S2249"],
  "Santiago del Estero": ["4200-4389", "G4200-G4389"],
  "Tierra del Fuego": ["9410-9419", "V9410-V9419"],
  "Tucumán": ["4000-4189", "T4000-T4189"]
};

const cacheProvincias = new Map();

// USANDO HOJA CIUDADES 
function determinarProvincia(cp) {
    if (!cp) {
        console.log("CP vacío o nulo recibido");
        return null;
    }

    const cpBuscado = cp.toString().trim();
    
    // Verificar caché primero
    if (cacheProvincias.has(cpBuscado)) {
        return cacheProvincias.get(cpBuscado);
    }

    try {
        // Buscar coincidencia exacta
        for (const localidad of localidades) {
            if (localidad.codigosPostales.includes(cpBuscado)) {
                const provincia = localidad.provincia;
                cacheProvincias.set(cpBuscado, provincia);
                return provincia;
            }
        }
        
        // Buscar coincidencia flexible (ignorando ceros iniciales)
        for (const localidad of localidades) {
            for (const cpLocalidad of localidad.codigosPostales) {
                const cpLocalidadClean = cpLocalidad.replace(/^0+/, '');
                const cpBuscadoClean = cpBuscado.replace(/^0+/, '');
                
                if (cpLocalidadClean === cpBuscadoClean) {
                    const provincia = localidad.provincia;
                    cacheProvincias.set(cpBuscado, provincia);
                    return provincia;
                }
            }
        }
        
        console.log(`CP no encontrado: ${cpBuscado}`);
        cacheProvincias.set(cpBuscado, null); // Guardamos null en lugar de 'Desconocido'
        return null; // Devolvemos null cuando no se encuentra
        
    } catch (e) {
        console.error(`Error al procesar CP: ${cpBuscado}`, e);
        cacheProvincias.set(cpBuscado, null);
        return null;
    }
}

// ██████████████████████████ 5. GENERACIÓN DE GRÁFICOS ██████████████████████████
function generarGraficos(productosTop, localidadesTop, logisticasTop, enviosPorLogistica, bultosPorLogistica, valorPorLogistica, provinciasTop) {
    try {
        // ► Solo destruir el gráfico principal si vamos a cambiarlo
        if (window.chartPrincipal) {
            window.chartPrincipal.destroy();
        }

        // ► Validación de contextos de canvas
        const canvasPrincipal = document.getElementById('graficoPrincipal');
        const canvasSecundario = document.getElementById('graficoSecundario');

        if (!canvasPrincipal || !canvasSecundario) {
            throw new Error("Elementos canvas no encontrados");
        }

        const ctxPrincipal = canvasPrincipal.getContext('2d');
        const ctxSecundario = canvasSecundario.getContext('2d');
        
        if (!ctxPrincipal || !ctxSecundario) {
            throw new Error("No se pudo obtener el contexto de los gráficos");
        }

        // ► Destruir gráficos anteriores si existen
        if (window.chartPrincipal) {
            window.chartPrincipal.destroy();
        }
        if (window.chartSecundario) {
            window.chartSecundario.destroy();
        }

        // ► Generar gráfico principal según el tipo seleccionado
        switch(tipoGraficoActual) {
            case 'productos':
                generarGraficoProductos(ctxPrincipal, productosTop);
                $('#tituloGrafico1').html(`📦 Productos más enviados (Top ${topN})`);
                break;
            case 'localidades':
                generarGraficoLocalidades(ctxPrincipal, localidadesTop);
                $('#tituloGrafico1').html(`🗺️ Localidades con más envíos (Top ${topN})`);
                break;
            case 'logisticas':
                generarGraficoLogisticas(ctxPrincipal, logisticasTop);
                $('#tituloGrafico1').html(`📌 Distribución por logística`);
                break;
            case 'provincias':
                generarGraficoProvincias(ctxPrincipal, provinciasTop);
                $('#tituloGrafico1').html(`🗺️ Provincias con más envíos (Top ${topN})`);
                break;
        }
        
        // ► Determinar tipo de gráfico secundario según botón activo
        const tipoGraficoSecundario = $('.btn-group button[data-grafico].active').data('grafico') || 'comparativa';

        // ► Generar gráfico secundario según selección
        switch(tipoGraficoSecundario) {
            case 'comparativa':
                generarGraficoComparativa(ctxSecundario, enviosPorLogistica, bultosPorLogistica, valorPorLogistica);
                generarGraficoProductos(ctxPrincipal, productosTop);
                $('#tituloGrafico1').html(`📦 Productos más enviados (Top ${topN})`);
                $('#tituloGrafico2').html(`<i class="bi bi-bar-chart-line"></i> Comparativa por logística`);
                break;  
            case 'apiladoYbultos':
                generarGraficoApiladoYBultos(ctxSecundario, enviosPorLogistica, bultosPorLogistica, valorPorLogistica);
                generarGraficoProductos(ctxPrincipal, productosTop);
                $('#tituloGrafico1').html(`📦 Productos más enviados (Top ${topN})`);
                $('#tituloGrafico2').html(`<i class="bi bi-bar-chart"></i> Comparativa Apilada y Evolución de Bultos`);
                break;
            default:
                generarGraficoComparativa(ctxSecundario, enviosPorLogistica, bultosPorLogistica, valorPorLogistica);
        }

        // ► Configurar eventos para los gráficos recién creados
        configurarEventosGraficos();

    } catch (error) {
        console.error("Error en generarGraficos:", error);
        mostrarErrorGraficos(error.message);
    }
}

// ► Función para configurar eventos de exportación y ampliación
function configurarEventosGraficos() {
    $('[data-action="exportar"]').off('click');
    $('[data-action="ampliar"]').off('click');

    // Configurar exportación
    $('[data-action="exportar"]').on('click', function (e) {
        e.preventDefault();
        const graficoId = String($(this).data('grafico')); 
        const canvasMap = {
            '1': 'graficoPrincipal',
            '2': 'graficoSecundario'
        };
        const canvasId = canvasMap[graficoId];
        const canvas = document.getElementById(canvasId);

        if (!canvas) {
            Swal.fire('Error', `No se encontró el canvas ${canvasId}`, 'error');
            return;
        }

        const grafico = Chart.getChart(canvas);
        if (!grafico) {
            Swal.fire('Error', `El gráfico ${graficoId} no está inicializado`, 'error');
            return;
        }

        // Crear enlace de descarga con mejor calidad
        const link = document.createElement('a');
        link.download = `grafico-${graficoId}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = grafico.toBase64Image('image/png', 1);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Configurar ampliación
    function ampliarGrafico(graficoId) {
        const canvasMap = {
            '1': 'graficoPrincipal',
            '2': 'graficoSecundario'
        };

        const canvasId = canvasMap[graficoId];
        if (!canvasId) {
            console.error('ID de gráfico no válido');
            return;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            Swal.fire('Error', `No se encontró el canvas ${canvasId}`, 'error');
            return;
        }

        const grafico = Chart.getChart(canvas);
        if (!grafico) {
            Swal.fire('Error', `El gráfico ${graficoId} no está inicializado`, 'error');
            return;
        }

        Swal.fire({
            title: document.querySelector(`#tituloGrafico${graficoId}`)?.textContent || `Gráfico ${graficoId}`,
            html: `<div style="width: 100%; overflow: auto;">
                    <img src="${grafico.toBase64Image()}" 
                         style="max-width: 90vw; max-height: 80vh; display: block; margin: 0 auto;">
                  </div>`,
            width: '90%',
            padding: '1rem',
            showConfirmButton: false,
            background: '#ffffff',
            showCloseButton: true,
            backdrop: 'rgba(0,0,0,0.7)'
        });
    }

    // Event listeners para ampliación
    document.querySelectorAll('[data-action="ampliar"]').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            ampliarGrafico(e.currentTarget.dataset.grafico);
        };
    });
}

function actualizarGraficos(tipo) {
    tipoGraficoActual = tipo;
    if (window.chartPrincipal) {
        window.chartPrincipal.destroy();
    }
    if (window.chartSecundario) {
        window.chartSecundario.destroy();
    }

    // Re-procesar datos con el nuevo tipo de gráfico
    if (datosFiltrados && datosFiltrados.length > 0) {
        procesarDatos(totalCamionesActuales, camionesPorLogisticaActual);
    } else {
        const logistica = $('#selectLogistica').val();
        const rangoFechas = $('#rangoFechas').val();
        cargarDatos(logistica, ...(rangoFechas ? rangoFechas.split(' a ') : [null, null]));
    }
}

// ► Función para gráfico de Provincias
function generarGraficoProvincias(ctx, datos) {
  const tipo = $('#selectTipoGrafico').val() || 'bar';
  
  window.chartPrincipal = new Chart(ctx, {
    type: tipo,
    data: {
      labels: datos.map(item => item[0]),
      datasets: [{
        label: 'Envios',
        data: datos.map(item => item[1]),
        backgroundColor: generarColores(datos.length),
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: getChartOptions(`Top ${topN} Provincias`, 'Envios', tipo)
  });
}

// ► Función para gráfico de productos
function generarGraficoProductos(ctx, datos) {
    const tipo = $('#selectTipoGrafico').val() || 'bar';
    
    window.chartPrincipal = new Chart(ctx, {
        type: tipo,
        data: {
            labels: datos.map(item => `${item[0]} - ${item[1].descripcion}`.substring(0, 30)),
            datasets: [{
                label: 'Cantidad enviada',
                data: datos.map(item => item[1].cantidad),
                backgroundColor: generarColores(datos.length),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: getChartOptions(`Top ${topN} Productos`, 'Cantidad', tipo)
    });
}

// ► Función para gráfico de localidades
function generarGraficoLocalidades(ctx, datos) {
    const tipo = $('#selectTipoGrafico').val() || 'bar';
    
    window.chartPrincipal = new Chart(ctx, {
        type: tipo,
        data: {
            labels: datos.map(item => item[0].substring(0, 30)),
            datasets: [{
                label: 'Envios',
                data: datos.map(item => item[1]),
                backgroundColor: generarColores(datos.length),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: getChartOptions(`Top ${topN} Localidades`, 'Envios', tipo)
    });
}

// ► Función para gráfico de logísticas
function generarGraficoLogisticas(ctx, datos) {
    const tipo = $('#selectTipoGrafico').val() || 'bar';
    
    window.chartPrincipal = new Chart(ctx, {
        type: tipo,
        data: {
            labels: datos.map(item => item[0]),
            datasets: [{
                label: 'Envios',
                data: datos.map(item => item[1]),
                backgroundColor: generarColores(datos.length),
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: getChartOptions('Distribución por logística', 'Envios', tipo)
    });
}

function generarGraficoApiladoYBultos(ctx, envios, bultos, valor) {
    const logisticas = Object.keys(envios);
    const datasets = [];

    // Dataset para Envíos (barras apiladas)
    datasets.push({
        label: 'Envios',
        data: logisticas.map(log => envios[log]),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        stack: 'stack1',
        yAxisID: 'y'
    });

    // Dataset para Valor (barras apiladas)
    datasets.push({
        label: 'Valor ($)',
        data: logisticas.map(log => valor[log]),
        backgroundColor: 'rgba(255, 206, 86, 0.7)', // Amarillo
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        stack: 'stack1', // Apilado
        yAxisID: 'y'
    });

    // Dataset para Bultos (línea)
    datasets.push({
        label: 'Bultos',
        data: logisticas.map(log => bultos[log]),
        backgroundColor: 'rgba(75, 192, 192, 0.7)', // Verde
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        type: 'line', // Línea
        tension: 0.3,
        yAxisID: 'y1'
    });

    window.chartSecundario = new Chart(ctx, {
        type: 'bar', // Tipo de gráfico base
        data: {
            labels: logisticas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparativa Apilada de Envios y Valor + Evolución de Bultos',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label === 'Valor ($)') {
                                return `${label}: ${formatearMoneda(context.raw)}`;
                            }
                            return `${label}: ${context.raw.toLocaleString()}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Envios y Valor ($)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: true
                    },
                    stacked: true 
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Bultos',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    stacked: false,
                    afterFit: function(scale) {
                        scale.right += 50;
                    }
                }
            }
        }
    });
}

// ► Función para gráfico de comparativa (mejorada)
function generarGraficoComparativa(ctx, envios, bultos, valor) {
    const logisticas = Object.keys(envios);
    const datasets = [];
    
    // Dataset para Envíos (barras)
    datasets.push({
        label: 'Envios',
        data: logisticas.map(log => envios[log]),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y'
    });

    // Dataset para Bultos (línea)
    datasets.push({
        label: 'Bultos',
        data: logisticas.map(log => bultos[log]),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        type: 'line',
        tension: 0.3,
        yAxisID: 'y1'
    });

    // Dataset para Valor (línea)
    datasets.push({
        label: 'Valor ($)',
        data: logisticas.map(log => valor[log]),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2,
        type: 'line',
        tension: 0.3,
        yAxisID: 'y2'
    });

    window.chartSecundario = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: logisticas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Comparativa por Logística',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label === 'Valor ($)') {
                                return `${label}: ${formatearMoneda(context.raw)}`;
                            }
                            return `${label}: ${context.raw.toLocaleString()}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Envios',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: true
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Bultos',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Valor ($)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return formatearMoneda(value);
                        }
                    },
                    // Ajustar posición para no solaparse con y1
                    afterFit: function(scale) {
                        scale.right += 50;
                    }
                }
            }
        }
    });
}

    // ██████████████████████████ 6. GENERACIÓN DE INFORME ██████████████████████████
function generarReporteDetallado(
  fechaInicio,
  fechaFin,
  totalCamiones,
  totalEnvios,
  totalBultos,
  totalValor,
  productosTop,
  localidadesTop,
  logisticasTop,
  camionesPorLogistica,
  enviosPorLogistica,
  bultosPorLogistica,
  valorPorLogistica,
  provinciasTop // Asegúrate de pasar este parámetro cuando llames a la función
) {
  try {
    let html = `
    <div class="macos-chat p-3 rounded border bg-light">
      <div class="macos-title">📅 Período analizado: <strong>${fechaInicio || 'Inicio'} al ${fechaFin || 'Fin'}</strong></div>

      <div class="macos-title">📊 Resumen General</div>
      <table class="table table-sm table-bordered align-middle mb-0 mt-2">
        <thead class="table-light">
          <tr>
            <th colspan="2" class="text-center">🧾 <strong>Totales y Cantidades</strong></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>🚚 <strong>Total de Camiones</strong></td>
            <td><strong style="color:#1d3557;">${totalCamiones}</strong></td>
          </tr>
          <tr>
            <td>📦 <strong>Total de Envíos</strong></td>
            <td><strong style="color:#457b9d;">${totalEnvios}</strong></td>
          </tr>
          <tr>
            <td>📬 <strong>Total de Bultos</strong></td>
            <td><strong style="color:#1d3557;">${totalBultos}</strong></td>
          </tr>
          <tr>
            <td>💰 <strong>Valor Total</strong></td>
            <td><strong style="color:#2a9d8f;">${formatearMoneda(totalValor)}</strong></td>
          </tr>
        </tbody>
      </table>

      <div class="macos-title">🚚 Detalle por logística</div>
      <table class="table table-sm table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th>📦 Logística</th>
            <th>🚚 Camiones</th>
            <th>📦 Envíos</th>
            <th>📬 Bultos</th>
            <th>💰 Valor</th>
          </tr>
        </thead>
        <tbody>`;

        Object.entries(camionesPorLogistica).forEach(([logistica, camiones]) => {
        const nombreLogistica = obtenerNombreLogistica(logistica);
        console.log(`${nombreLogistica}: ${camiones.length}`);

        html += `
            <tr>
            <td><strong>${nombreLogistica}</strong></td>
            <td><strong style="color:#1d3557;">${camiones.length}</strong></td>
            <td><strong style="color:#457b9d;">${enviosPorLogistica[nombreLogistica] || 0}</strong></td>
            <td><strong style="color:#1d3557;">${bultosPorLogistica[nombreLogistica] || 0}</strong></td>
            <td><strong style="color:#2a9d8f;">${formatearMoneda(valorPorLogistica[nombreLogistica] || 0)}</strong></td>
            </tr>`;
        });

        html += `</tbody></table>`;

    if (productosTop.length > 0) {
      html += `
      <div class="macos-title mt-3">🏆 Productos más enviados (Top ${Math.min(topN, productosTop.length)})</div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>📦 Producto</th>
            <th>📝 Descripción</th>
            <th>🔢 Cantidad</th>
          </tr>
        </thead>
        <tbody>`;
      productosTop.slice(0, topN).forEach((item, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${item[0]}</strong></td>
            <td>${item[1].descripcion}</td>
            <td><strong style="color:#2a9d8f;">${item[1].cantidad}</strong></td>
          </tr>`;
      });
      html += `</tbody></table>`;
    }

    if (localidadesTop.length > 0) {
    html += `
    <div class="macos-title mt-3">📍 Localidades con más envíos (Top ${Math.min(topN, localidadesTop.length)})</div>
    <table class="table table-sm table-hover">
        <thead class="table-light">
        <tr>
            <th>#</th>
            <th>📍 Localidad</th>
            <th>📦 Envíos</th>
        </tr>
        </thead>
        <tbody>`;
    localidadesTop.slice(0, topN).forEach((item, index) => {
        html += `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${item[0]} (${item[1]})</strong></td> <!-- Cambio aquí -->
            <td><strong style="color:#457b9d;">${item[1]}</strong></td>
        </tr>`;
    });
    html += `</tbody></table>`;
    }

    // Nueva sección para el Top de Provincias
    if (provinciasTop && provinciasTop.length > 0) {
      html += `
      <div class="macos-title mt-3">🗺️ Provincias con más envíos (Top ${Math.min(topN, provinciasTop.length)})</div>
      <table class="table table-sm table-hover">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>🗺️ Provincia</th>
            <th>📦 Envíos</th>
            <th>📬 Bultos</th>
            <th>💰 Valor</th>
          </tr>
        </thead>
        <tbody>`;
      provinciasTop.slice(0, topN).forEach((item, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td><strong>${item[0]}</strong></td>
            <td><strong style="color:#457b9d;">${item[1]}</strong></td>
            <td><strong style="color:#1d3557;">${item[2] || 0}</strong></td>
            <td><strong style="color:#2a9d8f;">${formatearMoneda(item[3] || 0)}</strong></td>
          </tr>`;
      });
      html += `</tbody></table>`;
    }

    html += `</div>`;

    // Actualizar el informe ejecutivo para incluir provincias
    html += `
    <div style="position: relative;">
      <div id="resumenEjecutivo" style="
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #dcdcdc;
          background: #f8f9fa;
          box-shadow: 0 2px 6px rgba(0,0,0,0.03);
          font-size: 16px;
          color: #2e2e2e;
      ">

          <div class="macos-title macos-title2">📊 Informe Ejecutivo</div>

          Analicé los datos en el rango de <strong>${fechaInicio || 'inicio'}</strong> a <strong>${fechaFin || 'fin'}</strong> para la logística <strong>${$('#selectLogistica').find('option:selected').text().replace('📦', '').trim()}</strong>.

          🚛 Camiones utilizados: ${totalCamiones}
          📦 Envíos realizados: ${totalEnvios}
          📦 Total de bultos: ${totalBultos}
          💵 Valor transportado: ${formatearMoneda(totalValor)}
          ${productosTop.length > 0 ? `
          🏷️ Producto más enviado: ${productosTop[0][0]} (${productosTop[0][1].cantidad} unidades)
          ${productosTop.length > 1 ? `🏷️ Segundo producto: ${productosTop[1][0]} (${productosTop[1][1].cantidad} unidades)` : ''}
          ${productosTop.length > 2 ? `🏷️ Tercer producto: ${productosTop[2][0]} (${productosTop[2][1].cantidad} unidades)` : ''}
          ` : ''}
          ${localidadesTop.length > 0 ? `
          🌍 Localidades más frecuentes:
          ${localidadesTop.slice(0, topN).map((item, index) => `   ${index + 1}. ${item[0]} (${item[1]})`).join('\n')}
          ` : ''}
          ${provinciasTop && provinciasTop.length > 0 ? `
          🗺️ Provincias con más envíos:
          ${provinciasTop.slice(0, topN).map((item, index) => `   ${index + 1}. ${item[0]} (${item[1]} envíos)`).join('\n')}
          ` : ''}
      </div>
    </div>`;

    // Asignar el contenido HTML generado al contenedor
    $('#reporteDetallado').html(html);

  } catch (error) {
    console.error('Error en generarReporteDetallado:', error);
    $('#reporteDetallado').html(`<p class="text-danger">Error al generar el informe: ${error.message}</p>`);
  }
}

    // ██████████████████████████ 7. FUNCIONES AUXILIARES ██████████████████████████
    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-AR', { 
            style: 'currency', 
            currency: 'ARS',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

function actualizarDetalleResumen(selector, dataObj, label, esMoneda = false) {
    const contenedor = $(selector);
    contenedor.empty();

    const ul = $('<ul class="lista-macos"></ul>');

    let total = 0; // Para acumular el total de camiones

    for (const key in dataObj) {
        if (dataObj.hasOwnProperty(key)) {
            let valor = dataObj[key];

            // Si el valor es un Set (camiones), contamos la cantidad de camiones
            if (valor instanceof Set) {
                valor = valor.size;
            }

            // Si el valor es un objeto y representa camiones, sumamos las cantidades
            if (typeof valor === 'object' && !Array.isArray(valor)) {
                valor = Object.values(valor).reduce((acc, curr) => acc + curr, 0); // Sumar cantidades
            }

            // Si es un número, simplemente lo usamos
            if (typeof valor === 'number') {
                total += valor; // Acumular el total
                // Si es moneda, aplicamos el formato
                if (esMoneda) {
                    valor = formatearMoneda(valor);
                    valor = valor.replace(/,00$/, '');
                }
            }

            ul.append(`<li>${key}: ${valor}</li>`);
        }
    }

    // Mostrar el total de camiones si es necesario
    contenedor.append(ul);
}

    function generarColores(cantidad) {
        const colores = [];
        const hueStep = 360 / cantidad;
        
        for (let i = 0; i < cantidad; i++) {
            const hue = i * hueStep;
            colores.push(`hsla(${hue}, 70%, 60%, 0.7)`);
        }
        
        return colores;
    }

    function getChartOptions(title, label, tipo) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    display: tipo === 'pie' || tipo === 'doughnut',
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: tipo !== 'pie' && tipo !== 'doughnut' ? {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: label
                    }
                }
            } : {}
        };
    }

    function showLoading() {
        $('#loadingGrafico1, #loadingGrafico2, #spinnerbtnFiltrar').show();
        $('#errorGrafico1, #errorGrafico2').hide();
        $('#reporteDetallado').html('<p class="text-muted">Cargando datos...</p>');
    }

    function hideLoading() {
        $('#loadingGrafico1, #loadingGrafico2, #spinnerbtnFiltrar').hide();
    }

    function mostrarErrorGraficos(mensaje) {
        $('#errorGrafico1, #errorGrafico2').html(`<i class="bi bi-exclamation-triangle"></i> ${mensaje}`).show();
        $('#loadingGrafico1, #loadingGrafico2, #spinnerbtnFiltrar').hide();
    }

    // ██████████████████████████ 8. EVENT LISTENERS ██████████████████████████
    $('#btnFiltrar').click(function() {
        // ► 1. Reiniciar variables globales
        datosFiltrados = [];  // Vacía el array de datos acumulados
        fechaInicioGlobal = null;
        fechaFinGlobal = null;
        
        // ► 2. Destruir gráficos existentes
        if (chartPrincipal) {
            chartPrincipal.destroy();
            chartPrincipal = null;
        }
        if (chartSecundario) {
            chartSecundario.destroy();
            chartSecundario = null;
        }

        // ► 3. Obtener nuevos filtros y recalcular
        const logistica = $('#selectLogistica').val();
        const rangoFechas = $('#rangoFechas').val();
        let fechaInicio = null, fechaFin = null;
        
        if (rangoFechas) {
            const fechas = rangoFechas.split(' a ');
            fechaInicio = fechas[0];
            fechaFin = fechas[1] || fechas[0];
        }
        
        topN = parseInt($('#selectTop').val()) || 10;
        tipoVisualizacion = $('#selectTipoGrafico').val() || 'bar';
        
        cargarDatos(logistica, fechaInicio, fechaFin);
    });

    $('[data-grafico]').click(function() {
        $('[data-grafico]').removeClass('active');
        $(this).addClass('active');
        tipoGraficoActual = $(this).data('grafico');
        
        if (datosFiltrados.length > 0) {
            $('#btnFiltrar').click();
        }
        
    });

    $('#btnCopiarInforme').click(function() {
        const texto = $('#reporteDetallado').text();
        navigator.clipboard.writeText(texto).then(() => {
            $(this).html('<i class="bi bi-check"></i> Copiado');
            setTimeout(() => {
                $(this).html('<i class="bi bi-clipboard"></i> Copiar');
            }, 2000);
        }).catch(err => {
            console.error("Error al copiar:", err);
            $(this).html('<i class="bi bi-x-circle"></i> Error');
        });
    });

    $('#modalEstadisticas').on('shown.bs.modal', function() {
        const rangoFechas = $('#rangoFechas').val();
        if (rangoFechas) {
            $('#btnFiltrar').click();
        }
    });
});

/**
 * @param {string} idLogistica - Identificador técnico (ej: "Andesmar")
 * @returns {string} - Nombre formateado (ej: "Andesmar")
 */

function obtenerNombreLogistica(idLogistica) {
    const mapeoLogisticas = {
        'Andesmar': 'Andesmar',
        'Andreani': 'Andreani',
        'CruzdelSur': 'Cruz del Sur',
        'Oca': 'Oca'
    };
    
    return mapeoLogisticas[idLogistica] || 
           idLogistica.replace(/([a-z])([A-Z])/g, '$1 $2')
                     .replace(/\b\w/g, c => c.toUpperCase());
}
// FIN ESTADÍSTICAS

// BUSCAR REMITO
document.getElementById('btnBuscarInfoRemitos').addEventListener('click', async function() {
    // Mostrar loading
    const loadingSwal = Swal.fire({
        title: 'Buscando remitos...',
        html: 'Estamos verificando los remitos sin datos...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Obtener todas las filas de la tabla
        const filas = document.querySelectorAll('#tabla-despacho-body tr');
        let contadorActualizados = 0;

        // Recorrer cada fila
        for (const fila of filas) {
            // Obtener celda de remito
            const celdaRemito = fila.querySelector('td:nth-child(5) .remito-tipeo-os');
            if (!celdaRemito) continue;

            // Obtener número de remito
            const remito = celdaRemito.textContent.trim();
            
            // Obtener celda de info
            const celdaInfo = fila.querySelector('td:nth-child(7)');
            if (!celdaInfo) continue;

            // Verificar si dice "Presea ❌"
            if (celdaInfo.textContent.includes('Presea ❌')) {
                // Buscar en Firebase
                const remitoSnapshot = await dbStock.ref(`RemitosWeb/${remito}`).once('value');
                
                if (remitoSnapshot.exists()) {
                    // Actualizar en dbTipeo
                    await dbTipeo.ref(`despachosDelDia/${remito}/Info`).set(remitoSnapshot.val());
                    contadorActualizados++;
                    
                    // Actualizar visualmente la celda de info
                    celdaInfo.innerHTML = '<span class="badge bg-success">Actualizado</span>';
                }
            }
        }

        // Cerrar loading y mostrar resultado con autocierre
        const successSwal = Swal.fire({
            icon: 'success',
            title: 'Proceso completado',
            html: `Se actualizó la información de <strong>${contadorActualizados}</strong> remitos<br>
            Finalizando...`,
            showConfirmButton: false,
            timer: 3000, // 5 segundos
            timerProgressBar: true,
            willClose: () => {
                console.log('Mensaje de éxito cerrado automáticamente');
            }
        });

    } catch (error) {
        console.error('Error al buscar remitos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al buscar los remitos: ' + error.message,
            confirmButtonText: 'Entendido'
        });
    } finally {
        // Cerrar loading si aún está abierto
        if (loadingSwal.isActive()) {
            loadingSwal.close();
        }
    }
});
// BUSCAR REMITO

// REPORTE DE SEGURO
$('#btnReporteSeguro').on('click', function () {
    // Eliminar flatpickr anterior si existe
    if($('#inputFlatpickrSeguro').data('flatpickr')) {
        $('#inputFlatpickrSeguro').flatpickr().destroy();
    }
    flatpickr("#inputFlatpickrSeguro", {
        mode: 'range',
        dateFormat: 'Y-m-d',
        maxDate: new Date(),
        locale: 'es',
        onClose: function (selectedDates) {
            if (!selectedDates || selectedDates.length < 2) return;
            const desde = selectedDates[0].toISOString().split('T')[0];
            const hasta = selectedDates[1].toISOString().split('T')[0];

            // Mostrar spinner y deshabilitar botón
            $('#btnReporteSeguro').prop('disabled', true);
            $('#spinnerSeguro').removeClass('d-none');
            $('#iconoSeguro').addClass('d-none');
            $('#textoSeguro').text('Generando excel...');

            // Mostrar selector de logísticas
            mostrarSelectorSeguros(desde, hasta);
        }
    });
    $('#inputFlatpickrSeguro')[0]._flatpickr.open();
});

function mostrarSelectorSeguros(desde, hasta) {
    Swal.fire({
        title: 'Seleccioná las Logisticas',
        html: `
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="seguroAndreani" checked>
                <label class="form-check-label" for="seguroAndreani">Seguro Correo Andreani</label>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="seguroAndesmar" checked>
                <label class="form-check-label" for="seguroAndesmar">Seguro Andesmar</label>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="seguroOca" checked>
                <label class="form-check-label" for="seguroOca">Seguro Oca</label>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="seguroCruzdelSur" checked>
                <label class="form-check-label" for="seguroCruzdelSur">Seguro Cruz del Sur</label>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Generar Excel',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                Andreani: $('#seguroAndreani').is(':checked'),
                Andesmar: $('#seguroAndesmar').is(':checked'),
                Oca: $('#seguroOca').is(':checked'),
                CruzdelSur: $('#seguroCruzdelSur').is(':checked'),
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            $('#inputFlatpickrSeguro').addClass('d-none');
            const seleccionados = result.value;
            generarReporteSeguro(desde, hasta, seleccionados);
        } else {
            $('#inputFlatpickrSeguro').addClass('d-none');
            // Si cancela, restaurar el botón y spinner
            $('#btnReporteSeguro').prop('disabled', false);
            $('#spinnerSeguro').addClass('d-none');
            $('#iconoSeguro').removeClass('d-none');
            $('#textoSeguro').text('Reporte de Seguro');
        }
    });
}

async function generarReporteSeguro(desde, hasta, seleccionados) {
    const rutas = {
        Andreani: { activo: seleccionados.Andreani, ruta: 'seguroAndreani' },
        Andesmar: { activo: seleccionados.Andesmar, ruta: 'SeguroAndesmar' },
        Oca: { activo: seleccionados.Oca, ruta: 'SeguroOca' },
        CruzdelSur: { activo: seleccionados.CruzdelSur, ruta: 'seguroCDS' },
    };

    const fechas = [];
    let fechaActual = new Date(desde);
    const hastaDate = new Date(hasta);

    // Generar array de fechas entre desde y hasta (inclusive)
    while (fechaActual <= hastaDate) {
        fechas.push(fechaActual.toISOString().split('T')[0]);
        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    // Acumulador de filas
    let filas = [];

    // Recorrer cada seguro seleccionado
    for (const key in rutas) {
        if (!rutas[key].activo) continue;
        const rutaSeguro = rutas[key].ruta;

        for (const fecha of fechas) {
            // Leer camiones en esa fecha
            const snapshot = await dbTipeo.ref(`${rutaSeguro}/${fecha}`).once('value');
            if (!snapshot.exists()) continue;

            snapshot.forEach(child => {
                const data = child.val();
                filas.push({
                    fecha,
                    nombreTransportista: (data.nombreTransportista || '').toUpperCase(),
                    dniTransportista: (data.dniTransportista || '').toUpperCase(),
                    marcaCamion: (data.marcaCamion || '').toUpperCase(),
                    patenteCamion: (data.patenteCamion || '').toUpperCase(),
                    marcaChasis: (data.marcaChasis || '').toUpperCase(),
                    patenteChasis: (data.patenteChasis || '').toUpperCase(),
                    viaje: (data.viaje || '').toUpperCase(),
                    planta: (data.planta || '').toUpperCase(),
                    claseDeMercaderia: (data.claseDeMercaderia || '').toUpperCase(),
                    montoTotal: (data.montoTotal || '').toUpperCase(),
                    logisticaActual: (key === 'CruzdelSur' ? 'Cruz del Sur' : key)
                });
            });
        }
    }

    // Ordenar por fecha ascendente
    filas.sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Crear y descargar Excel
    await descargarExcelSeguro(filas, desde, hasta);
}

async function descargarExcelSeguro(filas, desde, hasta) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Seguro');

    // Cabeceras
    const headers = [
        'CHOFER',
        'CAMION MARCA Y PATENTE',
        'ACOPLADO MARCA Y PATENTE',
        'FECHA DE INICIO VIAJE',
        'DESDE',
        'LOGÍSTICA',
        'MERCADERÍA ASEGURADA',
        'SUMA ASEGURADA (VALOR DECLARADO)'
    ];
    sheet.addRow(headers);

    // Filas de datos
    filas.forEach(fila => {
        sheet.addRow([
            `${fila.nombreTransportista} ,DNI: ${fila.dniTransportista}`,
            `${fila.marcaCamion} ${fila.patenteCamion}`,
            `${fila.marcaChasis} ${fila.patenteChasis}`,
            fila.fecha,
            fila.viaje,
            fila.planta, // <-- LOGÍSTICA VIENE DE PLANTA
            fila.claseDeMercaderia,
            fila.montoTotal
        ]);
    });

    // ==== ESTILOS ====
    // Bordes
    const borderStyle = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
    };

    // Cabecera: bold, gris, centrado, filtro, inmovilizada
    const headerRow = sheet.getRow(1);
    headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FF000000' }, name: "Arial", size: 12 };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFBFBFBF' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = borderStyle;
    });
    headerRow.height = 25;

    // Filtros y freeze
    sheet.autoFilter = {
        from: 'A1',
        to: String.fromCharCode(65 + headers.length - 1) + '1'
    };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Filas de datos
    for (let i = 0; i < filas.length; i++) {
        const row = sheet.getRow(i + 2); // +2 porque la cabecera es la 1
        row.height = 20;
        row.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        // Todas las celdas: bordes
        row.eachCell(cell => {
            cell.border = borderStyle;
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });

        // Celda F: pintar según logística (ahora usando PLANTA)
        const logistica = (filas[i].planta || '').trim().toUpperCase();
        let colorTransporte = 'FFFFFFFF';
        if (logistica === 'ANDREANI') colorTransporte = 'FFFFE0E0';
        else if (logistica === 'ANDESMAR') colorTransporte = 'FFB2EBF2';
        else if (logistica === 'CRUZ DEL SUR' || logistica === 'CRUZDELSUR') colorTransporte = 'FF90CAF9';
        else if (logistica === 'OCA') colorTransporte = 'FFE6E6FA';

        // Celda F es la columna 6
        row.getCell(6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorTransporte }
        };

        row.getCell(4).font = { color: { argb: '0000' }, bold: true, name: 'Arial' };

        // Celda H (SUMA ASEGURADA): verde y bold
        row.getCell(8).font = { color: { argb: 'FF008000' }, bold: true, name: 'Arial' };
    }

    // Ajustar ancho de columnas automáticamente (cabecera y datos)
    sheet.columns.forEach((column, i) => {
        let maxLength = headers[i].length; // Empieza con la longitud de la cabecera
        column.eachCell({ includeEmpty: true }, function(cell) {
            let cellValue = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, cellValue.length + 2);
        });
        column.width = maxLength;
    });

    // SUMATORIA TOTAL EN CELDA H (columna 8)
    let total = 0;
    for (let i = 0; i < filas.length; i++) {
        // Suponiendo que los montos vienen como "$ 1.234.567"
        let valor = filas[i].montoTotal.replace(/[^0-9,.-]+/g,"").replace(/\./g,'').replace(',','.');
        total += parseFloat(valor) || 0;
    }
    const totalRowNum = filas.length + 2;
    const totalCell = sheet.getCell(`H${totalRowNum}`);
    totalCell.value = `TOTAL: $ ${total.toLocaleString('es-AR')}`;
    totalCell.font = { bold: true, color: { argb: 'FF000000' }, name: "Arial", size: 13 };
    totalCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
    };
    totalCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    // Bordes para toda la fila total
    const totalRow = sheet.getRow(totalRowNum);
    totalRow.eachCell(cell => {
        cell.border = borderStyle;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });

    // Descargar
    const nombreArchivo = `Reporte de Seguro de ${desde} a ${hasta}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);

    // Restaurar botón y spinner
    $('#btnReporteSeguro').prop('disabled', false);
    $('#spinnerSeguro').addClass('d-none');
    $('#iconoSeguro').removeClass('d-none');
    $('#textoSeguro').text('Reporte de Seguro');
}

// ADJUNTAR DOCUMENTACION DE DESPACHO
function formatearFecha(fechaISO) {
    const [año, mes, dia] = fechaISO.split('-');
    return `${dia}-${mes}-${año}`;
}

// Variables globales
let documentacionPendiente = {};
let fotosTomadas = [];
let camionActual = null;
let logisticaActual = null;
let fechaActual = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners
    document.getElementById('inputCamara').addEventListener('change', manejarFoto);
    document.getElementById('btnSubirDocumentacion').addEventListener('click', subirDocumentacion);
    
    // Configurar modales
    const modalDoc = document.getElementById('modalDocumentacion');
    modalDoc.addEventListener('shown.bs.modal', cargarModalDocumentacion);
});

async function verificarDocumentacionPendiente() {
    const boton = document.getElementById('btnAdjuntarDocumentacion');
    if (boton) boton.disabled = true;

    try {
        const fechaHoy = new Date();
        const fechaInicio = new Date('2025-06-26');
        
        if (fechaHoy < fechaInicio) {
            actualizarContador(0);
            return;
        }
        
        const refs = {
            'Andesmar': dbTipeo.ref('DespachosHistoricosAndesmar'),
            'Andreani': dbTipeo.ref('DespachosHistoricosAndreani'),
            'Cruz del Sur': dbTipeo.ref('DespachosHistoricosCruzdelSur'),
            'Oca': dbTipeo.ref('DespachosHistoricosOca')
        };
        
        let totalPendientes = 0;
        const nuevoDocumentacionPendiente = {};
        
        await Promise.all(Object.entries(refs).map(async ([logistica, ref]) => {
            const snapshot = await ref.once('value');
            const datos = snapshot.val();
            
            if (!datos) return;
            
            nuevoDocumentacionPendiente[logistica] = {};
            
            await Promise.all(Object.entries(datos).map(async ([fecha, camiones]) => {
                if (new Date(fecha) < fechaInicio) return;
                
                const camionesPendientes = await Promise.all(Object.keys(camiones).map(async (camion) => {
                    const docRef = storageMeli.ref(`DocumentacionDespachos/${fecha}/${logistica}/${camion}`);
                    const existeDoc = await verificarDocumentacionExistente(docRef);
                    return existeDoc ? null : camion;
                }));
                
                const camionesFiltrados = camionesPendientes.filter(c => c !== null);
                
                if (camionesFiltrados.length > 0) {
                    nuevoDocumentacionPendiente[logistica][fecha] = camionesFiltrados;
                    totalPendientes += camionesFiltrados.length;
                }
            }));
        }));
        
        documentacionPendiente = nuevoDocumentacionPendiente;
        actualizarContador(totalPendientes);
    } catch (error) {
        console.error('Error al verificar documentación:', error);
        actualizarContador('error');
    } finally {
        if (boton) boton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalDocumentacion');
    if (modal) {
        modal.addEventListener('hidden.bs.modal', function() {
            verificarDocumentacionPendiente();
        });
    }
});

// Función para verificar si existe documentación
async function verificarDocumentacionExistente(ref) {
    try {
        const listResult = await ref.listAll();
        return listResult.items.length > 0;
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            return false;
        }
        console.error('Error al verificar documentación:', error);
        return false;
    }
}

// Función para actualizar el contador
function actualizarContador(cantidad) {
    const contador = document.getElementById('contadorDocumentacionFaltante');
    
    if (cantidad === 'error') {
        contador.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
        contador.classList.add('bg-danger');
        return;
    }
    
    if (cantidad === 0) {
        contador.textContent = '✓';
        contador.classList.remove('bg-danger');
        contador.classList.add('bg-success');
    } else {
        contador.textContent = cantidad;
        contador.classList.remove('bg-success');
        contador.classList.add('bg-danger');
    }
}

// Función para cargar el modal de documentación
function cargarModalDocumentacion() {
    const contenido = document.getElementById('contenidoDocumentacion');
    contenido.innerHTML = '';
    
    if (Object.keys(documentacionPendiente).length === 0) {
        contenido.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                <h4 class="mt-3">¡Todo en orden!</h4>
                <p class="text-muted">No hay documentación pendiente de cargar.</p>
            </div>
        `;
        return;
    }
    
    for (const [logistica, fechas] of Object.entries(documentacionPendiente)) {
        if (Object.keys(fechas).length === 0) continue;
        
        const totalLogistica = Object.values(fechas).flat().length;
        
        const logisticaItem = document.createElement('div');
        logisticaItem.className = 'mac-logistica-item';
        logisticaItem.innerHTML = `
            <div class="mac-logistica-header">
                <h5 class="mac-logistica-title">
                    <i class="bi bi-truck mr-1"></i>
                    <span>${logistica}</span>
                </h5>
                <span class="mac-logistica-badge">${totalLogistica}</span>
            </div>
            <div class="mac-logistica-content">
                ${generarContenidoFechas(fechas, logistica)}
            </div>
        `;
        
        contenido.appendChild(logisticaItem);
    }
    
    // Agregar event listeners a los botones de cargar
    document.querySelectorAll('.btn-cargar-doc').forEach(btn => {
        btn.addEventListener('click', function() {
            logisticaActual = this.getAttribute('data-logistica');
            fechaActual = this.getAttribute('data-fecha');
            camionActual = this.getAttribute('data-camion');
            
            // Configurar modal de carga
            document.getElementById('tituloDocumento').textContent = 
                `${logisticaActual} - ${camionActual} (${fechaActual})`;
            
            // Inicializar variables
            fotosTomadas = [];
            document.getElementById('contenedorHojas').innerHTML = '';
            document.getElementById('btnSubirDocumentacion').disabled = true;
            document.getElementById('progressBarDoc').style.width = '0%';
            document.getElementById('progressBarDoc').style.background = 'linear-gradient(90deg, #007bff, #17a2b8)';
            document.querySelector('.progress-text').textContent = '0%';
            document.getElementById('statusText').textContent = '';
            
            // Agregar primera hoja vacía
            agregarHojaVacia();
            
            // Mostrar modal
            const modalCargar = new bootstrap.Modal(document.getElementById('modalCargarDocumento'), {
                focus: false,
                keyboard: false
            });
            modalCargar.show();
        });
    });
}

function generarContenidoFechas(fechas, logistica) {
    let html = '';
    const fechasOrdenadas = Object.keys(fechas).sort((a, b) => new Date(a) - new Date(b));
    
    for (const fecha of fechasOrdenadas) {
        const camiones = fechas[fecha];
        
        html += `
            <div class="mac-fecha-item">
                <div class="mac-fecha-header">
                    <h6 class="mac-fecha-title2">${formatearFecha(fecha)}</h6>
                    <h6 class="mac-fecha-title hidden">${fecha}</h6>
                    <span class="mac-fecha-badge">${camiones.length}</span>
                </div>
                <ul class="mac-camion-list">
                    ${generarListadoCamiones(camiones, fecha, logistica)}
                </ul>
            </div>
        `;

    }
    
    return html;
}

function generarListadoCamiones(camiones, fecha, logistica) {
    let html = '';
    
    for (const camion of camiones) {
        html += `
            <li class="mac-camion-item">
                <div>
                    <span class="mac-camion-name">${camion}</span>
                </div>
                <div>
                    <button class="btn-cargar-doc btn btn-primary" 
                            data-logistica="${logistica}" 
                            data-fecha="${fecha}" 
                            data-camion="${camion}">
                        <i class="bi bi-cloud-arrow-up mr-1"></i>
                        <span>Cargar Documentación</span>
                    </button>
                </div>
            </li>
            <h6 class="mac-description">Logística ${logistica} del día ${formatearFecha(fecha)} - ${camion}</h6>

        `;
    }
    
    return html;
}

// Función para agregar hoja vacía
function agregarHojaVacia() {
    const contenedor = document.getElementById('contenedorHojas');
    const numeroHoja = fotosTomadas.length + 1;
    
    const hoja = document.createElement('div');
    hoja.className = 'col-md-6 mb-3';
    hoja.innerHTML = `
        <div class="hoja-documento" id="hoja-${numeroHoja}">
            <i class="bi bi-plus-lg" style="font-size: 2rem; color: #adb5bd;"></i>
            <span class="hoja-numero">Hoja ${numeroHoja}</span>
        </div>
    `;
    
    contenedor.appendChild(hoja);
    
    // Agregar event listener para tomar foto
    document.getElementById(`hoja-${numeroHoja}`).addEventListener('click', function() {
        document.getElementById('inputCamara').click();
    });
}

// Función para manejar la foto tomada
function manejarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const numeroHoja = fotosTomadas.length + 1;
        const hoja = document.getElementById(`hoja-${numeroHoja}`);
        
        // Guardar foto en array
        fotosTomadas.push({
            file: file,
            preview: e.target.result
        });
        
        // Actualizar hoja con la imagen
        hoja.innerHTML = `
            <img src="${e.target.result}" alt="Hoja ${numeroHoja}">
            <span class="hoja-numero">Hoja ${numeroHoja}</span>
        `;
        
        // Habilitar botón de subir si hay al menos una foto
        if (fotosTomadas.length > 0) {
            document.getElementById('btnSubirDocumentacion').disabled = false;
        }
        
        // Agregar nueva hoja vacía automáticamente
        agregarHojaVacia();
        
        // Resetear input
        event.target.value = '';
    };
    reader.readAsDataURL(file);
}

// Función para redimensionar y comprimir una imagen antes de subir
function comprimirImagen(file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    } else {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
}

// Función para subir documentación
async function subirDocumentacion() {
    if (fotosTomadas.length === 0) return;

    const btnSubir = document.getElementById('btnSubirDocumentacion');
    const spinner = document.getElementById('spinnerSubirDoc');
    const iconoDocSubir = document.getElementById('iconoSubirDoc');

    // Mostrar spinner y deshabilitar botón
    btnSubir.disabled = true;
    spinner.classList.remove('d-none');
    iconoDocSubir.classList.add('d-none');

    try {
        const refBase = storageMeli.ref(`DocumentacionDespachos/${fechaActual}/${logisticaActual}/${camionActual}`);

        const uploadPromises = fotosTomadas.map(async (foto, index) => {
            const nombreArchivo = `hoja_${index + 1}_${Date.now()}${foto.file.name.match(/\..*$/)[0]}`;
            const refFoto = refBase.child(nombreArchivo);

            try {
                // Comprimir imagen antes de subir
                const imagenComprimida = await comprimirImagen(foto.file);

                const uploadTask = refFoto.put(imagenComprimida);

                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            const totalProgress = ((index + (progress / 100)) / fotosTomadas.length) * 100;

                            document.getElementById('statusText').textContent = `Subiendo hoja ${index + 1} de ${fotosTomadas.length}`;
                            actualizarBarraProgreso(totalProgress);
                        },
                        (error) => {
                            console.error('Error al subir foto:', error);
                            reject(error);
                        },
                        () => {
                            resolve(uploadTask.snapshot);
                        }
                    );
                });
            } catch (error) {
                console.error(`Error comprimiendo imagen ${index + 1}:`, error);
                throw error;
            }
        });

        await Promise.all(uploadPromises);

        actualizarBarraProgreso(100);
        document.getElementById('statusText').textContent = '¡Documentación subida con éxito!';

        Swal.fire({
            icon: 'success',
            title: '¡Documentación cargada!',
            text: 'La documentación se ha subido correctamente.',
            confirmButtonText: 'Aceptar',
            customClass: {
                popup: 'mac-swal-popup'
            }
        }).then(() => {
            bootstrap.Modal.getInstance(document.getElementById('modalCargarDocumento')).hide();

            if (documentacionPendiente[logisticaActual] && documentacionPendiente[logisticaActual][fechaActual]) {
                const index = documentacionPendiente[logisticaActual][fechaActual].indexOf(camionActual);
                if (index !== -1) {
                    documentacionPendiente[logisticaActual][fechaActual].splice(index, 1);
                    if (documentacionPendiente[logisticaActual][fechaActual].length === 0) {
                        delete documentacionPendiente[logisticaActual][fechaActual];
                    }
                    if (Object.keys(documentacionPendiente[logisticaActual]).length === 0) {
                        delete documentacionPendiente[logisticaActual];
                    }
                }
            }

            cargarModalDocumentacion();

            fotosTomadas = [];
            document.getElementById('contenedorHojas').innerHTML = '';
            document.getElementById('btnSubirDocumentacion').disabled = true;
            document.getElementById('progressBarDoc').style.width = '0%';
            document.querySelector('.progress-text').textContent = '0%';
            document.getElementById('statusText').textContent = '';

            verificarDocumentacionPendiente();
        });
    } catch (error) {
        console.error('Error al subir documentación:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al subir la documentación. Por favor, inténtalo nuevamente.',
            confirmButtonText: 'Aceptar',
            customClass: {
                popup: 'mac-swal-popup'
            }
        });
    } finally {
        spinner.classList.add('d-none');
        iconoDocSubir.classList.remove('d-none');
    }
}

// Función para actualizar barra de progreso
function actualizarBarraProgreso(porcentaje) {
    const barra = document.getElementById('progressBarDoc');
    const texto = document.querySelector('.progress-text');
    
    barra.style.width = `${porcentaje}%`;
    texto.textContent = `${Math.round(porcentaje)}%`;
    
    if (porcentaje >= 100) {
        barra.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
    }
}
// FIN ADJUNTAR DOCUMENTACION DE DESPACHO