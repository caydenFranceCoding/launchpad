"use client";

import { useEffect, useRef, useCallback } from "react";

interface HyperStar {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: [number, number, number];
}

interface HyperspaceOverlayProps {
  active: boolean;
  onComplete?: () => void;
}

export function HyperspaceOverlay({ active, onComplete }: HyperspaceOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<"idle" | "accelerate" | "cruise" | "flash">("idle");
  const progressRef = useRef(0);
  const starsRef = useRef<HyperStar[]>([]);
  const completedRef = useRef(false);

  const initStars = useCallback((count: number, width: number, height: number) => {
    const colors: Array<[number, number, number]> = [
      [255, 255, 255],
      [200, 220, 255],
      [180, 200, 255],
      [220, 230, 255],
      [160, 190, 255],
      [140, 170, 255],
    ];
    const stars: HyperStar[] = [];
    for (let i = 0; i < count; i++) {
      const z = Math.random() * width;
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z,
        pz: z,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return stars;
  }, []);

  useEffect(() => {
    if (!active) {
      phaseRef.current = "idle";
      progressRef.current = 0;
      completedRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    const STAR_COUNT = 1200;
    starsRef.current = initStars(STAR_COUNT, width, height);
    phaseRef.current = "accelerate";
    progressRef.current = 0;
    completedRef.current = false;

    let frame = 0;
    const cx = width / 2;
    const cy = height / 2;

    const animate = () => {
      frame++;
      const phase = phaseRef.current;

      // Phase timing
      if (phase === "accelerate") {
        progressRef.current = Math.min(progressRef.current + 0.008, 1);
        if (progressRef.current >= 1) {
          phaseRef.current = "cruise";
          progressRef.current = 0;
        }
      } else if (phase === "cruise") {
        progressRef.current = Math.min(progressRef.current + 0.012, 1);
        if (progressRef.current >= 1) {
          phaseRef.current = "flash";
          progressRef.current = 0;
        }
      } else if (phase === "flash") {
        progressRef.current = Math.min(progressRef.current + 0.025, 1);
        if (progressRef.current >= 1 && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }

      const accelProgress = phaseRef.current === "accelerate" ? progressRef.current : 1;
      // Eased speed: slow start, rapid acceleration
      const eased = accelProgress * accelProgress * accelProgress;
      const speed = phaseRef.current === "idle" ? 0 : 2 + eased * 58;

      // Background: deep black fading to dark blue tunnel
      ctx.fillStyle = `rgba(0, 0, 0, 1)`;
      ctx.fillRect(0, 0, width, height);

      // Radial tunnel glow during cruise
      if (phaseRef.current === "cruise" || phaseRef.current === "accelerate") {
        const tunnelAlpha = phaseRef.current === "cruise"
          ? 0.06 + progressRef.current * 0.12
          : eased * 0.06;
        const tunnelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.8);
        tunnelGrad.addColorStop(0, `rgba(100, 140, 255, ${tunnelAlpha * 0.5})`);
        tunnelGrad.addColorStop(0.3, `rgba(60, 80, 200, ${tunnelAlpha * 0.3})`);
        tunnelGrad.addColorStop(0.7, `rgba(20, 30, 80, ${tunnelAlpha * 0.1})`);
        tunnelGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = tunnelGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw & update stars
      for (const star of starsRef.current) {
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = width;
          star.pz = width;
        }

        // Project current position
        const sx = (star.x / star.z) * (width * 0.5) + cx;
        const sy = (star.y / star.z) * (height * 0.5) + cy;

        // Project previous position (for streak)
        const px = (star.x / star.pz) * (width * 0.5) + cx;
        const py = (star.y / star.pz) * (height * 0.5) + cy;

        // Size based on depth
        const size = Math.max(0.5, (1 - star.z / width) * 3);
        const [r, g, b] = star.color;

        // Brightness increases as stars approach
        const brightness = Math.min(1, (1 - star.z / width) * 1.5);

        // Streak length grows with speed
        const streakLength = Math.sqrt((sx - px) ** 2 + (sy - py) ** 2);

        if (streakLength > 1 && speed > 5) {
          // Draw streak line
          const grad = ctx.createLinearGradient(px, py, sx, sy);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
          grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${brightness * 0.4})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${brightness})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.stroke();

          // Bright head glow
          if (size > 1.2) {
            const glowRadius = size * 2;
            const headGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius);
            headGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${brightness * 0.8})`);
            headGlow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.fillStyle = headGlow;
            ctx.beginPath();
            ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Draw as dot when slow
          ctx.beginPath();
          ctx.arc(sx, sy, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${brightness})`;
          ctx.fill();
        }
      }

      // Central vanishing point glow
      if (speed > 10) {
        const vpAlpha = Math.min(0.15, (speed - 10) / 200);
        const vpGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
        vpGrad.addColorStop(0, `rgba(200, 220, 255, ${vpAlpha})`);
        vpGrad.addColorStop(0.5, `rgba(100, 140, 255, ${vpAlpha * 0.3})`);
        vpGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = vpGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flash overlay at the end
      if (phaseRef.current === "flash") {
        const flashAlpha = progressRef.current * progressRef.current;
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Screen shake during acceleration
      if (phaseRef.current === "accelerate" && eased > 0.3) {
        const shakeIntensity = eased * 2;
        canvas.style.transform = `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`;
      } else if (phaseRef.current === "cruise") {
        const shakeIntensity = 1.5 + progressRef.current;
        canvas.style.transform = `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`;
      } else {
        canvas.style.transform = "translate(0, 0)";
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => setSize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, initStars, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 50 }}
    />
  );
}
