window.onload = function() {
    mostrarEtiquetasPrevias();
    actualizarMensajePersonalizado();
    mostrarSpinner
};

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

const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('is-active');
});

// Agregar el evento al contenedor de bultos para recalcular el volumen al cambiar
document.getElementById('medidasBultosContainer').addEventListener('input', actualizarVolumen);

function actualizarVolumen() {
    const bultosContainer = document.getElementById('medidasBultosContainer');
    let totalVolumen = 0; // Volumen total en m³
    let totalVolumenCm3 = 0; // Volumen total en cm³

    Array.from(bultosContainer.children).forEach(bulto => {
        const alto = parseFloat(bulto.querySelector(`input[name^="Alto"]`).value) || 0;
        const ancho = parseFloat(bulto.querySelector(`input[name^="Ancho"]`).value) || 0;
        const largo = parseFloat(bulto.querySelector(`input[name^="Largo"]`).value) || 0;
        const cantidad = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; // Obtener cantidad

        // Calcular volumen de este bulto en cm³
        const volumenBultoCm3 = alto * ancho * largo; // En cm³
        totalVolumenCm3 += volumenBultoCm3 * cantidad; // Sumar al volumen total en cm³

        // Convertir a m³
        const volumenBultoM3 = volumenBultoCm3 / 1000000; // Convertir cm³ a m³
        totalVolumen += volumenBultoM3 * cantidad; // Sumar al volumen total en m³
    });

    // Actualizar los elementos del volumen total
    document.getElementById('volumenTotal').innerText = totalVolumen.toFixed(2); // Mostrar en m³ con 2 decimales
    document.getElementById('volumenTotalcm').innerText = totalVolumenCm3.toFixed(0); // Mostrar en cm³ con 2 decimales
}

// Llama a la función al cargar la página para establecer el volumen inicial
actualizarVolumen();

// Listas de códigos postales
const cpMenor30Kg = [
    ...new Set([
        ...Array.from({length: 501}, (_, i) => i + 1000), // Del 1000 al 1500
        1602, 1603, 1604, 1605, 1606, 1607, 1609, 1611, 1612, 1613,
        1614, 1615, 1617, 1618, 1619, 1620, 1621, 1623, 1625,
        1627, 1629, 1631, 1633, 1635, 1636, 1638, 1640, 1641,
        1642, 1643, 1644, 1646, 1648, 1650, 1651, 1653, 1655,
        1657, 1659, 1661, 1663, 1664, 1665, 1667, 1669, 1671,
        1672, 1674, 1676, 1678, 1682, 1684, 1686, 1702, 1704,
        1706, 1708, 1712, 1713, 1714, 1716, 1718, 1722, 1723,
        1742, 1744, 1746, 1748, 1752, 1754, 1755, 1757, 1759,
        1763, 1765, 1766, 1770, 1771, 1772, 1773, 1774, 1776,
        1778, 1802, 1804, 1805, 1806, 1812, 1822, 1824, 1825,
        1826, 1828, 1832, 1834, 1835, 1836, 1842, 1852, 1854,
        1856, 1870, 1871, 1872, 1874, 1875, 1876, 1878, 1881,
        1882, 1884, 1885, 1886, 1888, 1890, 1891, 1894, 1895,
        1896, 1897, 1900, 1901, 1923, 1925, 8000, 4700, 2400,
        2415, 2424, 2434, 2550, 2553, 2555, 2557, 2559, 2563,
        2568, 2572, 2580, 2581, 2587, 2589, 2594, 2624, 2645,
        2657, 2659, 2661, 2671, 2675, 2679, 5000, 5001, 5002,
        5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011,
        5012, 5013, 5014, 5015, 5016, 5017, 5021, 5022, 5023,
        5101, 5103, 5105, 5107, 5109, 5111, 5113, 5123, 5125,
        5145, 5147, 5151, 5152, 5153, 5155, 5158, 5162, 5164,
        5166, 5168, 5172, 5182, 5184, 5186, 5189, 5191, 5194,
        5196, 5197, 5199, 5220, 5223, 5280, 5800, 5811, 5813,
        5815, 5817, 5823, 5825, 5845, 5850, 5851, 5853, 5854,
        5856, 5859, 5862, 5864, 5870, 5881, 5883, 6216, 6277,
        6279, 6389, 9011, 9400, 9405, 4200, 4300, 4400, 4500,
        4600, 4707, 5400, 5500, 5600, 5700, 5800, 5900, 6000,
        6100, 6200, 6300, 6400, 6500, 6600, 6700, 6800, 6900,
        7000, 7100, 7200, 7300, 7400, 7500, 7600, 7700, 7800,
        7900, 8000, 8100, 8200, 8300, 8400, 8500, 8600, 8700,
        8800, 8900, 9000, 9100, 9200, 9300, 9400, 9500, 9600,
        9700, 9800, 9900
    ])
];

