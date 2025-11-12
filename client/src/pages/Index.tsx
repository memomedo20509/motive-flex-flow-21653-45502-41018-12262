import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnimatedCounter } from "@/components/AnimatedCounter";
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
  Shield,
  Zap,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "إدارة العملاء",
      description: "أرشفة شاملة لبيانات العملاء مع خرائط المواقع وصور المباني",
    },
    {
      icon: Calendar,
      title: "جدولة القياسات",
      description: "إدارة مواعيد القياسات بالكامل مع التوثيق بالصور والتقارير",
    },
    {
      icon: Factory,
      title: "مراحل التصنيع",
      description: "متابعة دقيقة لكل مرحلة إنتاج مع الأرشفة الفورية",
    },
    {
      icon: Wrench,
      title: "إدارة التركيب",
      description: "توثيق كامل لمراحل التركيب مع إشعارات تلقائية للعملاء",
    },
    {
      icon: Users,
      title: "إدارة الفنيين",
      description: "عرض مهام الفنيين، الأجور، ومواقع العمل الجغرافية",
    },
    {
      icon: FileText,
      title: "أرشفة المستندات",
      description: "حفظ جميع الفواتير والمستندات بصيغة PDF قابلة للبحث",
    },
    {
      icon: BarChart3,
      title: "تقارير شاملة",
      description: "تقارير تشغيلية وإحصائية عن الأداء والإنتاجية",
    },
    {
      icon: Package,
      title: "كاتالوج المنتجات",
      description: "عرض احترافي لمنتجات المصنع داخل النظام",
    },
    {
      icon: MessageSquare,
      title: "رسائل مدعومة بالصور",
      description: "تنبيهات فورية للعملاء في كل مرحلة مع صور التحديث",
    },
  ];

  const industries = [
    { name: "مصانع الرخام والجرانيت", icon: "fa-solid fa-industry", gradient: "from-blue-500 to-cyan-500" },
    { name: "شركات المقاولات الإنشائية", icon: "fa-solid fa-building", gradient: "from-purple-500 to-pink-500" },
    { name: "شركات التشطيب والترميم", icon: "fa-solid fa-palette", gradient: "from-orange-500 to-red-500" },
    { name: "شركات التصميم والديكور", icon: "fa-solid fa-sparkles", gradient: "from-green-500 to-teal-500" },
    { name: "مصانع المطابخ", icon: "fa-solid fa-hammer", gradient: "from-yellow-500 to-orange-500" },
    { name: "شركات الألمنيوم", icon: "fa-solid fa-gear", gradient: "from-gray-500 to-slate-500" },
  ];


  return (
    <div className="min-h-screen overflow-hidden" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center text-white overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="https://cdn.pixabay.com/video/2022/12/06/142634-778417027_large.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay using exact brand colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] from-0% via-[hsl(177,81%,35%)] via-35% to-[hsl(45,76%,51%)] to-100%"></div>
          
          {/* Animated particles overlay */}
          <div className="absolute inset-0">
            <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
          </div>
        </div>

        {/* Gradient fade to white at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

        <div className="container mx-auto relative z-10 px-4 py-32">
          <div className="text-center max-w-4xl mx-auto stagger-children">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20" data-testid="badge-trust">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">نظام موثوق من +300 مصنع وشركة</span>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="heading-hero">
                حوّل منشأتك من
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-foreground to-white animate-pulse-slow">
                  الفوضى إلى النظام الذكي
                </span>
              </h1>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <p className="text-base md:text-lg lg:text-xl mb-12 max-w-3xl mx-auto opacity-95 leading-relaxed" data-testid="text-hero-description">
                نظام SaaS متكامل لإدارة عمليات التصنيع، التوريد، والتركيب
                <br />
                بطريقة رقمية كاملة ومنظمة
                <br />
                <span className="font-semibold">تابع وأدر عملك بكل سهولة من خلال جوالك</span>
              </p>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              {/* CTA Buttons - Clean & Simple */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                <Button
                  size="lg"
                  className="px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl text-base font-bold"
                  asChild
                  data-testid="button-free-trial-hero"
                >
                  <Link href="/free-trial">
                    <Zap className="ml-2 w-5 h-5" />
                    ابدأ تجربتك المجانية الآن
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm text-base font-semibold"
                  asChild
                  data-testid="button-discover-features"
                >
                  <Link href="/features">اكتشف المميزات</Link>
                </Button>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <p className="text-xs md:text-sm mt-6 opacity-80" data-testid="text-trial-info">
                تجربة مجانية لمدة شهرين - لا يتطلب بطاقة ائتمانية
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 stagger-children">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gradient">
                كيفية عمل موتفلكس
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                سير عمل مبسط يأخذ مشروعك من الاتصال الأولى إلى التسليم الناجح
              </p>
            </AnimateOnScroll>
          </div>
          
          {/* Desktop Timeline - 2 rows x 3 columns */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20 stagger-children" data-testid="workflow-steps-desktop">
            {[
              { 
                number: "01", 
                title: "جدولة وأرشفة القياسات", 
                desc: "جدولة وتوثيق القياسات مع الصور والتقارير المفصلة",
                icon: Calendar
              },
              { 
                number: "02", 
                title: "إدارة العمالء والطلبات", 
                desc: "أرشفة تفاصيل العملاء والمواقع والصور في مكان واحد",
                icon: Users
              },
              { 
                number: "03", 
                title: "متابعة مراحل التصنيع", 
                desc: "تتبع كل مرحلة من مراحل الإنتاج مع توثيق الصور",
                icon: Factory
              },
              { 
                number: "04", 
                title: "متابعة مراحل التركيب", 
                desc: "إخطار العملاء في كل خطوة مع إثبات الصور",
                icon: Wrench
              },
              { 
                number: "05", 
                title: "متابعة الإنتاجية", 
                desc: "مراقبة أداء الفنيين والإنتاجية اليومية بدقة",
                icon: TrendingUp
              },
              { 
                number: "06", 
                title: "أرشفة المستندات", 
                desc: "حفظ جميع الفواتير والمستندات بصيغة PDF آمنة",
                icon: FileText
              },
            ].map((step, index) => {
              const StepIcon = step.icon;
              return (
                <AnimateOnScroll key={index}>
                  <Card 
                    className="group relative border-2 hover:border-primary transition-all duration-500 overflow-hidden bg-card/50 backdrop-blur-sm"
                    data-testid={`card-workflow-step-${step.number}`}
                  >
                    <CardContent className="p-6 text-center">
                      {/* Circle with gradient */}
                      <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary via-primary/80 to-primary flex items-center justify-center shadow-xl transform transition-all duration-500 group-hover:scale-110">
                          <span className="text-2xl font-bold text-white">{step.number}</span>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
                      </div>
                      
                      {/* Icon */}
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center icon-accent">
                          <StepIcon size={20} className="text-primary" />
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-3 text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              );
            })}
          </div>

          {/* Mobile/Tablet Timeline */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto stagger-children" data-testid="workflow-steps-mobile">
            {[
              { 
                number: "01", 
                title: "جدولة وأرشفة القياسات", 
                desc: "جدولة وتوثيق القياسات مع الصور والتقارير المفصلة",
                icon: Calendar
              },
              { 
                number: "02", 
                title: "إدارة العمالء والطلبات", 
                desc: "أرشفة تفاصيل العملاء والمواقع والصور في مكان واحد",
                icon: Users
              },
              { 
                number: "03", 
                title: "متابعة مراحل التصنيع", 
                desc: "تتبع كل مرحلة من مراحل الإنتاج مع توثيق الصور",
                icon: Factory
              },
              { 
                number: "04", 
                title: "متابعة مراحل التركيب", 
                desc: "إخطار العملاء في كل خطوة مع إثبات الصور",
                icon: Wrench
              },
              { 
                number: "05", 
                title: "متابعة الإنتاجية", 
                desc: "مراقبة أداء الفنيين والإنتاجية اليومية بدقة",
                icon: TrendingUp
              },
              { 
                number: "06", 
                title: "أرشفة المستندات", 
                desc: "حفظ جميع الفواتير والمستندات بصيغة PDF آمنة",
                icon: FileText
              },
            ].map((step, index) => {
              const StepIcon = step.icon;
              return (
                <AnimateOnScroll key={index}>
                  <Card 
                    className="group relative border-2 hover:border-primary transition-all duration-500 overflow-hidden bg-card/50 backdrop-blur-sm"
                    data-testid={`card-workflow-step-${step.number}`}
                  >
                    <CardContent className="p-6 text-center">
                      {/* Circle with gradient */}
                      <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary via-primary/80 to-primary flex items-center justify-center shadow-xl transform transition-all duration-500 group-hover:scale-110">
                          <span className="text-2xl font-bold text-white">{step.number}</span>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500" />
                      </div>
                      
                      {/* Icon */}
                      <div className="flex justify-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center icon-accent">
                          <StepIcon size={20} className="text-primary" />
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-3 text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 stagger-children">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                المميزات التقنية
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                كل ما تحتاجه لإدارة مصنعك بكفاءة وسهولة
              </p>
            </AnimateOnScroll>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <AnimateOnScroll key={index}>
                  <Card 
                    className="border hover:border-primary transition-all duration-300 group bg-card"
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon size={24} />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              );
            })}
          </div>
          
          <AnimateOnScroll>
            <div className="text-center mt-10">
              <Button size="default" variant="premium" asChild className="shadow-xl">
                <Link href="/features">
                  <Package className="ml-2 w-4 h-4" />
                  عرض جميع المميزات
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="https://cdn.pixabay.com/video/2023/05/07/160990-824838826_large.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 stagger-children">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                الصناعات التي نخدمها
              </h2>
            </AnimateOnScroll>
            <AnimateOnScroll>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                موتفلكس مصمم للشركات الصناعية والتركيب في جميع القطاعات
              </p>
            </AnimateOnScroll>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto stagger-children">
            {industries.map((industry, index) => (
              <AnimateOnScroll key={index}>
                <Card
                  className="group relative border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card overflow-hidden"
                >
                <CardContent className="pt-8 pb-8 px-6 text-center">
                  {/* Icon with brand colors background */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-5 group-hover:scale-110 transition-transform duration-300">
                    <i className={`${industry.icon} text-3xl text-primary`}></i>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-3 text-foreground leading-relaxed">
                    {industry.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {industry.name === "مصانع الرخام والجرانيت" && "تبسيط سير العمل من المحجر إلى التركيب"}
                    {industry.name === "شركات المقاولات الإنشائية" && "إدارة مشاريع البناء متعددة المراحل"}
                    {industry.name === "شركات التشطيب والترميم" && "تتبع مراحل التشطيب وتحديثات العملاء"}
                    {industry.name === "شركات التصميم والديكور" && "تنسيق مشاريع التصميم بدقة عالية"}
                    {industry.name === "مصانع المطابخ" && "إدارة إنتاج المطابخ المخصصة"}
                    {industry.name === "شركات الألمنيوم" && "تتبع تصنيع وتركيب الألومنيوم"}
                  </p>
                </CardContent>
              </Card>
              </AnimateOnScroll>
            ))}
          </div>
          
          <AnimateOnScroll>
            <div className="text-center mt-12">
              <Button size="lg" className="shadow-lg px-8 bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-white" asChild>
                <Link href="/industries">
                  <Factory className="ml-2 w-5 h-5" />
                  اكتشف المزيد عن القطاعات
                </Link>
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield size={32} className="text-primary animate-pulse-slow" />
              <h2 className="text-3xl md:text-4xl font-bold">
                موثوق به من قبل المصانع الرائدة
              </h2>
            </div>
          </AnimateOnScroll>
          
          <AnimateOnScroll>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              نفخر بثقة عملائنا من مختلف القطاعات الصناعية في المملكة
            </p>
          </AnimateOnScroll>
          
          <AnimateOnScroll>
            <Card className="max-w-3xl mx-auto border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
            <CardContent className="p-8">
              <div className="text-5xl mb-4 opacity-20">"</div>
              <p className="text-xl mb-6 leading-relaxed italic">
                موتفلكس غيّر طريقة إدارتنا للمشاريع بالكامل. أصبح كل شيء منظم وسهل
                المتابعة. نظام فعلاً احترافي وذكي.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary"></div>
                <div className="text-right">
                  <p className="font-bold">أحمد المالكي</p>
                  <p className="text-muted-foreground text-sm">مدير عمليات، شركة صناعية رائدة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              جاهز لتحويل مصنعك؟
            </h2>
          </AnimateOnScroll>
          
          <AnimateOnScroll>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95 leading-relaxed">
              ابدأ تجربتك المجانية اليوم واكتشف الفرق بنفسك
              <br />
              <span className="font-semibold">بدون الحاجة لبطاقة ائتمانية</span>
            </p>
          </AnimateOnScroll>
          
          <AnimateOnScroll>
            <Button
              size="default"
              className="px-10 bg-white text-secondary hover:bg-white/90 shadow-xl"
              asChild
            >
              <Link href="/free-trial">
                <Zap className="ml-2 w-4 h-4" />
                ابدأ الآن مجانًا
              </Link>
            </Button>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
