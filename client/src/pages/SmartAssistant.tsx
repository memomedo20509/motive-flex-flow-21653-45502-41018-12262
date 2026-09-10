import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Bot,
  Building2,
  Check,
  ExternalLink,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  Workflow,
} from "lucide-react";
import { PageScaffold } from "@/components/PageScaffold";
import { WebApplicationSchema } from "@/components/SchemaMarkup";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AssistantSource {
  slug: string;
  title: string;
  type: string;
  sector?: string | null;
  sourceUrl?: string | null;
}

interface ChatMessage {
  localId: string;
  serverId?: number;
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
  pending?: boolean;
  feedback?: "positive" | "negative";
  usedFallback?: boolean;
}

interface BootstrapData {
  quickPrompts: string[];
  roles: string[];
  sectors: Array<{ slug: string; title: string; aliases: string[] }>;
  features: Array<{ slug: string; title: string; summary: string }>;
}

interface StreamEvent {
  type: "meta" | "chunk" | "done" | "error";
  text?: string;
  sessionId?: string;
  messageId?: number;
  sector?: string;
  sources?: AssistantSource[];
  suggestions?: string[];
  message?: string;
  usedFallback?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  localId: "welcome",
  role: "assistant",
  content: "حياك الله 👋 قلّي وش طبيعة شغلك أو المشكلة اللي تواجهك، ونفهم سوا هل موتفلكس يناسبكم وكيف يفيدكم.",
};

const STORAGE_KEY = "mutflex-assistant-session-v1";
const WHATSAPP_NUMBER = "966507051401";

function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredSession(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = window.localStorage.getItem(STORAGE_KEY) || "";
  return /^[a-zA-Z0-9_-]{8,64}$/.test(value) ? value : undefined;
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => (
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={index} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
          : <span key={index}>{part}</span>
      ))}
    </>
  );
}

function MessageText({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-2 leading-7">
      {lines.map((line, index) => {
        const clean = line.trim();
        if (!clean) return <div key={index} className="h-1" aria-hidden="true" />;
        const heading = clean.match(/^#{1,4}\s+(.+)$/);
        if (heading) return <p key={index} className="pt-1 font-bold text-foreground"><InlineText text={heading[1]} /></p>;
        const bullet = clean.match(/^[-•*]\s+(.+)$/);
        if (bullet) return <p key={index} className="flex gap-2 pr-1"><span className="text-secondary">•</span><span><InlineText text={bullet[1]} /></span></p>;
        const numbered = clean.match(/^(\d+)[.)]\s+(.+)$/);
        if (numbered) return <p key={index} className="flex gap-2 pr-1"><span className="font-semibold text-secondary">{numbered[1]}.</span><span><InlineText text={numbered[2]} /></span></p>;
        return <p key={index}><InlineText text={clean} /></p>;
      })}
    </div>
  );
}

