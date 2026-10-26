import test from "node:test";
import assert from "node:assert/strict";
import {
  detectAssistantIntent,
  detectAssistantSector,
  buildAssistantContext,
  shouldOpenTrialForm,
  shouldShowTrialCta,
  splitForStreaming,
  streamAssistantReply,
  type AssistantContext,
  type AssistantIntent,
} from "./assistantService";
import { assistantLeadSchema } from "../shared/schema";

const sectorPrompts = [
  ["marble", "مصنع رخام"],
  ["construction", "شركة مقاولات"],
  ["finishing", "شركة تشطيبات"],
  ["design", "مكتب تصميم داخلي"],
  ["advertising-production", "شركة دعاية وإعلان وإنتاج إعلاني"],
  ["kitchen", "مصنع مطابخ"],
  ["aluminum", "شركة ألمنيوم"],
  ["blacksmith", "ورشة حدادة"],
  ["glass", "شركة زجاج سيكوريت"],
  ["elevators", "شركة مصاعد"],
  ["prefab", "مصنع بيوت جاهزة"],
  ["nurseries", "شركة تنسيق حدائق"],
  ["pest-control", "شركة مكافحة حشرات"],
] as const;

interface EvaluationCase {
  prompt: string;
  expectedSector: string;
  expectedIntent: AssistantIntent;
}

const evaluationCases: EvaluationCase[] = sectorPrompts.flatMap(([expectedSector, activity]) => [
  { prompt: `حنا ${activity} وشلون يرتب موتفلكس دورة الشغل عندنا؟`, expectedSector, expectedIntent: "sector" },
  { prompt: `كم سعر وباقة موتفلكس المناسبة لـ ${activity}؟`, expectedSector, expectedIntent: "pricing" },
  { prompt: `أبغى مندوب يتواصل معي بخصوص تشغيل ${activity}`, expectedSector, expectedIntent: "lead" },
  { prompt: `عندي ${activity}، كيف أتابع الفنيين والتركيب والتسليم؟`, expectedSector, expectedIntent: "sector" },
]);

test("assistant evaluation suite contains four Saudi-Arabic questions for every sector", () => {
  assert.equal(evaluationCases.length, sectorPrompts.length * 4);
  assert.equal(new Set(evaluationCases.map((item) => item.expectedSector)).size, sectorPrompts.length);
});

