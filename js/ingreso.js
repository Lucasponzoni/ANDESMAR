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
let itemsPerPage = 50;
let currentPageGroup = 0;
const paginationContainer = document.getElementById('pagination');

let isFiltered = false; // Variable para controlar si los datos están filtrados

// FILTRAR PENDIENTES
document.getElementById('filterOldestBtn').addEventListener('click', function() {
    const filteredData = allData.filter(item => item.estado === "Pendiente de despacho");

    // Ordenar los datos filtrados por tiempo transcurrido de mayor a menor
    filteredData.sort((a, b) => {
        const tiempoA = calcularTiempoTranscurrido(a.fechaHora).totalMs;
        const tiempoB = calcularTiempoTranscurrido(b.fechaHora).totalMs;
        return tiempoB - tiempoA; // Ordenar de mayor a menor
    });

    // Renderizar los datos filtrados
    renderCards(filteredData);
    updatePagination(filteredData.length);
    
    // Mostrar el botón de volver atrás
    const backButton = document.getElementById('btnVolverAtras');
    backButton.style.display = 'inline-block';
    paginationContainer.classList.add('hidden');
    isFiltered = true;
});

// Lógica para el botón de volver atrás
document.getElementById('btnVolverAtras').addEventListener('click', function() {
    if (isFiltered) {
        // Volver a la vista original
        renderCards(allData);
        updatePagination(allData.length);

        // Ocultar el botón de volver atrás
        this.style.display = 'none';
        paginationContainer.classList.remove('hidden');
        isFiltered = false; // Restablecer el estado de filtrado
    }
});

// Recargar la página al cerrar los modales
$('#ingresoModal').on('hidden.bs.modal', function () {
    location.reload();
});

$('#logisticaModal').on('hidden.bs.modal', function () {
    location.reload();
});

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
                firebase.database().ref(`DespachosLogisticos/${remitoValue}`).set({
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
    // Inicializa el campo de búsqueda
    const searchInput = document.getElementById('searchDespachosLogistica');
    // Mensaje inicial
    searchInput.value = "Aguardando que cargue la web ⏳";
    searchInput.disabled = true;

    db.ref('DespachosLogisticos').once('value').then(snapshot => {
        allData = []; // Limpiar allData
        const tableBody = document.querySelector('#data-table tbody');
        tableBody.innerHTML = ''; // Limpiar tabla

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            allData.push(data); // Almacenar datos en allData
        });

        // Ordenar allData por fecha del más viejo al más nuevo
        allData.sort((a, b) => {
            const dateA = new Date(a.fechaHora.split(',')[0].split('/').reverse().join('-') + 'T' + a.fechaHora.split(',')[1].trim());
            const dateB = new Date(b.fechaHora.split(',')[0].split('/').reverse().join('-') + 'T' + b.fechaHora.split(',')[1].trim());
            return dateA - dateB; // Ordenar de más viejo a más nuevo
        });

        // Invertir el orden para que quede del más nuevo al más viejo
        allData.reverse();

        renderCards(allData);
        calcularPorcentajes(allData);
        updatePagination(allData.length);
        
        // Ocultar el spinner al cargar los datos
        document.getElementById('spinner').style.display = 'none';
        searchInput.value = ""; 
        searchInput.disabled = false; 
    }).catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar datos',
            text: error.message,
        });
    });
}

