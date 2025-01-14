const apiUrlLogin = 'https://apis.andreani.com/login';
const apiUrlLabel = 'https://proxy.cors.sh/https://apis.andreani.com/v2/ordenes-de-envio';
const username = 'novogar_gla';
const password = 'JoBOraCDJZC';

async function obtenerTokenAndreaniV2() {
        try {
            const response = await fetch(apiUrlLogin, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${btoa(`${username}:${password}`)}`
                }
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log('Token de autenticación:', data.token);
    
                // Copiar el token al portapapeles
                navigator.clipboard.writeText(data.token);
    
                // Cambiar el estado del botón
                const tokenButton = document.getElementById('tokenButton');
                tokenButton.classList.remove('btn-warning');
                tokenButton.classList.add('btn-success');
                tokenButton.disabled = true;
                tokenButton.innerHTML = '<i class="bi bi-clipboard-check"></i> Se ha copiado el token al portapapeles';
    
                // Restaurar el estado original del botón después de 5 segundos
                setTimeout(() => {
                    tokenButton.classList.remove('btn-success');
                    tokenButton.classList.add('btn-warning');
                    tokenButton.disabled = false;
                    tokenButton.innerHTML = '<i class="bi bi-key"></i> Obtener token Andreani';
                }, 5000);
    
                return data.token;
            } else {
                throw new Error('No se pudo obtener el token');
            }
        } catch (error) {
            console.error('Error al obtener el token de autenticación:', error);
        }
    }

function validarFormulario() {
    const camposRequeridos = [
        "calleRemitente",
        "calleNroRemitente",
        "codigoPostalRemitente",
        "nombreApellidoDestinatario",
        "codigoPostalDestinatario",
        "calleDestinatario",
        "calleNroDestinatario",
        "telefonoDestinatario",
        "emailDestinatario",
        "nroRemito",
        "localidad",
        "peso",
        "valorDeclarado",
        "modalidadEntrega",
        "unidadVenta",
        "esFletePagoDestino",
        "esRemitoConformado"
    ];

    // Verifica si alguno de los campos está vacío
    for (const campo of camposRequeridos) {
        const input = document.getElementById(campo);
        if (!input || !input.value.trim()) {
            // Si algún campo está vacío, se lanza un SweetAlert indicando el error
            Swal.fire({
                icon: 'error',
                title: 'Campo obligatorio',
                text: `Por favor complete el campo: ${input.placeholder || input.name || campo}.`,
                confirmButtonText: 'OK'
            });
            return false; // Detener el envío del formulario
        }
    }

    return true; // Si todo está completo, permitir el envío sin mostrar nada
}

// Mapeo de provincias a códigos de región
const regionMap = {
    "Salta": "AR-A",
    "buenos aires": "AR-B",
    "capital federal": "AR-C",
    "san luis": "AR-D",
    "entre rios": "AR-E",
    "la rioja": "AR-F",
    "santiago del estero": "AR-G",
    "chaco": "AR-H",
    "san juan": "AR-J",
    "catamarca": "AR-K",
    "la pampa": "AR-L",
    "mendoza": "AR-M",
    "misiones": "AR-N",
    "formosa": "AR-P",
    "neuquen": "AR-Q",
    "rio negro": "AR-R",
    "santa fe": "AR-S",
    "tucuman": "AR-T",
    "chubut": "AR-U",
    "tierra del Fuego": "AR-V",
    "corrientes": "AR-W",
    "cordoba": "AR-X",
    "jujuy": "AR-Y",
    "santa cruz": "AR-Z"
};

async function getAuthToken() {
    try {
        const response = await fetch(apiUrlLogin, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${btoa(`${username}:${password}`)}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Token de autenticación:', data.token);
            return data.token; 
        } else {
            throw new Error('No se pudo obtener el token');
        }
    } catch (error) {
        console.error('Error al obtener el token de autenticación:', error);
    }
}

async function enviarSolicitudAndreani() {

    if (!validarFormulario()) {
        return; // Si la validación falla, no continua con la solicitud
    }

    document.getElementById('descargaAndreani').style.display = 'block'; // Mostrar contenedor
    const apiResponseContainer = document.getElementById('apiResponse');
    apiResponseContainer.innerHTML = `
        <button class="btn btn-danger" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Cargando Etiqueta...
        </button>
    `; // Mostrar botón de carga

    const token = await getAuthToken();

    // Obtener el nombre de la provincia y convertirlo a minúsculas
    const provinciaNombre = document.querySelector('.provincia p').textContent.trim().toLowerCase();
    const regionCodigo = regionMap[provinciaNombre] || ""; // Obtener el código de región

    // Inicializar el array de bultos
    const bultos = [];
    let totalBultos = 0;

    // Suponiendo que tienes un contenedor para los bultos
    const bultoElements = document.querySelectorAll('.bulto'); // Cambia esto según tu estructura HTML

    // Obtener valores totales
    const pesoTotal = parseFloat(document.getElementById('peso').value) || 0; // Obtener peso total

    bultoElements.forEach(bulto => {
        const cantidad = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; // Obtener cantidad

        // Obtener dimensiones de cada bulto
        const alto = parseFloat(bulto.querySelector(`input[name^="Alto"]`).value) || 0;
        const ancho = parseFloat(bulto.querySelector(`input[name^="Ancho"]`).value) || 0;
        const largo = parseFloat(bulto.querySelector(`input[name^="Largo"]`).value) || 0;

        // Calcular el peso por bulto
        const pesoPorBulto = pesoTotal / cantidad;

        for (let i = 0; i < cantidad; i++) {
            bultos.push({
                "kilos": pesoPorBulto,
                "largoCm": largo, 
                "altoCm": alto,   
                "anchoCm": ancho,  
                "volumenCm": (alto * ancho * largo) / 1000000, // Calcular volumen en m³
                "valorDeclaradoSinImpuestos": parseFloat(document.getElementById('valorDeclarado').value) - (parseFloat(document.getElementById('valorDeclarado').value) * 0.21),
                "valorDeclaradoConImpuestos": parseFloat(document.getElementById('valorDeclarado').value),
                "referencias": [
                    { "meta": "detalle", "contenido": "electrodomestico" },
                    { "meta": "idCliente", "contenido": (document.getElementById('nroRemito').value + "-ID").toUpperCase() },
                    { "meta": "observaciones", "contenido": document.getElementById('observaciones').value.substring(0, 40) }
                ]
            });
        }

        totalBultos += cantidad; // Sumar la cantidad total de bultos
    });

    const requestData = {
        "contrato": parseFloat(document.getElementById('volumenTotalcm').textContent) > 100000 ? "351002753" : "400017259",
        "idPedido": (document.getElementById('nroRemito').value + "-ID").toUpperCase(),
        "origen": {
            "postal": {
                "codigoPostal": "2126",
                "calle": "R. Prov. 21 Km",
                "numero": "4,9",
                "localidad": "ALVEAR",
                "region": "AR-S",
                "pais": "Argentina"
            }
        },
        "destino": {
            "postal": {
                "codigoPostal": document.getElementById('codigoPostalDestinatario').value,
                "calle": document.getElementById('calleDestinatario').value,
                "numero": document.getElementById('calleNroDestinatario').value,
                "localidad": document.getElementById('localidad').value,
                "region": regionCodigo, // Usar el código de región obtenido
                "pais": "Argentina"
            }
        },
        "remitente": {
            "nombreCompleto": "NOVOGAR.COM.AR",
            "email": "posventa@novogar.com.ar",
            "documentoTipo": "CUIT",
            "documentoNumero": "30685437011",
            "telefonos": [{ "tipo": 1, "numero": "3416680658" }]
        },
        "destinatario": [{
            "nombreCompleto": document.getElementById('nombreApellidoDestinatario').value,
            "email": document.getElementById('emailDestinatario').value,
            "documentoTipo": "CUIT",
            "documentoNumero": "30685437011",
            "telefonos": [{ "tipo": 1, "numero": document.getElementById('telefonoDestinatario').value }]
        }],
        "remito": {
            "numeroRemito": (document.getElementById('nroRemito').value + "-R").toUpperCase(),
        },
        "bultos": bultos // Usar el array de bultos
    };

    console.log("Datos enviado a API ANDREANI:", requestData)

    try {
        const response = await fetch(apiUrlLabel, {
            method: 'POST',
            headers: {
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                'x-authorization-token': token, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
    
        if (response.ok) {
            const data = await response.json();
            const numeroDeEnvio = data.bultos[0].numeroDeEnvio;
            const nombreDestinatario = document.getElementById('nombreApellidoDestinatario').value.toUpperCase(); // Asegúrate de que este campo exista
    
            document.getElementById('numeroDeEnvio').textContent = numeroDeEnvio;
            document.getElementById('nombreAndreani').textContent = nombreDestinatario; // Mostrar el nombre
    
            // Configurar botones de descarga
            createDownloadButton(numeroDeEnvio, token);
            
            // Mostrar el contenedor de descarga
            document.getElementById('descargaAndreani').style.display = 'block';
            console.log("Respuesta API ANDREANI:", response)
            
        } else {
            const errorMessage = await response.text();
            showError(errorMessage);
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);
        showError(error.message);
    }
    
    function showError(errorMessage) {
        const errorResponseContainer = document.getElementById('errorResponse');
        errorResponseContainer.textContent = `Error: ${errorMessage}`;
    }
    
    function createDownloadButton(numeroDeEnvio, token) {
        const url = `https://proxy.cors.sh/https://apis.andreani.com/v2/ordenes-de-envio/${numeroDeEnvio}/etiquetas`;
    
        fetch(url, {
            method: "GET",
            headers: {
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                "x-authorization-token": token,
                "Accept": "application/pdf"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP! Status: ${response.status}`);
            }
            return response.blob();
        })
        .then(data => {
            const pdfUrl = URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.target = '_blank'; // Abrir en nueva pestaña
            link.className = 'btn btn-danger'; // Clase para botón rojo
            link.style.display = 'inline-flex'; // Para alinear icono y texto
            link.style.alignItems = 'center'; // Alinear verticalmente
    
            // Crear el icono
            const icon = document.createElement('i');
            icon.className = 'bi bi-filetype-pdf'; // Clase del icono
            icon.style.marginRight = '8px'; // Espacio entre el icono y el texto
    
            // Añadir el icono y el texto al enlace
            link.appendChild(icon);
            link.appendChild(document.createTextNode(' Descargar Etiqueta PDF'));
    
            const apiResponseContainer = document.getElementById('apiResponse');
            apiResponseContainer.innerHTML = ''; // Limpiar contenido previo
            apiResponseContainer.appendChild(link); // Añadir el nuevo enlace
        })
        .catch(error => {
            console.error('Error al descargar el PDF:', error);
            showError(error.message);
        });
    }
}
