export const ENGLAND_SECTION8_FORM_NAME = 'Form 3A';
export const ENGLAND_SECTION8_NOTICE_NAME = 'Form 3A notice';
export const ENGLAND_SECTION8_NOTICE_TYPE_LABEL = ENGLAND_SECTION8_NOTICE_NAME;
export const ENGLAND_SECTION8_NOTICE_TITLE = ENGLAND_SECTION8_NOTICE_NAME;

export const ENGLAND_SECTION8_HISTORIC_FORM_NAMES = ['Form 3'] as const;
export const ENGLAND_SECTION8_HISTORIC_NOTICE_NAMES = ['Form 3 notice'] as const;
export const ENGLAND_SECTION8_HISTORIC_NOTICE_TITLES = ['Form 3 Notice Seeking Possession', 'Form 3A Notice Seeking Possession'] as const;

const ENGLAND_SECTION8_LEGACY_NOTICE_NAME_ALIASES = [
  ...ENGLAND_SECTION8_HISTORIC_NOTICE_NAMES,
  'Section 8 Notice (Form 3)',
  'Section 8 Notice (Form 3A)',
  'Form 3A notice seeking possession',
] as const;

const ENGLAND_SECTION8_LEGACY_NOTICE_TITLE_ALIASES = [
  ...ENGLAND_SECTION8_HISTORIC_NOTICE_TITLES,
  'Form 3A - Notice Seeking Possession',
  'Form 3A - Notice seeking possession',
] as const;

function matchesAlias(value: string | undefined | null, aliases: readonly string[]): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return aliases.some((alias) => alias.trim().toLowerCase() === normalized);
}

export function normalizeEnglandSection8FormName(value?: string | null): string {
  if (!value || matchesAlias(value, ENGLAND_SECTION8_HISTORIC_FORM_NAMES)) {
    return ENGLAND_SECTION8_FORM_NAME;
  }

  return value;
}

export function normalizeEnglandSection8NoticeName(value?: string | null): string {
  if (!value || matchesAlias(value, ENGLAND_SECTION8_LEGACY_NOTICE_NAME_ALIASES)) {
    return ENGLAND_SECTION8_NOTICE_NAME;
  }

  return value;
}

export function normalizeEnglandSection8NoticeTitle(value?: string | null): string {
  if (!value || matchesAlias(value, ENGLAND_SECTION8_LEGACY_NOTICE_TITLE_ALIASES)) {
    return ENGLAND_SECTION8_NOTICE_TITLE;
  }

  return value;
}

export function getEnglandSection8NoticeTerminology() {
  return {
    formName: ENGLAND_SECTION8_FORM_NAME,
    noticeName: ENGLAND_SECTION8_NOTICE_NAME,
    noticeTypeLabel: ENGLAND_SECTION8_NOTICE_TYPE_LABEL,
    noticeTitle: ENGLAND_SECTION8_NOTICE_TITLE,
    historicFormNames: [...ENGLAND_SECTION8_HISTORIC_FORM_NAMES],
    historicNoticeNames: [...ENGLAND_SECTION8_HISTORIC_NOTICE_NAMES],
    historicNoticeTitles: [...ENGLAND_SECTION8_HISTORIC_NOTICE_TITLES],
  };
}
