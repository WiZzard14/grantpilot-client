"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, MessageSquarePlus, Send, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiFetch } from "@/lib/api";
import { PageLoader } from "@/components/ui/PageLoader";
import { AIProviderBadge } from "@/components/ai/AIProviderBadge";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
}

interface SendMessageResult {
  answer: string;
  conversation: Conversation;
  provider: "gemini" | "openai" | "local-fallback";
}

const suggestions = [
  "Which saved scholarship has the nearest deadline?",
  "Compare my saved opportunities by funding and country.",
  "What should I prepare before analyzing my SOP?",
  "How can I improve my scholarship profile?"
];

function AssistantContent() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const lastSubmissionRef = useRef({ content: "", at: 0 });

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiFetch<Conversation[]>("/chat/conversations").then((response) => response.data)
  });

  useEffect(() => {
    if (!activeId && conversations.data?.[0]) setActiveId(conversations.data[0]._id);
  }, [activeId, conversations.data]);

  const active = useQuery({
    queryKey: ["conversation", activeId],
    enabled: Boolean(activeId),
    queryFn: () => apiFetch<Conversation>(`/chat/conversations/${activeId}`).then((response) => response.data)
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active.data?.messages.length]);

  const create = useMutation({
    mutationFn: () =>
      apiFetch<Conversation>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ title: "Scholarship planning conversation" })
      }).then((response) => response.data),
    onSuccess: async (data) => {
      setActiveId(data._id);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => toast.error(error.message)
  });

  const send = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      apiFetch<SendMessageResult>(`/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: content })
      }).then((response) => response.data),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
      ]);
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => {
      submittingRef.current = false;
    }
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/chat/conversations/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      setActiveId(null);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => toast.error(error.message)
  });

  if (conversations.isLoading) return <PageLoader label="Loading assistant memory" />;

  const submit = async (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || submittingRef.current || send.isPending || create.isPending) return;

    const now = Date.now();
    if (
      lastSubmissionRef.current.content.toLowerCase() === content.toLowerCase() &&
      now - lastSubmissionRef.current.at < 1500
    ) {
      return;
    }

    submittingRef.current = true;
    lastSubmissionRef.current = { content, at: now };

    try {
      let conversationId = activeId;
      if (!conversationId) {
        const created = await create.mutateAsync();
        conversationId = created._id;
      }

      setMessage("");
      send.mutate({ conversationId, content });
    } catch {
      submittingRef.current = false;
    }
  };

  const busy = send.isPending || create.isPending;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="font-bold uppercase tracking-widest text-teal-700">Contextual assistant</p>
        <h1 className="mt-2 text-4xl font-black">Ask about your scholarship workspace</h1>
        <p className="mt-3 text-slate-600">
          Conversation history is saved and the assistant can use your profile, saved items, and sourced scholarship records.
        </p>
      </div>

      <div className="mb-6">
        <AIProviderBadge />
      </div>

      <div className="grid min-h-[650px] overflow-hidden rounded-[2rem] border bg-white shadow-sm lg:grid-cols-[300px_1fr]">
        <aside className="border-b bg-slate-950 p-4 text-white lg:border-b-0 lg:border-r">
          <button
            onClick={() => create.mutate()}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageSquarePlus size={18} />
            New conversation
          </button>

          <div className="mt-4 grid gap-2">
            {conversations.data?.map((conversation) => (
              <div
                key={conversation._id}
                className={`flex items-center gap-2 rounded-xl ${
                  activeId === conversation._id ? "bg-white/15" : "hover:bg-white/10"
                }`}
              >
                <button
                  onClick={() => setActiveId(conversation._id)}
                  className="min-w-0 flex-1 p-3 text-left"
                >
                  <p className="truncate text-sm font-bold">{conversation.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{conversation.messages.length} messages</p>
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this conversation?")) remove.mutate(conversation._id);
                  }}
                  className="p-3 text-slate-400 hover:text-rose-300"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[650px] flex-col">
          <div className="flex-1 overflow-y-auto p-5 sm:p-7">
            {!activeId ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <Bot className="mx-auto text-teal-600" size={48} />
                  <h2 className="mt-4 text-2xl font-black">Start a conversation</h2>
                  <p className="mt-2 text-slate-500">Type a message and a conversation will be created automatically.</p>
                </div>
              </div>
            ) : active.isLoading ? (
              <PageLoader label="Reading conversation" />
            ) : (
              <div className="grid gap-5">
                {active.data?.messages.length === 0 && (
                  <div className="rounded-2xl bg-teal-50 p-6">
                    <Sparkles className="text-teal-700" />
                    <h2 className="mt-4 text-xl font-black">Suggested questions</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestions.map((item) => (
                        <button
                          key={item}
                          onClick={() => void submit(item)}
                          disabled={busy}
                          className="rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-800 disabled:opacity-60"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {active.data?.messages.map((item, index) => (
                  <div
                    key={item._id ?? index}
                    className={`flex gap-3 ${item.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {item.role === "assistant" && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700">
                        <Bot size={18} />
                      </span>
                    )}
                    <div
                      className={`max-w-2xl whitespace-pre-line rounded-2xl px-5 py-4 text-sm leading-7 ${
                        item.role === "user" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.content}
                    </div>
                    {item.role === "user" && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-200">
                        <User size={18} />
                      </span>
                    )}
                  </div>
                ))}

                {busy && (
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-teal-100">
                      <Bot size={18} />
                    </span>
                    <div className="rounded-2xl bg-slate-100 px-5 py-4 text-sm text-slate-500">
                      GrantPilot is reasoning<span className="animate-pulse">…</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit(message);
            }}
            className="border-t p-4 sm:p-5"
          >
            <div className="flex gap-3">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit(message);
                  }
                }}
                rows={2}
                maxLength={4000}
                placeholder="Ask about saved scholarships, deadlines, documents, or navigation"
                className="min-h-12 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3"
              />
              <button
                disabled={busy || !message.trim()}
                className="grid w-14 place-items-center rounded-xl bg-slate-950 text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <ProtectedRoute>
      <AssistantContent />
    </ProtectedRoute>
  );
}
