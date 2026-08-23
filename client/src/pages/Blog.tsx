import { Link } from "wouter";
import { BookOpen, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BlogExplorer } from "@/components/BlogExplorer";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Blog = () => (
  <div className="min-h-screen bg-background" dir="rtl">
    <SEOHead
      title="مدونة موتفلكس | أدلة إدارة المصانع والتصنيع والتركيب"
      description="ابحث في أدلة إدارة العملاء والمشاريع والتصنيع والتركيب للمصانع وشركات التشطيبات والتوريد في السعودية."
      keywords="مدونة موتفلكس, إدارة المصانع, CRM شركات التشطيبات, ERP للمصانع, إدارة التصنيع والتركيب"
      canonicalUrl="https://mutflex.com/blog"
    />
    <BreadcrumbSchema items={[
      { name: "الرئيسية", url: "https://mutflex.com/" },
      { name: "المدونة", url: "https://mutflex.com/blog" },
    ]} />
    <Navbar />

    <header className="relative overflow-hidden pb-20 pt-32 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] via-[hsl(177,81%,35%)] to-[hsl(45,76%,51%)]" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
          <BookOpen className="h-5 w-5" /> مكتبة تشغيل عملية
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-5xl">ابحث عن المشكلة، وخذ كل المقالات التي تشرحها من البداية للتطبيق</h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/90">بحث عربي سياقي يجمع لك التعريف والفوائد والخطوات وحالات الاستخدام حسب موضوعك وقطاعك، بدل الاعتماد على وسم واحد.</p>
      </div>
    </header>

    <BlogExplorer />

    <section className="pb-16 pt-4">
      <div className="container mx-auto px-4">
        <Card className="mx-auto max-w-3xl border-2 border-primary/20 bg-card/70 text-center">
          <CardContent className="px-8 py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary"><Sparkles className="h-8 w-8 text-white" /></div>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">حوّل ما قرأته إلى تشغيل منظم</h2>
            <p className="mx-auto mb-8 max-w-xl leading-relaxed text-muted-foreground">جرّب موتفلكس مجاناً واختبر إدارة العملاء والمشاريع والتصنيع والتركيب من مكان واحد.</p>
            <Button asChild size="lg" className="bg-gradient-to-r from-secondary to-primary px-8 text-white"><Link href="/free-trial">ابدأ تجربتك المجانية</Link></Button>
          </CardContent>
        </Card>
      </div>
    </section>
    <Footer />
  </div>
);

export default Blog;
