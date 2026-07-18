import Link from "next/link";
import { CalendarDays, MapPin, Star } from "lucide-react";
import type { Scholarship } from "@/types";
import { formatDate, formatMoney } from "@/lib/format";

export function ScholarshipCard({ scholarship, matchScore }: { scholarship: Scholarship; matchScore?: number }) {
  return (
    <article className="flex h-full min-h-[470px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-slate-100"><img src={scholarship.providerImage} alt={`${scholarship.providerName} visual`} className="h-full w-full object-cover" />{matchScore !== undefined && <span className="absolute right-3 top-3 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">{matchScore}% match</span>}</div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{scholarship.fundingType}</span><span className="flex items-center gap-1 text-xs text-slate-500"><Star size={14} />{scholarship.averageRating ? scholarship.averageRating.toFixed(1) : "New"}</span></div>
        <h3 className="mt-4 line-clamp-2 text-lg font-black leading-6 text-slate-950">{scholarship.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{scholarship.shortDescription}</p>
        <div className="mt-4 grid gap-2 text-sm text-slate-600"><span className="flex items-center gap-2"><MapPin size={16} className="text-teal-600" />{scholarship.country}</span><span className="flex items-center gap-2"><CalendarDays size={16} className="text-amber-600" />{formatDate(scholarship.deadline)}{scholarship.deadlineIsEstimated ? "*" : ""}</span></div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5"><div><p className="text-xs text-slate-500">Estimated support</p><p className="font-black text-slate-950">{formatMoney(scholarship.estimatedValue, scholarship.currency)}</p></div><Link href={`/scholarships/${scholarship.slug}`} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700">View details</Link></div>
      </div>
    </article>
  );
}
