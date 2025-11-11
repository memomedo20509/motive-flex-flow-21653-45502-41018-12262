import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="text-center px-4">
        <h1 className="text-8xl md:text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          عذراً، الصفحة غير موجودة
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          الصفحة التي تبحث عنها قد تكون محذوفة أو غير متاحة
        </p>
        <Button size="lg" variant="default" asChild>
          <Link href="/" className="gap-2">
            <Home size={20} />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
