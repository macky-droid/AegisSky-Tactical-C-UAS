import { DroneTarget, DroneCategory, ThreatLevel } from '../types/tactical';

export interface AirspaceScenario {
  id: string;
  name: string;
  code: string;
  description: string;
  difficulty: 'MODERATE' | 'HIGH' | 'CRITICAL';
  initialTargets: DroneTarget[];
}

export const AIRSPACE_SCENARIOS: AirspaceScenario[] = [
  {
    id: 'fpv_kamikaze_incursion',
    name: 'Perimeter Incursion: FPV Loitering Munition',
    code: 'SCENARIO-ALPHA',
    description: 'High-velocity FPV racing drone fitted with improvised PG-7 warhead diving on Sector Bravo fuel storage depot at 88 km/h.',
    difficulty: 'CRITICAL',
    initialTargets: [
      {
        id: 'TRK-9041',
        callsign: 'VIPER-01',
        category: 'kamikaze_fpv',
        categoryLabel: 'FPV Loitering Munition',
        x: 0.52,
        y: 0.38,
        rangeMeters: 420,
        altitudeMeters: 45,
        velocityKmh: 88,
        bearingDeg: 42,
        headingDeg: 215,
        threatScore: 94,
        threatLevel: 'CRITICAL',
        status: 'LOCKED',
        rfFrequency: '5.865 GHz Analog / 915 MHz ELRS',
        rfSignalStrengthDbm: -54,
        payloadType: 'PG-7VL Shaped Charge Warhead (Improvised)',
        payloadRisk: 'CRITICAL',
        trajectoryHistory: [
          { x: 0.62, y: 0.22, time: Date.now() - 3000 },
          { x: 0.57, y: 0.30, time: Date.now() - 1500 },
          { x: 0.52, y: 0.38, time: Date.now() },
        ],
        detectedAt: Date.now() - 12000,
        bbox: { x: 0.46, y: 0.31, width: 0.12, height: 0.14 },
      },
    ],
  },
  {
    id: 'commercial_recon_standoff',
    name: 'Standoff Recon: Heavy Surveillance Quad',
    code: 'SCENARIO-BRAVO',
    description: 'Modified industrial DJI Matrice 300 hovering at 145m AGL outside outer fence, conducting electro-optical surveillance on radar installation.',
    difficulty: 'HIGH',
    initialTargets: [
      {
        id: 'TRK-4420',
        callsign: 'SHADOW-4',
        category: 'commercial_recon',
        categoryLabel: 'Commercial Heavy Recon (DJI M300)',
        x: 0.68,
        y: 0.28,
        rangeMeters: 890,
        altitudeMeters: 145,
        velocityKmh: 14,
        bearingDeg: 118,
        headingDeg: 290,
        threatScore: 78,
        threatLevel: 'HIGH',
        status: 'TRACKING',
        rfFrequency: '2.412 GHz OcuSync 3.0 FHSS',
        rfSignalStrengthDbm: -68,
        payloadType: 'Zenmuse H20T Triple-Sensor FLIR/Optical Gimbal',
        payloadRisk: 'HIGH',
        trajectoryHistory: [
          { x: 0.70, y: 0.26, time: Date.now() - 4000 },
          { x: 0.69, y: 0.27, time: Date.now() - 2000 },
          { x: 0.68, y: 0.28, time: Date.now() },
        ],
        detectedAt: Date.now() - 35000,
        bbox: { x: 0.63, y: 0.22, width: 0.10, height: 0.12 },
      },
    ],
  },
  {
    id: 'swarm_coordinated_incursion',
    name: 'Coordinated Multi-UAV Swarm Attack',
    code: 'SCENARIO-CHARLIE',
    description: 'Multi-directional swarm of three agile tactical micro-drones converging simultaneously across North and East airspace vectors.',
    difficulty: 'CRITICAL',
    initialTargets: [
      {
        id: 'TRK-7711',
        callsign: 'SWARM-LEAD',
        category: 'drone_swarm',
        categoryLabel: 'Micro-UAV Swarm Element Alpha',
        x: 0.44,
        y: 0.35,
        rangeMeters: 510,
        altitudeMeters: 62,
        velocityKmh: 64,
        bearingDeg: 15,
        headingDeg: 195,
        threatScore: 92,
        threatLevel: 'CRITICAL',
        status: 'LOCKED',
        rfFrequency: '2.448 GHz Mesh Ad-Hoc Network',
        rfSignalStrengthDbm: -58,
        payloadType: 'Impact Fragmentation Canister (350g)',
        payloadRisk: 'CRITICAL',
        trajectoryHistory: [],
        detectedAt: Date.now() - 8000,
        bbox: { x: 0.39, y: 0.29, width: 0.10, height: 0.12 },
      },
      {
        id: 'TRK-7712',
        callsign: 'SWARM-WING-1',
        category: 'drone_swarm',
        categoryLabel: 'Micro-UAV Swarm Element Bravo',
        x: 0.28,
        y: 0.48,
        rangeMeters: 640,
        altitudeMeters: 78,
        velocityKmh: 58,
        bearingDeg: 335,
        headingDeg: 155,
        threatScore: 86,
        threatLevel: 'HIGH',
        status: 'TRACKING',
        rfFrequency: '2.448 GHz Mesh Ad-Hoc Network',
        rfSignalStrengthDbm: -63,
        payloadType: 'Optical Relay & RF Jamming Node',
        payloadRisk: 'HIGH',
        trajectoryHistory: [],
        detectedAt: Date.now() - 7000,
        bbox: { x: 0.23, y: 0.42, width: 0.10, height: 0.12 },
      },
      {
        id: 'TRK-7713',
        callsign: 'SWARM-WING-2',
        category: 'drone_swarm',
        categoryLabel: 'Micro-UAV Swarm Element Charlie',
        x: 0.72,
        y: 0.42,
        rangeMeters: 590,
        altitudeMeters: 55,
        velocityKmh: 62,
        bearingDeg: 68,
        headingDeg: 248,
        threatScore: 89,
        threatLevel: 'CRITICAL',
        status: 'TRACKING',
        rfFrequency: '2.448 GHz Mesh Ad-Hoc Network',
        rfSignalStrengthDbm: -60,
        payloadType: 'Impact Fragmentation Canister (350g)',
        payloadRisk: 'CRITICAL',
        trajectoryHistory: [],
        detectedAt: Date.now() - 6500,
        bbox: { x: 0.67, y: 0.36, width: 0.10, height: 0.12 },
      },
    ],
  },
  {
    id: 'heavy_lift_contraband',
    name: 'Heavy-Lift Multirotor: Drop Mechanism',
    code: 'SCENARIO-DELTA',
    description: 'Custom 8-rotor heavy-lift hexacopter carrying an uncharacterized 4.5kg underslung canister with servo-actuated release mechanism.',
    difficulty: 'HIGH',
    initialTargets: [
      {
        id: 'TRK-2109',
        callsign: 'GOLIATH-1',
        category: 'heavy_lift_hex',
        categoryLabel: 'Heavy-Lift Octocopter (Custom Frame)',
        x: 0.36,
        y: 0.32,
        rangeMeters: 720,
        altitudeMeters: 82,
        velocityKmh: 32,
        bearingDeg: 310,
        headingDeg: 130,
        threatScore: 84,
        threatLevel: 'HIGH',
        status: 'LOCKED',
        rfFrequency: '433.92 MHz Telemetry + 5.8 GHz Video',
        rfSignalStrengthDbm: -61,
        payloadType: '4.5kg Steel Canister with Dual Servo Release (Chemical/Explosive Hazard)',
        payloadRisk: 'CRITICAL',
        trajectoryHistory: [],
        detectedAt: Date.now() - 22000,
        bbox: { x: 0.29, y: 0.24, width: 0.14, height: 0.16 },
      },
    ],
  },
];

