async function enviarPedido(sesion, depositoId, almacenCodigo, emplazamientoCodigo, tipoCodigo, letra, centroEmisor, numero, fechaEmision, fechaEntrega, clienteCodigo, destinatarioCodigo, razonSocial, pais, provincia, localidadCodigo, domicilio, centroCostoCodigo, darsenaCodigo, numeroRuteo, entregaParcial, importeFactura, contraReembolso, prioridad, referencia, referenciaAdicional, observaciones, ...productos) {

    const detalles = productos.map((producto, index) => ({
        linea: index + 1,
        producto: {
            codigo: producto.codigo,
            compania: {
                codigo: producto.companiaCodigo
            }
        },
        lote: {
            codigo: producto.loteCodigo,
            vencimiento: producto.vencimiento || ""
        },
        loteUnico: producto.loteUnico || false,
        serie: producto.serie || "",
        estado: {
            codigo: producto.estadoCodigo
        },
        cantidad: producto.cantidad,
        entregaParcial: producto.entregaParcial || false
    }));

    // Crear el objeto de pedido
    const pedido = {
        almacen: {
            codigo: almacenCodigo,
            emplazamiento: {
                codigo: emplazamientoCodigo
            }
        },
        tipo: {
            codigo: tipoCodigo
        },
        letra: letra,
        centroEmisor: centroEmisor,
        numero: numero,
        fechaEmision: fechaEmision,
        fechaEntrega: fechaEntrega,
        destinatario: {
            cliente: {
                codigo: clienteCodigo
            },
            codigo: destinatarioCodigo
        },
        razonSocial: razonSocial,
        pais: pais,
        provincia: provincia,
        localidad: {
            codigo: localidadCodigo
        },
        domicilio: domicilio,
        centroCosto: {
            codigo: centroCostoCodigo
        },
        darsena: {
            codigo: darsenaCodigo
        },
        numeroRuteo: numeroRuteo,
        entregaParcial: entregaParcial,
        importeFactura: importeFactura,
        contraReembolso: contraReembolso,
        prioridad: prioridad,
        referencia: referencia,
        referenciaAdicional: referenciaAdicional,
        observaciones: observaciones,
        detalles: detalles
    };

    const requestData = {
        sesion: sesion, 
        deposito: { id: depositoId },
        pedidos: [pedido] 
    };

    console.log(requestData);

    try {
        const response = await fetch("https://proxy.cors.sh/http://190.210.249.71:8001/brainsys_test_api/deposito/servicios/Pedidos.asmx/Crear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd'
            },
            body: JSON.stringify(requestData) 
        });
    
        const result = await response.json(); 
        console.log(result);
        
        console.log('✅ Pedido enviado con éxito a BrainSys.');
    } catch (error) {
        console.error('Error al enviar el pedido a BrainSys:', error); 

        Swal.fire({
            title: '❌ Error',
            text: 'Error al enviar el pedido a BrainSys',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }    
}