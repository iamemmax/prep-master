"use client";

import { useState } from "react";
import Link from "next/link";
import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/authentication";
import { useTheme } from "@/context/theme";
import { useRouter, usePathname } from "next/navigation";
import { Crown, Menu, X, Sun, Moon, Settings } from "lucide-react";
import PrepLogo from "@/utils/icons/logos/PrepLogo";
import UpgradeModal from "../upgrade/UpgradeModal";

const NAV_LINKS = [
  { label: "Dashboard", disable: false, href: "/dashboard"          },
  { label: "Practice",  disable: false, href: "/dashboard/practice" },
  { label: "Progress",  disable: false, href: "/dashboard/progress" },
];

const DashboardHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { authDispatch, authState: { user } } = useAuth();
  const { resolved, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleLogout = () => {
    authDispatch({ type: "LOGOUT" });
    router.replace("/signin");
  };

const initials = `${user?.user?.first_name?.charAt(0) ?? ""}${user?.user?.last_name?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800">

      {/* Main bar */}
      <div className="px-6 py-3">
        <div className="max-w-400 mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[.625rem] bg-linear-to-tr from-[#F7C948] to-[#F7C948] flex items-center justify-center">
              <PrepLogo />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0F172B] dark:text-zinc-100 text-xl font-semibold font-inter">
                Prep<span>Master</span>
              </span>
              <span className="text-xs text-[#0F172B] dark:text-zinc-400 font-inter font-medium -mt-1">by Upstage</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href ,disable}) => {
              const isActive = pathname === href;
              const baseClass = `px-4 py-2 rounded-lg font-inter text-sm lg:text-base transition-colors`;
              if (disable) {
                return (
                  <span
                    key={href}
                    aria-disabled="true"
                    title="Coming soon"
                    className={`${baseClass} cursor-not-allowed opacity-45 font-medium text-[#45556C] dark:text-zinc-500 select-none`}
                  >
                    {label}
                  </span>
                );
              }
              return (
                <Link
                  key={href}
                  href={href}
                  data-tour={href === "/dashboard/practice" ? "nav-practice" : href === "/dashboard/progress" ? "nav-progress" : undefined}
                  className={`${baseClass} ${
                    isActive
                      ? "font-semibold text-[#F7C948]"
                      : "font-medium text-[#45556C] dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 flex items-center justify-center transition-colors"
            >
              {resolved === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Upgrade — hidden on mobile */}
            <button
              data-tour="header-upgrade"
              onClick={() => setUpgradeOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-[.5275rem] bg-linear-to-r from-[#FE9A00] to-[#FF6900] text-white text-sm lg:text-base font-inter font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <Crown size={15} />
              Upgrade
            </button>

            {/* User dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-4 py-1 rounded-xl cursor-pointer transition-colors">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200 leading-tight">
                      {`${user?.user?.first_name ??""}  ${user?.user?.last_name ??""}`}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">Free Account</p>
                  </div>
                  <Avatar.Root className="w-10 h-10 rounded-full overflow-hidden">
                    <Avatar.Fallback className="w-full h-full bg-linear-to-tr font-inter font-semibold text-base from-[#2B7FFF] to-[#615FFF] flex items-center justify-center text-white">
                      {initials}
                    </Avatar.Fallback>
                  </Avatar.Root>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl shadow-slate-200/80 dark:shadow-black/40 border border-slate-100 dark:border-zinc-800 p-1.5 z-50 mt-2"
                  sideOffset={5}
                  align="end"
                >
                  <DropdownMenu.Item
                    onSelect={() => router.push("/dashboard/profile")}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-zinc-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer outline-none transition-colors"
                  >
                    <Settings size={14} />
                    Profile &amp; settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={toggle}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-zinc-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer outline-none transition-colors"
                  >
                    {resolved === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    {resolved === "dark" ? "Light mode" : "Dark mode"}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100 dark:bg-zinc-800" />
                  <DropdownMenu.Item
                    className="px-3 py-2 text-sm text-rose-600 font-medium rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer outline-none transition-colors"
                    onClick={handleLogout}
                  >
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 pb-4 pt-1 flex flex-col gap-1 border-t border-slate-100 dark:border-zinc-800">
          {NAV_LINKS.map(({ label, href, disable }, i) => {
            const isActive = pathname === href;
            const animClass = `px-4 py-3 rounded-xl font-inter text-sm font-medium transition-all duration-300 ${
              mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
            }`;
            if (disable) {
              return (
                <span
                  key={href}
                  aria-disabled="true"
                  style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
                  className={`${animClass} cursor-not-allowed opacity-45 text-[#45556C] dark:text-zinc-500 select-none`}
                >
                  {label}
                </span>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: mobileOpen ? `${i * 60}ms` : "0ms" }}
                className={`${animClass} ${
                  isActive
                    ? "text-[#F7C948] bg-amber-50 dark:bg-amber-500/10 font-semibold"
                    : "text-[#45556C] dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/dashboard/profile"
            onClick={() => setMobileOpen(false)}
            className="px-4 py-3 rounded-xl font-inter text-sm font-medium text-[#45556C] dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 flex items-center gap-2"
          >
            <Settings size={14} />
            Profile &amp; settings
          </Link>

          {/* Upgrade on mobile */}
          <button
            onClick={() => { setMobileOpen(false); setUpgradeOpen(true); }}
            className="mt-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-linear-to-r from-[#FE9A00] to-[#FF6900] text-white text-sm font-inter font-bold cursor-pointer"
          >
            <Crown size={15} />
            Upgrade to Pro
          </button>
        </nav>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </header>
  );
};

export default DashboardHeader;