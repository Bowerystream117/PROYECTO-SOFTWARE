import { centavos, decimal } from '../corte de caja/servicio.js';
export const cuentas=['caja_fija','banco_principal','fondo_proveedores'];
export const fallo=(mensaje,status=400)=>Object.assign(new Error(mensaje),{status});
export function validar(d){
 if(!cuentas.includes(d.cuenta)||!['ingreso','egreso'].includes(d.tipo))throw fallo('Cuenta o tipo inválido.');
 const monto=centavos(d.monto);if(monto<=0)throw fallo('El monto debe ser mayor que cero.');
 if(typeof d.concepto!=='string'||!d.concepto.trim()||d.concepto.trim().length>150)throw fallo('Escribe un concepto de hasta 150 caracteres.');
 if(typeof d.fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)||isNaN(Date.parse(d.fecha))||new Date(d.fecha).toISOString().slice(0,10)!==d.fecha||d.fecha<'1000-01-01'||d.fecha>new Date().toLocaleDateString('en-CA',{timeZone:'America/Mexico_City'}))throw fallo('Fecha inválida o futura.');
 return {...d,monto:decimal(monto),concepto:d.concepto.trim()};
}
export function clave(valor){if(typeof valor!=='string'||! /^[0-9a-f-]{36}$/i.test(valor))throw fallo('Identificador de operación inválido.');return valor;}
export async function insertar(db,d,usuario,referencia){
 const [r]=await db.execute('INSERT INTO movimientos_financieros (cuenta,tipo,monto,concepto,fecha_movimiento,id_usuario,referencia) VALUES (?,?,?,?,?,?,?)',[d.cuenta,d.tipo,d.monto,d.concepto,d.fecha+' 00:00:00',usuario,referencia]);return r.insertId;
}
export async function transaccion(pool,fn){const db=await pool.getConnection();try{await db.beginTransaction();const r=await fn(db);await db.commit();return r;}catch(e){await db.rollback();throw e;}finally{db.release();}}
