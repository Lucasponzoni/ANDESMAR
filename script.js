let bultoSplitAgregado = false; // Variable para controlar si se agregó un bulto para el split

function rellenarMedidas() {
    const tipoElectrodomestico = document.getElementById("tipoElectrodomestico").value;
    let alto = 0, ancho = 0, largo = 0, peso = 0, valor = 0;

    // Eliminar el bulto anterior si existe
    if (bultoSplitAgregado) {
        const bultosContainer = document.getElementById('medidasBultosContainer');
        const bultoSplit = bultosContainer.querySelector('.bultoSplit');
        if (bultoSplit) {
            bultoSplit.remove();
        }
        bultoSplitAgregado = false; // Reiniciar la variable
    }

    switch (tipoElectrodomestico) {
        case "heladera":
            alto = 165; ancho = 60; largo = 60; peso = 60; valor = 700000;
            break;
        case "cocina":
            alto = 85; ancho = 60; largo = 60; peso = 50; valor = 600000;
            break;
        case "hornoEmpotrable":
            alto = 60; ancho = 60; largo = 55; peso = 25; valor = 500000;
            break;
        case "lavavajillas":
            alto = 85; ancho = 60; largo = 60; peso = 45; valor = 600000;
            break;
        case "lavarropasCargaFrontal":
            alto = 85; ancho = 60; largo = 60; peso = 70; valor = 800000;
            break;
        case "lavarropasCargaSuperior":
            alto = 100; ancho = 60; largo = 60; peso = 65; valor = 600000;
            break;
        case "termotanque50":
            alto = 60; ancho = 40; largo = 40; peso = 20; valor = 250000;
            break;
        case "termotanque80":
            alto = 80; ancho = 40; largo = 40; peso = 25; valor = 250000;
            break;
        case "termotanque110":
            alto = 100; ancho = 40; largo = 40; peso = 30; valor = 250000;
            break;
        case "termotanque150":
            alto = 150; ancho = 40; largo = 40; peso = 35; valor = 250000;
            break;
        case "termotanque180":
            alto = 180; ancho = 50; largo = 50; peso = 40; valor = 300000;
            break;
        case "smartTV32":
            alto = 45; ancho = 73; largo = 10; peso = 6; valor = 250000;
            break;
        case "smartTV40":
            alto = 55; ancho = 91; largo = 10; peso = 8; valor = 350000;
            break;
        case "smartTV43":
            alto = 58; ancho = 97; largo = 10; peso = 9; valor = 400000;
            break;
        case "smartTV50":
            alto = 65; ancho = 112; largo = 10; peso = 11; valor = 550000;
            break;
        case "smartTV58":
            alto = 73; ancho = 130; largo = 10; peso = 14; valor = 600000;
            break;
        case "smartTV65":
            alto = 81; ancho = 145; largo = 10; peso = 17; valor = 750000;
            break;
        case "smartTV70":
            alto = 90; ancho = 157; largo = 10; peso = 20; valor = 850000;
            break;
        case "calefactor2000":
            alto = 60; ancho = 70; largo = 30; peso = 15; valor = 150000;
            break;
        case "calefactor3000":
            alto = 70; ancho = 80; largo = 30; peso = 18; valor = 250000;
            break;
        case "calefactor5000":
            alto = 80; ancho = 100; largo = 30; peso = 22; valor = 350000;
            break;
        case "calefactor8000":
            alto = 90; ancho = 100; largo = 30; peso = 25; valor = 450000;
            break;
        case "split2700":
            alto = 49.5; ancho = 72; largo = 27; peso = 40; valor = 600000; // Medidas de la unidad exterior
            agregarBulto("split2700");
            break;
        case "split3300":
            alto = 49.5; ancho = 72; largo = 27; peso = 50; valor = 700000; // Medidas de la unidad exterior
            agregarBulto("split3300");
            break;
        case "split4500":
            alto = 30; ancho = 82; largo = 60.5; peso = 60; valor = 800000; // Medidas de la unidad exterior
            agregarBulto("split4500");
            break;
        case "split5500":
            alto = 36; ancho = 90; largo = 38; peso = 80; valor = 900000; // Medidas de la unidad exterior
            agregarBulto("split5500");
            break;
        case "split6000":
            alto = 110; ancho = 100.7; largo = 42.4; peso = 99; valor = 1100000; // Medidas de la unidad exterior
            agregarBulto("split6000");
            break;
        case "pisoTecho18000":
            alto = 139; ancho = 95; largo = 40; peso = 135; valor = 1500000; // Medidas de la unidad exterior
            agregarBulto("pisoTecho18000");
            break;
        case "bulto20":
            alto = 20; ancho = 20; largo = 20; peso = 1; valor = 10000;
            break;
        case "bulto30":
            alto = 30; ancho = 30; largo = 30; peso = 2; valor = 20000;
            break;
        case "bulto40":
            alto = 40; ancho = 40; largo = 40; peso = 3; valor = 30000;
            break;
        case "bulto50":
            alto = 50; ancho = 50; largo = 50; peso = 4; valor = 40000;
            break;
        default:
            alto = ancho = largo = peso = valor = 0;
    }

    // Asignar medidas a los inputs de la unidad exterior
    document.getElementById("alto0").value = alto; // Asegúrate de que el ID coincide
    document.getElementById("ancho0").value = ancho; // Asegúrate de que el ID coincide
    document.getElementById("largo0").value = largo; // Asegúrate de que el ID coincide
    document.getElementById("peso").value = peso; // Asegúrate de que el ID coincide
    document.getElementById("valorDeclarado").value = valor; // Asegúrate de que el ID coincide

    // Actualizar cantidad de bultos y volumen
    actualizarCantidadBultos();
    actualizarVolumen();
}