const cpMayor30Kg = [
    ...new Set([
        ...Array.from({length: 501}, (_, i) => i + 1000), // Del 1000 al 1500
        1602, 1603, 1605, 1606, 1607, 1609, 1611, 1612, 1613,
        1614, 1615, 1617, 1618, 1619, 1620, 1621, 1623, 1625,
        1627, 1629, 1631, 1633, 1635, 1636, 1638, 1640, 1641,
        1642, 1643, 1644, 1646, 1648, 1650, 1651, 1653, 1655,
        1657, 1659, 1661, 1663, 1664, 1665, 1667, 1669, 1671,
        1672, 1674, 1676, 1678, 1682, 1684, 1686, 1702, 1704,
        1706, 1708, 1712, 1713, 1714, 1716, 1718, 1722, 1723,
        1742, 1744, 1746, 1748, 1752, 1754, 1755, 1757, 1759,
        1763, 1765, 1766, 1770, 1772, 1773, 1774, 1776, 1778,
        1802, 1804, 1805, 1806, 1812, 1822, 1824, 1825, 1826,
        1828, 1832, 1834, 1835, 1836, 1842, 1852, 1854, 1856,
        1870, 1871, 1872, 1874, 1875, 1876, 1878, 1882, 1884,
        1885, 1886, 1888, 1890, 1891, 1894, 1895, 1896, 1897,
        1900, 1901, 1923, 1925, 8000, 4700, 2400, 2415, 2419,
        2424, 2434, 2566, 2568, 2587, 2594, 2624, 2657, 2677,
        2681, 5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007,
        5008, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016,
        5017, 5021, 5022, 5023, 5101, 5103, 5105, 5107, 5109,
        5111, 5113, 5123, 5125, 5145, 5147, 5151, 5166, 5168,
        5172, 5182, 5184, 5186, 5194, 5220, 5223, 5236, 5280,
        5800, 5817, 5841, 5850, 5870, 5885, 5889, 5891, 5900,
        5903, 5923, 5960, 5972, 5974, 5980, 5986, 5988, 9000,
        9001, 9100, 9103, 4400, 4530, 2123, 2142, 2144, 2170,
        2440, 2449, 2451, 2452, 2453, 2454, 2505, 2535, 2580,
        2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
        2009, 2010, 2011, 2012, 2013, 2130, 2131, 2132, 2134,
        2152, 5400, 5401, 5403, 5405, 5406, 5407, 5411, 5413,
        5415, 5417, 5421, 5423, 5425, 5427, 5431, 5435, 5438,
        5442, 5443, 5444, 5460, 5700, 5701, 5703, 5705, 5710,
        5711, 5713, 5719, 5730, 5731, 5733, 5735, 5736, 5738,
        5750, 5753, 5755, 5759, 5770, 5773, 5777, 5831, 5881,
        6216, 6277, 6279, 6389, 9011, 9400, 4000, 4101, 4103,
        4105, 4107, 4109, 4111, 4117, 4128, 4129, 4132, 4142,
        4144, 4152, 4153, 4158, 4166, 4168, 4178, 4182, 5870, 
        7300,
    ])
];

