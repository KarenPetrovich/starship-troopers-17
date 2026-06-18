# BOSS REBUILD PLAN

## Purpose

Create a separate Boss Lab for rebuilding the boss from scratch using the existing game systems and existing assets only.

This branch must not modify the live boss in the main game.

## Hard Constraints

- Do not add new sprite assets.
- Do not create new art.
- Do not change the current boss, hitboxes, collision, attacks, dangerous zones, or animations in the main game.
- Reuse the existing boss art, leg art, effects, missiles, danger zone sprites, damage feedback, and debug overlay systems.
- Keep the main game unchanged during the Boss Lab setup stage.

## Audit Summary

The current boss implementation is concentrated in `js/game.js` and is driven by these core state holders:

- `boss`
- `bossSpriteConfig`
- `bossAssembledSpriteConfig`
- `bossDamageAnchorConfig`
- `bossDamageAnchorByLeg`
- `bossCoreLaser`
- `bossBullets`
- `bossWebBullets`
- `bossDangerZones`
- `bossAttackTelegraphs`
- `bossDeathSequence`
- `boss.damageEmitters`

The boss is already split into three logical attack roles:

- upper pair -> boss missile launch; missile explosion creates boss dangerous zone
- middle pair -> web attack
- lower pair -> spread shot

The current architecture is functional, but it is layered enough that visual ownership, collision ownership, and fallback rendering can drift apart if we keep extending it inside the main game.

## Boss Destruction Rewrite Status

The damaged-boss replacement attempt was a failure and has been rolled back.

What was tried:

- crop-based stage exports for lower-leg fragments
- stage1 / stage2 replacement logic
- hp-based visual stage transitions
- placeholder / stub leg fallbacks
- hybrid overlay-style replacement paths
- damaged-boss direct replacement with debug clip / mask experiments

What broke:

- the damaged draw path produced fragmented rectangles, island-like pieces, and worse geometry than the source art
- debug iterations changed draw rectangles and made the live render unstable
- the resulting visual quality was worse than the original boss render

Current stable state:

- `leg.alive === true` -> draw the normal leg from `boss_2.png`
- destroyed-leg damaged replacement is disabled
- the live boss render is back on the original assembled `boss_2.png` pipeline

## System Map

### Body

- Create:
  - `boss` state in `js/game.js`
  - body sprite config in `bossSpriteConfig.body`
  - assembled body in `bossAssembledSpriteConfig.parts.body`
- Update:
  - `moveBoss()`
  - `updateBossIntro()`
  - `updateBossRage()`
  - `updateBossDeathSequence()`
- Draw:
  - `drawBossAssembledPart("body")`
  - no placeholder body fallback in the live path
- Source of truth:
  - `boss.x`, `boss.y`, `boss.width`, `boss.height`
  - `getBossBodyHitbox()`
  - `boss.hp`

### Upper Legs

- Create:
  - `resetBossLegs()`
  - upper leg entries in `boss.legs`
  - upper leg part data in `bossAssembledSpriteConfig.parts.upperLeft` and `upperRight`
- Update:
  - `moveBoss()`
  - `handleBossShooting()`
  - `updateBossRage()`
  - `updateBossDamageEmitters()`
- Draw:
  - `drawBossAssembledOwnedLeg()`
  - destroyed legs are not routed through a damaged replacement branch in the stable render
- Source of truth:
  - each upper leg object in `boss.legs`
  - `leg.alive`
  - `leg.hp`
  - `getBossLegBox(leg)`
  - `getBossDamageAnchorPoint("upperLeftLeg_anchor" / "upperRightLeg_anchor")`

### Middle Legs

- Create:
  - `resetBossLegs()`
  - middle leg entries in `boss.legs`
  - middle leg part data in `bossAssembledSpriteConfig.parts.middleLeft` and `middleRight`
- Update:
  - `moveBoss()`
  - `handleBossShooting()`
  - `updateBossRage()`
  - `updateBossDamageEmitters()`
- Draw:
  - `drawBossAssembledOwnedLeg()`
  - destroyed legs are not routed through a damaged replacement branch in the stable render
- Source of truth:
  - each middle leg object in `boss.legs`
  - `leg.alive`
  - `leg.hp`
  - `getBossLegBox(leg)`
  - `getBossDamageAnchorPoint("middleLeftLeg_anchor" / "middleRightLeg_anchor")`

### Lower Legs

- Create:
  - `resetBossLegs()`
  - lower leg entries in `boss.legs`
  - lower leg part data in `bossAssembledSpriteConfig.parts.lowerLeft` and `lowerRight`
