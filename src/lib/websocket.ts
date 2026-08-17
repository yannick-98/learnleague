type MessageHandler = (data: Record<string, unknown>) => void

export class GameWebSocket {
  protected ws: WebSocket | null = null
  protected sessionCode: string
  protected token: string
  protected handlers: Map<string, MessageHandler> = new Map()
  protected reconnectAttempts = 0
  protected maxReconnects = 5
  protected reconnectDelay = 1000
  protected shouldReconnect = true
  private onConnectCallback?: () => void
  private onDisconnectCallback?: () => void

  constructor(sessionCode: string, token: string) {
    this.sessionCode = sessionCode
    this.token = token
  }

  protected buildUrl(): string {
    const wsBase =
      import.meta.env.VITE_WS_URL ||
      (import.meta.env.DEV
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
        : 'ws://localhost:8000/ws')
    return `${wsBase}/game/${this.sessionCode}/?token=${this.token}`
  }

  connect(): Promise<void> {
    this.shouldReconnect = true
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.buildUrl())

        this.ws.onopen = () => {
          if (!this.shouldReconnect) {
            this.ws?.close(1000, 'Client disconnect')
            return
          }
          this.reconnectAttempts = 0
          this.reconnectDelay = 1000
          this.onConnectCallback?.()
          resolve()
        }

        this.ws.onclose = (event) => {
          this.onDisconnectCallback?.()
          if (!event.wasClean && this.shouldReconnect) {
            this.handleClose()
          }
        }

        this.ws.onerror = () => {
          if (this.shouldReconnect) {
            reject(new Error('WebSocket connection failed'))
          }
        }

        this.ws.onmessage = (e) => {
          this.handleMessage(e)
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  on(type: string, handler: MessageHandler): this {
    this.handlers.set(type, handler)
    return this
  }

  off(type: string): this {
    this.handlers.delete(type)
    return this
  }

  send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WS] Cannot send, connection not open')
    }
  }

  disconnect(): void {
    this.shouldReconnect = false
    if (this.ws) {
      const socket = this.ws
      this.ws = null
      socket.onerror = null
      socket.onopen = null
      if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Client disconnect')
      }
    }
  }

  onConnect(cb: () => void): this {
    this.onConnectCallback = cb
    return this
  }

  onDisconnect(cb: () => void): this {
    this.onDisconnectCallback = cb
    return this
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  protected handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data as string) as Record<string, unknown>
      const type = data.type as string

      if (type) {
        const handler = this.handlers.get(type)
        if (handler) {
          handler(data)
        }
        const wildcardHandler = this.handlers.get('*')
        if (wildcardHandler) {
          wildcardHandler(data)
        }
      }
    } catch (err) {
      console.error('[WS] Failed to parse message:', err)
    }
  }

  protected handleClose(): void {
    if (this.reconnectAttempts >= this.maxReconnects) {
      console.warn('[WS] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      if (this.shouldReconnect) {
        this.connect().catch((err) => {
          console.error('[WS] Reconnect failed:', err)
        })
      }
    }, delay)
  }
}

// Student WebSocket — uses ?player_token= instead of ?token=
export class StudentGameWebSocket extends GameWebSocket {
  constructor(sessionCode: string, playerToken: string) {
    super(sessionCode, playerToken)
  }

  protected override buildUrl(): string {
    const wsBase =
      import.meta.env.VITE_WS_URL ||
      (import.meta.env.DEV
        ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
        : 'ws://localhost:8000/ws')
    return `${wsBase}/game/${this.sessionCode}/?player_token=${this.token}`
  }
}
