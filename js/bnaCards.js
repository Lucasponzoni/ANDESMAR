// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBIXlgOct2UzkrZbZYbyHu6_NbLDzTqqig",
    authDomain: "despachos-novogar.firebaseapp.com",
    databaseURL: "https://despachos-novogar-default-rtdb.firebaseio.com",
    projectId: "despachos-novogar",
    storageBucket: "despachos-novogar.appspot.com",
    messagingSenderId: "346020771441",
    appId: "1:346020771441:web:c4a29c0db4200352080dd0",
    measurementId: "G-64DDP7D6Q2"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let idCDS, usuarioCDS, passCDS;

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
        console.log(`CDS Credentials OK`);
    } catch (error) {
        console.error('Error al obtener cred de Fire:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerCredencialesCDS();
    await cargarPrecios();
    await iniciarVerificacion();
    await loadEnviosFromFirebase();
});

let logBsCps = []; // Array para almacenar los CPs de LogBsAs
let logStaFeCps = []; // Array para almacenar los CPs de LogSantaFe
let logRafaelaCps = []; // Array para almacenar los CPs de LogRafaela
let logSanNicolasCps = []; // Array para almacenar los CPs de LogSanNicolas
let logCDSCps = []; // Array para almacenar los CPs de Cruz del Sur

