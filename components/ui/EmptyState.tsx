import Link from "next/link";
import { Inbox } from "lucide-react";

export function EmptyState({ title, description, action, href }: { title: string; description: string; action?: string; href?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Inbox className="mx-auto text-slate-400" size={38} /><h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{description}</p>{action && href && <Link href={href} className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">{action}</Link>}</div>;
}
