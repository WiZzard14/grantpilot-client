import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "GrantPilot AI", template: "%s | GrantPilot AI" },
  description: "Agentic scholarship discovery, document intelligence, and application planning.",
  metadataBase: new URL("http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><Providers><Header /><main className="min-h-[70vh]">{children}</main><Footer /></Providers></body></html>;
}
