"use client";

import { useMemo, useState, FormEvent } from "react";
import { Search, UserPlus, Pencil, Trash2, Ban, CheckCircle2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminUser, useAdminStore } from "../util/store";

function statusBadge(status: AdminUser["status"]) {
  switch (status) {
    case "active":    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "suspended": return "bg-rose-50 text-rose-700 border border-rose-200";
    case "invited":   return "bg-sky-50 text-sky-700 border border-sky-200";
  }
}

function planBadge(plan: AdminUser["plan"]) {
  switch (plan) {
    case "pro":  return "bg-[#FFF4DF] text-[#894B00] border border-[#F7C948]/40";
    case "team": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    default:     return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminUsersPage() {
  const users = useAdminStore((s) => s.users);
  const updateUser = useAdminStore((s) => s.updateUser);
  const deleteUser = useAdminStore((s) => s.deleteUser);
  const inviteUser = useAdminStore((s) => s.inviteUser);

  const [query, setQuery]     = useState("");
  const [role, setRole]       = useState<AdminUser["role"] | "all">("all");
  const [status, setStatus]   = useState<AdminUser["status"] | "all">("all");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [inviting, setInviting] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return [u.first_name, u.last_name, u.email].some((v) => v.toLowerCase().includes(q));
    });
  }, [users, query, role, status]);

  const stats = useMemo(() => {
    return {
      total:     users.length,
      active:    users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      invited:   users.filter((u) => u.status === "invited").length,
    };
  }, [users]);

  const toggleSuspend = (u: AdminUser) => {
    updateUser(u.id, { status: u.status === "suspended" ? "active" : "suspended" });
  };

  const removeUser = (u: AdminUser) => {
    if (confirm(`Permanently remove ${u.first_name} ${u.last_name} (${u.email})?`)) deleteUser(u.id);
  };

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Manage learner, educator, and admin accounts.
          </p>
        </div>
        <button
          onClick={() => setInviting(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-2 rounded-lg text-xs font-semibold bg-[#F7C948] text-white hover:opacity-90"
        >
          <UserPlus size={14} /> Invite user
        </button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Total"     value={stats.total} />
        <Stat label="Active"    value={stats.active}    tone="emerald" />
        <Stat label="Invited"   value={stats.invited}   tone="sky" />
        <Stat label="Suspended" value={stats.suspended} tone="rose" />
      </section>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-50 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-9 pl-8 pr-3 rounded-lg text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948] transition-colors"
            />
          </div>

          <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <SelectTrigger size="sm" className="bg-slate-50 dark:bg-zinc-800 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="educator">Educator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger size="sm" className="bg-slate-50 dark:bg-zinc-800 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-zinc-950/40 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5">User</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">Role</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden md:table-cell">Plan</th>
                <th className="text-left font-semibold px-4 py-2.5">Status</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">Joined</th>
                <th className="text-left font-semibold px-4 py-2.5 hidden lg:table-cell">Last seen</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No users match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 dark:border-zinc-800">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{u.first_name} {u.last_name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell capitalize text-slate-600 dark:text-zinc-300">{u.role}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${planBadge(u.plan)}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusBadge(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-zinc-400">{formatDate(u.joined_at)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500 dark:text-zinc-400">{formatDate(u.last_seen_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button onClick={() => setEditing(u)} className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-[#F7C948]">
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => toggleSuspend(u)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200">
                          {u.status === "suspended" ? <><CheckCircle2 size={12} /> Reactivate</> : <><Ban size={12} /> Suspend</>}
                        </button>
                        <button onClick={() => removeUser(u)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <UserEditDialog user={editing} onClose={() => setEditing(null)} onSave={(patch) => { updateUser(editing.id, patch); setEditing(null); }} />
      )}
      {inviting && (
        <InviteDialog
          onClose={() => setInviting(false)}
          onInvite={(input) => { inviteUser(input); setInviting(false); }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "emerald" | "rose" | "sky" }) {
  const toneClass =
    tone === "emerald" ? "text-emerald-700 dark:text-emerald-400" :
    tone === "rose"    ? "text-rose-700 dark:text-rose-400" :
    tone === "sky"     ? "text-sky-700 dark:text-sky-400" :
                         "text-slate-700 dark:text-zinc-200";
  return (
    <div className="rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
      <p className={`text-2xl font-bold tabular-nums ${toneClass}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-1">{label}</p>
    </div>
  );
}

function UserEditDialog({
  user, onClose, onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (patch: Partial<Omit<AdminUser, "id">>) => void;
}) {
  const [first_name, setFirstName] = useState(user.first_name);
  const [last_name, setLastName]   = useState(user.last_name);
  const [email, setEmail]          = useState(user.email);
  const [role, setRole]            = useState<AdminUser["role"]>(user.role);
  const [plan, setPlan]            = useState<AdminUser["plan"]>(user.plan);
  const [status, setStatus]        = useState<AdminUser["status"]>(user.status);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ first_name, last_name, email, role, plan, status });
  };

  return (
    <DialogShell title={`Edit ${user.first_name} ${user.last_name}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <DialogField label="First name">
            <input value={first_name} onChange={(e) => setFirstName(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]" />
          </DialogField>
          <DialogField label="Last name">
            <input value={last_name} onChange={(e) => setLastName(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]" />
          </DialogField>
        </div>
        <DialogField label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]" />
        </DialogField>
        <div className="grid grid-cols-3 gap-3">
          <DialogField label="Role">
            <Select value={role} onValueChange={(v) => setRole(v as AdminUser["role"])}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="learner">Learner</SelectItem>
                <SelectItem value="educator">Educator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </DialogField>
          <DialogField label="Plan">
            <Select value={plan} onValueChange={(v) => setPlan(v as AdminUser["plan"])}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </DialogField>
          <DialogField label="Status">
            <Select value={status} onValueChange={(v) => setStatus(v as AdminUser["status"])}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </DialogField>
        </div>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90">Save changes</button>
        </div>
      </form>
    </DialogShell>
  );
}

function InviteDialog({
  onClose, onInvite,
}: {
  onClose: () => void;
  onInvite: (input: { first_name: string; last_name: string; email: string; role: AdminUser["role"] }) => void;
}) {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName]   = useState("");
  const [email, setEmail]          = useState("");
  const [role, setRole]            = useState<AdminUser["role"]>("learner");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!first_name.trim() || !last_name.trim() || !email.trim()) return;
    onInvite({ first_name: first_name.trim(), last_name: last_name.trim(), email: email.trim(), role });
  };

  return (
    <DialogShell title="Invite user" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <DialogField label="First name">
            <input required value={first_name} onChange={(e) => setFirstName(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]" />
          </DialogField>
          <DialogField label="Last name">
            <input required value={last_name} onChange={(e) => setLastName(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]" />
          </DialogField>
        </div>
        <DialogField label="Email">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none focus:border-[#F7C948]" />
        </DialogField>
        <DialogField label="Role">
          <Select value={role} onValueChange={(v) => setRole(v as AdminUser["role"])}>
            <SelectTrigger className="w-full bg-slate-50 dark:bg-zinc-800 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="learner">Learner</SelectItem>
              <SelectItem value="educator">Educator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </DialogField>
        <div className="pt-2 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F7C948] text-white hover:opacity-90">Send invite</button>
        </div>
      </form>
    </DialogShell>
  );
}

function DialogShell({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function DialogField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
