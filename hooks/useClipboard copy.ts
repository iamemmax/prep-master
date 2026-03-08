// https://github.com/mantinedev/mantine/blob/61b11aebdce6faf24659c36347ae470e57aa4179/src/mantine-hooks/src/use-clipboard/use-clipboard.ts

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function useClipboard({ timeout = 2000 } = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyTimeout, setCopyTimeout] = useState<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  const handleCopyResult = (value: boolean) => {
    clearTimeout(copyTimeout);
    setCopyTimeout(setTimeout(() => setCopied(false), timeout));
    setCopied(value);
  };

  const copy = (valueToCopy: string) => {
    if ('clipboard' in navigator) {
      navigator.clipboard
        .writeText(valueToCopy)
        .then(() =>{
          handleCopyResult(true)
          toast.success("Copied")
        })
        .catch(err => setError(err));
    } else {
      setError(new Error('useClipboard: navigator.clipboard is not supported'));
    }
  };

  const reset = () => {
    setCopied(false);
    setError(null);
    clearTimeout(copyTimeout);
  };

  return { copy, reset, error, copied };
}
