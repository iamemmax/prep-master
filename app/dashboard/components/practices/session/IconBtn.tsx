"use client";

export default function IconBtn({
  onClick,
  label,
  children,
  desktopOnly,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  desktopOnly?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`${desktopOnly ? "hidden md:inline-flex" : "inline-flex"} items-center justify-center w-8 h-8 rounded-md text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors`}
    >
      {children}
    </button>
  );
}
