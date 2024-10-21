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

let allData = []; // Arreglo global para almacenar todos los datos
let currentPage = 1;
const itemsPerPage = 12;
let currentPageGroup = 0; // Grupo de páginas actual

// Función para cargar datos de Firebase
function cargarDatos() {
    const spinner = document.getElementById('spinner');
    const cardsContainer = document.getElementById('meli-cards');
    const paginationContainer = document.getElementById("pagination");

    spinner.style.display = 'block'; 
    cardsContainer.innerHTML = ''; // Limpia el contenedor de cards

    database.ref('envios').once('value')
        .then(snapshot => {
            allData = []; // Reiniciar el arreglo de datos
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
                    pictures: data.pictures,
                    SKU: data.SKU,
                    Telefono: data.Telefono,
                    VolumenCM3: data.VolumenCM3,
                    VolumenM3: data.VolumenM3,
                    idOperacion: data.idOperacion,
                    localidad: data.localidad,
                    medidas: data.medidas,
                    permalink: data.permalink,
                    shippingMode: data.shippingMode,
                    nombreDeUsuario: data.nombreDeUsuario
                });
            });

            // Invertir datos si es necesario
            allData.reverse();

            // Renderizar tarjetas
            renderCards(allData);

            // Ocultar el spinner
            spinner.style.display = 'none';
            updatePagination(allData.length);
        })
        .catch(error => {
            console.error("Error al cargar los datos: ", error);
        });
}

// Función para renderizar las tarjetas según la página actual
function renderCards(data) {
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = ''; // Limpia el contenedor de cards

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach(item => {
        const card = crearCard(item);
        cardsContainer.appendChild(card);
    });
}