test("assistant understands an advertising production workflow instead of returning generic pricing", async () => {
  const originalKey = process.env.OPENROUTER_API_KEY;
  try {
    delete process.env.OPENROUTER_API_KEY;
    const message = "أنا عندي مكان تصوير وبنجهز الشغل وبنطلعه مصنع للدعاية والإعلان، هل البرنامج مفيد ليا؟";
    const context = await buildAssistantContext(message);
    let streamed = "";
    const result = await streamAssistantReply(message, [], context, (chunk) => { streamed += chunk; });
    assert.equal(context.sector, "advertising-production");
    assert.match(result.text, /قريت سؤالك/);
    assert.match(result.text, /تصوير.*مصنع|مصنع.*تصوير/);
    assert.doesNotMatch(result.text, /345|575/);
    assert.doesNotMatch(result.text, /###|\n-/);
    assert.ok(result.text.length < 600);
    assert.equal(streamed, result.text);
  } finally {
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});

test("assistant recognizes a photography studio that hands work to an external factory", () => {
  const sector = detectAssistantSector("عندي استوديو تصوير وبجهز التصميم وبعدها ببعت الشغل لمصنع خارجي");
  assert.equal(sector.slug, "advertising-production");
});

test("fallback streaming preserves headings and line breaks exactly", () => {
  const text = "حياك الله\n\n### فهم السؤال\n- أول نقطة\n- ثاني نقطة";
  assert.equal(splitForStreaming(text).join(""), text);
});

test("assistant classifies every evaluation question by sector and intent", () => {
  for (const item of evaluationCases) {
    const sector = detectAssistantSector(item.prompt);
    assert.equal(sector.slug, item.expectedSector, item.prompt);
    assert.equal(detectAssistantIntent(item.prompt, sector.slug), item.expectedIntent, item.prompt);
  }
});

test("fallback uses conversation history when the customer rejects a wrong assumption", async () => {
  const originalKey = process.env.OPENROUTER_API_KEY;
  try {
    delete process.env.OPENROUTER_API_KEY;
    const context = await buildAssistantContext("لا");
    const previousQuestion = "عندي مكان تصوير وبطلع الشغل لمصنع دعاية وإعلان";
    const result = await streamAssistantReply("لا", [{ role: "user", content: previousQuestion }], context, () => {});
    assert.match(result.text, /فهمت قصدك غلط/);
    assert.match(result.text, /مكان تصوير/);
  } finally {
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});

test("assistant keeps the sector from recent user history for natural follow-up questions", async () => {
  const history = [
    { role: "user" as const, content: "عندي مصنع مطابخ ونفصل على حسب المقاس" },
    { role: "assistant" as const, content: "واضح، وين أكثر نقطة تتعطل عندكم؟" },
  ];
  const context = await buildAssistantContext("طيب كيف بيفيدني؟", history);
  assert.equal(context.sector, "kitchen");
  assert.match(context.knowledgeText, /مصانع المطابخ والأثاث/);
});

test("assistant streams GLM 5.3 Flash through OpenRouter with privacy and cost controls", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  const streamed: string[] = [];
  let requestBody: Record<string, unknown> = {};
  try {
    process.env.OPENROUTER_API_KEY = "test-key";
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
      const payload = [
        `data: ${JSON.stringify({ model: "z-ai/glm-5.3-flash", choices: [{ delta: { content: "حياك الله، " } }] })}\n\n`,
        `data: ${JSON.stringify({ choices: [{ delta: { content: "خلني أوضح لك." } }] })}\n\n`,
        `data: ${JSON.stringify({ choices: [], usage: { prompt_tokens: 120, completion_tokens: 30, total_tokens: 150, cost: 0.000033 } })}\n\n`,
        "data: [DONE]\n\n",
      ].join("");
      return new Response(payload, { status: 200, headers: { "Content-Type": "text/event-stream" } });
    }) as typeof fetch;

    const context: AssistantContext = {
      intent: "sector",
      sector: "kitchen",
      sectorTitle: "مصانع المطابخ والأثاث",
      sources: [],
      knowledgeText: "معلومة موثقة عن دورة العمل.",
      publicKnowledgeText: "معلومة موثقة عن دورة العمل.",
      suggestions: [],
    };
    const result = await streamAssistantReply("عندي مصنع مطابخ", [], context, (chunk) => streamed.push(chunk));

    assert.equal(requestBody.model, "z-ai/glm-5.3-flash");
    assert.deepEqual(requestBody.reasoning, { effort: "low", exclude: true });
    assert.deepEqual(requestBody.provider, { data_collection: "deny", allow_fallbacks: true, sort: "price" });
    assert.equal(requestBody.max_tokens, 1200);
    const sentMessages = requestBody.messages as Array<{ role: string; content: string }>;
    assert.match(sentMessages[0].content, /ولا تستخدم التعبيرات المصرية/);
    assert.match(sentMessages[0].content, /معلومة واحدة فقط/);
    assert.match(sentMessages[0].content, /هدفك التجاري النهائي.*تجربة مجانية/);
    assert.equal(sentMessages.at(-1)?.role, "user");
    assert.equal(sentMessages.at(-1)?.content, "عندي مصنع مطابخ");
    assert.equal(streamed.join(""), "حياك الله، خلني أوضح لك.");
    assert.equal(result.provider, "openrouter");
    assert.equal(result.usage?.totalTokens, 150);
    assert.equal(result.usage?.costUsdMicros, 33);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});

test("assistant retries once when a provider returns reasoning without an answer", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  const streamed: string[] = [];
  const requestBodies: Array<Record<string, unknown>> = [];
  try {
    process.env.OPENROUTER_API_KEY = "test-key";
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requestBodies.push(JSON.parse(String(init?.body || "{}")) as Record<string, unknown>);
      if (requestBodies.length === 1) {
        const payload = [
          `data: ${JSON.stringify({ model: "z-ai/glm-5.3-flash", choices: [{ delta: {} }] })}\n\n`,
          "data: [DONE]\n\n",
        ].join("");
        return new Response(payload, { status: 200, headers: { "Content-Type": "text/event-stream" } });
      }
      return Response.json({
        model: "z-ai/glm-5.3-flash",
        choices: [{ message: { content: "أكيد، خلنا نبدأ من دورة الطلب." } }],
        usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120, cost: 0.00003 },
      });
    }) as typeof fetch;

    const context: AssistantContext = {
      intent: "sector",
      sector: "advertising-production",
      sectorTitle: "شركات الدعاية والإعلان والإنتاج الإعلاني",
      sources: [],
      knowledgeText: "معلومة موثقة عن دورة العمل.",
      publicKnowledgeText: "معلومة موثقة عن دورة العمل.",
      suggestions: [],
    };
    const result = await streamAssistantReply("عندي استوديو تصوير", [], context, (chunk) => streamed.push(chunk));

    assert.equal(requestBodies.length, 2);
    assert.equal(requestBodies[0].stream, true);
    assert.equal(requestBodies[1].stream, false);
    assert.equal(requestBodies[1].max_tokens, 1600);
    assert.equal(result.usedFallback, false);
    assert.equal(result.provider, "openrouter");
    assert.equal(streamed.join(""), "أكيد، خلنا نبدأ من دورة الطلب.");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});

