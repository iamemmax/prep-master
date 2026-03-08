// utils/statusColor.ts
export const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return { color: '#099976', backgroundColor: '#31D0AA26' };
    case 'successful':
      return { color: '#099976', backgroundColor: '#31D0AA26' };
    case 'success':
      return { color: '#099976', backgroundColor: '#31D0AA26' };
    case 'pending':
      return { color: '#FB9700', backgroundColor: '#FB970026' };
    case 'failed':
      return { color: '#EF4444', backgroundColor: '#EF444426' };
    case 'active':
      return { color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.1)' };
    case 'inactive':
      return { color: '#AAAAAA', backgroundColor: 'rgba(255, 255, 255, 0.05)' };
    default:
      return { color: '#FB9700', backgroundColor: '#FB970026' }; // Default to pending
  }
};
// dc3545
