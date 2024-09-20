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
            const lines = content.split('\n');
            let importedCount = 0; // Contador para SweetAlert
            const promises = []; // Array para controlar las promesas de Firebase

            lines.forEach(line => {
                const fields = line.split('|;|').map(field => field.replace(/^\|/, '').replace(/\|$/, '').trim());

                // Asignación de campos
                const name = `${fields[0]} ${fields[1]}`;
                const cp = fields[2];
                const localidad = fields[3];
                const calle = fields[4];
                const numero = fields[5];
                const telefono = fields[6];
                const email = fields[7];
                const remito = fields[8];
                const observaciones = fields[9];

                // Validación para evitar tarjetas genéricas
                if (fields.length === 10 && name !== 'NOMBRE APELLIDO') {
                    // Crear el objeto a enviar a Firebase
                    const envioData = {
                        nombre: name,
                        cp: cp,
                        localidad: localidad,
                        calle: calle,
                        numero: numero,
                        telefono: telefono,
                        email: email,
                        remito: remito,
                        observaciones: observaciones
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
    } else {
        spinner.remove();
        alert('Por favor, selecciona un archivo.');
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
        snapshot.forEach(function(childSnapshot) {
            const data = childSnapshot.val();
            allData.push({ 
                id: childSnapshot.key, 
                nombre: capitalizeWords(data.nombre), 
                cp: capitalizeWords(data.cp), 
                localidad: capitalizeWords(data.localidad),
                calle: capitalizeWords(data.calle), 
                numero: capitalizeWords(data.numero), 
                telefono: capitalizeWords(data.telefono),
                email: lowercaseWords(data.email), // Aplicar lowercaseWords aquí
                remito: capitalizeWords(data.remito),
                observaciones: capitalizeWords(data.observaciones),
            });
        });
    
        // Invertir el array para mostrar la última tarjeta arriba
        allData.reverse();

        // Renderizar las tarjetas y la paginación
        renderCards(allData);
        updatePagination(allData.length);
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

        card.innerHTML = `
    <div class="card">
        <div class="card-body">
            <div class="em-state-bna"><img id="Tienda BNA" src="./Img/tienda-bna.jpg"></div>
            <h5 class="card-title"><i class="bi bi-person-bounding-box"></i> ${data[i].nombre}</h5>
            <p class="card-text cpLocalidad"><i class="bi bi-geo-alt"></i> ${data[i].cp}, ${data[i].localidad}</p>
            <p class="card-text"><i class="bi bi-house"></i> Calle: ${data[i].calle}, Altura: ${data[i].numero}</p>
            <p class="card-text"><i class="bi bi-telephone"></i> Teléfono: ${data[i].telefono}</p>
            <p class="card-text"><i class="bi bi-envelope"></i> ${data[i].email}</p>
            <p class="card-text"><i class="bi bi-file-earmark-text"></i> Remito: ${data[i].remito}</p>
            <button class="btn btn-primary btn-sm mt-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapseObservaciones-${data[i].id}" aria-expanded="false" aria-controls="collapseObservaciones-${data[i].id}">
                <i class="bi bi-chevron-down"></i> Notas <i class="bi bi-sticky-fill"></i>
            </button>
            <div class="collapse" id="collapseObservaciones-${data[i].id}">
                <div class="mb-3 mt-2 divObs">
                    <label for="observaciones-${data[i].id}" class="form-label">Observaciones</label>
                    <textarea id="observaciones-${data[i].id}" class="form-control-obs" placeholder="Agregar observaciones" style="resize: both; min-height: 50px;">${data[i].observaciones || ''}</textarea>
                    <button class="btn btn-primary mt-1 update-observaciones" data-id="${data[i].id}">Actualizar Observaciones</button>
                </div>
            </div>
        </div>
    </div>
`;
cardsContainer.appendChild(card);

    }

    // Agregar el evento para actualizar observaciones
    addUpdateObservacionesEvent();
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

// Llamar a la función cuando se carga la página
window.onload = loadEnviosFromFirebase;
