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

firebase.initializeApp(firebaseConfig);
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
                mostrarNotificacion("Intentaste buscar un código sin ingresar datos, operación cancelada");
                return; // Cancelar la operación
            }
    
            if (codigo.length < 11) {
                // Si el código tiene menos de 11 caracteres
                mostrarNotificacion("El ID de envío ingresado debe tener 11 caracteres");
                $(this).val(''); // Limpiar el input
                return; // Cancelar la operación
            }
    
            if (codigo.length > 11) {
                // Si el código tiene más de 11 caracteres
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
        $('.lookBase').text('Borrando Cache ...').show();
        $('#spinner4').show(); // Mostrar el spinner
    
        // Simular un pequeño retraso para mostrar el mensaje
        setTimeout(() => {
            $('#spinner4').hide(); // Ocultar el spinner
            $('.lookBase').hide(); // Ocultar el mensaje de borrado
            verificarActualizacionBaseDeDatos(); // Llamar a la función de verificación
        }, 2000); // Esperar 2 segundos antes de verificar la base de datos
    });
    
});

function verificarActualizacionBaseDeDatos() {
    const ultimaActualizacion = localStorage.getItem('ultimaActualizacion');
    const ahora = new Date().getTime();
    const unaHora = 60 * 60 * 1000; // Una hora

    // Variable para almacenar el intervalo
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
                clearInterval(intervalo); // Detener el intervalo
                return;
            }

            const minutosRestantes = Math.floor(tiempoRestante / 60000);
            const segundosRestantes = Math.floor((tiempoRestante % 60000) / 1000);

            $('.lookBase').html(`Base de datos actualizada al día <span class="redStrong">${fechaActual}</span>, se volverá a actualizar en <span class="redStrong">${minutosRestantes}:${segundosRestantes.toString().padStart(2, '0')}</span> minutos.`).show();
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
            // Si el código ya está en localStorage, usamos esos datos
            $('.lookBase').html(`Se encontró etiqueta: <span class="redStrong">${codigoNumerico}</span> en localStorage y fue agregada a la planilla.`).show();
            procesarDatos(datosAlmacenados[codigoNumerico]);
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
                                                                                                                                    Swal.fire({
                                                                                                                                        icon: 'error',
                                                                                                                                        title: 'Código no encontrado',
                                                                                                                                        text: 'No se encontraron resultados para el código ingresado.'
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
            });
        }
    }).catch(error => {
        console.error("Error en la búsqueda: ", error);
        $('#spinner4').hide();
    });
}, 1000); // Esperar 1 segundo antes de buscar en Firebase
    }, 1000); // Mostrar spinner por al menos 1 segundo
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
            }
        });

        return encontrado;
    });
}

function procesarDatos(data) {
    // Verificar si el estado es Jujuy
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

    const estadoJujuy = additionalInfo.find(info => info.type === "STATE_NAME" && info.value === "Jujuy");

    if (estadoJujuy) {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: 'Los envíos a Jujuy no están permitidos, separar etiqueta.'
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
                pictures: data.pictures // Solo si es necesario
            });
        }
    });

    // Generar la fila de la tabla sin actualizar la fecha en Firebase
    const newRow = `
        <tr data-id="${data.shippingId}">
            <td>${data.fechaHora}</td>
            <td><a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank">${data.idOperacion}</a></td>
            <td id="sku-control-Meli">${data.shippingId}</td>
            <td id="cantidad-control-Meli">${data.Cantidad}</td>
            <td>${data.Producto}</td>
            <td><img src="${data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : ''}" alt="Imagen" style="width: auto; height: 80px;"></td>
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
                        actualizarContadores(); // Actualizar contadores después de marcar como preparado
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
