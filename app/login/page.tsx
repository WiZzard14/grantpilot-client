"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { useAuth } from "@/components/auth/AuthProvider";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await apiFetch<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      setUser(response.data);
      toast.success("Welcome back");
      router.replace(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="hidden rounded-[2rem] bg-slate-950 p-12 text-white lg:block">
        <p className="font-bold text-teal-300">Continue your application plan</p>
        <h1 className="mt-4 text-5xl font-black leading-tight">
          Your matches, documents, and deadlines in one workspace.
        </h1>
        <p className="mt-6 leading-8 text-slate-300">
          Use the demo login to review all protected flows without creating personal data.
        </p>
      </div>

      <div className="rounded-[2rem] border bg-white p-6 shadow-xl sm:p-9">
        <h1 className="text-3xl font-black">Sign in</h1>
        <p className="mt-2 text-slate-600">Access your GrantPilot workspace.</p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 rounded-xl border border-slate-300 px-4 font-normal"
            />
          </label>

          <button
            disabled={loading}
            className="h-12 rounded-xl bg-slate-950 font-black text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail("student@grantpilot.demo");
              setPassword("DemoStudent123!");
            }}
            className="h-12 rounded-xl border border-teal-600 font-black text-teal-700"
          >
            Auto-fill demo login
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleSignIn />

        <p className="mt-7 text-center text-sm text-slate-600">
          New to GrantPilot?{" "}
          <Link href="/register" className="font-bold text-teal-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[75vh] place-items-center">Loading sign in…</div>}>
      <LoginContent />
    </Suspense>
  );
}
