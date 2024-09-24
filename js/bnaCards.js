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
let itemsPerPage = 12; // Número de elementos por página
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
            const promises = [];
    
            dataRows.forEach(row => {
                if (row.length > 0) {
                    const orden = row[2] || null;
    
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
                                    nombre_completo_envio: row[32] || null,
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
                    text: `Se han importado ${importedCount} ventas a la base de datos, ${existingCount} ya se encontraban en planilla`,
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
                trackingLink: (data.trackingLink),
                transportCompany: (data.transportCompany),
                transportCompanyNumber: (data.transportCompanyNumber),
            });

            // Incrementar el contador si tipoElectrodomesticoBna está vacío
            if (!data.tipoElectrodomesticoBna) {
                sinPrepararCount++;
            }
        });

        // Renderizar las tarjetas y la paginación
        allData.reverse();
        renderCards(allData);
        updatePagination(allData.length);
        
        // Actualizar el contador en el botón
        document.getElementById('contadorCards').innerText = sinPrepararCount;

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
        const isAndreani = data[i].transportCompany === "Andreani";

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
            const horasRestantes = Math.floor((tiempoRestante / (1000 * 60 * 60)) % 24);
            const minutosRestantes = Math.floor((tiempoRestante / (1000 * 60)) % 60);
            mensajeFactura = `Falta ${horasRestantes} horas y ${minutosRestantes} minutos`;
        }

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
                            <div id="estadoEnvio${data[i].id}" class="${isAndreani || isAndesmar ? 'em-circle-state4' : 'em-circle-state3'}">
                            ${isAndreani || isAndesmar ? 'Preparado' : 'Pendiente'} <i class="bi bi-stopwatch-fill"></i>
                            </div>

                            <div class="em-state-bna"><img id="Tienda BNA" src="./Img/tienda-bna.jpg"></div>
                            <h5 class="card-title"><i class="bi bi-person-bounding-box"></i> ${data[i].nombre}</h5>
                            <p class="card-text cpLocalidad"><i class="bi bi-geo-alt"></i> ${data[i].cp}, ${data[i].localidad}, ${data[i].provincia}</p>
                            <p class="card-text"><i class="bi bi-house"></i> Calle: ${data[i].calle}</p>
                            <p class="card-text"><i class="bi bi-telephone"></i> Teléfono: ${data[i].telefono}</p>
                            <p class="card-text"><i class="bi bi-envelope"></i> ${data[i].email}</p>
                            <div class="d-flex align-items-center contenedorRemito">
                                <p class="card-text remitoCard">${data[i].remito}</p>
                                <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;">
                                    <i class="bi bi-clipboard"></i>
                                </button>
                                <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;" onclick="window.open('https://api.avenida.com/manage/shops/2941/orders/${data[i].orden_publica_}', '_blank');">
                                    <i class="bi bi-bag-check"></i>
                                </button>

                            </div>
        
                            <p class="numeroDeEnvioGeneradoBNA" id="numeroDeEnvioGeneradoBNA${data[i].id}">
                            ${isAndreani ? 
                            `<a href="${data[i].trackingLink}" target="_blank">Andreani: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                            (isAndesmar ? 
                            `<a href="${data[i].trackingLink}" target="_blank">Andesmar: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 
                            'Número de Envío Pendiente')}
                            </p>

        
                            <div class="alert alert-success d-none" id="alert-${data[i].id}" role="alert">
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

                            <!-- Botón para mostrar/ocultar el detalle del producto -->
                            <button class="btn btn-outline-secondary btn-sm mt-2 w-100 mb-1" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDetalleProducto-${data[i].id}" aria-expanded="false" aria-controls="collapseDetalleProducto-${data[i].id}">
                                                           <i class="bi bi-chevron-down"></i> Detalle de Producto <i class="bi bi-cart-check"></i>
                            </button>

                            <!-- Contenido del colapso -->
                            <div class="collapse" id="collapseDetalleProducto-${data[i].id}">
                             <div class="pago descripcion-div p-2 mt-2"">
                                <p class="card-text-pago"><i class="bi bi-box-seam"></i> <strong>SKU:</strong> <strong>${data[i].sku}</strong>, Cantidad: ${data[i].cantidad}</p>
                                <p class="card-text-pago"><i class="bi bi-card-text"></i> <strong>Descripción:</strong> ${data[i].producto_nombre}</p>
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
                                    <p class="card-text-pago"><strong>Precio de Venta:</strong> $ ${data[i].precio_venta}</p>
                                    <p class="card-text-pago"><strong>Costo de Envío:</strong> $ ${(data[i].suborden_total - data[i].precio_venta)}</p>
                                    <p class="card-text-pago"><strong>Total:</strong> $ ${data[i].suborden_total}</p>

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
        
                                        <!-- Botón Andesmar -->
                            <button class="mt-1 btn ${isAndesmar ? 'btn-success' : 'btn-primary'}" 
                            id="andesmarButton${data[i].id}" 
                            ${isAndreani ? 'disabled' : ''} 
                            ${isAndesmar ? `onclick="window.open('https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data[i].transportCompanyNumber}', '_blank')"` : `onclick="enviarDatosAndesmar('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].remito}', '${data[i].calle}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${data[i].producto_nombre}')"`}>
                            <span id="andesmarText${data[i].id}">
                            ${isAndesmar ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data[i].transportCompanyNumber}` : `<i class="bi bi-file-text"></i> Etiqueta Andesmar`}
                            </span>
                            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data[i].id}"></span>
                            </button>


                        <button class="mt-1 btn btnAndreaniMeli ${isAndreani ? 'btn-success' : 'btn-danger'}"
        id="andreaniButton${data[i].id}" 
        ${isAndesmar ? 'disabled' : ''} 
        onclick="${isAndreani ? `handleButtonClick('${data[i].transportCompanyNumber}', '${data[i].id}')` : `enviarDatosAndreani('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].provincia}', '${data[i].remito}', '${data[i].calle}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}', '${data[i].precio_venta}', '${data[i].producto_nombre}')`}" >
     <span id="andreaniText${data[i].id}">
        ${isAndreani ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data[i].transportCompanyNumber}` : `<i class="bi bi-file-text"></i> Etiqueta Andreani`}
        </span>
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="spinnerAndreani${data[i].id}" style="display:none;"></span>
</button>

                            <div class="factura-status em-circle-state-time" id="factura-status-${data[i].id}">${mensajeFactura}</div>


                            <div id="resultado${data[i].id}" class="mt-2 errorMeli"></div>
                        </div>
                    </div>
                `;

                // Lógica para determinar el mensaje estado de Facturacion
                const facturaStatusDiv = document.getElementById(`factura-status-${data[i].id}`);
                if (hasDatoFacturacion) {
                    facturaStatusDiv.innerHTML = 'Facturado ✅'; 
                    facturaStatusDiv.classList.remove('em-circle-state-time-facturado'); 
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
                copyButton.innerHTML = 'Copiado';
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
    const url = `https://proxy.cors.sh/https://apisqa.andreani.com/v2/ordenes-de-envio/${numeroDeEnvio}/etiquetas`;
    
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
        title: 'Ingrese la clave de facturación',
        input: 'password',
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

