const X_PIXEL_ID = "rec77";
const FREE_TRIAL_LEAD_EVENT_ID = "tw-rec77-red27";

type XPixelCommand = [command: string, id: string, parameters?: Record<string, unknown>];

type XPixelQueue = {
  (...command: XPixelCommand): void;
  exe?: (...command: XPixelCommand) => void;
  queue: XPixelCommand[];
  version: string;
};

declare global {
  interface Window {
    twq?: XPixelQueue;
  }
}

export function initializeXPixel() {
  if (typeof window === "undefined") return;

  if (!window.twq) {
    const twq = ((...command: XPixelCommand) => {
      if (twq.exe) {
        twq.exe(...command);
      } else {
        twq.queue.push(command);
      }
    }) as XPixelQueue;

    twq.version = "1.1";
    twq.queue = [];
    window.twq = twq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://static.ads-twitter.com/uwt.js";
    document.head.appendChild(script);
  }

  window.twq("config", X_PIXEL_ID);
}

export function trackFreeTrialLead(conversionId?: string | number) {
  if (typeof window === "undefined") return;

  initializeXPixel();
  window.twq?.("event", FREE_TRIAL_LEAD_EVENT_ID, {
    status: "completed",
    ...(conversionId !== undefined ? { conversion_id: String(conversionId) } : {}),
  });
}

