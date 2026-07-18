"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false
          },
          mutations: { retry: 0 }
        }
      })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50" aria-live="polite">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
          <span className="text-sm font-bold text-slate-700">Loading GrantPilot AI…</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
