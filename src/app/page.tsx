import AgentClient from "@/components/AgentClient";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-blue-50/80 pb-20 pt-16 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100">
      <AgentClient />
    </div>
  );
}
