"use client";

import { useEffect, useRef, useState } from "react";
import {
  AIFeedback,
  AIFeedbackRequest,
  MistakeAnalysis,
  MistakeAnalysisRequest,
  WeaknessPlan,
  WeaknessPlanRequest,
  DashboardInsight,
  DashboardInsightRequest,
  ProgressInsight,
  ProgressInsightRequest,
  QuestionAnalysis,
  QuestionAnalysisRequest,
  SessionReview,
  ReviewQuestion,
} from "./types";

interface HookState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Module-scoped cache shared across all hooks. Key is a namespaced string
// (e.g. "feedback:12", "mistakes:12") so different hooks never collide even
// if they'd otherwise produce the same depKey.
const aiCache = new Map<string, unknown>();

// Hot-module deduper: if two components mount with the same key simultaneously,
// we don't want them to each trigger their own setTimeout. Track in-flight keys
// so the second mount just waits for the first to finish.
const inFlight = new Map<string, Promise<unknown>>();

/**
 * Generic mock "fetcher" that mimics React Query's shape so the UI can be
 * designed against it. When the backend lands, swap the body of each public
 * hook (useAIFeedback, etc.) for a real useQuery call with the same key and
 * none of the surrounding UI needs to change.
 *
 * Features:
 * - Keyed caching: same depKey returns instantly with cached data on re-open.
 * - In-flight dedupe: two simultaneous mounts share one timer.
 * - Error surface: `builder` may throw; the error lands on `state.error`.
 * - `refetch` bypasses the cache.
 */
function useMockFetch<TReq, TRes>(
  req: TReq | null,
  builder: (req: TReq) => TRes | Promise<TRes>,
  cacheKey: string | null,
  delayMs = 1200,
): HookState<TRes> {
  const [data, setData] = useState<TRes | null>(() =>
    cacheKey && aiCache.has(cacheKey) ? (aiCache.get(cacheKey) as TRes) : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!req || !cacheKey) { setData(null); setError(null); return; }

    // Cache hit — skip the timer entirely.
    if (aiCache.has(cacheKey)) {
      lastKeyRef.current = cacheKey;
      setData(aiCache.get(cacheKey) as TRes);
      setError(null);
      setIsLoading(false);
      return;
    }

    lastKeyRef.current = cacheKey;
    setIsLoading(true);
    setData(null);
    setError(null);

    let cancelled = false;

    const run = async (): Promise<TRes> => {
      // If another component is already fetching this key, piggyback.
      if (inFlight.has(cacheKey)) {
        return (await inFlight.get(cacheKey)) as TRes;
      }
      const p = new Promise<TRes>((resolve, reject) => {
        setTimeout(() => {
          try {
            const result = builder(req);
            Promise.resolve(result).then(r => {
              aiCache.set(cacheKey, r);
              resolve(r);
            }, reject);
          } catch (e) {
            reject(e);
          }
        }, delayMs);
      });
      inFlight.set(cacheKey, p);
      try {
        return await p;
      } finally {
        inFlight.delete(cacheKey);
      }
    };

    run().then(
      r => { if (!cancelled) { setData(r); setIsLoading(false); } },
      e => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setIsLoading(false);
        }
      },
    );

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const refetch = () => {
    if (!req || !cacheKey) return;
    aiCache.delete(cacheKey);
    setIsLoading(true);
    setData(null);
    setError(null);
    setTimeout(() => {
      try {
        const result = builder(req);
        Promise.resolve(result).then(
          r => {
            aiCache.set(cacheKey, r);
            if (lastKeyRef.current === cacheKey) { setData(r); setIsLoading(false); }
          },
          e => {
            if (lastKeyRef.current === cacheKey) {
              setError(e instanceof Error ? e : new Error(String(e)));
              setIsLoading(false);
            }
          },
        );
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setIsLoading(false);
      }
    }, 900);
  };

  return { data, isLoading, error, refetch };
}

