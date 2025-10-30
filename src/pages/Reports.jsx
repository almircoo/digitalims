import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
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
import {
  getVentasPorPeriodo,
  getVentasPorProducto,
  getVentasPorCategoria,
  getVentasPorCliente,
  getProductosMasVendidos,
  getProductosStockBajo,
  getClientesFrecuentes,
  getClientesTop,
  exportarReporte,
  getMetricasRapidas,
} from "@/apis";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const getInitialDates = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)

  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}T00:00:00`
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  }
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
export const Reports = () => {
  const { token } = useAuth() || {}
  const [dateRange, setDateRange] = useState(getInitialDates())
  const [loading, setLoading] = useState(false)

  const [quickMetrics, setQuickMetrics] = useState(null)
  const [salesByPeriod, setSalesByPeriod] = useState([])
  const [salesByProduct, setSalesByProduct] = useState([])
  const [salesByCategory, setSalesByCategory] = useState([])
  const [salesByCustomer, setSalesByCustomer] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [frequentCustomers, setFrequentCustomers] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])

  const [productPage, setProductPage] = useState(0)
  const [productTotalPages, setProductTotalPages] = useState(1)
  const pageSize = 10

  const handleDateChange = (name, value) => {
    const dateWithTime = value ? `${value}T00:00:00` : value
    setDateRange((prev) => ({ ...prev, [name]: dateWithTime }))
  }

  const loadReports = useCallback(
    async (page = 0) => {
      if (!token) {
        toast.error("Error de autenticación. Intenta iniciar sesión nuevamente.")
        return
      }
      setLoading(true)

      const { startDate, endDate } = dateRange

      try {
        const metricsPromise = getMetricasRapidas(startDate, endDate, token)
        const salesPeriodPromise = getVentasPorPeriodo(startDate, endDate, token)
        const salesProductPromise = getVentasPorProducto(
          startDate,
          endDate,
          page,
          pageSize,
          "totalVendido",
          "DESC",
          token,
        )
        const salesCategoryPromise = getVentasPorCategoria(startDate, endDate, 0, pageSize, token)
        const salesCustomerPromise = getVentasPorCliente(startDate, endDate, 0, pageSize, token)

        const topProductsPromise = getProductosMasVendidos(startDate, endDate, 0, pageSize, token)
        const frequentCustomersPromise = getClientesFrecuentes(startDate, endDate, 0, pageSize, token)
        const topCustomersPromise = getClientesTop(startDate, endDate, 0, pageSize, token)
        const lowStockPromise = getProductosStockBajo(10, 0, pageSize, token)

        const [
          metrics,
          salesPeriod,
          salesProductRes,
          salesCategoryRes,
          salesCustomerRes,
          topProductsRes,
          frequentCustomersRes,
          topCustomersRes,
          lowStockRes,
        ] = await Promise.all([
          metricsPromise,
          salesPeriodPromise,
          salesProductPromise,
          salesCategoryPromise,
          salesCustomerPromise,
          topProductsPromise,
          frequentCustomersPromise,
          topCustomersPromise,
          lowStockPromise,
        ])

        console.log("Metrcias: ", metrics)
        console.log("Ventas por periodo: ", salesPeriod)
        setQuickMetrics(metrics)

        let chartData = []
        if (salesPeriod?.datos && Array.isArray(salesPeriod.datos)) {
          console.log("Datos del array:", salesPeriod.datos)
          // Mapear los datos a la estructura que espera el gráfico
          chartData = salesPeriod.datos.map((item) => ({
            fecha: item.fechaPedido || "N/A",
            ventas: item.totalVentas || 0,
            pedidos: item.totalPedidos || 0,
          }))
          console.log("Datos mapeados para gráfico:", chartData)
        } else if (Array.isArray(salesPeriod)) {
          chartData = salesPeriod
        }

        setSalesByPeriod(chartData)

        // if (Array.isArray(salesPeriod)) {
        //   setSalesByPeriod(salesPeriod)
        // } else if (salesPeriod?.metricas && Array.isArray(salesPeriod.metricas)) {
        //   setSalesByPeriod(salesPeriod.metricas)
        // } else {
        //   setSalesByPeriod([])
        // }

        setSalesByProduct(salesProductRes?.content || [])
        setProductTotalPages(salesProductRes?.totalPages || 1)

        setSalesByCategory(salesCategoryRes?.content || [])
        setSalesByCustomer(salesCustomerRes?.content || [])
        setTopProducts(topProductsRes?.content || [])
        setFrequentCustomers(frequentCustomersRes?.content || [])
        setTopCustomers(topCustomersRes?.content || [])
        setLowStockProducts(lowStockRes?.content || [])

        if (page === 0) {
          toast.success("Reportes actualizados.")
        }
      } catch (error) {
        console.error("Error al cargar los reportes:", error)
        toast.error("Error al cargar los reportes. Verifica la conexión.")
      } finally {
        setLoading(false)
      }
    },
    [token, dateRange, pageSize],
  )

  useEffect(() => {
    loadReports(productPage)
  }, [dateRange, token])

  useEffect(() => {
    if (productPage > 0) {
      loadReports(productPage)
    }
  }, [productPage])

  const handleExport = async (reportName) => {
    if (!token) return toast.error("Token no disponible para exportar.")

    setLoading(true)
    try {
      const filtro = {
        reporte: reportName,
        fechaInicio: dateRange.startDate,
        fechaFin: dateRange.endDate,
      }

      const response = await exportarReporte(filtro, token)
      if (response.success) {
        toast.success(`Exportación de "${reportName}" iniciada. ${response.message}`)
      } else {
        toast.error("Fallo al iniciar la exportación.")
      }
    } catch (error) {
      toast.error("Error en la comunicación con el servidor de exportación.")
    } finally {
      setLoading(false)
    }
  }

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-8 bg-background rounded-xl shadow-lg">
      <Clock className="h-6 w-6 animate-spin mr-3 text-primary" />
      <p className="text-lg font-semibold text-gray-700">Cargando datos de reportes...</p>
    </div>
  )

  const renderPagination = (currentPage, totalPages, setPage) => (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Página {currentPage + 1} de {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage((prev) => Math.max(0, prev - 1))}
        disabled={currentPage === 0 || loading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
        disabled={currentPage === totalPages - 1 || loading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <MainLayout>
      <div className="container py-6 min-h-screen">
        <div className="space-y-6">
          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reportes de Negocio</h1>
            <p className="text-muted-foreground mt-2">
              Análisis de ventas, productos y clientes en el período seleccionado.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Selector de Fechas - Left (Sticky) */}
            <div className="lg:col-span-1">
              <Card className="p-4 shadow-lg border-t-4 border-primary sticky top-20">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Filtrar por Fechas
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Fecha Inicio
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.startDate.split("T")[0]}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      Fecha Fin
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.endDate.split("T")[0]}
                      onChange={(e) => handleDateChange("endDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={() => loadReports(0)} disabled={loading} className="w-full h-10">
                    <Calendar className="mr-2 h-4 w-4" />
                    {loading ? "Cargando..." : "Actualizar"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Métricas Rápidas - Right */}
            <div className="lg:col-span-3">
              {quickMetrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 flex flex-col justify-between h-full bg-blue-50/50">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-blue-600">Total Ventas</p>
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-foreground">
                      ${(quickMetrics.totalVentas || 0)?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Acumulado en el período</p>
                  </Card>

                  <Card className="p-4 flex flex-col justify-between h-full bg-green-50/50">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-green-600">Ticket Promedio</p>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-foreground">
                      ${quickMetrics.metricas.ticketPromedio || "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Valor promedio de pedido</p>
                  </Card>

                  <Card className="p-4 flex flex-col justify-between h-full bg-purple-50/50">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-purple-600">Clientes Nuevos</p>
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-foreground">
                      {quickMetrics.metricas.clientesUnicos || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Registrados en el período</p>
                  </Card>

                  <Card className="p-4 flex flex-col justify-between h-full bg-red-50/50">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-red-600">Unidades Vendidas</p>
                      <Package className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-xl md:text-2xl font-bold mt-2 text-foreground">
                      {quickMetrics.totalPedidos || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total de ítems</p>
                  </Card>
                </div>
              ) : loading ? (
                renderLoadingState()
              ) : null}
            </div>

            <div className="lg:col-span-3 lg:col-start-2">
              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-11 bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="sales" className="font-semibold text-sm flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" /> Ventas
                  </TabsTrigger>
                  <TabsTrigger value="products" className="font-semibold text-sm flex items-center">
                    <Package className="h-4 w-4 mr-1" /> Productos
                  </TabsTrigger>
                  <TabsTrigger value="customers" className="font-semibold text-sm flex items-center">
                    <Users className="h-4 w-4 mr-1" /> Clientes
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="font-semibold text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" /> Inventario
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña: Ventas */}
                <TabsContent value="sales" className="space-y-6 mt-4">
                  {/* Ventas por Período */}
                  {/* <Card className="p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" /> Tendencia de Ventas
                      </h3>
                      <p className="text-sm text-muted-foreground">Ventas y pedidos diarios</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={Array.isArray(salesByPeriod) ? salesByPeriod : []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="fecha" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} domain={[0, "auto"]} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} domain={[0, "auto"]} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "ventas" ? `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : value,
                            name === "ventas" ? "Ventas" : "Pedidos",
                          ]}
                          labelFormatter={(label) => `Fecha: ${label}`}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="ventas"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Total Ventas"
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="pedidos"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Total Pedidos"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card> */}
                  <Card className="p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" /> Tendencia de Ventas
                      </h3>
                      <p className="text-sm text-muted-foreground">Ventas y pedidos diarios</p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={Array.isArray(salesByPeriod) ? salesByPeriod : []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="fecha" stroke="#666" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} domain={[0, "auto"]} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} domain={[0, "auto"]} />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "ventas" ? `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : value,
                            name === "ventas" ? "Ventas" : "Pedidos",
                          ]}
                          labelFormatter={(label) => `Fecha: ${label}`}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="ventas"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Total Ventas"
                          dot={false}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="pedidos"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Total Pedidos"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
                        <BarChart3 className="h-5 w-5 mr-2 text-primary" /> Ventas por Categoría
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesByCategory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="nombre" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip formatter={(value) => `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} />
                        <Legend />
                        <Bar dataKey="totalVentas" fill="#3b82f6" name="Total Ventas" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Ventas por Producto (Tabla) */}
                  <Card className="p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Ventas por Producto</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Ventas por Producto")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByProduct.length > 0 ? (
                            salesByProduct.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.marca || "N/A"}</TableCell>
                                <TableCell>{item.modelo || "N/A"}</TableCell>
                                <TableCell className="text-right">{item.totalVendido || 0}</TableCell>
                                <TableCell className="text-right font-semibold">${item.totalVentas || 0}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="h-24 text-center text-muted-foreground">
                                No hay datos de ventas por producto
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {renderPagination(productPage, productTotalPages, setProductPage)}
                  </Card>

                  {/* Ventas por Cliente  */}
                  <Card className="p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Ventas por Cliente</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Ventas por Cliente")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead className="text-right">Total Pedidos</TableHead>
                            <TableHead className="text-right">Monto Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesByCustomer.length > 0 ? (
                            salesByCustomer.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.apellido || "N/A"}</TableCell>
                                <TableCell className="text-right">{item.totalPedidos || 0}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ${(item.montoTotal || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="4" className="h-24 text-center text-muted-foreground">
                                No hay datos de ventas por cliente
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Pestaña: Productos */}
                <TabsContent value="products" className="space-y-6 mt-4">
                  <Card className="p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
                        <Package className="h-5 w-5 mr-2 text-primary" /> Distribución de Productos Vendidos
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={topProducts.slice(0, 6)}
                          dataKey="totalVendido"
                          nameKey="nombre"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {topProducts.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} unidades`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Productos Más Vendidos</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Productos Más Vendidos")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead className="text-right">Cantidad Vendida</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProducts.length > 0 ? (
                            topProducts.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.marca || "N/A"}</TableCell>
                                <TableCell>{item.modelo || "N/A"}</TableCell>
                                <TableCell className="text-right font-semibold text-primary">
                                  {item.totalVendido || 0}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="4" className="h-24 text-center text-muted-foreground">
                                No hay datos de productos más vendidos
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Pestaña: Clientes */}
                <TabsContent value="customers" className="space-y-6 mt-4">
                  <Card className="p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Clientes Más Frecuentes</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Clientes Más Frecuentes")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Total Pedidos</TableHead>
                            <TableHead className="text-right">Total Gastado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {frequentCustomers.length > 0 ? (
                            frequentCustomers.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.apellido || "N/A"}</TableCell>
                                <TableCell>{item.email || "N/A"}</TableCell>
                                <TableCell className="text-right">{item.totalPedidos || 0}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  $
                                  {(item.totalGastado || item.totalgastado || 0)
                                    .toFixed(2)
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="h-24 text-center text-muted-foreground">
                                No hay datos de clientes frecuentes
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>

                  <Card className="p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Clientes Top (Mayor Gasto)</h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Clientes Top")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Apellido</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Total Pedidos</TableHead>
                            <TableHead className="text-right">Total Gastado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topCustomers.length > 0 ? (
                            topCustomers.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.apellido || "N/A"}</TableCell>
                                <TableCell>{item.email || "N/A"}</TableCell>
                                <TableCell className="text-right">{item.totalPedidos || 0}</TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                  ${(item.totalGastado || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="5" className="h-24 text-center text-muted-foreground">
                                No hay clientes top en este período
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Pestaña: Inventario */}
                <TabsContent value="inventory" className="space-y-6 mt-4">
                  <Card className="p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center text-red-600">
                        <AlertTriangle className="h-5 w-5 mr-2" /> Productos con Stock Bajo
                      </h3>
                      <Button size="sm" variant="outline" onClick={() => handleExport("Stock Bajo")}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Modelo</TableHead>
                            <TableHead className="text-right">Stock Actual</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead>Categoría</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lowStockProducts.length > 0 ? (
                            lowStockProducts.map((item, idx) => (
                              <TableRow key={idx} className="bg-red-50/20">
                                <TableCell className="font-medium">{item.nombre || "N/A"}</TableCell>
                                <TableCell>{item.marca || "N/A"}</TableCell>
                                <TableCell>{item.modelo || "N/A"}</TableCell>
                                <TableCell className="text-right font-bold text-red-700">{item.stock || 0}</TableCell>
                                <TableCell className="text-right">
                                  ${(item.precio || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </TableCell>
                                <TableCell>{item.categoria || "N/A"}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan="6" className="h-24 text-center text-muted-foreground">
                                ¡Felicidades! No hay productos con stock bajo (Mínimo: 10).
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
