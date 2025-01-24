endpoint: https://api-ventaenlinea.cruzdelsur.com/api/NuevaCotXVolEntregaYDespacho?idcliente=87231e4b-b414-47c0-882b-ef98adb94fe4&ulogin=necommerce&uclave=novogar71!&volumen=13500&peso=8&codigopostal=8400&localidad=Bariloche&valor=500&contrareembolso=&items=&despacharDesdeDestinoSiTieneAlmacenamiento=&queentrega=E&quevia=T&documento=33333333&nombre=Jose Perez&telefono=5555-5555&email=nada@nada.com&domicilio=San Martin 1522&bultos=2&referencia=9001-00012341&textosEtiquetasBultos&textoEtiquetaDocumentacion&devolverDatosParaEtiquetas=N

idcliente 87231e4b-b414-47c0-882b-ef98adb94fe4
ulogin necommerce
uclave novogar71!

volumen <span id="volumenTotalcm">0.00</span>
peso document.getElementById("peso").value;
codigopostal document.getElementById("calleDestinatario").value;
localidad document.getElementById('localidad').value,
valor document.getElementById("valorDeclarado").value;
contrareembolso ""
items ""
despacharDesdeDestinoSiTieneAlmacenamiento ""
queentrega "E" Tipo de entrega a cotizar .'E' para entrega a domicilio y 'R'
quevia "T"
documento "68543701"
nombre document.getElementById("codigoPostalDestinatario").value;
telefono document.getElementById("telefonoDestinatario").value;
email document.getElementById('emailDestinatario').value,
domicilio document.getElementById('calleDestinatario').value, + document.getElementById('calleNroDestinatario').value,
bultos     bultoElements.forEach(bulto => {
            const cantidadBULTO = parseInt(bulto.querySelector(`input[name^="Cantidad"]`).value) || 1; // Obtener cantidad
referencia document.getElementById("nroRemito").value;
textosEtiquetasBultos ""
devolverDatosParaEtiquetas N

Response: 
{"Respuesta":[{"Estado":0,"Descripcion":"","NumeroCotizacion":17552621,"NIC":"166543607","UrlSeguimiento":"https://www.cruzdelsur.com/herramientas_seguimiento_resultado.php?nic=166543607"}],"Cotizaciones":[{"CodigoLinea":"17552621-1-2-T","Valor":16120.13,"ValorTxt":"$ 16120,13","HorasDesde":48,"HorasHasta":120,"HorasDesdeTxt":"48 Hs.","HorasHastaTxt":"120 Hs.","HorasDesdeHastaTxt":"48 / 120 Hs.","Descripcion":"Entrega en domicilio","TipoDeEntrega":"E","Via":"T","DescripcionLarga":"","DescripcionParaWeb":"","ValorAdicionalRetiro":0.0,"ValorAdicionalRetiroTxt":"$ 0,00","ValorAdicionalReceptoria":0.0,"ValorAdicionalReceptoriaTxt":"$ 0,00","PorcentajeDeIva":21.0,"PorcentajeDeIvaTxt":"21,00 %","ValoresIncluyenIva":"NO"}],"Sucursal":[{"IdSucursal":408,"Nombre":"Bariloche","Ciudad":"Bariloche","Provincia":"Río Negro","Domicilio":"Vereertbrügghen 2030 (ex 1730)","CP":"8403","Telefono":"(0294) 442 2490 / 1771","Email":"info-bariloche@cruzdelsur.com","Horario":"L/V 8:00 a 18:00hs. - S 9:00 a 13:00 hs.","Longitud":-71.281,"Latitud":-41.129}]}

Si se duplica remito:
{"Respuesta":[{"Estado":25,"Descripcion":"Ya existe un despacho con el mismo numero de referencia.","NumeroCotizacion":17552092,"NIC":"166539907","UrlSeguimiento":""}]}


Para boton de etiqueta:

endpoint: https://api-ventaenlinea.cruzdelsur.com/api/EtiquetasPDF?idcliente=87231e4b-b414-47c0-882b-ef98adb94fe4&ulogin=necommerce&uclave=novogar71!&id=17549793&tamanioHoja=1&posicionArrancar=1&textoEspecialPorEtiqueta=