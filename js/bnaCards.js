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

let allData = [];
let currentPage = 1;
let itemsPerPage = 27; // Número de elementos por página
let currentPageGroup = 0;
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById("searchBna");
const filterSelect = document.getElementById("filter");

document.getElementById('importButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const cardsContainer = document.getElementById('envios-cards');
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
                return row.match(/(".*?"|[^,\r\n]+)(?=\s*,|\s*$)/g) || [];
            });

            const headers = data[0];
            const dataRows = data.slice(1);
            let importedCount = 0;
            let existingCount = 0; // Contador para registros existentes
            let skippedCount = 0; // Contador para registros omitidos por manipulación
            const promises = [];

            dataRows.forEach(row => {
                if (row.length > 0) {
                    const orden = row[2] || null;
                    const nombreCompletoEnvio = row[32] || null;

                    // Verificar si el campo nombre_completo_envio contiene números
                    if (/\d/.test(nombreCompletoEnvio)) {
                        skippedCount++; // Incrementar contador de registros omitidos
                        return; // Saltar este registro y continuar con el siguiente
                    }

                    // Verificar si ya existe en Firebase
                    const envioRef = firebase.database().ref('enviosBNA');
                    promises.push(
                        envioRef.orderByChild('orden_').equalTo(orden).once('value').then(snapshot => {
                            if (!snapshot.exists()) {
                                const envioData = {
                                    fecha_creacion_orden: row[0] || null,
                                    fecha_pago: row[1] || null,
                                    orden_: orden,
                                    orden_publica_: row[3] || null,
                                    suborden_: row[4] || null,
                                    fabricante: row[5] || null,
                                    cantidad: row[6] || null,
                                    gp_sku: row[7] || null,
                                    sku_externo: row[8] || null,
                                    producto_nombre: row[9] || null,
                                    variantes: row[10] || null,
                                    apellido: row[11] || null,
                                    nombre: row[12] || null,
                                    email: row[13] || null,
                                    dni: row[14] || null,
                                    direccion: row[15] || null,
                                    codigo_postal: row[16] || null,
                                    telefono: row[17] || null,
                                    ciudad: row[18] || null,
                                    provincia: row[19] || null,
                                    razon_social: row[20] || null,
                                    cuit: row[21] || null,
                                    email_facturacion: row[22] || null,
                                    direccion_facturacion: row[23] || null,
                                    codigo_postal_facturacion: row[24] || null,
                                    telefono_facturacion: row[25] || null,
                                    ciudad_facturacion: row[26] || null,
                                    provincia_facturacion: row[27] || null,
                                    suborden_total: row[28] || null,
                                    precio_producto: row[29] || null,
                                    precio_venta: row[30] || null,
                                    cupon_nombre: null,
                                    cupon_descuento: null,
                                    nombre_completo_envio: nombreCompletoEnvio,
                                    medio_de_envio: row[33] || null,
                                    numero_de_seguimiento: row[34] || null,
                                    monto_cobrado: row[35] || null,
                                    tipo_del_envio: row[36] || null,
                                    estado_fecha_actualizacion_tipo_de_envio: row[37] || null,
                                    estado_del_envio: row[38] || null,
                                    estado_fecha_actualizacion_envio: row[39] || null,
                                    estado_del_producto: row[40] || null,
                                    estado_fecha_actualizacion_producto: row[41] || null,
                                    liquidado: row[42] || null,
                                    id_cobis: row[43] || null,
                                    total_puntos: row[44] || null,
                                    total_dinero: row[45] || null,
                                    total_con_tasas_1: row[46] || null,
                                    total_con_tasas_2: row[47] || null,
                                    cuotas: row[48] || null,
                                    relacion_de_puntos: row[49] || null,
                                    equivalencia_puntos_pesos: row[50] || null,
                                    iva: row[51] || null,
                                    relacion_de_puntos_sin_iva: row[52] || null,
                                    equivalencia_puntos_sin_iva_pesos: row[53] || null,
                                    brand_name: row[54] || null,
                                    tipo_doc_pago: row[55] || null,
                                    doc_pago: row[56] || null,
                                    nombre_y_apellido_tarjeta: row[57] || null,
                                    numeros_tarjeta: row[58] || null,
                                    bin_tarjeta: row[59] || null,
                                    cupon: row[60] || null,
                                    cod_aut: row[61] || null,
                                    tipo_doc_pago_2: row[62] || null,
                                    doc_pago_2: row[63] || null,
                                    nombre_y_apellido_tarjeta_2: row[64] || null,
                                    numeros_tarjeta_2: row[65] || null,
                                    bin_tarjeta_2: row[66] || null,
                                    cupon_2: row[67] || null,
                                    cod_aut_2: row[68] || null,
                                    decidir_distributed: row[69] || null,
                                    modo_distributed: row[70] || null                        
                                };

                                return envioRef.push().set(envioData).then(() => {
                                    importedCount++;
                                });
                            } else {
                                existingCount++;
                            }
                        })
                    );
                }
            });

            Promise.all(promises)
            .then(() => {
                spinner.remove();
                Swal.fire({
                    title: 'Importación completada',
                    text: `Se han importado ${importedCount} ventas a la base de datos, ${existingCount} ya se encontraban en planilla, ${skippedCount} registros fueron omitidos por contener datos no válidos.`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    location.reload();
                });
            })
            .catch(error => {
                spinner.remove();
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al importar los datos',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
        };

        reader.readAsText(file);
    }
});

