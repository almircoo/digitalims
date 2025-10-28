import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

function request(path, { data = null, token = null, method = "GET" }) {
  const fullPath = API_BASE_URL ? `${API_BASE_URL}${path}` : path

  console.log("API Call:", {
    path: fullPath,
    method,
    token: token ? "present" : "missing",
  });

  return fetch(fullPath, {
    method,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
    body: method !== "GET" && method !== "DELETE" ? JSON.stringify(data) : null,
  })
    .then((response) => {
      if (response.ok) {
        if (method === "DELETE") {
          return true;
        }
        return response.json();
      }

      if (response.status === 403) {
        throw new Error("No tienes permisos para acceder a este recurso");
      }
      if (response.status === 405) {
        throw new Error("Método no permitido. Este endpoint no está disponible");
      }
      if (response.status === 401) {
        throw new Error("No autenticado. Por favor inicia sesión nuevamente");
      }

      return response.json().then((json) => {
        if (response.status === 400) {
          const errors = Object.keys(json).map((k) => {
            const value = json[k]

            // 1. Verificar si es un array antes de usar .join()
            if (Array.isArray(value)) {
              return value.join(" ") // Si es array, úne con un espacio
            }

            // 2. Si no es un array, conviérte a string
            return String(value)
          })

          throw new Error(errors.join(" "))
        }
        throw new Error(JSON.stringify(json))
      })
    })
    .catch((e) => {
      console.error("API Error:", e.message)
      toast(e.message, { type: "error" })
      throw e
    })
}

export function login(email, password) {
  return request("/v1/auth/login", {
    data: { email, password },
    method: "POST",
  })
}

export function register(userData) {
  return request("/v1/auth/register", {
    data: userData,
    method: "POST",
  })
}

// Categories CRUD
export function addCategory(data, token) {
  return request("/v1/categorias", {
    data,
    token,
    method: "POST",
  })
}

export function getCategories(token, page = 0, size = 10) {
  return request(`/v1/categorias?page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}

export function updateCategory(id, data, token) {
  return request(`/v1/categorias/${id}`, {
    data,
    token,
    method: "PUT",
  })
}

export function removeCategory(id, token) {
  return request(`/1/categorias/${id}`, {
    token,
    method: "DELETE",
  })
}

// Products CRUD
export function addProduct(data, token) {
  console.log("Adding product with data: ", data)
  return request("/v1/productos", {
    data,
    token,
    method: "POST",
  })
}

export function getProducts(token, page = 0, size = 10) {
  return request(`/v1/productos?page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}

export function updateProduct(id, data, token) {
  return request(`/v1/productos/${id}`, {
    data,
    token,
    method: "PUT",
  })
}

export function removeProduct(id, token) {
  return request(`/v1/productos/${id}`, {
    token,
    method: "DELETE",
  })
}

// Customers CRUD
export function addCustomer(data, token) {
  return request("/v1/clientes", {
    data,
    token,
    method: "POST",
  })
}

export function getCustomers(token, page = 0, size = 10) {
  return request(`/v1/clientes?page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}

export function updateCustomer(id, data, token) {
  return request(`/v1/clientes/${id}`, {
    data,
    token,
    method: "PUT",
  })
}

export function removeCustomer(id, token) {
  return request(`/v1/clientes/${id}`, {
    token,
    method: "DELETE",
  })
}

// Orders CRUD 
export function getOrders(token, page = 0, size = 10) {
  return request(`/v1/pedidos?page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}

export function createOrder(data, token) {
  return request("/v1/pedidos", {
    data,
    token,
    method: "POST",
  })
}

export function updateOrder(id, data, token) {
  return request(`/v1/pedidos/${id}`, {
    data,
    token,
    method: "PUT",
  })
}

export function removeOrder(id, token) {
  return request(`/v1/pedidos/${id}`, {
    token,
    method: "DELETE",
  })
}

export function updateOrderStatus(id, estado, token) {
  return request(`/v1/pedidos/${id}/estado?estado=${estado}`, {
    token,
    method: "PATCH",
  });
}
// Reports
export function getDashboardReport(startDate, endDate, token) {
  return request(`/v1/reportes/dashboard?fechaInicio=${startDate}&fechaFin=${endDate}`, {
    token,
    method: "GET",
  })
}

//
export function getVentasPorPeriodo(startDate, endDate, token){
  return request(`/v1/reportes/ventas/periodo?fechaInicio=${startDate}&fechaFin=${endDate}`, {
    token,
    method: "GET",
  })
}

export function getVentasPorProducto(startDate, endDate, page = 0, size = 10, sortBy = 'totalVendido', sortDirection = 'DESC', token){
  return request(`/v1/reportes/ventas/producto?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`, {
    token,
    method: "GET",
  })
}
export function getVentasPorCategoria(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/ventas/categoria?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}
export function getVentasPorCliente(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/ventas/cliente?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}
export function getProductosMasVendidos(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/productos/mas-vendidos?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}
export function getProductosStockBajo(stockMinimo = 10, page = 0, size = 10, token){
  return request(`/v1/reportes/productos/stock-bajo?stockMinimo=${stockMinimo}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}

export function getProductosMasVendidos(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/productos/mas-vendidos?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}
export function getClientesFrecuentes(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/clientes/frecuentes?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}
export function getClientesMejorCompra(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/clientes/mejor-compra?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}
export function getClientesTop(startDate, endDate, page = 0, size = 10, token){
  return request(`/v1/reportes/clientes/top?fechaInicio=${startDate}&fechaFin=${endDate}&page=${page}&size=${size}`, {
    token,
    method: "GET",
  })
}

export function getBuscarBoletaPorDni(dni, estado = null, fechaInicio = null, fechaFin = null, page = 0, size = 10, token){
  let path = `/v1/reportes/boleta?dni=${dni}&page=${page}&size=${size}`;
  if (estado) {
    path += `&estado=${estado}`;
  }
  if (fechaInicio) {
    path += `&fechaInicio=${fechaInicio}`;
  }
  if (fechaFin) {
    path += `&fechaFin=${fechaFin}`;
  }
  return request(path, {
    token,
    method: "GET",
  })
}

export function exportarReporte(filtro, token){
  return request(`/v1/reportes/exportar`,{
    token,
    method: "POST",
    body: JSON.stringify(filtro)
  })
}

export function getMetricasRapidas(startDate, endDate, token){
  return request(`/v1/reportes/metricas/rapidas?fechaInicio=${startDate}&fechaFin=${endDate}`, {
    token,
    method: "GET"
  })
}

