"use client";

import { signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/api";
import {
  getFirebaseAuth,
  getGoogleProvider,
  isFirebaseConfigured,
  waitForFirebasePersistence
} from "@/lib/firebase";
import type { User } from "@/types";
import { useAuth } from "./AuthProvider";

export function GoogleSignIn() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();

    if (!auth || !provider) {
      toast.error("Firebase Authentication is not configured in the client environment");
      return;
    }

    setLoading(true);
    try {
      await waitForFirebasePersistence();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);

      const response = await apiFetch<User>("/auth/firebase", {
        method: "POST",
        body: JSON.stringify({ idToken })
      });

      setUser(response.data);
      toast.success("Signed in with Google");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      // Do not leave a Firebase-only browser session when server verification fails.
      await signOut(auth).catch(() => undefined);

      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-blocked") {
        toast.error("Your browser blocked the Firebase popup. Allow popups for localhost:3000.");
      } else if (firebaseError.code === "auth/popup-closed-by-user") {
        toast.error("The Google sign-in window was closed");
      } else if (firebaseError.code === "auth/unauthorized-domain") {
        toast.error("Add localhost in Firebase Authentication → Settings → Authorized domains");
      } else if (firebaseError.code === "auth/operation-not-allowed") {
        toast.error("Enable Google in Firebase Authentication → Sign-in method");
      } else {
        toast.error(firebaseError.message || "Firebase Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-800">
        Add the Firebase web configuration to grantpilot-client/.env.local to enable Google login.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 font-black text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        aria-hidden="true"
        className="grid size-6 place-items-center rounded-full bg-white text-base font-black text-blue-600"
      >
        G
      </span>
      {loading ? "Opening Firebase…" : "Continue with Google"}
    </button>
  );
}
