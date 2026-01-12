import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { CTASection } from "@/components/CTASection";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import { Target, Eye, Award, Users, Zap } from "lucide-react";

const About = () => {
  return (
    <PageScaffold>
      <SEOHead
        title="من نحن"
        description="تعرف على قصة موتفلكس وفريقنا المتخصص في تطوير حلول تقنية لتحويل القطاع الصناعي رقمياً. رؤيتنا ورسالتنا وقيمنا."
        keywords="موتفلكس, من نحن, فريق العمل, قصة الشركة, التحول الرقمي"
        canonicalUrl="https://mutflex.com/about"
      />
      <BreadcrumbSchema items={[
        { name: "الرئيسية", url: "https://mutflex.com/" },
        { name: "من نحن", url: "https://mutflex.com/about" }
      ]} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-about-hero">من نحن</h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-95 leading-relaxed" data-testid="text-about-description">
              نحن فريق متخصص في تطوير حلول تقنية لتحويل القطاع الصناعي
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-4xl">
          <SectionHeader
            title="قصتنا"
            description="رحلتنا في تحويل القطاع الصناعي رقمياً"
          />
          <AnimateOnScroll>
          <div className="prose prose-lg mx-auto text-muted-foreground leading-relaxed">
            <p className="text-lg mb-6">
              بدأت فكرة موتفلكس من تحدي حقيقي واجهه العديد من أصحاب المصانع
              والشركات الصناعية - صعوبة إدارة العمليات اليومية المعقدة وتتبع
              المشاريع والتواصل مع العملاء بطريقة منظمة وفعالة.
            </p>
            <p className="text-lg mb-6">
              لاحظنا أن معظم المصانع والشركات الصناعية تعتمد على طرق تقليدية في
              الإدارة، مما يؤدي إلى فقدان المعلومات، تأخير المشاريع، وصعوبة في
              التواصل مع العملاء. من هنا، قررنا تطوير حل شامل يجمع كل جوانب
              العمل في منصة واحدة سهلة الاستخدام.
            </p>
            <p className="text-lg">
              اليوم، موتفلكس هو نظام SaaS متكامل يخدم مختلف القطاعات الصناعية،
              مساعداً الشركات على التحول الرقمي وتحسين كفاءة عملياتها.
            </p>
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader title="رؤيتنا ومهمتنا" description="ما نؤمن به ونعمل من أجله" />
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto stagger-children">
            <AnimateOnScroll>
            <Card className="border-2" data-testid="card-vision">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Eye size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">رؤيتنا</h3>
                <p className="text-muted-foreground leading-relaxed">
                  أن نكون الخيار الأول للتحول الرقمي في القطاع الصناعي بالمنطقة،
                  ومساعدة آلاف الشركات على تحسين كفاءتها وإنتاجيتها من خلال
                  التقنية.
                </p>
              </CardContent>
            </Card>
            </AnimateOnScroll>

            <AnimateOnScroll>
            <Card className="border-2" data-testid="card-mission">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-4">
                  <Target size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">مهمتنا</h3>
                <p className="text-muted-foreground leading-relaxed">
                  تطوير حلول تقنية بسيطة وفعالة تحوّل العمليات المعقدة إلى مهام
                  منظمة، وتساعد الشركات على التركيز على النمو بدلاً من الإدارة
                  اليومية.
                </p>
              </CardContent>
            </Card>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto max-w-7xl">
          <SectionHeader title="قيمنا" description="المبادئ التي توجّه عملنا يومياً" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto stagger-children">
            {[
              {
                icon: Users,
                title: "العميل أولاً",
                description: "نضع احتياجات عملائنا في المقام الأول",
              },
              {
                icon: Award,
                title: "الجودة",
                description: "نلتزم بأعلى معايير الجودة في كل ما نقدمه",
              },
              {
                icon: Target,
                title: "البساطة",
                description: "نؤمن أن الحلول الفعالة يجب أن تكون بسيطة",
              },
              {
                icon: Eye,
                title: "الشفافية",
                description: "نتواصل بوضوح وصدق مع عملائنا",
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <AnimateOnScroll key={index}>
                <Card data-testid={`card-value-${index}`}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                      <Icon size={28} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        title="جاهز للانضمام إلينا؟"
        description="ابدأ رحلتك نحو التحول الرقمي مع موتفلكس"
        primaryButtonText="ابدأ تجربتك المجانية"
        primaryButtonLink="/free-trial"
        primaryButtonIcon={Zap}
        secondaryButtonText="تواصل معنا"
        secondaryButtonLink="/contact"
      />
    </PageScaffold>
  );
};

export default About;
