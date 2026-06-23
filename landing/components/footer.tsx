import { Logo } from "@/components/nav/logo";
import type { ReactNode } from "react";

type FooterLink = {
  label: string;
  href: string;
};

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#overview" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Gallery", href: "#gallery" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Press", href: "#press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Instagram", href: "#instagram" },
      { label: "X", href: "#x" },
      { label: "LinkedIn", href: "#linkedin" },
    ],
  },
];

export function Footer(): ReactNode {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto max-w-[1440px] px-5 pt-16 sm:px-8 sm:pt-20 lg:px-10">
        <div className="flex flex-col gap-14 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
              Hyperreal photos and film, generated and reviewed on your phone.
            </p>
            <a
              href="#sign-up"
              className="focus-ring bg-foreground text-background mt-8 inline-flex h-11 items-center rounded-full px-6 text-sm font-medium transition-opacity hover:opacity-85"
            >
              Get the app
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-16">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-foreground text-sm font-medium tracking-tight">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="focus-ring text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Walrus Memory. Open source.
          </p>
          <p className="text-muted-foreground text-xs">
            Memories stored on Walrus Mainnet.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none overflow-hidden select-none"
        >
          <p className="text-muted translate-y-[22%] text-center text-[clamp(60px,14vw,220px)] leading-[0.85] font-medium tracking-tighter">
            Walrus Memory
          </p>
        </div>
      </div>
    </footer>
  );
}
