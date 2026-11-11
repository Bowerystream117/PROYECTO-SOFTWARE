"use strict";
(()=>{
 const sesion=sesionImperio.leer();if(!sesion)return;
 const el=id=>document.getElementById(id),form=el('formularioCorte'),dialogo=el('confirmacion');
 const dinero=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
 let pendiente=null,ocupado=false;
 el('responsable').textContent='Responsable del corte: '+sesion.usuario;
 el('alcanceHistorial').textContent=sesion.rol==='duena'?'Últimos 100 cortes de todos los usuarios.':'Últimos 100 cortes realizados por ti.';
 function mensaje(texto,error=false){el('mensajeEstado').textContent=texto;el('mensajeEstado').classList.toggle('error',error);}
 function calcular(){
  const datos=Object.fromEntries(new FormData(form));
  const campos=['monto_inicial','ventas_efectivo','ventas_tarjeta','monto_final_real'];
  if(!campos.every(k=>/^\d{1,8}(\.\d{1,2})?$/.test(datos[k] || ''))){
   ['ventas','esperado','diferencia'].forEach(id=>el(id).textContent='—');el('interpretacion').textContent='Completa los cuatro importes.';return null;
  }
  const centavos=v=>{const [a,b='']=v.split('.');return Number(a)*100+Number(b.padEnd(2,'0'));};
  const [inicial,efectivo,tarjeta,real]=campos.map(k=>centavos(datos[k]));
  const esperado=inicial+efectivo,diferencia=real-esperado;
  el('ventas').textContent=dinero((efectivo+tarjeta)/100);
  el('esperado').textContent=dinero(esperado/100);el('diferencia').textContent=dinero(diferencia/100);
  el('interpretacion').textContent=diferencia===0?'Caja cuadrada':diferencia<0?'Faltante de efectivo':'Sobrante de efectivo';
  return datos;
 }
 async function historial(){
  const cortes=await servicioCaja.solicitar();const cuerpo=el('cuerpoCortes');cuerpo.replaceChildren();
  cortes.forEach(c=>{
   const fila=document.createElement('tr');
   [c.fecha_corte,c.usuario,...['monto_inicial','ventas_efectivo','ventas_tarjeta','monto_final_real','diferencia'].map(k=>dinero(Number(c[k]))),c.observaciones || '—'].forEach(v=>{
    const td=document.createElement('td');td.textContent=v;fila.append(td);
   });cuerpo.append(fila);
  });
  if(!cortes.length){const fila=document.createElement('tr'),td=document.createElement('td');td.colSpan=8;td.textContent='Todavía no hay cortes registrados.';fila.append(td);cuerpo.append(fila);}
 }
 form.addEventListener('input',calcular);
 form.addEventListener('submit',e=>{
  e.preventDefault();if(ocupado || !form.reportValidity())return;
  pendiente=calcular();if(!pendiente){mensaje('Revisa los importes: usa hasta dos decimales.',true);return;}
  el('detalleConfirmacion').textContent='Efectivo esperado: '+el('esperado').textContent+'. Diferencia: '+el('diferencia').textContent+' ('+el('interpretacion').textContent+').';dialogo.showModal();
 });
 el('cancelar').addEventListener('click',()=>dialogo.close());
 el('confirmar').addEventListener('click',async()=>{
  if(ocupado || !pendiente)return;
  ocupado=true;el('guardar').disabled=true;el('confirmar').disabled=true;el('cancelar').disabled=true;
  try{
   const resultado=await servicioCaja.solicitar(pendiente);
   form.reset();calcular();pendiente=null;dialogo.close();
   mensaje('Corte #'+resultado.id_corte+' guardado. Diferencia: '+dinero(Number(resultado.diferencia))+'.');
   try{await historial();}catch{mensaje('El corte se guardó, pero no se pudo actualizar el historial. Pulsa Actualizar historial.',true);}
  }catch(error){dialogo.close();mensaje(error.message+' Si se perdió la conexión, revisa el historial antes de reintentar.',true);}
  finally{ocupado=false;el('guardar').disabled=false;el('confirmar').disabled=false;el('cancelar').disabled=false;}
 });
 dialogo.addEventListener('cancel',e=>{if(ocupado)e.preventDefault();});
 el('actualizar').addEventListener('click',async()=>{
  el('actualizar').disabled=true;try{await historial();mensaje('Historial actualizado.');}catch(e){mensaje(e.message,true);}finally{el('actualizar').disabled=false;}
 });
 calcular();historial().catch(e=>mensaje(e.message,true));
})();
