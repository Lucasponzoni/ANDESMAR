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

const obtenerCredencialesCDS = async () => {
    try {
        const snapshot = await window.dbCDS.ref('LogiPaq').once('value');
        const data = snapshot.val();
        idCDS = data[3];
        usuarioCDS = data[4];
        passCDS = data[5];
        HookTv = data[14];
        HookMd = data[10];
        live = data[7];
        corsh = data[6];
        token = data[11];
        channel = data[8];
        chat = data[15];
        brainsysUser = data[16];
        brainsysPass = data[17];
        brainsysPoint = data[18];
        console.log(`Credentials OK`);
    } catch (error) {
        console.error('Error al obtener cred de Fire:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerCredencialesCDS();
    await obtenerSesionBrainsys();
  });

function clickPageOne() {
    const pagination = document.getElementById('pagination');
    
    const pageOneLink = pagination.querySelector('li.page-item:nth-child(1) a'); 

    if (pageOneLink) {
        pageOneLink.click(); 
        console.log("Clic en la página 1 realizado.");
    } else {
        console.error("No se encontró el enlace de la página 1.");
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchMercadoLibre');
    const spinner = document.getElementById('spinner');
    const cardsContainer = document.getElementById('meli-cards');
    const pagination = document.getElementById('pagination');

    searchInput.addEventListener('click', function() {
        searchInput.value = '';
        clickPageOne();
    });

    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();

        if (query.length >= 9) {
            const queryNumber = Number(query);
            spinner.style.display = 'block';
            cardsContainer.innerHTML = '';
            pagination.style.display = 'none'; 

            if (!isNaN(queryNumber)) {
                console.log(`Buscando datos para el número: ${queryNumber}`);
                const queryPromises = [
                    database.ref('envios')
                        .orderByChild('idOperacion')
                        .equalTo(queryNumber)
                        .limitToLast(50000)
                        .once('value'),
                    database.ref('envios')
                        .orderByChild('packId')
                        .equalTo(queryNumber)
                        .limitToLast(50000)
                        .once('value')
                ];
            
                Promise.all(queryPromises)
                    .then(results => {
                        const allData = {};
                        results.forEach(snapshot => {
                            if (snapshot.exists()) {
                                Object.assign(allData, snapshot.val());
                            }
                        });
            
                        if (Object.keys(allData).length > 0) {
                            console.log("Datos encontrados: ", allData);
                            const processedData = Object.values(allData).map(data => {
                                const paymentData = Array.isArray(data.payments) && data.payments.length > 0 ? data.payments[0] : {};
                                const id = data.idOperacion; 
                                return {
                                    id: id,
                                    idOperacion: id,
                                    Altura: data.Altura,
                                    Calle: data.Calle,
                                    Cantidad: data.Cantidad,
                                    Correosugerido: data.Correosugerido,
                                    Cp: data.Cp,
                                    Email: data.email,
                                    NombreyApellido: data.NombreyApellido ? data.NombreyApellido.toLowerCase() : "sin nombre",
                                    Observaciones: data.Observaciones,
                                    Peso: data.Peso,
                                    Producto: data.Producto,
                                    Provincia: data.Provincia ? data.Provincia.toLowerCase() : "sin provincia",
                                    Recibe: data.Recibe,
                                    pictures: data.pictures,
                                    SKU: data.SKU,
                                    paqid: data.packId,
                                    diasPlaceIt: data.diasPlaceIt,
                                    cliente: data.cliente,
                                    Telefono: data.Telefono,
                                    VolumenCM3: data.VolumenCM3,
                                    VolumenM3: data.VolumenM3,
                                    localidad: data.localidad ? data.localidad.toLowerCase() : "sin localidad",
                                    medidas: data.medidas,
                                    permalink: data.permalink,
                                    shippingMode: data.shippingMode,
                                    nombreDeUsuario: data.nombreDeUsuario,
                                    transportCompany: data.transportCompany,
                                    trackingNumber: data.trackingNumber,
                                    trackingLink: data.trackingLink,
                                    estadoFacturacion: data.estadoFacturacion,
                                    andesmarId: data.andesmarId,
                                    shippingId: data.shippingId,
                                    cotizacion: data.cotizacionCDS,
                                    installment_amount: paymentData.installment_amount || 0,
                                    payment_method_id: paymentData.payment_method_id || 0,
                                    transactionAmount: paymentData.transaction_amount || 0,
                                    installments: paymentData.installments || 0,
                                    paymentType: paymentData.payment_type || ''
                                };
                            });

                            renderCards(processedData);
                        } else {
                            console.log("No se encontraron datos para la consulta.");
                            cardsContainer.innerHTML = `
                                <div class="d-flex flex-column align-items-center justify-content-center text-center w-100">
                                    <p class="errorp">No se encontraron resultados para "${query}" en el servidor</p>
                                    <img src="./Img/error.gif" alt="No se encontraron resultados" class="error img-fluid mb-3">
                                </div>
                            `;
                        }

                        spinner.style.display = 'none';
                    })
                    .catch(error => {
                        console.error("Error al buscar los datos: ", error);
                        spinner.style.display = 'none';
                    });
            } else {
                console.error("La entrada no es un número válido.");
                spinner.style.display = 'none';
            }
        } else if (query.length === 0) {
            console.log("Entrada vacía, cargando la página 1.");
            clickPageOne();
        }
    });
});
// FIN QUERY DE DATOS

// Inicializa el segundo proyecto
const app2 = firebase.initializeApp(firebaseConfig2, "app2");
const database2 = app2.database();

let allData = []; // Arreglo global para almacenar todos los datos
let currentPage = 1;
const itemsPerPage = 12;
let currentPageGroup = 0; // Grupo de páginas actual

const searchInput = document.getElementById('searchMercadoLibre');

// Deshabilitar el buscador al inicio
searchInput.disabled = true;
searchInput.value = "Aguardando que cargue la web ⏳";

