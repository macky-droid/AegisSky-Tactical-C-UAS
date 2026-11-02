import React, { useState } from 'react';
import { TacticalAlert } from '../types/tactical';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  FileDown,
  Filter,
  Radio,
  Clock,
} from 'lucide-react';

interface AlertLogPanelProps {
  alerts: TacticalAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onClearLogs: () => void;
}

export const AlertLogPanel: React.FC<AlertLogPanelProps> = ({
  alerts,
  onAcknowledgeAlert,
  onClearLogs,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const handleExportAAR = () => {
    const reportText = `========================================================================
AEGISSKY C-UAS TACTICAL AFTER-ACTION REPORT (AAR)
CONFIDENTIAL // DEFENSE SECURITY PROTOCOL
Date/Time (UTC): ${new Date().toISOString()}
Base Location: MGRS 32U MU 4821 7291 (Restricted Airspace Zone)
========================================================================

1. EXECUTIVE SUMMARY:
Counter-UAS operations engaged multiple unmanned aerial incursions.
Real-time multispectral object tracking and RF analytics operated continuously.

2. LOGGED TACTICAL INCIDENTS & DISPATCHES:
${alerts
  .map(
    (a, i) => `
[INCIDENT #${i + 1}]
Timestamp: ${a.timestamp}
Severity: ${a.severity}
Target: ${a.targetId}
Location: ${a.mgrsCoordinates || 'MGRS 32U MU 4821 7291'}
Event: ${a.title}
Details: ${a.message}
Dispatched To: ${a.dispatchedTo || 'Automated Air Defense Subsystem'}
Action: ${a.actionTaken || 'Countermeasures Deployed'}
Status: ${a.status}
------------------------------------------------------------------------`
  )
  .join('\n')}

3. OPERATIONAL CERTIFICATION:
All hostile UAS incursions classified with Gemini Deep AI Threat Analytics.
Personnel alerts transmitted across VHF Tactical Ch-4 and Encrypted P25 Network.
========================================================================
END OF REPORT
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisSky_AAR_Report_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-white/10 rounded-lg p-3 text-zinc-300 font-mono text-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="font-bold tracking-wider text-white">
            TACTICAL INCIDENT & DISPATCH LOG
          </span>
          <span className="px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-500/40 rounded text-[10px] font-bold">
            {alerts.length} EVENTS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAAR}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[10px] transition-colors"
            title="Download Tactical After-Action Incident Report"
          >
            <FileDown className="w-3 h-3 text-cyan-400" />
            <span>EXPORT AAR</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-2 text-[10px]">
        {['ALL', 'DEFCON_1', 'DEFCON_2', 'DEFCON_3', 'ADVISORY'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterSeverity === sev
                ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-500/50 font-bold'
                : 'bg-black/40 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            {sev.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Alert Items List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center py-6">
            <ShieldCheck className="w-8 h-8 mb-2 opacity-50 text-emerald-500" />
            <p className="text-zinc-500 font-semibold">NO ACTIVE INCIDENTS</p>
            <p className="text-[10px]">Airspace perimeter is currently quiet.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isDefcon1 = alert.severity === 'DEFCON_1';
            const isDefcon2 = alert.severity === 'DEFCON_2';

            const badgeColor = isDefcon1
              ? 'bg-red-950 border-red-500 text-red-300'
              : isDefcon2
              ? 'bg-amber-950 border-amber-500 text-amber-300'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300';

            return (
              <div
                key={alert.id}
                className={`p-2 rounded border transition-colors ${
                  isDefcon1
                    ? 'bg-red-950/20 border-red-500/30'
                    : isDefcon2
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-black/40 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded border font-bold ${badgeColor}`}
                    >
                      {alert.severity.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-white text-[11px]">{alert.title}</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-300 mb-1">{alert.message}</p>

                {alert.dispatchedTo && (
                  <div className="flex items-center justify-between text-[10px] text-cyan-300 bg-black/50 px-2 py-0.5 rounded border border-cyan-500/20">
                    <span className="flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 text-cyan-400" /> DISPATCH: {alert.dispatchedTo}
                    </span>
                    <span className="text-emerald-400 font-bold uppercase">{alert.status}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
