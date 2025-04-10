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
        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        tbody tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        tbody tr:nth-child(odd) {
            background-color: #e0e0e0;
        }

        th:nth-child(odd) {
            background-color: #d9edf7;
        }

        th:nth-child(even) {
            background-color: #bce8f1;
        }
    `;
    document.head.appendChild(style);

    const catalogoRef = database.ref('catalogo');
    const snapshot = await catalogoRef.once('value');

    const meliCards = document.getElementById('meli-cards');
    meliCards.innerHTML = '';

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

    // Recolectar todos los atributos únicos
    const uniqueAttributes = new Set();

    snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        if (data.attributes) {
            data.attributes.forEach(attribute => {
                if (attribute.value_name) {
                    uniqueAttributes.add(`FICHA: ${attribute.name}`);
                }
            });
        }
    });

    // Agregar encabezados fijos
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    // Agregar encabezados dinámicos de atributos
    const fichaHeaders = Array.from(uniqueAttributes).sort();
    fichaHeaders.forEach(ficha => {
        const th = document.createElement('th');
        th.textContent = ficha;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    meliCards.appendChild(thead);

    const tbody = document.createElement('tbody');

    snapshot.forEach(childSnapshot => {
        const data = childSnapshot.val();
        if (!data.SKU || !data.SKU.trim()) return; // ⛔ Salta si no tiene SKU válido
    
        const row = document.createElement('tr');

        const medidas = data.medidas ? data.medidas.match(/(\d+(\.\d+)?)x(\d+(\.\d+)?)x(\d+(\.\d+)?)/) : [];
        const medida1 = medidas[1] || '';
        const medida2 = medidas[3] || '';
        const medida3 = medidas[5] || '';

        const keywords = [
            data.Producto || '',
            data.marca || '',
            data.subrubro || '',
            data.userProductId || '',
            data.itemId || '',
            data.categoryId || ''
        ].filter(Boolean).join(', ');

        const productKeywords = (data.Producto || '').split(' ').join(', ');

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

        // Crear un diccionario con los atributos del producto
        const atributosDelProducto = {};
        if (data.attributes) {
            data.attributes.forEach(attribute => {
                if (attribute.value_name) {
                    atributosDelProducto[`FICHA: ${attribute.name}`] = attribute.value_name;
                }
            });
        }

        // Agregar columnas de atributos en el orden correcto
        fichaHeaders.forEach(ficha => {
            const td = document.createElement('td');
            td.textContent = atributosDelProducto[ficha] || '';
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    meliCards.appendChild(tbody);
    spinner.style.display = 'none';
    document.getElementById('downloadExcel').style.display = 'block';
    document.getElementById('downloadFotos').style.display = 'block';
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

document.getElementById('downloadFotos').addEventListener('click', async () => {
    const btn = document.getElementById('downloadFotos');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Preparando archivo...`;

    const catalogoRef = database.ref('catalogo');
    const snapshot = await catalogoRef.once('value');
    const catalogo = snapshot.val() || {};

    const JSZipInstance = new JSZip();
    const maxConcurrentDownloads = 5;

    const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9-_]/g, '_');

    // Función que limita la cantidad de descargas simultáneas
    async function asyncPool(poolLimit, items, iteratorFn) {
        const ret = [];
        const executing = [];

        for (const item of items) {
            const p = Promise.resolve().then(() => iteratorFn(item));
            ret.push(p);

            if (poolLimit <= items.length) {
                const e = p.then(() => executing.splice(executing.indexOf(e), 1));
                executing.push(e);
                if (executing.length >= poolLimit) await Promise.race(executing);
            }
        }

        return Promise.all(ret);
    }

    let hasContent = false;
    const downloadTasks = [];

    for (const child of Object.values(catalogo)) {
        const sku = sanitizeFileName(child.SKU || '');
        const pictures = child.pictures || [];
    
        if (!sku || pictures.length === 0) continue;
    
        const folder = JSZipInstance.folder(sku);
        pictures.forEach((pic, index) => {
            // Cambia el nombre del archivo a "SKU|número.jpg"
            const fileName = `${child.SKU}|${index + 1}.jpg`;
            downloadTasks.push({
                url: pic.secure_url,
                fileName: fileName,
                folder
            });
        });
    
        hasContent = true;
    }    

    if (!hasContent) {
        alert("No hay imágenes disponibles para descargar.");
        btn.innerHTML = originalContent;
        btn.disabled = false;
        return;
    }

    // Ejecutar tareas con límite de concurrencia
    await asyncPool(maxConcurrentDownloads, downloadTasks, async ({ url, fileName, folder }) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Error con imagen ${url}`);
            const blob = await res.blob();
            folder.file(fileName, blob);
        } catch (err) {
            console.warn(`Error descargando ${url}:`, err.message);
        }
    });

    const zipBlob = await JSZipInstance.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `fotos_catalogo_${new Date().toLocaleDateString('es-AR')}.zip`;
    link.click();

    btn.innerHTML = originalContent;
    btn.disabled = false;
});

// Llamar a la función para cargar el catálogo al iniciar
cargarCatalogo();