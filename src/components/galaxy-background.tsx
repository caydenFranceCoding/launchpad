"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number;
  color: [number, number, number];
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  colors: Array<{ stop: number; color: [number, number, number]; alpha: number }>;
  drift: number;
  rotation: number;
  squash: number;
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
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

    const starColors: Array<[number, number, number]> = [
      [255, 255, 255],
      [200, 210, 255],
      [255, 220, 200],
      [200, 200, 255],
      [255, 200, 200],
      [180, 200, 255],
    ];

    // Generate stars in layers
    const stars: Star[] = Array.from({ length: 500 }, () => {
      const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2;
      const sizeMultiplier = layer === 0 ? 0.5 : layer === 1 ? 1 : 1.5;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: (Math.random() * 1.5 + 0.3) * sizeMultiplier,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 2 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      };
    });

    // Star clusters (dense pockets)
    for (let c = 0; c < 4; c++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const count = 20 + Math.random() * 30;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * 60 + 10;
        stars.push({
          x: cx + Math.cos(ang) * dist,
          y: cy + Math.sin(ang) * dist,
          size: Math.random() * 0.8 + 0.2,
          opacity: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 3 + 1,
          twinkleOffset: Math.random() * Math.PI * 2,
          layer: 0,
          color: starColors[Math.floor(Math.random() * 3)],
        });
      }
    }

    // Nebulae with richer colors
    const nebulae: Nebula[] = [
      {
        x: width * 0.15,
        y: height * 0.25,
        radius: 250,
        colors: [
          { stop: 0, color: [168, 85, 247], alpha: 0.1 },
          { stop: 0.3, color: [139, 92, 246], alpha: 0.06 },
          { stop: 0.6, color: [99, 102, 241], alpha: 0.03 },
          { stop: 1, color: [67, 56, 202], alpha: 0 },
        ],
        drift: 0.3,
        rotation: 0,
        squash: 0.7,
      },
      {
        x: width * 0.82,
        y: height * 0.65,
        radius: 300,
        colors: [
          { stop: 0, color: [59, 130, 246], alpha: 0.08 },
          { stop: 0.25, color: [99, 102, 241], alpha: 0.05 },
          { stop: 0.6, color: [139, 92, 246], alpha: 0.025 },
          { stop: 1, color: [59, 130, 246], alpha: 0 },
        ],
        drift: -0.2,
        rotation: 0.8,
        squash: 0.6,
      },
      {
        x: width * 0.5,
        y: height * 0.45,
        radius: 350,
        colors: [
          { stop: 0, color: [192, 132, 252], alpha: 0.06 },
          { stop: 0.4, color: [168, 85, 247], alpha: 0.03 },
          { stop: 1, color: [139, 92, 246], alpha: 0 },
        ],
        drift: 0.15,
        rotation: -0.4,
        squash: 0.8,
      },
      {
        x: width * 0.08,
        y: height * 0.82,
        radius: 180,
        colors: [
          { stop: 0, color: [236, 72, 153], alpha: 0.06 },
          { stop: 0.5, color: [219, 39, 119], alpha: 0.02 },
          { stop: 1, color: [190, 24, 93], alpha: 0 },
        ],
        drift: 0.4,
        rotation: 1.2,
        squash: 0.5,
      },
      {
        x: width * 0.92,
        y: height * 0.15,
        radius: 160,
        colors: [
          { stop: 0, color: [34, 211, 238], alpha: 0.04 },
          { stop: 0.5, color: [99, 102, 241], alpha: 0.02 },
          { stop: 1, color: [67, 56, 202], alpha: 0 },
        ],
        drift: -0.35,
        rotation: 2.0,
        squash: 0.65,
      },
    ];

    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      const side = Math.random();
      let x: number, y: number;
      if (side < 0.5) {
        x = Math.random() * width;
        y = -10;
      } else {
        x = width + 10;
        y = Math.random() * height * 0.5;
      }
      const angle = Math.PI * 0.6 + Math.random() * 0.4;
      const speed = 6 + Math.random() * 8;
      shootingStars.push({
        x, y,
        vx: Math.cos(angle) * speed * (side < 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 50 + Math.random() * 50,
        size: 1.5 + Math.random() * 1.5,
      });
    };

    const handleResize = () => {
      setSize();
      stars.forEach((s) => {
        s.x = Math.random() * width;
        s.y = Math.random() * height;
      });
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / width, y: e.clientY / height };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    let frame = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      const time = frame * 0.01;

      // Parallax offset based on mouse position
      const mx = (mouseRef.current.x - 0.5) * 2;
      const my = (mouseRef.current.y - 0.5) * 2;

      // Draw nebulae with rotation and squash
      for (const neb of nebulae) {
        const nx = neb.x + Math.sin(time * neb.drift) * 40 + mx * 8;
        const ny = neb.y + Math.cos(time * neb.drift * 0.7) * 25 + my * 8;
        const pulse = 1 + Math.sin(time * 0.3 + neb.rotation) * 0.25;

        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(neb.rotation + time * 0.02);
        ctx.scale(1, neb.squash);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, neb.radius);
        for (const cs of neb.colors) {
          const [r, g, b] = cs.color;
          grad.addColorStop(cs.stop, `rgba(${r}, ${g}, ${b}, ${cs.alpha * pulse})`);
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, neb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw stars with parallax layers
      for (const star of stars) {
        const parallax = star.layer === 0 ? 0.01 : star.layer === 1 ? 0.03 : 0.06;
        const sx = star.x + mx * parallax * 60;
        const sy = star.y + my * parallax * 60;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.opacity * (0.3 + twinkle * 0.7);
        const [r, g, b] = star.color;

        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Cross-glow for bright stars
        if (star.size > 1.8) {
          ctx.globalAlpha = alpha * 0.12;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 1)`;
          ctx.lineWidth = 0.5;
          const spLen = star.size * 6;
          ctx.beginPath();
          ctx.moveTo(sx - spLen, sy);
          ctx.lineTo(sx + spLen, sy);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy - spLen);
          ctx.lineTo(sx, sy + spLen);
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Soft glow
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.1})`;
          ctx.fill();
        }
      }

      // Shooting stars
      if (frame % 70 === 0 && Math.random() > 0.2) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;

        const progress = ss.life / ss.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : Math.max(0, 1 - progress);

        // Long glowing trail
        const tailLen = 40;
        const tx = ss.x - ss.vx * tailLen * 0.4;
        const ty = ss.y - ss.vy * tailLen * 0.4;
        const grad = ctx.createLinearGradient(ss.x, ss.y, tx, ty);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
        grad.addColorStop(0.3, `rgba(196, 181, 253, ${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // Bright head
        const headGrad = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, ss.size * 3);
        headGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        headGrad.addColorStop(0.5, `rgba(196, 181, 253, ${alpha * 0.3})`);
        headGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size * 3, 0, Math.PI * 2);
        ctx.fill();

        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
