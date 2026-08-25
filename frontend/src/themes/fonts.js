/**
 * Customizable text fonts (name, bio, category titles).
 * System font stacks only: no external resources to load.
 * The key is stored in the database; "auto" (null) = the theme font.
 */
export const FONTS = [
  {
    name: 'sans',
    label: 'Sans-serif (default)',
    stack: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  },
  {
    name: 'serif',
    label: 'Serif',
    stack: "Georgia, 'Times New Roman', Times, serif",
  },
  {
    name: 'mono',
    label: 'Monospace',
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace",
  },
  {
    name: 'cursive',
    label: 'Handwritten',
    stack: "'Segoe Script', 'Comic Sans MS', cursive",
  },
  {
    name: 'display',
    label: 'Impact (decorative)',
    stack: "Impact, 'Arial Black', Haettenschweiler, sans-serif",
  },
];

export const FONT_NAMES = FONTS.map((f) => f.name);

export const getFontStack = (name) => FONTS.find((f) => f.name === name)?.stack ?? null;
