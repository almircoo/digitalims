export const PERMISSIONS = {
  ROLES: {
    ADMIN: "ADMIN",
    USER: "USER",
  },

  // permsisos y acciones usado por PermissionGuard
  CREATE_PRODUCT: "CREATE_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  VIEW_PRODUCT: "VIEW_PRODUCT",

  CREATE_CATEGORY: "CREATE_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",
  VIEW_CATEGORY: "VIEW_CATEGORY",

  CREATE_CUSTOMER: "CREATE_CUSTOMER",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",
  VIEW_CUSTOMER: "VIEW_CUSTOMER",

  CREATE_ORDER: "CREATE_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  DELETE_ORDER: "DELETE_ORDER",
  UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",
  VIEW_ORDER: "VIEW_ORDER",

  // permisos de accesos a paginas
  PAGES: {
    DASHBOARD: ["ADMIN", "USER"],
    PRODUCTS: ["ADMIN", "USER"],
    CATEGORIES: ["ADMIN"],
    CUSTOMERS: ["ADMIN", "USER"],
    ORDERS: ["ADMIN", "USER"],
  },

  // Enpoint mapea dataMapper - sincronizado con backend
  ENDPOINTS: {
    GET_PRODUCTS: ["ADMIN", "USER"],
    CREATE_PRODUCT: ["ADMIN"],
    UPDATE_PRODUCT: ["ADMIN"],
    DELETE_PRODUCT: ["ADMIN"],

    GET_CATEGORIES: ["ADMIN"],
    CREATE_CATEGORY: ["ADMIN"],
    UPDATE_CATEGORY: ["ADMIN"],
    DELETE_CATEGORY: ["ADMIN"],

    GET_CUSTOMERS: ["ADMIN", "USER"],
    CREATE_CUSTOMER: ["ADMIN", "USER"],
    UPDATE_CUSTOMER: ["ADMIN", "USER"],
    DELETE_CUSTOMER: ["ADMIN"],

    CREATE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER: ["ADMIN", "USER"],
    DELETE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER_STATUS: ["ADMIN"],
  },

  // Accion que permite mapear -
  ACTIONS: {
    VIEW_PRODUCT: ["ADMIN", "USER"],
    CREATE_PRODUCT: ["ADMIN"],
    UPDATE_PRODUCT: ["ADMIN"],
    DELETE_PRODUCT: ["ADMIN"],

    VIEW_CATEGORY: ["ADMIN"],
    CREATE_CATEGORY: ["ADMIN"],
    UPDATE_CATEGORY: ["ADMIN"],
    DELETE_CATEGORY: ["ADMIN"],

    VIEW_CUSTOMER: ["ADMIN", "USER"],
    CREATE_CUSTOMER: ["ADMIN", "USER"],
    UPDATE_CUSTOMER: ["ADMIN", "USER"],
    DELETE_CUSTOMER: ["ADMIN"],

    CREATE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER: ["ADMIN", "USER"],
    DELETE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER_STATUS: ["ADMIN"],
  },
};

export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;
  return requiredRoles.includes(userRole);
};

export const canAccess = (userRole, action) => {
  const requiredRoles = PERMISSIONS.ACTIONS[action];
  return hasPermission(userRole, requiredRoles);
};

export const canPerformAction = (userRole, action) => {
  return canAccess(userRole, action);
};
