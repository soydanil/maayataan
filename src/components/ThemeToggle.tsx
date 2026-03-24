import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const initial = stored || 'system';
    setTheme(initial);
    applyTheme(initial);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange() {
      if ((localStorage.getItem('theme') || 'system') === 'system') {
        applyTheme('system');
      }
    }
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  function cycle() {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  }

  const label = theme === 'system' ? 'Auto' : theme === 'light' ? 'Claro' : 'Oscuro';
  const icon = theme === 'system' ? '◐' : theme === 'light' ? '○' : '●';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      aria-label={`Tema: ${label}. Click para cambiar.`}
      title={`Tema: ${label}`}
    >
      <span className="theme-icon">{icon}</span>
      <style>{`
        .theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--surface);
          border-radius: var(--radius);
          background: transparent;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 1rem;
          transition: color 150ms ease-out;
        }
        .theme-toggle:hover {
          color: var(--text);
        }
      `}</style>
    </button>
  );
}
