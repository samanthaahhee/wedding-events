// Local Knowledge Design System tokens — v2 (Base44-reference).
// Single source of truth. Components reference these via the matching CSS vars
// (declared in app/globals.css under the `--lk-*` namespace) or the Tailwind
// utility classes that wrap them.

export const tokens = {
  colors: {
    // Page surface
    bg: "#F5F1EC", // Warm cream — the page background
    surface: "#FFFFFF", // Slight elevation: cards, input fields against bg
    surfaceMuted: "#FBF8F4", // Even subtler — inside the welcome callout card

    // Text
    ink: "#2A1F1A", // Primary text. Warm dark brown, not black.
    inkMuted: "#7A6A60", // Secondary, intro paragraphs, helper text
    inkSubtle: "#B5A89E", // Placeholder, disabled, tertiary
    line: "#E5DCD2", // Borders and dividers — quiet, warm-toned

    // Accent (Coral / terracotta)
    accent: "#D2664A", // Primary CTA, progress bar, question numbers, active states
    accentPressed: "#B85638", // Hover / press
    accentSoft: "#F5E0D6", // Light coral wash — icon-in-circle and selected-row tint
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 80,
  },

  radii: {
    input: 12,
    card: 16,
    pill: 999,
    button: 12,
  },

  shadows: {
    none: "none",
    focus: "0 0 0 3px rgba(210, 102, 74, 0.20)",
    softTop: "0 -4px 12px rgba(42, 31, 26, 0.05)",
  },

  typography: {
    // Serif — Playfair Display
    welcomeHeadline: {
      family: "serif",
      size: 72,
      weight: 700,
      lineHeight: 1.05,
      letterSpacing: "-0.015em",
    },
    sectionTitle: {
      family: "serif",
      size: 44,
      weight: 700,
      lineHeight: 1.15,
      letterSpacing: "-0.01em",
    },
    sliderValue: {
      family: "serif",
      size: 28,
      weight: 400,
      fontStyle: "italic" as const,
    },

    // Sans — Inter
    progressLabel: { family: "sans", size: 14, weight: 500 },
    intro: { family: "sans", size: 19, weight: 400, lineHeight: 1.55 },
    sectionSubtitle: {
      family: "sans",
      size: 17,
      weight: 400,
      lineHeight: 1.55,
    },
    questionTitle: { family: "sans", size: 18, weight: 600, lineHeight: 1.4 },
    body: { family: "sans", size: 16, weight: 400, lineHeight: 1.55 },
    optionLabel: { family: "sans", size: 16, weight: 500, lineHeight: 1.4 },
    helperText: { family: "sans", size: 14, weight: 400, lineHeight: 1.5 },
    caption: { family: "sans", size: 13, weight: 500 },
    buttonLabel: { family: "sans", size: 16, weight: 600 },
  },
} as const;

export type Tokens = typeof tokens;
