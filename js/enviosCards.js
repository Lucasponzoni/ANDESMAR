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

    // Mostrar el spinner
    spinner.style.display = "flex";

    // Obtener los datos de Firebase
    database.ref('enviosAndesmar').once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            allData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });

        // Ordenar los datos por ID, de más nuevo a más viejo por defecto
        allData.sort((a, b) => b.id.localeCompare(a.id));

        // Renderizar las cards
        function renderCards(data) {
            cardsContainer.innerHTML = ""; // Limpiar el contenedor
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedData = data.slice(startIndex, endIndex);

            paginatedData.forEach(async (item) => {
                const card = document.createElement("div");
                card.className = "col-md-4"; // 3 cards por fila en desktop
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
                            <!-- Aquí se agregará el estado del seguimiento -->
                            <a href="https://andesmarcargas.com/seguimiento.html?numero=${item.remito}&tipo=remito&cod=" target="_blank" class="btn btn-primary">Realizar seguimiento</a>
                            <a href="https://andesmarcargas.com/ImprimirEtiqueta.html?NroPedido=${item.nroPedido}" target="_blank" class="btn btn-warning"><i class="bi bi-file-earmark-arrow-down-fill"></i></a>
                        </div>
                    </div>
                `;
            
                // Agregar la lógica del botón de copiar al portapapeles
                const copyButton = card.querySelector('.copy-btn');
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(item.remito).then(() => {
                        copyButton.innerHTML = 'Copiado';
                        setTimeout(() => {
                            copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
                        }, 2000); // Después de 2 segundos, vuelve a mostrar el icono del portapapeles
                    }).catch(err => console.error('Error al copiar al portapapeles: ', err));
                });
            
                // Realizar solicitud a la API para obtener el estado actual
                try {
                    const response = await fetch('https://proxy.cors.sh/https://api.andesmarcargas.com/api/EstadoActual', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-cors-api-key': 'temp_02193751c5190a008c46c2c6dfa7b919' // Llave de la API de CORS
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
            
                    // Crear div para mostrar el estado de la respuesta de la API
                    const estadoDiv = document.createElement('div');
                    estadoDiv.className = 'mb-3 apiSeguimiento'; // Añadir un margen inferior
            
                    // Verificar el estado de la respuesta y mostrar la información
                    const guia = data.NroGuia === "0" ? "PENDIENTE DE INGRESO" : `GUIA: ${data.NroGuia}`;
                    const estadoActual = `ESTADO: ${data.EstadoActual.toUpperCase()}`;
                    const fecha = `FECHA: ${new Date(data.FechaEmision).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
            
                    estadoDiv.innerHTML = `
                        <p class="card-text"><i class="bi bi-truck"></i> ${guia}</p>
                        <p class="card-text"><i class="bi bi-info-circle"></i> ${estadoActual}</p>
                        <p class="card-text"><i class="bi bi-calendar"></i> ${fecha}</p>
                    `;
            
                    // Insertar el div de estado antes de los dos últimos elementos
                    const cardBody = card.querySelector('.card-body');
                    const lastTwoElements = cardBody.querySelectorAll('a.btn');
                    if (lastTwoElements.length >= 2) {
                        cardBody.insertBefore(estadoDiv, lastTwoElements[0]);
                    }
                } catch (error) {
                    console.error('Error al obtener el estado de seguimiento:', error);
                }
            
                cardsContainer.appendChild(card);
            });            
                      
            
            // Actualizar paginación
            updatePagination(data.length);
        }

        function updatePagination(totalItems) {
            paginationContainer.innerHTML = "";
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            for (let i = 1; i <= totalPages; i++) {
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
        }

        // Inicializar renderizado
        renderCards(allData);

        // Ocultar el spinner
        spinner.style.display = "none";

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
                allData.sort((a, b) => b.id.localeCompare(a.id)); // Ordenar de más nuevo a más viejo
            } else {
                allData.sort((a, b) => a.id.localeCompare(b.id)); // Ordenar de más viejo a más nuevo
            }
            renderCards(allData);
        });
    }).catch((error) => {
        console.error("Error al cargar los datos de Firebase:", error);
        spinner.style.display = "none"; // Ocultar el spinner en caso de error
    });
});