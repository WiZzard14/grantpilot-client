"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Bot, BrainCircuit, CheckCircle2, FileSearch, Search, ShieldCheck, Sparkles, Target } from "lucide-react";
import { apiFetch, toQuery } from "@/lib/api";
import type { Blog, Scholarship } from "@/types";
import { ScholarshipCard } from "@/components/scholarship/ScholarshipCard";
import { ScholarshipSkeleton } from "@/components/scholarship/ScholarshipSkeleton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatDate } from "@/lib/format";

const faqs = [
  ["Does GrantPilot guarantee eligibility?", "No. It helps organise and compare evidence, while the official scholarship provider remains the final authority."],
  ["Can recommendations improve over time?", "Yes. Saved, dismissed, viewed, and applied interactions are stored and used as context for future ranking."],
  ["Which documents can I analyze?", "PDF, DOCX, TXT, PNG, JPEG, and WebP files are supported. Visual analysis requires a configured multimodal AI provider."],
  ["Is an AI key required for development?", "No. A deterministic local fallback keeps the project usable, while a server-side Gemini API key activates free-tier model-based reasoning."]
];

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const featured = useQuery({ queryKey: ["featured-scholarships"], queryFn: () => apiFetch<Scholarship[]>("/scholarships?featured=true&limit=8").then((res) => res.data) });
  const stats = useQuery({ queryKey: ["public-stats"], queryFn: () => apiFetch<{ activeScholarships: number; supportedCountries: number; analysesCompleted: number; profilesBuilt: number }>("/content/stats").then((res) => res.data) });
  const blogs = useQuery({ queryKey: ["home-blogs"], queryFn: () => apiFetch<Blog[]>("/content/blogs").then((res) => res.data.slice(0, 3)) });
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/scholarships${toQuery({ search, country })}`);
  };
  return (
    <>
      <section className="hero-grid relative overflow-hidden border-b bg-white">
        <div className="mx-auto grid min-h-[65vh] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700"><Sparkles size={16} />Agentic scholarship planning</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">Find scholarships that fit your <span className="text-teal-600">actual profile.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Discover sourced programmes, understand eligibility gaps, analyze application documents, and turn deadlines into a practical action plan.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white">Build my profile <ArrowRight size={18} /></Link><Link href="/scholarships" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800">Explore scholarships</Link></div>
          </div>
          <div className="floating rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/50">
            <div className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-center justify-between"><span className="font-bold">Match Agent</span><BrainCircuit className="text-teal-300" /></div><p className="mt-4 text-3xl font-black">Profile-aware</p><p className="mt-1 text-sm text-slate-300">Academic, funding, and location alignment</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-teal-50 p-4"><Target className="text-teal-700" /><p className="mt-4 font-bold">Eligibility gaps</p><p className="mt-1 text-sm text-slate-600">Flagged before you invest hours.</p></div><div className="rounded-2xl bg-amber-50 p-4"><FileSearch className="text-amber-700" /><p className="mt-4 font-bold">Document review</p><p className="mt-1 text-sm text-slate-600">Action items from your files.</p></div></div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-8">
        <form onSubmit={submitSearch} className="mx-auto grid max-w-5xl gap-3 px-4 sm:px-6 md:grid-cols-[1fr_240px_auto]">
          <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 w-full rounded-xl border-0 bg-white pl-11 pr-4 outline-none ring-teal-400 focus:ring-2" placeholder="Scholarship, field, or institution" /></label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-12 rounded-xl bg-white px-4 outline-none focus:ring-2 focus:ring-teal-400"><option value="">Any country</option><option>United Kingdom</option><option>Germany</option><option>Japan</option><option>Australia</option><option>United States</option></select>
          <button className="h-12 rounded-xl bg-teal-500 px-6 font-black text-slate-950 hover:bg-teal-400">Search now</button>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><SectionTitle eyebrow="Verified discovery" title="Featured scholarship programmes" description="Real programme references with official source links and transparent deadline verification notes." /><Link href="/scholarships" className="font-bold text-teal-700">View all opportunities →</Link></div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{featured.isLoading ? Array.from({ length: 8 }).map((_, index) => <ScholarshipSkeleton key={index} />) : featured.data?.map((item) => <ScholarshipCard key={item._id} scholarship={item} />)}</div>
      </section>

      <section className="border-y bg-white py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionTitle center eyebrow="Simple workflow" title="From profile to application plan" /><div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">{[["01", "Build your profile", "Record academic background, preferences, funding needs, and language evidence."], ["02", "Run the match agent", "The agent retrieves candidates, scores eligibility, and validates the ranked output."], ["03", "Analyze documents", "Upload an SOP, CV, transcript, offer, or scholarship notice for structured analysis."], ["04", "Track next actions", "Save opportunities, update application states, and monitor upcoming deadlines."]].map(([number, title, text]) => <div key={number} className="rounded-2xl border border-slate-200 p-6"><span className="text-4xl font-black text-teal-600">{number}</span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><SectionTitle eyebrow="Tool-using agents" title="Substantial AI, not a one-prompt wrapper" description="Each workflow retrieves application context, uses specialised tools, validates output, and stores useful memory." /><div className="mt-10 grid gap-6 lg:grid-cols-3">{[[BrainCircuit, "Recommendation Agent", "Uses your profile, scholarship records, and interaction history to rank relevant opportunities and explain risks."], [FileSearch, "Document Intelligence", "Extracts and classifies documents, compares evidence with requirements, and creates downloadable reports."], [Bot, "Contextual Assistant", "Reads saved opportunities and conversation history to answer navigation, comparison, and deadline questions."]].map(([Icon, title, text]) => { const C = Icon as typeof BrainCircuit; return <div key={String(title)} className="rounded-2xl bg-slate-950 p-7 text-white"><C className="text-teal-300" size={34} /><h3 className="mt-8 text-xl font-black">{String(title)}</h3><p className="mt-3 leading-7 text-slate-300">{String(text)}</p></div>; })}</div></section>

      <section className="bg-teal-600 py-16 text-slate-950"><div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">{[[stats.data?.activeScholarships ?? 0, "Active sourced listings"], [stats.data?.supportedCountries ?? 0, "Countries represented"], [stats.data?.analysesCompleted ?? 0, "AI analyses completed"], [stats.data?.profilesBuilt ?? 0, "Profiles built"]].map(([value, label]) => <div key={String(label)} className="rounded-2xl bg-white/80 p-6"><p className="text-4xl font-black">{value}</p><p className="mt-2 font-semibold">{label}</p></div>)}</div></section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8"><div><SectionTitle eyebrow="Responsible by design" title="AI output with visible uncertainty" description="GrantPilot helps users prepare; it does not pretend to replace official selection decisions." /><div className="mt-8 grid gap-4">{["Official source URL on every public scholarship", "Last-verified date and estimated-deadline disclosure", "No guarantee of admission or eligibility", "Secure file validation and user-scoped records", "Editable labels, feedback, and interaction controls"].map((item) => <div key={item} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><CheckCircle2 className="shrink-0 text-teal-600" /><span className="font-semibold">{item}</span></div>)}</div></div><div className="rounded-[2rem] bg-slate-950 p-8 text-white"><ShieldCheck size={42} className="text-teal-300" /><h3 className="mt-8 text-3xl font-black">Verification checklist</h3><p className="mt-4 leading-7 text-slate-300">Before applying, confirm the current cycle, eligibility, local nomination rules, deadline time zone, required document format, and official submission portal.</p><Link href="/blog/verify-scholarship-listing" className="mt-8 inline-flex items-center gap-2 font-bold text-teal-300">Read the verification guide <ArrowRight size={18} /></Link></div></section>

      <section className="border-y bg-white py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><SectionTitle center eyebrow="Application guidance" title="Practical scholarship resources" /><div className="mt-10 grid gap-6 md:grid-cols-3">{blogs.data?.map((blog) => <article key={blog._id} className="overflow-hidden rounded-2xl border border-slate-200"><img src={blog.image} alt="" className="h-44 w-full object-cover" /><div className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">{formatDate(blog.publishedAt)}</p><h3 className="mt-3 text-xl font-black">{blog.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{blog.excerpt}</p><Link href={`/blog/${blog.slug}`} className="mt-5 inline-flex font-bold text-teal-700">Read guide →</Link></div></article>)}</div></div></section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6"><SectionTitle center eyebrow="FAQ" title="Questions before you begin" /><div className="mt-10 grid gap-3">{faqs.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer list-none font-black">{question}</summary><p className="mt-3 leading-7 text-slate-600">{answer}</p></details>)}</div></section>

      <section className="px-4 pb-20 sm:px-6"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12 lg:flex-row lg:items-center"><div><p className="font-bold text-teal-300">Your next application starts with evidence</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Build a profile and generate your first match report.</h2></div><Link href="/register" className="shrink-0 rounded-xl bg-teal-400 px-6 py-3.5 font-black text-slate-950">Create free account</Link></div></section>
    </>
  );
}
