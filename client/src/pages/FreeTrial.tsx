import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageScaffold } from "@/components/PageScaffold";
import { CheckCircle, Zap } from "lucide-react";

const FreeTrial = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <PageScaffold>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 gradient-hero text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap size={40} />
            <h1 className="text-4xl md:text-5xl font-bold">
              ابدأ تجربتك المجانية لمدة شهرين
            </h1>
          </div>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-95">
            شهرين مجاناً - بدون بطاقة ائتمان - ابدأ في دقائق
          </p>
        </div>
      </section>

      {/* Benefits Bar */}
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

      {/* Form Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-6">
                  املأ البيانات للبدء
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-free-trial">
                  <div>
                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      required
                      className="mt-2"
                      data-testid="input-fullname"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@company.com"
                      required
                      className="mt-2"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الجوال *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      required
                      className="mt-2"
                      dir="ltr"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">اسم الشركة / المصنع *</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="اسم شركتك"
                      required
                      className="mt-2"
                      data-testid="input-company"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">القطاع الصناعي *</Label>
                    <Select required>
                      <SelectTrigger className="mt-2" data-testid="select-industry">
                        <SelectValue placeholder="اختر قطاعك" />
                      </SelectTrigger>
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
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg"
                    variant="default"
                    data-testid="button-submit-trial"
                  >
                    ابدأ تجربتك المجانية الآن
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    بالتسجيل، أنت توافق على{" "}
                    <a href="/privacy-policy" className="text-primary underline">
                      سياسة الخصوصية
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefits */}
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

      {/* Testimonial */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <p className="text-lg italic mb-4 text-muted-foreground">
              "بدأت التجربة المجانية وفي أول أسبوع لاحظت فرق كبير في تنظيم
              العمل. الآن كل شيء واضح ومرتب."
            </p>
            <div className="font-bold">
              أحمد المالكي
              <br />
              <span className="text-sm text-muted-foreground font-normal">
                مدير عمليات - مصنع رخام
              </span>
            </div>
          </div>
        </div>
      </section>
    </PageScaffold>
  );
};

export default FreeTrial;
