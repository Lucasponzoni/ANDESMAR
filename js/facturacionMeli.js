// Inicializa Firebase
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

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let allData = [];
let currentPage = 1;
let itemsPerPage = 50; // Número de elementos por página
let currentPageGroup = 0; // Grupo de páginas actuales
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchDespachos');
const spinner = document.getElementById('spinner');

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Función para formatear la hora
function formatTime(dateString) {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}hs`;
}

// Función para formatear números en pesos
function formatCurrency(amount) {
    return `$ ${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadTable(currentPage);
    const searchInput = document.getElementById('searchFacturacion');
    const spinner = document.getElementById('spinner');

    // Mensaje inicial
    searchInput.value = "Aguardando que cargue la web ⏳";
    searchInput.disabled = true;
    spinner.style.display = 'block';


// Cargar solo los datos que tengan shippingMode 'me1' desde Firebase
db.ref('envios').orderByChild('shippingMode').equalTo('me1').once('value')
.then(snapshot => {
    const data = snapshot.val();

    if (!data) {
        console.log('No se encontraron datos con shippingMode "me1"');
        searchInput.value = "No se encontraron datos";
        spinner.style.display = 'none';
        return;
    }

    // Obtener todos los datos y tomar los últimos 200
    const allData = Object.values(data);
    const last200Data = allData.slice(-800); // Toma los últimos 200 registros

    // Invertir el orden de los datos
    last200Data.reverse();

    // Contar la cantidad de datos
    const count = last200Data.length;

    // Mostrar datos y la cantidad en la consola
    console.log(`Cantidad de datos recibidos: ${count}`);

    // Cargar los datos en la tabla
    loadTable(last200Data);

    // Habilitar buscador y limpiar mensaje
    searchInput.disabled = false;
    searchInput.value = "";
    spinner.style.display = 'none';
})
.catch(error => {
    console.error('Error al cargar los datos:', error);
});

});

