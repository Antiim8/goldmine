import React from 'react'
import { useQuery } from '@tanstack/react-query'

type Deal = {
  id: number
  name: string
  liquidity: number
  buff: number
  csgoTm: number
  vol7d: number
  purch: number
  target: number
  youpin: number
  margin: number
}

function currency(n: number) {
  return '$' + n.toFixed(2)
}

export default function DealsTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await fetch('/api/deals')
      if (!res.ok) {
        throw new Error('Failed to fetch deals: ' + res.status)
      }
      return (await res.json()) as Deal[]
    },
    staleTime: 15000
  })

  if (isLoading) return <div className="p-6 text-secondary">Loading deals...</div>
  if (error) return <div className="p-6 text-red-500">Failed to load deals.</div>

  const deals = data ?? []

  return (
    <div className="bg-secondary rounded-xl border border-custom overflow-hidden">
      <table className="w-full">
        <thead className="bg-tertiary">
          <tr>
            {['Nr','Item Name','Liq','Buff','CSGOTm','Vol 7d','Purch','Target','Youpin','Margin'].map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider table-text-white"
              >
                <span className="table-text-white">{h}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y border-custom">
          {deals.map((d) => (
            <tr key={d.id} className="hover-bg transition-colors">
              <td className="px-3 py-3 text-sm text-white">{d.id}</td>
              <td className="px-3 py-3 text-sm text-white">{d.name}</td>
              <td className="px-3 py-3 text-sm text-white">{d.liquidity}</td>
              <td className="px-3 py-3 text-sm text-white">{currency(d.buff)}</td>
              <td className="px-3 py-3 text-sm text-white">{currency(d.csgoTm)}</td>
              <td className="px-3 py-3 text-sm text-white">{d.vol7d}</td>
              <td className="px-3 py-3 text-sm text-white">{d.purch}</td>
              <td className="px-3 py-3 text-sm text-white">{currency(d.target)}</td>
              <td className="px-3 py-3 text-sm text-white">{currency(d.youpin)}</td>
              <td className="px-3 py-3 text-sm text-white">+{d.margin}%</td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-6 text-center text-secondary">
                No deals found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
