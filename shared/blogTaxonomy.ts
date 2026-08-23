export type BlogTaxonomyKind = "topic" | "industry" | "content_type";

export interface BlogTaxonomyEntry {
  slug: string;
  kind: BlogTaxonomyKind;
  label: string;
  description: string;
  aliases: string[];
  sortOrder: number;
  featured?: boolean;
}

export interface BlogSearchableArticle {
  title: string;
  content: string;
  excerpt?: string | null;
  tags?: string[] | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  focusKeyword?: string | null;
}

export interface BlogTaxonomyMatch {
  slug: string;
  kind: BlogTaxonomyKind;
  score: number;
}

export const BLOG_TAXONOMY: BlogTaxonomyEntry[] = [
  {
    slug: "crm",
    kind: "topic",
    label: "إدارة العملاء CRM",
    description: "كل ما يخص تنظيم بيانات العملاء والفرص والمتابعات وتحويل الاستفسارات إلى أعمال فعلية.",
    aliases: ["CRM", "ادارة علاقات العملاء", "ادارة العملاء", "متابعة العملاء", "العملاء المحتملون", "ادارة المبيعات", "فرص البيع", "متابعة الاستفسارات"],
    sortOrder: 10,
    featured: true,
  },
  {
    slug: "erp",
    kind: "topic",
    label: "أنظمة ERP للمصانع",
    description: "أدلة اختيار وتطبيق أنظمة تخطيط موارد المنشأة وربط إدارات المصنع في نظام واحد.",
    aliases: ["ERP", "تخطيط موارد المنشاة", "نظام ادارة المصنع", "برنامج ادارة مصنع", "نظام متكامل للمصانع"],
    sortOrder: 20,
    featured: true,
  },
  {
    slug: "production-operations",
    kind: "topic",
    label: "إدارة التصنيع والتشغيل",
    description: "تنظيم أوامر ومراحل التصنيع ومتابعة تقدم التشغيل حتى التسليم.",
    aliases: ["ادارة التصنيع", "ادارة التشغيل", "عمليات التصنيع", "مراحل التصنيع", "اوامر التصنيع", "تخطيط الانتاج", "ادارة الانتاج", "متابعة الانتاج"],
    sortOrder: 30,
    featured: true,
  },
  {
    slug: "projects",
    kind: "topic",
    label: "إدارة المشاريع",
    description: "متابعة المشروع من التعاقد والقياسات حتى التصنيع والتركيب والتسليم.",
    aliases: ["ادارة المشاريع", "متابعة المشاريع", "دورة حياة المشروع", "مراحل المشروع", "تقدم المشروع", "جدولة المشاريع"],
    sortOrder: 40,
    featured: true,
  },
  {
    slug: "technicians-installation",
    kind: "topic",
    label: "الفنيون والتركيب",
    description: "توزيع مهام الفنيين وجدولة الزيارات ومتابعة أعمال التركيب والصيانة.",
    aliases: ["ادارة الفنيين", "متابعة الفنيين", "مهام الفنيين", "فرق التركيب", "جدولة التركيب", "اعمال التركيب", "خدمة ما بعد البيع", "الصيانة"],
    sortOrder: 50,
    featured: true,
  },
  {
    slug: "measurements",
    kind: "topic",
    label: "القياسات والمعاينات",
    description: "تسجيل القياسات والمعاينات وربطها بالمشروع والتصنيع لتقليل أخطاء التنفيذ.",
    aliases: ["القياسات", "رفع المقاسات", "تسجيل المقاسات", "المعاينات", "المعاينة", "المقاسات", "حصر الكميات"],
    sortOrder: 60,
  },
  {
    slug: "inventory-supply-chain",
    kind: "topic",
    label: "المخزون والتوريد",
    description: "إدارة المواد والمخزون والموردين والمشتريات وسلاسل الإمداد.",
    aliases: ["ادارة المخزون", "المخزون", "المستودعات", "ادارة المستودعات", "المشتريات", "الموردين", "سلسلة الامداد", "سلاسل الامداد", "التوريد"],
    sortOrder: 70,
  },
  {
    slug: "quotations-invoicing",
    kind: "topic",
    label: "عروض الأسعار والفواتير",
    description: "إنشاء عروض الأسعار والفواتير ومتابعة الدفعات وربطها بالمشروع والعميل.",
    aliases: ["عروض الاسعار", "عرض سعر", "الفواتير", "الفوترة", "الدفعات", "التحصيل", "الحسابات", "التكاليف"],
    sortOrder: 80,
  },
  {
    slug: "automation",
    kind: "topic",
    label: "الأتمتة والتحول الرقمي",
    description: "تحويل إجراءات المصنع من الملفات والاتصالات المتفرقة إلى تدفق عمل رقمي واضح.",
    aliases: ["الاتمتة", "التحول الرقمي", "رقمنة العمليات", "اتمتة العمليات", "اتمتة المصانع", "النظام السحابي", "SaaS"],
    sortOrder: 90,
    featured: true,
  },
  {
    slug: "reports-kpis",
    kind: "topic",
    label: "التقارير ومؤشرات الأداء",
    description: "تقارير التشغيل والمبيعات والإنتاج ومؤشرات الأداء اللازمة لاتخاذ القرار.",
    aliases: ["التقارير", "مؤشرات الاداء", "لوحة المعلومات", "تحليل البيانات", "تقارير الانتاج", "تقارير المبيعات", "KPI"],
    sortOrder: 100,
  },
  {
    slug: "finishing-companies",
    kind: "industry",
    label: "شركات التشطيبات",
    description: "محتوى متخصص لشركات التشطيب والديكور والمقاولات الداخلية التي تدير عملاء ومواقع وفرق تنفيذ.",
    aliases: ["شركات التشطيبات", "شركة تشطيبات", "التشطيبات", "اعمال التشطيب", "الديكور", "المقاولات الداخلية", "التصميم الداخلي"],
    sortOrder: 10,
    featured: true,
  },
  {
    slug: "marble-stone",
    kind: "industry",
    label: "مصانع الرخام والحجر",
    description: "إدارة القياسات والتصنيع والتوريد والتركيب في مصانع وشركات الرخام والحجر.",
    aliases: ["مصانع الرخام", "مصنع رخام", "شركات الرخام", "الرخام", "الجرانيت", "الحجر الطبيعي", "مصانع الحجر"],
    sortOrder: 20,
    featured: true,
  },
  {
    slug: "furniture-wood",
    kind: "industry",
    label: "الأثاث والأخشاب",
    description: "تشغيل مصانع الأثاث والنجارة والمطابخ من الطلب حتى التصنيع والتركيب.",
    aliases: ["مصانع الاثاث", "مصنع اثاث", "الاثاث", "الاخشاب", "النجارة", "المطابخ", "مصانع المطابخ"],
    sortOrder: 30,
    featured: true,
  },
  {
    slug: "aluminum-glass",
    kind: "industry",
    label: "الألومنيوم والزجاج",
    description: "متابعة المقاسات والتصنيع والتركيب لشركات الألومنيوم والزجاج والواجهات.",
    aliases: ["الالومنيوم", "الألومنيوم", "الزجاج", "الواجهات", "واجهات المباني", "مصانع الالومنيوم"],
    sortOrder: 40,
  },
  {
    slug: "contractors",
    kind: "industry",
    label: "المقاولات",
    description: "تنظيم العملاء والمشاريع والمواقع والفرق والمستندات لشركات المقاولات.",
    aliases: ["شركات المقاولات", "شركة مقاولات", "المقاولات", "المقاولين", "مقاول", "المشاريع الانشائية"],
    sortOrder: 50,
    featured: true,
  },
  {
    slug: "supply-installation",
    kind: "industry",
    label: "التوريد والتركيب",
    description: "إدارة دورة العمل في الشركات التي تجمع بين التوريد والتصنيع والتركيب بالموقع.",
    aliases: ["التوريد والتركيب", "تصنيع وتركيب", "توريد وتركيب", "شركات التركيب", "التنفيذ بالموقع"],
    sortOrder: 60,
    featured: true,
  },
  {
    slug: "manufacturing",
    kind: "industry",
    label: "المصانع والتصنيع",
    description: "مقالات عامة للمصانع وشركات التصنيع التي تريد ضبط التشغيل والإنتاج.",
    aliases: ["المصانع", "مصنع", "شركة تصنيع", "شركات التصنيع", "القطاع الصناعي", "المنشات الصناعية"],
    sortOrder: 70,
  },
  {
    slug: "definition-guide",
    kind: "content_type",
    label: "تعريف ودليل البداية",
    description: "مقالات تشرح المفهوم من البداية والمصطلحات الأساسية.",
    aliases: ["ما هو", "ما هي", "تعريف", "دليل", "شرح", "كل ما تحتاج معرفته", "للمبتدئين"],
    sortOrder: 10,
  },
  {
    slug: "benefits",
    kind: "content_type",
    label: "الفوائد والنتائج",
    description: "مقالات تشرح المزايا والعائد المتوقع وحل مشكلات التشغيل.",
    aliases: ["فوائد", "الفوائد", "مميزات", "المميزات", "اهمية", "لماذا", "تحسين", "تقليل الاخطاء", "زيادة الانتاجية"],
    sortOrder: 20,
  },
  {
    slug: "implementation",
    kind: "content_type",
    label: "التطبيق والخطوات",
    description: "خطوات عملية لتطبيق النظام أو الإجراء داخل الشركة.",
    aliases: ["كيفية", "كيف", "خطوات", "طريقة", "تطبيق", "تنفيذ", "اعداد", "البدء"],
    sortOrder: 30,
  },
  {
    slug: "comparison",
    kind: "content_type",
    label: "مقارنات واختيار",
    description: "مقارنات ومعايير تساعد على اختيار النظام أو الأسلوب المناسب.",
    aliases: ["مقارنة", "الفرق بين", "افضل", "اختيار", "معايير الاختيار", "مقابل", "بديل"],
    sortOrder: 40,
  },
  {
    slug: "case-study",
    kind: "content_type",
    label: "حالات استخدام",
    description: "أمثلة وسيناريوهات تطبيق واقعية حسب القطاع.",
    aliases: ["دراسة حالة", "حالة استخدام", "تجربة", "مثال عملي", "سيناريو", "قصة نجاح"],
    sortOrder: 50,
  },
  {
    slug: "problem-solving",
    kind: "content_type",
    label: "حل المشكلات",
    description: "تشخيص مشكلات التشغيل وتقديم حلول عملية لها.",
    aliases: ["مشكلة", "حل", "اخطاء", "تحديات", "تاخير", "فوضى", "اسباب", "معالجة"],
    sortOrder: 60,
  },
];