// Obtener el valor de PasarAWebMonto antes de cargar las filas
let pasarAWebMonto = 0;
db.ref('PasarAWebMonto').once('value')
    .then(snapshot => {
        pasarAWebMonto = snapshot.val() || 0;
    })
    .catch(error => {
        console.error("Error al obtener PasarAWebMonto: ", error);
    });

    function loadTable(data) {
        try {
            // Verificar si hay datos para cargar
            if (!data || data.length === 0) {
                console.log('No hay datos para mostrar en la tabla.');
                return;
            }

            // Verificar si `data` es un array
            if (!Array.isArray(data)) {
            return; 
        }
    
            allData = data;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedData = data.slice(start, end);
            const tableBody = document.querySelector('#data-table tbody');

        tableBody.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

        paginatedData.forEach(operation =>{
                if (!operation) {
                    console.warn('Operación no válida:', operation);
                    return;
                }
    
                const row = document.createElement('tr');
    
                // Función para mostrar la alerta
                function showAlert(message) {
                    const alertContainer = document.createElement('div');
                    alertContainer.className = 'alert-ios-meli';
                    alertContainer.innerHTML = `
                        <i class="bi bi-clipboard-check"></i>
                        ${message}
                        <button class="close-btn" onclick="this.parentElement.style.display='none';">&times;</button>
                    `;
                    document.body.appendChild(alertContainer);
                
                    setTimeout(() => {
                        alertContainer.style.display = 'none';
                    }, 3000);
                }
                
                // Estado
                const stateCell = document.createElement('td');
                const container = document.createElement('div');
                container.className = 'ios-style-id-container';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                
                const idElement = document.createElement('span');
                idElement.textContent = `${operation.idOperacion}`;
                idElement.classList.add('ios-style-id');
                
                // Verificar si existe operacion.packId y crear el div correspondiente
                if (operation.packId) {
                    const packIdElement = document.createElement('div');
                    packIdElement.textContent = `📦 ${operation.packId}`;
                    packIdElement.classList.add('ios-style-paqId');
                    container.appendChild(packIdElement);
                
                    // Cambiar la clase de idElement si existe packId
                    idElement.classList.add('ios-style-id-2');
                
                    // Agregar evento de clic para copiar packId al portapapeles
                    packIdElement.addEventListener('click', () => {
                        navigator.clipboard.writeText(operation.packId).then(() => {
                            showAlert(`Se ha copiado al portapapeles: PaqId ${operation.packId}`);
                        }).catch(err => {
                            console.error('Error al copiar al portapapeles:', err);
                        });
                    });
                } else {
                    // Mantener la clase original si no existe packId
                    idElement.classList.add('ios-style-id');
                }
                
                // Agregar evento de clic para copiar idOperacion al portapapeles
                idElement.addEventListener('click', () => {
                    navigator.clipboard.writeText(operation.idOperacion).then(() => {
                        showAlert(`Se ha copiado al portapapeles: idOperacion ${operation.idOperacion}`);
                    }).catch(err => {
                        console.error('Error al copiar al portapapeles:', err);
                    });
                });
                
                container.appendChild(idElement);
                stateCell.appendChild(container);
                row.appendChild(stateCell);
    
                const selectElement = document.createElement('select');
                selectElement.style.width = '100%';
                selectElement.innerHTML = `
                    <option value="pendiente">Pendiente ⏳</option>
                    <option value="facturado">Facturado ✅</option>
                    <option value="cancelado">Cancelado ❌</option>
                    <option value="bloqueado">Bloqueado 🔒</option>
                    <option value="analizar_pasado_a_web">Web ⚠️</option>
                    <option value="pendiente_no_pasa_web">No Pasa ⏳</option>
                    <option value="pasado_a_web">Pasado a Web</option>
                `;
                container.appendChild(selectElement);
    
                stateCell.appendChild(container);
                row.appendChild(stateCell);
    
                // Establecer el estado inicial
                const currentState = operation.estadoFacturacion || 'pendiente';
                selectElement.value = currentState;
    
                // Cambiar el color de fondo de la fila según el estado
                switch (currentState) {
                    case 'pendiente':
                        row.style.backgroundColor = 'white';
                        break;
                    case 'facturado':
                        row.style.backgroundColor = 'lightgreen';
                        break;
                    case 'bloqueado':
                        row.style.backgroundColor = 'grey';
                        break;
                    case 'cancelado':
                        row.style.backgroundColor = 'pink';
                        break;
                    case 'pasado_a_web':
                        row.style.backgroundColor = 'lightblue';
                        break;
                    case 'analizar_pasado_a_web':
                        row.style.backgroundColor = 'lightyellow';
                        break;
                    default:
                        row.style.backgroundColor = 'white';
                }
    
                // Actualizar estado en Firebase
                selectElement.addEventListener('change', function() {
                    updateRowColor();
                    const operationId = operation.idOperacion;
                    db.ref('envios/' + operationId).update({ estadoFacturacion: selectElement.value })
                        .then(() => {
                            console.log(`Estado de facturación actualizado a ${selectElement.value} para la operación ${operationId}`);
                            updateNotificationCount();
                        })
                        .catch(error => {
                            console.error("Error al actualizar el estado de facturación:", error);
                            // Mostrar mensaje de error usando SweetAlert
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo actualizar el estado de facturación. Verifica tu conexión.',
                                confirmButtonText: 'Aceptar'
                            });
                        });
                });
    
                // Fecha y hora
                const dateCell = document.createElement('td');
                dateCell.innerHTML = `<strong>${formatDate(operation.dateCreated)}</strong>, ${formatTime(operation.dateCreated)}`;
                row.appendChild(dateCell);
    
                // Operación
                const operationCell = document.createElement('td');
                const operationId = operation.idOperacion.toString().replace('200001', '');
                operationCell.innerHTML = `
                    <a href="https://www.mercadolibre.com.ar/ventas/${operation.idOperacion}/detalle" target="_blank"><img id="Meli-trends" src="./Img/meli-trends.png" alt="Meli Trends"></a>
                `;
                row.appendChild(operationCell);
    
                // Imagen
                const imageCell = document.createElement('td');
                imageCell.innerHTML = `
                <a href="https://app.real-trends.com/orders/sale_detail/?order_id=200001${operationId}" target="_blank">
                <img id="real-trends" src="./Img/real-trends.png" alt="Real Trends">
                </a>
                `;
                row.appendChild(imageCell);
    
                // Valor
                const valueCell = document.createElement('td');
                const transactionAmount = operation.payments[0]?.transaction_amount || 0;
                valueCell.innerHTML = `<strong style="color: green;">${formatCurrency(transactionAmount)}</strong>`;
                row.appendChild(valueCell);

                // Agregar evento click para abrir el modal
                valueCell.addEventListener('click', () => {
                    createBillingModal(operation); // Llama a la función que crea el modal
                });
    
                // Verificar y actualizar el estado
                if (transactionAmount >= pasarAWebMonto && (currentState === 'pendiente' || currentState === 'analizar_pasado_a_web' || currentState === undefined)) {
                    selectElement.value = 'analizar_pasado_a_web';
                    db.ref('envios/' + operation.idOperacion).update({ estadoFacturacion: 'analizar_pasado_a_web' })
                        .then(() => {
                            console.log(`Estado actualizado a analizar_pasado_a_web para la operación ${operation.idOperacion}`);
                            updateRowColor();
                        })
                        .catch(error => {
                            console.error("Error al actualizar el estado de facturación:", error);
                        });
                } else if (transactionAmount < pasarAWebMonto && currentState === 'analizar_pasado_a_web') {
                    selectElement.value = 'pendiente';
                    db.ref('envios/' + operation.idOperacion).update({ estadoFacturacion: 'pendiente' })
                        .then(() => {
                            console.log(`Estado revertido a pendiente para la operación ${operation.idOperacion}`);
                            updateRowColor();
                            updateNotificationCount();
                        })
                        .catch(error => {
                            console.error("Error al revertir el estado de facturación:", error);
                        });
                }
    
                // Cambiar el color de fondo de la fila según el estado
                const updateRowColor = () => {
                    switch (selectElement.value) {
                        case 'pendiente':
                            row.style.backgroundColor = 'white';
                            break;
                        case 'facturado':
                            row.style.backgroundColor = 'lightgreen';
                            break;
                        case 'bloqueado':
                            row.style.backgroundColor = 'wheat';
                            break;
                        case 'cancelado':
                            row.style.backgroundColor = 'pink';
                            break;
                        case 'pasado_a_web':
                            row.style.backgroundColor = 'lightblue';
                            break;
                        case 'analizar_pasado_a_web':
                            row.style.backgroundColor = 'lightyellow';
                            break;
                        default:
                            row.style.backgroundColor = 'white';
                    }
                };
                updateRowColor();
                updateNotificationCount();
    
                // Envío
                const shippingCell = document.createElement('td');
                const shippingCost = operation.payments[0]?.shipping_cost || 0;
                shippingCell.style.whiteSpace = 'nowrap';
    
                // Verifica el estado de manera segura
if (operation.client && operation.client.billing_info && Array.isArray(operation.client.billing_info.additional_info)) {
    const stateName = operation.client.billing_info.additional_info.find(info => info.type === "STATE_NAME")?.value;

    if (["Jujuy", "Misiones", "Tierra del Fuego"].includes(stateName)) {
        shippingCell.innerHTML = `<strong class="alerta">⚠️ ${stateName.toUpperCase()}</strong>`;
    } else {
        shippingCell.innerHTML = shippingCost === 0 
            ? `<strong class="grauito" style="color: orangered;">GRATUITO</strong>` 
            : `<strong style="color: rgb(52,152,219);">${formatCurrency(shippingCost)}</strong>`;
    }
} else {
    console.warn("Información de facturación no disponible para la operación:", operation.idOperacion);
    shippingCell.innerHTML = `<strong style="color: red;">X</strong>`;
}

    
                row.appendChild(shippingCell);
    
                // Producto
                const productCell = document.createElement('td');
                productCell.className = 'product-cell';
                productCell.innerHTML = `Cantidad: <strong>X${operation.Cantidad}</strong> <br> SKU: <strong>${operation.SKU}</strong>`;
                row.appendChild(productCell);
                
                // Agregar evento de clic para abrir el modal con el carrusel de imágenes
                productCell.addEventListener('click', () => {
                    // Verificar si operation.pictures existe y es un array
                    const filteredPictures = Array.isArray(operation.pictures) ? 
                        operation.pictures.filter(picture => picture.secure_url) : [];
                
                    // Crear el carrusel
                    const carouselInner = document.getElementById('carouselInner');
                    carouselInner.innerHTML = ''; // Limpiar el contenido anterior del carrusel
                
                    filteredPictures.forEach((picture, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                        carouselItem.innerHTML = `
                            <img src="${picture.secure_url}" class="d-block mx-auto" alt="Imagen ${index + 1}" style="height: 150px; width: auto; max-width: 100%; object-fit: cover;">
                        `;
                        carouselInner.appendChild(carouselItem);
                    });
                
                    // Limpiar el contenido anterior del productInfo
                    const modalBody = document.querySelector('#productModal .modal-body');
                    const existingProductInfo = modalBody.querySelector('.macos-style-producto-meli');
                    if (existingProductInfo) {
                        existingProductInfo.remove();
                    }
                
                    // Agregar el div con la clase macos-style-producto-meli encima del carrusel
                    const productInfo = document.createElement('div');
                    productInfo.className = 'macos-style-producto-meli';
                    productInfo.innerHTML = `<i class="bi bi-info-circle-fill"></i> Producto: X ${operation.Cantidad} <strong style="color: white;">${operation.SKU}</strong> ${operation.Producto}`;
                    
                    // Agregar el productInfo y el carrusel al modal
                    modalBody.insertBefore(productInfo, modalBody.firstChild);
                
                    // Mostrar el modal
                    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
                    productModal.show();
                });
    
                // Medio de pago
                const paymentCell = document.createElement('td');
                const payment = operation.payments[0];
    
                let paymentMethodImage = '';
                let paymentDetails = '';
    
                switch (payment.payment_method_id) {
                    case 'consumer_credits':
                        paymentMethodImage = './Img/mercadocredito.png';
                        paymentDetails = '<strong>Crédito sin tarjeta</strong>';
                        break;
                    case 'account_money':
                        paymentMethodImage = './Img/mercadopago.png';
                        paymentDetails = '<strong>Dinero en Cuenta</strong>';
                        break;
                    case 'visa':
                    case 'debvisa':
                        paymentMethodImage = './Img/visa.png';
                        break;
                    case 'master':
                    case 'debmaster':
                        paymentMethodImage = './Img/master.png';
                        break;
                    case 'amex':
                        paymentMethodImage = './Img/amex.png';
                        break;
                    case 'naranja':
                        paymentMethodImage = './Img/naranja.png';
                        break;
                    case 'cabal':
                    case 'debcabal':
                        paymentMethodImage = './Img/cabal.png';
                        break;
                    case 'pagofacil':
                        paymentMethodImage = './Img/pagofacil.png';
                        paymentDetails = '<strong>PagoFacil Ticket</strong>';
                        break;
                    case 'rapipago':
                        paymentMethodImage = './Img/rapipago.png';
                        paymentDetails = '<strong>RapiPago Ticket</strong>';
                        break;
                }
    
                if (payment.payment_method_id !== 'consumer_credits' && payment.payment_method_id !== 'account_money' && payment.payment_method_id !== 'pagofacil' && payment.payment_method_id !== 'rapipago') {
                    const paymentType = payment.payment_type === 'credit_card' ? '<strong>Crédito</strong>' : payment.payment_type === 'debit_card' ? '<strong>Débito</strong>' : payment.payment_type;
                    paymentDetails = `${paymentType} en ${payment.installments} cuota/s de ${formatCurrency(payment.installment_amount)}`;
                }
    
                paymentCell.innerHTML = `
                    <div class="payment-cell">
                        <img src="${paymentMethodImage}" alt="${payment.payment_method_id}">
                        <span class="payment-details">${paymentDetails}</span>
                    </div>
                `;
                row.appendChild(paymentCell);
    
                // Botón para eliminar
                const deleteCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = 'X';
                deleteButton.className = 'btn btn-sm btn-danger';
                deleteButton.onclick = () => {
                    const row = deleteButton.closest('tr');
    
                    Swal.fire({
                        title: 'Ingrese la contraseña 🔒',
                        input: 'password',
                        inputLabel: 'Contraseña de Eliminación (Solicítela a Lucas)',
                        showCancelButton: true,
                        confirmButtonText: 'Eliminar',
                        cancelButtonText: 'Cancelar',
                        inputValidator: (value) => {
                            if (value !== '6572') {
                                return 'Contraseña incorrecta!';
                            }
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            db.ref('envios/' + operation.idOperacion).remove()
                                .then(() => {
                                    row.remove();
                                    Swal.fire('¡Eliminado!', 'La fila ha sido eliminada.', 'success');
                                })
                                .catch(error => {
                                    Swal.fire('Error', 'No se pudo eliminar la fila. ' + error.message, 'error');
                                });
                        }
                    });
                };
    
                deleteCell.appendChild(deleteButton);
                row.appendChild(deleteCell);


// MODAL DATOS DE PAGO
// Función para formatear la fecha
function formatDate2(dateString) {
    const date = new Date(dateString);
    return `Fecha ${date.toLocaleDateString('es-AR')}, Horario: ${date.toLocaleTimeString('es-AR')}`;
}

// Función para formatear la moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
}

// Crear el modal
function createBillingModal(operation) {
    // Limpiar el contenido anterior del modal si ya existe
    const existingModal = document.getElementById('billingModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Verificar si hay pagos disponibles
    if (!operation.payments || operation.payments.length === 0) {
        return; 
    }

    // Obtener los valores de los pagos
    const transactionAmount2 = operation.payments[0]?.transaction_amount || 0;
    const shippingCost2 = operation.payments[0]?.shipping_cost || 0; 
    const couponAmount2 = operation.payments[0]?.coupon_amount || 0;
    const dateApproved2 = formatDate2(operation.payments[0]?.date_approved);
    const totalPaidAmount2 = operation.payments[0]?.total_paid_amount;
    const idOperacion2 = operation.idOperacion;

    // Calcular el total facturable
    const totalPaid = transactionAmount2 + shippingCost2 - couponAmount2;

    const modalHtml = `
    <div class="modal fade" id="billingModal" tabindex="-1" aria-labelledby="billingModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content" style="border-radius: 10px; box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);">
                <div class="modal-header" style="background-color: #e9ecef; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                    <h5 class="modal-title" id="billingModalLabel" style="font-weight: bold; color: #333;">Detalle de Pago ${idOperacion2}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="padding: 30px; text-align: center;">
                    <img src="./Img/mp.webp" alt="Logo" style="width: 120px; display: block; margin: 0 auto 15px;">
                    <h5 style="color: #333; border: 1px solid #ccc; border-radius: 8px; padding: 12px; background-color: #f8f9fa;">
                        Factura de Operación ID:  
                        <a href="https://www.mercadopago.com.ar/activities/1?q=${idOperacion2}" target="_blank" style="color: #007bff; text-decoration: none;">
                            ${idOperacion2} <i class="bi bi-box-arrow-in-up-right" style="font-size: 1.2rem;"></i>
                        </a>
                    </h5>
                    <p style="margin-top: 15px;"><strong>Fecha de Acreditación:</strong> ${dateApproved2}</p>
                    <hr>
                    <p><strong>Costo de Producto:</strong> ${formatCurrency(transactionAmount2)}</p>
                    <p><strong>Costo de Envío:</strong> ${formatCurrency(shippingCost2)}</p>
                    <p style="color: red;"><strong>Contraparte:</strong> -${formatCurrency(couponAmount2)}</p>
                    <hr>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #28a745;">
                        <strong>Total Facturable:</strong> ${formatCurrency(totalPaid)}
                    </p>
                    <div id="amountCheck" style="margin-top: 20px;"></div>
                </div>
            </div>
        </div>
    </div>
`;

    // Agregar el modal al body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Calcular y mostrar la verificación de montos
    const amountCheckDiv = document.getElementById('amountCheck');
    const totalCalculated = transactionAmount2 + shippingCost2 - couponAmount2;
    const installments = operation.payments[0]?.installments || 0;

    if (totalCalculated === totalPaidAmount2) {
        amountCheckDiv.innerHTML = `
            <div style="background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 5px; padding: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-check-circle-fill" style="font-size: 1.5rem; margin-right: 10px;"></i>
                <div style="text-align: center;">
                    Los montos coinciden con Mercado Pago
                </div>
            </div>`;
    } else {
        const difference = totalPaidAmount2 - totalCalculated;
        amountCheckDiv.innerHTML = `
            <div style="background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 5px; padding: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-info-circle-fill" style="font-size: 1.5rem; margin-right: 10px;"></i>
                <div style="text-align: center;">
                    Los montos no coinciden con Mercado Pago, abono en ${installments} cuotas con recargo de ${formatCurrency(difference)}
                </div>
            </div>`;
    }
      
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('billingModal'));
    modal.show();
}

// Llamar a la función para crear el modal
createBillingModal(data);
// FIN MODAL DATOS DE PAGO

// TRACKING CONTROL
// Botón para verificar si fue enviado
const trackingCell = document.createElement('td');
const trackingButton = document.createElement('button');
trackingButton.type = 'button';
trackingButton.className = operation.trackingNumber ? 'btn btn-sm btn-success' : 'btn btn-sm btn-dark disabled'; // Verde si existe, oscuro si no
trackingButton.innerHTML = '<i class="bi bi-truck-front-fill"></i>';

// Solo agregar tooltip si hay un trackingNumber
if (operation.trackingNumber) {
    trackingButton.setAttribute('data-bs-toggle', 'tooltip');
    trackingButton.setAttribute('data-bs-placement', 'top');
    trackingButton.setAttribute('data-bs-custom-class', 'custom-tooltip');

    // Verificar si la transportCompany es "Novogar"
    if (operation.transportCompany === "Novogar") {
        trackingButton.setAttribute('data-bs-title', `${operation.transportCompany}: ${operation.trackingNumber}`);
    } else {
        trackingButton.setAttribute('data-bs-title', `${operation.transportCompany}: ${operation.trackingNumber} <a href="${operation.trackingLink}" target="_blank" style="color: white;">Ver seguimiento</a>`);
    }

    // Inicializar el tooltip
    const tooltip = new bootstrap.Tooltip(trackingButton, {
        html: true // Permitir HTML en el tooltip
    });

    // Mostrar el tooltip de manera permanente para pruebas
    tooltip.show();
}

// Agregar el botón a la celda
trackingCell.appendChild(trackingButton);
row.appendChild(trackingCell);
// FIN TRACKING CONTROL

// Botón de comentario
const commentCell = document.createElement('td');
const commentButton = document.createElement('button');

// Inicializar la clase del botón según los datos disponibles
if (operation.comentario) {
    commentButton.className = 'btn btn-sm btn-success';
} else if (operation.email) {
    commentButton.className = 'btn btn-sm btn-warning';
} else {
    commentButton.className = 'btn btn-sm btn-secondary';
}

commentButton.innerHTML = '<i class="bi bi-pencil"></i>';
commentCell.appendChild(commentButton);
row.appendChild(commentCell);

// Agregar la fila a la tabla
tableBody.appendChild(row);

commentButton.onclick = () => {
    console.log('ID de operación:', operation ? operation.idOperacion : 'undefined');

    if (!operation || !operation.idOperacion) {
        Swal.fire('Error', 'No se puede cargar el comentario: operación no válida.', 'error');
        return;
    }

    db.ref('envios').child(operation.idOperacion).once('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('comentarioInput').value = data.comentario || '';
            document.querySelector('input[type="email"]').value = data.email || '';
            document.querySelector('input[type="tel"]').value = data.Telefono || '';

            // Cambiar el estado del botón según los datos
            if (data.email) {
                commentButton.classList.remove('btn-secondary', 'btn-success');
                commentButton.classList.add('btn-warning');
            } else if (data.comentario) {
                commentButton.classList.remove('btn-secondary', 'btn-warning');
                commentButton.classList.add('btn-success');
            } else {
                commentButton.classList.remove('btn-warning', 'btn-success');
                commentButton.classList.add('btn-secondary');
            }

            if (data.trackingNumber) {
                actualizarEstadoDespacho(true);
            } else {
                actualizarEstadoDespacho(false);
            }
        } else {
            document.getElementById('comentarioInput').value = '';
            document.querySelector('input[type="email"]').value = '';
            document.querySelector('input[type="tel"]').value = '';
            actualizarEstadoDespacho(false);
            commentButton.classList.remove('btn-warning', 'btn-success');
            commentButton.classList.add('btn-secondary');
        }
    });

    $('#comentarioModal').modal('show');

    document.getElementById('guardarComentarioBtn').onclick = function() {
        const comentario = document.getElementById('comentarioInput').value;
        db.ref('envios').child(operation.idOperacion).update({ comentario: comentario })
            .then(() => {
                Swal.fire('¡Éxito!', 'Comentario actualizado correctamente.', 'success');
                $('#comentarioModal').modal('hide');
                loadTable(data); // Asegúrate de pasar los datos correctos aquí.
                commentButton.classList.remove('btn-secondary', 'btn-warning');
                commentButton.classList.add('btn-success');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el comentario: ' + error.message, 'error');
            });
    };

    document.getElementById('guardarEmailBtn').onclick = function() {
        const email = document.querySelector('input[type="email"]').value;
        db.ref('envios').child(operation.idOperacion).update({ email: email })
            .then(() => {
                mostrarAlertaExito('Email actualizado correctamente.');
                // Cambiar el estado del botón después de actualizar el email
                commentButton.classList.remove('btn-secondary', 'btn-success');
                commentButton.classList.add('btn-warning');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el email: ' + error.message, 'error');
            });
    };

    document.getElementById('guardarTelefonoBtn').onclick = function() {
        const telefono = document.querySelector('input[type="tel"]').value;
        db.ref('envios').child(operation.idOperacion).update({ Telefono: telefono })
            .then(() => {
                mostrarAlertaExito('Teléfono actualizado correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el teléfono: ' + error.message, 'error');
            });
    };
};
          });
    
            // Paginación y actualización de notificaciones
            updatePagination();
            updateNotificationCount();
        } catch (error) {
            console.error('Error al cargar la tabla:', error);
        }
    }
    
    function actualizarEstadoDespacho(isDespachado) {
        const estadoDespacho = document.getElementById('estadoDespacho');
        if (isDespachado) {
            estadoDespacho.innerHTML = '<i class="bi bi-check-circle-fill"></i> Etiqueta de envío generada';
            estadoDespacho.style.backgroundColor = '#d4edda';
            estadoDespacho.style.color = '#155724';
        } else {
            estadoDespacho.innerHTML = '<i class="bi bi-x-circle-fill"></i> Etiqueta de envío sin generar';
            estadoDespacho.style.backgroundColor = '#f8d7da';
            estadoDespacho.style.color = '#721c24';
        }
    }
    
    function mostrarAlertaExito(mensaje) {
        console.log('Mostrando alerta de éxito:', mensaje); // Verifica que la función se llama
        const alertContainer = document.getElementById('alertContainerFacturacion');
        if (alertContainer) {
            console.log('Contenedor de alertas encontrado:', alertContainer); // Verifica que el contenedor se encuentra
            alertContainer.innerText = `${mensaje} ✅`;
            setTimeout(() => {
                alertContainer.innerText = ''; // Limpiar la alerta después de 3 segundos
            }, 3000);
        } else {
            console.error('Contenedor de alertas no encontrado.');
        }
    }
     
