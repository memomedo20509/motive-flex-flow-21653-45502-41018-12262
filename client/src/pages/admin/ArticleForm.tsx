import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Save, X, Upload, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Article } from "@shared/schema";

const ArticleForm = () => {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const articleId = params.id ? parseInt(params.id) : null;
  const isEditing = articleId !== null;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "فريق موتفلكس",
    status: "draft" as "draft" | "published",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    focusKeyword: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robotsDirective: "index, follow",
    readingTime: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: [`/api/admin/articles/${articleId}`],
    enabled: isEditing,
  });

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        content: article.content,
        coverImage: article.coverImage || "",
        author: article.author || "فريق موتفلكس",
        status: article.status as "draft" | "published",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
        metaKeywords: article.metaKeywords || "",
        focusKeyword: article.focusKeyword || "",
        canonicalUrl: article.canonicalUrl || "",
        ogTitle: article.ogTitle || "",
        ogDescription: article.ogDescription || "",
        ogImage: article.ogImage || "",
        robotsDirective: article.robotsDirective || "index, follow",
        readingTime: article.readingTime || "",
        tags: article.tags || [],
      });
      if (article.coverImage) {
        setCoverPreview(article.coverImage);
      }
    }
  }, [article]);

  // Handle HTML file import
  const handleHtmlImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast({ title: "يرجى اختيار ملف HTML صالح", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("htmlFile", file);

      const res = await fetch("/api/admin/articles/parse-html", {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "فشل في تحليل الملف");
      }

      const parsedData = await res.json();
      
      setFormData(prev => ({
        ...prev,
        title: parsedData.title || prev.title,
        content: parsedData.content || prev.content,
        excerpt: parsedData.excerpt || prev.excerpt,
        metaTitle: parsedData.metaTitle || prev.metaTitle,
        metaDescription: parsedData.metaDescription || prev.metaDescription,
        metaKeywords: parsedData.metaKeywords || prev.metaKeywords,
        ogTitle: parsedData.ogTitle || prev.ogTitle,
        ogDescription: parsedData.ogDescription || prev.ogDescription,
        ogImage: parsedData.ogImage || prev.ogImage,
      }));

      toast({ title: "تم استيراد المقال بنجاح! راجع البيانات وعدّل ما تحتاج" });
    } catch (error) {
      toast({ 
        title: error instanceof Error ? error.message : "حدث خطأ أثناء الاستيراد", 
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  // Calculate reading time from content
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} دقيقة`;
  };

  // Auto-calculate reading time when content changes
  useEffect(() => {
    if (formData.content) {
      const time = calculateReadingTime(formData.content);
      setFormData(prev => ({ ...prev, readingTime: time }));
    }
  }, [formData.content]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create article");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "تم إنشاء المقال بنجاح" });
      navigate("/admin/articles");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update article");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({ title: "تم تحديث المقال بنجاح" });
      navigate("/admin/articles");
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({ title: "العنوان مطلوب", variant: "destructive" });
      return;
    }
    if (!formData.content.trim()) {
      toast({ title: "المحتوى مطلوب", variant: "destructive" });
      return;
    }

    const data = new FormData();
    data.append(
      "data",
      JSON.stringify({
        ...formData,
        slug: formData.slug || undefined,
      })
    );
    if (coverFile) {
      data.append("coverImage", coverFile);
    }

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/articles">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-form-title">
                {isEditing ? "تعديل المقال" : "مقال جديد"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? "قم بتعديل بيانات المقال" : "أضف مقال جديد للمدونة"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={isImporting}
                asChild
                data-testid="button-import-html"
              >
                <span>
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 ml-2" />
                  )}
                  {isImporting ? "جاري الاستيراد..." : "استيراد HTML"}
                </span>
              </Button>
              <input
                type="file"
                className="hidden"
                accept=".html,.htm"
                onChange={handleHtmlImport}
                disabled={isImporting}
              />
            </label>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({ ...formData, status: "draft" });
              }}
              disabled={isPending}
              data-testid="button-save-draft"
            >
              حفظ كمسودة
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-testid="button-publish"
            >
              <Save className="h-4 w-4 ml-2" />
              {isPending ? "جاري الحفظ..." : isEditing ? "تحديث" : "نشر"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المحتوى الأساسي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="عنوان المقال"
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">الرابط (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="يتم إنشاؤه تلقائياً من العنوان"
                    className="text-left"
                    dir="ltr"
                    data-testid="input-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">الملخص</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    placeholder="ملخص قصير للمقال"
                    rows={3}
                    data-testid="input-excerpt"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">المحتوى * (Markdown)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="اكتب محتوى المقال هنا... يمكنك استخدام Markdown"
                    rows={15}
                    className="font-mono"
                    data-testid="input-content"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تحسين محركات البحث (SEO)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="focusKeyword">الكلمة المفتاحية الرئيسية (Focus Keyword)</Label>
                  <Input
                    id="focusKeyword"
                    value={formData.focusKeyword}
                    onChange={(e) =>
                      setFormData({ ...formData, focusKeyword: e.target.value })
                    }
                    placeholder="الكلمة الرئيسية التي تستهدفها"
                    data-testid="input-focus-keyword"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaTitle">عنوان الصفحة (Meta Title)</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    placeholder="يستخدم العنوان الأساسي إذا تُرك فارغاً"
                    data-testid="input-meta-title"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaTitle.length}/60 حرف (الأفضل 50-60)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">وصف الصفحة (Meta Description)</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, metaDescription: e.target.value })
                    }
                    placeholder="وصف مختصر للظهور في نتائج البحث"
                    rows={2}
                    data-testid="input-meta-description"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaDescription.length}/160 حرف (الأفضل 120-160)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">الكلمات المفتاحية (Meta Keywords)</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) =>
                      setFormData({ ...formData, metaKeywords: e.target.value })
                    }
                    placeholder="كلمة1, كلمة2, كلمة3"
                    data-testid="input-meta-keywords"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">الرابط القانوني (Canonical URL)</Label>
                  <Input
                    id="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, canonicalUrl: e.target.value })
                    }
                    placeholder="https://example.com/blog/article-slug"
                    className="text-left"
                    dir="ltr"
                    data-testid="input-canonical-url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robotsDirective">توجيهات الروبوتات (Robots)</Label>
                  <Select
                    value={formData.robotsDirective}
                    onValueChange={(value) =>
                      setFormData({ ...formData, robotsDirective: value })
                    }
                  >
                    <SelectTrigger data-testid="select-robots">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">Index, Follow (افتراضي)</SelectItem>
                      <SelectItem value="noindex, follow">NoIndex, Follow</SelectItem>
                      <SelectItem value="index, nofollow">Index, NoFollow</SelectItem>
                      <SelectItem value="noindex, nofollow">NoIndex, NoFollow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Graph (السوشيال ميديا)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ogTitle">عنوان المشاركة (OG Title)</Label>
                  <Input
                    id="ogTitle"
                    value={formData.ogTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, ogTitle: e.target.value })
                    }
                    placeholder="يستخدم Meta Title إذا تُرك فارغاً"
                    data-testid="input-og-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogDescription">وصف المشاركة (OG Description)</Label>
                  <Textarea
                    id="ogDescription"
                    value={formData.ogDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, ogDescription: e.target.value })
                    }
                    placeholder="يستخدم Meta Description إذا تُرك فارغاً"
                    rows={2}
                    data-testid="input-og-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ogImage">رابط صورة المشاركة (OG Image)</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage}
                    onChange={(e) =>
                      setFormData({ ...formData, ogImage: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="text-left"
                    dir="ltr"
                    data-testid="input-og-image"
                  />
                  <p className="text-xs text-muted-foreground">
                    الأبعاد المثالية: 1200x630 بكسل
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "draft" | "published") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">الكاتب</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    data-testid="input-author"
                  />
                </div>

                <div className="space-y-2">
                  <Label>وقت القراءة</Label>
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
                    {formData.readingTime || "سيتم حسابه تلقائياً"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>صورة الغلاف</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover rounded-lg"
                      data-testid="img-cover-preview"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                        setFormData({ ...formData, coverImage: "" });
                      }}
                      data-testid="button-remove-cover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        اضغط لرفع صورة
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      data-testid="input-cover-file"
                    />
                  </label>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التصنيفات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="أضف تصنيف"
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    data-testid="button-add-tag"
                  >
                    إضافة
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1"
                        data-testid={`badge-tag-${tag}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default ArticleForm;
