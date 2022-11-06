import { useState } from "react";

export const useTheme = () => {
  const getCurrentTheme = () => {
    return typeof localStorage !== 'undefined' && (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches))
    ? 'dark'
    : 'light';
  };
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());

  const toggleTheme = () => {
    if (typeof localStorage !== 'undefined') {
      if (getCurrentTheme() === 'dark') {
        localStorage.theme = 'light';
        window.dispatchEvent(new Event('storage'));
        setCurrentTheme('light');
      } else {
        localStorage.theme = 'dark';
        window.dispatchEvent(new Event('storage'));
        setCurrentTheme('dark');
      }
    }
  };

  return {
    currentTheme,
    toggleTheme,
  };
};