test("assistant opens the free-trial form only after an explicit request or agreement", () => {
  const offeredHistory = [
    { role: "assistant" as const, content: "إذا يناسبك، أقدر أسجل لك تجربة مجانية." },
  ];
  assert.equal(shouldOpenTrialForm("تمام موافق", offeredHistory), true);
  assert.equal(shouldOpenTrialForm("أبغى أجرب التجربة المجانية", []), true);
  assert.equal(shouldOpenTrialForm("تمام", [{ role: "assistant", content: "تمام، أشرح لك دورة العمل." }]), false);
  assert.equal(shouldShowTrialCta("وش الخطوة التالية؟", [], "إذا يناسبك، أقدر أسجل لك تجربة مجانية."), true);
});

test("assistant trial lead accepts an optional normalized Saudi alternate phone", () => {
  const parsed = assistantLeadSchema.parse({
    sessionId: "session123",
    name: "محمد علي",
    phone: "0501234567",
    alternatePhone: "966551234567",
    company: "مصنع النور",
    consent: true,
  });
  assert.equal(parsed.phone, "+966501234567");
  assert.equal(parsed.alternatePhone, "+966551234567");
  assert.equal(assistantLeadSchema.safeParse({ ...parsed, alternatePhone: "0123" }).success, false);
});

test("page intro grounds the reply in the page the visitor is viewing", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  const page = {
    path: "/pricing",
    title: "أسعار واضحة تناسب السوق السعودي",
    headings: ["Mutflex Pro", "الأسئلة الشائعة"],
    excerpt: "باقة شهرية واحدة لإدارة الشركة بالكامل.",
  };
  let requestBody: Record<string, unknown> = {};
  try {
    const context = await buildAssistantContext("عرّفني على الصفحة", [], { page, pageIntro: true });
    assert.equal(context.pageIntro, true);
    assert.equal(context.page?.path, "/pricing");

    delete process.env.OPENROUTER_API_KEY;
    const fallback = await streamAssistantReply("عرّفني على الصفحة", [], context, () => {});
    assert.match(fallback.text, /أسعار واضحة تناسب السوق السعودي/);

    process.env.OPENROUTER_API_KEY = "test-key";
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
      const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: "هذي صفحة الأسعار." } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(payload, { status: 200, headers: { "Content-Type": "text/event-stream" } });
    }) as typeof fetch;
    await streamAssistantReply("عرّفني على الصفحة", [], context, () => {});
    const systemPrompt = (requestBody.messages as Array<{ content: string }>)[0].content;
    assert.match(systemPrompt, /العميل فتح المحادثة الحين وهو يتصفح الصفحة/);
    assert.match(systemPrompt, /- الرابط: \/pricing/);
    assert.match(systemPrompt, /  - Mutflex Pro/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
});
