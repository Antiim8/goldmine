import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "dark";
    apply(saved);
  }, []);

  const apply = (mode: Theme) => {
    setTheme(mode);
    document.documentElement.classList.toggle("light", mode === "light"); // dark is default
    localStorage.setItem("theme", mode);
  };

  const toggle = () => apply(theme === "dark" ? "light" : "dark");

  return { theme, toggle, setTheme: apply };
}