// Actualizar la paginación
function updatePagination() {
    paginationContainer.innerHTML = '';
    const totalItems = allData.length; // Asegúrate de que allData esté disponible
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let startPage = Math.max(1, currentPageGroup + 1);
    let endPage = Math.min(currentPageGroup + 6, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", (e) => {
            e.preventDefault();
            currentPage = i;
            loadTable(allData); // Asegúrate de pasar allData aquí
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
            updatePagination();
            loadTable(allData); // Asegúrate de pasar allData aquí
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
            updatePagination();
            loadTable(allData); // Asegúrate de pasar allData aquí
        });
        paginationContainer.appendChild(backItem);
    }
}

// BUSCADOR
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchFacturacion');
    const searchStatus = document.getElementById('search-status');
    const searchMessage = document.getElementById('search-message');
    const errorMessage = document.querySelector('.error-message');
    const searchTermSpan = document.getElementById('search-term');

    // Evento para borrar el contenido del buscador al hacer clic y llevar a la página 1
    searchInput.addEventListener('focus', function() {
        searchInput.value = '';
        searchTermSpan.textContent = '';
        searchStatus.style.display = 'none';
        searchMessage.textContent = '';
        errorMessage.style.display = 'none';
        currentPage = 1; // Llevar a la página 1
        loadTable(allData); // Volver a cargar todos los datos
    });

    searchInput.addEventListener('input', async function() {
        const searchTerm = searchInput.value.toLowerCase();
        searchTermSpan.textContent = searchTerm;

        if (searchTerm === '') {
            searchStatus.style.display = 'none';
            searchMessage.textContent = '';
            errorMessage.style.display = 'none';
            currentPage = 1; // Llevar a la página 1
            loadTable(allData); // Volver a cargar todos los datos
            return;
        }

        const totalItems = allData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let foundMatch = false;

        searchStatus.style.display = 'flex';

        for (let page = 1; page <= totalPages; page++) {
            currentPage = page;
            searchMessage.textContent = `Estoy buscando en el contenido de la página ${page}...`;
            searchStatus.querySelector('.spinner-ios-ml').style.display = 'block';
            loadTable(allData);
            
            await new Promise(resolve => setTimeout(resolve, 50));

            const tableRows = document.querySelectorAll('#data-table tbody tr');
            const matches = [];

            tableRows.forEach(row => {
                const state = row.cells[0].textContent.toLowerCase();
                const operationId = row.cells[2].textContent.toLowerCase();
                const productName = row.cells[6].textContent.toLowerCase();
                const paymentMethod = row.cells[7].textContent.toLowerCase();

                if (
                    state.includes(searchTerm) || 
                    operationId.includes(searchTerm) || 
                    productName.includes(searchTerm) || 
                    paymentMethod.includes(searchTerm)
                ) {
                    row.style.display = '';
                    matches.push(row);
                } else {
                    row.style.display = 'none';
                }
            });

            if (matches.length > 0) {
                foundMatch = true;
                searchMessage.innerHTML = `¡Coincidencia encontrada en la página ${page}! <i class="bi bi-check-circle-fill"></i>`;
                searchStatus.querySelector('.spinner-ios-ml').style.display = 'none';
                break;
            } else {
                console.log(`No se encontraron coincidencias en la página ${page}.`);
            }
        }

        if (!foundMatch) {
            searchStatus.style.display = 'none';
            errorMessage.style.display = 'flex';
        } else {
            errorMessage.style.display = 'none';
        }
    });
});
// FIN BUSCADOR