- Update:
  - `moveBoss()`
  - `handleBossShooting()`
  - `updateBossRage()`
  - `updateBossDamageEmitters()`
- Draw:
  - `drawBossAssembledOwnedLeg()`
  - destroyed legs are not routed through a damaged replacement branch in the stable render
- Source of truth:
  - each lower leg object in `boss.legs`
  - `leg.alive`
  - `leg.hp`
  - `getBossLegBox(leg)`
  - `getBossDamageAnchorPoint("lowerLeftLeg_anchor" / "lowerRightLeg_anchor")`

### Hitboxes

- Create:
  - `getBossBodyHitbox()`
  - `getBossCoreHitbox()`
  - `getBossLegCollisionSegments()`
  - `getBossOwnedLegClipRectFromHitbox()`
- Update:
  - `checkBulletBossCollisions()`
  - `drawGameplayDebugOverlay()` / boss debug overlay
- Draw:
  - overlay rectangles and anchor markers in debug mode
- Source of truth:
  - the collision data returned by `getBossBodyHitbox()`, `getBossCoreHitbox()`, and `getBossLegCollisionSegments()`

### Damage System

- Create:
  - `checkBulletBossCollisions()`
  - `getBossBodyDamageMultiplier()`
  - `setBossDebugLastHit()`
  - `logBossLegDestroyedVisual()`
- Update:
  - `checkBulletBossCollisions()`
  - `updateBossRage()`
  - `startBossDeathSequence()`
- Draw:
  - hit flash overlays
  - destruction feedback that does not alter the damaged-leg replacement geometry
- Source of truth:
  - `boss.hp`
  - `leg.hp`
  - `leg.alive`
  - `boss.hitFlash`
  - `leg.hitFlash`

### Attacks

- Create:
  - `fireBossSpreadShot()`
  - `fireBossAimedWebShot()`
  - `launchBossDangerZoneMissile()`
  - `updateBossCoreLaser()`
- Update:
  - `handleBossShooting()`
  - `moveBossBullets()`
  - `moveBossWebBullets()`
  - `updateBossCoreLaser()`
- Draw:
  - `drawBossBullets()`
  - `drawBossWebBullets()`
  - `drawBossCoreLaser()`
- Source of truth:
  - `boss.shootTimer`
  - `boss.webShootTimer`
  - `boss.dangerZoneTimer`
  - `bossCoreLaser.state`
  - `bossCoreLaser.timer`
  - the leg alive state for the relevant pair

### Dangerous Zones

- Create:
  - `spawnBossDangerZone()`
  - `getBossDangerZoneRect()`
  - `explodeBossDangerZoneMissile()`
- Update:
  - `updateBossDangerZones()`
  - `moveBossBullets()`
- Draw:
  - `drawBossDangerZones()`
  - `drawBossHazardZone()`
- Source of truth:
  - each object in `bossDangerZones`
  - its `state`, `timer`, `centerX`, `centerY`, and `radius`

### Boss Missiles

- Create:
  - `launchBossDangerZoneMissile()`
  - `bossBullets.push(...)` with `missileVariant: "boss"`
- Update:
  - `moveBossBullets()`
  - `explodeBossDangerZoneMissile()`
- Draw:
  - `drawBossBullets()`
  - `drawProjectileSprite(...)` using the boss missile sprite
- Source of truth:
  - each missile object in `bossBullets`
  - `launchTimer`, `speedX`, `speedY`, `speed`, `turnRate`, `life`

### Overlay / Debug

- Create:
  - `drawGameplayDebugOverlay()`
  - `drawBossDebugOverlay()`
  - `drawBossDebugPoint()`
  - `drawBossDebugAxes()`
- Update:
  - debug mode selection in the global overlay mode
- Draw:
  - body boxes
  - leg boxes
  - collision segments
  - anchors
  - last-hit markers
- Source of truth:
  - the same collision data and anchor data used by gameplay

## Why Boss_test Reads Better

Boss_test is a useful reference because it keeps the geometry chain tighter.

The main patterns worth reusing are:

- collision is derived from the same assembled part geometry that the boss uses for drawing
- the debug overlay shows the same owned geometry that gameplay uses
- the boss has fewer fallback branches, so the visible part and the collision part are less likely to diverge
- leg motion is modest, so the readable silhouette does not drift away from the collision model as much
- the hit scoring path is more explicit about choosing the best overlapping leg segment

That makes Boss_test a better reference for architecture than for raw content.

