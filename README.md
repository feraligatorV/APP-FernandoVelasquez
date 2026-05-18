# APP-FernandoVelasquez
Aplicación web responsive para gestión de carrito de compras de artículos deportivos.

## Backend
Stack: `Java 21`, `Spring Boot`, `Spring Security + JWT`, `JPA/Hibernate`, `MySQL`, `Swagger/OpenAPI`.

Base URL local: `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Autenticación
- Se usa JWT tipo `Bearer`.
- Obtener token en `POST /api/auth/login` o `POST /api/auth/register`.
- En endpoints protegidos enviar header:

```http
Authorization: Bearer <TOKEN>
```

## Endpoints

### Auth
1. `POST /api/auth/register` (público)
- Registra usuario nuevo.
- Encripta password con BCrypt antes de guardar.

Ejemplo request:
```json
{
  "firstName": "Fernando",
  "lastName": "Velasquez",
  "shippingAddress": "Zona 10, Guatemala",
  "email": "fernando@example.com",
  "birthDate": "1995-03-12",
  "password": "Secreta123!"
}
```

Ejemplo response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

2. `POST /api/auth/login` (público)
- Autentica usuario existente y devuelve JWT.

Ejemplo request:
```json
{
  "email": "fernando@example.com",
  "password": "Secreta123!"
}
```

Ejemplo response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Usuarios
1. `GET /api/users/me` (protegido)
- Retorna perfil del usuario autenticado.

Ejemplo response:
```json
{
  "id": 1,
  "firstName": "Fernando",
  "lastName": "Velasquez",
  "shippingAddress": "Zona 10, Guatemala",
  "email": "fernando@example.com",
  "birthDate": "1995-03-12"
}
```

2. `PUT /api/users/me` (protegido, opcional)
- Actualiza perfil del usuario autenticado.

Ejemplo request:
```json
{
  "firstName": "Fernando",
  "lastName": "Velasquez",
  "shippingAddress": "Zona 14, Guatemala",
  "birthDate": "1995-03-12"
}
```

### Productos
1. `GET /api/products` (público)
- Lista catálogo de productos.

2. `POST /api/products` (protegido, opcional)
- Crea producto.

Ejemplo request:
```json
{
  "name": "Balon Futbol Pro",
  "description": "Balon oficial tamano 5",
  "price": 39.99,
  "imageUrl": "https://images.unsplash.com/photo-1614632537423-7e6c0d7eac40"
}
```

3. `PUT /api/products/{id}` (protegido, opcional)
- Actualiza producto por ID.

4. `DELETE /api/products/{id}` (protegido, opcional)
- Elimina producto por ID.

### Carrito y Pedidos
1. `GET /api/cart` (protegido)
- Muestra resumen actual del carrito del usuario autenticado.

2. `POST /api/cart/items` (protegido)
- Agrega producto al carrito.
- Si ya existe, incrementa cantidad.

Ejemplo request:
```json
{
  "productId": 1,
  "quantity": 2
}
```

3. `DELETE /api/cart/items/{cartItemId}` (protegido)
- Elimina un item del carrito.

4. `POST /api/cart/checkout` (protegido)
- Convierte carrito en orden y retorna `orderId`.

Ejemplo response:
```json
{
  "orderId": 5
}
```

5. `GET /api/orders` (protegido, opcional)
- Lista pedidos del usuario autenticado.

## Semilla de datos
- Al iniciar la app, si la tabla `products` está vacía, se generan productos aleatorios automáticamente.

## Configuración por variables de entorno
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS` (separado por comas)
- `SERVER_PORT`

Todos tienen valor por defecto en `application.properties` para entorno local.

## Observabilidad
- Healthcheck: `GET /actuator/health` (público)
- Info: `GET /actuator/info` (público)

## CORS
- Orígenes permitidos configurables con `CORS_ALLOWED_ORIGINS`.
- Valor por defecto local:
  - `http://localhost:3000`
  - `http://localhost:5173`
- Ejemplo:
```bash
export CORS_ALLOWED_ORIGINS="https://tu-frontend.app,https://preview.v0.dev"
```

## Validaciones de negocio
- Password de registro: mínimo 8 caracteres, máximo 72, al menos una mayúscula, una minúscula y un número.
- Email se normaliza a minúsculas en registro/login.
- Cantidad máxima por item en carrito: `99`.

## Respuestas de seguridad
- `401 Unauthorized`:
  - token ausente/inválido/expirado.
