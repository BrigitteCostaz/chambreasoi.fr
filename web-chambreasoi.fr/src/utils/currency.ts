export function formatEuroFR(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(euros);
}
