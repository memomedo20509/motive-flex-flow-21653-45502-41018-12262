# PRD - Article Writing & External API Publishing System
## Product Requirements Document

---

## 1. نظرة عامة (Overview)

### 1.1 وصف المنتج
نظام متكامل لإدارة وكتابة المقالات مع واجهة API خارجية تسمح لأدوات خارجية (مثل SEO Master أو أي أداة كتابة محتوى) بالاتصال بالموقع والنشر مباشرة.

### 1.2 الأهداف الرئيسية
1. توفير نظام كتابة مقالات احترافي مع محرر نصوص متقدم
2. دعم SEO كامل مع إمكانية توليد البيانات بالذكاء الاصطناعي
3. API خارجي آمن يسمح بالنشر من أدوات خارجية
4. جدولة المقالات للنشر التلقائي
5. إدارة الصور والوسائط

---

## 2. هيكل قاعدة البيانات (Database Schema)

### 2.1 جدول المقالات (Articles Table)

```typescript
// shared/schema.ts
import { sql } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  // الحقول الأساسية
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  
  // الصور
  coverImage: varchar("cover_image", { length: 500 }),
  coverImageAlt: varchar("cover_image_alt", { length: 255 }),
  
  // التصنيفات والكاتب
  tags: text("tags").array().default([]),
  author: varchar("author", { length: 100 }).default("اسم الموقع"),
  
  // حالة المقال
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  // القيم الممكنة: draft, published, scheduled, unpublished
  
  // حقول SEO الأساسية
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  focusKeyword: varchar("focus_keyword", { length: 100 }),
  canonicalUrl: varchar("canonical_url", { length: 500 }),
  
  // Open Graph للمشاركة على السوشيال ميديا
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  ogImage: varchar("og_image", { length: 500 }),
  
  // توجيهات محركات البحث
  robotsDirective: varchar("robots_directive", { length: 50 }).default("index, follow"),
  // القيم الممكنة: index, follow | noindex, follow | index, nofollow | noindex, nofollow
  
  // Schema Markup للبيانات المنظمة
  schemaMarkup: text("schema_markup"),
  
  // إحصائيات
  readingTime: varchar("reading_time", { length: 20 }),
  viewCount: serial("view_count"),
  
  // التواريخ
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema للإدخال
export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// حالات المقال
export const ArticleStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SCHEDULED: "scheduled",
  UNPUBLISHED: "unpublished",
} as const;

export type ArticleStatusType = typeof ArticleStatus[keyof typeof ArticleStatus];
```

---

## 3. نظام API الخارجي (External API System)

### 3.1 نظرة عامة
نظام API آمن يسمح لأدوات خارجية بـ:
- جلب قائمة المقالات
- إنشاء مقالات جديدة
- تحديث المقالات الموجودة
- نشر المقالات
- حذف المقالات

### 3.2 المصادقة (Authentication)

#### إعداد Token
```typescript
// المتغير البيئي المطلوب
EXTERNAL_API_TOKEN=your-secure-random-token-here

// Middleware للتحقق من Token
const validateExternalToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const apiToken = process.env.EXTERNAL_API_TOKEN;
  
  if (!apiToken) {
    return res.status(500).json({ 
      success: false, 
      message: "API token not configured on server" 
    });
  }
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Authorization header missing or invalid format" 
    });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== apiToken) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid API token" 
    });
  }
  
  next();
};
```

### 3.3 نقاط النهاية (API Endpoints)

#### 3.3.1 جلب جميع المقالات
```
GET /api/external/articles
```

