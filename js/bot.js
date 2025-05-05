const bot = document.getElementById('bot');
const chatt = document.getElementById('chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messageBot');
const sendButton = document.getElementById('send-button');

const welcomeMessages = [
    "📦 ¡Che, pasame tu código postal así te digo con qué lo mandamos!",
    "🗺️ ¿Cómo va? Decime el código postal y te tiro la mejor opción de envío.",
    "🚀 ¡Hola! Mandame el código postal y vemos cómo lo despachamos mejor.",
    "🏷️ ¡Ey! Pasame el CP y te doy una mano con la logística.",
    "📮 ¡Buenas! Tirame el código postal y te digo cómo lo mandamos.",
    "🛵 ¡Qué tal! Con tu CP te digo qué empresa conviene usar.",
    "🚚 ¡Hola hola! Necesito el código postal para ver cómo lo enviamos.",
    "📬 ¡Holis! Decime el CP y te ayudo con el envío.",
    "📦 ¡Crack! Pasame tu código postal y te doy una mano con el envio.",
    "📍 ¡Ey, pasame tu CP y te digo qué logística te conviene usar!",
    "📢 ¡Hola genio! Con tu código postal veo cómo te lo mandamos.",
    "🧭 ¡Che! Tirame el CP y te doy una mano con el envío.",
    "🛫 ¡A volar...! Pasame el código postal y vemos qué opción garpa más.",
    "📤 ¡Buenas! Decime el CP y te digo cómo sale el envío.",
    "✉️ ¡Hola capo! Con el CP te digo al toque cómo conviene mandarlo."
];

let inactivityTimeout;

bot.addEventListener('click', () => {
    if (chatt.style.display === 'none' || chatt.style.display === '') {
        chatt.style.display = 'block';
        chatt.style.animation = 'slideIn 0.3s ease forwards'; 
        bot.querySelector('img').src = './bot/bot2-texting.gif';
        bot.classList.add('active');
        bot.style.background = 'radial-gradient(closest-side, white, white, white, #34c759)';
        sendWelcomeMessage();
        chatInput.focus();
        resetInactivityTimer(); 
    } else {
        closeChat();
    }
});

sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendWelcomeMessage() {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'messageBot bot-messageBot';
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    welcomeMessage.textContent = welcomeMessages[randomIndex];
    chatMessages.appendChild(welcomeMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Desplazar hacia abajo
}

function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText) {
        // Crear el mensaje del usuario
        const userMessage = document.createElement('div');
        userMessage.className = 'messageBot user-messageBot';
        userMessage.textContent = messageText;
        chatMessages.appendChild(userMessage);
        
        // Limpiar el input
        chatInput.value = '';

        // Validar si hay un CP de 4 dígitos
        const cpMatch = messageText.match(/\b\d{4}\b/);
        const esPregunta = messageText.endsWith('?') || messageText.split(' ').length > 1;

        if (cpMatch) {
            const cp = cpMatch[0];
            buscarEnFirebase(cp);
        } else {
            const respuestasSinCP = [
                "⚠️ Pasame un código postal de 4 números, tipo 1407 o 8300.",
                "📮 Necesito un CP de 4 cifras, por ejemplo: 2000, 5000, 7600...",
                "🚫 Sin un CP válido (4 números) no puedo ayudarte, bro 😅",
                "📌 Mandame un código postal así te digo qué llega.",
                "📦 Necesito 4 numeritos mágicos para buscar la info 🚀",
                "😵 Estoy perdido... ¿Dónde estoy? ¡Pasame un CP así me ubico!",
                "🤯 No sé si estás en Tucumán o en Marte... tirá un CP crack",
                "👀 Estoy leyendo, pero no veo ningún código postal. ¿Me estás trolleando?",
                "🙃 ¿Y el CP? Estoy esperando como perro en la ventana.",
                "🧙 Necesito 4 números... sin eso no puedo invocar ninguna logística.",
                "🧠 Soy smart, pero no adivino CPs. ¡Dame uno y te digo todo!",
                "🗺️ Mandame un CP así saco el mapa y te digo qué llega.",
                "🫠 Me dejaste sin norte. Tirá un CP, porfa."
            ];            

            const respuestasPreguntaSinCP = [
                "🤖 Por ahora mi función es decirte dónde llegan las logísticas, no me preguntes cosas raras 🙃",
                "🧠 No soy tan inteligente (todavía), pero con CPs la rompo 💪",
                "📚 Estoy aprendiendo, pero de momento solo entiendo CPs de 4 dígitos.",
                "🎯 Si me pasás un CP, te digo qué opciones de envío hay. ¡Probá!",
                "😅 No tengo todas las respuestas aún, pero para CPs soy crack.",
                "🦾 No soy ChatGPT, soy el bot de los envíos. Tirame un CP y vemos qué onda.",
                "💬 ¿Charlamos? Genial. ¿De logística? Solo si me das un CP primero 😎",
                "🛑 Pará pará... primero pasame un CP y después filosofamos.",
                "🧩 No entiendo preguntas aún, soy más tipo 'mandame el dato y te devuelvo magia'.",
                "📦 Estoy más para despachar paquetes que para debatir existencialismo.",
                "👽 No sé qué decirte, salvo que sin CP me siento como un bot fuera del sistema.",
                "🤷‍♂️ Me entrenaron para mirar mapas y CPs... no para responder preguntas filosóficas."
            ];            

            const botMessage = document.createElement('div');
            botMessage.className = 'messageBot bot-messageBot';

            if (esPregunta) {
                botMessage.textContent = respuestasPreguntaSinCP[Math.floor(Math.random() * respuestasPreguntaSinCP.length)];
            } else {
                botMessage.textContent = respuestasSinCP[Math.floor(Math.random() * respuestasSinCP.length)];
            }

            chatMessages.appendChild(botMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            bot.querySelector('img').src = './bot/bot6-laught.gif';
            restaurarImagenBot();
        }

        resetInactivityTimer();
    }
}

