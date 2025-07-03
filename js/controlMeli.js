// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCMu2vPvNzhv0cM3b4RItmqZybRhhR_HJM",
  authDomain: "despachos-meli-novogar.firebaseapp.com",
  databaseURL: "https://despachos-meli-novogar-default-rtdb.firebaseio.com",
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

let idCDS, usuarioCDS, passCDS, HookMeli, corsh

const obtenerCredencialesCDS = async () => {
    try {
        const snapshot = await window.dbCDS.ref('LogiPaq').once('value');
        const data = snapshot.val();
        idCDS = data[3];
        usuarioCDS = data[4];
        passCDS = data[5];
        HookTv = data[14];
        HookMd = data[10];
        live = data[7];
        corsh = data[6];
        token = data[11];
        channel = data[8];
        chat = data[15];
        brainsysUser = data[16];
        brainsysPass = data[17];
        HookMeli = data[21];
        HookMeli2 = data[22];
        console.log(`CDS Credentials OK`);
    } catch (error) {
        console.error('Error al obtener cred de Fire:', error);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerCredencialesCDS();
});

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

// Evento al hacer clic en el botón
document.getElementById('btn-actualizar').addEventListener('click', verificarActualizacionBaseDeDatos2);

// Función para verificar y actualizar la base de datos
function verificarActualizacionBaseDeDatos2() {
    $('.lookBase').html(`
        <div style="display: flex; flex-direction: column; align-items: center;">
            <i class="fas fa-exclamation-triangle" style="color: orange; margin-bottom: 10px; font-size: 24px;"></i>
            <span style="color: grey; font-weight: bold; text-align: center;">
                Estoy forzando la descarga de la base de datos, aguarde...
            </span>
            <i class="fas fa-spinner fa-spin" style="color: cornflowerblue; margin-top: 10px; font-size: 40px;"></i>
        </div>
    `).show();    
    
    // Eliminar el localStorage actual antes de descargar nuevos datos
    localStorage.removeItem('envios');
    localStorage.clear();
    $('#codigoInput').prop('disabled', true);

            // Mostrar el spinner por al menos 3 segundos
setTimeout(() => {
    descargarDatosDesdeFirebase(1500).then(() => {
                    const fechaActual = new Date().toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                    $('.lookBase').html(`Base de datos actualizada al día <span class="redStrong">${fechaActual}</span>`).show();
                    $('#codigoInput').prop('disabled', false);
                    $('#codigoInput').focus();
                }).catch(error => {
                    console.error("Error al descargar datos: ", error);
                    Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al descargar la base de datos.'
            });
        });
    }, 3000); // Esperar 3 segundos
}
    
function verificarActualizacionBaseDeDatos() {
    const ultimaActualizacion = localStorage.getItem('ultimaActualizacion');
    const ahora = new Date().getTime();
    const unaHora = 3600000;
    let intervalo;

    if (!ultimaActualizacion || (ahora - ultimaActualizacion > unaHora)) {
        // Si no hay registro de última actualización o ha pasado más de una hora
        $('.lookBase').text('Actualizando Base de Datos Local...').show();
        $('#spinner4').show();

        // Eliminar el localStorage actual antes de descargar nuevos datos
        localStorage.removeItem('envios');

        // Borrar el localStorage antes de mostrar el spinner y descargar los datos
        localStorage.clear();

        $('#codigoInput').prop('disabled', true);
        
        // Mostrar el spinner por al menos 3 segundos
        setTimeout(() => {
            descargarDatosDesdeFirebase(1500).then(() => {
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
                $('#codigoInput').prop('disabled', false);
                $('#codigoInput').focus();
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
            // Verificar si shippingMode es "me2"
            if (data.shippingMode === "me2") {
                // Excluir los campos no deseados
                const {
                    userProductId,
                    sellerId,
                    permalink,
                    nombreDeUsuario,
                    medidas,
                    localidad,
                    itemId,
                    estadoFacturacion,
                    dateCreated,
                    categoryId,
                    buyerId,
                    VolumenM3,
                    VolumenCM3,
                    Telefono,
                    Recibe,
                    Peso,
                    Observaciones,
                    NombreyApellido,
                    Calle,
                    Altura,
                    payments, 
                    attributes,
                    billing_info, // Descarga State_Name
                    ...filteredData
                } = data;

                // Filtrar solo el STATE_NAME de billing_info
                if (billing_info && billing_info.additional_info) {
                    const stateInfo = billing_info.additional_info.find(info => info.type === "STATE_NAME");
                    if (stateInfo) {
                        billing_info.additional_info = [{ type: "STATE_NAME", value: stateInfo.value }];
                    } else {
                        billing_info.additional_info = [];
                    }
                }

                filteredData.billing_info = billing_info; 
                datosAlmacenados[filteredData.shippingId] = filteredData; 
            }
        });
        localStorage.setItem('envios', JSON.stringify(datosAlmacenados)); 
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
                                                                                                                                    $('.lookBase').text('Buscando en toda la base de datos...').show();
                                                                                                                                    return buscarEnFirebase(codigoNumerico, null).then(encontrado => {
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
    const paymentType = data.payments && data.payments[0] && data.payments[0].payment_type;

    if (data.client && data.client.billing_info && data.client.billing_info.additional_info) {
        additionalInfo = data.client.billing_info.additional_info;
    } else {
        additionalInfo = []; // Si no existe, definir como un array vacío
        
        // Solo mostrar advertencia si el tipo de pago no es "account_money"
        if (paymentType !== "account_money") {
            const icon = 'warning';
            const title = 'Validación manual requerida';
            const message = 'No se pudo validar la provincia de compra por un error en Mercado Libre, pero el envío fue agregado igualmente. Validar manualmente';
            const shippingId = data.shippingId;
            const idOperacion = data.idOperacion;

            const toastHTML = `
            <div class="toast toast-${icon}" role="alert" aria-live="assertive" aria-atomic="true" style="margin-bottom: 5px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div class="toast-header strong-slack-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <img src="./Img/meli.png" class="rounded me-2" alt="Logo de Mercado Libre" style="width: 25px; margin-right: 10px;">
                    <strong class="me-auto" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${title}</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Cerrar" style="border: none; background: transparent; color: #aaa; font-size: 1.5rem; padding: 0 !important;" onclick="actualizarPosicionesToasts()">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="toast-body strong-slack" style="text-align: center; color: ${icon === 'error' ? '#dc3545' : '#007bff'};">
                    ${message} <br>
                    <hr style="margin: 10px 0;">
                    <strong style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px;">
                        Código de operación: 
                        <span style="background-color: #f0f0f0; padding: 6px 12px; border-radius: 5px; font-weight: bold; color: #333; box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);">
                            ${shippingId}
                        </span>
                    </strong>
                </div>
                <div class="toast-footer" style="text-align: center; margin-top: 10px;">
                    <a href="https://www.mercadolibre.com.ar/ventas/${idOperacion}/detalle" target="_blank" class="btn btn-primary mb-2" style="background-color: #007bff; border-color: #007bff;">
                        <i class="bi bi-arrow-right-circle"></i> Ir a Mercado Libre
                    </a>
                </div>
                <div id="contadorDiv" style="text-align: center; margin-top: 10px; font-weight: bold; font-size: 16px; color: #fff; background-color: #dc3545; padding: 5px 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);">
                    <i class="bi bi-clock" style="margin-right: 5px;"></i>
                    <span id="contador">10</span> segundos restantes
                </div>
            </div>`;

            // Agregar el toastHTML al contenedor
            const toastContainer = document.getElementById('toast-container');
            toastContainer.innerHTML += toastHTML;

            // Inicializar y mostrar el toast sin autohide
            const toastElement = toastContainer.lastElementChild; // Obtener el último toast agregado
            const toast = new bootstrap.Toast(toastElement, { autohide: false }); // Establecer autohide en false
            toast.show();

            // Contador de 10 segundos
            let contador = 10;
            const contadorElement = toastElement.querySelector('#contador'); // Obtener el elemento del contador
            contadorElement.innerText = contador; // Reiniciar el contador en el elemento

            const interval = setInterval(() => {
                contador--;
                contadorElement.innerText = contador; // Actualizar el contador

                if (contador <= 0) {
                    clearInterval(interval);
                    toast.hide(); // Cerrar el toast
                }
            }, 1000);

            // Reproducir sonido del toast
            const sonidoToast = new Audio('./Img/error.mp3');
            sonidoToast.play();

            // Actualizar posiciones después de agregar el nuevo toast
            actualizarPosicionesToasts();
        }
    }

    const estadoJujuy = additionalInfo.find(info => info.type === "STATE_NAME" && info.value.toLowerCase() === "jujuy");
    const estadoTierraDelFuego = additionalInfo.find(info => info.type === "STATE_NAME" && info.value.toLowerCase() === "tierra del fuego");

    if (estadoJujuy) {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: 'Los envíos que facturan a Jujuy no están permitidos, separar etiqueta.'
        });
        $('.lookBase').html(`Se encontró etiqueta en <span style="color:rgb(134, 77, 255); font-weight: bold;">LocalStorage <i class="bi bi-floppy2-fill"></i></span> y NO fue agregada a la planilla. <span class="redStrong2"><i class="bi bi-info-circle-fill"></i> ¡ERROR! Envio NO Permitido</span>`).show();
        return; // Salir de la función
    }

    if (estadoTierraDelFuego) {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: 'Los envíos que facturan a Tierra del Fuego no están permitidos, separar etiqueta.'
        });
        $('.lookBase').html(`Se encontró etiqueta en <span style="color:rgb(134, 77, 255); font-weight: bold;">LocalStorage <i class="bi bi-floppy2-fill"></i></span> y NO fue agregada a la planilla. <span class="redStrong2"><i class="bi bi-info-circle-fill"></i> ¡ERROR! Envio NO Permitido</span>`).show();
        return; // Salir de la función
    }

    // Nueva validación para data.Provincia
    if (data.Provincia.toLowerCase() === 'jujuy' || data.Provincia.toLowerCase() === 'tierra del fuego') {
        Swal.fire({
            icon: 'error',
            title: 'Envío no permitido',
            text: `Se detectó un envío a ${data.Provincia}, verificar en Mercado Pago si posee retención de impuesto a esta provincia.`
        });
        $('.lookBase').html(`Se encontró etiqueta en <span style="color:rgb(134, 77, 255); font-weight: bold;">LocalStorage <i class="bi bi-floppy2-fill"></i></span> y NO fue agregada a la planilla. <span class="redStrong2"><i class="bi bi-info-circle-fill"></i> ¡ERROR! Envio NO Permitido</span>`).show();
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

function actualizarPosicionesToasts() {
    const toasts = document.querySelectorAll('.toast');
    let lastVisibleToast = null;

    toasts.forEach((toast) => {
        if (toast.style.display !== 'none') {
            lastVisibleToast = toast; // Guardar el último toast visible
        }
    });

    toasts.forEach((toast) => {
        // Si es el último toast visible, aplicar 90px de margen inferior
        if (toast === lastVisibleToast) {
            toast.style.marginBottom = '90px';
        } else {
            toast.style.marginBottom = '5px';
        }
    });
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

function agregarFilaFiltrados(data) {
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
            return database.ref('/despachoDelDiaMeli/' + data.shippingId).set({
                fechaHora: fechaHora,
                shippingId: data.shippingId,
                idOperacion: data.idOperacion,
                Cantidad: data.Cantidad,
                Producto: data.Producto,
                pictures: data.pictures
            }).catch(error => {
                console.error('Error al guardar en Firebase:', error);
            });
        }
    }).catch(error => {
        console.error('Error al verificar la existencia en Firebase:', error);
    });

    // Generar la fila de la tabla
    const newRow = `
        <tr data-id="${data.shippingId}">
            <td>${data.fechaHora || fechaHora}</td>
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
        title: '¿Confirmar eliminación?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarFila(id);
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

async function enviarCorreoDespacho(destinatarioEmail, datosEgresados) {
    const emailBody = obtenerDatosTabla(datosEgresados); // Asegúrate de que esta función reciba los datos correctos
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
    console.log('Iniciando proceso de cierre de colecta...');
    const tableBody = document.getElementById('data-table-body');
    const totalCantidad = document.getElementById('totalCantidad').innerText;

    // Verificar si hay datos en la tabla
    if (tableBody.querySelectorAll('tr').length <= 1 || totalCantidad === 'Total Cantidad: 0') {
        console.log('No hay datos en la colecta - abortando');
        showAlertError('<i class="bi bi-exclamation-triangle-fill"></i> No hay datos en la colecta.');
        return;
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

    const { value: confirm } = await Swal.fire({
        title: '¿Está seguro que desea finalizar la colecta?',
        text: 'Aceptar para confirmar, o cancelar para volver.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
    });

    if (confirm) {
        console.log('Usuario confirmó el cierre - verificando paquetes no egresados');
        
        // Contar paquetes no egresados
        const snapshot = await database.ref('/despachoDelDiaMeli').once('value');
        let noEgresados = [];
        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            console.log(`Verificando paquete ${childSnapshot.key}: estado=${data.estado || 'no definido'}`);
            
            // Verificar si el estado no está definido o es diferente de "preparado"
            if (typeof data.estado === 'undefined' || data.estado !== 'preparado') {
                console.log(`Paquete ${childSnapshot.key} no está preparado - agregando a noEgresados`);
                noEgresados.push(childSnapshot.key);
            }
        });

        const totalPaquetes = snapshot.numChildren();
        console.log(`Total paquetes: ${totalPaquetes}, No egresados: ${noEgresados.length}`);

        if (noEgresados.length > 0) {
            const mensaje = `
                <div class="error-colecta">
                    <img src="Img/error-comment.gif" alt="Error" style="width: 220px;">
                </div>
                <p class="logistica-propia-sweet-alert">
                    Vas a cerrar la colecta pero quedan <strong style="color: #dc3545;">${noEgresados.length}</strong> paquetes sin egresar de <strong style="color: #dc3545;">${totalPaquetes}</strong> en total.
                </p>
                <p>
                    <strong>¿Deseas realizar un cierre parcial y pasar los artículos para la próxima colecta?</strong>
                </p>
            `;

            const result = await Swal.fire({
                html: mensaje,
                showCancelButton: true,
                confirmButtonText: '<i class="bi bi-arrow-right-circle"></i> Cierre Parcial',
                cancelButtonText: '<i class="bi bi-x-circle"></i> Cierre Total'
            });

            if (result.isDismissed) {
                console.log('Usuario seleccionó Cierre Total - procediendo');
                // Lógica para Cierre Total
                for (const email of destinatarios) {
                    await enviarCorreoDespacho(email);
                }

                const firebaseUrl = 'https://despachos-meli-novogar-default-rtdb.firebaseio.com/despachoDelDiaMeli.json';
                await fetch(firebaseUrl, {
                    method: 'DELETE'
                });

                tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No has comenzado una colecta aún, manos a la obra 😎</td></tr>';
                document.getElementById('totalCantidad').innerHTML = '<i class="bi bi-box-seam-fill"></i> Total Unidades: 0';
                document.getElementById('totalFila').innerHTML = '<i class="bi bi-bookmark-check-fill"></i> Total Etiquetas: 0';

                showAlert('<i class="bi bi-check-circle"></i> Colecta cerrada y datos enviados exitosamente.');
                return;
            }

            if (result.isConfirmed) {
                console.log('Usuario seleccionó cierre parcial - iniciando proceso');
                
                // Mostrar spinner
                const spinnerContainer = document.createElement('div');
                spinnerContainer.style.position = 'fixed';
                spinnerContainer.style.top = '50%';
                spinnerContainer.style.left = '50%';
                spinnerContainer.style.transform = 'translate(-50%, -50%)';
                spinnerContainer.style.textAlign = 'center';
                spinnerContainer.style.zIndex = '9999';
                spinnerContainer.className = 'spinner-container-colecta';

                const spinner = document.createElement('img');
                spinner.src = 'Img/cargando.png';
                spinner.className = 'spinner-gif-colecta';
                spinner.style.width = '50%';

                spinnerContainer.appendChild(spinner);
                document.body.appendChild(spinnerContainer);

                // Cierre Parcial
                const proximaColectaRef = database.ref('/DespachosProximaColecta');
                console.log('Preparando mover paquetes no egresados a próxima colecta');

                for (const id of noEgresados) {
                    console.log(`Procesando paquete ${id}`);
                    const data = await database.ref('/despachoDelDiaMeli/' + id).once('value');
                    console.log(`Moviendo paquete ${id} a DespachosProximaColecta`);
                    await proximaColectaRef.child(id).set(data.val());
                    console.log(`Eliminando paquete ${id} de despachoDelDiaMeli`);
                    await database.ref('/despachoDelDiaMeli/' + id).remove();
                    $(`#data-table-body tr[data-id="${id}"]`).remove();
                }

                console.log('Recalculando contadores');
                actualizarContador();

                console.log('Enviando correos a destinatarios');
                for (const email of destinatarios) {
                    await enviarCorreoDespacho(email);
                }

                console.log('Limpiando despachoDelDiaMeli');
                await database.ref('/despachoDelDiaMeli').remove();

                console.log('Recuperando datos de DespachosProximaColecta');
                const despachosSnapshot = await proximaColectaRef.once('value');
                const despachos = despachosSnapshot.val();

                if (despachos) {
                    console.log(`Moviendo ${Object.keys(despachos).length} paquetes de vuelta a despachoDelDiaMeli`);
                    for (const key in despachos) {
                        const data = despachos[key];
                        if (typeof data.estado === 'undefined' || data.estado !== 'preparado') {
                            console.log(`Moviendo paquete ${key} de vuelta a despachoDelDiaMeli`);
                            await database.ref('/despachoDelDiaMeli').child(key).set(data);
                        }
                    }
                }

                console.log('Limpiando DespachosProximaColecta');
                await proximaColectaRef.remove();

                console.log('Recargando página en 6 segundos');
                setTimeout(() => {
                    location.reload();
                }, 6000);
            }
        } else {
            console.log('No hay paquetes sin egresar - procediendo con cierre total directo');
            
            // Cierre Total directamente si no hay paquetes sin egresar
            console.log('Enviando correos a destinatarios');
            for (const email of destinatarios) {
                await enviarCorreoDespacho(email);
            }

            console.log('Eliminando nodo despachoDelDiaMeli de Firebase');
            const firebaseUrl = 'https://despachos-meli-novogar-default-rtdb.firebaseio.com/despachoDelDiaMeli.json';
            await fetch(firebaseUrl, {
                method: 'DELETE'
            });

            console.log('Reseteando tabla');
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">No has comenzado una colecta aún, manos a la obra 😎</td></tr>';
            document.getElementById('totalCantidad').innerHTML = '<i class="bi bi-box-seam-fill"></i> Total Unidades: 0';
            document.getElementById('totalFila').innerHTML = '<i class="bi bi-bookmark-check-fill"></i> Total Etiquetas: 0';

            console.log('Mostrando alerta de éxito');
            showAlert('<i class="bi bi-check-circle"></i> Colecta cerrada y datos enviados exitosamente.');
        }
    } else {
        console.log('Usuario canceló el cierre de colecta');
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

/*
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
*/

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

$('#etiquetasModal').on('hidden.bs.modal', function () {
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

async function extractSalesNumbers(content) {
    const labelRegex = /\^XA[\s\S]*?\^XZ/g;
    const saleRegex = /(?:\^FO120,120\^A0N,24,24\^FD(Venta|Pack ID): (\d+)\^FS[\s\S]*?\^FO(\d+),117\^A0N,27,27\^FD(\d+)\^FS)/g;
    const idRegex = /"id":"(\d+)"/g;

    const matches = [];

    const labels = content.match(labelRegex); // Obtener todas las etiquetas
    console.log(`🔍 Se encontraron ${labels?.length || 0} etiquetas ZPL`);

    if (labels) {
        for (const labelContent of labels) {
            let idMatch = idRegex.exec(labelContent); // Buscar el ID en el contenido de la etiqueta
            let saleMatch;

            while ((saleMatch = saleRegex.exec(labelContent)) !== null) {
                const saleType = saleMatch[1]; // "Venta" o "Pack ID"
                const saleNumber = saleMatch[2];
                const additionalNumber = saleMatch[4];
                const shippingId = idMatch ? idMatch[1] : 'No ID';
                const fullSaleNumber = `${saleNumber}${additionalNumber}`;

                console.log(`📦 Tipo: ${saleType}, Número: ${fullSaleNumber}, ShippingID: ${shippingId}`);

                let ventaNumber = 'SIN INFO DE NUMERO DE VENTA';

                if (saleType === "Pack ID") {
                    console.log(`🔎 Buscando en Firebase /enviosId que termine en SHIP-${shippingId}`);

                    const snapshot = await firebase.database().ref('/enviosID').once('value');
                    const envios = snapshot.val();

                    let encontrado = false;

                    for (const key in envios) {
                        if (key.endsWith(`SHIP-${shippingId}`)) {
                            console.log(`✅ Nodo encontrado: ${key}`);
                            const matchVenta = key.match(/V-(\d+)_/);
                            if (matchVenta) {
                                ventaNumber = matchVenta[1];
                                console.log(`🆔 Venta extraída: ${ventaNumber}`);
                            } else {
                                console.warn(`⚠️ No se pudo extraer venta desde el nodo: ${key}`);
                            }
                            encontrado = true;
                            break;
                        }
                    }

                    if (!encontrado) {
                        console.warn(`❌ No se encontró ningún nodo que termine con SHIP-${shippingId}`);
                    }
                }

                if (saleType === "Pack ID") {
                    matches.push(`${saleType}: ${fullSaleNumber} / V: ${ventaNumber} ---- ShippingID: ${shippingId}`);
                } else {
                    matches.push(`${saleType}: ${fullSaleNumber} ---- ShippingID: ${shippingId}`);
                }

                idMatch = idRegex.exec(labelContent); // Avanzar al siguiente ID si hay más
            }
        }
    }

    return matches;
}

async function handleGenerateClick(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const url = button.getAttribute('data-url');
    const fileName = button.getAttribute('data-name');
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    button.classList.add('btn-secondary', 'fixed-size');
    button.classList.remove('btn-primary');
    button.disabled = true;
    setTimeout(async () => {
        try {
            const response = await fetch(`https://proxy.cors.sh/${url}`, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                }
            });
            const content = await response.text();
            const billingContent = await generateBillingFile(content, fileName);
            const billingFileName = `Facturacion_${fileName}.txt`;
            downloadBillingFile(billingContent, billingFileName);
            button.innerHTML = '<i class="bi bi-check-all"></i>';
            button.classList.add('btn-success');
            button.classList.remove('btn-secondary');
            button.disabled = false;
        } catch (error) {
            showSpinner(false);
            console.error('Error al generar el archivo de facturación:', error);
            Swal.fire('Error', 'Error al generar el archivo de facturación.', 'error');
        }
    }, 2000);
}

async function buscarEnFirebase2(codigoNumerico) {
    const ref = database.ref('/envios').child(codigoNumerico);
    const snapshot = await ref.once('value');
    return snapshot.exists() ? snapshot.val() : null;
}

function logMessage(message) {
    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
        logContainer.style.display = 'block';
        logContainer.innerHTML += `<div>${message}</div>`;
        logContainer.scrollTop = logContainer.scrollHeight; // Scroll to the bottom
    } else {
        console.error('logContainer element not found');
    }
}

