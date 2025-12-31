import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return saved === "true";
    }
    // Default to light mode
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    console.log("HTML element classes after:", root.className);
    localStorage.setItem("darkMode", String(isDark));
  }, [isDark]);

  const toggle = () => {
    setIsDark(!isDark);
  };

  return { isDark, toggle };
}