// Función para cargar datos de Firebase
function cargarDatos() {
    const spinner = document.getElementById('spinner');
    const cardsContainer = document.getElementById('meli-cards');
    const paginationContainer = document.getElementById("pagination");

    spinner.style.display = 'block'; 
    cardsContainer.innerHTML = ''; // Limpia el contenedor de cards

    database.ref('envios')
        .orderByKey()
        .limitToLast(itemsPerPage)
        .once('value')
        .then(snapshot => {
            allData = []; // Reiniciar el arreglo de datos
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                allData.push({ 
                    id: data.idOperacion, 
                    Altura: data.Altura,
                    Calle: data.Calle,
                    Cantidad: data.Cantidad,
                    Correosugerido: data.Correosugerido,
                    Cp: data.Cp,
                    Email: data.email,
                    NombreyApellido: data.NombreyApellido.toLowerCase(),
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
                    paqid: data.packId,
                    diasPlaceIt: data.diasPlaceIt,
                    cliente: data.cliente,
                    permalink: data.permalink,
                    shippingMode: data.shippingMode,
                    nombreDeUsuario: data.nombreDeUsuario,
                    transportCompany: data.transportCompany,
                    trackingNumber: data.trackingNumber,
                    trackingLink: data.trackingLink,
                    estadoFacturacion: data.estadoFacturacion,
                    andesmarId: data.andesmarId,
                    shippingId: data.shippingId,
                    cotizacion: data.cotizacionCDS,
                    installment_amount: data.payments?.[0]?.installment_amount || 0,
                    payment_method_id: data.payments?.[0]?.payment_method_id || 0,
                    transactionAmount: data.payments?.[0]?.transaction_amount || 0,
                    installments: data.payments?.[0]?.installments || 0,
                    paymentType: data.payments?.[0]?.payment_type || ''
                });
            });

            // Invertir datos si es necesario
            allData.reverse();

            // Renderizar tarjetas
            renderCards(allData);

            // Ocultar el spinner
            pagination.style.display = 'none'; 
            spinner.style.display = 'none';
            searchInput.disabled = false;
            searchInput.value = "";
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

// Desbloquear Logisticas
function desbloquearLogisticas(idOperacion) {
    Swal.fire({
        title: 'Ingrese la contraseña para desbloquear',
        input: 'password',
        inputLabel: 'Contraseña',
        inputPlaceholder: 'Ingrese la contraseña',
        inputAttributes: {
            maxlength: 10,
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Desbloquear',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed && result.value === '37892345') {
            document.getElementById(`andesmarButton${idOperacion}`).removeAttribute('disabled');
            document.getElementById(`andreaniButton${idOperacion}`).removeAttribute('disabled');
            const unlockButton = document.getElementById(`unlockLogisticsButton${idOperacion}`);
            unlockButton.classList.remove('btn-warning');
            unlockButton.classList.add('btn-secondary');
            unlockButton.setAttribute('disabled', 'true');
            Swal.fire('Desbloqueado', 'Las logísticas han sido desbloqueadas.', 'success');
        } else {
            Swal.fire('Error', 'Contraseña incorrecta.', 'error');
        }
    });
}
// Fin Desbloquear Logisticas

// CREAR UN CARD
function crearCard(data) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4';

    // Verificar si transportCompany
    const isCDS = data.transportCompany === "Cruz del Sur";
    const isAndesmar = data.transportCompany === "Andesmar";
    const isAndreani = data.transportCompany === "Andreani"
    const isLogPropia = data.transportCompany === "Novogar"
    const isLogPlaceIt = data.transportCompany === "PlaceIt"
    const isBlocked = data.estadoFacturacion === "bloqueado"
    // Definir Email con valor por defecto
    const email = data.Email || data.email || 'webnovogar@gmail.com';

    // Sanitizar el campo Observaciones antes de pasarlo
    const observacionesSanitizadas = data.Observaciones ? data.Observaciones.replace(/[^a-zA-Z0-9 ]/g, '') : '';

    function limpiarNombreApellido(nombreApellido) {
        // Eliminar caracteres no alfabéticos y espacios extra
        return nombreApellido.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, ' ');
    } 
    
    function limpiarProducto(Producto) {
        // Eliminar caracteres no alfabéticos y espacios extra
        return Producto.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, ' ');
    }   

    function limpiarComentarios(observaciones) {
        return observaciones
            .replace(/[\n\r]/g, ' ') 
            .replace(/[.,\/:;!@#$%^&*()_+|~=`{}\[\]<>?]/g, '') 
            .replace(/'/g, "\\'") 
            .replace(/"/g, '') 
            .replace(/\s+/g, ' ') 
            .trim(); 
    }         

    // Función para formatear números en pesos
    function formatCurrency(amount) {
    return `$ ${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const payment = data.payments?.[0] || {};

let paymentMethodImage = '';
let paymentDetails = '';

switch (data.payment_method_id) {
    case 'consumer_credits':
        paymentMethodImage = './Img/mercadocredito.png';
        paymentDetails = '<strong>Crédito sin tarjeta</strong>';
        break;
    case 'account_money':
        paymentMethodImage = './Img/mercadopago.png';
        paymentDetails = '<strong>Dinero en Cuenta</strong>';
        break;
    case 'visa':
    case 'debvisa':
        paymentMethodImage = './Img/visa.png';
        break;
    case 'master':
    case 'debmaster':
        paymentMethodImage = './Img/master.png';
        break;
    case 'amex':
        paymentMethodImage = './Img/amex.png';
        break;
    case 'naranja':
        paymentMethodImage = './Img/naranja.png';
        break;
    case 'cabal':
    case 'debcabal':
        paymentMethodImage = './Img/cabal.png';
        break;
    case 'pagofacil':
        paymentMethodImage = './Img/pagofacil.png';
        paymentDetails = '<strong>PagoFacil Ticket</strong>';
        break;
    case 'rapipago':
        paymentMethodImage = './Img/rapipago.png';
        paymentDetails = '<strong>RapiPago Ticket</strong>';
        break;
}

if (data.payment_method_id !== 'consumer_credits' && data.payment_method_id !== 'account_money' && data.payment_method_id !== 'pagofacil' && data.payment_method_id !== 'rapipago') {
    const paymentType = data.paymentType === 'credit_card' ? '<strong>Crédito</strong>' : data.paymentType === 'debit_card' ? '<strong>Débito</strong>' : payment.paymentType;
    paymentDetails = `${paymentType} en ${data.installments} cuota/s de ${formatCurrency(data.installment_amount)}`;
}

const paymentHTML = `
    <div class="payment-cell">
        <img src="${paymentMethodImage}" alt="${payment.payment_method_id}">
        <span class="payment-details">${paymentDetails}</span>
    </div>
`;

    // Verificar si data.pictures existe y es un array
    const filteredPictures = Array.isArray(data.pictures) ? 
        data.pictures.filter(picture => 
            picture.secure_url // Retener imágenes que tengan secure_url
        ) : [];

    // Crear el carrusel
    const carouselId = `carousel-${data.idOperacion}`;
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

            <div class="card-body-meli">

                <h5 class="card-title-meli"><i class="bi bi-person-bounding-box"></i> ${data.NombreyApellido && data.NombreyApellido.trim() !== '' ? data.NombreyApellido : data.Recibe}</h5>
                <h6 class="user-title-meli">${data.nombreDeUsuario && data.nombreDeUsuario.trim() !== '' ? data.nombreDeUsuario : data.Recibe}</h6>
                <div class="meli-box1"> 
                    <p class="card-text cpLocalidad-meli"><i class="fas fa-map-marker-alt"></i> ${data.Cp}, ${data.localidad}, ${data.Provincia}</p>

                    <p class="card-text correo-meli correo-mercado-libre"> 
                            <img src="Img/meli.png" alt="Logística Novogar" width="30">
                    </p>

                    </div>

                <div class="PaqID-Container" onclick="copiarPaqId('${data.paqid}')">
                <div class="PaqID ${!data.paqid ? 'hidden' : ''}">
                <i class="bi bi-info-circle-fill info-paq"></i>
                <strong>PaqId:</strong> ${data.paqid}
                </div>
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
                <i class="bi bi-bag-fill mr-1"></i>Producto: X <strong>${data.Cantidad}</strong>u. <strong>${data.SKU}</strong>
                </div>

                <div class="cliente-Container" onclick="copiarCliente('${data.cliente}')">
                <div class="cliente ${!data.cliente ? 'hidden' : ''}">
                <img src="Img/logo-presea.png" alt="PRESEA" width="20">
                Cliente Presea: <strong id="nombre-cliente">${data.cliente}</strong> 
                </div>
                </div>
                
                <div class="em-circle-${data.shippingMode.toLowerCase() === 'me1' ? 'ME1' : 'ME2'}">${data.shippingMode.toUpperCase()}</div>

                <button class="btn btn-outline-secondary w-100 collapps-envio-meli" data-bs-toggle="collapse" data-bs-target="#collapseDetails${data.idOperacion}" aria-expanded="false" aria-controls="collapseDetails${data.idOperacion}">
                    <i class="bi bi-chevron-down"></i> Ver más detalles
                </button>
                <div class="collapse" id="collapseDetails${data.idOperacion}">

                
                <p class="numeroDeEnvioGenerado" id="numeroDeEnvioGenerado${data.idOperacion}">
                    Envío: 
                        ${isLogPropia ? 
                                               'Logística Propia' : 
                            (isLogPlaceIt ? 
                                'Logística PlaceIt' : 
                                (isAndesmar ? 
                                    `<a href="${data.trackingLink}" target="_blank">Andesmar: ${data.trackingNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                    (isCDS ? 
                                        `<a href="${data.trackingLink}" target="_blank">CDS: NIC-${data.trackingNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                        (isAndreani ? 
                                            `<a href="${data.trackingLink}" target="_blank">Andreani: ${data.trackingNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                            'Número Pendiente'
                                        )
                                    )
                                )
                            )
                        }
                </p>

                    <div class="little-card-meli">

                    <p class="editarLocalidad" style="display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <i class="fas fa-map-marker-alt ios-icon"></i> 
                    <span id="localidadDeEnvio-${data.idOperacion}" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${data.Cp}, ${data.localidad}, ${data.Provincia}</span>
                    <button disabled class="btn btn-primary" style="padding: 2px; margin: 0;" onclick="editarLocalidad('${data.idOperacion}')">
                    <i class="bi bi-pencil-square"></i>
                    </button>
                    <button id="btnBorrar-${data.idOperacion}" class="btn btn-outline-danger btn-sm" style="display: none; margin-left: 5px;" onclick="borrarLocalidad('${data.idOperacion}')">
                    Borrar localidad <i class="bi bi-x-circle"></i>
                    </button>
                    </p>


                        <div id="inputLocalidad-${data.idOperacion}" style="display:none;">
                            <input type="text" id="localidadInput-${data.idOperacion}" 
                                   placeholder="Buscar localidad" 
                                   oninput="buscarLocalidades('${data.idOperacion}', this.value)" 
                                   class="form-control"/>
                            <div id="sugerencias-${data.idOperacion}" class="sugerencias" style="display: none;"></div>
                        </div>
                        <p><i class="fas fa-home ios-icon"></i> Calle: <span id="calle-${data.idOperacion}">${data.Calle}</span></p>
                        <p><i class="bi bi-123 ios-icon"></i> Altura: <span id="altura-${data.idOperacion}">${data.Altura}</span></p>
                        <p><i class="fas fa-phone ios-icon"></i> Telefono: <span id="telefono-${data.idOperacion}">${data.Telefono!== undefined ? data.Telefono : 'No Disponible'}</span></p>
                        <p><i class="bi bi-envelope-at-fill ios-icon"></i> Email: <span id="email-${data.idOperacion}" style="text-transform: lowercase;">${email}</span></p>
                        <p><i class="bi bi-info-circle-fill ios-icon"></i> Autorizado: <span id="autorizado-${data.idOperacion}">${data.Recibe !== undefined ? data.Recibe : 'Sin Autorizado, solo titular'}</span></p>
                        <p><i class="bi bi-sticky-fill ios-icon"></i> Observaciones: <span id="observaciones-${data.idOperacion}">${data.Observaciones!== undefined ? data.Observaciones : 'Sin Observaciones'}</span></p>
                    </div>
                    <div class="dimensions-info">
                    <h6>Dimensiones</h6>
                    <div style="border-top: 1px dashed cornflowerblue; padding-top: 10px; border-bottom: 1px dashed cornflowerblue; margin-bottom: 5px; padding-bottom: 10px; margin-left: 0px; border-left: 1px dashed cornflowerblue; padding-left: 5px; margin-right:0px; border-right: 1px dashed cornflowerblue; padding-right: 5px;">
                        <i class="bi bi-rocket-takeoff-fill"></i> 
                        <strong style="color: #007bff;">Shipping ID:</strong> 
                        <span id="shippingID-${data.idOperacion}">${data.shippingId!== undefined ? data.shippingId : 'Sin ID es ME1'}</span>
                    </div>

                    <div style="border-top: 1px solid #ccc; padding-top: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
                        <i class="bi bi-bag-fill"></i> 
                        <strong style="color: #007bff;">Producto:</strong> 
                        <span id="producto-${data.idOperacion}">${data.Producto}</span>
                    </div>

                    <div style="border-top: 1px solid #ccc; padding-top: 10px; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px;">
                        <div><i class="bi bi-coin"></i> Total: <strong id="valor-${data.idOperacion}" style="color: green;">${formatCurrency(data.transactionAmount)}</strong></div>
                        ${paymentHTML}
                    </div>

                        <div><i class="bi bi-code-square"></i> <strong>SKU: </strong><span id="sku-${data.idOperacion}" style="color: #007bff;">${data.SKU}</span></div>
                        <div><i class="bi bi-arrows-angle-expand"></i> Medidas: <span id="medidas-${data.idOperacion}">${data.medidas}</span></div>
                        <div><i class="bi bi-box-arrow-in-down"></i> Peso: <span id="peso-${data.idOperacion}">${Math.round(data.Peso / 1000)}</span> kg</div>
                        <div><i class="bi bi-box"></i> Volumen M³: <span id="volumenM3-${data.idOperacion}">${data.VolumenM3}</span> m³</div>
                        <div><i class="bi bi-box"></i> Volumen CM³: <span id="volumenCM3-${data.idOperacion}">${data.VolumenCM3}</span> cm³</div>
                        <div><i class="bi bi-boxes"></i> Cantidad: <span id="cantidad-${data.idOperacion}">${data.Cantidad}</span></div>
                    </div>

                    <button class="btn btn-secondary w-100 mt-2 editarDatos" id="editButton-${data.idOperacion}" disabled onclick="editarDatos('${data.idOperacion}')">Editar datos</button>
                </div>

                <div class="conjuntoDeBotonesMeli" style="display: flex; flex-direction: column;">
    
    <div class="bg-Hr-primary">
    <p><i class="bi bi-tags-fill"></i> Logistica Buenos Aires</p>
    </div>

    <!-- Botón Logística PlaceIt --> 
    <button class="mt-1 mb-0 btn btnLogPropiaMeli ${isLogPlaceIt ? 'btn-success' : 'btn-danger'}"
        id="LogPropiaMeliButton${data.idOperacion}" 
        ${isBlocked ? 'disabled' : ''} 
        onclick="generarPDF('${email}', '${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenM3}, ${data.Cantidad}, '${data.medidas}', '${limpiarProducto(data.Producto)}', '${data.localidad}', '${data.Provincia}', '${data.Recibe}', '${data.SKU}', '${formatCurrency(data.transactionAmount)}', '${limpiarComentarios(data.Observaciones !== undefined ? data.Observaciones : "Sin Observaciones")}')">
        <span>
            ${isLogPlaceIt ? `<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta PlaceIt` : `<img class="NovogarMeli" src="Img/novogar-tini.png" alt="Novogar"> Etiqueta 10x15 <strong>PlaceIt</strong>`}
        </span>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerLogPropia${data.idOperacion}" style="display:none;"></span>
    </button>
    <!-- Botón Logística Propia --> 
</div>

<div id="resultado${data.idOperacion}" class="mt-2 errorMeli" style="${isBlocked || isLogPlaceIt ? 'background-color: #d0ffd1;' : ''}">
                    ${isBlocked ? '<i class="bi bi-info-square-fill"></i> Despacho Bloqueado por Facturación, separar remito para realizar circuito' : ''}
                    ${isLogPlaceIt ? `<i class="bi bi-info-square-fill"></i> Plazo de entrega entre ${data.diasPlaceIt}` : ''}
                </div>
                           
            </div>

            <button class="btn btn-link lock-btn p-1 m-0 disabled" style="display: inline-flex; align-items: center;">
            <i class="${email === "" ? 'bi bi-envelope-x-fill email-notification1' : 'bi bi-envelope-fill email-notification2'}"></i>
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

function habilitarEdicion(id) {
    const camposEditables = [
        'calle', 'altura', 'telefono', 'email', 'observaciones',
        'producto', 'sku', 'medidas', 'peso', 'volumenM3', 'volumenCM3', 'cantidad', 'autorizado', 
    ];

    camposEditables.forEach(campo => {
        const span = document.getElementById(`${campo}-${id}`);
        if (span) {
            const valorActual = span.textContent;
            span.innerHTML = `<input type="text" class="form-control" value="${valorActual}" id="input-${campo}-${id}">`;
        } else {
            console.warn(`No se encontró el elemento con ID: ${campo}-${id}`);
        }
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

function copiarCliente(cliente) {
    navigator.clipboard.writeText(cliente).then(() => {
        showAlert(`Se ha copiado al portapapeles: Cliente ${cliente}`);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

function copiarPaqId(paqid) {
    navigator.clipboard.writeText(paqid).then(() => {
        showAlert(`Se ha copiado al portapapeles: PaqId ${paqid}`);
    }).catch(err => {
        console.error('Error al copiar: ', err);
    });
}

// Función para mostrar la alerta
function showAlert(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert-ios-meli';
    alertContainer.innerHTML = `
        <i class="bi bi-clipboard-check"></i>
        ${message}
        <button class="close-btn" onclick="this.parentElement.style.display='none';">&times;</button>
    `;
    document.body.appendChild(alertContainer);

    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 3000);
}

// MODAL CLIENTE & REMITO
function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
}

function mostrarModalLiquidGlass({
    titulo = '',
    placeholder = '',
    emoji = '',
    descripcion = '',
    validacion = (v) => true,
    mensajeError = 'Dato inválido',
    maxlength = 8
}) {
    return new Promise((resolve) => {
        if (document.getElementById('modal-liquid-glass-ios')) {
            document.getElementById('modal-liquid-glass-ios').remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'modal-liquid-glass-ios';
        overlay.style = `
            position:fixed;z-index:9999;left:0;top:0;width:100vw;height:100vh;
            background:rgba(0,0,0,0.12);backdrop-filter:blur(2px);
            display:flex;align-items:center;justify-content:center;
            animation:fadeInOverlay 0.28s;
        `;

        const modal = document.createElement('div');
        modal.style = `
            min-width:320px;max-width:94vw;
            background:rgba(255,255,255,0.68);
            border-radius:22px;
            box-shadow:0 8px 32px 0 #0003;
            backdrop-filter:blur(18px) saturate(160%);
            border:1.5px solid rgba(200,200,230,0.18);
            padding:2.1em 1.5em 1.2em 1.5em;
            display:flex;flex-direction:column;align-items:center;
            position:relative;
            overflow:hidden;
            animation:popInModal 0.42s cubic-bezier(.23,1.25,.32,1) both;
        `;

        modal.innerHTML = `
            <svg style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.62;" viewBox="0 0 400 220" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="siriGradient1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#00cfff"/>
                        <stop offset="50%" stop-color="#3b8dff"/>
                        <stop offset="100%" stop-color="#9a4dff"/>
                    </linearGradient>
                    <linearGradient id="siriGradient2" x1="0" y1="1" x2="1" y2="0">
                        <stop offset="0%" stop-color="#64d3ff"/>
                        <stop offset="100%" stop-color="#005eff"/>
                    </linearGradient>
                    <linearGradient id="siriGradient3" x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#00f2ff"/>
                        <stop offset="100%" stop-color="#0074ff"/>
                    </linearGradient>
                    <linearGradient id="siriGradient4" x1="1" y1="1" x2="0" y2="0">
                        <stop offset="0%" stop-color="#6a5fff"/>
                        <stop offset="100%" stop-color="#33e0ff"/>
                    </linearGradient>
                </defs>
                <path fill="url(#siriGradient1)" opacity="0.48">
                    <animate attributeName="d" dur="7s" repeatCount="indefinite"
                        values="M0,120 Q100,180 200,120 T400,120 V220 H0Z;
                                M0,120 Q100,100 200,160 T400,120 V220 H0Z;
                                M0,120 Q100,180 200,120 T400,120 V220 H0Z" />
                </path>
                <path fill="url(#siriGradient2)" opacity="0.33">
                    <animate attributeName="d" dur="9s" repeatCount="indefinite"
                        values="M0,140 Q100,100 200,160 T400,140 V220 H0Z;
                                M0,140 Q100,180 200,120 T400,140 V220 H0Z;
                                M0,140 Q100,100 200,160 T400,140 V220 H0Z" />
                </path>
                <path fill="url(#siriGradient3)" opacity="0.29">
                    <animate attributeName="d" dur="11s" repeatCount="indefinite"
                        values="M0,130 Q100,170 200,110 T400,130 V220 H0Z;
                                M0,130 Q100,90 200,150 T400,130 V220 H0Z;
                                M0,130 Q100,170 200,110 T400,130 V220 H0Z" />
                </path>
                <path fill="url(#siriGradient4)" opacity="0.22">
                    <animate attributeName="d" dur="13s" repeatCount="indefinite"
                        values="M0,125 Q100,185 200,125 T400,125 V220 H0Z;
                                M0,125 Q100,95 200,145 T400,125 V220 H0Z;
                                M0,125 Q100,185 200,125 T400,125 V220 H0Z" />
                </path>
            </svg>
            <div style="position:relative;z-index:1;width:100%;">
                <div style="text-align: center; margin-bottom: 1.5em;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:0.7em; font-size:1.18em; font-weight:600; color:#222;">
                        <span class="titulo-modal-liquid-glass">${titulo}</span>
                    </div>
                </div>
                <input id="input-modal-lg"
                    style="width:100%;background:rgba(255,255,255,0.88);border-radius:14px;border:1px solid #e3e3e6;font-size:1.15em;padding:0.7em 1em;margin-bottom:0.8em;outline:none;"
                    maxlength="${maxlength}" placeholder="${placeholder}" autocomplete="off" autofocus>
                <div style="display:flex;justify-content:center;margin-bottom:1.1em;">
                    <div style="background:rgba(255,255,255,0.38);border-radius:15px;padding:0.8em 1.2em;font-size:1em;color:#565;">
                        <span style="font-size:1.25em;">✨</span>
                        <span>${descripcion}</span>
                    </div>
                </div>
                <div id="error-modal-lg" style="display:none;background:rgba(255, 0, 64, 0.22);color:white;font-size:0.97em;font-weight:500;border-radius:17px;margin-bottom:0.7em;padding:0.7em 1em;text-align:center;"></div>
                <div style="display:flex;gap:1em;justify-content:center;width:100%;">
                    <button id="btn-modal-lg-ok" style="background:#007aff;color:#fff;font-size:1.05em;font-weight:600;padding:0.62em 2.1em;border:none;border-radius:13px;cursor:pointer;">Aceptar</button>
                    <button id="btn-modal-lg-cancel" style="background:#eee;color:#444;font-size:1.05em;font-weight:500;padding:0.62em 2.1em;border:none;border-radius:13px;cursor:pointer;">Cancelar</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        function cerrar(valor) {
            overlay.style.animation = "fadeOutOverlay 0.22s";
            modal.style.animation = "popOutModal 0.38s cubic-bezier(.23,1.25,.32,1) both";
            setTimeout(() => {
                overlay.remove();
                resolve(valor);
            }, 220);
        }

        setTimeout(() => document.getElementById('input-modal-lg').focus(), 100);

        document.getElementById('btn-modal-lg-ok').onclick = () => {
            const val = document.getElementById('input-modal-lg').value.trim();
            const err = document.getElementById('error-modal-lg');
            const result = validacion(val);
            if (result !== true) {
                err.innerHTML = result;
                err.style.display = 'block';
                document.getElementById('input-modal-lg').style.border = '1.5px solid #ff3b30';
                beep();
                modal.style.animation = 'shakeModal 0.4s';
                setTimeout(() => {
                    modal.style.animation = 'popInModal 0.42s cubic-bezier(.23,1.25,.32,1) both';
                }, 400);
            } else {
                err.style.display = 'none';
                cerrar(val);
            }
        };

        document.getElementById('btn-modal-lg-cancel').onclick = () => cerrar(null);
        overlay.onclick = (e) => { if (e.target === overlay) cerrar(null); };
        document.onkeydown = (e) => {
            if (e.key === 'Escape') cerrar(null);
            if (e.key === 'Enter') document.getElementById('btn-modal-lg-ok').click();
        };

        if (!document.getElementById('modal-lg-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-lg-animations';
            style.innerHTML = `
                @keyframes fadeInOverlay { from { opacity:0; } to { opacity:1; } }
                @keyframes fadeOutOverlay { from { opacity:1; } to { opacity:0; } }
                @keyframes popInModal {
                    0% { opacity:0; transform:scale(0.84) translateY(60px);}
                    80% { opacity:1; transform:scale(1.03) translateY(-4px);}
                    100% { opacity:1; transform:scale(1) translateY(0);}
                }
                @keyframes popOutModal {
                    0% { opacity:1; transform:scale(1) translateY(0);}
                    100% { opacity:0; transform:scale(0.84) translateY(40px);}
                }
                @keyframes shakeModal {
                    0% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-6px); }
                    80% { transform: translateX(6px); }
                    100% { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
    });
}

// USO: Solicitar Cliente
async function solicitarCliente() {
    const numeroCliente = await mostrarModalLiquidGlass({
        titulo: 'Número de Cliente 🙋‍♂️',
        placeholder: 'N° Cliente',
        emoji: '👤',
        descripcion: 'Ingresá tu <b>número de cliente</b> (máx. 8 dígitos)',
        maxlength: 10,
        validacion: v => {
            if (!/^\d+$/.test(v)) return 'Solo se permiten números sin caracteres especiales';
            if (v.length < 2) return 'Debe tener al menos 2 dígitos';
            if (v.length > 8) return 'No puede tener más de 8 dígitos';
            return true;
        },
        mensajeError: 'Por favor, ingresá un cliente válido'
    });
    return numeroCliente;
}

// USO: Solicitar Remito
async function solicitarNumeroRemito() {
    const numeroRemito = await mostrarModalLiquidGlass({
        titulo: 'Número de Remito 📋',
        placeholder: 'N° Remito',
        emoji: '📄',
        descripcion: 'Ingresá el <b>número de remito</b> (mín. 10 dígitos)',
        maxlength: 20,
        validacion: v => {
            if (!/^\d+$/.test(v)) return 'Solo se permiten números sin caracteres especiales';
            if (v.length < 10) return 'Debe tener al menos 10 dígitos';
            return true;
        },
        mensajeError: 'Ingresá un número de remito válido'
    });
    return numeroRemito;
}
// FIN MODAL CLIENTE & REMITO

// ETIQUETA LOGISTICA PROPIA
async function generarPDF(email, id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, medidas, producto, localidad, provincia, recibe, SKU, total, comentarios) {
    
    const cliente = await solicitarCliente();
    if (!cliente) return;

    const numeroRemito = await solicitarNumeroRemito();
    if (!numeroRemito) return;

        // Formatear SKU
    const skuFormateado = SKU.toUpperCase().padStart(15, '0');

    // Obtener fechas
    const hoy = new Date();
    const fechadeOrigen = obtenerFechaFormatoPlaceIt(new Date(hoy));
    const fechaEntregaDate = sumarDiasHabiles(hoy, 3); // suma 3 días hábiles
    const fechadeEntrega = obtenerFechaFormatoPlaceIt(fechaEntregaDate);

    // Enviar el pedido de forma asíncrona
    enviarPedidoBrainsys(
        NombreyApellido,
        Cp,
        provincia,
        numeroRemito,
        cliente,
        calleDestinatario,
        alturaDestinatario,
        telefonoDestinatario,
        email,
        total,
        producto,
        skuFormateado,
        cantidad,
        fechadeOrigen,
        fechadeEntrega,
        observaciones
    );

    const { jsPDF } = window.jspdf;

    spinner2.style.display = "flex";
    let button = document.getElementById(`LogPropiaMeliButton${id}`);
    let resultado = document.getElementById(`resultado${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);

    // Crear un nuevo documento PDF en tamaño 10x15 cm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [15, 10],
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    // Eliminar el prefijo "200000" del idOperacion
    const idOperacionFinal = idOperacion.replace(/^20000[0-9]/, '');
    const idOperacionFinal2 = idOperacionFinal + "ME1";
    // Limitar el producto a 60 caracteres
    const productoLimitado = producto.length > 60 ? producto.substring(0, 60) + "..." : producto;

    // URL de la API para generar el código de barras
    const barcodeApiUrl = `https://proxy.cors.sh/https://bwipjs-api.metafloor.com/?bcid=code128&text=${numeroRemito}&scale=3&height=10&includetext`;
    // Obtener el código de barras en formato Base64 usando el proxy CORS
    const response = await fetch(barcodeApiUrl, {
        method: 'GET',
        headers: {
            "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd"
        }
    });

    if (!response.ok) {
        console.error('Error al generar el código de barras:', response.statusText);
        spinner2.style.display = "none";
        return;
    }

    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = function() {
        const barcodeBase64 = reader.result;

        // Contenido HTML
        const contenido = `
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Etiqueta</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
            <style>
            body {
                margin: 0;
                padding: 0;
                display: grid;
                place-items: center;
                height: 100vh;
                background-color: #e0e0e0;
                font-family: 'Arial', sans-serif;
            }
            .etiqueta {
                width: 10cm;
                margin: 10px;
                padding: 20px;
                border-radius: 15px;
                background-color: #ffffff;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                display: flex;
                border: 2px dashed #282555;
                flex-direction: column;
                align-items: center;
            }
            .logo img {
                max-width: 315px;
                height: auto;
                margin-bottom: 5px;
            }
            .campo {
                width: 100%;
                border-radius: 10px;
                display: flex;
                align-items: center;
                margin-bottom: 5px;
                padding: 5px;
                border: 1px solid #282555;
                background-color: #f1f8ff;
                transition: background-color 0.3s;
            }
            .campo span {
                font-size: 1em;
                font-weight: bold;
                color: black;
            }
            .campo.uppercase {
                text-transform: uppercase;
            }
            .campo-extra {
                width: 100%;
                border-radius: 10px;
                margin-top: 10px;
                border: 2px dashed #282555;
                padding: 10px;
                text-align: center;
                font-size: 1em;
                color: #555;
                background-color: #f9f9f9;
            }
            .contacto {
                margin-top: 15px;
                text-align: center;
                font-size: 0.9em;
                color: #333;
            }
            .contacto p {
                margin: 5px 0;
            }

            hr {
                    border: none; 
                    height: 1px; 
                    background-color: #2B2B2BFF; 
                    margin: 5px 0; 
                    border-radius: 5px;
                }
            .campo-extra img {
                max-width: 100%;
                height: auto;
                display: block;
            }
            </style>
        </head>
        <body>
        <div class="etiqueta">
            <div class="logo">
                <img src="./Img/Placeit-etiqueta.png" alt="Logo">
            </div>
            <div class="campo uppercase"><span>${cliente} ${NombreyApellido || recibe}</span></div>
            <div class="campo"><span>${Cp}, ${localidad}, ${provincia}</span></div>
            <div class="campo uppercase"><span>${calleDestinatario} ${alturaDestinatario}</span></div>
            <div class="campo"><span>Teléfono: ${telefonoDestinatario}</span></div>
            <div class="campo"><span>X ${cantidad} Unidad. ${SKU}, ${productoLimitado}</span></div>
            <div class="campo"><span>${comentarios}</span></div>
            <div class="campo-extra">
                <img src="${barcodeBase64}" alt="Código de Barras" />
            </div>
            <div class="contacto">
            <hr>
            <p><strong>💬 Posventa:</strong> (0341) 6680658 (WhatsApp)</p>
            <p><strong>📧 Email:</strong> posventa@novogar.com.ar</p>
            </div>
        </div>
        </body>
        </html>`;

        // Crear un elemento temporal para renderizar el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contenido;
        document.body.appendChild(tempDiv);

        // Usar html2canvas para capturar el contenido
        html2canvas(tempDiv, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 0, 0, 10, 15);
            const pdfBlob = doc.output('blob');

            // Crear un enlace para abrir el PDF en una nueva ventana
            const pdfUrl = URL.createObjectURL(pdfBlob);
            spinner2.style.display = "none";
            button.innerHTML = '<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta PlaceIt';
            resultado.style.backgroundColor = "#d0ffd1";
            resultado.innerHTML = `<i class="bi bi-info-square-fill"></i> Plazo de entrega entre ${diaFormateadoPlaceIt}`;
            button.classList.remove('btn-danger');
            button.classList.add('btn-success');

            window.open(pdfUrl, '_blank');
        });

        NroEnvio.innerHTML = `Logística PlaceIt`;

        const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');
        const numeroCliente = cliente;
        const diaFormateadoPlaceIt = obtenerFechas();

        trackingMessage = `Hola ${NombreyApellido || recibe} ¡Gracias por tu compra!
        
            Queremos informarte que vamos a visitarte entre el ${diaFormateadoPlaceIt}.
        
            Por favor, confírmanos un 📞 actualizado para poder coordinar la entrega. Si no vas a estar ese día, podés autorizar a otra persona enviándonos por este medio su nombre completo y DNI. También podes brindarnos un domicilio alternativo.
        
            Cualquier consulta, estamos a tu servicio. ¡Gracias!
            
            Equipo Posventa Novogar
            
            ENVIO CON LOGISTICA PLACEIT`;
    
        firebase.database().ref('envios/' + idOperacionSinME1).update({
            trackingNumber: "Logistica PlaceIt",
            trackingLink: "Logistica PlaceIt",
            trackingMessage: trackingMessage,
            transportCompany: "PlaceIt",
            cliente: cliente,
            diasPlaceIt: diaFormateadoPlaceIt
        }).then(() => {
            console.log(`Datos actualizados en Firebase (Mercado libre) para la operación: ${idOperacionSinME1}`);
        }).catch(error => {
            console.error('Error al actualizar en Firebase:', error);
        });

        const fechaHora = new Date().toLocaleString('es-ES', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Cambia a true si prefieres el formato de 12 horas
        });
        
        firebase.database().ref(`DespachosLogisticos/${numeroRemito}`).set({
            cliente: cliente,
            estado: "Envio Express PlaceIt",
            fechaHora: fechaHora,
            operadorLogistico: "PlaceIt",
            remitoDigital: 0,
            email: email,
            remito: numeroRemito,
            numeroDeEnvio: 123456,
            remitoVBA: numeroRemito,
            subdato: diaFormateadoPlaceIt,
            valorDeclarado: total,
            direccion: calleDestinatario + " " + alturaDestinatario,
            comentarios: comentarios,
            telefono: telefonoDestinatario,
            sku: SKU,
            cantidad: cantidad,
            cp: Cp,
            orden: id,
            tienda: "MELI",
            localidad: localidad,
            nombre: NombreyApellido,
            provincia: provincia
        }).then(() => {
            console.log(`Datos actualizados en Firebase (Logistica) para la operación: ${idOperacionSinME1}`);
            const Name = `Confirmación de Compra Novogar`;
            const Subject = `Tu compra con envío Express ${numeroRemito} ya fue preparada para despacho`;
            const template = "emailTemplatePlaceIt";
            const transporte = "Logística PlaceIt";
            const numeroDeEnvio = numeroRemito; // Usar número de remito real
            const linkSeguimiento2 = `https://tracking.placeit.com/?remito=${numeroRemito}`;
            const remito = numeroRemito;
            const nombre = NombreyApellido || recibe;
        
            return sendEmail(
                Name, 
                Subject, 
                template, 
                nombre, 
                email, 
                remito, 
                linkSeguimiento2, 
                transporte, 
                numeroDeEnvio
            );
        }).catch(error => {
            console.error('Error al actualizar en Firebase:', error);
        });
        
        document.body.removeChild(tempDiv);
    };

    reader.readAsDataURL(blob);
}
// FIN GENERAR ETIQUETA LOGISTICA PLACE IT

// FECHA BRAINSYS
function obtenerFechaFormatoPlaceIt(date) {
    return new Date(date).toISOString();
}
  
  function sumarDiasHabiles(fecha, diasHabiles) {
    let resultado = new Date(fecha);
    let sumados = 0;
    while (sumados < diasHabiles) {
      resultado.setDate(resultado.getDate() + 1);
      const dia = resultado.getDay();
      if (dia !== 0 && dia !== 6) { // 0 = Domingo, 6 = Sábado
        sumados++;
      }
    }
    return resultado;
  }
// FECHA BRAINSYS

// OBTENER FECHAS PLACE IT
function obtenerFechas() {
    const diasDeLaSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const hoy = new Date();
    
    // Ajustar la hora a la zona horaria de Argentina (UTC-3)
    const offset = -3 * 60; // UTC-3 en minutos
    const utcDate = hoy.getTime() + (hoy.getTimezoneOffset() * 60 * 1000);
    const fechaActual = new Date(utcDate + (offset * 60 * 1000));

    // Determinar el próximo día hábil
    let fechaEntrega = new Date(fechaActual);

    // Si hoy es sábado, avanzar al lunes
    if (fechaActual.getDay() === 6) { // 6 = sábado
        fechaEntrega.setDate(fechaActual.getDate() + 2); // Avanzar 2 días
    } else if (fechaActual.getDay() === 0) { // 0 = domingo
        fechaEntrega.setDate(fechaActual.getDate() + 1); // Avanzar 1 día
    } else {
        fechaEntrega.setDate(fechaActual.getDate() + 1); // Avanzar al siguiente día
    }

    // Sumar 48 horas a la fecha de entrega
    fechaEntrega.setHours(fechaEntrega.getHours() + 72);

    // Asegurarse de que la fecha de entrega sea un día hábil
    while (fechaEntrega.getDay() === 0 || fechaEntrega.getDay() === 6) { // 0 = domingo, 6 = sábado
        fechaEntrega.setDate(fechaEntrega.getDate() + 1);
    }

    // Formatear las fechas
    const diaActual = `${diasDeLaSemana[fechaActual.getDay()]} ${fechaActual.getDate()} de ${fechaActual.toLocaleString('default', { month: 'long' })}`;
    const diaEntrega = `${diasDeLaSemana[fechaEntrega.getDay()]} ${fechaEntrega.getDate()} de ${fechaEntrega.toLocaleString('default', { month: 'long' })}`;

    const mensajeFinal = `Plazo de entrega entre ${diaActual} y ${diaEntrega}`;
    
    return mensajeFinal;
}

// Ejecutar la función para probar
console.log("Mensaje final a imprimir Hoy:", obtenerFechas());
// FIN OBTENER FECHAS PLACE IT

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

//SESION BRAINSYS
async function obtenerSesionBrainsys() {
    const storageKey = 'brainsysSesion';
    const timestampKey = 'brainsysSesionTimestamp';
    const ahora = Date.now();
    const cincoHoras = 5 * 60 * 60 * 1000;
  
    let sesion = null;
  
    try {
      const sesionGuardada = localStorage.getItem(storageKey);
      const timestampGuardado = localStorage.getItem(timestampKey);
  
      if (sesionGuardada && timestampGuardado && (ahora - parseInt(timestampGuardado)) < cincoHoras) {
        console.log("⏳ Sesión válida BrainSys encontrada.");
        sesion = JSON.parse(sesionGuardada);
        return sesion;
      }
  
      console.log("🔁 No hay sesión BrainSys válida, autenticando...");
  
      const authData = {
        usuario: brainsysUser,
        contrasenia: brainsysPass
      };
  
      const response = await fetch(`${brainsysPoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-cors-api-key': `${live}`,
        },
        body: JSON.stringify(authData)
      });
  
      const result = await response.json();
  
      if (result.d.tipo === 0) {
        sesion = result.d.sesion;
        console.log("✅ Autenticación exitosa BrainSys");
  
        localStorage.setItem(storageKey, JSON.stringify(sesion));
        localStorage.setItem(timestampKey, ahora.toString());
      } else {
        console.warn("⚠️ Error en autenticación:", result.d.mensaje);
      }
  
    } catch (error) {
      console.error("❌ Error al autenticar:", error);
    }
  
    return sesion;
  }
//SESION BRAINSYS

function transformarTotal(total) {
    return Number(total.replace(/\$|\./g, '').replace(',', '.'));
}

// ENVIAR PEDIDO BRAINSYS  
async function enviarPedidoBrainsys(NombreyApellido, Cp, provincia, numeroRemito, cliente, calleDestinatario, alturaDestinatario, telefonoDestinatario, email, total, producto, skuFormateado, cantidad, fechadeOrigen, fechadeEntrega, observacionesMeli) {
    
    const sesion = localStorage.getItem('sesion');
    const depositoId = "001";
    const remitoTransformado = numeroRemito.slice(3).replace(/^0000/, '');

    const productoObj = {
        codigo: skuFormateado,
        companiaCodigo: "NOG",
        loteCodigo: "001", 
        vencimiento: "", 
        loteUnico: false,
        estadoCodigo: "DIS",
        cantidad: cantidad,
        entregaParcial: true
    };

    // Transformar el total
    const totalTransformado = transformarTotal(total).toString().replace('.', '');

    await enviarPedido(
        sesion,
        depositoId,
        "DEP",
        "PLA",
        "PNG",
        "R",
        "0254",
        Number(remitoTransformado),
        fechadeOrigen,
        fechadeEntrega,
        "NOG",
        "ENO",
        NombreyApellido,
        "ARG",
        provincia,
        Cp,
        `${calleDestinatario} ${alturaDestinatario}`,
        "001",
        "001",
        1,
        false,
        totalTransformado,
        1,
        1,
        `U.${cantidad} - ${skuFormateado}`, 
        `Remito: ${numeroRemito}`, 
        `${observacionesMeli}. Coordinar con línea ${telefonoDestinatario}, Producto: ${skuFormateado} ${producto}`,
        observacionesMeli,
        productoObj 
    );
    
    console.log(
        sesion,
        depositoId,
        "DEP",
        "PLA",
        "PNG",
        "R",
        "0254",
        Number(remitoTransformado),
        fechadeOrigen,
        fechadeEntrega,
        "NOG",
        "ENO",
        NombreyApellido,
        "ARG",
        provincia,
        Cp,
        `${calleDestinatario} ${alturaDestinatario}`,
        "001",
        "001",
        1,
        false,
        totalTransformado,
        1,
        1,
        `U.${cantidad} - ${skuFormateado}`, 
        `Remito: ${numeroRemito}`, 
        `${observacionesMeli}. Coordinar con línea ${telefonoDestinatario}, Producto: ${skuFormateado} ${producto}`,
        observacionesMeli,
        productoObj 
    );
}
// FIN ENVIAR PEDIDO BRAINSYS  

// Llama a cargarDatos para iniciar el proceso
cargarDatos();


