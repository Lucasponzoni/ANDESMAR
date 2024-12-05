// Función para mostrar el spinner
function mostrarSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-success';
    spinner.role = 'status';
    
    const spinnerContainer = document.createElement('div');
    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(document.createTextNode(' Esperando...'));

    document.getElementById('valor-cotizacion2').innerHTML = ''; // Limpiar el valor anterior
    document.getElementById('valor-cotizacion2').appendChild(spinnerContainer);
}

// Función para ocultar el spinner y mostrar el resultado
function ocultarSpinner(importeTotal, errorMessage = '') {
    const valorCotizacion = document.getElementById('valor-cotizacion2');
    const totalConIva = importeTotal * 1.21; // Sumar 21% de IVA

    // Si hay un mensaje de error específico, mostrar "Sin Cobertura"
    if (errorMessage === "ERRORNo es posible realizar el envío hacia el destino seleccionado.") {
        valorCotizacion.innerHTML = "Sin Cobertura"; // Mostrar mensaje de sin cobertura
        return;
    }

    // Si el importe total es $0,00, mostramos el spinner
    if (totalConIva === 0) {
        mostrarSpinner(); // Mantener el spinner visible
    } else {
        valorCotizacion.innerHTML = formatCurrency(totalConIva); // Actualizar con el valor total formateado
    }
}

// Función para formatear el número a pesos argentinos
function formatCurrency(value) {
    return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Función para manejar los cambios en provincia y volumen
function manejarCambio() {
    const provinciaElement = document.getElementById('nombre-provincia');
    const volumenElement = document.getElementById('volumenTotal');

    if (!provinciaElement || !volumenElement) {
        console.error("Elementos de provincia o volumen no encontrados.");
        return;
    }

    const provincia = provinciaElement.innerText.toLowerCase();
    const volumen = parseFloat(volumenElement.innerText);

    // Mostrar spinner si los inputs están vacíos
    mostrarSpinner();

    // Verificar si la provincia y el volumen son válidos
    if (!provincia || isNaN(volumen)) {
        // Mantener el spinner visible y no cambiar a "No disponible"
        return;
    }

    setTimeout(() => {
        buscarPrecio(provincia, volumen);
    }, 1000); // Retraso de 1 segundo
}

// Función para buscar el precio (puedes adaptar esta función según tu lógica)
async function buscarPrecio(provincia, volumen) {
    // Aquí puedes agregar la lógica para llamar a la API y calcular el monto
    console.log(`Buscando precio para provincia: ${provincia}, volumen: ${volumen}`);
    // Llama a la función calcularMonto o la lógica que necesites aquí
    await calcularMonto(); // Asegúrate de que calcularMonto esté adaptada para usar estos parámetros
}

// Event listener para cargar la página
document.addEventListener('DOMContentLoaded', () => {
    manejarCambio();
});

// Observador para cambios en la provincia
const provinciaElement = document.getElementById('nombre-provincia');
if (provinciaElement) {
    const observerProvincia = new MutationObserver(manejarCambio);
    observerProvincia.observe(provinciaElement, { childList: true, subtree: true });
} else {
    console.error("Elemento 'nombre-provincia' no encontrado.");
}

// Observador para cambios en el volumen
const volumenElement = document.getElementById('volumenTotal');
if (volumenElement) {
    const observerVolumen = new MutationObserver(manejarCambio);
    observerVolumen.observe(volumenElement, { childList: true, subtree: true });
} else {
    console.error("Elemento 'volumenTotal' no encontrado.");
}

// Función para calcular el monto
async function calcularMonto() {
    const codigoPostalDestinatario = document.getElementById('codigoPostalDestinatario').value;
    const peso = parseFloat(document.getElementById('peso').value) || 0;
    const valorDeclarado = parseFloat(document.getElementById('valorDeclarado').value) || 0;
    const volumenElement = document.getElementById('volumenTotal');
    const m3 = parseFloat(volumenElement.innerText) || 0;

    // Verificar que los campos requeridos no estén vacíos
    if (!codigoPostalDestinatario || !peso || !valorDeclarado || m3 <= 0) {
        console.log("Faltan datos necesarios. No se realiza la solicitud.");
        ocultarSpinner(0); // Si falta algún dato, ocultar el spinner y no hacer la solicitud
        return;
    }

    mostrarSpinner();
    console.log("Datos listos. Iniciando solicitud a la API...");

    const bultosContainer = document.getElementById('medidasBultosContainer');
    let bultoCount = 0; // Inicializar contador de bultos

    // Obtener las dimensiones de los bultos
    const alto = [];
    const ancho = [];
    const largo = [];

    Array.from(bultosContainer.children).forEach(bulto => {
        const cantidad = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; // Contar bultos
        bultoCount += cantidad; // Sumar la cantidad de bultos

        alto.push(parseFloat(bulto.querySelector(`input[name^="Alto"]`).value) || 0);
        ancho.push(parseFloat(bulto.querySelector(`input[name^="Ancho"]`).value) || 0);
        largo.push(parseFloat(bulto.querySelector(`input[name^="Largo"]`).value) || 0);
    });

    const requestBody = {
        "CodigoPostalRemitente": "2000",
        "CodigoPostalDestinatario": codigoPostalDestinatario,
        "Bultos": bultoCount,
        "Peso": peso,
        "ValorDeclarado": valorDeclarado,
        "M3": m3,
        "Alto": alto,
        "Ancho": ancho,
        "Largo": largo,
        "ModalidadEntregaID": 2,
        "servicio": {
            "EsFletePagoDestino": false,
            "EsRemitoconformado": true
        },
        "logueo": {
            "Usuario": "BOM6765",
            "Clave": "BOM6765",
            "CodigoCliente": "6765"
        },
        "CodigoAgrupacion": 12
    };

    try {
        console.log("Enviando solicitud a la API...");
        console.log(`Datos enviados a API Andesmar (Cotizaor):`, requestBody);
        const response = await fetch('https://proxy.cors.sh/https://apitest.andesmarcargas.com/api/CalcularMonto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Respuesta de la API:", data);

        if (data.Codigo === "200") {
            ocultarSpinner(data.ImporteTotal);
            console.log(`Cotización obtenida: $ ${data.ImporteTotal}`);
        } else {
            ocultarSpinner(0, data.Error); // Pasar el mensaje de error
            console.error('Error:', data.Error);
        }
    } catch (error) {
        ocultarSpinner(0); // Si es 0 muestra Spinner
        console.error('Error en la solicitud:', error);
    }
}
