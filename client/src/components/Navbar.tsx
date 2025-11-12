import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", name_en: "Home", href: "/" },
    { name: "المميزات", name_en: "Features", href: "/features" },
    { name: "القطاعات", name_en: "Industries", href: "/industries" },
    { name: "الأسعار", name_en: "Pricing", href: "/pricing" },
    { name: "من نحن", name_en: "About", href: "/about" },
    { name: "تواصل معنا", name_en: "Contact", href: "/contact" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg' 
        : 'bg-transparent backdrop-blur-md border-b border-white/10'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300" data-testid="link-logo-home">
            <img src={logo} alt="موتفلكس" className="h-14 w-auto drop-shadow-lg" data-testid="logo-main" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-all duration-300 font-medium relative group ${
                  isScrolled 
                    ? 'text-foreground hover:text-secondary' 
                    : 'text-white hover:text-primary'
                }`}
                data-testid={`link-nav-${link.name_en.toLowerCase()}`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                  isScrolled ? 'bg-secondary' : 'bg-primary'
                }`}></span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button 
              size="default" 
              asChild 
              className={`transition-all duration-300 ${
                isScrolled 
                  ? 'bg-secondary hover:bg-secondary/90 text-white' 
                  : 'bg-white/20 backdrop-blur-md border-2 border-white hover:bg-white/30 text-white shadow-xl font-semibold'
              }`}
              data-testid="button-free-trial-nav"
            >
              <Link href="/free-trial">جرّب مجانًا</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 transition-colors ${isScrolled ? 'text-foreground' : 'text-white'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            data-testid="button-mobile-menu-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-3 bg-background/95 backdrop-blur-xl border-t border-border/20">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
                data-testid={`link-mobile-${link.name_en.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
            <Button variant="default" size="lg" className="w-full mt-4" asChild data-testid="button-free-trial-mobile">
              <Link href="/free-trial" onClick={() => setIsOpen(false)}>
                جرّب مجانًا
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
