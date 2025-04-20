// Inicializa Firebase
firebase.initializeApp({
      apiKey: "AIzaSyDI9exOVBtsUlMg2DhkITPMMCGFCy5ZWnA",
      authDomain: "posventa-novogar.firebaseapp.com",
      databaseURL: "https://posventa-novogar-default-rtdb.firebaseio.com",
      projectId: "posventa-novogar",
      storageBucket: "posventa-novogar.firebasestorage.app",
      messagingSenderId: "1065784925699",
      appId: "1:1065784925699:web:47c291fa4e4d6e484e3836",
      measurementId: "G-FNZ4PW5L35"
  });
  
  const db = firebase.database();
  window.db = db;
  
  // IMPORTACION DE VENTAS
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
  
    // Función para limpiar fechas y valores variables
    function limpiarEstadoVariable(texto) {
      return texto
        .toLowerCase()
        .replace(/\d{1,2} de [a-záéíóú]+/gi, '')
        .replace(/llegar[a-z]* el \d{1,2}/gi, '')
        .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '')
        .replace(/\d+/g, '')
        .replace(/[.,]/g, '')
        .trim();
    }
  
    // Lista de patrones conocidos
    const patronesConocidos = [
      "cobro devuelto", "reclamo abierto por resolver", "paquete cancelado por mercado libre",
      "cancelaste la venta", "cancelada por el comprador", "la devolución llegará hoy",
      "venta cancelada", "reclamo con devolución habilitada", "devolución en preparación",
      "devolución en camino", "devolución reprogramada", "te devolveremos el paquete",
      "en devolución", "reclamo cerrado con reembolso al comprador",
      "devolución finalizada. te dimos el dinero.", "devolución no entregada. te dimos el dinero.",
      "devolución finalizada con reembolso al comprador", "devolución con fecha actualizada",
      "devolución para revisar", "mediación con mercado libre", "le devolvimos el dinero al comprador",
      "tu comprador solicita cancelar", "mediación finalizada con reembolso al comprador",
      "tu comprador reclama porque necesita el paquete", "venta cancelada. no despachés.",
      "no entregado", "reclamo abierto", "reclamo abierto para resolver",
      "mediación en espera de respuesta de mercado libre", "reclamo abierto. entregá el paquete",
      "mediación para responder", "mediación en espera de respuesta", "devuelto"
    ];
  
    const colEstadoIndex = headers.findIndex(h => h?.toLowerCase().trim().includes('estado'));
    const estadosDetectados = new Set();
  
    for (let i = headerRowIndex + 1; i < json.length; i++) {
      const row = json[i];
      const estadoCrudo = (row[colEstadoIndex] || '').toString().toLowerCase().trim();
  
      if (estadoCrudo) {
        const estadoLimpio = limpiarEstadoVariable(estadoCrudo);
        let coincidencia = patronesConocidos.find(p =>
          estadoLimpio.includes(p.toLowerCase())
        );
        if (coincidencia) {
          estadosDetectados.add(coincidencia);
        } else {
          const nuevoPatron = estadoLimpio.split(' ').slice(0, 7).join(' ').replace(/[^À-ſa-zA-Z0-9_ ]/g, '');
          estadosDetectados.add(nuevoPatron);
        }
      }
    }
  
    const estadosRef = db.ref("/estados");
    const estadosFirebase = (await estadosRef.once("value")).val() || {};
    const nuevasEntradas = {};
  
    for (let estado of estadosDetectados) {
      const claveEstado = limpiarClave(estado);
      if (!estadosFirebase[claveEstado]) {
        nuevasEntradas[claveEstado] = { 
          nombre: estado,
          seleccionado: true
        };
      }
    }
  
    if (Object.keys(nuevasEntradas).length > 0) {
      await estadosRef.update(nuevasEntradas);
    }
  
    // Continúa procesamiento de ventas
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
      
        const prevVenta = existingData[ventaId]?.ventas || {};
        const prevValor = existingData[ventaId]?.[seccion]?.[clave];
      
        if (seccion === 'ventas' && (clave === 'estado' || clave === 'descripción_del_estado')) {
          // Buscar la última versión del campo: estado, estado2, estado3...
          let version = 1;
          let ultimaClave = clave;
        
          while (prevVenta[`${clave}${version === 1 ? '' : version}`] !== undefined) {
            ultimaClave = `${clave}${version === 1 ? '' : version}`;
            version++;
          }
        
          const valorAnterior = prevVenta[ultimaClave] ?? '';
        
          // 🚫 Si el último estado es "Se ha finalizado el control de Posventa", no hacer nada de la fila
          let versionEstado = 1;
          let ultimaClaveEstado = 'estado';
          while (prevVenta[`estado${versionEstado === 1 ? '' : versionEstado}`] !== undefined) {
            ultimaClaveEstado = `estado${versionEstado === 1 ? '' : versionEstado}`;
            versionEstado++;
          }
          const estadoFinal = prevVenta[ultimaClaveEstado] ?? '';
          if (estadoFinal === 'Se ha finalizado el control de Posventa') {
            continue;
          }
        
          if (valorNuevo !== valorAnterior) {
            // Crear clave correcta: estado, estado2, estado3...
            const nuevaClave = `${clave}${version === 1 ? '' : version}`;
            ventaData[seccion][nuevaClave] = valorNuevo;
            hayCambios = true;

            console.log('valorNuevo:', valorNuevo, 'valorAnterior:', valorAnterior);

              // Agregar la fecha de actualización
              const fechaHoy = new Date().toLocaleDateString('es-ES'); // Formato DD/MM/YYYY
              ventaData[seccion]['actualizoHoy'] = fechaHoy; // Agregar la fecha al objeto de venta
          }
        
        } else {
          if (valorNuevo !== prevValor) {
            ventaData[seccion][clave] = valorNuevo;
            hayCambios = true;

            console.log('valorNuevo:', valorNuevo, 'valorAnterior:', prevValor);

            // Agregar la fecha de actualización
            const fechaHoy = new Date().toLocaleDateString('es-ES'); // Formato DD/MM/YYYY
            ventaData[seccion]['actualizoHoy'] = fechaHoy; // Agregar la fecha al objeto de venta
          }
        }                                
      }
      
      // Registro de actualizaciones si hay cambios
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
    const batchSize = 1000;
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
  
    const nuevosEstadosCreados = Object.values(nuevasEntradas).map(e => e.nombre);

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
          .counter2.imported {
            background-color: #28a745;
          }
          .counter2.changed {
            background-color: #007bff;
          }
          .estado-nuevo {
            background: #f1f1f1;
            padding: 8px 12px;
            border-radius: 8px;
            margin: 4px 0;
            font-size: 15px;
            font-family: monospace;
            color: #444;
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
          ${nuevosEstadosCreados.length > 0 ? `
            <hr style="margin: 20px 0;">
            <p>📌 Estados nuevos creados:</p>
            ${nuevosEstadosCreados.map(e => `<div class="estado-nuevo">• ${e}</div>`).join('')}
          ` : ''}
        </div>
      `,
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'swal2-macos-popup',
        title: 'swal2-macos-title',
        confirmButton: 'swal2-macos-button'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload(); // Recargar la página
      }
    });  
  });
  // FIN IMPORTACION DE VENTAS

  // ANALISIS DE ESTADOS
  const estadosRef = firebase.database().ref('estados');

  document.getElementById('btnFiltrar').addEventListener('click', async () => {
    const contenedor = document.getElementById('filtrarEstadosContenido');
    const guardarBtn = document.getElementById('guardarEstadosBtn');

    contenedor.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="height: 150px;">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      </div>
    `;
    guardarBtn.style.display = 'none';

    const snapshot = await estadosRef.once('value');
    const estados = snapshot.val();

    if (!estados) {
      contenedor.innerHTML = `<p class="text-danger text-center">No se encontraron estados.</p>`;
      return;
    }

    let html = `<div class="row">`;
    let count = 0;
    for (const [key, estado] of Object.entries(estados)) {
      const seleccionado = estado.seleccionado !== false; // default true
      html += `
        <div class="col-md-4 mb-3">
          <div class="form-check mac-check">
            <input class="form-check-input estado-checkbox" type="checkbox" id="estado_${key}" data-key="${key}" ${seleccionado ? 'checked' : ''}>
            <label class="form-check-label estado-nombre" for="estado_${key}">${estado.nombre}</label>
          </div>
        </div>
      `;
      count++;
    }
    html += `</div>`;
    contenedor.innerHTML = html;

    if (count > 0) {
      guardarBtn.style.display = 'block';
    }
  });

  document.getElementById('guardarEstadosBtn').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.estado-checkbox');
    const updates = {};

    checkboxes.forEach(cb => {
      const key = cb.dataset.key;
      updates[`estados/${key}/seleccionado`] = cb.checked;
    });

    await firebase.database().ref().update(updates);
    Swal.fire({
        title: '✅ Cambios guardados',
        text: 'Recargaré la página para cargar los nuevos estados seleccionados.',
        icon: 'success'
    }).then(() => {
        $('#filtrarModal').modal('hide');
        location.reload(); // Recarga la página para cargar los nuevos estados seleccionados
    });    
  });
  // FIN ANALISIS DE ESTADOS

  function obtenerUltimoEstado(venta) {
    const estados = Object.keys(venta.ventas)
        .filter(key => key.startsWith('estado') && key !== 'estadoActual') // <-- Evita incluir estadoActual
        .sort((a, b) => {
            // Extrae los números para ordenar correctamente
            const numA = parseInt(a.replace('estado', '')) || 0;
            const numB = parseInt(b.replace('estado', '')) || 0;
            return numA - numB;
        })
        .map(key => ({ clave: key, valor: venta.ventas[key] }));

    const descripciones = Object.keys(venta.ventas)
        .filter(key => key.startsWith('descripción_del_estado'))
        .sort((a, b) => {
            const numA = parseInt(a.replace('descripción_del_estado', '')) || 0;
            const numB = parseInt(b.replace('descripción_del_estado', '')) || 0;
            return numA - numB;
        })
        .map(key => ({ clave: key, valor: venta.ventas[key] }));

    const ultimoEstado = estados[estados.length - 1]?.valor || '';
    const ultimaDescripcion = descripciones[descripciones.length - 1]?.valor || '';

    return { 
        ultimoEstado, 
        ultimaDescripcion, 
        estados 
    };
}

