"use client";
import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, ShieldCheck, AlertTriangle, Minus, Maximize2, Loader2 } from "lucide-react";
import { captureVideoFrame, StoredIncident, IncidentKind } from "@/app/dashboard/util/proctor/report";

type DetectionKind = "clear" | "phone" | "multi_person" | "no_face" | "face_hidden" | "device" | "object";

interface Box { x: number; y: number; w: number; h: number }

interface Detection {
  kind: DetectionKind;
  label: string;
  severity: "ok" | "warn" | "alert";
  boxes?: Box[];
  timestamp: number;
}

interface ProctorPrefs {
  phone: boolean;
  multiPerson: boolean;
  camera: boolean;
  sensitivity: "low" | "medium" | "high";
}

const DEFAULT_PREFS: ProctorPrefs = {
  phone: true,
  multiPerson: true,
  camera: true,
  sensitivity: "medium",
};

// Lower thresholds — webcam frames often produce moderate scores.
const FACE_CONF      = { low: 0.3, medium: 0.4, high: 0.55 } as const;
const OBJ_CONF       = { low: 0.25, medium: 0.35, high: 0.5 } as const;
// Phones are often small, blurry, or partially occluded by the hand — allow
// them through at a noticeably lower confidence than general objects.
const PHONE_CONF     = { low: 0.15, medium: 0.22, high: 0.35 } as const;
// Secondary person detection (COCO-SSD "person") — catches profile faces the
// face detector misses. Must be confident enough to avoid reflection/poster.
const PERSON_CONF    = { low: 0.4, medium: 0.5, high: 0.6 } as const;

// Classes that upgrade severity from "warn" to "alert" when spotted.
const ALERT_CLASSES = new Set(["cell phone", "laptop", "tv", "tablet", "book"]);
// COCO-SSD frequently mislabels phones as remotes when the screen isn't
// visible — we treat a high-confidence remote as an additional phone signal.
const PHONE_ALIAS_CLASSES = new Set(["cell phone", "remote"]);
// Re-triggers the same kind+label if the last capture was at least this old.
const INCIDENT_REPEAT_MS = 20_000;

