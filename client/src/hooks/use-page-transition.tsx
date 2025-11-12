import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to handle page transitions:
 * - Scroll to top when location changes (respects reduced motion)
 * - Deferred until after transition animation starts
 */
export function usePageTransition() {
  const [location] = useLocation();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Defer scroll to top until after page transition starts
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }, [location]);

  return location;
}