// Función para cargar los CPs de LogBsAs
function cargarCpsLogBsAs() {
    return dbMeli.ref('LogBsAs').once('value').then(snapshot => {
        const logBsData = snapshot.val();
        if (logBsData) {
            logBsCps = Object.keys(logBsData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogSantaFe
function cargarCpsLogStaFe() {
    return dbMeli.ref('LogSantaFe').once('value').then(snapshot => {
        const logStaFeData = snapshot.val();
        if (logStaFeData) {
            logStaFeCps = Object.keys(logStaFeData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogRafaela
function cargarCpsLogRafaela() {
    return dbMeli.ref('LogRafaela').once('value').then(snapshot => {
        const logRafaelaData = snapshot.val();
        if (logRafaelaData) {
            logRafaelaCps = Object.keys(logRafaelaData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogSanNicolas
function cargarCpsLogSanNicolas() {
    return dbMeli.ref('LogSanNicolas').once('value').then(snapshot => {
        const logSanNicolasData = snapshot.val();
        if (logSanNicolasData) {
            logSanNicolasCps = Object.keys(logSanNicolasData).map(cp => Number(cp));
        }
    });
}

// Función para cargar los CPs de LogCDS
function cargarCpsLogCDS() {
    return dbMeli.ref('LogCDS').once('value').then(snapshot => {
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

// CARGA SKU
// Función para cargar SKU desde Firebase
function cargarSKUs(ref, listBodyId, loadingSpinnerId) {
    const skuListBody = document.getElementById(listBodyId);
    const loadingSpinner = document.getElementById(loadingSpinnerId);
    loadingSpinner.style.display = 'block'; // Mostrar spinner

    firebase.database().ref(ref).once('value').then(snapshot => {
        skuListBody.innerHTML = ''; // Limpiar la tabla
        snapshot.forEach(childSnapshot => {
            const sku = childSnapshot.val().sku; // Asegúrate que 'sku' sea la propiedad correcta
            const stock = childSnapshot.val().stock || 0; // Obtener stock, default a 0 si no existe
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span style="flex: 1;">${sku}</span> <!-- Aquí se carga el SKU -->
                </td>
                <td>
                    <span style="font-size: 0.75em; color: #2f3e51; background: #e8f0fe; padding: 4px 10px; border-radius: 6px; margin-left: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Stock: <strong style="font-weight: 800;">${stock}</strong>
                    </span>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="eliminarSKU('${ref}', '${childSnapshot.key}', '${listBodyId}', '${loadingSpinnerId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            skuListBody.appendChild(row);
        });
        loadingSpinner.style.display = 'none'; // Ocultar spinner
    }).catch(error => {
        console.error("Error al cargar SKU: ", error);
        loadingSpinner.style.display = 'none'; // Ocultar spinner
    });
}

// Función para agregar nuevo SKU
function agregarSKU(ref, inputId, alertContainerId, loadingSpinnerId, listBodyId) {
    const newSku = document.getElementById(inputId).value;
    const alertContainer = document.getElementById(alertContainerId);

    if (newSku) {
        const newRef = firebase.database().ref(ref + '/' + newSku.replace(/\s+/g, '_'));

        // Verificar si el SKU ya existe
        newRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                // SKU ya existe
                mostrarAlerta(alertContainerId, 'El SKU ya existe en el listado', 'danger');
            } else {
                // Agregar nuevo SKU
                newRef.set({ sku: newSku, stock: 0 }) // Puedes ajustar el stock inicial aquí
                    .then(() => {
                        console.log(`SKU agregado: ${newSku}`);
                        mostrarAlerta(alertContainerId, 'Se ha agregado el SKU al listado', 'success');
                        cargarSKUs(ref, listBodyId, loadingSpinnerId); // Recargar la lista de SKU
                        document.getElementById(inputId).value = ''; // Limpiar input
                    })
                    .catch(error => {
                        console.error("Error al agregar SKU: ", error);
                    });
            }
        });
    }
}

// Función para mostrar alertas
function mostrarAlerta(alertContainerId, mensaje, tipo) {
    const alertContainer = document.getElementById(alertContainerId);
    alertContainer.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            <i class="${tipo === 'danger' ? 'fas fa-exclamation-triangle' : 'fas fa-check'}"></i>
            ${mensaje}
        </div>
    `;
    alertContainer.style.display = 'block'; // Mostrar alerta

    // Ocultar alerta después de 5 segundos
    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 5000);
}

// Función para eliminar SKU
function eliminarSKU(ref, key, listBodyId, loadingSpinnerId) {
    firebase.database().ref(ref + '/' + key).remove()
        .then(() => {
            console.log(`SKU eliminado: ${key}`);
            cargarSKUs(ref, listBodyId, loadingSpinnerId); // Recargar la lista de SKU
        })
        .catch(error => {
            console.error("Error al eliminar SKU: ", error);
        });
}

// Limpiar el input y cargar los SKU al abrir el modal
$('#skuModal').on('show.bs.modal', () => {
    document.getElementById('newSkuInput').value = ''; // Limpiar el input
    cargarSKUs('imei', 'skuListBody', 'loadingSpinner'); // Cargar los SKU al abrir el modal
    
    // Agregar event listener para agregar SKU en el modal
    const addSkuButton = document.getElementById('addSkuButton');
    if (addSkuButton) {
        addSkuButton.addEventListener('click', () => {
            agregarSKU('imei', 'newSkuInput', 'alertContainer', 'loadingSpinner', 'skuListBody');
        });
    }
});

// Limpiar el input y cargar los SKU al abrir el modal PlaceIt
$('#skuPlaceItModal').on('show.bs.modal', () => {
    document.getElementById('newSkuInputPlaceIt').value = ''; // Limpiar el input
    cargarSKUs('stockPlaceIt', 'skuPlaceItListBody', 'loadingSpinnerPlaceIt'); // Cargar los SKU al abrir el modal
    
    // Agregar event listener para agregar SKU en el modal PlaceIt
    const addSkuButtonPlaceIt = document.getElementById('addSkuButtonPlaceIt');
    if (addSkuButtonPlaceIt) {
        addSkuButtonPlaceIt.addEventListener('click', () => {
            agregarSKU('stockPlaceIt', 'newSkuInputPlaceIt', 'alertContainerPlaceIt', 'loadingSpinnerPlaceIt', 'skuPlaceItListBody');
        });
    }
});
// FIN CARGA SKU

// VERIFICA ORDENES DUPLICADAS

// Referencias separadas
const baseRef = firebase.database().ref('enviosBNA'); // Para actualizar
const databaseRef = baseRef.limitToLast(1000); // Para leer

function verificarRemitosDuplicados() {
    let remitoCount = {};
    let remitosDuplicados = [];

    databaseRef.once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const remito = data.orden_;

            if (remito) {
                if (remitoCount[remito]) {
                    remitoCount[remito]++;
                    remitosDuplicados.push(remito);
                } else {
                    remitoCount[remito] = 1;
                }
            }
        });

        Object.keys(remitoCount).forEach((remito) => {
            if (remitoCount[remito] > 1) {
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    if (data.orden_ === remito) {
                        // Usar baseRef (sin limitToLast) para actualizar
                        baseRef.child(childSnapshot.key).update({ carritoCompra2: true });
                    }
                });
            }
        });
    });
}

verificarRemitosDuplicados();
// FIN VERIFICA ORDENES DUPLICADAS

// IMPORTAR CSV
let allData = [];
let currentPage = 1;
let itemsPerPage = 60; // Número de elementos por página
let currentPageGroup = 0;
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById("searchBna");
const filterSelect = document.getElementById("filter");

document.getElementById('importButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const cardsContainer = document.getElementById('meli-cards');
    const spinner = document.createElement('div');

    spinner.className = 'spinner-border text-primary';
    spinner.role = 'status';
    spinner.innerHTML = `<span class="sr-only">Cargando...</span>`;
    cardsContainer.appendChild(spinner);

    if (file) {
        // Usar PapaParse para leer el archivo CSV
        Papa.parse(file, {
            header: true, // Usar la primera fila como cabeceras
            complete: async function(results) {
                const data = results.data;

                // Validación del archivo
                const headers = Object.keys(data[0] || {});

                const tieneOrdenOUOrigin = headers.includes('orden_') || headers.includes('Origin');
                const contieneOrdenSanitizado = headers.some(header => sanitizeHeader(header) === 'orden_');

                if (data.length === 0 || (!tieneOrdenOUOrigin && !contieneOrdenSanitizado)) {
                    cardsContainer.removeChild(spinner);
                    await Swal.fire({ 
                        icon: 'error',
                        title: 'Archivo inválido',
                        html: `<div style="text-align:left;">
                            <p>❌ <b>No es un resumen de ventas válido</b></p>
                            <p>No contiene <code>orden_ (Avenida)</code> o <code>Origin (Bapro)</code></p>
                        </div>`,
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                let importedCount = 0;
                let existingCount = 0;
                let skippedCount = 0;
                let changedInfo = 0;
                const promises = [];

                let spinner2 = document.getElementById("spinner2");
                spinner2.style.display = "flex";

                const keysMapping = {
                    "apellido": "Client Last Name",
                    "cantidad": "Quantity_SKU",
                    "celular_factura": "Phone", 
                    "telefono": "Phone",
                    "ciudad": "City",
                    "ciudad_factura": "City",
                    "codigo_postal": "Postal Code",
                    "codigo_postal_factura": "Postal Code",
                    "dni": "Client Document",
                    "doc_pago": "Client Document",
                    "documento_factura": "Client Document",
                    "email": "Email",
                    "email_factura": "Email",
                    "fecha_creacion_orden": "Creation Date",
                    "info_factura": "Street + Number",
                    "marca_de_tarjeta": "Payment System Name",
                    "monto_cobrado": "Shipping Value",
                    "nombre": "Client Name",
                    "nombre_completo_envio": "Receiver Name",
                    "nombre_factura": "Receiver Name",
                    "nombre_y_apellido_tarjeta": "Receiver Name",
                    "nro_de_cuotas": "Installments",
                    "numeros_tarjeta": "Card Last Digits",
                    "orden_": "Order",
                    "orden_publica_": "Order",
                    "precio_producto": "SKU Value",
                    "precio_venta": "SKU Selling Price",
                    "producto_nombre": "SKU Name",
                    "provincia": "UF",
                    "provincia_factura": "UF",
                    "sku_externo": "Reference Code",
                    "suborden_": "Order",
                    "suborden_total": "Total Value",
                    "total_dinero": "Total Value",
                    "direccion": "Street + Number",
                    "direccion_facturacion": "Street + Number"
                };

                data.forEach(row => {
                    if (Object.keys(row).length > 0) {
                        const envioData = {};

                        // Sanitizar y mapear datos
                        for (const key in keysMapping) {
                            const headerDestino = keysMapping[key];

                            if (headerDestino.includes('+')) {
                                // Concatenar datos si el encabezado tiene un '+'
                                const parts = headerDestino.split('+').map(part => part.trim());
                                envioData[key] = parts.map(part => {
                                    const partValue = row[part];
                                    return partValue !== undefined ? sanitizeValue(partValue) : '';
                                }).filter(Boolean).join(' ');
                            } else if (row[headerDestino] !== undefined) {
                                let value = sanitizeValue(row[headerDestino]);

                                // Si el header destino es "Phone", quitar +54
                                if (headerDestino === "Phone") {
                                    value = value.replace(/^\+54/, '').trim();
                                }
                                // Si el header destino es "Creation Date", formatear fecha
                                if (headerDestino === "Creation Date") {
                                    value = formatDate(row[headerDestino]);
                                }
                                envioData[key] = value;
                            }
                        }

                        // Además, sanitizar los headers originales por si hay otros campos
                        for (const header in row) {
                            if (row[header] !== undefined && row[header] !== '') { // Verificar que no sea undefined o vacío
                                let value = sanitizeValue(row[header]);

                                // Eliminar +54 de teléfono y celular
                                if (header === "telefono" || header === "celular_factura") {
                                    value = value.replace(/^\+54/, '').trim();
                                }

                                // Formatear fecha si es "fecha_creacion_orden"
                                if (header === "fecha_creacion_orden") {
                                    value = formatDate(value);
                                }

                                envioData[sanitizeHeader(header)] = value;
                            }
                        }

                        const orden = envioData['orden_'] || envioData['origin']; // Usar 'origin' si no hay 'orden_'

                        // Verificar si 'orden' o 'origin' no están vacíos
                        if (!orden) {
                            skippedCount++; // Contar como omitido si está vacío
                            return; // Salir de este ciclo para no procesar el registro
                        }

                        // Verificar si ya existe en Firebase
                        const envioRef = firebase.database().ref('enviosBNA');
                        promises.push(
                            envioRef.orderByChild('orden_').equalTo(orden).once('value').then(snapshot => {
                                if (!snapshot.exists()) {
                                    return envioRef.push().set(envioData).then(() => {
                                        importedCount++;
                                    });
                                } else {
                                    existingCount++;
                                    const existingData = snapshot.val();
                                    const existingKey = Object.keys(existingData)[0];

                                    // Comprobar si los valores son diferentes y actualizar si es necesario
                                    const existingSeguimiento = existingData[existingKey].numero_de_seguimiento;
                                    const existingMedioEnvio = existingData[existingKey].medio_de_envio;
                                    const existingEstadoEnvio = existingData[existingKey].estado_del_envio;

                                    let needsUpdate = false;
                                    const updates = {};

                                    if (existingSeguimiento !== envioData.numero_de_seguimiento) {
                                        updates.numero_de_seguimiento = envioData.numero_de_seguimiento;
                                        needsUpdate = true;
                                    }
                                    if (existingMedioEnvio !== envioData.medio_de_envio) {
                                        updates.medio_de_envio = envioData.medio_de_envio;
                                        needsUpdate = true;
                                    }
                                    if (existingEstadoEnvio !== envioData.estado_del_envio) {
                                        updates.estado_del_envio = envioData.estado_del_envio;
                                        needsUpdate = true;
                                    }

                                    if (needsUpdate) {
                                        if (envioData.estado_del_envio === "entregado") {
                                            updates.marcaEntregado = "Si";
                                        }
                                        if (envioData.estado_del_envio !== "sin despachar") {
                                            updates.marcaPreparado = "Si";
                                        }

                                        return envioRef.child(existingKey).update(updates).then(() => {
                                            changedInfo++;
                                        });
                                    }
                                }
                            }).catch(error => {
                                console.error('Error al verificar existencia en Firebase:', error);
                            })
                        );
                    } else {
                        skippedCount++;
                    }
                });

                Promise.all(promises)
                    .then(() => {
                        spinner2.style.display = "none";
                        Swal.fire({
                            title: 'Importación completada',
                            html: `
                                <div style="text-align: left; font-size: 1.1em;">
                                    <p><span class="counter2 imported">${importedCount}</span> Ventas importadas a la base de datos.</p>
                                    <p><span class="counter2 existing">${existingCount}</span> Ya se encontraban en planilla.</p>
                                    <p><span class="counter2 skipped">${skippedCount}</span> Registros omitidos por estar vacíos.</p>
                                    <p><span class="counter2 changed">${changedInfo}</span> Registros de envíos actualizados.</p>
                                </div>
                            `,
                            icon: 'success',
                            confirmButtonText: 'OK',
                            customClass: {
                                popup: 'ios-style-popup',
                                title: 'ios-style-title',
                                content: 'ios-style-content',
                                confirmButton: 'ios-style-confirm-button'
                            }
                        }).then(() => {
                            location.reload();
                        });
                    })
                    .catch(error => {
                        spinner2.style.display = "none";
                        Swal.fire({
                            title: 'Error',
                            text: 'Ocurrió un error al importar los datos',
                            icon: 'error',
                            confirmButtonText: 'OK',
                            customClass: {
                                popup: 'ios-style-popup',
                                title: 'ios-style-title',
                                content: 'ios-style-content',
                                confirmButton: 'ios-style-confirm-button'
                            }
                        });
                    });
            }
        });
    }
});
// FIN IMPORTAR CSV

// Función para sanitizar cabeceras
function sanitizeHeader(header) {
    return header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.#$\/\[\]]/g, '');
}

// Función para sanitizar valores
function sanitizeValue(value) {
    return value ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : ''; // Verificar que el valor no sea undefined
}

// Función para formatear la fecha (LOCAL)
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function capitalizeWords(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function lowercaseWords(str) {
    return str ? str.toLowerCase() : '';
}

// CARGAR PRECIOS Y STOCK
let preciosArray = [];
let preciosPlaceItArray = [];

// Función para cargar precios y stock
function cargarPrecios() {
    // Cargar precios
    return dbStock.ref('precios/').once('value')
        .then(preciosSnapshot => {
            // Verificamos si hay datos en precios
            if (preciosSnapshot.exists()) {
                preciosSnapshot.forEach(childSnapshot => {
                    const childData = childSnapshot.val();
                    preciosArray.push({
                        sku: childData.sku,
                        stock: childData.stock
                    });
                });
                console.log("Stock sincronizado con éxito.");
                console.log("Contenido de preciosArray:", preciosArray); // Mostrar preciosArray
            } else {
                console.log("No hay datos en la ruta especificada para precios.");
            }

            // Cargar precios de PlaceIt
            return dbStock.ref('preciosPlaceIt/').once('value');
        })
        .then(preciosPlaceItSnapshot => {
            // Verificamos si hay datos en preciosPlaceIt
            if (preciosPlaceItSnapshot.exists()) {
                preciosPlaceItSnapshot.forEach(childSnapshot => {
                    const childData = childSnapshot.val();
                    preciosPlaceItArray.push({
                        sku: childData.sku,
                        stock: childData.stock
                    });
                });
                console.log("Precios de PlaceIt sincronizados con éxito.");
                console.log("Contenido de preciosPlaceItArray:", preciosPlaceItArray); // Mostrar preciosPlaceItArray
            } else {
                console.log("No hay datos en la ruta especificada para precios de PlaceIt.");
            }
        })
        .catch(error => {
            console.error("Error al acceder a la base de datos:", error);
        });
}
// FIN CARGAR PRECIOS Y STOCK

// CARGAR DATOS DE FIREBASE
async function loadEnviosFromFirebase() {
    const cardsContainer = document.getElementById('meli-cards');
    const spinner = document.getElementById('spinner');
    
    if (cardsContainer) {
        cardsContainer.innerHTML = '';
    }

    searchInput.disabled = true;
    searchInput.value = "Aguardando que cargue la web ⏳";

    if (spinner) {
        spinner.style.display = 'block';
    }

    firebase.database().ref('imei/').once('value')
        .then(skuSnapshot => {
            skusList = [];
            skuSnapshot.forEach(childSnapshot => {
                skusList.push(childSnapshot.val().sku);
            });

    firebase.database().ref('stockPlaceIt/').once('value')
        .then(skuSnapshot => {
            skusPlaceItList = [];
            skuSnapshot.forEach(childSnapshot => {
                skusPlaceItList.push(childSnapshot.val().sku);
            });

            // Escuchar cambios en 'enviosBNA'
            const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
            databaseRef.on('value', snapshot => {
                allData = [];
                let sinPrepararCount = 0;
                let sinFacturarCount = 0;
                let sinMarcar1Count = 0; 
                let sinMarcar2Count = 0; 
                let duplicados = 0; 
                let slackError = 0; 

                snapshot.forEach(function(childSnapshot) {
                    const data = childSnapshot.val();
                    allData.push({
                        id: childSnapshot.key,
                        altura: data.altura,
                        cancelado: data.cancelado,
                        nombreFacturacion: capitalizeWords(data.nombre) || capitalizeWords(data.Nombre),
                        apellidoFacturacion: capitalizeWords(data.apellido) || capitalizeWords(data.Apellido),
                        nombre: capitalizeWords(data.nombre_completo_envio),
                        cp: data.codigo_postal,
                        localidad: capitalizeWords(data.ciudad),
                        provincia: capitalizeWords(data.provincia),
                        calle: data.calle,
                        calle2: capitalizeWords(data.direccion ? data.direccion.replace(/"/g, '') : ''),
                        telefono: data.telefono,
                        telefono_facturacion: data.telefono_facturacion,
                        email: lowercaseWords(data.email),
                        remito: data.orden_,
                        carrito: data.carritoCompra2,
                        diaPlaceIt: data.diaPlaceIt,
                        observaciones: data.observaciones,
                        orden_publica_: data.orden_publica_,
                        brand_name: capitalizeWords(data.brand_name),
                        marca_de_tarjeta: capitalizeWords(data.marca_de_tarjeta),
                        cuotas: data.cuotas,
                        nro_de_cuotas: data.nro_de_cuotas,
                        envio: data.medio_de_envio,
                        cupon: data.cupon,
                        numeroSeguimiento: data.numero_de_seguimiento,
                        cotizacion: data.cotizacion,
                        trackingNumber: data.trackingNumber,
                        precio_venta: data.precio_venta,
                        cliente: data.cliente,
                        cod_aut: data.cod_aut,
                        total_con_tasas_2: data.total_con_tasas_2,
                        precio_producto: data.precio_producto,
                        suborden_total: data.suborden_total,
                        suborden_: data.suborden_,
                        numeros_tarjeta: data.numeros_tarjeta,
                        orden_publica: data.orden_publica_,
                        sku: data.sku_externo.toUpperCase(),
                        cantidad: data.cantidad,
                        errorSlack: data.errorSlack,
                        correccionSlack: data.correccionSlack,
                        errorSlackMensaje: data.errorSlackMensaje,
                        fechaDeCreacion: data.fecha_creacion_orden,
                        datoFacturacion: data.datoFacturacion,
                        producto_nombre: capitalizeWords(data.producto_nombre),
                        tipoElectrodomesticoBna: data.tipoElectrodomesticoBna,
                        trackingLink: data.trackingLink,
                        transportCompany: data.transportCompany,
                        transportCompanyNumber: data.transportCompanyNumber,
                        razon_social: capitalizeWords(data.razon_social),
                        cuit: data.cuit,
                        marcaEntregado: data.marcaEntregado,
                        marcaPreparado: data.marcaPreparado,
                        direccion: capitalizeWords(data.direccion.replace(/"/g, '').replace(/:\s*-?\s*/i, '')),
                        direccion_facturacion: capitalizeWords(data.direccion_facturacion ? data.direccion_facturacion.replace(/Dpto:\s*-?\s*/i, '') : ''),
                        ciudad_facturacion: capitalizeWords(data.ciudad_facturacion),
                        ciudad_factura: capitalizeWords(data.ciudad_factura),
                        dni: data.dni,
                        nombre_factura: capitalizeWords(data.nombre_factura),
                        estadoEnvio: data.estado_del_envio,
                        codigo_postal_facturacion: data.codigo_postal_facturacion,
                        codigo_postal_factura: data.codigo_postal_factura,
                        otros_comentarios_entrega: data.otros_comentarios_entrega,
                        iva: data.condicion_iva,
                        iva2: data.iva,
                        equivalencia_puntos_pesos: data.equivalencia_puntos_pesos || data['equivalencia_puntos_-_pesos'],
                        nombre_completo_envio: capitalizeWords(data.nombre_completo_envio),
                        monto_cobrado: data.monto_cobrado
                    });

                    if (!data.marcaPreparado || data.marcaPreparado === 'No') {
                        sinMarcar1Count++;
                    }
                    
                    if (!data.marcaEntregado || data.marcaEntregado === 'No') {
                        sinMarcar2Count++;
                    }                    

                    if (data.carritoCompra2) {
                        duplicados++;
                    }

                    if (data.errorSlack === true) { 
                        slackError++;
                    }

                    // Incrementar el contador si tipoElectrodomesticoBna está vacío
                    if (!data.tipoElectrodomesticoBna && data.datoFacturacion) {
                        sinPrepararCount++;
                    }

                    // Incrementar el contador si datoFacturacion está vacío
                    if (!data.datoFacturacion) {
                        sinFacturarCount++;
                    }
                });

                // Renderizar las tarjetas y la paginación
                allData.reverse();
                renderCards(allData);
                updatePagination(allData.length);

                // Actualizar el contador en el botón
                document.getElementById('contadorCards').innerText = sinPrepararCount;
                document.getElementById('contadorCards1').innerText = sinMarcar1Count; 
                document.getElementById('contadorCards2').innerText = sinMarcar2Count; 
                document.getElementById('contadorCards3').innerText = duplicados; 
                document.getElementById('contadorCards4').innerText = slackError; 
                document.getElementById('contadorCardsFacturar').innerText = sinFacturarCount;

                // Habilitar el buscador después de cargar los datos
                searchInput.disabled = false;
                searchInput.value = "";

                if (spinner) {
                    spinner.remove(); // Ocultar spinner después de cargar los datos
                }
            });
        });
    })
        .catch(error => {
            console.error("Error al cargar los envíos desde Firebase: ", error);
            if (spinner) {
                spinner.remove(); // Asegurarse de ocultar el spinner en caso de error
            }
        });
}

// Función para obtener la URL
function getOrderUrl(ordenPublica) {
    let shopCode;

    // Si comienza con "bpr", usar código 6572
    if (ordenPublica.toLowerCase().startsWith('bpr')) {
        shopCode = "6572";
    } else {
        shopCode = ordenPublica.split('-').pop(); // Obtener los últimos 4 dígitos
    }

    switch (shopCode) {
        case "2941":
            return `https://api.avenida.com/manage/shops/2941/orders/${ordenPublica}`;
        case "2942":
            return `https://api.avenida.com/manage/shops/2942/orders/${ordenPublica}`;
        case "2943":
            return `https://api.avenida.com/manage/shops/2943/orders/${ordenPublica}`;
        case "1914":
            return `https://api-macro.avenida.com/manage/shops/1914/orders/${ordenPublica}`;
        case "1915":
            return `https://api-macro.avenida.com/manage/shops/1915/orders/${ordenPublica}`;
        case "6572":
            return `https://novogar252.myvtex.com/admin/orders`;
        default:
            return '#'; // URL por defecto si no coincide
    }
}

const cpsAndesmar = [
    ...Array.from({length: 501}, (_, i) => i + 1000), // Del 1000 al 1500
    1602,1603,1605,1606,1607,1609,1611,1612,1613,
    1614,1615,1617,1618,1619,1620,1621,1623,1625,1627,
    1629,1631,1633,1635,1636,1638,1640,1641,1642,1643,
    1644,1646,1648,1650,1651,1653,1655,1657,1659,1661,
    1663,1664,1665,1667,1669,1671,1672,1674,1676,1678,
    1682,1684,1686,1688,1702,1704,1706,1708,1712,1713,
    1714,1716,1718,1722,1723,1742,1744,1746,1748,1752,
    1754,1755,1757,1759,1763,1765,1766,1768,1770,1771,
    1772,1773,1774,1776,1778,1802,1804,1805,1806,1812,
    1822,1824,1825,1826,1828,1832,1834,1835,1836,1838,
    1842,1846,1852,1854,1856,1870,1871,1872,1874,1875,
    1876,1878,1879,1882,1884,1885,1886,1888,1889,1890,
    1891,1894,1895,1896,1897,1900,1901,1923,1925,8000,
    4700,4707,2400,2415,2419,2424,2434,2566,2568,2587,
    2594,2624,2657,2677,2681,5000,5001,5002,5003,5004,
    5005,5006,5007,5008,5009,5010,5011,5012,5013,5014,
    5015,5016,5017,5021,5022,5023,5101,5103,5105,5107,
    5109,5111,5113,5123,5125,5127,5145,5147,5149,5151,
    5152,5166,5168,5172,5174,5176,5182,5184,5186,5194,
    5220,5223,5236,5280,5800,5817,5841,5850,5870,5885,
    5889,5891,5900,5903,5923,5960,5972,5974,5980,5986,
    5988,4500,4600,4612,5300,5500,5501,5503,5505,5507,
    5509,5511,5513,5515,5517,5519,5521,5523,5525,5527,
    5529,5531,5533,5535,5537,5539,5541,5543,5544,5545,
    5547,5549,5551,5560,5561,5563,5565,5567,5569,5570,
    5571,5572,5573,5575,5577,5579,5582,5584,5585,5587,
    5589,5590,5591,5592,5594,5595,5596,5598,5600,5601,
    5603,5605,5607,5609,5611,5612,5613,5615,5620,5621,
    5622,5623,5624,5632,5634,5636,5637,4400,4403,4530,
    4560,2123,2142,2144,2170,2440,2449,2451,2452,2453,
    2454,2505,2535,2580,2121,2124,2125,2126,2127,2128,
    2133,2136,2138,2143,2146,2154,2156,2200,2202,2204,
    2252,2500,2506,2508,2520,2919,2000,2001,2002,2003,
    2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,
    2130,2131,2132,2134,2152,5400,5401,5403,5405,5406,
    5407,5409,5411,5413,5415,5417,5419,5420,5421,5423,
    5424,5425,5427,5429,5431,5433,5435,5436,5438,5439,
    5442,5443,5444,5446,5447,5449,5460,5461,5463,5465,
    5467,5700,5701,5703,5705,5709,5710,5711,5713,5719,
    5730,5731,5733,5735,5736,5738,5750,5753,5755,5759,
    5770,5773,5777,5831,5835,5881,5883,6216,6277,6279,
    6389,9011,9400,4000,4101,4103,4105,4107,4109,4111,
    4117,4128,4129,4132,4142,4144,4146,4152,4153,4158,
    4166,4168,4178,4182
];

const cpsCDS = [
    8300, 8305, 8318, 9037, 9203, 8328, 9033, 8345, 8353, 8354, 
    8305, 8312, 8313, 9001, 8324, 8306, 8400, 8353, 9011, 9111, 
    8305, 9420, 9013, 8349, 9303, 8309, 8326, 8366, 8326, 8337, 
    8364, 8360, 9217, 8353, 8303, 8324, 8332, 8333, 9020, 8307, 
    8418, 9000, 9002, 9003, 9004, 9005, 9006, 9008, 9010, 8301, 
    8349, 8416, 9201, 8364, 8351, 8332, 8328, 8322, 8364, 8319, 
    9009, 8402, 9107, 8430, 9405, 9050, 9301, 8353, 9017, 8431, 
    8349, 9019, 9210, 8319, 8307, 9211, 9200, 8361, 8300, 9420, 
    9421, 9105, 9121, 9007, 9121, 8503, 8336, 8325, 8332, 9223, 
    9311, 9201, 9207, 8353, 8334, 9220, 9407, 8371, 9019, 8134, 
    9407, 8370, 8370, 8370, 9431, 8363, 9107, 8430, 8521, 9017, 
    8307, 8347, 8353, 8355, 9101, 9213, 8305, 8300, 8349, 9127, 
    9041, 8424, 9017, 8326, 9001, 8422, 8370, 8416, 8300, 8302, 
    8415, 8416, 4190, 8332, 9000, 9310, 9207, 9201, 9040, 9015, 
    8313, 8315, 9103, 8532, 8318, 8316, 8363, 9050, 9120, 9120, 
    9310, 9300, 8319, 9405, 9300, 8370, 9001, 9103, 8319, 8415, 
    8138, 9400, 9402, 9403, 9420, 9030, 9225, 9407, 9407, 8520, 
    8370, 8305, 9420, 8305, 9020, 8320, 8305, 8534, 8532, 8353, 
    9201, 9121, 9420, 9412, 9100, 9203, 9410, 9007, 8536, 9107, 
    9408, 8500, 8311, 8407, 8308, 8345, 8336, 8403, 8309, 8300, 
    8300, 8318, 8318, 9400, 9400, 9400, 8319, 8307, 8307, 8319, 
    8324, 8319, 9400, 8305, 8319, 8300, 9400, 8332, 9400, 9420, 
    9400, 8305, 8319, 8318, 8318, 8300, 8322, 8353, 8318, 9001, 
    8307, 8318, 8340
];

const cpsPlaceIt = [
    1701, 1710, 1756, 1654, 1809, 1875, 1872, 1868, 1869, 1871,
    1870, 1650, 1655, 1651, 1653, 1672, 1686, 1688, 1715, 1714,
    1713, 1757, 1765, 1766, 1751, 1752, 1755, 1704, 1754, 1753,
    1823, 1824, 1825, 1826, 1822, 1828, 1821, 1827, 1832, 1834,
    1612, 1613, 1614, 1716, 1722, 1718, 1712, 1685, 1706, 1708,
    1707, 1639, 1835, 1876, 1877, 1878, 1879, 1644, 1641, 1643,
    1640, 1642, 1607, 1661, 1659, 1611, 1690, 1678, 1691, 1684,
    1702, 1692, 1703, 1657, 1683, 1687, 1689, 1676, 1682, 1675,
    1674, 1606, 1602, 1604, 1637, 1605, 1636, 1638, 1652, 1603,
    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010,
    1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020,
    1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030,
    1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040,
    1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050,
    1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060,
    1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1070,
    1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080,
    1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090,
    1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100,
    1101, 1102, 1103, 1104, 1105, 1106, 1107, 1110, 1111, 1112,
    1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122,
    1123, 1124, 1125, 1126, 1127, 1128, 1129, 1130, 1133, 1134,
    1135, 1136, 1137, 1138, 1139, 1140, 1141, 1143, 1147, 1148,
    1150, 1151, 1152, 1153, 1154, 1155, 1156, 1157, 1158, 1159,
    1160, 1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169,
    1170, 1171, 1172, 1173, 1174, 1175, 1176, 1177, 1178, 1179,
    1180, 1181, 1182, 1183, 1184, 1185, 1186, 1187, 1188, 1189,
    1190, 1191, 1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199,
    1200, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209,
    1210, 1211, 1212, 1213, 1214, 1215, 1216, 1217, 1218, 1219,
    1220, 1221, 1222, 1223, 1224, 1225, 1226, 1227, 1228, 1229,
    1230, 1231, 1232, 1233, 1234, 1235, 1236, 1237, 1238, 1239,
    1240, 1241, 1242, 1243, 1244, 1245, 1246, 1247, 1248, 1249,
    1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1259,
    1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269,
    1270, 1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279,
    1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289,
    1290, 1291, 1292, 1293, 1294, 1295, 1296, 1405, 1406, 1407,
    1408, 1414, 1416, 1417, 1419, 1424, 1425, 1426, 1427, 1428,
    1429, 1430, 1431, 1437, 1439, 1440, 1608, 1609, 1610, 1615,
    1616, 1617, 1618, 1619, 1620, 1621, 1622, 1623, 1624, 1625,
    1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633, 1634, 1635,
    1645, 1646, 1647, 1648, 1649, 1660, 1662, 1663, 1664, 1665,
    1666, 1667, 1669, 1670, 1717, 1721, 1723, 1724, 1727, 1731,
    1733, 1735, 1736, 1737, 1738, 1739, 1740, 1741, 1742, 1743,
    1744, 1745, 1746, 1747, 1748, 1749, 1750, 1758, 1759, 1761,
    1763, 1764, 1768, 1770, 1771, 1772, 1773, 1774, 1776, 1778,
    1780, 1781, 1782, 1783, 1784, 1785, 1786, 1787, 1788, 1789,
    1790, 1791, 1792, 1793, 1801, 1802, 1803, 1804, 1805, 1806,
    1807, 1812, 1813, 1829, 1831, 1833, 1836, 1837, 1840, 1841,
    1842, 1843, 1844, 1846, 1847, 1848, 1849, 1850, 1851, 1852,
    1853, 1855, 1859, 1860, 1861, 1863, 1873, 1874, 1880, 1881,
    1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889, 1890, 1894,
    1896, 1897, 1898, 1900, 1902, 1904, 1906, 1910, 1912, 1914,
    1916, 1725, 1726, 1728, 1729, 1730, 1732, 1734
];

    function renderCards(data) {

    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = ''; // Limpiar contenedor de tarjetas

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);

    // Obtener la hora actual en Argentina
    const ahora = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
    const fechaActual = new Date(ahora);

const getShopImage = (ordenPublica) => {
    if (typeof ordenPublica === 'string' && ordenPublica.toLowerCase().startsWith('bpr')) {
        return '<img id="TiendaBapro" src="./Img/bapro-logo.png" alt="BaPro">';
    }

    const shopCode = ordenPublica.split('-').pop();

    switch (shopCode) {
        case "2941":
        case "2942":
        case "2943":
            return '<img id="TiendaBNA" src="./Img/bna-logo.png" alt="BNA">';
        case "1914":
        case "1915":
            return '<img id="TiendaMacro" src="./Img/premia-logo.png" alt="Macro">';
        default:
            return '';
    }
};

    for (let i = startIndex; i < endIndex; i++) {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-3';

        // Verificar si transportCompany es "Andesmar"
        const isCDS = data[i].transportCompany === "Cruz del Sur";
        const isAndesmar = data[i].transportCompany === "Andesmar";
        const isAndreani = data[i].transportCompany === "Andreani"
        const isLogPropia = data[i].transportCompany === "Logistica Propia"
        const isLogPlaceIt = data[i].transportCompany === "Logistica PlaceIt"

        // Verificar si datoFacturacion existe
        const hasDatoFacturacion = data[i].datoFacturacion !== undefined && data[i].datoFacturacion !== null;
        const hasCancelado = data[i].cancelado !== undefined && data[i].cancelado !== null;

        // Lógica para calcular el estado de facturación
        const costoEnvio = (data[i].suborden_total - (data[i].precio_venta * data[i].cantidad)).toFixed(2);
        const fechaDeCreacion = data[i].fechaDeCreacion; // "21-09-2024 19:30:18"
        const [fecha, hora] = fechaDeCreacion.split(' ');
        const [dia, mes, anio] = fecha.split('-');
        const [horas, minutos, segundos] = hora.split(':');
        const fechaCreacion = new Date(anio, mes - 1, dia, horas, minutos, segundos);
        
        // Calcular la fecha límite sumando 96 horas
        const fechaLimite = new Date(fechaCreacion.getTime() + 48 * 60 * 60 * 1000);

        let mensajeFactura;
        if (fechaActual >= fechaLimite) {
            mensajeFactura = "Seguro para facturar";
        } else {
            const tiempoRestante = fechaLimite - fechaActual;
            const horasRestantes = Math.floor((tiempoRestante / (1000 * 60 * 60)) % 48);
            const minutosRestantes = Math.floor((tiempoRestante / (1000 * 60)) % 60);
            mensajeFactura = `Falta ${horasRestantes} horas y ${minutosRestantes} minutos`;
        }

        const isParaFacturar =  mensajeFactura === "Seguro para facturar"

        // Determinar el tipo de factura
        const cuit = data[i].cuit;
        const tipoFactura = (!cuit || cuit.length === 7 || cuit.length === 8) ? 'FACTURA B' : 'FACTURA A';
        // Agregar el mensaje a la tarjeta
        const mensajeElement = document.createElement('p');
        mensajeElement.textContent = mensajeFactura;
        card.appendChild(mensajeElement);

        const direccionEnvio = data[i].direccion;
        const ordenPublica = data[i].orden_publica.replace(/-/g, '');
        const cupon = ordenPublica.substring(0, 13); 
        const autorizacion = ordenPublica.substring(ordenPublica.length - 4); 

        const precioVenta = parseFloat(data[i].precio_venta * data[i].cantidad);
        const montoCobrado = parseFloat(data[i].monto_cobrado);
        const equivalencia_puntos_pesos = parseFloat(data[i].equivalencia_puntos_pesos) || 0;

        const total = (precioVenta + montoCobrado) - equivalencia_puntos_pesos;
        const puntosBna = (data[i].equivalencia_puntos_pesos);

        const ordenPublica2 = data[i].orden_publica_;
        const shopImage = getShopImage(ordenPublica2);

        // Verificar si el SKU está incluido en el listado
        const isSkuIncluded = skusList.includes(data[i].sku);
        const isSkuIncludedPlaceIt = skusPlaceItList.includes(data[i].sku);

        // Determinar el storeCode
        let storeCode;

        if (data[i].orden_publica_.toLowerCase().startsWith('bpr')) {
            storeCode = "6573"; // Bapro
        } else {
            storeCode = data[i].orden_publica_.split('-').pop();
        }

        // Función para verificar si el storeCode es de Macro
        const isMacro = (storeCode) => {
            const macroCodes = ["1914", "1915"];
            return macroCodes.includes(storeCode);
        };

        // Función para verificar si el storeCode es de Bapro
        const isBaPro = (storeCode) => {
            const baproCodes = ["6573"];
            return baproCodes.includes(storeCode);
        };

        // Función para verificar si el storeCode es de BNA
        const isBNA = (storeCode) => {
            const bnaCodes = ["2941", "2942", "2943"];
            return bnaCodes.includes(storeCode);
        };

        // Asignar la clase correspondiente según el storeCode
        const cardBodyClass = isBNA(storeCode)
            ? 'card-body-bna'
            : isMacro(storeCode)
            ? 'card-body-macro'
            : isBaPro(storeCode)
            ? 'card-body-bapro'
            : '';

        // VERIFICAR STOCK Y PRECIO
        // Función para sanitizar el SKU
        function sanitizeSku(sku) {
            return sku ? sku.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : ''; // Eliminar caracteres especiales y pasar a minúsculas
        }

        // Obtener el SKU actual
        const skuActual = sanitizeSku(data[i].sku); // Sanitiza el SKU actual

        // Buscar el stock correspondiente en preciosArray
        const precioItem = preciosArray.find(item => sanitizeSku(item.sku) === skuActual); // Sanitiza item.sku
        const stock = precioItem ? precioItem.stock : 0; // Si no se encuentra, stock es 0

        // Verificar condiciones para PlaceIt
        const isSkuInList = skusPlaceItList.includes(data[i].sku); // Verifica si el SKU está en la lista de PlaceIt
        const isCpInCpsPlaceIt = cpsPlaceIt.includes(Number(data[i].cp)); // Verifica si el CP está en cpsPlaceIt
        const isMacroStore = isMacro(storeCode); // Verifica si es un macro

        // Determinar mensaje y clase de estilo según el stock
        let stockMessage, stockClass, stockIcon;
        let stockToDisplay = stock; // Variable para mostrar el stock correcto

        if (isSkuInList && isCpInCpsPlaceIt && !isMacroStore) {
            // Si el SKU y CP están en las listas de PlaceIt, usar preciosPlaceItArray
            const precioPlaceItItem = preciosPlaceItArray.find(item => sanitizeSku(item.sku) === skuActual);
            const stockPlaceIt = precioPlaceItItem ? precioPlaceItItem.stock : 0; // Stock de preciosPlaceItArray

            stockToDisplay = stockPlaceIt; // Actualiza la variable para mostrar el stock de PlaceIt

            if (stockPlaceIt === 0) {
                stockMessage = 'Sin Stock PlaceIt';
                stockClass = 'sin-stock';
                stockIcon = 'bi-exclamation-circle-fill'; // Puedes cambiar el ícono si lo deseas
            } else {
                stockClass = stockPlaceIt < 10 ? 'stock-pi-bajo-stock-tv' : 'stock-pi-normal-stock-tv';
                stockMessage = stockPlaceIt < 10 ? 'P-it bajo' : 'Stock P-it';
                stockIcon = stockPlaceIt < 10 ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
            }
        } else {
            // Determinar mensaje y clase de estilo según el stock original
            if (stock === 0) {
                stockMessage = 'Sin Stock';
                stockClass = 'sin-stock';
                stockIcon = 'bi-exclamation-circle-fill'; // Puedes cambiar el ícono si lo deseas
            } else {
                stockClass = stock < 10 ? 'stock-bajo-stock-tv' : 'stock-normal-stock-tv';
                stockMessage = stock < 10 ? 'Stock bajo' : 'Stock';
                stockIcon = stock < 10 ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
            }
        }

        // Generar el HTML para el stock con clases CSS
        let htmlstock = `
        <div class="container-stock-tv">
            <div class="status-box-stock-tv">
                <i class="bi ${stockIcon} icon-stock-tv ${stockClass}"></i>
                <p class="status-text-stock-tv ${stockClass}">
                ${stockToDisplay === 0 ? stockMessage : `${stockMessage} <strong>${skuActual}</strong>: <strong>${stockToDisplay}</strong> u.`}
                </p>
            </div>
        </div>
        `;
        // FIN VERIFICAR STOCK Y PRECIO

    const palabras = data[i].nombre.trim().split(" ");
    const ultima = palabras.pop();
    const resto = palabras.join(" ");
    const nombreFormateadoTV = `${resto} <span class="ultima-palabra">${ultima}</span>`;


// Agregar la tarjeta al contenedor
const carritoContenido = data[i].carrito ? `
    <p class="carrito">
        <i class="bi bi-cart-fill carrito-icon"></i>
        COMPRA EN CARRITO
    </p>` : '';

const tooltip = data[i].errorSlack !== undefined ? (data[i].errorSlack ? `
    <div class="slack-error-container container-slack-${data[i].id}" style="position: relative; z-index: 1; background-color: #f8d7da;">
        <div class="slack-error-header d-flex justify-content-between align-items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1200px-Slack_icon_2019.svg.png" alt="Logo de Slack" class="slack-error-logo">
            <span>Error de Slack</span>
            <button class="btn btn-link" data-bs-toggle="collapse" data-bs-target="#collapse-${data[i].id}">
                <i class="bi bi-chevron-down"></i>
            </button>
        </div>
        <div class="collapse" id="collapse-${data[i].id}">
            <div class="slack-error-message">
                ${data[i].errorSlackMensaje}
            </div>
            <button class="btn btn-primary mt-2" onclick="marcarFacturado3('${data[i].id}', '${data[i].email}', '${data[i].nombre}', '${data[i].remito}')">
                <i class="bi bi-arrow-repeat"></i> Reprocesar
            </button>
            <button class="btn btn-danger mt-2" onclick="handleCorrection('${data[i].id}')">
                <i class="bi bi-exclamation-circle"></i> Marcar Corrección Manual
            </button>
        </div>
    </div>
` : `
    <div class="slack-error-container container-slack-${data[i].id}" style="position: relative; z-index: 1; background-color: #d4edda;">
        <div class="slack-error-header2 d-flex justify-content-between align-items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1200px-Slack_icon_2019.svg.png" alt="Logo de Slack" class="slack-error-logo">
            <span>Error Solucionado</span>
            <button class="btn btn-link" data-bs-toggle="collapse" data-bs-target="#collapse-${data[i].id}">
                <i class="bi bi-chevron-down"></i>
            </button>
        </div>
        <div class="collapse" id="collapse-${data[i].id}">
            <div class="slack-error-message2">
                ${data[i].errorSlackMensaje}
            </div>
            <button class="btn btn-success mt-2" disabled>
                <i class="bi bi-check-circle" style="color: #FFFFFF;"></i> ${data[i].correccionSlack ? data[i].correccionSlack : "Reprocesado por Automata"}
            </button>
        </div>
    </div>`) : '';
        
// Agregar la tarjeta al contenedor
const descuentoContenido = data[i].equivalencia_puntos_pesos > 0 ? `
<p class="puntos">
<i class="bi bi-award-fill puntos-icon"></i>
COMPRA CON USO DE PUNTOS BNA
</p>` : '';
        
        // Agregar la tarjeta al contenedor
        cardsContainer.appendChild(card);

        card.innerHTML = `

<!-- MODAL FACTURACION -->
<!-- Modal -->
<div class="modal fade" id="infoFacturacionModal${data[i].id}" tabindex="-1" aria-labelledby="infoFacturacionLabel${data[i].id}" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="infoFacturacionLabel${data[i].id}">Información de Facturación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">

                <!-- Datos de Pago -->
                <div class="card-facturacion-meli mb-3">
                    <div class="card-header-facturacion-meli"><i class="bi bi-credit-card-2-front-fill"></i> Datos de Pago:</div>
                    <div class="card-body-facturacion-meli">
                        <div class="row mb-2">
                            <div class="col">
                                <label for="order_id_${data[i].id}">Order ID:</label>
                                <input type="text" id="order_id_${data[i].id}" value="${data[i].carrito ? Math.floor(Math.random() * 900 + 100) + '-carrito-' : ''}${data[i].remito}" disabled>
                            </div>
                            <div class="col">
                                <label for="estado_${data[i].id}">Estado:</label>
                                <input type="text" id="estado_${data[i].id}" value="Aprobado" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="metodo_pago_${data[i].id}">Método de Pago:</label>
                                <input type="text" id="metodo_pago_${data[i].id}" value="${isMacro(storeCode) ? 'TIENDA BANCO MACRO' : 'BNA TIENDA BANCO NACION'}" disabled>
                            </div>
                            <div class="col">
                                <label for="numero_lote_${data[i].id}">Número de Lote:</label>
                                <input type="text" id="numero_lote_${data[i].id}" value="11" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="cupon_pago_${data[i].id}">Cupón de Pago:</label>
                                <input type="text" id="cupon_pago_${data[i].id}" value="${data[i].cupon ? data[i].cupon : cupon}" disabled>
                            </div>
                            <div class="col">
                                <label for="cod_autorizacion_${data[i].id}">Código de Autorización:</label>
                                <input type="text" id="cod_autorizacion_${data[i].id}" value="${autorizacion}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="numero_tarjeta_visible_${data[i].id}">Número de Tarjeta Visible:</label>
                                <input type="text" id="numero_tarjeta_visible_${data[i].id}" value="${data[i].numeros_tarjeta.replace(/\D/g, '')}" disabled>
                            </div>
                            <div class="col">
                                <label for="codigo_pago_${data[i].id}">Código de Pago:</label>
                                <input type="text" id="codigo_pago_${data[i].id}" value="${data[i].remito}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="cuotas_${data[i].id}">Cuotas:</label>
                                <input type="text" id="cuotas_${data[i].id}" value="${(data[i].cuotas && data[i].cuotas !== '0') ? data[i].cuotas : data[i].nro_de_cuotas}" disabled>
                            </div>
                            <div class="col">
                                <label for="banco_${data[i].id}">Banco:</label>
                                <input type="text" id="banco_${data[i].id}" value="${isMacro(storeCode) ? 'BANCO MACRO' : 'BANCO NACION'}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="tipo_entrega_${data[i].id}">Tipo de Entrega:</label>
                                <input type="text" id="tipo_entrega_${data[i].id}" 
                                    value="${isSkuIncludedPlaceIt && cpsPlaceIt.includes(Number(data[i].cp)) && !isMacro(storeCode) ? '40' : (isMacro(storeCode) ? '41' : '33')}" 
                                    disabled>
                            </div>
                            <div class="col">
                                <label for="deposito_${data[i].id}">Depósito:</label>
                                <input type="text" id="deposito_${data[i].id}" 
                                    value="${isSkuIncludedPlaceIt && cpsPlaceIt.includes(Number(data[i].cp)) && !isMacro(storeCode) ? '60' : '9'}" 
                                    disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="fecha_acreditacion_${data[i].id}">Fecha de Acreditación:</label>
                                <input type="text" id="fecha_acreditacion_${data[i].id}" value="${fechaDeCreacion}" disabled>
                            </div>
                            <div class="col">
                                <label for="fecha_${data[i].id}">Fecha:</label>
                                <input type="text" id="fecha_${data[i].id}" value="${fechaDeCreacion}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2 oculto">
                            <div class="col">
                                <label for="monto_depositado_${data[i].id}">Monto Depositado:</label>
                                <input type="text" id="monto_depositado_${data[i].id}" value="" disabled>
                            </div>
                            <div class="col">
                                <label for="observacion_deposito_transferencia_${data[i].id}">Observación Depósito/Transferencia:</label>
                                <input type="text" id="observacion_deposito_transferencia_${data[i].id}" value="" disabled>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Datos de Compra -->
                <div class="card-facturacion-meli mb-3">
                    <div class="card-header-facturacion-meli"><i class="bi bi-bag-fill"></i> Datos de Compra:</div>
                    <div class="card-body-facturacion-meli">
                        <div class="row mb-2">
                            <div class="col">
                                <label for="codigo_promocion_${data[i].id}">Código Promoción:</label>
                                <input type="text" id="codigo_promocion_${data[i].id}" value="${isMacro(storeCode) && data[i].marca_de_tarjeta?.trim().toLowerCase() === 'american_express' ? '5002' : (isMacro(storeCode) ? '5001' : '5000')}" disabled>
                            </div>
                            <div class="col">
                                <label for="codigo_item_${data[i].id}">Código Item:</label>
                                <input type="text" id="codigo_item_${data[i].id}" value="${data[i].sku}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="nombre_item_${data[i].id}">Nombre Item:</label>
                                <input type="text" id="nombre_item_${data[i].id}" value="${cleanString(data[i].producto_nombre)}" disabled>
                            </div>
                            <div class="col">
                                <label for="recargo_item_${data[i].id}">Recargo Item:</label>
                                <input type="text" id="recargo_item_${data[i].id}" value="0" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="cantidad_item_${data[i].id}">Cantidad Item:</label>
                                <input type="text" id="cantidad_item_${data[i].id}" value="${data[i].cantidad}" disabled>
                            </div>
                            <div class="col">
                                <label for="precio_item_${data[i].id}">Precio Item:</label>
                                <input type="text" id="precio_item_${data[i].id}" value="${data[i].precio_venta === "0.0" ? data[i].precio_producto : data[i].precio_venta}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="descuentos_${data[i].id}">Descuentos (Puntos):</label>
                                <input type="text" id="descuentos_${data[i].id}" value="${puntosBna}" disabled>
                            </div>
                            <div class="col">
                                <label for="iva_${data[i].id}">IVA:</label>
                                <input type="text" id="iva_${data[i].id}" value="${data[i].iva2}" disabled>
                            </div>
                        </div>
                        <div class="row align-items-center mb-2">
                            <div class="col">
                                <label for="monto_envio_${data[i].id}">Monto de Envío:</label>
                                <input type="text" id="monto_envio_${data[i].id}" value="${data[i].monto_cobrado}" disabled>
                            </div>
                            <div class="col">
                                <label for="monto_total_${data[i].id}">Monto Total:</label>
                                <input type="text" id="monto_total_${data[i].id}" value="${total}" disabled>
                            </div>
                        </div>

                        <!-- Mensaje de descuento -->
                        <div id="mensaje_${data[i].id}" class="mensaje-desconto" style="display: none; margin-top: 10px; color: green;"></div>
                        
                    </div>
                </div>

                <!-- Pretty Checkbox para descontar envío -->
                <div class="prettyContainer">
                    <div class="pretty p-default p-curve p-toggle">
                        <input type="checkbox" id="descontar_envio_${data[i].id}" 
                               onclick="toggleShippingDiscount(this, '${data[i].id}')">
                        <div class="state p-success p-on">
                            <label>Descontar Envío</label>
                        </div>
                        <div class="state p-danger p-off">
                            <label>No Descontar Envío</label>
                        </div>
                    </div>
                </div>

                <!-- Datos de Cliente -->
                <div class="card-facturacion-meli mb-3">
                    <div class="card-header-facturacion-meli-presea"><img id="presea" src="./Img/logo-presea.png"> Datos de Cliente:</div>
                    <div class="card-body-facturacion-meli">
                        <div class="row mb-2">
                            <div class="col">
                                <label for="razon_social_${data[i].id}">Razón Social:</label>
                                <input type="text" id="razon_social_${data[i].id}" value="" placeholder="Completar en caso de factura A" disabled>
                            </div>
                            <div class="col">
                                <label for="cuit_${data[i].id}">CUIT:</label>
                                <input type="text" id="cuit_${data[i].id}" value="" placeholder="Completar en caso de factura A" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="condicion_iva_${data[i].id}">Condición IVA:</label>
                                <select id="condicion_iva_${data[i].id}" disabled>
                                    <option value="IVA Responsable Inscripto" 
                                        ${data[i].iva === 'IVA Responsable Inscripto' || (!data[i].iva && (!data[i].cuit || data[i].cuit.length > 7)) ? 'selected' : ''}>
                                        IVA Responsable Inscripto
                                    </option>
                                    <option value="Consumidor Final" 
                                        ${data[i].iva === 'Consumidor Final' || (!data[i].iva && data[i].cuit && data[i].cuit.length <= 7) ? 'selected' : ''}>
                                        Consumidor Final
                                    </option>
                                    <option value="IVA Liberado - Ley N° 19.640" 
                                        ${data[i].iva === 'IVA Liberado - Ley N° 19.640' ? 'selected' : ''}>
                                        IVA Liberado - Ley N° 19.640
                                    </option>
                                    <option value="IVA Responsable Exento" 
                                        ${data[i].iva === 'IVA Responsable Exento' ? 'selected' : ''}>
                                        IVA Responsable Exento
                                    </option>
                                    <option value="IVA Responsable Inscripto - Agente de Percepción" 
                                        ${data[i].iva === 'IVA Responsable Inscripto - Agente de Percepción' ? 'selected' : ''}>
                                        IVA Responsable Inscripto - Agente de Percepción
                                    </option>
                                    <option value="IVA Responsable Monotributo" 
                                        ${data[i].iva === 'IVA Responsable Monotributo' ? 'selected' : ''}>
                                        IVA Responsable Monotributo
                                    </option>
                                    <option value="IVA Sujeto Exento" 
                                        ${data[i].iva === 'IVA Sujeto Exento' ? 'selected' : ''}>
                                        IVA Sujeto Exento
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="row mb-2">
                            <div class="col">
                                <label for="nombre_${data[i].id}">Nombre:</label>
                                <input type="text" id="nombre_${data[i].id}" value="${data[i].nombreFacturacion}" disabled>
                            </div>
                            <div class="col">
                                <label for="apellido_${data[i].id}">Apellido:</label>
                                <input type="text" id="apellido_${data[i].id}" value="${data[i].apellidoFacturacion}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="dni_${data[i].id}">DNI:</label>
                                <input type="text" id="dni_${data[i].id}" value="${(data[i].cuit && data[i].cuit !== '0') ? data[i].cuit : data[i].dni}" disabled>
                            </div>
                            <div class="col">
                                <label for="telefono_${data[i].id}">Teléfono:</label>
                                <input type="text" id="telefono_${data[i].id}" value="${(data[i].telefono_facturacion && data[i].telefono_facturacion !== '0') ? data[i].telefono_facturacion : data[i].telefono}" disabled>
                            </div> 
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="domicilio_fiscal_${data[i].id}">Domicilio Fiscal:</label>
                                <input type="text" id="domicilio_fiscal_${data[i].id}" value="" placeholder="Completar en caso de factura A" disabled>
                            </div>
                            <div class="col">
                                <label for="email_${data[i].id}">Email:</label>
                                <input type="text" id="email_${data[i].id}" value="${data[i].email}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="calle_${data[i].id}">Calle:</label>
                                <input type="text" id="calle_${data[i].id}" value="${data[i].calle !== undefined ? data[i].calle : data[i].calle2}" disabled>
                            </div>
                            <div class="col">
                                <label for="altura_${data[i].id}">Altura:</label>
                                <input type="text" id="altura_${data[i].id}" value="${data[i].altura !== undefined ? data[i].altura : 0}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="localidad_${data[i].id}">Localidad:</label>
                                <input type="text" id="localidad_${data[i].id}" value="${(data[i].ciudad_facturacion && data[i].ciudad_facturacion !== '0') ? data[i].ciudad_facturacion : data[i].ciudad_factura}" disabled>
                            </div> 
                            <div class="col">
                                <label for="codigo_postal_${data[i].id}">Código Postal:</label>
                                <input type="text" id="codigo_postal_${data[i].id}" value="${(data[i].codigo_postal_facturacion && data[i].codigo_postal_facturacion !== '0') ? data[i].codigo_postal_facturacion : data[i].codigo_postal_factura}" disabled>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <label for="timbre_${data[i].id}">Timbre:</label>
                                <input type="text" id="timbre_${data[i].id}" value="0" disabled>
                            </div>
                            <div class="col">
                                <label for="provincia_${data[i].id}">Provincia:</label>
                                <input type="text" id="provincia_${data[i].id}" value="${data[i].provincia}" disabled>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <!-- Datos de Envío -->
                    <div class="card-facturacion-meli mb-3">
                        <div class="card-header-facturacion-meli"><i class="bi bi-rocket-takeoff-fill"></i> Datos de Envío:</div>
                        <div class="card-body-facturacion-meli">
                            <div class="row mb-2">
                                <div class="col">
                                    <label for="domicilio_envio_${data[i].id}">Domicilio de Envío:</label>
                                    <input type="text" id="domicilio_envio_${data[i].id}" value="${data[i].calle !== undefined ? data[i].calle : data[i].calle2}" disabled>
                                </div>
                            </div>
                            <div class="row mb-2 oculto">
                                <div class="col">
                                    <label for="numero_envio_${data[i].id}">Número de Envío:</label>
                                    <input type="text" id="numero_envio_${data[i].id}" value="Número del domicilio de envío" disabled>
                                </div>
                                <div class="col">
                                    <label for="piso_envio_${data[i].id}">Piso de Envío:</label>
                                    <input type="text" id="piso_envio_${data[i].id}" value="Piso del domicilio de envío" disabled>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <label for="localidad_envio_${data[i].id}">Localidad de Envío:</label>
                                    <input type="text" id="localidad_envio_${data[i].id}" value="${data[i].localidad}" disabled>
                                </div>
                                <div class="col">
                                    <label for="cp_envio_${data[i].id}">Código Postal de Envío:</label>
                                    <input type="text" id="cp_envio_${data[i].id}" value="${data[i].cp}" disabled>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <label for="telefono_envio_${data[i].id}">Teléfono de Envío:</label>
                                    <input type="text" id="telefono_envio_${data[i].id}" value="${data[i].telefono}" disabled>
                                </div>
                                <div class="col">
                                    <label for="persona_autorizada_${data[i].id}">Persona Autorizada:</label>
                                    <input type="text" id="persona_autorizada_${data[i].id}" value="${data[i].nombre_completo_envio}" disabled>
                                </div>
                            </div>
                            <div class="row mb-2">
                                <div class="col">
                                    <label for="otros_comentarios_entrega_${data[i].id}">Otros Comentarios de Entrega:</label>
                                    <input type="text" id="otros_comentarios_entrega_${data[i].id}" value="${isMacro(storeCode) ? 'GUIA OCA: ' + data[i].numeroSeguimiento : (data[i].otros_comentarios_entrega !== undefined ? data[i].otros_comentarios_entrega : `Coordinar a Línea ${data[i].telefono}`)}" disabled>
                                </div>
                            </div>
                        </div>
                    </div>
    
                </div>
                <div class="modal-footer">
                    <input type="${data[i].datoFacturacion ? 'text' : 'password'}" 
                           id="clave-facturacion-${data[i].id}" 
                           placeholder="Clave de facturación" 
                           maxlength="4" 
                           class="form-control" 
                           ${data[i].datoFacturacion ? 'disabled' : ''} 
                           value="${data[i].datoFacturacion || ''}" />
    
                    <div class="button-container-cds">
                        <button id="facturar-automata-${data[i].id}" 
                                class="btn ${data[i].cancelado ? 'btn-secondary' : (data[i].datoFacturacion ? 'btn-success' : 'btn-primary')}" 
                                onclick="marcarFacturado2('${data[i].id}', '${data[i].email}', '${data[i].nombre}', '${data[i].remito}')"
                                ${data[i].cancelado ? 'disabled' : (data[i].datoFacturacion ? 'disabled' : '')}>
                            ${data[i].cancelado ? '<i class="bi bi-x-octagon"></i> Sin facturar Cancelado' : (data[i].datoFacturacion ? '<i class="bi bi-check2-circle"></i> Ya Facturado' : '<i class="bi bi-robot"></i> Facturar')}
                        </button>
    
                        <button id="cancelar-venta-${data[i].id}" 
                                class="btn ${data[i].cancelado ? 'btn-success' : (data[i].datoFacturacion ? 'btn-secondary' : 'btn-danger')}" 
                                onclick="marcarCancelado2('${data[i].id}')"
                                ${data[i].datoFacturacion ? 'disabled' : ''}>
                            ${data[i].cancelado ? '<i class="bi bi-check2-circle"></i> Venta Cancelada' : '<i class="bi bi-x-square-fill"></i> Cancelar'}
                        </button>
    
                        <button type="button" 
                                id="editButton_${data[i].id}" 
                                class="btn btn-primary" 
                                onclick="toggleEdit('${data[i].id}')"
                                ${data[i].datoFacturacion ? 'disabled' : ''}>
                            <i class="bi bi-pen-fill"></i> Editar
                        </button>
    
                        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">
                            <i class="bi bi-arrow-return-left"></i> Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- FIN MODAL FACTURACION -->
    
                    <div class="card">
                        
                    <div class="card-body ${cardBodyClass}">

<div class="${(() => {
    const orden = data[i].orden_publica_.toLowerCase();
    if (orden.startsWith('bpr')) return 'em-circle-state7';

    const shopCode = data[i].orden_publica_.split('-').pop(); 
    switch (shopCode) {
        case "2941":
        case "2942":
        case "2943":
            return 'em-circle-state5';
        case "1914":
        case "1915":
            return 'em-circle-state6';
        case "6572":
        case "6573":
            return 'em-circle-state7';
        default:
            return 'em-circle-state-unknown'; 
    }
})()}">
    ${(() => {
        const orden = data[i].orden_publica_.toLowerCase();
        if (orden.startsWith('bpr')) return 'BaPro Compras';

        const shopCode = data[i].orden_publica_.split('-').pop(); 
        switch (shopCode) {
            case "2941":
                return 'BNA novogarbna';
            case "2942":
                return 'BNA novogarbnapromo';
            case "2943":
                return 'BNA novogarbnapromo2';
            case "1914":
                return 'Macro novogarmp';
            case "1915":
                return 'Macro novogarmppromo';
            default:
                return 'Shop Desconocido'; 
        }
    })()}
</div>

                            <div id="estadoEnvio${data[i].id}" class="${(isAndreani || isCDS || isAndesmar || isLogPropia || data[i].envio === 'oca') ? 'em-circle-state4' : 'em-circle-state3'}">
                                ${(isAndreani || isAndesmar || isLogPlaceIt || isCDS || isLogPropia || data[i].envio === 'oca') ? 
                                    '<i class="bi bi-check-circle-fill margen-icon"></i> Preparado' : 
                                    '<i class="bi bi-stopwatch-fill margen-icon"></i> Pendiente'}
                            </div>

                            <button class="btn-delete-bna btn btn-outline-danger" onclick="eliminarNodo('${data[i].id}')"><i class="bi bi-trash3-fill"></i></button>

                            <div class="em-state-bna">${shopImage}</div>
                            <h5 class="card-title">${nombreFormateadoTV}</h5>
                            <div class="d-flex align-items-center">
                            

                            <p class="card-text cpLocalidadBna mb-0 me-2">
                            ${data[i].cp}, ${data[i].localidad}, ${data[i].provincia}
                            </p>

                            <p class="card-text correo-meli ${
                                logBsCps.includes(Number(data[i].cp)) ? 'correo-novogar' :
                                logStaFeCps.includes(Number(data[i].cp)) ? 'correo-santafe' :
                                logRafaelaCps.includes(Number(data[i].cp)) ? 'correo-rafaela' :
                                logSanNicolasCps.includes(Number(data[i].cp)) ? 'correo-sannicolas' :
                                isMacro(storeCode) ? 'correo-oca' :
                                cpsCDS.includes(Number(data[i].cp)) ? 'correo-cds' :
                                cpsAndesmar.includes(Number(data[i].cp)) ? 'correo-andesmar' :
                                'correo-andreani'
                            }">
                                ${
                                logBsCps.includes(Number(data[i].cp)) ? 
                                '<img src="Img/novogar-tini.png" alt="Logística Novogar" width="20" height="20">Buenos Aires' :
                                logStaFeCps.includes(Number(data[i].cp)) ? 
                                '<img src="Img/novogar-tini.png" alt="Logística Santa Fe" width="20" height="20">Santa Fe' :
                                logRafaelaCps.includes(Number(data[i].cp)) ? 
                                '<img src="Img/novogar-tini.png" alt="Logística Rafaela" width="20" height="20">Rafaela' :
                                logSanNicolasCps.includes(Number(data[i].cp)) ? 
                                '<img src="Img/novogar-tini.png" alt="Logística San Nicolás" width="20" height="20">San Nicolás' :
                                isMacro(storeCode) ? 
                                '<img src="Img/oca-tini.png" alt="OCA" width="20" height="20">' :
                                cpsCDS.includes(Number(data[i].cp)) ? 
                                '<img src="Img/Cruz-del-Sur-tini.png" alt="Cruz del Sur" width="20" height="20">' :
                                cpsAndesmar.includes(Number(data[i].cp)) ? 
                                '<img src="Img/andesmar-tini.png" alt="Andesmar" width="20" height="20">' : 
                                '<img src="Img/andreani-tini.png" alt="Andreani" width="20" height="20">'
                                }
                            </p>

                            <button class="btn btn-sm btn-" style="color: #007bff;" id="edit-localidad-${data[i].id}">
                            <i class="bi bi-pencil-square ios-icon2"></i>
                            </button>

                    </div>

                    <div id="edit-input-${data[i].id}" style="display: none;">
                        <input type="text" id="localidad-input-${data[i].id}" placeholder="Buscar localidad" class="form-control" autocomplete="off">
                        <ul id="suggestions-${data[i].id}" class="suggestions-container list-group"></ul>
                    </div>

                    <p id= "fecha-tiendas-virtuales" class="fecha-tiendas-virtuales">
                    ${data[i].fechaDeCreacion}
                    </p>

                <div id="direccion-bna" class="ios-card"> 
                    
                    <p class="ios-card-text">
                        <i class="bi bi-house ios-icon"></i>
                                         <span class="text-content"> ${data[i].calle2}</span>
                        <button class="btn btn-link" onclick="navigator.clipboard.writeText('${data[i].calle2}')">
                            <i class="bi bi-clipboard icon-gray"></i>
                        </button>
                    </p>

                    <p class="ios-card-text">
                        <i class="bi bi-telephone ios-icon"></i>  
                        <span class="text-content"> ${data[i].telefono}</span>
                        <button class="btn btn-link" onclick="navigator.clipboard.writeText('${data[i].telefono}')">
                            <i class="bi bi-clipboard icon-gray"></i>
                        </button>
                    </p>

                    <p class="ios-card-text email-container">
                        <i class="bi bi-envelope ios-icon"></i> 
                        <span class="text-content"> ${data[i].email}</span>
                        <button class="btn btn-link" onclick="navigator.clipboard.writeText('${data[i].email}')">
                                               <i class="bi bi-clipboard icon-gray"></i>
                                           </button>
                    </p>

                <div class="cliente-Container" onclick="copiarCliente('${data[i].cliente}')">
                <div class="cliente2 ${!data[i].cliente ? 'hidden' : ''}">
                <img src="Img/logo-presea.png" alt="PRESEA" width="20">
                Cliente Presea: <strong id="nombre-cliente">${data[i].cliente}</strong> 
                </div>
                </div>

                            ${carritoContenido}
                            ${descuentoContenido}

                            ${isSkuIncludedPlaceIt && cpsPlaceIt.includes(Number(data[i].cp)) 
                                ? (isMacro(storeCode) 
                                    ? `<p class="card-text-isNotSkuIncludedPlaceIt"><i class="bi bi-shield-lock-fill"></i> CP <strong>${data[i].cp}</strong> + <strong>${data[i].sku}</strong> Sin Express</p>` 
                                    : `<p class="card-text-isSkuIncludedPlaceIt"><i class="bi bi-lightning-charge-fill"></i> CP <strong>${data[i].cp}</strong> + SKU <strong>${data[i].sku}</strong> Con Express</p>`) 
                                : ''}                            
                                
                            ${isSkuIncluded ? `<p class="card-text-isSkuIncluded"><i class="bi bi-lightning-charge-fill"></i> SKU <strong>${data[i].sku}</strong> con imei</p>` : ''}

<div class="d-flex align-items-center justify-content-center contenedorRemito">
    <button class="btn btn-link btn-sm text-decoration-none copy-btn me-2 ios-icon3">
        <i class="bi bi-clipboard"></i>
    </button>

    <div class="contenedorPrompter">
    <p class="orden mx-2">${data[i].remito}</p>
    </div>

    <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2 ios-icon3" 
        onclick="window.open(getOrderUrl('${data[i].orden_publica_}'), '_blank');">
        <i class="bi bi-bag-check"></i>
    </button>

</div>

    ${tooltip}
                            
                            <!-- Seguimiento -->
                            <p class="numeroDeEnvioGeneradoBNA" id="numeroDeEnvioGeneradoBNA${data[i].id}">
                                ${isLogPlaceIt ? 
                                    'Logística PlaceIt' : 
                                    (isLogPropia ? 
                                        'Logística Propia' : 
                                        (data[i].envio === 'oca' ? 
                                            `<a href="https://www.aftership.com/es/track/oca-ar/${data[i].numeroSeguimiento}" target="_blank">OCA: ${data[i].numeroSeguimiento} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                            (isCDS ? 
                                                `<a href="${data[i].trackingLink}" target="_blank">CDS: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                                (isAndreani ? 
                                                    `<a href="${data[i].trackingLink}" target="_blank">Andreani: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                                    (isAndesmar ?
                                                        `<a href="${data[i].trackingLink}" target="_blank">Andesmar: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                                        'Número de Envío Pendiente')))))}
                            </p>
                            <!-- Fin Seguimiento -->

                            <!-- Nuevo contenedor para los switches -->
                            <div class="d-flex contenedor-switches mt-1 justify-content-between">
                                <div class="form-check form-switch switch-ios"> 
                                    <input class="form-check-input input-interruptor" type="checkbox" id="preparacion-${data[i].id}" ${data[i].marcaPreparado === 'Si' || data[i].envio === 'oca' ? 'checked' : ''}>
                                    <label class="form-check-label etiqueta-interruptor" for="preparacion-${data[i].id}"><strong>1</strong> Preparación</label>
                                </div>

                                <div class="form-check form-switch switch-ios"> 
                                    <input class="form-check-input input-interruptor" type="checkbox" id="entregado-${data[i].id}-1" ${data[i].marcaEntregado === 'Si' || data[i].estadoEnvio === 'entregado' ? 'checked' : ''}>
                                    <label class="form-check-label etiqueta-interruptor" for="entregado-${data[i].id}-1"><strong>2</strong> Entregado</label>
                                </div>
                            </div>
                            <!-- Fin contenedor para los switches -->

                            <div class="factura-status em-circle-state-time ${isParaFacturar ? 'facturable' : ''}" id="factura-status-${data[i].id}">
                                ${mensajeFactura}
                            </div>

                            ${htmlstock}

                            <!-- Botón para mostrar/ocultar el detalle del producto -->
                            <button class="btn-bna-collapse btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetalleProducto-${data[i].id}" aria-expanded="false" aria-controls="collapseDetalleProducto-${data[i].id}">
                                                           <i class="bi bi-chevron-down"></i> Detalle de Producto <i class="bi bi-cart-check"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetalleProducto-${data[i].id}">
                             <div class="pago descripcion-div p-2 mt-2"">
                                <p class="card-text-pago">

                            <i class="bi bi-box-seam"></i> 
                            <strong>SKU:</strong> <strong>${data[i].sku}</strong>, Cantidad: ${data[i].cantidad}
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].sku}')">
                            <i class="bi bi-clipboard"></i>
                            </button>
        

                            </p>

                                <p class="card-text-pago"><i class="bi bi-card-text"></i> <strong>Descripción:</strong> ${data[i].producto_nombre}</p>

                            <i class="bi bi-fire" style="color: orange;"></i>
                            <strong>id:</strong> <strong>${data[i].id}</strong>
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].id}')">
                                <i class="bi bi-clipboard"></i>
                            </button>
                                
                             </div>
                            </div>

                            <!-- Botón para mostrar/ocultar el detalle de Facturacion -->
                            <button class="btn-bna-collapse btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetalleFacturacion-${data[i].id}" aria-expanded="false" aria-controls="collapseDetalleFacturacion-${data[i].id}">
                                                           <i class="bi bi-chevron-down"></i> Detalle de Facturacion <i class="bi bi-receipt"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetalleFacturacion-${data[i].id}">
                             <div class="facturacion descripcion-div p-2 mt-2"">

                            <p class="card-text-facturacion">
                            <strong>Tipo:</strong> ${tipoFactura}
                            </p>

                            <p class="card-text-facturacion">
                                <strong>Nombre / Razon social:</strong> ${(data[i].razon_social && data[i].razon_social !== '0') ? data[i].razon_social : data[i].nombre_factura}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].razon_social && data[i].razon_social !== '0') ? data[i].razon_social : data[i].nombre_factura}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>D.N.I. / CUIT:</strong> ${(data[i].cuit && data[i].cuit !== '0') ? data[i].cuit : data[i].dni}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].cuit && data[i].cuit !== '0') ? data[i].cuit : data[i].dni}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>Direccion:</strong> ${(data[i].direccion_facturacion && data[i].direccion_facturacion !== '0') ? data[i].direccion_facturacion : data[i].direccion}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].direccion_facturacion && data[i].direccion_facturacion !== '0') ? data[i].direccion_facturacion : data[i].direccion}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>Localidad:</strong> ${(data[i].ciudad_facturacion && data[i].ciudad_facturacion !== '0') ? data[i].ciudad_facturacion : data[i].ciudad_factura}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].ciudad_facturacion && data[i].ciudad_facturacion !== '0') ? data[i].ciudad_facturacion : data[i].ciudad_factura}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>CP:</strong> ${(data[i].codigo_postal_facturacion && data[i].codigo_postal_facturacion !== '0') ? data[i].codigo_postal_facturacion : data[i].codigo_postal_factura}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].codigo_postal_facturacion && data[i].codigo_postal_facturacion !== '0') ? data[i].codigo_postal_facturacion : data[i].codigo_postal_factura}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>

                             </div>
                            </div>

                            <!-- Botón para mostrar/ocultar el detalle del Pago -->
                            <button class="btn-bna-collapse btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetallePago-${data[i].id}" aria-expanded="false" aria-controls="collapseDetallePago-${data[i].id}">
                                <i class="bi bi-chevron-down"></i> Detalle de Pago <i class="bi bi-credit-card"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetallePago-${data[i].id}">
                                <div class="pago p-2 mt-2 mb-2"">
                                
                                <div class="${isMacro(storeCode) ? '' : 'hidden'}" style="background-color: #f0f0f5; border-radius: 12px; padding: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 400px; margin-bottom: 5px; border: 1px solid #d0d0d5; ">
                                    <h2 style="font-size: 20px; color: #333; margin-bottom: 15px;">Datos PayWay 💰</h2>
                                    <p class="card-text-pago" style="color: #333; margin: 10px 0;"><strong>Número de Tarjeta:</strong> **** **** **** ${data[i].numeros_tarjeta.replace(/\D/g, '')}</p>
                                    <p class="card-text-pago hidden" style="color: #333; margin: 10px 0;"><strong>Código de Autorización:</strong> ${data[i].cod_aut}</p>
                                </div>

                                    <p class="card-text-pago"><strong>Entidad:</strong> ${(data[i].brand_name && data[i].brand_name !== '0') ? data[i].brand_name : data[i].marca_de_tarjeta || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Cuotas:</strong> ${(data[i].cuotas && data[i].cuotas !== '0') ? data[i].cuotas : data[i].nro_de_cuotas || 'N/A'}</p>
                                    <p class="card-text-pago ${isMacro(storeCode) ? 'hidden' : ''}"><strong>Número de Tarjeta:</strong> **** **** **** ${data[i].numeros_tarjeta.replace(/\D/g, '')}</p>
     

                      <p class="card-text-pago">
                          <strong>Precio de Venta:</strong> $ ${(data[i].precio_venta * data[i].cantidad).toFixed(2)}
                          <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].precio_venta * data[i].cantidad).toFixed(2)}')">
                              <i class="bi bi-clipboard"></i>
                          </button>
                      </p>

                       <p class="card-text-pago">
                            <strong>Cantidad:</strong> <strong id="strong-costo2-${data[i].id}" class="strong-costo2">${data[i].cantidad} U.</strong>
                       </p>
                       
                       <p class="card-text-pago">
                            <strong>Valor por producto:</strong> 
                            <strong class="strong-costo">$ ${data[i].precio_venta === "0.0" ? data[i].precio_producto : data[i].precio_venta}</strong>
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].precio_venta === "0.0" ? data[i].precio_producto : data[i].precio_venta}')">
                                <i class="bi bi-clipboard"></i>
                            </button>
                        </p>


                       <p class="card-text-pago">
                        <strong>Costo de Envío:</strong> <strong class="strong-costo">$${data[i].monto_cobrado}</strong>
                        <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].monto_cobrado}')">
                        <i class="bi bi-clipboard"></i>
                        </button>
                        </p>


                        <p class="card-text-pago">
                            <strong>Total:</strong> ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total)}
                        </p>

                            <!-- Contenedor gris con CUPON y AUTORIZACION -->
                            <div class="contenedor-pago bg-light p-3 mb-2 rounded" style="border-bottom: solid 2px #dc3545;">
                            <div class="mb-3 text-center">
                            <strong class="text-primary">CUPON:</strong>
                            <div class="d-flex justify-content-center align-items-center">
                            <span class="me-2">${data[i].cupon ? data[i].cupon : cupon}</span>
                            
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].cupon ? data[i].cupon : cupon}')">
                            <i class="bi bi-clipboard"></i>
                            </button>

                            </div>
                            </div>

                            <div class="text-center">
                            <strong class="text-primary">AUTORIZACION:</strong>
                            <div class="d-flex justify-content-center align-items-center">
                            <span class="me-2">${autorizacion}</span>
                            
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${autorizacion}')">
                            <i class="bi bi-clipboard"></i>
                            </button>

                            </div>
                            </div>
                            </div>
                                    
                                    
                                    <button id="marcar-facturado-${data[i].id}" type="button" 
                                    class="btn ${data[i].cancelado ? 'btn-danger' : (hasDatoFacturacion ? 'btn-success' : 'btn-danger')} w-100 mb-1" 
                                    ${hasDatoFacturacion ? 'disabled' : ''} 
                                    onclick="${hasDatoFacturacion ? '' : `marcarFacturado('${data[i].id}', '${data[i].email}', '${data[i].nombre}', '${data[i].remito}')`}">
                                    ${hasDatoFacturacion ? data[i].datoFacturacion : 'Marcar Facturado'} 
                                    <i class="bi bi-lock-fill icono"></i>
                                    </button>

                            <!-- Botón para abrir el modal -->
                            <button id="infoFacturacionButton${data[i].id}" class="btn btn-warning mt-1 w-100" data-bs-toggle="modal" data-bs-target="#infoFacturacionModal${data[i].id}">
                            <img id="presea" src="./Img/logo-presea.png"> Facturación Automatica
                            </button>

                                </div>
                            </div>

                            <button class="btn ${data[i].observaciones ? 'btn-info' : 'btn-secondary'} btn-sm w-100 mb-1 observaciones-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseObservaciones-${data[i].id}" aria-expanded="false" aria-controls="collapseObservaciones-${data[i].id}">
                                ${data[i].observaciones ? '<i class="bi bi-chevron-down"></i> Posee Notas <img class="error-comment" src="./Img/error-comment.gif" alt="Notas">' : '<i class="bi bi-chevron-down"></i> Notas <i class="bi bi-sticky-fill"></i>'}
                            </button>
                            <div class="collapse" id="collapseObservaciones-${data[i].id}">
                                <div class="mb-3 mt-2 divObs">
                                    <label for="observaciones-${data[i].id}" class="form-label">Observaciones</label>
                                    <textarea id="observaciones-${data[i].id}" class="form-control-obs" placeholder="Agregar observaciones" style="resize: both; min-height: 50px;">${data[i].observaciones || ''}</textarea>
                                    <button class="btn btn-secondary mt-1 update-observaciones mb-1" data-id="${data[i].id}">Actualizar Observaciones</button>
                                </div>
                            </div>


                            <div class="alert alert-danger d-none" id="alert-${data[i].id}" role="alert">
                                Datos Actualizados en DataBase <i class="bi bi-check2-all"></i>
                            </div>
                    
<select class="tipoElectrodomesticoBna ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}" 
        id="tipoElectrodomesticoBna-${data[i].id}" 
        name="TipoElectrodomestico" 
        onchange="rellenarMedidas(this, '${data[i].id}')">
    <option value="">Seleccione un producto ⤵</option>
    ${isMacro(storeCode) ? `
        <option value="heladera">Heladera</option>
        <option value="heladera_bajo_mesada">Heladera Bajo Mesada</option>
        <option value="freezer_pequeño">Freezer Pequeño</option>
        <option value="freezer_medio">Freezer Mediano</option>
        <option value="freezer_grande">Freezer Grande</option>
        <option value="cocina">Cocina</option>
        <option value="hornoEmpotrable">Horno Empotrable</option>
        <option value="lavavajillas">Lavavajillas</option>
        <option value="lavarropasCargaFrontal">Lavarropas Carga Frontal</option>
        <option value="lavarropasCargaSuperior">Lavarropas Carga Superior</option>
        <option value="split2700">Split 2700W</option>
        <option value="split3300">Split 3300W</option>
        <option value="split4500">Split 4500W</option>
        <option value="split5500">Split 5500W</option>
        <option value="split6000">Split 6000W</option>
        <option value="splitPisoTecho18000">Piso Techo 18000 Frigorías</option>
        <option value="aireportatil">Aire Portatil</option>
        <option value="ventiladordepared">Ventilador de Pared</option>
        <option value="colchon80cm">Colchon 80cm</option>
        <option value="colchon100cm">Colchon 100cm</option>
        <option value="colchon140cm">Colchon 140cm</option>
        <option value="colchon160cm">Colchon 160cm</option>
        <option value="colchon200cm">Colchon 200cm</option>
        <option value="termotanque50">Termotanque 50L</option>
        <option value="termotanque80">Termotanque 80L</option>
        <option value="termotanque110">Termotanque 110L</option>
        <option value="termotanque150">Termotanque 150L</option>
        <option value="termotanque180">Termotanque 180L</option>
        <option value="termotanque255">Termotanque 255L COM255</option>
        <option value="termotanque300">Termotanque 300L RHCTP300N</option>
        <option value="smartTV32">Smart TV 32"</option>
        <option value="smartTV40">Smart TV 40"</option>
        <option value="smartTV43">Smart TV 43"</option>
        <option value="smartTV50">Smart TV 50"</option>
        <option value="smartTV58">Smart TV 58"</option>
        <option value="smartTV65">Smart TV 65"</option>
        <option value="smartTV70">Smart TV 70"</option>
        <option value="calefactor2000">Calefactor a Gas 2000 Calorías</option>
        <option value="calefactor3000">Calefactor a Gas 3000 Calorías</option>
        <option value="calefactor5000">Calefactor a Gas 5000 Calorías</option>
        <option value="calefactor8000">Calefactor a Gas 8000 Calorías</option>
        <option value="bultoOca" selected>Bulto Oca Macro Premia</option>
        <option value="bulto20">Bulto Pequeño 20x20</option>
        <option value="bulto30">Bulto Pequeño 30x30</option>
        <option value="bulto40">Bulto Pequeño 40x40</option>
        <option value="bulto50">Bulto Pequeño 50x50</option>
    ` : `
        <option value="heladera">Heladera</option>
        <option value="heladera_bajo_mesada">Heladera Bajo Mesada</option>
        <option value="freezer_pequeño">Freezer Pequeño</option>
        <option value="freezer_medio">Freezer Mediano</option>
        <option value="freezer_grande">Freezer Grande</option>
        <option value="cocina">Cocina</option>
        <option value="hornoEmpotrable">Horno Empotrable</option>
        <option value="lavavajillas">Lavavajillas</option>
        <option value="lavarropasCargaFrontal">Lavarropas Carga Frontal</option>
        <option value="lavarropasCargaSuperior">Lavarropas Carga Superior</option>
        <option value="split2700">Split 2700W</option>
        <option value="split3300">Split 3300W</option>
        <option value="split4500">Split 4500W</option>
        <option value="split5500">Split 5500W</option>
        <option value="split6000">Split 6000W</option>
        <option value="splitPisoTecho18000">Piso Techo 18000 Frigorías</option>
        <option value="aireportatil">Aire Portatil</option>
        <option value="ventiladordepared">Ventilador de Pared</option>
        <option value="colchon80cm">Colchon 80cm</option>
        <option value="colchon100cm">Colchon 100cm</option>
        <option value="colchon140cm">Colchon 140cm</option>
        <option value="colchon160cm">Colchon 160cm</option>
        <option value="colchon200cm">Colchon 200cm</option>
        <option value="termotanque50">Termotanque 50L</option>
        <option value="termotanque80">Termotanque 80L</option>
        <option value="termotanque110">Termotanque 110L</option>
        <option value="termotanque150">Termotanque 150L</option>
        <option value="termotanque180">Termotanque 180L</option>
        <option value="termotanque255">Termotanque 255L COM255</option>
        <option value="termotanque300">Termotanque 300L RHCTP300N</option>
        <option value="smartTV32">Smart TV 32"</option>
        <option value="smartTV40">Smart TV 40"</option>
        <option value="smartTV43">Smart TV 43"</option>
        <option value="smartTV50">Smart TV 50"</option>
        <option value="smartTV58">Smart TV 58"</option>
        <option value="smartTV65">Smart TV 65"</option>
        <option value="smartTV70">Smart TV 70"</option>
        <option value="calefactor2000">Calefactor a Gas 2000 Calorías</option>
        <option value="calefactor3000">Calefactor a Gas 3000 Calorías</option>
        <option value="calefactor5000">Calefactor a Gas 5000 Calorías</option>
        <option value="calefactor8000">Calefactor a Gas 8000 Calorías</option>
        <option value="bulto20">Bulto Pequeño 20x20</option>
        <option value="bulto30">Bulto Pequeño 30x30</option>
        <option value="bulto40">Bulto Pequeño 40x40</option>
        <option value="bulto50">Bulto Pequeño 50x50</option>
    `}
</select>
        
                        <div class="medidas ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}"></div> <!-- Div para las medidas -->

                        <div class="conjuntoDeBotonesMeli" style="display: flex; flex-direction: column;">
                            
                        <div class="bg-Hr-primary mb-1">
                            <p><i class="bi bi-tags-fill"></i> ${isLogPlaceIt ? 'Logística PlaceIt' : 'Logística Privada'}</p>
                        </div>

                            <!-- Botón Oca -->
                            <button class="btn mt-1 ${data[i].marcaPreparado === 'Si' ? 'btn-success' : 'btn-oca'} ${isMacro(storeCode) ? '' : 'hidden'}" 
                                    id="ocaButton${data[i].id}" 
                                    ${data[i].cancelado ? 'disabled' : ''} 
                                    onclick="enviarDatosOca('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle2}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${cleanString(data[i].producto_nombre)}', '${String(data[i].suborden_)}', '${data[i].fechaDeCreacion}', '${data[i].sku}', '${data[i].cantidad}')">
                                <span id="OcaText${data[i].id}">
                                    ${data[i].marcaPreparado === 'Si' 
                                        ? `<i class="bi bi-filetype-pdf"></i> Descargar ${data[i].numeroSeguimiento}` 
                                        : `<img class="OcaMeli" src="Img/oca-tini.png" alt="OCA"> Etiqueta <strong>OCA</strong>`}
                                </span>
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerOca${data[i].id}" style="display:none;"></span>
                            </button>                           

                            <!-- Botón Cruz del Sur --> 
                            <button class="btn mt-1 btnCDSMeli ${isCDS ? 'btn-success' : 'btn-dark-blue'} ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}"
                                id="CDSButton${data[i].id}" 
                                ${isAndreani || isAndesmar || data[i].cancelado ? 'disabled' : ''}
                                onclick="${isCDS ? `descargarEtiquetaCDS('${data[i].cotizacion}', '${data[i].trackingNumber}', '${data[i].id}')` : `enviarDatosCDS('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle2}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${cleanString(data[i].producto_nombre)}', '${data[i].sku}')`}">
                                <span id="CDSText${data[i].id}">
                                ${isCDS ? `<i class="bi bi-filetype-pdf"></i> Descargar ${data[i].transportCompanyNumber}` : `<img class="CDSMeli" src="Img/Cruz-del-Sur-tini.png" alt="Cruz del Sur"> Etiqueta <strong>Cruz del Sur</strong>`}
                                </span>
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerCDS${data[i].id}" style="display:none;"></span>
                            </button>
                            
                            <!-- Botón Andesmar -->          
                            <button class="btn mt-1 ${isAndesmar ? 'btn-success' : 'btn-primary'} ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}" 
                                id="andesmarButton${data[i].id}" 
                                ${isAndreani || isCDS || data[i].cancelado ? 'disabled' : ''} 
                                ${isAndesmar ? `onclick="window.open('https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data[i].transportCompanyNumber}', '_blank')"` : `onclick="enviarDatosAndesmar('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle2}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${data[i].suborden_total}', '${cleanString(data[i].producto_nombre)}', '${data[i].sku}')`}">
                                <span id="andesmarText${data[i].id}">
                                ${isAndesmar ? `<i class="bi bi-filetype-pdf"></i> Descargar ${data[i].transportCompanyNumber}` : `<img class="AndesmarMeli" src="Img/andesmar-tini.png" alt="Andesmar"> Etiqueta <strong>Andesmar</strong>`}
                                </span>
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data[i].id}"></span>
                            </button>
                            
                            <!-- Botón Andreani --> 
                            <button class="btn mt-1 btnAndreaniMeli ${isAndreani ? 'btn-success' : 'btn-danger'} ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}"
                                id="andreaniButton${data[i].id}" 
                                ${isAndesmar || isCDS || data[i].cancelado ? 'disabled' : ''} 
                                onclick="${isAndreani ? `handleButtonClick('${data[i].transportCompanyNumber}', '${data[i].id}')` : `enviarDatosAndreani('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle2}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${cleanString(data[i].producto_nombre)}', '${data[i].sku}')`}">
                                <span id="andreaniText${data[i].id}">
                                ${isAndreani ? `<i class="bi bi-filetype-pdf"></i> Descargar ${data[i].transportCompanyNumber}` : `<img class="AndreaniMeli" src="Img/andreani-tini.png" alt="Andreani"> Etiqueta <strong>Andreani</strong>`}
                                </span>
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani${data[i].id}" style="display:none;"></span>
                            </button>
                            <div class="bg-Hr-primary ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}">
                            <p><i class="bi bi-tags-fill"></i> Logistica Propia</p>
                            </div>

                            <!-- Botón Logística Propia --> 
                            <button class="btn mt-1 btnLogPropiaMeli ${isLogPropia ? 'btn-success' : 'btn-secondary'} ${isMacro(storeCode) || isLogPlaceIt ? 'hidden' : ''}"
                            id="LogPropiaMeliButton${data[i].id}" 
                            ${data[i].cancelado ? 'disabled' : ''} 
                            onclick="generarPDF('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle2}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${cleanString(data[i].producto_nombre)}', '${data[i].sku}',)">
                            <span>
                            ${isLogPropia ? `<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta Novogar` : `<img class="NovogarMeli" src="Img/novogar-tini.png" alt="Novogar"> Etiqueta <strong>Novogar</strong>`}
                            </span>
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerLogPropia${data[i].id}" style="display:none;"></span>
                            </button>

                            <div class="bg-Hr-primary ${data[i].envio !== 'oca' || isLogPlaceIt ? 'hidden' : ''}">
                            <p><i class="bi bi-info-circle-fill"></i> Generar reclamo</p>
                            </div>

                            <!-- Botón Formulario de Reclamo OCA -->
                            <button class="mt-1 btn btn-danger ${data[i].envio !== 'oca' || isLogPlaceIt ? 'hidden' : ''}"
                            onclick="window.open('https://int.oca.com.ar/soporteclientes/', '_blank')">
                            <img class="OcaMeli" src="Img/oca-tini.png" alt="OCA"> Formulario de Reclamo <strong>OCA</strong>
                            </button>

                        </div>

                        <div id="resultado${data[i].id}" class="mt-2 errorMeliBna" style="margin-bottom: ${data[i].diaPlaceIt || data[i].cancelado ? '15px' : '0'}; background-color: ${data[i].diaPlaceIt || data[i].cancelado ? '#d0ffd1' : 'transparent'};">
                            ${data[i].cancelado ? 
                                'Atención: Venta cancelada o con Botón de Arrepentimiento' : 
                                ''
                            }
                            ${data[i].diaPlaceIt ? 
                                `<div>PlaceIt: ${data[i].diaPlaceIt}</div>` : 
                                ''
                            }
                        </div>

                    </div>
                        
                </div>
                `
                ;

                // Elimina Comillas en el nombre de los productos
                function cleanString(value) {
                    return value.replace(/["']/g, "");
                } 

                document.querySelectorAll('.orden').forEach(el => {
                const texto = el.textContent.trim().toLowerCase();
                if (texto.startsWith('bpr')) {
                    el.classList.add('scroll');
                }
                });

// Evento para manejar el cambio del switch "Preparación"
document.getElementById(`preparacion-${data[i].id}`).addEventListener('change', function() {
    const nuevoEstado = this.checked ? 'Si' : 'No';

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    // Verificar si el tipo de electrodoméstico ya existe
    firebase.database().ref('enviosBNA/' + data[i].id).once('value').then((snapshot) => {
        const tipoElectrodomesticoActual = snapshot.val().tipoElectrodomesticoBna;

        // Solo actualizar si no existe o si está vacío
        if (!tipoElectrodomesticoActual || tipoElectrodomesticoActual === "") {
            firebase.database().ref('enviosBNA/' + data[i].id).update({
                marcaPreparado: nuevoEstado,
                tipoElectrodomesticoBna: "bulto50" // Actualiza también tipoElectrodomesticoBna
            }).then(() => {
                console.log(`Estado de preparación actualizado a: ${nuevoEstado}`);
                
                // Actualizar el badge
                const contadorCards1 = document.getElementById('contadorCards1');
                if (contadorCards1) {
                    const currentCount = parseInt(contadorCards1.innerText) || 0;
                    contadorCards1.innerText = this.checked ? Math.max(currentCount - 1, 0) : currentCount + 1; // Resta si está marcado, suma si está desmarcado
                }
            }).catch(error => {
                console.error("Error al actualizar el estado de preparación: ", error);
            });
        } else {
            // Si ya existe y no está vacío, solo actualizar marcaPreparado
            firebase.database().ref('enviosBNA/' + data[i].id).update({
                marcaPreparado: nuevoEstado
            }).then(() => {
                console.log(`Estado de preparación actualizado a: ${nuevoEstado} sin cambiar tipoElectrodomesticoBna.`);
                
                // Actualizar el badge
                const contadorCards1 = document.getElementById('contadorCards1');
                if (contadorCards1) {
                    const currentCount = parseInt(contadorCards1.innerText) || 0;
                    contadorCards1.innerText = this.checked ? Math.max(currentCount - 1, 0) : currentCount + 1; // Resta si está marcado, suma si está desmarcado
                }
            }).catch(error => {
                console.error("Error al actualizar el estado de preparación: ", error);
            });
        }
    });
});

// Evento para manejar el cambio del switch "Entregado"
document.getElementById(`entregado-${data[i].id}-1`).addEventListener('change', function() {
    const nuevoEstado = this.checked ? 'Si' : 'No';

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    // Actualizar en Firebase
    firebase.database().ref('enviosBNA/' + data[i].id).update({
        marcaEntregado: nuevoEstado
    }).then(() => {
        console.log(`Estado de entrega actualizado a: ${nuevoEstado}`);
        
        // Actualizar el badge
        const contadorCards2 = document.getElementById('contadorCards2');
        if (contadorCards2) {
            const currentCount = parseInt(contadorCards2.innerText) || 0;
            contadorCards2.innerText = this.checked ? Math.max(currentCount - 1, 0) : currentCount + 1; // Resta si está marcado, suma si está desmarcado
        }
    }).catch(error => {
        console.error("Error al actualizar el estado de entrega: ", error);
    }).finally(() => {
        // Volver a habilitar la escucha de cambios
        databaseRef.on('value', snapshot => {
            // Aquí puedes manejar la actualización de datos si es necesario
        });
    });
});
                document.getElementById(`edit-localidad-${data[i].id}`).addEventListener('click', function() {
                    const editDiv = document.getElementById(`edit-input-${data[i].id}`);
                    editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
                });
                
                document.getElementById(`localidad-input-${data[i].id}`).addEventListener('input', function() {
                    const query = this.value.toLowerCase();
                    const suggestions = localidades.filter(loc => 
                        loc.localidad.toLowerCase().includes(query) || 
                        loc.provincia.toLowerCase().includes(query) || 
                        loc.codigosPostales.some(cp => cp.includes(query))
                    ).slice(0, 5); 
                    
                    const suggestionsList = document.getElementById(`suggestions-${data[i].id}`);
                    suggestionsList.innerHTML = '';
                    
                    suggestions.forEach(suggestion => {
                        const li = document.createElement('li');
                        li.classList.add('list-group-item');
                
                        const cp = suggestion.codigosPostales[0];
                        const localidad = capitalize(suggestion.localidad.trim());
                        const provincia = capitalize(suggestion.provincia.trim());
                
                        li.textContent = `${cp}, ${localidad}, ${provincia}`;
                        
                        li.addEventListener('click', function() {
                            // Actualizar y guardar en Firebase
                            data[i].cp = cp;
                            data[i].localidad = localidad;
                            data[i].provincia = provincia;
                
                            // Guardar en Firebase
                            firebase.database().ref('enviosBNA/' + data[i].id).update({
                                codigo_postal: cp,
                                ciudad: localidad,
                                provincia: provincia
                            }).then(() => {
                                const cpLocalidadElement = document.querySelector(`.card[data-id='${data[i].id}'] .cpLocalidad`);
                                if (cpLocalidadElement) {
                                    cpLocalidadElement.innerHTML = `<i class="bi bi-geo-alt"></i> ${cp}, ${localidad}, ${provincia}`;
                                }
                                document.getElementById(`edit-input-${data[i].id}`).style.display = 'none';
                
                                // Mostrar SweetAlert
                                Swal.fire({
                                    title: 'Éxito',
                                    text: 'Localidad actualizada',
                                    icon: 'success',
                                    confirmButtonText: 'Aceptar'
                                }).then(() => {
                                    // Recargar la página
                                    location.reload();
                                });
                            }).catch(error => {
                                console.error("Error al actualizar la localidad: ", error);
                            });
                        });
                
                        suggestionsList.appendChild(li);
                    });
                });                             

                // Lógica para determinar el mensaje estado de Facturacion
const facturaStatusDiv = document.getElementById(`factura-status-${data[i].id}`);
if (hasCancelado) {
    // Si ha sido cancelado
    facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
    facturaStatusDiv.classList.remove('facturable'); 
    facturaStatusDiv.classList.add('em-circle-state-time-cancelado'); 
    facturaStatusDiv.innerHTML = '<i class="bi bi-x-circle-fill" style="margin-right: 5px;"></i> Cancelado'; // Mensaje de cancelación
} else if (hasDatoFacturacion) {
    // Si ha sido facturado
    facturaStatusDiv.innerHTML = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado'; 
    facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
    facturaStatusDiv.classList.remove('facturable'); 
    facturaStatusDiv.classList.add('em-circle-state-time-facturado'); 
} else {
    // Si no ha sido facturado
    facturaStatusDiv.textContent = mensajeFactura;
    facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
    facturaStatusDiv.classList.add('em-circle-state-time'); 
}

        // Lógica para cargar el tipoElectrodomesticoBna si existe
        const tipoElectrodomesticoBnaSelect = card.querySelector(`#tipoElectrodomesticoBna-${data[i].id}`);
        if (data[i].tipoElectrodomesticoBna) {
            tipoElectrodomesticoBnaSelect.value = data[i].tipoElectrodomesticoBna;
            // Llamar a la función para rellenar medidas con el valor seleccionado, indicando que es una carga inicial
            rellenarMedidas(tipoElectrodomesticoBnaSelect, data[i].id, true);
        }        

        // Lógica del botón de copiar al portapapeles
        const copyButton = card.querySelector('.copy-btn');
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(data[i].remito).then(() => {
                copyButton.innerHTML = '<i class="bi bi-clipboard-check-fill"></i>';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                }, 2000);
            }).catch(err => console.error('Error al copiar al portapapeles: ', err));
        });

        cardsContainer.appendChild(card);
        
    }

    // Agregar el evento para actualizar observaciones
    addUpdateObservacionesEvent();

}

function copiarCliente(cliente) {
    navigator.clipboard.writeText(cliente).then(() => {
        showAlert(`Se ha copiado al portapapeles: Cliente ${cliente}`);
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

function toggleEdit(id) {
    const editButton = document.getElementById(`editButton_${id}`);
    const inputs = [
        `razon_social_${id}`,
        `cuit_${id}`,
        `condicion_iva_${id}`,
        `nombre_${id}`,
        `apellido_${id}`,
        `dni_${id}`,
        `telefono_${id}`,
        `domicilio_fiscal_${id}`,
        `calle_${id}`,
        `email_${id}`,
        `altura_${id}`,
        `deposito_${id}`,
        `localidad_${id}`,
        `tipo_entrega_${id}`,
        `codigo_postal_${id}`,
        `domicilio_envio_${id}`,
        `localidad_envio_${id}`,
        `cp_envio_${id}`,
        `telefono_envio_${id}`,
        `persona_autorizada_${id}`,
        `otros_comentarios_entrega_${id}`,
        // Campos de pago
        `precio_item_${id}`,
        `descuentos_${id}`,
        `monto_envio_${id}`,
        `monto_total_${id}`
    ].map(fieldId => document.getElementById(fieldId));

    const isEditing = editButton.textContent === "Guardar";

    // Habilitar o deshabilitar los campos de entrada para Facturacion
    inputs.forEach(input => {
        if (input) {
            input.disabled = isEditing;
        }
    });

    if (isEditing) {
        // Recoger datos actualizados
        const updatedData = {
            razon_social: document.getElementById(`razon_social_${id}`).value,
            cuit: document.getElementById(`cuit_${id}`).value,
            condicion_iva: document.getElementById(`condicion_iva_${id}`).value,
            nombre: document.getElementById(`nombre_${id}`).value,
            apellido: document.getElementById(`apellido_${id}`).value,
            dni: document.getElementById(`dni_${id}`).value,
            telefono: document.getElementById(`telefono_${id}`).value,
            domicilio_fiscal: document.getElementById(`domicilio_fiscal_${id}`).value,
            calle: document.getElementById(`calle_${id}`).value,
            altura: document.getElementById(`altura_${id}`).value,
            deposito: document.getElementById(`deposito_${id}`).value,
            tipo_entrega: document.getElementById(`tipo_entrega_${id}`).value,
            localidad: document.getElementById(`localidad_${id}`).value,
            codigo_postal: document.getElementById(`codigo_postal_${id}`).value,
            domicilio_envio: document.getElementById(`domicilio_envio_${id}`).value,
            localidad_envio: document.getElementById(`localidad_envio_${id}`).value,
            cp_envio: document.getElementById(`cp_envio_${id}`).value,
            email: document.getElementById(`email_${id}`).value,
            telefono_envio: document.getElementById(`telefono_envio_${id}`).value,
            persona_autorizada: document.getElementById(`persona_autorizada_${id}`).value,
            otros_comentarios_entrega: document.getElementById(`otros_comentarios_entrega_${id}`).value
        };

        // Actualizar en Firebase
        firebase.database().ref('enviosBNA/' + id).update(updatedData)
            .then(() => {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Datos actualizados correctamente.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                editButton.textContent = "Editar"; // Cambiar texto a "Editar"
            })
            .catch(error => {
                console.error("Error al actualizar datos: ", error);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron actualizar los datos.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
    } else {
        editButton.textContent = "Guardar"; // Cambiar texto a "Guardar"
    }
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
        a.download = `Etiqueta_BNA_${numeroDeEnvio}.pdf`; // Nombre del archivo
        document.body.appendChild(a);
        a.click(); // Simular clic en el enlace
        document.body.removeChild(a); // Eliminar el enlace del DOM
    } catch (error) {
        console.error('Error al obtener la etiqueta:', error);
    }
}

async function handleCorrection(id) {
    const result = await Swal.fire({
        title: 'Clave de Corrección 🔒',
        input: 'password',
        inputLabel: 'Contraseña de facturación (Solicitela al gerente)',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputAttributes: {
            maxlength: 4
        }
    });

    if (result.isConfirmed) {
        const clave = result.value;
        const fechaActual = new Date();
        const horaFormateada = fechaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
        const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const fechaFormateada = fechaActual.toLocaleDateString('es-AR', opcionesFecha);

        let contenidoBoton;
        let nombreFacturado;

        switch (clave) {
            case '1110':
                nombreFacturado = 'Marchetti';
                break;
            case '1111':
                nombreFacturado = 'Fabbri';
                break;
            case '1112':
                nombreFacturado = 'Luraschi';
                break;
            case '1113':
                nombreFacturado = 'Daffonchio';
                break;
            case '1114':
                nombreFacturado = 'Delminio';
                break;
            case '1115':
                nombreFacturado = 'Ponzoni';
                break;
            case '1116':
                nombreFacturado = 'Villalba';
                break;
            default:
                Swal.fire('Clave incorrecta', '', 'error');
                return;
        }

        contenidoBoton = `Corregido ${nombreFacturado} ${horaFormateada} ${fechaFormateada}`;
        const mensajeFactura = `<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Corregido`;

        // Actualizar en Firebase
        await firebase.database().ref(`enviosBNA/${id}`).update({
            errorSlack: false,
            correccionSlack: `${nombreFacturado} ${horaFormateada} ${fechaFormateada}`
        });

        // Actualizar el DOM
        const container = document.querySelector(`.container-slack-${id}`);
        if (container) {
            container.style.display = 'none';

        }

        Swal.fire({
            title: 'Éxito',
            text: contenidoBoton,
            icon: 'success'
        });
    }
}

async function marcarFacturado(id, email, nombre, remito) {
    const facturaStatusDiv = document.getElementById(`factura-status-${id}`);
    Swal.fire({
        title: 'Clave de facturación 🔒',
        input: 'password',
        inputLabel: 'Contraseña de facturacion (Solicitela al gerente)',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputAttributes: {
            maxlength: 4
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            const clave = result.value;

            // Comprobación de la clave y formateo de la fecha y hora
            let contenidoBoton;
            const fechaActual = new Date();
            
            // Formateo de la hora
            const horaFormateada = fechaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
            
            // Formateo de la fecha
            const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const fechaFormateada = fechaActual.toLocaleDateString('es-AR', opcionesFecha);
            
            // Mensaje para el contenido del botón
            let mensajeFactura = '';

            if (clave === '1110') {
                contenidoBoton = `Facturado Brisa ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else if (clave === '1111') {
                contenidoBoton = `Facturado Leo ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else if (clave === '1112') {
                contenidoBoton = `Facturado Julian ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else if (clave === '1113') {
                contenidoBoton = `Facturado Mauricio ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else if (clave === '1114') {
                contenidoBoton = `Facturado Automata Nicolas D. ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else if (clave === '1115') {
                contenidoBoton = `Facturado Automata Lucas P. ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else if (clave === '1116') {
                contenidoBoton = `Facturado Automata Rocio V. ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
            } else {
                Swal.fire('Clave incorrecta', '', 'error');
                return; // Salir si la clave es incorrecta
            }
            
            // Cambiar el contenido del botón y deshabilitarlo
            const boton = document.getElementById(`marcar-facturado-${id}`);
            boton.textContent = contenidoBoton;
            boton.classList.remove('btn-danger');
            boton.classList.add('btn-success');
            boton.disabled = true;

            // Cambiar el contenido y clase del div de estado de factura
            facturaStatusDiv.innerHTML = mensajeFactura;
            facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
            facturaStatusDiv.classList.remove('facturable'); 
            facturaStatusDiv.classList.add('em-circle-state-time-facturado');

            // Pushear en Firebase
            const ref = firebase.database().ref(`enviosBNA/${id}/datoFacturacion`);
            await ref.set(contenidoBoton).then(() => {
                Swal.fire('Datos guardados correctamente', '', 'success');
            }).catch((error) => {
                console.error('Error al guardar en Firebase:', error);
                Swal.fire('Error al guardar datos', '', 'error');
            });

            const Name = `Confirmación de Compra Novogar`;
            const Subject = `Tu compra ${remito} fue Facturada - Novogar`;
            const template = "emailFacturacion";
            const transporte = "Pendiente";
            const numeroDeEnvio = `Pendiente`;
            const linkSeguimiento2 = `Pendiente`;

            // Enviar el email después de procesar el envío
            await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);            

            // Actualizar los contadores de los badges
            actualizarContadores(-1, 1); // Restar 1 a Facturar y sumar 1 a Preparar

            cerrarCollapseCard(id);

            cerrarModal(id);

            // Limpiar el buscador y mostrar todas las tarjetas después de un retraso de 2 segundos
            setTimeout(() => {
                clearSearchInput();
                searchInput.dispatchEvent(new Event('input'));
            }, 2000);
        }
    });
}

function clearSearchInput() {
    const searchInput = document.getElementById('searchBna');
    if (searchInput) {
        searchInput.value = '';
    }
}

function actualizarContadores(cambioFacturar, cambioPreparar) {
    const contadorFacturar = document.getElementById('contadorCardsFacturar');
    const contadorPreparar = document.getElementById('contadorCards');

    // Obtener los valores actuales de los contadores
    let valorFacturar = parseInt(contadorFacturar.textContent) || 0;
    let valorPreparar = parseInt(contadorPreparar.textContent) || 0;

    // Actualizar los valores de los contadores
    valorFacturar = Math.max(0, valorFacturar + cambioFacturar); // Actualizar Facturar, asegurando que no sea negativo
    valorPreparar = Math.max(0, valorPreparar + cambioPreparar); // Actualizar Preparar, asegurando que no sea negativo

    // Establecer los nuevos valores en los badges
    contadorFacturar.textContent = valorFacturar;
    contadorPreparar.textContent = valorPreparar;
}

function marcarCancelado2(id) {
    const facturaStatusDiv = document.getElementById(`factura-status-${id}`);
    const claveInput = document.getElementById(`clave-facturacion-${id}`);
    const clave = claveInput.value;

    // Comprobación de la clave y formateo de la fecha y hora
    let contenidoBoton;
    const fechaActual = new Date();
    
    // Formateo de la hora
    const horaFormateada = fechaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Formateo de la fecha
    const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = fechaActual.toLocaleDateString('es-AR', opcionesFecha);
    
    // Mensaje para el contenido del botón
    let mensajeCancelado = '';
    let nombreFacturador = '';

    // Determinar el nombre del facturador según la clave
    switch (clave) {
        case '1110':
            nombreFacturador = 'Brisa';
            contenidoBoton = `Cancelado Brisa ${horaFormateada} ${fechaFormateada}`;
            break;
        case '1111':
            nombreFacturador = 'Mauricio';
            contenidoBoton = `Cancelado Mauricio ${horaFormateada} ${fechaFormateada}`;
            break;
        case '1112':
            nombreFacturador = 'Marina';
            contenidoBoton = `Cancelado Marina ${horaFormateada} ${fechaFormateada}`;
            break;
        case '1113':
            nombreFacturador = 'Leo';
            contenidoBoton = `Cancelado Leo ${horaFormateada} ${fechaFormateada}`;
            break;
        case '1114':
            nombreFacturador = 'Nicolas D.';
            contenidoBoton = `Cancelado Nicolas ${horaFormateada} ${fechaFormateada}`;
            break;
        case '1115':
            nombreFacturador = 'Lucas P.';
            contenidoBoton = `Cancelado Lucas P. ${horaFormateada} ${fechaFormateada}`;
            break;
        case '1116':
            nombreFacturador = 'Rocio V.';
            contenidoBoton = `Cancelado Rocio V. ${horaFormateada} ${fechaFormateada}`;
            break;
        default:
            Swal.fire('Clave incorrecta', '', 'error');
            return; // Salir si la clave es incorrecta
    }

    mensajeCancelado = '<i class="bi bi-x-circle" style="margin-right: 5px;"></i> Cancelado';

    // Cambiar el contenido del botón y deshabilitarlo
    const boton = document.getElementById(`cancelar-venta-${id}`);
    boton.textContent = contenidoBoton;
    boton.classList.remove('btn-danger');
    boton.classList.add('btn-secondary');
    boton.disabled = true;

    // Cambiar el contenido y clase del div de estado de factura
    facturaStatusDiv.innerHTML = mensajeCancelado;
    facturaStatusDiv.classList.remove('facturable'); // Remover la clase facturable
    facturaStatusDiv.classList.add('em-circle-state-time-cancelado'); // Agregar la clase cancelado
    facturaStatusDiv.classList.add('cancelado-bna'); // Agregar la clase cancelado-bna

    // Pushear en Firebase
    const refEnvios = firebase.database().ref(`enviosBNA/${id}`);
    refEnvios.update({
        marcaEntregado: "Si",
        marcaPreparado: "Si",
        tipoElectrodomesticoBna: "bulto20",
        estado: "Cancelado",
        datoFacturacion: `Cancelado ${nombreFacturador} ${horaFormateada} ${fechaFormateada}`,
        cancelado: true
    }).then(() => {
        console.log(`Venta cancelada y pusheada: ${nombreFacturador} ${horaFormateada} ${fechaFormateada}`);
    }).catch((error) => {
        console.error("Error al pushear a Firebase:", error);
    });

    // Actualizar los contadores de los badges
    actualizarContadores(-1, -1); // Restar 1 a Facturar y Resta 1 a Preparar

    cerrarCollapseCard(id);

    cerrarModal(id);   

    // Limpiar el buscador y mostrar todas las tarjetas después de un retraso de 2 segundos
    const searchInput = document.getElementById('searchBna');
    setTimeout(() => {
    searchInput.value = ''; 
    searchInput.dispatchEvent(new Event('input'));
    }, 2000);
}

function cerrarCollapseCard(id) {
    const collapseElements = document.querySelectorAll(`#collapseDetalleProducto-${id}, #collapseDetalleFacturacion-${id}, #collapseDetallePago-${id}, #collapseObservaciones-${id}`);
    collapseElements.forEach(element => {
        const collapseInstance = new bootstrap.Collapse(element, {
            toggle: false
        });
        collapseInstance.hide();
    });
}

async function marcarFacturado2(id, email, nombre, remito) {
    const facturaStatusDiv = document.getElementById(`factura-status-${id}`);
    const claveInput = document.getElementById(`clave-facturacion-${id}`);
    const clave = claveInput.value;

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off(); // Desactiva la escucha

    // Comprobación de la clave y formateo de la fecha y hora
    let contenidoBoton;
    const fechaActual = new Date();
    
    // Formateo de la hora
    const horaFormateada = fechaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Formateo de la fecha
    const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const fechaFormateada = fechaActual.toLocaleDateString('es-AR', opcionesFecha);
    
    // Mensaje para el contenido del botón
    let mensajeFactura = '';

    if (clave === '1110') {
        contenidoBoton = `Facturado Automata Brisa ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else if (clave === '1111') {
        contenidoBoton = `Facturado Automata Leo ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else if (clave === '1112') {
        contenidoBoton = `Facturado Automata Luraschi ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else if (clave === '1113') {
        contenidoBoton = `Facturado Automata Mauricio ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else if (clave === '1114') {
        contenidoBoton = `Facturado Automata Nicolas D. ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else if (clave === '1115') {
        contenidoBoton = `Facturado Automata Lucas P. ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else if (clave === '1116') {
        contenidoBoton = `Facturado Automata Rocio V. ${horaFormateada} ${fechaFormateada}`;
        mensajeFactura = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado';
    } else {
        Swal.fire('Clave incorrecta', '', 'error');
        return; 
    }

    // Cambiar el contenido del botón y deshabilitarlo
    const boton = document.getElementById(`marcar-facturado-${id}`);
    boton.textContent = contenidoBoton;
    boton.classList.remove('btn-danger');
    boton.classList.add('btn-success');
    boton.disabled = true;

    // Cambiar el contenido y clase del div de estado de factura
    facturaStatusDiv.innerHTML = mensajeFactura;
    facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
    facturaStatusDiv.classList.remove('facturable'); 
    facturaStatusDiv.classList.add('em-circle-state-time-facturado');

// Pushear en Firebase
const refEnvios = firebase.database().ref(`enviosBNA/${id}/datoFacturacion`);

// Obtener el order_id para usarlo como ID del nodo
const orderId = document.getElementById(`order_id_${id}`)?.value;
const refFacturacion = firebase.database().ref(`facturacionBna/${orderId}`);

// Obtener el SKU desde ambos campos
const skuInput = document.getElementById(`sku_${id}`);
const codigoItemInput = document.getElementById(`codigo_item_${id}`);

const skuValue = skuInput ? skuInput.value : '';
const codigoItemValue = codigoItemInput ? codigoItemInput.value : '';

// Verificar si el SKU está incluido en la lista
const isSkuIncluded = skusList.includes(skuValue) || skusList.includes(codigoItemValue);
const isSkuIncludedPlaceIt = skusPlaceItList.includes(skuValue) || skusList.includes(codigoItemValue);

// Crear objeto con los datos
const datos = {
    order_id: document.getElementById(`order_id_${id}`)?.value || '',
    estado: 'Aprobado',
    metodo_pago: document.getElementById(`metodo_pago_${id}`)?.value || '',
    numero_lote: '11',
    cupon_pago: document.getElementById(`cupon_pago_${id}`)?.value || '',
    cod_autorizacion: document.getElementById(`cod_autorizacion_${id}`)?.value || '',
    numero_tarjeta_visible: document.getElementById(`numero_tarjeta_visible_${id}`)?.value || '',
    codigo_pago: document.getElementById(`codigo_pago_${id}`)?.value || '',
    cuotas: document.getElementById(`cuotas_${id}`)?.value || '',
    banco: '',
    tipo_entrega: document.getElementById(`tipo_entrega_${id}`)?.value || '',
    deposito: document.getElementById(`deposito_${id}`)?.value || '',
    exportado: '0',
    descuentos: document.getElementById(`descuentos_${id}`)?.value || '',
    fecha_acreditacion: document.getElementById(`fecha_acreditacion_${id}`)?.value || '',
    fecha: document.getElementById(`fecha_${id}`)?.value || '',
    monto_depositado: document.getElementById(`monto_depositado_${id}`)?.value || '',
    observacion_deposito_transferencia: document.getElementById(`observacion_deposito_transferencia_${id}`)?.value || '',
    codigo_promocion: document.getElementById(`codigo_promocion_${id}`)?.value || '',
    codigo_item: codigoItemValue, // Usar el valor del campo codigo_item
    nombre_item: document.getElementById(`nombre_item_${id}`).value || '',
    recargo_item: '0',
    email: document.getElementById(`email_${id}`)?.value || '',
    cantidad_item: document.getElementById(`cantidad_item_${id}`)?.value || '',
    precio_item: document.getElementById(`precio_item_${id}`)?.value || '',
    monto_envio: document.getElementById(`monto_envio_${id}`)?.value || '',
    monto_total: document.getElementById(`monto_total_${id}`)?.value || '',
    razon_social: document.getElementById(`razon_social_${id}`)?.value || '',
    cuit: document.getElementById(`cuit_${id}`)?.value || '',
    condicion_iva: document.getElementById(`condicion_iva_${id}`)?.value || '',
    nombre: document.getElementById(`nombre_${id}`)?.value || '',
    apellido: document.getElementById(`apellido_${id}`)?.value || '',
    dni: document.getElementById(`dni_${id}`)?.value || '',
    telefono: document.getElementById(`telefono_${id}`)?.value || '',
    domicilio_fiscal: document.getElementById(`domicilio_fiscal_${id}`)?.value || '',
    calle: document.getElementById(`calle_${id}`)?.value || '',
    altura: document.getElementById(`altura_${id}`)?.value || '',
    localidad: document.getElementById(`localidad_${id}`)?.value || '',
    codigo_postal: document.getElementById(`codigo_postal_${id}`)?.value || '',
    domicilio_envio: document.getElementById(`domicilio_envio_${id}`)?.value || '',
    localidad_envio: document.getElementById(`localidad_envio_${id}`)?.value || '',
    telefono_envio: document.getElementById(`telefono_envio_${id}`)?.value || '',
    persona_autorizada: document.getElementById(`persona_autorizada_${id}`)?.value || '',
    otros_comentarios_entrega: document.getElementById(`otros_comentarios_entrega_${id}`)?.value || '',
    provincia: document.getElementById(`provincia_${id}`)?.value || ''
};

// Solo agregar imei: "si" si el SKU está incluido
if (isSkuIncluded) {
    datos.imei = "si";
}

// Guardar contenido del botón en Firebase
refEnvios.set(contenidoBoton).then(() => {
    // Guardar datos en Firebase
    return refFacturacion.set(datos);
}).then(() => {
    Swal.fire('Datos enviados para su facturación', '', 'success');
}).catch((error) => {
    console.error('Error al guardar en Firebase:', error);
    Swal.fire('Error al guardar datos', '', 'error');
});

const Name = `Confirmación de Compra Novogar`;
const Subject = `Tu compra ${remito} fue Facturada - Novogar`;
const template = "emailFacturacion";
const transporte = "Pendiente";
const numeroDeEnvio = `Pendiente`;
const linkSeguimiento2 = `Pendiente`;

// Determinar el tipo basado en los datos de DNI y CUIT
let tipo;
let mensajeTipo;

const dni = document.getElementById(`dni_${id}`)?.value || '';
const cuit = document.getElementById(`cuit_${id}`)?.value || '';
const monto_total = document.getElementById(`monto_total_${id}`)?.value || '';
const razon_social = document.getElementById(`razon_social_${id}`)?.value || '';

if (dni && dni !== "") { // Verifica si DNI tiene datos 
    tipo = "TIPO B";
    mensajeTipo = `🟢 **TIPO B:** El total es *$${monto_total}* 💰`;
} else if (cuit && cuit !== "") { // Verifica si CUIT tiene datos
    tipo = "TIPO A";
    mensajeTipo = `🔴 **TIPO A:** A la RAZÓN SOCIAL *${razon_social}*, el total es *$${monto_total}* 💳`;
} else {
    mensajeTipo = `❌ No se proporcionaron datos válidos para determinar el tipo.`;
}

const codigo_pago = document.getElementById(`codigo_pago_${id}`)?.value || 'Código no disponible';
const cantidad_item = document.getElementById(`cantidad_item_${id}`)?.value || '0';
const metodo_pago_TV = document.getElementById(`metodo_pago_${id}`)?.value || 'SIN DATO DE LA TIENDA';
const codigo_item = document.getElementById(`codigo_item_${id}`)?.value || 'Código no disponible';
const precio_item = document.getElementById(`precio_item_${id}`)?.value || '0';
const monto_envio = document.getElementById(`monto_envio_${id}`)?.value || '0';

// Enviar notificación a Slack
const mensajeSlack = {
    text: `\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n➡️📄 Estoy procesando la factura de la Orden *${codigo_pago}* de *${metodo_pago_TV}*\n\n 🧾 por *${cantidad_item}* U. de *${codigo_item}* 🛒 a *$${precio_item}* por unidad y *$${monto_envio}* de envío 🚚. \n\n ${mensajeTipo} 🎉 \n\n* * * * * * * * * * * * * * * * * * * * * * * *\n\n`
};

fetch(`${corsh}${HookTv}`, {
    method: 'POST',
    headers: {
        'x-cors-api-key': `${live}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(mensajeSlack)
}).then(response => {
    if (!response.ok) {
        throw new Error('Error al enviar el mensaje a Slack');
    }
}).catch(error => {
    console.error('Error:', error);
});

// Enviar el email después de procesar el envío
await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio); 

databaseRef.on('value', snapshot => {
    loadEnviosFromFirebase(); 
});
            
// Actualizar los contadores de los badges
actualizarContadores(-1, 1); // Restar 1 a Facturar y sumar 1 a Preparar

cerrarCollapseCard(id);

cerrarModal(id);

// Limpiar el buscador y mostrar todas las tarjetas después de un retraso de 2 segundos
const searchInput = document.getElementById('searchBna');
setTimeout(() => {
searchInput.value = ''; 
searchInput.dispatchEvent(new Event('input'));
}, 2000);

}

async function marcarFacturado3(id, email, nombre, remito) {

    // Obtener el order_id para usarlo como ID del nodo
    const orderId = document.getElementById(`order_id_${id}`)?.value;
    const randomNum = Math.floor(100 + Math.random() * 900); // Random 3 Numeros
    const refFacturacion = firebase.database().ref(`facturacionBna/${randomNum}-reproceso-${orderId}`);

    // Obtener el SKU desde ambos campos
    const skuInput = document.getElementById(`sku_${id}`);
    const codigoItemInput = document.getElementById(`codigo_item_${id}`);

    const skuValue = skuInput ? skuInput.value : '';
    const codigoItemValue = codigoItemInput ? codigoItemInput.value : '';

    // Verificar si el SKU está incluido en la lista
    const isSkuIncluded = skusList.includes(skuValue) || skusList.includes(codigoItemValue);

    // Crear objeto con los datos
    const datos = {
        order_id: `${randomNum}-reproceso-${orderId}` || '',
        estado: 'Aprobado',
        metodo_pago: document.getElementById(`metodo_pago_${id}`)?.value || '',
        numero_lote: '11',
        cupon_pago: document.getElementById(`cupon_pago_${id}`)?.value || '',
        cod_autorizacion: document.getElementById(`cod_autorizacion_${id}`)?.value || '',
        numero_tarjeta_visible: document.getElementById(`numero_tarjeta_visible_${id}`)?.value || '',
        codigo_pago: document.getElementById(`codigo_pago_${id}`)?.value || '',
        cuotas: document.getElementById(`cuotas_${id}`)?.value || '',
        banco: '',
        tipo_entrega: document.getElementById(`tipo_entrega_${id}`)?.value || '',
        deposito: '9',
        exportado: '0',
        descuentos: document.getElementById(`descuentos_${id}`)?.value || '',
        fecha_acreditacion: document.getElementById(`fecha_acreditacion_${id}`)?.value || '',
        fecha: document.getElementById(`fecha_${id}`)?.value || '',
        monto_depositado: document.getElementById(`monto_depositado_${id}`)?.value || '',
        observacion_deposito_transferencia: document.getElementById(`observacion_deposito_transferencia_${id}`)?.value || '',
        codigo_promocion: document.getElementById(`codigo_promocion_${id}`)?.value || '',
        codigo_item: codigoItemValue, // Usar el valor del campo codigo_item
        nombre_item: document.getElementById(`nombre_item_${id}`).value || '',
        recargo_item: '0',
        email: document.getElementById(`email_${id}`)?.value || '',
        cantidad_item: document.getElementById(`cantidad_item_${id}`)?.value || '',
        precio_item: document.getElementById(`precio_item_${id}`)?.value || '',
        monto_envio: document.getElementById(`monto_envio_${id}`)?.value || '',
        monto_total: document.getElementById(`monto_total_${id}`)?.value || '',
        razon_social: document.getElementById(`razon_social_${id}`)?.value || '',
        cuit: document.getElementById(`cuit_${id}`)?.value || '',
        condicion_iva: document.getElementById(`condicion_iva_${id}`)?.value || '',
        nombre: document.getElementById(`nombre_${id}`)?.value || '',
        apellido: document.getElementById(`apellido_${id}`)?.value || '',
        dni: document.getElementById(`dni_${id}`)?.value || '',
        telefono: document.getElementById(`telefono_${id}`)?.value || '',
        domicilio_fiscal: document.getElementById(`domicilio_fiscal_${id}`)?.value || '',
        calle: document.getElementById(`calle_${id}`)?.value || '',
        altura: document.getElementById(`altura_${id}`)?.value || '',
        localidad: document.getElementById(`localidad_${id}`)?.value || '',
        codigo_postal: document.getElementById(`codigo_postal_${id}`)?.value || '',
        domicilio_envio: document.getElementById(`domicilio_envio_${id}`)?.value || '',
        localidad_envio: document.getElementById(`localidad_envio_${id}`)?.value || '',
        telefono_envio: document.getElementById(`telefono_envio_${id}`)?.value || '',
        persona_autorizada: document.getElementById(`persona_autorizada_${id}`)?.value || '',
        otros_comentarios_entrega: document.getElementById(`otros_comentarios_entrega_${id}`)?.value || '',
        provincia: document.getElementById(`provincia_${id}`)?.value || ''
    };

    // Solo agregar imei: "si" si el SKU está incluido
    if (isSkuIncluded) {
        datos.imei = "si";
    }

    try {
    
        await refFacturacion.set(datos); 
        
        Swal.fire('Datos enviados para su facturación', '', 'success');
        console.log('Datos enviados a Firebase para ser Reprocesado');
    } catch (error) {
        console.error('Error al guardar en Firebase:', error);
        Swal.fire('Error al guardar datos', '', 'error');
    }

    // Actualizar en Firebase
    await firebase.database().ref(`enviosBNA/${id}`).update({
        errorSlack: false,
    });
    
    // Determinar el tipo basado en los datos de DNI y CUIT
    let tipo;
    let mensajeTipo;

    const dni = document.getElementById(`dni_${id}`)?.value || '';
    const cuit = document.getElementById(`cuit_${id}`)?.value || '';
    const monto_total = document.getElementById(`monto_total_${id}`)?.value || '';
    const razon_social = document.getElementById(`razon_social_${id}`)?.value || '';

    if (dni && dni !== "") { // Verifica si DNI tiene datos 
        tipo = "TIPO B";
        mensajeTipo = `🟢 **TIPO B:** El total es *$${monto_total}* 💰`;
    } else if (cuit && cuit !== "") { // Verifica si CUIT tiene datos
        tipo = "TIPO A";
        mensajeTipo = `🔴 **TIPO A:** A la RAZÓN SOCIAL *${razon_social}*, el total es *$${monto_total}* 💳`;
    } else {
        mensajeTipo = `❌ No se proporcionaron datos válidos para determinar el tipo.`;
    }

    const codigo_pago = document.getElementById(`codigo_pago_${id}`)?.value || 'Código no disponible';
    const cantidad_item = document.getElementById(`cantidad_item_${id}`)?.value || '0';
    const metodo_pago_TV = document.getElementById(`metodo_pago_${id}`)?.value || 'SIN DATO DE LA TIENDA';
    const codigo_item = document.getElementById(`codigo_item_${id}`)?.value || 'Código no disponible';
    const precio_item = document.getElementById(`precio_item_${id}`)?.value || '0';
    const monto_envio = document.getElementById(`monto_envio_${id}`)?.value || '0';

    // Enviar notificación a Slack
    const mensajeSlack = {
        text: `\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n🔁📄 Estoy *Re-Procesando por ERROR DE SLACK* la factura de la Orden *${codigo_pago}* de *${metodo_pago_TV}*\n\n 🧾 por *${cantidad_item}* U. de *${codigo_item}* 🛒 a *$${precio_item}* por unidad y *$${monto_envio}* de envío 🚚. \n\n 🟡 **REPROCESO:** Error de Slack \n\n ${mensajeTipo} 🎉 \n\n* * * * * * * * * * * * * * * * * * * * * * * *\n\n`
    };

    fetch(`${corsh}${HookTv}`, {
        method: 'POST',
        headers: {
            'x-cors-api-key': `${live}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mensajeSlack)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Error al enviar el mensaje a Slack');
        }
    }).catch(error => {
        console.error('Error:', error);
    });

    databaseRef.on('value', snapshot => {
        loadEnviosFromFirebase(); 
    });      
}

function cerrarModal(id) {
    // Cerrar el modal utilizando jQuery si está disponible
    if (typeof $ !== 'undefined') {
        $(`#infoFacturacionModal${id}`).modal('hide');
    } else {
        // Alternativa sin jQuery
        const modal = document.getElementById(`infoFacturacionModal${id}`);
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
            modal.style.display = 'none';

            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.parentNode.removeChild(modalBackdrop);
            }
        }
    }
}

const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

async function enviarDatosAndesmar(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, suborden_total, precio_venta, producto_nombre, sku) {
    // Obtener los elementos de volumen
    const volumenCm3Elemento = document.getElementById(`medidas-cm3-${id}`);
    const volumenM3Elemento = document.getElementById(`medidas-m3-${id}`);

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    // Redondear el precio_venta y convertirlo a un entero
    const precioVentaRedondeado = Math.round(precio_venta);

    // Comprobar si los elementos existen
    if (!volumenCm3Elemento || !volumenM3Elemento) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe seleccionar un producto del listado.',
            confirmButtonText: 'OK'
        });
        return; // Salir de la función si no se seleccionó un producto
    }

    // Obtener los valores de texto
    const volumenCm3Texto = volumenCm3Elemento.textContent;
    const volumenM3Texto = volumenM3Elemento.textContent;

    const alto = parseFloat(document.getElementById(`alto-${id}`).value);
    const ancho = parseFloat(document.getElementById(`ancho-${id}`).value);
    const largo = parseFloat(document.getElementById(`largo-${id}`).value);
    const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value);
    const peso = parseFloat(document.getElementById(`peso-${id}`).value);

    const buttonCDS = document.getElementById(`CDSButton${id}`);
    const button = document.getElementById(`andesmarButton${id}`);
    const spinner = document.getElementById(`spinnerAndesmar${id}`);
    const text = document.getElementById(`andesmarText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);

    // Comprobar si los elementos existen y asignar null si no existen
    const altoInterior = parseFloat(document.getElementById(`altoInterior-${id}`)?.value) || null;
    const anchoInterior = parseFloat(document.getElementById(`anchoInterior-${id}`)?.value) || null;
    const largoInterior = parseFloat(document.getElementById(`largoInterior-${id}`)?.value) || null;
    const observaciones = document.getElementById(`observaciones-${id}`).value; // Obtiene el valor del campo de observaciones
    const tipoElectrodomestico = document.getElementById(`tipoElectrodomesticoBna-${id}`).value;

    // Extraer los números de los textos (eliminar 'cm³' y 'm³')
    const volumenCm3 = parseInt(volumenCm3Texto.replace(' cm³', ''));
    const volumenM3 = parseFloat(volumenM3Texto.replace(' m³', ''));

    // Verificar si los volúmenes son nulos o no válidos
    if (isNaN(volumenCm3) || isNaN(volumenM3)) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe seleccionar un producto del listado.',
            confirmButtonText: 'OK'
        });
        return; // Salir de la función si no se seleccionó un producto
    }

    console.log(`Enviando datos a Andesmar:
        Volumen en m³: ${volumenM3}, Alto: ${alto}, Ancho: ${ancho}, Largo: ${largo}, Cantidad: ${cantidad}, Peso: ${peso}, Alto UI: ${altoInterior}, Ancho UI: ${anchoInterior}, Largo UI: ${largoInterior}, Volumen en cm³: ${volumenCm3}, Observaciones: ${observaciones}, 
        ID: ${id}, Nombre: ${nombre}, CP: ${cp}, Localidad: ${localidad}, Remito: ${remito}, Valor Declarado: ${precio_venta},
        Calle: ${calle}, Teléfono: ${telefono}, Email: ${email}, Tipo Electrodoméstico: ${producto_nombre}
    `);

    // Verificar si el tipo de electrodoméstico es uno de los splits
    const splitTypes = ["split2700", "split3300", "split4500", "split5500", "split6000", "splitPisoTecho18000"];
    const isSplit = splitTypes.includes(tipoElectrodomestico);

    // Inicializar cantidadKits
    let cantidadKitsParsed = 0;

    // Calcular la cantidad de bultos
    let bultos = cantidad;

    if (isSplit) {
        // Preguntar si incluye kit de instalación solo si es un split
        const { value: incluyeKit } = await Swal.fire({
            title: '¿Incluye kit de instalación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (incluyeKit) {
            // Preguntar la cantidad de kits de instalación
            const { value: cantidadKits } = await Swal.fire({
                title: 'Cantidad de kits de instalación',
                input: 'number',
                inputLabel: 'Ingrese la cantidad de kits',
                inputAttributes: {
                    min: 1,
                    max: 100
                },
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
            });

            if (cantidadKits === null) {
                // Si el usuario cancela, salir de la función
                return;
            }

            cantidadKitsParsed = parseInt(cantidadKits) || 1; // Usar 1 si no es un número válido
            bultos = (cantidad * 2) + cantidadKitsParsed; // Duplicar bultos si es un split y sumar los kits
        } else {
            bultos *= 2; // Duplicar bultos si es un split y no incluye kit
        }
    }

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    const remitoCliente = await solicitarNumeroRemito();
    if (!cliente) return; 
    if (!remitoCliente) return; 

    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';
    buttonAndr.disabled = true;
    buttonCDS.disabled = true;
        
    const unidadVenta = [3500, 3100, 3400].includes(parseInt(cp))
        ? "CARGAS LOG RTO C Y SEGUIMIENTO"
        : "cargas remito conformado";

    const random1 = Math.floor(Math.random() * 10) + 1; 
    const random2 = Math.floor(Math.random() * 10) + 1; 
    const random3 = Math.floor(Math.random() * 10) + 1; 
        
    const concatenatedNumbers = `${random1}${random2}${random3}`;

    const requestObj = {
        CalleRemitente: "Mendoza",
        CalleNroRemitente: "2799",
        CodigoPostalRemitente: "2000",
        NombreApellidoDestinatario: nombre,
        CodigoPostalDestinatario: cp,
        CalleDestinatario: calle,
        CalleNroDestinatario: "S/N",
        TelefonoDestinatario: telefono,
        MailDestinatario: email,
        NroRemito: "BNA" + remito + concatenatedNumbers,
        Bultos: bultos,
        Peso: peso * cantidad,
        ValorDeclarado: precio_venta * cantidad,
        M3: volumenM3,
        Alto: [],
        Ancho: [],
        Largo: [],
        Observaciones: `${calle}, Telefono: ${telefono}, Electrodomestico: ${producto_nombre}`,
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

    // Llenar las medidas de acuerdo a la cantidad de bultos
    for (let i = 0; i < cantidad; i++) {
        requestObj.Alto.push(alto);
        requestObj.Ancho.push(ancho);
        requestObj.Largo.push(largo);
    }

    // Si es un split, agregar las medidas de la unidad interior
    if (isSplit) {
        for (let i = 0; i < cantidad; i++) {
            requestObj.Alto.push(altoInterior);
            requestObj.Ancho.push(anchoInterior);
            requestObj.Largo.push(largoInterior);
        }
    }

    // Si incluye kit de instalación, agregar sus medidas (40x35x30 cm)
    if (cantidadKitsParsed > 0) {
        for (let i = 0; i < cantidadKitsParsed; i++) {
            requestObj.Alto.push(40); // Alto del kit en cm
            requestObj.Ancho.push(35); // Ancho del kit en cm
            requestObj.Largo.push(30); // Largo del kit en cm
        }
    }

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";

    console.log(`Datos enviados a API Andesmar (${remito}):`, requestObj); // Mostrar request en consola

    try {
        const response = await fetch(proxyUrl + apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
            },
            body: JSON.stringify(requestObj)
        });

        const data = await response.json();
        console.log(`Datos Respuesta API Andesmar (${remito}):`, data); // Mostrar response en consola

        if (data.NroPedido) {
            const Name = `Confirmación de Envio Novogar`;
            const Subject = `Tu compra ${remito} ya fue preparada para despacho`;
            const template = "emailTemplateAndesmar";
            const transporte = "Andesmar Cargas";
            const linkEtiqueta = `https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            const linkSeguimiento = `https://andesmarcargas.com/seguimiento.html?numero=BNA${remito}&tipo=remito&cod=`;
            const linkSeguimiento2 = `https://andesmarcargas.com/seguimiento.html?numero=BNA${remito}&tipo=remito&cod=`;

            // Actualizar el texto del botón
            text.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            window.open(linkEtiqueta, '_blank');
            NroEnvio.innerHTML = `<a href="${linkSeguimiento}" target="_blank">Andesmar: ${data.NroPedido} <i class="bi bi-box-arrow-up-right"></i></a>`;
            
            // Pushear datos a Firebase
            const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
            const transportData = {
                transportCompany: "Andesmar",
                trackingLink: linkSeguimiento,
                transportCompanyNumber: data.NroPedido,
                remito: remitoCliente,
                cliente: cliente
            };
            
            await db.ref(`enviosBNA/${id}`).update(transportData);
            console.log("Datos actualizados en Firebase:", transportData);
    
            // Nueva entrada en Firebase
            const nuevaEntradaRef = db.ref('enviosAndesmar').push(); // RUTA FIREBASE
            await nuevaEntradaRef.set({
                nombreApellido: nombre,
                nroPedido: data.NroPedido, 
                codigoPostal: cp,
                localidad: `${localidad}, ${provincia}`, 
                calleDelDestinatario: calle,
                numeroDeCalle: "S/N",
                telefono: telefono,
                remito: `BNA${remito}${concatenatedNumbers}`, 
                cotizacion: `$${precio_venta - suborden_total}` 
            });
            console.log("Nueva entrada agregada a Firebase:", { nombre, nroPedido: data.NroPedido, cp, localidad, calle, telefono });
                
            // Actualizar estado de envío
            if (envioState) {
                envioState.className = 'em-circle-state4';
                envioState.innerHTML = `Preparado`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }

            // Agregar datos a "DespachosLogisticos"
            const fechaHoraFormateada = formatearFechaHora(fechaHora); 

            // Asegúrate de que la función sea async si estás usando await
            await dbMeli.ref(`DespachosLogisticos/${remitoCliente}`).set({
                cliente: cliente,
                estado: "Pendiente de despacho",
                fechaHora: fechaHoraFormateada,
                operadorLogistico: "Pendiente",
                remito: remitoCliente,
                remitoVBA: remitoCliente,
                valorDeclarado: `$ ${precioVentaRedondeado.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
                email: email,
                direccion: calle,
                comentarios: "Coordinar en Línea: " + telefono,
                telefono: telefono,
                sku: sku,
                cantidad: cantidad,
                cp: cp,
                orden: remito,
                tienda: "TIENDAS VIRTUALES",
                localidad: localidad,
                nombre: nombre,
                provincia: provincia
            }).then(() => {
                console.log(`Datos actualizados en DespachosLogisticos para el remito: ${remitoCliente}`);
            }).catch(error => {
                console.error('Error al actualizar en DespachosLogisticos:', error);
            });

            // Enviar el email después de procesar el envío
            await sendEmail(Name, Subject, template, nombre, email, `BNA${remito}`, linkSeguimiento2, transporte);
        } else {
            buttonAndr.disabled = false;
            buttonCDS.disabled = true;
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`; 
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
        }
    } catch (error) {
        buttonAndr.disabled = false;
        buttonCDS.disabled = true;
        console.error("Error:", error);
        text.innerText = "Envio No Disponible ⚠️"; // Cambiar texto en caso de error
        resultadoDiv.innerText = `Error: ${error.message}`; // Mostrar error debajo
    } finally {
        spinner.style.display = 'none'; // Asegúrate de ocultar el spinner en caso de error
    }
}

function addUpdateObservacionesEvent() {
    const updateButtons = document.querySelectorAll('.update-observaciones');

    updateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const textarea = document.getElementById(`observaciones-${id}`);
            const newObservaciones = textarea.value;

            // Actualizar en Firebase
            firebase.database().ref(`enviosBNA/${id}`).update({
                observaciones: newObservaciones
            }).then(() => {
                // Mostrar mensaje de éxito con SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Las observaciones se han actualizado correctamente.',
                });
            }).catch((error) => {
                console.error('Error al actualizar las observaciones:', error);
                Swal.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: 'No se pudo actualizar las observaciones.',
                });
            });
        });
    });
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

// BOTON CRUZ DEL SUR
async function enviarDatosCDS(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, precio_venta, producto_nombre, sku) {
    
    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    // Redondear el precio_venta y convertirlo a un entero
    const precioVentaRedondeado = Math.round(precio_venta);

    // Calcular el precio sin IVA (suponiendo un IVA del 21%)
    const tasaIVA = 0.21;
    const precioSinIVA = parseFloat((precioVentaRedondeado / (1 + tasaIVA)).toFixed(2)); 

    console.log(`Precio con IVA: ${precioVentaRedondeado}, Precio sin IVA: ${precioSinIVA}`);

    // Obtener los elementos de volumen
    const volumenCm3Elemento = document.getElementById(`medidas-cm3-${id}`);
    const volumenM3Elemento = document.getElementById(`medidas-m3-${id}`);

    // Comprobar si los elementos existen
    if (!volumenCm3Elemento || !volumenM3Elemento) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe seleccionar un producto del listado.',
            confirmButtonText: 'OK'
        });
        return; // Salir de la función si no se seleccionó un producto
    }

    // Obtener los valores de texto
    const volumenCm3Texto = volumenCm3Elemento.textContent;
    const volumenM3Texto = volumenM3Elemento.textContent;

    const altoA = document.getElementById(`alto-${id}`).value;
    const anchoA = document.getElementById(`ancho-${id}`).value;
    const largoA = document.getElementById(`largo-${id}`).value;
    const cantidad = document.getElementById(`cantidad-${id}`).value;
    const peso = document.getElementById(`peso-${id}`).value;

    // Comprobar si los elementos existen y asignar null si no existen
    const altoInterior = document.getElementById(`altoInterior-${id}`) ? document.getElementById(`altoInterior-${id}`).value : null;
    const anchoInterior = document.getElementById(`anchoInterior-${id}`) ? document.getElementById(`anchoInterior-${id}`).value : null;
    const largoInterior = document.getElementById(`largoInterior-${id}`) ? document.getElementById(`largoInterior-${id}`).value : null;

    const observaciones = document.getElementById(`observaciones-${id}`).value;

    // Extraer los números de los textos (eliminar 'cm³' y 'm³')
    const volumenCm3 = parseInt(volumenCm3Texto.replace(' cm³', ''));
    const volumenM3 = parseFloat(volumenM3Texto.replace(' m³', ''));

    const button = document.getElementById(`CDSButton${id}`);
    const buttonCDS = document.getElementById(`CDSButton${id}`);
    const spinnerCDS = document.getElementById(`spinnerCDS${id}`);
    const textCDS = document.getElementById(`CDSText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);
    const queEntregaCds = "E";
    const buttonAndi = document.getElementById(`andesmarButton${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);

    // Verificar si los volúmenes son nulos o no válidos
    if (isNaN(volumenCm3) || isNaN(volumenM3)) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe seleccionar un producto del listado.',
            confirmButtonText: 'OK'
        });
        return; // Salir de la función si no se seleccionó un producto
    }

    console.log(`Enviando datos a Cruz del Sur:
            Volumen en m³: ${volumenM3}, Alto: ${altoA}, Ancho: ${anchoA}, Largo: ${largoA}, Cantidad: ${cantidad}, Peso: ${peso}, Alto UI: ${altoInterior}, Ancho UI: ${anchoInterior}, Largo UI: ${largoInterior}, Volumen en cm³: ${volumenCm3}, Observaciones: ${observaciones}, 
            ID: ${id}, Nombre: ${nombre}, CP: ${cp}, Localidad: ${localidad}, Remito: ${remito}, Valor Declarado: ${precio_venta},
            Calle: ${calle}, Teléfono: ${telefono}, Email: ${email}, Tipo Electrodoméstico: ${producto_nombre}
        `);
    
    // Calcular el volumen total en m³ multiplicando los lados
    const volumenTotalcds = (altoA * anchoA * largoA) / 1000000; 
    
    console.log(`Volumen Total en m³: ${volumenTotalcds}`);

        // Solicitar el cliente
        const cliente = await solicitarCliente();
        const remitoCliente = await solicitarNumeroRemito();
        if (!cliente) return; 
        if (!remitoCliente) return; 

    // Mostrar spinner y cambiar texto
    spinnerCDS.style.display = 'inline-block';
    textCDS.innerText = 'Generando Etiqueta...';
    button.disabled = true
    buttonAndi.disabled = true;
    buttonAndr.disabled = true;

// Verificar si el tipo de electrodoméstico es uno de los splits
const tipoElectrodomestico = document.getElementById(`tipoElectrodomesticoBna-${id}`).value; 
const splitTypes = ["split2700", "split3300", "split4500", "split5500", "split6000", "splitPisoTecho18000"];
const isSplit = splitTypes.includes(tipoElectrodomestico);

    // Inicializar cantidadKits
    let cantidadKitsParsed = 0;

    // Calcular la cantidad de bultos
    let bultos = cantidad;

    if (isSplit) {
        // Preguntar si incluye kit de instalación solo si es un split
        const { value: incluyeKit } = await Swal.fire({
            title: '¿Incluye kit de instalación?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (incluyeKit) {
            // Preguntar la cantidad de kits de instalación
            const { value: cantidadKits } = await Swal.fire({
                title: 'Cantidad de kits de instalación',
                input: 'number',
                inputLabel: 'Ingrese la cantidad de kits',
                inputAttributes: {
                    min: 1,
                    max: 100
                },
                showCancelButton: true,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
            });

            if (cantidadKits === null) {
                // Si el usuario cancela, salir de la función
                return;
            }

            cantidadKitsParsed = parseInt(cantidadKits) || 1; // Usar 1 si no es un número válido
            bultos = (cantidad * 2) + cantidadKitsParsed; // Duplicar bultos si es un split y sumar los kits
        } else {
            bultos *= 2; // Duplicar bultos si es un split y no incluye kit
        }
    }

    console.log(`Enviando datos a Cruz del Sur:
        Volumen en m³: ${volumenM3}, Alto: ${altoA}, Ancho: ${anchoA}, Largo: ${largoA}, Cantidad: ${cantidad}, Peso: ${peso}, Alto UI: ${altoInterior}, Ancho UI: ${anchoInterior}, Largo UI: ${largoInterior}, Volumen en cm³: ${volumenCm3}, Observaciones: ${observaciones}, 
        ID: ${id}, Nombre: ${nombre}, CP: ${cp}, Localidad: ${localidad}, Remito: ${remito}, Valor Declarado: ${precio_venta},
        Calle: ${calle}, Teléfono: ${telefono}, Email: ${email}, Tipo Electrodoméstico: ${producto_nombre}
    `);

    const random1 = Math.floor(Math.random() * 10) + 1;
    const random2 = Math.floor(Math.random() * 10) + 1;
    const random3 = Math.floor(Math.random() * 10) + 1;

    const urlCds = `${corsh}https://api-ventaenlinea.cruzdelsur.com/api/NuevaCotXVolEntregaYDespacho?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&volumen=${volumenCm3}&peso=${peso}&codigopostal=${cp}&localidad=${localidad}&valor=${precio_venta}&contrareembolso=&items=&despacharDesdeDestinoSiTieneAlmacenamiento=&queentrega=${queEntregaCds}&quevia=T&documento=${remito}&nombre=${nombre}&telefono=${telefono}&email=${email}&domicilio=${calle}&bultos=${bultos}&referencia=${random1}${random2}${random3}OP${remito}&textosEtiquetasBultos&textoEtiquetaDocumentacion&devolverDatosParaEtiquetas=N`;

    const optionsCds = {
        method: 'GET',
        headers: {
            'x-cors-api-key': `${live}`
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

            const buttonId = `CDSButton${id}`;

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
            await descargarEtiquetaCDS(numeroCotizacionCds, nicCds, buttonId);
            buttonCDS.classList.remove('btn-secondary');
            buttonCDS.classList.add('btn-success');

            const trackingLink = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${nicCds}`;
            NroEnvio.innerHTML = `<a href="${trackingLink}" target="_blank">CDS: NIC-${nicCds} <i class="bi bi-box-arrow-up-right"></i></a>`;
            const numeroDeEnvioCDS = `NIC-${nicCds}`;
            trackingNumber = `${nicCds}`;

            // Pushear datos a Firebase
            const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
            const transportData = {
                transportCompany: "Cruz del Sur",
                trackingNumber: trackingNumber,
                trackingLink: trackingLink,
                cotizacion: numeroCotizacionCds,
                transportCompanyNumber: numeroDeEnvioCDS,
                remito: remitoCliente,
                cliente: cliente,
            };

            // Actualizar datos en enviosBNA
            db.ref(`enviosBNA/${id}`).update(transportData)
                .then(() => {
                    console.log("Datos actualizados en Firebase como Cruz del Sur:", transportData);
                })
                .catch(error => {
                    console.error('Error al actualizar en Firebase:', error);
                });

            // Agregar datos a "DespachosLogisticos"
            const fechaHoraFormateada = formatearFechaHora(fechaHora); 

            // Asegúrate de que la función sea async si estás usando await
            await dbMeli.ref(`DespachosLogisticos/${remitoCliente}`).set({
                cliente: cliente,
                estado: "Pendiente de despacho",
                fechaHora: fechaHoraFormateada,
                operadorLogistico: "Pendiente",
                remito: remitoCliente,
                remitoVBA: remitoCliente,
                valorDeclarado: `$ ${precioVentaRedondeado.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
                email: email,
                direccion: calle,
                comentarios: "Coordinar en Línea: " + telefono,
                telefono: telefono,
                sku: sku,
                cantidad: cantidad,
                cp: cp,
                orden: remito,
                tienda: "TIENDAS VIRTUALES",
                localidad: localidad,
                nombre: nombre,
                provincia: provincia
            }).then(() => {
                console.log(`Datos actualizados en DespachosLogisticos para el remito: ${remitoCliente}`);
            }).catch(error => {
                console.error('Error al actualizar en DespachosLogisticos:', error);
            });
            
                        // Cambiar el estado del envío
                        if (envioState) {
                            envioState.className = 'em-circle-state4';
                            envioState.innerHTML = `Preparado`;
                        }

                        const Name = `Confirmación de Envio Novogar`;
                        const Subject = `Tu compra ${remitoCliente} ya fue preparada para despacho`;
                        const template = "emailTemplateAndreani";
                        const transporte = "Correo Cruz del Sur";
                        const numeroDeEnvio = `NIC-${nicCds}`;
                        const linkSeguimiento2 = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${nicCds}`;
            
                        // Enviar el email después de procesar el envío
                        await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);            
 
        } else {
            // Manejo de otros estados de error
            console.error("Error en la respuesta:", dataCds);
            buttonCDS.classList.remove('btn-dark-blue');
            buttonCDS.classList.add('btn-danger', 'disabled');
            spinnerCDS.style.display = 'none';
            buttonAndi.disabled = false;
            buttonAndr.disabled = false;
            textCDS.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Error al generar Etiqueta';
            resultadoDiv.innerText = `Error: ${dataCds.Respuesta[0].Descripcion}`; 
        }
    } catch (error) {
        console.error("Error al crear la cotización:", error);
        document.getElementById("errorResponseCruzDelSur").innerText = "Ocurrió un error al crear la cotización. Por favor, intenta nuevamente.";
        buttonCDS.classList.remove('btn-dark-blue');
        buttonCDS.classList.add('btn-danger', 'disabled');
        spinnerCDS.style.display = 'none';
        buttonAndi.disabled = false;
        buttonAndr.disabled = false;
        textCDS.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Error al generar Etiqueta';
        resultadoDiv.innerText = `Error: ${error.message}`;
    }
}

async function descargarEtiquetaCDS(numeroCotizacionCds, nicCds, buttonId) {
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
                <i class="bi bi-filetype-pdf" style="margin-right: 8px;"></i> Descargar NIC-${nicCds}
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
// FIN BOTON CRUZ DEL SUR

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
    "tierra del fuego": "AR-V",
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

// Función para eliminar el nodo de Firebase
function eliminarNodo(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás deshacer esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminarlo!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            firebase.database().ref('enviosBNA/' + id).remove()
                .then(() => {
                    console.log(`Nodo con ID ${id} eliminado exitosamente.`);
                    // Eliminar la tarjeta del DOM
                    const cardElement = document.querySelector(`[data-id="${id}"]`);
                    if (cardElement) {
                        cardElement.remove();
                    }
                    Swal.fire(
                        'Eliminado!',
                        'El elemento ha sido eliminado.',
                        'success'
                    );

                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                })
                .catch(error => {
                    console.error("Error al eliminar el nodo: ", error);
                    Swal.fire(
                        'Error',
                        'Ocurrió un error al eliminar el elemento.',
                        'error'
                    );
                });
        }
    });
}

async function enviarDatosOca(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, precio_venta, producto_nombre, suborden, fecha, sku, cantidad) {
    const spinnerOca = document.getElementById(`spinnerOca${id}`);
    const textOca = document.getElementById(`OcaText${id}`);
    const button = document.getElementById(`ocaButton${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    if (!spinnerOca || !textOca || !button) {
        console.error('Elementos no encontrados:', { spinnerOca, textOca, button });
        return;
    }

    console.log(`Enviando datos a OCA:
        ID: ${id}, Nombre: ${nombre}, CP: ${cp}, Localidad: ${localidad}, Remito: ${remito}, Valor Declarado: ${precio_venta},
        Calle: ${calle}, Teléfono: ${telefono}, Email: ${email}, Tipo Electrodoméstico: ${producto_nombre}, SubOrden: ${suborden}, Fecha: ${fecha}
    `);

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    const remitoCliente = await solicitarNumeroRemito();
    if (!cliente) return; 
    if (!remitoCliente) return; 

    spinnerOca.style.display = 'inline-block';
    textOca.innerText = 'Generando Etiqueta...';
    button.disabled = true;

    // Redondear el precio_venta y convertirlo a un entero
    const precioVentaRedondeado = Math.round(precio_venta);

    // Parsear la fecha
    const [dia, mes, anio] = fecha.split(' ')[0].split('-');
    const fechaOriginal = new Date(anio, mes - 1, dia); // mes - 1 porque los meses empiezan desde 0

    const fechaHasta = new Date(fechaOriginal);
    fechaHasta.setDate(fechaHasta.getDate() + 15); // Sumar 10 días

    const fechaDesde = new Date(fechaOriginal); // Igual a la fecha original

    const formatFecha = (fecha) => {
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}-${mes}-${anio}`;
    };

    const fechaHastaStr = formatFecha(fechaHasta);
    const fechaDesdeStr = formatFecha(fechaDesde);

    console.log(`Enviando datos a OCA:
       Desde: ${fechaDesdeStr}
       Hasta: ${fechaHastaStr} 
       SubOrden: ${suborden}
    `);

    const url = `https://proxy.cors.sh/http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/List_Envios?CUIT=30-68543701-1&FechaDesde=${fechaDesdeStr}&FechaHasta=${fechaHastaStr}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                'Content-Type': 'application/xml'
            }
        });

        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");

        const productos = xmlDoc.getElementsByTagName("NroProducto");
        let numeroEnvio = null;

        for (let i = 0; i < productos.length; i++) {
            if (productos[i].textContent === suborden) {
                numeroEnvio = xmlDoc.getElementsByTagName("NumeroEnvio")[i].textContent;
                break;
            }
        }

        if (numeroEnvio) {
            textOca.innerText = `Etiqueta ${numeroEnvio}`;
            button.classList.remove('btn-oca');
            button.classList.add('btn-secondary');

            // Llamada a la segunda API
            const pdfUrl = `https://proxy.cors.sh/http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/GetPdfDeEtiquetasPorOrdenOrNumeroEnvioParaEtiquetadora?ordenRetiro=&numeroEnvio=${numeroEnvio}&logisticaInversa=`;
            const pdfResponse = await fetch(pdfUrl, {
                method: 'GET',
                headers: {
                    'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                    'Content-Type': 'application/xml'
                }
            });

            const pdfData = await pdfResponse.text();
            console.log('PDF Data:', pdfData);

            const base64Data = pdfData.replace(/<\?xml.*?\?>/, '').replace(/<string.*?>/, '').replace(/<\/string>/, '');
            const binaryString = atob(base64Data);
            const binaryLen = binaryString.length;
            const bytes = new Uint8Array(binaryLen);
            for (let i = 0; i < binaryLen; i++) {
                const ascii = binaryString.charCodeAt(i);
                bytes[i] = ascii;
            }
            const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
            const pdfUrlBlob = URL.createObjectURL(pdfBlob);

            button.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar ${numeroEnvio}`;
            button.classList.remove('btn-secondary');
            button.classList.add('btn-success');
            const link = document.createElement('a');
            link.href = pdfUrlBlob;
            link.download = `OCA-${nombre}-${numeroEnvio}.pdf`;
            link.click();

            const linkSeguimiento = `https://www.aftership.com/es/track/oca-ar/${numeroEnvio}`;
            const numeroDeEnvioOca = `${numeroEnvio}`;

            const envioState = document.getElementById(`estadoEnvio${id}`);
            envioState.className = 'em-circle-state4';
            envioState.innerHTML = `Preparado`;
            NroEnvio.innerHTML = `<a href="${linkSeguimiento}" target="_blank">OCA: ${numeroEnvio} <i class="bi bi-box-arrow-up-right"></i></a>`;

            // Pushear datos a Firebase
            const db = firebase.database();
            const transportData = {
                remito: remitoCliente,
                medio_de_envio: "oca",
                trackingLink: linkSeguimiento,
                numero_de_seguimiento: numeroDeEnvioOca,
                tipoElectrodomesticoBna: "bultoOca",
                marcaPreparado: "Si",
                cliente: cliente,
            };
            
              db.ref(`enviosBNA/${id}`).update(transportData)
                .then(() => {
                    console.log("Datos actualizados en Firebase como Oca:", transportData);
                })
                .catch((error) => {
                                console.error("Error al actualizar datos en Firebase:", error);
                });

            // Agregar datos a "DespachosLogisticos"
            const fechaHoraFormateada = formatearFechaHora(fechaHora); 

            // Asegúrate de que la función sea async si estás usando await
            await dbMeli.ref(`DespachosLogisticos/${remitoCliente}`).set({
                cliente: cliente,
                estado: "Pendiente de despacho",
                fechaHora: fechaHoraFormateada,
                operadorLogistico: "Pendiente",
                remito: remitoCliente,
                remitoVBA: remitoCliente,
                valorDeclarado: `$ ${precioVentaRedondeado.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
                email: email,
                direccion: calle,
                comentarios: "Coordinar en Línea: " + telefono,
                telefono: telefono,
                sku: sku,
                cantidad: cantidad,
                cp: cp,
                orden: remito,
                tienda: "TIENDAS VIRTUALES",
                localidad: localidad,
                nombre: nombre,
                provincia: provincia
            }).then(() => {
                console.log(`Datos actualizados en DespachosLogisticos para el remito: ${remitoCliente}`);
            }).catch(error => {
                console.error('Error al actualizar en DespachosLogisticos:', error);
            });

            const Name = `Confirmación de Envio Novogar`;
            const Subject = `Tu compra ${remito} ya fue preparada para despacho`;
            const template = "emailTemplateOCA";
            const transporte = "OCA";
            const numeroDeEnvio = `${numeroEnvio}`;
            const linkSeguimiento2 = `https://www.aftership.com/es/track/oca-ar/${numeroEnvio}`;

            await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);
            
        } else {
            textOca.innerText = '⚠️ No se encontró la etiqueta ';
            button.classList.add('disabled', 'btn-secondary');
        }

    } catch (error) {
        console.error('Error al llamar a la API:', error);
        textOca.innerText = '⚠️ Error al generar etiqueta';
        button.classList.add('disabled');
    } finally {
        button.disabled = false;
        spinnerOca.style.display = 'none';
    }
}

async function enviarDatosAndreani(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, precio_venta, producto_nombre, sku) {
    
    // Redondear el precio_venta y convertirlo a un entero
    const precioVentaRedondeado = Math.round(precio_venta);

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    // Calcular el precio sin IVA (suponiendo un IVA del 21%)
    const tasaIVA = 0.21;
    const precioSinIVA = parseFloat((precioVentaRedondeado / (1 + tasaIVA)).toFixed(2)); 

    console.log(`Precio con IVA: ${precioVentaRedondeado}, Precio sin IVA: ${precioSinIVA}`);

    // Obtener los elementos de volumen
    const volumenCm3Elemento = document.getElementById(`medidas-cm3-${id}`);
    const volumenM3Elemento = document.getElementById(`medidas-m3-${id}`);

    // Comprobar si los elementos existen
    if (!volumenCm3Elemento || !volumenM3Elemento) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe seleccionar un producto del listado.',
            confirmButtonText: 'OK'
        });
        return; // Salir de la función si no se seleccionó un producto
    }

    // Obtener los valores de texto
    const volumenCm3Texto = volumenCm3Elemento.textContent;
    const volumenM3Texto = volumenM3Elemento.textContent;

    const altoA = document.getElementById(`alto-${id}`).value;
    const anchoA = document.getElementById(`ancho-${id}`).value;
    const largoA = document.getElementById(`largo-${id}`).value;
    const cantidad = document.getElementById(`cantidad-${id}`).value;
    const peso = document.getElementById(`peso-${id}`).value;

    // Comprobar si los elementos existen y asignar null si no existen
    const altoInterior = document.getElementById(`altoInterior-${id}`) ? document.getElementById(`altoInterior-${id}`).value : null;
    const anchoInterior = document.getElementById(`anchoInterior-${id}`) ? document.getElementById(`anchoInterior-${id}`).value : null;
    const largoInterior = document.getElementById(`largoInterior-${id}`) ? document.getElementById(`largoInterior-${id}`).value : null;

    const observaciones = document.getElementById(`observaciones-${id}`).value;

    // Extraer los números de los textos (eliminar 'cm³' y 'm³')
    const volumenCm3 = parseInt(volumenCm3Texto.replace(' cm³', ''));
    const volumenM3 = parseFloat(volumenM3Texto.replace(' m³', ''));

    const button = document.getElementById(`andesmarButton${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const spinnerAndr = document.getElementById(`spinnerAndreani${id}`);
    const buttonCDS = document.getElementById(`CDSButton${id}`);
    const textAndr = document.getElementById(`andreaniText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);

    // Verificar si los volúmenes son nulos o no válidos
    if (isNaN(volumenCm3) || isNaN(volumenM3)) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe seleccionar un producto del listado.',
            confirmButtonText: 'OK'
        });
        return; // Salir de la función si no se seleccionó un producto
    }

    console.log(`Enviando datos a Andesmar:
        Volumen en m³: ${volumenM3}, Alto: ${altoA}, Ancho: ${anchoA}, Largo: ${largoA}, Cantidad: ${cantidad}, Peso: ${peso}, Alto UI: ${altoInterior}, Ancho UI: ${anchoInterior}, Largo UI: ${largoInterior}, Volumen en cm³: ${volumenCm3}, Observaciones: ${observaciones}, 
        ID: ${id}, Nombre: ${nombre}, CP: ${cp}, Localidad: ${localidad}, Remito: ${remito}, Valor Declarado: ${precio_venta},
        Calle: ${calle}, Teléfono: ${telefono}, Email: ${email}, Tipo Electrodoméstico: ${producto_nombre}
    `);

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    const remitoCliente = await solicitarNumeroRemito();
    if (!cliente) return; 
    if (!remitoCliente) return; 

    // Mostrar spinner y cambiar texto
    spinnerAndr.style.display = 'inline-block';
    textAndr.innerText = 'Generando Etiqueta...';
    button.disabled = true
    buttonCDS.disabled = true

    const token = await getAuthToken();

    // Obtener el nombre de la provincia y convertirlo a minúsculas
    const provinciaNombre = provincia.toLowerCase();
    const regionCodigo = regionMap[provinciaNombre] || ""; // Obtener el código de región

// Inicializar el array de bultos
const bultos = [];

// Verificar si el tipo de electrodoméstico es uno de los splits
const tipoElectrodomestico = document.getElementById(`tipoElectrodomesticoBna-${id}`).value; 
const splitTypes = ["split2700", "split3300", "split4500", "split5500", "split6000", "splitPisoTecho18000"];
const isSplit = splitTypes.includes(tipoElectrodomestico);

// Inicializar cantidadKits
let cantidadKitsParsed = 0;

// Preguntar si incluye kit de instalación solo si es un split
if (isSplit) {
    const { value: incluyeKit } = await Swal.fire({
        title: '¿Incluye kit de instalación?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    });

    if (incluyeKit) {
        const { value: cantidadKits } = await Swal.fire({
            title: 'Cantidad de kits de instalación',
            input: 'number',
            inputLabel: 'Ingrese la cantidad de kits',
            inputAttributes: {
                min: 1,
                max: 100
            },
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
        });

        if (cantidadKits === null) {
            return; // Si el usuario cancela, salir de la función
        }

        cantidadKitsParsed = parseInt(cantidadKits) || 1; // Usar 1 si no es un número válido
    }
}

// Ajustar la cantidad de bultos
const cantidadBultos = isSplit ? cantidad : cantidad;
const VolumenTotalFinal = isSplit ? volumenCm3 / 2 : volumenCm3 / cantidad;

// Inicializar arreglos para las medidas
const Alto = [];
const Ancho = [];
const Largo = [];

// Llenar las medidas de acuerdo a la cantidad de bultos
for (let i = 0; i < cantidadBultos; i++) {
    Alto.push(altoA);
    Ancho.push(anchoA);
    Largo.push(largoA);
}

// Si es un split, agregar las medidas de la unidad interior tantas veces como la cantidad de bultos
if (isSplit) {
    for (let i = 0; i < cantidadBultos; i++) {
        Alto.push(altoInterior);
        Ancho.push(anchoInterior);
        Largo.push(largoInterior);
    }
}

// Crear bultos con las medidas reales
for (let i = 0; i < cantidadBultos; i++) {
    bultos.push({
        "kilos": peso / cantidadBultos,
        "largoCm": Ancho[i] || null, // Usar Ancho[i] si existe, de lo contrario null
        "altoCm": Alto[i] || null, // Usar Alto[i] si existe, de lo contrario null
        "anchoCm": Largo[i] || null, // Usar Largo[i] si existe, de lo contrario null
        "volumenCm": VolumenTotalFinal,
        "valorDeclaradoSinImpuestos": precioSinIVA,
        "valorDeclaradoConImpuestos": precioVentaRedondeado,
        "referencias": [
            { "meta": "detalle", "contenido": producto_nombre },
            { "meta": "idCliente", "contenido": `${remito}-BNA`.toUpperCase() },
            { "meta": "observaciones", "contenido": `${calle}, Telefono: ${telefono} Electrodomestico: ${producto_nombre}` }
        ]
    });
}

// Si es un split, agregar los bultos de la unidad interior
if (isSplit) {
    for (let i = 0; i < cantidadBultos; i++) {
        bultos.push({
            "kilos": peso / cantidadBultos, // Ajusta según sea necesario
            "largoCm": anchoInterior,
            "altoCm": altoInterior,
            "anchoCm": largoInterior,
            "volumenCm": VolumenTotalFinal, // Ajustar según sea necesario
            "valorDeclaradoSinImpuestos": precioSinIVA,
            "valorDeclaradoConImpuestos": precioVentaRedondeado,
            "referencias": [
                { "meta": "detalle", "contenido": "Unidad Interior" }, // Detalle de la unidad interior
                { "meta": "idCliente", "contenido": `${remito}-BNA`.toUpperCase() },
                { "meta": "observaciones", "contenido": `${calle}, Telefono: ${telefono} Unidad Interior: ${producto_nombre}` }
            ]
        });
    }

    // Agregar bultos de kits de instalación
    for (let i = 0; i < cantidadKitsParsed; i++) {
        bultos.push({
            "kilos": 5, // Peso estimado del kit de instalación
            "largoCm": 40,
            "altoCm": 40,
            "anchoCm": 40,
            "volumenCm": 40 * 40 * 40, // Volumen del kit de instalación
            "valorDeclaradoSinImpuestos": precioSinIVA,
            "valorDeclaradoConImpuestos": precioVentaRedondeado,
            "referencias": [
                { "meta": "detalle", "contenido": "Kit de Instalación" }, // Detalle del kit de instalación
                { "meta": "idCliente", "contenido": `${remito}-BNA`.toUpperCase() },
                { "meta": "observaciones", "contenido": `${calle}, Telefono: ${telefono} Kit de Instalación: ${producto_nombre}` }
            ]
        });
    }
}

    const requestData = {
        "contrato": cantidadBultos > 1 ? "351002753" : (volumenCm3 > 100000 ? "351002753" : "400017259"),
        "idPedido": `${remito}-BNA`.toUpperCase(),
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
                "codigoPostal": cp,
                "calle": calle,
                "numero": "S/N",
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
            "nombreCompleto": nombre,
            "email": email,
            "documentoTipo": "CUIT",
            "documentoNumero": "30685437011",
            "telefonos": [{ "tipo": 1, "numero": telefono}]
        }],
        "remito": {
            "numeroRemito": `${remito}-BNA`.toUpperCase(),
        },
        "bultos": bultos
    };

    console.log(`Datos enviados a API ANDREANI (${remito}):`, requestData);

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

            console.log(`Datos Respuesta API ANDREANI (${remito}):`, response);

            const Name = `Confirmación de Envio Novogar`;
            const Subject = `Tu compra ${remito} ya fue preparada para despacho`;
            const template = "emailTemplateAndreani";
            const transporte = "Correo Andreani";
            const linkSeguimiento2 = `https://andreani.com/#!/informacionEnvio/${numeroDeEnvio}`;
            const linkSeguimiento = `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${numeroDeEnvio}`;
            
            // Configurar el botón de descarga inicial  
            buttonAndr.disabled = true;
            textAndr.innerHTML = `Orden ${numeroDeEnvio}`;
            buttonAndr.classList.remove('btn-danger');
            buttonAndr.classList.add('btn-secondary');
            NroEnvio.innerHTML = `<a href="${linkSeguimiento}" target="_blank">Andreani: ${numeroDeEnvio} <i class="bi bi-box-arrow-up-right"></i></a>`;
        
            // Pushear datos a Firebase
            const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
            const transportData = {
                transportCompany: "Andreani",
                trackingLink: linkSeguimiento,
                transportCompanyNumber: numeroDeEnvio,
                remito: remitoCliente,
                cliente: cliente,
            };
            
              db.ref(`enviosBNA/${id}`).update(transportData)
                .then(() => {
                    console.log("Datos actualizados en Firebase como Andreani:", transportData);
                })

                .catch((error) => {
                                console.error("Error al actualizar datos en Firebase:", error);
                });

            // Agregar datos a "DespachosLogisticos"
            const fechaHoraFormateada = formatearFechaHora(fechaHora); 

            // Asegúrate de que la función sea async si estás usando await
            await dbMeli.ref(`DespachosLogisticos/${remitoCliente}`).set({
                cliente: cliente,
                estado: "Pendiente de despacho",
                fechaHora: fechaHoraFormateada,
                operadorLogistico: "Pendiente",
                remito: remitoCliente,
                remitoVBA: remitoCliente,
                valorDeclarado: `$ ${precioVentaRedondeado.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
                email: email,
                direccion: calle,
                comentarios: "Coordinar en Línea: " + telefono,
                telefono: telefono,
                sku: sku,
                cantidad: cantidad,
                cp: cp,
                orden: remito,
                tienda: "TIENDAS VIRTUALES",
                localidad: localidad,
                nombre: nombre,
                provincia: provincia
            }).then(() => {
                console.log(`Datos actualizados en DespachosLogisticos para el remito: ${remitoCliente}`);
            }).catch(error => {
                console.error('Error al actualizar en DespachosLogisticos:', error);
            });

            // Cambiar el estado del envío
            if (envioState) {
                envioState.className = 'em-circle-state4';
                envioState.innerHTML = `Preparado`;
            }
            // Enviar el email después de procesar el envío
            await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);
            // Llamar a la API para obtener la etiqueta
            await obtenerEtiqueta(numeroDeEnvio, token, buttonAndr);
        } else {
            console.error('Error al generar la etiqueta:', response.statusText);
            buttonAndr.innerText = "Error Andreani ⚠️"; 
            resultadoDiv.innerText = `Error Andreani: (Puede no existir el CP o Localidad en Andreani) ${response.statusText}`; 
            buttonAndr.disabled = true;
            button.disabled = false;
            buttonCDS.disabled = false
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);

        buttonAndr.innerText = "Error Andreani ⚠️"; 
        resultadoDiv.innerText = `Error Andreani: (Puede no existir el CP o Localidad en Andreani) ${error.message}`; 
        buttonAndr.disabled = true;
        button.disabled = false;
        buttonCDS.disabled = false
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

        buttonAndr.disabled = false;
        buttonAndr.href = pdfUrl; 
        buttonAndr.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar ${numeroDeEnvio}`;
        buttonAndr.classList.remove('btn-secondary');
        buttonAndr.classList.add('btn-success');
        window.open(pdfUrl, '_blank');
    } catch (error) {
        console.error('Error al obtener la etiqueta:', error);
    }
}


function rellenarMedidas(selectElement, id, isInitialLoad = false) {
    const selectedValue = selectElement.value;
    const card = selectElement.closest('.card'); // Obtener la tarjeta más cercana
    const medidasDiv = card.querySelector('.medidas'); // Div donde se agregarán las medidas

    // Limpiar el div de medidas antes de agregar nuevos campos
    medidasDiv.innerHTML = '';

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

    // Si no es una carga inicial, mostrar el alert y actualizar Firebase
    if (!isInitialLoad) {
        const alertDiv = card.querySelector(`#alert-${id}`);
        alertDiv.classList.remove('d-none');
        setTimeout(() => {
            alertDiv.classList.add('d-none');
        }, 3000);

        // Actualizar en Firebase
        firebase.database().ref(`enviosBNA/${id}`).update({
            tipoElectrodomesticoBna: selectedValue
        }).then(() => {
            console.log('Tipo de electrodoméstico actualizado en Firebase.');
        }).catch((error) => {
            console.error('Error al actualizar tipo de electrodoméstico:', error);
        });
    }

    let alto, ancho, largo, peso, valor;
    let altoInterior, anchoInterior, largoInterior;

    switch (selectedValue) {
        case "split2700":
            alto = 55; 
            ancho = 80; 
            largo = 30; 
            peso = 40; 
            valor = 600000; // Medidas de la unidad exterior
            altoInterior = 30; anchoInterior = 73; largoInterior = 19;
            break;
        case "split3300":
            alto = 58; 
            ancho =82; 
            largo = 30; 
            peso = 50; 
            valor = 700000; // Medidas de la unidad exterior
            altoInterior = 32; anchoInterior = 101; largoInterior = 22;
            break;
        case "split4500":
            alto = 30; 
            ancho = 85; 
            largo = 61; 
            peso = 60; 
            valor = 800000; // Medidas de la unidad exterior
            altoInterior = 35; anchoInterior = 102; largoInterior = 23;
            break;
        case "split5500":
            alto = 36; 
            ancho = 90; 
            largo = 38; 
            peso = 80; 
            valor = 900000; // Medidas de la unidad exterior
            altoInterior = 38; anchoInterior = 109; largoInterior = 34;
            break;
        case "split6000":
            alto = 110; 
            ancho = 101; 
            largo = 43; 
            peso = 99; 
            valor = 1100000; // Medidas de la unidad exterior
            altoInterior = 40; anchoInterior = 110; largoInterior = 38;
            break;
        case "splitPisoTecho18000":
            alto = 139; 
            ancho = 95; 
            largo = 40; 
            peso = 135; 
            valor = 1500000; // Medidas de la unidad exterior
            altoInterior = 158; anchoInterior = 68; largoInterior = 35;
            break;
        case "heladera":
            alto = 165; 
            ancho = 60; 
            largo = 60; 
            peso = 60; 
            valor = 700000;
            break;
        case "heladera_bajo_mesada":
            alto = 85; 
            ancho = 60; 
            largo = 60; 
            peso = 50; 
            valor = 600000;
            break;
        case "cocina":
            alto = 85; 
            ancho = 60; 
            largo = 60; 
            peso = 50; 
            valor = 600000;
            break;
        case "freezer_pequeño":
            alto = 90; 
            ancho = 89; 
            largo = 65; 
            peso = 40;
            valor = 300000;
            break;
        case "freezer_medio":
            alto = 84; 
            ancho = 113; 
            largo = 62; 
            peso = 54; 
            valor = 450000;
            break;
        case "freezer_grande":
            alto = 86; 
            ancho = 164; 
            largo = 70; 
            peso = 60; 
            valor = 600000;
            break;
        case "hornoEmpotrable":
            alto = 60; 
            ancho = 60; 
            largo = 55; 
            peso = 25; 
            valor = 500000;
            break;
        case "lavavajillas":
            alto = 85; 
            ancho = 60; 
            largo = 60; 
            peso = 45; 
            valor = 600000;
            break;
        case "aireportatil":
            alto = 75; 
            ancho = 40; 
            largo = 40; 
            peso = 25; 
            valor = 150000;
            break;
        case "ventiladordepared":
            alto = 55; 
            ancho = 50; 
            largo = 20; 
            peso = 4; 
            valor = 90000;
            break;
        case "colchon80cm":
            alto = 20; 
            ancho = 80; 
            largo = 180; 
            peso = 15; 
            valor = 200000;
            break;
        case "colchon100cm":
            alto = 20; 
            ancho = 100; 
            largo = 180; 
            peso = 18; 
            valor = 250000;
            break;
        case "colchon140cm":
            alto = 20; 
            ancho = 140; 
            largo = 180; 
            peso = 25; 
            valor = 350000;
            break;
        case "colchon160cm":
            alto = 20; 
            ancho = 160; 
            largo = 180; 
            peso = 30; 
            valor = 400000;
            break;
        case "colchon200cm":
            alto = 20; 
            ancho = 200; 
            largo = 200; 
            peso = 35; 
            valor = 500000;
            break;                        
        case "lavarropasCargaFrontal":
            alto = 85; 
            ancho = 60; 
            largo = 60; 
            peso = 70; 
            valor = 800000;
            break;
        case "lavarropasCargaSuperior":
            alto = 100; 
            ancho = 60; 
            largo = 60; 
            peso = 65; 
            valor = 600000;
            break;
        case "termotanque50":
            alto = 60; 
            ancho = 40; 
            largo = 40; 
            peso = 20; 
            valor = 250000;
            break;
        case "termotanque80":
            alto = 80; 
            ancho = 40; 
            largo = 40; 
            peso = 25; 
            valor = 250000;
            break;
        case "termotanque110":
            alto = 100; 
            ancho = 40; 
            largo = 40; 
            peso = 30; 
            valor = 250000;
            break;
        case "termotanque150":
            alto = 150; 
            ancho = 40; 
            largo = 40; 
            peso = 35; 
            valor = 250000;
            break;
        case "termotanque180":
            alto = 180; 
            ancho = 50; 
            largo = 50; 
            peso = 40; 
            valor = 300000;
            break;
        case "smartTV32":
            alto = 45; 
            ancho = 73; 
            largo = 20; 
            peso = 6; 
            valor = 250000;
            break;
        case "smartTV40":
            alto = 55; 
            ancho = 91; 
            largo = 25; 
            peso = 8; 
            valor = 350000;
            break;
        case "smartTV43":
            alto = 58; 
            ancho = 97; 
            largo = 25; 
            peso = 9; 
            valor = 400000;
            break;
        case "smartTV50":
            alto = 65; 
            ancho = 112; 
            largo = 28; 
            peso = 11; 
            valor = 550000;
            break;
        case "smartTV58":
            alto = 73; 
            ancho = 130; 
            largo = 32; 
            peso = 14; 
            valor = 600000;
            break;
        case "smartTV65":
            alto = 81; 
            ancho = 145; 
            largo = 35; 
            peso = 17; 
            valor = 750000;
            break;
        case "smartTV70":
            alto = 90; 
            ancho = 157; 
            largo = 38; 
            peso = 20; 
            valor = 850000;
            break;
        case "calefactor2000":
            alto = 60; 
            ancho = 70; 
            largo = 30; 
            peso = 15; 
            valor = 150000;
            break;
        case "calefactor3000":
            alto = 70; 
            ancho = 80; 
            largo = 30; 
            peso = 18; 
            valor = 250000;
            break;
        case "calefactor5000":
            alto = 80; 
            ancho = 100; 
            largo = 30; 
            peso = 22; 
            valor = 350000;
            break;
        case "calefactor8000":
            alto = 90; 
            ancho = 100; 
            largo = 30; 
            peso = 25; 
            valor = 450000;
            break;
        case "bultoOca":
            alto = 20; 
            ancho = 20; 
            largo = 20; 
            peso = 1; 
            valor = 10000;
            break;
        case "bulto20":
            alto = 20; 
            ancho = 20; 
            largo = 20; 
            peso = 1; 
            valor = 10000;
            break;
        case "bulto30":
            alto = 30; 
            ancho = 30; 
            largo = 30; 
            peso = 2; 
            valor = 20000;
            break;
        case "bulto40":
            alto = 40; 
            ancho = 40; 
            largo = 40; 
            peso = 3; 
            valor = 30000;
            break;
        case "termotanque255":
            alto = 158; 
            ancho = 67; 
            largo = 67; 
            peso = 81; 
            valor = 1474499;
            break;
        case "termotanque300":
            alto = 189; 
            ancho = 66; 
            largo = 66; 
            peso = 132; 
            valor = 3274999;
            break;
        case "bulto50":
            alto = 50; 
            ancho = 50; 
            largo = 50; 
            peso = 4; 
            valor = 40000;
            break;
        default:
            return; // Si no hay selección válida, salir
    }

// Calcular el volumen en cm³ y m³
const volumenCm3 = alto * ancho * largo; // Volumen en cm³
const volumenM3 = (volumenCm3 / 1000000).toFixed(2); // Volumen en m³, con dos decimales

// Crear el div con las medidas en cm³ y m³ como una card
const medidasTextoDiv = document.createElement('div');
medidasTextoDiv.className = 'medidas-texto'; // Clase añadida para facilitar el acceso

// Insertar el contenido HTML y usar las variables volumenCm3 y volumenM3
medidasTextoDiv.innerHTML = `
    <div class="card-body-medidas">
        <h5 class="card-title"><i class="bi bi-rulers"></i> Medidas</h5>
        <div class="row">
            <div class="col-6 text-center">
                <i class="bi bi-box"></i> <strong id="medidas-cm3-${id}">${volumenCm3} cm³</strong>
            </div>
            <div class="col-6 text-center">
                <i class="bi bi-arrows-fullscreen"></i> <strong id="medidas-m3-${id}">${volumenM3} m³</strong>
            </div>
        </div>
    </div>
`;

// Agregar el nuevo div al contenedor de medidas
medidasDiv.appendChild(medidasTextoDiv);

    // Crear el div con los inputs para las medidas exteriores
    const bultoDiv = document.createElement('div');
    bultoDiv.className = 'bultoImput mb-3'; // Añadido margen inferior

    const CantidadReal = document.getElementById(`strong-costo2-${id}`).textContent || "1";
    const valorSinU = parseInt(CantidadReal.replace(" U.", "").trim()) || 1; 

    bultoDiv.innerHTML = `
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-expand"></i></span>
            <input type="number" id="alto-${id}" name="Alto" class="form-control-medidas" step="1" value="${alto}" required>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-expand-vertical"></i></span>
            <input type="number" id="ancho-${id}" name="Ancho" class="form-control-medidas" step="1" value="${ancho}" required>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-angle-expand"></i></span>
            <input type="number" id="largo-${id}" name="Largo" class="form-control-medidas" step="1" value="${largo}" required>
        </div>
        <div class="input-group mb-2" style="display: none;">
            <span class="input-group-text"><i class="bi bi-box-seam"></i></span>
            <input type="number" id="peso-${id}" name="peso" class="form-control-medidas" step="1" value="${peso}" min="1" required>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-plus-circle"></i></span>
            <input type="number" id="cantidad-${id}" name="Cantidad" class="form-control-medidas" step="1" value="${valorSinU}" min="1" required>
        </div>
    `;

    medidasDiv.appendChild(bultoDiv);

    // Actualizar medidas automáticamente al cambiar la cantidad
    const cantidadInput = bultoDiv.querySelector(`#cantidad-${id}`);
    cantidadInput.addEventListener('input', () => {
        const cantidad = parseInt(cantidadInput.value) || 1; // Obtener la cantidad, por defecto 1
        const volumenCm3 = alto * ancho * largo * cantidad;
        const volumenM3 = volumenCm3 / 1000000;

        // Actualizar los textos de medidas
        document.getElementById(`medidas-cm3-${id}`).textContent = `${volumenCm3} cm³`;
        document.getElementById(`medidas-m3-${id}`).textContent = `${volumenM3.toFixed(2)} m³`;
    });

    // Función para actualizar el volumen
    function actualizarVolumen() {
    const alto = parseFloat(document.getElementById(`alto-${id}`).value) || 0;
    const ancho = parseFloat(document.getElementById(`ancho-${id}`).value) || 0;
    const largo = parseFloat(document.getElementById(`largo-${id}`).value) || 0;
    const cantidad = parseInt(document.getElementById(`cantidad-${id}`).value) || 1;

    const volumenCm3 = alto * ancho * largo * cantidad; // Volumen en cm³
    const volumenM3 = (volumenCm3 / 1000000).toFixed(2); // Volumen en m³

    document.getElementById(`medidas-cm3-${id}`).textContent = `${volumenCm3} cm³`;
    document.getElementById(`medidas-m3-${id}`).textContent = `${volumenM3} m³`;
}

    // Agregar event listeners a los inputs de alto, ancho, largo y cantidad
    document.getElementById(`alto-${id}`).addEventListener('input', actualizarVolumen);
    document.getElementById(`ancho-${id}`).addEventListener('input', actualizarVolumen);
    document.getElementById(`largo-${id}`).addEventListener('input', actualizarVolumen);
    document.getElementById(`cantidad-${id}`).addEventListener('input', actualizarVolumen);

    // Crear el div con los inputs para las medidas interiores, si aplica
    if (selectedValue.startsWith("split")) {
        const interiorLabel = document.createElement('p');
        interiorLabel.innerHTML = '<i class="bi bi-fan"></i> Unidad Interior';
        interiorLabel.className = "card-title"; // Clase añadida
        medidasDiv.appendChild(interiorLabel);

        const bultoInteriorDiv = document.createElement('div');
        bultoInteriorDiv.className = 'bultoImput mb-3'; // Añadido margen inferior

        bultoInteriorDiv.innerHTML = `
            <div class="d-flex mb-2">
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-expand"></i></span>
                    <input type="number" id="altoInterior-${id}" name="AltoInterior" class="form-control-medidas" step="1" value="${altoInterior}" required>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-expand-vertical"></i></span>
                    <input type="number" id="anchoInterior-${id}" name="AnchoInterior" class="form-control-medidas" step="1" value="${anchoInterior}" required>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-angle-expand"></i></span>
                    <input type="number" id="largoInterior-${id}" name="LargoInterior" class="form-control-medidas" step="1" value="${largoInterior}" required>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-plus-circle"></i></span>
                    <input type="number" id="cantidadInterior-${id}" name="CantidadInterior" class="form-control-medidas" step="1" value="${valorSinU}" min="1" required disabled>
                </div>
            </div>
        `;
        medidasDiv.appendChild(bultoInteriorDiv);

        // Vincular la cantidad del interior con la cantidad del exterior
        const cantidadInteriorInput = bultoInteriorDiv.querySelector(`#cantidadInterior-${id}`);

        cantidadInput.addEventListener('input', () => {
            cantidadInteriorInput.value = cantidadInput.value;
        });

        cantidadInteriorInput.addEventListener('input', () => {
            cantidadInput.value = cantidadInteriorInput.value;
        });

    }
}

// INICIO PAGINATION

function updatePagination(totalItems) {
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

    if (endPage < totalPages) {
        const loadMoreItem = document.createElement("li");
        loadMoreItem.className = "page-item";
        loadMoreItem.innerHTML = `<a class="page-link" href="#">Más</a>`;
        loadMoreItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPageGroup += 6;
            updatePagination(totalItems);
            renderCards(allData);
        });
        paginationContainer.appendChild(loadMoreItem);
    }

    if (currentPageGroup > 0) {
        const backItem = document.createElement("li");
        backItem.className = "page-item";
        backItem.innerHTML = `<a class="page-link" href="#">Atrás</a>`;
        backItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPageGroup -= 6;
            updatePagination(totalItems);
            renderCards(allData);
        });
        paginationContainer.appendChild(backItem);
    }
}
// FIN PAGINATION

