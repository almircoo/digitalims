import React, { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Edit2, Trash2, ChevronDown, ChevronUp, Download } from "lucide-react"
import { PERMISSIONS } from "@/config/permissions"
import { generateOrderPDF } from "@/lib/pdfGenerator"

export const OrderList = ({ orders, onEdit, onDelete, onStatusChange, loading, userRole = "USER" }) => {
  const [expandedOrder, setExpandedOrder] = useState(null)

  const canChangeStatus = PERMISSIONS.ACTIONS.UPDATE_ORDER_STATUS.includes(userRole)
  const canDeleteOrder = PERMISSIONS.ACTIONS.DELETE_ORDER.includes(userRole)

  const getStatusColor = (status) => {
    const colors = {
      PENDIENTE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      ENTREGADO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      CANCELADO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const handleDownloadPDF = (order) => {
    try {
      generateOrderPDF(order)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No hay pedidos creados aún</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.idPedido} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-lg">Pedido #{order.idPedido}</CardTitle>
                  <Badge className={getStatusColor(order.estado)}>{order.estado}</Badge>
                </div>
                <CardDescription className="mt-1">
                  Cliente: {order.cliente?.nombre || "N/A"} | Total: ${order.total?.toFixed(2) || "0.00"}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(order)}
                  disabled={order.estado !== "ENTREGADO"}
                  title={order.estado === "ENTREGADO" ? "Descargar PDF" : "Solo disponible para pedidos entregados"}
                  className={order.estado === "ENTREGADO" ? "hover:bg-green-50 dark:hover:bg-green-950" : ""}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(order)} disabled={loading}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                {canDeleteOrder && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(order.idPedido)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedOrder(expandedOrder === order.idPedido ? null : order.idPedido)}
                >
                  {expandedOrder === order.idPedido ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedOrder === order.idPedido && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Dirección de Envío</p>
                  <p className="text-muted-foreground">{order.direccionEnvio}</p>
                </div>
                <div>
                  <p className="font-semibold">Método de Pago</p>
                  <p className="text-muted-foreground">{order.metodoPago}</p>
                </div>
                <div>
                  <p className="font-semibold">DNI Cliente</p>
                  <p className="text-muted-foreground">{order.cliente?.dni || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Fecha de Pedido</p>
                  <p className="text-muted-foreground">
                    {order.fechaPedido ? new Date(order.fechaPedido).toLocaleDateString("es-ES") : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">Detalles del Pedido</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {order.detalles && order.detalles.length > 0 ? (
                    order.detalles.map((detail, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-muted p-3 rounded">
                        <div>
                          <p className="font-medium">{detail.producto?.nombre || "Producto"}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {detail.cantidad}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(detail.precioUnitario * detail.cantidad).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">${detail.precioUnitario.toFixed(2)} c/u</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Sin detalles</p>
                  )}
                </div>
              </div>

              {canChangeStatus && order.estado !== "ENTREGADO" && order.estado !== "CANCELADO" && (
                <div className="flex gap-2 flex-wrap">
                  {order.estado === "PENDIENTE" && (
                    <Button size="sm" onClick={() => onStatusChange(order.idPedido, "ENTREGADO")} disabled={loading}>
                      Marcar como Entregado
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onStatusChange(order.idPedido, "CANCELADO")}
                    disabled={loading}
                  >
                    Cancelar pedido
                  </Button>
                </div>
              )}
              {!canChangeStatus &&
                (order.estado === "PENDIENTE" || order.estado === "ENTREGADO" || order.estado === "CANCELADO") && (
                  <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                    Solo administradores pueden cambiar el estado de los pedidos.
                  </div>
                )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
