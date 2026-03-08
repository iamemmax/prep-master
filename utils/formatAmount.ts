
 export const formatValue = (value: number): string => {
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(1) + 'B'; // Format as billions
        } else if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(0) + 'M'; // Format as millions
        }
        return value.toString(); // Return the number as is if less than a million
    };