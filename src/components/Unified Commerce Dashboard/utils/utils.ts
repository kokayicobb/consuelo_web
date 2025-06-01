// src/lib/utils.ts

export const formatCurrency = (amount: number | undefined): string => {
  if (typeof amount !== 'number') return ''; // Handle undefined or non-numeric input gracefully
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    // Basic validation for YYYY-MM-DD format, adjust if other formats are common
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // Attempt to parse anyway, but log a warning for potentially non-standard formats
        // console.warn(`formatDate received a potentially non-standard date string: ${dateString}`);
    }
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
        // console.error("Invalid date string provided to formatDate after parsing:", dateString);
        return dateString; // Return original string if parsing results in an invalid date
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (error) {
    console.error("Error formatting date string:", dateString, error);
    return dateString; // Return original string if formatting fails
  }
};