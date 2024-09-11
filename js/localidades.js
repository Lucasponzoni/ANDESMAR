const spinner = document.getElementById('loadingSpinner');
const clearButton = document.getElementById('clearButton');
const localidadInput = document.getElementById('localidad');
const pisoDeptoDiv = document.querySelector('.PisoyDepto');
const Andrean = document.querySelector('.Andrean'); 
const provinciaDiv = document.querySelector('.provincia p');
let todasLasLocalidades = []; // Array para almacenar todas las localidades

// Evento para el input de código postal
document.getElementById('codigoPostalDestinatario').addEventListener('input', function() {
    const codigoPostal = this.value;

    if (codigoPostal.length > 3) {
        buscarPorCodigoPostal(codigoPostal);
    } else {
        document.getElementById('listaLocalidades').style.display = 'none'; // Ocultar si el campo está vacío
        clearButton.style.display = 'none'; // Ocultar botón de borrar
    }
});

// Función para buscar localidades por código postal
function buscarPorCodigoPostal(codigoPostal) {
    spinner.style.display = 'block'; // Mostrar spinner

    fetch(`https://apis.andreani.com/v1/localidades?codigosPostales=${codigoPostal}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        mostrarResultados(data);
    })
    .catch(error => {
        console.error('Error fetching localidades:', error);
        spinner.style.display = 'none'; // Ocultar spinner en caso de error
    });
}

// Evento para el input de localidad
localidadInput.addEventListener('input', function() {
    const localidad = this.value;
    if (localidad.length >= 3) { // Buscar después de 3 caracteres
        if (todasLasLocalidades.length === 0) {
            // Si no se han cargado todas las localidades, cargarlas
            cargarTodasLasLocalidades();
        } else {
            filtrarLocalidades(localidad);
        }
    } else {
        document.getElementById('listaLocalidades').style.display = 'none'; // Ocultar si el campo tiene menos de 3 caracteres
        clearButton.style.display = 'none'; // Ocultar botón de borrar
    }
});

// Cargar todas las localidades una sola vez
function cargarTodasLasLocalidades() {
    spinner.style.display = 'block'; // Mostrar spinner

    fetch(`https://apis.andreani.com/v1/localidades`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        todasLasLocalidades = data; // Almacenar todas las localidades
        filtrarLocalidades(localidadInput.value); // Filtrar con el valor actual del input
    })
    .catch(error => {
        console.error('Error fetching todas las localidades:', error);
        spinner.style.display = 'none'; // Ocultar spinner en caso de error
    });
}

// Función para filtrar localidades
function filtrarLocalidades(localidad) {
    const resultadosFiltrados = todasLasLocalidades.filter(item => 
        item.localidad.toLowerCase().startsWith(localidad.toLowerCase())
    );
    mostrarResultados(resultadosFiltrados);
}

// Función para mostrar los resultados en la lista
function mostrarResultados(data) {
    const lista = document.getElementById('listaLocalidades');
    lista.innerHTML = ''; // Limpiar la lista
    lista.style.display = 'none'; // Ocultar la lista inicialmente
    spinner.style.display = 'none'; // Ocultar spinner

    if (data && data.length > 0) {
        data.forEach(item => {
            const option = document.createElement('div');
            option.textContent = `${item.localidad} (${item.provincia})`;
            option.classList.add('sugerencia'); // Clase para estilizar las sugerencias
            option.onclick = () => {
                localidadInput.value = item.localidad; // Poner solo la localidad en el input
                clearButton.style.display = 'inline'; // Mostrar botón de borrar
                lista.style.display = 'none'; // Ocultar la lista después de seleccionar
                pisoDeptoDiv.classList.remove('hidden'); // Eliminar la clase hidden
                Andrean.classList.remove('hidden'); // Eliminar la clase hidden
                provinciaDiv.textContent = item.provincia; // Mostrar la provincia en el div

                // Completar el código postal correspondiente
                const codigosPostales = item.codigosPostales;
                if (codigosPostales.length > 0) {
                    document.getElementById('codigoPostalDestinatario').value = codigosPostales[0]; // Usar el primer código postal
                }
            };
            lista.appendChild(option);
        });
        lista.style.display = 'block'; // Mostrar la lista si hay resultados
    } else {
        lista.style.display = 'none'; // Ocultar si no hay resultados
    }
}

// Ocultar la lista si se hace clic fuera de ella
document.addEventListener('click', function(event) {
    const lista = document.getElementById('listaLocalidades');
    if (!lista.contains(event.target) && event.target.id !== 'localidad') {
        lista.style.display = 'none';
    }
});

// Borrar localidad al hacer clic en la "X"
clearButton.addEventListener('click', function() {
    localidadInput.value = ''; // Limpiar el input
    clearButton.style.display = 'none'; // Ocultar botón de borrar
    document.getElementById('listaLocalidades').style.display = 'none'; // Ocultar la lista
    pisoDeptoDiv.classList.add('hidden'); // Agregar la clase hidden nuevamente
    Andrean.classList.add('hidden'); // Agregar la clase hidden nuevamente
    provinciaDiv.textContent = ''; // Limpiar el texto de la provincia
});
