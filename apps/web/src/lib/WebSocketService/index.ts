export type WebSocketMessageMap = {
  notification: {
    message: string;
    type?: "info" | "success" | "error" | "warning";
    duration?: number;
  };
  trigger: {
    pid: string;
    host: string;
  };
};

type MessageType = keyof WebSocketMessageMap;
type MessageHandler<T extends MessageType> = (
  payload: WebSocketMessageMap[T]
) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  private listeners: {
    [K in MessageType]: Set<MessageHandler<K>>;
  } = {
    notification: new Set(),
    trigger: new Set(),
  };

  private constructor() {}

  private isSocketConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private getSocketUrl(): string | null {
    const envUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();

    if (envUrl) {
      try {
        const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(envUrl);
        const base = hasScheme
          ? envUrl
          : typeof window !== "undefined"
          ? new URL(envUrl, window.location.href).toString()
          : null;

        if (!base) {
          throw new Error("Cannot resolve URL on the server without a base");
        }

        return new URL(base).toString();
      } catch (error) {
        console.error("Invalid NEXT_PUBLIC_WS_URL:", envUrl, error);
        return null;
      }
    }

    if (typeof window === "undefined") {
      console.warn(
        "WebSocketService attempted to initialize on the server without NEXT_PUBLIC_WS_URL"
      );
      return null;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const fallbackPort = protocol === "ws" ? "3002" : "";
    const port = window.location.port || fallbackPort;
    const portSegment = port ? `:${port}` : "";

    return `${protocol}://${window.location.hostname}${portSegment}`;
  }

  private logSocketError(err: Event | Error | unknown) {
    if (
      typeof window !== "undefined" &&
      typeof ErrorEvent !== "undefined" &&
      err instanceof ErrorEvent
    ) {
      console.error("WebSocket error:", err.message, err.error ?? {});
      return;
    }

    if (err instanceof Event) {
      console.error("WebSocket error event:", {
        type: err.type,
        target: (err.target as WebSocket | null)?.url,
      });
      return;
    }

    console.error("WebSocket error", err);
  }

  private logCloseEvent(event: CloseEvent) {
    console.warn("WebSocket disconnected", {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    });
  }

  private initializeSocket() {
    if (this.isSocketConnected()) return;

    if (typeof window === "undefined") return;

    // Clean up existing socket if it exists but is not connected
    if (this.socket) {
      this.cleanupSocket();
    }

    const socketUrl = this.getSocketUrl();

    if (!socketUrl) {
      console.error(
        "Unable to initialize WebSocket: no valid URL resolved. Set NEXT_PUBLIC_WS_URL to override the default."
      );
      return;
    }

    try {
      const ws = new WebSocket(socketUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected (${socketUrl})`);
        this.reconnectAttempts = 0;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      ws.onclose = (event) => {
        this.logCloseEvent(event);
        this.cleanupSocket();
        this.scheduleReconnect();
      };

      ws.onerror = (err) => {
        this.logSocketError(err);
        // Error event is usually followed by close event, so we'll handle cleanup there.
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const { type, ...payload } = raw;

          if (type && typeof type === "string" && type in this.listeners) {
            this.emit(type as MessageType, payload);
          } else {
            console.warn("Unknown WebSocket message type:", type);
          }
        } catch (e) {
          console.error("Invalid WebSocket message:", event.data, e);
        }
      };

      this.socket = ws;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.scheduleReconnect();
    }
  }

  private cleanupSocket() {
    if (this.socket) {
      // Remove event handlers to prevent memory leaks
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;

      // Close if not already closed
      if (
        this.socket.readyState === WebSocket.CONNECTING ||
        this.socket.readyState === WebSocket.OPEN
      ) {
        this.socket.close();
      }

      this.socket = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `WebSocket reconnection failed after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      console.log(
        `Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      this.initializeSocket();
    }, delay);
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
      WebSocketService.instance.initializeSocket();
    }
    return WebSocketService.instance;
  }

  on<T extends MessageType>(type: T, handler: MessageHandler<T>) {
    this.listeners[type].add(handler);
    // Ensure socket is initialized when listeners are added
    if (typeof window !== "undefined" && !this.isSocketConnected()) {
      this.initializeSocket();
    }
  }

  off<T extends MessageType>(type: T, handler: MessageHandler<T>) {
    this.listeners[type].delete(handler);
  }

  private emit<T extends MessageType>(type: T, payload: unknown) {
    const handlers = this.listeners[type];
    if (handlers.size === 0) return;

    // Validate payload structure matches expected type
    try {
      handlers.forEach((handler) => {
        handler(payload as WebSocketMessageMap[T]);
      });
    } catch (error) {
      console.error(`Error in WebSocket handler for type "${type}":`, error);
    }
  }
}

export const ws = WebSocketService.getInstance();
