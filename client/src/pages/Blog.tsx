import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/SchemaMarkup";
import { Search, Calendar, Eye, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, BookOpen, Sparkles, FileText } from "lucide-react";
import type { Article } from "@shared/schema";

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

const INITIAL_TAGS_TO_SHOW = 12;

const Blog = () => {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const limit = 9;

  const { data: tagsData } = useQuery<string[]>({
    queryKey: ["/api/articles/tags"],
  });

  const { data, isLoading } = useQuery<ArticlesResponse>({
    queryKey: ["/api/articles", { status: "published", tag: selectedTag, search, page, limit }],
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEOHead
        title="المدونة"
        description="اقرأ أحدث المقالات والنصائح حول إدارة التصنيع والتركيب، التحول الرقمي للمصانع، وأفضل الممارسات في القطاع الصناعي."
        keywords="مدونة موتفلكس, مقالات تصنيع, نصائح صناعية, تحول رقمي"
        canonicalUrl="https://mutflex.com/blog"
      />
      <BreadcrumbSchema items={[
        { name: "الرئيسية", url: "https://mutflex.com/" },
        { name: "المدونة", url: "https://mutflex.com/blog" }
      ]} />
      <Navbar />

      {/* Hero Section - Enhanced matching Index.tsx */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] from-0% via-[hsl(177,81%,35%)] via-35% to-[hsl(45,76%,51%)] to-100%"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated particles overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
        </div>
        
        {/* Gradient fade to background at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto stagger-children">
            <AnimateOnScroll>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20" data-testid="badge-blog-trust">
                <BookOpen className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">مقالات ونصائح من خبراء الصناعة</span>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight" data-testid="text-blog-title">
                مدونة موتفلكس
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-foreground to-white animate-pulse-slow text-3xl md:text-4xl mt-2">
                  أحدث المقالات والرؤى
                </span>
              </h1>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed" data-testid="text-blog-subtitle">
                اكتشف أحدث المقالات والنصائح حول إدارة مصانع التشطيبات والمقاولات
                <br />
                <span className="font-semibold">من خبراء الصناعة وأفضل الممارسات</span>
              </p>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30 border-b relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في المقالات..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pr-10 bg-background/50 backdrop-blur-sm"
                data-testid="input-search-articles"
              />
            </div>

            {/* Tags Filter */}
            <div className="w-full md:w-auto">
              <div 
                id="tags-filter-list"
                className="flex flex-wrap gap-2 justify-center"
                role="group"
                aria-label="تصفية المقالات حسب الوسوم"
              >
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedTag(null);
                    setPage(1);
                  }}
                  data-testid="button-filter-all"
                >
                  الكل
                </Button>
                {tagsData?.map((tag, index) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedTag(tag);
                      setPage(1);
                    }}
                    className={!isTagsExpanded && index >= INITIAL_TAGS_TO_SHOW ? "hidden" : ""}
                    data-testid={`button-filter-tag-${tag}`}
                  >
                    {tag}
                  </Button>
                ))}
                {tagsData && tagsData.length > INITIAL_TAGS_TO_SHOW && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                    className="gap-1 text-primary hover:text-primary"
                    aria-expanded={isTagsExpanded}
                    aria-controls="tags-filter-list"
                    data-testid="button-toggle-tags"
                  >
                    {isTagsExpanded ? (
                      <>
                        عرض أقل
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        عرض المزيد ({tagsData.length - INITIAL_TAGS_TO_SHOW})
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-2">
                  <Skeleton className="h-52 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-5 w-24 mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-xl text-muted-foreground mb-4" data-testid="text-no-articles">
                لا توجد مقالات حالياً
              </p>
              <p className="text-sm text-muted-foreground">
                يتم إضافة مقالات جديدة قريباً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {data?.articles.map((article) => (
                <AnimateOnScroll key={article.id}>
                  <Link href={`/blog/${article.slug}`} data-testid={`link-article-${article.id}`}>
                    <Card 
                      className="overflow-hidden group cursor-pointer h-full border-2 hover:border-primary transition-all duration-500 bg-card/50 backdrop-blur-sm"
                      data-testid={`card-article-${article.id}`}
                    >
                      <div className="relative h-52 overflow-hidden">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            loading="lazy"
                            width={400}
                            height={208}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            data-testid={`img-article-cover-${article.id}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full bg-gradient-to-br from-secondary via-primary/80 to-primary items-center justify-center relative"
                          style={{ display: article.coverImage ? 'none' : 'flex' }}
                        >
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                              <FileText className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-white/80 text-sm font-medium">مقال موتفلكس</span>
                          </div>
                          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 blur-xl"></div>
                          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/10 blur-xl"></div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Date badge on image */}
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <h3 
                          className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-secondary transition-colors leading-relaxed"
                          data-testid={`text-article-title-${article.id}`}
                        >
                          {article.title}
                        </h3>
                        <p 
                          className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed"
                          data-testid={`text-article-excerpt-${article.id}`}
                        >
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />
                            <span>{article.viewCount} مشاهدة</span>
                          </div>
                          <div className="flex items-center text-secondary text-sm font-medium group-hover:gap-2 transition-all">
                            <span>اقرأ المزيد</span>
                            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <AnimateOnScroll>
              <div className="flex justify-center items-center gap-2 mt-16">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-pagination-prev"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={page === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      data-testid={`button-pagination-${i + 1}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="button-pagination-next"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </AnimateOnScroll>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll>
            <Card className="max-w-3xl mx-auto text-center border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="py-12 px-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  هل تريد تجربة موتفلكس؟
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                  ابدأ تجربتك المجانية الآن واكتشف كيف يمكن لموتفلكس تحويل إدارة مصنعك
                </p>
                <Button size="lg" className="shadow-xl px-8 bg-gradient-to-r from-secondary to-primary text-white" asChild data-testid="button-blog-cta">
                  <Link href="/free-trial">
                    ابدأ تجربتك المجانية
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
