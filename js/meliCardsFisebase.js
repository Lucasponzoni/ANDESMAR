// Inicializa Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCMu2vPvNzhv0cM3b4RItmqZybRhhR_HJM",
    authDomain: "despachos-meli-novogar.firebaseapp.com",
    projectId: "despachos-meli-novogar",
    storageBucket: "despachos-meli-novogar.appspot.com",
    messagingSenderId: "774252628334",
    appId: "1:774252628334:web:623aa84bc3b1cebd3f997f",
    measurementId: "G-E0E9K4TEDW"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Función para cargar datos de Firebase
function cargarDatos() {
    const spinner = document.getElementById('spinner');
    const cardsContainer = document.getElementById('meli-cards');

    spinner.style.display = 'block'; 
    cardsContainer.innerHTML = ''; // Limpia el contenedor de cards

    database.ref('envios').once('value')
        .then(snapshot => {
            const allData = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                allData.push({ 
                    id: childSnapshot.key, 
                    Altura: data.Altura,
                    Calle: data.Calle,
                    Cantidad: data.Cantidad,
                    Correosugerido: data.Correosugerido,
                    Cp: data.Cp,
                    Email: data.Email,
                    NombreyApellido: data.NombreyApellido,
                    Observaciones: data.Observaciones,
                    Peso: data.Peso,
                    Producto: data.Producto,
                    Provincia: data.Provincia,
                    Recibe: data.Recibe,
                    SKU: data.SKU,
                    Telefono: data.Telefono,
                    'Volumen CM³': data['Volumen CM³'],
                    'Volumen M³': data['Volumen M³'],
                    idOperacion: data.idOperacion, // Cambiado aquí
                    localidad: data.localidad,
                    medidas: data.medidas,
                    nombreDeUsuario: data.nombreDeUsuario
                });
            });

            // Invertir datos si es necesario
            allData.reverse();

            // Renderizar tarjetas
            allData.forEach(data => {
                const card = crearCard(data);
                cardsContainer.appendChild(card);
            });

            // Ocultar el spinner
            spinner.style.display = 'none';
        })
        .catch(error => {
            console.error("Error al cargar los datos: ", error);
        });
}