// NOTIFICACION DE VENTAS
let lastCheckTimestamp = Date.now();
const checkInterval = 30 * 60 * 1000; // 30 minutos en milisegundos

function checkForNewSales() {
  db.ref('envios').orderByChild('shippingMode').equalTo('me1').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      const newSales = Object.values(data).filter(operation => new Date(operation.dateCreated).getTime() > lastCheckTimestamp);

      if (newSales.length > 0) {
        const message = newSales.length === 1 
          ? `Ingresó 1 nueva venta que no está en planilla` 
          : `Ingresaron ${newSales.length} ventas nuevas que no están en planilla`;
        document.getElementById('notificationMessage').textContent = message;
        document.getElementById('newSalesNotification').style.display = 'block';
        lastCheckTimestamp = Date.now();
      }
    })
    .catch(error => {
      console.error("Error al verificar nuevas ventas: ", error);
    });
}

function closeNotification() {
  document.getElementById('newSalesNotification').style.display = 'none';
}

// Iniciar la verificación cada 5 minutos
setInterval(checkForNewSales, checkInterval);

// Verificar una vez al cargar la página
checkForNewSales();
// FIN NOTIFICACION DE VENTAS

// CONFIRGURAR MONTO PARA PASAR A WEB
$(document).ready(function() {
    $('#inputModal').on('show.bs.modal', function () {
      // Cargar el valor desde Firebase cuando se abre el modal
      const dbRef = firebase.database().ref('PasarAWebMonto');
      dbRef.once('value').then(snapshot => {
        const value = snapshot.val();
        if (value !== null) {
          document.getElementById('numericInput').value = value;
        } else {
          document.getElementById('numericInput').value = '';
        }
      }).catch(error => {
        console.error("Error al cargar el valor: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al cargar el valor.',
        });
      });
    });
  });

  function saveValue() {
    const inputValue = document.getElementById('numericInput').value;

    if (inputValue === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa un valor numérico.',
      });
      return;
    }

    // Pushear el valor a Firebase
    const dbRef = firebase.database().ref('PasarAWebMonto');
    dbRef.set(Number(inputValue))
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: 'El valor ha sido guardado exitosamente.',
        });
        $('#inputModal').modal('hide'); // Cerrar el modal después de guardar
        location.reload();
      })
      .catch(error => {
        console.error("Error al guardar el valor: ", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al guardar el valor.',
        });
      });
  }
  // FIN CONFIRGURAR MONTO PARA PASAR A WEB

  function updateNotificationCount() {
    const count = allData.filter(operation => 
        operation.estadoFacturacion === 'pendiente'|| 
        operation.estadoFacturacion === 'pendiente_no_pasa_web'||
        operation.estadoFacturacion === undefined
    ).length;

    document.getElementById('contadorNotificaciones').textContent = count;
}

