"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Blog } from "@/types";
import { formatDate } from "@/lib/format";
import { PageLoader } from "@/components/ui/PageLoader";

export default function BlogPage() {
  const query = useQuery({ queryKey: ["blogs"], queryFn: () => apiFetch<Blog[]>("/content/blogs").then((res) => res.data) });
  if (query.isLoading) return <PageLoader label="Loading application guides" />;
  return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="font-bold uppercase tracking-widest text-teal-700">Guides</p><h1 className="mt-3 text-5xl font-black">Scholarship application resources</h1><p className="mt-5 text-lg leading-8 text-slate-600">Original, practical guidance for evidence gathering, document review, and source verification.</p></div><div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">{query.data?.map((blog) => <article key={blog._id} className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white"><img src={blog.image} alt="" className="h-52 w-full object-cover" /><div className="flex flex-1 flex-col p-6"><p className="text-xs font-bold uppercase tracking-wider text-teal-700">{formatDate(blog.publishedAt)} · {blog.author}</p><h2 className="mt-4 text-2xl font-black">{blog.title}</h2><p className="mt-3 leading-7 text-slate-600">{blog.excerpt}</p><Link href={`/blog/${blog.slug}`} className="mt-auto pt-7 font-black text-teal-700">Read article →</Link></div></article>)}</div></div>;
}
