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
            
            // Divide las filas por líneas y usa una expresión regular para manejar las comas dentro de las comillas correctamente
            const data = content.split(/\r?\n/).map(row => {
                return row.match(/(".*?"|[^,\r\n]+)(?=\s*,|\s*$)/g) || [];
            });
    
            const headers = data[0]; // Cabeceras (primera fila)
            const dataRows = data.slice(1); // Filas de datos
            let importedCount = 0; // Contador para SweetAlert
            const promises = []; // Array para controlar las promesas de Firebase
    
            dataRows.forEach(row => {
                if (row.length > 0) { // Verifica que la fila no esté vacía
                    // Estructura de datos a guardar en Firebase
                    const envioData = {
                        fecha_creacion_orden: row[0] || null,
                        fecha_pago: row[1] || null,
                        orden_: row[2] || null,
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
    
                    // Guardar en Firebase
                    const envioRef = firebase.database().ref('enviosBNA').push();
                    promises.push(envioRef.set(envioData));
                    importedCount++;
                }
            });
    
            // Cuando todas las promesas de Firebase se completen
            Promise.all(promises)
            .then(() => {
                // Ocultar el spinner
                spinner.remove();
    
                // Mostrar SweetAlert con la cantidad importada
                Swal.fire({
                    title: 'Importación completada',
                    text: `Se han importado ${importedCount} ventas a la base de datos`,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Recargar la página después de hacer clic en OK
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

// Función para cargar los datos de Firebase y renderizar las tarjetas
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
                brand_name: (data.brand_name),
                cuotas: (data.cuotas),
                precio_venta: (data.precio_venta),
                suborden_total: (data.suborden_total),
                numeros_tarjeta: (data.numeros_tarjeta),
                sku: (data.sku_externo),
                cantidad: (data.cantidad),
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

        // Invertir el array para mostrar la última tarjeta arriba
        allData.reverse();

        // Renderizar las tarjetas y la paginación
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
        
            for (let i = startIndex; i < endIndex; i++) {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-3';
        
                // Verificar si transportCompany es "Andesmar"
                const isAndesmar = data[i].transportCompany === "Andesmar";
        
                card.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <div id="estadoEnvio${data[i].id}" class="${isAndesmar ? 'em-circle-state4' : 'em-circle-state3'}">
                                ${isAndesmar ? 'Preparado' : 'Pendiente'} <i class="bi bi-stopwatch-fill"></i>
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
                                ${isAndesmar ? `<a href="${data[i].trackingLink}" target="_blank">Andesmar: ${data[i].transportCompanyNumber} <i class="bi bi-box-arrow-up-right"></i></a>` : 'Número de Envío Pendiente'}
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
                                <div class="pago p-2 mt-2"">
                                    <p class="card-text-pago"><strong>Entidad: ${data[i].brand_name || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Cuotas:</strong> ${data[i].cuotas || 'N/A'}</p>
                                    <p class="card-text-pago"><strong>Número de Tarjeta:</strong> **** **** **** ${data[i].numeros_tarjeta}</p>
                                    <p class="card-text-pago"><strong>Precio de Venta:</strong> $ ${data[i].precio_venta}</p>
                                    <p class="card-text-pago"><strong>Costo de Envío:</strong> $ ${(data[i].suborden_total - data[i].precio_venta)}</p>
                                    <p class="card-text-pago"><strong>Suborden Total:</strong> $ ${data[i].suborden_total}</p>
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
                            <button class="btn ${isAndesmar ? 'btn-success' : 'btn-primary'} mt-2" 
                                    id="andesmarButton${data[i].id}" 
                                    ${isAndesmar ? `onclick="window.open('https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${data[i].transportCompanyNumber}', '_blank')"` : `onclick="enviarDatosAndesmar('${data[i].id}', '${data[i].nombre}', '${data[i].cp}', '${data[i].localidad}', '${data[i].remito}', '${data[i].calle}', '${data[i].numero}', '${data[i].telefono}', '${data[i].email}')"`}>
                                <span id="andesmarText${data[i].id}">
                                    ${isAndesmar ? `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data[i].transportCompanyNumber}` : `<i class="bi bi-file-text"></i> Etiqueta Andesmar`}
                                </span>
                                                           <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none;" id="spinnerAndesmar${data[i].id}"></span>
                            </button>

                            <div id="resultado${data[i].id}" class="mt-2 errorMeli"></div>
                        </div>
                    </div>
                `;

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

const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

function enviarDatosAndesmar(id, nombre, cp, localidad, remito, calle, numero, telefono, email) {
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
        ID: ${id}, Nombre: ${nombre}, CP: ${cp}, Localidad: ${localidad}, Remito: ${remito}, 
        Calle: ${calle}, Teléfono: ${telefono}, Email: ${email}, Tipo Electrodoméstico: ${tipoElectrodomestico}
    `);

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';

    // Aquí debes definir los datos que se enviarán a la API
    const requestObj = {
        CalleRemitente: "Mendoza", // Reemplaza con el valor correcto
        CalleNroRemitente: "2799", // Reemplaza con el valor correcto
        CodigoPostalRemitente: "2000", // Reemplaza con el valor correcto
        NombreApellidoDestinatario: nombre,
        CodigoPostalDestinatario: cp,
        CalleDestinatario: calle,
        CalleNroDestinatario: "S/N",
        TelefonoDestinatario: telefono,
        NroRemito: remito,
        Bultos: cantidad,
        Peso: peso * cantidad,
        ValorDeclarado: 100, // Se Reemplazara cuando Leo envie este dato
        M3: volumenM3,
        Alto: Array(cantidad).fill(alto), 
        Ancho: Array(cantidad).fill(ancho), 
        Largo: Array(cantidad).fill(largo), 
        Observaciones: calle + ",Telefono" + telefono + tipoElectrodomestico,
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
                                console.error("Error al actualizar datos en Firebase:", error);
                });
    
            // Actualizar estado de envío
            if (envioState) {
                envioState.className = 'em-circle-state4';
                envioState.innerHTML = `Preparado <i class="bi bi-check2-circle"></i>`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }
        } else {
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`; 
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
        }
    })    
    .catch(error => {
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
