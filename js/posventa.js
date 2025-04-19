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
        nuevasEntradas[claveEstado] = { nombre: estado };
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
          }
        
        } else {
          if (valorNuevo !== prevValor) {
            ventaData[seccion][clave] = valorNuevo;
            hayCambios = true;
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

      ventasFiltradas.forEach(([ventaId, venta]) => {
          const { ultimoEstado, ultimaDescripcion } = obtenerUltimoEstado(venta); // Obtener último estado y descripción

          const cantidadEstados = Object.keys(venta.ventas).filter(key => key.startsWith('estado') && key !== 'estadoActual').length;
          const iconClass = cantidadEstados > 1 ? 'fas fa-history text-success' : 'fas fa-history';

          const row = document.createElement('tr');
          row.innerHTML = `
              <td>
                  <div class="mac-cell mac-cell-posventa" style="position: relative;">
                      <div class="venta-id">
                          <a href="https://www.mercadolibre.com.ar/ventas/${ventaId}/detalle" target="_blank" style="text-decoration: none; color: #333;">
                              ${ventaId}
                          </a>
                          <i class="bi bi-clipboard" id="clipboard-${ventaId}" onclick="copyToClipboard('${ventaId}', this)" style="cursor: pointer; font-size: 18px; color: #333;"></i>
                          <i class="${iconClass}" onclick="abrirModalTimeline('${ventaId}')" style="cursor: pointer;"></i>
                          <i class="bi bi-plus-circle-fill icon-user-plus" onclick="controlarCaso('${ventaId}', this)"></i>
                      </div>
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

              <td style="vertical-align: middle;">${ultimoEstado}</td>
              <td style="vertical-align: middle;">
                ${ultimaDescripcion}
                <i class="bi bi-plus-circle-fill icon-user-plus" onclick="abrirSkillsModalFilas('${ventaId}')"></i>
                <div class="div-skills-${ventaId}" style="margin-top: 10px;"></div>
              </td>
              <td style="vertical-align: middle;">
                  <i class="bi bi-chat-quote-fill" onclick="abrirModalComentario('${ventaId}', this)" style="cursor: pointer; color: ${venta.comentarios ? '#38B34DFF' : 'grey'}; font-size: 24px;"></i>
              </td>
          `;
          tbody.appendChild(row);

          cargarSkillsDeFila(ventaId)

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

// Función para controlar el caso
async function controlarCaso(ventaId, iconElement) {
  const activeAvatar = document.getElementById("active-avatar");
  const nombreOperador = activeAvatar.alt; // Obtiene el nombre del avatar activo
  
  // Obtener la fecha y hora actual en el formato deseado
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');

  // Formato de fecha y hora
  const fechaHoraFormateada = `${dia}/${mes}/${anio}, ${horas}:${minutos}:${segundos}`;

  // Mensaje a mostrar
  const mensaje = `${nombreOperador}: Lo controle ${fechaHoraFormateada}`;

  // Pushear datos a Firebase usando fecha y hora como nombre del nodo
  const controlData = {
      fechaHora: fechaHoraFormateada,
      mensaje: mensaje,
      operador: nombreOperador
  };

  await firebase.database().ref(`/posventa/${ventaId}/control/${fechaHoraFormateada}`).set(controlData);

  // Crear avatar y burbuja de chat en el div correspondiente
  const macCell = iconElement.closest('.mac-cell-posventa');
  mostrarBurbujaControl(macCell, nombreOperador, mensaje);
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

// Función para manejar la creación de la burbuja de control
function manejarBurbujaControl(row, controles) {
  const ultimoControlKey = Object.keys(controles || {}).pop(); // Obtener la última clave
  const ultimoControl = controles[ultimoControlKey];

  if (ultimoControl) {
      const { operador, mensaje } = ultimoControl;
      const macCell = row.querySelector('.mac-cell-posventa');
      mostrarBurbujaControl(macCell, operador, mensaje); // Mostrar burbuja con el último control
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