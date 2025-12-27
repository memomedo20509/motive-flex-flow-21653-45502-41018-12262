import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Loader2,
  Mail,
  Save,
  Globe,
  Search,
  FileText,
  RefreshCw,
  ExternalLink,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const settingsFormSchema = z.object({
  notification_email: z.string().email("البريد الإلكتروني غير صالح").or(z.literal("")),
  site_name: z.string().optional(),
  site_url: z.string().url("الرابط غير صالح").or(z.literal("")),
  default_meta_description: z.string().optional(),
  default_og_image: z.string().optional(),
  ga_id: z.string().optional(),
  gtm_id: z.string().optional(),
  google_verification: z.string().optional(),
  bing_verification: z.string().optional(),
  robots_txt: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const { toast } = useToast();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      notification_email: "",
      site_name: "",
      site_url: "",
      default_meta_description: "",
      default_og_image: "",
      ga_id: "",
      gtm_id: "",
      google_verification: "",
      bing_verification: "",
      robots_txt: "",
    },
  });

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/admin/settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      return apiRequest("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "تم حفظ الإعدادات بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "فشل في حفظ الإعدادات", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const regenerateSitemapMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/regenerate-sitemap", { method: "POST" });
    },
    onSuccess: () => {
      toast({ title: "تم تحديث خريطة الموقع بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "فشل في تحديث خريطة الموقع", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  if (settings && form.getValues("notification_email") === "") {
    form.reset({
      notification_email: settings.notification_email || "",
      site_name: settings.site_name || "",
      site_url: settings.site_url || "",
      default_meta_description: settings.default_meta_description || "",
      default_og_image: settings.default_og_image || "",
      ga_id: settings.ga_id || "",
      gtm_id: settings.gtm_id || "",
      google_verification: settings.google_verification || "",
      bing_verification: settings.bing_verification || "",
      robots_txt: settings.robots_txt || "",
    });
  }

  const onSubmit = (data: SettingsForm) => {
    updateMutation.mutate(data);
  };

  const defaultRobotsTxt = `User-agent: *
Allow: /

# Disallow admin and API paths
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /login

# Sitemap
Sitemap: ${settings?.site_url || "https://mutflex.com"}/sitemap.xml`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-settings">الإعدادات</h1>
          <p className="text-muted-foreground">
            إعدادات النظام والإشعارات وتحسين محركات البحث
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    إعدادات الإشعارات
                  </CardTitle>
                  <CardDescription>
                    إعداد البريد الإلكتروني لاستقبال إشعارات رسائل التواصل
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notification_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني للإشعارات</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            dir="ltr" 
                            className="text-left max-w-md"
                            placeholder="admin@example.com"
                            data-testid="input-notification-email"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          سيتم إرسال إشعارات رسائل التواصل الجديدة إلى هذا البريد الإلكتروني
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Site Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    إعدادات الموقع الأساسية
                  </CardTitle>
                  <CardDescription>
                    الإعدادات الافتراضية للـ SEO على مستوى الموقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="site_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الموقع</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="موتفلكس"
                              data-testid="input-site-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            يُضاف لعناوين الصفحات (مثال: اسم المقال | موتفلكس)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="site_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رابط الموقع</FormLabel>
                          <FormControl>
                            <Input 
                              dir="ltr"
                              className="text-left"
                              placeholder="https://mutflex.com"
                              data-testid="input-site-url"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            الرابط الأساسي للموقع (للـ Sitemap والروابط القانونية)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="default_meta_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الموقع الافتراضي</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف موجز للموقع يظهر في نتائج البحث..."
                            className="resize-none"
                            rows={3}
                            data-testid="input-default-meta-description"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          يُستخدم للصفحات التي ليس لها وصف خاص (120-160 حرف)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="default_og_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>صورة المشاركة الافتراضية</FormLabel>
                        <FormControl>
                          <Input 
                            dir="ltr"
                            className="text-left"
                            placeholder="https://mutflex.com/og-image.jpg"
                            data-testid="input-default-og-image"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          الصورة التي تظهر عند مشاركة روابط الموقع (1200x630 بكسل)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Analytics & Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    التحليلات والتحقق
                  </CardTitle>
                  <CardDescription>
                    إعداد Google Analytics وأدوات مشرفي المواقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="ga_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Analytics ID</FormLabel>
                          <FormControl>
                            <Input 
                              dir="ltr"
                              className="text-left"
                              placeholder="G-XXXXXXXXXX"
                              data-testid="input-ga-id"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            معرف GA4 (يبدأ بـ G-)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gtm_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Tag Manager ID</FormLabel>
                          <FormControl>
                            <Input 
                              dir="ltr"
                              className="text-left"
                              placeholder="GTM-XXXXXXX"
                              data-testid="input-gtm-id"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            معرف GTM (يبدأ بـ GTM-)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="google_verification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Search Console</FormLabel>
                          <FormControl>
                            <Input 
                              dir="ltr"
                              className="text-left"
                              placeholder="كود التحقق"
                              data-testid="input-google-verification"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            محتوى meta tag للتحقق من Google
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bing_verification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bing Webmaster</FormLabel>
                          <FormControl>
                            <Input 
                              dir="ltr"
                              className="text-left"
                              placeholder="كود التحقق"
                              data-testid="input-bing-verification"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            محتوى meta tag للتحقق من Bing
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sitemap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    خريطة الموقع (Sitemap)
                  </CardTitle>
                  <CardDescription>
                    تحديث خريطة الموقع لمحركات البحث
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => regenerateSitemapMutation.mutate()}
                      disabled={regenerateSitemapMutation.isPending}
                      data-testid="button-regenerate-sitemap"
                    >
                      {regenerateSitemapMutation.isPending ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="ml-2 h-4 w-4" />
                      )}
                      تحديث Sitemap
                    </Button>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      عرض sitemap.xml
                    </a>
                  </div>
                  {settings?.sitemap_last_updated && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>
                        آخر تحديث: {formatDistanceToNow(new Date(settings.sitemap_last_updated), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    يتم إنشاء Sitemap تلقائياً ويتضمن جميع الصفحات الثابتة والمقالات المنشورة.
                    اضغط على الزر أعلاه لتحديث آخر وقت تعديل.
                  </p>
                </CardContent>
              </Card>

              {/* Robots.txt */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    ملف robots.txt
                  </CardTitle>
                  <CardDescription>
                    التحكم في فهرسة محركات البحث للموقع
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="robots_txt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>محتوى robots.txt</FormLabel>
                        <FormControl>
                          <Textarea 
                            dir="ltr"
                            className="font-mono text-sm text-left"
                            placeholder={defaultRobotsTxt}
                            rows={10}
                            data-testid="input-robots-txt"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          اتركه فارغاً لاستخدام الإعدادات الافتراضية. يمكنك عرض الملف على{" "}
                          <a
                            href="/robots.txt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            /robots.txt
                          </a>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ جميع الإعدادات
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </AdminLayout>
  );
}
