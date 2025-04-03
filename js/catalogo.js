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
                    html: `<p>Hay <span style="color: red;"><strong>${newSKUCount}</strong></span> nuevos SKUs para importar.</p>`,
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
            html: `<p><span style="color: red;"><strong>${importedCount}</strong></span> SKUs importados a la base de datos.</p>`,
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
    messageElement.style.backgroundColor = '#d4edda'; 
    messageElement.style.color = '#155724'; 
    messageElement.style.border = '1px solid #c3e6cb'; 
    messageElement.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
} else if (type === 'success2') {
    messageElement.style.backgroundColor = '#cce5ff'; 
    messageElement.style.color = '#004085'; 
    messageElement.style.border = '1px solid #b8daff'; 
    messageElement.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${message}`;
} else if (type === 'error') {
    messageElement.style.backgroundColor = '#f8d7da'; 
    messageElement.style.color = '#721c24'; 
    messageElement.style.border = '1px solid #f5c6cb';
    messageElement.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i> ${message}`;
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
            logToConsole(`Buscando SKU: <strong>${sanitizedSKU}</strong>`, 'info');

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
        logToConsole(`Se actualizaron ${updateCount} SKUs. (Proceso Finalizado)`, 'success2');

        Swal.fire({
            title: 'Actualización completada',
            html: `<p><span style="color: red;"><strong>${updateCount}</strong></span> SKUs actualizados en la base de datos.</p>`,
            icon: 'success',
            confirmButtonText: 'OK'
        });

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

async function cargarCatalogo() {
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'flex'; // Mostrar el spinner

    // Agregar CSS dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para la tabla */
        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        /* Colores de fondo para las filas */
        tbody tr:nth-child(even) {
            background-color: #f2f2f2; /* Color claro */
        }

        tbody tr:nth-child(odd) {
            background-color: #e0e0e0; /* Color un poco más oscuro */
        }

        /* Colores de fondo para los encabezados */
        th:nth-child(odd) {
            background-color: #d9edf7; /* Color claro para encabezados impares */
        }

        th:nth-child(even) {
            background-color: #bce8f1; /* Color más oscuro para encabezados pares */
        }
    `;
    document.head.appendChild(style); // Agregar el estilo al documento

    const catalogoRef = database.ref('catalogo');
    const snapshot = await catalogoRef.once('value');

    // Contenedor de la tabla
    const meliCards = document.getElementById('meli-cards');
    meliCards.innerHTML = ''; // Limpiar contenido previo

    // Crear encabezados de la tabla
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
        'Codigo', 'Nombre', 'Precio', 'Precio De Lista', 'Cod. Moneda',
        'Cod. Proveedor', 'Stock', 'Stock Min.', 'Cod. Categoria Padre',
        'Id Categoria Padre', 'Descripcion', 'Texto', 'Marca/Proveedor',
        'Impuesto', 'Keywords', 'Video', 'Publicado', 'Disponible',
        'Fecha (dd-mm-aaaa)', 'Id. Sist. Gestion', 'Medidas expresadas en',
        'Peso expresado en', 'Peso de la caja', 'Ancho de la caja',
        'Alto de la caja', 'Profundidad de la caja', 'Bultos'
    ];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    meliCards.appendChild(thead); // Agregar encabezado a la tabla

    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');

    snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const row = document.createElement('tr');

        // Obtener medidas
        const medidas = data.medidas ? data.medidas.match(/(\d+(\.\d+)?)x(\d+(\.\d+)?)x(\d+(\.\d+)?)/) : [];
        const medida1 = medidas[1] || '';
        const medida2 = medidas[3] || '';
        const medida3 = medidas[5] || '';

        // Crear las keywords
        const keywords = [
            data.Producto || '',
            data.marca || '',
            data.subrubro || '',
            data.userProductId || '',
            data.itemId || '',
            data.categoryId || ''
        ].filter(Boolean).join(', ');

        // Separar palabras del producto para keywords
        const productKeywords = (data.Producto || '').split(' ').join(', ');

        // Crear celdas con los datos requeridos
        const rowData = [
            sanitizeSKU(data.SKU),
            data.Producto || '',
            '',
            '',
            'ARS',
            data.itemId || '',
            '',
            '5',
            '',
            '',
            data.Producto || '',
            '',
            data.marca || '',
            '',
            productKeywords + ', ' + keywords,
            '',
            'SI',
            'SI',
            new Date().toLocaleDateString('es-AR'),
            '',
            '0',
            '0',
            medida1,
            medida1,
            medida2,
            medida3,
            '1'
        ];

        rowData.forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            row.appendChild(td);
        });

        // Agregar atributos dinámicamente
        if (data.attributes) {
            let attributeIndex = 1; // Para contar los atributos

            data.attributes.forEach(attribute => {
                if (attribute.value_name) {
                    // Crear encabezados si no existen
                    const attrHeaderText = `Atributo ${attributeIndex}`;
                    const valueHeaderText = `Valor ${attributeIndex}`;

                    // Verificar si el encabezado ya existe
                    if (!Array.from(headerRow.children).some(th => th.textContent === attrHeaderText)) {
                        const attrHeader = document.createElement('th');
                        attrHeader.textContent = attrHeaderText;
                        headerRow.appendChild(attrHeader);
                    }

                    if (!Array.from(headerRow.children).some(th => th.textContent === valueHeaderText)) {
                        const valueHeader = document.createElement('th');
                        valueHeader.textContent = valueHeaderText;
                        headerRow.appendChild(valueHeader);
                    }

                    // Crear celdas para el atributo y su valor
                    const attrCell = document.createElement('td');
                    attrCell.textContent = attribute.name;
                    row.appendChild(attrCell);

                    const valueCell = document.createElement('td');
                    valueCell.textContent = attribute.value_name;
                    row.appendChild(valueCell);

                    attributeIndex++; // Incrementar el índice de atributos
                }
            });
        }

        tbody.appendChild(row);
    });

    meliCards.appendChild(tbody); // Agregar cuerpo de la tabla
    spinner.style.display = 'none'; // Ocultar el spinner

    // Mostrar el botón de descarga
    document.getElementById('downloadExcel').style.display = 'block';
}

// DESCARGAR EXCEL
document.getElementById('downloadExcel').addEventListener('click', async () => {
    const spinner = document.getElementById('spinner2');
    spinner.style.display = 'flex'; // Mostrar el spinner

    // Obtener los datos de la tabla
    const table = document.getElementById('meli-cards');
    const workbook = XLSX.utils.table_to_book(table, { sheet: "Catalogo" });

    // Obtener la fecha y hora actual
    const now = new Date();
    const dateString = now.toISOString().slice(0, 19).replace(/:/g, '-'); // Formato: YYYY-MM-DDTHH-MM-SS
    const fileName = `catalogo_productos_${dateString}.xlsx`; // Nombre del archivo con fecha y hora

    // Generar el archivo Excel
    XLSX.writeFile(workbook, fileName);

    spinner.style.display = 'none'; // Ocultar el spinner
});
// FIN DESCARGAR EXCEL

// Llamar a la función para cargar el catálogo al iniciar
cargarCatalogo();