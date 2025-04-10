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
    await cargarPrecios();
    await obtenerCredencialesCDS();
    await cargarDatos();
});

// CARGAR PRECIOS Y STOCK
let preciosArray = [];

// Función para cargar precios y stock
async function cargarPrecios() {
    return dbStock.ref('precios/').once('value')
        .then(preciosSnapshot => {
            // Verificamos si hay datos
            if (preciosSnapshot.exists()) {
                preciosSnapshot.forEach(childSnapshot => {
                    const childData = childSnapshot.val();
                    preciosArray.push({
                        sku: childData.sku,
                        stock: childData.stock
                    });
                });
                console.log("Stock Sincronizado con éxito.");
            } else {
                console.log("No hay datos en la ruta especificada.");
            }
        })
        .catch(error => {
            console.error("Error al acceder a la base de datos:", error);
        });
}
// FIN CARGAR PRECIOS Y STOCK

// MODAL MELI LOCALIDADES
document.getElementById('logisticaBsAsButton').addEventListener('click', () => {
    loadPostalCodes('LogBsAs');
    mostrarAlertaCP('Vista cambiada a Logística Buenos Aires', 'info', 'bi-info-circle-fill');
});
document.getElementById('logisticaSantaFeButton').addEventListener('click', () => {
    loadPostalCodes('LogSantaFe');
    mostrarAlertaCP('Vista cambiada a Logística Santa Fe', 'info', 'bi-info-circle-fill');
});
document.getElementById('logisticaRafaelaButton').addEventListener('click', () => {
    loadPostalCodes('LogRafaela');
    mostrarAlertaCP('Vista cambiada a Logística Rafaela', 'info', 'bi-info-circle-fill');
});
document.getElementById('logisticaSanNicolasButton').addEventListener('click', () => {
    loadPostalCodes('LogSanNicolas');
    mostrarAlertaCP('Vista cambiada a Logística San Nicolás', 'info', 'bi-info-circle-fill');
});
document.getElementById('addPostalCodeButton').addEventListener('click', addPostalCode);

let currentLogRef = null;

$('#localidadesModal').on('show.bs.modal', function () {
    document.getElementById('initialAlert').style.display = 'block';
    document.getElementById('postalCodesContainer').style.display = 'none';
    document.getElementById('cp-alertContainer').style.display = 'none';
    document.getElementById('newPostalCodeInput').value = ''; // Vaciar el input al abrir el modal
});

document.getElementById('newPostalCodeInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addPostalCode();
    }
});

