"use client";

import { useEffect, useRef } from "react";
import { runAgentBuild } from "@/lib/agentBuild";

/**
 * After the hero headline and label finish typing, an "AI agent" cursor flies in,
 * draws a box and writes the intro paragraph (the [data-agent] blocks inside .hero-copy).
 */
export default function HeroAgent() {
  const overlay = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = overlay.current?.closest<HTMLElement>(".hero-copy");
    if (!container || !cursor.current || !box.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop = () => {};
    const start = () => {
      const blocks = [...container.querySelectorAll<HTMLElement>("[data-agent]")];
      const first = blocks[0]?.getBoundingClientRect(), c = container.getBoundingClientRect();
      stop = runAgentBuild(container, [cursor.current!], [box.current!], {
        reduced,
        blocks,
        // enters from just right of the paragraph, slightly below it
        from: first ? [[first.right - c.left + 80, first.bottom - c.top + 60]] : undefined,
      });
    };
    if (document.documentElement.dataset.heroTyped === "1") start();
    else window.addEventListener("hero:typed", start, { once: true });
    return () => { window.removeEventListener("hero:typed", start); stop(); };
  }, []);

  return (
    <div className="agents" aria-hidden="true" ref={overlay}>
      <span className="agent-box tone-cyan" ref={box}><b>ai.writer</b></span>
      <span className="agent-cursor tone-cyan" ref={cursor}>
        <svg viewBox="0 0 16 20"><path d="M1 1 L1 16 L5 12 L8 19 L11 17.6 L8 11 L14 11 Z" /></svg>
        <b>ai.writer</b>
      </span>
    </div>
  );
}
