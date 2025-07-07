// Inicializa Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCMu2vPvNzhv0cM3b4RItmqZybRhhR_HJM",
    authDomain: "despachos-meli-novogar.firebaseapp.com",
    databaseURL: "https://despachos-meli-novogar-default-rtdb.firebaseio.com",
    projectId: "despachos-meli-novogar",
    storageBucket: "despachos-meli-novogar.appspot.com",
    messagingSenderId: "774252628334",
    appId: "1:774252628334:web:623aa84bc3b1cebd3f997f",
    measurementId: "G-E0E9K4TEDW"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Obtener los SKUs de stockPlaceIt
const skusPlaceItList = []; // Array para almacenar los SKUs

function obtenerSkus() {
    window.dbMeli2.ref('stockPlaceIt/').once('value')
        .then(skuSnapshot => {
            let count = 0; // Contador para los SKUs
            skuSnapshot.forEach(childSnapshot => {
                const sku = childSnapshot.val().sku; // Obtiene el SKU del objeto
                if (sku) {
                    skusPlaceItList.push(sku); // Guarda el SKU en el array
                    count++; // Incrementa el contador si el SKU existe
                }
            });
            console.log("Se obtuvieron los SKU de PlaceIt con éxito. Cantidad:", count);
            console.log("SKUs almacenados:", skusPlaceItList); // Muestra los SKUs almacenados
        })
        .catch(error => {
            console.error("Error al obtener los datos: ", error);
        });
}

// Obtener los SKUs Forzados y Fecha
const skusForzadosyFecha = []; // Array para almacenar los SKUs y sus fechas

function obtenerSkusForzados() {
    db.ref('skuForzado/').once('value')
        .then(skuSnapshot => {
            let count = 0; // Contador para los SKUs
            skuSnapshot.forEach(childSnapshot => {
                const sku = childSnapshot.val().sku; // Obtiene el SKU del objeto
                const fecha = childSnapshot.val().fecha; // Obtiene la fecha del objeto

                if (sku) {
                    // Guarda el SKU y la fecha en el array
                    skusForzadosyFecha.push({ sku: sku, fecha: fecha });
                    count++; // Incrementa el contador si el SKU existe
                }
            });
            console.log("Se obtuvieron los SKU de PlaceIt con éxito. Cantidad:", count);
            console.log("SKUs y fechas almacenados:", skusForzadosyFecha); // Muestra los SKUs y fechas almacenados
        })
        .catch(error => {
            console.error("Error al obtener los datos: ", error);
        });
}

// Llama a la función para obtener los SKUs
obtenerSkus();
cargarPrecios();
obtenerSkusForzados()

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

// CARGA SKU PARA FORZAR STOCK
// Función para cargar SKU desde Firebase
function cargarSKUs(ref, listBodyId, loadingSpinnerId) {
    const skuListBody = document.getElementById(listBodyId);
    const loadingSpinner = document.getElementById(loadingSpinnerId);
    loadingSpinner.style.display = 'block';

    firebase.database().ref(ref).once('value').then(snapshot => {
        skuListBody.innerHTML = '';

        snapshot.forEach(childSnapshot => {
            const sku = childSnapshot.val().sku;
            const stock = childSnapshot.val().stock || 0;
            const fecha = childSnapshot.val().fecha || 'No establecida';

            let diasDesdeFecha = Infinity;

            if (fecha !== 'No establecida') {
                let soloFecha = fecha.split(',')[0].trim();  // Tomar solo la parte antes de la coma (día/mes/año)
                const partesFecha = soloFecha.split('/');

                if (partesFecha.length === 3) {
                    const dia = parseInt(partesFecha[0], 10);
                    const mes = parseInt(partesFecha[1], 10) - 1;
                    const anio = parseInt(partesFecha[2], 10);

                    const fechaGuardada = new Date(anio, mes, dia);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    fechaGuardada.setHours(0, 0, 0, 0);

                    const diferenciaMs = hoy - fechaGuardada;
                    diasDesdeFecha = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
                }
            }

            let badgeClass = 'badge bg-success';
            let badgeText = 'Activo';
            let buttonClass = 'btn btn-success btn-lg';

            if (diasDesdeFecha > 7) {
                badgeClass = 'badge bg-danger';
                badgeText = 'Vencido';
                buttonClass = 'btn btn-danger btn-lg';
            } else if (diasDesdeFecha === 7) {
                badgeClass = 'badge bg-warning text-dark';
                badgeText = 'Vence hoy (Último día)';
                buttonClass = 'btn btn-warning btn-lg';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span style="flex: 1;"><strong>${sku}</strong></span>
                </td>
                <td>
                    <span style="font-size: 0.75em; color: #2f3e51; background: #e8f0fe; padding: 4px 10px; border-radius: 6px; margin-left: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Stock: <strong style="font-weight: 800;">${stock}</strong>
                    </span>
                </td>
                <td>
                    <span style="font-size: 0.75em; color: #2f3e51;">Fecha: ${fecha}</span><br>
                    <span class="${badgeClass}">${badgeText}</span>
                </td>
                <td>
                    <button class="${buttonClass}" onclick="renovarFecha('${ref}', '${childSnapshot.key}', '${listBodyId}', '${loadingSpinnerId}')">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </td>
                <td>
                    <button class="btn btn-danger btn-lg" onclick="eliminarSKU('${ref}', '${childSnapshot.key}', '${listBodyId}', '${loadingSpinnerId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            skuListBody.appendChild(row);
        });

        loadingSpinner.style.display = 'none';
    }).catch(error => {
        console.error("Error al cargar SKU: ", error);
        loadingSpinner.style.display = 'none';
    });
}

// Función para agregar nuevo SKU
function agregarSKU(ref, inputId, alertContainerId, loadingSpinnerId, listBodyId) {
    const newSku = document.getElementById(inputId).value;
    const alertContainer = document.getElementById(alertContainerId);
    const fechaActual = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });

    if (newSku) {
        const newRef = firebase.database().ref(ref + '/' + newSku.replace(/\s+/g, '_'));

        // Verificar si el SKU ya existe
        newRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                // SKU ya existe
                mostrarAlerta(alertContainerId, 'El SKU ya existe en el listado', 'danger');
            } else {
                // Agregar nuevo SKU
                newRef.set({ sku: newSku, stock: 0, fecha: fechaActual }) // Agregar la fecha actual
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

// Función para renovar la fecha
function renovarFecha(ref, key, listBodyId, loadingSpinnerId) {
    const fechaActual = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
    const skuRef = firebase.database().ref(ref + '/' + key);

    skuRef.update({ fecha: fechaActual })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Fecha renovada',
                text: 'La fecha se ha actualizado exitosamente.',
            });
            cargarSKUs(ref, listBodyId, loadingSpinnerId); // Recargar la lista de SKU
        })
        .catch(error => {
            console.error("Error al renovar la fecha: ", error);
        });
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
    cargarSKUs('skuForzado', 'skuForcedBody', 'loadingSpinner'); // Cargar los SKU al abrir el modal
    
    // Agregar event listener para agregar SKU en el modal
    const addSkuButton = document.getElementById('addSkuButton');
    if (addSkuButton) {
        addSkuButton.addEventListener('click', () => {
            agregarSKU('skuForzado', 'newSkuInput', 'alertContainer', 'loadingSpinner', 'skuForcedBody');
        });
    }
});
// FIN CARGA SKU PARA FORZAR STOCK