## Minimal Boss Lab Plan

1. Create a standalone Boss Lab page.
2. Add a blank boss canvas area and an explanatory sidebar.
3. Keep the lab isolated from the main game boot path.
4. Reuse the existing asset set only.
5. Rebuild the boss in a new, simpler ownership chain:
   - body geometry
   - leg geometry
   - collision geometry
   - attack geometry
   - debug overlay geometry
6. Verify one subsystem at a time before combining them.

## Files To Create

- `boss_lab.html`
- future lab runtime files, if needed, under a dedicated boss-lab script path
- future lab notes, if needed, under the project docs

## Reused Systems

- existing sprite loading
- existing projectile systems
- existing explosion system
- existing damage feedback helpers
- existing debug overlay helpers
- existing boss missile and danger-zone assets
- existing audio helpers
- existing canvas/game loop utilities

## Dependencies To Exclude

- no new art pipeline
- no new sprite sheet creation
- no main-game boss refactor during lab setup
- no new enemy systems
- no new level systems
- no collision rewrite outside the boss rebuild scope
- no UI redesign outside the lab shell

## Notes For The Next Pass

- keep the main game frozen while the lab is being prepared
- use the lab to prove a cleaner geometry pipeline before any future replacement work
- if the lab needs a new helper, create it only inside the lab path first

## Boss Lab Progress

- Stage 1 completed: static boss skeleton created in `boss_lab.html` + `js/boss_lab.js`
- the lab now has a standalone canvas runtime, centered boss layout, and always-on debug overlay
- body and all six legs now live in one readable data structure with shared anchor, sprite reference, visual rect, hitbox rect, and state fields
- Stage 2 completed: the lab now renders the real boss parts from `assets/sprites/boss_2.png`
- boss masks are not separate asset files; transparency is generated at runtime from the part images themselves
- the Stage 2 render path stays intentionally simple: part data -> part image -> overlay
- Stage 3 completed: the lab now supports overlay mode switching, group isolation, lower-leg focus inspection, and on-screen part diagnostics
- lower-leg inspection now exposes selected part metadata directly on screen so missing segments or mask-eaten pixels can be checked visually instead of inferred from code
- image-load debug pass: `assets/sprites/boss_2.png` exists and the source file is valid at `1536x1024`
- probable root cause of the "missing boss" report is not a missing asset file, but that the lab moved into part-based masked rendering before first proving a raw full-sheet draw on screen
- Stage 4 completed: Boss Lab now keeps the full `boss_2.png` visible and overlays 7 manual diagnostic regions on demand with `SPACE`
- this stage deliberately avoids masks, hitboxes, and part extraction so the region layout can be judged against the untouched source image first
- Stage 5 completed: Boss Lab can now switch with `R` between the full `boss_2.png` sheet and a static boss reassembled from 7 sourceRect parts
- the Stage 5 diagnostics compare the reassembled result against the untouched source image and report any visual divergence instead of hiding it with workaround logic
- Stage 5 control fix: `R` was technically wired, but the result was not obvious enough because the lab had no on-screen mode panel and the assembled parts were drawn back into the same source positions
- Boss Lab now has explicit Russian HTML buttons for full image, assembled image, show regions, and hide regions, plus a persistent current-mode label and `Собрано частей: X / 7` indicator
- assembled mode is now visually distinct: the full sheet is not drawn, a diagnostic backdrop is shown, and only the 7 selected `sourceRect` parts are rendered
- Boss Lab direction changed: the PNG reassembly line is stopped because it does not answer the destruction-state architecture question
- current lab pass keeps full `boss_2.png` as the base visual and adds independent `alive` / `destroyed` state for all six legs
- destroyed legs are hidden with temporary diagnostic occlusion rectangles only; no attacks, collision, HP, effects, animation, old boss render, or final stump visuals are introduced
- Boss Lab playable prototype pass: `boss_lab.html` now boots directly into an isolated boss fight with player movement, shooting, player HP, boss body HP, six leg HP pools, manual boss hitboxes, `B` overlay, and `R` restart
- the first playable prototype briefly used simplified local attack placeholders, but that direction is now stopped
- Boss Lab should not maintain Boss Lab-only copies of existing attacks, effects, dangerous zones, or destruction systems
- Boss Lab correction: simplified local boss attack copies are stopped; existing main-game attacks/effects should be connected later through adapters instead of being rewritten in the lab
- current Boss Lab priority is the new leg ownership model: each leg has its own state, visual region, and non-overlapping hitbox segments
- Boss Lab overlay now uses the same segment data as collision and reports the last hit as leg id + segment id + damage
- main-game boss missile update: boss dangerous zones are created by boss missile explosions, including direct player collision and boss-only proximity detonation with a short high-pitched warning beep; tank missile remains unchanged
- Integration step 1 completed: the main game now uses the Boss Lab segmented hitbox structure for boss bullet collision
- integrated data: 6 body segments and 5 segments for each of the 6 legs
- `B` debug overlay in the main game draws the segmented body/leg collision data and reports last hit owner, segment, and damage
- no boss attacks, missiles, dangerous zones, smoke, sparks, explosions, audio, phases, destruction state, or visual render branches were changed for this integration step
- player contact collision with boss legs remains on the legacy path for this step; only player bullet hits and debug hitbox overlay use the new Boss Lab segmented model

