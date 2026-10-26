import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

/*
 * Where the floating agent sits and how the visitor drags it.
 * Geometry is based on the SaudiAgent viewBox (160x190) and its brand disc
 * (centre 80,108 · radius 70): the disc, not the svg box, is what lines up and stays on screen.
 */

const POS_KEY = "mutflex-agent-pos-v1";
const VIEW_W = 160;
const VIEW_H = 190;
const DISC = { cx: 80, cy: 108, r: 70 };
const EDGE = 8;
const DRAG_THRESHOLD = 6;
const PANEL_W = 380;
const PANEL_MAX_H = 560;
const PANEL_MIN_H = 320;

interface Point {
  x: number;
  y: number;
}

interface Viewport {
  w: number;
  h: number;
}

function viewport(): Viewport {
  return { w: document.documentElement.clientWidth, h: window.innerHeight };
}

function readSaved(): Point | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(POS_KEY) || "null");
    if (parsed && typeof parsed.fx === "number" && typeof parsed.fy === "number") return { x: parsed.fx, y: parsed.fy };
  } catch {
    // ignore
  }
  return null;
}

function writeSaved(value: Point | null) {
  try {
    if (value) window.localStorage.setItem(POS_KEY, JSON.stringify({ fx: value.x, fy: value.y }));
    else window.localStorage.removeItem(POS_KEY);
  } catch {
    // ignore
  }
}

/** Top-left of the agent box so its disc centre lands on (cx, cy), kept fully on screen. */
function placeDisc(cx: number, cy: number, width: number, vp: Viewport): Point {
  const scale = width / VIEW_W;
  const r = DISC.r * scale;
  const x = Math.min(Math.max(cx, r + EDGE), vp.w - r - EDGE);
  const y = Math.min(Math.max(cy, r + EDGE), vp.h - r - EDGE);
  return { x: x - DISC.cx * scale, y: y - DISC.cy * scale };
}

/** Default spot: disc centred on the WhatsApp button's height, mirroring its side margin. */
function defaultDisc(width: number, vp: Viewport): Point {
  const r = DISC.r * (width / VIEW_W);
  const whatsapp = document.querySelector('[data-testid="button-whatsapp"]')?.getBoundingClientRect();
  if (whatsapp && whatsapp.width) {
    return { x: vp.w - whatsapp.left - r, y: whatsapp.top + whatsapp.height / 2 };
  }
  return { x: vp.w - 24 - r, y: vp.h - 52 };
}

export function useAgentPlacement(active: boolean) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [vp, setVp] = useState<Viewport>({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState<Point | null>(null);
  const [custom, setCustom] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; startX: number; startY: number; origin: Point; last: Point; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const layout = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const nextVp = viewport();
    const nextWidth = button.offsetWidth;
    const saved = readSaved();
    const disc = saved ? { x: saved.x * nextVp.w, y: saved.y * nextVp.h } : defaultDisc(nextWidth, nextVp);
    setVp(nextVp);
    setWidth(nextWidth);
    setCustom(Boolean(saved));
    setPos(placeDisc(disc.x, disc.y, nextWidth, nextVp));
  }, []);

  useLayoutEffect(() => {
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [layout, active]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !pos) return;
    drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, origin: pos, last: pos, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      current.moved = true;
      setDragging(true);
    }
    const scale = width / VIEW_W;
    const next = placeDisc(
      current.origin.x + dx + DISC.cx * scale,
      current.origin.y + dy + DISC.cy * scale,
      width,
      vp,
    );
    current.last = next;
    // Move the DOM directly while dragging; React state is committed on drop.
    event.currentTarget.style.left = `${next.x}px`;
    event.currentTarget.style.top = `${next.y}px`;
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    if (!current.moved) return;
    suppressClick.current = true;
    const scale = width / VIEW_W;
    writeSaved({
      x: (current.last.x + DISC.cx * scale) / vp.w,
      y: (current.last.y + DISC.cy * scale) / vp.h,
    });
    setPos(current.last);
    setCustom(true);
    setDragging(false);
  };

  /** True once after a drag so the drop does not also count as a click. */
  const consumeDragClick = () => {
    const wasDrag = suppressClick.current;
    suppressClick.current = false;
    return wasDrag;
  };

  const reset = () => {
    writeSaved(null);
    layout();
  };

  const scale = width / VIEW_W;
  const geometry = pos && width ? {
    left: pos.x,
    right: pos.x + width,
    cx: pos.x + DISC.cx * scale,
    cy: pos.y + DISC.cy * scale,
    discTop: pos.y + (DISC.cy - DISC.r) * scale,
    discBottom: pos.y + (DISC.cy + DISC.r) * scale,
  } : null;

  const onRight = geometry ? geometry.cx > vp.w / 2 : true;
  const inLowerHalf = geometry ? geometry.cy > vp.h / 2 : true;

  let bubbleStyle: CSSProperties | undefined;
  let bubbleTail: "left" | "right" | null = null;
  if (geometry) {
    const room = onRight ? geometry.left + 4 - EDGE : vp.w - geometry.right + 4 - EDGE;
    const vertical: CSSProperties = inLowerHalf
      ? { bottom: vp.h - geometry.discTop + 6 }
      : { top: geometry.discBottom + 6 };
    if (room >= 200) {
      bubbleTail = onRight ? "right" : "left";
      bubbleStyle = {
        ...vertical,
        width: Math.min(280, room),
        ...(onRight ? { right: vp.w - geometry.left - 4 } : { left: geometry.right - 4 }),
      };
    } else {
      bubbleStyle = { ...vertical, left: EDGE, right: EDGE };
    }
  }

  let panelStyle: CSSProperties | undefined;
  if (geometry) {
    const panelW = Math.min(PANEL_W, vp.w - EDGE * 2);
    const roomAbove = geometry.discTop - 12 - EDGE;
    const roomBelow = vp.h - geometry.discBottom - 12 - EDGE;
    const above = roomAbove >= roomBelow;
    const room = above ? roomAbove : roomBelow;
    const clampX = (x: number) => Math.min(Math.max(x, EDGE), vp.w - panelW - EDGE);
    if (room >= PANEL_MIN_H) {
      panelStyle = {
        width: panelW,
        height: Math.min(PANEL_MAX_H, room),
        left: clampX(onRight ? geometry.right - panelW : geometry.left),
        ...(above ? { bottom: vp.h - geometry.discTop + 12 } : { top: geometry.discBottom + 12 }),
      };
    } else {
      // Short screens: open beside the agent instead of above/below it.
      const height = Math.min(PANEL_MAX_H, vp.h - EDGE * 2);
      panelStyle = {
        width: panelW,
        height,
        top: Math.min(Math.max(geometry.cy - height / 2, EDGE), vp.h - height - EDGE),
        left: clampX(onRight ? geometry.left - panelW - 8 : geometry.right + 8),
      };
    }
  }

  return {
    buttonRef,
    buttonStyle: pos
      ? ({ left: pos.x, top: pos.y } satisfies CSSProperties)
      : ({ right: 16, bottom: 16, visibility: "hidden" } satisfies CSSProperties),
    bubbleStyle,
    bubbleTail,
    bubbleBelow: !inLowerHalf,
    panelStyle,
    custom,
    isPhone: vp.w > 0 && vp.w < 640,
    dragging,
    reset,
    consumeDragClick,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag },
  };
}
