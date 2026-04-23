"use client";
import { useEffect, useRef, useState } from "react";
import { X as XIcon, Minus, GripVertical, Calculator as CalcIcon, Delete } from "lucide-react";

interface Props {
  onClose: () => void;
}

const BUTTONS: { label: string; kind: "num" | "op" | "eq" | "clear" | "back" | "dot" | "pct" | "sign"; span?: number }[] = [
  { label: "AC",  kind: "clear" },
  { label: "+/-", kind: "sign"  },
  { label: "%",   kind: "pct"   },
  { label: "÷",   kind: "op"    },
  { label: "7",   kind: "num"   },
  { label: "8",   kind: "num"   },
  { label: "9",   kind: "num"   },
  { label: "×",   kind: "op"    },
  { label: "4",   kind: "num"   },
  { label: "5",   kind: "num"   },
  { label: "6",   kind: "num"   },
  { label: "−",   kind: "op"    },
  { label: "1",   kind: "num"   },
  { label: "2",   kind: "num"   },
  { label: "3",   kind: "num"   },
  { label: "+",   kind: "op"    },
  { label: "0",   kind: "num", span: 2 },
  { label: ".",   kind: "dot"   },
  { label: "=",   kind: "eq"    },
];

type Op = "+" | "−" | "×" | "÷" | null;

const CALC_WIDTH       = 280;
const PROCTOR_RESERVE  = 304;  // bottom-left keep-out: 288 panel width + 16 gap

function initialCalcPos() {
  if (typeof window === "undefined") return { x: 24, y: 120 };
  return { x: Math.max(16, window.innerWidth - CALC_WIDTH - 24), y: 80 };
}

