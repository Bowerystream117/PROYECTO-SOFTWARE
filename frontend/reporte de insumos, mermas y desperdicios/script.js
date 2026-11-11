"use strict";
(() => {
  const {elemento,tabla,csv,ejecutar,dinero,avisar}=uiImperio;
  try{operacionesImperio.autorizar(true);}catch{return;}
  const encabezados=["Fecha","Tipo","Producto","Cantidad","Usuario","Observación"];
  let filas=[];
  async function actualizar(){
    const desde=elemento("desde").value,hasta=elemento("hasta").value,tipo=elemento("reporte").value;
    if(desde&&hasta&&desde>hasta)throw new Error("La fecha inicial no puede ser posterior a la final.");
    const {movimientos,ventas}=await operacionesImperio.reporte(desde,hasta);
    const clase=item=>item.tipo;
    // Las tarjetas resumen todo el período; el selector filtra el detalle de la tabla.
    elemento("entradas").textContent=movimientos.filter(item=>clase(item)==="entrada").length;
    elemento("salidas").textContent=movimientos.filter(item=>clase(item)==="salida").length;
    elemento("mermas").textContent=movimientos.filter(item=>clase(item)==="merma").length;
    elemento("ventas").textContent=dinero(Number(ventas));
    filas=movimientos.filter(item=>tipo==="todos"||clase(item)===tipo).sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.hora.localeCompare(a.hora)).map(item=>[uiImperio.fechaCorta(item.fecha),{entrada:"Entrada",salida:"Salida",merma:"Merma"}[clase(item)],item.producto,`${item.cantidad} ${item.unidad}`,item.usuario,item.descripcion||item.tipoBaja||item.observaciones||item.detalle]);
    tabla(encabezados,filas);avisar("");
  }
  elemento("filtros").onsubmit=evento=>{evento.preventDefault();ejecutar(actualizar);};
  elemento("exportar").onclick=()=>ejecutar(async()=>{await actualizar();csv(encabezados,filas);});
  elemento("imprimir").onclick=()=>ejecutar(async()=>{await actualizar();window.print();});
  ejecutar(actualizar);
})();
