// ─── Color Palette ────────────────────────────────────────────────────────────
export const Colors = {
  // Primary – trustworthy deep violet
  primary: '#4C3BCF',
  primaryLight: '#6C5CE7',
  primaryDark: '#3A2CA0',

  // Secondary – professional teal
  secondary: '#00B4D8',
  secondaryLight: '#48CAE4',
  secondaryDark: '#0096B7',

  // Accent – warm success green
  success: '#00C896',
  successLight: '#E6FBF6',

  // Danger / Cancelled / Unpaid
  danger: '#E63946',
  dangerLight: '#FDECEA',

  // Warning / No-show
  warning: '#FFB703',
  warningLight: '#FFF8E6',

  // Neutral greys
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceHover: '#EEF0F8',
  border: '#E2E5F0',

  // Text
  textPrimary: '#1A1D2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textOnDark: '#FFFFFF',

  // Status chips
  statusCompleted: '#00C896',
  statusCancelled: '#E63946',
  statusNoShow: '#FFB703',
  statusBooked: '#4C3BCF',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const Typography = {
  // Display
  displayLG: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40 },
  displayMD: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },

  // Headings
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },

  // Body – large for accessibility
  bodyLG: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodyMD: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySM: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },

  // Labels & buttons
  labelLG: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  labelMD: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  labelSM: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },

  // Caption
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#4C3BCF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4C3BCF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
