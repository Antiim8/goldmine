// web/src/pages/Dashboard.tsx
import React from 'react'
import DealsTable from '@/features/deals/DealsTable'

export default function Dashboard() {
  return (
    <div className="max-w-full mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-primary">Deals Dashboard</h2>
        <p className="text-muted">Discover the best deals and offers available today</p>
      </div>

      <DealsTable />
    </div>
  )
}
