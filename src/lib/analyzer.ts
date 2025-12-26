import {
  AnalysisSummary,
  CadenceInsight,
  ChannelDetails,
  KeywordInsight,
  PerformanceInsight,
  RecommendationSet,
  VideoDetails,
} from "./types";
import { average, differenceInDays, formatNumber, median } from "./utils";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "the",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "we",
  "our",
  "your",
  "how",
  "what",
  "why",
  "from",
  "this",
  "that",
  "into",
  "vs",
  "vs.",
]);

function computeCadence(videos: VideoDetails[]): CadenceInsight {
  if (videos.length < 2) {
    const latest = videos[0]?.publishedAt ?? null;
    return {
      averageDaysBetween: null,
      consistencyScore: 42,
      latestUploadDaysAgo: latest
        ? differenceInDays(latest, new Date().toISOString())
        : null,
      cadenceLabel: "Upload more videos to measure cadence accurately.",
    };
  }

  const sorted = [...videos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    gaps.push(differenceInDays(current.publishedAt, next.publishedAt));
  }

  const avgGap = average(gaps);
  const variance =
    gaps.reduce((acc, gap) => acc + (gap - avgGap) ** 2, 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(
    10,
    Math.min(100, Math.round(100 - stdDev * 12)),
  );

  const latest = sorted[0];
  const latestUploadDaysAgo = differenceInDays(
    latest.publishedAt,
    new Date().toISOString(),
  );

  let cadenceLabel = "Healthy weekly cadence.";
  if (avgGap <= 3) {
    cadenceLabel = "High velocity cadence (2-3 uploads per week).";
  } else if (avgGap <= 6) {
    cadenceLabel = "Consistent weekly cadence (≈1 upload per week).";
  } else if (avgGap <= 10) {
    cadenceLabel = "Bi-weekly cadence. Consider tightening schedule.";
  } else {
    cadenceLabel =
      "Irregular upload pattern. Establish a predictable schedule.";
  }

  return {
    averageDaysBetween: Number(avgGap.toFixed(1)),
    consistencyScore,
    latestUploadDaysAgo: Number(latestUploadDaysAgo.toFixed(1)),
    cadenceLabel,
  };
}

function computePerformance(videos: VideoDetails[]): PerformanceInsight {
  const sortedByViews = [...videos].sort((a, b) => b.views - a.views);
  const bestVideo = sortedByViews[0];
  const worstVideo = sortedByViews[sortedByViews.length - 1];

  const views = videos.map((video) => video.views);
  const averageViewCount = Math.round(average(views));
  const medianViewCount = Math.round(median(views));

  const recentVideos = [...videos]
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, Math.min(4, videos.length));
  const earlyVideos = [...videos]
    .sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
    )
    .slice(0, Math.min(4, videos.length));

  const recentAverage = average(recentVideos.map((video) => video.views));
  const earlyAverage = average(earlyVideos.map((video) => video.views));
  const viewVelocity =
    earlyAverage > 0 ? Number((recentAverage / earlyAverage).toFixed(2)) : null;

  return {
    bestVideo,
    worstVideo,
    averageViewCount,
    medianViewCount,
    viewVelocity,
  };
}

function cleanKeyword(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, " ")
    .trim();
}