// ─── Overall session feedback ────────────────────────────────────────────────
function buildMockFeedback(req: AIFeedbackRequest): AIFeedback {
  const band = req.score >= 85 ? "excellent"
             : req.score >= 70 ? "good"
             : req.score >= 50 ? "fair"
             :                   "needs_work";
  const weak = req.weakTopics[0];
  const strong = req.strongTopics[0];

  const summary =
    band === "excellent" ? `Excellent session — ${req.score.toFixed(0)}% with ${req.accuracy.toFixed(0)}% accuracy. You're exam-ready.`
    : band === "good"    ? `Strong ${req.score.toFixed(0)}% run. Your ${strong ?? "strongest topic"} carried the score; one weak area kept it from excellent.`
    : band === "fair"    ? `Mid-range ${req.score.toFixed(0)}% — most questions correct but avoidable gaps in ${weak ?? "a couple of topics"} cost you points.`
    :                      `${req.score.toFixed(0)}% this round. Two weak topics are doing most of the damage; fix one and you'll jump a full band.`;

  const insights: string[] = [];
  if (strong) insights.push(`${strong} is your reliable topic — you're answering these quickly and correctly.`);
  else        insights.push(`No single topic stands out as a strength yet — consistency comes with more reps.`);
  if (weak)   insights.push(`Most misses clustered in ${weak}. This is usually a concept gap, not carelessness.`);
  if (req.avgTime > 120)      insights.push(`Averaging ${Math.round(req.avgTime)}s per question — well over the 90s target, so pace pressure will bite on the real paper.`);
  else if (req.avgTime < 40)  insights.push(`Averaging only ${Math.round(req.avgTime)}s per question. Fast is good but double-check your working on harder items.`);
  else                        insights.push(`Pacing is in the sweet spot (${Math.round(req.avgTime)}s/question) — keep that rhythm under exam conditions.`);

  const actions: string[] = [];
  if (weak)              actions.push(`Practice 10 ${weak} questions at mixed difficulty before your next full session.`);
  else                   actions.push(`Run another timed ${req.totalQuestions}-question session to confirm consistency.`);
  if (req.avgTime > 120) actions.push(`Do one untimed run to clean up reasoning, then immediately retry under timed mode.`);
  else                   actions.push(`Mix in a harder difficulty next session to keep pattern recognition sharp.`);
  actions.push(`Review every flagged question before hitting Finish — don't leave easy points behind.`);

  const motivation =
    band === "excellent" ? "You're dialed in. Keep the cadence — exam day will feel familiar."
    : band === "good"    ? "Foundation is there. One focused topic away from the next score band."
    : band === "fair"    ? "Two focused sessions this week and the jump will show up clearly."
    :                      "Everyone starts here. Pick one weak topic, own it first, then stack the next win.";

  return { summary, insights, actions, motivation };
}
export function useAIFeedback(req: AIFeedbackRequest | null) {
  return useMockFetch(req, buildMockFeedback, req ? `feedback:${req.session_id}` : null);
}

// ─── Mistake analysis ────────────────────────────────────────────────────────
function buildMockMistakeAnalysis(req: MistakeAnalysisRequest): MistakeAnalysis {
  const n = req.questions.length;
  const topics = Array.from(new Set(req.questions.map(q => q.topic).filter(Boolean))) as string[];
  const sameTopic = topics.length <= 1 && n >= 3;
  const manyMistakes = n >= 5;

  const patterns: string[] = [];
  if (sameTopic && topics[0]) {
    patterns.push(`All misses clustered in ${topics[0]} — points to a concept gap, not a bad day.`);
  } else if (topics.length >= 3) {
    patterns.push(`Mistakes spread across ${topics.length} topics — suggests rushed reading more than topic gaps.`);
  }
  if (manyMistakes) {
    patterns.push(`High volume of errors (${n}) — worth slowing down to re-read each question's constraints.`);
  } else {
    patterns.push(`Small number of misses (${n}) — likely careless slips rather than knowledge holes.`);
  }
  patterns.push(`Several wrong answers look like plausible distractors the author planted — a sign of skimming, not understanding.`);

  const rootCauses: string[] = [];
  if (sameTopic) rootCauses.push(`Core concept in ${topics[0]} hasn't fully clicked yet — the distractors exploit a textbook misunderstanding.`);
  rootCauses.push(`Time pressure likely pushed you toward the first reasonable-looking answer instead of eliminating wrong ones.`);
  rootCauses.push(`Low confidence markers often predict wrong answers — you felt shaky but didn't slow down.`);

  const avoid: string[] = [];
  if (sameTopic && topics[0]) avoid.push(`Before your next session, read the ${topics[0]} explainer or re-watch a worked example.`);
  avoid.push(`For every question, eliminate at least one option explicitly before picking — even on easy items.`);
  avoid.push(`Flag any question where you felt less than "certain" and come back to it before finishing.`);

  const summary = sameTopic && topics[0]
    ? `One weak topic (${topics[0]}) is driving most of the damage. Closing that gap should erase most of these mistakes.`
    : manyMistakes
    ? `Most of this is pace, not knowledge — read each stem twice and your error rate drops fast.`
    : `A handful of careless misses. Small habit changes (eliminate, flag, revisit) will clean these up.`;

  return { patterns, root_causes: rootCauses, avoid_next_time: avoid, summary };
}
export function useMistakeAnalysis(req: MistakeAnalysisRequest | null) {
  return useMockFetch(req, buildMockMistakeAnalysis, req ? `mistakes:${req.session_id}` : null, 1100);
}

