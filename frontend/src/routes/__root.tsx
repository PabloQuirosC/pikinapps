import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoUrl from "../assets/logo.png";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getPendingRequests } from "../lib/api";
import { ModalProvider } from "@/components/modal/ModalProvider";
import { useSite } from "@/store/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PikinApps — Estudio de desarrollo web" },
      { name: "description", content: "Sitios web, e-commerce y aplicaciones a medida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: logoUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemeSync() {
  const theme = useSite((s) => s.theme);
  useEffect(() => {
    useSite.persist.rehydrate();
    void useSite.getState().loadCompany();
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);
  return null;
}

function GlobalTransactionSpinner() {
  const [pendingRequests, setPendingRequests] = useState(getPendingRequests);

  useEffect(() => {
    const update = (event: Event) => {
      const count = (event as CustomEvent<number>).detail;
      setPendingRequests(typeof count === "number" ? count : getPendingRequests());
    };
    window.addEventListener("pikinapps:request-count", update);
    return () => {
      window.removeEventListener("pikinapps:request-count", update);
    };
  }, []);

  if (pendingRequests === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Procesando solicitud"
    >
      <div className="flex flex-col items-center gap-4 rounded-3xl border bg-card/95 px-8 py-7 shadow-card">
        <span className="global-spinner size-10 rounded-full border-4 border-primary/20 border-t-primary" />
        <span className="text-sm font-semibold">Procesando...</span>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <ThemeSync />
        <GlobalTransactionSpinner />
        <Outlet />
      </ModalProvider>
    </QueryClientProvider>
  );
}
