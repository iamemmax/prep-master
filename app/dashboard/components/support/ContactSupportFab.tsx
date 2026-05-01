"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, X, Phone, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// Support contact details. Update these once and they'll appear consistently
// across every dashboard route. Numbers can be in any human-readable format —
// the component strips formatting before generating tel: / wa.me links.
const SUPPORT = {
  whatsapp: "+234 800 000 0000",
  phone:    "+234 800 000 0000",
  email:    "support@prepmaster.app",
};

export default function ContactSupportFab() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Strip everything except digits/+ for tel: links and digits-only for wa.me.
  const telHref = `tel:${SUPPORT.phone.replace(/[^\d+]/g, "")}`;
  const waHref  = `https://wa.me/${SUPPORT.whatsapp.replace(/\D/g, "")}`;
  const mailHref = `mailto:${SUPPORT.email}`;

  return (
    <div
      ref={wrapperRef}
      data-no-paywall
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
    >
      {open && (
        <div
          role="menu"
          className="mb-3 w-64 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10">
            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Contact support</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">We&apos;re here to help — pick a channel.</p>
          </div>
          <div className="py-1">
            <SupportLink
              href={waHref}
              external
              icon={<FaWhatsapp size={16} />}
              iconClass="bg-[#25D366]/15 text-[#25D366]"
              label="WhatsApp"
              hint={SUPPORT.whatsapp}
              onSelect={() => setOpen(false)}
            />
            <SupportLink
              href={telHref}
              icon={<Phone size={15} />}
              iconClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
              label="Call us"
              hint={SUPPORT.phone}
              onSelect={() => setOpen(false)}
            />
            <SupportLink
              href={mailHref}
              icon={<Mail size={15} />}
              iconClass="bg-amber-500/15 text-[#894B00] dark:text-amber-300"
              label="Email"
              hint={SUPPORT.email}
              onSelect={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? "Close support menu" : "Contact support"}
        className="w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FE9A00, #FF6900)" }}
      >
        {open ? <X size={22} /> : <MessagesSquare size={22} />}
      </button>
    </div>
  );
}

function SupportLink({
  href,
  external,
  icon,
  iconClass,
  label,
  hint,
  onSelect,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  hint: string;
  onSelect: () => void;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
      role="menuitem"
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">{label}</p>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{hint}</p>
      </div>
    </a>
  );
}
