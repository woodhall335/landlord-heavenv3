export const isWizardThemeV2 = process.env.NEXT_PUBLIC_WIZARD_THEME === 'v2';

export const wizardThemeTokens = {
  accent: {
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    soft: '#F5F3FF',
    border: '#DDD6FE',
  },
  neutral: {
    page: '#F8F7FC',
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111827',
    muted: '#6B7280',
  },
  semantic: {
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
  },
  radius: {
    card: '12px',
  },
  elevation: {
    card: '0 4px 14px rgba(17, 24, 39, 0.06)',
  },
  spacing: {
    section: '1.5rem',
    card: '1.5rem',
  },
} as const;
