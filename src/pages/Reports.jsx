import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { Sidebar } from "@/layouts/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { } from "@/apis";
import { Download, Calendar} from "lucide-react";
import { toast } from "sonner";
export const Reports = () => {

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="sticky top-20">
              <Sidebar />
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
                <p className="text-muted-foreground mt-2">Análisis de ventas, productos y clientes</p>
              </div>

              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => handleDateChange("endDate", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={loadReports} disabled={loading} className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      {loading ? "Cargando..." : "Actualizar"}
                    </Button>
                  </div>
                </div>
              </Card>

              {dashboardData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Ventas</p>
                    <p className="text-2xl font-bold">${dashboardData.totalVentas?.toFixed(2) || "0.00"}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Pedidos</p>
                    <p className="text-2xl font-bold">{dashboardData.totalPedidos || 0}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Registros</p>
                    <p className="text-2xl font-bold">{dashboardData.totalRegistros || 0}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="text-sm font-semibold">
                      {dateRange.startDate} a {dateRange.endDate}
                    </p>
                  </Card>
                </div>
              )}

              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sales">Ventas</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="customers">Clientes</TabsTrigger>
                  <TabsTrigger value="inventory">Inventario</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="space-y-4">
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Ventas por Producto</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Ventas por Producto")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByProduct.length > 0 ? (
                            salesByProduct.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.marca || "N/A"}</TableCell>
                                <TableCell>{item.modelo || "N/A"}</TableCell>
                                <TableCell>{item.totalVendido || 0}</TableCell>
                                <TableCell>${(item.totalVentas || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Ventas por Categoría</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Ventas por Categoría")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Total Unidades</TableHead>
                            <TableHead>Total Ventas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByCategory.length > 0 ? (
                            salesByCategory.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.totalUnidades || 0}</TableCell>
                                <TableCell>${(item.totalVentas || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="3" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Ventas por Cliente</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Ventas por Cliente")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Total Pedidos</TableHead>
                            <TableHead>Monto Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByCustomer.length > 0 ? (
                            salesByCustomer.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.apellido || "N/A"}</TableCell>
                                <TableCell>{item.totalPedidos || 0}</TableCell>
                                <TableCell>${(item.montoTotal || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="4" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Productos Más Vendidos</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Productos Más Vendidos")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Cantidad Vendida</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProducts.length > 0 ? (
                            topProducts.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.marca || "N/A"}</TableCell>
                                <TableCell>{item.modelo || "N/A"}</TableCell>
                                <TableCell>{item.totalVendido || 0}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="4" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Clientes Más Frecuentes</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Clientes Más Frecuentes")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Total Pedidos</TableHead>
                            <TableHead>Total Gastado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {frequentCustomers.length > 0 ? (
                            frequentCustomers.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.apellido || "N/A"}</TableCell>
                                <TableCell>{item.email || "N/A"}</TableCell>
                                <TableCell>{item.totalPedidos || 0}</TableCell>
                                <TableCell>${(item.totalgastado || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Clientes Top (Mayor Gasto)</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Clientes Top")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Total Pedidos</TableHead>
                            <TableHead>Total Gastado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topCustomers.length > 0 ? (
                            topCustomers.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.apellido || "N/A"}</TableCell>
                                <TableCell>{item.email || "N/A"}</TableCell>
                                <TableCell>{item.totalPedidos || 0}</TableCell>
                                <TableCell>${(item.totalGastado || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Productos con Stock Bajo</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Stock Bajo")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead>Stock Actual</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Categoría</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.marca || "N/A"}</TableCell>
                                <TableCell>{item.modelo || "N/A"}</TableCell>
                                <TableCell>{item.stock || 0}</TableCell>
                                <TableCell>${(item.precio || 0).toFixed(2)}</TableCell>
                                <TableCell>{item.categoria || "N/A"}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="6" className="text-center text-muted-foreground">
                                No hay productos con stock bajo
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
