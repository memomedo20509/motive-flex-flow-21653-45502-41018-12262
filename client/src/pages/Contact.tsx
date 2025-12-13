import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { Mail, Phone, MapPin, Send, Zap } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <PageScaffold>
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-contact-hero">تواصل معنا</h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95 leading-relaxed" data-testid="text-contact-description">
              نحن هنا لمساعدتك - تواصل معنا وسنرد عليك في أقرب وقت ممكن
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            title="نحن هنا لمساعدتك"
            description="تواصل معنا عبر النموذج أو قنوات التواصل المباشرة"
          />
          
          <div className="grid lg:grid-cols-2 gap-12 stagger-children">
            {/* Contact Form */}
            <AnimateOnScroll>
            <Card data-testid="card-contact-form">
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
                      data-testid="input-name"
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
                      data-testid="input-email"
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
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">اسم الشركة</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="اسم شركتك"
                      className="mt-2"
                      data-testid="input-company"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">الرسالة *</Label>
                    <Textarea
                      id="message"
                      placeholder="اكتب رسالتك هنا..."
                      required
                      className="mt-2 min-h-[150px]"
                      data-testid="textarea-message"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg" data-testid="button-submit">
                    <Send size={20} className="ml-2" />
                    إرسال الرسالة
                  </Button>
                </form>
              </CardContent>
            </Card>
            </AnimateOnScroll>

            {/* Contact Info */}
            <AnimateOnScroll>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
                <div className="space-y-6">
                  <Card data-testid="card-contact-phone">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Phone size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">الهاتف</h3>
                          <p className="text-muted-foreground" dir="ltr">
                            +966 50 705 1401
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            من السبت إلى الخميس، 9 ص - 6 م
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-contact-email">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Mail size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">البريد الإلكتروني</h3>
                          <p className="text-muted-foreground">
                            info@mutflex.com
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            نرد خلال 24 ساعة
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-contact-address">
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
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5" data-testid="card-quick-start">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">
                    هل تريد البدء مباشرة؟
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    ابدأ تجربتك المجانية الآن بدون الحاجة للتواصل
                  </p>
                  <Button variant="default" size="lg" className="w-full" data-testid="button-free-trial">
                    <Zap size={20} className="ml-2" />
                    ابدأ تجربتك المجانية
                  </Button>
                </CardContent>
              </Card>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
};

export default Contact;
