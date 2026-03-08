/**
 * Checks if a number is even.
 * @param num - The number to check.
 * @returns `true` if the number is even, `false` otherwise.
 */
export function isEven(num: number): boolean {
  return num % 2 === 0;
}

/**
 * Add commas to number
 * @param number - The number to check.
 *  @param caseType - The display area.
 * @returns commas separated number or empty string based on the caseTye
 */
export const addCommasToNumber = (number: number, caseType = 'DISPLAY') => {
  if (number == 0 && caseType == 'DISPLAY') {
    return number;
  } else if (number == 0 && caseType == 'INPUT') {
    return '';
  }

  return (
    Boolean(number) &&
    parseFloat(number.toString()).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  );
};

/**
 * Add commas to number
 * @param inputText - The number to check.
 * @returns commas separated number
 */

export const addCommasToInputText = (inputText: string) => {
  // Split the input into integer and decimal parts
  const parts = inputText?.split('.');

  // Format the integer part with commas
  const formattedInteger = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine the formatted integer part with the decimal part (if present)
  const result =
    parts.length > 1 ? `${formattedInteger}.${parts[1]}` : formattedInteger;

  return result;
};

/**
 * Check if Commas separated value is a Number
 * @param commas - The string or number to validate.
 * @returns a string of validated number or empty string if not a number
 */
export const removeCommas = (commas: string | number) => {
  const cleanedString = commas?.toString().replace(/,/g, '');
  // .split(',').join('');

  // console.log(commas);
  // if (isNaN(Number(cleanedString))) {
  //   return '';
  // }
  return cleanedString;
};

/**
 * Shorten FIGURES
 * @param number - The number to check.
 *  @param caseType - The display area.
 * @returns shortened number based on zero figures :)
 */
export const shortenNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k';
  } else {
    return number.toString();
  }
};

/**
 * Format a number with a short symbol representing its magnitude (e.g., k, M, G).
 * For example, shortenNumberWithReadableSymbols(1500, 1) returns "1.5k".
 * @param numberToFormat - The number to be formatted.
 * @param decimalDigits - The number of decimal digits to display.
 * @param controlLimit - The lowest number at which shortening should begin.
 * @returns A formatted string representation of the number with magnitude symbol.
 */
export const shortenNumberWithReadableSymbols = (
  numberToFormat: number,
  decimalDigits: number,
  controlLimit = 1e3
): string => {
  if (numberToFormat < controlLimit) {
    return String(numberToFormat);
  }

  // Magnitude symbol lookup table
  const magnitudeSymbols: { value: number; symbol: string }[] = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'E15' },
    { value: 1e18, symbol: 'E18' },
  ];

  // Regular expression to clean up unnecessary decimals
  const decimalCleanupRegex = /\.0+$|(\.[0-9]*[1-9])0+$/;

  // Find the appropriate magnitude symbol based on the number
  const selectedMagnitude = magnitudeSymbols
    .slice()
    .reverse()
    .find(magnitude => numberToFormat >= magnitude.value);

  // Format the number with magnitude symbol or default to "0"
  return selectedMagnitude
    ? (numberToFormat / selectedMagnitude.value)
        .toFixed(decimalDigits)
        .replace(decimalCleanupRegex, '$1') + selectedMagnitude.symbol
    : '0';

   
};
 
export const toWholeNumber = (value: string | number | null | undefined): string => {
  const num = Number(value || 0);
  return Math.floor(num).toLocaleString();
};
