import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { SEOHead } from "@/components/SEOHead";
import { 
  CheckCircle, 
  Factory, 
  Building2, 
  Paintbrush, 
  Sparkles, 
  Hammer, 
  Settings, 
  Wrench,
  Glasses,
  ArrowUpDown,
  Home,
  Leaf,
  Bug,
  Rocket,
  PlayCircle,
  MessageCircle,
  HelpCircle,
  type LucideIcon
} from "lucide-react";
import { Link } from "wouter";

const Industries = () => {
  const industries: { icon: LucideIcon; name: string; problem: string; solution: string; benefits: string[] }[] = [
    {
      icon: Factory,
      name: "مصانع الرخام والجرانيت",
      problem: "صعوبة متابعة مراحل القطع والتلميع والتركيب مع كثرة الطلبات",
      solution:
        "نظام موتفلكس يوفر متابعة دقيقة لكل مرحلة من القطع حتى التركيب مع توثيق بالصور",
      benefits: [
        "تتبع دقيق لمراحل القطع والتلميع",
        "إدارة مخزون الألواح والخامات",
        "جدولة فرق التركيب",
        "توثيق مصور لكل مشروع",
      ],
    },
    {
      icon: Building2,
      name: "شركات المقاولات الإنشائية",
      problem: "تعدد المشاريع وصعوبة متابعة فرق العمل والمواد",
      solution:
        "نظام شامل لإدارة جميع المشاريع والفرق والمواد من مكان واحد",
      benefits: [
        "إدارة مشاريع متعددة في نفس الوقت",
        "تتبع فرق العمل والمواقع",
        "إدارة المواد والتوريدات",
        "تقارير الإنجاز والتكاليف",
      ],
    },
    {
      icon: Paintbrush,
      name: "شركات التشطيب والترميم",
      problem: "التنسيق بين فرق متعددة وتوثيق التقدم للعملاء",
      solution:
        "موتفلكس ينظم العمل بين الفرق ويوفر تحديثات مستمرة للعملاء",
      benefits: [
        "تنسيق سلس بين الفرق",
        "توثيق قبل وبعد بالصور",
        "تحديثات مباشرة للعملاء",
        "إدارة المواد والألوان",
      ],
    },
    {
      icon: Sparkles,
      name: "شركات التصميم والديكور",
      problem: "التحدي في ترجمة التصاميم إلى واقع مع المتابعة الدقيقة",
      solution:
        "ربط التصاميم بمراحل التنفيذ مع متابعة دقيقة لكل تفصيلة",
      benefits: [
        "ربط التصاميم بالتنفيذ",
        "كاتالوج رقمي للمنتجات",
        "متابعة التفاصيل الدقيقة",
        "عروض تقديمية للعملاء",
      ],
    },
    {
      icon: Hammer,
      name: "مصانع المطابخ",
      problem: "كثرة التفاصيل والقياسات وتنسيق مراحل التصنيع والتركيب",
      solution:
        "نظام متخصص يغطي القياس والتصنيع والتركيب بدقة عالية",
      benefits: [
        "إدارة القياسات الدقيقة",
        "متابعة مراحل التصنيع",
        "تنسيق الإكسسوارات والخامات",
        "جدولة التركيب والتسليم",
      ],
    },
    {
      icon: Settings,
      name: "شركات الألمنيوم",
      problem: "صعوبة تتبع الطلبات المخصصة ومراحل التصنيع والتركيب",
      solution:
        "موتفلكس يوفر نظام متكامل لإدارة الطلبات المخصصة من القياس للتركيب",
      benefits: [
        "إدارة الطلبات المخصصة",
        "تتبع مراحل التصنيع",
        "إدارة القطع والمقاسات",
        "تنسيق التركيب والتسليم",
      ],
    },
    {
      icon: Wrench,
      name: "ورش الحدادة",
      problem: "صعوبة إدارة المشاريع المخصصة وتتبع مراحل التصنيع المعقدة",
      solution:
        "نظام شامل يغطي القياسات، التصنيع، والتركيب مع توثيق كامل لكل مرحلة",
      benefits: [
        "إدارة المشاريع المخصصة",
        "تتبع مراحل التصنيع بالتفصيل",
        "توثيق مصور لكل خطوة",
        "جدولة فرق التركيب",
      ],
    },
    {
      icon: Glasses,
      name: "شركات الزجاج",
      problem: "التحدي في إدارة القياسات الدقيقة ومتابعة مراحل التقطيع والتركيب",
      solution:
        "موتفلكس يضمن دقة القياسات ومتابعة شاملة لكل مرحلة من القطع للتركيب",
      benefits: [
        "إدارة القياسات الدقيقة",
        "متابعة عمليات القطع والتشكيل",
        "تنسيق فرق التركيب",
        "توثيق السلامة والجودة",
      ],
    },
    {
      icon: ArrowUpDown,
      name: "شركات المصاعد",
      problem: "تعقيد عمليات التركيب والصيانة وصعوبة التنسيق بين الفرق",
      solution:
        "نظام متكامل يدير التركيب والصيانة الدورية مع جدولة ذكية للفرق",
      benefits: [
        "إدارة مشاريع التركيب",
        "جدولة الصيانة الدورية",
        "تتبع قطع الغيار",
        "تقارير السلامة والفحوصات",
      ],
    },
    {
      icon: Home,
      name: "شركات البيوت الجاهزة",
      problem: "تحدي متابعة مراحل التصنيع والنقل والتركيب للمشاريع الكبيرة",
      solution:
        "موتفلكس ينظم كل مرحلة من التصنيع للتسليم مع متابعة دقيقة",
      benefits: [
        "إدارة مراحل التصنيع",
        "تنسيق النقل والشحن",
        "جدولة التركيب في الموقع",
        "توثيق كامل بالصور",
      ],
    },
    {
      icon: Leaf,
      name: "شركات المشاتل الزراعية",
      problem: "صعوبة إدارة الطلبات الموسمية ومتابعة التوريد والتركيب",
      solution:
        "نظام ذكي لإدارة المخزون والطلبات مع جدولة التوريد والزراعة",
      benefits: [
        "إدارة المخزون الموسمي",
        "جدولة عمليات التوريد",
        "متابعة مشاريع التنسيق",
        "توثيق العناية والصيانة",
      ],
    },
    {
      icon: Bug,
      name: "شركات مكافحة الحشرات",
      problem: "صعوبة جدولة الزيارات الدورية ومتابعة العملاء المتكررين",
      solution:
        "موتفلكس يدير الزيارات الدورية ويحفظ سجل كامل لكل عميل",
      benefits: [
        "جدولة الزيارات الدورية",
        "سجل كامل لكل عميل",
        "تذكير تلقائي بالزيارات",
        "تقارير العلاج والنتائج",
      ],
    },
  ];

  return (
    <PageScaffold>
      <SEOHead
        title="القطاعات الصناعية المستفيدة"
        description="حلول مخصصة لكل قطاع صناعي: مصانع الرخام والجرانيت، شركات المقاولات، التشطيب والديكور، مصانع المطابخ والألمنيوم والمزيد."
        keywords="قطاعات صناعية, مصانع رخام, مقاولات, ديكور, مطابخ, ألمنيوم"
        canonicalUrl="https://mutflex.com/industries"
      />
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white">
        <div className="container mx-auto text-center stagger-children">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="heading-industries-hero">
              القطاعات الصناعية المستفيدة
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95" data-testid="text-industries-description">
              حلول مخصصة لكل قطاع صناعي - نفهم تحدياتك ونوفر الحلول المناسبة
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Industries Detailed Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <SectionHeader
            title="القطاعات التي نخدمها"
            description="حلول متخصصة لأكثر من 12 قطاع صناعي مختلف"
            badge="12+ قطاع"
          />
          
          <div className="grid gap-8 stagger-children">
            {industries.map((industry, index) => (
              <AnimateOnScroll key={index}>
                <Card
                  className="group border-2 hover:border-primary transition-all duration-500 overflow-hidden hover-lift bg-card/50 backdrop-blur-sm"
                  data-testid={`card-industry-${index}`}
                >
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-[1fr_400px]">
                    {/* Content Side */}
                    <div className="p-8 lg:p-12 relative">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-all duration-500" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -z-10 group-hover:bg-secondary/10 transition-all duration-500" />
                      
                      <div className="flex items-center gap-6 mb-8">
                        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                          <industry.icon className="w-12 h-12 text-primary relative z-10" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {industry.name}
                        </h2>
                      </div>

                      <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-destructive/5 border-r-4 border-destructive">
                          <h3 className="font-bold text-lg text-destructive mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                            التحدي:
                          </h3>
                          <p className="text-muted-foreground leading-relaxed text-base">
                            {industry.problem}
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-primary/5 border-r-4 border-primary">
                          <h3 className="font-bold text-lg text-primary mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            الحل:
                          </h3>
                          <p className="text-muted-foreground leading-relaxed text-base">
                            {industry.solution}
                          </p>
                        </div>

                        <div className="p-5 rounded-2xl bg-secondary/5 border-r-4 border-secondary">
                          <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                            المميزات الأساسية:
                          </h3>
                          <ul className="space-y-3">
                            {industry.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-3 group/item">
                                <CheckCircle
                                  size={20}
                                  className="text-secondary flex-shrink-0 mt-1 group-hover/item:scale-110 transition-transform"
                                />
                                <span className="text-foreground/80 group-hover/item:text-foreground transition-colors">
                                  {benefit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CTA Side */}
                    <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 p-8 lg:p-10 flex flex-col justify-center overflow-hidden">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
                      
                      <div className="relative z-10 space-y-6">
                        <div className="text-center space-y-3">
                          <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg">
                            <Rocket className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">
                            جاهز لتحويل عملك؟
                          </h3>
                        </div>
                        
                        <p className="text-muted-foreground text-lg text-center leading-relaxed">
                          ابدأ تجربتك المجانية الآن وشاهد كيف يمكن لموتفلكس تحسين
                          إدارة {industry.name}
                        </p>
                        
                        <div className="space-y-3">
                          <Button
                            size="lg"
                            className="w-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-secondary hover:scale-105"
                            asChild
                          >
                            <Link href="/free-trial">
                              <PlayCircle className="w-5 h-5 ml-2" />
                              ابدأ تجربتك المجانية
                            </Link>
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full text-lg font-semibold border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                            asChild
                          >
                            <Link href="/contact">
                              <MessageCircle className="w-5 h-5 ml-2" />
                              تواصل معنا
                            </Link>
                          </Button>
                        </div>

                        <div className="pt-4 border-t border-border/50 text-center">
                          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            بدون بطاقة ائتمان • جاهز للاستخدام فوراً
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 relative overflow-hidden" data-testid="section-industries-cta">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimateOnScroll>
              <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 shadow-xl mb-4">
                <HelpCircle className="w-12 h-12 text-primary" />
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground" data-testid="heading-industries-custom">
                قطاعك غير موجود في القائمة؟
              </h2>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <p className="text-muted-foreground mb-8 text-lg md:text-xl leading-relaxed" data-testid="text-industries-custom-description">
                موتفلكس قابل للتخصيص ليناسب احتياجاتك الخاصة - تواصل معنا لمناقشة متطلباتك
              </p>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-6 font-bold shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-all duration-300" 
                  asChild
                  data-testid="button-contact-custom"
                >
                  <Link href="/contact">
                    <MessageCircle className="w-5 h-5 ml-2" />
                    تواصل معنا
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 font-semibold border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  asChild
                  data-testid="button-trial-custom"
                >
                  <Link href="/free-trial">
                    <PlayCircle className="w-5 h-5 ml-2" />
                    ابدأ تجربتك المجانية
                  </Link>
                </Button>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <div className="pt-8 flex items-center justify-center gap-8 flex-wrap text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-secondary" />
                  <span>جاهز للاستخدام فوراً</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>قابل للتخصيص الكامل</span>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
};

export default Industries;
