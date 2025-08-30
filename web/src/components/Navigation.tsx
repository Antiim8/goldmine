import { Theme } from "@/hooks/useTheme";

export default function Navigation({
  theme,
  onToggleTheme,
}: { theme: Theme; onToggleTheme: () => void }) {
  const sun = (
    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
  );
  const moon = <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />;

  return (
    <nav className="bg-secondary border-b border-custom px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <svg className="h-8 w-8 accent-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2l3 6h6l3-6H6zM4 9l8 13 8-13H4z" />
            </svg>
            <h1 className="logo-text text-2xl font-bold accent-gold">Goldmine</h1>
          </div>
          <div className="hidden space-x-6 md:flex">
            {["Dashboard", "Categories", "Favorites", "Settings"].map((item) => (
              <a key={item} href="#" className="text-secondary transition-colors hover:text-primary">
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={onToggleTheme} className="rounded-lg p-2 hover-bg transition-colors" title="Toggle theme">
            <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
              {theme === "dark" ? sun : moon}
            </svg>
          </button>
          <button className="bg-accent-gold hover:bg-accent-gold text-black rounded-lg px-4 py-2 font-medium">
            Add Deal
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold">
            <span className="text-sm font-medium text-black">JD</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
