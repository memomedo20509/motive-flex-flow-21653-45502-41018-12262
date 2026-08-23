import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layers3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BlogExplorer, type BlogTaxonomyFacet } from "@/components/BlogExplorer";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import { Skeleton } from "@/components/ui/skeleton";

const BlogTopic = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: taxonomy = [], isLoading } = useQuery<BlogTaxonomyFacet[]>({
    queryKey: ["/api/articles/taxonomy"],
  });
  const topic = taxonomy.find((entry) => entry.slug === slug && entry.kind === "topic");

  if (isLoading) {
    return <div className="min-h-screen bg-background pt-32" dir="rtl"><div className="container mx-auto px-4"><Skeleton className="mx-auto h-48 max-w-4xl rounded-3xl" /></div></div>;
  }

  const label = topic?.label || "موضوعات المدونة";
  const description = topic?.description || "استكشف أدلة ومقالات موتفلكس المتخصصة في إدارة وتشغيل المصانع والشركات.";

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEOHead
        title={`${label} | دليل موتفلكس`}
        description={`${description} اقرأ التعريف والفوائد وخطوات التطبيق وحالات الاستخدام في دليل واحد.`}
        keywords={`${label}, موتفلكس, إدارة المصانع, السعودية`}
        canonicalUrl={`https://mutflex.com/blog/topics/${slug}`}
      />
      <BreadcrumbSchema items={[
        { name: "الرئيسية", url: "https://mutflex.com/" },
        { name: "المدونة", url: "https://mutflex.com/blog" },
        { name: label, url: `https://mutflex.com/blog/topics/${slug}` },
      ]} />
      <Navbar />

      <header className="relative overflow-hidden pb-16 pt-32 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(177,81%,35%)] to-secondary" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"><Layers3 className="h-5 w-5" /> دليل موضوعي</div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">{label}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/90">{description}</p>
          <p className="mt-3 text-sm text-white/75">ابدأ بالتعريف، ثم اختر الفوائد أو التطبيق أو حالات الاستخدام من الفلاتر.</p>
        </div>
      </header>

      <BlogExplorer initialTopic={slug} />
      <Footer />
    </div>
  );
};

export default BlogTopic;