function calcularPorcentajes(data) {
    let countAndreani = 0;
    let countAndesmar = 0;
    let countCruzDelSur = 0;
    let countOca = 0; // Nueva variable para OCA
    let countPlaceIt = 0; // Nueva variable para PlaceIt
    let countPendientes = 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // Fecha de hace 30 días

    data.forEach(item => {
        const [day, month, year] = item.fechaHora.split(',')[0].split('/');
        const itemDate = new Date(`${year}-${month}-${day}`);

        if (itemDate >= thirtyDaysAgo) {
            if (item.numeroDeEnvio) {
                const numeroDeEnvio = item.numeroDeEnvio;
                // Contar envíos de Andreani
                if ((((numeroDeEnvio.length === 10 && numeroDeEnvio.startsWith('501')) || 
                    (numeroDeEnvio.length === 15 && numeroDeEnvio.startsWith('36'))) || 
                    (numeroDeEnvio.length === 15 && numeroDeEnvio.startsWith('4')))) {
                    countAndreani++;
                } else if ((numeroDeEnvio.length === 10 && numeroDeEnvio.startsWith('1')) || 
                           (numeroDeEnvio.length === 9 && numeroDeEnvio.startsWith('1'))) {
                    countCruzDelSur++;
                } else if (numeroDeEnvio.length === 19 && numeroDeEnvio.startsWith('4')) { 
                    countOca++;
                } else {
                    countAndesmar++;
                }
            }

            // Contar envíos de PlaceIt
            if (item.operadorLogistico === "PlaceIt") {
                countPlaceIt++;
            }

            // Contar los pendientes de despacho
            if (item.estado === "Pendiente de despacho") {
                countPendientes++;
            }
        }
    });

    const totalEnvios = countAndreani + countAndesmar + countCruzDelSur + countOca + countPlaceIt; // Incluir PlaceIt en total

    // Calcular porcentajes
    const andreaniPorcentaje = totalEnvios > 0 ? ((countAndreani / totalEnvios) * 100).toFixed(2) : 0;
    const andesmarPorcentaje = totalEnvios > 0 ? ((countAndesmar / totalEnvios) * 100).toFixed(2) : 0;
    const cruzDelSurPorcentaje = totalEnvios > 0 ? ((countCruzDelSur / totalEnvios) * 100).toFixed(2) : 0;
    const ocaPorcentaje = totalEnvios > 0 ? ((countOca / totalEnvios) * 100).toFixed(2) : 0; // Porcentaje de OCA
    const placeItPorcentaje = totalEnvios > 0 ? ((countPlaceIt / totalEnvios) * 100).toFixed(2) : 0; // Porcentaje de PlaceIt

    // Actualizar el HTML
    document.getElementById('andreaniPorcentaje').innerHTML = `
    <img src="./Img/andreani-mini.png" alt="Andreani" class="gray-filter"> 
    <div class="d-flex align-items-center flex-wrap">
        <span class="ml-1" style="font-weight: bold;">Andreani: ${andreaniPorcentaje}%</span>
    </div>
    <span class="ml-1 conteo-Andreani" style="font-size: 0.9em;">${countAndreani} despachos</span>
    <div class="pie-chart" style="--percentage: ${andreaniPorcentaje}; --color: #dc3545;"></div>
    `;

    document.getElementById('andesmarPorcentaje').innerHTML = `
    <img src="./Img/andesmar-mini.png" alt="Andesmar" class="gray-filter">  
    <div class="d-flex align-items-center flex-wrap">
        <span class="ml-1" style="font-weight: bold;">Andesmar: ${andesmarPorcentaje}%</span>
    </div>
        <span class="ml-1 conteo-andesmar" style="font-size: 0.9em;">${countAndesmar} despachos</span>
        <div class="pie-chart" style="--percentage: ${andesmarPorcentaje}; --color: #007bff;"></div>
    `;

    document.getElementById('cruzDelSurPorcentaje').innerHTML = `
    <img src="./Img/cds-mini.png" alt="Cruz del Sur" class="gray-filter">   
    <div class="d-flex align-items-center flex-wrap">
        <span class="ml-1" style="font-weight: bold;">CDS: ${cruzDelSurPorcentaje}%</span>
    </div>
        <span class="ml-1 conteo-cds" style="font-size: 0.9em;">${countCruzDelSur} despachos</span>
        <div class="pie-chart" style="--percentage: ${cruzDelSurPorcentaje}; --color: #003366;"></div>
    `;

    document.getElementById('ocaPorcentaje').innerHTML = `
    <img src="./Img/oca-mini.png" alt="OCA" class="gray-filter">   
    <div class="d-flex align-items-center flex-wrap">
        <span class="ml-1" style="font-weight: bold;">OCA: ${ocaPorcentaje}%</span>
    </div>
        <span class="ml-1 conteo-oca" style="font-size: 0.9em;">${countOca} despachos</span>
        <div class="pie-chart" style="--percentage: ${ocaPorcentaje}; --color: #5B2B82;"></div>
    `;

    // Actualizar el HTML para PlaceIt
    document.getElementById('placeItPorcentaje').innerHTML = `
    <img src="./Img/placeit-mini2.png" alt="PlaceIt" class="gray-filter">   
    <div class="d-flex align-items-center flex-wrap">
        <span class="ml-1" style="font-weight: bold;">PlaceIt: ${placeItPorcentaje}%</span>
    </div>
        <span class="ml-1 conteo-placeit" style="font-size: 0.9em;">${countPlaceIt} despachos</span>
        <div class="pie-chart" style="--percentage: ${placeItPorcentaje}; --color: #ff0078;"></div>
    `;

    document.getElementById('SinDespacharPorcentaje').innerHTML = `
    <div class="macos-button-porcentaje">
        <span class="ml-1"><i class="bi bi-stopwatch-fill" style="font-size: 1.2em;"></i> Pendientes:</span> <span class="pill-preparacion">${countPendientes}</span> en preparación
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

    // Calcular el promedio de todos los elementos antes de la paginación
    let totalTiempo = 0; // Variable para acumular el tiempo total
    let count = 0; // Contador de elementos con tiempo transcurrido

    data.forEach(item => {
        if (item.estado === "Pendiente de despacho") {
            const tiempoTranscurrido = calcularTiempoTranscurrido(item.fechaHora);
            if (tiempoTranscurrido) {
                totalTiempo += tiempoTranscurrido.totalMs;
                count++;
            }
        }
    });

    // Calcular el promedio si hay tiempos
    if (count > 0) {
        const promedioTexto = formatearTiempoPromedio(totalTiempo / count, count);
        document.getElementById('promedioBtn').innerHTML = `<i class="bi bi-alarm-fill"></i> Promedio: ${promedioTexto}`;
    } else {
        document.getElementById('promedioBtn').innerHTML = `<i class="bi bi-alarm-fill"></i> Promedio: -`;
    }

    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);

    for (let i = startIndex; i < endIndex; i++) {
        const item = data[i];
        
        const estadoClass = 
            item.estado === "Pendiente de despacho" ? "pendiente-despacho" : 
            item.estado === "Despachado" ? "estado-despachado" : 
            item.estado.startsWith("Se entrega el día") ? "estado-entrega2" : 
            item.estado === "Envio Express PlaceIt" ? "estado-despachado" : "";
    
        const alertIcon = 
            item.estado === "Pendiente de despacho" ? '<i class="bi bi-exclamation-triangle-fill text-warning icon-state-ios"></i>' : 
            item.estado === "Despachado" ? '<i class="bi bi-check-circle-fill text-success icon-state-ios"></i>' : 
            item.estado === "Envio Express PlaceIt" ? '<i class="bi bi-lightning-charge-fill text-success icon-state-ios"></i>' :
            item.estado.startsWith("Se entrega el día") ? '<i class="bi bi-box-seam-fill"></i>' : '';

        const remito = item.remito ? item.remito : item.remitoVBA;
        const formattedDateTime = formatDateTime(item.fechaHora);
        const tiempoTranscurrido = item.estado === "Pendiente de despacho" ? 
        calcularTiempoTranscurrido(item.fechaHora) : null;    

        const tiempoTexto = tiempoTranscurrido ? 
            `<span class="tiempo-transcurrido"><i class="bi bi-clock icono-tiempo"></i>${tiempoTranscurrido.dias}d ${tiempoTranscurrido.horas}h ${tiempoTranscurrido.minutos}m</span>` : '';

            let operadorLogistico = '';

            if (item.numeroDeEnvio) {
                const numeroDeEnvio = item.numeroDeEnvio;
                let link, imgSrc;
            
            // Verificar si el operador logístico es "PlaceIt"
                if (item.operadorLogistico === "PlaceIt" && item.estado === "Envio Express PlaceIt") {
                    imgSrc = './Img/placeit-mini.png';
                    operadorLogistico = `<a class="btn-ios btn-placeit" disabled><img src="${imgSrc}" alt="PlaceIt" class="img-transporte"></a>`;
                } else if ((numeroDeEnvio.length === 10 && numeroDeEnvio.startsWith('501')) || 
                           (numeroDeEnvio.length === 15 && (numeroDeEnvio.startsWith('36') || numeroDeEnvio.startsWith('40')))) {
                    link = `https://lucasponzoni.github.io/Tracking-Andreani/?trackingNumber=${numeroDeEnvio}`;
                    imgSrc = './Img/andreani-mini.png'; // Ruta de la imagen
                    operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-andreani"><img src="${imgSrc}" alt="Andreani" class="img-transporte"></a>`;
                } else if (numeroDeEnvio.length === 10 && numeroDeEnvio.startsWith('1')) {
                    const numeroDeEnvioCorto = numeroDeEnvio.slice(0, -1);
                    link = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${numeroDeEnvioCorto}`;
                    imgSrc = './Img/cds-mini.png'; // Ruta de la imagen
                    operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-cds"><img src="${imgSrc}" alt="Cruz del Sur" class="img-transporte"></a>`;
                } else if (numeroDeEnvio.length === 19) {
                    link = `https://www.aftership.com/es/track/oca-ar/${numeroDeEnvio}`; // Reemplaza con la URL correspondiente
                    imgSrc = './Img/oca-mini.png'; // Ruta de la imagen
                    operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-oca2"><img src="${imgSrc}" alt="Oca" class="img-transporte"></a>`;
                } else if (numeroDeEnvio.length === 9 && numeroDeEnvio.startsWith('1')) {
                    link = `https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=${numeroDeEnvio}`;
                    imgSrc = './Img/cds-mini.png'; // Ruta de la imagen
                    operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-cds"><img src="${imgSrc}" alt="Cruz del Sur" class="img-transporte"></a>`;
                } else {
                    link = `https://andesmarcargas.com/seguimiento.html?numero=${numeroDeEnvio}&tipo=remito`;
                    imgSrc = './Img/andesmar-mini.png'; // Ruta de la imagen
                    operadorLogistico = `<a href="${link}" target="_blank" class="btn-ios btn-andesmar"><img src="${imgSrc}" alt="Andesmar" class="img-transporte"></a>`;
                }
            } else {
                // Si el operador logístico es "Logística Novogar"
                if (item.operadorLogistico === "Logística Novogar") {
                    operadorLogistico = `<button class="btn-ios btn-novogar" onclick="generarPDF('${remito}', '${item.cliente}', '${item.estado}', '${item.operadorLogistico}',this)"><img class="NovogarMeli" src="Img/novogar-tini.png" alt="Novogar"> Novogar</button>`;
                } else if (item.operadorLogistico === "Logística Novogar StaFe") {
                    operadorLogistico = `<button class="btn-ios btn-novogar2" onclick="generarPDF('${remito}', '${item.cliente}', '${item.estado}', '${item.operadorLogistico}',this)"><img class="NovogarMeli2" src="Img/novogar-tini.png" alt="Novogar"> Santa Fé</button>`;
                } else if (item.operadorLogistico === "Logística Novogar Rafaela") {
                    operadorLogistico = `<button class="btn-ios btn-novogar2" onclick="generarPDF('${remito}', '${item.cliente}', '${item.estado}', '${item.operadorLogistico}',this)"><img class="NovogarMeli2" src="Img/novogar-tini.png" alt="Novogar"> Rafaela</button>`;
                } else if (item.operadorLogistico === "Logística Novogar BsAs") {
                    operadorLogistico = `<button class="btn-ios btn-novogar2" onclick="generarPDF('${remito}', '${item.cliente}', '${item.estado}', '${item.operadorLogistico}',this)"><img class="NovogarMeli2" src="Img/novogar-tini.png" alt="Novogar"> Buenos Aires</button>`;
                } else if (item.operadorLogistico === "Logística Novogar SanNicolas") {
                    operadorLogistico = `<button class="btn-ios btn-novogar2" onclick="generarPDF('${remito}', '${item.cliente}', '${item.estado}', '${item.operadorLogistico}',this)"><img class="NovogarMeli2" src="Img/novogar-tini.png" alt="Novogar"> San Nicolás</button>`;
                } else {
                    operadorLogistico = item.operadorLogistico; // Mostrar el operador logístico original
                }
            }                                 

        // Agregar estilo e ícono si el estado inicia con "(se entrega entre"
        const entregaEntreClass = item.estado.startsWith("(se entrega entre") ? "estado-entrega" : "";
        const entregaEntreIcon = item.estado.startsWith("(se entrega entre") ? '<i class="bi bi-check-circle-fill icon-state-ios"></i>' : '';

        const comentarioClase = item.comentario ? 'btn-success' : 'btn-secondary';

        let subdatoTexto = item.subdato ? 
            `<br><span class="${item.subdato.startsWith('Pendiente de confirmar') ? 'subdato-texto1' : 'subdato-texto2'}">${item.subdato}</span>` : '';
        
        // Verificar si existe item.fotoURL y crear el botón de descarga
        let remitoColumna = remito;
        if (item.fotoURL) {
            const fileName = `Remito de entrega Cliente ${item.cliente} - Remito ${remito}`;
            remitoColumna += `<br><button class="btn btn-primary btn-sm" onclick="abrirFoto('${item.fotoURL}')"><i class="bi bi-download"></i> Remito</button>`;
            
            // Si existe item.fotoURL y item.subdato, mostrar subdato específico
            if (item.subdato) {
                subdatoTexto = `<br><span class="subdato-texto3">Producto entregado, remito disponible</span>`;
            }
        }

        const row = `<tr>
            <td>${formattedDateTime}</td>
            <td class="${estadoClass} ${entregaEntreClass}">${alertIcon} ${entregaEntreIcon} ${item.estado} ${subdatoTexto} ${tiempoTexto}</td>
            <td>${item.cliente}</td>
            <td class="remito-columna">${remitoColumna}</td>
            <td class="valor-columna">${item.valorDeclarado}</td>
            <td>${operadorLogistico}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
            <td><button class="btn ${comentarioClase} btn-sm" onclick="abrirModalComentario('${remito}', this)"><i class="bi bi-pencil-fill"></i></button></td> <!-- Botón de comentario -->        </tr>`;

        tableBody.insertAdjacentHTML('beforeend', row);
    }
}

