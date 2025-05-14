const firebaseConfigMeli = {
    apiKey: "AIzaSyCMu2vPvNzhv0cM3b4RItmqZybRhhR_HJM",
    authDomain: "despachos-meli-novogar.firebaseapp.com",
    databaseURL: "https://despachos-meli-novogar-default-rtdb.firebaseio.com",
    projectId: "despachos-meli-novogar",
    storageBucket: "despachos-meli-novogar.appspot.com",
    messagingSenderId: "774252628334",
    appId: "1:774252628334:web:623aa84bc3b1cebd3f997f",
    measurementId: "G-E0E9K4TEDW"
};

let appMeli;
try {
    appMeli = firebase.app("appMeli");
} catch (error) {
    appMeli = firebase.initializeApp(firebaseConfigMeli, "appMeli");
}

// Inicializa los servicios después de asegurar que Firebase está cargado
const dbMeli = appMeli.database();
const storageMeli = firebase.storage(appMeli);

// Exporta para uso global
window.dbMeli = dbMeli;
window.storageMeli = storageMeli;
