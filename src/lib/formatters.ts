/**
 * Formatting utilities for Kiragu & Mwangi Ltd
 */

export function formatKES(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'KES 0';
  }
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function formatPrice(price: number, listingType?: string): string {
  const base = formatKES(price);
  if (listingType === 'rent') {
    return `${base} /month`;
  }
  return base;
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString('en-KE');
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