// RENDERIZADO DE LA TABLA
function contarFilasSinControl(ventasFiltradas) {
  // Contador total de filas
  let totalFilas = 0;
  // Contador para filas que tienen el green-day
  let filasGreenDay = 0;

  ventasFiltradas.forEach(([ventaId, venta]) => {
      totalFilas += 1; // Incrementar total de filas

      // Verificar si hay un mensaje en la venta
      const mensajes = venta.control || {}; // Asegúrate de que esto es correcto
      const ultimoControlKey = Object.keys(mensajes).pop(); // Obtener la última clave
      const ultimoControl = mensajes[ultimoControlKey];

      if (ultimoControl) {
          const mensajeTexto = ultimoControl.mensaje; // Asegúrate de que esta propiedad existe
          const fechaRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}:\d{2}:\d{2})$/;
          const match = mensajeTexto.match(fechaRegex);

          if (match) {
              const [_, dia, mes, anio, hora] = match;
              const fechaMensaje = new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}`);
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              const fechaDelMensaje = new Date(fechaMensaje);
              fechaDelMensaje.setHours(0, 0, 0, 0);
              const diffDias = Math.floor((hoy - fechaDelMensaje) / (1000 * 60 * 60 * 24));

              // Contar filas con green-day
              if (diffDias === 0) { // Si es el mismo día
                  filasGreenDay += 1;
              }
          }
      }
  });

  // Calcular filas sin controlar
  const filasSinControl = totalFilas - filasGreenDay;

  // Actualizar el botón 'sinRevisar'
  const sinRevisarBtn = document.getElementById('sinRevisar');
  sinRevisarBtn.innerHTML = `
      <i class="bi bi-exclamation-circle-fill" style="color: orange;"></i> 
      Sin Control: <span style="color: red; font-weight: bold;">${filasSinControl}</span>
  `;
  sinRevisarBtn.title = `Filas sin controlar: ${filasSinControl}`; // Actualizar el título
}

document.addEventListener('DOMContentLoaded', async () => {
  const spinner = document.getElementById('spinner');
  const searchInput = document.getElementById('searchFacturacion');
  searchInput.value = "Aguardando que cargue la web ⏳";
  searchInput.disabled = true;
  spinner.style.display = 'block';

  try {
      const estadosSnapshot = await firebase.database().ref('estados').once('value');
      const estadosData = estadosSnapshot.val() || {};

      const estadosSeleccionados = Object.entries(estadosData)
          .filter(([_, estado]) => estado.seleccionado !== false)
          .map(([_, estado]) => estado.nombre.toLowerCase());

      const posventaSnapshot = await firebase.database().ref('posventa').limitToLast(40000).once('value');
      const posventaData = posventaSnapshot.val() || {};

      const ventasFiltradas = Object.entries(posventaData).filter(([ventaId, venta]) => {
          const ventasEstados = Object.entries(venta.ventas || {})
              .filter(([key]) => key.startsWith('estado') && key !== 'estadoActual')
              .sort(([a], [b]) => {
                  const numA = parseInt(a.replace('estado', '')) || 0;
                  const numB = parseInt(b.replace('estado', '')) || 0;
                  return numB - numA; // Orden descendente
              });

          if (ventasEstados.length === 0) return false;

          const ultimoEstadoValue = (ventasEstados[0][1] || "").toLowerCase().replace(/[.,;]/g, '');
          return estadosSeleccionados.some(estadoSel => ultimoEstadoValue.includes(estadoSel));
      });

      // Ordenar ventasFiltradas por fecha
      ventasFiltradas.sort((a, b) => {
          const fechaA = new Date(a[1].ventas.fecha_de_venta);
          const fechaB = new Date(b[1].ventas.fecha_de_venta);
          return fechaB - fechaA; // Orden descendente por fecha
      });

      const tbody = document.querySelector('#data-table tbody');
      tbody.innerHTML = ''; // Limpiar anterior

      // ENVIO DE EMAIL CANCELADAS
      const estadosFiltrados = ventasFiltradas.filter(([ventaId, venta]) => {
          const ultimoEstado = obtenerUltimoEstado(venta).ultimoEstado.toLowerCase();
          const transferido = venta.ventas.transferido === true; // Verificar si ya está transferido

          return !transferido && [
            "cancelaste la venta",
            "venta cancelada. no despachés",
            "cancelada por el comprador",
            "venta cancelada",
            "paquete cancelado",
            "cancelá la venta",
            "cancelamos la venta",
            "paquete cancelado por mercado libre"
        ].some(frase => ultimoEstado.startsWith(frase));
    });

    // Crear tabla con ventas canceladas
    if (estadosFiltrados.length > 0) {
        let htmlTabla = `
            <table class="table mac-os-table" style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: #007aff; color: white;">
                    <tr>
                        <th style="padding: 10px;">Operación</th>
                        <th style="padding: 10px;">Estado</th>
                        <th style="padding: 10px;">Descripción</th>
                        <th style="padding: 10px;">CUIT / DNI</th>
                        <th style="padding: 10px;">Producto y Cantidad</th>
                    </tr>
                </thead>
                <tbody>
        `;

        estadosFiltrados.forEach(([ventaId, venta]) => {
            const { ultimoEstado, ultimaDescripcion } = obtenerUltimoEstado(venta);
            const cuitDni = venta.facturación_al_comprador.tipo_y_número_de_documento || "No disponible";
            const productoCantidad = `${venta.publicaciones.sku}, X ${venta.ventas.unidades} u.`;

            htmlTabla += `
                <tr style="border: 1px solid #e0e0e0;">
                    <td style="padding: 10px; text-align: center;"><a href="https://www.mercadolibre.com.ar/ventas/${ventaId}/detalle" target="_blank">${ventaId}</a></td>
                    <td style="padding: 10px; text-align: center;">${ultimoEstado}</td>
                    <td style="padding: 10px; text-align: center;">${ultimaDescripcion}</td>
                    <td style="padding: 10px; text-align: center;">${cuitDni}</td>
                    <td style="padding: 10px; text-align: center;">${productoCantidad}</td>
                </tr>
            `;
        });

        htmlTabla += `
                </tbody>
            </table>
        `;

        // Aquí se envía el correo con los detalles de las ventas canceladas
        const nombreDestinatario = "Posventa Web";
        const nombreTanda = "Tanda de Ventas Canceladas";
        const horaSubida = new Date().toLocaleTimeString();

        const emailBody = `
            <html>
            <head>
                <style>
                    body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { max-width: 800px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    h2 { color: #333333; }
                    p { color: #333333; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                    .header { background-color: #007aff; color: white; padding: 10px; text-align: center; border-radius: 10px }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; text-align: center; border: 1px solid #e0e0e0; }
                    th { background-color: #007aff; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    tr:hover { background-color: #f1f1f1; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Informe de Ventas Canceladas</h2>
                    </div>
                    <h3>Hola ${nombreDestinatario} 👋,</h3>
                    <p>Tienes disponible una nueva tanda de ventas canceladas. 📉</p>
                    ${htmlTabla}
                    <p style="color: #333333;">Saludos,</p>
                    <p style="color: #333333;">Equipo de Posventa Novogar 🍏</p>
                    <div class="footer">Este es un mensaje automático, por favor no respondas.</div>
                </div>
            </body>
            </html>
        `;

          await enviarCorreoConDetalles("esperanza.toffalo@novogar.com.ar", "Esperanza Toffalo", nombreTanda, horaSubida, emailBody);
          await enviarCorreoConDetalles("marina.braidotti@novogar.com.ar", "Marina Braidotti", nombreTanda, horaSubida, emailBody);
          await enviarCorreoConDetalles("posventanovogar@gmail.com", "Posventa Web", nombreTanda, horaSubida, emailBody);
          await enviarCorreoConDetalles("agustina.benedetto@novogar.com.ar", "Agustina Benedetto", nombreTanda, horaSubida, emailBody);
          await enviarCorreoConDetalles("natalia.rodriguez@novogar.com.ar", "Natalia Rodriguez", nombreTanda, horaSubida, emailBody);
          await enviarCorreoConDetalles("mauricio.daffonchio@novogar.com.ar", "Mauricio Daffonchio", nombreTanda, horaSubida, emailBody);

          // Actualizar Firebase para cada venta
          for (const [ventaId] of estadosFiltrados) {
            const ventaRef = firebase.database().ref(`/posventa/${ventaId}/ventas`);
            const skillsRef = firebase.database().ref(`/posventa/${ventaId}/skills`);

            // Obtener los datos actuales para identificar el último estado y descripción
            const snapshot = await ventaRef.once('value');
            const data = snapshot.val();

            let ultimoEstado = 1; // Comenzamos desde 1 para saltar a 2
            let ultimoDescripcion = 1; // Comenzamos desde 1 para saltar a 2

            // Buscar el último estado existente
            while (data[`estado${ultimoEstado + 1}`]) {
                ultimoEstado++;
            }

            // Buscar el último descripción existente
            while (data[`descripción_del_estado${ultimoDescripcion + 1}`]) {
                ultimoDescripcion++;
            }

            // Crear el nuevo estado y descripción
            const nuevoEstado = ultimoEstado + 1; // Esto comenzará desde 2
            const nuevoDescripcion = ultimoDescripcion + 1; // Esto comenzará desde 2

            const estadoTexto = "Se ha transferido la operación por email al sector de facturación para su control";
            const descripcionTexto = "Transferido a Facturacion";

            // Actualizar Firebase con el nuevo estado y descripción
            await ventaRef.update({
                transferido: true,
                [`estado${nuevoEstado}`]: estadoTexto,
                [`descripción_del_estado${nuevoDescripcion}`]: descripcionTexto,
                estadoActual: "TRANSFERIDO A FACTURACION"
            });

            await skillsRef.update({
              "transferido a facturacion": true
            });
          }
        // NO HACER NADA, solo enviar el correo
      } else {
          console.log("No hay ventas canceladas para mostrar.");
      }
      // FIN ENVIO DE EMAIL CANCELADAS

      // ENVIO DE EMAIL DEVOLUCIONES
      // Filtrar estados que comienzan con "devolución para revisar" o "devuelto"
      const devolucionesFiltradas = ventasFiltradas.filter(([ventaId, venta]) => {
        const ultimoEstado = obtenerUltimoEstado(venta).ultimoEstado.toLowerCase();
        const transferido = venta.ventas.transferido === true; // Verificar si ya está transferido

      return !transferido && [
        "devolución para revisar",
        "devolución finalizada el producto no está apto",
        "devuelto"
          ].some(frase => ultimoEstado.startsWith(frase));
        });

      // Crear tabla para devoluciones
      let htmlTablaDevoluciones = '';
      if (devolucionesFiltradas.length > 0) {
        htmlTablaDevoluciones = `
            <table class="table mac-os-table" style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: #007aff; color: white;">
                    <tr>
                        <th style="padding: 10px;">Operación</th>
                        <th style="padding: 10px;">Estado</th>
                        <th style="padding: 10px;">Descripción</th>
                        <th style="padding: 10px;">CUIT / DNI</th>
                        <th style="padding: 10px;">Producto y Cantidad</th>
                    </tr>
                </thead>
                <tbody>
        `;

        devolucionesFiltradas.forEach(([ventaId, venta]) => {
            const { ultimoEstado, ultimaDescripcion } = obtenerUltimoEstado(venta);
            const cuitDni = venta.facturación_al_comprador.tipo_y_número_de_documento || "No disponible";
            const productoCantidad = `${venta.publicaciones.sku}, X ${venta.ventas.unidades} u.`;

            htmlTablaDevoluciones += `
                <tr style="border: 1px solid #e0e0e0;">
                    <td style="padding: 10px; text-align: center;"><a href="https://www.mercadolibre.com.ar/ventas/${ventaId}/detalle" target="_blank">${ventaId}</a></td>
                    <td style="padding: 10px; text-align: center;">${ultimoEstado}</td>
                    <td style="padding: 10px; text-align: center;">${ultimaDescripcion}</td>
                    <td style="padding: 10px; text-align: center;">${cuitDni}</td>
                    <td style="padding: 10px; text-align: center;">${productoCantidad}</td>
                </tr>
            `;
        });

        htmlTablaDevoluciones += `
                </tbody>
            </table>
        `;

        // Enviar el correo para devoluciones
        const nombreTandaDevoluciones = "Nuevas Devoluciones para Revisar";
        const horaSubidaDevoluciones = new Date().toLocaleTimeString();

        const emailBodyDevoluciones = `
            <html>
            <head>
                <style>
                    body { font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px; }
                    .container { max-width: 800px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                    h2 { color: #333333; }
                    p { color: #333333; }
                    .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
                    .header { background-color: #007aff; color: white; padding: 10px; text-align: center; border-radius: 10px }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 10px; text-align: center; border: 1px solid #e0e0e0; }
                    th { background-color: #007aff; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    tr:hover { background-color: #f1f1f1; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Informe de Nuevas Devoluciones para Revisar</h2>
                    </div>
                    <h3>Hola Elias Pignani 👋,</h3>
                    <p>Tienes disponible una nueva tanda de devoluciones para revisar. 📉</p>
                    ${htmlTablaDevoluciones}
                    <p style="color: #333333;">Saludos,</p>
                    <p style="color: #333333;">Equipo de Posventa Novogar 🍏</p>
                    <div class="footer">Este es un mensaje automático, por favor no respondas.</div>
                </div>
            </body>
            </html>
        `;

        await enviarCorreoConDetalles("elias.pignani@novogar.com.ar", "Elias Pignani", nombreTandaDevoluciones, horaSubidaDevoluciones, emailBodyDevoluciones);
        await enviarCorreoConDetalles("esperanza.toffalo@novogar.com.ar", "Esperanza Toffalo", nombreTandaDevoluciones, horaSubidaDevoluciones, emailBodyDevoluciones);
        await enviarCorreoConDetalles("posventanovogar@gmail.com", "Posventa Web", nombreTandaDevoluciones, horaSubidaDevoluciones, emailBodyDevoluciones);

      } else {
        console.log("No hay devoluciones para revisar.");
      }

      // Actualizar Firebase para cada venta
      for (const [ventaId] of devolucionesFiltradas) { // Asegúrate de usar devolucionesFiltradas
        const ventaRef = firebase.database().ref(`/posventa/${ventaId}/ventas`);
        const skillsRef = firebase.database().ref(`/posventa/${ventaId}/skills`);

        // Obtener los datos actuales para identificar el último estado y descripción
        const snapshot = await ventaRef.once('value');
        const data = snapshot.val();

        let ultimoEstado = 1;
        let ultimoDescripcion = 1;

        // Buscar el último estado existente
        while (data[`estado${ultimoEstado + 1}`]) {
            ultimoEstado++;
        }

        // Buscar el último descripción existente
        while (data[`descripción_del_estado${ultimoDescripcion + 1}`]) {
            ultimoDescripcion++;
        }

        // Crear el nuevo estado y descripción
        const nuevoEstado = ultimoEstado + 1;
        const nuevoDescripcion = ultimoDescripcion + 1;

        const estadoTexto = "La devolución llegó a NOVOGAR, se ha finalizado el control de posventa";
        const descripcionTexto = "Llego a Novogar";

        // Actualizar Firebase con el nuevo estado y descripción
        try {
            await ventaRef.update({
                transferido: true,
                [`estado${nuevoEstado}`]: estadoTexto,
                [`descripción_del_estado${nuevoDescripcion}`]: descripcionTexto,
                estadoActual: "LLEGO A NOVOGAR"
            });
        } catch (error) {
            console.error("Error al actualizar ventaRef:", error);
        }

        try {
            await skillsRef.update({
                "transferido a devoluciones": true
            });
        } catch (error) {
            console.error("Error al actualizar skillsRef:", error);
        }
      }
      // FIN ENVIO DE EMAIL DEVOLUCIONES

      ventasFiltradas.forEach(([ventaId, venta]) => {
          const { ultimoEstado, ultimaDescripcion } = obtenerUltimoEstado(venta); // Obtener último estado y descripción

          const cantidadEstados = Object.keys(venta.ventas).filter(key => key.startsWith('estado') && key !== 'estadoActual').length;
          const iconClass = cantidadEstados > 1 ? 'fas fa-history text-success' : 'fas fa-history';
          

          const row = document.createElement('tr');
          row.innerHTML = `
              <td>
                  <div class="clientePosventa-gris" id="cliente-posventa-${ventaId}">
                    Buscando <div class="spinner-border text-secondary" role="status" style="width: 1rem; height: 1rem;">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                  <div class="mac-cell mac-cell-posventa" style="position: relative;">
                      <div class="venta-id">
                          <a href="https://www.mercadolibre.com.ar/ventas/${ventaId}/detalle" target="_blank" style="text-decoration: none; color: #333;">
                              ${ventaId}
                          </a>
                          <i class="bi bi-clipboard" id="clipboard-${ventaId}" onclick="copyToClipboard('${ventaId}', this)" style="cursor: pointer; font-size: 18px; color: #333;"></i>
                          <i class="${iconClass}" onclick="abrirModalTimeline('${ventaId}')" style="cursor: pointer;"></i>
                          <i class="bi bi-plus-circle-fill icon-user-plus" onclick="controlarCaso('${ventaId}', this)"></i>
                      </div>

                      <!-- Verificación de fecha -->
                      ${venta.ventas.actualizoHoy && venta.ventas.actualizoHoy === new Date().toLocaleDateString('es-AR') ? `
                      <div class="mac-notification" style="background-color: #007bff; color: white; border-radius: 8px; padding: 2px; margin-bottom: 2px; font-family: 'Rubik', sans-serif; text-transform: uppercase; font-weight: bold;">
                          Actualizó hoy <i class="bi bi-check-circle" style="color: white;"></i>
                      </div>
                      ` : ''}

                      <select class="estado-select" data-venta-id="${ventaId}">
                          <option value="">Selecciona un estado</option>
                          <option value="CONTROL FINALIZADO">CONTROL FINALIZADO</option>
                          <option value="TRANSFERIDO A FACTURACION">TRANSFERIDO A FACTURACION</option>
                          <option value="LLEGO A NOVOGAR">LLEGO A NOVOGAR</option>
                          <option value="SEGUIR RECLAMO EN FORMULARIO">SEGUIR RECLAMO EN FORMULARIO</option>
                          <option value="ENTREGADO CON DEBITO">ENTREGADO CON DEBITO</option>
                      </select>
                      <div class="fecha-venta" style="font-size: 12px; color: #777;">
                          ${venta.ventas.fecha_de_venta}
                      </div>
                  </div>
              </td>

              <td style="vertical-align: middle; font-family: 'Rubik', sans-serif; font-size: 16px; padding: 15px;">
                  <div style="
                      display: inline-block;
                      padding: 10px 16px;
                      border-radius: 12px;
                      background: rgba(245, 245, 245, 0.7);
                      border: 1px solid rgba(200, 200, 200, 0.6);
                      font-weight: 600;
                      font-size: 18px;
                      color: ${venta.ventas['total_(ars)'] < 0 ? 'red' : venta.ventas['total_(ars)'] > 0 ? 'green' : 'orange'};
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
                      backdrop-filter: blur(6px);
                  ">
                      ${venta.ventas['total_(ars)'] > 0 
                          ? '$' + venta.ventas['total_(ars)'].toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') 
                          : venta.ventas['total_(ars)'] < 0 
                              ? '$ -' + Math.abs(venta.ventas['total_(ars)']).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') 
                              : '<span style="color: orange;">$0</span>'
                      }
                  </div>

                  <div style="margin-top: 10px; font-size: 14px; color: #555; line-height: 1.4;">
                      <div>
                        <span style="font-weight: bold; color: #555;">SKU:</span> 
                        <span style="color: #4a6fa5; font-weight: bold">${venta.publicaciones.sku}</span>
                      </div>
                      <div><span style="font-weight: bold;">Cantidad:</span> ${venta.ventas.unidades}</div>
                  </div>

                          <div style="margin-top: 6px; font-size: 10px; color: #333; font-style: italic;">
                      ${venta.publicaciones.título_de_la_publicación.length > 60 
                          ? venta.publicaciones.título_de_la_publicación.substring(0, 60) + '...' 
                          : venta.publicaciones.título_de_la_publicación
                      }
                  </div>
              </td>
              <td style="vertical-align: middle; font-family: 'Rubik', sans-serif;">
                ${ultimoEstado}
                ${venta.comentarios && venta.comentarios.numeroCaso && venta.comentarios.vencimientoDevolucion ? (() => {
                    const vencimiento = venta.comentarios.vencimientoDevolucion || "No disponible";
                    const numeroCaso = venta.comentarios.numeroCaso || "No disponible";
                    const ventaId = venta.ventas._de_venta || "No disponible";

                    const [dia, mes, anio] = vencimiento.split('/').map(n => parseInt(n));
                    const fechaVencimiento = new Date(anio, mes - 1, dia);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
                    const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    let divStyle = "background-color: #e8f5e9; border: 1px solid #c8e6c9;";
                    let estadoTexto = `<span style='color: #4caf50; font-weight: bold;'>Faltan ${diffDias} día(s)</span>`;

                    if (diffDias === 0) {
                        divStyle = "background-color: #fff3e0; border: 1px solid #ffe0b2;";
                        estadoTexto = `<span style='color: #fb8c00; font-weight: bold;'>🚨 VENCE HOY</span>`;
                    } else if (diffDias < 0) {
                        divStyle = "background-color: #ffebee; border: 1px solid #ffcdd2;";
                        estadoTexto = `<span style='color: #e53935; font-weight: bold;'>❌ PLAZO VENCIDO hace ${Math.abs(diffDias)} día(s)</span>`;
                    }

                    return `
                        <div onclick="handleDivClick('${ventaId}', '${vencimiento}', '${numeroCaso}', \`${estadoTexto}\`)" style="
                            margin-top: 10px;
                            ${divStyle}
                            border-radius: 8px;
                            padding: 12px 16px;
                            font-size: 14px;
                            font-weight: normal;
                            color: #333;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            transition: background-color 0.3s;
                            cursor: pointer;
                        ">
                            <strong style="color: #1976d2;">📂 Reclamado en caso ${numeroCaso}</strong><br>
                            <span style="color: #555;">🕒 vence ${vencimiento}</span>
                            <div style="font-size: 12px; margin-top: 6px;">
                                ${estadoTexto}
                            </div>
                        </div>
                    `;
                })() : ''}
              </td>
              <td style="vertical-align: middle;">
                ${ultimaDescripcion}
                <i class="bi bi-plus-circle-fill icon-user-plus" onclick="abrirSkillsModalFilas('${ventaId}')"></i>
                <div class="div-skills-${ventaId}" style="margin-top: 10px;"></div>
              </td>
              <td style="vertical-align: middle;">
                <div style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 12px;
                  padding: 8px;
                  background: linear-gradient(145deg, #f5f5fa, #e6e6ec);
                  border-radius: 14px;
                  box-shadow: inset 2px 2px 6px #d1d1d8, inset -2px -2px 6px #ffffff;
                  transition: all 0.3s ease;
                  min-width: 60px;
                ">
                  <!-- Comentario -->
                  <i class="bi bi-chat-quote-fill"
                    title="Comentario"
                    onclick="abrirModalComentario('${ventaId}', this)"
                    style="
                      cursor: pointer;
                      color: ${venta.comentarios ? '#38B34D' : '#bbb'};
                      font-size: 28px;
                      transition: color 0.2s ease;
                    "></i>

                  <!-- Tracking -->
                  <i id="tracking-posventa-${ventaId}"
                    class="bi bi-geo-alt-fill"
                    title="Tracking"
                    style="
                      font-size: 28px;
                      color: ${venta.ventas.transportCompany 
                                ? (venta.ventas.transportCompany === 'Novogar' || venta.ventas.transportCompany === 'PlaceIt'
                                    ? '#d9534f'
                                    : '#28a745') 
                                : '#EB981C'};
                      ${venta.ventas.transportCompany === 'Novogar' || venta.ventas.transportCompany === 'PlaceIt'
                          ? 'pointer-events: none; opacity: 0.5;'
                          : 'cursor: pointer;'}
                      transition: all 0.3s ease;
                    "
                    ${venta.ventas.transportCompany && venta.ventas.transportCompany !== 'Novogar' && venta.ventas.transportCompany !== 'PlaceIt'
                      ? `onclick="window.open('${venta.ventas.trackingLink}', '_blank')"`
                      : ''}
                  ></i>

                  <!-- Herramienta -->
                  <i class="bi bi-hammer"
                    title="Herramienta"
                    style="
                      cursor: pointer;
                      color: #4a6fa5;
                      font-size: 28px;
                      transition: color 0.2s ease;
                    "
                    onclick="copyHammerData('${ventaId}', 
                      ${venta.comentarios ? `'${venta.comentarios.operacion}'` : "'No disponible'"}, 
                      '${venta.comentarios ? venta.comentarios.numeroCaso : "No disponible"}', 
                      '${venta.comentarios ? venta.comentarios.vencimientoDevolucion : "No disponible"}', 
                      '${ultimoEstado}', 
                      '${ultimaDescripcion}', 
                      '${venta.publicaciones.sku}', 
                      '${venta.ventas.unidades}', 
                      ${venta.ventas['total_(ars)']}
                    )"></i>
                </div>
              </td>
                 `;
          tbody.appendChild(row);

          cargarSkillsDeFila(ventaId)

          buscarClientePosventa(venta, ventaId);

          buscarTrackingPosventa(venta, ventaId);

          // Llamar a la función para contar filas sin control
          contarFilasSinControl(ventasFiltradas);

          // Después de que se haya completado la carga de la tabla
          const cantidadFilas = ventasFiltradas.length; // Obtener la cantidad de filas
          const promedioBtn = document.getElementById('promedioBtn');

          // Actualizar el texto y el icono del botón
          promedioBtn.innerHTML = `
              <i class="bi bi-bar-chart-line-fill"></i> 
              Cantidad de filas <span style="color: red; font-weight: bold;">${cantidadFilas}</span>
          `;
          promedioBtn.title = `Promedio Despacho: ${cantidadFilas} filas`;

          // Cargar el último control y mostrar el avatar
          const controles = venta.control || {};
          const ultimoControlKey = Object.keys(controles).pop(); // Obtener la última clave
          const ultimoControl = controles[ultimoControlKey];

          if (ultimoControl) {
              const { operador, mensaje } = ultimoControl;
              const macCell = row.querySelector('.mac-cell-posventa');
              mostrarBurbujaControl(macCell, operador, mensaje); // Mostrar burbuja con el último control
          }

          // Establecer el valor del select con el estado actual
          const estadoGuardado = venta.ventas.estadoActual; // Cargar el estado actual
          const estadoSelect = row.querySelector('.estado-select');
          estadoSelect.value = estadoGuardado || ""; // Cargar el estado actual en el select

          // Cambiar el color de la fila según el estado guardado
          if (estadoGuardado) {
              switch (estadoGuardado) {
                  case "CONTROL FINALIZADO":
                      row.style.backgroundColor = "#c8e6c9"; // Verde claro
                      break;
                  case "TRANSFERIDO A FACTURACION":
                      row.style.backgroundColor = "#bbdefb"; // Azul claro
                      break;
                  case "LLEGO A NOVOGAR":
                      row.style.backgroundColor = "#ffe0b2"; // Naranja claro
                      break;
                  case "SEGUIR RECLAMO EN FORMULARIO":
                      row.style.backgroundColor = "#f8bbd0"; // Rosa claro
                      break;
                  case "ENTREGADO CON DEBITO":
                      row.style.backgroundColor = "#d1c4e9"; // Lavanda claro
                      break;
                  default:
                      row.style.backgroundColor = ""; // Sin color
              }
          }

          // Agregar evento para el select
          estadoSelect.addEventListener('change', async (event) => {
              const nuevoEstado = event.target.value;
              let mensajeUltimoEstado = "";
              let mensajeUltimaDescripcion = ""; // Asegúrate de declarar esta variable

              if (nuevoEstado) {
                  // Establecer el mensaje correspondiente según el estado seleccionado
                  switch (nuevoEstado) {
                      case "CONTROL FINALIZADO":
                          mensajeUltimoEstado = "Se ha finalizado el control de Posventa";
                          mensajeUltimaDescripcion = "Control Finalizado";
                          row.style.backgroundColor = "#c8e6c9"; // Verde claro
                          break;
                      case "TRANSFERIDO A FACTURACION":
                          mensajeUltimoEstado = "Se ha transferido la operación por email al sector de facturación para su control";
                          mensajeUltimaDescripcion = "Transferido a Facturacion";
                          row.style.backgroundColor = "#bbdefb"; // Azul claro
                          break;
                      case "LLEGO A NOVOGAR":
                          mensajeUltimoEstado = "La devolución llegó a NOVOGAR, se ha finalizado el control de posventa";
                          mensajeUltimaDescripcion = "Llego a Novogar";
                          row.style.backgroundColor = "#ffe0b2"; // Naranja claro
                          break;
                      case "SEGUIR RECLAMO EN FORMULARIO":
                          mensajeUltimoEstado = "La devolución dejó de actualizar los estados, seguir fecha de retorno brindado en Caso.";
                          mensajeUltimaDescripcion = "Seguir reclamo en formulario";
                          row.style.backgroundColor = "#f8bbd0"; // Rosa claro
                          break;
                      case "ENTREGADO CON DEBITO":
                          mensajeUltimoEstado = "Entregado al cliente con débito de dinero al vendedor";
                          mensajeUltimaDescripcion = "Entregado con Debito (FRAUDE)";
                          row.style.backgroundColor = "#d1c4e9"; // Lavanda claro
                          break;
                      default:
                          row.style.backgroundColor = ""; // Sin color
                  }

                  // Obtener el índice del último estado
                  const estadosExistentes = Object.keys(venta.ventas).filter(key => key.startsWith('estado'));
                  const nuevoEstadoIndex = estadosExistentes.length + 1; // Incrementar el índice

                  // Pushear el nuevo estado a Firebase
                  const updates = {};
                  updates[`/posventa/${ventaId}/ventas/estado${nuevoEstadoIndex}`] = mensajeUltimoEstado; // Guardar el nuevo estado
                  updates[`/posventa/${ventaId}/ventas/descripción_del_estado${nuevoEstadoIndex}`] = mensajeUltimaDescripcion; // Guardar la descripción del nuevo estado
                  updates[`/posventa/${ventaId}/ventas/estadoActual`] = nuevoEstado; // Guardar el estado actual

                  await firebase.database().ref().update(updates);
                  console.log(`Estado actualizado: ${nuevoEstado}`);
              }
          });
      });

  } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Hubo un problema al cargar los datos');
  } finally {
      spinner.style.display = 'none';
      searchInput.disabled = false;
      searchInput.value = "";
  }
});

// ENVIAR EMAIL CON VENTAS CANCELADAS
async function enviarCorreoConDetalles(destinatarioEmail, nombreDestinatario, nombreTanda, horaSubida, emailBody) {
  const fecha = new Date().toLocaleDateString();
  const Subject = `LogiPaq - ${nombreTanda} - ${fecha}`;
  const smtpU = 's154745_3';
  const smtpP = 'QbikuGyHqJ';

  const emailData = {
      "Html": {
          "DocType": null,
          "Head": null,
          "Body": emailBody,
          "BodyTag": "<body>"
      },
      "Text": "",
      "Subject": Subject,
      "From": {
          "Name": "Posventa Novogar",
          "Email": "posventa@novogar.com.ar"
      },
      "To": [
          {
              "Name": nombreDestinatario,
              "Email": destinatarioEmail
          }
      ],
      "Cc": [],
      "Bcc": ["webnovagar@gmail.com", "posventa@novogar.com.ar"],
      "CharSet": "utf-8",
      "User": {
          "Username": smtpU,
          "Secret": smtpP,
      }
  };

  try {
      const response = await fetch('https://proxy.cors.sh/https://send.mailup.com/API/v2.0/messages/sendmessage', {
          method: 'POST',
          headers: {
              'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
      });

      const result = await response.json();
      if (result.Status === 'done') {
          console.log(`Email enviado a ${destinatarioEmail}, Motivo: ${nombreTanda}`);
          showAlertPosventa(`Email enviado a ${destinatarioEmail}, Motivo: ${nombreTanda}`);
      } else {
          console.log(`Error al enviar el email: ${result.Message}`);
          showAlertErrorPosventa(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${horaSubida}`);
      }
  } catch (error) {
      console.error('Error al enviar el email:', error);
      showAlertErrorPosventa(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${destinatarioEmail} a las ${horaSubida}`);
  }
}
// FIN ENVIAR EMAIL CON VENTAS CANCELADAS

// ALERT EMAIL
function showAlertPosventa(message) {
  const alertElement = document.createElement('div');
  alertElement.className = 'alert';
  alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
  document.body.appendChild(alertElement);
  alertElement.style.bottom = `${20 + alertCount * 70}px`;
  setTimeout(() => {
      alertElement.classList.add('show');
  }, 10);
  alertElement.querySelector('.close').onclick = () => {
      closeAlert(alertElement);
  };
  setTimeout(() => {
      closeAlert(alertElement);
  }, 8000);
  alertCount++;
}

function showAlertErrorPosventa(message) {
  const alertElement = document.createElement('div');
  alertElement.className = 'alertError';
  alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
  document.body.appendChild(alertElement);
  alertElement.style.bottom = `${20 + alertCount * 70}px`;
  setTimeout(() => {
      alertElement.classList.add('show');
  }, 10);
  alertElement.querySelector('.close').onclick = () => {
      closeAlert(alertElement);
  };
  setTimeout(() => {
      closeAlert(alertElement);
  }, 8000);
  alertCount++;
}

function closeAlert(alertElement) {
  alertElement.classList.remove('show');
  setTimeout(() => {
      document.body.removeChild(alertElement);
      alertCount--;
      updateAlertPositions();
  }, 300);
}

function updateAlertPositions() {
  const alerts = document.querySelectorAll('.alert, .alertError');
  alerts.forEach((alert, index) => {
      alert.style.bottom = `${20 + index * 70}px`;
  });
}
// FIN ALERT EMAIL

// BUSCAR TRACKING POSVENTA
function buscarTrackingPosventa(venta, ventaId) {
  const divTracking = document.getElementById(`tracking-posventa-${ventaId}`);
  if (!divTracking) return;

  const trackingIconLoading = 'fas fa-spinner fa-spin';
  const trackingIconFound = 'bi bi-geo-alt-fill';
  const trackingIconNotFound = 'bi bi-geo-alt-fill';

  // Si ya tiene transportCompany o shippingMode me2, no seguimos
  if (venta.ventas.transportCompany || venta.ventas.shippingMode === "me2") {
    return;
  }

  // Mostrar spinner mientras carga
  divTracking.className = trackingIconLoading;
  divTracking.style.color = '#EB981CFF';
  divTracking.style.cursor = 'default';
  divTracking.onclick = null;

  window.dbMeli.ref(`/envios/${ventaId}`).once("value")
    .then((snapshot) => {
      const envio = snapshot.val();
      const skillsRef = window.db.ref(`/posventa/${ventaId}/skills`);
      const skills = {};

      if (!envio) {
        skills["No en LogiPaq (Base de Datos)"] = true;
        skillsRef.update(skills).catch(console.error);
        divTracking.className = trackingIconNotFound;
        divTracking.style.color = '#6c757d';
        divTracking.style.cursor = 'default';
        divTracking.onclick = null;
        return;
      }

      const { transportCompany, trackingNumber, trackingLink, shippingMode } = envio;

      if (shippingMode === "me1") skills["me1"] = true;
      if (shippingMode === "me2") skills["me2"] = true;

      if (transportCompany) {
        const companyLower = transportCompany.toLowerCase();
        if (companyLower.includes("cruz del sur")) skills["cruz del sur"] = true;
        if (companyLower.includes("andesmar")) skills["andesmar"] = true;
        if (companyLower.includes("andreani")) skills["andreani"] = true;
        if (companyLower.includes("placeit")) skills["place it"] = true;
        if (companyLower.includes("novogar")) skills["Logistica novogar"] = true;
      }

      if (Object.keys(skills).length > 0) {
        skillsRef.update(skills).catch(console.error);
      }

      // Si hay datos válidos de tracking
      if (transportCompany && trackingNumber && trackingLink) {
        window.db.ref(`/posventa/${ventaId}/ventas`).update({
          transportCompany,
          trackingNumber,
          trackingLink,
          shippingMode,
        }).then(() => {
          const isDisabledCompany = ["Novogar", "PlaceIt"].includes(transportCompany);
          divTracking.className = trackingIconFound;
          divTracking.style.fontSize = '24px';

          if (isDisabledCompany) {
            divTracking.style.color = 'red';
            divTracking.style.pointerEvents = 'none';
            divTracking.style.opacity = '0.6';
            divTracking.onclick = null;
          } else {
            divTracking.style.color = '#28a745';
            divTracking.style.cursor = 'pointer';
            divTracking.onclick = () => window.open(trackingLink, '_blank');
          }
        }).catch((error) => {
          console.error("🔥 Error al guardar tracking:", error);
          divTracking.className = trackingIconNotFound;
          divTracking.style.color = '#6c757d';
          divTracking.style.cursor = 'default';
          divTracking.onclick = null;
        });
      } else {
        divTracking.className = trackingIconNotFound;
        divTracking.style.color = '#6c757d';
        divTracking.style.cursor = 'default';
        divTracking.onclick = null;
      }
    })
    .catch((error) => {
      console.error("🔥 Error buscando tracking en MELI:", error);
      divTracking.className = trackingIconNotFound;
      divTracking.style.color = '#6c757d';
      divTracking.style.cursor = 'default';
      divTracking.onclick = null;
    });
}
// FIN BUSCAR TRACKING POSVENTA

window.handleDivClick = function(ventaId, vencimiento, numeroCaso, estadoTexto) {
  const cleanEstado = estadoTexto.replace(/<[^>]*>?/gm, ''); // Elimina tags HTML
  const alertMessage = `📝:\nOperación ${ventaId}, plazo de vencimiento ${vencimiento}, reclamado en el caso ${numeroCaso}, estado actual: ${cleanEstado}`;
  
  navigator.clipboard.writeText(alertMessage).then(() => {
      showAlert(alertMessage); // Asegurate de tener showAlert definido
  }).catch(err => {
      console.error('Error al copiar al portapapeles: ', err);
  });
};

// MARTILLO GENERAL
async function copyHammerData(ventaId, estadoActual, ultimaDescripcion, sku, unidades, total) {
  // Obtener el nombre del operador
  const activeAvatar = document.getElementById("active-avatar");
  const nombreOperador = activeAvatar ? activeAvatar.alt : "Operador desconocido";

  // Obtener la fecha del día
  const fechaHoy = new Date();
  const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
  const fechaFormateada = fechaHoy.toLocaleDateString('es-AR', opcionesFecha);

  // Formateo del total en pesos argentinos
  const totalFormateado = total ? total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) : "$0,00";
  let estadoCobro;

  if (total === 0) {
      estadoCobro = "DINERO DEBITADO";
  } else if (total < 0) {
      estadoCobro = "SE COBRÓ RETORNO DE LA DEVOLUCIÓN A NOVOGAR";
  } else {
      estadoCobro = "DINERO ACREDITADO";
  }

  // Obtener skills activas del ventaId
  const activeSkills = await getActiveSkills(ventaId);
  const skills = await getSkillsDescriptions(activeSkills); // Obtener descripciones de skills

  let skillsMensaje = '';
  if (skills.length > 0) {
      skillsMensaje += `DETALLES POSVENTA:\n`;
      skills.forEach(skill => {
          const skillText = skill.text || "Sin nombre"; // Valor por defecto si text es undefined
          const skillDescripcion = skill.descripcion || "Sin descripción"; // Valor por defecto si descripcion es undefined

          skillsMensaje += `${skillText.toUpperCase()}: ${skillDescripcion.charAt(0).toUpperCase() + skillDescripcion.slice(1)}\n`;
      });
      skillsMensaje += `\n`;
  }

  // Obtener comentarios desde Firebase
  const comentarios = await getComentarios(ventaId);

  // Construir el mensaje base
  let mensaje = `Venta ID: ${ventaId}\n\n` +
                `ESTADO:\n` +
                `Estado Actual: ${estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1).toLowerCase()}\n` +
                `Descripción: ${ultimaDescripcion.charAt(0).toUpperCase() + ultimaDescripcion.slice(1).toLowerCase()}\n\n` +
                `PRODUCTO: ${sku}\n` +
                `CANTIDAD: X ${unidades} u.\n` +
                `COBRO HASTA LA REVISIÓN: ${totalFormateado} (${estadoCobro})\n\n` +
                skillsMensaje;

  // Verificar si hay comentarios disponibles
  if (comentarios && comentarios.length > 0) {
      mensaje += `COMENTARIOS:\n` +
                 `Comentarios: ${comentarios[2] || "No disponible"}\n` + // Primer comentario
                 `Número de Caso: ${comentarios[1] || "No disponible"}\n` + // Segundo comentario
                 `Vencimiento Devolución: ${comentarios[3] === 'Invalid Date' ? "No corresponde ser reclamado aún" : (comentarios[2] || "No disponible")}\n\n`;
  }

  // Agregar "REVISADO POR" al final del mensaje
  mensaje += `\nREVISADO POR: ${nombreOperador} - FECHA: ${fechaFormateada}\n`;

  // Copiar al portapapeles y mostrar el alert
  try {
      await navigator.clipboard.writeText(mensaje);
      showAlert(`📝 Copiado:\n${mensaje}`);
  } catch (err) {
      console.error('Error al copiar al portapapeles: ', err);
  }
}

// Función para obtener los comentarios desde Firebase
async function getComentarios(ventaId) {
  const comentarios = [];
  const comentariosRef = firebase.database().ref(`/posventa/${ventaId}/comentarios`);
  const snapshot = await comentariosRef.once('value');

  if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
          const comentario = childSnapshot.val();
          comentarios.push(comentario);
      });
  }

  return comentarios;
}

// Función para obtener las skills activas desde Firebase
async function getActiveSkills(ventaId) {
  const activeSkills = [];
  const skillsRef = firebase.database().ref(`/posventa/${ventaId}/skills`);
  const snapshot = await skillsRef.once('value');

  if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
          const skillName = childSnapshot.key; // Nombre de la skill
          const isActive = childSnapshot.val(); // Valor booleano
          if (isActive) {
              activeSkills.push(skillName);
          }
      });
  }

  return activeSkills;
}

// Función para obtener las descripciones de las skills desde Firebase
async function getSkillsDescriptions(activeSkills) {
  const skillsDescriptions = [];
  const skillsRef = firebase.database().ref('/skills');

  const snapshot = await skillsRef.once('value');
  snapshot.forEach(childSnapshot => {
      const skillData = childSnapshot.val();
      const skillName = childSnapshot.key;

      if (activeSkills.includes(skillName)) {
          skillsDescriptions.push({
              text: skillName,
              descripcion: skillData.descripcion || "Sin descripción" // Valor por defecto
          });
      }
  });

  return skillsDescriptions;
}
// FIN MARTILLO GENERAL

// Definición del array de avatares
const avatares = [
    { imagen: 'alexis_guidi.png', nombre: 'Alexis Guidi' },
    { imagen: 'elias_pignani.png', nombre: 'Elias Pignani' },
    { imagen: 'georgina_suarez.png', nombre: 'Georgina Suarez' },
    { imagen: 'alejo_aviles.png', nombre: 'Alejo Aviles' },
    { imagen: 'joel_fernandez.png', nombre: 'Joel Fernandez' },
    { imagen: 'esperanza_toffalo.png', nombre: 'Esperanza Toffalo' },
    { imagen: 'lucas_ponzoni.png', nombre: 'Lucas Ponzoni' }
];

// Función para obtener la ruta del avatar por nombre
function obtenerAvatarPorNombre(nombreOperador) {
    const avatar = avatares.find(av => av.nombre === nombreOperador);
    return avatar ? `./Img/${avatar.imagen}` : './Img/default_avatar.png'; // Retorna una imagen por defecto si no se encuentra
}

async function controlarCaso(ventaId, iconElement) {
  const activeAvatar = document.getElementById("active-avatar");
  const clienteElement = document.getElementById(`cliente-posventa-${ventaId}`);
  const nombreOperador = activeAvatar.alt;

  // Obtener el número del cliente, o asignar "NO FACTURADO" si no existe
  const numeroClienteElement = clienteElement ? clienteElement.querySelector("#nombre-cliente") : null;
  const numeroCliente = numeroClienteElement ? numeroClienteElement.innerText : "NO FACTURADO";

  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');

  const fechaHoraFormateada = `${dia}/${mes}/${anio}, ${horas}:${minutos}:${segundos}`;

  const mensaje = `${nombreOperador}: Lo controle ${fechaHoraFormateada}`;
  const mensajeMeli = `${mensaje} - CLIENTE: ${numeroCliente}`;

  showAlert(`${mensajeMeli}`);

  const controlData = {
      fechaHora: fechaHoraFormateada,
      mensaje: mensaje,
      operador: nombreOperador
  };

  // Timestamp ISO seguro como nombre de nodo
  const timestampISO = fecha.toISOString().replace(/[:.]/g, '-');

  await firebase.database().ref(`/posventa/${ventaId}/control/${timestampISO}`).set(controlData);

  const macCell = iconElement.closest('.mac-cell-posventa');
  mostrarBurbujaControl(macCell, nombreOperador, mensaje);

  // Copiar el número de cliente al portapapeles
  try {
      await navigator.clipboard.writeText(mensajeMeli);
      console.log(`"${mensajeMeli}" copiado al portapapeles.`);
  } catch (err) {
      console.error('Error al copiar el número de cliente: ', err);
  }
}

function mostrarBurbujaControl(macCell, nombreOperador, mensaje) {
  // Eliminar burbujas existentes
  const burbujasExistentes = macCell.querySelectorAll('.bubble-filaDeDatos');
  burbujasExistentes.forEach(burbuja => burbuja.remove());

  const burbuja = document.createElement('div');
  burbuja.className = 'bubble-filaDeDatos'; // Clase base

  const avatarSrc = obtenerAvatarPorNombre(nombreOperador); // Obtener el avatar

  // Crear div del mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = 'mensaje-filaDeDatos';
  mensajeDiv.textContent = mensaje;

  // Extraer y evaluar fecha del mensaje
  const fechaRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}:\d{2}:\d{2})$/;
  const match = mensaje.match(fechaRegex);

  if (match) {
    const [_, dia, mes, anio, hora] = match;
    const fechaMensaje = new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}`);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaDelMensaje = new Date(fechaMensaje);
    fechaDelMensaje.setHours(0, 0, 0, 0);

    const diffDias = Math.floor((hoy - fechaDelMensaje) / (1000 * 60 * 60 * 24));

    if (diffDias === 1) {
      mensajeDiv.classList.add('orange-day');
    } else if (diffDias >= 2) {
      mensajeDiv.classList.add('red-day');
    }
  }

  // Agregar contenido a la burbuja
  burbuja.innerHTML = `
    <img src="${avatarSrc}" alt="${nombreOperador}" class="avatar-filaDeDatos">
  `;
  burbuja.appendChild(mensajeDiv);

  macCell.appendChild(burbuja);
}

// Modifica la función copyToClipboard
function copyToClipboard(ventaId, iconElement) {
  navigator.clipboard.writeText(ventaId).then(() => {
      // Cambiar el icono a clipboard-check-fill
      iconElement.className = 'bi bi-clipboard-check-fill green-clip';
      
      showAlert(`Se ha copiado al portapapeles la Operación ${ventaId}`);
      
      // Volver al icono original después de 5 segundos
      setTimeout(() => {
          iconElement.className = 'bi bi-clipboard';
      }, 5000);
  }).catch(err => {
      console.error('Error al copiar al portapapeles: ', err);
  });
}

// Función para mostrar la alerta
function showAlert(message) {
  const alertContainer = document.createElement('div');
  alertContainer.className = 'alert-ios-meli';
  alertContainer.innerHTML = `
      <i class="bi bi-clipboard-check"></i>
      ${message}
      <button class="close-btn" onclick="this.parentElement.style.display='none';">&times;</button>
  `;
  document.body.appendChild(alertContainer);
  
  setTimeout(() => {
      alertContainer.style.display = 'none';
  }, 3000);
}

async function abrirSkillsModalFilas(ventaId) {
  try {
    const snapshot = await firebase.database().ref('/skills').once('value');
    const skillsData = snapshot.val() || {};

    const modalBody = document.getElementById("skillsModalFilasBody");
    modalBody.innerHTML = '';

    Object.entries(skillsData).forEach(([skillKey, skillObj]) => {
      const badge = document.createElement('span');
      const skillText = skillObj.text || skillKey;

      badge.textContent = skillText.charAt(0).toUpperCase() + skillText.slice(1);
      badge.style.backgroundColor = skillObj.backgroundColor;
      badge.style.color = skillObj.textColor;
      badge.style.border = `1px solid ${skillObj.textColor}`;
      badge.style.padding = '8px 12px';
      badge.style.borderRadius = '8px';
      badge.style.margin = '5px';
      badge.style.fontFamily = '"Rubik", sans-serif';
      badge.style.fontWeight = '600';
      badge.classList.add('badge');
      badge.style.cursor = 'pointer';

      // Al hacer clic, agregar a Firebase y renderizar
      badge.addEventListener('click', async () => {
        const skillRef = firebase.database().ref(`/posventa/${ventaId}/skills/${skillKey}`);
        await skillRef.set(true);

        renderSkillEnFila(skillKey, ventaId, skillObj);
      });

      modalBody.appendChild(badge);
    });

    $('#skillsModalFilas').modal('show');
  } catch (error) {
    console.error("Error al cargar skills:", error);
    alert("Error al cargar las skills desde Firebase.");
  }
}

function renderSkillEnFila(skillKey, ventaId, estilo = {}) {
  const targetDiv = document.querySelector(`.div-skills-${ventaId}`);
  if (!targetDiv) return;

  // Evitar duplicados
  if (targetDiv.querySelector(`[data-skill="${skillKey}"]`)) return;

  const badge = document.createElement('span');
  badge.setAttribute('data-skill', skillKey);
  badge.style.backgroundColor = estilo.backgroundColor || '#ddd';
  badge.style.color = estilo.textColor || '#000';
  badge.style.border = `1px solid ${estilo.textColor || '#000'}`;
  badge.style.padding = '6px 10px';
  badge.style.borderRadius = '8px';
  badge.style.margin = '5px';
  badge.style.display = 'inline-block';
  badge.style.fontFamily = '"Rubik", sans-serif';
  badge.style.fontWeight = '500';
  badge.style.fontSize = '12px';

  badge.textContent = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);

  const removeBtn = document.createElement('span');
  removeBtn.innerHTML = '&times;';
  removeBtn.style.marginLeft = '10px';
  removeBtn.style.cursor = 'pointer';
  removeBtn.style.fontWeight = 'bold';

  removeBtn.addEventListener('click', () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esto eliminará el skill!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        firebase.database().ref(`/posventa/${ventaId}/skills/${skillKey}`).remove();
        badge.remove();
      }
    });
  });

  badge.appendChild(removeBtn);
  targetDiv.appendChild(badge);
}

async function cargarSkillsDeFila(ventaId) {
  const skillsRef = firebase.database().ref('/skills');
  const filaSkillsRef = firebase.database().ref(`/posventa/${ventaId}/skills`);

  const [skillsSnap, filaSkillsSnap] = await Promise.all([
    skillsRef.once('value'),
    filaSkillsRef.once('value')
  ]);

  const estilosSkills = skillsSnap.val() || {};
  const filaSkills = filaSkillsSnap.val() || {};

  for (const skillKey in filaSkills) {
    const estilo = estilosSkills[skillKey] || {};
    renderSkillEnFila(skillKey, ventaId, estilo);
  }
}

function abrirModalComentario(ventaId, iconElement) {
  const comentarioModal = new bootstrap.Modal(document.getElementById('comentarioModal'));
  const ventaIdInput = document.getElementById('ventaIdInput'); 
  const comentarioOperacion = document.getElementById('comentarioOperacion'); 
  const numeroCaso = document.getElementById('numeroCaso');
  const vencimientoDevolucion = document.getElementById('vencimientoDevolucion'); 

  // Asignar el ID de la venta al campo correspondiente
  ventaIdInput.value = ventaId;

  // Limpiar los campos antes de cargar nuevos datos
  comentarioOperacion.value = '';
  numeroCaso.value = '';
  vencimientoDevolucion.value = ''; // Limpiar el campo de vencimiento de devolución

  // Cargar comentarios previos desde Firebase
  firebase.database().ref(`/posventa/${ventaId}/comentarios`).once('value').then(snapshot => {
      const comentariosData = snapshot.val() || {};
      
      comentarioOperacion.value = comentariosData.operacion || '';
      numeroCaso.value = comentariosData.numeroCaso || '';
      vencimientoDevolucion.value = comentariosData.vencimientoDevolucion || ''; 
  }).catch(error => {
      console.error("Error al cargar comentarios:", error);
  });

  // Mostrar el modal
  comentarioModal.show();
}

async function guardarComentario() {
  const ventaId = document.getElementById('ventaIdInput').value;
  const comentarioOperacion = document.getElementById('comentarioOperacion').value; 
  const numeroCaso = document.getElementById('numeroCaso').value; 
  const vencimientoDevolucion = document.getElementById('vencimientoDevolucion').value; 

  // Convertir la cadena de fecha a un objeto Date
  const vencimientoDevolucionFecha = new Date(vencimientoDevolucion); 
  
  // Sumar un día
  vencimientoDevolucionFecha.setDate(vencimientoDevolucionFecha.getDate() + 1); 
  
  // Formatear la fecha de vencimiento a "DD-MM-YYYY"
  const fechaVencimientoFormateada = vencimientoDevolucionFecha.toLocaleDateString('es-ES');  
  
  // Crear un objeto para los comentarios
  const comentarioData = {
      operacion: comentarioOperacion,
      numeroCaso: numeroCaso,
      fecha: new Date().toLocaleString(), 
      vencimientoDevolucion: fechaVencimientoFormateada 
  };

  // Guardar los comentarios en Firebase
  await firebase.database().ref(`/posventa/${ventaId}/comentarios`).set(comentarioData)
      .then(() => {
          // Mostrar alerta de éxito
          showAlert(`Comentario guardado exitosamente para operación ${ventaId}`);

          // Cambiar el color del ícono a verde
          const iconoComentario = document.querySelector(`i[onclick="abrirModalComentario('${ventaId}', this)"]`);
          if (iconoComentario) {
              iconoComentario.style.color = '#38B34DFF';
          }

          // Cerrar el modal
          const comentarioModal = bootstrap.Modal.getInstance(document.getElementById('comentarioModal'));
          comentarioModal.hide();
      })
      .catch(error => {
          console.error("Error al guardar comentario:", error);
          showAlert('Error al guardar el comentario. Inténtalo de nuevo.');
      });
}

function obtenerSoloNumeros(str) {
  return str.replace(/\D/g, '');
}

function buscarClientePosventa(venta, ventaId) {
  const documentoCompleto = venta.facturación_al_comprador?.tipo_y_número_de_documento || "";
  const dni = obtenerSoloNumeros(documentoCompleto);
  const divCliente = document.getElementById(`cliente-posventa-${ventaId}`);

  if (!dni || !divCliente) return;

  window.dbClientes.ref("/clientes/" + dni).once("value").then((snapshot) => {
    const cliente = snapshot.val();

    if (cliente?.cliente) {
      divCliente.className = "clientePosventa";
      divCliente.innerHTML = `
        <img src="Img/logo-presea.png" alt="PRESEA" width="20">
        Cliente: <strong id="nombre-cliente">${cliente.cliente}</strong>
      `;

      // ✅ Agregamos evento para copiar al portapapeles
      divCliente.style.cursor = 'pointer';
      divCliente.addEventListener("click", () => {
        navigator.clipboard.writeText(cliente.cliente).then(() => {
          showAlert(`Se ha copiado a portapapeles el cliente: ${cliente.cliente}`);
        }).catch((err) => {
          console.error("Error al copiar al portapapeles:", err);
        });
      });

    } else {
      divCliente.className = "clientePosventa-rojo";
      divCliente.innerHTML = `NO FACTURADO <i class="bi bi-exclamation-circle-fill"></i>`;
    }
  }).catch((error) => {
    divCliente.className = "clientePosventa-rojo";
    divCliente.innerHTML = `ERROR <i class="bi bi-exclamation-triangle-fill"></i>`;
    console.error("Error al buscar cliente en Firebase:", error);
  });
}
// FIN RENDERIZADO DE LA TABLA

// MODAL LINEA DE TIEMPO
function abrirModalTimeline(ventaId) {
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = ''; // Limpiar contenido previo

    // Buscar la venta en Firebase
    db.ref('posventa').child(ventaId).once('value', (snapshot) => {
        if (snapshot.exists()) {
            const item = snapshot.val();
            const timeline = [];

            // Agregar todos los estados y descripciones
            const estados = [
                { key: 'estado', descripcionKey: 'descripción_del_estado' },
                { key: 'estado2', descripcionKey: 'descripción_del_estado2' },
                { key: 'estado3', descripcionKey: 'descripción_del_estado3' },
                { key: 'estado4', descripcionKey: 'descripción_del_estado4' },
                { key: 'estado5', descripcionKey: 'descripción_del_estado5' },
                { key: 'estado6', descripcionKey: 'descripción_del_estado6' },
                { key: 'estado7', descripcionKey: 'descripción_del_estado7' },
                { key: 'estado8', descripcionKey: 'descripción_del_estado8' },
                { key: 'estado9', descripcionKey: 'descripción_del_estado9' },
                { key: 'estado10', descripcionKey: 'descripción_del_estado10' },
                { key: 'estado11', descripcionKey: 'descripción_del_estado11' },
                { key: 'estado12', descripcionKey: 'descripción_del_estado12' },
                { key: 'estado13', descripcionKey: 'descripción_del_estado13' },
                { key: 'estado14', descripcionKey: 'descripción_del_estado14' },
                { key: 'estado15', descripcionKey: 'descripción_del_estado15' },
                { key: 'estado16', descripcionKey: 'descripción_del_estado16' },
                { key: 'estado17', descripcionKey: 'descripción_del_estado17' },
                { key: 'estado18', descripcionKey: 'descripción_del_estado18' },
                { key: 'estado19', descripcionKey: 'descripción_del_estado19' },
                { key: 'estado20', descripcionKey: 'descripción_del_estado20' },
            ];

            // Recorrer los estados definidos
            estados.forEach((estadoObj, index) => {
                const estado = item.ventas[estadoObj.key];
                const descripcion = item.ventas[estadoObj.descripcionKey];

                if (estado) {
                    // Si hay un estado, se muestra normalmente
                    timeline.push(`
                        <li class="timeline-placeit-item">
                            <div class="timeline-placeit-item-title"><strong>Estado ${index + 1}:</strong> ${estado}</div>
                            <div class="timeline-placeit-item-date">${descripcion ? descripcion : ''}</div>
                        </li>
                    `);
                } else if (descripcion) {
                    // Si no hay estado pero hay descripción, se muestra "Actualización en Descripción"
                    timeline.push(`
                        <li class="timeline-placeit-item">
                            <div class="timeline-placeit-item-title"><strong>Estado ${index + 1}:</strong> Actualización en Descripción</div>
                            <div class="timeline-placeit-item-date">${descripcion}</div>
                        </li>
                    `);
                }
            });

            // Insertar la línea de tiempo en el modal
            timelineContent.innerHTML = `<ul class="timeline-placeit">${timeline.join('')}</ul>`;
            timelineContent.style.display = 'block';

            // Mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('timelineModal'));
            modal.show();
        } else {
            Swal.fire('Error', 'No se encontraron datos para esta venta.', 'error');
        }
    }).catch((error) => {
        console.error('Error al buscar la venta en Firebase:', error);
        Swal.fire('Error', 'Ocurrió un error al buscar la venta.', 'error');
    });
}
// FIN MODAL LINEA DE TIEMPO

// LISTENERS EN TIEMPO REAL
firebase.database().ref('posventa').on('child_changed', (snapshot) => {
  const ventaId = snapshot.key;
  const venta = snapshot.val();

  // Buscar la fila de la venta correspondiente
  const row = [...document.querySelectorAll('#data-table tbody tr')]
      .find(tr => tr.querySelector('.estado-select')?.dataset.ventaId === ventaId);

  if (row) {
      // Actualizar el estado y color de la fila
      actualizarEstadoFila(row, venta.ventas.estadoActual);

      // Manejar la creación de la burbuja de control
      manejarBurbujaControl(row, venta.control);

      // Skills
      const skillsContainer = row.querySelector(`.div-skills-${ventaId}`);
      if (skillsContainer) {
          skillsContainer.innerHTML = ''; // Limpiar previos
          cargarSkillsDeFila(ventaId);    // Reutiliza tu función async
      }

      // Cambiar el color del ícono a verde si hay comentarios
      const iconoComentario = document.querySelector(`i[onclick="abrirModalComentario('${ventaId}', this)"]`);
      if (iconoComentario && venta.comentarios) {
          iconoComentario.style.color = '#38B34DFF'; 
      }
  }
});

// Función para actualizar el estado y color de la fila
function actualizarEstadoFila(row, estadoActual) {
  if (estadoActual) {
      const estadoSelect = row.querySelector('.estado-select');
      estadoSelect.value = estadoActual;

      // Pintar la fila según el nuevo estado
      switch (estadoActual) {
          case "CONTROL FINALIZADO":
              row.style.backgroundColor = "#c8e6c9"; break;
          case "TRANSFERIDO A FACTURACION":
              row.style.backgroundColor = "#bbdefb"; break;
          case "LLEGO A NOVOGAR":
              row.style.backgroundColor = "#ffe0b2"; break;
          case "SEGUIR RECLAMO EN FORMULARIO":
              row.style.backgroundColor = "#f8bbd0"; break;
          case "ENTREGADO CON DEBITO":
              row.style.backgroundColor = "#d1c4e9"; break;
          default:
              row.style.backgroundColor = ""; break;
      }
  }
}

function manejarBurbujaControl(row, controles) {
  // Validación para evitar errores si controles no es un objeto o está vacío
  if (!controles || typeof controles !== 'object' || Object.keys(controles).length === 0) {
    return; // Nada que mostrar
  }

  const ultimoControlKey = Object.keys(controles).pop(); // Obtener la última clave
  const ultimoControl = controles[ultimoControlKey];

  if (ultimoControl) {
    const { operador, mensaje } = ultimoControl;
    const macCell = row.querySelector('.mac-cell-posventa');
    if (macCell) {
      mostrarBurbujaControl(macCell, operador, mensaje); // Mostrar burbuja con el último control
    }
  }
}

async function cargarSkillsDeFila(ventaId) {
  const skillsRef = firebase.database().ref('/skills');
  const filaSkillsRef = firebase.database().ref(`/posventa/${ventaId}/skills`);

  const [skillsSnap, filaSkillsSnap] = await Promise.all([
    skillsRef.once('value'),
    filaSkillsRef.once('value')
  ]);

  const estilosSkills = skillsSnap.val() || {};
  const filaSkills = filaSkillsSnap.val() || {};

  for (const skillKey in filaSkills) {
    const estilo = estilosSkills[skillKey] || {};
    renderSkillEnFila(skillKey, ventaId, estilo);
  }
}

function renderSkillEnFila(skillKey, ventaId, estilo = {}) {
  const targetDiv = document.querySelector(`.div-skills-${ventaId}`);
  if (!targetDiv) return;

  // Evitar duplicados
  if (targetDiv.querySelector(`[data-skill="${skillKey}"]`)) return;

  const badge = document.createElement('span');
  badge.setAttribute('data-skill', skillKey);
  badge.style.backgroundColor = estilo.backgroundColor || '#ddd';
  badge.style.color = estilo.textColor || '#000';
  badge.style.border = `1px solid ${estilo.textColor || '#000'}`;
  badge.style.padding = '6px 10px';
  badge.style.borderRadius = '8px';
  badge.style.margin = '5px';
  badge.style.display = 'inline-block';
  badge.style.fontFamily = '"Rubik", sans-serif';
  badge.style.fontWeight = '500';
  badge.style.fontSize = '12px';

  badge.textContent = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);

  const removeBtn = document.createElement('span');
  removeBtn.innerHTML = '&times;';
  removeBtn.style.marginLeft = '10px';
  removeBtn.style.cursor = 'pointer';
  removeBtn.style.fontWeight = 'bold';

  removeBtn.addEventListener('click', () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esto eliminará el skill!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        firebase.database().ref(`/posventa/${ventaId}/skills/${skillKey}`).remove();
        badge.remove();
      }
    });
  });

  badge.appendChild(removeBtn);
  targetDiv.appendChild(badge);
}
// FIN LISTENERS EN TIEMPO REAL

