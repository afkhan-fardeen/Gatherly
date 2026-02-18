/** Shared design tokens for events pages (matches create event UI) */
export const CHERRY = "#6D0D35";
export const ROUND = "rounded-[10px]";

/** Typography – consistent sizing across pages */
export const TYPO = {
  /** Page title (header) – e.g. Events, Profile, My Bookings */
  H1: "text-xl font-semibold tracking-tight",
  /** Compact page title – e.g. booking reference */
  H1_SM: "text-base font-semibold tracking-tight",
  /** Large page title – e.g. Dashboard greeting, Create New Event */
  H1_LARGE: "text-2xl font-semibold tracking-tight",
  /** Section heading – e.g. About Vendor, Service Packages */
  H2: "text-lg font-semibold text-slate-900",
  /** Subsection / label – uppercase small */
  H3: "text-sm font-bold uppercase tracking-wider",
  /** Card/list item title */
  CARD_TITLE: "text-base font-semibold text-slate-900",
  /** Body paragraph */
  BODY: "text-sm text-slate-600",
  /** Secondary text / subtext */
  SUBTEXT: "text-sm text-slate-500",
  /** Caption / small helper */
  CAPTION: "text-xs text-slate-500",
  /** Action link */
  LINK: "text-sm font-semibold",
  /** Form label (darker for readability) */
  FORM_LABEL: "block text-sm font-medium text-slate-700",
} as const;

/** Accent colors for labels, tags, badges */
export const MINTY_LIME = "#a8e6cf";
export const MINTY_LIME_DARK = "#5cb87a";
export const WARM_PEACH = "#ffdab9";
export const WARM_PEACH_DARK = "#d4845c";
export const SOFT_LILAC = "#e2d5f1";
export const SOFT_LILAC_DARK = "#9b7bb8";
/** Use for icon buttons and pill-shaped buttons */
export const ROUND_FULL = "rounded-full";

export const INPUT_CLASS =
  "w-full h-12 px-4 bg-white border border-slate-200 text-slate-900 text-[16px] placeholder:text-slate-400 focus:ring-2 focus:ring-[#6D0D35]/20 focus:border-[#6D0D35]/40 outline-none transition-all rounded-full";

export const BUTTON_CLASS =
  `w-full h-12 flex items-center justify-center gap-2 font-semibold text-base text-white transition-all active:scale-[0.98] disabled:opacity-50 rounded-full`;

export const LABEL_CLASS =
  "block text-sm font-bold uppercase tracking-wider text-[#5cb87a]";

export const CARD_CLASS = `bg-white border border-slate-200 ${ROUND}`;
