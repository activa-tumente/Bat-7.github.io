/**
 * Utility functions for handling asset paths in different environments
 */

/**
 * Get the correct asset path for the current environment
 * @param {string} path - The asset path relative to /assets/
 * @returns {string} - The correct full path for the current environment
 */
export const getAssetPath = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development, Vite serves assets from /assets/
  // In production with base: '/Bat-7/', assets are served from /Bat-7/assets/
  const base = import.meta.env.BASE_URL || '/';
  
  // If the path already starts with 'assets/', use it as is
  if (cleanPath.startsWith('assets/')) {
    return `${base}${cleanPath}`;
  }
  
  // Otherwise, prepend 'assets/'
  return `${base}assets/${cleanPath}`;
};

/**
 * Get image path specifically for images
 * @param {string} imagePath - Path relative to /assets/images/
 * @returns {string} - The correct full path for images
 */
export const getImagePath = (imagePath) => {
  // Remove leading slash and 'assets/images/' if present
  let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  if (cleanPath.startsWith('assets/images/')) {
    cleanPath = cleanPath.replace('assets/images/', '');
  } else if (cleanPath.startsWith('images/')) {
    cleanPath = cleanPath.replace('images/', '');
  }
  
  return getAssetPath(`images/${cleanPath}`);
};

/**
 * Get test image path for specific test types
 * @param {string} testType - Type of test (espacial, atencion, razonamiento, etc.)
 * @param {string} imageName - Name of the image file
 * @returns {string} - The correct full path for test images
 */
export const getTestImagePath = (testType, imageName) => {
  return getImagePath(`${testType}/${imageName}`);
};