// ─── Weakness study plan ─────────────────────────────────────────────────────
function buildMockWeaknessPlan(req: WeaknessPlanRequest): WeaknessPlan {
  const topics = req.topics.length > 0 ? req.topics : ["General"];
  const primary = topics[0];

  const plan = topics.slice(0, 3).map((topic, i) => ({
    topic,
    question_count: i === 0 ? 15 : 10,
    focus: i === 0
      ? `Core definitions and the two most common question shapes — start from the simplest variants.`
      : `Pattern-match the most common question formats, then ramp difficulty.`,
    common_mistakes: i === 0
      ? [
          `Skipping the "read twice" step and missing a subtle constraint in the stem.`,
          `Choosing the first plausible answer without eliminating the obvious wrong one first.`,
        ]
      : [
          `Over-relying on memorized formulas when the question wants reasoning.`,
          `Ignoring units or sign conventions mid-calculation.`,
        ],
  }));

  return {
    start_with: `${primary} — it shows up most often in this exam and is the fastest topic to unlock confidence in.`,
    practice_plan: plan,
    strategy: `Spend 20 minutes a day on ${primary} this week, then rotate to the next topic. Aim for 10 reps in untimed mode first to build mental models, then 10 in timed mode to build speed. Don't rush to cover all topics at once — depth on one topic beats skimming three.`,
  };
}
export function useWeaknessPlan(req: WeaknessPlanRequest | null) {
  return useMockFetch(req, buildMockWeaknessPlan, req ? `plan:${req.session_id}` : null, 1000);
}

// ─── Dashboard glance insight ────────────────────────────────────────────────
function buildMockDashboardInsight(req: DashboardInsightRequest): DashboardInsight {
  const weak = req.weakTopics[0];
  const trending = req.improvement >= 5 ? "up"
                : req.improvement <= -5 ? "down"
                : "flat";

  const feedback =
    trending === "up"   ? `Accuracy climbing — ${req.improvement.toFixed(0)}% gain this week, keep pushing.`
    : trending === "down" ? `Accuracy dropped ${Math.abs(req.improvement).toFixed(0)}% — fatigue or ${weak ?? "a new topic"} slowing you.`
    : req.accuracy >= 80 ? `Accuracy steady at ${req.accuracy.toFixed(0)}% — one weak topic from the next jump.`
    : req.avgTime > 120  ? `Pace is dragging (${Math.round(req.avgTime)}s/question) — cost real points.`
    :                      `Plateau at ${req.accuracy.toFixed(0)}% — time for a harder difficulty or new topic.`;

  const nextAction =
    weak                  ? `Run 10 ${weak} questions at mixed difficulty today.`
    : req.recentMistakes > 3 ? `Review your last ${req.recentMistakes} missed questions before starting new ones.`
    : req.avgTime > 120   ? `Do one untimed run to tidy reasoning, then retry under timer.`
    :                       `Take a timed session at harder difficulty to stress-test consistency.`;

  const focusArea = weak ?? "Consistency across topics";

  const motivation =
    trending === "up"   ? "Momentum's yours — don't break it."
    : trending === "down" ? "Dips happen. One focused session to reset."
    :                     "Small wins compound. Show up today.";

  return { feedback, nextAction, focusArea, motivation };
}
export function useDashboardInsight(req: DashboardInsightRequest | null) {
  const key = req ? `dashboard:${req.accuracy}-${req.recentMistakes}-${req.improvement}` : null;
  return useMockFetch(req, buildMockDashboardInsight, key, 900);
}

