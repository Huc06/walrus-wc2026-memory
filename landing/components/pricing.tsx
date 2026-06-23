"use client";

import { SectionHeading } from "@/components/section-heading";
import { softEase, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type Tier = {
  name: string;
  blurb: string;
  monthly: number;
  yearly: number;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    blurb: "Try the engine, keep your first frames.",
    monthly: 0,
    yearly: 0,
    features: [
      "20 generations per month",
      "1080p stills",
      "10-second clips",
      "Standard review queue",
      "Cortex mark on exports",
    ],
    cta: "Get the app",
  },
  {
    name: "Pro",
    blurb: "For creators who post every day.",
    monthly: 14,
    yearly: 11,
    features: [
      "1,000 generations per month",
      "4K stills",
      "30-second clips",
      "Priority review queue",
      "Clean exports, no mark",
      "Full prompt history",
    ],
    cta: "Start with Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    blurb: "For teams and heavy production use.",
    monthly: 32,
    yearly: 24,
    features: [
      "Everything in Pro",
      "60-second clips",
      "Batch generation",
      "5 linked devices",
      "Early access to new looks",
    ],
    cta: "Start with Studio",
  },
];

function PriceValue({
  value,
  yearly,
  reduce,
}: {
  value: number;
  yearly: boolean;
  reduce: boolean;
}): ReactNode {
  const enterY = reduce ? 0 : yearly ? "-110%" : "110%";
  const exitY = reduce ? 0 : yearly ? "110%" : "-110%";

  return (
    <span className="relative inline-flex overflow-hidden leading-none tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: enterY, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: exitY, opacity: 0 }}
          transition={{ duration: reduce ? 0.001 : 0.45, ease: softEase }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function BillingToggle({
  yearly,
  setYearly,
  reduce,
}: {
  yearly: boolean;
  setYearly: (value: boolean) => void;
  reduce: boolean;
}): ReactNode {
  const options = [
    { id: "monthly", label: "Monthly", value: false },
    { id: "yearly", label: "Yearly", value: true },
  ] as const;

  return (
    <div className="border-border bg-muted inline-flex items-center gap-1 rounded-full border p-1">
      {options.map((option) => {
        const isActive = option.value === yearly;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setYearly(option.value)}
            aria-pressed={isActive}
            className="focus-ring relative rounded-full px-5 py-2 text-sm font-medium"
          >
            {isActive && (
              <motion.span
                layoutId="billing-toggle-active"
                className="bg-background absolute inset-0 rounded-full shadow-sm"
                transition={
                  reduce
                    ? { duration: 0.001 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
            <span
              className={cn(
                "relative z-10 transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TierCard({
  tier,
  yearly,
  reduce,
}: {
  tier: Tier;
  yearly: boolean;
  reduce: boolean;
}): ReactNode {
  const highlighted = tier.highlighted === true;
  const price = yearly ? tier.yearly : tier.monthly;

  return (
    <article
      style={
        highlighted
          ? {
              backgroundColor: "var(--surface)",
              color: "var(--surface-foreground)",
            }
          : undefined
      }
      className={cn(
        "flex h-full flex-col rounded-3xl p-7 sm:p-8",
        !highlighted && "border-border border"
      )}
    >
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-medium tracking-tight">{tier.name}</h3>
        {highlighted && (
          <span className="rounded-full border border-current/25 px-2.5 py-1 text-[11px] leading-none font-medium">
            Most popular
          </span>
        )}
      </header>
      <p
        className={cn(
          "mt-1.5 text-sm",
          highlighted ? "opacity-65" : "text-muted-foreground"
        )}
      >
        {tier.blurb}
      </p>

      <div className="mt-8 flex items-end">
        <span className="self-start pt-1 text-xl font-medium tracking-tight">
          $
        </span>
        <span className="text-5xl leading-none font-medium tracking-tight">
          <PriceValue value={price} yearly={yearly} reduce={reduce} />
        </span>
        <span
          className={cn(
            "ml-2 pb-0.5 text-sm",
            highlighted ? "opacity-65" : "text-muted-foreground"
          )}
        >
          / month
        </span>
      </div>
      <p
        className={cn(
          "mt-2 h-4 text-xs",
          highlighted ? "opacity-65" : "text-muted-foreground"
        )}
      >
        {tier.monthly === 0
          ? "free forever"
          : yearly
            ? "billed yearly"
            : "billed monthly"}
      </p>

      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                highlighted ? "opacity-80" : "text-foreground"
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-sm leading-relaxed",
                highlighted ? "opacity-80" : "text-muted-foreground"
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <a
        href="#sign-up"
        style={
          highlighted
            ? {
                backgroundColor: "var(--surface-foreground)",
                color: "var(--surface)",
              }
            : undefined
        }
        className={cn(
          "focus-ring mt-9 inline-flex h-12 items-center justify-center rounded-full text-sm font-medium transition-opacity hover:opacity-85",
          !highlighted &&
            "border-border text-foreground hover:bg-muted border hover:opacity-100"
        )}
      >
        {tier.cta}
      </a>
    </article>
  );
}

export function Pricing(): ReactNode {
  const reduce = useReducedMotion();
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="mx-auto max-w-[1440px] scroll-mt-24 px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          title="Pay for keepers, not noise"
          description="Every plan runs the full engine and the full review pass. Upgrade when you need more frames, longer film, or cleaner exports."
        />
        <div className="shrink-0">
          <BillingToggle
            yearly={yearly}
            setYearly={setYearly}
            reduce={reduce}
          />
        </div>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <TierCard
            key={tier.name}
            tier={tier}
            yearly={yearly}
            reduce={reduce}
          />
        ))}
      </div>

      <p className="text-muted-foreground mt-6 text-xs">
        Prices in USD. Cancel anytime in the app — your plan runs to the end of
        the period.
      </p>
    </section>
  );
}