// Función para abrir la foto en una nueva pestaña
function abrirFoto(url) {
    window.open(url, '_blank');
}

async function generarPDF(remito, cliente, fechaEntrega, operadorLogistico, button) {

    let spinner = document.getElementById("spinner2");
    spinner.style.display = "flex";

    const { jsPDF } = window.jspdf;

    // Crear un nuevo documento PDF en tamaño 10x15 cm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [15, 10], // [ancho, alto] en cm
        putOnlyUsedFonts: true,
        floatPrecision: 16 // Precisión para los números flotantes
    });

    // Determinar la imagen según el operador logístico
    let logoSrc = './Img/Camion-Rosario.png';
    if (operadorLogistico === 'Logística Novogar BsAs') {
        logoSrc = './Img/Camion-BsAs-Novogar.png';
    } else if (operadorLogistico === 'Logística Novogar StaFe') {
        logoSrc = './Img/Camion-Santa-fe-Novogar.png';
    } else if (operadorLogistico === 'Logística Novogar Rafaela') {
        logoSrc = './Img/Camion-Rafaela-Novogar.png';
    } else if (operadorLogistico === 'Logística Novogar SanNicolas') {
        logoSrc = './Img/Camion-SNicolas-Novogar.png';
    }

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
            margin: 10px;
            padding: 0;
            display: grid;
            place-items: center; /* Centra el contenido en ambos ejes */
            height: 100vh;
            background-color: #f0f0f0;
            }
            .etiqueta {
                width: 10cm;
                margin: 5px;
                height: auto; /* Ajuste automático para el contenido */
                max-height: 15cm; /* Limitar la altura máxima */
                border: 2px dashed #000;
                border-radius: 10px;
                padding: 1cm; /* Ajustado para más espacio */
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                font-family: Arial, sans-serif;
                background-color: #fff;
            }
            .logo {
                text-align: center;
                margin-bottom: 15px; /* Ajustado */
            }
            .logo img {
                max-width: 300px; /* Ajustado */
                height: auto;
                display: block; /* Asegura que la imagen sea un bloque */
                margin: 0 auto; /* Centra la imagen */
            }
            .campo {
                border-radius: 10px;
                display: flex;
                align-items: center;
                margin-bottom: 6px; /* Ajustado */
                padding: 8px; /* Ajustado */
                border: 2px solid #ccc;
                background-color: #f9f9f9;
            }
            .campo i {
                margin-right: 8px; /* Ajustado */
                font-size: 1.2em; /* Ajustado */
                color: #000;
            }
            .campo span {
                font-size: 1em; /* Ajustado */
                font-weight: bold;
                color: #333;
            }
            .footer {
                text-align: center;
                font-size: 0.9em; /* Ajustado */
                color: #000;
                margin-top: auto;
                padding-top: 10px;
                border-top: 2px solid #ccc;
            }
            .contacto {
                font-size: 0.8em; /* Ajustado */
                color: #333;
                margin-top: 10px;
                text-align: center;
            }
            .contacto p {
                margin: 3px 0; /* Ajustado */
            }
            .campo-extra {
                border-radius: 8px;
                margin-top: 10px; /* Ajustado */
                border: 2px dashed #ccc;
                padding: 5px; /* Ajustado */
                text-align: center;
                font-size: 0.9em; /* Ajustado */
                color: #555;
            }
        </style>
    </head>
    <body>
        <div class="etiqueta">
            <div class="logo">
                <img src="${logoSrc}" alt="Logo">
            </div>
            <div class="campo">
                <i class="bi bi-file-earmark-text"></i>
                <span>Número de Remito: ${remito}</span>
            </div>
            <div class="campo">
                <i class="bi bi-person-circle"></i>
                <span>Cliente: ${cliente}</span>
            </div>
            <div class="campo">
                <i class="bi bi-calendar-check"></i>
                <span>Vence: ${fechaEntrega}</span>
            </div>
          <div class="campo">
                <i class="bi bi-telephone-outbound-fill"></i>
                <span>Telefono: </span>
            </div>
            <div class="campo-extra">
                <p><strong>Firma:</strong> ________________________</p>
            </div>
            <div class="campo-extra">
                <p><strong>Aclaración:</strong> ________________________</p>
            </div>
            <div class="campo-extra">
                <p><strong>DNI:</strong> ________________________</p>
            </div>
            <div class="contacto">
                <p>Ante cualquier inconveniente, contáctese con posventa:</p>
                <p><strong><i class="bi bi-chat-dots-fill"></i></strong> (0341) 6680658 (Solo WhatsApp)</p>
                <p><i class="bi bi-envelope-check-fill"></i> posventa@novogar.com.ar</p>
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
        doc.addImage(imgData, 'PNG', 0, 0, 10, 15); // Ajustar a 10x15 cm
        const pdfBlob = doc.output('blob');

        // Crear un enlace para abrir el PDF en una nueva ventana
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Esperar 2 segundos antes de abrir el PDF
        setTimeout(() => {
            spinner.style.display = "none";
            window.open(pdfUrl, '_blank');
            
            let buttonText = 'Novogar';
            if (operadorLogistico === 'Logística Novogar BsAs') {
                buttonText = 'Buenos Aires';
            } else if (operadorLogistico === 'Logística Novogar StaFe') {
                buttonText = 'Santa Fé';
            } else if (operadorLogistico === 'Logística Novogar Rafaela') {
                buttonText = 'Rafaela';
            } else if (operadorLogistico === 'Logística Novogar SanNicolas') {
                buttonText = 'San Nicolás';
            }
        
        }, 2000); // Retraso de 2000 ms (2 segundos)
        
        document.body.removeChild(tempDiv); // Eliminar el elemento temporal
        }).catch(error => {
            spinner.style.display = "none";
            console.error("Error al generar el PDF:", error);
            
            let buttonText = 'Novogar';
            if (operadorLogistico === 'Logística Novogar BsAs') {
                buttonText = 'Buenos Aires';
            } else if (operadorLogistico === 'Logística Novogar StaFe') {
                buttonText = 'Santa Fé';
            } else if (operadorLogistico === 'Logística Novogar Rafaela') {
                buttonText = 'Rafaela';
            }
        
        });
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

