import { useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { marked } from "marked";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { Calendar, Eye, User, ArrowRight, Share2, Twitter, Facebook, Linkedin, Copy, Check, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Article } from "@shared/schema";

interface ArticleResponse {
  article: Article;
  relatedArticles: Article[];
}

const BlogPost = () => {
  const params = useParams();
  const slug = params.slug;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery<ArticleResponse>({
    queryKey: ["/api/articles", slug],
    enabled: !!slug,
  });

  const article = data?.article;
  const relatedArticles = data?.relatedArticles || [];

  const htmlContent = useMemo(() => {
    if (!article?.content) return "";
    return marked(article.content);
  }, [article?.content]);

  const tableOfContents = useMemo(() => {
    if (!article?.content) return [];
    const headings: { level: number; text: string; id: string }[] = [];
    const regex = /^(#{1,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(article.content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\u0621-\u064Aa-z0-9-]/g, "");
      headings.push({ level, text, id });
    }
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

  useEffect(() => {
    if (article?.metaTitle) {
      document.title = article.metaTitle;
    } else if (article?.title) {
      document.title = `${article.title} | موتفلكس`;
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">المقال غير موجود</h1>
          <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على المقال المطلوب.</p>
          <Button asChild>
            <Link href="/blog">
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للمدونة
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] via-[hsl(177,81%,35%)] to-[hsl(45,76%,51%)]"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll>
            <div className="max-w-4xl mx-auto text-white">
              <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للمدونة
              </Link>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" data-testid="text-article-title">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span data-testid="text-article-author">{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="text-article-date">{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span data-testid="text-article-views">{article.viewCount} مشاهدة</span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            {/* Sidebar - Table of Contents */}
            {tableOfContents.length > 0 && (
              <aside className="lg:w-64 shrink-0">
                <div className="lg:sticky lg:top-24">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-4 text-sm">محتويات المقال</h3>
                      <nav className="space-y-2">
                        {tableOfContents.map((heading, index) => (
                          <a
                            key={index}
                            href={`#${heading.id}`}
                            className={`block text-sm text-muted-foreground hover:text-foreground transition-colors ${
                              heading.level === 2 ? "pr-2" : heading.level === 3 ? "pr-4" : ""
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
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-4 text-sm flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
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
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            )}

            {/* Main Content */}
            <article className="flex-1 min-w-0">
              {article.coverImage && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-auto max-h-[400px] object-cover"
                    data-testid="img-article-cover"
                  />
                </div>
              )}

              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                data-testid="article-content"
              />
            </article>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <h2 className="text-2xl font-bold mb-8 text-center">مقالات ذات صلة</h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {relatedArticles.map((related, index) => (
                <AnimateOnScroll key={related.id}>
                  <Link href={`/blog/${related.slug}`}>
                    <Card 
                      className="overflow-hidden group cursor-pointer h-full hover-elevate"
                      data-testid={`card-related-article-${related.id}`}
                    >
                      <div className="relative h-40 overflow-hidden">
                        {related.coverImage ? (
                          <img
                            src={related.coverImage}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                            <span className="text-3xl text-muted-foreground">M</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {related.excerpt}
                        </p>
                        <div className="mt-3 flex items-center text-secondary text-sm font-medium">
                          <span>اقرأ المزيد</span>
                          <ArrowLeft className="h-4 w-4 mr-1" />
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

      <Footer />
    </div>
  );
};

export default BlogPost;
