// TODO: replace with the real credit balance from the billing API once it
// exists. Single source of truth so swapping it out only touches this file.
export function useCreditBalance(): { remaining: number; total: number } {
  return { remaining: 100, total: 250 };
}
