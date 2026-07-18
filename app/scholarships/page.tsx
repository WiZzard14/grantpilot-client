"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, X } from "lucide-react";
import { Suspense, useState } from "react";
import { apiFetch, toQuery } from "@/lib/api";
import type { ApiResponse, Scholarship } from "@/types";
import { ScholarshipCard } from "@/components/scholarship/ScholarshipCard";
import { ScholarshipSkeleton } from "@/components/scholarship/ScholarshipSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Facets { countries: string[]; degreeLevels: string[]; fields: string[]; fundingTypes: string[]; }

function ScholarshipsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFilters, setMobileFilters] = useState(false);
  const params = {
    search: searchParams.get("search") ?? "",
    country: searchParams.get("country") ?? "",
    degreeLevel: searchParams.get("degreeLevel") ?? "",
    field: searchParams.get("field") ?? "",
    fundingType: searchParams.get("fundingType") ?? "",
    sort: searchParams.get("sort") ?? "deadline",
    page: Number(searchParams.get("page") ?? 1),
    limit: 12
  };
  const update = (key: string, value: string | number) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, String(value)); else next.delete(key);
    if (key !== "page") next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };
  const queryString = toQuery(params);
  const query = useQuery({ queryKey: ["scholarships", queryString], queryFn: () => apiFetch<Scholarship[]>(`/scholarships${queryString}`) });
  const facets = useQuery({ queryKey: ["scholarship-facets"], queryFn: () => apiFetch<Facets>("/scholarships/facets").then((res) => res.data) });
  const filters = (
    <div className="grid gap-4">
      <div><label className="text-sm font-bold">Country</label><select value={params.country} onChange={(e) => update("country", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">All countries</option>{facets.data?.countries.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div><label className="text-sm font-bold">Degree level</label><select value={params.degreeLevel} onChange={(e) => update("degreeLevel", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">All levels</option>{facets.data?.degreeLevels.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div><label className="text-sm font-bold">Field</label><select value={params.field} onChange={(e) => update("field", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">All fields</option>{facets.data?.fields.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div><label className="text-sm font-bold">Funding</label><select value={params.fundingType} onChange={(e) => update("fundingType", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3"><option value="">All funding types</option>{facets.data?.fundingTypes.map((item) => <option key={item}>{item}</option>)}</select></div>
      <button onClick={() => router.push("/scholarships")} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 font-bold"><X size={16} />Clear filters</button>
    </div>
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl"><p className="font-bold uppercase tracking-widest text-teal-700">Explore</p><h1 className="mt-2 text-4xl font-black tracking-tight">Scholarship opportunities</h1><p className="mt-4 leading-7 text-slate-600">Search real programme references, then verify the current application cycle on the official source.</p></div>
      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_230px_auto]"><label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={params.search} onChange={(e) => update("search", e.target.value)} placeholder="Search scholarships, fields, or providers" className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4" /></label><select value={params.sort} onChange={(e) => update("sort", e.target.value)} className="h-12 rounded-xl border border-slate-300 bg-white px-4"><option value="deadline">Deadline approaching</option><option value="newest">Recently added</option><option value="funding">Highest funding</option><option value="rating">Highest rating</option><option value="alphabetical">Alphabetical</option></select><button onClick={() => setMobileFilters(true)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-bold text-white lg:hidden"><Filter size={18} />Filters</button></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]"><aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block"><h2 className="mb-5 flex items-center gap-2 font-black"><Filter size={18} />Filter results</h2>{filters}</aside><div><div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{query.data?.meta?.total ?? 0} opportunities found</p><p className="text-xs text-slate-500">* Estimated dates are clearly marked</p></div>{query.isLoading ? <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <ScholarshipSkeleton key={index} />)}</div> : query.data?.data.length ? <><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{query.data.data.map((item) => <ScholarshipCard key={item._id} scholarship={item} />)}</div><div className="mt-10 flex items-center justify-center gap-3"><button disabled={params.page <= 1} onClick={() => update("page", params.page - 1)} className="rounded-xl border bg-white px-4 py-2 font-bold">Previous</button><span className="text-sm font-semibold">Page {query.data.meta?.page} of {query.data.meta?.totalPages}</span><button disabled={params.page >= (query.data.meta?.totalPages ?? 1)} onClick={() => update("page", params.page + 1)} className="rounded-xl border bg-white px-4 py-2 font-bold">Next</button></div></> : <EmptyState title="No matching scholarships" description="Try removing one filter or using a broader field name." />}</div></div>
      {mobileFilters && <div className="fixed inset-0 z-[60] bg-slate-950/50 p-4 lg:hidden"><div className="ml-auto h-full max-w-sm overflow-auto rounded-2xl bg-white p-6"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-black">Filters</h2><button onClick={() => setMobileFilters(false)}><X /></button></div>{filters}</div></div>}
    </div>
  );
}

export default function ScholarshipsPage() { return <Suspense fallback={<div className="grid min-h-[60vh] place-items-center">Loading scholarships…</div>}><ScholarshipsContent /></Suspense>; }
