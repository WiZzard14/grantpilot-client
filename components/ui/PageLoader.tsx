export function PageLoader({ label = "Loading" }: { label?: string }) {
  return <div className="grid min-h-[55vh] place-items-center"><div className="text-center"><div className="mx-auto size-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" /><p className="mt-4 text-sm font-medium text-slate-600">{label}</p></div></div>;
}
