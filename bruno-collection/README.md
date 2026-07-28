# AuraMusic API Bruno Collection

Coleccion Bruno para validar autenticacion, autorizacion, catalogo, bandas, setlists y el contrato WebSocket.

## Uso

1. Abrir esta carpeta desde Bruno.
2. Seleccionar el ambiente `local`.
3. Levantar el backend en `http://localhost:8080`.
4. Ejecutar `Auth / Login admin` primero.
5. Ejecutar `Auth / Register musician` para guardar un token de usuario `MUSICIAN`.
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
- Registro valido e intento de registrar `ADMIN`.
- Validacion `422` al crear canciones.
- `401` sin token.
- `403` al crear artistas como `MUSICIAN`.
- `404` para recursos inexistentes.
- Catalogo paginado y filtrado.
- CRUD de canciones.
- CRUD de artistas.
- Bandas, integrantes e invitaciones.
- Setlists, items, reordenamiento, duplicacion y duracion.

## Variables

Los valores dinamicos se guardan en el ambiente local durante la ejecucion:

- `token`
- `musicianToken`
- `songId`
- `bandId`
- `setlistId`
- `itemId`

## WebSocket

Bruno se utiliza para las peticiones HTTP. El contrato WebSocket esta documentado en `websocket-contract.md` y se prueba con dos clientes STOMP.