function buscarEnFirebase(cp) {
    const carpetas = [
        { nombre: "CamionRosario", descripcion: "Camion desde Rosario, Logistica Novogar" },
        { nombre: "CamionBsAs", descripcion: "Camion Buenos Aires, Logistica Novogar" },
        { nombre: "CamionRafaela", descripcion: "Camion Rafaela, Logistica Novogar" },
        { nombre: "CamionSNicolas", descripcion: "Camion San Nicolas, Logistica Novogar" },
        { nombre: "CamionStaFe", descripcion: "Camion Santa Fe, Logistica Novogar" },
        { nombre: "Andesmar", descripcion: "Andesmar Cargas" },
        { nombre: "CDS", descripcion: "Cruz del Sur" },
        { nombre: "Andreani", descripcion: "Correo Andreani" },
        { nombre: "PodriaAndesmar", descripcion: "Andesmar Cargas" },
        { nombre: "PodriaCDS", descripcion: "Cruz del Sur" },
        { nombre: "PodriaPlaceIt", descripcion: "PlaceIt" }
    ];

    let encontrado = [];
    let consultasCompletadas = 0;

    carpetas.forEach(carpeta => {
        const ref = dbLogisticasNovo.ref(carpeta.nombre);
        ref.once('value').then(snapshot => {
            snapshot.forEach(childSnapshot => {
                const id = childSnapshot.key;
                if (id === cp) {
                    encontrado.push(carpeta);
                }
            });

            consultasCompletadas++;

            if (consultasCompletadas === carpetas.length) {
                if (encontrado.length > 0) {
                    bot.querySelector('img').src = './bot/bot3-success.gif';
                    responderUsuario(cp, encontrado);
                } else {
                    bot.querySelector('img').src = './bot/bot7-tea.gif';
                    sinCoincidencias(cp);
                }

                restaurarImagenBot(); // Restaurar imagen después de 10s
            }
        });
    });
}

function restaurarImagenBot() {
    clearTimeout(window.botTimer); // por si se ejecuta dos veces

    window.botTimer = setTimeout(() => {
        bot.querySelector('img').src = './bot/bot2-texting.gif';
    }, 10000); // 10 segundos
}

// Restaurar también si el usuario comienza a escribir
document.querySelector('#chat-input').addEventListener('input', () => {
    bot.querySelector('img').src = './bot/bot2-texting.gif';
    clearTimeout(window.botTimer); // Cancelar temporizador si empieza a escribir
});

