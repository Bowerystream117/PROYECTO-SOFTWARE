import ExcelJS from "exceljs";

const titulos = {
  todos: "Movimientos generales", entrada: "Entradas de insumos",
  salida: "Salidas de insumos", merma: "Mermas y desperdicios"
};
const tipos = { entrada: "Entrada", salida: "Salida", merma: "Merma" };

function fechaVisible(fecha) {
  return fecha.split("-").reverse().join("/");
}

export async function crearExcel(tipo, desde, hasta, movimientos) {
  const libro = new ExcelJS.Workbook();
  libro.creator = "Imperio";
  const hoja = libro.addWorksheet("Reporte", { views: [{ state: "frozen", ySplit: 4, showGridLines: false }] });
  const anchos = [15, 14, 30, 14, 15, 25, 52];
  anchos.forEach((ancho, indice) => { hoja.getColumn(indice + 1).width = ancho; });

  hoja.mergeCells("A1:G1");
  hoja.getCell("A1").value = "IMPERIO  ·  " + titulos[tipo];
  hoja.getCell("A1").font = { name: "Calibri", size: 17, bold: true, color: { argb: "FFFFE6AC" } };
  hoja.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF262019" } };
  hoja.getCell("A1").alignment = { vertical: "middle", indent: 1 };
  hoja.getRow(1).height = 34;

  hoja.mergeCells("A2:G2");
  const periodo = [desde && "Desde " + fechaVisible(desde), hasta && "hasta " + fechaVisible(hasta)]
    .filter(Boolean).join(" ") || "Todo el período registrado";
  hoja.getCell("A2").value = periodo + "  ·  " + movimientos.length + " registros";
  hoja.getCell("A2").font = { color: { argb: "FF6B5032" } };
  hoja.getCell("A2").alignment = { vertical: "middle", indent: 1 };
  hoja.getRow(2).height = 23;

  const cabecera = hoja.getRow(4);
  cabecera.values = ["Fecha", "Tipo", "Producto", "Cantidad", "Unidad", "Usuario", "Observación"];
  cabecera.height = 23;
  cabecera.eachCell(celda => {
    celda.font = { bold: true, color: { argb: "FF312514" } };
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAD4A4" } };
    celda.alignment = { vertical: "middle" };
  });

  for (const movimiento of movimientos) {
    const fila = hoja.addRow([
      new Date(movimiento.fecha + "T00:00:00Z"), tipos[movimiento.tipo], movimiento.producto,
      Number(movimiento.cantidad), movimiento.unidad, movimiento.usuario,
      movimiento.descripcion || movimiento.tipoBaja || movimiento.observaciones || movimiento.detalle || ""
    ]);
    fila.getCell(1).numFmt = "dd/mm/yyyy";
    fila.getCell(4).numFmt = Number.isInteger(fila.getCell(4).value) ? "0" : "0.00";
    fila.eachCell({ includeEmpty: true }, celda => {
      celda.alignment = { vertical: "top", wrapText: true };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fila.number % 2 ? "FFFAF4E9" : "FFFFFFFF" } };
    });
  }
  hoja.autoFilter = "A4:G" + hoja.rowCount;
  return libro.xlsx.writeBuffer();
}