// Evento al abrir el modal para enfocar el input
$('#logisticaModal').on('shown.bs.modal', function () {
    $('#remitoLogistica').focus();
});

// Evento para manejar el escaneo al presionar "Enter"
document.getElementById('remitoLogistica').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Evitar el comportamiento por defecto
        const remitoValue = this.value;

        // Verificar si el remito es válido
        if (/^23[0-9]\d{8}$/.test(remitoValue)) {
            // Buscar en Firebase
            db.ref('DespachosLogisticos').orderByChild('remito').equalTo(remitoValue).once('value', snapshot => {
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        const data = childSnapshot.val();
                        const fechaEntrega = new Date();
                        const fechaEntregaStr = `${fechaEntrega.getDate()}/${fechaEntrega.getMonth() + 1}/${fechaEntrega.getFullYear()}`;
                        const horaEntregaStr = `${fechaEntrega.getHours()}:${fechaEntrega.getMinutes()}:${fechaEntrega.getSeconds()}`;
                        const fechaEntregaFinal = `${fechaEntrega.getDate()}/${fechaEntrega.getMonth() + 1}/${fechaEntrega.getFullYear()}, ${horaEntregaStr}`;

                        // Sumar 3 días a la fecha de entrega, omitiendo domingos
                        let diasSumados = 0;
                        while (diasSumados < 3) {
                            fechaEntrega.setDate(fechaEntrega.getDate() + 1);
                            if (fechaEntrega.getDay() !== 0) { // 0 es domingo
                                diasSumados++;
                            }
                        }

                        const fechaEntregaFinalStr = `${fechaEntrega.getDate()}/${fechaEntrega.getMonth() + 1}/${fechaEntrega.getFullYear()}`;

                        // Actualizar el estado en Firebase
                        childSnapshot.ref.update({
                            estado: `(se entrega entre ${fechaEntregaStr} & ${fechaEntregaFinalStr})`,
                            operadorLogistico: "Logística Novogar" // Agregar operador logístico
                        }).then(() => {
                            // Agregar el nuevo estado a la tabla
                            const newRow = `<tr>
                                                <td>${fechaEntregaStr}</td>
                                                <td>(se entrega entre ${fechaEntregaStr} & ${fechaEntregaFinalStr})</td>
                                                <td>${data.cliente}</td>
                                                <td>${remitoValue}</td>
                                                <td>${data.valorDeclarado}</td>
                                                <td>Logística Novogar</td> <!-- Mostrar operador logístico -->
                                                <td><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
                                            </tr>`;
                            const tableBody = document.querySelector('#data-table tbody');
                            tableBody.insertAdjacentHTML('afterbegin', newRow); // Agregar nuevo registro en la parte superior

                            // Mostrar alerta
                            mostrarAlerta('Estado actualizado a Logística Propia.', 'success');

                            // Limpiar el input y volver a enfocar
                            $('#remitoLogistica').val('');
                            $('#remitoLogistica').focus();
                        }).catch(error => {
                            mostrarAlerta('Error al actualizar el estado: ' + error.message, 'error');
                        });
                    });
                } else {
                    mostrarAlerta('Remito no encontrado.', 'error');
                }
            });
        } else {
            mostrarAlerta('Número de remito inválido. Debe comenzar con 230 o 238 y tener 11 dígitos.', 'error');
        }
    }
});

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.top = '10px'; 
    alerta.style.zIndex = '1050'; 
    alerta.style.height = '55px'; 
    alerta.style.margin = '0 15px'; 
    alerta.role = 'alert';
    alerta.innerHTML = mensaje; // Sin botón de cerrar
    document.body.insertBefore(alerta, document.body.firstChild);

    // Ocultar la alerta después de 5 segundos
    setTimeout(() => {
        alerta.classList.remove('show');
        alerta.classList.add('fade');
        setTimeout(() => alerta.remove(), 500);
    }, 5000);
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