// Función para verificar disponibilidad de envío
function verificarCP() {
    const codigoPostal = document.getElementById("codigoPostalDestinatario").value;
    let mensaje = "";

    // Elemento de respuesta
    const respuestaElement = document.getElementById("respuesta2");
    const respuestaElement2 = document.getElementById("respuestaNegativa");

    // Cambiar ID a "respuesta" si el input está vacío
    if (codigoPostal.length < 4) {
        respuestaElement2.id = "respuesta2"; // Restablecer ID
        respuestaElement2.style.display = "none"; // Asegurarse de que esté oculto
        respuestaElement.style.display = "none"; // Asegurarse de que esté oculto
        respuestaElement.innerText = "";
        respuestaElement2.innerText = "";
        return; // Salir de la función
    }

    // Ocultar el elemento de respuesta por defecto
    respuestaElement.style.display = "none"; // Ocultar inicialmente

    // Verificar si el código postal tiene 4 caracteres
    if (codigoPostal.length === 4) {
        const disponibleMenor30Kg = cpMenor30Kg.includes(parseInt(codigoPostal));
        const disponibleMayor30Kg = cpMayor30Kg.includes(parseInt(codigoPostal));

        if (disponibleMenor30Kg && disponibleMayor30Kg) {
            mensaje = "Envio Andesmar para Paqueteria pequeña (-30Kg) y Envios Bigger (+30Kg)";
            respuestaElement.id = "respuesta2"; // Asegurarse de que el ID sea correcto
        } else if (disponibleMenor30Kg) {
            mensaje = "Envio Andesmar para Paqueteria pequeña (-30Kg)";
            respuestaElement.id = "respuesta2"; // Asegurarse de que el ID sea correcto
        } else if (disponibleMayor30Kg) {
            mensaje = "Envio Andesmar para Paqueteria Bigger (+30Kg)";
            respuestaElement.id = "respuesta2"; // Asegurarse de que el ID sea correcto
        } else {
            mensaje = "Envio Andesmar no disponible a este CP";
            respuestaElement.id = "respuestaNegativa"; // Cambiar ID si no hay envíos disponibles
        }

        // Mostrar el mensaje en la pantalla
        respuestaElement.innerText = mensaje;
        respuestaElement.style.display = "block"; // Mostrar solo si hay mensaje
    }
}

// Agregar el evento al input de código postal
document.getElementById("codigoPostalDestinatario").addEventListener("input", verificarCP);

// Función para actualizar el mensaje personalizado en tiempo real
function actualizarMensajePersonalizado() {
    const calleDestinatario = document.getElementById("calleDestinatario").value;
    const calleNroDestinatario = document.getElementById("calleNroDestinatario").value;
    const codigoPostalDestinatario = document.getElementById("codigoPostalDestinatario").value;
    const nombreApellidoDestinatario = document.getElementById("nombreApellidoDestinatario").value;
    const telefonoDestinatario = document.getElementById("telefonoDestinatario").value;

    const mensajePersonalizado = `CP ${codigoPostalDestinatario}, Calle: ${calleDestinatario}, ${calleNroDestinatario}, Titular: ${nombreApellidoDestinatario}, Telefono: ${telefonoDestinatario}, envio propiedad de WWW.NOVOGAR.COM.AR, ante cualquier consulta comunicarse a (0341) 156680658`;

    // Mostrar el mensaje en un elemento HTML
    document.getElementById("mensajePersonalizado").innerText = mensajePersonalizado;

    // También puedes asignar el mensaje al textarea de observaciones si es necesario
    document.getElementById("observaciones").value = mensajePersonalizado;
}

// Agregar eventos de entrada a los campos relevantes
document.getElementById("calleDestinatario").addEventListener("input", actualizarMensajePersonalizado);
document.getElementById("calleNroDestinatario").addEventListener("input", actualizarMensajePersonalizado);
document.getElementById("codigoPostalDestinatario").addEventListener("input", actualizarMensajePersonalizado);
document.getElementById("nombreApellidoDestinatario").addEventListener("input", actualizarMensajePersonalizado);
document.getElementById("telefonoDestinatario").addEventListener("input", actualizarMensajePersonalizado);

// Llama a la función al cargar la página para establecer el mensaje inicial
actualizarMensajePersonalizado();

