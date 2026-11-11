"use strict";
(()=>{
 const sesion=sesionImperio.leer();if(sesion?.rol!=='duena')return;
 const el=id=>document.getElementById(id),cuentas={caja_fija:'Caja fija',banco_principal:'Banco principal',fondo_proveedores:'Fondo para proveedores'};
 const dinero=v=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(v));
 const hoy=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'});
 let transferencia=false,clave='',ocupado=false,cortes=[],solicitud=0;
 for(const id of ['cuenta','destino','fCuenta'])for(const [v,n] of Object.entries(cuentas))el(id).add(new Option(n,v));
 for(const id of ['fecha','fechaCorte']){el(id).value=hoy();el(id).max=hoy();}
 function aviso(t,error=false){el('mensajeEstado').textContent=t;el('mensajeEstado').classList.toggle('error',error);}
 async function api(ruta='',datos){
 const r=await fetch('/api/finanzas'+ruta,{method:datos?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(sesionImperio.leer()?.token||'')},...(datos?{body:JSON.stringify(datos)}:{})});
 if(!r.headers.get('content-type')?.includes('application/json'))throw Error('Abre Imperio desde http://localhost:3000.');
 const d=await r.json();if(!r.ok)throw Error(d.mensaje||'No se pudo completar la operación.');return d;
 }
 function detalle(){const c=cortes.find(c=>String(c.id_corte)===el('corte').value),tarjeta=el('medio').value==='tarjeta';const registrado=c&&(tarjeta?c.tarjeta_registrada:c.efectivo_registrado);const monto=c?Number(tarjeta?c.ventas_tarjeta:c.ventas_efectivo):0;
 el('detalleCorte').textContent=c?`Corte #${c.id_corte}: ${dinero(monto)}${registrado?' — ya incorporado':''}.`:'No hay cortes pendientes de incorporar.';
 el('incorporar').disabled=ocupado||!c||!!registrado||monto<=0;}
 async function actualizar(){
 const numero=++solicitud;const q=new URLSearchParams();for(const [k,id] of [['cuenta','fCuenta'],['desde','desde'],['hasta','hasta']])if(el(id).value)q.set(k,el(id).value);
 if(el('desde').value&&el('hasta').value&&el('desde').value>el('hasta').value)throw Error('Desde no puede ser posterior a Hasta.');
 const d=await api('?'+q);if(numero!==solicitud)return;
 let total=0;for(const [cuenta,id] of Object.entries({caja_fija:'caja',banco_principal:'banco',fondo_proveedores:'proveedores'})){const valor=Number(d.saldos.find(s=>s.cuenta===cuenta)?.saldo||0);el(id).textContent=dinero(valor);total+=Math.round(valor*100);}el('balance').textContent=dinero(total/100);
 el('historial').replaceChildren();for(const m of d.movimientos){const tr=document.createElement('tr');for(const v of [m.fecha,m.concepto,m.tipo,(m.tipo==='egreso'?'− ':'+ ')+dinero(m.monto),cuentas[m.cuenta],m.usuario,'#'+m.id_movimiento_financiero+' · '+(m.referencia||'Registro previo')]){const td=document.createElement('td');td.textContent=v;tr.append(td);}el('historial').append(tr);}
 if(!d.movimientos.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='No hay registros para estos filtros.';tr.append(td);el('historial').append(tr);}
 const anterior=el('corte').value;cortes=d.cortes;el('corte').replaceChildren();for(const c of cortes)el('corte').add(new Option(`#${c.id_corte} · ${c.fecha} · ${c.usuario}`,c.id_corte));if(cortes.some(c=>String(c.id_corte)===anterior))el('corte').value=anterior;detalle();
 }
 function abrir(esTransferencia){transferencia=esTransferencia;clave=crypto.randomUUID();el('formulario').reset();el('fecha').value=hoy();el('grupoDestino').hidden=!transferencia;el('grupoTipo').hidden=transferencia;el('titulo').textContent=transferencia?'Transferir entre cuentas':'Nuevo registro';el('errorDialogo').textContent='';el('dialogo').showModal();}
 el('nuevo').onclick=()=>abrir(false);el('transferir').onclick=()=>abrir(true);el('cancelar').onclick=()=>{if(!ocupado)el('dialogo').close();};
 el('dialogo').addEventListener('cancel',e=>{if(ocupado)e.preventDefault();});
 el('formulario').onsubmit=async e=>{e.preventDefault();if(ocupado)return;const datos={clave,cuenta:el('cuenta').value,origen:el('cuenta').value,destino:el('destino').value,tipo:el('tipo').value,monto:el('monto').value,concepto:el('concepto').value,fecha:el('fecha').value};
 ocupado=true;el('guardar').disabled=true;el('cancelar').disabled=true;try{const r=await api(transferencia?'/transferencias':'',datos);el('dialogo').close();aviso(r.mensaje);try{await actualizar();}catch{aviso('Guardado. No se pudo actualizar la pantalla; pulsa Filtrar / actualizar.',true);}}catch(e){el('errorDialogo').textContent=e.message+' Revisa el historial antes de reintentar.';}finally{ocupado=false;el('guardar').disabled=false;el('cancelar').disabled=false;detalle();}};
 el('formCorte').onsubmit=async e=>{e.preventDefault();if(ocupado)return;ocupado=true;detalle();try{const r=await api('/cortes',{id_corte:el('corte').value,medio:el('medio').value,fecha:el('fechaCorte').value});el('confirmacionCorte').checked=false;aviso(r.mensaje);try{await actualizar();}catch{aviso('Ingreso guardado. Actualiza el historial.',true);}}catch(e){aviso(e.message,true);}finally{ocupado=false;detalle();}};
 el('corte').onchange=el('medio').onchange=()=>{el('confirmacionCorte').checked=false;detalle();};
 el('filtros').onsubmit=e=>{e.preventDefault();actualizar().catch(e=>aviso(e.message,true));};actualizar().catch(e=>aviso(e.message,true));
})();
