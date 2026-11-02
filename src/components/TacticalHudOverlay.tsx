import React, { useRef, useEffect } from 'react';
import { DroneTarget, OpticalFilterMode, TargetStatus } from '../types/tactical';
import { Crosshair, ShieldAlert, Zap, Radio, Target, AlertTriangle } from 'lucide-react';

interface TacticalHudOverlayProps {
  targets: DroneTarget[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string) => void;
  onQuickEngage: (id: string) => void;
  onQuickAiAnalyze: (target: DroneTarget) => void;
  opticalFilter: OpticalFilterMode;
  showGrid: boolean;
  showTrajectory: boolean;
  activeCountermeasure: boolean;
  videoWidth: number;
  videoHeight: number;
}

export const TacticalHudOverlay: React.FC<TacticalHudOverlayProps> = ({
  targets,
  selectedTargetId,
  onSelectTarget,
  onQuickEngage,
  onQuickAiAnalyze,
  opticalFilter,
  showGrid,
  showTrajectory,
  activeCountermeasure,
  videoWidth,
  videoHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw tactical Mil-Dot grid and trajectory prediction vectors on overlay canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    const hudColor =
      opticalFilter === 'NVG_GREEN'
        ? 'rgba(34, 197, 94, 0.7)'
        : opticalFilter === 'FLIR_IRONBOW'
        ? 'rgba(250, 204, 21, 0.75)'
        : 'rgba(56, 189, 248, 0.7)';

    const faintColor =
      opticalFilter === 'NVG_GREEN'
        ? 'rgba(34, 197, 94, 0.15)'
        : opticalFilter === 'FLIR_IRONBOW'
        ? 'rgba(250, 204, 21, 0.15)'
        : 'rgba(56, 189, 248, 0.15)';

    if (showGrid) {
      // Draw Tactical Grid Lines
      ctx.strokeStyle = faintColor;
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 60; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 50; y < h; y += 70) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Central Optical Crosshairs with Mil-Dot ticks
      ctx.strokeStyle = hudColor;
      ctx.lineWidth = 1.5;

      // Center crosshair ring
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Horizontal crosshair ticks
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy);
      ctx.lineTo(cx - 36, cy);
      ctx.moveTo(cx + 36, cy);
      ctx.lineTo(cx + 180, cy);
      ctx.stroke();

      // Mil-Dots along horizontal axis
      for (let i = -140; i <= 140; i += 35) {
        if (Math.abs(i) > 30) {
          ctx.beginPath();
          ctx.moveTo(cx + i, cy - 5);
          ctx.lineTo(cx + i, cy + 5);
          ctx.stroke();
        }
      }

      // Vertical crosshair with elevation ladder ticks
      ctx.beginPath();
      ctx.moveTo(cx, cy - 140);
      ctx.lineTo(cx, cy - 36);
      ctx.moveTo(cx, cy + 36);
      ctx.lineTo(cx, cy + 140);
      ctx.stroke();

      for (let j = -120; j <= 120; j += 30) {
        if (Math.abs(j) > 30) {
          ctx.beginPath();
          ctx.moveTo(cx - 6, cy + j);
          ctx.lineTo(cx + 6, cy + j);
          ctx.stroke();
        }
      }

      // Corner Tactical Brackets for Viewport
      const cornerLen = 24;
      ctx.lineWidth = 2;
      ctx.strokeStyle = hudColor;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(16, 16 + cornerLen);
      ctx.lineTo(16, 16);
      ctx.lineTo(16 + cornerLen, 16);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(w - 16 - cornerLen, 16);
      ctx.lineTo(w - 16, 16);
      ctx.lineTo(w - 16, 16 + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(16, h - 16 - cornerLen);
      ctx.lineTo(16, h - 16);
      ctx.lineTo(16 + cornerLen, h - 16);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(w - 16 - cornerLen, h - 16);
      ctx.lineTo(w - 16, h - 16);
      ctx.lineTo(w - 16, h - 16 - cornerLen);
      ctx.stroke();
    }

    // Trajectory prediction vectors for each target
    if (showTrajectory) {
      targets.forEach((target) => {
        if (target.status === 'NEUTRALIZED') return;

        const tx = target.x * w;
        const ty = target.y * h;

        // Calculate velocity heading vector
        const rad = ((target.headingDeg - 90) * Math.PI) / 180;
        const speedScale = (target.velocityKmh / 100) * 90;
        const leadX = tx + Math.cos(rad) * speedScale;
        const leadY = ty + Math.sin(rad) * speedScale;

        // Draw predicted lead vector
        ctx.strokeStyle = target.threatScore > 80 ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(leadX, leadY);
        ctx.stroke();

        // Lead intercept point circle
        ctx.beginPath();
        ctx.arc(leadX, leadY, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label lead time
        ctx.fillStyle = target.threatScore > 80 ? '#fca5a5' : '#fde68a';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`+2.5s T-VEC`, leadX + 8, leadY + 3);
      });
    }

    // Neutralization engagement beam / disruption wave
    if (activeCountermeasure && selectedTargetId) {
      const selected = targets.find((t) => t.id === selectedTargetId);
      if (selected) {
        const tx = selected.x * w;
        const ty = selected.y * h;

        // Directed energy beam from bottom center of sensor to target
        const beamGrad = ctx.createLinearGradient(cx, h, tx, ty);
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        beamGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
        beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.95)');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, h);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        // High frequency disruption shockwaves
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        for (let r = 10; r < 45; r += 10) {
          ctx.beginPath();
          ctx.arc(tx, ty, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }, [targets, selectedTargetId, opticalFilter, showGrid, showTrajectory, activeCountermeasure, videoWidth, videoHeight]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Canvas for Grid, Crosshair, Lead Vectors, and Beam */}
      <canvas
        ref={canvasRef}
        width={videoWidth}
        height={videoHeight}
        className="absolute inset-0 w-full h-full"
      />

      {/* Top Heading Tape (Compass Azimuth Bar) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-1 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded text-[11px] font-mono text-cyan-300">
        <span className="text-zinc-500">330°</span>
        <span className="text-zinc-400">345°</span>
        <span className="text-red-400 font-bold px-1 bg-red-950/60 border border-red-500/40 rounded">
          000° [N]
        </span>
        <span className="text-cyan-400 font-bold">015°</span>
        <span className="text-amber-400 font-bold">030° [NE]</span>
        <span className="text-zinc-400">045°</span>
        <span className="text-zinc-500">060°</span>
        <div className="h-3 w-px bg-cyan-500/40 mx-1" />
        <span className="text-emerald-400 font-semibold tracking-wider">
          MGRS: 32U MU 4821 7291
        </span>
      </div>

      {/* Interactive Bounding Boxes for Targets */}
      {targets.map((target) => {
        const isSelected = target.id === selectedTargetId;
        const isNeutralized = target.status === 'NEUTRALIZED';
        const isCritical = target.threatScore >= 80;

        const leftPct = target.bbox.x * 100;
        const topPct = target.bbox.y * 100;
        const widthPct = target.bbox.width * 100;
        const heightPct = target.bbox.height * 100;

        const borderColor = isNeutralized
          ? 'border-zinc-500'
          : isCritical
          ? 'border-red-500'
          : 'border-amber-400';

        const textColor = isNeutralized
          ? 'text-zinc-400'
          : isCritical
          ? 'text-red-400'
          : 'text-amber-300';

        const bgGlow = isSelected
          ? isCritical
            ? 'bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
            : 'bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
          : 'bg-black/20';

        return (
          <div
            key={target.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTarget(target.id);
            }}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${Math.max(widthPct, 12)}%`,
              height: `${Math.max(heightPct, 14)}%`,
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-150 border ${borderColor} ${bgGlow} ${
              isSelected ? 'ring-2 ring-cyan-400' : ''
            }`}
          >
            {/* Tactical Corner Brackets */}
            <div className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${borderColor}`} />
            <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${borderColor}`} />
            <div className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${borderColor}`} />
            <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${borderColor}`} />

            {/* Target Reticle Center Dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-2 h-2 rounded-full ${
                  isNeutralized ? 'bg-zinc-500' : isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>

            {/* Target HUD Header Badge */}
            <div
              className={`absolute -top-6 left-0 flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight whitespace-nowrap ${
                isNeutralized
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                  : isCritical
                  ? 'bg-red-950/90 text-red-200 border border-red-500 animate-target-lock'
                  : 'bg-amber-950/90 text-amber-200 border border-amber-500'
              }`}
            >
              <Target className="w-3 h-3" />
              <span>{target.callsign}</span>
              <span className="text-[9px] px-1 rounded bg-black/50 text-white">
                {target.threatScore}%
              </span>
            </div>

            {/* Target Telemetry Float Box */}
            <div
              className={`absolute top-full left-0 mt-1 p-1.5 min-w-[170px] bg-black/85 backdrop-blur-md border ${borderColor} rounded text-[10px] font-mono leading-tight shadow-xl pointer-events-auto`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                <span className={`font-bold ${textColor}`}>
                  {isNeutralized ? 'NEUTRALIZED' : target.status}
                </span>
                <span className="text-zinc-400">{target.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-zinc-300">
                <div>
                  <span className="text-zinc-500">RNG:</span>{' '}
                  <span className="text-white font-semibold">{target.rangeMeters}m</span>
                </div>
                <div>
                  <span className="text-zinc-500">ALT:</span>{' '}
                  <span className="text-white font-semibold">{target.altitudeMeters}m</span>
                </div>
                <div>
                  <span className="text-zinc-500">SPD:</span>{' '}
                  <span className="text-white font-semibold">{target.velocityKmh} km/h</span>
                </div>
                <div>
                  <span className="text-zinc-500">BRG:</span>{' '}
                  <span className="text-white font-semibold">{target.bearingDeg}°</span>
                </div>
              </div>

              {/* Payload warning indicator */}
              <div className="mt-1 pt-1 border-t border-white/10 text-[9px] text-zinc-300 truncate">
                <span className="text-red-400 font-bold">LOAD:</span> {target.payloadType}
              </div>

              {/* Quick Actions directly inside Target HUD */}
              <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAiAnalyze(target);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white rounded text-[9px] font-bold uppercase transition-colors"
                  title="Run Gemini Deep Threat AI Analysis on this drone"
                >
                  <ShieldAlert className="w-2.5 h-2.5 text-cyan-400" />
                  <span>AI Intel</span>
                </button>

                {!isNeutralized && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickEngage(target.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white rounded text-[9px] font-bold uppercase transition-colors"
                    title="Engage Countermeasures (RF Jammer / EMP)"
                  >
                    <Zap className="w-2.5 h-2.5 text-red-400" />
                    <span>Engage</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom HUD System Telemetry Bar */}
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> SENSOR: EO/IR-1 ACTIVE
          </span>
          <span className="text-zinc-600">|</span>
          <span>MODE: {opticalFilter.replace('_', ' ')}</span>
          <span className="text-zinc-600">|</span>
          <span>TARGETS: {targets.filter((t) => t.status !== 'NEUTRALIZED').length} ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-semibold">TRACKING: AUTO-CORRELATOR ON</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">LATENCY: 12ms</span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400 font-bold">GRID: WGS-84 / UTM</span>
        </div>
      </div>
    </div>
  );
};
