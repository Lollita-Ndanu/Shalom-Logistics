import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "sidebar";
export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-[var(--admin-green)] text-white hover:bg-[var(--admin-green-dark)]",
    secondary: "bg-[var(--admin-gold)] text-[var(--admin-ink)] hover:bg-[var(--admin-gold-light)]",
    outline: "border border-[var(--admin-border)] bg-white text-[var(--admin-ink)] hover:bg-slate-50",
    danger: "text-red-700 hover:bg-red-50",
    sidebar: "bg-transparent text-white hover:bg-white/10",
  };
  return <button {...props} className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} />;
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm sm:p-6 ${className}`}>{title ? <h2 className="mb-4 text-lg font-bold">{title}</h2> : null}{children}</section>;
}

export function Badge({ children, variant = "neutral" }: { children: ReactNode; variant?: "neutral" | "success" | "gold" | "danger" }) {
  const styles = { neutral: "bg-slate-100 text-slate-700", success: "bg-emerald-100 text-emerald-900", gold: "bg-[var(--admin-gold)] text-[var(--admin-ink)]", danger: "bg-red-100 text-red-800" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${styles[variant]}`}>{children}</span>;
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">{headers.map((header) => <th key={header} className="p-3 font-semibold">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

export function Input({ className = "", leading, inputRef, ...props }: InputHTMLAttributes<HTMLInputElement> & { leading?: ReactNode; inputRef?: Ref<HTMLInputElement> }) {
  return <span className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-white px-3 focus-within:border-[var(--admin-green)] focus-within:ring-2 focus-within:ring-[var(--admin-green)]/20">{leading ? <span className="text-[var(--admin-muted)]">{leading}</span> : null}<input {...props} ref={inputRef} className={`min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none placeholder:text-slate-500 ${className}`} /></span>;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`min-h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 py-2 text-sm text-[var(--admin-ink)] focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20 ${props.className ?? ""}`} />;
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (item: string) => void }) {
  return <div className="flex gap-1 overflow-x-auto border-b border-[var(--admin-border)]">{items.map((item) => <button key={item} type="button" onClick={() => onChange(item)} className={`shrink-0 border-b-2 px-4 py-2 text-sm font-semibold ${active === item ? "border-[var(--admin-green)] text-[var(--admin-green-dark)]" : "border-transparent text-[var(--admin-muted)]"}`}>{item}</button>)}</div>;
}

export function Toast({ children, role = "status" }: { children: ReactNode; role?: "status" | "alert" }) {
  return <p role={role} className="mb-4 rounded-lg border border-[var(--admin-green)]/20 bg-emerald-50 px-4 py-3 text-sm text-[var(--admin-green-dark)]">{children}</p>;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="rounded-xl border border-dashed border-[var(--admin-border)] bg-slate-50 px-6 py-10 text-center"><h3 className="font-semibold">{title}</h3>{description ? <p className="mt-1 text-sm text-[var(--admin-muted)]">{description}</p> : null}</div>;
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return <div role="status" className="animate-pulse rounded-xl bg-slate-100 px-6 py-10 text-center text-sm text-[var(--admin-muted)]">{label}</div>;
}

export function ErrorState({ title = "Something went wrong", description }: { title?: string; description?: string }) {
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-red-900"><h3 className="font-semibold">{title}</h3>{description ? <p className="mt-1 text-sm">{description}</p> : null}</div>;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", onCancel, onConfirm }: { open: boolean; title: string; description: string; confirmLabel?: string; cancelLabel?: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="confirm-title" className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm text-[var(--admin-muted)]">{description}</p><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>{cancelLabel}</Button><Button type="button" variant="danger" onClick={onConfirm}>{confirmLabel}</Button></div></section></div>;
}
