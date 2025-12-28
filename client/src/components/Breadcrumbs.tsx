import { Link } from "wouter";
import { ChevronLeft, Home } from "lucide-react";
import { BreadcrumbSchema } from "./SchemaMarkup";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mutflex.com";
  
  const schemaItems = [
    { name: "الرئيسية", url: baseUrl },
    ...items.map((item) => ({
      name: item.label,
      url: item.href ? `${baseUrl}${item.href}` : baseUrl,
    })),
  ];

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
        data-testid="breadcrumbs"
      >
        <Link 
          href="/" 
          className="hover-elevate active-elevate-2 rounded p-1 flex items-center gap-1"
          data-testid="breadcrumb-home"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">الرئيسية</span>
        </Link>
        
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            {item.href && index < items.length - 1 ? (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors"
                data-testid={`breadcrumb-${index}`}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className="text-foreground font-medium"
                data-testid={`breadcrumb-current`}
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

export default Breadcrumbs;
