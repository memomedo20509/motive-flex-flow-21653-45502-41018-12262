import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "الباقة الأساسية",
      name_en: "Starter",
      price: "499",
      period: "شهرياً",
      description: "مناسبة للمصانع والشركات الصغيرة",
      features: [
        "حتى 5 مستخدمين",
        "إدارة العملاء والطلبات",
        "متابعة مراحل التصنيع",
        "أرشفة الصور والمستندات",
        "لوحة تحكم أساسية",
        "دعم فني عبر البريد",
        "تخزين 10 جيجا",
      ],
      popular: false,
    },
    {
      name: "الباقة الاحترافية",
      name_en: "Professional",
      price: "999",
      period: "شهرياً",
      description: "الأكثر شعبية للشركات المتوسطة",
      features: [
        "حتى 20 مستخدم",
        "جميع مميزات الباقة الأساسية",
        "إدارة الفنيين والمواقع",
        "الرسائل النصية المدعومة بالصور",
        "تقارير متقدمة",
        "لوحة العميل (Client Portal)",
        "دعم فني ذو أولوية",
        "تخزين 50 جيجا",
        "تكامل مع الأنظمة الأخرى",
      ],
      popular: true,
    },
    {
      name: "الباقة المؤسسية",
      name_en: "Enterprise",
      price: "حسب الطلب",
      period: "",
      description: "حلول مخصصة للمؤسسات الكبيرة",
      features: [
        "عدد مستخدمين غير محدود",
        "جميع مميزات الباقة الاحترافية",
        "تخصيص كامل حسب الحاجة",
        "تدريب متخصص للفريق",
        "دعم فني مخصص 24/7",
        "استضافة خاصة (اختياري)",
        "تخزين غير محدود",
        "SLA مخصص",
        "مدير حساب خاص",
      ],
      popular: false,
    },
  ];

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            خطط أسعار واضحة ومرنة
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 leading-relaxed">
            اختر الباقة المناسبة لحجم عملك - جميع الباقات تشمل تجربة مجانية لمدة 14 يوم
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? "border-primary border-2 shadow-xl scale-105"
                    : "border-2"
                }`}
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
                  >
                    <Link href="/free-trial">
                      {plan.price === "حسب الطلب"
                        ? "تواصل معنا"
                        : "ابدأ تجربتك المجانية"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            الأسئلة الشائعة
          </h2>
          <div className="space-y-6">
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
                a: "نعم، نوفر تدريب شامل لجميع العملاء، وتدريب متخصص للباقة المؤسسية.",
              },
              {
                q: "هل البيانات آمنة؟",
                a: "نعم، نستخدم أعلى معايير الأمان والتشفير لحماية بياناتك.",
              },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-2">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جاهز للبدء؟
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
            ابدأ تجربتك المجانية اليوم - بدون بطاقة ائتمان
          </p>
          <Button size="lg" variant="default" className="text-lg px-8" asChild>
            <Link href="/free-trial">ابدأ تجربتك المجانية - 14 يوم</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
