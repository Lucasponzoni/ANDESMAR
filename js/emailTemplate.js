const emailTemplateAndesmar = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
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
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Seguimiento:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
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
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
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

const emailTemplateOCA = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
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

const emailTemplatePlaceIt = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hola ${nombre}!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Tu compra ha sido preparada para despacho!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333;">Dentro de las pr&oacute;ximas <strong style="color: #28a745;">48 horas h&aacute;biles</strong>, recibir&aacute;s tu compra con env&iacute;o expr&eacute;s directamente desde nuestro almac&eacute;n en Capital hasta tu domicilio.</p><!-- Sección de Fecha de Entrega -->
            <div style="background-color: #ffffff; border: 1px solid #d1d1d1; border-radius: 12px; padding: 15px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(61, 142, 185); font-size: 16px; background-color: #e7f3ff; border-radius: 4px; padding: 4px 8px; display: inline-block;">&nbsp;Recibilo entre ${numeroDeEnvio}&nbsp;</span></p>
            </div><!-- Sección de Transporte, Cliente y Remito -->
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;">
                <img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2Fplaceit-nano.png?alt=media&token=c8007cea-681b-4368-a902-f78180c99d51" alt="Descripción de la imagen" style="max-width: 100%; height: auto;">
              <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
              <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Transporte:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${transporte}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Cliente Novogar:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${linkSeguimiento2}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Remito:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
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

const emailTemplatePlaceItEntrega = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hoy Vamos a visitarte!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Estamos en Camino!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333;">&iexcl;Prep&aacute;rate! Dentro de poco, nuestro repartidor estar&aacute; tocando tu puerta para entregarte la compra que realizaste en Novogar. No olvides estar atento a tu tel&eacute;fono, ya que podr&iacute;a llamarte para coordinar la entrega.</p>
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2Fplaceit-nano.png?alt=media&token=c8007cea-681b-4368-a902-f78180c99d51" alt="Descripción de la imagen" style="max-width: 100%; height: auto;">
                <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Transporte:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${transporte}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Cliente Novogar:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${linkSeguimiento2}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Remito:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
            </div>
        </div>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <div style="text-align: center; font-size: 14px; color: rgb(102, 102, 102);">
            <p>Recuerda que cualquier persona mayor de 18 a&ntilde;os que resida en el domicilio puede recibir tu paquete presentando su DNI. &iexcl;As&iacute; que aseg&uacute;rate de que alguien est&eacute; listo para recibirlo!</p>
            <p>No podemos programar un d&iacute;a o horario espec&iacute;fico de entrega. Pero no te preocupes, el d&iacute;a de la visita, recibir&aacute;s un correo electr&oacute;nico con el asunto <strong>&apos;Hoy vamos a visitarte&apos;</strong>. Los plazos de entrega oscilan entre 3 y 12 d&iacute;as h&aacute;biles, &iexcl;as&iacute; que la espera no ser&aacute; eterna!</p>
            <div style="background-color: rgb(75, 85, 99); color: rgb(255, 255, 255); border-radius: 20px; padding: 15px; margin: 20px 0;">
                <p style="text-align: left;"><strong><span style="color: rgb(255, 255, 255);">IMPORTANTE:</span></strong><span style="color: rgb(255, 255, 255);">&nbsp;Nuestro servicio de entregas es puerta a puerta. Nuestros choferes no tienen permitido el ingreso a los domicilios, as&iacute; que mant&eacute;n tu puerta abierta y lista para recibir tu pedido.</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);"><strong>VISITAS:</strong> Si en la primera visita notifican &apos;Destinatario Ausente&apos;, volver&aacute;n a visitarte dentro de las 72hs h&aacute;biles. &iexcl;No te preocupes, volveremos!</span></p>
                <p style="text-align: left;"><span style="color: rgb(255, 255, 255);">Si al recibir tu paquete notas alg&uacute;n da&ntilde;o en el embalaje, <strong style="color: #FFD700;">te pedimos que rechaces la entrega de inmediato</strong>. <u>No se aceptar&aacute;n cambios ante el incumplimiento de este mensaje.</u></span></p>
            </div>
            <p style="text-align: center; margin-top: 20px;">Ante cualquier inconveniente, comun&iacute;cate con nosotros enviando un email a <a href="mailto:posventa@novogar.com.ar" style="color: #007aff;">posventa@novogar.com.ar</a>, indicando tu n&uacute;mero de pedido. &iexcl;Estamos aqu&iacute; para ayudarte!</p>
            <p style="text-align: center; margin-top: 20px;">Gracias por elegir Novogar. &iexcl;Estamos emocionados de llevarte tu compra!</p><a href="https://wa.me/5493412010598" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">&iexcl;Cont&aacute;ctanos!</a>
        </div>
    </div>
