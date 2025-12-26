export interface ChannelDetails {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnailUrl?: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  publishedAt: string;
}

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl?: string;
  views: number;
  likes?: number;
  comments?: number;
  duration?: string;
  tags?: string[];
}

export interface CadenceInsight {
  averageDaysBetween: number | null;
  consistencyScore: number;
  latestUploadDaysAgo: number | null;
  cadenceLabel: string;
}

export interface PerformanceInsight {
  bestVideo?: VideoDetails;
  worstVideo?: VideoDetails;
  averageViewCount: number;
  medianViewCount: number;
  viewVelocity: number | null;
}

export interface KeywordInsight {
  keyword: string;
  score: number;
}

export interface RecommendationSet {
  contentIdeas: string[];
  optimizationTips: string[];
  growthExperiments: string[];
}

export interface AnalysisSummary {
  channel: ChannelDetails;
  videos: VideoDetails[];
  cadence: CadenceInsight;
  performance: PerformanceInsight;
  keywords: KeywordInsight[];
  recommendations: RecommendationSet;
}

export interface ChatMessage {
  role: "agent" | "user";
  content: string;
  timestamp: number;
}