// FUNCIONES PARA EL FILTRADO DE ESTADOS

let filteredData = []; // Nueva variable para almacenar los datos filtrados

function loadTable2() {
    const estadoFilter = document.getElementById('estadoFilter').value;

    // Filtrar los datos según el estado seleccionado
    const filteredData = estadoFilter ? allData.filter(operation => operation.estadoFacturacion === estadoFilter) : allData;

    // Calcular los índices de inicio y fin basados en los datos filtrados
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = filteredData.slice(start, end);

    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

    paginatedData.forEach(operation => {
        const row = document.createElement('tr'); 
        
                // Función para mostrar la alerta
                function showAlert(message) {
                    const alertContainer = document.createElement('div');
                    alertContainer.className = 'alert-ios-meli';
                    alertContainer.innerHTML = `
                        <i class="bi bi-clipboard-check"></i>
                        ${message}
                        <button class="close-btn" onclick="this.parentElement.style.display='none';">&times;</button>
                    `;
                    document.body.appendChild(alertContainer);
                
                    setTimeout(() => {
                        alertContainer.style.display = 'none';
                    }, 3000);
                }
                
                // Estado
                const stateCell = document.createElement('td');
                const container = document.createElement('div');
                container.className = 'ios-style-id-container';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                
                const idElement = document.createElement('span');
                idElement.textContent = `${operation.idOperacion}`;
                idElement.classList.add('ios-style-id');
                
                // Verificar si existe operacion.packId y crear el div correspondiente
                if (operation.packId) {
                    const packIdElement = document.createElement('div');
                    packIdElement.textContent = `📦 ${operation.packId}`;
                    packIdElement.classList.add('ios-style-paqId');
                    container.appendChild(packIdElement);
                
                    // Cambiar la clase de idElement si existe packId
                    idElement.classList.add('ios-style-id-2');
                
                    // Agregar evento de clic para copiar packId al portapapeles
                    packIdElement.addEventListener('click', () => {
                        navigator.clipboard.writeText(operation.packId).then(() => {
                            showAlert(`Se ha copiado al portapapeles: PaqId ${operation.packId}`);
                        }).catch(err => {
                            console.error('Error al copiar al portapapeles:', err);
                        });
                    });
                } else {
                    // Mantener la clase original si no existe packId
                    idElement.classList.add('ios-style-id');
                }
                
                // Agregar evento de clic para copiar idOperacion al portapapeles
                idElement.addEventListener('click', () => {
                    navigator.clipboard.writeText(operation.idOperacion).then(() => {
                        showAlert(`Se ha copiado al portapapeles: idOperacion ${operation.idOperacion}`);
                    }).catch(err => {
                        console.error('Error al copiar al portapapeles:', err);
                    });
                });
                
                container.appendChild(idElement);
                stateCell.appendChild(container);
                row.appendChild(stateCell);

        const selectElement = document.createElement('select');
        selectElement.style.width = '100%';
        selectElement.innerHTML = `
            <option value="pendiente">Pendiente ⏳</option>
            <option value="facturado">Facturado ✅</option>
            <option value="cancelado">Cancelado ❌</option>
            <option value="bloqueado">Bloqueado 🔒</option>
            <option value="analizar_pasado_a_web">Web ⚠️</option>
            <option value="pendiente_no_pasa_web">No Pasa ⏳</option>
            <option value="pasado_a_web">Pasado a Web</option>
        `;
        container.appendChild(selectElement);

        // Asegúrate de añadir el contenedor completo al stateCell
        stateCell.appendChild(container);
        row.appendChild(stateCell);

        // Establecer el estado inicial desde Firebase
        const currentState = operation.estadoFacturacion || 'pendiente'; // Valor por defecto 'pendiente'
        selectElement.value = currentState;

        // Cambiar el color de fondo de la fila según el estado
        switch (currentState) {
            case 'pendiente':
                row.style.backgroundColor = 'white';
                break;
            case 'facturado':
                row.style.backgroundColor = 'lightgreen';
                break;
            case 'bloqueado':
                row.style.backgroundColor = 'grey';
                break;
            case 'cancelado':
                row.style.backgroundColor = 'pink';
                break;
            case 'pasado_a_web':
                row.style.backgroundColor = 'lightblue';
                break;
            case 'analizar_pasado_a_web':
                row.style.backgroundColor = 'lightyellow';
                break;
            default:
                row.style.backgroundColor = 'white';
        }

        // Cambiar el color de fondo de la fila al cambiar el valor del select
        selectElement.addEventListener('change', function() {
            switch (selectElement.value) {
                case 'pendiente':
                    row.style.backgroundColor = 'white';
                    break;
                case 'facturado':
                    row.style.backgroundColor = 'lightgreen';
                    break;
                case 'bloqueado':
                    row.style.backgroundColor = 'grey';
                    break;
                case 'cancelado':
                    row.style.backgroundColor = 'pink';
                    break;
                case 'pasado_a_web':
                    row.style.backgroundColor = 'lightblue';
                    break;
                case 'analizar_pasado_a_web':
                    row.style.backgroundColor = 'lightyellow';
                    break;
                default:
                    row.style.backgroundColor = 'white';
            }

            // Actualizar el estado en Firebase
            const operationId = operation.idOperacion; // Usa el ID único de la operación
            db.ref('envios/' + operationId).update({ estadoFacturacion: selectElement.value })
                .then(() => {
                    console.log(`Estado de facturación actualizado a ${selectElement.value} para la operación ${operationId}`);
                })
                .catch(error => {
                    console.error("Error al actualizar el estado de facturación:", error);
                });
        });

        // Fecha y hora
        const dateCell = document.createElement('td');
        dateCell.innerHTML = `<strong>${formatDate(operation.dateCreated)}</strong>, ${formatTime(operation.dateCreated)}`;
        row.appendChild(dateCell);

        // Operación
        const operationCell = document.createElement('td');
        const operationId = operation.idOperacion.toString().replace('200001', '');
        operationCell.innerHTML = `
            <a href="https://www.mercadolibre.com.ar/ventas/${operation.idOperacion}/detalle" target="_blank"><img id="Meli-trends" src="./Img/meli-trends.png" alt="Meli Trends"></a>
        `;
        row.appendChild(operationCell);

        // Imagen
        const imageCell = document.createElement('td');
        imageCell.innerHTML = `
            <a href="https://app.real-trends.com/orders/sale_detail/?order_id=200001${operationId}" target="_blank">
                <img id="real-trends" src="./Img/real-trends.png" alt="Real Trends">
            </a>
        `;
        row.appendChild(imageCell);

        // Valor
        const valueCell = document.createElement('td');
        const transactionAmount = operation.payments[0]?.transaction_amount || 0;
        valueCell.innerHTML = `<strong style="color: green;">${formatCurrency(transactionAmount)}</strong>`;
        row.appendChild(valueCell);

        // Verificar y actualizar el estado si el monto es mayor o igual a PasarAWebMonto
        if (transactionAmount >= pasarAWebMonto && (currentState === 'pendiente' || currentState === 'analizar_pasado_a_web' || currentState === undefined)) {
            selectElement.value = 'analizar_pasado_a_web';
            db.ref('envios/' + operation.idOperacion).update({ estadoFacturacion: 'analizar_pasado_a_web' })
                .then(() => {
                    console.log(`Estado actualizado a analizar_pasado_a_web para la operación ${operation.idOperacion}`);
                    updateRowColor(); // Llamar a updateRowColor después de actualizar el estado
                    updateNotificationCount();
                })
                .catch(error => {
                    console.error("Error al actualizar el estado de facturación:", error);
                });
        }

        // Cambiar el color de fondo de la fila según el estado
        const updateRowColor = () => {
            switch (selectElement.value) {
                case 'pendiente':
                    row.style.backgroundColor = 'white';
                    break;
                case 'facturado':
                    row.style.backgroundColor = 'lightgreen';
                    break;
                case 'bloqueado':
                    row.style.backgroundColor = 'wheat';
                    break;
                case 'cancelado':
                    row.style.backgroundColor = 'pink';
                    break;
                case 'pasado_a_web':
                    row.style.backgroundColor = 'lightblue';
                    break;
                case 'analizar_pasado_a_web':
                    row.style.backgroundColor = 'lightyellow';
                    break;
                default:
                    row.style.backgroundColor = 'white';
            }
        };
        updateRowColor();
        updateNotificationCount();

        // Escuchar cambios en el select para actualizar el color
        selectElement.addEventListener('change', () => {
            updateRowColor();
        });

        // Envío
        const shippingCell = document.createElement('td');
        const shippingCost = operation.payments[0]?.shipping_cost || 0;
        shippingCell.style.whiteSpace = 'nowrap';

        // Verifica el estado de manera segura
// Verifica el estado de manera segura
if (operation.client && operation.client.billing_info && Array.isArray(operation.client.billing_info.additional_info)) {
    const stateName = operation.client.billing_info.additional_info.find(info => info.type === "STATE_NAME")?.value;

    if (["Jujuy", "Misiones", "Tierra del Fuego"].includes(stateName)) {
        shippingCell.innerHTML = `<strong class="alerta">⚠️ ${stateName.toUpperCase()}</strong>`;
    } else {
        shippingCell.innerHTML = shippingCost === 0 
            ? `<strong class="grauito" style="color: orangered;">GRATUITO</strong>` 
            : `<strong style="color: rgb(52,152,219);">${formatCurrency(shippingCost)}</strong>`;
    }
} else {
    console.warn("Información de facturación no disponible para la operación:", operation.idOperacion);
    shippingCell.innerHTML = `<strong style="color: red;">X</strong>`;
}

        row.appendChild(shippingCell);

                // Producto
                const productCell = document.createElement('td');
                productCell.className = 'product-cell';
                productCell.innerHTML = `Cantidad: <strong>X${operation.Cantidad}</strong> <br> SKU: <strong>${operation.SKU}</strong>`;
                row.appendChild(productCell);
                
                // Agregar evento de clic para abrir el modal con el carrusel de imágenes
                productCell.addEventListener('click', () => {
                    // Verificar si operation.pictures existe y es un array
                    const filteredPictures = Array.isArray(operation.pictures) ? 
                        operation.pictures.filter(picture => picture.secure_url) : [];
                
                    // Crear el carrusel
                    const carouselInner = document.getElementById('carouselInner');
                    carouselInner.innerHTML = ''; // Limpiar el contenido anterior del carrusel
                
                    filteredPictures.forEach((picture, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                        carouselItem.innerHTML = `
                            <img src="${picture.secure_url}" class="d-block mx-auto" alt="Imagen ${index + 1}" style="height: 150px; width: auto; max-width: 100%; object-fit: cover;">
                        `;
                        carouselInner.appendChild(carouselItem);
                    });
                
                    // Limpiar el contenido anterior del productInfo
                    const modalBody = document.querySelector('#productModal .modal-body');
                    const existingProductInfo = modalBody.querySelector('.macos-style-producto-meli');
                    if (existingProductInfo) {
                        existingProductInfo.remove();
                    }
                
                    // Agregar el div con la clase macos-style-producto-meli encima del carrusel
                    const productInfo = document.createElement('div');
                    productInfo.className = 'macos-style-producto-meli';
                    productInfo.innerHTML = `<i class="bi bi-info-circle-fill"></i> Producto: X ${operation.Cantidad} <strong style="color: white;">${operation.SKU}</strong> ${operation.Producto}`;
                    
                    // Agregar el productInfo y el carrusel al modal
                    modalBody.insertBefore(productInfo, modalBody.firstChild);
                
                    // Mostrar el modal
                    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
                    productModal.show();
                });

        // Medio de pago
        const paymentCell = document.createElement('td');
        const payment = operation.payments[0];

        let paymentMethodImage = '';
        let paymentDetails = '';

        switch (payment.payment_method_id) {
            case 'consumer_credits':
                paymentMethodImage = './Img/mercadocredito.png';
                paymentDetails = '<strong>Crédito sin tarjeta</strong>';
                break;
            case 'account_money':
                paymentMethodImage = './Img/mercadopago.png';
                paymentDetails = '<strong>Dinero en Cuenta</strong>';
                break;
            case 'visa':
            case 'debvisa':
                paymentMethodImage = './Img/visa.png';
                break;
            case 'master':
            case 'debmaster':
                paymentMethodImage = './Img/master.png';
                break;
            case 'amex':
                paymentMethodImage = './Img/amex.png';
                break;
            case 'naranja':
                paymentMethodImage = './Img/naranja.png';
                break;
            case 'cabal':
            case 'debcabal':
                paymentMethodImage = './Img/cabal.png';
                break;
            case 'pagofacil':
                paymentMethodImage = './Img/pagofacil.png';
                paymentDetails = '<strong>PagoFacil Ticket</strong>';
                break;
            case 'rapipago':
                paymentMethodImage = './Img/rapipago.png';
                paymentDetails = '<strong>RapiPago Ticket</strong>';
                break;
        }

        if (payment.payment_method_id !== 'consumer_credits' && payment.payment_method_id !== 'account_money' && payment.payment_method_id !== 'pagofacil' && payment.payment_method_id !== 'rapipago') {
            const paymentType = payment.payment_type === 'credit_card' ? '<strong>Crédito</strong>' : payment.payment_type === 'debit_card' ? '<strong>Débito</strong>' : payment.payment_type;
            paymentDetails = `${paymentType} en ${payment.installments} cuota/s de ${formatCurrency(payment.installment_amount)}`;
        }

        paymentCell.innerHTML = `
            <div class="payment-cell">
                <img src="${paymentMethodImage}" alt="${payment.payment_method_id}">
                <span class="payment-details">${paymentDetails}</span>
            </div>
        `;
        row.appendChild(paymentCell);

        // Botón para eliminar
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'X';
        deleteButton.className = 'btn btn-sm btn-danger';
        deleteButton.onclick = () => {
            const row = deleteButton.closest('tr'); // Obtener la fila más cercana

            Swal.fire({
                title: 'Ingrese la contraseña 🔒',
                input: 'password',
                inputLabel: 'Contraseña de Eliminación (Solicítela a Lucas)',
                showCancelButton: true,
                confirmButtonText: 'Eliminar',
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                    if (value !== '6572') {
                        return 'Contraseña incorrecta!';
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Eliminar el nodo en Firebase
                    db.ref('envios/' + operation.idOperacion).remove()
                        .then(() => {
                            row.remove(); // Eliminar la fila del DOM
                            Swal.fire('¡Eliminado!', 'La fila ha sido eliminada.', 'success');
                        })
                        .catch(error => {
                            Swal.fire('Error', 'No se pudo eliminar la fila. ' + error.message, 'error');
                        });
                }
            });
        };

        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

// Agregar la fila a la tabla
tableBody.appendChild(row);

// TRACKING CONTROL
    // Botón para verificar si fue enviado
    const trackingCell = document.createElement('td');
    const trackingButton = document.createElement('button');
    trackingButton.type = 'button';
    trackingButton.className = operation.trackingNumber ? 'btn btn-sm btn-success' : 'btn btn-sm btn-dark disabled'; // Verde si existe, rojo si no
    trackingButton.innerHTML = '<i class="bi bi-truck-front-fill"></i>';

    // Solo agregar tooltip si hay un trackingNumber
    if (operation.trackingNumber) {
        trackingButton.setAttribute('data-bs-toggle', 'tooltip');
        trackingButton.setAttribute('data-bs-placement', 'top');
        trackingButton.setAttribute('data-bs-custom-class', 'custom-tooltip');
        trackingButton.setAttribute('data-bs-title', `${operation.transportCompany}: ${operation.trackingNumber} <a href="${operation.trackingLink}" target="_blank" style="color: white;">Ver seguimiento</a>`);
        
        // Inicializar el tooltip
        const tooltip = new bootstrap.Tooltip(trackingButton, {
            html: true // Permitir HTML en el tooltip
        });

        // Mostrar el tooltip de manera permanente para pruebas
        tooltip.show();
    }

    // Agregar el botón a la celda
    trackingCell.appendChild(trackingButton);
    row.appendChild(trackingCell);
// FIN TRACKING CONTROL

// Botón de comentario
const commentCell = document.createElement('td');
const commentButton = document.createElement('button');

// Inicializar la clase del botón según los datos disponibles
if (operation.comentario) {
    commentButton.className = 'btn btn-sm btn-success';
} else if (operation.email) {
    commentButton.className = 'btn btn-sm btn-warning';
} else {
    commentButton.className = 'btn btn-sm btn-secondary';
}

commentButton.innerHTML = '<i class="bi bi-pencil"></i>';
commentCell.appendChild(commentButton);
row.appendChild(commentCell);

// Agregar la fila a la tabla
tableBody.appendChild(row);

commentButton.onclick = () => {
    console.log('ID de operación:', operation ? operation.idOperacion : 'undefined');

    if (!operation || !operation.idOperacion) {
        Swal.fire('Error', 'No se puede cargar el comentario: operación no válida.', 'error');
        return;
    }

    // Cargar los datos existentes desde Firebase
    db.ref('envios').child(operation.idOperacion).once('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('comentarioInput').value = data.comentario || '';
            document.querySelector('input[type="email"]').value = data.email || '';
            document.querySelector('input[type="tel"]').value = data.Telefono || '';

            // Verificar si existe el trackingNumber
            if (data.trackingNumber) {
                actualizarEstadoDespacho(true);
            } else {
                actualizarEstadoDespacho(false);
            }
        } else {
            document.getElementById('comentarioInput').value = '';
            document.querySelector('input[type="email"]').value = '';
            document.querySelector('input[type="tel"]').value = '';
            actualizarEstadoDespacho(false);
        }
    });

    $('#comentarioModal').modal('show');

    document.getElementById('guardarComentarioBtn').onclick = function() {
        const comentario = document.getElementById('comentarioInput').value;
        db.ref('envios').child(operation.idOperacion).update({ comentario: comentario })
            .then(() => {
                Swal.fire('¡Éxito!', 'Comentario actualizado correctamente.', 'success');
                $('#comentarioModal').modal('hide');
                loadTable();
                commentButton.classList.remove('btn-secondary'); 
                commentButton.classList.add('btn-success'); 
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el comentario: ' + error.message, 'error');
            });
    };

    document.getElementById('guardarEmailBtn').onclick = function() {
        const email = document.querySelector('input[type="email"]').value;
        db.ref('envios').child(operation.idOperacion).update({ email: email })
            .then(() => {
                mostrarAlertaExito('Email actualizado correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el email: ' + error.message, 'error');
            });
    };

    document.getElementById('guardarTelefonoBtn').onclick = function() {
        const telefono = document.querySelector('input[type="tel"]').value;
        db.ref('envios').child(operation.idOperacion).update({ Telefono: telefono })
            .then(() => {
                mostrarAlertaExito('Teléfono actualizado correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el teléfono: ' + error.message, 'error');
            });
    };
};

function actualizarEstadoDespacho(isDespachado) {
    const estadoDespacho = document.getElementById('estadoDespacho');
    if (isDespachado) {
        estadoDespacho.innerHTML = '<i class="bi bi-check-circle-fill"></i> Etiqueta de envío generada';
        estadoDespacho.style.backgroundColor = '#d4edda';
        estadoDespacho.style.color = '#155724';
    } else {
        estadoDespacho.innerHTML = '<i class="bi bi-x-circle-fill"></i> Etiqueta de envío sin generar';
        estadoDespacho.style.backgroundColor = '#f8d7da';
        estadoDespacho.style.color = '#721c24';
    }
}

function mostrarAlertaExito(mensaje) {
    console.log('Mostrando alerta de éxito:', mensaje); // Verifica que la función se llama
    const alertContainer = document.getElementById('alertContainerFacturacion');
    if (alertContainer) {
        console.log('Contenedor de alertas encontrado:', alertContainer); // Verifica que el contenedor se encuentra
        alertContainer.innerText = `${mensaje} ✅`;
        setTimeout(() => {
            alertContainer.innerText = ''; // Limpiar la alerta después de 3 segundos
        }, 3000);
    } else {
        console.error('Contenedor de alertas no encontrado.');
    }
}
        commentCell.appendChild(commentButton);
        row.appendChild(commentCell);

        tableBody.appendChild(row);
    });
    updateNotificationCount();