// INICIO SWITCHS BOTÓNES
// Variables para la nueva paginación
let filteredData = [];
let currentFilteredPage = 1; // Página actual
const itemsPerPageFiltered = 30; // Número de elementos por página
const filteredPaginationContainer = document.getElementById('filtered-pagination'); // Contenedor de paginación

// Función para filtrar duplicados
function filterDuplicates(data) {
    const uniqueOrders = new Set();
    return data.filter(item => {
        const order = item.orden_publica;
        if (order && !uniqueOrders.has(order)) {
            uniqueOrders.add(order);
            return true;
        }
        return false;
    });
}

// Función para renderizar la nueva paginación
function renderFilteredPagination(data) {
    const totalPages = Math.ceil(data.length / itemsPerPageFiltered);
    const maxVisiblePages = 5; // Máximo de páginas visibles

    // Limpiar el contenedor de paginación
    filteredPaginationContainer.innerHTML = '';

    // Botón de Atrás
    const backButton = createButton('Atrás', currentFilteredPage === 1);
    backButton.addEventListener('click', () => {
        if (currentFilteredPage > 1) {
            currentFilteredPage--;
            updateFilteredCards(data);
        }
    });
    filteredPaginationContainer.appendChild(backButton);

    // Calcular el rango de páginas a mostrar
    let startPage = Math.max(1, currentFilteredPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar el rango si está cerca del final
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botones de número de página
    for (let i = 1; i <= maxVisiblePages; i++) {
        const pageNumber = startPage + i - 1;
        const buttonText = pageNumber <= totalPages ? pageNumber : 'X';
        const isActive = pageNumber === currentFilteredPage; // Verificar si es la página actual
        const button = createButton(buttonText, pageNumber > totalPages, isActive);
        button.addEventListener('click', () => {
            if (pageNumber <= totalPages) {
                currentFilteredPage = pageNumber;
                updateFilteredCards(data);
            }
        });
        filteredPaginationContainer.appendChild(button);
    }

    // Botón de Adelante
    let forwardText;
    if (totalPages === 0) {
        forwardText = 'Sin Páginas';
    } else if (totalPages - currentFilteredPage === 1) {
        forwardText = 'Adelante 1 página';
    } else {
        forwardText = `Adelante ${totalPages - currentFilteredPage} páginas`;
    }

    const forwardButton = createButton(forwardText, currentFilteredPage === totalPages || totalPages === 0);
    forwardButton.addEventListener('click', () => {
        if (currentFilteredPage < totalPages) {
            currentFilteredPage++;
            updateFilteredCards(data);
        }
    });
    filteredPaginationContainer.appendChild(forwardButton);

    // Centrar el contenido
    filteredPaginationContainer.style.textAlign = 'center'; // Centrar
}

function createButton(text, isDisabled, isActive = false) {
    const button = document.createElement('button');
    button.innerText = text;
    button.disabled = isDisabled; // Deshabilitar si es necesario
    button.className = 'pagination-button'; // Clase CSS para estilos

    // Agregar clase si es la página activa
    if (isActive) {
        button.classList.add('active-page');
    }

    return button;
}

// Función para actualizar las tarjetas en la nueva paginación
function updateFilteredCards(data) {
    const uniqueData = filterDuplicates(data); // Filtrar duplicados
    const start = (currentFilteredPage - 1) * itemsPerPageFiltered;
    const end = currentFilteredPage * itemsPerPageFiltered;

    if (uniqueData.length === 0) {
        showNoDataMessage(); // Mostrar mensaje si no hay datos
        filteredPaginationContainer.style.display = 'none';
    } else {
        renderCards(uniqueData.slice(start, end));
        renderFilteredPagination(uniqueData); // Volver a renderizar la paginación
    }
}

// Modificación del evento click del botón switch para entregados
document.getElementById('btnSwitch').addEventListener('click', () => {

    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);

    databaseRef.on('value', snapshot => {
        loadEnviosFromFirebase(); 
    });

    filteredData = allData
        .filter(item => item.marcaEntregado === 'No' || item.marcaEntregado === '' || item.marcaEntregado === undefined)
        .reverse(); // Filtrar y revertir el orden

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación original
    paginationContainer.classList.add('hidden');
    filteredPaginationContainer.classList.remove('hidden'); // Mostrar nueva paginación

    // Renderizar solo las tarjetas sin entregar
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.classList.add('hidden'); // Mostrar la paginación original
        filteredPaginationContainer.classList.remove('hidden'); // Ocultar nueva paginación
    });
});

