import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derivar = promisify(scrypt);
const formato = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/;
export const esHash = valor => typeof valor === "string" && formato.test(valor);
export async function proteger(clave) {
  const sal = randomBytes(16).toString("hex");
  const hash = await derivar(clave, sal, 64);
  return "scrypt:" + sal + ":" + hash.toString("hex");
}

export async function comprobar(clave, almacenada) {
  const partes = formato.exec(almacenada);
  if (!partes) return false;
  return timingSafeEqual(await derivar(clave, partes[1], 64), Buffer.from(partes[2], "hex"));
}
