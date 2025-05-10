async function enviarPedido(sesion, depositoId, almacenCodigo, emplazamientoCodigo, tipoCodigo, letra, centroEmisor, numero, fechaEmision, fechaEntrega, clienteCodigo, destinatarioCodigo, razonSocial, pais, provincia, localidadCodigo, domicilio, centroCostoCodigo, darsenaCodigo, numeroRuteo, entregaParcial, importeFactura, contraReembolso, prioridad, referencia, referenciaAdicional, observaciones, observacionesMeli, ...productos) {

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
console.log('🧠 Datos enviados a BrainSys:', requestData);

try {
    // Obtener los datos desde la base de datos
    const snapshot = await window.dbCDS.ref('LogiPaq').once('value');
    const data = snapshot.val();
    const url = data[19]; 
    const live = data[7]; 

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'x-cors-api-key': live
        },
        body: JSON.stringify(requestData) 
    });

    const result = await response.json(); 

    // Mostrar respuesta de BrainSys con emojis
    if (result.d[0].tipo === 0) {
        console.log('✅ Éxito:', result);
        
        // Mensaje de éxito que se elimina después de 10 segundos
        Swal.fire({
            title: "✅ Éxito",
            html: `
                <div style="max-width: 500px; padding: 20px; border-radius: 10px; background-color: #E3FDE0FF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
                    <strong>El pedido fue creado en BrainSys.</strong>
                    <p style="margin: 10px 0;">El pedido #${result.d[0].pedido.numero} se procesó correctamente.</p>
                </div>
            `,
            icon: 'success',
            showConfirmButton: false,
            timer: 10000, // 10 segundos
            timerProgressBar: true
        });

        // Enviar notificación a Slack
        const slackWebhookUrl = data[20]; // URL del webhook de Slack
        const mensajeSlack = {
            text: `\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n🟢 *${referenciaAdicional}*\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n✅ ¡Éxito! El pedido para *${referencia}* fue creado correctamente.\n\n🗺️ Localidad: *${localidadCodigo}*, 🏠 Domicilio: *${domicilio}*, *${provincia}*\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n\n`
        };

        // Enviar mensaje a Slack
        await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensajeSlack)
        });

    } else {
        // Advertencia o Error
        const mensajeError = result.d[0].mensaje;
        Swal.fire({
            title: "⚠️ Alerta",
            html: `
                <div style="max-width: 500px; padding: 20px; border-radius: 10px; background-color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
                    <strong>El pedido no pudo ser creado en BrainSys.</strong>
                    <p style="margin: 10px 0;">${mensajeError}</p>
                </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        });

        // Enviar notificación a Slack con mensaje de error
        const slackWebhookUrl = data[20]; // URL del webhook de Slack
        const mensajeSlack = {
            text: `\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n🟡 *${referenciaAdicional}*\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n⚠️ Alerta: El pedido para *${referencia}* no pudo ser creado en BrainSys.\n\n<>${mensajeError}\n\n🗺️ Localidad: *${localidadCodigo}*, 🏠 Domicilio: *${domicilio}*, *${provincia}*\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n\n`
        };

        // Enviar mensaje a Slack
        await fetch(slackWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mensajeSlack)
        });
    }

} catch (error) {
    console.error('Error al enviar el pedido a BrainSys:', error); 

    Swal.fire({
        title: '❌ Error',
        text: 'Error al enviar el pedido a BrainSys',
        icon: 'error',
        confirmButtonText: 'Aceptar'
    });

    // Enviar notificación a Slack en caso de error
    const slackWebhookUrl = data[20]; // URL del webhook de Slack
    const mensajeSlack = {
        text: `\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n🔴 *${referenciaAdicional}*\n\n* * * * * * * * * * * * * * * * * * * * * * * *\nError al enviar el pedido de *${referencia}* a BrainSys.\n\n🛑 Detalles del error: ${error.message}\n\n* * * * * * * * * * * * * * * * * * * * * * * *\n\n`
    };

    // Enviar mensaje a Slack
    await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mensajeSlack)
    });
}

}