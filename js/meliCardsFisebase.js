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

// Función para cargar datos de Firebase
function cargarDatos() {
    const spinner = document.getElementById('spinner');
    const cardsContainer = document.getElementById('meli-cards');

    spinner.style.display = 'block'; // Muestra el spinner
    cardsContainer.innerHTML = ''; // Limpia el contenedor de cards

    database.ref('envios').once('value')
        .then(snapshot => {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                const card = crearCard(data);
                cardsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error al cargar los datos: ", error);
        })
        .finally(() => {
            spinner.style.display = 'none'; // Oculta el spinner
        });
}

// Función para crear una card
function crearCard(data) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-md-4';

    cardDiv.innerHTML = `
        <div class="card position-relative">
            <div class="em-circle">ME1</div>
            <div class="em-circle-isFraud">Fraude</div>
            <div class="em-circle-state">Envio pendiente</div>
            <div class="card-body">
                <h5 class="card-title-meli"><i class="bi bi-person-bounding-box"></i> ${data.NombreyApellido}</h5>
                <h6 class="user-title-meli">${data.nombreDeUsuario}</h6>
                <div class="meli-box1"> 
                    <p class="card-text cpLocalidad-meli"><i class="fas fa-map-marker-alt"></i> ${data.Cp}, ${data.localidad}, ${data.Provincia}</p>
                    <p class="card-text cpLocalidad-meli correo-andesmar">${data.Correosugerido}</p>    
                </div>
                <div class="d-flex align-items-center">
                    <p class="remitoCardMeli card-text mb-0">${data.idOperacion}</p>
                    <button class="btn btn-link btn-sm text-decoration-none copy-btn ms-2" style="color: #007bff;">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <button class="btn btn-outline-secondary w-100 collapps-envio-meli" data-bs-toggle="collapse" data-bs-target="#collapseDetails${data.idOperacion}" aria-expanded="false" aria-controls="collapseDetails${data.id}">
                    <i class="bi bi-chevron-down"></i> Ver más detalles
                </button>
                <div class="collapse" id="collapseDetails${data.idOperacion}">
                    <div class="little-card-meli">
                        <p><i class="fas fa-home"></i> Calle: ${data.Calle}</p>
                        <p><i class="bi bi-123"></i> Altura: ${data.Altura}</p>
                        <p><i class="fas fa-phone"></i> Telefono: ${data.Telefono}</p>
                        <p><i class="bi bi-envelope-at-fill"></i> Email: ${data.Email}</p>
                        <p><i class="bi bi-sticky-fill"></i> Observaciones: ${data.Observaciones}</p>
                    </div>
                    <div class="dimensions-info">
                        <h6>Dimenciones</h6>
                        <div><i class="bi bi-bag-fill"></i> Producto: ${data.Producto}</div>
                        <div><i class="bi bi-code-square"></i> SKU: ${data.SKU} </div>
                        <div><i class="bi bi-arrows-angle-expand"></i> ${data.medidas}</div>
                        <div><i class="bi bi-box-arrow-in-down"></i> Peso: ${data.Peso} kg</div>
                        <div><i class="bi bi-box"></i> Volumen M³: ${data['Volumen M³']} m³</div>
                        <div><i class="bi bi-box"></i> Volumen CM³: ${data['Volumen CM³']} cm³</div>
                        <div><i class="bi bi-boxes"></i> Cantidad: ${data.Cantidad}</div>
                    </div>
                </div>
                <a href="" target="_blank" class="btn btn-primary"><i class="bi bi-file-earmark-arrow-down-fill"></i> Andesmar</a>
                <a href="" target="_blank" class="btn btn-danger"><i class="bi bi-file-earmark-arrow-down-fill"></i> Andreani</a>
            </div>
        </div>
    `;
    return cardDiv;
}

// Llama a la función cargarDatos al cargar la página
window.onload = cargarDatos;
