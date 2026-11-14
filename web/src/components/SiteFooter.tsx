"use client";

import { useEffect, useState } from "react";
import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";

/**
 * Site-wide footer: the owner-supplied halftone wordmark footer, set to the site's theme.
 * Dots pushed by the pointer light up in the site's colours (violet → magenta → pink → coral →
 * saffron → mint → cyan), sweeping slowly along the name. A ripple runs through the name the
 * first time the footer comes into view. Under the brand line: availability and local time.
 */

/** The site's accent colours, in gradient order. */
const SPECTRUM = ["#8052ff", "#c44dff", "#f25cc7", "#ff7a5c", "#ffb829", "#2fd3b0", "#3fd6ff"];

/** Live local time in Hyderabad (rendered after mount so the server and browser HTML match). */
function LocalTime() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const tick = () => setNow(fmt.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 30_000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);
  return <span className="site-footer-time">{now ? `${now} IST` : "\u00a0"}</span>;
}
const COLUMNS: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "About me", href: "/#about" },
      { label: "Projects", href: "/projects" },
      { label: "Academics", href: "/#academics" },
      { label: "Tech stack", href: "/#tech-stack" },
      { label: "Certificates", href: "/certificates" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/Laxmansirvi05", external: true },
      { label: "LinkedIn", href: "https://linkedin.com/in/laxmansirvi", external: true },
      { label: "WhatsApp", href: "https://wa.me/918688137388", external: true },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "laxmansirvi2203@gmail.com", href: "mailto:laxmansirvi2203@gmail.com" },
      { label: "Let's talk →", href: "/#contact" },
      { label: "Résumé ↓", href: "/Laxman_Sirvi_Resume.pdf", download: true },
    ],
  },
];

export default function SiteFooter({ fontFamily }: { fontFamily: string }) {
  return (
    <HalftoneWordmarkFooter
      wordmark="laxman sirvi"
      label="Laxman Sirvi"
      meta="© 2026 · Hyderabad, India"
      columns={COLUMNS}
      palette={{ background: "#000000", ink: "#ece8f5", warm: "#ffb829" }}
      fontFamily={fontFamily}
      fontWeight={800}
      monoFamily='ui-monospace, "SF Mono", Menlo, Consolas, monospace'
      warmPalette={SPECTRUM}
      radius={95}
      introRing
      brandExtra={
        <span className="site-footer-status">
          <span className="site-footer-open"><i aria-hidden="true" />Open to internships</span>
          <LocalTime />
        </span>
      }
      ruleStart={<span>Built with Next.js · Three.js<span className="site-footer-hint"> · Move over my name ✦</span></span>}
      // the two-word mark is shorter than the demo's, so the footer shrinks with the screen (never below 420px)
      height="max(560px, calc(300px + 18vw))"
      className="site-footer"
    />
  );
}