// Modificación del evento click del botón switch para preparados
document.getElementById('btnSwitch1').addEventListener('click', () => {

    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);

    databaseRef.on('value', snapshot => {
        loadEnviosFromFirebase(); 
    });

    filteredData = allData
        .filter(item => item.marcaPreparado === 'No' || item.marcaPreparado === '' || item.marcaPreparado === undefined)
        .reverse(); // Filtrar y revertir el orden

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación original
    paginationContainer.classList.add('hidden');
    filteredPaginationContainer.classList.remove('hidden'); // Mostrar nueva paginación

    // Renderizar solo las tarjetas no preparadas
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.classList.add('hidden'); // Mostrar la paginación original
        filteredPaginationContainer.classList.remove('hidden'); // Ocultar nueva paginación
    });
});

// Modificación del evento click del botón Slack
document.getElementById('btnSlack').addEventListener('click', () => {
    filteredData = allData
        .filter(item => item.errorSlack === true) // Filtrar solo los que tienen errorSlack como true
        .reverse(); // Revertir el orden

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación original
    paginationContainer.classList.add('hidden');
    filteredPaginationContainer.classList.remove('hidden'); // Mostrar nueva paginación

    // Renderizar solo las tarjetas con errorSlack
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.classList.remove('hidden'); // Mostrar la paginación original
        filteredPaginationContainer.classList.add('hidden'); // Ocultar nueva paginación
    });

    // Actualizar contador de errorSlack
    document.getElementById('contadorCards4').innerText = filteredData.length > 0 
        ? filteredData.length 
        : '0'; // Mostrar el número de elementos con errorSlack
});

