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
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                const card = crearCard(data);
                cardsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error al cargar los datos: ", error);
        })
        .finally(() => {
            spinner.style.display = 'none';
        });
}

// Función para crear una card
function crearCard(data) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4';

    cardDiv.innerHTML = `
        <div class="card position-relative">
            <div class="em-circle">ME1</div>
            <div class="em-circle-isFraud">Fraude</div>
            <div id="estadoEnvio${data.idOperacion}ME1" class="em-circle-state">Envio pendiente</div>
            <div class="card-body">
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
                <button class="btn btn-outline-secondary w-100 collapps-envio-meli" data-bs-toggle="collapse" data-bs-target="#collapseDetails${data.idOperacion}" aria-expanded="false" aria-controls="collapseDetails${data.idOperacion}">
                    <i class="bi bi-chevron-down"></i> Ver más detalles
                </button>
                <div class="collapse" id="collapseDetails${data.idOperacion}">
                    <div class="little-card-meli">
                        <p><i class="fas fa-home"></i> Calle: ${data.Calle}</p>
                        <p><i class="bi bi-123"></i> Altura: ${data.Altura}</p>
                        <p><i class="fas fa-phone"></i> Telefono: ${data.Telefono}</p>
                        <p><i class="bi bi-envelope-at-fill"></i> Email: ${data.Email}</p>
                        <p><i class="bi bi-sticky-fill"></i> Observaciones: ${data.Observaciones}</p>
                    </div>
                    <div class="dimensions-info">
                        <h6>Dimensiones</h6>
                        <div><i class="bi bi-bag-fill"></i> Producto: ${data.Producto}</div>
                        <div><i class="bi bi-code-square"></i> SKU: ${data.SKU} </div>
                        <div><i class="bi bi-arrows-angle-expand"></i> Medidas: ${data.medidas}</div>
                        <div><i class="bi bi-box-arrow-in-down"></i> Peso: ${data.Peso} kg</div>
                        <div><i class="bi bi-box"></i> Volumen M³: ${data['Volumen M³']} m³</div>
                        <div><i class="bi bi-box"></i> Volumen CM³: ${data['Volumen CM³']} cm³</div>
                        <div><i class="bi bi-boxes"></i> Cantidad: ${data.Cantidad}</div>
                    </div>
                </div>
                <button class="btn btn-primary" id="andesmarButton${data.idOperacion}ME1" onclick="enviarDatos('${data.NombreyApellido}', '${data.Cp}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${data.Observaciones}', ${data.Peso}, ${data['Volumen M³']}, ${data.Cantidad}, '${data.medidas}')">
                    <span id="andesmarText${data.idOperacion}ME1"><i class="bi bi-file-text"></i> Etiqueta Andesmar</span>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinner${data.idOperacion}ME1"></span>
                </button>
                <div id="resultado${data.idOperacion}ME1" class="mt-2"></div>
            </div>
        </div>
    `;
    return cardDiv;
}

const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

// Función para enviar datos a la API de Andesmar
function enviarDatos(NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, medidas) {
    const button = document.getElementById(`andesmarButton${idOperacion}`);
    const spinner = document.getElementById(`spinner${idOperacion}`);
    const text = document.getElementById(`andesmarText${idOperacion}`);
    const resultadoDiv = document.getElementById(`resultado${idOperacion}`);
    const envioState = document.getElementById(`estadoEnvio${idOperacion}`);

    console.log(envioState); // Verificar si el elemento existe

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando...';

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
        ValorDeclarado: 100, // Reemplaza con el valor correcto
        M3: volumenM3,
        Alto: Array(cantidad).fill(alto), // Crear un array con el alto repetido
        Ancho: Array(cantidad).fill(ancho), // Crear un array con el ancho repetido
        Largo: Array(cantidad).fill(largo), // Crear un array con el largo repetido
        Observaciones: observaciones,
        ModalidadEntrega: "Puerta-Puerta", // Reemplaza con el valor correcto
        UnidadVenta: "cargas remito conformado", // Reemplaza con el valor correcto
        servicio: {
            EsFletePagoDestino: false, // Reemplaza con el valor correcto
            EsRemitoconformado: true // Reemplaza con el valor correcto
        },
        logueo: {
            Usuario: usuario,
            Clave: clave,
            CodigoCliente: codigoCliente
        }
    };

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";

    console.log("Request a la API:", requestObj); // Mostrar request en consola

    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
        },
        body: JSON.stringify(requestObj),
    })
    .then(response => {
        console.log("Response de la API:", response); // Mostrar response en consola
        return response.json();
    })
    .then(data => {
        if (data.NroPedido) {
            const link = `https://andesmarcargas.com//ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            // Cambiar el texto del botón a "Descargar + NroPedido"
            text.innerHTML = `<i class="bi bi-file-earmark-arrow-down"></i> Descargar ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.onclick = () => window.open(link, '_blank'); // Cambiar la acción del botón para abrir el enlace
            
            // Cambiar el estado del envío
            if (envioState) {
                envioState.className = 'em-circle-state2';
                envioState.innerHTML = `Envio Preparado <i class="bi bi-check2-circle"></i>`;
            } else {
                console.error(`El elemento con id estadoEnvio${idOperacion} no se encontró.`);
            }
        } else {
            text.innerHTML = `No Disponible <i class="bi bi-exclamation-circle-fill"></i>`; 
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning');
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

// Llama a cargarDatos para iniciar el proceso
cargarDatos();
