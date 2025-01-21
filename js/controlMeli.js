// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCMu2vPvNzhv0cM3b4RItmqZybRhhR_HJM",
    authDomain: "despachos-meli-novogar.firebaseapp.com",
    projectId: "despachos-meli-novogar",
    storageBucket: "despachos-meli-novogar.appspot.com",
    messagingSenderId: "774252628334",
    appId: "1:774252628334:web:623aa84bc3b1cebd3f997f",
    measurementId: "G-E0E9K4TEDW"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencia a Firebase Storage
const storage = firebase.storage();
const database = firebase.database();

$(document).ready(function() {
    $('#escaneoColecta').on('hidden.bs.modal', function () {
        actualizarContador();
        actualizarContadorFilas();
    });

    $('#spinner4').hide(); // Asegurarse de que el spinner de la página esté oculto al cargar
    cargarDatos();

    $('#codigoInput').on('keypress', function(e) {
        if (e.which === 13) { // Tecla Enter
            const codigo = $(this).val().trim(); // Obtener el valor y eliminar espacios
    
            if (codigo === '') {
                // Si el input está vacío
                $('.lookBase').html(`
                    No se pudo realizar la búsqueda del ID de envío porque no se ingresaron datos. 
                    <span class="redStrong2">
                        <i class="bi bi-x-circle-fill"></i> Operación cancelada
                    </span>
                `).show();
                mostrarNotificacion("Intentaste buscar un código sin ingresar datos, operación cancelada");
                return; // Cancelar la operación
            }
    
            if (codigo.length < 11) {
                // Si el código tiene menos de 11 caracteres
                $('.lookBase').html(`
                    El ID de envío ingresado debe contener exactamente 11 caracteres. 
                    <span class="redStrong2">
                        <i class="bi bi-x-circle-fill"></i> Operación cancelada
                    </span>
                `).show();
                mostrarNotificacion("El ID de envío ingresado debe tener 11 caracteres");
                $(this).val(''); // Limpiar el input
                return; // Cancelar la operación
            }
    
            if (codigo.length > 11) {
                // Si el código tiene más de 11 caracteres
                $('.lookBase').html(`
                    El ID de envío ingresado no corresponde a ningún envío de Mercado Libre. 
                    <span class="redStrong2">
                        <i class="bi bi-x-circle-fill"></i> Operación cancelada
                    </span>
                `).show();
                mostrarNotificacion("El código ingresado no es un ID de envío de Mercado Libre");
                $(this).val(''); // Limpiar el input
                return; // Cancelar la operación
            }
    
            // Si el código tiene exactamente 11 caracteres, proceder a buscar
            buscarCodigo(codigo);
        }
    });

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje) {
        const notificacion = $('<div class="notificacion" style="position: fixed; bottom: 20px; right: 20px; background-color: #f44336; color: white; padding: 10px; border-radius: 5px; z-index: 1000;">' + mensaje + '</div>');
        $('body').append(notificacion);
        setTimeout(() => {
            notificacion.fadeOut(300, () => {
                notificacion.remove(); // Eliminar la notificación después de que se desvanezca
            });
        }, 3000); // Mostrar la notificación por 3 segundos
    }    

    // Evento para el buscador
    $('#searchMercadoLibre').on('input', function() {
        const query = $(this).val().toLowerCase();
        filtrarTabla(query);
    });

    $('#escaneoColecta').on('shown.bs.modal', function() {
        $('#codigoInput').focus();
        $('.lookBase').text('Iniciando. Borrando Cache ...').show();
        $('#spinner4').show(); // Mostrar el spinner
    
        // Simular un pequeño retraso para mostrar el mensaje
        setTimeout(() => {
            $('#spinner4').hide(); // Ocultar el spinner
            $('.lookBase').hide(); // Ocultar el mensaje de borrado
            verificarActualizacionBaseDeDatos(); // Llamar a la función de verificación
        }, 1000); // Esperar 2 segundos antes de verificar la base de datos
    });
    
});

function verificarActualizacionBaseDeDatos() {
    const ultimaActualizacion = localStorage.getItem('ultimaActualizacion');
    const ahora = new Date().getTime();
    const unaHora = 60 * 60 * 1000; // Una hora
    let intervalo;

    if (!ultimaActualizacion || (ahora - ultimaActualizacion > unaHora)) {
        // Si no hay registro de última actualización o ha pasado más de una hora
        $('.lookBase').text('Actualizando Base de Datos Local...').show();
        $('#spinner4').show();

        // Eliminar el localStorage actual antes de descargar nuevos datos
        localStorage.removeItem('envios');

        // Mostrar el spinner por al menos 3 segundos
        setTimeout(() => {
            descargarDatosDesdeFirebase(1000).then(() => {
                const fechaActual = new Date().toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                localStorage.setItem('ultimaActualizacion', ahora); // Tiempo de actualización
                $('.lookBase').html(`Base de datos actualizada al día <span class="redStrong">${fechaActual}</span>`).show();
                $('#spinner4').hide();
            }).catch(error => {
                console.error("Error al descargar datos: ", error);
                $('#spinner4').hide();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al descargar la base de datos.'
                });
            });
        }, 3000); // Esperar 3 segundos
    } else {
        // Si no ha pasado una hora, mostrar el mensaje de la última actualización con un temporizador
        const fechaActual = new Date(parseInt(ultimaActualizacion)).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const actualizarTemporizador = () => {
            const ahora = new Date().getTime();
            const tiempoRestante = unaHora - (ahora - ultimaActualizacion);

            if (tiempoRestante <= 0) {
                $('.lookBase').text('Listo para actualizar la base de datos.').show();
                $('#temporizadorMensaje').hide(); // Ocultar el temporizador del modal
                clearInterval(intervalo); // Detener el intervalo
                return;
            }

            const minutosRestantes = Math.floor(tiempoRestante / 60000);
            const segundosRestantes = Math.floor((tiempoRestante % 60000) / 1000);

            $('.lookBase').html(`Base de datos actualizada al día <span class="redStrong">${fechaActual}</span>, se volverá a actualizar en <span class="redStrong">${minutosRestantes}:${segundosRestantes.toString().padStart(2, '0')}</span> minutos.`).show();
            $('#temporizadorMensaje').show(); // Mostrar el temporizador en el modal
            $('#temporizador').text(`${minutosRestantes}:${segundosRestantes.toString().padStart(2, '0')}`); // Actualizar el temporizador en el modal
        };

        actualizarTemporizador(); // Ejecutar inmediatamente
        intervalo = setInterval(actualizarTemporizador, 1000); // Actualizar cada segundo

        // Detener el intervalo si el mensaje cambia
        const observer = new MutationObserver(() => {
            if (!$('.lookBase').html().includes('se volverá a actualizar en')) {
                clearInterval(intervalo);
                observer.disconnect();
            }
        });

        observer.observe(document.querySelector('.lookBase'), { childList: true, subtree: true });
    }
}