// Función para crear una card
function crearCard(data) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4';

    cardDiv.innerHTML = `
        <div class="card position-relative">

        <!-- <div class="em-circle">ME1</div> CSS -->
            <div class="em-circle-isFraud">Fraude <i class="bi bi-exclamation-triangle-fill"></i></div>
            <div id="estadoEnvio${data.id}" class="em-circle-state">Envio pendiente <i class="bi bi-stopwatch-fill"></i></i></div>
            <div class="card-body-meli">
                <h5 class="card-title-meli"><i class="bi bi-person-bounding-box"></i> ${data.NombreyApellido}</h5>
                <h6 class="user-title-meli">${data.nombreDeUsuario}</h6>
                <div class="meli-box1"> 
                    <p class="card-text cpLocalidad-meli"><i class="fas fa-map-marker-alt"></i> ${data.Cp}, ${data.localidad}, ${data.Provincia}</p>
                    <p class="card-text cpLocalidad-meli ${data.Correosugerido === 'Andesmar' ? 'correo-andesmar' : data.Correosugerido === 'Andreani' ? 'correo-andreani' : ''}">${data.Correosugerido}</p>     
                </div>
                <div class="d-flex align-items-center">
                    <p class="remitoCardMeli card-text mb-0">${data.idOperacion}</p>
                    <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <button class="btn btn-outline-secondary w-100 collapps-envio-meli" data-bs-toggle="collapse" data-bs-target="#collapseDetails${data.id}" aria-expanded="false" aria-controls="collapseDetails${data.id}">
                    <i class="bi bi-chevron-down"></i> Ver más detalles
                </button>
                <div class="collapse" id="collapseDetails${data.id}">
                    <div class="little-card-meli">
                        <p><i class="fas fa-home"></i> Calle: <span id="calle-${data.id}">${data.Calle}</span></p>
                        <p><i class="bi bi-123"></i> Altura: <span id="altura-${data.id}">${data.Altura}</span></p>
                        <p><i class="fas fa-phone"></i> Telefono: <span id="telefono-${data.id}">${data.Telefono}</span></p>
                        <p><i class="bi bi-envelope-at-fill"></i> Email: <span id="email-${data.id}">${data.Email}</span></p>
                        <p><i class="bi bi-info-circle-fill"></i> Autorizado: <span id="autorizado-${data.id}">${data.Recibe}</span></p>
                        <p><i class="bi bi-sticky-fill"></i> Observaciones: <span id="observaciones-${data.id}">${data.Observaciones}</span></p>
                    </div>
                    <div class="dimensions-info">
                        <h6>Dimensiones</h6>
                        <div><i class="bi bi-bag-fill"></i> Producto: <span id="producto-${data.id}">${data.Producto}</span></div>
                        <div><i class="bi bi-code-square"></i> SKU: <span id="sku-${data.id}">${data.SKU}</span></div>
                        <div><i class="bi bi-arrows-angle-expand"></i> Medidas: <span id="medidas-${data.id}">${data.medidas}</span></div>
                        <div><i class="bi bi-box-arrow-in-down"></i> Peso: <span id="peso-${data.id}">${data.Peso}</span> kg</div>
                        <div><i class="bi bi-box"></i> Volumen M³: <span id="volumenM3-${data.id}">${data['Volumen M³']}</span> m³</div>
                        <div><i class="bi bi-box"></i> Volumen CM³: <span id="volumenCM3-${data.id}">${data['Volumen CM³']}</span> cm³</div>
                        <div><i class="bi bi-boxes"></i> Cantidad: <span id="cantidad-${data.id}">${data.Cantidad}</span></div>
                    </div>
                    <button class="btn btn-secondary w-100 mt-2 editarDatos" id="editButton-${data.id}" onclick="editarDatos('${data.id}')">Editar datos</button>
                </div>
                <!-- Spinner Button Andesmar -->
                <button class="btn btn-primary btnAndesmarMeli" id="andesmarButton${data.id}" onclick="enviarDatosAndesmar('${data.id}', '${data.NombreyApellido}', '${data.Cp}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${data.Observaciones}', ${data.Peso}, ${data['Volumen M³']}, ${data.Cantidad}, '${data.medidas}', '${data.Producto}')">
                    <span id="andesmarText${data.id}"><i class="bi bi-file-text"></i> Etiqueta Andesmar</span>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data.id}"></span>
                </button>
                <!-- Spinner Button Andreani -->
                <button class="btn btn-danger btnAndreaniMeli" id="andreaniButton${data.id}" onclick="enviarDatosAndreani('${data.id}', '${data.NombreyApellido}', '${data.Cp}', '${data.localidad}', '${data.Provincia}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${data.Email}', '${data.Observaciones}', ${data.Peso}, ${data['Volumen CM³']}, ${data.Cantidad}, '${data.medidas}', '${data.Producto}')">
                    <span id="andreaniText${data.id}"><i class="bi bi-file-text"></i> Etiqueta Andreani</span>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani${data.id}" style="display:none;"></span>
                </button>
                <div id="resultado${data.id}" class="mt-2 errorMeli"></div>
            </div>
        </div>
    `;

        // Lógica del botón de copiar al portapapeles
        const copyButton = cardDiv.querySelector('.copy-btn');
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(data.idOperacion).then(() => {
                copyButton.innerHTML = 'Copiado';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar al portapapeles: ', err);
            });
        });
    
    return cardDiv;
}

// Función para habilitar la edición de los campos
function habilitarEdicion(id) {
    const camposEditables = [
        'calle', 'altura', 'telefono', 'email', 'observaciones',
        'producto', 'sku', 'medidas', 'peso', 'volumenM3', 'volumenCM3', 'cantidad', 'autorizado', 
    ];

    camposEditables.forEach(campo => {
        const span = document.getElementById(`${campo}-${id}`);
        const valorActual = span.textContent;
        span.innerHTML = `<input type="text" class="form-control" value="${valorActual}" id="input-${campo}-${id}">`;
    });
}

// Función para guardar los cambios y actualizar en Firebase
function guardarCambios(id) {
    const camposEditables = [
        'calle', 'altura', 'telefono', 'email', 'observaciones',
        'producto', 'sku', 'medidas', 'peso', 'volumenM3', 'volumenCM3', 'cantidad', 'autorizado',
    ];

    let datosActualizados = {};
    camposEditables.forEach(campo => {
        const input = document.getElementById(`input-${campo}-${id}`);
        if (input) {
            datosActualizados[campo.charAt(0).toUpperCase() + campo.slice(1)] = input.value;
        }
    });

    const ref = database.ref(`envios/${id}`);
    ref.update(datosActualizados)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Datos actualizados',
                text: 'Los datos han sido actualizados correctamente.',
            });

            camposEditables.forEach(campo => {
                const span = document.getElementById(`${campo}-${id}`);
                span.textContent = datosActualizados[campo.charAt(0).toUpperCase() + campo.slice(1)];
            });
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al actualizar los datos.',
            });
            console.error("Error al actualizar los datos: ", error);
        });
}

