"use client";

import { SectionHeading } from "@/components/section-heading";
import { useReducedMotion } from "@/lib/motion";
import {
  Atom,
  Bot,
  Boxes,
  Brain,
  Database,
  Globe,
  KeyRound,
  Lock,
  Network,
  Sparkles,
  Triangle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";

type Integration = {
  name: string;
  blurb: string;
  icon: LucideIcon;
};

const ROW_A: Integration[] = [
  { name: "Walrus", blurb: "Blob storage", icon: Database },
  { name: "Sui", blurb: "Coordination", icon: Boxes },
  { name: "SEAL", blurb: "Client encryption", icon: Lock },
  { name: "Walrus Memory", blurb: "Agent memory", icon: Brain },
  { name: "zkLogin", blurb: "Sui login", icon: KeyRound },
  { name: "Walrus Sites", blurb: "On-chain hosting", icon: Globe },
];

const ROW_B: Integration[] = [
  { name: "OpenRouter", blurb: "LLM gateway", icon: Bot },
  { name: "Gemini", blurb: "Search & roast", icon: Sparkles },
  { name: "Three.js", blurb: "3D arena", icon: Network },
  { name: "React", blurb: "UI", icon: Atom },
  { name: "Next.js", blurb: "Landing", icon: Triangle },
  { name: "Vite", blurb: "Build", icon: Zap },
];

/** Horizontal travel of each row across the section's scroll range, in px. */
const ROW_TRAVEL = 160;

function Pill({ integration }: { integration: Integration }): ReactNode {
  const Icon = integration.icon;
  return (
    <div className="border-border bg-background flex shrink-0 items-center gap-2.5 rounded-full border py-3.5 pr-5 pl-4 whitespace-nowrap">
      <Icon
        className="text-foreground size-4"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="text-foreground text-sm font-medium">
        {integration.name}
      </span>
      <span className="text-muted-foreground text-xs">{integration.blurb}</span>
    </div>
  );
}

function ScrubRow({
  items,
  x,
}: {
  items: Integration[];
  x: MotionValue<number> | undefined;
}): ReactNode {
  return (
    <div className="flex justify-center">
      <motion.div {...(x ? { style: { x } } : {})} className="flex w-max gap-3">
        {items.map((integration) => (
          <Pill key={integration.name} integration={integration} />
        ))}
        <div aria-hidden="true" className="flex gap-3">
          {items.map((integration) => (
            <Pill key={`copy-${integration.name}`} integration={integration} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function Integrations(): ReactNode {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const xA = useTransform(scrollYProgress, [0, 1], [-ROW_TRAVEL, ROW_TRAVEL]);
  const xB = useTransform(scrollYProgress, [0, 1], [ROW_TRAVEL, -ROW_TRAVEL]);

  return (
    <section
      ref={sectionRef}
      id="integrations"
      className="scroll-mt-24 pb-24 sm:pb-32"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <SectionHeading
          align="center"
          title="Built on an open, decentralized stack"
          description="No central database. Memory lives on Walrus and Sui, encrypted with SEAL — fully open source, owned by no one and everyone."
        />
      </div>

      <div className="mt-14 flex flex-col gap-3">
        <ScrubRow items={ROW_A} x={reduce ? undefined : xA} />
        <ScrubRow items={ROW_B} x={reduce ? undefined : xB} />
      </div>
    </section>
  );
}
