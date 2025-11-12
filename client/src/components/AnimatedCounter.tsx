import { useEffect, useState, useRef } from 'react';
import { useIntersection } from '@/hooks/use-intersection';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const { elementRef, isInView } = useIntersection({ threshold: 0.5, triggerOnce: true });
  const animationFrameRef = useRef<number>();
  const isMountedRef = useRef(true);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView || hasAnimatedRef.current) return;
    
    hasAnimatedRef.current = true;
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      if (!isMountedRef.current) return;
      
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startValue + (end - startValue) * easeOutExpo);
      
      setCount(current);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = undefined;
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  // Handle end prop changes
  useEffect(() => {
    if (hasAnimatedRef.current && count !== end) {
      setCount(end);
    }
  }, [end, count]);

  return (
    <span ref={elementRef as any} className={`animate-counter ${className}`}>
      {prefix}{count.toLocaleString('ar-SA')}{suffix}
    </span>
  );
}
