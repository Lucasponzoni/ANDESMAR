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
    
    $('#modalDespachoPorLogistica').modal('show');
}

function cargarDespachosPorLogistica(logistica, tablaBody, spinner, tablaContainer) {
    console.log("Cargando despachos para la logística:", logistica); 
    dbTipeo.ref('despachosDelDia').orderByChild('logistica').equalTo(logistica).on('value', (snapshot) => {
        const data = snapshot.val();
        console.log("Datos obtenidos de Firebase:", data); 

        tablaBody.innerHTML = ''; 

        if (data) {
            Object.keys(data).forEach((remito) => {
                const despacho = data[remito];
                const tablaBodyModal = document.getElementById('tabla-despacho-xLogistica-body');
                agregarFilaTabla(remito, despacho, tablaBodyModal);
            });
            tablaContainer.style.display = 'block'; 
        } else {
            mostrarMensajeNoHayDespachos(); 
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

            filas.forEach(fila => {
                const columnas = fila.querySelectorAll('td');
                const valor = parseFloat(columnas[5].textContent.replace(/\./g, '').replace(',', '.').replace('$', '').trim());
                montoTotal += valor;
                const despacho = {
                    fechaHora: columnas[0].textContent.trim(),
                    camion: columnas[1].textContent.trim(),
                    seguimiento: columnas[2].textContent.trim(),
                    bultos: columnas[3].textContent.trim(),
                    remito: columnas[4].textContent.trim(),
                    valor: columnas[5].textContent.trim(),
                    info: columnas[6].textContent.trim()
                };
                despachos.push(despacho);
            });

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

                    limpiarDespachosDelDia();
                });
            });
        }
    });
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
    cargarDespachos(); 
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
        <td class="remito-tabla-despacho">${remito}</td>
        <td>
            <div class="valor-tabla-despacho">${despacho.valor}</div>
        </td>
        <td class="info-tabla-despacho">OK</td>
        <td class="delete-tabla-despacho">
            <button class="btn btn-danger btn-sm"  
                    onclick="confirmarEliminacion('${remito}')">
                <i class="ml-1 bi bi-trash3-fill"></i>
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
  
      return true;
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
        inputEtiqueta.value = val.slice(4, -4); // Solo toma "78406107 VALOR DEL MEDIO"
        inputValor.focus(); // Saltar al campo de valor
      } else if (/^4146\d{15,}-\d+$/.test(val)) {
        logistica = 'Oca';
        const partes = val.split('-');
        inputEtiqueta.value = partes[0];
        inputBultos.value = parseInt(partes[1], 10);
        inputBultos.disabled = true; // Deshabilitar el campo de bultos
        inputValor.focus(); // Saltar al campo de valor
      } else if (/^NOV/.test(val) || /^BNA/.test(val) || /ME1$/.test(val)) {
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
});

function agregarDespacho(remito, etiqueta, bultos, valor, logistica) {
    const despachoData = {
        etiqueta: etiqueta,
        bultos: bultos,
        valor: valor,
        logistica: logistica,
        fecha: new Date().toISOString() 
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