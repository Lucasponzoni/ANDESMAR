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
    $('#spinner4').hide(); // Asegurarse de que el spinner de la página esté oculto al cargar
    cargarDatos();

    // Evento para escanear
    $('#codigoInput').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            const codigo = $(this).val();
            buscarCodigo(codigo);
        }
    });

    // Evento para el buscador
    $('#searchMercadoLibre').on('input', function() {
        const query = $(this).val().toLowerCase();
        filtrarTabla(query);
    });

    // Al abrir el modal, enfocar el input
    $('#escaneoColecta').on('shown.bs.modal', function() {
        $('#codigoInput').focus();
    });
});

function buscarCodigo(codigo) {
    const codigoNumerico = parseInt(codigo); // Convertir a número
    $('#spinner4').show(); // Mostrar spinner de la página

    database.ref('/envios').orderByChild('shippingId').limitToLast(1000).once('value').then(snapshot => {
        let encontrado = false;

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            if (data.shippingId === codigoNumerico) { // Comparar como número
                encontrado = true; // Se encontró el código

                // Verificar si el estado es Jujuy
                const additionalInfo = data.client.billing_info.additional_info;
                const estadoJujuy = additionalInfo.find(info => info.type === "STATE_NAME" && info.value === "Jujuy");

                if (estadoJujuy) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Envío no permitido',
                        text: 'Los envíos a Jujuy no están permitidos, separar etiqueta.'
                    });
                    $('#spinner4').hide(); // Ocultar spinner
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
        });

        if (!encontrado) {
            Swal.fire({
                icon: 'error',
                title: 'Código no encontrado',
                text: 'No se encontraron resultados para el código ingresado.'
            });
        }

        $('#escaneoColecta').modal('hide');
        $('#codigoInput').val(''); // Limpiar input
        $('#spinner4').hide(); // Ocultar spinner de la página
    }).catch(error => {
        console.error("Error al buscar el código: ", error);
        $('#spinner4').hide(); // Ocultar spinner en caso de error
    });
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

    const newRow = `
        <tr data-id="${data.shippingId}">
            <td>${fechaHora}</td>
            <td><a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank">${data.idOperacion}</a></td>
            <td id="sku-control-Meli">${data.shippingId}</td>
            <td id="cantidad-control-Meli">${data.Cantidad}</td>
            <td>${data.Producto}</td>
            <td><img src="${data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : ''}" alt="Imagen" style="width: auto; height: 80px;"></td>
            <td><button class="btn btn-danger btn-delete" onclick="confirmarEliminacion('${data.shippingId}')">X</button></td>
        </tr>
    `;
    
    $('#data-table-body').append(newRow);
    actualizarContador();

    // Agregar datos a Firebase
    database.ref('/despachoDelDiaMeli/' + data.shippingId).set({
        fechaHora: fechaHora,
        shippingId: data.shippingId,
        idOperacion: data.idOperacion,
        Cantidad: data.Cantidad,
        Producto: data.Producto,
        pictures: data.pictures // Solo si es necesario
    });

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
    }).catch(error => {
        console.error("Error al eliminar el registro de Firebase: ", error);
    });
}

function actualizarCantidad(cantidad) {
    const currentTotal = parseInt($('#totalCantidad').text().split(': ')[1]);
    const totalCantidad = isNaN(currentTotal) ? cantidad : currentTotal + cantidad;
    $('#totalCantidad').text(`Total Cantidad: ${totalCantidad}`);
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

    $('#totalCantidad').text(`Total Cantidad: ${totalCantidad}`);

    // Manejar las clases según la cantidad total
    if (cantidadFilas > 5) { // Cambiar 5 por el número de filas que consideres
        $('#totalCantidad').addClass('fixed-counter');
        $('#totalCantidad').removeClass('counter'); // Asegúrate de eliminar la clase counter
    } else {
        $('#totalCantidad').removeClass('fixed-counter');
        $('#totalCantidad').addClass('counter'); // Agregar la clase counter
    }
}


function cargarDatos() {
    $('#data-table-body').empty(); // Limpiar la tabla antes de cargar nuevos datos
    $('#spinner').show(); // Mostrar spinner de la página durante la carga

    database.ref('/despachoDelDiaMeli').once('value').then(snapshot => {
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                agregarFila(data);
            });
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
    });
}

function filtrarTabla(query) {
    const dataTableBody = $('#data-table-body');
    dataTableBody.empty();

    let totalCantidad = 0; // Variable para contar la cantidad total

    if (query) {
        database.ref('/despachoDelDiaMeli').once('value').then(snapshot => {
            let encontrado = false;

            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                if (data.shippingId.toString().includes(query) || data.idOperacion.toString().includes(query)) {
                    const newRow = `
                        <tr data-id="${childSnapshot.key}">
                            <td>${data.fechaHora}</td>
                            <td><a href="https://www.mercadolibre.com.ar/ventas/${data.idOperacion}/detalle" target="_blank">${data.idOperacion}</a></td>
                            <td>${data.shippingId}</td>
                            <td id="cantidad-control-Meli">${data.Cantidad}</td>
                            <td id="sku-control-Meli">${data.Producto}</td>
                            <td><img src="${data.pictures && data.pictures.length > 0 ? data.pictures[0].secure_url : ''}" alt="Imagen" style="width: auto; height: 80px;"></td>
                            <td><button class="btn btn-danger btn-delete" onclick="confirmarEliminacion('${childSnapshot.key}')">X</button></td>
                        </tr>
                    `;
                    dataTableBody.append(newRow);
                    totalCantidad += data.Cantidad; // Sumar la cantidad
                    encontrado = true;
                }
            });

            if (!encontrado) {
                dataTableBody.append(`
                    <tr>
                        <td colspan="7">
                            <div class="d-flex flex-column align-items-center justify-content-center text-center w-100">
                                <p class="errorp">No se encontraron resultados para "${query}" en el servidor</p>
                                <img src="./Img/error.gif" alt="No se encontraron resultados" class="error img-fluid mb-3">
                            </div>
                        </td>
                    </tr>
                `);
            }

            // Actualizar el contador total después de filtrar
            $('#totalCantidad').text(`Total Cantidad: ${totalCantidad}`);
        }).catch(error => {
            console.error("Error al filtrar la tabla: ", error);
        });
    } else {
        cargarDatos(); // Si el input está vacío, recargar todos los datos
        actualizarContador();
    }
}