export default function SmartAssistant() {
  const { toast } = useToast();
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(readStoredSession);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [detectedSector, setDetectedSector] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "", company: "", sector: "", customerRole: "", painPoint: "", consent: false });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/assistant/bootstrap")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("bootstrap failed")))
      .then((data: BootstrapData) => {
        setBootstrap(data);
        setSuggestions(data.quickPrompts.slice(0, 4));
      })
      .catch(() => {
        setSuggestions(["اشرح لي موتفلكس من البداية", "عندي مصنع رخام", "وش الأسعار؟"]);
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sectorTitle = useMemo(
    () => bootstrap?.sectors.find((sector) => sector.slug === detectedSector)?.title || "",
    [bootstrap, detectedSector],
  );

  const sendMessage = async (rawMessage?: string) => {
    const message = (rawMessage ?? input).trim();
    if (!message || isSending) return;

    setInput("");
    setSuggestions([]);
    setIsSending(true);
    const userMessage: ChatMessage = { localId: makeLocalId("user"), role: "user", content: message };
    const assistantLocalId = makeLocalId("assistant");
    setMessages((current) => [
      ...current,
      userMessage,
      { localId: assistantLocalId, role: "assistant", content: "", pending: true },
    ]);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId,
          history: messages
            .filter((item) => item.localId !== "welcome" && item.content.trim())
            .slice(-6)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({ message: "تعذر بدء المحادثة." }));
        throw new Error(payload.message || "تعذر بدء المحادثة.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const rawEvent of events) {
          const dataLine = rawEvent.split("\n").find((line) => line.startsWith("data: "));
          if (!dataLine) continue;
          const event = JSON.parse(dataLine.slice(6)) as StreamEvent;
          if (event.type === "meta") {
            if (event.sessionId) {
              setSessionId(event.sessionId);
              window.localStorage.setItem(STORAGE_KEY, event.sessionId);
            }
            if (event.sector) setDetectedSector(event.sector);
            setMessages((current) => current.map((item) => item.localId === assistantLocalId
              ? { ...item, sources: event.sources }
              : item));
          }
          if (event.type === "chunk" && event.text) {
            setMessages((current) => current.map((item) => item.localId === assistantLocalId
              ? { ...item, content: item.content + event.text, pending: true }
              : item));
          }
          if (event.type === "done") {
            setMessages((current) => current.map((item) => item.localId === assistantLocalId
              ? { ...item, serverId: event.messageId, sources: event.sources, pending: false, usedFallback: event.usedFallback }
              : item));
            setSuggestions(event.suggestions || []);
          }
          if (event.type === "error") throw new Error(event.message || "تعذر إكمال الرد.");
        }
        if (done) break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "صار خلل بسيط. جرّب مرة ثانية.";
      setMessages((current) => current.map((item) => item.localId === assistantLocalId
        ? { ...item, content: errorMessage, pending: false }
        : item));
    } finally {
      setIsSending(false);
    }
  };

  const submitFeedback = async (message: ChatMessage, rating: "positive" | "negative") => {
    if (!sessionId || !message.serverId || message.feedback) return;
    setMessages((current) => current.map((item) => item.localId === message.localId ? { ...item, feedback: rating } : item));
    try {
      await fetch("/api/assistant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messageId: message.serverId, rating }),
      });
    } catch {
      toast({ title: "تعذر حفظ التقييم", variant: "destructive" });
    }
  };

  const submitLead = async (event: FormEvent) => {
    event.preventDefault();
    if (!sessionId) {
      toast({ title: "ابدأ المحادثة أولًا عشان نربط طلبك باحتياجك.", variant: "destructive" });
      return;
    }
    setLeadSubmitting(true);
    try {
      const response = await fetch("/api/assistant/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, sessionId, sector: lead.sector || detectedSector }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "تعذر تسجيل الطلب.");
      setLeadSent(true);
      toast({ title: payload.message });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "تعذر تسجيل الطلب.", variant: "destructive" });
    } finally {
      setLeadSubmitting(false);
    }
  };

  const whatsappText = encodeURIComponent(`حياكم الله، بدأت محادثة مع مستشار موتفلكس وأبغى أكمل مع الفريق.${sectorTitle ? ` نشاطي: ${sectorTitle}.` : ""}`);

  return (
    <PageScaffold className="bg-[radial-gradient(circle_at_top_right,hsl(177_81%_30%_/_0.12),transparent_38%),radial-gradient(circle_at_bottom_left,hsl(45_76%_51%_/_0.12),transparent_35%)]">
      <SEOHead
        title="مستشار موتفلكس الذكي"
        description="اسأل مستشار موتفلكس الذكي باللهجة السعودية، واحصل على شرح عملي لإدارة العملاء والمقاسات والتصنيع والتركيب والفنيين بما يناسب نشاط منشأتك."
        keywords="مستشار موتفلكس, مساعد ذكي, إدارة المصانع, إدارة التصنيع والتركيب, السعودية"
        canonicalUrl="https://mutflex.com/smart-assistant"
      />
      <WebApplicationSchema
        name="مستشار موتفلكس الذكي"
        description="مستشار رقمي تفاعلي يشرح حلول موتفلكس لإدارة العملاء والمقاسات والتصنيع والتركيب حسب قطاع المنشأة."
        url="https://mutflex.com/smart-assistant"
        featureList={[
          "شرح حلول موتفلكس باللهجة السعودية",
          "تصور دورة العمل حسب قطاع المنشأة",
          "شرح إدارة العملاء والمقاسات والتصنيع والتركيب",
          "تأهيل الاحتياج وطلب التواصل مع الفريق",
        ]}
      />

      <section className="relative overflow-hidden pb-10 pt-28 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(177,81%,25%)] via-[hsl(177,81%,31%)] to-[hsl(45,76%,47%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_20%),radial-gradient(circle_at_80%_70%,white_0,transparent_22%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-2xl backdrop-blur-xl">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">صف لنا شغلك، ونبني لك التصور</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90 md:text-xl">
            مستشار سعودي يفهم نشاطك، يشخّص نقاط التعطيل، ويشرح لك كيف يربط موتفلكس العميل بالمقاسات والتصنيع والتركيب والتسليم.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            {["معلومات موثقة", "شرح حسب القطاع", "خصوصية وأمان"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                <Check className="h-4 w-4" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden border-2 shadow-2xl">
            <CardHeader className="border-b bg-card/90 py-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-white">
                    <Bot className="h-6 w-6" />
                    <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">مستشار موتفلكس</CardTitle>
                    <p className="text-sm text-muted-foreground">يسأل، يفهم، ثم يقترح المناسب</p>
                  </div>
                </div>
                {sectorTitle ? <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">فهمت نشاطك: {sectorTitle}</span> : null}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div ref={scrollRef} className="h-[560px] space-y-5 overflow-y-auto p-4 md:p-6" aria-live="polite">
                {messages.map((message) => (
                  <div key={message.localId} className={`assistant-message flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${message.role === "assistant" ? "bg-secondary text-white" : "bg-primary text-primary-foreground"}`}>
                      {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
                    </div>
                    <div className={`max-w-[88%] ${message.role === "user" ? "text-left" : "text-right"}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm md:text-base ${message.role === "assistant" ? "rounded-tr-sm border bg-card shadow-sm" : "rounded-tl-sm bg-primary text-primary-foreground"}`}>
                        {message.pending && !message.content ? (
                          <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> خلّني أفهم سؤالك...</span>
                        ) : <MessageText content={message.content} />}
                        {message.pending && message.content ? <span className="mr-1 inline-block h-4 w-1 animate-pulse bg-secondary" /> : null}
                      </div>

                      {message.sources?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.sources.map((source) => source.sourceUrl ? (
                            <Link key={source.slug} href={source.sourceUrl} className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
                              {source.title} <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : null)}
                        </div>
                      ) : null}

                      {message.role === "assistant" && message.usedFallback && !message.pending ? (
                        <p className="mt-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                          رد احتياطي من معلومات موتفلكس المحلية؛ الذكاء الكامل عبر OpenRouter غير متاح حاليًا.
                        </p>
                      ) : null}

                      {message.role === "assistant" && message.serverId && !message.pending ? (
                        <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                          <span className="ml-1 text-xs">هل الرد مفيد؟</span>
                          <button type="button" aria-label="الرد مفيد" onClick={() => submitFeedback(message, "positive")} className={`rounded-md p-1.5 hover:bg-muted ${message.feedback === "positive" ? "text-emerald-600" : ""}`}><ThumbsUp className="h-4 w-4" /></button>
                          <button type="button" aria-label="الرد غير مفيد" onClick={() => submitFeedback(message, "negative")} className={`rounded-md p-1.5 hover:bg-muted ${message.feedback === "negative" ? "text-destructive" : ""}`}><ThumbsDown className="h-4 w-4" /></button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t bg-muted/30 p-4 md:p-5">
                {suggestions.length ? (
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} disabled={isSending} className="shrink-0 rounded-full border bg-background px-4 py-2 text-sm transition-colors hover:border-secondary hover:text-secondary disabled:opacity-50">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
                <form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }} className="flex items-end gap-2">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder="اكتب سؤالك... مثال: عندي مصنع مطابخ ومشكلتي في المقاسات"
                    maxLength={2000}
                    rows={2}
                    className="min-h-[54px] resize-none bg-background"
                    aria-label="رسالتك للمستشار"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isSending} className="h-[54px] w-[54px] shrink-0 bg-secondary hover:bg-secondary/90" aria-label="إرسال">
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">قد تُحفظ المحادثة لتحسين الخدمة. لا تشارك بيانات سرية، والمعلومات التشغيلية النهائية والعروض الخاصة يؤكدها فريق موتفلكس.</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5 xl:sticky xl:top-24">
            <Card className="border-2">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Workflow className="h-5 w-5 text-secondary" /> كيف نخدمك؟</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                {[
                  ["1", "نفهم نشاطك وطريقة العمل"],
                  ["2", "نحدد نقاط التعطيل الفعلية"],
                  ["3", "نربطها بمميزات موتفلكس"],
                  ["4", "نعطيك سيناريو وخطوة تالية"],
                ].map(([number, label]) => (
                  <div key={number} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/10 font-bold text-secondary">{number}</span><span>{label}</span></div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-2">
              <CardHeader className="bg-gradient-to-l from-secondary/10 to-primary/10"><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-secondary" /> كمل مع الفريق</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-5">
                <p className="text-sm leading-6 text-muted-foreground">إذا وضحت الصورة، سجل بياناتك وبيوصل للفريق ملخص احتياجك من المحادثة.</p>
                <Button className="w-full bg-secondary hover:bg-secondary/90" onClick={() => setShowLeadForm((current) => !current)}>{leadSent ? "تم تسجيل طلبك" : "اطلب تواصل من الفريق"}</Button>
                <Button variant="outline" className="w-full border-[#25D366] text-[#128C4A] hover:bg-[#25D366]/10" asChild>
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`} target="_blank" rel="noreferrer"><MessageCircle className="ml-2 h-4 w-4" /> كمل على واتساب</a>
                </Button>
                <Button variant="ghost" className="w-full" asChild><Link href="/free-trial">ابدأ تجربة مجانية <ArrowLeft className="mr-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>

            {showLeadForm && !leadSent ? (
              <Card className="border-2 border-secondary/30">
                <CardHeader><CardTitle className="text-lg">بيانات التواصل</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={submitLead} className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="lead-name">الاسم</Label><Input id="lead-name" required minLength={2} value={lead.name} onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="lead-phone">رقم الجوال السعودي</Label><Input id="lead-phone" required dir="ltr" placeholder="05XXXXXXXX" value={lead.phone} onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="lead-company">اسم المنشأة</Label><Input id="lead-company" value={lead.company} onChange={(event) => setLead((current) => ({ ...current, company: event.target.value }))} /></div>
                    <div className="space-y-2">
                      <Label>القطاع</Label>
                      <Select value={lead.sector || detectedSector} onValueChange={(value) => setLead((current) => ({ ...current, sector: value }))}>
                        <SelectTrigger><SelectValue placeholder="اختر القطاع" /></SelectTrigger>
                        <SelectContent>{bootstrap?.sectors.map((sector) => <SelectItem key={sector.slug} value={sector.slug}>{sector.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>دورك</Label>
                      <Select value={lead.customerRole} onValueChange={(value) => setLead((current) => ({ ...current, customerRole: value }))}>
                        <SelectTrigger><SelectValue placeholder="اختر دورك" /></SelectTrigger>
                        <SelectContent>{bootstrap?.roles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label htmlFor="lead-pain">أكبر مشكلة عندكم</Label><Textarea id="lead-pain" rows={3} value={lead.painPoint} onChange={(event) => setLead((current) => ({ ...current, painPoint: event.target.value }))} /></div>
                    <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-muted-foreground">
                      <input type="checkbox" required checked={lead.consent} onChange={(event) => setLead((current) => ({ ...current, consent: event.target.checked }))} className="mt-1" />
                      أوافق على استخدام هذه البيانات للتواصل معي بخصوص موتفلكس.
                    </label>
                    <Button type="submit" className="w-full" disabled={leadSubmitting}>{leadSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null} إرسال الطلب</Button>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-600" /> بياناتك لا تُطلب إلا عند رغبتك بالتواصل</div>
          </div>
        </div>
      </section>

      <section className="border-y bg-card/70 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold text-secondary">شرح مبني على طبيعة شغلك</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">وش يقدر مستشار موتفلكس يوضح لك؟</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              المستشار ما يعطيك قائمة مميزات محفوظة؛ يبدأ من نشاط منشأتك والمشكلة التي تواجهها، ثم يربطها بدورة العمل المناسبة داخل موتفلكس. تقدر تسأله عن تنظيم العملاء، متابعة عروض الأسعار، تسجيل المقاسات، أو انتقال الطلب من التجهيز إلى التصنيع والتركيب والتسليم.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["فهم الاحتياج", "يبدأ بسؤالك عن القطاع وحجم التشغيل ونقطة التعطيل، حتى يكون الشرح مرتبطًا بواقع منشأتك بدل الكلام العام."],
              ["تصور دورة العمل", "يرسم لك سيناريو عملي من دخول العميل وحتى إغلاق المشروع، ويوضح أين تنتقل البيانات ومن المسؤول عن كل مرحلة."],
              ["شرح حسب القطاع", "يتعامل مع اختلاف احتياج مصانع الرخام والمطابخ والألمنيوم وشركات التشطيبات والمقاولات والقطاعات التي تعتمد على القياس والتركيب."],
              ["خطوة تالية واضحة", "بعد ما تتضح الصورة، يساعدك تحدد المميزات والباقات التي تحتاجها، أو يسجل طلب تواصل ليكمل معك فريق موتفلكس."],
            ].map(([title, description]) => (
              <Card key={title} className="border-secondary/15 bg-background/80">
                <CardContent className="p-6">
                  <h3 className="font-bold text-secondary">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <article className="space-y-5 leading-8 text-muted-foreground">
            <h2 className="text-3xl font-bold text-foreground">من السؤال إلى تصور تشغيلي قابل للتطبيق</h2>
            <p>
              لو كانت مشكلتك أن بيانات العميل موزعة بين الواتساب والملفات، يشرح لك المستشار كيف تجمع بيانات العميل ومشاريعه ومستنداته في مسار واحد. ولو كان التعطيل يبدأ بعد المعاينة، يوضح كيف تنتقل المقاسات والملاحظات إلى الفريق المسؤول بدون إعادة كتابة أو فقد تفاصيل مهمة. الهدف أن تفهم أثر النظام على يوم العمل، وليس مجرد معرفة أسماء الشاشات.
            </p>
            <p>
              في مرحلة التصنيع، تقدر تسأل عن متابعة حالة الطلبات، توزيع المسؤوليات، وتوفير رؤية أوضح للإدارة عن الأعمال المتأخرة والجارية. وفي مرحلة التركيب، يشرح لك كيف تساعد إدارة المهام والفرق الميدانية في متابعة المواعيد والتنفيذ والملاحظات حتى التسليم. الإجابة تتغير حسب القطاع الذي تذكره وحسب المشكلة التي تريد حلها أولًا.
            </p>
            <p>
              المستشار مفيد كذلك لو كنت في بداية المقارنة بين الحلول. اشرح له عدد الفروع أو الفرق وطريقة العمل الحالية، واسأله عن المميزات التي تحتاجها فعلًا. سيعطيك تصورًا مبدئيًا، بينما أي تخصيص خاص أو عرض تجاري أو تفاصيل تعاقدية نهائية يؤكدها فريق موتفلكس قبل اتخاذ القرار.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild><Link href="/features">استعرض مميزات موتفلكس</Link></Button>
              <Button variant="outline" asChild><Link href="/industries">تعرف على القطاعات</Link></Button>
              <Button variant="ghost" asChild><Link href="/pricing">راجع الباقات والأسعار</Link></Button>
            </div>
          </article>

          <article className="rounded-3xl border bg-muted/30 p-7 md:p-9">
            <h2 className="text-2xl font-bold">أسئلة تقدر تبدأ بها</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              {[
                "عندي مصنع مطابخ، كيف أرتب الطلب من المقاس إلى التصنيع والتركيب؟",
                "فريقي يتابع المشاريع على الواتساب، وش اللي بيتغير بعد استخدام موتفلكس؟",
                "عندي أكثر من فرع وفنيين ميدانيين، كيف أتابع المسؤوليات والتأخير؟",
                "وش الباقة المناسبة لمنشأة صغيرة؟ وهل نحتاج كل المميزات من البداية؟",
                "أبغى مثال كامل لدورة عمل شركة تشطيبات من العميل حتى التسليم.",
              ].map((question) => (
                <li key={question} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t pt-7">
              <h3 className="flex items-center gap-2 font-bold text-foreground"><ShieldCheck className="h-5 w-5 text-emerald-600" /> الدقة والخصوصية</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                يعتمد المستشار على معلومات موتفلكس المعتمدة، ويصرّح بوضوح عندما تحتاج المعلومة إلى تأكيد من الفريق. لا تشارك كلمات مرور أو بيانات مالية أو أسرار عمل داخل المحادثة. لن نطلب رقم جوالك إلا إذا قررت تسجيل طلب تواصل، وتُستخدم البيانات التي ترسلها لخدمتك ومتابعة احتياجك وفق سياسة الخصوصية.
              </p>
              <Link href="/privacy-policy" className="mt-4 inline-flex items-center font-semibold text-secondary hover:underline">اقرأ سياسة الخصوصية <ArrowLeft className="mr-2 h-4 w-4" /></Link>
            </div>
          </article>
        </div>
      </section>
    </PageScaffold>
  );
}
