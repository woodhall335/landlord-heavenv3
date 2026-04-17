export type PublicHeroPreset = 'home' | 'product_owner' | 'content_index';
export type PublicThemeKey = 'eviction' | 'court' | 'debt' | 'rent' | 'tenancy' | 'content';
export type PublicCardAccent = 'amethyst' | 'plum' | 'emerald' | 'amber' | 'lavender';

export const PUBLIC_CARD_ACCENTS: Record<
  PublicCardAccent,
  {
    card: string;
    chip: string;
    icon: string;
    borderGlow: string;
  }
> = {
  amethyst: {
    card: 'border-[#eadcff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,240,255,0.96))] text-[#24173c]',
    chip: 'bg-[#f2e8ff] text-[#6d28d9]',
    icon: 'bg-white text-[#7c3aed] shadow-[0_16px_32px_rgba(124,58,237,0.16)]',
    borderGlow: 'hover:shadow-[0_24px_55px_rgba(92,39,178,0.16)]',
  },
  plum: {
    card: 'border-[#e7d5ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,233,255,0.96))] text-[#231535]',
    chip: 'bg-[#efe4ff] text-[#7a2cc4]',
    icon: 'bg-white text-[#7a2cc4] shadow-[0_16px_32px_rgba(101,44,171,0.16)]',
    borderGlow: 'hover:shadow-[0_24px_55px_rgba(80,33,145,0.16)]',
  },
  emerald: {
    card: 'border-[#d5f2e7] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,252,247,0.96))] text-[#152b26]',
    chip: 'bg-[#e5f7f0] text-[#0f8b63]',
    icon: 'bg-white text-[#11936a] shadow-[0_16px_32px_rgba(17,147,106,0.14)]',
    borderGlow: 'hover:shadow-[0_24px_55px_rgba(17,147,106,0.14)]',
  },
  amber: {
    card: 'border-[#f6e4bc] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,233,0.96))] text-[#312211]',
    chip: 'bg-[#fff1cc] text-[#b45309]',
    icon: 'bg-white text-[#c06a0a] shadow-[0_16px_32px_rgba(192,106,10,0.14)]',
    borderGlow: 'hover:shadow-[0_24px_55px_rgba(192,106,10,0.14)]',
  },
  lavender: {
    card: 'border-[#ece4ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,247,255,0.96))] text-[#23193a]',
    chip: 'bg-[#f5eeff] text-[#6b3fd1]',
    icon: 'bg-white text-[#6b3fd1] shadow-[0_16px_32px_rgba(107,63,209,0.14)]',
    borderGlow: 'hover:shadow-[0_24px_55px_rgba(107,63,209,0.14)]',
  },
};

export const PUBLIC_HERO_PRESET_STYLES: Record<
  PublicHeroPreset,
  {
    section: string;
    overlay: string;
    badge: string;
    reviewPill: string;
    mediaPanel: string;
    usageText: string;
  }
> = {
  home: {
    section:
      'public-hero-shell',
    overlay:
      'bg-[radial-gradient(circle_at_top_right,rgba(214,188,255,0.28),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(173,116,255,0.18),transparent_42%),linear-gradient(180deg,rgba(15,6,31,0.2),rgba(15,6,31,0.48))]',
    badge:
      'border-white/20 bg-white/12 text-white shadow-[0_18px_48px_rgba(24,11,49,0.2)] backdrop-blur-md',
    reviewPill:
      'border-white/55 bg-white/92 text-[#271b45] shadow-[0_24px_60px_rgba(30,13,64,0.18)] backdrop-blur-md',
    mediaPanel:
      'border border-white/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))] shadow-[0_34px_90px_rgba(16,7,35,0.3)] backdrop-blur-sm',
    usageText: 'text-white/92',
  },
  product_owner: {
    section: 'public-hero-shell',
    overlay:
      'bg-[radial-gradient(circle_at_top_right,rgba(210,181,255,0.24),transparent_34%),linear-gradient(180deg,rgba(14,7,28,0.24),rgba(14,7,28,0.46))]',
    badge:
      'border-white/20 bg-white/12 text-white shadow-[0_16px_40px_rgba(24,11,49,0.18)] backdrop-blur-md',
    reviewPill:
      'border-white/52 bg-white/92 text-[#271b45] shadow-[0_22px_54px_rgba(30,13,64,0.16)] backdrop-blur-md',
    mediaPanel:
      'border border-white/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.05))] shadow-[0_28px_70px_rgba(16,7,35,0.26)] backdrop-blur-sm',
    usageText: 'text-white/90',
  },
  content_index: {
    section: 'public-hero-shell',
    overlay:
      'bg-[radial-gradient(circle_at_top_right,rgba(194,164,248,0.2),transparent_34%),linear-gradient(180deg,rgba(14,7,28,0.18),rgba(14,7,28,0.38))]',
    badge:
      'border-white/16 bg-white/10 text-white shadow-[0_14px_36px_rgba(24,11,49,0.16)] backdrop-blur-md',
    reviewPill:
      'border-white/45 bg-white/90 text-[#271b45] shadow-[0_20px_46px_rgba(30,13,64,0.14)] backdrop-blur-md',
    mediaPanel:
      'border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] shadow-[0_24px_60px_rgba(16,7,35,0.22)] backdrop-blur-sm',
    usageText: 'text-white/88',
  },
};

export const PUBLIC_LAYOUT_CLASSES = {
  page: 'public-page-shell',
  section: 'public-section-shell',
  sectionMuted: 'public-section-shell bg-[linear-gradient(180deg,#fcf9ff_0%,#f7f2ff_100%)]',
  card: 'public-surface-card standalone-premium-hover-lift',
  darkPanel: 'public-dark-panel',
  divider: 'public-divider-band',
} as const;

export function getPublicCardAccentClasses(accent: PublicCardAccent) {
  return PUBLIC_CARD_ACCENTS[accent];
}