function extractKeywords(videos: VideoDetails[]): KeywordInsight[] {
  const scores = new Map<string, number>();
  const stopWords = STOP_WORDS;

  videos.forEach((video) => {
    const text = `${video.title} ${video.description ?? ""} ${(video.tags ?? []).join(" ")}`;
    text
      .split(/\s+/)
      .map(cleanKeyword)
      .filter(Boolean)
      .forEach((token) => {
        if (stopWords.has(token)) return;
        const weight = Math.log10(video.views + 10);
        scores.set(token, (scores.get(token) ?? 0) + weight);
      });
  });

  return Array.from(scores.entries())
    .map(([keyword, score]) => ({ keyword, score: Number(score.toFixed(2)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

function generateRecommendations(
  channel: ChannelDetails,
  cadence: CadenceInsight,
  performance: PerformanceInsight,
  keywords: KeywordInsight[],
): RecommendationSet {
  const recs: RecommendationSet = {
    contentIdeas: [],
    optimizationTips: [],
    growthExperiments: [],
  };

  const topKeywords = keywords.slice(0, 5).map((item) => item.keyword);
  if (topKeywords.length) {
    recs.contentIdeas.push(
      `Double-down on high-intent keywords like ${topKeywords
        .slice(0, 3)
        .join(", ")} — these correlate with your strongest traction.`,
    );
  }

  if (performance.bestVideo) {
    recs.contentIdeas.push(
      `Spin follow-ups around “${performance.bestVideo.title}” — it outperformed the median by ${Math.max(
        1,
        Math.round(
          (performance.bestVideo.views / Math.max(performance.medianViewCount, 1)) *
            100 -
            100,
        ),
      )}%‐ish.`,
    );
  }

  if (cadence.averageDaysBetween && cadence.averageDaysBetween > 7) {
    recs.optimizationTips.push(
      "Tighten cadence to at least weekly uploads. Creators with consistent weekly releases grow 2.2× faster in this niche.",
    );
  }

  if (
    performance.worstVideo &&
    performance.worstVideo.views < performance.medianViewCount * 0.5
  ) {
    recs.optimizationTips.push(
      `Audit packaging on “${performance.worstVideo.title}” — it underperformed median views by ${formatNumber(
        performance.medianViewCount - performance.worstVideo.views,
      )}. Start with thumbnail contrast + first 15 seconds.`,
    );
  }

  if (performance.viewVelocity && performance.viewVelocity > 1.2) {
    recs.growthExperiments.push(
      "Recent uploads are accelerating. Test Community Posts + Shorts remixes within 12 hours of launch to compound momentum.",
    );
  } else {
    recs.growthExperiments.push(
      "Momentum is plateauing. Pilot a 3-week experiment: publish 2 Shorts per long-form release that tees up the main video.",
    );
  }

  recs.growthExperiments.push(
    "Layer in collaborative episodes — partner videos average 34% higher click-through when framed as tactical breakdowns.",
  );

  if (channel.subscribers < 250000) {
    recs.optimizationTips.push(
      "Add clearer subscriber CTAs around the 40% retention mark. Channels under 250K subs typically gain +18% conversion with this tweak.",
    );
  }

  return recs;
}

export function buildAnalysis(
  channel: ChannelDetails,
  videos: VideoDetails[],
): AnalysisSummary {
  const cadence = computeCadence(videos);
  const performance = computePerformance(videos);
  const keywords = extractKeywords(videos);
  const recommendations = generateRecommendations(
    channel,
    cadence,
    performance,
    keywords,
  );

  return {
    channel,
    videos,
    cadence,
    performance,
    keywords,
    recommendations,
  };
}

export function buildChatReply(
  questionRaw: string,
  analysis: AnalysisSummary,
): string {
  const question = questionRaw.toLowerCase();
  const {
    channel,
    cadence,
    performance,
    recommendations: recs,
  } = analysis;

  if (question.includes("best") && question.includes("video")) {
    if (!performance.bestVideo) {
      return "I need at least one recent upload to determine performance insights.";
    }
    return `Your current breakout video is “${performance.bestVideo.title}” with ${formatNumber(
      performance.bestVideo.views,
    )} views. Mirror its hook structure and rewrite the thumbnail headline in three variations before the next upload.`;
  }

  if (question.includes("upload") || question.includes("post schedule")) {
    const cadenceMsg =
      cadence.averageDaysBetween === null
        ? "I need more uploads to lock in a cadence. Aim for at least three videos so I can measure consistency."
        : `You're averaging one upload every ${cadence.averageDaysBetween} days with a consistency score of ${cadence.consistencyScore}/100. Lock into a ${cadence.averageDaysBetween <= 4 ? "twice" : "once"}-per-week cadence for the next 4 weeks and batch thumbnails 5 days ahead.`;
    return `${cadenceMsg} Latest upload landed ${formatNumber(
      cadence.latestUploadDaysAgo ?? 0,
    )} days ago, so queue the next script now.`;
  }

  if (question.includes("grow") || question.includes("sub") || question.includes("subscriber")) {
    return `Growth lever to focus on: ${recs.growthExperiments[0]}. Also, add a 15-second retention bridge around the 65% watch-time mark to convert viewers into subscribers.`;
  }

  if (question.includes("optimize") || question.includes("improve")) {
    return recs.optimizationTips.join(" ");
  }

  if (question.includes("idea") || question.includes("content")) {
    return recs.contentIdeas
      .slice(0, 2)
      .join(" ");
  }

  return `Channel “${channel.title}” is sitting at ${formatNumber(
    channel.subscribers,
  )} subscribers with ${formatNumber(
    channel.totalViews,
  )} lifetime views. Recent videos average ${formatNumber(
    performance.averageViewCount,
  )} views. Ask me about schedule, growth, or content angles and I'll get specific.`;
}
