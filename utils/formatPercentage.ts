// Format percentage with proper handling
export const formatPercentage = (value: number | string | null | undefined): string => {
  // Handle invalid values
  if (value === null || value === undefined || isNaN(Number(value)) || !isFinite(Number(value))) {
    return '0%';
  }
  
  // Round to whole number or 1 decimal
  const absValue = Math.abs(Number(value));
  const formatted = absValue % 1 === 0 
    ? absValue.toFixed(0)  // Whole number: 10
    : absValue.toFixed(1);  // One decimal: 98.4
  
  const sign = Number(value) < 0 ? '-' : Number(value) > 0 ? '+' : '';
  return `${sign}${formatted}%`;
};