function capitalizeWords(str) {
    return str
        .toLowerCase() // Convertir a minúsculas primero
        .split(' ') // Separar en palabras
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalizar cada palabra
        .join(' '); // Unir de nuevo las palabras
}

function lowercaseWords(str) {
    return str.toLowerCase(); // Convertir toda la cadena a minúsculas
}

// CARGAR DATOS DE FIREBASE
function loadEnviosFromFirebase() {
    const cardsContainer = document.getElementById('envios-cards');
    const spinner = document.getElementById('spinner');
    cardsContainer.innerHTML = '';

    spinner.style.display = 'block'; 

    firebase.database().ref('enviosBNA').once('value', function(snapshot) {
        allData = []; // Asegúrate de reiniciar allData
        let sinPrepararCount = 0; // Contador para las tarjetas sin preparar
        let sinFacturarCount = 0;

        snapshot.forEach(function(childSnapshot) {
            const data = childSnapshot.val();
            allData.push({ 
                id: childSnapshot.key, 
                nombre: capitalizeWords(data.nombre_completo_envio), 
                cp: (data.codigo_postal), 
                localidad: capitalizeWords(data.ciudad),
                provincia: capitalizeWords(data.provincia),
                calle: capitalizeWords(data.direccion.replace(/"/g, '')), 
                telefono: (data.telefono),
                email: lowercaseWords(data.email), 
                remito: (data.orden_),
                observaciones: (data.observaciones),
                orden_publica_: (data.orden_publica_),
                brand_name: capitalizeWords(data.brand_name),
                cuotas: (data.cuotas),
                precio_venta: (data.precio_venta),
                suborden_total: (data.suborden_total),
                numeros_tarjeta: (data.numeros_tarjeta),
                orden_publica: (data.orden_publica_),
                sku: (data.sku_externo),
                cantidad: (data.cantidad),
                fechaDeCreacion: (data.fecha_creacion_orden),    
                datoFacturacion: (data.datoFacturacion),
                producto_nombre: capitalizeWords(data.producto_nombre),
                tipoElectrodomesticoBna: (data.tipoElectrodomesticoBna),
                datoFacturacion: (data.datoFacturacion),
                trackingLink: (data.trackingLink),
                transportCompany: (data.transportCompany),
                transportCompanyNumber: (data.transportCompanyNumber),
                razon_social: capitalizeWords(data.razon_social),
                cuit: (data.cuit),
                marcaEntregado: (data.marcaEntregado),
                marcaPreparado: (data.marcaPreparado),
                direccion_facturacion: capitalizeWords(data.direccion_facturacion),
                ciudad_facturacion: capitalizeWords(data.ciudad_facturacion),
                codigo_postal_facturacion: (data.codigo_postal_facturacion),
            });

            // Incrementar el contador si tipoElectrodomesticoBna está vacío
            if (!data.tipoElectrodomesticoBna && data.datoFacturacion) {
                sinPrepararCount++;
            }

            // Incrementar el contador si tipoElectrodomesticoBna está vacío
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
        // Actualizar el contador en el botón
        document.getElementById('contadorCardsFacturar').innerText = sinFacturarCount;

        spinner.remove(); // Ocultar spinner después de cargar los datos
    });
}

function renderCards(data) {
    const cardsContainer = document.getElementById('envios-cards');
    cardsContainer.innerHTML = ''; // Limpiar contenedor de tarjetas

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);

    // Obtener la hora actual en Argentina
    const ahora = new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" });
    const fechaActual = new Date(ahora);

    for (let i = startIndex; i < endIndex; i++) {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-3';

        // Verificar si transportCompany es "Andesmar"
        const isAndesmar = data[i].transportCompany === "Andesmar";
        const isAndreani = data[i].transportCompany === "Andreani"
        const isLogPropia = data[i].transportCompany === "Logistica Propia"

        // Verificar si datoFacturacion existe
        const hasDatoFacturacion = data[i].datoFacturacion !== undefined && data[i].datoFacturacion !== null;


        // Lógica para calcular el estado de facturación
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
        const tipoFactura = (cuit.length === 7 || cuit.length === 8) ? 'FACTURA B' : 'FACTURA A';

        // Agregar el mensaje a la tarjeta
        const mensajeElement = document.createElement('p');
        mensajeElement.textContent = mensajeFactura;
        card.appendChild(mensajeElement);

        const ordenPublica = data[i].orden_publica.replace(/-/g, '');
        const cupon = ordenPublica.substring(0, 13); 
        const autorizacion = ordenPublica.substring(ordenPublica.length - 4); 
        
        // Agregar la tarjeta al contenedor
        cardsContainer.appendChild(card);

        card.innerHTML = `
                    <div class="card">
                        <div class="card-body">

                           <div class="em-circle-state5">
                            ${data[i].cuotas === "30" ? '⚠️ bnapromo2' : data[i].cuotas === "12" || "6"|| "1" ? '⚠️ bnapromo' : '*'}
                            </div>

                            <div id="estadoEnvio${data[i].id}" class="${(isAndreani || isAndesmar || isLogPropia) ? 'em-circle-state4' : 'em-circle-state3'}">
                            ${(isAndreani || isAndesmar || isLogPropia) ? 'Preparado' : 'Pendiente'}
                            </div>

                            <div class="em-state-bna"><img id="TiendaBNA" src="./Img/bna-logo.png"></div>
                            <h5 class="card-title"><i class="bi bi-person-bounding-box"></i> ${data[i].nombre}</h5>
                                                <div class="d-flex align-items-center">
                            
                            <p class="card-text cpLocalidadBna mb-0 me-2">
                            ${data[i].cp}, ${data[i].localidad}, ${data[i].provincia}
                            </p>
    
                            <button class="btn btn-sm btn-" style="color: #007bff;" id="edit-localidad-${data[i].id}">
                            <i class="bi bi-pencil-square ios-icon2"></i>
                            </button>
                    </div>

                    <div id="edit-input-${data[i].id}" style="display: none;">
                        <input type="text" id="localidad-input-${data[i].id}" placeholder="Buscar localidad" class="form-control" autocomplete="off">
                        <ul id="suggestions-${data[i].id}" class="suggestions-container list-group"></ul>
                    </div>

                <div id="direccion-bna" class="ios-card">
                    <p class="ios-card-text">
                                       <i class="bi bi-house ios-icon"></i> Calle: ${data[i].calle}
                        <button class="btn btn-link" onclick="navigator.clipboard.writeText('${data[i].calle}')">
                            <i class="bi bi-clipboard icon-gray"></i>
                        </button>
                    </p>
                    <p class="ios-card-text">
                        <i class="bi bi-telephone ios-icon"></i> Teléfono: ${data[i].telefono}
                        <button class="btn btn-link" onclick="navigator.clipboard.writeText('${data[i].telefono}')">
                            <i class="bi bi-clipboard icon-gray"></i>
                        </button>
                    </p>
                    <p class="ios-card-text">
                        <i class="bi bi-envelope ios-icon"></i> ${data[i].email}
                        <button class="btn btn-link" onclick="navigator.clipboard.writeText('${data[i].email}')">
                            <i class="bi bi-clipboard icon-gray"></i>
                        </button>
                    </p>
                </div>

                            <div class="d-flex align-items-center contenedorRemito">

                            <p class="orden">${data[i].remito}</p>
                            <div class="button-container d-block mt-2">
                                <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2 ios-icon2">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                                <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2 ios-icon2" onclick="window.open('https://api.avenida.com/manage/shops/2941/orders/${data[i].orden_publica_}', '_blank');">
                                    <i class="bi bi-bag-check"></i>
                                </button>
                            </div>

                            <div class="d-flex flex-column ms-2 text-center"> <!-- Contenedor para apilar los switches -->
    
                            <div class="form-check form-switch"> 
                            <input class="form-check-input" type="checkbox" id="preparacion-${data[i].id}" ${data[i].marcaPreparado === 'Si' ? 'checked' : ''}>
                            <label class="form-check-label" for="preparacion-${data[i].id}"><strong>1</strong> Preparación</label>
                            </div>

                            <div class="form-check form-switch"> 
                            <input class="form-check-input" type="checkbox" id="entregado-${data[i].id}-1" ${data[i].marcaEntregado === 'Si' ? 'checked' : ''}>
                            <label class="form-check-label" for="entregado-${data[i].id}-1"><strong>2</strong> Entregado</label>
        
                            </div>

                            </div>


                            </div>

                            <p class="numeroDeEnvioGeneradoBNA" id="numeroDeEnvioGeneradoBNA${data[i].id}">
                                ${isLogPropia ? 
                                'Logística Propia' : 
                                (isAndreani ? 
                                `<a href="${data[i].trackingLink}" target="_blank">Andreani: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                (isAndesmar ? 
                                `<a href="${data[i].trackingLink}" target="_blank">Andesmar: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                                'Número de Envío Pendiente'))}
                            </p>

                            <div class="factura-status em-circle-state-time ${isParaFacturar ? 'facturable' : ''}" id="factura-status-${data[i].id}">
                                ${mensajeFactura}
                            </div>

                            <!-- Botón para mostrar/ocultar el detalle del producto -->
                            <button class="btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetalleProducto-${data[i].id}" aria-expanded="false" aria-controls="collapseDetalleProducto-${data[i].id}">
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
                             </div>
                            </div>

                            <!-- Botón para mostrar/ocultar el detalle de Facturacion -->
                            <button class="btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetalleFacturacion-${data[i].id}" aria-expanded="false" aria-controls="collapseDetalleFacturacion-${data[i].id}">
                                                           <i class="bi bi-chevron-down"></i> Detalle de Facturacion <i class="bi bi-receipt"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetalleFacturacion-${data[i].id}">
                             <div class="facturacion descripcion-div p-2 mt-2"">

                            <p class="card-text-facturacion">
                            <strong>Tipo:</strong> ${tipoFactura}
                            </p>

                            <p class="card-text-facturacion">
                                <strong>Nombre / Razon social:</strong> ${data[i].razon_social}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].razon_social}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>D.N.I. / CUIT:</strong> ${data[i].cuit}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].cuit}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>Direccion:</strong> ${data[i].direccion_facturacion}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].direccion_facturacion}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>Localidad:</strong> ${data[i].ciudad_facturacion}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].ciudad_facturacion}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>
                            <p class="card-text-facturacion">
                                <strong>CP:</strong> ${data[i].codigo_postal_facturacion}
                                <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].codigo_postal_facturacion}')">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                            </p>

                             </div>
                            </div>

                            <!-- Botón para mostrar/ocultar el detalle del Pago -->
                            <button class="btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetallePago-${data[i].id}" aria-expanded="false" aria-controls="collapseDetallePago-${data[i].id}">
                                <i class="bi bi-chevron-down"></i> Detalle de Pago <i class="bi bi-credit-card"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetallePago-${data[i].id}">
                                <div class="pago p-2 mt-2 mb-2"">
                                    <p class="card-text-pago"><strong>Entidad: ${data[i].brand_name || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Cuotas:</strong> ${data[i].cuotas || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Número de Tarjeta:</strong> **** **** **** ${data[i].numeros_tarjeta}</p>
                                    

                                <p class="card-text-pago">
                           <strong>Precio de Venta:</strong> $ ${(data[i].precio_venta * data[i].cantidad).toFixed(2)}
                           <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].precio_venta * data[i].cantidad).toFixed(2)}')">
                                                      <i class="bi bi-clipboard"></i>
                           </button>
                               </p>

                       <p class="card-text-pago">
                           <strong>Cantidad:</strong> <strong class="strong-costo2">${data[i].cantidad} U.</strong>
                       </p>
                       
                       <p class="card-text-pago">
                           <strong>Valor por producto:</strong> <strong class="strong-costo">$ ${data[i].precio_venta}</strong>
                           <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${data[i].precio_venta}')">
                               <i class="bi bi-clipboard"></i>
                           </button>
                       </p>

                       <p class="card-text-pago">
                           <strong>Costo de Envío:</strong> <strong class="strong-costo">$ ${(data[i].suborden_total - (data[i].precio_venta * data[i].cantidad))}</strong>
                           <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${(data[i].suborden_total - (data[i].precio_venta * data[i].cantidad)).toFixed(2)}')">
                               <i class="bi bi-clipboard"></i>
                           </button>
                       </p>

                        <p class="card-text-pago">
                        <strong>Total:</strong> ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(data[i].suborden_total)}
                        </p>

                            <!-- Contenedor gris con CUPON y AUTORIZACION -->
                            <div class="bg-light p-3 mb-2 rounded" style="border: solid 1px #dc3545;">
                            <div class="mb-3 text-center">
                            <strong class="text-primary">CUPON:</strong>
                            <div class="d-flex justify-content-center align-items-center">
                            <span class="me-2">${cupon}</span>
                            
                            <button class="btn btn-link btn-sm" onclick="navigator.clipboard.writeText('${cupon}')">
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
                                    
                                    
                                    <button id="marcar-facturado-${data[i].id}" type="button" class="btn ${hasDatoFacturacion ? 'btn-success' : 'btn-danger'} w-100" ${hasDatoFacturacion ? 'disabled' : ''} onclick="${hasDatoFacturacion ? '' : `marcarFacturado('${data[i].id}')`}">${hasDatoFacturacion ? data[i].datoFacturacion : 'Marcar Facturado'} 
                                        <i class="bi bi-lock-fill icono"></i>
                                    </button>

                                </div>
                            </div>
        
                            <button class="btn btn-secondary btn-sm w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseObservaciones-${data[i].id}" aria-expanded="false" aria-controls="collapseObservaciones-${data[i].id}">
                                <i class="bi bi-chevron-down"></i> Notas <i class="bi bi-sticky-fill"></i>
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

                                <select class="tipoElectrodomesticoBna" id="tipoElectrodomesticoBna-${data[i].id}" name="TipoElectrodomestico" onchange="rellenarMedidas(this, '${data[i].id}')">
                        <option value="">Seleccione un producto</option>
                        <option value="heladera">Heladera</option>
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
                    </select>     
        
                            <div class="medidas"></div> <!-- Div para las medidas -->

                            <!-- Botón Logística Propia --> 
                            <button class="mt-1 btn btnLogPropiaMeli ${isLogPropia ? 'btn-success' : 'btn-secondary'}"
                                id="LogPropiaMeliButton${data[i].id}" 
                                onclick="generarPDF('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${data[i].producto_nombre}')">
                                <span>
                                    ${isLogPropia ? `<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta Novogar` : `<i class="bi bi-file-text"></i> Etiqueta Novogar`}
                                </span>
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerLogPropia${data[i].id}" style="display:none;"></span>
                            </button>
        
                            <!-- Botón Andesmar -->          
                            <button class="mt-1 btn ${isAndesmar ? 'btn-success' : 'btn-primary'}" 
                            id="andesmarButton${data[i].id}" 
                            ${isAndreani ? 'disabled' : ''} 
                            ${isAndesmar ? `onclick="window.open('https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data[i].transportCompanyNumber}', '_blank')"` : `onclick="enviarDatosAndesmar('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${data[i].suborden_total}', '${cleanString(data[i].producto_nombre)}')`}">
                            <span id="andesmarText${data[i].id}">
                            ${isAndesmar ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data[i].transportCompanyNumber}` : `<i class="bi bi-file-text"></i> Etiqueta Andesmar`}
                            </span>
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data[i].id}"></span>
                            </button>

                            <!-- Botón Andreani --> 
                            <button class="mt-1 btn btnAndreaniMeli ${isAndreani ? 'btn-success' : 'btn-danger'}"
                            id="andreaniButton${data[i].id}" 
                            ${isAndesmar ? 'disabled' : ''} 
                            onclick="${isAndreani ? `handleButtonClick('${data[i].transportCompanyNumber}', '${data[i].id}')` : `enviarDatosAndreani('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${cleanString(data[i].producto_nombre)}')`}" >
                            <span id="andreaniText${data[i].id}">
                            ${isAndreani ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data[i].transportCompanyNumber}` : `<i class="bi bi-file-text"></i> Etiqueta Andreani`}
                            </span>
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani${data[i].id}" style="display:none;"></span>
                            </button>

                            <div id="resultado${data[i].id}" class="mt-2 errorMeli"></div>
                        </div>
                    </div>
                `;

                // Elimina Comillas en el nombre de los productos
                function cleanString(value) {
                    return value.replace(/["']/g, "");
                }
                
// Evento para manejar el cambio del switch "Entregado"
document.getElementById(`entregado-${data[i].id}-1`).addEventListener('change', function() {
    const nuevoEstado = this.checked ? 'Si' : 'No';

    // Actualizar en Firebase
    firebase.database().ref('enviosBNA/' + data[i].id).update({
        marcaEntregado: nuevoEstado
    }).then(() => {
        console.log(`Estado de entrega actualizado a: ${nuevoEstado}`);
    }).catch(error => {
        console.error("Error al actualizar el estado de entrega: ", error);
    });
});

// Evento para manejar el cambio del switch "Preparación"
document.getElementById(`preparacion-${data[i].id}`).addEventListener('change', function() {
    const nuevoEstado = this.checked ? 'Si' : 'No';

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
            // Si la contraseña es correcta, actualizar en Firebase
            firebase.database().ref('enviosBNA/' + data[i].id).update({
                marcaPreparado: nuevoEstado
            }).then(() => {
                console.log(`Estado de preparación actualizado a: ${nuevoEstado}`);
            }).catch(error => {
                console.error("Error al actualizar el estado de preparación: ", error);
            });
        } else {
            // Revertir el estado del switch si se cancela o la contraseña es incorrecta
            this.checked = !this.checked;
        }
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
                if (hasDatoFacturacion) {
                    facturaStatusDiv.innerHTML = '<i class="bi bi-check-circle" style="margin-right: 5px;"></i> Facturado'; 
                    facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
                    facturaStatusDiv.classList.remove('facturable'); 
                    facturaStatusDiv.classList.add('em-circle-state-time-facturado'); 
                } else {
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

function marcarFacturado(id) {

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
    }).then((result) => {
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
                mensajeFactura = 'Facturado ✅';
                facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
                facturaStatusDiv.classList.add('em-circle-state-time-facturado'); 
            } else if (clave === '1111') {
                contenidoBoton = `Facturado Leo ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = 'Facturado ✅';
                facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
                facturaStatusDiv.classList.add('em-circle-state-time-facturado'); 
            } else if (clave === '1112') {
                contenidoBoton = `Facturado Julian ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = 'Facturado ✅';
                facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
                facturaStatusDiv.classList.add('em-circle-state-time-facturado'); 
            } else if (clave === '1113') {
                contenidoBoton = `Facturado Mauricio ${horaFormateada} ${fechaFormateada}`;
                mensajeFactura = 'Facturado ✅';
                facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
                facturaStatusDiv.classList.add('em-circle-state-time-facturado'); 
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
            const estadoFacturaDiv = document.getElementById(`factura-status-${id}`);
            estadoFacturaDiv.textContent = mensajeFactura;
            estadoFacturaDiv.classList.add('facturado-bna'); // Agregar la clase

            // Pushear en Firebase
            const ref = firebase.database().ref(`enviosBNA/${id}/datoFacturacion`);
            ref.set(contenidoBoton).then(() => {
                Swal.fire('Datos guardados correctamente', '', 'success');
            }).catch((error) => {
                console.error('Error al guardar en Firebase:', error);
                Swal.fire('Error al guardar datos', '', 'error');
            });
        }
    });
}

async function pedirContraseña() {
    const { value: password } = await Swal.fire({
        title: 'Ingrese la contraseña 🔒',
        input: 'password',
        inputLabel: 'Contraseña de logística (Solicitela al administrador)',
        inputPlaceholder: 'Ingrese la contraseña',
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar'
    });

    // Verificar si la contraseña es correcta
    if (password !== '6572') {
        Swal.fire({
            icon: 'error',
            title: 'Contraseña incorrecta',
            text: 'La contraseña ingresada es incorrecta. Intente nuevamente.',
            confirmButtonText: 'OK'
        });
        return false; // Retornar false si la contraseña es incorrecta
    }
    return true; // Retornar true si la contraseña es correcta
}

const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

async function enviarDatosAndesmar(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, suborden_total, precio_venta, producto_nombre) {
    const contraseñaCorrecta = await pedirContraseña();
    if (!contraseñaCorrecta) {
        return; // Salir de la función si la contraseña es incorrecta
    }

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

    const alto = document.getElementById(`alto-${id}`).value;
    const ancho = document.getElementById(`ancho-${id}`).value;
    const largo = document.getElementById(`largo-${id}`).value;
    const cantidad = document.getElementById(`cantidad-${id}`).value;
    const peso = document.getElementById(`peso-${id}`).value;

    const button = document.getElementById(`andesmarButton${id}`);
    const spinner = document.getElementById(`spinnerAndesmar${id}`);
    const text = document.getElementById(`andesmarText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);

    // Comprobar si los elementos existen y asignar null si no existen
    const altoInterior = document.getElementById(`altoInterior-${id}`) ? document.getElementById(`altoInterior-${id}`).value : null;
    const anchoInterior = document.getElementById(`anchoInterior-${id}`) ? document.getElementById(`anchoInterior-${id}`).value : null;
    const largoInterior = document.getElementById(`largoInterior-${id}`) ? document.getElementById(`largoInterior-${id}`).value : null;
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

    // Calcular la cantidad de bultos
    let bultos = cantidad;
    if (isSplit) {
        bultos *= 2; // Duplicar bultos si es un split
    }

    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';
    buttonAndr.disabled = true;

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
        NroRemito: "BNA" + remito,
        Bultos: bultos, 
        Peso: peso * cantidad, 
        ValorDeclarado: precio_venta * cantidad, 
        M3: volumenM3,
        Alto: [],
        Ancho: [],
        Largo: [],
        Observaciones: `${calle}, Telefono: ${telefono}, Electrodomestico: ${producto_nombre}`,
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

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";

    console.log(`Datos enviados a API Andesmar (BNA+ ${remito}):`, requestObj); // Mostrar request en consola

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
        console.log(`Datos Respuesta API Andesmar (BNA+ ${remito}):`, data); // Mostrar response en consola

        if (data.NroPedido) {
            const Name = `Confirmación de Envio BNA`;
            const Subject = `Tu compra BNA+ ${remito} ya fue preparada para despacho`;
            const template = "emailTemplateAndesmar";
            const transporte = "Andesmar Cargas";
            const linkEtiqueta = `https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            const linkSeguimiento = `https://andesmarcargas.com/seguimiento.html?numero=BNA${remito}&tipo=remito&cod=`;
            const linkSeguimiento2 = `https://andesmarcargas.com/seguimiento.html?numero=BNA${remito}&tipo=remito&cod=`;

            
            // Actualizar el texto del botón
            text.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.onclick = () => window.open(linkEtiqueta, '_blank');
            NroEnvio.innerHTML = `<a href="${linkSeguimiento}" target="_blank">Andesmar: ${data.NroPedido} <i class="bi bi-box-arrow-up-right"></i></a>`;
            
            // Pushear datos a Firebase
            const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
            const transportData = {
                transportCompany: "Andesmar",
                trackingLink: linkSeguimiento,
                transportCompanyNumber: data.NroPedido
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
                remito: `BNA${remito}`, 
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

            // Enviar el email después de procesar el envío
            await sendEmail(Name, Subject, template, nombre, email, remito, linkSeguimiento2, transporte);
        } else {
            buttonAndr.disabled = false;
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`; 
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
        }
    } catch (error) {
        buttonAndr.disabled = false;
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

async function enviarDatosAndreani(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, precio_venta, producto_nombre) {
    
    const contraseñaCorrecta = await pedirContraseña();
    if (!contraseñaCorrecta) {
        return; // Salir de la función si la contraseña es incorrecta
    }

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

    const button = document.getElementById(`andesmarButton${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const spinnerAndr = document.getElementById(`spinnerAndreani${id}`);
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

    // Mostrar spinner y cambiar texto
    spinnerAndr.style.display = 'inline-block';
    textAndr.innerText = 'Generando Etiqueta...';
    button.disabled = true

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

// Ajustar la cantidad de bultos
const cantidadBultos = isSplit ? cantidad * 2 : cantidad;
const VolumenTotalFinal = isSplit ? volumenCm3 / 2 : volumenCm3 / cantidad;

for (let i = 0; i < cantidadBultos; i++) {
    bultos.push({
        "kilos": peso / cantidadBultos,
        "largoCm": null,
        "altoCm": null,
        "anchoCm": null,
        "volumenCm": VolumenTotalFinal,
        "valorDeclaradoSinImpuestos": precioSinIVA,
        "valorDeclaradoConImpuestos": precioVentaRedondeado,
        "referencias": [
            { "meta": "detalle", "contenido": producto_nombre },
            { "meta": "idCliente", "contenido": `${remito}-BNA`.toUpperCase() },
            { "meta": "observaciones", "contenido": calle + ",Telefono: " + telefono + " " + "Electrodomestico: " + producto_nombre }
        ]
    });
}

    const requestData = {
        "contrato": volumenCm3 > 100000 ? "351002753" : "400017259",
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

    console.log(`Datos enviados a API ANDREANI (BNA+ ${remito}):`, requestData);

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

            console.log(`Datos Respuesta API ANDREANI (BNA+ ${remito}):`, response);

            const Name = `Confirmación de Envio BNA`;
            const Subject = `Tu compra BNA+ ${remito} ya fue preparada para despacho`;
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
            };
            
              db.ref(`enviosBNA/${id}`).update(transportData)
                .then(() => {
                    console.log("Datos actualizados en Firebase como Andreani:", transportData);
                })
                .catch((error) => {
                                console.error("Error al actualizar datos en Firebase:", error);
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
            button.disabled = false
        }
    } catch (error) {
        console.error('Error al generar la etiqueta:', error);

        button.innerText = "Error Andreani ⚠️"; 
        resultadoDiv.innerText = `Error Andreani: (Puede no existir el CP o Localidad en Andreani) ${error.message}`; 
        buttonAndr.disabled = true;
        button.disabled = false
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
        buttonAndr.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${numeroDeEnvio}`;
        buttonAndr.classList.remove('btn-secondary');
        buttonAndr.classList.add('btn-success');
        buttonAndr.onclick = () => window.open(pdfUrl, '_blank');
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
        case "cocina":
            alto = 85; 
            ancho = 60; 
            largo = 60; 
            peso = 50; 
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
            <input type="number" id="cantidad-${id}" name="Cantidad" class="form-control-medidas" step="1" value="1" min="1" required>
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
                    <input type="number" id="cantidadInterior-${id}" name="CantidadInterior" class="form-control-medidas" step="1" value="1" min="1" required disabled>
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

// SIN PREPARAR BOTON
document.getElementById('btnPreparar').addEventListener('click', () => {
    const sinPrepararCards = allData.filter(item => 
        !item.tipoElectrodomesticoBna && item.datoFacturacion
    ).reverse();
    
    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('envios-cards');
    cardsContainer.innerHTML = '';

    // Renderizar solo las tarjetas sin preparar
    renderCards(sinPrepararCards);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData); // Regresar a todas las tarjetas
    });
});
// FIN SIN PREPARAR BOTON

// SIN FACTURAR BOTON
document.getElementById('btnFacturar').addEventListener('click', () => {
    const sinFacturarCards = allData.filter(item => !item.datoFacturacion).reverse(); // Invertir el orden de los elementos filtrados
    
    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('envios-cards');
    cardsContainer.innerHTML = '';
    
    // Ocultar la paginación
    paginationContainer.style.display = 'none';

    // Renderizar solo las tarjetas sin facturar
    renderCards(sinFacturarCards);

    // Crear botón de volver
    createBackButton(() => {
        // Mostrar la paginación nuevamente
        paginationContainer.style.display = 'block';
        renderCards(allData); // Regresar a todas las tarjetas
    });
});
// FIN SIN FACTURAR BOTON

// SWITCH BOTÓN 2
document.getElementById('btnSwitch').addEventListener('click', () => {
    const sinEntregarCards = allData
        .filter(item => item.marcaEntregado === 'No' || item.marcaEntregado === undefined)
        .reverse(); // Invertir el orden de los elementos filtrados

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('envios-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación
    paginationContainer.style.display = 'none';

    // Renderizar solo las tarjetas sin entregar
    renderCards(sinEntregarCards);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData); // Regresar a todas las tarjetas
    });
});
// FIN SWITCH BOTÓN 2

// SWITCH BOTÓN 1
document.getElementById('btnSwitch1').addEventListener('click', () => {
    const sinPrepararCards = allData
        .filter(item => item.marcaPreparado === 'No' || item.marcaPreparado === undefined)
        .reverse(); // Invertir el orden de los elementos filtrados

    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('envios-cards');
    cardsContainer.innerHTML = '';

    // Ocultar la paginación
    paginationContainer.style.display = 'none';

    // Renderizar solo las tarjetas sin entregar
    renderCards(sinPrepararCards);

    // Crear botón de volver
    createBackButton(() => {
        renderCards(allData); // Regresar a todas las tarjetas
    });
});
// FIN SWITCH BOTÓN

// VOLVER ATRAS
function createBackButton() {
    // Verificar si ya existe el botón de volver
    if (document.getElementById('btnVolver')) return;

    const backButton = document.createElement('button');
    backButton.id = 'btnVolver';
    backButton.type = 'button';
    backButton.className = 'btn btn-dark';
    backButton.innerHTML = '<i class="bi bi-arrow-return-left"></i>';

    // Agregar evento al botón de volver
    backButton.addEventListener('click', () => {
        location.reload(); // Recargar la página al hacer clic
    });

    // Agregar el botón al principio del contenedor de botones
    const container = document.querySelector('.trio-de-botones');
    container.insertBefore(backButton, container.firstChild);
}
// FIN VOLVER ATRAS

// BUSCADOR
searchInput.addEventListener("input", function() {
    const searchTerm = searchInput.value.toLowerCase();
    
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
        document.getElementById("envios-cards").innerHTML = `
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
});
// FIN BUSCADOR

// GENERAR ETIQUETA LOGISTICA PROPIA
async function generarPDF(id, nombre, cp, localidad, provincia, remito, calle, numero, telefono, email, precio_venta, producto_nombre) {
    let button = document.getElementById(`LogPropiaMeliButton${id}`);
    let spinner = document.getElementById(`spinnerLogPropia${id}`);

    let spinner2 = document.getElementById("spinner2");

    const Name = `Confirmación de Envio BNA`;
    const Subject = `Tu compra BNA+ ${remito} ya fue preparada para despacho`;
    const template = "emailTemplateLogPropia";
    
    // Mostrar spinner y cambiar texto del botón
    spinner.style.display = "inline-block"; // Usar inline-block en lugar de flex para el spinner
    button.innerHTML = '<i class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i> Generando...';
    button.disabled = true; // Desactivar el botón

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
                margin: 10px;
                padding: 0;
                display: grid;
                place-items: center;
                height: 100vh;
                background-color: #f0f0f0;
            }
            .etiqueta {
                width: 10cm;
                margin: 5px;
                height: auto;
                max-height: 15cm;
                border: 2px dashed #000;
                border-radius: 10px;
                padding: 1cm;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                font-family: Arial, sans-serif;
                background-color: #fff;
            }
            .logo {
                text-align: center;
                margin-bottom: 15px;
            }
            .logo img {
                max-width: 250px;
                height: auto;
                display: block;
                margin: 0 auto;
            }
            .campo {
                border-radius: 10px;
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                padding: 8px;
                border: 2px solid #ccc;
                background-color: #f9f9f9;
            }
            .campo i {
                margin-right: 8px;
                font-size: 1.2em;
                color: #000;
            }
            .campo span {
                font-size: 1em;
                font-weight: bold;
                color: #333;
            }
            .footer {
                text-align: center;
                font-size: 0.9em;
                color: #000;
                margin-top: auto;
                padding-top: 10px;
                border-top: 2px solid #ccc;
            }
            .contacto {
                font-size: 0.8em;
                color: #333;
                margin-top: 10px;
                text-align: center;
            }
            .contacto p {
                margin: 3px 0;
            }
            .campo-extra {
                border-radius: 8px;
                margin-top: 10px;
                border: 2px dashed #ccc;
                padding: 5px;
                text-align: center;
                font-size: 0.9em;
                color: #555;
            }
        </style>
    </head>
    <body>
        <div class="etiqueta">
            <div class="logo">
                <img src="./Img/BNA-Novogar.png" alt="Logo">
            </div>
            <div class="campo">
                <i class="bi bi-person-square"></i>
                <span>Orden: ${remito}, Cliente: ${nombre}</span>
            </div>
            <div class="campo">
                <i class="bi bi-geo-alt-fill"></i>
                <span>${cp}, ${localidad}, ${provincia}</span>
            </div>
            <div class="campo">
                <i class="bi bi-compass"></i>
                <span>Dirección: ${calle}</span>
            </div>
            <div class="campo">
                <i class="bi bi-telephone-outbound-fill"></i>
                <span>Teléfono: ${telefono}</span>
            </div>
            <div class="campo-extra">
                <p><strong>Firma:</strong>  ________________________</p>
            </div>
            <div class="campo-extra">
                <p><strong>Aclaración:</strong>  ________________________</p>
            </div>
            <div class="campo-extra">
                <p><strong>DNI:</strong>  ________________________</p>
            </div>
            <div class="contacto">
                <p>Ante cualquier inconveniente, contáctese con posventa:</p>
                <p><strong><i class="bi bi-chat-dots-fill"></i></strong> (0341) 6680658 (Solo WhatsApp)</p>
                <p><i class="bi bi-envelope-check-fill"></i> posventa@novogar.com.ar</p>
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

    // Pushear datos a Firebase
    const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
    const transportData = {
        transportCompany: "Logistica Propia",
    };

    const NroEnvio = document.getElementById(`numeroDeEnvioGeneradoBNA${id}`);
    NroEnvio.innerHTML = `Logistica Propia`;
    
      db.ref(`enviosBNA/${id}`).update(transportData)
        .then(() => {
            console.log("Datos actualizados en Firebase como Logistica Propia:", transportData);
        })
        .catch((error) => {
                        console.error("Error al actualizar datos en Firebase:", error);
        });

        const envioState = document.getElementById(`estadoEnvio${id}`);
        envioState.className = 'em-circle-state4';
        envioState.innerHTML = `Preparado`;

        // Crear un enlace para abrir el PDF en una nueva ventana
        const pdfUrl = URL.createObjectURL(pdfBlob);

        setTimeout(() => {
            spinner2.style.display = "none";
            // Ocultar el spinner y restaurar el botón
            spinner.style.display = "none";
            window.open(pdfUrl, '_blank');
            button.innerHTML = '<i class="bi bi-file-text"></i> Etiqueta Novogar';
            button.disabled = false;
        }, 2000);

        document.body.removeChild(tempDiv);
    });

    await sendEmail(Name, Subject, template, nombre, email, remito,);
}
// FIN GENERAR ETIQUETA LOGISTICA PROPIA

// Llamar a la función cuando se carga la página
window.onload = loadEnviosFromFirebase;
