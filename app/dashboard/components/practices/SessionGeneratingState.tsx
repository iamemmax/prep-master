"use client";

import { useEffect, useState } from "react";
import { Wand2 } from "lucide-react";

interface Props {
  /** Heading shown under the orb. Defaults to "Generating your practice". */
  title?: string;
  /** Step labels that rotate every 1.6s. Provide your own to match the flow. */
  steps?: { icon: string; text: string }[];
  /** Subtle tagline at the bottom. */
  footer?: string;
}

const DEFAULT_STEPS = [
  { icon: "📚", text: "Reading the syllabus" },
  { icon: "✍️", text: "Drafting fresh questions" },
  { icon: "🎯", text: "Calibrating difficulty" },
  { icon: "🔍", text: "Reviewing answer choices" },
  { icon: "✨", text: "Polishing explanations" },
  { icon: "🚀", text: "Almost there" },
];

/**
 * Animated "session is starting" panel. Drops into a Dialog body or any
 * centered container — used by both the AI-practice modal and the standard
 * session-setup modal while the start-practice mutation is in flight.
 */
export default function SessionGeneratingState({
  title = "Generating your practice",
  steps = DEFAULT_STEPS,
  footer = "Hang tight — this usually takes a few seconds.",
}: Props) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, [steps.length]);

  // 12 sparkles arranged in a ring around the orb. Each gets a staggered
  // delay so they twinkle out of phase, plus a slightly different radius/size
  // to avoid the "wheel of identical dots" look.
  const sparkles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 60 + (i % 3) * 6;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      delay: i * 120,
      size: i % 2 === 0 ? 6 : 4,
    };
  });

  return (
    <div className="relative flex flex-col items-center justify-center px-8 py-12 text-center overflow-hidden">
      {/* Soft gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          background:
            "radial-gradient(circle at center, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.10) 35%, transparent 70%)",
        }}
      />

      {/* Orb + sparkle ring */}
      <div className="relative mb-7 h-44 w-44 flex items-center justify-center">
        {sparkles.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.6)]"
            style={{
              width: s.size,
              height: s.size,
              transform: `translate(${s.x}px, ${s.y}px)`,
              animationDelay: `${s.delay}ms`,
              animationDuration: "1.8s",
            }}
          />
        ))}

        <span
          className="absolute h-32 w-32 rounded-full border-2 border-indigo-300/50 dark:border-indigo-400/30 animate-ping"
          style={{ animationDuration: "2.5s" }}
        />
        <span
          className="absolute h-24 w-24 rounded-full blur-2xl opacity-70 animate-pulse"
          style={{ background: "linear-gradient(135deg, #6366F1, #7C3AED)" }}
        />
        <div
          className="relative h-20 w-20 rounded-full flex items-center justify-center shadow-[0_10px_40px_-5px_rgba(124,58,237,0.55)]"
          style={{ background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #A855F7 100%)" }}
        >
          <Wand2
            size={32}
            className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
            style={{ animation: "sgs-wand-wave 1.6s ease-in-out infinite" }}
          />
        </div>
      </div>

      <h3 className="relative text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 dark:from-indigo-300 dark:via-purple-300 dark:to-fuchsia-300 bg-clip-text text-transparent">
        {title}
      </h3>

      <div className="relative mt-3 min-h-[2.25em] flex items-center justify-center">
        <div
          key={idx}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300"
          style={{ animation: "sgs-msg-in 0.45s ease-out" }}
        >
          <span className="text-base leading-none">{steps[idx].icon}</span>
          <span>{steps[idx].text}</span>
        </div>
      </div>

      <div className="relative mt-5 w-56 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="absolute inset-y-0 w-1/3 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #7C3AED, transparent)",
            animation: "sgs-bar-slide 1.6s ease-in-out infinite",
          }}
        />
      </div>

      <p className="relative mt-5 text-[11px] text-slate-400 dark:text-zinc-500">{footer}</p>

      <style jsx>{`
        @keyframes sgs-wand-wave {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes sgs-msg-in {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes sgs-bar-slide {
          0% { left: -33%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
