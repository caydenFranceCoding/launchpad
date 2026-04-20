"use client";

import { useEffect, useState } from "react";

export function HyperspaceArrival() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if we just came from the hyperspace login transition
    const arrived = sessionStorage.getItem("hyperspace-arrival");
    if (arrived) {
      sessionStorage.removeItem("hyperspace-arrival");
      setVisible(true);
      // Fade out over 1.2s then unmount
      const timer = setTimeout(() => setVisible(false), 1400);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 100,
        background: "radial-gradient(ellipse at center, rgba(80,140,255,0.9) 0%, rgba(40,80,200,0.85) 30%, rgba(15,30,120,0.8) 60%, rgba(5,10,40,0.95) 100%)",
        animation: "hyperspace-fade-out 1.4s ease-in forwards",
      }}
    >
      <style>{`
        @keyframes hyperspace-fade-out {
          0% { opacity: 1; }
          20% { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
