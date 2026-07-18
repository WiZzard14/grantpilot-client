import Link from "next/link";

export const metadata = { title: "Help" };
const topics = [
  ["Account and demo login", "Use the auto-fill button on the login page after running the database seed. Google login appears when both client IDs are configured."],
  ["Recommendation agent", "Complete the academic profile first. Add a refinement only when you want to prioritise a specific country, field, funding type, or constraint."],
  ["Document analysis", "Upload one supported file at a time. Extraction and AI analysis are stored separately so reports can be reviewed and downloaded."],
  ["Scholarship accuracy", "Open the official source from every detail page. Estimated cycle dates are marked with a disclosure and should not be treated as confirmed."],
  ["Managing submissions", "Authenticated users may submit sourced scholarships. Student submissions remain pending until an administrator reviews them."],
  ["AI provider fallback", "Without a Gemini or OpenAI key, deterministic local logic keeps the workflow testable. Add a server-side GEMINI_API_KEY to use the free-tier AI provider."]
];
export default function HelpPage() { return <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6"><div className="text-center"><p className="font-bold uppercase tracking-widest text-teal-700">Help centre</p><h1 className="mt-3 text-5xl font-black">Using GrantPilot AI</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Answers for core workflows, verification, and local development.</p></div><div className="mt-12 grid gap-4">{topics.map(([title, text]) => <details key={title} className="rounded-2xl border bg-white p-6"><summary className="cursor-pointer list-none text-lg font-black">{title}</summary><p className="mt-4 leading-7 text-slate-600">{text}</p></details>)}</div><div className="mt-12 rounded-2xl bg-teal-50 p-7 text-center"><p className="font-black">Still need help?</p><Link href="/contact" className="mt-3 inline-flex font-bold text-teal-700">Contact support →</Link></div></div>; }
