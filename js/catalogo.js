// catalogo.js

// Inicialización de Firebase
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
const database = firebase.database();

// Función para sanitizar el SKU
function sanitizeSKU(sku) {
    return sku.replace(/[.#$[\]]/g, '_'); // Reemplaza caracteres no válidos por '_'
}

// Función para buscar en "envios" y copiar a "catalogo"
document.getElementById('buscarCatalogo').addEventListener('click', async () => {
    const spinner = document.getElementById('spinner2');
    spinner.style.display = 'flex';

    const newSKUs = new Set();
    const skuDataMap = {}; // Mapa para almacenar datos de cada SKU

    try {
        const enviosRef = database.ref('envios').limitToLast(10000);
        const snapshot = await enviosRef.once('value');

        snapshot.forEach(childSnapshot => {
            const envioData = childSnapshot.val();

            if (envioData.attributes && envioData.attributes.length > 0) {
                if (envioData.SKU) {
                    const sku = sanitizeSKU(envioData.SKU);
                    skuDataMap[sku] = envioData; // Almacenar datos del SKU en el mapa

                    database.ref(`catalogo/${sku}`).once('value').then(existingSnapshot => {
                        if (!existingSnapshot.exists()) {
                            newSKUs.add(sku);
                        }
                    });
                }
            }
        });

        setTimeout(() => {
            spinner.style.display = 'none';
            const newSKUCount = newSKUs.size;

            if (newSKUCount > 0) {
                Swal.fire({
                    title: 'Confirmación de Importación',
                    html: `<p>Hay <span class="counter imported">${newSKUCount}</span> nuevos SKUs para importar.</p>`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Importar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        importNewSKUs(Array.from(newSKUs), skuDataMap); // Pasar el mapa de datos
                    }
                });
            } else {
                Swal.fire({
                    title: 'No hay nuevos SKUs',
                    text: 'No se encontraron SKUs nuevos para importar.',
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
            }
        }, 1000);
    } catch (error) {
        console.error("Error al analizar:", error);
        spinner.style.display = 'none';
    }
});

// Función para importar nuevos SKUs
async function importNewSKUs(newSKUs, skuDataMap) {
    const spinner = document.getElementById('spinner2');
    spinner.style.display = 'flex';

    let importedCount = 0;

    for (const sku of newSKUs) {
        const data = skuDataMap[sku]; // Obtener los datos del SKU del mapa

        if (data) {
            const catalogoData = {
                Peso: data.Peso || null,
                Producto: data.Producto || null,
                SKU: sku,
                VolumenCM3: data.VolumenCM3 || null,
                VolumenM3: data.VolumenM3 || null,
                attributes: data.attributes || [],
                categoryId: data.categoryId || null,
                itemId: data.itemId || null,
                medidas: data.medidas || null,
                permalink: data.permalink || null,
                pictures: data.pictures || [],
                shippingMode: data.shippingMode || null,
                userProductId: data.userProductId || null
            };

            await database.ref(`catalogo/${sku}`).set(catalogoData);
            console.log(`Nuevo SKU copiado: ${sku}`);
            importedCount++;
        } else {
            console.warn(`No se encontraron datos para el SKU: ${sku}`);
        }
    }

    setTimeout(() => {
        spinner.style.display = 'none';

        Swal.fire({
            title: 'Importación completada',
            html: `<p><span class="counter imported">${importedCount}</span> SKUs importados a la base de datos.</p>`,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    }, 1000);
}

// Función para mostrar mensajes en la consola del modal
function logToConsole(message, type = 'info') {
    const consoleOutput = document.getElementById('consoleOutput');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;

    // Establecer el color de fondo según el tipo de mensaje
    if (type === 'success') {
        messageElement.style.backgroundColor = '#d4edda'; // Color de éxito
        messageElement.style.color = '#155724'; // Texto de éxito
        messageElement.style.border = '1px solid #c3e6cb'; // Borde de éxito
        messageElement.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#f8d7da'; // Color de error
        messageElement.style.color = '#721c24'; // Texto de error
        messageElement.style.border = '1px solid #f5c6cb'; // Borde de error
        messageElement.innerHTML = `<i class="bi bi-x-circle"></i> ${message}`;
    }

    consoleOutput.appendChild(messageElement);
    consoleOutput.scrollTop = consoleOutput.scrollHeight; // Desplazarse hacia abajo
}

// Evento para abrir el modal
document.getElementById('importCategoriesButton').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('importCategoriesModal'));
    modal.show();
});

// Función para manejar la importación
document.getElementById('importButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        logToConsole('Por favor, selecciona un archivo.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target.result;
        const rows = content.split('\n').map(row => row.split(';')); // Separar por punto y coma
        let updateCount = 0; // Contador de actualizaciones

        logToConsole("Datos leídos desde el archivo:", 'info');
        console.table(rows); // Muestra todos los datos leídos en la consola

        const totalRows = rows.length - 1; // Total de filas a analizar
        for (let i = 1; i < rows.length; i++) { // Comenzar desde 1 para omitir encabezados
            const [id, codigo, idML, subrubro, nombre, stock, precio, ahorro, flete, descuento, vale, estado, foto, marca, precioML] = rows[i];

            // Verifica que el código no sea undefined
            if (!codigo) {
                logToConsole(`Código no definido en la fila ${i + 1}`, 'error');
                continue; // Salta a la siguiente iteración
            }

            // Sanitizar el SKU
            const sanitizedSKU = sanitizeSKU(codigo);
            logToConsole(`Buscando SKU: ${sanitizedSKU}`, 'info');

            // Buscar en el catálogo
            const catalogoRef = database.ref(`catalogo/${sanitizedSKU}`);
            const snapshot = await catalogoRef.once('value');

            if (snapshot.exists()) {
                // Si existe, tomar los datos necesarios y subir a Firebase
                const dataToUpdate = {
                    subrubro: subrubro,
                    marca: marca,
                    foto: foto
                };

                await catalogoRef.update(dataToUpdate);
                logToConsole(`Actualizado SKU: ${sanitizedSKU} con subrubro: ${subrubro}, marca: ${marca}, foto: ${foto}`, 'success');
                updateCount++;
            } else {
                logToConsole(`No se encontró SKU: ${sanitizedSKU}`, 'error');
            }

            // Actualizar el contador de filas restantes
            document.getElementById('rowCounter').textContent = `Filas restantes por analizar: ${totalRows - i}`;
        }

        // Mostrar resultados de la importación
        logToConsole(`Se actualizaron ${updateCount} SKUs.`, 'success');

        // Cerrar el modal al finalizar la importación
        const modal = new bootstrap.Modal(document.getElementById('importCategoriesModal'));
        modal.hide();
    };

    reader.readAsText(file);
});

// Función para sanitizar el SKU
function sanitizeSKU(sku) {
    return sku ? sku.replace(/[.#$[\]]/g, '_') : ''; // Sanitiza solo si SKU no es undefined
}