import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Maximize2, Send, X } from "lucide-react";
import { MessageText } from "./MessageText";
import { SaudiAgent, type AgentGesture } from "./SaudiAgent";
import { useAssistantChat, type ChatMessage } from "./useAssistantChat";
import "./agent.css";

export const AGENT_NAME = "سعد";

const WELCOME_MESSAGE: ChatMessage = {
  localId: "agent-welcome",
  role: "assistant",
  content: `حيّاك الله 👋 أنا ${AGENT_NAME}، مساعد موتفلكس الذكي. قلّي وش طبيعة شغلك أو وش المشكلة اللي تواجهك، وأشرح لك كيف يخدمكم موتفلكس.`,
};

const MUTE_KEY = "mutflex-agent-muted-until";
const GREETS_KEY = "mutflex-agent-greets-v1";
const MUTE_MS = 24 * 60 * 60 * 1000;
const MAX_GREETS_PER_SESSION = 2;
const WAVE_MS = 2600;

interface PageContext {
  key: string;
  greeting: string;
  prompt?: string;
}

function getPageContext(path: string): PageContext {
  if (path.startsWith("/pricing")) {
    return { key: "pricing", greeting: "محتار بين الباقات؟ قلّي وش نشاطك وكم حجم فريقك، وأقترح لك الأنسب.", prompt: "وش الباقة المناسبة لمنشأتي؟" };
  }
  if (path.startsWith("/features")) {
    return { key: "features", greeting: "تبغى أوريك كيف يمشي الطلب عندك من المعاينة والمقاسات لين التركيب؟", prompt: "اشرح لي دورة الطلب من المقاس للتركيب" };
  }
  if (path.startsWith("/industries")) {
    return { key: "industries", greeting: "قلّي وش قطاعك، وأشرح لك كيف يشتغل موتفلكس عندكم بالضبط.", prompt: "كيف يخدم موتفلكس قطاعي؟" };
  }
  if (path.startsWith("/blog")) {
    return { key: "blog", greeting: "عندك سؤال عن اللي تقراه؟ اسألني وأجاوبك من واقع الشغل.", prompt: "كيف أطبق هالكلام في منشأتي؟" };
  }
  if (path.startsWith("/free-trial")) {
    return { key: "trial", greeting: "لو عندك أي سؤال قبل التسجيل، أنا موجود وأجاوبك بسرعة." };
  }
  if (path.startsWith("/contact")) {
    return { key: "contact", greeting: "تبغى جواب سريع قبل ما تتواصل مع الفريق؟ اسألني." };
  }
  if (path.startsWith("/smart-assistant")) {
    return { key: "assistant-page", greeting: "هلا والله! اكتب لي تحت وش طبيعة شغلك ونبدأ 👇" };
  }
  return { key: "home", greeting: `حيّاك الله! 👋 أنا ${AGENT_NAME} من موتفلكس. تبغى أشرح لك وش يسوي النظام لشغلك في دقيقة؟`, prompt: "اشرح لي موتفلكس من البداية" };
}

function readGreets(): { count: number; keys: string[] } {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(GREETS_KEY) || "null");
    if (parsed && typeof parsed.count === "number" && Array.isArray(parsed.keys)) return parsed;
  } catch {
    // ignore
  }
  return { count: 0, keys: [] };
}