// SKILLS MODAL
$('#skillsModal').on('show.bs.modal', function () {
  const skillsContainer = document.getElementById('skillsContainer');
  const spinner = document.getElementById('spinner');
  skillsContainer.innerHTML = ''; // Limpiar el contenedor
  spinner.style.display = 'block'; // Mostrar spinner

  firebase.database().ref('/skills').once('value').then(snapshot => {
      snapshot.forEach(childSnapshot => {
          const skillData = childSnapshot.val();
          createBadge(skillData.text, skillData.backgroundColor, skillData.textColor, childSnapshot.key);
      });
      spinner.style.display = 'none'; // Ocultar spinner
  });
});

// Función para crear un badge
function createBadge(skillText, backgroundColor, textColor, skillId) {
  const badge = document.createElement('span');
  badge.textContent = skillText.charAt(0).toUpperCase() + skillText.slice(1); // Capitalizar
  badge.style.backgroundColor = backgroundColor;
  badge.style.color = textColor;
  badge.style.border = `1px solid ${textColor}`;
  badge.style.padding = '8px 12px';
  badge.style.borderRadius = '8px';
  badge.style.margin = '5px';
  badge.style.fontFamily = '"Rubik", sans-serif'; // Aplicar la fuente
  badge.style.fontWeight = '600'; // Peso de la fuente
  badge.classList.add('badge');

  // Crear el botón de eliminar
  const removeButton = document.createElement('span');
  removeButton.innerHTML = '&times;'; // "X" para eliminar
  removeButton.style.cursor = 'pointer';
  removeButton.style.marginLeft = '10px';
  
  removeButton.addEventListener('click', function () {
      Swal.fire({
          title: '¿Estás seguro?',
          text: "¡Esto eliminará el skill!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
              // Eliminar de Firebase
              firebase.database().ref('/skills/' + skillId).remove();
              // Eliminar el badge del DOM
              badge.remove();
          }
      });
  });

  badge.appendChild(removeButton);
  document.getElementById('skillsContainer').appendChild(badge);
}

