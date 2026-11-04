import express from 'express';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'node:url';

const app = express();
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mydb',
  waitForConnections: true, connectionLimit: 5
});
app.use(express.json({ limit: '4kb' }));
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body || {};
  if (typeof correo !== 'string' || typeof contrasena !== 'string' || !correo.trim() || !contrasena || correo.length > 100 || contrasena.length > 128) {
    return res.status(400).json({ mensaje: 'Escribe tu correo y contraseña.' });
  }
  try {
    const [filas] = await pool.execute(
      `SELECT u.id_usuario, u.nombre, u.correo, u.password_hash, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.correo = ? AND u.activo = 1 LIMIT 1`, [correo.trim()]);
    const cuenta = filas[0];
    // El campo conserva su nombre original, pero contiene la contraseña en texto.
    const valida = cuenta && cuenta.password_hash === contrasena;
    const rol = cuenta?.rol.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (!valida || !['duena', 'empleado'].includes(rol)) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos, o cuenta dada de baja.' });
    }
    res.set('Cache-Control', 'no-store');
    return res.json({ id: cuenta.id_usuario, usuario: cuenta.nombre, correo: cuenta.correo, rol });
  } catch (error) {
    console.error('Error de acceso MySQL:', error.code || error.message);
    return res.status(503).json({ mensaje: 'No se pudo consultar MySQL. Revisa la conexión y ejecuta InicioSesion.sql.' });
  }
});
app.get('/', (_req, res) => res.redirect('/inicio%20de%20sesion/index.html'));
app.use(express.static(fileURLToPath(new URL('../../frontend/', import.meta.url))));
app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({ mensaje: 'Solicitud inválida.' });
});
try {
  await pool.query('SELECT 1');
  app.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(`Imperio: http://localhost:${process.env.PORT || 3000}`));
} catch (error) {
  console.error('No se pudo conectar a MySQL. Revisa .env y el servicio MySQL:', error.code || error.message);
  await pool.end();
  process.exitCode = 1;
}
