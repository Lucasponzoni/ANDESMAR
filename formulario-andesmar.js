window.onload = function() {
    mostrarEtiquetasPrevias();
};

function enviarSolicitud() {
    let spinner = document.getElementById("spinner");
    spinner.style.display = "block";
    const calleRemitente = document.getElementById("calleRemitente").value;
    const calleNroRemitente = document.getElementById("calleNroRemitente").value;
    const codigoPostalRemitente = document.getElementById("codigoPostalRemitente").value;
    const nombreApellidoDestinatario = document.getElementById("nombreApellidoDestinatario").value;
    const codigoPostalDestinatario = document.getElementById("codigoPostalDestinatario").value;
    const calleDestinatario = document.getElementById("calleDestinatario").value;
    const calleNroDestinatario = document.getElementById("calleNroDestinatario").value;
    const telefonoDestinatario = document.getElementById("telefonoDestinatario").value;
    const nroRemito = document.getElementById("nroRemito").value;
    const bultos = document.getElementById("bultos").value;
    const peso = document.getElementById("peso").value;
    const valorDeclarado = document.getElementById("valorDeclarado").value;
    const alto = parseFloat(document.getElementById("alto").value);
    const ancho = parseFloat(document.getElementById("ancho").value);
    const largo = parseFloat(document.getElementById("largo").value);
    const m3 = document.getElementById("m3").value;
    const observaciones = document.getElementById("observaciones").value;
    const modalidadEntrega = document.getElementById("modalidadEntrega").value;
    const unidadVenta = document.getElementById("unidadVenta").value;
    const esFletePagoDestino = document.getElementById("esFletePagoDestino").selectedOptions[0].value === "true";
    const esRemitoConformado = document.getElementById("esRemitoConformado").selectedOptions[0].value === "true";

    const usuario = "BOM6765";
    const clave = "BOM6765";
    const codigoCliente = "6765";

    const requestObj = {
        CalleRemitente: calleRemitente,
        CalleNroRemitente: calleNroRemitente,
        CodigoPostalRemitente: codigoPostalRemitente,
        NombreApellidoDestinatario: nombreApellidoDestinatario,
        CodigoPostalDestinatario: codigoPostalDestinatario,
        CalleDestinatario: calleDestinatario,
        CalleNroDestinatario: calleNroDestinatario,
        TelefonoDestinatario: telefonoDestinatario,
        NroRemito: nroRemito,
        Bultos: parseInt(bultos),
        Peso: parseFloat(peso),
        ValorDeclarado: parseInt(valorDeclarado),
        M3: parseInt(m3),
        Alto: Array.from({ length: parseInt(bultos) }, () => alto),
        Ancho: Array.from({ length: parseInt(bultos) }, () => ancho),
        Largo: Array.from({ length: parseInt(bultos) }, () => largo),
        Observaciones: observaciones,
        ModalidadEntrega: modalidadEntrega,
        UnidadVenta: unidadVenta,
        servicio: {
            EsFletePagoDestino: esFletePagoDestino,
            EsRemitoconformado: esRemitoConformado
        },
        logueo: {
            Usuario: usuario,
            Clave: clave,
            CodigoCliente: codigoCliente
        }
    };

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";
    
    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "temp_19762d8990c2b73dacc7a1be11943632",
        },
        body: JSON.stringify(requestObj),
    })
    .then(response => response.json())
    .then(data => {
        spinner.style.display = "none";
        console.log("Respuesta de la API:", data);

        // Mostrar la respuesta en pantalla
        mostrarRespuesta(data);
        // Llevar la pantalla al contenedor de la respuesta
        document.getElementById("respuesta").scrollIntoView({ behavior: "smooth" });
    })
    .catch(error => {
        spinner.style.display = "none";
        console.error("Error en la solicitud:", error);
        alert("Error en la solicitud.");
    });
}

