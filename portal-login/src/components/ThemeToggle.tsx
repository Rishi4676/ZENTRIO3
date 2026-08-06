import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl transition-all duration-300 glass border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-12" />
      ) : (
        <Sun className="w-5 h-5 transition-transform duration-500 rotate-0 hover:-rotate-12 text-amber-400" />
      )}
    </button>
  );
};
