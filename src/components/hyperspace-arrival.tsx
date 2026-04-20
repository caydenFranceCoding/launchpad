"use client";

import { useEffect, useRef, useState } from "react";

export function HyperspaceArrival({
  children,
}: {
  children: React.ReactNode;
}) {
  // "idle" = no hyperspace arrival, render normally
  // "covering" = overlay at full opacity, content hidden
  // "revealing" = overlay fading out, content fading in
  // "done" = overlay removed, content fully visible
  const [phase, setPhase] = useState<
    "idle" | "covering" | "revealing" | "done"
  >("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const arrived = sessionStorage.getItem("hyperspace-arrival");
    if (!arrived) {
      setPhase("idle");
      return;
    }

    sessionStorage.removeItem("hyperspace-arrival");
    setPhase("covering");

    // Brief hold at full blue, then start revealing
    timerRef.current = setTimeout(() => {
      setPhase("revealing");
      // Clean up after transition finishes
      timerRef.current = setTimeout(() => setPhase("done"), 2000);
    }, 100);

    return () => clearTimeout(timerRef.current);
  }, []);

  const showOverlay = phase === "covering" || phase === "revealing";
  const needsTransition = phase === "covering" || phase === "revealing";

  return (
    <>
      {/* Dashboard content — fades in during reveal */}
      <div
        className="flex h-screen w-full"
        style={
          needsTransition
            ? {
                opacity: phase === "revealing" ? 1 : 0,
                transition: "opacity 1.6s ease-out",
              }
            : undefined
        }
      >
        {children}
      </div>

      {/* Blue overlay — fades out during reveal */}
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
