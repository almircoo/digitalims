import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus } from "lucide-react";
import { OrderCart } from "./OrderCart";

export const OrderForm = ({ customers, products, onSubmit, loading }) => {
   const [formData, setFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    metodoPago: "Tarjeta de crédito",
    estado: "PENDIENTE",
  })

  const [detalles, setDetalles] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [validationError, setValidationError] = useState("")

  const handleAddToCart = () => {
    setValidationError("")

    if (!selectedProduct) {
      setValidationError("Selecciona un producto")
      return
    }

    const product = products.find((p) => p.idProducto === Number.parseInt(selectedProduct))
    if (!product) return

    if (selectedQuantity < 1) {
      setValidationError("La cantidad debe ser mayor a 0")
      return
    }

    const existingItem = detalles.findIndex((item) => item.id === product.idProducto)

    if (existingItem >= 0) {
      const updatedItems = [...detalles]
      updatedItems[existingItem].cantidad += selectedQuantity
      setDetalles(updatedItems)
    } else {
      setDetalles([
        ...detalles,
        {
          id: product.idProducto,
          nombre: product.nombre,
          precioUnitario: product.precio,
          cantidad: selectedQuantity,
          producto: product,
        },
      ])
    }

    setSelectedProduct("")
    setSelectedQuantity(1)
  }

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      setValidationError("La cantidad debe ser mayor a 0")
      return
    }

    const updatedItems = [...detalles]
    updatedItems[index].cantidad = newQuantity
    setDetalles(updatedItems)
    setValidationError("")
  }

  const handleRemoveItem = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const handleClearCart = () => {
    setDetalles([])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError("")

    if (!formData.clienteId) {
      setValidationError("Selecciona un cliente")
      return
    }

    if (!detalles || detalles.length === 0) {
      setValidationError("Debes agregar al menos un producto al carrito")
      return
    }

    if (!formData.direccionEnvio) {
      setValidationError("Ingresa la dirección de envío")
      return
    }

    const invalidDetail = detalles.find((item) => !item.id || item.cantidad < 1 || item.precioUnitario <= 0)
    if (invalidDetail) {
      setValidationError("Uno o más productos tienen datos inválidos")
      return
    }

    const total = detalles.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0)

    const orderData = {
      clienteId: Number.parseInt(formData.clienteId),
      total: Number.parseFloat(total.toFixed(2)),
      direccionEnvio: formData.direccionEnvio,
      metodoPago: formData.metodoPago,
      estado: formData.estado,
      detalles: detalles.map((item) => ({
        producto: {
          productoId: item.producto.idProducto,
          categoria: {
            idCategoria: item.producto.categoria?.idCategoria || 1,
          },
          nombre: item.producto.nombre,
          descripcion: item.producto.descripcion || "",
          precio: item.producto.precio,
          stock: item.producto.stock,
          modelo: item.producto.modelo || "",
          marca: item.producto.marca || "",
          color: item.producto.color || "",
          fechaCreacion: item.producto.fechaCreacion || new Date().toISOString(),
          estado: item.producto.estado !== undefined ? item.producto.estado : true,
        },
        cantidad: item.cantidad,
        precioUnitario: Number.parseFloat(item.precioUnitario.toFixed(2)),
      })),
    }

    onSubmit(orderData)
  }

  const handleClientChange = (value) => {
    setFormData({ ...formData, clienteId: value })
  }

  const total = detalles.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium dark:bg-red-950 dark:text-red-200">
          {validationError}
        </div>
      )}

      {/* Información del Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Pedido</CardTitle>
          <CardDescription>Completa los datos básicos del pedido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cliente" className="text-base font-medium">
              Cliente *
            </Label>
            <Select value={formData.clienteId} onValueChange={handleClientChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers && customers.length > 0 ? (
                  customers.map((customer) => (
                    <SelectItem key={`customer-${customer.idCustomer}`} value={String(customer.idCustomer)}>
                      {customer.nombre} - {customer.email}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-customers" disabled>
                    No hay clientes disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="direccion" className="text-base font-medium">
              Dirección de Envío *
            </Label>
            <Input
              id="direccion"
              value={formData.direccionEnvio}
              onChange={(e) => setFormData({ ...formData, direccionEnvio: e.target.value })}
              placeholder="Ej: Av. Principal 123, Apt 4B"
              className="mt-1 text-base"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metodo" className="text-base font-medium">
                Método de Pago
              </Label>
              <Select
                value={formData.metodoPago}
                onValueChange={(value) => setFormData({ ...formData, metodoPago: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tarjeta de crédito">Tarjeta de crédito</SelectItem>
                  <SelectItem value="Tarjeta de débito">Tarjeta de débito</SelectItem>
                  <SelectItem value="Transferencia bancaria">Transferencia bancaria</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estado" className="text-base font-medium">
                Estado
              </Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agregar Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Productos</CardTitle>
          <CardDescription>Selecciona productos y cantidades para el pedido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="producto" className="text-base font-medium">
                Producto
              </Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={`product-${product.idProducto}`} value={String(product.idProducto)}>
                        {product.nombre} - ${product.precio.toFixed(2)}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>
                      No hay productos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cantidad" className="text-base font-medium">
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="mt-1 text-base"
              />
            </div>

            <div className="flex items-end">
              <Button type="button" onClick={handleAddToCart} className="w-full text-base h-10">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carrito */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Carrito de Compras {detalles.length > 0 && `(${detalles.length} productos)`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detalles.length > 0 ? (
            <>
              <OrderCart
                items={detalles}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
              />

              {/* Resumen */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-base">El carrito está vacío</p>
              <p className="text-sm">Agrega productos para continuar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={() => window.location.reload()} className="text-base h-10">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || detalles.length === 0} className="text-base h-10">
          {loading ? "Creando pedido..." : "Crear Pedido"}
        </Button>
      </div>
    </form>
  );
};
