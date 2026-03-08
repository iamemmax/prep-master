/**
 * Returns whether a value is either a string or an array of strings.
 * @param value - The value to check.
 * @returns True if the value is a string or an array of strings, false otherwise.
 */
export function isStringOrArrayOfStrings(
  value: unknown
): value is string | string[] {
  return (
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(item => typeof item === 'string'))
  );
}

/**
 * @param string A string in lower or upper case to be converted to title case.
 * @returns The input string formatted to title case.
 * KPONGETTE becomes Kpongette
 * https://stackoverflow.com/a/196991/15063835
 */
export function convertToTitleCase(string: string | undefined | null): string {
  if (!string) return ""; // Return empty string if string is null or undefined
  
  return string.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * @param string A string (in kebab or snake case) to be converted to title case.
 * @returns The input string formatted to title case.
 * transactions__today-tomorrow becomes Transactions Today Tomorrow
 * https://stackoverflow.com/a/64489760/15063835
 */
export function convertKebabAndSnakeToTitleCase(string: string | undefined) {
  if (!string) {
    return '';
  }

  // Remove hyphens and underscores
  const formattedString = string
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());

  return convertToTitleCase(formattedString);
}

/**
 * @param string A user's (full, first or last) name.
 * @returns The intials of the user.
 */
export const getInitials = (string: string) => {
  const names = string.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }

  return initials;
};

/**
 * @param string The original heading of the page.
 * @returns The acronym to represent the page name or the original page name.
 */
export const getPageInitials = (string: string) => {
  const names = string.split(' ');

  if (names.length === 1) {
    return string;
  }

  let initials = '';

  for (const name of names) {
    initials += name.substring(0, 1).toUpperCase();
  }

  return initials;
};

export const  maskPhoneNumber = (phoneNumber:string)=> {
     if (phoneNumber.length < 7) {
        return phoneNumber; // Return the original number if it's too short to mask
    }

    const start = phoneNumber.slice(0, 4);
    const end = phoneNumber.slice(-3);
    return start + '****' + end;
}

/**
 * Removes all whitespace characters from a string
 * @param str - The string to remove spaces from
 * @returns A new string with all spaces removed
 */
export function removeAllSpaces(str: string): string {
  return str.replace(/\s+/g, '');
}




// Email masking utility function
export const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email
    
    const [localPart, domain] = email.split('@')
    
    // Show first 3 characters, mask the rest
    const visibleChars = Math.min(3, localPart.length)
    const maskedLocal = localPart.substring(0, visibleChars) + '*****'
    
    return `${maskedLocal}@${domain}`
}