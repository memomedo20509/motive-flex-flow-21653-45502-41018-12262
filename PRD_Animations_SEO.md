# PRD: نظام الأنيميشن والسيو - Mutflex

## نظرة عامة

هذا المستند يوثق نظام الحركات والتأثيرات البصرية ومكونات تحسين محركات البحث (SEO) في منصة موتفلكس. تم تصميم النظام ليكون احترافياً وسلساً مع دعم كامل للأداء العالي والوصولية.

---

## 1. نظام الأنيميشن (Animation System)

### 1.1 الفلسفة والمبادئ

- **البساطة والأناقة**: حركات ناعمة وغير مشتتة للانتباه
- **الأداء**: استخدام `transform` و `opacity` فقط لضمان 60fps
- **الوصولية**: دعم كامل لـ `prefers-reduced-motion`
- **الاتساق**: نظام موحد للتوقيت والتأخير عبر كل المكونات

### 1.2 معايير التوقيت (Timing Standards)

| العنصر | القيمة | الاستخدام |
|--------|--------|----------|
| المدة الأساسية | `520ms` | جميع حركات الظهور |
| تأخير التتابع | `120ms` | بين العناصر المتتابعة |
| Easing Function | `cubic-bezier(0.22, 1, 0.36, 1)` | حركة سلسة مع تباطؤ في النهاية |
| الإزاحة الرأسية | `16px` | مسافة الحركة للأعلى |

### 1.3 أنواع الأنيميشن المتاحة

#### 1.3.1 Float Animation (حركة الطفو)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```
**الاستخدام**: عناصر تفاعلية، أيقونات، عناصر Hero

