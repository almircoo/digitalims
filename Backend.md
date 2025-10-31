# Arquitectura del Backend - ms-inventario-api

## Tabla de Contenidos
1. [Diagrama General del Sistema](#diagrama-general-del-sistema)
2. [Proceso de Autenticación](#proceso-de-autenticación)
3. [Endpoints por Módulo](#endpoints-por-módulo)
4. [Flujos de Negocio](#flujos-de-negocio)

---

## Diagrama General del Sistema

```shell
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Frontend)                       │
│                      (React 19 + Vite)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    API Gateway / Controllers                     │
│  ┌────────────┬──────────────┬─────────────┬──────────────────┐ │
│  │Auth        │Order         │Product      │Report            │ │
│  │Controller  │Controller    │Controller   │Controller        │ │
│  └────┬───────┴────┬─────────┴─────┬───────┴────────┬─────────┘ │
│       │            │               │                │            │
│  ┌────▼────────────▼───────────────▼────────────────▼──────────┐ │
│  │           Security Layer (JwtAuthenticationFilter)          │ │
│  │    - Validación de Token                                    │ │
│  │    - Inyección de Roles en SecurityContext                  │ │
│  │    - @PreAuthorize("hasAnyRole('ADMIN', 'USER')")          │ │
│  └────┬──────────────────────────────────────────────┬─────────┘ │
│       │                                               │            │
│  ┌────▼──────────────────────────────────────────────▼──────────┐ │
│  │              Business Services Layer                         │ │
│  │  ┌──────────────┬──────────────┬──────────────────────────┐ │ │
│  │  │OrderService  │ProductService│ReportService            │ │ │
│  │  │CustomerSrv   │CategorySrv    │                         │ │ │
│  │  │DetailsSrv    │               │                         │ │ │
│  │  └──────┬───────┴────┬──────────┴──────────┬──────────────┘ │ │
│  └─────────┼────────────┼─────────────────────┼────────────────┘ │
│            │            │                     │                   │
│  ┌─────────▼────────────▼─────────────────────▼────────────────┐ │
│  │           Repository Layer (JPA/Spring Data)               │ │
│  │  ┌──────────────┬──────────────┬──────────────────────────┐ │ │
│  │  │OrderRepository  ProductRepository  CustomerRepository  │ │ │
│  │  │                                                        │ │ │
│  │  │  - find, save, update, delete                         │ │ │
│  │  │  - findAllWithSpecification (Dynamic Queries)          │ │ │
│  │  │  - Custom Reports Queries                              │ │ │
│  │  └──────────────┬──────────────┬──────────────────────────┘ │ │
│  └─────────────────┼──────────────┼────────────────────────────┘ │
│                    │              │                               │
└────────────────────┼──────────────┼───────────────────────────────┘
                     │              │
         ┌───────────▼──────────────▼────────────┐
         │    PostgreSQL Database                 │
         │  ┌─────────────────────────────────┐  │
         │  │  Tables:                         │  │
         │  │  - users (Security)              │  │
         │  │  - roles (ADMIN, USER)           │  │
         │  │  - orders                        │  │
         │  │  - products                      │  │
         │  │  - customers                     │  │
         │  │  - details (Orden-Producto)      │  │
         │  │  - categories                    │  │
         │  │  - inventory                     │  │
         │  └─────────────────────────────────┘  │
         └────────────────────────────────────────┘
```

---

## Proceso de Autenticación

### Diagrama Secuencial: REGISTRO

```shell
┌─────────────┐                    ┌──────────────────┐              ┌─────────────┐
│   Cliente   │                    │  AuthController  │              │  AuthService│
└─────────────┘                    └──────────────────┘              └─────────────┘
      │                                    │                              │
      │  1. POST /v1/auth/register         │                              │
      │   {email, password, nombre, ...}   │                              │
      ├─────────────────────────────────────>                             │
      │                                    │  2. register(RegisterRequest)│
      │                                    ├─────────────────────────────>│
      │                                    │                              │
      │                                    │  3. Validar email único      │
      │                                    │  (UserRepository.exists)     │
      │                                    │<─ ✓ Email no registrado      │
      │                                    │                              │
      │                                    │  4. Encriptar Password       │
      │                                    │  (BCryptPasswordEncoder)     │
      │                                    │<─ ✓ Password encriptado      │
      │                                    │                              │
      │                                    │  5. Crear User Entity        │
      │                                    │  role = USER (default)       │
      │                                    │  6. Guardar User             │
      │                                    │  (userRepository.save)       │
      │                                    │<─ ✓ User guardado            │
      │                                    │                              │
      │                                    │  7. Crear Customer Record    │
      │                                    │  (asociar con userId)        │
      │                                    │  8. Guardar Customer         │
      │                                    │  (customerRepository.save)   │
      │                                    │<─ ✓ Customer guardado        │
      │                                    │                              │
      │                                    │  9. Generar JWT Token        │
      │                                    │     (JwtService.generateToken)
      │                                    │<─ Token generado             │
      │                                    │                              │
      │                                    │ 10. Retornar AuthResponse    │
      │     Response 201 CREATED           │     {token, type: Bearer}    │
      │  {id, email, role, cliente, ...}   │<─────────────────────────────│
      │<───────────────────────────────────┤                              │
      │                                    │                              │
```

### Diagrama Secuencial: LOGIN

```shell
┌─────────────┐                    ┌──────────────────┐              ┌──────────────┐
│   Cliente   │                    │  AuthController  │              │  AuthService │
└─────────────┘                    └──────────────────┘              └──────────────┘
      │                                    │                              │
      │  1. POST /v1/auth/login            │                              │
      │   {email, password}                │                              │
      ├─────────────────────────────────────>                             │
      │                                    │  2. authenticate(AuthRequest)│
      │                                    ├─────────────────────────────>│
      │                                    │                              │
      │                                    │  3. AuthenticationManager    │
      │                                    │     .authenticate(token)     │
      │                                    │     - Buscar usuario por email
      │                                    │     - Validar password       │
      │                                    │<─ ✓ Autenticación exitosa   │
      │                                    │                              │
      │                                    │  4. Generar JWT Token        │
      │                                    │  (JwtService.generateToken)  │
      │                                    │<─ Token generado             │
      │                                    │                              │
      │     Response 200 OK                │  5. Retornar AuthResponse    │
      │  {token, type: Bearer, email,...}  │<─────────────────────────────│
      │<───────────────────────────────────┤                              │
      │                                    │                              │
      │  6. Guardar Token (localStorage)   │                              │
      │  7. Incluir en requests futuros    │                              │
      │     Authorization: Bearer <token>  │                              │
      │                                    │                              │
```

### Diagrama de Flujo: Validación JWT en Requests

```shell
┌─────────────────────────────────────────────────────────────────────────┐
│                         Incoming HTTP Request                             │
│                    Authorization: Bearer <JWT_TOKEN>                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │ SecurityFilterChain     │
                    │ (Spring Security Core)  │
                    └────────────┬────────────┘
                                 │
                ┌────────────────▼────────────────┐
                │ JwtAuthenticationFilter         │
                │ (doFilterInternal)              │
                └────────────┬───────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Extract JWT from │
                    │ Header           │
                    │ "Authorization:  │
                    │  Bearer ..."     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────────┐
                    │ JWT válido?         │
                    │ (formato correcto)  │
                    └────────┬──────────┬─┘
                             │          │
                        Sí   │          │ No
                             │          └──> Continuar sin autenticación
                    ┌────────▼─────────────┐
                    │ Extraer email del JWT│
                    │ (JwtService.extract  │
                    │  Username)           │
                    └────────┬─────────────┘
                             │
                    ┌────────▼─────────────────┐
                    │ Cargar UserDetails      │
                    │ (UserDetailsServiceImpl) │
                    │ by email                │
                    └────────┬─────────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Validar Token         │
                    │ (JwtService.validate) │
                    │ - Email coincide      │
                    │ - Token no expirado   │
                    └────────┬──────────┬───┘
                             │          │
                        Sí   │          │ No
                             │          └──> Continuar sin autenticación
                    ┌────────▼──────────────────────┐
                    │ Crear UsernamePasswordAuth    │
                    │ Token con:                     │
                    │ - userDetails                  │
                    │ - authorities (roles)          │
                    │ - detalles de request          │
                    └────────┬─────────────────────┘
                             │
                    ┌────────▼─────────────────┐
                    │ Establecer en            │
                    │ SecurityContextHolder    │
                    │ (Request autenticado)    │
                    └────────┬─────────────────┘
                             │
                    ┌────────▼─────────────────┐
                    │ Proceder al controlador  │
                    │ - @PreAuthorize checks   │
                    │   roles del usuario      │
                    └─────────────────────────┘
```

### Componentes del Flujo de Autenticación

#### 1. **User Entity** (Seguridad)
```shell
┌─────────────────────────┐
│ User (Entity)           │
├─────────────────────────┤
│ - id (Long)             │
│ - email (String)        │ ← Identificador único
│ - password (String)     │ ← Encriptado con BCrypt
│ - role (Role)           │ ← ADMIN / USER
│ - enabled (Boolean)     │
│ - createdAt (DateTime)  │
└─────────────────────────┘
```

#### 2. **Role Entity** (Enum)
```shell
┌──────────────────────────┐
│ Role (Enum)              │
├──────────────────────────┤
│ ADMIN  → Acceso completo │
│ USER   → Acceso limitado │
└──────────────────────────┘
```

#### 3. **JWT Token Structure**
```shell
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Claims):
{
  "sub": "user@email.com",        ← username/email
  "iat": 1634567890,              ← issued at
  "exp": 1634654290               ← expiration
}

Signature: HS256(header.payload, secretKey)
```

#### 4. **SecurityConfig Beans**
- **PasswordEncoder**: BCryptPasswordEncoder (encriptación de passwords)
- **AuthenticationManager**: Autentica credenciales
- **AuthenticationProvider**: DaoAuthenticationProvider con UserDetailsService
- **SecurityFilterChain**: Configuración de rutas públicas/privadas

---

## Endpoints por Módulo

### MÓDULO 1: AUTENTICACIÓN

#### **POST /v1/auth/register**
```shell
Propósito: Registrar nuevo usuario

Flujo de Componentes:
┌─────────────────────────────────────────────────────────────┐
│ 1. AuthController.register(RegisterRequest)                 │
│    └─> Input: {email, password, nombre, apellido, dni, ...} │
│                                                              │
│ 2. AuthService.register(RegisterRequest)                    │
│    ├─> UserRepository.existsByEmail(email)                  │
│    │   └─> ¿Email ya existe? → Excepción                    │
│    │                                                         │
│    ├─> PasswordEncoder.encode(password)                     │
│    │   └─> Encripta contraseña con BCrypt                   │
│    │                                                         │
│    ├─> User.builder()                                       │
│    │   └─> Email, password encriptado, role=USER            │
│    │                                                         │
│    ├─> UserRepository.save(user)                            │
│    │   └─> Persiste en tabla 'users'                        │
│    │       INSERT INTO users (email, password, role)        │
│    │                                                         │
│    ├─> setCustomerRegistry(userId, RegisterRequest)        │
│    │   ├─> Customer.builder()                               │
│    │   │   └─> userId, dni, nombre, apellido, email, ...   │
│    │   └─> CustomerRepository.save(customer)                │
│    │       └─> Persiste en tabla 'customers'                │
│    │           INSERT INTO customers (userId, dni, ...)     │
│    │                                                         │
│    ├─> JwtService.generateToken(user)                       │
│    │   └─> Crea JWT con claims: sub=email, exp=...         │
│    │                                                         │
│    └─> Retorna AuthResponse                                 │
│        {id, email, role, token, type: "Bearer", cliente}    │
│                                                              │
│ 3. Retorna HTTP 200 OK                                       │
└─────────────────────────────────────────────────────────────┘

Seguridad:
- Sin autenticación requerida (@permitAll)
- Validación de email único
- Password encriptado antes de guardar

Base de Datos:
INSERT INTO users (email, password, role, enabled) 
VALUES (?, ?, 'ROLE_USER', true);

INSERT INTO customers (user_id, dni, nombre, apellido, email, estado)
VALUES (?, ?, ?, ?, ?, true);
```

#### **POST /v1/auth/login**
```shell
Propósito: Autenticar usuario y obtener JWT

Flujo de Componentes:
┌─────────────────────────────────────────────────────────────┐
│ 1. AuthController.authenticate(AuthRequest)                 │
│    └─> Input: {email, password}                             │
│                                                              │
│ 2. AuthService.authenticate(AuthRequest)                    │
│    ├─> AuthenticationManager.authenticate(token)            │
│    │   └─> UsernamePasswordAuthenticationToken              │
│    │       (email, password)                                │
│    │                                                         │
│    ├─> DaoAuthenticationProvider                            │
│    │   ├─> UserDetailsServiceImpl.loadUserByUsername(email) │
│    │   │   └─> Busca usuario en tabla 'users'               │
│    │   │       SELECT * FROM users WHERE email = ?          │
│    │   │                                                     │
│    │   └─> PasswordEncoder.matches(password, hashed)        │
│    │       └─> ¿Password coincide? → Excepción si no        │
│    │                                                         │
│    ├─> UserRepository.findByEmail(email)                    │
│    │   └─> Obtiene User entity                              │
│    │                                                         │
│    ├─> JwtService.generateToken(user)                       │
│    │   └─> Crea JWT firmado con secretKey                   │
│    │                                                         │
│    └─> Retorna AuthResponse                                 │
│        {id, email, role, token, type: "Bearer"}             │
│                                                              │
│ 3. Retorna HTTP 200 OK                                       │
└─────────────────────────────────────────────────────────────┘

Seguridad:
- Sin autenticación requerida (@permitAll)
- Validación de credenciales en AuthenticationManager
- JWT válido solo por tiempo configurado (jwt.expiration-time)

Base de Datos Query:
SELECT id, email, password, role FROM users WHERE email = ?;
(password encriptado se valida en PasswordEncoder.matches)
```

---

### MÓDULO 2: ÓRDENES/PEDIDOS

#### **GET /v1/pedidos**
```shell
Propósito: Listar pedidos con paginación

Flujo de Componentes:
┌──────────────────────────────────────────────────────────────┐
│ 1. JwtAuthenticationFilter (Intercept)                       │
│    ├─> Extrae JWT del header Authorization                  │
│    ├─> Valida token y carga UserDetails                     │
│    └─> Establece en SecurityContext (Auth object)           │
│                                                              │
│ 2. OrderController.getAll(page, size, authentication)       │
│    └─> @PreAuthorize("hasAnyRole('ADMIN', 'USER')")        │
│        ✓ Usuario tiene rol? → Continuar                     │
│        ✗ Sin rol requerido? → 403 Forbidden                 │
│                                                              │
│ 3. OrderService.findAll(page, size, authentication)         │
│    ├─> Crear Pageable(page, size)                           │
│    │   └─> PageRequest.of(0, 10)                            │
│    │                                                         │
│    ├─> extractUserIdFromAuthentication(authentication)      │
│    │   └─> si USER: get userId del token                    │
│    │   └─> si ADMIN: null (ver todos)                       │
│    │                                                         │
│    ├─> OrderSpecification.build(userId)                     │
│    │   └─> Crea Specification<Order> con criterios          │
│    │       WHERE user_id = ? OR user_id IS NULL             │
│    │                                                         │
│    └─> OrderRepository.findAll(specification, pageable)     │
│        └─> Ejecuta Query SQL:                               │
│            SELECT * FROM orders                              │
│            WHERE user_id = ? OR user_id IS NULL             │
│            LIMIT 10 OFFSET 0;                               │
│                                                              │
│ 4. OrderMapper.toResponse(Order entity list)                │
│    └─> Convierte entities a DTOs                            │
│        ├─> id, estado, total, fechaPedido, etc.             │
│        ├─> cliente {id, nombre, email}                      │
│        └─> detalles [{producto, cantidad, precio}]          │
│                                                              │
│ 5. Retorna Payload<Page<OrderResponse>>                     │
│    {                                                         │
│      data: {                                                 │
│        content: [OrderResponse, ...],                        │
│        totalElements: 8,                                     │
│        totalPages: 1,                                        │
│        currentPage: 0,                                       │
│        pageSize: 10                                          │
│      }                                                       │
│    }                                                         │
│                                                              │
│ 6. Retorna HTTP 200 OK                                       │
└──────────────────────────────────────────────────────────────┘

Seguridad:
- Requiere autenticación JWT
- USER ve solo sus pedidos (filtrado por userId)
- ADMIN ve todos los pedidos

Base de Datos Query:
SELECT o.* FROM orders o
WHERE o.user_id = ? OR ? IS NULL
LIMIT ? OFFSET ?;
```

#### **POST /v1/pedidos**
```shell
Propósito: Crear nuevo pedido

Flujo de Componentes:
┌──────────────────────────────────────────────────────────────┐
│ 1. JwtAuthenticationFilter (Validar Token)                   │
│    └─> Token válido → Continuar                             │
│                                                              │
│ 2. OrderController.create(OrderRequest)                     │
│    └─> @PreAuthorize("hasAnyRole('ADMIN', 'USER')")        │
│    └─> Input: {cliente: {id}, detalles: [{...}], total}    │
│                                                              │
│ 3. OrderService.save(OrderRequest)                          │
│    ├─> Validar cliente existe                               │
│    │   └─> CustomerRepository.findById(clienteId)           │
│    │       ¿Existe? → Continuar ✓                           │
│    │       ¿No existe? → ResourceNotFoundException           │
│    │                                                         │
│    ├─> For each detalle en OrderRequest                     │
│    │   ├─> Obtener Product                                  │
│    │   │   └─> ProductRepository.findById(productoId)       │
│    │   │                                                     │
│    │   ├─> Validar Stock                                    │
│    │   │   └─> product.stock >= cantidad?                   │
│    │   │       No → InsufficientStockException               │
│    │   │                                                     │
│    │   ├─> Descontar Stock                                  │
│    │   │   └─> product.stock -= cantidad                    │
│    │   │   └─> ProductRepository.save(product)              │
│    │   │                                                     │
│    │   └─> Crear Detail entity                              │
│    │       └─> Detail.builder()                             │
│    │           ├─> orden, producto, cantidad, precio        │
│    │           └─> subtotal = precio * cantidad             │
│    │                                                         │
│    ├─> Crear Order entity                                   │
│    │   └─> Order.builder()                                  │
│    │       ├─> cliente, estado=PENDIENTE                    │
│    │       ├─> total = sum(detalles.subtotal)               │
│    │       ├─> fechaPedido = now()                          │
│    │       └─> detalles list                                │
│    │                                                         │
│    ├─> OrderRepository.save(order)                          │
│    │   └─> INSERT INTO orders (cliente_id, estado, ...)     │
│    │   └─> INSERT INTO details (orden_id, producto_id, ...) │
│    │                                                         │
│    └─> OrderMapper.toResponse(order)                        │
│        └─> Retorna DTO con id, detalles, etc.               │
│                                                              │
│ 4. Retorna HTTP 201 CREATED                                  │
│    {data: OrderResponse}                                     │
└──────────────────────────────────────────────────────────────┘

Seguridad:
- Requiere autenticación JWT
- Rol: ADMIN, USER

Base de Datos Queries:
BEGIN TRANSACTION;

INSERT INTO orders (cliente_id, estado, total, fecha_pedido)
VALUES (?, 'PENDIENTE', ?, NOW());

INSERT INTO details (order_id, producto_id, cantidad, precio)
VALUES (?, ?, ?, ?);

UPDATE products SET stock = stock - ?
WHERE id = ?;

COMMIT;
\`\`\`

#### **PATCH /v1/pedidos/{id}/estado**
\`\`\`
Propósito: Cambiar estado del pedido

Flujo de Componentes:
┌──────────────────────────────────────────────────────────────┐
│ 1. OrderController.updateStatus(id, estado)                 │
│    └─> @PreAuthorize("hasAnyRole('ADMIN', 'USER')")        │
│    └─> @RequestParam OrderStatus estado (ENUM)             │
│        Valores válidos: PENDIENTE, ENTREGADO, CANCELADO     │
│                                                              │
│ 2. OrderService.updateStatus(Long id, OrderStatus estado)  │
│    ├─> OrderRepository.findById(id)                         │
│    │   └─> SELECT * FROM orders WHERE id = ?                │
│    │   └─> ¿Existe? → Continuar ✓                          │
│    │   └─> ¿No existe? → ResourceNotFoundException           │
│    │                                                         │
│    ├─> Validar transición de estado                         │
│    │   └─> order.getEstado().canTransitionTo(newEstado)    │
│    │       Reglas:                                          │
│    │       PENDIENTE → ENTREGADO, CANCELADO ✓               │
│    │       ENTREGADO → Solo lectura ✗                       │
│    │       CANCELADO → Solo lectura ✗                       │
│    │       InvalidStatusTransitionException si inválido      │
│    │                                                         │
│    ├─> Si nuevo estado = CANCELADO                          │
│    │   └─> Restaurar stock de productos                     │
│    │       For each detail en order:                        │
│    │       ├─> product.stock += detail.cantidad             │
│    │       └─> ProductRepository.save(product)              │
│    │                                                         │
│    ├─> order.setEstado(estado)                              │
│    ├─> order.setFechaActualizacion(now())                   │
│    ├─> OrderRepository.save(order)                          │
│    │   └─> UPDATE orders SET estado = ? WHERE id = ?        │
│    │                                                         │
│    └─> OrderMapper.toResponse(order)                        │
│                                                              │
│ 3. Retorna HTTP 200 OK                                       │
│    {data: OrderResponse con nuevo estado}                    │
└──────────────────────────────────────────────────────────────┘

Seguridad:
- Requiere autenticación JWT
- Rol: ADMIN, USER

Validaciones:
- Orden debe existir
- Transición de estado válida
- Integridad de stock en cancelaciones
```

#### **PUT /v1/pedidos/{id}**
\`\`\`
Propósito: Actualizar pedido completo

Similar a POST pero:
- Actualiza datos existentes
- Requiere que la orden exista
- Valida cambios en detalles y totales
\`\`\`

#### **DELETE /v1/pedidos/{id}**
\`\`\`
Propósito: Eliminar pedido

Seguridad:
- @PreAuthorize("hasRole('ADMIN')") → Solo ADMIN
- Usuario normal no puede eliminar

Operación:
- Restaurar stock de productos
- Eliminar detalles asociados
- Eliminar orden
\`\`\`

---

### MÓDULO 3: PRODUCTOS

#### **GET /v1/productos**
\`\`\`
Propósito: Listar productos con filtros

Parámetros:
- page: 0 (default)
- size: 10 (default)
- nombre: filtro por nombre
- descripcion: filtro por descripción
- stock: comparación de stock
- precio: comparación de precio
- fechaRegistro: rango de fechas
- estado: true/false (activo/inactivo)

Flujo:
1. ProductController.findAllWithFilters(filters)
2. ProductService.findAll(page, size, filterMap)
   ├─> ProductSpecification.buildSpecification(filters)
   │   └─> Crea criterios dinámicos según parámetros
   └─> ProductRepository.findAll(spec, pageable)
3. Retorna Payloads<List<ProductResponse>>
\`\`\`

#### **GET /v1/productos/{id}**
\`\`\`
Propósito: Obtener detalles de un producto

Operación:
1. ProductRepository.findById(id)
2. Retorna ProductResponse con:
   - id, nombre, descripcion
   - precio, stock, estado
   - categoria, fechaRegistro
   - inventario (si aplica)
\`\`\`

#### **POST /v1/productos**
\`\`\`
Propósito: Crear nuevo producto

Seguridad:
- Sin @PreAuthorize específica (heredada del controlador)
- Acceso: ADMIN, USER

Flujo:
1. Validar que categoria existe
2. Crear Product entity
3. Crear o actualizar Inventory
4. Guardar en base de datos
\`\`\`

#### **PUT /v1/productos/{id}**
\`\`\`
Propósito: Actualizar producto

Seguridad:
- @PreAuthorize("hasRole('ADMIN')") → Solo ADMIN

Operación:
1. Obtener producto actual
2. Actualizar campos: nombre, descripcion, precio, etc.
3. Validar cambios en stock
4. Guardar cambios
\`\`\`

#### **DELETE /v1/productos/{id}**
\`\`\`
Propósito: Eliminar producto

Seguridad:
- @PreAuthorize("hasRole('ADMIN')") → Solo ADMIN

Validaciones:
- No eliminar si hay órdenes pendientes con este producto
- Marcar como inactivo (soft delete recomendado)
\`\`\`

---

### MÓDULO 4: CLIENTES

#### **GET /v1/clientes**
\`\`\`
Similar a productos con filtros dinámicos:
- nombre, apellido, dni, email, telefono
- fechaRegistro, direccion, estado

Retorna: Payloads<List<CustomerResponse>>
\`\`\`

#### **POST /v1/clientes**
\`\`\`
Propósito: Registrar nuevo cliente

Operación:
1. Validar email único
2. Validar DNI único
3. Crear Customer entity
4. Asociar con usuario (userId)
5. Guardar en base de datos
\`\`\`

#### **PUT /v1/clientes/{id}**
\`\`\`
Propósito: Actualizar datos del cliente

Datos actualizables:
- nombre, apellido, telefono, direccion
- email, estado
\`\`\`

#### **DELETE /v1/clientes/{id}**
\`\`\`
Propósito: Eliminar cliente

Seguridad:
- @PreAuthorize("hasRole('ADMIN')") → Solo ADMIN

Validaciones:
- No eliminar si hay órdenes asociadas
- Opción: Marcar como inactivo en su lugar
\`\`\`

---

### MÓDULO 5: REPORTES (ADMIN ONLY)

#### **GET /v1/reportes/dashboard**
\`\`\`
Propósito: Dashboard con métricas generales

Parámetros:
- fechaInicio: LocalDateTime (ISO format)
- fechaFin: LocalDateTime (ISO format)

Seguridad:
- @PreAuthorize("hasRole('ADMIN')") → Solo ADMIN

Flujo:
1. ReportService.obtenerDashboardVentas(inicio, fin)
   ├─> reporteService.reporteVentasPorPeriodo()
   ├─> Calcular total vendido
   ├─> Calcular cantidad de órdenes
   ├─> Calcular promedio por orden
   └─> Retorna ReportResponse con métricas

Métricas incluidas:
- totalVentas: sum(order.total) 
- cantidadOrdenes: count(orders)
- promedioOrden: totalVentas / cantidadOrdenes
- cantidadProductos: count(productos vendidos)
\`\`\`

#### **GET /v1/reportes/ventas/periodo**
\`\`\`
Propósito: Reporte de ventas en rango de fechas

Query:
SELECT 
  COUNT(DISTINCT o.id) as cantidadOrdenes,
  SUM(o.total) as totalVentas,
  AVG(o.total) as promedioVenta
FROM orders o
WHERE o.fecha_pedido BETWEEN ? AND ?
  AND o.estado = 'ENTREGADO';
\`\`\`

#### **GET /v1/reportes/ventas/producto**
\`\`\`
Propósito: Productos más vendidos en período

Retorna: Page<Object[]> con paginación

Query:
SELECT 
  p.id,
  p.nombre,
  SUM(d.cantidad) as totalVendido,
  SUM(d.cantidad * d.precio) as ingresos
FROM products p
JOIN details d ON p.id = d.producto_id
JOIN orders o ON d.orden_id = o.id
WHERE o.fecha_pedido BETWEEN ? AND ?
  AND o.estado = 'ENTREGADO'
GROUP BY p.id, p.nombre
ORDER BY SUM(d.cantidad) DESC
LIMIT 10;
\`\`\`

#### **GET /v1/reportes/clientes/top**
\`\`\`
Propósito: Top clientes por gasto

Retorna: Page<CustomerSould>

Query:
SELECT new com.gussoft.inventario.intregation.transfer.record.CustomerSould(
  c.idCliente,
  c.nombre,
  c.apellido,
  c.email,
  COUNT(o),
  SUM(o.total)
)
FROM Order o
JOIN o.cliente c
WHERE o.fechaPedido BETWEEN ? AND ?
  AND o.estado = 'ENTREGADO'
GROUP BY c.idCliente, c.nombre, c.apellido, c.email
ORDER BY SUM(o.total) DESC
LIMIT 10;
\`\`\`

#### **Otros Reportes**
- `/v1/reportes/ventas/categoria` - Ventas por categoría
- `/v1/reportes/ventas/cliente` - Ventas por cliente
- `/v1/reportes/productos/mas-vendidos` - Top productos
- `/v1/reportes/productos/stock-bajo` - Stock bajo mínimo
- `/v1/reportes/clientes/frecuentes` - Clientes más frecuentes
- `/v1/reportes/clientes/mejor-compra` - Clientes mejor compra

---

## Flujos de Negocio Completos

### Flujo: Crear Orden Completa

```shell
Usuario (ADMIN/USER)
      │
      ├─> 1. POST /v1/auth/login
      │       └─> Obtiene JWT Token
      │
      ├─> 2. POST /v1/pedidos
      │       Headers: Authorization: Bearer <JWT>
      │       Body: {
      │         cliente: {id: 1},
      │         detalles: [
      │           {productoId: 10, cantidad: 2},
      │           {productoId: 15, cantidad: 1}
      │         ],
      │         total: 150.00
      │       }
      │
      │   Procesamiento Backend:
      │   ├─> JwtAuthenticationFilter
      │   │   └─> Valida y carga usuario en SecurityContext
      │   │
      │   ├─> OrderController.create()
      │   │
      │   ├─> OrderService.save()
      │   │   ├─> Para cada producto en detalles:
      │   │   │   ├─> Obtener producto
      │   │   │   ├─> Validar stock ≥ cantidad
      │   │   │   ├─> Restar stock
      │   │   │   └─> Crear detail
      │   │   │
      │   │   ├─> Crear orden con estado PENDIENTE
      │   │   ├─> Calcular total
      │   │   └─> Persistir (transacción)
      │   │
      │   └─> Respuesta: 201 CREATED con OrderResponse
      │
      ├─> 3. PATCH /v1/pedidos/{idOrder}/estado?estado=ENTREGADO
      │       (Usuario ADMIN/autorizado)
      │
      │   Procesamiento Backend:
      │   ├─> Obtener orden
      │   ├─> Validar transición PENDIENTE → ENTREGADO
      │   ├─> Actualizar estado
      │   └─> Respuesta: 200 OK
      │
      └─> 4. GET /v1/reportes/dashboard
              ?fechaInicio=2025-01-01T00:00:00
              &fechaFin=2025-12-31T23:59:59
              
          (Solo ADMIN)
          
          Respuesta: 200 OK
          {
            "data": {
              "totalVentas": 150.00,
              "cantidadOrdenes": 1,
              "promedioOrden": 150.00
            }
          }
```

---

## Mapeo de Excepciones → Respuestas HTTP

\`\`\`
BusinessException
├─> HTTP 400 BAD REQUEST
├─> Mensaje: "El email ya está registrado"
└─> Usado en: register, validaciones

ResourceNotFoundException
├─> HTTP 404 NOT FOUND
├─> Mensaje: "Order no encontrada con ID: 123"
└─> Usado en: findById, update, delete

InsufficientStockException
├─> HTTP 409 CONFLICT
├─> Mensaje: "Stock insuficiente para producto: X"
└─> Usado en: crear orden

InvalidStatusTransitionException
├─> HTTP 422 UNPROCESSABLE ENTITY
├─> Mensaje: "Transición inválida de PENDIENTE a PENDIENTE"
└─> Usado en: updateStatus

FieldInvalidException
├─> HTTP 400 BAD REQUEST
├─> Mensaje: Detalles de validación
└─> Usado en: Validaciones de entrada
\`\`\`

---

## Estructura de Respuestas

### Éxito - 200 OK
\`\`\`json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "USER",
    "token": "eyJhbGc...",
    "type": "Bearer"
  }
}
\`\`\`

### Éxito - 201 CREATED
\`\`\`json
{
  "data": {
    "idPedido": 12345,
    "estado": "PENDIENTE",
    "total": 150.00,
    "fechaPedido": "2025-01-15T10:30:00"
  }
}
\`\`\`

### Error - 400 BAD REQUEST
\`\`\`json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Validación fallida",
  "details": {
    "email": "El email es requerido"
  }
}
\`\`\`

### Error - 404 NOT FOUND
\`\`\`json
{
  "status": 404,
  "error": "RESOURCE_NOT_FOUND",
  "message": "Order no encontrada con ID: 9999"
}
\`\`\`

### Error - 403 FORBIDDEN
\`\`\`json
{
  "status": 403,
  "error": "ACCESS_DENIED",
  "message": "No tiene permisos para acceder a este recurso"
}
\`\`\`

---

## Resumen de Capas

| Capa | Componentes | Responsabilidad |
|------|-------------|-----------------|
| **API** | Controllers | Exponer endpoints HTTP |
| **Security** | Filter, JwtService, AuthService | Autenticación y autorización |
| **Business** | Services | Lógica de negocio, validaciones |
| **Data Access** | Repositories, Specifications | Consultas a BD |
| **Models** | Entities, DTOs, Requests/Responses | Representación de datos |
| **Config** | SecurityConfig, CorsConfig | Configuración global |
| **Exception** | GlobalExceptionHandler | Manejo de errores |
| **Mapping** | Mappers | Conversión Entity ↔ DTO |

---

## Conclusión

Este backend implementa una arquitectura robusta de tres capas (Controller → Service → Repository) con:
- Seguridad basada en JWT
- Validaciones de negocio
- Paginación y filtrados dinámicos
- Manejo consistente de excepciones
- Reportes analíticos complejos
