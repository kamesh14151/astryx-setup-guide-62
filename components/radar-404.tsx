'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ThemeToggle} from '@/components/theme-toggle';

interface Blip {
  id: number;
  r: number; // normalized radius (0 to 1)
  theta: number; // angle in radians (0 to 2*PI)
  label: string;
  intensity: number; // current glow intensity (0 to 1)
  lastHit: number;
}

export default function Radar404() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mousePos, setMousePos] = useState<{x: number; y: number; active: boolean}>({
    x: 0,
    y: 0,
    active: false,
  });
  const [telemetry, setTelemetry] = useState({
    bearing: '045°',
    range: '0.0 km',
    sweepAngle: 0,
    sector: 'ALPHA-0',
    contacts: 4,
  });

  // Persistent blip contacts
  const blipsRef = useRef<Blip[]>([
    {id: 1, r: 0.38, theta: 0.8, label: 'CONTACT_A', intensity: 0, lastHit: 0},
    {id: 2, r: 0.65, theta: 2.3, label: 'ECHO_LOST', intensity: 0, lastHit: 0},
    {id: 3, r: 0.82, theta: 3.9, label: 'SIGNAL_404', intensity: 0, lastHit: 0},
    {id: 4, r: 0.52, theta: 5.1, label: 'NULL_BEACON', intensity: 0, lastHit: 0},
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;
    const sweepSpeed = 0.022; // speed of rotation

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = Math.min(rect.width, 520);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const rect = canvas.getBoundingClientRect();
      const size = rect.width;
      const center = size / 2;
      const maxRadius = center - 20;

      ctx.clearRect(0, 0, size, size);

      // Color scheme based on dark/light
      const primaryColor = isDark ? '#10b981' : '#059669'; // Emerald phosphor
      const beamColor = isDark ? 'rgba(16, 185, 129,' : 'rgba(5, 150, 105,';
      const gridStroke = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.10)';
      const textStroke = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.50)';

      // 1. Radar Outer Housing and Glow
      const bgGrad = ctx.createRadialGradient(center, center, 0, center, center, maxRadius);
      if (isDark) {
        bgGrad.addColorStop(0, 'rgba(16, 185, 129, 0.04)');
        bgGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.02)');
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      } else {
        bgGrad.addColorStop(0, 'rgba(5, 150, 105, 0.05)');
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0.03)');
      }
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(center, center, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer bezel ring
      ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Concentric Range Rings
      const ringSteps = [0.25, 0.5, 0.75, 1];
      ringSteps.forEach((step, idx) => {
        const r = maxRadius * step;
        ctx.beginPath();
        ctx.strokeStyle = idx === ringSteps.length - 1 ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.3)') : gridStroke;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.arc(center, center, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring distance labels
        ctx.fillStyle = textStroke;
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${(step * 400).toFixed(0)}km`, center + 5, center - r + 12);
      });

      // 3. Radial Azimuth Lines (Crosshairs and 45-degree radials)
      const azimuthAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
      azimuthAngles.forEach(rad => {
        ctx.beginPath();
        ctx.strokeStyle = gridStroke;
        ctx.lineWidth = 1;
        ctx.moveTo(center - Math.cos(rad) * maxRadius, center - Math.sin(rad) * maxRadius);
        ctx.lineTo(center + Math.cos(rad) * maxRadius, center + Math.sin(rad) * maxRadius);
        ctx.stroke();
      });

      // Cardinal direction ticks & labels
      const cardinals = [
        {label: 'N', angle: -Math.PI / 2},
        {label: 'E', angle: 0},
        {label: 'S', angle: Math.PI / 2},
        {label: 'W', angle: Math.PI},
      ];
      cardinals.forEach(c => {
        const x = center + Math.cos(c.angle) * (maxRadius + 12);
        const y = center + Math.sin(c.angle) * (maxRadius + 12);
        ctx.fillStyle = isDark ? '#ffffff' : '#09090b';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.label, x, y);
      });

      // 4. Radar Sweep Sector Beam (Trailing Phosphor Glow)
      const sweepTailLength = Math.PI / 3; // 60 degrees tail
      const trailSteps = 30;
      for (let i = 0; i < trailSteps; i++) {
        const fraction = i / trailSteps;
        const currentA = angle - sweepTailLength * (1 - fraction);
        const nextA = angle - sweepTailLength * (1 - (i + 1) / trailSteps);
        const alpha = Math.pow(fraction, 2.5) * (isDark ? 0.22 : 0.15);

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, maxRadius, currentA, nextA);
        ctx.closePath();
        ctx.fillStyle = `${beamColor} ${alpha})`;
        ctx.fill();
      }

      // Sweep Leading Edge Line
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(angle) * maxRadius, center + Math.sin(angle) * maxRadius);
      ctx.strokeStyle = isDark ? '#6ee7b7' : '#059669';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = isDark ? 10 : 4;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // 5. Update and Draw Blips (Contacts)
      blipsRef.current.forEach(blip => {
        const blipX = center + Math.cos(blip.theta) * (blip.r * maxRadius);
        const blipY = center + Math.sin(blip.theta) * (blip.r * maxRadius);

        // Check if sweep passes blip
        const normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const normBlip = ((blip.theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const diff = (normAngle - normBlip + Math.PI * 2) % (Math.PI * 2);

        if (diff < 0.08) {
          blip.intensity = 1;
          blip.lastHit = Date.now();
        } else {
          blip.intensity = Math.max(0, blip.intensity - 0.008);
        }

        if (blip.intensity > 0.05) {
          // Glow halo
          ctx.beginPath();
          ctx.arc(blipX, blipY, 6 + (1 - blip.intensity) * 8, 0, Math.PI * 2);
          ctx.strokeStyle = `${beamColor} ${blip.intensity * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Core dot
          ctx.beginPath();
          ctx.arc(blipX, blipY, 3, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${blip.intensity})` : `rgba(5, 150, 105, ${blip.intensity})`;
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Blip tag
          ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${blip.intensity * 0.75})` : `rgba(0, 0, 0, ${blip.intensity * 0.75})`;
          ctx.font = '8px monospace';
          ctx.fillText(blip.label, blipX + 8, blipY - 4);
        }
      });

      // 6. Interactive Mouse Crosshair / Target Lock
      if (mousePos.active) {
        const dx = mousePos.x - center;
        const dy = mousePos.y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= maxRadius) {
          // Reticle
          ctx.save();
          ctx.strokeStyle = isDark ? 'rgba(239, 68, 68, 0.85)' : 'rgba(220, 38, 38, 0.85)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);

          // Crosshair lines
          ctx.beginPath();
          ctx.moveTo(mousePos.x - 12, mousePos.y);
          ctx.lineTo(mousePos.x + 12, mousePos.y);
          ctx.moveTo(mousePos.x, mousePos.y - 12);
          ctx.lineTo(mousePos.x, mousePos.y + 12);
          ctx.stroke();

          // Target circle
          ctx.beginPath();
          ctx.setLineDash([]);
          ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2);
          ctx.stroke();

          // Text coordinates
          const brg = Math.round((((Math.atan2(dy, dx) * 180) / Math.PI + 450) % 360));
          const rng = Math.round((dist / maxRadius) * 400);
          ctx.fillStyle = isDark ? '#ef4444' : '#dc2626';
          ctx.font = '9px monospace';
          ctx.fillText(`TARGET: [${brg}° / ${rng}km]`, mousePos.x + 12, mousePos.y + 14);
          ctx.restore();
        }
      }

      // Center Origin Beacon
      ctx.beginPath();
      ctx.arc(center, center, 3, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Advance sweep angle
      angle += sweepSpeed;
      if (angle >= Math.PI * 2) {
        angle = 0;
      }

      // Update telemetry display state periodically
      const deg = Math.round((((angle * 180) / Math.PI + 450) % 360));
      setTelemetry(prev => ({
        ...prev,
        sweepAngle: deg,
        bearing: `${String(deg).padStart(3, '0')}°`,
        sector: `SEC-${Math.floor(deg / 90) + 1}`,
      }));

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [mousePos]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({x, y, active: true});
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({...prev, active: false}));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const center = rect.width / 2;
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = center - 20;

    if (dist <= maxRadius) {
      const theta = Math.atan2(dy, dx);
      // Spawn new ephemeral contact
      blipsRef.current.push({
        id: Date.now(),
        r: dist / maxRadius,
        theta,
        label: `PING_${Math.floor(dist)}`,
        intensity: 1,
        lastHit: Date.now(),
      });
      // Keep list under 10
      if (blipsRef.current.length > 10) {
        blipsRef.current.shift();
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col justify-between overflow-x-hidden transition-colors selection:bg-neutral-800 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border/60 backdrop-blur-md bg-background/80 sticky top-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
            <svg
              className="h-4 w-4 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
              <circle cx="12" cy="12" r="2" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wider uppercase text-foreground">
                RADAR-SYS // 404
              </span>
              <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-500 border border-red-500/20">
                SIGNAL LOST
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Sector Coordinates Unreachable &bull; Deep Space Scanner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick links */}
          <Link
            href="/landing"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-card">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Hub
          </Link>
          <Link
            href="/gpa"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-card">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 2.18a2 2 0 0 0-1.66 0L2.6 10.084a1 1 0 0 0 0 1.832l8.57 7.904a2 2 0 0 0 1.66 0l8.57-7.904a1 1 0 0 0 .02-.994z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            GPA
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* Radar Scanner Visual Block (React Bits Pro 404-7 Style) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2">
            <div
              ref={containerRef}
              className="relative flex items-center justify-center p-2 sm:p-4 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-md shadow-2xl w-full max-w-[460px] aspect-square">
              {/* Radar status overlay badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 border border-border text-[10px] font-mono backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>SCAN: {telemetry.bearing}</span>
              </div>

              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/80 border border-border text-[10px] font-mono text-muted-foreground backdrop-blur-sm">
                <span>FREQ: 404.0 MHz</span>
              </div>

              {/* Canvas Radar */}
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleCanvasClick}
                className="cursor-crosshair rounded-full transition-transform active:scale-[0.99]"
                title="Click anywhere on the radar to deploy an echo ping"
              />

              {/* Bottom telemetry strip inside radar card */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between px-3 py-1.5 rounded-lg bg-background/80 border border-border text-[10px] font-mono text-muted-foreground backdrop-blur-sm">
                <span>ZONE: {telemetry.sector}</span>
                <span className="text-emerald-500 font-semibold">CLICK TO PING</span>
                <span>CONTACTS: {blipsRef.current.length}</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground font-mono text-center">
              Target coordinate does not respond to active radar interrogation.
            </p>
          </div>

          {/* Left Text / Action Block */}
          <div className="lg:col-span-6 flex flex-col items-start text-left order-2 lg:order-1">
            {/* 404 Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-mono font-medium mb-4">
              <svg
                className="h-3.5 w-3.5 animate-bounce"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>ERROR 404 // TARGET_LOST</span>
            </div>

            {/* Main Glitch / Modern 404 Title */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-none mb-3 font-mono">
              404
            </h1>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
              Sector Out of Radar Range
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 max-w-lg">
              The frequency or coordinate you attempted to scan does not exist. It may have been
              decommissioned, relocated to another orbit, or corrupted in deep space.
            </p>

            {/* Diagnostics HUD Box */}
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card/80 p-4 mb-8 font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">SCANNER PROTOCOL:</span>
                <span className="text-foreground font-medium">RADAR_SWEEP_v7</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">REQUESTED VECTOR:</span>
                <span className="text-red-400 font-medium">0x00000404 (UNRESOLVED)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DIAGNOSTIC STATUS:</span>
                <span className="text-emerald-500 font-medium">ANTENNA READY &bull; NO CARRIER</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/landing"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background font-medium text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Return to Hub
              </Link>

              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-colors">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Previous Page
              </button>

              <Link
                href="/gpa"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-colors">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 2.18a2 2 0 0 0-1.66 0L2.6 10.084a1 1 0 0 0 0 1.832l8.57 7.904a2 2 0 0 0 1.66 0l8.57-7.904a1 1 0 0 0 .02-.994z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                GPA Calculator
              </Link>

              <Link
                href="/kanban"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-colors">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M8 7v7" />
                  <path d="M12 7v4" />
                  <path d="M16 7v9" />
                </svg>
                Kanban
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 py-4 px-6 text-center text-xs text-muted-foreground font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AST-RADAR SCOPE &bull; REACT BITS 404-7 COMPLIANT</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Gallery
            </Link>
            <Link href="/landing" className="hover:text-foreground transition-colors">
              Hub
            </Link>
            <Link href="/upload" className="hover:text-foreground transition-colors">
              Upload
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
