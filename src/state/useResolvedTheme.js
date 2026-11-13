import { useEffect, useState } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

/** Resolves the stored theme mode ("system" included) to the theme on screen. */
export function useResolvedTheme(mode) {
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = (event) => setSystemPrefersDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (mode === 'system') return systemPrefersDark ? 'dark' : 'light';
  return mode;
}
