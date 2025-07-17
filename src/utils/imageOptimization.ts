/**
 * Image optimization utilities for improved performance
 */

// Default image loading options
const DEFAULT_OPTIONS = {
  quality: 80,
  lazy: true,
  placeholder: true,
  sizes: [320, 640, 1024, 1920],
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (
  src: string,
  sizes: number[] = DEFAULT_OPTIONS.sizes
): string => {
  // For remote images, we'll use a hypothetical image service
  if (src.startsWith('http')) {
    return sizes
      .map(size => `${src}?width=${size} ${size}w`)
      .join(', ');
  }
  
  // For local images, we'd use Vite's import.meta.glob in the component
  return '';
};

/**
 * Generate low-quality image placeholder
 */
export const generatePlaceholder = (src: string): string => {
  // In a real implementation, this would generate a tiny placeholder
  // For now, we'll return a simple placeholder URL
  if (src.startsWith('http')) {
    return `${src}?width=20&quality=10`;
  }
  return '';
};

/**
 * Get appropriate image size based on viewport
 */
export const getResponsiveSize = (
  viewportWidth: number,
  containerWidth: number = viewportWidth
): number => {
  // Calculate appropriate image size based on device pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;
  const idealSize = containerWidth * pixelRatio;
  
  // Find the closest size from our predefined sizes
  return DEFAULT_OPTIONS.sizes.reduce((prev, curr) => {
    return (Math.abs(curr - idealSize) < Math.abs(prev - idealSize)) ? curr : prev;
  }, DEFAULT_OPTIONS.sizes[0]);
};

/**
 * Preload critical images
 */
export const preloadCriticalImages = (imagePaths: string[]): void => {
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
};

/**
 * Lazy load images that are not in the viewport
 */
export const setupLazyLoading = (): void => {
  // Use native lazy loading if available
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.src = img.dataset.src || '';
        img.loading = 'lazy';
      }
    });
  } else {
    // Fallback to Intersection Observer
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target as HTMLImageElement;
            if (lazyImage.dataset.src) {
              lazyImage.src = lazyImage.dataset.src;
              lazyImage.removeAttribute('data-src');
              lazyImageObserver.unobserve(lazyImage);
            }
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        lazyImageObserver.observe(img);
      });
    }
  }
};

export default {
  generateSrcSet,
  generatePlaceholder,
  getResponsiveSize,
  preloadCriticalImages,
  setupLazyLoading,
};