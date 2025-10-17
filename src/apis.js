import { toast } from "sonner";

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
      // si es correcto
      if (response.ok) {
        if (method === "DELETE") {
          // si elemina no retorna nada
          return true;
        }
        return response.json();
      }

      // sobre escirbe si existen errores
      return response
        .json()
        .then((json) => {
          // captura el error genrado del servidor
          if (response.status === 400) {
            const errors = Object.keys(json).map((k) => `${json[k].join(" ")}`);
            throw new Error(errors.join(" "));
          }
          throw new Error(JSON.stringify(json));
        })
        .catch((e) => {
          if (e.name === "SyntaxError") {
            throw new Error(response.statusText);
          }
          throw new Error(e);
        });
    })
    .catch((e) => {
      // captura todos los errores
      toast(e.message, { type: "error" });
    });

  .then((json) => {
  // carga success de la peticon en formato json -
  // solo para pruebas remover en produccion
    toast(JSON.stringify(json), { type: "success" });
    return json;
  });
}

export function login(email, password) {
  return request("/v1/auth/login", {
    data: { email, password },
    method: "POST",
  });
}

export function register(userData) {
  return request("/v1/auth/register", {
    data: userData,
    method: "POST",
  });
}

//category CRUD
export function addCategory(data, token) {
  return request("/v1/categorias", {
    data,
    token,
    method: "POST",
  });
}
export function getCategories(token) {
  return request("/v1/categorias", {
    token,
    method: "GET",
  });
}
export function updateCategory(id, token) {
  return request(`/v1/categorias/${id}`, {
    token,
    method: "PUT",
  });
}
export function removeCategory(id, token) {
  return request(`/v1/categorias/${id}`, {
    token,
    method: "DELETE",
  });
}

// product CRUD
export function addProduct(data, token) {
  return request("/v1/productos", {
    data,
    token,
    method: "POST",
  });
}
export function getProducts(token) {
  return request("/v1/productos", {
    token,
    method: "GET",
  });
}
export function updateProduct(id, token) {
  return request(`/v1/productos/${id}`, {
    token,
    method: "PUT",
  });
}
export function removeProduct(id, token) {
  return request(`/v1/productos/${id}`, {
    token,
    method: "DELETE",
  });
}

//customers
export function addCustomer(data, token) {
  return request("/v1/clientes", {
    data,
    token,
    method: "POST",
  });
}
export function getCustomers(token) {
  return request("/v1/clientes", {
    token,
    method: "GET",
  });
}
export function updateCustomer(id, token) {
  return request(`/v1/clientes/${id}`, {
    token,
    method: "PUT",
  });
}
export function removeCustomer(id, token) {
  return request(`/v1/clientes/${id}`, {
    token,
    method: "DELETE",
  });
}
