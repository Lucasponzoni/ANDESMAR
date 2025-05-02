const firebaseConfigLogisticasNovo = {
    apiKey: "AIzaSyBMFvhw6_7Ik9JBdEkUaTsRaKxqZyhTxIM",
    authDomain: "logisticas-novogar.firebaseapp.com",
    databaseURL: "https://logisticas-novogar-default-rtdb.firebaseio.com",
    projectId: "logisticas-novogar",
    storageBucket: "logisticas-novogar.firebasestorage.app",
    messagingSenderId: "586666149655",
    appId: "1:586666149655:web:e0501d1e6c6e0f6c451952",
    measurementId: "G-B2BCF934YJ"
};

const appLogisticasNovo = firebase.initializeApp(firebaseConfigLogisticasNovo, "logisticasNovo");
const dbLogisticasNovo = appLogisticasNovo.database();

window.dbLogisticasNovo = dbLogisticasNovo;
