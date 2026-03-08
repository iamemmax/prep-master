export function hideMiddleNumbers(phoneNumber: string) {
  if (phoneNumber.length >= 11) {
    // Extract the country code and last 4 digits
    const countryCode = phoneNumber.slice(0, 4);
    const lastFour = phoneNumber.slice(-4);

    // Calculate the number of asterisks needed for the middle part
    const middleAsterisks = '*'.repeat(phoneNumber.length - 11);

    // Concatenate and return the hidden phone number
    return `${countryCode}${middleAsterisks}${lastFour}`;
  } else {
    // If the phone number is too short, return as is
    return phoneNumber;
  }
}
