/** Shared design tokens (guidelines.md reference) */
/** Primary brand color — Cherry */
export const CHERRY = "#6D0D35";
/** 14px radius for cards (guideline radius-md) */
export const ROUND = "rounded-radius-md";

/** Elevation shadows (guideline xs/sm/md/lg/xl) */
export const ELEVATION = {
  LEVEL_1: "shadow-elevation-1",
  LEVEL_2: "shadow-elevation-2",
  LEVEL_3: "shadow-elevation-3",
  LEVEL_4: "shadow-elevation-4",
  LEVEL_5: "shadow-elevation-5",
} as const;

/** Text hierarchy – guideline */
export const TEXT_PRIMARY = "#1A1A1A";
export const TEXT_BODY = "#2D2D2D";
export const TEXT_SECONDARY = "#6B6B6B";
export const TEXT_TERTIARY = "#9E9E9E";

/** Typography – Cormorant Garamond for headings, Poppins for body */
export const TYPO = {
  /** Page title – H1 20px, Cormorant. Primary text */
  H1: "font-serif text-typo-h1 font-normal tracking-tight text-text-primary",
  /** Compact page title – 16px, Cormorant */
  H1_SM: "font-serif text-body-lg font-normal tracking-tight text-text-primary",
  /** Large page title – 20px (greeting), Cormorant. Primary text */
  H1_LARGE: "font-serif text-typo-h1 font-normal tracking-tight text-text-primary",
  /** Section heading – H2 17px, Cormorant. Primary text */
  H2: "font-serif text-typo-h2 font-normal text-text-primary",
  /** Subsection – H3 15px, Cormorant. Primary text */
  H3: "font-serif text-typo-h3 font-normal text-text-primary",
  /** Label / Badge – 12px, 500 (hard floor). Primary text */
  LABEL: "text-caption font-medium text-text-primary",
  H3_LABEL: "text-caption font-medium uppercase tracking-wider text-text-primary",
  /** Card title – H3 15px, Cormorant. Primary text */
  CARD_TITLE: "font-serif text-typo-h3 font-normal text-text-primary",
  /** Body – 14px, 400. Body text */
  BODY: "text-body font-normal text-text-body",
  /** Body medium – 14px, 500 (prices, ETA, key data). Secondary text */
  BODY_MEDIUM: "text-body font-medium text-text-secondary",
  /** Small / Secondary – 13px, 400 (address, supporting info). Secondary text */
  BODY_SM: "text-body-sm font-normal text-text-secondary",
  /** Subtext – 14px. Body text */
  SUBTEXT: "text-body font-normal text-text-body",
  /** Caption – 11px, 300 (timestamps, footnotes). Tertiary text */
  CAPTION: "text-caption-sm font-light text-text-tertiary",
  /** Action link */
  LINK: "text-body font-medium text-text-body",
  /** Form label – 14px. Primary text */
  FORM_LABEL: "block text-body font-normal text-text-primary",
  /** Micro – 10px, 300 (legal text only). Tertiary text */
  MICRO: "text-micro font-light text-text-tertiary",
} as const;

/** Accent colors for labels, tags, badges */
export const MINTY_LIME = "#a8e6cf";
export const MINTY_LIME_DARK = "#5cb87a";
export const WARM_PEACH = "#ffdab9";
export const WARM_PEACH_DARK = "#d4845c";
/** Cherry variants */
export const CHERRY_LIGHT = "#f0d4e0";
export const CHERRY_DARK = "#8A1045";
/** @deprecated Use CHERRY_LIGHT */
export const BURGUNDY_LIGHT = "#f0d4e0";
/** @deprecated Use CHERRY_DARK */
export const BURGUNDY_DARK = "#8A1045";
/** @deprecated Use CHERRY_LIGHT */
export const SOFT_LILAC = "#f0d4e0";
/** @deprecated Use CHERRY_DARK */
export const SOFT_LILAC_DARK = "#8A1045";
/** Use for icon buttons and pill-shaped buttons */
export const ROUND_FULL = "rounded-full";

/** Button size stack – 44px min, 48px default, 52px CTA, 56px max. All pill-shaped. */
export const BUTTON = {
  /** Primary CTA: 52px, full width, pill */
  PRIMARY: "w-full min-w-0 h-[52px] px-6 flex items-center justify-center gap-2 font-medium text-sm text-white bg-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-50 rounded-full",
  /** Secondary: 48px, min 140px, pill */
  SECONDARY: "min-w-[140px] h-[48px] px-5 flex items-center justify-center gap-2 font-medium text-sm text-text-primary border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 rounded-full",
  /** Small action: 44px, min 100px, pill */
  SMALL: "min-w-[100px] h-[44px] px-4 flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 rounded-full",
  /** Chip/Filter: 34px, min 80px, 14px padding, pill */
  CHIP: "min-w-[80px] h-[34px] px-[14px] flex items-center justify-center font-medium text-sm rounded-full transition-all",
  /** Icon only: 44×44px min */
  ICON: "min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-[0.98]",
  /** Add to cart (+): 36×36px exception inside cards */
  ADD_CART: "w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-[0.98]",
} as const;

/** Input size stack – 44px min, 48px search, 52px default. All pill-shaped. */
export const INPUT = {
  /** Primary input: 52px, pill */
  PRIMARY: "w-full h-[52px] px-5 text-sm font-normal text-text-primary placeholder:text-text-tertiary bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200",
  /** Search bar: 48px, pill */
  SEARCH: "w-full h-12 pl-5 pr-5 text-sm font-normal text-text-primary placeholder:text-text-tertiary bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200",
  /** Compact: 44px, pill */
  COMPACT: "w-full h-11 px-4 text-sm font-normal text-text-primary placeholder:text-text-tertiary bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200",
  /** Textarea: min 96px, rounded-xl (not full pill) */
  TEXTAREA: "w-full min-h-[96px] px-5 py-4 text-sm font-normal text-text-primary placeholder:text-text-tertiary bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all duration-200 resize-none",
} as const;

/** @deprecated Use BUTTON.PRIMARY */
export const BUTTON_CLASS = BUTTON.PRIMARY;

/** @deprecated Use INPUT.PRIMARY or INPUT.SEARCH */
export const INPUT_CLASS = INPUT.PRIMARY;

export const LABEL_CLASS =
  "block text-body font-bold uppercase tracking-wider text-[#5cb87a]";

/** Cards: 20px radius, border, subtle shadow — use everywhere */
export const CARD = {
  BASE: "bg-white border border-slate-200 rounded-2xl shadow-elevation-1",
  PADDING: "p-5",
  HOVER: "transition-all hover:border-slate-300 hover:shadow-elevation-2 active:scale-[0.99]",
} as const;
/** @deprecated Use CARD.BASE + CARD.PADDING */
export const CARD_CLASS = `bg-white border border-slate-200 rounded-2xl p-5 shadow-elevation-1`;