let allData = [];
let currentPage = 1;
let itemsPerPage = 50; 
let currentPageGroup = 0; 
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchDespachos');
const spinner = document.getElementById('spinner');

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
    1011, 1012, 1013, 1014, 1015, 1016, 1018, 1019, 1020, 1732,
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
    1290, 1291, 1292, 1293, 1294, 1295, 1296, 1406, 1407, 1734,
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
    1916, 1725, 1726, 1728, 1729, 1730, 
];

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Función para formatear la hora
function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}hs`;
}

// Función para formatear números en pesos
function formatCurrency(amount) {
    return `$ ${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFacturacion');
    const spinner = document.getElementById('spinner');

    // Mensaje inicial
    searchInput.value = "Aguardando que cargue la web ⏳";
    searchInput.disabled = true;
    spinner.style.display = 'block';

    db.ref('envios').orderByChild('shippingMode').equalTo('me1').once('value')
    .then(snapshot => {
        const data = snapshot.val();

        if (!data) {
            console.log('No se encontraron datos con shippingMode "me1"');
            searchInput.value = "No se encontraron datos";
            spinner.style.display = 'none';
            return;
        }

        allData = Object.values(data).slice(-300);
        allData.reverse(); // Invertir el orden de los datos

        console.log(`Cantidad de datos recibidos: ${allData.length}`);

        loadTable(allData);

        updatePagination(allData.length);

        searchInput.disabled = false;
        searchInput.value = "";
        spinner.style.display = 'none';

    });
});

// Obtener el valor de PasarAWebMonto antes de cargar las filas
let pasarAWebMonto = 0;
db.ref('PasarAWebMonto').once('value')
    .then(snapshot => {
        pasarAWebMonto = snapshot.val() || 0;
    })
    .catch(error => {
        console.error("Error al obtener PasarAWebMonto: ", error);
    });

