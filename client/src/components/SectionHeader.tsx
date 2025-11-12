import { AnimateOnScroll } from "@/components/AnimateOnScroll";

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
  align?: "center" | "start" | "end";
}

export function SectionHeader({
  title,
  description,
  badge,
  className = "",
  align = "center",
}: SectionHeaderProps) {
  const alignClasses = {
    center: "text-center",
    start: "text-start",
    end: "text-end",
  };
  
  const alignClass = alignClasses[align];

  return (
    <div className={`mb-12 stagger-children ${className}`}>
      {badge && (
        <AnimateOnScroll>
          <div className={`${alignClass} mb-4`}>
            <span 
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold"
              data-testid="badge-section"
            >
              {badge}
            </span>
          </div>
        </AnimateOnScroll>
      )}
      
      <AnimateOnScroll>
        <h2 
          className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gradient ${alignClass}`}
          data-testid="heading-section"
        >
          {title}
        </h2>
      </AnimateOnScroll>

      {description && (
        <AnimateOnScroll>
          <p 
            className={`text-base md:text-lg text-muted-foreground max-w-3xl ${align === "center" ? "mx-auto" : ""} leading-relaxed ${alignClass}`}
            data-testid="text-section-description"
          >
            {description}
          </p>
        </AnimateOnScroll>
      )}
    </div>
  );
}