const ARABIC_DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g;
const ARABIC_PREFIXES = ["وال", "بال", "كال", "فال", "لل", "ال"];

export function normalizeArabicSearch(value: string): string {
  const normalized = (value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, "")
    .replace(/ـ/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  const variants = new Set<string>();
  for (const token of normalized.split(" ")) {
    if (!token) continue;
    let canonicalToken = token;
    const longPrefix = ARABIC_PREFIXES.find((prefix) => token.startsWith(prefix) && token.length - prefix.length >= 3);
    if (longPrefix) {
      canonicalToken = token.slice(longPrefix.length);
    } else if (/^[وفبل]/.test(token) && token.length >= 5) {
      canonicalToken = token.slice(1);
    }
    variants.add(canonicalToken);
  }

  return Array.from(variants).join(" ");
}

export function stripHtml(value: string): string {
  return (value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasMatches(haystack: string, alias: string): boolean {
  const normalizedAlias = normalizeArabicSearch(alias);
  if (!normalizedAlias) return false;
  return haystack.includes(normalizedAlias);
}

export function classifyBlogArticle(article: BlogSearchableArticle): BlogTaxonomyMatch[] {
  const fields = [
    { value: article.title, weight: 14 },
    { value: article.focusKeyword || "", weight: 14 },
    { value: (article.tags || []).join(" "), weight: 10 },
    { value: article.metaTitle || "", weight: 9 },
    { value: article.metaKeywords || "", weight: 8 },
    { value: article.excerpt || "", weight: 5 },
    { value: article.metaDescription || "", weight: 4 },
    { value: stripHtml(article.content).slice(0, 6_000), weight: 3, body: true },
  ].map((field) => ({ ...field, body: "body" in field && field.body, value: normalizeArabicSearch(field.value) }));

  const candidates = BLOG_TAXONOMY.map((entry) => {
    let score = 0;
    for (const field of fields) {
      if (!field.value) continue;
      if (entry.kind === "content_type" && field.body) continue;
      const matchedAliases = entry.aliases.filter((alias) => aliasMatches(field.value, alias));
      score += matchedAliases.length * field.weight;
    }
    return { slug: entry.slug, kind: entry.kind, score };
  });

  const strongest = (kind: BlogTaxonomyKind, minimumScore: number, limit: number) => candidates
    .filter((match) => match.kind === kind && match.score >= minimumScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return [
    ...strongest("topic", 8, 3),
    ...strongest("industry", 8, 2),
    ...strongest("content_type", 5, 1),
  ];
}

export function buildArticleSearchFields(article: BlogSearchableArticle, taxonomySlugs: string[] = []) {
  const selectedTaxonomy = BLOG_TAXONOMY.filter((entry) => taxonomySlugs.includes(entry.slug));
  const titleText = normalizeArabicSearch([
    article.title,
    article.metaTitle,
    article.focusKeyword,
  ].filter(Boolean).join(" "));
  const keywordText = normalizeArabicSearch([
    ...(article.tags || []),
    article.metaKeywords,
    ...selectedTaxonomy.flatMap((entry) => [entry.label, ...entry.aliases]),
  ].filter(Boolean).join(" "));
  const bodyText = normalizeArabicSearch([
    article.excerpt,
    article.metaDescription,
    stripHtml(article.content).slice(0, 500_000),
  ].filter(Boolean).join(" "));

  return {
    titleText,
    keywordText,
    bodyText,
    normalizedText: `${titleText} ${keywordText} ${bodyText}`.replace(/\s+/g, " ").trim(),
  };
}

export function getTaxonomyEntry(slug: string): BlogTaxonomyEntry | undefined {
  return BLOG_TAXONOMY.find((entry) => entry.slug === slug);
}
