"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnalysisSummary, ChatMessage } from "@/lib/types";
import { buildChatReply } from "@/lib/analyzer";
import { formatNumber, formatRelativeDays } from "@/lib/utils";

type AnalysisSource = "live" | "sample";

function createInitialMessage(): ChatMessage {
  return {
    role: "agent",
    content:
      "Drop a YouTube handle or channel ID and I’ll pull down fresh stats, surface winning topics, and map out the next uploads.",
    timestamp: Date.now(),
  };
}

export default function AgentClient() {
  const [identifier, setIdentifier] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [source, setSource] = useState<AnalysisSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createInitialMessage(),
  ]);
  const [questionDraft, setQuestionDraft] = useState("");

  const channelTitle = analysis?.channel.title ?? "your channel";

  const heroHeadline = useMemo(() => {
    if (!analysis) {
      return "YouTube Strategy Agent";
    }
    return `${analysis.channel.title} — Growth Playbook`;
  }, [analysis]);

  async function requestAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: identifier }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to analyze channel.");
      }
      const payload = await response.json();
      setAnalysis(payload.analysis);
      setSource(payload.source ?? "live");
      setMessages([
        {
          role: "agent",
          content:
            payload.source === "sample"
              ? "No API key detected — showing a live demo using Creator Launchpad's channel data so you can see the agent's workflow."
              : `Loaded ${payload.analysis.channel.title}. Ask me about growth levers, upload cadence, or new video angles.`,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setError((err as Error).message);
      setAnalysis(null);
      setSource(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!identifier.trim()) {
      setError("Add a channel handle, custom URL, or channel ID first.");
      return;
    }
    await requestAnalysis();
  }

  async function handleQuestionSubmit(event: FormEvent) {
    event.preventDefault();
    if (!analysis || !questionDraft.trim()) {
      return;
    }

    const newMessage: ChatMessage = {
      role: "user",
      content: questionDraft,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setQuestionDraft("");

    try {
      const reply = buildChatReply(questionDraft, analysis);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            "Something went sideways with that follow-up. Try again in a moment.",
          timestamp: Date.now(),
        },
      ]);
      setError((err as Error).message);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 sm:px-6 lg:px-10">
      <header className="rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          Creator Ops Agent
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {heroHeadline}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-neutral-600 dark:text-neutral-300">
          Paste a YouTube handle (like{" "}
          <span className="rounded bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
            @yourchannel
          </span>
          ) or channel ID. I’ll audit pacing, packaging, topics, and outline the
          next growth experiments.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="@creatorlaunchpad or UCxx123…"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Scanning…" : "Analyze Channel"}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-sm font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {source === "sample" && (
          <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
            Running in demo mode with curated channel data. Add
            <code className="mx-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              YOUTUBE_API_KEY
            </code>
            to unlock live audits.
          </p>
        )}
      </header>

      {analysis ? (
        <>
          <section className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Channel Pulse
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                  {analysis.channel.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-300">
                  {analysis.channel.description || "No description available."}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/70">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Subscribers
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    {formatNumber(analysis.channel.subscribers)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/70">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Lifetime views
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    {formatNumber(analysis.channel.totalViews)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/70">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Upload count
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    {analysis.channel.videoCount.toLocaleString()}
                  </dd>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/70">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Latest upload
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    {formatRelativeDays(analysis.cadence.latestUploadDaysAgo)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Cadence & Momentum
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                  {analysis.cadence.cadenceLabel}
                </h2>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-2xl bg-blue-50/60 p-4 dark:bg-blue-500/15">
                  <dt className="text-blue-700 dark:text-blue-300">
                    Avg days / upload
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-100">
                    {analysis.cadence.averageDaysBetween ?? "—"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-blue-50/60 p-4 dark:bg-blue-500/15">
                  <dt className="text-blue-700 dark:text-blue-300">
                    Consistency score
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-blue-900 dark:text-blue-100">
                    {analysis.cadence.consistencyScore}
                  </dd>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/70">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Avg views
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    {formatNumber(analysis.performance.averageViewCount)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-800/70">
                  <dt className="text-neutral-500 dark:text-neutral-400">
                    Median views
                  </dt>
                  <dd className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                    {formatNumber(analysis.performance.medianViewCount)}
                  </dd>
                </div>
              </dl>
              {analysis.performance.viewVelocity !== null && (
                <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  View velocity ×{analysis.performance.viewVelocity} compared to
                  your early uploads. Keep stacking momentum.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    Recent Uploads
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-white">
                    Titles driving the channel
                  </h2>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {analysis.videos.length} analyzed
                </span>
              </div>
              <ul className="mt-4 space-y-4">
                {analysis.videos.map((video) => (
                  <li
                    key={video.id}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 transition hover:border-blue-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-blue-500/60"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                          {video.title}
                        </h3>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                        {video.description || "No description provided."}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {formatNumber(video.views)} views
                        </span>
                        {video.likes !== undefined && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800/70">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            {formatNumber(video.likes)} likes
                          </span>
                        )}
                        {video.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Topics That Work
                </p>
                <h3 className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  High-impact keywords
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {analysis.keywords.map((keyword) => (
                    <span
                      key={keyword.keyword}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      {keyword.keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Growth Experiments
                </p>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  {analysis.recommendations.contentIdeas.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 flex-none rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Optimization Stack
                </p>
                <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                  {analysis.recommendations.optimizationTips.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                  Ask the Agent
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                  What do you need next for {channelTitle}?
                </h2>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-300">
                Powered by heuristics — no API bills
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
              <form
                onSubmit={handleQuestionSubmit}
                className="flex flex-col gap-3"
              >
                <textarea
                  value={questionDraft}
                  onChange={(event) => setQuestionDraft(event.target.value)}
                  placeholder="Ask about growth, cadence, video ideas…"
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50"
                />
                <button
                  type="submit"
                  disabled={!questionDraft.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-4 focus:ring-neutral-700/40 disabled:cursor-not-allowed disabled:bg-neutral-500 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Ask Agent
                </button>
              </form>

              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                {messages.map((message) => (
                  <div
                    key={message.timestamp + message.role}
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "agent"
                        ? "bg-white text-neutral-800 shadow-sm dark:bg-neutral-900 dark:text-neutral-100"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                Growth Experiments
              </p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                {analysis.recommendations.growthExperiments.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-purple-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-6 text-neutral-100 shadow-sm">
              <h3 className="text-lg font-semibold">How to deploy on Vercel</h3>
              <p className="mt-3 text-sm text-neutral-200">
                Ready to put the agent live? Run{" "}
                <code className="rounded bg-neutral-800 px-2 py-1 text-xs">
                  npm run build
                </code>{" "}
                locally, then deploy from this folder with
                <code className="ml-2 rounded bg-neutral-800 px-2 py-1 text-xs">
                  vercel deploy --prod
                </code>
                . Add your{" "}
                <code className="mx-1 rounded bg-neutral-800 px-2 py-1 text-xs">
                  YOUTUBE_API_KEY
                </code>{" "}
                secret in Vercel for live data.
              </p>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-neutral-300 bg-white/40 p-12 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900/50">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            Drop a channel URL to generate a strategy map.
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
            You’ll see an instant breakdown of posting cadence, breakout videos,
            and actionable next steps. No waiting on API quotas.
          </p>
        </section>
      )}
    </div>
  );
}

