import { CalendarDays, CircleCheck, ClipboardList, Truck, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { CalendarDays, CircleCheck, ClipboardList, Truck };

type ProcessStep = { title: string; description: string; icon: string; isVisible?: boolean };

const FALLBACK: ProcessStep[] = [
  { title: "Request a Quote", description: "Select your services and tell us your locations.", icon: "ClipboardList" },
  { title: "Custom Planning", description: "Get a transparent quote and move schedule.", icon: "CalendarDays" },
  { title: "Execution Day", description: "Our professional crew packs, moves, or cleans with precision.", icon: "Truck" },
  { title: "Settled In", description: "Complete setup, unpacking, or post-service inspection.", icon: "CircleCheck" },
];

export default function HomeProcessSteps({ content = {} }: { content?: { heading?: string; intro?: string; steps?: ProcessStep[] } }) {
  const steps = (content.steps?.length ? content.steps : FALLBACK).filter((step) => step.isVisible !== false);
  return (
    <section className="bg-[var(--tint)] py-[clamp(40px,5vw,72px)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{content.heading ?? "How It Works"}</h2>
          <p className="mt-4 text-[color-mix(in_srgb,var(--ink)_70%,transparent)]">{content.intro ?? "Four simple steps from first call to settled in."}</p>
        </header>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = ICONS[step.icon] ?? [ClipboardList, CalendarDays, Truck, CircleCheck][index % 4];
            return <li key={`${step.title}-${index}`} className="relative flex items-start gap-4 lg:flex-col lg:items-center lg:text-center">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-jungle text-white"><Icon aria-hidden="true" className="h-6 w-6" /></span>
              <div><h3 className="text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-[color-mix(in_srgb,var(--ink)_70%,transparent)]">{step.description}</p></div>
            </li>;
          })}
        </ol>
      </div>
    </section>
  );
}