function loadPostalCodes(logRef) {
    currentLogRef = logRef;
    document.getElementById('initialAlert').style.display = 'none';
    document.getElementById('postalCodesContainer').style.display = 'block';
    database.ref(logRef).once('value').then(snapshot => {
        const postalCodesList = document.getElementById('postalCodesList');
        postalCodesList.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const postalCode = childSnapshot.key;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${postalCode}</td>
                <td><button class="btn btn-danger" onclick="deletePostalCode('${postalCode}')">Eliminar</button></td>
            `;
            postalCodesList.appendChild(row);
        });
    });
}

function addPostalCode() {
    const newPostalCodeInput = document.getElementById('newPostalCodeInput');
    const newPostalCode = newPostalCodeInput.value.trim();
    if (newPostalCode && currentLogRef) {
        const newRef = database.ref(`${currentLogRef}/${newPostalCode}`);
        newRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                mostrarAlertaCP('El código postal ya existe en el listado', 'danger', 'bi-exclamation-circle-fill');
                newPostalCodeInput.value = ''; // Vaciar el input si hay error
            } else {
                newRef.set({ cp: parseInt(newPostalCode) }).then(() => {
                    mostrarAlertaCP('Se ha agregado el código postal al listado', 'success', 'bi-check-circle-fill');
                    loadPostalCodes(currentLogRef);
                    newPostalCodeInput.value = ''; // Vaciar el input al agregar con éxito
                }).catch(error => {
                    console.error("Error al agregar código postal: ", error);
                    mostrarAlertaCP('Error al agregar código postal', 'danger', 'bi-exclamation-circle-fill');
                    newPostalCodeInput.value = ''; // Vaciar el input si hay error
                });
            }
        });
    }
}

function deletePostalCode(postalCode) {
    if (currentLogRef) {
        database.ref(`${currentLogRef}/${postalCode}`).remove().then(() => {
            mostrarAlertaCP('Código postal eliminado correctamente', 'success', 'bi-check-circle-fill');
            loadPostalCodes(currentLogRef);
        }).catch(error => {
            console.error("Error al eliminar código postal: ", error);
            mostrarAlertaCP('Error al eliminar código postal', 'danger', 'bi-exclamation-circle-fill');
        });
    }
}

function mostrarAlertaCP(mensaje, tipo, icono) {
    const alertContainer = document.getElementById('cp-alertContainer');
    alertContainer.innerHTML = `<div class="cp-custom-alert cp-custom-alert-${tipo}" role="alert"><i class="bi ${icono}"></i> ${mensaje}</div>`;
    alertContainer.style.display = 'block';
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 6000);
}
// FIN MODAL MELI LOCALIDADES

let logBsCps = []; // Array para almacenar los CPs de LogBsAs
let logStaFeCps = []; // Array para almacenar los CPs de LogSantaFe
let logRafaelaCps = []; // Array para almacenar los CPs de LogRafaela
let logSanNicolasCps = []; // Array para almacenar los CPs de LogSanNicolas
let logCDSCps = []; // Array para almacenar los CPs de Cruz del Sur

// Función para cargar los CPs de LogBsAs
function cargarCpsLogBsAs() {
    return database.ref('LogBsAs').once('value').then(snapshot => {
        const logBsData = snapshot.val();
        if (logBsData) {
            logBsCps = Object.keys(logBsData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogSantaFe
function cargarCpsLogStaFe() {
    return database.ref('LogSantaFe').once('value').then(snapshot => {
        const logStaFeData = snapshot.val();
        if (logStaFeData) {
            logStaFeCps = Object.keys(logStaFeData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogRafaela
function cargarCpsLogRafaela() {
    return database.ref('LogRafaela').once('value').then(snapshot => {
        const logRafaelaData = snapshot.val();
        if (logRafaelaData) {
            logRafaelaCps = Object.keys(logRafaelaData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogSanNicolas
function cargarCpsLogSanNicolas() {
    return database.ref('LogSanNicolas').once('value').then(snapshot => {
        const logSanNicolasData = snapshot.val();
        if (logSanNicolasData) {
            logSanNicolasCps = Object.keys(logSanNicolasData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogCDS
function cargarCpsLogCDS() {
    return database.ref('LogCDS').once('value').then(snapshot => {
        const logCDSData = snapshot.val();
        if (logCDSData) {
            logCDSCps = Object.keys(logCDSData).map(cp => Number(cp));
        }
    });
}

// Llamar a las funciones para cargar los CPs antes de cargar los datos
Promise.all([
    cargarCpsLogBsAs(),
    cargarCpsLogStaFe(),
    cargarCpsLogRafaela(),
    cargarCpsLogSanNicolas(),
    cargarCpsLogCDS()
]).then(() => {
    //cargarDatos(); 
});
// QUERY DE DATOS

function mostrarResultados(resultados) {
    const tabla = document.createElement('table');
    tabla.className = 'table table-striped';
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Cantidad</th>
            </tr>
        </thead>
        <tbody>
    `;

    for (const sku in resultados) {
        const { producto, cantidad } = resultados[sku];
        const fila = `
            <tr>
                <td>${sku}</td>
                <td>${producto}</td>
                <td>${cantidad}</td>
            </tr>
        `;
        tabla.innerHTML += fila;
    }

    tabla.innerHTML += `</tbody></table>`;

    // Aquí puedes agregar la tabla al modal
    const modalBody = document.querySelector('.query-modal-body');
    modalBody.appendChild(tabla);
}

// Agregar eventos a los botones
document.getElementById('prepararME1').addEventListener('click', () => obtenerDatos('me1'));
document.getElementById('prepararME2').addEventListener('click', () => obtenerDatos('me2'));

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
async function cargarDatos() {
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
            updatePagination(allData.length);
            searchInput.disabled = false;
            searchInput.value = "";
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

// Función para crear una card
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

    function limpiarRecibe(nombreApellido) {
        // Eliminar caracteres no alfabéticos y espacios extra
        return nombreApellido.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, ' ');
    } 
    
    function limpiarProducto(Producto) {
        // Eliminar caracteres no alfabéticos y espacios extra
        return Producto.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, ' ');
    }   

     // Verificar si data.Cp está en LogBsAs
     const isLogBs = logBsCps.includes(Number(data.Cp));

    // Función para formatear números en pesos
    function formatCurrency(amount) {
    return `$ ${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

// VERIFICAR STOCK Y PRECIO
// Función para sanitizar el SKU
function sanitizeSku(sku) {
    if (typeof sku !== 'string') {
        console.error('El SKU debe ser una cadena:', sku);
        return ''; // Retorna una cadena vacía si no es válido
    }
    return sku.replace(/[^a-zA-Z0-9]/g, ''); // Eliminar caracteres especiales
}

// Obtener el SKU actual
const skuActual = data.SKU || "undefined";

if (skuActual === undefined || skuActual === null) {
    console.error('SKU actual no definido:', skuActual);
    return; // O maneja el error como desees
}

// Buscar el stock correspondiente en preciosArray
const precioItem = preciosArray.find(item => sanitizeSku(item.sku) === sanitizeSku(skuActual));

if (!precioItem) {
    console.warn('No se encontró el item para el SKU:', skuActual);
}

const stock = precioItem ? precioItem.stock : 0; // Si no se encuentra, stock es 0

// Determinar mensaje y clase de estilo según el stock
let stockMessage, stockClass, stockIcon;

if (stock === 0) {
    stockMessage = 'Sin Stock';
    stockClass = 'sin-stock';
    stockIcon = 'bi-exclamation-circle-fill'; 
} else {
    stockClass = stock < 10 ? 'stock-bajo-stock-tv' : 'stock-normal-stock-tv';
    stockMessage = stock < 10 ? 'Stock bajo' : 'Stock';
    stockIcon = stock < 10 ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
}

// Generar el HTML para el stock con clases CSS
let htmlstock = `
<div class="container-stock-tv">
    <div class="status-box-stock-tv-meli">
        <i class="bi ${stockIcon} icon-stock-tv ${stockClass}"></i>
        <p class="status-text-stock-tv ${stockClass}">
        ${stock === 0 ? stockMessage : `${stockMessage} <strong>${skuActual}</strong>: <strong>${stock}</strong> u.`}
        </p>
    </div>
</div>
`;
// FIN VERIFICAR STOCK Y PRECIO

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

    const recibeSinCaracteresEspeciales = data && data.Recibe ? data.Recibe.replace(/"/g, '') : '';

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

            <div class="${isBlocked ? 'em-circle-isFraud' : (data.estadoFacturacion === 'facturado' ? 'em-circle-isNotFraud' : 'em-circle-isFraud')}">
            ${isBlocked ? 'Bloqueado' : (data.estadoFacturacion === 'facturado' ? 'Facturado' : 'Factura X')}
            </div>

        <div id="estadoEnvio${data.idOperacion}" class="${isAndesmar || isAndreani || isCDS || isLogPropia ? 'em-circle-state2' : 'em-circle-state'}">
        ${isAndesmar || isLogPlaceIt ||isAndreani || isCDS || isLogPropia ? 'Envio Preparado' : 'Envio pendiente'}
        </div>

            <div class="card-body-meli">

                <h5 class="card-title-meli"><i class="bi bi-person-bounding-box"></i> ${data.NombreyApellido && data.NombreyApellido.trim() !== '' ? data.NombreyApellido : data.Recibe}</h5>
                <h6 class="user-title-meli">${data.nombreDeUsuario && data.nombreDeUsuario.trim() !== '' ? data.nombreDeUsuario : data.Recibe}</h6>
                <div class="meli-box1"> 
                    <p class="card-text cpLocalidad-meli"><i class="fas fa-map-marker-alt"></i> ${data.Cp}, ${data.localidad}, ${data.Provincia}</p>

                    <p class="card-text correo-meli ${logBsCps.includes(Number(data.Cp)) ? 'correo-novogar' : (logStaFeCps.includes(Number(data.Cp)) ? 'correo-santafe' : (logRafaelaCps.includes(Number(data.Cp)) ? 'correo-rafaela' : (logSanNicolasCps.includes(Number(data.Cp)) ? 'correo-sannicolas': (logCDSCps.includes(Number(data.Cp)) ? 'correo-cds' : (cpsAndesmar.includes(Number(data.Cp)) ? 'correo-andesmar' : 'correo-andreani')))))}">
                        ${logBsCps.includes(Number(data.Cp)) ? 
                            '<img src="Img/novogar-tini.png" alt="Logística Novogar" width="20" height="20">Buenos Aires' : 
                            (logStaFeCps.includes(Number(data.Cp)) ? 
                            '<img src="Img/novogar-tini.png" alt="Logística Santa Fe" width="20" height="20">Santa Fe' : 
                            (logRafaelaCps.includes(Number(data.Cp)) ? 
                            '<img src="Img/novogar-tini.png" alt="Logística Santa Fe" width="20" height="20">Santa Fe' : 
                            (logCDSCps.includes(Number(data.Cp)) ? 
                            '<img src="Img/Cruz-del-Sur-tini.png" alt="Logística Cruz del Sur" width="20" height="20">' : 
                            (logSanNicolasCps.includes(Number(data.Cp)) ? 
                            '<img src="Img/novogar-tini.png" alt="Logística San Nicolás" width="20" height="20">San Nicolás' : 
                            (cpsAndesmar.includes(Number(data.Cp)) ? 
                            '<img src="Img/andesmar-tini.png" alt="Andesmar" width="20" height="20">' : 
                            '<img src="Img/andreani-tini.png" alt="Andreani" width="20" height="20">' 
                            )
                        )))
                    )}
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

                ${htmlstock}

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
                    <button class="btn btn-primary" style="padding: 2px; margin: 0;" onclick="editarLocalidad('${data.idOperacion}')">
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

                    <button class="btn btn-secondary w-100 mt-2 editarDatos" id="editButton-${data.idOperacion}" onclick="editarDatos('${data.idOperacion}')">Editar datos</button>
                </div>

                <div class="conjuntoDeBotonesMeli" style="display: flex; flex-direction: column;">
    
    <div class="bg-Hr-primary mb-1">
    <p><i class="bi bi-tags-fill"></i> Logistica Privada</p>
    </div>

    <!-- Botón Cruz del Sur -->
        <button class="btn mb-1 ${isCDS ? 'btn-success' : 'btn-dark-blue'} btnCDSMeli" 
        id="CDSButton${data.idOperacion}" 
        ${isAndesmar || isAndreani || logBsCps.includes(Number(data.Cp)) || logStaFeCps.includes(Number(data.Cp)) || logRafaelaCps.includes(Number(data.Cp)) || logSanNicolasCps.includes(Number(data.Cp)) ? 'disabled' : ''} 
        ${isBlocked ? 'disabled' : ''}
        ${isLogPlaceIt ? 'disabled' : ''} 
        onclick="${isCDS ? `descargarEtiqueta('${data.cotizacion}', '${data.trackingNumber}', '${data.idOperacion}')` : `enviarDatosCDS('${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', '${data.localidad}', '${data.Provincia}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}','${email}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenCM3}, ${data.Cantidad}, '${data.medidas}', '${limpiarProducto(data.Producto)}', '${recibeSinCaracteresEspeciales}', '${data.transactionAmount}')`}">
        <span id="CDSText${data.idOperacion}">
        ${isCDS ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.trackingNumber}` : `<img class="CDSMeli" src="Img/Cruz-del-Sur-tini.png" alt="Cruz del Sur"> Etiqueta <strong>Cruz del Sur</strong>`}
        </span>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerCDS${data.idOperacion}" style="display:none;"></span>
        </button>
    <!-- Botón Cruz del Sur -->


    <div class="conjuntoDeBotonesMeli" style="display: flex; flex-direction: row; align-items: center;">
    <!-- Botón Andesmar --> 
    <button class="btn ${isAndesmar ? 'btn-success' : 'btn-primary'} btnAndesmarMeli" 
        id="andesmarButton${data.idOperacion}" 
        ${isAndreani || isCDS || logBsCps.includes(Number(data.Cp)) || logStaFeCps.includes(Number(data.Cp)) || logRafaelaCps.includes(Number(data.Cp)) || logSanNicolasCps.includes(Number(data.Cp)) ? 'disabled' : ''} 
        ${isBlocked ? 'disabled' : ''} 
        ${isLogPlaceIt ? 'disabled' : ''} 
        ${isAndesmar ? `onclick="window.open('https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data.andesmarId}', '_blank')"` : `onclick="enviarDatosAndesmar('${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenM3}, ${data.Cantidad}, '${data.medidas}', '${limpiarProducto(data.Producto)}', '${data.localidad}', '${data.Provincia}','${email}', '${recibeSinCaracteresEspeciales}')`}">
        <span id="andesmarText${data.idOperacion}">
            ${isAndesmar ? '<i class="bi bi-filetype-pdf"></i> Descargar PDF ' + data.andesmarId : '<img class="AndesmarMeli" src="Img/andesmar-tini.png" alt="Andesmar"> Etiqueta <strong>Andesmar</strong>'}
        </span>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data.idOperacion}"></span>
    </button>
    <!-- Botón Andesmar --> 

    <!-- Nuevo botón para descargar la etiqueta Mini-->
    <button class="btn btn-success mini-etiqueta-andi mb-1 ${isAndesmar ? '' : 'hidden'}" 
            id="downloadButton${data.idOperacion}" 
            style="margin-left: 2px;" 
            onclick="descargarEtiquetaMini('${limpiarNombreApellido(data.NombreyApellido || data.Recibe)}', '${data.Cp}', '${data.localidad}', '${data.Provincia}', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${limpiarProducto(data.Producto)}', '${data.idOperacion}', '${data.SKU}')" 
            ${isBlocked ? 'disabled' : ''}>
        <i class="bi bi-lightning-charge-fill"></i> Mini
    </button>
    </div>

    <!-- Botón Andreani -->
    <button class="btn ${isAndreani ? 'btn-success' : 'btn-danger'} btnAndreaniMeli" 
        id="andreaniButton${data.idOperacion}" 
        ${isAndesmar || isCDS || logBsCps.includes(Number(data.Cp)) || logStaFeCps.includes(Number(data.Cp)) || logRafaelaCps.includes(Number(data.Cp)) || logSanNicolasCps.includes(Number(data.Cp)) ? 'disabled' : ''} 
        ${isBlocked ? 'disabled' : ''} 
        ${isLogPlaceIt ? 'disabled' : ''} 
        onclick="${isAndreani ? `handleButtonClick('${data.trackingNumber}', '${data.idOperacion}')` : `enviarDatosAndreani('${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', '${data.localidad}', '${data.Provincia}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}','${email}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenCM3}, ${data.Cantidad}, '${data.medidas}', '${limpiarProducto(data.Producto)}', '${recibeSinCaracteresEspeciales}', '${data.transactionAmount}')`}">
        <span id="andreaniText${data.idOperacion}">
            ${isAndreani ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.trackingNumber}` : `<img class="AndreaniMeli" src="Img/andreani-tini.png" alt="Andreani"> Etiqueta <strong>Andreani</strong>`}
        </span>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani${data.idOperacion}" style="display:none;"></span>
    </button>
    <!-- Botón Andreani -->

    <div class="bg-Hr-primary">
    <p><i class="bi bi-tags-fill"></i> Logistica Propia</p>
    </div>

    <!-- Botón Logística Propia --> 
    <button class="mt-1 btn btnLogPropiaMeli ${isLogPropia ? 'btn-success' : 'btn-secondary'}"
        id="LogPropiaMeliButton${data.idOperacion}" 
        ${isBlocked ? 'disabled' : ''} 
        ${isLogPlaceIt ? 'disabled' : ''} 
        onclick="generarPDF('${email}', '${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenM3}, ${data.Cantidad}, '${data.medidas}', '${limpiarProducto(data.Producto)}', '${data.localidad}', '${data.Provincia}', '${recibeSinCaracteresEspeciales}')">
        <span>
            ${isLogPropia ? `<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta Novogar` : `<img class="NovogarMeli" src="Img/novogar-tini.png" alt="Novogar"> Etiqueta <strong>Novogar</strong>`}
        </span>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerLogPropia${data.idOperacion}" style="display:none;"></span>
    </button>
    <!-- Botón Logística Propia -->
    
    <div class="bg-Hr-primary">
        <p><i class="bi bi-tags-fill"></i> Repuesto Posventa</p>
    </div>

    <!-- Botón Repuesto Andreani -->
    <button class="btn ${isAndreani ? 'btn-success' : 'btn-info'} btnAndreaniMeli2 mt-1" 
            id="andreaniButton2${data.idOperacion}" 
            onclick="enviarDatosAndreani2(
                '${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', '${data.localidad}', '${data.Provincia}', '${data.idOperacion}ME1', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${email}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenCM3}, ${data.Cantidad}, '35.0x35.0x35.0', '${limpiarProducto(data.Producto)}', '${recibeSinCaracteresEspeciales}', '${data.transactionAmount}')">
        <span id="andreaniText2${data.idOperacion}">
            <img class="AndreaniMeli" src="Img/andreani-tini.png" alt="Andreani"> 
            Etiqueta Respuesto <strong>Andreani</strong>
        </span>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani2${data.idOperacion}" style="display:none;"></span>
    </button>
    <!-- Botón Repuesto Andreani -->

</div>
                
                <div id="resultado${data.idOperacion}" class="mt-2 errorMeli" style="${isBlocked || isLogPlaceIt || logBsCps.includes(Number(data.Cp)) || logStaFeCps.includes(Number(data.Cp)) || logRafaelaCps.includes(Number(data.Cp)) || logSanNicolasCps.includes(Number(data.Cp)) ? 'background-color: #d0ffd1;' : ''}">
                    ${isBlocked ? '<i class="bi bi-info-square-fill"></i> Despacho Bloqueado por Facturación, separar remito para realizar circuito' : ''}
                    ${isLogPlaceIt ? `<i class="bi bi-info-square-fill"></i> <strong>Logistica Placeit</strong> Plazo de entrega entre ${data.diasPlaceIt}` : ''}
                    ${logBsCps.includes(Number(data.Cp)) ? '<i class="bi bi-info-square-fill"></i> Logistica propia NOVOGAR Camion Buenos Aires, se ha bloqueado el despacho por logistica privada.' : ''}
                    ${logStaFeCps.includes(Number(data.Cp)) ? '<i class="bi bi-info-square-fill"></i> Logistica propia NOVOGAR Camion Santa Fe, se ha bloqueado el despacho por logistica privada.' : ''}
                    ${logRafaelaCps.includes(Number(data.Cp)) ? '<i class="bi bi-info-square-fill"></i> Logistica propia NOVOGAR Camion Rafaela, se ha bloqueado el despacho por logistica privada.' : ''}
                    ${logSanNicolasCps.includes(Number(data.Cp)) ? '<i class="bi bi-info-square-fill"></i> Logistica propia NOVOGAR Camion San Nicolás, se ha bloqueado el despacho por logistica privada.' : ''}
                    ${(logBsCps.includes(Number(data.Cp)) || logStaFeCps.includes(Number(data.Cp)) || logRafaelaCps.includes(Number(data.Cp)) || logSanNicolasCps.includes(Number(data.Cp))) ? `<button class="btn btn-sm btn-warning mt-2" id="unlockLogisticsButton${data.idOperacion}" onclick="desbloquearLogisticas('${data.idOperacion}')"><i class="bi bi-unlock-fill"></i> Desbloquear Logisticas</button>` : ''}
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

async function handleButtonClick(numeroDeEnvio, id) {
    // Mostrar spinner
    document.getElementById(`spinnerAndreani${id}`).style.display = 'inline-block';
    
    // Obtener el token de autenticación
    const token = await getAuthToken();
    if (token) {
        // Obtener la etiqueta
        await obtenerEtiqueta2(numeroDeEnvio, token, id);
    }

    // Ocultar spinner
    document.getElementById(`spinnerAndreani${id}`).style.display = 'none';
}

// Función para solicitar el número de cliente usando SweetAlert
async function solicitarCliente() {
    const { value: numeroCliente } = await Swal.fire({
        title: '¿Cuál es el número de cliente?',
        html: `
            <div class="input-container">
                <input id="numeroCliente" class="swal2-input" placeholder="Número Cliente 🧑🏻‍💻" maxlength="8" required>
                <small class="input-description">Ingresar cliente de presea (máximo 8 dígitos, solo números)</small>
            </div>
        `,
        icon: 'question',
        showCancelButton: false,
        confirmButtonText: 'Aceptar',
        customClass: {
            popup: 'macos-popup',
            input: 'macos-input',
            title: 'macos-title',
            confirmButton: 'macos-button',
        },
        didOpen: () => {
            const input = document.getElementById('numeroCliente');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    Swal.clickConfirm();
                }
            });
        },
        preConfirm: () => {
            const input = document.getElementById('numeroCliente').value;
            // Validaciones
            if (!/^\d{2,8}$/.test(input)) {
                Swal.showValidationMessage('Por favor, ingrese un cliente válido');
                return false;
            }
            return input;
        },
        allowEnterKey: true
    });

    // Si el usuario cancela, salir de la función
    if (!numeroCliente) {
        return null; // Retorna null si se cancela
    }
    return numeroCliente;
}

// Función para solicitar el número de remito usando SweetAlert
async function solicitarNumeroRemito() {
    const { value: numeroRemito } = await Swal.fire({
        title: '¿Cuál es el número de remito?',
        html: `
            <div class="input-container">
                <input id="numeroRemito" class="swal2-input" placeholder="Número de Remito" maxlength="20" required>
                <small class="input-description">Ingresar número de remito (mínimo 10 dígitos, solo números)</small>
            </div>
        `,
        icon: 'question',
        showCancelButton: false,
        confirmButtonText: 'Aceptar',
        customClass: {
            popup: 'macos-popup',
            input: 'macos-input',
            title: 'macos-title',
            confirmButton: 'macos-button',
        },
        didOpen: () => {
            const input = document.getElementById('numeroRemito');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    Swal.clickConfirm();
                }
            });
        },
        preConfirm: () => {
            const input = document.getElementById('numeroRemito').value;
            // Validaciones
            if (!/^\d{10,}$/.test(input)) {
                Swal.showValidationMessage('Por favor, ingrese un número de remito válido');
                return false;
            }
            return input;
        },
        allowEnterKey: true
    });

    // Si el usuario cancela, salir de la función
    if (!numeroRemito) {
        return null; // Retorna null si se cancela
    }
    return numeroRemito;
}

const fechaHora = new Date(); // Obtener la fecha y hora actual

function formatearFechaHora(fechaHora) {
    const dia = fechaHora.getDate();
    const mes = fechaHora.getMonth() + 1; // Los meses son 0-11
    const año = fechaHora.getFullYear();
    const horas = fechaHora.getHours();
    const minutos = fechaHora.getMinutes();
    const segundos = fechaHora.getSeconds();

    // Formatear con ceros a la izquierda
    return `${dia}/${mes}/${año}, ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

async function obtenerEtiqueta2(numeroDeEnvio, token, id) {
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

        // Crear un enlace temporal para la descarga
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `Etiqueta_Mercado_Libre_${id}.pdf`; // Nombre del archivo
        document.body.appendChild(a);
        a.click(); // Simular clic en el enlace
        document.body.removeChild(a); // Eliminar el enlace del DOM
        buttonCDS.onclick = () => window.open(pdfUrl, '_blank');
    } catch (error) {
        console.error('Error al obtener la etiqueta:', error);
    }
}

async function enviarDatosCDS(id, NombreyApellido, Cp, localidad, Provincia, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, email, observaciones, peso, volumenCM3, cantidad, medidas, Producto, recibe, valor) {

    console.log('Parámetros enviados a enviarDatosCDS:');
    console.log({
        id,
        NombreyApellido,
        Cp,
        localidad,
        Provincia,
        idOperacion,
        calleDestinatario,
        alturaDestinatario,
        telefonoDestinatario,
        observaciones,
        peso,
        volumenCM3,
        cantidad,
        medidas,
        Producto,
        email,
        recibe
    });
    console.log("Iniciando Generación de Etiqueta CDS:");

    // Obtener los valores necesarios
    const volumenTotalcds = volumenCM3 || 0;
    const pesoCds = peso;
    const codigoPostalCds = Cp;
    const localidadCds = localidad;
    const valorCds = 999999;
    const queEntregaCds = "E";
    const documentoCds = id;
    const nombreCds = NombreyApellido;
    const telefonoCds = telefonoDestinatario;
    const emailCds = email;
    const domicilioCds = calleDestinatario + ' ' + alturaDestinatario;

    let totalBultosCds = cantidad; // Asumiendo que cantidad es total de bultos

    // Dividir medidas para obtener alto, ancho y largo
    const productoLowerCase = Producto.toLowerCase();

    const cantidadFinal = productoLowerCase.includes("split") || productoLowerCase.includes("18000")|| productoLowerCase.includes("balanceado") ? cantidad * 2 : cantidad;
    
    const buttonCDS = document.getElementById(`CDSButton${id}`);
    const spinner = document.getElementById(`spinnerCDS${id}`);
    const text = document.getElementById(`CDSText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioStateCDS = document.getElementById(`estadoEnvio${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);
    const botonAndesmar = document.getElementById(`andesmarButton${id}`);
    const botonAndreani = document.getElementById(`andreaniButton${id}`);

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    const remitoCliente = await solicitarNumeroRemito();
    if (!cliente) return; 
    if (!remitoCliente) return; 

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';

    botonAndesmar.classList.add('disabled');
    botonAndreani.classList.add('disabled');

    buttonCDS.disabled = true;

    const referenciaCds = documentoCds;
    const buttonId = `CDSButton${id}`;

    const urlCds = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/NuevaCotXVolEntregaYDespacho?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&volumen=${volumenTotalcds}&peso=${pesoCds}&codigopostal=${codigoPostalCds}&localidad=${localidadCds}&valor=${valorCds}&contrareembolso=&items=&despacharDesdeDestinoSiTieneAlmacenamiento=&queentrega=${queEntregaCds}&quevia=T&documento=${documentoCds}&nombre=${nombreCds}&telefono=${telefonoCds}&email=${emailCds}&domicilio=${domicilioCds}&bultos=${cantidadFinal}&referencia=${referenciaCds}&textosEtiquetasBultos&textoEtiquetaDocumentacion&devolverDatosParaEtiquetas=N`;

    const optionsCds = {
        method: 'GET',
        headers: {
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
        }
    };

    try {
        const responseCds = await fetch(urlCds, optionsCds);
        const dataCds = await responseCds.json();
        console.log(dataCds); // Para depuración

        // Manejo de la respuesta
        if (dataCds.Respuesta[0].Estado === 0) {
            const numeroCotizacionCds = dataCds.Respuesta[0].NumeroCotizacion;
            const nicCds = dataCds.Respuesta[0].NIC;

            // Actualizar el botón con el NIC
            const buttonElement = document.getElementById(buttonId);
            if (buttonElement) {
                buttonElement.innerHTML = `
                    Orden NIC-${nicCds} <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                `;
                buttonElement.disabled = true; // Mantener el botón deshabilitado
                buttonCDS.classList.remove('btn-dark-blue');
                buttonCDS.classList.add('btn-secondary');
            }

            // Llamar a la API para descargar la etiqueta
            await descargarEtiqueta(numeroCotizacionCds, nicCds, buttonId);
            buttonCDS.classList.remove('btn-secondary');
            buttonCDS.classList.add('btn-success');

            const trackingLink = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${nicCds}`;
            NroEnvio.innerHTML = `<a href="${trackingLink}" target="_blank">CDS: NIC-${nicCds} <i class="bi bi-box-arrow-up-right"></i></a>`;

            // Cambiar el estado del envío
            if (envioStateCDS) {
                envioStateCDS.className = 'em-circle-state2';
                envioStateCDS.innerHTML = `Envio Preparado`;
            }

        const nombre = NombreyApellido
        const remito = idOperacion.replace(/ME1$/, '');
        const Name = `Confirmación de envio Mercado Libre`;
        const Subject = `Tu compra en Novogar ${remitoCliente} ya fue preparada para despacho con Cruz del Sur`;
        const template = "emailTemplateAndreani";
        const linkSeguimiento2 = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${nicCds}`;
        const transporte = "Cruz del Sur";
        const numeroDeEnvio = `NIC-${nicCds}`;
        const email = emailCds

        await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);
        console.log(`Email enviado a ${email} con el remito ${remitoCliente} y número de envío ${numeroDeEnvio}`);
            // Guardar en Firebase
    const trackingMessage = `¡Hola, ${NombreyApellido || recibe}!

    ¡Buenas noticias! 🎉  Tu producto ya está listo para ser enviado con CRUZ DEL SUR. 📦  

    Recordá que la fecha de entrega es aproximada, así que puede que lo recibas antes. 🚚📲 Estate atento a tu teléfono ya que estaremos en contacto para asegurarnos de que la entrega sea exitosa.

    ✅ Acá te dejamos tu número de seguimiento: ${trackingLink}.  

    ¡Esperamos que disfrutes tu compra!

    Estamos a tu disposición.

    Equipo Posventa Novogar`;

        const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');
    
        firebase.database().ref('envios/' + idOperacionSinME1).update({
            trackingNumber: nicCds,
            trackingLink: trackingLink,
            trackingMessage: trackingMessage,
            transportCompany: "Cruz del Sur",
            cliente: cliente,
            cotizacionCDS: numeroCotizacionCds
        }).then(() => {
            console.log(`Datos actualizados en Firebase para la operación: ${idOperacionSinME1}`);
        
            // Agregar datos a "DespachosLogisticos"
            const fechaHoraFormateada = formatearFechaHora(fechaHora); 
        
            firebase.database().ref(`DespachosLogisticos/${remitoCliente}`).set({
                cliente: cliente,
                estado: "Pendiente de despacho",
                fechaHora: fechaHoraFormateada,
                operadorLogistico: "Pendiente",
                remito: remitoCliente,
                remitoVBA: remitoCliente,
                valorDeclarado: valor 
            }).then(() => {
                console.log(`Datos actualizados en DespachosLogisticos para el remito: ${remitoCliente}`);
            }).catch(error => {
                console.error('Error al actualizar en DespachosLogisticos:', error);
            });
        
        }).catch(error => {
            console.error('Error al actualizar en Firebase:', error);
        });           
        } else {
            // Manejo de otros estados de error
            botonAndesmar.classList.remove('disabled');
            botonAndreani.classList.remove('disabled');
            console.error("Error en la respuesta:", dataCds);
            buttonCDS.classList.remove('btn-dark-blue');
            buttonCDS.classList.add('btn-danger', 'disabled');
            spinner.style.display = 'none';
            text.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Error al generar Etiqueta';
            resultadoDiv.innerText = `Error: ${dataCds.Respuesta[0].Descripcion}`; 
        }
    } catch (error) {
        botonAndesmar.classList.remove('disabled');
        botonAndreani.classList.remove('disabled');
        console.error("Error al crear la cotización:", error);
        document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al crear la cotización. Por favor, intenta nuevamente.";
        buttonCDS.classList.remove('btn-dark-blue');
        buttonCDS.classList.add('btn-danger', 'disabled');
        spinner.style.display = 'none';
        text.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Error al generar Etiqueta';
        resultadoDiv.innerText = `Error: ${error.message}`;
    }
}

async function descargarEtiqueta(numeroCotizacionCds, nicCds, buttonId) {
    console.log("Parámetros enviados a descargarEtiqueta:");
    console.log("Cotización CDS:", numeroCotizacionCds);
    console.log("Número de seguimiento:", nicCds);
    console.log("ID de operación:", buttonId);

    const buttonElement = document.getElementById(buttonId);

    const urlEtiquetaCds2 = `https://proxy.cors.sh/https://api-ventaenlinea.cruzdelsur.com/api/EtiquetasPDF?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&id=${numeroCotizacionCds}&tamanioHoja=2&posicionArrancar=1&textoEspecialPorEtiqueta=`;

    const optionsEtiquetaCds = {
        method: 'GET',
        headers: {
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
        }
    };

    try {
        const responseEtiquetaCds2 = await fetch(urlEtiquetaCds2, optionsEtiquetaCds);
        if (!responseEtiquetaCds2.ok) throw new Error('Error en la respuesta de la API');

        const blobCds2 = await responseEtiquetaCds2.blob();
        const urlCds2 = window.URL.createObjectURL(blobCds2);

        // Crear un enlace temporal para descargar el archivo con el nombre correcto
        const a = document.createElement('a');
        a.href = urlCds2;
        a.download = `Etiqueta NIC-${nicCds}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlCds2);

        // Actualizar el botón para indicar que la etiqueta está lista para descargar
        if (buttonElement) {
            buttonElement.innerHTML = `
                <i class="bi bi-filetype-pdf" style="margin-right: 8px;"></i> Descargar PDF NIC-${nicCds}
            `;
            buttonElement.disabled = false; // Habilitar el botón
            buttonElement.onclick = () => descargarEtiqueta(numeroCotizacionCds, nicCds, buttonId); // Reasignar el onclick
        }

    } catch (error) {
        console.error("Error al descargar la etiqueta:", error);
        if (document.getElementById("errorResponseCruzDelSur")) {
            document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al descargar la etiqueta. Por favor, intenta nuevamente.";
        }
        // Volver a habilitar el botón en caso de error
        if (buttonElement) {
            buttonElement.disabled = false;
        }
    }
}

// GENERAR ETIQUETA LOGISTICA PROPIA
async function descargarEtiquetaMini(NombreyApellido, Cp, localidad, provincia, calleDestinatario, alturaDestinatario, telefonoDestinatario, producto, idOperacion, SKU) {

    const { jsPDF } = window.jspdf;

    spinner2.style.display = "flex";

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
    const barcodeApiUrl = `https://proxy.cors.sh/https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(idOperacionFinal2)}&code=Code128&dpi=96`;

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
                border: 2px dashed #294888;
                flex-direction: column;
                align-items: center;
            }
            .logo img {
                max-width: 250px;
                height: auto;
                margin-bottom: 5px;
            }
            .campo {
                width: 100%;
                border-radius: 10px;
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                padding: 5px;
                border: 1px solid #294888;
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
                border: 2px dashed #294888;
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
            </style>
        </head>
        <body>
        <div class="etiqueta">
            <div class="logo">
                <img src="./Img/Novogar-andesmar.png" alt="Logo">
            </div>
            <div class="campo uppercase"><span>${NombreyApellido || recibe}</span></div>
            <div class="campo"><span>${Cp}, ${localidad}, ${provincia}</span></div>
            <div class="campo uppercase"><span>${calleDestinatario} ${alturaDestinatario}</span></div>
            <div class="campo"><span>Teléfono: ${telefonoDestinatario}</span></div>
            <div class="campo"><span>${SKU} ${productoLimitado}</span></div>
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

            window.open(pdfUrl, '_blank');
        });

        document.body.removeChild(tempDiv);
    };

    reader.readAsDataURL(blob);
}
// FIN GENERAR ETIQUETA LOGISTICA PROPIA

