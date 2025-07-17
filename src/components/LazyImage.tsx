import React, { useState, useEffect, useRef } from 'react';
import { generateSrcSet, generatePlaceholder } from '../utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage component for optimized image loading
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Responsive srcset generation
 * - Low-quality image placeholder
 * - Blur-up animation
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderColor = '#1e3a8a',
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Generate srcset for responsive images
  const srcSet = src.startsWith('http') ? generateSrcSet(src) : undefined;
  
  // Generate placeholder for blur-up effect
  const placeholder = src.startsWith('http') ? generatePlaceholder(src) : undefined;
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // Start loading when image is 200px from viewport
        threshold: 0.01,
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);
  
  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error event
  const handleError = () => {
    if (onError) onError();
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        backgroundColor: placeholderColor,
      }}
    >
      {/* Placeholder with blur effect */}
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 filter blur-xl"
          style={{ opacity: isLoaded ? 0 : 0.5 }}
        />
      )}
      
      {/* Actual image with lazy loading */}
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        srcSet={isInView ? srcSet : undefined}
        data-src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
      />
      
      {/* Loading indicator */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default LazyImage;