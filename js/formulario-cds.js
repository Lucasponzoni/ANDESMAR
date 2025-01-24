async function enviarSolicitudCDS() {
    console.log("Iniciando Generacion de Etiqueta CDS:"); // Para depuración

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

    document.getElementById("descargaCruzDelSur").style.display = 'block'; // Mostrar la sección de descarga

    const urlCds = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/NuevaCotXVolEntregaYDespacho?idcliente=87231e4b-b414-47c0-882b-ef98adb94fe4&ulogin=necommerce&uclave=novogar71!&volumen=${volumenTotalcds}&peso=${pesoCds}&codigopostal=${codigoPostalCds}&localidad=${localidadCds}&valor=${valorCds}&contrareembolso=&items=&despacharDesdeDestinoSiTieneAlmacenamiento=&queentrega=${queEntregaCds}&quevia=T&documento=${documentoCds}&nombre=${nombreCds}&telefono=${telefonoCds}&email=${emailCds}&domicilio=${domicilioCds}&bultos=${totalBultosCds}&referencia=${referenciaCds}&textosEtiquetasBultos&textoEtiquetaDocumentacion&devolverDatosParaEtiquetas=N`;

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
            document.getElementById("numeroDeEnvioCruzDelSur").innerText = `NIC-${nicCds}`;
            document.getElementById("titleCruzDelSur").innerHTML = `
                <span><img class="surprise" src="./Img/download-file.gif"> CRUZ DEL SUR NIC-${nicCds}<span id="numeroDeEnvioCruzDelSur"></span></span>
            `;
            document.getElementById("nombreCruzDelSur").innerText = nombreCds;
            document.getElementById("nombreCruzDelSur").style.display = 'none'; // Mostrar el nombre

            // Llamar a la API para descargar la etiqueta
            await descargarEtiqueta(numeroCotizacionCds);
        } else if (dataCds.Respuesta[0].Estado === 25) {
            // Manejo de duplicados
            const duplicadoNicCds = dataCds.Respuesta[0].NIC;
            document.getElementById("numeroDeEnvioCruzDelSur").innerText = duplicadoNicCds;
            document.getElementById("titleCruzDelSur").innerHTML = `
                <img class="surprise" src="./Img/404.gif"> CRUZ DEL SUR - DUPLICA REMITO EN SERVIDOR
            `;
            document.getElementById("apiResponseCruzDelSur").innerHTML = `
                <button class="btn btn-dark-blue" type="button">
                <i class="bi bi-exclamation-triangle-fill" style="margin-right: 8px;"></i> El Remito ya fue utilizado en NIC-${duplicadoNicCds}
                </button>
            `;
        }
    } catch (error) {
        console.error("Error al crear la cotización:", error);
        document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al crear la cotización. Por favor, intenta nuevamente.";
    }
}

async function descargarEtiqueta(numeroCotizacionCds) {
    const urlEtiquetaCds = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/EtiquetasPDF?idcliente=87231e4b-b414-47c0-882b-ef98adb94fe4&ulogin=necommerce&uclave=novogar71!&id=${numeroCotizacionCds}&tamanioHoja=1&posicionArrancar=1&textoEspecialPorEtiqueta=`;

    const optionsEtiquetaCds = {
        method: 'GET',
        headers: {
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
        }
    };

    try {
        const responseEtiquetaCds = await fetch(urlEtiquetaCds, optionsEtiquetaCds);
        const blobCds = await responseEtiquetaCds.blob();
        const urlCds = window.URL.createObjectURL(blobCds);

        // Actualizar el botón para descargar el PDF
        document.getElementById("apiResponseCruzDelSur").innerHTML = `
            <a class="btn btn-dark-blue" href="${urlCds}" target="_blank">
                <i class="bi bi-filetype-pdf" style="margin-right: 8px;"></i> Descargar Etiqueta PDF
            </a>
        `;
    } catch (error) {
        console.error("Error al descargar la etiqueta:", error);
        document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al descargar la etiqueta. Por favor, intenta nuevamente.";
    }
}
