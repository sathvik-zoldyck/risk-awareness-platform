"use client";
import React, { useEffect, useRef } from 'react';

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const dots: { x: number, y: number, vx: number, vy: number, baseRadius: number }[] = [];
    const spacing = 40;
    
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        dots.push({
          x: x + (Math.random() * 10 - 5),
          y: y + (Math.random() * 10 - 5),
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          baseRadius: 1 + Math.random() * 0.5
        });
      }
    }
    
    let mouseX = -1000;
    let mouseY = -1000;
    
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', onResize);
    
    let animationFrameId: number;
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        if (dot.x < 0) dot.x = width;
        if (dot.x > width) dot.x = 0;
        if (dot.y < 0) dot.y = height;
        if (dot.y > height) dot.y = 0;
        
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = 200;
        let radius = dot.baseRadius;
        let opacity = 0.1;
        
        if (dist < maxDist) {
          const intensity = 1 - dist / maxDist;
          radius = dot.baseRadius + intensity * 2;
          opacity = 0.1 + intensity * 0.9;
        }
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        
        // Dashboard accent hex #00D4FF mapped to generic rgb below
        ctx.fillStyle = `rgba(0, 212, 255, ${opacity})`;
        ctx.fill();
        
        if (dist < maxDist) {
           ctx.shadowBlur = 15;
           ctx.shadowColor = `rgba(0, 212, 255, 0.4)`;
           ctx.fill();
           ctx.shadowBlur = 0;
        }
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
}
