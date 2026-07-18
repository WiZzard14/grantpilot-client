"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    accepted: false
  });
  const [loading, setLoading] = useState(false);

  const field = (key: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (form.name.trim().length < 2) return toast.error("Name must contain at least 2 characters");
    if (form.password.length < 6) return toast.error("Password must contain at least 6 characters");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    if (!form.accepted) return toast.error("Accept the privacy terms to continue");

    setLoading(true);
    try {
      const response = await apiFetch<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        })
      });

      setUser(response.data);
      toast.success("Account created successfully");
      router.replace("/profile");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div>
        <p className="font-bold uppercase tracking-widest text-teal-700">Start with evidence</p>
        <h1 className="mt-3 text-5xl font-black leading-tight">Build a reusable scholarship profile.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Your profile becomes context for matching, filtering, document comparisons, and future refinements.
        </p>
      </div>

      <div className="rounded-[2rem] border bg-white p-6 shadow-xl sm:p-9">
        <h2 className="text-3xl font-black">Create account</h2>

        <form onSubmit={submit} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Full name
            <input
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={form.name}
              onChange={(event) => field("name", event.target.value)}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => field("email", event.target.value)}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Password
            <input
              type="password"
              required
              minLength={6}
              maxLength={72}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => field("password", event.target.value)}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
            <span className="font-normal text-slate-500">Use at least 6 characters.</span>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Confirm password
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => field("confirm", event.target.value)}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
          </label>

          <label className="flex gap-3 text-sm leading-6 text-slate-600">
            <input
              type="checkbox"
              checked={form.accepted}
              onChange={(event) => field("accepted", event.target.checked)}
            />
            <span>
              I agree to the{" "}
              <Link href="/privacy" className="font-bold text-teal-700">
                privacy policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-bold text-teal-700">
                terms
              </Link>
              .
            </span>
          </label>

          <button
            disabled={loading}
            className="h-12 rounded-xl bg-slate-950 font-black text-white disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleSignIn />

        <p className="mt-7 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-teal-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
