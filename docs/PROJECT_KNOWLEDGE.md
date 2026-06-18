# Cyber Spider Shooter Knowledge System

This document replaces the old skills-first approach.

The project now uses one unified knowledge system that combines:
- local project notes
- external Markdown guides in `C:\Future\Codex_Skills\external\`
- project-specific gameplay rules
- visual readability rules
- performance constraints

The goal is simple:
- preserve readability
- preserve gameplay clarity
- preserve the arcade feel
- avoid adding systems that do not improve the fight

## Repository Layout

The current project structure is authoritative:

```
cyberspider/
  index.html
  boss_lab.html
  package.json
  .gitignore
  assets/
  js/
  docs/
  tools/
```

Root files are intentionally limited to:

- `index.html`
- `boss_lab.html`
- `package.json`
- `.gitignore`

Documentation lives in `docs/`.
Utility scripts live in `tools/`.

## Codex Low-Cost Workflow

Use these rules by default for all future tasks in this project.

1. Do not recalculate:
- already validated segments
- component analysis without changes
- assembly-safe checks unless needed

2. Do not generate extras:
- image previews unless requested
- diffs without a clear reason
- extra visual checks

3. Work locally:
- change only the requested file or segment
- do not read the whole project unless needed
- do not touch other system parts

4. One task equals one verification:
- verify only the requested criterion
- do not add extra tests
- do not do repeated passes

5. No initiative beyond request:
- do not improve without request
- do not optimize without request
- do not change architecture

6. Minimal computation:
- avoid repeated image processing work
- do not rebuild assets without a reason

7. Do not touch stable areas:
- segmentation, ownership, and PNG assets are treated as final
- do not return to already solved tasks

## Core Areas Of Knowledge

1. Level Design
- decides what happens in the stage
- controls pacing, encounter order, and stage structure
- defines how the player moves through the level

2. Environment / World Design
- defines what kind of world the stage is
- keeps the background and stage identity coherent
- supports the level without turning into decoration only
- confirmed project finding: one large readable environment object is stronger than a collection of abstract panels when the goal is to make the player feel like they are flying beside a real place
- large open space around the object helps scale perception and keeps the stage readable
- confirmed project finding: when a ready-made top-down scene already contains strong road logic, building density, and a clear destination point, a single full-scene image can be a valid level base for a vertical shooter
- for this project, that image base must still preserve honest readability, avoid extra decorative layers, and keep the boss timing aligned to the level scroll

3. Visual Composition / Hierarchy
- decides what the player sees first
- controls contrast, scale, spacing, and focal points
- keeps combat information readable against the scene
- must preserve small-screen readability when deciding decorative placement, especially in the lower part of the playfield
- player, hitbox, bullets, and nearby threats must remain visually clear even when atmosphere or overlay effects are present

4. Rendering / Canvas
- decides how the game is drawn
- handles draw order, layering, and canvas behavior
- supports parallax, overlays, and sprite presentation
- current village background audit: `drawVillageScrollBackground()` uses a 1:1 draw of `assets/background/village_level_main.png` with `ctx.imageSmoothingEnabled = false`, integer `x` positioning, and `Math.round()` on the vertical offset, so the background itself is not being scaled or transformed inside the draw call
- the active browser viewport for the current session measured `366x558` canvas buffer/client size with `window.devicePixelRatio = 1.5`; there is no CSS width/height override on the canvas, so there is no extra HTML/CSS scaling beyond the browser's normal device-pixel presentation
- because the source image is `741px` wide, only `49.39%` of its width is visible at once in that viewport; the remaining side area is real offscreen content rather than a render bug
- with the remaining draw path already integer-snapped, any leftover shimmer is more likely coming from the source image's diagonal/pixel-art contours and the intentional scroll cadence than from a hidden render-space transform
- boss destruction rendering was temporarily redirected toward a damaged-boss replacement pipeline, but that attempt failed because the damaged source plus debug clip/mask work produced fragmented rectangles and a worse render than the original; the project returned to the stable `boss_2.png` boss draw path

5. Animation / 2D Effects
- defines how sprites move, flash, pulse, and transition
- communicates state changes through motion
- supports timing, impact, and readability

6. Collision / Hitboxes
- defines where gameplay interactions actually happen
- must remain data-driven and honest
- must stay separate from decorative rendering

7. Game Feel / Juice / Feedback
- defines the emotional response to actions
- combines motion, sound, timing, and feedback
- must help the player understand the action

8. UI / HUD Design
- shows the player what matters right now
- Canvas keeps gameplay HUD, warnings, and combat overlays
- HTML/CSS handles main menu, settings, titles, results, and other non-game screens
- the UI should feel atmospheric first through illustrated backgrounds, then through typography and custom button shapes
- `Space_Game_GUI_PNG` is optional component stock, not the main UI philosophy

9. Audio / Music / Sound Design
- defines the sound layer for shots, hits, warnings, explosions, and boss moments
- supports atmosphere and timing
- must not drown out gameplay readability

10. Projectile Readability
- defines how bullets, beams, webs, and hazards are recognized
- keeps threat clarity high under motion and density
- is critical for shmup and arcade combat

11. Performance Optimization
- protects frame rate and input feel
- keeps rendering stable during effects-heavy moments
- prevents polish from breaking responsiveness

12. Results / Ranking
- defines the end-of-run summary, score breakdown, rank, and leaderboard flow
- current project rule: boss body must award points and must be treated as one of the high-value score sources
- current project rule: letter ranks are no longer the primary candidate
- current project direction: Russian school-grade scale with short variants, with `2 / 3- / 3 / 4- / 4 / 5- / 5 / 5+` as the recommended final form
- `FINAL_RANK_SYSTEM.md` is the approval document for the final rank table
- `RUN_ANALYTICS_RUNTIME.md` is the runtime data source for results, commentary, and ranking
- the final rank scale must stay readable on mobile and must match the real score economy of the current demo

## Boss Segmentation Knowledge

- `assets/sprites/boss_2.png` is the untouched boss baseline for segmentation validation
- permanent segmented leg outputs live in `assets/sprites/boss_segments/`
- files in `assets/sprites/boss_segments/` are the approved detachable leg ownership exports for boss reconstruction and future gameplay integration
- Boss Lab is a permanent project tool:
  - `boss_lab.html`
  - `js/boss_lab.js`
- Boss Lab files must remain in the working project and are not archive candidates
- boss segmentation must always validate both reverse assembly and destroyed-state readability
- `upperLeft` is the validated reference workflow that proved the process before the remaining legs were accepted
- final segmentation state is complete for all 6 legs
- final assembly-safe state is `missing = 0`, `extra = 0`, `changed = 0`
- final segment component state is `1` visible component and `disconnected = 0` for every leg export
- current runtime rule for destroyed lower legs: do not modify body, do not use masks, and render only the matching stump overlay instead of the live lower-leg segment
- destroyed-state solving is separate from segmentation and ownership
- Boss Lab is useful for inspection, but it is not the source of truth for final destroyed-state approval
- current Boss Lab destroyed-state can still disagree with the approved preview, especially for lower legs

### Validated Leg Segmentation Workflow

1. define the real mechanical seam first
2. assign every visible pixel to one owner only
3. export only the leg's own connected visible component
4. verify `body-only` after every accepted leg
5. verify assembly-safe with `missing = 0`, `extra = 0`, `changed = 0`
6. verify destruction-safe on the removed-leg preview
7. verify component analysis with `disconnected = 0`

### Boss Production Workflow

1. add one leg at a time
2. validate ownership against body and neighboring legs
3. validate `body-only`
4. validate assembly-safe
5. validate destruction-safe
6. move the result into gameplay only after all required checks pass

### Destroyed-State Direction

- segmentation completion does not mean destroyed-state polish is finished
- lower-leg destroyed read must be solved in runtime separately from segmentation
- the correct lower-leg direction is `socket-only` through body-side masking
- stump-PNG-first fixes and broad mask cleanup were unstable for the lower legs
- if lower-leg destruction regresses into long stumps or extra body-owned extensions, fix the runtime destroyed-state path instead of reopening segmentation

### Failed Approaches To Avoid

- vertical leg cuts
- stump-PNG-first attempts for lower-leg destroyed read
- ignoring disconnected components during segmentation
- trying to repair destroyed-state by changing ownership after segmentation was already validated

## Knowledge Relationships

- `level design` -> structure of the level, pacing, encounter order
- `environment` -> what world the level belongs to
- `environment` -> what world the level belongs to, and whether the player is reading a place or just geometry
- `composition` -> what the player notices first
- `projectiles` -> how combat threats are read
- `rendering` -> how the scene is actually drawn
- `animation` -> how things move and communicate state
- `collision` -> where hits truly happen
- `game feel` -> how the action feels in motion
- `ui` -> what the player is told
- `audio` -> what the player hears
- `performance` -> how stable the game remains while everything above is happening

## Required Application Order

Always apply the domains in this order:

1. level design
2. environment
3. composition
4. projectiles
5. rendering
6. animation
7. collision
8. game feel
9. ui
10. audio
11. performance

This order matters because later decisions must not break earlier readability decisions.

## When Each Area Is Mandatory

- background -> `level design` + `environment` + `composition`
- stage progression -> `level design` + `environment`
- enemy placement -> `level design` + `composition`
- large flyby megastructures -> `environment` + `composition` + `level design`
- bullets / beams / webs -> `projectiles` + `composition` + `game feel`
- enemy sprites / effects -> `animation` + `rendering`
- hitboxes / damage zones -> `collision`
- explosions / impact / camera response -> `game feel` + `animation`
- HUD / menus -> `ui` + `composition`
- warnings / boss cues / impact audio -> `audio` + `game feel`
- heavy particle or canvas moments -> `performance`

## Project Rules

- project decisions must go through readability first
- project decisions must respect visual priority
- project decisions must respect gameplay impact
- no hidden complexity that makes combat harder to read
- no visual polish that weakens hit clarity
- all new visual effects must be checked for smartphone readability before they are accepted
- no system should be added just because it is technically interesting
- asset sourcing must not contaminate the active tree with temporary downloads or scratch exports
- UI work should be screen-by-screen; the main menu is the next screen
- do not reopen CSS-first as a separate philosophy
- do not treat `Space_Game_GUI_PNG` as the UI foundation
- do not search for a new UI pack as a standing task
- main background art belongs in `assets/background/`, not in the project root
- any abandoned environment experiments should be archived in `C:\Future\CyberSpider_Archive`, not left in the active background folders
- when users provide downloaded asset archives, unpack them into the requested tileset folders and move the original archives into `C:\Future\CyberSpider_Archive\asset_downloads`
- keep temporary download byproducts out of the active asset tree so a fresh session can resume from clean, named folders
- never move or delete a project file by assumption; confirm actual usage first
- confirmed temp PNG checks, preview exports, debug exports, and obsolete segmentation intermediates may be archived to `C:\\Future\\CyberSpider_Archive`
- if there is doubt about a file, it stays in the project

## Current Gameplay / Results State 2026-06-14

- The canonical enemy names in runtime are now `Таран`, `Паучок`, and `Зигзаг`.
- The enemy sizing pass is part of the active gameplay baseline: basic and web enemies are enlarged by 15 percent, zigzag is enlarged by 10 percent.
- The run-results system is implemented in-game.
- The result flow includes a summary view, a details view, a random commentary line, the score, run time, battle result, and leaderboard placeholder.
- The result screen is grade-based, with the approved target scale `2 / 3- / 3 / 4- / 4 / 4+ / 5- / 5 / 5+`.
- Victory guarantees at least `4`.
- The detailed result screen tracks kills by type, total damage, hit count, slowdown applications, surviving missiles and danger zones, critical HP time, and death reason.

## UI Status 2026-06-14

- Canvas stays for gameplay, HUD stub, battle warnings, and in-game overlays.
- HTML/CSS stays for main menu, settings, titles, results, and other non-game screens.
- The UI foundation is the drawn thematic background plus HTML/CSS interface plus game typography plus custom button shapes.
- `Space_Game_GUI_PNG` is optional component stock, not the UI foundation.
- `UI_KIT_V2` is archived as an active course.
- `Start_BTN`, `Table`, and pack-centered menu assembly are rejected experiments.
- CSS-first as a separate philosophy is archived.
- One screen at a time remains the rule.
- The next UI target is still the main menu, after the current gameplay and results work is stable.

## Project Structure Rules

- `C:\Future\cyberspider` contains only the current working version of the game
- all archive materials live only in `C:\Future\CyberSpider_Archive`
- full project backups for rollback, restore, replacement of large files, and mass refactors must be created in an external archive folder, not inside the working project tree
- before any rollback or large replacement:
  - create a full backup of the project in `C:\Future\CyberSpider_Archive`
  - save the files that will be changed separately
  - record the backup path in the report
  - include the inverse restore path / restore steps in the report
- old backgrounds, rejected level candidates, experimental images, and temporary outputs must not stay in the project root
- after an experiment finishes, temporary materials are either removed or archived
- active resource names should stay technical and stable, and any rename must update every live reference before the old file is archived
- background experiments should be stored in an archive subfolder that clearly identifies the experiment type and candidate set

## Source Shelf

The main external notes live in:
- `C:\Future\Codex_Skills\external\level_design`
- `C:\Future\Codex_Skills\external\environment`
- `C:\Future\Codex_Skills\external\composition`
- `C:\Future\Codex_Skills\external\rendering`
- `C:\Future\Codex_Skills\external\animation`
- `C:\Future\Codex_Skills\external\collision`
- `C:\Future\Codex_Skills\external\game_feel`
- `C:\Future\Codex_Skills\external\ui`
- `C:\Future\Codex_Skills\external\audio`
- `C:\Future\Codex_Skills\external\projectiles`
- `C:\Future\Codex_Skills\external\performance`

## How To Use This System

When starting a task:
1. identify the level / environment / composition problem first
2. decide whether projectile readability is part of the issue
3. decide how the scene is rendered and animated
4. check collision honesty
5. add game feel only after the core read is correct
6. finish with UI, audio, and performance checks

If a change improves spectacle but weakens readability, it is not done yet.

## Codex Workflow

This project uses a permanent low-cost workflow for Codex tasks.
Apply these rules in all future work unless the user explicitly asks for a different approach:

1. Do not re-check already validated segments, unchanged component analysis, or assembly-safe checks.
2. Do not generate extra previews, diffs, or visual checks unless they are explicitly needed.
3. Work locally and touch only the requested file or segment.
4. Treat one task as one verification target. Do not add extra tests or repeated passes.
5. Do not improve, optimize, or change architecture unless asked.
6. Minimize computation. Avoid repeated image processing and unnecessary asset rebuilds.
7. Leave stable results alone. Segmentation, ownership, and PNG outputs are final unless the user asks to revisit them.

## Session Findings 2026-06-02

### Player

- long fighter silhouettes expose turn and pivot problems more clearly than shorter ships
- a plain rotation does not automatically communicate a real roll on a top-down shooter sprite
- perspective on the aircraft sprite is critical; a slightly 3/4-looking jet can conflict with a strict top-down world even when it is detailed
- exhaust asymmetry should be completely neutral when the player is not turning, then only appear during actual left/right movement
- aggressive color flattening can make a fighter read as a gray blob, so any cleanup should stay minimal, symmetric, and detail-preserving
- the fourth June 2 fighter candidate, once tightly cropped, became the active player sprite and was saved as `assets/sprites/player_fighter.png`
- the discarded June 2 player candidates were archived to `C:\Future\CyberSpider_Archive\dev_unused\player_sprite_candidates_2026-06-02`

## Session Close Workflow

After every completed session:

1. Update the project documentation.
2. Record successful and failed experiments.
3. Perform project cleanup as an orderly docs/tools layout pass plus moving only truly temporary materials into `C:\Future\CyberSpider_Archive`.
4. Do not archive used assets, Boss Lab, or tools by assumption.
5. Verify that the project still runs correctly.

## Current State 2026-06-11

- ordinary enemy HP is doubled for:
  - basic
  - tank
  - zigzag
  - web
- tank missile attack frequency is 20 percent higher than before
- boss missile launch frequency is doubled
- boss HP, boss legs, boss body segments, and boss collision ownership remain unchanged
- player collision behavior against basic, zigzag, web, tank, and boss remains intact
- boss laser audio is currently in a diagnostic mute state from the recent investigation work
- boss laser visual logic remains active and unchanged in gameplay timing
- temporary zigzag crop exports were archived to `C:\Future\CyberSpider_Archive`

### Environment

- random village campfires, window flicker, and stray spark-like VFX were not readable from the gameplay camera and were rejected
- a pseudo-parallax layer built from large cropped pieces of the village PNG was also too subtle to justify the complexity
- promising directions for future atmosphere work are infected boss-zone ground, cloud overlays, air streaks, and wind streaks

### Game Feel

- the best results came from keeping the ship visually heavy but readable rather than chasing a lot of side movement
- if a turn effect mainly reads as sideways travel, it is too strong for this game

### Composition

- the player must stay visually centered and clearly separate from the bubble shield
- the godmode bubble needs enough margin that no wing or tail visually touches its border
- large readable silhouette beats high detail if the game camera is small

## Session Findings 2026-06-03

### Player

- the final player exhaust base stays locked to `assets/sprites/player_fighter.png` and should not be reopened without a new explicit decision
- the active speed effect is local to the player, follows movement direction, and keeps inertial carry so the streaks feel attached to motion rather than stamped onto the screen
- the older speed-effect direction that felt too global or too rigid is rejected

### Enemies / Collision

- the enemies were enlarged intentionally so their silhouettes read better against the background
- the updated enemy draw sizes must stay in sync with the updated collision boxes and hitboxes
- the enemy sizing pass is only successful if the visual size and the collision data remain honest together

### Environment

- the cloud layer is now scenario-based and scripted, not procedural
- clouds should read as large atmospheric set pieces with intentional placement and scale
- the old round / cloud-blimp procedural direction is rejected because it did not read like a believable stage element

### Game Feel

- the local inertial speed effect is the good version because it keeps the fighter feeling connected to motion without creating a detached screen effect
- if the effect starts reading like a generic global speed streak system again, that is a regression

### Projectiles / Dangerous Zones

- boss missile is currently the correct black rocket path and should stay on its current working behavior
- tank missile now uses the gray rocket asset and must keep the older working movement model without boss-style launch behavior
- the current tank dangerous zone direction is not approved
- the last tank dangerous zone version may be connected to a freeze after tank missile hits the player
- the next session blocker is: `Freeze after tank missile hits player`
- next session priority is to fix that blocker before any more projectile or danger-zone polishing
- the rejected tank dangerous zone direction is:
  - no smoke
  - no thick slow electric arcs
  - no concept of a few large arcs
  - prefer an electric storm made of short, bright, sharp, jagged discharges
  - visual form and collision must match
  - no square or rectangular debug-box look
  - prefer several overlapping circles or another organic shape that clearly shows the boundary

## Session Findings 2026-06-04

### Projectiles / Dangerous Zones

- `tank_danger_zone.png` was integrated as a 3-frame looping animated danger zone for tank missile hits
- `boss_danger_zone.png` was integrated using the same 3-frame looping approach for boss missile hits
- the danger zones now use a single gameplay collision shape per zone while keeping the visual animation separate
- the boss missile startup arc was lengthened and smoothed so the transition into homing reads more naturally
- boss dangerous zones should be treated as missile-explosion hazards: the upper legs launch the boss missile, and the missile explosion creates the boss dangerous zone
- boss missile proximity detonation is boss-only and must not change tank missile behavior
- Boss Lab must not recreate simplified copies of existing boss attacks or effects; it should first prove the new leg hitbox ownership model, then connect existing main-game systems through minimal adapters
- the main boss hit detection now uses the Boss Lab segmented body/leg hitbox model as the gameplay collision source
- debug overlay must draw the same Boss Lab segment data used for bullet collision and must report last-hit owner, segment, and damage
- legacy boss leg boxes may remain for visual effects or existing destruction feedback, but they must not be mixed back into bullet hit detection
- player contact collision with boss legs is intentionally separate from bullet hit detection and should not be changed during hitbox integration unless explicitly requested

### Debug Overlay

- the `B` overlay now supports three modes: `NORMAL`, `DEBUG_VISUAL`, and `DEBUG_TECH`
- the overlay now covers player hitboxes, enemy hitboxes, tank and boss missile collision, dangerous zones, and boss anchors / debug markers

### Boss Legs

- the recent P3 lower-leg collision experiments were not successful and were rolled back to the stable pre-experiment collision path
- the lower-left missing visual segment was traced to the assembled-leg clip path rather than to `sourceRect` or background-mask cleanup
- the safest fix path for that visual issue is to adjust the lower-left clip geometry only, not the collision system

### Boss Rebuild Audit

- the live boss implementation should be treated as frozen for the rebuild phase
- the rebuild should use one source-of-truth geometry chain for draw, collision, and debug overlay
- Boss_test is a useful reference because it keeps the collision and overlay closer to the visible assembled geometry than the more fallback-heavy live boss path
- the Boss Lab should stay separate from the main game and should reuse the existing assets and gameplay systems instead of introducing new art or a new art pipeline
- if a boss visual and its hitbox drift apart, the first fix should be to simplify ownership and geometry, not to add another offset layer

## Session Findings 2026-06-05

### Boss Lab / Collision

- Boss Lab is now the approved environment for validating boss rebuild ideas before touching the live boss path
- the current accepted boss collision model is segmented: the body is split into 6 segments, and each leg is split into 5 segments
- the new leg geometry is intentionally non-overlapping between neighboring legs for the bullet-hit path
- the main game now uses this segmented Boss Lab geometry for boss bullet collision and debug hit reporting
- honest per-leg hit diagnosis is now a confirmed project win

### Boss Visual Ownership

- the lower-leg visual problem was not solved by trying to rescue the old assembled visual / mask pipeline in place
- the successful lower-leg restoration came from reusing Boss Lab visual-region logic for the lower-leg draw path
- the fix that stops middle-leg destruction from corrupting the upper-leg visual is accepted and should not be regressed

### Projectiles / Dangerous Zones

- boss missile proximity detonation plus the warning beep is now part of the accepted boss-missile behavior
- dangerous-zone creation should be understood as a missile-explosion consequence, not as a direct old-style leg-spawned attack
- the boss missile still needs another verification pass before it should be treated as finished

### Smoke / Destruction Feedback

- destroyed-leg smoke was restored after a failed weakening pass made it disappear visually
- current smoke work must preserve emitter behavior and intensity first, then adjust only render style
- smoke around the boss lair and smoke from destroyed boss legs now need to stay visually consistent even though they are rendered in different code paths

### Current Status Summary

What is successful now:

- Boss Lab as a diagnosis and verification tool
- segmented boss hitbox ownership
- honest leg-hit confirmation
- lower-leg full visual restored

What is still unfinished:

- destroyed-leg stump visuals
- final smoke-style tuning without losing intensity
- focused boss missile verification

## Session Findings 2026-06-07

### Boss Lab / Verification

- Boss Lab is now treated as the separate verification surface for boss geometry and destruction-state work
- the segmented boss model is confirmed and stable:
  - body: 6 collision segments
  - each leg: 5 collision segments
- the new hitbox model is now in the main game for boss bullet collision and debug reporting
- cross-leg overlap in the new bullet-hit geometry has been removed
- the lower-leg missing visual segment is restored in the main game
- middle-leg destruction no longer damages the upper-leg visual

### Projectile / Feedback

- the boss missile now uses proximity detonation plus a warning beep before the explosion
- dangerous-zone creation should be read as a missile-explosion consequence
- destroyed-leg smoke is visible again and should keep its intensity while the render style is refined

### Current State

What is working well:

- boss leg hits are honest and diagnosable
- the lower leg renders fully again
- smoke is back and close to the intended strength

What is still weak:

- destroyed-leg stump visuals
- final smoke-style tuning
- another focused boss missile verification pass

### Housekeeping Note

- unused top-level danger-zone source atlases were moved into `C:\Future\CyberSpider_Archive\cyberspider_housekeeping_2026-06-07\assets\sprites`

## Boss Attack System (Current)

- Spread Attack uses two independent lower-body sources:
  - left source from the left lower body socket
  - right source from the right lower body socket
- Spread Attack disables per side:
  - destroying a left lower leg disables only the left spread source
  - destroying a right lower leg disables only the right spread source
- Web Attack uses the middle-leg socket pair:
  - left source from the left middle-leg socket
  - right source from the right middle-leg socket
- Web Attack disables per side:
  - destroying a left middle leg disables only the left web source
  - destroying a right middle leg disables only the right web source
- Missile Attack uses the upper-leg socket pair:
  - left source from the inner socket of the left upper leg
  - right source from the inner socket of the right upper leg
- Missile Attack disables per side:
  - destroying a left upper leg disables only the left missile source
  - destroying a right upper leg disables only the right missile source
- Existing danger zones do not block new missile launches or new web shots.
- Laser stays separate and unchanged.

### Boss Rage

- Rage is global and is based on the total number of destroyed legs.
- Rage affects only still-alive sources.
- Dead sources remain disabled.
- Current rage coefficients by destroyed-leg count:
  - 0 legs = 100%
  - 1 leg = 110%
  - 2 legs = 125%
  - 3 legs = 145%
  - 4 legs = 170%
  - 5 legs = 200%

### Boss Attack Experiments

- successful:
  - two-source spread attack
  - per-side web attack
  - per-side missile attack
  - global rage based on any destroyed leg
- rejected:
  - spread anchor-star overlay tuning when runtime anchors were already correct
  - pair-only rage logic
  - blocking fresh missile/web launches behind old danger zones
  - keeping temporary proof PNGs in the active tree
## UI Strategy Reset 2026-06-14

- Canvas stays for gameplay, HUD placeholder, battle warnings, and in-game overlays.
- HTML/CSS is the main framework for main menu, settings, titles, results, and other non-game screens.
- The UI foundation is a drawn thematic background plus HTML/CSS interface plus game typography plus custom button shapes.
- `Space_Game_GUI_PNG` is no longer the direction anchor; it may remain only as a source for individual components.
- `UI_KIT_V2` is legacy and archived.
- The attempts around `Start_BTN`, `Table`, and menu assembly from the asset pack are rejected.
- One screen at a time: main menu is the next UI target.

## UI Closeout Update 2026-06-14

- Canvas stays for gameplay, HUD stub, battle warnings, and in-game overlays.
- HTML/CSS is the main route for main menu, settings, titles, results, and other non-game screens.
- The UI foundation is a thematic drawn background plus HTML/CSS interface plus game typography plus custom button shapes.
- `Space_Game_GUI_PNG` remains only a component source, not the base UI direction.
- HUD audit stays complete.
- Menu assembly should not be centered around the pack.
- The ideal-pack search is no longer a current task.
- `docs/UI_KIT_V1.md` and `docs/UI_STYLE_BRIEF.md` remain archived historical UI references.

## Session Close 2026-06-13

- Runtime kill statistics must count the canonical `normal` enemy as `Таран`.
- End-of-run reporting should show both total kills and per-type kills, not only the score.
- If a competent full run still settles on `3`, the rank curve is too strict for the current economy.
- The current softened school-grade curve is the approved direction for the next live playtest.
- The UI experiment branch from today is closed and should not be reopened without a separate decision.

## Gameplay Restore 2026-06-14

- The main project gameplay branch was restored from `C:\Future\CyberSpider_Archive\game.js.20260613_133518.bak`.
- The 13.06 UI rollback is the confirmed cause of the stale canvas-shell that displaced the newer gameplay branch.
- UI work is paused until gameplay verification is complete.
