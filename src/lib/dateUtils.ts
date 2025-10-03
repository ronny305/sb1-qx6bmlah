/**
 * Formats a date string (YYYY-MM-DD) without timezone conversion.
 * This prevents dates from shifting by one day due to UTC/local timezone differences.
 *
 * @param dateString - ISO date string in format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
 * @returns Formatted date string using the user's locale
 */
export const formatDateWithoutTimezone = (dateString: string): string => {
  const [year, month, day] = dateString.split('T')[0].split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString();
};

/**
 * Converts a date string to the format required for HTML date inputs (YYYY-MM-DD).
 * Ensures no timezone conversion occurs.
 *
 * @param dateString - ISO date string
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateInputValue = (dateString: string): string => {
  return dateString.split('T')[0];
};
