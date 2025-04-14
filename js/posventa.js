// Inicializa Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBP2TtBiRVcreivUGjqZjXe0XU7QRrt6Ts",
    authDomain: "precios-novogar.firebaseapp.com",
    databaseURL: "https://precios-novogar-default-rtdb.firebaseio.com",
    projectId: "precios-novogar",
    storageBucket: "precios-novogar.appspot.com",
    messagingSenderId: "355767952460",
    appId: "1:355767952460:web:32a785c718c5c88208c0e9",
    measurementId: "G-JPZW21X0L9"
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
  
        if (seccion === 'ventas' && (clave === 'estado' || clave === 'descripción_del_estado')) {
          const prevVenta = existingData[ventaId]?.ventas || {};
          let version = 1;
          while (prevVenta[`${clave}${version > 1 ? version : ''}`] !== undefined) {
            version++;
          }
          const ultimaClave = `${clave}${version - 1 > 1 ? version - 1 : ''}`;
          const valorPrevio = prevVenta[ultimaClave] || "";

            // 🚫 NUEVA CONDICIÓN: Si el último estado es "CONTROL FINALIZADO", ignorar cualquier cambio
            if (valorPrevio.trim().toUpperCase() === "CONTROL FINALIZADO") {
            continue; // salta esta fila sin hacer nada
          }
  
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

        const posventaSnapshot = await firebase.database().ref('posventa').once('value');
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
      
          const ultimoEstadoValue = (ventasEstados[0][1] || "").toLowerCase();
      
          return estadosSeleccionados.some(estadoSel => ultimoEstadoValue.includes(estadoSel));
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
                <div class="mac-cell mac-cell-posventa">
                    <div class="venta-id">
                        ${ventaId}
                        <i class="${iconClass}" onclick="abrirModalTimeline('${ventaId}')" style="cursor: pointer;"></i>
                    </div>
                    <select class="estado-select" data-venta-id="${ventaId}">
                        <option value="">Selecciona un estado</option>
                        <option value="CONTROL FINALIZADO">CONTROL FINALIZADO</option>
                        <option value="TRANSFERIDO A FACTURACION">TRANSFERIDO A FACTURACION</option>
                        <option value="LLEGO A NOVOGAR">LLEGO A NOVOGAR</option>
                        <option value="SEGUIR RECLAMO EN FORMULARIO">SEGUIR RECLAMO EN FORMULARIO</option>
                        <option value="ENTREGADO CON DEBITO">ENTREGADO CON DEBITO</option>
                    </select>
                </div>
            </td>
            <td style="vertical-align: middle;">${ultimoEstado}</td>
            <td style="vertical-align: middle;">${ultimaDescripcion}</td>
        `;
        tbody.appendChild(row);        

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
                    updates[`/posventa/${ventaId}/ventas/descripción_del_estado${nuevoEstadoIndex}`] = mensajeUltimaDescripcion; // Guardar el nuevo estado
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

firebase.database().ref('posventa').on('child_changed', (snapshot) => {
    const ventaId = snapshot.key;
    const venta = snapshot.val();

    // Buscar la fila de la venta correspondiente
    const row = [...document.querySelectorAll('#data-table tbody tr')]
        .find(tr => tr.querySelector('.estado-select')?.dataset.ventaId === ventaId);

    if (row && venta.ventas.estadoActual) {
        const estadoActual = venta.ventas.estadoActual;
        const estadoSelect = row.querySelector('.estado-select');

        // Actualizar el select
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
});