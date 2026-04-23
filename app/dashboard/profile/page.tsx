"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Avatar from "@radix-ui/react-avatar";
import { useEffect } from "react";
import { Sun, Moon, Monitor, User, BookOpen, Bell, Palette, Shield, LogOut, Check, ShieldCheck, Download, Trash2, FileText, Eye, Sparkles } from "lucide-react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useAuth } from "@/context/authentication";
import { useTheme, Theme } from "@/context/theme";
import {
  StoredProctorReport,
  listProctorReports,
  deleteProctorReport,
  downloadProctorPDF,
  openProctorPDF,
} from "../util/proctor/report";
import { useTour, TourAutoStart } from "../util/tour/TourContext";
import { TOUR_META, TourId } from "../util/tour/tourSteps";

export default function ProfilePage() {
  const router = useRouter();
  const { authDispatch, authState: { user } } = useAuth();
  const { theme, setTheme } = useTheme();
  const { startTour, resetTour } = useTour();

  const [firstName, setFirstName] = useState(user?.user?.first_name ?? "");
  const [lastName, setLastName]   = useState(user?.user?.last_name  ?? "");
  const [email]                   = useState(user?.user?.email      ?? "");
  const [targetExam, setTargetExam] = useState(user?.exam_config?.preparing_for_exam ?? "SAT");
  const [examDate, setExamDate]     = useState("2026-05-05");
  const [targetScore, setTargetScore] = useState(85);
  const [defaultMode, setDefaultMode] = useState<"timed" | "untimed" | "topic-focus">("timed");
  const [defaultDiff, setDefaultDiff] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [defaultCount, setDefaultCount] = useState(30);
  const [dailyReminder, setDailyReminder]       = useState(true);
  const [weeklyReport, setWeeklyReport]         = useState(true);
  const [marketingEmails, setMarketingEmails]   = useState(false);

  // Saved proctoring reports
  const [proctorReports, setProctorReports] = useState<StoredProctorReport[]>(
    () => (typeof window === "undefined" ? [] : listProctorReports()),
  );

  // Proctoring preferences — read once from localStorage via lazy init so
  // we don't need a mount effect to hydrate. Keeps the "set on every render"
  // lint rule clean and avoids an extra render on first paint.
  const [prefsInitial] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("prep:proctor_prefs");
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch { return null; }
  });
  const boolOr = (v: unknown, fallback: boolean) => typeof v === "boolean" ? v : fallback;
  const sensOr = (v: unknown): "low" | "medium" | "high" =>
    v === "low" || v === "medium" || v === "high" ? v : "medium";

  const [proctorByDefault, setProctorByDefault]     = useState(() => boolOr(prefsInitial?.byDefault, false));
  const [proctorCamera, setProctorCamera]           = useState(() => boolOr(prefsInitial?.camera, true));
  const [proctorAudio, setProctorAudio]             = useState(() => boolOr(prefsInitial?.audio, false));
  const [proctorPhone, setProctorPhone]             = useState(() => boolOr(prefsInitial?.phone, true));
  const [proctorMultiPerson, setProctorMultiPerson] = useState(() => boolOr(prefsInitial?.multiPerson, true));
  const [proctorGaze, setProctorGaze]               = useState(() => boolOr(prefsInitial?.gaze, true));
  const [proctorSensitivity, setProctorSensitivity] = useState<"low" | "medium" | "high">(() => sensOr(prefsInitial?.sensitivity));

  const handleDownloadReport = (report: StoredProctorReport) => {
    try { downloadProctorPDF(report); } catch { /* noop */ }
  };
  const handleDeleteReport = (id: string) => {
    deleteProctorReport(id);
    setProctorReports(listProctorReports());
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("prep:proctor_prefs", JSON.stringify({
      byDefault: proctorByDefault,
      camera:    proctorCamera,
      audio:     proctorAudio,
      phone:     proctorPhone,
      multiPerson: proctorMultiPerson,
      gaze:      proctorGaze,
      sensitivity: proctorSensitivity,
    }));
  }, [proctorByDefault, proctorCamera, proctorAudio, proctorPhone, proctorMultiPerson, proctorGaze, proctorSensitivity]);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" });
    router.replace("/signin");
  };

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen">
      <DashboardHeader />
      <TourAutoStart tourId="profile" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6 pb-5 border-b border-slate-200 dark:border-zinc-800">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Account</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100 tracking-tight mt-1">Profile &amp; settings</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage your account details, exam preferences, and appearance.
          </p>
        </header>

        {/* Personal info */}
        <Section title="Personal information" icon={<User size={14} />}>
          <div className="flex items-center gap-4 mb-5">
            <Avatar.Root className="w-16 h-16 rounded-full overflow-hidden shrink-0">
              <Avatar.Fallback className="w-full h-full bg-linear-to-tr font-inter font-semibold text-xl from-[#2B7FFF] to-[#615FFF] flex items-center justify-center text-white">
                {initials || "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div>
              <button className="text-xs font-semibold text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-md px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                Change photo
              </button>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">JPG or PNG · max 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name">
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="ip"
              />
            </Field>
            <Field label="Last name">
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="ip"
              />
            </Field>
            <Field label="Email" hint="Changing your email requires verification">
              <input value={email} disabled className="ip disabled:opacity-60 disabled:cursor-not-allowed" />
            </Field>
          </div>
        </Section>

        {/* Exam preferences */}
        <Section title="Exam preferences" icon={<BookOpen size={14} />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Target exam">
              <select value={targetExam} onChange={e => setTargetExam(e.target.value)} className="ip">
                <option>SAT</option>
                <option>ACT</option>
                <option>GRE</option>
                <option>GMAT</option>
                <option>IELTS</option>
                <option>TOEFL</option>
              </select>
            </Field>
            <Field label="Exam date">
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="ip"
              />
            </Field>
            <Field label="Target score" hint="0–100">
              <input
                type="number"
                min={0}
                max={100}
                value={targetScore}
                onChange={e => setTargetScore(Number(e.target.value))}
                className="ip tabular-nums"
              />
            </Field>
          </div>

          <hr className="my-5 border-slate-100 dark:border-zinc-800" />

          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200 mb-3">Session defaults</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Mode">
              <select value={defaultMode} onChange={e => setDefaultMode(e.target.value as typeof defaultMode)} className="ip">
                <option value="timed">Timed</option>
                <option value="untimed">Untimed</option>
                <option value="topic-focus">Topic focus</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select value={defaultDiff} onChange={e => setDefaultDiff(e.target.value as typeof defaultDiff)} className="ip">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </Field>
            <Field label="Questions per session">
              <input
                type="number"
                min={1}
                max={200}
                value={defaultCount}
                onChange={e => setDefaultCount(Number(e.target.value))}
                className="ip tabular-nums"
              />
            </Field>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={<Palette size={14} />}>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Choose how PrepMaster looks on this device.</p>
          <div className="grid grid-cols-3 gap-2 max-w-md">
            {([
              { value: "light",  label: "Light",  icon: <Sun size={14} />,     preview: "bg-white border-slate-200" },
              { value: "dark",   label: "Dark",   icon: <Moon size={14} />,    preview: "bg-zinc-900 border-zinc-700" },
              { value: "system", label: "System", icon: <Monitor size={14} />, preview: "bg-linear-to-br from-white to-zinc-900 border-slate-300" },
            ] as const).map(opt => {
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as Theme)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${
                    active
                      ? "border-[#F7C948] bg-amber-50 dark:bg-amber-500/10"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className={`w-full h-12 rounded border mb-2 ${opt.preview}`} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {active && <Check size={12} className="text-[#894B00]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Onboarding / help */}
        <Section title="Getting started" icon={<Sparkles size={14} />}>
          <div data-tour="profile-replay">
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
              Replay any guided tour. Each one takes under a minute.
            </p>
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
              {(Object.keys(TOUR_META) as TourId[]).map(tourId => {
                const meta = TOUR_META[tourId];
                return (
                  <li key={tourId} className="flex items-center gap-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{meta.title}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{meta.subtitle}</p>
                    </div>
                    <button
                      onClick={() => { resetTour(tourId); startTour(tourId); }}
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-8 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Sparkles size={11} className="text-[#F7C948]" fill="currentColor" />
                      Replay
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>

        {/* Proctoring */}
        <Section title="Proctoring" icon={<ShieldCheck size={14} />}>
          <div data-tour="profile-proctor-prefs" />
          <ToggleRow
            label="Enable proctoring by default"
            description="Turn on the proctor panel automatically when starting a new session."
            checked={proctorByDefault}
            onChange={setProctorByDefault}
          />

          <div className="py-3 border-b border-slate-100 dark:border-zinc-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mb-1">Alert sensitivity</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
              How aggressively the detector flags incidents (phone, looking away, second person).
            </p>
            <div className="inline-flex gap-0 border border-slate-200 dark:border-zinc-700 rounded-md overflow-hidden">
              {(["low", "medium", "high"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setProctorSensitivity(s)}
                  className={`text-[11px] font-semibold px-3 py-1.5 capitalize transition-colors ${
                    proctorSensitivity === s
                      ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 mt-4 mb-2">
            Monitor for
          </p>
          <ToggleRow
            label="Camera feed"
            description="Required to detect face presence, gaze direction and extra people."
            checked={proctorCamera}
            onChange={setProctorCamera}
          />
          <ToggleRow
            label="Audio cues"
            description="Flag loud background talking or a second voice."
            checked={proctorAudio}
            onChange={setProctorAudio}
          />
          <ToggleRow
            label="Phone / device detection"
            description="Alert if a phone or tablet is visible in the frame."
            checked={proctorPhone}
            onChange={setProctorPhone}
          />
          <ToggleRow
            label="Second person detection"
            description="Warn when another person enters the camera view."
            checked={proctorMultiPerson}
            onChange={setProctorMultiPerson}
          />
          <ToggleRow
            label="Gaze / head pose"
            description="Track looking-away patterns that may suggest distraction."
            checked={proctorGaze}
            onChange={setProctorGaze}
            last
          />

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 rounded-lg bg-amber-50/60 dark:bg-amber-500/10 border px-3 py-2.5">
            <p className="text-[11px] text-[#894B00] dark:text-amber-300 leading-relaxed">
              <span className="font-semibold">Heads up.</span> Once a proctored session starts, the monitor can be minimized but not closed until the session ends.
            </p>
          </div>
        </Section>

        {/* Proctoring reports */}
        <Section title="Proctoring reports" icon={<FileText size={14} />}>
          <div data-tour="profile-reports" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
            PDF reports generated at the end of each proctored session. Stored locally on this device.
          </p>
          {proctorReports.length === 0 ? (
            <p className="text-xs italic text-slate-400 dark:text-zinc-500 py-2">
              No proctored sessions yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
              {proctorReports.map(r => {
                const alerts = r.incidents.filter(i => i.severity === "alert").length;
                const warns  = r.incidents.filter(i => i.severity === "warn").length;
                return (
                  <li key={r.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 truncate">
                        {r.examType} · {r.sessionMode}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {new Date(r.endedAtIso).toLocaleString()} · {r.totalQuestions} questions
                        {typeof r.score === "number" && <> · {r.score.toFixed(0)}%</>}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        {alerts > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                            {alerts} alert{alerts === 1 ? "" : "s"}
                          </span>
                        )}
                        {warns > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            {warns} warning{warns === 1 ? "" : "s"}
                          </span>
                        )}
                        {alerts === 0 && warns === 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Clean
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openProctorPDF(r)}
                      className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#F7C948] text-[#5A3300] text-xs font-semibold hover:bg-[#F0BC2F] transition-colors"
                      title="View PDF in new tab"
                    >
                      <Eye size={12} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadReport(r)}
                      className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(r.id)}
                      className="shrink-0 h-8 w-8 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 transition-colors inline-flex items-center justify-center"
                      title="Delete report"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={<Bell size={14} />}>
          <ToggleRow
            label="Daily study reminder"
            description="A nudge at your usual study time to keep the streak alive."
            checked={dailyReminder}
            onChange={setDailyReminder}
          />
          <ToggleRow
            label="Weekly progress report"
            description="Summary of your accuracy, topics, and milestones, sent Monday."
            checked={weeklyReport}
            onChange={setWeeklyReport}
          />
          <ToggleRow
            label="Product updates"
            description="Occasional emails about new features."
            checked={marketingEmails}
            onChange={setMarketingEmails}
            last
          />
        </Section>

        {/* Privacy */}
        <Section title="Privacy &amp; data" icon={<Shield size={14} />}>
          <div className="space-y-2">
            <ActionRow
              label="Export my data"
              description="Download all your sessions, answers, and progress as JSON."
              cta="Request export"
            />
            <ActionRow
              label="Reset practice history"
              description="Clears session history and mastery scores. This cannot be undone."
              cta="Reset"
              danger
            />
            <ActionRow
              label="Delete account"
              description="Permanently delete your account and all associated data."
              cta="Delete account"
              danger
            />
          </div>
        </Section>

        {/* Save + sign out footer */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-5 border-t border-slate-200 dark:border-zinc-800">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
          <div className="flex gap-2">
            <button className="px-4 h-10 rounded-lg border border-slate-200 dark:border-zinc-700 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
              Discard
            </button>
            <button className="px-5 h-10 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors">
              Save changes
            </button>
          </div>
        </div>
      </main>

      {/* Shared input styles */}
      <style jsx global>{`
        .ip {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1px solid rgb(226 232 240); /* slate-200 */
          background: white;
          font-size: 13px;
          color: rgb(15 23 43); /* slate-900 */
          outline: none;
          transition: border-color .15s;
        }
        .ip:focus { border-color: rgb(100 116 139); }
        .dark .ip {
          background: rgb(24 24 27); /* zinc-900 */
          border-color: rgb(39 39 42); /* zinc-800 */
          color: rgb(244 244 245); /* zinc-100 */
        }
        .dark .ip:focus { border-color: rgb(113 113 122); }
      `}</style>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 mb-4">
      <header className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
        {icon && <span className="text-slate-400 dark:text-zinc-500">{icon}</span>}
        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight" dangerouslySetInnerHTML={{ __html: title }} />
      </header>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{hint}</span>}
    </label>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  last,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 py-3 ${last ? "" : "border-b border-slate-100 dark:border-zinc-800"}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative rounded-full transition-colors shrink-0 ${
          checked ? "bg-slate-900 dark:bg-zinc-100" : "bg-slate-200 dark:bg-zinc-700"
        }`}
        style={{ width: 40, height: 22 }}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full shadow transition-all ${
            checked ? "bg-white dark:bg-zinc-900 left-[19px]" : "bg-white left-1"
          }`}
        />
      </button>
    </div>
  );
}

function ActionRow({
  label,
  description,
  cta,
  danger,
}: {
  label: string;
  description: string;
  cta: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{description}</p>
      </div>
      <button
        className={`shrink-0 h-8 px-3 rounded-md border text-xs font-semibold transition-colors ${
          danger
            ? "border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
        }`}
      >
        {cta}
      </button>
    </div>
  );
}
