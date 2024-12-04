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

// Configuración del segundo proyecto de Firebase
const firebaseConfig2 = {
    apiKey: "AIzaSyCMu2vPvNzhv0cM3b4RItmqZybRhhR_HJM",
    authDomain: "despachos-meli-novogar.firebaseapp.com",
    projectId: "despachos-meli-novogar",
    storageBucket: "despachos-meli-novogar.appspot.com",
    messagingSenderId: "774252628334",
    appId: "1:774252628334:web:623aa84bc3b1cebd3f997f",
    measurementId: "G-E0E9K4TEDW"
};

// Inicializa el segundo proyecto
const app2 = firebase.initializeApp(firebaseConfig2, "app2");
const database2 = app2.database();

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Función para capitalizar el primer carácter de una cadena
function capitalizeText(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

document.addEventListener("DOMContentLoaded", function() {
    const spinner = document.getElementById("spinner");
    const cardsContainer = document.getElementById("meli-cards");
    const searchInput = document.getElementById("search");
    const filterSelect = document.getElementById("filter");
    const paginationContainer = document.getElementById("pagination");
    let currentPage = 1;
    const itemsPerPage = 12;
    let allData = [];
    let originalData = []; // Copia del arreglo original
    let isFiltered = false;
    let currentPageGroup = 0; // Grupo de páginas actual

    // Mostrar el spinner general
    spinner.style.display = "flex";

    // Función para convertir texto a lowercase
    function toLowerCaseText(text) {
        return text ? text.toLowerCase() : '';
    }

// Deshabilitar el buscador al inicio
searchInput.disabled = true;
searchInput.value = "Aguardando que cargue la web ⏳";

// Obtener los datos de Firebase del primer proyecto
database.ref('enviosAndesmar').once('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        allData.push({ 
            id: childSnapshot.key, 
            nombreApellido: toLowerCaseText(data.nombreApellido),
            localidad: toLowerCaseText(data.localidad),
            calleDelDestinatario: toLowerCaseText(data.calleDelDestinatario),
            numeroDeCalle: toLowerCaseText(data.numeroDeCalle),
            telefono: data.telefono,
            nroPedido: data.nroPedido,
            remito: data.remito,
            cotizacion: data.cotizacion,
            observaciones: data.observaciones ? toLowerCaseText(data.observaciones) : '',
            codigoPostal: data.codigoPostal 
        });
    });

    allData.reverse();
    originalData = [...allData];
    renderCards(allData).then(() => {
        spinner.style.display = "none";
        updatePagination(allData.length);

        // Habilitar el buscador después de cargar los datos
        searchInput.disabled = false;
        searchInput.value = "";
    });
});