function loadTable(data, estadoFilter = null) {
    try {
        // Verificar si hay datos para cargar
        if (!data || data.length === 0) {
            console.log('No hay datos para mostrar en la tabla.');
            return;
        }

        // Filtrar datos si se proporciona un estado
        if (estadoFilter) {
            data = data.filter(operation => operation.estadoFacturacion === estadoFilter);
        }

        // Verificar si `data` es un array
        if (!Array.isArray(data)) {
            return; 
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedData = data.slice(start, end);
        const tableBody = document.querySelector('#data-table tbody');

        tableBody.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos
    
            paginatedData.forEach(operation => {
                if (!operation) {
                    console.warn('Operación no válida:', operation);
                    return;
                }
    
                const row = document.createElement('tr');
    
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

                // VERIFICAR STOCK Y PRECIO
                // Función para sanitizar el SKU
                function sanitizeSku(sku) {
                    return sku ? sku.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : ''; // Eliminar caracteres especiales y pasar a minúsculas
                }

                // Obtener el SKU actual
                const skuActual = sanitizeSku(operation.SKU); // Sanitiza el SKU actual

                // Buscar el stock correspondiente en preciosArray
                const precioItem = preciosArray.find(item => sanitizeSku(item.sku) === skuActual); // Asegúrate de sanitizar item.sku
                const stock = precioItem ? precioItem.stock : 0; // Si no se encuentra, stock es 0

                // Verificar si el SKU está en la lista de PlaceIt y si el Cp está en cpsPlaceIt
                const isSkuInList = skusPlaceItList.includes(operation.SKU);
                const isCpInCpsPlaceIt = cpsPlaceIt.includes(Number(operation.Cp));

                // Determinar mensaje y clase de estilo según el stock
                let stockMessage, stockClass, stockIcon;
                let stockToDisplay = stock; // Variable para mostrar el stock correcto

                if (isSkuInList && isCpInCpsPlaceIt) {
                    // Si el SKU y Cp están en las listas de PlaceIt, usar preciosPlaceItArray
                    const precioPlaceItItem = preciosPlaceItArray.find(item => sanitizeSku(item.sku) === skuActual);
                    const stockPlaceIt = precioPlaceItItem ? precioPlaceItItem.stock : 0; // Stock de preciosPlaceItArray

                    stockToDisplay = stockPlaceIt; // Actualiza la variable para mostrar el stock de PlaceIt

                    if (stockPlaceIt === 0) {
                        stockMessage = 'Sin Stock PlaceIt';
                        stockClass = 'sin-stock-Facturacion';
                        stockIcon = 'bi-exclamation-circle-fill'; // Puedes cambiar el ícono si lo deseas
                    } else {
                        stockClass = stockPlaceIt < 10 ? 'stock-pi-bajo-stock-Facturacion' : 'stock-pi-normal-stock-Facturacion';
                        stockMessage = stockPlaceIt < 10 ? 'P-it bajo' : 'Stock P-it';
                        stockIcon = stockPlaceIt < 10 ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
                    }
                } else {
                    // Determinar mensaje y clase de estilo según el stock original
                    if (stock === 0) {
                        stockMessage = 'Sin Stock';
                        stockClass = 'sin-stock-Facturacion';
                        stockIcon = 'bi-exclamation-circle-fill'; // Puedes cambiar el ícono si lo deseas
                    } else {
                        stockClass = stock < 10 ? 'stock-bajo-stock-Facturacion' : 'stock-normal-stock-Facturacion';
                        stockMessage = stock < 10 ? 'Stock bajo CD' : 'Stock CD';
                        stockIcon = stock < 10 ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill';
                    }
                }

                // Generar el HTML para el stock con clases CSS
                let htmlstock = `
                <div class="container-stock-Facturacion">
                    <div class="status-box-stock-Facturacion">
                        <i class="bi ${stockIcon} icon-stock-tv ${stockClass}"></i>
                        <p class="status-text-stock-tv ${stockClass}">
                        ${stockToDisplay === 0 ? stockMessage : `${stockMessage} <strong>${stockToDisplay}</strong> u.`}
                        </p>
                    </div>
                </div>
                `;
                // FIN VERIFICAR STOCK Y PRECIO
                
                // Estado
                const stateCell = document.createElement('td');
                const container = document.createElement('div');
                container.className = 'ios-style-id-container';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                
                // Verificar si existe operation.cliente y crear el contenedor correspondiente
                if (operation.cliente) {
                    const clienteContainer = document.createElement('div');
                    clienteContainer.className = 'ios-style-cliente';
                    clienteContainer.style.display = 'flex';
                    clienteContainer.style.alignItems = 'center';
                    clienteContainer.style.cursor = 'pointer'; // Cambiar el cursor para indicar que es clicable
                
                    const logoImg = document.createElement('img');
                    logoImg.src = './Img/logo-presea.png';
                    logoImg.alt = 'Logo Presea';
                
                    const clienteText = document.createElement('span');
                    clienteText.textContent = operation.cliente;
                
                    clienteContainer.appendChild(logoImg);
                    clienteContainer.appendChild(clienteText);
                    container.appendChild(clienteContainer);
                
                    // Agregar evento de clic para copiar cliente al portapapeles
                    clienteContainer.addEventListener('click', () => {
                        navigator.clipboard.writeText(operation.cliente).then(() => {
                            showAlert(`Se ha copiado al portapapeles: Cliente ${operation.cliente}`);
                        }).catch(err => {
                            console.error('Error al copiar al portapapeles:', err);
                        });
                    });
                }
                
                const idElement = document.createElement('span');
                idElement.textContent = `${operation.idOperacion}`;
                idElement.classList.add('ios-style-id');
                
                // Verificar si existe operacion.packId y crear el div correspondiente
                if (operation.packId) {
                    const packIdElement = document.createElement('div');
                    packIdElement.textContent = `📦 ${operation.packId}`;
                    packIdElement.classList.add('ios-style-paqId');
                    container.appendChild(packIdElement);
                
                    // Cambiar la clase de idElement si existe packId
                    idElement.classList.add('ios-style-id-2');
                
                    // Agregar evento de clic para copiar packId al portapapeles
                    packIdElement.addEventListener('click', () => {
                        navigator.clipboard.writeText(operation.packId).then(() => {
                            showAlert(`Se ha copiado al portapapeles: PaqId ${operation.packId}`);
                        }).catch(err => {
                            console.error('Error al copiar al portapapeles:', err);
                        });
                    });
                } else {
                    // Mantener la clase original si no existe packId
                    idElement.classList.add('ios-style-id');
                }
                
                // Agregar evento de clic para copiar idOperacion al portapapeles
                idElement.addEventListener('click', () => {
                    navigator.clipboard.writeText(operation.idOperacion).then(() => {
                        showAlert(`Se ha copiado al portapapeles: idOperacion ${operation.idOperacion}`);
                    }).catch(err => {
                        console.error('Error al copiar al portapapeles:', err);
                    });
                });
                
                container.appendChild(idElement);
                stateCell.appendChild(container);
                row.appendChild(stateCell);

                const selectElement = document.createElement('select');
                selectElement.style.width = '100%';
                
                // Verificar el valor de operation.shippingMode
                if (operation.shippingMode === "me2") {
                    selectElement.disabled = true; // Deshabilitar el select
                    selectElement.innerHTML = `<option value="">Mercado Envíos</option>`; // Mostrar "Mercado Envíos"
                } else {
                    selectElement.innerHTML = `
                        <option value="pendiente">Pendiente ⏳</option>
                        <option value="facturado">Facturado ✅</option>
                        <option value="cancelado">Cancelado ❌</option>
                        <option value="bloqueado">Bloqueado 🔒</option>
                        <option value="analizar_pasado_a_web">Web ⚠️</option>
                        <option value="pendiente_no_pasa_web">No Pasa ⏳</option>
                        <option value="pasado_a_web">Pasado a Web</option>
                    `;
                }
                
                // Agregar el select al contenedor
                container.appendChild(selectElement);
                
                stateCell.appendChild(container);
                row.appendChild(stateCell);

                // Crear el div con el contenido `${htmlstock}`
                const htmlStockDiv = document.createElement('div');
                htmlStockDiv.innerHTML = `${htmlstock}`;
                container.appendChild(htmlStockDiv);
                
                // Establecer el estado inicial
                const currentState = operation.estadoFacturacion || 'pendiente';
                if (operation.shippingMode !== "me2") {
                    selectElement.value = currentState; // Solo establecer valor si no está deshabilitado
                }                
    
                // Cambiar el color de fondo de la fila según el estado
                switch (currentState) {
                    case 'pendiente':
                        row.style.backgroundColor = 'white';
                        break;
                    case 'facturado':
                        row.style.backgroundColor = 'lightgreen';
                        break;
                    case 'bloqueado':
                        row.style.backgroundColor = 'grey';
                        break;
                    case 'cancelado':
                        row.style.backgroundColor = 'pink';
                        break;
                    case 'pasado_a_web':
                        row.style.backgroundColor = 'lightblue';
                        break;
                    case 'analizar_pasado_a_web':
                        row.style.backgroundColor = 'lightyellow';
                        break;
                    default:
                        row.style.backgroundColor = 'white';
                }
    
                // Actualizar estado en Firebase
                selectElement.addEventListener('change', function() {
                    updateRowColor();
                    const operationId = operation.idOperacion;
                    db.ref('envios/' + operationId).update({ estadoFacturacion: selectElement.value })
                        .then(() => {
                            console.log(`Estado de facturación actualizado a ${selectElement.value} para la operación ${operationId}`);
                            updateNotificationCount();
                            updateNotificationCount2();
                            updateNotificationCount3();
                        })
                        .catch(error => {
                            console.error("Error al actualizar el estado de facturación:", error);
                            // Mostrar mensaje de error usando SweetAlert
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo actualizar el estado de facturación. Verifica tu conexión.',
                                confirmButtonText: 'Aceptar'
                            });
                        });

                    // Agregar listener para escuchar cambios en estadoFacturacion
                    db.ref('envios/' + operationId + '/estadoFacturacion').on('value', (snapshot) => {
                        const newEstado = snapshot.val();
                        // Actualizar el select en la fila correspondiente
                        selectElement.value = newEstado; // Actualiza el select con el nuevo estado
                        updateRowColor(); // Actualiza el color de la fila según el nuevo estado
                    });
                });
                // Fecha y hora
                const dateCell = document.createElement('td');
                dateCell.innerHTML = `${formatDate(operation.dateCreated)}, ${formatTime(operation.dateCreated)}`;
                dateCell.className = 'product-date';
                row.appendChild(dateCell);
    
                // Operación
                const operationCell = document.createElement('td');
                const operationId = operation.idOperacion.toString().replace('200001', '');
                operationCell.innerHTML = `
                    <a href="https://www.mercadolibre.com.ar/ventas/${operation.idOperacion}/detalle" target="_blank"><img id="Meli-trends" src="./Img/meli-trends.png" alt="Meli Trends"></a>
                `;
                row.appendChild(operationCell);
    
                // Imagen
                const imageCell = document.createElement('td');
                imageCell.innerHTML = `
                <a href="https://app.real-trends.com/orders/sale_detail/?order_id=200001${operationId}" target="_blank">
                <img id="real-trends" src="./Img/real-trends.png" alt="Real Trends">
                </a>
                `;
                row.appendChild(imageCell);
    
                // Valor
                const valueCell = document.createElement('td');
                valueCell.className = 'value-cell';
                const transactionAmount = operation.payments[0]?.transaction_amount || 0;
                valueCell.innerHTML = `${formatCurrency(transactionAmount)}`;
                row.appendChild(valueCell);

                // Agregar evento click para abrir el modal
                valueCell.addEventListener('click', () => {
                    createBillingModal(operation); // Llama a la función que crea el modal
                });
    
                // Verificar y actualizar el estado
                if (transactionAmount >= pasarAWebMonto && (currentState === 'pendiente' || currentState === 'analizar_pasado_a_web' || currentState === undefined)) {
                    selectElement.value = 'analizar_pasado_a_web';
                    db.ref('envios/' + operation.idOperacion).update({ estadoFacturacion: 'analizar_pasado_a_web' })
                        .then(() => {
                            console.log(`Estado actualizado a analizar_pasado_a_web para la operación ${operation.idOperacion}`);
                            updateRowColor();
                        })
                        .catch(error => {
                            console.error("Error al actualizar el estado de facturación:", error);
                        });
                } else if (transactionAmount < pasarAWebMonto && currentState === 'analizar_pasado_a_web') {
                    selectElement.value = 'pendiente';
                    db.ref('envios/' + operation.idOperacion).update({ estadoFacturacion: 'pendiente' })
                        .then(() => {
                            console.log(`Estado revertido a pendiente para la operación ${operation.idOperacion}`);
                            updateRowColor();
                            updateNotificationCount();
                            updateNotificationCount2();
                            updateNotificationCount3();
                        })
                        .catch(error => {
                            console.error("Error al revertir el estado de facturación:", error);
                        });
                }
    
                // Cambiar el color de fondo de la fila según el estado
                const updateRowColor = () => {
                    switch (selectElement.value) {
                        case 'pendiente':
                            row.style.backgroundColor = 'white';
                            break;
                        case 'facturado':
                            row.style.backgroundColor = 'lightgreen';
                            break;
                        case 'bloqueado':
                            row.style.backgroundColor = 'wheat';
                            break;
                        case 'cancelado':
                            row.style.backgroundColor = 'pink';
                            break;
                        case 'pasado_a_web':
                            row.style.backgroundColor = 'lightblue';
                            break;
                        case 'analizar_pasado_a_web':
                            row.style.backgroundColor = 'lightyellow';
                            break;
                        default:
                            row.style.backgroundColor = 'white';
                    }
                };
                updateRowColor();
                updateNotificationCount();
                updateNotificationCount2();
                updateNotificationCount3();

                // Envío
                const shippingCell = document.createElement('td');
                const shippingCost = operation.payments[0]?.shipping_cost || 0;
                shippingCell.style.whiteSpace = 'nowrap';

                // Verifica el estado de manera segura
                if (operation.client && operation.client.billing_info && Array.isArray(operation.client.billing_info.additional_info)) {
                    const stateName = operation.client.billing_info.additional_info.find(info => info.type === "STATE_NAME")?.value;
                    const stateName2 = operation.Provincia;

                // Verifica si el SKU está en la lista de Firebase y si el Cp está en cpsPlaceIt
                const isSkuInList = skusPlaceItList.includes(operation.SKU);
                const isCpInCpsPlaceIt = cpsPlaceIt.includes(Number(operation.Cp)); // Asegúrate de comparar como número

                // Lista de estados para envío prohibido
                const estadosProhibidos = ["Jujuy", "Misiones", "Tierra del Fuego"];

                // Verificar si el SKU está en el array de skusForzadosyFecha
                const skuForzado = skusForzadosyFecha.find(item => item.sku === operation.SKU);

                let fechaForzadaReciente = false;
                let diasDesdeFecha = 0; // Inicializar la variable para días desde la fecha

                if (skuForzado) {
                    // Obtener solo la parte de la fecha antes de la coma
                    const partesFecha = skuForzado.fecha.split(",")[0].split("/");
                    const dia = parseInt(partesFecha[0], 10);
                    const mes = parseInt(partesFecha[1], 10) - 1; // Mes en JS va de 0 a 11
                    const anio = parseInt(partesFecha[2], 10);

                    const fechaGuardada = new Date(anio, mes, dia);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    fechaGuardada.setHours(0, 0, 0, 0);

                    const diferenciaMs = hoy - fechaGuardada;
                    diasDesdeFecha = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

                    // Si es dentro de los últimos 7 días
                    fechaForzadaReciente = diasDesdeFecha <= 7;
                }

                if (estadosProhibidos.includes(stateName) || estadosProhibidos.includes(stateName2)) {
                    shippingCell.innerHTML = `<strong class="alerta">⚠️ ${(stateName || stateName2).toUpperCase()}</strong>`;                    
                } else if (isSkuInList && isCpInCpsPlaceIt) {
                    shippingCell.innerHTML = `
                        <strong class="express-meli" style="color: yellow;">⚡ FACTURAR EXPRESS </strong><br>
                        <span class="express-meli-sub" style="font-size: smaller;">Condición: 40-60</span>
                    `;
                } else if (skuForzado && fechaForzadaReciente && isCpInCpsPlaceIt) {
                    shippingCell.innerHTML = `
                        <strong class="express-meli2" style="color: yellow;">⚡ FACTURAR EXPRESS </strong><br>
                        <span class="express-meli-sub" style="font-size: smaller;">Forzado en fecha ${skuForzado.fecha}<br><strong>(hace ${diasDesdeFecha} días)</strong></span>
                    `;
                }
                else if (isCpInCpsPlaceIt) {
                    shippingCell.innerHTML = `
                        <strong class="express-meli3" style="color: orangered;">⚡ LOCALIDAD EXPRESS</strong><br>
                        <span class="express-meli-sub" style="font-size: smaller;"><strong>SIN STOCK</strong> disponible en dep. 60</span>
                    `;
                } else if (["Misiones", "Tierra del Fuego"].includes(stateName)) {
                    shippingCell.innerHTML = `<strong class="alerta">⚠️ ${stateName.toUpperCase()}</strong>`;
                } else if (shippingCost > 0) {
                    shippingCell.innerHTML = `<strong class="shipping-value" style="color: rgb(52,152,219);">${formatCurrency(shippingCost)}</strong>`;
                } else {
                    // Solo muestra "GRATUITO" si no hay envío express
                    shippingCell.innerHTML = `<strong class="gratuito" style="color: orangered;">GRATUITO</strong>`;
                }
                } else {
                    console.warn("Información de facturación no disponible para la operación:", operation.idOperacion);
                    shippingCell.innerHTML = `<strong style="color: red;">X</strong>`;
                }

                row.appendChild(shippingCell);

                // Producto
                const productCell = document.createElement('td');
                productCell.className = 'product-cell';
                productCell.innerHTML = `Cantidad: <strong>X${operation.Cantidad}</strong> <br> <strong>${operation.SKU}</strong>`;
                row.appendChild(productCell);
                
                // Agregar evento de clic para abrir el modal con el carrusel de imágenes
                productCell.addEventListener('click', () => {
                    // Verificar si operation.pictures existe y es un array
                    const filteredPictures = Array.isArray(operation.pictures) ? 
                        operation.pictures.filter(picture => picture.secure_url) : [];
                
                    // Crear el carrusel
                    const carouselInner = document.getElementById('carouselInner');
                    carouselInner.innerHTML = ''; // Limpiar el contenido anterior del carrusel
                
                    filteredPictures.forEach((picture, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                        carouselItem.innerHTML = `
                            <img src="${picture.secure_url}" class="d-block mx-auto" alt="Imagen ${index + 1}" style="height: 150px; width: auto; max-width: 100%; object-fit: cover;">
                        `;
                        carouselInner.appendChild(carouselItem);
                    });
                
                    // Limpiar el contenido anterior del productInfo
                    const modalBody = document.querySelector('#productModal .modal-body');
                    const existingProductInfo = modalBody.querySelector('.macos-style-producto-meli');
                    if (existingProductInfo) {
                        existingProductInfo.remove();
                    }
                
                    // Agregar el div con la clase macos-style-producto-meli encima del carrusel
                    const productInfo = document.createElement('div');
                    productInfo.className = 'macos-style-producto-meli';
                    productInfo.innerHTML = `<i class="bi bi-info-circle-fill"></i> Producto: X ${operation.Cantidad} <strong style="color: white;">${operation.SKU}</strong> ${operation.Producto}`;
                    
                    // Agregar el productInfo y el carrusel al modal
                    modalBody.insertBefore(productInfo, modalBody.firstChild);
                
                    // Mostrar el modal
                    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
                    productModal.show();
                });
    
                // Medio de pago
                const paymentCell = document.createElement('td');
                const payment = operation.payments[0];
    
                let paymentMethodImage = '';
                let paymentDetails = '';
    
                switch (payment.payment_method_id) {
                    case 'consumer_credits':
                        paymentMethodImage = './Img/mercadocredito.png';
                        paymentDetails = '<strong>Crédito sin tarjeta</strong>';
                        break;
                    case 'account_money':
                        paymentMethodImage = './Img/mercadopago.png';
                        paymentDetails = '<strong>Dinero en Cuenta</strong>';
                        break;
                    case 'debin_transfer':
                    case 'bank_transfer ':
                        paymentMethodImage = './Img/debin_transfer.png';
                        paymentDetails = '<strong>Debin Bancario</strong>';
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
    
                if (
                    payment.payment_method_id !== 'consumer_credits' &&
                    payment.payment_method_id !== 'account_money' &&
                    payment.payment_method_id !== 'pagofacil' &&
                    payment.payment_method_id !== 'rapipago'
                ) {
                    if (payment.payment_type === 'credit_card') {
                        paymentDetails = `<strong>Crédito</strong> en ${payment.installments} cuota/s de ${formatCurrency(payment.installment_amount)}`;
                    } else if (payment.payment_type === 'debit_card') {
                        paymentDetails = `<strong>Débito</strong> en ${payment.installments} cuota/s de ${formatCurrency(payment.installment_amount)}`;
                    } else if (payment.payment_type === 'debin_transfer' || payment.payment_type === 'bank_transfer') {
                        paymentDetails = `<strong>Debin Bancario inmediato</strong>`;
                    } else {
                        paymentDetails = payment.payment_type;
                    }
                }

                paymentCell.innerHTML = `
                    <div class="payment-cell">
                        <img src="${paymentMethodImage}" alt="${payment.payment_method_id}">
                        <span class="payment-details">${paymentDetails}</span>
                    </div>
                `;
                row.appendChild(paymentCell);
    
                // Botón para eliminar
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = 'X';
                deleteButton.className = 'btn btn-sm btn-danger';
                deleteButton.onclick = () => {
                    const row = deleteButton.closest('tr');
    
                    Swal.fire({
                        title: 'Ingrese la contraseña 🔒',
                        input: 'password',
                        inputLabel: 'Contraseña de Eliminación (Solicítela a Lucas)',
                        showCancelButton: true,
                        confirmButtonText: 'Eliminar',
                        cancelButtonText: 'Cancelar',
                        inputValidator: (value) => {
                            if (value !== '6572') {
                                return 'Contraseña incorrecta!';
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            db.ref('envios/' + operation.idOperacion).remove()
                                .then(() => {
                                    row.remove();
                                    Swal.fire('¡Eliminado!', 'La fila ha sido eliminada.', 'success');
                                })
                                .catch(error => {
                                    Swal.fire('Error', 'No se pudo eliminar la fila. ' + error.message, 'error');
                                });
                        }
                    });
                };
    
                deleteCell.appendChild(deleteButton);
                row.appendChild(deleteCell);


// MODAL DATOS DE PAGO
// Función para formatear la fecha
function formatDate2(dateString) {
    const date = new Date(dateString);
    return `Fecha ${date.toLocaleDateString('es-AR')}, Horario: ${date.toLocaleTimeString('es-AR')}`;
}

// Función para formatear la moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

// Crear el modal
function createBillingModal(operation) {
    // Limpiar el contenido anterior del modal si ya existe
    const existingModal = document.getElementById('billingModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Verificar si hay pagos disponibles
    if (!operation.payments || operation.payments.length === 0) {
        return; 
    }

    // Obtener los valores de los pagos
    const transactionAmount2 = operation.payments[0]?.transaction_amount || 0;
    const shippingCost2 = operation.payments[0]?.shipping_cost || 0; 
    const couponAmount2 = operation.payments[0]?.coupon_amount || 0;
    const dateApproved2 = formatDate2(operation.payments[0]?.date_approved);
    const totalPaidAmount2 = operation.payments[0]?.total_paid_amount;
    const idPago = operation.payments[0]?.id;
    const idOperacion2 = operation.idOperacion;

    // Calcular el total facturable
    const totalPaid = transactionAmount2 + shippingCost2 - couponAmount2;

    const modalHtml = `
    <div class="modal fade" id="billingModal" tabindex="-1" aria-labelledby="billingModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="border-radius: 10px; box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);">
                <div class="modal-header" style="background-color: #e9ecef; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                    <h5 class="modal-title" id="billingModalLabel" style="font-weight: bold; color: #333;">Detalle de Pago iD: ${idPago}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="padding: 30px; text-align: center;">
                    <img src="./Img/mp.webp" alt="Logo" style="width: 120px; display: block; margin: 0 auto 15px;">
                    <h5 style="color: #333; border: 1px solid #ccc; border-radius: 8px; padding: 12px; background-color: #f8f9fa;">
                        Factura de Operación:  
                        <a href="https://www.mercadopago.com.ar/activities/1?q=${idOperacion2}" target="_blank" style="color: #007bff; text-decoration: none;">
                            ${idOperacion2} <i class="bi bi-box-arrow-in-up-right" style="font-size: 1.2rem;"></i>
                        </a>
                    </h5>
                    <p style="margin-top: 15px;"><strong>Acreditación:</strong> ${dateApproved2}</p>
                    <hr>
                    <p><strong>Costo de Producto:</strong> ${formatCurrency(transactionAmount2)}</p>
                    <p><strong>Costo de Envío:</strong> ${formatCurrency(shippingCost2)}</p>
                    <p style="color: red;"><strong>Contraparte:</strong> -${formatCurrency(couponAmount2)}</p>
                    <hr>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #28a745;">
                        <strong>Total Facturable:</strong> ${formatCurrency(totalPaid)}
                    </p>
                    <div id="amountCheck" style="margin-top: 20px;"></div>
                </div>
            </div>
        </div>
    </div>
`;

    // Agregar el modal al body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Calcular y mostrar la verificación de montos
    const amountCheckDiv = document.getElementById('amountCheck');
    const totalCalculated = transactionAmount2 + shippingCost2 - couponAmount2;
    const installments = operation.payments[0]?.installments || 0;

    if (totalCalculated === totalPaidAmount2) {
        amountCheckDiv.innerHTML = `
            <div style="background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 5px; padding: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-check-circle-fill" style="font-size: 1.5rem; margin-right: 10px;"></i>
                <div style="text-align: center;">
                    Los montos coinciden con Mercado Pago
                </div>
            </div>`;
    } else {
        const difference = totalPaidAmount2 - totalCalculated;
        amountCheckDiv.innerHTML = `
            <div style="background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 5px; padding: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-info-circle-fill" style="font-size: 1.5rem; margin-right: 10px;"></i>
                <div style="text-align: center;">
                    Los montos no coinciden con Mercado Pago, abono en ${installments} cuotas con recargo de ${formatCurrency(difference)}
                </div>
            </div>`;
    }
      
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('billingModal'));
    modal.show();
}

// Llamar a la función para crear el modal
createBillingModal(data);
// FIN MODAL DATOS DE PAGO

// TRACKING CONTROL
// Botón para verificar si fue enviado
const trackingCell = document.createElement('td');
const trackingButton = document.createElement('button');
trackingButton.type = 'button';
trackingButton.className = operation.trackingNumber ? 'btn btn-sm btn-success' : 'btn btn-sm btn-dark disabled'; // Verde si existe, oscuro si no
trackingButton.innerHTML = '<i class="bi bi-truck-front-fill"></i>';

// Solo agregar tooltip si hay un trackingNumber
if (operation.trackingNumber) {
    trackingButton.setAttribute('data-bs-toggle', 'tooltip');
    trackingButton.setAttribute('data-bs-placement', 'top');
    trackingButton.setAttribute('data-bs-custom-class', 'custom-tooltip');

    // Verificar si la transportCompany es "Novogar"
    if (operation.transportCompany === "Novogar") {
        trackingButton.setAttribute('data-bs-title', `${operation.transportCompany}: ${operation.trackingNumber}`);
    } else {
        trackingButton.setAttribute('data-bs-title', `${operation.transportCompany}: ${operation.trackingNumber} <a href="${operation.trackingLink}" target="_blank" style="color: white;">Ver seguimiento</a>`);
    }

    // Inicializar el tooltip
    const tooltip = new bootstrap.Tooltip(trackingButton, {
        html: true // Permitir HTML en el tooltip
    });

    // Mostrar el tooltip de manera permanente para pruebas
    tooltip.show();
}

// Agregar el botón a la celda
trackingCell.appendChild(trackingButton);
row.appendChild(trackingCell);
// FIN TRACKING CONTROL

// Botón de comentario
const commentCell = document.createElement('td');
const commentButton = document.createElement('button');

// Inicializar la clase del botón según los datos disponibles
if (operation.comentario) {
    commentButton.className = 'btn btn-sm btn-success';
} else if (operation.email) {
    commentButton.className = 'btn btn-sm btn-warning';
} else {
    commentButton.className = 'btn btn-sm btn-secondary';
}

commentButton.innerHTML = '<i class="bi bi-pencil"></i>';
commentCell.appendChild(commentButton);
row.appendChild(commentCell);

// Agregar la fila a la tabla
tableBody.appendChild(row);

commentButton.onclick = () => {
    console.log('ID de operación:', operation ? operation.idOperacion : 'undefined');

    if (!operation || !operation.idOperacion) {
        Swal.fire('Error', 'No se puede cargar el comentario: operación no válida.', 'error');
        return;
    }

    db.ref('envios').child(operation.idOperacion).once('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('comentarioInput').value = data.comentario || '';
            document.querySelector('input[type="email"]').value = data.email || '';
            document.querySelector('input[type="tel"]').value = data.Telefono || '';
            document.getElementById('calleInput').value = data.Calle || '';
            document.getElementById('alturaInput').value = data.Altura || '';
            document.getElementById('observacionesInput').value = data.Observaciones || '';

            // Cambiar el estado del botón según los datos
            if (data.email) {
                commentButton.classList.remove('btn-secondary', 'btn-success');
                commentButton.classList.add('btn-warning');
            } else if (data.comentario) {
                commentButton.classList.remove('btn-secondary', 'btn-warning');
                commentButton.classList.add('btn-success');
            } else {
                commentButton.classList.remove('btn-warning', 'btn-success');
                commentButton.classList.add('btn-secondary');
            }

            if (data.trackingNumber) {
                actualizarEstadoDespacho(true);
            } else {
                actualizarEstadoDespacho(false);
            }
        } else {
            // Limpiar campos si no existe
            document.getElementById('comentarioInput').value = '';
            document.querySelector('input[type="email"]').value = '';
            document.querySelector('input[type="tel"]').value = '';
            document.getElementById('calleInput').value = '';
            document.getElementById('alturaInput').value = '';
            document.getElementById('observacionesInput').value = '';
            actualizarEstadoDespacho(false);
            commentButton.classList.remove('btn-warning', 'btn-success');
            commentButton.classList.add('btn-secondary');
        }
    });

    $('#comentarioModal').modal('show');

    // Guardar Comentario
    document.getElementById('guardarComentarioBtn').onclick = function() {
        const comentario = document.getElementById('comentarioInput').value;
        db.ref('envios').child(operation.idOperacion).update({ comentario: comentario })
            .then(() => {
                Swal.fire('¡Éxito!', 'Comentario actualizado correctamente.', 'success');
                $('#comentarioModal').modal('hide');
                loadTable(data);
                commentButton.classList.remove('btn-secondary', 'btn-warning');
                commentButton.classList.add('btn-success');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el comentario: ' + error.message, 'error');
            });
    };

    // Guardar Email
    document.getElementById('guardarEmailBtn').onclick = function() {
        const email = document.querySelector('input[type="email"]').value;
        db.ref('envios').child(operation.idOperacion).update({ email: email })
            .then(() => {
                mostrarAlertaExito('Email actualizado correctamente.');
                commentButton.classList.remove('btn-secondary', 'btn-success');
                commentButton.classList.add('btn-warning');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el email: ' + error.message, 'error');
            });
    };

    // Guardar Teléfono
    document.getElementById('guardarTelefonoBtn').onclick = function() {
        const telefono = document.querySelector('input[type="tel"]').value;
        db.ref('envios').child(operation.idOperacion).update({ Telefono: telefono })
            .then(() => {
                mostrarAlertaExito('Teléfono actualizado correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el teléfono: ' + error.message, 'error');
            });
    };

    // Guardar Calle
    document.getElementById('guardarCalleBtn').onclick = function() {
        const calle = document.getElementById('calleInput').value;
        db.ref('envios').child(operation.idOperacion).update({ Calle: calle })
            .then(() => {
                mostrarAlertaExito('Calle actualizada correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar la calle: ' + error.message, 'error');
            });
    };

    // Guardar Altura
    document.getElementById('guardarAlturaBtn').onclick = function() {
        const altura = document.getElementById('alturaInput').value;
        db.ref('envios').child(operation.idOperacion).update({ Altura: altura })
            .then(() => {
                mostrarAlertaExito('Altura actualizada correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar la altura: ' + error.message, 'error');
            });
    };

    // Guardar Observaciones
    document.getElementById('guardarObservacionesBtn').onclick = function() {
        const observaciones = document.getElementById('observacionesInput').value;
        db.ref('envios').child(operation.idOperacion).update({ Observaciones: observaciones })
            .then(() => {
                mostrarAlertaExito('Observaciones actualizadas correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar las observaciones: ' + error.message, 'error');
            });
    };
};

});
            // Paginación y actualización de notificaciones
            updatePagination();
            updateNotificationCount();
            updateNotificationCount2();
            updateNotificationCount3();
        } catch (error) {
            console.error('Error al cargar la tabla:', error);
        }
    }
    
    function actualizarEstadoDespacho(isDespachado) {
        const estadoDespacho = document.getElementById('estadoDespacho');
        if (isDespachado) {
            estadoDespacho.innerHTML = '<i class="bi bi-check-circle-fill"></i> Etiqueta de envío generada';
            estadoDespacho.style.backgroundColor = '#d4edda';
            estadoDespacho.style.color = '#155724';
        } else {
            estadoDespacho.innerHTML = '<i class="bi bi-x-circle-fill"></i> Etiqueta de envío sin generar';
            estadoDespacho.style.backgroundColor = '#f8d7da';
            estadoDespacho.style.color = '#721c24';
        }
    }
    
    function mostrarAlertaExito(mensaje) {
        console.log('Mostrando alerta de éxito:', mensaje); // Verifica que la función se llama
        const alertContainer = document.getElementById('alertContainerFacturacion');
        if (alertContainer) {
            console.log('Contenedor de alertas encontrado:', alertContainer); // Verifica que el contenedor se encuentra
            alertContainer.innerText = `${mensaje} ✅`;
            setTimeout(() => {
                alertContainer.innerText = ''; // Limpiar la alerta después de 3 segundos
            }, 3000);
        } else {
            console.error('Contenedor de alertas no encontrado.');
        }
    }
     
