export function formatCurrency(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value);
}
