// firebase-init-Vtex.js
const firebaseConfigVtex = {
    apiKey: "AIzaSyBnGR03Dop_b2vCQomgNduuzbzI37Xr3vA",
    authDomain: "vtex-tiendas.firebaseapp.com",
    databaseURL: "https://vtex-tiendas-default-rtdb.firebaseio.com",
    projectId: "vtex-tiendas",
    storageBucket: "vtex-tiendas.firebasestorage.app",
    messagingSenderId: "693847861268",
    appId: "1:693847861268:web:af12bac8587b3f90769f01",
    measurementId: "G-RMF0YVCCEK"
};

const appVtex = firebase.initializeApp(firebaseConfigVtex, "appVtex");
const dbVtex = appVtex.database();

window.dbVtex = dbVtex;
