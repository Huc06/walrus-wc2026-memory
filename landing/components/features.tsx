"use client";

import { SectionHeading } from "@/components/section-heading";
import { wc } from "@/lib/wc-images";
import { InView, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";

type Feature = {
  title: string;
  body: string;
  image: string;
};

const FEATURES: Feature[] = [
  {
    title: "Search by feeling",
    body: "Type what you remember — 'last-minute winners', 'a keeper's fingertip save' — and the matching moments light up across the 3D space.",
    image: wc(0),
  },
  {
    title: "Leave a memory",
    body: "Add your own note to any moment. It's encrypted, owned, and written to Walrus Mainnet — public and permanent for everyone who comes after.",
    image: wc(2),
  },
  {
    title: "Stored on Walrus",
    body: "No database, no central server. Every memory is a Walrus blob on Sui, recalled live — you can watch the blob ids stream in.",
    image: wc(3),
  },
  {
    title: "An AI pundit that remembers",
    body: "Ask the agent about any moment. It recalls the community's memories from Walrus and reacts like a pundit who never forgets a hot take.",
    image: wc(7),
  },
];

const SPRING = { stiffness: 200, damping: 24, mass: 0.6 };

export function Features(): ReactNode {
  const prefersReducedMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const previewX = useSpring(mouseX, SPRING);
  const previewY = useSpring(mouseY, SPRING);
  const velocity = useVelocity(previewX);
  const tilt = useTransform(velocity, [-1200, 1200], [-8, 8]);
  const rotate = useSpring(tilt, { stiffness: 260, damping: 30 });

  const handleMove = (event: MouseEvent<HTMLDivElement>): void => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  return (
    <section id="overview" className="scroll-mt-24 pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <SectionHeading
          title="Memory that actually lasts"
          description="A feed forgets a goal in a day. This keeps every World Cup 2026 moment — searchable, shareable, and owned by the people who lived it."
        />
      </div>

      <div
        ref={listRef}
        onMouseMove={prefersReducedMotion ? undefined : handleMove}
        onMouseLeave={() => setActive(null)}
        className="border-border relative mt-16 border-t"
      >
        {FEATURES.map((feature, i) => (
          <InView key={feature.title}>
            <div
              onMouseEnter={() => setActive(i)}
              className="group border-border border-b"
            >
              <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-5 py-8 sm:gap-8 sm:px-8 sm:py-12 lg:px-10">
                <span className="text-muted-foreground w-8 shrink-0 font-mono text-xs">
                  0{i + 1}
                </span>
                <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                  <h3 className="text-foreground text-2xl font-medium tracking-tight transition-transform duration-500 ease-out sm:text-4xl lg:group-hover:translate-x-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground max-w-md text-sm leading-relaxed lg:max-w-xs">
                    {feature.body}
                  </p>
                </div>
                <Image
                  src={feature.image}
                  alt=""
                  width={128}
                  height={160}
                  unoptimized
                  className="h-20 w-16 shrink-0 rounded-xl object-cover lg:hidden"
                />
                <ArrowUpRight
                  className="text-foreground hidden size-6 shrink-0 -translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 lg:block"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
            </div>
          </InView>
        ))}

        {!prefersReducedMotion && (
          <motion.div
            style={{ x: previewX, y: previewY, rotate }}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-10 hidden lg:block"
          >
            <motion.div
              initial={false}
              animate={{
                opacity: active !== null ? 1 : 0,
                scale: active !== null ? 1 : 0.85,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative -mt-44 ml-10 w-[230px] overflow-hidden rounded-2xl shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)]"
            >
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={false}
                  animate={{ opacity: active === i ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(i > 0 && "absolute inset-0")}
                >
                  <Image
                    src={feature.image}
                    alt=""
                    width={460}
                    height={614}
                    unoptimized
                    className="aspect-[3/4] w-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
