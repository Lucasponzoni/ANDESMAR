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

                    <div class="d-flex align-items-center">
                        <p class="card-text remitoCard">${data[i].remito}</p>
                        <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>

                    <select class= "tipoElectrodomesticoBna" id="tipoElectrodomesticoBna-${i}" name="TipoElectrodomestico" onchange="rellenarMedidas(this)">
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

function rellenarMedidas(selectElement) {
    const selectedValue = selectElement.value;
    const card = selectElement.closest('.card'); // Obtener la tarjeta más cercana
    const medidasDiv = card.querySelector('.medidas'); // Div donde se agregarán las medidas

    // Limpiar el div de medidas antes de agregar nuevos campos
    medidasDiv.innerHTML = '';

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
            alto = 49.5; 
            ancho = 72; 
            largo = 27; 
            peso = 40; 
            valor = 600000; // Medidas de la unidad exterior
            altoInterior = 30; anchoInterior = 73; largoInterior = 19;
            break;
        case "split3300":
            alto = 49.5; 
            ancho = 72; 
            largo = 27; 
            peso = 50; 
            valor = 700000; // Medidas de la unidad exterior
            altoInterior = 32; anchoInterior = 101; largoInterior = 22;
            break;
        case "split4500":
            alto = 30; 
            ancho = 82; 
            largo = 60.5; 
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
            ancho = 100.7; 
            largo = 42.4; 
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

    // Crear el div con las medidas en cm³ y m³ como una card
const medidasTextoDiv = document.createElement('div');
medidasTextoDiv.innerHTML = `
    <div class="card-body-medidas">
        <h5 class="card-title"><i class="bi bi-rulers"></i> Medidas</h5>
        <div class="row">
            <div class="col-6 text-center">
                <i class="bi bi-box"></i> <strong>${alto * ancho * largo} cm³</strong>
            </div>
            <div class="col-6 text-center">
                <i class="bi bi-arrows-fullscreen"></i> <strong>${((alto * ancho * largo) / 1000000).toFixed(2)} m³</strong>
            </div>
        </div>
    </div>
`;
medidasDiv.appendChild(medidasTextoDiv);

    // Crear el div con los inputs para las medidas exteriores
    const bultoDiv = document.createElement('div');
    bultoDiv.className = 'bultoImput mb-3'; // Añadido margen inferior

    bultoDiv.innerHTML = `
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-expand"></i></span>
            <input type="number" id="alto0" name="Alto0" class="form-control" step="1" value="${alto}" required>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-expand-vertical"></i></span>
            <input type="number" id="ancho0" name="Ancho0" class="form-control" step="1" value="${ancho}" required>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-arrows-angle-expand"></i></span>
            <input type="number" id="largo0" name="Largo0" class="form-control" step="1" value="${largo}" required>
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text"><i class="bi bi-plus-circle"></i></span>
            <input type="number" id="cantidad0" name="Cantidad0" class="form-control" step="1" value="1" min="1" required>
        </div>
    `;

    medidasDiv.appendChild(bultoDiv);

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
                    <input type="number" id="altoInterior0" name="AltoInterior0" class="form-control" step="1" value="${altoInterior}" required>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-expand-vertical"></i></span>
                    <input type="number" id="anchoInterior0" name="AnchoInterior0" class="form-control" step="1" value="${anchoInterior}" required>
                </div>
                <div class="input-group me-2">
                    <span class="input-group-text"><i class="bi bi-arrows-angle-expand"></i></span>
                    <input type="number" id="largoInterior0" name="LargoInterior0" class="form-control" step="1" value="${largoInterior}" required>
                </div>
                <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-plus-circle"></i></span>
                    <input type="number" id="cantidadInterior0" name="CantidadInterior0" class="form-control" step="1" value="1" min="1" required>
                </div>
            </div>
        `;

        medidasDiv.appendChild(bultoInteriorDiv);
        

        // Vincular la cantidad del interior con la cantidad del exterior
        const cantidadExterior = bultoDiv.querySelector('#cantidad0');
        const cantidadInterior = bultoInteriorDiv.querySelector('#cantidadInterior0');

        cantidadExterior.addEventListener('input', () => {
            cantidadInterior.value = cantidadExterior.value;
        });

        cantidadInterior.addEventListener('input', () => {
            cantidadExterior.value = cantidadInterior.value;
        });
    }
}

// Llamar a la función cuando se carga la página
window.onload = loadEnviosFromFirebase;
