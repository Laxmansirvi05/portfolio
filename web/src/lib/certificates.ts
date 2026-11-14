/**
 * Every certificate, newest first. Sources: the LinkedIn "Licenses & certifications" list,
 * the old portfolio (IBM SkillsBuild Generative AI) and the two SQL certificates the owner shared.
 * Note: the IBM SQL certificate is issued to "Lakshman Choudhary", another name of the owner.
 */
export type Certificate = {
  slug: string;
  title: string;
  issuer: string;
  /** a platform the course was delivered through, if any */
  via?: string;
  date: string;
  /** ISO date, used for sorting */
  iso: string;
  credential?: string;
  verify?: string;
  image?: string;
  /** brand-ish dot colour for the issuer */
  dot: string;
};

export const CERTIFICATES: Certificate[] = [
  {
    slug: "hackerrank-sql",
    title: "SQL (Basic)",
    issuer: "HackerRank",
    date: "Nov 2, 2026",
    iso: "2026-11-02",
    credential: "2BA5CBD096C9",
    image: "/certificates/hackerrank-sql.jpg",
    dot: "#2ec866",
  },
  {
    slug: "ibm-sql",
    title: "SQL and Relational Databases 101",
    issuer: "IBM Skills Network",
    via: "Cognitive Class",
    date: "Oct 30, 2026",
    iso: "2026-10-30",
    credential: "DB0101EN",
    verify: "https://courses.cognitiveclass.ai/certificates/6e8ec27983674512befec68d29586306",
    image: "/certificates/ibm-sql.jpg",
    dot: "#4f7bff",
  },
  {
    slug: "oracle-java",
    title: "Java Foundations",
    issuer: "Oracle",
    date: "Aug 2026",
    iso: "2026-08-01",
    image: "/certificates/oracle-java.jpg",
    dot: "#f80000",
  },
  {
    slug: "aws-ml",
    title: "Machine Learning Basics",
    issuer: "Amazon Web Services",
    via: "Simplilearn SkillUP",
    date: "May 28, 2026",
    iso: "2026-05-28",
    credential: "10280485",
    image: "/certificates/aws-ml.jpg",
    dot: "#ff9900",
  },
  {
    slug: "cisco-python",
    title: "Python Essentials 1",
    issuer: "Cisco Networking Academy",
    via: "OpenEDG Python Institute",
    date: "May 25, 2026",
    iso: "2026-05-25",
    image: "/certificates/cisco-python.jpg",
    dot: "#1ba0d7",
  },
  {
    slug: "simplilearn-ai-agents",
    title: "AI Agents for Beginners",
    issuer: "Simplilearn SkillUP",
    date: "May 23, 2026",
    iso: "2026-05-23",
    credential: "10261354",
    image: "/certificates/simplilearn-ai-agents.jpg",
    dot: "#ff7a5c",
  },
  {
    slug: "deloitte-data",
    title: "Data Analytics Job Simulation",
    issuer: "Deloitte Australia",
    via: "Forage",
    date: "May 18, 2026",
    iso: "2026-05-18",
    credential: "2Mpaw9Nbvh4tyHYGJ",
    image: "/certificates/deloitte-data.jpg",
    dot: "#86bc25",
  },
  {
    slug: "microsoft-prompt",
    title: "Prompt Engineering with GitHub Copilot",
    issuer: "Microsoft",
    via: "Simplilearn SkillUP",
    date: "May 17, 2026",
    iso: "2026-05-17",
    credential: "10237478",
    image: "/certificates/microsoft-prompt.jpg",
    dot: "#00a4ef",
  },
  {
    slug: "anthropic-claude",
    title: "Claude Code in Action",
    issuer: "Anthropic",
    date: "May 14, 2026",
    iso: "2026-05-14",
    credential: "g4mnsv9igxyn",
    verify: "https://verify.skilljar.com/c/g4mnsv9igxyn",
    image: "/certificates/anthropic-claude.jpg",
    dot: "#d97757",
  },
  {
    slug: "hp-ai",
    title: "AI for Beginners",
    issuer: "HP LIFE",
    via: "HP Foundation",
    date: "May 11, 2026",
    iso: "2026-05-11",
    credential: "e5121bad-fe37-4052-bcfe-a5cb747ac398",
    image: "/certificates/hp-ai.jpg",
    dot: "#0096d6",
  },
  {
    slug: "google-genai",
    title: "Introduction to Generative AI",
    issuer: "Google Cloud",
    via: "Simplilearn SkillUP",
    date: "May 6, 2026",
    iso: "2026-05-06",
    credential: "10196838",
    image: "/certificates/google-genai.jpg",
    dot: "#4285f4",
  },
  {
    slug: "be10x-ai-tools",
    title: "AI Tools & ChatGPT Workshop",
    issuer: "be10x",
    date: "Apr 19, 2026",
    iso: "2026-04-19",
    credential: "0270772f-3809-4400-b29b-1e1c61cd0997",
    image: "/certificates/be10x-ai-tools.jpg",
    dot: "#ffb829",
  },
  {
    slug: "ibm-genai",
    title: "Introduction to Generative AI",
    issuer: "IBM SkillsBuild",
    date: "Mar 11, 2026",
    iso: "2026-03-11",
    credential: "ALM-COURSE_4058859",
    image: "/certificates/ibm-genai.jpg",
    dot: "#4f7bff",
  },
];
