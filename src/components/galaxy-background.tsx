"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
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
  color: [number, number, number];
  opacity: number;
  drift: number;
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const shipAngleRef = useRef(0);
  const shipPosRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number>(0);

  const drawSpaceship = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Engine glow
      const glowGradient = ctx.createRadialGradient(0, 12, 0, 0, 12, 20);
      glowGradient.addColorStop(0, "rgba(139, 92, 246, 0.8)");
      glowGradient.addColorStop(0.4, "rgba(59, 130, 246, 0.4)");
      glowGradient.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 12, 20, 0, Math.PI * 2);
      ctx.fill();

      // Engine flame (flickering)
      const flicker = 0.7 + Math.random() * 0.3;
      const flameLen = 14 * flicker;
      ctx.beginPath();
      ctx.moveTo(-4, 8);
      ctx.lineTo(0, 8 + flameLen);
      ctx.lineTo(4, 8);
      ctx.closePath();
      const flameGrad = ctx.createLinearGradient(0, 8, 0, 8 + flameLen);
      flameGrad.addColorStop(0, "rgba(167, 139, 250, 0.9)");
      flameGrad.addColorStop(0.5, "rgba(96, 165, 250, 0.6)");
      flameGrad.addColorStop(1, "rgba(96, 165, 250, 0)");
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Ship body
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(-8, 8);
      ctx.lineTo(-3, 6);
      ctx.lineTo(0, 8);
      ctx.lineTo(3, 6);
      ctx.lineTo(8, 8);
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(0, -14, 0, 8);
      bodyGrad.addColorStop(0, "#c4b5fd");
      bodyGrad.addColorStop(1, "#7c3aed");
      ctx.fillStyle = bodyGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(221, 214, 254, 0.6)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Cockpit
      ctx.beginPath();
      ctx.ellipse(0, -4, 2.5, 4, 0, 0, Math.PI * 2);
      const cockpitGrad = ctx.createRadialGradient(0, -5, 0, 0, -4, 4);
      cockpitGrad.addColorStop(0, "rgba(199, 210, 254, 0.9)");
      cockpitGrad.addColorStop(1, "rgba(129, 140, 248, 0.4)");
      ctx.fillStyle = cockpitGrad;
      ctx.fill();

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate stars
    const stars: Star[] = Array.from({ length: 300 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 2 + 1,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    // Generate nebulae
    const nebulae: Nebula[] = [
      {
        x: width * 0.2,
        y: height * 0.3,
        radius: 200,
        color: [139, 92, 246],
        opacity: 0.08,
        drift: 0.0003,
      },
      {
        x: width * 0.8,
        y: height * 0.7,
        radius: 250,
        color: [59, 130, 246],
        opacity: 0.06,
        drift: -0.0002,
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        radius: 300,
        color: [168, 85, 247],
        opacity: 0.05,
        drift: 0.00015,
      },
      {
        x: width * 0.1,
        y: height * 0.8,
        radius: 150,
        color: [236, 72, 153],
        opacity: 0.04,
        drift: 0.0004,
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
      const speed = 6 + Math.random() * 6;
      shootingStars.push({
        x,
        y,
        vx: Math.cos(angle) * speed * (side < 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        size: 1.5 + Math.random() * 1.5,
      });
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars.forEach((s) => {
        s.x = Math.random() * width;
        s.y = Math.random() * height;
      });
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    let frame = 0;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw nebulae
      const time = frame * 0.01;
      for (const neb of nebulae) {
        const nx = neb.x + Math.sin(time * neb.drift * 100) * 30;
        const ny = neb.y + Math.cos(time * neb.drift * 80) * 20;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, neb.radius);
        const pulse = 1 + Math.sin(time * 0.5) * 0.2;
        const [r, g, b] = neb.color;
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${neb.opacity * pulse})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${neb.opacity * 0.3 * pulse})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, neb.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw stars
      for (const star of stars) {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
        const alpha = star.opacity * (0.4 + twinkle * 0.6);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Add glow to brighter stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 200, 255, ${alpha * 0.15})`;
          ctx.fill();
        }
      }

      // Shooting stars
      if (frame % 90 === 0 && Math.random() > 0.3) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;

        const progress = ss.life / ss.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : 1 - progress;

        // Trail
        const tailLen = 30;
        const grad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - ss.vx * tailLen * 0.3,
          ss.y - ss.vy * tailLen * 0.3
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        grad.addColorStop(1, `rgba(167, 139, 250, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = ss.size;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - ss.vx * tailLen * 0.3,
          ss.y - ss.vy * tailLen * 0.3
        );
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.fill();

        if (ss.life >= ss.maxLife) {
          shootingStars.splice(i, 1);
        }
      }

      // Spaceship follows cursor with smooth easing
      const ship = shipPosRef.current;
      const mouse = mouseRef.current;
      const dx = mouse.x - ship.x;
      const dy = mouse.y - ship.y;
      ship.x += dx * 0.06;
      ship.y += dy * 0.06;

      // Smooth angle towards movement direction
      const targetAngle = Math.atan2(dx, -dy);
      let angleDiff = targetAngle - shipAngleRef.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      shipAngleRef.current += angleDiff * 0.08;

      // Only draw ship if cursor is on the page
      if (mouse.x > 0 && mouse.y > 0) {
        // Particle trail behind ship
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          const trailX =
            ship.x - Math.sin(shipAngleRef.current) * 14;
          const trailY =
            ship.y + Math.cos(shipAngleRef.current) * 14;
          const trailGrad = ctx.createRadialGradient(
            trailX,
            trailY,
            0,
            trailX,
            trailY,
            8 + dist * 0.05
          );
          trailGrad.addColorStop(0, "rgba(139, 92, 246, 0.3)");
          trailGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
          ctx.fillStyle = trailGrad;
          ctx.beginPath();
          ctx.arc(trailX, trailY, 8 + dist * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }

        drawSpaceship(ctx, ship.x, ship.y, shipAngleRef.current);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [drawSpaceship]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, cursor: "none" }}
    />
  );
}
