/**
 * "AI agents build the copy": a few labelled arrow cursors fly in, each draws a selection box
 * where a block of content goes, types the text into it (riding the caret), then moves on.
 * Several cursors work at once, pulling the next block from a shared queue.
 *
 * Markup contract (inside `container`, which must be position: relative):
 *  - blocks to build carry `data-agent="type"` (typed letter by letter) or `data-agent="show"` (pops in);
 *  - `cursors` and `boxes` are absolutely positioned elements, one of each per agent.
 */

type Agent = { cursor: HTMLElement; box: HTMLElement; x: number; y: number };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Wrap every character of every text node in a span so it can be revealed one by one. */
export function splitIntoChars(block: HTMLElement): HTMLSpanElement[] {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const chars: HTMLSpanElement[] = [];
  for (const node of nodes) {
    const text = node.nodeValue ?? "";
    if (!text.trim() && !text.includes(" ")) continue;
    const frag = document.createDocumentFragment();
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      frag.appendChild(s);
      chars.push(s);
    }
    node.parentNode?.replaceChild(frag, node);
  }
  return chars;
}

export function runAgentBuild(
  container: HTMLElement,
  cursors: HTMLElement[],
  boxes: HTMLElement[],
  opts: {
    reduced?: boolean;
    onDone?: () => void;
    /** Blocks to build (default: every [data-agent] inside `container`). May live anywhere on the page. */
    blocks?: HTMLElement[];
    /** Element carrying the `agent-pending` class that hides the blocks until now (default: container). */
    pending?: HTMLElement;
    /** Where each cursor enters from, relative to `container` (default: off its right edge). */
    from?: [number, number][];
  } = {},
) {
  let cancelled = false;
  const blocks = opts.blocks ?? [...container.querySelectorAll<HTMLElement>("[data-agent]")];
  const chars = new Map(blocks.filter((b) => b.dataset.agent === "type").map((b) => [b, splitIntoChars(b)]));
  (opts.pending ?? container).classList.remove("agent-pending");

  if (opts.reduced) {
    chars.forEach((list) => list.forEach((c) => c.classList.add("on")));
    blocks.forEach((b) => b.classList.add("built"));
    opts.onDone?.();
    return () => {};
  }

  const frame = () => new Promise<number>((r) => requestAnimationFrame(r));
  const box = (el: HTMLElement) => {
    const c = container.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
  };
  const place = (a: Agent, x: number, y: number) => {
    a.x = x; a.y = y;
    a.cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  };
  const tween = async (ms: number, step: (k: number) => void) => {
    const t0 = performance.now();
    for (;;) {
      if (cancelled) return;
      const k = Math.min(1, (performance.now() - t0) / ms);
      step(ease(k));
      if (k >= 1) return;
      await frame();
    }
  };
  const moveTo = (a: Agent, x: number, y: number, ms = 520) => {
    const x0 = a.x, y0 = a.y;
    return tween(ms, (k) => place(a, x0 + (x - x0) * k, y0 + (y - y0) * k));
  };

  const build = async (a: Agent, block: HTMLElement) => {
    const r = box(block);
    await moveTo(a, r.x - 6, r.y - 4);
    // draw the selection box out from the cursor
    a.box.style.left = `${r.x - 6}px`;
    a.box.style.top = `${r.y - 4}px`;
    a.box.classList.add("on");
    await tween(380, (k) => {
      a.box.style.width = `${(r.w + 12) * k}px`;
      a.box.style.height = `${(r.h + 8) * Math.max(0.12, k)}px`;
      place(a, r.x - 6 + (r.w + 12) * k, r.y - 4 + (r.h + 8) * k);
    });
    await moveTo(a, r.x, r.y + 4, 260);

    const list = chars.get(block);
    if (list) {
      // type: speed scales with length so long paragraphs don't drag on
      const perChar = Math.max(9, Math.min(55, 2400 / list.length));
      const t0 = performance.now();
      let shown = 0;
      while (shown < list.length && !cancelled) {
        const target = Math.min(list.length, Math.floor((performance.now() - t0) / perChar) + 1);
        for (; shown < target; shown++) list[shown]!.classList.add("on");
        const live = box(block);
        a.box.style.left = `${live.x - 6}px`;
        a.box.style.top = `${live.y - 4}px`;
        a.box.style.width = `${live.w + 12}px`;
        a.box.style.height = `${live.h + 8}px`;
        const last = list[shown - 1];
        if (last) {
          const c = container.getBoundingClientRect(), lr = last.getBoundingClientRect();
          place(a, lr.right - c.left + 2, lr.top - c.top + lr.height * 0.55);
        }
        await frame();
      }
    } else {
      block.classList.add("built");
      await tween(320, () => {});
    }
    block.classList.add("built");
    a.box.classList.remove("on");
  };

  const agents: Agent[] = cursors.map((cursor, i) => ({ cursor, box: boxes[i]!, x: 0, y: 0 }));
  const queue = [...blocks];
  const cw = container.clientWidth;
  // start positions: given, or just off the container's right edge (top-right / right / bottom-right)
  agents.forEach((a, i) => {
    const [x, y] = opts.from?.[i] ?? [cw + 40 + i * 30, -40 + i * 120];
    place(a, x, y);
    a.cursor.classList.add("on");
  });

  const worker = async (a: Agent, delay: number) => {
    await new Promise((r) => setTimeout(r, delay));
    while (queue.length && !cancelled) await build(a, queue.shift()!);
    if (cancelled) return;
    await moveTo(a, a.x + 140, a.y - 60, 600);
    a.cursor.classList.remove("on");
  };

  Promise.all(agents.map((a, i) => worker(a, i * 280))).then(() => { if (!cancelled) opts.onDone?.(); });

  return () => {
    cancelled = true;
    chars.forEach((list) => list.forEach((c) => c.classList.add("on")));
    blocks.forEach((b) => b.classList.add("built"));
  };
}