// Actualizar la paginación
function updatePagination() {
    paginationContainer.innerHTML = '';
    const totalItems = allData.length; // Asegúrate de que allData esté disponible
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let startPage = Math.max(1, currentPageGroup + 1);
    let endPage = Math.min(currentPageGroup + 6, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            loadTable(allData); // Asegúrate de pasar allData aquí
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
            updatePagination();
            loadTable(allData); // Asegúrate de pasar allData aquí
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
            updatePagination();
            loadTable(allData); // Asegúrate de pasar allData aquí
        });
        paginationContainer.appendChild(backItem);
    }
}

// BUSCADOR
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchFacturacion');
    const searchStatus = document.getElementById('search-status');
    const searchStatus2 = document.getElementById('search-status2');
    const searchMessage = document.getElementById('search-message');
    const errorMessage = document.querySelector('.error-message');
    const searchTermSpan = document.getElementById('search-term');
    const pagination = document.getElementById('pagination');
    const tableHeader = document.querySelector('#data-table thead');

    // Evento para borrar el contenido del buscador al hacer clic y llevar a la página 1
    searchInput.addEventListener('focus', function() {
        searchInput.value = '';
        searchTermSpan.textContent = '';
        searchStatus.style.display = 'none';
        searchStatus2.style.display = 'none'; // Ocultar searchStatus2
        searchMessage.textContent = '';
        errorMessage.style.display = 'none';
        currentPage = 1; // Llevar a la página 1
        loadTable(allData); // Volver a cargar todos los datos
        pagination.classList.remove('hidden'); // Mostrar paginación
        tableHeader.classList.remove('hidden'); // Mostrar cabecera de la tabla
    });

    searchInput.addEventListener('input', async function() {
        const searchTerm = searchInput.value.toLowerCase();
        searchTermSpan.textContent = searchTerm;

        if (searchTerm === '') {
            searchStatus.style.display = 'none';
            searchStatus2.style.display = 'none'; // Ocultar searchStatus2
            searchMessage.textContent = '';
            errorMessage.style.display = 'none';
            currentPage = 1; // Llevar a la página 1
            loadTable(allData); // Volver a cargar todos los datos
            pagination.classList.remove('hidden'); // Mostrar paginación
            tableHeader.classList.remove('hidden'); // Mostrar cabecera de la tabla
            return;
        }

        // Verificar si el input es un número de 16 dígitos
        if (/^\d{16}$/.test(searchTerm)) {
            searchStatus.style.display = 'flex';
            searchStatus2.style.display = 'none'; // Ocultar searchStatus2
            searchMessage.innerHTML = `Buscando en Firebase... <i class="bi bi-fire"></i>`;
            searchStatus.querySelector('.spinner-ios-ml').style.display = 'block';
            await loadDataFromFirebase(searchTerm);
            return;
        }

        const totalItems = allData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let foundMatch = false;

        searchStatus.style.display = 'flex';
        searchStatus2.style.display = 'none'; // Ocultar searchStatus2

        for (let page = 1; page <= totalPages; page++) {
            currentPage = page;
            searchStatus.classList.remove('alert-ios2-ml');
            searchStatus.classList.add('alert-ios-ml');
            searchMessage.textContent = `Estoy buscando en el contenido de la página ${page}...`;
            searchStatus.querySelector('.spinner-ios-ml').style.display = 'block';
            loadTable(allData);
            
            await new Promise(resolve => setTimeout(resolve, 50));

            const tableRows = document.querySelectorAll('#data-table tbody tr');
            const matches = [];

            tableRows.forEach(row => {
                const state = row.cells[0].textContent.toLowerCase();
                const operationId = row.cells[2].textContent.toLowerCase();
                const productName = row.cells[6].textContent.toLowerCase();
                const paymentMethod = row.cells[7].textContent.toLowerCase();

                if (
                    state.includes(searchTerm) || 
                    operationId.includes(searchTerm) || 
                    productName.includes(searchTerm) || 
                    paymentMethod.includes(searchTerm)
                ) {
                    row.style.display = '';
                    matches.push(row);
                } else {
                    row.style.display = 'none';
                }
            });

            if (matches.length > 0) {
                foundMatch = true;
                searchMessage.innerHTML = `¡Coincidencia encontrada en la página ${page}! <i class="bi bi-check-circle-fill"></i>`;
                searchStatus.querySelector('.spinner-ios-ml').style.display = 'none';
                break;
            } else {
                console.log(`No se encontraron coincidencias en la página ${page}.`);
            }
        }

        if (!foundMatch) {
            searchStatus.style.display = 'none';
            errorMessage.style.display = 'flex';
            pagination.classList.add('hidden'); 
            tableHeader.classList.add('hidden');
            searchStatus2.style.display = 'flex';
        } else {
            errorMessage.style.display = 'none';
        }
    });

    async function loadDataFromFirebase(searchTerm) {
        console.log(`Iniciando búsqueda para el ID: ${searchTerm}`); 

        try {
            const snapshot = await db.ref(`envios/${searchTerm}`).once('value');
            const data = snapshot.val();

            if (!data) {
                console.log(`No se encontraron datos en Firebase para el ID: ${searchTerm}`);
                pagination.classList.add('hidden'); 
                tableHeader.classList.add('hidden'); 
                searchStatus.querySelector('.spinner-ios-ml').style.display = 'none';
                searchStatus.style.display = 'none';
                searchStatus2.style.display = 'flex'; 
                searchStatus2.innerHTML = `No se encontraron datos en Firebase para ${searchTerm} <i class="bi bi-exclamation-square-fill ml-1"></i>`;
                return;
            }

            console.log(`Datos encontrados para el ID: ${searchTerm}`, data);
            loadTable([data]);
            currentPage = 1;
            pagination.classList.add('hidden'); 
            searchStatus.classList.remove('alert-ios-ml');
            searchStatus.classList.add('alert-ios2-ml');
            searchMessage.innerHTML = `Datos encontrados en Firebase <i class="bi bi-fire"></i> para el ID: ${searchTerm} <i class="bi bi-check-circle-fill"></i>`;
            searchStatus.querySelector('.spinner-ios-ml').style.display = 'none';

            if (errorMessage) {
                errorMessage.style.display = 'none'; 
                tableHeader.classList.remove('hidden'); 
            }

        } catch (error) {
            console.error('Error al cargar datos de Firebase:', error);
            if (errorMessage) {
                errorMessage.textContent = 'Error al cargar datos de Firebase';
                errorMessage.style.display = 'flex';
            }
        }

        console.log(`Búsqueda finalizada para el ID: ${searchTerm}`);
    }
});
// FIN BUSCADOR

