//Normaliza respuestas del backend para que coincidan con la estructura esperada del frontend
export const normalizeProduct = (product) => {
  return {
    id: product.idProducto,
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    stock: product.stock,
    modelo: product.modelo,
    marca: product.marca,
    color: product.color,
    categoria: product.categoria,
    categoriaId: product.categoria?.id, //
    fechaCreacion: product.fechaCreacion,
    estado: product.estado,
  };
};

export const normalizeCategory = (category) => {
  return {
    id: category.id || category.idCategoria,
    nombre: category.nombre,
  };
};

export const normalizeCustomer = (customer) => {
  return {
    id: customer.id || customer.idCustomer,
    nombre: customer.nombre,
    apellido: customer.apellido,
    email: customer.email,
    telefono: customer.telefono,
    dni: customer.dni,
    direccion: customer.direccion,
    fechaRegistro: customer.fechaRegistro,
    estado: customer.estado,
  };
};

export const normalizeOrder = (order) => {
  return {
    id: order.id,
    clienteId: order.clienteId,
    productoId: order.productoId,
    cantidad: order.cantidad,
    precioUnitario: order.precioUnitario,
    estado: order.estado,
  };
};

// Normaliza arrays de datos
export const normalizeArray = (data, normalizer) => {
  if (!Array.isArray(data)) return [];
  return data.map(normalizer);
};
