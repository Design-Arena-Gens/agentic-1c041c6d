import { buildAnalysis } from "./analyzer";
import { SAMPLE_CHANNEL, SAMPLE_VIDEOS } from "./sample-data";
import {
  AnalysisSummary,
  ChannelDetails,
  VideoDetails,
} from "./types";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_RESULTS = 12;

export class YoutubeApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "YoutubeApiError";
    this.status = status;
  }
}

interface YoutubeThumbnail {
  url?: string;
}

interface YoutubeSnippet {
  title?: string;
  description?: string;
  publishedAt?: string;
  customUrl?: string;
  channelId?: string;
  thumbnails?: {
    default?: YoutubeThumbnail;
    high?: YoutubeThumbnail;
  };
  tags?: string[];
}

interface YoutubeStatistics {
  viewCount?: string;
  subscriberCount?: string;
  videoCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface YoutubeChannelItem {
  id?: string;
  snippet?: YoutubeSnippet;
  statistics?: YoutubeStatistics;
}

interface YoutubeChannelsResponse {
  items?: YoutubeChannelItem[];
}

interface YoutubeSearchId {
  videoId?: string;
  channelId?: string;
  playlistId?: string;
}

interface YoutubeSearchItem {
  id?: YoutubeSearchId;
  snippet?: YoutubeSnippet;
}

interface YoutubeSearchResponse {
  items?: YoutubeSearchItem[];
}

interface YoutubeVideoItem {
  id?: string;
  snippet?: YoutubeSnippet;
  statistics?: YoutubeStatistics;
  contentDetails?: {
    duration?: string;
  };
}

interface YoutubeVideosResponse {
  items?: YoutubeVideoItem[];
}

async function httpGet<TResponse>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<TResponse> {
  if (!API_KEY) {
    throw new YoutubeApiError("Missing YOUTUBE_API_KEY");
  }

  const url = new URL(`${API_BASE}/${path}`);
  Object.entries({
    key: API_KEY,
    ...params,
  }).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw new YoutubeApiError(
      `YouTube API request failed: ${response.status} ${response.statusText} – ${JSON.stringify(body)}`,
      response.status,
    );
  }

  return (await response.json()) as TResponse;
}

function mapChannel(item: YoutubeChannelItem): ChannelDetails {
  const { id, snippet, statistics } = item;
  return {
    id: typeof id === "string" ? id : snippet?.channelId ?? "unknown",
    title: snippet?.title ?? "Untitled Channel",
    description: snippet?.description ?? "",
    customUrl: snippet?.customUrl,
    thumbnailUrl: snippet?.thumbnails?.high?.url ?? snippet?.thumbnails?.default?.url,
    subscribers: Number(statistics?.subscriberCount ?? 0),
    totalViews: Number(statistics?.viewCount ?? 0),
    videoCount: Number(statistics?.videoCount ?? 0),
    publishedAt: snippet?.publishedAt ?? new Date().toISOString(),
  };
}

function mapVideo(item: YoutubeVideoItem): VideoDetails {
  const { id, snippet, statistics, contentDetails } = item;
  const videoId = typeof id === "string" && id.length > 0 ? id : "unknown";
  return {
    id: videoId,
    title: snippet?.title ?? "Untitled Video",
    description: snippet?.description ?? "",
    publishedAt: snippet?.publishedAt ?? new Date().toISOString(),
    thumbnailUrl: snippet?.thumbnails?.high?.url ?? snippet?.thumbnails?.default?.url,
    views: Number(statistics?.viewCount ?? 0),
    likes: statistics?.likeCount ? Number(statistics.likeCount) : undefined,
    comments: statistics?.commentCount ? Number(statistics.commentCount) : undefined,
    duration: contentDetails?.duration,
    tags: snippet?.tags ?? [],
  };
}

async function fetchChannel(identifier: string): Promise<ChannelDetails> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    throw new YoutubeApiError("Channel identifier required");
  }

  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1);
    const data = await httpGet<YoutubeChannelsResponse>("channels", {
      part: "snippet,statistics",
      forHandle: handle,
    });
    if (data.items?.length) {
      return mapChannel(data.items[0]);
    }
  }

  // Try as direct channel ID
  const byId = await httpGet<YoutubeChannelsResponse>("channels", {
    part: "snippet,statistics",
    id: trimmed,
  });
  if (byId.items?.length) {
    return mapChannel(byId.items[0]);
  }

  // Fallback search by name
  const search = await httpGet<YoutubeSearchResponse>("search", {
    part: "snippet",
    q: trimmed,
    maxResults: 1,
    type: "channel",
  });
  if (search.items?.length) {
    const channelId = search.items[0]?.snippet?.channelId ?? search.items[0]?.id?.channelId;
    if (channelId) {
      const data = await httpGet<YoutubeChannelsResponse>("channels", {
        part: "snippet,statistics",
        id: channelId,
      });
      if (data.items?.length) {
        return mapChannel(data.items[0]);
      }
    }
  }

  throw new YoutubeApiError("Channel not found", 404);
}

async function fetchVideos(channelId: string): Promise<VideoDetails[]> {
  const search = await httpGet<YoutubeSearchResponse>("search", {
    part: "id",
    channelId,
    maxResults: MAX_RESULTS,
    order: "date",
    type: "video",
  });

  const ids = search.items
    ?.map((item) => item.id?.videoId)
    .filter((value): value is string => Boolean(value));
  if (!ids?.length) {
    return [];
  }

  const details = await httpGet<YoutubeVideosResponse>("videos", {
    part: "snippet,statistics,contentDetails",
    id: ids.join(","),
  });

  return (details.items ?? []).map(mapVideo);
}

export async function getAnalysisFromYoutube(
  identifier: string,
): Promise<{ analysis: AnalysisSummary; source: "live" | "sample" }> {
  try {
    const channel = await fetchChannel(identifier);
    const videos = await fetchVideos(channel.id);
    if (!videos.length) {
      throw new YoutubeApiError("No uploads found for this channel", 404);
    }
    return {
      analysis: buildAnalysis(channel, videos),
      source: "live",
    };
  } catch (error) {
    if (error instanceof YoutubeApiError && error.message === "Missing YOUTUBE_API_KEY") {
      return {
        analysis: buildAnalysis(SAMPLE_CHANNEL, SAMPLE_VIDEOS),
        source: "sample",
      };
    }

    if ((error as YoutubeApiError).status === 404) {
      throw error;
    }

    // If the API call fails (quota, network etc) fall back to sample to keep UI functional.
    return {
      analysis: buildAnalysis(SAMPLE_CHANNEL, SAMPLE_VIDEOS),
      source: "sample",
    };
  }
}
