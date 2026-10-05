// Small inline icon set (stroke icons, 24px grid).
type P = { className?: string };
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const SearchIcon = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const GridIcon = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const BagIcon = (p: P) => (
  <svg {...base} {...p}><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const SendIcon = (p: P) => (
  <svg {...base} {...p}><path d="M21 3 10 14" /><path d="m21 3-7 18-4-7-7-4z" /></svg>
);
export const BoltIcon = (p: P) => (
  <svg {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>
);
export const ShieldIcon = (p: P) => (
  <svg {...base} {...p}><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const ChatIcon = (p: P) => (
  <svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const ChevronRight = (p: P) => (
  <svg {...base} {...p}><path d="m9 6 6 6-6 6" /></svg>
);
export const StarIcon = (p: P) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
);
export const ExternalIcon = (p: P) => (
  <svg {...base} {...p}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
);
