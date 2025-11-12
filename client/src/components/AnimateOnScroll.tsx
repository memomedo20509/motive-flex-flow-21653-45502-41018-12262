import { useIntersection } from '@/hooks/use-intersection';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function AnimateOnScroll({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
}: AnimateOnScrollProps) {
  const { elementRef, isInView } = useIntersection({
    threshold,
    rootMargin,
    triggerOnce,
  });

  return (
    <div
      ref={elementRef as any}
      className={`animate-on-scroll ${isInView ? 'in-view' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
