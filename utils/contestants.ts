/**
 * Removes the lowest N balances from an array of contestant balances.
 * 
 * @param balances - Array of contestant balance objects
 * @param eliminationCount - Number of contestants to eliminate (default: 2)
 * @param removeEliminated - Whether to remove eliminated contestants from the array (default: false)
 * @returns Array of balances with the lowest N either marked as eliminated or removed
 */
export function processEliminatedContestants(
  balances: Array<{
    contestant_id: number;
    contestant_name: string;
    balance: number;
    [key: string]: any;
  }>,
  eliminationCount: number = 2,
  removeEliminated: boolean = false
): Array<{
  contestant_id: number;
  contestant_name: string;
  balance: number;
  isEliminated?: boolean;
  [key: string]: any;
}> {
  if (!balances || !Array.isArray(balances) || balances.length === 0) {
    return [];
  }

  // Ensure elimination count is valid
  const validEliminationCount = Math.min(
    Math.max(0, eliminationCount), // Ensure non-negative
    balances.length - 1 // Don't eliminate everyone
  );

  // Sort balances by amount (descending)
  const sortedBalances = [...balances].sort(
    (a, b) => parseFloat(String(b.balance)) - parseFloat(String(a.balance))
  );
  
  if (removeEliminated) {
    // Remove the lowest N contestants completely
    return sortedBalances.slice(0, sortedBalances.length - validEliminationCount);
  } else {
    // Mark the lowest N contestants as eliminated
    return sortedBalances.map((balance, index) => ({
      ...balance,
      isEliminated: index >= sortedBalances.length - validEliminationCount
    }));
  }
}
