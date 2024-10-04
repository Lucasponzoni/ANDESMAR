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
            const fechaHora = new Date(); // Obtener la fecha y hora actual

            function formatearFechaHora(fechaHora) {
                const dia = fechaHora.getDate();
                const mes = fechaHora.getMonth() + 1; // Los meses son 0-11
                const año = fechaHora.getFullYear();
                const horas = fechaHora.getHours();
                const minutos = fechaHora.getMinutes();
                const segundos = fechaHora.getSeconds();

                // Formatear con ceros a la izquierda
                return `${dia}/${mes}/${año}, ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
            }

            // Push a Firebase solo si todos los campos están llenos
            if (valorDeclaradoValue) {
                const fechaHoraFormateada = formatearFechaHora(fechaHora); // Formatear a 24 horas
                firebase.database().ref('DespachosLogisticos').push({
                    cliente: clienteValue,
                    estado: "Pendiente de despacho",
                    fechaHora: fechaHoraFormateada,
                    operadorLogistico: "Pendiente",
                    remito: remitoValue,
                    remitoVBA: remitoValue,
                    valorDeclarado: formatearValor(valorDeclaradoValue) // Formatear el valor antes de guardar
                })
                .then(() => {
                    // Agregar el nuevo registro a la tabla
                    const newRow = `<tr>
                                        <td>${fechaHoraFormateada}</td>
                                        <td>Pendiente de despacho</td>
                                        <td>${clienteValue}</td>
                                        <td>${remitoValue}</td>
                                        <td>${formatearValor(valorDeclaradoValue)}</td>
                                        <td>Pendiente</td>
                                        <td><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
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

function cargarDatos() {
    db.ref('DespachosLogisticos').once('value').then(snapshot => {
        allData = []; // Limpiar allData
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Limpiar tabla

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            // Ajustar la fecha y hora aquí
            allData.push(data); // Almacenar datos en allData
        });

        // Invertir el orden de allData
        allData.reverse();

        // Renderizar la primera página de datos
        renderCards(allData);
        // Actualizar la paginación
        updatePagination(allData.length);
        
        // Calcular porcentajes de Andesmar y Andreani en base a todos los datos
        calcularPorcentajes(allData);
        
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

function calcularPorcentajes(data) {
    const totalEnvios = data.length;
    let countAndreani = 0;
    let countAndesmar = 0;
    let countPendientes = 0;

    data.forEach(item => {
        if (item.numeroDeEnvio) {
            const numeroDeEnvio = item.numeroDeEnvio;
            if ((numeroDeEnvio.length === 10 && numeroDeEnvio.startsWith('501')) || 
                (numeroDeEnvio.length === 15 && numeroDeEnvio.startsWith('36'))) {
                countAndreani++;
            } else {
                countAndesmar++;
            }
        }

        // Contar los pendientes de despacho
        if (item.estado === "Pendiente de despacho") {
            countPendientes++;
        }
    });

    // Calcular porcentajes
    const andreaniPorcentaje = totalEnvios > 0 ? ((countAndreani / totalEnvios) * 100).toFixed(2) : 0;
    const andesmarPorcentaje = totalEnvios > 0 ? ((countAndesmar / totalEnvios) * 100).toFixed(2) : 0;
    const pendientesPorcentaje = totalEnvios > 0 ? ((countPendientes / totalEnvios) * 100).toFixed(2) : 0;

// Actualizar el HTML
document.getElementById('andreaniPorcentaje').innerHTML = `
<div class="d-flex align-items-center flex-wrap">
    <i class="bi bi-truck-front-fill icono-tiempo"></i>
    <span class="ml-1" style="font-weight: bold;">Andreani: ${andreaniPorcentaje}%</span>
</div>
`;

document.getElementById('andesmarPorcentaje').innerHTML = `
<div class="d-flex align-items-center flex-wrap">
    <i class="bi bi-truck-front-fill icono-tiempo"></i>
    <span class="ml-1" style="font-weight: bold;">Andesmar: ${andesmarPorcentaje}%</span>
</div>
`;

document.getElementById('SinDespacharPorcentaje').innerHTML = `
<div class="d-flex align-items-center flex-wrap">
    <i class="bi bi-stopwatch-fill" style="font-size: 1.2em;"></i>
    <span class="ml-1" style="font-weight: bold;">Pendientes de despacho: ${pendientesPorcentaje}%</span>
    <span class="badge badge-danger mx-2" style="font-size: 0.9em; border-radius: 8px; padding: 12px 0.5em;">
        ${countPendientes} remitos en preparación <i class="bi bi-asterisk"></i>
    </span>
</div>
`;
}

function eliminarFila(button) {
    const row = button.closest('tr');
    
    Swal.fire({
        title: 'Ingrese la contraseña 🔒',
        input: 'password',
        inputLabel: 'Contraseña de Eliminacion (Solicitela a Lucas)',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        preConfirm: (password) => {
            if (password !== '6572') {
                Swal.showValidationMessage('Contraseña incorrecta');
            }
            return password;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const remitoValue = row.cells[3].innerText; // Asumiendo que el remito está en la 4ta celda
            // Eliminar de Firebase
            db.ref('DespachosLogisticos').orderByChild('remito').equalTo(remitoValue).once('value', snapshot => {
                snapshot.forEach(childSnapshot => {
                    childSnapshot.ref.remove().then(() => {
                        row.remove(); // Eliminar la fila de la tabla
                        Swal.fire('Eliminado!', 'La fila ha sido eliminada.', 'success');
                    }).catch((error) => {
                        Swal.fire('Error!', 'No se pudo eliminar la fila.', 'error');
                    });
                });
            });
        }
    });
}

function calcularTiempoTranscurrido(fechaHora) {
    const [fecha, hora] = fechaHora.split(', ');
    const [dia, mes, año] = fecha.split('/').map(Number);
    const [horas, minutos, segundos] = hora.split(':').map(Number);
    
    const fechaCarga = new Date(año, mes - 1, dia, horas, minutos, segundos);
    const ahora = new Date();
    const diferencia = ahora - fechaCarga;

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return { dias, horas: horasRestantes, minutos: minutosRestantes, totalMs: diferencia };
}

function formatearTiempoPromedio(totalMs, count) {
    const totalDias = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalHoras = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const totalMinutos = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${totalDias}d ${totalHoras}h ${totalMinutos}m`;
}

function renderCards(data) {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    let totalTiempo = 0; // Variable para acumular el tiempo total
    let count = 0; // Contador de elementos con tiempo transcurrido

    for (let i = startIndex; i < endIndex; i++) {
        const item = data[i];
        const estadoClass = item.estado === "Pendiente de despacho" ? "pendiente-despacho" : 
                            item.estado === "Despachado" ? "estado-despachado" : "";
        const alertIcon = item.estado === "Pendiente de despacho" ? '<i class="bi bi-exclamation-triangle-fill text-warning icon-state-ios"></i>' : 
                          item.estado === "Despachado" ? '<i class="bi bi-check-circle-fill text-success icon-state-ios"></i>' : '';

        const remito = item.remito ? item.remito : item.remitoVBA;
        const formattedDateTime = formatDateTime(item.fechaHora);
        const tiempoTranscurrido = item.estado === "Pendiente de despacho" ? 
        calcularTiempoTranscurrido(item.fechaHora) : null;    

        // Sumar el tiempo si está pendiente de despacho
        if (tiempoTranscurrido) {
            totalTiempo += tiempoTranscurrido.totalMs;
            count++;
        }

        const tiempoTexto = tiempoTranscurrido ? 
            `<span class="tiempo-transcurrido"><i class="bi bi-clock icono-tiempo"></i>${tiempoTranscurrido.dias}d ${tiempoTranscurrido.horas}h ${tiempoTranscurrido.minutos}m</span>` : '';

        let operadorLogistico = '';

        if (item.numeroDeEnvio) {
            const numeroDeEnvio = item.numeroDeEnvio;
            let link, imgSrc;

            // Verificar el formato del número de envío
            if ((numeroDeEnvio.length === 10 && numeroDeEnvio.startsWith('501')) || 
                (numeroDeEnvio.length === 15 && numeroDeEnvio.startsWith('36'))) {
                link = `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${numeroDeEnvio}`;
                imgSrc = './Img/andreani-mini.png'; // Ruta de la imagen
                operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-andreani"><img src="${imgSrc}" alt="Andreani" class="img-transporte"></a>`;
            } else {
                link = `https://andesmarcargas.com/seguimiento.html?numero=${numeroDeEnvio}&tipo=Orden`;
                imgSrc = './Img/andesmar-mini.png'; // Ruta de la imagen
                operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-andesmar"><img src="${imgSrc}" alt="Andesmar" class="img-transporte"></a>`;
            }
        } else {
            operadorLogistico = item.operadorLogistico; // Si no hay número de envío, mostrar el operador logístico original
        }

        const row = `<tr>
                        <td>${formattedDateTime}</td>
                        <td class="${estadoClass}">${alertIcon} ${item.estado} ${tiempoTexto}</td>
                        <td>${item.cliente}</td>
                        <td class="remito-columna">${remito}</td>
                        <td class="valor-columna">${item.valorDeclarado}</td>
                        <td>${operadorLogistico}</td>
                        <td><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
                    </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    }

    // Calcular el promedio si hay tiempos
    if (count > 0) {
        const promedioTexto = formatearTiempoPromedio(totalTiempo / count, count);
        document.getElementById('promedioBtn').innerHTML = `<i class="bi bi-alarm-fill"></i> Promedio: ${promedioTexto}`;
    } else {
        document.getElementById('promedioBtn').innerHTML = `<i class="bi bi-alarm-fill"></i> Promedio: -`;
    }
}

// Función para formatear la fecha y hora
function formatDateTime(fechaHora) {
    const [fecha, hora] = fechaHora.split(', ');
    const [dia, mes, año] = fecha.split('/').map(Number);
    const [horas, minutos, segundos] = hora.split(':').map(Number);
    
    const date = new Date(año, mes - 1, dia, horas, minutos, segundos);
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    
    return date.toLocaleString('es-AR', options); // Usar formato de 24 horas
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

