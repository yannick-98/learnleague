import { useEffect, useRef, useCallback } from 'react'
import { GameWebSocket } from '@/lib/websocket'

type Handlers = Record<string, (data: Record<string, unknown>) => void>

interface UseWebSocketOptions {
  autoConnect?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useWebSocket(
  sessionCode: string | null | undefined,
  token: string | null | undefined,
  handlers: Handlers,
  options: UseWebSocketOptions = {}
) {
  const wsRef = useRef<GameWebSocket | null>(null)
  const handlersRef = useRef<Handlers>(handlers)
  const optionsRef = useRef(options)

  // Keep handlers ref up to date
  useEffect(() => {
    handlersRef.current = handlers
  })
  useEffect(() => {
    optionsRef.current = options
  })

  const connect = useCallback(async () => {
    if (!sessionCode || !token) return

    const ws = new GameWebSocket(sessionCode, token)

    // Register all current handlers
    Object.entries(handlersRef.current).forEach(([type, handler]) => {
      ws.on(type, handler)
    })

    ws.onConnect(() => optionsRef.current.onConnect?.())
    ws.onDisconnect(() => optionsRef.current.onDisconnect?.())

    try {
      await ws.connect()
      wsRef.current = ws
    } catch (err) {
      console.error('[useWebSocket] Connection failed:', err)
    }
  }, [sessionCode, token])

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect()
    wsRef.current = null
  }, [])

  const send = useCallback((message: object) => {
    wsRef.current?.send(message)
  }, [])

  useEffect(() => {
    if (options.autoConnect !== false) {
      connect()
    }
    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode, token])

  return { connect, disconnect, send, wsRef }
}
