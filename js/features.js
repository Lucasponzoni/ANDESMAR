   //! FUNCION IR ARRIBA
const scrollToTopButton = document.getElementById("scrollToTop");

    window.addEventListener("scroll", () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            scrollToTopButton.style.display = "block"; 
        } else {
            scrollToTopButton.style.display = "none";
        }
    });

    scrollToTopButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    //! FUNCION IR ABAJO
const scrollToDownButton = document.getElementById("scrollToDown");

    // Mostrar el botón cuando el usuario no está en la parte inferior de la página
    window.addEventListener("scroll", () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            scrollToDownButton.style.display = "none";
        } else {
            scrollToDownButton.style.display = "block";
        }
    });

// Evento para desplazar hacia abajo
scrollToDownButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
        top: document.body.scrollHeight, // Desplazar hasta el final de la página
        behavior: "smooth"
    });
});

// Evento para desplazar hacia abajo
scrollToDownButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
        top: document.body.scrollHeight, // Desplazar hasta el final de la página
        behavior: "smooth"
    });
});

    //! BUSCARDOR Y EDITOR DE LOCALIDADES EN CADA CARD
    
    function capitalize(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    
    function buscarLocalidades(id, query) {
        const sugerenciasDiv = document.getElementById(`sugerencias-${id}`);
        
        // Mostrar el contenedor de sugerencias solo si hay texto en el input
        if (query.length < 2) {
            sugerenciasDiv.style.display = 'none';
            return;
        } else {
            sugerenciasDiv.style.display = 'block'; 
        }
    
        sugerenciasDiv.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 100%;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden"></span>
                </div>
            </div>
        `;
    
        if (query.length < 3) {
            return;
        }
    
        setTimeout(() => {
            const resultados = localidades.filter(item => 
                item.localidad.toLowerCase().includes(query.toLowerCase()) ||
                item.provincia.toLowerCase().includes(query.toLowerCase()) ||
                item.codigosPostales.some(codigo => codigo.includes(query))
            );
    
            mostrarSugerencias(resultados, id);
        }, 2500); 
    }
    
    function mostrarSugerencias(data, id) {
        const sugerenciasDiv = document.getElementById(`sugerencias-${id}`);
        sugerenciasDiv.innerHTML = '';
    
        if (data.length === 0) {
            sugerenciasDiv.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }
    
        data.forEach(item => {
            const suggestion = document.createElement('div');
            suggestion.className = 'sugerencia';
            suggestion.innerText = `${item.codigosPostales[0]} - ${item.localidad}, ${item.provincia}`;
            suggestion.onclick = () => seleccionarSugerencia(item, id);
            sugerenciasDiv.appendChild(suggestion);
        });
    }
    
    function editarLocalidad(id) {
        const inputDiv = document.getElementById(`inputLocalidad-${id}`);
        const btnBorrar = document.getElementById(`btnBorrar-${id}`);
    
        if (inputDiv.style.display === 'block') {
            inputDiv.style.display = 'none'; // Oculta el input si ya está visible
            btnBorrar.style.display = 'none'; // Oculta el botón "Borrar localidad"
        } else {
            inputDiv.style.display = 'block'; // Muestra el input para editar
            btnBorrar.style.display = 'inline-block'; // Muestra el botón "Borrar localidad"
        }
    }    
    
    function borrarLocalidad(id) {
        const input = document.getElementById(`localidadInput-${id}`);
        input.value = ''; // Borra el contenido del input
        document.getElementById(`sugerencias-${id}`).style.display = 'none'; // Oculta sugerencias
        document.getElementById(`btnBorrar-${id}`).style.display = 'none'; // Oculta el botón "Borrar localidad"
    }
    
    // Función para seleccionar una sugerencia y actualizar el DOM y Firebase
    function seleccionarSugerencia(item, id) {
        const input = document.getElementById(`localidadInput-${id}`);
        input.value = item.localidad; // Actualiza el input con la localidad
    
        // Actualiza el campo de localidad en el span en mayúsculas
        const localidadSpan = document.getElementById(`localidadDeEnvio-${id}`);
        localidadSpan.innerHTML = `${capitalize(item.codigosPostales[0])}, ${capitalize(item.localidad)}, ${capitalize(item.provincia)}`;
    
        // Limpia las sugerencias
        document.getElementById(`sugerencias-${id}`).innerHTML = '';
    
        // Oculta el input
        document.getElementById(`inputLocalidad-${id}`).style.display = 'none';
        
        // Muestra el span de nuevo
        localidadSpan.style.display = 'inline';
    
        // Oculta el botón "Borrar localidad" si se selecciona una sugerencia
        const btnBorrar = document.getElementById(`btnBorrar-${id}`);
        btnBorrar.style.display = 'none';
    
        // Actualiza en Firebase
        const updates = {
            Cp: capitalize(item.codigosPostales[0]),
            localidad: capitalize(item.localidad),
            Provincia: capitalize(item.provincia)
        };
    
        const dbRef = database.ref(`envios/${id}`);
        dbRef.update(updates)
            .then(() => {
                // Actualiza el DOM directamente
                const tarjeta = document.querySelector(`.card:has(#collapseDetails${id})`);
    
                if (tarjeta) {
                    const cpLocalidadTexto = tarjeta.querySelector('.cpLocalidad-meli');
                    if (cpLocalidadTexto) {
                        cpLocalidadTexto.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${updates.Cp}, ${updates.localidad}, ${updates.Provincia}`;
                    } else {
                        console.error('Elemento cpLocalidad-meli no encontrado.');
                    }
                } else {
                    console.error(`Tarjeta con ID collapseDetails${id} no encontrada.`);
                }
    
                Swal.fire({
                    title: '¡Localidad de envio Actualizada!',
                    text: 'Los datos han sido actualizados correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    location.reload();
                });
            })
            .catch((error) => {
                console.error('Error al actualizar los datos:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Hubo un problema al actualizar los datos.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            });
    }