function mostrarRespuesta(data) {
    let respuestaElemento = document.getElementById("respuesta");

    // Eliminar cualquier contenido existente en el elemento respuesta
    if (respuestaElemento) {
        respuestaElemento.innerHTML = "";
    } else {
        respuestaElemento = document.createElement("div");
        respuestaElemento.id = "respuesta";
        document.body.appendChild(respuestaElemento);
    }

    if ((data.Message && data.Message === "ERRORNo es posible realizar el envío hacia el destino seleccionado.") || data.NroPedido == undefined)       {
        // Si hay un mensaje de error específico en los datos

        // Crear un contenedor para el mensaje de error con estilos
        const contenedorError = document.createElement("div");
        contenedorError.classList.add('contenedorError');

        //Agregar imagen de error
        const imgError = document.createElement("img");
        imgError.src = "./Img/error.webp";
        contenedorError.appendChild(imgError);

        // Crear un mensaje de error con el texto deseado
        const mensajeError = document.createElement("p");
        mensajeError.style.fontSize = "2rem";  // Tamaño de fuente de 2 rem
        mensajeError.innerText = "No es posible realizar el envío hacia el destino seleccionado.";
        contenedorError.appendChild(mensajeError);

        respuestaElemento.appendChild(contenedorError); // Añadir el contenedor de error al elemento de respuesta
    } else {
        // Si la respuesta es exitosa

        // Crear un contenedor para la respuesta con estilos
        const contenedorRespuesta = document.createElement("div");
        contenedorRespuesta.classList.add('contenedorRespuesta');

        //Agregar imagen de éxito
        const imgSuccess = document.createElement("img");
        imgSuccess.src = "./Img/success.gif";
        contenedorRespuesta.appendChild(imgSuccess);

        // Crear un encabezado con el NroPedido
        const encabezado = document.createElement("h2");
        encabezado.classList.add('respuestaTitulo');
        encabezado.innerText = `Número de Pedido: ${data.NroPedido}`;
        contenedorRespuesta.appendChild(encabezado);

        // Crear un enlace (convertido en botón) para descargar la etiqueta
        const botonDescarga = document.createElement("button"); // Crear un botón
        botonDescarga.classList.add('botonDescarga');
        botonDescarga.innerText = `Descargar etiqueta ${data.NroPedido}`;

        // Agregar el evento click para abrir el enlace en una nueva pestaña
        botonDescarga.addEventListener("click", function () {
            window.open(data.Link, "_blank");
        });

        contenedorRespuesta.appendChild(botonDescarga); // Añadir el botón al contenedor
        respuestaElemento.appendChild(contenedorRespuesta); // Añadir el contenedor al elemento de respuesta

        // Guardar la información en el almacenamiento local si el número de pedido no es "undefined"
        if (data.NroPedido !== undefined) {
            const etiquetaGenerada = {
                NroPedido: data.NroPedido,
                NombreApellidoDestinatario: document.getElementById("nombreApellidoDestinatario").value,
                Link: data.Link // Agregamos el enlace generado a la etiqueta
            };

            // Obtener las etiquetas previas del almacenamiento local
            let etiquetasPrevias = JSON.parse(localStorage.getItem("etiquetasPrevias")) || [];

            // Agregar la nueva etiqueta generada a la lista de etiquetas previas
            etiquetasPrevias.push(etiquetaGenerada);

            // Limitar el número de etiquetas previas a mostrar
            const MAX_ETIQUETAS_PREVIAS = 5;
            if (etiquetasPrevias.length > MAX_ETIQUETAS_PREVIAS) {
                etiquetasPrevias = etiquetasPrevias.slice(-MAX_ETIQUETAS_PREVIAS);
            }

            // Guardar las etiquetas previas actualizadas en el almacenamiento local
            localStorage.setItem("etiquetasPrevias", JSON.stringify(etiquetasPrevias));

            // Mostrar las últimas etiquetas generadas
            mostrarEtiquetasPrevias();

        }
    }
}

function mostrarEtiquetasPrevias() {
    const ultimasEtiquetasDiv = document.getElementById("ultimasEtiquetas");
    ultimasEtiquetasDiv.innerHTML = "";

    // Obtener las etiquetas previas del almacenamiento local
    let etiquetasPrevias = JSON.parse(localStorage.getItem("etiquetasPrevias")) || [];

        // Mostrar las últimas etiquetas generadas
        etiquetasPrevias.forEach(etiqueta => {
        const nombreEnMayusculas = etiqueta.NombreApellidoDestinatario.toUpperCase();
        const etiquetaElemento = document.createElement("button");
        etiquetaElemento.classList.add("reDescarga");
        etiquetaElemento.innerHTML = `Descargar etiqueta ${etiqueta.NroPedido} - ${nombreEnMayusculas} <img src="./Img/Download.png" class="download-icon">`;
            
        // Agregar evento de clic para abrir el enlace
        etiquetaElemento.addEventListener("click", function () {
            // Obtener el enlace asociado al número de pedido
            const enlace = etiquetasPrevias.find(et => et.NroPedido === etiqueta.NroPedido)?.Link;
            if (enlace) {
                window.open(enlace, "_blank");
            } else {
                alert("El enlace no está disponible.");
            }
        });

        ultimasEtiquetasDiv.appendChild(etiquetaElemento);
    });
}