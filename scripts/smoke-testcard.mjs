// Replays the exact field-access pattern from DashboardLeft.TestCard
// against the user-supplied response payload (which contains session 59
// with `topics_selected: null` and `time_limit_minutes: null`).
// Crashes here → the source fix is wrong. No crash → the fix is correct
// and any crash on prepmaster.app is from the not-yet-deployed old bundle.

const payload = {
  status: "success",
  data: [
    {
      id: 33,
      subjects_selected: [],
      topics_selected: [],
      difficulty_level: "easy",
      time_limit_minutes: 45,
      score: 10.0,
      status: "completed",
      created_at: "2026-05-01T13:15:35.817956Z",
      updated_at: "2026-05-01T14:22:23.265944Z",
    },
    {
      id: 46,
      subjects_selected: [
        { id: 1, name: "Mathematics" },
        { id: 2, name: "English" },
      ],
      topics_selected: [],
      difficulty_level: "easy",
      time_limit_minutes: 90,
      score: 20.0,
      status: "completed",
      created_at: "2026-05-13T09:48:18.478113Z",
      updated_at: "2026-05-13T09:51:39.108538Z",
    },
    {
      id: 59,
      subjects_selected: [{ id: 37, name: "physics" }],
      topics_selected: null, // ← the culprit
      difficulty_level: "hard",
      time_limit_minutes: null, // ← also nullable
      score: 80.0,
      status: "completed",
      created_at: "2026-05-26T10:14:10.559150Z",
      updated_at: "2026-05-26T10:14:48.409957Z",
    },
  ],
};

function renderTestCard(test) {
  const subjects = Array.isArray(test?.subjects_selected) ? test.subjects_selected : [];
  const topics = Array.isArray(test?.topics_selected) ? test.topics_selected : [];
  const subjectNames =
    subjects.map((s) => s?.name).filter(Boolean).join(", ") || "Mixed subjects";
  const topicCount = topics.length;
  const createdAt = test?.created_at ? new Date(test.created_at) : null;
  const date = createdAt && !isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const rawScore = typeof test?.score === "number" ? test.score : Number(test?.score ?? 0);
  const score = Number.isFinite(rawScore) ? rawScore : 0;
  const duration = test?.time_limit_minutes ? `${test.time_limit_minutes}m` : "untimed";
  const isCompleted = test?.status === "completed";
  return { id: test?.id, subjectNames, topicCount, date, score, duration, isCompleted };
}

console.log("Replaying TestCard on every row from the failing pagination response...\n");
for (const t of payload.data) {
  try {
    const out = renderTestCard(t);
    console.log("✓ id=" + t.id, out);
  } catch (e) {
    console.error("✗ id=" + t.id + " THREW:", e.message);
    process.exit(1);
  }
}
console.log("\nAll rows rendered without crashing — the source fix is correct.");
