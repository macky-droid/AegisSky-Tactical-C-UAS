import React, { useState } from 'react';
import { DroneTarget, CountermeasureState } from '../types/tactical';
import {
  Zap,
  Radio,
  Compass,
  Cpu,
  Shield,
  Crosshair,
  AlertOctagon,
  Flame,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface CountermeasuresConsoleProps {
  selectedTarget: DroneTarget | null;
  onDeployCountermeasure: (type: 'JAMMER' | 'SPOOF' | 'EMP' | 'NET') => void;
  isEngaging: boolean;
  autoDefend: boolean;
  onToggleAutoDefend: () => void;
}

export const CountermeasuresConsole: React.FC<CountermeasuresConsoleProps> = ({
  selectedTarget,
  onDeployCountermeasure,
  isEngaging,
  autoDefend,
  onToggleAutoDefend,
}) => {
  const [activeBands, setActiveBands] = useState<string[]>([
    '2.4 GHz ISM',
    '5.8 GHz VTX',
    '915 MHz ELRS',
  ]);
  const [empCharge, setEmpCharge] = useState<number>(98);

  const toggleBand = (band: string) => {
    setActiveBands((prev) =>
      prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band]
    );
  };

  const isTargetNeutralized = selectedTarget?.status === 'NEUTRALIZED';

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-red-500/30 rounded-lg p-3 text-zinc-300 font-mono text-xs overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-bold tracking-wider text-red-400">
            ACTIVE COUNTERMEASURE SUITE (C-UAS)
          </span>
        </div>

        {/* Autonomous Intercept Toggle */}
        <div
          onClick={onToggleAutoDefend}
          className="flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-white/15 rounded cursor-pointer hover:border-red-500/50 transition-colors"
          title="Enable autonomous countermeasure firing when threat score exceeds 90"
        >
          <span className="text-[10px] text-zinc-400">AUTO-ENGAGE:</span>
          {autoDefend ? (
            <span className="text-red-400 font-bold text-[10px] flex items-center gap-1">
              ARMED <ToggleRight className="w-4 h-4 text-red-500" />
            </span>
          ) : (
            <span className="text-zinc-500 font-bold text-[10px] flex items-center gap-1">
              MANUAL <ToggleLeft className="w-4 h-4 text-zinc-600" />
            </span>
          )}
        </div>
      </div>

      {/* Target Engagement Status Lock */}
      <div className="p-2.5 rounded bg-black/70 border border-white/10 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair
            className={`w-4 h-4 ${
              selectedTarget
                ? isTargetNeutralized
                  ? 'text-zinc-500'
                  : 'text-red-500 animate-spin'
                : 'text-zinc-600'
            }`}
          />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">FIRE CONTROL SOLUTION</div>
            <div className="font-bold text-white text-xs">
              {selectedTarget
                ? `${selectedTarget.callsign} (${selectedTarget.id})`
                : 'NO TARGET LOCKED'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase">SOLUTION STATUS</div>
          <div
            className={`font-bold text-xs ${
              isTargetNeutralized
                ? 'text-zinc-400'
                : isEngaging
                ? 'text-red-400 animate-pulse'
                : selectedTarget
                ? 'text-emerald-400'
                : 'text-zinc-500'
            }`}
          >
            {isTargetNeutralized
              ? 'TARGET DESTROYED'
              : isEngaging
              ? 'TRANSMITTING BURST...'
              : selectedTarget
              ? 'FIRING SOLUTION VALID'
              : 'AWAITING LOCK'}
          </div>
        </div>
      </div>

      {/* 4 Countermeasure Systems */}
      <div className="space-y-2.5 flex-1">
        {/* System 1: Multi-Band Directional RF Jammer */}
        <div className="p-2.5 rounded bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              1. HIGH-GAIN MULTI-BAND RF JAMMER
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-bold">
              450W EIRP
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 mb-2">
            Disrupts C2 uplink and FPV video link simultaneously, triggering failsafe return-to-home or hover forced landing.
          </p>

          {/* Jammer Frequency Selectors */}
          <div className="flex flex-wrap gap-1 mb-2">
            {['2.4 GHz ISM', '5.8 GHz VTX', '915 MHz ELRS', '433 MHz UHF', 'GNSS L1/L2'].map(
              (band) => {
                const isActive = activeBands.includes(band);
                return (
                  <button
                    key={band}
                    onClick={() => toggleBand(band)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors border ${
                      isActive
                        ? 'bg-cyan-900/80 text-cyan-200 border-cyan-400 font-bold'
                        : 'bg-black/40 text-zinc-500 border-white/5'
                    }`}
                  >
                    {band}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => onDeployCountermeasure('JAMMER')}
            disabled={!selectedTarget || isTargetNeutralized || isEngaging}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-950"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>TRANSMIT RF DISRUPTION BURST</span>
          </button>
        </div>

        {/* System 2: Directed EMP / Microwave Pulse */}
        <div className="p-2.5 rounded bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              2. HIGH-POWER MICROWAVE / DIRECTED EMP
            </span>
            <span className="text-[10px] text-amber-400 font-bold">
              CAPACITOR: {empCharge}%
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 mb-2">
            Fires focused electromagnetic wavefront into target ESC and autopilot circuits. Immediate kinetic crash.
          </p>

          <button
            onClick={() => onDeployCountermeasure('EMP')}
            disabled={!selectedTarget || isTargetNeutralized || isEngaging || empCharge < 20}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-950"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>DISCHARGE DIRECTED EMP</span>
          </button>
        </div>

        {/* System 3: Pneumatic Kinetic Net Cannon */}
        <div className="p-2.5 rounded bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              3. PNEUMATIC KEVLAR NET CANNON
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
              READY (350M MAX)
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 mb-2">
            Launches compressed-gas capture net with ballistic weights. Entangles rotors without detonating payload for forensics.
          </p>

          <button
            onClick={() => onDeployCountermeasure('NET')}
            disabled={!selectedTarget || isTargetNeutralized || isEngaging}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-950"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>FIRE KINETIC ROTOR NET</span>
          </button>
        </div>

        {/* System 4: GNSS Spoofing & Geofence Injection */}
        <div className="p-2.5 rounded bg-zinc-900/60 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              4. GNSS GEOFENCE SPOOFING INJECTION
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-purple-950 text-purple-300 border border-purple-500/40 rounded font-bold">
              SPOOF ON
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 mb-2">
            Overpowers satellite GPS L1/L2 signals with spoofed ephemeris, forcing autopilot to land outside safe zone.
          </p>

          <button
            onClick={() => onDeployCountermeasure('SPOOF')}
            disabled={!selectedTarget || isTargetNeutralized || isEngaging}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-700 hover:bg-purple-600 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-950"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>INJECT GEOFENCE FORCED-LAND</span>
          </button>
        </div>
      </div>
    </div>
  );
};
