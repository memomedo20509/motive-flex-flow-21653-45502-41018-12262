import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageScaffoldProps {
  children: React.ReactNode;
  className?: string;
}

export function PageScaffold({ children, className = "" }: PageScaffoldProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`} dir="rtl">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
