import { useEffect, useState } from "react";
import type { AssistantPage } from "@shared/schema";

export interface AssistantSource {
  slug: string;
  title: string;
  type: string;
  sector?: string | null;
  sourceUrl?: string | null;
}

export interface ChatMessage {
  localId: string;
  serverId?: number;
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
  pending?: boolean;
  feedback?: "positive" | "negative";
  usedFallback?: boolean;
  /** UI-only marker (e.g. "you are now on page X"); never sent as history. */
  kind?: "page";
}

export interface SendOptions {
  /** Snapshot of the page the visitor is looking at. */
  page?: AssistantPage;
  /** Ask the assistant to introduce the current page; the prompt itself is not shown. */
  pageIntro?: boolean;
}

export interface BootstrapData {
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
  showTrialCta?: boolean;
  openTrialForm?: boolean;
}

export const ASSISTANT_STORAGE_KEY = "mutflex-assistant-session-v1";
const FALLBACK_SUGGESTIONS = ["اشرح لي موتفلكس من البداية", "عندي مصنع رخام", "وش الأسعار؟"];

export function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredSession(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(ASSISTANT_STORAGE_KEY) || "";
    return /^[a-zA-Z0-9_-]{8,64}$/.test(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function storeSession(sessionId: string) {
  try {
    window.localStorage.setItem(ASSISTANT_STORAGE_KEY, sessionId);
  } catch {
    // Private mode or blocked storage: the chat still works for this page view.
  }
}

interface UseAssistantChatOptions {
  welcome: ChatMessage;
  onOpenTrialForm?: () => void;
}

/** Streaming chat state shared by the smart-assistant page and the floating agent. */
export function useAssistantChat({ welcome, onOpenTrialForm }: UseAssistantChatOptions) {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [sessionId, setSessionId] = useState<string | undefined>(readStoredSession);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [detectedSector, setDetectedSector] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [showTrialCta, setShowTrialCta] = useState(false);

  useEffect(() => {
    fetch("/api/assistant/bootstrap")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("bootstrap failed")))
      .then((data: BootstrapData) => {
        setBootstrap(data);
        setSuggestions(data.quickPrompts.slice(0, 4));
      })
      .catch(() => {
        setSuggestions(FALLBACK_SUGGESTIONS);
      });
  }, []);

  const sendMessage = async (rawMessage: string, options: SendOptions = {}) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    setSuggestions([]);
    setIsSending(true);
    const userMessage: ChatMessage = { localId: makeLocalId("user"), role: "user", content: message };
    const assistantLocalId = makeLocalId("assistant");
    setMessages((current) => [
      ...current,
      ...(options.pageIntro ? [] : [userMessage]),
      { localId: assistantLocalId, role: "assistant", content: "", pending: true },
    ]);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId,
          page: options.page,
          pageIntro: options.pageIntro,
          history: messages
            .filter((item) => item.localId !== welcome.localId && !item.kind && item.content.trim())
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
              storeSession(event.sessionId);
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
            if (event.showTrialCta) setShowTrialCta(true);
            if (event.openTrialForm) onOpenTrialForm?.();
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

  return {
    bootstrap,
    messages,
    setMessages,
    sessionId,
    setSessionId,
    suggestions,
    detectedSector,
    isSending,
    showTrialCta,
    setShowTrialCta,
    sendMessage,
  };
}
