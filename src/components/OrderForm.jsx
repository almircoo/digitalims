import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { DialogFooter } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { OrderCart } from "./OrderCart";

export const OrderForm = ({ customers, products, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    metodoPago: "Tarjeta de crédito",
    estado: "PENDIENTE",
  });

  const [detalles, setDetalles] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [validationError, setValidationError] = useState("");

  const handleAddToCart = () => {
    setValidationError("");

    if (!selectedProduct) {
      setValidationError("Selecciona un producto");
      return;
    }

    const product = products.find(
      (p) => p.idProducto === Number.parseInt(selectedProduct),
    );
    if (!product) return;

    if (selectedQuantity < 1) {
      setValidationError("La cantidad debe ser mayor a 0");
      return;
    }

    const existingItem = detalles.findIndex(
      (item) => item.id === product.idProducto,
    );

    if (existingItem >= 0) {
      const updatedItems = [...detalles];
      updatedItems[existingItem].cantidad += selectedQuantity;
      setDetalles(updatedItems);
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
      ]);
    }

    setSelectedProduct("");
    setSelectedQuantity(1);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      setValidationError("La cantidad debe ser mayor a 0");
      return;
    }

    const updatedItems = [...detalles];
    updatedItems[index].cantidad = newQuantity;
    setDetalles(updatedItems);
    setValidationError("");
  };

  const handleRemoveItem = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setDetalles([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.clienteId) {
      setValidationError("Selecciona un cliente");
      return;
    }

    if (!detalles || detalles.length === 0) {
      setValidationError(
        "Debes agregar al menos un producto al carrito. Los detalles del pedido son requeridos.",
      );
      return;
    }

    if (!formData.direccionEnvio) {
      setValidationError("Ingresa la dirección de envío");
      return;
    }

    const invalidDetail = detalles.find(
      (item) => !item.id || item.cantidad < 1 || item.precioUnitario <= 0,
    );
    if (invalidDetail) {
      setValidationError("Uno o más productos tienen datos inválidos");
      return;
    }

    const total = detalles.reduce(
      (sum, item) => sum + item.precioUnitario * item.cantidad,
      0,
    );

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
          fechaCreacion:
            item.producto.fechaCreacion || new Date().toISOString(),
          estado:
            item.producto.estado !== undefined ? item.producto.estado : true,
        },
        cantidad: item.cantidad,
        precioUnitario: Number.parseFloat(item.precioUnitario.toFixed(2)),
      })),
    };
    console.log("ORDER DATA: ", orderData);

    onSubmit(orderData);
  };

  const handleClientChange = (value) => {
    console.log("Client selected:", value);
    setFormData({ ...formData, clienteId: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {validationError}
        </div>
      )}

      {/* Información del Pedido */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información del Pedido</h3>

        <div>
          <Label htmlFor="cliente">Cliente *</Label>
          <Select value={formData.clienteId} onValueChange={handleClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers && customers.length > 0 ? (
                customers.map((customer) => (
                  <SelectItem
                    key={`customer-${customer.idCustomer}`}
                    value={String(customer.idCustomer)}
                  >
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
          <Label htmlFor="direccion">Dirección de Envío *</Label>
          <Input
            id="direccion"
            value={formData.direccionEnvio}
            onChange={(e) =>
              setFormData({ ...formData, direccionEnvio: e.target.value })
            }
            placeholder="Ej: Av. Principal 123, Apt 4B"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="metodo">Método de Pago</Label>
            <Select
              value={formData.metodoPago}
              onValueChange={(value) =>
                setFormData({ ...formData, metodoPago: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tarjeta de crédito">
                  Tarjeta de crédito
                </SelectItem>
                <SelectItem value="Tarjeta de débito">
                  Tarjeta de débito
                </SelectItem>
                <SelectItem value="Transferencia bancaria">
                  Transferencia bancaria
                </SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                setFormData({ ...formData, estado: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="ENTREGADO">Entregado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Agregar Productos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Agregar Productos</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="producto">Producto</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem
                      key={`product-${product.idProducto}`}
                      value={String(product.idProducto)}
                    >
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
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              value={selectedQuantity}
              onChange={(e) =>
                setSelectedQuantity(
                  Math.max(1, Number.parseInt(e.target.value) || 1),
                )
              }
            />
          </div>

          <div className="flex items-end">
            <Button type="button" onClick={handleAddToCart} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>
        </div>
      </div>

      {/* Carrito */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Carrito de Compras{" "}
          {detalles.length > 0 && `(${detalles.length} productos)`}
        </h3>
        <OrderCart
          items={detalles}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || detalles.length === 0}>
          {loading ? "Creando pedido..." : "Crear Pedido"}
        </Button>
      </DialogFooter>
    </form>
  );
};
