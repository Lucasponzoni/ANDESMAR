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
    Swal.fire("Importación Completa", `Ventas nuevas: ${nuevasVentas}\nVentas actualizadas: ${ventasActualizadas}`, "success");
  });
  