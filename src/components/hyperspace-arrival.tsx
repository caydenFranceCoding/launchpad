"use client";

import { useEffect, useState } from "react";

export function HyperspaceArrival() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");

  useEffect(() => {
    const arrived = sessionStorage.getItem("hyperspace-arrival");
    if (!arrived) return;

    sessionStorage.removeItem("hyperspace-arrival");
    // Show the overlay at full opacity
    setPhase("visible");

    // Start fading on the next frame so the CSS transition triggers
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase("fading");
      });
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase !== "fading") return;
    const timer = setTimeout(() => setPhase("hidden"), 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 100,
        background:
          "radial-gradient(ellipse at center, rgba(80,140,255,0.9) 0%, rgba(40,80,200,0.85) 30%, rgba(15,30,120,0.8) 60%, rgba(5,10,40,0.95) 100%)",
        opacity: phase === "visible" ? 1 : 0,
        transition: "opacity 1.6s ease-in",
      }}
    />
  );
}
