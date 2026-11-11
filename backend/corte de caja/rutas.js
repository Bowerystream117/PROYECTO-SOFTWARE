import { Router } from "express";
import conexion from "../Conexion BaseDatos/conexion.js";
import { exigirSesion } from "../inicio de sesion/sesiones.js";
import { calcularCorte } from "./servicio.js";
const rutas=Router();
rutas.use(exigirSesion);
rutas.use((_req,res,next)=>{res.set("Cache-Control","no-store");next();});
rutas.get("/cortes",async(req,res,next)=>{
  try {
    const [filas]=await conexion.execute(`SELECT c.id_corte,c.id_usuario,u.nombre AS usuario,
      c.monto_inicial,c.ventas_efectivo,c.ventas_tarjeta,c.monto_final_real,c.diferencia,
      DATE_FORMAT(c.fecha_corte,'%Y-%m-%d %H:%i:%s') AS fecha_corte,c.observaciones
      FROM cortes_caja c JOIN usuarios u ON u.id_usuario=c.id_usuario
      ${req.rol==='duena' ? '' : 'WHERE c.id_usuario=?'} ORDER BY c.id_corte DESC LIMIT 100`,
      req.rol==='duena' ? [] : [req.idUsuario]);
    res.json(filas);
  } catch(error){next(error);}
});
rutas.post("/cortes",async(req,res,next)=>{
  try {
    const corte=calcularCorte(req.body || {});
    // El usuario y la fecha siempre proceden del servidor.
    const [resultado]=await conexion.execute(`INSERT INTO cortes_caja
      (id_usuario,monto_inicial,ventas_efectivo,ventas_tarjeta,monto_final_real,diferencia,observaciones)
      VALUES (?,?,?,?,?,?,?)`,[req.idUsuario,corte.monto_inicial,corte.ventas_efectivo,corte.ventas_tarjeta,
      corte.monto_final_real,corte.diferencia,corte.observaciones]);
    res.status(201).json({id_corte:resultado.insertId,...corte,mensaje:"Corte guardado correctamente."});
  } catch(error){next(error);}
});
rutas.use((error,_req,res,_next)=>{
  console.error("Caja:",error.code || error.message);
  res.status(error.status || 500).json({mensaje:error.status ? error.message :
    "No se pudo confirmar el corte. Consulta el historial antes de volver a guardarlo."});
});
export default rutas;
