import type { Metadata } from "next";
import ParticleMorph from "@/components/ParticleMorph";
import { CERTIFICATES } from "@/lib/certificates";

export const metadata: Metadata = {
  title: "Certificates — Laxman Sirvi",
  description:
    "Every certificate Laxman Sirvi holds: SQL, Java, Python, machine learning, generative AI and AI agents, from HackerRank, IBM, Oracle, AWS, Google Cloud, Microsoft, Anthropic and more.",
};

/** All certificates as a plain list (no entrance animation), newest first, with IDs and verify links. */
export default function CertificatesPage() {
  return (
    <main className="page certificates-page">
      <ParticleMorph ambientOnly />
      <header className="section-head page-head">
        <p className="label">Certificates · {CERTIFICATES.length}</p>
        <h1 className="section-title">
          Every <em>certificate.</em>
        </h1>
        <p className="body">Newest first, with credential IDs and verification links where the issuer provides one.</p>
      </header>

      <ol className="cert-list">
        {CERTIFICATES.map((c) => (
          <li key={c.slug} id={c.slug} className="cert-item" style={{ "--dot": c.dot } as React.CSSProperties}>
            {c.image ? (
              <a className="cert-thumb" href={c.image} target="_blank" rel="noreferrer" aria-label={`${c.title}: open the certificate image`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={`${c.title} certificate from ${c.issuer}`} loading="lazy" decoding="async" />
              </a>
            ) : (
              <span className="cert-thumb">
                <span className="cert-tile" aria-hidden="true"><b>{c.issuer}</b><i>{c.title}</i></span>
              </span>
            )}
            <div className="cert-meta">
              <span className="cert-issuer"><i aria-hidden="true" />{c.issuer}</span>
              <h2>{c.title}</h2>
              <span className="cert-date">{c.date}{c.via && ` · via ${c.via}`}</span>
              {c.credential && <span className="cert-id">ID {c.credential}</span>}
              {c.verify && (
                <a className="cert-verify" href={c.verify} target="_blank" rel="noreferrer">Verify ↗</a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