// Función para crear una card
function crearCard(data) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4';

    // Verificar si data.pictures existe y es un array
    const filteredPictures = Array.isArray(data.pictures) ? 
        data.pictures.filter(picture => 
            picture.secure_url // Retener imágenes que tengan secure_url
        ) : [];

    // Crear el carrusel
    const carouselId = `carousel-${data.id}`;
    let carouselItems = '';

    filteredPictures.forEach((picture, index) => {
        carouselItems += `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                <img src="${picture.secure_url}" class="d-block mx-auto" alt="Imagen ${index + 1}" style="height: 150px; width: auto; max-width: 100%; object-fit: cover;">
            </div>
        `;
    });

    const carouselHTML = `
        <div id="${carouselId}" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner" style="max-height: 150px; overflow: hidden;">
                ${carouselItems}
            </div>
            <a class="carousel-control-prev" href="#${carouselId}" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Anterior</span>
            </a>
            <a class="carousel-control-next" href="#${carouselId}" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Siguiente</span>
            </a>
        </div>
    `;

    cardDiv.innerHTML = `
        <div class="card position-relative">
            <div class="em-circle-isNotFraud">Seguro</div>
            <div class="em-circle-${data.shippingMode.toLowerCase() === 'me1' ? 'ME1' : 'ME2'}">${data.shippingMode.toUpperCase()}</div>
            <div id="estadoEnvio${data.id}" class="em-circle-state">Envio pendiente</div>
            <div class="card-body-meli">
                <h5 class="card-title-meli"><i class="bi bi-person-bounding-box"></i> ${data.NombreyApellido}</h5>
                <h6 class="user-title-meli">${data.nombreDeUsuario}</h6>
                <div class="meli-box1"> 
                    <p class="card-text cpLocalidad-meli"><i class="fas fa-map-marker-alt"></i> ${data.Cp}, ${data.localidad}, ${data.Provincia}</p>

                    <p class="card-text correo-meli ${cpsAndesmar.includes(Number(data.Cp)) ? 'correo-andesmar' : 'correo-andreani'}">
                    ${cpsAndesmar.includes(Number(data.Cp)) ? 
                      '<img src="Img/andesmar-tini.png" alt="Andesmar" width="20" height="20">' : 
                      '<img src="Img/andreani-tini.png" alt="Andreani" width="20" height="20">'
                    }
                    </p>
                    </div>

                <div class="d-flex align-items-center">

                <p class="remitoCardMeli w-100 card-text mb-0">
                <a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank" style="text-decoration: none; color: inherit;">
                    ${data.idOperacion}
                </a>

                <button class="btn btn-link copy-btn p-1 m-0" style="display: inline-flex; align-items: center;">
                    <i class="bi bi-clipboard ios-icon" style="margin: 0;"></i>
                    </button>

                    <button class="btn btn-link p-1 m-0" style="display: inline-flex; align-items: center;" onclick="window.open('${data.permalink}', '_blank');">
                    <i class="bi bi-shop ios-icon" style="margin: 0;"></i>
                    </button>

                </p>
            
                </div>

                ${carouselHTML}
                <div class="macos-style">
                Producto: X ${data.Cantidad} ${data.SKU}
                </div>
                
                <button class="btn btn-outline-secondary w-100 collapps-envio-meli" data-bs-toggle="collapse" data-bs-target="#collapseDetails${data.id}" aria-expanded="false" aria-controls="collapseDetails${data.id}">
                    <i class="bi bi-chevron-down"></i> Ver más detalles
                </button>
                <div class="collapse" id="collapseDetails${data.id}">
                    <p class="numeroDeEnvioGenerado" id="numeroDeEnvioGenerado${data.id}">Número de Envío Pendiente</p>
                    <div class="little-card-meli">
                        <p>
                            <i class="fas fa-map-marker-alt ios-icon"></i> 
                            <span id="localidadDeEnvio-${data.id}">${data.Cp}, ${data.localidad}, ${data.Provincia}</span>
                            <button class="btn btn-link btn-sm" onclick="editarLocalidad('${data.id}')"><i class="bi bi-pencil-square ios-icon"></i></button>
                            <button id="btnBorrar-${data.id}" class="btn btn-outline-danger btn-sm" style="display: none;" onclick="borrarLocalidad('${data.id}')">Borrar localidad <i class="bi bi-x-circle"></i></button>
                        </p>
                        <div id="inputLocalidad-${data.id}" style="display:none;">
                            <input type="text" id="localidadInput-${data.id}" 
                                   placeholder="Buscar localidad" 
                                   oninput="buscarLocalidades('${data.id}', this.value)" 
                                   class="form-control"/>
                            <div id="sugerencias-${data.id}" class="sugerencias" style="display: none;"></div>
                        </div>
                        <p><i class="fas fa-home ios-icon"></i> Calle: <span id="calle-${data.id}">${data.Calle}</span></p>
                        <p><i class="bi bi-123 ios-icon"></i> Altura: <span id="altura-${data.id}">${data.Altura}</span></p>
                        <p><i class="fas fa-phone ios-icon"></i> Telefono: <span id="telefono-${data.id}">${data.Telefono}</span></p>
                        <p><i class="bi bi-envelope-at-fill ios-icon"></i> Email: <span id="email-${data.id}" style="text-transform: lowercase;">${data.Email !== undefined ? data.Email : 'webnovogar@gmail.com'}</span></p>
                        <p><i class="bi bi-info-circle-fill ios-icon"></i> Autorizado: <span id="autorizado-${data.id}">${data.Recibe}</span></p>
                        <p><i class="bi bi-sticky-fill ios-icon"></i> Observaciones: <span id="observaciones-${data.id}">${data.Observaciones}</span></p>
                    </div>
                    <div class="dimensions-info">
                    <h6>Dimensiones</h6>
                    <div style="border-top: 1px solid #ccc; padding-top: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
                        <i class="bi bi-bag-fill"></i> 
                        <strong style="color: #007bff;">Producto:</strong> 
                        <span id="producto-${data.id}">${data.Producto}</span>
                    </div>
                    <div><i class="bi bi-code-square"></i> <strong>SKU: </strong><span id="sku-${data.id}" style="color: #007bff;">${data.SKU}</span></div>
                    <div><i class="bi bi-arrows-angle-expand"></i> Medidas: <span id="medidas-${data.id}">${data.medidas}</span></div>
                    <div><i class="bi bi-box-arrow-in-down"></i> Peso: <span id="peso-${data.id}">${Math.round(data.Peso / 1000)}</span> kg</div>
                    <div><i class="bi bi-box"></i> Volumen M³: <span id="volumenM3-${data.id}">${data.VolumenM3}</span> m³</div>
                    <div><i class="bi bi-box"></i> Volumen CM³: <span id="volumenCM3-${data.id}">${data.VolumenCM3}</span> cm³</div>
                    <div><i class="bi bi-boxes"></i> Cantidad: <span id="cantidad-${data.id}">${data.Cantidad}</span></div>
                </div>

                    <button class="btn btn-secondary w-100 mt-2 editarDatos" id="editButton-${data.id}" onclick="editarDatos('${data.id}')">Editar datos</button>
                </div>
                <button class="btn btn-primary btnAndesmarMeli" id="andesmarButton${data.id}" onclick="enviarDatosAndesmar('${data.id}', '${data.NombreyApellido}', '${data.Cp}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${data.Observaciones}', ${Math.round(data.Peso / 1000)}, ${data.VolumenM3}, ${data.Cantidad}, '${data.medidas}', '${data.Producto}', '${data.localidad}', '${data.Provincia}')">
                    <span id="andesmarText${data.id}"><i class="bi bi-file-text"></i> Etiqueta Andesmar</span>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data.id}"></span>
                </button>
                <button class="btn btn-danger btnAndreaniMeli" id="andreaniButton${data.id}" onclick="enviarDatosAndreani('${data.id}', '${data.NombreyApellido}', '${data.Cp}', '${data.localidad}', '${data.Provincia}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${data.Email}', '${data.Observaciones}', ${Math.round(data.Peso / 1000)}, ${data.VolumenCM3}, ${data.Cantidad}, '${data.medidas}', '${data.Producto}')">
                    <span id="andreaniText${data.id}"><i class="bi bi-file-text"></i> Etiqueta Andreani</span>
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani${data.id}" style="display:none;"></span>
                </button>
                <div id="resultado${data.id}" class="mt-2 errorMeli"></div>
            </div>

            <button class="btn btn-link lock-btn p-1 m-0" style="display: inline-flex; align-items: center;">
            <span class="material-symbols-outlined">lock_open</span>
            </button>
            
        </div>
    `;

    // Lógica del botón de copiar al portapapeles
