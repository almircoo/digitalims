export const PERMISSIONS = {
  ROLES: {
    ADMIN: "ADMIN",
    USER: "USER",
  },

  // Action permissions - used by PermissionGuard
  CREATE_PRODUCT: "CREATE_PRODUCT",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",

  CREATE_CATEGORY: "CREATE_CATEGORY",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",

  CREATE_CUSTOMER: "CREATE_CUSTOMER",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",

  CREATE_ORDER: "CREATE_ORDER",
  UPDATE_ORDER: "UPDATE_ORDER",
  DELETE_ORDER: "DELETE_ORDER",
  UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",

  // Page access permissions
  PAGES: {
    DASHBOARD: ["ADMIN", "USER"],
    PRODUCTS: ["ADMIN", "USER"],
    CATEGORIES: ["ADMIN"],
    CUSTOMERS: ["ADMIN", "USER"],
    ORDERS: ["ADMIN", "USER"],
  },

  // Endpoint permissions mapping
  ENDPOINTS: {
    GET_PRODUCTS: ["ADMIN", "USER"],
    CREATE_PRODUCT: ["ADMIN"],
    UPDATE_PRODUCT: ["ADMIN"],
    DELETE_PRODUCT: ["ADMIN"],

    GET_CATEGORIES: ["ADMIN"],
    CREATE_CATEGORY: ["ADMIN"],
    UPDATE_CATEGORY: ["ADMIN"],
    DELETE_CATEGORY: ["ADMIN"],

    GET_CUSTOMERS: ["ADMIN"],
    CREATE_CUSTOMER: ["ADMIN", "USER"],
    UPDATE_CUSTOMER: ["ADMIN", "USER"],
    DELETE_CUSTOMER: ["ADMIN", "USER"],

    CREATE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER: ["ADMIN"],
    DELETE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER_STATUS: ["ADMIN"],
  },

  // Action to endpoint mapping
  ACTIONS: {
    CREATE_PRODUCT: ["ADMIN"],
    UPDATE_PRODUCT: ["ADMIN"],
    DELETE_PRODUCT: ["ADMIN"],

    CREATE_CATEGORY: ["ADMIN"],
    UPDATE_CATEGORY: ["ADMIN"],
    DELETE_CATEGORY: ["ADMIN"],

    CREATE_CUSTOMER: ["ADMIN", "USER"],
    UPDATE_CUSTOMER: ["ADMIN", "USER"],
    DELETE_CUSTOMER: ["ADMIN", "USER"],

    CREATE_ORDER: ["ADMIN", "USER"],
    UPDATE_ORDER: ["ADMIN"],
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
