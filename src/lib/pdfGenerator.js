import jsPDF from "jspdf"

export const generateOrderPDF = (order) => {
  try {
    // Crear documento PDF en formato A4
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - margin * 2
    let yPosition = margin

    // Configurar fuentes
    doc.setFont("Arial", "bold")
    doc.setFontSize(18)
    doc.text("COMPROBANTE DE PEDIDO", margin, yPosition)
    yPosition += 12

    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // Información del pedido
    doc.setFont("Arial", "normal")
    doc.setFontSize(11)
    doc.setTextColor(50, 50, 50)

    const infoData = [
      { label: "Número de Pedido:", value: `#${order.idPedido}` },
      { label: "Estado:", value: order.estado },
      { label: "Fecha:", value: order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString("es-ES") : "N/A" },
      { label: "Cliente:", value: order.cliente?.nombre || "N/A" },
      { label: "DNI:", value: order.cliente?.dni || "N/A" },
      { label: "Dirección:", value: order.direccionEnvio || "N/A" },
      { label: "Método de Pago:", value: order.metodoPago || "N/A" },
    ]

    infoData.forEach((item) => {
      doc.setFont("Arial", "bold")
      doc.text(item.label, margin, yPosition)
      doc.setFont("Arial", "normal")
      doc.text(item.value, margin + 50, yPosition)
      yPosition += 7
    })

    yPosition += 5

    // Detalles del pedido
    doc.setFont("Arial", "bold")
    doc.setFontSize(12)
    doc.text("DETALLES DEL PEDIDO", margin, yPosition)
    yPosition += 8

    // Tabla de detalles
    doc.setFont("Arial", "bold")
    doc.setFontSize(10)
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, yPosition - 5, contentWidth, 7, "F")
    doc.text("Producto", margin + 2, yPosition)
    doc.text("Cantidad", margin + 80, yPosition)
    doc.text("Precio Unit.", margin + 120, yPosition)
    doc.text("Subtotal", margin + 160, yPosition)
    yPosition += 8

    // Filas de detalles
    doc.setFont("Arial", "normal")
    doc.setFontSize(10)
    if (order.detalles && order.detalles.length > 0) {
      order.detalles.forEach((detail) => {
        const productName = detail.producto?.nombre || "Producto"
        const cantidad = detail.cantidad
        const precioUnitario = detail.precioUnitario.toFixed(2)
        const subtotal = (detail.precioUnitario * detail.cantidad).toFixed(2)

        doc.text(productName.substring(0, 35), margin + 2, yPosition)
        doc.text(cantidad.toString(), margin + 85, yPosition)
        doc.text(`$${precioUnitario}`, margin + 125, yPosition)
        doc.text(`$${subtotal}`, margin + 165, yPosition)
        yPosition += 7
      })
    }

    yPosition += 5

    // Línea separadora
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // Total
    doc.setFont("Arial", "bold")
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`TOTAL: $${order.total?.toFixed(2) || "0.00"}`, margin + 120, yPosition)

    // Descargar PDF
    doc.save(`Pedido_${order.idPedido}.pdf`)
  } catch (error) {
    console.error("Error generando PDF:", error)
    throw error
  }
}
