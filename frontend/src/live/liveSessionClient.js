import { Client } from '@stomp/stompjs'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function getWebSocketUrl() {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  return `${baseUrl.replace(/^http/, 'ws')}/ws`
}

export function createLiveSessionClient({ bandId, token, onConnectionChange, onError, onState }) {
  const client = new Client({
    brokerURL: getWebSocketUrl(),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(`/topic/bands/${bandId}/state`, (message) => {
        onState(JSON.parse(message.body))
      })
      onConnectionChange('connected')
    },
    onDisconnect: () => onConnectionChange('disconnected'),
    onStompError: (frame) => {
      onConnectionChange('error')
      onError(frame.headers.message || 'La sesion en vivo rechazo la operacion.')
    },
    onWebSocketClose: () => onConnectionChange('disconnected'),
    onWebSocketError: () => {
      onConnectionChange('error')
      onError('No fue posible conectar con la sesion en vivo.')
    },
  })

  return {
    connect() {
      onConnectionChange('connecting')
      client.activate()
    },
    disconnect() {
      return client.deactivate()
    },
    publish(command) {
      if (!client.connected) return false

      client.publish({
        destination: `/app/bands/${bandId}/command`,
        body: JSON.stringify(command),
      })
      return true
    },
  }
}
