# AuraMusic API Bruno Collection

Coleccion Bruno para validar autenticacion, autorizacion, administracion, catalogo, bandas, setlists y el contrato WebSocket.

## Uso

1. Abrir esta carpeta desde Bruno.
2. Seleccionar el ambiente `local`.
3. Levantar el backend en `http://localhost:8080`.
4. Ejecutar `Auth / Login admin` primero.
5. Ejecutar `Auth / Register musician` y `Auth / Register solo` para guardar tokens de prueba.
6. Ejecutar las peticiones en orden para reutilizar los IDs capturados automaticamente.

La coleccion usa la cuenta local de evaluacion:

```text
admin@auramusic.local
AuraAdmin1!
```

No contiene credenciales de produccion ni secretos.

## Casos cubiertos

- Login y captura de JWT.
- Uso del JWT en endpoints protegidos.
- Registro valido para `MUSICIAN` y `SOLO`, e intento de registrar `ADMIN`.
- Logout e invalidacion del token.
- Validacion `422` al crear canciones.
- `401` sin token.
- Artistas globales de `ADMIN` y artistas propios de `MUSICIAN` y `SOLO`.
- Ownership de artistas y canciones, incluyendo respuestas `403`.
- `404` para recursos inexistentes.
- Catalogo paginado y filtrado.
- CRUD de canciones.
- CRUD de artistas.
- Bandas, integrantes, invitaciones, actualización, eliminación y liderazgo.
- Restriccion `403` para creación de banda por `SOLO`.
- Setlists, items, actualización, eliminación, reordenamiento, duplicación y duración.
- CRUD administrativo de usuarios y creación de cuentas `ADMIN`.
- Restricción `403` al usar rutas administrativas con un token que no sea `ADMIN`.

## Variables

Los valores dinamicos se guardan en el ambiente local durante la ejecucion:

- `token`
- `musicianToken`
- `soloToken`
- `artistId`
- `soloArtistId`
- `songId`
- `ownedSongId`
- `bandId`
- `inviteCode`
- `memberId`
- `setlistId`
- `itemId`
- `adminUserId`

## WebSocket

Bruno se utiliza para las peticiones HTTP. El contrato WebSocket esta documentado en `websocket-contract.md` y se prueba con dos clientes STOMP.

## Cobertura HTTP

La coleccion contiene consultas para todos los endpoints HTTP actuales:

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/auth/logout

GET    /api/admin/summary
GET    /api/admin/users
GET    /api/admin/users/{id}
POST   /api/admin/users
PUT    /api/admin/users/{id}
PUT    /api/admin/users/{id}/activate
DELETE /api/admin/users/{id}

GET    /api/artists
GET    /api/artists/{id}
POST   /api/artists
PUT    /api/artists/{id}
DELETE /api/artists/{id}

GET    /api/songs
GET    /api/songs/{id}
POST   /api/songs
PUT    /api/songs/{id}
DELETE /api/songs/{id}

GET    /api/bands
GET    /api/bands/{bandId}
POST   /api/bands
PUT    /api/bands/{bandId}
DELETE /api/bands/{bandId}
GET    /api/bands/{bandId}/members
POST   /api/bands/{bandId}/members
POST   /api/bands/join
PUT    /api/bands/{bandId}/members/{memberId}
DELETE /api/bands/{bandId}/members/{memberId}

GET    /api/setlists
GET    /api/setlists/{id}
POST   /api/setlists
PUT    /api/setlists/{id}
DELETE /api/setlists/{id}
POST   /api/setlists/{id}/items
PUT    /api/setlists/{id}/items/reorder
PUT    /api/setlists/{id}/items/{itemId}
DELETE /api/setlists/{id}/items/{itemId}
POST   /api/setlists/{id}/duplicate
```

## Orden recomendado

1. `Auth / Login admin`.
2. `Auth / Register musician` y `Auth / Register solo`.
3. `Artists / Create artist musician owned` y `Artists / Create artist solo owned`.
4. `Catalog / Create owned song`.
5. `Bands / Create band`, `Bands / Add member` y `Bands / Join band`.
6. `Setlists / Create setlist` y sus operaciones de items.
7. Ejecutar las consultas de actualización y eliminación de forma controlada, porque modifican datos.
8. Ejecutar `Security / Logout` al final, porque invalida el token usado en la sesión.

Las consultas que eliminan artistas, canciones, bandas o setlists son casos destructivos y no deben ejecutarse automáticamente en una validación repetible sin revisar sus variables.
