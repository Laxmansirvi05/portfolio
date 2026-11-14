"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Site header: fixed to the top of every page (it lives in the root layout), so visitors can jump
 * anywhere at any time. Section links point at the home page ("/#…") so they also work from other pages;
 * Projects and Certificates open their own full-list pages.
 */
const LINKS = [
  { href: "/#about", label: "About me" },
  { href: "/projects", label: "Projects" },
  { href: "/#academics", label: "Academics" },
  { href: "/#tech-stack", label: "Tech stack" },
  { href: "/certificates", label: "Certificates" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  // once the page scrolls, give the header a soft dark backing so it stays readable over content
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav reveal${open ? " is-open" : ""}${scrolled ? " is-scrolled" : ""}`}>
      <Link href="/" className="brand" aria-label="Laxman Sirvi, home" onClick={() => setOpen(false)}>
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8052ff" />
              <stop offset="1" stopColor="#15846e" />
            </linearGradient>
          </defs>
          <path d="M4 26 L16 4 L28 26 Z" fill="none" stroke="url(#brandGrad)" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M11 26 L16 17 L21 26" fill="none" stroke="#ffb829" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <span>Laxman Sirvi</span>
      </Link>

      <nav className="nav-links" aria-label="Main">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={path === l.href ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <Link href="/#contact" className="pill nav-cta" onClick={() => setOpen(false)}>Let&apos;s talk</Link>

      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <i /><i />
      </button>
    </header>
  );
}
