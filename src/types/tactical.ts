export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW' | 'FRIENDLY';

export type TargetStatus = 
  | 'TRACKING' 
  | 'LOCKED' 
  | 'JAMMING' 
  | 'SPOOFING' 
  | 'NEUTRALIZING' 
  | 'NEUTRALIZED' 
  | 'LOST';

export type DroneCategory = 
  | 'kamikaze_fpv' 
  | 'commercial_recon' 
  | 'heavy_lift_hex' 
  | 'fixed_wing_uav' 
  | 'drone_swarm' 
  | 'friendly_patrol' 
  | 'unknown';

export interface DroneTarget {
  id: string;
  callsign: string;
  category: DroneCategory;
  categoryLabel: string;
  // Position in normalized screen space [0..1]
  x: number;
  y: number;
  // 3D Airspace coordinates
  rangeMeters: number;
  altitudeMeters: number;
  velocityKmh: number;
  bearingDeg: number;
  headingDeg: number;
  threatScore: number; // 0 - 100
  threatLevel: ThreatLevel;
  status: TargetStatus;
  rfFrequency: string;
  rfSignalStrengthDbm: number;
  payloadType: string;
  payloadRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  trajectoryHistory: Array<{ x: number; y: number; time: number }>;
  detectedAt: number;
  neutralizedAt?: number;
  neutralizedBy?: string;
  // Bounding box in percentage [ymin, xmin, ymax, xmax]
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type OpticalFilterMode = 'DAY_OPTICAL' | 'FLIR_WHITE_HOT' | 'FLIR_IRONBOW' | 'NVG_GREEN';

export type DefconLevel = 1 | 2 | 3 | 4;

export interface TacticalAlert {
  id: string;
  timestamp: string;
  targetId: string;
  severity: 'DEFCON_1' | 'DEFCON_2' | 'DEFCON_3' | 'ADVISORY';
  title: string;
  message: string;
  dispatchedTo?: string;
  actionTaken?: string;
  status: 'NEW' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'RESOLVED';
  mgrsCoordinates?: string;
}

export interface SecurityPersonnelUnit {
  id: string;
  name: string;
  callsign: string;
  role: string;
  status: 'READY' | 'DEPLOYED' | 'ENGAGING' | 'STANDBY';
  equipment: string[];
  currentSector: string;
  locationMGRS: string;
}

export interface AiAnalysisResult {
  droneClassification: string;
  airframeCategory: string;
  payloadAssessment: string;
  payloadRiskLevel: string;
  threatCategory: string;
  threatScore: number;
  flightBehavior: string;
  estimatedTimeToImpactSec: number | null;
  recommendedCountermeasure: string;
  countermeasureCode: 'JAMMER' | 'SPOOF' | 'EMP' | 'NET' | 'DISPATCH';
  rulesOfEngagementSummary: string;
  personnelAlertPriority: string;
  tacticalAdvisory: string;
  analyzedAt?: string;
}

export interface CountermeasureState {
  rfJammerActive: boolean;
  rfFrequencyBand: string;
  gpsSpooferActive: boolean;
  empChargePercent: number;
  kineticNetLoaded: boolean;
  selectedTargetId: string | null;
  autoEngagementEnabled: boolean;
}
