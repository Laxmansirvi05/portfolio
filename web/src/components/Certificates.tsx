import Link from "next/link";
import { CERTIFICATES, type Certificate } from "@/lib/certificates";

/**
 * Home: certificates on two endless rows that drift in opposite directions (motion from the
 * 21st.dev "habit FAQ scroller", restyled to the site's dark theme). Hovering a row pauses it.
 * Each card, and the "View all" link, opens the /certificates page, which lists everything.
 */

function CertCard({ c, hidden }: { c: Certificate; hidden?: boolean }) {
  return (
    <Link
      href={`/certificates#${c.slug}`}
      className="cert-card"
      tabIndex={hidden ? -1 : undefined}
      style={{ "--dot": c.dot } as React.CSSProperties}
    >
      <span className="cert-thumb">
        {c.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image} alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="cert-tile" aria-hidden="true"><b>{c.issuer}</b><i>{c.title}</i></span>
        )}
      </span>
      <span className="cert-meta">
        <span className="cert-issuer"><i aria-hidden="true" />{c.issuer}</span>
        <b>{c.title}</b>
        <span className="cert-date">{c.date}</span>
      </span>
    </Link>
  );
}

/** One looping row: the cards twice in a row, slid by half its width, so the loop has no seam. */
function Row({ items, reverse, speed }: { items: Certificate[]; reverse?: boolean; speed: string }) {
  return (
    <div className={`cert-row${reverse ? " is-reverse" : ""}`}>
      <div className="cert-belt" style={{ "--speed": speed } as React.CSSProperties}>
        <div className="cert-set">{items.map((c) => <CertCard key={c.slug} c={c} />)}</div>
        <div className="cert-set" aria-hidden="true">{items.map((c) => <CertCard key={c.slug} c={c} hidden />)}</div>
      </div>
    </div>
  );
}

export default function Certificates() {
  const half = Math.ceil(CERTIFICATES.length / 2);
  return (
    <section id="certificates" className="certificates" aria-labelledby="cert-title">
      <header className="section-head cert-head">
        <div>
          <p className="label">Certificates · {CERTIFICATES.length}</p>
          <h2 id="cert-title" className="section-title">
            Always <em>learning.</em>
          </h2>
          <p className="body">
            Courses and skill tests from AWS, Google Cloud, Microsoft, IBM, Anthropic, Oracle, HackerRank and more.
          </p>
        </div>
        <Link href="/certificates" className="ghost cert-all">View all certificates →</Link>
      </header>

      <div className="cert-rows">
        <Row items={CERTIFICATES.slice(0, half)} speed="60s" />
        <Row items={CERTIFICATES.slice(half)} speed="52s" reverse />
      </div>
    </section>
  );
}
