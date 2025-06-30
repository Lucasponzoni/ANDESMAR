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
        HookVtex = data[23];
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

// CARGA SKU
// Función para cargar SKU desde Firebase
function cargarSKUs() {
    const skuListBody = document.getElementById('skuListBody');
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block'; // Mostrar spinner

    firebase.database().ref('imei/').once('value').then(snapshot => {
        skuListBody.innerHTML = ''; // Limpiar la tabla
        snapshot.forEach(childSnapshot => {
            const sku = childSnapshot.val().sku;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sku}</td>
                <td>
                    <button class="btn btn-danger" onclick="eliminarSKU('${childSnapshot.key}')">
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
document.getElementById('addSkuButton').addEventListener('click', () => {
    const newSku = document.getElementById('newSkuInput').value;
    const alertContainer = document.getElementById('alertContainer');

    if (newSku) {
        const newRef = firebase.database().ref('imei/' + newSku.replace(/\s+/g, '_'));
        
        // Verificar si el SKU ya existe
        newRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                // SKU ya existe
                mostrarAlerta('El SKU ya existe en el listado', 'danger');
            } else {
                // Agregar nuevo SKU
                newRef.set({ sku: newSku })
                    .then(() => {
                        console.log(`SKU agregado: ${newSku}`);
                        mostrarAlerta('Se ha agregado el SKU al listado', 'success');
                        cargarSKUs(); // Recargar la lista de SKU
                        document.getElementById('newSkuInput').value = ''; // Limpiar input
                    })
                    .catch(error => {
                        console.error("Error al agregar SKU: ", error);
                    });
            }
        });
    }
});

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.getElementById('alertContainer');
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
function eliminarSKU(key) {
    firebase.database().ref('imei/' + key).remove()
        .then(() => {
            console.log(`SKU eliminado: ${key}`);
            cargarSKUs(); // Recargar la lista de SKU
        })
        .catch(error => {
            console.error("Error al eliminar SKU: ", error);
        });
}

// Limpiar el input al abrir el modal
$('#skuModal').on('show.bs.modal', () => {
    document.getElementById('newSkuInput').value = ''; // Limpiar el input
    cargarSKUs(); // Cargar los SKU al abrir el modal
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

    // Mostrar spinner mientras se cargan los datos
    spinner.className = 'spinner-border text-primary';
    spinner.role = 'status';
    spinner.innerHTML = `<span class="sr-only">Cargando...</span>`;
    cardsContainer.appendChild(spinner);

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result.trim();
            const data = content.split(/\r?\n/).map(row => {
                // Usar expresión regular para dividir correctamente en comas
                return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => {
                    // Limpiar espacios y manejar celdas vacías
                    return cell.trim() === "" ? "" : cell.trim();
                });
            });

            const headers = data[0].map(header => sanitizeHeader(header));
            const dataRows = data.slice(1);
            let importedCount = 0;
            let existingCount = 0;
            let skippedCount = 0;
            let changedInfo = 0;
            const promises = [];

            let spinner2 = document.getElementById("spinner2");
            spinner2.style.display = "flex";

            dataRows.forEach(row => {
                if (row.length > 0) {
                    const envioData = {};
            
                    // Construir el objeto usando las cabeceras
                    headers.forEach((header, index) => {
                        envioData[header] = row[index] !== undefined ? sanitizeValue(row[index]) : ""; // Asignar cadena vacía si está vacío
                    });
            
                    const orden = envioData['orden_']; 
            
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
                                const existingKey = Object.keys(existingData)[0]; // Obtener la clave del primer registro encontrado
                    
                                // Comprobar si los valores son diferentes y actualizar si es necesario
                                const existingSeguimiento = existingData[existingKey].numero_de_seguimiento;
                                const existingMedioEnvio = existingData[existingKey].medio_de_envio;
                                const existingEstadoEnvio = existingData[existingKey].estado_del_envio;
                    
                                // Verificar y actualizar los campos si son diferentes
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
                    
                                // Actualizar en Firebase si hay cambios
                                if (needsUpdate) {
                                    // Actualizar marcaEntregado si estado_del_envio es "Entregado"
                                    if (envioData.estado_del_envio === "entregado") {
                                        updates.marcaEntregado = "Si";
                                    }
                    
                                    // Actualizar marcaPreparado si estado_del_envio no es "Sin despachar"
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
                    skippedCount++; // Incrementar si la fila está vacía
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
        };

        reader.readAsText(file);
    }
});

// Función para sanitizar cabeceras
function sanitizeHeader(header) {
    return header.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.#$\/\[\]]/g, ''); // Eliminar acentos y caracteres no permitidos
}

// Función para sanitizar valores
function sanitizeValue(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); // Eliminar acentos y convertir a minúsculas
}

function capitalizeWords(str) {
    if (!str) return ''; // Retornar cadena vacía si str es undefined o null
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function lowercaseWords(str) {
    return str ? str.toLowerCase() : ''; // Retornar cadena vacía si str es undefined o null
}

// CARGAR DATOS DE FIREBASE
function loadEnviosFromFirebase() {
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

            // Escuchar cambios en 'enviosBNA'
            const databaseRef = firebase.database().ref('enviosBNA').limitToLast(800);
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
                        sequence: data.sequence,
                        order: data.order,
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
    4168, 4178, 2000, 3500, 3100, 3400
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

        const precioVenta = parseFloat(data[i].precio_venta === "0.0" ? (data[i].precio_producto * data[i].cantidad) : data[i].precio_venta);
        const cantidad = parseFloat(data[i].cantidad);
        const montoCobrado = parseFloat(data[i].monto_cobrado);
        const equivalencia_puntos_pesos = parseFloat(data[i].equivalencia_puntos_pesos);

        const total = (precioVenta * cantidad) + montoCobrado - equivalencia_puntos_pesos;
        const puntosBna = (data[i].equivalencia_puntos_pesos);

        const shopCode = data[i].orden_publica_;
        const shopImage = getShopImage(shopCode);

        // Agregar la tarjeta al contenedor
        const carritoContenido = data[i].carrito ? `
        <p class="carrito">
        <i class="bi bi-cart-fill carrito-icon"></i>
        COMPRA EN CARRITO
        </p>` : '';       
        
// Agregar la tarjeta al contenedor
const descuentoContenido = data[i].equivalencia_puntos_pesos > 0 ? `
<p class="puntos">
<i class="bi bi-award-fill puntos-icon"></i>
COMPRA CON USO DE PUNTOS BNA
</p>` : '';

const palabras = data[i].nombre.trim().split(" ");
const ultima = palabras.pop();
const resto = palabras.join(" ");
const nombreFormateadoTV = `${resto} <span class="ultima-palabra">${ultima}</span>`;

// Verificar si el SKU está incluido en el listado
const isSkuIncluded = skusList.includes(data[i].sku);

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

    let remito;
    const ordenFull = data[i].orden_publica_.toLowerCase();

    if (ordenFull.startsWith('bpr')) {
        remito = data[i].sequence;
    } else {
        remito = data[i].remito;
    }
        
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
                                <input type="text" id="order_id_${data[i].id}" value="${data[i].carrito ? Math.floor(Math.random() * 900 + 100) + '-carrito-' : ''}${data[i].remito}" disabled>                            </div>
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
                                <input type="text" id="numero_tarjeta_visible_${data[i].id}" value="${data[i].numeros_tarjeta}" disabled>
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
                                <input type="text" id="tipo_entrega_${data[i].id}" value="${isMacro(storeCode) ? '41' : '33'}" disabled>
                            </div>

                            <div class="col">
                                <label for="deposito_${data[i].id}">Depósito:</label>
                                <input type="text" id="deposito_${data[i].id}" value="9" disabled>
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
                <input type="text" id="codigo_promocion_${data[i].id}" 
                    value="${isBaPro(storeCode) ? '5003' : (isMacro(storeCode) ? '5001' : '5000')}" 
                    disabled>
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
                <input type="text" id="precio_item_${data[i].id}" value="${data[i].precio_venta === "0.0" ? (data[i].precio_producto * data[i].cantidad) : data[i].precio_venta}" disabled>
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
                    <div class="card-header-facturacion-meli"><i class="bi bi-rocket-takeoff-fill"></i> Datos de Envio:</div>
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
                                ${(isAndreani || isAndesmar || isCDS || isLogPropia || data[i].envio === 'oca') ? 
                                    '<i class="bi bi-check-circle-fill margen-icon"></i> Preparado' : 
                                    '<i class="bi bi-stopwatch-fill margen-icon"></i> Pendiente'}
                            </div>

                            <button class="btn-delete-bna btn btn-outline-danger hidden" onclick="eliminarNodo('${data[i].id}')"><i class="bi bi-trash3-fill"></i></button>

                            <div class="em-state-bna">${shopImage}</div>
                            <h5 class="card-title">${nombreFormateadoTV}</h5>
                            <div class="d-flex align-items-center">
                            

                            <p class="card-text cpLocalidadBna mb-0 me-2">
                            ${data[i].cp}, ${data[i].localidad}, ${data[i].provincia}
                            </p>

                            
                            <p class="card-text correo-meli ${
                            isMacro(storeCode) ? 'correo-oca' :
                            cpsAndesmar.includes(Number(data[i].cp)) ? 'correo-andesmar' : 
                            cpsCDS.includes(Number(data[i].cp)) ? 'correo-cds' : 
                            'correo-andreani'
                            }">
                                ${
                            isMacro(storeCode) ? 
                            '<img src="Img/oca-tini.png" alt="OCA" width="20" height="20">' :
                            cpsAndesmar.includes(Number(data[i].cp)) ? 
                            '<img src="Img/andesmar-tini.png" alt="Andesmar" width="20" height="20">' : 
                            cpsCDS.includes(Number(data[i].cp)) ? 
                            '<img src="Img/Cruz-del-Sur-tini.png" alt="Cruz del Sur" width="20" height="20">' : 
                            '<img src="Img/andreani-tini.png" alt="Andreani" width="20" height="20">'
                            }
                            </p>

                            <button class="hidden btn btn-sm btn-" style="color: #007bff;" id="edit-localidad-${data[i].id}">
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

                            ${isSkuIncluded ? `<p class="card-text-isSkuIncluded"><i class="bi bi-lightning-charge-fill"></i> SKU ${data[i].sku} con imei</p>` : ''}

<div class="d-flex align-items-center justify-content-center contenedorRemito">
    <button class="btn btn-link btn-sm text-decoration-none copy-btn me-2 ios-icon3">
        <i class="bi bi-clipboard"></i>
    </button>

    <div class="contenedorPrompter">
    <p class="orden mx-2">${remito}</p>
    </div>

    <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2 ios-icon3 disabled" 
        onclick="window.open(getOrderUrl('${data[i].orden_publica_}'), '_blank');">
        <i class="bi bi-bag-check"></i>
    </button>

</div>

${data[i].order ? `
<div class="ordenBaPro d-flex justify-content-center align-items-center">
  <p class="mb-0 me-2">${data[i].order}</p>
  <i class="bi bi-clipboard" style="cursor: pointer;" 
     onclick="navigator.clipboard.writeText('${data[i].order}').then(() => {
       const icon = this;
       icon.classList.remove('bi-clipboard');
       icon.classList.add('bi-clipboard-fill');
       setTimeout(() => {
         icon.classList.remove('bi-clipboard-fill');
         icon.classList.add('bi-clipboard');
       }, 5000);
     });">
  </i>
</div>
` : `<p class="ordenBaPro hidden"></p>`}
    
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
                            <div class="d-flex contenedor-switches mt-1 justify-content-between disabled hidden">
                                
                                <div class="form-check form-switch switch-ios disabled"> 
                                    <input class="form-check-input input-interruptor" type="checkbox" id="preparacion-${data[i].id}" ${data[i].marcaPreparado === 'Si' || data[i].envio === 'oca' ? 'checked' : ''}>
                                    <label class="form-check-label etiqueta-interruptor" for="preparacion-${data[i].id}"><strong>1</strong> Preparación</label>
                                </div>

                                <div class="form-check form-switch switch-ios disabled"> 
                                    <input class="form-check-input input-interruptor" type="checkbox" id="entregado-${data[i].id}-1" ${data[i].marcaEntregado === 'Si' || data[i].estadoEnvio === 'entregado' ? 'checked' : ''}>
                                    <label class="form-check-label etiqueta-interruptor" for="entregado-${data[i].id}-1"><strong>2</strong> Entregado</label>
                                </div>
                            </div>
                            <!-- Fin contenedor para los switches -->

                            <div class="factura-status em-circle-state-time ${isParaFacturar ? 'facturable' : ''}" id="factura-status-${data[i].id}">
                                ${mensajeFactura}
                            </div>


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
                            <button class="btn-bna-collapse btn btn-outline-secondary btn-sm mt-2 w-100 mb-1 disabled" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetalleFacturacion-${data[i].id}" aria-expanded="false" aria-controls="collapseDetalleFacturacion-${data[i].id}">
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
                            <button class="btn-bna-collapse btn btn-outline-secondary btn-sm mt-2 w-100 mb-1 disabled" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetallePago-${data[i].id}" aria-expanded="false" aria-controls="collapseDetallePago-${data[i].id}">
                                <i class="bi bi-chevron-down"></i> Detalle de Pago <i class="bi bi-credit-card"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetallePago-${data[i].id}">
                                <div class="pago p-2 mt-2 mb-2"">
                                    <p class="card-text-pago"><strong>Entidad:</strong> ${(data[i].brand_name && data[i].brand_name !== '0') ? data[i].brand_name : data[i].marca_de_tarjeta || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Cuotas:</strong> ${(data[i].cuotas && data[i].cuotas !== '0') ? data[i].cuotas : data[i].nro_de_cuotas || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Número de Tarjeta:</strong> **** **** **** ${data[i].numeros_tarjeta}</p>
                                    

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
                            <strong class="strong-costo">$ ${data[i].precio_venta === "0.0" ? (data[i].precio_producto * data[i].cantidad) : data[i].precio_venta}</strong>
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].precio_venta === "0.0" ? (data[i].precio_producto * data[i].cantidad) : data[i].precio_venta}')">
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
                    
<select class="tipoElectrodomesticoBna hidden" 
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
        
                            <div class="medidas hidden"></div> <!-- Div para las medidas -->

                        <div class="conjuntoDeBotonesMeli" style="display: flex; flex-direction: column;">
                            
                            <div class="bg-Hr-primary">
                            <p><i class="bi bi-tags-fill"></i> Logistica PlaceIt</p>
                            </div>

                            <!-- Botón Logística PlaceIt --> 
                            <button class="btn mt-1 btnLogPropiaMeli ${isLogPlaceIt ? 'btn-success' : 'btn-danger'}"
                            id="LogPropiButtonPlaceIt${data[i].id}" 
                            ${data[i].cancelado ? 'disabled' : ''} 
                            onclick="generarPDFPlaceIt('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle2}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${cleanString(data[i].producto_nombre)}', '${data[i].sku}', '${data[i].cantidad}', '${ordenPublica}', '${isBaPro(storeCode)}', '${data[i].order}',)">
                            <span>
                            ${isLogPlaceIt ? `<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta PlaceIt` : `<img class="NovogarMeli" src="Img/novogar-tini.png" alt="Novogar"> Etiqueta 10x15 <strong>PlaceIt</strong>`}</span>
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerLogPropia${data[i].id}" style="display:none;"></span>
                            </button>

                        </div>

                        <div id="resultado${data[i].id}" class="mt-2 errorMeliBna" style="margin-bottom: ${data[i].diaPlaceIt || data[i].cancelado ? '15px' : '0'}; background-color: ${data[i].diaPlaceIt || data[i].cancelado ? '#d0ffd1' : 'transparent'};">
                            ${data[i].cancelado ? 
                                'Atención: Venta cancelada o con Botón de Arrepentimiento' : 
                                ''
                            }
                            ${data[i].diaPlaceIt ? 
                                `<div>${data[i].diaPlaceIt}</div>` : 
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
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);
    databaseRef.off();

    // Mostrar el cuadro de diálogo para la contraseña
    Swal.fire({
        title: 'Clave de Preparación 🔒',
        input: 'password',
        inputLabel: 'Contraseña de facturación (Solicítela a Mauri Villan)',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return '¡Necesitas ingresar una contraseña!';
            } else if (value !== '6572') {
                return 'Contraseña incorrecta.';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Verificar si el tipo de electrodoméstico ya existe
            firebase.database().ref('enviosBNA/' + data[i].id).once('value').then((snapshot) => {
                const tipoElectrodomesticoActual = snapshot.val().tipoElectrodomesticoBna;

                // Solo actualizar si el tipo de electrodoméstico no existe
                if (!tipoElectrodomesticoActual) {
                    firebase.database().ref('enviosBNA/' + data[i].id).update({
                        marcaPreparado: nuevoEstado,
                        tipoElectrodomesticoBna: "bulto50"
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
                    console.log('El tipo de electrodoméstico ya existe, ignorando la actualización.');
                }
            });
        } else {
            // Revertir el estado del switch si se cancela o la contraseña es incorrecta
            this.checked = !this.checked;
        }
    });
});

// Evento para manejar el cambio del switch "Entregado"
document.getElementById(`entregado-${data[i].id}-1`).addEventListener('change', function() {
    const nuevoEstado = this.checked ? 'Si' : 'No';

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);
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
        `localidad_${id}`,
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
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);
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

// ETIQUETA LOGISTICA PLACE IT
async function generarPDFPlaceIt(id, nombre, cp, localidad, provincia, remitoOrden, calle, numero, telefono, email, precio_venta, producto_nombre, SKU, cantidad, orden, isBapro, OrdenBapro) {
    
    console.log("Es Venta VTEX:", isBapro, "Orden Bapro:", OrdenBapro);

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
        nombre,
        cp,
        provincia,
        numeroRemito,
        cliente,
        calle,
        numero,
        telefono,
        email,
        precio_venta,
        producto_nombre,
        skuFormateado,
        cantidad,
        fechadeOrigen,
        fechadeEntrega
    );

    // Continuar con la generación del PDF
    const { jsPDF } = window.jspdf;

    spinner2.style.display = "flex";
    let button = document.getElementById(`LogPropiButtonPlaceIt${id}`);
    let resultado = document.getElementById(`resultado${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);

    // Crear un nuevo documento PDF en tamaño 10x15 cm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [15, 10],
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    const diaFormateadoPlaceIt = await obtenerFechas();

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

    reader.onloadend = async function() {
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
            </style>
        </head>
        <body>
        <div class="etiqueta">
            <div class="logo">
                <img src="./Img/Placeit-etiqueta.png" alt="Logo">
            </div>
                <div class="campo uppercase"><span>${cliente} ${nombre}</span></div>
                <div class="campo"><span>${cp}, ${localidad}, ${provincia}</span></div>
                <div class="campo uppercase"><span>${calle}</span></div>
                <div class="campo"><span>Teléfono: ${telefono}</span></div>
                <div class="campo"><span>X ${cantidad} Unidad. ${SKU}, ${productoLimitado}</span></div>
                <div class="campo"><span>Coordinar en Línea: ${telefono}<br>Email: ${email}</span></div>
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
        const canvas = await html2canvas(tempDiv, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, 10, 15);
        const pdfBlob = doc.output('blob');

        // Crear un enlace para abrir el PDF en una nueva ventana
        const pdfUrl = URL.createObjectURL(pdfBlob);
        spinner2.style.display = "none";
        button.innerHTML = '<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta PlaceIt';
        resultado.style.backgroundColor = "#d0ffd1";
        resultado.innerHTML = `<i class="bi bi-info-square-fill"></i> Plazo de entrega entre ${diaFormateadoPlaceIt}`;
        resultado.style.marginBottom = '15px';
        button.classList.remove('btn-danger');
        button.classList.add('btn-success');

        window.open(pdfUrl, '_blank');

        // Pushear datos a Firebase
        const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
        const transportData = {
            transportCompany: "Logistica PlaceIt",
            diaPlaceIt: diaFormateadoPlaceIt,
            cliente: cliente,
            remito: numeroRemito,
            tipoElectrodomesticoBna: "bulto50",
            marcaPreparado: "Si",
            marcaEntregado: "Si",
        };

        try {
            await db.ref(`enviosBNA/${id}`).update(transportData);
            console.log("Datos actualizados en Firebase como Logistica PlaceIt:", transportData);
        } catch (error) {
            console.error("Error al actualizar datos en Firebase:", error);
        }

        // Almacenar datos en la base de datos Meli
        const fechaHora = new Date().toLocaleString('es-ES', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        try {
            await dbMeli.ref(`DespachosLogisticos/${numeroRemito}`).set({
                cliente: cliente,
                estado: "Envio Express PlaceIt",
                fechaHora: fechaHora,
                operadorLogistico: "PlaceIt",
                remitoDigital: 0,
                remito: numeroRemito,
                numeroDeEnvio: 123456,
                remitoVBA: numeroRemito,
                subdato: diaFormateadoPlaceIt,
                valorDeclarado: formatPrice(precio_venta), // Usar la función aquí
                email: email,
                direccion: calle,
                comentarios: "Coordinar en Línea: " + telefono,
                telefono: telefono,
                sku: SKU,
                cantidad: cantidad,
                cp: cp,
                orden: remitoOrden,
                tienda: "TIENDAS VIRTUALES",
                localidad: localidad,
                nombre: nombre,
                provincia: provincia
            });
            console.log(`Datos actualizados en Firebase (Logistica) para la operación: ${remitoOrden}`);
        } catch (error) {
            console.error('Error al actualizar en Firebase:', error);
        }

        NroEnvio.innerHTML = `Logística PlaceIt`;
        document.body.removeChild(tempDiv);
    };

    reader.readAsDataURL(blob);

            // Notificar envio a VTEX
            if (isBapro) {
                // Buscar la carpeta que comienza con OrdenBapro
                const folderRef = dbVtex.ref(`facturasBaPro`);
                const snapshot = await folderRef.once('value');
                let folderKey = null;

                snapshot.forEach(childSnapshot => {
                    const key = childSnapshot.key;
                    if (key.startsWith(OrdenBapro)) {
                        folderKey = key;
                    }
                });

                const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

                if (folderKey) {
                    const trackingData = {
                        transportCompany: "Logistica PlaceIt",
                        trackingLink: "Logistica PlaceIt",
                        transportCompanyNumber: "Logistica PlaceIt",
                        fecha: fecha,
                        remito: numeroRemito,
                        cliente: cliente
                    };

                    // Establecer datos en la carpeta "tracking" sin crear un nuevo ID
                    dbVtex.ref(`facturasBaPro/${folderKey}/tracking`).set(trackingData);
                    console.log("Datos actualizados en la carpeta tracking de Firebase:", trackingData);

                    // Enviar mensaje a Slack
                    const separator = "* * * * * * * * * * * * * * * * * * * * * * * *";

                    let text = `${separator}\n`;
                    text += `:package: *Orden \`${OrdenBapro}\`*\n`;
                    text += `${separator}\n`;
                    text += `:bookmark_tabs: *Estado:* Logística Preparó el Envío\n`;
                    text += `:bust_in_silhouette: *Cliente:* ${cliente.toUpperCase()}\n`;
                    text += `:id: *Remito:* ${numeroRemito}\n`;
                    text += `:truck: *Transportista:* Logistica PlaceIt\n`;
                    text += `:package: *Número de guía:* Logistica PlaceIt\n`;
                    text += `:calendar: *Importada:* ${fecha}\n`;
                    text += `${separator}\n`;
                    text += `_"Lo cargué en Firebase y estoy aguardando la próxima llamada para notificarlo en VTEX"_ 📦\n`;
                    text += `${separator}`;

                    fetch(HookVtex, { 
                        method: 'POST',
                        headers: {
                            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text })
                    });
                    console.log("Mensaje enviado a Slack.");
                }
            }
            // Fin Notificar envio a VTEX

    // Enviar el email después de procesar el envío
    const Name = `Confirmación de Compra Novogar`;
    const Subject = `Tu compra con envio Express ${numeroRemito} ya fue preparada para despacho`;
    const template = "emailTemplatePlaceIt";
    const transporte = "Logistica PlaceIt";
    const numeroDeEnvio = diaFormateadoPlaceIt;
    const linkSeguimiento2 = cliente;
    const remito = numeroRemito;

    // Enviar el email
    await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);
}

