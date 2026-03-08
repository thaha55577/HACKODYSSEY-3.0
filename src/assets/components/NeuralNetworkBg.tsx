import { useEffect, useRef } from 'react';

const NeuralNetworkBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 20; // Drastically reduced to prevent any js-based layout lag
    const connectionDistance = 180;
    const connectionDistanceSq = connectionDistance * connectionDistance; // Pre-calculated
    const mouse = { x: -1000, y: -1000, radius: 180, radiusSq: 180 * 180 };

    class Particle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.z = Math.random() * 2;
        this.vx = (Math.random() - 0.5) * (0.6 - this.z * 0.2);
        this.vy = (Math.random() - 0.5) * (0.6 - this.z * 0.2);
        this.size = (Math.random() * 1.5 + 0.5) * (1.5 - this.z * 0.4);
        this.color = '#22d3ee';
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < mouse.radiusSq) {
          const distance = Math.sqrt(distanceSq);
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.globalAlpha = 1 - this.z * 0.4;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.globalAlpha = 1;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height);
        particles[i].draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < connectionDistanceSq) {
            const opacity = (1 - distanceSq / connectionDistanceSq) * (1 - (particles[i].z + particles[j].z) * 0.2);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.5})`;
            ctx.lineWidth = opacity * 1.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();

            // Higher efficiency pulse, reduced frequency
            if (i % 9 === 0 && Math.random() > 0.998) {
              const pulseT = (Date.now() % 1000) / 1000;
              const pulseX = particles[i].x + (particles[j].x - particles[i].x) * pulseT;
              const pulseY = particles[i].y + (particles[j].y - particles[i].y) * pulseT;
              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = '#fff';
              ctx.fill();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="neural-net-container">
      {/* Flattened background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="text-[22vw] font-black text-white/[0.04] tracking-[-0.1em] select-none leading-none uppercase">
          ACM
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-90 z-10"
      />

      <div className="neural-net-grid opacity-[0.12] z-0" />
    </div>
  );
};

export default NeuralNetworkBg;
