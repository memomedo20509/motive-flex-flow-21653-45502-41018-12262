import test from "node:test";
import assert from "node:assert/strict";
import { buildArticleSearchFields, classifyBlogArticle, normalizeArabicSearch } from "./blogTaxonomy";

test("Arabic normalization handles common letter forms and attached prefixes", () => {
  const normalized = normalizeArabicSearch("لِشركاتِ التَّشطيبات وإدارة العملاء");
  assert.match(normalized, /شركات/);
  assert.match(normalized, /تشطيبات|التشطيبات/);
  assert.match(normalized, /اداره/);
});

test("contextual classification finds CRM and finishing without literal tags", () => {
  const matches = classifyBlogArticle({
    title: "كيف تنظم علاقات العملاء في شركة تشطيبات؟",
    excerpt: "دليل لمتابعة الاستفسارات وفرص البيع والمشروعات.",
    content: "<p>يساعد نظام CRM فرق الديكور والمقاولات الداخلية على متابعة العملاء المحتملين.</p>",
    tags: ["نمو الشركات"],
  });
  const slugs = matches.map((match) => match.slug);
  assert.ok(slugs.includes("crm"));
  assert.ok(slugs.includes("finishing-companies"));
  assert.ok(slugs.includes("definition-guide") || slugs.includes("implementation"));
});

test("search fields include canonical taxonomy aliases", () => {
  const fields = buildArticleSearchFields({
    title: "تنظيم متابعة العملاء",
    content: "مقال عملي",
  }, ["crm", "finishing-companies"]);
  assert.match(fields.keywordText, /crm/);
  assert.match(fields.keywordText, /تشطيبات/);
  assert.ok(fields.normalizedText.length > fields.titleText.length);
});