// Sin Preparar Botón
document.getElementById('btnPreparar').addEventListener('click', () => {
    filteredData = allData.filter(item => 
        !item.tipoElectrodomesticoBna && item.datoFacturacion
    ).reverse();

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación original
    paginationContainer.classList.add('hidden');
    filteredPaginationContainer.classList.remove('hidden'); // Mostrar nueva paginación

    // Renderizar solo las tarjetas sin preparar
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.classList.remove('hidden'); // Mostrar la paginación original
        filteredPaginationContainer.classList.add('hidden'); // Ocultar nueva paginación
    });
});

// Sin Facturar Botón
document.getElementById('btnFacturar').addEventListener('click', () => {
    filteredData = allData.filter(item => !item.datoFacturacion).reverse(); // Invertir el orden de los elementos filtrados
    
    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';
    
    // Ocultar la paginación original
    paginationContainer.classList.add('hidden');
    filteredPaginationContainer.classList.remove('hidden'); // Mostrar nueva paginación

    // Renderizar solo las tarjetas sin facturar
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.classList.remove('hidden'); // Mostrar la paginación original
        filteredPaginationContainer.classList.add('hidden'); // Ocultar nueva paginación
    });
});



// Duplicados Botón
document.getElementById('duplicateButton').addEventListener('click', () => {
    renderDuplicatedOrders();
});