const copyButton = cardDiv.querySelector('.copy-btn');
copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(data.idOperacion).then(() => {
        const icon = copyButton.querySelector('i');
        icon.classList.remove('bi-clipboard'); // Remueve el ícono de clipboard original
        icon.classList.add('bi-clipboard-check-fill'); // Añade el ícono de clipboard con check
        setTimeout(() => {
            icon.classList.remove('bi-clipboard-check-fill'); // Remueve el ícono de check
            icon.classList.add('bi-clipboard'); // Vuelve a añadir el ícono de clipboard
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
            let valor = input.value;
            // Multiplicar el peso por 1000 si el campo es 'peso'
            if (campo === 'peso') {
                valor = Number(valor) * 1000; // Asegúrate de convertir a número
            }
            datosActualizados[campo.charAt(0).toUpperCase() + campo.slice(1)] = valor;
        }
    });

    const ref = database.ref(`envios/${id}`);
    ref.update(datosActualizados)
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Datos actualizados',
                text: 'Los datos han sido actualizados correctamente.',
            }).then(() => {
                location.reload();
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

// Configuración del segundo proyecto de Firebase
const firebaseConfig2 = {
    apiKey: "AIzaSyBIXlgOct2UzkrZbZYbyHu6_NbLDzTqqig",
    authDomain: "despachos-novogar.firebaseapp.com",
    databaseURL: "https://despachos-novogar-default-rtdb.firebaseio.com",
    projectId: "despachos-novogar",
    storageBucket: "despachos-novogar.appspot.com",
    messagingSenderId: "346020771441",
    appId: "1:346020771441:web:c4a29c0db4200352080dd0",
    measurementId: "G-64DDP7D6Q2"
};

// Inicializa el segundo proyecto
const app2 = firebase.initializeApp(firebaseConfig2, "app2");
const database2 = app2.database();

// Función para enviar datos a la API de Andesmar
async function enviarDatosAndesmar(id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, Medidas, Producto, localidad, provincia) {
    const button = document.getElementById(`andesmarButton${id}`);
    const spinner = document.getElementById(`spinnerAndesmar${id}`);
    const text = document.getElementById(`andesmarText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';

    buttonAndr.disabled = true;

    // Dividir medidas para obtener alto, ancho y largo
    const [largo, ancho, alto] = Medidas.split('x').map(Number);

    // Convertir Producto a minúsculas para la verificación
    const productoLowerCase = Producto.toLowerCase();

    // Verificar si Producto incluye un split
    const cantidadFinal = productoLowerCase.includes("split") ? cantidad * 2 : cantidad;

    // Definir los datos que se enviarán a la API
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
        Bultos: cantidadFinal,
        Peso: peso,
        ValorDeclarado: 100,
        M3: volumenM3,
        Alto: Array(cantidadFinal).fill(alto),
        Ancho: Array(cantidadFinal).fill(ancho),
        Largo: Array(cantidadFinal).fill(largo),
        Observaciones: observaciones + Producto,
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

    console.log(`Datos enviados a API Andesmar (MELI ${idOperacion}):`, requestObj);

    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
        },
        body: JSON.stringify(requestObj),
    })
    .then(async response => {
        const data = await response.json();
        console.log(`Datos Respuesta API Andesmar (MELI ${idOperacion}):`, data);
        
        if (data.NroPedido) {

            const trackingLinkAndesmar = `https://andesmarcargas.com/seguimiento.html?numero=${idOperacion}&tipo=remito&cod=`; // Corregido aquí

            // Guardar en Firebase
            const trackingMessage = `¡Hola ${NombreyApellido}! 🎉
            
            ¡Buenas noticias! Tu producto ya está listo para ser enviado por Andesmar Cargas. Recuerda que la fecha de entrega es estimativa, así que podrías recibirlo un poco antes o después. Mantente atento a tu teléfono por si te contactan.
            
            Si notas algún daño en el paquete, recházalo para que podamos reenviarlo.
            
            Tu número de seguimiento es: ${trackingLinkAndesmar}.
            
            ¡Saludos!`;
            
            const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');
            
            firebase.database().ref('envios/' + idOperacionSinME1).update({
                trackingNumber: idOperacion,
                trackingLink: trackingLinkAndesmar,
                trackingMessage: trackingMessage
            }).then(() => {
                console.log(`Datos actualizados en Firebase para la operación: ${idOperacion}`);
            }).catch(error => {
                console.error('Error al actualizar en Firebase:', error);
            });
            
            // Usar la base de datos del segundo proyecto
            const nuevaEntradaRef = database2.ref('enviosAndesmar').push();

            const cotizacionRequest = {
                CodigoPostalRemitente: "2000",
                CodigoPostalDestinatario: Cp,
                Bultos: cantidadFinal,
                Peso: peso,
                ValorDeclarado: 100,
                M3: volumenM3,
                Alto: Array(cantidadFinal).fill(alto),
                Ancho: Array(cantidadFinal).fill(ancho),
                Largo: Array(cantidadFinal).fill(largo),
                ModalidadEntregaID: 2,
                servicio: {
                    EsFletePagoDestino: false,
                    EsRemitoconformado: true
                },
                logueo: {
                    Usuario: usuario,
                    Clave: clave,
                    CodigoCliente: codigoCliente
                },
                CodigoAgrupacion: 12
            };

            const cotizacionResponse = await fetch(proxyUrl + "https://apitest.andesmarcargas.com/api/CalcularMonto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
                },
                body: JSON.stringify(cotizacionRequest),
            });

            const cotizacionData = await cotizacionResponse.json();

            // Formatear el importe total
            const importeTotalFormateado = new Intl.NumberFormat('es-AR', {         
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(cotizacionData.ImporteTotal);

            // Almacenar en Firebase
            await nuevaEntradaRef.set({         
            nombreApellido: NombreyApellido,
            nroPedido: data.NroPedido,
            codigoPostal: Cp,
            localidad: `${localidad}, ${provincia}`,
            calleDelDestinatario: calleDestinatario,
            numeroDeCalle: alturaDestinatario,
            telefono: telefonoDestinatario,
            remito: idOperacion,
            cotizacion: importeTotalFormateado // Usar el importe formateado
            }).then(() => {         
                console.log("Entrada agregada correctamente.");
            }).catch((error) => {
                console.error("Error al agregar entrada a Firebase:", error);
            });

            const link = `https://andesmarcargas.com//ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            text.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.onclick = () => window.open(link, '_blank'); 
            NroEnvio.innerHTML = `<a href="https://andesmarcargas.com/seguimiento.html?numero=${idOperacion}&tipo=remito&cod=" target="_blank">Andesmar: ${idOperacion} <i class="bi bi-box-arrow-up-right"></i></a>`;
            spinner.style.display = 'none';
            if (envioState) {
                envioState.className = 'em-circle-state2';
                envioState.innerHTML = `Envio Preparado`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }
        } else {
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
            buttonAndr.disabled = false;
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        text.innerHTML = `Error en el envío <i class="bi bi-exclamation-circle-fill"></i>`;
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
        buttonAndr.disabled = false;
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
    const button = document.getElementById(`andesmarButton${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);

    // Mostrar spinner y cambiar texto
    spinnerAndr.style.display = 'inline-block';
    textAndr.innerText = 'Generando Etiqueta...';

    button.disabled = true;

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

// Convertir Producto a minúsculas para la verificación
const productoLowerCase = Producto.toLowerCase();

// Determinar la cantidad a usar
const cantidadFinal = productoLowerCase.includes("split") ? cantidad * 2 : cantidad;

for (let i = 0; i < cantidadFinal; i++) {
    bultos.push({
        "kilos": pesoTotal,
        "largoCm": null,
        "altoCm": null,
        "anchoCm": null,
        "volumenCm": volumenTotal,
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

    console.log(`Datos enviados a API ANDREANI (MELI ${idOperacion}):`, requestData);

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

            console.log(`Datos Respuesta API ANDREANI (MELI ${idOperacion}):`, response);
            // Mostrar el número de envío
            NroEnvio.innerHTML = `<a href="https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${numeroDeEnvio}" target="_blank">Andreani: ${numeroDeEnvio} <i class="bi bi-box-arrow-up-right"></i></a>`;
            const trackingLink = `andreani.com/#!/informacionEnvio/${numeroDeEnvio}`

            // Configurar el botón de descarga inicial
            textAndr.innerHTML = `Orden ${numeroDeEnvio}`;
            buttonAndr.classList.remove('btn-danger');
            buttonAndr.classList.add('btn-secondary');
        

            // Cambiar el estado del envío
            if (envioStateAndr) {
                envioStateAndr.className = 'em-circle-state2';
                envioStateAndr.innerHTML = `Envio Preparado`;
            }

            // Guardar en Firebase
    const trackingMessage = `¡Hola ${NombreyApellido}! 🎉

    ¡Buenas noticias! Tu producto ya está listo para ser enviado por Correo Andreani. Recuerda que la fecha de entrega es estimativa, así que podrías recibirlo un poco antes o después. Mantente atento a tu teléfono por si te contactan.
    
    Si notas algún daño en el paquete, recházalo para que podamos reenviarlo.
    
    Tu número de seguimiento es: ${trackingLink}.
    
    ¡Saludos!`;

        const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');
    
        firebase.database().ref('envios/' + idOperacionSinME1).update({
            trackingNumber: numeroDeEnvio,
            trackingLink: trackingLink,
            trackingMessage: trackingMessage
        }).then(() => {
            console.log(`Datos actualizados en Firebase para la operación: ${idOperacion}`);
        }).catch(error => {
            console.error('Error al actualizar en Firebase:', error);
        });    

            // Llamar a la API para obtener la etiqueta
            await obtenerEtiqueta(numeroDeEnvio, token, buttonAndr);
        } else {
            console.error('Error al generar la etiqueta:', response.statusText);
            buttonAndr.innerText = "Error ⚠️"; 
            resultadoDivAndr.innerText = `Error: ${error.message}`; 
            button.disabled = false;
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);
        buttonAndr.innerText = "Error Andreani ⚠️"; 
        button.disabled = false;
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

// Función para actualizar la paginación
function updatePagination(totalItems) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let startPage = currentPageGroup + 1;
    let endPage = Math.min(currentPageGroup + 6, totalPages);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            renderCards(allData);
            updatePagination(totalItems);
        });
        paginationContainer.appendChild(pageItem);
    }

    // Mostrar "Más" si hay más páginas
    if (endPage < totalPages) {
        const loadMoreItem = document.createElement("li");
        loadMoreItem.className = "page-item";
        loadMoreItem.innerHTML = `<a class="page-link" href="#">Más</a>`;
        loadMoreItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPageGroup += 6;
            renderCards(allData);
            updatePagination(allData.length);
        });
        paginationContainer.appendChild(loadMoreItem);
    }

    // Mostrar "Atrás" si no estamos en el primer grupo
    if (currentPageGroup > 0) {
        const backItem = document.createElement("li");
        backItem.className = "page-item";
        backItem.innerHTML = `<a class="page-link" href="#">Atrás</a>`;
        backItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPageGroup -= 6;
            renderCards(allData);
            updatePagination(allData.length);
        });
        paginationContainer.appendChild(backItem);
    }
}

