# WebSocket Contract

Endpoint local:

```text
ws://localhost:8080/ws
```

El cliente debe enviar el JWT en el comando STOMP `CONNECT`:

```text
Authorization: Bearer <token>
```

Suscripcion por banda:

```text
/topic/bands/{bandId}/state
```

Comandos:

```text
/app/bands/{bandId}/command
```

Ejemplo para iniciar:

```json
{
  "type": "START_SESSION",
  "setlistId": 1,
  "activeItemId": 1
}
```

Ejemplos adicionales:

```json
{ "type": "SYNC_REQUEST" }
{ "type": "PLAY" }
{ "type": "PAUSE" }
{ "type": "CHANGE_SONG", "activeItemId": 2 }
{ "type": "SEEK", "positionMillis": 90000 }
{ "type": "SET_RATE", "playbackRate": 1.25 }
{ "type": "CLOSE_SESSION" }
```

La conexion, suscripcion y comandos requieren un JWT valido. La suscripcion requiere pertenecer a la banda y solo el lider puede modificar el estado.