async function enviarDatosAndesmar(id, nombre, cp, localidad, remito, calle, numero, telefono, email, precio_venta, producto_nombre) {

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
    const tipoElectrodomestico = document.getElementById(`tipoElectrodomesticoBna-${id}`).value; // Cambiar `${i}` por `${id}`

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
    NroRemito: remito,
    Bultos: bultos, 
    Peso: peso * cantidad, 
    ValorDeclarado: precio_venta * cantidad, 
    M3: volumenM3,
    Alto: [],
    Ancho: [],
    Largo: [],
    Observaciones: calle + ",Telefono: " + telefono + " " + "Electrodomestico: " + producto_nombre,
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

    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
        },
        body: JSON.stringify(requestObj)
    })
    .then(response => {
        console.log(`Datos Respuesta API Andesmar (BNA+ ${remito}):`, response); // Mostrar response en consola
        return response.json();
    })
    .then(data => {
        if (data.NroPedido) {
            const linkEtiqueta = `https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            const linkSeguimiento = `https://andesmarcargas.com/seguimiento.html?numero=${remito}&tipo=remito&cod=`;
            
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
            
              db.ref(`enviosBNA/${id}`).update(transportData)
                .then(() => {
                    console.log("Datos actualizados en Firebase:", transportData);
                })
                .catch((error) => {
                                console.error("Error al actualizar datos en Firebase como Andesmar:", error);
                });
    
            // Actualizar estado de envío
            if (envioState) {
                envioState.className = 'em-circle-state4';
                envioState.innerHTML = `Preparado <i class="bi bi-check2-circle"></i>`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }
        } else {
            buttonAndr.disabled = false;
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`; 
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
        }
    })    
    .catch(error => {
        buttonAndr.disabled = false;
        console.error("Error:", error);
        text.innerText = "Envio No Disponible ⚠️"; // Cambiar texto en caso de error
        resultadoDiv.innerText = `Error: ${error.message}`; // Mostrar error debajo
    })
    .finally(() => {
        spinner.style.display = 'none'; // Asegúrate de ocultar el spinner en caso de error
    });
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
const apiUrlLogin = 'https://apisqa.andreani.com/login';
const apiUrlLabel = 'https://proxy.cors.sh/https://apisqa.andreani.com/v2/ordenes-de-envio';
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

    // Verificar si el tipo de electrodoméstico es uno de los splits
const splitTypes = ["split2700", "split3300", "split4500", "split5500", "split6000", "splitPisoTecho18000"];
const isSplit = splitTypes.includes(tipoElectrodomestico);

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
    const volumenTotal = volumenCm3 / cantidad; // Obtener volumen total

    for (let i = 0; i < cantidad; i++) {
        bultos.push({
            "kilos": peso / cantidad,
            "largoCm": null,
            "altoCm": null,
            "anchoCm": null,
            "volumenCm": volumenTotal,
            "valorDeclaradoSinImpuestos": precioSinIVA,
            "valorDeclaradoConImpuestos": precioVentaRedondeado,
            "referencias": [
                { "meta": "detalle", "contenido": producto_nombre },
                { "meta": "idCliente", "contenido": `${remito}-BNA`.toUpperCase() },
                { "meta": "observaciones", "contenido": calle + ",Telefono: " + telefono + " " + "Electrodomestico: " + producto_nombre, }
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
                envioState.innerHTML = `Preparado <i class="bi bi-check2-circle"></i>`;
            }

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
    const url = `https://proxy.cors.sh/https://apisqa.andreani.com/v2/ordenes-de-envio/${numeroDeEnvio}/etiquetas`;
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
        buttonAndr.href = pdfUrl; // Establecer el href del botón
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
        case "split2700":
            alto = 50; 
            ancho = 72; 
            largo = 27; 
            peso = 40; 
            valor = 600000; // Medidas de la unidad exterior
            altoInterior = 30; anchoInterior = 73; largoInterior = 19;
            break;
        case "split3300":
            alto = 50; 
            ancho = 72; 
            largo = 27; 
            peso = 50; 
            valor = 700000; // Medidas de la unidad exterior
            altoInterior = 32; anchoInterior = 101; largoInterior = 22;
            break;
        case "split4500":
            alto = 30; 
            ancho = 82; 
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
            <input type="number" id="alto-${id}" name="Alto" class="form-control-medidas" step="1" value="${alto}" required disabled>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-expand-vertical"></i></span>
            <input type="number" id="ancho-${id}" name="Ancho" class="form-control-medidas" step="1" value="${ancho}" required disabled>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-angle-expand"></i></span>
            <input type="number" id="largo-${id}" name="Largo" class="form-control-medidas" step="1" value="${largo}" required disabled>
        </div>
        <div class="input-group mb-2" style="display: none;">
            <span class="input-group-text"><i class="bi bi-box-seam"></i></span>
            <input type="number" id="peso-${id}" name="peso" class="form-control-medidas" step="1" value="${peso}" min="1" required disabled>
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
                    <input type="number" id="altoInterior-${id}" name="AltoInterior" class="form-control-medidas" step="1" value="${altoInterior}" required disabled>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-expand-vertical"></i></span>
                    <input type="number" id="anchoInterior-${id}" name="AnchoInterior" class="form-control-medidas" step="1" value="${anchoInterior}" required disabled>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-angle-expand"></i></span>
                    <input type="number" id="largoInterior-${id}" name="LargoInterior" class="form-control-medidas" step="1" value="${largoInterior}" required disabled>
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
    const sinPrepararCards = allData.filter(item => !item.tipoElectrodomesticoBna);
    
    // Limpiar el contenedor de tarjetas
    const cardsContainer = document.getElementById('envios-cards');
    cardsContainer.innerHTML = '';

    // Renderizar solo las tarjetas sin preparar
    renderCards(sinPrepararCards);
});

// FIN SIN PREPARAR BOTON

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

// Llamar a la función cuando se carga la página
window.onload = loadEnviosFromFirebase;
