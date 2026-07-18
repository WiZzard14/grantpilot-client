import Link from "next/link";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <h2 className="text-xl font-black text-white">GrantPilot AI</h2>
          <p className="mt-4 text-sm leading-6">A scholarship discovery and application copilot built around verified sources, transparent matching, and responsible AI assistance.</p>
        </div>
        <div><h3 className="font-bold text-white">Platform</h3><div className="mt-4 grid gap-3 text-sm"><Link href="/scholarships">Explore scholarships</Link><Link href="/about">About</Link><Link href="/blog">Guides</Link><Link href="/help">Help centre</Link></div></div>
        <div><h3 className="font-bold text-white">Legal</h3><div className="mt-4 grid gap-3 text-sm"><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms of use</Link><Link href="/contact">Contact</Link></div></div>
        <div>
          <h3 className="font-bold text-white">Contact</h3>
          <div className="mt-4 grid gap-3 text-sm"><Link href="/contact" className="flex items-center gap-2"><Mail size={16} />mdridoy144169@gmail.com</Link><span className="flex items-center gap-2"><MapPin size={16} />Remote-first platform</span></div>
          <div className="mt-5 flex gap-3"><a href="https://github.com/WiZzard14" target="_blank" rel="noreferrer" aria-label="GitHub"><Github /></a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a></div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} GrantPilot AI. Scholarship providers and official portals remain the final authority.</div>
    </footer>
  );
}