export default function Calculator({ onClose }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number }>(initialCalcPos);
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [display, setDisplay]   = useState("0");
  const [stored, setStored]     = useState<number | null>(null);
  const [op, setOp]             = useState<Op>(null);
  const [fresh, setFresh]       = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [history, setHistory]   = useState<string[]>([]);

  // Clamp drag position so the calculator can't land on top of the ProctorPanel
  // (which floats bottom-left, roughly PROCTOR_RESERVE wide × PROCTOR_RESERVE tall).
  function clampPos(x: number, y: number, w: number, h: number) {
    const proctorOn = typeof window !== "undefined"
      && sessionStorage.getItem("prep:proctoring") === "on";

    const maxX = window.innerWidth - w;
    const maxY = window.innerHeight - h;
    let nx = Math.max(0, Math.min(maxX, x));
    let ny = Math.max(0, Math.min(maxY, y));

    if (proctorOn) {
      // Keep-out rectangle: bottom-left quadrant of size PROCTOR_RESERVE
      const keepOutTop  = window.innerHeight - PROCTOR_RESERVE;
      const keepOutRight = PROCTOR_RESERVE;
      const overlaps = ny + h > keepOutTop && nx < keepOutRight;
      if (overlaps) {
        // push to whichever exit is closer: above keep-out, or right of it
        const pushUp    = keepOutTop - h;
        const pushRight = keepOutRight;
        if (Math.abs(ny - pushUp) < Math.abs(nx - pushRight)) {
          ny = Math.max(0, pushUp);
        } else {
          nx = Math.min(maxX, pushRight);
        }
      }
    }
    return { x: nx, y: ny };
  }

  // Drag handling
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const node = panelRef.current;
      if (!node) return;
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      setPos(clampPos(e.clientX - dragOffsetRef.current.x, e.clientY - dragOffsetRef.current.y, w, h));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (!dragging) return;
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const node = panelRef.current;
      if (!node) return;
      setPos(clampPos(t.clientX - dragOffsetRef.current.x, t.clientY - dragOffsetRef.current.y, node.offsetWidth, node.offsetHeight));
    };
    const onTouchEnd = () => setDragging(false);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dragging]);

  function beginDragMouse(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  }
  function beginDragTouch(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffsetRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
    setDragging(true);
  }

  function formatNumber(n: number) {
    if (!Number.isFinite(n)) return "Error";
    const abs = Math.abs(n);
    if (abs !== 0 && (abs < 0.0001 || abs >= 1e12)) return n.toExponential(6);
    const s = n.toString();
    return s.length > 14 ? n.toPrecision(10) : s;
  }

  function parseDisplay() {
    const n = parseFloat(display.replace(",", "."));
    return Number.isNaN(n) ? 0 : n;
  }

  function applyOp(a: number, b: number, op: Op): number {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? NaN : a / b;
      default:  return b;
    }
  }

  function pressNum(d: string) {
    if (fresh) { setDisplay(d); setFresh(false); return; }
    if (display.length >= 14) return;
    setDisplay(display === "0" ? d : display + d);
  }

  function pressDot() {
    if (fresh) { setDisplay("0."); setFresh(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }

  function pressSign() {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  }

  function pressPct() {
    setDisplay(formatNumber(parseDisplay() / 100));
    setFresh(true);
  }

  function pressClear() {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setFresh(true);
  }

  function pressBack() {
    if (fresh) return;
    const next = display.length <= 1 || (display.length === 2 && display.startsWith("-")) ? "0" : display.slice(0, -1);
    setDisplay(next);
    if (next === "0") setFresh(true);
  }

  function pressOp(nextOp: Op) {
    const cur = parseDisplay();
    if (stored != null && op && !fresh) {
      const r = applyOp(stored, cur, op);
      setStored(r);
      setDisplay(formatNumber(r));
    } else {
      setStored(cur);
    }
    setOp(nextOp);
    setFresh(true);
  }

  function pressEq() {
    if (stored == null || op == null) return;
    const cur = parseDisplay();
    const r = applyOp(stored, cur, op);
    const out = formatNumber(r);
    setHistory(h => [`${formatNumber(stored)} ${op} ${formatNumber(cur)} = ${out}`, ...h].slice(0, 5));
    setDisplay(out);
    setStored(null);
    setOp(null);
    setFresh(true);
  }

  // Keyboard input when calculator is focused
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!panelRef.current?.contains(document.activeElement) && document.activeElement?.tagName !== "BODY") return;
      const k = e.key;
      if (/[0-9]/.test(k)) { e.preventDefault(); pressNum(k); }
      else if (k === ".")  { e.preventDefault(); pressDot(); }
      else if (k === "+")  { e.preventDefault(); pressOp("+"); }
      else if (k === "-")  { e.preventDefault(); pressOp("−"); }
      else if (k === "*")  { e.preventDefault(); pressOp("×"); }
      else if (k === "/")  { e.preventDefault(); pressOp("÷"); }
      else if (k === "Enter" || k === "=") { e.preventDefault(); pressEq(); }
      else if (k === "Backspace") { e.preventDefault(); pressBack(); }
      else if (k === "Escape") { e.preventDefault(); pressClear(); }
      else if (k === "%")  { e.preventDefault(); pressPct(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, stored, op, fresh]);

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-70 select-none rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700"
      style={{ left: pos.x, top: pos.y, width: 280 }}
    >
      {/* Title bar */}
      <div
        onMouseDown={beginDragMouse}
        onTouchStart={beginDragTouch}
        className="flex items-center justify-between px-2.5 h-9 rounded-t-xl bg-slate-100 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 cursor-move"
      >
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
          <GripVertical size={12} />
          <CalcIcon size={12} />
          <span className="text-[11px] font-semibold">Calculator</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setMinimized(m => !m)}
            className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400"
            aria-label={minimized ? "Expand" : "Minimize"}
          >
            <Minus size={12} />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-rose-500"
            aria-label="Close"
          >
            <XIcon size={12} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Display */}
          <div className="px-3 py-3 border-b border-slate-100 dark:border-zinc-800">
            {history[0] && (
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono tabular-nums truncate text-right">
                {history[0]}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={pressBack}
                title="Backspace"
                className="w-7 h-7 rounded flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <Delete size={13} />
              </button>
              <p className="flex-1 text-right text-2xl font-semibold text-slate-900 dark:text-zinc-100 font-mono tabular-nums truncate">
                {op != null && stored != null && fresh ? `${formatNumber(stored)} ${op}` : display}
              </p>
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1.5 p-2.5">
            {BUTTONS.map((b, i) => {
              const isOp    = b.kind === "op";
              const isEq    = b.kind === "eq";
              const isClear = b.kind === "clear" || b.kind === "sign" || b.kind === "pct";
              const cls =
                isEq    ? "bg-[#F7C948] text-white hover:bg-[#F7C948]/90" :
                isOp    ? "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-700 font-bold" :
                isClear ? "bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800" :
                          "bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-800";
              const onClick = () => {
                if (b.kind === "num")   return pressNum(b.label);
                if (b.kind === "dot")   return pressDot();
                if (b.kind === "op")    return pressOp(b.label as Op);
                if (b.kind === "eq")    return pressEq();
                if (b.kind === "clear") return pressClear();
                if (b.kind === "sign")  return pressSign();
                if (b.kind === "pct")   return pressPct();
              };
              return (
                <button
                  key={i}
                  onClick={onClick}
                  className={`h-10 rounded-md text-sm font-semibold transition-colors ${cls} ${b.span === 2 ? "col-span-2" : ""}`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
