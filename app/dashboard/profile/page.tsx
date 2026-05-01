"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Avatar from "@radix-ui/react-avatar";
import { useEffect } from "react";
import { Sun, Moon, Monitor, User, BookOpen, Bell, Palette, Shield, LogOut, Check, ShieldCheck, Download, Trash2, FileText, Eye, Sparkles, Mail, BadgeCheck, Crown, CalendarClock, Coins, Brain } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTour, TourAutoStart } from "../util/tour/TourContext";
import { TOUR_META, TourId, isTourAvailable } from "../util/tour/tourSteps";
import { useUpdateProfile } from "../util/apis/profile/updateProfile";
import { useGetSettings, useUpdateSettings, UpdateSettingsPayload } from "../util/apis/profile/settings";
import { useGetPracticeExamConfig, ExamConfigEntry } from "../util/apis/practice/fetchExamConfig";
import { useUserSubscription } from "../util/apis/subscription/subscription";
import { useSubscription } from "../components/subscription/SubscriptionProvider";
import { SmallSpinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { formatAxiosErrorMessage } from "@/utils";
import { AxiosError } from "axios";

export default function ProfilePage() {
  const router = useRouter();
  const { authDispatch, authState: { user } } = useAuth();
  const { theme, setTheme } = useTheme();
  const { startTour, resetTour } = useTour();

  const [firstName, setFirstName] = useState(user?.user?.first_name ?? "");
  const [lastName, setLastName]   = useState(user?.user?.last_name  ?? "");
  const [email]                   = useState(user?.user?.email      ?? "");

  // Personal info update
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const handleSaveProfile = () => {
    updateProfile(
      { first_name: firstName, last_name: lastName },
      {
        onSuccess: () => toast.success("Profile updated."),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const message =
            error?.response?.data?.errors?.message ||
            error?.response?.data?.message ||
            formatAxiosErrorMessage(error as AxiosError) ||
            "Couldn't update your profile.";
          toast.error(String(message));
        },
      }
    );
  };

  // Settings (notifications + proctor monitor toggles)
  const { data: settingsResp } = useGetSettings();
  const { mutate: saveSettings, isPending: isSavingSettings } = useUpdateSettings();
  type PendingSection = "notifications" | "proctor" | null;
  const [pendingSection, setPendingSection] = useState<PendingSection>(null);
  // Exam preferences are sourced from /exam-config/ — the same endpoint used by
  // the practice flow — so this section lists every config the user has on file.
  const { data: examConfigResp, isLoading: loadingExamConfigs } = useGetPracticeExamConfig();
  const examConfigs = examConfigResp?.data ?? [];

  // Subscription panel (current plan, credits, renewal). Pulled from the
  // same endpoint that powers the credit badge and upgrade gating.
  const { data: subResp, isLoading: loadingSub } = useUserSubscription();
  const { openUpgradeModal } = useSubscription();
  const activeSub =
    subResp?.data?.is_subscribed && subResp?.data?.subscription?.is_valid
      ? subResp.data.subscription
      : null;
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

  // Hydrate notification + proctor-monitor toggles when the server payload
  // arrives or changes. We use the "store info from previous renders"
  // pattern instead of useEffect — calling setState during render with a
  // ref-equality guard is React 19-safe and avoids the cascading-render
  // warning that fires for setState-in-effect for query-derived state.
  const settingsSnapshot = settingsResp?.data ?? null;
  const [seenSettings, setSeenSettings] = useState<typeof settingsSnapshot>(null);
  if (settingsSnapshot && settingsSnapshot !== seenSettings) {
    setSeenSettings(settingsSnapshot);
    setDailyReminder(settingsSnapshot.daily_study_reminder);
    setWeeklyReport(settingsSnapshot.weekly_report);
    setMarketingEmails(settingsSnapshot.product_updates);
    setProctorCamera(settingsSnapshot.camera_feed);
    setProctorAudio(settingsSnapshot.audio_cues);
    setProctorPhone(settingsSnapshot.phone_detection);
    setProctorGaze(settingsSnapshot.gaze_tracking);
  }

  // Section-scoped settings save — disables only the section currently saving
  // so the others stay responsive.
  const submitSection = (section: "notifications" | "proctor", payload: UpdateSettingsPayload) => {
    setPendingSection(section);
    saveSettings(payload, {
      onSettled: () => setPendingSection(null),
      onSuccess: () => toast.success("Settings updated."),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const message =
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          formatAxiosErrorMessage(error as AxiosError) ||
          "Couldn't update your settings.";
        toast.error(String(message));
      },
    });
  };

  const handleSaveNotifications = () => submitSection("notifications", {
    daily_study_reminder: dailyReminder,
    weekly_report: weeklyReport,
    product_updates: marketingEmails,
  });

  const handleSaveProctor = () => submitSection("proctor", {
    camera_feed: proctorCamera,
    audio_cues: proctorAudio,
    phone_detection: proctorPhone,
    gaze_tracking: proctorGaze,
  });

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
          {/* Identity hero — avatar + display name + verified email row */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-linear-to-br from-amber-50/80 via-white to-slate-50 dark:from-amber-500/10 dark:via-zinc-900 dark:to-zinc-950 px-5 py-5 mb-5">
            <div
              aria-hidden
              className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-[#F7C948]/20 dark:bg-amber-500/15 blur-3xl pointer-events-none"
            />
            <div className="relative flex items-center gap-4">
              <Avatar.Root className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-[#F7C948] ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 shadow-sm">
                <Avatar.Fallback className="w-full h-full bg-linear-to-tr font-inter font-semibold text-xl from-[#2B7FFF] to-[#615FFF] flex items-center justify-center text-white">
                  {initials || "U"}
                </Avatar.Fallback>
              </Avatar.Root>
              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 leading-tight truncate">
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Add your name"}
                </p>
                <div className="flex items-center gap-1.5 mt-1 min-w-0">
                  <Mail size={12} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                  <span className="text-xs text-slate-500 dark:text-zinc-400 truncate">{email || "—"}</span>
                  {email && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                      <BadgeCheck size={10} />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                className="ip"
              />
            </Field>
            <Field label="Last name">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
                className="ip"
              />
            </Field>
            <Field
              label="Email"
              hint="Changing your email requires verification — contact support."
            >
              <div className="relative">
                <Mail
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none"
                />
                <input
                  value={email}
                  disabled
                  className="ip pl-9 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </Field>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              Updates apply across the app instantly.
            </p>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? <>Updating <SmallSpinner /></> : "Update profile"}
            </button>
          </div>
        </Section>

        {/* Subscription */}
        <Section title="Subscription" icon={<Crown size={14} />}>
          {loadingSub ? (
            <div className="h-32 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          ) : activeSub ? (
            <SubscriptionCard
              planName={activeSub.plan.name}
              tier={activeSub.plan.tier}
              price={activeSub.plan.price}
              currency={activeSub.plan.currency}
              durationDays={activeSub.plan.duration_days}
              status={activeSub.status}
              startDate={activeSub.start_date}
              endDate={activeSub.end_date}
              daysRemaining={activeSub.days_remaining}
              creditsRemaining={activeSub.ai_credits_remaining}
              creditsTotal={activeSub.plan.ai_credits}
              questionLimit={activeSub.plan.question_limit}
              onUpgrade={openUpgradeModal}
            />
          ) : (
            <FreePlanCta onUpgrade={openUpgradeModal} />
          )}
        </Section>

        {/* Exam preferences */}
        <Section title="Exam preferences" icon={<BookOpen size={14} />}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {loadingExamConfigs
                ? "Loading your exams…"
                : examConfigs.length === 0
                ? "You haven't added any exams yet."
                : `${examConfigs.length} exam${examConfigs.length === 1 ? "" : "s"} on your study plan`}
            </p>
          </div>

          {loadingExamConfigs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map(i => (
                <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : examConfigs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-900/40 px-5 py-8 text-center">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#F7C948]/15 text-[#F7C948] mb-3">
                <BookOpen size={18} />
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">No exams on file</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Add an exam from the Practice page and it will show up here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examConfigs.map(c => (
                <ExamConfigCard key={c.id} config={c} />
              ))}
            </div>
          )}


   
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
              {(Object.keys(TOUR_META) as TourId[])
                .filter(tourId => isTourAvailable(tourId))
                .map(tourId => {
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

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleSaveProctor}
              disabled={isSavingSettings && pendingSection === "proctor"}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
            >
              {isSavingSettings && pendingSection === "proctor"
                ? <>Updating <SmallSpinner /></>
                : "Update proctoring"}
            </button>
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

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
            <button
              type="button"
              onClick={handleSaveNotifications}
              disabled={isSavingSettings && pendingSection === "notifications"}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
            >
              {isSavingSettings && pendingSection === "notifications"
                ? <>Updating <SmallSpinner /></>
                : "Update notifications"}
            </button>
          </div>
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

function ExamConfigCard({ config }: { config: ExamConfigEntry }) {
  const examDate = config.exam_date
    ? new Date(config.exam_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";
  const target = config.target_score?.trim() ? config.target_score : "—";
  const level = config.current_level?.trim() || null;
  const hours = config.daily_study_hours;
  // Backend sometimes returns config rows with no joined exam_type yet —
  // fall back to a placeholder name + zeroed counts so the card still renders.
  const examTypeName = config.exam_type?.name ?? "Pending";
  const totalQuestions = config.exam_type?.total_questions ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center h-6 px-2 rounded bg-[#F7C948] text-[#5A3300] font-black text-[10px] tracking-tight shrink-0">
          {examTypeName.toUpperCase()}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-zinc-500 capitalize">
           {totalQuestions} questions
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-zinc-500">Exam date</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-0.5 tabular-nums">{examDate}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-zinc-500">Target score</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 mt-0.5 tabular-nums">{target}</p>
        </div>
      </div>

      {(level || hours != null || config.send_progress_report) && (
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-zinc-800">
          {hours != null && (
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              {hours} hr{hours === 1 ? "" : "s"}/day
            </span>
          )}
          {level && (
            <span className="inline-flex items-center text-[10px] font-semibold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded capitalize">
              {level}
            </span>
          )}
          {config.send_progress_report && (
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
              Weekly report on
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function formatPlanPrice(amount: string, currency: string): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return `${amount} ${currency}`;
  if (currency === "NGN") return `₦${value.toLocaleString("en-NG")}`;
  return `${currency} ${value.toLocaleString()}`;
}

function planPeriodLabel(days: number): string {
  if (days >= 360) return "year";
  if (days >= 28) return "month";
  if (days >= 7) return "week";
  return `${days}d`;
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function SubscriptionCard({
  planName, tier, price, currency, durationDays,
  status, startDate, endDate, daysRemaining,
  creditsRemaining, creditsTotal, questionLimit,
  onUpgrade,
}: {
  planName: string;
  tier: string;
  price: string;
  currency: string;
  durationDays: number;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  creditsRemaining: number;
  creditsTotal: number;
  questionLimit: number;
  onUpgrade: () => void;
}) {
  const creditPct = creditsTotal > 0
    ? Math.min(100, Math.round((creditsRemaining / creditsTotal) * 100))
    : 0;
  const creditTone =
    creditPct > 50 ? "bg-emerald-500"
    : creditPct > 20 ? "bg-[#F7C948]"
    : "bg-rose-500";
  const isActive = status === "active";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#F7C948]/40 dark:border-amber-500/30 bg-linear-to-br from-[#FFFBEB] via-white to-[#FFF7ED] dark:from-amber-500/10 dark:via-zinc-900 dark:to-orange-500/10">
      <div
        aria-hidden
        className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#F7C948]/20 dark:bg-amber-500/15 blur-3xl pointer-events-none"
      />

      <div className="relative px-5 py-5">
        {/* Header — plan + status pill */}
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#F7C948] text-[#5A3300] shrink-0 shadow-sm">
              <Crown size={16} fill="currentColor" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-tight">
                {planName}
                <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {tier}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                {formatPlanPrice(price, currency)}
                <span className="text-slate-400 dark:text-zinc-500"> / {planPeriodLabel(durationDays)}</span>
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400 dark:bg-zinc-500"}`} />
            {status}
          </span>
        </div>

        {/* Allocation grid — credits + days remaining + question quota */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
          <div className="rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <Brain size={11} className="text-[#F7C948]" />
              AI credits
            </div>
            <p className="mt-1.5 text-base font-black tabular-nums text-slate-900 dark:text-zinc-100 leading-none">
              {creditsRemaining.toLocaleString()}
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium ml-0.5">
                /{creditsTotal.toLocaleString()}
              </span>
            </p>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden mt-2">
              <div className={`h-full rounded-full transition-all ${creditTone}`} style={{ width: `${creditPct}%` }} />
            </div>
          </div>
          <div className="rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <CalendarClock size={11} className="text-[#F7C948]" />
              Days left
            </div>
            <p className="mt-1.5 text-base font-black tabular-nums text-slate-900 dark:text-zinc-100 leading-none">
              {daysRemaining}
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium ml-0.5">
                /{durationDays}
              </span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-2 tabular-nums">
              Renews {formatDateShort(endDate)}
            </p>
          </div>
          <div className="rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-slate-200/70 dark:border-zinc-800 p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <Coins size={11} className="text-[#F7C948]" />
              Questions
            </div>
            <p className="mt-1.5 text-base font-black tabular-nums text-slate-900 dark:text-zinc-100 leading-none">
              {questionLimit.toLocaleString()}
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium ml-1">
                / session
              </span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-2">
              Cap per practice run
            </p>
          </div>
        </div>

        {/* Footer — period dates + manage */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F7C948]/30 dark:border-amber-500/20 flex-wrap">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Active since <span className="font-semibold text-slate-700 dark:text-zinc-200">{formatDateShort(startDate)}</span>
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            data-no-paywall
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5A3300] bg-[#F7C948] hover:bg-[#F0BE36] px-3 h-8 rounded-md transition-colors"
          >
            Change plan
          </button>
        </div>
      </div>
    </div>
  );
}

function FreePlanCta({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-linear-to-br from-slate-50 via-white to-amber-50/40 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-500/5 px-5 py-5">
      <div className="flex items-start gap-4 flex-wrap">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 shrink-0">
          <Crown size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">You&apos;re on the Free plan</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Upgrade to unlock the full question bank, AI explanations, and longer practice
            sessions. Cancel anytime.
          </p>
          <button
            type="button"
            onClick={onUpgrade}
            data-no-paywall
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold px-4 h-9 rounded-md text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
          >
            <Crown size={13} fill="currentColor" />
            See upgrade options
          </button>
        </div>
      </div>
    </div>
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
