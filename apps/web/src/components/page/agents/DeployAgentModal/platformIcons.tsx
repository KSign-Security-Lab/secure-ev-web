import React from "react";

/**
 * Monochrome OS glyphs. lucide-react carries no brand icons, and Caldera's modal
 * leans on Font Awesome brands — these keep the same visual cue without adding a
 * dependency.
 */
type GlyphProps = { className?: string };

export const LinuxGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M12 1.5c-2.3 0-3.6 1.7-3.6 4 0 .9.1 1.8.1 2.6 0 .9-.6 1.7-1.3 2.7-.8 1.2-1.7 2.5-1.7 4.2 0 .5.1 1 .3 1.4-.5.4-1 .8-1.6 1-.5.2-.8.6-.8 1 0 .5.4.8 1 1 .8.2 1.3.4 1.7.7.4.3.7.7 1.4.9.4.1.9.2 1.4.2 1 0 1.9-.3 2.5-.7.4-.2.8-.3 1.2-.3.4 0 .8.1 1.2.3.6.4 1.5.7 2.5.7.5 0 1-.1 1.4-.2.7-.2 1-.6 1.4-.9.4-.3.9-.5 1.7-.7.6-.2 1-.5 1-1 0-.4-.3-.8-.8-1-.6-.2-1.1-.6-1.6-1 .2-.4.3-.9.3-1.4 0-1.7-.9-3-1.7-4.2-.7-1-1.3-1.8-1.3-2.7 0-.8.1-1.7.1-2.6 0-2.3-1.3-4-3.6-4zm-1.6 4.2c.4 0 .7.4.7.9s-.3.9-.7.9-.7-.4-.7-.9.3-.9.7-.9zm3.2 0c.4 0 .7.4.7.9s-.3.9-.7.9-.7-.4-.7-.9.3-.9.7-.9zm-1.6 2.6c.9 0 1.7.4 1.7.8 0 .2-.2.4-.6.6-.4.2-.7.4-1.1.4s-.7-.2-1.1-.4c-.4-.2-.6-.4-.6-.6 0-.4.8-.8 1.7-.8z" />
  </svg>
);

export const WindowsGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M3 5.6l7.3-1v7.1H3V5.6zm8.5-1.2L21 3v8.7h-9.5V4.4zM3 12.9h7.3V20L3 19V12.9zm8.5 0H21V21l-9.5-1.3v-6.8z" />
  </svg>
);

export const DarwinGlyph: React.FC<GlyphProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.8-2.7-.7-1.4 0-2.7.8-3.4 2-1.4 2.5-.4 6.2 1 8.2.7 1 1.5 2.1 2.5 2 1-.04 1.4-.6 2.6-.6s1.6.6 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.02 0-2.1-.8-2.1-3.1zM14.3 6.3c.6-.7 1-1.6.9-2.6-.8 0-1.9.5-2.5 1.2-.5.6-1 1.6-.9 2.5.9.1 1.8-.4 2.5-1.1z" />
  </svg>
);

export const PLATFORM_GLYPHS: Record<string, React.FC<GlyphProps>> = {
  linux: LinuxGlyph,
  windows: WindowsGlyph,
  darwin: DarwinGlyph,
};
