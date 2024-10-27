const emailTemplateAndesmar = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://i.ibb.co/3cFWspq/Novogar-logo.png" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hola ${nombre}!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Tu compra ha sido preparada para despacho!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333;">Dentro de los pr&oacute;ximos <strong style="color: #28a745;">2 d&iacute;as h&aacute;biles</strong>, podr&aacute;s seguir el estado de tu compra con el n&uacute;mero de seguimiento:</p>
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;">
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Orden:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Transportista:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${transporte}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Seguimiento:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">BNA${remito}</span></p>
            </div><a href="${linkSeguimiento2}" style="display: inline-block; background-color: #007aff; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Rastrear mi pedido</a>
        </div>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <div style="text-align: center; font-size: 14px; color: rgb(102, 102, 102);">
            <p>Recuerda que cualquier persona mayor de 18 a&ntilde;os que resida en el domicilio puede recibir tu paquete presentando su DNI.</p>
            <p>No es posible programar un d&iacute;a espec&iacute;fico ni horario de entrega. El d&iacute;a de la visita, recibir&aacute;s un correo electr&oacute;nico con el asunto <strong>&apos;Hoy vamos a visitarte&apos;</strong>. Los plazos de entrega oscilan entre 3 y 12 d&iacute;as h&aacute;biles.</p>
            <div style="background-color: rgb(75, 85, 99); color: rgb(255, 255, 255); border-radius: 20px; padding: 15px; margin: 20px 0;">
                <p style="text-align: left;"><strong><span style="color: rgb(255, 255, 255);">IMPORTANTE:</span></strong><span style="color: rgb(255, 255, 255);"> Nuestro servicio de entregas es puerta a puerta. Los choferes/acompa&ntilde;antes no tienen permitido el ingreso a los domicilios.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);"><strong>VISITAS:</strong> En caso de que en la primera visita notifiquen &apos;Destinatario Ausente&apos;, volver&aacute;n a visitarte dentro de las 72hs h&aacute;biles.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);">Si al recibir tu paquete notas alg&uacute;n da&ntilde;o en el embalaje, </span><span style="color: rgb(250, 197, 28);"><strong style="color: #FFD700;">te pedimos que rechaces la entrega de inmediato</strong></span><span style="color: rgb(255, 255, 255);">. <u>No ser&aacute;n aceptados cambios ante el incumplimiento de este mensaje.</u></span></p>
            </div>
            <p style="text-align: center; margin-top: 20px;">Ante cualquier inconveniente, comun&iacute;cate con nosotros enviando un email a <a href="mailto:posventa@novogar.com.ar" style="color: #007aff;">posventa@novogar.com.ar</a>, indicando tu n&uacute;mero de pedido.</p>
            <p style="text-align: center; margin-top: 20px;">Gracias por elegir Novogar.</p><a href="https://wa.me/5493412010598" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Contacta con nosotros</a>
        </div>
    </div>
</div>
`;

const emailTemplateAndreani = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://i.ibb.co/3cFWspq/Novogar-logo.png" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hola ${nombre}!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Tu compra ha sido preparada para despacho!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333;">Dentro de los pr&oacute;ximos <strong style="color: #28a745;">2 d&iacute;as h&aacute;biles</strong>, podr&aacute;s seguir el estado de tu compra con el n&uacute;mero de seguimiento:</p>
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;">
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Orden:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Transportista:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${transporte}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Seguimiento:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${numeroDeEnvio}</span></p>
            </div><a href="${linkSeguimiento2}" style="display: inline-block; background-color: #007aff; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">Rastrear mi pedido</a>
        </div>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <div style="text-align: center; font-size: 14px; color: rgb(102, 102, 102);">
            <p>Recuerda que cualquier persona mayor de 18 a&ntilde;os que resida en el domicilio puede recibir tu paquete presentando su DNI.</p>
            <p>No es posible programar un d&iacute;a espec&iacute;fico ni horario de entrega. El d&iacute;a de la visita, recibir&aacute;s un correo electr&oacute;nico con el asunto <strong>&apos;Hoy vamos a visitarte&apos;</strong>. Los plazos de entrega oscilan entre 3 y 12 d&iacute;as h&aacute;biles.</p>
            <div style="background-color: rgb(75, 85, 99); color: rgb(255, 255, 255); border-radius: 20px; padding: 15px; margin: 20px 0;">
                <p style="text-align: left;"><strong><span style="color: rgb(255, 255, 255);">IMPORTANTE:</span></strong><span style="color: rgb(255, 255, 255);"> Nuestro servicio de entregas es puerta a puerta. Los choferes/acompa&ntilde;antes no tienen permitido el ingreso a los domicilios.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);"><strong>VISITAS:</strong> En caso de que en la primera visita notifiquen &apos;Destinatario Ausente&apos;, volver&aacute;n a visitarte dentro de las 72hs h&aacute;biles.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);">Si al recibir tu paquete notas alg&uacute;n da&ntilde;o en el embalaje, </span><span style="color: rgb(250, 197, 28);"><strong style="color: #FFD700;">te pedimos que rechaces la entrega de inmediato</strong></span><span style="color: rgb(255, 255, 255);">. <u>No ser&aacute;n aceptados cambios ante el incumplimiento de este mensaje.</u></span></p>
            </div>
            <p style="text-align: center; margin-top: 20px;">Ante cualquier inconveniente, comun&iacute;cate con nosotros enviando un email a <a href="mailto:posventa@novogar.com.ar" style="color: #007aff;">posventa@novogar.com.ar</a>, indicando tu n&uacute;mero de pedido.</p>
            <p style="text-align: center; margin-top: 20px;">Gracias por elegir Novogar.</p><a href="https://wa.me/5493412010598" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Contacta con nosotros</a>
        </div>
    </div>
</div>
`;

