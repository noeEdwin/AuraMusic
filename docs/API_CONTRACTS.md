# API Contracts

## Auth API

Contratos iniciales para conectar el frontend de React con el backend Spring Boot.

### URLs

```text
Backend local: http://localhost:8080
Frontend local permitido por CORS: http://localhost:5173
Produccion: pendiente de definir con el dominio del VPS
```

### Roles

Roles globales de usuario:

```text
ADMIN
MUSICIAN
SOLO
```

- `ADMIN`: administrador global del sistema. No se registra publicamente.
- `MUSICIAN`: musico que puede crear o unirse a bandas.
- `SOLO`: musico solista con biblioteca y setlists personales.

El liderazgo de una banda no usa `users.role`. Se maneja con `bands.leader_user_id` y `band_members.member_role`.

### Credencial Admin De Prueba

```text
Email: admin@auramusic.local
Password: AuraAdmin1!
Role: ADMIN
```

### Auth Header

Las rutas protegidas deben enviar el JWT en el header:

```http
Authorization: Bearer <TOKEN>
```

## POST /api/auth/login

Inicia sesion con correo y contrasena.

### Request

```json
{
  "email": "admin@auramusic.local",
  "password": "AuraAdmin1!"
}
```

### Response 200

```json
{
  "token": "jwt...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "user": {
    "id": 1,
    "username": "admin.noe",
    "email": "admin@auramusic.local",
    "phone": "+529518695400",
    "displayName": "Noe Admin",
    "avatarUrl": "https://images.auramusic.local/avatars/admin-noe.png",
    "role": "ADMIN"
  }
}
```

## POST /api/auth/register

Registra una cuenta publica. Solo se permiten los roles `MUSICIAN` y `SOLO`.

No se permite registrar `ADMIN` desde este endpoint.

### Request

```json
{
  "username": "nuevo.musico",
  "email": "nuevo@auramusic.local",
  "phone": "+529518695421",
  "password": "AuraMusic1!",
  "displayName": "Nuevo Musico",
  "role": "MUSICIAN"
}
```

### Password Rules

```text
Minimo 8 caracteres
Al menos una mayuscula
Al menos un numero
Al menos un caracter especial
```

### Response 201

```json
{
  "token": "jwt...",
  "tokenType": "Bearer",
  "expiresIn": 3600000,
  "user": {
    "id": 13,
    "username": "nuevo.musico",
    "email": "nuevo@auramusic.local",
    "phone": "+529518695421",
    "displayName": "Nuevo Musico",
    "avatarUrl": null,
    "role": "MUSICIAN"
  }
}
```

## GET /api/auth/me

Devuelve el usuario autenticado.

### Request Headers

```http
Authorization: Bearer <TOKEN>
```

### Response 200

```json
{
  "id": 1,
  "username": "admin.noe",
  "email": "admin@auramusic.local",
  "phone": null,
  "displayName": "Noe Admin",
  "avatarUrl": "https://images.auramusic.local/avatars/admin-noe.png",
  "role": "ADMIN"
}
```

## POST /api/auth/logout

Invalida el token actual guardandolo en `revoked_tokens`.

### Request Headers

```http
Authorization: Bearer <TOKEN>
```

### Response 200

```json
{
  "message": "Sesion cerrada correctamente"
}
```

## Expected Error Shape

La estructura final se normalizara con `ControllerAdvice` en el siguiente bloque de backend.

Formato esperado para frontend:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Credenciales invalidas",
  "path": "/api/auth/login"
}
```

Codigos esperados:

```text
400: JSON invalido o request mal formado
401: credenciales invalidas, token ausente o token invalido
403: usuario autenticado sin permiso suficiente
409: email o username duplicado
422: validacion de campos
500: error inesperado
```

## Frontend Notes

- Guardar el token y enviarlo como `Authorization: Bearer <TOKEN>`.
- Usar `user.role` para proteger rutas globales.
- Usar `avatarUrl` si existe; si es `null`, mostrar avatar por defecto.
- No usar `alert()` ni `confirm()` nativos para errores o confirmaciones.
- Mostrar errores de validacion debajo del input correspondiente.
