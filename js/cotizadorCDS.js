document.addEventListener('DOMContentLoaded', () => {
    // Variables Cruz del Sur
    const idCDS = "87231e4b-b414-47c0-882b-ef98adb94fe4";
    const usuarioCDS = "necommerce";
    const passCDS = "novogar71!";
    const cpDestinoCDS = document.getElementById('codigoPostalDestinatario');
    const valorDeclaradoCDS = document.getElementById('valorDeclarado');
    const volumenTotalElementCDS = document.getElementById('volumenTotalcm');
    const pesoCDS = document.getElementById('peso');
    const valorCotizacionElementCDS = document.getElementById('valor-cotizacion4');
    const cotizacionContainer = document.querySelector('.cotizacion-container.cuarto-transporte'); // Seleccionar específicamente el contenedor de Cruz del Sur

    // Spinner
    const spinnerCDS = document.createElement('div');
    spinnerCDS.className = 'spinner-border';
    spinnerCDS.role = 'status';
    spinnerCDS.innerHTML = '<span class="visually-hidden">Cargando...</span>';
    
    const spinnerContainerCDS = document.createElement('div');
    spinnerContainerCDS.appendChild(spinnerCDS);
    spinnerContainerCDS.appendChild(document.createTextNode(' Esperando...'));

    // Función para mostrar spinner
    const mostrarSpinnerCDS = () => {
        valorCotizacionElementCDS.innerHTML = '';
        valorCotizacionElementCDS.appendChild(spinnerContainerCDS);
    };

    // Función para formatear el precio
    const formatearPrecio = (precio) => {
        return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    // Función para ocultar spinner y mostrar resultado
    const ocultarSpinnerYMostrarResultadoCDS = (data) => {
        valorCotizacionElementCDS.innerHTML = '';

        if (data.Cotizaciones && data.Cotizaciones.length > 0) {
            const segundaCotizacion = data.Cotizaciones[0];

            const horasDesde = segundaCotizacion.HorasDesde;
            const horasHasta = segundaCotizacion.HorasHasta;

            const diasDesde = Math.ceil(horasDesde / 24);
            const diasHasta = Math.ceil(horasHasta / 24);
            const plazo = `${diasDesde} a ${diasHasta}`;

            const precioSinIVA = parseFloat(segundaCotizacion.Valor) || 0;
            const iva = precioSinIVA * 0.21;
            const precioConIVA = precioSinIVA + iva;

            const resultado = `
                ${formatearPrecio(precioConIVA)} 
                <span class="plazo-entrega2">(Plazo de Entrega: <strong>${plazo}</strong> días)</span>
            `;

            valorCotizacionElementCDS.innerHTML = resultado;

            mostrarInformacionSucursal(data.Sucursal);
        } else {
            valorCotizacionElementCDS.innerHTML = 'No hay cotizaciones disponibles.';
        }
    };

    const mostrarInformacionSucursal = (sucursales) => {
        const sucursalDiv = document.getElementById('sucursal-info');
        if (sucursalDiv) {
            sucursalDiv.remove();
        }
    
        const sucursalContainer = document.createElement('div');
        sucursalContainer.id = 'sucursal-info';
        sucursalContainer.className = 'sucursal-container';
    
        const sucursalInfo = sucursales.map(sucursal => `
            <div class="sucursal-details">
                <img class="cds-img" src="./Img/cruz-del-sur-logo.jpg" alt="Cruz del Sur" srcset="">                
                <h5><i class="bi bi-lightning-charge-fill"></i> Disponible retiro en Sucursal CDS mas cercana:</h5> 
                <h4><i class="bi bi-geo-alt"></i> ${sucursal.Nombre.replace(/\*/g, '')}, ${sucursal.Ciudad.replace(/\*/g, '')}</h4>                
                <p><i class="bi bi-house-fill"></i> Dirección: ${sucursal.Domicilio}, CP: ${sucursal.CP}</p>
                <p><i class="bi bi-telephone-fill"></i> Teléfono: ${sucursal.Telefono}</p>
                <p><i class="bi bi-clock-fill"></i> Horario: ${sucursal.Horario}</p>                
                <div id="map-${sucursal.IdSucursal}" class="map" style="height: 300px;"></div>
            </div>
        `).join('');
    
        sucursalContainer.innerHTML = sucursalInfo;
    
        // Agregar el div de sucursal debajo del contenedor de Cruz del Sur
        if (cotizacionContainer) {
            cotizacionContainer.insertAdjacentElement('afterend', sucursalContainer);
        } else {
            console.error("El contenedor de cotización no se encontró.");
        }
    
        // Inicializar Leaflet para cada sucursal
        sucursales.forEach(sucursal => {
            const latLng = [sucursal.Latitud, sucursal.Longitud];
            initMap(`map-${sucursal.IdSucursal}`, latLng);
        });
    };
    

    // Función para inicializar el mapa con Leaflet
    const initMap = (mapId, location) => {
        const map = L.map(mapId).setView(location, 15); // Establecer la vista del mapa

        // Capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        // Marcador en la ubicación de la sucursal
        L.marker(location).addTo(map)
            .bindPopup('Sucursal Cruz del Sur / Novogar')
            .openPopup();
    };

    // Función para validar si los campos están completos
    const todosLosCamposCompletosCDS = () => {
        const cpDestino = cpDestinoCDS.value.trim();
        const volumen = parseFloat(volumenTotalElementCDS.textContent) || 0;
        const peso = parseFloat(pesoCDS.value) || 0;
        return cpDestino && volumen > 0 && peso > 0;
    };

    // Función para actualizar la cotización con la API de Cruz del Sur
    const actualizarCotizacionCDS = async () => {
        mostrarSpinnerCDS();

        const sucursalDiv = document.getElementById('sucursal-info');
        if (sucursalDiv) {
            sucursalDiv.remove();
        }

        if (todosLosCamposCompletosCDS()) {
            const cpDestino = cpDestinoCDS.value.trim();
            const valorDeclarado = parseFloat(valorDeclaradoCDS.value) || 0;
            const volumenTotalCDS = parseFloat(volumenTotalElementCDS.textContent) || 0;
            const pesoTotalCDS = parseFloat(pesoCDS.value) || 0;

            const url = `https://api-ventaenlinea.cruzdelsur.com/api/NuevaCotXVol?idcliente=${idCDS}&ulogin=${usuarioCDS}&uclave=${passCDS}&volumen=${volumenTotalCDS}&peso=${pesoTotalCDS}&codigopostal=${cpDestino}&localidad=&valor=${valorDeclarado}`;

            console.log('%cRequest CDS:', 'color: yellow; font-weight: bold;', url);

            try {
                const response = await axios.get(url, {
                    headers: {
                        'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
                    }
                });

                console.log('%cResponse CDS:', 'color: green; font-weight: bold;', response.data);
                ocultarSpinnerYMostrarResultadoCDS(response.data);
            } catch (error) {
                console.error('%cError en la API de Cruz del Sur:', 'color: red; font-weight: bold;', error.message);
                valorCotizacionElementCDS.innerHTML = 'Error al obtener cotización.';
            }
        } else {
            mostrarSpinnerCDS();
        }
    };

    // Usar MutationObserver para detectar cambios en el volumen total
    const observerCDS = new MutationObserver(() => {
        actualizarCotizacionCDS();
    });

    observerCDS.observe(volumenTotalElementCDS, { childList: true, subtree: true });

    // Escuchar cambios en los inputs relevantes
    cpDestinoCDS.addEventListener('input', actualizarCotizacionCDS);
    valorDeclaradoCDS.addEventListener('input', actualizarCotizacionCDS);
    pesoCDS.addEventListener('input', actualizarCotizacionCDS);
});
