// components/NeonLight.tsx
'use client';

import React, { useEffect, useRef } from "react";

const NeonLight: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const particles = Array.from({ length: 3 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 100 + 50,
      //   color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      color: `hsl(0, ${Math.random() * 100}%, 100%)`,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
    }));

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fillStyle = p.color;
        context.shadowBlur = 20;
        context.shadowColor = p.color;
        context.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        // 确保光源在canvas边界内移动
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });
      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ position: "absolute", top: 0, left: 0, filter: "contrast(20) blur(20px)" }}
    />
  );
};

export default NeonLight;
