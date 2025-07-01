import { parseISO, format, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Renders a hex ID (like a pool address or token address) in a shortened format.
// Example: 0xabcdef1234567890 -> 0xabcd...7890
export const renderHexId = (id: string): string => {
  if (!id) return '';
  // Assuming 0x prefix, we want 0x + 4 chars + ... + 4 chars
  // 0x (2) + first 4 (4) + ... (3) + last 4 (4) = 13 characters minimum for abbreviation
  if (id.length <= 10) return id; // Handles cases like "0x" + 8 chars or less, too short to abbreviate this way
  return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`; // 0x + first 4 chars, ..., last 4 chars
};

// Formats a spot price using scientific notation for very small/large numbers
export const formatSpotPrice = (price: number | null | undefined): string => {
  if (price == null) return '-';
  
  // Use scientific notation for very small numbers (< 0.001) or very large numbers (> 1M)
  if (price !== 0 && (Math.abs(price) < 0.001 || Math.abs(price) > 1000000)) {
    return price.toExponential(2); // e.g., 1.23e-9
  }
  
  // For "normal" range, format with appropriate decimals
  if (price < 1) {
    // Show up to 6 decimal places, but remove trailing zeros
    return parseFloat(price.toFixed(6)).toString();
  } else if (price < 1000) {
    // Show up to 4 decimal places, but remove trailing zeros
    return parseFloat(price.toFixed(4)).toString();
  } else {
    // For larger numbers, show up to 2 decimal places
    return price.toFixed(2);
  }
};

// Fallback string for invalid or missing timestamps
const INVALID_TIMESTAMP_FALLBACK = "N/A";
// Fallback string for date parsing errors
const PARSE_ERROR_FALLBACK = "Invalid date";

// = From Problem Analysis to Data Definitions
// Information: A timestamp string, current time.
// Representation: Timestamp as string (ISO 8601), current time implicitly from Date.now().
// Data Definitions:
//   TimestampInput = string | undefined | null;
//   FormattedOutput = string; (e.g., "5 seconds ago", "2023-05-20, 10:30:00")

// = Signature, Purpose Statement, Header
/**
 * Formats a timestamp string into a user-friendly relative time string.
 * - If less than 1 minute ago: "last x seconds ago".
 * - If more than 1 minute ago but less than 1 hour: "last x minutes ago".
 * - If more than 1 hour ago but less than 1 day: "last x hours ago".
 * - If 1 day or older: "yyyy-MM-dd, HH:mm:ss".
 * Prevents displaying future-relative times (e.g., "in X hours") by treating them as "just now".
 *
 * @param timestampString - An ISO 8601 string (e.g., "YYYY-MM-DDTHH:mm:ss") or null/undefined.
 * @returns A human-readable string representing the time.
 */
export const formatTimeAgo = (timestampString: string | undefined | null): string => {
  // = Functional Examples
  // const now = new Date();
  // formatTimeAgo(new Date(now.getTime() - 5 * 1000).toISOString().slice(0,19)) -> "last 5 seconds ago"
  // formatTimeAgo(new Date(now.getTime() - 70 * 1000).toISOString().slice(0,19)) -> "last 1 minute ago"
  // formatTimeAgo(new Date(now.getTime() - 2 * 60 * 1000).toISOString().slice(0,19)) -> "last 2 minutes ago"
  // formatTimeAgo(new Date(now.getTime() - 70 * 60 * 1000).toISOString().slice(0,19)) -> "last 1 hour ago"
  // formatTimeAgo(new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0,19)) -> "last 3 hours ago"
  // formatTimeAgo(new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString().slice(0,19)) -> "202X-XX-XX, HH:mm:ss" (specific date/time)
  // formatTimeAgo(new Date(now.getTime() + 5 * 60 * 1000).toISOString().slice(0,19)) -> "just now"
  // formatTimeAgo(null) -> "N/A"
  // formatTimeAgo("invalid-date") -> "Invalid date"

  // = Function Template
  // 1. Handle null/undefined input.
  // 2. Try to parse the timestampString. Handle parsing errors.
  // 3. Calculate difference from now (specifically, if it's less than 1 day).
  // 4. If difference is less than 1 day (24 hours), format relatively using formatDistanceToNowStrict.
  // 5. Else (1 day or older), format absolutely using "yyyy-MM-dd, HH:mm:ss".

  // = Function Definition
  // Handle null or undefined input timestamp string
  if (!timestampString) {
    return INVALID_TIMESTAMP_FALLBACK;
  }
  


  try {
    // Parse the ISO timestamp string into a Date object
    const date = parseISO(timestampString);
    // Get the current date and time
    const now = new Date().toISOString();

    // Calculate differences in various units, ensuring they are absolute values
    const secondsDifference = Math.abs(differenceInSeconds(now, date));
    const minutesDifference = Math.abs(differenceInMinutes(now, date));
    const hoursDifference = Math.abs(differenceInHours(now, date));

    // Define the threshold for switching to absolute date format (1 day)
    const oneDayInHours = 24;

    // Determine formatting based on the duration
    if (hoursDifference >= oneDayInHours) {
      // If 1 day or older, display absolute time "yyyy-MM-dd, HH:mm:ss"
      return format(date, "yyyy-MM-dd, HH:mm:ss");
    } else if (minutesDifference >= 60) {
      // If more than 1 hour ago (but less than 1 day)
      return `${hoursDifference} hour${hoursDifference === 1 ? '' : 's'} ago`;
    } else if (secondsDifference >= 60) {
      // If more than 1 minute ago (but less than 1 hour)
      return `${minutesDifference} minute${minutesDifference === 1 ? '' : 's'} ago`;
    } else {
      // If less than 1 minute ago
      return `${secondsDifference} second${secondsDifference === 1 ? '' : 's'} ago`;
    }
  } catch (error) {
    // Log error for debugging purposes
    console.error("Error parsing date for formatTimeAgo:", timestampString, error);
    // Return a fallback string for parsing errors
    return PARSE_ERROR_FALLBACK;
  }
};