## Current Close-Out State

- Boss Lab is no longer just a setup experiment; it is the active boss diagnosis environment used to prove boss geometry and ownership safely outside the live fight
- the segmented boss model is established and successful:
  - body: 6 collision segments
  - each leg: 5 collision segments
- cross-leg overlap for the new bullet-hit geometry has been removed
- the segmented hitbox model is now integrated into the main game for boss bullet collision and debug reporting
- the lower-leg missing visual segment is restored in the main game
- the regression where middle-leg destruction influenced the upper-leg visual is fixed
- boss missile behavior now includes boss-only proximity detonation and a warning beep
- destroyed-leg smoke is back on screen, and style tuning is in progress without intentionally reducing emitter intensity

## What Worked

- Boss Lab creation and continued use as a separate verification tool
- honest segmented hitbox ownership
- diagnosable per-leg hits
- transfer of the segmented hitbox model into the main game
- lower-leg visual restoration
- isolation fix for middle-leg destruction vs. upper-leg visual ownership

## What Did Not Work

- trying to rescue the old lower-leg visual through partial visual / mask pipeline edits
- incremental lower-leg visual fixes inside the old render path before switching to Boss Lab visual-region logic
- temporary destroyed-leg stump experiments that made the cut shapes too large and too sharp
- over-weakening the smoke effect until it disappeared visually
- very early Boss Lab UX, which was too technical and not immediately useful as a user-facing inspection tool

## Still Unfinished

- destroyed-leg stump visuals are not approved
- the current stump treatment is still too large, too sharp, and too artificial
- smoke style still needs refinement so it keeps intensity without reading as a glowing blurry cloud
- boss missile still needs another focused validation pass

## Tomorrow Plan

1. Develop a strategy for fixing destroyed-leg visuals without breaking the segmented hitbox model.
2. Re-check boss missile collision, proximity detonation, warning beep, and dangerous-zone creation after explosion.
3. Add collision-triggered enemy explosions:
   - normal enemy dies on player collision
   - zigzag enemy dies on player collision
   - web enemy dies on player collision
   - tank survives but takes 50% max HP damage
4. Create more readable projectile visuals for zigzag, web, and the remaining boss attacks except the missile.

## 2026-06-07 Close-Out Addendum

What succeeded today:

- Boss Lab stayed the separate verification path for boss geometry work
- the segmented hitbox model remained in the main game for boss bullet collision and debug reporting
- the body remains split into 6 segments
- each leg remains split into 5 segments
- the lower leg remains fully restored in the live game
- middle-leg destruction no longer bleeds into the upper-leg visual
- the boss missile has proximity detonation plus a warning beep
- destroyed-leg smoke is back and the intensity is still in the target range

What did not work:

- trying to salvage the old lower-leg visual with partial visual / mask pipeline fixes
- partial fixes for the missing lower-leg segment
- stump experiments that made the destroyed legs too large, sharp, and unnatural
- smoke weakening that pushed the effect out of visibility
- early Boss Lab UX that was too technical for a comfortable inspection tool

Current unfinished work:

- destroyed-leg visual styling
- smoke style refinement without losing intensity
- another focused validation pass for the boss missile

Tomorrow plan:

1. Develop a strategy for fixing destroyed-leg visuals without breaking the segmented hitbox model.
2. Improve the boss missile behavior by checking collision, proximity detonation, warning beep, and the post-explosion dangerous zone.
3. Add collision-triggered explosions for regular enemies:
   - normal enemy dies
   - zigzag enemy dies
   - web enemy dies
   - tank takes 50% max HP damage instead of dying
4. Create readable projectile visuals for zigzag enemy, web enemy, and the remaining boss attacks except the missile.