// NOTIFICACION DE VENTAS
let lastCheckTimestamp = Date.now();
const checkInterval = 30 * 60 * 1000; // 30 minutos en milisegundos

function checkForNewSales() {
  db.ref('envios').orderByChild('shippingMode').equalTo('me1').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      const newSales = Object.values(data).filter(operation => new Date(operation.dateCreated).getTime() > lastCheckTimestamp);

      if (newSales.length > 0) {
        const message = newSales.length === 1 
          ? `Ingresó 1 nueva venta que no está en planilla` 
          : `Ingresaron ${newSales.length} ventas nuevas que no están en planilla`;
        document.getElementById('notificationMessage').textContent = message;
        document.getElementById('newSalesNotification').style.display = 'block';
        lastCheckTimestamp = Date.now();
      }
    })
    .catch(error => {
      console.error("Error al verificar nuevas ventas: ", error);
    });
}

function closeNotification() {
  document.getElementById('newSalesNotification').style.display = 'none';
}

// Iniciar la verificación cada 5 minutos
setInterval(checkForNewSales, checkInterval);

// Verificar una vez al cargar la página
checkForNewSales();
// FIN NOTIFICACION DE VENTAS

// CONFIRGURAR MONTO PARA PASAR A WEB
$(document).ready(function() {
    $('#inputModal').on('show.bs.modal', function () {
      // Cargar el valor desde Firebase cuando se abre el modal
      const dbRef = firebase.database().ref('PasarAWebMonto');
      dbRef.once('value').then(snapshot => {
        const value = snapshot.val();
        if (value !== null) {
          document.getElementById('numericInput').value = value;
        } else {
          document.getElementById('numericInput').value = '';
        }
      }).catch(error => {
        console.error("Error al cargar el valor: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cargar el valor.',
        });
      });
    });
  });

  function saveValue() {
    const inputValue = document.getElementById('numericInput').value;

    if (inputValue === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa un valor numérico.',
      });
      return;
    }

    // Pushear el valor a Firebase
    const dbRef = firebase.database().ref('PasarAWebMonto');
    dbRef.set(Number(inputValue))
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'El valor ha sido guardado exitosamente.',
        });
        $('#inputModal').modal('hide'); // Cerrar el modal después de guardar
        location.reload();
      })
      .catch(error => {
        console.error("Error al guardar el valor: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar el valor.',
        });
      });
  }
  // FIN CONFIRGURAR MONTO PARA PASAR A WEB

  function updateNotificationCount() {
    const count = allData.filter(operation => 
        operation.estadoFacturacion === 'pendiente'|| 
        operation.estadoFacturacion === undefined
    ).length;

    document.getElementById('contadorNotificaciones').textContent = count;
}

