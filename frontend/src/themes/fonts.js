/**
 * Polices de texte personnalisables (nom, bio, titres de catégories).
 * Des piles système uniquement : aucune ressource externe à charger.
 * La clé est stockée en base ; "auto" (null) = police du thème.
 */
export const FONTS = [
  {
    name: 'sans',
    label: 'Sans-serif (défaut)',
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
    label: 'Écriture manuscrite',
    stack: "'Segoe Script', 'Comic Sans MS', cursive",
  },
  {
    name: 'display',
    label: 'Impact (décoratif)',
    stack: "Impact, 'Arial Black', Haettenschweiler, sans-serif",
  },
];

export const FONT_NAMES = FONTS.map((f) => f.name);

export const getFontStack = (name) => FONTS.find((f) => f.name === name)?.stack ?? null;
