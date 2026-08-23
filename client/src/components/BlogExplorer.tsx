import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, Eye, ArrowLeft, ChevronLeft, ChevronRight, FileText, Loader2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Article } from "@shared/schema";

export interface BlogTaxonomyFacet {
  id: number;
  kind: "topic" | "industry" | "content_type";
  slug: string;
  label: string;
  description: string | null;
  aliases: string[];
  sortOrder: number;
  count: number;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
}

interface SuggestionsResponse {
  taxonomy: BlogTaxonomyFacet[];
  articles: Array<{ id: number; title: string; slug: string }>;
}

interface BlogExplorerProps {
  initialTopic?: string;
}

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function BlogExplorer({ initialTopic }: BlogExplorerProps) {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState(initialTopic || "all");
  const [industry, setIndustry] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [page, setPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const limit = 9;

  useEffect(() => {
    setTopic(initialTopic || "all");
    setPage(1);
  }, [initialTopic]);

  const { data: taxonomy = [] } = useQuery<BlogTaxonomyFacet[]>({
    queryKey: ["/api/articles/taxonomy"],
  });

  const { data, isLoading, isFetching } = useQuery<ArticlesResponse>({
    queryKey: ["/api/articles", {
      status: "published",
      search: debouncedSearch,
      topic: topic === "all" ? null : topic,
      industry: industry === "all" ? null : industry,
      contentType: contentType === "all" ? null : contentType,
      page,
      limit,
    }],
  });

  const { data: suggestions } = useQuery<SuggestionsResponse>({
    queryKey: ["/api/articles/search/suggestions", { q: debouncedSearch }],
    enabled: debouncedSearch.length >= 2 && searchFocused,
    staleTime: 10 * 60 * 1000,
  });

  const topics = useMemo(() => taxonomy.filter((item) => item.kind === "topic"), [taxonomy]);
  const industries = useMemo(() => taxonomy.filter((item) => item.kind === "industry"), [taxonomy]);
  const contentTypes = useMemo(() => taxonomy.filter((item) => item.kind === "content_type"), [taxonomy]);
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / limit));
  const hasFilters = Boolean(debouncedSearch || topic !== "all" || industry !== "all" || contentType !== "all");

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setTopic(initialTopic || "all");
    setIndustry("all");
    setContentType("all");
    setPage(1);
  };

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const chooseSuggestion = (entry: BlogTaxonomyFacet) => {
    if (entry.kind === "topic") setTopic(entry.slug);
    if (entry.kind === "industry") setIndustry(entry.slug);
    if (entry.kind === "content_type") setContentType(entry.slug);
    setSearch("");
    setSearchFocused(false);
    setPage(1);
  };

  return (
    <>
      <section className="border-b bg-background py-10" aria-label="البحث وتصفية المقالات">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl rounded-3xl border bg-card/80 p-5 shadow-sm md:p-8">
            <div className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                placeholder="ابحث عن موضوع أو مشكلة... مثال: CRM لشركات التشطيبات"
                className="h-12 pr-12 text-base"
                aria-label="البحث في المقالات"
                data-testid="input-search-articles"
              />
              {isFetching && <Loader2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}

              {searchFocused && debouncedSearch.length >= 2 && suggestions && (
                <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border bg-popover shadow-xl">
                  {suggestions.taxonomy.map((entry) => (
                    <button
                      key={entry.slug}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseSuggestion(entry)}
                      className="flex w-full items-center justify-between px-4 py-3 text-right hover:bg-muted"
                    >
                      <span>{entry.label}</span>
                      <Badge variant="secondary">{entry.count} مقال</Badge>
                    </button>
                  ))}
                  {suggestions.articles.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigate(`/blog/${article.slug}`)}
                      className="flex w-full items-center gap-2 border-t px-4 py-3 text-right hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                      <span>{article.title}</span>
                    </button>
                  ))}
                  {suggestions.taxonomy.length === 0 && suggestions.articles.length === 0 && (
                    <p className="px-4 py-4 text-sm text-muted-foreground">لا توجد اقتراحات مطابقة، وسيظهر البحث الكامل بالأسفل.</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-sm font-semibold">الموضوع</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={topic === "all" ? "default" : "outline"} onClick={() => updateFilter(setTopic, "all")}>الكل</Button>
                  {topics.map((entry) => (
                    <Button
                      key={entry.slug}
                      size="sm"
                      variant={topic === entry.slug ? "default" : "outline"}
                      title={entry.description || undefined}
                      asChild
                    >
                      <Link
                        href={`/blog/topics/${entry.slug}`}
                        onClick={(event) => {
                          event.preventDefault();
                          updateFilter(setTopic, entry.slug);
                        }}
                      >
                        {entry.label}
                        {entry.count > 0 && <span className="mr-1 opacity-60">({entry.count})</span>}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Select value={industry} onValueChange={(value) => updateFilter(setIndustry, value)}>
                  <SelectTrigger aria-label="اختر القطاع"><SelectValue placeholder="كل القطاعات" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل القطاعات</SelectItem>
                    {industries.map((entry) => <SelectItem key={entry.slug} value={entry.slug}>{entry.label} ({entry.count})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={contentType} onValueChange={(value) => updateFilter(setContentType, value)}>
                  <SelectTrigger aria-label="اختر نوع المحتوى"><SelectValue placeholder="كل أنواع المحتوى" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل أنواع المحتوى</SelectItem>
                    {contentTypes.map((entry) => <SelectItem key={entry.slug} value={entry.slug}>{entry.label} ({entry.count})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
                <span>{data?.total || 0} مقال مطابق</span>
                <div className="flex items-center gap-2">
                  {topic !== "all" && !initialTopic && (
                    <Button asChild variant="link" size="sm">
                      <Link href={`/blog/topics/${topic}`}>افتح دليل الموضوع الكامل</Link>
                    </Button>
                  )}
                  {hasFilters && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                      <RotateCcw className="ml-1 h-4 w-4" /> مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16">
        <div className="container relative z-10 mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden border-2">
                  <Skeleton className="h-52 w-full" />
                  <CardContent className="space-y-3 p-6"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent>
                </Card>
              ))}
            </div>
          ) : data?.articles.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted"><FileText className="h-10 w-10 text-muted-foreground" /></div>
              <p className="mb-2 text-xl font-semibold">لا توجد مقالات مطابقة</p>
              <p className="mb-6 text-muted-foreground">جرّب كلمة أقصر أو امسح أحد الفلاتر.</p>
              <Button variant="outline" onClick={clearFilters}>عرض كل المقالات</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {data?.articles.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden border-2 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                    <div className="relative h-52 overflow-hidden">
                      {article.coverImage ? (
                        <img src={article.coverImage} alt={article.coverImageAlt || article.title} loading="lazy" width={400} height={208} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary via-primary/80 to-primary"><FileText className="h-12 w-12 text-white" /></div>
                      )}
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-900">
                        <Calendar className="h-3 w-3" /> {formatDate(article.publishedAt || article.createdAt)}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      {article.tags && article.tags.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{article.tags.slice(0, 2).map((tag) => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}</div>}
                      <h2 className="mb-3 line-clamp-2 text-lg font-bold leading-relaxed transition-colors group-hover:text-primary">{article.title}</h2>
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                      <div className="flex items-center justify-between border-t pt-4 text-sm">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" />{article.viewCount} مشاهدة</span>
                        <span className="flex items-center text-primary">اقرأ المزيد <ArrowLeft className="mr-1 h-4 w-4" /></span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-14 flex items-center justify-center gap-2" aria-label="صفحات المقالات">
              <Button variant="outline" size="icon" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}><ChevronRight className="h-4 w-4" /></Button>
              <span className="px-3 text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
              <Button variant="outline" size="icon" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}><ChevronLeft className="h-4 w-4" /></Button>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