const cpsAndesmar = [
    ...Array.from({length: 501}, (_, i) => i + 1000), // Del 1000 al 1500
    1602, 1603, 1605, 1606, 1607, 1609,
    1611, 1612, 1613, 1614, 1615, 1617,
    1618, 1619, 1620, 1621, 1623, 1625,
    1627, 1629, 1631, 1633, 1635, 1636,
    1638, 1640, 1641, 1642, 1643, 1644,
    1646, 1648, 1650, 1651, 1653, 1655,
    1657, 1659, 1661, 1663, 1664, 1665,
    1667, 1669, 1671, 1672, 1674, 1676,
    1678, 1682, 1684, 1686, 1688, 1702,
    1704, 1706, 1708, 1712, 1713, 1714,
    1716, 1718, 1722, 1723, 1742, 1744,
    1746, 1752, 1754, 1755, 1757, 1759,
    1763, 1765, 1766, 1768, 1770, 1771,
    1772, 1773, 1774, 1776, 1778, 1802,
    1804, 1805, 1806, 1812, 1822, 1824,
    1825, 1826, 1828, 1832, 1834, 1835,
    1836, 1838, 1842, 1846, 1852, 1854,
    1856, 1870, 1871, 1872, 1874, 1875,
    1876, 1878, 1879, 1882, 1884, 1886,
    1888, 1890, 1891, 1894, 1895, 1896,
    1897, 1900, 1901, 1923, 1925, 8000,
    4700, 2400, 2415, 2419, 2424, 2434,
    2566, 2568, 2587, 2594, 2624, 2657,
    2677, 2681, 5000, 5001, 5002, 5003,
    5004, 5005, 5006, 5007, 5008, 5009,
    5010, 5011, 5012, 5013, 5014, 5015,
    5016, 5017, 5021, 5022, 5023, 5101,
    5103, 5105, 5107, 5109, 5111, 5113,
    5123, 5125, 5127, 5145, 5147, 5166,
    5168, 5172, 5174, 5176, 5182, 5184,
    5186, 5194, 5220, 5223, 5236, 5280,
    5800, 5817, 5841, 5850, 5870, 5881,
    5883, 6216, 6277, 6279, 6389, 9011,
    9400, 4000, 4101, 4103, 4105, 4107,
    4109, 4111, 4117, 4128, 4129, 4132,
    4142, 4144, 4152, 4153, 4158, 4166,
    4168, 4178
];

// Llama a cargarDatos para iniciar el proceso
cargarDatos();


