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
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const inputBufferRef = useRef<string>("");
    const connectionStateRef = useRef<ConnectionState>(connectionState);
    const sessionIdRef = useRef<number | null | undefined>(sessionId);
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
          background: "#000000",
          foreground: "#f1f5f9",
        },
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);

      termRef.current = terminal;
      fitAddonRef.current = fitAddon;

      terminal.open(container);
      fitAddon.fit();

      // Ensure terminal element has matching rounded corners
      const terminalElement = container.querySelector(".xterm");
      if (terminalElement instanceof HTMLElement) {
        terminalElement.style.borderRadius = "0.5rem";
      }

      terminal.focus();
      terminal.writeln(welcomeMessage);
      prompt({ leadingNewline: false });

      const resize = () => fitAddon.fit();
      window.addEventListener("resize", resize);

      const dataListener = terminal.onData((data) => {
        // Disable input when no session selected or not connected (use ref to get current state)
        if (
          !sessionIdRef.current ||
          connectionStateRef.current !== "connected"
        ) {
          // Allow Ctrl+C to cancel
          if (data === "\u0003") {
            terminal.write("^C");
            prompt();
            return;
          }
          // Show warning on Enter
          if (data === "\r") {
            terminal.write("\r\n");
            if (!sessionIdRef.current) {
              terminal.writeln(
                "[warn] No session selected. Please select a session from the list."
              );
            } else {
              terminal.writeln(
                "[warn] Terminal is not connected. The terminal will automatically reconnect."
              );
            }
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

    // Update sessionId ref when it changes
    useEffect(() => {
      sessionIdRef.current = sessionId;
    }, [sessionId]);

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
      <div className="flex h-full min-h-0 max-h-full w-full flex-col overflow-hidden rounded-lg">
        {/* Terminal Body */}
        <div className="flex min-h-0 flex-1 relative overflow-hidden rounded-lg">
          <div
            ref={containerRef}
            className={`h-full w-full overflow-hidden rounded-lg bg-black p-4 ${
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
          {!sessionId && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none backdrop-blur-sm">
              <div className="rounded-lg bg-slate-900/90 border border-slate-700/50 px-4 py-2 text-sm text-slate-300">
                Please select a session from the list to connect to the
                terminal.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default TerminalView;
