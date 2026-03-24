// Formatting utilities for dates, currency, and support tiers

/**
 * Format a date string into locale-friendly format.
 * @param {string|Date} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

/**
 * Format a number as USD currency.
 * @param {number|string} value
 * @returns {string}
 */
export function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}

/**
 * Map a tier key to a human-readable label.
 * @param {'Tier1'|'Tier2'|'Tier3'|'Tier4'|'Unknown'} tier
 * @returns {string}
 */
export function formatTier(tier) {
  const labels = {
    Tier1: 'Tier 1 — 7x24 OEM',
    Tier2: 'Tier 2 — NBD (7% save)',
    Tier3: 'Tier 3 — None (100% save)',
    Tier4: 'Tier 4 — 3rd Party (80% save)',
    Unknown: 'Unknown',
  };
  return labels[tier] || tier;
}

/**
 * Return true if a warranty end date is within `months` months from today.
 * @param {string} warrantyEndDate
 * @param {number} months
 * @returns {boolean}
 */
export function isWarrantyExpiringSoon(warrantyEndDate, months = 12) {
  if (!warrantyEndDate) return false;
  const end = new Date(warrantyEndDate);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + months);
  return end <= cutoff && end >= new Date();
}