const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

// Función para enviar datos a la API de Andesmar
async function enviarDatosAndesmar(id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, Medidas, Producto, localidad, provincia, email, recibe) {
    
    console.log({
        id,
        NombreyApellido,
        Cp,
        idOperacion,
        calleDestinatario,
        alturaDestinatario,
        telefonoDestinatario,
        observaciones,
        peso,
        volumenM3,
        cantidad,
        Medidas,
        Producto,
        localidad,
        provincia,
        email,
        recibe
    });

    const resultadoDiv = document.getElementById(`resultado${id}`);
    const botonCDS = document.getElementById(`CDSButton${id}`);
    const button = document.getElementById(`andesmarButton${id}`);
    const spinner = document.getElementById(`spinnerAndesmar${id}`);
    const text = document.getElementById(`andesmarText${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);

    // Eliminar el prefijo "200000" del idOperacion
    const idOperacionFinal = idOperacion.replace(/^20000[0-9]/, '');

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    if (!cliente) return; // Si se cancela, salir de la función

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';

    buttonAndr.disabled = true;
    botonCDS.disabled = true;

    // Dividir medidas para obtener alto, ancho y largo
    const productoLowerCase = Producto.toLowerCase();

    const [largo, ancho, alto] = Medidas.split('x').map(Number);
    const cantidadFinal = productoLowerCase.includes("split") || productoLowerCase.includes("18000")|| productoLowerCase.includes("balanceado") ? cantidad * 2 : cantidad;

    // Verificar el código postal y definir la unidad de venta
    const unidadVenta = [3500, 3100, 3400].includes(parseInt(Cp))
        ? "CARGAS LOG RTO C Y SEGUIMIENTO"
        : "cargas remito conformado";
        
    // Definir los datos que se enviarán a la API
    const requestObj = {
        CalleRemitente: "Mendoza", // Reemplaza con el valor correcto
        CalleNroRemitente: "2799", // Reemplaza con el valor correcto
        CodigoPostalRemitente: "2000", // Reemplaza con el valor correcto
        NombreApellidoDestinatario: NombreyApellido || recibe,
        CodigoPostalDestinatario: Cp,
        CalleDestinatario: calleDestinatario,
        CalleNroDestinatario: alturaDestinatario,
        TelefonoDestinatario: telefonoDestinatario,
        MailDestinatario: email,
        NroRemito: idOperacionFinal,
        Bultos: cantidadFinal,
        Peso: peso,
        ValorDeclarado: 100,
        M3: volumenM3,
        Alto: Array(cantidadFinal).fill(alto),
        Ancho: Array(cantidadFinal).fill(ancho),
        Largo: Array(cantidadFinal).fill(largo),
        Observaciones: observaciones + Producto,
        ModalidadEntrega: "Puerta-Puerta",
        UnidadVenta: unidadVenta,
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
        console.log(`Datos Respuesta API Andesmar (MELI ${idOperacionFinal}):`, data);
        
        if (data.NroPedido) {
            const trackingLinkAndesmar = `https://andesmarcargas.com/seguimiento.html?numero=${idOperacionFinal}&tipo=remito&cod=`;

            const trackingMessage = `¡Hola, ${NombreyApellido || recibe}!

            ¡Buenas noticias! 🎉  Tu producto ya está listo para ser enviado con ANDESMAR CARGAS. 📦  

            Recordá que la fecha de entrega es aproximada, así que puede que lo recibas antes. 🚚📲 Estate atento a tu teléfono ya que estaremos en contacto para asegurarnos de que la entrega sea exitosa.

            ✅ Acá te dejamos tu número de seguimiento: ${trackingLinkAndesmar}.  

            ¡Esperamos que disfrutes tu compra!

            Estamos a tu disposición.

            Equipo Posventa Novogar`;

            const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');
            
            firebase.database().ref('envios/' + idOperacionSinME1).update({
                trackingNumber: idOperacionFinal,
                trackingLink: trackingLinkAndesmar,
                trackingMessage: trackingMessage,
                transportCompany: "Andesmar",
                cliente: cliente,
                andesmarId: data.NroPedido
            }).then(() => {
                console.log(`Datos actualizados en Firebase para la operación: ${idOperacion}`);
            }).catch(error => {
                console.error('Error al actualizar en Firebase:', error);
            });

            // Usar la base de datos del segundo proyecto
            const nuevaEntradaRef = database2.ref('enviosAndesmar').push();

            // Almacenar en Firebase
            nuevaEntradaRef.set({         
                nombreApellido: NombreyApellido,
                nroPedido: data.NroPedido,
                codigoPostal: Cp,
                localidad: `${localidad}, ${provincia}`,
                calleDelDestinatario: calleDestinatario,
                numeroDeCalle: alturaDestinatario,
                telefono: telefonoDestinatario,
                remito: idOperacionFinal,
                cotizacion: "$ 10.000"
            }).then(() => {         
                console.log("Entrada agregada correctamente.");
            }).catch((error) => {
                console.error("Error al agregar entrada a Firebase:", error);
            });

            const nombre = NombreyApellido
            const Name = `Confirmación de Envio Mercado Libre`;
            const Subject = `Tu compra en Novogar ${idOperacionSinME1} ya fue preparada para despacho por Andesmar Cargas`;
            const template = "emailTemplateAndesmar";
            const transporte = "Andesmar Cargas";
            const linkSeguimiento2 = `https://andesmarcargas.com/seguimiento.html?numero=${idOperacionFinal}&tipo=remito&cod=`;

            // Enviar el email después de procesar el envío
            const remito = idOperacionFinal
            await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte);

            // Mostrar el botón de descarga
            const link = `https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            text.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.onclick = () => window.open(link, '_blank'); 

            window.open(link, '_blank'); 

            // Mostrar el botón Mini
            const miniButton = document.getElementById(`downloadButton${id}`);
            miniButton.classList.remove('hidden');

            NroEnvio.innerHTML = `<a href="https://andesmarcargas.com/seguimiento.html?numero=${idOperacionFinal}&tipo=remito&cod=" target="_blank">Andesmar: ${idOperacionFinal} <i class="bi bi-box-arrow-up-right"></i></a>`;
            spinner.style.display = 'none';
            if (envioState) {
                envioState.className = 'em-circle-state2';
                envioState.innerHTML = `Envio Preparado`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }

            setTimeout(() => {
                miniButton.click(); 
            }, 2000);
        } else {
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
            buttonAndr.disabled = false;
            botonCDS.disabled = false;
            spinner.style.display = 'none';
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        text.innerHTML = `Error en el envío <i class="bi bi-exclamation-circle-fill"></i>`;
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
        buttonAndr.disabled = false;
        botonCDS.disabled = false;
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

async function enviarDatosAndreani(id, NombreyApellido, Cp, localidad, Provincia, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, email, observaciones, peso, volumenCM3, cantidad, medidas, Producto, recibe, valor) 
{    
    const botonCDS = document.getElementById(`CDSButton${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const spinnerAndr = document.getElementById(`spinnerAndreani${id}`);
    const textAndr = document.getElementById(`andreaniText${id}`);
    const resultadoDivAndr = document.getElementById(`resultado${id}`);
    const envioStateAndr = document.getElementById(`estadoEnvio${id}`);
    const button = document.getElementById(`andesmarButton${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);

    console.log('Parámetros enviados a enviarDatosAndreani:');
    console.log({
        id,
        NombreyApellido,
        Cp,
        localidad,
        Provincia,
        idOperacion,
        calleDestinatario,
        alturaDestinatario,
        telefonoDestinatario,
        observaciones,
        peso,
        volumenCM3,
        cantidad,
        medidas,
        Producto,
        email,
        recibe,
        valor,
    });

    // Eliminar el prefijo "200000" del idOperacion
    const idOperacionFinalAndreani = idOperacion.replace(/^20000[0-9]/, '');

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    if (!cliente) return; // Si se cancela, salir de la función

    // Mostrar spinner y cambiar texto
    spinnerAndr.style.display = 'inline-block';
    textAndr.innerText = 'Generando Etiqueta...';

    button.disabled = true;
    botonCDS.disabled = true;
    buttonAndr.disabled = true;

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
const cantidadFinal = productoLowerCase.includes("split") || 
                      productoLowerCase.includes("18000") || 
                      productoLowerCase.includes("balanceado") ? 
                      cantidad * 2 : cantidad;

// Desestructurar las medidas y convertir a número
const [largoAnd, anchoAnd, altoAnd] = medidas.split('x').map(Number);

// Crear los bultos
for (let i = 0; i < cantidadFinal; i++) {
    bultos.push({
        "kilos": pesoTotal,
        "largoCm": largoAnd,
        "altoCm": altoAnd,
        "anchoCm": anchoAnd,
        "volumenCm": volumenTotal,
        "valorDeclaradoSinImpuestos": valor / 1.21,
        "valorDeclaradoConImpuestos": valor,
        "referencias": [
            { "meta": "detalle", "contenido": Producto },
            { "meta": "idCliente", "contenido": (idOperacionFinalAndreani + "-MELI").toUpperCase() },
            { "meta": "observaciones", "contenido": observaciones }
        ]
    });
}

    const requestData = {
        "contrato": volumenCM3 > 100000 ? "351003637" : "400017259",
        "idPedido": (idOperacionFinalAndreani + "-MELI").toUpperCase(),
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
            "nombreCompleto": NombreyApellido || recibe,
            "email": email,
            "documentoTipo": "CUIT",
            "documentoNumero": "30685437011",
            "telefonos": [{ "tipo": 1, "numero": telefonoDestinatario }]
        }],
        "remito": {
            "numeroRemito": (idOperacionFinalAndreani + "-MELI").toUpperCase(),
        },
        "bultos": bultos
    };

    console.log(`Datos enviados a API ANDREANI (MELI ${idOperacionFinalAndreani}):`, requestData);

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

            console.log(`Datos Respuesta API ANDREANI (MELI ${idOperacionFinalAndreani}):`, response);
            // Mostrar el número de envío
            NroEnvio.innerHTML = `<a href="https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${numeroDeEnvio}" target="_blank">Andreani: ${numeroDeEnvio} <i class="bi bi-box-arrow-up-right"></i></a>`;
            const trackingLink = `https://andreani.com/#!/informacionEnvio/${numeroDeEnvio}`

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
    const trackingMessage = `¡Hola, ${NombreyApellido || recibe}!

    ¡Buenas noticias! 🎉  Tu producto ya está listo para ser enviado con CORREO ANDREANI. 📦  

    Recordá que la fecha de entrega es aproximada, así que puede que lo recibas antes. 🚚📲 Estate atento a tu teléfono ya que estaremos en contacto para asegurarnos de que la entrega sea exitosa.

    ✅ Acá te dejamos tu número de seguimiento: ${trackingLink}.  

    ¡Esperamos que disfrutes tu compra!

    Estamos a tu disposición.

    Equipo Posventa Novogar`;

        const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');
    
        firebase.database().ref('envios/' + idOperacionSinME1).update({
            trackingNumber: numeroDeEnvio,
            trackingLink: trackingLink,
            trackingMessage: trackingMessage,
            cliente: cliente,
            transportCompany: "Andreani"
        }).then(() => {
            console.log(`Datos actualizados en Firebase para la operación: ${idOperacionFinalAndreani}`);
        }).catch(error => {
            console.error('Error al actualizar en Firebase:', error);
        });    

        const nombre = NombreyApellido
        const remito = idOperacion.replace(/ME1$/, '');
        const Name = `Confirmación de envio Mercado Libre`;
        const Subject = `Tu compra en Novogar ${remito} ya fue preparada para despacho con Andreani`;
        const template = "emailTemplateAndreani";
        const linkSeguimiento2 = `https://andreani.com/#!/informacionEnvio/${numeroDeEnvio}`;
        const transporte = "Correo Andreani";

        await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);

        // Llamar a la API para obtener la etiqueta
        await obtenerEtiqueta(numeroDeEnvio, token, buttonAndr);

        buttonAndr.disabled = false;

        } else {
            console.error('Error al generar la etiqueta:', response.statusText);
            buttonAndr.innerText = "Error ⚠️"; 
            resultadoDivAndr.innerText = `Error: ${error.message}`; 
            button.disabled = false;
            buttonAndr.disabled = true;
            botonCDS.disabled = false;
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);
        buttonAndr.innerText = "Error Andreani ⚠️"; 
        button.disabled = false;
        botonCDS.disabled = false;
        buttonAndr.disabled = true;
        resultadoDivAndr.innerText = `Error Andreani: (Puede No existir el CP o Localidad en Andreani) ${error.message}`; 
    }
}