#### 1.3.2 Shimmer Animation (تأثير اللمعان)
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```
**الاستخدام**: حالات التحميل، Skeleton screens

#### 1.3.3 Counter Animation (حركة العداد)
```css
@keyframes counter {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.animate-counter {
  animation: counter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```
**الاستخدام**: الأرقام والإحصائيات، عناصر تظهر بشكل ديناميكي

#### 1.3.4 Pulse Slow Animation (نبض بطيء)
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
```
**الاستخدام**: عناصر تحتاج لفت الانتباه بشكل لطيف

---

## 2. سكرول أنيميشن (Scroll Animations)

### 2.1 نظام Intersection Observer

#### المكونات الأساسية:

##### Hook: `useIntersection`
**المسار**: `client/src/hooks/use-intersection.tsx`

```typescript
interface UseIntersectionOptions {
  threshold?: number;      // نسبة ظهور العنصر (0-1)
  rootMargin?: string;     // هامش إضافي للتفعيل المبكر
  triggerOnce?: boolean;   // تشغيل مرة واحدة فقط
}

function useIntersection(options: UseIntersectionOptions): {
  elementRef: React.RefObject<HTMLElement>;
  isInView: boolean;
}
```

**القيم الافتراضية**:
- `threshold`: `0.1` (10% من العنصر مرئي)
- `rootMargin`: `'0px'`
- `triggerOnce`: `true`

##### Component: `AnimateOnScroll`
**المسار**: `client/src/components/AnimateOnScroll.tsx`

```tsx
interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;      // افتراضي: 0.35
  rootMargin?: string;
  triggerOnce?: boolean;   // افتراضي: false (يظهر ويختفي مع التمرير)
}
```

**القيم الافتراضية**:
- `threshold`: `0.35` (35% من العنصر مرئي)
- `triggerOnce`: `false` (العنصر يظهر ويختفي مع التمرير في الاتجاهين)

**طريقة الاستخدام**:
```tsx
// السلوك الافتراضي: يظهر ويختفي مع التمرير
<AnimateOnScroll>
  <Card>محتوى يظهر ويختفي مع التمرير</Card>
</AnimateOnScroll>

// تشغيل مرة واحدة فقط (يبقى مرئياً بعد الظهور)
<AnimateOnScroll triggerOnce={true}>
  <Section>قسم يظهر مرة واحدة ويبقى</Section>
</AnimateOnScroll>
```

### 2.2 CSS Classes للسكرول أنيميشن

#### الكلاس الأساسي
```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(16px);
}

.animate-on-scroll.in-view {
  opacity: 1;
  transform: translateY(0);
  transition: all 520ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### 2.3 نظام Stagger (التتابع)

للعناصر المتعددة داخل container واحد:

```css
.stagger-children > *:nth-child(1) { transition-delay: 0ms; }
.stagger-children > *:nth-child(2) { transition-delay: 120ms; }
.stagger-children > *:nth-child(3) { transition-delay: 240ms; }
.stagger-children > *:nth-child(4) { transition-delay: 360ms; }
.stagger-children > *:nth-child(5) { transition-delay: 480ms; }
.stagger-children > *:nth-child(6) { transition-delay: 600ms; }
.stagger-children > *:nth-child(7) { transition-delay: 720ms; }
.stagger-children > *:nth-child(8) { transition-delay: 840ms; }
.stagger-children > *:nth-child(9) { transition-delay: 960ms; }
```

**طريقة الاستخدام**:
```tsx
<div className="stagger-children">
  <AnimateOnScroll><Card>1</Card></AnimateOnScroll>
  <AnimateOnScroll><Card>2</Card></AnimateOnScroll>
  <AnimateOnScroll><Card>3</Card></AnimateOnScroll>
</div>
```

### 2.4 Parallax Effect (CSS فقط)

```css
.parallax-slow {
  will-change: transform;
}
```

**ملاحظة**: هذا الكلاس يُهيئ العنصر لتحويلات مستقبلية عبر `will-change`. حالياً لا يوجد JavaScript behavior مُطبَّق لهذا الكلاس. يمكن استخدامه كأساس لإضافة parallax effect لاحقاً.

---

## 3. انتقالات الصفحات (Page Transitions)

### 3.1 Hook: `usePageTransition`
**المسار**: `client/src/hooks/use-page-transition.tsx`

**الوظائف**:
1. التمرير لأعلى الصفحة عند تغيير المسار
2. احترام تفضيل المستخدم لتقليل الحركة
3. تأخير التمرير حتى بدء الانتقال

```typescript
export function usePageTransition() {
  const [location] = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }, [location]);

  return location;
}
```

### 3.2 السلوك الحالي

الـ hook الحالي يقوم بـ:
- **التمرير لأعلى الصفحة** عند تغيير المسار (route change)
- **احترام تفضيل تقليل الحركة** باستخدام `behavior: 'auto'` بدلاً من `'smooth'`

**ملاحظة**: لا يوجد حالياً تأثيرات fade أو slide بين الصفحات. الانتقال يتم فوراً مع smooth scroll للأعلى.

### 3.3 التطبيق الحالي

```tsx
// يُستخدم في أي component يحتاج معرفة المسار مع تفعيل scroll-to-top
function MyPage() {
  const location = usePageTransition();
  // ...
}
```

### 3.4 تحسينات مستقبلية مقترحة

| النمط | الاستخدام | الوصف |
|-------|----------|-------|
| Fade | انتقال عام | تلاشي تدريجي |
| Slide Up | محتوى جديد | انزلاق من الأسفل |
| View Transitions API | modern browsers | انتقالات سلسة بين الصفحات |

---

## 4. دعم تقليل الحركة (Reduced Motion)

### 4.1 CSS Media Query

```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll,
  .animate-float,
  .animate-shimmer,
  .animate-counter,
  .animate-pulse-slow,
  .parallax-slow {
    animation: none !important;
    transition: none !important;
  }
  
  .animate-on-scroll {
    opacity: 1;
    transform: none;
  }
}
```

### 4.2 JavaScript Detection

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // استخدام behavior: 'auto' بدلاً من 'smooth'
}
```

