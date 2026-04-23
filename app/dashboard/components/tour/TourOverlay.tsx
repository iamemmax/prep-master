"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { useTour } from "../../util/tour/TourContext";
import { TourStep } from "../../util/tour/tourSteps";

interface Rect { x: number; y: number; w: number; h: number; }

const PADDING = 8;
const TOOLTIP_W = 320;
const TOOLTIP_GAP = 14;

export default function TourOverlay() {
  const { active, currentStep } = useTour();
  // Only mount the heavy work (effects, DOM polling) when the tour is
  // actually running. Keeping the gate here means no setState-in-effect for
  // the inactive case.
  if (!active || !currentStep) return null;
  return <TourOverlayActive step={currentStep} />;
}

function TourOverlayActive({ step }: { step: TourStep }) {
  const { stepIndex, totalSteps, next, prev, skip, finish } = useTour();
  const pathname = usePathname();
  const [rect, setRect] = useState<Rect | null>(null);
  const retryRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    let attempts = 0;
    const find = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const r = el.getBoundingClientRect();
        setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
      } else if (attempts < 30) {
        attempts += 1;
        retryRef.current = window.setTimeout(find, 100);
      } else {
        // Target never appeared — fall back to a centered tooltip so the tour
        // doesn't stall silently.
        setRect(null);
      }
    };
    find();
    return () => {
      if (retryRef.current != null) window.clearTimeout(retryRef.current);
    };
  }, [step, pathname]);

  useEffect(() => {
    const reposition = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
    };
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [step]);

  if (typeof document === "undefined") return null;

  const isLast = stepIndex === totalSteps - 1;
  const isFirst = stepIndex === 0;

  const hasTarget = rect !== null;
  const spotlight = rect
    ? { left: rect.x - PADDING, top: rect.y - PADDING, width: rect.w + PADDING * 2, height: rect.h + PADDING * 2 }
    : null;

  let tooltipStyle: React.CSSProperties;
  if (rect) {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const spaceBelow = vh - (rect.y + rect.h);
    const spaceAbove = rect.y;
    const placeBelow = spaceBelow > 200 || spaceBelow > spaceAbove;
    const top = placeBelow
      ? rect.y + rect.h + TOOLTIP_GAP + PADDING
      : Math.max(16, rect.y - TOOLTIP_GAP - PADDING - 220);
    const rawLeft = rect.x + rect.w / 2 - TOOLTIP_W / 2;
    const left = Math.max(16, Math.min(rawLeft, vw - TOOLTIP_W - 16));
    tooltipStyle = { top, left, width: TOOLTIP_W };
  } else {
    tooltipStyle = {
      top: "50%",
      left: "50%",
      width: TOOLTIP_W,
      transform: "translate(-50%, -50%)",
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-9999 pointer-events-none">
      {/* Darkening overlay with a clipped-out hole for the spotlight */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onClick={skip}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={14}
                ry={14}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 43, 0.72)"
          mask="url(#tour-mask)"
        />
      </svg>

      {spotlight && (
        <div
          className="absolute rounded-2xl ring-2 ring-[#F7C948] pointer-events-none transition-all duration-300"
          style={{
            left: spotlight.left,
            top: spotlight.top,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 4px rgba(247, 201, 72, 0.25)",
          }}
        />
      )}

      <div
        className="absolute pointer-events-auto rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#F7C948] text-[#5A3300] shrink-0">
              <Sparkles size={13} fill="currentColor" />
            </span>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 tabular-nums">
              Step {stepIndex + 1} of {totalSteps}
            </p>
          </div>
          <button
            onClick={skip}
            aria-label="Close tour"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-4 pt-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{step.title}</h3>
          <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mt-1">{step.body}</p>
        </div>

        <div className="flex items-center gap-1 px-4 pt-3 pb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all ${
                i === stepIndex
                  ? "w-4 h-1.5 bg-[#F7C948]"
                  : i < stepIndex
                  ? "w-1.5 h-1.5 bg-[#F7C948]/50"
                  : "w-1.5 h-1.5 bg-slate-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            onClick={skip}
            className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-1.5">
            {!isFirst && (
              <button
                onClick={prev}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 h-8 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={12} />
                Back
              </button>
            )}
            <button
              onClick={isLast ? finish : next}
              className="inline-flex items-center gap-1 text-xs font-bold px-3 h-8 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {isLast ? <>Got it <Check size={12} strokeWidth={3} /></> : <>Next <ChevronRight size={12} /></>}
            </button>
          </div>
        </div>

        {!hasTarget && (
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic px-4 pb-3 -mt-1">
            (Centering this step — we couldn&apos;t find the element on screen.)
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
