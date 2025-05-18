"use client";
// This component renders a starry background using Three.js and React Three Fiber.
import React, { useRef, useEffect } from 'react';

const StarryNight = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    class Star {
      constructor() {
        this.reset();
      }
      reset() {
        if (Math.random() < 0.5) {
          this.x = Math.random() * width;
          this.y = -5;
        } else {
          this.x = -5;
          this.y = Math.random() * height;
        }
        this.size = Math.random() * 1.5 + 0.5;
        this.speed = Math.random() * 0.5 + 0.2;
        this.vx = this.speed;
        this.vy = this.speed;
        this.tail = this.size * 3;
        this.opacity = Math.random() * 0.3 + 0.3;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x - this.tail > width || this.y - this.tail > height) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * this.tail, this.y - this.vy * this.tail);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = this.size;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        ctx.restore();
      }
    }

    const STAR_COUNT = 50;
    const stars = Array.from({ length: STAR_COUNT }, () => new Star());

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    stars.forEach(star => star.draw());

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, width, height);
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      stars.forEach(star => star.draw());
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        background: '#000',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1  // now behind children wrapped at higher z-index
      }}
    />
  );
};

export default StarryNight;
