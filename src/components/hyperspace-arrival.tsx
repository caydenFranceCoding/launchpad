"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function HyperspaceArrival() {
  // Always render the overlay initially so it's in the DOM before first paint.
  // useLayoutEffect runs synchronously before the browser paints, so we can
  // remove it without any flash if the sessionStorage flag isn't set.
  const [visible, setVisible] = useState(true);
  const checkedRef = useRef(false);

  useLayoutEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const arrived = sessionStorage.getItem("hyperspace-arrival");
    if (!arrived) {
      // No flag — hide immediately before paint
      setVisible(false);
    } else {
      sessionStorage.removeItem("hyperspace-arrival");
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Unmount after the fade-out animation completes
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 100,
        background:
          "radial-gradient(ellipse at center, rgba(80,140,255,0.9) 0%, rgba(40,80,200,0.85) 30%, rgba(15,30,120,0.8) 60%, rgba(5,10,40,0.95) 100%)",
        animation: "hyperspace-fade-out 1.5s ease-in forwards",
      }}
    >
      <style>{`
        @keyframes hyperspace-fade-out {
          0% { opacity: 1; }
          30% { opacity: 0.85; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