function writeGreets(value: { count: number; keys: string[] }) {
  try {
    window.sessionStorage.setItem(GREETS_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function isMuted(): boolean {
  try {
    return Number(window.localStorage.getItem(MUTE_KEY) || 0) > Date.now();
  } catch {
    return false;
  }
}

function muteForADay() {
  try {
    window.localStorage.setItem(MUTE_KEY, String(Date.now() + MUTE_MS));
  } catch {
    // ignore
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function FloatingAssistant() {
  const [location] = useLocation();
  const [gesture, setGesture] = useState<AgentGesture>("rest");
  const [bubble, setBubble] = useState<{ full: string; shown: string } | null>(null);
  const [talking, setTalking] = useState(false);
  const [unread, setUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lookAt, setLookAt] = useState<{ x: number; y: number } | null>(null);
  const waveTimer = useRef(0);
  const lastWave = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chat = useAssistantChat({
    welcome: WELCOME_MESSAGE,
    onOpenTrialForm: () => chat.setShowTrialCta(true),
  });

  const hidden = location.startsWith("/admin") || location.startsWith("/login");
  const onAssistantPage = location.startsWith("/smart-assistant");
  const context = getPageContext(location);

  const wave = useCallback(() => {
    if (prefersReducedMotion()) return;
    lastWave.current = Date.now();
    window.clearTimeout(waveTimer.current);
    setGesture("wave");
    waveTimer.current = window.setTimeout(() => setGesture("rest"), WAVE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(waveTimer.current), []);

  // Contextual greeting: once per page type, at most twice per visit, never after "لاحقاً".
  useEffect(() => {
    if (hidden || open || isMuted()) return;
    const greets = readGreets();
    if (greets.count >= MAX_GREETS_PER_SESSION || greets.keys.includes(context.key)) return;
    const delay = greets.count === 0 ? 4000 : 9000;
    const timer = window.setTimeout(() => {
      // Never interrupt someone who is already typing (e.g. on the assistant page).
      if (isMuted() || document.activeElement?.matches("input, textarea")) return;
      writeGreets({ count: greets.count + 1, keys: [...greets.keys, context.key] });
      wave();
      setUnread(true);
      setBubble({ full: context.greeting, shown: "" });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [context.key, context.greeting, hidden, open, wave]);

  // Typewriter for the speech bubble; mouth moves only while typing.
  useEffect(() => {
    if (!bubble || bubble.shown === bubble.full) {
      setTalking(false);
      return;
    }
    const characters = Array.from(bubble.full);
    if (prefersReducedMotion()) {
      setBubble({ full: bubble.full, shown: bubble.full });
      return;
    }
    setTalking(true);
    const timer = window.setTimeout(() => {
      const next = characters.slice(0, Array.from(bubble.shown).length + 2).join("");
      setBubble((current) => current && current.full === bubble.full ? { ...current, shown: next } : current);
    }, 38);
    return () => window.clearTimeout(timer);
  }, [bubble]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages, open]);

  // While the panel is open the agent looks up at it.
  useEffect(() => {
    if (!open) {
      setLookAt(null);
      return;
    }
    const frame = requestAnimationFrame(() => {
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) setLookAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      inputRef.current?.focus({ preventScroll: true });
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (hidden) return null;

  const openChat = () => {
    setBubble(null);
    setUnread(false);
    if (onAssistantPage) {
      const pageInput = document.getElementById("assistant-input");
      pageInput?.scrollIntoView({ behavior: "smooth", block: "center" });
      pageInput?.focus({ preventScroll: true });
      wave();
      return;
    }
    setOpen(true);
  };

  const dismissBubble = () => {
    setBubble(null);
    setUnread(false);
    muteForADay();
  };

  const send = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;
    setInput("");
    void chat.sendMessage(message);
  };

  const hasConversation = chat.messages.some((message) => message.role === "user");
  const suggestions = !hasConversation && context.prompt
    ? [context.prompt, ...chat.suggestions.filter((item) => item !== context.prompt)].slice(0, 4)
    : chat.suggestions;

  return (
    <>
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`محادثة ${AGENT_NAME}، مساعد موتفلكس الذكي`}
          className="agent-panel-in fixed bottom-[146px] right-4 z-[60] flex h-[min(560px,calc(100vh-180px))] w-[380px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl max-sm:inset-x-2 max-sm:bottom-2 max-sm:top-16 max-sm:h-auto max-sm:w-auto"
        >
          <div className="flex items-center gap-3 bg-secondary px-4 py-3 text-white">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white">
              <SaudiAgent variant="face" talking={chat.isSending} className="h-full w-full" />
              <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-secondary bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">{AGENT_NAME}</p>
              <p className="text-xs text-white/80">مساعد موتفلكس الذكي · متصل الآن</p>
            </div>
            <Link href="/smart-assistant" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/15 hover:text-white" aria-label="افتح المستشار بالكامل" title="افتح المستشار بالكامل">
              <Maximize2 className="h-4 w-4" />
            </Link>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/85 transition-colors hover:bg-white/15 hover:text-white" aria-label="إغلاق المحادثة">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3" aria-live="polite">
            {chat.messages.map((message) => (
              <div key={message.localId} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${message.role === "assistant" ? "rounded-tr-sm border bg-card shadow-sm" : "rounded-tl-sm bg-primary text-primary-foreground"}`}>
                  {message.pending && !message.content ? (
                    <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> خلّني أفهم سؤالك...</span>
                  ) : <MessageText content={message.content} />}
                  {message.role === "assistant" && message.usedFallback && !message.pending ? (
                    <p className="mt-2 text-[11px] leading-5 text-amber-800">رد مختصر من معلومات موتفلكس المحلية.</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t bg-background p-3">
            {suggestions.length && !chat.isSending ? (
              <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => send(suggestion)} className="shrink-0 rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:border-secondary hover:text-secondary">
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
            {chat.showTrialCta ? (
              <Link href="/free-trial" onClick={() => setOpen(false)} className="mb-2 flex h-10 w-full items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-white transition-colors hover:bg-secondary/90">
                ابدأ تجربتك المجانية
              </Link>
            ) : null}
            <form onSubmit={(event) => { event.preventDefault(); send(); }} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="اكتب سؤالك هنا..."
                maxLength={2000}
                rows={1}
                className="min-h-[44px] flex-1 resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                aria-label={`رسالتك إلى ${AGENT_NAME}`}
              />
              <button type="submit" disabled={!input.trim() || chat.isSending} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-white transition-colors hover:bg-secondary/90 disabled:opacity-50" aria-label="إرسال">
                {chat.isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">مساعد ذكي — التفاصيل النهائية والعروض يؤكدها فريق موتفلكس.</p>
          </div>
        </div>
      ) : null}

      {bubble && !open ? (
        <div role="status" className="agent-bubble-in fixed bottom-[92px] right-[96px] z-[60] w-[min(280px,calc(100vw-108px))] sm:bottom-[80px] sm:right-[124px]">
          <div className="relative rounded-2xl rounded-br-sm border bg-background p-4 shadow-xl">
            <button type="button" onClick={dismissBubble} className="absolute left-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="إخفاء الرسالة">
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="mb-1 text-xs font-bold text-secondary">{AGENT_NAME} · مساعد موتفلكس</p>
            <p className="min-h-[3rem] pl-4 text-sm leading-6 text-foreground">{bubble.shown}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={openChat} className="rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-secondary/90">
                إيه، ساعدني
              </button>
              <button type="button" onClick={dismissBubble} className="rounded-full border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
                لاحقاً
              </button>
            </div>
            <span className="absolute -right-[7px] bottom-4 h-3.5 w-3.5 rotate-45 border-r border-t bg-background" aria-hidden="true" />
          </div>
        </div>
      ) : null}

      {/* Static position: disc centre lines up with the WhatsApp button (bottom-6 / left-6) on every screen. */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && gesture === "rest" && Date.now() - lastWave.current > 4000) wave();
        }}
        className={`fixed bottom-[13px] right-[19px] z-[60] w-[76px] rounded-full outline-none focus-visible:ring-4 focus-visible:ring-secondary/40 sm:bottom-0 sm:right-[18px] sm:w-[104px] ${open ? "max-sm:hidden" : ""}`}
        aria-label={open ? "إغلاق محادثة المساعد" : `تحدث مع ${AGENT_NAME}، مساعد موتفلكس الذكي`}
        aria-expanded={open}
      >
        <SaudiAgent gesture={gesture} talking={talking} lookAt={lookAt} className="block h-auto w-full drop-shadow-xl" />
        {unread ? (
          <span className="absolute left-[14%] top-[22%] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F04B4B] px-1 text-[10px] font-bold text-white ring-2 ring-background">1</span>
        ) : null}
        <span className="absolute bottom-[12%] left-[16%] h-3 w-3 rounded-full border-2 border-white bg-emerald-400" aria-hidden="true" />
      </button>
    </>
  );
}