const emailTemplateLogPropia = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://i.ibb.co/3cFWspq/Novogar-logo.png" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hola ${nombre}!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Tu compra ha sido preparada para despacho!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333;">Dentro de los pr&oacute;ximos <strong style="color: #28a745;">3 d&iacute;as h&aacute;biles</strong>, estaremos entregando tu compra con nuestra log&iacute;stica Novogar. En las localidades de P&eacute;rez, Rold&aacute;n y Funes, solo entregamos los d&iacute;as S&aacute;bados. En Santa Fe Capital, las entregas se realizan los viernes.</p>
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;">
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Orden:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Transportista:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">Logistica Novogar</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Seguimiento:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">Sin Seguimiento</span></p>
            </div>
        </div>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <div style="text-align: center; font-size: 14px; color: rgb(102, 102, 102);">
            <p>Recuerda que cualquier persona mayor de 18 a&ntilde;os que resida en el domicilio puede recibir tu paquete presentando su DNI.</p>
            <p>No es posible programar un d&iacute;a espec&iacute;fico ni horario de entrega. El d&iacute;a de la visita, recibir&aacute;s un correo electr&oacute;nico con el asunto <strong>&apos;Hoy vamos a visitarte&apos;</strong>. Los plazos de entrega oscilan entre 3 y 12 d&iacute;as h&aacute;biles.</p>
            <div style="background-color: rgb(75, 85, 99); color: rgb(255, 255, 255); border-radius: 20px; padding: 15px; margin: 20px 0;">
                <p style="text-align: left;"><strong><span style="color: rgb(255, 255, 255);">IMPORTANTE:</span></strong><span style="color: rgb(255, 255, 255);">&nbsp;Nuestro servicio de entregas es puerta a puerta. Los choferes/acompa&ntilde;antes no tienen permitido el ingreso a los domicilios.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);"><strong>VISITAS:</strong> En caso de que en la primera visita notifiquen &apos;Destinatario Ausente&apos;, volver&aacute;n a visitarte dentro de las 72hs h&aacute;biles.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);">Si al recibir tu paquete notas alg&uacute;n da&ntilde;o en el embalaje,&nbsp;</span><span style="color: rgb(250, 197, 28);"><strong style="color: #FFD700;">te pedimos que rechaces la entrega de inmediato</strong></span><span style="color: rgb(255, 255, 255);">. <u>No ser&aacute;n aceptados cambios ante el incumplimiento de este mensaje.</u></span></p>
            </div>
            <p style="text-align: center; margin-top: 20px;">Ante cualquier inconveniente, comun&iacute;cate con nosotros enviando un email a <a href="mailto:posventa@novogar.com.ar" style="color: #007aff;">posventa@novogar.com.ar</a>, indicando tu n&uacute;mero de pedido.</p>
            <p style="text-align: center; margin-top: 20px;">Gracias por elegir Novogar.</p><a href="https://wa.me/5493412010598" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Contacta con nosotros</a>
        </div>
    </div>
</div>
`;
