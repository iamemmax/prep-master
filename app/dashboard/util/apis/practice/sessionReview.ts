import { adminAxios } from "@/lib/axios";
import { QUERYKEY } from "@/key/queryKey";
import { useQuery } from "@tanstack/react-query";
import { SessionReview, ReviewQuestion, ReviewOption } from "../../ai/types";

// ─── Raw backend shapes ──────────────────────────────────────────────────────
interface RawSubject {
  id: number;
  reference: string;
  name: string;
  difficulty_level: string | null;
  total_topics: number;
  total_questions: number;
}

interface RawTopic {
  id: number;
  reference: string;
  name: string;
}

interface RawReviewQuestion {
  question_id: number;
  text: string;
  options: string | Record<string, string>;
  difficulty_level: string;
  subject: RawSubject;
  topic: RawTopic;
  correct_answer: string;
  explanation: string;
  selected_answer: string | null;
  is_correct: boolean | null;
}

interface RawSessionReviewData {
  session_id: number;
  reference: string;
  status: string;
  score: number;
  session_mode: string;
  start_time: string;
  end_time: string | null;
  number_of_questions: number;
  total_answered: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  questions: RawReviewQuestion[];
}

interface RawSessionReviewResponse {
  status: string;
  data: RawSessionReviewData;
  message: string;
}

// ─── Mapping ─────────────────────────────────────────────────────────────────
function parseOptions(raw: string | Record<string, string>): ReviewOption[] {
  const obj: Record<string, string> =
    typeof raw === "string" ? safeParseJSON(raw) : raw;
  return Object.entries(obj)
    .map(([label, text]) => ({ label: label.toUpperCase(), text }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function safeParseJSON(s: string): Record<string, string> {
  try {
    const parsed = JSON.parse(s);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function mapQuestion(q: RawReviewQuestion): ReviewQuestion {
  const selected = q.selected_answer ? q.selected_answer.toUpperCase() : null;
  const correct = q.correct_answer.toUpperCase();
  return {
    id: q.question_id,
    text: q.text,
    options: parseOptions(q.options),
    correct_answer: correct,
    selected_answer: selected,
    is_correct: q.is_correct === true,
    explanation: q.explanation,
    topic: q.topic?.name ?? "",
    difficulty: q.difficulty_level,
  };
}

function mapSessionReview(raw: RawSessionReviewData): SessionReview {
  const subjectName = raw.questions[0]?.subject?.name;
  return {
    session_id: raw.session_id,
    exam_type: subjectName || raw.session_mode || "Practice",
    difficulty: raw.questions[0]?.difficulty_level ?? "mixed",
    score: raw.score,
    correct_answers: raw.correct_answers,
    total_questions: raw.number_of_questions,
    submitted_at: raw.end_time ?? raw.start_time,
    questions: raw.questions.map(mapQuestion),
  };
}

// ─── Fetcher + hook ──────────────────────────────────────────────────────────
export const getSessionReview = async (sessionId: string | number) => {
  const response = await adminAxios.get<RawSessionReviewResponse>(
    `/api/v1/prepmaster/student/practice/session/${sessionId}/review/`,
  );
  return mapSessionReview(response.data.data);
};

export const useGetSessionReview = (sessionId: string | number | null) => {
  return useQuery({
    queryKey: [QUERYKEY.PRACTICE_SESSION_REVIEW, sessionId],
    queryFn: () => getSessionReview(sessionId as string | number),
    staleTime: 1000 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: sessionId != null && sessionId !== "",
  });
};
