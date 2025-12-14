import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageScaffold } from "@/components/PageScaffold";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { Mail, Phone, MapPin, Send, Zap, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const contactFormSchema = insertContactSchema.extend({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الإرسال بنجاح",
        description: "شكراً لتواصلك معنا، سنرد عليك في أقرب وقت",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "حدث خطأ",
        description: "فشل في إرسال الرسالة، حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <PageScaffold>
      <section className="pt-32 pb-16 px-4 gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10 stagger-children">
          <AnimateOnScroll>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-contact-hero">تواصل معنا</h1>
          </AnimateOnScroll>
          <AnimateOnScroll>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95 leading-relaxed" data-testid="text-contact-description">
              نحن هنا لمساعدتك - تواصل معنا وسنرد عليك في أقرب وقت ممكن
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/10 to-background">
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            title="نحن هنا لمساعدتك"
            description="تواصل معنا عبر النموذج أو قنوات التواصل المباشرة"
          />
          
          <div className="grid lg:grid-cols-2 gap-12 stagger-children">
            <AnimateOnScroll>
            <Card data-testid="card-contact-form">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">أرسل رسالة</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="أدخل اسمك الكامل"
                              data-testid="input-name"
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
                          <FormLabel>رقم الجوال</FormLabel>
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
                          <FormLabel>اسم الشركة</FormLabel>
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
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرسالة *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="اكتب رسالتك هنا..."
                              className="min-h-[150px]"
                              data-testid="textarea-message"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full text-lg" 
                      disabled={mutation.isPending}
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      ) : (
                        <Send size={20} className="ml-2" />
                      )}
                      {mutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            </AnimateOnScroll>

            <AnimateOnScroll>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
                <div className="space-y-6">
                  <Card data-testid="card-contact-phone">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Phone size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">الهاتف</h3>
                          <p className="text-muted-foreground" dir="ltr">
                            +966 50 705 1401
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            من السبت إلى الخميس، 9 ص - 6 م
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-contact-email">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Mail size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">البريد الإلكتروني</h3>
                          <p className="text-muted-foreground">
                            info@mutflex.com
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            نرد خلال 24 ساعة
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-contact-address">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">العنوان</h3>
                          <p className="text-muted-foreground">
                            المملكة العربية السعودية
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5" data-testid="card-quick-start">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-lg mb-4">
                    هل تريد البدء مباشرة؟
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    ابدأ تجربتك المجانية الآن بدون الحاجة للتواصل
                  </p>
                  <Button variant="default" size="lg" className="w-full" data-testid="button-free-trial">
                    <Zap size={20} className="ml-2" />
                    ابدأ تجربتك المجانية
                  </Button>
                </CardContent>
              </Card>
            </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
};

export default Contact;
