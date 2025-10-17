import { toast } from "sonner"

function request(path, { data = null, token = null, method = "GET" }) {
  return fetch(path, {
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
          return true
        }
        return response.json()
      }

      return response
        .json()
        .then((json) => {
          if (response.status === 400) {
            const errors = Object.keys(json).map((k) => `${json[k].join(" ")}`)
            throw new Error(errors.join(" "))
          }
          throw new Error(JSON.stringify(json))
        })
        .catch((e) => {
          if (e.name === "SyntaxError") {
            throw new Error(response.statusText)
          }
          throw new Error(e)
        })
    })
    .catch((e) => {
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

export function getOrders(token, page = 0, size = 10) {
  return request(`/v1/pedidos?page=${page}&size=${size}`, {
    token,
    method: "GET",
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
  return request(`/v1/categorias/${id}`, {
    token,
    method: "DELETE",
  })
}

// Products CRUD
export function addProduct(data, token) {
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
  })
}