async function enviarDatosAndreani2(id, NombreyApellido, Cp, localidad, Provincia, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, email, observaciones, peso, volumenCM3, cantidad, medidas, Producto, recibe, valor) 
{    
    const buttonAndr = document.getElementById(`andreaniButton2${id}`);
    const spinnerAndr = document.getElementById(`spinnerAndreani2${id}`);
    const textAndr = document.getElementById(`andreaniText2${id}`);
    const resultadoDivAndr = document.getElementById(`resultado${id}`);

    console.log('Parámetros enviados a enviarDatosAndreani:');
    console.log({
        id,
        NombreyApellido,
        Cp,
        localidad,
        Provincia,
        idOperacion,
        calleDestinatario,
        alturaDestinatario,
        telefonoDestinatario,
        observaciones,
        peso,
        volumenCM3,
        cantidad,
        medidas,
        Producto,
        email,
        recibe,
        valor,
    });

    // Eliminar el prefijo "200000" del idOperacion
    const idOperacionFinalAndreani = idOperacion.replace(/^20000[0-9]/, '');

    // Mostrar spinner y cambiar texto
    buttonAndr.disabled = true;
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

// Convertir Producto a minúsculas para la verificación
const productoLowerCase = Producto.toLowerCase();

// Determinar la cantidad a usar
const cantidadFinal = productoLowerCase.includes("split") || 
                      productoLowerCase.includes("18000") || 
                      productoLowerCase.includes("balanceado") ? 
                      cantidad * 2 : cantidad;

// Desestructurar las medidas y convertir a número
const [largoAnd, anchoAnd, altoAnd] = medidas.split('x').map(Number);

// Crear los bultos
for (let i = 0; i < cantidadFinal; i++) {
    bultos.push({
        "kilos": pesoTotal,
        "largoCm": largoAnd,
        "altoCm": altoAnd,
        "anchoCm": anchoAnd,
        "volumenCm": volumenTotal,
        "valorDeclaradoSinImpuestos": valor / 1.21,
        "valorDeclaradoConImpuestos": valor,
        "referencias": [
            { "meta": "detalle", "contenido": Producto },
            { "meta": "idCliente", "contenido": (idOperacionFinalAndreani + "-MELI").toUpperCase() },
            { "meta": "observaciones", "contenido": observaciones }
        ]
    });
}

    const requestData = {
        "contrato": "400017259",
        "idPedido": (idOperacionFinalAndreani + "-MELI").toUpperCase(),
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
            "nombreCompleto": NombreyApellido || recibe,
            "email": email,
            "documentoTipo": "CUIT",
            "documentoNumero": "30685437011",
            "telefonos": [{ "tipo": 1, "numero": telefonoDestinatario }]
        }],
        "remito": {
            "numeroRemito": (idOperacionFinalAndreani + "-MELI").toUpperCase(),
        },
        "bultos": bultos
    };

    console.log(`Datos enviados a API ANDREANI (MELI ${idOperacionFinalAndreani}):`, requestData);

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

            console.log(`Datos Respuesta API ANDREANI (MELI ${idOperacionFinalAndreani}):`, response);

            const mensajeClipboard = `Hola ${NombreyApellido.toUpperCase()}, hemos preparado el envío de tu repuesto a través de Correo Andreani. El número de envío generado es ${numeroDeEnvio}. Podrás seguirlo dentro de las próximas 24 horas hábiles ingresando al siguiente enlace: andreani.com/#!/informacionEnvio/${numeroDeEnvio} ¡Gracias por confiar en nosotros! Equipo Posventa Novogar`;

            // Configurar el botón de descarga inicial
            textAndr.innerHTML = `Orden ${numeroDeEnvio}`;
            buttonAndr.classList.remove('btn-info');
            buttonAndr.classList.add('btn-secondary');

            navigator.clipboard.writeText(mensajeClipboard).then(() => {
                console.log('Mensaje copiado al portapapeles:', mensajeClipboard);
                showAlert(`Mensaje copiado al portapapeles: ${mensajeClipboard}`);
            }).catch(err => {
                console.error('Error al copiar el mensaje:', err);
            });            
        
        // Llamar a la API para obtener la etiqueta
        await obtenerEtiqueta(numeroDeEnvio, token, buttonAndr);

        buttonAndr.disabled = false;

        } else {
            console.error('Error al generar la etiqueta:', response.statusText);
            buttonAndr.classList.remove('btn-info');
            buttonAndr.innerText = "Error ⚠️"; 
            resultadoDivAndr.innerText = `Error: ${error.message}`; 
            buttonAndr.classList.add('btn-danger');
            buttonAndr.disabled = true;
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);
        buttonAndr.classList.remove('btn-info');
        buttonAndr.innerText = "Error Andreani ⚠️"; 
        buttonAndr.classList.add('btn-danger');
        resultadoDivAndr.innerText = `Error Andreani: (Puede No existir el CP o Localidad en Andreani) ${error.message}`; 
        buttonAndr.disabled = true;
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

        buttonAndr.href = pdfUrl;
        buttonAndr.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${numeroDeEnvio}`;
        buttonAndr.classList.remove('btn-warning');
        buttonAndr.classList.add('btn-success');
        window.open(pdfUrl, '_blank');
    } catch (error) {
        console.error('Error al obtener la etiqueta:', error);
        buttonAndr.innerText = "Error en Etiquetado ⚠️";
        resultadoDivAndr.innerText = `Error: ${error.message}`;
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
    4168, 4178, 2000, 6002, 6000, 5220,
];

// QUERY DE DATOS MELI

    const celularesArray = ["A54-GRIS", "ALEL23BLRET", "SM-A500", "SMG-318ML", "L435", "SM-A300MZK", "SMG-357MZAAR", "S388", "SM-J415-DORADO", "LG-K22-GRIS", "XT-2095-GRIS", "SM-G715-NEGRO", "AXSII", "A6", "SM-J111-BLANCO", "SM-J200-BLANCO", "SM-J200-NEGRO-INACTIVO", "SM-J700-BLANCO", "SM-J320-BLANCO", "SM-J320-NEGRO", "PIXI3", "Y625-NEGRO", "SM-J510-BLANCO", "SM-J510-NEGRO", "SM-J710-NEGRO", "G935-DORADO", "XT1542", "SM-J610-ROJO", "N-4513", "SM-J111-NEGRO", "SM-J710-BLANCO-INACTIVO", "LGH735", "G935-NEGRO", "LGH440", "SM-J710-BLANCO", "SM-J200-NEGRO", "SM-J105-BLANCO", "VIBE-K5", "Y6-NEGRO", "SM-J510-DORADO", "SM-J710-DORADO", "SM-G532-NEGRO", "LG-H815-NEGRO", "LG-H815-DORADO", "LGH635-TITANIUM", "ALEL23NERET", "V6-GOLD", "V6-SILVER", "X2-BLANCO", "X2-NEGRO", "X5-SILVER", "LUAL03BLRET", "LUAL03NERET", "N5034SWOS", "N5514DWOS", "LG-K220", "LG-K350", "N5034SBOS", "V6-SILVER-CROJO", "V6-SILVER-CNEGR", "SM-G532-PLATA", "LG-K120", "LG-M250", "XT-1601", "XT-1621", "XT-1680", "SM-G950-NEGRO", "SM-G950-DORADO", "SM-G955-NEGRO", "SM-G955-GRIS", "SM-G955-PLATA", "SM-G532-DORADO", "LG-X240", "XT-1670", "XT-1725", "XT-1772", "SM-J701NEO-DOR", "SM-J701NEO-NEG", "SM-G610-BLANCO", "XT-1725-DORADO", "XT-1772-AZUL", "XT-1772-DORADO", "XT-1756", "XT-1800-DORADO", "XT-1800-GRIS", "XT-1725-NEGRO", "SM-J701NEO-PLAT", "SM-G570-NEGRO", "SM-J400-DORADO", "XT-1922-AZUL", "XT-1941-NEGRO", "XT-1926-6-AZUL", "XT-1922-DORADO", "SM-G570-DORADO", "COMBO-MOTOROLA", "N5044DPOS-ROS", "SM-G9600-PURPLE", "XT-1924-DORADO", "SM-J600-DORADO", "SM-G610-NEGRO", "5033A", "XT-1924-GRIS", "XT-1920-DORADO", "XT-1920-NEGRO", "N5044DWOS-BL", "N5044DBOS-NE", "SM-J400-NEGRO", "SM-J400-VIOLETA", "SM-J600-NEGRO", "SM-J260-NEGRO", "SM-J260-VIOLETA", "XT-1941-BLANCO", "SM-J260-DORADO", "XT-1962-NEGRO", "SM-A750-NEGRO", "SM-A750-DORADO", "SM-J610-GRIS", "SM-J610-NEGRO", "SM-J415-NEGRO", "SM-J415-ROSA", "SM-J410-DORADO", "SM-J410-NEGRO", "XT-1965-INDIGO", "XT-1955-AZUL", "BOMBA-CELULAR", "SM-A920-NEGRO", "SM-A920-AZUL", "SM-A920-ROSA", "XT-1962-BLANCO", "T1-NEGRO", "SM-A305-AZUL", "XT-2053ESP-ROJO", "XT-1955-VIOLETA", "SM-A305-BLANCO", "XT-1944-DORADO", "XT-1952-INDIGO", "XT-1944-GRIS", "XT-2019-BLUE", "XT-2025ESP-AZUL", "XT-2015-MAGENTA", "XT-2063-256GB", "XT-2025-GRAFITO", "XT-2025ESPECIAL", "SM-A205-AZUL", "SM-A105-AZUL", "XT-2025-CHERRY", "SM-A105-NEGRO", "SM-A205-NEGRO", "SM-A305-NEGRO", "XT-2025ESP-ARRA", "XT-2029-NEGRO", "XT-2029-AZUL", "XT-2027-VIOLETA", "LG-K50S", "SM-A307-NEGRO", "XT-2015-GREY", "SM-A025-NEGRO", "XT-2041-AZUL", "XT-2019-PINK", "XT-2041-GRIS", "SM-A107-AZUL", "T1-GRIS", "T1-AZUL", "LG-K9", "XT-2087-AZUL", "XT2203-GRIS", "SM-A107-NEGRO", "L1-NEGRO", "TA-1115-CARBON", "TA-1112-NEGRO", "TA-1179-ACERO", "XT-2053ESP-R", "XT-2053-ROJO", "XT-2055-AZUL", "A3-LITE", "XT-2063-ROJO", "XT-2045-BLANCO", "XT-2073-AZUL", "XT-2053-AZUL", "LG-K22+AZUL", "LG-K20", "SM-A515-BLANCO", "XT-2073-ESMERA", "XT-2083-AZUL", "SM-A013-NEGRO", "SM-A015-NEGRO", "SM-A115-BLANCO", "SM-A217-AZUL", "SM-A315-NEGRO", "SM-A115-NEGRO", "SM-A217-NEGRO", "SM-A315-BLANCO", "A5-PLUS", "LG-Q60", "SM-A515-NEGRO", "XT-2063-256GB-G", "SM-A015-AZUL", "SM-A217-BLANCO", "SM-A315-AZUL", "SM-A715-NEGRO", "SM-A715-PLATA", "XT-2081-NARANJA", "XT-2083-ROSA", "XT-2073-ESMERA", "XT-2081-AZUL", "SM-A115-BLUE", "SM-G780-LAVANDA", "XT-2087-ROSA", "XT-2053-ROSA", "SM-A013-BLUE", "SM-A207-NEGRO", "SM-A207-AZUL", "SM-A307-BLANCO", "XT-2091-MORADO", "XT-2053-GRIS", "XT-2053ESP-AZUL", "XT-2095-AZUL", "XT-2091-VERDE", "XT-2055-TURQUES", "XT-2095-ROSA", "SM-A022-64GB-NE", "SM-A022-NEGRO", "SM-A022-AZUL", "SM-A125-NEGRO", "SM-A025-AZUL", "SM-A217-128-NEG", "TCL-L7+", "TCL-TPRO", "SM-A125-AZUL", "SM-A217-128-BLA", "XT-2053FIJIROSA", "TCL-L10LITE", "LG-K22+GRIS", "LG-K22-AZUL", "XT-2129-GRIS", "COMBO-L1-NEGRO", "SM-A525-AZUL", "SM-A325-NEGRO", "SM-A725-VIOLETA", "XT-2125-VERDE", "SM-A525-BLANCO", "SM-A725-NEGRO", "XT-2129-LILA", "SM-A336-AZUL", "SM-A217-128-AZU", "SM-A325-AZUL", "SM-A235-BLANCO", "XT-2053FIJIGRIS", "LG-K41S-GRIS", "SM-G780-BLUE", "SM-M127-NEGRO", "XT-2097-NARANJA", "XT-2128-AZUL", "SM-M127-AZUL", "SM-A325-BLANCO", "XT-2097-AZUL", "TCL-20E", "SM-A525-NEGRO", "SM-G780-GREEN", "XT-2128-ROSA", "SM-A125-128-NEG", "SM-A225-NEGRO", "TCL-L10+", "TCL-20SE-VERDE", "TCL-20Y-AZUL", "TCL-20E-128-VER", "SM-A225-BLANCO", "SM-A225-VERDE", "XT-2133-AQUA", "SM-A725-BLANCO", "L1PRO-GRIS", "XT-2155-AZUL", "SM-A037-NEGRO", "SM-A127-128-NEG", "SM-A127-64-AZUL", "SM-A127-64-NEG", "XT-2125-AZUL", "XT-2128-128-AZU", "TCL-10SE", "TCL-20E-128-AZU", "TCL-20SE-256GB", "TCL-20SE-GRIS", "TCL-L9S", "XT-2139-VERDE", "XT-2159-ROSA", "SM-A032-AZUL", "XT-2128-128-VER", "XT-2159-GRIS", "SM-A525-VIOLETA", "XT-2133-AZUL", "XT-2139-GRIS", "XT-2155-GRAFITO", "XT-2153-BLANCO", "TCL-20Y-NEGRO", "SM-M236-VERDE", "SM-A032-NEGRO", "TCL-20B-MORADO", "TCL-20B-GRIS", "XT-2153-AZUL", "SM-A528-NEGRO", "5033MR", "6025A", "A50UNS", "SM-A035-NEGRO", "SM-A226-GRIS", "SM-A035-32GB-AZ", "SM-A536-NEGRO", "XT-2171-DORADO", "XT-2175-MORADO", "XT-2167-NEGRO", "XT-2169-AZUL", "XT-2169-VERDE", "XT-2173-AZUL", "XT-2173-GRIS", "XT-2231-NEGRO", "SM-A035-32GB-NE", "SM-A536E-BLANCO", "SM-A035-64GB-AZ", "SM-A135-NEGRO", "A60UNS", "SM-A135-64GB-NE", "XT-2231-AZUL", "SM-A226-BLANCO", "SM-A536E-AZUL", "SM-M236-AZUL", "SM-A235-NEGRO", "XT-2221-NEGRO", "SM-A235-AZUL", "SM-G781-AZUL", "SM-A035-64GB-NE", "SM-A336-NEGRO", "SM-A135-64GB-AZ", "SM-A135-64GB-BL", "SM-A336-BLANCO", "TCL-305-GRIS", "TCL-30E-GRIS", "XT-2175-MOR-CR", "SM-A032-VERDE", "XT2227-PLATA", "XT-2221-AZUL", "XT2227-GRIS", "SM-A032-COBRE", "XT-2225-BLANCO", "SM-M135-CELESTE", "SM-M135-VERDE", "SM-A045-64GB-VE", "220333QL-AZUL", "SM-A236-BLANCO", "SM-G990-GRAFITO", "SM-A037-AZUL", "SM-A042-64GB-NE", "SM-A047-BLANCO", "B30-NEGRO", "SM-A045-NEGRO", "SM-A045-VERDE", "SM-A045-BLANCO", "SM-A045-128GB-N", "SM-A045-64GB-NE", "SM-A047-NEGRO", "XT-2233-ROSA", "XT-2225-NEGRO", "A60-PLUS-NEGRO", "SM-A045-64GB-BL", "XT-2167-DORADO", "XT-2227-PLATA", "XT-2239-AZUL", "XT-2239-NEGRO", "XT-2239-GRIS", "XT-2235-GRIS", "XT-2203-PLATA", "XT-2243-BLANCO", "XT-2235-PLATA", "SM-A042-64GB-RO", "SM-A042-64GB-CO", "SM-A042-NEGRO", "XT-2233-VERDE", "SM-A042-AZUL", "SM-A146-PLATA", "SM-A047-VERDE", "XT-2235-ROSA", "XT-2245-PLATA", "A50-PLUS", "XT-2245-VIOLETA", "XT-2345-NATURAL", "SM-A236-AZUL", "SM-A236-NEGRO", "XT-2255-BLANCO", "SM-A042-COBRE", "XT-2241-NEGRO", "SM-A346-PLATA", "SM-A546-NEGRO", "SM-A346-LIME", "TCL-40SE-128-LI", "SM-A145-NEGRO", "SM-A145-PLATA", "SM-A145-VERDE", "TCL-405-GRIS", "SM-A245-128GB-N", "SM-A346-GRAFITO", "XT-2255-AZUL", "XT-2331-ROSA", "XT-2333-AZUL", "XT-2333-BLANCO", "XT-2345-AZUL", "2201117TL-AZUL", "XT-2243-AZUL", "XT-2331-GRIS", "SM-A042-64GB-A", "SM-A546-128GB-N", "SM-A546-128GB-B", "TCL-408-GRIS", "2201117TL-GRIS", "XT-2331-128-ROS", "220333QL-GRIS", "TCL-408-AZUL", "TCL-403-NEGRO", "TCL-403-LILA", "TCL-405-LILA", "TCL-40SE-128-GR", "TCL-40SE-256-GR", "TCL-40SE-256-LI", "SM-A245-128GB-P", "SM-A245-128GB-V", "SM-A546-128GB-V", "SM-A546-LIME", "XT-2235-6GB-PLA", "XT-2235-6GB-ROS", "XT-2239-64GB-AZ", "XT-2331-128-GR", "XT-2303-NEGRO", "XT-2331-DS-AZUL", "SM-S901-VERDE", "SM-S918-256GB-B", "SM-S918-512GB-V", "A53PLUS", "A72S", "23100RN82L-NEG", "SM-A055-SILVER-1", "SM-A055-SILVER", "SM-S711-128GB", "SM-A146-NEGRO", "TCL40-NXTPAPER", "TCL-408-6GB-GR", "TCL-408-6GB-AZ", "SM-A346-GRAFI-1", "SM-A146-NEGRO-1", "SM-A045-64G-N-1", "SM-A055-NEGRO", "SM-A346-LIME-1", "SM-A245-128G-1", "SM-A042-NEGRO-1", "SM-A045-128G-1", "SM-A546-128GB-1", "SM-A045-64G-B-1", "SM-F731-CREMA", "SM-F731-ROSA", "SM-A055-128-NEG", "SM-A055-VERDE", "SM-A146-VERDE", "XT-2239-64GB-NE", "XT-2307-NEGRO", "XT-2307-VER", "N62-NEGRO", "N62-AZUL", "N52-NEGRO", "XT-2235-6GB-GRI", "XT-2341-BEIGE", "XT-2341-GRIS", "XT-2341-ROSA", "XT-2343-VER", "XT-2347-AZ", "220333QL-VERDE", "REDMI-A3-AZUL", "23100RN82L-AZUL", "REDMI-NOTE13-NE", "23100RN82L-BLAN", "REDMI-NOTE13-VE", "23100RN82L-AZ", "A34-GRIS"];

    const camarasArray = ["TP10A464" , "BRE225/00", "P2P00057", "COMBO-SX9-2", "SX9", "CM200W", "SX37", "P245F22", "P2P00039", "COMBO-SX9-3", "COMBO-SX37-2", "COMBO-SX37-3", "COMBO-CM200W-2", "COMBO-CM200W-3", "COMBO-P2P39-2", "COMBO-P2P39-3"];

    const notebooksArray = ["Z111", "21-N121AR-CE", "G01-I7", "G01-I3", "21-N005AR", "21-NOTF3AR", "G01-I1", "80F3001MAR", "G01-I2", "NB16W102", "21-N122-PENT", "21NF3AR", "TAMURA-SW", "E15", "IRIS-CLOUD", "N15W1", "NB16W101", "R9-F2445", "G5-I1", "TAMURA-MAX", "110-14IBR", "110-15ISK", "I3567-3629BLK", "R9X-F1445", "14-AX022LA", "14-BS021LA", "19MJH", "HP15BS013-LA", "E17", "NOTHP1GR180LA", "HP14BS009-LA", "HP14BS021-LA", "HP14BS007-LA", "HP14BS022LA", "G5-I2", "IP320-14IAP", "HP-15-F271WM", "IP320-15IKB", "IP110-15ISK", "I3565-A453BLK", "I3567-5149BLK", "80XR00-BLACK", "80XR00-PURPLE", "80XR00AHUS-BLUE", "80XR00AJUS-RED", "HP-15-F387WM", "IP320-15ISK", "IP330-14IGM", "330-15IGM", "X541SA-PD0703X", "HP14-CB610CL", "HP-15-BS289WM", "81D1009LUS-RED", "81D1009MUS", "81H5000NUS", "81DE00LAUS-GREY", "81DE00T0US", "81DE00T1US", "81F5006FUS", "81F5006GUS-BLUE", "81D100EDUS", "HP-15-DA0089CL", "81F50048US", "BOMBA-NOTEBOOK", "HP-15-DA0051LA", "X441CA-CBA6A", "A315-53-30BS", "A315-53-54XX", "HP-15-BS031WN", "HP-15-DA0087CL", "HP-15-DA0088CL", "HP-14-CB012", "HP-14-CB011DS", "HP-14-CB130NR", "81F5006BUS", "HP-14-DK1003DX", "A315-54K-37RE", "81VS001US", "A115-31-C23T", "81N800H0US", "F3145", "E25", "XL4-F3145", "E18", "HP14-CK0039", "I5481-3595GRY", "HP-14-DQ1037WM", "HP-15-DA0286NIA", "E19", "HP-15-DY1024WM", "CB315-3H-C2C3", "HP-14-DQ1038WM", "HP-15-RA013NIA", "81D100NYAK", "HP14-DQ1033-I5", "HP14-DQ1033-I3", "AT550/500", "AT500", "81DE00URAK", "E25-PLUS", "81WE011UUS", "HP-14CF1061ST", "HP14-DQ003DX", "N14WD21", "HP14-FQ0013DX", "81WR000FUS", "HP15-DW0083WM", "HP-15-EF1072WM", "81WE00ENUS", "81WA00B1US", "81VU00J3AR", "HP14-CF2531LA", "82H800KAUS", "HP14-DQ2088WM", "AT510", "A515-55-35SE", "HP14-DQ2038MS", "A517-52-59SV", "TECRA-A40-G", "82KU00AAUS", "81X80055US", "HP14DQ2055WM", "A1650", "HP14-DQ2024LA", "N14WCE128", "81X800EKUS", "BOMBA-2", "81WB01EXAR", "L66", "L66PLUS", "XQ3H-1", "XQ3H-2", "XQ3H-8", "XQ5C-10", "T56", "T56PLUS", "XQ3K-2", "N14X1000", "N14X3000", "X1400EA-I3", "82QC003VUS", "HP-15-DY2046", "HP-15-DY2792", "81X700FGUS", "AT520LN", "AT520LN-1", "M14-DAEWOO", "82QD00CJUS", "X1404ZA-I38128", "HP14-DQ0760DX", "HP15-DY5131WM", "HP14-EP0792WM"];


// Función para mostrar el spinner
function mostrarSpinner() {
    document.getElementById('spinner3').style.display = 'block'; // Muestra el spinner
}

// Función para ocultar el spinner
function ocultarSpinner() {
    document.getElementById('spinner3').style.display = 'none'; // Oculta el spinner
}

// Función para obtener datos
function obtenerDatos(queryType, button) {
    mostrarSpinner(); // Muestra el spinner
    button.disabled = true; // Deshabilita el botón

    const dbRef = database.ref('envios');

    // Limpia el contenido anterior antes de cargar nuevos datos
    const tablaContainer = document.querySelector('.query-modal-body');
    tablaContainer.querySelector('table')?.remove(); // Elimina la tabla existente si hay una

    dbRef.limitToLast(1000).once('value').then((snapshot) => {
        ocultarSpinner(); // Oculta el spinner
    
        if (snapshot.exists()) {
            const data = snapshot.val();
            const resultados = {};
    
            for (const key in data) {
                const item = data[key];
    
                // Verifica que el item cumpla con las condiciones
                if (item.shippingMode === queryType) {
                    if (!item.query && item.SKU && item.Cantidad) {
                        const sku = item.SKU;
                        const cantidad = item.Cantidad;
                        const producto = item.Producto || 'Producto no disponible';
                        const idOperacion = item.idOperacion;
    
                        // Obtener la primera imagen
                        const imagen = item.pictures && item.pictures.length > 0 ? item.pictures[0].secure_url : '';
    
                        // Si el SKU no existe en resultados, inicialízalo
                        if (!resultados[sku]) {
                            resultados[sku] = { producto, cantidad: 0, imagen, idOperacion, nodos: [] }; // Agregar un array para los nodos
                        }
                        // Sumar la cantidad
                        resultados[sku].cantidad += cantidad;
                        resultados[sku].nodos.push(key); // Agregar el nombre del nodo al array
                    } 
                }
            }
    
            // Mostrar en consola la información de los SKUs y nodos
            for (const sku in resultados) {
                const { cantidad, nodos } = resultados[sku];
                console.log(`SKU: ${sku}: ${nodos.join('; ')}; Cantidad: ${cantidad}`);
            }
    
            mostrarResultados(resultados);
        } else {
            console.log("No hay datos disponibles");
        }
    }).catch((error) => {
        ocultarSpinner();
        console.error("Error al obtener datos:", error);
    }).finally(() => {
        button.disabled = false;
    });
}  

function mostrarResultados(resultados) {
    const tablaContainer = document.querySelector('.query-modal-body');

    const tabla = document.createElement('table');
    tabla.className = 'table table-striped';
    tabla.innerHTML = `
        <thead>
            <tr>
                <th class="seleccionar-Meli"><i class="bi bi-printer"></i></th>
                <th class="SKU-Meli">SKU</th>
                <th class="cantidad-Meli">Cantidad</th>
                <th class="producto-Meli">Producto</th>
                <th class="imagen-Meli">Imagen</th>
            </tr>
        </thead>
        <tbody>
    `;

    const celularesArray = ["A54-GRIS", "ALEL23BLRET", "SM-A500", "SMG-318ML", "L435", "SM-A300MZK", "SMG-357MZAAR", "S388", "SM-J415-DORADO", "LG-K22-GRIS", "XT-2095-GRIS", "SM-G715-NEGRO", "AXSII", "A6", "SM-J111-BLANCO", "SM-J200-BLANCO", "SM-J200-NEGRO-INACTIVO", "SM-J700-BLANCO", "SM-J320-BLANCO", "SM-J320-NEGRO", "PIXI3", "Y625-NEGRO", "SM-J510-BLANCO", "SM-J510-NEGRO", "SM-J710-NEGRO", "G935-DORADO", "XT1542", "SM-J610-ROJO", "N-4513", "SM-J111-NEGRO", "SM-J710-BLANCO-INACTIVO", "LGH735", "G935-NEGRO", "LGH440", "SM-J710-BLANCO", "SM-J200-NEGRO", "SM-J105-BLANCO", "VIBE-K5", "Y6-NEGRO", "SM-J510-DORADO", "SM-J710-DORADO", "SM-G532-NEGRO", "LG-H815-NEGRO", "LG-H815-DORADO", "LGH635-TITANIUM", "ALEL23NERET", "V6-GOLD", "V6-SILVER", "X2-BLANCO", "X2-NEGRO", "X5-SILVER", "LUAL03BLRET", "LUAL03NERET", "N5034SWOS", "N5514DWOS", "LG-K220", "LG-K350", "N5034SBOS", "V6-SILVER-CROJO", "V6-SILVER-CNEGR", "SM-G532-PLATA", "LG-K120", "LG-M250", "XT-1601", "XT-1621", "XT-1680", "SM-G950-NEGRO", "SM-G950-DORADO", "SM-G955-NEGRO", "SM-G955-GRIS", "SM-G955-PLATA", "SM-G532-DORADO", "LG-X240", "XT-1670", "XT-1725", "XT-1772", "SM-J701NEO-DOR", "SM-J701NEO-NEG", "SM-G610-BLANCO", "XT-1725-DORADO", "XT-1772-AZUL", "XT-1772-DORADO", "XT-1756", "XT-1800-DORADO", "XT-1800-GRIS", "XT-1725-NEGRO", "SM-J701NEO-PLAT", "SM-G570-NEGRO", "SM-J400-DORADO", "XT-1922-AZUL", "XT-1941-NEGRO", "XT-1926-6-AZUL", "XT-1922-DORADO", "SM-G570-DORADO", "COMBO-MOTOROLA", "N5044DPOS-ROS", "SM-G9600-PURPLE", "XT-1924-DORADO", "SM-J600-DORADO", "SM-G610-NEGRO", "5033A", "XT-1924-GRIS", "XT-1920-DORADO", "XT-1920-NEGRO", "N5044DWOS-BL", "N5044DBOS-NE", "SM-J400-NEGRO", "SM-J400-VIOLETA", "SM-J600-NEGRO", "SM-J260-NEGRO", "SM-J260-VIOLETA", "XT-1941-BLANCO", "SM-J260-DORADO", "XT-1962-NEGRO", "SM-A750-NEGRO", "SM-A750-DORADO", "SM-J610-GRIS", "SM-J610-NEGRO", "SM-J415-NEGRO", "SM-J415-ROSA", "SM-J410-DORADO", "SM-J410-NEGRO", "XT-1965-INDIGO", "XT-1955-AZUL", "BOMBA-CELULAR", "SM-A920-NEGRO", "SM-A920-AZUL", "SM-A920-ROSA", "XT-1962-BLANCO", "T1-NEGRO", "SM-A305-AZUL", "XT-2053ESP-ROJO", "XT-1955-VIOLETA", "SM-A305-BLANCO", "XT-1944-DORADO", "XT-1952-INDIGO", "XT-1944-GRIS", "XT-2019-BLUE", "XT-2025ESP-AZUL", "XT-2015-MAGENTA", "XT-2063-256GB", "XT-2025-GRAFITO", "XT-2025ESPECIAL", "SM-A205-AZUL", "SM-A105-AZUL", "XT-2025-CHERRY", "SM-A105-NEGRO", "SM-A205-NEGRO", "SM-A305-NEGRO", "XT-2025ESP-ARRA", "XT-2029-NEGRO", "XT-2029-AZUL", "XT-2027-VIOLETA", "LG-K50S", "SM-A307-NEGRO", "XT-2015-GREY", "SM-A025-NEGRO", "XT-2041-AZUL", "XT-2019-PINK", "XT-2041-GRIS", "SM-A107-AZUL", "T1-GRIS", "T1-AZUL", "LG-K9", "XT-2087-AZUL", "XT2203-GRIS", "SM-A107-NEGRO", "L1-NEGRO", "TA-1115-CARBON", "TA-1112-NEGRO", "TA-1179-ACERO", "XT-2053ESP-R", "XT-2053-ROJO", "XT-2055-AZUL", "A3-LITE", "XT-2063-ROJO", "XT-2045-BLANCO", "XT-2073-AZUL", "XT-2053-AZUL", "LG-K22+AZUL", "LG-K20", "SM-A515-BLANCO", "XT-2073-ESMERA", "XT-2083-AZUL", "SM-A013-NEGRO", "SM-A015-NEGRO", "SM-A115-BLANCO", "SM-A217-AZUL", "SM-A315-NEGRO", "SM-A115-NEGRO", "SM-A217-NEGRO", "SM-A315-BLANCO", "A5-PLUS", "LG-Q60", "SM-A515-NEGRO", "XT-2063-256GB-G", "SM-A015-AZUL", "SM-A217-BLANCO", "SM-A315-AZUL", "SM-A715-NEGRO", "SM-A715-PLATA", "XT-2081-NARANJA", "XT-2083-ROSA", "XT-2073-ESMERA", "XT-2081-AZUL", "SM-A115-BLUE", "SM-G780-LAVANDA", "XT-2087-ROSA", "XT-2053-ROSA", "SM-A013-BLUE", "SM-A207-NEGRO", "SM-A207-AZUL", "SM-A307-BLANCO", "XT-2091-MORADO", "XT-2053-GRIS", "XT-2053ESP-AZUL", "XT-2095-AZUL", "XT-2091-VERDE", "XT-2055-TURQUES", "XT-2095-ROSA", "SM-A022-64GB-NE", "SM-A022-NEGRO", "SM-A022-AZUL", "SM-A125-NEGRO", "SM-A025-AZUL", "SM-A217-128-NEG", "TCL-L7+", "TCL-TPRO", "SM-A125-AZUL", "SM-A217-128-BLA", "XT-2053FIJIROSA", "TCL-L10LITE", "LG-K22+GRIS", "LG-K22-AZUL", "XT-2129-GRIS", "COMBO-L1-NEGRO", "SM-A525-AZUL", "SM-A325-NEGRO", "SM-A725-VIOLETA", "XT-2125-VERDE", "SM-A525-BLANCO", "SM-A725-NEGRO", "XT-2129-LILA", "SM-A336-AZUL", "SM-A217-128-AZU", "SM-A325-AZUL", "SM-A235-BLANCO", "XT-2053FIJIGRIS", "LG-K41S-GRIS", "SM-G780-BLUE", "SM-M127-NEGRO", "XT-2097-NARANJA", "XT-2128-AZUL", "SM-M127-AZUL", "SM-A325-BLANCO", "XT-2097-AZUL", "TCL-20E", "SM-A525-NEGRO", "SM-G780-GREEN", "XT-2128-ROSA", "SM-A125-128-NEG", "SM-A225-NEGRO", "TCL-L10+", "TCL-20SE-VERDE", "TCL-20Y-AZUL", "TCL-20E-128-VER", "SM-A225-BLANCO", "SM-A225-VERDE", "XT-2133-AQUA", "SM-A725-BLANCO", "L1PRO-GRIS", "XT-2155-AZUL", "SM-A037-NEGRO", "SM-A127-128-NEG", "SM-A127-64-AZUL", "SM-A127-64-NEG", "XT-2125-AZUL", "XT-2128-128-AZU", "TCL-10SE", "TCL-20E-128-AZU", "TCL-20SE-256GB", "TCL-20SE-GRIS", "TCL-L9S", "XT-2139-VERDE", "XT-2159-ROSA", "SM-A032-AZUL", "XT-2128-128-VER", "XT-2159-GRIS", "SM-A525-VIOLETA", "XT-2133-AZUL", "XT-2139-GRIS", "XT-2155-GRAFITO", "XT-2153-BLANCO", "TCL-20Y-NEGRO", "SM-M236-VERDE", "SM-A032-NEGRO", "TCL-20B-MORADO", "TCL-20B-GRIS", "XT-2153-AZUL", "SM-A528-NEGRO", "5033MR", "6025A", "A50UNS", "SM-A035-NEGRO", "SM-A226-GRIS", "SM-A035-32GB-AZ", "SM-A536-NEGRO", "XT-2171-DORADO", "XT-2175-MORADO", "XT-2167-NEGRO", "XT-2169-AZUL", "XT-2169-VERDE", "XT-2173-AZUL", "XT-2173-GRIS", "XT-2231-NEGRO", "SM-A035-32GB-NE", "SM-A536E-BLANCO", "SM-A035-64GB-AZ", "SM-A135-NEGRO", "A60UNS", "SM-A135-64GB-NE", "XT-2231-AZUL", "SM-A226-BLANCO", "SM-A536E-AZUL", "SM-M236-AZUL", "SM-A235-NEGRO", "XT-2221-NEGRO", "SM-A235-AZUL", "SM-G781-AZUL", "SM-A035-64GB-NE", "SM-A336-NEGRO", "SM-A135-64GB-AZ", "SM-A135-64GB-BL", "SM-A336-BLANCO", "TCL-305-GRIS", "TCL-30E-GRIS", "XT-2175-MOR-CR", "SM-A032-VERDE", "XT2227-PLATA", "XT-2221-AZUL", "XT2227-GRIS", "SM-A032-COBRE", "XT-2225-BLANCO", "SM-M135-CELESTE", "SM-M135-VERDE", "SM-A045-64GB-VE", "220333QL-AZUL", "SM-A236-BLANCO", "SM-G990-GRAFITO", "SM-A037-AZUL", "SM-A042-64GB-NE", "SM-A047-BLANCO", "B30-NEGRO", "SM-A045-NEGRO", "SM-A045-VERDE", "SM-A045-BLANCO", "SM-A045-128GB-N", "SM-A045-64GB-NE", "SM-A047-NEGRO", "XT-2233-ROSA", "XT-2225-NEGRO", "A60-PLUS-NEGRO", "SM-A045-64GB-BL", "XT-2167-DORADO", "XT-2227-PLATA", "XT-2239-AZUL", "XT-2239-NEGRO", "XT-2239-GRIS", "XT-2235-GRIS", "XT-2203-PLATA", "XT-2243-BLANCO", "XT-2235-PLATA", "SM-A042-64GB-RO", "SM-A042-64GB-CO", "SM-A042-NEGRO", "XT-2233-VERDE", "SM-A042-AZUL", "SM-A146-PLATA", "SM-A047-VERDE", "XT-2235-ROSA", "XT-2245-PLATA", "A50-PLUS", "XT-2245-VIOLETA", "XT-2345-NATURAL", "SM-A236-AZUL", "SM-A236-NEGRO", "XT-2255-BLANCO", "SM-A042-COBRE", "XT-2241-NEGRO", "SM-A346-PLATA", "SM-A546-NEGRO", "SM-A346-LIME", "TCL-40SE-128-LI", "SM-A145-NEGRO", "SM-A145-PLATA", "SM-A145-VERDE", "TCL-405-GRIS", "SM-A245-128GB-N", "SM-A346-GRAFITO", "XT-2255-AZUL", "XT-2331-ROSA", "XT-2333-AZUL", "XT-2333-BLANCO", "XT-2345-AZUL", "2201117TL-AZUL", "XT-2243-AZUL", "XT-2331-GRIS", "SM-A042-64GB-A", "SM-A546-128GB-N", "SM-A546-128GB-B", "TCL-408-GRIS", "2201117TL-GRIS", "XT-2331-128-ROS", "220333QL-GRIS", "TCL-408-AZUL", "TCL-403-NEGRO", "TCL-403-LILA", "TCL-405-LILA", "TCL-40SE-128-GR", "TCL-40SE-256-GR", "TCL-40SE-256-LI", "SM-A245-128GB-P", "SM-A245-128GB-V", "SM-A546-128GB-V", "SM-A546-LIME", "XT-2235-6GB-PLA", "XT-2235-6GB-ROS", "XT-2239-64GB-AZ", "XT-2331-128-GR", "XT-2303-NEGRO", "XT-2331-DS-AZUL", "SM-S901-VERDE", "SM-S918-256GB-B", "SM-S918-512GB-V", "A53PLUS", "A72S", "23100RN82L-NEG", "SM-A055-SILVER-1", "SM-A055-SILVER", "SM-S711-128GB", "SM-A146-NEGRO", "TCL40-NXTPAPER", "TCL-408-6GB-GR", "TCL-408-6GB-AZ", "SM-A346-GRAFI-1", "SM-A146-NEGRO-1", "SM-A045-64G-N-1", "SM-A055-NEGRO", "SM-A346-LIME-1", "SM-A245-128G-1", "SM-A042-NEGRO-1", "SM-A045-128G-1", "SM-A546-128GB-1", "SM-A045-64G-B-1", "SM-F731-CREMA", "SM-F731-ROSA", "SM-A055-128-NEG", "SM-A055-VERDE", "SM-A146-VERDE", "XT-2239-64GB-NE", "XT-2307-NEGRO", "XT-2307-VER", "N62-NEGRO", "N62-AZUL", "N52-NEGRO", "XT-2235-6GB-GRI", "XT-2341-BEIGE", "XT-2341-GRIS", "XT-2341-ROSA", "XT-2343-VER", "XT-2347-AZ", "220333QL-VERDE", "REDMI-A3-AZUL", "23100RN82L-AZUL", "REDMI-NOTE13-NE", "23100RN82L-BLAN", "REDMI-NOTE13-VE", "23100RN82L-AZ", "A34-GRIS"];

    const camarasArray = ["TP10A464" , "BRE225/00", "P2P00057", "COMBO-SX9-2", "SX9", "CM200W", "SX37", "P245F22", "P2P00039", "COMBO-SX9-3", "COMBO-SX37-2", "COMBO-SX37-3", "COMBO-CM200W-2", "COMBO-CM200W-3", "COMBO-P2P39-2", "COMBO-P2P39-3"];

    const notebooksArray = ["Z111", "21-N121AR-CE", "G01-I7", "G01-I3", "21-N005AR", "21-NOTF3AR", "G01-I1", "80F3001MAR", "G01-I2", "NB16W102", "21-N122-PENT", "21NF3AR", "TAMURA-SW", "E15", "IRIS-CLOUD", "N15W1", "NB16W101", "R9-F2445", "G5-I1", "TAMURA-MAX", "110-14IBR", "110-15ISK", "I3567-3629BLK", "R9X-F1445", "14-AX022LA", "14-BS021LA", "19MJH", "HP15BS013-LA", "E17", "NOTHP1GR180LA", "HP14BS009-LA", "HP14BS021-LA", "HP14BS007-LA", "HP14BS022LA", "G5-I2", "IP320-14IAP", "HP-15-F271WM", "IP320-15IKB", "IP110-15ISK", "I3565-A453BLK", "I3567-5149BLK", "80XR00-BLACK", "80XR00-PURPLE", "80XR00AHUS-BLUE", "80XR00AJUS-RED", "HP-15-F387WM", "IP320-15ISK", "IP330-14IGM", "330-15IGM", "X541SA-PD0703X", "HP14-CB610CL", "HP-15-BS289WM", "81D1009LUS-RED", "81D1009MUS", "81H5000NUS", "81DE00LAUS-GREY", "81DE00T0US", "81DE00T1US", "81F5006FUS", "81F5006GUS-BLUE", "81D100EDUS", "HP-15-DA0089CL", "81F50048US", "BOMBA-NOTEBOOK", "HP-15-DA0051LA", "X441CA-CBA6A", "A315-53-30BS", "A315-53-54XX", "HP-15-BS031WN", "HP-15-DA0087CL", "HP-15-DA0088CL", "HP-14-CB012", "HP-14-CB011DS", "HP-14-CB130NR", "81F5006BUS", "HP-14-DK1003DX", "A315-54K-37RE", "81VS001US", "A115-31-C23T", "81N800H0US", "F3145", "E25", "XL4-F3145", "E18", "HP14-CK0039", "I5481-3595GRY", "HP-14-DQ1037WM", "HP-15-DA0286NIA", "E19", "HP-15-DY1024WM", "CB315-3H-C2C3", "HP-14-DQ1038WM", "HP-15-RA013NIA", "81D100NYAK", "HP14-DQ1033-I5", "HP14-DQ1033-I3", "AT550/500", "AT500", "81DE00URAK", "E25-PLUS", "81WE011UUS", "HP-14CF1061ST", "HP14-DQ003DX", "N14WD21", "HP14-FQ0013DX", "81WR000FUS", "HP15-DW0083WM", "HP-15-EF1072WM", "81WE00ENUS", "81WA00B1US", "81VU00J3AR", "HP14-CF2531LA", "82H800KAUS", "HP14-DQ2088WM", "AT510", "A515-55-35SE", "HP14-DQ2038MS", "A517-52-59SV", "TECRA-A40-G", "82KU00AAUS", "81X80055US", "HP14DQ2055WM", "A1650", "HP14-DQ2024LA", "N14WCE128", "81X800EKUS", "BOMBA-2", "81WB01EXAR", "L66", "L66PLUS", "XQ3H-1", "XQ3H-2", "XQ3H-8", "XQ5C-10", "T56", "T56PLUS", "XQ3K-2", "N14X1000", "N14X3000", "X1400EA-I3", "82QC003VUS", "HP-15-DY2046", "HP-15-DY2792", "81X700FGUS", "AT520LN", "AT520LN-1", "M14-DAEWOO", "82QD00CJUS", "X1404ZA-I38128", "HP14-DQ0760DX", "HP15-DY5131WM", "HP14-EP0792WM"];

    const enArrays = new Set([...celularesArray, ...camarasArray, ...notebooksArray]);
    const enArraysResult = [];
    const noEnArraysResult = [];

    for (const sku in resultados) {
        const { producto, cantidad, imagen } = resultados[sku];
        const fila = `
            <tr>
                <td class="seleccionar-Meli">
                    <select class="select-imprimir">
                        <option value="no">No</option>
                        <option value="si" selected>Si</option>
                    </select>
                </td>
                <td class="SKU-Meli">${sku}</td>
                <td class="cantidad-Meli">${cantidad}</td>
                <td class="producto-Meli">${producto}</td>
                <td class="imagen-Meli">
                    <img src="${imagen}" alt="${producto}" style="max-width: 120px; max-height: 120px" />
                </td>
                
            </tr>
        `;
        
        if (enArrays.has(sku)) {
            enArraysResult.push(fila);
        } else {
            noEnArraysResult.push(fila);
        }
    }

    noEnArraysResult.sort((a, b) => {
        const skuA = a.match(/>([^<]+)</)[1]; 
        const skuB = b.match(/>([^<]+)</)[1];
        
        if (/^\d/.test(skuA) && !/^\d/.test(skuB)) return -1; 
        if (!/^\d/.test(skuA) && /^\d/.test(skuB)) return 1; 
        return skuA.localeCompare(skuB);
    });

    const resultadosFinales = [...enArraysResult, ...noEnArraysResult];
    tabla.innerHTML += resultadosFinales.join('');
    tabla.innerHTML += `</tbody></table>`;

    tablaContainer.appendChild(tabla);

// Crear botón de "Marcar todos como No"
const btnMarcar = document.createElement('button');
btnMarcar.innerHTML = '<i class="bi bi-x-circle"></i> Marcar todos como No';
btnMarcar.className = 'btn btn-danger btn-mark';
btnMarcar.onclick = () => {
    const rows = tabla.querySelectorAll('tbody tr');
    const isMarkingNo = btnMarcar.innerHTML.includes('No'); // Verifica el estado actual

    rows.forEach(row => {
        const select = row.querySelector('.select-imprimir');
        select.value = isMarkingNo ? 'no' : 'si'; // Cambia el valor según el estado
    });

    // Cambia el texto y el ícono del botón
    if (isMarkingNo) {
        btnMarcar.innerHTML = '<i class="bi bi-check-circle"></i> Marcar todos como Sí';
        btnMarcar.className = 'btn btn-primary btn-mark'; // Cambia a btn-success
    } else {
        btnMarcar.innerHTML = '<i class="bi bi-x-circle"></i> Marcar todos como No';
        btnMarcar.className = 'btn btn-danger btn-mark'; // Cambia a btn-danger
    }
};

// Insertar el botón antes del botón de imprimir
tablaContainer.insertBefore(btnMarcar, tabla);

    // Crear botón de imprimir
    const btnImprimir = document.createElement('button');
    btnImprimir.innerHTML = '<i class="bi bi-printer-fill"></i> Imprimir en PDF';
    btnImprimir.className = 'btn btn-primary botonImpresion';
    btnImprimir.id = 'botonImpresion';
    btnImprimir.onclick = () => {
        const seleccionados = [];
        const rows = tabla.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const select = row.querySelector('.select-imprimir');
            if (select.value === 'si') {
                const sku = row.querySelector('.SKU-Meli').textContent;
                const cantidad = row.querySelector('.cantidad-Meli').textContent;
                const producto = row.querySelector('.producto-Meli').textContent;
                const imagen = row.querySelector('.imagen-Meli img').src;

                seleccionados.push({ sku, cantidad, producto, imagen });
            }
        });

        if (seleccionados.length > 0) {
            Swal.fire({
                title: 'Confirmación 🔒',
                text: 'Vas a marcar como preparado estos productos, el contador se reiniciará.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    mostrarSpinner(); // Muestra el spinner antes de generar el PDF
                    setTimeout(() => {
                        generarPDF2(seleccionados); // Llama a la función para generar PDF con los seleccionados
                        marcarComoPreparado(seleccionados.map(item => item.sku)); // Marca como preparado en Firebase
                    }, 3000); // Esperar 3 segundos antes de generar el PDF
                }
            });
        } else {
            Swal.fire('No se seleccionó ningún producto para imprimir.');
        }
    };

    tablaContainer.insertBefore(btnImprimir, tabla);
}

function marcarComoPreparado(seleccionados) {
    const dbRef = database.ref('envios');
    const promises = []; // Array para almacenar las promesas de actualización

    seleccionados.forEach(sku => {
        const queryRef = dbRef.orderByChild('SKU').equalTo(sku);
        const updatePromise = queryRef.once('value').then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const childKey = childSnapshot.key;
                const updateNode = dbRef.child(childKey).update({ query: "preparado" });
                promises.push(updateNode);
            });
        });

        promises.push(updatePromise);
    });

    Promise.all(promises)
        .then(() => {
            console.log("Todos los productos seleccionados han sido marcados como preparados.");
        })
        .catch((error) => {
            console.error("Error en las actualizaciones:", error);
        });
}

const { jsPDF } = window.jspdf; // Asegúrate de esta línea antes de usar jsPDF

function generarPDF2(seleccionados) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let y = 20; // Posición inicial en el eje Y
    const pageHeight = pdf.internal.pageSize.height; // Altura de la página
    const rowHeight = 22; // Altura de cada fila
    const margin = 10; // Margen
    let promises = []; // Declarar la variable promises aquí

    // Agregar cabecera
    pdf.setFontSize(12);
    pdf.text('Reporte de Productos', pdf.internal.pageSize.width / 2, y, { align: 'center' });
    y += 10; // Espacio después del título

    // Cabecera de la tabla
    pdf.setFontSize(10);
    pdf.text('SKU', margin, y);
    pdf.text('Cantidad', margin + 30, y, { align: 'center' });
    pdf.text('Producto', margin + 65, y);
    pdf.text('Imagen', margin + 120, y);
    
    // Dibujar bordes de la cabecera
    pdf.line(margin, y + 2, margin + 185, y + 2); // Línea horizontal

    y += rowHeight; // Espacio después de la cabecera

    seleccionados.forEach(({ sku, cantidad, producto, imagen }) => {
        // Cargar la imagen y agregarla al PDF
        const imgPromise = new Promise((resolve) => {
            const img = new Image();
            img.src = imagen;
            img.onload = function () {
                pdf.setFont('Helvetica', 'bold'); // Usar fuente Helvetica en negrita
                pdf.text(sku, margin, y + (rowHeight / 2), { baseline: 'middle' });
                pdf.text(cantidad, margin + 55, y + (rowHeight / 2), { align: 'center', baseline: 'middle' });
                pdf.setFont('Helvetica', 'normal'); // Regresar a normal para el producto
                pdf.text(producto, margin + 65, y + (rowHeight / 2), { maxWidth: 60, baseline: 'middle' });

                // Agregar imagen con ajuste de tamaño
                const imgHeight = 20; // Altura máxima de la imagen
                const imgWidth = (img.width * imgHeight) / img.height; // Calcular ancho en función de la altura
                pdf.addImage(img, 'PNG', margin + 135, y + (rowHeight / 2) - (imgHeight / 2), imgWidth, imgHeight);

                // Dibujar bordes de la fila
                pdf.line(margin, y + 2, margin + 185, y + 2); // Línea horizontal

                y += rowHeight; // Mover hacia abajo para la siguiente fila

                // Verificar si se ha alcanzado el final de la página
                if (y > pageHeight - margin) {
                    pdf.addPage(); // Agregar nueva página
                    y = 20; // Reiniciar posición Y
                    // Reagregar cabecera en nueva página
                    pdf.text('Reporte de Productos', pdf.internal.pageSize.width / 2, y, { align: 'center' });
                    y += 10; // Espacio después del título
                    pdf.text('SKU', margin, y);
                    pdf.text('Cantidad', margin + 55, y, { align: 'center' });
                    pdf.text('Producto', margin + 80, y);
                    pdf.text('Imagen', margin + 135, y);
                    y += rowHeight; // Espacio después de la cabecera
                }
                resolve(); // Resuelve la promesa cuando la imagen se ha agregado
            };
            img.onerror = function () {
                console.error("Error al cargar la imagen:", imagen);
                resolve(); // Resuelve incluso si la imagen falla para continuar
            };
        });

        promises.push(imgPromise); // Agrega la promesa al array
    });

    // Espera a que todas las imágenes se hayan cargado antes de guardar el PDF
    Promise.all(promises).then(() => {
        pdf.save('reporte_productos.pdf'); // Guarda el PDF
        ocultarSpinner(); // Oculta el spinner después de generar el PDF
    });
}

function eliminarBotonImpresion() {
    const botonImpresion = document.getElementById('botonImpresion');
    if (botonImpresion) {
        botonImpresion.remove();
    }
}

function eliminarBotonMarcarNo() {
    const btnMarcarNo = document.querySelector('.btn-mark'); // Selecciona el botón por su clase
    if (btnMarcarNo) {
        btnMarcarNo.remove(); // Elimina el botón del DOM
    }
}

// Agregar eventos a los botones ME1 y ME2
const prepararME1Btn = document.getElementById('prepararME1');
const prepararME2Btn = document.getElementById('prepararME2');

if (prepararME1Btn) {
    prepararME1Btn.addEventListener('click', () => {
        eliminarBotonImpresion(); // Eliminar el botón de impresión
        eliminarBotonMarcarNo();
        obtenerDatos('me1', prepararME1Btn);
    });
}

if (prepararME2Btn) {
    prepararME2Btn.addEventListener('click', () => {
        eliminarBotonImpresion(); // Eliminar el botón de impresión
        eliminarBotonMarcarNo();
        obtenerDatos('me2', prepararME2Btn);
    });
}

// FIN QUERY DE DATOS MELI

// ETIQUETA LOGISTICA PROPIA
async function generarPDF(email, id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, medidas, producto, localidad, provincia, recibe) {
    let button = document.getElementById(`LogPropiaMeliButton${id}`);
    let spinner = document.getElementById(`spinnerLogPropia${id}`);
    let spinner2 = document.getElementById("spinner2");

    // Obtener la fecha actual al inicio
    const fechaActual = new Date();

    // Mostrar en consola los parámetros recibidos
    console.log('Parámetros recibidos por generarPDF:');
    console.log({ email, id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, medidas, producto, localidad, provincia });

    // Mostrar spinner y cambiar texto del botón
    spinner.style.display = "inline-block"; // Usar inline-block en lugar de flex para el spinner
    button.innerHTML = '<i class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i> Generando...';
    button.disabled = true; // Desactivar el botón

    const { jsPDF } = window.jspdf;

    // Obtener los días predeterminados desde Firebase
    const diaPredeterminadoBsAs = await database.ref('DiaPredeterminadoBsAs').once('value').then(snapshot => snapshot.val());
    const diaPredeterminadoStaFe = await database.ref('DiaPredeterminadoStaFe').once('value').then(snapshot => snapshot.val());
    const diaPredeterminadoRafaela = await database.ref('DiaPredeterminadoRafaela').once('value').then(snapshot => snapshot.val());
    const diaPredeterminadoSanNicolas = await database.ref('DiaPredeterminadoSanNicolas').once('value').then(snapshot => snapshot.val());

    function obtenerProximoDia(fecha, dia) {
        const diasDeLaSemana = {
            'lunes': 1,
            'martes': 2,
            'miercoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sabado': 6,
            'domingo': 0
        };

        const diaActual = fecha.getDay();
        let diasParaSumar = (diasDeLaSemana[dia.toLowerCase()] - diaActual + 7) % 7;
        if (diasParaSumar === 0) diasParaSumar = 7; // Si es hoy, sumar 7 días
        const fechaProximoDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + diasParaSumar);
        const esManana = diasParaSumar === 1;
        return { fechaProximoDia, esManana, diasParaSumar };
    }

    function sumarDiasHabiles(fecha, dias) {
        let diasAgregados = 0;
        let nuevaFecha = new Date(fecha);

        while (diasAgregados < dias) {
            nuevaFecha.setDate(nuevaFecha.getDate() + 1);
            // Si no es domingo, sumar un día hábil
            if (nuevaFecha.getDay() !== 0) {
                diasAgregados++;
            }
        }

        return nuevaFecha;
    }

    function obtenerProximoSabado(fecha) {
        const diaActual = fecha.getDay();
        const diasParaSumar = (6 - diaActual + 7) % 7;
        const fechaProximoSabado = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + diasParaSumar);
        return fechaProximoSabado;
    }

    // Determinar la logística según el CP
    const logistica = logBsCps.includes(Number(Cp)) ? 'Buenos Aires' :
                      logStaFeCps.includes(Number(Cp)) ? 'Santa Fe' :
                      logRafaelaCps.includes(Number(Cp)) ? 'Rafaela' :
                      logSanNicolasCps.includes(Number(Cp)) ? 'San Nicolás' :
                      'logística Propia';

    let diaPredeterminado;
    if (logistica === 'Buenos Aires') {
        diaPredeterminado = diaPredeterminadoBsAs;
    } else if (logistica === 'Santa Fe') {
        diaPredeterminado = diaPredeterminadoStaFe;
    } else if (logistica === 'Rafaela') {
        diaPredeterminado = diaPredeterminadoRafaela;
    } else if (logistica === 'San Nicolás') {
        diaPredeterminado = diaPredeterminadoSanNicolas;
    }

    let diaFormateado;
    const cp = Number(Cp);
    if (cp === 2132 || cp === 2131 || cp === 2134) {
        // Si el CP es de Funes, Roldán o Pérez, calcular el próximo sábado
        const fechaProximoSabado = obtenerProximoSabado(new Date());
        diaFormateado = fechaProximoSabado.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
        console.log(`CP ${cp} es de Funes, Roldán o Pérez. Próximo sábado: ${diaFormateado}`);
    } else if (logistica !== 'logística Propia') {
        const { fechaProximoDia, esManana, diasParaSumar } = obtenerProximoDia(new Date(), diaPredeterminado);
        console.log(`CP ${cp} pertenece a la logística ${logistica}. Día predeterminado: ${diaPredeterminado}. Próximo día: ${fechaProximoDia}`);

        let diasParaSumarFinal = diasParaSumar; // Inicializar la variable
        if (esManana) {
            // Preguntar al usuario si es mañana
            const { value: incluirMañana } = await Swal.fire({
                title: '¿Sale en el camión de mañana?',
                html: `
                    <p class="logistica-propia-sweet-alert">
                        <i class="bi bi-truck" style="font-size: 24px; color: #007bff;"></i>
                        Hay programado un camión con Logística Propia a <strong style="color: #28a745;">${logistica}</strong> para el día de mañana.
                    </p>
                    <p>
                        Si desea incluir el envío, presione <strong style="color: #28a745;">SÍ</strong>. De lo contrario, presione <strong style="color: #FF0000FF;">NO</strong> y se calculará para la próxima semana.
                    </p>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            });

            // Determinar la cantidad de días a sumar
            diasParaSumarFinal = incluirMañana ? 1 : diasParaSumar; // Usar la respuesta directamente
        }

        const fechaProgramada = new Date(new Date().setDate(new Date().getDate() + diasParaSumarFinal)); // Sumar días directamente
        diaFormateado = fechaProgramada.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
        console.log(`Fecha programada: ${diaFormateado}`);
    } else {
        // Si no está en ninguna de las logísticas, sumar 3 días hábiles
        const fechaInicio = sumarDiasHabiles(new Date(), 1);
        const fechaEntrega = sumarDiasHabiles(fechaInicio, 3);
        const fechaInicioFormateada = fechaInicio.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
        const fechaEntregaFormateada = fechaEntrega.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
        diaFormateado = `Entre ${fechaInicioFormateada} y ${fechaEntregaFormateada}`;
        console.log(`CP ${cp} no pertenece a ninguna logística específica. Fecha inicio: ${fechaInicioFormateada}, Fecha entrega: ${fechaEntregaFormateada}`);
    }

    const { value: numeroRemito } = await Swal.fire({
        title: '¿Cuál es el número de remito?',
        html: `
            <div class="input-container">
                <input id="numeroRemito" class="swal2-input" placeholder="Número de Remito" maxlength="20" required>
                <small class="input-description">Ingresar número de remito (mínimo 10 dígitos, solo números)</small>
            </div>
        `,
        icon: 'question',
        showCancelButton: false,
        confirmButtonText: 'Aceptar',
        customClass: {
            popup: 'macos-popup',
            input: 'macos-input',
            title: 'macos-title',
            confirmButton: 'macos-button',
        },
        didOpen: () => {
            const input = document.getElementById('numeroRemito');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    Swal.clickConfirm();
                }
            });
        },
        preConfirm: () => {
            const input = document.getElementById('numeroRemito').value;
            // Validaciones
            if (!/^\d{10,}$/.test(input)) {
                Swal.showValidationMessage('Por favor, ingrese un número de remito válido');
                return false;
            }
            return input;
        },
        allowEnterKey: true // Permitir que Enter funcione como aceptar
    });

    // Si el usuario cancela, salir de la función
    if (!numeroRemito) {
        spinner.style.display = "none";
        button.innerHTML = '<img class="NovogarMeli" src="Img/novogar-tini.png" alt="Novogar"> Etiqueta <strong>Novogar</strong>';
        button.disabled = false;  
        return;
    }

    // SweetAlert para el número de cliente
    const { value: numeroCliente } = await Swal.fire({
        title: '¿Cuál es el número de cliente?',
        html: `
            <div class="input-container">
                <input id="numeroCliente" class="swal2-input" placeholder="Número Cliente 🧑🏻‍💻" maxlength="8" required>
                <small class="input-description">Ingresar cliente de presea (máximo 8 dígitos, solo números)</small>
            </div>
        `,
        icon: 'question',
        showCancelButton: false, // Eliminando el botón de cancelar
        confirmButtonText: 'Aceptar',
        customClass: {
            popup: 'macos-popup',
            input: 'macos-input',
            title: 'macos-title',
            confirmButton: 'macos-button',
        },
        didOpen: () => {
            const input = document.getElementById('numeroCliente');
            input.focus(); // Hacer foco en el input al abrir el modal
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    Swal.clickConfirm(); // Simular clic en el botón de aceptar
                }
            });
        },
        preConfirm: () => {
            const input = document.getElementById('numeroCliente').value;
            // Validaciones
            if (!/^\d{2,8}$/.test(input)) {
                Swal.showValidationMessage('Por favor, ingrese un cliente válido');
                return false; // Evita que se acepte el valor
            }
            return input; // Retorna el valor si es válido
        },
        allowEnterKey: true // Permitir que Enter funcione como aceptar
    });

    // Si el usuario cancela, salir de la función
    if (!numeroCliente) {
        return;
    }

    spinner2.style.display = "flex";

    // URL de la API para generar el código de barras
    const barcodeApiUrl = `https://proxy.cors.sh/https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(numeroRemito)}&code=Code128&dpi=96`;

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

        // Crear un nuevo documento PDF en tamaño 10x15 cm
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: [15, 10],
            putOnlyUsedFonts: true,
            floatPrecision: 16
        });

        // Obtener la fecha actual
        const fechaFormateada = `${fechaActual.getDate().toString().padStart(2, '0')}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${fechaActual.getFullYear().toString().slice(-2)}`;
        const fechaVencimiento = sumarDiasHabiles(fechaActual, 3);
        const fechaVencimientoFormateada = `${fechaVencimiento.getDate().toString().padStart(2, '0')}-${(fechaVencimiento.getMonth() + 1).toString().padStart(2, '0')}-${fechaVencimiento.getFullYear().toString().slice(-2)}`;    

        // Determinar la imagen según el CP
        let logoSrc = './Img/Meli-Novogar.png';
        if (logBsCps.includes(Number(Cp))) {
            logoSrc = './Img/Camion-BsAs-Novogar.png';
        } else if (logStaFeCps.includes(Number(Cp))) {
            logoSrc = './Img/Camion-Santa-fe-Novogar.png';
        } else if (logRafaelaCps.includes(Number(Cp))) {
            logoSrc = './Img/Camion-Rafaela-Novogar.png';
        } else if (logSanNicolasCps.includes(Number(Cp))) {
            logoSrc = './Img/Camion-SNicolas-Novogar.png';
        }

        // Contenido HTML
        let contenido = `
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
                    padding: 12px;
                    border-radius: 15px;
                    background-color: #ffffff;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    display: flex;
                    border: 2px dashed #9c0000;
                    flex-direction: column;
                    align-items: center;
                }
                .logo img {
                    max-width: 250px;
                    height: auto;
                    margin-bottom: 5px;
                }
                .campo {
                    font-family: "Roboto", sans-serif;
                    width: 100%;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    margin-bottom: 5px;
                    padding: 5px;
                    border: 1px solid #9c0000;
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
                    font-family: "Roboto", sans-serif;
                    width: 100%;
                    border-radius: 10px;
                    margin-top: 10px;
                    border: 2px dashed #9c0000;
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
                    color: #2B2B2BFF;
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

            </style>
        </head>
        <body>
            <div class="etiqueta">
                <div class="logo">
                    <img src="${logoSrc}" alt="Logo">
                </div>
                <div class="campo">
                    <span style="text-transform: uppercase;">${numeroCliente} ${NombreyApellido || recibe}</span>
                </div>
                <div class="campo">
                    <span>${Cp}, ${localidad}, ${provincia}</span>
                </div>
                <div class="campo">
                    <span style="text-transform: uppercase;">${calleDestinatario} ${alturaDestinatario}</span>
                </div>
                <div class="campo">
                    <span>Teléfono: ${telefonoDestinatario}</span>
                </div>
                <div class="campo">
                    <span>Autorizado: ${recibe}</span>
                </div>
                <div class="campo">
                    <span>Observaciones: ${observaciones}</span>
                </div>`;

        // Agregar información sobre el camión
        contenido += `<div class="campo"><strong>DIA DE VENCIMIENTO: ${diaFormateado}</strong></div>`;

        const idOperacionsSinMe1 = idOperacion.replace(/ME1$/, '');

        contenido += `
                <div class="campo-extra">
                    <img src="${barcodeBase64}" alt="Código de Barras" />
                </div>
                <div class="contacto">
                    <hr>
                    <p><strong>Operación: ${idOperacionsSinMe1}</strong></p>
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

            const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);
            NroEnvio.innerHTML = `Logistica Propia`;

            let trackingMessage = ''; // Inicializar la variable

            // Generar el mensaje de seguimiento basado en la logística
            if (logBsCps.includes(Number(Cp))) {
                trackingMessage = `Hola ${NombreyApellido || recibe} ¡Gracias por tu compra!
                Queremos informarte que vamos a visitarte el ${diaFormateado}.
                Por favor, confírmanos un 📞 actualizado para poder coordinar la entrega. Si no vas a estar ese día, podés autorizar a otra persona enviándonos por este medio su nombre completo y DNI. También podes brindarnos un domicilio alternativo.
                Cualquier consulta, estamos a tu servicio. ¡Gracias!
                Equipo Posventa Novogar
                ENVIO CON LOGISTICA BUENOS AIRES`;
            } else if (logStaFeCps.includes(Number(Cp))) {
                trackingMessage = `Hola ${NombreyApellido} ¡Gracias por tu compra!
                Queremos informarte que vamos a visitarte el ${diaFormateado}.
                Por favor, confírmanos un 📞 actualizado para poder coordinar la entrega. Si no vas a estar ese día, podés autorizar a otra persona enviándonos por este medio su nombre completo y DNI. También podes brindarnos un domicilio alternativo.
                Cualquier consulta, estamos a tu servicio. ¡Gracias!
                Equipo Posventa Novogar
                ENVIO CON LOGISTICA SANTA FE`;
            } else if (logSanNicolasCps.includes(Number(Cp))) {
                trackingMessage = `Hola ${NombreyApellido} ¡Gracias por tu compra!
                Queremos informarte que vamos a visitarte el ${diaFormateado}.
                Por favor, confírmanos un 📞 actualizado para poder coordinar la entrega. Si no vas a estar ese día, podés autorizar a otra persona enviándonos por este medio su nombre completo y DNI. También podes brindarnos un domicilio alternativo.
                Cualquier consulta, estamos a tu servicio. ¡Gracias!
                Equipo Posventa Novogar
                ENVIO CON LOGISTICA SAN NICOLAS`;
            } else if (logRafaelaCps.includes(Number(Cp))) {
                trackingMessage = `Hola ${NombreyApellido || recibe} ¡Gracias por tu compra!
                Queremos informarte que vamos a visitarte el ${diaFormateado}.
                Por favor, confírmanos un 📞 actualizado para poder coordinar la entrega. Si no vas a estar ese día, podés autorizar a otra persona enviándonos por este medio su nombre completo y DNI. También podes brindarnos un domicilio alternativo.
                Cualquier consulta, estamos a tu servicio. ¡Gracias!
                Equipo Posventa Novogar
                ENVIO CON LOGISTICA RAFAELA`;
            } else {
                // Mensaje para otras zonas
                trackingMessage = `Hola ${NombreyApellido || recibe} ¡Gracias por tu compra!
                ¡Tenemos buenas noticias!🎉 Tu producto ya está listo para ser enviado por nuestra logística: ${diaFormateado}. Ten en cuenta que la fecha de entrega es estimativa, por lo que podrías recibirlo un poco antes. Te recomendamos estar atento a tu teléfono, ya que te contactaremos 20 minutos antes de llegar.
                Estamos a tu servicio.
                ¡Saludos!
                Equipo Posventa Novogar`;
            }

            const idOperacionSinME1 = idOperacion.replace(/ME1$/, '');

            // Actualizar en Firebase
            firebase.database().ref('envios/' + idOperacionSinME1).update({
                trackingNumber: "Logistica Novogar",
                trackingLink: "Logistica Novogar",
                trackingMessage: trackingMessage,
                transportCompany: "Novogar",
                cliente: numeroCliente,
                remito: numeroRemito
            }).then(() => {
                console.log(`Datos actualizados en Firebase para la operación: ${idOperacionSinME1}`);
            }).catch(error => {
                console.error('Error al actualizar en Firebase:', error);
            });

            // Crear un enlace para abrir el PDF en una nueva ventana
            const pdfUrl = URL.createObjectURL(pdfBlob);

            setTimeout(() => {
                spinner2.style.display = "none";
                // Ocultar el spinner y restaurar el botón
                spinner.style.display = "none";
                window.open(pdfUrl, '_blank');
                button.innerHTML = '<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta Novogar';
                button.classList.remove('btn-secondary');
                button.classList.add('btn-success');
                button.disabled = false;
            }, 2000);

            document.body.removeChild(tempDiv);
        });

    }; // Fin de reader.onloadend

    // Leer el blob como Data URL
    reader.readAsDataURL(blob);

    const nombre = NombreyApellido;
    const remito = idOperacion.replace(/ME1$/, '');
    const Name = `Confirmación de envio Mercado Libre`;
    const Subject = `Tu compra en Novogar ${remito} ya fue preparada para despacho`;
    const template = "emailTemplateLogPropia";

    await sendEmail(Name, Subject, template, nombre, email, remito);
}
// FIN GENERAR ETIQUETA LOGISTICA PROPIA

// Llama a cargarDatos para iniciar el proceso
cargarDatos();



