"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, Cpu, Sparkles, WandSparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface AIStatus {
  configured: boolean;
  provider: "gemini" | "openai" | "local-fallback";
  model: string;
  features: string[];
}

export function AIProviderBadge() {
  const query = useQuery({
    queryKey: ["ai-status"],
    queryFn: () => apiFetch<AIStatus>("/ai/status").then((response) => response.data)
  });

  const status = query.data;
  const isGemini = status?.provider === "gemini";
  const isOpenAI = status?.provider === "openai";
  const isLLM = isGemini || isOpenAI;

  const label = query.isPending
    ? "Checking AI provider…"
    : isGemini
      ? `Google Gemini · ${status?.model}`
      : isOpenAI
        ? `OpenAI · ${status?.model}`
        : "Local deterministic AI fallback";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span
        className={`grid size-10 place-items-center rounded-xl ${
          isGemini
            ? "bg-blue-100 text-blue-700"
            : isOpenAI
              ? "bg-teal-100 text-teal-700"
              : "bg-amber-100 text-amber-700"
        }`}
      >
        {isGemini ? <WandSparkles size={20} /> : isOpenAI ? <Sparkles size={20} /> : <Cpu size={20} />}
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Active AI engine</p>
        <p className="font-black text-slate-900">{label}</p>
        {!query.isPending && !isLLM && (
          <p className="mt-0.5 text-xs text-slate-500">
            Add GEMINI_API_KEY in grantpilot-server/.env to activate the free-tier LLM.
          </p>
        )}
      </div>
      <Bot className="ml-auto hidden text-slate-300 sm:block" size={24} />
    </div>
  );
}
