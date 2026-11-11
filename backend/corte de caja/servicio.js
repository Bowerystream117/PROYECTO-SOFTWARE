// Cálculos en centavos. Nunca confiar en los totales enviados por el navegador.
const fallo = mensaje => Object.assign(new Error(mensaje), {status:400});
export function centavos(valor) {
  if (!["string", "number"].includes(typeof valor) || !/^\d{1,8}(\.\d{1,2})?$/.test(String(valor)))
    throw fallo("Los importes deben ser positivos o cero, con hasta dos decimales y ocho enteros.");
  const [entero, fraccion=""] = String(valor).split(".");
  return Number(entero)*100 + Number(fraccion.padEnd(2,"0"));
}
export const decimal = n => (n/100).toFixed(2);
export function calcularCorte(datos) {
  const inicial=centavos(datos.monto_inicial), efectivo=centavos(datos.ventas_efectivo),
    tarjeta=centavos(datos.ventas_tarjeta), real=centavos(datos.monto_final_real);
  const esperado=inicial+efectivo, diferencia=real-esperado;
  if (Math.abs(diferencia)>9999999999) throw fallo("La diferencia excede el límite de la base de datos.");
  const observaciones=datos.observaciones ?? "";
  if (typeof observaciones!=="string" || observaciones.length>1000) throw fallo("Las observaciones admiten hasta 1000 caracteres.");
  return {monto_inicial:decimal(inicial),ventas_efectivo:decimal(efectivo),ventas_tarjeta:decimal(tarjeta),
    monto_final_real:decimal(real),diferencia:decimal(diferencia),
    efectivo_esperado:decimal(esperado),ventas_totales:decimal(efectivo+tarjeta),observaciones:observaciones.trim()};
}
