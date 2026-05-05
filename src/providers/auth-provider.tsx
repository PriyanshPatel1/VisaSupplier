"use client";

import React, { createContext, useContext, useCallback, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { csrfHeaders } from "@/lib/csrf";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "SUPPLIER" | "ADMIN";
  createdAt?: string;
  avatar?: string;
  phone?: string;
  country?: string;
  nationality?: string;
  dob?: string;
  gender?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionError: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setLoading] = useState(initialUser === undefined);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    // If server already provided the user, skip the client fetch
    if (initialUser !== undefined) return;

    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (!r.ok) {
          if (r.status !== 401) {
            // 401 = not logged in (expected); anything else = network/server problem
            console.warn("[AuthProvider] /api/auth/me returned", r.status);
            setSessionError(true);
          }
          return null;
        }
        return r.json();
      })
      .then((json) => {
        if (json?.data) setUser(json.data);
      })
      .catch((e) => {
        console.error("[AuthProvider] Failed to fetch session:", e);
        setSessionError(true);
      })
      .finally(() => setLoading(false));
  }, [initialUser]);

  const refreshSession = useCallback(() => {
    setSessionError(false);
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Login failed");
    setUser(json.data);
    setSessionError(false);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const updateUser = useCallback(async (patch: Partial<User>) => {
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      credentials: "include",
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed to update profile");
    setUser((prev) => (prev ? { ...prev, ...json.data } : json.data));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, sessionError, login, logout, updateUser }}>
      {sessionError && (
        <div className="fixed top-0 inset-x-0 z-50 bg-yellow-500 text-black text-sm text-center py-2 px-4">
          Session could not be verified. Please{" "}
          <button onClick={refreshSession} className="underline font-semibold">
            refresh the page
          </button>{" "}
          or{" "}
          <a href="/login" className="underline font-semibold">
            sign in again
          </a>
          .
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
