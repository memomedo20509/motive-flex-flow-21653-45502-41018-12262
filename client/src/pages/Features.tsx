import { Card, CardContent } from "@/components/ui/card";
import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { CTASection } from "@/components/CTASection";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
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
  Building2,
  Shield,
  Zap,
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
        "إمكانية دخول العميل للتطبيق عن طريق الجوال",
        "متابعة حية للمشروع",
        "متابعة كاتلوج منتجات الشركة",
        "الوصول لجميع المستندات والصور",
        "أرشفة جميع الأعمال المنتهية",
        "تواصل مباشر مع فريق العمل",
      ],
    },
    {
      icon: Building2,
      title: "إدارة الفروع",
      description:
        "إنشاء وفتح حسابات للفروع المتعددة مع إمكانية إدارة كل فرع بشكل مستقل.",
      benefits: [
        "إنشاء عدد لامحدود من الفروع",
        "إدارة مستقلة لكل فرع",
        "تقارير منفصلة لكل فرع",
        "تتبع الأداء حسب الفرع",
      ],
    },
    {
      icon: Shield,
      title: "إدارة المستخدمين والصلاحيات",
      description:
        "فتح حسابات للمستخدمين بصلاحيات مختلفة للتحكم الكامل في الوصول والأمان.",
      benefits: [
        "فتح حسابات للمستخدمين بصلاحيات مختلفة",
        "إنشاء عدد لامحدود من المستخدمين",
        "تحديد الصلاحيات حسب الدور الوظيفي",
        "سجل كامل لجميع العمليات",
      ],
    },
  ];

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-features-hero">
              المميزات التقنية الشاملة
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 leading-relaxed" data-testid="text-features-description">
              نظام متكامل يغطي كل جانب من جوانب عملك - من استلام العميل حتى التسليم النهائي
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features Detailed Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader
            title="جميع المميزات التقنية"
            description="تعرف على التفاصيل الكاملة لكل ميزة وكيف ستساعدك في تحسين عملك"
            badge="12 ميزة قوية"
          />
          
          <div className="space-y-12 stagger-children">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimateOnScroll key={index}>
                  <Card
                    className={`border-2 overflow-hidden ${
                      index % 2 === 0 ? "lg:mr-auto" : "lg:ml-auto"
                    } max-w-5xl`}
                    data-testid={`card-feature-${index}`}
                  >
                    <CardContent className="p-6 md:p-8">
                      <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <Icon size={32} className="w-7 h-7 md:w-8 md:h-8" />
                            </div>
                            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
                              {feature.title}
                            </h2>
                          </div>
                          <p className="text-muted-foreground text-base md:text-lg mb-6 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-bold text-base md:text-lg mb-4 text-primary">
                            الفوائد الأساسية:
                          </h3>
                          <ul className="space-y-3">
                            {feature.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <CheckCircle
                                  size={20}
                                  className="text-primary flex-shrink-0 mt-1 w-5 h-5"
                                />
                                <span className="text-muted-foreground text-sm md:text-base">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="جرّب جميع المميزات مجانًا"
        description="ابدأ تجربتك المجانية الآن واكتشف كيف يمكن لـ موتفلكس تحويل عملك"
        primaryButtonText="ابدأ تجربتك المجانية"
        primaryButtonLink="/free-trial"
        primaryButtonIcon={Zap}
        secondaryButtonText="تواصل معنا"
        secondaryButtonLink="/contact"
      />
    </PageScaffold>
  );
};

export default Features;
