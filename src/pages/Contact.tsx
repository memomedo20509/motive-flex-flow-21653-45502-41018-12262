import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">تواصل معنا</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95 leading-relaxed">
            نحن هنا لمساعدتك - تواصل معنا وسنرد عليك في أقرب وقت ممكن
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">أرسل رسالة</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الجوال *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      required
                      className="mt-2"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">اسم الشركة</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="اسم شركتك"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">الرسالة *</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتب رسالتك هنا..."
                      required
                      className="mt-2 min-h-[150px]"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg">
                    <Send size={20} className="ml-2" />
                    إرسال الرسالة
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Phone size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">الهاتف</h3>
                          <p className="text-muted-foreground" dir="ltr">
                            +966 XX XXX XXXX
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            من السبت إلى الخميس، 9 ص - 6 م
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Mail size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">البريد الإلكتروني</h3>
                          <p className="text-muted-foreground">
                            info@motiveflex.com
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            نرد خلال 24 ساعة
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">العنوان</h3>
                          <p className="text-muted-foreground">
                            المملكة العربية السعودية
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Links */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">
                    هل تريد البدء مباشرة؟
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    ابدأ تجربتك المجانية الآن بدون الحاجة للتواصل
                  </p>
                  <Button variant="default" size="lg" className="w-full">
                    ابدأ تجربتك المجانية
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
