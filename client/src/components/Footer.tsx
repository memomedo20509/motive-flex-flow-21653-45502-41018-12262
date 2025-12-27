import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import logo from "@/assets/logo.webp";

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

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
            <img src={logo} alt="موتفلكس" width={56} height={56} loading="lazy" className="h-14 w-auto mb-6 filter drop-shadow-lg hover:scale-105 transition-transform duration-300" />
            <p className="text-sm opacity-90 leading-relaxed">
              نظام إدارة متكامل يحوّل عمليات التصنيع والتركيب إلى تجربة رقمية كاملة
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3 pt-4">
              <a 
                href="https://www.facebook.com/mutflex.sa" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="Facebook"
                data-testid="link-facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://www.instagram.com/mutflex" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="Instagram"
                data-testid="link-instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://www.tiktok.com/@mutflex25" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="TikTok"
                data-testid="link-tiktok"
              >
                <TikTokIcon size={18} />
              </a>
              <a 
                href="https://www.youtube.com/channel/UC0tAnTF88I4WI94na86GB8A" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="YouTube"
                data-testid="link-youtube"
              >
                <Youtube size={18} />
              </a>
              <a 
                href="https://www.linkedin.com/company/mutflex" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300 border border-white/20"
                aria-label="LinkedIn"
                data-testid="link-linkedin"
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
                <span dir="ltr">+966 50 705 1401</span>
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
