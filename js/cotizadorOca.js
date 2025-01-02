document.addEventListener('DOMContentLoaded', () => {
    // Variables OCA
    const cpOrigenOCA = "2000";
    const operativaOCA = "431395";
    const cuitOCA = "30-68543701-1";
    const cantidadBultos = document.getElementById('bultos');
    const cpDestinoInputOCA = document.getElementById('codigoPostalDestinatario');
    const valorDeclaradoInputOCA = document.getElementById('valorDeclarado');
    const volumenTotalElement = document.getElementById('volumenTotal');
    const pesoInputOCA = document.getElementById('peso');
    const valorCotizacionElementOCA = document.getElementById('valor-cotizacion3');

    // Función para obtener el total de bultos
function actualizarCantidadBultos() {
    const bultosContainer = document.getElementById('medidasBultosContainer');
    const bultos = bultosContainer.getElementsByClassName('bulto');
    let totalBultos = 0;

    // Sumamos la cantidad de cada bulto
    for (let i = 0; i < bultos.length; i++) {
        const cantidadInput = bultos[i].querySelector(`#cantidad${i}`);
        if (cantidadInput) {
            totalBultos += parseInt(cantidadInput.value) || 0;
        }
    }

    // Devolvemos el total de bultos
    return totalBultos;
}
    
    // Spinner
    const spinnerOCA = document.createElement('div');
    spinnerOCA.className = 'spinner-border text-purple';
    spinnerOCA.role = 'status';
    spinnerOCA.innerHTML = '<span class="visually-hidden">Cargando...</span>';
    
    const spinnerContainerOCA = document.createElement('div');
    spinnerContainerOCA.appendChild(spinnerOCA);
    spinnerContainerOCA.appendChild(document.createTextNode(' Esperando...'));
    
    // Función para mostrar spinner
    const mostrarSpinnerOCA = () => {
        if (!valorCotizacionElementOCA.contains(spinnerContainerOCA)) {
            valorCotizacionElementOCA.innerHTML = '';
            valorCotizacionElementOCA.appendChild(spinnerContainerOCA);
        }
    };

    // Función para ocultar spinner y mostrar resultado
    const ocultarSpinnerYMostrarResultadoOCA = (resultado) => {
        valorCotizacionElementOCA.innerHTML = resultado;
    };

    // Función para validar si los campos están completos
    const todosLosCamposCompletosOCA = () => {
        const cpDestino = cpDestinoInputOCA.value.trim();
        const volumen = parseFloat(volumenTotalElement.textContent) || 0;
        const peso = parseFloat(pesoInputOCA.value) || 0;
        return cpDestino && volumen > 0 && peso > 0;
    };

    // Función para actualizar la cotización con la API de OCA
    const actualizarCotizacionOCA = async () => {
        mostrarSpinnerOCA();

        if (todosLosCamposCompletosOCA()) {
            const cpDestino = cpDestinoInputOCA.value.trim();
            const valorDeclarado = parseFloat(valorDeclaradoInputOCA.value) || 0;
            const volumenTotalOCA = parseFloat(volumenTotalElement.textContent) || 0;
            const pesoTotalOCA = parseFloat(pesoInputOCA.value) || 0;
            const totalBultos = actualizarCantidadBultos(); 

            const url = `https://proxy.cors.sh/http://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx/Tarifar_Envio_Corporativo?PesoTotal=${pesoTotalOCA}&VolumenTotal=${volumenTotalOCA}&CodigoPostalOrigen=${cpOrigenOCA}&CodigoPostalDestino=${cpDestino}&CantidadPaquetes=${totalBultos}&ValorDeclarado=${valorDeclarado}&Cuit=${cuitOCA}&Operativa=${operativaOCA}`;
            
            try {
                console.log('%cRequest OCA:', 'color: yellow; font-weight: bold;', url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                    }
                });

                const text = await response.text();
                console.log('%cResponse OCA:', 'color: green; font-weight: bold;', text);

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "application/xml");

                const tables = xmlDoc.getElementsByTagName('Table');
                let resultado = '';

                for (let i = 0; i < tables.length; i++) {
                    const precio = tables[i].getElementsByTagName('Precio')[0]?.textContent || 'N/A';
                    const total = tables[i].getElementsByTagName('Total')[0]?.textContent || 'N/A';
                    const plazo = tables[i].getElementsByTagName('PlazoEntrega')[0]?.textContent || 'N/A';
                    const totalFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total);
                    
                    resultado += `${totalFormateado}
                    <span class="plazo-entrega">(Plazo de Entrega: <strong>${plazo}</strong> días)</span>`;
                }                

                ocultarSpinnerYMostrarResultadoOCA(resultado || 'No se encontraron resultados.');

            } catch (error) {
                console.error('%cError en la API de OCA:', 'color: red; font-weight: bold;', error.message);
                ocultarSpinnerYMostrarResultadoOCA(`Error: ${error.message}`);
            }
        } else {
            mostrarSpinnerOCA();
        }
    };

    // Mostrar spinner al cargar la página
    mostrarSpinnerOCA();

    // Escuchar cambios en los inputs relevantes
    cpDestinoInputOCA.addEventListener('input', actualizarCotizacionOCA);
    valorDeclaradoInputOCA.addEventListener('input', actualizarCotizacionOCA);
    pesoInputOCA.addEventListener('input', actualizarCotizacionOCA);

    // Usar MutationObserver para detectar cambios en el volumen total
    const observerOCA = new MutationObserver(() => {
        actualizarCotizacionOCA();
    });

    observerOCA.observe(volumenTotalElement, { childList: true, subtree: true });
});
