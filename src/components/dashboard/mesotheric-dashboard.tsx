"use client";

import type { WeeklyReviewView } from "../../actions/weekly-review-actions";
import WeeklyReviewCard from "./weekly-review-card";
import type { DashboardAnalyticsView } from "../../actions/analytics-actions";
import AnalyticsStrip from "./analytics-strip";
import { useState } from "react";
import {
  createHabitAction,
  createHabitLogAction,
  updateHabitPathAction,
  type HabitLogView,
  type HabitView,
} from "../../actions/habit-actions";
import {
  upsertTodayDailyPlanAction,
  type DailyPlanView,
} from "../../actions/daily-plan-actions";

import {
  createJournalEntryAction,
  type JournalEntryView,
} from "../../actions/journal-actions";

type HabitType = "SHADOW" | "LIGHT";
type HabitIntention = "OBSERVE" | "REDUCE" | "TRANSMUTE" | "RELEASE";

type Habit = HabitView;
type HabitLog = HabitLogView;
type DailyPlan = DailyPlanView | null;
type JournalEntry = JournalEntryView;

export default function MesothericDashboard({
  initialHabits,
  initialHabitLogs,
  initialDailyPlan,
  initialJournalEntries,
  initialAnalytics,
  initialWeeklyReview,
}: {
  initialHabits: Habit[];
  initialHabitLogs: HabitLog[];
  initialDailyPlan: DailyPlan;
  initialJournalEntries: JournalEntry[];
  initialAnalytics: DashboardAnalyticsView;
  initialWeeklyReview: WeeklyReviewView;
}) {
const [habits, setHabits] = useState<Habit[]>(initialHabits);
const [habitLogs, setHabitLogs] = useState<HabitLog[]>(initialHabitLogs);
const [dailyPlan, setDailyPlan] = useState<DailyPlan>(initialDailyPlan);
const [journalEntries, setJournalEntries] =
  useState<JournalEntry[]>(initialJournalEntries);


const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
const [isLogHabitOpen, setIsLogHabitOpen] = useState(false);
const [isPathModalOpen, setIsPathModalOpen] = useState(false);
const [isDailyPlanOpen, setIsDailyPlanOpen] = useState(false);
const [mindDumpContent, setMindDumpContent] = useState("");
const [mindDumpMood, setMindDumpMood] = useState("");

  const [habitTitle, setHabitTitle] = useState("");
  const [habitType, setHabitType] = useState<HabitType>("SHADOW");
  const [habitIntention, setHabitIntention] =
    useState<HabitIntention>("OBSERVE");
  const [linkedLightHabit, setLinkedLightHabit] = useState("");
  
  const [dailyTarget, setDailyTarget] = useState(initialDailyPlan?.target ?? "");
const [milestoneOne, setMilestoneOne] = useState(
  initialDailyPlan?.milestones[0] ?? ""
);
const [milestoneTwo, setMilestoneTwo] = useState(
  initialDailyPlan?.milestones[1] ?? ""
);
const [milestoneThree, setMilestoneThree] = useState(
  initialDailyPlan?.milestones[2] ?? ""
);
const [dailyNotes, setDailyNotes] = useState(initialDailyPlan?.notes ?? "");


  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [logCompleted, setLogCompleted] = useState(true);
  const [logTrigger, setLogTrigger] = useState("");
  const [logMood, setLogMood] = useState("");
  const [logNotes, setLogNotes] = useState("");

  const [selectedPathHabitId, setSelectedPathHabitId] = useState("");
  const [selectedPathIntention, setSelectedPathIntention] =
    useState<HabitIntention>("OBSERVE");
  const [releaseTargetDate, setReleaseTargetDate] = useState("");



async function handleCreateHabit() {
  if (!habitTitle.trim()) return;

  const updatedHabits = await createHabitAction({
    title: habitTitle,
    type: habitType,
    intention: habitIntention,
    linkedLightHabit,
  });

    setHabits(updatedHabits);

    setHabitTitle("");
    setHabitType("SHADOW");
    setHabitIntention("OBSERVE");
    setLinkedLightHabit("");
    setIsCreateHabitOpen(false);
  }

  async function handleCreateHabitLog() {
    if (!selectedHabitId) return;

    const updatedLogs = await createHabitLogAction({
      habitId: selectedHabitId,
      completed: logCompleted,
      trigger: logTrigger,
      mood: logMood as
        | "CALM"
        | "FOCUSED"
        | "TIRED"
        | "ANXIOUS"
        | "MOTIVATED"
        | "FRUSTRATED"
        | "NEUTRAL"
        | "",
      notes: logNotes,
    });

    setHabitLogs(updatedLogs);

    setSelectedHabitId("");
    setLogCompleted(true);
    setLogTrigger("");
    setLogMood("");
    setLogNotes("");
    setIsLogHabitOpen(false);
  }

  async function handleSaveMindDump() {
  if (!mindDumpContent.trim()) return;

  const result = await createJournalEntryAction({
    content: mindDumpContent,
    mood: mindDumpMood,
  });

  setJournalEntries(result.recentEntries);
  setMindDumpContent("");
  setMindDumpMood("");
}

  function getPathGuidance(intention: HabitIntention) {
    switch (intention) {
      case "OBSERVE":
        return {
          title: "Observe Path",
          description:
            "You are watching this pattern without pressure. The goal is awareness, not immediate change.",
          action:
            "Notice when the habit appears, what triggered it, and what emotion was present.",
        };

      case "REDUCE":
        return {
          title: "Reduce Path",
          description:
            "You are lowering the frequency of this habit gradually. The goal is smaller, consistent improvement.",
          action:
            "Choose one small boundary that makes the habit harder to repeat today.",
        };

      case "TRANSMUTE":
        return {
          title: "Transmutation Path",
          description:
            "You are redirecting the energy of the Shadow Habit into a Light Habit.",
          action:
            "When the urge appears, perform the linked Light Habit or choose one opposite action.",
        };

      case "RELEASE":
        return {
          title: "Release Path",
          description:
            "You are preparing to end this pattern. The goal is commitment, structure, and replacement.",
          action:
            "Identify the trigger, remove one access point, and choose a replacement action.",
        };
    }
  }

  function openPathModal(habit: Habit) {
    setSelectedPathHabitId(habit.id);
    setSelectedPathIntention(habit.intention);
    setReleaseTargetDate("");
    setIsPathModalOpen(true);
  }

  async function handleUpdateHabitPath() {
    if (!selectedPathHabitId) return;

    const updatedHabits = await updateHabitPathAction({
      habitId: selectedPathHabitId,
      intention: selectedPathIntention,
      releaseTargetDate:
        selectedPathIntention === "RELEASE" && releaseTargetDate
          ? releaseTargetDate
          : undefined,
    });

    setHabits(updatedHabits);

    setSelectedPathHabitId("");
    setSelectedPathIntention("OBSERVE");
    setReleaseTargetDate("");
    setIsPathModalOpen(false);
  }

async function handleSaveDailyPlan() {
  if (!dailyTarget.trim()) return;

  const updatedPlan = await upsertTodayDailyPlanAction({
    target: dailyTarget,
    milestones: [milestoneOne, milestoneTwo, milestoneThree],
    notes: dailyNotes,
  });

  setDailyPlan(updatedPlan);
  setIsDailyPlanOpen(false);
}

  const shadowHabits = habits.filter((habit) => habit.type === "SHADOW");
  const lightHabits = habits.filter((habit) => habit.type === "LIGHT");

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground transition-colors duration-300 md:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="hermetic-card rounded-3xl p-6">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-amber-400">
            Mesotheric
          </p>

          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            The middle path between shadow and light.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300 md:text-base">
            Observe your Shadow Habits, choose Release or Transmutation, and
            turn unconscious patterns into intentional Light Habits.
          </p>
        </header>
        <AnalyticsStrip analytics={initialAnalytics} />

        <WeeklyReviewCard review={initialWeeklyReview} />

        <section className="hermetic-card rounded-3xl p-6">
  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
    <div>
      <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
        Daily Plan
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        {dailyPlan?.target || "Define today’s main target."}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-text">
        Set the intention for the day before the day shapes you.
      </p>
    </div>

    <button
      type="button"
      onClick={() => setIsDailyPlanOpen(true)}
      className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
    >
      {dailyPlan ? "Edit Daily Plan" : "Create Daily Plan"}
    </button>
  </div>

  {dailyPlan ? (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {dailyPlan.milestones.length > 0 ? (
        dailyPlan.milestones.map((milestone, index) => (
          <div
            key={`${milestone}-${index}`}
            className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">
              Milestone {index + 1}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              {milestone}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-stone-400">
          No milestones added yet.
        </p>
      )}
    </div>
  ) : (
    <div className="mt-6 rounded-2xl border border-dashed border-stone-700 bg-stone-950/70 p-5 text-sm text-stone-400">
      No daily plan created yet. Add a target and milestones for today.
    </div>
  )}

  {dailyPlan?.notes && (
    <div className="mt-4 rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-text/80">
        Notes
      </p>
      <p className="mt-2 text-sm leading-6 ">
        {dailyPlan.notes}
      </p>
    </div>
  )}
</section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="hermetic-card rounded-3xl p-6">
            <p className="text-sm text-stone-400">Shadow Habits</p>
            <p className="mt-2 text-4xl font-semibold">{shadowHabits.length}</p>
          </div>

          <div className="hermetic-card rounded-3xl p-6">
            <p className="text-sm text-stone-400">Light Habits</p>
            <p className="mt-2 text-4xl font-semibold">{lightHabits.length}</p>
          </div>

          <div className="hermetic-card rounded-3xl p-6">
            <p className="text-sm text-stone-400">Today’s Logs</p>
            <p className="mt-2 text-4xl font-semibold">{habitLogs.length}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="hermetic-card rounded-3xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
                  Habit Polarity
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Your Shadow and Light Habits
                </h2>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateHabitOpen(true)}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
                >
                  Add Habit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedHabitId(habits[0]?.id ?? "");
                    setIsLogHabitOpen(true);
                  }}
                  disabled={habits.length === 0}
                  className="rounded-full border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Log Habit
                </button>
              </div>
            </div>

            {habits.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-stone-700 bg-stone-950/70 p-6 text-center">
                <p className="text-lg font-medium">No habits created yet.</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-400">
                  Add your own Shadow Habit or Light Habit. No default habits
                  will be shown here.
                </p>

                <button
                  type="button"
                  onClick={() => setIsCreateHabitOpen(true)}
                  className="mt-5 rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
                >
                  Create First Habit
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {habits.map((habit) => (
                  <article
                    key={habit.id}
                    className="rounded-2xl border border-stone-800 bg-stone-950/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-xs uppercase tracking-[0.2em] ${
                            habit.type === "SHADOW"
                              ? "text-red-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {habit.type === "SHADOW"
                            ? "Shadow Habit"
                            : "Light Habit"}
                        </p>

                        <h3 className="mt-1 text-lg font-medium">
                          {habit.title}
                        </h3>
                      </div>

                      <span className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-300">
                        {habit.intention}
                      </span>
                    </div>

                    {habit.linkedLightHabit && (
                      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                          Light Habit
                        </p>
                        <p className="mt-1 text-sm text-emerald-100">
                          {habit.linkedLightHabit}
                        </p>
                      </div>
                    )}

                    {habit.type === "SHADOW" && (
                      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">
                              {getPathGuidance(habit.intention).title}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-stone-300">
                              {getPathGuidance(habit.intention).description}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-amber-100">
                              {getPathGuidance(habit.intention).action}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => openPathModal(habit)}
                            className="shrink-0 rounded-full border border-amber-500/40 px-3 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-400 hover:text-stone-950"
                          >
                            Manage Path
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="hermetic-card rounded-3xl p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
              Mind Dump
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Empty the mind. Observe the pattern.
            </h2>

<textarea
  value={mindDumpContent}
  onChange={(event) => setMindDumpContent(event.target.value)}
  className="mt-5 min-h-48 w-full resize-none rounded-2xl border border-stone-800 bg-stone-950 p-4 text-sm text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-400"
  placeholder="Write whatever is moving through your mind..."
/>

<div className="mt-4">
  <label className="text-sm text-stone-300">Mood</label>
  <select
    value={mindDumpMood}
    onChange={(event) => setMindDumpMood(event.target.value)}
    className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-950 px-4 py-3 text-sm outline-none focus:border-amber-400"
  >
    <option value="">Select mood</option>
    <option value="CALM">Calm</option>
    <option value="FOCUSED">Focused</option>
    <option value="TIRED">Tired</option>
    <option value="ANXIOUS">Anxious</option>
    <option value="MOTIVATED">Motivated</option>
    <option value="FRUSTRATED">Frustrated</option>
    <option value="NEUTRAL">Neutral</option>
  </select>
</div>

<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-xs text-stone-500">
    Between impulse and action, there is the middle path.
  </p>

  <button
    type="button"
    onClick={handleSaveMindDump}
    disabled={!mindDumpContent.trim()}
    className="rounded-full border border-stone-700 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-amber-400 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
  >
    Save Reflection
  </button>
</div>

            <p className="mt-4 text-xs text-stone-500">
              Between impulse and action, there is the middle path.
            </p>

            <div className="mt-8 border-t border-stone-800 pt-6">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
                Today’s Logs
              </p>

              {habitLogs.length === 0 ? (
                <p className="mt-3 text-sm text-stone-400">
                  No habits logged today yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {habitLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-stone-800 bg-stone-950 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p
                            className={`text-xs uppercase tracking-[0.2em] ${
                              log.habitType === "SHADOW"
                                ? "text-red-300"
                                : "text-emerald-300"
                            }`}
                          >
                            {log.habitType === "SHADOW"
                              ? "Shadow Log"
                              : "Light Log"}
                          </p>

                          <p className="mt-1 font-medium">{log.habitTitle}</p>
                        </div>

                        <span className="rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-300">
                          {log.completed ? "Completed" : "Observed"}
                        </span>
                      </div>

                      {(log.trigger || log.mood || log.notes) && (
                        <div className="mt-3 space-y-1 text-sm text-stone-400">
                          {log.trigger && <p>Trigger: {log.trigger}</p>}
                          {log.mood && <p>Mood: {log.mood}</p>}
                          {log.notes && <p>Notes: {log.notes}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 border-t border-stone-800 pt-6">
  <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
    Recent Reflections
  </p>

  {journalEntries.length === 0 ? (
    <p className="mt-3 text-sm text-stone-400">
      No reflections saved yet.
    </p>
  ) : (
    <div className="mt-4 space-y-3">
      {journalEntries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-2xl border border-stone-800 bg-stone-950 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm leading-6 text-stone-300">
              {entry.content}
            </p>

            {entry.mood && (
              <span className="shrink-0 rounded-full border border-stone-700 px-3 py-1 text-xs text-stone-300">
                {entry.mood}
              </span>
            )}
          </div>

          <p className="mt-3 text-xs text-stone-500">
            {new Date(entry.createdAt).toLocaleString("en", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

      </section>

      {isCreateHabitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
                  Create Habit
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Define your pattern.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateHabitOpen(false)}
                className="rounded-full border border-stone-800 px-3 py-1 text-sm text-stone-400 hover:text-stone-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-stone-300">Habit title</label>
                <input
                  value={habitTitle}
                  onChange={(event) => setHabitTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
                  placeholder="Example: Sleeping late, procrastination, deep work..."
                />
              </div>

              <div>
                <label className="text-sm text-stone-300">Habit type</label>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setHabitType("SHADOW")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      habitType === "SHADOW"
                        ? "border-red-400 bg-red-500/10"
                        : "border-stone-800 bg-stone-900"
                    }`}
                  >
                    <p className="font-medium">Shadow Habit</p>
                    <p className="mt-1 text-sm text-stone-400">
                      A pattern you want to observe, reduce, transmute, or
                      release.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHabitType("LIGHT")}
                    className={`rounded-2xl border p-4 text-left transition ${
                      habitType === "LIGHT"
                        ? "border-emerald-400 bg-emerald-500/10"
                        : "border-stone-800 bg-stone-900"
                    }`}
                  >
                    <p className="font-medium">Light Habit</p>
                    <p className="mt-1 text-sm text-stone-400">
                      A conscious action you want to strengthen.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-stone-300">Intention</label>
                <select
                  value={habitIntention}
                  onChange={(event) =>
                    setHabitIntention(event.target.value as HabitIntention)
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-amber-400"
                >
                  <option value="OBSERVE">Observe</option>
                  <option value="REDUCE">Reduce</option>
                  <option value="TRANSMUTE">Transmute</option>
                  <option value="RELEASE">Release</option>
                </select>
              </div>

              {habitType === "SHADOW" && (
                <div>
                  <label className="text-sm text-stone-300">
                    Optional Light Habit
                  </label>
                  <input
                    value={linkedLightHabit}
                    onChange={(event) =>
                      setLinkedLightHabit(event.target.value)
                    }
                    className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
                    placeholder="Example: Replace scrolling with reading 10 pages"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateHabit}
              className="mt-5 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Save Habit
            </button>
          </div>
        </div>
      )}

      {isLogHabitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
                  Log Habit
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Record today’s pattern.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsLogHabitOpen(false)}
                className="rounded-full border border-stone-800 px-3 py-1 text-sm text-stone-400 hover:text-stone-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-stone-300">Habit</label>
                <select
                  value={selectedHabitId}
                  onChange={(event) => setSelectedHabitId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Select a habit</option>
                  {habits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.title} — {habit.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-stone-300">Status</label>
                <select
                  value={logCompleted ? "true" : "false"}
                  onChange={(event) =>
                    setLogCompleted(event.target.value === "true")
                  }
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-amber-400"
                >
                  <option value="true">Completed / Performed</option>
                  <option value="false">Observed / Occurred</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-stone-300">Trigger</label>
                <input
                  value={logTrigger}
                  onChange={(event) => setLogTrigger(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
                  placeholder="Example: stress, boredom, fatigue..."
                />
              </div>

              <div>
                <label className="text-sm text-stone-300">Mood</label>
                <select
                  value={logMood}
                  onChange={(event) => setLogMood(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-amber-400"
                >
                  <option value="">Select mood</option>
                  <option value="CALM">Calm</option>
                  <option value="FOCUSED">Focused</option>
                  <option value="TIRED">Tired</option>
                  <option value="ANXIOUS">Anxious</option>
                  <option value="MOTIVATED">Motivated</option>
                  <option value="FRUSTRATED">Frustrated</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-stone-300">Notes</label>
                <textarea
                  value={logNotes}
                  onChange={(event) => setLogNotes(event.target.value)}
                  className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
                  placeholder="What happened? What did you notice?"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateHabitLog}
              disabled={!selectedHabitId}
              className="mt-5 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save Habit Log
            </button>
          </div>
        </div>
      )}

      {isPathModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
                  Release or Transmute
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Choose the path for this Shadow Habit.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsPathModalOpen(false)}
                className="rounded-full border border-stone-800 px-3 py-1 text-sm text-stone-400 hover:text-stone-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {(["OBSERVE", "REDUCE", "TRANSMUTE", "RELEASE"] as const).map(
                (intention) => {
                  const guidance = getPathGuidance(intention);

                  return (
                    <button
                      key={intention}
                      type="button"
                      onClick={() => setSelectedPathIntention(intention)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedPathIntention === intention
                          ? "border-amber-400 bg-amber-500/10"
                          : "border-stone-800 bg-stone-900"
                      }`}
                    >
                      <p className="font-medium text-stone-100">
                        {guidance.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-stone-400">
                        {guidance.description}
                      </p>
                    </button>
                  );
                }
              )}
            </div>

            {selectedPathIntention === "RELEASE" && (
              <div className="mt-5">
                <label className="text-sm text-stone-300">
                  Optional release target date
                </label>
                <input
                  type="date"
                  value={releaseTargetDate}
                  onChange={(event) => setReleaseTargetDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-amber-400"
                />
                <p className="mt-2 text-xs text-stone-500">
                  This date is not a punishment. It is a conscious marker for
                  preparation and commitment.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-400">
                Current Guidance
              </p>

              <p className="mt-2 text-sm leading-6 text-stone-300">
                {getPathGuidance(selectedPathIntention).action}
              </p>
            </div>

            <button
              type="button"
              onClick={handleUpdateHabitPath}
              className="mt-5 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Save Path
            </button>
          </div>
        </div>
      )}

      {isDailyPlanOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="w-full max-w-lg rounded-3xl border border-stone-800 bg-stone-950 p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
            Daily Plan
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Set today’s direction.
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsDailyPlanOpen(false)}
          className="rounded-full border border-stone-800 px-3 py-1 text-sm text-stone-400 hover:text-stone-100"
        >
          Close
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-stone-300">Main target</label>
          <input
            value={dailyTarget}
            onChange={(event) => setDailyTarget(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
            placeholder="Example: Complete one focused work block"
          />
        </div>

        <div>
          <label className="text-sm text-stone-300">Milestone 1</label>
          <input
            value={milestoneOne}
            onChange={(event) => setMilestoneOne(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
            placeholder="First step..."
          />
        </div>

        <div>
          <label className="text-sm text-stone-300">Milestone 2</label>
          <input
            value={milestoneTwo}
            onChange={(event) => setMilestoneTwo(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
            placeholder="Second step..."
          />
        </div>

        <div>
          <label className="text-sm text-stone-300">Milestone 3</label>
          <input
            value={milestoneThree}
            onChange={(event) => setMilestoneThree(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
            placeholder="Third step..."
          />
        </div>

        <div>
          <label className="text-sm text-stone-300">Notes</label>
          <textarea
            value={dailyNotes}
            onChange={(event) => setDailyNotes(event.target.value)}
            className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none placeholder:text-stone-600 focus:border-amber-400"
            placeholder="What should guide your day?"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSaveDailyPlan}
        disabled={!dailyTarget.trim()}
        className="mt-5 w-full rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save Daily Plan
      </button>
    </div>
  </div>
)}

    </main>
  );
}