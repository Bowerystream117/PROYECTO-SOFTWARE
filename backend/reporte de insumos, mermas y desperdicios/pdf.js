import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";

const logo = fileURLToPath(new URL("../../frontend/compartido/logo-imperio-gris.png", import.meta.url));
const titulos = {
  todos: "Movimientos generales", entrada: "Entradas de insumos",
  salida: "Salidas de insumos", merma: "Mermas y desperdicios"
};
const tipos = { entrada: "Entrada", salida: "Salida", merma: "Merma" };
const encabezados = ["Fecha", "Tipo", "Producto", "Cantidad", "Unidad", "Usuario", "Observación"];
const anchos = [56, 43, 94, 49, 41, 67, 173];
const fecha = valor => valor.split("-").reverse().join("/");

export function crearPdf(tipo, desde, hasta, datos) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 36, bufferPages: true,
      info: { Title: "Imperio · " + titulos[tipo], Author: "Imperio" } });
    const partes = [];
    doc.on("data", parte => partes.push(parte));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(partes)));
    const ancho = anchos.reduce((suma, valor) => suma + valor, 0);
    let y;

    function nuevaHoja(primera = false) {
      if (!primera) doc.addPage();
      doc.save().opacity(.18);
      doc.translate(doc.page.width / 2, doc.page.height / 2).rotate(-18);
      doc.image(logo, -205, -52, { width: 410 });
      doc.restore();
      doc.image(logo, 36, 30, { width: 150 });
      doc.font("Helvetica-Bold").fontSize(17).fillColor("#222222");
      doc.text(titulos[tipo], 36, 85, { width: ancho });
      const periodo = [desde && "Desde " + fecha(desde), hasta && "hasta " + fecha(hasta)]
        .filter(Boolean).join(" ") || "Todo el período registrado";
      doc.font("Helvetica").fontSize(9).fillColor("#666666");
      doc.text(periodo + " · " + datos.total + " registros", 36, 110, { width: ancho });
      doc.moveTo(36, 132).lineTo(36 + ancho, 132).strokeColor("#888888").stroke();
      y = 145;
      if (primera) {
        const nombres = { entrada: "Entradas", salida: "Salidas", merma: "Mermas" };
        const indicadores = Object.entries(datos.resumen).map(([clave, valor]) => nombres[clave] + ": " + valor);
        if (datos.ventas !== undefined) indicadores.push("Ventas en cortes (MXN): " +
          Number(datos.ventas).toLocaleString("es-MX", { minimumFractionDigits: 2 }));
        const texto = indicadores.join("    ");
        doc.fontSize(9).fillColor("#222222");
        const alto = doc.heightOfString(texto, { width: ancho });
        doc.text(texto, 36, y, { width: ancho });
        y += alto + 18;
      }
      doc.rect(36, y, ancho, 23).fill("#eeeeee");
      let x = 36;
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#222222");
      encabezados.forEach((titulo, i) => {
        doc.text(titulo, x + 4, y + 7, { width: anchos[i] - 8, lineBreak: false });
        x += anchos[i];
      });
      y += 23;
      doc.font("Helvetica").fontSize(8);
    }

    // Divide también palabras largas para conservar cada carácter dentro de su columna.
    function lineas(valor, limite) {
      const resultado = [];
      let linea = "";
      const palabras = String(valor ?? "").replace(/\r\n?/g, "\n").match(/[^\S\n]*\S+|\n/g) || [];
      for (const palabra of palabras) {
        if (palabra === "\n") {
          resultado.push(linea); linea = "";
          continue;
        }
        if (linea && doc.widthOfString(linea + palabra) > limite) {
          resultado.push(linea); linea = "";
        }
        for (const caracter of (linea ? palabra : palabra.trimStart())) {
          if (linea && doc.widthOfString(linea + caracter) > limite) {
            resultado.push(linea); linea = "";
          }
          linea += caracter;
        }
      }
      resultado.push(linea);
      return resultado;
    }

    nuevaHoja(true);
    for (const movimiento of datos.movimientos) {
      const valores = [
        fecha(movimiento.fecha), tipos[movimiento.tipo], movimiento.producto, movimiento.cantidad,
        movimiento.unidad, movimiento.usuario,
        movimiento.descripcion || movimiento.tipoBaja || movimiento.observaciones || movimiento.detalle || ""
      ];
      const celdas = valores.map((valor, i) => lineas(valor, anchos[i] - 8));
      let pendiente = Math.max(...celdas.map(celda => celda.length));
      while (pendiente > 0) {
        if (y + 20 > 788) nuevaHoja();
        const cantidad = Math.min(pendiente, Math.floor((788 - y - 8) / 11));
        let x = 36;
        doc.fillColor("#222222");
        celdas.forEach((celda, i) => {
          const texto = celda.splice(0, cantidad).join("\n");
          doc.text(texto, x + 4, y + 4, { width: anchos[i] - 8, lineGap: 1.75 });
          x += anchos[i];
        });
        y += cantidad * 11 + 8;
        doc.moveTo(36, y).lineTo(36 + ancho, y).strokeColor("#dddddd").stroke();
        pendiente = Math.max(...celdas.map(celda => celda.length));
      }
    }
    if (!datos.movimientos.length) doc.text("No hay registros para estos filtros.", 40, y + 10);
    const rango = doc.bufferedPageRange();
    for (let i = 0; i < rango.count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 20;
      doc.font("Helvetica").fontSize(8).fillColor("#666666")
        .text("Imperio · Clamatos & Snacks", 36, 806, { lineBreak: false });
      doc.text("Página " + (i + 1) + " de " + rango.count, 420, 806, { width: 139, align: "right", lineBreak: false });
    }
    doc.end();
  });
}
