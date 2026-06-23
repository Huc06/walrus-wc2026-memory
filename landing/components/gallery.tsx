"use client";

import { SectionHeading } from "@/components/section-heading";
import { useReducedMotion } from "@/lib/motion";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { wc } from "@/lib/wc-images";

type Shot = {
  src: string;
  prompt: string;
};

const ROW_A: Shot[] = [
  { src: wc(0), prompt: "stoppage-time winner, the bench erupts" },
  { src: wc(1), prompt: "a goal at the back post, knockout round" },
  { src: wc(2), prompt: "celebration by the corner flag" },
  { src: wc(3), prompt: "a striker sprints clear under floodlights" },
  { src: wc(4), prompt: "scramble in the box, group stage" },
];

const ROW_B: Shot[] = [
  { src: wc(5), prompt: "a mazy dribble down the wing" },
  { src: wc(6), prompt: "midfield battle, friendly under lights" },
  { src: wc(7), prompt: "shot on target, keeper full stretch" },
  { src: wc(8), prompt: "first touch into space, counter on" },
  { src: wc(9), prompt: "the through ball that split the defence" },
];

const COPIES = 5;
const SET_FRACTION = 100 / COPIES;
const BASE_SPEED = 0.55;
const MAX_VELOCITY_BOOST = 4;

function wrap(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function ShotCard({ shot }: { shot: Shot }): ReactNode {
  return (
    <figure className="mr-5 w-[240px] shrink-0 sm:w-[300px]">
      <div className="overflow-hidden rounded-2xl">
        <Image
          src={shot.src}
          alt={`Generated frame: ${shot.prompt}`}
          width={600}
          height={800}
          unoptimized
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
        />
      </div>
      <figcaption className="text-muted-foreground mt-3 font-mono text-[11px] tracking-tight">
        “{shot.prompt}”
      </figcaption>
    </figure>
  );
}

function MarqueeRow({
  shots,
  direction,
}: {
  shots: Shot[];
  direction: 1 | -1;
}): ReactNode {
  const prefersReducedMotion = useReducedMotion();
  const baseX = useMotionValue(direction === 1 ? -SET_FRACTION / 2 : 0);
  const directionFactor = useRef<number>(direction);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    [0, 1200],
    [0, MAX_VELOCITY_BOOST],
    { clamp: false }
  );

  const x = useTransform(baseX, (value) => `${wrap(-SET_FRACTION, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;
    const step = BASE_SPEED * (delta / 1000);
    const boost = velocityFactor.get();
    if (boost < 0) directionFactor.current = -direction;
    else if (boost > 0) directionFactor.current = direction;
    const moveBy = directionFactor.current * step * (1 + Math.abs(boost)) * -1;
    baseX.set(baseX.get() + moveBy);
  });

  if (prefersReducedMotion) {
    return (
      <div className="overflow-x-auto px-5 sm:px-8 lg:px-10">
        <div className="flex w-max">
          {shots.map((shot) => (
            <ShotCard key={shot.src} shot={shot} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <motion.div style={{ x }} className="flex w-max">
        {Array.from({ length: COPIES }, (_, copy) =>
          shots.map((shot) => (
            <ShotCard key={`${copy}-${shot.src}`} shot={shot} />
          ))
        )}
      </motion.div>
    </div>
  );
}

export function Gallery(): ReactNode {
  return (
    <section
      id="gallery"
      className="scroll-mt-24 overflow-hidden pb-24 sm:pb-32"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <SectionHeading
          title="Moments from the tournament"
          description="Every shot is a memory living in the 3D space. Search one in plain language, open it, and add what you remember."
        />
      </div>

      <div className="mt-14 flex flex-col gap-10">
        <MarqueeRow shots={ROW_A} direction={1} />
        <MarqueeRow shots={ROW_B} direction={-1} />
      </div>
    </section>
  );
}
