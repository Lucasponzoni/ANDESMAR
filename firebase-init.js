// firebase-init.js
const firebaseConfigCDS = {
    apiKey: "AIzaSyBPw7ElqCPC92nag2oFW57aLD9t018FvC4",
    authDomain: "emails-novogar.firebaseapp.com",
    databaseURL: "https://emails-novogar-default-rtdb.firebaseio.com",
    projectId: "emails-novogar",
    storageBucket: "emails-novogar.appspot.com",
    messagingSenderId: "1085815449583",
    appId: "1:1085815449583:web:72f836c378bd971fb8b81a",
    measurementId: "G-BW9ML8LVV6"
};

// Inicializar Firebase
const appCDS = firebase.initializeApp(firebaseConfigCDS, "appCDS");
const dbCDS = appCDS.database(); // Aquí creamos la conexión a la base de datos

// Exportar la base de datos para usarla en otros archivos
window.dbCDS = dbCDS; // Esto hace que dbCDS esté disponible globalmente