function readPrefs(): ProctorPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem("prep:proctor_prefs");
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw);
    return {
      phone:       typeof p.phone === "boolean"       ? p.phone       : DEFAULT_PREFS.phone,
      multiPerson: typeof p.multiPerson === "boolean" ? p.multiPerson : DEFAULT_PREFS.multiPerson,
      camera:      typeof p.camera === "boolean"      ? p.camera      : DEFAULT_PREFS.camera,
      sensitivity: (p.sensitivity === "low" || p.sensitivity === "medium" || p.sensitivity === "high")
        ? p.sensitivity : DEFAULT_PREFS.sensitivity,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function severityColors(sev: Detection["severity"]) {
  if (sev === "ok")   return { box: "#10B97D", bg: "rgba(16,185,125,0.15)", pill: "bg-emerald-500/20 text-emerald-300" };
  if (sev === "warn") return { box: "#F7C948", bg: "rgba(247,201,72,0.18)", pill: "bg-amber-500/20 text-amber-300" };
  return                     { box: "#EF4444", bg: "rgba(239,68,68,0.2)",   pill: "bg-rose-500/20 text-rose-300"  };
}

// Converts an absolute pixel bbox from the (un-mirrored) source video into a
// percentage rect that matches the mirrored preview.
function pxBoxToPct(x: number, y: number, w: number, h: number, vw: number, vh: number): Box {
  return {
    x: ((vw - x - w) / vw) * 100,
    y: (y / vh) * 100,
    w: (w / vw) * 100,
    h: (h / vh) * 100,
  };
}

const INITIAL_DETECTION: Detection = {
  kind: "clear",
  label: "Starting up…",
  severity: "ok",
  timestamp: 0,
};

interface ProctorPanelProps {
  onStop?: () => void;
  onIncident?: (incident: StoredIncident) => void;
  sessionStartIso?: string;
}

export default function ProctorPanel({ onIncident, sessionStartIso }: ProctorPanelProps = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraOk, setCameraOk]     = useState<boolean | null>(null);
  const [modelState, setModelState] = useState<"loading" | "ready" | "error">("loading");
  const [minimized, setMinimized]   = useState(false);
  const [detection, setDetection]   = useState<Detection>(INITIAL_DETECTION);
  const [incidentCount, setIncidentCount] = useState(0);
  const [elapsed, setElapsed]       = useState(0);
  const [faceCount, setFaceCount]   = useState(0);
  const [objectLabel, setObjectLabel] = useState<string>("");
  const nextIdRef = useRef(1);
  const lastEmitRef = useRef<Record<string, number>>({});
  const startIsoRef = useRef(sessionStartIso ?? new Date().toISOString());
  const onIncidentRef = useRef(onIncident);
  useEffect(() => { onIncidentRef.current = onIncident; }, [onIncident]);

  // Webcam
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width:  { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setCameraOk(true);
      } catch {
        setCameraOk(false);
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  // Load MediaPipe face detector + COCO-SSD object detector, then run the loop
  useEffect(() => {
    if (cameraOk !== true) return;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let faceDetector: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let objectModel:  any = null;
    let raf: number | null = null;
    let lastTick = 0;

    (async () => {
      try {
        const [vision, cocoSsd] = await Promise.all([
          import("@mediapipe/tasks-vision"),
          import("@tensorflow-models/coco-ssd"),
          import("@tensorflow/tfjs"),
        ]);
        if (cancelled) return;

        const fileset = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
        );
        if (cancelled) return;

        faceDetector = await vision.FaceDetector.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.3,
        });
        if (cancelled) return;

        objectModel = await cocoSsd.load({ base: "mobilenet_v2" });
        if (cancelled) return;

        setModelState("ready");
        raf = requestAnimationFrame(loop);
      } catch {
        if (!cancelled) setModelState("error");
      }
    })();

    async function loop(now: number) {
      if (cancelled) return;
      // Throttle to ~3 fps
      if (now - lastTick < 330) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastTick = now;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const prefs = readPrefs();
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      try {
        // 1) Face detection (count + boxes)
        let faces: { box: Box }[] = [];
        if (faceDetector) {
          const res = faceDetector.detectForVideo(video, now);
          const minFaceScore = FACE_CONF[prefs.sensitivity];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawFaces: any[] = res?.detections ?? [];
          faces = rawFaces
            .filter(d => (d.categories?.[0]?.score ?? 1) >= minFaceScore)
            .map(d => {
              const bb = d.boundingBox;
              return { box: pxBoxToPct(bb.originX, bb.originY, bb.width, bb.height, vw, vh) };
            });
        }

        // 2) Object detection. We gather three buckets from COCO-SSD:
        //    - phones (includes high-conf remotes — COCO often mislabels phones)
        //    - persons (supplements face detector which misses profile views)
        //    - otherObjects (everything else — books, bottles, laptops, etc.)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let phones: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let persons: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let otherObjects: any[] = [];
        if (objectModel) {
          const preds = await objectModel.detect(video, 20);
          const objT    = OBJ_CONF[prefs.sensitivity];
          const phoneT  = PHONE_CONF[prefs.sensitivity];
          const personT = PERSON_CONF[prefs.sensitivity];

          if (prefs.phone) {
            phones = preds
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((p: any) => PHONE_ALIAS_CLASSES.has(p.class) && p.score >= phoneT)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .sort((a: any, b: any) => b.score - a.score);
          }

          persons = preds
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => p.class === "person" && p.score >= personT);

          otherObjects = preds
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => p.score >= objT && p.class !== "person" && !PHONE_ALIAS_CLASSES.has(p.class));

          setObjectLabel(
            preds
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((p: any) => p.score >= objT)
              .map((p: { class: string }) => p.class)
              .slice(0, 4)
              .join(", "),
          );
        }

        setFaceCount(faces.length);

        // Combined "people in frame" uses the stronger of face or body detection,
        // so a profile-view or phone-occluded person still counts.
        const faceN   = faces.length;
        const bodyN   = persons.length;
        const peopleN = Math.max(faceN, bodyN);

        let next: Detection;

        if (phones.length > 0) {
          const top = phones[0];
          const [x, y, w, h] = top.bbox as [number, number, number, number];
          const conf = Math.round(top.score * 100);
          const isAlias = top.class !== "cell phone";
          const context: string[] = [];
          if (peopleN >= 2) context.push(`${peopleN} people in frame`);
          else if (faceN === 0 && bodyN >= 1) context.push("face turned away");
          else if (faceN === 0 && bodyN === 0) context.push("no one visible");
          const suffix = context.length ? ` · ${context.join(" · ")}` : "";
          next = {
            kind: "phone",
            label: isAlias
              ? `Handheld device (possible phone) — ${conf}% confident${suffix}`
              : `Mobile phone detected — ${conf}% confident${suffix}`,
            severity: "alert",
            boxes: [pxBoxToPct(x, y, w, h, vw, vh)],
            timestamp: Date.now(),
          };
        } else if (prefs.multiPerson && peopleN >= 2) {
          const faceBoxes = faces.map(f => f.box);
          const personBoxes = persons.map(p => {
            const [x, y, w, h] = p.bbox as [number, number, number, number];
            return pxBoxToPct(x, y, w, h, vw, vh);
          });
          const boxes = faceBoxes.length >= personBoxes.length ? faceBoxes : personBoxes;
          next = {
            kind: "multi_person",
            label: `${peopleN} people in frame (faces: ${faceN}, bodies: ${bodyN})`,
            severity: "alert",
            boxes,
            timestamp: Date.now(),
          };
        } else if (prefs.camera && faceN === 0 && bodyN >= 1) {
          // Person detected but face not visible — likely looking away or down.
          const personBoxes = persons.map(p => {
            const [x, y, w, h] = p.bbox as [number, number, number, number];
            return pxBoxToPct(x, y, w, h, vw, vh);
          });
          next = {
            kind: "face_hidden",
            label: `Face not visible — person in frame but looking away or covered`,
            severity: "warn",
            boxes: personBoxes,
            timestamp: Date.now(),
          };
        } else if (prefs.camera && peopleN === 0) {
          next = {
            kind: "no_face",
            label: "No one in frame — candidate left the camera view",
            severity: "warn",
            timestamp: Date.now(),
          };
        } else if (otherObjects.length > 0) {
          const top = otherObjects[0];
          const [x, y, w, h] = top.bbox as [number, number, number, number];
          const conf = Math.round(top.score * 100);
          const isAlert = ALERT_CLASSES.has(top.class);
          const extra = otherObjects.length > 1
            ? ` (+${otherObjects.length - 1} other object${otherObjects.length > 2 ? "s" : ""})`
            : "";
          next = {
            kind: isAlert ? "device" : "object",
            label: `${top.class} in frame — ${conf}% confident${extra}`,
            severity: isAlert ? "alert" : "warn",
            boxes: [pxBoxToPct(x, y, w, h, vw, vh)],
            timestamp: Date.now(),
          };
        } else {
          next = {
            kind: "clear",
            label: peopleN > 0
              ? "Candidate visible — all clear"
              : "You're in frame",
            severity: "ok",
            boxes: faces.map(f => f.box),
            timestamp: Date.now(),
          };
        }

        setDetection(prev => {
          if (next.severity !== "ok") {
            const key = `${next.kind}:${next.label}`;
            const last = lastEmitRef.current[key] ?? 0;
            const shouldEmit =
              (next.kind !== prev.kind) ||
              (Date.now() - last >= INCIDENT_REPEAT_MS);

            if (shouldEmit) {
              lastEmitRef.current[key] = Date.now();
              const nowIso = new Date().toISOString();
              const offsetSec = Math.max(
                0,
                Math.round((Date.now() - new Date(startIsoRef.current).getTime()) / 1000),
              );
              const screenshot = captureVideoFrame(video);
              const stored: StoredIncident = {
                id: nextIdRef.current++,
                kind: next.kind as IncidentKind,
                label: next.label,
                severity: next.severity as "warn" | "alert",
                atIso: nowIso,
                offsetSec,
                screenshot,
              };
              setIncidentCount(c => c + 1);
              onIncidentRef.current?.(stored);
            }
          }
          return next;
        });
      } catch {
        // swallow transient runtime errors
      }

      if (!cancelled) raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelled = true;
      if (raf !== null) cancelAnimationFrame(raf);
      try { faceDetector?.close?.(); } catch { /* noop */ }
      try { objectModel?.dispose?.(); } catch { /* noop */ }
    };
  }, [cameraOk]);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const c = severityColors(detection.severity);
  const mm = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");
  const statusText =
    modelState === "loading" ? "LOADING"
    : modelState === "error" ? "OFFLINE"
    : detection.severity === "ok"    ? "ALL CLEAR"
    : detection.severity === "warn"  ? "WARNING"
    : "ALERT";

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        title="Restore proctor panel"
        className="fixed bottom-14 left-0 z-40 flex items-center gap-2 bg-[#0F172B] text-white text-[10px] sm:text-xs font-bold px-3 py-2 rounded-r-xl shadow-lg hover:shadow-xl ring-1 ring-emerald-500/40 transition-all group"
      >
        <span className="relative flex items-center">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </span>
        <span className="tabular-nums">{mm}:{ss}</span>
        {incidentCount > 0 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 tabular-nums">
            {incidentCount}
          </span>
        )}
        <Maximize2 size={11} className="text-white/60 group-hover:text-white transition-colors" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-12 left-0 z-40 w-72 rounded-r-2xl bg-[#0F172B] text-white shadow-2xl overflow-hidden border-y border-r border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[11px] font-bold">Proctoring active</span>
          <span className="text-[10px] text-white/50 tabular-nums">{mm}:{ss}</span>
          {incidentCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 tabular-nums">
              {incidentCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Minimize"
          title="Minimize (proctoring stays on)"
        >
          <Minus size={12} />
        </button>
      </div>

      {/* Video w/ overlay */}
      <div className="relative aspect-4/3 bg-slate-900">
        {cameraOk ? (
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : cameraOk === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 bg-linear-to-br from-slate-900 to-slate-800">
            <VideoOff size={22} className="text-white/40 mb-2" />
            <p className="text-[11px] text-white/70 font-semibold">Camera unavailable</p>
            <p className="text-[10px] text-white/40 mt-0.5">Running without detection</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Video size={18} className="text-white/40 animate-pulse" />
          </div>
        )}

        {/* Model loading overlay */}
        {cameraOk === true && modelState === "loading" && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 size={18} className="text-white/80 animate-spin" />
            <p className="text-[10px] text-white/70 font-semibold">Loading detectors…</p>
            <p className="text-[9px] text-white/40 text-center px-3">First run downloads face + object models</p>
          </div>
        )}
        {cameraOk === true && modelState === "error" && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center px-3 gap-1">
            <AlertTriangle size={16} className="text-amber-400" />
            <p className="text-[10px] text-white/70 font-semibold text-center">Detector offline</p>
            <p className="text-[9px] text-white/40 text-center">Camera still recording</p>
          </div>
        )}

        {/* Bounding boxes */}
        {detection.boxes?.map((b, i) => (
          <div
            key={i}
            className="absolute border-2 rounded-md transition-all duration-200 pointer-events-none"
            style={{
              left:   `${b.x}%`,
              top:    `${b.y}%`,
              width:  `${b.w}%`,
              height: `${b.h}%`,
              borderColor: c.box,
              background: c.bg,
            }}
          >
            {i === 0 && (
              <span
                className="absolute -top-5 left-0 text-[9px] font-bold px-1.5 py-0.5 rounded text-white whitespace-nowrap"
                style={{ background: c.box }}
              >
                {detection.label}
              </span>
            )}
          </div>
        ))}

        {/* No-face banner */}
        {(!detection.boxes || detection.boxes.length === 0) && detection.kind === "no_face" && modelState === "ready" && (
          <div className="absolute inset-0 border-2 border-amber-400/70 bg-amber-500/10 flex items-center justify-center">
            <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              <AlertTriangle size={11} />
              No face visible
            </div>
          </div>
        )}

        {/* Live indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
          <span className={`w-1.5 h-1.5 rounded-full ${modelState === "ready" ? "bg-rose-500 animate-pulse" : "bg-white/40"}`} />
          <span className="text-[9px] font-bold tracking-wider">LIVE</span>
        </div>

        {/* Status pill */}
        <div className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm ${
          modelState !== "ready" ? "bg-white/10 text-white/70" : c.pill
        }`}>
          {statusText}
        </div>

        {/* Detection counter (bottom-left of video) */}
        {modelState === "ready" && (
          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono tabular-nums">
            <span>👤 {faceCount}</span>
            {objectLabel && <span className="text-white/60 truncate max-w-[120px]">{objectLabel}</span>}
          </div>
        )}
      </div>

    </div>
  );
}
