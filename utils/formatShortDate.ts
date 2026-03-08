import { format } from 'date-fns';

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
    return format(new Date(date), 'dd/MM/yyyy, h aa');
  }

  return format(new Date(date), 'dd/MM/yyyy');
};
