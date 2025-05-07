const firebaseConfigTipeo = {
    apiKey: "AIzaSyDjssphJi5ckC20OsEZ89banOWMfWs6Nfc",
    authDomain: "despachos-logistica-web.firebaseapp.com",
    databaseURL: "https://despachos-logistica-web-default-rtdb.firebaseio.com",
    projectId: "despachos-logistica-web",
    storageBucket: "despachos-logistica-web.firebasestorage.app",
    messagingSenderId: "791774587796",
    appId: "1:791774587796:web:c267f4f4a8a7ee41f73d81",
    measurementId: "G-7XZ2SYW1GS"
};

let appTipeo;
try {
    appTipeo = firebase.app("appTipeo"); // Intenta obtener la app existente
} catch (error) {
    appTipeo = firebase.initializeApp(firebaseConfigTipeo, "appTipeo"); // Si no existe, inicializa
}

const dbTipeo = appTipeo.database();
window.dbTipeo = dbTipeo;