async function generateBillingFile(content, fileName) {
    const salesNumbers = await extractSalesNumbers(content);
    let billingContent = '';

    // Preparar nombre de archivo sin .txt y con guión bajo
    const fileNameSinExtension = fileName.replace('.txt', '').replace(' ', '_');

    for (const [index, number] of salesNumbers.entries()) {
        const shippingIdMatch = number.match(/ShippingID: (\d+)/);
        const ventaMatch = number.match(/Venta: (\d+)/);
        const packIdMatch = number.match(/Pack ID: (\d+)/);
        const vMatch = number.match(/V: (\d+)/);
        
        let data = null;

        if (ventaMatch) {
            const ventaId = ventaMatch[1];
            logMessage(`Buscando en Mercado Libre el ID de Venta: ${ventaId}...`);
            try {
                data = await buscarEnFirebase2(ventaId);
                if (data) {
                    logMessage(`Encontrado con Exito`);

                    // 👉 Push ventaId a Firebase
                    firebase.database()
                    .ref(`ImpresionEtiquetas/${selectedFolderDate}/${fileNameSinExtension}`)
                    .child(ventaId)
                    .set({ ventaId });

                    const additionalInfo = data.client?.billing_info?.additional_info || [];

                    const estadoJujuy = additionalInfo.find(
                        info => info.type === "STATE_NAME" && info.value?.toLowerCase() === "jujuy"
                    ) || (data.Provincia?.toLowerCase() === "jujuy" ? { type: "STATE_NAME", value: "jujuy" } : undefined);

                    const estadoTierraDelFuego = additionalInfo.find(
                        info => info.type === "STATE_NAME" && info.value?.toLowerCase() === "tierra del fuego"
                    ) || (data.Provincia?.toLowerCase() === "tierra del fuego" ? { type: "STATE_NAME", value: "tierra del fuego" } : undefined);

                    if (estadoJujuy) {
                        billingContent += `${index + 1}- ${number} ---- NO FACTURAR JUJUY\n`;
                    } else if (estadoTierraDelFuego) {
                        billingContent += `${index + 1}- ${number} ---- NO FACTURAR TIERRA DEL FUEGO\n`;
                    } else if (data.Provincia.toLowerCase() === 'jujuy' || data.Provincia.toLowerCase() === 'tierra del fuego') {
                        billingContent += `${index + 1}- ${number} ---- NO FACTURAR ${data.Provincia.toUpperCase()}\n`;
                    } else {
                        billingContent += `${index + 1}- ${number} ---- Control Ok.\n`;
                    }
                } else {
                    logMessage(`No se logró encontrar el ID de Venta: ${ventaId} en Mercado Libre, Verifique Manualmente.`);
                    billingContent += `${index + 1}- ${number} ---- No se logró validar, VERIFICAR MANUALMENTE\n`;
                }
            } catch (error) {
                logMessage(`Error al buscar el ID de Venta: ${ventaId}`);
                billingContent += `${index + 1}- ${number} ---- No se logró validar, VERIFICAR MANUALMENTE\n`;
            }
        } else if (packIdMatch && vMatch) {
            const ventaId = vMatch[1];
            logMessage(`Buscando en Mercado Libre el ID de Venta para Pack ID: ${ventaId}...`);
            try {
                data = await buscarEnFirebase2(ventaId);
                if (data) {
                    logMessage(`Encontrado con Éxito`);

                    // 👉 Push ventaId a Firebase
                    firebase.database()
                    .ref(`ImpresionEtiquetas/${selectedFolderDate}/${fileNameSinExtension}`)
                    .child(ventaId)
                    .set({ ventaId });

                    const additionalInfo = data.client?.billing_info?.additional_info || [];

                    const estadoJujuy = additionalInfo.find(
                        info => info.type === "STATE_NAME" && info.value?.toLowerCase() === "jujuy"
                    ) || (data.Provincia?.toLowerCase() === "jujuy" ? { type: "STATE_NAME", value: "jujuy" } : undefined);

                    const estadoTierraDelFuego = additionalInfo.find(
                        info => info.type === "STATE_NAME" && info.value?.toLowerCase() === "tierra del fuego"
                    ) || (data.Provincia?.toLowerCase() === "tierra del fuego" ? { type: "STATE_NAME", value: "tierra del fuego" } : undefined);

                    if (estadoJujuy) {
                        billingContent += `${index + 1}- ${number} ---- NO FACTURAR JUJUY\n`;
                    } else if (estadoTierraDelFuego) {
                        billingContent += `${index + 1}- ${number} ---- NO FACTURAR TIERRA DEL FUEGO\n`;
                    } else {
                        billingContent += `${index + 1}- ${number} ---- Control Ok.\n`;
                    }
                } else {
                    logMessage(`No se logró encontrar el ID de Venta para Pack ID: ${ventaId} en Mercado Libre.`);
                    billingContent += `${index + 1}- ${number} ---- No se logró validar, VERIFICAR MANUALMENTE\n`;
                }
    } catch (error) {
        logMessage(`Error al buscar el ID de Venta para Pack ID: ${ventaId}`);
        billingContent += `${index + 1}- ${number} ---- No se logró validar, VERIFICAR MANUALMENTE\n`;
    }
        } else if (shippingIdMatch) {
    const shippingId = shippingIdMatch[1];
    logMessage(`Buscando en Mercado Libre el ShippingID: ${shippingId}...`);

    // Extraer el Pack ID si está presente en la cadena
    const packId = packIdMatch ? packIdMatch[1] : null;

    // Aquí puedes hacer el push a Firebase usando el Pack ID
    if (packId) {
        firebase.database()
        .ref(`ImpresionEtiquetas/${selectedFolderDate}/${fileNameSinExtension}`)
        .child(packId)
        .set({ packId });
        
        billingContent += `${index + 1}- ${number} ---- Pack ID: ${packId} ---- No se logró validar, VERIFICAR MANUALMENTE\n`;
    } else {
        billingContent += `${index + 1}- ${number} ---- No se logró validar, VERIFICAR MANUALMENTE\n`;
    }
    }}

    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
        logContainer.style.display = 'none';
    }

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

// Variable global para almacenar la fecha de la carpeta
let selectedFolderDate = '';

