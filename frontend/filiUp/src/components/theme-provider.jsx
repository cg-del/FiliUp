import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children, defaultTheme = "light", storageKey = "ui-theme", ...props }) {
  const [theme, setTheme] = useState(() => {
    const storedValue = localStorage.getItem(storageKey);
    return storedValue || defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, toggleTheme }} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 