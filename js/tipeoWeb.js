// CALCULO DE TOTALES
function actualizarTotales() {
    let totalAndreani = 0, totalAndesmar = 0, totalOCA = 0, totalCDS = 0;
    let bultosAndreani = { bigger: 0, paqueteria: 0 };
    let bultosAndesmar = 0, bultosOCA = 0, bultosCDS = 0;
    let montoAndreani = 0, montoAndesmar = 0, montoOCA = 0, montoCDS = 0;

    const filas = document.querySelectorAll('#tabla-despacho-body tr');

    filas.forEach(fila => {
        const logistica = fila.querySelector('.logistica-tabla-despacho').textContent.trim();
        const seguimiento = fila.querySelector('.seguimiento-tabla-despacho').textContent.trim();
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

// IMPRESION DE TABLA
function imprimirTabla() {
    const now = new Date();

    // Fecha y hora en formato 24hs
    const fechaHoraStr = now.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Asignar fecha de impresión a cada campo
    document.querySelectorAll('.fecha-impresion').forEach(el => {
        el.innerText = fechaHoraStr;
    });

    // Obtener el título del modal
    const tituloModal = document.getElementById('modalDespachoPorLogisticaLabel')?.innerText.trim() || 'Impresión';
    const tituloFinal = `${tituloModal} - ${fechaHoraStr}`;

    // Ocultar la última columna
    const tabla = $('#tabla-container-xLogistica');
    const ultimaColumna = tabla.find('tr').find('td:last-child, th:last-child');
    ultimaColumna.hide();

    // Verificar si hay filas en la tabla
    const filas = tabla.find('tr').not(':empty');
    console.log(filas.length); 
    if (filas.length === 0) {
        alert('No hay contenido para imprimir.');
        ultimaColumna.show();
        return; 
    }

    const printFrames = window.frames; 
    for (let i = 0; i < printFrames.length; i++) {
        if (printFrames[i].document.body.innerHTML.includes("contenido imprimible")) {
            printFrames[i].document.body.innerHTML = ''; 
        }
    }

    // Clonar tabla + pie
    const contenido = tabla.clone();
    const pie = $('.pie-por-hoja-print').clone();


    // Solo agregar el pie si hay contenido
    if (filas.length > 0) {
        console.log('Añadiendo pie de página');
        contenido.append(pie);
    }

    contenido.find('.logistica-tabla-despacho').each(function () {
        const original = $(this);
        const texto = original.find('.logistica-texto').text().trim().toLowerCase();
    
        let src = '';
        if (texto === 'andreani') {
            src = 'https://lucasponzoni.github.io/ANDESMAR/Img/andreani-tini.png';
        } else if (texto === 'andesmar') {
            src = 'https://lucasponzoni.github.io/ANDESMAR/Img/andesmar-tini.png';
        } else if (texto === 'oca') {
            src = 'https://lucasponzoni.github.io/ANDESMAR/Img/oca-tini.png';
        } else if (texto === 'cruz del sur') {
            src = 'https://lucasponzoni.github.io/ANDESMAR/Img/Cruz-del-Sur-tini.png';
        }
    
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

    // Contenedor para imprimir
    const contenedor = $('<div></div>').append(contenido);

    // Configuración de impresión
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

    // Mostrar la última columna nuevamente
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
                    background: linear-gradient(135deg, #f2f2f7, #ffffff);
                    padding: 15px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    box-shadow: inset 0 -1px 0 rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.06);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    font-size: 18px;
                    color: #1d1d1f;
                    text-align: center;
                    font-weight: 500;
                }
                .swal2-input {
                    border: 1px solid #d1d1d1;
                    border-radius: 8px;
                    padding: 10px 14px;
                    margin: 6px 0;
                    font-size: 15px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    width: 100%;
                    background-color: #f9f9f9;
                    transition: border-color 0.2s;
                }
                .swal2-input:focus {
                    border-color: #007aff;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
                }
                .swal2-popup {
                    border-radius: 14px;
                    padding: 25px;
                    background: #ffffff;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                }
            </style>
            <div class="macos-header">📋 Información del Transportista 🚛</div>
            <input id="cantidadDePallets" class="swal2-input" placeholder="🪵Pallets utilizados" required>
            <hr>
            <input id="nombreTransportista" class="swal2-input" placeholder="👤 Nombre del transportista" required>
            <input id="dniTransportista" class="swal2-input" placeholder="🪪 DNI del transportista" required>
            <input id="marcaCamion" class="swal2-input" placeholder="🚚 Marca del camión" required>
            <input id="patenteCamion" class="swal2-input" placeholder="🔠 Patente del camión" required>
            <input id="marcaChasis" class="swal2-input" placeholder="🛠️ Marca del chasis (opcional)">
            <input id="patenteChasis" class="swal2-input" placeholder="🔡 Patente del chasis (opcional)">
            <script>
                const ids = ['nombreTransportista','dniTransportista','marcaCamion','patenteCamion','marcaChasis','patenteChasis'];
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
            document.getElementById('nombreTransportista').focus();
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

                    // Enviar correos electrónicos
                    const correos = await obtenerCorreosPorLogistica(logisticaActual);
                    const emailBody = generarCuerpoEmail(tablaBody, logisticaActual, montoFormateado, Totalpallets);

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

function generarCuerpoEmail(tablaBody, logisticaActual, montoFormateado, Totalpallets) {
    let totalBultos = 0;
    let totalBultosBigger = 0;
    let totalBultosPaqueteria = 0;
    let totalEtiquetas = 0;
    let totalValor = 0;

    const filas = tablaBody.querySelectorAll('tr');
    totalEtiquetas = filas.length; // Total de filas

    filas.forEach(fila => {
        const columnas = fila.querySelectorAll('td');
        const bultos = parseInt(columnas[3].textContent.trim());
        const valor = parseFloat(columnas[5].textContent.replace(/[$.]/g, '').replace(',', '.').trim());

        totalBultos += bultos;
        totalValor += valor;

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
    <div style="margin-bottom: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #007aff; text-align: center;">Detalles de Envío 📦</h2>
        <div style="background-color: #e0f7fa; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; border: 1px solid #b2ebf2;">
            <strong>Total de Etiquetas:</strong> <strong style="color: #007aff;">${totalEtiquetas} 🏷️</strong>
        </div>
        <div style="background-color: #ffe0b2; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; border: 1px solid #ffcc80;">
            <strong>Total de Bultos:</strong> <strong style="color: #d32f2f;">${totalBultos} 📦</strong>
        </div>
        <div style="background-color: #d1c4e9; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; border: 1px solid #b39ddb;">
            <strong>Valor Declarado:</strong> <strong style="color: #4a148c;">${montoFormateado} 💰</strong>
        </div>
        <hr>
        <div style="background-color: #9B9B9BFF; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; border: 1px solid #828282FF;">
            <strong>Pallets Utilizados:</strong> <strong style="color: #484848FF;">${Totalpallets} 🪵</strong>
        </div>
    </div>
    `;

    if (logisticaActual === 'Andreani') {
        cuerpoEmail += `
            <div style="margin-bottom: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <h3 style="color: #007aff; text-align: center;">Detalles de Bultos Andreani</h3>
                <div style="background-color: #c8e6c9; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; border: 1px solid #a5d6a7;">
                    <strong>Total Bultos Bigger:</strong> <strong style="color: #388e3c;">${totalBultosBigger} 📦</strong>
                </div>
                <div style="background-color: #ffccbc; padding: 15px; border-radius: 10px; margin: 10px 0; text-align: center; border: 1px solid #ffab91;">
                    <strong>Total Bultos Paquetería:</strong> <strong style="color: #d32f2f;">${totalBultosPaqueteria} 📦</strong>
                </div>
            </div>
        `;
    }

    cuerpoEmail += `
        <table style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr style="background-color: #007aff; color: #ffffff;">
                    <th style="border: 1px solid #ccc; padding: 8px;">Fecha/Hora</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Camión</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Seguimiento</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Bultos</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Remito</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Valor</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Info</th>
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
                    cuerpoEmail += `<td style="border: 1px solid #ccc; padding: 8px;"><a href="${link.href}" style="text-decoration: none; color: #007aff;">${link.textContent.trim()}</a></td>`;
                } else {
                    cuerpoEmail += `<td style="border: 1px solid #ccc; padding: 8px;">${columna.textContent.trim()}</td>`;
                }
            } else if (index === 3) {
                // Estilo para la columna "Bultos"
                const bultos = parseInt(columna.textContent.trim());
                const color = bultos === 1 ? 'gray' : 'red';
                const textColor = 'white';
                const textBold = 'bold';
                cuerpoEmail += `
                                <td style="border: 1px solid #ccc; padding: 8px; color: ${color}; font-weight: bold;">
                                    ${bultos}
                                </td>
                            `;
            } else if (index === 4) {
                // Estilo para la columna "Remito"
                const remito = columna.textContent.trim();
                cuerpoEmail += `<td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${remito}</td>`;
            } else if (index === 5) {
                // Estilo para la columna "Valor"
                const valor = columna.textContent.trim();
                cuerpoEmail += `<td style="border: 1px solid #ccc; padding: 8px; color: green; font-weight: bold;">${valor}</td>`;
            } else {
                cuerpoEmail += `<td style="border: 1px solid #ccc; padding: 8px;">${columna.textContent.trim()}</td>`;
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
    await actualizarTotales();        
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
    // Verificar si el remito está en el rango de 23000006572 a 23000006590
    if (remito >= '23000006572' && remito <= '23000006590') {
        console.log('No se requiere verificación para el remito:', remito);
        return true;
    }

    const filas = tablaBody.getElementsByTagName('tr');

    const remitoEnTabla = Array.from(filas).some(row =>
      row.querySelector('.remito-tabla-despacho')?.textContent.trim() === remito
    );

    const etiquetaEnTabla = Array.from(filas).some(row =>
      row.querySelector('.seguimiento-tabla-despacho a')?.textContent.trim() === etiqueta
    );

    const remitosSnapshot = await dbTipeo.ref('despachosHistoricosRemitos').once('value');
    const etiquetasSnapshot = await dbTipeo.ref('despachosHistoricosEtiquetas').once('value');

    const remitoExiste = Object.keys(remitosSnapshot.val() || {}).some(key =>
      remitosSnapshot.val()[key]?.remito === remito
    );

    const etiquetaExiste = Object.keys(etiquetasSnapshot.val() || {}).some(key =>
      etiquetasSnapshot.val()[key]?.seguimiento === etiqueta
    );

    // Remito usado
    if (remitoEnTabla || remitoExiste) {
      Swal.fire({
        icon: 'error',
        title: 'Remito duplicado 📦',
        text: 'El remito ya fue despachado anteriormente.',
        allowOutsideClick: false
      });

      const emailBody = generarEmailErrorHTML(remito, etiqueta, remitoExiste, remitoEnTabla, false, false);
      enviarCorreosDeError("Remito duplicado", emailBody);
      return false;
    }

    // Etiqueta usada
    if (etiquetaEnTabla || etiquetaExiste) {
      Swal.fire({
        icon: 'error',
        title: 'Etiqueta duplicada 🏷️',
        text: 'La etiqueta ya fue utilizada antes.',
        allowOutsideClick: false
      });

      const emailBody = generarEmailErrorHTML(remito, etiqueta, false, false, etiquetaExiste, etiquetaEnTabla);
      enviarCorreosDeError("Etiqueta duplicada", emailBody);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Error en la verificación:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al verificar remito o etiqueta.',
      allowOutsideClick: false
    });

    const emailBody = `<h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 8px;">📢 LogiPaq Informa</h2>
    <p style="font-family: monospace; color: #555;">❌ Se produjo un error inesperado verificando el remito <strong>${remito}</strong> y la etiqueta <strong>${etiqueta}</strong>.</p>
    <p><strong>Error técnico:</strong> ${error.message}</p>`;

    enviarCorreosDeError("Error de sistema", emailBody);
    return false;
  }
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
        inputEtiqueta.value = val.slice(4, -4);                 // 5º al 12º dígito (8 caracteres)
        inputValor.focus();    
      } else if (/^4146\d{15,}-\d+$/.test(val)) {
        logistica = 'Oca';
        const partes = val.split('-');
        inputEtiqueta.value = partes[0];
        inputBultos.value = parseInt(partes[1], 10);
        inputBultos.disabled = true; 
        inputValor.focus(); 
      } else if (/^NOV/.test(val) || /^PTO/.test(val) || /^BNA/.test(val) || /ME1$/.test(val)) {
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
});

const agregarDespachoSiNoExiste = async (remito, etiqueta, logistica) => {
    // Convertir el remito a número para la comparación
    const remitoNumero = parseInt(remito);

    // Verificar si el remito está entre 6572 y 6590
    if (remitoNumero >= 23000006572 && remitoNumero <= 23000006590) {
        console.log("El remito es un repuesto de Posventa no ejecutare la busqueda.");
        return;
    }

    if (logistica.toLowerCase() === "oca") {
        console.log("La logística es 'oca', no se ejecutará la búsqueda de Logística Propia");
        return;
    }
    try {
        const remitoSnapshot = await dbStock.ref(`RemitosWeb/${remito}`).once('value');

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

            // Guardar en Info aunque haya coincidencia
            await dbTipeo.ref(`despachosDelDia/${remito}/Info`).set(remitoData);
            console.log("Remito encontrado y agregado en 'Info':", remitoData);
        } else {
            console.log("Remito no encontrado:", remito);
        }
    } catch (error) {
        console.error("Error al procesar el remito:", error);

        // Enviar un correo en caso de error con el detalle del remito
        const emailBody = `
        <h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 8px;">📢 LogiPaq Informa</h2>
        <p style="font-family: 'Helvetica', sans-serif; color: #555;">❌ Se produjo un error inesperado verificando el remito <strong>${remito}</strong>.</p>
        <p style="font-family: 'Helvetica', sans-serif; color: #555;"><strong>Error técnico:</strong> ${error.message}</p>
                `;
        enviarCorreosDeError("Error de sistema - Verificación de Remito", emailBody);
    }
};

function agregarDespacho(remito, etiqueta, bultos, valor, logistica) {
    const despachoData = {
        etiqueta: etiqueta,
        bultos: bultos,
        valor: valor,
        logistica: logistica,
        fecha: new Date().toISOString() 
    };

    // Llama a la función para agregar el remito si no existe
    agregarDespachoSiNoExiste(remito, etiqueta, logistica);

    // Agregar el despacho actual
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

            const etiqueta = despacho.camion === 'Cruz del Sur' ? `NIC-${despacho.seguimiento}` : despacho.seguimiento;

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

        console.log(despacho.info);

        });

        const tablaHTML = `
            <div class="table-responsive">
                <table class="table table-bordered table-hover table-striped">
                    <thead>
                        <tr>
                            <th><i class="bi bi-calendar-event"></i> Fecha y hora</th>
                            <th><i class="bi bi-truck"></i></th>
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
            showCloseButton: true
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
        try {
            // ► Validación crítica de elementos del DOM
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
            
            let ref;
            datosFiltrados = [];
            const camionesPorLogistica = {};
            const camionesUnicos = new Set();

            // ► Lógica para "Todas las logísticas"
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
                    camionesPorLogistica[logisticaKey] = new Set();
                    
                    snapshot.forEach(fechaSnap => {
                        const fecha = fechaSnap.key;
                        if ((!fechaInicio || fecha >= fechaInicio) && (!fechaFin || fecha <= fechaFin)) {
                            fechaSnap.forEach(camionSnap => {
                                const camionKey = `${logisticaKey}|${camionSnap.key}`;
                                camionesUnicos.add(camionKey);
                                camionesPorLogistica[logisticaKey].add(camionSnap.key);
                                
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
            } 
            // ► Lógica para logística específica
            else {
                const refPath = `DespachosHistoricos${logistica}`;
                ref = dbTipeo.ref(refPath);
                const snapshot = await ref.once('value');
                
                camionesPorLogistica[logistica] = new Set();
                
                snapshot.forEach(fechaSnap => {
                    const fecha = fechaSnap.key;
                    if ((!fechaInicio || fecha >= fechaInicio) && (!fechaFin || fecha <= fechaFin)) {
                        fechaSnap.forEach(camionSnap => {
                            const camionKey = `${logistica}|${camionSnap.key}`;
                            camionesUnicos.add(camionKey);
                            camionesPorLogistica[logistica].add(camionSnap.key);
                            
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
            
            // Guardar fechas para el reporte
            fechaInicioGlobal = fechaInicio;
            fechaFinGlobal = fechaFin;
            
            procesarDatos(camionesUnicos.size, camionesPorLogistica);
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
        
        actualizarDetalleResumen('#detalleCamiones', camionesPorLogistica, 'camiones');
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
      html += `
          <tr>
            <td><strong>${nombreLogistica}</strong></td>
            <td><strong style="color:#1d3557;">${camiones.size}</strong></td>
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

    for (const key in dataObj) {
        if (dataObj.hasOwnProperty(key)) {
            let valor = dataObj[key];
            
            // Si el valor es un Set (camiones), contamos la cantidad de camiones
            if (valor instanceof Set) {
                valor = valor.size;
            }

            // Si es moneda, aplicamos el formato
            if (esMoneda) {
                valor = formatearMoneda(valor);
                valor = valor.replace(/,00$/, '');  
            }

            ul.append(`<li>${key}: ${valor}</li>`);
        }
    }

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
        const logistica = $('#selectLogistica').val();
        const rangoFechas = $('#rangoFechas').val();
        
        let fechaInicio = null;
        let fechaFin = null;
        
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
