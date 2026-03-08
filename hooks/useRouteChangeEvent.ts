import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

/**
 * Hook to listen for changes to the current route's url.
 *
 * @param onUrlChange A function to be called when the url changes.
 */
export default function useRouteChangeEvent(onUrlChange: () => void) {
  const pathname = usePathname(); // Get current route.
  const searchParams = useSearchParams();

  const url = pathname + searchParams.toString();

  // Save url on component mount into a Ref.
  const savedUrlRef = React.useRef(url);

  React.useEffect(() => {
    // If Ref has been changed, run callback function.
    if (savedUrlRef.current !== url) {
      onUrlChange();

      // Update Ref
      savedUrlRef.current = url;
    }
  }, [url, onUrlChange]);
}
