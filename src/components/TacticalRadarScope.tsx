import React, { useRef, useEffect } from 'react';
import { DroneTarget } from '../types/tactical';
import { soundManager } from '../utils/audioAlerts';

interface TacticalRadarScopeProps {
  targets: DroneTarget[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  maxRangeMeters?: number;
}

export const TacticalRadarScope: React.FC<TacticalRadarScopeProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  maxRangeMeters = 1500,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef<number>(0);
  const lastPingSectorRef = useRef<number>(-1);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      angleRef.current = (angleRef.current + 0.035) % (Math.PI * 2);
      const sweepAngle = angleRef.current;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = (Math.min(w, h) / 2) - 18;

      // Dark radar background with subtle CRT tint
      ctx.fillStyle = '#030a06';
      ctx.fillRect(0, 0, w, h);

      // Radar CRT grid rings
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 1;

      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((scale) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * scale, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.stroke();

      // Diagonal crosshairs (45 degree lines)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
      const diag = maxR * 0.7071;
      ctx.beginPath();
      ctx.moveTo(cx - diag, cy - diag);
      ctx.lineTo(cx + diag, cy + diag);
      ctx.moveTo(cx - diag, cy + diag);
      ctx.lineTo(cx + diag, cy - diag);
      ctx.stroke();

      // Critical Inner Defense Zone (< 300m)
      const innerRadius = (300 / maxRangeMeters) * maxR;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Restricted Perimeter No-Fly-Zone (NFZ Sector Wedge: 010° to 080°)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, (10 * Math.PI) / 180 - Math.PI / 2, (80 * Math.PI) / 180 - Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      // Azimuth Labels around the ring
      ctx.fillStyle = '#10b981';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cardinals = [
        { label: '000° [N]', angle: 0 },
        { label: '045°', angle: 45 },
        { label: '090° [E]', angle: 90 },
        { label: '135°', angle: 135 },
        { label: '180° [S]', angle: 180 },
        { label: '225°', angle: 225 },
        { label: '270° [W]', angle: 270 },
        { label: '315°', angle: 315 },
      ];

      cardinals.forEach(({ label, angle }) => {
        const rad = (angle * Math.PI) / 180 - Math.PI / 2;
        const lx = cx + Math.cos(rad) * (maxR + 10);
        const ly = cy + Math.sin(rad) * (maxR + 10);
        ctx.fillText(label, lx, ly);
      });

      // Range markers
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('300m (PERIMETER)', cx + 4, cy - innerRadius - 2);
      ctx.fillText(`${Math.round(maxRangeMeters * 0.5)}m`, cx + 4, cy - maxR * 0.5 - 2);
      ctx.fillText(`${maxRangeMeters}m (RADAR MAX)`, cx + 4, cy - maxR + 10);

      // Rotating Radar Sweep Beam (Pie wedge with fading gradient)
      const sweepSegments = 40;
      for (let i = 0; i < sweepSegments; i++) {
        const segAngle = sweepAngle - (i * 0.015);
        const alpha = (1 - i / sweepSegments) * 0.25;

        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(segAngle) * maxR, cy + Math.sin(segAngle) * maxR);
        ctx.stroke();
      }

      // Leading sharp sweep line
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.stroke();

      // Check for sweep ping sound trigger when beam hits targets
      const currentSector = Math.floor((sweepAngle / (Math.PI * 2)) * 4);
      if (currentSector !== lastPingSectorRef.current) {
        lastPingSectorRef.current = currentSector;
        // Ping when sweeping
        if (Math.random() > 0.4) {
          soundManager.playRadarPing();
        }
      }

