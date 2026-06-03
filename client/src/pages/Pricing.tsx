import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { CTASection } from "@/components/CTASection";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import { Check, Zap } from "lucide-react";

const Pricing = () => {
  // Mutflex Pro Plan
  const proSetupFee = {
    price: "230",
    description: "رسوم تأسيس تدفع مرة واحدة فقط، شاملة ضريبة القيمة المضافة",
  };

  const proPlan = {
    name: "Mutflex Pro",
    price: "345",
    period: "شهريًا",
    description: "باقة واحدة واضحة لإدارة المصنع بالكامل، تشمل جميع المميزات بدون تعقيد",
    features: [
      "عدد مستخدمين غير محدود",
      "إدارة العملاء والطلبات",
      "متابعة مراحل التصنيع والتركيب",
      "أرشفة الصور والمستندات",
      "لوحة تحكم شاملة",
      "الرسائل النصية المدعومة بالصور",
      "تقارير متقدمة",
      "إنشاء الكاتالوج",
      "لوحة العميل (Client Portal)",
      "تخزين غير محدود",
      "قائمة أسعار للمنتجات ومواصفاتها",
      "شاشة عرض خاصة لصالات العرض لقائمة الأسعار والكتالوج",
    ],
  };

  // Mutflex Catalog Plan
  const catalogPlan = {
    name: "Mutflex Catalog",
    price: "575",
    period: "سنوياً",
    description: "باقة سنوية للكتالوج وقوائم الأسعار، مناسبة لصالات العرض والفرق التي تحتاج عرض منتجاتها باحتراف",
    features: [
      "لوحة تحكم أساسية",
      "إنشاء الكتالوج",
      "إنشاء قائمة الأسعار والمواصفات مدعوم بالصور",
      "شاشة عرض خاصة لصالات العرض للكتالوج وقائمة الأسعار",
      "إمكانية طباعة التقارير لقائمة الأسعار",
      "تخزين لا محدود",
    ],
  };

  return (
    <PageScaffold>
      <SEOHead
        title="الأسعار والباقات"
        description="تعرف على أسعار موتفلكس في السعودية. Mutflex Pro بسعر شهري واضح شامل المميزات، و Mutflex Catalog كباقة سنوية شاملة الضريبة."
        keywords="أسعار موتفلكس, باقة شهرية, اشتراك شهري, تجربة مجانية, نظام إدارة المصانع, Mutflex Pro, Mutflex Catalog, السعودية"
        canonicalUrl="https://mutflex.com/pricing"
      />
      <BreadcrumbSchema items={[
        { name: "الرئيسية", url: "https://mutflex.com/" },
        { name: "الأسعار", url: "https://mutflex.com/pricing" }
      ]} />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-pricing-hero">
              أسعار واضحة تناسب السوق السعودي
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 leading-relaxed" data-testid="text-pricing-description">
              باقة شهرية واحدة لإدارة المصنع بالكامل، وباقة سنوية مخصصة للكتالوج وقوائم الأسعار
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <Check size={20} className="text-primary" />
              <span className="text-sm font-medium">تجربة مجانية لمدة شهر - بدون بطاقة ائتمانية</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Mutflex Pro Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            title="Mutflex Pro"
            description="النظام الشامل لإدارة المصانع - باقة شهرية واحدة تشمل جميع المميزات"
            badge="تجربة مجانية لمدة شهر"
          />
          
          <div className="max-w-xl mx-auto stagger-children">
              <AnimateOnScroll>
                <Card
                  className="relative border-primary border-2 shadow-xl"
                  data-testid="card-pro-plan"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                    باقة واحدة بكل المميزات
                  </div>
                <CardHeader className="text-center pb-8 pt-8">
                  <h3 className="text-2xl font-bold mb-2">{proPlan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {proPlan.description}
                  </p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-4xl md:text-5xl font-bold">
                      {proPlan.price}
                    </span>
                    <span className="text-lg text-muted-foreground mb-2">
                      ريال سعودي
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {proPlan.period} - شامل ضريبة القيمة المضافة
                  </span>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  {/* Setup Fee - First Item */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4" data-testid="text-pro-setup-fee">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className="text-primary" />
                        <span className="font-medium text-sm">رسوم التأسيس</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-primary">{proSetupFee.price}</span>
                        <span className="text-xs text-muted-foreground">ريال سعودي</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{proSetupFee.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {proPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check
                          size={20}
                          className="text-primary flex-shrink-0 mt-0.5"
                        />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full text-lg"
                    asChild
                    data-testid="button-pro-plan"
                  >
                    <Link href="/free-trial">
                      ابدأ تجربتك المجانية
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Mutflex Catalog Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            title="Mutflex Catalog"
            description="باقة سنوية للكتالوج وقوائم الأسعار بدون رسوم تأسيس"
            badge="575 ريال سنويًا شامل الضريبة"
          />
          
          <div className="max-w-xl mx-auto">
            <AnimateOnScroll>
              <Card className="border-2" data-testid="card-catalog-plan">
                <CardHeader className="text-center pb-8 pt-8">
                  <h3 className="text-2xl font-bold mb-2">{catalogPlan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {catalogPlan.description}
                  </p>
                  <div className="flex items-end justify-center gap-2">
                    <span className="text-4xl md:text-5xl font-bold">
                      {catalogPlan.price}
                    </span>
                    <span className="text-lg text-muted-foreground mb-2">
                      ريال سعودي
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {catalogPlan.period} - شامل ضريبة القيمة المضافة
                  </span>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 text-center">
                    <span className="text-green-600 dark:text-green-400 font-medium text-sm">
                      بدون رسوم تأسيس
                    </span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {catalogPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check
                          size={20}
                          className="text-primary flex-shrink-0 mt-0.5"
                        />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full text-lg"
                    asChild
                    data-testid="button-catalog-plan"
                  >
                    <Link href="/free-trial">
                      ابدأ تجربتك المجانية
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-4xl">
          <SectionHeader
            title="الأسئلة الشائعة"
            description="إجابات على أهم الأسئلة حول الأسعار والباقات"
          />
          <div className="space-y-6 stagger-children">
            {[
              {
                q: "ما الفرق بين Mutflex Pro و Mutflex Catalog؟",
                a: "Mutflex Pro هو النظام الشامل لإدارة المصنع والطلبات والعملاء والتصنيع والتركيب. Mutflex Catalog مخصص للكتالوج وقوائم الأسعار وصالات العرض.",
              },
              {
                q: "هل الأسعار شاملة الضريبة؟",
                a: "نعم، أسعار الباقات ورسوم التأسيس الموضحة شاملة ضريبة القيمة المضافة.",
              },
              {
                q: "هل توجد رسوم تأسيس؟",
                a: "توجد رسوم تأسيس لمرة واحدة على Mutflex Pro بقيمة 230 ريال سعودي شاملة الضريبة. Mutflex Catalog بدون رسوم تأسيس.",
              },
              {
                q: "ماذا يحدث بعد انتهاء التجربة المجانية؟",
                a: "بعد انتهاء الشهر المجاني يمكنك الاستمرار على الباقة الشهرية أو التوقف بدون أي التزام.",
              },
              {
                q: "هل توفرون تدريب على النظام؟",
                a: "نعم، نوفر تدريب شامل ومجاني لجميع العملاء على جميع مميزات النظام.",
              },
              {
                q: "هل البيانات آمنة؟",
                a: "نعم، نستخدم أعلى معايير الأمان والتشفير لحماية بياناتك.",
              },
            ].map((item, index) => (
              <AnimateOnScroll key={index}>
                <Card data-testid={`card-faq-${index}`}>
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-2">{item.q}</h3>
                    <p className="text-muted-foreground">{item.a}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="جاهز للبدء؟"
        description="ابدأ تجربتك المجانية لمدة شهر - بدون بطاقة ائتمانية"
        primaryButtonText="ابدأ تجربتك المجانية"
        primaryButtonLink="/free-trial"
        primaryButtonIcon={Zap}
      />
    </PageScaffold>
  );
};

export default Pricing;