function enviarSolicitud() {
    let spinner = document.getElementById("spinner");
    spinner.style.display = "flex";

    const calleRemitente = document.getElementById("calleRemitente").value;
    const calleNroRemitente = document.getElementById("calleNroRemitente").value;
    const codigoPostalRemitente = document.getElementById("codigoPostalRemitente").value;
    const nombreApellidoDestinatario = document.getElementById("nombreApellidoDestinatario").value;
    const codigoPostalDestinatario = document.getElementById("codigoPostalDestinatario").value;
    const calleDestinatario = document.getElementById("calleDestinatario").value;
    const calleNroDestinatario = document.getElementById("calleNroDestinatario").value;
    const telefonoDestinatario = document.getElementById("telefonoDestinatario").value;
    const nroRemito = document.getElementById("nroRemito").value;
    const peso = document.getElementById("peso").value;
    const valorDeclarado = document.getElementById("valorDeclarado").value;
    const observaciones = document.getElementById("observaciones").value;
    const modalidadEntrega = document.getElementById("modalidadEntrega").value;
    const unidadVenta = document.getElementById("unidadVenta").value;
    const esFletePagoDestino = document.getElementById("esFletePagoDestino").selectedOptions[0].value === "true";
    const esRemitoConformado = document.getElementById("esRemitoConformado").selectedOptions[0].value === "true";

    const usuario = "BOM6765";
    const clave = "BOM6765";
    const codigoCliente = "6765";

    // Calcular m³ y dimensiones
    const bultosContainer = document.getElementById('medidasBultosContainer');
    let totalVolumen = 0;
    let totalBultos = 0;

    // Arreglos para almacenar las dimensiones
    const altos = [];
    const anchos = [];
    const largos = [];

    Array.from(bultosContainer.children).forEach(bulto => {
        const alto = parseFloat(bulto.querySelector(`input[name^="Alto"]`).value) || 0;
        const ancho = parseFloat(bulto.querySelector(`input[name^="Ancho"]`).value) || 0;
        const largo = parseFloat(bulto.querySelector(`input[name^="Largo"]`).value) || 0;
        const cantidad = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; // Obtener cantidad

        // Calcular volumen de este bulto y multiplicar por la cantidad
        const volumenBulto = (alto * ancho * largo) / 1000000; // Convertir cm³ a m³
        totalVolumen += volumenBulto * cantidad; // Sumar al volumen total
        totalBultos += cantidad; // Sumar la cantidad total de bultos

        // Agregar dimensiones al arreglo
        for (let i = 0; i < cantidad; i++) {
            altos.push(alto);
            anchos.push(ancho);
            largos.push(largo);
        }
    });

    // Actualizar el volumen visual
    document.getElementById("volumenTotal").innerText = totalVolumen.toFixed(2);

    const requestObj = {
        CalleRemitente: calleRemitente,
        CalleNroRemitente: calleNroRemitente,
        CodigoPostalRemitente: codigoPostalRemitente,
        NombreApellidoDestinatario: nombreApellidoDestinatario,
        CodigoPostalDestinatario: codigoPostalDestinatario,
        CalleDestinatario: calleDestinatario,
        CalleNroDestinatario: calleNroDestinatario,
        TelefonoDestinatario: telefonoDestinatario,
        NroRemito: nroRemito,
        Bultos: totalBultos, // Cantidad total de bultos
        Peso: parseFloat(peso),
        ValorDeclarado: parseInt(valorDeclarado),
        M3: totalVolumen,
        Alto: altos, // Arreglo de alturas
        Ancho: anchos, // Arreglo de anchos
        Largo: largos, // Arreglo de largos
        Observaciones: observaciones,
        ModalidadEntrega: modalidadEntrega,
        UnidadVenta: unidadVenta,
        servicio: {
            EsFletePagoDestino: esFletePagoDestino,
            EsRemitoconformado: esRemitoConformado
        },
        logueo: {
            Usuario: usuario,
            Clave: clave,
            CodigoCliente: codigoCliente
        }
    };

    const proxyUrl = "https://proxy.cors.sh/";
    const apiUrl = "https://api.andesmarcargas.com/api/InsertEtiqueta";
    
    fetch(proxyUrl + apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-cors-api-key": "temp_19762d8990c2b73dacc7a1be11943632",
        },
        body: JSON.stringify(requestObj),
    })
    .then(response => response.json())
    .then(data => {
        spinner.style.display = "none";
        console.log("Respuesta de la API:", data);
        mostrarRespuesta(data);
        document.getElementById("respuesta").scrollIntoView({ behavior: "smooth" });
    })
    .catch(error => {
        spinner.style.display = "none";
        console.error("Error en la solicitud:", error);
        alert("Error en la solicitud.");
    });
}

