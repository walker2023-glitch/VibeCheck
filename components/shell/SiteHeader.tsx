"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

/** Lifecycle order: Plan → Build(understand) → Prove → Debug → Ship → Grow */
export const PRIMARY_NAV = [
  { href: "/", label: "Home", exact: true },
  { href: "/plan", label: "Plan", preview: true, accent: "information" },
  { href: "/code-detective", label: "Code Detective", accent: "primary" },
  { href: "/knowledge-check", label: "Knowledge Check", accent: "learning" },
  { href: "/rubber-duck", label: "Rubber Duck", preview: true, accent: "warning" },
  { href: "/deploy", label: "Deploy", preview: true, accent: "success" },
  { href: "/my-skills", label: "My Skills", preview: true, accent: "indigo" }
] as const;

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-5 md:px-10 lg:px-16">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/compass-dark.svg" alt="" width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-semibold tracking-tight text-text">
            Vibe<span className="text-primary">Check</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:gap-2 lg:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item, index) => {
            const active = isActive(pathname, item.href, "exact" in item && item.exact);
            const showSeparator = index === 1 || index === 4;
            return (
              <span key={item.href} className="flex items-center">
                {showSeparator ? (
                  <span
                    className="mx-1 h-4 w-px bg-border/70"
                    aria-hidden
                  />
                ) : null}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-2 py-1.5 text-sm font-medium tracking-[0.02em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    active ? "text-primary" : "text-text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              </span>
            );
          })}
        </nav>

        <button
          type="button"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border text-text lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-border bg-surface px-5 py-4 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-2">
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item.href, "exact" in item && item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block min-h-10 rounded-lg px-3 py-2 text-sm font-medium ${
                      active ? "bg-surface-raised text-primary" : "text-text-muted hover:text-text"
                    }`}
                  >
                    {item.label}
                    {"preview" in item && item.preview ? (
                      <span className="ml-2 text-xs text-text-muted">(preview)</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
