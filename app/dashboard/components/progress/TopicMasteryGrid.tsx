"use client";

interface TopicCell {
  topic: string;
  mastery: number;
  attempts: number;
}

interface SubjectRow {
  subject: string;
  topics: TopicCell[];
}

const MOCK: SubjectRow[] = [
  {
    subject: "Physics",
    topics: [
      { topic: "Kinematics",          mastery: 92, attempts: 34 },
      { topic: "Dynamics",            mastery: 78, attempts: 22 },
      { topic: "Thermodynamics",      mastery: 32, attempts: 18 },
      { topic: "Electromagnetism",    mastery: 61, attempts: 15 },
      { topic: "Optics",              mastery: 84, attempts: 12 },
      { topic: "Modern Physics",      mastery: 45, attempts: 9  },
    ],
  },
  {
    subject: "Chemistry",
    topics: [
      { topic: "Stoichiometry",       mastery: 41, attempts: 22 },
      { topic: "Kinetics",            mastery: 58, attempts: 14 },
      { topic: "Organic Reactions",   mastery: 67, attempts: 27 },
      { topic: "Equilibria",          mastery: 73, attempts: 19 },
      { topic: "Acids & Bases",       mastery: 88, attempts: 21 },
      { topic: "Electrochemistry",    mastery: 29, attempts: 7  },
    ],
  },
  {
    subject: "Biology",
    topics: [
      { topic: "Cell Biology",        mastery: 81, attempts: 28 },
      { topic: "Genetics",            mastery: 69, attempts: 20 },
      { topic: "Evolution",           mastery: 55, attempts: 10 },
      { topic: "Ecology",             mastery: 76, attempts: 13 },
      { topic: "Physiology",          mastery: 48, attempts: 17 },
      { topic: "Molecular Biology",   mastery: 37, attempts: 8  },
    ],
  },
  {
    subject: "Mathematics",
    topics: [
      { topic: "Algebra",             mastery: 94, attempts: 41 },
      { topic: "Calculus",            mastery: 72, attempts: 30 },
      { topic: "Probability",         mastery: 55, attempts: 16 },
      { topic: "Geometry",            mastery: 83, attempts: 22 },
      { topic: "Trigonometry",        mastery: 66, attempts: 18 },
      { topic: "Statistics",          mastery: 51, attempts: 11 },
    ],
  },
];

// Single-hue emerald scale on slate background. Deeper = stronger mastery.
function cellBg(m: number) {
  if (m < 40) return "#FEE2E2";
  if (m < 60) return "#FEF3C7";
  if (m < 75) return "#D1FAE5";
  if (m < 90) return "#6EE7B7";
  return             "#047857";
}
function cellFg(m: number) {
  if (m < 40) return "#991B1B";
  if (m < 60) return "#78350F";
  if (m < 75) return "#065F46";
  if (m < 90) return "#064E3B";
  return             "#F0FDF4";
}

function subjectAvg(topics: TopicCell[]) {
  return Math.round(topics.reduce((a, b) => a + b.mastery, 0) / topics.length);
}

export default function TopicMasteryGrid({ rows = MOCK }: { rows?: SubjectRow[] } = {}) {
  return (
    <section className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Content-area mastery</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Mastery score derived from recent attempts · weighted by recency</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400">
          <Legend color="#FEE2E2" label="<40" />
          <Legend color="#FEF3C7" label="40–59" />
          <Legend color="#D1FAE5" label="60–74" />
          <Legend color="#6EE7B7" label="75–89" />
          <Legend color="#047857" label="90+" />
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800">
              <th className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium w-36">Subject</th>
              <th className="text-center px-2 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium w-14">Avg</th>
              <th className="text-left px-2 py-2.5 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-medium">Topics · mastery score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const avg = subjectAvg(row.topics);
              return (
                <tr key={row.subject} className={ri > 0 ? "border-t border-slate-100 dark:border-zinc-800" : ""}>
                  <td className="px-5 py-3 align-middle">
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{row.subject}</p>
                    <p className="text-[11px] text-slate-400">{row.topics.length} topics</p>
                  </td>
                  <td className="px-2 py-3 text-center align-middle">
                    <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">{avg}</span>
                  </td>
                  <td className="px-2 py-3 align-middle">
                    <div className="flex gap-1 flex-wrap">
                      {row.topics.map(t => (
                        <div
                          key={t.topic}
                          title={`${t.topic} · ${t.mastery}% mastery · ${t.attempts} attempts`}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium tabular-nums cursor-help"
                          style={{ background: cellBg(t.mastery), color: cellFg(t.mastery) }}
                        >
                          <span className="font-semibold">{t.mastery}</span>
                          <span className="opacity-70 text-[10px]">{t.topic}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
