const spinner = document.getElementById('loadingSpinner'); // Usar el nuevo ID del spinner
        const clearButton = document.getElementById('clearButton');
        const localidadInput = document.getElementById('localidad');

        document.getElementById('codigoPostalDestinatario').addEventListener('input', function() {
            const codigoPostal = this.value;

            if (codigoPostal.length > 0) {
                spinner.style.display = 'block'; // Mostrar spinner

                fetch(`https://apisqa.andreani.com/v1/localidades?codigosPostales=${codigoPostal}`)
                    .then(response => response.json())
                    .then(data => {
                        const lista = document.getElementById('listaLocalidades');
                        lista.innerHTML = ''; // Limpiar la lista
                        lista.style.display = 'none'; // Ocultar la lista inicialmente
                        spinner.style.display = 'none'; // Ocultar spinner

                        if (data.length > 0) {
                            data.forEach(item => {
                                const option = document.createElement('div');
                                option.textContent = `${item.localidad} (${item.provincia})`; // Formato: Localidad (Provincia)
                                option.onclick = () => {
                                    localidadInput.value = option.textContent; // Poner el valor en el input
                                    clearButton.style.display = 'inline'; // Mostrar botón de borrar
                                    lista.style.display = 'none'; // Ocultar la lista después de seleccionar
                                };
                                lista.appendChild(option);
                            });
                            lista.style.display = 'block'; // Mostrar la lista si hay resultados
                        } else {
                            lista.style.display = 'none'; // Ocultar si no hay resultados
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching localidades:', error);
                        spinner.style.display = 'none'; // Ocultar spinner en caso de error
                    });
            } else {
                document.getElementById('listaLocalidades').style.display = 'none'; // Ocultar si el campo está vacío
                clearButton.style.display = 'none'; // Ocultar botón de borrar
            }
        });

        // Mostrar la lista al hacer clic en el input de localidad
        localidadInput.addEventListener('focus', function() {
            const codigoPostal = document.getElementById('codigoPostalDestinatario').value;

            if (codigoPostal.length > 0) {
                spinner.style.display = 'block'; // Mostrar spinner

                fetch(`https://apisqa.andreani.com/v1/localidades?codigosPostales=${codigoPostal}`)
                    .then(response => response.json())
                    .then(data => {
                        const lista = document.getElementById('listaLocalidades');
                        lista.innerHTML = ''; // Limpiar la lista
                        spinner.style.display = 'none'; // Ocultar spinner

                        if (data.length > 0) {
                            data.forEach(item => {
                                const option = document.createElement('div');
                                option.textContent = `${item.localidad} (${item.provincia})`; // Formato: Localidad (Provincia)
                                option.onclick = () => {
                                    localidadInput.value = option.textContent; // Poner el valor en el input
                                    clearButton.style.display = 'inline'; // Mostrar botón de borrar
                                    lista.style.display = 'none'; // Ocultar la lista después de seleccionar
                                };
                                lista.appendChild(option);
                            });
                            lista.style.display = 'block'; // Mostrar la lista si hay resultados
                        } else {
                            lista.style.display = 'none'; // Ocultar si no hay resultados
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching localidades:', error);
                        spinner.style.display = 'none'; // Ocultar spinner en caso de error
                    });
            }
        });

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
        });