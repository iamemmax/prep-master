"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  color: string;
  size: number;
  shape: "square" | "circle";
}

const COLORS = ["#F7C948", "#FE9A00", "#FF6900", "#10B97D", "#2B7FFF", "#A855F7", "#EC4899"];

function mk(): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 6 + Math.random() * 10;
  return {
    x: 50 + (Math.random() - 0.5) * 20,   // vw-%
    y: 40 + (Math.random() - 0.5) * 10,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 3,
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 16,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "square" : "circle",
  };
}

export default function ConfettiBurst({
  active,
  durationMs = 2200,
  onDone,
  count = 80,
}: {
  active: boolean;
  durationMs?: number;
  onDone?: () => void;
  count?: number;
}) {
  // Gate at the top — when inactive, no particles, no animation frames.
  if (!active) return null;
  return <Burst durationMs={durationMs} onDone={onDone} count={count} />;
}

function Burst({
  durationMs, onDone, count,
}: { durationMs: number; onDone?: () => void; count: number }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: count }, () => mk()),
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const elapsed = t - t0;
      setTick(elapsed);
      if (elapsed < durationMs) {
        raf = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, onDone]);

  const rendered = useMemo(() => {
    const tSec = tick / 1000;
    const gravity = 20; // % per s^2
    return particles.map(p => {
      const x = p.x + p.vx * tSec;
      const y = p.y + p.vy * tSec + 0.5 * gravity * tSec * tSec;
      const rot = p.rot + p.vrot * tSec * 30;
      const opacity = Math.max(0, 1 - tick / durationMs);
      return { ...p, x, y, rot, opacity };
    });
  }, [particles, tick, durationMs]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 pointer-events-none">
      {rendered.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            transform: `translate(-50%, -50%) rotate(${p.rot}deg)`,
            opacity: (p as Particle & { opacity: number }).opacity,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