function updateNotificationCount2() {
    const count = allData.filter(operation => 
        operation.estadoFacturacion === 'analizar_pasado_a_web'
    ).length;

    document.getElementById('badgeAnalizar').textContent = count; 
}

function updateNotificationCount3() {
    const count = allData.filter(operation => 
        operation.estadoFacturacion === 'pendiente_no_pasa_web'|| 
        operation.estadoFacturacion === undefined
    ).length;

    document.getElementById('contadorNotificaciones3').textContent = count;
}

// FUNCIONES PARA EL FILTRADO DE ESTADOS
document.getElementById('estadoFilter').addEventListener('change', function() {
    const estadoFilter = this.value; // Obtener el valor seleccionado
    currentPage = 1; // Reiniciar a la primera página
    currentPageGroup = 0; // Reiniciar el grupo de páginas

    // Obtener el contenedor de paginación
    const paginationContainer = document.getElementById('pagination');

    // Si el filtro es vacío, pasar allData completo
    if (estadoFilter === '') {
        loadTable(allData); // Pasar todos los datos
        paginationContainer.classList.remove('hidden'); // Mostrar paginación
    } else {
        loadTable(allData, estadoFilter); // Pasar allData y el filtro
        paginationContainer.classList.add('hidden'); // Ocultar paginación
    }
});