function loadFolder(folderPath) {
    showSpinner(true);
    const folderRef = storage.ref(folderPath);
    folderRef.listAll().then(result => {
        showSpinner(false);
    
        const folderList = document.getElementById('folderList');
        folderList.innerHTML = '';
    
        // Invertir el listado de carpetas
        const maxItemsToShow = 5;
        let itemsToShow = maxItemsToShow;
        const items = [];
        
        // Ordenar las carpetas por fecha
        const sortedPrefixes = result.prefixes.sort((a, b) => {
            const extractDate = (name) => {
                const parts = name.split('/').pop().match(/(\d+)-(\d+)-(\d+)/);
                return new Date(parts[3], parts[2] - 1, parts[1]); // Año, Mes (0-indexed), Día
            };
        
            const dateA = extractDate(a.name);
            const dateB = extractDate(b.name);
        
            return dateB - dateA; // Orden descendente
        });

        sortedPrefixes.forEach((folderRef, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-start';
            listItem.innerHTML = `
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${folderRef.name}</div>
                </div>
                <span class="badge text-bg-primary rounded-pill">Cargando...</span>
            `;
            items.push(listItem);
        
            listItem.addEventListener('click', () => {
                // Extraer la fecha de la carpeta y guardarla en la variable global
                const parts = folderRef.name.match(/(\d+)-(\d+)-(\d+)/);
                if (parts) {
                     selectedFolderDate = `${parts[1]}-${parts[2]}-${parts[3]}`; // Formato: DD-MM-YYYY
                     console.log('Seleccionada:', selectedFolderDate);
                }

                folderStack.push(currentFolderPath);
                currentFolderPath = folderRef.fullPath;
                loadFolder(currentFolderPath);
            });
        
            folderRef.listAll().then(subResult => {
                const fileCount = subResult.items.length;
                const tandaText = fileCount === 1 ? 'tanda' : 'tandas';
                listItem.querySelector('.badge').textContent = `${fileCount} ${tandaText}`;
            }).catch(error => {
                console.error('Error al listar subcarpetas:', error);
                showSpinner(false);
                Swal.fire('Error', 'Error al listar subcarpetas.', 'error');
            });
        });
        
        // Mostrar los primeros 5 elementos
        items.slice(0, itemsToShow).forEach(item => folderList.appendChild(item));
        
        // Agregar botón "Ver más" si hay más de 5 elementos
        if (items.length > maxItemsToShow) {
            const showMoreButton = document.createElement('button');
            showMoreButton.className = 'btn btn-primary mt-2';
            showMoreButton.innerHTML = 'Ver más <i class="bi bi-chevron-down" style="margin-right: 8px;"></i>';
            
            const showLessButton = document.createElement('button');
            showLessButton.className = 'btn btn-danger mt-2 mb-2';
            showLessButton.innerHTML = 'Ver menos <i class="bi bi-chevron-up" style="margin-right: 8px;"></i>';
            showLessButton.style.display = 'none'; // Ocultar inicialmente

            showMoreButton.addEventListener('click', () => {
                // Mostrar todos los elementos
                items.slice(itemsToShow).forEach(item => folderList.appendChild(item));
                showMoreButton.style.display = 'none'; // Ocultar el botón "Ver más"
                showLessButton.style.display = 'inline-block'; // Mostrar el botón "Ver menos"
            });

            showLessButton.addEventListener('click', () => {
                // Ocultar los elementos adicionales y mostrar solo los primeros 5
                items.slice(maxItemsToShow).forEach(item => item.remove());
                showLessButton.style.display = 'none'; // Ocultar el botón "Ver menos"
                showMoreButton.style.display = 'inline-block'; // Mostrar el botón "Ver más"
            });

            folderList.appendChild(showMoreButton);
            folderList.appendChild(showLessButton);
        }

        result.items.forEach(fileRef => {
            showSpinner(true);
            fileRef.getMetadata().then(metadata => {
                const uploadTime = new Date(metadata.timeCreated);
                const formattedTime = formatTime(uploadTime);

                fileRef.getDownloadURL().then(url => {
                    fetch(`https://proxy.cors.sh/${url}`, {
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET',
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                        }
                    })
                    .then(response => response.text())
                    .then(content => {
                        const labelCount = countLabels(content);
                        const tandaNumber = parseInt(fileRef.name.match(/\d+/)[0], 10);
                        const listItem = document.createElement('li');
                        listItem.className = 'list-group-item d-flex justify-content-between align-items-start';
                        
                        listItem.innerHTML = `
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">${fileRef.name}</div>
                                <small class="time-etiquetas-container"><i class="bi bi-clock"></i> ${formattedTime}</small>
                            </div>
                            <span class="badge text-bg-primary rounded-pill">Archivo (${labelCount} etiquetas)</span>
                            <button class="btn btn-danger btn-sm delete-btn fixed-size" data-ref="${fileRef.fullPath}" id="delete-tanda${tandaNumber}">
                                <i class="bi bi-trash" style="width: 19.2px; height: 19.2px;"></i>
                            </button>
                            <button class="btn btn-primary btn-sm comment-btn fixed-size" data-ref="${fileRef.fullPath}" id="comment-tanda${tandaNumber}">
                                <i class="bi bi-chat" style="width: 19.2px; height: 19.2px;"></i>
                            </button>
                            <button class="btn btn-primary btn-sm generate-btn fixed-size" data-url="${url}" data-name="${fileRef.name}" id="generar-tanda${tandaNumber}">
                                <i class="bi bi-file-earmark-arrow-down" style="width: 19.2px; height: 19.2px;"></i>
                            </button>
                        `;
                        
                        // Verificar si ya existe un comentario y actualizar el botón
                        const commentButton = listItem.querySelector(`#comment-tanda${tandaNumber}`);
                        const sanitizedPath = fileRef.fullPath.replace(/[.#$[\]]/g, '_'); // Reemplazar caracteres no permitidos
                        const commentRef = database.ref(`/comments/${sanitizedPath}`);
                        
                        commentRef.once('value').then(snapshot => {
                            if (snapshot.exists()) {
                                commentButton.classList.remove('btn-primary');
                                commentButton.classList.add('btn-success');
                                commentButton.innerHTML = '<i class="bi bi-chat-dots-fill" style="width: 19.2px; height: 19.2px;"></i>';
                            }
                        }).catch(error => {
                            console.error('Error al verificar el comentario:', error);
                        });
                        
                        // Delegación de eventos para manejar los clics en los botones de comentario
                        document.getElementById('folderList').addEventListener('click', async (event) => {
                            if (event.target.closest('.comment-btn')) {
                                const button = event.target.closest('.comment-btn');
                                console.log('Botón de comentario clickeado:', button);
                        
                                const fileRefPath = button.getAttribute('data-ref');
                                console.log('fileRefPath:', fileRefPath);
                        
                                const sanitizedPath = fileRefPath.replace(/[.#$[\]]/g, '_'); // Reemplazar caracteres no permitidos
                                console.log('sanitizedPath:', sanitizedPath);
                        
                                const commentRef = database.ref(`/comments/${sanitizedPath}`);
                        
                                // Obtener el comentario existente
                                let existingComment = '';
                                try {
                                    const snapshot = await commentRef.once('value');
                                    if (snapshot.exists()) {
                                        existingComment = snapshot.val();
                                    }
                                } catch (error) {
                                    console.error('Error al obtener el comentario:', error);
                                }
                        
                                // Mostrar el div de comentario
                                const commentDiv = document.getElementById('commentDiv');
                                if (commentDiv) {
                                    commentDiv.style.display = 'block';
                                    const commentTextarea = document.getElementById('commentTextarea');
                                    commentTextarea.value = existingComment;
                                    commentTextarea.focus(); // Hacer foco en el textarea
                                    console.log('Div de comentario mostrado y foco en textarea');
                                } else {
                                    console.error('Div de comentario no encontrado');
                                }
                        
                                // Guardar el comentario
                                document.getElementById('saveCommentButton').onclick = () => {
                                    const comment = document.getElementById('commentTextarea').value;
                                    if (comment) {
                                        commentRef.set(comment).then(() => {
                                            Swal.fire('Comentario guardado!', 'Su comentario ha sido guardado exitosamente.', 'success');
                                            button.classList.remove('btn-primary');
                                            button.classList.add('btn-success');
                                            button.innerHTML = '<i class="bi bi-chat-dots-fill" style="width: 19.2px; height: 19.2px;"></i>';
                                            commentDiv.style.display = 'none';
                                        }).catch(error => {
                                            Swal.fire('Error', `Error al guardar el comentario: ${error}`, 'error');
                                        });
                                    } else {
                                        Swal.fire('Error', 'El comentario no puede estar vacío', 'error');
                                    }
                                };
                        
                                // Cancelar el comentario
                                document.getElementById('cancelCommentButton').onclick = () => {
                                    commentDiv.style.display = 'none';
                                };
                            }
                        });

                        // EVENTO AL HACER CLICK EN EL BADGE DE ETIQUETA
                        listItem.querySelector('.badge').addEventListener('click', async (event) => {
                            event.stopPropagation();

                            let fileNameSinExtension = fileRef.name.replace('.txt', '').replace(/ /g, '_');
                            const refPath = `ImpresionEtiquetas/${selectedFolderDate}/${fileNameSinExtension}`;

                            try {
                                const snapshot = await firebase.database().ref(refPath).once('value');
                                if (!snapshot.exists()) {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Primero ejecutá el análisis de etiquetas',
                                        text: 'Debés hacer clic en el botón de descarga después de haber generado las etiquetas.',
                                        confirmButtonText: 'Entendido'
                                    });
                                    return;
                                }

                                const corsHeaders = {
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'GET',
                                    'Access-Control-Allow-Headers': 'Content-Type',
                                    'Access-Control-Allow-Origin': '*',
                                    'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                                };

                                const { value: opcionElegida } = await Swal.fire({
                                    title: '¿Cómo seguimos?',
                                    icon: 'question',
                                    showCancelButton: true,
                                    showDenyButton: true,
                                    confirmButtonText: '🖨️ Solo Imprimir',
                                    denyButtonText: '📦 Solo Ingresar',
                                    cancelButtonText: '❌ Cancelar',
                                    html: `
                                        <hr style="margin: 15px 0; border: 1px solid #e0e0e0; width: 90%;">
                                        <div style="display: flex; justify-content: center; gap: 15px; margin: 10px 0 20px;">
                                            <button id="generarQueryBtn" class="swal2-styled" 
                                                    style="background-color: #187FBBFF; padding: 8px 20px; font-weight: bold;">
                                                ℹ️ Generar Query
                                            </button>
                                            <button id="tandaNovogarBtn" class="swal2-styled" 
                                                    style="background-color: #187FBBFF; padding: 8px 20px; font-weight: bold;">
                                                ⚠️ Tanda Novogar
                                            </button>
                                        </div>
                                    `,
                                    showCloseButton: false,
                                    footer: '', // Sin botón adicional en el footer
                                    didOpen: () => {
                                        const generarQueryBtn = document.getElementById('generarQueryBtn');
                                        if (generarQueryBtn) {
                                            generarQueryBtn.addEventListener('click', async () => {
                                                await generarTablaQuery(snapshot.val(), selectedFolderDate, fileNameSinExtension);
                                                // El modal permanece abierto
                                            });
                                        }
// GENERACION DE TXT PARA ZEBRA
const tandaNovogarBtn = document.getElementById('tandaNovogarBtn');
if (tandaNovogarBtn) {
    tandaNovogarBtn.addEventListener('click', async () => {
        // Mostrar loader al inicio
        const loadingSwal = Swal.fire({
            title: 'Generando Tanda Novogar',
            html: 'Procesando y ordenando etiquetas...',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // 1. Obtener contenido original
            const response = await fetch("https://proxy.cors.sh/" + url, {
                headers: corsHeaders
            });

            if (!response.ok) throw new Error('No se pudo descargar el archivo original');

            let originalText = await response.text();

            // 2. Procesar cada etiqueta y extraer SKU para ordenamiento
            const etiquetas = originalText.split('^XZ').filter(etq => etq.trim() !== '');

            // Array para almacenar etiquetas con sus SKUs
            const etiquetasConSku = await Promise.all(etiquetas.map(async (etiqueta, index) => {
                // --- FORMATO ANTIGUO ---
                // SKU: ^FO265,192^A0N,25,25^FB510,1,-1^FH^FD[SKU]^FS
                // Descripción: ^FO200,15^A0N,29,29^FB570,2,-1^FH^FD[Descripción]^FS
                const skuAntiguoMatch = etiqueta.match(/\^FO265,192\^A0N,25,25\^FB510,1,-1\^FH\^FD([^\^]+)\^FS/);
                const descAntiguoMatch = etiqueta.match(/\^FO200,15\^A0N,29,29\^FB570,2,-1\^FH\^FD([^\^]+)\^FS/);

                // --- FORMATO NUEVO ---
                // Descripción: ^FO200,100^A0N,27,27^FB570,3,-1^FH^FD[Descripción]^FS
                // SKU: ^FO200,181^A0N,24,24^FB570,3,-1^FH^FD...SKU: [SKU]^FS
                const descNuevoMatch = etiqueta.match(/\^FO200,100\^A0N,27,27\^FB570,3,-1\^FH\^FD([^\^]+)\^FS/);
                const skuNuevoMatch = etiqueta.match(/\^FO200,181\^A0N,24,24\^FB570,3,-1\^FH\^FD.*SKU:\s*([A-Za-z0-9_\-]+)[^\^]*\^FS/);

                let sku = '', descripcion = '';
                let esFormatoNuevo = false;

                // --- LÓGICA DE DETECCIÓN Y EXTRACCIÓN ---
                if (skuAntiguoMatch || descAntiguoMatch) {
                    // FORMATO ANTIGUO
                    // Extraigo y decodifico el SKU si viene en formato especial
                    let rawSku = skuAntiguoMatch ? skuAntiguoMatch[1].trim().toUpperCase() : 'ZZZ_SIN_SKU_EN_MELI';
                    sku = rawSku.replace(/_([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
                    descripcion = descAntiguoMatch ? descAntiguoMatch[1].trim() : '';
                    descripcion = descripcion.substring(0, 30);
                    esFormatoNuevo = false;
                } else if (skuNuevoMatch || descNuevoMatch) {
                    // FORMATO NUEVO
                    let rawSku2 = skuNuevoMatch ? skuNuevoMatch[1].trim().toUpperCase() : 'ZZZ_SIN_SKU_EN_MELI';
                    sku = rawSku2.replace(/_([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
                    descripcion = descNuevoMatch ? descNuevoMatch[1].trim() : '';

                    // Agregar condición para la descripción específica
                    if (descripcion === "Microondas Bgh 28 Litros Digital Eco B228ds20" && !skuNuevoMatch) {
                        sku = "B228DS20";
                    }

                    descripcion = descripcion.substring(0, 30);
                    esFormatoNuevo = true;
                } else {
                    // No se detectó formato, fallback
                    sku = 'ZZZ_SIN_SKU_EN_MELI';
                    descripcion = '';
                    esFormatoNuevo = false;
                }

                // --- ANTIGUO ---
                const ventaMatch = etiqueta.match(/\^FO188,245\^A0N,30,30\^FD(\d+)\^FS/);
                const precioMatch = etiqueta.match(/\^FO124,249\^A0N,25,25\^FD(\d+)\^FS/);
                // --- NUEVO ---
                const ventaNuevoMatch = etiqueta.match(/\^FO19[89],40\^A0N,30,30\^FD(\d+)\^FS/);
                const codigoMatch = etiqueta.match(/\^FO134,39\^A0N,25,25\^FD(\d+)\^FS/);

                // Determinar ventaCompleta según formato
                let ventaCompleta = '';
                if (ventaMatch || precioMatch) {
                    ventaCompleta = (precioMatch ? precioMatch[1] : '') + (ventaMatch ? ventaMatch[1] : '');
                } else if (ventaNuevoMatch) {
                    // Si existe código especial, anteponerlo
                    if (codigoMatch) {
                        ventaCompleta = codigoMatch[1] + ventaNuevoMatch[1];
                    } else {
                        ventaCompleta = ventaNuevoMatch[1];
                    }
                }

                // --- ANTIGUO ---
                const cantidadMatch = etiqueta.match(/\^FO30,80\^A0N,70,70\^FB160,1,0,C\^FD(\d+)\^FS/);
                // --- NUEVO ---
                // ^FO10,130^A0N,70,70^FB160,1,0,C^FD1^FS
                const cantidadNuevoMatch = etiqueta.match(/\^FO10,130\^A0N,70,70\^FB160,1,0,C\^FD(\d+)\^FS/);

                // Determinar cantidad según formato
                let cantidad = '0';
                if (cantidadMatch) {
                    cantidad = cantidadMatch[1].trim();
                } else if (cantidadNuevoMatch) {
                    cantidad = cantidadNuevoMatch[1].trim();
                }

                // Extraer información de Firebase en una sola llamada
                let textoEnvio = '';
                let esDeProvinciaExcluida = false;
                let cantidadFirebase = 'X';

                if (ventaCompleta && ventaCompleta !== '00000') {
                    try {
                        // Obtener todos los envíos de /enviosID
                        const snapshot = await firebase.database().ref('/enviosID').once('value');
                        const allEnvios = snapshot.val();

                        let nodoEncontrado = null;

                        if (allEnvios) {
                            const claves = Object.keys(allEnvios);

                            // Buscar clave que contenga exactamente `P-ventaCompleta` o `V-ventaCompleta`
                            nodoEncontrado = claves.find(key => key.includes(`P-${ventaCompleta}`)) ||
                                            claves.find(key => key.includes(`V-${ventaCompleta}`));

                            if (nodoEncontrado) {
                                const data = allEnvios[nodoEncontrado];

                                // Obtener cantidad
                                cantidadFirebase = data.Cantidad || 'X';
                                textoEnvio = `VERIFICADO: ${sku} - Cantidad: ${cantidadFirebase}`;

                                // Buscar provincia en additional_info
                                let provincia = undefined;
                                let provincia2 = undefined;

                                if (
                                    data.client &&
                                    data.client.billing_info &&
                                    Array.isArray(data.client.billing_info.additional_info)
                                ) {
                                    const infoProvincia = data.client.billing_info.additional_info.find(
                                        info => info.type === "STATE_NAME"
                                    );
                                    provincia = infoProvincia?.value?.toLowerCase();
                                }

                                // Si no se encontró en additional_info, buscar en data.Provincia
                                if (data.Provincia) {
                                    provincia2 = data.Provincia.toLowerCase();
                                }

                                // Verificar provincia excluida
                                const provinciasExcluidas = ["jujuy", "tierra del fuego"];
                                esDeProvinciaExcluida = provinciasExcluidas.includes(provincia) || provinciasExcluidas.includes(provincia2);
                            }
                        }
                    } catch (firebaseError) {
                        console.error(`Error al consultar Firebase para venta ${ventaCompleta}:`, firebaseError);
                    }
                }

                // Devolvemos objeto con etiqueta, SKU y datos para ordenamiento
                return {
                    sku,
                    descripcion,
                    etiquetaOriginal: etiqueta,
                    esDeProvinciaExcluida,
                    ventaCompleta,
                    cantidad: cantidadFirebase !== 'X' ? cantidadFirebase : cantidad,
                    textoEnvio,
                    esFormatoNuevo,
                };
            }));

            // 3. Ordenar etiquetas alfabéticamente por SKU
            etiquetasConSku.sort((a, b) => {
                // Ordenamos alfabéticamente ignorando mayúsculas/minúsculas
                return a.sku.localeCompare(b.sku);
            });

            // 4. Procesar las etiquetas ordenadas
            let contadorExcluidas = 0;
            const etiquetasOrdenadasModificadas = etiquetasConSku.map((item, index) => {
                // Actualizar progreso
                loadingSwal.update({
                    html: `Procesando etiqueta ${index + 1} de ${etiquetasConSku.length}<br>
                        Ordenadas por SKU | Envíos excluidos: ${contadorExcluidas}`
                });

                if (item.esDeProvinciaExcluida) {
                    contadorExcluidas++;
                }

                const bloqueGFA = item.esFormatoNuevo
                ? `^FO50,250^GFA,4838,4838,82,,:::kI0401J04L02K04,jW03F9FC3F0FC7F3F070FE1F80FE3F1FC,jW03FDFE7F8FE7F3F870FF3FC0FE7F9FE,jW039DC661DC660318F8E330E0C761DC66,jW039DCE60D807E3C0D8E33060C660DCE6,jW03F9FCE0D807F1F0DCE3F060FEE0DFC2,jW03F1F8E0D8060079FCE3F060FCE0DF8,jW0381DC61DC660719FCE330E0C061DDC,gS03FI0FI03F803FC003FC00FF003FC00FFK0FF8I01FE001IFP0381CE7B9EE603BB8EEF3DC0C07B9CE2,gS07FC01F8007FC03FC00IF81FF807FE07FFCI03IFI03FE001JF8N0381C73F8FC7FBFB06FE1FC0C03F9C76,gS0FFE01FC007FE03FC03IFC0FF807FC0JFI0JF8003FF001JFEI0FJ0100830E0387F0E306780700C00E0832,gR01IF03FC007FF03FC07JF0FF807FC3JF801JFE007FF001KFI0F,gR01IF03FC007FF03FC0KF87FC0FF87JFC03JFC007FF801KF800F,gR03IF81FE007FF83FC1KF87FC0FF87JFE07JF8007FF801KF800F,gR03IF81FE007FFC3FC3KFC7FC0FF8LF07JF800IFC01KFC00FW03E,gR03IFC1FE007FFE3FC3FF8FFE3FE1FF1FFC7FF0FFE1FI0IFC01FF1FFC00FW07F8,gR03IFC1FE007IF3FC3FE07FE3FE1FF1FF01FF0FF806001IFC01FE07FC00FI0FS0FF800IFC,gR03IFE1FE007IF3FC7FC03FE1FE1FE1FF00FF9FFK01IFE01FE03FC00F007F8R0FF803JF,gR07FBFE1FE007KFC7FC01FF1FF3FE3FE00FF9FFK03IFE01FE03FC00F00FF8R07F803JF8,gR07F9FE1FE007KFC7F801FF1FF3FE3FE007F9FE0IF03FDFF01FE07FC00F00FF8R03E003JFC,gR07F9FF1FE007KFC7F801FF0FF3FC3FE007F9FE0IF03FCFF01KF800F00FF8I0FE001EM03JFC00FCI07FC,gR07F8FF1FE007KFC7F801FF0JFC3FE007F9FE0IF07FCFF01KF800F00FF8007FFC07FBFC3F003FE7FE0IF803IF8,gR07F8FF9FE007KFC7F801FF07IF83FE007F9FE0IF07F8FF81KFI0F00FF801IFE0FFBFC7F803FE3FE1IFC0JF8,gR07F8FF9FE007FDIFC7FC01FF07IF83FE00FF9FF0IF0FF87F81JFEI0F00FF803JF0JFCFF803FE3FE3IFE0JF8,gR07F87F9FE007FCIFC7FC03FE07IF81FF00FF9FF00FF0KFC1JFCI0F00FF803JF1JFCFF803FE3FE3JF1JF8,gR07F87FDFE007FCIFC3FE07FE03IF01FF81FF0FF80FF0KFC1JFCI0F00FF807FCFF9FF7FCFF803FE3FE1JF1FE7F8,gR07F83IFC007FC7FFC3KFC03IF01LF0FFE0FF1KFE1FE7FCI0F00FF807FCFF9FE7FCFF803FE3FE0C1FF3FE7F8,gR07F83IFC007FC3FFC1KFC01FFE00KFE07KF1KFE1FE3FEI0F00FF807FCFF9FE7FCFF803FE7FC001FF3FC7F8,gR07F83IFC007FC1FFC1KF801FFE007JFE07KF3KFE1FE3FFI0F00FF807FCFF9FE7FCFF803JFC07IF3FC7F8,gR07F81IF8007FC0FFC0KF001FFE003JFC03KF3LF1FE1FFI0F00FF807FCFF9FE7FCFF803JFC1JF3FC7F8,gR03F80IF8007FC07FC07IFEI0FFC001JF801JFE7FC01FF1FE0FF800F00FF807FCFF9FE7FCFF803JF83JF3FC7F8,gR03FC07FFI07FC07FC03IFCI0FFCI0IFEI07IFC7FC00FF9FE0FFC00F00FF807FCFF9FF7FCFF803JF07FCFF3FC7F8,gR03FC03FEI07FC03FC00IFJ07F8I03FFCI03IF07F800FF9FE07FC00F00JF7FCFF9FF7FCFF803IFE07FCFF3FE7F8,gR03FC00FS01F8Q07CK03FX0F00JF7FCFF8JFCFF803FEI07FCFF3FE7F8,gR03FChW0F00JF3JF0JFCFF803FEI07FDFF3JF8,gR01FC2I038hQ0F00JF3JF07FBFCFF803FEI07JF3JF8,gR01FC3I07ChQ0F00JF1IFEI03FCFF803FEI03JF1JF8,gS0FC3800F8hQ0F00IFE0IF8I03FCFF803FEI03FEFF0JF8,gS0F81F07F8hQ0F007FFE03FF003CFFC7F001FCJ0FCFF07E7F8,gV0JFhR0FR07IF8X07F8,gV07FFEhR0FR07IF8X07F8,gV03FFChR0FR07IFY07F8,gW0FFiL07FFEY07F8,kK01FFg038,,::::::::::^FS`
                : '';
                

        // Construir bloques según si es provincia excluida o no
        let bloquesSuperiores = "";

        if (item.esDeProvinciaExcluida) {
            bloquesSuperiores = `
        ^FX LAST CLUSTER  ^FS
        ^FO20,1^GB760,45,45^FS
        ^FO20,6^A0N,45,45^FB760,1,0,C^FR^FDNO ENVIAR - LOGIPAQ^FS
        ^FX END LAST CLUSTER  ^FS

        ^FO50,80^GFA,16400,16400,82,,::::::::gM03E,gK03JFE,gJ0NF8,gI07OF,gH03PFE,gG01RFC,gG07SF,g03TFC,g07UF,Y01VFC,Y07WF,X01XF8hJ07K03IF,X03XFEP01MFC01FFE003FFC01FFE007FFE01FFEI01KF,X07NF80OFP01MFC07IF00IFC0JF03JF07IFI07KFC,W01MFCJ01MFCO01MFC0JF03IFE3JF07JF0JF001LFE,W03LF8L01LFEO01MFC0JF03IFE3JF07JF0JF003MF8,W07KFEN03LFO01MFC0JF83IFE3JF07IFE0JF007MFC,W0LFI03FFEI07KF8N01MFC0JF83IFE3JF87IFE0JF00NFC,V03KF8001JFC001KFCN01MFC0JFC3IFE1JF87IFE0JF01NFE,V07JFEI0LF8007JFEN01MFC0JFC3IFE1JF87IFC0JF01NFE,V0KF8001LFC001KFN01MFC0JFC3IFE1JF87IFC0JF03JF3JF,U01KFI07MFI07JF8M01MFC0JFE3IFE0JF87IF80JF03IFC1JF,U03JFCI0NF8001JFCM01MFC0JFE3IFE0JF87IF80JF07IFC1JF8,U07JF8001NFCI0JFEM01JF3FF80JFE3IFE0JF87IF80JF07IFC0JF8,U07IFEI03NFEI07JFM01IFEK0KF3IFE07IF8JF00JF0JF80JF8,U0JFCI07OFI01JF8L01IFEK0KF3IFE07IF8JF00JF0JF80JF8,T01JF8I07OFJ0JFCL01IFEK0KF3IFE03IF8JF00JF0JF80JF8,T03JFJ0PF8I07IFEL01MF00KFBIFE03IFCIFE00JF0JF80JFC,T03IFEJ0PF8I03IFEL01MF00KFBIFE03IFCIFE00JF0JF80JFC,T07IFCI01PFCI01JFL01MF00OFE01IFCIFE00JF0JF80JFC,T0JF8I01PFCJ0JF8K01MF00OFE01IFCIFC00JF0JF80JFC,S01JFJ01PFCJ07IF8K01MF00OFE01IFCIFC00JF0JF80JFC,S01IFEJ03PFCJ03IFCK01MF00OFE00IFCIF800JF0JF80JFC,S03IFCJ03PFCJ01IFEK01MF00OFE00IFCIF800JF0JF80JFC,S03IF8J03PFCJ01IFEK01MF00OFE007FFCIF800JF0JF80JFC,S07IFK03PFCK0JFK01MF00OFE007FFDIFI0JF0JF80JFC,S07IFK03PFCK07IFK01MF00OFE007LFI0JF0JF80JFC,S0IFEK03PFCK03IF8J01LFE00OFE003LFI0JF0JF80JF8,R01IFCK03PFCK03IF8J01IFEK0OFE003KFEI0JF0JF80JF8,R01IFCK03PFCK01IFCJ01IFEK0JF7JFE003KFEI0JF0JF80JF8,R01IF8K01PFCL0IFCJ01IFEK0JF7JFE001KFEI0JF0JF80JF8,R03IFL01FE07FFE03FCL0IFEJ01IFE003C0JF3JFE001KFCI0JF07IFC0JF8,R03IFL01FC03FFE01FCL07FFEJ01MFC0JF3JFEI0KFCI0JF07IFC1JF,R07FFEL01F801FFC00FCL07FFEJ01MFE0JF3JFEI0KFCI0JF07IFC1JF,R07FFEL01F001FFC00FCL03IFJ01MFE0JF1JFEI0KF8I0JF07IFE3IFE,R07FFCL01F001FFC007CL03IFJ01MFE0JF1JFEI07JF8I0JF03NFE,R0IFCL01F001FFC0078L01IF8I01MFE0JF0JFEI07JF8I0JF03NFC,R0IFCM0F001FFC0078L01IF8I01MFE0JF0JFEI07JFJ0JF01NFC,R0IF8M0F803FFE00F8M0IF8I01MFE0JF0JFEI03JFJ0JF00NF8,Q01IF8M0FC0JF81F8M0IF8I01MFE0JF07IFEI03IFEJ0JF007MF,Q01IF8M0JFE7JF8M0IFCI01MFC0JF07IFEI03IFEJ0JF003LFC,Q01IFN07IFC1JFN07FFCI01MFC0JF03IFEI01IFEJ0JF001LF8,Q03IFN07IF81JFN07FFCI01MFC0JF03IFCI01IFCJ0JFI07JFE,Q03FFEN0JF80JF8M07FFCI01MFC0IF001FFCK0FFEK0IF8J0JF,Q03FFEN0JF80JF8M03FFE,Q03FFEN0JF007IF8M03FFE,Q03FFEN0JF007IFN03FFE,Q03FFEN07IF007IFN03FFE,Q07FFCN07IF087FFEN03FFE,Q07FFCN01IF9CIF8N01IF,Q07FFCO0NF8N01IF,Q07FFCO0F7JFE7O01IF,Q07FFCO073JFE7O01IF,:Q07FFCO073JFCFO01IF,Q07FF8O071JFCFO01IF,Q0IF8O07BJFCFO01IF,Q0IF8O079JFCFO01IF,Q0IF8O07C7BFE1FO01IF,Q0IF8O07C0B683FO01IF,Q0IF8O03F8I0FEO01IF,Q07FF8O03FF017FEO01IF,Q07FFCO01LFCO01IF,:Q07FFCL0F800LF800F8K01IF,Q07FFCK01FC007KF001FCK01IF,Q07FFCK03FE007JFE003FEK01IF,Q07FFCK03FF003JFE007FEK01IF,Q07FFCK03FF001JFC007FEK03FFE,Q03FFEK03FF001JF8007FEK03FFE,Q03FFEK03FF800JF800FFEK03FFE,Q03FFEK01FF8007IFI0FFCK03FFE,Q03FFEK03FFC003FFE001FFCK03FFE,Q03IFK0JFI03FI07IFK07FFCJ03KFEU07IFT0LF8K07W0JFJ01CV07FFE,Q03IFJ01JFEL03JF8J07FFCI01MFE003MF8003KF803NF07MF8001FFE007FF800IFJ07JFC007FF80MFL03JFE,Q01IFJ01KF8J01KFCJ07FFCI01NF803MF800MF07NF87MFE007IF01IFC03IFI01KFE01IFC0MFEK0LF8,Q01IF8I01LFJ07KFCJ0IFCI01NFC03MF803MF87NF87NF00JF03IFC0JF8007LF03IFC0NF8I03LFC,Q01IF8I03LFE003LFCJ0IF8I01NFE03MF803MF87NF87NF80JF03IFC0JF800MF03IFC0NFCI07MF,R0IF8I01MF81MFCJ0IF8I01NFE03MF807MF87NF87NF80JF03IFE0JF801MF03IFC0NFEI0NF8,R0IFCI01FFC3NFE1FFCI01IF8I01OF03MF80NF8OF87NFC0JF03IFE0JF803MF03IFC0OF001NF8,R0IFCJ0FF007MF007F8I01IF8I01OF03MF80NF0OF87NFC0JF03JF0JF807MF03IFC0OF003NFC,R07FFEJ07C001LFC003EJ03IFJ01OF83MF81NF0OF87NFE0JF03JF0JF80NF03IFC0OF803NFC,R07FFEO03JFEO03IFJ01IFE3JF83MF81NF0OF87IF8JFE0JF03JF0JF80NF03IFC0JF9JF807IFE7IFE,R07IFO03JFEO07FFEJ01IFE1JF83MF81NF0OF87IF87IFE0JF03JF8JF81NF03IFC0JF0JFC07IF83IFE,R03IFJ07E001LFC003FJ07FFEJ01IFE0JF83MF81MFE0OF07IF83IFE0JF03JF8JF81MFE03IFC0JF07IFC0JF83JF,R03IF8I0FF00NF80FF8I0IFEJ01IFE0JF83IFE7FF01JF81FE0OF07IF83IFE0JF03JF8JF83MFE03IFC0JF07IFC0JF81JF,R01IF8001FFC7JF7JF3FFC001IFCJ01IFE0JF83IFCJ01JF003C07NF07IF83IFE0JF03JFCJF83JF83FE03IFC0JF03IFC1JF01JF,R01IFC001MF80MFC001IFCJ01IFE0JF83IFCJ01JFK07NF07IF83IFE0JF03JFCJF83JF001C03IFC0JF03IFE1JF01JF,S0IFC003LFE003LFC003IF8J01IFE0JF83IFCJ01JF8J07MFE07IF83IFE0JF03JFCJF83IFEK03IFC0JF03IFE1JF01JF,S0IFE001LFJ07KFC007IF8J01IFE0JF83LFE01JFEL03IFEI07IF83IFE0JF03JFEJF87IFCK03IFC0JF03IFE1JF01JF8,S07IF001KF8K0KFC007IFK01IFE0JF83LFE00KFEK03IFEI07IF83IFE0JF03JFEJF87IFCK03IFC0JF03IFE1JF01JF8,S07IF800JFCL01JF800JFK01IFE1JF83LFE00LF8J03IFEI07IF87IFE0JF03OF87IFCK03IFC0JF03IFE1JF01JF8,S03IF8007FFEN07IF001IFEK01IFE3JF03LFE007KFEJ03IFEI07IF8JFC0JF03OF87IFCK03IFC0JF03IFE1JF01JF8,S03IFC001FFCN01FFC001IFCK01OF03LFE007LF8I03IFEI07NFC0JF03OF87IFCK03IFC0JF03IFE1JF01JF8,S01IFE001FF8O0FFC003IFCK01OF03LFE003LFCI03IFEI07NFC0JF03OF87IFC007C03IFC0JF03IFE1JF01JF8,T0JF003FF8O0FFE007IF8K01NFE03LFEI0LFEI03IFEI07NF80JF03OF87IFC07FF83IFC0JF03IFE1JF01JF8,T0JF803FFP07FE00JFL01NFC03LFEI07LFI03IFEI07NF00JF03OF87IFC1IF83IFC0JF03IFE1JF01JF8,T07IFC03FFP07FE01JFL01NFC03LFEI01LFI03IFEI07NF00JF03OF87IFC3IFC3IFC0JF03IFE1JF01JF8,T03IFE03FFP07FE03IFEL01NF003LFEJ07KF8003IFEI07MFC00JF03OF87IFC3IFC3IFC0JF03IFE1JF01JF8,T03JF03FEP03FC07IFCL01NF003LFCK0KF8003IFEI07MFC00JF03OF87IFC3IFC3IFC0JF03IFE1JF01JF,T01JF81FCP01FC0JFCL01NF003IFCN01JF8003IFEI07MFC00JF03OF87IFE3IFC3IFC0JF03IFE1JF01JF,U0JFC0FR0F03JF8L01NF803IFCK0CI0JFC003IFEI07MFE00JF03IFDKF87IFE3IFC3IFC0JF03IFC1JF01JF,U07JFV07JFM01IFEJF803IFCJ01F8007IFC003IFEI07IFBIFE00JF03IFDKF87JF3IFC3IFC0JF03IFC1JF01JF,U03JF8U0JFEM01IFE7IFC03IFC00781FF00JFC003IFEI07IF9JF00JF03IFCKF87JFBIFC3IFC0JF07IFC0JF81JF,U01JFET03JFCM01IFE7IFE03MF81IF3JFC003IFEI07IF9JF80JF03IFCKF83NFC3IFC0JF07IFC0JF83IFE,V0KFT0KF8M01IFE7IFE03MFC3NFC003IFEI07IF9JF80JF03IFCKF83NFC3IFC0JF07IFC0JF83IFE,V07JFCR01KFN01IFE3JF03MFC3NF8003IFEI07IF8JFC0JF03IFC7JF83NFC3IFC0JF0JF80JFC7IFC,V03KFR07JFEN01IFE3JF03MFC3NF8003IFEI07IF8JFC0JF03IFC7JF83NFC3IFC0OF807NFC,V01KFCP01KFCN01IFE3JF83MFC3NF8003IFEI07IF8JFE0JF03IFC3JF81NFC3IFC0OF007NF8,W0LFP07KF8N01IFE1JF83MFC3NFI03IFEI07IF87IFE0JF03IFC3JF81NFC3IFC0OF003NF8,W07KFEN03LFO01IFE1JFC3MFC3NFI03IFEI07IF87JF0JF03IFC3JF80NFC3IFC0NFE001NF,W03LFCL01LFEO01IFE1JFC3MFC3MFEI03IFEI07IF87JF0JF03IFC1JF80JFBIFC3IFC0NFCI0MFE,W01MFEJ03MF8O01IFE0JFC3MF83MFCI03IFEI07IF83JF0JF03IFC1JF807IF9IFC3IFC0NF8I07LF8,X07YFP01IFE0JFC3MF81MF8I03IFEI07IF83JF0JF03IFC0JF803IF1IFC3IFC0MFEJ03LF,X03XFCP01IFE0JF83MF807KFEJ03IFEI07IF83IFE0JF03IFC0JF001IF1IF83IFC0MF8K0KFC,Y0XF8P01FFE007FFC03MF8007JFK01FFEJ07FF801IF00IF803FFC007FFJ07FC0FF803FFE00LF8L01IFE,Y07VFE,Y01VFC,g07UF,g01TFC,gG07SF,gH0RF8,gH03PFE,gI07NFE,gJ03LFE,gK03JFC,kI0401J04L02K04,jW03F9FC3F0FC7F3F070FE1F80FE3F1FC,jW03FDFE7F8FE7F3F870FF3FC0FE7F9FE,jW039DC661DC660318F8E330E0C761DC66,jW039DCE60D807E3C0D8E33060C660DCE6,jW03F9FCE0D807F1F0DCE3F060FEE0DFC2,jW03F1F8E0D8060079FCE3F060FCE0DF8,jW0381DC61DC660719FCE330E0C061DDC,gS03FI0FI03F803FC003FC00FF003FC00FFK0FF8I01FE001IFP0381CE7B9EE603BB8EEF3DC0C07B9CE2,gS07FC01F8007FC03FC00IF81FF807FE07FFCI03IFI03FE001JF8N0381C73F8FC7FBFB06FE1FC0C03F9C76,gS0FFE01FC007FE03FC03IFC0FF807FC0JFI0JF8003FF001JFEI0FJ0100830E0387F0E306780700C00E0832,gR01IF03FC007FF03FC07JF0FF807FC3JF801JFE007FF001KFI0F,gR01IF03FC007FF03FC0KF87FC0FF87JFC03JFC007FF801KF800F,gR03IF81FE007FF83FC1KF87FC0FF87JFE07JF8007FF801KF800F,gR03IF81FE007FFC3FC3KFC7FC0FF8LF07JF800IFC01KFC00FW03E,gR03IFC1FE007FFE3FC3FF8FFE3FE1FF1FFC7FF0FFE1FI0IFC01FF1FFC00FW07F8,gR03IFC1FE007IF3FC3FE07FE3FE1FF1FF01FF0FF806001IFC01FE07FC00FI0FS0FF800IFC,gR03IFE1FE007IF3FC7FC03FE1FE1FE1FF00FF9FFK01IFE01FE03FC00F007F8R0FF803JF,gR07FBFE1FE007KFC7FC01FF1FF3FE3FE00FF9FFK03IFE01FE03FC00F00FF8R07F803JF8,gR07F9FE1FE007KFC7F801FF1FF3FE3FE007F9FE0IF03FDFF01FE07FC00F00FF8R03E003JFC,gR07F9FF1FE007KFC7F801FF0FF3FC3FE007F9FE0IF03FCFF01KF800F00FF8I0FE001EM03JFC00FCI07FC,gR07F8FF1FE007KFC7F801FF0JFC3FE007F9FE0IF07FCFF01KF800F00FF8007FFC07FBFC3F003FE7FE0IF803IF8,gR07F8FF9FE007KFC7F801FF07IF83FE007F9FE0IF07F8FF81KFI0F00FF801IFE0FFBFC7F803FE3FE1IFC0JF8,gR07F8FF9FE007FDIFC7FC01FF07IF83FE00FF9FF0IF0FF87F81JFEI0F00FF803JF0JFCFF803FE3FE3IFE0JF8,gR07F87F9FE007FCIFC7FC03FE07IF81FF00FF9FF00FF0KFC1JFCI0F00FF803JF1JFCFF803FE3FE3JF1JF8,gR07F87FDFE007FCIFC3FE07FE03IF01FF81FF0FF80FF0KFC1JFCI0F00FF807FCFF9FF7FCFF803FE3FE1JF1FE7F8,gR07F83IFC007FC7FFC3KFC03IF01LF0FFE0FF1KFE1FE7FCI0F00FF807FCFF9FE7FCFF803FE3FE0C1FF3FE7F8,gR07F83IFC007FC3FFC1KFC01FFE00KFE07KF1KFE1FE3FEI0F00FF807FCFF9FE7FCFF803FE7FC001FF3FC7F8,gR07F83IFC007FC1FFC1KF801FFE007JFE07KF3KFE1FE3FFI0F00FF807FCFF9FE7FCFF803JFC07IF3FC7F8,gR07F81IF8007FC0FFC0KF001FFE003JFC03KF3LF1FE1FFI0F00FF807FCFF9FE7FCFF803JFC1JF3FC7F8,gR03F80IF8007FC07FC07IFEI0FFC001JF801JFE7FC01FF1FE0FF800F00FF807FCFF9FE7FCFF803JF83JF3FC7F8,gR03FC07FFI07FC07FC03IFCI0FFCI0IFEI07IFC7FC00FF9FE0FFC00F00FF807FCFF9FF7FCFF803JF07FCFF3FC7F8,gR03FC03FEI07FC03FC00IFJ07F8I03FFCI03IF07F800FF9FE07FC00F00JF7FCFF9FF7FCFF803IFE07FCFF3FE7F8,gR03FC00FS01F8Q07CK03FX0F00JF7FCFF8JFCFF803FEI07FCFF3FE7F8,gR03FChW0F00JF3JF0JFCFF803FEI07FDFF3JF8,gR01FC2I038hQ0F00JF3JF07FBFCFF803FEI07JF3JF8,gR01FC3I07ChQ0F00JF1IFEI03FCFF803FEI03JF1JF8,gS0FC3800F8hQ0F00IFE0IF8I03FCFF803FEI03FEFF0JF8,gS0F81F07F8hQ0F007FFE03FF003CFFC7F001FCJ0FCFF07E7F8,gV0JFhR0FR07IF8X07F8,gV07FFEhR0FR07IF8X07F8,gV03FFChR0FR07IFY07F8,gW0FFiL07FFEY07F8,kK01FFg038,,::::::::::^FS
        `;
        } else {
            const bloques = item.etiquetaOriginal.split(/\^FS\s*/);
            const skusConCantidad = [];

            for (let i = 0; i < bloques.length; i++) {
                const matchSKU = bloques[i].match(/SKU:\s*([A-Z0-9\-_]+)/i);
                if (matchSKU) {
                    const sku = matchSKU[1].trim();
                    let cantidad = 1;

                    // Buscar hacia atrás un bloque con ^FD<number>^FS seguido por ^FDUnidades^FS
                    for (let j = i - 1; j >= 0; j--) {
                        const matchCantidad = bloques[j].match(/\^FD(\d+)\^FS/);
                        const matchUnidades = bloques[j + 1]?.includes('Unidades') || bloques[j + 1]?.includes('Unidad');

                        if (matchCantidad && matchUnidades) {
                            cantidad = parseInt(matchCantidad[1]);
                            break;
                        }
                    }

                    skusConCantidad.push({ sku, cantidad });
                }
            }

            // Eliminar duplicados de SKU (puede haber más de una aparición del mismo SKU)
            const conteoFinal = {};
            skusConCantidad.forEach(({ sku, cantidad }) => {
                conteoFinal[sku] = (conteoFinal[sku] || 0) + cantidad;
            });

            const skuKeys = Object.keys(conteoFinal);

            if (skuKeys.length >= 2) {
                const sku1 = skuKeys[0];
                const cantidad1 = conteoFinal[sku1];
                const sku2 = skuKeys[1];
                const cantidad2 = conteoFinal[sku2];

                 // Carrito de Compras
                bloquesSuperiores = `
        ^FX LAST CLUSTER ^FS
        ^FO20,1^GB760,45,1^FS
        ^FO20,6^A0N,45,45^FB760,1,0,C^FDVENTA: ${item.ventaCompleta}^FS
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,62^GB760,45,1,B,1^FS           
        ^FO20,62^GB760,45,45,B,1^FS         
        ^FO20,67^A0N,45,45^FB760,1,0,C^FR^FH^FD^CI28^CFA,45,45^FS
        ^FO20,67^A0N,45,45^FB760,1,0,C^FR^FD!!--CARRITO DE COMPRAS--!!^FS  
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,120^GB760,45,1^FS
        ^FO20,126^A0N,45,45^FB760,1,0,C^FD${cantidad1} / SKU: ${sku1}^FS
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,175^A0N,30,30^FB760,3,10,C^FD${item.descripcion}^FS
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,210^GB760,45,1^FS
        ^FO20,210^A0N,45,45^FB760,1,0,C^FD${cantidad2} / SKU: ${sku2}^FS
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,260^A0N,30,30^FB760,3,10,C^FD${item.descripcion}^FS
        ^FX END LAST CLUSTER ^FS
        `;
            } else {
                // Venta común
                const sku = skuKeys[0] || item.sku;
                const cantidad = item.cantidad;

                bloquesSuperiores = `
        ^FX LAST CLUSTER ^FS
        ^FO20,1^GB760,45,1^FS
        ^FO20,6^A0N,45,45^FB760,1,0,C^FDVENTA: ${item.ventaCompleta}^FS
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ${cantidad > 1 ?
        `^FO20,60^GB760,50,50^FS
        ^FO20,66^A0N,45,45^FB760,1,0,C^FR^FDU: ${cantidad} / SKU: ${sku}^FS` :
        `^FO20,60^GB760,45,1^FS
        ^FO20,66^A0N,45,45^FB760,1,0,C^FDU: ${cantidad} / SKU: ${sku}^FS`
        }
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,120^GB760,45,1^FS
        ^FO20,126^A0N,45,45^FB760,1,0,C^FD${item.descripcion}^FS
        ^FX END LAST CLUSTER ^FS

        ^FX LAST CLUSTER ^FS
        ^FO20,190^A0N,30,30^FB760,3,10,C^FD${item.textoEnvio}^FS
        ^FX END LAST CLUSTER ^FS

        ${bloqueGFA}
        `;
            }
        }

// LIMPIEZA ETIQUETA ORIGINAL (ya incluido como lo tenés):
let etiquetaLimpia = item.etiquetaOriginal;

// --- LIMPIEZA PARA AMBOS FORMATOS DE FORMATO ---
[
// --- ANTIGUO FORMATO DE ETIQUETAS ---
    /\^FO30,80\^A0N,70,70\^FB160,1,0,C\^FD\d+\^FS/,
    /\^FO30,150\^A0N,25,25\^FB150,1,0,C\^FDCantidad\^FS/,
    /\^FO200,15\^A0N,29,29\^FB570,2,-1\^FH\^FD[^\^]+\^FS/,
    /\^FO200,95\^A0N,24,24\^FB570,1,-1\^FH\^FDColor:[^\^]+\^FS/,
    /\^FO201,95\^A0N,24,24\^FB570,1,-1\^FH\^FDColor:\^FS/,
    /\^FO200,181\^A0N,24,24\^FB570,3,-1\^FH\^FDColor:[^\|]+\| SKU:[^\^]+\^FS/,
    /\^FO200,190\^A0N,30,30\^FH\^FDSKU:\^FS/,
    /\^FO265,192\^A0N,25,25\^FB510,1,-1\^FH\^FD[^\^]+\^FS/,
    // --- NUEVO FORMATO DE ETIQUETAS ---
    /\^FO10,130\^A0N,70,70\^FB160,1,0,C\^FD\d+\^FS/,
    /\^FO10,210\^A0N,25,25\^FB150,1,0,C\^FDUnidad\^FS/,
    /\^FO10,210\^A0N,25,25\^FB150,1,0,C\^FDUnidades\^FS/,
    /\^FO200,100\^A0N,27,27\^FB570,3,-1\^FH\^FD[^\^]+\^FS/,
    /\^FO200,181\^A0N,24,24\^FB570,3,-1\^FH\^FDSKU:[^\^]*\^FS/,
    /\^FO150,202\^GB30,30,3\^FS/,
    /\^FO200,202\^A0N,27,27\^FB570,3,-1\^FH\^FD[^\^]+\^FS/,
    /\^FO200,283\^A0N,24,24\^FB570,2,-1\^FH\^FDSKU:[^\^]+\^FS/,
    /\^FO30,40\^A0N,28,28\^FH\^FDVenta ID:\^FS/,
    /\^FO31,40\^A0N,28,28\^FH\^FDVenta ID:\^FS/,
    /\^FO30,40\^A0N,28,28\^FH\^FDPack ID:\^FS/,
    /\^FO31,40\^A0N,28,28\^FH\^FDPack ID:\^FS/,
    /\^FO200,181\^A0N,24,24\^FB570,2,-1\^FH\^FDSKU:[^\^]*\^FS/,
    /\^FO134,39\^A0N,25,25\^FD\d+\^FS/,
    /\^FO198,40\^A0N,30,30\^FD\d+\^FS/,
    /\^FO199,40\^A0N,30,30\^FD\d+\^FS/,
    /\^FO450,30\^A0N,20,20\^FB330,2,0,L\^FH\^FDRecortá esta parte de la etiqueta para que tu paquete viaje seguro.\^FS/,
    /\^FO0,90\^GB810,2,1\^FS/,
    /\^FO150,100\^GB30,30,3\^FS/,
    /\^FX LAST CLUSTER.*?\^FX END LAST CLUSTER\s*\^FS/gs

].forEach(regex => {
    etiquetaLimpia = etiquetaLimpia.replace(regex, '');
});

                // Insertar nuevos bloques
                const posInsert = etiquetaLimpia.indexOf('^LH0,90');
                if (posInsert !== -1) {
                    const endOfLine = etiquetaLimpia.indexOf('\n', posInsert);
                    const insertionPoint = endOfLine !== -1 ? endOfLine : posInsert + '^LH0,90'.length;

                    return etiquetaLimpia.slice(0, insertionPoint) +
                        '\n' + bloquesSuperiores +
                        etiquetaLimpia.slice(insertionPoint);
                }

                return etiquetaLimpia;
            });

            // Cerrar loader
            loadingSwal.close();

            // 5. Reconstruir el archivo con etiquetas ordenadas
            let nuevoContenido = etiquetasOrdenadasModificadas.join('^XZ').trim() + '^XZ';

            // 6. Mostrar resumen antes de descargar
            await Swal.fire({
                title: 'Proceso completado',
                html: `Total etiquetas procesadas: ${etiquetasConSku.length}<br>
                    Ordenadas alfabéticamente por SKU<br>
                    Envíos a provincias excluidas: ${contadorExcluidas}`,
                icon: 'success',
                confirmButtonText: 'Descargar Archivo'
            });

            // 7. Crear y descargar archivo modificado y ordenado
            const blob = new Blob([nuevoContenido], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${selectedFolderDate}_TandaNovogar_Validada_${fileRef.name}`;
            document.body.appendChild(a);
            a.click();

            // Limpieza
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            }, 100);

        } catch (error) {
            loadingSwal.close();
            console.error('Error al generar tanda Novogar ordenada:', error);
            Swal.fire('Error', `No se pudo generar la tanda Novogar ordenada: ${error.message}`, 'error');
        }
    });
}
                                        
                                    }
                                    
                                });
                                if (opcionElegida === true) {
                                    try {
                                        const response = await fetch("https://proxy.cors.sh/" + url, {
                                            headers: corsHeaders  
                                        });
                                        
                                        if (!response.ok) throw new Error('Falló la descarga');
                                        
                                        const blob = await response.blob();
                                        const blobUrl = URL.createObjectURL(blob);
                                        
                                        const a = document.createElement('a');
                                        a.href = blobUrl;
                                        a.download = selectedFolderDate + "_" + fileRef.name;
                                        document.body.appendChild(a);
                                        a.click();
                                        
                                        // Limpieza
                                        setTimeout(() => {
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(blobUrl);
                                        }, 100);
                                        
                                    } catch (error) {
                                        console.error('Error:', error);
                                        Swal.fire('Error', 'No se pudo descargar el TXT', 'error');
                                    }
                                } else if (opcionElegida === false) {
                                    // Opción: Imprimir e ingresar
                                    Swal.fire({
                                        title: 'Agregando datos a planilla...',
                                        html: 'Espere por favor',
                                        allowOutsideClick: false,
                                        showConfirmButton: false,
                                        willOpen: () => {
                                            Swal.showLoading();
                                        }
                                    });

                                    const hijos = Object.keys(snapshot.val());
                                    const datosAgregados = [];
                                    const datosNoEncontrados = [];
                                    const datosFiltradosConProvincia = [];
                                    const datosFiltrados = [];
                                    const datosNoValidados = []; // Nuevo array para datos no validados
                                    const etiquetasDuplicadas = []; // Array para etiquetas duplicadas

                                    for (const ventaid of hijos) {
                                        const envioSnap = await firebase.database().ref('/envios/' + ventaid).once('value');
                                        if (!envioSnap.exists()) {
                                            datosNoEncontrados.push(ventaid);
                                            console.log('No encontrado:', ventaid); // Log de IDs no encontrados
                                            continue;
                                        }

                                        const data = envioSnap.val();
                                        let esDeProvinciaExcluida = false;
                                        let provincia = undefined;

                                        // Buscar provincia en additional_info
                                        if (
                                            data.client &&
                                            data.client.billing_info &&
                                            Array.isArray(data.client.billing_info.additional_info)
                                        ) {
                                            const infoProvincia = data.client.billing_info.additional_info.find(
                                                info => info.type === "STATE_NAME"
                                            );
                                            provincia = infoProvincia?.value?.toLowerCase();
                                        }

                                        // Si no se encontró en additional_info, buscar en data.Provincia
                                        if (!provincia && data.Provincia) {
                                            provincia = data.Provincia.toLowerCase();
                                        }

                                        // Validar provincia excluida
                                        esDeProvinciaExcluida = ["jujuy", "tierra del fuego"].includes(provincia);

                                        if (provincia) {
                                            if (esDeProvinciaExcluida) {
                                                datosFiltrados.push(ventaid);
                                                datosFiltradosConProvincia.push({
                                                    ventaid,
                                                    provincia // Agregar la provincia al objeto
                                                });
                                                continue;
                                            } else {
                                                // Si no es de provincia excluida, agregar a planilla
                                                const preparedDate = new Date().toLocaleString('es-AR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                }).replace(',', 'h').replace('h', ', ');

                                                // Verificar si ya existe "preparadoEnColecta"
                                                if (data.preparadoEnColecta) {
                                                    etiquetasDuplicadas.push(`${ventaid} - Fue preparado en la colecta ${data.preparadoEnColecta} / Existe en planilla`);
                                                } else {
                                                    // Pushear la fecha en el nodo
                                                    await firebase.database().ref('/envios/' + ventaid).update({
                                                        preparadoEnColecta: preparedDate
                                                    });

                                                    // Verificar si el ID ya existe en la tabla antes de agregar
                                                    if (!idYaExiste(ventaid)) {
                                                        agregarFila(data);
                                                        datosAgregados.push(ventaid);
                                                    } else {
                                                        etiquetasDuplicadas.push(`${ventaid} - Existe en planilla`);
                                                    }
                                                }
                                            }
                                        } else {
                                            // Si no se pudo validar la provincia
                                            datosNoValidados.push(ventaid);
                                        }
                                    }


                                    // Generar reporte
                                    let htmlContent = '';
                                    if (datosFiltrados.length > 0 || datosNoEncontrados.length > 0 || datosNoValidados.length > 0 || etiquetasDuplicadas.length > 0) {
                                        htmlContent = `
                                            <div style="max-height: 200px; overflow-y: auto; text-align: left;">
                                                ${datosFiltrados.length > 0 ? `<p style="color: red;"><strong>🚫 Excluidos (Jujuy/Tierra del Fuego): ${datosFiltrados.length}</strong><br>${datosFiltrados.join('<br>')}</p>` : ''}
                                                ${datosNoEncontrados.length > 0 ? `<p style="color: orange;"><strong>❌ No encontrados en Base (Posibles Carritos): ${datosNoEncontrados.length}</strong><br>${datosNoEncontrados.join('<br>')}</p>` : ''}
                                                ${datosNoValidados.length > 0 ? `<p style="color: yellow;"><strong>⚠️ No se pudo validar provincia: ${datosNoValidados.length}</strong><br>${datosNoValidados.join('<br>')}</p>` : ''}
                                                ${etiquetasDuplicadas.length > 0 ? `<p style="color: #800020;"><strong>🧨 Duplicados: ${etiquetasDuplicadas.length}</strong><br>${etiquetasDuplicadas.map(item => `• ${item}`).join('<br>')}</p>` : ''}
                                            </div>
                                        `;
                                    }

                                    Swal.fire({
                                        icon: 'success',
                                        title: datosAgregados.length > 0 ? 'Proceso completado' : 'Advertencia',
                                        html: datosAgregados.length > 0
                                            ? `${htmlContent}<p>✅ Se agregaron ${datosAgregados.length} registros a la planilla.</p>`
                                            : `${htmlContent}<p>⚠️ No se agregaron registros válidos.</p>`,
                                        showCancelButton: true,
                                        confirmButtonText: 'Imprimir tanda',
                                        cancelButtonText: 'Salir'
                                    }).then(result => {
                                        if (result.isConfirmed) {
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = fileRef.name;
                                            a.target = '_blank';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }

                                        // Enviar el reporte al webhook
                                        enviarReporteWebhook(datosAgregados, datosNoEncontrados, datosFiltrados.concat(datosNoValidados), etiquetasDuplicadas, selectedFolderDate, fileNameSinExtension);
                                        enviarReporteWebhookFacturacion(datosFiltradosConProvincia.concat(datosNoValidados));

                                    });

                                }
                            } catch (error) {
                                console.error('Error:', error);
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error inesperado',
                                    text: 'Ocurrió un problema al procesar las etiquetas.',
                                    confirmButtonText: 'Cerrar'
                                });
                            }
                        });

                        async function generarTablaQuery(ventas, selectedFolderDate, fileNameSinExtension) {
                            const agrupado = {};
                            const ventaIds = Object.keys(ventas);

                            const promesasEnvios = ventaIds.map(id =>
                                firebase.database().ref('/envios/' + id).once('value')
                            );

                            const resultados = await Promise.all(promesasEnvios);

                            resultados.forEach(snap => {
                                if (!snap.exists()) return;
                                const data = snap.val();
                                const sku = data.SKU || data.sku || 'SIN_SKU';
                                const cantidad = Number(data.Cantidad || data.cantidad || 1);
                                const producto = data.Producto || data.producto || 'Sin descripción';

                                if (!agrupado[sku]) {
                                    agrupado[sku] = {
                                        sku: sku,
                                        cantidad: 0,
                                        producto: producto
                                    };
                                }
                                agrupado[sku].cantidad += cantidad;
                            });

                            const arrayAgrupado = Object.values(agrupado);

                            // Ordenar por cantidad en orden descendente
                            arrayAgrupado.sort((a, b) => b.cantidad - a.cantidad);

                            let tablaHtml = `
                                <h3 style="text-align:center; margin-bottom: 10px;">${selectedFolderDate} - ${fileNameSinExtension}</h3>
                                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
                                    <thead>
                                        <tr style="background-color: #4CAF50; color: white;">
                                            <th style="border: 1px solid #ddd; padding: 8px;">SKU</th>
                                            <th style="border: 1px solid #ddd; padding: 8px;">⚠️</th>
                                            <th style="border: 1px solid #ddd; padding: 8px;">Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                            `;

                            for (const item of arrayAgrupado) {
                                tablaHtml += `
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.sku}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.cantidad}</td>
                                        <td style="border: 1px solid #ddd; padding: 8px;">${item.producto}</td>
                                    </tr>
                                `;
                            }

                            tablaHtml += '</tbody></table>';

                            // Mostrar tabla en modal SweetAlert
                            await Swal.fire({
                                title: 'Resumen de Query',
                                html: `<div>${tablaHtml}</div>`,
                                width: '600px',
                                showCloseButton: true,
                                confirmButtonText: 'Cerrar',
                                footer: `
                                    <button onclick="imprimirTabla()" style="padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">
                                        Imprimir Tabla 🖨️
                                    </button>
                                `
                            });
                        }

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
                    });
                }).catch(error => {
                    console.error('Error al obtener los metadatos del archivo:', error);
                    showSpinner(false);
                });
            }).catch(error => {
                console.error('Error al listar archivos en la carpeta:', error);
                showSpinner(false);
            });
        });

        document.getElementById('backButton').style.display = folderStack.length > 0 ? 'block' : 'none';
        document.getElementById('printQueryButton').style.display = folderStack.length > 0 ? 'block' : 'none';
    }).catch(error => {
        console.error('Error al listar archivos en la carpeta:', error);
        showSpinner(false);
        Swal.fire('Error', 'Error al listar archivos en la carpeta.', 'error');
    });
}

// Función para modificar el ZPL (agregar fuera del evento click)
function modificarZPLParaLogiPaq(zplOriginal) {
    // Dividir por etiquetas individuales (separadas por ^XZ)
    const etiquetas = zplOriginal.split('^XZ').filter(e => e.trim() !== '');
    
    // Modificar cada etiqueta
    const etiquetasModificadas = etiquetas.map(etiqueta => {
        // Insertar después de ^XA^MCY^CI28^LH0,90
        return etiqueta.replace(
            /(\^XA.*?\^MCY\s*\^CI28\s*\^LH0,90)/,
            `$1\n^FX LAST CLUSTER ^FS\n^FO20,150^GB760,45,45^FS\n^FO20,156^A0N,45,45^FB760,1,0,C^FR^FDNO ENVIAR, SEPARAR - LOGIPAQ^FS\n^FX END LAST CLUSTER ^FS`
        );
    });
    
    // Reconstruir el ZPL con las modificaciones
    return etiquetasModificadas.join('^XZ\n') + '^XZ';
}

function idYaExiste(ventaid) {
    // Seleccionar la tabla y todas las filas
    const tabla = document.querySelector('.table-responsive table');
    const filas = tabla.querySelectorAll('tbody tr'); // Suponiendo que las filas están en el <tbody>

    // Recorrer cada fila de la tabla
    for (const fila of filas) {
        const celdaId = fila.cells[2]; // Suponiendo que el ID está en la tercera columna (índice 2)
        if (celdaId && celdaId.textContent.trim() === ventaid) {
            return true; // El ID ya existe en la tabla
        }
    }
    return false; // El ID no se encontró en la tabla
}

// Función para imprimir la tabla
function imprimirTabla() {
    const printContent = document.querySelector('.swal2-html-container').innerHTML;
    const win = window.open('', '', 'height=600,width=800');
    win.document.write(`
        <html>
            <head>
                <title>Imprimir Tabla</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #4CAF50; color: white; }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    win.document.close();
    win.print();
}

// BOTON IMPRIMIR EN TANDA GENERAL (VERSIÓN COMPLETA CON REINTENTOS)
document.getElementById('printQueryButton').addEventListener('click', async () => {
    try {
        // 1. Configuración inicial
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
            'Content-Type': 'application/json'
        };
        const corsProxyUrl = 'https://proxy.cors.sh/';
        const firebaseUrl = 'https://despachos-meli-novogar-default-rtdb.firebaseio.com';
        const fullUrl = `${corsProxyUrl}${firebaseUrl}/ImpresionEtiquetas/${selectedFolderDate}.json`;

        // 2. Mostrar loader inicial
        const loadingSwal = Swal.fire({
            title: 'Iniciando carga de tandas...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        // 3. Función de reintentos mejorada
        const fetchWithRetry = async (url, options, maxRetries = 3, initialDelay = 1000) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    loadingSwal.update({
                        title: `Descargando datos (${attempt}/${maxRetries})`,
                        text: `Por favor espere...`
                    });

                    const response = await fetch(url, options);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const data = await response.json();
                    return data;

                } catch (error) {
                    console.error(` ${attempt} fallido:`, error);
                    
                    if (attempt >= maxRetries) {
                        throw new Error(`Fallo después de ${maxRetries} intentos: ${error.message}`);
                    }

                    // Delay exponencial con variación aleatoria
                    const delay = initialDelay * Math.pow(2, attempt - 1) + (Math.random() * 500);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        };

        // 4. Descargar datos con reintentos
        let snapshotData;
        try {
            snapshotData = await fetchWithRetry(fullUrl, { headers: corsHeaders }, 5, 1500);
        } catch (error) {
            await loadingSwal.close();
            await Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: `No se pudo cargar los datos después de varios intentos: ${error.message}`,
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // 5. Procesamiento de tandas con reintentos por cada una
        const tandas = [];
        if (snapshotData) {
            const tandaNames = Object.keys(snapshotData);
            
            for (let i = 0; i < tandaNames.length; i++) {
                const tandaName = tandaNames[i];
                let processed = false;
                let retryCount = 0;
                const maxTandaRetries = 3;

                while (!processed && retryCount < maxTandaRetries) {
                    try {
                        loadingSwal.update({
                            title: `Procesando tandas (${i + 1}/${tandaNames.length})`,
                            text: `${tandaName} - Intento ${retryCount + 1}/${maxTandaRetries}`
                        });

                        const match = tandaName.match(/TANDA_(\d+)/);
                        if (match) {
                            tandas.push({
                                name: tandaName,
                                number: parseInt(match[1]),
                                data: snapshotData[tandaName] // Incluir datos completos
                            });
                            processed = true;
                        }

                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                    } catch (error) {
                        retryCount++;
                        if (retryCount >= maxTandaRetries) {
                            console.warn(`Tanda omitida: ${tandaName}`, error);
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                        }
                    }
                }
            }
        }

        // 6. Verificación final de datos
        if (tandas.length === 0) {
            await loadingSwal.close();
            await Swal.fire({
                icon: 'warning',
                title: 'Sin tandas procesables',
                text: 'No se encontraron tandas válidas o hubo errores en todas.',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // 7. Ordenar y preparar interfaz
        tandas.sort((a, b) => b.number - a.number);
        await loadingSwal.close();

        // 8. Generar HTML de la interfaz
        const checklistHTML = `
            <div class="tandas-container">
                <div class="list-group" style="max-height: 60vh; overflow-y: auto;">
                    ${tandas.map(tanda => `
                        <label class="list-group-item d-flex gap-2 align-items-center">
                            <input class="form-check-input flex-shrink-0 ml-2 mr-3" 
                                   type="checkbox" 
                                   value="${tanda.number}" 
                                   id="tanda-${tanda.number}"
                                   ${tandas.length === 1 ? 'checked' : ''}>
                            <span class="ms-2">
                                <strong>${tanda.name}</strong>
                                <small class="d-block text-muted">${Object.keys(tanda.data).length} registros</small>
                            </span>
                        </label>
                    `).join('')}
                </div>
                <div class="mt-3 d-flex justify-content-between">
                    <button type="button" id="selectAllBtn" class="btn btn-sm btn-outline-primary">
                        <i class="bi bi-check2-square me-1 mr-1"></i>Seleccionar todo
                    </button>
                    <button type="button" id="deselectAllBtn" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-x-square me-1 mr-1"></i>Deseleccionar todo
                    </button>
                </div>
            </div>
        `;

        // 9. Mostrar diálogo de selección
        const { value: selectedTandas } = await Swal.fire({
            title: `<i class="bi bi-list-check me-2 mr-1"></i>Tandas disponibles (${selectedFolderDate})`,
            html: checklistHTML,
            footer: `<small class="text-muted">Total: ${tandas.length} tandas procesadas</small>`,
            confirmButtonText: '<i class="bi bi-file-earmark-pdf me-2 mr-1"></i>Generar reporte',
            cancelButtonText: '<i class="bi bi-x-circle me-2 mr-1"></i>Cancelar',
            showCancelButton: true,
            width: '700px',
            backdrop: 'rgba(0,0,0,0.5)',
            allowOutsideClick: false,
            focusConfirm: false,
            didOpen: () => {
                // Controladores para selección/deselección
                document.getElementById('selectAllBtn').addEventListener('click', () => {
                    tandas.forEach(tanda => {
                        document.getElementById(`tanda-${tanda.number}`).checked = true;
                    });
                });

                document.getElementById('deselectAllBtn').addEventListener('click', () => {
                    tandas.forEach(tanda => {
                        document.getElementById(`tanda-${tanda.number}`).checked = false;
                    });
                });
            },
            preConfirm: () => {
                const selected = tandas
                    .filter(tanda => document.getElementById(`tanda-${tanda.number}`).checked)
                    .map(tanda => tanda.number);
                
                if (selected.length === 0) {
                    Swal.showValidationMessage('Debes seleccionar al menos una tanda');
                    return false;
                }
                return selected;
            }
        });

        // 10. Generar reporte si se seleccionaron tandas
        if (selectedTandas) {
            try {
                await generateQueryReport(selectedFolderDate, selectedTandas);
            } catch (error) {
                console.error("Error al generar reporte:", error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error al generar',
                    text: 'Hubo un problema al crear el reporte. Por favor intente nuevamente.',
                    confirmButtonText: 'Entendido'
                });
            }
        }

    } catch (error) {
        console.error("Error general en printQueryButton:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error inesperado',
            text: 'Ocurrió un error no previsto en el proceso. Detalles en consola.',
            confirmButtonText: 'Entendido'
        });
    }
});
// FIN BOTON IMPRIMIR EN TANDA GENERAL

// GENERAR REPORTE EN TANDA GENERAL
async function generateQueryReport(date, selectedTandas) {
    // Preguntar si se desea excluir ventas ya sumadas
    const { value: excludePrevious } = await Swal.fire({
        title: '⚠️ <span style="color:#d33">¡Atención!</span>',
        html: `
            <p style="font-size: 16px;">
                ¿Deseás <strong style="color:#e55353">excluir</strong> las ventas que ya fueron <span style="color:#3399ff">agregadas</span> en una <strong style="color:#20c997">consulta anterior</strong>? 🛑
            </p>
            <p style="font-size: 14px; color: #666;">Esta acción evitará duplicar ventas ya sumadas previamente.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '✅ Sí, excluir',
        cancelButtonText: '❌ No, incluir todo',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545'
    });

    // Mostrar loader al inicio
    const loadingSwal = Swal.fire({
        title: 'Generando Query...',
        html: 'Espere por favor',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const agrupado = {};
        const excluidos = []; // Array para almacenar los IDs excluidos
        let totalVentas = 0;
        const firebaseUrl = 'https://despachos-meli-novogar-default-rtdb.firebaseio.com';

        // Configuración de headers para CORS
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };

        // Procesar cada tanda seleccionada
        for (const tandaNum of selectedTandas) {
            try {
                // Obtener datos de la tanda
                const tandaPath = `/ImpresionEtiquetas/${date}/TANDA_${tandaNum}.json`;
                const tandaResponse = await fetch(`${firebaseUrl}${tandaPath}`, {
                    headers: corsHeaders
                });
                
                const tandaData = await tandaResponse.json();
                const ventaIds = Object.keys(tandaData || {});
                totalVentas += ventaIds.length;

                // Obtener detalles de cada envío
                const enviosPromises = ventaIds.map(async id => {
                    const envioPath = `/envios/${id}.json`;
                    const response = await fetch(`${firebaseUrl}${envioPath}`, {
                        headers: corsHeaders
                    });
                    return { id, data: await response.json(), path: envioPath }; // Devolver el ID junto con los datos
                });

                const resultados = await Promise.all(enviosPromises);

                // Procesar cada envío encontrado
                for (const { id, data, path } of resultados) {
                    if (!data) continue;

                    // Si se debe excluir y ya fue impreso previamente
                    if (excludePrevious && data.imprensoEnQuery) {
                        excluidos.push(id);
                        continue;
                    }

                    // Verificar si es de Jujuy o Tierra del Fuego
                    const infoProvincia = data.client?.billing_info?.additional_info?.find(info => info.type === "STATE_NAME");
                    const isExcludedState = infoProvincia && (infoProvincia.value === "Jujuy" || infoProvincia.value === "Tierra del Fuego");

                    // Si se desea excluir y el estado es Jujuy o Tierra del Fuego
                    if (isExcludedState) {
                        excluidos.push(id); // Agregar ID a la lista de excluidos
                        continue;
                    }

                    // Verificar si se debe excluir por duplicado
                    if (excludePrevious === 'Sí') {
                        excluidos.push(id); // Agregar ID a la lista de excluidos
                        continue;
                    }

                    const sku = data.SKU || data.sku || 'SIN_SKU';
                    const cantidad = Number(data.Cantidad || data.cantidad || 1);
                    const producto = data.Producto || data.producto || 'Sin descripción';

                    const claveAgrupacion = sku.toUpperCase();

                    if (!agrupado[claveAgrupacion]) {
                        agrupado[claveAgrupacion] = {
                            sku: sku,
                            cantidad: 0,
                            producto: producto,
                            tandas: new Set(),
                            detalles: [] // ← Array para guardar detalles
                        };
                    }
                    
                    agrupado[claveAgrupacion].cantidad += cantidad;
                    agrupado[claveAgrupacion].tandas.add(tandaNum);
                    agrupado[claveAgrupacion].detalles.push({ id, cantidad }); 

                    // Actualizar imprensoEnQuery con fecha y hora en cada envío si no existe
                    const fechaHora = new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' });
                    await fetch(`${firebaseUrl}${path}`, {
                        method: 'PATCH',
                        headers: corsHeaders,
                        body: JSON.stringify({ imprensoEnQuery: fechaHora })
                    });
                }

            } catch (error) {
                console.error(`Error procesando tanda ${tandaNum}:`, error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: `No se pudo obtener la tanda ${tandaNum}. Verifica la conexión.`
                });
                continue;
            }
        }

        // Headers y URLs
        const corsHeaders2 = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
            'Content-Type': 'application/json'
        };
        const corsProxyUrl2 = 'https://proxy.cors.sh/';
        const firebaseUrl2 = 'https://precios-novogar-default-rtdb.firebaseio.com';

        // Convertir a array y ordenar
        const arrayAgrupado = Object.values(agrupado);
        arrayAgrupado.sort((a, b) => b.cantidad - a.cantidad);

        const totalItems = arrayAgrupado.length;

        // Iterar para obtener stock
        for (let i = 0; i < totalItems; i++) {
            const item = arrayAgrupado[i];
            const skuLimpio = item.sku.replace(/[-.]/g, '').toUpperCase();
            console.log(`Buscando SKU ${skuLimpio} en /precios`);

            // Actualizar el porcentaje en el Sweet Alert
            const porcentaje = Math.round(((i + 1) / totalItems) * 100);
            loadingSwal.update({
                html: `Espere por favor... ${porcentaje}% completado`
            });

            try {
                const url = `${corsProxyUrl2}${firebaseUrl2}/precios/${skuLimpio}.json`;
                const response = await fetch(url, { headers: corsHeaders2 });
                const dataStock = await response.json();
                item.preseaStock = dataStock ? dataStock.stock : '—';
            } catch (error) {
                console.error(`Error al buscar ${skuLimpio} en /precios`, error);
                item.preseaStock = '—';
            }
        }

        // Generar HTML de la tabla sin scroll vertical
        let tablaHtml = `
            <div id="tablaReporte">
                <h3 style="text-align:center; margin-bottom: 10px;">
                    Resumen ${date} - ${selectedTandas.length} Tanda(s)
                </h3>
                <p style="text-align:center; color:#666;">Total de ventas procesadas: ${totalVentas}</p>
                <p style="text-align:center; color:#666;">Total IDs excluidos (por imprensoEnQuery): ${excluidos.length || 0}</p>
                ${excludePrevious === 'Sí' && excluidos.length ? `<p style="text-align:center; color:#666;">Preparados Antes (Excluidos): ${excluidos.join(', ')}</p>` : ''}
                <p style="text-align:center; color:#666;">Total SKU distintos: ${arrayAgrupado.length}</p>
                <p style="text-align:center; color:#666;">Ordenado por: Cantidad (de mayor a menor)</p>
                <table class="table table-bordered table-hover" style="font-family: Arial, sans-serif;">
                    <thead class="table-success">
                        <tr>
                            <th style="width: 20%;">SKU</th>
                            <th style="width: 10%;">⚠️</th>
                            <th style="width: 50%;">Descripción</th>
                            <th style="width: 10%;">Presea</th>
                            <th style="width: 10%;">📦</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        for (let index = 0; index < arrayAgrupado.length; index++) {
            const item = arrayAgrupado[index];
            const collapseId = `collapseDetalle-${index}`;
            const tandasList = Array.from(item.tandas).sort((a, b) => b - a).join(', ');

            tablaHtml += `
                <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">
                    <strong>${item.sku}</strong>
                    <button class="btn btn-sm btn-link toggle-collapse" data-target="collapseDetalle-${index}" style="font-size: 12px; padding-left: 6px;">
                        <span id="icon-collapseDetalle-${index}">▼</span>
                    </button>
                </td>
                    <td class="cantidad-query-meli">
                    <span class="cantidad-circulo ${item.cantidad > 1 ? 'multiple' : 'uno'}">
                        ${item.cantidad}
                    </span>
                    </td>
                    <td>${item.producto}</td>
                    <td style="text-align: center;">${item.preseaStock}</td>
                    <td style="text-align: center; font-size: 0.8em;">${tandasList}</td>
                </tr>
                <tr class="collapse" id="${collapseId}">
                    <td colspan="5">
                        <div class="card-query-collapse mt-2 mb-2" style="padding: 10px; background-color: #f9f9f9; border: 1px solid #ccc;">
                            <strong>Detalle de IDs y cantidades:</strong>
                            <table class="table table-sm table-bordered mt-2 mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 80%;">ID</th>
                                        <th style="width: 20%; text-align: center;">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${item.detalles.map(det => `
                                        <tr>
                                            <td>
                                                <a href="https://www.mercadolibre.com.ar/ventas/${det.id}/detalle" target="_blank" rel="noopener noreferrer">
                                                    ${det.id}
                                                </a>
                                            </td>
                                            <td style="text-align: center;">${det.cantidad}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            `;
        }

        tablaHtml += `
                    </tbody>
                </table>
            </div>
        `;

        // Cerrar loader antes de mostrar resultados
        await loadingSwal.close();

        // Mostrar con botón de impresión
        await Swal.fire({
            title: 'Resumen de Query',
            html: tablaHtml,
            width: '900px',
            showCloseButton: true,
            confirmButtonText: 'Cerrar',
            footer: `
                <button onclick="imprimirTabla()" class="btn btn-success" style="margin-right: 10px;">
                    <i class="bi bi-printer"></i> Imprimir
                </button>
                <small style="color: #666;">Generado el ${new Date().toLocaleDateString()}</small>
            `,
            didOpen: () => {
                // Función de impresión mejorada
                window.imprimirTabla = function() {
                    const win = window.open('', '_blank');
                    win.document.write(`
                        <html>
                            <head>
                                <title>Resumen ${date}</title>
                                <style>
                                    body { font-family: Arial; margin: 20px; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                    th, td { border: 1px solid #ddd; padding: 8px; }
                                    th { background-color: #4CAF50; color: white; }
                                    @media print {
                                        @page { size: landscape; margin: 5mm; }
                                        body { font-size: 12pt; }
                                        table { page-break-inside: auto; }
                                        tr { page-break-inside: avoid; page-break-after: auto; }
                                    }
                                </style>
                            </head>
                            <body>
                                <h2 style="text-align:center;">Resumen de producción</h2>
                                <p><strong>Fecha:</strong> ${date}</p>
                                <p><strong>Tandas incluidas:</strong> ${selectedTandas.sort((a,b) => b-a).join(', ')}</p>
                                <p><strong>Total items:</strong> ${arrayAgrupado.length}</p>
                                <p><strong>Total IDs excluidos (por imprensoEnQuery):</strong> ${excluidos.length > 0 ? excluidos.length : 0}</p>
                                ${excludePrevious === 'Sí' && excluidos.length > 0 ? `<p><strong>Preparados Antes (Excluidos):</strong> ${excluidos.join(', ')}</p>` : ''}
                                <p><strong>Ordenado por:</strong> Cantidad (de mayor a menor)</p>
                                ${
                                    (() => {
                                        const clone = document.querySelector('#tablaReporte').cloneNode(true);
                                        clone.querySelectorAll('.collapse').forEach(el => el.remove());
                                        return clone.innerHTML;
                                    })()
                                }
                            </body>
                        </html>
                    `);
                    win.document.close();
                    setTimeout(() => {
                        win.print();
                        win.close();
                    }, 500);
                };

                // Cambia icono en collapse
                document.querySelectorAll('.toggle-collapse').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetId = btn.dataset.target;
                        const row = document.getElementById(targetId);
                        const icon = document.getElementById('icon-' + targetId);

                        const isVisible = row.style.display === 'table-row';
                        row.style.display = isVisible ? 'none' : 'table-row';
                        icon.textContent = isVisible ? '▼' : '▲';
                    });
                });
            }
        });

    } catch (error) {
        await loadingSwal.close();
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al generar el reporte: ' + error.message
        });
        console.error('Error en generateQueryReport:', error);
    }
}
// FIN GENERAR REPORTE EN TANDA GENERAL

document.getElementById('backButton').addEventListener('click', () => {
    if (folderStack.length > 0) {
        currentFolderPath = folderStack.pop();
        loadFolder(currentFolderPath);
    }
});

$('#etiquetasModal').on('shown.bs.modal', function () {
    loadFolder(currentFolderPath);
});

async function enviarReporteWebhookFacturacion(datosFiltrados) {
    // Verificar si no hay datos filtrados
    if (datosFiltrados.length === 0) {
        console.log('No hay datos filtrados para enviar.');
        return; // No enviar el reporte si no hay datos
    }

    const fechaHora = new Date().toLocaleString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    }).replace(',', 'h').replace('h', ', '); // Formato "26/10/24, 18:27h"

    // Crear lista con emojis según la provincia
    const crearLista = (datos) => datos.map(({ ventaid, provincia }) => {
        const emoji = provincia.toLowerCase() === 'tierra del fuego' ? '🌋' : '🏔️';
        return `${ventaid} - ${provincia} ${emoji}`;
    }).join('\n');

    const mensaje = `
* * * * * * * * * * * * * * * * * * * * * * * *
*Excluidos 🚫* ${datosFiltrados.length}\n
${crearLista(datosFiltrados)}\n
* * * * * * * * * * * * * * * * * * * * * * * *
*🕑 Reporte de Envíos (${fechaHora})*
    `;

    try {
        await fetch(`${corsh}${HookMeli2}`, {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json',
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
            },
            body: JSON.stringify({ text: mensaje }),
        });
    } catch (error) {
        console.error('Error al enviar el reporte:', error);
    }
}

async function enviarReporteWebhook(datosAgregados, datosNoEncontrados, datosFiltrados, etiquetasDuplicadas, selectedFolderDate, fileNameSinExtension) {
    const fechaHora = new Date().toLocaleString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    }).replace(',', 'h').replace('h', ', '); // Formato "20/05/25, 09:23"

    const crearLista = (datos) => datos.map(id => `• ${id}`).join('\n');

    let mensaje = `
* * * * * * * * * * * * * * * * * * * * * * * *
*⏰ Reporte de Envíos* (${fechaHora})\n
🖨️ Imprimiste *${fileNameSinExtension}* del dia *${selectedFolderDate}*
\n`;

    mensaje += `*🟢 Agregados:* ${datosAgregados.length}\n${crearLista(datosAgregados) || 'Ninguno'}\n\n`;

    if (datosNoEncontrados.length > 0) {
        mensaje += `*🔴 No Encontrados (Posible Carrito):* ${datosNoEncontrados.length}\n${crearLista(datosNoEncontrados)}\n\n`;
    }

    if (datosFiltrados.length > 0) {
        mensaje += `*🚫 Excluidos (Jujuy/Tierra del Fuego):* ${datosFiltrados.length}\n${crearLista(datosFiltrados)}\n\n`;
    }

    if (etiquetasDuplicadas.length > 0) {
        mensaje += `*⚠️ Duplicados:* ${etiquetasDuplicadas.length}\n${etiquetasDuplicadas.map(item => `• ${item}`).join('\n')}\n\n`;
    } else {
        mensaje += `*⚠️ Duplicados:* 0\n\n`;
    }

    mensaje += `* * * * * * * * * * * * * * * * * * * * * * * *\n`;

    try {
        await fetch(`${corsh}${HookMeli}`, {
            method: 'POST',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json',
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
            },
            body: JSON.stringify({ text: mensaje }),
        });
    } catch (error) {
        console.error('Error al enviar el reporte:', error);
    }
}

async function enviarCorreoTanda(destinatarioEmail, nombreDestinatario, nombreTanda, horaSubida) {
    const fecha2 = new Date().toLocaleDateString('es-AR'); 
    const emailBody = `
        <html>
        <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center;">
                    <a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer">
                        <img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo">
                    </a>
                </div>
                <h2 style="color: #333333;">Hola ${nombreDestinatario},</h2>
                <p style="color: #333333;">Tienes disponible una nueva tanda de facturación.</p>
                <p style="color: #333333;">Nombre de la tanda: <strong>${nombreTanda}</strong></p>
                <p style="color: #333333;">Hora de subida: <strong>${horaSubida}</strong></p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://lucasponzoni.github.io/ANDESMAR/despachos.html" style="background-color: #ff0000; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Descargar Tanda</a>
                </div>
                <p style="color: #333333;">Saludos,</p>
                <p style="color: #333333;">Equipo de Posventa Novogar</p>
            </div>
        </body>
        </html>
    `;
    const fecha = new Date().toLocaleDateString();
    const Subject = `Nueva Tanda de Facturación - ${nombreTanda} - ${fecha}`;
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
                "Name": nombreDestinatario,
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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        if (result.Status === 'done') {
            console.log (`Email enviado a ${destinatarioEmail} a las ${horaSubida}`);
        } else {
            console.log(`Error al enviar el email: ${result.Message}`);
            showAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${horaSubida}`);
        }
    } catch (error) {
        console.error('Error al enviar el email:', error);
        showAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${horaSubida}`);
    }
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire('Error', 'Por favor, seleccione un archivo.', 'error');
        return;
    }

    const today = new Date();
    let uploadDate = new Date(today);

    const dayOfWeek = today.getDay();
    const hourOfDay = today.getHours();

    if (hourOfDay >= 12 || (dayOfWeek === 6 && hourOfDay >= 11) || dayOfWeek === 0) {
        uploadDate.setDate(today.getDate() + 1);
    }
    
    if (uploadDate.getDay() === 0) {
        uploadDate.setDate(uploadDate.getDate() + 1);
    }

    const dateString = formatDate(uploadDate);
    const folderPath = `Etiquetas/${dateString}`;

    showSpinner(true);

    const reader = new FileReader();
    reader.onload = function(event) {
        const newFileContent = event.target.result;

        const folderRef = storage.ref(folderPath);
        folderRef.listAll().then(result => {
            const filePromises = result.items.map(fileRef => {
                return fileRef.getDownloadURL().then(url => {
                    return fetch(`https://proxy.cors.sh/${url}`, {
                        headers: {
                            'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                        }
                    })
                    .then(response => response.text())
                    .then(content => {
                        if (content === newFileContent) {
                            throw new Error('El archivo ya existe en las tandas de hoy.');
                        }
                    });
                });
            });

            Promise.all(filePromises).then(() => {
                const fileCount = result.items.length + 1;
                const fileName = `TANDA ${fileCount}.txt`;
                const fileRef = folderRef.child(fileName);

                fileRef.put(file).then(() => {
                    const horaSubida = new Date().toLocaleTimeString();
                    Swal.fire('Subido!', 'El archivo ha sido subido exitosamente.', 'success');
                    fileInput.value = '';
                    loadFolder(currentFolderPath);
                    showSpinner(false);

                    const destinatarios = [
                        { email: "lucasponzoninovogar@gmail.com", nombre: "Lucas" },
                        { email: "lucas.ponzoni@novogar.com.ar", nombre: "Lucas" },
                        { email: "mauricio.daffonchio@novogar.com.ar", nombre: "Mauricio" },
                        { email: "esperanza.toffalo@novogar.com.ar", nombre: "Esperanza" },
                        { email: "posventa@novogar.com.ar", nombre: "Posventa" },
                        { email: "marina.braidotti@novogar.com.ar", nombre: "Marina" },
                        { email: "agustina.benedetto@novogar.com.ar", nombre: "Agustina" },
                        { email: "natalia.rodriguez@novogar.com.ar", nombre: "Natalita" },
                        { email: "mauricio.villan@novogar.com.ar", nombre: "Mauricio" }
                    ];

                    destinatarios.forEach(destinatario => {
                        enviarCorreoTanda(destinatario.email, destinatario.nombre, fileName, horaSubida);
                    });
                }).catch(error => {
                    console.error('Error al subir el archivo:', error);
                    Swal.fire('Error', 'Error al subir el archivo.', 'error');
                    showSpinner(false);
                });
            }).catch(error => {
                console.error('Error al verificar el archivo:', error);
                Swal.fire('Error', error.message, 'error');
                showSpinner(false);
            });
        }).catch(error => {
            console.error('Error al listar archivos en la carpeta:', error);
            Swal.fire('Error', 'Error al listar archivos en la carpeta.', 'error');
            showSpinner(false);
        });
    };
    reader.readAsText(file);
}
// FIN UPLOAD ETIQUETAS MELI

// BORRAR DATOS DE PLANILLA
function borrarElemento() {
    // Preguntar por la contraseña
    Swal.fire({
        title: 'Ingrese la contraseña',
        inputLabel: 'Contraseña para borrar todos los datos de planilla',
        input: 'password',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        icon: 'question',
        preConfirm: (password) => {
            // Validar la contraseña
            if (password !== '37892345' && password !== '46295786') {
                Swal.showValidationMessage('Contraseña incorrecta');
            } else {
                return password;
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Confirmar la eliminación
            Swal.fire({
                title: '¿Está seguro?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, borrar datos',
                cancelButtonText: 'No, cancelar'
            }).then((confirmResult) => {
                if (confirmResult.isConfirmed) {
                    // Eliminar datos de Firebase
                    const dbRef = firebase.database().ref('/despachoDelDiaMeli');
                    dbRef.remove()
                        .then(() => {
                            Swal.fire('¡Eliminado!', 'Los datos han sido borrados.', 'success').then(() => {
                                // Recargar la página después de la eliminación
                                location.reload();
                            });
                        })
                        .catch((error) => {
                            Swal.fire('Error', 'No se pudo borrar los datos: ' + error.message, 'error');
                        });
                }
            });
        }
    });
}
// FIN BORRAR DATOS DE PLANILLA

// BUSCADOR DE TANDAS
function searchTanda(codigo) {
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = `
    <div class="search-result-item">
      <span class="result-icon result-loading"><i class="bi bi-arrow-repeat"></i></span>
      <span>Buscando en tandas...</span>
    </div>
  `;
  
  const dbRef = firebase.database().ref('ImpresionEtiquetas');
  
  dbRef.once('value').then((snapshot) => {
    let found = false;
    let resultHtml = '';
    
    snapshot.forEach((fechaSnapshot) => {
      const fecha = fechaSnapshot.key;
      
      fechaSnapshot.forEach((tandaSnapshot) => {
        const tanda = tandaSnapshot.key;
        
        tandaSnapshot.forEach((ventaSnapshot) => {
          if (ventaSnapshot.key === codigo) {
            found = true;
            resultHtml = `
              <div class="search-result-item">
                <span class="result-icon result-success"><i class="bi bi-check-circle"></i></span>
                <span>Encontrado en <strong>${tanda}</strong> del <strong>${fecha}</strong></span>
              </div>
            `;
            return true;
          }
        });
        
        if (found) return true;
      });
      
      if (found) return true;
    });
    
    if (!found) {
      resultHtml = `
        <div class="search-result-item">
          <span class="result-icon result-error"><i class="bi bi-exclamation-circle"></i></span>
          <span>El código no existe en ninguna tanda registrada</span>
        </div>
      `;
    }
    
    resultsDiv.innerHTML = resultHtml;
  }).catch((error) => {
    resultsDiv.innerHTML = `
      <div class="search-result-item">
        <span class="result-icon result-error"><i class="bi bi-x-circle"></i></span>
        <span>Error al buscar: ${error.message}</span>
      </div>
    `;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Mostrar/ocultar campo de búsqueda
  document.getElementById('searchButton').addEventListener('click', function() {
    const container = document.getElementById('searchInputContainer');
    container.style.display = 'block';
    this.style.display = 'none';
    document.getElementById('tandaSearchInput').focus();
    resetSearchTimeout();
  });

  // Evento para el input de búsqueda
  document.getElementById('tandaSearchInput').addEventListener('input', function(e) {
    resetSearchTimeout();
    const value = e.target.value.trim();
    if (value.length === 16 && /^\d+$/.test(value)) {
      searchTanda(value);
    }
  });

  // Variable para el timeout y contador
  let searchTimeout = null;
  let countdownInterval = null;
  let secondsLeft = 10;

  function resetSearchTimeout() {
    // Limpiar intervalos existentes
    if (searchTimeout) clearTimeout(searchTimeout);
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Resetear contador
    secondsLeft = 10;
    updateCountdownText();
    
    // Crear nuevo timeout
    searchTimeout = setTimeout(() => {
      closeSearch();
    }, 10000); // 10 segundos
    
    // Iniciar contador visible
    countdownInterval = setInterval(() => {
      secondsLeft--;
      updateCountdownText();
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  function updateCountdownText() {
    const countdownElement = document.getElementById('countdownText');
    if (countdownElement) {
      countdownElement.textContent = `El buscador se cerrará en ${secondsLeft} segundos...`;
      
      // Cambiar color cuando quedan pocos segundos
      if (secondsLeft <= 3) {
        countdownElement.style.color = '#ff6b6b';
      } else {
        countdownElement.style.color = '#666';
      }
    }
  }

  function closeSearch() {
    document.getElementById('searchInputContainer').style.display = 'none';
    document.getElementById('searchButton').style.display = 'inline-block';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('tandaSearchInput').value = '';
    
    // Limpiar el texto del contador
    const countdownElement = document.getElementById('countdownText');
    if (countdownElement) {
      countdownElement.textContent = '';
    }
  }
});
// FIN BUSCADOR DE TANDAS