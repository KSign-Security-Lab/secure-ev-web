/**
 * Helpers for the Sandcat deployment commands (see server/c2/deployTemplates.ts).
 *
 * Commands arrive with `#{...}` placeholders (`#{app.contact.http}`,
 * `#{agents.implant_name}`, `#{agent.extensions}`). The operator edits the values
 * and every command re-renders, which mirrors Caldera's deploy modal, whose
 * templates and placeholder convention these were ported from.
 */

const PLACEHOLDER_PATTERN = /#\{(.*?)\}/g;

/** Every distinct `#{...}` key across the given commands, in first-seen order. */
export function extractPlaceholders(commands: string[]): string[] {
  const seen = new Set<string>();
  for (const command of commands) {
    for (const match of command.matchAll(PLACEHOLDER_PATTERN)) {
      seen.add(match[1]);
    }
  }
  return [...seen];
}

/** Replace every `#{key}` with its value. Unknown keys are left untouched. */
export function substitute(
  command: string,
  values: Record<string, string>
): string {
  return command.replace(PLACEHOLDER_PATTERN, (original, key: string) =>
    key in values ? values[key] : original
  );
}

/** Prism language for an agent executor. */
export function highlightLanguage(executor: string): string {
  return executor === "psh" ? "powershell" : "bash";
}

/** PowerShell scripts want CRLF; shell scripts want LF. */
export function normalizeScript(command: string, executor: string): string {
  const body = command.replace(/\r\n/g, "\n").trimEnd();
  return executor === "psh"
    ? `${body}\n`.replace(/\n/g, "\r\n")
    : `${body}\n`;
}

export function scriptFilename(platform: string, executor: string): string {
  return executor === "psh"
    ? `install-sandcat-${platform}.ps1`
    : `install-sandcat-${platform}.sh`;
}

/**
 * Copy text to the clipboard.
 *
 * `navigator.clipboard` only exists in a secure context, and this app is normally
 * reached over plain HTTP on a LAN address, so fall back to a hidden textarea.
 * (Caldera simply hides its copy button in that case.)
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/** Trigger a browser download for a generated text file. */
export function downloadTextFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
