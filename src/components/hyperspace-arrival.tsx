"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function HyperspaceArrival({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start "covering" so the overlay is in the initial SSR HTML.
  // useLayoutEffect checks the flag and switches to "idle" before
  // the browser ever paints — no flash on normal page loads.
  const [phase, setPhase] = useState<
    "idle" | "covering" | "revealing" | "done"
  >("covering");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Runs synchronously before the browser paints after hydration
  useLayoutEffect(() => {
    const arrived = sessionStorage.getItem("hyperspace-arrival");
    if (!arrived) {
      // No hyperspace flag — drop the overlay before paint
      setPhase("idle");
      return;
    }

    // Flag found — keep the blue overlay, then start the reveal
    sessionStorage.removeItem("hyperspace-arrival");
    // Stay "covering" briefly, then transition
    timerRef.current = setTimeout(() => {
      setPhase("revealing");
    }, 150);

    return () => clearTimeout(timerRef.current);
  }, []);

  // Unmount overlay after fade-out transition completes
  useEffect(() => {
    if (phase !== "revealing") return;
    timerRef.current = setTimeout(() => setPhase("done"), 2000);
    return () => clearTimeout(timerRef.current);
  }, [phase]);

  const showOverlay = phase === "covering" || phase === "revealing";

  return (
    <>
      {/* Dashboard content — hidden during cover, fades in during reveal */}
      <div
        className="flex h-screen w-full"
        style={
          phase === "idle" || phase === "done"
            ? undefined
            : {
                opacity: phase === "revealing" ? 1 : 0,
                transition: "opacity 1.6s ease-out",
              }
        }
      >
        {children}
      </div>

      {/* Blue overlay — matches the hyperspace hold color */}
      {showOverlay && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 100,
            background:
              "radial-gradient(ellipse at center, rgba(80,140,255,0.9) 0%, rgba(40,80,200,0.85) 30%, rgba(15,30,120,0.8) 60%, rgba(5,10,40,0.95) 100%)",
            opacity: phase === "covering" ? 1 : 0,
            transition: "opacity 1.6s ease-out",
          }}
        />
      )}
    </>
  );
}
