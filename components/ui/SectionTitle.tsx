export function SectionTitle({ eyebrow, title, description, center = false }: { eyebrow?: string; title: string; description?: string; center?: boolean }) {
  return <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>{eyebrow && <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>}<h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>{description && <p className="mt-4 leading-7 text-slate-600">{description}</p>}</div>;
}
