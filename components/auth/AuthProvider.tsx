"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { createContext, useContext, type ReactNode } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { getFirebaseAuth } from "@/lib/firebase";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadCurrentUser(): Promise<User | null> {
  try {
    const response = await apiFetch<User>("/auth/me");
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: loadCurrentUser,
    retry: false
  });

  const setUser = (user: User | null) => {
    queryClient.setQueryData(["me"], user);
  };

  const refreshUser = async () => {
    const user = await queryClient.fetchQuery({
      queryKey: ["me"],
      queryFn: loadCurrentUser,
      staleTime: 0
    });
    return user;
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) throw error;
    }

    const auth = getFirebaseAuth();
    if (auth) await signOut(auth).catch(() => undefined);

    setUser(null);
    queryClient.removeQueries({ predicate: (item) => item.queryKey[0] !== "me" });
  };

  return (
    <AuthContext.Provider
      value={{ user: query.data ?? null, isLoading: query.isPending, setUser, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
