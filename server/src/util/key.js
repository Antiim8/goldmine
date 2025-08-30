export function dealKey(d) {
    return (d.sku ?? d.name).trim().toLowerCase();
}