**Headers المطلوبة:**
```
Authorization: Bearer YOUR_API_TOKEN
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | all | فلترة حسب الحالة (draft, published, scheduled) |
| limit | number | 100 | عدد المقالات في الصفحة |
| page | number | 1 | رقم الصفحة |

**Response الناجح (200):**
```json
{
  "success": true,
  "articles": [
    {
      "id": "1",
      "title": "عنوان المقال",
      "slug": "article-slug",
      "content": "<p>محتوى المقال...</p>",
      "excerpt": "ملخص المقال",
      "metaTitle": "عنوان SEO",
      "metaDescription": "وصف SEO",
      "metaKeywords": "كلمة1, كلمة2",
      "focusKeyword": "الكلمة المفتاحية الرئيسية",
      "canonicalUrl": "https://example.com/article-slug",
      "ogTitle": "عنوان السوشيال ميديا",
      "ogDescription": "وصف السوشيال ميديا",
      "ogImage": "https://example.com/image.jpg",
      "robotsDirective": "index, follow",
      "schemaMarkup": "{...}",
      "coverImage": "/uploads/cover.jpg",
      "coverImageAlt": "وصف الصورة",
      "tags": ["تقنية", "برمجة"],
      "author": "اسم الكاتب",
      "status": "published",
      "readingTime": "5 دقائق",
      "viewCount": 150,
      "publishedAt": "2025-01-20T10:00:00Z",
      "scheduledAt": null,
      "createdAt": "2025-01-15T08:00:00Z",
      "updatedAt": "2025-01-20T10:00:00Z",
      "url": "https://example.com/articles/article-slug"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50,
    "totalPages": 1
  }
}
```

#### 3.3.2 إنشاء مقال جديد
```
POST /api/external/articles
```

**Headers المطلوبة:**
```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "عنوان المقال",                    // مطلوب
  "content": "<p>محتوى المقال بـ HTML</p>",  // اختياري
  "excerpt": "ملخص المقال",                   // اختياري
  "metaTitle": "عنوان SEO",                  // اختياري
  "metaDescription": "وصف SEO",              // اختياري
  "metaKeywords": "كلمة1, كلمة2",            // اختياري
  "focusKeyword": "الكلمة المفتاحية",        // اختياري
  "canonicalUrl": "https://...",             // اختياري
  "ogTitle": "عنوان السوشيال",               // اختياري
  "ogDescription": "وصف السوشيال",           // اختياري
  "ogImage": "https://...",                  // اختياري
  "robotsDirective": "index, follow",        // اختياري
  "schemaMarkup": "{...}",                   // اختياري (JSON string)
  "coverImage": "https://...",               // اختياري
  "coverImageAlt": "وصف الصورة",             // اختياري
  "tags": ["تقنية", "برمجة"]                 // اختياري
}
```

**Response الناجح (201):**
```json
{
  "success": true,
  "article": {
    "id": "123",
    "title": "عنوان المقال",
    "slug": "auto-generated-slug",
    "status": "draft",
    "url": "https://example.com/articles/auto-generated-slug",
    "createdAt": "2025-01-21T10:00:00Z"
  }
}
```

**ملاحظات مهمة:**
- المقال يُنشأ بحالة `draft` تلقائياً
- الـ `slug` يُولد تلقائياً من العنوان
- يجب استخدام endpoint النشر لتغيير الحالة إلى `published`

#### 3.3.3 جلب مقال واحد
```
GET /api/external/articles/:id
```

**Response الناجح (200):**
```json
{
  "success": true,
  "article": {
    // نفس بنية المقال في قائمة المقالات
  }
}
```

#### 3.3.4 تحديث مقال
```
PATCH /api/external/articles/:id
```

**Request Body:** (جميع الحقول اختيارية)
```json
{
  "title": "العنوان الجديد",
  "content": "<p>المحتوى الجديد</p>",
  "metaDescription": "الوصف الجديد"
  // ... أي حقول أخرى تريد تحديثها
}
```

**Response الناجح (200):**
```json
{
  "success": true,
  "article": {
    "id": "123",
    "title": "العنوان الجديد",
    "slug": "article-slug",
    "status": "draft",
    "url": "https://example.com/articles/article-slug",
    "updatedAt": "2025-01-21T12:00:00Z"
  }
}
```

#### 3.3.5 نشر مقال
```
POST /api/external/articles/:id/publish
```

**Response الناجح (200):**
```json
{
  "success": true,
  "article": {
    "id": "123",
    "title": "عنوان المقال",
    "slug": "article-slug",
    "status": "published",
    "url": "https://example.com/articles/article-slug",
    "publishedAt": "2025-01-21T12:00:00Z"
  }
}
```

#### 3.3.6 حذف مقال
```
DELETE /api/external/articles/:id
```

**Response الناجح (200):**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

### 3.4 أكواد الخطأ (Error Codes)

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - بيانات غير صحيحة |
| 401 | Unauthorized - التوكن غير موجود |
| 403 | Forbidden - التوكن غير صحيح |
| 404 | Not Found - المقال غير موجود |
| 500 | Server Error - خطأ في السيرفر |

**شكل رسالة الخطأ:**
```json
{
  "success": false,
  "message": "وصف الخطأ"
}
```

---

## 4. نظام الـ Admin للمقالات (Admin Article System)

### 4.1 صفحات الإدارة المطلوبة

#### 4.1.1 قائمة المقالات
**المسار:** `/admin/articles`

**الميزات:**
- عرض جميع المقالات في جدول
- فلترة حسب الحالة (مسودة، منشور، مجدول)
- البحث في العناوين
- ترقيم الصفحات (Pagination)
- أزرار للتعديل والحذف والمعاينة
- عرض حالة المقال بألوان مميزة
- عرض تاريخ النشر أو الجدولة

#### 4.1.2 إنشاء/تعديل مقال
**المسار:** `/admin/articles/new` و `/admin/articles/:id/edit`

**الحقول المطلوبة في النموذج:**

**قسم المحتوى الأساسي:**
- العنوان (title) - مطلوب
- الـ Slug (يُولد تلقائياً مع إمكانية التعديل)
- المحتوى (محرر Rich Text)
- الملخص (excerpt)

**قسم الصور:**
- صورة الغلاف (رفع ملف)
- النص البديل للصورة

**قسم التصنيف:**
- التاجات (tags) - Multi-select أو إدخال متعدد
- اسم الكاتب

**قسم SEO:**
- عنوان SEO (metaTitle)
- وصف SEO (metaDescription)
- الكلمات المفتاحية (metaKeywords)
- الكلمة المفتاحية الرئيسية (focusKeyword)
- الرابط الأساسي (canonicalUrl)
- توجيه الروبوتات (robotsDirective) - Select

**قسم Open Graph:**
- عنوان OG (ogTitle)
- وصف OG (ogDescription)
- صورة OG (ogImage)

**قسم متقدم:**
- Schema Markup (JSON)
- وقت القراءة (يُحسب تلقائياً)

**قسم النشر:**
- الحالة (draft, published, scheduled)
- تاريخ الجدولة (إذا كانت الحالة scheduled)

### 4.2 محرر النصوص (Rich Text Editor)

**المتطلبات:**
- استخدام TipTap أو محرر مشابه
- دعم:
  - العناوين (H1-H6)
  - تنسيق النص (Bold, Italic, Underline, Strike)
  - القوائم (Ordered, Unordered)
  - الروابط
  - الصور (رفع + URL)
  - الجداول
  - الاقتباسات
  - أكواد البرمجة (Code blocks)
  - محاذاة النص
  - Undo/Redo

### 4.3 ميزة توليد SEO بالذكاء الاصطناعي

**الـ Endpoint:**
```
POST /api/admin/articles/generate-seo
```

**Request:**
```json
{
  "title": "عنوان المقال",
  "content": "محتوى المقال",
  "excerpt": "الملخص"
}
```

**Response:**
```json
{
  "metaDescription": "وصف SEO المُولد",
  "metaKeywords": "كلمة1, كلمة2, كلمة3",
  "focusKeyword": "الكلمة المفتاحية الرئيسية",
  "ogTitle": "عنوان السوشيال ميديا",
  "ogDescription": "وصف السوشيال ميديا"
}
```

**التكامل مع Gemini AI:**
```typescript
// استخدام Gemini API لتوليد بيانات SEO
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