---

## 5. عناصر السيو (SEO Elements)

### 5.1 مكون SEOHead

**المسار**: `client/src/components/SEOHead.tsx`

**الخصائص المتاحة**:

```typescript
interface SEOHeadProps {
  title: string;                    // عنوان الصفحة
  description: string;              // وصف الصفحة
  keywords?: string;                // كلمات مفتاحية
  canonicalUrl?: string;            // الرابط الأساسي
  ogImage?: string;                 // صورة Open Graph
  ogType?: "website" | "article";   // نوع المحتوى
  article?: {
    publishedTime?: string;         // تاريخ النشر
    modifiedTime?: string;          // تاريخ التعديل
    author?: string;                // الكاتب
    section?: string;               // القسم
    tags?: string[];                // الوسوم
  };
  noindex?: boolean;                // منع الفهرسة
  nofollow?: boolean;               // منع تتبع الروابط
}
```

**طريقة الاستخدام**:
```tsx
<SEOHead
  title="الصفحة الرئيسية"
  description="منصة موتفلكس لإدارة عمليات التصنيع والتركيب"
  keywords="تصنيع، تركيب، إدارة، رخام، جرانيت"
  ogImage="/og-image.webp"
/>

// للمقالات
<SEOHead
  title={article.title}
  description={article.excerpt}
  ogType="article"
  article={{
    publishedTime: article.createdAt,
    author: article.author,
    tags: article.tags
  }}
/>
```

### 5.2 Meta Tags المُولَّدة

#### Basic Meta Tags
```html
<title>{title} | موتفلكس - Mutflex</title>
<meta name="description" content="{description}" />
<meta name="keywords" content="{keywords}" />
<meta name="robots" content="index, follow" />
```

#### Open Graph Tags
```html
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:type" content="website|article" />
<meta property="og:image" content="{ogImage}" />
<meta property="og:site_name" content="موتفلكس - Mutflex" />
<meta property="og:locale" content="ar_SA" />
```

#### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{ogImage}" />
```

#### Article Meta (للمقالات فقط)
```html
<meta property="article:published_time" content="{publishedTime}" />
<meta property="article:modified_time" content="{modifiedTime}" />
<meta property="article:author" content="{author}" />
<meta property="article:section" content="{section}" />
<meta property="article:tag" content="{tag}" />
```

### 5.3 Sitemap الديناميكي

**المسار**: `GET /sitemap.xml`

**الهيكل**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- الصفحات الثابتة -->
  <url>
    <loc>https://mutflex.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- المقالات -->
  <url>
    <loc>https://mutflex.com/blog/{slug}</loc>
    <lastmod>{updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**الصفحات المشمولة**:
| الصفحة | Priority | Change Frequency |
|--------|----------|------------------|
| الرئيسية `/` | 1.0 | weekly |
| المميزات `/features` | 0.8 | monthly |
| القطاعات `/industries` | 0.8 | monthly |
| الأسعار `/pricing` | 0.8 | monthly |
| المقالات `/blog` | 0.9 | daily |
| من نحن `/about` | 0.6 | monthly |
| تواصل معنا `/contact` | 0.6 | monthly |
| التجربة المجانية `/free-trial` | 0.9 | weekly |
| سياسة الخصوصية `/privacy-policy` | 0.3 | yearly |
| المقالات الفردية `/blog/{slug}` | 0.7 | weekly |

### 5.4 Robots.txt

**المسار**: `client/public/robots.txt` (ملف ثابت)

**المحتوى الحالي**:
```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
```

**تحسين مقترح** (لإضافته لاحقاً):
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login

Sitemap: https://mutflex.com/sitemap.xml
```

### 5.5 SEO للمقالات