function agregarBulto(tipoElectrodomestico) {
    const bultosContainer = document.getElementById('medidasBultosContainer');

    // Solo agregar un bulto si no se ha agregado uno para el split
    if (!bultoSplitAgregado) {
        const bultoCount = bultosContainer.children.length;

        let altoInterior, anchoInterior, largoInterior;
        
        // Asignar dimensiones según el tipo de split
        switch (tipoElectrodomestico) {
            case "split2700":
                altoInterior = 30; anchoInterior = 73; largoInterior = 19;
                break;
            case "split3300":
                altoInterior = 32; anchoInterior = 101; largoInterior = 22;
                break;
            case "split4500":
                altoInterior = 35; anchoInterior = 102; largoInterior = 23;
                break;
            case "split5500":
                altoInterior = 38; anchoInterior = 109; largoInterior = 34;
                break;
            case "split6000":
                altoInterior = 40; anchoInterior = 110; largoInterior = 38;
                break;
            case "pisoTecho18000":
                altoInterior = 158; anchoInterior = 68; largoInterior = 35;
                break;
            default:
                altoInterior = anchoInterior = largoInterior = 0;
        }        

        // Crear bulto para la unidad interior
        const newBulto = document.createElement('div');
        newBulto.classList.add('bulto', 'bultoSplit'); // Añadir clase para identificar el bulto del split
        newBulto.id = `bulto${bultoCount}`;
        newBulto.innerHTML = `
            <h3 class="bultoTitle">Bulto: Paquete ${bultoCount + 1} (Unidad Interior)</h3>
            <div class="bultoDescripccion">
                <label for="alto${bultoCount}">Alto (cm)</label>
                <label for="ancho${bultoCount}">Ancho (cm)</label>
                <label for="largo${bultoCount}">Largo (cm)</label>
                <label for="cantidad${bultoCount}">Cantidad</label>
            </div>
            <div class="bultoImput">
                <input type="number" id="alto${bultoCount}" name="Alto${bultoCount}" step="1" value="${altoInterior}" required>
                <input type="number" id="ancho${bultoCount}" name="Ancho${bultoCount}" step="1" value="${anchoInterior}" required>
                <input type="number" id="largo${bultoCount}" name="Largo${bultoCount}" step="1" value="${largoInterior}" required>
                <input type="number" id="cantidad${bultoCount}" name="Cantidad${bultoCount}" step="1" value="1" min="1" required>
            </div>
            <button type="button" class="removeBultoButton">Eliminar Bulto</button>
        `;
        bultosContainer.appendChild(newBulto);
        bultoSplitAgregado = true; // Marcar como agregado

        // Agregar evento para eliminar el bulto
        newBulto.querySelector('.removeBultoButton').addEventListener('click', function() {
            newBulto.remove();
            bultoSplitAgregado = false; // Reiniciar la variable
            actualizarCantidadBultos();
            actualizarVolumen();
        });
    }

    actualizarCantidadBultos();
    actualizarVolumen();
}

function actualizarCantidadBultos() {
    const bultosContainer = document.getElementById('medidasBultosContainer');
    const cantidadBultos = bultosContainer.children.length;
    document.getElementById('bultos').value = cantidadBultos || 1;
}

// Agregar el evento al contenedor de bultos para recalcular el volumen al cambiar
document.getElementById('medidasBultosContainer').addEventListener('input', actualizarVolumen);

function actualizarVolumen() {
    const bultosContainer = document.getElementById('medidasBultosContainer');
    let totalVolumen = 0;

    Array.from(bultosContainer.children).forEach(bulto => {
        const alto = parseFloat(bulto.querySelector(`input[name^="Alto"]`).value) || 0;
        const ancho = parseFloat(bulto.querySelector(`input[name^="Ancho"]`).value) || 0;
        const largo = parseFloat(bulto.querySelector(`input[name^="Largo"]`).value) || 0;
        const cantidad = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; // Obtener cantidad

        // Calcular volumen de este bulto y multiplicar por la cantidad
        const volumenBulto = (alto * ancho * largo) / 1000000; // Convertir cm³ a m³
        totalVolumen += volumenBulto * cantidad; // Sumar al volumen total
    });

    // Actualizar el elemento del volumen total
    document.getElementById('volumenTotal').innerText = totalVolumen.toFixed(2); // Mostrar con 2 decimales
}

// Llama a la función al cargar la página para establecer el volumen inicial
document.addEventListener('DOMContentLoaded', () => {
    actualizarCantidadBultos();
    actualizarVolumen();
});
