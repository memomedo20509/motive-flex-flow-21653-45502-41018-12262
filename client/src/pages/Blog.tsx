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
import { Search, Calendar, Eye, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Article } from "@shared/schema";

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

const Blog = () => {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
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
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,30%)] via-[hsl(177,81%,35%)] to-[hsl(45,76%,51%)]"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimateOnScroll>
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
                مقالات موتفلكس
              </h1>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto" data-testid="text-blog-subtitle">
                اكتشف أحدث المقالات والنصائح حول إدارة مصانع التشطيبات والمقاولات
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
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
                className="pr-10"
                data-testid="input-search-articles"
              />
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
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
              {tagsData?.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedTag(tag);
                    setPage(1);
                  }}
                  data-testid={`button-filter-tag-${tag}`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground" data-testid="text-no-articles">
                لا توجد مقالات حالياً
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.articles.map((article, index) => (
                <AnimateOnScroll key={article.id}>
                  <Link href={`/blog/${article.slug}`}>
                    <Card 
                      className="overflow-hidden group cursor-pointer h-full hover-elevate transition-all duration-300"
                      data-testid={`card-article-${article.id}`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            data-testid={`img-article-cover-${article.id}`}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                            <span className="text-4xl text-muted-foreground">M</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
                          className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-secondary transition-colors"
                          data-testid={`text-article-title-${article.id}`}
                        >
                          {article.title}
                        </h3>
                        <p 
                          className="text-muted-foreground text-sm mb-4 line-clamp-2"
                          data-testid={`text-article-excerpt-${article.id}`}
                        >
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.viewCount} مشاهدة</span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center text-secondary text-sm font-medium group-hover:gap-2 transition-all">
                          <span>اقرأ المزيد</span>
                          <ArrowLeft className="h-4 w-4 mr-1" />
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
            <div className="flex justify-center items-center gap-2 mt-12">
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
