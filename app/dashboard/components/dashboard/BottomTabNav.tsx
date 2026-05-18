"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, BarChart3, User } from "lucide-react";

const IS_PROD = process.env.NODE_ENV === "production";

const TABS = [
  { label: "Home",     href: "/dashboard",          icon: LayoutDashboard, exact: true,  disabled: false   },
  { label: "Practice", href: "/dashboard/practice", icon: GraduationCap,   exact: false, disabled: false   },
  { label: "Progress", href: "/dashboard/progress", icon: BarChart3,       exact: false, disabled: IS_PROD },
  { label: "Profile",  href: "/dashboard/profile",  icon: User,            exact: false, disabled: false   },
] as const;

// Routes where the bottom bar should NOT appear (full-screen surfaces).
const HIDDEN_PREFIXES = [
  "/dashboard/practice/start-practice/",
  "/dashboard/practice/review/",
];

export default function BottomTabNav() {
  const pathname = usePathname() ?? "";
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:supports-backdrop-filter:bg-zinc-950/80 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ label, href, icon: Icon, exact, disabled }) => {
          const isActive = !disabled && (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));
          if (disabled) {
            return (
              <li key={href}>
                <span
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#94A3B8] dark:text-zinc-600 opacity-60 cursor-not-allowed select-none"
                >
                  <Icon size={20} strokeWidth={2} />
                  <span className="text-[10px] font-inter font-medium">{label}</span>
                </span>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                  isActive
                    ? "text-[#F7C948]"
                    : "text-[#64748B] dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-inter ${isActive ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