function descargarDatosDesdeFirebase(limite) {
    return database.ref('/envios').orderByChild('shippingId').limitToLast(limite).once('value').then(snapshot => {
        const datosAlmacenados = {};
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            datosAlmacenados[data.shippingId] = data; // Guardar datos en un objeto
        });
        localStorage.setItem('envios', JSON.stringify(datosAlmacenados)); // Guardar en localStorage
    });
}

function buscarCodigo(codigo) {
    const codigoNumerico = parseInt(codigo); // Convertir a número
    $('#spinner4').show(); // Mostrar spinner de la página
    $('.lookBase').hide(); // Ocultar mensaje inicial

    // Primero, intentamos obtener el resultado del localStorage
    const datosAlmacenados = JSON.parse(localStorage.getItem('envios')) || {};

    $('.lookBase').text('Buscando en Local Storage...').show();
    
    // Mostrar spinner por al menos 3 segundos
    setTimeout(() => {
        if (datosAlmacenados[codigoNumerico]) {
            // Si el código ya está en localStorage
            if ($(`#data-table-body tr[data-id="${codigoNumerico}"]`).length > 0) {
                // Si ya está en la planilla
                $('.lookBase').html(`La etiqueta <span class="redStrong2">${codigoNumerico}</span> ya se encontraba en planilla. <span class="redStrong2"><i class="bi bi-x-circle-fill"></i> ¡Fue omitida, continúa escaneando!</span>`).show();
            } else {
                // Si no está en la planilla, se agrega
                $('.lookBase').html(`Se encontró etiqueta: <span class="redStrong">${codigoNumerico}</span> en <span style="color:rgb(134, 77, 255); font-weight: bold;">LocalStorage <i class="bi bi-floppy2-fill"></i></span> y fue agregada a la planilla. <span class="redStrong3"><i class="bi bi-check-circle-fill"></i> ¡Exito!</span>`).show();
                procesarDatos(datosAlmacenados[codigoNumerico]);
            }
            $('#spinner4').hide(); // Ocultar spinner
            $('#codigoInput').val(''); // Limpiar input
            return;
        }

        // Si no se encuentra en localStorage, buscar en Firebase
        $('.lookBase').text('No se encontró en localStorage, buscando en Firebase...').show();
        
        // Esperar 2 segundos antes de buscar en Firebase
setTimeout(() => {
    buscarEnFirebase(codigoNumerico, 100).then(encontrado => {
        if (!encontrado) {
            $('.lookBase').text('Buscando en últimas 200 ventas...').show();
            return buscarEnFirebase(codigoNumerico, 200).then(encontrado => {
                if (!encontrado) {
                    $('.lookBase').text('Buscando en últimas 300 ventas...').show();
                    return buscarEnFirebase(codigoNumerico, 300).then(encontrado => {
                        if (!encontrado) {
                            $('.lookBase').text('Buscando en últimas 500 ventas...').show();
                            return buscarEnFirebase(codigoNumerico, 500).then(encontrado => {
                                if (!encontrado) {
                                    $('.lookBase').text('Buscando en últimas 700 ventas...').show();
                                    return buscarEnFirebase(codigoNumerico, 700).then(encontrado => {
                                        if (!encontrado) {
                                            $('.lookBase').text('Buscando en últimas 1.000 ventas...').show();
                                            return buscarEnFirebase(codigoNumerico, 1000).then(encontrado => {
                                                if (!encontrado) {
                                                    $('.lookBase').text('Buscando en últimas 1.500 ventas...').show();
                                                    return buscarEnFirebase(codigoNumerico, 1500).then(encontrado => {
                                                        if (!encontrado) {
                                                            $('.lookBase').text('Buscando en últimas 2.000 ventas...').show();
                                                            return buscarEnFirebase(codigoNumerico, 2000).then(encontrado => {
                                                                if (!encontrado) {
                                                                    $('.lookBase').text('Buscando en últimas 3.000 ventas...').show();
                                                                    return buscarEnFirebase(codigoNumerico, 3000).then(encontrado => {
                                                                        if (!encontrado) {
                                                                            $('.lookBase').text('Buscando en últimas 4.000 ventas...').show();
                                                                            return buscarEnFirebase(codigoNumerico, 4000).then(encontrado => {
                                                                                if (!encontrado) {
                                                                                    $('.lookBase').text('Buscando en últimas 5.000 ventas...').show();
                                                                                    return buscarEnFirebase(codigoNumerico, 5000).then(encontrado => {
                                                                                        if (!encontrado) {
                                                                                            $('.lookBase').text('Buscando en últimas 6.000 ventas...').show();
                                                                                            return buscarEnFirebase(codigoNumerico, 6000).then(encontrado => {
                                                                                                if (!encontrado) {
                                                                                                    $('.lookBase').text('Buscando en últimas 7.000 ventas...').show();
                                                                                                    return buscarEnFirebase(codigoNumerico, 7000).then(encontrado => {
                                                                                                        if (!encontrado) {
                                                                                                            $('.lookBase').text('Buscando en últimas 8.000 ventas...').show();
                                                                                                            return buscarEnFirebase(codigoNumerico, 8000).then(encontrado => {
                                                                                                                if (!encontrado) {
                                                                                                                    $('.lookBase').text('Buscando en últimas 9.000 ventas...').show();
                                                                                                                    return buscarEnFirebase(codigoNumerico, 9000).then(encontrado => {
                                                                                                                        if (!encontrado) {
                                                                                                                            $('.lookBase').text('Buscando en últimas 10.000 ventas...').show();
                                                                                                                            return buscarEnFirebase(codigoNumerico, 10000).then(encontrado => {
                                                                                                                                if (!encontrado) {
                                                                                                                                    $('#spinner4').hide(); // Ocultar spinner
                                                                                                                                    $('.lookBase').html(`NO se encontró etiqueta: <span class="redStrong">${codigoNumerico}</span> en <span style="color: #FF8C00; font-weight: bold;">Firebase <i class="bi bi-fire"></i></span> en las últimas 10.000 ventas. <span class="redStrong4"><i class="bi bi-search"></i> Verifica la fecha en Mercado Libre: <a href="https://www.mercadolibre.com.ar/ventas/omni/listado?filters=&startPeriod=WITH_DATE_CLOSED_6M_OLD&sort=DATE_CLOSED_DESC&subFilters=&search=${codigoNumerico}&limit=50&offset=0" target="_blank" style="color: #007bff; text-decoration: underline;">CLICK AQUÍ <i class="bi bi-box-arrow-up-right"></i></a></span>`).show();

                                                                                                                                    // Limpiar el input
                                                                                                                                    $('#codigoInput').val(''); // Limpiar el input
                                                                                                                                }
                                                                                                                            });
                                                                                                                        }
                                                                                                                    });
                                                                                                                }
                                                                                                            });
                                                                                                        }
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }).catch(error => {
        console.error("Error en la búsqueda: ", error);
        $('#spinner4').hide();
    });
}, 1000); // Esperar 1 segundo antes de buscar en Firebase
    }, ); // Mostrar spinner por al menos 1 segundo
}

function buscarEnFirebase(codigoNumerico, limite) {
    return database.ref('/envios').orderByChild('shippingId').limitToLast(limite).once('value').then(snapshot => {
        let encontrado = false;

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            if (data.shippingId === codigoNumerico) {
                encontrado = true;

                // Procesar datos y guardarlos en localStorage
                procesarDatos(data);
                const datosAlmacenados = JSON.parse(localStorage.getItem('envios')) || {};
                datosAlmacenados[codigoNumerico] = data; // Guardar en localStorage
                localStorage.setItem('envios', JSON.stringify(datosAlmacenados));

                // Ocultar spinner y mostrar mensaje
                $('#spinner4').hide(); // Ocultar spinner
                $('.lookBase').html(`Se encontró etiqueta: <span class="redStrong">${codigoNumerico}</span> en <span style="color: #FF8C00; font-weight: bold;">Firebase <i class="bi bi-fire"></i></span> y fue agregada a la planilla. <span class="redStrong3"><i class="bi bi-check-circle-fill"></i> ¡Éxito!</span>`).show();

                // Limpiar el input
                $('#codigoInput').val(''); // Limpiar el input
            }
        });

        return encontrado;
    });
}

function procesarDatos(data) {
    // Verificar si el estado es Jujuy o Tierra del Fuego en billing_info
    let additionalInfo;
    if (data.client && data.client.billing_info && data.client.billing_info.additional_info) {
        additionalInfo = data.client.billing_info.additional_info;
    } else {
        additionalInfo = []; // Si no existe, definir como un array vacío
        Swal.fire({
            icon: 'warning',
            title: 'Validación manual requerida',
            text: 'No se pudo validar la provincia de compra por un error en Mercado Libre, pero el envío fue agregado igualmente. Verifica la etiqueta de forma manual.'
        });
    }

    const estadoJujuy = additionalInfo.find(info => info.type === "STATE_NAME" && info.value.toLowerCase() === "jujuy");
    const estadoTierraDelFuego = additionalInfo.find(info => info.type === "STATE_NAME" && info.value.toLowerCase() === "tierra del fuego");
    
    if (estadoJujuy) {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: 'Los envíos que facturan a Jujuy no están permitidos, separar etiqueta.'
        });
        return; // Salir de la función
    }

    if (estadoTierraDelFuego) {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: 'Los envíos que facturan a Tierra del Fuego no están permitidos, separar etiqueta.'
        });
        return; // Salir de la función
    }

    // Nueva validación para data.Provincia
    if (data.Provincia.toLowerCase() === 'jujuy' || data.Provincia.toLowerCase() === 'tierra del fuego') {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: `Se detectó un envío a ${data.Provincia}, verificar en Mercado Pago si posee retención de impuesto a esta provincia.`
        });
        return; // Salir de la función
    }

    // Verificar si ya existe en la tabla
    if ($(`#data-table-body tr[data-id="${data.shippingId}"]`).length === 0) {
        agregarFila(data);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Código ya escaneado',
            text: 'Este código ya ha sido agregado a la tabla.'
        });
    }
}

function ordenarFilasPorFecha() {
    const filas = $('#data-table-body tr').get(); // Obtener todas las filas de la tabla

    filas.sort(function(a, b) {
        const fechaA = $(a).find('td').eq(0).text(); // Obtener la fecha de la primera columna
        const fechaB = $(b).find('td').eq(0).text(); // Obtener la fecha de la primera columna

        // Convertir la fecha de formato "dd/mm/yy, hh:mm" a un objeto Date
        const [fechaAString, horaAString] = fechaA.split(', ');
        const [diaA, mesA, anioA] = fechaAString.split('/').map(Number);
        const [horaA, minutoA] = horaAString.split(':').map(Number);
        const fechaAObj = new Date(2000 + anioA, mesA - 1, diaA, horaA, minutoA);

        const [fechaBString, horaBString] = fechaB.split(', ');
        const [diaB, mesB, anioB] = fechaBString.split('/').map(Number);
        const [horaB, minutoB] = horaBString.split(':').map(Number);
        const fechaBObj = new Date(2000 + anioB, mesB - 1, diaB, horaB, minutoB);

        return fechaBObj - fechaAObj; // Ordenar de más nuevo a más viejo
    });

    // Vaciar el cuerpo de la tabla y volver a agregar las filas ordenadas
    $('#data-table-body').empty().append(filas);
}

function agregarFila(data) {
    const fechaHora = new Date().toLocaleString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    }).replace(',', 'h').replace('h', ', '); // Formato "26/10/24, 18:27h"

    // Verificar si ya existe en Firebase antes de guardar
    database.ref('/despachoDelDiaMeli/' + data.shippingId).once('value').then(snapshot => {
        if (!snapshot.exists()) {
            // Si el registro no existe en Firebase, lo agrega con la fecha actual
            database.ref('/despachoDelDiaMeli/' + data.shippingId).set({
                fechaHora: fechaHora,
                shippingId: data.shippingId,
                idOperacion: data.idOperacion,
                Cantidad: data.Cantidad,
                Producto: data.Producto,
                pictures: data.pictures
            });
        }
    });

    // Generar la fila de la tabla
    const newRow = `
        <tr data-id="${data.shippingId}">
            <td>${data.fechaHora || fechaHora}
            <td><a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank">${data.idOperacion}</a></td>
            <td id="sku-control-Meli">${data.shippingId}</td>
            <td id="cantidad-control-Meli">${data.Cantidad}</td>
            <td>${data.Producto}</td>
            <td><img src="${data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : ''}" alt="Imagen" style="max-width: 200px; height: 80px;"></td>
            <td><button class="btn btn-danger btn-delete" onclick="confirmarEliminacion('${data.shippingId}')">X</button></td>
        </tr>
    `;

    // Agregar la nueva fila al principio de la tabla
    $('#data-table-body').prepend(newRow);

    actualizarContador();
    actualizarContadorFilas();

    // Eliminar la fila de "No has comenzado una colecta aún" si existe
    $('.no-data').remove();
}

function confirmarEliminacion(id) {
    Swal.fire({
        title: 'Clave de Eliminacion 🔒',
        input: 'password',
        inputLabel: 'Solicitarla al Gerente',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        preConfirm: (password) => {
            // Validar la contraseña
            if (password !== '6572') { // Cambiar '6572' por la lógica de validación que necesites
                Swal.showValidationMessage('Contraseña incorrecta');
            } else {
                eliminarFila(id);
            }
        }
    });
}

function eliminarFila(id) {
    // Eliminar de Firebase
    database.ref('/despachoDelDiaMeli/' + id).remove().then(() => {
        $(`#data-table-body tr[data-id="${id}"]`).remove();
        actualizarContador();
        actualizarContadorFilas();
    }).catch(error => {
        console.error("Error al eliminar el registro de Firebase: ", error);
    });
}

function actualizarContador() {
    let totalCantidad = 0; // Iniciar el total a 0
    const cantidadFilas = $('#data-table-body tr').length;

    // Sumar las cantidades de cada fila
    $('#data-table-body tr').each(function() {
        const cantidad = parseInt($(this).find('#cantidad-control-Meli').text());
        if (!isNaN(cantidad)) {
            totalCantidad += cantidad;
        }
    });

    // Actualizar el texto con el nuevo formato
    $('#totalCantidad').html(`<i class="bi bi-box-seam-fill"></i> Total Unidades: ${totalCantidad}`);
    $('#totalFila').html(`<i class="bi bi-bookmark-check-fill"></i> Total Etiquetas: ${cantidadFilas}`); // Actualizar el texto de filas

    // Manejar las clases según la cantidad total
    if (cantidadFilas > 5) { // Cambiar 5 por el número de filas que consideres
        $('#totalCantidad').addClass('fixed-counter');
        $('#totalCantidad').removeClass('counter'); // Asegúrate de eliminar la clase counter
        $('#totalFila').addClass('fixed-counter2'); // Clase específica para total de filas
        $('#totalFila').removeClass('counter'); // Asegúrate de eliminar la clase counter
    } else {
        $('#totalCantidad').removeClass('fixed-counter');
        $('#totalCantidad').addClass('counter'); // Agregar la clase counter
        $('#totalFila').removeClass('fixed-counter2'); // Eliminar clase específica
        $('#totalFila').addClass('counter'); // Agregar la clase counter
    }
}


// Nueva función para contar solo las filas
function actualizarContadorFilas() {
    const cantidadFilas = $('#data-table-body tr').length; // Contar las filas
    let totalCantidad = 0; // Iniciar el total de unidades a 0

    // Sumar las cantidades de cada fila
    $('#data-table-body tr').each(function() {
        const cantidad = parseInt($(this).find('#cantidad-control-Meli').text());
        if (!isNaN(cantidad)) {
            totalCantidad += cantidad;
        }
    });

    // Actualizar el texto con el nuevo formato
    $('#totalCantidad').html(`<i class="bi bi-box-seam-fill"></i> Total Unidades: ${totalCantidad}`);
    $('#totalFila').html(`<i class="bi bi-bookmark-check-fill"></i> Total Etiquetas: ${cantidadFilas}`); // Actualizar el texto de filas

    // Opcional: manejar clases según la cantidad de filas
    if (cantidadFilas > 5) { // Cambiar 5 por el número de filas que consideres
        $('#totalFila').addClass('fixed-counter2'); // Clase específica para total de filas
        $('#totalFila').removeClass('counter'); // Asegúrate de eliminar la clase counter
    } else {
        $('#totalFila').removeClass('fixed-counter2'); // Eliminar clase específica
        $('#totalFila').addClass('counter'); // Agregar la clase counter
    }
}

function cargarDatos() {
    $('#data-table-body').empty(); // Limpiar la tabla antes de cargar nuevos datos
    $('#spinner').show(); // Mostrar spinner de la página durante la carga

    database.ref('/despachoDelDiaMeli').once('value').then(snapshot => {
        const datos = []; // Array para almacenar los datos

        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                datos.push(data); // Agregar cada dato al array
            });

            // Ordenar los datos por fechaHora (o cualquier otra propiedad que determines)
            datos.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

            // Agregar las filas a la tabla
            datos.forEach(data => {
                agregarFila(data);
            });

            ordenarFilasPorFecha();
        } else {
            $('#data-table-body').append(`
                <tr>
                    <td colspan="7" class="no-data">No has comenzado una colecta aún, manos a la obra</td>
                </tr>
            `);
        }
    }).catch(error => {
        console.error("Error al cargar datos: ", error);
    }).finally(() => {
        $('#spinner').hide(); // Ocultar spinner de la página al finalizar carga
        // Llamar a la función para pintar filas preparadas después de cargar los datos
        pintarFilasPreparadas();
    });
}

// // BUSCADOR
// function filtrarTabla(query) {
//     const dataTableBody = $('#data-table-body');
//     dataTableBody.empty();

//     let totalCantidad = 0; // Variable para contar la cantidad total

//     if (query) {
//         database.ref('/despachoDelDiaMeli').once('value').then(snapshot => {
//             let encontrado = false;

//             snapshot.forEach(childSnapshot => {
//                 const data = childSnapshot.val();
//                 if (data.shippingId.toString().includes(query) || data.idOperacion.toString().includes(query)) {
//                     const newRow = `
//                         <tr data-id="${childSnapshot.key}">
//                             <td>${data.fechaHora}</td>
//                             <td><a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank">${data.idOperacion}</a></td>
//                             <td>${data.shippingId}</td>
//                             <td id="cantidad-control-Meli">${data.Cantidad}</td>
//                             <td id="sku-control-Meli">${data.Producto}</td>
//                             <td><img src="${data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : ''}" alt="Imagen" style="width: auto; height: 80px;"></td>
//                             <td><button class="btn btn-danger btn-delete" onclick="confirmarEliminacion('${childSnapshot.key}')">X</button></td>
//                         </tr>
//                     `;
//                     dataTableBody.append(newRow);
//                     totalCantidad += data.Cantidad; // Sumar la cantidad
//                     encontrado = true;
//                 }
//             });

//             if (!encontrado) {
//                 dataTableBody.append(`
//                     <tr>
//                         <td colspan="7">
//                             <div class="d-flex flex-column align-items-center justify-content-center text-center w-100">
//                                 <p class="errorp">No se encontraron resultados para "${query}" en el servidor</p>
//                                 <img src="./Img/error.gif" alt="No se encontraron resultados" class="error img-fluid mb-3">
//                             </div>
//                         </td>
//                     </tr>
//                 `);
//             }

//             // Actualizar el contador total después de filtrar
//             $('#totalCantidad').text(`Total Cantidad: ${totalCantidad}`);
//         }).catch(error => {
//             console.error("Error al filtrar la tabla: ", error);
//         });
//     } else {
//         cargarDatos(); // Si el input está vacío, recargar todos los datos
//         ordenarFilasPorFecha();
//         actualizarContador();
//         actualizarContadorFilas();
//     }
// }

function obtenerDatosTabla() {
    const totalCantidad = document.getElementById('totalCantidad').innerText; // Obtener el texto del contador
    let html = `<h2 style="text-align: center;">${totalCantidad}</h2>`; // Incluir el contador centrado
    html += '<table style="width:100%; border-collapse: collapse; border: 1px solid black; text-align: center;">'; // Centrar tabla
    html += '<thead style="background-color: #f2f2f2;"><tr>';
    html += '<th style="border: 1px solid black; padding: 8px;"><i class="bi bi-calendar"></i> Fecha y Hora</th>';
    html += '<th style="border: 1px solid black; padding: 8px;"><i class="bi bi-file-earmark-text"></i> Operación</th>'; 
    html += '<th style="border: 1px solid black; padding: 8px;"><i class="bi bi-rocket-takeoff-fill"></i> Shipping ID</th>';
    html += '<th style="border: 1px solid black; padding: 8px;"><i class="bi bi-box"></i> Cantidad</th>'; 
    html += '<th style="border: 1px solid black; padding: 8px;"><i class="bi bi-info-circle"></i> Descripción</th>'; 
    html += '</tr></thead><tbody>'; 

    $('#data-table-body tr').each(function() {
        const fechaHora = $(this).find('td').eq(0).text(); // Primer td es Fecha y Hora
        const operacion = $(this).find('td').eq(1).html(); // Mantener HTML para hipervínculo
        const shippingId = $(this).find('td').eq(2).text(); // Tercer td es Shipping ID
        const cantidad = $(this).find('td').eq(3).text(); // Cuarto td es Cantidad
        const descripcion = $(this).find('td').eq(4).text(); // Quinto td es Descripción

        html += `<tr>
            <td style="border: 1px solid black; padding: 8px;">${fechaHora}</td>
            <td style="border: 1px solid black; padding: 8px;">${operacion}</td>
            <td style="border: 1px solid black; padding: 8px;">${shippingId}</td>
            <td style="border: 1px solid black; padding: 8px;">${cantidad}</td>
            <td style="border: 1px solid black; padding: 8px;">${descripcion}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    return html;
}

async function enviarCorreoDespacho(destinatarioEmail) {
    const emailBody = obtenerDatosTabla();
    const fecha = new Date().toLocaleDateString(); // Formato de fecha
    const Subject = `Despacho MERCADO LIBRE del dia: ${fecha}`;
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
        "Subject": Subject,
        "From": {
            "Name": "Posventa Novogar",
            "Email": "posventa@novogar.com.ar"
        },
        "To": [
            {
                "Name": "Despacho Mercado Libre",
                "Email": destinatarioEmail
            }
        ],
        "Cc": [],
        "Bcc": ["webnovagar@gmail.com", "posventa@novogar.com.ar"],
        "CharSet": "utf-8",
        "User": {
            "Username": smtpU,
            "Secret": smtpP,
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
            showAlert(`<i class="bi bi-envelope-check"></i> Email de Despacho enviado a ${destinatarioEmail} a las ${new Date().toLocaleTimeString()}`);
        } else {
            console.log(`Error al enviar el email: ${result.Message}`);
            showAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${new Date().toLocaleTimeString()}`);
        }
    } catch (error) {
        console.error('Error al enviar el email:', error);
        showAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${new Date().toLocaleTimeString()}`);
    }
}

document.getElementById('cerrarButton').onclick = async function() {
    const tableBody = document.getElementById('data-table-body');
    const totalCantidad = document.getElementById('totalCantidad').innerText;

    // Verificar si hay datos en la tabla
    if (tableBody.querySelectorAll('tr').length <= 1 || totalCantidad === 'Total Cantidad: 0') {
        showAlertError('<i class="bi bi-exclamation-triangle-fill"></i> No hay datos en la colecta.');
        return; // Salir de la función si no hay datos
    }

    const destinatarios = [
        "lucasponzoninovogar@gmail.com",
        "lucas.ponzoni@novogar.com.ar",
        "mauricio.daffonchio@novogar.com.ar",
        "esperanza.toffalo@novogar.com.ar",
        "posventa@novogar.com.ar",
        "recepcionesweb@novogar.com.ar",
        "mauricio.villan@novogar.com.ar"
    ];

    const { value: password } = await Swal.fire({
        title: 'Clave de Cierre de Colecta 🔒',
        input: 'password',
        inputLabel: 'Solicitarla al Preparador',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Necesitas ingresar la contraseña!';
            } else if (value !== '6572') {
                return 'Contraseña incorrecta!';
            }
        }
    });

    if (password === '6572') {
        for (const email of destinatarios) {
            await enviarCorreoDespacho(email);
        }

        // Eliminar el nodo en Firebase
        const firebaseUrl = 'https://despachos-meli-novogar-default-rtdb.firebaseio.com/despachoDelDiaMeli.json';
        await fetch(firebaseUrl, {
            method: 'DELETE'
        });
        console.log('Nodo eliminado de Firebase');

        // Resetear la tabla
        tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No has comenzado una colecta aún, manos a la obra 😎</td></tr>';
        document.getElementById('totalCantidad').innerHTML = '<i class="bi bi-box-seam-fill"></i> Total Unidades: 0';
        document.getElementById('totalFila').innerHTML = '<i class="bi bi-bookmark-check-fill"></i> Total Etiquetas: 0';

        showAlert('<i class="bi bi-check-circle"></i> Colecta cerrada y datos enviados exitosamente.');
    }
};

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

// NOTIFICADOR DE COMENTARIO EN FACTURACION
document.addEventListener("DOMContentLoaded", function() {
    const statusCard = document.getElementById('statusCard2');
    const closeCardButton = document.getElementById('closeCard');
    const countdownElement = document.getElementById('countdown');
    let countdown = 5; // Tiempo en segundos

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
// FIN NOTIFICADOR DE COMENTARIO EN FACTURACION

$(document).ready(function() {
    // Evento para el input del segundo escaneo
    $('#codigoInput2').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            const codigo = $(this).val();
            buscarCodigoEscaneo2(codigo);
        }
    });

    // Al abrir el modal, actualizar contadores
    $('#escaneoColecta2').on('shown.bs.modal', function() {
        $('#codigoInput2').focus();
        actualizarContadores(); // Llamar a la función para actualizar contadores al abrir el modal
    });
});

function buscarCodigoEscaneo2(codigo) {
    const codigoNumerico = parseInt(codigo); // Convertir a número
    $('#spinner4').show(); // Mostrar spinner

    let encontrado = false;
    $('#data-table-body tr').each(function(index) {
        const shippingId = $(this).find('td').eq(2).text(); // Columna Shipping ID
        if (shippingId == codigoNumerico) {
            encontrado = true; // Se encontró el código

            // Verificar el estado en Firebase
            database.ref('/despachoDelDiaMeli/' + shippingId).once('value').then(snapshot => {
                if (snapshot.exists() && snapshot.val().estado === 'preparado') {
                    // Si ya está preparado, mostrar Sweet Alert
                    Swal.fire({
                        icon: 'warning',
                        title: 'Pedido ya preparado',
                        text: 'Este pedido ya fue marcado como preparado con anterioridad.'
                    });
                } else {
                    // Actualizar Firebase
                    database.ref('/despachoDelDiaMeli/' + shippingId).update({
                        estado: 'preparado'
                    }).then(() => {
                        console.log('Estado actualizado a preparado en Firebase.');
                        mostrarNotificacion(`Se ha marcado como preparado el ID ${shippingId} en fila ${index + 1}`);
                        
                        // Restar 1 al contador de "Sin Preparar"
                        const totalSinPrepararElement = document.getElementById('totalSinPreparar');
                        let totalSinPreparar = parseInt(totalSinPrepararElement.innerText);
                        totalSinPreparar = totalSinPreparar - 1;
                        totalSinPrepararElement.innerText = totalSinPreparar;

                        // Sumar 1 al contador de "Preparados"
                        const totalPreparadosElement = document.getElementById('totalPreparados');
                        let totalPreparados = parseInt(totalPreparadosElement.innerText);
                        totalPreparados = totalPreparados + 1;
                        totalPreparadosElement.innerText = totalPreparados;

                    }).catch(error => {
                        console.error("Error al actualizar el estado en Firebase: ", error);
                    });

                    pintarFilasPreparadas();
                }
            });

            return false; // Salir del each
        }
    });

    if (!encontrado) {
        Swal.fire({
            icon: 'error',
            title: 'No encontrado',
            text: `No se encontró preparación para el Shipping ID ${codigoNumerico}.`
        });
    }

    $('#spinner4').hide(); // Ocultar spinner
    $('#codigoInput2').val(''); // Limpiar input

    // Llamar a la función para pintar filas preparadas
    pintarFilasPreparadas();
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notificationDiv = $(`
        <div class="notificationModal2">
            ${mensaje}
            <span class="close">&times;</span>
        </div>
    `);
    
    $('#notificationContainer').append(notificationDiv);

    // Cerrar notificación al hacer clic en la "x"
    notificationDiv.find('.close').on('click', function() {
        notificationDiv.fadeOut();
    });

    // Cerrar notificación después de 3 segundos
    setTimeout(() => {
        notificationDiv.fadeOut();
    }, 3000);
}

function pintarFilasPreparadas() {
    $('#data-table-body tr').each(function() {
        const shippingId = $(this).data('id'); // Obtener el shippingId de la fila

        // Consultar el estado en Firebase
        database.ref('/despachoDelDiaMeli/' + shippingId).once('value').then(snapshot => {
            if (snapshot.exists() && snapshot.val().estado === 'preparado') {
                // Si el estado es "preparado", aplicar el estilo de fondo verde
                $(this).css('background-color', '#d4edda'); // Color verde claro
            }
        }).catch(error => {
            console.error("Error al consultar el estado en Firebase: ", error);
        });
    });
}

function actualizarContadores() {
    let preparados = 0;
    let sinPreparar = 0;

    $('#data-table-body tr').each(function() {
        const shippingId = $(this).data('id'); // Obtener el ID de la fila
        database.ref('/despachoDelDiaMeli/' + shippingId).once('value').then(snapshot => {
            if (snapshot.exists() && snapshot.val().estado === 'preparado') {
                preparados++;
            } else {
                sinPreparar++;
            }

            // Actualizar el contador en el modal
            $('#totalPreparados').text(preparados);
            $('#totalSinPreparar').text(sinPreparar);
        });
    });
}

$(document).ready(function() {
    $('#contadorPreparados').on('click', function() {
        cargarDatosPorEstado('preparado'); // Cargar solo preparados
        $('#escaneoColecta2').modal('show'); // Mostrar el modal
    });

    $('#contadorSinPreparar').on('click', function() {
        cargarDatosPorEstado('sin preparar'); // Cargar solo sin preparar
        $('#escaneoColecta2').modal('show'); // Mostrar el modal
    });

    // Cerrar el modal y limpiar al cerrarlo
    $('#escaneoColecta2').on('hidden.bs.modal', function () {
        $('#detalleTablaBody').empty(); // Limpiar la tabla
        $('#tablaCabecera').hide(); // Ocultar cabecera
        $('#totalPreparados').text('0');
        $('#totalSinPreparar').text('0');
    });
});

function cargarDatosPorEstado(estado) {
    const datosFiltrados = [];

    // Obtener todos los datos de Firebase
    database.ref('/despachoDelDiaMeli').once('value').then(snapshot => {
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            if (estado === 'preparado' && data.estado === 'preparado') {
                datosFiltrados.push(data);
            } else if (estado === 'sin preparar' && data.estado !== 'preparado') {
                datosFiltrados.push(data);
            }
        });

        // Actualizar contadores
        const totalPreparados = datosFiltrados.filter(d => d.estado === 'preparado').length;
        const totalSinPreparar = datosFiltrados.filter(d => d.estado !== 'preparado').length;

        $('#totalPreparados').text(totalPreparados);
        $('#totalSinPreparar').text(totalSinPreparar);

        // Llenar la tabla
        llenarTabla(datosFiltrados);
    }).catch(error => {
        console.error("Error al cargar datos: ", error);
    });
}

function llenarTabla(datos) {
    const tbody = $('#detalleTablaBody');
    tbody.empty(); // Limpiar la tabla antes de llenarla

    if (datos.length === 0) {
        tbody.append(`<tr><td colspan="4" class="no-data">No hay datos disponibles.</td></tr>`);
        $('#tablaCabecera').hide(); // Asegúrate de ocultar la cabecera si no hay datos
        return;
    }

    // Mostrar cabecera de la tabla
    $('#tablaCabecera').show();

    datos.forEach((data) => {
        // Truncar el texto del producto a 10 caracteres
        const productoTruncado = data.Producto.length > 10 ? data.Producto.substring(0, 30) + '...' : data.Producto;

        const newRow = `
            <tr>
                <td><a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank">${data.idOperacion}</a></td>
                <td>${data.shippingId}</td>
                <td>${data.Cantidad}</td>
                <td>${productoTruncado}</td>
            </tr>
        `;
        tbody.append(newRow);
    });

    actualizarContadores();
}

$('#escaneoColecta2').on('hidden.bs.modal', function () {
    setTimeout(() => {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').css('overflow', 'auto'); 
        window.scrollTo(0, 0); 
    }, 300); 
});

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, seleccione un archivo.');
        return;
    }

    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const folderPath = `Etiquetas/${dateString}`;

    // Obtener el número de archivos en la carpeta de la fecha actual
    const folderRef = storage.ref(folderPath);
    folderRef.listAll().then(result => {
        const fileCount = result.items.length + 1; // Contar los archivos existentes y sumar 1
        const fileName = `TANDA ${fileCount}.txt`;
        const fileRef = folderRef.child(fileName);

        // Subir el archivo a Firebase Storage
        fileRef.put(file).then(() => {
            alert('Archivo subido exitosamente.');
            fileInput.value = ''; // Limpiar el input de archivo
        }).catch(error => {
            console.error('Error al subir el archivo:', error);
            alert('Error al subir el archivo.');
        });
    }).catch(error => {
        console.error('Error al listar archivos en la carpeta:', error);
        alert('Error al listar archivos en la carpeta.');
    });
}

// UPLOAD ETIQUETAS MELI
let currentFolderPath = 'Etiquetas';
const folderStack = [];

function showSpinner(show) {
    const spinner = document.getElementById('spinner33');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Los meses son indexados desde 0
    const year = date.getFullYear();
    return `Etiquetas ${day}-${month}-${year}`;
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function countLabels(content) {
    const startTag = /\^XA/g;
    const endTag = /\^XZ/g;
    const startCount = (content.match(startTag) || []).length;
    const endCount = (content.match(endTag) || []).length;
    return Math.min(startCount, endCount);
}

function extractSalesNumbers(content) {
    const labelRegex = /\^XA[\s\S]*?\^XZ/g;
    const saleRegex = /\^FO120,120\^A0N,24,24\^FD(Venta|Pack ID): (\d+)\^FS[\s\S]*?\^FO(\d+),117\^A0N,27,27\^FD(\d+)\^FS/g;
    const matches = [];
    let labelMatch;
    while ((labelMatch = labelRegex.exec(content)) !== null) {
        const labelContent = labelMatch[0];
        let saleMatch;
        while ((saleMatch = saleRegex.exec(labelContent)) !== null) {
            matches.push(`${saleMatch[1]}: ${saleMatch[2]} ${saleMatch[4]}`);
        }
    }
    return matches;
}

function generateBillingFile(content) {
    const salesNumbers = extractSalesNumbers(content);
    let billingContent = '';
    salesNumbers.forEach((number, index) => {
        // Eliminar todos los espacios entre los números
        const cleanedNumber = number.replace(/\s+/g, '');
        billingContent += `${index + 1}- ${cleanedNumber}\n`;
    });
    return billingContent;
}

function downloadBillingFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadFolder(folderPath) {
    showSpinner(true);
    const folderRef = storage.ref(folderPath);
    folderRef.listAll().then(result => {
        showSpinner(false);

        const folderList = document.getElementById('folderList');
        folderList.innerHTML = '';

        result.prefixes.forEach(folderRef => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start';
            listItem.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${folderRef.name}</div>
                </div>
                <span class="badge text-bg-primary rounded-pill">Cargando...</span>
            `;
            folderList.appendChild(listItem);

            folderRef.listAll().then(subResult => {
                const fileCount = subResult.items.length;
                const tandaText = fileCount === 1 ? 'tanda' : 'tandas';
                listItem.querySelector('.badge').textContent = `${fileCount} ${tandaText}`;
                listItem.addEventListener('click', () => {
                    folderStack.push(currentFolderPath);
                    currentFolderPath = folderRef.fullPath;
                    loadFolder(currentFolderPath);
                });
            }).catch(error => {
                console.error('Error al listar subcarpetas:', error);
                showSpinner(false);
                Swal.fire('Error', 'Error al listar subcarpetas.', 'error');
            });
        });

        const items = [];

        result.items.forEach(fileRef => {
            showSpinner(true);
            fileRef.getMetadata().then(metadata => {
                const uploadTime = new Date(metadata.timeCreated);
                const formattedTime = formatTime(uploadTime);

                fileRef.getDownloadURL().then(url => {
                    fetch(url)
                        .then(response => response.text())
                        .then(content => {
                            const labelCount = countLabels(content);
                            const tandaNumber = parseInt(fileRef.name.match(/\d+/)[0], 10);
                            const listItem = document.createElement('li');
                            listItem.className = 'list-group-item d-flex justify-content-between align-items-start';
                            listItem.innerHTML = `
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold">${fileRef.name}</div>
                                    <small class="time-etiquetas-container"><i class="bi bi-clock"></i> Horario: ${formattedTime}</small>
                                </div>
                                <span class="badge text-bg-primary rounded-pill">Archivo (${labelCount} etiquetas)</span>
                                <button class="btn btn-danger btn-sm delete-btn fixed-size" data-ref="${fileRef.fullPath}" id="delete-tanda${tandaNumber}">
                                    <i class="bi bi-trash" style="width: 19.2px; height: 19.2px;"></i>
                                </button>
                                <button class="btn btn-primary btn-sm generate-btn fixed-size" data-url="${url}" data-name="${fileRef.name}" id="generar-tanda${tandaNumber}">
                                    <i class="bi bi-file-earmark-arrow-down" style="width: 19.2px; height: 19.2px;"></i>
                                </button>
                            `;
                            listItem.querySelector('.badge').addEventListener('click', (event) => {
                                event.stopPropagation(); // Evitar que el evento de clic se propague al elemento de la lista
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = fileRef.name;
                                a.target = '_blank'; // Forzar la descarga en una nueva pestaña
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            });
                            items.push({ listItem, tandaNumber });

                            // Ordenar los elementos por el número de tanda en orden descendente
                            items.sort((a, b) => b.tandaNumber - a.tandaNumber);

                            // Limpiar la lista y agregar los elementos ordenados
                            folderList.innerHTML = '';
                            items.forEach(item => {
                                folderList.appendChild(item.listItem);
                                showSpinner(false);
                            });

                            // Agregar evento de eliminación a los botones
                            document.querySelectorAll('.delete-btn').forEach(button => {
                                button.addEventListener('click', (event) => {
                                    event.stopPropagation();
                                    const fileRefPath = button.getAttribute('data-ref');
                                    Swal.fire({
                                        title: '¿Está seguro de que desea eliminar la tanda?',
                                        text: "Esta acción no se puede deshacer.",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#d33',
                                        cancelButtonColor: '#3085d6',
                                        confirmButtonText: 'Sí, eliminar',
                                        cancelButtonText: 'Cancelar'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            const fileRef = storage.ref(fileRefPath);
                                            fileRef.delete().then(() => {
                                                button.closest('li').remove();
                                                Swal.fire('Eliminado!', 'El archivo ha sido eliminado.', 'success');
                                            }).catch(error => {
                                                Swal.fire('Error', `Error al eliminar el archivo: ${error}`, 'error');
                                            });
                                        }
                                    });
                                });
                            });

                            // Agregar evento de generación de archivo de facturación a los botones
                            document.querySelectorAll('.generate-btn').forEach(button => {
                                button.removeEventListener('click', handleGenerateClick); // Eliminar cualquier evento previo
                                button.addEventListener('click', handleGenerateClick);
                            });
                        }).catch(error => {
                            console.error('Error al obtener el contenido del archivo:', error);
                            showSpinner(false);
                            Swal.fire('Error', 'Error al obtener el contenido del archivo.', 'error');
                        });
                }).catch(error => {
                    console.error('Error al obtener los metadatos del archivo:', error);
                    showSpinner(false);
                    Swal.fire('Error', 'Error al obtener los metadatos del archivo.', 'error');
                });
            }).catch(error => {
                console.error('Error al listar archivos en la carpeta:', error);
                showSpinner(false);
                Swal.fire('Error', 'Error al listar archivos en la carpeta.', 'error');
            });
        });

        document.getElementById('backButton').style.display = folderStack.length > 0 ? 'block' : 'none';
    }).catch(error => {
        console.error('Error al listar archivos en la carpeta:', error);
        showSpinner(false);
        Swal.fire('Error', 'Error al listar archivos en la carpeta.', 'error');
    });
}

function handleGenerateClick(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const url = button.getAttribute('data-url');
    const fileName = button.getAttribute('data-name');
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    button.classList.add('btn-secondary', 'fixed-size');
    button.classList.remove('btn-primary');
    button.disabled = true;
    setTimeout(() => {
        fetch(url)
            .then(response => response.text())
            .then(content => {
                const billingContent = generateBillingFile(content);
                const billingFileName = `Facturacion_${fileName}.txt`;
                downloadBillingFile(billingContent, billingFileName);
                button.innerHTML = '<i class="bi bi-check-all"></i>';
                button.classList.add('btn-success');
                button.classList.remove('btn-secondary');
                button.disabled = false;
            }).catch(error => {
                showSpinner(false);
                console.error('Error al generar el archivo de facturación:', error);
                Swal.fire('Error', 'Error al generar el archivo de facturación.', 'error');
            });
    }, 2000);
}

document.getElementById('backButton').addEventListener('click', () => {
    if (folderStack.length > 0) {
        currentFolderPath = folderStack.pop();
        loadFolder(currentFolderPath);
    }
});

$('#etiquetasModal').on('shown.bs.modal', function () {
    loadFolder(currentFolderPath);
});

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire('Error', 'Por favor, seleccione un archivo.', 'error');
        return;
    }

    const today = new Date();
    const dateString = formatDate(today); // Formato Etiquetas DD-MM-YYYY
    const folderPath = `Etiquetas/${dateString}`;

    // Obtener el contenido del archivo seleccionado
    const reader = new FileReader();
    reader.onload = function(event) {
        const newFileContent = event.target.result;

        // Obtener el número de archivos en la carpeta de la fecha actual
        const folderRef = storage.ref(folderPath);
        folderRef.listAll().then(result => {
            const filePromises = result.items.map(fileRef => {
                return fileRef.getDownloadURL().then(url => {
                    return fetch(url)
                        .then(response => response.text())
                        .then(content => {
                            if (content === newFileContent) {
                                throw new Error('El archivo ya existe en las tandas de hoy.');
                            }
                        });
                });
            });

            Promise.all(filePromises).then(() => {
                const fileCount = result.items.length + 1; // Contar los archivos existentes y sumar 1
                const fileName = `TANDA ${fileCount}.txt`;
                const fileRef = folderRef.child(fileName);

                // Subir el archivo a Firebase Storage
                fileRef.put(file).then(() => {
                    Swal.fire('Subido!', 'El archivo ha sido subido exitosamente.', 'success');
                    fileInput.value = ''; // Limpiar el input de archivo
                    loadFolder(currentFolderPath); // Recargar la carpeta actual
                }).catch(error => {
                    console.error('Error al subir el archivo:', error);
                    Swal.fire('Error', 'Error al subir el archivo.', 'error');
                });
            }).catch(error => {
                console.error('Error al verificar el archivo:', error);
                Swal.fire('Error', error.message, 'error');
            });
        }).catch(error => {
            console.error('Error al listar archivos en la carpeta:', error);
            Swal.fire('Error', 'Error al listar archivos en la carpeta.', 'error');
        });
    };
    reader.readAsText(file);
}