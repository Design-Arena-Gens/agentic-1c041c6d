## Creator Ops Agent

A deploy-ready YouTube strategy assistant built with Next.js 14 and Tailwind. Paste any channel handle or ID to pull fresh analytics, surface breakout topics, and generate growth experiments on demand.

### Feature Highlights
- **Live channel intelligence** – pulls channel + video stats from the YouTube Data API (with graceful demo fallback when no API key is present).
- **Cadence + performance heuristics** – analyzes upload frequency, median views, and view velocity to spot trends instantly.
- **Actionable recommendations** – content ideas, optimization moves, and growth experiments tuned to your analytics.
- **Chat-style follow-ups** – ask targeted questions about your strategy without incurring LLM costs.

### Prerequisites
- Node.js ≥ 18.17
- npm (installed automatically with Node)
- YouTube Data API v3 key (optional but recommended for live channel scans)

### Local Development
```bash
npm install
npm run dev
```
Visit `http://localhost:3000` and drop a handle (e.g. `@creatorlaunchpad`). Without a `YOUTUBE_API_KEY`, you'll see the curated demo data so the agent stays interactive.

### Environment Variables
Create `.env.local` and set:
```
YOUTUBE_API_KEY=your_google_api_key
```
Deploy environments (Vercel, etc.) should define `YOUTUBE_API_KEY` as a secret.

### Quality Checks
```bash
npm run lint
npm run build
```
The build step validates both TypeScript and the Next.js app bundle before deploying.

### Deployment
After running `npm run build`, deploy straight to Vercel:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-1c041c6d
```
Once the deployment completes, verify delivery:
```bash
curl https://agentic-1c041c6d.vercel.app
```
If DNS hasn’t settled yet, retry the curl command a couple of times with a short pause in between.
