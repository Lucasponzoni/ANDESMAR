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
    const searchInput = document.getElementById('searchFacturacion');
    const spinner = document.getElementById('spinner'); // Asegúrate de que el spinner tenga este ID

    // Mostrar mensaje de carga en el buscador
    searchInput.value = "Aguardando que cargue la web ⏳";
    searchInput.disabled = true; // Deshabilitar el input mientras carga
    spinner.style.display = 'block'; // Mostrar spinner

    // Cargar datos desde Firebase
    db.ref('envios').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            const tableBody = document.querySelector('#data-table tbody');

            // Limpiar la tabla antes de cargar nuevos datos
            tableBody.innerHTML = '';

            // Convertir a array y filtrar por shippingMode 'me1'
            allData = Object.values(data)
                .filter(operation => operation.shippingMode === 'me1') // Filtrar por shippingMode
                .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

            // Mostrar datos en la tabla
            loadTable();

            // Habilitar buscador y limpiar mensaje
            searchInput.disabled = false;
            searchInput.value = ""; // Limpiar el mensaje al finalizar la carga
            spinner.style.display = 'none'; // Ocultar spinner
        })
        .catch(error => {
            console.error("Error al cargar datos: ", error);
            searchInput.value = "Error al cargar datos"; // Mensaje de error
            searchInput.disabled = false; // Habilitar el input en caso de error
            spinner.style.display = 'none'; // Ocultar spinner en caso de error
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

// Función para cargar la tabla con paginación
function loadTable() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = allData.slice(start, end);
    const tableBody = document.querySelector('#data-table tbody');

    tableBody.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

    paginatedData.forEach(operation => {
        const row = document.createElement('tr');
    
        // Estado
        const stateCell = document.createElement('td');
        const selectElement = document.createElement('select');
        selectElement.style.width = '130%';
        selectElement.innerHTML = `
            <option value="pendiente">Pendiente ⏳</option>
            <option value="facturado">Facturado ✅</option>
            <option value="cancelado">Cancelado ❌</option>
            <option value="Bloqueado">Bloqueado 🔒</option>
            <option value="analizar_pasado_a_web">Web ⚠️</option>
            <option value="pendiente_no_pasa_web">No Pasa ⏳</option>
            <option value="pasado_a_web">Pasado a Web</option>
            
        `;
        stateCell.appendChild(selectElement);
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
            case 'Bloqueado':
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

        // Cambiar el color de fondo de la fila al cambiar el valor del select
        selectElement.addEventListener('change', function() {
            switch (selectElement.value) {
                case 'pendiente':
                row.style.backgroundColor = 'white';
                break;
            case 'facturado':
                row.style.backgroundColor = 'lightgreen';
                break;
            case 'Bloqueado':
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
        const operationId = operation.idOperacion.toString().replace('200000', '');
        operationCell.innerHTML = `
            <a href="https://www.mercadolibre.com.ar/ventas/${operation.idOperacion}/detalle" target="_blank"><img id="Meli-trends" src="./Img/meli-trends.png" alt="Meli Trends"></a>
        `;
        row.appendChild(operationCell);

        // Imagen
        const imageCell = document.createElement('td');
        imageCell.innerHTML = `
        <a href="https://app.real-trends.com/orders/sale_detail/?order_id=200000${operationId}" target="_blank">
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
        })
        .catch(error => {
            console.error("Error al actualizar el estado de facturación:", error);
        });
} else if (transactionAmount < pasarAWebMonto && currentState === 'analizar_pasado_a_web') {
    selectElement.value = 'pendiente';
    db.ref('envios/' + operation.idOperacion).update({ estadoFacturacion: 'pendiente' })
        .then(() => {
            console.log(`Estado revertido a pendiente para la operación ${operation.idOperacion}`);
            updateRowColor(); // Llamar a updateRowColor después de actualizar el estado
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

// Escuchar cambios en el select para actualizar el color
selectElement.addEventListener('change', () => {
    updateRowColor();
});


        // Envío
        const shippingCell = document.createElement('td');
        const shippingCost = operation.payments[0]?.shipping_cost || 0;
        shippingCell.style.whiteSpace = 'nowrap';
        shippingCell.innerHTML = shippingCost === 0 
            ? `<strong class="grauito" style="color: orangered;">GRATUITO</strong>` 
            : `<strong style="color: rgb(52,152,219);">${formatCurrency(shippingCost)}</strong>`;
        row.appendChild(shippingCell);

        // Producto
        const productCell = document.createElement('td');
        productCell.className = 'product-cell'; // Añadir clase para estilo iOS
        productCell.innerHTML = `Cantidad: <strong>X${operation.Cantidad}</strong> <br> SKU: <strong>${operation.SKU}</strong>`;
        row.appendChild(productCell);


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

// Botón de comentario
const commentCell = document.createElement('td');
const commentButton = document.createElement('button');
commentButton.className = 'btn btn-sm ' + (operation.comentario ? 'btn-success' : 'btn-secondary');
commentButton.innerHTML = '<i class="bi bi-pencil"></i>';
commentCell.appendChild(commentButton);
row.appendChild(commentCell);

// Agregar la fila a la tabla
tableBody.appendChild(row);

commentButton.onclick = () => {
    console.log('ID de operación:', operation ? operation.idOperacion : 'undefined');

    // Verificar si operation y operation.idOperacion están definidos
    if (!operation || !operation.idOperacion) {
        Swal.fire('Error', 'No se puede cargar el comentario: operación no válida.', 'error');
        return;
    }

    // Cargar el comentario, email y teléfono existentes desde Firebase
    db.ref('envios').child(operation.idOperacion).once('value', snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('comentarioInput').value = data.comentario || ''; // Cargar comentario existente
            document.querySelector('input[type="email"]').value = data.email || ''; // Cargar email existente
            document.querySelector('input[type="tel"]').value = data.Telefono || ''; // Cargar teléfono existente
        } else {
            document.getElementById('comentarioInput').value = ''; // Limpiar el input
            document.querySelector('input[type="email"]').value = ''; // Limpiar el input de email
            document.querySelector('input[type="tel"]').value = ''; // Limpiar el input de teléfono
        }
    });

    // Mostrar el modal
    $('#comentarioModal').modal('show');

    // Manejar el clic en el botón para guardar el comentario
    document.getElementById('guardarComentarioBtn').onclick = function() {
        const comentario = document.getElementById('comentarioInput').value;

        // Actualizar el comentario en Firebase
        db.ref('envios').child(operation.idOperacion).update({ comentario: comentario })
            .then(() => {
                Swal.fire('¡Éxito!', 'Comentario actualizado correctamente.', 'success');
                $('#comentarioModal').modal('hide'); // Cerrar modal
                loadTable(); // Recargar la tabla

                // Cambiar el botón a success
                commentButton.classList.remove('btn-secondary'); 
                commentButton.classList.add('btn-success'); 
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el comentario: ' + error.message, 'error');
            });
    };

    // Manejar el clic en el botón para guardar el email
    document.getElementById('guardarEmailBtn').onclick = function() {
        const email = document.querySelector('input[type="email"]').value;

        // Actualizar el email en Firebase
        db.ref('envios').child(operation.idOperacion).update({ email: email })
            .then(() => {
                mostrarAlertaExito('Email actualizado correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el email: ' + error.message, 'error');
            });
    };

    // Manejar el clic en el botón para guardar el teléfono
    document.getElementById('guardarTelefonoBtn').onclick = function() {
        const telefono = document.querySelector('input[type="tel"]').value;

        // Actualizar el teléfono en Firebase
        db.ref('envios').child(operation.idOperacion).update({ Telefono: telefono })
            .then(() => {
                mostrarAlertaExito('Teléfono actualizado correctamente.');
            })
            .catch(error => {
                Swal.fire('Error', 'No se pudo actualizar el teléfono: ' + error.message, 'error');
            });
    };
};

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

    });

    // Paginación
    updatePagination();
}

// Actualizar la paginación
function updatePagination() {
    paginationContainer.innerHTML = '';
    const totalItems = allData.length;
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
            loadTable();
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
            loadTable();
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
            loadTable();
        });
        paginationContainer.appendChild(backItem);
    }
}

// BUSCADOR
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFacturacion');
    const tableBody = document.querySelector('#data-table tbody');
    const pagination = document.getElementById('pagination');
    const errorContainer = document.querySelector('.error-message');
    const searchTermDisplay = document.getElementById('search-term'); // Añade esta línea

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');
        let hasVisibleRows = false;

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let rowVisible = false;

            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                if (cell) {
                    const cellText = cell.textContent || cell.innerText;
                    if (cellText.toLowerCase().includes(filter)) {
                        rowVisible = true;
                        break;
                    }
                }
            }

            if (rowVisible) {
                rows[i].style.display = ""; // Muestra la fila
                hasVisibleRows = true;
            } else {
                rows[i].style.display = "none"; // Oculta la fila
            }
        }

        // Manejo de la paginación
        pagination.style.display = filter ? "none" : "";

        // Manejo del mensaje de error
        if (filter) {
            if (!hasVisibleRows) {
                searchTermDisplay.textContent = filter; // Actualiza el contenido del input en el mensaje de error
                errorContainer.style.display = ''; // Mostrar mensaje de error
                tableBody.parentElement.style.display = 'none'; // Ocultar la tabla
            } else {
                errorContainer.style.display = 'none'; // Ocultar mensaje de error
                tableBody.parentElement.style.display = ''; // Mostrar la tabla
            }
        } else {
            errorContainer.style.display = 'none'; // Ocultar mensaje de error si el input está vacío
            tableBody.parentElement.style.display = ''; // Mostrar la tabla
        }
    });
});
// FIN BUSCADOR

// BUSCADOR
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchFacturacion');
    const tableBody = document.querySelector('#data-table tbody');
    const pagination = document.getElementById('pagination');
    const errorContainer = document.querySelector('.error-message');
    const searchTermDisplay = document.getElementById('search-term'); // Añade esta línea

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');
        let hasVisibleRows = false;

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let rowVisible = false;

            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                if (cell) {
                    const cellText = cell.textContent || cell.innerText;
                    if (cellText.toLowerCase().includes(filter)) {
                        rowVisible = true;
                        break;
                    }
                }
            }

            if (rowVisible) {
                rows[i].style.display = ""; // Muestra la fila
                hasVisibleRows = true;
            } else {
                rows[i].style.display = "none"; // Oculta la fila
            }
        }

        // Manejo de la paginación
        pagination.style.display = filter ? "none" : "";

        // Manejo del mensaje de error
        if (filter) {
            if (!hasVisibleRows) {
                searchTermDisplay.textContent = filter; // Actualiza el contenido del input en el mensaje de error
                errorContainer.style.display = ''; // Mostrar mensaje de error
                tableBody.parentElement.style.display = 'none'; // Ocultar la tabla
            } else {
                errorContainer.style.display = 'none'; // Ocultar mensaje de error
                tableBody.parentElement.style.display = ''; // Mostrar la tabla
            }
        } else {
            errorContainer.style.display = 'none'; // Ocultar mensaje de error si el input está vacío
            tableBody.parentElement.style.display = ''; // Mostrar la tabla
        }
    });
});
// FIN BUSCADOR

let lastCheckTimestamp = Date.now();
const checkInterval = 5 * 60 * 1000; // 5 minutos en milisegundos

function checkForNewSales() {
  db.ref('envios').orderByChild('shippingMode').equalTo('me1').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      const newSales = Object.values(data).filter(operation => new Date(operation.dateCreated).getTime() > lastCheckTimestamp);

      if (newSales.length > 0) {
        document.getElementById('notificationMessage').textContent = `Ingresaron ${newSales.length} ventas ME1 nuevas que no están en planilla`;
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