// Función para alternar entre editar y guardar
function editarDatos(id) {
    const editButton = document.getElementById(`editButton-${id}`);

    if (editButton.textContent.trim() === 'Editar datos') {
        habilitarEdicion(id);
        editButton.textContent = 'Guardar cambios';
        editButton.classList.remove('btn-warning');
        editButton.classList.add('btn-success');
    } else {
        guardarCambios(id);
        editButton.textContent = 'Editar datos';
        editButton.classList.remove('btn-success');
        editButton.classList.add('btn-secondary');
    }
}

// Usar addEventListener para manejar el evento de clic
document.querySelectorAll('.editarDatos').forEach(button => {
    button.addEventListener('click', function() {
        const id = this.id.split('-')[1]; // Extraer el ID del botón
        editarDatos(id);
    });
});

const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

// Función para enviar datos a la API de Andesmar
function enviarDatosAndesmar(id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, medidas, Producto) {
    const button = document.getElementById(`andesmarButton${id}`);
    const spinner = document.getElementById(`spinnerAndesmar${id}`);
    const text = document.getElementById(`andesmarText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';

    // Dividir medidas para obtener alto, ancho y largo
    const [largo, ancho, alto] = medidas.split('x').map(Number);

    // Aquí debes definir los datos que se enviarán a la API
    const requestObj = {
        CalleRemitente: "Mendoza", // Reemplaza con el valor correcto
        CalleNroRemitente: "2799", // Reemplaza con el valor correcto
        CodigoPostalRemitente: "2000", // Reemplaza con el valor correcto
        NombreApellidoDestinatario: NombreyApellido,
        CodigoPostalDestinatario: Cp,
        CalleDestinatario: calleDestinatario,
        CalleNroDestinatario: alturaDestinatario,
        TelefonoDestinatario: telefonoDestinatario,
        NroRemito: idOperacion,
        Bultos: cantidad,
        Peso: peso,
        ValorDeclarado: 100, // Se Reemplazara cuando Leo envie este dato
        M3: volumenM3,
        Alto: Array(cantidad).fill(alto), 
        Ancho: Array(cantidad).fill(ancho), 
        Largo: Array(cantidad).fill(largo), 
        Observaciones: observaciones,
        ModalidadEntrega: "Puerta-Puerta", 
        UnidadVenta: "cargas remito conformado", 
        servicio: {
            EsFletePagoDestino: false, 
            EsRemitoconformado: true 
        },
        logueo: {
            Usuario: usuario,
            Clave: clave,
            CodigoCliente: codigoCliente
        }
    };

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";


    console.log(`Datos enviados a API Andesmar (ME1 ${idOperacion}):`, requestObj); // Mostrar request en consola

    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
        },
        body: JSON.stringify(requestObj),
    })
    .then(response => {
        console.log(`Datos Respuesta API Andesmar (ME1 ${idOperacion}):`, response); // Mostrar response en consola
        return response.json();
    })
    .then(data => {
        if (data.NroPedido) {
            const link = `https://andesmarcargas.com//ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            // Cambiar el texto del botón a "Descargar + NroPedido"
            text.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.onclick = () => window.open(link, '_blank'); // Cambiar la acción del botón para abrir el enlace
            
            // Cambiar el estado del envío
            if (envioState) {
                envioState.className = 'em-circle-state2';
                envioState.innerHTML = `Envio Preparado <i class="bi bi-check2-circle"></i>`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }
        } else {
            text.innerHTML = `No Disponible <i class="bi bi-exclamation-circle-fill"></i>`; 
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        text.innerText = "No Disponible ⚠️"; // Cambiar texto en caso de error
        resultadoDiv.innerText = `Error: ${error.message}`; // Mostrar error debajo
    })
    .finally(() => {
        spinner.style.display = 'none'; // Asegúrate de ocultar el spinner en caso de error
    });
}

// Función para enviar datos a la API de Andreani
const apiUrlLogin = 'https://apis.andreani.com/login';
const apiUrlLabel = 'https://proxy.cors.sh/https://apis.andreani.com/v2/ordenes-de-envio';
const username = 'novogar_gla';
const password = 'JoBOraCDJZC';

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

