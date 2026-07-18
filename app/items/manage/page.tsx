"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import type { Scholarship } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";

function ManageContent() {
  const [viewing, setViewing] = useState<Scholarship | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["manage-scholarships"], queryFn: () => apiFetch<Scholarship[]>("/scholarships/manage").then((res) => res.data) });
  const remove = useMutation({ mutationFn: (id: string) => apiFetch(`/scholarships/${id}`, { method: "DELETE" }), onSuccess: () => { toast.success("Scholarship deleted"); queryClient.invalidateQueries({ queryKey: ["manage-scholarships"] }); }, onError: (error) => toast.error(error.message) });
  const items = query.data ?? [];
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-bold uppercase tracking-widest text-teal-700">Protected management</p><h1 className="mt-2 text-4xl font-black">Manage items</h1><p className="mt-4 text-slate-600">View and delete your submissions. Pending records are not publicly visible.</p></div><Link href="/items/add" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-black text-white"><Plus size={18} />Add item</Link></div>{!query.isLoading && !items.length ? <div className="mt-10"><EmptyState title="No submitted items" description="Add a sourced scholarship listing to begin the moderation workflow." action="Add scholarship" href="/items/add" /></div> : <div className="mt-10 overflow-hidden rounded-2xl border bg-white"><div className="hidden grid-cols-[1fr_140px_140px_130px] gap-4 border-b bg-slate-50 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-500 md:grid"><span>Item</span><span>Deadline</span><span>Status</span><span>Actions</span></div><div className="divide-y">{items.map((item) => <div key={item._id} className="grid gap-4 p-5 md:grid-cols-[1fr_140px_140px_130px] md:items-center"><div className="flex min-w-0 items-center gap-4"><img src={item.providerImage} alt="" className="size-16 rounded-xl object-cover" /><div className="min-w-0"><p className="font-black">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.providerName} · {item.country}</p></div></div><p className="text-sm font-semibold">{formatDate(item.deadline)}</p><StatusBadge value={item.status} /><div className="flex gap-2"><button onClick={() => setViewing(item)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold"><Eye size={16} />View</button><button onClick={() => { if (confirm("Delete this item permanently?")) remove.mutate(item._id); }} className="rounded-lg border border-rose-200 p-2 text-rose-700"><Trash2 size={17} /></button></div></div>)}</div></div>}{viewing && <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><div><StatusBadge value={viewing.status} /><h2 className="mt-3 text-2xl font-black">{viewing.title}</h2><p className="mt-2 text-slate-500">{viewing.providerName} · {viewing.country}</p></div><button onClick={() => setViewing(null)} className="rounded-lg bg-slate-100 p-2"><X /></button></div><img src={viewing.providerImage} alt="" className="mt-6 h-56 w-full rounded-2xl object-cover" /><p className="mt-6 leading-7 text-slate-700">{viewing.fullDescription}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Funding</p><p className="mt-1 font-black">{viewing.fundingType}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Deadline</p><p className="mt-1 font-black">{formatDate(viewing.deadline)}</p></div></div>{viewing.status === "published" && <Link href={`/scholarships/${viewing.slug}`} className="mt-6 block rounded-xl bg-slate-950 px-5 py-3 text-center font-black text-white">Open public page</Link>}</div></div>}</div>;
}

export default function ManageItemsPage() { return <ProtectedRoute><ManageContent /></ProtectedRoute>; }
