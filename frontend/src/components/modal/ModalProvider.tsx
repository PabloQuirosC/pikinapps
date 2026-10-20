import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, Loader2, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Kind = "success" | "error" | "warning" | "info" | "confirm" | "loading";
interface ModalOptions { title: string; message?: string; confirmText?: string; cancelText?: string; onRetry?: () => void; danger?: boolean }
interface QueueItem extends ModalOptions { id: number; kind: Kind; resolve: (v: boolean) => void }

interface ModalApi {
  success: (o: ModalOptions) => Promise<boolean>;
  error: (o: ModalOptions) => Promise<boolean>;
  warning: (o: ModalOptions) => Promise<boolean>;
  info: (o: ModalOptions) => Promise<boolean>;
  confirm: (o: ModalOptions) => Promise<boolean>;
  loading: (o: ModalOptions) => () => void;
}

const Ctx = createContext<ModalApi | null>(null);
export const useModal = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useModal debe usarse dentro de ModalProvider");
  return c;
};

let uid = 0;

/** Sistema global de modales: única vía de comunicación con el usuario (sin toasts ni alert). */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const current = queue[0];

  const push = useCallback((kind: Kind, o: ModalOptions) => {
    let id = 0;
    const p = new Promise<boolean>((resolve) => {
      id = ++uid;
      setQueue((q) => [...q, { ...o, kind, id, resolve }]);
    });
    return { p, id };
  }, []);

  const close = useCallback((value: boolean) => {
    setQueue((q) => {
      q[0]?.resolve(value);
      return q.slice(1);
    });
  }, []);

  const api = useMemo<ModalApi>(
    () => ({
      success: (o) => push("success", o).p,
      error: (o) => push("error", o).p,
      warning: (o) => push("warning", o).p,
      info: (o) => push("info", o).p,
      confirm: (o) => push("confirm", o).p,
      loading: (o) => {
        const { id } = push("loading", o);
        return () => setQueue((q) => q.filter((i) => i.id !== id));
      },
    }),
    [push],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <AnimatePresence>{current && <ModalView key={current.id} item={current} onClose={close} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

const iconMap = {
  success: { Icon: Check, cls: "bg-success/15 text-success" },
  error: { Icon: XCircle, cls: "bg-destructive/15 text-destructive" },
  warning: { Icon: AlertTriangle, cls: "bg-warning/15 text-warning" },
  info: { Icon: Info, cls: "bg-primary/15 text-primary" },
  confirm: { Icon: AlertTriangle, cls: "bg-accent/15 text-accent" },
  loading: { Icon: Loader2, cls: "bg-primary/15 text-primary" },
};

function ModalView({ item, onClose }: { item: QueueItem; onClose: (v: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { Icon, cls } = iconMap[item.kind];
  const dismissable = item.kind !== "loading";

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose(false);
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("button, [href], input, [tabindex]:not([tabindex='-1'])");
        if (!f.length) return;
        const first = f[0]!, last = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus();
    };
  }, [dismissable, onClose]);

  return (
    <motion.div className="fixed inset-0 z-[100] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={() => dismissable && onClose(false)} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`m-${item.id}-t`}
        className="relative w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-card"
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
      >
        {dismissable && (
          <button aria-label="Cerrar" onClick={() => onClose(false)} className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
        <motion.div
          className={`mx-auto mb-5 grid size-16 place-items-center rounded-full ${cls}`}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1, damping: 12 }}
        >
          {item.kind === "success" ? (
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.45 }} />
            </svg>
          ) : (
            <Icon className={`size-8 ${item.kind === "loading" ? "animate-spin" : ""}`} />
          )}
        </motion.div>
        <h2 id={`m-${item.id}-t`} className="text-xl font-semibold">{item.title}</h2>
        {item.message && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.message}</p>}
        {dismissable && (
          <div className="mt-7 flex justify-center gap-3">
            {item.kind === "confirm" && (
              <button onClick={() => onClose(false)} className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted">
                {item.cancelText ?? "Cancelar"}
              </button>
            )}
            {item.kind === "error" && item.onRetry && (
              <button onClick={() => { onClose(false); item.onRetry?.(); }} className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted">
                Reintentar
              </button>
            )}
            <button
              data-autofocus
              onClick={() => onClose(true)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold ${item.danger ? "bg-destructive text-destructive-foreground" : "bg-gradient-brand text-primary-foreground"}`}
            >
              {item.confirmText ?? (item.kind === "confirm" ? "Confirmar" : "Entendido")}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
