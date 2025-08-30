export function dealKey(d: { sku?: string | null; name: string }) {
  return (d.sku ?? d.name).trim().toLowerCase();
}