function mostrarRespuesta(data) {
    let respuestaElemento = document.getElementById("respuesta");

    // Limpiar cualquier contenido existente o crear el elemento si no existe
    if (!respuestaElemento) {
        respuestaElemento = document.createElement("div");
        respuestaElemento.id = "respuesta";
        document.body.appendChild(respuestaElemento);
    } else {
        respuestaElemento.innerHTML = "";
    }

    const descargaAndesmar = document.getElementById("descargaAndesmar");

    if ((data.Message && data.Message === "ERRORNo es posible realizar el envío hacia el destino seleccionado.") || data.NroPedido === undefined) {
        const nombreApellidoDestinatario = document.getElementById("nombreApellidoDestinatario").value.toUpperCase();

        // Actualizar el contenedor de descarga
        document.getElementById("titleAndesmar").innerHTML = `<img class="surprise" src="./Img/404.gif"> ANDESMAR NO DISPONIBLE`;
        document.getElementById("titleAndesmarName").innerText = nombreApellidoDestinatario;

        const botonDescarga = document.querySelector("#descargaAndesmar .btn");
        botonDescarga.classList.add("disabled");
        botonDescarga.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Envío No Disponible`;

        descargaAndesmar.style.display = "block"; // Mostrar sección de descarga
        respuestaElemento.appendChild(descargaAndesmar); // Añadir el contenedor de descarga al elemento de respuesta
    } else {
        const nombreApellidoDestinatario = document.getElementById("nombreApellidoDestinatario").value.toUpperCase();
        const numeroRemito = data.NroPedido;

        // Actualizar el contenedor de descarga
        document.getElementById("titleAndesmar").innerHTML = `<img class="surprise" src="./Img/download-file.gif"> ANDESMAR ${document.getElementById("nroRemito").value}`;
        document.getElementById("titleAndesmarName").innerText = nombreApellidoDestinatario;

        const botonDescarga = document.querySelector("#descargaAndesmar .btn");
        botonDescarga.innerHTML = `<i class="bi bi-filetype-pdf"></i> Descargar Etiqueta PDF ${numeroRemito}`;

        // Agregar evento al botón de descarga
        botonDescarga.addEventListener("click", function (event) {
            event.preventDefault(); // Evitar que se recargue la página
            window.open(data.Link, "_blank");
        });

        descargaAndesmar.style.display = "block"; // Mostrar sección de descarga
        respuestaElemento.appendChild(descargaAndesmar); // Añadir el contenedor de descarga al elemento de respuesta

        // Guardar la información en el almacenamiento local
        if (data.NroPedido !== undefined) {
            const etiquetaGenerada = {
                NroPedido: data.NroPedido,
                NombreApellidoDestinatario: nombreApellidoDestinatario,
                Link: data.Link
            };

            // Obtener las etiquetas previas del almacenamiento local
            let etiquetasPrevias = JSON.parse(localStorage.getItem("etiquetasPrevias")) || [];
            etiquetasPrevias.push(etiquetaGenerada);

            // Limitar el número de etiquetas previas a mostrar
            const MAX_ETIQUETAS_PREVIAS = 150;
            if (etiquetasPrevias.length > MAX_ETIQUETAS_PREVIAS) {
                etiquetasPrevias = etiquetasPrevias.slice(-MAX_ETIQUETAS_PREVIAS);
            }

            // Guardar las etiquetas previas actualizadas en el almacenamiento local
            localStorage.setItem("etiquetasPrevias", JSON.stringify(etiquetasPrevias));

            // Mostrar las últimas etiquetas generadas
            mostrarEtiquetasPrevias();
        }

        // Enviar datos a Firebase
        const nombreApellido = document.getElementById("nombreApellidoDestinatario").value.toUpperCase();
        const codigoPostal = document.getElementById("codigoPostalDestinatario").value.toUpperCase();
        const localidad = (document.getElementById("localidad").value + ', ' + document.getElementById("nombre-provincia").innerText).toUpperCase();
        const calleDelDestinatario = document.getElementById("calleDestinatario").value.toUpperCase();
        const numeroDeCalle = document.getElementById("calleNroDestinatario").value.toUpperCase();
        const telefono = document.getElementById("telefonoDestinatario").value.toUpperCase();
        const remito = document.getElementById("nroRemito").value.toUpperCase();
        const cotizacion = document.getElementById("valor-cotizacion2").innerText.toUpperCase();

        // Verificar si todos los campos necesarios están definidos
        if (numeroRemito && nombreApellido && codigoPostal && localidad && calleDelDestinatario && numeroDeCalle && telefono && remito && cotizacion) {
            const nuevaEntradaRef = database.ref('enviosAndesmar').push(); // RUTA FIREBASE
            nuevaEntradaRef.set({
                nombreApellido: nombreApellido,
                nroPedido: numeroRemito,
                codigoPostal: codigoPostal,
                localidad: localidad,
                calleDelDestinatario: calleDelDestinatario,
                numeroDeCalle: numeroDeCalle,
                telefono: telefono,
                remito: remito,
                cotizacion: cotizacion
            }).then(() => {
                console.log("Datos guardados correctamente en Firebase.");
            }).catch((error) => {
                console.error("Error al guardar los datos:", error);
            });
        } else {
            console.error("Faltan datos necesarios para guardar.");
        }
    }
}

function mostrarEtiquetasPrevias() {
    const ultimasEtiquetasDiv = document.getElementById("ultimasEtiquetas");
    ultimasEtiquetasDiv.innerHTML = ""; // Limpiar el contenido anterior

    // Obtener las etiquetas previas del almacenamiento local
    let etiquetasPrevias = JSON.parse(localStorage.getItem("etiquetasPrevias")) || [];

    // Agregar botón "Mostrar más" al principio
    const mostrarMasButton = document.createElement("button");
    mostrarMasButton.innerText = "Mostrar más";
    mostrarMasButton.classList.add("mostrarMasButton");
    ultimasEtiquetasDiv.appendChild(mostrarMasButton); // Añadir el botón al principio

    // Mostrar solo las últimas 5 etiquetas inicialmente
    const etiquetasAMostrar = etiquetasPrevias.slice(-5);
    etiquetasAMostrar.forEach(etiqueta => {
        const nombreEnMayusculas = etiqueta.NombreApellidoDestinatario.toUpperCase();
        const etiquetaElemento = document.createElement("button");
        etiquetaElemento.classList.add("reDescarga");
        etiquetaElemento.innerHTML = `${etiqueta.NroPedido} - ${nombreEnMayusculas} <img src="./Img/Download.png" class="download-icon">`;

        // Agregar evento de clic para abrir el enlace
        etiquetaElemento.addEventListener("click", function () {
            const enlace = etiquetasPrevias.find(et => et.NroPedido === etiqueta.NroPedido)?.Link;
            if (enlace) {
                window.open(enlace, "_blank");
            } else {
                alert("El enlace no está disponible.");
            }
        });

        ultimasEtiquetasDiv.appendChild(etiquetaElemento);
    });

    // Evento para mostrar todas las etiquetas al hacer clic en "Mostrar más"
    mostrarMasButton.addEventListener("click", function () {
        if (mostrarMasButton.innerText === "Mostrar más") {
            ultimasEtiquetasDiv.innerHTML = ""; // Limpiar el contenido
            etiquetasPrevias.forEach(etiqueta => {
                const nombreEnMayusculas = etiqueta.NombreApellidoDestinatario.toUpperCase();
                const etiquetaElemento = document.createElement("button");
                etiquetaElemento.classList.add("reDescarga");
                etiquetaElemento.innerHTML = `${etiqueta.NroPedido} - ${nombreEnMayusculas} <img src="./Img/Download.png" class="download-icon">`;

                // Agregar evento de clic para abrir el enlace
                etiquetaElemento.addEventListener("click", function () {
                    const enlace = etiquetasPrevias.find(et => et.NroPedido === etiqueta.NroPedido)?.Link;
                    if (enlace) {
                        window.open(enlace, "_blank");
                    } else {
                        alert("El enlace no está disponible.");
                    }
                });

                ultimasEtiquetasDiv.appendChild(etiquetaElemento);
            });
            mostrarMasButton.innerText = "Mostrar menos"; // Cambiar el texto del botón
        } else {
            mostrarEtiquetasPrevias(); // Volver a mostrar solo las últimas 5 etiquetas
            mostrarMasButton.innerText = "Mostrar más"; // Cambiar el texto de vuelta
        }
    });
}