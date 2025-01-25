let idCDS, usuarioCDS, passCDS;

const obtenerCredencialesCDS = async () => {
    try {
        const snapshot = await window.dbCDS.ref('LogiPaq').once('value');
        const data = snapshot.val();
        idCDS = data[3];
        usuarioCDS = data[4];
        passCDS = data[5];
    } catch (error) {
        console.error('Error al obtener credenciales de Firebase:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerCredencialesCDS();
});


async function enviarSolicitudCDS() {
    if (!validarFormulario()) {
        return; 
    }
    
    console.log("Iniciando Generación de Etiqueta CDS:");

    // Obtener valores de los elementos del DOM
    const volumenTotalcds = parseFloat(document.getElementById("volumenTotalcm").innerText) || 0;
    const pesoCds = document.getElementById("peso").value;
    const codigoPostalCds = document.getElementById("codigoPostalDestinatario").value;
    const localidadCds = document.getElementById('localidad').value;
    const valorCds = document.getElementById("valorDeclarado").value;
    const queEntregaCds = document.getElementById("tipoEntregaCruzDelSur").value;
    const documentoCds = document.getElementById('nroRemito').value;
    const nombreCds = document.getElementById('nombreApellidoDestinatario').value;
    const telefonoCds = document.getElementById("telefonoDestinatario").value;
    const emailCds = document.getElementById('emailDestinatario').value;
    const domicilioCds = document.getElementById('calleDestinatario').value + ' ' + document.getElementById('calleNroDestinatario').value;

    let totalBultosCds = 0;
    const bultoElements = document.querySelectorAll('.bulto');

    bultoElements.forEach(bulto => {
        const cantidadCds = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; 
        totalBultosCds += cantidadCds;
    });

    const referenciaCds = document.getElementById("nroRemito").value;

    document.getElementById("descargaCruzDelSur").style.display = 'block'; 

    const urlCds = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/NuevaCotXVolEntregaYDespacho?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&volumen=${volumenTotalcds}&peso=${pesoCds}&codigopostal=${codigoPostalCds}&localidad=${localidadCds}&valor=${valorCds}&contrareembolso=&items=&despacharDesdeDestinoSiTieneAlmacenamiento=&queentrega=${queEntregaCds}&quevia=T&documento=${documentoCds}&nombre=${nombreCds}&telefono=${telefonoCds}&email=${emailCds}&domicilio=${domicilioCds}&bultos=${totalBultosCds}&referencia=${referenciaCds}&textosEtiquetasBultos&textoEtiquetaDocumentacion&devolverDatosParaEtiquetas=N`;

    const optionsCds = {
        method: 'GET',
        headers: {
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
        }
    };

    try {
        // Mostrar el spinner
        document.getElementById("apiResponseCruzDelSur").innerHTML = `
            <button class="btn btn-dark-blue" type="button" disabled>
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Cargando Etiqueta...
            </button>
        `;

        const responseCds = await fetch(urlCds, optionsCds);
        const dataCds = await responseCds.json();
        console.log(dataCds); // Para depuración

        // Manejo de la respuesta
        if (dataCds.Respuesta[0].Estado === 0) {
            const numeroCotizacionCds = dataCds.Respuesta[0].NumeroCotizacion;
            const nicCds = dataCds.Respuesta[0].NIC;

            // Actualizar el título y el botón
            const numeroDeEnvioElement = document.getElementById("numeroDeEnvioCruzDelSur");
            if (numeroDeEnvioElement) {
                numeroDeEnvioElement.innerText = `NIC-${nicCds}`;
            } else {
                console.error("Elemento 'numeroDeEnvioCruzDelSur' no encontrado.");
            }

            const titleCruzDelSurElement = document.getElementById("titleCruzDelSur");
            if (titleCruzDelSurElement) {
                titleCruzDelSurElement.innerHTML = `
                    <span><img class="surprise" src="./Img/download-file.gif"> CRUZ DEL SUR NIC-${nicCds}<span id="numeroDeEnvioCruzDelSur"></span></span>
                `;
            }

            // Llamar a la API para descargar la etiqueta
            await descargarEtiqueta(numeroCotizacionCds, nicCds);
        } else if (dataCds.Respuesta[0].Estado === 25) {
            // Manejo de duplicados
            const duplicadoNicCds = dataCds.Respuesta[0].NIC;

            // Limpiar contenido anterior
            const apiResponseElement = document.getElementById("apiResponseCruzDelSur");

                        if (apiResponseElement) {
                            apiResponseElement.innerHTML = `
                                <div class="mt-2 text-center corrija-remito disabled">
                                    <button class="btn" type="button" style="color: #0d2c54;">
                                        <i class="bi bi-pencil-square" style="margin-right: 8px;"></i> Corrija el remito y vuelva a presionar "Generar etiqueta"
                                    </button>
                                </div>
                                <button class="btn btn-dark-blue" type="button">
                                    <i class="bi bi-exclamation-triangle-fill" style="margin-right: 8px; margin-top: 3px;"></i>Remito utilizado en NIC-${duplicadoNicCds}
                                </button>
                            `;
                        }
                        
                        const titleCruzDelSurElement = document.getElementById("titleCruzDelSur");
                        if (titleCruzDelSurElement) {
                            titleCruzDelSurElement.innerHTML = `
                                <span><img class="surprise" src="./Img/404.gif"> REMITO ${documentoCds} DUPLICADO EN SERVIDOR</span>
                            `;
                        }
        } else if (dataCds.Respuesta[0].Estado === 101) {
            // Manejo del estado 101
            const apiResponseElement = document.getElementById("apiResponseCruzDelSur");
if (apiResponseElement) {
    apiResponseElement.innerHTML = `
        <button class="btn btn-dark-blue" type="button">
            <i class="bi bi-exclamation-triangle-fill" style="margin-right: 8px;"></i> Consultar con comercial de cuenta
        </button>
    `;
}

const titleCruzDelSurElement = document.getElementById("titleCruzDelSur");
if (titleCruzDelSurElement) {
    titleCruzDelSurElement.innerHTML = `
        <span><img class="surprise" src="./Img/404.gif"> CONTRATO SIN HABILITAR<span id="numeroDeEnvioCruzDelSur"></span></span>
    `;
}
        }
    } catch (error) {
        console.error("Error al crear la cotización:", error);
        document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al crear la cotización. Por favor, intenta nuevamente.";
    }
}

async function descargarEtiqueta(numeroCotizacionCds, nicCds) {
    const urlEtiquetaCds1 = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/EtiquetasPDF?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&id=${numeroCotizacionCds}&tamanioHoja=1&posicionArrancar=1&textoEspecialPorEtiqueta=`;
    const urlEtiquetaCds2 = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/EtiquetasPDF?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&id=${numeroCotizacionCds}&tamanioHoja=2&posicionArrancar=1&textoEspecialPorEtiqueta=`;

    const optionsEtiquetaCds = {
        method: 'GET',
        headers: {
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
        }
    };

    try {
        // Consultar el primer endpoint
        const responseEtiquetaCds1 = await fetch(urlEtiquetaCds1, optionsEtiquetaCds);
        const blobCds1 = await responseEtiquetaCds1.blob();
        const urlCds1 = window.URL.createObjectURL(blobCds1);

        // Crear un enlace temporal para descargar el archivo con el nombre del NIC
        const link1 = document.createElement('a');
        link1.href = urlCds1;
        link1.download = `Etiqueta NIC-${nicCds}.pdf`;
        link1.target = '_blank';
        link1.className = 'btn btn-dark-blue';
        link1.innerHTML = `
            <i class="bi bi-filetype-pdf" style="margin-right: 8px;"></i> Descargar Etiqueta PDF A4
        `;

        // Actualizar el contenido del botón
        const apiResponseElement = document.getElementById("apiResponseCruzDelSur");
        apiResponseElement.innerHTML = '';
        apiResponseElement.appendChild(link1);

        // Crear un enlace temporal para descargar el archivo con el nombre del NIC
        const link2 = document.createElement('a');
        link2.className = 'btn corrija-remito';
        link2.style.color = '#0d2c54';
        link2.innerHTML = `
            <i class="bi bi-alarm-fill"></i> Generando etiqueta para Zebra...
        `;

        apiResponseElement.prepend(link2);

        // Consultar el segundo endpoint
        const responseEtiquetaCds2 = await fetch(urlEtiquetaCds2, optionsEtiquetaCds);
        const blobCds2 = await responseEtiquetaCds2.blob();
        const urlCds2 = window.URL.createObjectURL(blobCds2);

        link2.href = urlCds2;
        link2.download = `Etiqueta 10x7cm NIC-${nicCds}.pdf`;
        link2.target = '_blank';
        link2.innerHTML = `
            <i class="bi bi-box-arrow-in-down-right"></i> Opción de Descarga etiqueta 10x7cm CLICK AQUI
        `;


    } catch (error) {
        console.error("Error al descargar la etiqueta:", error);
        document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al descargar la etiqueta. Por favor, intenta nuevamente.";
    }
}