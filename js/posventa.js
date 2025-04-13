// Inicializa Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBP2TtBiRVcreivUGjqZjXe0XU7QRrt6Ts",
    authDomain: "precios-novogar.firebaseapp.com",
    databaseURL: "https://precios-novogar-default-rtdb.firebaseio.com",
    projectId: "precios-novogar",
    storageBucket: "precios-novogar.firebasestorage.app",
    messagingSenderId: "355767952460",
    appId: "1:355767952460:web:32a785c718c5c88208c0e9",
    measurementId: "G-JPZW21X0L9"
  });
  
  const db = firebase.database();
  
  function limpiarClave(clave) {
    return clave.trim().replace(/[.#$/\[\]]/g, '').replace(/\s+/g, '_').toLowerCase();
  }
  
  document.getElementById('importButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) return;
  
    document.getElementById('spinnerOverlay').style.display = 'flex';
  
    const file = fileInput.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
  
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
    let headerRowIndex = -1;
    let headers = [];
    let secciones = [];
  
    for (let i = 0; i < json.length; i++) {
      if (json[i].includes('# de venta')) {
        headerRowIndex = i;
        headers = json[i];
        secciones = json[i - 1] || [];
        break;
      }
    }
  
    if (headerRowIndex === -1) {
      Swal.fire("Error", "No se encontró la cabecera '# de venta'.", "error");
      document.getElementById('spinnerOverlay').style.display = 'none';
      return;
    }
  
    const sectionMap = {};
    let currentSection = "";
    for (let i = 0; i < headers.length; i++) {
      const sectionCell = secciones[i];
      if (sectionCell && sectionCell.trim() !== "") {
        currentSection = sectionCell.trim().toLowerCase().replace(/\s+/g, '_');
      }
      sectionMap[i] = currentSection;
    }
  
    const allDataSnapshot = await db.ref('/posventa').once('value');
    const existingData = allDataSnapshot.val() || {};
  
    const updates = {};
    let nuevasVentas = 0;
    let ventasActualizadas = 0;
  
    for (let i = headerRowIndex + 1; i < json.length; i++) {
      const row = json[i];
      const ventaId = row[0];
      if (!ventaId) continue;
  
      const ventaData = {};
      let hayCambios = false;
  
      for (let j = 0; j < headers.length; j++) {
        const claveOriginal = headers[j]?.trim();
        const clave = limpiarClave(claveOriginal);
        const seccion = sectionMap[j] || "otros";
        const valorNuevo = row[j];
  
        if (!clave) continue;
        if (!ventaData[seccion]) ventaData[seccion] = {};
  
        if (seccion === 'ventas' && (clave === 'estado' || clave === 'descripción_del_estado')) {
          const prevVenta = existingData[ventaId]?.ventas || {};
          let version = 1;
          while (prevVenta[`${clave}${version > 1 ? version : ''}`] !== undefined) {
            version++;
          }
          const ultimaClave = `${clave}${version - 1 > 1 ? version - 1 : ''}`;
          const valorPrevio = prevVenta[ultimaClave] || "";
  
          if (valorNuevo !== valorPrevio) {
            const nuevaClave = `${clave}${version}`;
            ventaData[seccion][nuevaClave] = valorNuevo;
            hayCambios = true;
          }
        } else {
          const prevValor = existingData[ventaId]?.[seccion]?.[clave];
          if (valorNuevo !== prevValor) {
            ventaData[seccion][clave] = valorNuevo;
            hayCambios = true;
          }
        }
      }
  
      if (!existingData[ventaId]) {
        updates[`/posventa/${ventaId}`] = ventaData;
        nuevasVentas++;
      } else if (hayCambios) {
        for (const seccion in ventaData) {
          for (const clave in ventaData[seccion]) {
            updates[`/posventa/${ventaId}/${seccion}/${clave}`] = ventaData[seccion][clave];
          }
        }
        ventasActualizadas++;
      }
    }
  
    const ventaIds = Object.keys(updates);
    const batchSize = 100;
    for (let i = 0; i < ventaIds.length; i += batchSize) {
      const batchKeys = ventaIds.slice(i, i + batchSize);
      const batchUpdates = {};
      for (const key of batchKeys) {
        batchUpdates[key] = updates[key];
      }
      try {
        await db.ref().update(batchUpdates);
      } catch (error) {
        console.error(`Error en el batch ${i}-${i + batchSize}:`, error);
      }
      const progress = Math.floor(((i + batchKeys.length) / ventaIds.length) * 100);
      document.getElementById('spinnerProgress').innerText = `${progress}%`;
    }
  
    document.getElementById('spinnerOverlay').style.display = 'none';
    
    Swal.fire({
        title: '📊 Importación MeLi Finalizada',
        html: `
          <style>
            .macos-alert {
              text-align: left;
              line-height: 1.6;
              color: #333;
              font-size: 17px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            }
      
            .counter2 {
              display: inline-block;
              padding: 10px 20px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
              font-size: 18px;
              margin: 10px 0;
              transition: transform 0.3s ease;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
      
            .counter2:hover {
              transform: scale(1.05);
            }
      
            .counter2.imported {
              background-color: #28a745;
            }
      
            .counter2.changed {
              background-color: #007bff;
            }
      
            .swal2-macos-popup {
              border-radius: 18px !important;
              padding: 35px 30px !important;
              background: #f9f9fb !important;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
              font-size: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            }
      
            .swal2-macos-title {
              font-size: 24px !important;
              font-weight: 700 !important;
              color: #2c2c2c !important;
              margin-bottom: 25px !important;
            }
      
            .swal2-macos-button {
              border-radius: 12px !important;
              padding: 10px 28px !important;
              background-color: #007aff !important;
              color: white !important;
              font-weight: 600 !important;
              font-size: 16px !important;
              transition: background-color 0.2s ease;
            }
      
            .swal2-macos-button:hover {
              background-color: #005ecc !important;
            }
          </style>
      
          <div class="macos-alert">
            <p>La operación ha concluido con éxito. A continuación te mostramos el resumen:</p>
            ✅ Nuevas ventas importadas: <div class="counter2 imported"> ${nuevasVentas} </div><br>
            🔄 Ventas actualizadas: <div class="counter2 changed"> ${ventasActualizadas} </div>
          </div>
        `,
        confirmButtonText: 'Entendido',
        customClass: {
          popup: 'swal2-macos-popup',
          title: 'swal2-macos-title',
          confirmButton: 'swal2-macos-button'
        }
      });      
      
});
  