"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ExternalLink, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import type { Scholarship } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";

interface SavedItem { _id: string; status: "saved" | "preparing" | "applied" | "accepted" | "rejected"; notes?: string; scholarshipId: Scholarship; }

function SavedContent() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["saved"], queryFn: () => apiFetch<SavedItem[]>("/saved").then((res) => res.data) });
  const update = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => apiFetch(`/saved/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved"] }), onError: (error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: (id: string) => apiFetch(`/saved/${id}`, { method: "DELETE" }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved"] }) });
  const items = query.data ?? [];
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div><p className="font-bold uppercase tracking-widest text-teal-700">Application tracker</p><h1 className="mt-2 text-4xl font-black">Saved scholarships</h1><p className="mt-4 text-slate-600">Move each opportunity through a real application state and monitor its stored deadline.</p></div>{!query.isLoading && items.length === 0 ? <div className="mt-10"><EmptyState title="Nothing saved yet" description="Explore sourced programmes and save the opportunities that match your goals." action="Explore scholarships" href="/scholarships" /></div> : <div className="mt-10 overflow-hidden rounded-2xl border bg-white"><div className="hidden grid-cols-[1fr_170px_170px_120px] gap-4 border-b bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500 md:grid"><span>Scholarship</span><span>Deadline</span><span>Status</span><span>Actions</span></div><div className="divide-y">{items.map((item) => <div key={item._id} className="grid gap-4 p-5 md:grid-cols-[1fr_170px_170px_120px] md:items-center"><div className="flex min-w-0 items-center gap-4"><img src={item.scholarshipId.providerImage} alt="" className="size-16 rounded-xl object-cover" /><div className="min-w-0"><Link href={`/scholarships/${item.scholarshipId.slug}`} className="font-black hover:text-teal-700">{item.scholarshipId.title}</Link><p className="mt-1 text-sm text-slate-500">{item.scholarshipId.country} · {item.scholarshipId.fundingType}</p></div></div><span className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} className="text-amber-600" />{formatDate(item.scholarshipId.deadline)}</span><select value={item.status} onChange={(e) => update.mutate({ id: item.scholarshipId._id, status: e.target.value })} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold"><option value="saved">Saved</option><option value="preparing">Preparing</option><option value="applied">Applied</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select><div className="flex gap-2"><a href={item.scholarshipId.officialUrl} target="_blank" rel="noreferrer" className="rounded-lg border p-2" aria-label="Official source"><ExternalLink size={17} /></a><button onClick={() => { if (confirm("Remove this saved scholarship?")) remove.mutate(item.scholarshipId._id); }} className="rounded-lg border border-rose-200 p-2 text-rose-700" aria-label="Remove"><Trash2 size={17} /></button></div></div>)}</div></div>}</div>;
}

export default function SavedPage() { return <ProtectedRoute><SavedContent /></ProtectedRoute>; }