// ─── Long-term progress insight ──────────────────────────────────────────────
function buildMockProgressInsight(req: ProgressInsightRequest): ProgressInsight {
  const { accuracyTrend, avgTimeTrend, strongTopics, weakTopics, consistency } = req;
  const strong = strongTopics[0];
  const weak   = weakTopics[0];

  const summary = accuracyTrend === "increasing" && consistency === "high"
    ? `Your accuracy is trending up and your practice rhythm is steady — this is the pattern that produces exam-day results. ${strong ? `${strong} is leading the charge` : "Your mastery is broad"}.`
    : accuracyTrend === "dropping"
    ? `Accuracy has slipped lately${consistency === "low" ? " and practice has been uneven" : ""}. ${weak ? `Most of the drop traces to ${weak}` : "The weakness is spread, suggesting focus rather than a single topic gap"}.`
    : consistency === "low"
    ? `Performance is holding steady but practice has been inconsistent. Consistency is almost always the unlock before accuracy climbs further.`
    : `You're in a plateau. Numbers are stable but no clear upward movement — time to change something: difficulty, topic, or mode.`;

  const insights: string[] = [];
  if (accuracyTrend === "increasing") {
    insights.push(`Accuracy trend is ${accuracyTrend} — whatever you changed recently is working; don't abandon it.`);
  } else if (accuracyTrend === "dropping") {
    insights.push(`Accuracy is ${accuracyTrend}. When this happens mid-prep it's usually new material, fatigue, or rushing — not actual skill loss.`);
  } else {
    insights.push(`Accuracy is flat — stable is good, but without a push you won't break past your current band.`);
  }

  if (avgTimeTrend === "dropping") {
    insights.push(`You're getting faster per question. Watch accuracy doesn't slip with the speed — speed without precision is churn.`);
  } else if (avgTimeTrend === "increasing") {
    insights.push(`Average time per question is creeping up — could be harder material, or hesitation. If it's hesitation, trust your first read.`);
  } else {
    insights.push(`Pacing is stable. That's the steady base you want going into timed exams.`);
  }

  if (weak && strong) {
    insights.push(`${strong} pulls your average up; ${weak} pulls it down. Closing that gap is the single biggest lever you have.`);
  } else if (consistency === "low") {
    insights.push(`Inconsistent practice creates inconsistent retention. Even 20 minutes a day beats a single weekend marathon.`);
  } else {
    insights.push(`No topic stands out as a standalone drag — progress will come from volume and variety, not triage.`);
  }

  const recommendations: string[] = [];
  if (weak) {
    recommendations.push(`Spend the next 3 sessions on ${weak} before touching anything else — depth over breadth.`);
  } else {
    recommendations.push(`Introduce a harder difficulty band to force growth past your current plateau.`);
  }
  if (consistency !== "high") {
    recommendations.push(`Commit to a daily 20-minute practice slot. Short and daily beats long and sporadic, every time.`);
  } else {
    recommendations.push(`Keep the daily rhythm — your consistency is your biggest edge right now.`);
  }
  recommendations.push(`After each session, spend 5 minutes re-reading missed questions. Retention compounds faster than new reps.`);

  return { summary, insights, recommendations };
}
export function useProgressInsight(req: ProgressInsightRequest | null) {
  const key = req
    ? `progress:${req.accuracyTrend}-${req.avgTimeTrend}-${req.consistency}-${req.weakTopics.length}-${req.strongTopics.length}`
    : null;
  return useMockFetch(req, buildMockProgressInsight, key, 1100);
}

// ─── Per-question deep analysis ──────────────────────────────────────────────
function buildMockQuestionAnalysis(req: QuestionAnalysisRequest): QuestionAnalysis {
  const correctOption = req.options.find(o => o.label === req.correct_answer);
  const pickedOption  = req.options.find(o => o.label === req.selected_answer);
  const gotItRight    = req.selected_answer === req.correct_answer;

  const why_correct = correctOption
    ? `The answer is ${req.correct_answer} ("${correctOption.text}") because the question is asking you to apply the core rule of ${req.topic ?? "this topic"} to the numbers given. Walk through the stem one clause at a time, identify which variable is fixed, and the right option becomes the only one that satisfies every condition.`
    : `Option ${req.correct_answer} satisfies every constraint in the stem. Work through each condition in order and eliminate the options that fail at least one.`;

  const why_wrong = !gotItRight && pickedOption
    ? `"${pickedOption.text}" (${req.selected_answer}) is a distractor designed to catch you if you only read half the stem. It satisfies part of the condition but breaks the final one — the author planted it precisely because it's the most common mistake.`
    : !req.selected_answer
    ? `You skipped this question. Worth coming back to — don't leave points on the table on a question that's this recoverable.`
    : null;

  const common_pitfalls = [
    `Jumping to the first option that "looks right" instead of testing it against every condition.`,
    `Confusing ${req.topic ?? "the key concept"} with a close-but-different rule that applies in a slightly different case.`,
    `Rushing the arithmetic and picking an option that's numerically close to the real answer.`,
  ];

  const alt_explanation = `Try this instead: restate the question in your own words, circle the one word that changes the answer (usually a qualifier like "except," "only," or "most"), then see which option matches that word exactly. That process eliminates two options instantly and leaves an easy pick between the remaining two.`;

  const related_practice = `Run 5 more ${req.topic ?? "similar"} questions at this difficulty — focus on ones where the stem has multiple conditions. You'll internalize the "check every condition" habit fast.`;

  return { why_correct, why_wrong, common_pitfalls, alt_explanation, related_practice };
}
export function useQuestionAnalysis(req: QuestionAnalysisRequest | null) {
  return useMockFetch(req, buildMockQuestionAnalysis, req ? `qanalysis:${req.question_id}` : null, 900);
}

