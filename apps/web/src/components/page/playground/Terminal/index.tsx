"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface TerminalViewProps {
  connectionState: ConnectionState;
  welcomeMessage?: string;
  promptLabel?: string;
  sessionId?: number | null;
  onCommand: (command: string) => void;
  onReconnect: () => void;
}

export interface TerminalViewHandle {
  write: (value: string) => void;
  writeln: (value?: string) => void;
  prompt: (options?: { leadingNewline?: boolean }) => void;
}

const DEFAULT_WELCOME_MESSAGE =
  "Interactive terminal. Type a command and press Enter to execute.";
const DEFAULT_PROMPT_LABEL = "$ ";

export const TerminalView = forwardRef<TerminalViewHandle, TerminalViewProps>(
  function TerminalView(
    {
      connectionState,
      welcomeMessage = DEFAULT_WELCOME_MESSAGE,
      promptLabel = DEFAULT_PROMPT_LABEL,
      sessionId,
      onCommand,
      onReconnect,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const inputBufferRef = useRef<string>("");

    const write = useCallback((value: string) => {
      termRef.current?.write(value);
    }, []);

    const writeln = useCallback((value = "") => {
      termRef.current?.writeln(value);
    }, []);

    const prompt = useCallback(
      (options?: { leadingNewline?: boolean }) => {
        const leadingNewline = options?.leadingNewline ?? true;
        write(`${leadingNewline ? "\r\n" : ""}${promptLabel}`);
        inputBufferRef.current = "";
      },
      [promptLabel, write]
    );

    useImperativeHandle(
      ref,
      () => ({
        write,
        writeln,
        prompt,
      }),
      [write, writeln, prompt]
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#313844",
          foreground: "#f1f5f9",
        },
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      termRef.current = terminal;
      fitAddonRef.current = fitAddon;

      terminal.open(container);
      fitAddon.fit();

      terminal.focus();
      terminal.writeln(welcomeMessage);
      prompt({ leadingNewline: false });

      const resize = () => fitAddon.fit();
      window.addEventListener("resize", resize);

      const dataListener = terminal.onData((data) => {
        const inputBuffer = inputBufferRef.current;

        switch (data) {
          case "\u0003": // Ctrl+C
            terminal.write("^C");
            prompt();
            break;
          case "\u0008": // Backspace (BS)
          case "\u007F": // Delete (DEL)
            if (inputBuffer.length > 0) {
              terminal.write("\b \b");
              inputBufferRef.current = inputBuffer.slice(0, -1);
            }
            break;
          case "\r": // Enter
            terminal.write("\r\n");
            const command = inputBuffer.trim();
            inputBufferRef.current = "";
            if (command.length > 0) {
              onCommand(command);
            } else {
              prompt({ leadingNewline: false });
            }
            break;
          default:
            if (data >= " " && data <= "~") {
              terminal.write(data);
              inputBufferRef.current += data;
            } else if (data === "\u001b[A" || data === "\u001b[B") {
              // swallow arrow up/down to avoid noise
            } else {
              // For other control sequences, we could pass them through
              // but for now, we'll just ignore them
            }
        }
      });

      return () => {
        window.removeEventListener("resize", resize);
        dataListener.dispose();
        terminal.dispose();
        fitAddon.dispose();
        termRef.current = null;
        fitAddonRef.current = null;
      };
    }, [welcomeMessage, promptLabel, prompt, onCommand]);

    return (
      <div className="flex h-full min-h-0 w-full flex-col">
        {/* Terminal Body */}
        <div className="flex-1 min-h-0">
          <div
            ref={containerRef}
            className="h-full w-full overflow-hidden rounded-lg bg-base-900/50 p-4"
          />
        </div>
      </div>
    );
  }
);

export default TerminalView;
