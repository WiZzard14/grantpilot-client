"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { UserAvatar } from "../ui/UserAvatar";

const publicLinks = [
  ["Scholarships", "/scholarships"],
  ["About", "/about"],
  ["Blog", "/blog"],
  ["Contact", "/contact"]
] as const;

const privateLinks = [
  ["Dashboard", "/dashboard"],
  ["Scholarships", "/scholarships"],
  ["Recommendations", "/recommendations"],
  ["Documents", "/documents"],
  ["Assistant", "/assistant"],
  ["Saved", "/saved"],
  ["Manage", "/items/manage"]
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const links = user ? privateLinks : publicLinks;
  const active = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-950">
          <Image
            src="/grantpilot-logo.png"
            alt="GrantPilot AI logo"
            width={42}
            height={42}
            priority
            className="size-10 object-contain"
          />
          <span>
            GrantPilot <span className="text-teal-600">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                active(href)
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                href="/profile"
                className="rounded-full transition hover:ring-2 hover:ring-teal-500 hover:ring-offset-2"
                title={`${user.name} — open profile`}
                aria-label="Open profile"
              >
                <UserAvatar name={user.name} image={user.image} />
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-4 lg:hidden">
          <nav className="grid gap-1">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 font-semibold ${
                  active(href) ? "bg-teal-50 text-teal-700" : "text-slate-700"
                }`}
              >
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 font-semibold"
                >
                  <UserAvatar name={user.name} image={user.image} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs font-normal text-slate-500">{user.email}</span>
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-lg bg-slate-950 px-3 py-3 text-left font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" className="rounded-lg border px-3 py-3 text-center font-semibold">
                  Login
                </Link>
                <Link href="/register" className="rounded-lg bg-slate-950 px-3 py-3 text-center font-semibold text-white">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