function responderUsuario(cp, encontrado) {
    const botMessage = document.createElement('div');
    botMessage.className = 'messageBot bot-messageBot';

    const frasesIntro = [
        `🔍 <strong>Estuve chusmeando el CP</strong> <em>${cp}</em> <strong>y pinta que:</strong><br><br>🌟 <strong>Principal:</strong>`,
        `🧭 <strong>Chequeé el código postal</strong> <em>${cp}</em> <strong>y encontré lo siguiente:</strong><br><br>🚛 <strong>Principal:</strong>`,
        `👀 <strong>Miré bien el CP</strong> <em>${cp}</em> <strong>y te tiro data:</strong><br><br>💼 <strong>Principal:</strong>`,
        `📮 <strong>Analicé el código</strong> <em>${cp}</em> <strong>y acá va la posta:</strong><br><br>🥇 <strong>Principal:</strong>`,
        `🔎 <strong>Escaneé el CP</strong> <em>${cp}</em> <strong>y esto es lo que hay:</strong><br><br>🔥 <strong>Principal:</strong>`,
        `🛰️ <strong>Satélite en órbita localizó el CP</strong> <em>${cp}</em> <strong>y esto apareció:</strong><br><br>✅ <strong>Principal:</strong>`,
        `🤖 <strong>El algoritmo procesó el CP</strong> <em>${cp}</em> <strong>y tiró este resultado:</strong><br><br>🏆 <strong>Principal:</strong>`,
        `🗺️ <strong>Puse el CP</strong> <em>${cp}</em> <strong>en el mapa y esto surgió:</strong><br><br>💎 <strong>Principal:</strong>`,
        `📡 <strong>Señal captada desde el CP</strong> <em>${cp}</em> <strong>con esta info:</strong><br><br>🚀 <strong>Principal:</strong>`,
        `💻 <strong>Consulté la base de datos con el CP</strong> <em>${cp}</em> <strong>y salió esto:</strong><br><br>🧭 <strong>Principal:</strong>`,
        `🎯 <strong>Ajusté la mira en el CP</strong> <em>${cp}</em> <strong>y lo que vi fue esto:</strong><br><br>🌟 <strong>Principal:</strong>`,
        `👨‍💻 <strong>Hackeé la logística del CP</strong> <em>${cp}</em> <strong>y encontré lo siguiente:</strong><br><br>✅ <strong>Principal:</strong>`,
        `📊 <strong>Corrí el análisis para el CP</strong> <em>${cp}</em> <strong>y el reporte es:</strong><br><br>🧭 <strong>Principal:</strong>`
    ];    

    const frasesPrincipal = [
        `<em>${encontrado[0].descripcion}</em>`,
    ];
    
    const frasesAlternativas = [
        `📦 Además te podemos entregar con:<br>`,
        `🛵 También tenés disponible:<br>`,
        `🚚 Otras que llegan también:<br>`,
        `📍 Alternativas para tu zona:<br>`,
        `🔁 También podrías usar:<br>`,
        `✉️ Otras opciones de entrega:<br>`,
        `📬 Te pueden alcanzar con:<br>`,
        `🏍️ También reparten con:<br>`,
        `🚛 Otra que cubre tu CP:<br>`,
        `🧭 Otra opción sería:<br>`,
        `📤 Otra forma de envío sería:<br>`,
        `🧺 También podés optar por:<br>`,
        `🗺️ Alternativas logísticas disponibles:<br>`
    ];
    
    const advertencias = [
        `<br>⚠️ Pero necesitás el visto bueno del gerente 👀`,
        `<br>🧾 Ojo, estas requieren autorización del jefe.`,
        `<br>🔐 Tenés que pedir permiso al gerente para usar estas.`,
        `<br>📢 Antes de usar estas, hablá con tu superior.`,
        `<br>🛑 Necesitás aprobación para esas opciones.`,
        `<br>🚫 Sin el OK del boss, no se puede.`,
        `<br>🙅‍♂️ No te mandes solo, consultalo antes.`,
        `<br>📋 Estas son con firma y sello del jefe.`,
        `<br>🧐 El gerente tiene que dar luz verde.`,
        `<br>🥸 Estas rutas están bajo supervisión del Jefe.`,
        `<br>📎 Necesitás una nota firmada por tu jefe, y por el jefe de tu jefe.`
    ];    

    const mensajeUnica = [
        `✅ Solo esa llega, y está todo joya 💪`,
        `🎯 Es la única opción y va como piña.`,
        `🆗 Esa es la que va, sin vueltas.`,
        `🥂 Llega esa y listo el pollo.`,
        `🚀 Solo esa, pero va rápido y seguro. (Dijo nadie nunca)`,
        `📬 Una sola, pero cumple.`,
        `🛣️ No hay plan B, pero el plan A se la banca.`,
        `🦾 Esa es la única, pero no falla.`,
        `📦 Es esa o nada… y al menos no es nada.`,
        `🎲 Una sola chance… pero buena tirada.`,
        `🌟 No hay más, pero tampoco hace falta.`,
        `💡 No hay variedad, pero sí efectividad.`,
        `🥸 Hay una sola opción... y es la correcta (por ahora).`
    ];    

    let mensaje = frasesIntro[Math.floor(Math.random() * frasesIntro.length)];

    // Crear un div para el mensaje principal
    const divPrincipal = document.createElement('div');
    divPrincipal.style.marginBottom = '8px';
    divPrincipal.style.maxWidth = 'fit-content';
    divPrincipal.style.padding = '10px 16px'; 
    divPrincipal.style.borderRadius = '12px'; 
    divPrincipal.style.background = 'rgba(245, 245, 245, 0.7)';
    divPrincipal.style.border = '1px solid rgba(200, 200, 200, 0.6)'; 
    divPrincipal.style.fontWeight = '600'; 
    divPrincipal.style.fontSize = '16px'; 
    divPrincipal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.08)';
    divPrincipal.style.backdropFilter = 'blur(6px)'; 
    divPrincipal.style.color = '#3B72E9FF'; 
    divPrincipal.style.fontFamily = 'Rubik, sans-serif';
    divPrincipal.innerHTML = frasesPrincipal[Math.floor(Math.random() * frasesPrincipal.length)];

    mensaje += divPrincipal.outerHTML; // Agregar el div al mensaje

    if (encontrado.length > 1) {
        mensaje += frasesAlternativas[Math.floor(Math.random() * frasesAlternativas.length)];
        for (let i = 1; i < encontrado.length; i++) {
            mensaje += `- <em>${encontrado[i].descripcion}</em><br>`;
        }
        mensaje += `<strong style="color: #FBFD76FF;">${advertencias[Math.floor(Math.random() * advertencias.length)]}</strong>`;
    } else {
        mensaje += `<strong style="color: #C8FE64FF;">${mensajeUnica[Math.floor(Math.random() * mensajeUnica.length)]}</strong>`;
    }

    botMessage.innerHTML = mensaje;
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    preguntarAyuda();
}