const searchInput = document.getElementById("searchDespachosLogistica");

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
    
    // Si el término de búsqueda está vacío, mostrar la tabla completa
    if (searchTerm === "") {
        document.getElementById("search-despachos").innerHTML = ""; // Limpiar el mensaje de error
        renderCards(allData); // Renderiza todos los datos
        updatePagination(allData.length); // Actualiza la paginación con todos los datos
    } else if (filteredData.length === 0) {
        // Si no se encuentra ningún resultado, mostrar una imagen de error
        document.getElementById("search-despachos").innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center text-center w-100">
                <p class="errorp">No se encontraron resultados para "${searchTerm}"</p>
                <img src="./Img/error.gif" alt="No se encontraron resultados" class="error img-fluid mb-3">
            </div>
        `;
    } else {
        // Renderizar las tarjetas y actualizar la paginación con los datos filtrados
        document.getElementById("search-despachos").innerHTML = ""; // Limpiar el mensaje de error si hay resultados
        renderCards(filteredData);
        updatePagination(filteredData.length);
    }
});

// FIN BUSCADOR

// MODAL COMENTARIO
function abrirModalComentario(remito, button) {
    // Obtener el comentario de Firebase
    db.ref('DespachosLogisticos').orderByChild('remito').equalTo(remito).once('value', snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                document.getElementById('comentarioInput').value = data.comentario || ''; // Cargar comentario existente
            });
        } else {
            document.getElementById('comentarioInput').value = ''; // Limpiar si no existe
        }
    });

    // Mostrar el modal
    $('#comentarioModal').modal('show');

    // Manejar el clic en el botón para guardar el comentario
    document.getElementById('guardarComentarioBtn').onclick = function() {
        const comentario = document.getElementById('comentarioInput').value;

        // Actualizar el comentario en Firebase
        db.ref('DespachosLogisticos').orderByChild('remito').equalTo(remito).once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                childSnapshot.ref.update({ comentario: comentario }).then(() => {
                    Swal.fire('¡Éxito!', 'Comentario actualizado correctamente.', 'success');
                    $('#comentarioModal').modal('hide'); // Cerrar modal

                    // Cambiar el color del botón
                    button.classList.remove('btn-secondary');
                    button.classList.add('btn-success');
                }).catch(error => {
                    Swal.fire('Error', 'No se pudo actualizar el comentario: ' + error.message, 'error');
                });
            });
        });
    };
}

// Ajustar el tamaño del input de comentario
const comentarioInput = document.getElementById('comentarioInput');

comentarioInput.addEventListener('input', () => {
    comentarioInput.style.height = 'auto'; // Resetea la altura
    comentarioInput.style.height = `${comentarioInput.scrollHeight}px`; // Ajusta a la altura del contenido
});

// FIN MODAL COMENTARIO

/*
// NOTIFICADOR DE COMENTARIO EN FACTURACION
document.addEventListener("DOMContentLoaded", function() {
    const statusCard = document.getElementById('statusCard');
    const closeCardButton = document.getElementById('closeCard');
    const countdownElement = document.getElementById('countdown');
    let countdown = 20; // Tiempo en segundos

    // Mostrar la card
    statusCard.style.display = 'block';

    // Actualizar el temporizador cada segundo
    const timerInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timerInterval);
            statusCard.style.display = 'none';
        }
    }, 2000);

    // Cerrar la card al hacer clic en el botón
    closeCardButton.onclick = function() {
        clearInterval(timerInterval);
        statusCard.style.display = 'none';
    };
});
*/

// MODAL LOGISTICA BS AS - RAFAELA - SANTA FE
let diaPredeterminado = {
    BsAs: null,
    StaFe: null,
    Rafaela: null
};

$('#bsarStaFeModal').on('shown.bs.modal', function () {
    const remitoInput = $('#remitoLogisticaBsArStaFe');
    remitoInput.prop('disabled', true);
    remitoInput.val('Seleccione Logistica para desbloquear');
    remitoInput.focus();
});

$('#bsarStaFeModal').on('hidden.bs.modal', function () {
    location.reload();
});

function cargarDiaPredeterminado(logistica) {
    const ref = logistica === 'BsAs' ? 'DiaPredeterminadoBsAs' : 
                 logistica === 'StaFe' ? 'DiaPredeterminadoStaFe' : 
                 logistica === 'Rafaela' ? 'DiaPredeterminadoRafaela' : 
                 'DiaPredeterminadoSanNicolas';
    db.ref(ref).once('value').then(snapshot => {
        diaPredeterminado[logistica] = snapshot.val();
        actualizarBotones(logistica);
        mostrarDiaEntrega(logistica);
        const remitoInput = $('#remitoLogisticaBsArStaFe');
        remitoInput.prop('disabled', false);
        remitoInput.val('');
        remitoInput.focus();
    });
}

function actualizarBotones(logistica) {
    const botones = {
        BsAs: 'logisticaBsAsButton',
        StaFe: 'logisticaSantaFeButton',
        Rafaela: 'logisticaRafaelaButton',
        SanNicolas: 'logisticaSanNicolasButton'
    };

    Object.keys(botones).forEach(key => {
        const buttonElement = document.getElementById(botones[key]);
        if (key === logistica) {
            buttonElement.classList.add('btn-primary');
            buttonElement.classList.remove('btn-outline-primary');
            buttonElement.style.color = 'white';
            buttonElement.innerHTML = `<i class="bi bi-lightning-charge-fill"></i> ${key}`;
        } else {
            buttonElement.classList.add('btn-outline-primary');
            buttonElement.classList.remove('btn-primary');
            buttonElement.style.color = 'green';
            buttonElement.style.borderColor = 'green';
            buttonElement.innerHTML = `<i class="bi bi-arrow-repeat"></i> ${key}`;
        }
    });
}

function mostrarDiaEntrega(logistica) {
    const diaEntregaText = document.getElementById('diaEntregaText');
    const diaEntregaAlert = document.getElementById('diaEntregaAlert');
    diaEntregaText.innerHTML = `Día de entrega: ${diaPredeterminado[logistica].toUpperCase()}`;
    diaEntregaAlert.style.display = 'block';
    setTimeout(() => {
        diaEntregaAlert.style.display = 'none';
    }, 5000);
}

function obtenerProximoDia(fecha, dia) {
    const diasDeLaSemana = {
        'lunes': 1,
        'martes': 2,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sabado': 6,
        'domingo': 0
    };
    const diaActual = fecha.getDay();
    let diasParaSumar = (diasDeLaSemana[dia] - diaActual + 7) % 7;
    if (diasParaSumar === 0) diasParaSumar = 7; // Si es hoy, sumar 7 días adicionales
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + diasParaSumar);
}

function confirmarLogistica() {
    const remito = document.getElementById('remitoLogisticaBsArStaFe').value.trim();
    const camionCheckbox = document.getElementById('camionCheckbox').checked;

    if (!remito) {
        alert('Ingrese el número de remito');
        return;
    }

    const logisticaSeleccionada = Object.keys(diaPredeterminado).find(key => diaPredeterminado[key] !== null);
    if (!logisticaSeleccionada) {
        alert('Seleccione una logística');
        return;
    }

    if (!/^(230|231|232|233|234|235|236|237|238|239)\d{8}$/.test(remito)) {
        Swal.fire('Error', 'El valor ingresado no corresponde a un remito válido.', 'error');
        return;
    }

    db.ref('DespachosLogisticos').orderByKey().equalTo(remito).once('value').then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                if (childSnapshot.val().subdato) {
                    Swal.fire('Error', 'El Remito ya fue escaneado anteriormente.', 'error');
                    $('#remitoLogisticaBsArStaFe').val('');
                    return;
                }

                const fechaActual = new Date();
                let fechaProximoDia = obtenerProximoDia(fechaActual, diaPredeterminado[logisticaSeleccionada]);

                // Verificar si el checkbox está desmarcado y si solo falta un día para la fecha de entrega
                if (!camionCheckbox) {
                    const diasDeLaSemana = {
                        'lunes': 1,
                        'martes': 2,
                        'miercoles': 3,
                        'jueves': 4,
                        'viernes': 5,
                        'sabado': 6,
                        'domingo': 0
                    };
                    const diaActual = fechaActual.getDay();
                    const diaEntrega = diasDeLaSemana[diaPredeterminado[logisticaSeleccionada].toLowerCase()];
                    const diasParaEntrega = (diaEntrega - diaActual + 7) % 7;

                    if (diasParaEntrega <= 1) {
                        fechaProximoDia = new Date(fechaProximoDia.getFullYear(), fechaProximoDia.getMonth(), fechaProximoDia.getDate() + 7);
                    }
                }

                const diaFormateado = fechaProximoDia.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
                
                const estado = `Se entrega el día ${diaFormateado}`;
                const subdato = `Pendiente de confirmar en CAMION ${logisticaSeleccionada.toUpperCase()}`;
                const operadorLogistico = `Logística Novogar ${logisticaSeleccionada.charAt(0).toUpperCase() + logisticaSeleccionada.slice(1)}`;
                
                // Actualizar el estado en Firebase
                childSnapshot.ref.update({
                    estado,
                    subdato,
                    operadorLogistico
                }).then(() => {
                    // Agregar el nuevo estado a la tabla
                    const newRow = `<tr>
                                        <td>${childSnapshot.val().fechaHora}</td>
                                        <td>${estado}</td>
                                        <td>${childSnapshot.val().cliente}</td>
                                        <td class="remito-columna">${remito}</td>
                                        <td class="valor-columna">${childSnapshot.val().valorDeclarado}</td>
                                        <td>${operadorLogistico}</td>
                                        <td><button class="btn btn-danger btn-sm" onclick="eliminarFila(this)">X</button></td>
                                    </tr>`;
                    const tableBody = document.querySelector('#data-table tbody');
                    tableBody.insertAdjacentHTML('afterbegin', newRow); // Agregar nuevo registro en la parte superior

                    // Mostrar alerta
                    mostrarAlerta('Estado actualizado a Logística Propia.', 'success');

                    // Limpiar el input y volver a enfocar
                    $('#remitoLogisticaBsArStaFe').val('');
                    $('#remitoLogisticaBsArStaFe').focus();
                }).catch(error => {
                    mostrarAlerta('Error al actualizar el estado: ' + error.message, 'error');
                });
            });
        } else {
            mostrarAlerta('Remito no encontrado.', 'error');
        }
    }).catch(error => {
        mostrarAlerta('Error al buscar el remito: ' + error.message, 'error');
    });
}

document.getElementById('remitoLogisticaBsArStaFe').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evitar que la página se recargue
        confirmarLogistica();
    }
});

function toggleLogisticsInput() {
    const button = document.getElementById('unknownLogisticsButton');
    const inputContainer = document.getElementById('logisticsInputContainer');
    const logisticsAlert = document.getElementById('logisticsAlert33');

    if (inputContainer.style.display === 'none') {
        button.classList.remove('btn-danger');
        button.classList.add('btn-secondary');
        button.innerHTML = '<i class="bi bi-x-circle-fill"></i> Ocultar búsqueda de logística';
        inputContainer.style.display = 'block';
    } else {
        button.classList.remove('btn-secondary');
        button.classList.add('btn-danger');
        button.innerHTML = '<i class="bi bi-question-circle-fill"></i> No conozco la logística del código postal';
        inputContainer.style.display = 'none';
        logisticsAlert.style.display = 'none';
    }
}

document.getElementById('logisticsCpInput').addEventListener('input', function () {
    const cp = this.value.trim();
    const logisticsAlert = document.getElementById('logisticsAlert33');

    if (cp.length === 4) {
        Promise.all([
            db.ref('LogBsAs').once('value'),
            db.ref('LogSantaFe').once('value'),
            db.ref('LogRafaela').once('value'),
            db.ref('LogSanNicolas').once('value')
        ]).then(([bsAsSnapshot, staFeSnapshot, rafaelaSnapshot, sanNicolasSnapshot]) => {
            let found = false;

            if (bsAsSnapshot.hasChild(cp)) {
                logisticsAlert.innerHTML = '<i class="bi bi-check-circle-fill"></i> Se encontró CP en <strong>LOGÍSTICA BUENOS AIRES</strong>';
                logisticsAlert.classList.remove('Alert34', 'Alert36');
                logisticsAlert.classList.add('Alert35');
                logisticsAlert.style.display = 'block';
                found = true;
            } else if (staFeSnapshot.hasChild(cp)) {
                logisticsAlert.innerHTML = '<i class="bi bi-check-circle-fill"></i> Se encontró CP en <strong>LOGÍSTICA SANTA FE</strong>';
                logisticsAlert.classList.remove('Alert34', 'Alert36');
                logisticsAlert.classList.add('Alert35');
                logisticsAlert.style.display = 'block';
                found = true;
            } else if (rafaelaSnapshot.hasChild(cp)) {
                logisticsAlert.innerHTML = '<i class="bi bi-check-circle-fill"></i> Se encontró CP en <strong>LOGÍSTICA RAFAELA</strong>';
                logisticsAlert.classList.remove('Alert34', 'Alert36');
                logisticsAlert.classList.add('Alert35');
                logisticsAlert.style.display = 'block';
                found = true;
            } else if (sanNicolasSnapshot.hasChild(cp)) {
                logisticsAlert.innerHTML = '<i class="bi bi-check-circle-fill"></i> Se encontró CP en <strong>LOGÍSTICA SAN NICOLÁS</strong>';
                logisticsAlert.classList.remove('Alert34', 'Alert36');
                logisticsAlert.classList.add('Alert35');
                logisticsAlert.style.display = 'block';
                found = true;
            } else {
                logisticsAlert.innerHTML = '<i class="bi bi-x-circle-fill"></i> No se encontró el CP en ninguna logística propia';
                logisticsAlert.classList.remove('Alert34', 'Alert35');
                logisticsAlert.classList.add('Alert36');
                logisticsAlert.style.display = 'block';
            }
        }).catch(error => {
            logisticsAlert.innerHTML = '<i class="bi bi-x-circle-fill"></i> Error al buscar el CP: ' + error.message;
            logisticsAlert.style.display = 'block';
        });
    } else {
        logisticsAlert.style.display = 'none';
    }
});

// Estilos para los botones
const style = document.createElement('style');
style.innerHTML = `
    .btn-outline-primary:hover {
        color: white !important;
        background-color: green !important;
        border-color: green !important;
    }
`;
document.head.appendChild(style);

// SUBIR REMITO
$('#scanRemitoModal').on('shown.bs.modal', function () {
    $('#remitoInput').focus();
    document.getElementById('remitoInput').value = '';
    const fotoRemitoInput = document.getElementById('fotoRemitoInput');
    fotoRemitoInput.value = '';
});

document.getElementById('scanButton').addEventListener('click', function() {
    // Muestra el contenedor de la cámara
    document.getElementById('camera-preview').style.display = 'block';

    // Quagga para leer códigos Code128
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#camera-preview'),
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["code_128_reader"]
        }
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        Quagga.start();
    });

    // Asegúrate de que el área de enfoque esté visible
    document.querySelector('.focus-area-camera').style.display = 'block';

    Quagga.onDetected(function(data) {
        const code = data.codeResult.code;
        // Verifica que el código escaneado coincida con el formato esperado
        if (code.length === 11 && /^\d+$/.test(code)) {
            document.getElementById('remitoInput').value = code;
            Quagga.stop();
            
            document.getElementById('camera-preview').style.display = 'none';
            
        // Simula el evento "Enter"
        const enterEvent = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13,
            bubbles: true
        });
        document.getElementById('remitoInput').dispatchEvent(enterEvent);

        } else {
            Swal.fire('Error', 'Código escaneado no válido', 'error');
        }
    });
});

// Evento para el campo de entrada para abrir el selector de archivos al presionar Enter
document.getElementById('remitoInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        document.getElementById('fotoRemitoInput').click(); 
    }
});

// Evento para el cambio del input de foto
document.getElementById('fotoRemitoInput').addEventListener('change', function() {
    document.querySelector('.btn-info[onclick="subirFoto()"]').click();
});

// Función para subir la foto
function subirFoto() {
    const remito = document.getElementById('remitoInput').value.trim();
    const fotoInput = document.getElementById('fotoRemitoInput').files[0];
    const loadingSpinner = document.getElementById('loadingSpinner');
    const logisticsAlert = document.getElementById('logisticsAlert');

    if (!remito) {
        Swal.fire('Error', 'Ingrese el número de remito', 'error');
        return;
    }

    if (!fotoInput) {
        Swal.fire('Error', 'Adjunte una foto del remito', 'error');
        return;
    }

    // Verificar si el remito existe en DespachosLogisticos
    const remitoRef = db.ref(`DespachosLogisticos/${remito}`);
    remitoRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            Swal.fire('Error', 'El remito no existe en Base de Datos', 'error');
            return;
        }

        const storageRef = firebase.storage().ref();
        const remitoFotoRef = storageRef.child(`remitos/${remito}.jpg`);

        remitoFotoRef.getDownloadURL().then(() => {
            Swal.fire({
                title: 'El Remito ya existe',
                text: "¿Desea sobreescribir el remito existente?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, sobreescribir'
            }).then((result) => {
                if (result.isConfirmed) {
                    uploadFile(remitoFotoRef, fotoInput, remito);
                }
            });
        }).catch((error) => {
            if (error.code === 'storage/object-not-found') {
                uploadFile(remitoFotoRef, fotoInput, remito);
            } else {
                Swal.fire('Error', 'Error al verificar la existencia de la foto', 'error');
            }
        });
    });
}

// Función para subir el archivo
function uploadFile(remitoFotoRef, fotoInput, remito) {
    const uploadTask = remitoFotoRef.put(fotoInput);
    const loadingSpinner = document.getElementById('loadingSpinner');
    const logisticsAlert = document.getElementById('logisticsAlert');
    loadingSpinner.style.display = 'block';

    uploadTask.on('state_changed', (snapshot) => {
        // No se necesita la barra de progreso
    }, (error) => {
        console.error('Error al subir la foto:', error);
        Swal.fire('Error', 'Error al subir la foto', 'error');
        loadingSpinner.style.display = 'none';
    }, () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            const remitoRef = firebase.database().ref(`DespachosLogisticos/${remito}`);
            remitoRef.update({
                fotoURL: downloadURL
            }).then(() => {
                document.getElementById('scanRemitoForm').reset();
                loadingSpinner.style.display = 'none';
                $('#scanRemitoModal').modal('hide');
                logisticsAlert.innerHTML = `<i class="bi bi-check-circle-fill"></i> Remito actualizado para ${remito}`;
                logisticsAlert.style.display = 'block';
                setTimeout(() => {
                    logisticsAlert.style.display = 'none';
                }, 5000);
                $('#remitoInput').focus();
            }).catch((error) => {
                console.error('Error al guardar el enlace en Firebase:', error);
                Swal.fire('Error', 'Error al guardar el enlace en Firebase', 'error');
                loadingSpinner.style.display = 'none';
            });
        });
    });
}
// FIN SUBIR REMITO

// PANEL DE CONTROL
document.getElementById('controlPanelBtn').addEventListener('click', function () {
    const loadingSpinner = document.getElementById('custom-spinner333'); // ID cambiado
    const controlPanelContent = document.getElementById('controlPanelContent');
    const historialFechas = document.getElementById('historialFechas');
    const operacionesList = document.getElementById('operacionesList');
    const backToHistorialBtn = document.getElementById('backToHistorialBtn');
    const backToFechasBtn = document.getElementById('backToFechasBtn');
    const imprimirCamionBtn = document.createElement('button'); // Crear botón "Imprimir Camión"

    // Configurar el botón "Volver"
    backToFechasBtn.innerHTML = '<i class="bi bi-arrow-left"></i> Volver';

    // Configurar el botón "Imprimir Camión"
    imprimirCamionBtn.id = 'imprimirCamionBtn';
    imprimirCamionBtn.className = 'btn btn-danger mb-2';
    imprimirCamionBtn.innerHTML = '<i class="bi bi-printer"></i> Imprimir Camión';
    imprimirCamionBtn.style.display = 'none'; // Ocultar inicialmente
    backToFechasBtn.parentNode.insertBefore(imprimirCamionBtn, backToFechasBtn.nextSibling); // Insertar el botón después de "Volver"

    // Resetear la visibilidad de los elementos
    console.log("Mostrando spinner...");
    loadingSpinner.classList.remove('hidden'); // Mostrar el spinner
    controlPanelContent.style.display = 'none';
    historialFechas.style.display = 'none';
    operacionesList.style.display = 'none';
    backToHistorialBtn.style.display = 'none';
    backToFechasBtn.style.display = 'none';

    // Consultar Firebase
    fetch('https://despachos-meli-novogar-default-rtdb.firebaseio.com/DespachosLogisticos.json')
        .then(response => {
            console.log("Respuesta recibida de Firebase");
            return response.json();
        })
        .then(data => {
            console.log("Datos obtenidos:", data);

            // Ocultar el spinner y mostrar el contenido del panel de control
            loadingSpinner.classList.add('hidden'); // Ocultar el spinner
            console.log("Ocultando spinner y mostrando contenido del panel de control");
            controlPanelContent.style.display = 'block';

            const historialStaFeBtn = document.getElementById('historialStaFeBtn');
            const historialRafaelaBtn = document.getElementById('historialRafaelaBtn');
            const historialBsAsBtn = document.getElementById('historialBsAsBtn');
            const historialSanNicolasBtn = document.getElementById('historialSanNicolasBtn');
            const fechasList = document.getElementById('fechasList');
            const operacionesListGroup = document.getElementById('operacionesListGroup');

            const operadoresLogisticos = {
                'Logística Novogar StaFe': 'SANTA FE',
                'Logística Novogar BsAs': 'Buenos Aires',
                'Logística Novogar Rafaela': 'RAFAELA',
                'Logística Novogar SanNicolas': 'San Nicolás'
            };

            function extraerFecha(estado) {
                const match = estado.match(/Se entrega el día (.+)/);
                console.log(`Estado: ${estado}, Fecha extraída: ${match ? match[1] : 'Fecha no disponible'}`);
                return match ? match[1] : 'Fecha no disponible';
            }

            function convertirTextoAFecha(texto, referenciaFechaHora) {
                console.log(`Texto a convertir: ${texto}`);
                const partes = texto.match(/(\d{1,2}) DE (\w+)(?: DE (\d{4}))?/);
                if (!partes) {
                    console.log(`No se pudo convertir el texto: ${texto}`);
                    return new Date(NaN); // Fecha inválida
                }
                const dia = parseInt(partes[1]);
                const mes = partes[2].toUpperCase();
                let anio = partes[3] ? parseInt(partes[3]) : null;

                const meses = {
                    'ENERO': 0,
                    'FEBRERO': 1,
                    'MARZO': 2,
                    'ABRIL': 3,
                    'MAYO': 4,
                    'JUNIO': 5,
                    'JULIO': 6,
                    'AGOSTO': 7,
                    'SEPTIEMBRE': 8,
                    'OCTUBRE': 9,
                    'NOVIEMBRE': 10,
                    'DICIEMBRE': 11
                };

                if (!anio) {
                    const referenciaFecha = new Date(referenciaFechaHora);
                    anio = referenciaFecha.getFullYear();
                    if (meses[mes] < referenciaFecha.getMonth() || (meses[mes] === referenciaFecha.getMonth() && dia < referenciaFecha.getDate())) {
                        anio += 1;
                    }
                }

                const dateObj = new Date(anio, meses[mes], dia);
                console.log(`Fecha convertida: ${dateObj}`);
                return dateObj;
            }

            function formatearFecha(dateObj) {
                const dia = String(dateObj.getDate()).padStart(2, '0');
                const mes = String(dateObj.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son 0-indexados
                const anio = dateObj.getFullYear().toString().slice(-2); // Obtener los últimos dos dígitos del año
                return `CAMION de ${dia}/${mes}/${anio}`;
            }

            function mostrarFechas(operadorLogistico) {
                fechasList.innerHTML = '';
                const fechas = {};

                for (const key in data) {
                    if (data.hasOwnProperty(key) && /^\d+$/.test(key)) {
                        const item = data[key];
                        if (item.operadorLogistico === operadorLogistico) {
                            const fecha = extraerFecha(item.estado);
                            if (!fechas[fecha]) {
                                fechas[fecha] = [];
                            }
                            fechas[fecha].push(item);
                        }
                    }
                }

                // Convertir el objeto de fechas a un array y ordenarlas por la fecha convertida
                const fechasArray = Object.keys(fechas).map(fecha => {
                    const items = fechas[fecha];
                    const lastItem = items[items.length - 1];
                    const dateObj = convertirTextoAFecha(fecha, lastItem.fechaHora);
                    console.log(`Fecha: ${fecha}, DateObj: ${dateObj}`);
                    return { fecha: formatearFecha(dateObj), items, dateObj }; // Convertir el texto de la fecha a un objeto de fecha y formatear
                });

                // Ordenar de más nuevo a más viejo
                fechasArray.sort((a, b) => b.dateObj - a.dateObj);

                // Mostrar las fechas ordenadas
                fechasArray.forEach(({ fecha, items }) => {
                    console.log(`Fecha ordenada: ${fecha}`);
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = fecha;
                    li.addEventListener('click', () => mostrarOperaciones(items));
                    fechasList.appendChild(li);
                });

                historialFechas.style.display = 'block';
                backToHistorialBtn.style.display = 'block';
                operacionesList.style.display = 'none';
                console.log("Fechas mostradas para el operador:", operadorLogistico);
            }

            function mostrarOperaciones(operaciones) {
                operacionesListGroup.innerHTML = '';

                operaciones.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'historial-list-group-item list-group-item d-flex justify-content-between align-items-start';
                    
                    const div = document.createElement('div');
                    div.className = 'historial-ms-2 historial-me-auto';
                    
                    const subheading = document.createElement('div');
                    subheading.className = 'historial-fw-bold';
                    
                    const table = document.createElement('table');
                    const tr = document.createElement('tr');
                    const td = document.createElement('td');
                    
                    const remitoStrong = document.createElement('strong');
                    remitoStrong.textContent = item.remitoVBA;
                    
                    td.appendChild(remitoStrong);
                    tr.appendChild(td);
                    table.appendChild(tr);
                    
                    subheading.appendChild(table);
                    
                    div.appendChild(subheading);
                    div.innerHTML += `Preparado: ${item.fechaHora} - Cliente <strong class="historial-strong">${item.cliente}</strong> / Declarado: ${item.valorDeclarado}`;
                    
                    li.appendChild(div);

                    const badge = document.createElement('span');
                    badge.className = 'badge rounded-pill';
                    if (item.fotoURL) {
                        badge.classList.add('text-bg-primary');
                        badge.textContent = 'Remito disponible';
                        badge.addEventListener('click', () => window.open(item.fotoURL, '_blank'));
                    } else {
                        badge.classList.add('text-bg-danger');
                        badge.classList.add('disabled');
                        badge.textContent = 'El remito no retorno';
                    }
                    li.appendChild(badge);
                    operacionesListGroup.appendChild(li);
                });

                operacionesList.style.display = 'block';
                backToFechasBtn.style.display = 'block';
                imprimirCamionBtn.style.display = 'block'; // Mostrar el botón "Imprimir Camión"
                historialFechas.style.display = 'none';
                console.log("Operaciones mostradas:", operaciones);
            }

            historialStaFeBtn.addEventListener('click', () => mostrarFechas('Logística Novogar StaFe'));
            historialRafaelaBtn.addEventListener('click', () => mostrarFechas('Logística Novogar Rafaela'));
            historialBsAsBtn.addEventListener('click', () => mostrarFechas('Logística Novogar BsAs'));
            historialSanNicolasBtn.addEventListener('click', () => mostrarFechas('Logística Novogar SanNicolas'));

            backToHistorialBtn.addEventListener('click', () => {
                historialFechas.style.display = 'none';
                backToHistorialBtn.style.display = 'none';
                controlPanelContent.style.display = 'block';
                console.log("Volviendo al historial...");
            });

            backToFechasBtn.addEventListener('click', () => {
                operacionesList.style.display = 'none';
                backToFechasBtn.style.display = 'none';
                imprimirCamionBtn.style.display = 'none'; // Ocultar el botón "Imprimir Camión"
                historialFechas.style.display = 'block';
                console.log("Volviendo a las fechas...");
            });

            imprimirCamionBtn.addEventListener('click', () => {
                const printContent = operacionesList.innerHTML;
                const printWindow = window.open('', '', 'height=800,width=600');
                printWindow.document.write('<html><head><title>Imprimir Camión</title>');
                printWindow.document.write('<style>');
                printWindow.document.write('@media print { body { width: 210mm; height: 297mm; } }');
                printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
                printWindow.document.write('h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }');
                printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
                printWindow.document.write('table, th, td { border: 1px solid black; }');
                printWindow.document.write('th, td { padding: 8px; text-align: left; }');
                printWindow.document.write('</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(printContent);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });
        })
        .catch(error => {
            loadingSpinner.classList.add('hidden'); // Ocultar el spinner en caso de error
            console.error("Error al consultar Firebase:", error);
        });
});
// FIN PANEL DE CONTROL

// ETIQUETA NODOS
async function generarPDFNodo(remito, cliente, fechaEntrega, operadorLogistico, button) {
    let spinner = document.getElementById("spinner2");
    spinner.style.display = "flex";

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [15, 10],
        putOnlyUsedFonts: true,
        floatPrecision: 16
    });

    let logoSrc = './Img/Camion-Rosario.png';
    // Aquí puedes agregar lógica para seleccionar el logo basado en el operador logístico

    const contenido = `
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Etiqueta</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
    <style>
        body {
            margin: 5px;
            padding: 0;
            display: grid;
            place-items: center;
            height: 100vh;
            background-color: #f0f0f0;
        }

        .etiqueta {
            width: 10cm;
            margin: 5px;
            height: auto;
            max-height: 15cm;
            border: 2px dashed #000;
            border-radius: 10px;
            padding: 1cm;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            font-family: Arial, sans-serif;
            background-color: #fff;
        }

        .logo {
            text-align: center;
            margin-bottom: 15px;
        }

        .logo3 {
            margin-top: 20px
        }

        .logo img {
            max-width: 250px;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .campo {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 6px;
            padding: 5px;
            border: 2px solid #ccc;
            background-color: #f9f9f9;
            border-radius: 10px;
        }

        .campo2 {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 6px;
            padding: 5px;
            border-radius: 10px;
        }

        .campo span {
            font-size: 1em;
            font-weight: bold;
            color: #333;
        }

        .cantidad {
            width: 200px;
            margin-top: 5px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 2em;
            font-weight: bold;
            color: #333;
            background-color: #ffffff; 
            border: 2px solid red; 
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .footer {
            text-align: center;
            font-size: 0.9em;
            color: #000;
            margin-top: auto;
            padding-top: 10px;
            border-top: 2px solid #ccc;
        }

        .contacto {
            font-size: 0.8em;
            color: #333;
            margin-top: 10px;
            text-align: center;
        }

        .contacto p {
            margin: 3px 0;
            /* Ajustado */
        }

        .campo-extra {
            border-radius: 8px;
            margin-top: 2px;
            /* Ajustado */
            border: 2px dashed #ccc;
            padding: 5px;
            /* Ajustado */
            text-align: center;
            font-size: 0.9em;
            /* Ajustado */
            color: #555;
        }
    </style>
</head>

<body data-listener-added_8bc0a513="true">
    <div class="etiqueta">
        <div class="logo"><img src="Img/Novogar-Logo.png" alt="Logo" style="margin: 0 auto; display: block; "></div>
        <div class="campo"><strong><span style="font-size: 20px; font-family: Tahoma, Geneva, sans-serif; color: rgb(0, 0, 0);">NODO ANDREANI</span></strong></div>
        <div class="campo" style="text-align: center;"><span style="font-size: 35px; font-family: Tahoma, Geneva, sans-serif; color: rgb(0, 0, 0);">${operadorLogistico.toUpperCase()}</span></div>
        <div class="campo-extra"><span style="font-size: 13px; color: rgb(0, 0, 0);">ESTE PALLET ES PROPIEDAD DE&nbsp;</span><strong><span style="font-size: 13px; color: rgb(0, 0, 0);">NOVOGAR.COM.AR</span></strong></div>
        <div class="campo2" style="text-align: center;"><span style="font-size: 20px; font-family: Tahoma, Geneva, sans-serif; color: rgb(0, 0, 0);"></span><div class="cantidad">BULTOS ____</div></div>
        <div class="contacto">
            <p><strong>Cont&aacute;ctese con posventa:</strong></p>
            <p><strong>(0341) 6680658 (Solo WhatsApp)</strong></p>
            <p><strong>posventa@novogar.com.ar</strong></p>
        </div>
        <div class="logo logo3"><img src="Img/Andreani-black.jpg" alt="Logo" style="margin: 0 auto; display: block; width: 210px;"></div>
    </div>
</body>

</html>`;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contenido;
    document.body.appendChild(tempDiv);

    html2canvas(tempDiv, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, 10, 15);
        const pdfBlob = doc.output('blob');

        const pdfUrl = URL.createObjectURL(pdfBlob);
        setTimeout(() => {
            spinner.style.display = "none";
            window.open(pdfUrl, '_blank');
        }, 2000);

        document.body.removeChild(tempDiv);
    }).catch(error => {
        spinner.style.display = "none";
        console.error("Error al generar el PDF:", error);
    });
}
// FIN ETIQUETA NODOS

// Cargar datos al iniciar la página
window.onload = cargarDatos;