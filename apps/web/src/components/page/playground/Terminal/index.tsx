"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
  useState,
} from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { CommandAutocomplete } from "./CommandAutocomplete";

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
  setCommand: (command: string) => void;
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
    const connectionStateRef = useRef<ConnectionState>(connectionState);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteInput, setAutocompleteInput] = useState("");
    const autocompleteTriggeredRef = useRef(false);

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

    const setCommand = useCallback((command: string) => {
      const terminal = termRef.current;
      if (!terminal) return;

      // Clear current input
      const currentInput = inputBufferRef.current;
      for (let i = 0; i < currentInput.length; i++) {
        terminal.write("\b \b");
      }

      // Write the new command
      terminal.write(command);
      inputBufferRef.current = command;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        write,
        writeln,
        prompt,
        setCommand,
      }),
      [write, writeln, prompt, setCommand]
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
        // Disable input when not connected (use ref to get current state)
        if (connectionStateRef.current !== "connected") {
          // Allow Ctrl+C to cancel
          if (data === "\u0003") {
            terminal.write("^C");
            prompt();
            return;
          }
          // Show warning on Enter
          if (data === "\r") {
            terminal.write("\r\n");
            terminal.writeln(
              "[warn] Terminal is not connected. Please wait for connection or click Reconnect."
            );
            prompt();
          }
          // Block all other input
          return;
        }

        const inputBuffer = inputBufferRef.current;

        switch (data) {
          case "\u0003": // Ctrl+C
            terminal.write("^C");
            prompt();
            setShowAutocomplete(false);
            autocompleteTriggeredRef.current = false;
            break;
          case "\u0008": // Backspace (BS)
          case "\u007F": // Delete (DEL)
            if (inputBuffer.length > 0) {
              terminal.write("\b \b");
              inputBufferRef.current = inputBuffer.slice(0, -1);
              const newInput = inputBufferRef.current;
              setAutocompleteInput(newInput);
              // Show autocomplete if there's still input
              if (newInput.length >= 2) {
                setShowAutocomplete(true);
              } else {
                setShowAutocomplete(false);
              }
            }
            break;
          case "\r": // Enter
            terminal.write("\r\n");
            const command = inputBuffer.trim();
            inputBufferRef.current = "";
            setShowAutocomplete(false);
            autocompleteTriggeredRef.current = false;
            if (command.length > 0) {
              onCommand(command);
            } else {
              prompt({ leadingNewline: false });
            }
            break;
          case "\t": // Tab - trigger autocomplete (prevent default tab behavior)
            if (inputBuffer.length >= 2) {
              setShowAutocomplete(true);
              setAutocompleteInput(inputBuffer);
              autocompleteTriggeredRef.current = true;
            }
            // Don't write tab to terminal
            break;
          default:
            if (data >= " " && data <= "~") {
              terminal.write(data);
              inputBufferRef.current += data;
              const newInput = inputBufferRef.current;
              setAutocompleteInput(newInput);
              // Show autocomplete after 2+ characters
              if (newInput.length >= 2) {
                setShowAutocomplete(true);
              } else {
                setShowAutocomplete(false);
              }
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

    // Update connection state ref when it changes
    useEffect(() => {
      connectionStateRef.current = connectionState;
    }, [connectionState]);

    // Close autocomplete when clicking outside
    useEffect(() => {
      if (!showAutocomplete) return;

      const handleClickOutside = (event: MouseEvent) => {
        const container = containerRef.current;
        if (container && !container.contains(event.target as Node)) {
          // Check if click is not on autocomplete
          const autocompleteElement = document.querySelector(
            '[data-autocomplete="true"]'
          );
          if (
            !autocompleteElement ||
            !autocompleteElement.contains(event.target as Node)
          ) {
            setShowAutocomplete(false);
            autocompleteTriggeredRef.current = false;
          }
        }
      };

      // Use setTimeout to avoid immediate closure on the click that opened it
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showAutocomplete]);

    const isConnected = connectionState === "connected";

    const handleCommandSelect = useCallback((command: string) => {
      const terminal = termRef.current;
      if (!terminal) return;

      // Clear current input
      const currentInput = inputBufferRef.current;
      for (let i = 0; i < currentInput.length; i++) {
        terminal.write("\b \b");
      }

      // Write the selected command
      terminal.write(command);
      inputBufferRef.current = command;
      setShowAutocomplete(false);
      autocompleteTriggeredRef.current = false;
    }, []);

    const handleAutocompleteClose = useCallback(() => {
      setShowAutocomplete(false);
      autocompleteTriggeredRef.current = false;
    }, []);

    return (
      <div className="flex h-full min-h-0 max-h-full w-full flex-col overflow-hidden">
        {/* Terminal Body */}
        <div className="flex min-h-0 flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className={`h-full w-full overflow-hidden rounded-lg bg-base-900/50 p-4 ${
              !isConnected ? "opacity-75" : ""
            }`}
          />
          {/* Autocomplete hidden for now */}
          {false && isConnected && showAutocomplete && (
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-10">
              <div className="pointer-events-auto px-4 pb-2">
                <CommandAutocomplete
                  currentInput={autocompleteInput}
                  isVisible={showAutocomplete}
                  onSelect={handleCommandSelect}
                  onClose={handleAutocompleteClose}
                />
              </div>
            </div>
          )}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-lg bg-slate-900/90 border border-slate-700/50 px-4 py-2 text-sm text-slate-300">
                {connectionState === "connecting"
                  ? "Connecting to terminal..."
                  : connectionState === "error"
                  ? "Connection error. Use Reconnect button in header to try again."
                  : "Terminal disconnected. Use Reconnect button in header to connect."}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default TerminalView;