</div>
`;

const emailTemplateLogPropia = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hola ${nombre}!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Tu compra ha sido preparada para despacho!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px;">Dentro de los pr&oacute;ximos <strong style="color: #28a745;">3 d&iacute;as h&aacute;biles</strong>, estaremos entregando tu compra con nuestra log&iacute;stica Novogar. Ten en cuenta lo siguiente:</p>
                <ul style="font-size: 16px; color: #333; list-style-type: none; padding-left: 0;">
                    <li style="background: #f1f1f1; margin: 8px 0; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">En las localidades de <strong>P&eacute;rez</strong>, <strong>Rold&aacute;n</strong> y <strong>Funes</strong>, solo entregamos los d&iacute;as <strong>S&aacute;bados</strong>.</li>
                    <li style="background: #f1f1f1; margin: 8px 0; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">En <strong>Santa Fe Capital</strong>, las entregas se realizan los <strong>Jueves</strong>.</li>
                    <li style="background: #f1f1f1; margin: 8px 0; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">En <strong>Rafaela</strong>, las entregas se realizan los <strong>Viernes</strong>.</li>
                </ul>
                <p style="font-size: 16px; font-weight: bold; background-color: #e0f7fa; padding: 10px; border-radius: 5px; margin-top: 20px;">Los d&iacute;as <span style="color: #28a745;">Lunes</span> visitamos <span style="color: #28a745;">Buenos Aires</span> y los <span style="color: #28a745;">Martes</span> <span style="color: #28a745;">San Nicol&aacute;s</span> y localidades cercanas.</p>
            </div>
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;">
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Orden:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">${remito}</span></p>
                <p style="font-weight: bold; margin: 5px 0;"><span style="color: rgb(0, 0, 0);">Transportista:</span> <span style="color: rgb(61, 142, 185); font-size: 16px;">Logistica Novogar</span></p>
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
</div>`;

const emailFacturacion = (Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f0f5; padding: 20px;">
    <div style="max-width: 600px; background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); margin: auto;">
        <div style="text-align: center;"><a href="http://www.novogar.com.ar" target="_blank" rel="noopener noreferrer"><img src="https://firebasestorage.googleapis.com/v0/b/despachos-meli-novogar.appspot.com/o/Novogar%2FNovogar-logo.png?alt=media&token=9f534184-2944-4b2c-a4be-6e763ee59bc1" style="width: 100%; max-width: 400px;" alt="Logo"></a>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h2 style="color: #333; font-size: 28px; margin: 0;">&iexcl;Hola ${nombre}!</h2>
            <p style="color: #555; font-size: 16px; margin: 10px 0;">Referente al Pedido del usuario: <u><a href="mailto:${email}" target="_blank" style="color: #007aff;">${email}</a></u></p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <h1 style="color: #333; font-size: 24px;">&iexcl;Tu compra ha sido Facturada ✅!</h1>
        </div>
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333;">Dentro de los pr&oacute;ximos <strong style="color: #28a745;">2 d&iacute;as h&aacute;biles</strong>, recibir&aacute;s un e-mail en esta casilla con los datos de seguimiento y un link para que puedas rastrear el paquete.</p>
            <div style="background-color: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 12px; padding: 15px; margin: 10px 0;">
                <p style="font-weight: bold; margin: 5px 0;"><span style="font-size: 14px; color: rgb(71, 85, 119);">La factura de compra llegar&aacute; con el asunto &quot;NOVOGAR - CENTRO LOG&Iacute;STICO&quot;. Te recomendamos revisar la carpeta de spam en los pr&oacute;ximos 30 minutos.</span></p>
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