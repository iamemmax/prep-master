"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  BookOpen,
  Layers,
  HelpCircle,
  Users,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/authentication";

const NAV = [
  { label: "Overview",      href: "/admin",            icon: LayoutDashboard, exact: true  },
  { label: "Categories",    href: "/admin/categories", icon: FolderTree,      exact: false },
  { label: "Subcategories", href: "/admin/exams",      icon: BookOpen,        exact: false },
  { label: "Subjects",      href: "/admin/subjects",   icon: Layers,          exact: false },
  { label: "Questions",     href: "/admin/questions",  icon: HelpCircle,      exact: false },
  { label: "Users",         href: "/admin/users",      icon: Users,           exact: false },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { authDispatch, authState: { user } } = useAuth();
  const [open, setOpen] = useState(false);
  // Auth state hydrates from localStorage on the client only; defer rendering
  // the user block until after mount to avoid an SSR/CSR text mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" });
    router.replace("/signin");
  };

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-inter">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-[#F7C948] text-white grid place-items-center text-sm font-bold">P</span>
          <span className="text-sm font-bold">PrepMaster Admin</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } md:block fixed md:sticky top-0 md:top-0 inset-x-0 md:inset-auto z-30 md:h-dvh md:w-64 shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900`}
        >
          <div className="hidden md:flex items-center gap-2 px-5 h-16 border-b border-slate-200 dark:border-zinc-800">
            <span className="w-9 h-9 rounded-lg bg-[#F7C948] text-white grid place-items-center text-base font-bold">P</span>
            <div>
              <p className="text-sm font-bold leading-tight">PrepMaster</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">Admin</p>
            </div>
          </div>

          <nav className="p-3 space-y-0.5">
            {NAV.map(({ label, href, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-[#F7C948]/15 text-[#894B00] font-semibold"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="md:absolute md:bottom-0 inset-x-0 p-3 border-t border-slate-200 dark:border-zinc-800">
            <div className="px-3 py-2" suppressHydrationWarning>
              <p className="text-xs font-semibold truncate">
                {mounted ? `${user?.user?.first_name ?? "Admin"} ${user?.user?.last_name ?? ""}` : "Admin"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                {mounted ? (user?.user?.email ?? "") : ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