// Agregar nuevo skill
document.getElementById('addSkuButtonPlaceIt').addEventListener('click', function() {
  const skillInput = document.getElementById('newSkuInputPlaceIt');
  const colorPicker = document.getElementById('colorPicker');
  const descriptionInput = document.getElementById('skillDescription'); // Obtener el textarea

  const skillText = skillInput.value.trim().toLowerCase(); // Convertir a minúsculas
  const selectedColor = colorPicker.value;
  const description = descriptionInput.value.trim().toLowerCase(); // Obtener descripción y convertir a minúsculas

  if (skillText) {
      // Calcular el color de texto (más oscuro)
      const textColor = getDarkerColor(selectedColor);

      // Crear un badge
      createBadge(skillText.charAt(0).toUpperCase() + skillText.slice(1), selectedColor, textColor, skillText); // Mostrar en mayúsculas

      // Pushear a Firebase utilizando el nombre del skill como nodo
      firebase.database().ref('/skills/' + skillText).set({
          text: skillText,
          backgroundColor: selectedColor,
          textColor: textColor,
          descripcion: description 
      });

      // Limpiar los inputs
      skillInput.value = '';
      descriptionInput.value = ''; 
  }
});

// Función para obtener un color más oscuro
function getDarkerColor(hex) {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16) * 0.5;
  const g = parseInt(color.substring(2, 4), 16) * 0.5;
  const b = parseInt(color.substring(4, 6), 16) * 0.5;

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}
// FIN SKILLS MODAL

