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
const db = firebase.database();

let allData = [];
let currentPage = 1;
let itemsPerPage = 50; // Número de elementos por página
let currentPageGroup = 0;
const paginationContainer = document.getElementById('pagination');

// Al abrir el modal, establecer el foco en el primer input
$('#ingresoModal').on('shown.bs.modal', function () {
    $('#remito').focus();
});

// Función para formatear el valor a pesos argentinos
function formatearValor(valor) {
    return `$${parseFloat(valor).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Manejar el evento 'keypress' para el escáner
document.getElementById('ingresoForm').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evitar el comportamiento por defecto

        const activeElement = document.activeElement;

        if (activeElement.id === 'remito') {
            const remitoValue = activeElement.value;
            // Remitos del 230 al 239
            if (/^23[0-9]\d{8}$/.test(remitoValue)) {
                // Verificar si el remito ya existe en Firebase
                db.ref('DespachosLogisticos').orderByChild('remito').equalTo(remitoValue).once('value', snapshot => {
                    if (snapshot.exists()) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Remito ya escaneado',
                            text: 'Este remito ya fue escaneado antes y existe en el sistema.',
                        });
                    } else {
                        $('#cliente').focus(); // Mover al campo cliente si no existe
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Número de remito inválido',
                    text: 'Debe comenzar con 230 o 238 y tener 11 dígitos.',
                });
            }
        } else if (activeElement.id === 'cliente') {
            const clienteValue = activeElement.value;
            if (clienteValue.length < 3) {
                Swal.fire({
                    icon: 'error',
                    title: 'Número de cliente inválido',
                    text: 'Debe tener al menos 3 dígitos.',
                });
            } else if (clienteValue.length > 8) {
                Swal.fire({
                    icon: 'error',
                    title: 'Número de cliente inválido',
                    text: 'No debe tener más de 8 dígitos.',
                });
            } else {
                $('#valorDeclarado').focus(); // Mover al campo de valor declarado
            }
        } else if (activeElement.id === 'valorDeclarado') {
            const remitoValue = $('#remito').val();
            const clienteValue = $('#cliente').val();
            const valorDeclaradoValue = activeElement.value;
            const fechaHora = new Date().toLocaleString(); // Obtener la fecha y hora actual

            // Push a Firebase solo si todos los campos están llenos
            if (valorDeclaradoValue) {
                firebase.database().ref('DespachosLogisticos').push({
                    cliente: clienteValue,
                    estado: "Pendiente de despacho",
                    fechaHora: fechaHora,
                    operadorLogistico: "Pendiente",
                    remito: remitoValue,
                    remitoVBA: remitoValue,
                    valorDeclarado: formatearValor(valorDeclaradoValue) // Formatear el valor antes de guardar
                })
                .then(() => {
                    // Agregar el nuevo registro a la tabla
                    const newRow = `<tr>
                                        <td>${fechaHora}</td>
                                        <td>Pendiente de despacho</td>
                                        <td>${clienteValue}</td>
                                        <td>${remitoValue}</td>
                                        <td>${formatearValor(valorDeclaradoValue)}</td>
                                        <td>Pendiente</td>
                                    </tr>`;
                    const tableBody = document.querySelector('#data-table tbody');
                    tableBody.insertAdjacentHTML('afterbegin', newRow); // Agregar nuevo registro en la parte superior

                    // Limpiar los inputs después de guardar
                    $('#remito').val('');
                    $('#cliente').val('');
                    $('#valorDeclarado').val('');
                    $('#remito').focus(); // Regresar foco al input de remito
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al guardar',
                        text: error.message,
                    });
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Campo de valor declarado vacío',
                    text: 'Por favor, ingrese un valor.',
                });
            }
        }
    }
});

// Cargar datos desde Firebase
function cargarDatos() {
    db.ref('DespachosLogisticos').once('value').then(snapshot => {
        allData = []; // Limpiar allData
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Limpiar tabla

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            allData.push(data); // Almacenar datos en allData
        });

        // Invertir el orden de allData
        allData.reverse();

        // Renderizar la primera página de datos
        renderCards(allData);
        // Actualizar la paginación
        updatePagination(allData.length);
        
        // Ocultar el spinner al cargar los datos
        document.getElementById('spinner').style.display = 'none';
    }).catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar datos',
            text: error.message,
        });
    });
}

function renderCards(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; // Limpiar tabla

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);

    for (let i = startIndex; i < endIndex; i++) {
        const item = data[i];
        const estadoClass = item.estado === "Pendiente de despacho" ? "pendiente-despacho" : ""; // Clase condicional
        const alertIcon = item.estado === "Pendiente de despacho" ? '<i class="bi bi-exclamation-triangle-fill text-warning"></i>' : ''; // Ícono de alerta

        // Usar remitoVBA si remito no existe
        const remito = item.remito ? item.remito : item.remitoVBA;

        const row = `<tr>
                        <td>${item.fechaHora}</td>
                        <td class="${estadoClass}">${alertIcon} ${item.estado}</td>
                        <td>${item.cliente}</td>
                        <td class="remito-columna">${remito}</td>
                        <td class="valor-columna">${item.valorDeclarado}</td>
                        <td>${item.operadorLogistico}</td>
                    </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row); // Agregar nuevo registro
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

// Cargar datos al iniciar la página
window.onload = cargarDatos;
