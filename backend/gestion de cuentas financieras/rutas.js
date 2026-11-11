import {Router} from 'express';
import pool from '../Conexion BaseDatos/conexion.js';
import {exigirDuena} from '../inicio de sesion/sesiones.js';
import {validar,clave,insertar,transaccion,fallo,cuentas} from './servicio.js';
const rutas=Router();rutas.use(exigirDuena);rutas.use((_q,r,n)=>{r.set('Cache-Control','no-store');n();});
rutas.get('/',async(req,res,next)=>{try{
 const resultado=await transaccion(pool,async db=>{
 const [saldos]=await db.query("SELECT cuenta,SUM(IF(tipo='ingreso',monto,-monto)) AS saldo FROM movimientos_financieros GROUP BY cuenta");
 const condiciones=[],args=[];
 if(req.query.cuenta){if(!cuentas.includes(req.query.cuenta))throw fallo('Cuenta inválida.');condiciones.push('m.cuenta=?');args.push(req.query.cuenta);}
 for(const [campo,op] of [['desde','>='],['hasta','<=']])if(req.query[campo]){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(req.query[campo]))throw fallo('Filtro de fecha inválido.');
 condiciones.push(`DATE(m.fecha_movimiento)${op}?`);args.push(req.query[campo]);}
 const [movimientos]=await db.execute(`SELECT m.*,DATE_FORMAT(m.fecha_movimiento,'%Y-%m-%d') AS fecha,u.nombre AS usuario FROM movimientos_financieros m JOIN usuarios u ON u.id_usuario=m.id_usuario ${condiciones.length?'WHERE '+condiciones.join(' AND '):''} ORDER BY m.fecha_movimiento DESC,m.id_movimiento_financiero DESC LIMIT 200`,args);
 const [cortes]=await db.query(`SELECT c.id_corte,DATE_FORMAT(c.fecha_corte,'%Y-%m-%d %H:%i') AS fecha,u.nombre AS usuario,c.ventas_efectivo,c.ventas_tarjeta,
 EXISTS(SELECT 1 FROM movimientos_financieros f WHERE f.referencia=CONCAT('corte:',c.id_corte,':efectivo')) AS efectivo_registrado,
 EXISTS(SELECT 1 FROM movimientos_financieros f WHERE f.referencia=CONCAT('corte:',c.id_corte,':tarjeta')) AS tarjeta_registrada
 FROM cortes_caja c JOIN usuarios u ON u.id_usuario=c.id_usuario
 WHERE (c.ventas_efectivo>0 AND NOT EXISTS(SELECT 1 FROM movimientos_financieros f WHERE f.referencia=CONCAT('corte:',c.id_corte,':efectivo')))
 OR (c.ventas_tarjeta>0 AND NOT EXISTS(SELECT 1 FROM movimientos_financieros f WHERE f.referencia=CONCAT('corte:',c.id_corte,':tarjeta')))
 ORDER BY c.id_corte DESC LIMIT 200`);
 return {saldos,movimientos,cortes};});res.json(resultado);
 }catch(e){next(e);}});
rutas.post('/',async(req,res,next)=>{try{const d=validar(req.body||{});const id=await transaccion(pool,db=>insertar(db,d,req.idUsuario,'manual:'+clave(d.clave)));res.status(201).json({id,mensaje:'Registro guardado.'});}catch(e){next(e);}});
rutas.post('/transferencias',async(req,res,next)=>{try{
 const d=validar({...req.body,cuenta:req.body?.origen,tipo:'egreso'});if(!cuentas.includes(d.destino)||d.destino===d.origen)throw fallo('Selecciona dos cuentas diferentes.');
 const k=clave(d.clave);await transaccion(pool,async db=>{await insertar(db,d,req.idUsuario,'transferencia:'+k+':salida');await insertar(db,{...d,cuenta:d.destino,tipo:'ingreso'},req.idUsuario,'transferencia:'+k+':entrada');});res.status(201).json({mensaje:'Transferencia guardada.'});
 }catch(e){next(e);}});
rutas.post('/cortes',async(req,res,next)=>{try{
 const {id_corte,medio,fecha}=req.body||{};if(!/^[1-9]\d{0,9}$/.test(String(id_corte))||!['efectivo','tarjeta'].includes(medio))throw fallo('Corte o medio inválido.');
 await transaccion(pool,async db=>{
 const [filas]=await db.execute('SELECT * FROM cortes_caja WHERE id_corte=? FOR UPDATE',[id_corte]);if(!filas[0])throw fallo('Corte inexistente.',404);
 const d=validar({cuenta:medio==='efectivo'?'caja_fija':'banco_principal',tipo:'ingreso',monto:filas[0]['ventas_'+medio],concepto:`Ventas ${medio} del corte #${id_corte}`,fecha});
 await insertar(db,d,req.idUsuario,`corte:${id_corte}:${medio}`);
 });res.status(201).json({mensaje:'Ventas del corte incorporadas. No se agregó el fondo inicial ni el efectivo contado.'});
 }catch(e){next(e);}});
rutas.use((e,_req,res,_next)=>{console.error('Finanzas:',e.code||e.message);res.status(e.code==='ER_DUP_ENTRY'?409:e.status||500).json({mensaje:e.code==='ER_DUP_ENTRY'?'Esta operación ya fue registrada. Actualiza el historial; no la repitas.':e.status?e.message:'No se pudo confirmar la operación. Revisa el historial y ejecuta ActualizarFinanzas.sql si falta la tabla o la columna referencia.'});});
export default rutas;
