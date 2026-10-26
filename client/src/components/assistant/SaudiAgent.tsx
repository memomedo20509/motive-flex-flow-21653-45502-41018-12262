import { useEffect, useId, useRef } from "react";

/*
 * Hand-drawn SVG agent: Saudi man in white thobe, ghutra and agal, inside a teal
 * brand disc. Eyes and head follow the pointer; the arm waves on demand.
 * Resting pose holds still — only blinks and pointer-driven motion.
 */

const SKIN = "#D7A27B";
const SKIN_SHADE = "#C38A63";
const HAIR = "#2B201A";
const CLOTH = "#FFFFFF";
const CLOTH_SHADE = "#DDF5F2";
const AGAL = "#052F2D";
const TEAL = "#0F9188";
const TEAL_DEEP = "#08746E";
const GOLD = "#DFBA34";

const FACE_CENTER = { x: 80, y: 92 };
const VIEW = { w: 160, h: 190 };

export type AgentGesture = "rest" | "wave";

interface SaudiAgentProps {
  gesture?: AgentGesture;
  talking?: boolean;
  variant?: "full" | "face";
  className?: string;
  /** Screen point to look at instead of the pointer (e.g. the open chat panel). */
  lookAt?: { x: number; y: number } | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SaudiAgent({ gesture = "rest", talking = false, variant = "full", className, lookAt = null }: SaudiAgentProps) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const lookAtRef = useRef(lookAt);
  lookAtRef.current = lookAt;

  // Pointer tracking: eased toward the target, loop stops once settled.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const target = { x: 0, y: 0.25 };
    const current = { x: 0, y: 0.25 };
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;

    const computeTarget = () => {
      const point = lookAtRef.current || pointer;
      if (!point) return;
      const rect = svg.getBoundingClientRect();
      const viewBox = svg.viewBox.baseVal;
      const cx = rect.left + ((FACE_CENTER.x - viewBox.x) / viewBox.width) * rect.width;
      const cy = rect.top + ((FACE_CENTER.y - viewBox.y) / viewBox.height) * rect.height;
      target.x = clamp((point.x - cx) / 420, -1, 1);
      target.y = clamp((point.y - cy) / 320, -1, 1);
    };

    const tick = () => {
      computeTarget();
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      headRef.current?.setAttribute(
        "transform",
        `translate(${(current.x * 2.6).toFixed(2)} ${(current.y * 1.6).toFixed(2)}) rotate(${(current.x * 4).toFixed(2)} ${FACE_CENTER.x} ${FACE_CENTER.y + 20})`,
      );
      pupilsRef.current?.setAttribute(
        "transform",
        `translate(${(current.x * 2.4).toFixed(2)} ${(current.y * 2.2).toFixed(2)})`,
      );
      const settled = Math.abs(target.x - current.x) < 0.002 && Math.abs(target.y - current.y) < 0.002;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onPointer = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      wake();
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    wake();
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", wake);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Re-aim when an explicit look target is set or cleared.
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, [lookAt?.x, lookAt?.y]);

