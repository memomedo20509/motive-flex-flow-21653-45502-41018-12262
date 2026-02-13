import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { SEOHead } from "@/components/SEOHead";
import { ArticleSchema } from "@/components/SchemaMarkup";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Calendar, Eye, User, ArrowRight, Share2, Twitter, Facebook, Linkedin, Copy, Check, ArrowLeft, BookOpen, FileText, Zap, CheckCircle, Phone, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@shared/schema";

interface ArticleResponse {
  article: Article;
  relatedArticles: Article[];
}

const BlogPost = () => {
  const params = useParams() as { slug?: string };
  const slug = params.slug;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const [showStickyCta, setShowStickyCta] = useState(false);

  const { data, isLoading, error } = useQuery<ArticleResponse>({
    queryKey: [`/api/articles/${slug}`],
    enabled: !!slug,
  });

  const article = data?.article;
  const relatedArticles = data?.relatedArticles || [];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickyCta(scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTocClick = useCallback((e: { preventDefault: () => void }, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const navHeight = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  }, []);

  const htmlContent = useMemo(() => {
    if (!article?.content) return "";
    let content = article.content.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");
    if (typeof window === "undefined") return content;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    doc.querySelectorAll('h1, h2, h3').forEach((el) => {
      const text = el.textContent || '';
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\u0621-\u064Aa-z0-9-]/g, "");
      el.setAttribute('id', id);
    });
    return doc.body.innerHTML;
  }, [article?.content]);

  const contentParts = useMemo(() => {
    if (!htmlContent) return { before: "", after: "" };
    const parser = typeof window !== "undefined" ? new DOMParser() : null;
    if (!parser) return { before: htmlContent, after: "" };
    
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const allElements = Array.from(doc.body.children);
    const totalElements = allElements.length;
    
    if (totalElements < 6) return { before: htmlContent, after: "" };
    
    const splitIndex = Math.floor(totalElements * 0.4);
    const beforeElements = allElements.slice(0, splitIndex);
    const afterElements = allElements.slice(splitIndex);
    
    const before = beforeElements.map(el => el.outerHTML).join("");
    const after = afterElements.map(el => el.outerHTML).join("");
    
    return { before, after };
  }, [htmlContent]);

  const tableOfContents = useMemo(() => {
    if (!article?.content) return [];
    // Skip DOMParser on server (SSR) - only parse on client
    if (typeof window === "undefined") return [];
    
    const headings: { level: number; text: string; id: string }[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3');
    headingElements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const level = parseInt(tagName.charAt(1));
      const text = el.textContent || '';
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\u0621-\u064Aa-z0-9-]/g, "");
      headings.push({ level, text, id });
    });
    return headings;
  }, [article?.content]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article?.title || "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "تم نسخ الرابط" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };


  // Generate title from slug as fallback for SSR
  const slugTitle = slug ? decodeURIComponent(slug).replace(/-/g, ' ') : 'مقال';
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <SEOHead 
          title={`${slugTitle} | موتفلكس`}
          description={`اقرأ مقال ${slugTitle} على مدونة موتفلكس`}
        />
        <Navbar />
        <div className="pt-32 pb-16">
          <section className="relative py-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] via-[hsl(177,81%,35%)] to-[hsl(45,76%,51%)]"></div>
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto">
                <Skeleton className="h-6 w-32 mb-6 bg-white/20" />
                <Skeleton className="h-12 w-3/4 mb-4 bg-white/20" />
                <Skeleton className="h-6 w-1/2 bg-white/20" />
              </div>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-64 w-full mb-8" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <SEOHead 
          title={`${slugTitle} | موتفلكس`}
          description={`اقرأ مقال ${slugTitle} على مدونة موتفلكس`}
          noindex={true}
        />
        <Navbar />
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] via-[hsl(177,81%,35%)] to-[hsl(45,76%,51%)]"></div>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">المقال غير موجود</h1>
            <p className="text-white/80 mb-8 max-w-md mx-auto">عذراً، لم نتمكن من العثور على المقال المطلوب.</p>
            <Button className="bg-white text-primary" asChild>
              <Link href="/blog">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للمدونة
              </Link>
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mutflex.com";
  const pageUrl = `${baseUrl}/blog/${article.slug}`;
  const ogImage = article.ogImage || article.coverImage || "/og-image.webp";
  const pageDescription = article.metaDescription || article.excerpt || article.title;
  const publishedDate = new Date(article.createdAt).toISOString();
  const modifiedDate = article.updatedAt ? new Date(article.updatedAt).toISOString() : publishedDate;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEOHead
        title={article.metaTitle || article.title}
        description={pageDescription}
        keywords={article.metaKeywords || article.tags?.join(", ")}
        canonicalUrl={article.canonicalUrl || pageUrl}
        ogImage={ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`}
        ogType="article"
        article={{
          publishedTime: publishedDate,
          modifiedTime: modifiedDate,
          author: article.author || "فريق موتفلكس",
          tags: article.tags || [],
        }}
        noindex={article.robotsDirective?.includes("noindex") || (article as any).isPreview}
        nofollow={article.robotsDirective?.includes("nofollow") || (article as any).isPreview}
      />
      {(() => {
        let validSchemaMarkup: string | null = null;
        if (article.schemaMarkup) {
          try {
            JSON.parse(article.schemaMarkup);
            validSchemaMarkup = article.schemaMarkup;
          } catch {
            validSchemaMarkup = null;
          }
        }
        return validSchemaMarkup ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: validSchemaMarkup }}
          />
        ) : (
          <ArticleSchema
            headline={article.title}
            description={pageDescription}
            image={ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`}
            datePublished={publishedDate}
            dateModified={modifiedDate}
            authorName={article.author || "فريق موتفلكس"}
            url={pageUrl}
          />
        );
      })()}
      <Navbar />

      {/* Preview Banner */}
      {(article as any).isPreview && (
        <div className="bg-yellow-500 text-black py-2 px-4 text-center font-medium" data-testid="preview-banner">
          وضع المعاينة - هذه المقالة غير منشورة ولن تظهر للزوار أو محركات البحث
        </div>
      )}

      {/* Hero Section - Enhanced */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] from-0% via-[hsl(177,81%,35%)] via-35% to-[hsl(45,76%,51%)] to-100%"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Animated particles overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Gradient fade to background at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll>
            <div className="max-w-4xl mx-auto text-white">
              <Breadcrumbs
                items={[
                  { label: "المدونة", href: "/blog" },
                  { label: article.title },
                ]}
                className="mb-6 text-white/80"
              />
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight" data-testid="text-article-title">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <User className="h-4 w-4" />
                  <span data-testid="text-article-author">{article.author}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="text-article-date">{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Eye className="h-4 w-4" />
                  <span data-testid="text-article-views">{article.viewCount} مشاهدة</span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            {/* Sidebar - Table of Contents */}
            {tableOfContents.length > 0 && (
              <aside className="lg:w-72 shrink-0 order-2 lg:order-1">
                <div className="lg:sticky lg:top-24 space-y-4">
                  <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        محتويات المقال
                      </h3>
                      <nav className="space-y-2">
                        {tableOfContents.map((heading, index) => (
                          <a
                            key={index}
                            href={`#${heading.id}`}
                            onClick={(e) => handleTocClick(e, heading.id)}
                            className={`block text-sm text-muted-foreground hover:text-secondary transition-colors py-1 border-r-2 border-transparent hover:border-secondary ${
                              heading.level === 2 ? "pr-3" : heading.level === 3 ? "pr-5" : "pr-2"
                            }`}
                            data-testid={`link-toc-${index}`}
                          >
                            {heading.text}
                          </a>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>

                  {/* Share Buttons */}
                  <Card className="border-2 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-primary" />
                        شارك المقال
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          data-testid="button-share-twitter"
                        >
                          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          data-testid="button-share-facebook"
                        >
                          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          data-testid="button-share-linkedin"
                        >
                          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyLink}
                          data-testid="button-share-copy"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sidebar CTA - Free Trial */}
                  <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/10 via-card to-primary/10" data-testid="card-sidebar-cta">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-md bg-secondary/20 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-secondary" />
                        </div>
                        <h3 className="font-bold text-sm">جرّب موتفلكس مجاناً</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        ابدأ تجربتك المجانية لمدة شهر كامل واكتشف كيف يمكن لموتفلكس تحويل عملك
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0" />
                          <span>بدون بطاقة ائتمان</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0" />
                          <span>دعم فني متواصل</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-secondary shrink-0" />
                          <span>جميع المميزات مفتوحة</span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        variant="default"
                        size="default"
                        asChild
                        data-testid="button-sidebar-cta-trial"
                      >
                        <Link href="/free-trial">
                          <Zap className="h-4 w-4 ml-2" />
                          ابدأ تجربتك المجانية
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full mt-2 text-xs"
                        size="sm"
                        asChild
                        data-testid="button-sidebar-cta-contact"
                      >
                        <Link href="/contact">
                          <Phone className="h-3 w-3 ml-1" />
                          أو تواصل معنا
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            )}

            {/* Main Content */}
            <article className="flex-1 min-w-0 order-1 lg:order-2">
              {article.coverImage && (
                <div className="mb-8 rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    width={800}
                    height={450}
                    className="w-full h-auto max-h-[450px] object-cover"
                    data-testid="img-article-cover"
                  />
                </div>
              )}

              <Card className="border-0 shadow-none hover:shadow-none bg-transparent">
                <CardContent className="p-0">
                  {contentParts.after ? (
                    <>
                      <div 
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-secondary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-secondary prose-blockquote:text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: contentParts.before }}
                        data-testid="article-content-before"
                      />

                      {/* Inline CTA */}
                      <div className="my-10 rounded-md bg-gradient-to-l from-secondary/10 via-secondary/5 to-primary/10 border border-secondary/20 p-6 md:p-8" data-testid="card-inline-cta">
                        <div className="flex flex-col md:flex-row flex-wrap items-center gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="h-5 w-5 text-primary" />
                              <h3 className="font-bold text-lg">هل تبحث عن حل ذكي لإدارة عملك؟</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              جرّب موتفلكس مجاناً لمدة شهر كامل واكتشف كيف يمكن لنظامنا تبسيط عمليات التصنيع والتركيب في منشأتك
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
                            <Button
                              variant="default"
                              asChild
                              data-testid="button-inline-cta-trial"
                            >
                              <Link href="/free-trial">
                                <Zap className="h-4 w-4 ml-2" />
                                ابدأ تجربتك المجانية
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              asChild
                              data-testid="button-inline-cta-features"
                            >
                              <Link href="/features">
                                اكتشف المميزات
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-secondary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-secondary prose-blockquote:text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: contentParts.after }}
                        data-testid="article-content-after"
                      />
                    </>
                  ) : (
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-secondary prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-secondary prose-blockquote:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                      data-testid="article-content"
                    />
                  )}
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </section>

      {/* End of Article CTA */}
      <section className="py-16 relative overflow-hidden" data-testid="section-end-cta">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] from-0% via-[hsl(177,81%,35%)] via-35% to-[hsl(45,76%,51%)] to-100%"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll>
            <div className="max-w-3xl mx-auto text-center text-white">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                حوّل منشأتك من الفوضى إلى النظام الذكي
              </h2>
              <p className="text-lg text-white/90 mb-6 leading-relaxed max-w-2xl mx-auto">
                انضم لمئات المنشآت التي تدير عملياتها بكفاءة عالية مع موتفلكس. جرّب النظام مجاناً لمدة شهر كامل
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>تجربة مجانية لمدة شهر</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>بدون بطاقة ائتمان</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>دعم فني متواصل</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
                <Button
                  size="default"
                  className="px-10 bg-white text-[hsl(177,81%,30%)] shadow-xl font-bold border-white"
                  asChild
                  data-testid="button-end-cta-trial"
                >
                  <Link href="/free-trial">
                    <Zap className="ml-2 w-4 h-4" />
                    ابدأ تجربتك المجانية الآن
                  </Link>
                </Button>
                
                <Button
                  size="default"
                  className="px-10 bg-white/15 text-white border-white/50 backdrop-blur-md shadow-xl font-semibold"
                  asChild
                  data-testid="button-end-cta-contact"
                >
                  <Link href="/contact">
                    <Phone className="ml-2 w-4 h-4" />
                    تواصل معنا
                  </Link>
                </Button>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-20 bg-muted/30 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">مقالات ذات صلة</h2>
                <p className="text-muted-foreground">اكتشف المزيد من المقالات المفيدة</p>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto stagger-children">
              {relatedArticles.map((related) => (
                <AnimateOnScroll key={related.id}>
                  <Link href={`/blog/${related.slug}`} data-testid={`link-related-article-${related.id}`}>
                    <Card 
                      className="overflow-hidden group cursor-pointer h-full border-2 hover:border-primary transition-all duration-500 bg-card/50 backdrop-blur-sm"
                      data-testid={`card-related-article-${related.id}`}
                    >
                      <div className="relative h-44 overflow-hidden">
                        {related.coverImage ? (
                          <img
                            src={related.coverImage}
                            alt={related.title}
                            loading="lazy"
                            width={350}
                            height={176}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary via-primary/80 to-primary flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative z-10">
                              <FileText className="w-10 h-10 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-secondary transition-colors leading-relaxed">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {related.excerpt}
                        </p>
                        <div className="mt-4 flex items-center text-secondary text-sm font-medium group-hover:gap-2 transition-all">
                          <span>اقرأ المزيد</span>
                          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Floating CTA */}
      {showStickyCta && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
          data-testid="sticky-cta-container"
        >
          <Button
            size="lg"
            className="px-8 shadow-2xl font-bold text-base"
            asChild
            data-testid="button-sticky-cta"
          >
            <Link href="/free-trial">
              <Zap className="ml-2 w-5 h-5" />
              جرّب موتفلكس مجاناً
            </Link>
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