updatePagination2(filteredData.length); // Actualizar la paginación con el nuevo tamaño de datos
}

function updatePagination2(totalItems) {
paginationContainer.innerHTML = '';
const totalPages = Math.ceil(totalItems / itemsPerPage);
let startPage = Math.max(1, currentPageGroup + 1);
let endPage = Math.min(currentPageGroup + 6, totalPages);

for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        loadTable2();
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
        updatePagination2(totalItems);
        loadTable2();
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
        updatePagination2(totalItems);
        loadTable2();
    });
    paginationContainer.appendChild(backItem);
}
}

// Asegúrate de reiniciar currentPage y currentPageGroup al cambiar el filtro
document.getElementById('estadoFilter').addEventListener('change', function() {
currentPage = 1; // Reiniciar a la primera página
currentPageGroup = 0; // Reiniciar el grupo de páginas
loadTable2(); // Recargar la tabla cada vez que cambie el filtro
});

document.getElementById('estadoFilter').addEventListener('change', function() {
    loadTable2(); // Recargar la tabla cada vez que cambie el filtro
});

// Manejador para el botón "Pendientes"
document.getElementById('btnNotificaciones').addEventListener('click', function() {
    loadTable2(); // Recargar la tabla cada vez que cambie el filtro
});

// Listener para cambiar el estado y recargar la tabla
document.getElementById('estadoFilter').addEventListener('change', function() {
    const selectedValue = this.getAttribute('data-selected-value') || '';
    loadTable2(selectedValue); // Pasamos el valor seleccionado como argumento
});

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
// FIN NOTIFICADOR DE COMENTARIO EN FACTURACION
*/