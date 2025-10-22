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
import { getDashboardReport, getSalesByProductReport,
  getSalesByCategoryReport,
  getSalesByCustomerReport,
  getTopProductsReport,
  getLowStockProductsReport,
  getFrequentCustomersReport,
  getTopCustomersReport, } from "@/apis";
import { Download, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Reports = () => {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [dashboardData, setDashboardData] = useState(null)
  const [salesByProduct, setSalesByProduct] = useState([])
  const [salesByCategory, setSalesByCategory] = useState([])
  const [salesByCustomer, setSalesByCustomer] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [frequentCustomers, setFrequentCustomers] = useState([])
  const [topCustomers, setTopCustomers] = useState([])

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadReports()
    }
  }, [token, user])

  const loadReports = async () => {
    try {
      setLoading(true)
      const startDateTime = `${dateRange.startDate}T00:00:00`
      const endDateTime = `${dateRange.endDate}T23:59:59`

      const [dashboard, products, categories, customers, topProds, lowStock, frequent, topCust] = await Promise.all([
        getDashboardReport(startDateTime, endDateTime, token),
        getSalesByProductReport(startDateTime, endDateTime, 0, 10, token),
        getSalesByCategoryReport(startDateTime, endDateTime, 0, 10, token),
        getSalesByCustomerReport(startDateTime, endDateTime, 0, 10, token),
        getTopProductsReport(startDateTime, endDateTime, 0, 10, token),
        getLowStockProductsReport(10, 0, 10, token),
        getFrequentCustomersReport(startDateTime, endDateTime, 0, 10, token),
        getTopCustomersReport(startDateTime, endDateTime, 0, 10, token),
      ])

      setDashboardData(dashboard)
      setSalesByProduct(products.content || [])
      setSalesByCategory(categories.content || [])
      setSalesByCustomer(customers.content || [])
      setTopProducts(topProds.content || [])
      setLowStockProducts(lowStock.content || [])
      setFrequentCustomers(frequent.content || [])
      setTopCustomers(topCust.content || [])

      toast.success("Reportes cargados exitosamente")
    } catch (error) {
      console.error("Error loading reports:", error)
      toast.error("Error al cargar reportes")
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }))
  }

  const handleExport = (reportName) => {
    toast.info(`Exportando ${reportName}...`)
    // TODO:
  }

  if (user?.role !== "ADMIN") {
    return (
      <MainLayout>
        <div className="container py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Acceso Denegado</h1>
            <p className="text-muted-foreground mt-2">Solo administradores pueden ver reportes</p>
          </div>
        </div>
      </MainLayout>
    )
  }

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

              {/* Date Range Filter */}
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

              {/* Dashboard Metrics */}
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

              {/* Reports Tabs */}
              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sales">Ventas</TabsTrigger>
                  <TabsTrigger value="products">Productos</TabsTrigger>
                  <TabsTrigger value="customers">Clientes</TabsTrigger>
                  <TabsTrigger value="inventory">Inventario</TabsTrigger>
                </TabsList>

                {/* Sales Tab */}
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
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByProduct.length > 0 ? (
                            salesByProduct.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item[0] || "N/A"}</TableCell>
                                <TableCell>{item[1] || 0}</TableCell>
                                <TableCell>${(item[2] || 0).toFixed(2)}</TableCell>
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
                            <TableHead>Total Ventas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByCategory.length > 0 ? (
                            salesByCategory.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombreCategoria || "N/A"}</TableCell>
                                <TableCell>${(item.totalVentas || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="2" className="text-center text-muted-foreground">
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
                            <TableHead>Total Gastado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByCustomer.length > 0 ? (
                            salesByCustomer.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item[0] || "N/A"}</TableCell>
                                <TableCell>${(item[1] || 0).toFixed(2)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="2" className="text-center text-muted-foreground">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Products Tab */}
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
                            <TableHead>Cantidad Vendida</TableHead>
                            <TableHead>Ingresos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProducts.length > 0 ? (
                            topProducts.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombreProducto || "N/A"}</TableCell>
                                <TableCell>{item.totalVendido || 0}</TableCell>
                                <TableCell>${(item.ingresos || 0).toFixed(2)}</TableCell>
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
                </TabsContent>

                {/* Customers Tab */}
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
                            <TableHead>Total Pedidos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {frequentCustomers.length > 0 ? (
                            frequentCustomers.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item[0] || "N/A"}</TableCell>
                                <TableCell>{item[1] || 0}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="2" className="text-center text-muted-foreground">
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
                            <TableHead>Email</TableHead>
                            <TableHead>Total Gastado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topCustomers.length > 0 ? (
                            topCustomers.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.nombreCliente || "N/A"}</TableCell>
                                <TableCell>{item.email || "N/A"}</TableCell>
                                <TableCell>${(item.totalGastado || 0).toFixed(2)}</TableCell>
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
                </TabsContent>

                {/* Inventory Tab */}
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
                            <TableHead>Stock Actual</TableHead>
                            <TableHead>Stock Mínimo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item[0] || "N/A"}</TableCell>
                                <TableCell>{item[1] || 0}</TableCell>
                                <TableCell>{item[2] || 10}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="3" className="text-center text-muted-foreground">
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
