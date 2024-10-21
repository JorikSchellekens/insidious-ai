'use client';

import React, { useEffect, useRef } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface Dot {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  life: number;
  lastDirection: Direction | null;
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const gridSize = 50;
    const dots: Dot[] = [];

    const getOppositeDirection = (direction: Direction): Direction => {
      switch (direction) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
      }
    };

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      
      // Change background color to slightly off-white
      ctx.fillStyle = '#f8f8f8';  // Very light grey, almost white
      ctx.fillRect(0, 0, width, height);

      // Draw grid with light grey lines
      ctx.strokeStyle = '#e0e0e0';  // Light grey color for grid lines
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Animate dots
      if (Math.random() < 0.1) {
        const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
        dots.push({ x, y, targetX: x, targetY: y, life: 200, lastDirection: null });
      }

      // Change dot color to slightly darker grey
      ctx.fillStyle = '#b0b0b0';  // Darker grey color for dots

      for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Move dot towards target
        const dx = dot.targetX - dot.x;
        const dy = dot.targetY - dot.y;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          dot.x += dx * 0.1;
          dot.y += dy * 0.1;
        } else {
          const directions: Direction[] = ['up', 'down', 'left', 'right'];
          if (dot.lastDirection) {
            const oppositeDirection = getOppositeDirection(dot.lastDirection);
            const index = directions.indexOf(oppositeDirection);
            if (index > -1) {
              directions.splice(index, 1);
            }
          }
          
          const direction = directions[Math.floor(Math.random() * directions.length)];
          switch (direction) {
            case 'up':
              dot.targetY = Math.max(0, dot.y - gridSize);
              break;
            case 'down':
              dot.targetY = Math.min(height, dot.y + gridSize);
              break;
            case 'left':
              dot.targetX = Math.max(0, dot.x - gridSize);
              break;
            case 'right':
              dot.targetX = Math.min(width, dot.x + gridSize);
              break;
          }
          dot.lastDirection = direction;
        }

        dot.life--;
        if (dot.life <= 0) {
          dots.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
