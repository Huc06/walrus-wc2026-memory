"use client";

import { SectionHeading } from "@/components/section-heading";
import { softEase, useReducedMotion } from "@/lib/motion";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

type QA = {
  question: string;
  answer: string;
};

const FAQS: QA[] = [
  {
    question: "What is Walrus Memory · World Cup 2026?",
    answer:
      "A 3D, explorable memory of the tournament's iconic moments. You search them in plain language, open any moment, and leave your own note — which is stored publicly and permanently on Walrus Mainnet.",
  },
  {
    question: "Where do the memories actually live?",
    answer:
      "On Walrus, a decentralized blob store coordinated by the Sui blockchain. Each note is encrypted with SEAL and written as a Walrus blob — there is no central database. You can watch the live blob ids stream in as the app recalls them.",
  },
  {
    question: "Why is the memory 'public'?",
    answer:
      "All community notes are written under one shared on-chain account, so everyone who opens the app sees the same memories. The data is on a public network — visible, verifiable, and not locked inside one company's server.",
  },
  {
    question: "What does the AI pundit do?",
    answer:
      "Ask it about any moment and it recalls the community's notes for that moment from Walrus, then reacts like a football pundit with a very long memory — hyping or gently roasting the takes people left.",
  },
  {
    question: "Are the photos real World Cup 2026 images?",
    answer:
      "The photos are real, CC-licensed football images (not official FIFA media, to respect copyright). The moment text — players, matches, descriptions — is curated World Cup 2026 content. The community memories are 100% real, written by visitors.",
  },
  {
    question: "Do I need a wallet or crypto to use it?",
    answer:
      "No. You just open the app and start exploring. Writing notes goes through a server that holds one delegate key, so there is no wallet pop-up — the on-chain part is invisible to you.",
  },
  {
    question: "Is it open source?",
    answer:
      "Yes. The whole project is on GitHub and built on an open, decentralized stack — Walrus, Sui, SEAL, and Walrus Memory. Censorship-resistant, open, and yours to fork.",
  },
];

function FaqItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: QA;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}): ReactNode {
  const prefersReducedMotion = useReducedMotion();
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="border-border border-t last:border-b">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="focus-ring flex w-full items-center justify-between gap-6 py-6 text-left"
        >
          <span className="text-foreground text-base font-medium tracking-tight sm:text-lg">
            {item.question}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : { duration: 0.3, ease: softEase }
            }
            className="text-muted-foreground shrink-0"
          >
            <Plus className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : { duration: 0.4, ease: softEase }
            }
            className="overflow-hidden"
          >
            <p className="text-muted-foreground max-w-2xl pb-7 text-sm leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq(): ReactNode {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto max-w-[1440px] scroll-mt-24 px-5 pb-24 sm:px-8 sm:pb-32 lg:px-10"
    >
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <SectionHeading
          title="Fair questions, straight answers"
          description={
            <>
              Anything else, write to{" "}
              <a
                href="mailto:hello@example.com"
                className="focus-ring text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                hello@example.com
              </a>
              . A person reads every single message.
            </>
          }
        />

        <div>
          {FAQS.map((item, i) => (
            <FaqItem
              key={item.question}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
