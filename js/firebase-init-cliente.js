// firebase-init-cliente.js
const firebaseConfigClientes = {
    apiKey: "AIzaSyAV2D4tiOfdVGqzmewM5mQ4GjGFJoAb2Pk",
    authDomain: "clientes-novogar.firebaseapp.com",
    databaseURL: "https://clientes-novogar-default-rtdb.firebaseio.com",
    projectId: "clientes-novogar",
    storageBucket: "clientes-novogar.firebasestorage.app",
    messagingSenderId: "289083678694",
    appId: "1:289083678694:web:726e641d4cb748ad900027",
    measurementId: "G-04V91E4Q9K"
};

const appClientes = firebase.initializeApp(firebaseConfigClientes, "appClientes");
const dbClientes = appClientes.database();

window.dbClientes = dbClientes;