// Función para verificar y renderizar duplicados en 'orden_publica'
function renderDuplicatedOrders() {
    let orderCount = {};
    let duplicatedOrders = [];

    // Contar cada 'orden_publica'
    allData.forEach(item => {
        const order = item.orden_publica;
        if (order) {
            if (orderCount[order]) {
                orderCount[order]++;
                if (orderCount[order] === 2) {
                    duplicatedOrders.push(order); // Guardar el orden duplicado solo una vez
                }
            } else {
                orderCount[order] = 1;
            }
        }
    });

    // Filtrar los datos duplicados
    const duplicatedData = allData.filter(item => duplicatedOrders.includes(item.orden_publica));

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación original
    paginationContainer.classList.add('hidden');
    filteredPaginationContainer.classList.add('hidden');

    // Renderizar solo las tarjetas duplicadas
    renderCards(duplicatedData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.style.display = 'block'; // Mostrar la paginación original
        filteredPaginationContainer.style.display = 'none'; // Ocultar nueva paginación
    });
}
// FIN SWITCHS BOTÓNES

function showNoDataMessage() {
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = `
        <div class="no-data-message" style="text-align: center;">
            <i class="fas fa-coffee" style="font-size: 30px;"></i>
            <p style="font-size: 20px;">Parece que no hay nada por ahora</p>
            <p style="font-size: 20px;"><strong>¡tómate un cafecito!</strong></p>
        </div>
    `;
}