const prompt = `أنت خبير SEO. قم بتحليل المقال التالي وإنشاء بيانات SEO محسّنة.
العنوان: ${title}
الملخص: ${excerpt}
المحتوى: ${content.substring(0, 3000)}

قم بإرجاع JSON بالتنسيق التالي:
{
  "metaDescription": "وصف meta لا يتجاوز 160 حرف",
  "metaKeywords": "5-7 كلمات مفتاحية مفصولة بفواصل",
  "focusKeyword": "الكلمة المفتاحية الرئيسية",
  "ogTitle": "عنوان جذاب للمشاركة",
  "ogDescription": "وصف مشوق للمشاركة على السوشيال ميديا"
}`;
```

---

## 5. API الداخلي للـ Admin

### 5.1 Endpoints المطلوبة

```typescript
// جلب المقالات (Admin)
GET /api/admin/articles
Query: page, limit, status, search

// جلب مقال واحد
GET /api/admin/articles/:id

// إنشاء مقال جديد
POST /api/admin/articles
Body: FormData (data + coverImage file)

// تحديث مقال
PUT /api/admin/articles/:id
Body: FormData (data + coverImage file)

// حذف مقال
DELETE /api/admin/articles/:id

// استيراد من HTML
POST /api/admin/articles/parse-html
Body: FormData (HTML file)

