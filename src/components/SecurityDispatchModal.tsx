import React, { useState } from 'react';
import { DroneTarget, SecurityPersonnelUnit } from '../types/tactical';
import { soundManager } from '../utils/audioAlerts';
import {
  ShieldAlert,
  Send,
  Radio,
  CheckCircle2,
  Users,
  MapPin,
  X,
  FileDown,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface SecurityDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: DroneTarget | null;
  onConfirmDispatch: (details: {
    unitId: string;
    unitName: string;
    directive: string;
    priority: string;
  }) => void;
}

const SECURITY_UNITS: SecurityPersonnelUnit[] = [
  {
    id: 'UNIT-QRF-1',
    name: 'Perimeter QRF Mobile Team Alpha',
    callsign: 'WARHAMMER-1',
    role: 'Rapid Vehicle Intercept',
    status: 'READY',
    equipment: ['DroneGun Tactical RF Jammer', 'Handheld Direction Finder', 'Mobile Net Launcher'],
    currentSector: 'Sector Bravo (North Gate)',
    locationMGRS: '32U MU 4829 7298',
  },
  {
    id: 'UNIT-ADS-2',
    name: 'Air Defense Section 2 (Rooftop)',
    callsign: 'SENTINEL-ROOF',
    role: 'Fixed Perimeter Defense',
    status: 'READY',
    equipment: ['High-Power Multi-Band Directional Jammer', 'Compressed Air Net Cannon (300m)'],
    currentSector: 'Sector Alpha (Central Tower)',
    locationMGRS: '32U MU 4821 7291',
  },
  {
    id: 'UNIT-INTERCEPT-UAV',
    name: 'Kinetic Interceptor Drone Squadron',
    callsign: 'PEREGRINE-LEAD',
    role: 'Autonomous High-Speed Net Catch',
    status: 'READY',
    equipment: ['High-Velocity 140km/h Interceptor Drone', 'Pneumatic Rotor Entanglement Net'],
    currentSector: 'Helipad Echo',
    locationMGRS: '32U MU 4815 7280',
  },
  {
    id: 'UNIT-BASE-COMMAND',
    name: 'Base Tactical Operations Center (TOC)',
    callsign: 'AEGIS-COMMAND',
    role: 'Airspace Authority & RoE Clearance',
    status: 'READY',
    equipment: ['Command C2 Console', 'Automated Perimeter Sirens'],
    currentSector: 'Main Bunker',
    locationMGRS: '32U MU 4820 7290',
  },
];

export const SecurityDispatchModal: React.FC<SecurityDispatchModalProps> = ({
  isOpen,
  onClose,
  target,
  onConfirmDispatch,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>('UNIT-QRF-1');
  const [directive, setDirective] = useState<string>('IMMEDIATE_NEUTRALIZE_JAM');
  const [customNotes, setCustomNotes] = useState<string>('Target confirmed hostile. Clear perimeter personnel.');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  if (!isOpen) return null;

  const targetCallsign = target ? target.callsign : 'UNKNOWN HOSTILE';
  const targetId = target ? target.id : 'TRK-XXXX';
  const threatScore = target ? target.threatScore : 90;

  const handleTransmit = () => {
    setIsTransmitting(true);
    soundManager.playLockTone();

    setTimeout(() => {
      setIsTransmitting(false);
      setDispatchedSuccess(true);
      const unit = SECURITY_UNITS.find((u) => u.id === selectedUnitId);

      onConfirmDispatch({
        unitId: selectedUnitId,
        unitName: unit?.name || 'QRF Team Alpha',
        directive,
        priority: threatScore > 80 ? 'DEFCON 1' : 'DEFCON 2',
      });

      setTimeout(() => {
        setDispatchedSuccess(false);
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-zinc-950 border-2 border-red-500/60 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.3)] text-zinc-200 font-mono overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-red-950/80 border-b border-red-500/40">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider">
                EMERGENCY SECURITY PERSONNEL DISPATCH
              </h2>
              <p className="text-[10px] text-red-300">
                DEFCON 1: THREAT NEUTRALIZATION TRANSMISSION CONSOLE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Target Telemetry Card */}
          <div className="p-3 rounded-lg bg-black/60 border border-red-500/40 grid grid-cols-3 gap-2">
            <div>
              <div className="text-[10px] text-zinc-500">TARGET ACQUIRED</div>
              <div className="font-bold text-red-400 text-sm">{targetCallsign}</div>
              <div className="text-[10px] text-zinc-400">{targetId}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500">PERIMETER COORDS</div>
              <div className="font-bold text-white text-xs">32U MU 4821 7291</div>
              <div className="text-[10px] text-cyan-300">
                Alt: {target?.altitudeMeters ?? 45}m | Rng: {target?.rangeMeters ?? 420}m
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500">THREAT RATING</div>
              <div className="font-extrabold text-red-500 text-sm">{threatScore} / 100</div>
              <div className="text-[10px] text-amber-300 uppercase truncate">
                {target?.payloadType ?? 'Suspected Warhead'}
              </div>
            </div>
          </div>

          {/* Select Security Personnel Unit */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              ASSIGN SECURITY RESPONSE UNIT:
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {SECURITY_UNITS.map((unit) => {
                const isSelected = unit.id === selectedUnitId;
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    className={`p-2.5 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/50 text-white'
                        : 'border-white/10 bg-black/40 text-zinc-300 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-2">
                        <span>{unit.name}</span>
                        <span className="text-[9px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded">
                          {unit.callsign}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {unit.currentSector} • {unit.equipment.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                        {unit.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Neutralization Directive Selection */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              ACTION DIRECTIVE (RULES OF ENGAGEMENT):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'IMMEDIATE_NEUTRALIZE_JAM',
                  label: 'NON-KINETIC RF DISRUPT',
                  desc: 'Deploy high-gain jammer, force safe-landing',
                },
                {
                  id: 'KINETIC_NET_INTERCEPT',
                  label: 'NET CANNON CAPTURE',
                  desc: 'Entangle rotors, recover drone for forensics',
                },
                {
                  id: 'PERIMETER_EVACUATION',
                  label: 'EVACUATE & CORDON SECTOR',
                  desc: 'Sound sirens, clear blast zone radius',
                },
                {
                  id: 'FULL_FORCE_NEUTRALIZE',
                  label: 'AUTHORIZE DIRECT FIRE',
                  desc: 'Kinetic small-arms engagement authorized',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDirective(opt.id)}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    directive === opt.id
                      ? 'border-red-500 bg-red-950/40 text-red-200'
                      : 'border-white/10 bg-black/40 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-[11px] text-white">{opt.label}</div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Notes / Voice Transmission */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-red-400" />
              RADIO / DATA BROADCAST MESSAGE:
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3 py-2 bg-black/70 border border-white/15 rounded text-white text-xs font-mono focus:border-red-500 focus:outline-none"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Transmission broadcasts across VHF Ch-4, Tactical P25, Base Alarm, and Mobile SMS.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs"
          >
            CANCEL
          </button>

          <button
            onClick={handleTransmit}
            disabled={isTransmitting || dispatchedSuccess}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-900/60 disabled:opacity-50"
          >
            {dispatchedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>DISPATCH TRANSMITTED!</span>
              </>
            ) : isTransmitting ? (
              <>
                <Radio className="w-4 h-4 animate-spin text-white" />
                <span>ENCRYPTING & BROADCASTING...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>BROADCAST EMERGENCY DISPATCH</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
