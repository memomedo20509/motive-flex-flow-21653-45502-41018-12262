import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users,
  Calendar,
  Factory,
  Wrench,
  FileText,
  BarChart3,
  Package,
  MessageSquare,
  UserCircle,
  CheckCircle,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "إدارة العملاء",
      description:
        "أرشفة شاملة لجميع بيانات العملاء مع إمكانية تتبع المواقع الجغرافية وحفظ صور المباني والمواقع.",
      benefits: [
        "قاعدة بيانات مركزية لجميع العملاء",
        "ربط المواقع بالخرائط التفاعلية",
        "حفظ الصور والملفات المرتبطة بكل عميل",
        "سهولة البحث والوصول للمعلومات",
      ],
    },
    {
      icon: Calendar,
      title: "إدارة مواعيد القياسات",
      description:
        "جدولة وإدارة جميع مواعيد القياسات مع التوثيق الفوري بالصور والتقارير التفصيلية.",
      benefits: [
        "تقويم تفاعلي لجميع المواعيد",
        "إشعارات تلقائية قبل الموعد",
        "رفع الصور والمقاسات مباشرة",
        "تقارير قياسات جاهزة للطباعة",
      ],
    },
    {
      icon: Factory,
      title: "إدارة ومتابعة مراحل التصنيع",
      description:
        "متابعة دقيقة لكل مرحلة من مراحل الإنتاج مع الأرشفة الفورية للصور والملاحظات.",
      benefits: [
        "تتبع المراحل خطوة بخطوة",
        "توثيق بالصور لكل مرحلة",
        "إشعارات عند اكتمال كل مرحلة",
        "تقارير الإنتاجية والجودة",
      ],
    },
    {
      icon: Wrench,
      title: "إدارة ومتابعة مراحل التركيب",
      description:
        "توثيق كامل لعملية التركيب مع إرسال تحديثات فورية للعميل في كل خطوة.",
      benefits: [
        "جدولة فرق التركيب",
        "توثيق مصور لكل مرحلة تركيب",
        "إرسال تحديثات للعميل تلقائياً",
        "تأكيد استلام العميل رقمياً",
      ],
    },
    {
      icon: Users,
      title: "إدارة الفنيين",
      description:
        "نظام شامل لإدارة الفنيين والعمال مع عرض المهام اليومية والأجور ومواقع العمل.",
      benefits: [
        "قاعدة بيانات كاملة للفنيين",
        "توزيع المهام اليومية",
        "حساب الأجور والحوافز",
        "تتبع المواقع الجغرافية للفنيين",
      ],
    },
    {
      icon: FileText,
      title: "أرشفة الفواتير والمستندات",
      description:
        "تخزين آمن لجميع الفواتير والمستندات بصيغة PDF مع إمكانية البحث السريع.",
      benefits: [
        "أرشفة رقمية كاملة",
        "بحث سريع في المستندات",
        "حفظ آمن ومشفر",
        "سهولة الوصول من أي مكان",
      ],
    },
    {
      icon: BarChart3,
      title: "التقارير الشاملة",
      description:
        "تقارير تشغيلية وإحصائية متقدمة عن جميع جوانب العمل والأداء العام.",
      benefits: [
        "تقارير مالية تفصيلية",
        "تحليلات الإنتاجية",
        "مؤشرات الأداء الرئيسية",
        "تصدير التقارير بصيغ متعددة",
      ],
    },
    {
      icon: Package,
      title: "كاتالوج المنتجات",
      description:
        "عرض احترافي وشامل لجميع منتجات المصنع داخل النظام مع الصور والمواصفات.",
      benefits: [
        "كاتالوج رقمي تفاعلي",
        "صور عالية الجودة",
        "مواصفات تفصيلية",
        "أسعار وخيارات متعددة",
      ],
    },
    {
      icon: MessageSquare,
      title: "الرسائل النصية المدعومة بالصور",
      description:
        "إرسال تنبيهات تلقائية للعملاء في كل مرحلة مع إرفاق صور التحديثات.",
      benefits: [
        "رسائل تلقائية للعملاء",
        "إرفاق الصور والمستندات",
        "تأكيد استلام الرسائل",
        "سجل كامل للمراسلات",
      ],
    },
    {
      icon: UserCircle,
      title: "لوحة العميل (Client Portal)",
      description:
        "صفحة دخول مخصصة لكل عميل لمتابعة مشروعه بالتفصيل وعرض جميع الملفات والصور.",
      benefits: [
        "واجهة مخصصة لكل عميل",
        "متابعة حية للمشروع",
        "الوصول لجميع الملفات والصور",
        "تواصل مباشر مع فريق العمل",
      ],
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
            المميزات التقنية الشاملة
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 leading-relaxed">
            نظام متكامل يغطي كل جانب من جوانب عملك - من استلام العميل حتى التسليم النهائي
          </p>
        </div>
      </section>

      {/* Features Detailed Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="space-y-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className={`border-2 overflow-hidden ${
                    index % 2 === 0 ? "lg:mr-auto" : "lg:ml-auto"
                  } max-w-5xl`}
                >
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <Icon size={32} />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold">
                            {feature.title}
                          </h2>
                        </div>
                        <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-4 text-primary">
                          الفوائد الأساسية:
                        </h3>
                        <ul className="space-y-3">
                          {feature.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle
                                size={20}
                                className="text-primary flex-shrink-0 mt-1"
                              />
                              <span className="text-muted-foreground">
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            جرّب جميع المميزات مجانًا
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
            ابدأ تجربتك المجانية الآن واكتشف كيف يمكن لـ موتفلكس تحويل عملك
          </p>
          <Button size="lg" variant="default" className="text-lg px-8" asChild>
            <Link href="/free-trial">ابدأ تجربتك المجانية</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