// توليد SEO
POST /api/admin/articles/generate-seo
Body: { title, content, excerpt }

// رفع صورة
POST /api/admin/upload
Body: FormData (file)
```

### 5.2 Middleware للمصادقة

```typescript
// التحقق من تسجيل الدخول
const isAuthenticated = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// التحقق من صلاحية Admin
const isAdmin = (req, res, next) => {
  if (req.session?.user?.isAdmin !== "true") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
```

---

## 6. الواجهة العامة (Public Interface)

### 6.1 صفحات المقالات

**صفحة قائمة المقالات:**
- المسار: `/articles` أو `/blog`
- عرض المقالات المنشورة فقط
- ترقيم الصفحات
- فلترة حسب التاجات
- البحث

**صفحة المقال الواحد:**
- المسار: `/articles/:slug`
- عرض المحتوى الكامل
- المقالات ذات الصلة
- مشاركة على السوشيال ميديا
- SEO Tags في الـ head

### 6.2 API العام

```typescript
// جلب المقالات المنشورة
GET /api/articles
Query: page, limit, tag, search

// جلب التاجات
GET /api/articles/tags

// جلب مقال بالـ slug
GET /api/articles/:slug
```

---

## 7. نظام الجدولة (Scheduling System)

### 7.1 آلية العمل
- عند تحديد حالة المقال كـ `scheduled` مع تاريخ محدد
- عند وصول الوقت المحدد، يتحول المقال تلقائياً إلى `published`
- يتم هذا الفحص عند كل طلب لجلب المقالات

### 7.2 التنفيذ
```typescript
// في route جلب المقال
if (article.status === "scheduled" && article.scheduledAt) {
  const now = new Date();
  if (article.scheduledAt <= now) {
    // تحديث الحالة إلى published
    await storage.updateArticle(article.id, { 
      status: "published",
      publishedAt: new Date()
    });
    article.status = "published";
    article.publishedAt = new Date();
  }
}
```

---

## 8. المتطلبات التقنية

### 8.1 المتغيرات البيئية المطلوبة

```env
# قاعدة البيانات
DATABASE_URL=postgresql://...

# API Token للاتصال الخارجي
EXTERNAL_API_TOKEN=secure-random-token-minimum-32-characters

# Gemini AI لتوليد SEO
AI_INTEGRATIONS_GEMINI_API_KEY=your-gemini-api-key
AI_INTEGRATIONS_GEMINI_BASE_URL=https://generativelanguage.googleapis.com

# الدومين (للروابط)
REPLIT_DEV_DOMAIN=your-domain.replit.app
```

### 8.2 الحزم المطلوبة

```json
{
  "dependencies": {
    "drizzle-orm": "^0.38",
    "drizzle-zod": "^0.5",
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-image": "^2.x",
    "@tiptap/extension-link": "^2.x",
    "@tiptap/extension-table": "^2.x",
    "@google/generative-ai": "^0.x",
    "multer": "^1.x",
    "slugify": "^1.x",
    "zod": "^3.x"
  }
}
```

### 8.3 رفع الملفات

```typescript
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});
```

---

## 9. أمثلة استخدام API الخارجي

### 9.1 إنشاء ونشر مقال من أداة خارجية

```javascript
// الخطوة 1: إنشاء المقال
const createResponse = await fetch("https://your-site.com/api/external/articles", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: "عنوان المقال الجديد",
    content: "<h2>مقدمة</h2><p>محتوى المقال...</p>",
    excerpt: "ملخص قصير للمقال",
    metaDescription: "وصف SEO للمقال",
    tags: ["تقنية", "برمجة"]
  })
});

