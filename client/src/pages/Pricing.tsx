import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { CTASection } from "@/components/CTASection";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { SEOHead } from "@/components/SEOHead";
import { Check, Zap } from "lucide-react";

const Pricing = () => {
  const setupFee = {
    price: "690",
    description: "رسوم تأسيس لمرة واحدة شاملة الضريبة",
  };

  const plans = [
    {
      name: "باقة 6 شهور",
      name_en: "6 Months",
      price: "6,000",
      period: "6 أشهر",
      description: "الباقة المثالية للمشاريع قصيرة ومتوسطة المدى",
      features: [
        "عدد مستخدمين غير محدود",
        "إدارة العملاء والطلبات",
        "متابعة مراحل التصنيع والتركيب",
        "أرشفة الصور والمستندات",
        "لوحة تحكم أساسية",
        "الرسائل النصية المدعومة بالصور",
        "تقارير متقدمة",
        "إنشاء الكاتالوج",
        "لوحة العميل (Client Portal)",
        "تخزين غير محدود",
      ],
      popular: false,
    },
    {
      name: "باقة سنة",
      name_en: "1 Year",
      price: "10,350",
      period: "12 شهر",
      description: "الأكثر شعبية - وفّر 14% على المدى الطويل",
      features: [
        "عدد مستخدمين غير محدود",
        "إدارة العملاء والطلبات",
        "متابعة مراحل التصنيع والتركيب",
        "أرشفة الصور والمستندات",
        "لوحة تحكم أساسية",
        "الرسائل النصية المدعومة بالصور",
        "تقارير متقدمة",
        "إنشاء الكاتالوج",
        "لوحة العميل (Client Portal)",
        "تخزين غير محدود",
      ],
      popular: true,
    },
  ];

  return (
    <PageScaffold>
      <SEOHead
        title="الأسعار والباقات"
        description="تعرف على أسعار باقات موتفلكس المرنة. باقة 6 شهور وباقة سنوية مع تجربة مجانية لمدة شهرين. جميع الباقات تشمل عدد مستخدمين غير محدود."
        keywords="أسعار موتفلكس, باقات, اشتراك, تجربة مجانية, نظام إدارة المصانع"
        canonicalUrl="https://mutflex.com/pricing"
      />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-pricing-hero">
              خطط أسعار واضحة ومرنة
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 leading-relaxed" data-testid="text-pricing-description">
              اختر الباقة المناسبة لحجم عملك - جميع الباقات تشمل تجربة مجانية لمدة شهرين
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <Check size={20} className="text-primary" />
              <span className="text-sm font-medium">رسائل نصية مجانية باسم mutaba خلال فترة التجربة</span>
            </div>
          </AnimateOnScroll>
        </div>
      </section>


      {/* Pricing Cards */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            title="اختر الباقة المناسبة"
            description="جميع الباقات تشمل نفس المميزات القوية"
            badge="تجربة مجانية لمدة شهرين"
          />
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto stagger-children">
            {plans.map((plan, index) => (
              <AnimateOnScroll key={index}>
                <Card
                  className={`relative ${
                    plan.popular
                      ? "border-primary border-2 shadow-xl scale-105"
                      : "border-2"
                  }`}
                  data-testid={`card-plan-${index}`}
                >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                    الأكثر شعبية
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-end justify-center gap-2">
                    {plan.price === "حسب الطلب" ? (
                      <span className="text-3xl font-bold">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-4xl md:text-5xl font-bold">
                          {plan.price}
                        </span>
                        <span className="text-lg text-muted-foreground mb-2">
                          ريال
                        </span>
                      </>
                    )}
                  </div>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  {/* Setup Fee - First Item */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4" data-testid={`text-setup-fee-${index}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Zap size={18} className="text-primary" />
                        <span className="font-medium text-sm">رسوم التأسيس</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-primary">{setupFee.price}</span>
                        <span className="text-xs text-muted-foreground">ريال</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">(مرة واحدة فقط - شاملة الضريبة)</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
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
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    className="w-full text-lg"
                    asChild
                    data-testid={`button-plan-${index}`}
                  >
                    <Link href="/free-trial">
                      {plan.price === "حسب الطلب"
                        ? "تواصل معنا"
                        : "ابدأ تجربتك المجانية"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <SectionHeader
            title="الأسئلة الشائعة"
            description="إجابات على أهم الأسئلة حول الأسعار والباقات"
          />
          <div className="space-y-6 stagger-children">
            {[
              {
                q: "هل هناك رسوم خفية؟",
                a: "لا، جميع الأسعار شاملة ولا توجد أي رسوم خفية. ما تراه هو ما تدفعه.",
              },
              {
                q: "هل يمكنني تغيير الباقة لاحقاً؟",
                a: "بالتأكيد! يمكنك الترقية أو التخفيض في أي وقت حسب احتياجاتك.",
              },
              {
                q: "ماذا يحدث بعد انتهاء التجربة المجانية؟",
                a: "يمكنك اختيار الباقة المناسبة والاستمرار، أو إلغاء الاشتراك بدون أي التزامات.",
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
        description="ابدأ تجربتك المجانية اليوم - بدون بطاقة ائتمان"
        primaryButtonText="ابدأ تجربتك المجانية - شهرين"
        primaryButtonLink="/free-trial"
        primaryButtonIcon={Zap}
      />
    </PageScaffold>
  );
};

export default Pricing;