async function enviarDatosAndreani(id, NombreyApellido, Cp, localidad, Provincia, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, Email, observaciones, peso, volumenCM3, cantidad, medidas, Producto) {
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const spinnerAndr = document.getElementById(`spinnerAndreani${id}`);
    const textAndr = document.getElementById(`andreaniText${id}`);
    const resultadoDivAndr = document.getElementById(`resultado${id}`);
    const envioStateAndr = document.getElementById(`estadoEnvio${id}`);

    // Mostrar spinner y cambiar texto
    spinnerAndr.style.display = 'inline-block';
    textAndr.innerText = 'Generando Etiqueta...';

    // Dividir medidas para obtener alto, ancho y largo
    const [largo, ancho, alto] = medidas.split('x').map(Number);

    const token = await getAuthToken();

    // Obtener el nombre de la provincia y convertirlo a minúsculas
    const provinciaNombre = Provincia.toLowerCase();
    const regionCodigo = regionMap[provinciaNombre] || ""; // Obtener el código de región

    // Inicializar el array de bultos
    const bultos = [];
    const pesoTotal = peso || 0; // Obtener peso total
    const volumenTotal = volumenCM3 || 0; // Obtener volumen total

    for (let i = 0; i < cantidad; i++) {
        bultos.push({
            "kilos": pesoTotal / cantidad,
            "largoCm": null,
            "altoCm": null,
            "anchoCm": null,
            "volumenCm": volumenTotal / cantidad,
            "valorDeclaradoSinImpuestos": 99999 * 0.21,
            "valorDeclaradoConImpuestos": 99999,
            "referencias": [
                { "meta": "detalle", "contenido": Producto },
                { "meta": "idCliente", "contenido": (idOperacion + "-MELI").toUpperCase() },
                { "meta": "observaciones", contenido: observaciones }
            ]
        });
    }

    const requestData = {
        "contrato": volumenCM3 > 100000 ? "351002753" : "400017259",
        "idPedido": (idOperacion + "-MELI").toUpperCase(),
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
                "codigoPostal": Cp,
                "calle": calleDestinatario,
                "numero": alturaDestinatario,
                "localidad": localidad,
                "region": regionCodigo,
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
            "nombreCompleto": NombreyApellido,
            "email": Email,
            "documentoTipo": "CUIT",
            "documentoNumero": "30685437011",
            "telefonos": [{ "tipo": 1, "numero": telefonoDestinatario }]
        }],
        "remito": {
            "numeroRemito": (idOperacion + "-MELI").toUpperCase(),
        },
        "bultos": bultos
    };

    console.log(`Datos enviados a API ANDREANI (ME1 ${idOperacion}):`, requestData);

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

            console.log(`Datos Respuesta API ANDREANI (ME1 ${idOperacion}):`, response);
            // Mostrar el número de envío
            resultadoDivAndr.textContent = `Número de envío: ${numeroDeEnvio}`;

            // Configurar el botón de descarga inicial
            textAndr.innerHTML = `Orden ${numeroDeEnvio}`;
            buttonAndr.classList.remove('btn-danger');
            buttonAndr.classList.add('btn-secondary');
        

            // Cambiar el estado del envío
            if (envioStateAndr) {
                envioStateAndr.className = 'em-circle-state2';
                envioStateAndr.innerHTML = `Envio Preparado <i class="bi bi-check2-circle"></i>`;
            }

            // Llamar a la API para obtener la etiqueta
            await obtenerEtiqueta(numeroDeEnvio, token, buttonAndr);
        } else {
            console.error('Error al generar la etiqueta:', response.statusText);
            buttonAndr.innerText = "Error ⚠️"; 
            resultadoDivAndr.innerText = `Error: ${error.message}`; 
            buttonAndr.disabled = true;
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);
        buttonAndr.innerText = "Error Andreani ⚠️"; 
        buttonAndr.disabled = true;
        resultadoDivAndr.innerText = `Error Andreani: (Puede No existir el CP o Localidad en Andreani) ${error.message}`; 
    }
}

async function obtenerEtiqueta(numeroDeEnvio, token, buttonAndr) {
    const url = `https://proxy.cors.sh/https://apis.andreani.com/v2/ordenes-de-envio/${numeroDeEnvio}/etiquetas`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                "x-authorization-token": token,
                "Accept": "application/pdf"
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP! Status: ${response.status}`);
        }

        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);

        buttonAndr.href = pdfUrl; // Establecer el href del botón
        buttonAndr.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${numeroDeEnvio}`;
        buttonAndr.classList.remove('btn-warning');
        buttonAndr.classList.add('btn-success');
        buttonAndr.onclick = () => window.open(pdfUrl, '_blank');
    } catch (error) {
        console.error('Error al obtener la etiqueta:', error);
        buttonAndr.innerText = "Error en Etiquetado ⚠️"; // Cambiar texto en caso de error
        resultadoDivAndr.innerText = `Error: ${error.message}`; // Mostrar error debajo
        buttonAndr.disabled = true;
    }
}

// Llama a cargarDatos para iniciar el proceso
cargarDatos();


