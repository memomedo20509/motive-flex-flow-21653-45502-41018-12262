import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { LucideIcon } from "lucide-react";

interface CTASectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  primaryButtonIcon?: LucideIcon;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  className?: string;
}

export function CTASection({
  title,
  description,
  primaryButtonText,
  primaryButtonLink,
  primaryButtonIcon: PrimaryIcon,
  secondaryButtonText,
  secondaryButtonLink,
  className = "",
}: CTASectionProps) {
  return (
    <section className={`py-16 px-4 gradient-hero text-white relative overflow-hidden ${className}`} data-testid="section-cta">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className="container mx-auto text-center relative z-10 stagger-children">
        <AnimateOnScroll>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-cta">
            {title}
          </h2>
        </AnimateOnScroll>
        
        <AnimateOnScroll>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95 leading-relaxed" data-testid="text-cta-description">
            {description}
          </p>
        </AnimateOnScroll>
        
        <AnimateOnScroll>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="default"
              className="px-10 bg-white text-primary hover:bg-white/90 shadow-xl font-bold"
              asChild
              data-testid="button-cta-primary"
            >
              <Link href={primaryButtonLink}>
                {PrimaryIcon && <PrimaryIcon className="ml-2 w-4 h-4" />}
                {primaryButtonText}
              </Link>
            </Button>
            
            {secondaryButtonText && secondaryButtonLink && (
              <Button
                size="default"
                variant="outline"
                className="px-10 border-2 border-white bg-white/20 text-white hover:bg-white/30 backdrop-blur-md shadow-xl font-semibold"
                asChild
                data-testid="button-cta-secondary"
              >
                <Link href={secondaryButtonLink}>
                  {secondaryButtonText}
                </Link>
              </Button>
            )}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
