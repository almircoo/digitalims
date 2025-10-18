import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
export const OrderCart = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const calculateSubtotal = (item) => item.precioUnitario * item.cantidad;
  const total = items.reduce((sum, item) => sum + calculateSubtotal(item), 0);

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          El carrito está vacío. Agrega productos para crear un pedido.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Producto
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Precio
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Cantidad
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Subtotal
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 text-sm">{item.nombre}</td>
                <td className="px-4 py-2 text-sm">
                  ${item.precioUnitario.toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdateQuantity(index, Math.max(1, item.cantidad - 1))
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={(e) =>
                        onUpdateQuantity(
                          index,
                          Math.max(1, Number.parseInt(e.target.value) || 1),
                        )
                      }
                      className="w-12 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(index, item.cantidad + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm font-medium">
                  ${calculateSubtotal(item).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
        <div className="text-lg font-bold">Total: ${total.toFixed(2)}</div>
        <Button type="button" variant="outline" onClick={onClearCart}>
          Limpiar Carrito
        </Button>
      </div>
    </div>
  );
};
