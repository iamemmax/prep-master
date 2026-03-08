/**
 * Adds or updates the 'maximum-scale' attribute in the meta viewport tag to disable text field zooming on iOS devices.
 */
const addMaximumScaleToMetaViewport = () => {
  // Find the meta viewport tag in the document.
  const el = document.querySelector('meta[name=viewport]');

  if (el !== null) {
    // Get the current 'content' attribute value, with a fallback to an empty string if it's null.
    let content = el.getAttribute('content') || '';

    // Regular expression to match 'maximum-scale' attribute.
    const re = /maximum\-scale=[0-9\.]+/g;

    // Check if 'maximum-scale' attribute already exists.
    if (re.test(content)) {
      // Replace the existing 'maximum-scale' value with '1.0'.
      content = content.replace(re, 'maximum-scale=1.0');
    } else {
      // Add 'maximum-scale=1.0' to the 'content' attribute.
      content = [content, 'maximum-scale=1.0'].join(', ');
    }

    // Update the 'content' attribute of the meta viewport tag.
    el.setAttribute('content', content);
  }
};

// Alias for addMaximumScaleToMetaViewport.
export const disableIOSTextFieldZoom = addMaximumScaleToMetaViewport;

// Function to check if the current device is an iOS device.
// Source: https://stackoverflow.com/questions/9038625/detect-if-device-is-ios/9039885#9039885
export const checkIsIOS = () =>
  [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ].includes(navigator.platform) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
