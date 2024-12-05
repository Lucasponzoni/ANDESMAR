document.addEventListener('DOMContentLoaded', () => {
    const cliente = "0012007490";
    const sucursalOrigen = "PRC";
    const cpDestinoInput = document.getElementById('codigoPostalDestinatario');
    const valorDeclaradoInput = document.getElementById('valorDeclarado');
    const volumenTotalElement = document.getElementById('volumenTotalcm');
    const pesoInput = document.getElementById('peso');
    const valorCotizacionElement = document.getElementById('valor-cotizacion');
    
    // Crear el spinner de Bootstrap con texto "Esperando..."
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-success';
    spinner.role = 'status';
    spinner.innerHTML = '<span class="visually-hidden">Cargando...</span>';
    
    const spinnerContainer = document.createElement('div');
    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(document.createTextNode(' Esperando...'));

    // Función para mostrar el spinner y mensaje
    const mostrarSpinner = () => {
        if (!valorCotizacionElement.contains(spinnerContainer)) {
            valorCotizacionElement.innerHTML = ''; // Limpia el contenido actual
            valorCotizacionElement.appendChild(spinnerContainer);
        }
    };

    // Función para ocultar el spinner
    const ocultarSpinner = () => {
        if (valorCotizacionElement.contains(spinnerContainer)) {
            valorCotizacionElement.removeChild(spinnerContainer);
        }
    };

    // Función para verificar si todos los campos obligatorios están completos
    const todosLosCamposCompletos = () => {
        const cpDestino = cpDestinoInput.value.trim();
        const volumen = parseFloat(volumenTotalElement.textContent) || 0;
        const peso = parseFloat(pesoInput.value) || 0;
        return cpDestino && volumen > 0 && peso > 0;
    };

    // Función para actualizar la cotización
    const actualizarCotizacion = async () => {
        mostrarSpinner(); // Mostrar spinner siempre que se actualice la cotización

        if (todosLosCamposCompletos()) {
            const cpDestino = cpDestinoInput.value.trim();
            const valorDeclarado = parseFloat(valorDeclaradoInput.value) || 0;
            const volumen = parseFloat(volumenTotalElement.textContent) || 0;
            const kilos = parseFloat(pesoInput.value) || 0;
            const altoCm = null; // Define según tu lógica
            const largoCm = null; // Define según tu lógica
            const anchoCm = null; // Define según tu lógica
            const contrato = parseFloat(volumen) > 100000 ? "351002753" : "400017260";

            const apiUrl = `https://apis.andreani.com/v1/tarifas?cpDestino=${cpDestino}&contrato=${contrato}&cliente=${cliente}&sucursalOrigen=${sucursalOrigen}&bultos[0][valorDeclarado]=${valorDeclarado}&bultos[0][volumen]=${volumen}&bultos[0][kilos]=${kilos}&bultos[0][altoCm]=${altoCm}&bultos[0][largoCm]=${largoCm}&bultos[0][anchoCm]=${anchoCm}`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();
                const tarifaConIvaTotal = data.tarifaConIva.total;
                valorCotizacionElement.innerHTML = `$ ${parseFloat(tarifaConIvaTotal).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } catch (error) {
                console.error('Error al obtener la cotización:', error);
                valorCotizacionElement.innerHTML = 'Error al cargar la cotización';
            } finally {
                ocultarSpinner(); // Ocultar el spinner al finalizar
            }
        } else {
            // Mostrar spinner en lugar de texto si los campos no están completos
            mostrarSpinner();
        }
    };

    // Mostrar spinner al cargar la página
    mostrarSpinner();

    // Escuchar cambios en los inputs relevantes
    cpDestinoInput.addEventListener('input', actualizarCotizacion);
    valorDeclaradoInput.addEventListener('input', actualizarCotizacion);
    pesoInput.addEventListener('input', actualizarCotizacion);

    // Usar MutationObserver para detectar cambios en el volumen total
    const observer = new MutationObserver(() => {
        actualizarCotizacion();
    });

    observer.observe(volumenTotalElement, { childList: true, subtree: true });
});
