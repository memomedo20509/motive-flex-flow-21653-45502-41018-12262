import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageScaffold } from "@/components/PageScaffold";
import { CheckCircle, Zap, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrialSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const trialFormSchema = insertTrialSchema.extend({
  fullName: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().min(5, "رقم الجوال مطلوب"),
  company: z.string().min(2, "اسم الشركة مطلوب"),
  industry: z.string().min(1, "القطاع الصناعي مطلوب"),
});

type TrialFormData = z.infer<typeof trialFormSchema>;

const FreeTrial = () => {
  const { toast } = useToast();
  
  const form = useForm<TrialFormData>({
    resolver: zodResolver(trialFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: TrialFormData) => {
      return apiRequest("/api/trial", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "شكراً لاهتمامك، سنتواصل معك قريباً لبدء تجربتك المجانية",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "فشل في تسجيل الطلب، حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TrialFormData) => {
    mutation.mutate(data);
  };

  return (
    <PageScaffold>

      <section className="pt-32 pb-16 px-4 gradient-hero text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap size={40} />
            <h1 className="text-4xl md:text-5xl font-bold" data-testid="heading-free-trial">
              ابدأ تجربتك المجانية لمدة شهرين
            </h1>
          </div>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95">
            شهرين مجاناً - بدون بطاقة ائتمان - ابدأ في دقائق
          </p>
        </div>
      </section>

      <section className="py-8 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              "تجربة مجانية شهرين",
              "لا حاجة لبطاقة ائتمان",
              "رسائل نصية مجانية باسم mutaba",
              "دعم فني متكامل",
              "تدريب مجاني",
              "إلغاء في أي وقت",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle size={20} className="text-primary" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">
                  املأ البيانات للبدء
                </h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-free-trial">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="أدخل اسمك الكامل"
                              data-testid="input-fullname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@company.com"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الجوال *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="05XXXXXXXX"
                              dir="ltr"
                              data-testid="input-phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم الشركة / المصنع *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="اسم شركتك"
                              data-testid="input-company"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>القطاع الصناعي *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-industry">
                                <SelectValue placeholder="اختر قطاعك" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="marble">
                                مصانع الرخام والجرانيت
                              </SelectItem>
                              <SelectItem value="construction">
                                شركات المقاولات الإنشائية
                              </SelectItem>
                              <SelectItem value="finishing">
                                شركات التشطيب والترميم
                              </SelectItem>
                              <SelectItem value="design">
                                شركات التصميم والديكور
                              </SelectItem>
                              <SelectItem value="kitchen">مصانع المطابخ</SelectItem>
                              <SelectItem value="aluminum">
                                شركات الألمنيوم
                              </SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg"
                      variant="default"
                      disabled={mutation.isPending}
                      data-testid="button-submit-trial"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Zap size={20} className="ml-2" />
                      )}
                      {mutation.isPending ? "جاري التسجيل..." : "ابدأ تجربتك المجانية الآن"}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground pb-16 lg:pb-0">
                      بالتسجيل، أنت توافق على{" "}
                      <a href="/privacy-policy" className="text-primary underline">
                        سياسة الخصوصية
                      </a>
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">ماذا ستحصل في التجربة المجانية؟</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "وصول كامل لجميع المميزات",
                    description:
                      "استخدم جميع مميزات النظام بدون أي قيود خلال فترة التجربة",
                  },
                  {
                    title: "رسائل نصية مجانية",
                    description:
                      "خلال فترة التجربة المجانية تكون الرسائل النصية مجانية باسم mutaba",
                  },
                  {
                    title: "دعم فني متكامل",
                    description:
                      "فريق الدعم الفني متاح لمساعدتك في كل خطوة",
                  },
                  {
                    title: "تدريب مجاني",
                    description:
                      "جلسات تدريبية مجانية لك ولفريقك على استخدام النظام",
                  },
                  {
                    title: "إلغاء في أي وقت",
                    description:
                      "لا توجد التزامات - يمكنك الإلغاء في أي وقت بدون أي رسوم",
                  },
                  {
                    title: "بياناتك آمنة",
                    description:
                      "نستخدم أعلى معايير الأمان لحماية بياناتك",
                  },
                ].map((benefit, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <CheckCircle
                          size={24}
                          className="text-primary flex-shrink-0 mt-1"
                        />
                        <div>
                          <h3 className="font-bold mb-1">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white dark:bg-card rounded-lg p-8 shadow-lg">
            <p className="text-lg italic mb-4 text-muted-foreground">
              "التجربة المجانية أعطتنا الوقت الكافي لتقييم النظام بشكل دقيق. الفريق احترافي والنظام 
              ساعدنا في تنظيم جميع عمليات التكييف من البداية للنهاية."
            </p>
            <div className="font-bold">
              أحمد الحافظ
              <br />
              <span className="text-sm text-muted-foreground font-normal">
                مدير عام، شركة هاواي للتكييف
              </span>
            </div>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
};

export default FreeTrial;