const { article } = await createResponse.json();
console.log("تم إنشاء المقال بـ ID:", article.id);

// الخطوة 2: نشر المقال
const publishResponse = await fetch(
  `https://your-site.com/api/external/articles/${article.id}/publish`,
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_TOKEN"
    }
  }
);

const result = await publishResponse.json();
console.log("تم النشر! الرابط:", result.article.url);
```

### 9.2 تحديث مقال موجود

```javascript
const response = await fetch("https://your-site.com/api/external/articles/123", {
  method: "PATCH",
  headers: {
    "Authorization": "Bearer YOUR_API_TOKEN",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: "العنوان المحدث",
    metaDescription: "الوصف المحدث"
  })
});
```

### 9.3 جلب جميع المقالات المنشورة

```javascript
const response = await fetch(
  "https://your-site.com/api/external/articles?status=published&limit=50",
  {
    headers: {
      "Authorization": "Bearer YOUR_API_TOKEN"
    }
  }
);

const { articles, pagination } = await response.json();
console.log(`تم جلب ${articles.length} مقال من أصل ${pagination.total}`);
```

---

## 10. ملاحظات التنفيذ

### 10.1 أولويات التنفيذ

1. **المرحلة الأولى:** قاعدة البيانات والـ Schema
2. **المرحلة الثانية:** API الخارجي مع المصادقة
3. **المرحلة الثالثة:** واجهة Admin للمقالات
4. **المرحلة الرابعة:** محرر النصوص المتقدم
5. **المرحلة الخامسة:** توليد SEO بالذكاء الاصطناعي
6. **المرحلة السادسة:** الواجهة العامة وصفحات المقالات

### 10.2 اعتبارات الأمان

- استخدام Token قوي وعشوائي (32 حرف على الأقل)
- عدم تخزين Token في الكود
- التحقق من صلاحيات المستخدم في كل طلب
- تنظيف مدخلات HTML لمنع XSS
- التحقق من أنواع وأحجام الملفات المرفوعة

### 10.3 تحسينات الأداء

- فهرسة (Index) على حقول: slug, status, publishedAt, createdAt
- Pagination لتقليل حجم البيانات
- Cache للمقالات المنشورة
- تحسين الصور (resize, compress)

---

## 11. الاختبار

### 11.1 اختبار API الخارجي

```bash
# اختبار الاتصال
curl -X GET "https://your-site.com/api/external/articles" \
  -H "Authorization: Bearer YOUR_TOKEN"

# اختبار الإنشاء
curl -X POST "https://your-site.com/api/external/articles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article"}'

# اختبار النشر
curl -X POST "https://your-site.com/api/external/articles/1/publish" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 12. الخلاصة

هذا النظام يوفر:
1. نظام كتابة مقالات متكامل مع محرر متقدم
2. دعم SEO كامل مع إمكانية التوليد بالذكاء الاصطناعي
3. API خارجي آمن للتكامل مع أدوات كتابة المحتوى
4. نظام جدولة للنشر التلقائي
5. واجهة إدارة سهلة الاستخدام
6. واجهة عامة لعرض المقالات

الـ API الخارجي يسمح لأي أداة كتابة محتوى (مثل SEO Master أو أي أداة مخصصة) بالاتصال بالموقع وإدارة المقالات برمجياً.
