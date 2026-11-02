import React, { useState } from 'react';
import { DroneTarget, AiAnalysisResult } from '../types/tactical';
import {
  ShieldAlert,
  Cpu,
  AlertOctagon,
  Crosshair,
  CheckCircle2,
  Clock,
  Radio,
  FileText,
  Zap,
  RefreshCw,
  Send,
  Loader2,
} from 'lucide-react';

interface AiThreatAnalyticsProps {
  target: DroneTarget | null;
  analysis: AiAnalysisResult | null;
  isLoading: boolean;
  onRunAnalysis: () => void;
  onExecuteRecommendedAction: (code: string) => void;
  onDispatchSecurityAlert: () => void;
}

export const AiThreatAnalytics: React.FC<AiThreatAnalyticsProps> = ({
  target,
  analysis,
  isLoading,
  onRunAnalysis,
  onExecuteRecommendedAction,
  onDispatchSecurityAlert,
}) => {
  const [copiedRoE, setCopiedRoE] = useState(false);

  if (!target) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-mono text-sm border border-white/5 rounded-lg bg-zinc-950/60">
        <Crosshair className="w-10 h-10 mb-3 text-zinc-600 opacity-60" />
        <p className="text-zinc-400 font-semibold">NO TARGET ACQUIRED</p>
        <p className="text-xs text-zinc-600 mt-1">
          Select a target on the optical HUD or radar scope to perform AI threat classification.
        </p>
      </div>
    );
  }

  const threatColor =
    (analysis?.threatScore ?? target.threatScore) >= 80
      ? 'text-red-400 border-red-500/50 bg-red-950/30'
      : (analysis?.threatScore ?? target.threatScore) >= 60
      ? 'text-amber-400 border-amber-500/50 bg-amber-950/30'
      : 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';

  const riskBadgeColor =
    analysis?.payloadRiskLevel === 'CRITICAL'
      ? 'bg-red-500 text-white'
      : analysis?.payloadRiskLevel === 'HIGH'
      ? 'bg-orange-500 text-white'
      : analysis?.payloadRiskLevel === 'MEDIUM'
      ? 'bg-yellow-500 text-black'
      : 'bg-emerald-500 text-black';

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-cyan-500/30 rounded-lg p-3 text-zinc-200 font-mono text-xs overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider text-cyan-300">
            GEMINI TACTICAL INTEL ENGINE
          </span>
        </div>
        <button
          onClick={onRunAnalysis}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 rounded text-[11px] text-cyan-300 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          <span>{isLoading ? 'ANALYZING...' : 'REFRESH INTEL'}</span>
        </button>
      </div>

      {/* Target Quick Identity Banner */}
      <div className="p-2 rounded bg-black/60 border border-white/10 mb-2.5 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-zinc-400 uppercase">Target Track ID</div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>{target.callsign}</span>
            <span className="text-[10px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded font-normal">
              {target.id}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-400 uppercase">Target Status</div>
          <div
            className={`font-bold text-xs uppercase ${
              target.status === 'NEUTRALIZED' ? 'text-zinc-400' : 'text-red-400'
            }`}
          >
            {target.status}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-cyan-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="font-semibold text-xs tracking-wider">
            SAMPLING MULTISPECTRAL SENSOR & TELEMETRY...
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            Running Gemini deep object identification and payload hazard analysis.
          </p>
        </div>
      ) : analysis ? (
        <div className="space-y-2.5">
          {/* Threat Score & Airframe Classification */}
          <div className={`p-2.5 rounded border ${threatColor}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                THREAT SEVERITY SCORE
              </span>
              <span className="text-base font-extrabold">{analysis.threatScore} / 100</span>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  analysis.threatScore >= 80
                    ? 'bg-red-500'
                    : analysis.threatScore >= 60
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${analysis.threatScore}%` }}
              />
            </div>

            <div className="text-zinc-200 font-semibold text-xs mb-0.5">
              {analysis.droneClassification}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span>{analysis.airframeCategory}</span>
              <span>•</span>
              <span className="text-cyan-300">{analysis.threatCategory}</span>
            </div>
          </div>

          {/* Underslung Payload Hazard Assessment */}
          <div className="p-2 rounded bg-black/60 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                <AlertOctagon className="w-3 h-3 text-red-400" />
                PAYLOAD HAZARD ASSESSMENT
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${riskBadgeColor}`}>
                {analysis.payloadRiskLevel} RISK
              </span>
            </div>
            <p className="text-[11px] text-zinc-200 font-medium">
              {analysis.payloadAssessment}
            </p>
            <div className="mt-1 text-[10px] text-zinc-400 flex items-center gap-2">
              <span>Pattern:</span>
              <span className="text-zinc-300">{analysis.flightBehavior}</span>
            </div>
          </div>

          {/* Time To Impact (TTI) */}
          {analysis.estimatedTimeToImpactSec && (
            <div className="p-2 rounded bg-red-950/40 border border-red-500/40 flex items-center justify-between">
              <span className="text-[10px] text-red-300 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> ESTIMATED TIME-TO-IMPACT:
              </span>
              <span className="text-sm font-bold text-red-200 animate-pulse">
                {analysis.estimatedTimeToImpactSec} SECONDS
              </span>
            </div>
          )}

          {/* Rules of Engagement & Tactical Directive */}
          <div className="p-2 rounded bg-black/60 border border-white/10">
            <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-cyan-400" /> RULES OF ENGAGEMENT (ROE)
              </span>
              <span className="text-red-400 font-bold">{analysis.personnelAlertPriority}</span>
            </div>
            <p className="text-[11px] text-zinc-300 italic mb-1.5">
              "{analysis.rulesOfEngagementSummary}"
            </p>
            <div className="p-1.5 rounded bg-zinc-900/80 border border-cyan-500/20 text-[10px] text-cyan-200">
              <span className="font-bold text-cyan-400">TACTICAL ADVISORY: </span>
              {analysis.tacticalAdvisory}
            </div>
          </div>

          {/* Recommended Countermeasure & Direct Action Buttons */}
          <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/40">
            <div className="text-[10px] text-cyan-300 font-bold uppercase mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> RECOMMENDED COUNTERMEASURE
            </div>
            <div className="text-sm font-bold text-white mb-2">
              {analysis.recommendedCountermeasure}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onExecuteRecommendedAction(analysis.countermeasureCode || 'JAMMER')}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-red-600 hover:bg-red-500 text-white rounded font-bold uppercase text-[11px] tracking-wider transition-colors shadow-lg shadow-red-900/50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>EXECUTE DEFENSE</span>
              </button>

              <button
                onClick={onDispatchSecurityAlert}
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold uppercase text-[11px] tracking-wider transition-colors shadow-lg shadow-amber-900/50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>DISPATCH SECURITY</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="w-8 h-8 text-cyan-400 mb-2 opacity-80" />
          <p className="text-zinc-300 font-semibold mb-1">AI INTEL READY</p>
          <p className="text-[11px] text-zinc-500 mb-3">
            Click below to execute Gemini multi-spectral object classification and payload hazard analysis.
          </p>
          <button
            onClick={onRunAnalysis}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Cpu className="w-4 h-4" />
            <span>RUN GEMINI THREAT SCAN</span>
          </button>
        </div>
      )}
    </div>
  );
};
