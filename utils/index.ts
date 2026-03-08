/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AxiosError } from "axios";

import { format } from "date-fns";

import toast from "react-hot-toast";
export type ToastNotification = 'success' | 'error' | 'neutral';

/**
 * @param string A user's (full, first or last) name.
 * @returns The intials of the user.
 */
export const getInitials = (string: string) => {
  const names = string.split(" ");
  let initials = names[0].substring(0, 1).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }

  return initials;
};

/**
 * @param string A string in lower or uppper case to be converted to title case.
 * @returns The input string formatted to title case.
 * KPONGETTE becomes Kpongette
 * https://stackoverflow.com/a/196991/15063835
 */
export const convertToTitleCase = (string: string) =>
  string.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );

/**
 * @param string A string (in kebab or snake case) to be converted to title case.
 * @returns The input string formatted to title case.
 * transactions__today-tomorrow becomes Transactions Today Tomorrow
 * https://stackoverflow.com/a/64489760/15063835
 */
export const convertKebabAndSnakeToTitleCase = (string: string) => {
  // Remove hyphens and underscores
  const formattedString = string
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => ` ${c.toUpperCase()}`);

  return convertToTitleCase(formattedString);
};

/**
 * @param form An HTML form element containing a field with a value to be extracted.
 * @param valueName The name of the value to be extracted from the form.
 * @returns The value extracted from the form (input) field.
 */
export const getInputValueFromForm = (
  form: HTMLFormElement,
  valueName: string
) => {
  const { value } = form.elements.namedItem(valueName) as HTMLInputElement;
  return value;
};

/**
 * @param string Any camelCase or PascalCase string.
 * @returns A string with separated words PascalCase becomes Pascal Case, HODBank becomes HOD Bank etc.
 */
export const insertSpacesBeforeCapitalLetters = (string: string) => {
  string = string.replace(/([a-z])([A-Z])/g, "$1 $2");
  string = string.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  return string;
};

/**
 * @param string A string, usually completely in lowercase.
 * @returns The argument strign with its first letter capitalized.
 */
export const capitalizeFirstLetter = (string: string) => {
  const stringWithSpaces = insertSpacesBeforeCapitalLetters(
    string?.toLowerCase()
  );

  return (
    (stringWithSpaces &&
      stringWithSpaces.charAt(0).toUpperCase() + stringWithSpaces.slice(1)) ||
    ""
  );
};

/**
 * @param error An axios error instance. Usually returned by React Query.
 * @returns The error message formatted for the UI. Contents of an array are merged into a single string.
 */
export const formatAxiosErrorMessage = (
  // Typed as any because errors from server do not have a consistent shape.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  error: AxiosError<any, any>
) => {
  const firstDigitInResponseStatus = String(error?.response?.status).charAt(0);

  if (firstDigitInResponseStatus === "5") {
    return "Server Error";
  }

  // Return default error message string if user is not connected to the internet.
  if (error?.code === "ERR_NETWORK") {
    return `${error.message}. Please check your internet connection.`;
  }

  const errorMessage = Object.values(error?.response?.data).flat();

  if (Array.isArray(errorMessage)) {
    const allMessages = errorMessage
      //@ts-expect-error blablabla
      .filter((m) => isNaN(m) && typeof m === "string")
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      .map((m) => capitalizeFirstLetter(m))
      .join(". ");

    return `${allMessages}`;
  }
};

/**
 * @param date The date to be formatted.
 * @param withTime A boolean determining whether or not the date is returned with a time value.
 * @returns The time (or time and date) formatted akin to 0/09/2021, 6 AM.
 */
export const formatShortDate = (
  date: string | Date,
  withTime: boolean
): string => {
  if (withTime) {
    return format(new Date(date), "dd/MM/yyyy, h aaa");
  }

  return format(new Date(date), "dd/MM/yyyy");
};

