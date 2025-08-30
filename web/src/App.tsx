import React from 'react'
import DealsTable from '@/features/deals/DealsTable'

function NavBar() {
  return (
    <nav className="bg-secondary border-b border-custom px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 accent-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 2l3 6h6l3-6H6zM4 9l8 13 8-13H4z" />
          </svg>
          <h1 className="text-2xl font-bold logo-text accent-gold">Goldmine</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const html = document.documentElement
              const isLight = html.classList.toggle('light')
              if (!isLight) html.classList.remove('light')
              localStorage.setItem('theme', isLight ? 'light' : 'dark')
            }}
            className="p-2 rounded-lg hover-bg transition-colors"
            title="Toggle theme"
          >
            <svg className="w-5 h-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
          <button className="bg-accent-gold text-black px-4 py-2 rounded-lg font-medium">
            Add Deal
          </button>
          <div className="w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-black">JD</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  React.useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    if (saved === 'light') document.documentElement.classList.add('light')
  }, [])

  return (
    <div className="min-h-screen bg-primary text-primary">
      <NavBar />
      <main className="max-w-full mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-primary">Deals Dashboard</h2>
          <p className="text-muted">Discover the best deals and offers available today</p>
        </div>

        <DealsTable />
      </main>
    </div>
  )
}