- `403 Forbidden`:
  - usuario autenticado sin permisos sobre un recurso.

## Tests
- Unit tests agregados:
  - `AuthServiceTest`
  - `ProductServiceTest`
  - `CartServiceTest`
- Integration tests agregados:
  - `AuthIntegrationTest`
  - `SecurityIntegrationTest`
  - `CartFlowIntegrationTest`

Ejecutar:
```bash
cd Backend
./mvnw test
```

Solo integración:
```bash
cd Backend
./mvnw -Dtest="*IntegrationTest" test
```

## Chuleta QA (rápida)

### Comandos clave
1. Ejecutar toda la suite:
```bash
cd Backend && ./mvnw test
```

2. Ejecutar solo integración:
```bash
cd Backend && ./mvnw -Dtest="*IntegrationTest" test
```

3. Ejecutar una clase:
```bash
cd Backend && ./mvnw -Dtest=CartFlowIntegrationTest test
```

4. Ejecutar un método:
```bash
cd Backend && ./mvnw -Dtest=CartFlowIntegrationTest#shouldCompleteCartCheckoutFlow test
```

5. Ver solo resumen final:
```bash
cd Backend && ./mvnw -q test
```

6. Limpiar y volver a correr todo:
```bash
cd Backend && ./mvnw clean test
```

### Cómo leer fallos
- `Failures`: la lógica no cumple lo esperado (regresión funcional).
- `Errors`: excepción o problema técnico/configuración.
- `BUILD SUCCESS`: no hay fallos.
- `BUILD FAILURE`: hay que revisar tests fallidos.

### Escenarios de regresión comunes
1. Seguridad rota: endpoint protegido responde `200` sin token.
- Detecta: `SecurityIntegrationTest`.

2. Login deja de normalizar email (`USER@MAIL.COM`).
- Detecta: `AuthIntegrationTest`.

3. Checkout deja de crear orden o vaciar carrito.
- Detecta: `CartFlowIntegrationTest`.

4. Regla de cantidad máxima en carrito se rompe.
- Detecta: `CartServiceTest`.

5. Registro deja de validar duplicado de email.
- Detecta: `AuthServiceTest`.

### Flujo de trabajo recomendado con QA
1. Reproducir bug reportado.
2. Crear/ajustar test que falle con ese bug.
3. Corregir código.
4. Correr `./mvnw test`.
5. Confirmar que el test nuevo pasa y no rompe el resto.

## Ejecución rápida
```bash
cd Backend
./mvnw spring-boot:run
```

## Frontend
Stack: `React + TypeScript`, `Vite`, `Material UI`, `Tailwind CSS`.

Ruta: `Frontend/`

### Variables de entorno
- `VITE_API_URL` (URL base del backend).

Ejemplo `.env`:
```bash
VITE_API_URL=http://localhost:8080
```

### Instalación y ejecución
```bash
cd Frontend
npm install
npm run dev
```

Build producción:
```bash
cd Frontend
npm run build
```

### Flujo funcional implementado
1. Productos públicos sin login.
2. Carrito invitado (guest cart) en `localStorage`.
3. Al iniciar sesión, el carrito invitado se sincroniza con backend.
4. Checkout requiere login.
5. Historial de pedidos con imagen de producto.
6. Perfil editable (`GET/PUT /api/users/me`).
7. Recuperación de contraseña:
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

### Rutas frontend
- Públicas:
  - `/products`
  - `/cart`
  - `/login`
  - `/register`
  - `/forgot-password`
- Protegidas:
  - `/orders`
  - `/profile`

## CI/CD (GitHub Actions)

Se agregaron dos workflows:

1. `CI`:
- Archivo: `.github/workflows/ci.yml`
- Corre en `push` y `pull_request` a `main`.
- Backend:
  - Java 21
  - `./mvnw test` con perfil `test` (`SPRING_PROFILES_ACTIVE=test`)
- Frontend:
  - Node 22
  - `npm ci`
  - `npm run build`

2. `Deploy Frontend to Vercel`:
- Archivo: `.github/workflows/deploy-frontend-vercel.yml`
- Corre en `push` a `main` cuando hay cambios en `Frontend/**`.
- Requiere secrets de GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### Configurar secrets para Vercel
1. En GitHub: `Repo -> Settings -> Secrets and variables -> Actions`.
2. Crear los tres secrets anteriores.
3. En Vercel, configurar variable de entorno del frontend:
   - `VITE_API_URL` con la URL pública del backend.
4. Hacer push a `main` para disparar CI y deploy.
