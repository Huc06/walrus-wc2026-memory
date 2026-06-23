import { AppShowcase } from "@/components/app-showcase";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { Integrations } from "@/components/integrations";
import { Manifesto } from "@/components/manifesto";
import { Nav } from "@/components/nav/nav";
import { Testimonials } from "@/components/testimonials";
import { createMetadata, siteConfig } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Home",
    description: `Welcome to ${siteConfig.name}. ${siteConfig.description}`,
    path: "/",
  }),
  title: { absolute: "Walrus Memory · World Cup 2026" },
};

export default function HomePage(): ReactNode {
  return (
    <>
      <span id="top" className="sr-only" />
      <Nav />
      <main id="main-content" className="flex-1 overflow-x-clip">
        <Hero />
        <Manifesto />
        <Features />
        <AppShowcase />
        <Gallery />
        <Integrations />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