// CONTAR FILAS SIN CONTROL
function contarFilasSinControlDesdeDOM() {
  // Contador total de filas
  let totalFilas = 0;
  // Contador para filas que tienen el green-day
  let filasGreenDay = 0;

  // Obtener todas las filas de la tabla
  const filas = document.querySelectorAll('#data-table tbody tr');

  filas.forEach(row => {
      // Obtener el mensaje de la primera columna (suponiendo que contiene la fecha)
      const mensajeTexto = row.cells[0]?.innerText; // Ajusta según tu estructura

      if (mensajeTexto) {
          totalFilas += 1; // Incrementar total de filas

          // Expresión regular para extraer la fecha
          const fechaRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}:\d{2}:\d{2})$/;
          const match = mensajeTexto.match(fechaRegex);

          if (match) {
              const [_, dia, mes, anio, hora] = match;
              const fechaMensaje = new Date(`${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora}`);
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              const fechaDelMensaje = new Date(fechaMensaje);
              fechaDelMensaje.setHours(0, 0, 0, 0);
              const diffDias = Math.floor((hoy - fechaDelMensaje) / (1000 * 60 * 60 * 24));

              // Contar filas con green-day
              if (diffDias === 0) { // Si es el mismo día
                  filasGreenDay += 1;
              }
          }
      }
  });

  // Calcular filas sin controlar
  const filasSinControl = totalFilas - filasGreenDay;

  // Actualizar el botón 'sinRevisar'
  const sinRevisarBtn = document.getElementById('sinRevisar');
  sinRevisarBtn.innerHTML = `
      <i class="bi bi-exclamation-circle-fill" style="color: orange;"></i> 
      Sin Control: <span style="color: red; font-weight: bold;">${filasSinControl}</span>
  `;
  sinRevisarBtn.title = `Filas sin controlar: ${filasSinControl}`; // Actualizar el título
}
// FIN CONTAR FILAS SIN CONTROL

    // Función para inicializar el contador al cargar las filas
    function initializeContador() {
      const filas = document.querySelectorAll('td'); // Selecciona todas las filas
      filas.forEach(fila => {
          const estado = fila.querySelector('div'); // Busca el div dentro de la fila
          if (estado) {
              const textoEstado = estado.innerHTML; // Obtiene el contenido del div
              if (textoEstado.includes('Vence HOY') || textoEstado.includes('PLAZO VENCIDO')) {
                  contadorVencidos++; // Incrementa el contador
              }
          }
      });

      // Actualiza el contador en el botón al cargar
      const contadorBadge = document.getElementById('contadorvencidosButton');
      contadorBadge.innerHTML = contadorVencidos > 0 ? contadorVencidos : '0';
      if (contadorVencidos === 0) {
          contadorBadge.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; // Restaura el icono de carga si no hay vencidos
      }
  }
  let alertCount = 0;

// ALERT EMAIL
function showAlertPosventa(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    document.body.appendChild(alertElement);
    alertElement.style.bottom = `${20 + alertCount * 70}px`;
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    alertElement.querySelector('.close').onclick = () => {
        closeAlert(alertElement);
    };
    setTimeout(() => {
        closeAlert(alertElement);
    }, 8000);
    alertCount++;
}

function showAlertErrorPosventa(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alertError';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    document.body.appendChild(alertElement);
    alertElement.style.bottom = `${20 + alertCount * 70}px`;
    setTimeout(() => {
        alertElement.classList.add('show');
    }, 10);
    alertElement.querySelector('.close').onclick = () => {
        closeAlert(alertElement);
    };
    setTimeout(() => {
        closeAlert(alertElement);
    }, 8000);
    alertCount++;
}

function closeAlert(alertElement) {
    alertElement.classList.remove('show');
    setTimeout(() => {
        document.body.removeChild(alertElement);
        alertCount--;
        updateAlertPositions();
    }, 300);
}

function updateAlertPositions() {
    const alerts = document.querySelectorAll('.alert, .alertError');
    alerts.forEach((alert, index) => {
        alert.style.bottom = `${20 + index * 70}px`;
    });
}
// FIN ALERT EMAIL