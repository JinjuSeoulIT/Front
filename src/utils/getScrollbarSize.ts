// SSR-safe calculation of scrollbar size
export const getScrollbarSize = (): number => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};