document.getElementById('btnNotificaciones').addEventListener('click', function() {
    const estadoFilter = 'pendiente'; // Valor del filtro
    document.getElementById('estadoFilter').value = estadoFilter; // Establecer el valor del filtro
    currentPage = 1; // Reiniciar a la primera página
    currentPageGroup = 0; // Reiniciar el grupo de páginas

    // Aplicar el filtro
    loadTable(allData, estadoFilter); // Pasar allData y el filtro
    document.getElementById('pagination').classList.add('hidden'); // Ocultar paginación
});

document.getElementById('btnNotificaciones3').addEventListener('click', function() {
    const estadoFilter = 'pendiente_no_pasa_web'; // Valor del filtro
    document.getElementById('estadoFilter').value = estadoFilter; // Establecer el valor del filtro
    currentPage = 1; // Reiniciar a la primera página
    currentPageGroup = 0; // Reiniciar el grupo de páginas

    // Aplicar el filtro
    loadTable(allData, estadoFilter); // Pasar allData y el filtro
    document.getElementById('pagination').classList.add('hidden'); // Ocultar paginación
});

document.getElementById('importButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecciona un archivo.');
        return;
    }

    // Mostrar el spinner
    document.getElementById('spinnerOverlay').style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        const headers = rows[0];

        let totalRows = rows.length - 1; // Sin contar la cabecera
        let processedRows = 0;
        let newDataCount = 0;

        const importPromises = rows.slice(1).map(row => {
            const cuit = row[headers.indexOf('cuit')];
            const numero = row[headers.indexOf('numero')];
            const dataObject = {};

            headers.forEach((header, index) => {
                if (header !== 'cuit' && header !== 'numero') {
                    dataObject[header] = row[index];
                }
            });

            const cuitRef = db.ref(`IVA/${cuit}`);
            return cuitRef.child(numero).once('value').then(snapshot => {
                if (!snapshot.exists()) {
                    // Si no existe, se puede importar
                    return cuitRef.child(numero).set(dataObject)
                        .then(() => {
                            processedRows++;
                            newDataCount++;
                            const progress = Math.round((processedRows / totalRows) * 100);
                            document.getElementById('spinnerProgress').innerText = `${progress}%`;
                        });
                } else {
                    // Si el número ya existe, se omite
                    processedRows++;
                    return Promise.resolve();
                }
            });
        });

        // Esperar a que todas las promesas se resuelvan
        Promise.all(importPromises).then(() => {
            // Ocultar el spinner
            document.getElementById('spinnerOverlay').style.display = 'none';

            // Mostrar mensaje de éxito
            if (newDataCount > 0) {
                Swal.fire({
                    title: 'Confirmación de Importación',
                    html: `<style>
                              .swal-message {
                                  text-align: center;
                                  font-size: 18px;
                              }
            
                              .counter.imported {
                                  font-weight: bold; 
                                  font-size: 24px;
                                  color: white; 
                                  background-color: #007bff; 
                                  padding: 10px 20px; 
                                  border-radius: 5px; 
                                  margin-bottom: 5px;
                                  display: inline-block; 
                              }
                           </style>
                           <div class="swal-message">
                              <span class="counter imported">${newDataCount}</span>
                              <br>Se han importado nuevos datos de IVA.
                           </div>`,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Aceptar',
                    cancelButtonText: 'Cancelar'
                });
            } else {
                Swal.fire({
                    title: 'No hay nuevos datos',
                    text: 'No se encontraron nuevos datos para importar.',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            }                    
        }).catch(error => {
            console.error('Error al subir datos:', error);
            document.getElementById('spinnerOverlay').style.display = 'none'; // Asegurarse de ocultar el spinner en caso de error
        });
    };

    reader.readAsArrayBuffer(file); // Leer como ArrayBuffer para XLS
});

/*
// NOTIFICADOR DE COMENTARIO EN FACTURACION
document.addEventListener("DOMContentLoaded", function() {
    const statusCard = document.getElementById('statusCard');
    const closeCardButton = document.getElementById('closeCard');
    const countdownElement = document.getElementById('countdown');
    let countdown = 20; // Tiempo en segundos

    // Mostrar la card
    statusCard.style.display = 'block';

    // Actualizar el temporizador cada segundo
    const timerInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timerInterval);
            statusCard.style.display = 'none';
        }
    }, 2000);

    // Cerrar la card al hacer clic en el botón
    closeCardButton.onclick = function() {
        clearInterval(timerInterval);
        statusCard.style.display = 'none';
    };
});
// FIN NOTIFICADOR DE COMENTARIO EN FACTURACION
*/