import { ChannelDetails, VideoDetails } from "./types";

export const SAMPLE_CHANNEL: ChannelDetails = {
  id: "UC1234567890SAMPLE",
  title: "Creator Launchpad",
  description:
    "Weekly breakdowns, experiments, and behind-the-scenes strategy sessions for growing modern creator channels.",
  customUrl: "@creatorlaunchpad",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80",
  subscribers: 187000,
  totalViews: 12800000,
  videoCount: 196,
  publishedAt: "2016-04-12T15:32:00Z",
};

export const SAMPLE_VIDEOS: VideoDetails[] = [
  {
    id: "sample_video_1",
    title: "We Reverse Engineered MrBeast's Viral Loop — Here's the Formula",
    description:
      "Breaking down how retention waves, thumbnail pacing, and mid-video twists keep MrBeast's 100M+ viewers locked in.",
    publishedAt: "2024-05-11T14:03:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=640&q=80",
    views: 642311,
    likes: 28214,
    comments: 1842,
    duration: "PT15M12S",
    tags: [
      "mrbeast",
      "viral",
      "retention",
      "content strategy",
      "youtube growth",
    ],
  },
  {
    id: "sample_video_2",
    title: "AI Tools Writing Our Scripts? 30 Day YouTube Experiment",
    description:
      "We pitted human writers vs GPT-4 to script 4 weekly uploads. The winner shocked us.",
    publishedAt: "2024-04-26T18:12:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=640&q=80",
    views: 398452,
    likes: 15108,
    comments: 923,
    duration: "PT12M04S",
    tags: [
      "ai tools",
      "script writing",
      "automation",
      "youtube experiment",
    ],
  },
  {
    id: "sample_video_3",
    title: "We Interviewed 1M Subscribers: What Made Them Click Subscribe?",
    description:
      "We surveyed 1M+ subs across 12 creator niches. Here's the 6-part framework that made them hit subscribe.",
    publishedAt: "2024-03-30T16:45:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=640&q=80",
    views: 721904,
    likes: 35344,
    comments: 2410,
    duration: "PT19M24S",
    tags: [
      "subscriber growth",
      "audience research",
      "community building",
    ],
  },
  {
    id: "sample_video_4",
    title: "YouTube Shorts Funnel That Prints Subscribers While You Sleep",
    description:
      "Breakdown of an evergreen short-form sequence that drives 11k subs/week with only 90 minutes of editing.",
    publishedAt: "2024-03-11T15:09:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=640&q=80",
    views: 532112,
    likes: 19844,
    comments: 1104,
    duration: "PT09M48S",
    tags: [
      "youtube shorts",
      "subscriber funnel",
      "automation",
      "evergreen content",
    ],
  },
  {
    id: "sample_video_5",
    title: "We Rebuilt Our Thumbnail Process in Notion (Template Included)",
    description:
      "The 4-step system, swipe file, and scoring rubric we use to test thumbnails before launch.",
    publishedAt: "2024-02-25T17:26:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=640&q=80",
    views: 281908,
    likes: 17822,
    comments: 612,
    duration: "PT11M36S",
    tags: ["thumbnails", "notion", "workflow", "systems", "creator tools"],
  },
  {
    id: "sample_video_6",
    title: "0 to 100K: The First 5 Moves We'd Make Starting Over",
    description:
      "We asked 12 creators what they'd redo if they restarted in 2024. This is the playbook.",
    publishedAt: "2024-02-08T21:04:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=640&q=80",
    views: 468124,
    likes: 23419,
    comments: 1409,
    duration: "PT17M08S",
    tags: [
      "creator economy",
      "growth",
      "youtube strategy",
      "playbook",
      "storytelling",
    ],
  },
  {
    id: "sample_video_7",
    title: "We Tried 5 Hooks in One Video — Viewer Retention Graphs Revealed",
    description:
      "Comparing hook types: curiosity gap, bold claim, emotional story, data reveal, and pattern interrupt.",
    publishedAt: "2024-01-20T20:02:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80",
    views: 354112,
    likes: 16349,
    comments: 942,
    duration: "PT14M44S",
    tags: ["hooks", "retention", "experiments", "analytics"],
  },
  {
    id: "sample_video_8",
    title: "Turning One Podcast Episode into 37 Assets (Live Workshop)",
    description:
      "Our repurposing pipeline for long-form episodes across Shorts, LinkedIn, newsletter, and IG reels.",
    publishedAt: "2024-01-06T19:18:00Z",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=640&q=80",
    views: 249907,
    likes: 12873,
    comments: 578,
    duration: "PT23M32S",
    tags: [
      "repurposing",
      "content systems",
      "podcast",
      "workflow",
      "creator economy",
    ],
  },
];

