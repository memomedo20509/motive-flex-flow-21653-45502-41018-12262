import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-secondary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <img src={logo} alt="موتفلكس" className="h-14 w-auto mb-6 filter drop-shadow-lg hover:scale-105 transition-transform duration-300" />
            <p className="text-sm opacity-90 leading-relaxed">
              نظام إدارة متكامل يحوّل عمليات التصنيع والتركيب إلى تجربة رقمية كاملة
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3 pt-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/features" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  المميزات
                </Link>
              </li>
              <li>
                <Link 
                  href="/industries" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  القطاعات
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  الأسعار
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  من نحن
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6">الدعم</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/contact" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link 
                  href="/free-trial" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  التجربة المجانية
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 inline-block"
                >
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-6">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm group">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border border-white/20">
                  <Phone size={18} />
                </div>
                <span dir="ltr">+966 XX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border border-white/20">
                  <Mail size={18} />
                </div>
                <span>info@mutflex.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm group">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300 border border-white/20">
                  <MapPin size={18} />
                </div>
                <span className="pt-2">المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-sm opacity-90">
            © 2025 موتفلكس. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
