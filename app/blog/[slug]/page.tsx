"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Blog } from "@/types";
import { formatDate } from "@/lib/format";
import { PageLoader } from "@/components/ui/PageLoader";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const query = useQuery({ queryKey: ["blog", slug], queryFn: () => apiFetch<Blog>(`/content/blogs/${slug}`).then((res) => res.data) });
  if (query.isLoading) return <PageLoader label="Opening article" />;
  if (!query.data) return null;
  const blog = query.data;
  return <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><Link href="/blog" className="font-bold text-teal-700">← All guides</Link><p className="mt-10 text-sm font-bold uppercase tracking-wider text-teal-700">{formatDate(blog.publishedAt)} · {blog.author}</p><h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{blog.title}</h1><p className="mt-6 text-xl leading-8 text-slate-600">{blog.excerpt}</p><img src={blog.image} alt="" className="mt-10 h-80 w-full rounded-[2rem] object-cover" /><div className="mt-10 whitespace-pre-line text-lg leading-9 text-slate-700">{blog.body}</div><div className="mt-12 rounded-2xl bg-slate-950 p-7 text-white"><h2 className="text-xl font-black">Apply the guide in your workspace</h2><p className="mt-2 text-slate-300">Build your profile, save sourced opportunities, and analyze application documents.</p><Link href="/register" className="mt-5 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-black text-slate-950">Create account</Link></div></article>;
}
