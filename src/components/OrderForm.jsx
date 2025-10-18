import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
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

  const [cartItems, setCartItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!selectedProduct) {
      alert("Selecciona un producto");
      return;
    }

    const product = products.find(
      (p) => p.id === Number.parseInt(selectedProduct),
    );
    if (!product) return;

    const existingItem = cartItems.findIndex((item) => item.id === product.id);

    if (existingItem >= 0) {
      const updatedItems = [...cartItems];
      updatedItems[existingItem].cantidad += selectedQuantity;
      setCartItems(updatedItems);
    } else {
      setCartItems([
        ...cartItems,
        {
          id: product.id,
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
    const updatedItems = [...cartItems];
    updatedItems[index].cantidad = newQuantity;
    setCartItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.clienteId) {
      alert("Selecciona un cliente");
      return;
    }

    if (cartItems.length === 0) {
      alert("Agrega al menos un producto al carrito");
      return;
    }

    if (!formData.direccionEnvio) {
      alert("Ingresa la dirección de envío");
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.precioUnitario * item.cantidad,
      0,
    );

    const orderData = {
      clienteId: Number.parseInt(formData.clienteId),
      total: Number.parseFloat(total.toFixed(2)),
      direccionEnvio: formData.direccionEnvio,
      metodoPago: formData.metodoPago,
      estado: formData.estado,
      detalles: cartItems.map((item) => ({
        producto: item.producto,
        cantidad: item.cantidad,
        precioUnitario: Number.parseFloat(item.precioUnitario.toFixed(2)),
      })),
    };

    onSubmit(orderData);
  };

  const handleClientChange = (value) => {
    console.log(" Client selected:", value);
    setFormData({ ...formData, clienteId: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                    key={`customer-${customer.id}`}
                    value={String(customer.id)}
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
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="ENVIADO">Enviado</SelectItem>
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
                      key={`product-${product.id}`}
                      value={String(product.id)}
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
        <h3 className="text-lg font-semibold">Carrito de Compras</h3>
        <OrderCart
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4 justify-end">
        <Button type="submit" disabled={loading || cartItems.length === 0}>
          {loading ? "Creando pedido..." : "Crear Pedido"}
        </Button>
      </div>
    </form>
  );
};
