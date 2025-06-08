'use client';
import React, { useEffect, useRef } from 'react';
import { FaGithub, FaLinkedin, FaRegCopyright } from 'react-icons/fa';

const AnimatedFooter = () => {
  const canvasRef = useRef(null);
  const textRef = useRef("T");
  const fullText = "TUTORLYAII";
  const currentIndex = useRef(1);
  const isAdding = useRef(true);
  const mouse = useRef({ x: 0, y: 0, click: false });
  let textParticles = [];
  let backgroundParticles = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 200;
      generateTextParticles(textRef.current);
      generateBackgroundParticles();
    };

    class TextParticle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 1.5 + 0.5;
        this.brightness = 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.fadeRate = 0.015 + Math.random() * 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.fadeRate;
        if (this.alpha < 0) this.alpha = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class BackgroundParticle {
      constructor() {
        this.anchorX = Math.random() * canvas.width;
        this.anchorY = Math.random() * canvas.height;
        this.orbitRadius = Math.random() * 40 + 10;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
        this.clusterFactor = 0.05;

        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.x = this.anchorX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.anchorY + Math.sin(this.angle) * this.orbitRadius;
      }

      update() {
        this.angle += this.rotationSpeed;
        this.x = this.anchorX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.anchorY + Math.sin(this.angle) * this.orbitRadius;

        this.x += (this.anchorX - this.x) * this.clusterFactor * 0.05;
        this.y += (this.anchorY - this.y) * this.clusterFactor * 0.05;

        const dx = this.x - mouse.current.x;
        const dy = this.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 60;
        if (dist < radius) {
          const angle = Math.atan2(dy, dx);
          const force = (radius - dist) / radius;
          this.x += Math.cos(angle) * force * 2;
          this.y += Math.sin(angle) * force * 2;
        }

        if (mouse.current.click && dist < 80) {
          this.angle += (Math.random() - 0.5) * 1;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const generateTextParticles = (text) => {
      textParticles = [];
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      // Base font size calculation
      const fontSize = Math.min(Math.max(window.innerWidth / 10, 100), 300);
      
      // Adjust font size based on width
      let adjustedFontSize = fontSize;
      let adjustedSpacing = fontSize * 0.3;
      
      if (window.innerWidth < 640) { // sm breakpoint
        adjustedFontSize = fontSize * 0.5;
        adjustedSpacing = fontSize * 0.1;
      } else if (window.innerWidth < 768) { // md breakpoint
        adjustedFontSize = fontSize * 0.7;
        adjustedSpacing = fontSize * 0.25;
      }

      tempCtx.font = `bold ${adjustedFontSize}px 'Geist', sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';
      tempCtx.fillStyle = '#ffffff';

      const letters = text.split('');
      const totalWidth = letters.reduce(
        (acc, char) => acc + tempCtx.measureText(char).width + adjustedSpacing,
        -adjustedSpacing
      );
      let currentX = canvas.width / 2 - totalWidth / 2;
      const centerY = canvas.height / 2;

      letters.forEach((char) => {
        tempCtx.fillText(char, currentX, centerY);
        currentX += tempCtx.measureText(char).width + adjustedSpacing;
      });

      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const particleSpacing = window.innerWidth < 640 ? 1 : 6;
      for (let y = 0; y < canvas.height; y += particleSpacing) {
        for (let x = 0; x < canvas.width; x += particleSpacing) {
          const index = (y * canvas.width + x) * 4;
          const alpha = imageData.data[index + 3];
          if (alpha > 128 && Math.random() < 0.6) {
            textParticles.push(new TextParticle(x, y));
          }
        }
      }
    };

    const generateBackgroundParticles = () => {
      backgroundParticles = [];
      const count = Math.floor(canvas.width / 10);
      for (let i = 0; i < count; i++) {
        backgroundParticles.push(new BackgroundParticle());
      }
    };

    const animate = (timestamp) => {
      const deltaTime = timestamp - lastTime;
      if (deltaTime > interval) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        backgroundParticles.forEach((p) => {
          p.update();
          p.draw();
        });

        textParticles.forEach((p) => {
          p.update();
          p.draw();
        });

        textParticles = textParticles.filter(p => p.alpha > 0);
        lastTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const updateText = () => {
      if (isAdding.current) {
        currentIndex.current++;
        if (currentIndex.current >= fullText.length) {
          currentIndex.current = fullText.length;
          textRef.current = fullText;
          isAdding.current = false;
          setTimeout(() => {
            updateText(); // start deleting after pause
          }, 2000);
          return;
        }
      } else {
        currentIndex.current--;
        if (currentIndex.current <= 0) {
          currentIndex.current = 0;
          isAdding.current = true;
          setTimeout(() => {
            updateText(); // restart adding after pause
          }, 800);
          return;
        }
      }
      textRef.current = fullText.slice(0, currentIndex.current);
      generateTextParticles(textRef.current);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    });
    canvas.addEventListener('mousedown', () => {
      mouse.current.click = true;
    });
    canvas.addEventListener('mouseup', () => {
      mouse.current.click = false;
    });

    animationFrameId = requestAnimationFrame(animate);
    const textInterval = setInterval(updateText, 350);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <footer className="relative left-0 w-full bg-gradient-to-t from-black/90 to-transparent backdrop-blur-sm mt-8 sm:mt-12">
      <canvas
        ref={canvasRef}
        className="w-full h-[180px] sm:h-[220px] md:h-[250px]"
        style={{ opacity: 0.95 }}
      />
      <div className="border-t border-white/30 w-[95%] sm:w-[90%] md:w-[85%] mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 py-3 text-white text-xs sm:text-sm bg-black/80">
        <div className="flex items-center gap-3 sm:gap-4 text-base sm:text-lg">
          <a 
            href="https://github.com/SumitDutta007" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-200"
          >
            <FaGithub className="hover:text-gray-400" />
          </a>
          <a 
            href="https://www.linkedin.com/in/sumit-dutta007/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform duration-200"
          >
            <FaLinkedin className="hover:text-blue-400" />
          </a>
        </div>
        <div className="flex items-center gap-1 mt-2 md:mt-0 text-center">
          <FaRegCopyright /> 
          <span className="whitespace-nowrap">2025 TutorlyAI. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default AnimatedFooter;
