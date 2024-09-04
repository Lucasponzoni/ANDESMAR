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

document.addEventListener("DOMContentLoaded", function() {
    const spinner = document.getElementById("spinner");
    const cardsContainer = document.getElementById("envios-cards");
    const searchInput = document.getElementById("search");
    const filterSelect = document.getElementById("filter");
    const paginationContainer = document.getElementById("pagination");
    let currentPage = 1;
    const itemsPerPage = 12;
    let allData = [];
    let currentPageGroup = 0; // Grupo de páginas actual

    // Mostrar el spinner general
    spinner.style.display = "flex";

    // Obtener los datos de Firebase
    database.ref('enviosAndesmar').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            allData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        // Ordenar los datos por ID, de más nuevo a más viejo por defecto
        allData.sort((a, b) => b.id.localeCompare(a.id));

        // Renderizar las cards
        renderCards(allData).then(() => {
            // Ocultar el spinner general después de renderizar las tarjetas
            spinner.style.display = "none";
            updatePagination(allData.length); // Actualizar la paginación
        });
    });

    // Función para renderizar las tarjetas
    async function renderCards(data) {
        cardsContainer.innerHTML = ""; // Limpiar el contenedor
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = data.slice(startIndex, endIndex); 

        const promises = paginatedData.map(async (item) => {
            const card = document.createElement("div");
            card.className = "col-md-4"; 
            card.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title"><i class="fas fa-user"></i> ${item.nombreApellido}</h5>
                        <p class="card-text cpLocalidad"><i class="fas fa-map-marker-alt"></i> ${item.codigoPostal}, ${item.localidad}</p>
                        <p class="card-text"><i class="fas fa-home"></i> ${item.calleDelDestinatario}, ALTURA: ${item.numeroDeCalle}</p>
                        <p class="card-text"><i class="fas fa-phone"></i> TELEFONO: ${item.telefono}</p>
                        <p class="card-text"><i class="bi bi-file-earmark-code-fill"></i> NÚMERO ANDESMAR: ${item.nroPedido}</p>
                        <div class="d-flex align-items-center">
                            <p class="card-text mb-0">${item.remito}</p>
                            <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;">
                                <i class="bi bi-clipboard"></i>
                            </button>
                        </div>
                        <p class="card-text"><i class="bi bi-bank2"></i> COTIZACIÓN: ${item.cotizacion}</p>
                        <div class="apiSeguimiento" style="display: flex; justify-content: center; align-items: center; height: 100px;">
                        <img src="./Img/loading-buffering.gif" alt="Cargando..." style="width: 50px; height: 50px;">
                        </div>

                        <a href="https://andesmarcargas.com/seguimiento.html?numero=${item.remito}&tipo=remito&cod=" target="_blank" class="btn btn-primary">Realizar seguimiento</a>
                        <a href="https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${item.nroPedido}" target="_blank" class="btn btn-warning"><i class="bi bi-file-earmark-arrow-down-fill"></i></a>
                    </div>
                </div>
            `;

            // Lógica para el botón de filtrar etiquetas
            const filterLabelsButton = document.getElementById("filter-labels");
            filterLabelsButton.addEventListener("click", function() {
            const filteredData = allData.filter(item => item.remito.startsWith("NOV"));
            renderCards(filteredData);
        });

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

            // Agregar la tarjeta al contenedor
            cardsContainer.appendChild(card);

            // Llamar a la API para obtener el estado actual
            try {
                const response = await fetch('https://proxy.cors.sh/https://api.andesmarcargas.com/api/EstadoActual', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cors-api-key': 'temp_02193751c5190a008c46c2c6dfa7b919'
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

                const guia = data.NroGuia === "0" ? "PENDIENTE DE INGRESO" : `GUIA: ${data.NroGuia}`;
                const estadoActual = `ESTADO: ${data.EstadoActual.toUpperCase()}`;
                const fecha = `FECHA: ${new Date(data.FechaEmision).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

                estadoDiv.innerHTML = `
                    <p class="card-text"><i class="bi bi-truck"></i> ${guia}</p>
                    <p class="card-text"><i class="bi bi-info-circle"></i> ${estadoActual}</p>
                    <p class="card-text"><i class="bi bi-calendar"></i> ${fecha}</p>
                `;

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

    function updatePagination(totalItems) {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let startPage = currentPageGroup + 1;
        let endPage = Math.min(currentPageGroup + 3, totalPages);
        
        // Mostrar las páginas del grupo actual
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener("click", (e) => {
                e.preventDefault();
                currentPage = i;
                renderCards(allData);
            });
            paginationContainer.appendChild(pageItem);
        }

        // Botón "Cargar más"
        if (endPage < totalPages) {
            const loadMoreItem = document.createElement("li");
            loadMoreItem.className = "page-item";
            loadMoreItem.innerHTML = `<a class="page-link" href="#">Cargar más</a>`;
            loadMoreItem.addEventListener("click", (e) => {
                e.preventDefault();
                currentPageGroup += 3; // Avanzar al siguiente grupo
                renderCards(allData); // Renderizar las tarjetas
                updatePagination(allData.length); // Actualizar la paginación
            });
            paginationContainer.appendChild(loadMoreItem);
        }

        // Botón "Volver atrás"
        if (currentPageGroup > 0) {
            const backItem = document.createElement("li");
            backItem.className = "page-item";
            backItem.innerHTML = `<a class="page-link" href="#">Volver atrás</a>`;
            backItem.addEventListener("click", (e) => {
                e.preventDefault();
                currentPageGroup -= 3; // Retroceder al grupo anterior
                renderCards(allData); // Renderizar las tarjetas
                updatePagination(allData.length); // Actualizar la paginación
            });
            paginationContainer.appendChild(backItem);
        }
    }    

    // Buscador
    searchInput.addEventListener("input", function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredData = allData.filter(item => {
            return Object.values(item).some(value => 
                value.toString().toLowerCase().includes(searchTerm)
            );
        });
        renderCards(filteredData);
    });

    // Filtro de orden
    filterSelect.addEventListener("change", function() {
        if (filterSelect.value === "nuevo") {
            allData.sort((a, b) => b.id.localeCompare(a.id)); 
        } else if (filterSelect.value === "antiguo") {
            allData.sort((a, b) => a.id.localeCompare(b.id));
        }
        renderCards(allData);
    });
});