// Función para renderizar las tarjetas
async function renderCards(data) {
    cardsContainer.innerHTML = "";
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage); 

    const promises = paginatedData.map(async (item) => {
        const card = document.createElement("div");
        card.className = "col-md-4"; 

        // Búsqueda en la segunda base de datos utilizando remito
        let clienteLabel = ``; // Valor por defecto

        await database2.ref('DespachosLogisticos').orderByChild('numeroDeEnvio').equalTo(item.remito).once('value', (snapshot) => {
            if (snapshot.exists()) {
                const despachosData = snapshot.val();
                const despachosKey = Object.keys(despachosData)[0]; // Obtiene la primera coincidencia
                const cliente = despachosData[despachosKey].cliente;
                clienteLabel = `<div class="em-circle-state-cliente"><img id="presea" src="./Img/logo-presea.png">${capitalizeText(cliente)} <button class="btn btn-link" onclick="navigator.clipboard.writeText('${capitalizeText(cliente)}')">
                            <i class="bi bi-clipboard icon-indigo"></i>
                        </button></div>`;
            }
        }).catch(error => {
            console.error("Error fetching data from Firebase Config 2: ", error);
        });

        const etiqueta = item.remito.startsWith("BNA")
        ? `<div class="em-state-bna2"><img id="bna2" src="./Img/bna-logo.png"></div>`
        : item.remito.startsWith("NOV")
        ? `<div class="em-state-simbel"><img id="simbel2" src="./Img/simbel.png"></div>`
        : item.remito.endsWith("ME1")
        ? `<div class="em-state-meli">Mercado Libre<img id="img-meli" src="./Img/meli.png"></div>`
        : `<div class="em-state-andesmar">Manual 💪🏻</div>`;

        card.innerHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    ${clienteLabel} <!-- Aquí se inserta el valor de cliente obtenido -->
                    ${etiqueta}
                    <h5 class="card-title"><i class="bi bi-person-bounding-box"></i> ${item.nombreApellido}</h5>
                    <p class="card-text cpLocalidad">${item.codigoPostal}, ${item.localidad}</p>
                    <p class="card-text"><i class="fas fa-home"></i> ${item.calleDelDestinatario}, Altura: ${item.numeroDeCalle}</p>
                    <p class="card-text"><i class="fas fa-phone"></i> Telefono: ${item.telefono}</p>
                    <p class="card-text"><i class="bi bi-file-earmark-code-fill"></i> Número Andesmar: ${item.nroPedido}</p>
                    <p class="card-text"><i class="bi bi-credit-card-fill"></i> Cotización: ${item.cotizacion}</p>
                    <div class="d-flex align-items-center">
                        <p class="remitoCard card-text mb-0">${item.remito}</p>
                        <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>

                    <div class="apiSeguimiento" style="display: flex; justify-content: center; align-items: center; height: 100px">
                        <img class="blueSpinner" src="./Img/spinner.gif" alt="Cargando...">
                    </div>

                    <!-- Botón para abrir el modal -->
                    <button class="btn btn-info mt-1 open-tracking" data-nropedido="${item.nroPedido}" data-clienteAndesmar="${item.nombreApellido}" data-bs-toggle="modal" data-bs-target="#trackingModal">
                    <i class="bi bi-eye"></i>Track 
                    </button>

                    <a href="https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${item.nroPedido}" target="_blank" class="btn btn-warning"><i class="bi bi-file-earmark-arrow-down-fill"></i></a>

                    <a href="https://andesmarcargas.com/seguimiento.html?numero=${item.remito}&tipo=remito&cod=" target="_blank" class="btn btn-secondary"><i class="bi bi-box-arrow-up-right"></i></a>

                    <button class="btn btn-success btn-sm mt-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseObservaciones-${item.id}" aria-expanded="false" aria-controls="collapseObservaciones-${item.id}">
                    <i class="bi bi-chevron-down"></i> Notas <i class="bi bi-sticky-fill"></i>
                    </button>

                    <div class="collapse" id="collapseObservaciones-${item.id}">
                        <div class="mb-3 mt-2 divObs">
                            <label for="observaciones-${item.id}" class="form-label">Observaciones</label>
                            <textarea id="observaciones-${item.id}" class="form-control-obs" placeholder="Agregar observaciones" style="resize: both; min-height: 50px;">${item.observaciones || ''}</textarea>
                            <button class="btn btn-primary mt-1 update-observaciones" data-id="${item.id}">Actualizar Observaciones</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Verificar si existe reclamoEmail1 en Firebase
        const reclamoSnapshot = await database.ref(`enviosAndesmar/${item.id}/reclamoEmail1`).once('value');
        if (reclamoSnapshot.exists()) {
            const reclamoData = reclamoSnapshot.val();
            console.log('Reclamo activo:', reclamoData); // Muestra en consola el contenido del reclamo

            // Crear el div para mostrar el mensaje
            const reclamoDiv = document.createElement('div');
            reclamoDiv.className = 'alerta-card-andesmar';
            reclamoDiv.innerHTML = `<span class="message"><div class="circle"></div> Posee reclamo activo</span><img id="click" src="./Img/click-red-unscreen.gif" alt="Click" />`;

            // Agregar evento de clic
reclamoDiv.addEventListener('click', async () => {
    // Cargar datos desde Firebase
    const reclamoData = await loadReclamoData(item.id); // Pasar el ID del item
    if (reclamoData) {
        document.getElementById('modalAsunto').innerText = reclamoData.asunto;
        document.getElementById('modalCuerpo').innerText = reclamoData.cuerpo;
        document.getElementById('modalFecha').innerText = new Date(reclamoData.fecha).toLocaleString();
    }
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('reclamoModal'));
    modal.show();
});

// Función para cargar datos desde Firebase
async function loadReclamoData(itemId) {
    try {
        const reclamoSnapshot = await database.ref(`enviosAndesmar/${itemId}/reclamoEmail1`).once('value');
        return reclamoSnapshot.val(); // Devuelve el objeto del reclamo
    } catch (error) {
        console.error("Error al cargar los datos del reclamo: ", error);
        return null;
    }
}
        
            // Insertar el div debajo de apiSeguimiento
            const apiSeguimientoDiv = card.querySelector('.apiSeguimiento');
            apiSeguimientoDiv.parentNode.insertBefore(reclamoDiv, apiSeguimientoDiv.nextSibling); // Inserta justo después de apiSeguimiento
        } else {
            console.log('No hay reclamos activos para este envío.');
        }

        cardsContainer.appendChild(card);

        // Lógica del botón de copiar al portapapeles
        const copyButton = card.querySelector('.copy-btn');
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(item.remito).then(() => {
                copyButton.innerHTML = 'Copiado';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                }, 2000);
            }).catch(err => console.error('Error al copiar al portapapeles: ', err));
        });

        // Lógica para actualizar observaciones
        const updateButton = card.querySelector('.update-observaciones');
        if (updateButton) {
            updateButton.addEventListener('click', () => {
                const observacionesInput = card.querySelector(`#observaciones-${item.id}`);
                const observacionesValue = observacionesInput.value;

                // Actualizar en Firebase
                database.ref(`enviosAndesmar/${item.id}`).update({ observaciones: observacionesValue })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualización exitosa!',
                        text: 'Las observaciones han sido actualizadas correctamente.',
                        confirmButtonText: 'Aceptar'
                    });
                })
                .catch((error) => {
                    console.error("Error al actualizar observaciones: ", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron actualizar las observaciones. Inténtalo de nuevo.',
                        confirmButtonText: 'Aceptar'
                    });
                });
            });
        }

        // Llamar a la API para obtener el estado actual
        try {
            const response = await fetch('https://proxy.cors.sh/https://api.andesmarcargas.com/api/EstadoActual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                },
                body: JSON.stringify({
                    "logueo": {
                        "Usuario": "BOM6765",
                        "Clave": "BOM6765",
                        "CodigoCliente": "6765"
                    },
                    "NroPedido": item.nroPedido
                })
            });

            const data = await response.json();
            const estadoDiv = document.createElement('div');
            estadoDiv.className = 'mb-3';
            
            const guia = data.NroGuia === "0" ? "Pendiente de Envío" : `Guia: ${data.NroGuia}`;
            const estadoActual = `${capitalizeText(data.EstadoActual)}`;
            const fecha = `Fecha de creación: ${new Date(data.FechaEmision).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
            
            const guiaContainer = document.createElement('div');
            guiaContainer.className = 'd-flex align-items-center';
            
            const guiaParagraph = document.createElement('p');
            guiaParagraph.className = 'card-text mb-0';
            guiaParagraph.innerHTML = `<i class="bi bi-truck"></i> ${guia}`;
            
            const copyGuideButton = document.createElement('button');
            copyGuideButton.className = 'btn btn-link copy-guide-btn ms-2';
            copyGuideButton.innerHTML = '<i class="bi bi-clipboard"></i>';
            
            copyGuideButton.addEventListener('click', () => {
                navigator.clipboard.writeText(data.NroGuia).then(() => {
                    copyGuideButton.innerHTML = 'Copiado';
                    setTimeout(() => {
                        copyGuideButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                    }, 2000);
                }).catch(err => console.error('Error al copiar al portapapeles: ', err));
            });
            
            guiaContainer.appendChild(guiaParagraph);
            guiaContainer.appendChild(copyGuideButton);
            
            estadoDiv.innerHTML += `
                <p class="card-text"><i class="bi bi-info-circle"></i> ${estadoActual}</p>
                <p class="card-text"><i class="bi bi-calendar"></i> ${fecha}</p>
            `;

            // Agregar el botón de Reclamar Envío
            const reclamarButton = document.createElement('button');
            reclamarButton.className = 'btn btn-danger mt-2 reclamo-andesmar w-100';
            reclamarButton.innerHTML = '<i class="bi bi-exclamation-circle"></i> Reclamar envío';

            if (data.NroGuia === "0") {
                reclamarButton.className = 'btn btn-secondary mt-2 reclamo-andesmar w-100'; // Cambiar a color secondary
                reclamarButton.disabled = true; // Deshabilitar el botón
                reclamarButton.innerHTML = '<i class="bi bi-exclamation-circle"></i> Reclamo activo cuando se envíe';
            } else if (estadoActual === "En Destino - Entregada") {
                reclamarButton.className = 'btn btn-success mt-2 reclamo-andesmar w-100'; // Cambiar a color success
                reclamarButton.disabled = true; // Deshabilitar el botón
                reclamarButton.innerHTML = '<i class="bi bi-check-circle"></i> Entrega Exitosa'; // Actualizar texto
            }

            // Agregar evento para abrir el modal
            reclamarButton.addEventListener('click', () => {
                document.getElementById('idModal').value = `${item.id}`;
                document.getElementById('asunto').value = `Reclamo Novogar / Remito: ${item.remito} Guia: ${data.NroGuia}`;
                document.getElementById('cuerpo').value = `Estimados, nos contactamos para realizar un reclamo por el envío ${data.NroGuia}.`;
                const modal = new bootstrap.Modal(document.getElementById('emailModal'));
                modal.show();
            });

            estadoDiv.appendChild(reclamarButton);
            
            estadoDiv.insertBefore(guiaContainer, estadoDiv.firstChild);
            
            const apiSeguimientoDiv = card.querySelector('.apiSeguimiento');
            apiSeguimientoDiv.innerHTML = ''; 
            apiSeguimientoDiv.appendChild(estadoDiv); 
            apiSeguimientoDiv.removeAttribute('style');

        } catch (error) {
            console.error('Error al obtener el estado de seguimiento:', error);
        }
    });

    await Promise.all(promises);
}

    // Lógica para el botón de filtrar etiquetas
    const filterLabelsButton = document.getElementById("filter-labels");
    filterLabelsButton.addEventListener("click", function() {
        if (!isFiltered) {
            const filteredData = allData.filter(item => item.remito.startsWith("NOV"));
            renderCards(filteredData);
            filterLabelsButton.innerHTML = 'Volver atrás <i class="bi bi-arrow-left"></i>';
            isFiltered = true;
        } else {
            renderCards(allData);
            filterLabelsButton.innerHTML = 'Etiquetas <img id="simbel" src="./Img/simbel.png">';
            isFiltered = false;
        }
    });

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
                renderCards(allData);
                updatePagination(allData.length);
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
                renderCards(allData);
                updatePagination(allData.length);
            });
            paginationContainer.appendChild(backItem);
        }
    }    

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
});
// FIN BUSCADOR

    // Filtro de orden
    filterSelect.addEventListener("change", function() {
        if (filterSelect.value === "nuevo") {
            allData = [...originalData];
        } else if (filterSelect.value === "antiguo") {
            allData.sort((a, b) => a.id.localeCompare(b.id));
        }
        renderCards(allData);
    });
});

document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("open-tracking")) {
            const nroPedido = event.target.getAttribute("data-nropedido");
            const clienteAndesmar = event.target.getAttribute("data-clienteAndesmar");
            const trackingContent = document.getElementById("trackingContent");

            // Mostrar cargando
            trackingContent.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden"></span></div>';

            const requestBody = {
                "logueo": {
                    "Usuario": "BOM6765",
                    "Clave": "BOM6765",
                    "CodigoCliente": "6765"
                },
                "NroPedido": nroPedido
            };

            fetch('https://proxy.cors.sh/https://apitest.andesmarcargas.com/api/EstadosHistoricos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la API');
                }
                return response.json();
            })
            .then(data => {
                const timelineHTML = createTimeline(data, clienteAndesmar);
                trackingContent.innerHTML = timelineHTML + createDownloadButton(); // Agregar botón de descarga
            })
            .catch(error => {
                console.error('Error al obtener el seguimiento:', error);
                if (trackingContent) {
                    trackingContent.innerHTML = 'Error al cargar los datos. Pedido pendiente de ingreso en sistema.';
                } else {
                    console.error('Elemento trackingContent no encontrado.');
                }
            });
        }
    });
});

function createTimeline(data, clienteAndesmar) {
    let timelineHTML = `
        <div class="info-container">
            <div class="Andesmar-track">
                <img src="./Img/marca-andesmar.png" alt="Andesmar Cargas">
            </div>
            <h5>Número de Guía: ${data.NroGuia}</h5>
            <p>Destinatario: ${clienteAndesmar.toUpperCase()}</p>
            <p>Metodo de Entrega: ${data.UnidadVentaDescrip}</p>
            <p>Modalidad de Entrega: ${data.ModalidadEntregaDescrip}</p>
            <p>Estado Actual: ${data.EstadoActual}</p>
            <p>Número de Remito del Cliente: ${data.NroRemitoCliente}</p>
            <p>Fecha de Emisión: ${new Date(data.FechaEmision).toLocaleString()}</p>
            <p>Origen: ${data.Origen}</p>
            <p>Número de Pedido: ${data.NroPedido}</p>
            <p>Destino: ${data.Destino}</p>

        </div>
        <h6 class="historialAndesmar">Historial de Estados:</h6>
        <ul class="timeline">`;

    data.ListaEstadosHistorico.forEach((estado, index) => {
        const isLast = index === data.ListaEstadosHistorico.length - 1;
        const itemNumber = isLast ? "Último" : index + 1;
        const circleClass = isLast ? "timeline-circle last" : "timeline-circle";
        
        const fecha = new Date(estado.FechaHis);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        const horas = String(fecha.getHours() % 12 || 12).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        const ampm = fecha.getHours() >= 12 ? 'PM' : 'AM';
        
        const fechaFormateada = `Día: ${dia}/${mes}/${año} - Horario: ${horas}:${minutos}, ${ampm}`;

        timelineHTML += `
            <li class="timeline-item">
                <span class="${circleClass}">${itemNumber}</span>
                <div class="timeline-content">
                    <h6>${fechaFormateada}</h6>
                    <p>${estado.Estado} en ${estado.LocalidadDescrip}</p>
                </div>
            </li>`;
    });

    timelineHTML += `</ul></div>`;
    return timelineHTML;
}

function createDownloadButton() {
    return `
        <button id="downloadPdf" class="btn btn-danger" style="margin-top: 20px;">
            <i class="fas fa-download"></i> Descargar en PDF
        </button>`;
}

// Evento para manejar la descarga del PDF
document.addEventListener("click", function(event) {
    if (event.target.id === "downloadPdf") {
        generatePDF();
    }
});

// Función para generar el PDF con nombre personalizado
function generatePDF() {
    const trackingContent = document.getElementById("trackingContent");
    const destinatario = document.querySelector('[data-clienteAndesmar]').getAttribute('data-clienteAndesmar');
    const nroGuia = trackingContent.querySelector('h5').textContent.replace('Número de Guía: ', '');
    const opt = {
        margin:       1,
        filename: `Seguimiento_${destinatario.toUpperCase()}_${nroGuia}.pdf`, 
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Generar y descargar el PDF
    html2pdf().from(trackingContent).set(opt).save();
}

document.addEventListener('DOMContentLoaded', () => {
    const reclamarButton = document.getElementById('reclamarButton');
    const botonEnviarEmail = document.getElementById('botonEnviarEmail');

    // Agregar evento para abrir el modal
    reclamarButton.addEventListener('click', () => {
        document.getElementById('asunto').value = `Reclamo Novogar / Remito: ${item.remito} Guia: ${data.NroGuia}`;
        document.getElementById('cuerpo').value = `Estimados, nos contactamos para realizar un reclamo por el envío ${data.NroGuia}.`;
        const modal = new bootstrap.Modal(document.getElementById('emailModal'));
        modal.show();
    });

    // Función para enviar el correo
    async function enviarCorreo(destinatarioEmail, emailOrigen, emailBody, emailSubject, item) {
        const smtpU = 's154745_3';
        const smtpP = 'QbikuGyHqJ';
    
        const emailData = {
            "Html": {
                "DocType": null,
                "Head": null,
                "Body": emailBody,
                "BodyTag": "<body>"
            },
            "Text": "",
            "Subject": emailSubject,
            "From": {
                "Name": "Posventa Novogar",
                "Email": emailOrigen
            },
            "To": [
                {
                    "Name": "Cliente",
                    "Email": destinatarioEmail
                }
            ],
            "Cc": [],
            "Bcc": ["webnovagar@gmail.com", "posventa@novogar.com.ar"],
            "CharSet": "utf-8",
            "User": {
                "Username": smtpU,
                "Secret": smtpP
            }
        };
    
        try {
            const response = await fetch('https://proxy.cors.sh/https://send.mailup.com/API/v2.0/messages/sendmessage', {
                method: 'POST',
                headers: {
                    'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });
    
            const result = await response.json();
            if (result.Status === 'done') {
                console.log('Email enviado exitosamente');
                showAlert(`<i class="bi bi-envelope-check"></i> Email enviado a ${destinatarioEmail} a las ${new Date().toLocaleTimeString()}`);
                
                // Llamar la función para gestionar el reclamoEmail
                await manejarReclamoEmail(item);
            } else {
                console.log(`Error al enviar el email: ${result.Message}`);
                showAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${new Date().toLocaleTimeString()}`);
            }
        } catch (error) {
            console.error('Error al enviar el email:', error);
            showAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${new Date().toLocaleTimeString()}`);
        }
    }
    
    // Función para manejar el reclamoEmail
    async function manejarReclamoEmail(item) {
        const item2 = document.getElementById('idModal').value;
        const emailBody2 = document.getElementById('cuerpo').value;
        const emailSubject2 = document.getElementById('asunto').value;
        const ref = database.ref(`enviosAndesmar/${item2}`);
        
        // Obtener los datos actuales del nodo
        const snapshot = await ref.once('value');
        const data = snapshot.val();
        
        // Verificar si ya existe el campo reclamoEmail
        let reclamoKey = 'reclamoEmail1'; // Valor predeterminado si no existe
        let count = 1;
    
        // Si ya existen reclamoEmails numerados, buscar el siguiente número disponible
        while (data && data[`reclamoEmail${count}`]) {
            count++;
        }
    
        // Definir la nueva clave de reclamoEmail
        reclamoKey = `reclamoEmail${count}`;
    
        // Crear un nuevo reclamoEmail
        const nuevoReclamo = {
            fecha: new Date().toISOString(),
            asunto: emailSubject2, // Asunto del reclamo
            cuerpo: emailBody2, // Cuerpo del reclamo
        };
    
        // Guardar el nuevo reclamoEmail en la base de datos
        await ref.update({
            [reclamoKey]: nuevoReclamo
        });
    
        console.log(`Reclamo guardado como ${reclamoKey}`);
    }
    
    // Evento para el botón de enviar email
    botonEnviarEmail.addEventListener('click', async () => {
        botonEnviarEmail.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando email...';
        botonEnviarEmail.disabled = true; // Deshabilitar el botón
    
        const destinatarioEmail = document.getElementById('destinatario').value;
        const emailOrigen = document.getElementById('origen').value;
        const emailBody = document.getElementById('cuerpo').value;
        const emailSubject = document.getElementById('asunto').value;
        const item = document.getElementById('idModal').value;
    
        // Enviar correo
        await enviarCorreo(destinatarioEmail, emailOrigen, emailBody, emailSubject, item);
    
        // Actualizar el botón tras el envío
        botonEnviarEmail.innerHTML = 'Email enviado con éxito (5)';
        botonEnviarEmail.classList.add('btn-success');
        botonEnviarEmail.classList.remove('btn-primary');
        botonEnviarEmail.disabled = true;
    
        // Contador descendente
        let counter = 5;
        const interval = setInterval(() => {
            counter--;
            botonEnviarEmail.innerHTML = `Email enviado con éxito (${counter})`;
            if (counter <= 0) {
                clearInterval(interval); // Detener el contador
                botonEnviarEmail.innerHTML = 'Enviar Email';
                botonEnviarEmail.classList.remove('btn-success');
                botonEnviarEmail.classList.add('btn-primary');
                botonEnviarEmail.disabled = false; // Habilitar el botón
            }
        }, 1000); // Decrementa el contador cada segundo
    });    
});

let alertCount = 0;

function showAlert(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    document.body.appendChild(alertElement);
    alertElement.style.bottom = `${20 + alertCount * 70}px`;
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    alertElement.querySelector('.close').onclick = () => {
        closeAlert(alertElement);
    };
    setTimeout(() => {
        closeAlert(alertElement);
    }, 8000);
    alertCount++;
}

function showAlertError(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alertError';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    document.body.appendChild(alertElement);
    alertElement.style.bottom = `${20 + alertCount * 70}px`;
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    alertElement.querySelector('.close').onclick = () => {
        closeAlert(alertElement);
    };
    setTimeout(() => {
        closeAlert(alertElement);
    }, 8000);
    alertCount++;
}

function closeAlert(alertElement) {
    alertElement.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(alertElement);
        alertCount--;
        updateAlertPositions();
    }, 300);
}

function updateAlertPositions() {
    const alerts = document.querySelectorAll('.alert, .alertError');
    alerts.forEach((alert, index) => {
        alert.style.bottom = `${20 + index * 70}px`;
    });
}



