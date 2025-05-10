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
        console.log(`ℹ️ Credentials OK`);
    } catch (error) {
        console.error('Error al obtener cred de Fire:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerCredencialesCDS();
    await obtenerSesionBrainsys();
  });

firebase.database().ref('ventasWeb').once('value')
    .then(snapshot => {
        if (snapshot.exists()) {
        } else {
            console.log("No hay datos en 'ventasWeb'.");
        }
    })
    .catch(error => {
        console.error("Error al conectar a Firebase: ", error);
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

        // Cambiar la condición para buscar solo cuando la longitud sea exactamente 6
        if (query.length === 6) {
            const queryNumber = query; // Mantenerlo como string para compararlo con el nodo
            spinner.style.display = 'block';
            cardsContainer.innerHTML = '';
            pagination.style.display = 'none'; 

            console.log(`Buscando datos para el número: ${queryNumber}`);
            
            database.ref('ventasWeb')
                .orderByChild('metodo')
                .equalTo('despachanvtav')
                .limitToLast(50000)
                .once('value')
                .then(snapshot => {
                    const allData = [];
                    if (snapshot.exists()) {
                        snapshot.forEach(childSnapshot => {
                            const key = childSnapshot.key; // Obtener el nombre del nodo
                            const data = childSnapshot.val();

                            // Comprobar si el nombre del nodo coincide con el query
                            if (key === queryNumber) {
                                allData.push({ key, data }); // Agregar el objeto completo con el key
                            }
                        });

                        if (allData.length > 0) {
                            const processedData = allData.map(item => {
                                const { key, data } = item;
                                return {
                                    id: key || 0,
                                    idOperacion: key,
                                    Altura: data.Altura || 0,
                                    Calle: capitalizarTexto(data.objeto.cliente.domicilio) || 0, 
                                    Cp: data.objeto.cliente.c_postal || 0, 
                                    Email: data.objeto.cliente.e_mail || 0, 
                                    NombreyApellido: (data.objeto.cliente.nombres + ' ' + data.objeto.cliente.apellido || "").toLowerCase() || "sin nombre",
                                    Observaciones: eliminarComen(capitalizarTexto(data.objeto.comprobante.cabecera.obs)) || 0,
                                    Provincia: capitalizarTexto(data.objeto.cliente.provincia) || 0,
                                    Recibe: data.objeto.cliente.referencia || 0, 
                                    Telefono: data.objeto.cliente.dom_entregas[0]?.telefono || 0,
                                    localidad: capitalizarTexto(data.objeto.cliente.localidad) || 0,
                                    cliente: data.cliente,
                                    transportCompany: data.transportCompany,
                                    diasPlaceIt: data.diaPlaceIt,
                                    nombreDeUsuario: data.objeto.cliente.cuit || 0,
                                    transactionAmount: data.objeto.valores[0]?.importe || 0,  
                                    items: data.objeto.comprobante.items || [],                     
                                    paymentType: ''
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
        } else if (query.length === 0) {
            console.log("Entrada vacía, cargando la página 1.");
            clickPageOne();
        }
    });
});

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

function capitalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

function eliminarComen(texto) {
    return texto.replace(/- comen:.*$/i, '').trim();
}

function cargarDatos() {
    const spinner = document.getElementById('spinner');
    const cardsContainer = document.getElementById('meli-cards');
    const paginationContainer = document.getElementById("pagination");

    spinner.style.display = 'block'; 
    cardsContainer.innerHTML = ''; // Limpia el contenedor de cards

    allData = []; // Reiniciar el arreglo de datos

    database.ref('ventasWeb')
        .orderByChild('metodo')
        .equalTo('despachanvtav')
        .once('value')
        .then(snapshot => {

            if (snapshot.exists()) {
                let dataCount = 0; // Contador de datos válidos

                // Convertir el snapshot a un array y luego invertirlo para obtener los datos más nuevos primero
                const dataArray = Object.entries(snapshot.val()).reverse();

                // Usar un bucle for...of para poder usar break
                for (const [key, childSnapshot] of dataArray) {
                    const data = childSnapshot;

                    // Verificar si el nombre del nodo tiene exactamente 6 dígitos
                    if (key.length === 6 && /^\d{6}$/.test(key)) {
                        if (data.objeto && data.objeto.cliente && data.objeto.valores) {
                            allData.push({ 
                                id: key || 0,
                                idOperacion: key,
                                Altura: data.Altura || 0,
                                Calle: capitalizarTexto(data.objeto.cliente.domicilio) || 0, 
                                Cp: data.objeto.cliente.c_postal || 0, 
                                Email: data.objeto.cliente.e_mail || 0, 
                                NombreyApellido: (data.objeto.cliente.nombres + ' ' + data.objeto.cliente.apellido || "").toLowerCase() || "sin nombre",
                                Observaciones: eliminarComen(capitalizarTexto(data.objeto.comprobante.cabecera.obs)) || 0,
                                Provincia: capitalizarTexto(data.objeto.cliente.provincia) || 0,
                                Recibe: data.objeto.cliente.referencia || 0, 
                                Telefono: data.objeto.cliente.dom_entregas[0]?.telefono || 0,
                                localidad: capitalizarTexto(data.objeto.cliente.localidad) || 0,
                                cliente: data.cliente,
                                transportCompany: data.transportCompany,
                                diasPlaceIt: data.diaPlaceIt,
                                nombreDeUsuario: data.objeto.cliente.cuit || 0,
                                transactionAmount: data.objeto.valores[0]?.importe || 0,  
                                items: data.objeto.comprobante.items || [],                     
                                paymentType: ''
                            });
                            dataCount++; // Incrementar contador de datos válidos
                        } else {
                            console.log("Estructura de datos inesperada para el nodo: ", key);
                        }
                    } else {
                        //Nodo ignorado
                    }

                    // Si se ha alcanzado el límite, detener la búsqueda
                    if (dataCount >= itemsPerPage) {
                        break; // Salir del bucle for...of
                    }
                }
                
                // Limitar los resultados a itemsPerPage después de filtrar
                const paginatedData = allData.slice(0, itemsPerPage);
                renderCards(paginatedData); // Llama a la función para renderizar las tarjetas
            } else {
                console.log("No se encontraron datos que cumplan con el filtro.");
                cardsContainer.innerHTML = `
                    <div class="d-flex flex-column align-items-center justify-content-center text-center w-100">
                        <p class="errorp">No se encontraron resultados para la consulta.</p>
                        <img src="./Img/error.gif" alt="No se encontraron resultados" class="error img-fluid mb-3">
                    </div>
                `;
            }
            // Ocultar el spinner
            pagination.style.display = 'none'; 
            spinner.style.display = 'none';
            searchInput.disabled = false;
            searchInput.value = "";
            updatePagination(allData.length);
        })
        .catch(error => {
            console.error("Error al cargar los datos: ", error);
            spinner.style.display = 'none'; // Asegúrate de ocultar el spinner en caso de error
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
    const isLogPlaceIt = data.transportCompany === "Logistica PlaceIt"
    const isBlocked = data.estadoFacturacion === "bloqueado"
    // Definir Email con valor por defecto
    const email = data.Email || data.email || 'webnovogar@gmail.com';

    // Sanitizar el campo Observaciones antes de pasarlo
    const observacionesSanitizadas = data.Observaciones ? data.Observaciones.replace(/[^a-zA-Z0-9 ]/g, '') : '';

    function limpiarNombreApellido(nombreApellido) {
        // Eliminar caracteres no alfabéticos y espacios extra
        return nombreApellido.replace(/[^a-zA-Z\s]/g, '').trim().replace(/\s+/g, ' ');
    } 
  
    // Función para formatear números en pesos
    function formatCurrency(amount) {
    return `$ ${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // CARROUSEL Y MEDIDAS
    // Crear el carrusel con spinner mientras se cargan las imágenes
    const carouselId = `carousel-${data.idOperacion}`;
    let carouselItems = `
        <div class="carousel-item active">
            <div class="d-flex justify-content-center align-items-center" style="height: 150px;">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Cargando...</span>
                </div>
            </div>
        </div>
    `;

    let medidasHTML = '';

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

    // Función para cargar imágenes y medidas desde Firebase
    async function cargarDatosDesdeFirebase(sku, carouselId, idOperacion) {
        // Ignorar el SKU "110"
        if (sku === "110") return;

        // Normalizar el SKU eliminando caracteres especiales excepto el guion medio
        const skuNormalizado = sku.replace(/[^a-zA-Z0-9-]/g, '');

        try {
            const snapshot = await firebase.database().ref(`/catalogo/${skuNormalizado}`).once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                const pictures = data.pictures || [];
                const peso = data.Peso || 0;
                const volumenCM3 = data.VolumenCM3 || 0;
                const volumenM3 = data.VolumenM3 || 0;
                const medidas = data.medidas || 'No especificado';
                const marca = data.marca || 'No especificado';
                const skuValue = data.SKU || 'No especificado';

                // Generar los elementos del carrusel con las imágenes
                let carouselItems = '';
                pictures.forEach((picture, index) => {
                    carouselItems += `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}">
                            <img src="${picture.secure_url}" class="d-block mx-auto" alt="Imagen ${index + 1}" style="height: 150px; width: auto; max-width: 100%; object-fit: cover;">
                        </div>
                    `;
                });

                // Actualizar el carrusel con las imágenes
                const carouselInner = document.querySelector(`#${carouselId} .carousel-inner`);
                if (carouselInner) {
                    carouselInner.innerHTML = carouselItems;
                }

                // Generar el HTML para las medidas
                const medidasHTMLFragment = `
                    <div class="medidas-simbel">
                        <div>
                            <i class="bi bi-code-square"></i> 
                            <strong>SKU: </strong>
                            <span id="sku-${idOperacion}" style="color: #007bff;">${skuValue}</span>
                        </div>
                        <div>
                            <i class="bi bi-arrows-angle-expand"></i> 
                            Medidas: <span id="medidas-${idOperacion}">${medidas}</span>
                        </div>
                        <div>
                            <i class="bi bi-box-arrow-in-down"></i> 
                            Peso: <span id="peso-${idOperacion}">${Math.round(peso / 1000)}</span> kg
                        </div>
                        <div>
                            <i class="bi bi-box"></i> 
                            Volumen M³: <span id="volumenM3-${idOperacion}">${volumenM3}</span> m³
                        </div>
                        <div>
                            <i class="bi bi-box"></i> 
                            Volumen CM³: <span id="volumenCM3-${idOperacion}">${volumenCM3}</span> cm³
                        </div>
                        <div>
                            <i class="bi bi-boxes"></i> 
                            Marca: <span id="marca-${idOperacion}">${marca}</span>
                        </div>
                    </div>
                `;

                // Agregar las medidas al contenedor correspondiente
                const medidasContainer = document.getElementById(`medidas-container-${idOperacion}`);
                if (medidasContainer) {
                    medidasContainer.innerHTML += medidasHTMLFragment;
                }
            } else {
                console.warn(`No se encontraron datos para el SKU: ${sku}`);
                mostrarImagenPorDefecto(carouselId);
            }
        } catch (error) {
            console.error(`Error al cargar datos para el SKU: ${sku}`, error);
            mostrarImagenPorDefecto(carouselId);
        }
    }

    // Función para mostrar una imagen por defecto si no se encuentran imágenes
    function mostrarImagenPorDefecto(carouselId) {
        const carouselInner = document.querySelector(`#${carouselId} .carousel-inner`);
        if (carouselInner) {
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <img src="Img/Novogar-Sin-Foto copia.jpg" class="d-block mx-auto" alt="Sin imagen disponible" style="height: 150px; width: auto; max-width: 100%; object-fit: cover;">
                </div>
            `;
        }
    }

    // Llamar a la función para cargar imágenes y medidas de los SKUs de los productos
    if (data && Array.isArray(data.items)) {
        const uniqueSKUs = new Set(); // Usar un Set para evitar duplicados
        data.items.forEach(item => {
            if (item.cod_alfa && item.cod_alfa !== "110") {
                uniqueSKUs.add(item.cod_alfa);
            }
        });

        // Cargar datos para cada SKU único
        uniqueSKUs.forEach(sku => {
            cargarDatosDesdeFirebase(sku, carouselId, data.idOperacion);
        });
    }
    // FIN CARROUSEL Y MEDIDAS

    // Crear el contenedor de productos
    let productosHTML = '';
    
    // Verifica que data y sus propiedades existan
    if (data && Array.isArray(data.items)) {
        // Itera sobre los items
        data.items.forEach((item, index) => {
            const precioFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(item.precio || 0);
    
            const descripcionProducto = item.cod_alfa === "110" ? "Costo de Envío" : `Producto ${data.items.length > 1 ? index + 1 : ''}`;
    
            productosHTML += `
                <div style="border-top: 1px solid #ccc; padding-top: 10px; padding-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;">
                    <i class="bi bi-bag-fill"></i> 
                    <strong style="color: #007bff;">${descripcionProducto}:</strong> 
                    <span id="producto-${data.idOperacion}" style="font-weight: bold; text-transform: uppercase;">X ${item.cantidad} u. ${item.cod_alfa}</span>
                    <p style="margin: 5px 0; font-size: 0.9rem; color: #555;">${item.detalle || 'Sin descripción disponible'}</p>
                    <p style="margin: 5px 0; font-size: 1rem; color: #28a745; font-weight: bold;">${precioFormateado}</p>
                </div>
            `;
        });
    } else {
        // Mensaje si no hay productos
        productosHTML = `
            <div style="padding: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;">
                <strong>No hay productos disponibles.</strong>
            </div>
        `;
    }

const codigosAlfa = [];
const cantidades = [];

data.items.forEach(item => {
    if (item.cod_alfa !== "110") {
        // Asegurar que el código alfa tenga 15 caracteres
        const codigoFormateado = item.cod_alfa.padStart(15, '0');
        codigosAlfa.push(codigoFormateado);
        cantidades.push(item.cantidad);
    }
});

// Crear el contenedor de productos
let productosHTML2 = '';
let productosTexto = '';
let totalCantidad = 0; // Variable para almacenar la suma total
let skus = []; // Array para almacenar los SKUs

// Verifica que data y sus propiedades existan
if (data && Array.isArray(data.items)) {
    // Generar la lista de productos en un solo párrafo
    const productos = data.items.map(item => {
        const sku = item.cod_alfa === "110" ? "Envio" : item.cod_alfa; // Reemplazar "110" por "Envio"
        
        // Sumar cantidades y almacenar SKU si no es "110"
        if (item.cod_alfa !== "110") {
            totalCantidad += item.cantidad; // Sumar cantidad
            skus.push(sku); // Agregar SKU al array
        }

        return `
            X <strong>${item.cantidad}</strong>u. 
            <strong>${sku}</strong> 
        `;
    }).join(', '); // Separar los productos con una coma

    // Asignar el HTML al contenedor
    productosHTML2 = `
        <div class="macos-style2">
            <strong><i class="bi bi-bag-fill"></i></strong> ${productos}
        </div>
    `;

    // Asignar el texto plano
    productosTexto = data.items.map(item => {
        const sku = item.cod_alfa === "110" ? "Envio" : item.cod_alfa; // Reemplazar "110" por "Envio"
        return `X ${item.cantidad}u. ${sku}`;
    }).join(', '); // Separar los productos con una coma
} else {
    // Mensaje si no hay productos
    productosHTML2 = `
        <div class="macos-style2">
            <strong>No hay productos disponibles.</strong>
        </div>
    `;
    productosTexto = 'No hay productos disponibles.';
}

// Obtener los SKUs como una cadena separada por comas
const skusTexto = skus.join(', ');

    cardDiv.innerHTML = `
        <div class="card position-relative">

            <div class="card-body-meli">

                <h5 class="card-title-meli"><i class="bi bi-person-bounding-box"></i> ${data.NombreyApellido && data.NombreyApellido.trim() !== '' ? data.NombreyApellido : data.Recibe}</h5>
                <h6 class="user-title-meli">
                    ${data.nombreDeUsuario !== undefined && data.nombreDeUsuario !== null && data.nombreDeUsuario.toString().trim() !== '' 
                        ? (function() {
                            const numeroUsuario = Number(data.nombreDeUsuario.toString().trim());

                            if (numeroUsuario.toString().length <= 8) {
                                return `D.N.I. ${numeroUsuario}`;
                            } else {
                                return `C.U.I.T. ${numeroUsuario}`;
                            }
                        })() 
                        : data.Recibe}
                </h6>

                <div class="meli-box1"> 
                    <p class="card-text cpLocalidad-meli"><i class="fas fa-map-marker-alt"></i> ${data.Cp}, ${data.localidad}, ${data.Provincia}</p>

                    <p class="card-text correo-meli correo-novogar-simbel"> 
                            <img src="Img/Novogar N.png" alt="Logística Novogar" width="30">
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
                <a href="https://admin.novogar.com.ar/admin/pedidos/edit/${data.idOperacion}" target="_blank" style="text-decoration: none; color: inherit;">
                    NOV${data.idOperacion}
                </a>

                <button class="btn btn-link copy-btn p-1 m-0" style="display: inline-flex; align-items: center;">
                    <i class="bi bi-clipboard ios-icon" style="margin: 0;"></i>
                </button>

                </p>
            
                </div>

                ${carouselHTML}
                
                ${productosHTML2}

                <div class="cliente-Container" onclick="copiarCliente('${data.cliente}')">
                <div class="cliente ${!data.cliente ? 'hidden' : ''}">
                <img src="Img/logo-presea.png" alt="PRESEA" width="20">
                Cliente Presea: <strong id="nombre-cliente">${data.cliente}</strong> 
                </div>
                </div>

                <div class="em-circle-ME1">Venta WEB</div>

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
                        <p><i class="bi bi-123 ios-icon"></i> Altura: <span id="altura-${data.idOperacion}">S/N</span></p>
                        <p><i class="fas fa-phone ios-icon"></i> Telefono: <span id="telefono-${data.idOperacion}">${data.Telefono!== undefined ? data.Telefono : 'No Disponible'}</span></p>
                        <p><i class="bi bi-envelope-at-fill ios-icon"></i> Email: <span id="email-${data.idOperacion}" style="text-transform: lowercase;">${email}</span></p>
                        <p><i class="bi bi-info-circle-fill ios-icon"></i> Autorizado: <span id="autorizado-${data.idOperacion}">${data.Recibe !== undefined ? data.Recibe : 'Sin Autorizado, solo titular'}</span></p>
                        <p><i class="bi bi-sticky-fill ios-icon"></i> Observaciones: <span id="observaciones-${data.idOperacion}">${data.Observaciones!== undefined ? data.Observaciones : 'Sin Observaciones'}</span></p>
                    </div>
                    <div class="dimensions-info">
                    
                    <h6>Dimensiones</h6>

                     ${productosHTML}

                    <div class="total-simbel" style="padding-top: 10px; border-bottom: 2px solid green; padding-bottom: 10px; font-size: 1.1rem; margin-bottom: 5px;">
                        <div>Total: <strong id="valor-${data.idOperacion}" style="font-size: 1.1rem; color: #28a745; font-weight: bolder;">${formatCurrency(data.transactionAmount)}</strong></div>
                    </div>

                    <div id="medidas-container-${data.idOperacion}"></div>
                    
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
        onclick="generarPDF('${email}', '${data.idOperacion}', '${limpiarNombreApellido(data.NombreyApellido)}', '${data.Cp}', 'NOV${data.idOperacion}', '${data.Calle}', '${data.Altura}', '${data.Telefono}', '${observacionesSanitizadas}', ${Math.round(data.Peso / 1000)}, ${data.VolumenM3}, ${data.Cantidad}, '${data.medidas}', '${(data.Producto)}', '${data.localidad}', '${data.Provincia}', '${data.Recibe}', '${data.SKU}', '${formatCurrency(data.transactionAmount)}', '${data.Observaciones!== undefined ? data.Observaciones : 'Sin Observaciones'}', '${productosTexto}', '${skusTexto}', ${totalCantidad}, '${codigosAlfa}', '${cantidades}')">
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

// ETIQUETA LOGISTICA PROPIA
async function generarPDF(email, id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, medidas, producto, localidad, provincia, recibe, SKU, total, comentarios, productosTexto, skus, cantidadTotal, codigosAlfa, cantidades) { 
    // Solicitar el número de remito
    const numeroRemito = await solicitarNumeroRemito();
    if (!numeroRemito) return; // Si se cancela, salir de la función

    // Solicitar el cliente
    const cliente = await solicitarCliente();
    if (!cliente) return; // Si se cancela, salir de la función

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
        total,
        codigosAlfa,
        cantidades,
        fechadeOrigen,
        fechadeEntrega,
        observaciones,
        productosTexto
    );

    console.log(
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
        codigosAlfa,
        cantidades,
        fechadeOrigen,
        fechadeEntrega,
        observaciones
    )

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

    const diaFormateadoPlaceIt = obtenerFechas();

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
            <div class="campo uppercase"><span>${cliente} ${NombreyApellido || recibe}</span></div>
            <div class="campo"><span>${Cp}, ${localidad}, ${provincia}</span></div>
            <div class="campo uppercase"><span>${calleDestinatario}</span></div>
            <div class="campo"><span>Teléfono: ${telefonoDestinatario}</span></div>
            <div class="campo"><span>${productosTexto}</span></div>
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

                            // Pushear datos a Firebase
                            const db = firebase.database(); // Asegúrate de que Firebase esté inicializado
                            const transportData = {
                                transportCompany: "Logistica PlaceIt",
                                diaPlaceIt: diaFormateadoPlaceIt,
                                cliente: cliente,
                                remito: numeroRemito,
                            };
                    
                            try {
                                firebase.database().ref(`ventasWeb/${id}`).update(transportData);
                                console.log("Datos actualizados en Firebase como Logistica PlaceIt:", transportData);
                            } catch (error) {
                                console.error("Error al actualizar datos en Firebase:", error);
                            }

        NroEnvio.innerHTML = `Logística PlaceIt`;

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
            direccion: calleDestinatario,
            comentarios: comentarios,
            telefono: telefonoDestinatario,
            sku: skus,
            orden: "NOV" + id,
            cantidad: cantidadTotal,
            cp: Cp,
            tienda: "WEB",
            localidad: localidad,
            nombre: NombreyApellido,
            provincia: provincia
        }).then(() => {
            console.log(`Datos actualizados en Firebase (Logistica) para la operación: NOV${id}`);
            const Name = `Confirmación de Compra Novogar`;
            const Subject = `Tu compra con envío Express NOV${id} ya fue preparada para despacho`;
            const template = "emailTemplatePlaceIt";
            const transporte = "Logística PlaceIt";
            const numeroDeEnvio = diaFormateadoPlaceIt;
            const linkSeguimiento2 = cliente;
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
// FIN GENERAR ETIQUETA LOGISTICA PROPIA

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

function transformarTotal(total) {
    return Number(total.replace(/\$|\./g, '').replace(',', '.'));
}

// ENVIAR PEDIDO BRAINSYS  
async function enviarPedidoBrainsys(NombreyApellido, Cp, provincia, numeroRemito, cliente, calleDestinatario, alturaDestinatario, telefono, precio_venta, skusString, cantidadesString, fechadeOrigen, fechadeEntrega, observaciones, productosTexto) {
    
    const sesion = localStorage.getItem('sesion');
    const depositoId = "001";
    const remitoTransformado = numeroRemito.slice(3).replace(/^0000/, '');

    // Cadenas en arrays
    const skus = skusString.split(','); // ['000CD5603AI0-IX', '0000000B120DS20']
    const cantidades = cantidadesString.split(',').map(Number); // [1, 1]

    const productos = skus.map((sku, index) => ({
        codigo: sku,
        companiaCodigo: "NOG", 
        loteCodigo: "001", 
        vencimiento: "", 
        loteUnico: false,
        estadoCodigo: "DIS", 
        cantidad: cantidades[index], 
        entregaParcial: true 
    }));

    // Transformar el total
    const totalTransformado = transformarTotal(precio_venta).toString().replace('.', '');

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
        calleDestinatario,
        "001",
        "001",
        1,
        false,
        totalTransformado,
        1,
        1,
        `Cliente: ${cliente}`, 
        `Remito: ${numeroRemito}`, 
        `Coordinar con línea ${telefono}, Producto/s: ${productosTexto}`,
        observaciones,
        ...productos
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
        calleDestinatario,
        "001",
        "001",
        1,
        false,
        totalTransformado,
        1,
        1,
        `Cliente: ${cliente}`, 
        `Remito: ${numeroRemito}`, 
        `Coordinar con línea ${telefono}, Producto/s: ${productosTexto}`,
        observaciones,
        ...productos 
    );
}
// FIN ENVIAR PEDIDO BRAINSYS  

// Llama a cargarDatos para iniciar el proceso
cargarDatos();