  // Natural blinking at irregular intervals.
  useEffect(() => {
    let timer = 0;
    const blink = () => {
      const eyes = eyesRef.current;
      if (eyes) {
        eyes.classList.add("agent-blink");
        window.setTimeout(() => eyes.classList.remove("agent-blink"), 150);
      }
      timer = window.setTimeout(blink, 2600 + Math.random() * 3800);
    };
    timer = window.setTimeout(blink, 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const isFace = variant === "face";
  const viewBox = isFace ? "34 30 92 92" : `0 0 ${VIEW.w} ${VIEW.h}`;

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={className}
      aria-hidden="true"
      focusable="false"
      data-gesture={gesture}
      data-talking={talking ? "true" : "false"}
    >
      <defs>
        <linearGradient id={`${uid}-disc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={TEAL} />
          <stop offset="100%" stopColor={TEAL_DEEP} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.35" r="0.6">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="80" cy="108" r="70" />
        </clipPath>
      </defs>

      {/* Brand disc */}
      <circle cx="80" cy="108" r="70" fill={isFace ? CLOTH_SHADE : `url(#${uid}-disc)`} />
      {!isFace ? <circle cx="80" cy="108" r="70" fill={`url(#${uid}-glow)`} /> : null}
      {!isFace ? <circle cx="80" cy="108" r="68.5" fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1.5" /> : null}

      <g clipPath={`url(#${uid}-clip)`}>
        {/* Thobe */}
        <path d="M14,190 C16,162 36,147 62,143 L98,143 C124,147 144,162 146,190 Z" fill={CLOTH} />
        <path d="M14,190 C16,162 36,147 62,143 L66,143 C46,150 30,165 28,190 Z" fill={CLOTH_SHADE} />
        <path d="M80,143 L80,190" stroke={CLOTH_SHADE} strokeWidth="1.6" />
        <circle cx="80" cy="152" r="1.7" fill={GOLD} />
        <circle cx="80" cy="161" r="1.7" fill={GOLD} />
        {/* Name badge */}
        <rect x="98" y="158" width="20" height="12" rx="2.5" fill={TEAL} />
        <rect x="101.5" y="161.5" width="9" height="1.8" rx="0.9" fill="#FFFFFF" />
        <rect x="101.5" y="165" width="13" height="1.8" rx="0.9" fill={GOLD} />

        <g ref={headRef}>
          {/* Ghutra drape behind the face */}
          <path
            d="M80,34 C52,34 38,54 38,88 C38,114 34,134 28,152 C42,159 58,155 67,146 L93,146 C102,155 118,159 132,152 C126,134 122,114 122,88 C122,54 108,34 80,34 Z"
            fill={CLOTH}
          />
          <path d="M38,88 C38,114 34,134 28,152 C34,155 40,156 46,155 C44,136 46,112 50,90 Z" fill={CLOTH_SHADE} />
          <path d="M122,88 C122,114 126,134 132,152 C126,155 120,156 114,155 C116,136 114,112 110,90 Z" fill={CLOTH_SHADE} />

          {/* Neck + collar */}
          <rect x="71" y="116" width="18" height="24" rx="6" fill={SKIN_SHADE} />
          <path d="M66,140 C72,146 88,146 94,140 L94,145 C88,151 72,151 66,145 Z" fill={CLOTH} stroke={CLOTH_SHADE} strokeWidth="1.2" />

          {/* Face */}
          <ellipse cx="80" cy="93" rx="23" ry="27" fill={SKIN} />
          <ellipse cx="66" cy="102" rx="4.5" ry="2.6" fill="#E08C7A" opacity="0.28" />
          <ellipse cx="94" cy="102" rx="4.5" ry="2.6" fill="#E08C7A" opacity="0.28" />

          {/* Beard + mustache */}
          <path d="M57,96 C57,116 67,123 80,123 C93,123 103,116 103,96 C101,109 93,116 80,116 C67,116 59,109 57,96 Z" fill={HAIR} />
          <path d="M69.5,107.5 C73,104 77.5,104.5 80,106.3 C82.5,104.5 87,104 90.5,107.5 C86,108.8 82.5,108.6 80,107.6 C77.5,108.6 74,108.8 69.5,107.5 Z" fill={HAIR} />

          {/* Mouth: smile at rest, open while talking */}
          <path className="agent-mouth-smile" d="M74,111.2 Q80,115.6 86,111.2" fill="none" stroke="#7A3B2E" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse className="agent-mouth-open" cx="80" cy="112.2" rx="4.2" ry="2.8" fill="#7A3B2E" />

          {/* Nose */}
          <path d="M80,92 C78.6,97 77.6,99.5 79.2,100.6 C80.2,101.2 81.6,100.9 82.2,100.2" fill="none" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d="M63.5,81.5 C67,78.6 71.5,78.4 75,80.4" fill="none" stroke={HAIR} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M85,80.4 C88.5,78.4 93,78.6 96.5,81.5" fill="none" stroke={HAIR} strokeWidth="2.6" strokeLinecap="round" />

          {/* Eyes */}
          <g ref={eyesRef} className="agent-eyes">
            <ellipse cx="70" cy="89.3" rx="5.2" ry="5.3" fill="#FFFFFF" />
            <ellipse cx="90" cy="89.3" rx="5.2" ry="5.3" fill="#FFFFFF" />
            <g ref={pupilsRef}>
              <circle cx="70" cy="89.5" r="3.3" fill="#2A1B14" />
              <circle cx="90" cy="89.5" r="3.3" fill="#2A1B14" />
              <circle cx="71.2" cy="88.2" r="1.05" fill="#FFFFFF" />
              <circle cx="91.2" cy="88.2" r="1.05" fill="#FFFFFF" />
            </g>
            <path d="M64.4,86.2 Q70,82.6 75.6,86.2" fill="none" stroke={SKIN_SHADE} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M84.4,86.2 Q90,82.6 95.6,86.2" fill="none" stroke={SKIN_SHADE} strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Ghutra front folds framing the face */}
          <path d="M57,76 C52,96 53,118 62,140 L54,146 C44,124 44,98 51,76 Z" fill={CLOTH} />
          <path d="M103,76 C108,96 107,118 98,140 L106,146 C116,124 116,98 109,76 Z" fill={CLOTH} />
          <path d="M51,78 C53,64 64,58 80,58 C96,58 107,64 109,78 C101,71 92,68.5 80,68.5 C68,68.5 59,71 51,78 Z" fill={CLOTH} />
          <path d="M53,77 C61,70.6 70,68.6 80,68.6 C90,68.6 99,70.6 107,77" fill="none" stroke={CLOTH_SHADE} strokeWidth="1.3" />

          {/* Crown volume + agal: two cords resting on the head, front arcs only */}
          <path d="M61,41 C70,37 90,37 99,41" fill="none" stroke={CLOTH_SHADE} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M52,54 C61,61 99,61 108,54" fill="none" stroke={AGAL} strokeWidth="4" strokeLinecap="round" />
          <path d="M51,60 C60,67 100,67 109,60" fill="none" stroke={AGAL} strokeWidth="4.2" strokeLinecap="round" />
        </g>
      </g>

      {/* Waving arm (outside the clip so it can break the frame) */}
      {!isFace ? (
        <g className="agent-arm" style={{ transformOrigin: "46px 152px" }}>
          <g transform="translate(46 152)">
            <path d="M-11,6 L-9,-42 C-9,-47 9,-47 9,-42 L11,6 Z" fill={CLOTH} stroke={CLOTH_SHADE} strokeWidth="1.4" />
            <rect x="-9.6" y="-48" width="19.2" height="6" rx="2" fill={CLOTH} stroke={CLOTH_SHADE} strokeWidth="1.4" />
            <ellipse cx="-9.5" cy="-55" rx="3" ry="6" transform="rotate(-32 -9.5 -55)" fill={SKIN} />
            <rect x="-7.4" y="-73" width="3.6" height="14" rx="1.8" fill={SKIN} />
            <rect x="-3.4" y="-76" width="3.6" height="17" rx="1.8" fill={SKIN} />
            <rect x="0.6" y="-75" width="3.6" height="16" rx="1.8" fill={SKIN} />
            <rect x="4.4" y="-71" width="3.4" height="12" rx="1.7" fill={SKIN} />
            <ellipse cx="0" cy="-56" rx="8.4" ry="8.8" fill={SKIN} />
            <path d="M-4,-53 C-1,-51 2,-51 5,-53" fill="none" stroke={SKIN_SHADE} strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </g>
      ) : null}
    </svg>
  );
}
