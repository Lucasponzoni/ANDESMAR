document.getElementById('addBultoButton').addEventListener('click', function() {
    const bultosContainer = document.getElementById('medidasBultosContainer');
    const bultoCount = bultosContainer.children.length; // Contar cuántos bultos hay

    const newBulto = document.createElement('div');
newBulto.classList.add('bulto');
newBulto.id = `bulto${bultoCount}`;
newBulto.innerHTML = `
    <h3 class="bultoTitle">Bulto: Paquete ${bultoCount + 1}</h3>

    <div class="bultoDescripccion">
        <label for="alto${bultoCount}">Alto (cm)</label>
        <label for="ancho${bultoCount}">Ancho (cm)</label>
        <label for="largo${bultoCount}">Largo (cm)</label>
        <label for="cantidad${bultoCount}">Cantidad</label>
    </div>

    <div class="bultoImput">
        <input type="number" id="alto${bultoCount}" name="Alto${bultoCount}" step="1" value="" required>
        <input type="number" id="ancho${bultoCount}" name="Ancho${bultoCount}" step="1" value="" required>
        <input type="number" id="largo${bultoCount}" name="Largo${bultoCount}" step="1" value="" required>
        <input type="number" id="cantidad${bultoCount}" name="Cantidad${bultoCount}" step="1" value="1" min="1" required>
    </div>

    <button type="button" class="removeBultoButton">Eliminar Bulto</button>
`;
bultosContainer.appendChild(newBulto);
actualizarCantidadBultos();

});

document.getElementById('medidasBultosContainer').addEventListener('click', function(e) {
    if (e.target.classList.contains('removeBultoButton')) {
        const bulto = e.target.parentElement;
        bulto.remove();
        actualizarCantidadBultos();
    }
});

function actualizarCantidadBultos() {
    const bultosContainer = document.getElementById('medidasBultosContainer');
    const cantidadBultos = bultosContainer.children.length;
    document.getElementById('bultos').value = cantidadBultos || 1;
}