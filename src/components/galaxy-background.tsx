"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: [number, number, number];
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -200, y: -200 });
  const shipAngleRef = useRef(0);
  const shipPosRef = useRef({ x: -200, y: -200 });
  const shipVelRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const drawSpaceship = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, speed: number, time: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const s = 1.6; // scale

      // Shield aura (pulsing)
      const shieldPulse = 0.3 + Math.sin(time * 3) * 0.15 + Math.sin(time * 7.3) * 0.05;
      const shieldGrad = ctx.createRadialGradient(0, 0, 8 * s, 0, 0, 28 * s);
      shieldGrad.addColorStop(0, `rgba(139, 92, 246, ${shieldPulse * 0.15})`);
      shieldGrad.addColorStop(0.5, `rgba(99, 102, 241, ${shieldPulse * 0.08})`);
      shieldGrad.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.ellipse(0, 2 * s, 26 * s, 30 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Engine glow (dual engines)
      const engineIntensity = 0.5 + Math.min(speed / 300, 0.5);
      for (const ex of [-4.5 * s, 4.5 * s]) {
        const eGlow = ctx.createRadialGradient(ex, 13 * s, 0, ex, 13 * s, 14 * s);
        eGlow.addColorStop(0, `rgba(167, 139, 250, ${engineIntensity})`);
        eGlow.addColorStop(0.3, `rgba(99, 102, 241, ${engineIntensity * 0.5})`);
        eGlow.addColorStop(0.6, `rgba(59, 130, 246, ${engineIntensity * 0.2})`);
        eGlow.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = eGlow;
        ctx.beginPath();
        ctx.arc(ex, 13 * s, 14 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Engine flames (dual, flickering)
      for (const ex of [-4.5 * s, 4.5 * s]) {
        const flicker = 0.6 + Math.random() * 0.4;
        const flameLen = (10 + speed * 0.04) * s * flicker;
        const innerFlameLen = flameLen * 0.6;

        // Outer flame
        ctx.beginPath();
        ctx.moveTo(ex - 3 * s, 10 * s);
        ctx.quadraticCurveTo(ex - 1.5 * s, 10 * s + flameLen * 0.6, ex, 10 * s + flameLen);
        ctx.quadraticCurveTo(ex + 1.5 * s, 10 * s + flameLen * 0.6, ex + 3 * s, 10 * s);
        ctx.closePath();
        const outerGrad = ctx.createLinearGradient(ex, 10 * s, ex, 10 * s + flameLen);
        outerGrad.addColorStop(0, "rgba(167, 139, 250, 0.9)");
        outerGrad.addColorStop(0.4, "rgba(96, 165, 250, 0.6)");
        outerGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Inner flame (brighter core)
        ctx.beginPath();
        ctx.moveTo(ex - 1.5 * s, 10 * s);
        ctx.quadraticCurveTo(ex - 0.5 * s, 10 * s + innerFlameLen * 0.6, ex, 10 * s + innerFlameLen);
        ctx.quadraticCurveTo(ex + 0.5 * s, 10 * s + innerFlameLen * 0.6, ex + 1.5 * s, 10 * s);
        ctx.closePath();
        const innerGrad = ctx.createLinearGradient(ex, 10 * s, ex, 10 * s + innerFlameLen);
        innerGrad.addColorStop(0, "rgba(224, 231, 255, 0.95)");
        innerGrad.addColorStop(0.5, "rgba(199, 210, 254, 0.6)");
        innerGrad.addColorStop(1, "rgba(167, 139, 250, 0)");
        ctx.fillStyle = innerGrad;
        ctx.fill();
      }

      // Main body shadow (depth)
      ctx.beginPath();
      ctx.moveTo(0, -16 * s);
      ctx.lineTo(-10.5 * s, 10 * s);
      ctx.lineTo(10.5 * s, 10 * s);
      ctx.closePath();
      ctx.fillStyle = "rgba(30, 15, 60, 0.5)";
      ctx.fill();

      // Main fuselage
      ctx.beginPath();
      ctx.moveTo(0, -16 * s);
      ctx.lineTo(-3.5 * s, -10 * s);
      ctx.lineTo(-5 * s, 0);
      ctx.lineTo(-4 * s, 8 * s);
      ctx.lineTo(-2 * s, 10 * s);
      ctx.lineTo(2 * s, 10 * s);
      ctx.lineTo(4 * s, 8 * s);
      ctx.lineTo(5 * s, 0);
      ctx.lineTo(3.5 * s, -10 * s);
      ctx.closePath();
      const fuselageGrad = ctx.createLinearGradient(-5 * s, 0, 5 * s, 0);
      fuselageGrad.addColorStop(0, "#6d28d9");
      fuselageGrad.addColorStop(0.3, "#a78bfa");
      fuselageGrad.addColorStop(0.5, "#c4b5fd");
      fuselageGrad.addColorStop(0.7, "#a78bfa");
      fuselageGrad.addColorStop(1, "#6d28d9");
      ctx.fillStyle = fuselageGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(221, 214, 254, 0.3)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Left wing
      ctx.beginPath();
      ctx.moveTo(-3.5 * s, -4 * s);
      ctx.lineTo(-12 * s, 6 * s);
      ctx.lineTo(-10 * s, 10 * s);
      ctx.lineTo(-7 * s, 10 * s);
      ctx.lineTo(-5 * s, 4 * s);
      ctx.closePath();
      const lwGrad = ctx.createLinearGradient(-3.5 * s, -4 * s, -12 * s, 10 * s);
      lwGrad.addColorStop(0, "#8b5cf6");
      lwGrad.addColorStop(0.5, "#6d28d9");
      lwGrad.addColorStop(1, "#4c1d95");
      ctx.fillStyle = lwGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(196, 181, 253, 0.25)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(3.5 * s, -4 * s);
      ctx.lineTo(12 * s, 6 * s);
      ctx.lineTo(10 * s, 10 * s);
      ctx.lineTo(7 * s, 10 * s);
      ctx.lineTo(5 * s, 4 * s);
      ctx.closePath();
      const rwGrad = ctx.createLinearGradient(3.5 * s, -4 * s, 12 * s, 10 * s);
      rwGrad.addColorStop(0, "#8b5cf6");
      rwGrad.addColorStop(0.5, "#7c3aed");
      rwGrad.addColorStop(1, "#5b21b6");
      ctx.fillStyle = rwGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(196, 181, 253, 0.25)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Panel line details on fuselage
      ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, -14 * s);
      ctx.lineTo(0, 8 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3 * s, -2 * s);
      ctx.lineTo(3 * s, -2 * s);
      ctx.stroke();

      // Cockpit (glowing dome)
      ctx.beginPath();
      ctx.ellipse(0, -7 * s, 2.8 * s, 5 * s, 0, 0, Math.PI * 2);
      const cockpitGrad = ctx.createRadialGradient(0.5 * s, -9 * s, 0, 0, -7 * s, 5 * s);
      cockpitGrad.addColorStop(0, "rgba(224, 231, 255, 0.95)");
      cockpitGrad.addColorStop(0.3, "rgba(165, 180, 252, 0.7)");
      cockpitGrad.addColorStop(0.7, "rgba(99, 102, 241, 0.4)");
      cockpitGrad.addColorStop(1, "rgba(67, 56, 202, 0.3)");
      ctx.fillStyle = cockpitGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(199, 210, 254, 0.5)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Cockpit highlight
      ctx.beginPath();
      ctx.ellipse(-0.5 * s, -9 * s, 1 * s, 2 * s, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();

      // Wing-tip lights (blinking)
      const blink = Math.sin(time * 8) > 0;
      const blink2 = Math.sin(time * 8 + Math.PI) > 0;

      // Left wing tip - red
      if (blink) {
        const ltGlow = ctx.createRadialGradient(-11 * s, 7 * s, 0, -11 * s, 7 * s, 6 * s);
        ltGlow.addColorStop(0, "rgba(248, 113, 113, 0.9)");
        ltGlow.addColorStop(0.3, "rgba(239, 68, 68, 0.4)");
        ltGlow.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = ltGlow;
        ctx.beginPath();
        ctx.arc(-11 * s, 7 * s, 6 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(-11 * s, 7 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fillStyle = blink ? "#fca5a5" : "#7f1d1d";
      ctx.fill();

      // Right wing tip - green
      if (blink2) {
        const rtGlow = ctx.createRadialGradient(11 * s, 7 * s, 0, 11 * s, 7 * s, 6 * s);
        rtGlow.addColorStop(0, "rgba(74, 222, 128, 0.9)");
        rtGlow.addColorStop(0.3, "rgba(34, 197, 94, 0.4)");
        rtGlow.addColorStop(1, "rgba(34, 197, 94, 0)");
        ctx.fillStyle = rtGlow;
        ctx.beginPath();
        ctx.arc(11 * s, 7 * s, 6 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(11 * s, 7 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fillStyle = blink2 ? "#86efac" : "#14532d";
      ctx.fill();

      // Nose light
      const nosePulse = 0.5 + Math.sin(time * 5) * 0.5;
      const noseGlow = ctx.createRadialGradient(0, -15 * s, 0, 0, -15 * s, 5 * s);
      noseGlow.addColorStop(0, `rgba(199, 210, 254, ${nosePulse * 0.8})`);
      noseGlow.addColorStop(1, "rgba(199, 210, 254, 0)");
      ctx.fillStyle = noseGlow;
      ctx.beginPath();
      ctx.arc(0, -15 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -15.5 * s, 0.8 * s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + nosePulse * 0.4})`;
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
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -200, y: -200 };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);
    document.addEventListener("mouseleave", handleMouseLeave);

    let frame = 0;
    const particles = particlesRef.current;

    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      const time = frame * 0.01;

      // Parallax offset based on mouse position
      const mx = (mouseRef.current.x / width - 0.5) * 2;
      const my = (mouseRef.current.y / height - 0.5) * 2;

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

      // Ship physics
      const ship = shipPosRef.current;
      const mouse = mouseRef.current;
      const dx = mouse.x - ship.x;
      const dy = mouse.y - ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spring-damper physics for smoother movement
      const springK = 0.04;
      const damping = 0.85;
      shipVelRef.current.x = (shipVelRef.current.x + dx * springK) * damping;
      shipVelRef.current.y = (shipVelRef.current.y + dy * springK) * damping;
      ship.x += shipVelRef.current.x;
      ship.y += shipVelRef.current.y;

      const speed = Math.sqrt(shipVelRef.current.x ** 2 + shipVelRef.current.y ** 2);

      // Smooth angle with banking feel
      const targetAngle = Math.atan2(shipVelRef.current.x, -shipVelRef.current.y);
      let angleDiff = targetAngle - shipAngleRef.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      shipAngleRef.current += angleDiff * 0.1;

      // Only draw if cursor is on the page
      if (mouse.x > -100 && mouse.y > -100) {
        // Emit engine particles
        if (speed > 1) {
          const sinA = Math.sin(shipAngleRef.current);
          const cosA = Math.cos(shipAngleRef.current);
          const emitCount = Math.min(Math.floor(speed / 3), 4);
          for (let e = 0; e < emitCount; e++) {
            for (const offset of [-4.5 * 1.6, 4.5 * 1.6]) {
              const ex = ship.x + offset * cosA - sinA * 13 * 1.6 * (0.8 + Math.random() * 0.4);
              const ey = ship.y + offset * sinA + cosA * 13 * 1.6 * (0.8 + Math.random() * 0.4);
              const spread = (Math.random() - 0.5) * 2;
              particles.push({
                x: ex,
                y: ey,
                vx: -sinA * (1 + Math.random() * 2) + spread,
                vy: cosA * (1 + Math.random() * 2) + spread,
                life: 0,
                maxLife: 25 + Math.random() * 20,
                size: 1 + Math.random() * 2,
                color: Math.random() > 0.5 ? [167, 139, 250] : [129, 140, 248],
              });
            }
          }
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life++;

          const pAlpha = Math.max(0, 1 - p.life / p.maxLife);
          const [pr, pg, pb] = p.color;

          const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (1 + p.life * 0.05));
          pGrad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${pAlpha * 0.8})`);
          pGrad.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + p.life * 0.05), 0, Math.PI * 2);
          ctx.fill();

          if (p.life >= p.maxLife) particles.splice(i, 1);
        }

        // Cap particles
        while (particles.length > 300) particles.shift();

        drawSpaceship(ctx, ship.x, ship.y, shipAngleRef.current, speed, time);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleMouseLeave);
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