function sinCoincidencias(cp) {
    const botMessage = document.createElement('div');
    botMessage.className = 'messageBot bot-messageBot';

    const frases = [
        `❌ <strong>Ahí no llega nadie</strong>... ¿quién te conoce?<br><em>(${cp})</em> no figura ni en el GPS.`,
        `📭 Ese CP <em>(${cp})</em> está tan perdido que ni el correo lo busca.`,
        `🗺️ Busqué por cielo, tierra y mar... pero en <em>${cp}</em> no llega nadie.`,
        `🚫 <strong>${cp}</strong>? Nunca lo escuché nombrar, capaz es un mito urbano.`,
        `📉 <em>${cp}</em> no tiene ni delivery, ni Uber... ni logística.`,
        `🌵 <strong>${cp}</strong> parece un terreno baldío digital, no hay rastros de vida logística.`,
        `👻 Mandás algo a <em>${cp}</em> y desaparece como fantasma, no hay data.`,
        `🔍 Revisé dos veces y <em>${cp}</em> no aparece ni con lupa.`,
        `📡 Ni los satélites de Elon Musk ubican <em>${cp}</em>.`,
        `🧭 En <strong>${cp}</strong> ni Google Maps se anima a entrar.`,
        `💤 Nada llega a <em>${cp}</em>, ni los sueños más optimistas.`,
        `🥴 <strong>${cp}</strong> no figura ni en el álbum de figuritas de la logística.`,
        `🤔 ¿${cp}? Eso suena a invento, no a destino real.`,
        `🧙‍♂️ Parece que <em>${cp}</em> fue borrado del mapa por magia negra.`,
        `📦 Mandamos un paquete a <em>${cp}</em> y volvió con síndrome de abandono.`
    ];    

    botMessage.innerHTML = frases[Math.floor(Math.random() * frases.length)];
    chatMessages.appendChild(botMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    preguntarAyuda();
}

function preguntarAyuda() {
    setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'messageBot bot-messageBot';

        const preguntas = [
            `🤔 ¿Querés que revise otro código postal?`,
            `📮 ¿Tenés otro CP para que mire?`,
            `💬 Si querés, mandame otro CP y lo analizo.`,
            `🔍 ¿Te doy una mano con otro código postal?`,
            `🚀 ¡Listo! Si querés, tirame otro CP y te ayudo.`
        ];

        botMessage.innerHTML = preguntas[Math.floor(Math.random() * preguntas.length)];
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
}

function closeChat() {
    chatt.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
        chatt.style.display = 'none'; // Ocultar después de la animación

        // Elegir imagen aleatoria para el bot
        const imagenes = [
            './bot/bot1-close-chat.gif',
            './bot/bot12-maracas.gif',
            './bot/bot14-clown.gif',
            './bot/bot11-hello.gif',
            './bot/bot9-hipnosis.gif'
        ];
        const imagenAlAzar = imagenes[Math.floor(Math.random() * imagenes.length)];
        bot.querySelector('img').src = imagenAlAzar; // Usar imagen aleatoria

        // Cambiar el fondo del círculo con animación
        bot.style.transition = 'background 0.3s ease'; // Añadir transición
        bot.style.background = 'radial-gradient(closest-side, white, beige, #F5DEB3)'; // Restaurar color
        bot.classList.remove('active');
    }, 300); // Tiempo de la animación
}


function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(closeChat, 20000); // Cerrar chat tras 20 segundos de inactividad
}