#### الحقول المحفوظة في قاعدة البيانات:
```typescript
// من shared/schema.ts - articles table
{
  metaTitle: string;           // عنوان مخصص للـ SEO
  metaDescription: string;     // وصف مخصص للـ SEO
  metaKeywords: string;        // كلمات مفتاحية
  canonicalUrl: string;        // الرابط الأساسي
  ogTitle: string;             // عنوان Open Graph
  ogDescription: string;       // وصف Open Graph
  ogImage: string;             // صورة Open Graph
  robotsDirective: string;     // توجيهات robots (افتراضي: "index, follow")
}
```

#### الحقول المحسوبة (عند تحليل HTML المستورد):
```typescript
// يتم حسابها ديناميكياً ولا تُحفظ في قاعدة البيانات
{
  readingTime: string;         // وقت القراءة المقدر (محسوب من عدد الكلمات)
  focusKeyword: string;        // الكلمة المفتاحية الرئيسية (مستخرجة من المحتوى)
}
```

#### استيراد HTML وتحليل SEO:
- استخراج `<title>` تلقائياً
- استخراج meta description
- استخراج meta keywords
- استخراج Open Graph tags
- استخراج canonical URL
- حساب وقت القراءة
- اقتراح كلمات مفتاحية من المحتوى

---

## 6. تأثيرات إضافية (Additional Effects)

### 6.1 Glass Effect (تأثير الزجاج)

```css
.glass-effect {
  @apply bg-white/10 backdrop-blur-xl border border-white/20;
}

.dark .glass-effect {
  @apply bg-black/10 backdrop-blur-xl border border-white/10;
}

.glass-card {
  @apply bg-white/90 dark:bg-card/90 backdrop-blur-xl 
         border border-white/20 dark:border-border/20 shadow-2xl;
}
```

### 6.2 Text Gradient

```css
.text-gradient {
  @apply bg-clip-text text-transparent 
         bg-gradient-to-r from-primary via-secondary to-primary;
}
```

### 6.3 Icon Accent

```css
.icon-accent {
  @apply transition-all duration-300;
  @apply text-primary;
}
```

---

## 7. أفضل الممارسات

### 7.1 للأداء
- استخدام `transform` و `opacity` فقط للأنيميشن
- تجنب `will-change` إلا عند الضرورة
- استخدام `triggerOnce: true` للعناصر التي لا تحتاج إعادة التشغيل

### 7.2 للوصولية
- دائماً دعم `prefers-reduced-motion`
- تجنب الأنيميشن السريع جداً أو الوامض
- توفير بدائل ثابتة للمحتوى المتحرك

### 7.3 للسيو
- استخدام `SEOHead` في كل صفحة
- تعبئة جميع الحقول المتاحة
- استخدام صور Open Graph بجودة عالية (1200x630px)
- تحديث الـ sitemap تلقائياً عند نشر محتوى جديد

---

## 8. الملفات المرتبطة

| الملف | الوصف |
|-------|-------|
| `client/src/index.css` | تعريفات CSS للأنيميشن |
| `client/src/hooks/use-intersection.tsx` | Hook للـ Intersection Observer |
| `client/src/hooks/use-page-transition.tsx` | Hook لانتقالات الصفحات |
| `client/src/components/AnimateOnScroll.tsx` | مكون الظهور عند التمرير |
| `client/src/components/SEOHead.tsx` | مكون إدارة meta tags |
| `client/public/robots.txt` | ملف robots.txt ثابت |
| `server/routes.ts` | endpoint للـ sitemap.xml الديناميكي |

---

## 9. التحديثات المستقبلية المقترحة

1. **View Transitions API**: استخدام الـ API الجديد للانتقالات السلسة بين الصفحات
2. **Scroll-driven Animations**: استخدام CSS scroll-timeline للأنيميشن المرتبط بالتمرير
3. **Structured Data**: إضافة JSON-LD للمقالات والمنتجات
4. **Lazy Loading للأنيميشن**: تحميل أكواد الأنيميشن عند الحاجة فقط
5. **Performance Monitoring**: تتبع تأثير الأنيميشن على الأداء