// VOLVER ATRAS
function createBackButton() {
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off(); // Desactiva la escucha

    // Verificar si ya existe el botón de volver
    if (document.getElementById('btnVolver')) return;

    const backButton = document.createElement('button');
    backButton.id = 'btnVolver';
    backButton.type = 'button';
    backButton.className = 'btn btn-dark';
    backButton.innerHTML = '<i class="bi bi-arrow-return-left"></i>';

    // Agregar evento al botón de volver
    backButton.addEventListener('click', () => {
        databaseRef.once('value').then(snapshot => {
            loadEnviosFromFirebase(snapshot);
            // Eliminar el botón después de cargar los datos
            backButton.remove(); 
            paginationContainer.classList.remove('hidden');
            filteredPaginationContainer.classList.add('hidden');
        });
    });

    // Agregar el botón al principio del contenedor de botones
    const container = document.querySelector('.trio-de-botones');
    container.insertBefore(backButton, container.firstChild);
}
// FIN VOLVER ATRAS

// BUSCADOR
const searchButton = document.querySelector('.btn-search-bna');
let manualSearch = false; // Bandera para indicar si la búsqueda fue iniciada manualmente

searchInput.addEventListener("input", function() {
    manualSearch = false; // Resetear la bandera en cada input
    realizarBusqueda();
});

