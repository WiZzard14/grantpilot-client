"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, CheckCircle2, ExternalLink, FileText, Heart, MapPin, ShieldAlert, Star } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import type { Scholarship } from "@/types";
import { PageLoader } from "@/components/ui/PageLoader";
import { ScholarshipCard } from "@/components/scholarship/ScholarshipCard";
import { useAuth } from "@/components/auth/AuthProvider";

interface DetailsResponse {
  scholarship: Scholarship;
  reviews: Array<{ _id: string; rating: number; comment: string; userId: { name: string; image?: string }; createdAt: string }>;
  related: Scholarship[];
}

export default function ScholarshipDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const query = useQuery({ queryKey: ["scholarship", slug], queryFn: () => apiFetch<DetailsResponse>(`/scholarships/${slug}`).then((res) => res.data) });
  const review = useMutation({ mutationFn: (id: string) => apiFetch(`/scholarships/${id}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) }), onSuccess: () => { setComment(""); toast.success("Review submitted for moderation"); }, onError: (error) => toast.error(error.message) });
  const save = useMutation({
    mutationFn: (id: string) => apiFetch(`/saved/${id}`, { method: "PUT", body: JSON.stringify({ status: "saved" }) }),
    onSuccess: () => { toast.success("Scholarship saved"); queryClient.invalidateQueries({ queryKey: ["saved"] }); },
    onError: (error) => toast.error(error.message)
  });
  if (query.isLoading) return <PageLoader label="Loading scholarship details" />;
  if (!query.data) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-3xl font-black">Scholarship not found</h1><Link href="/scholarships" className="mt-5 inline-flex font-bold text-teal-700">Return to explore</Link></div>;
  const { scholarship, reviews, related } = query.data;
  const handleSave = () => user ? save.mutate(scholarship._id) : router.push(`/login?next=/scholarships/${slug}`);
  return (
    <div className="pb-20">
      <section className="border-b bg-white"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{scholarship.fundingType}</span>{scholarship.deadlineIsEstimated && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Deadline estimate</span>}</div><h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">{scholarship.title}</h1><p className="mt-4 text-lg text-slate-600">{scholarship.providerName}</p><div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-slate-600"><span className="flex items-center gap-2"><MapPin className="text-teal-600" size={18} />{scholarship.location}</span><span className="flex items-center gap-2"><CalendarDays className="text-amber-600" size={18} />{formatDate(scholarship.deadline)}</span><span className="flex items-center gap-2"><Star className="text-amber-500" size={18} />{scholarship.averageRating ? `${scholarship.averageRating.toFixed(1)} (${scholarship.reviewCount})` : "No approved ratings yet"}</span></div><div className="mt-8 flex flex-wrap gap-3"><a href={scholarship.officialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Official application source <ExternalLink size={17} /></a><button onClick={handleSave} disabled={save.isPending} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold"><Heart size={17} />Save opportunity</button></div></div><div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50"><img src={scholarship.providerImage} alt={`${scholarship.providerName} programme visual`} className="h-64 w-full object-cover" /><div className="p-6"><p className="text-sm text-slate-500">Estimated support</p><p className="mt-1 text-3xl font-black">{formatMoney(scholarship.estimatedValue, scholarship.currency)}</p><p className="mt-3 text-xs leading-5 text-slate-500">Funding coverage and value depend on provider rules, course duration, and current cycle documents.</p></div></div></div></section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8"><div className="grid gap-10"><section><h2 className="text-2xl font-black">Overview</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-700">{scholarship.fullDescription}</p></section><section className="grid gap-6 md:grid-cols-2"><div className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Key information</h2><dl className="mt-5 grid gap-4 text-sm"><div><dt className="text-slate-500">Country</dt><dd className="font-bold">{scholarship.country}</dd></div><div><dt className="text-slate-500">Degree levels</dt><dd className="font-bold">{scholarship.degreeLevels.join(", ")}</dd></div><div><dt className="text-slate-500">Fields</dt><dd className="font-bold">{scholarship.fields.join(", ")}</dd></div><div><dt className="text-slate-500">Last source check</dt><dd className="font-bold">{formatDate(scholarship.lastVerifiedAt)}</dd></div></dl></div><div className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Deadline note</h2><p className="mt-5 leading-7 text-slate-600">{scholarship.deadlineLabel ?? `Stored deadline: ${formatDate(scholarship.deadline)}`}</p><a href={scholarship.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 font-bold text-teal-700">Verify the live cycle <ExternalLink size={16} /></a></div></section>
        <section><h2 className="text-2xl font-black">Funding and benefits</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{scholarship.benefits.map((item) => <div key={item} className="flex gap-3 rounded-xl bg-teal-50 p-4"><CheckCircle2 className="shrink-0 text-teal-700" size={20} /><span className="font-semibold">{item}</span></div>)}</div></section>
        <section><h2 className="text-2xl font-black">Eligibility indicators</h2><div className="mt-5 grid gap-3">{scholarship.eligibility.map((item) => <div key={item} className="flex gap-3 rounded-xl border bg-white p-4"><ShieldAlert className="shrink-0 text-amber-600" size={20} /><span className="text-slate-700">{item}</span></div>)}</div></section>
        <section><h2 className="text-2xl font-black">Required documents</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{scholarship.requiredDocuments.map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border bg-white p-4"><FileText className="text-teal-600" size={20} /><span className="font-semibold">{item}</span></div>)}</div></section>
        <section><h2 className="text-2xl font-black">Accuracy reviews</h2>{user ? <form onSubmit={(event) => { event.preventDefault(); review.mutate(scholarship._id); }} className="mt-5 grid gap-3 rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-center gap-3"><label className="text-sm font-black">Rating</label><select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="h-10 rounded-xl border border-slate-300 bg-white px-3">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></div><textarea required minLength={10} maxLength={1200} value={comment} onChange={(event) => setComment(event.target.value)} rows={3} className="rounded-xl border border-slate-300 px-4 py-3" placeholder="Comment on listing accuracy and usefulness" /><button disabled={review.isPending} className="w-fit rounded-xl bg-slate-950 px-5 py-2.5 font-black text-white">{review.isPending ? "Submitting…" : "Submit review"}</button><p className="text-xs text-slate-500">Reviews are moderated before publication.</p></form> : <Link href={`/login?next=/scholarships/${slug}`} className="mt-5 inline-flex font-bold text-teal-700">Sign in to review this listing</Link>}{reviews.length ? <div className="mt-5 grid gap-4">{reviews.map((review) => <article key={review._id} className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><p className="font-black">{review.userId.name}</p><span className="flex items-center gap-1 text-sm font-bold"><Star size={15} className="text-amber-500" />{review.rating}/5</span></div><p className="mt-3 leading-7 text-slate-600">{review.comment}</p></article>)}</div> : <p className="mt-4 rounded-2xl border border-dashed bg-white p-6 text-slate-600">No approved accuracy reviews yet. Reviews are moderated before publication.</p>}</section>
      </div><aside><div className="sticky top-24 rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Application safety check</h2><ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-600"><li>Confirm the current cycle.</li><li>Check country-specific nomination rules.</li><li>Verify the deadline time zone.</li><li>Apply only through an official portal.</li><li>Never trust a guaranteed-selection claim.</li></ul><Link href={user ? "/documents" : "/register"} className="mt-6 block rounded-xl bg-teal-600 px-4 py-3 text-center font-black text-white">Analyze my documents</Link></div></aside></div>
      {related.length > 0 && <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h2 className="text-3xl font-black">Related opportunities</h2><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">{related.map((item) => <ScholarshipCard key={item._id} scholarship={item} />)}</div></section>}
    </div>
  );
}
