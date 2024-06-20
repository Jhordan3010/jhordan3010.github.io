function generarEntradasSubredes() {
    const numeroSubredes = document.getElementById('numeroSubredes').value;
    const contenedorEntradasSubredes = document.getElementById('contenedorEntradasSubredes');
    
    // Limpiar entradas anteriores
    contenedorEntradasSubredes.innerHTML = '';
    
    for (let i = 0; i < numeroSubredes; i++) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        // Entrada para el nombre de la subred
        const labelNombre = document.createElement('label');
        labelNombre.textContent = `Nombre de la Subred ${i + 1}:`;
        
        const inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.name = `nombreSubred${i + 1}`;
        inputNombre.placeholder = `Ingrese el nombre de la subred ${i + 1}`;
        inputNombre.required = true;
        
        // Entrada para el número de hosts
        const labelHosts = document.createElement('label');
        labelHosts.textContent = `Número de Hosts para Subred ${i + 1}:`;
        
        const inputHosts = document.createElement('input');
        inputHosts.type = 'number';
        inputHosts.name = `hostsSubred${i + 1}`;
        inputHosts.placeholder = `Ingrese el número de hosts para la subred ${i + 1}`;
        inputHosts.required = true;
        
        // Añadir las entradas al formulario
        formGroup.appendChild(labelNombre);
        formGroup.appendChild(inputNombre);
        formGroup.appendChild(labelHosts);
        formGroup.appendChild(inputHosts);
        contenedorEntradasSubredes.appendChild(formGroup);
    }
}

function calcularSubredes() {
    const direccionRed = document.getElementById('direccionRed').value;
    const prefijoSubred = parseInt(document.getElementById('prefijoSubred').value);
    const numeroSubredes = parseInt(document.getElementById('numeroSubredes').value);
    const contenedorEntradasSubredes = document.getElementById('contenedorEntradasSubredes');

    // Limpiar tabla de resultados anterior
    const tablaBody = document.getElementById('tablaBody');
    tablaBody.innerHTML = '';

    let subredesInfo = [];
    for (let i = 0; i < numeroSubredes; i++) {
        const inputNombre = contenedorEntradasSubredes.querySelector(`input[name="nombreSubred${i + 1}"]`);
        const inputHosts = contenedorEntradasSubredes.querySelector(`input[name="hostsSubred${i + 1}"]`);
        subredesInfo.push({
            nombre: inputNombre.value,
            hosts: parseInt(inputHosts.value, 10)
        });
    }

    // Convertir la dirección de red a un número entero
    const ipAEntero = (ip) => {
        return ip.split('.').reduce((ipInt, octeto) => (ipInt << 8) + parseInt(octeto, 10), 0) >>> 0;
    };

    // Convertir un número entero a una dirección IP
    const enteroAIp = (ipInt) => {
        return ((ipInt >>> 24) + '.' + (ipInt >> 16 & 255) + '.' + (ipInt >> 8 & 255) + '.' + (ipInt & 255));
    };

    // Obtener la dirección de red y máscara
    const [ipRed, prefijo] = direccionRed.split('/');
    const redEntero = ipAEntero(ipRed);
    const mascara = -1 << (32 - prefijoSubred);

    // Ordenar las subredes por tamaño (descendente)
    subredesInfo.sort((a, b) => b.hosts - a.hosts);

    let subredes = [];
    let redActualEntero = redEntero;

    for (let subredInfo of subredesInfo) {
        const tamañoRequerido = Math.pow(2, Math.ceil(Math.log2(subredInfo.hosts + 2))); // Número de direcciones incluyendo red y broadcast
        const mascaraSubred = 32 - Math.ceil(Math.log2(tamañoRequerido));
        const subred = {
            nombre: subredInfo.nombre,
            red: enteroAIp(redActualEntero),
            prefijo: mascaraSubred,
            primerHost: enteroAIp(redActualEntero + 1),
            ultimoHost: enteroAIp((redActualEntero + tamañoRequerido) - 2),
            broadcast: enteroAIp((redActualEntero + tamañoRequerido) - 1),
            ultimaIp: enteroAIp((redActualEntero + tamañoRequerido) - 2) // Asumiendo que quieres mostrar la última IP
        };

        subredes.push(subred);

        // Calcular la siguiente red a partir de la actual
        redActualEntero += tamañoRequerido;
    }

    // Mostrar los resultados en la tabla
    mostrarResultados(subredes);
}

function mostrarResultados(subredes) {
    const tablaBody = document.getElementById('tablaBody');

    subredes.forEach(subred => {
        const row = document.createElement('tr');

        const nombreCell = document.createElement('td');
        nombreCell.textContent = subred.nombre;

        const direccionCell = document.createElement('td');
        direccionCell.textContent = `${subred.red}/${subred.prefijo}`;

        const rangoCell = document.createElement('td');
        rangoCell.textContent = `${subred.primerHost} - ${subred.ultimoHost}`;

        const broadcastCell = document.createElement('td');
        broadcastCell.textContent = subred.broadcast;

        const ultimaIpCell = document.createElement('td');
        ultimaIpCell.textContent = subred.ultimaIp;

        row.appendChild(nombreCell);
        row.appendChild(direccionCell);
        row.appendChild(rangoCell);
        row.appendChild(broadcastCell);
        row.appendChild(ultimaIpCell);

        tablaBody.appendChild(row);
    });
}
