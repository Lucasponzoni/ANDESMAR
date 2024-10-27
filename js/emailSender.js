async function sendEmail(Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio) {
    const smtpU = 's154745_3';
    const smtpP = 'QbikuGyHqJ';

    console.log(Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio);

    // Mapeo de nombres de plantillas a funciones
    const templates = {
        "emailTemplateAndesmar": emailTemplateAndesmar,
        "emailTemplateAndreani": emailTemplateAndreani,
        "emailTemplateLogPropia": emailTemplateLogPropia,
    };

    // Obtener la función de plantilla basada en el nombre
    const templateFunc = templates[templateName];

    // Verificar si la plantilla existe
    if (!templateFunc) {
        console.error(`Plantilla no encontrada: ${templateName}`);
        return;
    }

    // Generar el cuerpo del email usando la plantilla.
    const emailBody = templateFunc(Name, Subject, templateName, nombre, email, remito, linkSeguimiento2, transporte, numeroDeEnvio); 

    const emailData = {
        "Html": {
            "DocType": null,
            "Head": null,
            "Body": emailBody, 
            "BodyTag": "<body>"
        },
        "Text": "",
        "Subject": Subject,
        "From": {
            "Name": Name,
            "Email": "posventa@novogar.com.ar"
        },
        "To": [
            {
                "Name": nombre,
                "Email": email,
            }
        ],
        "Cc": [],
        "Bcc": ["webnovagar@gmail.com", "posventa@novogar.com.ar"],
        "ReplyTo": null,
        "CharSet": "utf-8",
        "ExtendedHeaders": null,
        "Attachments": null,
        "EmbeddedImages": [],
        "XSmtpAPI": {
            "CampaignName": "Test Campaign",
            "CampaignCode": "1001",
            "Header": false,
            "Footer": true,
            "ClickTracking": null,
            "ViewTracking": null,
            "Priority": null,
            "Schedule": null,
            "DynamicFields": [],
            "CampaignReport": null,
            "SkipDynamicFields": null
        },
        "User": {
            "Username": smtpU,
            "Secret": smtpP,
        }
    };

    try {
        const response = await fetch('https://proxy.cors.sh/https://send.mailup.com/API/v2.0/messages/sendmessage', {
            method: 'POST',
            headers: {
                'x-cors-api-key': 'live_36d58f4c13cb7d838833506e8f6450623bf2605859ac089fa008cfeddd29d8dd',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        if (result.Status === 'done') {
            console.log('Email enviado exitosamente');
            showCustomAlert(`<i class="bi bi-envelope-check"></i> Email de Despacho enviado a ${emailData.To[0].Email} a las ${new Date().toLocaleTimeString()}`);
        } else {
            console.log(`Error al enviar el email: ${result.Message}`);
            showCustomAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${emailData.To[0].Email} a las ${new Date().toLocaleTimeString()}`);
        }              
    } catch (error) {
        console.error('Error al enviar el email:', error);
        showCustomAlertError(`<i class="bi bi-exclamation-square-fill"></i> Error al enviar email a ${emailData.To[0].Email} a las ${new Date().toLocaleTimeString()}`);
    }
}

function showCustomAlert(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'custom-alert';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    
    document.body.appendChild(alertElement);
    
    // Mostrar el alert con animación
    setTimeout(() => {
        alertElement.classList.add('show');
        alertElement.style.visibility = 'visible'; // Asegurarse de que sea visible
    }, 10); // Pequeño retraso para permitir que el DOM se actualice

    // Cerrar el alert al hacer clic en el botón de cerrar
    alertElement.querySelector('.close').onclick = () => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertElement); // Eliminar del DOM después de la animación
        }, 300); // Esperar a que termine la animación
    };

    // Cerrar automáticamente después de 8 segundos
    setTimeout(() => {
        if (alertElement.classList.contains('show')) {
            alertElement.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertElement);
            }, 300);
        }
    }, 8000);
}

function showCustomAlertError(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'custom-alert-error';
    alertElement.innerHTML = `${message} <span class="close">&times;</span>`;
    
    document.body.appendChild(alertElement);
    
    // Mostrar el alert con animación
    setTimeout(() => {
        alertElement.classList.add('show');
        alertElement.style.visibility = 'visible'; // Asegurarse de que sea visible
    }, 10); // Pequeño retraso para permitir que el DOM se actualice

    // Cerrar el alert al hacer clic en el botón de cerrar
    alertElement.querySelector('.close').onclick = () => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertElement); // Eliminar del DOM después de la animación
        }, 300); // Esperar a que termine la animación
    };

    // Cerrar automáticamente después de 8 segundos
    setTimeout(() => {
        if (alertElement.classList.contains('show')) {
            alertElement.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertElement);
            }, 300);
        }
    }, 8000);
}