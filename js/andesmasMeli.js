// Inicializar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBIXlgOct2UzkrZbZYbyHu6_NbLDzTqqig",
    authDomain: "despachos-novogar.firebaseapp.com",
    databaseURL: "https://despachos-novogar-default-rtdb.firebaseio.com",
    projectId: "despachos-novogar",
    storageBucket: "despachos-novogar.appspot.com",
    messagingSenderId: "346020771441",
    appId: "1:346020771441:web:c4a29c0db4200352080dd0",
    measurementId: "G-64DDP7D6Q2"
  };
  
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
const usuario = "BOM6765";
const clave = "BOM6765";
const codigoCliente = "6765";

// Función para enviar datos a la API de Andesmar
async function enviarDatosAndesmar(id, NombreyApellido, Cp, idOperacion, calleDestinatario, alturaDestinatario, telefonoDestinatario, observaciones, peso, volumenM3, cantidad, Medidas, Producto, localidad, provincia) {
    const button = document.getElementById(`andesmarButton${id}`);
    const spinner = document.getElementById(`spinnerAndesmar${id}`);
    const text = document.getElementById(`andesmarText${id}`);
    const resultadoDiv = document.getElementById(`resultado${id}`);
    const envioState = document.getElementById(`estadoEnvio${id}`);
    const buttonAndr = document.getElementById(`andreaniButton${id}`);
    const NroEnvio = document.getElementById(`numeroDeEnvioGenerado${id}`);

    // Mostrar spinner y cambiar texto
    spinner.style.display = 'inline-block';
    text.innerText = 'Generando Etiqueta...';

    buttonAndr.disabled = true;

    // Dividir medidas para obtener alto, ancho y largo
    const [largo, ancho, alto] = Medidas.split('x').map(Number);

    // Convertir Producto a minúsculas para la verificación
    const productoLowerCase = Producto.toLowerCase();

    // Verificar si Producto incluye un split
    const cantidadFinal = productoLowerCase.includes("split") ? cantidad * 2 : cantidad;

    // Definir los datos que se enviarán a la API
    const requestObj = {
        CalleRemitente: "Mendoza", // Reemplaza con el valor correcto
        CalleNroRemitente: "2799", // Reemplaza con el valor correcto
        CodigoPostalRemitente: "2000", // Reemplaza con el valor correcto
        NombreApellidoDestinatario: NombreyApellido,
        CodigoPostalDestinatario: Cp,
        CalleDestinatario: calleDestinatario,
        CalleNroDestinatario: alturaDestinatario,
        TelefonoDestinatario: telefonoDestinatario,
        NroRemito: idOperacion,
        Bultos: cantidadFinal,
        Peso: peso,
        ValorDeclarado: 100,
        M3: volumenM3,
        Alto: Array(cantidadFinal).fill(alto),
        Ancho: Array(cantidadFinal).fill(ancho),
        Largo: Array(cantidadFinal).fill(largo),
        Observaciones: observaciones + Producto,
        ModalidadEntrega: "Puerta-Puerta",
        UnidadVenta: [3500, 3100, 3400].includes(parseInt(Cp)) ? "CARGAS LOG RTO C Y SEGUIMIENTO" : "cargas remito conformado",        servicio: {
            EsFletePagoDestino: false,
            EsRemitoconformado: true
        },
        logueo: {
            Usuario: usuario,
            Clave: clave,
            CodigoCliente: codigoCliente
        }
    };

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";

    console.log(`Datos enviados a API Andesmar (MELI ${idOperacion}):`, requestObj);

    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
        },
        body: JSON.stringify(requestObj),
    })
    .then(async response => {
        const data = await response.json();
        console.log(`Datos Respuesta API Andesmar (MELI ${idOperacion}):`, data);
        
        if (data.NroPedido) {
            // Configuración de Firebase
            const db = firebase.database();
            const nuevaEntradaRef = db.ref('enviosAndesmar').push();

            const cotizacionRequest = {
                CodigoPostalRemitente: "2000",
                CodigoPostalDestinatario: Cp,
                Bultos: cantidadFinal,
                Peso: peso,
                ValorDeclarado: 100,
                M3: volumenM3,
                Alto: Array(cantidadFinal).fill(alto),
                Ancho: Array(cantidadFinal).fill(ancho),
                Largo: Array(cantidadFinal).fill(largo),
                ModalidadEntregaID: 2,
                servicio: {
                    EsFletePagoDestino: false,
                    EsRemitoconformado: true
                },
                logueo: {
                    Usuario: usuario,
                    Clave: clave,
                    CodigoCliente: codigoCliente
                },
                CodigoAgrupacion: 12
            };

            const cotizacionResponse = await fetch(proxyUrl + "https://apitest.andesmarcargas.com/api/CalcularMonto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-cors-api-key": "live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd",
                },
                body: JSON.stringify(cotizacionRequest),
            });

            const cotizacionData = await cotizacionResponse.json();

            await nuevaEntradaRef.set({
                nombreApellido: NombreyApellido,
                nroPedido: data.NroPedido,
                codigoPostal: Cp,
                localidad: `${localidad}, ${provincia}`,
                calleDelDestinatario: calleDestinatario,
                numeroDeCalle: alturaDestinatario,
                telefono: telefonoDestinatario,
                remito: idOperacion,
                cotizacion: cotizacionData.ImporteTotal
            }).then(() => {
                console.log("Entrada agregada correctamente.");
            }).catch((error) => {
                console.error("Error al agregar entrada a Firebase:", error);
            });

            const link = `https://andesmarcargas.com//ImprimirEtiqueta.html?NroPedido=${data.NroPedido}`;
            text.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar PDF ${data.NroPedido}`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
            button.onclick = () => window.open(link, '_blank'); 
            NroEnvio.innerHTML = `<a href="https://andesmarcargas.com/seguimiento.html?numero=${idOperacion}&tipo=remito&cod=" target="_blank">Andesmar: ${idOperacion} <i class="bi bi-box-arrow-up-right"></i></a>`;
            if (envioState) {
                envioState.className = 'em-circle-state2';
                envioState.innerHTML = `Envio Preparado`;
            } else {
                console.error(`El elemento con id estadoEnvio${id} no se encontró.`);
            }
        } else {
            text.innerHTML = `Envio No Disponible <i class="bi bi-exclamation-circle-fill"></i>`;
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning', 'btnAndesmarMeli');
            buttonAndr.disabled = false;
        }
    })
    .catch(error => {
        console.error("Error:", error);
        text.innerText = "Error al enviar los datos. Intenta nuevamente.";
    });
}