import * as React from 'react';

/**
 * Custom hook to create an object URL for a selected file and manage its preview.
 * @param selectedFile - The selected file to create the object URL for.
 * @returns The object URL for the selected file, or undefined if no file is selected.
 */
export default function useImageObjectURL(
  selectedFile: File | undefined
): string | undefined {
  const [preview, setPreview] = React.useState<string | undefined>();

  // Create a preview as a side effect, whenever the selected file is changed.
  React.useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Free memory when this component is unmounted.
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  return preview;
}