// Canvas renderer to render realistic tactical simulated airspace feeds
export function renderTacticalSimulatedAirspace(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  targets: DroneTarget[],
  filter: 'DAY_OPTICAL' | 'FLIR_WHITE_HOT' | 'FLIR_IRONBOW' | 'NVG_GREEN',
  tick: number,
  laserTargetId: string | null
) {
  // Clear canvas
  ctx.save();

  // Background Sky / Horizon
  const horizonY = height * 0.72;

  if (filter === 'DAY_OPTICAL') {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#102235');
    skyGrad.addColorStop(0.5, '#20415a');
    skyGrad.addColorStop(1, '#47657d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // Ground / Perimeter line
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, '#1f2b1d');
    groundGrad.addColorStop(1, '#0e1710');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Distant perimeter fence / facility silhouettes
    ctx.fillStyle = '#111b15';
    for (let x = 0; x < width; x += 60) {
      const h = 8 + ((x * 13) % 24);
      ctx.fillRect(x, horizonY - h, 40, h);
    }
  } else if (filter === 'FLIR_WHITE_HOT') {
    // Thermal White-Hot: Cold sky is dark, warm ground is medium gray, hot engines are glowing white
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0c0f12');
    skyGrad.addColorStop(1, '#242a30');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    ctx.fillStyle = '#3a4249';
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Cold clouds
    ctx.fillStyle = 'rgba(60, 68, 75, 0.4)';
    ctx.beginPath();
    ctx.ellipse(width * 0.3, height * 0.2, 180, 45, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (filter === 'FLIR_IRONBOW') {
    // Ironbow thermal palette: deep purple sky, orange/magenta ground, yellow-white hot spots
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0d0221');
    skyGrad.addColorStop(0.7, '#2f0b4a');
    skyGrad.addColorStop(1, '#5c1349');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, '#8c1f36');
    groundGrad.addColorStop(0.5, '#bf3c26');
    groundGrad.addColorStop(1, '#ea6b13');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);
  } else if (filter === 'NVG_GREEN') {
    // NVG Gen 3 Green Phosphor: dark green night sky with noise
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#021206');
    skyGrad.addColorStop(1, '#05290e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    ctx.fillStyle = '#0a3d16';
    ctx.fillRect(0, horizonY, width, height - horizonY);
  }

  // Draw each drone target on the canvas
  targets.forEach((target) => {
    const isNeutralized = target.status === 'NEUTRALIZED';
    const isEngaging = target.id === laserTargetId;

    const screenX = target.x * width;
    const screenY = target.y * height;
    const size = Math.max(28, Math.min(100, (1200 / Math.max(150, target.rangeMeters)) * 26));

    ctx.save();
    ctx.translate(screenX, screenY);

    if (isNeutralized) {
      // Falling / spinning drone
      ctx.rotate((tick * 0.15) % (Math.PI * 2));
      // Smoke trail
      ctx.fillStyle = 'rgba(120, 120, 120, 0.6)';
      ctx.beginPath();
      ctx.arc(-10, 20, 12, 0, Math.PI * 2);
      ctx.arc(-22, 35, 18, 0, Math.PI * 2);
      ctx.arc(-35, 55, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Drone Airframe Drawing
    drawDroneModel(ctx, target.category, size, filter, tick, isNeutralized);

    // If countermeasure beam is actively firing at this target
    if (isEngaging) {
      drawDisruptionAura(ctx, size, tick);
    }

    ctx.restore();
  });

  // NVG / Thermal noise overlay
  if (filter === 'NVG_GREEN' || filter === 'FLIR_WHITE_HOT') {
    ctx.fillStyle = filter === 'NVG_GREEN' ? 'rgba(34, 197, 94, 0.04)' : 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 2, 2);
    }
  }

  ctx.restore();
}

function drawDroneModel(
  ctx: CanvasRenderingContext2D,
  category: DroneCategory,
  size: number,
  filter: string,
  tick: number,
  isNeutralized: boolean
) {
  const armLen = size * 0.7;
  const rotorR = size * 0.38;

  // Colors based on optical sensor mode
  let bodyColor = '#1f2937';
  let armColor = '#374151';
  let rotorBlurColor = 'rgba(200, 200, 200, 0.25)';
  let hotSpotColor = '#ffffff';
  let payloadColor = '#dc2626';

  if (filter === 'FLIR_WHITE_HOT') {
    bodyColor = '#808992';
    armColor = '#9faab5';
    rotorBlurColor = 'rgba(255, 255, 255, 0.4)';
    hotSpotColor = '#ffffff';
    payloadColor = '#ffffff';
  } else if (filter === 'FLIR_IRONBOW') {
    bodyColor = '#941e45';
    armColor = '#d94824';
    rotorBlurColor = 'rgba(254, 240, 138, 0.5)';
    hotSpotColor = '#ffffff';
    payloadColor = '#facc15';
  } else if (filter === 'NVG_GREEN') {
    bodyColor = '#15803d';
    armColor = '#22c55e';
    rotorBlurColor = 'rgba(74, 222, 128, 0.4)';
    hotSpotColor = '#86efac';
    payloadColor = '#14532d';
  }

  // Draw 4 arms for quad / FPV
  ctx.strokeStyle = armColor;
  ctx.lineWidth = Math.max(2.5, size * 0.08);

  const armAngles = [-Math.PI / 4, Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4];
  armAngles.forEach((ang) => {
    const ax = Math.cos(ang) * armLen;
    const ay = Math.sin(ang) * (armLen * 0.5); // Perspective compression

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // Motor Pod (Thermal hot spot from BLDC motors)
    ctx.fillStyle = hotSpotColor;
    ctx.beginPath();
    ctx.arc(ax, ay, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Spinning Rotor disc (unless neutralized)
    if (!isNeutralized) {
      ctx.fillStyle = rotorBlurColor;
      ctx.beginPath();
      ctx.ellipse(ax, ay, rotorR, rotorR * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spinning propeller line
      ctx.strokeStyle = filter === 'FLIR_WHITE_HOT' ? '#ffffff' : '#111827';
      ctx.lineWidth = 1.5;
      const propAng = tick * 0.6 + ang;
      ctx.beginPath();
      ctx.moveTo(ax - Math.cos(propAng) * rotorR, ay - Math.sin(propAng) * (rotorR * 0.35));
      ctx.lineTo(ax + Math.cos(propAng) * rotorR, ay + Math.sin(propAng) * (rotorR * 0.35));
      ctx.stroke();
    }
  });

  // Central Fuselage / Carbon Frame
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.42, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Battery Pack / Avionics Stack on top
  ctx.fillStyle = filter === 'FLIR_WHITE_HOT' ? '#d1d5db' : '#030712';
  ctx.fillRect(-size * 0.22, -size * 0.18, size * 0.44, size * 0.24);

  // Underslung Payload representation
  ctx.fillStyle = payloadColor;
  if (category === 'kamikaze_fpv') {
    // Cylindrical RPG shaped warhead attached under belly
    ctx.fillRect(-size * 0.14, size * 0.1, size * 0.28, size * 0.16);
    // Warhead nose cone
    ctx.beginPath();
    ctx.moveTo(-size * 0.14, size * 0.18);
    ctx.lineTo(0, size * 0.32);
    ctx.lineTo(size * 0.14, size * 0.18);
    ctx.fill();
  } else if (category === 'commercial_recon') {
    // Optical gimbal dome
    ctx.beginPath();
    ctx.arc(0, size * 0.16, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    // Lens reflection
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(size * 0.03, size * 0.14, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  } else if (category === 'heavy_lift_hex') {
    // Large hazard canister
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-size * 0.22, size * 0.14, size * 0.44, size * 0.28);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-size * 0.22, size * 0.14, size * 0.44, size * 0.28);
  }

  // Antenna / VTX Stalk
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.15);
  ctx.lineTo(size * 0.18, -size * 0.35);
  ctx.stroke();
  // Antenna mushroom cap
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(size * 0.18, -size * 0.35, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawDisruptionAura(ctx: CanvasRenderingContext2D, size: number, tick: number) {
  // RF Disruption & EMP microwave shock ring
  const pulse = (tick % 20) / 20;
  const radius = size * (0.8 + pulse * 1.2);

  ctx.strokeStyle = `rgba(56, 189, 248, ${1 - pulse})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Second pulsing ring
  ctx.strokeStyle = `rgba(239, 68, 68, ${0.9 - pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Electric arc sparks
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + (tick * 0.2);
    const dist = size * 0.9;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (dist * 0.5), Math.sin(a) * (dist * 0.5));
    ctx.lineTo(Math.cos(a + 0.2) * dist, Math.sin(a + 0.2) * dist);
    ctx.stroke();
  }
}