// ─── Session review (full answer key after submission) ───────────────────────
// Backend endpoint will return this shape. For UI dev we fabricate a
// deterministic review based on sessionId so the page renders consistently.
function buildMockSessionReview(sessionId: string | number): SessionReview {
  const seed = String(sessionId).length;
  const examTypes = ["WAEC", "JAMB", "SAT", "GRE"];
  const topics = ["Algebra", "Geometry", "Reading comprehension", "Data interpretation", "Vocabulary"];

  const mkQuestion = (i: number): ReviewQuestion => {
    const topic = topics[(i + seed) % topics.length];
    const correctLabel = ["A", "B", "C", "D"][(i * 3 + seed) % 4];
    // Every 3rd question wrong, every 7th skipped.
    const picked = (i + seed) % 7 === 0 ? null
                 : (i + seed) % 3 === 0 ? ["A", "B", "C", "D"].find(l => l !== correctLabel) ?? "B"
                 :                        correctLabel;
    const is_correct = picked === correctLabel;
    return {
      id: i + 1,
      text:
        topic === "Algebra"      ? `If 3x + 7 = ${10 + i}, what is the value of x?` :
        topic === "Geometry"     ? `A rectangle has length ${6 + i} and width ${4 + (i % 3)}. What is its perimeter?` :
        topic === "Reading comprehension" ? `Based on the passage, the author's primary purpose is to:` :
        topic === "Data interpretation"   ? `According to the chart, which year had the largest year-over-year increase in revenue?` :
                                 `Which word best replaces the underlined word "${["prescient","salient","innocuous","verbose"][i % 4]}" in the sentence?`,
      options: [
        { label: "A", text: topic === "Algebra" ? `${i}` : "Answer A for this question" },
        { label: "B", text: topic === "Algebra" ? `${i + 1}` : "Answer B for this question" },
        { label: "C", text: topic === "Algebra" ? `${i + 2}` : "Answer C for this question" },
        { label: "D", text: topic === "Algebra" ? `${i + 3}` : "Answer D for this question" },
      ],
      correct_answer: correctLabel,
      selected_answer: picked,
      is_correct,
      explanation:
        topic === "Algebra"
          ? `Isolate x: subtract 7 from both sides, then divide by 3. The value should fall in the small single-digit range typical of intro algebra questions.`
          : `Work through the stem clause by clause. Eliminate options that break at least one condition, then compare the remaining two side-by-side.`,
      topic,
      difficulty: ["easy", "medium", "hard"][(i + seed) % 3],
      time_spent_sec: 45 + ((i * 13 + seed) % 60),
    };
  };

  const total = 10;
  const questions = Array.from({ length: total }, (_, i) => mkQuestion(i));
  const correct_answers = questions.filter(q => q.is_correct).length;

  return {
    session_id: sessionId,
    exam_type: examTypes[seed % examTypes.length],
    difficulty: "mixed",
    score: Math.round((correct_answers / total) * 100),
    correct_answers,
    total_questions: total,
    submitted_at: new Date().toISOString(),
    questions,
  };
}
export function useSessionReview(sessionId: string | number | null) {
  return useMockFetch(
    sessionId,
    (id) => buildMockSessionReview(id),
    sessionId != null ? `review:${sessionId}` : null,
    800,
  );
}
