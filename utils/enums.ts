/**
 * Creates an enum-like array of values from an array of options.
 * The resulting array would be acceptable by the z.enum() method
 * Inspired by: https://stackoverflow.com/a/73825370
 * @param options - The array of options with a `value` property.
 * @returns An array of values extracted from the `value` property of each option.
 */
export function createEnumFromOptions<T extends { value: V }, V>(
  options: T[]
): V[] {
  type Option = (typeof options)[number]['value'];
  const VALUES: [Option, ...Option[]] = [
    options[0].value,
    ...options.slice(1).map(p => p.value),
  ];

  return VALUES as [Option, ...Option[]];
}




export const GAME_STATUSES_ENUMS: Record<string,string> = {
  'IN_ACTIVE' : "Inactive",
  'IN_PROGESS': "In Progress",
  'IS_COMPLETED': 'Completed'
}