searchInput.addEventListener("click", function() {
    searchInput.value = ''; 
    realizarBusqueda();
});

searchButton.addEventListener("click", function() {
    manualSearch = true; // Establecer la bandera cuando se hace clic en el botón
    realizarBusqueda();
});

function realizarBusqueda() {
    const searchTerm = searchInput.value.toLowerCase();
    
    // Verificar si el término de búsqueda es numérico y tiene al menos 7 caracteres
    const isNumeric = /^\d+$/.test(searchTerm);
    const isText = /^[a-zA-Z]+$/.test(searchTerm);
    
    if (!manualSearch && ((isNumeric && searchTerm.length < 7) || (isText && searchTerm.length < 5))) {
        return; // No realizar la búsqueda si no se cumplen las condiciones y no es una búsqueda manual
    }
    
    // Restablecer la paginación a la primera página
    currentPage = 1;
    currentPageGroup = 0;  // También restablecemos el grupo de páginas
    
    // Filtrar los datos
    const filteredData = allData.filter(item => {
        return Object.values(item).some(value => 
            value !== undefined && value !== null && value.toString().toLowerCase().includes(searchTerm)
        );
    });
    
    // Si no se encuentra ningún resultado, mostrar una imagen de error
    if (filteredData.length === 0) {
        document.getElementById("meli-cards").innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center text-center w-100">
                <p class="errorp">No se encontraron resultados para "${searchTerm}"</p>
                <img src="./Img/error.gif" alt="No se encontraron resultados" class="error img-fluid mb-3">
            </div>
        `;
    } else {
        // Renderizar las tarjetas y actualizar la paginación con los datos filtrados
        renderCards(filteredData);
        updatePagination(filteredData.length);
    }
}
// FIN BUSCADOR

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

// GENERAR ETIQUETA LOGISTICA PROPIA
async function generarPDF(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, precio_venta, producto_nombre, SKU) {
    let spinner2 = document.getElementById("spinner2");

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(1000);
    databaseRef.off();

        // Obtener los días predeterminados desde Firebase
        const diaPredeterminadoBsAs = await dbMeli.ref('DiaPredeterminadoBsAs').once('value').then(snapshot => snapshot.val());
        const diaPredeterminadoStaFe = await dbMeli.ref('DiaPredeterminadoStaFe').once('value').then(snapshot => snapshot.val());
        const diaPredeterminadoRafaela = await dbMeli.ref('DiaPredeterminadoRafaela').once('value').then(snapshot => snapshot.val());
        const diaPredeterminadoSanNicolas = await dbMeli.ref('DiaPredeterminadoSanNicolas').once('value').then(snapshot => snapshot.val());
    
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

        const cp2 = Number(cp);
    
        // Determinar la logística según el CP
        const logistica = logBsCps.includes(Number(cp2)) ? 'Buenos Aires' :
                          logStaFeCps.includes(Number(cp2)) ? 'Santa Fe' :
                          logRafaelaCps.includes(Number(cp2)) ? 'Rafaela' :
                          logSanNicolasCps.includes(Number(cp2)) ? 'San Nicolás' :
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
        if (cp2 === 2132 || cp2 === 2131 || cp2 === 2134) {
            // Si el CP es de Funes, Roldán o Pérez, calcular el próximo sábado
            const fechaProximoSabado = obtenerProximoSabado(new Date());
            diaFormateado = fechaProximoSabado.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
            console.log(`CP ${cp2} es de Funes, Roldán o Pérez. Próximo sábado: ${diaFormateado}`);
        } else if (logistica !== 'logística Propia') {
            const { fechaProximoDia, esManana, diasParaSumar } = obtenerProximoDia(new Date(), diaPredeterminado);
            console.log(`CP ${cp2} pertenece a la logística ${logistica}. Día predeterminado: ${diaPredeterminado}. Próximo día: ${fechaProximoDia}`);
    
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

    // Redondear el precio_venta y convertirlo a un entero
    const precioVentaRedondeado = Math.round(precio_venta);

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    if (!cliente) return; // Si se cancela, salir de la función

    // Solicitar el número de remito
    const numeroRemito = await solicitarNumeroRemito();
    if (!numeroRemito) return; // Si se cancela, salir de la función

    const { jsPDF } = window.jspdf;

    spinner2.style.display = "flex";
    let button = document.getElementById(`LogPropiaMeliButton${id}`);
    let resultado = document.getElementById(`resultado${id}`);

    // Crear un nuevo documento PDF en tamaño 10x15 cm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [15, 10],
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    // Eliminar el prefijo "200000" del idOperacion
    const idOperacionFinal = id.replace(/^20000[0-9]/, '') + "ME1"; // Asegúrate de que id es el correcto
    // Limitar el producto a 60 caracteres
    const productoLimitado = producto_nombre.length > 60 ? producto_nombre.substring(0, 60) + "..." : producto_nombre;

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


    // Determinar la imagen según el CP
    let logoSrc = './Img/Tiendas-Virtuales.png';
    if (logBsCps.includes(Number(cp2))) {
        logoSrc = './Img/Camion-BsAs-Novogar.png';
    } else if (logStaFeCps.includes(Number(cp2))) {
        logoSrc = './Img/Camion-Santa-fe-Novogar.png';
    } else if (logRafaelaCps.includes(Number(cp2))) {
        logoSrc = './Img/Camion-Rafaela-Novogar.png';
    } else if (logSanNicolasCps.includes(Number(cp2))) {
        logoSrc = './Img/Camion-SNicolas-Novogar.png';
    }

    reader.onloadend = async function() {
        const barcodeBase64 = reader.result

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
            </style>
        </head>
        <body>
        <div class="etiqueta">
            <div class="logo">
                    <img src="${logoSrc}" alt="Logo">
            </div>
            <div class="campo uppercase"><span>${cliente} ${nombre}</span></div>
            <div class="campo"><span>${cp}, ${localidad}, ${provincia}</span></div>
            <div class="campo uppercase"><span>${calle}</span></div>
            <div class="campo"><span>Teléfono: ${telefono}</span></div>
            <div class="campo"><span>${SKU}, ${productoLimitado}</span></div>
            <div class="campo"><span>DIA DE VENCIMIENTO: ${diaFormateado}</span></div>
            <div class="campo"><span>ORDEN DE TIENDA: ${remito}</span></div>
            <div class="campo-extra">
                <img src="${barcodeBase64}" alt="Código de Barras" />
            </div>
            <div class="contacto">
            <hr>
            <p><strong>💬 Posventa:</strong> (0341) 6680658 (WhatsApp)</p>
            </div>
        </div>
        </body>
        </html>`;

        // Crear un elemento temporal para renderizar el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contenido;
        document.body.appendChild(tempDiv);

        // Usar html2canvas para capturar el contenido
        const canvas = await html2canvas(tempDiv, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, 10, 15);
        const pdfBlob = doc.output('blob');

        // Pushear datos a Firebase
        const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
        const transportData = {
            transportCompany: "Logistica Propia",
            cliente: cliente,
            remito: numeroRemito,
            tipoElectrodomesticoBna: "bulto50",
        };

        const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);
        NroEnvio.innerHTML = `Logistica Propia`;
        
        try {
            await db.ref(`enviosBNA/${id}`).update(transportData);
            console.log("Datos actualizados en Firebase como Logistica Propia:", transportData);
        } catch (error) {
            console.error("Error al actualizar datos en Firebase:", error);
        }

        const envioState = document.getElementById(`estadoEnvio${id}`);
        envioState.className = 'em-circle-state4';
        envioState.innerHTML = `Preparado`;

                    // Agregar datos a "DespachosLogisticos"
                    const fechaHoraFormateada = formatearFechaHora(fechaHora); 
                    let subdato = null;
        
                    // Definir el subdato según el CP
                    if (logSanNicolasCps.includes(Number(cp2))) {
                        subdato = `Pendiente de confirmar en CAMION ${logistica} SANNICOLAS`;
                        operadorLogistico = `Logística Novogar SanNicolas`;
                        estado = `Se entrega el día ${diaFormateado}`;
                    } else if (logStaFeCps.includes(Number(cp2))) {
                        subdato = `Pendiente de confirmar en CAMION ${logistica} STAFE`;
                        operadorLogistico = `Logística Novogar StaFe`;
                        estado = `Se entrega el día ${diaFormateado}`;
                    } else if (logBsCps.includes(Number(cp2))) {
                        subdato = `Pendiente de confirmar en CAMION ${logistica} BSAS`;
                        operadorLogistico = `Logística Novogar BsAs`;
                        estado = `Se entrega el día ${diaFormateado}`;
                    } else if (logRafaelaCps.includes(Number(cp2))) {
                        subdato = `Pendiente de confirmar en CAMION ${logistica} RAFAELA`;
                        operadorLogistico = `Logística Novogar Rafaela`;
                        estado = `Se entrega el día ${diaFormateado}`;
                    } else {
                        subdato = `Camion Rosario`;
                        operadorLogistico = `Logística Novogar`;
                        estado = `(se entrega ${diaFormateado})`;
                    }
        
                    dbMeli.ref(`DespachosLogisticos/${numeroRemito}`).set({
                        cliente: cliente,
                        estado: estado,
                        fechaHora: fechaHoraFormateada,
                        remito: numeroRemito,
                        operadorLogistico: operadorLogistico,
                        remitoVBA: numeroRemito, 
                        subdato: subdato,
                        valorDeclarado: `$ ${precioVentaRedondeado.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` // Formatear como pesos argentinos
                    }).then(() => {
                        console.log(`Datos actualizados en DespachosLogisticos para el remito: ${numeroRemito}`);
                    }).catch(error => {
                        console.error('Error al actualizar en DespachosLogisticos:', error);
                    });        

        // Crear un enlace para abrir el PDF en una nueva ventana
        const pdfUrl = URL.createObjectURL(pdfBlob);

        setTimeout(() => {
            spinner2.style.display = "none";
            // Ocultar el spinner y restaurar el botón
            button.innerHTML = '<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta Novogar';
            button.disabled = false;
            window.open(pdfUrl, '_blank');
        }, 2000);

        document.body.removeChild(tempDiv);
    };

    await reader.readAsDataURL(blob); // Asegúrate de iniciar la lectura del blob

    const Name = `Confirmación de Compra Novogar`;
    const Subject = `Tu compra ${numeroRemito} ya fue preparada para despacho`;
    const template = "emailTemplateLogPropia";

    await sendEmail(Name, Subject, template, nombre, email, remito);
}
// FIN GENERAR ETIQUETA LOGISTICA PROPIA

// SLACK
const firebaseRefErrores = firebase.database().ref('erroresSlack');
const firebaseRefEnvios = firebase.database().ref('enviosBNA');

const sonidoToast = new Audio('./Img/error.mp3'); // Cambia la ruta por la de tu archivo

const firebaseRefMensajesProcesados = firebase.database().ref('mensajesProcesados'); // Referencia para mensajes procesados

async function verificarMensajes() {
    // Esperar 20 segundos antes de continuar
    await new Promise(resolve => setTimeout(resolve, 20000));

    console.log('Ejecutando búsqueda de errores en Slack...');
    try {
        const response = await fetch(`${corsh}https://slack.com/api/conversations.history?channel=${channel}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-cors-api-key': `${live}`
            }
        });

        const data = await response.json();

        if (data.ok) {
            let nuevosErrores = 0;
            const ordenesConErrores = [];

            for (const mensaje of data.messages) {
                const mensajeId = mensaje.ts.replace(/\./g, '_'); // Reemplazar puntos por guiones bajos

                // Verificar si el mensaje ya fue procesado
                const snapshotMensajeProcesado = await firebaseRefMensajesProcesados.child(mensajeId).once('value');
                if (snapshotMensajeProcesado.exists()) {
                    continue; // Si ya fue procesado, saltar al siguiente mensaje
                }

                // Verificar si el mensaje cumple con el formato esperado
                if (mensaje.user === `${chat}` && /^\(\d+(-reproceso-\d+|-carrito-\d+)?\)/.test(mensaje.text)) {
                    let numero;
                    const match = mensaje.text.match(/^\((\d+)(?:-(reproceso|carrito)-(\d+))?\)/);

                    if (match) {
                        numero = match[3] ? match[3] : match[1];
                    } else {
                        console.error('No se encontró un formato válido en el mensaje:', mensaje.text);
                        continue;
                    }

                    const errorMensaje = mensaje.text.replace(/^\(\d+(-reproceso-\d+|-carrito-\d+)?\)\s*/, '');
                    let nuevoNumero = numero;
                    let contador = 1;

                    while (true) {
                        const snapshotErrores = await firebaseRefErrores.child(nuevoNumero).once('value');
                        if (!snapshotErrores.exists()) {
                            await firebaseRefErrores.child(nuevoNumero).set({ errorMensaje });
                            nuevosErrores++;
                            ordenesConErrores.push(nuevoNumero);

                            // Mostrar el toast y reproducir sonido
                            setTimeout(() => {
                                mostrarToast(nuevoNumero, errorMensaje);
                                sonidoToast.currentTime = 0;
                                sonidoToast.play().catch(error => {
                                    console.error('Error al reproducir el sonido:', error);
                                });
                            }, 1000);

                            break;
                        } else {
                            contador++;
                            nuevoNumero = `${numero}-${match[2] || 'reproceso'}-${contador}`;
                        }
                    }

                    // Agregar el ID del mensaje a Firebase como procesado
                    await firebaseRefMensajesProcesados.child(mensajeId).set(true);

                    // Buscar en enviosBNA
                    const snapshotEnvios = await firebaseRefEnvios.once('value');
                    snapshotEnvios.forEach((envio) => {
                        if (envio.val().orden_ === numero) {
                            envio.ref.child('errorSlack').set(true);
                            envio.ref.child('errorSlackMensaje').set(errorMensaje);
                        }
                    });
                }
            }

            if (nuevosErrores > 0) {
                console.log(`Se han localizado ${nuevosErrores} nuevos errores de Slack que no existían en la base de datos.`);
                await enviarNotificacionSlack(ordenesConErrores, nuevosErrores);
            } else {
                console.log('No se encontraron nuevos errores.');
            }
        } else {
            console.error('Error al obtener mensajes:', data.error);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}

async function enviarNotificacionSlack(ordenes, totalErrores) {
    const mensaje = `
    🟡 *Errores en Facturación* 🟡 
    ${ordenes.join(', ')} 
    Total de errores: *${totalErrores}* 
    Notificado en *LogiPaq*.
    `;

    const payload = {
        text: mensaje,
        mrkdwn: true // Permitir formato de Markdown
    };

    try {
        await fetch(`${corsh}${HookMd}`, {
            method: 'POST',
            headers: {
                "x-cors-api-key": `${live}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        console.log('Notificación enviada a Slack.');
    } catch (error) {
        console.error('Error al enviar la notificación a Slack:', error);
    }
}

// Función para mostrar el toast
function mostrarToast(numero, errorMensaje) {
    const toastContainer = document.querySelector('.toast-container');

    const toastHTML = `
    <div class="toast toast-slack" role="alert" aria-live="assertive" aria-atomic="true" style="margin-bottom: 10px;">
        <div class="toast-header strong-slack-header">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1200px-Slack_icon_2019.svg.png" class="rounded me-2" alt="Slack Logo" style="width: 20px; height: 20px;">
            <strong class="me-auto">LogiPaq Control de Slack</strong>
            <small>${new Date().toLocaleTimeString()}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body strong-slack">
            <strong class=""> ERROR AL FACTURAR EN ORDEN ${numero}:</strong> ${errorMensaje}
        </div>
    </div>`;

    // Agregar el toast al contenedor
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    // Inicializar el toast y mostrarlo
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, { autohide: false }); // Asegúrate de que autohide sea false
    toast.show();
}

// Función para iniciar el contador y la verificación
function iniciarVerificacion() {
    verificarMensajes(); // Ejecutar inmediatamente

    // Contador de 5 minutos
    let contador = 5; // minutos
    const intervalo = setInterval(() => {
        console.log(`Próxima verificación en ${contador} minutos...`);
        contador--;

        if (contador < 0) {
            clearInterval(intervalo);
            verificarMensajes(); // Ejecutar nuevamente
            contador = 5; // Reiniciar contador
            iniciarVerificacion(); // Reiniciar el ciclo
        }
    }, 60000); // 60000 ms = 1 minuto
}
// FIN SLACK

// Guardar valores originales
const originalShippingCosts = {};
const originalTotals = {};

function toggleShippingDiscount(checkbox, id) {
    const shippingCostElement = document.getElementById(`monto_envio_${id}`);
    const totalCostElement = document.getElementById(`monto_total_${id}`);
    const mensajeElement = document.getElementById(`mensaje_${id}`);

    // Almacenar valores originales si no se han guardado
    if (!originalShippingCosts[id]) {
        originalShippingCosts[id] = parseFloat(shippingCostElement.value);
        originalTotals[id] = parseFloat(totalCostElement.value);
    }

    let currentTotal = parseFloat(totalCostElement.value); // Usar el valor actual del total

    if (checkbox.checked) {
        // Descontar costo de envío
        shippingCostElement.value = '0';
        currentTotal -= originalShippingCosts[id]; // Descontar solo una vez
        mensajeElement.innerText = `Se ha descontado $${originalShippingCosts[id].toFixed(2)} de envío.`;
        mensajeElement.style.display = 'block';
    } else {
        // Volver a agregar el costo de envío
        shippingCostElement.value = originalShippingCosts[id].toFixed(2);
        currentTotal += originalShippingCosts[id]; // Agregar de vuelta
        mensajeElement.innerText = '';
    }

    totalCostElement.value = currentTotal.toFixed(2);
}

// BUSQUEDA AVANZADA
const subOrderInput = document.getElementById('subOrderInput');
const spinnerBusqueda = document.getElementById('spinnerBusquedaAvanzada');

subOrderInput.addEventListener('input', async function () {
    const value = subOrderInput.value.trim();
    const validFormat = /^(\d+(-\d+)*)$|^(bpr-\d+(-\d+)+)$/i.test(value);

    if (!validFormat) return;

    // Mostrar el spinner antes de iniciar la búsqueda
    spinnerBusqueda.style.display = 'block';

    try {
        // Llamar a la función para cargar envíos desde Firebase
        await loadEnviosFromFirebaseAvanzado(value);
    } catch (error) {
        console.error('Error en la búsqueda avanzada:', error);
        Swal.fire('Error', 'Ocurrió un error al buscar la orden. Inténtalo de nuevo.', 'error');
    } finally {
        // Ocultar el spinner después de la búsqueda
        spinnerBusqueda.style.display = 'none';
    }
});

async function loadEnviosFromFirebaseAvanzado(subOrderValue) {
    const cardsContainer = document.getElementById('meli-cards');
    const spinner = document.getElementById('spinner');

    if (cardsContainer) {
        cardsContainer.innerHTML = '';
        
        // Eliminar mensajes de "no data" anteriores
        const existingNoDataMessages = document.querySelectorAll('.no-data-message');
        existingNoDataMessages.forEach(message => message.remove());
    }

    searchInput.disabled = true;
    searchInput.value = "Aguardando que cargue la web ⏳";

    if (spinner) {
        spinner.style.display = 'block';
    }

    try {
        // Cargar datos de IMEI
        const skuSnapshot = await firebase.database().ref('imei/').once('value');
        skusList = [];
        skuSnapshot.forEach(childSnapshot => {
            skusList.push(childSnapshot.val().sku);
        });

        // Cargar datos de stockPlaceIt
        const stockSnapshot = await firebase.database().ref('stockPlaceIt/').once('value');
        skusPlaceItList = [];
        stockSnapshot.forEach(childSnapshot => {
            skusPlaceItList.push(childSnapshot.val().sku);
        });

        // Buscar el envío específico basado en subOrderValue
        const snapshot = await firebase.database().ref('enviosBNA').once('value');
        const allData = [];

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            // Verificar si el envío coincide con el valor de búsqueda
            if ((data.orden_ && data.orden_.toString().includes(subOrderValue)) ||
                (data.orden_publica_ && data.orden_publica_.toString().includes(subOrderValue))) {
                allData.push({
                    id: childSnapshot.key,
                    altura: data.altura,
                    cancelado: data.cancelado,
                    nombreFacturacion: capitalizeWords(data.nombre) || capitalizeWords(data.Nombre),
                    apellidoFacturacion: capitalizeWords(data.apellido) || capitalizeWords(data.Apellido),
                    nombre: capitalizeWords(data.nombre_completo_envio),
                    cp: data.codigo_postal,
                    localidad: capitalizeWords(data.ciudad),
                    provincia: capitalizeWords(data.provincia),
                    calle: data.calle,
                    calle2: capitalizeWords(data.direccion ? data.direccion.replace(/"/g, '') : ''),
                    telefono: data.telefono,
                    telefono_facturacion: data.telefono_facturacion,
                    email: lowercaseWords(data.email),
                    remito: data.orden_,
                    carrito: data.carritoCompra2,
                    diaPlaceIt: data.diaPlaceIt,
                    observaciones: data.observaciones,
                    orden_publica_: data.orden_publica_,
                    brand_name: capitalizeWords(data.brand_name),
                    marca_de_tarjeta: capitalizeWords(data.marca_de_tarjeta),
                    cuotas: data.cuotas,
                    nro_de_cuotas: data.nro_de_cuotas,
                    envio: data.medio_de_envio,
                    cupon: data.cupon,
                    numeroSeguimiento: data.numero_de_seguimiento,
                    cotizacion: data.cotizacion,
                    trackingNumber: data.trackingNumber,
                    precio_venta: data.precio_venta,
                    cliente: data.cliente,
                    cod_aut: data.cod_aut,
                    total_con_tasas_2: data.total_con_tasas_2,
                    precio_producto: data.precio_producto,
                    suborden_total: data.suborden_total,
                    suborden_: data.suborden_,
                    numeros_tarjeta: data.numeros_tarjeta,
                    orden_publica: data.orden_publica_,
                    sku: data.sku_externo.toUpperCase(),
                    cantidad: data.cantidad,
                    errorSlack: data.errorSlack,
                    correccionSlack: data.correccionSlack,
                    errorSlackMensaje: data.errorSlackMensaje,
                    fechaDeCreacion: data.fecha_creacion_orden,
                    datoFacturacion: data.datoFacturacion,
                    producto_nombre: capitalizeWords(data.producto_nombre),
                    tipoElectrodomesticoBna: data.tipoElectrodomesticoBna,
                    trackingLink: data.trackingLink,
                    transportCompany: data.transportCompany,
                    transportCompanyNumber: data.transportCompanyNumber,
                    razon_social: capitalizeWords(data.razon_social),
                    cuit: data.cuit,
                    marcaEntregado: data.marcaEntregado,
                    marcaPreparado: data.marcaPreparado,
                    direccion: capitalizeWords(data.direccion.replace(/"/g, '').replace(/:\s*-?\s*/i, '')),
                    direccion_facturacion: capitalizeWords(data.direccion_facturacion ? data.direccion_facturacion.replace(/Dpto:\s*-?\s*/i, '') : ''),
                    ciudad_facturacion: capitalizeWords(data.ciudad_facturacion),
                    ciudad_factura: capitalizeWords(data.ciudad_factura),
                    dni: data.dni,
                    nombre_factura: capitalizeWords(data.nombre_factura),
                    estadoEnvio: data.estado_del_envio,
                    codigo_postal_facturacion: data.codigo_postal_facturacion,
                    codigo_postal_factura: data.codigo_postal_factura,
                    otros_comentarios_entrega: data.otros_comentarios_entrega,
                    iva: data.condicion_iva,
                    iva2: data.iva,
                    equivalencia_puntos_pesos: data.equivalencia_puntos_pesos || data['equivalencia_puntos_-_pesos'],
                    nombre_completo_envio: capitalizeWords(data.nombre_completo_envio),
                    monto_cobrado: data.monto_cobrado
                });
            }
        });

        // Verificar si no se encontraron datos
        if (allData.length === 0) {
            const paginationDiv = document.getElementById('pagination');
            if (paginationDiv) {
                paginationDiv.style.display = 'none'; // Oculta el div de paginación
            }

            const noDataMessage = document.createElement('div');
            noDataMessage.textContent = "🧐 No encuentro órdenes con los datos buscados. 📭";
            noDataMessage.className = 'no-data-message'; 
            noDataMessage.style.textAlign = 'center';
            noDataMessage.style.fontSize = '24px'; 
            noDataMessage.style.marginTop = '30px';
            noDataMessage.style.marginBottom = '30px'; 
            noDataMessage.style.padding = '30px'; 
            noDataMessage.style.borderRadius = '12px'; 
            noDataMessage.style.color = '#007aff'; 
            noDataMessage.style.fontWeight = 'bold';
            noDataMessage.style.transition = '0.3s';
            noDataMessage.style.cursor = 'default'; 
            noDataMessage.style.borderRadius = '15px'; 

            cardsContainer.appendChild(noDataMessage);
        } else {
            // Renderizar las tarjetas y la paginación
            allData.reverse();
            renderCards(allData);
            updatePagination(allData.length);
        }

        // Habilitar el buscador después de cargar los datos
        searchInput.disabled = false;
        searchInput.value = "";

        if (spinner) {
            spinner.remove(); // Ocultar spinner después de cargar los datos
        }
    } catch (error) {
        console.error("Error al cargar los envíos desde Firebase: ", error);
        if (spinner) {
            spinner.remove();
        }
    }
}
// FIN BUSQUEDA AVANZADA