    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
let scene = "menu";

    function layoutCanvas() {
      const isMenuScene = scene !== "game";
      canvas.width = isMenuScene ? window.innerWidth : Math.floor(window.innerWidth * 0.585);
      canvas.height = window.innerHeight;
      canvas.style.position = "fixed";
      canvas.style.zIndex = "2";
      canvas.style.display = isMenuScene ? "none" : "block";
      if (isMenuScene) {
        canvas.style.left = "0px";
        canvas.style.top = "0px";
      } else {
        canvas.style.left = Math.round((window.innerWidth - canvas.width) / 2) + "px";
        canvas.style.top = Math.round((window.innerHeight - canvas.height) / 2) + "px";
      }
      document.body.classList.toggle("menu-screen", isMenuScene);
    }

    layoutCanvas();
    window.addEventListener("resize", layoutCanvas);
    ctx.imageSmoothingEnabled = false;
let isPlayerInvulnerable = false;
const showDevUi = false;
const gameplayDebugOverlayModes = {
  normal: 0,
  visual: 1,
  tech: 2
};
let gameplayDebugOverlayMode = gameplayDebugOverlayModes.normal;
window.__startGameFromMenu = function startGameFromMenu() {
  scene = "game";
  layoutCanvas();
  restartGame();
};
let finalRunResult = null;
const enemyDisplayNames = {
  normal: "РўР°СЂР°РЅ",
  web: "РџР°СѓС‡РѕРє",
  zigzag: "Р—РёРіР·Р°Рі",
  tank: "РўР°РЅРє",
  boss: "Р‘РѕСЃСЃ"
};
const enemyVisualScale = {
  normal: 1.15,
  web: 1.15,
  zigzag: 1.10,
  tank: 1.0
};
const runStats = {
  enemyKills: {
    normal: 0,
    web: 0,
    zigzag: 0,
    tank: 0,
    bossLeg: 0,
    boss: 0
  },
  damageTaken: 0,
  hitCount: 0,
  criticalHpFrames: 0,
  bossAppeared: false,
  bossDefeated: false,
  deathReason: "",
  tankMissilesLaunched: 0,
  tankMissilesHitPlayer: 0,
  tankMissilesSurvived: 0,
  enemyHazardZonesSpawned: 0,
  enemyHazardZonesHitPlayer: 0,
  enemyHazardZonesSurvived: 0,
  webAttacksLaunched: 0,
  webAttacksHitPlayer: 0,
  webSlowApplications: 0,
  bossWebShotsLaunched: 0,
  bossWebShotsHitPlayer: 0,
  bossMissilesLaunched: 0,
  bossMissilesHitPlayer: 0,
  bossDangerZonesSpawned: 0,
  bossDangerZonesHitPlayer: 0,
  bossDangerZonesSurvived: 0,
  bossLaserHits: 0,
  ratingPoints: 0,
  scoreBonusPoints: 0,
  damageReasonCounts: Object.create(null)
};

    const keys = {};

const stars = [];
let lastFrameTime = performance.now();
let timeScale = 1;
let gameUpdateAccumulator = 0;
const fixedUpdateStep = 1 / 60;
const maxFixedUpdatesPerFrame = 12;

for (let i = 0; i < 80; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    speed: 0.9 + Math.random() * 1.8,
    size: Math.random() < 0.7 ? 1 : 2,
    tint: Math.random() < 0.6 ? "white" : (Math.random() < 0.5 ? "#ffd59a" : "#9ad8ff"),
    twinkle: Math.random() * Math.PI * 2
  });
}

const bullets = [];

const enemies = [];
const enemyBullets = [];
const enemyHazardZones = [];
const webBullets = [];
const bossBullets = [];
const bossWebBullets = [];
const bossDangerZones = [];
const bossCoreLaser = {
  state: "idle",
  timer: 0,
  cooldown: 240,
  cooldownMax: 240,
  baseCooldownMax: 240,
  chargeDuration: 55,
  activeDuration: 45,
  width: 46,
  damageTickTimer: 0
};
const tankMissileAttackIntervalMultiplier = 5 / 6;
const webShootIntervalMultiplier = 1 / 0.85;
const bossMissileAttackIntervalMultiplier = 0.5;
const bossRageAttackIntervalPercents = [100, 110, 125, 145, 170, 200];
const particles = [];
const worldAtmosphereParticles = [];
const impactFlashes = [];
const spriteExplosions = [];
const delayedExplosions = [];
const delayedParticleBursts = [];
const muzzleFlashes = [];
const playerSpeedStreaks = [];
const bossAttackTelegraphs = [];
let hitPauseTimer = 0;
let slowMotionTimer = 0;
let slowMotionFrame = 0;
let explosionSoundCooldown = 0;
const ambientClouds = [];
const ambientWindStreaks = [];
const bossDebugLastHit = {
  timer: 0,
  id: "",
  segmentId: "",
  x: 0,
  y: 0
};
const bossDeathSequence = {
  active: false,
  timer: 0,
  duration: 165,
  victoryTextStart: 95,
  bodyGone: false,
  explosionTimer: 0,
  screenShakeTimer: 0,
  screenFlashTimer: 0,
  aliveLegBoxes: []
};
const playerWebOverlay = {
  active: false,
  timer: 0,
  duration: 0,
  fadeFrames: 18,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  scale: 1
};
const tankHazardZoneSpawnDelay = 40;
const bossHazardZoneSpawnDelay = 8;
const menuBackgroundImage = loadSpriteImage("assets/ui/Main3.png");

let resultFadeTimer = 0;
const resultFadeDuration = 30;
let gameStartFadeTimer = 0;
const gameStartFadeDuration = 28;

let enemySpawnTimer = 0;
const enemySpawnDelay = 60;

let shootCooldown = 0;
const shootCooldownMax = 15;

let score = 0;
let missionTimer = 0;
let isPaused = false;
let bossAnimationTimer = 0;
let playerVisualTilt = 0;
let playerExhaustTilt = 0;
let playerVisualPitch = 0;
const playerVerticalBankMax = 0.06;
const playerVerticalBankOffset = 10;
const playerJetVisualHeightScale = 0.88;
const playerJetPivotOffsetY = 6;
const playerJetRollTarget = 0.24;
const playerJetRollClamp = 0.24;
const playerExhaustTiltFollow = 0.08;
const playerExhaustTiltReturn = 0.05;
let audioContext = null;
let tankMissileSoundCooldown = 0;
const tankMissileFlightHiss = {
  source: null,
  gain: null,
  filter: null
};
const bossMissileFlightLoop = {
  source: null,
  gain: null,
  filter: null,
  tone: null,
  toneGain: null
};
const bossCoreLaserLoop = {
  source: null,
  gain: null,
  filter: null,
  tone: null,
  toneGain: null
};

function loadSpriteImage(src) {
  const image = new Image();
  image.loaded = false;
  image.onload = () => {
    image.loaded = true;
  };
  image.onerror = () => {
    image.loaded = false;
  };
  image.src = src;

  if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
    image.loaded = true;
  }

  return image;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getEnemyDisplayName(type) {
  return enemyDisplayNames[type] || type;
}

function resetRunStats() {
  runStats.enemyKills.normal = 0;
  runStats.enemyKills.web = 0;
  runStats.enemyKills.zigzag = 0;
  runStats.enemyKills.tank = 0;
  runStats.enemyKills.bossLeg = 0;
  runStats.enemyKills.boss = 0;
  runStats.damageTaken = 0;
  runStats.hitCount = 0;
  runStats.criticalHpFrames = 0;
  runStats.bossAppeared = false;
  runStats.bossDefeated = false;
  runStats.deathReason = "";
  runStats.tankMissilesLaunched = 0;
  runStats.tankMissilesHitPlayer = 0;
  runStats.tankMissilesSurvived = 0;
  runStats.enemyHazardZonesSpawned = 0;
  runStats.enemyHazardZonesHitPlayer = 0;
  runStats.enemyHazardZonesSurvived = 0;
  runStats.webAttacksLaunched = 0;
  runStats.webAttacksHitPlayer = 0;
  runStats.webSlowApplications = 0;
  runStats.bossWebShotsLaunched = 0;
  runStats.bossWebShotsHitPlayer = 0;
  runStats.bossMissilesLaunched = 0;
  runStats.bossMissilesHitPlayer = 0;
  runStats.bossDangerZonesSpawned = 0;
  runStats.bossDangerZonesHitPlayer = 0;
  runStats.bossDangerZonesSurvived = 0;
  runStats.bossLaserHits = 0;
  runStats.ratingPoints = 0;
  runStats.scoreBonusPoints = 0;
  runStats.damageReasonCounts = Object.create(null);
}

function recordEnemyKill(type, points = 0) {
  if (runStats.enemyKills[type] !== undefined) {
    runStats.enemyKills[type]++;
  }

  runStats.scoreBonusPoints += points;
}

function recordHit(amount, reason) {
  const numericAmount = Number.isFinite(amount) ? amount : 0;

  runStats.damageTaken += numericAmount;
  runStats.hitCount++;
  if (reason) {
    runStats.damageReasonCounts[reason] = (runStats.damageReasonCounts[reason] || 0) + 1;
  }

  if (reason === "basic-collision" || reason === "taran-collision") {
    runStats.scoreBonusPoints += 1;
  }
}

function recordDeathReason(reason) {
  if (!runStats.deathReason) {
    runStats.deathReason = reason;
  }
}

function computeGradePoints() {
  const timePoints = Math.floor(missionTimer / 60 / 12);
  const survivalPoints = Math.floor(Math.min(missionTimer / 60, 360) / 18);
  const hpBonus = Math.max(0, Math.round(player.hp * 7));
  const damagePenalty = Math.round(runStats.damageTaken * 11);
  const hitPenalty = runStats.hitCount * 2;
  const bossBonus = runStats.bossDefeated ? 48 : 0;
  const bossAppearanceBonus = runStats.bossAppeared ? 8 : 0;
  const killPoints =
    runStats.enemyKills.normal * 6 +
    runStats.enemyKills.web * 8 +
    runStats.enemyKills.zigzag * 9 +
    runStats.enemyKills.tank * 12 +
    runStats.enemyKills.bossLeg * 14 +
    runStats.enemyKills.boss * 32;
  const survivalStressPenalty = runStats.criticalHpFrames > 0 ? Math.floor(runStats.criticalHpFrames / 45) : 0;

  runStats.ratingPoints =
    killPoints +
    timePoints +
    survivalPoints +
    hpBonus +
    bossBonus +
    bossAppearanceBonus -
    damagePenalty -
    hitPenalty -
    survivalStressPenalty -
    (runStats.deathReason ? 16 : 0);

  if (!runStats.bossAppeared && runStats.deathReason) {
    runStats.ratingPoints -= 8;
  }

  return runStats.ratingPoints;
}

function getResultBattleText() {
  if (runStats.bossDefeated) {
    return "Р‘РѕСЃСЃ СѓРЅРёС‡С‚РѕР¶РµРЅ";
  }

  if (runStats.bossAppeared) {
    return "Р‘РѕР№ СЃ Р±РѕСЃСЃРѕРј РЅРµ Р·Р°РІРµСЂС€С‘РЅ";
  }

  if (runStats.deathReason) {
    return "РџРѕСЂР°Р¶РµРЅРёРµ РґРѕ Р±РѕСЃСЃР°";
  }

  return "Р—Р°Р±РµРі Р·Р°РІРµСЂС€С‘РЅ";
}

function getLeaderboardPlaceText() {
  return "РўР°Р±Р»РёС†Р° РЅРµ РїРѕРґРєР»СЋС‡РµРЅР°";
}

function getTopDamageReasons(limit = 3) {
  const entries = Object.entries(runStats.damageReasonCounts || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"));

  return entries.slice(0, limit).map(([reason, count]) => ({
    reason,
    count
  }));
}

function buildResultGrade() {
  const points = computeGradePoints();
  let gradeIndex = 0;

  if (points >= 700) {
    gradeIndex = 8;
  } else if (points >= 585) {
    gradeIndex = 7;
  } else if (points >= 470) {
    gradeIndex = 6;
  } else if (points >= 360) {
    gradeIndex = 5;
  } else if (points >= 270) {
    gradeIndex = 4;
  } else if (points >= 190) {
    gradeIndex = 3;
  } else if (points >= 130) {
    gradeIndex = 2;
  } else if (points >= 80) {
    gradeIndex = 1;
  }

  if (runStats.bossDefeated && gradeIndex < 4) {
    gradeIndex = 4;
  }

  if (!runStats.bossAppeared && gradeIndex > 2 && runStats.deathReason) {
    gradeIndex = Math.min(2, gradeIndex);
  }

  const gradeLabels = ["2", "3-", "3", "4-", "4", "4+", "5-", "5", "5+"];
  return {
    label: gradeLabels[gradeIndex],
    index: gradeIndex,
    points: points
  };
}

function getGradeCommentPool() {
  return {
    0: [
      "РџР°СѓРєРё РґР°Р¶Рµ РЅРµ РІСЃРїРѕС‚РµР»Рё.",
      "РўРµР±СЏ С…РІР°С‚РёР»Рѕ РЅРµРЅР°РґРѕР»РіРѕ, РЅРѕ С€СѓРјРЅРѕ.",
      "Р—Р°Р±РµРі СЃРІРµСЂРЅСѓР»СЃСЏ СЂР°РЅСЊС€Рµ, С‡РµРј СѓСЃРїРµР» СЂР°Р·РѕРіРЅР°С‚СЊСЃСЏ."
    ],
    1: [
      "РќРµСЂРІРѕРІ Р±С‹Р»Рѕ Р±РѕР»СЊС€Рµ, С‡РµРј РїР»Р°РЅР°.",
      "РЎС‚С‹РґРЅРѕ РЅРµ Р±С‹Р»Рѕ. РџРѕС‡С‚Рё.",
      "Р­С‚Рѕ СѓР¶Рµ С‡С‚Рѕ-С‚Рѕ, РЅРѕ РїРѕРєР° Р±РµР· Р±Р»РµСЃРєР°."
    ],
    2: [
      "Р”РµСЂР¶РёС€СЊСЃСЏ. Р СЌС‚Рѕ СѓР¶Рµ РЅРµ РїСѓСЃС‚СЏРє.",
      "Р РІР°РЅРѕ, РЅРѕ СЃ С…Р°СЂР°РєС‚РµСЂРѕРј.",
      "РљРѕСЃРјРѕСЃ РїРѕРєР° РЅРµ РІРїРµС‡Р°С‚Р»С‘РЅ, РЅРѕ СЃР»СѓС€Р°РµС‚."
    ],
    3: [
      "РЈР¶Рµ РїРѕС…РѕР¶Рµ РЅР° Р±РѕР№, Р° РЅРµ РЅР° СЃСѓРµС‚Сѓ.",
      "Р’РѕС‚ С‚РµРїРµСЂСЊ РЅР°С‡РёРЅР°РµС‚СЃСЏ РЅРѕСЂРјР°Р»СЊРЅР°СЏ СЂР°Р±РѕС‚Р°.",
      "РўС‹ РїРѕС‡С‚Рё СЃРѕР±СЂР°Р» РїСЂРѕС…РѕРґ РІ РєСѓР»Р°Рє."
    ],
    4: [
      "РљСЂРµРїРєРёР№ РїСЂРѕС…РѕРґ. Р‘РµР· Р»РёС€РЅРµР№ РґСЂР°РјС‹.",
      "Р‘РѕСЃСЃ РїР°Р» РЅРµ СЃР»СѓС‡Р°Р№РЅРѕ.",
      "РЎРѕР»РёРґРЅРѕ. РџР°СѓРєР°Рј РЅРµ РѕС‡РµРЅСЊ РїРѕРЅСЂР°РІРёР»РѕСЃСЊ."
    ],
    5: [
      "РћС‡РµРЅСЊ С…РѕСЂРѕС€РёР№ Р·Р°Р±РµРі. РџСЂСЏРјРѕ СЃ РЅРµСЂРІРѕРј.",
      "РўС‹ СѓР¶Рµ РїРѕС‡С‚Рё РґРёРєС‚СѓРµС€СЊ С‚РµРјРї.",
      "Р’РѕС‚ СЌС‚Рѕ СѓРІР°Р¶РёС‚РµР»СЊРЅРѕ."
    ],
    6: [
      "РЎРёР»СЊРЅР°СЏ СЂР°Р±РѕС‚Р°. РўСѓС‚ СѓР¶Рµ РЅРµ РїРѕРІРµР·Р»Рѕ РІСЂР°РіР°Рј.",
      "РџР°СѓРєРё РІ РїР°РЅРёРєРµ, Рё СЌС‚Рѕ Р·Р°СЃР»СѓР¶РµРЅРЅРѕ.",
      "РћС‡РµРЅСЊ СѓРІРµСЂРµРЅРЅРѕ, Р±РµР· Р»РёС€РЅРёС… РґС‹СЂ."
    ],
    7: [
      "РџРѕС‡С‚Рё СЌС‚Р°Р»РѕРЅ. РћСЃС‚Р°Р»РёСЃСЊ РјРµР»РєРёРµ РѕРіСЂРµС…Рё.",
      "Р РµРґРєРѕ РєС‚Рѕ С‚Р°Рє С‡РёСЃС‚Рѕ Р·Р°РєСЂС‹РІР°РµС‚ Р±РѕР№.",
      "Р­С‚Рѕ СѓР¶Рµ РѕС‡РµРЅСЊ Р±Р»РёР·РєРѕ Рє РѕР±СЂР°Р·С†РѕРІРѕРјСѓ РїСЂРѕС…РѕРґСѓ."
    ],
    8: [
      "РџРѕС‡С‚Рё РЅРµРґРѕСЃС‚РёР¶РёРјРѕ. РћС‡РµРЅСЊ РєСЂР°СЃРёРІРѕ.",
      "Р­С‚Рѕ СѓР¶Рµ РґРµРјРѕРЅСЃС‚СЂР°С†РёСЏ РїСЂРµРІРѕСЃС…РѕРґСЃС‚РІР°.",
      "РџР°СѓРєР°Рј РїРѕСЂР° РјРµРЅСЏС‚СЊ РїСЂРѕС„РµСЃСЃРёСЋ."
    ]
  };
}

function getResultComment(gradeIndex) {
  const pool = getGradeCommentPool()[gradeIndex] || getGradeCommentPool()[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function finalizeRunResult(outcome) {
  runStats.tankMissilesSurvived = Math.max(0, runStats.tankMissilesLaunched - runStats.tankMissilesHitPlayer);
  runStats.enemyHazardZonesSurvived = Math.max(0, runStats.enemyHazardZonesSpawned - runStats.enemyHazardZonesHitPlayer);
  runStats.bossDangerZonesSurvived = Math.max(0, runStats.bossDangerZonesSpawned - runStats.bossDangerZonesHitPlayer);
  const grade = buildResultGrade();
  finalRunResult = {
    outcome,
    grade,
    comment: getResultComment(grade.index),
    battleText: getResultBattleText(),
    leaderboardText: getLeaderboardPlaceText(),
    score,
    threatReasons: getTopDamageReasons(3),
    destroyedTotal:
      runStats.enemyKills.normal +
      runStats.enemyKills.web +
      runStats.enemyKills.zigzag +
      runStats.enemyKills.tank +
      runStats.enemyKills.bossLeg +
      runStats.enemyKills.boss,
    bossAppeared: runStats.bossAppeared,
    bossDefeated: runStats.bossDefeated,
    deathReason: runStats.deathReason || "",
    missionSeconds: Math.floor(missionTimer / 60),
    missionTimeText: formatMissionTime(),
    totalDamageText: formatStatNumber(runStats.damageTaken, 1),
    hitsText: String(runStats.hitCount),
    criticalTimeText: formatTimeFromFrames(runStats.criticalHpFrames),
    criticalHpFrames: runStats.criticalHpFrames,
    destroyedStats: {
      normal: runStats.enemyKills.normal,
      web: runStats.enemyKills.web,
      zigzag: runStats.enemyKills.zigzag,
      tank: runStats.enemyKills.tank,
      bossLeg: runStats.enemyKills.bossLeg,
      boss: runStats.enemyKills.boss
    },
    damageStats: {
      hits: runStats.hitCount,
      damageTaken: runStats.damageTaken,
      slows: runStats.webSlowApplications
    },
    threatStats: {
      tankMissilesLaunched: runStats.tankMissilesLaunched,
      tankMissilesHitPlayer: runStats.tankMissilesHitPlayer,
      enemyHazardZonesSpawned: runStats.enemyHazardZonesSpawned,
      enemyHazardZonesHitPlayer: runStats.enemyHazardZonesHitPlayer,
      bossDangerZonesSpawned: runStats.bossDangerZonesSpawned,
      bossDangerZonesHitPlayer: runStats.bossDangerZonesHitPlayer
    }
  };
  if (typeof window.__showRunResult === "function") {
    window.__showRunResult(finalRunResult);
  }
}

function formatStatNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (decimals <= 0) {
    return String(Math.round(value));
  }

  return Number(value).toFixed(decimals).replace(/\.0+$/, "");
}

function formatTimeFromFrames(frames) {
  const totalSeconds = Math.max(0, Math.floor(frames / 60));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}

function isGameplayDebugOverlayActive() {
  return gameplayDebugOverlayMode !== gameplayDebugOverlayModes.normal;
}

function isGameplayDebugVisualMode() {
  return gameplayDebugOverlayMode === gameplayDebugOverlayModes.visual;
}

function isGameplayDebugTechMode() {
  return gameplayDebugOverlayMode === gameplayDebugOverlayModes.tech;
}

function cycleGameplayDebugOverlayMode() {
  gameplayDebugOverlayMode = (gameplayDebugOverlayMode + 1) % 3;
}

function isRectOutsideViewport(left, top, width, height, margin) {
  return left > canvas.width + margin || left + width < -margin || top > canvas.height + margin || top + height < -margin;
}

function isCircleOutsideViewport(centerX, centerY, radius, margin) {
  return centerX + radius < -margin || centerX - radius > canvas.width + margin || centerY + radius < -margin || centerY - radius > canvas.height + margin;
}

function isPointOutsideViewport(pointX, pointY, margin) {
  return pointX < -margin || pointX > canvas.width + margin || pointY < -margin || pointY > canvas.height + margin;
}

const spriteSheets = {
  player: loadSpriteImage("assets/sprites/player_fighter.png"),
  enemy: loadSpriteImage("assets/sprites/enemy_ships.png"),
  bullets: loadSpriteImage("assets/sprites/bullets.png"),
  webBullet: loadSpriteImage("assets/sprites/web_bullet_clean.png"),
  bulletPack: loadSpriteImage("assets/sprites/Bullets-0001.png"),
  tankMissileGray: loadSpriteImage("assets/sprites/tank_missile_gray.png"),
  tankMissileStatic: loadSpriteImage("assets/sprites/tank_missile_static.png"),
  tankDangerZoneFrame1: loadSpriteImage("assets/sprites/tank_danger_zone/frame_01.png"),
  tankDangerZoneFrame2: loadSpriteImage("assets/sprites/tank_danger_zone/frame_02.png"),
  tankDangerZoneFrame3: loadSpriteImage("assets/sprites/tank_danger_zone/frame_03.png"),
  bossDangerZoneFrame1: loadSpriteImage("assets/sprites/boss_danger_zone/frame_01.png"),
  bossDangerZoneFrame2: loadSpriteImage("assets/sprites/boss_danger_zone/frame_02.png"),
  bossDangerZoneFrame3: loadSpriteImage("assets/sprites/boss_danger_zone/frame_03.png"),
  exhaust: loadSpriteImage("assets/sprites/Exhaust-0001.png"),
  explosions: loadSpriteImage("assets/sprites/Explosion-0001_origin.png"),
  explosionFireball: loadSpriteImage("assets/sprites/explosion_fireball_ref.png"),
  explosionFireballGreen: loadSpriteImage("assets/sprites/explosion_fireball_green.png"),
  explosionFireballPurple: loadSpriteImage("assets/sprites/explosion_fireball_purple.png"),
  barrier: loadSpriteImage("assets/sprites/Barrier-0001.png"),
  boss: loadSpriteImage("assets/sprites/boss_2.png"),
  bossBodyClean: loadSpriteImage("assets/sprites/boss_body_clean.png?v=stable-body-1"),
  bossDamaged: loadSpriteImage("assets/sprites/damaged_boss.png"),
  bossSegmentUpperLeft: loadSpriteImage("assets/sprites/boss_segments/upperLeft.png?v=full-ownership-1"),
  bossSegmentMiddleLeft: loadSpriteImage("assets/sprites/boss_segments/middleLeft.png?v=full-ownership-1"),
  bossSegmentLowerLeft: loadSpriteImage("assets/sprites/boss_segments/lowerLeft.png?v=full-ownership-1"),
  bossSegmentUpperRight: loadSpriteImage("assets/sprites/boss_segments/upperRight.png?v=full-ownership-1"),
  bossSegmentMiddleRight: loadSpriteImage("assets/sprites/boss_segments/middleRight.png?v=full-ownership-1"),
  bossSegmentLowerRight: loadSpriteImage("assets/sprites/boss_segments/lowerRight.png?v=full-ownership-1"),
  bossMaskUpperLeft: loadSpriteImage("assets/sprites/boss_masks/upperLeft.png"),
  bossMaskMiddleLeft: loadSpriteImage("assets/sprites/boss_masks/middleLeft.png"),
  bossMaskLowerLeft: loadSpriteImage("assets/sprites/boss_masks/lowerLeft.png"),
  bossMaskUpperRight: loadSpriteImage("assets/sprites/boss_masks/upperRight.png"),
  bossMaskMiddleRight: loadSpriteImage("assets/sprites/boss_masks/middleRight.png"),
  bossMaskLowerRight: loadSpriteImage("assets/sprites/boss_masks/lowerRight.png"),
  bossStumpUpperLeft: loadSpriteImage("assets/sprites/boss_masks/upperLeft_stump.png"),
  bossStumpMiddleLeft: loadSpriteImage("assets/sprites/boss_masks/middleLeft_stump.png"),
  bossStumpLowerLeft: loadSpriteImage("assets/sprites/boss_masks/lowerLeft_stump.png"),
  bossStumpUpperRight: loadSpriteImage("assets/sprites/boss_masks/upperRight_stump.png"),
  bossStumpMiddleRight: loadSpriteImage("assets/sprites/boss_masks/middleRight_stump.png"),
  bossStumpLowerRight: loadSpriteImage("assets/sprites/boss_masks/lowerRight_stump.png")
};

const villageLevelBackground = loadSpriteImage("assets/background/village_level_main.png");
const villageBossStartMissionTicks = 120 * 60;
const villageAtmosphereSources = [
  { id: "lair", x: 370, y: 150, smokeRate: 0.04, sparkRate: 0.01, smokeLimit: 6, sparkLimit: 2, smokeSpreadX: 18, smokeSpreadY: 8, smokeRadiusMin: 6, smokeRadiusMax: 10, smokeLifeMin: 114, smokeLifeMax: 154, smokeLiftMin: 0.11, smokeLiftMax: 0.20 },
  { id: "ruinsLeft", x: 285, y: 355, smokeRate: 0.08, sparkRate: 0.03, smokeLimit: 10, sparkLimit: 3, smokeSpreadX: 20, smokeSpreadY: 12, smokeRadiusMin: 7, smokeRadiusMax: 11, smokeLifeMin: 104, smokeLifeMax: 156, smokeLiftMin: 0.13, smokeLiftMax: 0.23 },
  { id: "pitLeft", x: 230, y: 245, smokeRate: 0.07, sparkRate: 0.02, smokeLimit: 8, sparkLimit: 2, smokeSpreadX: 16, smokeSpreadY: 8, smokeRadiusMin: 6, smokeRadiusMax: 10, smokeLifeMin: 100, smokeLifeMax: 145, smokeLiftMin: 0.10, smokeLiftMax: 0.20 },
  { id: "pitRight", x: 575, y: 260, smokeRate: 0.07, sparkRate: 0.02, smokeLimit: 8, sparkLimit: 2, smokeSpreadX: 16, smokeSpreadY: 8, smokeRadiusMin: 6, smokeRadiusMax: 10, smokeLifeMin: 100, smokeLifeMax: 145, smokeLiftMin: 0.10, smokeLiftMax: 0.20 },
  { id: "ruinsRight", x: 535, y: 315, smokeRate: 0.08, sparkRate: 0.03, smokeLimit: 10, sparkLimit: 3, smokeSpreadX: 20, smokeSpreadY: 12, smokeRadiusMin: 7, smokeRadiusMax: 11, smokeLifeMin: 104, smokeLifeMax: 156, smokeLiftMin: 0.13, smokeLiftMax: 0.23 }
];
const villageAtmosphereEnergyNodes = [
  { id: "ruinsLeft", x: 285, y: 355, phase: 0.2, scale: 1.22 },
  { id: "pitLeft", x: 230, y: 245, phase: 1.25, scale: 0.95 },
  { id: "pitRight", x: 575, y: 260, phase: 2.35, scale: 0.98 },
  { id: "ruinsRight", x: 535, y: 315, phase: 3.35, scale: 1.16 }
];
const villageAtmosphereFractures = [
  { x1: 252, y1: 332, x2: 314, y2: 371, phase: 0.2, width: 1.48, color: "rgba(96, 24, 18, 1)" },
  { x1: 212, y1: 231, x2: 252, y2: 262, phase: 1.5, width: 1.36, color: "rgba(152, 48, 22, 1)" },
  { x1: 552, y1: 249, x2: 595, y2: 270, phase: 2.25, width: 1.34, color: "rgba(108, 28, 20, 1)" },
  { x1: 507, y1: 292, x2: 561, y2: 326, phase: 3.22, width: 1.46, color: "rgba(126, 42, 24, 1)" },
  { x1: 268, y1: 346, x2: 302, y2: 366, phase: 4.0, width: 1.24, color: "rgba(154, 58, 26, 1)" }
];
const playerJetVisualScale = 1.25;
const playerJetEnginePoints = [
  { x: 301, y: 705 },
  { x: 511, y: 705 }
];
const villageAtmosphereMaxParticles = 60;
const ambientCloudMaxCount = 5;
const ambientWindMaxCount = 8;
const ambientCloudSpawnStopTick = villageBossStartMissionTicks - 10 * 60;
const ambientCloudScript = [
  { tick: 15 * 60, type: "cloud1", xFactor: 0.50 },
  { tick: 18 * 60, type: "cloud3", xFactor: 0.14 },
  { tick: 22 * 60, type: "cloud4", xFactor: 0.84 },
  { tick: 27 * 60, type: "cloud2", xFactor: 0.68 },
  { tick: 33 * 60, type: "cloud5", xFactor: 0.52 },
  { tick: 39 * 60, type: "cloud1", xFactor: 0.24 },
  { tick: 45 * 60, type: "cloud3", xFactor: 0.78 },
  { tick: 52 * 60, type: "cloud4", xFactor: 0.48 },
  { tick: 70 * 60, type: "cloud5", xFactor: 0.30 },
  { tick: 74 * 60, type: "cloud2", xFactor: 0.86 },
  { tick: 79 * 60, type: "cloud1", xFactor: 0.58 },
  { tick: 85 * 60, type: "cloud3", xFactor: 0.18 },
  { tick: 92 * 60, type: "cloud4", xFactor: 0.50 },
  { tick: 99 * 60, type: "cloud5", xFactor: 0.72 },
  { tick: 106 * 60, type: "cloud3", xFactor: 0.40 }
];
let ambientCloudScriptIndex = 0;
let ambientWindSpawnBudget = 0;
let playerSpeedEffectIntensity = 0;
let playerSpeedEffectSpawnBudget = 0;
let playerSpeedEffectSpawnPhase = 0;
let playerSpeedSmoothedDirection = { x: 0, y: -1 };
let villageAtmosphereDebugLogged = false;
const playerSpeedEffectMaxParticles = 18;

function getVillageBackgroundDrawMetrics() {
  if (!villageLevelBackground.loaded || villageLevelBackground.width <= 0 || villageLevelBackground.height <= 0) {
    return null;
  }

  const scale = Math.max(canvas.width / villageLevelBackground.width, canvas.height / villageLevelBackground.height);
  const drawWidth = villageLevelBackground.width * scale;
  const drawHeight = villageLevelBackground.height * scale;

  return {
    drawWidth,
    drawHeight,
    maxOffset: Math.max(0, drawHeight - canvas.height)
  };
}

function getVillageBackgroundExactMissionTicks() {
  return missionTimer + gameUpdateAccumulator / fixedUpdateStep;
}

function getVillageBackgroundPlacement() {
  const metrics = getVillageBackgroundDrawMetrics();

  if (!metrics) {
    return null;
  }

  const exactMissionTicks = getVillageBackgroundExactMissionTicks();
  const scrollPerMissionTick = villageBossStartMissionTicks > 0 ? metrics.maxOffset / villageBossStartMissionTicks : 0;
  const scrollDistance = clamp(exactMissionTicks * scrollPerMissionTick, 0, metrics.maxOffset);
  const offset = metrics.maxOffset - scrollDistance;
  const x = Math.floor((canvas.width - metrics.drawWidth) / 2);
  const y = Math.floor(-offset);

  return {
    drawWidth: metrics.drawWidth,
    drawHeight: metrics.drawHeight,
    maxOffset: metrics.maxOffset,
    scale: metrics.drawWidth / villageLevelBackground.width,
    scrollDistance: scrollDistance,
    offset: offset,
    x: x,
    y: y,
    progress: metrics.maxOffset > 0 ? scrollDistance / metrics.maxOffset : 0
  };
}

function villageWorldToScreen(placement, worldX, worldY) {
  return {
    x: placement.x + worldX * placement.scale,
    y: placement.y + worldY * placement.scale
  };
}

function getVillageAtmosphereIntensity(placement) {
  let intensity = clamp((placement.progress - 0.40) / 0.44, 0, 1);

  if (boss.introActive) {
    intensity = Math.max(intensity, 0.9);
  } else if (boss.active) {
    intensity = Math.max(intensity, 1);
  }

  return intensity;
}

function getVillageAtmosphereIntroBoost() {
  if (!boss.introActive || boss.introDuration <= 0) {
    return 0;
  }

  const introProgress = clamp(1 - boss.introTimer / boss.introDuration, 0, 1);

  if (introProgress > 0.32) {
    return 0;
  }

  const burst = Math.sin((introProgress / 0.32) * Math.PI);
  return 0.55 * burst;
}

function getVillageAtmosphereCoreIntensity(placement) {
  const baseCoreIntensity = clamp((placement.progress - 0.58) / 0.42, 0, 1);
  return Math.min(0.95, Math.max(baseCoreIntensity, getVillageAtmosphereIntensity(placement) * 0.6) + getVillageAtmosphereIntroBoost() * 0.45);
}

function getVillageAtmosphereRingIntensity(placement) {
  const baseRingIntensity = clamp((placement.progress - 0.30) / 0.44, 0, 1);
  return Math.min(2.05, Math.max(baseRingIntensity, getVillageAtmosphereIntensity(placement) * 1.08) + getVillageAtmosphereIntroBoost() * 1.2);
}

function countVillageAtmosphereParticles(type, sourceId) {
  let count = 0;

  for (let i = 0; i < worldAtmosphereParticles.length; i++) {
    const particle = worldAtmosphereParticles[i];

    if (particle.type === type && particle.sourceId === sourceId) {
      count++;
    }
  }

  return count;
}

function spawnVillageAtmosphereSmoke(source, intensity) {
  if (worldAtmosphereParticles.length >= villageAtmosphereMaxParticles) {
    return;
  }

  const x = source.x + (Math.random() - 0.5) * source.smokeSpreadX;
  const y = source.y + (Math.random() - 0.5) * source.smokeSpreadY;
  const life = source.smokeLifeMin + Math.floor(Math.random() * (source.smokeLifeMax - source.smokeLifeMin + 1));

  worldAtmosphereParticles.push({
    type: "smoke",
    sourceId: source.id,
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * (0.16 + intensity * 0.12),
    vy: -(source.smokeLiftMin + Math.random() * (source.smokeLiftMax - source.smokeLiftMin) + intensity * 0.05),
    life: life,
    maxLife: life,
    radius: source.smokeRadiusMin + Math.random() * (source.smokeRadiusMax - source.smokeRadiusMin),
    scale: 1,
    drag: 0.972 + Math.random() * 0.012,
    turbulence: 0.008 + intensity * 0.012,
    lift: 0.0015 + intensity * 0.0015,
    wobbleSeed: Math.random() * Math.PI * 2,
    darkColor: "rgba(42, 36, 40, 1)",
    midColor: "rgba(86, 78, 84, 1)",
    lightColor: "rgba(140, 130, 136, 1)",
    glowColor: "rgba(120, 38, 18, 1)",
    glowAlpha: 0.10 + intensity * 0.08
  });
}

function spawnVillageAtmosphereSpark(source, intensity) {
  if (worldAtmosphereParticles.length >= villageAtmosphereMaxParticles) {
    return;
  }

  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
  const speed = 0.26 + Math.random() * (0.12 + intensity * 0.14);
  const life = 10 + Math.floor(Math.random() * 7);
  const x = source.x + (Math.random() - 0.5) * 8;
  const y = source.y + (Math.random() - 0.5) * 6;

  worldAtmosphereParticles.push({
    type: "spark",
    sourceId: source.id,
    x: x,
    y: y,
    vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.1,
    vy: Math.sin(angle) * speed - 0.08,
    life: life,
    maxLife: life,
    length: 4 + Math.random() * 4,
    width: 1 + Math.random() * 0.35,
    color: "rgba(236, 103, 40, 1)",
    coreColor: "rgba(255, 224, 168, 1)"
  });
}

function updateWorldAtmosphere() {
  const placement = getVillageBackgroundPlacement();

  if (!placement) {
    worldAtmosphereParticles.length = 0;
    return;
  }

  const intensity = getVillageAtmosphereIntensity(placement);

  for (let i = 0; i < villageAtmosphereSources.length; i++) {
    const source = villageAtmosphereSources[i];
    let smokeCount = countVillageAtmosphereParticles("smoke", source.id);
    let sparkCount = countVillageAtmosphereParticles("spark", source.id);

    source.smokeBudget = (source.smokeBudget || 0) + source.smokeRate * intensity;
    source.sparkBudget = (source.sparkBudget || 0) + source.sparkRate * intensity;

    while (source.smokeBudget >= 1 && smokeCount < source.smokeLimit) {
      spawnVillageAtmosphereSmoke(source, intensity);
      source.smokeBudget--;
      smokeCount++;
    }

    while (source.sparkBudget >= 1 && sparkCount < source.sparkLimit) {
      spawnVillageAtmosphereSpark(source, intensity);
      source.sparkBudget--;
      sparkCount++;
    }
  }
}

function moveWorldAtmosphereParticles() {
  const placement = getVillageBackgroundPlacement();

  if (!placement) {
    worldAtmosphereParticles.length = 0;
    return;
  }

  const cullMargin = 180;

  for (let i = worldAtmosphereParticles.length - 1; i >= 0; i--) {
    const particle = worldAtmosphereParticles[i];
    const screen = villageWorldToScreen(placement, particle.x, particle.y);

    if (isPointOutsideViewport(screen.x, screen.y, cullMargin)) {
      worldAtmosphereParticles.splice(i, 1);
      continue;
    }

    if (particle.type === "smoke") {
      particle.vx += (Math.random() - 0.5) * particle.turbulence;
      particle.vy -= particle.lift;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.scale = Math.min(2.2, particle.scale + 0.006);
      particle.x += particle.vx;
      particle.y += particle.vy;
    } else if (particle.type === "spark") {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
    }

    particle.life--;

    const updatedScreen = villageWorldToScreen(placement, particle.x, particle.y);

    if (particle.life <= 0 || isPointOutsideViewport(updatedScreen.x, updatedScreen.y, cullMargin)) {
      worldAtmosphereParticles.splice(i, 1);
    }
  }
}

function drawVillageAtmosphereGlow(placement, intensity) {
  const lairScreen = villageWorldToScreen(placement, 370, 150);
  const slowBreath = 0.58 + Math.sin(missionTimer * 0.012) * 0.42;
  const livingPulse = 0.62 + Math.sin(missionTimer * 0.0042 + 1.15) * 0.38;
  const pulse = slowBreath * livingPulse;
  const radiance = 0.54 + intensity * 0.6;
  const outerRadius = 42 * placement.scale * radiance;
  const midRadius = 28 * placement.scale * radiance;
  const innerRadius = 15 * placement.scale * radiance;
  const outerAlpha = 0.022 + intensity * 0.04 * pulse;
  const midAlpha = 0.032 + intensity * 0.05 * pulse;
  const innerAlpha = 0.045 + intensity * 0.06 * pulse;
  const coreAlpha = 0.035 + intensity * 0.045 * pulse;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  ctx.fillStyle = "rgba(48, 7, 10, " + (outerAlpha * 0.66) + ")";
  ctx.beginPath();
  ctx.ellipse(lairScreen.x, lairScreen.y + 3 * placement.scale, outerRadius * 1.0, outerRadius * 0.54, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(108, 24, 18, " + outerAlpha + ")";
  ctx.beginPath();
  ctx.ellipse(lairScreen.x, lairScreen.y + 1 * placement.scale, midRadius * 1.02, midRadius * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(166, 52, 30, " + midAlpha + ")";
  ctx.beginPath();
  ctx.ellipse(lairScreen.x + 1 * placement.scale, lairScreen.y, innerRadius * 1.02, innerRadius * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 112, 52, " + coreAlpha + ")";
  ctx.beginPath();
  ctx.ellipse(lairScreen.x, lairScreen.y, innerRadius * 0.52, innerRadius * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.04 + intensity * 0.05 * pulse;
  ctx.strokeStyle = "rgba(255, 162, 74, 0.26)";
  ctx.lineWidth = Math.max(1.2, 1.8 * placement.scale);
  ctx.beginPath();
  ctx.ellipse(lairScreen.x, lairScreen.y, outerRadius * 0.92, outerRadius * 0.42, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.03 + intensity * 0.04 * pulse;
  ctx.strokeStyle = "rgba(255, 222, 164, 0.18)";
  ctx.lineWidth = Math.max(1, 1.1 * placement.scale);
  ctx.beginPath();
  ctx.ellipse(lairScreen.x, lairScreen.y + 1 * placement.scale, midRadius * 0.74, midRadius * 0.31, 0, 0, Math.PI * 2);
  ctx.stroke();

  const ringIntensity = getVillageAtmosphereRingIntensity(placement);
  const ringPoints = villageAtmosphereEnergyNodes;
  const ringRadii = [30, 27, 27, 32];
  const ringPulse = 0.56 + Math.sin(missionTimer * 0.0105 + 0.45) * 0.44;

  for (let i = 0; i < ringPoints.length; i++) {
    const node = ringPoints[i];
    const screen = villageWorldToScreen(placement, node.x, node.y);
    const nodePulse = 0.54 + Math.sin(missionTimer * 0.0115 + node.phase) * 0.46;
    const nodeIntensity = ringIntensity * nodePulse * ringPulse;
    const radius = ringRadii[i] * placement.scale * node.scale * (0.86 + nodeIntensity * 0.82);

    ctx.globalAlpha = 0.12 + nodeIntensity * 0.14;
    ctx.fillStyle = i === 1 || i === 3 ? "rgba(182, 56, 28, 1)" : "rgba(128, 28, 20, 1)";
    ctx.beginPath();
    ctx.ellipse(screen.x, screen.y, radius * 1.18, radius * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.11 + nodeIntensity * 0.14;
    ctx.strokeStyle = i === 1 || i === 3 ? "rgba(255, 182, 92, 0.58)" : "rgba(255, 130, 56, 0.42)";
    ctx.lineWidth = Math.max(1.35, 2.1 * placement.scale);
    ctx.beginPath();
    ctx.ellipse(screen.x, screen.y, radius * 1.28, radius * 0.56, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.09 + nodeIntensity * 0.12;
    ctx.strokeStyle = "rgba(255, 226, 162, 0.22)";
    ctx.lineWidth = Math.max(1, 1.1 * placement.scale);
    ctx.beginPath();
    ctx.moveTo(screen.x - radius * 0.72, screen.y - radius * 0.08);
    ctx.lineTo(screen.x - radius * 0.18, screen.y - radius * 0.14);
    ctx.lineTo(screen.x + radius * 0.22, screen.y + radius * 0.06);
    ctx.lineTo(screen.x + radius * 0.72, screen.y + radius * 0.04);
    ctx.stroke();
  }
  ctx.restore();
}

function drawVillageAtmosphereFractures(placement, intensity) {
  const time = missionTimer * 0.045;
  const introBoost = getVillageAtmosphereIntroBoost();
  const fractureBoost = Math.min(1.5, intensity + introBoost);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  for (let i = 0; i < villageAtmosphereFractures.length; i++) {
    const fracture = villageAtmosphereFractures[i];
    const wave = Math.sin(time + fracture.phase) * 0.5 + 0.5;
    const flicker = wave * wave;

    if (flicker < 0.52) {
      continue;
    }

    const flash = introBoost > 0 ? 0.72 + introBoost * 0.68 : 1;
    const alpha = fractureBoost * ((flicker - 0.52) / 0.48) * 0.54 * flash;
    const start = villageWorldToScreen(placement, fracture.x1, fracture.y1);
    const end = villageWorldToScreen(placement, fracture.x2, fracture.y2);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const normalX = -dy / length;
    const normalY = dx / length;
    const midJitter = (Math.sin(time * 1.8 + fracture.phase * 3.1) * 0.5 + 0.5) * (11.5 * placement.scale + 5);
    const midX = (start.x + end.x) * 0.5 + normalX * midJitter;
    const midY = (start.y + end.y) * 0.5 + normalY * midJitter;
    const jaggedX = normalX * (7.2 * placement.scale + 1.8);
    const jaggedY = normalY * (7.2 * placement.scale + 1.8);
    const veinX = (start.x + end.x) * 0.5 + normalX * (3.0 * placement.scale);
    const veinY = (start.y + end.y) * 0.5 + normalY * (3.0 * placement.scale);

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = fracture.color;
    ctx.lineWidth = Math.max(2.4, fracture.width * 3.8 * placement.scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(veinX + jaggedX, veinY + jaggedY);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.92;
    ctx.strokeStyle = "rgba(255, 180, 78, 1)";
    ctx.lineWidth = Math.max(1.35, fracture.width * 1.85 * placement.scale);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(veinX, veinY);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (flicker > 0.86) {
      const burst = (flicker - 0.86) / 0.14;
      ctx.globalAlpha = alpha * burst * 0.95;
      ctx.strokeStyle = "rgba(255, 236, 186, 1)";
      ctx.lineWidth = Math.max(1.1, fracture.width * 1.0 * placement.scale);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(veinX, veinY);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawVillageAtmosphereParticles(placement) {
  for (let i = 0; i < worldAtmosphereParticles.length; i++) {
    const particle = worldAtmosphereParticles[i];
    const screen = villageWorldToScreen(placement, particle.x, particle.y);

    if (particle.type === "smoke") {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      const progress = 1 - alpha;
      const scale = particle.scale * (0.9 + progress * 1.55);
      const radius = particle.radius * scale * placement.scale;
      const drawCullRadius = radius * 1.35;

      if (isCircleOutsideViewport(screen.x, screen.y, drawCullRadius, 110)) {
        continue;
      }

      const wobble = Math.sin(particle.wobbleSeed + progress * 6.8) * radius * 0.18;

      ctx.save();
      ctx.globalAlpha = Math.max(0.05, alpha * 0.86);
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = particle.darkColor;
      ctx.beginPath();
      ctx.ellipse(screen.x + wobble * 0.14, screen.y - progress * 7.2 * placement.scale, radius * 0.86, radius * 0.4, wobble * 0.01, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = particle.midColor;
      ctx.globalAlpha = Math.max(0.03, alpha * 0.42);
      ctx.beginPath();
      ctx.ellipse(screen.x - wobble * 0.04, screen.y - progress * 9.8 * placement.scale, radius * 0.54, radius * 0.22, wobble * 0.02, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.01, alpha * particle.glowAlpha * 0.42);
      ctx.fillStyle = particle.glowColor;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - progress * 4.1 * placement.scale, radius * 0.24, radius * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.max(0.015, alpha * 0.08);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - progress * 6.2 * placement.scale, radius * 0.5, radius * 0.18, wobble * 0.01, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (particle.type === "spark") {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      const length = particle.length * (0.42 + alpha * 0.58) * placement.scale;
      const angle = Math.atan2(particle.vy, particle.vx);

      if (isPointOutsideViewport(screen.x, screen.y, 80)) {
        continue;
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.28, alpha);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = particle.width * placement.scale;
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(screen.x - Math.cos(angle) * length, screen.y - Math.sin(angle) * length);
      ctx.stroke();

      ctx.globalAlpha = Math.max(0.16, alpha * 0.7);
      ctx.strokeStyle = particle.coreColor;
      ctx.lineWidth = Math.max(1, particle.width * 0.55 * placement.scale);
      ctx.beginPath();
      ctx.moveTo(screen.x, screen.y);
      ctx.lineTo(screen.x - Math.cos(angle) * length * 0.52, screen.y - Math.sin(angle) * length * 0.52);
      ctx.stroke();
      ctx.restore();
    }
  }
}

const ambientCloudPresets = {
  cloud1: {
    alpha: 0.4,
    speedY: 2.14,
    driftX: 0.08,
    scale: 2.58,
    spawnY: -320,
    blobs: [
      { x: -132, y: 14, radius: 26, alpha: 0.48 },
      { x: -92, y: -18, radius: 38, alpha: 0.74 },
      { x: -28, y: -34, radius: 58, alpha: 1.00 },
      { x: 40, y: -10, radius: 48, alpha: 0.94 },
      { x: 108, y: 26, radius: 34, alpha: 0.70 },
      { x: -10, y: 44, radius: 42, alpha: 0.72 },
      { x: 58, y: 58, radius: 28, alpha: 0.54 }
    ]
  },
  cloud2: {
    alpha: 0.37,
    speedY: 2.0,
    driftX: -0.06,
    scale: 2.42,
    spawnY: -300,
    blobs: [
      { x: -150, y: 12, radius: 30, alpha: 0.52 },
      { x: -96, y: -14, radius: 42, alpha: 0.76 },
      { x: -20, y: -26, radius: 56, alpha: 0.96 },
      { x: 58, y: -6, radius: 44, alpha: 0.88 },
      { x: 128, y: 20, radius: 28, alpha: 0.60 },
      { x: 24, y: 40, radius: 22, alpha: 0.50 }
    ]
  },
  cloud3: {
    alpha: 0.4,
    speedY: 2.24,
    driftX: 0.04,
    scale: 2.1,
    spawnY: -280,
    blobs: [
      { x: -58, y: -10, radius: 28, alpha: 0.70 },
      { x: -24, y: -20, radius: 46, alpha: 1.00 },
      { x: 18, y: -8, radius: 38, alpha: 0.88 },
      { x: -4, y: 18, radius: 34, alpha: 0.82 },
      { x: 30, y: 24, radius: 24, alpha: 0.56 },
      { x: -36, y: 28, radius: 20, alpha: 0.48 }
    ]
  },
  cloud4: {
    alpha: 0.34,
    speedY: 1.94,
    driftX: -0.08,
    scale: 2.28,
    spawnY: -305,
    blobs: [
      { x: -128, y: -10, radius: 20, alpha: 0.40 },
      { x: -72, y: -24, radius: 32, alpha: 0.58 },
      { x: -14, y: -6, radius: 46, alpha: 0.92 },
      { x: 48, y: 18, radius: 34, alpha: 0.72 },
      { x: 108, y: 10, radius: 22, alpha: 0.48 },
      { x: 12, y: 42, radius: 18, alpha: 0.42 }
    ]
  },
  cloud5: {
    alpha: 0.38,
    speedY: 2.06,
    driftX: 0.1,
    scale: 2.48,
    spawnY: -315,
    blobs: [
      { x: -116, y: 44, radius: 20, alpha: 0.42 },
      { x: -82, y: 16, radius: 30, alpha: 0.60 },
      { x: -18, y: -10, radius: 46, alpha: 0.88 },
      { x: 40, y: -38, radius: 36, alpha: 0.72 },
      { x: 96, y: -66, radius: 26, alpha: 0.56 },
      { x: 12, y: 30, radius: 24, alpha: 0.50 }
    ]
  }
};

function spawnAmbientCloud(scriptEntry) {
  if (ambientClouds.length >= ambientCloudMaxCount) {
    return false;
  }

  const preset = ambientCloudPresets[scriptEntry.type];

  if (!preset) {
    return false;
  }

  ambientClouds.push({
    x: Math.round(canvas.width * scriptEntry.xFactor),
    y: preset.spawnY,
    speedY: preset.speedY,
    driftX: preset.driftX,
    alpha: preset.alpha,
    scale: preset.scale,
    bounds: buildCloudBounds(preset),
    blobs: preset.blobs
  });

  return true;
}

function buildCloudBounds(preset) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < preset.blobs.length; i++) {
    const blob = preset.blobs[i];
    const radius = blob.radius * preset.scale;

    minX = Math.min(minX, blob.x - radius);
    maxX = Math.max(maxX, blob.x + radius);
    minY = Math.min(minY, blob.y - radius);
    maxY = Math.max(maxY, blob.y + radius);
  }

  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
}

function spawnAmbientWindStreak() {
  if (ambientWindStreaks.length >= ambientWindMaxCount) {
    return;
  }

  const length = 10 + Math.random() * 14;

  ambientWindStreaks.push({
    x: 8 + Math.random() * (canvas.width - 16),
    y: -30 - Math.random() * 110,
    speedX: (Math.random() - 0.5) * 0.55,
    speedY: 4.8 + Math.random() * 2.6,
    life: 42 + Math.floor(Math.random() * 26),
    maxLife: 42 + Math.floor(Math.random() * 26),
    alpha: 0.05 + Math.random() * 0.1,
    length: length,
    width: 0.9 + Math.random() * 0.7,
    angle: (Math.random() - 0.5) * 0.16,
    swaySeed: Math.random() * Math.PI * 2
  });
}

function updateAmbientClouds() {
  const shouldStopSpawning = missionTimer >= ambientCloudSpawnStopTick || boss.introActive || boss.active || bossDeathSequence.active;

  while (!shouldStopSpawning && ambientCloudScriptIndex < ambientCloudScript.length) {
    const nextEvent = ambientCloudScript[ambientCloudScriptIndex];

    if (missionTimer < nextEvent.tick) {
      break;
    }

    if (!spawnAmbientCloud(nextEvent)) {
      break;
    }

    ambientCloudScriptIndex++;
  }

  for (let i = ambientClouds.length - 1; i >= 0; i--) {
    const cloud = ambientClouds[i];

    cloud.y += cloud.speedY;
    cloud.x += cloud.driftX;

    const left = cloud.x + cloud.bounds.minX;
    const top = cloud.y + cloud.bounds.minY;
    const width = cloud.bounds.maxX - cloud.bounds.minX;
    const height = cloud.bounds.maxY - cloud.bounds.minY;

    if (isRectOutsideViewport(left, top, width, height, 220)) {
      ambientClouds.splice(i, 1);
    }
  }
}

function updateAmbientWind() {
  ambientWindSpawnBudget = Math.min(4, ambientWindSpawnBudget + 0.2);

  while (ambientWindSpawnBudget >= 1 && ambientWindStreaks.length < ambientWindMaxCount) {
    spawnAmbientWindStreak();
    ambientWindSpawnBudget--;
  }

  for (let i = ambientWindStreaks.length - 1; i >= 0; i--) {
    const streak = ambientWindStreaks[i];

    streak.x += streak.speedX;
    streak.y += streak.speedY;
    streak.life--;

    if (streak.y > canvas.height + 60 || streak.x < -40 || streak.x > canvas.width + 40 || streak.life <= 0) {
      ambientWindStreaks.splice(i, 1);
    }
  }
}

function drawAmbientAerialEffects() {
  drawAmbientClouds();
  drawAmbientWind();
}

function drawWorldAtmosphere() {
  const placement = getVillageBackgroundPlacement();

  if (!placement) {
    return;
  }

  const intensity = getVillageAtmosphereIntensity(placement);

  if (intensity <= 0.01 && worldAtmosphereParticles.length === 0) {
    return;
  }

  const coreIntensity = getVillageAtmosphereCoreIntensity(placement);

  if (!villageAtmosphereDebugLogged) {
    villageAtmosphereDebugLogged = true;
    console.log("Village atmosphere energy points:", {
      leftRuins: villageAtmosphereEnergyNodes[0],
      leftPit: villageAtmosphereEnergyNodes[1],
      rightPit: villageAtmosphereEnergyNodes[2],
      rightRuins: villageAtmosphereEnergyNodes[3],
      fractures: villageAtmosphereFractures
    });
  }

  drawVillageAtmosphereGlow(placement, coreIntensity);
  drawVillageAtmosphereFractures(placement, coreIntensity);
  drawVillageAtmosphereParticles(placement);
}

function drawAmbientClouds() {
  if (ambientClouds.length === 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  for (let i = 0; i < ambientClouds.length; i++) {
    const cloud = ambientClouds[i];
    const alpha = clamp(cloud.alpha, 0, 0.4);

    if (alpha <= 0.01) {
      continue;
    }

    const baseX = cloud.x;
    const baseY = cloud.y;
    const left = baseX + cloud.bounds.minX;
    const top = baseY + cloud.bounds.minY;
    const width = cloud.bounds.maxX - cloud.bounds.minX;
    const height = cloud.bounds.maxY - cloud.bounds.minY;

    if (isRectOutsideViewport(left, top, width, height, 120)) {
      continue;
    }

    for (let j = 0; j < cloud.blobs.length; j++) {
      const blob = cloud.blobs[j];
      const blobX = baseX + blob.x;
      const blobY = baseY + blob.y;
      const blobRadius = Math.max(8, blob.radius * cloud.scale);
      const blobAlpha = clamp(alpha * blob.alpha, 0, 0.4);
      const gradient = ctx.createRadialGradient(blobX, blobY, 0, blobX, blobY, blobRadius);

      gradient.addColorStop(0, "rgba(255, 255, 255, " + (blobAlpha * 0.98) + ")");
      gradient.addColorStop(0.46, "rgba(245, 249, 253, " + (blobAlpha * 0.62) + ")");
      gradient.addColorStop(1, "rgba(245, 249, 253, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blobX, blobY, blobRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawAmbientWind() {
  if (ambientWindStreaks.length === 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (let i = 0; i < ambientWindStreaks.length; i++) {
    const streak = ambientWindStreaks[i];
    const alphaProgress = streak.maxLife > 0 ? streak.life / streak.maxLife : 0;
    const alpha = clamp(streak.alpha * (0.35 + alphaProgress * 0.65), 0, 0.15);

    if (alpha <= 0.01) {
      continue;
    }

    const sway = Math.sin(streak.swaySeed + missionTimer * 0.06) * 1.2;
    const dx = Math.cos(streak.angle) * streak.length;
    const dy = Math.sin(streak.angle) * streak.length;
    const x1 = streak.x;
    const y1 = streak.y + sway;
    const x2 = x1 - dx;
    const y2 = y1 - dy;

    if (isRectOutsideViewport(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1), 30)) {
      continue;
    }

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(240, 248, 255, 1)";
    ctx.lineWidth = streak.width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = "rgba(166, 212, 255, 1)";
    ctx.lineWidth = Math.max(0.8, streak.width * 0.55);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 + Math.cos(streak.angle) * 2, y2 + Math.sin(streak.angle) * 2);
    ctx.stroke();
  }

  ctx.restore();
}

const exhaustAnimationFrameDuration = 6; // 10 fps in the 60 fps fixed update loop, matching nxeHTF.gif.
const exhaustFrames = {
  red: [
    { sx: 32, sy: 0, sw: 16, sh: 32 },
    { sx: 48, sy: 0, sw: 16, sh: 32 },
    { sx: 64, sy: 0, sw: 16, sh: 32 },
    { sx: 80, sy: 0, sw: 16, sh: 32 }
  ],
  blue: [
    { sx: 32, sy: 96, sw: 16, sh: 32 },
    { sx: 48, sy: 96, sw: 16, sh: 32 },
    { sx: 64, sy: 96, sw: 16, sh: 32 },
    { sx: 80, sy: 96, sw: 16, sh: 32 }
  ]
};

const enemyExhaustConfig = {
  taran: {
    offsets: [{ x: 0, y: -8 }]
  },
  zigzag: {
    offsets: [{ x: 0, y: 0 }]
  },
  tank: {
    offsets: [{ x: 2, y: -10 }]
  },
  web: {
    offsets: [{ x: 0, y: 0 }]
  }
};

const sprites = {
  player: {
    image: spriteSheets.player,
    sx: 0,
    sy: 0,
    sw: 811,
    sh: 953,
    drawWidth: Math.round(48 * playerJetVisualScale),
    drawHeight: Math.round(73 * playerJetVisualScale * playerJetVisualHeightScale),
    offsetX: 0,
    offsetY: 0,
    visualCenterOffsetX: 0,
    visualCenterOffsetY: 0
  },
  godmodeShield: {
    image: spriteSheets.barrier,
    sx: 88,
    sy: 0,
    sw: 88,
    sh: 88,
    drawWidth: 144,
    drawHeight: 144,
    offsetX: 0,
    offsetY: 0,
    visualCenterOffsetX: 1,
    visualCenterOffsetY: 6
  },
  enemies: {
    tank: { image: spriteSheets.enemy, sx: 24, sy: 4, sw: 64, sh: 64, drawWidth: 102, drawHeight: 102, offsetX: 0, offsetY: -2, frames: [{ sx: 24, sy: 4, sw: 64, sh: 64 }, { sx: 24, sy: 93, sw: 64, sh: 64 }, { sx: 24, sy: 180, sw: 64, sh: 64 }], frameDuration: 10 },
    normal: { image: spriteSheets.enemy, sx: 84, sy: 10, sw: 60, sh: 50, drawWidth: 89, drawHeight: 74, offsetX: 0, offsetY: -1, frames: [{ sx: 84, sy: 10, sw: 60, sh: 50 }, { sx: 84, sy: 99, sw: 60, sh: 50 }, { sx: 84, sy: 186, sw: 60, sh: 50 }], frameDuration: 9 },
    zigzag: { image: spriteSheets.enemy, sx: 143, sy: 18, sw: 46, sh: 36, drawWidth: 91, drawHeight: 72, offsetX: 0, offsetY: 0, frames: [{ sx: 143, sy: 18, sw: 46, sh: 36 }, { sx: 143, sy: 107, sw: 46, sh: 36 }, { sx: 143, sy: 194, sw: 46, sh: 36 }], frameDuration: 8 },
    web: { image: spriteSheets.enemy, sx: 192, sy: 20, sw: 34, sh: 32, drawWidth: 76, drawHeight: 70, offsetX: 0, offsetY: 0, frames: [{ sx: 192, sy: 20, sw: 34, sh: 32 }, { sx: 192, sy: 109, sw: 34, sh: 32 }, { sx: 192, sy: 196, sw: 34, sh: 32 }], frameDuration: 9 }
  },
  projectiles: {
    player: { image: spriteSheets.bulletPack, sx: 96, sy: 96, sw: 16, sh: 32, drawWidth: 16, drawHeight: 48, trailOffsetY: 14, trailAlpha: 0.42 },
    missile: {
      image: spriteSheets.tankMissileGray,
      sx: 0,
      sy: 0,
      sw: 50,
      sh: 24,
      drawWidth: 39,
      drawHeight: 22,
      baseRotation: 0
    },
    bossMissile: {
      image: spriteSheets.tankMissileStatic,
      sx: 0,
      sy: 0,
      sw: 50,
      sh: 24,
      drawWidth: 46,
      drawHeight: 26,
      baseRotation: 0,
      trailAnchorOffset: 24,
      trailDensity: 1.4,
      trailLength: 1.35,
      trailHeat: 1.2
    },
    bossLaserCapWarm: {
      image: spriteSheets.bulletPack,
      sx: 208,
      sy: 160,
      sw: 31,
      sh: 16,
      drawWidth: 42,
      drawHeight: 22
    },
    bossLaserCapMid: {
      image: spriteSheets.bulletPack,
      sx: 208,
      sy: 192,
      sw: 31,
      sh: 16,
      drawWidth: 42,
      drawHeight: 22
    },
    bossLaserCapHot: {
      image: spriteSheets.bulletPack,
      sx: 208,
      sy: 224,
      sw: 31,
      sh: 16,
      drawWidth: 42,
      drawHeight: 22
    },
    bossLaserBeamWarm: {
      image: spriteSheets.bulletPack,
      sx: 243,
      sy: 160,
      sw: 11,
      sh: 16,
      drawWidth: 18,
      drawHeight: 18
    },
    bossLaserBeamMid: {
      image: spriteSheets.bulletPack,
      sx: 243,
      sy: 192,
      sw: 11,
      sh: 16,
      drawWidth: 18,
      drawHeight: 18
    },
    bossLaserBeamHot: {
      image: spriteSheets.bulletPack,
      sx: 243,
      sy: 224,
      sw: 11,
      sh: 16,
      drawWidth: 18,
      drawHeight: 18
    },
    zigzagVolleyLarge: { image: spriteSheets.bulletPack, sx: 16, sy: 112, sw: 16, sh: 16, drawWidth: 20, drawHeight: 20 },
    zigzagVolleyMedium: { image: spriteSheets.bulletPack, sx: 32, sy: 112, sw: 16, sh: 16, drawWidth: 16, drawHeight: 16 },
    zigzagVolleySmall: { image: spriteSheets.bulletPack, sx: 48, sy: 112, sw: 16, sh: 16, drawWidth: 12, drawHeight: 12 },
    zigzagShot: { image: spriteSheets.bullets, sx: 0, sy: 0, sw: 16, sh: 24, drawWidth: 22, drawHeight: 18, zigzagSlug: true, zigzagAccentColor: "#ffd36a", zigzagCoreColor: "#ff7a2f" },
    web: {
      image: spriteSheets.webBullet,
      sx: 0,
      sy: 0,
      sw: 1254,
      sh: 1254,
      drawWidth: 22,
      drawHeight: 22,
      webClump: true,
      webThreadColor: "#f4fbff",
      webCoreColor: "#ffffff",
      webOutlineColor: "#8db3c2",
      webGlowColor: "rgba(214, 244, 255, 0.85)",
      webThreadScale: 1.38,
      rotationOffset: 0.22,
      webSpin: true,
      webPulse: true,
      webMorph: true
    },
    boss: { image: spriteSheets.bullets, sx: 72, sy: 0, sw: 16, sh: 24, drawWidth: 24, drawHeight: 24 },
    bossWeb: { image: spriteSheets.bullets, sx: 56, sy: 0, sw: 16, sh: 24, drawWidth: 24, drawHeight: 22, webClump: true, webThreadColor: "#c7d6dc", webCoreColor: "#eef7fb", webOutlineColor: "#667c86", webThreadScale: 1.25 }
  },
  exhaust: {
    player: { image: spriteSheets.exhaust, sx: 0, sy: 96, sw: 16, sh: 32, drawWidth: 12, drawHeight: 17, frames: exhaustFrames.blue, anchor: "top" },
    playerWarm: { image: spriteSheets.exhaust, sx: 0, sy: 0, sw: 16, sh: 32, drawWidth: 13, drawHeight: 31, frames: exhaustFrames.red, anchor: "top" },
    normal: { image: spriteSheets.exhaust, sx: 0, sy: 0, sw: 16, sh: 32, drawWidth: 26, drawHeight: 39, frames: exhaustFrames.red, anchor: "bottom" },
    zigzag: { image: spriteSheets.exhaust, sx: 0, sy: 0, sw: 16, sh: 32, drawWidth: 31, drawHeight: 46, frames: exhaustFrames.red, anchor: "bottom" },
    tank: { image: spriteSheets.exhaust, sx: 0, sy: 0, sw: 16, sh: 32, drawWidth: 32, drawHeight: 48, frames: exhaustFrames.red, anchor: "bottom" },
    web: { image: spriteSheets.exhaust, sx: 0, sy: 0, sw: 16, sh: 32, drawWidth: 39, drawHeight: 58, frames: exhaustFrames.red, anchor: "bottom" }
  },
  explosions: {
    orangeSmall: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 7, frameDuration: 4, drawWidth: 54, drawHeight: 54, frameSequence: [0, 1, 2, 2, 2, 3, 4], frameAlphas: [0.82, 0.98, 1, 0.92, 0.74, 0.42, 0.18], frameScales: [0.65, 0.82, 1, 1.04, 1.06, 1.09, 1.12] },
    orangeMedium: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 7, frameDuration: 4, drawWidth: 76, drawHeight: 76, frameSequence: [0, 1, 2, 2, 2, 3, 4], frameAlphas: [0.82, 0.98, 1, 0.92, 0.74, 0.42, 0.18], frameScales: [0.65, 0.82, 1, 1.04, 1.06, 1.09, 1.12] },
    redMedium: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 8, frameDuration: 5, drawWidth: 84, drawHeight: 84, frameSequence: [0, 1, 2, 2, 2, 2, 3, 4], frameAlphas: [0.9, 1, 1, 0.98, 0.84, 0.66, 0.38, 0.18], frameScales: [0.68, 0.86, 1, 1.05, 1.08, 1.1, 1.13, 1.15], colorFilter: "sepia(0.72) saturate(2.1) hue-rotate(-18deg) brightness(0.86) contrast(1.24)" },
    cyanImpact: { image: spriteSheets.explosions, sx: 0, sy: 80, frameWidth: 64, frameHeight: 80, frameCount: 4, frameDuration: 2, drawWidth: 18, drawHeight: 23 },
    tankCrimson: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 8, frameDuration: 5, drawWidth: 88, drawHeight: 88, frameSequence: [0, 1, 2, 2, 2, 2, 3, 4], frameAlphas: [0.94, 1, 1, 1, 0.88, 0.7, 0.42, 0.2], frameScales: [0.7, 0.88, 1.04, 1.09, 1.12, 1.15, 1.18, 1.2], colorFilter: "sepia(0.82) saturate(3.4) hue-rotate(-38deg) brightness(0.78) contrast(1.42)" },
    zigzagHot: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 6, frameDuration: 3, drawWidth: 64, drawHeight: 64, frameSequence: [0, 1, 2, 2, 3, 4], frameAlphas: [0.88, 1, 1, 0.8, 0.38, 0.14], frameScales: [0.6, 0.82, 1.06, 1.14, 1.17, 1.19], colorFilter: "sepia(0.8) saturate(3.8) hue-rotate(-32deg) brightness(1.05) contrast(1.34)" },
    webSmoky: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 7, frameDuration: 4, drawWidth: 74, drawHeight: 74, frameSequence: [0, 1, 2, 2, 3, 4, 5], frameAlphas: [0.62, 0.78, 0.82, 0.68, 0.42, 0.24, 0.1], frameScales: [0.72, 0.92, 1.04, 1.09, 1.15, 1.2, 1.23], colorFilter: "sepia(1) saturate(0.72) hue-rotate(18deg) brightness(0.68) contrast(0.92)" },
    bossEmberSmall: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 8, frameDuration: 4, drawWidth: 62, drawHeight: 62, frameSequence: [0, 1, 2, 2, 2, 3, 4, 5], frameAlphas: [0.94, 1, 1, 0.96, 0.78, 0.5, 0.26, 0.12], frameScales: [0.62, 0.84, 1.05, 1.1, 1.14, 1.18, 1.21, 1.24], colorFilter: "sepia(0.72) saturate(2.8) hue-rotate(-24deg) brightness(1.08) contrast(1.28)" },
    bossEmberMedium: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 8, frameDuration: 4, drawWidth: 82, drawHeight: 82, frameSequence: [0, 1, 2, 2, 2, 3, 4, 5], frameAlphas: [0.98, 1, 1, 0.98, 0.8, 0.52, 0.28, 0.14], frameScales: [0.62, 0.84, 1.06, 1.11, 1.16, 1.2, 1.23, 1.26], colorFilter: "sepia(0.72) saturate(3.0) hue-rotate(-24deg) brightness(1.12) contrast(1.32)" },
    purpleSmall: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 6, frameDuration: 3, drawWidth: 54, drawHeight: 54, frameSequence: [0, 1, 2, 2, 3, 4], frameAlphas: [0.82, 0.98, 1, 0.76, 0.36, 0.14], frameScales: [0.6, 0.82, 1.04, 1.12, 1.15, 1.17], colorFilter: "sepia(0.8) saturate(3.2) hue-rotate(-30deg) brightness(1.02) contrast(1.28)" },
    purpleMedium: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 6, frameDuration: 3, drawWidth: 62, drawHeight: 62, frameSequence: [0, 1, 2, 2, 3, 4], frameAlphas: [0.82, 0.98, 1, 0.76, 0.36, 0.14], frameScales: [0.6, 0.82, 1.04, 1.12, 1.15, 1.17], colorFilter: "sepia(0.8) saturate(3.2) hue-rotate(-30deg) brightness(1.02) contrast(1.28)" },
    greenSmall: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 7, frameDuration: 4, drawWidth: 58, drawHeight: 58, frameSequence: [0, 1, 2, 2, 3, 4, 5], frameAlphas: [0.6, 0.76, 0.82, 0.66, 0.4, 0.22, 0.1], frameScales: [0.72, 0.92, 1.04, 1.09, 1.15, 1.2, 1.23], colorFilter: "sepia(1) saturate(0.72) hue-rotate(18deg) brightness(0.68) contrast(0.92)" },
    greenMedium: { image: spriteSheets.explosionFireball, sx: 0, sy: 0, frameWidth: 192, frameHeight: 192, frameCount: 7, frameDuration: 4, drawWidth: 72, drawHeight: 72, frameSequence: [0, 1, 2, 2, 3, 4, 5], frameAlphas: [0.6, 0.76, 0.82, 0.66, 0.4, 0.22, 0.1], frameScales: [0.72, 0.92, 1.04, 1.09, 1.15, 1.2, 1.23], colorFilter: "sepia(1) saturate(0.72) hue-rotate(18deg) brightness(0.68) contrast(0.92)" }
  }
};

const bossSpriteConfig = {
  image: spriteSheets.boss,
  enabled: false,
  bodyEnabled: false,
  coreEnabled: false,
  legsEnabled: false,
  previewBodyEnabled: true,
  previewLegsEnabled: true,
  mask: {
    backgroundCutoff: { r: 8, g: 10, b: 18 },
    alpha: 0
  },
  previewBody: {
    sourceRect: { sx: 118, sy: 86, sw: 334, sh: 138 },
    drawWidth: 252,
    drawHeight: 104,
    visualOffsetX: 2,
    visualOffsetY: -18,
    destScale: 1,
    compositeOperation: "source-over"
  },
  previewLegs: {
    upper: {
      left: { sourceRect: { sx: 14, sy: 122, sw: 132, sh: 146 }, anchorX: 0.92, visualOffsetX: -3, visualOffsetY: -2 },
      right: { sourceRect: { sx: 386, sy: 122, sw: 132, sh: 146 }, anchorX: 0.08, visualOffsetX: 3, visualOffsetY: -2 },
      destScale: 1,
      widthScale: 1.04,
      heightScale: 1.01,
      anchorY: 0.16,
      visualOffsetX: 0,
      visualOffsetY: 0,
      compositeOperation: "source-over"
    },
    middle: {
      left: { sourceRect: { sx: 34, sy: 164, sw: 136, sh: 148 }, anchorX: 0.9, visualOffsetX: -2, visualOffsetY: -1 },
      right: { sourceRect: { sx: 342, sy: 164, sw: 136, sh: 148 }, anchorX: 0.1, visualOffsetX: 2, visualOffsetY: -1 },
      destScale: 1,
      widthScale: 1.03,
      heightScale: 1.01,
      anchorY: 0.16,
      visualOffsetX: 0,
      visualOffsetY: 2,
      compositeOperation: "source-over"
    },
    lower: {
      left: { sourceRect: { sx: 74, sy: 212, sw: 112, sh: 176 }, anchorX: 0.82, visualOffsetX: -1, visualOffsetY: 0 },
      right: { sourceRect: { sx: 326, sy: 212, sw: 112, sh: 176 }, anchorX: 0.18, visualOffsetX: 1, visualOffsetY: 0 },
      destScale: 1,
      widthScale: 0.98,
      heightScale: 1,
      anchorY: 0.14,
      visualOffsetX: 0,
      visualOffsetY: 4,
      compositeOperation: "source-over"
    }
  },
  body: {
    sourceRect: { sx: 634, sy: 58, sw: 318, sh: 160 },
    drawWidth: 232,
    drawHeight: 112,
    visualOffsetX: 0,
    visualOffsetY: -14,
    destScale: 1,
    pivot: { x: 0.5, y: 0.5 }
  },
  core: {
    sourceRect: { sx: 588, sy: 636, sw: 114, sh: 58 },
    drawWidth: 88,
    drawHeight: 44,
    visualOffsetX: 0,
    visualOffsetY: 2,
    destScale: 1,
    pivot: { x: 0.5, y: 0.5 }
  },
  legUpper: {
    sourceRect: { sx: 1036, sy: 84, sw: 94, sh: 61 },
    pivot: { x: 0.15, y: 0.45 },
    padding: { x: 4, y: 8 },
    visualOffsetX: 0,
    visualOffsetY: -1,
    destScale: 1,
    minDrawHeight: 26,
    mirrorOffsetX: true,
    compositeOperation: "source-over"
  },
  legLower: {
    sourceRect: { sx: 1152, sy: 88, sw: 94, sh: 56 },
    pivot: { x: 0.15, y: 0.48 },
    padding: { x: 4, y: 8 },
    visualOffsetX: 0,
    visualOffsetY: 0,
    destScale: 1,
    minDrawHeight: 24,
    mirrorOffsetX: true,
    compositeOperation: "source-over"
  },
  claw: {
    sourceRect: { sx: 1271, sy: 96, sw: 48, sh: 53 },
    enabled: false,
    pivot: { x: 0.2, y: 0.5 },
    padding: { x: 4, y: 6 },
    visualOffsetX: 0,
    visualOffsetY: 0,
    destScale: 1,
    minDrawWidth: 22,
    minDrawHeight: 24,
    mirrorOffsetX: false,
    compositeOperation: "source-over"
  },
  joint: {
    sourceRect: { sx: 1382, sy: 88, sw: 98, sh: 94 },
    pivot: { x: 0.5, y: 0.5 },
    visualOffsetX: 0,
    visualOffsetY: 0,
    destScale: 0.42,
    minDrawWidth: 18,
    minDrawHeight: 18,
    mirrorOffsetX: false,
    compositeOperation: "lighter"
  },
  anchors: {
    bodyCenter: { x: 0.5, y: 0.5 },
    legAttach: { useExistingLegOffsets: true }
  },
  pivots: {
    segmentCenter: { x: 0.5, y: 0.5 },
    clawCenter: { x: 0.5, y: 0.5 }
  },
  scales: {
    body: 1,
    core: 1,
    leg: 1.14,
    claw: 1.12
  },
  alpha: {
    normal: 1,
    legFlash: 0.82,
    bodyFlash: 0.68,
    coreIdle: 0.62,
    coreAlert: 0.84
  },
  debug: {
    bodyColor: "#44ffcc",
    bodyRectColor: "#ff8844",
    bodySpriteCenterColor: "#ff8844",
    pairStateColor: "#9efc7f",
    hitboxColor: "#ffdd55",
    destroyedColor: "#777777",
    attachColor: "#ff55ff",
    segmentColor: "#66aaff",
    visualLineColor: "#7ee7ff",
    clawColor: "#ff6666",
    pivotColor: "#ffffff",
    textColor: "#ffff66",
    label: "BOSS DEBUG: anchors / pivots / hitboxes"
  },
  legPairMapping: {
    upper: { id: 1, label: "P1", attack: "danger" },
    middle: { id: 2, label: "P2", attack: "web" },
    lower: { id: 3, label: "P3", attack: "spread" }
  },
  drawOrder: ["legs", "body", "core", "debug"]
};

const bossAssembledSpriteConfig = {
  image: spriteSheets.bossBodyClean,
  enabled: true,
  sourceRect: { sx: 182, sy: 168, sw: 1170, sh: 583 },
  drawWidth: 520,
  drawHeight: 259,
  anchorX: 0.5,
  anchorY: 0.29,
  visualOffsetX: 0,
  visualOffsetY: -2,
  parts: {
    body: { sourceRect: { sx: 490, sy: 178, sw: 556, sh: 287 } },
    upperLeft: { sourceRect: { sx: 198, sy: 218, sw: 392, sh: 302 } },
    middleLeft: { sourceRect: { sx: 256, sy: 312, sw: 266, sh: 360 } },
    lowerLeft: { sourceRect: { sx: 399, sy: 386, sw: 236, sh: 350 } },
    upperRight: { sourceRect: { sx: 949, sy: 219, sw: 391, sh: 301 } },
    middleRight: { sourceRect: { sx: 1017, sy: 307, sw: 258, sh: 365 } },
    lowerRight: { sourceRect: { sx: 903, sy: 402, sw: 230, sh: 329 } }
  },
  hitboxes: {
    body: { x: 138, y: 40, width: 244, height: 82 },
    core: { x: 188, y: 46, width: 140, height: 50 },
    upperLeft: { x: 0, y: 6, width: 206, height: 96 },
    middleLeft: { x: 10, y: 72, width: 168, height: 106 },
    lowerLeft: { x: 24, y: 126, width: 118, height: 128 },
    upperRight: { x: 314, y: 6, width: 206, height: 96 },
    middleRight: { x: 342, y: 72, width: 168, height: 106 },
    lowerRight: { x: 378, y: 126, width: 118, height: 128 }
  },
  anchors: {
    upperLeft: { x: 148, y: 40 },
    middleLeft: { x: 122, y: 96 },
    lowerLeft: { x: 122, y: 150 },
    upperRight: { x: 372, y: 40 },
    middleRight: { x: 396, y: 96 },
    lowerRight: { x: 396, y: 150 },
    // Source-space inner sockets for the boss missile attack.
    missileLeft: { sourceX: 515, sourceY: 258 },
    missileRight: { sourceX: 1019, sourceY: 258 },
    // Source-space body attachment points for the boss web attack.
    webLeft: { sourceX: 457, sourceY: 384 },
    webRight: { sourceX: 1073, sourceY: 384 },
    // Source-space body attachment points for the new spread attack.
    spreadLeft: { sourceX: 540, sourceY: 447 },
    spreadRight: { sourceX: 1003, sourceY: 441 }
  },
  bgThreshold: {
    redMin: 58,
    redLeadGreen: 10,
    redLeadBlue: 10
  }
};

const bossDamagedBodyConfig = {
  image: spriteSheets.bossDamaged,
  sourceRect: { sx: 322, sy: 261, sw: 896, sh: 299 },
  drawWidth: 372,
  drawHeight: 154,
  offsetX: 0,
  offsetY: 6
};

const bossAssembledLegMaskConfig = {
  upperLeft: {
    lineWidth: 66,
    points: [
      { x: 355, y: 44 },
      { x: 304, y: 72 },
      { x: 248, y: 118 },
      { x: 194, y: 182 },
      { x: 144, y: 248 },
      { x: 100, y: 316 }
    ]
  },
  middleLeft: {
    lineWidth: 58,
    points: [
      { x: 248, y: 108 },
      { x: 204, y: 146 },
      { x: 158, y: 202 },
      { x: 118, y: 270 },
      { x: 88, y: 358 }
    ]
  },
  lowerLeft: {
    lineWidth: 46,
    points: [
      { x: 100, y: 34 },
      { x: 81, y: 92 },
      { x: 60, y: 154 },
      { x: 39, y: 230 },
      { x: 18, y: 312 }
    ]
  },
  upperRight: {
    lineWidth: 66,
    points: [
      { x: 48, y: 44 },
      { x: 110, y: 72 },
      { x: 176, y: 122 },
      { x: 244, y: 184 },
      { x: 314, y: 248 },
      { x: 388, y: 314 }
    ]
  },
  middleRight: {
    lineWidth: 58,
    points: [
      { x: 64, y: 108 },
      { x: 112, y: 148 },
      { x: 162, y: 206 },
      { x: 214, y: 274 },
      { x: 270, y: 358 }
    ]
  },
  lowerRight: {
    lineWidth: 46,
    points: [
      { x: 78, y: 32 },
      { x: 100, y: 92 },
      { x: 122, y: 156 },
      { x: 146, y: 232 },
      { x: 164, y: 314 }
    ]
  }
};


const bossDamageAnchorConfig = {
  upperLeftLeg_anchor: { x: 138, y: 40 },
  middleLeftLeg_anchor: { x: 138, y: 96 },
  lowerLeftLeg_anchor: { x: 176, y: 132 },
  upperRightLeg_anchor: { x: 382, y: 40 },
  middleRightLeg_anchor: { x: 382, y: 96 },
  lowerRightLeg_anchor: { x: 344, y: 132 }
};

const bossDamageAnchorByLeg = {
  "upper-left": "upperLeftLeg_anchor",
  "middle-left": "middleLeftLeg_anchor",
  "lower-left": "lowerLeftLeg_anchor",
  "upper-right": "upperRightLeg_anchor",
  "middle-right": "middleRightLeg_anchor",
  "lower-right": "lowerRightLeg_anchor"
};

const bossSpriteMaskCache = {};
let bossSpriteMasksPrepared = false;
let bossSpriteMaskFailed = false;
const bossAssembledPartCanvasCache = {};
const bossAssembledBodyCanvasCache = {};
let bossAssembledSpriteFailed = false;

function drawSpriteCentered(entity, spriteConfig) {
  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const frame = getSpriteAnimationFrame(spriteConfig, entity);
  const drawWidth = spriteConfig.drawWidth || entity.width;
  const drawHeight = spriteConfig.drawHeight || entity.height;
  const drawX = entity.x + entity.width / 2 - drawWidth / 2 + (spriteConfig.offsetX || 0);
  const drawY = entity.y + entity.height / 2 - drawHeight / 2 + (spriteConfig.offsetY || 0);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteConfig.image,
    frame.sx,
    frame.sy,
    frame.sw,
    frame.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  return true;
}

function getSpriteAnimationFrame(spriteConfig, entity) {
  if (!spriteConfig.frames || spriteConfig.frames.length === 0) {
    return spriteConfig;
  }

  for (let i = 0; i < spriteConfig.frames.length; i++) {
    const frame = spriteConfig.frames[i];

    if (
      frame.sw !== spriteConfig.sw ||
      frame.sh !== spriteConfig.sh ||
      frame.sx < 0 ||
      frame.sy < 0 ||
      frame.sx + frame.sw > spriteConfig.image.width ||
      frame.sy + frame.sh > spriteConfig.image.height
    ) {
      return spriteConfig;
    }
  }

  const frameDuration = spriteConfig.frameDuration || 9;
  const seed = entity.animationOffset || 0;
  const frameIndex = Math.floor((missionTimer + seed) / frameDuration) % spriteConfig.frames.length;
  return spriteConfig.frames[frameIndex];
}

function getExhaustAnimationFrame(spriteConfig) {
  if (!spriteConfig.frames || spriteConfig.frames.length === 0) {
    return spriteConfig;
  }

  const frameIndex = Math.floor(missionTimer / exhaustAnimationFrameDuration) % spriteConfig.frames.length;
  return spriteConfig.frames[frameIndex];
}

function drawProjectileSprite(entity, spriteConfig) {
  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const drawScale = entity.drawScale || 1;
  const pulse = spriteConfig.webPulse
    ? 1 + Math.sin((entity.webPulsePhase || 0) + (entity.webPulseAge || 0) * 0.28) * 0.07
    : 1;
  const effectiveScale = drawScale * pulse;
  const drawWidth = (spriteConfig.drawWidth || entity.width) * effectiveScale;
  const drawHeight = (spriteConfig.drawHeight || entity.height) * effectiveScale;
  const morphScaleX = spriteConfig.webMorph ? (entity.webMorphScaleX || 1) : 1;
  const morphScaleY = spriteConfig.webMorph ? (entity.webMorphScaleY || 1) : 1;
  const centerX = entity.x + entity.width / 2;
  const centerY = entity.y + entity.height / 2;
  const frame = getSpriteAnimationFrame(spriteConfig, entity);
  let rotation = spriteConfig.rotation || 0;

  if (entity.speedX !== undefined || entity.speedY !== undefined) {
    const speedX = entity.speedX || 0;
    const speedY = entity.speedY || 0;
    rotation = Math.atan2(speedY, speedX) + Math.PI / 2;
  }

  rotation += spriteConfig.rotationOffset || 0;
  if (spriteConfig.webSpin) {
    rotation += entity.webSpinAngle || 0;
  }
  if (spriteConfig.webMorph) {
    rotation += entity.webMorphRotation || 0;
  }

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.scale(morphScaleX, morphScaleY);
  ctx.imageSmoothingEnabled = false;
  if (spriteConfig.trailOffsetY && spriteConfig.trailAlpha) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = spriteConfig.trailAlpha;
    ctx.drawImage(
      spriteConfig.image,
      frame.sx,
      frame.sy,
      spriteConfig.sw,
      spriteConfig.sh,
      -drawWidth / 2,
      -drawHeight / 2 + spriteConfig.trailOffsetY,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
  ctx.drawImage(
    spriteConfig.image,
    frame.sx,
    frame.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  if (spriteConfig.zigzagSlug) {
    drawZigzagProjectileAccent(spriteConfig, drawWidth, drawHeight);
  }
  if (spriteConfig.webClump) {
    drawWebProjectileClump(spriteConfig, drawWidth, drawHeight, entity);
    if (entity && entity.bossWebAttack) {
      drawBossWebProjectileAura(drawWidth, drawHeight, entity);
    }
  }
  ctx.restore();

  return true;
}

function getZigzagVolleySpriteConfig(variant) {
  if (variant === "bossRedLarge") {
    return {
      image: spriteSheets.bulletPack,
      sx: 16,
      sy: 80,
      sw: 16,
      sh: 16,
      drawWidth: 20,
      drawHeight: 20
    };
  }

  if (variant === "bossRedMedium") {
    return {
      image: spriteSheets.bulletPack,
      sx: 16,
      sy: 80,
      sw: 16,
      sh: 16,
      drawWidth: 16,
      drawHeight: 16
    };
  }

  if (variant === "bossRedSmall") {
    return {
      image: spriteSheets.bulletPack,
      sx: 16,
      sy: 80,
      sw: 16,
      sh: 16,
      drawWidth: 12,
      drawHeight: 12
    };
  }

  if (variant === "large") {
    return sprites.projectiles.zigzagVolleyLarge;
  }

  if (variant === "small") {
    return sprites.projectiles.zigzagVolleySmall;
  }

  return sprites.projectiles.zigzagVolleyMedium;
}

function drawZigzagVolleyProjectile(entity) {
  const spriteConfig = getZigzagVolleySpriteConfig(entity.zigzagVolleyVariant);

  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const drawWidth = spriteConfig.drawWidth || entity.width;
  const drawHeight = spriteConfig.drawHeight || entity.height;
  const drawX = entity.x + entity.width / 2 - drawWidth / 2;
  const drawY = entity.y + entity.height / 2 - drawHeight / 2;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.22;
  ctx.shadowColor = "rgba(255, 170, 48, 0.9)";
  ctx.shadowBlur = 4;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteConfig.image,
    spriteConfig.sx,
    spriteConfig.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    drawX - 1,
    drawY - 1,
    drawWidth + 2,
    drawHeight + 2
  );
  ctx.restore();

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteConfig.image,
    spriteConfig.sx,
    spriteConfig.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  return true;
}

function drawTankMissileSprite(entity) {
  const spriteConfig = entity.missileVariant === "boss" ? sprites.projectiles.bossMissile : sprites.projectiles.missile;

  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const drawScale = entity.drawScale || 1;
  const drawWidth = (spriteConfig.drawWidth || entity.width) * drawScale;
  const drawHeight = (spriteConfig.drawHeight || entity.height) * drawScale;
  const centerX = entity.x + entity.width / 2;
  const centerY = entity.y + entity.height / 2;
  const speedX = entity.speedX || 0;
  const speedY = entity.speedY || 0;
  const rotation = Math.atan2(speedY, speedX) + (spriteConfig.baseRotation || 0);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteConfig.image,
    spriteConfig.sx,
    spriteConfig.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  return true;
}

function drawZigzagProjectileAccent(spriteConfig, drawWidth, drawHeight) {
  const halfW = drawWidth / 2;
  const halfH = drawHeight / 2;

  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = spriteConfig.zigzagCoreColor || "#ff7a2f";
  ctx.fillRect(Math.round(-halfW * 0.1), Math.round(-halfH * 0.2), 2, Math.max(2, Math.round(drawHeight * 0.38)));
  ctx.fillRect(Math.round(-halfW * 0.34), Math.round(-halfH * 0.05), 1, 2);
  ctx.fillRect(Math.round(halfW * 0.26), Math.round(halfH * 0.02), 1, 2);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = spriteConfig.zigzagAccentColor || "#ffd36a";
  ctx.fillRect(0, Math.round(-halfH * 0.28), 1, 2);
  ctx.fillRect(Math.round(-halfW * 0.16), Math.round(halfH * 0.1), 1, 1);
  ctx.restore();
}

function drawBossWebProjectileAura(drawWidth, drawHeight, entity) {
  const age = entity.webPulseAge || 0;
  const seed = entity.bossWebSparkSeed || 0;
  const flashActive = ((age + seed) % 29) === 0;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowColor = "rgba(112, 255, 146, 0.22)";
  ctx.shadowBlur = Math.max(1, Math.round(drawWidth * 0.03));
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = "rgba(102, 255, 138, 0.12)";
  ctx.fillRect(-drawWidth * 0.06, -drawHeight * 0.01, drawWidth * 0.12, drawHeight * 0.14);

  if (flashActive) {
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "rgba(170, 255, 184, 0.98)";
    ctx.fillRect(-2, -2, 4, 4);
    ctx.fillRect(Math.round(-drawWidth * 0.05), Math.round(drawHeight * 0.01), 2, 2);
    ctx.fillRect(Math.round(drawWidth * 0.05), Math.round(-drawHeight * 0.05), 2, 2);
  }

  ctx.restore();
}

function drawWebProjectileClump(spriteConfig, drawWidth, drawHeight, entity = null) {
  const threadScale = spriteConfig.webThreadScale || 1;
  const halfW = drawWidth / 2;
  const halfH = drawHeight / 2;
  const bossWeb = !!(entity && entity.bossWebAttack);
  const seed = bossWeb ? (entity.bossWebSparkSeed || 0) : 0;
  const age = bossWeb ? (entity.webPulseAge || 0) : 0;
  const showSpark = bossWeb && ((age + seed) % 31) <= 1;
  const outlineColor = bossWeb ? "rgba(74, 255, 118, 0.9)" : (spriteConfig.webOutlineColor || "#8db3c2");
  const threadColor = bossWeb ? "rgba(130, 255, 116, 0.98)" : (spriteConfig.webThreadColor || "#f4fbff");
  const coreColor = bossWeb ? "rgba(240, 255, 240, 0.98)" : (spriteConfig.webCoreColor || "#ffffff");
  const glowColor = bossWeb ? "rgba(92, 255, 100, 0.08)" : (spriteConfig.webGlowColor || "rgba(220, 245, 255, 0.8)");

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = bossWeb ? 0.16 : 0.32;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = Math.max(1, Math.round(drawWidth * (bossWeb ? 0.025 : 0.18)));
  ctx.strokeStyle = threadColor;
  ctx.lineWidth = bossWeb ? 1.4 : 2;
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.36 * threadScale, -halfH * 0.12);
  ctx.lineTo(halfW * 0.32 * threadScale, halfH * 0.08);
  ctx.moveTo(-halfW * 0.04, -halfH * 0.34 * threadScale);
  ctx.lineTo(halfW * 0.05, halfH * 0.3 * threadScale);
  ctx.moveTo(-halfW * 0.24 * threadScale, halfH * 0.18);
  ctx.lineTo(halfW * 0.16 * threadScale, -halfH * 0.16);
  ctx.stroke();

  if (bossWeb) {
    ctx.globalAlpha = 0.58;
    ctx.strokeStyle = "rgba(83, 255, 40, 0.98)";
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(-halfW * 0.2, -halfH * 0.02);
    ctx.lineTo(-halfW * 0.03, -halfH * 0.26);
    ctx.lineTo(halfW * 0.12, -halfH * 0.03);
    ctx.moveTo(-halfW * 0.12, halfH * 0.16);
    ctx.lineTo(0, halfH * 0.03);
    ctx.lineTo(halfW * 0.1, halfH * 0.14);
    ctx.stroke();
  }

  ctx.globalAlpha = bossWeb ? 0.98 : 0.85;
  ctx.fillStyle = coreColor;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.fillRect(Math.round(-halfW * 0.16), Math.round(halfH * 0.05), 2, 2);
  ctx.fillRect(Math.round(halfW * 0.1), Math.round(-halfH * 0.16), 2, 2);

  ctx.globalAlpha = bossWeb ? 0.04 : 0.18;
  ctx.fillStyle = glowColor;
  ctx.fillRect(Math.round(-halfW * 0.08), Math.round(-halfH * 0.05), Math.max(2, Math.round(drawWidth * 0.09)), Math.max(2, Math.round(drawHeight * 0.04)));

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = bossWeb ? 0.92 : 0.92;
  ctx.fillStyle = outlineColor;
  ctx.fillRect(Math.round(-halfW * 0.34), Math.round(-halfH * 0.03), 2, 2);
  ctx.fillRect(Math.round(halfW * 0.3), Math.round(halfH * 0.1), 2, 2);
  ctx.fillRect(Math.round(-halfW * 0.02), Math.round(halfH * 0.3), 2, 2);

  if (bossWeb) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(83, 255, 40, 0.98)";
    ctx.fillRect(Math.round(-halfW * 0.11), Math.round(-halfH * 0.12), 2, 2);
    ctx.fillRect(Math.round(halfW * 0.03), Math.round(halfH * 0.03), 2, 2);
    ctx.fillRect(Math.round(-halfW * 0.16), Math.round(halfH * 0.1), 2, 2);

    if (showSpark) {
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = "rgba(182, 255, 96, 1)";
      ctx.fillRect(Math.round(-halfW * 0.1), Math.round(-halfH * 0.03), 3, 3);
      ctx.fillRect(Math.round(halfW * 0.1), Math.round(halfH * 0.04), 3, 3);
    }
  }
  ctx.restore();
}

function drawExhaustSprite(spriteConfig, nozzleX, nozzleY, options = {}) {
  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const frame = getExhaustAnimationFrame(spriteConfig);
  const drawScale = options.scale || 1;
  const drawWidth = spriteConfig.drawWidth * drawScale;
  const drawHeight = spriteConfig.drawHeight * drawScale;
  const drawX = nozzleX - drawWidth / 2 + (options.offsetX || 0);
  const drawY = spriteConfig.anchor === "bottom"
    ? nozzleY - drawHeight + (options.offsetY || 0)
    : nozzleY + (options.offsetY || 0);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = options.alpha !== undefined ? options.alpha : 1;
  ctx.drawImage(
    spriteConfig.image,
    frame.sx,
    frame.sy,
    frame.sw,
    frame.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  ctx.restore();
  return true;
}

function drawEnemyExhaust(enemy, exhaustConfig) {
  if (!exhaustConfig || !exhaustConfig.image.loaded) {
    return false;
  }

  const exhaustConfigByType = enemy.type === "normal" ? enemyExhaustConfig.taran : enemyExhaustConfig[enemy.type];
  const shipCenterX = enemy.x + enemy.width / 2;
  const shipCenterY = enemy.y + enemy.height / 2;

  for (let i = 0; i < exhaustConfigByType.offsets.length; i++) {
    const offset = exhaustConfigByType.offsets[i];
    drawExhaustSprite(exhaustConfig, shipCenterX + offset.x, shipCenterY + offset.y);
  }

  return true;
}

function getPlayerVisualPoint(localX, localY) {
  const spriteConfig = sprites.player;
  const rect = spriteConfig ? getCenteredDrawRect(player, spriteConfig) : player;
  const scaleX = 1 - playerVisualPitch * 0.7;
  const scaleY = 1 + playerVisualPitch;
  const transformedX = localX * scaleX;
  const transformedY = localY * scaleY + playerVisualPitch * playerVerticalBankOffset;
  const rotation = playerVisualTilt;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return {
    x: rect.x + rect.width / 2 + transformedX * cos - transformedY * sin,
    y: rect.y + rect.height / 2 + playerJetPivotOffsetY + transformedX * sin + transformedY * cos,
    angle: rotation
  };
}

function getCenteredDrawRect(entity, spriteConfig) {
  const drawWidth = spriteConfig.drawWidth || entity.width;
  const drawHeight = spriteConfig.drawHeight || entity.height;

  return {
    x: entity.x + entity.width / 2 - drawWidth / 2 + (spriteConfig.offsetX || 0),
    y: entity.y + entity.height / 2 - drawHeight / 2 + (spriteConfig.offsetY || 0),
    width: drawWidth,
    height: drawHeight
  };
}

function getPlayerDamageFlashCanvas() {
  return null;
}

function drawSpriteFlash(entity, spriteConfig, alpha = 0.65) {
  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const frame = getSpriteAnimationFrame(spriteConfig, entity);
  const rect = getCenteredDrawRect(entity, spriteConfig);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteConfig.image,
    frame.sx,
    frame.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    rect.x,
    rect.y,
    rect.width,
    rect.height
  );
  ctx.restore();

  return true;
}

function drawDevHitbox(entity, color) {
  if (!showDevUi) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(entity.x + 0.5, entity.y + 0.5, entity.width - 1, entity.height - 1);
  ctx.restore();
}

function isFiniteBossSpriteRect(x, y, width, height) {
  return Number.isFinite(x) &&
    Number.isFinite(y) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0;
}

function isSafeBossSpriteSource(partConfig) {
  const image = bossSpriteConfig.image;

  if (!image.loaded || !partConfig || !partConfig.sourceRect) {
    return false;
  }

  const source = partConfig.sourceRect;

  return Number.isFinite(source.sx) &&
    Number.isFinite(source.sy) &&
    Number.isFinite(source.sw) &&
    Number.isFinite(source.sh) &&
    source.sw > 0 &&
    source.sh > 0 &&
    source.sx >= 0 &&
    source.sy >= 0 &&
    source.sx + source.sw <= image.naturalWidth &&
    source.sy + source.sh <= image.naturalHeight;
}

function prepareBossSpriteMask(partConfig) {
  if (!isSafeBossSpriteSource(partConfig)) {
    bossSpriteMaskFailed = true;
    return null;
  }

  const image = bossSpriteConfig.image;
  const source = partConfig.sourceRect;
  const cacheKey = [source.sx, source.sy, source.sw, source.sh].join(":");

  if (bossSpriteMaskCache[cacheKey]) {
    return bossSpriteMaskCache[cacheKey];
  }

  try {
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = source.sw;
    maskCanvas.height = source.sh;

    const maskCtx = maskCanvas.getContext("2d");

    if (!maskCtx) {
      bossSpriteMaskFailed = true;
      return null;
    }

    maskCtx.imageSmoothingEnabled = false;
    maskCtx.drawImage(image, source.sx, source.sy, source.sw, source.sh, 0, 0, source.sw, source.sh);

    const imageData = maskCtx.getImageData(0, 0, source.sw, source.sh);
    const data = imageData.data;
    const cutoff = bossSpriteConfig.mask.backgroundCutoff;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] <= cutoff.r && data[i + 1] <= cutoff.g && data[i + 2] <= cutoff.b) {
        data[i + 3] = bossSpriteConfig.mask.alpha;
      }
    }

    maskCtx.putImageData(imageData, 0, 0);
    bossSpriteMaskCache[cacheKey] = maskCanvas;
    return maskCanvas;
  } catch (error) {
    bossSpriteMaskFailed = true;
    return null;
  }
}

function prepareBossSpriteMasks() {
  if (bossSpriteMasksPrepared || bossSpriteMaskFailed || !bossSpriteConfig.image.loaded) {
    return !bossSpriteMaskFailed && bossSpriteMasksPrepared;
  }

  const parts = [
    bossSpriteConfig.body,
    bossSpriteConfig.core,
    bossSpriteConfig.legUpper,
    bossSpriteConfig.legLower,
    bossSpriteConfig.claw
  ];

  for (let i = 0; i < parts.length; i++) {
    if (!prepareBossSpriteMask(parts[i])) {
      bossSpriteMaskFailed = true;
      return false;
    }
  }

  bossSpriteMasksPrepared = true;
  return true;
}

function canUseBossSpriteLayer() {
  return bossSpriteConfig.enabled &&
    bossSpriteConfig.image.loaded &&
    !bossSpriteMaskFailed &&
    prepareBossSpriteMasks();
}

function canUseBossBodySpritePart(partConfig, enabledFlag = true) {
  return bossSpriteConfig.enabled &&
    enabledFlag &&
    bossSpriteConfig.image.loaded &&
    isSafeBossSpriteSource(partConfig);
}

function canUseBossLegSpritePart(partConfig) {
  return bossSpriteConfig.enabled &&
    bossSpriteConfig.legsEnabled &&
    bossSpriteConfig.image.loaded &&
    isSafeBossSpriteSource(partConfig);
}

function isSafeBossAssembledSource() {
  const image = bossAssembledSpriteConfig.image;
  const source = bossAssembledSpriteConfig.sourceRect;

  return !!image &&
    image.loaded &&
    Number.isFinite(source.sx) &&
    Number.isFinite(source.sy) &&
    Number.isFinite(source.sw) &&
    Number.isFinite(source.sh) &&
    source.sw > 0 &&
    source.sh > 0 &&
    source.sx >= 0 &&
    source.sy >= 0 &&
    source.sx + source.sw <= image.naturalWidth &&
    source.sy + source.sh <= image.naturalHeight;
}

function isSafeBossAssembledPart(partConfig) {
  const image = bossAssembledSpriteConfig.image;
  const source = partConfig && partConfig.sourceRect;

  return !!image &&
    image.loaded &&
    !!source &&
    Number.isFinite(source.sx) &&
    Number.isFinite(source.sy) &&
    Number.isFinite(source.sw) &&
    Number.isFinite(source.sh) &&
    source.sw > 0 &&
    source.sh > 0 &&
    source.sx >= 0 &&
    source.sy >= 0 &&
    source.sx + source.sw <= image.naturalWidth &&
    source.sy + source.sh <= image.naturalHeight;
}

function isBossAssembledBackgroundPixel(data, index) {
  const r = data[index];
  const g = data[index + 1];
  const b = data[index + 2];
  const a = data[index + 3];
  const threshold = bossAssembledSpriteConfig.bgThreshold;

  return a > 0 &&
    r >= threshold.redMin &&
    r - g >= threshold.redLeadGreen &&
    r - b >= threshold.redLeadBlue;
}

function prepareBossAssembledPartCanvas(partConfig) {
  if (bossAssembledSpriteFailed || !isSafeBossAssembledPart(partConfig)) {
    return null;
  }

  try {
    const source = partConfig.sourceRect;
    const image = bossAssembledSpriteConfig.image;
    const cacheKey = [source.sx, source.sy, source.sw, source.sh].join(":");

    if (bossAssembledPartCanvasCache[cacheKey]) {
      return bossAssembledPartCanvasCache[cacheKey];
    }

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = source.sw;
    maskCanvas.height = source.sh;

    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });

    if (!maskCtx) {
      bossAssembledSpriteFailed = true;
      return false;
    }

    maskCtx.imageSmoothingEnabled = false;
    maskCtx.drawImage(image, source.sx, source.sy, source.sw, source.sh, 0, 0, source.sw, source.sh);

    const imageData = maskCtx.getImageData(0, 0, source.sw, source.sh);
    const data = imageData.data;
    const visited = new Uint8Array(source.sw * source.sh);
    const queue = new Int32Array(source.sw * source.sh);
    let head = 0;
    let tail = 0;

    function enqueue(x, y) {
      if (x < 0 || y < 0 || x >= source.sw || y >= source.sh) {
        return;
      }

      const pixelIndex = y * source.sw + x;

      if (visited[pixelIndex]) {
        return;
      }

      const dataIndex = pixelIndex * 4;

      if (!isBossAssembledBackgroundPixel(data, dataIndex)) {
        return;
      }

      visited[pixelIndex] = 1;
      queue[tail++] = pixelIndex;
    }

    for (let x = 0; x < source.sw; x++) {
      enqueue(x, 0);
      enqueue(x, source.sh - 1);
    }

    for (let y = 1; y < source.sh - 1; y++) {
      enqueue(0, y);
      enqueue(source.sw - 1, y);
    }

    while (head < tail) {
      const pixelIndex = queue[head++];
      const dataIndex = pixelIndex * 4;
      data[dataIndex + 3] = 0;

      const x = pixelIndex % source.sw;
      const y = Math.floor(pixelIndex / source.sw);
      enqueue(x - 1, y);
      enqueue(x + 1, y);
      enqueue(x, y - 1);
      enqueue(x, y + 1);
    }

    maskCtx.putImageData(imageData, 0, 0);
    bossAssembledPartCanvasCache[cacheKey] = maskCanvas;
    return maskCanvas;
  } catch (error) {
    bossAssembledSpriteFailed = true;
    return null;
  }
}

function prepareBossAssembledLegCanvas(partKey, sourceRect) {
  if (bossAssembledSpriteFailed || !partKey || !sourceRect) {
    return null;
  }

  const baseCanvas = prepareBossAssembledPartCanvas({ sourceRect: sourceRect });
  const maskConfig = bossAssembledLegMaskConfig[partKey];

  if (!baseCanvas || !maskConfig || !maskConfig.points || maskConfig.points.length < 2) {
    return null;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = sourceRect.sw;
    canvas.height = sourceRect.sh;

    const clipCtx = canvas.getContext("2d");

    if (!clipCtx) {
      return null;
    }

    clipCtx.save();
    clipCtx.strokeStyle = "#ffffff";
    clipCtx.fillStyle = "#ffffff";
    clipCtx.lineCap = "round";
    clipCtx.lineJoin = "round";
    clipCtx.lineWidth = maskConfig.lineWidth;
    clipCtx.beginPath();
    clipCtx.moveTo(maskConfig.points[0].x, maskConfig.points[0].y);
    for (let i = 1; i < maskConfig.points.length; i++) {
      clipCtx.lineTo(maskConfig.points[i].x, maskConfig.points[i].y);
    }
    clipCtx.stroke();

    const jointRadius = Math.max(16, maskConfig.lineWidth * 0.42);
    for (let i = 0; i < maskConfig.points.length; i++) {
      const point = maskConfig.points[i];
      const scale = i === 0 ? 1.15 : i === maskConfig.points.length - 1 ? 0.68 : 0.9;
      clipCtx.beginPath();
      clipCtx.arc(point.x, point.y, jointRadius * scale, 0, Math.PI * 2);
      clipCtx.fill();
    }

    clipCtx.globalCompositeOperation = "source-in";
    clipCtx.imageSmoothingEnabled = false;
    clipCtx.drawImage(baseCanvas, 0, 0);
    clipCtx.restore();

    return canvas;
  } catch (error) {
    return null;
  }
}

function canUseBossAssembledSprite() {
  return bossAssembledSpriteConfig.enabled &&
    isSafeBossAssembledSource();
}

function getBossAssembledDrawRect() {
  const drawWidth = bossAssembledSpriteConfig.drawWidth;
  const drawHeight = bossAssembledSpriteConfig.drawHeight;
  const anchorX = bossAssembledSpriteConfig.anchorX;
  const anchorY = bossAssembledSpriteConfig.anchorY;
  const bossCenterX = boss.x + boss.width / 2 + bossAssembledSpriteConfig.visualOffsetX;
  const bossCenterY = boss.y + boss.height / 2 + bossAssembledSpriteConfig.visualOffsetY;
  const drawX = bossCenterX - drawWidth * anchorX;
  const drawY = bossCenterY - drawHeight * anchorY;

  if (!isFiniteBossSpriteRect(drawX, drawY, drawWidth, drawHeight)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function getBossAssembledMappedRect(sourceRect) {
  const assembledRect = getBossAssembledDrawRect();
  const fullSource = bossAssembledSpriteConfig.sourceRect;

  if (!assembledRect || !sourceRect) {
    return null;
  }

  const scaleX = assembledRect.width / fullSource.sw;
  const scaleY = assembledRect.height / fullSource.sh;
  const drawX = assembledRect.x + (sourceRect.sx - fullSource.sx) * scaleX;
  const drawY = assembledRect.y + (sourceRect.sy - fullSource.sy) * scaleY;
  const drawWidth = sourceRect.sw * scaleX;
  const drawHeight = sourceRect.sh * scaleY;

  if (!isFiniteBossSpriteRect(drawX, drawY, drawWidth, drawHeight)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function getBossAssembledMappedPoint(sourcePoint) {
  const assembledRect = getBossAssembledDrawRect();
  const fullSource = bossAssembledSpriteConfig.sourceRect;

  if (!assembledRect || !sourcePoint) {
    return null;
  }

  const scaleX = assembledRect.width / fullSource.sw;
  const scaleY = assembledRect.height / fullSource.sh;
  const drawX = assembledRect.x + (sourcePoint.x - fullSource.sx) * scaleX;
  const drawY = assembledRect.y + (sourcePoint.y - fullSource.sy) * scaleY;

  if (!isFiniteBossSpriteRect(drawX, drawY, 1, 1)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY
  };
}

function getBossAssembledPartDrawRect(partKey) {
  const partConfig = bossAssembledSpriteConfig.parts[partKey];
  return partConfig ? getBossAssembledMappedRect(partConfig.sourceRect) : null;
}

function getBossAssembledHitboxRect(hitboxKey) {
  const hitboxConfig = bossAssembledSpriteConfig.hitboxes[hitboxKey];

  if (!hitboxConfig) {
    return null;
  }

  if (Number.isFinite(hitboxConfig.x) && Number.isFinite(hitboxConfig.y)) {
    const assembledRect = getBossAssembledDrawRect();

    if (!assembledRect) {
      return null;
    }

    return {
      x: assembledRect.x + hitboxConfig.x,
      y: assembledRect.y + hitboxConfig.y,
      width: hitboxConfig.width,
      height: hitboxConfig.height
    };
  }

  return getBossAssembledMappedRect(hitboxConfig);
}

function getBossAssembledAnchorPoint(anchorKey) {
  const anchorConfig = bossAssembledSpriteConfig.anchors && bossAssembledSpriteConfig.anchors[anchorKey];

  if (!anchorConfig) {
    return null;
  }

  if (Number.isFinite(anchorConfig.sourceX) && Number.isFinite(anchorConfig.sourceY)) {
    return getBossAssembledMappedPoint({ x: anchorConfig.sourceX, y: anchorConfig.sourceY });
  }

  const assembledRect = getBossAssembledDrawRect();

  if (!assembledRect) {
    return null;
  }

  return {
    x: assembledRect.x + anchorConfig.x,
    y: assembledRect.y + anchorConfig.y
  };
}

function getBossDamageAnchorLocalOrigin() {
  return {
    x: boss.width / 2 - bossAssembledSpriteConfig.drawWidth * bossAssembledSpriteConfig.anchorX + bossAssembledSpriteConfig.visualOffsetX,
    y: boss.height / 2 - bossAssembledSpriteConfig.drawHeight * bossAssembledSpriteConfig.anchorY + bossAssembledSpriteConfig.visualOffsetY
  };
}

function getBossDamageAnchorLocalPoint(anchorKey) {
  const anchorConfig = bossDamageAnchorConfig[anchorKey];

  if (!anchorConfig) {
    return null;
  }

  const origin = getBossDamageAnchorLocalOrigin();

  return {
    x: origin.x + anchorConfig.x,
    y: origin.y + anchorConfig.y
  };
}

function getBossDamageAnchorPoint(anchorKey) {
  const localPoint = getBossDamageAnchorLocalPoint(anchorKey);

  if (!localPoint) {
    return null;
  }

  return {
    x: boss.x + localPoint.x,
    y: boss.y + localPoint.y
  };
}

function getBossDamageAnchorKeyForLeg(leg) {
  if (!leg) {
    return null;
  }

  return bossDamageAnchorByLeg[leg.role + "-" + (leg.side === -1 ? "left" : "right")] || null;
}

function getBossDestroyedLegSideCount(side) {
  let count = 0;

  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];

    if (leg.side === side && !leg.alive) {
      count++;
    }
  }

  return count;
}

function getBossLegAssembledGeometry(leg) {
  if (!leg || !canUseBossAssembledSprite()) {
    return null;
  }

  const partKey = getBossLegPartKey(leg);
  const drawRect = getBossAssembledPartDrawRect(partKey);
  const localDrawRect = getBossAssembledPartLocalRect(partKey);
  const hitboxRect = getBossAssembledHitboxRect(partKey);
  const anchor = getBossAssembledAnchorPoint(partKey);
  const damageAnchorKey = getBossDamageAnchorKeyForLeg(leg);
  const damageAnchor = getBossDamageAnchorPoint(damageAnchorKey);

  if (!drawRect || !localDrawRect || !hitboxRect || !anchor) {
    return null;
  }

  return {
    leg: leg,
    legId: getBossLegDebugId(leg),
    partKey: partKey,
    assembledRect: getBossAssembledDrawRect(),
    drawRect: drawRect,
    localDrawRect: localDrawRect,
    hitboxRect: hitboxRect,
    anchor: anchor,
    damageAnchorKey: damageAnchorKey,
    damageAnchor: damageAnchor,
    clipRect: getBossOwnedLegClipRectFromHitbox(leg, hitboxRect),
    visualClipRect: getBossOwnedLegVisualClipRect(leg, drawRect),
    renderOrigin: {
      x: drawRect.x,
      y: drawRect.y
    }
  };
}

function getBossBodySpriteRect(partConfig) {
  if (!partConfig) {
    return null;
  }

  const baseScale = partConfig === bossSpriteConfig.core ? bossSpriteConfig.scales.core : bossSpriteConfig.scales.body;
  const destScale = Number.isFinite(partConfig.destScale) ? partConfig.destScale : 1;
  const drawWidth = partConfig.drawWidth * baseScale * destScale;
  const drawHeight = partConfig.drawHeight * baseScale * destScale;
  const drawX = boss.x + boss.width / 2 - drawWidth / 2 + (partConfig.visualOffsetX || 0);
  const drawY = boss.y + boss.height / 2 - drawHeight / 2 + (partConfig.visualOffsetY || 0);

  if (!isFiniteBossSpriteRect(drawX, drawY, drawWidth, drawHeight)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function getPrimaryBossBodyConfig() {
  if (bossSpriteConfig.previewBodyEnabled && canUseBossBodySpritePart(bossSpriteConfig.previewBody, true)) {
    return bossSpriteConfig.previewBody;
  }

  if (canUseBossBodySpritePart(bossSpriteConfig.body, bossSpriteConfig.bodyEnabled)) {
    return bossSpriteConfig.body;
  }

  return null;
}

function getBossPreviewLegConfig(leg) {
  if (!leg || !bossSpriteConfig.previewLegsEnabled) {
    return null;
  }

  const roleConfig = bossSpriteConfig.previewLegs[leg.role];

  if (!roleConfig) {
    return null;
  }

  const sideConfig = leg.side === -1 ? roleConfig.left : roleConfig.right;

  if (!sideConfig || !isSafeBossSpriteSource(sideConfig)) {
    return null;
  }

  return {
    sourceRect: sideConfig.sourceRect,
    compositeOperation: roleConfig.compositeOperation || "lighter",
    destScale: Number.isFinite(roleConfig.destScale) ? roleConfig.destScale : 1,
    widthScale: Number.isFinite(roleConfig.widthScale) ? roleConfig.widthScale : 1,
    heightScale: Number.isFinite(roleConfig.heightScale) ? roleConfig.heightScale : 1,
    anchorX: Number.isFinite(sideConfig.anchorX) ? sideConfig.anchorX : 0.5,
    anchorY: Number.isFinite(roleConfig.anchorY) ? roleConfig.anchorY : 0.18,
    visualOffsetX: (roleConfig.visualOffsetX || 0) + (sideConfig.visualOffsetX || 0),
    visualOffsetY: (roleConfig.visualOffsetY || 0) + (sideConfig.visualOffsetY || 0)
  };
}

function getBossPreviewLegMotion(leg) {
  return {
    offsetX: 0,
    offsetY: 0
  };
}

function getBossPreviewLegDrawRect(leg) {
  const legConfig = getBossPreviewLegConfig(leg);

  if (!legConfig) {
    return null;
  }

  const legBox = getBossLegBox(leg);
  const attachX = boss.x + leg.offsetX;
  const attachY = boss.y + leg.offsetY;
  const motion = getBossPreviewLegMotion(leg);
  const drawWidth = legBox.width * legConfig.widthScale * legConfig.destScale;
  const drawHeight = legBox.height * legConfig.heightScale * legConfig.destScale;
  const drawX = attachX - drawWidth * legConfig.anchorX + legConfig.visualOffsetX + motion.offsetX;
  const drawY = attachY - drawHeight * legConfig.anchorY + legConfig.visualOffsetY + motion.offsetY;

  if (!isFiniteBossSpriteRect(drawX, drawY, drawWidth, drawHeight)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function drawBossDirectSpritePart(partConfig, drawRect, alpha = 1, flipX = false, rotation = 0) {
  if (!canUseBossBodySpritePart(partConfig) || !drawRect || !isFiniteBossSpriteRect(drawRect.x, drawRect.y, drawRect.width, drawRect.height) || !Number.isFinite(alpha) || !Number.isFinite(rotation)) {
    return false;
  }

  const source = partConfig.sourceRect;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = partConfig.compositeOperation || "source-over";
  ctx.imageSmoothingEnabled = false;
  ctx.translate(drawRect.x + drawRect.width / 2, drawRect.y + drawRect.height / 2);
  ctx.rotate(rotation);

  if (flipX) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    bossSpriteConfig.image,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    -drawRect.width / 2,
    -drawRect.height / 2,
    drawRect.width,
    drawRect.height
  );
  ctx.restore();
  return true;
}

function drawBossSpriteHighlightPart(partConfig, drawRect, alpha = 0.35, flipX = false, rotation = 0) {
  if (!canUseBossBodySpritePart(partConfig) || !drawRect || !isFiniteBossSpriteRect(drawRect.x, drawRect.y, drawRect.width, drawRect.height) || !Number.isFinite(alpha) || !Number.isFinite(rotation)) {
    return false;
  }

  const source = partConfig.sourceRect;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "lighter";
  ctx.imageSmoothingEnabled = false;
  ctx.translate(drawRect.x + drawRect.width / 2, drawRect.y + drawRect.height / 2);
  ctx.rotate(rotation);

  if (flipX) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    bossSpriteConfig.image,
    source.sx,
    source.sy,
    source.sw,
    source.sh,
    -drawRect.width / 2,
    -drawRect.height / 2,
    drawRect.width,
    drawRect.height
  );
  ctx.restore();
  return true;
}

function getBossLegSpriteDrawRect(partConfig, leg, segment) {
  if (!partConfig || !leg || !segment) {
    return null;
  }

  const padding = partConfig.padding || { x: 0, y: 0 };
  const baseScale = partConfig === bossSpriteConfig.claw ? bossSpriteConfig.scales.claw : bossSpriteConfig.scales.leg;
  const destScale = Number.isFinite(partConfig.destScale) ? partConfig.destScale : 1;
  const mirrorSign = partConfig.mirrorOffsetX ? leg.side : 1;
  const drawWidth = Math.max(partConfig.minDrawWidth || 0, segment.width + padding.x) * baseScale * destScale;
  const drawHeight = Math.max(partConfig.minDrawHeight || 0, segment.height + padding.y) * baseScale * destScale;
  const drawX = segment.x + segment.width / 2 - drawWidth / 2 + (partConfig.visualOffsetX || 0) * mirrorSign;
  const drawY = segment.y + segment.height / 2 - drawHeight / 2 + (partConfig.visualOffsetY || 0);

  if (!isFiniteBossSpriteRect(drawX, drawY, drawWidth, drawHeight)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function getBossVisualPartDrawRect(partConfig, visualPart) {
  if (!partConfig || !visualPart) {
    return null;
  }

  const baseScale = partConfig === bossSpriteConfig.claw ? bossSpriteConfig.scales.claw : partConfig === bossSpriteConfig.joint ? 1 : bossSpriteConfig.scales.leg;
  const destScale = Number.isFinite(partConfig.destScale) ? partConfig.destScale : 1;
  const drawWidth = Math.max(partConfig.minDrawWidth || 0, visualPart.width) * baseScale * destScale;
  const drawHeight = Math.max(partConfig.minDrawHeight || 0, visualPart.height) * baseScale * destScale;
  const drawX = visualPart.x - drawWidth / 2 + (partConfig.visualOffsetX || 0);
  const drawY = visualPart.y - drawHeight / 2 + (partConfig.visualOffsetY || 0);

  if (!isFiniteBossSpriteRect(drawX, drawY, drawWidth, drawHeight)) {
    return null;
  }

  return {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight
  };
}

function getMaskedBossSpriteCanvas(partConfig) {
  if (!bossSpriteMasksPrepared || !isSafeBossSpriteSource(partConfig)) {
    return null;
  }

  const source = partConfig.sourceRect;
  const cacheKey = [source.sx, source.sy, source.sw, source.sh].join(":");
  return bossSpriteMaskCache[cacheKey] || null;
}

function drawBossSpritePart(partConfig, x, y, width, height, flipX = false, alpha = 1) {
  if (!isFiniteBossSpriteRect(x, y, width, height) || !Number.isFinite(alpha)) {
    return false;
  }

  const maskedCanvas = getMaskedBossSpriteCanvas(partConfig);

  if (!maskedCanvas) {
    return false;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x + width / 2, y + height / 2);

  if (flipX) {
    ctx.scale(-1, 1);
  }

  ctx.drawImage(maskedCanvas, -width / 2, -height / 2, width, height);
  ctx.restore();
  return true;
}

const boss = {
  active: false,
  x: 0,
  y: 70,
  prevX: 0,
  prevY: 70,
  velocityX: 0,
  velocityY: 0,
  width: 180,
  height: 80,
  hp: 80,
  maxHp: 80,
  hitFlash: 0,
  speed: 1.2,
  baseSpeed: 1.2,
  direction: 1,
  directionChangeTimer: 180,
  shootTimer: 90,
  shootDelay: 110,
  baseShootDelay: 110,
  spreadAttackActive: false,
  spreadAttackSources: [],
  spreadAttackDebugQueues: { "-1": [], "1": [] },
  webShootTimer: 140,
  webShootDelay: 150,
  baseWebShootDelay: 150,
  telegraphDuration: 25,
  webTelegraphDuration: 30,
  dangerZoneTimer: 180,
  dangerZoneDelay: 210,
  baseDangerZoneDelay: 210,
  dangerZoneWarningDuration: 48,
  dangerZoneActiveDuration: 120,
  rageFlashTimer: 0,
  majorAttackLockTimer: 0,
  lastDestroyedLegCount: 0,
  destroyedPairBurstFlags: { upper: false, middle: false, lower: false },
  nextAttackSide: { lower: -1, middle: 1, upper: -1 },
  introActive: false,
  introTimer: 0,
  introDuration: 180,
  introWarningDuration: 70,
  introStartY: -260,
  introTargetY: 70,
  introShakeTimer: 0,
  legs: [],
  damageEmitters: []
};

window.__bossResearch = {
  resetBossForFrame() {
    scene = "game";
    isPaused = false;
    startBossPhase();
    boss.introActive = false;
    boss.introTimer = 0;
    boss.x = canvas.width / 2 - boss.width / 2;
    boss.y = 70;
    boss.prevX = boss.x;
    boss.prevY = boss.y;
    boss.velocityX = 0;
    boss.velocityY = 0;
    boss.hitFlash = 0;
    boss.rageFlashTimer = 0;
    boss.majorAttackLockTimer = 0;
    boss.nextAttackSide = { lower: -1, middle: 1, upper: -1 };
  },
  setDebugOverlay(enabled) {
    gameplayDebugOverlayMode = enabled ? gameplayDebugOverlayModes.visual : gameplayDebugOverlayModes.normal;
  },
  setCollisionPrototypeOverlay(enabled) {
    gameplayDebugOverlayMode = enabled ? gameplayDebugOverlayModes.tech : gameplayDebugOverlayModes.normal;
  },
  setDebugOverlayMode(mode) {
    if (mode === gameplayDebugOverlayModes.visual || mode === gameplayDebugOverlayModes.tech || mode === gameplayDebugOverlayModes.normal) {
      gameplayDebugOverlayMode = mode;
    }
  },
  setLegPairState(role, alive) {
    const nextAlive = !!alive;

    for (let i = 0; i < boss.legs.length; i++) {
      const leg = boss.legs[i];

      if (leg.role !== role) {
        continue;
      }

      leg.alive = nextAlive;
      leg.destroyed = !nextAlive;
      leg.hp = nextAlive ? leg.maxHp : 0;
      leg.hitFlash = 0;
      leg.sparkTimer = 0;
    }

    boss.destroyedPairBurstFlags[role] = !nextAlive;
    boss.lastDestroyedLegCount = getDestroyedBossLegCount();
    updateBossDamageEmitters();
  },
  setAllLegPairsAlive() {
    this.setLegPairState("upper", true);
    this.setLegPairState("middle", true);
    this.setLegPairState("lower", true);
  }
};


    // РРіСЂРѕРє С‚РµРїРµСЂСЊ РіР°СЂР°РЅС‚РёСЂРѕРІР°РЅРЅРѕ РІРёРґРµРЅ
    const player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 80,
      width: 40,
      height: 40,
      speed: 4,
      hp: 5,
      slowTimer: 0,
      damageCooldown: 0
    };

    // =========================
    // INPUT
    // =========================

function unlockAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playTone(frequency, duration, type = "square", volume = 0.035, slideTo = frequency) {
  const soundContext = unlockAudio();

  if (!soundContext) {
    return;
  }

  const oscillator = soundContext.createOscillator();
  const gain = soundContext.createGain();
  const now = soundContext.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.connect(gain);
  gain.connect(soundContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function playUiSound() {
  playTone(520, 0.045, "square", 0.018, 760);
}

function playShootSound() {
  playTone(820, 0.055, "square", 0.009, 520);
}

function playHitSound() {
  playTone(240, 0.05, "sawtooth", 0.018, 130);
}

function playZigzagVolleySound() {
  const soundContext = unlockAudio();

  if (!soundContext) {
    return;
  }

  const now = soundContext.currentTime;
  const burstTimes = [0, 0.055, 0.11];

  for (let i = 0; i < burstTimes.length; i++) {
    const startOffset = burstTimes[i];
    const oscillator = soundContext.createOscillator();
    const gain = soundContext.createGain();
    const accent = i === 0 ? 1 : i === 1 ? 0.88 : 0.76;

    oscillator.type = i === 2 ? "triangle" : "square";
    oscillator.frequency.setValueAtTime(i === 0 ? 980 : i === 1 ? 910 : 840, now + startOffset);
    oscillator.frequency.exponentialRampToValueAtTime(i === 0 ? 650 : i === 1 ? 590 : 520, now + startOffset + 0.05);
    gain.gain.setValueAtTime(0.0001, now + startOffset);
    gain.gain.linearRampToValueAtTime(0.009 * accent, now + startOffset + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.045);

    oscillator.connect(gain);
    gain.connect(soundContext.destination);
    oscillator.start(now + startOffset);
    oscillator.stop(now + startOffset + 0.055);
  }
}

function playBossSpreadBurstSound() {
  const soundContext = unlockAudio();

  if (!soundContext) {
    return;
  }

  const now = soundContext.currentTime;
  const burstTimes = [0, 0.038, 0.076];
  const freqs = [760, 690, 610];

  for (let i = 0; i < burstTimes.length; i++) {
    const startOffset = burstTimes[i];
    const oscillator = soundContext.createOscillator();
    const gain = soundContext.createGain();

    oscillator.type = i === 2 ? "triangle" : "square";
    oscillator.frequency.setValueAtTime(freqs[i], now + startOffset);
    oscillator.frequency.exponentialRampToValueAtTime(freqs[i] * 0.72, now + startOffset + 0.045);
    gain.gain.setValueAtTime(0.0001, now + startOffset);
    gain.gain.linearRampToValueAtTime(0.012 - i * 0.0018, now + startOffset + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + 0.034);

    oscillator.connect(gain);
    gain.connect(soundContext.destination);
    oscillator.start(now + startOffset);
    oscillator.stop(now + startOffset + 0.04);
  }
}

function activateZigzagVolleyBullet(bullet) {
  const sourceEnemy = bullet.zigzagVolleySourceEnemy;
  const sourceX = sourceEnemy
    ? (Number.isFinite(bullet.zigzagVolleySourceOffsetX)
      ? sourceEnemy.x + bullet.zigzagVolleySourceOffsetX
      : sourceEnemy.x + sourceEnemy.width / 2)
    : bullet.x + bullet.width / 2;
  const sourceY = sourceEnemy
    ? (Number.isFinite(bullet.zigzagVolleySourceOffsetY)
      ? sourceEnemy.y + bullet.zigzagVolleySourceOffsetY
      : sourceEnemy.y + sourceEnemy.height - 2)
    : bullet.y + bullet.height / 2;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const dx = playerCenterX - sourceX;
  const dy = playerCenterY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const sourceVelocityX = bullet.zigzagVolleySourceVelocityX || 0;
  const sourceVelocityY = bullet.zigzagVolleySourceVelocityY || 0;
  const drift = bullet.zigzagVolleyDrift || 1;

  bullet.x = sourceX - bullet.width / 2;
  bullet.y = sourceY - bullet.height / 2;
  bullet.speedX = dx / distance * 3.4 * drift + sourceVelocityX * 0.22;
  bullet.speedY = dy / distance * 3.4 * drift + sourceVelocityY * 0.22;
  bullet.spawnDelay = 0;
  bullet.zigzagVolleyReleased = true;
  bullet.debugSpreadSpawnX = sourceX;
  bullet.debugSpreadSpawnY = sourceY;
}

function createBossSpreadVolleyBullet(part, side, shotNumber, muzzle, playerCenterX, playerCenterY, sourceVelocityX, sourceVelocityY) {
  const sourceX = muzzle.x;
  const sourceY = muzzle.y;
  const dx = playerCenterX - sourceX;
  const dy = playerCenterY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const speedX = dx / distance * 3.4 * part.drift + sourceVelocityX * 0.22;
  const speedY = dy / distance * 3.4 * part.drift + sourceVelocityY * 0.22;
  const spriteConfig = getZigzagVolleySpriteConfig(part.variant);

  return {
    type: "zigzagShot",
    zigzagVolleyVariant: part.variant,
    spriteConfig: spriteConfig,
    x: sourceX - part.size / 2,
    y: sourceY - part.size / 2,
    width: part.size,
    height: part.size,
    damage: 1 / 3,
    speedX: speedX,
    speedY: speedY,
    spawnDelay: part.delay,
    bossSpreadBurst: true,
    bossSpreadBurstReleased: part.delay <= 0,
    bossSpreadSourceX: sourceX,
    bossSpreadSourceY: sourceY,
    bossSpreadSpeedX: speedX,
    bossSpreadSpeedY: speedY,
    debugSpreadSide: side,
    debugSpreadShotNumber: shotNumber,
    debugSpreadVariant: part.variant,
    debugSpreadSpawnX: sourceX,
    debugSpreadSpawnY: sourceY,
    debugSpreadMuzzleX: sourceX,
    debugSpreadMuzzleY: sourceY
  };
}

function activateBossSpreadVolleyBullet(bullet) {
  if (!bullet || !bullet.bossSpreadBurst) {
    return;
  }

  bullet.x = bullet.bossSpreadSourceX - bullet.width / 2;
  bullet.y = bullet.bossSpreadSourceY - bullet.height / 2;
  bullet.spawnDelay = 0;
  bullet.bossSpreadBurstReleased = true;
  bullet.debugSpreadSpawnX = bullet.bossSpreadSourceX;
  bullet.debugSpreadSpawnY = bullet.bossSpreadSourceY;
}

function playExplosionSound() {
  playTone(120, 0.16, "sawtooth", 0.03, 45);
}

function playExplosionSoundLimited(cooldownFrames = 8) {
  if (explosionSoundCooldown > 0) {
    return;
  }

  playExplosionSound();
  explosionSoundCooldown = cooldownFrames;
}

function playWarningSound(volumeMultiplier = 1) {
  playTone(180, 0.18, "triangle", 0.028 * volumeMultiplier, 260);
}

function playBossCoreLaserStartSound() {
}

function playBossCoreLaserStartStubSound() {
}

function playBossMissileProximityBeep() {
  playTone(1320, 0.075, "square", 0.018, 1680);
}

function playBossMissileLaunchSound() {
  playTankMissileLaunchSound(1.22, true);
}

function playTankMissileLaunchSound(volumeMultiplier = 1, force = false) {
  if (!force && tankMissileSoundCooldown > 0) {
    return;
  }

  const soundContext = unlockAudio();

  if (!soundContext) {
    return;
  }

  const now = soundContext.currentTime;
  const noiseBuffer = soundContext.createBuffer(1, Math.floor(soundContext.sampleRate * 0.14), soundContext.sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  for (let i = 0; i < channel.length; i++) {
    channel[i] = (Math.random() * 2 - 1) * 0.22;
  }

  const source = soundContext.createBufferSource();
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();
  const tone = soundContext.createOscillator();
  const toneGain = soundContext.createGain();
  const thump = soundContext.createOscillator();
  const thumpGain = soundContext.createGain();

  source.buffer = noiseBuffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1320, now);
  filter.frequency.exponentialRampToValueAtTime(620, now + 0.26);
  filter.Q.setValueAtTime(0.72, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.048 * volumeMultiplier, now + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  tone.type = "sawtooth";
  tone.frequency.setValueAtTime(210, now);
  tone.frequency.exponentialRampToValueAtTime(126, now + 0.22);
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.linearRampToValueAtTime(0.022 * volumeMultiplier, now + 0.011);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  thump.type = "triangle";
  thump.frequency.setValueAtTime(108, now);
  thump.frequency.exponentialRampToValueAtTime(62, now + 0.14);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.linearRampToValueAtTime(0.028, now + 0.008);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundContext.destination);
  tone.connect(toneGain);
  toneGain.connect(soundContext.destination);
  thump.connect(thumpGain);
  thumpGain.connect(soundContext.destination);
  source.start(now);
  source.stop(now + 0.26);
  tone.start(now);
  tone.stop(now + 0.22);
  thump.start(now);
  thump.stop(now + 0.14);
  if (!force) {
    tankMissileSoundCooldown = 9;
  }
}

function ensureTankMissileFlightHiss() {
  const soundContext = unlockAudio();

  if (!soundContext) {
    return null;
  }

  if (tankMissileFlightHiss.source && tankMissileFlightHiss.gain && tankMissileFlightHiss.filter) {
    return tankMissileFlightHiss;
  }

  const noiseBuffer = soundContext.createBuffer(1, Math.floor(soundContext.sampleRate * 0.5), soundContext.sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  for (let i = 0; i < channel.length; i++) {
    channel[i] = (Math.random() * 2 - 1) * 0.18;
  }

  const source = soundContext.createBufferSource();
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();

  source.buffer = noiseBuffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, soundContext.currentTime);
  filter.Q.setValueAtTime(0.55, soundContext.currentTime);
  gain.gain.setValueAtTime(0.0001, soundContext.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundContext.destination);
  source.start(soundContext.currentTime);

  tankMissileFlightHiss.source = source;
  tankMissileFlightHiss.filter = filter;
  tankMissileFlightHiss.gain = gain;
  return tankMissileFlightHiss;
}

function updateTankMissileFlightHiss() {
  const activeMissiles = scene === "game" && !isPaused ? countActiveHomingMissiles() : 0;

  if (activeMissiles <= 0) {
    if (tankMissileFlightHiss.gain && audioContext) {
      tankMissileFlightHiss.gain.gain.cancelScheduledValues(audioContext.currentTime);
      tankMissileFlightHiss.gain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.08);
    }
    return;
  }

  const hiss = ensureTankMissileFlightHiss();

  if (!hiss) {
    return;
  }

  const now = audioContext.currentTime;
  const targetGain = Math.min(0.026, 0.015 + Math.max(0, activeMissiles - 1) * 0.005);
  const targetFrequency = 820 + activeMissiles * 90;

  hiss.gain.gain.cancelScheduledValues(now);
  hiss.gain.gain.setTargetAtTime(targetGain, now, 0.05);
  hiss.filter.frequency.cancelScheduledValues(now);
  hiss.filter.frequency.setTargetAtTime(targetFrequency, now, 0.08);
}

function countActiveBossMissiles() {
  let activeCount = 0;

  for (let i = 0; i < bossBullets.length; i++) {
    if (bossBullets[i].type === "missile") {
      activeCount++;
    }
  }

  return activeCount;
}

function ensureBossMissileFlightLoop() {
  const soundContext = unlockAudio();

  if (!soundContext) {
    return null;
  }

  if (bossMissileFlightLoop.source && bossMissileFlightLoop.gain && bossMissileFlightLoop.filter) {
    return bossMissileFlightLoop;
  }

  const noiseBuffer = soundContext.createBuffer(1, Math.floor(soundContext.sampleRate * 0.45), soundContext.sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  for (let i = 0; i < channel.length; i++) {
    channel[i] = (Math.random() * 2 - 1) * 0.16;
  }

  const source = soundContext.createBufferSource();
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();

  source.buffer = noiseBuffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(760, soundContext.currentTime);
  filter.Q.setValueAtTime(0.62, soundContext.currentTime);
  gain.gain.setValueAtTime(0.0001, soundContext.currentTime);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundContext.destination);
  source.start(soundContext.currentTime);

  bossMissileFlightLoop.source = source;
  bossMissileFlightLoop.filter = filter;
  bossMissileFlightLoop.gain = gain;
  bossMissileFlightLoop.tone = null;
  bossMissileFlightLoop.toneGain = null;
  return bossMissileFlightLoop;
}

function stopBossMissileFlightLoop(immediate = false) {
  if (!bossMissileFlightLoop.source && !bossMissileFlightLoop.gain && !bossMissileFlightLoop.filter) {
    return;
  }

  if (audioContext && bossMissileFlightLoop.gain) {
    const now = audioContext.currentTime;
    bossMissileFlightLoop.gain.gain.cancelScheduledValues(now);
    bossMissileFlightLoop.gain.gain.setTargetAtTime(0.0001, now, immediate ? 0.01 : 0.06);
  }

  if (bossMissileFlightLoop.source && audioContext) {
    try {
      bossMissileFlightLoop.source.stop(audioContext.currentTime + (immediate ? 0.02 : 0.12));
    } catch (error) {
      // Ignore double-stop cleanup races.
    }
  }

  bossMissileFlightLoop.source = null;
  bossMissileFlightLoop.filter = null;
  bossMissileFlightLoop.gain = null;
  bossMissileFlightLoop.tone = null;
  bossMissileFlightLoop.toneGain = null;
}

function ensureBossCoreLaserLoop() {
  const soundContext = unlockAudio();

  if (!soundContext) {
    return null;
  }

  if (
    bossCoreLaserLoop.source &&
    bossCoreLaserLoop.gain &&
    bossCoreLaserLoop.filter &&
    bossCoreLaserLoop.tone &&
    bossCoreLaserLoop.toneGain
  ) {
    return bossCoreLaserLoop;
  }

  const noiseBuffer = soundContext.createBuffer(1, Math.floor(soundContext.sampleRate * 0.6), soundContext.sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  for (let i = 0; i < channel.length; i++) {
    channel[i] = (Math.random() * 2 - 1) * 0.12;
  }

  const source = soundContext.createBufferSource();
  const filter = soundContext.createBiquadFilter();
  const gain = soundContext.createGain();
  const tone = soundContext.createOscillator();
  const toneGain = soundContext.createGain();
  const now = soundContext.currentTime;

  source.buffer = noiseBuffer;
  source.loop = true;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(920, now);
  filter.Q.setValueAtTime(0.92, now);
  gain.gain.setValueAtTime(0.0001, now);

  tone.type = "triangle";
  tone.frequency.setValueAtTime(126, now);
  toneGain.gain.setValueAtTime(0.0001, now);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(soundContext.destination);
  tone.connect(toneGain);
  toneGain.connect(soundContext.destination);
  source.start(now);
  tone.start(now);

  bossCoreLaserLoop.source = source;
  bossCoreLaserLoop.filter = filter;
  bossCoreLaserLoop.gain = gain;
  bossCoreLaserLoop.tone = tone;
  bossCoreLaserLoop.toneGain = toneGain;
  return bossCoreLaserLoop;
}

function stopBossCoreLaserLoop(immediate = false) {
  if (!bossCoreLaserLoop.source && !bossCoreLaserLoop.gain && !bossCoreLaserLoop.filter && !bossCoreLaserLoop.tone && !bossCoreLaserLoop.toneGain) {
    return;
  }

  if (audioContext && bossCoreLaserLoop.gain) {
    const now = audioContext.currentTime;
    bossCoreLaserLoop.gain.gain.cancelScheduledValues(now);
    bossCoreLaserLoop.gain.gain.setTargetAtTime(0.0001, now, immediate ? 0.01 : 0.06);
  }

  if (audioContext && bossCoreLaserLoop.toneGain) {
    const now = audioContext.currentTime;
    bossCoreLaserLoop.toneGain.gain.cancelScheduledValues(now);
    bossCoreLaserLoop.toneGain.gain.setTargetAtTime(0.0001, now, immediate ? 0.01 : 0.08);
  }

  if (bossCoreLaserLoop.source && audioContext) {
    try {
      bossCoreLaserLoop.source.stop(audioContext.currentTime + (immediate ? 0.02 : 0.12));
    } catch (error) {
      // Ignore double-stop cleanup races.
    }
  }

  if (bossCoreLaserLoop.tone && audioContext) {
    try {
      bossCoreLaserLoop.tone.stop(audioContext.currentTime + (immediate ? 0.02 : 0.12));
    } catch (error) {
      // Ignore double-stop cleanup races.
    }
  }

  bossCoreLaserLoop.source = null;
  bossCoreLaserLoop.filter = null;
  bossCoreLaserLoop.gain = null;
  bossCoreLaserLoop.tone = null;
  bossCoreLaserLoop.toneGain = null;
}

function updateBossCoreLaserLoop() {
  stopBossCoreLaserLoop(true);
  return;

  const activeLaser = scene === "game" && !isPaused && boss.active && !boss.introActive && !bossDeathSequence.active && bossCoreLaser.state !== "idle";

  if (!activeLaser) {
    stopBossCoreLaserLoop(false);
    return;
  }

  const loop = ensureBossCoreLaserLoop();

  if (!loop || !audioContext) {
    return;
  }

  const destroyedPairs = Math.max(0, Math.min(3, getDestroyedBossLegPairCount()));
  const stageProfiles = [
    { freq: 760, tone: 112, gain: 0.018 },
    { freq: 900, tone: 124, gain: 0.024 },
    { freq: 1040, tone: 138, gain: 0.032 },
    { freq: 1180, tone: 154, gain: 0.041 }
  ];
  const stage = stageProfiles[destroyedPairs];
  const chargeProgress = bossCoreLaser.state === "charging"
    ? 1 - bossCoreLaser.timer / bossCoreLaser.chargeDuration
    : 1;
  const activeBoost = bossCoreLaser.state === "active" ? 1.14 : 0.82 + chargeProgress * 0.22;
  const pulse = 0.92 + Math.sin(bossAnimationTimer * 0.2) * 0.06;
  const now = audioContext.currentTime;
  const targetGain = stage.gain * activeBoost * pulse;
  const targetFrequency = stage.freq * (bossCoreLaser.state === "charging" ? 0.94 + chargeProgress * 0.04 : 1.02);
  const targetTone = stage.tone * (bossCoreLaser.state === "charging" ? 0.98 + chargeProgress * 0.02 : 1.05);

  loop.gain.gain.cancelScheduledValues(now);
  loop.gain.gain.setTargetAtTime(targetGain, now, 0.04);
  loop.filter.frequency.cancelScheduledValues(now);
  loop.filter.frequency.setTargetAtTime(targetFrequency, now, 0.06);
  loop.filter.Q.cancelScheduledValues(now);
  loop.filter.Q.setTargetAtTime(0.92 + destroyedPairs * 0.12, now, 0.08);
  loop.tone.frequency.cancelScheduledValues(now);
  loop.tone.frequency.setTargetAtTime(targetTone, now, 0.05);
  loop.toneGain.gain.cancelScheduledValues(now);
  loop.toneGain.gain.setTargetAtTime(targetGain * 0.38, now, 0.05);
}

function updateBossMissileFlightLoop() {
  const activeMissiles = scene === "game" && !isPaused ? countActiveBossMissiles() : 0;

  if (activeMissiles <= 0) {
    stopBossMissileFlightLoop(false);
    return;
  }

  const loop = ensureBossMissileFlightLoop();

  if (!loop || !audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const targetGain = Math.min(0.032, (0.015 + Math.max(0, activeMissiles - 1) * 0.005) * 1.22);
  const targetFrequency = (820 + activeMissiles * 90) * 0.98;

  loop.gain.gain.cancelScheduledValues(now);
  loop.gain.gain.setTargetAtTime(targetGain, now, 0.05);
  loop.filter.frequency.cancelScheduledValues(now);
  loop.filter.frequency.setTargetAtTime(targetFrequency, now, 0.08);
}

function adjustTimeScale(multiplier) {
  timeScale = Math.min(8, Math.max(0.25, timeScale * multiplier));
}

function formatTimeScale() {
  return Number.isInteger(timeScale) ? timeScale.toFixed(0) : timeScale.toString();
}

function clearInputState() {
  for (const key in keys) {
    delete keys[key];
  }
}

function clearPlayerSlowEffect() {
  player.slowTimer = 0;
  playerWebOverlay.active = false;
  playerWebOverlay.timer = 0;
}

function setInputKeyState(event, isPressed) {
  const key = event.key ? event.key.toLowerCase() : "";

  if (key) {
    keys[key] = isPressed;
  }

  if (event.code === "KeyW") {
    keys["w"] = isPressed;
  } else if (event.code === "KeyA") {
    keys["a"] = isPressed;
  } else if (event.code === "KeyS") {
    keys["s"] = isPressed;
  } else if (event.code === "KeyD") {
    keys["d"] = isPressed;
  } else if (event.code === "ArrowUp") {
    keys["arrowup"] = isPressed;
  } else if (event.code === "ArrowDown") {
    keys["arrowdown"] = isPressed;
  } else if (event.code === "ArrowLeft") {
    keys["arrowleft"] = isPressed;
  } else if (event.code === "ArrowRight") {
    keys["arrowright"] = isPressed;
  } else if (event.code === "Space") {
    keys["space"] = isPressed;
  }
}

window.addEventListener("keydown", (event) => {
  unlockAudio();
  setInputKeyState(event, true);

  if (!event.repeat && event.code === "F8") {
    scene = scene === "fontCompare" ? "menu" : "fontCompare";
    clearInputState();
    return;
  }

  if (scene === "game" && (event.code === "KeyP" || event.code === "Escape") && !event.repeat) {
    isPaused = !isPaused;
    clearInputState();
  }

  if (scene === "game" && event.code === "KeyV" && !event.repeat) {
    jumpToNextMissionPhase();
  }

  if (scene === "game" && event.code === "KeyC" && !event.repeat) {
    jumpToPreviousMissionPhase();
  }

  if (scene === "game" && event.code === "KeyZ" && !event.repeat) {
    isPlayerInvulnerable = !isPlayerInvulnerable;

    if (isPlayerInvulnerable) {
      clearPlayerSlowEffect();
    }
  }

  if (scene === "game" && event.code === "KeyB" && !event.repeat) {
    cycleGameplayDebugOverlayMode();
  }

  if (!event.repeat && event.code === "KeyQ") {
    adjustTimeScale(0.5);
  }

  if (!event.repeat && event.code === "KeyE") {
    adjustTimeScale(2);
  }

});

window.addEventListener("keyup", (event) => {
  setInputKeyState(event, false);
});

window.addEventListener("blur", () => {
  clearInputState();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInputState();
  }
});

// =========================
// UPDATE
// =========================

function update() {
  if (tankMissileSoundCooldown > 0) {
    tankMissileSoundCooldown--;
  }

  updateTankMissileFlightHiss();
  updateBossMissileFlightLoop();

  if (scene === "game" && !isPaused) {
    const slowMotionActive = slowMotionTimer > 0;

    if (slowMotionActive) {
      slowMotionTimer--;
      slowMotionFrame++;
    }

    missionTimer++;

    if (player.hp > 0 && player.hp <= 2) {
      runStats.criticalHpFrames++;
    }

    if (missionTimer >= 120 * 60 && !boss.active) {
      startBossPhase();
    }

    moveStars();
    updatePlayerDamageCooldown();
    updateBossRage();
    updateBossIntro();
    updateWorldAtmosphere();
    updateAmbientClouds();
    updateAmbientWind();
    movePlayer();
    handleShooting();

    if (slowMotionActive && slowMotionFrame % 2 === 1) {
      moveImpactFlashes();
      moveDelayedExplosions();
      moveDelayedParticleBursts();
      moveSpriteExplosions();
      moveParticles();
      movePlayerSpeedEffects();
      moveWorldAtmosphereParticles();
      moveMuzzleFlashes();
      moveBossAttackTelegraphs();
      return;
    }

    moveBullets();

    if (!boss.active) {
      spawnEnemies();
    }

    moveEnemies();
    moveEnemyBullets();
    updateEnemyHazardZones();
    moveWebBullets();
    updatePlayerWebOverlay();

    if (bossDeathSequence.active) {
      updateBossDeathSequence();
      updateBossDangerZones();
      moveBossBullets();
      moveBossWebBullets();
      moveBossAttackTelegraphs();
      checkBulletEnemyCollisions();
      checkPlayerEnemyCollisions();
      checkEnemyBulletPlayerCollisions();
      checkEnemyHazardZonePlayerCollisions();
      checkWebBulletPlayerCollisions();
      checkBossBulletPlayerCollisions();
    checkBossWebBulletPlayerCollisions();
    checkBossDangerZonePlayerCollision();
    moveImpactFlashes();
    cleanupDestroyedBullets();
    moveDelayedExplosions();
    moveDelayedParticleBursts();
    moveSpriteExplosions();
      moveParticles();
      moveMuzzleFlashes();
      return;
    }

    moveBoss();
    handleBossShooting();
    updateBossDangerZones();
    updateBossCoreLaser();
    moveBossBullets();
    moveBossWebBullets();
    moveBossAttackTelegraphs();
    checkBulletEnemyCollisions();
    checkBulletBossCollisions();
    checkPlayerEnemyCollisions();
    checkEnemyBulletPlayerCollisions();
    checkEnemyHazardZonePlayerCollisions();
    checkWebBulletPlayerCollisions();
    checkBossBulletPlayerCollisions();
    checkBossWebBulletPlayerCollisions();
    checkBossDangerZonePlayerCollision();
    checkBossCoreLaserPlayerCollision();
    checkBossPlayerCollision();
    checkBossLegPlayerCollisions();
    cleanupDestroyedBullets();
    moveImpactFlashes();
    moveDelayedExplosions();
    moveDelayedParticleBursts();
    moveSpriteExplosions();
    moveParticles();
    movePlayerSpeedEffects();
    moveWorldAtmosphereParticles();
    moveMuzzleFlashes();
  }
}

function movePlayer() {
  const startX = player.x;
  const startY = player.y;
  let currentSpeed = player.speed;
  let horizontalInput = 0;
  let verticalInput = 0;

  if (isPlayerInvulnerable && player.slowTimer > 0) {
    clearPlayerSlowEffect();
  } else if (player.slowTimer > 0) {
    currentSpeed = player.speed * 0.5;
    player.slowTimer--;
  }

  if (keys["w"] || keys["arrowup"]) {
    player.y -= currentSpeed;
    verticalInput--;
  }

  if (keys["s"] || keys["arrowdown"]) {
    player.y += currentSpeed;
    verticalInput++;
  }

  if (keys["a"] || keys["arrowleft"]) {
    player.x -= currentSpeed;
    horizontalInput--;
  }

  if (keys["d"] || keys["arrowright"]) {
    player.x += currentSpeed;
    horizontalInput++;
  }

  const targetTilt = horizontalInput * playerJetRollTarget;
  const targetPitch = verticalInput * playerVerticalBankMax;
  playerVisualTilt += (targetTilt - playerVisualTilt) * 0.14;
  playerVisualTilt = Math.max(-playerJetRollClamp, Math.min(playerJetRollClamp, playerVisualTilt));
  const targetExhaustTilt = playerVisualTilt;
  const exhaustFollowRate = horizontalInput !== 0 ? playerExhaustTiltFollow : playerExhaustTiltReturn;
  playerExhaustTilt += (targetExhaustTilt - playerExhaustTilt) * exhaustFollowRate;
  playerExhaustTilt = Math.max(-playerJetRollClamp, Math.min(playerJetRollClamp, playerExhaustTilt));
  playerVisualPitch += (targetPitch - playerVisualPitch) * 0.2;
  playerVisualPitch = Math.max(-playerVerticalBankMax, Math.min(playerVerticalBankMax, playerVisualPitch));

  // Р“СЂР°РЅРёС†С‹ СЌРєСЂР°РЅР°

  if (player.x < 0) {
    player.x = 0;
  }

  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  if (player.y < 0) {
    player.y = 0;
  }

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }

  updatePlayerSpeedEffects(player.x - startX, player.y - startY);
}

function spawnPlayerSpeedParticle(kind, centerX, centerY, dirX, dirY, intensity) {
  const localRadius = canvas.width * (0.22 + intensity * 0.06);
  const angle = Math.random() * Math.PI * 2;
  const radial = localRadius * (0.22 + Math.random() * 0.58);
  const spawnX = centerX + Math.cos(angle) * radial;
  const spawnY = centerY + Math.sin(angle) * radial;
  const perpX = -dirY;
  const perpY = dirX;
  const lateral = (Math.random() - 0.5) * (kind === "streak" ? 0.26 : 0.18);
  const lineDirX = dirX + perpX * lateral;
  const lineDirY = dirY + perpY * lateral;
  const lineDirLength = Math.max(0.001, Math.hypot(lineDirX, lineDirY));
  const normX = lineDirX / lineDirLength;
  const normY = lineDirY / lineDirLength;
  const speed = kind === "small"
    ? 12 + intensity * 7
    : kind === "depth"
      ? 10 + intensity * 6.5
      : 14 + intensity * 7.5;
  const length = kind === "small"
    ? 4 + Math.random() * 5 + intensity * 1.5
    : kind === "depth"
      ? 12 + Math.random() * 10 + intensity * 4
      : 22 + Math.random() * 16 + intensity * 8;
  const life = kind === "small"
    ? 16 + Math.floor(Math.random() * 8)
    : kind === "depth"
      ? 20 + Math.floor(Math.random() * 10)
      : 18 + Math.floor(Math.random() * 8);

  playerSpeedStreaks.push({
    kind: kind,
    x: spawnX,
    y: spawnY,
    vx: normX * speed,
    vy: normY * speed,
    length: length,
    alpha: kind === "small"
      ? 0.36 + intensity * 0.16
      : kind === "depth"
        ? 0.32 + intensity * 0.14
        : 0.38 + intensity * 0.18,
    life: life,
    maxLife: life,
    radius: localRadius
  });
}

function updatePlayerSpeedEffects(moveX, moveY) {
  const moveMagnitude = Math.hypot(moveX, moveY);
  const upComponent = moveY < 0 ? clamp((-moveY) / (player.speed || 1), 0, 1) : 0;
  const lateralComponent = clamp(Math.abs(moveX) / (player.speed || 1), 0, 1);
  const targetIntensity = moveY < 0 ? clamp(upComponent * 0.84 + lateralComponent * 0.16, 0, 1) : 0;
  playerSpeedEffectIntensity += (targetIntensity - playerSpeedEffectIntensity) * 0.14;
  playerSpeedEffectIntensity = clamp(playerSpeedEffectIntensity, 0, 1);

  const targetVectorMag = Math.max(0.001, moveMagnitude);
  const targetVector = targetIntensity > 0.01
    ? {
      x: -moveX / targetVectorMag,
      y: -moveY / targetVectorMag
    }
    : {
      x: 0,
      y: 1
    };

  const directionLerp = 0.14;
  playerSpeedSmoothedDirection.x += (targetVector.x - playerSpeedSmoothedDirection.x) * directionLerp;
  playerSpeedSmoothedDirection.y += (targetVector.y - playerSpeedSmoothedDirection.y) * directionLerp;
  const smoothMag = Math.max(0.001, Math.hypot(playerSpeedSmoothedDirection.x, playerSpeedSmoothedDirection.y));
  playerSpeedSmoothedDirection.x /= smoothMag;
  playerSpeedSmoothedDirection.y /= smoothMag;

  if (playerSpeedEffectIntensity > 0.03 && moveMagnitude > 0.05) {
    playerSpeedEffectSpawnBudget += 0.22 + playerSpeedEffectIntensity * 0.2;
  } else {
    playerSpeedEffectSpawnBudget = Math.max(0, playerSpeedEffectSpawnBudget - 0.18);
  }

  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const dirX = playerSpeedSmoothedDirection.x;
  const dirY = playerSpeedSmoothedDirection.y;
  const cycle = ["small", "small", "depth", "small", "streak"];

  while (playerSpeedEffectSpawnBudget >= 1 && playerSpeedStreaks.length < playerSpeedEffectMaxParticles) {
    const kind = cycle[playerSpeedEffectSpawnPhase % cycle.length];
    playerSpeedEffectSpawnPhase++;
    spawnPlayerSpeedParticle(kind, centerX, centerY, dirX, dirY, playerSpeedEffectIntensity);
    playerSpeedEffectSpawnBudget--;
  }
}

function movePlayerSpeedEffects() {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const localRadius = canvas.width * (0.22 + playerSpeedEffectIntensity * 0.06) + 70;

  for (let i = playerSpeedStreaks.length - 1; i >= 0; i--) {
    const particle = playerSpeedStreaks[i];

    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.life--;

    if (
      particle.life <= 0 ||
      isPointOutsideViewport(particle.x, particle.y, particle.radius + 80) ||
      (particle.x - centerX) * (particle.x - centerX) + (particle.y - centerY) * (particle.y - centerY) > localRadius * localRadius
    ) {
      playerSpeedStreaks.splice(i, 1);
    }
  }
}

function cleanupDestroyedBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].destroyed) {
      bullets.splice(i, 1);
    }
  }
}

function createPlayerBullet(x, y) {
  bullets.push({
    x: x - 4,
    y: y - 22,
    width: 8,
    height: 24,
    speed: 7,
    damage: 0.5,
    destroyed: false
  });
}

function handleShooting() {
  if (shootCooldown > 0) {
    shootCooldown--;
  }

  if (keys["space"] && shootCooldown <= 0) {
    const leftMount = getPlayerVisualPoint(-11, -10);
    const rightMount = getPlayerVisualPoint(11, -10);

    createPlayerBullet(leftMount.x, leftMount.y);
    createPlayerBullet(rightMount.x, rightMount.y);

    playShootSound();
    shootCooldown = shootCooldownMax;
  }
}

function moveBullets() {

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].destroyed) {
      continue;
    }

    bullets[i].y -= bullets[i].speed;

    if (bullets[i].y + bullets[i].height < 0) {
      bullets[i].destroyed = true;
    }
  }

  cleanupDestroyedBullets();
}

function moveStars() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].y += stars[i].speed;

    if (stars[i].y > canvas.height) {
      stars[i].y = 0;
      stars[i].x = Math.random() * canvas.width;
    }
  }
}

function registerBackgroundLayer(src, options = {}) {
  const image = new Image();

  image.src = src;
  backgroundImageLayers.push({
    image,
    fullCanvas: true,
    alpha: options.alpha ?? 1,
    scrollSpeed: options.scrollSpeed ?? 0
  });
}

function registerBackgroundObject(src, options = {}) {
  const image = new Image();

  image.src = src;
  backgroundObjectLayers.push({
    image,
    fullCanvas: false,
    x: options.x ?? 0,
    y: options.y ?? 0,
    alpha: options.alpha ?? 1,
    scrollSpeed: options.scrollSpeed ?? 0
  });
}

function spawnEnemies() {
  enemySpawnTimer++;

  if (enemySpawnTimer >= getCurrentEnemySpawnDelay()) {
    const missionSeconds = Math.floor(missionTimer / 60);
    const randomEnemy = Math.random();

    if (missionSeconds < 15) {
      spawnNormalEnemy();
    } else if (missionSeconds < 45) {
      if (randomEnemy < 0.22 && countEnemiesOfType("tank") < 1) {
        spawnTankEnemy();
      } else {
        spawnNormalEnemy();
      }
    } else if (missionSeconds < 75) {
      if (randomEnemy < 0.17 && countEnemiesOfType("tank") < 1) {
        spawnTankEnemy();
      } else if (randomEnemy < 0.50) {
        spawnZigzagEnemy();
      } else {
        spawnNormalEnemy();
      }
    } else {
      if (randomEnemy < 0.16 && countEnemiesOfType("tank") < 1) {
        spawnTankEnemy();
      } else if (randomEnemy < 0.42) {
        spawnWebEnemy();
      } else if (randomEnemy < 0.68) {
        spawnZigzagEnemy();
      } else {
        spawnNormalEnemy();
      }

      spawnExtraPressureEnemy();
    }

    enemySpawnTimer = 0;
  }
}

function getCurrentEnemySpawnDelay() {
  const missionSeconds = Math.floor(missionTimer / 60);

  if (missionSeconds >= 75) {
    const spikeWindow = missionSeconds % 40 >= 34;
    return spikeWindow ? 44 : 56;
  }

  if (missionSeconds >= 45) {
    const spikeWindow = missionSeconds % 45 >= 39;
    return spikeWindow ? 52 : 64;
  }

  return enemySpawnDelay;
}

function spawnExtraPressureEnemy() {
  const missionSeconds = Math.floor(missionTimer / 60);
  const spikeWindow = missionSeconds % 40 >= 34;
  const chance = spikeWindow ? 0.24 : 0.08;

  if (Math.random() > chance) {
    return;
  }

  const randomEnemy = Math.random();
  const canAddTank = countEnemiesOfType("tank") < 1 && countActiveHomingMissiles() < 1;

  if (canAddTank && randomEnemy < 0.12) {
    spawnTankEnemy();
  } else if (randomEnemy < 0.56) {
    spawnZigzagEnemy();
  } else {
    spawnWebEnemy();
  }
}

function countEnemiesOfType(type) {
  let count = 0;

  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].type === type) {
      count++;
    }
  }

  return count;
}

function countActiveHomingMissiles() {
  let count = 0;

  for (let i = 0; i < enemyBullets.length; i++) {
    if (enemyBullets[i].type === "missile") {
      count++;
    }
  }

  return count;
}

const enemySpawnSpacing = 14;

function getEnemySpawnOverlapScore(x, y, width, height) {
  let overlapScore = 0;
  const paddedLeft = x - enemySpawnSpacing;
  const paddedTop = y - enemySpawnSpacing;
  const paddedRight = x + width + enemySpawnSpacing;
  const paddedBottom = y + height + enemySpawnSpacing;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const enemyLeft = enemy.x;
    const enemyTop = enemy.y;
    const enemyRight = enemy.x + enemy.width;
    const enemyBottom = enemy.y + enemy.height;

    if (
      paddedLeft < enemyRight &&
      paddedRight > enemyLeft &&
      paddedTop < enemyBottom &&
      paddedBottom > enemyTop
    ) {
      const overlapWidth = Math.min(paddedRight, enemyRight) - Math.max(paddedLeft, enemyLeft);
      const overlapHeight = Math.min(paddedBottom, enemyBottom) - Math.max(paddedTop, enemyTop);
      overlapScore += Math.max(0, overlapWidth) * Math.max(0, overlapHeight);
    }
  }

  return overlapScore;
}

function findEnemySpawnPosition(width, height, baseY) {
  const maxX = Math.max(0, canvas.width - width);
  const yCandidates = [baseY, baseY - 16, baseY - 32, baseY - 48];
  let bestCandidate = { x: 0, y: baseY, score: Infinity };

  for (let yIndex = 0; yIndex < yCandidates.length; yIndex++) {
    const y = yCandidates[yIndex];

    for (let attempt = 0; attempt < 14; attempt++) {
      const x = Math.random() * maxX;
      const score = getEnemySpawnOverlapScore(x, y, width, height);

      if (score === 0) {
        return { x: x, y: y };
      }

      if (score < bestCandidate.score) {
        bestCandidate = { x: x, y: y, score: score };
      }
    }
  }

  const scanSteps = 24;
  for (let yIndex = 0; yIndex < yCandidates.length; yIndex++) {
    const y = yCandidates[yIndex];

    for (let step = 0; step <= scanSteps; step++) {
      const x = maxX * (step / scanSteps);
      const score = getEnemySpawnOverlapScore(x, y, width, height);

      if (score === 0) {
        return { x: x, y: y };
      }

      if (score < bestCandidate.score) {
        bestCandidate = { x: x, y: y, score: score };
      }
    }
  }

  return { x: bestCandidate.x, y: bestCandidate.y };
}

function spawnNormalEnemy() {
  const spawnPoint = findEnemySpawnPosition(63, 58, -40);

  enemies.push({
    type: "normal",
    x: spawnPoint.x,
    y: spawnPoint.y,
    width: 63,
    height: 58,
    speed: 2,
    hp: 2,
    hitFlash: 0,
    animationOffset: Math.floor(Math.random() * 60)
  });
}

function spawnTankEnemy() {
  const spawnPoint = findEnemySpawnPosition(72, 72, -70);

  enemies.push({
    type: "tank",
    x: spawnPoint.x,
    y: spawnPoint.y,
    width: 72,
    height: 72,
    speed: 1,
    hp: 6,
    hitFlash: 0,
    animationOffset: Math.floor(Math.random() * 60),
    shootTimer: Math.round((120 + Math.random() * 120) * tankMissileAttackIntervalMultiplier)
  });
}

function spawnWebEnemy() {
  const spawnPoint = findEnemySpawnPosition(58, 54, -45);

  enemies.push({
    type: "web",
    x: spawnPoint.x,
    y: spawnPoint.y,
    width: 58,
    height: 54,
    speed: 1.6,
    hp: 4,
    hitFlash: 0,
    animationOffset: Math.floor(Math.random() * 60),
    shootTimer: (90 + Math.random() * 80) * webShootIntervalMultiplier
  });
}

function spawnZigzagEnemy() {
  const zigzagDirection = Math.random() < 0.5 ? -1 : 1;
  const spawnPoint = findEnemySpawnPosition(64, 56, -40);
  enemies.push({
    type: "zigzag",
    x: spawnPoint.x,
    y: spawnPoint.y,
    width: 64,
    height: 56,
    speed: 2.1,
    hp: 2,
    hitFlash: 0,
    animationOffset: Math.floor(Math.random() * 60),
    zigzagSpeed: 3.0,
    zigzagDirection,
    zigzagTargetDirection: zigzagDirection,
    zigzagDirectionLerp: 0.12,
    directionChangeTimer: 60,
    shootTimer: 100 + Math.random() * 100
  });
}

function moveEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hitFlash > 0) {
      enemies[i].hitFlash--;
    }

    enemies[i].y += enemies[i].speed;

    if (enemies[i].type === "zigzag") {
      if (!Number.isFinite(enemies[i].zigzagTargetDirection)) {
        enemies[i].zigzagTargetDirection = enemies[i].zigzagDirection >= 0 ? 1 : -1;
      }

      enemies[i].directionChangeTimer--;

      if (enemies[i].directionChangeTimer <= 0) {
        if (Math.random() < 0.5) {
          enemies[i].zigzagTargetDirection *= -1;
        }

        enemies[i].directionChangeTimer = 60;
      }

      enemies[i].zigzagDirection += (enemies[i].zigzagTargetDirection - enemies[i].zigzagDirection) * enemies[i].zigzagDirectionLerp;
      enemies[i].x += enemies[i].zigzagSpeed * enemies[i].zigzagDirection;

      if (enemies[i].x < 0) {
        enemies[i].x = 0;
        enemies[i].zigzagDirection = 1;
        enemies[i].zigzagTargetDirection = 1;
      }

      if (enemies[i].x + enemies[i].width > canvas.width) {
        enemies[i].x = canvas.width - enemies[i].width;
        enemies[i].zigzagDirection = -1;
        enemies[i].zigzagTargetDirection = -1;
      }

      enemies[i].shootTimer--;

      if (enemies[i].shootTimer <= 0) {
        fireZigzagShot(enemies[i]);
        enemies[i].shootTimer = 120 + Math.random() * 120;
      }
    }

    if (enemies[i].type === "tank" && enemies[i].y + enemies[i].height <= canvas.height) {
      enemies[i].shootTimer--;

      if (enemies[i].shootTimer <= 0) {
        fireTankHomingMissile(enemies[i]);
        enemies[i].shootTimer = Math.round((130 + Math.random() * 110) * tankMissileAttackIntervalMultiplier);
      }
    }

    if (enemies[i].type === "web") {
      enemies[i].shootTimer--;

      if (enemies[i].shootTimer <= 0) {
        const dx = (player.x + player.width / 2) - (enemies[i].x + enemies[i].width / 2);
        const dy = (player.y + player.height / 2) - (enemies[i].y + enemies[i].height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        webBullets.push({
          x: enemies[i].x + enemies[i].width / 2 - 8,
          y: enemies[i].y + enemies[i].height,
          width: 16,
          height: 16,
          baseWidth: 16,
          baseHeight: 16,
          drawScale: 0.5,
          growAge: 0,
          growDuration: 84,
          webPulsePhase: Math.random() * Math.PI * 2,
          webPulseAge: 0,
          webSpinAngle: Math.random() * Math.PI * 2,
          webSpinSpeed: (0.06 + Math.random() * 0.03) * (Math.random() < 0.5 ? -1 : 1),
          webMorphPhase: Math.random() * Math.PI * 2,
          webMorphAge: 0,
          webMorphScaleX: 1,
          webMorphScaleY: 1,
          webMorphRotation: 0,
          webMorphSpinLag: 0,
          bossWebAttack: false,
          speedX: dx / distance * 2.25,
          speedY: dy / distance * 2.25
        });
        runStats.webAttacksLaunched++;

        enemies[i].shootTimer = (90 + Math.random() * 80) * webShootIntervalMultiplier;
      }
    }

    if (enemies[i].y > canvas.height) {
      enemies.splice(i, 1);
    }
  }
}

function fireTankHomingMissile(enemy) {
  if (enemy.y + enemy.height > canvas.height || countActiveHomingMissiles() >= 2) {
    return;
  }

  const launchDirection = player.x + player.width / 2 < enemy.x + enemy.width / 2 ? -1 : 1;
  const startX = launchDirection === -1 ? enemy.x - 8 : enemy.x + enemy.width - 6;
  const startY = enemy.y + enemy.height * 0.55;
  runStats.tankMissilesLaunched++;

  enemyBullets.push({
    type: "missile",
    x: startX,
    y: startY,
    width: 14,
    height: 22,
    speedX: launchDirection * 3.2,
    speedY: 0.35,
    speed: 2.8,
    turnRate: 0.09,
    launchTimer: 18,
    trailTimer: 0,
    trailAnchorOffset: 18,
    missileVariant: "tank",
    life: 150,
    maxLife: 150
  });

  playTankMissileLaunchSound();
}

function fireZigzagShot(enemy) {
  const startX = enemy.x + enemy.width / 2;
  const startY = enemy.y + enemy.height - 2;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const dx = playerCenterX - startX;
  const dy = playerCenterY - startY;
  const volleyParts = [
    { variant: "large", delay: 0, size: 20, damage: 1 / 3 },
    { variant: "medium", delay: 65, size: 16, damage: 1 / 3 },
    { variant: "small", delay: 130, size: 12, damage: 1 / 3 }
  ];

  playZigzagVolleySound();

  for (let i = 0; i < volleyParts.length; i++) {
    const part = volleyParts[i];
    const bullet = {
      type: "zigzagShot",
      zigzagVolleyVariant: part.variant,
      x: startX - part.size / 2,
      y: startY - part.size / 2,
      width: part.size,
      height: part.size,
      damage: part.damage,
      zigzagVolleySourceEnemy: enemy
    };

    if (part.delay <= 0) {
      activateZigzagVolleyBullet(bullet);
    } else {
      bullet.spawnDelay = part.delay;
    }

    enemyBullets.push(bullet);
  }

  createMuzzleFlash(startX, startY, Math.atan2(dy, dx), "#ff9cff", 12);
}

function moveEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];

    if (bullet.spawnDelay !== undefined && bullet.spawnDelay > 0) {
      if (bullet.bossSpreadBurst) {
        bullet.x = bullet.bossSpreadSourceX - bullet.width / 2;
        bullet.y = bullet.bossSpreadSourceY - bullet.height / 2;
      } else {
        const sourceEnemy = bullet.zigzagVolleySourceEnemy;
        if (sourceEnemy) {
          const sourceX = Number.isFinite(bullet.zigzagVolleySourceOffsetX)
            ? sourceEnemy.x + bullet.zigzagVolleySourceOffsetX
            : sourceEnemy.x + sourceEnemy.width / 2;
          const sourceY = Number.isFinite(bullet.zigzagVolleySourceOffsetY)
            ? sourceEnemy.y + bullet.zigzagVolleySourceOffsetY
            : sourceEnemy.y + sourceEnemy.height - 2;
          bullet.x = sourceX - bullet.width / 2;
          bullet.y = sourceY - bullet.height / 2;
        }
      }

      bullet.spawnDelay -= 16;
      if (bullet.spawnDelay > 0) {
        continue;
      }

      if (bullet.bossSpreadBurst) {
        activateBossSpreadVolleyBullet(bullet);
      } else {
        activateZigzagVolleyBullet(bullet);
      }
    }

    if (bullet.spawnDelay !== undefined && bullet.spawnDelay > 0) {
      continue;
    }

    if (bullet.type === "missile") {
      updateHomingMissile(bullet);
      bullet.life--;

      if (bullet.life <= 0) {
        explodeEnemyMissile(i);
        continue;
      }
    } else if (bullet.speedX !== undefined) {
      bullet.x += bullet.speedX;
      bullet.y += bullet.speedY;
    } else {
      bullet.y += bullet.speed;
    }

    if (
      bullet.y > canvas.height + 40 ||
      bullet.x < -40 ||
      bullet.x > canvas.width + 40
    ) {
      if (bullet.type === "missile") {
        explodeEnemyMissile(i);
      } else {
        enemyBullets.splice(i, 1);
      }
    }
  }
}

function updateHomingMissile(missile) {
  if (missile.launchTimer > 0) {
    missile.launchTimer--;
    missile.x += missile.speedX;
    missile.y += missile.speedY;
    createTankMissileTrail(missile);
    return;
  }

  const targetX = player.x + player.width / 2;
  const targetY = player.y + player.height / 2;
  const missileX = missile.x + missile.width / 2;
  const missileY = missile.y + missile.height / 2;
  const dx = targetX - missileX;
  const dy = targetY - missileY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const desiredX = dx / distance * missile.speed;
  const desiredY = dy / distance * missile.speed;

  missile.speedX += (desiredX - missile.speedX) * missile.turnRate;
  missile.speedY += (desiredY - missile.speedY) * missile.turnRate;
  missile.x += missile.speedX;
  missile.y += missile.speedY;
  createTankMissileTrail(missile);
}

function createTankMissileTrail(missile) {
  missile.trailTimer = (missile.trailTimer || 0) - 1;

  if (missile.trailTimer > 0) {
    return;
  }

  missile.trailTimer = 0;

  const speedX = missile.speedX || 0;
  const speedY = missile.speedY || 1;
  const speed = Math.sqrt(speedX * speedX + speedY * speedY) || 1;
  const dirX = speedX / speed;
  const dirY = speedY / speed;
  const sideX = -dirY;
  const sideY = dirX;
  const missileVariant = missile.missileVariant || "tank";
  const isBossMissile = missileVariant === "boss";
  const trailDensity = missile.trailDensity || 1;
  const trailLength = missile.trailLength || 1;
  const trailHeat = missile.trailHeat || 1;
  const trailAnchorOffset = missile.trailAnchorOffset || 0;
  const centerX = missile.x + missile.width / 2;
  const centerY = missile.y + missile.height / 2;
  const anchorX = centerX - dirX * trailAnchorOffset;
  const anchorY = centerY - dirY * trailAnchorOffset;
  const particleCount = Math.max(1, Math.round((isBossMissile ? 10 : 7) * trailDensity));

  for (let i = 0; i < particleCount; i++) {
    const ember = isBossMissile ? i <= 3 : i <= 2;
    const distance = isBossMissile
      ? (ember ? 10 + i * 6 : 24 + i * 9 + Math.random() * 14)
      : (ember ? 8 + i * 5 : 20 + i * 8 + Math.random() * 12);
    const stretchedDistance = distance * trailLength;
    const drift = (Math.random() - 0.5) * (ember ? (isBossMissile ? 10 : 8) : (isBossMissile ? 22 : 18));
    const x = anchorX - dirX * stretchedDistance + sideX * drift;
    const y = anchorY - dirY * stretchedDistance + sideY * drift;
    const life = ember
      ? (isBossMissile ? 16 + Math.floor(Math.random() * 5) : 14 + Math.floor(Math.random() * 4))
      : (isBossMissile ? 26 + Math.floor(Math.random() * 14) : 22 + Math.floor(Math.random() * 12));

    particles.push({
      type: "missileTrail",
      x: x,
      y: y,
      speedX: -dirX * (ember ? (isBossMissile ? 0.62 : 0.5) : (isBossMissile ? 0.34 : 0.28)) * trailHeat + (Math.random() - 0.5) * (isBossMissile ? 0.34 : 0.28),
      speedY: -dirY * (ember ? (isBossMissile ? 0.62 : 0.5) : (isBossMissile ? 0.34 : 0.28)) * trailHeat + (Math.random() - 0.5) * (isBossMissile ? 0.34 : 0.28),
      life: life,
      maxLife: life,
      size: ember
        ? (isBossMissile ? 5 + Math.random() * 3.5 : 4 + Math.random() * 3)
        : (isBossMissile ? 6 + Math.random() * 5 : 5 + Math.random() * 4.5),
      color: ember
        ? (isBossMissile ? (Math.random() < 0.5 ? "#ff7b2f" : "#ff3a18") : (Math.random() < 0.5 ? "#ff6a28" : "#cf3118"))
        : (isBossMissile ? (Math.random() < 0.5 ? "#8a6b58" : "#64513f") : (Math.random() < 0.5 ? "#756858" : "#544a40"))
    });
  }
}

function explodeEnemyMissile(index) {
  const missile = enemyBullets[index];
  const explosion = {
    type: "missileExplosion",
    x: missile.x - 18,
    y: missile.y - 18,
    width: 50,
    height: 50
  };

  createExplosionParticles(explosion);

  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const explosionCenterX = missile.x + missile.width / 2;
  const explosionCenterY = missile.y + missile.height / 2;
  const dx = playerCenterX - explosionCenterX;
  const dy = playerCenterY - explosionCenterY;
  let hitPlayer = false;

  if (Math.sqrt(dx * dx + dy * dy) <= 42) {
    hitPlayer = damagePlayer(1, "Р Р°РєРµС‚Р° РўР°РЅРєР°");
    if (hitPlayer) {
      runStats.tankMissilesHitPlayer++;
    }
  }

  delayedExplosions.push({
    kind: "tankHazardZone",
    delay: tankHazardZoneSpawnDelay,
    x: explosionCenterX - 36,
    y: explosionCenterY - 36,
    width: 72,
    height: 72,
    centerX: explosionCenterX,
    centerY: explosionCenterY,
    radius: 36,
    timer: 115
  });

  enemyBullets.splice(index, 1);
}

function updateEnemyHazardZones() {
  for (let i = enemyHazardZones.length - 1; i >= 0; i--) {
    enemyHazardZones[i].animationTimer = (enemyHazardZones[i].animationTimer || 0) + 1;
    enemyHazardZones[i].timer--;

    if (enemyHazardZones[i].timer <= 0) {
      enemyHazardZones.splice(i, 1);
    }
  }
}

function moveWebBullets() {
  for (let i = webBullets.length - 1; i >= 0; i--) {
    if (webBullets[i].impacting) {
      webBullets[i].impactTimer--;

      const targetX = player.x + player.width / 2 - webBullets[i].width / 2;
      const targetY = player.y + player.height / 2 - webBullets[i].height / 2 - 4;
      webBullets[i].x += (targetX - webBullets[i].x) * 0.6;
      webBullets[i].y += (targetY - webBullets[i].y) * 0.6;

      if (webBullets[i].impactTimer <= 0) {
        attachWebOverlayToPlayer(webBullets[i]);
        webBullets.splice(i, 1);
      }

      continue;
    }

    webBullets[i].x += webBullets[i].speedX;
    webBullets[i].y += webBullets[i].speedY;
    webBullets[i].growAge++;
    webBullets[i].webPulseAge++;
    webBullets[i].webSpinAngle += webBullets[i].webSpinSpeed || 0;
    webBullets[i].webMorphAge++;

    const growthProgress = Math.min(webBullets[i].growAge / webBullets[i].growDuration, 1);
    webBullets[i].drawScale = 0.5 + Math.pow(growthProgress, 1.7) * 3.9;
    const morphAge = webBullets[i].webMorphAge;
    const morphPhase = webBullets[i].webMorphPhase || 0;
    const spinLag = webBullets[i].webMorphSpinLag || 0;
    const spinAngle = webBullets[i].webSpinAngle || 0;
    webBullets[i].webMorphSpinLag = spinLag + (spinAngle - spinLag) * 0.02;
    const laggedSpin = webBullets[i].webMorphSpinLag;
    const morphWaveA = Math.sin(morphPhase + morphAge * 0.052);
    const morphWaveB = Math.sin(morphPhase * 1.21 + morphAge * 0.029 + laggedSpin * 0.17);
    const morphWaveC = Math.cos(morphPhase * 0.69 + morphAge * 0.017 + laggedSpin * 0.11);
    const targetScaleX = 1 + morphWaveA * 0.14 + morphWaveB * 0.085 + morphWaveC * 0.04;
    const targetScaleY = 1 - morphWaveA * 0.095 + Math.cos(morphPhase * 0.94 + morphAge * 0.033 + laggedSpin * 0.14) * 0.06;
    const targetRotation = Math.sin(morphPhase * 0.61 + morphAge * 0.022 + laggedSpin * 0.08) * 0.16;

    webBullets[i].webMorphScaleX += (targetScaleX - webBullets[i].webMorphScaleX) * 0.05;
    webBullets[i].webMorphScaleY += (targetScaleY - webBullets[i].webMorphScaleY) * 0.05;
    webBullets[i].webMorphRotation += (targetRotation - webBullets[i].webMorphRotation) * 0.04;

    if (
      webBullets[i].y > canvas.height ||
      webBullets[i].x < -20 ||
      webBullets[i].x > canvas.width + 20
    ) {
      webBullets.splice(i, 1);
    }
  }
}

function startBossPhase() {
  playWarningSound();

  for (let i = 0; i < enemies.length; i++) {
    createExplosionParticles(enemies[i]);
  }

  enemies.length = 0;
  enemyBullets.length = 0;
  enemyHazardZones.length = 0;
  webBullets.length = 0;
  bossBullets.length = 0;
  stopBossMissileFlightLoop(true);
  stopBossCoreLaserLoop(true);
  bossWebBullets.length = 0;
  bossDangerZones.length = 0;
  enemySpawnTimer = 0;

  boss.active = true;
  boss.introActive = true;
  runStats.bossAppeared = true;
  boss.introTimer = boss.introDuration;
  boss.introStartY = -boss.height - 220;
  boss.introTargetY = 70;
  boss.introShakeTimer = boss.introDuration;
  boss.x = canvas.width / 2 - boss.width / 2;
  boss.y = boss.introStartY;
  boss.prevX = boss.x;
  boss.prevY = boss.y;
  boss.velocityX = 0;
  boss.velocityY = 0;
  boss.hp = boss.maxHp;
  boss.hitFlash = 0;
  boss.direction = 1;
  boss.directionChangeTimer = 180;
  boss.speed = boss.baseSpeed;
  boss.shootDelay = boss.baseShootDelay;
  boss.webShootDelay = boss.baseWebShootDelay;
  boss.dangerZoneDelay = boss.baseDangerZoneDelay;
  bossCoreLaser.cooldownMax = bossCoreLaser.baseCooldownMax;
  boss.shootTimer = 90;
  boss.webShootTimer = boss.webShootDelay;
  boss.dangerZoneTimer = boss.dangerZoneDelay;
  boss.rageFlashTimer = 0;
  boss.majorAttackLockTimer = 0;
  boss.lastDestroyedLegCount = 0;
  boss.destroyedPairBurstFlags = { upper: false, middle: false, lower: false };
  boss.nextAttackSide = { lower: -1, middle: 1, upper: -1 };
  resetBossSpreadAttack();
  resetBossCoreLaser();
  bossAnimationTimer = 0;
  resetBossLegs();
  applyBossRageAttackDelays();
}

function resetBossLegs() {
  boss.legs = [
    // upper legs: later this pair can drive the most dangerous boss attack
    { role: "upper", side: -1, offsetX: 24, offsetY: 18, width: 184, height: 108, hp: 12, maxHp: 12, alive: true, destroyed: false, hitFlash: 0, sparkTimer: 0, waveOffset: 0.0, bend1: -52, bend2: -24, thickness: 12, extraTipSegment: true, damageAnchorKey: "upperLeftLeg_anchor" },
    // middle legs: later this pair can drive the medium danger boss attack
    { role: "middle", side: -1, offsetX: 34, offsetY: 54, width: 142, height: 142, hp: 12, maxHp: 12, alive: true, destroyed: false, hitFlash: 0, sparkTimer: 0, waveOffset: 1.4, bend1: -24, bend2: 22, thickness: 14, damageAnchorKey: "middleLeftLeg_anchor" },
    // lower legs: later this pair can drive the lower danger boss attack
    { role: "lower", side: -1, offsetX: 56, offsetY: 92, width: 110, height: 188, hp: 12, maxHp: 12, alive: true, destroyed: false, hitFlash: 0, sparkTimer: 0, waveOffset: 2.7, bend1: 10, bend2: 42, thickness: 13, damageAnchorKey: "lowerLeftLeg_anchor" },
    // upper legs: later this pair can drive the most dangerous boss attack
    { role: "upper", side: 1, offsetX: boss.width - 24, offsetY: 18, width: 184, height: 108, hp: 12, maxHp: 12, alive: true, destroyed: false, hitFlash: 0, sparkTimer: 0, waveOffset: 0.8, bend1: 54, bend2: 26, thickness: 12, extraTipSegment: true, damageAnchorKey: "upperRightLeg_anchor" },
    // middle legs: later this pair can drive the medium danger boss attack
    { role: "middle", side: 1, offsetX: boss.width - 34, offsetY: 54, width: 142, height: 142, hp: 12, maxHp: 12, alive: true, destroyed: false, hitFlash: 0, sparkTimer: 0, waveOffset: 1.9, bend1: 24, bend2: -24, thickness: 14, damageAnchorKey: "middleRightLeg_anchor" },
    // lower legs: later this pair can drive the lower danger boss attack
    { role: "lower", side: 1, offsetX: boss.width - 56, offsetY: 92, width: 110, height: 188, hp: 12, maxHp: 12, alive: true, destroyed: false, hitFlash: 0, sparkTimer: 0, waveOffset: 3.1, bend1: -8, bend2: -44, thickness: 13, damageAnchorKey: "lowerRightLeg_anchor" }
  ];
  resetBossDamageEmitters();
}

function resetBossDamageEmitters() {
  boss.damageEmitters = [];

  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];

    boss.damageEmitters.push({
      kind: "leg",
      id: getBossLegDebugId(leg) + "-damage",
      leg: leg,
      role: leg.role,
      side: leg.side,
      anchorKey: leg.damageAnchorKey,
      smokeTimer: 0,
      emberTimer: 0,
      sparkTimer: 0,
      glowTimer: 0,
      pulseSeed: Math.random() * Math.PI * 2
    });
  }
}

function spawnBossDamageSmokeParticle(x, y, options = {}) {
  const life = options.life || 22;
  const radius = options.radius || 10;
  const baseUp = Number.isFinite(options.baseUp) ? options.baseUp : 1.34;
  const tiltX = Number.isFinite(options.tiltX) ? options.tiltX : 0;
  const spread = Number.isFinite(options.spread) ? options.spread : 0.44;
  const spreadX = (Math.random() - 0.5) * spread;
  const spreadY = (Math.random() - 0.5) * spread * 0.12;
  const speed = Number.isFinite(options.speed) ? options.speed : (0.3 + Math.random() * 0.14);
  const layerOffset = options.layerOffset || 0;
  const drag = Number.isFinite(options.drag) ? options.drag : (0.965 + Math.random() * 0.01);
  const lift = Number.isFinite(options.lift) ? options.lift : (0.012 + Math.random() * 0.01);
  const turbulence = Number.isFinite(options.turbulence) ? options.turbulence : (0.02 + Math.random() * 0.012);
  const scale = Number.isFinite(options.scale) ? options.scale : 1;

  particles.push({
    type: "bossSmoke",
    x: x + (Math.random() - 0.5) * (options.spawnSpreadX || 3),
    y: y + (Math.random() - 0.5) * (options.spawnSpreadY || 2),
    vx: (tiltX * 0.42 + spreadX) * speed,
    vy: (-baseUp + spreadY - Math.abs(tiltX) * 0.05) * speed,
    life: life,
    maxLife: life,
    radius: radius + Math.random() * 4,
    scale: scale,
    widthScale: options.widthScale || 1.0,
    heightScale: options.heightScale || 0.8,
    wobbleSeed: Math.random() * Math.PI * 2,
    layerOffset: layerOffset,
    stretchX: options.stretchX || 1.0,
    stretchY: options.stretchY || 1.0,
    skew: options.skew || 0,
    darkColor: options.darkColor || "#3b3740",
    midColor: options.midColor || "#68636a",
    lightColor: options.lightColor || "#9a9498",
    color: options.color || "#46424b",
    glowColor: options.glowColor || "#ff8b44",
    glowAlpha: options.glowAlpha || 0.18,
    drag: drag,
    lift: lift,
    turbulence: turbulence,
    driftSeed: Math.random() * Math.PI * 2,
    sourceId: options.sourceId || ""
  });
}

function spawnBossDamageEmberParticle(x, y, options = {}) {
  const life = options.life || 14;
  const radius = options.radius || 4;

  particles.push({
    type: "bossEmber",
    x: x + (Math.random() - 0.5) * 2,
    y: y + (Math.random() - 0.5) * 2,
    speedX: options.speedX ?? (Math.random() - 0.5) * 0.14,
    speedY: options.speedY ?? (-0.14 - Math.random() * 0.08),
    gravity: options.gravity || 0.08,
    life: life,
    maxLife: life,
    radius: radius,
    innerColor: options.innerColor || "#ffd17a",
    outerColor: options.outerColor || "#ff7b39",
    glowColor: options.glowColor || "#ffca7f",
    sourceId: options.sourceId || ""
  });
}

function spawnBossDamageSparkParticle(x, y, angle, speed, options = {}) {
  const sparkColor = options.color || "#ffd35a";
  const outwardSpeed = Number.isFinite(speed) ? speed : 1;
  const life = options.life || 11;
  const sparkSpread = options.spread || 0.35;

  particles.push({
    type: "spark",
    x: x + (Math.random() - 0.5) * 2,
    y: y + (Math.random() - 0.5) * 2,
    speedX: Math.cos(angle + (Math.random() - 0.5) * sparkSpread) * outwardSpeed,
    speedY: Math.sin(angle + (Math.random() - 0.5) * sparkSpread) * outwardSpeed,
    gravity: options.gravity || 0.06,
    life: life,
    maxLife: life,
    color: sparkColor,
    width: options.width || 1.35,
    length: options.length || 11 + Math.random() * 4,
    sourceId: options.sourceId || ""
  });
}

function getBossLegSway(leg) {
  return Math.sin(bossAnimationTimer * 0.04 + leg.waveOffset) * 6;
}

function getBossCorePulseAlpha() {
  if (!boss.active || bossDeathSequence.active) {
    return 0;
  }

  const pulseWave = 0.5 + Math.sin(bossAnimationTimer * 0.05) * 0.5;
  const destroyedPairs = getDestroyedBossLegPairCount();
  const damageBoost = 1 + destroyedPairs * 0.08;
  const laserBoost = bossCoreLaser.state === "charging"
    ? 0.18 + (1 - bossCoreLaser.timer / bossCoreLaser.chargeDuration) * 0.34
    : bossCoreLaser.state === "active"
      ? 0.28
      : 0;

  return (0.028 + pulseWave * 0.034) * damageBoost + laserBoost;
}

function getBossAttackWarningAlpha() {
  if (!boss.active || boss.introActive || bossDeathSequence.active) {
    return 0;
  }

  let warningAlpha = 0;

  if (hasAliveBossLeg("lower")) {
    warningAlpha = Math.max(warningAlpha, Math.max(0, 1 - boss.shootTimer / 8));
  }

  if (hasAliveBossLeg("middle") && boss.majorAttackLockTimer <= 0) {
    warningAlpha = Math.max(warningAlpha, Math.max(0, 1 - boss.webShootTimer / 10));
  }

  if (hasAliveBossLeg("upper") && boss.majorAttackLockTimer <= 0 && bossDangerZones.length === 0) {
    warningAlpha = Math.max(warningAlpha, Math.max(0, 1 - boss.dangerZoneTimer / 12));
  }

  if (bossCoreLaser.state === "charging") {
    const laserWarning = Math.max(0, 1 - bossCoreLaser.timer / 12);
    warningAlpha = Math.max(warningAlpha, laserWarning > 0 ? 0.22 + laserWarning * 0.78 : 0);
  }

  return Math.min(1, warningAlpha);
}

function getBossBodyHitbox() {
  const assembledHitbox = getBossAssembledHitboxRect("body");

  if (assembledHitbox) {
    return assembledHitbox;
  }

  return {
    x: boss.x,
    y: boss.y,
    width: boss.width,
    height: boss.height
  };
}

function getBossCoreHitbox() {
  const assembledHitbox = getBossAssembledHitboxRect("core");

  if (assembledHitbox) {
    return assembledHitbox;
  }

  return getBossBodyHitbox();
}

function setBossDebugLastHit(id, x, y, segmentId = "") {
  bossDebugLastHit.id = id;
  bossDebugLastHit.segmentId = segmentId;
  bossDebugLastHit.damage = 0;
  bossDebugLastHit.x = x;
  bossDebugLastHit.y = y;
  bossDebugLastHit.timer = 36;
}

function setBossDebugLastHitDamage(id, x, y, segmentId = "", damage = 0) {
  setBossDebugLastHit(id, x, y, segmentId);
  bossDebugLastHit.damage = damage;
}

function getBossLegDebugId(leg) {
  return leg.role + "-" + (leg.side === -1 ? "left" : "right");
}

function getBossLabLegId(leg) {
  const side = leg.side === -1 ? "Left" : "Right";
  return leg.role + side;
}

function getBossLegDebugColor(leg) {
  if (leg.role === "upper") {
    return leg.side === -1 ? "#ff9f6e" : "#ff6e9f";
  }

  if (leg.role === "middle") {
    return leg.side === -1 ? "#7ee7ff" : "#57b8ff";
  }

  return leg.side === -1 ? "#9efc7f" : "#d2ff6e";
}

const bossLabBodyHitboxSegments = [
  { id: "topDeck", sx: 590, sy: 205, sw: 355, sh: 78 },
  { id: "leftMass", sx: 500, sy: 280, sw: 168, sh: 92 },
  { id: "core", sx: 675, sy: 280, sw: 190, sh: 92 },
  { id: "rightMass", sx: 868, sy: 280, sw: 168, sh: 92 },
  { id: "lowerDeck", sx: 610, sy: 372, sw: 315, sh: 78 },
  { id: "chin", sx: 700, sy: 450, sw: 140, sh: 42 }
];

const bossLabLegHitboxSegments = {
  upperLeft: [
    { id: "socket", sx: 405, sy: 250, sw: 86, sh: 42 },
    { id: "shoulder", sx: 330, sy: 282, sw: 94, sh: 44 },
    { id: "elbow", sx: 270, sy: 325, sw: 82, sh: 46 },
    { id: "fore", sx: 220, sy: 370, sw: 72, sh: 52 },
    { id: "claw", sx: 180, sy: 420, sw: 48, sh: 74 }
  ],
  middleLeft: [
    { id: "socket", sx: 475, sy: 365, sw: 78, sh: 46 },
    { id: "upper", sx: 410, sy: 410, sw: 84, sh: 48 },
    { id: "knee", sx: 365, sy: 470, sw: 72, sh: 54 },
    { id: "lower", sx: 318, sy: 535, sw: 64, sh: 72 },
    { id: "claw", sx: 272, sy: 610, sw: 48, sh: 86 }
  ],
  lowerLeft: [
    { id: "socket", sx: 548, sy: 420, sw: 70, sh: 46 },
    { id: "upper", sx: 505, sy: 470, sw: 68, sh: 58 },
    { id: "knee", sx: 475, sy: 535, sw: 60, sh: 60 },
    { id: "lower", sx: 440, sy: 605, sw: 56, sh: 72 },
    { id: "claw", sx: 410, sy: 680, sw: 42, sh: 60 }
  ],
  upperRight: [
    { id: "socket", sx: 1046, sy: 250, sw: 86, sh: 42 },
    { id: "shoulder", sx: 1122, sy: 282, sw: 94, sh: 44 },
    { id: "elbow", sx: 1194, sy: 325, sw: 82, sh: 46 },
    { id: "fore", sx: 1254, sy: 370, sw: 72, sh: 52 },
    { id: "claw", sx: 1310, sy: 420, sw: 48, sh: 74 }
  ],
  middleRight: [
    { id: "socket", sx: 985, sy: 365, sw: 78, sh: 46 },
    { id: "upper", sx: 1046, sy: 410, sw: 84, sh: 48 },
    { id: "knee", sx: 1104, sy: 470, sw: 72, sh: 54 },
    { id: "lower", sx: 1160, sy: 535, sw: 64, sh: 72 },
    { id: "claw", sx: 1216, sy: 610, sw: 48, sh: 86 }
  ],
  lowerRight: [
    { id: "socket", sx: 914, sy: 420, sw: 70, sh: 46 },
    { id: "upper", sx: 958, sy: 470, sw: 68, sh: 58 },
    { id: "knee", sx: 995, sy: 535, sw: 60, sh: 60 },
    { id: "lower", sx: 1034, sy: 605, sw: 56, sh: 72 },
    { id: "claw", sx: 1080, sy: 680, sw: 42, sh: 60 }
  ]
};

function mapBossLabSourceRectToCanvas(sourceRect) {
  const assembledRect = getBossAssembledDrawRect();
  const fullSource = bossAssembledSpriteConfig.sourceRect;

  if (!assembledRect || !sourceRect) {
    return null;
  }

  const scaleX = assembledRect.width / fullSource.sw;
  const scaleY = assembledRect.height / fullSource.sh;

  return {
    x: assembledRect.x + (sourceRect.sx - fullSource.sx) * scaleX,
    y: assembledRect.y + (sourceRect.sy - fullSource.sy) * scaleY,
    width: sourceRect.sw * scaleX,
    height: sourceRect.sh * scaleY
  };
}

function getBossLabLegHitboxConfig(leg) {
  return bossLabLegHitboxSegments[getBossLabLegId(leg)] || [];
}

function getRectOverlapArea(a, b) {
  const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return overlapX * overlapY;
}

function getRectUnion(rects) {
  if (!rects || rects.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function insetRect(rect, insetX, insetY) {
  return {
    x: rect.x + insetX,
    y: rect.y + insetY,
    width: Math.max(4, rect.width - insetX * 2),
    height: Math.max(4, rect.height - insetY * 2)
  };
}

function getBossBodyCollisionSegments() {
  const collisionSegments = [];

  for (let i = 0; i < bossLabBodyHitboxSegments.length; i++) {
    const segment = bossLabBodyHitboxSegments[i];
    const rect = mapBossLabSourceRectToCanvas(segment);

    if (!rect) {
      continue;
    }

    collisionSegments.push({
      id: segment.id,
      owner: "body",
      rect: rect
    });
  }

  return collisionSegments;
}

function getBossLegCollisionSegmentLayout(leg) {
  if (leg.role === "upper") {
    return [
      { id: "near", x: 0.34, y: 0.02, width: 0.42, height: 0.24 },
      { id: "mid", x: 0.12, y: 0.2, width: 0.34, height: 0.28 },
      { id: "far", x: 0.0, y: 0.48, width: 0.24, height: 0.34 }
    ];
  }

  if (leg.role === "middle") {
    return [
      { id: "root", x: 0.3, y: 0.02, width: 0.46, height: 0.26 },
      { id: "upper-shell", x: 0.2, y: 0.24, width: 0.48, height: 0.36 },
      { id: "outer-shell", x: -0.08, y: 0.52, width: 0.58, height: 0.52 },
      { id: "tip-shell", x: -0.12, y: 0.94, width: 0.46, height: 0.42 }
    ];
  }

  return [
    { id: "root", x: 0.2, y: 0.0, width: 0.52, height: 0.28 },
    { id: "upper-shell", x: 0.14, y: 0.2, width: 0.54, height: 0.36 },
    { id: "lower-shell", x: 0.1, y: 0.5, width: 0.58, height: 0.34 },
    { id: "foot-shell", x: 0.02, y: 0.78, width: 0.6, height: 0.28 }
  ];
}

function getBossLegCollisionSegmentsFromBox(leg, legBox) {
  const layout = getBossLegCollisionSegmentLayout(leg);
  const collisionSegments = [];

  for (let i = 0; i < layout.length; i++) {
    const segment = layout[i];
    const normalizedX = leg.side === -1
      ? segment.x
      : 1 - segment.x - segment.width;
    const rect = {
      x: legBox.x + legBox.width * normalizedX,
      y: legBox.y + legBox.height * segment.y,
      width: legBox.width * segment.width,
      height: legBox.height * segment.height
    };
    const silhouetteLayout = leg.role === "middle" || leg.role === "lower";
    const insetX = silhouetteLayout ? Math.min(2, rect.width * 0.04) : Math.min(5, rect.width * 0.1);
    const insetY = silhouetteLayout ? Math.min(2, rect.height * 0.04) : Math.min(4, rect.height * 0.12);

    collisionSegments.push({
      id: segment.id,
      legId: getBossLegDebugId(leg),
      ownerLeg: leg,
      rect: insetRect(rect, insetX, insetY)
    });
  }

  return collisionSegments;
}

function getBossLegCollisionSegments(leg) {
  const collisionSegments = [];
  const segmentConfig = getBossLabLegHitboxConfig(leg);

  for (let i = 0; i < segmentConfig.length; i++) {
    const segment = segmentConfig[i];
    const rect = mapBossLabSourceRectToCanvas(segment);

    if (!rect) {
      continue;
    }

    collisionSegments.push({
      id: segment.id,
      legId: getBossLabLegId(leg),
      ownerLeg: leg,
      rect: rect
    });
  }

  return collisionSegments;
}

function getBossLegacyLegCollisionSegments(leg) {
  const assembledGeometry = getBossLegAssembledGeometry(leg);

  if (assembledGeometry) {
    return getBossLegCollisionSegmentsFromBox(leg, assembledGeometry.hitboxRect);
  }

  const segments = getBossLegSegments(leg);

  if (!segments || segments.length === 0) {
    return [];
  }

  const groupIndexes = leg.role === "upper"
    ? [
      { id: "near", indexes: [0, 1, 2] },
      { id: "mid", indexes: [3, 4, 5, 6] },
      { id: "far", indexes: [7, 8, 9] }
    ]
    : [
      { id: "near", indexes: [0, 1, 2] },
      { id: "mid", indexes: [3, 4, 5] },
      { id: "far", indexes: [6, 7] }
    ];
  const collisionSegments = [];

  for (let groupIndex = 0; groupIndex < groupIndexes.length; groupIndex++) {
    const group = groupIndexes[groupIndex];
    const groupRects = [];

    for (let i = 0; i < group.indexes.length; i++) {
      const segment = segments[group.indexes[i]];

      if (segment) {
        groupRects.push(segment);
      }
    }

    const unionRect = getRectUnion(groupRects);

    if (!unionRect) {
      continue;
    }

    const insetX = unionRect.width > 18 ? Math.min(6, unionRect.width * 0.12) : 0;
    const insetY = unionRect.height > 12 ? Math.min(4, unionRect.height * 0.16) : 0;

    collisionSegments.push({
      id: group.id,
      legId: getBossLegDebugId(leg),
      ownerLeg: leg,
      rect: insetRect(unionRect, insetX, insetY)
    });
  }

  return collisionSegments;
}

function getClosestBossLegHit(bullet) {
  const bulletRect = {
    x: bullet.x,
    y: bullet.y,
    width: bullet.width,
    height: bullet.height
  };
  const bulletCenterX = bullet.x + bullet.width / 2;
  const bulletCenterY = bullet.y + bullet.height / 2;
  let bestLeg = null;
  let bestScore = -Infinity;

  for (let legIndex = 0; legIndex < boss.legs.length; legIndex++) {
    const leg = boss.legs[legIndex];

    if (!leg.alive) {
      continue;
    }

    const collisionSegments = getBossLegCollisionSegments(leg);

    for (let segmentIndex = 0; segmentIndex < collisionSegments.length; segmentIndex++) {
      const collisionSegment = collisionSegments[segmentIndex];
      const overlapArea = getRectOverlapArea(bulletRect, collisionSegment.rect);

      if (overlapArea <= 0) {
        continue;
      }

      const segmentCenterX = collisionSegment.rect.x + collisionSegment.rect.width / 2;
      const segmentCenterY = collisionSegment.rect.y + collisionSegment.rect.height / 2;
      const dx = bulletCenterX - segmentCenterX;
      const dy = bulletCenterY - segmentCenterY;
      const distanceScore = Math.sqrt(dx * dx + dy * dy);
      const score = overlapArea * 1000 - distanceScore;

      if (score > bestScore) {
        bestScore = score;
        bestLeg = {
          leg: leg,
          legBox: getBossLegBox(leg),
          segmentId: collisionSegment.id,
          segmentRect: collisionSegment.rect
        };
      }
    }
  }

  return bestLeg;
}

function getBossBodyHit(bullet) {
  const bulletRect = {
    x: bullet.x,
    y: bullet.y,
    width: bullet.width,
    height: bullet.height
  };
  const bodySegments = getBossBodyCollisionSegments();

  for (let i = 0; i < bodySegments.length; i++) {
    const segment = bodySegments[i];

    if (getRectOverlapArea(bulletRect, segment.rect) > 0) {
      return segment;
    }
  }

  return null;
}

function getBossLegBox(leg) {
  const assembledGeometry = getBossLegAssembledGeometry(leg);

  if (assembledGeometry) {
    return assembledGeometry.hitboxRect;
  }

  const sway = getBossLegSway(leg);
  const attachX = boss.x + leg.offsetX;
  const extraTipWidth = leg.extraTipSegment ? leg.width * 0.12 : 0;
  const extraTipHeight = leg.extraTipSegment ? leg.height * 0.08 : 0;

  if (leg.side === -1) {
    return {
      x: attachX - leg.width - extraTipWidth + sway,
      y: boss.y + leg.offsetY,
      width: leg.width + extraTipWidth,
      height: leg.height + extraTipHeight
    };
  }

  return {
    x: attachX + sway,
    y: boss.y + leg.offsetY,
    width: leg.width + extraTipWidth,
    height: leg.height + extraTipHeight
  };
}

function getBossLegSegments(leg) {
  const legBox = getBossLegBox(leg);
  const sway = getBossLegSway(leg);
  const attachX = boss.x + leg.offsetX;
  const baseY = boss.y + leg.offsetY;
  const side = leg.side;
  const baseThickness = leg.thickness || 14;
  const bend1 = leg.bend1 || 0;
  const bend2 = leg.bend2 || 0;

  const points = [
    { x: attachX, y: baseY },
    { x: attachX + side * leg.width * 0.24 + bend1 * 0.15, y: legBox.y + leg.height * 0.18 },
    { x: attachX + side * leg.width * 0.48 + bend1 * 0.35 + sway * 0.2, y: legBox.y + leg.height * 0.42 },
    { x: attachX + side * leg.width * 0.70 + bend2 * 0.45 + sway * 0.45, y: legBox.y + leg.height * 0.67 },
    { x: attachX + side * leg.width * 0.92 + bend2 * 0.2 + sway, y: legBox.y + leg.height * 0.92 }
  ];

  if (leg.extraTipSegment) {
    points.push({
      x: attachX + side * leg.width * 1.05 + bend2 * 0.15 + sway * 1.05,
      y: legBox.y + leg.height * 1.02
    });
  }

  const thicknesses = [
    baseThickness + 5,
    baseThickness + 2,
    baseThickness,
    Math.max(6, baseThickness - 5),
    Math.max(5, baseThickness - 7)
  ];

  const segments = [];

  for (let i = 0; i < points.length - 1; i++) {
    const startPoint = points[i];
    const endPoint = points[i + 1];
    const thickness = thicknesses[i];
    const overlap = i === points.length - 2 ? 3 : 8;
    let x = Math.min(startPoint.x, endPoint.x) - overlap;
    let y = (startPoint.y + endPoint.y) / 2 - thickness / 2;
    let width = Math.abs(endPoint.x - startPoint.x) + overlap * 2;

    if (i === points.length - 2) {
      width = Math.max(14, width * 0.58);
      x = side === -1 ? endPoint.x - 2 : endPoint.x - width + 2;
      y += leg.offsetY > 95 ? 5 : 2;
    }

    segments.push({
      x: x,
      y: y,
      width: width,
      height: thickness
    });

    if (i < points.length - 2) {
      const jointSize = thickness + 2;

      segments.push({
        x: endPoint.x - jointSize / 2,
        y: y + thickness - 2,
        width: jointSize,
        height: jointSize
      });
    } else {
      const clawWidth = Math.max(6, thickness - 2);
      const clawHeight = leg.offsetY > 95 ? thickness + 10 : thickness + 5;

      segments.push({
        x: endPoint.x - clawWidth / 2,
        y: endPoint.y - clawHeight / 2 + (leg.offsetY > 95 ? 7 : 3),
        width: clawWidth,
        height: clawHeight
      });
    }
  }

  return segments;
}

function updateBossIntro() {
  if (!boss.active || !boss.introActive) {
    return;
  }

  boss.introTimer--;
  const prevX = boss.x;
  const prevY = boss.y;

  const descendDuration = boss.introDuration - boss.introWarningDuration;
  const descendElapsed = Math.max(0, descendDuration - boss.introTimer);
  const progress = Math.min(1, descendElapsed / descendDuration);
  const smoothProgress = progress * progress * (3 - 2 * progress);

  boss.y = boss.introStartY + (boss.introTargetY - boss.introStartY) * smoothProgress;
  boss.prevX = prevX;
  boss.prevY = prevY;
  boss.velocityX = boss.x - prevX;
  boss.velocityY = boss.y - prevY;
  bossAnimationTimer++;

  if (boss.introShakeTimer > 0) {
    boss.introShakeTimer--;
  }

  if (boss.introTimer <= 0) {
    boss.introActive = false;
    boss.y = boss.introTargetY;
    boss.prevX = boss.x;
    boss.prevY = boss.y;
    boss.velocityX = 0;
    boss.velocityY = 0;
    boss.shootTimer = 70;
    boss.webShootTimer = boss.webShootDelay;
    boss.dangerZoneTimer = boss.dangerZoneDelay;
    resetBossCoreLaser();
  }
}

function moveBoss() {
  if (!boss.active || boss.introActive) {
    return;
  }

  const prevX = boss.x;
  const prevY = boss.y;
  boss.x += boss.speed * boss.direction;
  bossAnimationTimer++;

  const destroyedPairs = getDestroyedBossLegPairCount();

  if (destroyedPairs > 0) {
    boss.directionChangeTimer--;

    if (boss.directionChangeTimer <= 0) {
      if (Math.random() < 0.35 + destroyedPairs * 0.08) {
        boss.direction *= -1;
      }

      boss.directionChangeTimer = Math.max(60, 190 - destroyedPairs * 40);
    }
  }

  if (boss.x < 90) {
    boss.x = 90;
    boss.direction = 1;
  }

  if (boss.x + boss.width > canvas.width - 90) {
    boss.x = canvas.width - boss.width - 90;
    boss.direction = -1;
  }

  boss.prevX = prevX;
  boss.prevY = prevY;
  boss.velocityX = boss.x - prevX;
  boss.velocityY = boss.y - prevY;
}

function hasAliveBossLeg(role) {
  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].role === role && boss.legs[i].alive) {
      return true;
    }
  }

  return false;
}

function hasAnyAliveBossLeg() {
  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].alive) {
      return true;
    }
  }

  return false;
}

function getBossBodyDamageMultiplier() {
  if (hasAnyAliveBossLeg()) {
    return 0.5;
  }

  return 2.0;
}

function getDestroyedBossLegPairCount() {
  let destroyedPairs = 0;

  if (!hasAliveBossLeg("upper")) {
    destroyedPairs++;
  }

  if (!hasAliveBossLeg("middle")) {
    destroyedPairs++;
  }

  if (!hasAliveBossLeg("lower")) {
    destroyedPairs++;
  }

  return destroyedPairs;
}

function getDestroyedBossLegCount() {
  let destroyedLegs = 0;

  for (let i = 0; i < boss.legs.length; i++) {
    if (!isBossLegAlive(boss.legs[i])) {
      destroyedLegs++;
    }
  }

  return Math.min(5, Math.max(0, destroyedLegs));
}

function getBossRageAttackIntervalMultiplier() {
  const rageLevel = getDestroyedBossLegCount();
  const ragePercent = bossRageAttackIntervalPercents[rageLevel] || bossRageAttackIntervalPercents[bossRageAttackIntervalPercents.length - 1];
  return 100 / ragePercent;
}

function getBossRageAttackDelay(baseDelay) {
  return Math.max(1, Math.round(baseDelay * getBossRageAttackIntervalMultiplier()));
}

function applyBossRageAttackDelays() {
  boss.shootDelay = getBossRageAttackDelay(boss.baseShootDelay);
  boss.webShootDelay = getBossRageAttackDelay(boss.baseWebShootDelay);
  boss.dangerZoneDelay = getBossRageAttackDelay(boss.baseDangerZoneDelay);
  boss.shootTimer = Math.min(boss.shootTimer, boss.shootDelay);
  boss.webShootTimer = Math.min(boss.webShootTimer, boss.webShootDelay);
  boss.dangerZoneTimer = Math.min(boss.dangerZoneTimer, boss.dangerZoneDelay);
}

function getBossLegsByRole(role) {
  const legs = [];

  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].role === role) {
      legs.push(boss.legs[i]);
    }
  }

  return legs;
}

function getAliveBossLegsByRole(role) {
  const legs = [];

  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];

    if (leg.role === role && leg.alive) {
      legs.push(leg);
    }
  }

  return legs;
}

function getBossAttackAnchorKey(role, side) {
  const sideName = side === -1 ? "Left" : "Right";
  return role + sideName;
}

function getBossAttackAnchorPoint(role, side) {
  const anchor = getBossAssembledAnchorPoint(getBossAttackAnchorKey(role, side));

  if (anchor) {
    return anchor;
  }

  const leg = getBossLegByRoleAndSide(role, side);
  const legBox = leg ? getBossLegBox(leg) : null;

  if (!legBox) {
    return {
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height
    };
  }

  return {
    x: legBox.x + legBox.width / 2,
    y: legBox.y + legBox.height * 0.5
  };
}

function chooseBossAttackSide(role, mode = "alternate", targetX = player.x + player.width / 2) {
  const aliveLegs = getAliveBossLegsByRole(role);

  if (aliveLegs.length === 0) {
    return 0;
  }

  if (aliveLegs.length === 1) {
    return aliveLegs[0].side;
  }

  if (mode === "nearest") {
    const leftAnchor = getBossAttackAnchorPoint(role, -1);
    const rightAnchor = getBossAttackAnchorPoint(role, 1);
    return Math.abs(targetX - leftAnchor.x) <= Math.abs(targetX - rightAnchor.x) ? -1 : 1;
  }

  const nextSide = boss.nextAttackSide[role] === 1 ? 1 : -1;
  boss.nextAttackSide[role] = nextSide === -1 ? 1 : -1;
  return nextSide;
}

function getAliveBossAttackAnchor(role, options = {}) {
  const mode = options.mode || "alternate";
  const side = chooseBossAttackSide(role, mode, options.targetX);

  if (side === 0) {
    return {
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height,
      side: 0,
      role: role
    };
  }

  const point = getBossAttackAnchorPoint(role, side);

  return {
    x: point.x,
    y: point.y,
    side: side,
    role: role
  };
}

function getBossSpreadMuzzlePoint(side) {
  const anchorKey = side === -1 ? "spreadLeft" : "spreadRight";
  const anchor = getBossAssembledAnchorPoint(anchorKey);

  if (anchor) {
    return anchor;
  }

  return {
    x: boss.x + boss.width / 2 + side * 18,
    y: boss.y + boss.height * 0.72
  };
}

function getBossMissileMuzzlePoint(side) {
  const anchorKey = side === -1 ? "missileLeft" : "missileRight";
  const anchor = getBossAssembledAnchorPoint(anchorKey);

  if (anchor) {
    return anchor;
  }

  return {
    x: boss.x + boss.width / 2 + side * 20,
    y: boss.y + boss.height * 0.26
  };
}

function isBossSpreadSideAlive(side) {
  const lowerLeg = getBossLegByRoleAndSide("lower", side);
  return isBossLegAlive(lowerLeg);
}

function isBossWebSideAlive(side) {
  const middleLeg = getBossLegByRoleAndSide("middle", side);
  return isBossLegAlive(middleLeg);
}

function resetBossSpreadAttack() {
  boss.spreadAttackActive = false;
  boss.spreadAttackSources = [];
  boss.spreadAttackDebugQueues = { "-1": [], "1": [] };
}

function startBossSpreadAttack() {
  const rageDelayScale = getBossRageAttackIntervalMultiplier();
  const firstSide = Math.random() < 0.5 ? -1 : 1;
  const secondSide = firstSide === -1 ? 1 : -1;
  const firstDelay = Math.round((Math.floor(Math.random() * 9)) * rageDelayScale);
  const secondDelay = Math.round((18 + Math.floor(Math.random() * 14)) * rageDelayScale);
  const sources = [];

  boss.spreadAttackActive = true;

  if (isBossSpreadSideAlive(firstSide)) {
    sources.push({ side: firstSide, startDelay: firstDelay, queued: false, done: false });
  }

  if (isBossSpreadSideAlive(secondSide)) {
    sources.push({
      side: secondSide,
      startDelay: sources.length === 0 ? firstDelay : secondDelay,
      queued: false,
      done: false
    });
  }

  boss.spreadAttackSources = sources;

  if (boss.spreadAttackSources.length === 0) {
    resetBossSpreadAttack();
  }
}

function getBossWebMuzzlePoint(side) {
  const anchorKey = side === -1 ? "webLeft" : "webRight";
  const anchor = getBossAssembledAnchorPoint(anchorKey);

  if (anchor) {
    return anchor;
  }

  return {
    x: boss.x + boss.width / 2 + side * 14,
    y: boss.y + boss.height * 0.48
  };
}

function fireBossWebShot(side) {
  const muzzle = getBossWebMuzzlePoint(side);
  const targetX = player.x + player.width / 2;
  const targetY = player.y + player.height / 2;
  const dx = targetX - muzzle.x;
  const dy = targetY - muzzle.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 2.25;
  const startX = muzzle.x - 8;
  const startY = muzzle.y - 8;
  const drawScale = 0.5;

  createMuzzleFlash(muzzle.x, muzzle.y, Math.atan2(dy, dx), "#ddffff", 15);
  createBossAttackTelegraph("web", "middle", side, { x: targetX, y: targetY }, 16);
  runStats.bossWebShotsLaunched++;

  webBullets.push({
    x: startX,
    y: startY,
    width: 16,
    height: 16,
    baseWidth: 16,
    baseHeight: 16,
    drawScale: drawScale,
    growAge: 0,
    growDuration: 84,
    webPulsePhase: Math.random() * Math.PI * 2,
    webPulseAge: 0,
    webSpinAngle: Math.random() * Math.PI * 2,
    webSpinSpeed: (0.06 + Math.random() * 0.03) * (Math.random() < 0.5 ? -1 : 1),
    webMorphPhase: Math.random() * Math.PI * 2,
    webMorphAge: 0,
    webMorphScaleX: 1,
    webMorphScaleY: 1,
    webMorphRotation: 0,
    webMorphSpinLag: 0,
    bossWebAttack: true,
    bossWebSparkSeed: Math.floor(Math.random() * 31),
    speedX: dx / distance * speed,
    speedY: dy / distance * speed
  });
}

function updateBossSpreadAttack() {
  if (!boss.active || boss.introActive || bossDeathSequence.active) {
    return;
  }

  if (!hasAliveBossLeg("lower")) {
    resetBossSpreadAttack();
    return;
  }

  if (!boss.spreadAttackActive || boss.spreadAttackSources.length === 0) {
    return;
  }

  let pendingSources = 0;

  for (let i = 0; i < boss.spreadAttackSources.length; i++) {
    const source = boss.spreadAttackSources[i];

    if (source.done) {
      continue;
    }

    if (!isBossSpreadSideAlive(source.side)) {
      source.done = true;
      continue;
    }

    pendingSources++;

    if (source.startDelay > 0) {
      source.startDelay--;
      continue;
    }

    if (!source.queued) {
      queueBossSpreadVolley(source.side);
      source.queued = true;
      source.done = true;
    }
  }

  if (pendingSources === 0) {
    resetBossSpreadAttack();
  }
}

function createBossAttackTelegraph(type, role, side, target = null, life = 14) {
  bossAttackTelegraphs.push({
    type: type,
    role: role,
    side: side,
    target: target,
    life: life,
    maxLife: life
  });
}

function createBossPairDestroyedBurst(role) {
  const roleLegs = getBossLegsByRole(role);

  if (roleLegs.length === 0) {
    return;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < roleLegs.length; i++) {
    const legBox = getBossLegBox(roleLegs[i]);
    minX = Math.min(minX, legBox.x);
    minY = Math.min(minY, legBox.y);
    maxX = Math.max(maxX, legBox.x + legBox.width);
    maxY = Math.max(maxY, legBox.y + legBox.height);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  createImpactFlash(centerX, centerY, 30, 7);
  createDebrisPattern(centerX, centerY, "sparkSpray", {
    count: 9,
    color: "#ff9a3c",
    speed: 4.6,
    life: 13,
    length: 9,
    width: 1.7
  });
  createDebrisPattern(centerX, centerY, "lightningCrackle", {
    count: 3,
    speed: 2.8,
    life: 9
  });
}

function getBossDamageEmitterActiveSmokeCount(sourceId) {
  let count = 0;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    if (particle.type === "bossSmoke" && particle.sourceId === sourceId) {
      count++;
    }
  }

  return count;
}

function updateBossDamageEmitters() {
  if (!boss.active || bossDeathSequence.active) {
    return;
  }

  for (let i = 0; i < boss.damageEmitters.length; i++) {
    const emitter = boss.damageEmitters[i];

    if (emitter.kind === "leg") {
      const leg = emitter.leg;

      if (!leg || leg.alive) {
        emitter.smokeTimer = 0;
        emitter.emberTimer = 0;
        emitter.sparkTimer = 0;
        emitter.glowTimer = 0;
        continue;
      }

      const anchorPoint = getBossDamageAnchorPoint(emitter.anchorKey);
      if (!anchorPoint) {
        continue;
      }

      const effectX = anchorPoint.x;
      const effectY = anchorPoint.y + (leg.role === "lower" ? 10 : 0);
      const sideDestroyedCount = getBossDestroyedLegSideCount(emitter.side);
      const densityBoost = sideDestroyedCount >= 2 ? 1 + (sideDestroyedCount - 1) * 0.34 : 1;
      const spreadBoost = sideDestroyedCount >= 2 ? 1 + (sideDestroyedCount - 1) * 0.22 : 1;
      const lowerSmokeDensity = leg.role === "lower" ? 1.25 : 1;
      const smokeRate = Math.max(1, Math.round(5 / (densityBoost * lowerSmokeDensity)));
      const emberRate = Math.max(5, Math.round(14 / densityBoost));
      const sparkRate = leg.role === "lower" ? 12 : 18;
      emitter.smokeTimer--;
      emitter.emberTimer--;
      emitter.sparkTimer--;
      emitter.glowTimer--;

      if (emitter.smokeTimer <= 0) {
        const baseSmokeCount = sideDestroyedCount >= 2 ? 4 : 3;
        const smokeCount = Math.ceil(baseSmokeCount * lowerSmokeDensity);
        const smokeSpreadX = sideDestroyedCount >= 2 ? 22 + spreadBoost * 9 : 16 + spreadBoost * 8;
        const smokeSpreadY = sideDestroyedCount >= 2 ? 18 + spreadBoost * 8 : 12 + spreadBoost * 7;
        const activeSmokeCount = getBossDamageEmitterActiveSmokeCount(emitter.id);
        const baseSmokeLimit = sideDestroyedCount >= 2 ? 8 : 6;
        const smokeLimit = Math.ceil(baseSmokeLimit * lowerSmokeDensity);

        for (let smokeIndex = 0; smokeIndex < smokeCount && activeSmokeCount + smokeIndex < smokeLimit; smokeIndex++) {
          const burstBoost = Math.random() < (sideDestroyedCount >= 2 ? 0.42 : 0.28) ? 1.18 : 1;
          spawnBossDamageSmokeParticle(effectX, effectY, {
            life: 34 + Math.floor(Math.random() * 12),
            radius: 12 + spreadBoost * 4.2 + Math.random() * 4,
            spread: 1.08 + Math.random() * 0.28,
            tiltX: -boss.velocityX * 0.003,
            baseUp: 2.15,
            speed: (0.28 + Math.random() * 0.11) * burstBoost,
            spawnSpreadX: smokeSpreadX,
            spawnSpreadY: smokeSpreadY,
            drag: 0.966 + Math.random() * 0.012,
            lift: 0.016 + Math.random() * 0.012,
            turbulence: 0.022 + Math.random() * 0.014,
            scale: 0.92 + Math.random() * 0.15,
            widthScale: 1.0 + Math.random() * 0.35,
            heightScale: 0.72 + Math.random() * 0.2,
            stretchX: 1.08 + Math.random() * 0.3,
            stretchY: 0.78 + Math.random() * 0.16,
            skew: (Math.random() - 0.5) * 0.32,
            color: sideDestroyedCount >= 2 ? "#464047" : "#4d474f",
            darkColor: sideDestroyedCount >= 2 ? "#2d2a30" : "#353139",
            midColor: sideDestroyedCount >= 2 ? "#646067" : "#5b565d",
            lightColor: sideDestroyedCount >= 2 ? "#9f989a" : "#a7a0a2",
            glowColor: sideDestroyedCount >= 2 ? "#ffb05a" : "#ff9644",
            glowAlpha: sideDestroyedCount >= 2 ? 0.28 : 0.22,
            sourceId: emitter.id
          });
        }

        emitter.smokeTimer = smokeRate + Math.floor(Math.random() * 2);
      }

      if (emitter.emberTimer <= 0) {
        spawnBossDamageEmberParticle(effectX, effectY, {
          life: 7 + Math.floor(Math.random() * 3),
          radius: 4 + (leg.role === "lower" ? 1 : 0),
          speedX: emitter.side === -1 ? -0.18 - Math.random() * 0.08 : 0.18 + Math.random() * 0.08,
          speedY: -0.24 - Math.random() * 0.06,
          gravity: 0.08,
          innerColor: leg.role === "lower" ? "#fff0b5" : "#ffe7a0",
          outerColor: leg.role === "lower" ? "#ffb149" : "#ff9441",
          glowColor: "#ffd07a",
          sourceId: emitter.id
        });
        emitter.emberTimer = Math.max(5, emberRate - 3) + Math.floor(Math.random() * 2);
      }

      if (emitter.sparkTimer <= 0) {
        const sparkChance = sideDestroyedCount >= 2 ? 0.55 : 0.4;

        if (Math.random() < sparkChance) {
          const angleBase = emitter.side === -1 ? Math.PI * 0.96 : Math.PI * 0.04;
          const sparkCount = leg.role === "lower" ? 4 : 3;

          createImpactFlash(effectX, effectY, leg.role === "lower" ? 5 : 4, 2);

          for (let sparkIndex = 0; sparkIndex < sparkCount; sparkIndex++) {
            spawnBossDamageSparkParticle(
              effectX,
              effectY,
              angleBase,
              leg.role === "lower" ? 4.2 + Math.random() * 1.1 : 3.6 + Math.random() * 0.9,
              {
                color: leg.role === "lower" ? "#fff7be" : "#ffe97a",
                life: leg.role === "lower" ? 8 : 7,
                width: 1.9 + (leg.role === "lower" ? 0.15 : 0),
                length: leg.role === "lower" ? 18 + Math.random() * 6 : 16 + Math.random() * 5,
                spread: 0.44,
                gravity: 0.14,
                sourceId: emitter.id
              }
            );
          }
        }

        emitter.sparkTimer = sparkRate + Math.floor(Math.random() * 8);
      }

      if (emitter.glowTimer <= 0) {
        createImpactFlash(effectX, effectY, sideDestroyedCount >= 2 ? 7 : 5, 2);
        spawnBossDamageEmberParticle(effectX, effectY, {
          life: 6 + Math.floor(Math.random() * 2),
          radius: sideDestroyedCount >= 2 ? 6.2 : 5.4,
          speedX: emitter.side === -1 ? -0.06 : 0.06,
          speedY: -0.08,
          gravity: 0.04,
          innerColor: "#fff7bf",
          outerColor: "#ffb14d",
          glowColor: "#fff0a8",
          sourceId: emitter.id
        });
        if (Math.random() < 0.6) {
          spawnBossDamageEmberParticle(effectX, effectY, {
            life: 6 + Math.floor(Math.random() * 2),
            radius: 3 + Math.random() * 1.2,
            speedX: (emitter.side === -1 ? -1 : 1) * (0.02 + Math.random() * 0.05),
            speedY: 0.14 + Math.random() * 0.12,
            gravity: 0.12 + Math.random() * 0.03,
            innerColor: "#fff4b9",
            outerColor: "#ffba56",
            glowColor: "#ffe08a",
            sourceId: emitter.id
          });
        }
        emitter.glowTimer = sideDestroyedCount >= 3 ? 12 : 16;
      }
      continue;
    }

    emitter.smokeTimer = 0;
    emitter.emberTimer = 0;
    emitter.sparkTimer = 0;
    emitter.glowTimer = 0;
  }
}

function updateBossRage() {
  if (boss.hitFlash > 0) {
    boss.hitFlash--;
  }

  if (bossDebugLastHit.timer > 0) {
    bossDebugLastHit.timer--;
  }

  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].hitFlash > 0) {
      boss.legs[i].hitFlash--;
    }
  }

  if (!boss.active) {
    return;
  }

  updateBossDamageEmitters();

  const destroyedPairs = getDestroyedBossLegPairCount();
  const destroyedLegs = getDestroyedBossLegCount();

  const pairRoles = ["upper", "middle", "lower"];

  for (let i = 0; i < pairRoles.length; i++) {
    const role = pairRoles[i];

    if (!hasAliveBossLeg(role) && !boss.destroyedPairBurstFlags[role]) {
      createBossPairDestroyedBurst(role);
      boss.destroyedPairBurstFlags[role] = true;
    }
  }

  if (destroyedLegs > boss.lastDestroyedLegCount) {
    boss.rageFlashTimer = 35;
    boss.lastDestroyedLegCount = destroyedLegs;
  }

  applyBossRageAttackDelays();

  if (boss.rageFlashTimer > 0) {
    boss.rageFlashTimer--;
  }

  if (bossCoreLaser.state === "charging") {
    const chargeIntensity = 1.2 + (bossCoreLaser.timer % 8) * 0.12;
    return {
      x: -chargeIntensity + Math.random() * chargeIntensity * 2,
      y: -chargeIntensity + Math.random() * chargeIntensity * 2
    };
  }

  if (destroyedPairs >= 3) {
    boss.speed = boss.baseSpeed + 0.75;
    bossCoreLaser.cooldownMax = Math.max(75, bossCoreLaser.baseCooldownMax * 0.32);
  } else {
    boss.speed = boss.baseSpeed + destroyedPairs * 0.18;
    bossCoreLaser.cooldownMax = Math.max(170, bossCoreLaser.baseCooldownMax - destroyedPairs * 22);
  }

  if (bossCoreLaser.cooldown > bossCoreLaser.cooldownMax) {
    bossCoreLaser.cooldown = bossCoreLaser.cooldownMax;
  }
}

function getBossVisualJitter() {
  const destroyedPairs = getDestroyedBossLegPairCount();
  let hitIntensity = 0;

  if (boss.hitFlash > 0) {
    hitIntensity = Math.max(hitIntensity, 1 + boss.hitFlash * 0.08);
  }

  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].hitFlash > 0) {
      hitIntensity = Math.max(hitIntensity, 0.65);
      break;
    }
  }

  const hitJitter = hitIntensity > 0
    ? {
        x: Math.sin(bossAnimationTimer * 2.1) * hitIntensity,
        y: Math.cos(bossAnimationTimer * 2.6) * hitIntensity * 0.72
      }
    : { x: 0, y: 0 };

  if (bossDeathSequence.active) {
    const intensity = bossDeathSequence.timer < 90 ? 4.5 : 1.5;

    return {
      x: -intensity + Math.random() * intensity * 2 + hitJitter.x,
      y: -intensity + Math.random() * intensity * 2 + hitJitter.y
    };
  }

  if (boss.rageFlashTimer > 0) {
    return {
      x: -3 + Math.random() * 6 + hitJitter.x,
      y: -2 + Math.random() * 4 + hitJitter.y
    };
  }

  if (destroyedPairs <= 0) {
    return hitJitter;
  }

  const intensity = destroyedPairs === 3 ? 3.2 : destroyedPairs * 0.45;

  return {
    x: -intensity + Math.random() * intensity * 2 + hitJitter.x,
    y: -intensity + Math.random() * intensity * 2 + hitJitter.y
  };
}

function isBossCoreLaserBusy() {
  return bossCoreLaser.state === "charging" || bossCoreLaser.state === "active";
}

function addBossMajorAttackLock(frames) {
  boss.majorAttackLockTimer = Math.max(boss.majorAttackLockTimer, frames);
}

function handleBossShooting() {
  if (!boss.active || boss.introActive || bossDeathSequence.active) {
    return;
  }

  if (boss.majorAttackLockTimer > 0) {
    boss.majorAttackLockTimer--;
  }

  const laserBusy = isBossCoreLaserBusy();
  const majorAttackLocked = boss.majorAttackLockTimer > 0 || laserBusy;
  const playerCenterX = player.x + player.width / 2;

  // The basic boss spread attack is controlled per lower leg side.
  // A destroyed lower leg disables only its own spread source.
  if (hasAliveBossLeg("lower")) {
    boss.shootTimer--;

    if (boss.shootTimer <= 0 && !boss.spreadAttackActive) {
      startBossSpreadAttack();
      boss.shootTimer = boss.shootDelay;
    }

    updateBossSpreadAttack();
  } else {
    boss.shootTimer = boss.shootDelay;
    resetBossSpreadAttack();
  }

  // The aimed web shot is controlled by the middle leg pair.
  // If both middle legs are destroyed, this attack is disabled.
  if (hasAliveBossLeg("middle")) {
    if (!majorAttackLocked) {
      boss.webShootTimer--;
    }

    if (boss.webShootTimer <= 0 && !majorAttackLocked) {
      const side = chooseBossAttackSide("middle", "alternate");
      if (side !== 0) {
        fireBossWebShot(side);
      }
      boss.webShootTimer = boss.webShootDelay;
      addBossMajorAttackLock(20);
    }
  } else {
    boss.webShootTimer = boss.webShootDelay;
  }

  // The upper leg pair launches the boss missile.
  // The missile explosion creates the boss dangerous zone.
  // If both upper legs are destroyed, this missile attack is disabled.
  if (hasAliveBossLeg("upper")) {
    if (!majorAttackLocked) {
      boss.dangerZoneTimer--;
    }

    if (boss.dangerZoneTimer <= 0 && !majorAttackLocked) {
      const missileSide = chooseBossAttackSide("upper", "alternate", playerCenterX);
      if (missileSide !== 0) {
        launchBossDangerZoneMissile(missileSide);
      }
    }
  } else {
    boss.dangerZoneTimer = boss.dangerZoneDelay;
    bossDangerZones.length = 0;
  }
}

function queueBossSpreadVolley(side) {
  const rageDelayScale = getBossRageAttackIntervalMultiplier();
  const muzzle = getBossSpreadMuzzlePoint(side);
  const sourceVelocityX = boss.velocityX || 0;
  const sourceVelocityY = boss.velocityY || 0;
  const sourceAngle = side === -1 ? Math.PI * 0.92 : Math.PI * 0.08;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const bullets = [
    { variant: "bossRedLarge", delay: 0, size: 20, spreadScale: 1.0, drift: 1.14 },
    { variant: "bossRedMedium", delay: Math.round(65 * rageDelayScale), size: 16, spreadScale: 1.0, drift: 1.0 },
    { variant: "bossRedSmall", delay: Math.round(130 * rageDelayScale), size: 12, spreadScale: 1.0, drift: 0.84 }
  ];

  createMuzzleFlash(muzzle.x, muzzle.y, sourceAngle, "#ff7b66", 14);
  createBossAttackTelegraph("spread", "lower", side, null, 10);
  playBossSpreadBurstSound();
  boss.spreadAttackDebugQueues[String(side)] = bullets.map((part, index) => ({
    shotNumber: index + 1,
    side: side,
    variant: part.variant,
    size: part.size,
    spawnDelay: part.delay,
    muzzleX: muzzle.x,
    muzzleY: muzzle.y
  }));

  for (let i = 0; i < bullets.length; i++) {
    const part = bullets[i];
    const bullet = createBossSpreadVolleyBullet(part, side, i + 1, muzzle, playerCenterX, playerCenterY, sourceVelocityX, sourceVelocityY);

    enemyBullets.push(bullet);
  }
}

function getBossDangerZoneRect(centerX = null, centerY = null) {
  const zoneSize = 120;
  const margin = 30;
  const minY = Math.max(220, canvas.height * 0.55);
  const maxY = canvas.height - zoneSize - 70;
  const rawX = Number.isFinite(centerX) ? centerX - zoneSize / 2 : margin + Math.random() * (canvas.width - zoneSize - margin * 2);
  const rawY = Number.isFinite(centerY) ? centerY - zoneSize / 2 : minY + Math.random() * Math.max(1, maxY - minY);
  const zoneX = Math.max(margin, Math.min(canvas.width - zoneSize - margin, rawX));
  const zoneY = Math.max(minY, Math.min(maxY, rawY));
  return {
    x: zoneX,
    y: zoneY,
    width: zoneSize,
    height: zoneSize,
    centerX: zoneX + zoneSize / 2,
    centerY: zoneY + zoneSize / 2
  };
}

function spawnBossDangerZone(zoneRect) {
  runStats.bossDangerZonesSpawned++;
  bossDangerZones.push({
    x: zoneRect.x,
    y: zoneRect.y,
    width: zoneRect.width,
    height: zoneRect.height,
    centerX: zoneRect.centerX,
    centerY: zoneRect.centerY,
    radius: zoneRect.width / 2,
    state: "warning",
    timer: boss.dangerZoneWarningDuration,
    animationTimer: 0,
    damageTickTimer: 0,
    sourceSides: [],
    hitPlayer: false
  });
}

function launchBossDangerZoneMissile(side = 0) {
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const launchSide = side === 0 ? chooseBossAttackSide("upper", "alternate", playerCenterX) : side;
  const anchor = getBossMissileMuzzlePoint(launchSide);
  const startX = launchSide === -1 ? anchor.x - 8 : anchor.x - 6;
  const startY = anchor.y - 6;
  const dx = playerCenterX - startX;
  const dy = playerCenterY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 4.8;
  const travelFrames = Math.max(24, Math.ceil(distance / speed));
  const launchDirection = playerCenterX < anchor.x ? -1 : 1;
  const launchDuration = 36;
  const proximityRadius = 26;
  const launchAwaySpeedX = -launchDirection * 1.55;
  const launchAwaySpeedY = -1.25;

  createMuzzleFlash(anchor.x, anchor.y, Math.atan2(dy, dx), "#ff7a2f", 22, "enemy");
  playBossMissileLaunchSound();
  runStats.bossMissilesLaunched++;

  bossBullets.push({
    type: "missile",
    missileVariant: "boss",
    x: startX,
    y: startY,
    width: 18,
    height: 20,
    speedX: launchAwaySpeedX,
    speedY: launchAwaySpeedY,
    speed: speed,
    turnRate: 0.055,
    launchTimer: launchDuration,
    launchDuration: launchDuration,
    launchAwaySpeedX: launchAwaySpeedX,
    launchAwaySpeedY: launchAwaySpeedY,
    trailTimer: 0,
    trailAnchorOffset: 24,
    trailDensity: 1.4,
    trailLength: 1.35,
    trailHeat: 1.2,
    proximityRadius: proximityRadius,
    proximityArmed: false,
    proximityBeeped: false,
    proximityDetonationTimer: 0,
    life: travelFrames + launchDuration
  });

  boss.dangerZoneTimer = boss.dangerZoneDelay;
}

function explodeBossDangerZoneMissile(index, hitPlayer = false) {
  const missile = bossBullets[index];
  const centerX = missile.x + missile.width / 2;
  const centerY = missile.y + missile.height / 2;
  const zoneRect = getBossDangerZoneRect(centerX, centerY);

  stopBossMissileFlightLoop(true);

  createImpactFlash(centerX, centerY, 68, 9);
  createImpactFlash(centerX, centerY, 30, 5);
  spawnExplosionNow({
    variant: "tankCrimson",
    x: missile.x - 26,
    y: missile.y - 26,
    width: missile.width + 52,
    height: missile.height + 52,
    drawWidth: 128,
    drawHeight: 128,
    debrisPattern: "cone",
    debrisCount: 26,
    debrisColor: "#ffb14a",
    debrisSpeed: 5.8,
    secondaryDebrisPattern: "lightningCrackle",
    playSound: true,
    soundCooldown: 0
  });

  createDebrisPattern(centerX, centerY, "sparkSpray", {
    count: 18,
    color: "#ff7a2f",
    speed: 5.6,
    life: 14
  });
  createDebrisPattern(centerX, centerY, "lightningCrackle", {
    count: 3,
    speed: 4.4,
    life: 8
  });
  createTankCrimsonLightning(centerX, centerY, missile.width + 56, missile.height + 56, 6);

  if (hitPlayer && damagePlayer(1, "Р Р°РєРµС‚Р° Р‘РѕСЃСЃР°")) {
    runStats.bossMissilesHitPlayer++;
  }

  delayedExplosions.push({
    kind: "bossHazardZone",
    delay: bossHazardZoneSpawnDelay,
    zoneRect: zoneRect
  });
  bossBullets.splice(index, 1);
}

function updateBossDangerZones() {
  for (let i = bossDangerZones.length - 1; i >= 0; i--) {
    bossDangerZones[i].animationTimer = (bossDangerZones[i].animationTimer || 0) + 1;
    bossDangerZones[i].timer--;

    if (bossDangerZones[i].timer <= 0) {
      if (bossDangerZones[i].state === "warning") {
        bossDangerZones[i].state = "active";
        bossDangerZones[i].timer = boss.dangerZoneActiveDuration;
        bossDangerZones[i].damageTickTimer = 0;
      } else {
        bossDangerZones.splice(i, 1);
      }
    }
  }
}


function resetBossCoreLaser() {
  bossCoreLaser.state = "idle";
  bossCoreLaser.timer = 0;
  bossCoreLaser.cooldown = bossCoreLaser.cooldownMax;
  bossCoreLaser.damageTickTimer = 0;
  stopBossCoreLaserLoop(true);
}

function updateBossCoreLaser() {
  if (!boss.active || boss.introActive) {
    resetBossCoreLaser();
    return;
  }

  if (bossCoreLaser.state === "idle") {
    bossCoreLaser.cooldown--;

    if (bossCoreLaser.cooldown <= 0 && bossDangerZones.length === 0 && boss.majorAttackLockTimer <= 0) {
      bossCoreLaser.state = "charging";
      bossCoreLaser.timer = bossCoreLaser.chargeDuration;
      addBossMajorAttackLock(bossCoreLaser.chargeDuration + bossCoreLaser.activeDuration + 24);
    }

    return;
  }

  bossCoreLaser.timer--;

    if (bossCoreLaser.timer <= 0) {
    if (bossCoreLaser.state === "charging") {
      bossCoreLaser.state = "active";
      bossCoreLaser.timer = bossCoreLaser.activeDuration;
      bossCoreLaser.damageTickTimer = 0;
    } else {
      bossCoreLaser.state = "idle";
      bossCoreLaser.cooldown = bossCoreLaser.cooldownMax;
      addBossMajorAttackLock(24);
      stopBossCoreLaserLoop(false);
    }
  }

  updateBossCoreLaserLoop();
}

function getBossCoreLaserBox() {
  const geometry = getBossCoreLaserGeometry();
  return {
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height
  };
}

function getBossCoreLaserVisualBox() {
  const geometry = getBossCoreLaserGeometry();
  return {
    x: geometry.x,
    y: geometry.y,
    width: geometry.width,
    height: geometry.height
  };
}

function getBossCoreLaserEvolutionProfile() {
  const destroyedPairs = Math.max(0, Math.min(3, getDestroyedBossLegPairCount()));
  const profiles = [
    {
      width: 20,
      capScale: 2.0,
      capPulse: 0.08,
      capSprite: sprites.projectiles.bossLaserCapWarm,
      beamSprite: sprites.projectiles.bossLaserBeamWarm,
      emitterYOffset: 15,
      centerOffsetX: 4,
      beamGlowColor: "rgba(255, 190, 88, 0.72)",
      beamFillColor: "rgba(255, 184, 96, 0.5)",
      glintColor: "rgba(255, 238, 180, 0.84)",
      edgeColor: "rgba(255, 246, 212, 0.92)",
      coreColor: "rgba(255, 250, 232, 0.9)",
      sparkColor: "rgba(255, 176, 96, 0.9)"
    },
    {
      width: 28,
      capScale: 2.12,
      capPulse: 0.1,
      capSprite: sprites.projectiles.bossLaserCapMid,
      beamSprite: sprites.projectiles.bossLaserBeamMid,
      emitterYOffset: 16,
      centerOffsetX: 4,
      beamGlowColor: "rgba(255, 112, 60, 0.8)",
      beamFillColor: "rgba(255, 102, 56, 0.58)",
      glintColor: "rgba(255, 230, 210, 0.82)",
      edgeColor: "rgba(255, 220, 210, 0.94)",
      coreColor: "rgba(255, 244, 236, 0.94)",
      sparkColor: "rgba(255, 108, 78, 0.94)"
    },
    {
      width: 38,
      capScale: 2.24,
      capPulse: 0.12,
      capSprite: sprites.projectiles.bossLaserCapHot,
      beamSprite: sprites.projectiles.bossLaserBeamHot,
      emitterYOffset: 17,
      centerOffsetX: 4,
      beamGlowColor: "rgba(255, 54, 50, 0.92)",
      beamFillColor: "rgba(255, 40, 56, 0.68)",
      glintColor: "rgba(255, 220, 216, 0.8)",
      edgeColor: "rgba(255, 204, 214, 0.95)",
      coreColor: "rgba(255, 236, 240, 0.96)",
      sparkColor: "rgba(255, 64, 76, 0.96)"
    },
    {
      width: 46,
      capScale: 2.36,
      capPulse: 0.14,
      capSprite: sprites.projectiles.bossLaserCapHot,
      beamSprite: sprites.projectiles.bossLaserBeamHot,
      emitterYOffset: 18,
      centerOffsetX: 4,
      beamGlowColor: "rgba(255, 18, 34, 0.98)",
      beamFillColor: "rgba(255, 10, 44, 0.78)",
      glintColor: "rgba(255, 208, 214, 0.88)",
      edgeColor: "rgba(255, 184, 194, 0.98)",
      coreColor: "rgba(255, 244, 246, 1)",
      sparkColor: "rgba(255, 34, 48, 1)"
    }
  ];

  return {
    destroyedPairs: destroyedPairs,
    destroyedLegs: destroyedPairs * 2,
    ...profiles[destroyedPairs]
  };
}

function getBossCoreLaserGeometry() {
  const profile = getBossCoreLaserEvolutionProfile();
  const coreHitbox = getBossCoreHitbox();
  const startY = coreHitbox ? coreHitbox.y + coreHitbox.height * 0.72 : boss.y + boss.height;
  const startX = coreHitbox ? coreHitbox.x + coreHitbox.width / 2 + (profile.centerOffsetX || 0) : boss.x + boss.width / 2 + (profile.centerOffsetX || 0);

  return {
    x: startX - profile.width / 2,
    y: startY,
    width: profile.width,
    height: canvas.height - startY,
    startX: startX,
    startY: startY,
    profile: profile
  };
}

function drawBossLaserCap(spriteConfig, centerX, centerY, scale, alpha, glowStrength) {
  if (!spriteConfig || !spriteConfig.image.loaded) {
    return;
  }

  const drawWidth = spriteConfig.drawWidth * scale;
  const drawHeight = spriteConfig.drawHeight * scale;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.imageSmoothingEnabled = false;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(255, 120, 60, 0.95)";
  ctx.shadowBlur = glowStrength;
  ctx.drawImage(
    spriteConfig.image,
    spriteConfig.sx,
    spriteConfig.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.restore();
}

function drawBossLaserBeamColumn(spriteConfig, columnX, topY, height, width, intensity, phase, isCharging, colors = {}) {
  if (!spriteConfig || !spriteConfig.image.loaded || height <= 0) {
    return;
  }

  const bodySx = spriteConfig.sx + 2;
  const bodySy = spriteConfig.sy;
  const bodySw = Math.max(1, spriteConfig.sw - 4);
  const bodySh = spriteConfig.sh;
  const beamWidth = width;
  const beamX = columnX - beamWidth / 2;
  const beamGlintWidth = Math.max(4, Math.round(beamWidth * 0.34));
  const beamGlowColor = colors.beamGlowColor || "rgba(255, 150, 70, 0.96)";
  const beamFillColor = colors.beamFillColor || "rgba(255, 170, 88, 0.82)";
  const glintColor = colors.glintColor || "rgba(255, 238, 180, 0.84)";
  const edgeColor = colors.edgeColor || "rgba(255, 244, 220, 0.9)";
  const coreColor = colors.coreColor || "rgba(255, 248, 232, 0.92)";
  const sparkColor = colors.sparkColor || "rgba(255, 96, 72, 0.92)";
  const sparkCount = isCharging ? 0 : (width >= 46 ? 4 : width >= 38 ? 3 : width >= 28 ? 2 : 1);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.imageSmoothingEnabled = false;

  const bodyAlpha = intensity * (0.9 + Math.sin(phase * 0.08) * 0.04);

  ctx.globalAlpha = bodyAlpha;
  ctx.shadowColor = beamGlowColor;
  ctx.shadowBlur = isCharging ? 8 : 10;
  ctx.drawImage(
    spriteConfig.image,
    bodySx,
    bodySy,
    bodySw,
    bodySh,
    beamX,
    topY,
    beamWidth,
    height
  );

  ctx.globalAlpha = bodyAlpha * 0.42;
  ctx.strokeStyle = beamGlowColor;
  ctx.lineWidth = Math.max(1.8, Math.min(3.2, beamWidth * 0.07));
  ctx.strokeRect(beamX + 0.5, topY + 0.5, beamWidth - 1, height - 1);

  ctx.globalAlpha = bodyAlpha * 0.94;
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(beamX + 0.75, topY + 0.75, beamWidth - 1.5, height - 1.5);

  ctx.globalAlpha = bodyAlpha * 0.62;
  ctx.fillStyle = coreColor;
  ctx.fillRect(beamX + beamWidth * 0.34, topY, beamWidth * 0.32, height);

  ctx.globalAlpha = bodyAlpha * 0.5;
  ctx.fillStyle = beamFillColor;
  ctx.fillRect(beamX + beamWidth / 2 - beamGlintWidth / 2, topY, beamGlintWidth, height);

  ctx.globalAlpha = intensity * 0.28;
  ctx.fillStyle = glintColor;
  ctx.fillRect(beamX, topY, beamWidth, height);

  if (sparkCount > 0) {
    for (let i = 0; i < sparkCount; i++) {
      const sparkPhase = phase * 0.22 + i * 1.63;
      const sparkProgress = Math.min(0.96, Math.max(0.04, 0.5 + Math.sin(sparkPhase) * 0.42));
      const sparkY = topY + sparkProgress * Math.max(8, height - 8);
      const edgeSide = i % 2 === 0 ? -1 : 1;
      const sparkX = columnX + edgeSide * (beamWidth / 2 - 2);
      const sparkLength = 5 + Math.sin(sparkPhase * 1.4) * 2.4;

      ctx.save();
      ctx.globalAlpha = intensity * (0.38 + i * 0.14);
      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY);
      ctx.lineTo(sparkX + edgeSide * 2.5, sparkY + sparkLength);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 220, 220, 0.92)";
      ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
      ctx.restore();
    }
  }
  ctx.restore();
}

function moveBossBullets() {
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    if (bossBullets[i].type === "missile") {
      if ((bossBullets[i].launchTimer || 0) > 0) {
        const launchDuration = bossBullets[i].launchDuration || 1;
        const launchProgress = 1 - Math.max(0, bossBullets[i].launchTimer - 1) / launchDuration;
        const launchBlend = clamp((launchProgress - 0.4) / 0.6, 0, 1);
        const launchCurve = launchBlend * launchBlend * (3 - 2 * launchBlend);
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const missileX = bossBullets[i].x + bossBullets[i].width / 2;
        const missileY = bossBullets[i].y + bossBullets[i].height / 2;
        const dx = playerCenterX - missileX;
        const dy = playerCenterY - missileY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const desiredX = dx / distance * bossBullets[i].speed;
        const desiredY = dy / distance * bossBullets[i].speed;
        const awayX = Number.isFinite(bossBullets[i].launchAwaySpeedX) ? bossBullets[i].launchAwaySpeedX : bossBullets[i].speedX;
        const awayY = Number.isFinite(bossBullets[i].launchAwaySpeedY) ? bossBullets[i].launchAwaySpeedY : bossBullets[i].speedY;
        const desiredLaunchX = awayX + (desiredX - awayX) * launchCurve;
        const desiredLaunchY = awayY + (desiredY - awayY) * launchCurve;
        const launchTurnRate = 0.016 + launchCurve * 0.028;

        bossBullets[i].launchTimer--;
        bossBullets[i].speedX += (desiredLaunchX - bossBullets[i].speedX) * launchTurnRate;
        bossBullets[i].speedY += (desiredLaunchY - bossBullets[i].speedY) * launchTurnRate;
        bossBullets[i].x += bossBullets[i].speedX;
        bossBullets[i].y += bossBullets[i].speedY;
        bossBullets[i].life = (bossBullets[i].life || 0) - 1;
        createTankMissileTrail(bossBullets[i]);

        const launchedMissileHitPlayer =
          player.x < bossBullets[i].x + bossBullets[i].width &&
          player.x + player.width > bossBullets[i].x &&
          player.y < bossBullets[i].y + bossBullets[i].height &&
          player.y + player.height > bossBullets[i].y;

        if (launchedMissileHitPlayer) {
          explodeBossDangerZoneMissile(i, true);
        }

        continue;
      }

      const missileX = bossBullets[i].x + bossBullets[i].width / 2;
      const missileY = bossBullets[i].y + bossBullets[i].height / 2;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      const dx = playerCenterX - missileX;
      const dy = playerCenterY - missileY;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const desiredX = dx / distance * bossBullets[i].speed;
      const desiredY = dy / distance * bossBullets[i].speed;
      const turnRate = bossBullets[i].turnRate || 0.08;

      bossBullets[i].speedX += (desiredX - bossBullets[i].speedX) * turnRate;
      bossBullets[i].speedY += (desiredY - bossBullets[i].speedY) * turnRate;
      bossBullets[i].x += bossBullets[i].speedX;
      bossBullets[i].y += bossBullets[i].speedY;
      bossBullets[i].life = (bossBullets[i].life || 0) - 1;
      createTankMissileTrail(bossBullets[i]);

      const missileCenterX = bossBullets[i].x + bossBullets[i].width / 2;
      const missileCenterY = bossBullets[i].y + bossBullets[i].height / 2;
      const proximityRadius = bossBullets[i].proximityRadius || 46;
      const proximityReached = Math.hypot(missileCenterX - playerCenterX, missileCenterY - playerCenterY) <= proximityRadius;
      const hitPlayer =
        player.x < bossBullets[i].x + bossBullets[i].width &&
        player.x + player.width > bossBullets[i].x &&
        player.y < bossBullets[i].y + bossBullets[i].height &&
        player.y + player.height > bossBullets[i].y;
      let proximityDetonationReady = false;

      if (proximityReached && !hitPlayer) {
        if (!bossBullets[i].proximityArmed) {
          bossBullets[i].proximityArmed = true;
          bossBullets[i].proximityDetonationTimer = 2;
          playBossMissileProximityBeep();
        } else {
          bossBullets[i].proximityDetonationTimer = Math.max(0, (bossBullets[i].proximityDetonationTimer || 0) - 1);
          proximityDetonationReady = bossBullets[i].proximityDetonationTimer <= 0;
        }
      }

      if (
        bossBullets[i].life <= 0 ||
        proximityDetonationReady ||
        hitPlayer ||
        bossBullets[i].x < -60 ||
        bossBullets[i].x > canvas.width + 60 ||
        bossBullets[i].y < -80 ||
        bossBullets[i].y > canvas.height + 80
      ) {
        explodeBossDangerZoneMissile(i, hitPlayer);
      }

      continue;
    }

    bossBullets[i].x += bossBullets[i].speedX;
    bossBullets[i].y += bossBullets[i].speedY;

    if (
      bossBullets[i].y > canvas.height ||
      bossBullets[i].x < -30 ||
      bossBullets[i].x > canvas.width + 30
    ) {
      bossBullets.splice(i, 1);
    }
  }
}

function moveBossWebBullets() {
  for (let i = bossWebBullets.length - 1; i >= 0; i--) {
    bossWebBullets[i].x += bossWebBullets[i].speedX;
    bossWebBullets[i].y += bossWebBullets[i].speedY;

    if (
      bossWebBullets[i].y > canvas.height ||
      bossWebBullets[i].x < -30 ||
      bossWebBullets[i].x > canvas.width + 30
    ) {
      bossWebBullets.splice(i, 1);
    }
  }
}

function checkBulletBossCollisions() {
  if (!boss.active || bossDeathSequence.active) {
    return;
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].destroyed) {
      continue;
    }

    let bulletHitSomething = false;
    const legHit = getClosestBossLegHit(bullets[i]);

    if (legHit) {
      createHitParticles(bullets[i].x, bullets[i].y, "bossLeg");
      playHitSound();
      legHit.leg.hitFlash = 7;
      bullets[i].destroyed = true;
      const oldLegHp = legHit.leg.hp;
      const damage = bullets[i].damage || 1;
      legHit.leg.hp -= damage;
      bulletHitSomething = true;
      setBossDebugLastHitDamage(getBossLabLegId(legHit.leg), bullets[i].x, bullets[i].y, legHit.segmentId || "", damage);
      if (window.console && console.log) {
        console.log("[boss-leg-hit]", {
          legId: getBossLabLegId(legHit.leg),
          segmentId: legHit.segmentId || "",
          damage: damage,
          bulletX: bullets[i].x,
          bulletY: bullets[i].y,
          hitbox: legHit.segmentRect || legHit.legBox
        });
      }

      if (legHit.leg.hp <= 0) {
        legHit.leg.alive = false;
        legHit.leg.destroyed = true;
        legHit.leg.sparkTimer = 3 + Math.floor(Math.random() * 5);
        logBossLegDestroyedVisual(legHit.leg, oldLegHp, legHit.leg.hp);
        score += 500;
        recordEnemyKill("bossLeg", 500);
        startSlowMotion(42);
        createExplosionParticles({
          type: "bossLeg",
          x: legHit.legBox.x,
          y: legHit.legBox.y,
          width: legHit.legBox.width,
          height: legHit.legBox.height
        });
      }
    }

    if (bulletHitSomething) {
      continue;
    }

    const bodyHit = getBossBodyHit(bullets[i]);

    if (bodyHit) {
      const damage = bullets[i].damage || 1;
      createHitParticles(bullets[i].x, bullets[i].y, "bossCore");
      playHitSound();
      boss.hitFlash = 6;
      bullets[i].destroyed = true;
      setBossDebugLastHitDamage("body", bullets[i].x, bullets[i].y, bodyHit.id || "", damage);
      boss.hp -= damage * getBossBodyDamageMultiplier();

      if (boss.hp <= 0) {
        startBossDeathSequence();
      }
    }
  }
}

function startBossDeathSequence() {
  if (bossDeathSequence.active) {
    return;
  }

  boss.hp = 0;
  runStats.bossDefeated = true;
  recordEnemyKill("boss");
  bossDeathSequence.active = true;
  bossDeathSequence.timer = 0;
  bossDeathSequence.bodyGone = false;
  bossDeathSequence.explosionTimer = 0;
  bossDeathSequence.screenShakeTimer = 115;
  bossDeathSequence.screenFlashTimer = 12;
  bossDeathSequence.aliveLegBoxes = [];

  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].alive) {
      const legBox = getBossLegBox(boss.legs[i]);
      bossDeathSequence.aliveLegBoxes.push({
        x: legBox.x,
        y: legBox.y,
        width: legBox.width,
        height: legBox.height
      });
    }
  }

  boss.rageFlashTimer = 0;
  boss.majorAttackLockTimer = bossDeathSequence.duration;
  resetBossCoreLaser();
  createBossDeathExplosionBurst();
}

function updateBossDeathSequence() {
  bossDeathSequence.timer++;
  bossAnimationTimer++;

  if (bossDeathSequence.screenShakeTimer > 0) {
    bossDeathSequence.screenShakeTimer--;
  }

  if (bossDeathSequence.screenFlashTimer > 0) {
    bossDeathSequence.screenFlashTimer--;
  }

  if (bossDeathSequence.timer < 85) {
    bossDeathSequence.explosionTimer--;

    if (bossDeathSequence.explosionTimer <= 0) {
      createBossDeathExplosionBurst();
      bossDeathSequence.explosionTimer = 10 + Math.floor(Math.random() * 9);
    }
  }

  if (bossDeathSequence.timer === 88) {
    bossDeathSequence.bodyGone = true;
    bossDeathSequence.screenFlashTimer = 18;
  }

  if (bossDeathSequence.timer >= bossDeathSequence.duration) {
    bossDeathSequence.active = false;
    boss.active = false;
    resultFadeTimer = 0;
    clearInputState();
    finalizeRunResult("victory");
    scene = "victory";
  }
}

function moveBossAttackTelegraphs() {
  for (let i = bossAttackTelegraphs.length - 1; i >= 0; i--) {
    bossAttackTelegraphs[i].life--;

    if (bossAttackTelegraphs[i].life <= 0) {
      bossAttackTelegraphs.splice(i, 1);
    }
  }
}

function createBossDeathExplosionBurst() {
  const bodyBurst = {
    type: "boss",
    x: boss.x + Math.random() * boss.width * 0.55,
    y: boss.y + Math.random() * boss.height * 0.45,
    width: boss.width * 0.45,
    height: boss.height * 0.55
  };

  createExplosionParticles(bodyBurst);

  if (bossDeathSequence.aliveLegBoxes.length > 0 && Math.random() < 0.65) {
    const legBox = bossDeathSequence.aliveLegBoxes[Math.floor(Math.random() * bossDeathSequence.aliveLegBoxes.length)];

    createExplosionParticles({
      type: "bossLeg",
      x: legBox.x + Math.random() * legBox.width * 0.65,
      y: legBox.y + Math.random() * legBox.height * 0.65,
      width: Math.max(34, legBox.width * 0.22),
      height: Math.max(34, legBox.height * 0.22)
    });
  }

  bossDeathSequence.screenFlashTimer = Math.max(bossDeathSequence.screenFlashTimer, 6);
}

function checkBulletEnemyCollisions() {
  for (let bulletIndex = bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    if (bullets[bulletIndex].destroyed) {
      continue;
    }

    for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
      if (
        bullets[bulletIndex].x < enemies[enemyIndex].x + enemies[enemyIndex].width &&
        bullets[bulletIndex].x + bullets[bulletIndex].width > enemies[enemyIndex].x &&
        bullets[bulletIndex].y < enemies[enemyIndex].y + enemies[enemyIndex].height &&
        bullets[bulletIndex].y + bullets[bulletIndex].height > enemies[enemyIndex].y
      ) {
        createHitParticles(
          bullets[bulletIndex].x,
          bullets[bulletIndex].y,
          enemies[enemyIndex].type
        );
        playHitSound();

        if (enemies[enemyIndex].type === "tank" || enemies[enemyIndex].type === "web") {
          enemies[enemyIndex].hitFlash = 5;
        }

        bullets[bulletIndex].destroyed = true;
        enemies[enemyIndex].hp -= bullets[bulletIndex].damage || 1;

        if (enemies[enemyIndex].hp <= 0) {
          const enemyType = enemies[enemyIndex].type;
          score += getEnemyScore(enemies[enemyIndex]);
          recordEnemyKill(enemyType, getEnemyScore(enemies[enemyIndex]));
          createExplosionParticles(enemies[enemyIndex]);
          enemies.splice(enemyIndex, 1);
        }

        break;
      }
    }
  }
}

function getEnemyScore(enemy) {
  if (enemy.type === "tank") {
    return 100;
  }

  if (enemy.type === "web") {
    return 75;
  }

  if (enemy.type === "zigzag") {
    return 50;
  }

  return 25;
}

function checkPlayerEnemyCollisions() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      handlePlayerEnemyCollision(i);
    }
  }
}

function handlePlayerEnemyCollision(enemyIndex) {
  const enemy = enemies[enemyIndex];

  if (!enemy) {
    return;
  }

  if (enemy.type === "tank" && enemy.hitFlash > 0) {
    return;
  }

  const collisionReason = enemy.type === "tank" ? "РЎС‚РѕР»РєРЅРѕРІРµРЅРёРµ СЃ РўР°СЂР°РЅРѕРј" : enemy.type === "web" ? "РЎС‚РѕР»РєРЅРѕРІРµРЅРёРµ СЃ РџР°СѓС‡РєРѕРј" : enemy.type === "zigzag" ? "РЎС‚РѕР»РєРЅРѕРІРµРЅРёРµ СЃ Р—РёРіР·Р°РіРѕРј" : "РЎС‚РѕР»РєРЅРѕРІРµРЅРёРµ СЃ РІСЂР°РіРѕРј";
  damagePlayer(1, collisionReason);
  createExplosionParticles(enemy);

  if (enemy.type === "tank") {
    enemy.hp -= enemy.maxHp * 0.5;
    enemy.hitFlash = Math.max(enemy.hitFlash, 12);
    return;
  }

  enemies.splice(enemyIndex, 1);
}

function checkEnemyBulletPlayerCollisions() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];

    if (bullet.spawnDelay !== undefined && bullet.spawnDelay > 0) {
      continue;
    }

    if (
      player.x < bullet.x + bullet.width &&
      player.x + player.width > bullet.x &&
      player.y < bullet.y + bullet.height &&
      player.y + player.height > bullet.y
    ) {
      if (bullet.type === "missile") {
        explodeEnemyMissile(i);
      } else {
        const damage = bullet.damage || 1;
        enemyBullets.splice(i, 1);
        const reason = bullet.bossSpreadBurst ? "Р Р°СЃСЃРµСЏРЅРЅС‹Р№ РІС‹СЃС‚СЂРµР» Р‘РѕСЃСЃР°" : bullet.zigzagVolleySourceEnemy ? "Р’С‹СЃС‚СЂРµР» Р—РёРіР·Р°РіР°" : "РЎРЅР°СЂСЏРґ РІСЂР°РіР°";
        damagePlayer(damage, reason);
      }
    }
  }
}

function checkWebBulletPlayerCollisions() {
  for (let i = webBullets.length - 1; i >= 0; i--) {
    if (webBullets[i].impacting) {
      continue;
    }

    if (
      player.x < webBullets[i].x + webBullets[i].width &&
      player.x + player.width > webBullets[i].x &&
      player.y < webBullets[i].y + webBullets[i].height &&
      player.y + player.height > webBullets[i].y
    ) {
      if (isPlayerInvulnerable) {
        webBullets.splice(i, 1);
        continue;
      }

      webBullets[i].impacting = true;
      webBullets[i].impactTimer = 6;
      webBullets[i].speedX = 0;
      webBullets[i].speedY = 0;
      player.slowTimer = 90;
      runStats.hitCount++;
      if (webBullets[i].bossWebAttack) {
        runStats.bossWebShotsHitPlayer++;
      } else {
        runStats.webAttacksHitPlayer++;
        runStats.webSlowApplications++;
      }
    }
  }
}

function checkBossBulletPlayerCollisions() {
  for (let i = bossBullets.length - 1; i >= 0; i--) {
    if (bossBullets[i].type === "missile") {
      continue;
    }

    if (
      player.x < bossBullets[i].x + bossBullets[i].width &&
      player.x + player.width > bossBullets[i].x &&
      player.y < bossBullets[i].y + bossBullets[i].height &&
      player.y + player.height > bossBullets[i].y
    ) {
      const bullet = bossBullets[i];
      bossBullets.splice(i, 1);
      damagePlayer(1, bullet.bossSpreadBurst ? "Р Р°СЃСЃРµСЏРЅРЅС‹Р№ РІС‹СЃС‚СЂРµР» Р‘РѕСЃСЃР°" : "РЎРЅР°СЂСЏРґ Р‘РѕСЃСЃР°");
    }
  }
}

function checkBossWebBulletPlayerCollisions() {
  for (let i = bossWebBullets.length - 1; i >= 0; i--) {
    if (
      player.x < bossWebBullets[i].x + bossWebBullets[i].width &&
      player.x + player.width > bossWebBullets[i].x &&
      player.y < bossWebBullets[i].y + bossWebBullets[i].height &&
      player.y + player.height > bossWebBullets[i].y
    ) {
      bossWebBullets.splice(i, 1);

      if (!isPlayerInvulnerable) {
        player.slowTimer = 90;
        runStats.bossWebShotsHitPlayer++;
      }

      damagePlayer(0.5, "РџР°СѓС‚РёРЅРЅС‹Р№ РІС‹СЃС‚СЂРµР» Р‘РѕСЃСЃР°");
    }
  }
}

function updatePlayerDamageCooldown() {
  if (player.damageCooldown > 0) {
    player.damageCooldown--;
  }
}

function checkEnemyHazardZonePlayerCollisions() {
  for (let i = 0; i < enemyHazardZones.length; i++) {
    const zone = enemyHazardZones[i];
    zone.damageTickTimer--;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    if (
      tankHazardFieldContainsPoint(zone, playerCenterX, playerCenterY) &&
      zone.damageTickTimer <= 0
    ) {
      if (!zone.hitPlayer) {
        zone.hitPlayer = true;
        runStats.enemyHazardZonesHitPlayer++;
      }

      damagePlayer(0.1, "РћРїР°СЃРЅР°СЏ Р·РѕРЅР° РўР°СЂР°РЅР°");
      zone.damageTickTimer = 6;
    }
  }
}

function checkBossDangerZonePlayerCollision() {
  for (let i = 0; i < bossDangerZones.length; i++) {
    const zone = bossDangerZones[i];

    if (zone.state !== "active") {
      continue;
    }

    zone.damageTickTimer--;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    if (
      playerCenterX >= zone.x &&
      playerCenterX <= zone.x + zone.width &&
      playerCenterY >= zone.y &&
      playerCenterY <= zone.y + zone.height &&
      zone.damageTickTimer <= 0
    ) {
      if (!zone.hitPlayer) {
        zone.hitPlayer = true;
        runStats.bossDangerZonesHitPlayer++;
      }

      damagePlayer(0.1, "РћРїР°СЃРЅР°СЏ Р·РѕРЅР° Р‘РѕСЃСЃР°");
      zone.damageTickTimer = 6;
    }
  }
}


function checkBossCoreLaserPlayerCollision() {
  if (!boss.active || bossCoreLaser.state !== "active") {
    return;
  }

  bossCoreLaser.damageTickTimer--;

  const laserBox = getBossCoreLaserBox();

  if (
    player.x < laserBox.x + laserBox.width &&
    player.x + player.width > laserBox.x &&
    player.y < laserBox.y + laserBox.height &&
    player.y + player.height > laserBox.y &&
    bossCoreLaser.damageTickTimer <= 0
  ) {
    if (damagePlayer(0.3, "Р›Р°Р·РµСЂ Р‘РѕСЃСЃР°")) {
      runStats.bossLaserHits++;
    }
    bossCoreLaser.damageTickTimer = 6;
  }
}

function checkBossPlayerCollision() {
  if (!boss.active || boss.introActive || bossDeathSequence.active) {
    return;
  }

  const bodyHitbox = getBossBodyHitbox();

  if (
    player.x < bodyHitbox.x + bodyHitbox.width &&
    player.x + player.width > bodyHitbox.x &&
    player.y < bodyHitbox.y + bodyHitbox.height &&
    player.y + player.height > bodyHitbox.y
  ) {
    damagePlayer(1, "РўРµР»Рѕ Р‘РѕСЃСЃР°");
  }
}

function checkBossLegPlayerCollisions() {
  if (!boss.active || boss.introActive || bossDeathSequence.active) {
    return;
  }

  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];

    if (!leg.alive) {
      continue;
    }

    if (leg.role === "lower") {
      const collisionSegments = getBossLegacyLegCollisionSegments(leg);

      for (let segmentIndex = 0; segmentIndex < collisionSegments.length; segmentIndex++) {
        const rect = collisionSegments[segmentIndex].rect;

        if (
          player.x < rect.x + rect.width &&
          player.x + player.width > rect.x &&
          player.y < rect.y + rect.height &&
          player.y + player.height > rect.y
        ) {
          damagePlayer(1, "Р›Р°РїР° Р‘РѕСЃСЃР°");
          return;
        }
      }

      continue;
    }

    const legBox = getBossLegBox(leg);

    if (
      player.x < legBox.x + legBox.width &&
      player.x + player.width > legBox.x &&
      player.y < legBox.y + legBox.height &&
      player.y + player.height > legBox.y
    ) {
      damagePlayer(1, "Р›Р°РїР° Р‘РѕСЃСЃР°");
      break;
    }
  }
}

function damagePlayer(amount = 1, reason = "РќРµРёР·РІРµСЃС‚РЅРѕ") {
  if (isPlayerInvulnerable) {
    return false;
  }

  if (player.damageCooldown > 0 && amount >= 1) {
    return false;
  }

  player.hp -= amount;
  recordHit(amount, reason);
  playHitSound();
  player.damageCooldown = amount < 1 ? 8 : 45;

  if (player.hp <= 0) {
    resultFadeTimer = 0;
    clearInputState();
    recordDeathReason(reason);
    finalizeRunResult("gameOver");
    scene = "gameOver";
  }

  return true;
}

function addHitPause(frames) {
  hitPauseTimer = Math.max(hitPauseTimer, frames);
}

function startSlowMotion(frames) {
  slowMotionTimer = Math.max(slowMotionTimer, frames);
  slowMotionFrame = 0;
}

function createImpactFlash(x, y, radius, life) {
  impactFlashes.push({
    x: x,
    y: y,
    radius: radius,
    life: life,
    maxLife: life
  });
}

function createMuzzleFlash(x, y, angle, color, size, type = "default") {
  const life = type === "player" ? 4 : 3;

  muzzleFlashes.push({
    x: x,
    y: y,
    angle: angle,
    color: color,
    size: size,
    type: type,
    life: life,
    maxLife: life
  });
}

function createHitParticles(x, y, targetType = "normal") {
  let sparkCount = 5;
  let sparkColor = "#e8ffff";
  let sparkSpeed = 3.4;
  let flashRadius = 9;
  let flashLife = 3;

  if (targetType === "tank" || targetType === "web") {
    sparkCount = 7;
    sparkColor = targetType === "web" ? "#d8ff1f" : "#ffe36a";
    sparkSpeed = 3.8;
    flashRadius = 11;
  }

  if (targetType === "bossLeg") {
    sparkCount = 8;
    sparkColor = "#d8ff1f";
    sparkSpeed = 4.2;
    flashRadius = 12;
  }

  if (targetType === "bossCore") {
    sparkCount = 7;
    sparkColor = "#9effff";
    sparkSpeed = 4.0;
    flashRadius = 11;
  }

  createImpactFlash(x, y, flashRadius, flashLife);
  createSpriteExplosion({
    variant: "cyanImpact",
    x: x - 6,
    y: y - 6,
    width: 12,
    height: 12
  });
  createDebrisPattern(x, y, "sparkSpray", {
    count: sparkCount,
    color: sparkColor,
    speed: sparkSpeed,
    life: 12,
    length: 8,
    width: 1.5
  });
  createDebrisPattern(x, y, "lightningCrackle", {
    count: 2,
    speed: 2.2,
    life: 8
  });
}

function createExplosionParticles(enemy) {
  let spriteExplosionVariant = "orangeSmall";
  let debrisPattern = "radial";
  let debrisCount = 10;
  let debrisColor = "#ffe36a";
  let debrisSpeed = 3.5;
  let secondaryDebrisPattern = Math.random() < 0.35 ? "lightningCrackle" : null;
  let secondaryDebrisColor = null;
  let flashRadius = 26;
  let flashLife = 7;
  let playSound = true;

  if (enemy.type === "normal") {
    spriteExplosionVariant = "orangeMedium";
  }

  if (enemy.type === "tank") {
    spriteExplosionVariant = "tankCrimson";
    debrisPattern = "crossBurst";
    debrisCount = 20;
    debrisColor = "#b51f18";
    debrisSpeed = 4.7;
    secondaryDebrisPattern = "crossBurst";
    secondaryDebrisColor = "#ff3a24";
    flashRadius = 48;
    flashLife = 9;
  }

  if (enemy.type === "zigzag") {
    spriteExplosionVariant = "zigzagHot";
    debrisPattern = "sparkSpray";
    debrisCount = 12;
    debrisColor = "#ff4f1f";
    debrisSpeed = 5.6;
    secondaryDebrisPattern = "splitBurst";
  }

  if (enemy.type === "web") {
    spriteExplosionVariant = "webSmoky";
    debrisPattern = "toxicBurst";
    debrisCount = 14;
    debrisColor = "#b9823a";
    debrisSpeed = 3.8;
    secondaryDebrisPattern = "lightningCrackle";
  }

  if (enemy.type === "missileExplosion") {
    spriteExplosionVariant = "redMedium";
    debrisPattern = "cone";
    debrisCount = 18;
    debrisColor = "#ffd15a";
    debrisSpeed = 5.0;
    secondaryDebrisPattern = "lightningCrackle";
    flashRadius = 34;
  }

  if (enemy.type === "bossLeg") {
    createBossChainExplosions(enemy, 5 + Math.floor(Math.random() * 3), false);
    createImpactFlash(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 48, 8);
    return;
  }

  if (enemy.type === "boss") {
    createBossDeathChainExplosions(enemy);
    createImpactFlash(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 58, 9);
    return;
  }

  const centerX = enemy.x + enemy.width / 2;
  const centerY = enemy.y + enemy.height / 2;
  createImpactFlash(centerX, centerY, flashRadius, flashLife);
  spawnExplosionNow({
    x: enemy.x,
    y: enemy.y,
    width: enemy.width,
    height: enemy.height,
    variant: spriteExplosionVariant,
    debrisPattern: debrisPattern,
    debrisCount: debrisCount,
    debrisColor: debrisColor,
    debrisSpeed: debrisSpeed,
    secondaryDebrisPattern: secondaryDebrisPattern,
    secondaryDebrisColor: secondaryDebrisColor,
    playSound: playSound,
    soundCooldown: 0
  });

  if (enemy.type === "tank" || enemy.type === "missileExplosion") {
    createTankCrimsonLightning(centerX, centerY, enemy.width, enemy.height, enemy.type === "tank" ? 5 : 3);
  }
}

function createTankCrimsonLightning(x, y, width, height, count) {
  const palette = ["#ff4b2b", "#d51e19", "#7f120f", "#ff7a36"];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const spreadX = (Math.random() - 0.5) * width * 0.45;
    const spreadY = (Math.random() - 0.5) * height * 0.45;
    createCrimsonLightningSpark(x + spreadX, y + spreadY, angle, 3.4 + Math.random() * 1.2, color);
  }
}

function createBossChainExplosions(source, count, isBodyBurst) {
  const minSize = isBodyBurst ? 32 : 28;
  const maxSize = isBodyBurst ? 58 : 46;

  for (let i = 0; i < count; i++) {
    const largeAccent = Math.random() < 0.28;
    const size = largeAccent ? 66 + Math.random() * 18 : minSize + Math.random() * (maxSize - minSize);
    const progress = count <= 1 ? 0.5 : i / (count - 1);
    const primaryX = source.x + progress * Math.max(1, source.width - size);
    const primaryY = source.y + Math.random() * Math.max(1, source.height - size);
    const x = primaryX + (Math.random() - 0.5) * Math.min(24, source.width * 0.18);
    const y = primaryY;
    let pattern = i % 3 === 0 ? "edgeRip" : "toxicBurst";

    if (i % 4 === 0) {
      pattern = "lightningCrackle";
    }

    delayedExplosions.push({
      x: x,
      y: y,
      width: size,
      height: size,
      drawWidth: size,
      drawHeight: size,
      delay: i * 5,
      variant: getBossExplosionVariant(largeAccent, i, isBodyBurst),
      debrisPattern: pattern,
      debrisCount: isBodyBurst ? 12 : 12,
      debrisColor: isBodyBurst ? "#fff0a8" : "#ff6a28",
      debrisSpeed: isBodyBurst ? 4.8 : 4.4,
      crimsonLightningCount: largeAccent && (isBodyBurst || i % 3 === 0) ? 2 : 0,
      secondaryDebrisPattern: pattern === "lightningCrackle" ? null : "lightningCrackle",
      playSound: i % 2 === 0
    });
  }
}

function getBossExplosionVariant(largeAccent, index, isBodyBurst) {
  if (largeAccent && (isBodyBurst || index % 3 === 0)) {
    return "tankCrimson";
  }

  if (largeAccent) {
    return "bossEmberMedium";
  }

  return index % 5 === 0 ? "redMedium" : "bossEmberSmall";
}

function createBossDeathChainExplosions(source) {
  const expanded = {
    x: source.x - source.width * 0.55,
    y: source.y - source.height * 0.75,
    width: source.width * 2.1,
    height: source.height * 2.35
  };
  const targets = [
    { x: source.x, y: source.y, width: source.width, height: source.height },
    { x: source.x, y: source.y, width: source.width * 0.5, height: source.height },
    { x: source.x + source.width * 0.5, y: source.y, width: source.width * 0.5, height: source.height },
    { x: source.x, y: source.y, width: source.width, height: source.height * 0.5 },
    { x: source.x, y: source.y + source.height * 0.5, width: source.width, height: source.height * 0.5 },
    expanded,
    { x: expanded.x, y: source.y - source.height * 0.35, width: expanded.width * 0.5, height: expanded.height * 0.85 },
    { x: expanded.x + expanded.width * 0.5, y: source.y - source.height * 0.35, width: expanded.width * 0.5, height: expanded.height * 0.85 },
    { x: source.x - source.width * 0.45, y: source.y + source.height * 0.15, width: source.width * 0.55, height: source.height * 1.1 },
    { x: source.x + source.width * 0.9, y: source.y + source.height * 0.15, width: source.width * 0.55, height: source.height * 1.1 }
  ];

  for (let i = 0; i < bossDeathSequence.aliveLegBoxes.length; i++) {
    targets.push(bossDeathSequence.aliveLegBoxes[i]);
  }

  const count = 30 + Math.floor(Math.random() * 13);

  for (let i = 0; i < count; i++) {
    const target = targets[i % targets.length];
    const largeAccent = Math.random() < 0.24;
    const size = largeAccent ? 70 + Math.random() * 18 : 28 + Math.random() * 30;
    const x = target.x + Math.random() * Math.max(1, target.width - size);
    const y = target.y + Math.random() * Math.max(1, target.height - size);
    let pattern = "edgeRip";

    if (i % 7 === 0) {
      pattern = "lightningCrackle";
    } else if (i % 5 === 0) {
      pattern = "splitBurst";
    } else if (i % 3 === 0) {
      pattern = "asymmetric";
    } else if (i % 4 === 0) {
      pattern = "spiralScatter";
    }

    delayedExplosions.push({
      x: x,
      y: y,
      width: size,
      height: size,
      drawWidth: size,
      drawHeight: size,
      delay: Math.floor(i * (118 / count)),
      variant: getBossExplosionVariant(largeAccent, i, true),
      debrisPattern: pattern,
      debrisCount: 14 + Math.floor(Math.random() * 9),
      debrisColor: i % 3 === 0 ? "#fff0a8" : "#ff6a28",
      debrisSpeed: 5.2,
      crimsonLightningCount: largeAccent || i % 6 === 0 ? (largeAccent ? 3 : 2) : 0,
      secondaryDebrisPattern: pattern === "lightningCrackle" ? null : "lightningCrackle",
      playSound: i % 3 === 0
    });
  }
}

function spawnExplosionNow(options) {
  if (options.playSound) {
    playExplosionSoundLimited(options.soundCooldown ?? 8);
  }

  createSpriteExplosion({
    variant: options.variant,
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    drawWidth: options.drawWidth,
    drawHeight: options.drawHeight
  });

  createDebrisPattern(
    options.x + options.width / 2,
    options.y + options.height / 2,
    options.debrisPattern || "radial",
    {
      count: options.debrisCount || 0,
      color: options.debrisColor || "#ffcf55",
      speed: options.debrisSpeed || 3,
      direction: options.direction,
      life: options.debrisLife,
      length: options.debrisLength,
      width: options.debrisWidth,
      boxWidth: options.width,
      boxHeight: options.height
    }
  );

  if (options.secondaryDebrisPattern) {
    createDebrisPattern(
      options.x + options.width / 2,
      options.y + options.height / 2,
      options.secondaryDebrisPattern,
      {
        count: Math.max(2, Math.floor((options.debrisCount || 0) * 0.45)),
        color: options.secondaryDebrisColor || "#55f6ff",
        speed: (options.debrisSpeed || 3) * 0.9,
        direction: options.direction,
        boxWidth: options.width,
        boxHeight: options.height
      }
    );
  }

  createParticleMix(
    options.x + options.width / 2,
    options.y + options.height / 2,
    options.particleMix || getParticleMixForPattern(options.debrisPattern),
    {
      color: options.debrisColor || "#ffcf55",
      speed: options.debrisSpeed || 3,
      direction: options.direction,
      boxWidth: options.width,
      boxHeight: options.height
    }
  );

  if (options.crimsonLightningCount) {
    createTankCrimsonLightning(
      options.x + options.width / 2,
      options.y + options.height / 2,
      options.width,
      options.height,
      options.crimsonLightningCount
    );
  }
}

function getParticleMixForPattern(pattern) {
  if (pattern === "cone") {
    return "missileBurst";
  }

  if (pattern === "crossBurst") {
    return "tankBurst";
  }

  if (pattern === "splitBurst" || pattern === "sparkSpray") {
    return "zigzagBurst";
  }

  if (pattern === "toxicBurst") {
    return "webToxicBurst";
  }

  if (pattern === "edgeRip") {
    return "bossChainBurst";
  }

  if (pattern === "lightningCrackle") {
    return "electricBurst";
  }

  return "normalBurst";
}

function queueParticleBurst(x, y, pattern, delay, options = {}) {
  delayedParticleBursts.push({
    x: x,
    y: y,
    pattern: pattern,
    delay: delay,
    options: options
  });
}

function createParticleMix(x, y, mix, options = {}) {
  const color = options.color || "#ffcf55";
  const speed = options.speed || 3;

  if (mix === "normalBurst") {
    queueParticleBurst(x, y, "lightningCrackle", 3, { count: 2, speed: speed * 0.8 });
    queueParticleBurst(x, y, "microFlash", 0, { count: 2, color: "#fff7b5" });
    return;
  }

  if (mix === "tankBurst") {
    queueParticleBurst(x, y, "longStreak", 2, { count: 5, color: color, speed: speed * 1.1 });
    queueParticleBurst(x, y, "shardSpray", 4, { count: 4, color: "#7a120f", speed: speed * 0.9 });
    queueParticleBurst(x, y, "microFlash", 5, { count: 3, color: "#ff3a24" });
    queueParticleBurst(x, y, "lightningCrackle", 6, { count: 2, speed: speed * 0.75 });
    return;
  }

  if (mix === "missileBurst") {
    queueParticleBurst(x, y, "longStreak", 1, { count: 4, color: color, speed: speed * 1.2, direction: options.direction });
    queueParticleBurst(x, y, "lightningCrackle", 5, { count: 2, speed: speed });
    return;
  }

  if (mix === "zigzagBurst") {
    queueParticleBurst(x, y, "splitBurst", 2, { count: 5, color: "#ff7a2f", speed: speed });
    queueParticleBurst(x, y, "lightningCrackle", 4, { count: 2, speed: speed * 0.9 });
    return;
  }

  if (mix === "webToxicBurst") {
    queueParticleBurst(x, y, "toxicBurst", 2, { count: 5, color: "#d6a044", speed: speed });
    queueParticleBurst(x, y, "lightningCrackle", 4, { count: 3, speed: speed });
    queueParticleBurst(x, y, "microFlash", 6, { count: 2, color: "#fff0a8" });
    return;
  }

  if (mix === "bossChainBurst") {
    queueParticleBurst(x, y, "edgeRip", 2, { count: 6, color: "#ff6a28", speed: speed, boxWidth: options.boxWidth, boxHeight: options.boxHeight });
    queueParticleBurst(x, y, "lightningCrackle", 4, { count: 3, speed: speed * 1.05 });
    queueParticleBurst(x, y, "shardSpray", 7, { count: 3, color: "#fff0a8", speed: speed * 0.8 });
    return;
  }

  if (mix === "electricBurst") {
    queueParticleBurst(x, y, "lightningCrackle", 2, { count: 4, speed: speed * 1.05 });
    queueParticleBurst(x, y, "microFlash", 5, { count: 2, color: "#e8ffff" });
  }
}

function createDebrisPattern(x, y, pattern, options = {}) {
  const count = options.count || 0;
  const baseSpeed = options.speed || 3;
  const color = options.color || "#ffcf55";
  const baseDirection = options.direction ?? Math.random() * Math.PI * 2;
  const lifeOverride = options.life;
  const lengthOverride = options.length;
  const widthOverride = options.width;
  const debrisLengthScale = options.debrisLengthScale || 1.45;
  const debrisWidthScale = options.debrisWidthScale || 1.35;
  const edgeWidth = options.boxWidth || 24;
  const edgeHeight = options.boxHeight || 24;

  for (let i = 0; i < count; i++) {
    let particleX = x + (Math.random() - 0.5) * 6;
    let particleY = y + (Math.random() - 0.5) * 6;
    let angle = Math.random() * Math.PI * 2;
    let speed = baseSpeed * (0.8 + Math.random() * 0.9);
    let life = 14 + Math.floor(Math.random() * 8);
    let length = 7 + Math.random() * 6;
    let width = 1.5;
    let chunkScale = 1;

    if (pattern === "cone") {
      angle = baseDirection + (Math.random() - 0.5) * 1.1;
      speed = baseSpeed * (0.8 + Math.random() * 0.7);
      life = 13 + Math.floor(Math.random() * 8);
      length = 8 + Math.random() * 7;
      width = 1.8;
    }

    if (pattern === "asymmetric") {
      angle = baseDirection + (Math.random() - 0.2) * 1.8;
      speed = baseSpeed * (0.7 + Math.random() * 1.1);
      life = 14 + Math.floor(Math.random() * 9);
      length = 7 + Math.random() * 7;
    }

    if (pattern === "sparkSpray") {
      angle = Math.random() * Math.PI * 2;
      speed = baseSpeed * (1.0 + Math.random() * 1.0);
      life = 10 + Math.floor(Math.random() * 8);
      length = 7 + Math.random() * 8;
      width = 1.4;
    }

    if (pattern === "toxicBurst") {
      angle = baseDirection + (Math.random() - 0.5) * Math.PI * 1.4;
      speed = baseSpeed * (0.9 + Math.random() * 1.0);
      life = 13 + Math.floor(Math.random() * 9);
      length = 8 + Math.random() * 8;
      width = 1.8;
    }

    if (pattern === "crossBurst") {
      const rays = 4 + Math.floor(Math.random() * 3);
      angle = baseDirection + (Math.PI * 2 / rays) * (i % rays) + (Math.random() - 0.5) * 0.18;
      speed = baseSpeed * (0.9 + Math.random() * 0.9);
      life = 14 + Math.floor(Math.random() * 9);
      length = 9 + Math.random() * 8;
      width = 1.8;
    }

    if (pattern === "spiralScatter") {
      angle = baseDirection + i * 0.55 + Math.random() * 0.5;
      speed = baseSpeed * (0.75 + Math.random() * 0.9);
      life = 15 + Math.floor(Math.random() * 9);
      length = 7 + Math.random() * 8;
    }

    if (pattern === "splitBurst") {
      const side = i % 2 === 0 ? 0 : Math.PI;
      angle = baseDirection + side + (Math.random() - 0.5) * 0.75;
      speed = baseSpeed * (0.95 + Math.random() * 0.9);
      life = 13 + Math.floor(Math.random() * 8);
      length = 8 + Math.random() * 8;
      width = 1.6;
    }

    if (pattern === "edgeRip") {
      const side = i % 4;
      const edgeX = side === 0 ? -edgeWidth / 2 : side === 1 ? edgeWidth / 2 : (Math.random() - 0.5) * edgeWidth;
      const edgeY = side === 2 ? -edgeHeight / 2 : side === 3 ? edgeHeight / 2 : (Math.random() - 0.5) * edgeHeight;

      particleX += edgeX * 0.45;
      particleY += edgeY * 0.45;
      angle = Math.atan2(edgeY || (Math.random() - 0.5), edgeX || (Math.random() - 0.5)) + (Math.random() - 0.5) * 0.7;
      speed = baseSpeed * (0.9 + Math.random() * 0.8);
      life = 13 + Math.floor(Math.random() * 9);
      length = 8 + Math.random() * 8;
      width = 1.7;
    }

    if (pattern === "lightningCrackle") {
      if (i % 2 === 0) {
        createLightningSpark(particleX, particleY, baseDirection + (Math.random() - 0.5) * Math.PI * 2, baseSpeed);
        continue;
      }

      angle = Math.random() * Math.PI * 2;
      speed = baseSpeed * (0.8 + Math.random() * 0.9);
      life = 10 + Math.floor(Math.random() * 7);
      length = 7 + Math.random() * 7;
      width = 1.4;
    }

    if (pattern === "longStreak") {
      angle = baseDirection + (Math.random() - 0.5) * Math.PI * 1.3;
      speed = baseSpeed * (1.2 + Math.random() * 0.9);
      life = 11 + Math.floor(Math.random() * 8);
      length = 12 + Math.random() * 10;
      width = 1.6;
    }

    if (pattern === "shardSpray") {
      angle = Math.random() * Math.PI * 2;
      speed = baseSpeed * (0.7 + Math.random() * 0.8);
      life = 12 + Math.floor(Math.random() * 10);
      chunkScale = Math.random() < 0.22 ? 1.75 : 1.1 + Math.random() * 0.55;

      particles.push({
        type: "shard",
        x: particleX,
        y: particleY,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        life: lifeOverride || life,
        maxLife: lifeOverride || life,
        size: (4.5 + Math.random() * 4.5) * chunkScale,
        angle: angle,
        spin: (Math.random() - 0.5) * 0.28,
        color: color
      });
      continue;
    }

    if (pattern === "microFlash") {
      particles.push({
        type: "microFlash",
        x: particleX,
        y: particleY,
        life: lifeOverride || 4,
        maxLife: lifeOverride || 4,
        size: 2 + Math.random() * 2,
        color: color || "#ffffff"
      });
      continue;
    }

    if (pattern !== "lightningCrackle") {
      const chunkRoll = Math.random();

      if (chunkRoll > 0.86) {
        chunkScale = 1.75 + Math.random() * 0.35;
      } else if (chunkRoll > 0.58) {
        chunkScale = 1.28 + Math.random() * 0.25;
      } else {
        chunkScale = 0.9 + Math.random() * 0.25;
      }
    }

    const visualLengthScale = pattern === "lightningCrackle" ? 1 : debrisLengthScale * chunkScale;
    const visualWidthScale = pattern === "lightningCrackle" ? 1 : debrisWidthScale * Math.sqrt(chunkScale);

    particles.push({
      type: "spark",
      x: particleX,
      y: particleY,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      life: lifeOverride || life,
      maxLife: lifeOverride || life,
      length: lengthOverride || length * visualLengthScale,
      width: widthOverride || width * visualWidthScale,
      color: color
    });
  }
}

function createLightningSpark(x, y, angle, speed) {
  const length = 18 + Math.random() * 18;
  const segments = 2 + Math.floor(Math.random() * 4);
  const points = [{ x: 0, y: 0 }];
  let traveled = 0;

  for (let i = 1; i <= segments; i++) {
    traveled += length / segments;
    const jitter = (Math.random() - 0.5) * 12;
    points.push({
      x: Math.cos(angle) * traveled + Math.cos(angle + Math.PI / 2) * jitter,
      y: Math.sin(angle) * traveled + Math.sin(angle + Math.PI / 2) * jitter
    });
  }

  const life = 7 + Math.floor(Math.random() * 7);

  particles.push({
    type: "lightningSpark",
    x: x + (Math.random() - 0.5) * 8,
    y: y + (Math.random() - 0.5) * 8,
    speedX: Math.cos(angle) * speed * 0.55,
    speedY: Math.sin(angle) * speed * 0.55,
    life: life,
    maxLife: life,
    width: 2.1,
    color: "#55f6ff",
    points: points
  });
}

function createCrimsonLightningSpark(x, y, angle, speed, color) {
  const length = 14 + Math.random() * 16;
  const segments = 3 + Math.floor(Math.random() * 3);
  const points = [{ x: 0, y: 0 }];
  let traveled = 0;

  for (let i = 1; i <= segments; i++) {
    traveled += length / segments;
    const jitter = (Math.random() - 0.5) * 10;
    points.push({
      x: Math.cos(angle) * traveled + Math.cos(angle + Math.PI / 2) * jitter,
      y: Math.sin(angle) * traveled + Math.sin(angle + Math.PI / 2) * jitter
    });
  }

  const life = 5 + Math.floor(Math.random() * 5);

  particles.push({
    type: "lightningSpark",
    x: x + (Math.random() - 0.5) * 10,
    y: y + (Math.random() - 0.5) * 10,
    speedX: Math.cos(angle) * speed * 0.42,
    speedY: Math.sin(angle) * speed * 0.42,
    life: life,
    maxLife: life,
    width: 1.9 + Math.random() * 0.6,
    color: color,
    points: points
  });
}

function moveDelayedExplosions() {
  if (explosionSoundCooldown > 0) {
    explosionSoundCooldown--;
  }

  for (let i = delayedExplosions.length - 1; i >= 0; i--) {
    delayedExplosions[i].delay--;

    if (delayedExplosions[i].delay <= 0) {
      if (delayedExplosions[i].kind === "tankHazardZone") {
        runStats.enemyHazardZonesSpawned++;
        enemyHazardZones.push({
          x: delayedExplosions[i].x,
          y: delayedExplosions[i].y,
          width: delayedExplosions[i].width,
          height: delayedExplosions[i].height,
          centerX: delayedExplosions[i].centerX,
          centerY: delayedExplosions[i].centerY,
          radius: delayedExplosions[i].radius,
          animationTimer: 0,
          timer: delayedExplosions[i].timer,
          damageTickTimer: 0,
          hitPlayer: false
        });
      } else if (delayedExplosions[i].kind === "bossHazardZone") {
        spawnBossDangerZone(delayedExplosions[i].zoneRect);
      } else {
        spawnExplosionNow(delayedExplosions[i]);
      }
      delayedExplosions.splice(i, 1);
    }
  }
}

function updatePlayerWebOverlay() {
  if (!playerWebOverlay.active) {
    return;
  }

  playerWebOverlay.timer = player.slowTimer;

  if (player.slowTimer <= 0) {
    playerWebOverlay.active = false;
  }
}

function attachWebOverlayToPlayer(webBullet) {
  playerWebOverlay.active = true;
  playerWebOverlay.duration = player.slowTimer;
  playerWebOverlay.timer = player.slowTimer;
  playerWebOverlay.offsetX = 0;
  playerWebOverlay.offsetY = 6;
  playerWebOverlay.rotation = Math.atan2(webBullet.speedY || 0, webBullet.speedX || 0) + Math.PI / 2;
  playerWebOverlay.scale = Math.min(Math.max((webBullet.drawScale || 1) * 1.15, 2.1), 3.2);
  playerWebOverlay.bossWebAttack = !!webBullet.bossWebAttack;
  playerWebOverlay.sparkSeed = webBullet.bossWebSparkSeed || 0;
}

function moveDelayedParticleBursts() {
  for (let i = delayedParticleBursts.length - 1; i >= 0; i--) {
    delayedParticleBursts[i].delay--;

    if (delayedParticleBursts[i].delay <= 0) {
      const burst = delayedParticleBursts[i];
      createDebrisPattern(burst.x, burst.y, burst.pattern, burst.options);
      delayedParticleBursts.splice(i, 1);
    }
  }
}

function moveMuzzleFlashes() {
  for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
    muzzleFlashes[i].life--;

    if (muzzleFlashes[i].life <= 0) {
      muzzleFlashes.splice(i, 1);
    }
  }
}

function createSpriteExplosion(options) {
  const variant = options.variant || options.type || "orangeSmall";
  const config = sprites.explosions[variant] || sprites.explosions.orangeSmall;

  if (!config || !config.image.loaded) {
    return;
  }

  const drawWidth = options.drawWidth || config.drawWidth;
  const drawHeight = options.drawHeight || config.drawHeight;
  const centerX = options.x + options.width / 2;
  const centerY = options.y + options.height / 2;

  spriteExplosions.push({
    x: centerX - drawWidth / 2,
    y: centerY - drawHeight / 2,
    frame: 0,
    timer: 0,
    frameCount: config.frameCount,
    frameDuration: config.frameDuration,
    drawWidth: drawWidth,
    drawHeight: drawHeight,
    sx: config.sx || 0,
    sy: config.sy || 0,
    rotation: (Math.random() - 0.5) * 0.24,
    scaleX: 0.98 + Math.random() * 0.08,
    scaleY: 0.98 + Math.random() * 0.08,
    sourceInset: config.sourceInset ?? 0,
    jitterX: (Math.random() - 0.5) * 4,
    jitterY: (Math.random() - 0.5) * 4,
    config: config
  });
}

function moveImpactFlashes() {
  for (let i = impactFlashes.length - 1; i >= 0; i--) {
    impactFlashes[i].life--;

    if (impactFlashes[i].life <= 0) {
      impactFlashes.splice(i, 1);
    }
  }
}

function moveSpriteExplosions() {
  for (let i = spriteExplosions.length - 1; i >= 0; i--) {
    const explosion = spriteExplosions[i];

    explosion.timer++;

    if (explosion.timer >= explosion.frameDuration) {
      explosion.timer = 0;
      explosion.frame++;
    }

    if (explosion.frame >= explosion.frameCount) {
      spriteExplosions.splice(i, 1);
    }
  }
}

function moveParticles() {
  const particleCullMargin = 240;

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    if (isPointOutsideViewport(particle.x, particle.y, particleCullMargin)) {
      particles.splice(i, 1);
      continue;
    }

    if (particle.type === "bossSmoke") {
      const lifeProgress = 1 - Math.max(0, Math.min(1, particle.life / particle.maxLife));
      particle.vx += (Math.random() - 0.5) * particle.turbulence * (0.65 + lifeProgress * 0.35);
      particle.vy += (Math.random() - 0.5) * particle.turbulence * 0.5 - (particle.lift || 0.015);
      particle.vx *= particle.drag || 0.97;
      particle.vy *= (particle.drag || 0.97) + 0.004;
      particle.scale = Math.min(2.1, particle.scale + 0.006 + lifeProgress * 0.007);
      particle.x += particle.vx;
      particle.y += particle.vy;
    } else if (particle.type === "bossEmber") {
      particle.speedY += particle.gravity || 0.08;
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.speedX *= 0.992;
    } else {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      if (particle.gravity) {
        particle.speedY += particle.gravity;
      }
    }
    particle.life--;

    if (particle.life <= 0 || isPointOutsideViewport(particle.x, particle.y, particleCullMargin)) {
      particles.splice(i, 1);
    }
  }
}

function resetBossDeathSequence() {
  bossDeathSequence.active = false;
  bossDeathSequence.timer = 0;
  bossDeathSequence.bodyGone = false;
  bossDeathSequence.explosionTimer = 0;
  bossDeathSequence.screenShakeTimer = 0;
  bossDeathSequence.screenFlashTimer = 0;
  bossDeathSequence.aliveLegBoxes = [];
}

function restartGame() {
  clearInputState();
  resetRunStats();
  finalRunResult = null;
  playerWebOverlay.active = false;
  playerWebOverlay.timer = 0;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 80;
  player.hp = 5;
  player.slowTimer = 0;
  player.damageCooldown = 0;

  bullets.length = 0;
  enemies.length = 0;
  enemyBullets.length = 0;
  enemyHazardZones.length = 0;
  webBullets.length = 0;
  bossBullets.length = 0;
  stopBossMissileFlightLoop(true);
  stopBossCoreLaserLoop(true);
  bossWebBullets.length = 0;
  bossDangerZones.length = 0;
  particles.length = 0;
  impactFlashes.length = 0;
  spriteExplosions.length = 0;
  delayedExplosions.length = 0;
  delayedParticleBursts.length = 0;
  muzzleFlashes.length = 0;
  bossAttackTelegraphs.length = 0;
  playerSpeedStreaks.length = 0;
  worldAtmosphereParticles.length = 0;
  ambientClouds.length = 0;
  ambientWindStreaks.length = 0;
  ambientCloudScriptIndex = 0;
  ambientWindSpawnBudget = 0;
  playerSpeedEffectIntensity = 0;
  playerSpeedEffectSpawnBudget = 0;
  playerSpeedEffectSpawnPhase = 0;
  playerSpeedSmoothedDirection = { x: 0, y: -1 };
  for (let i = 0; i < villageAtmosphereSources.length; i++) {
    villageAtmosphereSources[i].smokeBudget = 0;
    villageAtmosphereSources[i].sparkBudget = 0;
  }
  explosionSoundCooldown = 0;
  hitPauseTimer = 0;
  resetBossDeathSequence();
  enemySpawnTimer = 0;
  shootCooldown = 0;
  score = 0;
  missionTimer = 0;
  gameUpdateAccumulator = 0;
  isPaused = false;
  isPlayerInvulnerable = false;
  resultFadeTimer = 0;
  gameStartFadeTimer = gameStartFadeDuration;
  boss.active = false;
  boss.introActive = false;
  boss.introTimer = 0;
  boss.introShakeTimer = 0;
  boss.hp = boss.maxHp;
  boss.hitFlash = 0;
  boss.direction = 1;
  boss.directionChangeTimer = 180;
  boss.speed = boss.baseSpeed;
  boss.shootDelay = boss.baseShootDelay;
  boss.webShootDelay = boss.baseWebShootDelay;
  boss.dangerZoneDelay = boss.baseDangerZoneDelay;
  bossCoreLaser.cooldownMax = bossCoreLaser.baseCooldownMax;
  boss.shootTimer = 90;
  boss.webShootTimer = boss.webShootDelay;
  boss.dangerZoneTimer = boss.dangerZoneDelay;
  boss.rageFlashTimer = 0;
  boss.majorAttackLockTimer = 0;
  boss.lastDestroyedLegCount = 0;
  boss.destroyedPairBurstFlags = { upper: false, middle: false, lower: false };
  boss.nextAttackSide = { lower: -1, middle: 1, upper: -1 };
  resetBossCoreLaser();
  bossAnimationTimer = 0;
  resetBossLegs();
  applyBossRageAttackDelays();

  scene = "game";
}

    // =========================
    // DRAW
    // =========================

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (scene === "game") {
    drawGame();
    return;
  }

  drawStars();
}

    function drawButton(x, y, width, height, text, selected = false, fontFamily = "Orbitron") {
      const pulse = selected ? (Math.sin(Date.now() * 0.012) + 1) * 0.5 : 0;
      const cut = 8;
      const fillTop = selected ? "#263442" : "#171d28";
      const fillBottom = selected ? "#101722" : "#0e131b";
      const strokeColor = selected ? "#7ce7ff" : "#8fb4c7";

      ctx.beginPath();
      ctx.moveTo(x + cut, y);
      ctx.lineTo(x + width - cut, y);
      ctx.lineTo(x + width, y + cut);
      ctx.lineTo(x + width, y + height - cut);
      ctx.lineTo(x + width - cut, y + height);
      ctx.lineTo(x + cut, y + height);
      ctx.lineTo(x, y + height - cut);
      ctx.lineTo(x, y + cut);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, y, 0, y + height);
      gradient.addColorStop(0, fillTop);
      gradient.addColorStop(1, fillBottom);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = selected ? 2.5 : 1.5;
      ctx.stroke();

      if (selected) {
        ctx.strokeStyle = "rgba(124, 231, 255, " + (0.16 + pulse * 0.12) + ")";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      ctx.fillStyle = selected ? "#f6fbff" : "#d7e8f3";
      ctx.textAlign = "left";
      ctx.font = '700 18px "' + fontFamily + '"';

      ctx.fillText(text, x + 20, y + 31);

      if (selected) {
        ctx.fillStyle = "#8cff4d";
        ctx.fillText(">", x + width - 20, y + 31);
      }
    }
function drawStars() {
  if (scene === "game") {
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (menuBackgroundImage.loaded) {
      const imageWidth = menuBackgroundImage.naturalWidth || menuBackgroundImage.width || canvas.width;
      const imageHeight = menuBackgroundImage.naturalHeight || menuBackgroundImage.height || canvas.height;
      const scale = Math.max(canvas.width / imageWidth, canvas.height / imageHeight);
      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;
      const drawX = 0;
      const drawY = 0;
      ctx.drawImage(menuBackgroundImage, drawX, drawY, drawWidth, drawHeight);
    }

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const x = Math.round(star.x);
      const y = Math.round(star.y);

      ctx.globalAlpha = star.size === 1 ? 0.82 : 1;
      ctx.fillStyle = star.tint;
      ctx.fillRect(x, y, star.size, star.size);
    }
  }

  ctx.globalAlpha = 1;
}

function drawVillageScrollBackground() {
  const placement = getVillageBackgroundPlacement();

  if (!placement) {
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  ctx.fillStyle = "#050510";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(villageLevelBackground, placement.x, placement.y, placement.drawWidth, placement.drawHeight);
  ctx.drawImage(villageLevelBackground, placement.x, placement.y + placement.drawHeight, placement.drawWidth, placement.drawHeight);
}

function drawStageForegroundFrame(width, height, leftEdge, rightEdge, shift) {
  const frameColor = "#18243a";
  const frameLite = "rgba(131, 233, 255, 0.18)";
  const frameWarm = "rgba(255, 208, 128, 0.12)";
  const stripeStep = 34;
  const topBandY = -36 + shift * 1.1;
  const bottomBandY = height - 18 + shift * 1.5;
  const wrapLimit = height + 72;

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = frameColor;

  // a single fast foreground ship-like module sweeps downward past the camera.
  const sweepCycleDuration = 4.8;
  const sweepProgress = (missionTimer / 60 % sweepCycleDuration) / sweepCycleDuration;
  const sweepCenter = -120 + sweepProgress * (height + 220);
  const sweepWidth = Math.max(260, Math.floor(width * 0.3));
  const sweepLeft = -32;
  const sweepRight = sweepLeft + sweepWidth;

  ctx.beginPath();
  ctx.moveTo(sweepLeft + 12, sweepCenter - 48);
  ctx.lineTo(sweepRight - 92, sweepCenter - 34);
  ctx.lineTo(sweepRight - 26, sweepCenter - 8);
  ctx.lineTo(sweepRight, sweepCenter + 34);
  ctx.lineTo(sweepLeft + 74, sweepCenter + 44);
  ctx.lineTo(sweepLeft, sweepCenter + 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#25364f";
  ctx.beginPath();
  ctx.moveTo(sweepLeft + 36, sweepCenter - 24);
  ctx.lineTo(sweepRight - 126, sweepCenter - 16);
  ctx.lineTo(sweepRight - 64, sweepCenter + 10);
  ctx.lineTo(sweepLeft + 86, sweepCenter + 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0b101d";
  ctx.beginPath();
  ctx.moveTo(sweepLeft + 112, sweepCenter - 10);
  ctx.lineTo(sweepLeft + 154, sweepCenter + 0);
  ctx.lineTo(sweepLeft + 116, sweepCenter + 28);
  ctx.lineTo(sweepLeft + 80, sweepCenter + 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(131, 233, 255, 0.18)";
  ctx.fillRect(sweepLeft + 98, sweepCenter - 6, 22, 8);
  ctx.fillRect(sweepLeft + 128, sweepCenter + 4, 18, 6);
  ctx.fillStyle = "rgba(255, 208, 128, 0.15)";
  ctx.fillRect(sweepLeft + 162, sweepCenter + 10, 20, 6);

  // short fly-by slats at the edges only, never in the center.
  const slatStep = 46;
  for (let y = -((missionTimer / 60) * 84) % slatStep; y < wrapLimit; y += slatStep) {
    const yLeft = y;
    const yRight = y + 10;

    if (yLeft > height * 0.32 && yLeft < height * 0.72) {
      continue;
    }

    ctx.fillRect(0, yLeft, 14, 16);
    ctx.fillRect(width - 14, yRight, 14, 16);
  }

  ctx.fillStyle = frameLite;
  ctx.fillRect(0, 14, width, 2);
  ctx.fillRect(0, height - 28, width, 2);
  ctx.fillStyle = frameWarm;
  ctx.fillRect(18, 18, 46, 3);
  ctx.fillRect(width - 64, 26, 46, 3);
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = "#ffff66";

  for (let i = 0; i < bullets.length; i++) {
    if (bullets[i].destroyed) {
      continue;
    }

    if (drawProjectileSprite(bullets[i], sprites.projectiles.player)) {
      continue;
    }

    ctx.fillRect(
      bullets[i].x,
      bullets[i].y,
      bullets[i].width,
      bullets[i].height
    );
  }
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const spriteConfig = sprites.enemies[enemy.type] || sprites.enemies.normal;
    const exhaustConfig = sprites.exhaust[enemy.type] || sprites.exhaust.normal;

    if (spriteConfig && spriteConfig.image.loaded) {
      drawEnemyExhaust(enemy, exhaustConfig);

      if (enemy.type === "zigzag") {
        drawZigzagEnemyGlow(enemy, spriteConfig);
      }

      drawSpriteCentered(enemy, spriteConfig);

      if (enemy.hitFlash > 0) {
        drawSpriteFlash(enemy, spriteConfig, 0.68);
      }

      drawDevHitbox(enemy, "#ff4444");
      continue;
    }

    if (enemies[i].hitFlash > 0) {
      ctx.fillStyle = "#ffffff";
    } else if (enemies[i].type === "tank") {
      ctx.fillStyle = "#aa3333";
    } else if (enemies[i].type === "zigzag") {
      ctx.fillStyle = "#ff66ff";
    } else if (enemies[i].type === "web") {
      ctx.fillStyle = "#dddddd";
    } else {
      ctx.fillStyle = "red";
    }

    ctx.fillRect(
      enemies[i].x,
      enemies[i].y,
      enemies[i].width,
      enemies[i].height
    );

    drawDevHitbox(enemies[i], "#ff4444");
  }
}

function drawPlayerSprite() {
  const spriteConfig = sprites.player;

  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const rect = getCenteredDrawRect(player, spriteConfig);
  const scaleX = 1 - playerVisualPitch * 0.7;
  const scaleY = 1 + playerVisualPitch;

  ctx.save();
  ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2 + playerJetPivotOffsetY);
  ctx.rotate(playerVisualTilt);
  ctx.translate(0, playerVisualPitch * playerVerticalBankOffset);
  ctx.scale(scaleX, scaleY);
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < playerJetEnginePoints.length; i++) {
    const enginePoint = playerJetEnginePoints[i];
    const localX = -rect.width / 2 + (enginePoint.x / spriteConfig.sw) * rect.width;
    const localY = -rect.height / 2 + (enginePoint.y / spriteConfig.sh) * rect.height;
    const turnStrength = Math.min(1, Math.abs(playerExhaustTilt) / playerJetRollClamp);
    const brighterSide = (playerExhaustTilt > 0 && i === 0) || (playerExhaustTilt < 0 && i === 1);
    const outerScale = brighterSide ? 3.88 + turnStrength * 0.18 : 3.88 - turnStrength * 0.05;
    const innerScale = brighterSide ? 3.14 + turnStrength * 0.14 : 3.14 - turnStrength * 0.04;
    const outerAlpha = brighterSide ? 0.68 + turnStrength * 0.1 : 0.58 - turnStrength * 0.03;
    const innerAlpha = brighterSide ? 1 + turnStrength * 0.02 : 0.96 - turnStrength * 0.02;
    const sideYOffset = brighterSide ? -6.2 - turnStrength * 0.9 : -6.2 + turnStrength * 0.35;

    drawExhaustSprite(sprites.exhaust.player, localX, localY, {
      scale: outerScale,
      alpha: outerAlpha,
      offsetY: sideYOffset
    });
    drawExhaustSprite(sprites.exhaust.player, localX, localY, {
      scale: innerScale,
      alpha: innerAlpha,
      offsetY: sideYOffset - 1
    });
  }

  ctx.drawImage(
    spriteConfig.image,
    spriteConfig.sx,
    spriteConfig.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    -rect.width / 2,
    -rect.height / 2,
    rect.width,
    rect.height
  );

  if (!isPlayerInvulnerable && player.damageCooldown > 39) {
    const flashFrames = player.damageCooldown - 39;
    const flashAlpha = flashFrames >= 5
      ? 1
      : flashFrames >= 3
        ? 0.78
        : 0.48;

    ctx.save();
    ctx.globalAlpha = flashAlpha;
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "brightness(4.2) saturate(0) contrast(1.2)";
    ctx.drawImage(
      spriteConfig.image,
      spriteConfig.sx,
      spriteConfig.sy,
      spriteConfig.sw,
      spriteConfig.sh,
      -rect.width / 2,
      -rect.height / 2,
      rect.width,
      rect.height
    );
    ctx.restore();
  }

  if (isGameplayDebugOverlayActive()) {
    ctx.save();
    ctx.strokeStyle = "#ffd36a";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(-rect.width / 2 + 0.5, -rect.height / 2 + 0.5, rect.width - 1, rect.height - 1);
    ctx.restore();
  }

  ctx.restore();

  return true;
}

function drawPlayerWebOverlay() {
  if (!playerWebOverlay.active || !spriteSheets.webBullet.loaded) {
    return;
  }

  const fadeStart = playerWebOverlay.fadeFrames;
  const alpha = playerWebOverlay.timer > fadeStart
    ? 0.96
    : 0.96 * (playerWebOverlay.timer / fadeStart);
  const drawSize = 26 + playerWebOverlay.scale * 18;
  const playerVisualCenter = getPlayerVisualPoint(0, 8);
  const centerX = playerVisualCenter.x + playerWebOverlay.offsetX;
  const centerY = playerVisualCenter.y + playerWebOverlay.offsetY;
  const bossWebAttack = !!playerWebOverlay.bossWebAttack;
  const sparkSeed = playerWebOverlay.sparkSeed || 0;
  const sparkActive = bossWebAttack && ((playerWebOverlay.timer + sparkSeed) % 23) <= 1;
  const layers = [
    { offsetX: 0, offsetY: 0, scale: 1.08, alpha: alpha },
    { offsetX: -5, offsetY: -2, scale: 0.88, alpha: alpha * 0.7 },
    { offsetX: 6, offsetY: 4, scale: 0.76, alpha: alpha * 0.54 },
    { offsetX: 0, offsetY: 7, scale: 0.58, alpha: alpha * 0.36 }
  ];

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const layerSize = drawSize * layer.scale;

    ctx.save();
    ctx.translate(centerX + layer.offsetX, centerY + layer.offsetY);
    ctx.rotate(playerWebOverlay.rotation);
    ctx.globalAlpha = layer.alpha;
    ctx.globalCompositeOperation = i === 0 ? "lighter" : "source-over";
    ctx.shadowColor = "rgba(210, 242, 255, 0.9)";
    ctx.shadowBlur = i === 0 ? 8 : 4;
    ctx.drawImage(
      spriteSheets.webBullet,
      0,
      0,
      1254,
      1254,
      -layerSize / 2,
      -layerSize / 2,
      layerSize,
      layerSize
    );
    ctx.restore();
  }

  if (bossWebAttack) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(playerWebOverlay.rotation);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * 0.12;
    ctx.shadowColor = "rgba(92, 255, 100, 0.18)";
    ctx.shadowBlur = 2;
    ctx.filter = "sepia(1) saturate(6) hue-rotate(62deg) brightness(1.08) contrast(1.18)";
    ctx.drawImage(
      spriteSheets.webBullet,
      0,
      0,
      1254,
      1254,
      -drawSize * 0.5,
      -drawSize * 0.5,
      drawSize,
      drawSize
    );
    ctx.restore();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(playerWebOverlay.rotation);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * 0.76;
    ctx.shadowColor = "rgba(84, 255, 44, 0.4)";
    ctx.shadowBlur = 1;
    ctx.strokeStyle = "rgba(150, 255, 82, 0.98)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-drawSize * 0.24, -drawSize * 0.02);
    ctx.lineTo(drawSize * 0.2, drawSize * 0.12);
    ctx.moveTo(-drawSize * 0.04, -drawSize * 0.22);
    ctx.lineTo(drawSize * 0.08, drawSize * 0.22);
    ctx.moveTo(-drawSize * 0.2, drawSize * 0.16);
    ctx.lineTo(drawSize * 0.16, -drawSize * 0.12);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.58;
    ctx.fillStyle = "rgba(108, 255, 64, 0.98)";
    ctx.fillRect(-drawSize * 0.16, -drawSize * 0.02, 2, 2);
    ctx.fillRect(drawSize * 0.08, drawSize * 0.06, 2, 2);
    ctx.fillRect(-drawSize * 0.03, -drawSize * 0.15, 2, 2);

    if (sparkActive) {
      ctx.globalAlpha = alpha * 0.96;
      ctx.fillStyle = "rgba(198, 255, 120, 1)";
      ctx.fillRect(-2, -2, 4, 4);
      ctx.fillRect(Math.round(drawSize * 0.12), Math.round(drawSize * 0.04), 3, 3);
      ctx.fillRect(Math.round(-drawSize * 0.1), Math.round(-drawSize * 0.08), 3, 3);
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawPlayerGodmodeShield() {
  if (!isPlayerInvulnerable) {
    return false;
  }

  const shieldConfig = sprites.godmodeShield;
  const playerSpriteConfig = sprites.player;

  if (!shieldConfig || !shieldConfig.image.loaded || !playerSpriteConfig) {
    return false;
  }

  const pulse = Math.sin(missionTimer * 0.075);
  const alpha = 0.38 + pulse * 0.06;
  const scale = 1 + pulse * 0.015;
  const drawWidth = shieldConfig.drawWidth * scale;
  const drawHeight = shieldConfig.drawHeight * scale;
  const playerVisualOffsetX = (playerSpriteConfig.visualCenterOffsetX || 0) * (playerSpriteConfig.drawWidth / playerSpriteConfig.sw);
  const playerVisualOffsetY = (playerSpriteConfig.visualCenterOffsetY || 0) * (playerSpriteConfig.drawHeight / playerSpriteConfig.sh);
  const shieldVisualOffsetX = (shieldConfig.visualCenterOffsetX || 0) * (drawWidth / shieldConfig.sw);
  const shieldVisualOffsetY = (shieldConfig.visualCenterOffsetY || 0) * (drawHeight / shieldConfig.sh);
  const playerVisualCenter = getPlayerVisualPoint(playerVisualOffsetX, playerVisualOffsetY);
  const drawX = playerVisualCenter.x - shieldVisualOffsetX - drawWidth / 2;
  const drawY = playerVisualCenter.y - shieldVisualOffsetY - drawHeight / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    shieldConfig.image,
    shieldConfig.sx,
    shieldConfig.sy,
    shieldConfig.sw,
    shieldConfig.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  return true;
}

function drawPlayerShip() {
  drawPlayerGodmodeShield();

  if (drawPlayerSprite()) {
    drawPlayerWebOverlay();
    drawDevHitbox(player, "#44ffcc");
    return;
  }

  // Fallback placeholder if the sprite sheet is unavailable.
  if (!isPlayerInvulnerable && player.damageCooldown > 0 && Math.floor(player.damageCooldown / 2) % 2 === 0) {
    ctx.fillStyle = "#ffffff";
  } else {
    ctx.fillStyle = "#00ffcc";
  }

  ctx.fillRect(
    player.x,
    player.y,
    player.width,
    player.height
  );

  ctx.fillStyle = "white";

  ctx.fillRect(
    player.x + 12,
    player.y - 8,
    8,
    8
  );

  drawPlayerWebOverlay();

  drawDevHitbox(player, "#44ffcc");
}

function drawPlayerSpeedEffects() {
  if (playerSpeedStreaks.length === 0) {
    return;
  }

  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  const localRadius = canvas.width * (0.22 + playerSpeedEffectIntensity * 0.06);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  for (let i = 0; i < playerSpeedStreaks.length; i++) {
    const particle = playerSpeedStreaks[i];
    const alphaProgress = particle.maxLife > 0 ? particle.life / particle.maxLife : 0;
    const alpha = clamp(particle.alpha * (0.66 + alphaProgress * 0.34), 0.24, 0.62);
    const speedMag = Math.max(0.001, Math.hypot(particle.vx, particle.vy));
    const tailX = particle.x + (particle.vx / speedMag) * particle.length;
    const tailY = particle.y + (particle.vy / speedMag) * particle.length;
    const dxToCenter = particle.x - centerX;
    const dyToCenter = particle.y - centerY;

    if (dxToCenter * dxToCenter + dyToCenter * dyToCenter > (particle.radius + 50) * (particle.radius + 50)) {
      continue;
    }

    if (isRectOutsideViewport(particle.x - particle.length, Math.min(particle.y, tailY) - 20, particle.length * 2, Math.abs(tailY - particle.y) + 40, 90)) {
      continue;
    }

    if (particle.kind === "small") {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(245, 249, 255, 1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      continue;
    }

    if (particle.kind === "depth") {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(232, 238, 244, 1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      continue;
    }

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(248, 250, 255, 1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }

  ctx.restore();
}

function drawEnemyBullets() {
  for (let i = 0; i < enemyBullets.length; i++) {
    const bullet = enemyBullets[i];

    if (bullet.spawnDelay !== undefined && bullet.spawnDelay > 0) {
      continue;
    }

    if (bullet.type === "zigzagShot" && bullet.zigzagVolleyVariant) {
      if (drawZigzagVolleyProjectile(bullet)) {
        continue;
      }
    }

    if (bullet.type === "missile" && drawTankMissileSprite(bullet)) {
      continue;
    }

    const spriteConfig = sprites.projectiles[bullet.type] || sprites.projectiles.zigzagShot;

    if (drawProjectileSprite(bullet, spriteConfig)) {
      continue;
    }

    if (bullet.type === "missile") {
      ctx.fillStyle = enemyBullets[i].launchTimer > 0 ? "#ffaa33" : "#ff5533";
    } else if (bullet.type === "zigzagShot") {
      ctx.fillStyle = "#ff99ff";
    } else {
      ctx.fillStyle = "#ff8844";
    }

    ctx.fillRect(
      enemyBullets[i].x,
      enemyBullets[i].y,
      enemyBullets[i].width,
      enemyBullets[i].height
    );
  }
}

function drawEnemyHazardZones() {
  for (let i = 0; i < enemyHazardZones.length; i++) {
    drawTankHazardZone(enemyHazardZones[i]);
  }
}

function drawWebBullets() {
  ctx.fillStyle = "#ffffff";

  for (let i = 0; i < webBullets.length; i++) {
    if (drawProjectileSprite(webBullets[i], sprites.projectiles.web)) {
      continue;
    }

    ctx.fillRect(
      webBullets[i].x,
      webBullets[i].y,
      webBullets[i].width,
      webBullets[i].height
    );
  }
}

function drawBossBullets() {
  for (let i = 0; i < bossBullets.length; i++) {
    if (bossBullets[i].type === "missile" && drawTankMissileSprite(bossBullets[i])) {
      continue;
    }

    if (bossBullets[i].type === "zigzagShot" && bossBullets[i].zigzagVolleyVariant) {
      if (drawZigzagVolleyProjectile(bossBullets[i])) {
        continue;
      }
    }

    if (drawProjectileSprite(bossBullets[i], sprites.projectiles.boss)) {
      continue;
    }

    ctx.fillStyle = "#ffcc33";
    ctx.fillRect(
      bossBullets[i].x,
      bossBullets[i].y,
      bossBullets[i].width,
      bossBullets[i].height
    );
  }
}

function drawBossWebBullets() {
  ctx.fillStyle = "#ddffff";

  for (let i = 0; i < bossWebBullets.length; i++) {
    if (drawProjectileSprite(bossWebBullets[i], sprites.projectiles.bossWeb)) {
      continue;
    }

    ctx.fillRect(
      bossWebBullets[i].x,
      bossWebBullets[i].y,
      bossWebBullets[i].width,
      bossWebBullets[i].height
    );
  }
}

function hazardZoneNoise(seed) {
  let x = seed | 0;
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  x = Math.imul(x, 3266489909);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967295;
}

function getTankHazardFieldSeed(zone) {
  return (
    (Math.floor(zone.x) * 73856093) ^
    (Math.floor(zone.y) * 19349663) ^
    (Math.floor(zone.width) * 83492791) ^
    (Math.floor(zone.height) * 2654435761) ^
    0x51ed2705 ^
    (zone.state === "warning" ? 0x7f4a7c15 : 0x1f123bb5)
  ) >>> 0;
}

function getTankHazardCircle(zone) {
  const centerX = Number.isFinite(zone.centerX) ? zone.centerX : zone.x + zone.width / 2;
  const centerY = Number.isFinite(zone.centerY) ? zone.centerY : zone.y + zone.height / 2;
  const radius = Number.isFinite(zone.radius) ? zone.radius : Math.min(zone.width, zone.height) * 0.5;

  return {
    x: centerX,
    y: centerY,
    radius: radius
  };
}

function getTankHazardCircleBounds(zone) {
  const circle = getTankHazardCircle(zone);

  return {
    x: circle.x - circle.radius,
    y: circle.y - circle.radius,
    width: circle.radius * 2,
    height: circle.radius * 2
  };
}

function tankHazardFieldContainsPoint(zone, pointX, pointY) {
  const circle = getTankHazardCircle(zone);
  const dx = pointX - circle.x;
  const dy = pointY - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function drawDebugOverlayRect(rect, color, label, dashPattern = null, lineWidth = 1.5) {
  if (!rect) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  if (dashPattern && dashPattern.length > 0) {
    ctx.setLineDash(dashPattern);
  }

  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
  ctx.setLineDash([]);

  if (label) {
    ctx.fillStyle = color;
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, rect.x + rect.width / 2, rect.y - 4);
  }

  ctx.restore();
}

function drawDebugOverlayEllipse(x, y, radiusX, radiusY, rotation, color, label, lineWidth = 1.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.stroke();

  drawBossDebugPoint(x, y, color, label || "");
  ctx.restore();
}

function drawDebugOverlayCircle(x, y, radius, color, label, lineWidth = 2.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  drawBossDebugPoint(x, y, color, label || "");

  if (radius > 0) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + radius, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTankFieldBolt(zone, circle, seedBase, boltIndex, fade, anim) {
  const roll = hazardZoneNoise(seedBase + boltIndex * 97 + Math.floor(zone.timer * 3));
  const gate = Math.max(0, Math.min(1, (roll - 0.28) * 2.2));

  if (gate <= 0) {
    return;
  }

  const startAngle = hazardZoneNoise(seedBase + boltIndex * 131 + 17) * Math.PI * 2;
  const startRadius = 0.18 + hazardZoneNoise(seedBase + boltIndex * 163 + 19) * 0.5;
  const startX = circle.x + Math.cos(startAngle) * circle.radius * startRadius;
  const startY = circle.y + Math.sin(startAngle) * circle.radius * startRadius;
  const pointCount = 4;
  const points = [[startX, startY]];
  let dir = hazardZoneNoise(seedBase + boltIndex * 193 + 23) * Math.PI * 2;
  let x = startX;
  let y = startY;

  for (let i = 1; i < pointCount; i++) {
    const turnNoise = hazardZoneNoise(seedBase + boltIndex * 229 + i * 31);
    const stepNoise = hazardZoneNoise(seedBase + boltIndex * 241 + i * 43);
    dir += (turnNoise - 0.5) * 1.75;
    const step = circle.radius * (0.028 + stepNoise * 0.032) * (0.8 + fade * 0.2);
    x += Math.cos(dir) * step;
    y += Math.sin(dir) * step;
    points.push([x, y]);
  }

  const pulse = 0.5 + Math.sin(anim * 3.4 + boltIndex * 2.1 + roll * 4.5) * 0.5;
  const active = fade * gate * pulse;

  ctx.globalAlpha = active * 0.4;
  ctx.strokeStyle = "rgba(74, 255, 163, 1)";
  ctx.lineWidth = Math.max(4.5, zone.width * 0.08);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();

  ctx.globalAlpha = active * 0.82;
  ctx.strokeStyle = "rgba(246, 255, 244, 1)";
  ctx.lineWidth = Math.max(1.9, zone.width * 0.028);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
}

function drawTankHazardZone(zone) {
  const fadeFrames = 23;
  const fade = zone.timer < fadeFrames ? zone.timer / fadeFrames : 1;

  if (fade <= 0) {
    return;
  }

  const seedBase = getTankHazardFieldSeed(zone);
  const anim = zone.timer * 0.32 + seedBase * 0.000001;
  const circle = getTankHazardCircle(zone);
  const fadePow = fade * fade;
  const frameIndex = Math.floor((zone.animationTimer || 0) / 8) % 3;
  const frameImage = frameIndex === 0
    ? spriteSheets.tankDangerZoneFrame1
    : frameIndex === 1
      ? spriteSheets.tankDangerZoneFrame2
      : spriteSheets.tankDangerZoneFrame3;
  const drawDiameter = circle.radius * 2 * 1.02;
  const drawX = circle.x - drawDiameter / 2;
  const drawY = circle.y - drawDiameter / 2;

  ctx.save();
  ctx.globalAlpha = fadePow;
  ctx.globalCompositeOperation = "screen";
  ctx.imageSmoothingEnabled = true;

  if (frameImage && frameImage.loaded) {
    ctx.drawImage(frameImage, drawX, drawY, drawDiameter, drawDiameter);
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";

  for (let i = 0; i < 16; i++) {
    drawTankFieldBolt(zone, circle, seedBase, i, fade, anim);
  }

  ctx.restore();
  ctx.restore();
}

function drawBossHazardZone(zone) {
  const fadeFrames = 16;
  const fade = zone.timer < fadeFrames ? zone.timer / fadeFrames : 1;

  if (fade <= 0) {
    return;
  }

  const frameIndex = Math.floor((zone.animationTimer || 0) / 8) % 3;
  const frameImage = frameIndex === 0
    ? spriteSheets.bossDangerZoneFrame1
    : frameIndex === 1
      ? spriteSheets.bossDangerZoneFrame2
      : spriteSheets.bossDangerZoneFrame3;

  ctx.save();
  ctx.globalAlpha = fade * fade;
  ctx.globalCompositeOperation = "screen";
  ctx.imageSmoothingEnabled = true;

  if (frameImage && frameImage.loaded) {
    ctx.drawImage(frameImage, zone.x, zone.y, zone.width, zone.height);
  }

  ctx.restore();
}

function drawOrganicHazardZone(zone, config, stage = "tank") {
  const fadeFrames = config.fadeFrames || 14;
  const fade = zone.timer < fadeFrames ? zone.timer / fadeFrames : 1;

  if (fade <= 0) {
    return;
  }

  const centerX = zone.x + zone.width / 2;
  const centerY = zone.y + zone.height / 2;
  const stateBias = stage === "boss" && zone.state === "warning" ? 1.08 : 1;
  const seedBase = (
    (Math.floor(zone.x) * 73856093) ^
    (Math.floor(zone.y) * 19349663) ^
    (Math.floor(zone.width) * 83492791) ^
    (Math.floor(zone.height) * 2654435761) ^
    (zone.timer * 97) ^
    (stage === "boss" ? 0x9e3779b9 : 0x51ed2705) ^
    (zone.state === "warning" ? 0x7f4a7c15 : 0x1f123bb5)
  ) >>> 0;
  const anim = zone.timer * config.animSpeed + seedBase * 0.000001;
  const smokeCount = Math.max(3, Math.round(config.smokeCount * (0.45 + fade * 0.55)));
  const sparkCount = Math.max(1, Math.round(config.sparkCount * (0.35 + fade * 0.65)));
  const shardCount = Math.max(1, Math.round(config.shardCount * (0.30 + fade * 0.70)));
  const flashCount = config.flashCount ? Math.max(0, Math.round(config.flashCount * (0.35 + fade * 0.65))) : 0;
  const smokeAlpha = fade * config.smokeAlpha * stateBias;
  const sparkAlpha = fade * config.sparkAlpha * stateBias;
  const shardAlpha = fade * config.shardAlpha * stateBias;
  const flashAlpha = fade * config.flashAlpha * stateBias;

  ctx.save();
  ctx.globalCompositeOperation = "source-over";

  for (let i = 0; i < smokeCount; i++) {
    const noiseA = hazardZoneNoise(seedBase + i * 131);
    const noiseB = hazardZoneNoise(seedBase + i * 193 + 17);
    const noiseC = hazardZoneNoise(seedBase + i * 257 + 29);
    const angle = noiseA * Math.PI * 2;
    const spreadX = zone.width * config.spreadX;
    const spreadY = zone.height * config.spreadY;
    const orbit = 0.42 + noiseB * 0.72;
    const wobble = Math.sin(anim + i * 0.82 + noiseC * Math.PI * 2);
    const px = centerX + Math.cos(angle) * spreadX * orbit + wobble * zone.width * config.wobbleX;
    const py = centerY + Math.sin(angle) * spreadY * orbit + Math.cos(anim * 0.88 + i * 0.67) * zone.height * config.wobbleY;
    const radiusX = zone.width * (config.smokeMin + noiseB * config.smokeVar) * (0.72 + fade * 0.28);
    const radiusY = radiusX * config.smokeAspect;
    const tint = noiseC < 0.5 ? config.smokeDark : config.smokeLight;

    ctx.globalAlpha = smokeAlpha * (0.55 + noiseB * 0.45);
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.ellipse(px, py, radiusX, radiusY, angle * 0.25 + wobble * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  for (let i = 0; i < sparkCount; i++) {
    const noiseA = hazardZoneNoise(seedBase + i * 181 + 61);
    const noiseB = hazardZoneNoise(seedBase + i * 223 + 73);
    const angle = noiseA * Math.PI * 2;
    const orbit = 0.18 + noiseB * 0.46;
    const px = centerX + Math.cos(angle) * zone.width * config.sparkSpreadX * orbit;
    const py = centerY + Math.sin(angle) * zone.height * config.sparkSpreadY * orbit;
    const length = zone.width * (config.sparkMin + noiseB * config.sparkVar);
    const dir = angle + anim * 0.28 + i * 0.7;
    const color = noiseB < 0.5 ? config.sparkWarm : config.sparkHot;

    ctx.globalAlpha = sparkAlpha * (0.65 + noiseB * 0.35);
    ctx.strokeStyle = color;
    ctx.lineWidth = config.sparkWidth;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(dir) * length, py + Math.sin(dir) * length);
    ctx.stroke();
  }

  for (let i = 0; i < shardCount; i++) {
    const noiseA = hazardZoneNoise(seedBase + i * 239 + 91);
    const noiseB = hazardZoneNoise(seedBase + i * 269 + 103);
    const angle = noiseA * Math.PI * 2;
    const orbit = 0.12 + noiseB * 0.56;
    const px = centerX + Math.cos(angle) * zone.width * config.shardSpreadX * orbit;
    const py = centerY + Math.sin(angle) * zone.height * config.shardSpreadY * orbit;
    const shardLength = zone.width * (config.shardMin + noiseB * config.shardVar);
    const shardWidth = config.shardWidthMin + noiseA * config.shardWidthVar;
    const shardColor = noiseB < 0.55 ? config.shardDark : config.shardLight;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + anim * 0.1);
    ctx.globalAlpha = shardAlpha * (0.7 + noiseB * 0.3);
    ctx.fillStyle = shardColor;
    ctx.fillRect(-shardLength * 0.5, -shardWidth * 0.5, shardLength, shardWidth);
    ctx.restore();
  }

  if (flashCount > 0) {
    for (let i = 0; i < flashCount; i++) {
      const noiseA = hazardZoneNoise(seedBase + i * 311 + 137);
      const noiseB = hazardZoneNoise(seedBase + i * 337 + 149);
      const flashRadius = zone.width * (config.flashMin + noiseA * config.flashVar);
      const pulse = 0.5 + Math.sin(anim * 1.8 + i * 1.4) * 0.5;
      const px = centerX + (noiseA - 0.5) * zone.width * 0.18;
      const py = centerY + (noiseB - 0.5) * zone.height * 0.18;

      ctx.globalAlpha = flashAlpha * (0.45 + pulse * 0.55);
      ctx.fillStyle = config.flashColor;
      ctx.beginPath();
      ctx.ellipse(px, py, flashRadius, flashRadius * 0.55, anim * 0.15 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.restore();
}

function drawBossDangerZones() {
  for (let i = 0; i < bossDangerZones.length; i++) {
    drawBossHazardZone(bossDangerZones[i]);
  }
}

function drawBossAttackTelegraphs() {
  if (!boss.active || boss.introActive || bossDeathSequence.active) {
    return;
  }

  for (let i = 0; i < bossAttackTelegraphs.length; i++) {
    const cue = bossAttackTelegraphs[i];
    const alpha = Math.max(0, cue.life / cue.maxLife);
    const pulse = 0.55 + Math.sin(bossAnimationTimer * 0.55 + i) * 0.45;
    const side = cue.side === 1 ? 1 : -1;
    const anchor = getBossAttackAnchorPoint(cue.role, side);
    const radius = cue.type === "danger" ? 20 : cue.type === "web" ? 16 : 18;
    const color = cue.type === "danger" ? "255, 92, 42" : cue.type === "web" ? "210, 248, 255" : "255, 222, 102";

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const glow = ctx.createRadialGradient(anchor.x, anchor.y, 0, anchor.x, anchor.y, radius * (1.35 + pulse * 0.35));
    glow.addColorStop(0, "rgba(" + color + ", " + (0.34 * alpha) + ")");
    glow.addColorStop(0.55, "rgba(" + color + ", " + (0.13 * alpha) + ")");
    glow.addColorStop(1, "rgba(" + color + ", 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, radius * (1.35 + pulse * 0.35), 0, Math.PI * 2);
    ctx.fill();

    if (cue.type === "web") {
      ctx.strokeStyle = "rgba(220, 255, 255, " + (0.72 * alpha) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(anchor.x - 10 * side, anchor.y - 5);
      ctx.quadraticCurveTo(anchor.x - 2 * side, anchor.y + 7, anchor.x + 12 * side, anchor.y + 10);
      ctx.moveTo(anchor.x - 7 * side, anchor.y + 1);
      ctx.lineTo(anchor.x + 10 * side, anchor.y + 15);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "rgba(255, 245, 170, " + (0.64 * alpha) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(anchor.x - 9, anchor.y);
      ctx.lineTo(anchor.x + 9, anchor.y);
      ctx.moveTo(anchor.x, anchor.y - 9);
      ctx.lineTo(anchor.x, anchor.y + 9);
      ctx.stroke();
    }

    ctx.restore();
  }
}


function drawBossCoreLaser() {
  if (!boss.active || boss.introActive || bossCoreLaser.state === "idle") {
    return;
  }

  const laserBox = getBossCoreLaserVisualBox();
  const laserProfile = getBossCoreLaserEvolutionProfile();
  const beamCenterX = laserBox.x + laserBox.width / 2;
  const beamTopY = laserBox.y;
  const beamBaseWidth = laserBox.width;
  const isCharging = bossCoreLaser.state === "charging";
  const chargeProgress = isCharging
    ? 1 - bossCoreLaser.timer / bossCoreLaser.chargeDuration
    : 1;
  const beamHeight = isCharging
    ? Math.max(20, laserBox.height * chargeProgress)
    : laserBox.height;
  const phase = bossAnimationTimer * (isCharging ? 0.78 : 1.05);
  const capScale = laserProfile.capScale * (1 + (isCharging ? chargeProgress * laserProfile.capPulse : 0));
  const capAlpha = isCharging ? 0.72 + chargeProgress * 0.28 : 1;
  const beamIntensity = isCharging ? 0.3 + chargeProgress * 0.7 : 1;
  const emitterCenterY = beamTopY + laserProfile.emitterYOffset;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const emitterGlowRadius = isCharging ? 32 + chargeProgress * 20 : 38;
  const emitterGlow = ctx.createRadialGradient(beamCenterX, emitterCenterY, 0, beamCenterX, emitterCenterY, emitterGlowRadius);
  emitterGlow.addColorStop(0, "rgba(255, 248, 230, " + (0.42 + chargeProgress * 0.34) + ")");
  emitterGlow.addColorStop(0.28, "rgba(255, 152, 76, " + (0.34 + chargeProgress * 0.24) + ")");
  emitterGlow.addColorStop(1, "rgba(255, 130, 60, 0)");
  ctx.fillStyle = emitterGlow;
  ctx.beginPath();
  ctx.arc(beamCenterX, emitterCenterY, emitterGlowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = isCharging ? 0.14 + chargeProgress * 0.26 : 0.22;
  ctx.fillStyle = laserProfile.beamFillColor;
  ctx.fillRect(beamCenterX - beamBaseWidth / 2, beamTopY, beamBaseWidth, beamHeight);
  ctx.restore();

  drawBossLaserCap(
    laserProfile.capSprite,
    beamCenterX,
    beamTopY + laserProfile.emitterYOffset,
    capScale,
    capAlpha,
    isCharging ? 14 + chargeProgress * 10 : 18
  );

  drawBossLaserBeamColumn(
    laserProfile.beamSprite,
    beamCenterX,
    beamTopY,
    beamHeight,
    beamBaseWidth,
    beamIntensity,
    phase,
    isCharging,
    {
      beamGlowColor: laserProfile.beamGlowColor,
      beamFillColor: laserProfile.beamFillColor,
      glintColor: laserProfile.glintColor
    }
  );

  drawBossLaserCap(
    laserProfile.capSprite,
    beamCenterX,
    beamTopY + beamHeight - laserProfile.emitterYOffset,
    capScale,
    capAlpha,
    isCharging ? 14 + chargeProgress * 10 : 18
  );
}

function drawImpactFlashes() {
  for (let i = 0; i < impactFlashes.length; i++) {
    const flash = impactFlashes[i];
    const alpha = Math.max(0, flash.life / flash.maxLife);
    const flashAlpha = alpha * alpha;

    ctx.fillStyle = "rgba(255, 245, 160, " + (0.2 * flashAlpha) + ")";
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, flash.radius * (0.95 - alpha * 0.15), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSpriteExplosions() {
  for (let i = 0; i < spriteExplosions.length; i++) {
    const explosion = spriteExplosions[i];
    const config = explosion.config;

    if (!config.image.loaded) {
      continue;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(
      explosion.x + explosion.drawWidth / 2 + explosion.jitterX,
      explosion.y + explosion.drawHeight / 2 + explosion.jitterY
    );
    ctx.rotate(explosion.rotation);

    const drawFrame = config.frameSequence ? config.frameSequence[explosion.frame] : explosion.frame;
    const frameAlpha = config.frameAlphas ? config.frameAlphas[explosion.frame] : 1;
    const frameScale = config.frameScales ? config.frameScales[explosion.frame] : 1;

    if (config.glowColor) {
      const glowRadius = Math.max(explosion.drawWidth, explosion.drawHeight) * 0.52;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
      glow.addColorStop(0, config.glowColor);
      glow.addColorStop(0.5, config.glowColor);
      glow.addColorStop(1, "rgba(150, 255, 0, 0)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = frameAlpha;
      ctx.fillStyle = glow;
      ctx.fillRect(-glowRadius, -glowRadius, glowRadius * 2, glowRadius * 2);
      ctx.restore();
    }

    drawExplosionSpriteFrame(explosion, config, drawFrame, frameAlpha, frameScale);
    ctx.restore();
  }
}

function drawExplosionSpriteFrame(explosion, config, frame, alpha = 1, frameScale = 1) {
  const sourceInset = explosion.sourceInset;
  const sourceWidth = config.frameWidth - sourceInset * 2;
  const sourceHeight = config.frameHeight - sourceInset * 2;
  const drawWidth = explosion.drawWidth * explosion.scaleX * frameScale;
  const drawHeight = explosion.drawHeight * explosion.scaleY * frameScale;
  const drawX = -drawWidth / 2;
  const drawY = -drawHeight / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = config.colorFilter || "none";
  ctx.drawImage(
    config.image,
    explosion.sx + frame * config.frameWidth + sourceInset,
    explosion.sy + sourceInset,
    sourceWidth,
    sourceHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  ctx.restore();
}

function drawParticles() {
  const particleCullMargin = 120;

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    if (isPointOutsideViewport(particle.x, particle.y, particleCullMargin)) {
      continue;
    }

    if (particle.type === "lightningSpark") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.2, alpha);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = particle.width;
      ctx.beginPath();

      for (let pointIndex = 0; pointIndex < particle.points.length; pointIndex++) {
        const point = particle.points[pointIndex];

        if (pointIndex === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }

      ctx.stroke();
      ctx.globalAlpha = Math.max(0.16, alpha * 0.65);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (particle.type === "bossSmoke") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      const progress = 1 - alpha;
      const expand = (1.0 + progress * 2.25) * (particle.scale || 1);
      const flowAngle = Math.atan2(particle.vy, particle.vx);
      const driftX = particle.vx * (0.48 + progress * 0.18);
      const driftY = particle.vy * (1.02 + progress * 0.3);
      const wobble = Math.sin(particle.wobbleSeed + progress * 7.2) * (1 + progress * 0.9);
      const twist = Math.cos(particle.wobbleSeed * 0.7 + progress * 4.6) * 0.34;
      const baseRadius = particle.radius * expand;
      const stageRise = progress * 10.2;
      const stageSpread = progress * 6.4;
      const opacity = Math.min(1, alpha * 0.85 + progress * 0.08);

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = opacity;

      if (particle.glowAlpha > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.max(0.012, particle.glowAlpha * (0.18 + progress * 0.1));
        ctx.fillStyle = particle.glowColor || "#ff9644";
        ctx.beginPath();
        ctx.ellipse(
          particle.x + driftX * 0.24,
          particle.y + driftY * 0.24 - stageRise * 0.08,
          baseRadius * 0.28,
          baseRadius * 0.1,
          twist * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }

      const layers = [
        { dx: 0, dy: 0, rx: 0.86, ry: 0.46, color: particle.darkColor || "#3b3740", alpha: 0.9 },
        { dx: -baseRadius * 0.16 + wobble * 0.46, dy: -baseRadius * 0.08 - stageRise * 0.16, rx: 0.52, ry: 0.24, color: particle.midColor || "#68636a", alpha: 0.5 },
        { dx: baseRadius * 0.12 + wobble * 0.2, dy: -baseRadius * 0.1 - stageRise * 0.2, rx: 0.26, ry: 0.1, color: particle.lightColor || "#9a9498", alpha: 0.1 }
      ];

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        ctx.globalAlpha = opacity * layer.alpha;
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.ellipse(
          particle.x + driftX + layer.dx,
          particle.y + driftY - stageRise * 0.12 + layer.dy,
          baseRadius * layer.rx * (0.82 + progress * 0.12),
          baseRadius * layer.ry * (0.68 + progress * 0.12),
          twist + flowAngle * 0.15 + (i - 1) * 0.06,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0.025, opacity * 0.07);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(
        particle.x + driftX * 0.2,
        particle.y + driftY * 0.18 - stageRise * 0.08,
        baseRadius * 0.5,
        baseRadius * 0.18,
        twist * 0.25 + flowAngle * 0.06,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();

      const lobeCount = 3;
      for (let i = 0; i < lobeCount; i++) {
        const lobeProgress = i / (lobeCount - 1);
        const lobeAlpha = opacity * (0.08 - lobeProgress * 0.012);
        const lobeX = particle.x + driftX * (0.16 + lobeProgress * 0.48) + wobble * (0.24 - lobeProgress * 0.1) + stageSpread * (lobeProgress - 0.5) * 0.22;
        const lobeY = particle.y + driftY * (0.18 + lobeProgress * 0.76) - stageRise * (0.11 + lobeProgress * 0.28);
        ctx.globalAlpha = lobeAlpha;
        ctx.fillStyle = i < 2 ? "rgba(20, 18, 22, 1)" : "rgba(26, 24, 28, 1)";
        ctx.beginPath();
        ctx.ellipse(
          lobeX,
          lobeY,
          baseRadius * (0.16 + lobeProgress * 0.08),
          baseRadius * (0.06 + lobeProgress * 0.04),
          twist * 0.45 + flowAngle * 0.08 + lobeProgress * 0.12,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.008, alpha * particle.glowAlpha * 0.22);
      ctx.fillStyle = particle.glowColor || "#ff9644";
      ctx.beginPath();
      ctx.ellipse(
        particle.x + driftX * 0.6,
        particle.y + driftY * 0.35 - stageRise * 0.18,
        baseRadius * 0.1,
        baseRadius * 0.035,
        twist * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (particle.type === "bossEmber") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      const radius = particle.radius * (0.72 + alpha * 0.36);
      const tail = Math.max(2, radius * 1.2);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.16, alpha);
      ctx.fillStyle = particle.outerColor || "#ff8a42";
      ctx.beginPath();
      ctx.ellipse(particle.x, particle.y, radius * 1.12, radius * 0.52, Math.atan2(particle.speedY, particle.speedX) * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = Math.max(0.08, alpha * 0.72);
      ctx.fillStyle = particle.innerColor || "#ffe5a8";
      ctx.beginPath();
      ctx.ellipse(particle.x - tail * 0.12, particle.y - tail * 0.08, radius * 0.58, radius * 0.24, Math.atan2(particle.speedY, particle.speedX) * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = Math.max(0.04, alpha * 0.38);
      ctx.fillStyle = particle.glowColor || "#ffd28b";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (particle.type === "spark") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      const angle = Math.atan2(particle.speedY, particle.speedX);
      const length = Math.max(4, particle.length * (0.35 + alpha * 0.65));

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.28, alpha);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = particle.width;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - Math.cos(angle) * length, particle.y - Math.sin(angle) * length);
      ctx.stroke();
      ctx.globalAlpha = Math.max(0.18, alpha * 0.55);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1, particle.width * 0.55);
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - Math.cos(angle) * length * 0.55, particle.y - Math.sin(angle) * length * 0.55);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (particle.type === "shard") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      const size = particle.size * (0.5 + alpha * 0.5);

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.angle + (particle.maxLife - particle.life) * particle.spin);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0.2, alpha);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(0, size * 0.45);
      ctx.lineTo(-size * 0.8, 0);
      ctx.lineTo(0, -size * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (particle.type === "missileTrail") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      const size = Math.max(2, Math.round(particle.size * (0.55 + alpha * 0.7)));

      ctx.save();
      ctx.globalAlpha = Math.max(0.08, alpha * 0.75);
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.round(particle.x - size / 2), Math.round(particle.y - size / 2), size, size);
      ctx.restore();
      continue;
    }

    if (particle.type === "microFlash") {
      const alpha = Math.max(0, Math.min(1, particle.life / particle.maxLife));
      const size = particle.size * (0.7 + alpha);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - size / 2, particle.y - 0.5, size, 1);
      ctx.fillRect(particle.x - 0.5, particle.y - size / 2, 1, size);
      ctx.restore();
      continue;
    }

    ctx.fillStyle = particle.color || "#ffaa33";
    ctx.fillRect(
      particle.x,
      particle.y,
      particle.size,
      particle.size
    );
  }
}

function drawMuzzleFlashes() {
  for (let i = 0; i < muzzleFlashes.length; i++) {
    const flash = muzzleFlashes[i];
    const alpha = Math.max(0, flash.life / flash.maxLife);
    const size = flash.size * (0.65 + alpha * 0.35);

    ctx.save();
    ctx.translate(flash.x, flash.y);
    ctx.rotate(flash.angle);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;

    if (flash.type === "player") {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.max(0.58, alpha);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-1, -size * 0.55, 2, size * 0.9);
      ctx.fillRect(-size * 0.32, -1, size * 0.64, 2);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha;
      ctx.fillStyle = flash.color;
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.0);
      ctx.lineTo(-size * 0.42, -size * 0.08);
      ctx.lineTo(0, size * 0.18);
      ctx.lineTo(size * 0.42, -size * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = Math.max(0.45, alpha * 0.85);
      ctx.strokeStyle = "#7eefff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-size * 0.52, -size * 0.24);
      ctx.lineTo(-size * 0.12, -size * 0.72);
      ctx.moveTo(size * 0.52, -size * 0.24);
      ctx.lineTo(size * 0.12, -size * 0.72);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    ctx.fillStyle = flash.color;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.42, -size * 0.26);
    ctx.lineTo(-size * 0.18, 0);
    ctx.lineTo(-size * 0.42, size * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-size * 0.1, -1, size * 0.6, 2);
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = "#baffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.45);
    ctx.lineTo(size * 0.15, -size * 0.1);
    ctx.moveTo(-size * 0.2, size * 0.45);
    ctx.lineTo(size * 0.15, size * 0.1);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlayerHp() {
  for (let i = 0; i < 5; i++) {
    if (i < player.hp) {
      ctx.fillStyle = "#00ff66";
    } else {
      ctx.fillStyle = "#333333";
    }

    ctx.fillRect(20 + i * 24, 55, 18, 18);
  }
}

function getBossLegPartKey(leg) {
  return leg.role + (leg.side === -1 ? "Left" : "Right");
}

function drawBossAssembledPart(partKey, alpha = 1, compositeOperation = "source-over") {
  const partConfig = bossAssembledSpriteConfig.parts[partKey];
  const drawRect = getBossAssembledPartDrawRect(partKey);
  const image = bossAssembledSpriteConfig.image;

  if (!partConfig || !drawRect || !image || !image.loaded || !Number.isFinite(alpha)) {
    return false;
  }

  const maskedCanvas = prepareBossAssembledPartCanvas(partConfig);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = compositeOperation;
  ctx.imageSmoothingEnabled = false;

  if (maskedCanvas) {
    ctx.drawImage(maskedCanvas, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
  } else {
    const source = partConfig.sourceRect;
    ctx.drawImage(
      image,
      source.sx,
      source.sy,
      source.sw,
      source.sh,
      drawRect.x,
      drawRect.y,
      drawRect.width,
      drawRect.height
    );
  }

  ctx.restore();
  return true;
}

function getBossAssembledPartLocalRect(partKey) {
  const partConfig = bossAssembledSpriteConfig.parts[partKey];
  const fullSource = bossAssembledSpriteConfig.sourceRect;

  if (!partConfig || !fullSource) {
    return null;
  }

  const source = partConfig.sourceRect;
  const scaleX = bossAssembledSpriteConfig.drawWidth / fullSource.sw;
  const scaleY = bossAssembledSpriteConfig.drawHeight / fullSource.sh;

  return {
    x: (source.sx - fullSource.sx) * scaleX,
    y: (source.sy - fullSource.sy) * scaleY,
    width: source.sw * scaleX,
    height: source.sh * scaleY
  };
}

function getBossLegVisualState(leg) {
  return leg && !leg.destroyed && leg.alive ? "intact" : "destroyed";
}

function isBossLegAlive(leg) {
  return !!leg && !leg.destroyed && !!leg.alive;
}

function isBossLegDestroyed(leg) {
  return !!leg && (leg.destroyed || !leg.alive);
}

function getBossLegByRoleAndSide(role, side) {
  for (let i = 0; i < boss.legs.length; i++) {
    if (boss.legs[i].role === role && boss.legs[i].side === side) {
      return boss.legs[i];
    }
  }

  return null;
}

function getBossAssembledLegVisualPartKeys() {
  return ["upperLeft", "middleLeft", "lowerLeft", "upperRight", "middleRight", "lowerRight"];
}

function getBossSegmentSpriteKey(partKey) {
  if (!partKey) {
    return null;
  }

  return "bossSegment" + partKey.charAt(0).toUpperCase() + partKey.slice(1);
}

function getBossLegSegmentImage(leg) {
  if (!leg) {
    return null;
  }

  const partKey = getBossLegPartKey(leg);
  const spriteKey = getBossSegmentSpriteKey(partKey);
  return spriteKey ? spriteSheets[spriteKey] || null : null;
}

function getBossAssembledBodyCacheKey() {
  const flags = [];

  for (let i = 0; i < boss.legs.length; i++) {
    flags.push(boss.legs[i].alive ? "1" : "0");
  }

  return flags.join("");
}

function prepareBossAssembledBodyCanvas() {
  if (!canUseBossAssembledSprite()) {
    return null;
  }

  const fullSource = bossAssembledSpriteConfig.sourceRect;
  const image = bossAssembledSpriteConfig.image;
  const cacheKey = getBossAssembledBodyCacheKey();

  if (bossAssembledBodyCanvasCache[cacheKey]) {
    return bossAssembledBodyCanvasCache[cacheKey];
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = fullSource.sw;
    canvas.height = fullSource.sh;
    const bodyCtx = canvas.getContext("2d");

    if (!bodyCtx) {
      return null;
    }

    bodyCtx.imageSmoothingEnabled = false;
    bodyCtx.drawImage(
      image,
      fullSource.sx,
      fullSource.sy,
      fullSource.sw,
      fullSource.sh,
      0,
      0,
      fullSource.sw,
      fullSource.sh
    );
    bossAssembledBodyCanvasCache[cacheKey] = canvas;
    return canvas;
  } catch (error) {
    return null;
  }
}

function getBossOwnedLegClipRectFromHitbox(leg, legBox) {
  if (!legBox) {
    return null;
  }

  const paddingX = 2;
  const paddingY = 2;

  return {
    x: legBox.x - paddingX,
    y: legBox.y - paddingY,
    width: legBox.width + paddingX * 2,
    height: legBox.height + paddingY * 2
  };
}

function getBossOwnedLegVisualClipRect(leg, drawRect) {
  if (!leg || !drawRect) {
    return null;
  }

  const paddingX = Math.max(2, drawRect.width * 0.015);
  const paddingY = Math.max(2, drawRect.height * 0.015);

  return {
    x: drawRect.x - paddingX,
    y: drawRect.y - paddingY,
    width: drawRect.width + paddingX * 2,
    height: drawRect.height + paddingY * 2
  };
}

function logBossLegDestroyedVisual(leg, oldHp, newHp) {
  if (!window.console || !console.log) {
    return;
  }

  const partKey = getBossLegPartKey(leg);
  const partConfig = bossAssembledSpriteConfig.parts[partKey];
  const damageAnchor = getBossDamageAnchorPoint(getBossDamageAnchorKeyForLeg(leg));
  const debugInfo = {
    id: getBossLegDebugId(leg),
    oldHp: oldHp,
    newHp: newHp,
    destroyed: !leg.alive,
    visualState: getBossLegVisualState(leg),
    partKey: partKey,
    damageAnchor: damageAnchor,
    sourceRect: partConfig ? partConfig.sourceRect : null,
    hiddenParts: [partKey],
    stillDrawnForThisLeg: []
  };

  console.log("[boss-leg-destroyed]", debugInfo);
}

function drawBossAssembledLegFlash(leg) {
  return isBossLegAlive(leg) && drawBossAssembledOwnedLeg(leg, bossSpriteConfig.alpha.legFlash, "lighter");
}

function drawBossAssembledOwnedLeg(leg, alpha = 1, compositeOperation = "source-over") {
  if (!isBossLegAlive(leg)) {
    return false;
  }

  const geometry = getBossLegAssembledGeometry(leg);
  const image = getBossLegSegmentImage(leg);

  if (!geometry || !image || !image.loaded || !Number.isFinite(alpha)) {
    return false;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = compositeOperation;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    geometry.drawRect.x,
    geometry.drawRect.y,
    geometry.drawRect.width,
    geometry.drawRect.height
  );
  ctx.restore();
  return true;
}

function drawZigzagEnemyGlow(enemy, spriteConfig) {
  if (!spriteConfig || !spriteConfig.image.loaded) {
    return false;
  }

  const frame = getSpriteAnimationFrame(spriteConfig, enemy);
  const drawWidth = spriteConfig.drawWidth || enemy.width;
  const drawHeight = spriteConfig.drawHeight || enemy.height;
  const drawX = enemy.x + enemy.width / 2 - drawWidth / 2 + (spriteConfig.offsetX || 0);
  const drawY = enemy.y + enemy.height / 2 - drawHeight / 2 + (spriteConfig.offsetY || 0);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.28;
  ctx.shadowColor = "rgba(118, 224, 255, 0.95)";
  ctx.shadowBlur = 7;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    spriteConfig.image,
    frame.sx,
    frame.sy,
    spriteConfig.sw,
    spriteConfig.sh,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  return true;
}

function drawBossDamagedBody(alpha = 1, compositeOperation = "source-over") {
  const assembledRect = getBossAssembledDrawRect();
  const bodyCanvas = prepareBossAssembledBodyCanvas();

  if (!assembledRect || !bodyCanvas || !Number.isFinite(alpha)) {
    return false;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = compositeOperation;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bodyCanvas, assembledRect.x, assembledRect.y, assembledRect.width, assembledRect.height);
  ctx.restore();
  return true;
}

function drawBossDestroyedLegStump(leg, alpha = 1, compositeOperation = "source-over") {
  if (!isBossLegDestroyed(leg) || leg.role === "lower") {
    return false;
  }

  const assembledRect = getBossAssembledDrawRect();
  const suffix = leg.role.charAt(0).toUpperCase() + leg.role.slice(1) + (leg.side === -1 ? "Left" : "Right");
  const image = spriteSheets["bossStump" + suffix] || null;

  if (!assembledRect || !image || !image.loaded || !Number.isFinite(alpha)) {
    return false;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = compositeOperation;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, assembledRect.x, assembledRect.y, assembledRect.width, assembledRect.height);
  ctx.restore();
  return true;
}

function drawBossDestroyedLegStumps(alpha = 1, compositeOperation = "source-over") {
  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];

    if (isBossLegDestroyed(leg) && leg.role !== "lower") {
      drawBossDestroyedLegStump(leg, alpha, compositeOperation);
    }
  }
}

function getBossAssembledOwnedLegDrawRect(leg) {
  const geometry = getBossLegAssembledGeometry(leg);
  return geometry ? geometry.drawRect : null;
}

function drawBossAssembledCorePulse(corePulseAlpha, warningAlpha) {
  const coreRect = getBossAssembledHitboxRect("core");

  if (!coreRect) {
    return false;
  }

  const centerX = coreRect.x + coreRect.width / 2;
  const centerY = coreRect.y + coreRect.height / 2;
  const pulseRadius = Math.max(coreRect.width, coreRect.height) * (1.45 + corePulseAlpha * 0.55);
  const pulseGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
  const flashRadius = pulseRadius * 0.72;
  const flashGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, flashRadius);

  pulseGlow.addColorStop(0, "rgba(255, 90, 90, " + (0.12 + corePulseAlpha * 0.12 + warningAlpha * 0.06) + ")");
  pulseGlow.addColorStop(0.5, "rgba(255, 58, 58, " + (0.05 + corePulseAlpha * 0.05 + warningAlpha * 0.03) + ")");
  pulseGlow.addColorStop(1, "rgba(255, 58, 58, 0)");

  flashGlow.addColorStop(0, "rgba(255, 250, 200, " + (0.08 + warningAlpha * 0.28) + ")");
  flashGlow.addColorStop(0.45, "rgba(255, 170, 110, " + (0.04 + warningAlpha * 0.12) + ")");
  flashGlow.addColorStop(1, "rgba(255, 170, 110, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = pulseGlow;
  ctx.fillRect(centerX - pulseRadius, centerY - pulseRadius, pulseRadius * 2, pulseRadius * 2);

  if (warningAlpha > 0) {
    ctx.fillStyle = flashGlow;
    ctx.fillRect(centerX - flashRadius, centerY - flashRadius, flashRadius * 2, flashRadius * 2);
  }

  ctx.restore();
  return true;
}

function drawBossAssembledSprite(rageBlink) {
  if (!canUseBossAssembledSprite()) {
    return false;
  }

  const orderedLegs = [
    boss.legs.find(leg => leg.role === "upper" && leg.side === -1),
    boss.legs.find(leg => leg.role === "middle" && leg.side === -1),
    boss.legs.find(leg => leg.role === "lower" && leg.side === -1),
    boss.legs.find(leg => leg.role === "upper" && leg.side === 1),
    boss.legs.find(leg => leg.role === "middle" && leg.side === 1),
    boss.legs.find(leg => leg.role === "lower" && leg.side === 1)
  ];

  if (!drawBossDamagedBody(1, "source-over")) {
    return false;
  }

  for (let i = 0; i < orderedLegs.length; i++) {
    const leg = orderedLegs[i];

    if (!isBossLegAlive(leg)) {
      continue;
    }

    if (!drawBossAssembledOwnedLeg(leg, 1, "source-over")) {
      return false;
    }
  }

  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];

    if (!isBossLegAlive(leg)) {
      continue;
    }

    if (leg.hitFlash > 0 || rageBlink) {
      drawBossAssembledLegFlash(leg);
    }
  }

  drawBossDestroyedLegStumps(1, "source-over");

  const corePulseAlpha = getBossCorePulseAlpha();
  const warningAlpha = getBossAttackWarningAlpha();

  if (corePulseAlpha > 0 || warningAlpha > 0) {
    drawBossAssembledCorePulse(corePulseAlpha, warningAlpha);
  }

  if (warningAlpha > 0) {
    drawBossDamagedBody(warningAlpha * 0.12, "lighter");
  }

  if (boss.hitFlash > 0 || rageBlink) {
    drawBossDamagedBody(bossSpriteConfig.alpha.bodyFlash, "lighter");
    drawBossDamagedBody(bossSpriteConfig.alpha.bodyFlash * 0.42, "lighter");
  }

  return true;
}

function drawBossDebugPoint(x, y, color, label) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#050510";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (label) {
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, x, y - 8);
  }

  ctx.restore();
}

function drawBossDebugPixelStar(x, y, color) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5);
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
  ctx.fillRect(Math.round(x), Math.round(y) - 3, 1, 7);
  ctx.fillRect(Math.round(x) - 3, Math.round(y), 7, 1);

  ctx.restore();
}

function drawBossDebugAxes(anchor, color) {
  if (!anchor) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(anchor.x - 10, anchor.y);
  ctx.lineTo(anchor.x + 10, anchor.y);
  ctx.moveTo(anchor.x, anchor.y - 10);
  ctx.lineTo(anchor.x, anchor.y + 10);
  ctx.stroke();
  ctx.restore();
}

function getBossSpreadDebugQueue(side) {
  const queues = boss.spreadAttackDebugQueues || {};
  return queues[String(side)] || [];
}

function drawBossSpreadDebugBulletMarker(bullet, color, label) {
  if (!bullet) {
    return;
  }

  const spawnX = Number.isFinite(bullet.debugSpreadSpawnX) ? bullet.debugSpreadSpawnX : null;
  const spawnY = Number.isFinite(bullet.debugSpreadSpawnY) ? bullet.debugSpreadSpawnY : null;

  if (spawnX === null || spawnY === null) {
    return;
  }

  drawBossDebugPoint(spawnX, spawnY, color, label);
}

function drawBossSpreadDebugLink(anchor, spawn, anchorColor, spawnColor, label) {
  if (!anchor || !spawn) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(spawn.x, spawn.y);
  ctx.stroke();
  ctx.restore();

  drawBossDebugPoint(anchor.x, anchor.y, anchorColor, label + " A");
  drawBossDebugPoint(spawn.x, spawn.y, spawnColor, label);
}

function drawBossSpreadDebugOverlay(textOffset) {
  const spreadLeft = getBossAssembledAnchorPoint("spreadLeft");
  const spreadRight = getBossAssembledAnchorPoint("spreadRight");

  if (spreadLeft) {
    drawBossDebugPixelStar(spreadLeft.x, spreadLeft.y, "#4da8ff");
  }

  if (spreadRight) {
    drawBossDebugPixelStar(spreadRight.x, spreadRight.y, "#4da8ff");
  }
}

function getRotatedRectBounds(rect) {
  if (!rect) {
    return null;
  }

  const angle = Number.isFinite(rect.angle) ? rect.angle : 0;
  const cx = rect.x;
  const cy = rect.y;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight }
  ];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const rotatedX = cx + point.x * cos - point.y * sin;
    const rotatedY = cy + point.x * sin + point.y * cos;
    minX = Math.min(minX, rotatedX);
    minY = Math.min(minY, rotatedY);
    maxX = Math.max(maxX, rotatedX);
    maxY = Math.max(maxY, rotatedY);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function getBossLegSilhouettePrototypeSegments(leg) {
  return getBossLegCollisionSegments(leg);
}

function getBossLegacyLegBoxForDebug(leg) {
  if (!leg) {
    return null;
  }

  const sway = getBossLegSway(leg);
  const attachX = boss.x + leg.offsetX;
  const extraTipWidth = leg.extraTipSegment ? leg.width * 0.12 : 0;
  const extraTipHeight = leg.extraTipSegment ? leg.height * 0.08 : 0;

  if (leg.side === -1) {
    return {
      x: attachX - leg.width - extraTipWidth + sway,
      y: boss.y + leg.offsetY,
      width: leg.width + extraTipWidth,
      height: leg.height + extraTipHeight
    };
  }

  return {
    x: attachX + sway,
    y: boss.y + leg.offsetY,
    width: leg.width + extraTipWidth,
    height: leg.height + extraTipHeight
  };
}

function drawBossDebugOverlay() {
  if (!isGameplayDebugOverlayActive()) {
    return;
  }

  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = "11px Arial";
  ctx.textAlign = "left";
  const debugConfig = bossSpriteConfig.debug;
  const bodyHitbox = getBossBodyHitbox();
  const coreHitbox = getBossCoreHitbox();
  const textOffset = isGameplayDebugTechMode() || isGameplayDebugVisualMode() ? 150 : 0;

  if (canUseBossAssembledSprite()) {
    ctx.strokeStyle = debugConfig.bodyRectColor;
    const assembledRect = getBossAssembledDrawRect();

    if (assembledRect) {
      ctx.strokeRect(assembledRect.x + 0.5, assembledRect.y + 0.5, assembledRect.width - 1, assembledRect.height - 1);
    }

    ctx.strokeStyle = debugConfig.bodyColor;
    const bodySegments = getBossBodyCollisionSegments();

    for (let segmentIndex = 0; segmentIndex < bodySegments.length; segmentIndex++) {
      const bodySegment = bodySegments[segmentIndex];
      const rect = bodySegment.rect;
      ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
      drawBossDebugPoint(rect.x + rect.width / 2, rect.y + rect.height / 2, debugConfig.bodyColor, "BODY-" + bodySegment.id.toUpperCase());
    }

    ctx.strokeStyle = "#ff6666";
    ctx.strokeRect(coreHitbox.x + 0.5, coreHitbox.y + 0.5, coreHitbox.width - 1, coreHitbox.height - 1);
    drawBossDebugPoint(coreHitbox.x + coreHitbox.width / 2, coreHitbox.y + coreHitbox.height / 2, "#ff6666", "CORE");

    if (isGameplayDebugOverlayActive()) {
      ctx.fillStyle = "#a7ffb0";
      ctx.fillText("BOSS DEBUG: gameplay collision", 20, 245 + textOffset);
      ctx.fillText("BODY HB " + Math.round(bodyHitbox.x) + "," + Math.round(bodyHitbox.y) + " " + Math.round(bodyHitbox.width) + "x" + Math.round(bodyHitbox.height), 20, 262 + textOffset);
      ctx.fillText("CORE HB " + Math.round(coreHitbox.x) + "," + Math.round(coreHitbox.y) + " " + Math.round(coreHitbox.width) + "x" + Math.round(coreHitbox.height), 20, 279 + textOffset);
      ctx.fillText("LEG DBG: boxes are the active gameplay collision data", 20, 296 + textOffset);

      for (let i = 0; i < boss.legs.length; i++) {
        const leg = boss.legs[i];
        const pairConfig = bossSpriteConfig.legPairMapping[leg.role];
        const label = pairConfig.label + (leg.side === -1 ? "L" : "R");
        const legColor = leg.role === "lower" ? "#7cffb0" : leg.role === "middle" ? "#58d9ff" : "#ffca66";

        const prototypeSegments = getBossLegSilhouettePrototypeSegments(leg);

        for (let segmentIndex = 0; segmentIndex < prototypeSegments.length; segmentIndex++) {
          const segment = prototypeSegments[segmentIndex];
          const rect = segment.rect;
          ctx.strokeStyle = leg.alive ? legColor : debugConfig.destroyedColor;
          ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
          drawBossDebugPoint(rect.x + rect.width / 2, rect.y + rect.height / 2, legColor, label + "-" + segment.id.toUpperCase());
        }
      }

      if (bossDebugLastHit.timer > 0) {
        ctx.fillStyle = "#ffb366";
        ctx.fillText("HIT " + bossDebugLastHit.id + (bossDebugLastHit.segmentId ? " / " + bossDebugLastHit.segmentId.toUpperCase() : "") + " DMG " + (bossDebugLastHit.damage || 0), 20, 313 + textOffset);
        drawBossDebugPoint(bossDebugLastHit.x, bossDebugLastHit.y, "#ffb366", "");
      }

      ctx.fillStyle = debugConfig.pairStateColor;
      ctx.fillText("P1 upper: " + (hasAliveBossLeg("upper") ? "ACTIVE" : "DESTROYED"), 20, 330 + textOffset);
      ctx.fillText("P2 middle: " + (hasAliveBossLeg("middle") ? "ACTIVE" : "DESTROYED"), 20, 347 + textOffset);
      ctx.fillText("P3 lower: " + (hasAliveBossLeg("lower") ? "ACTIVE" : "DESTROYED"), 20, 364 + textOffset);
      drawBossSpreadDebugOverlay(textOffset);
      ctx.restore();
      return;
    }

    for (let i = 0; i < boss.legs.length; i++) {
      const leg = boss.legs[i];
      const pairConfig = bossSpriteConfig.legPairMapping[leg.role];
      const label = pairConfig.label + (leg.side === -1 ? "L" : "R");
      const geometry = getBossLegAssembledGeometry(leg);
      const anchor = geometry ? geometry.damageAnchor || geometry.anchor : null;
      const damageAnchorLabel = leg.damageAnchorKey || label;
      const legColor = getBossLegDebugColor(leg);

      if (geometry) {
        ctx.strokeStyle = leg.alive ? "#7ee7ff" : debugConfig.destroyedColor;
        ctx.strokeRect(
          geometry.drawRect.x + 0.5,
          geometry.drawRect.y + 0.5,
          geometry.drawRect.width - 1,
          geometry.drawRect.height - 1
        );
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = leg.alive ? "#88ccff" : debugConfig.destroyedColor;
        ctx.strokeRect(
          geometry.clipRect.x + 0.5,
          geometry.clipRect.y + 0.5,
          geometry.clipRect.width - 1,
          geometry.clipRect.height - 1
        );
        ctx.setLineDash([]);
        drawBossDebugPoint(geometry.renderOrigin.x, geometry.renderOrigin.y, "#ffffff", "");
      }

      const collisionSegments = getBossLegCollisionSegments(leg);

      for (let segmentIndex = 0; segmentIndex < collisionSegments.length; segmentIndex++) {
        const collisionSegment = collisionSegments[segmentIndex];
        const rect = collisionSegment.rect;
        ctx.strokeStyle = leg.alive ? legColor : debugConfig.destroyedColor;
        ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
        drawBossDebugPoint(rect.x + rect.width / 2, rect.y + rect.height / 2, legColor, label + "-" + collisionSegment.id.toUpperCase());
      }

      if (anchor) {
        drawBossDebugAxes(anchor, debugConfig.attachColor);
        drawBossDebugPoint(
          anchor.x,
          anchor.y,
          debugConfig.attachColor,
          damageAnchorLabel
        );
      }
    }

    ctx.fillStyle = debugConfig.textColor;
    ctx.fillText(debugConfig.label, 20, 245 + textOffset);
    ctx.fillText("BODY HB " + Math.round(bodyHitbox.x) + "," + Math.round(bodyHitbox.y) + " " + Math.round(bodyHitbox.width) + "x" + Math.round(bodyHitbox.height), 20, 262 + textOffset);
    ctx.fillText("CORE HB " + Math.round(coreHitbox.x) + "," + Math.round(coreHitbox.y) + " " + Math.round(coreHitbox.width) + "x" + Math.round(coreHitbox.height), 20, 279 + textOffset);
    ctx.fillText("LEG DBG: cyan=drawRect dashed=clipRect white=renderOrigin", 20, 296 + textOffset);
    if (bossDebugLastHit.timer > 0) {
      ctx.fillStyle = "#ffb366";
      ctx.fillText("HIT " + bossDebugLastHit.id + (bossDebugLastHit.segmentId ? " / " + bossDebugLastHit.segmentId.toUpperCase() : "") + " DMG " + (bossDebugLastHit.damage || 0), 20, 313 + textOffset);
      drawBossDebugPoint(bossDebugLastHit.x, bossDebugLastHit.y, "#ffb366", "");
    }
      ctx.fillStyle = debugConfig.pairStateColor;
      ctx.fillText("P1 upper: " + (hasAliveBossLeg("upper") ? "ACTIVE" : "DESTROYED"), 20, 330 + textOffset);
      ctx.fillText("P2 middle: " + (hasAliveBossLeg("middle") ? "ACTIVE" : "DESTROYED"), 20, 347 + textOffset);
      ctx.fillText("P3 lower: " + (hasAliveBossLeg("lower") ? "ACTIVE" : "DESTROYED"), 20, 364 + textOffset);
      drawBossSpreadDebugOverlay(textOffset);

      ctx.restore();
      return;
  }

  ctx.strokeStyle = debugConfig.bodyColor;
  const fallbackBodySegments = getBossBodyCollisionSegments();

  for (let segmentIndex = 0; segmentIndex < fallbackBodySegments.length; segmentIndex++) {
    const bodySegment = fallbackBodySegments[segmentIndex];
    const rect = bodySegment.rect;
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
    drawBossDebugPoint(rect.x + rect.width / 2, rect.y + rect.height / 2, debugConfig.bodyColor, "BODY-" + bodySegment.id.toUpperCase());
  }

  ctx.strokeStyle = "#ff6666";
  ctx.strokeRect(coreHitbox.x + 0.5, coreHitbox.y + 0.5, coreHitbox.width - 1, coreHitbox.height - 1);
  drawBossDebugPoint(coreHitbox.x + coreHitbox.width / 2, coreHitbox.y + coreHitbox.height / 2, "#ff6666", "CORE");

  const activeBodyConfig = getPrimaryBossBodyConfig() || bossSpriteConfig.body;
  const bodyRect = getBossBodySpriteRect(activeBodyConfig);

  if (bodyRect) {
    ctx.strokeStyle = debugConfig.bodyRectColor;
    ctx.strokeRect(bodyRect.x + 0.5, bodyRect.y + 0.5, bodyRect.width - 1, bodyRect.height - 1);
  }

  for (let i = 0; i < boss.legs.length; i++) {
    const leg = boss.legs[i];
    const legBox = getBossLegBox(leg);
    const previewLegRect = getBossPreviewLegDrawRect(leg);
    const pairConfig = bossSpriteConfig.legPairMapping[leg.role];
    const label = pairConfig.label + (leg.side === -1 ? "L" : "R");
    const collisionSegments = getBossLegCollisionSegments(leg);
    const legColor = getBossLegDebugColor(leg);

    ctx.strokeStyle = leg.alive ? debugConfig.hitboxColor : debugConfig.destroyedColor;
    ctx.strokeRect(legBox.x + 0.5, legBox.y + 0.5, legBox.width - 1, legBox.height - 1);
    drawBossDebugPoint(boss.x + leg.offsetX, boss.y + leg.offsetY, debugConfig.attachColor, label);

    if (previewLegRect && bossSpriteConfig.previewLegsEnabled) {
      ctx.strokeStyle = debugConfig.visualLineColor;
      ctx.strokeRect(previewLegRect.x + 0.5, previewLegRect.y + 0.5, previewLegRect.width - 1, previewLegRect.height - 1);
      drawBossDebugPoint(previewLegRect.x + previewLegRect.width / 2, previewLegRect.y + previewLegRect.height / 2, debugConfig.bodySpriteCenterColor, "");
    }

    const segments = getBossLegSegments(leg);

    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
      const segment = segments[segmentIndex];
      ctx.strokeStyle = segmentIndex === segments.length - 1 ? debugConfig.clawColor : debugConfig.segmentColor;
      ctx.strokeRect(segment.x + 0.5, segment.y + 0.5, segment.width - 1, segment.height - 1);
      drawBossDebugPoint(segment.x + segment.width / 2, segment.y + segment.height / 2, debugConfig.pivotColor, "");
    }

    for (let collisionIndex = 0; collisionIndex < collisionSegments.length; collisionIndex++) {
      const collisionSegment = collisionSegments[collisionIndex];
      const rect = collisionSegment.rect;
      ctx.strokeStyle = leg.alive ? legColor : debugConfig.destroyedColor;
      ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);
      drawBossDebugPoint(rect.x + rect.width / 2, rect.y + rect.height / 2, legColor, collisionSegment.id.toUpperCase());
    }
  }

  ctx.fillStyle = debugConfig.textColor;
  ctx.fillText(debugConfig.label, 20, 245);
  ctx.fillText("SRC " + activeBodyConfig.sourceRect.sx + "," + activeBodyConfig.sourceRect.sy + " " + activeBodyConfig.sourceRect.sw + "x" + activeBodyConfig.sourceRect.sh, 20, 262);
  ctx.fillText("DST " + Math.round(bodyRect ? bodyRect.x : 0) + "," + Math.round(bodyRect ? bodyRect.y : 0) + " " + Math.round(bodyRect ? bodyRect.width : 0) + "x" + Math.round(bodyRect ? bodyRect.height : 0), 20, 279);
  ctx.fillText("OFF " + (activeBodyConfig.visualOffsetX || 0) + "," + (activeBodyConfig.visualOffsetY || 0) + " SCALE " + (activeBodyConfig.destScale || 1), 20, 296);
  ctx.fillStyle = debugConfig.pairStateColor;
  ctx.fillText("P1 upper: " + (hasAliveBossLeg("upper") ? "ACTIVE" : "DESTROYED"), 20, 313);
  ctx.fillText("P2 middle: " + (hasAliveBossLeg("middle") ? "ACTIVE" : "DESTROYED"), 20, 330);
  ctx.fillText("P3 lower: " + (hasAliveBossLeg("lower") ? "ACTIVE" : "DESTROYED"), 20, 347);
  drawBossSpreadDebugOverlay(0);
  ctx.restore();
}

function drawBoss() {
  if (!boss.active || bossDeathSequence.bodyGone) {
    return;
  }

  const visualJitter = getBossVisualJitter();
  const destroyedPairs = getDestroyedBossLegPairCount();
  const rageBlink = boss.rageFlashTimer > 0 && Math.floor(boss.rageFlashTimer / 4) % 2 === 0;
  const unstableBlink = destroyedPairs > 0 && Math.floor(bossAnimationTimer / Math.max(5, 14 - destroyedPairs * 2)) % 2 === 0;

  ctx.save();
  ctx.translate(visualJitter.x, visualJitter.y);

  if (drawBossAssembledSprite(rageBlink)) {
    if (isGameplayDebugOverlayActive()) {
      drawBossDebugOverlay();
    }

    ctx.restore();
    return;
  }

  ctx.restore();
}

function drawBossHpBar() {
  if (!boss.active) {
    return;
  }

  const barWidth = canvas.width - 80;
  const barHeight = 16;
  const barX = 40;
  const barY = 15;
  const hpPercent = boss.hp / boss.maxHp;

  ctx.fillStyle = "#333333";
  ctx.fillRect(barX, barY, barWidth, barHeight);

  ctx.fillStyle = "#ff3333";
  ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);

  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("BOSS HP", canvas.width / 2, barY + 36);
  ctx.textAlign = "left";
}

function formatMissionTime() {
  const totalSeconds = Math.floor(missionTimer / 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (seconds < 10) {
    return minutes + ":0" + seconds;
  }

  return minutes + ":" + seconds;
}

function clearDevPhaseObjects() {
  enemies.length = 0;
  enemyBullets.length = 0;
  enemyHazardZones.length = 0;
  webBullets.length = 0;
  bossBullets.length = 0;
  stopBossMissileFlightLoop(true);
  bossWebBullets.length = 0;
  bossDangerZones.length = 0;
  particles.length = 0;
  impactFlashes.length = 0;
  spriteExplosions.length = 0;
  delayedExplosions.length = 0;
  delayedParticleBursts.length = 0;
  muzzleFlashes.length = 0;
  bossAttackTelegraphs.length = 0;
  explosionSoundCooldown = 0;
  hitPauseTimer = 0;
  resetBossDeathSequence();
  enemySpawnTimer = 0;
  boss.active = false;
  boss.introActive = false;
  boss.introTimer = 0;
  boss.introShakeTimer = 0;
  boss.hp = boss.maxHp;
  boss.hitFlash = 0;
  boss.rageFlashTimer = 0;
  boss.majorAttackLockTimer = 0;
  boss.lastDestroyedLegCount = 0;
  boss.destroyedPairBurstFlags = { upper: false, middle: false, lower: false };
  boss.nextAttackSide = { lower: -1, middle: 1, upper: -1 };
  boss.directionChangeTimer = 180;
  boss.speed = boss.baseSpeed;
  boss.shootDelay = boss.baseShootDelay;
  boss.webShootDelay = boss.baseWebShootDelay;
  boss.dangerZoneDelay = boss.baseDangerZoneDelay;
  bossCoreLaser.cooldownMax = bossCoreLaser.baseCooldownMax;
  resetBossCoreLaser();
  resetBossLegs();
  applyBossRageAttackDelays();
}

function jumpToNextMissionPhase() {
  const phaseStarts = [0, 15 * 60, 45 * 60, 75 * 60, 120 * 60];

  for (let i = 0; i < phaseStarts.length; i++) {
    if (missionTimer < phaseStarts[i]) {
      missionTimer = phaseStarts[i];
      gameUpdateAccumulator = 0;
      clearDevPhaseObjects();
      return;
    }
  }
}

function jumpToPreviousMissionPhase() {
  const phaseStarts = [0, 15 * 60, 45 * 60, 75 * 60, 120 * 60];
  let currentPhaseIndex = 0;

  for (let i = 0; i < phaseStarts.length; i++) {
    if (missionTimer >= phaseStarts[i]) {
      currentPhaseIndex = i;
    }
  }

  if (currentPhaseIndex > 0) {
    missionTimer = phaseStarts[currentPhaseIndex - 1];
    gameUpdateAccumulator = 0;
    clearDevPhaseObjects();
  }
}

function drawGameplayDebugOverlay() {
  if (!isGameplayDebugOverlayActive()) {
    return;
  }

  ctx.save();
  ctx.textAlign = "left";
  ctx.font = "11px Arial";
  ctx.lineWidth = 1.5;
  ctx.fillStyle = isGameplayDebugTechMode() ? "#93f4ff" : "#a7ffb0";

  const modeLabel = gameplayDebugOverlayMode === gameplayDebugOverlayModes.visual
    ? "DEBUG_VISUAL"
    : gameplayDebugOverlayMode === gameplayDebugOverlayModes.tech
      ? "DEBUG_TECH"
      : "NORMAL";

  ctx.fillText("MODE: " + modeLabel, 20, 228);
  ctx.fillText("DEBUG OVERLAY: gameplay collision", 20, 245);
  ctx.fillText("P=player  E=enemy  TM=enemy missile  BM=boss missile", 20, 262);
  ctx.fillText("DZ=tank circle / boss bounds  center markers show collision anchors", 20, 279);

  drawDebugOverlayRect(player, "#44ffcc", "PLAYER");
  drawBossDebugPoint(player.x + player.width / 2, player.y + player.height / 2, "#44ffcc", "P");

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const color = enemy.type === "tank" ? "#ffd966" : enemy.type === "web" ? "#88ccff" : enemy.type === "zigzag" ? "#ff9cff" : "#ffffff";
    drawDebugOverlayRect(enemy, color, getEnemyDisplayName(enemy.type).toUpperCase());
    drawBossDebugPoint(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, color, "");
  }

  for (let i = 0; i < enemyBullets.length; i++) {
    const bullet = enemyBullets[i];

    if (bullet.type !== "missile") {
      drawDebugOverlayRect(bullet, "#ffd27a", "ENEMY BULLET");
      continue;
    }

    drawDebugOverlayRect(bullet, "#ffb46a", "TANK MISSILE");
    drawBossDebugPoint(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, "#ffb46a", "");
  }

  for (let i = 0; i < webBullets.length; i++) {
    const bullet = webBullets[i];
    drawDebugOverlayRect(bullet, "#8ddcff", bullet.impacting ? "WEB HIT" : "WEB");
  }

  for (let i = 0; i < bossBullets.length; i++) {
    const bullet = bossBullets[i];

    if (bullet.type !== "missile") {
      drawDebugOverlayRect(bullet, "#ffc84a", "BOSS BULLET");
      continue;
    }

    drawDebugOverlayRect(bullet, "#ff6f4a", "BOSS MISSILE");
    drawBossDebugPoint(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, "#ff6f4a", "");
  }

  for (let i = 0; i < bossWebBullets.length; i++) {
    drawDebugOverlayRect(bossWebBullets[i], "#d5f7ff", "BOSS WEB");
  }

  if (bossCoreLaser.state === "active") {
    drawDebugOverlayRect(getBossCoreLaserBox(), "#ffffff", "CORE LASER", [6, 3], 2.5);
  }

  for (let i = 0; i < enemyHazardZones.length; i++) {
    const zone = enemyHazardZones[i];
    const circle = getTankHazardCircle(zone);
    const bounds = getTankHazardCircleBounds(zone);

    drawDebugOverlayRect(bounds, "#7cffb0", "TANK DZ", [4, 3], 2.5);
    drawDebugOverlayCircle(circle.x, circle.y, circle.radius, "#ffffff", "C", 3);
    ctx.save();
    ctx.fillStyle = "#7cffb0";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillText("R" + Math.round(circle.radius), circle.x + circle.radius + 16, circle.y - 2);
    ctx.restore();
  }

  for (let i = 0; i < bossDangerZones.length; i++) {
    const zone = bossDangerZones[i];
    drawDebugOverlayRect(zone, zone.state === "warning" ? "#ff9d66" : "#ff4a44", "BOSS DZ", [5, 3], 3);
    drawBossDebugPoint(zone.x + zone.width / 2, zone.y + zone.height / 2, zone.state === "warning" ? "#ff9d66" : "#ff4a44", zone.state === "warning" ? "W" : "A");
  }

  if (boss.active && !bossDeathSequence.bodyGone) {
    const visualJitter = getBossVisualJitter();

    ctx.save();
    ctx.translate(visualJitter.x, visualJitter.y);
    drawBossDebugOverlay();
    ctx.restore();
  }

  ctx.restore();
}

function drawMissionPhaseInfo() {
  const missionSeconds = Math.floor(missionTimer / 60);
  let phaseText = "PHASE: BASIC";

  if (missionSeconds >= 15 && missionSeconds < 45) {
    phaseText = "PHASE: BASIC + TANK";
  } else if (missionSeconds >= 45 && missionSeconds < 75) {
    phaseText = "PHASE: BASIC + TANK + ZIGZAG";
  } else if (missionSeconds >= 75 && missionSeconds < 120) {
    phaseText = "PHASE: ALL ENEMIES";
  } else if (missionSeconds >= 120) {
    phaseText = "PHASE: BOSS";
  }

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(phaseText, 20, 155);

  ctx.fillStyle = "#777";
  ctx.font = "12px Arial";

  if (showDevUi) {
    ctx.fillText("DEV: V next / C prev", 20, 180);
  }

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";

  if (missionSeconds >= 120 && !boss.active) {
    ctx.textAlign = "center";
    ctx.font = "32px Arial";
    ctx.fillText("BOSS INCOMING", canvas.width / 2, 120);

    ctx.textAlign = "left";
    ctx.font = "18px Arial";
  }
}

function drawPauseOverlay() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "42px Arial";
  ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);

  ctx.font = "18px Arial";
}

function drawGameStartFadeOverlay() {
  if (gameStartFadeTimer <= 0) {
    return;
  }

  const progress = gameStartFadeTimer / gameStartFadeDuration;
  gameStartFadeTimer--;

  ctx.save();
  ctx.globalAlpha = Math.min(0.78, progress);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function getBossIntroShakeOffset() {
  if (!boss.active || !boss.introActive || boss.introShakeTimer <= 0) {
    return { x: 0, y: 0 };
  }

  const intensity = boss.introTimer > boss.introDuration - 45 ? 1.5 : 3;

  return {
    x: (Math.random() - 0.5) * intensity,
    y: (Math.random() - 0.5) * intensity
  };
}

function getBossDeathShakeOffset() {
  if (!bossDeathSequence.active || bossDeathSequence.screenShakeTimer <= 0) {
    return { x: 0, y: 0 };
  }

  const fade = bossDeathSequence.screenShakeTimer / 115;
  const intensity = 8 * fade;

  return {
    x: (Math.random() - 0.5) * intensity,
    y: (Math.random() - 0.5) * intensity
  };
}

function getGameScreenShakeOffset() {
  const introShake = getBossIntroShakeOffset();
  const deathShake = getBossDeathShakeOffset();

  return {
    x: introShake.x + deathShake.x,
    y: introShake.y + deathShake.y
  };
}

function drawBossDeathOverlay() {
  if (!bossDeathSequence.active) {
    return;
  }

  if (bossDeathSequence.screenFlashTimer > 0) {
    const alpha = Math.min(0.42, bossDeathSequence.screenFlashTimer / 28);
    ctx.fillStyle = "rgba(255, 245, 220, " + alpha + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (bossDeathSequence.timer >= bossDeathSequence.victoryTextStart) {
    const pulse = Math.sin(bossDeathSequence.timer * 0.18) * 4;

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = (58 + pulse) + "px Arial";
    ctx.fillText("РџРћР‘Р•Р”Рђ!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.restore();
  }
}

function drawBossIntroWarning() {
  if (!boss.active || !boss.introActive) {
    return;
  }

  const blink = Math.floor(boss.introTimer / 12) % 2 === 0;

  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = blink ? "#ff3333" : "#ffffff";
  ctx.font = "44px Arial";
  ctx.fillText("Р’РќРРњРђРќРР•", canvas.width / 2, canvas.height / 2 - 55);
  ctx.font = "30px Arial";
  ctx.fillText("РћР‘РќРђР РЈР–Р•Рќ РљРР‘Р•Р РџРђРЈРљ", canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function drawGame() {
  const techMode = isGameplayDebugTechMode();

  if (techMode) {
    ctx.save();
    ctx.fillStyle = "#05050c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    drawVillageScrollBackground();
    drawWorldAtmosphere();
    drawAmbientAerialEffects();
  }

  const screenShake = getGameScreenShakeOffset();

  ctx.save();
  ctx.translate(screenShake.x, screenShake.y);
  if (!techMode) {
    drawBullets();
    drawEnemies();
    drawBoss();
    drawBossAttackTelegraphs();
    drawEnemyBullets();
    drawEnemyHazardZones();
    drawWebBullets();
    drawBossBullets();
    drawBossWebBullets();
    drawBossDangerZones();
    drawBossCoreLaser();
    drawImpactFlashes();
    drawSpriteExplosions();
    drawParticles();
  }
  drawGameplayDebugOverlay();
  ctx.restore();

  if (!techMode) {
    drawBossHpBar();

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";

    ctx.fillText("HP: " + Math.max(0, player.hp).toFixed(1), 20, 40);
    ctx.fillText("Score: " + score, 20, 95);
    ctx.fillText("Time: " + formatMissionTime(), 20, 125);
    drawMissionPhaseInfo();

    ctx.textAlign = "right";
    ctx.font = "14px Arial";
    ctx.fillText("Speed: " + formatTimeScale() + "x", canvas.width - 20, 32);
    ctx.textAlign = "left";
    ctx.font = "18px Arial";

    if (player.slowTimer > 0) {
      ctx.fillText("SLOWED", 20, 205);
    }

    if (isPlayerInvulnerable && showDevUi) {
      ctx.fillStyle = "#ffff66";
      ctx.font = "14px Arial";
      ctx.fillText("DEV GODMODE", 20, 225);
      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
    }

    drawBossDeathOverlay();

    drawPlayerHp();

    drawPlayerSpeedEffects();
    drawPlayerShip();
    drawMuzzleFlashes();

    drawBossIntroWarning();

    if (isPaused) {
      drawPauseOverlay();
    }

    drawGameStartFadeOverlay();
  }
}


    // =========================`r`n    // GAME LOOP`r`n    // =========================

    function gameLoop() {
      const currentFrameTime = performance.now();
      const deltaSeconds = Math.min((currentFrameTime - lastFrameTime) / 1000, 0.05);
      const scaledDeltaSeconds = deltaSeconds * timeScale;
      lastFrameTime = currentFrameTime;

      if (scene === "game" && !isPaused) {
        let updatesThisFrame = 0;

        gameUpdateAccumulator += scaledDeltaSeconds;

        while (gameUpdateAccumulator >= fixedUpdateStep && updatesThisFrame < maxFixedUpdatesPerFrame) {
          update();
          gameUpdateAccumulator -= fixedUpdateStep;
          updatesThisFrame++;
        }

        if (updatesThisFrame >= maxFixedUpdatesPerFrame) {
          gameUpdateAccumulator = 0;
        }
      } else {
        gameUpdateAccumulator = 0;
        update();
      }

      draw();

      requestAnimationFrame(gameLoop);
    }

    gameLoop();

