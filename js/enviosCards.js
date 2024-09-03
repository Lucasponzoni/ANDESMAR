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

            paginatedData.forEach(item => {
                const card = document.createElement("div");
                card.className = "col-md-4"; // 3 cards por fila en desktop
                card.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title"><i class="fas fa-user"></i> ${item.nombreApellido}</h5>
                            <p class="card-text"><i class="fas fa-map-marker-alt"></i> ${item.codigoPostal}, ${item.localidad}</p>
                            <p class="card-text"><i class="fas fa-home"></i> ${item.calleDelDestinatario}, ${item.numeroDeCalle}</p>
                            <p class="card-text"><i class="fas fa-phone"></i> Telefono: ${item.telefono}</p>
                            <p class="card-text"><i class="fas fa-receipt"></i> Número de Andesmar: ${item.nroPedido}</p>
                            <p class="card-text"><i class="bi bi-file-earmark-text-fill"></i> ${item.remito}</p>
                            <p class="card-text"><i class="bi bi-bank2"></i> Cotización: ${item.cotizacion}</p>
                            <a href="#" class="btn btn-primary">Realizar seguimiento</a>
                        </div>
                    </div>
                `;
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
