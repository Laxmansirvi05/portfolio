"use client";

import { useEffect, useState } from "react";

/**
 * Hero headline + label, typed out side by side once the intro finishes.
 * Both lines start together and finish together (the longer label simply types faster).
 * The untyped text is rendered invisible so the layout never jumps while typing.
 */

type Seg = { text: string; cls?: string; br?: boolean };

const HEADLINE: Seg[] = [
  { text: "I build " },
  { text: "AI", cls: "ai" },
  { text: "", br: true },
  { text: "that " },
  { text: "ships.", cls: "accent" },
];
const LABEL: Seg[] = [{ text: "AI & Full-Stack Developer · B.Tech CSE (AI & ML)" }];

const HEADLINE_TEXT = "I build AI that ships.";
const LABEL_TEXT = LABEL[0].text;
const TOTAL_MS = 1900; // both lines finish in about this time
const START_DELAY = 250;

const len = (segs: Seg[]) => segs.reduce((n, s) => n + s.text.length, 0);

/** Renders segments with the first `n` characters visible, a caret, then the rest invisible. */
function Typed({ segs, n, caret }: { segs: Seg[]; n: number; caret: boolean }) {
  let left = n;
  let caretPlaced = false;
  const out: React.ReactNode[] = [];
  segs.forEach((s, k) => {
    if (s.br) { out.push(<br key={`br${k}`} />); return; }
    const shown = Math.max(0, Math.min(s.text.length, left));
    left -= s.text.length;
    const typed = s.text.slice(0, shown), rest = s.text.slice(shown);
    const caretHere = caret && !caretPlaced && rest.length > 0;
    if (caretHere) caretPlaced = true;
    out.push(
      <span key={k} className={s.cls}>
        {typed}
        {caretHere && <i className="caret" aria-hidden="true" />}
        {rest && <span className="ghost">{rest}</span>}
      </span>,
    );
  });
  if (caret && !caretPlaced) out.push(<i key="caret" className="caret" aria-hidden="true" />);
  return <>{out}</>;
}

export default function HeroTitle() {
  // progress 0 → 1 drives both lines, so they always move together
  const [p, setP] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, timer = 0;
    // tell the hero paragraph's agent it can start writing
    const announce = () => {
      document.documentElement.dataset.heroTyped = "1";
      window.dispatchEvent(new Event("hero:typed"));
    };
    const run = () => {
      if (reduced) { setP(1); announce(); return; }
      timer = window.setTimeout(() => {
        setTyping(true);
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / TOTAL_MS);
          setP(k);
          if (k < 1) raf = requestAnimationFrame(tick);
          else { announce(); window.setTimeout(() => setTyping(false), 2600); } // caret blinks a little, then rests
        };
        raf = requestAnimationFrame(tick);
      }, START_DELAY);
    };
    if (document.documentElement.dataset.intro !== "playing") run();
    else window.addEventListener("intro:done", run, { once: true });
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); window.removeEventListener("intro:done", run); };
  }, []);

  const nHead = Math.round(p * len(HEADLINE));
  const nLabel = Math.round(p * len(LABEL));

  return (
    <>
      <h1 className="display typing" aria-label={HEADLINE_TEXT}>
        <span aria-hidden="true">
          <Typed segs={HEADLINE} n={nHead} caret={typing || p < 1} />
        </span>
      </h1>
      <p className="label typing" aria-label={LABEL_TEXT}>
        <span aria-hidden="true">
          <Typed segs={LABEL} n={nLabel} caret={p > 0 && p < 1} />
        </span>
      </p>
    </>
  );
}
