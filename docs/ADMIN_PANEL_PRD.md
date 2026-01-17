# 📋 PRD الشاملة - لوحة إدارة موتفلكس (Admin Panel)
## وثيقة متطلبات المنتج التفصيلية

---

## 📑 الفهرس

1. [نظرة عامة](#1-نظرة-عامة)
2. [الهندسة المعمارية](#2-الهندسة-المعمارية)
3. [نظام المصادقة](#3-نظام-المصادقة)
4. [لوحة التحكم الرئيسية](#4-لوحة-التحكم-الرئيسية)
5. [إدارة المقالات](#5-إدارة-المقالات)
6. [رسائل التواصل](#6-رسائل-التواصل)
7. [طلبات التجربة المجانية](#7-طلبات-التجربة-المجانية)
8. [إدارة المستخدمين](#8-إدارة-المستخدمين)
9. [الإعدادات](#9-الإعدادات)
10. [نظام SEO](#10-نظام-seo)
11. [Server-Side Rendering](#11-server-side-rendering)
12. [External API](#12-external-api)
13. [قاعدة البيانات](#13-قاعدة-البيانات)
14. [API Endpoints](#14-api-endpoints)

---

## 1. نظرة عامة

### 1.1 الهدف
لوحة إدارة شاملة باللغة العربية (RTL) لإدارة منصة موتفلكس SaaS، تتضمن:
- إدارة محتوى المدونة مع SEO متقدم
- إدارة العملاء المحتملين (Leads)
- إدارة المستخدمين والصلاحيات
- إعدادات النظام وSEO

### 1.2 المستخدمون المستهدفون
- **الأدمن الرئيسي**: وصول كامل لجميع الأقسام
- **مدير المحتوى**: إدارة المقالات فقط
- **الزوار**: لا يمكنهم الوصول للوحة التحكم

### 1.3 التقنيات المستخدمة

| الطبقة | التقنية | الإصدار |
|--------|---------|---------|
| Frontend Framework | React | 18.x |
| Language | TypeScript | 5.x |
| Bundler | Vite | 5.x |
| Routing | Wouter | 3.x |
| State Management | TanStack Query | 5.x |
| UI Components | Radix UI + Shadcn | - |
| Styling | TailwindCSS | 3.x |
| Forms | React Hook Form + Zod | - |
| Rich Text Editor | TipTap | 2.x |
| Backend Framework | Express.js | 4.x |
| ORM | Drizzle ORM | - |
| Database | PostgreSQL (Neon) | - |
| File Upload | Multer + Cloudinary | - |
| Email | Resend | - |
| AI | Google Gemini AI | 2.5 |
| SSR | React DOM Server | - |

---

## 2. الهندسة المعمارية

### 2.1 بنية الملفات
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn Components
│   │   ├── SEOHead.tsx      # SEO Meta Tags
│   │   ├── RichTextEditor.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ArticleList.tsx
│   │   │   ├── ArticleForm.tsx
│   │   │   ├── ContactsList.tsx
│   │   │   ├── TrialsList.tsx
│   │   │   ├── UsersList.tsx
│   │   │   └── Settings.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   └── ...
│   ├── entry-server.tsx     # SSR Entry
│   └── entry-client.tsx     # Client Entry
server/
├── routes.ts                # API Routes
├── storage.ts               # Database Layer
├── auth.ts                  # Authentication
├── email.ts                 # Email Service
├── cloudinary.ts            # Image Upload
└── vite.ts                  # SSR Configuration
shared/
└── schema.ts                # Database Schema
```

### 2.2 Data Flow
```
[User Request] → [Express Server] → [SSR/API] → [PostgreSQL]
                       ↓
              [React Query Cache]
                       ↓
              [React Components]
```

---

## 3. نظام المصادقة

### 3.1 نموذج المستخدم (User Schema)
```typescript
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: varchar("is_admin").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 3.2 التحقق من الهوية

#### 3.2.1 تسجيل الدخول
| الحقل | النوع | الحد | الوصف |
|-------|-------|------|-------|
| email | string | 255 chars | البريد الإلكتروني (مطلوب) |
| password | string | min 6 chars | كلمة المرور (مطلوب) |

#### 3.2.2 الـ API Endpoints
```
POST /api/auth/login    # تسجيل الدخول
POST /api/auth/logout   # تسجيل الخروج
GET  /api/auth/user     # جلب بيانات المستخدم الحالي
```

### 3.3 مستويات الصلاحيات

| المستوى | الوصف | الوصول |
|---------|-------|--------|
| **Guest** | زائر غير مسجل | الصفحات العامة فقط |
| **User** | مستخدم عادي (`isAdmin: "false"`) | لا يمكنه دخول لوحة التحكم |
| **Admin** | مدير (`isAdmin: "true"`) | وصول كامل لجميع الأقسام |

### 3.4 حماية الـ Routes

#### Middleware Functions
```typescript
// التحقق من تسجيل الدخول
isAuthenticated(req, res, next)

// التحقق من صلاحيات الأدمن
isAdmin(req, res, next)
```

#### Protected Routes
```
/admin/*           → isAuthenticated + isAdmin
/api/admin/*       → isAuthenticated + isAdmin
/api/auth/user     → isAuthenticated
```

### 3.5 تشفير كلمات المرور
- **Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Storage**: `passwordHash` field in users table

---

## 4. لوحة التحكم الرئيسية (Dashboard)

### 4.1 المسار
```
/admin
```

### 4.2 الإحصائيات المعروضة

| الإحصائية | الأيقونة | اللون | المصدر |
|-----------|----------|-------|--------|
| إجمالي المقالات | FileText | أزرق (`blue-500`) | `storage.getArticles()` |
| المقالات المنشورة | TrendingUp | أخضر (`green-500`) | `storage.getArticles({ status: "published" })` |
| إجمالي المشاهدات | Eye | بنفسجي (`purple-500`) | `SUM(article.viewCount)` |
| التصنيفات | Tag | برتقالي (`orange-500`) | `storage.getAllTags()` |

### 4.3 أحدث المقالات
- **العدد**: آخر 5 مقالات
- **البيانات المعروضة**:
  - العنوان (مع truncate)
  - تاريخ الإنشاء
  - عدد المشاهدات
  - الحالة (منشور/مسودة) مع Badge ملون

### 4.4 Data Fetching
```typescript
const { data: publishedData } = useQuery({
  queryKey: ["/api/admin/articles", { status: "published", limit: 100 }],
});

const { data: draftData } = useQuery({
  queryKey: ["/api/admin/articles", { status: "draft", limit: 100 }],
});
```

---

## 5. إدارة المقالات

### 5.1 نموذج المقال (Article Schema)
```typescript
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: varchar("cover_image", { length: 500 }),
  coverImageAlt: varchar("cover_image_alt", { length: 255 }),
  tags: text("tags").array().default([]),
  author: varchar("author", { length: 100 }).default("فريق موتفلكس"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  
  // SEO Fields
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  focusKeyword: varchar("focus_keyword", { length: 100 }),
  canonicalUrl: varchar("canonical_url", { length: 500 }),
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  ogImage: varchar("og_image", { length: 500 }),
  robotsDirective: varchar("robots_directive", { length: 50 }).default("index, follow"),
  schemaMarkup: text("schema_markup"),
  readingTime: varchar("reading_time", { length: 20 }),
  
  // Tracking
  viewCount: serial("view_count"),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 5.2 حالات المقال

| الحالة | الوصف | الظهور للعامة |
|--------|-------|---------------|
| `draft` | مسودة | ❌ لا |
| `published` | منشور | ✅ نعم |
| `scheduled` | مجدول | ❌ حتى وقت النشر |
| `unpublished` | تم إلغاء نشره | ❌ لا |

### 5.3 قائمة المقالات (`/admin/articles`)

#### 5.3.1 البحث والتصفية
| الميزة | النوع | الوصف |
|--------|-------|-------|
| البحث | Text Input | بحث في العناوين |
| الترقيم | Pagination | 10 مقالات/صفحة |

#### 5.3.2 أعمدة الجدول
| العمود | المحتوى |
|--------|---------|
| العنوان | `article.title` (truncated) |
| الحالة | Badge (منشور/مسودة) |
| التصنيفات | أول 2 tags + عداد الباقي |
| المشاهدات | `article.viewCount` مع أيقونة |
| التاريخ | `article.createdAt` بالعربية |
| الإجراءات | عرض / تعديل / حذف |

#### 5.3.3 الإجراءات
| الإجراء | الأيقونة | الوصف |
|---------|----------|-------|
| عرض | ExternalLink | فتح المقال في تبويب جديد |
| تعديل | Edit | الانتقال لصفحة التعديل |
| حذف | Trash2 | فتح نافذة تأكيد الحذف |

### 5.4 إنشاء/تعديل مقال (`/admin/articles/new` أو `/admin/articles/:id/edit`)

#### 5.4.1 المحتوى الأساسي

| الحقل | النوع | مطلوب | الحد | الوصف |
|-------|-------|-------|------|-------|
| العنوان | Text | ✅ | 255 حرف | عنوان المقال |
| الرابط (Slug) | Text | ❌ | 255 حرف | يُنشأ تلقائياً من العنوان |
| الملخص | Textarea | ❌ | - | ملخص قصير للمقال |
| المحتوى | Rich Text Editor | ✅ للنشر | - | محرر نصي متقدم |

#### 5.4.2 خوارزمية توليد الـ Slug
```typescript
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\u0621-\u064Aa-z0-9\s-]/g, "")  // إزالة الرموز
    .replace(/\s+/g, "-")                        // استبدال المسافات
    .replace(/-+/g, "-")                         // إزالة الشرطات المتكررة
    .trim();
}
```

#### 5.4.3 صورة الغلاف
| الحقل | النوع | الحد | الوصف |
|-------|-------|------|-------|
| صورة الغلاف | File Upload | 10MB | أنواع: JPG, PNG, WebP |
| النص البديل | Text | 255 حرف | وصف الصورة للـ SEO |

**عملية الرفع:**
1. التحقق من نوع الملف
2. التحقق من الحجم (≤ 10MB)
3. رفع إلى Cloudinary
4. حفظ الـ URL في قاعدة البيانات

#### 5.4.4 التصنيفات (Tags)
- إدخال نصي مع زر إضافة
- عرض كـ Badges قابلة للإزالة
- تُحفظ كـ `text[].array()` في PostgreSQL

#### 5.4.5 حقول SEO الأساسية

| الحقل | الحد الموصى | الوصف |
|-------|-------------|-------|
| الكلمة المفتاحية الرئيسية | 100 حرف | Focus Keyword للمقال |
| عنوان الصفحة (Meta Title) | 50-60 حرف | يظهر في نتائج Google |
| وصف الصفحة (Meta Description) | 120-160 حرف | يظهر تحت العنوان في Google |
| الكلمات المفتاحية | - | مفصولة بفواصل |
| الرابط القانوني | 500 حرف | Canonical URL |
| توجيهات الروبوتات | - | index/noindex, follow/nofollow |
| وقت القراءة | - | يُحسب تلقائياً |

**حساب وقت القراءة:**
```typescript
const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} دقيقة`;
};
```

#### 5.4.6 حقول Open Graph

| الحقل | الوصف | الاستخدام |
|-------|-------|----------|
| OG Title | عنوان المشاركة | Facebook, LinkedIn |
| OG Description | وصف المشاركة | Facebook, LinkedIn |
| OG Image | صورة المشاركة | عند مشاركة الرابط |

#### 5.4.7 توجيهات الروبوتات

| القيمة | الوصف |
|--------|-------|
| `index, follow` | السماح بالفهرسة وتتبع الروابط (افتراضي) |
| `noindex, follow` | منع الفهرسة مع تتبع الروابط |
| `index, nofollow` | السماح بالفهرسة بدون تتبع الروابط |
| `noindex, nofollow` | منع الفهرسة والتتبع |

### 5.5 محرر النصوص الغني (Rich Text Editor)

#### 5.5.1 الإضافات المستخدمة (TipTap Extensions)
```typescript
extensions: [
  StarterKit,           // أساسيات التحرير
  Image,                // دعم الصور
  Link,                 // الروابط
  TextAlign,            // محاذاة النص
  Underline,            // تحته خط
  Placeholder,          // نص افتراضي
  Table,                // الجداول
  TableRow,
  TableCell,
  TableHeader,
]
```

#### 5.5.2 شريط الأدوات

| المجموعة | الأدوات |
|----------|---------|
| التراجع | Undo, Redo |
| العناوين | H1, H2, H3 |
| التنسيق | Bold, Italic, Underline, Strikethrough, Code |
| المحاذاة | يمين, وسط, يسار |
| القوائم | نقطية, مرقمة, اقتباس |
| الإدراج | رابط, صورة, خصائص الصورة |

#### 5.5.3 خصائص الصورة المتقدمة

| الخاصية | الخيارات | الوصف |
|---------|----------|-------|
| النص البديل | Text | مهم للـ SEO |
| التسمية التوضيحية | Text | يظهر تحت الصورة |
| الحجم | 25%, 50%, 75%, 100% | عرض الصورة |
| المحاذاة | يمين, وسط, يسار | موقع الصورة |

#### 5.5.4 إدراج الصور
- **رفع من الجهاز**: اختيار ملف من الـ input
- **لصق من الحافظة**: Ctrl+V لصورة منسوخة
- **سحب وإفلات**: Drag & Drop
- **روابط خارجية**: لصق رابط صورة

### 5.6 استيراد HTML

#### 5.6.1 العملية
1. رفع ملف HTML (حد 2MB)
2. تحليل الملف بـ Cheerio (Server-side)
3. استخراج المحتوى وبيانات SEO
4. ملء النموذج تلقائياً

#### 5.6.2 البيانات المستخرجة
```typescript
{
  title: string,          // من <h1> أو <title>
  metaTitle: string,      // من <title>
  content: string,        // المحتوى المنظف
  excerpt: string,        // أول 200 حرف
  author: string,
  metaDescription: string,
  metaKeywords: string,
  ogTitle: string,
  ogDescription: string,
  ogImage: string,
  canonicalUrl: string,
  robotsDirective: string,
  readingTime: string,
  focusKeyword: string,   // الكلمة الأكثر تكراراً
}
```

#### 5.6.3 تنظيف HTML
```typescript
// إزالة العناصر الخطرة
$("script, style, noscript, object, embed, iframe").remove();

// إزالة العناصر غير المطلوبة
$("nav, .sidebar, .comments, .share-buttons, .ads, form").remove();

// استخراج المحتوى من أماكن محددة
const contentSelectors = [
  "article", "main", ".content", ".article-content",
  ".post-content", ".entry-content", "#content"
];
```

### 5.7 إنشاء SEO بالذكاء الاصطناعي

#### 5.7.1 المتطلبات
- المحتوى مطلوب (content)
- Gemini API Key مُعد

#### 5.7.2 الـ Prompt
```
أنت خبير SEO. قم بتحليل المقال التالي وإنشاء بيانات SEO محسّنة.

العنوان: {title}
الملخص: {excerpt}
المحتوى: {content} (أول 3000 حرف)

قم بإرجاع JSON:
{
  "metaDescription": "وصف ميتا محسّن (120-160 حرف)",
  "metaKeywords": "كلمة1, كلمة2, كلمة3, كلمة4, كلمة5",
  "focusKeyword": "الكلمة المفتاحية الرئيسية",
  "ogTitle": "عنوان مناسب للسوشيال ميديا",
  "ogDescription": "وصف جذاب للمشاركة (60-90 حرف)"
}
```

#### 5.7.3 النتيجة
- ملء الحقول تلقائياً
- يمكن للمستخدم تعديلها

### 5.8 جدولة النشر

#### 5.8.1 العملية
1. اختيار تاريخ ووقت النشر
2. حفظ المقال بحالة `scheduled`
3. Scheduler يعمل كل دقيقة
4. نشر تلقائي عند حلول الموعد

#### 5.8.2 الكود
```typescript
// يعمل كل دقيقة
setInterval(publishScheduledArticles, 60 * 1000);

const publishScheduledArticles = async () => {
  const scheduledArticles = await storage.getScheduledArticlesDue();
  for (const article of scheduledArticles) {
    await storage.updateArticle(article.id, {
      status: "published",
      publishedAt: article.scheduledAt || new Date(),
    });
  }
};
```

### 5.9 عرض المقال للعامة

#### 5.9.1 صفحة المقال (`/blog/:slug`)

**البيانات المعروضة:**
- الـ Breadcrumbs (التنقل)
- التصنيفات (Tags)
- العنوان الرئيسي
- الكاتب + التاريخ + المشاهدات
- صورة الغلاف
- المحتوى بالكامل
- جدول المحتويات (TOC)
- أزرار المشاركة
- مقالات ذات صلة (3 مقالات)

#### 5.9.2 جدول المحتويات (TOC)
```typescript
const tableOfContents = useMemo(() => {
  if (typeof window === "undefined") return []; // Skip SSR
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const headings = doc.querySelectorAll('h1, h2, h3');
  
  return headings.map(el => ({
    level: parseInt(el.tagName.charAt(1)),
    text: el.textContent,
    id: generateId(el.textContent)
  }));
}, [content]);
```

#### 5.9.3 أزرار المشاركة
- Twitter
- Facebook
- LinkedIn
- نسخ الرابط

#### 5.9.4 المقالات ذات الصلة
```typescript
const relatedArticles = await storage.getRelatedArticles(
  article.id,
  article.tags || [],
  3  // عدد المقالات
);
```

---

## 6. رسائل التواصل

### 6.1 نموذج رسالة التواصل
```typescript
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  message: text("message").notNull(),
  isRead: varchar("is_read", { length: 10 }).default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 6.2 صفحة إدارة الرسائل (`/admin/contacts`)

#### 6.2.1 العرض
| البيان | المحتوى |
|--------|---------|
| الاسم | `contact.name` |
| البريد الإلكتروني | `contact.email` |
| الهاتف | `contact.phone` (اختياري) |
| الشركة | `contact.company` (اختياري) |
| الرسالة | `contact.message` |
| التاريخ | منذ X (date-fns) |
| الحالة | Badge (جديدة/مقروءة) |

#### 6.2.2 الإجراءات
| الإجراء | API | الوصف |
|---------|-----|-------|
| تحديد كمقروءة | `PATCH /api/admin/contacts/:id/read` | تغيير `isRead` لـ `"true"` |
| حذف | `DELETE /api/admin/contacts/:id` | حذف الرسالة |

### 6.3 إشعارات البريد الإلكتروني
- عند استلام رسالة جديدة
- ترسل لـ `notification_email` من الإعدادات
- تستخدم Resend API

---

## 7. طلبات التجربة المجانية

### 7.1 نموذج طلب التجربة
```typescript
export const trialSubmissions = pgTable("trial_submissions", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  isRead: varchar("is_read", { length: 10 }).default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 7.2 الصناعات المدعومة

| القيمة | التسمية بالعربية |
|--------|------------------|
| `marble` | مصانع الرخام والجرانيت |
| `construction` | شركات المقاولات الإنشائية |
| `finishing` | شركات التشطيب والترميم |
| `design` | شركات التصميم والديكور |
| `kitchen` | مصانع المطابخ |
| `aluminum` | شركات الألمنيوم |
| `other` | أخرى |

### 7.3 صفحة إدارة الطلبات (`/admin/trials`)
- نفس تصميم صفحة رسائل التواصل
- عداد الطلبات الجديدة
- إجراءات: تحديد كمقروء / حذف

---

## 8. إدارة المستخدمين

### 8.1 صفحة المستخدمين (`/admin/users`)

#### 8.1.1 بيانات المستخدم

| الحقل | النوع | مطلوب | الوصف |
|-------|-------|-------|-------|
| البريد الإلكتروني | Email | ✅ | فريد لكل مستخدم |
| كلمة المرور | Password | ✅ للإنشاء | 6 أحرف minimum |
| الاسم الأول | Text | ❌ | - |
| الاسم الأخير | Text | ❌ | - |
| صلاحيات الأدمن | Switch | ❌ | `isAdmin: "true"/"false"` |

#### 8.1.2 الإجراءات

| الإجراء | API | الوصف |
|---------|-----|-------|
| إضافة | `POST /api/admin/users` | إنشاء مستخدم جديد |
| تعديل | `PATCH /api/admin/users/:id` | تحديث البيانات |
| حذف | `DELETE /api/admin/users/:id` | حذف المستخدم |

#### 8.1.3 القيود
- لا يمكن حذف الحساب الخاص
- كلمة المرور اختيارية عند التعديل
- التحقق من عدم تكرار البريد

---

## 9. الإعدادات

### 9.1 نموذج الإعدادات
```typescript
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 9.2 صفحة الإعدادات (`/admin/settings`)

#### 9.2.1 إعدادات الإشعارات

| الإعداد | Key | الوصف |
|---------|-----|-------|
| بريد الإشعارات | `notification_email` | يستقبل رسائل التواصل الجديدة |

#### 9.2.2 إعدادات الموقع الأساسية

| الإعداد | Key | الوصف |
|---------|-----|-------|
| اسم الموقع | `site_name` | يُضاف لعناوين الصفحات |
| رابط الموقع | `site_url` | للـ Sitemap والروابط القانونية |
| وصف الموقع | `default_meta_description` | للصفحات بدون وصف خاص |
| صورة المشاركة | `default_og_image` | تظهر عند مشاركة الروابط |

#### 9.2.3 التحليلات والتحقق

| الإعداد | Key | الوصف |
|---------|-----|-------|
| Google Analytics | `ga_id` | معرف GA4 (G-XXXXXXXXXX) |
| Google Tag Manager | `gtm_id` | معرف GTM (GTM-XXXXXXX) |
| Google Search Console | `google_verification` | كود التحقق |
| Bing Webmaster | `bing_verification` | كود التحقق |

#### 9.2.4 خريطة الموقع (Sitemap)

| الميزة | الوصف |
|--------|-------|
| زر التحديث | تحديث `sitemap_last_updated` |
| عرض آخر تحديث | `formatDistanceToNow(sitemap_last_updated)` |
| رابط مباشر | `/sitemap.xml` |

#### 9.2.5 ملف robots.txt

| الإعداد | Key | الوصف |
|---------|-----|-------|
| محتوى robots.txt | `robots_txt` | تخصيص محتوى الملف |

**القيمة الافتراضية:**
```
User-agent: *
Allow: /

# Disallow admin and API paths
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /login

# Sitemap
Sitemap: https://mutflex.com/sitemap.xml
```

---

## 10. نظام SEO

### 10.1 SEOHead Component
```typescript
interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noindex?: boolean;
  nofollow?: boolean;
}
```

### 10.2 الـ Meta Tags المُنتجة
```html
<!-- Basic -->
<title>{title} | موتفلكس - Mutflex</title>
<meta name="description" content="{description}" />
<meta name="keywords" content="{keywords}" />
<meta name="robots" content="{index/noindex}, {follow/nofollow}" />
<link rel="canonical" href="{canonicalUrl}" />

<!-- Open Graph -->
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:type" content="{website/article}" />
<meta property="og:image" content="{ogImage}" />
<meta property="og:site_name" content="موتفلكس - Mutflex" />
<meta property="og:locale" content="ar_SA" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{ogImage}" />

<!-- Article (if ogType === "article") -->
<meta property="article:published_time" content="{publishedTime}" />
<meta property="article:modified_time" content="{modifiedTime}" />
<meta property="article:author" content="{author}" />
<meta property="article:tag" content="{tag}" />
```

### 10.3 robots.txt Endpoint
```
GET /robots.txt
```
- يقرأ `robots_txt` من الإعدادات
- يستخدم القيمة الافتراضية إذا فارغ

### 10.4 sitemap.xml Endpoint
```
GET /sitemap.xml
```

**المحتوى:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static Pages -->
  <url>
    <loc>https://mutflex.com/</loc>
    <lastmod>2025-01-17</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... -->
  
  <!-- Blog Articles (Dynamic) -->
  <url>
    <loc>https://mutflex.com/blog/{slug}</loc>
    <lastmod>{updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**الصفحات الثابتة:**
| الصفحة | Priority | Changefreq |
|--------|----------|------------|
| `/` | 1.0 | daily |
| `/features` | 0.9 | weekly |
| `/industries` | 0.9 | weekly |
| `/pricing` | 0.9 | weekly |
| `/contact` | 0.8 | monthly |
| `/about` | 0.8 | monthly |
| `/free-trial` | 0.9 | weekly |
| `/privacy-policy` | 0.3 | yearly |
| `/blog` | 0.9 | daily |

---

## 11. Server-Side Rendering (SSR)

### 11.1 الهدف
- جعل المحتوى قابل للفهرسة من Google
- تحسين First Contentful Paint
- دعم المقالات الديناميكية بدون deploy

### 11.2 entry-server.tsx
```typescript
export function render(url: string, initialData?: Record<string, unknown>): SSRResult {
  // Decode URL for Arabic slugs
  const decodedUrl = decodeURIComponent(url);
  
  const helmetContext = {};
  const queryClient = new QueryClient();

  // Hydrate QueryClient with server data
  if (initialData) {
    Object.entries(initialData).forEach(([key, data]) => {
      queryClient.setQueryData([key], data);
    });
  }

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <Router hook={useStaticLocation}>
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );

  return {
    html,
    helmet: helmetContext.helmet,
    dehydratedState: dehydrate(queryClient),
  };
}
```

### 11.3 SSR في server/vite.ts

#### 11.3.1 الخطوات
1. التحقق من الـ route
2. جلب البيانات من الـ database
3. تنفيذ `render(url, initialData)`
4. استبدال الـ template placeholders
5. إضافة الـ helmet meta tags
6. إرجاع HTML كامل

#### 11.3.2 Data Prefetching
```typescript
// Blog listing page
if (url === "/blog") {
  initialData["/api/articles"] = await storage.getArticles({
    status: "published",
    page: 1,
    limit: 9,
  });
}

// Blog post page
if (url.match(/^\/blog\/(.+)$/)) {
  const slug = decodeURIComponent(match[1]);
  const article = await storage.getArticleBySlug(slug);
  if (article) {
    initialData[`/api/articles/${slug}`] = {
      article,
      relatedArticles: await storage.getRelatedArticles(article.id, article.tags, 3),
    };
  }
}
```

#### 11.3.3 Helmet Integration
```typescript
// Replace title
if (helmet.title) {
  finalHtml = finalHtml.replace(/<title>.*?<\/title>/s, helmet.title);
}

// Remove template default meta (if SEOHead provides one)
if (helmet.meta && helmet.meta.includes('name="description"')) {
  finalHtml = finalHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, '');
}

// Add helmet meta and link tags
finalHtml = finalHtml.slice(0, headEnd) + helmet.meta + helmet.link + finalHtml.slice(headEnd);
```

### 11.4 Client Hydration
```typescript
// entry-client.tsx
const dehydratedState = window.__REACT_QUERY_STATE__;

hydrateRoot(
  document.getElementById("root")!,
  <QueryClientProvider client={queryClient}>
    <HydrationBoundary state={dehydratedState}>
      <App />
    </HydrationBoundary>
  </QueryClientProvider>
);
```

### 11.5 SSR Fixes Applied

| المشكلة | السبب | الحل |
|---------|-------|------|
| Page Titles Missing | SEOHead فقط في المحتوى | إضافة SEOHead في loading/error states |
| Content Duplicates | DOMParser crash في SSR | `typeof window === "undefined"` check |
| URL Mismatch | Encoded vs decoded slug | `decodeURIComponent()` في entry-server |
| Multiple Meta Descriptions | Template + SEOHead | حذف template default conditionally |

---

## 12. External API

### 12.1 Authentication
```
Header: Authorization: Bearer {EXTERNAL_API_TOKEN}
```

### 12.2 Endpoints

#### 12.2.1 المقالات
```
GET    /api/external/articles
POST   /api/external/articles
GET    /api/external/articles/:id
PATCH  /api/external/articles/:id
POST   /api/external/articles/:id/publish
```

#### 12.2.2 الصفحات (للربط الداخلي)
```
GET    /api/external/pages
```

**الاستجابة:**
```json
{
  "success": true,
  "pages": [
    { "id": "home", "title": "الرئيسية", "url": "https://mutflex.com/", "type": "static" },
    { "id": "article-1", "title": "عنوان المقال", "url": "https://mutflex.com/blog/slug", "type": "article" }
  ]
}
```

---

## 13. قاعدة البيانات

### 13.1 الجداول

| الجدول | الوصف |
|--------|-------|
| `sessions` | جلسات المستخدمين |
| `users` | المستخدمين |
| `articles` | المقالات |
| `contact_submissions` | رسائل التواصل |
| `trial_submissions` | طلبات التجربة |
| `settings` | إعدادات النظام |

### 13.2 Migrations
- Drizzle ORM مع PostgreSQL
- Auto-migration عند بدء السيرفر

---

## 14. API Endpoints الكاملة

### 14.1 Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/user
```

### 14.2 Public Articles
```
GET  /api/articles                    # قائمة المقالات المنشورة
GET  /api/articles/tags               # كل التصنيفات
GET  /api/articles/:slug              # مقال واحد
```

### 14.3 Admin Articles
```
GET    /api/admin/articles            # كل المقالات
GET    /api/admin/articles/:id        # مقال واحد
POST   /api/admin/articles            # إنشاء مقال
PUT    /api/admin/articles/:id        # تحديث مقال
DELETE /api/admin/articles/:id        # حذف مقال
POST   /api/admin/articles/parse-html # استيراد HTML
POST   /api/admin/articles/generate-seo # إنشاء SEO بالـ AI
```

### 14.4 Admin Contacts
```
GET    /api/admin/contacts            # كل الرسائل
PATCH  /api/admin/contacts/:id/read   # تحديد كمقروءة
DELETE /api/admin/contacts/:id        # حذف
```

### 14.5 Admin Trials
```
GET    /api/admin/trials              # كل الطلبات
PATCH  /api/admin/trials/:id/read     # تحديد كمقروء
DELETE /api/admin/trials/:id          # حذف
```

### 14.6 Admin Users
```
GET    /api/admin/users               # كل المستخدمين
POST   /api/admin/users               # إنشاء مستخدم
PATCH  /api/admin/users/:id           # تحديث مستخدم
DELETE /api/admin/users/:id           # حذف مستخدم
```

### 14.7 Admin Settings
```
GET  /api/admin/settings              # كل الإعدادات
PUT  /api/admin/settings              # تحديث الإعدادات
POST /api/admin/regenerate-sitemap    # تحديث Sitemap
```

### 14.8 Uploads
```
POST /api/admin/upload                # رفع صورة
```

### 14.9 Public Forms
```
POST /api/contact                     # إرسال رسالة تواصل
POST /api/free-trial                  # طلب تجربة مجانية
```

### 14.10 SEO
```
GET /robots.txt
GET /sitemap.xml
```

### 14.11 External API
```
GET    /api/external/articles
POST   /api/external/articles
GET    /api/external/articles/:id
PATCH  /api/external/articles/:id
POST   /api/external/articles/:id/publish
GET    /api/external/pages
```

---

## ملاحظات ختامية

### الميزات الديناميكية (بدون Deploy)
1. ✅ المقالات الجديدة تظهر تلقائياً
2. ✅ Sitemap يتضمن المقالات الجديدة
3. ✅ SSR يعمل لكل الصفحات
4. ✅ SEO tags تُنشأ ديناميكياً

### التوصيات المستقبلية
1. إضافة دعم multi-language
2. تحسين البحث بـ full-text search
3. إضافة تحليلات داخلية
4. دعم التعليقات على المقالات
5. نظام Newsletter

---

*آخر تحديث: يناير 2026*
