// Inicializa Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBP2TtBiRVcreivUGjqZjXe0XU7QRrt6Ts",
    authDomain: "precios-novogar.firebaseapp.com",
    databaseURL: "https://precios-novogar-default-rtdb.firebaseio.com",
    projectId: "precios-novogar",
    storageBucket: "precios-novogar.firebasestorage.app",
    messagingSenderId: "355767952460",
    appId: "1:355767952460:web:32a785c718c5c88208c0e9",
    measurementId: "G-JPZW21X0L9"
};
firebase.initializeApp(firebaseConfig);

document.getElementById('importButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Obtener el rango de la hoja
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        let startRow = range.s.r;

        // Buscar la cabecera "# de venta"
        for (let row = startRow; row <= range.e.r; row++) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Columna A
            if (cell && cell.v === "# de venta") {
                startRow = row + 1; // Comenzar a importar desde la siguiente fila
                break;
            }
        }

        // Mostrar el spinner
        document.getElementById('spinnerOverlay').style.display = 'block';
        let totalRows = 0;

        // Función para sanitizar la clave
        function sanitizeKey(key) {
            // Reemplazar caracteres no válidos con un guion bajo
            return key.replace(/[.#$\/[\]]/g, '_').trim(); // Reemplaza caracteres no válidos y elimina espacios
        }

        // Recorrer las filas y cargar en Firebase
        for (let row = startRow; row <= range.e.r; row++) {
            const rowData = {};
            const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]; // Columna A
            if (cell) {
                const key = sanitizeKey(cell.v); // Sanitizar la clave
                if (key) { // Verificar que la clave no esté vacía
                    for (let col = 1; col <= range.e.c; col++) { // Comenzar desde la columna B
                        const cellData = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
                        if (cellData) {
                            rowData[cellData.v] = worksheet[XLSX.utils.encode_cell({ r: row, c: col })].v; // Valor
                        }
                    }
                    // Intentar guardar en Firebase
                    firebase.database().ref('posventa/' + key).set(rowData)
                        .then(() => {
                            totalRows++;
                            document.getElementById('spinnerProgress').innerText = Math.round((totalRows / (range.e.r - startRow + 1)) * 100) + '%';
                        })
                        .catch(error => {
                            console.error("Error al guardar en Firebase:", error);
                            alert("Error al guardar la fila con clave: " + key);
                        });
                } else {
                    console.warn("Clave vacía después de sanitizar:", cell.v);
                }
            }
        }

        // Ocultar el spinner y mostrar el reporte
        document.getElementById('spinnerOverlay').style.display = 'none';
        Swal.fire({
            title: 'Importación Completa',
            text: `Se importaron ${totalRows} filas.`,
            icon: 'success'
        });
    };

    reader.readAsArrayBuffer(file);
});
