import { PageScaffold } from "@/components/PageScaffold";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <PageScaffold>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-muted/50">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-muted-foreground">
            آخر تحديث: يناير 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="pt-6 prose prose-lg max-w-none">
              <div className="space-y-8 text-muted-foreground leading-relaxed">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    مقدمة
                  </h2>
                  <p>
                    نحن في موتفلكس نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه
                    السياسة توضح كيفية جمعنا، استخدامنا، وحمايتنا لمعلوماتك.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    المعلومات التي نجمعها
                  </h2>
                  <p>نقوم بجمع المعلومات التالية:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>معلومات الاتصال (الاسم، البريد الإلكتروني، رقم الهاتف)</li>
                    <li>معلومات الشركة (اسم الشركة، القطاع، عدد الموظفين)</li>
                    <li>معلومات الاستخدام (كيفية استخدامك للنظام)</li>
                    <li>البيانات التي تدخلها في النظام (العملاء، المشاريع، إلخ)</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    كيف نستخدم معلوماتك
                  </h2>
                  <p>نستخدم معلوماتك من أجل:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>تقديم وتحسين خدماتنا</li>
                    <li>التواصل معك بخصوص حسابك</li>
                    <li>تقديم الدعم الفني</li>
                    <li>تحليل استخدام النظام لتحسين الأداء</li>
                    <li>إرسال تحديثات وعروض (يمكنك إلغاء الاشتراك في أي وقت)</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    حماية المعلومات
                  </h2>
                  <p>
                    نستخدم معايير أمان عالية لحماية بياناتك، بما في ذلك:
                  </p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>تشفير SSL/TLS لجميع البيانات المنقولة</li>
                    <li>تشفير البيانات المخزنة</li>
                    <li>نسخ احتياطي منتظم</li>
                    <li>وصول محدود للبيانات</li>
                    <li>مراقبة أمنية على مدار الساعة</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    مشاركة المعلومات
                  </h2>
                  <p>
                    نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك
                    معلوماتك فقط في الحالات التالية:
                  </p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>مع موافقتك الصريحة</li>
                    <li>مع مزودي الخدمات الذين يساعدوننا في تشغيل النظام</li>
                    <li>عند الطلب القانوني من الجهات المختصة</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    حقوقك
                  </h2>
                  <p>لديك الحق في:</p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>الوصول إلى بياناتك الشخصية</li>
                    <li>تصحيح أو تحديث معلوماتك</li>
                    <li>حذف بياناتك</li>
                    <li>تصدير بياناتك</li>
                    <li>الاعتراض على معالجة بياناتك</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    ملفات تعريف الارتباط (Cookies)
                  </h2>
                  <p>
                    نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم في
                    استخدام ملفات تعريف الارتباط من خلال إعدادات المتصفح.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    الأطفال
                  </h2>
                  <p>
                    خدماتنا غير موجهة للأطفال دون سن 18 عاماً. نحن لا نجمع
                    معلومات من الأطفال عن قصد.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    تحديثات السياسة
                  </h2>
                  <p>
                    قد نقوم بتحديث هذه السياسة من وقت لآخر. سنخطرك بأي تغييرات
                    جوهرية عبر البريد الإلكتروني أو من خلال النظام.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    تواصل معنا
                  </h2>
                  <p>
                    إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا
                    عبر:
                  </p>
                  <ul className="list-disc pr-6 space-y-2 mt-4">
                    <li>البريد الإلكتروني: privacy@mutflex.com</li>
                    <li dir="ltr">الهاتف: +966 XX XXX XXXX</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageScaffold>
  );
};

export default PrivacyPolicy;
