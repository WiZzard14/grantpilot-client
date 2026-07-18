"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarClock, FileWarning, Heart, UserRoundCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import { PageLoader } from "@/components/ui/PageLoader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/format";

interface DashboardData {
  summary: { profileCompletion: number; savedCount: number; upcomingDeadlineCount: number; documentsNeedingAttention: number; totalPublished: number };
  statusCounts: Array<{ status: string; count: number }>;
  countryData: Array<{ country: string; count: number }>;
  upcoming: Array<{ _id: string; status: string; scholarshipId: { title: string; slug: string; deadline: string; country: string } }>;
  recentDocuments: Array<{ _id: string; originalName: string; processingStatus: string; createdAt: string }>;
}

function DashboardContent() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: () => apiFetch<DashboardData>("/dashboard/summary").then((res) => res.data) });
  if (query.isLoading) return <PageLoader label="Preparing your dashboard" />;
  const data = query.data;
  if (!data) return null;
  const cards = [
    [UserRoundCheck, `${data.summary.profileCompletion}%`, "Profile completion", "/profile"],
    [Heart, data.summary.savedCount, "Saved scholarships", "/saved"],
    [CalendarClock, data.summary.upcomingDeadlineCount, "Deadlines within 30 days", "/saved"],
    [FileWarning, data.summary.documentsNeedingAttention, "Documents needing attention", "/documents"]
  ] as const;
  const chartColors = ["#0f766e", "#f59e0b", "#0f172a", "#14b8a6", "#64748b"];
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-bold uppercase tracking-widest text-teal-700">Workspace</p><h1 className="mt-2 text-4xl font-black">Application dashboard</h1><p className="mt-3 text-slate-600">Live metrics calculated from your profile, saved opportunities, documents, and AI activity.</p></div><Link href="/recommendations" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Run match agent</Link></div><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([Icon, value, label, href]) => <Link href={href} key={label} className="rounded-2xl border bg-white p-6 shadow-sm"><Icon className="text-teal-600" /><p className="mt-6 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-semibold text-slate-600">{label}</p></Link>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-black"><BarChart3 className="text-teal-600" />Application pipeline</h2><div className="mt-6 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.statusCounts}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#0f766e" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div></section><section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Saved opportunities by country</h2><div className="mt-6 h-72">{data.countryData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.countryData} dataKey="count" nameKey="country" innerRadius={55} outerRadius={95} paddingAngle={3}>{data.countryData.map((entry, index) => <Cell key={entry.country} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-center text-sm text-slate-500">Save scholarships to populate this chart.</div>}</div></section></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Upcoming deadlines</h2><Link href="/saved" className="text-sm font-bold text-teal-700">View tracker</Link></div><div className="mt-5 grid gap-3">{data.upcoming.length ? data.upcoming.map((item) => <Link key={item._id} href={`/scholarships/${item.scholarshipId.slug}`} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div><p className="font-bold">{item.scholarshipId.title}</p><p className="mt-1 text-sm text-slate-500">{item.scholarshipId.country} · {formatDate(item.scholarshipId.deadline)}</p></div><StatusBadge value={item.status} /></Link>) : <p className="rounded-xl border border-dashed p-6 text-sm text-slate-500">No saved deadline is due within the next 30 days.</p>}</div></section><section className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Recent documents</h2><Link href="/documents" className="text-sm font-bold text-teal-700">Open intelligence</Link></div><div className="mt-5 grid gap-3">{data.recentDocuments.length ? data.recentDocuments.map((document) => <div key={document._id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"><div className="min-w-0"><p className="truncate font-bold">{document.originalName}</p><p className="mt-1 text-xs text-slate-500">Uploaded {formatDate(document.createdAt)}</p></div><StatusBadge value={document.processingStatus} /></div>) : <p className="rounded-xl border border-dashed p-6 text-sm text-slate-500">No documents uploaded yet.</p>}</div></section></div></div>;
}

export default function DashboardPage() { return <ProtectedRoute><DashboardContent /></ProtectedRoute>; }
