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
        const largo = parseFloat(document.getElementById("largo").value);        const m3 = document.getElementById("m3").value;
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
            Largo: Array.from({ length: parseInt(bultos) }, () => largo),             Observaciones: observaciones,
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
                "x-cors-api-key": "temp_4cdbd5f5168caeb689e6a42466b233c7",
            },
            body: JSON.stringify(requestObj),
        })
        .then(response => response.json())
        .then(data => {
            spinner.style.display = "none";
            console.log("Respuesta de la API:", data);

        // Mostrar la respuesta en pantalla
        mostrarRespuesta(data);
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
    
        // Verificar si la respuesta contiene el mensaje de error específico
        if (data.Message && data.Message === "ERRORNo es posible realizar el envío hacia el destino seleccionado.") {
            // Crear un contenedor para el mensaje de error con estilos
            const contenedorError = document.createElement("div");
            contenedorError.style.textAlign = "center";
            contenedorError.style.marginTop = "20px";
            contenedorError.style.backgroundColor = "red"; // Color de fondo rojo
            contenedorError.style.color = "white"; // Color del texto blanco
            contenedorError.style.borderRadius = "10px"; // Borde redondeado
            contenedorError.style.padding = "20px"; // Añadir relleno
    
            // Crear un mensaje de error con el texto deseado
            const mensajeError = document.createElement("p");
            mensajeError.style.fontSize = "2rem";  // Tamaño de fuente de 2 rem
            mensajeError.innerText = "No es posible realizar el envío hacia el destino seleccionado.";
            contenedorError.appendChild(mensajeError);
    
            respuestaElemento.appendChild(contenedorError); // Añadir el contenedor de error al elemento de respuesta
        } else {
            // Crear un contenedor para la respuesta con estilos
            const contenedorRespuesta = document.createElement("div");
            contenedorRespuesta.style.textAlign = "center";
            contenedorRespuesta.style.marginTop = "20px";
            contenedorRespuesta.style.backgroundColor = "#fff"; // Color de fondo blanco
            contenedorRespuesta.style.borderRadius = "10px"; // Borde redondeado
            contenedorRespuesta.style.padding = "20px"; // Añadir relleno
    
            // Crear un encabezado con el NroPedido
            const encabezado = document.createElement("h2");
            encabezado.style.fontSize = "2rem";  // Tamaño de fuente de 2 rem
            encabezado.innerText = `NroPedido: ${data.NroPedido}`;
            contenedorRespuesta.appendChild(encabezado);
    
            // Crear un enlace (convertido en botón) para descargar la etiqueta
            const botonDescarga = document.createElement("button"); // Crear un botón
            botonDescarga.style.fontSize = "2rem";  // Tamaño de fuente de 2 rem
            botonDescarga.innerText = "Descargar Etiqueta";
            botonDescarga.style.marginTop = "10px"; // Añadir margen superior
            botonDescarga.style.padding = "8px 16px"; // Añadir relleno
            botonDescarga.style.cursor = "pointer"; // Cambiar cursor al pasar el ratón
            botonDescarga.style.borderRadius = "5px"; // Añadir esquinas redondeadas
            botonDescarga.style.border = "none"; // Quitar borde
            botonDescarga.style.backgroundColor = "#007bff"; // Color de fondo azul
            botonDescarga.style.color = "#fff"; // Color del texto blanco
    
            // Agregar el evento click para abrir el enlace en una nueva pestaña
            botonDescarga.addEventListener("click", function () {
                window.open(data.Link, "_blank");
            });
    
            contenedorRespuesta.appendChild(botonDescarga); // Añadir el botón al contenedor
            respuestaElemento.appendChild(contenedorRespuesta); // Añadir el contenedor al elemento de respuesta
        }
    }
    