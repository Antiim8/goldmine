import * as React from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import type { Deal } from '../types';

export function DealsTable({ data }: { data: Deal[] }) {
  const columns = React.useMemo<ColumnDef<Deal>[]>(() => [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Titel', accessorKey: 'title' },
    { header: 'Preis', accessorKey: 'price', cell: info => info.getValue() == null ? '—' : `€ ${Number(info.getValue()).toFixed(2)}` },
    { header: 'Erstellt', accessorKey: 'createdAt', cell: info => info.getValue() ? new Date(String(info.getValue())).toLocaleString() : '—' },
  ], []);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <table style={{width:'100%', borderCollapse:'collapse'}}>
      <thead>
        {table.getHeaderGroups().map(hg => (
          <tr key={hg.id}>
            {hg.headers.map(h => (
              <th key={h.id} style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:'8px'}}>
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} style={{borderBottom:'1px solid #f1f1f1', padding:'8px'}}>
                {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.header, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (<tr><td colSpan={4} style={{padding:'12px', color:'#999'}}>Keine Deals gefunden.</td></tr>)}
      </tbody>
    </table>
  );
}