      // Draw Target Blips
      targets.forEach((target) => {
        const isNeutralized = target.status === 'NEUTRALIZED';
        const isSelected = target.id === selectedTargetId;
        const isHostile = target.threatScore > 75;

        // Convert target bearing and range to radar polar coordinates
        // Bearing 0 = North (-90 deg in canvas space)
        const rad = (target.bearingDeg * Math.PI) / 180 - Math.PI / 2;
        const distRatio = Math.min(1.05, target.rangeMeters / maxRangeMeters);
        const bx = cx + Math.cos(rad) * (distRatio * maxR);
        const by = cy + Math.sin(rad) * (distRatio * maxR);

        // Blip Color
        const blipColor = isNeutralized
          ? '#6b7280'
          : isHostile
          ? '#ef4444'
          : target.threatLevel === 'HIGH'
          ? '#f59e0b'
          : '#10b981';

        // Blip Glow
        ctx.save();
        ctx.fillStyle = blipColor;
        ctx.shadowColor = blipColor;
        ctx.shadowBlur = isSelected ? 12 : 6;

        ctx.beginPath();
        ctx.arc(bx, by, isSelected ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing ring if critical target
        if (isHostile && !isNeutralized) {
          const pulse = (Date.now() % 1000) / 1000;
          ctx.strokeStyle = `rgba(239, 68, 68, ${1 - pulse})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(bx, by, 4 + pulse * 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Selected Reticle Ring
        if (isSelected) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(bx, by, 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Velocity vector trail
        const velRad = (target.headingDeg * Math.PI) / 180 - Math.PI / 2;
        const velLen = (target.velocityKmh / 100) * 22;
        ctx.strokeStyle = blipColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(velRad) * velLen, by + Math.sin(velRad) * velLen);
        ctx.stroke();

        // Target Tag Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${target.callsign} (${target.rangeMeters}m)`,
          bx + 8,
          by - 4
        );

        ctx.restore();
      });

      // Center Base Icon (Air Defense Command Center)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [targets, selectedTargetId, maxRangeMeters]);

  // Click on radar to acquire / select nearest target
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) / 2 - 18;

    let closestId: string | null = null;
    let minDist = 24; // Pixel threshold

    targets.forEach((target) => {
      const rad = (target.bearingDeg * Math.PI) / 180 - Math.PI / 2;
      const distRatio = Math.min(1.05, target.rangeMeters / maxRangeMeters);
      const bx = cx + Math.cos(rad) * (distRatio * maxR);
      const by = cy + Math.sin(rad) * (distRatio * maxR);

      const d = Math.hypot(clickX - bx, clickY - by);
      if (d < minDist) {
        minDist = d;
        closestId = target.id;
      }
    });

    if (closestId) {
      onSelectTarget(closestId);
      soundManager.playLockTone();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onClick={handleCanvasClick}
          className="rounded-full cursor-crosshair border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-black"
        />

        {/* Radar Corner Decals */}
        <div className="absolute top-1 left-2 text-[9px] font-mono text-emerald-400 font-bold">
          PPI 360° FMCW
        </div>
        <div className="absolute top-1 right-2 text-[9px] font-mono text-emerald-500">
          SWEEP: 4.2 RPM
        </div>
      </div>

      {/* Sector Threat Summary Bar */}
      <div className="w-full grid grid-cols-4 gap-1 mt-2 text-center text-[10px] font-mono">
        <div className="p-1 rounded bg-black/50 border border-white/10">
          <div className="text-zinc-500">SEC-N</div>
          <div className="text-red-400 font-bold">HOT</div>
        </div>
        <div className="p-1 rounded bg-black/50 border border-white/10">
          <div className="text-zinc-500">SEC-E</div>
          <div className="text-amber-400 font-bold">CAUTION</div>
        </div>
        <div className="p-1 rounded bg-black/50 border border-white/10">
          <div className="text-zinc-500">SEC-S</div>
          <div className="text-emerald-400 font-bold">CLEAR</div>
        </div>
        <div className="p-1 rounded bg-black/50 border border-white/10">
          <div className="text-zinc-500">SEC-W</div>
          <div className="text-emerald-400 font-bold">CLEAR</div>
        </div>
      </div>
    </div>
  );
};
