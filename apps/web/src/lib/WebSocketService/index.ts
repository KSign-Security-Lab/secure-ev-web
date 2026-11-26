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

/** Connection lifecycle surfaced to the UI (header indicator, toasts). */
export type WebSocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "failed";
type StatusListener = (status: WebSocketStatus) => void;
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

  private status: WebSocketStatus = "idle";
  private statusListeners = new Set<StatusListener>();
  private lastUrl: string | null = null;
  private hasConnected = false;

  private constructor() {}

  private setStatus(next: WebSocketStatus) {
    if (this.status === next) return;
    this.status = next;
    this.statusListeners.forEach((listener) => listener(next));
  }

  /** True once a connection has been established in this page session. */
  hasEverConnected(): boolean {
    return this.hasConnected;
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  /** Subscribes to status changes; returns an unsubscribe function. */
  onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  /** Manual retry after the automatic reconnect budget is exhausted. */
  retry() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
    this.initializeSocket();
  }

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
        // eslint-disable-next-line no-console
        console.error("Invalid NEXT_PUBLIC_WS_URL:", envUrl, error);
        return null;
      }
    }

    if (typeof window === "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        "WebSocketService attempted to initialize on the server without NEXT_PUBLIC_WS_URL"
      );
      return null;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const fallbackPort = protocol === "ws" ? "4201" : "";
    const port = window.location.port || fallbackPort;
    const portSegment = port ? `:${port}` : "";

    return `${protocol}://${window.location.hostname}${portSegment}`;
  }

  private logSocketError() {
    // The browser's error Event carries no detail (it serialises as `{}`);
    // the close event that follows has the code/reason, so log one line here.
    // eslint-disable-next-line no-console
    console.warn(
      `[ws] connection error (${this.lastUrl ?? "unknown url"}, attempt ${this.reconnectAttempts})`
    );
  }

  private logCloseEvent(event: CloseEvent) {
    if (event.wasClean) return;
    // eslint-disable-next-line no-console
    console.warn(
      `[ws] closed: code=${event.code}${event.reason ? ` reason="${event.reason}"` : ""}`
    );
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
      // eslint-disable-next-line no-console
      console.error(
        "[ws] no valid URL resolved. Set NEXT_PUBLIC_WS_URL to override the default."
      );
      this.setStatus("failed");
      return;
    }

    this.lastUrl = socketUrl;
    this.setStatus(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");

    try {
      const ws = new WebSocket(socketUrl);

      ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.hasConnected = true;
        this.setStatus("open");
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

      ws.onerror = () => {
        this.logSocketError();
        // Error event is usually followed by close event, so we'll handle cleanup there.
      };

      ws.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const { type, ...payload } = raw;

          if (type && typeof type === "string" && type in this.listeners) {
            this.emit(type as MessageType, payload);
          } else {
            // eslint-disable-next-line no-console
            console.warn("Unknown WebSocket message type:", type);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[ws] invalid message:", String(event.data).slice(0, 200), e);
        }
      };

      this.socket = ws;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[ws] failed to create socket for ${socketUrl}:`, error);
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
      // Expected when no event server is running; the header shows it.
      // eslint-disable-next-line no-console
      console.warn(
        `[ws] giving up after ${this.maxReconnectAttempts} reconnect attempts (${this.lastUrl})`
      );
      this.setStatus("failed");
      return;
    }

    this.reconnectAttempts++;
    this.setStatus("reconnecting");
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
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
    // Ensure socket is initialized when listeners are added (but don't fight
    // a pending reconnect or a socket that is still connecting).
    if (
      typeof window !== "undefined" &&
      !this.socket &&
      !this.reconnectTimeout &&
      this.status !== "failed"
    ) {
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
      // eslint-disable-next-line no-console
      console.error(`[ws] handler for "${type}" threw:`, error);
    }
  }
}

export const ws = WebSocketService.getInstance();