function formatPrice(price) {
    const num = Number(price);
    if (isNaN(num)) return '$ 0,00'; // o podés lanzar un error, o mostrar algo como "N/D"
    return `$ ${num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

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

function rellenarMedidas(selectElement, id, isInitialLoad = false) {
    const selectedValue = selectElement.value;
    const card = selectElement.closest('.card'); // Obtener la tarjeta más cercana
    const medidasDiv = card.querySelector('.medidas'); // Div donde se agregarán las medidas

    // Limpiar el div de medidas antes de agregar nuevos campos
    medidasDiv.innerHTML = '';

    // Desactivar la escucha de cambios
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);
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

    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);

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
    paginationContainer.style.display = 'none';
    filteredPaginationContainer.style.display = 'block'; // Mostrar nueva paginación

    // Renderizar solo las tarjetas sin entregar
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.style.display = 'block'; // Mostrar la paginación original
        filteredPaginationContainer.style.display = 'none'; // Ocultar nueva paginación
    });
});

// Modificación del evento click del botón switch para preparados
document.getElementById('btnSwitch1').addEventListener('click', () => {

    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);

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
    paginationContainer.style.display = 'none';
    filteredPaginationContainer.style.display = 'block'; // Mostrar nueva paginación

    // Renderizar solo las tarjetas no preparadas
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.style.display = 'block'; // Mostrar la paginación original
        filteredPaginationContainer.style.display = 'none'; // Ocultar nueva paginación
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
    paginationContainer.style.display = 'none';
    filteredPaginationContainer.style.display = 'block'; // Mostrar nueva paginación

    // Renderizar solo las tarjetas con errorSlack
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.style.display = 'block'; // Mostrar la paginación original
        filteredPaginationContainer.style.display = 'none'; // Ocultar nueva paginación
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
    paginationContainer.style.display = 'none';
    filteredPaginationContainer.style.display = 'block'; // Mostrar nueva paginación

    // Renderizar solo las tarjetas sin preparar
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.style.display = 'block'; // Mostrar la paginación original
        filteredPaginationContainer.style.display = 'none'; // Ocultar nueva paginación
    });
});

// Sin Facturar Botón
document.getElementById('btnFacturar').addEventListener('click', () => {
    filteredData = allData.filter(item => !item.datoFacturacion).reverse(); // Invertir el orden de los elementos filtrados
    
    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('meli-cards');
    cardsContainer.innerHTML = '';
    
    // Ocultar la paginación original
    paginationContainer.style.display = 'none';
    filteredPaginationContainer.style.display = 'block'; // Mostrar nueva paginación

    // Renderizar solo las tarjetas sin facturar
    updateFilteredCards(filteredData);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData.slice(0, itemsPerPage)); // Regresar a todas las tarjetas
        paginationContainer.style.display = 'block'; // Mostrar la paginación original
        filteredPaginationContainer.style.display = 'none'; // Ocultar nueva paginación
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
    paginationContainer.style.display = 'none';
    filteredPaginationContainer.style.display = 'none';

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
    const databaseRef = firebase.database().ref('enviosBNA').limitToLast(300);
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
    
    if (!manualSearch && ((isNumeric && searchTerm.length < 6) || (isText && searchTerm.length < 5))) {
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

// SESION BRAINSYS
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
// SESION BRAINSYS  

// ENVIAR PEDIDO BRAINSYS  
async function enviarPedidoBrainsys(nombre, cp, provincia, numeroRemito, cliente, calle, numero, telefono, email, precio_venta, producto_nombre, sku, cantidad, fechadeOrigen, fechadeEntrega, observacionesMeli) {
    
    const sesion = localStorage.getItem('sesion');
    const depositoId = "001";
    const remitoTransformado = numeroRemito.slice(3).replace(/^0000/, '');

    const producto = {
        codigo: sku,
        companiaCodigo: "NOG",
        loteCodigo: "001", 
        vencimiento: "", 
        loteUnico: false,
        estadoCodigo: "DIS",
        cantidad: cantidad,
        entregaParcial: true
    };

    console.log(producto)

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
        nombre,
        "ARG",
        provincia,
        cp,
        calle,
        "001",
        "001",
        1,
        false,
        precio_venta,
        1,
        1,
        `U.${cantidad} - ${sku}`,
        `Remito: ${numeroRemito}`, 
        `Coordinar con línea ${telefono}, Producto: ${sku} ${producto_nombre}`,
        observacionesMeli,
        producto 
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
        nombre,
        "ARG",
        provincia,
        cp,
        calle,
        "001",
        "001",
        1,
        false,
        precio_venta,
        1,
        1,
        `U.${cantidad} - ${sku}`,
        `Remito: ${numeroRemito}`, 
        `Coordinar con línea ${telefono}, Producto: ${sku} ${producto_nombre}`,
        observacionesMeli,
        producto 
    );
}
// FIN ENVIAR PEDIDO BRAINSYS  

// Llamar a la función cuando se carga la página
window.onload = loadEnviosFromFirebase;
