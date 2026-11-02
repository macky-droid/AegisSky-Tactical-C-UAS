import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DroneTarget,
  OpticalFilterMode,
  DefconLevel,
  TacticalAlert,
  AiAnalysisResult,
} from './types/tactical';
import { soundManager } from './utils/audioAlerts';
import {
  AIRSPACE_SCENARIOS,
  renderTacticalSimulatedAirspace,
} from './utils/airspaceSimulator';
import { TacticalHudOverlay } from './components/TacticalHudOverlay';
import { TacticalRadarScope } from './components/TacticalRadarScope';
import { AiThreatAnalytics } from './components/AiThreatAnalytics';
import { SecurityDispatchModal } from './components/SecurityDispatchModal';
import { AlertLogPanel } from './components/AlertLogPanel';
import { CountermeasuresConsole } from './components/CountermeasuresConsole';
import {
  ShieldAlert,
  Radio,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Video,
  Camera,
  Layers,
  Zap,
  Activity,
  AlertTriangle,
  RotateCcw,
  Send,
  Crosshair,
  Lock,
} from 'lucide-react';

export default function App() {
  // Scenario & Sensor Source
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('fpv_kamikaze_incursion');
  const [videoSourceMode, setVideoSourceMode] = useState<'SIMULATED' | 'WEBCAM' | 'CUSTOM_FILE'>('SIMULATED');
  const [opticalFilter, setOpticalFilter] = useState<OpticalFilterMode>('DAY_OPTICAL');

  // Tactical Overlays
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Targets & Tracking State
  const [targets, setTargets] = useState<DroneTarget[]>(() => {
    const sc = AIRSPACE_SCENARIOS.find((s) => s.id === 'fpv_kamikaze_incursion');
    return sc ? JSON.parse(JSON.stringify(sc.initialTargets)) : [];
  });
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(() => {
    const sc = AIRSPACE_SCENARIOS.find((s) => s.id === 'fpv_kamikaze_incursion');
    return sc?.initialTargets[0]?.id || null;
  });

  // Countermeasure Firing State
  const [isEngaging, setIsEngaging] = useState<boolean>(false);
  const [autoDefend, setAutoDefend] = useState<boolean>(false);
  const [engagementTargetId, setEngagementTargetId] = useState<string | null>(null);

  // Alerts & Incident Logs
  const [alerts, setAlerts] = useState<TacticalAlert[]>([
    {
      id: 'ALT-INIT-01',
      timestamp: new Date().toLocaleTimeString(),
      targetId: 'TRK-9041',
      severity: 'DEFCON_1',
      title: 'CRITICAL AIRSPACE BREACH DETECTED',
      message: 'High-speed FPV loitering munition diving at 88 km/h toward Sector Bravo.',
      status: 'NEW',
      mgrsCoordinates: '32U MU 4821 7291',
    },
  ]);

  // Security Dispatch Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);

  // Gemini AI Threat Intel State
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Canvas / Video Refs
  const simulatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const tickRef = useRef<number>(0);

  // Active Target
  const selectedTarget = targets.find((t) => t.id === selectedTargetId) || null;

  // Compute DEFCON level based on highest active threat score
  const activeTargets = targets.filter((t) => t.status !== 'NEUTRALIZED');
  const maxThreatScore = activeTargets.reduce((max, t) => Math.max(max, t.threatScore), 0);
  const defconLevel: DefconLevel =
    activeTargets.length === 0
      ? 4
      : maxThreatScore >= 80
      ? 1
      : maxThreatScore >= 60
      ? 2
      : 3;

  // Siren management when DEFCON 1 occurs
  useEffect(() => {
    if (defconLevel === 1 && !isAudioMuted && activeTargets.length > 0) {
      soundManager.startSiren();
    } else {
      soundManager.stopSiren();
    }
  }, [defconLevel, isAudioMuted, activeTargets.length]);

  // Mute audio toggle
  const handleToggleMute = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundManager.setMuted(next);
  };

  // Reset or Switch Scenario
  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setVideoSourceMode('SIMULATED');
    const sc = AIRSPACE_SCENARIOS.find((s) => s.id === scenarioId);
    if (sc) {
      const cloned = JSON.parse(JSON.stringify(sc.initialTargets));
      setTargets(cloned);
      setSelectedTargetId(cloned[0]?.id || null);
      setAiAnalysis(null);

      // Add alert
      const newAlert: TacticalAlert = {
        id: `ALT-${Date.now().toString(36)}`,
        timestamp: new Date().toLocaleTimeString(),
        targetId: cloned[0]?.id || 'UNKNOWN',
        severity: cloned[0]?.threatScore >= 80 ? 'DEFCON_1' : 'DEFCON_2',
        title: `SCENARIO LOADED: ${sc.name}`,
        message: sc.description,
        status: 'NEW',
        mgrsCoordinates: '32U MU 4821 7291',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  // Start Webcam mode
  const handleStartWebcam = async () => {
    try {
      setVideoSourceMode('WEBCAM');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play();
      }

      // Add a live detected target tracker for webcam feed
      const webcamTarget: DroneTarget = {
        id: 'TRK-LIVE-CAM',
        callsign: 'OPTICAL-TRACK-1',
        category: 'unknown',
        categoryLabel: 'Live Optical Aerial Signature',
        x: 0.5,
        y: 0.45,
        rangeMeters: 310,
        altitudeMeters: 38,
        velocityKmh: 42,
        bearingDeg: 12,
        headingDeg: 192,
        threatScore: 82,
        threatLevel: 'HIGH',
        status: 'LOCKED',
        rfFrequency: 'Scanning 2.4/5.8GHz spectrum...',
        rfSignalStrengthDbm: -62,
        payloadType: 'Optical Signature Detected (Awaiting AI Classification)',
        payloadRisk: 'HIGH',
        trajectoryHistory: [],
        detectedAt: Date.now(),
        bbox: { x: 0.42, y: 0.35, width: 0.16, height: 0.2 },
      };

      setTargets([webcamTarget]);
      setSelectedTargetId(webcamTarget.id);
      setAiAnalysis(null);

      setAlerts((prev) => [
        {
          id: `ALT-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          targetId: 'TRK-LIVE-CAM',
          severity: 'DEFCON_2',
          title: 'LIVE OPTICAL CAMERA SENSOR ENGAGED',
          message: 'Optical crosshairs armed. Point camera at aerial objects for real-time tracking & AI analysis.',
          status: 'NEW',
          mgrsCoordinates: '32U MU 4821 7291',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Webcam permission error:', err);
      alert('Unable to access live camera. Defaulting back to tactical simulated sensor feed.');
      setVideoSourceMode('SIMULATED');
    }
  };

  // Main 60FPS Tactical Simulation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      tickRef.current += 1;

      // Update positions of targets if simulated
      if (videoSourceMode === 'SIMULATED') {
        setTargets((prevTargets) =>
          prevTargets.map((target) => {
            if (target.status === 'NEUTRALIZED') {
              // Falling drone
              const newY = Math.min(0.85, target.y + dt * 0.12);
              const newAlt = Math.max(0, target.altitudeMeters - dt * 25);
              const newSpeed = Math.max(0, target.velocityKmh - dt * 30);
              return {
                ...target,
                y: newY,
                altitudeMeters: Math.round(newAlt),
                velocityKmh: Math.round(newSpeed),
                bbox: {
                  ...target.bbox,
                  y: newY - target.bbox.height / 2,
                },
              };
            }

            // Normal flight path toward base perimeter
            // Target approaches (range decreases, altitude adjusts)
            const speedMs = (target.velocityKmh * 1000) / 3600;
            const newRange = Math.max(80, target.rangeMeters - dt * speedMs);

            // Subtle smooth loitering wobble
            const wobbleX = Math.sin(time * 0.002 + parseInt(target.id.replace(/\D/g, '') || '1')) * 0.0008;
            const wobbleY = Math.cos(time * 0.0015) * 0.0005;

            // Heading direction
            const rad = ((target.headingDeg - 90) * Math.PI) / 180;
            const step = (speedMs / 1500) * dt * 0.25;

            const newX = Math.max(0.1, Math.min(0.9, target.x + Math.cos(rad) * step + wobbleX));
            const newY = Math.max(0.12, Math.min(0.68, target.y + Math.sin(rad) * step + wobbleY));

            return {
              ...target,
              x: newX,
              y: newY,
              rangeMeters: Math.round(newRange),
              bbox: {
                ...target.bbox,
                x: newX - target.bbox.width / 2,
                y: newY - target.bbox.height / 2,
              },
            };
          })
        );
      }

      // Render simulated canvas scene
      const canvas = simulatedCanvasRef.current;
      if (canvas && videoSourceMode === 'SIMULATED') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderTacticalSimulatedAirspace(
            ctx,
            canvas.width,
            canvas.height,
            targets,
            opticalFilter,
            tickRef.current,
            engagementTargetId
          );
        }
      }

      // Autonomous Intercept logic
      if (autoDefend) {
        targets.forEach((t) => {
          if (t.status !== 'NEUTRALIZED' && t.threatScore >= 90 && t.rangeMeters < 500 && !isEngaging) {
            handleDeployCountermeasure('JAMMER', t.id);
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [videoSourceMode, opticalFilter, engagementTargetId, autoDefend, isEngaging, targets]);

  // Execute Countermeasure Neutralization
  const handleDeployCountermeasure = useCallback(
    (type: 'JAMMER' | 'SPOOF' | 'EMP' | 'NET', targetIdOverride?: string) => {
      const targetId = targetIdOverride || selectedTargetId;
      if (!targetId) return;

      const target = targets.find((t) => t.id === targetId);
      if (!target || target.status === 'NEUTRALIZED') return;

      setIsEngaging(true);
      setEngagementTargetId(targetId);

      // Sound FX
      if (type === 'JAMMER') soundManager.playJammerPulse();
      else if (type === 'EMP') soundManager.playEmpDischarge();
      else if (type === 'NET') soundManager.playNetLaunch();
      else soundManager.playJammerPulse();

      // Log engagement start
      const engageAlert: TacticalAlert = {
        id: `ALT-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        targetId,
        severity: 'DEFCON_1',
        title: `COUNTERMEASURE FIRED: ${type}`,
        message: `Direct engagement of ${target.callsign} using ${type}. Disrupting control telemetry & avionics.`,
        status: 'DISPATCHED',
        dispatchedTo: 'Automated Counter-UAS Subsystem',
        actionTaken: type,
        mgrsCoordinates: '32U MU 4821 7291',
      };
      setAlerts((prev) => [engageAlert, ...prev]);

      // Complete neutralization after 1.8 seconds of electronic disruption
      setTimeout(() => {
        setIsEngaging(false);
        setEngagementTargetId(null);
        soundManager.playNeutralizedChime();

        setTargets((prev) =>
          prev.map((t) =>
            t.id === targetId
              ? {
                  ...t,
                  status: 'NEUTRALIZED',
                  threatScore: 0,
                  threatLevel: 'LOW',
                  neutralizedAt: Date.now(),
                  neutralizedBy: type,
                }
              : t
          )
        );

        // Confirmed neutralized alert
        const neutralizedAlert: TacticalAlert = {
          id: `ALT-NEUT-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          targetId,
          severity: 'DEFCON_3',
          title: `TARGET NEUTRALIZED: ${target.callsign}`,
          message: `Hostile UAS forced down via ${type}. Threat eliminated. Ground security team dispatched for recovery.`,
          status: 'RESOLVED',
          dispatchedTo: 'Perimeter QRF Mobile Team Alpha',
          actionTaken: `${type} SUCCESS`,
          mgrsCoordinates: '32U MU 4821 7291',
        };
        setAlerts((prev) => [neutralizedAlert, ...prev]);
      }, 1800);
    },
    [selectedTargetId, targets]
  );

  // Capture frame & Call Gemini AI Deep Threat Analytics
  const handleRunAiAnalysis = async (targetOverride?: DroneTarget) => {
    const targetToAnalyze = targetOverride || selectedTarget;
    if (!targetToAnalyze) return;

    setIsAiLoading(true);

    try {
      let imageBase64: string | null = null;

      // Extract current video or canvas frame
      if (videoSourceMode === 'SIMULATED' && simulatedCanvasRef.current) {
        imageBase64 = simulatedCanvasRef.current.toDataURL('image/jpeg', 0.85);
      } else if (videoSourceMode === 'WEBCAM' && webcamVideoRef.current) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = webcamVideoRef.current.videoWidth || 640;
        offCanvas.height = webcamVideoRef.current.videoHeight || 480;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(webcamVideoRef.current, 0, 0);
          imageBase64 = offCanvas.toDataURL('image/jpeg', 0.85);
        }
      }

      const res = await fetch('/api/threat-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          telemetry: {
            id: targetToAnalyze.id,
            rangeMeters: targetToAnalyze.rangeMeters,
            altitudeMeters: targetToAnalyze.altitudeMeters,
            velocityKmh: targetToAnalyze.velocityKmh,
            bearingDeg: targetToAnalyze.bearingDeg,
            heading: `${targetToAnalyze.headingDeg}° inbound`,
            rfFreq: targetToAnalyze.rfFrequency,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);

        // Update target with AI verified info
        setTargets((prev) =>
          prev.map((t) =>
            t.id === targetToAnalyze.id
              ? {
                  ...t,
                  threatScore: data.data.threatScore ?? t.threatScore,
                  payloadType: data.data.payloadAssessment ?? t.payloadType,
                  categoryLabel: data.data.droneClassification ?? t.categoryLabel,
                }
              : t
          )
        );

        // Alert log
        setAlerts((prev) => [
          {
            id: `ALT-AI-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            targetId: targetToAnalyze.id,
            severity: data.data.threatScore >= 80 ? 'DEFCON_1' : 'DEFCON_2',
            title: `GEMINI AI INTEL: ${data.data.droneClassification}`,
            message: `Identified: ${data.data.payloadAssessment}. Advisory: ${data.data.tacticalAdvisory}`,
            status: 'NEW',
            mgrsCoordinates: '32U MU 4821 7291',
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Error invoking Gemini threat analysis:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Security Personnel Dispatch Confirmation
  const handleConfirmDispatch = (details: {
    unitId: string;
    unitName: string;
    directive: string;
    priority: string;
  }) => {
    const dispatchAlert: TacticalAlert = {
      id: `DISPATCH-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      targetId: selectedTarget?.id || 'UNKNOWN',
      severity: 'DEFCON_1',
      title: `SECURITY DISPATCH TRANSMITTED: ${details.unitName}`,
      message: `Directive: ${details.directive}. Unit assigned immediate intercept coordinates at MGRS 32U MU 4821 7291.`,
      status: 'DISPATCHED',
      dispatchedTo: details.unitName,
      actionTaken: details.directive,
      mgrsCoordinates: '32U MU 4821 7291',
    };
    setAlerts((prev) => [dispatchAlert, ...prev]);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const defconBadgeStyle =
    defconLevel === 1
      ? 'bg-red-600 text-white animate-pulse'
      : defconLevel === 2
      ? 'bg-orange-500 text-black'
      : defconLevel === 3
      ? 'bg-yellow-400 text-black'
      : 'bg-emerald-500 text-black';

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#05080c] text-zinc-100 flex flex-col tactical-grid-bg select-none"
    >
      {/* ================= TOP TACTICAL COMMAND BAR ================= */}
      <header className="h-14 border-b border-white/10 bg-black/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        {/* Brand & Air Defense System ID */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-cyan-500/30 rounded">
            <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-extrabold text-white tracking-widest text-sm">
              AEGISSKY
            </span>
            <span className="text-[10px] px-1 py-0.2 bg-cyan-950 text-cyan-300 font-mono font-bold rounded">
              C-UAS TACTICAL v4.2
            </span>
          </div>

          {/* DEFCON Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-black/70 border border-white/10 rounded font-mono text-xs">
            <span className="text-zinc-400 font-bold">DEFCON:</span>
            <span className={`px-2 py-0.5 rounded font-black text-xs ${defconBadgeStyle}`}>
              LEVEL {defconLevel} -{' '}
              {defconLevel === 1
                ? 'CRITICAL INCURSION'
                : defconLevel === 2
                ? 'HOSTILE WARNING'
                : defconLevel === 3
                ? 'ELEVATED SURVEILLANCE'
                : 'AIRSPACE NORMAL'}
            </span>
          </div>
        </div>

        {/* Center Live Coordinates & RF Frequency Status */}
        <div className="hidden xl:flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-zinc-500">BASE:</span>
            <span className="text-white font-bold">MGRS 32U MU 4821 7291</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-500">RF MONITOR:</span>
            <span className="text-cyan-300 font-semibold">2.4 / 5.8 GHz & GNSS L1/L2</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Emergency Security Dispatch Button */}
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold font-mono text-xs tracking-wider transition-colors shadow-lg shadow-red-950 animate-pulse"
          >
            <Send className="w-3.5 h-3.5" />
            <span>DISPATCH SECURITY</span>
          </button>

          {/* Audio Alert Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded border transition-colors ${
              isAudioMuted
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700'
                : 'bg-zinc-900 text-cyan-300 border-cyan-500/40 hover:bg-zinc-800'
            }`}
            title={isAudioMuted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded transition-colors"
            title="Toggle Fullscreen Tactical Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ================= SECONDARY CONTROLS BAR ================= */}
      <div className="bg-black/60 border-b border-white/10 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
        {/* Scenario & Video Source Selector */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold uppercase flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-cyan-400" /> FEED:
          </span>

          <select
            value={videoSourceMode === 'WEBCAM' ? 'webcam' : selectedScenarioId}
            onChange={(e) => {
              if (e.target.value === 'webcam') {
                handleStartWebcam();
              } else {
                handleSelectScenario(e.target.value);
              }
            }}
            className="px-2.5 py-1 bg-zinc-900 border border-white/15 rounded text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
          >
            <optgroup label="Tactical Airspace Scenarios">
              {AIRSPACE_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.code}: {sc.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Live Optical Hardware">
              <option value="webcam">LIVE WEBCAM / OPTICAL CAMERA</option>
            </optgroup>
          </select>
        </div>

        {/* Optical Sensor Filters (Normal, FLIR White-Hot, FLIR Ironbow, NVG Green) */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 font-bold uppercase flex items-center gap-1 mr-1">
            <Eye className="w-3.5 h-3.5 text-zinc-400" /> SENSOR PALETTE:
          </span>
          {[
            { id: 'DAY_OPTICAL', label: 'OPTICAL' },
            { id: 'FLIR_WHITE_HOT', label: 'FLIR WHITE' },
            { id: 'FLIR_IRONBOW', label: 'FLIR IRONBOW' },
            { id: 'NVG_GREEN', label: 'NVG GEN-3' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setOpticalFilter(mode.id as OpticalFilterMode)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors border ${
                opticalFilter === mode.id
                  ? 'bg-cyan-900/80 text-cyan-200 border-cyan-400 font-bold'
                  : 'bg-black/40 text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Overlay Switches (Grid, Trajectory, Reticle) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              showGrid
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-bold'
                : 'bg-black/40 text-zinc-500 border-white/5'
            }`}
          >
            GRID: {showGrid ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
              showTrajectory
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 font-bold'
                : 'bg-black/40 text-zinc-500 border-white/5'
            }`}
          >
            VECTORS: {showTrajectory ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => handleSelectScenario(selectedScenarioId)}
            className="flex items-center gap-1 px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 rounded text-[11px] font-mono transition-colors"
            title="Reset Targets to Initial Airspace Vector"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>RESET AIRSPACE</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN TACTICAL WORKSPACE ================= */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
        {/* LEFT COLUMN: 360° Polar Radar & Alert Log (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-hidden">
          {/* Radar Scope */}
          <div className="p-3 rounded-lg bg-zinc-950/80 border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-mono font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-spin" /> 360° RADAR PPI SCOPE
              </span>
              <span className="text-[10px] text-zinc-400">FMCW L-BAND</span>
            </div>
            <TacticalRadarScope
              targets={targets}
              selectedTargetId={selectedTargetId}
              onSelectTarget={(id) => {
                setSelectedTargetId(id);
                soundManager.playLockTone();
              }}
              maxRangeMeters={1500}
            />
          </div>

          {/* Incident Alert & Dispatch Log */}
          <div className="flex-1 min-h-[260px] overflow-hidden">
            <AlertLogPanel
              alerts={alerts}
              onAcknowledgeAlert={(id) => {
                setAlerts((prev) =>
                  prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
                );
              }}
              onClearLogs={() => setAlerts([])}
            />
          </div>
        </div>

        {/* CENTER COLUMN: Live Video Sensor Feed & Tactical HUD Overlay (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-2 h-full">
          {/* Main Visual Sensor Feed Viewport */}
          <div className="relative flex-1 bg-black rounded-lg border-2 border-cyan-500/40 overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.15)] flex items-center justify-center min-h-[420px]">
            {/* Simulated Canvas or Webcam Video */}
            {videoSourceMode === 'SIMULATED' ? (
              <canvas
                ref={simulatedCanvasRef}
                width={960}
                height={540}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* Tactical Scanlines CRT Filter */}
            <div className="tactical-scanlines absolute inset-0 pointer-events-none" />

            {/* Interactive HUD Overlay (Grid, Reticles, Target Bounding Boxes, Lead Vectors) */}
            <TacticalHudOverlay
              targets={targets}
              selectedTargetId={selectedTargetId}
              onSelectTarget={(id) => {
                setSelectedTargetId(id);
                soundManager.playLockTone();
              }}
              onQuickEngage={(id) => handleDeployCountermeasure('JAMMER', id)}
              onQuickAiAnalyze={(target) => handleRunAiAnalysis(target)}
              opticalFilter={opticalFilter}
              showGrid={showGrid}
              showTrajectory={showTrajectory}
              activeCountermeasure={isEngaging}
              videoWidth={960}
              videoHeight={540}
            />
          </div>

          {/* Target Rapid Selection Strip */}
          <div className="p-2 rounded bg-zinc-950/80 border border-white/10 flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0">
            <span className="text-zinc-500 font-bold uppercase text-[10px] whitespace-nowrap">
              TARGET TRACKS:
            </span>
            {targets.map((t) => {
              const isSelected = t.id === selectedTargetId;
              const isNeutralized = t.status === 'NEUTRALIZED';
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTargetId(t.id);
                    soundManager.playLockTone();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 font-bold shadow-md shadow-cyan-950'
                      : 'border-white/10 bg-black/50 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Crosshair
                    className={`w-3 h-3 ${
                      isNeutralized
                        ? 'text-zinc-500'
                        : t.threatScore >= 80
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  />
                  <span>{t.callsign}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded ${
                      isNeutralized
                        ? 'bg-zinc-800 text-zinc-400'
                        : t.threatScore >= 80
                        ? 'bg-red-950 text-red-300 font-bold'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {isNeutralized ? 'DOWN' : `${t.threatScore}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Gemini AI Intel & Countermeasure Neutralization Console (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3 h-full overflow-hidden">
          {/* Gemini AI Deep Threat Analytics */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <AiThreatAnalytics
              target={selectedTarget}
              analysis={aiAnalysis}
              isLoading={isAiLoading}
              onRunAnalysis={() => handleRunAiAnalysis()}
              onExecuteRecommendedAction={(code) => {
                if (code === 'JAMMER') handleDeployCountermeasure('JAMMER');
                else if (code === 'EMP') handleDeployCountermeasure('EMP');
                else if (code === 'NET') handleDeployCountermeasure('NET');
                else if (code === 'SPOOF') handleDeployCountermeasure('SPOOF');
                else setIsDispatchModalOpen(true);
              }}
              onDispatchSecurityAlert={() => setIsDispatchModalOpen(true)}
            />
          </div>

          {/* Active Countermeasures Suite */}
          <div className="flex-1 min-h-[280px] overflow-hidden">
            <CountermeasuresConsole
              selectedTarget={selectedTarget}
              onDeployCountermeasure={(type) => handleDeployCountermeasure(type)}
              isEngaging={isEngaging}
              autoDefend={autoDefend}
              onToggleAutoDefend={() => setAutoDefend(!autoDefend)}
            />
          </div>
        </div>
      </div>

      {/* Emergency Security Personnel Dispatch Modal */}
      <SecurityDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        target={selectedTarget}
        onConfirmDispatch={handleConfirmDispatch}
      />
    </div>
  );
}