const getNotificationColor = (notificationType: ToastNotification) => {
  switch (notificationType) {
    case "success": {
      return "#065f46";
    }

    case "error": {
      return "#b91c1c";
    }

    case "neutral": {
      return "#2B0E44";
    }

    default: {
      throw new Error(`Unsupported notification type: ${notificationType}`);
    }
  }
};

export const launchNotification = (type: ToastNotification, text: string) => {
  toast(text, {
    style: {
      padding: "8px 20px",
      backgroundColor: getNotificationColor(type),
      color: "#ffffff",
      textAlign: "center",
      overflowWrap: "break-word",
      overflow: "auto",
      bottom: "32px",
      fontSize: "14px",
    },
  });
};
export const addCommasToNumber = (number?: number | null): string =>
  typeof number === "number"
    ? number.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : "0";

export const withoutFirstAndLast = (str: string) => str.slice(1, -1);

export const clampNumber = (number: number, min: number, max: number) =>
  Math.max(min, Math.min(number, max));

/**
 * @param date The date to be formatted.
 * @param withTime A boolean determining whether or not the date is returned with a time value.
 * @returns The time (or time and date) formatted akin to 0/09/2021, 6 AM.
 */
export const formatShortDateTime = (
  date: string,
  withTime: boolean
): string => {
  if (withTime) {
    return format(new Date(date), "dd/MM/yyyy, h aaa");
  }

  return format(new Date(date), "dd/MM/yyyy");
};

export const amountNumberFormat = (value: number | bigint) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
  }).format(value);
  
// export const formatCurrency = (value: number | bigint) => {
//   // Format the number using Intl.NumberFormat with currency style
//   const formattedValue = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "NGN",
//   }).format(value);
  
//   // Prepend "NGN" before the formatted value
//   return `₦ ${formattedValue}`;
// };


export const formatCurrency = (value: number | bigint) => {
  // Format the value to a currency string
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "code", // Displays the currency code instead of the symbol
  }).format(value).replace(/^NGN\s/, '₦'); // Removes the "NGN " from the start

  // Remove trailing ".00" if present
  return formatted.replace(/\.00$/, '');
};

export function removeCommaFromPrice(price:string) {
    return price.replace(/,/g, '');
}


/**
 * @function convertArrayOfObjectsToArrayOfArrays
 * @template ObjectType
 * @param {ObjectType[]} objArray - Array of objects to be converted
 * @param {number} itemsPerArray - Number of items per sub-array
 * @returns {ObjectType[][]} - Array of arrays of objects
 *
 * @description
 * This function takes an array of objects and converts it into an array of arrays. Each sub-array will contain no more than the specified number of items.
 */
export const convertArrayOfObjectsToArrayOfArrays = <ObjectType>(
  objArray: ObjectType[],
  itemsPerArray = 10
): ObjectType[][] => {
  const result: ObjectType[][] = [];
  let subArray: ObjectType[] = [];
  for (let i = 0; i < objArray.length; i++) {
    if (i % itemsPerArray === 0 && i !== 0) {
      result.push(subArray);
      subArray = [];
    }
    subArray.push(objArray[i]);
  }
  result.push(subArray);
  return result;
};

/**
 * Converts a string in the format "50/50" to an actual percentage number
 * @param {string} value - A string in the format "50/50"
 * @returns {number} - The percentage value
 * @throws {Error} - Will throw an error if the format of the input is not as expected
 *
 * @example
 * convertToPercentage("50/50"); // returns 100
 */
export const convertStringFractionToPercentage = (value: string): number => {
  const parts = value.split("/");
  if (parts.length !== 2) {
    throw new Error("Invalid format, expected format 50/50");
  }
  const numerator = parseFloat(parts[0]);
  const denominator = parseFloat(parts[1]);
  return (numerator / denominator) * 100;
};


export function validatePhoneNumber(phoneNumber: string): string {
  return /^[0-9]*$/.test(phoneNumber) ? phoneNumber : ""; // Return empty string if non-numeric
}
