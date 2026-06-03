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
- keeps state information fast to scan
- supports combat without becoming clutter

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
- main background art belongs in `assets/background/`, not in the project root
- any abandoned environment experiments should be archived in `CyberSpider_Archive`, not left in the active background folders
- when users provide downloaded asset archives, unpack them into the requested tileset folders and move the original archives into `CyberSpider_Archive/asset_downloads`
- keep temporary download byproducts out of the active asset tree so a fresh session can resume from clean, named folders

## Project Structure Rules

- `C:\Future\cyberspider` contains only the current working version of the game
- all archive materials live only in `C:\Future\CyberSpider_Archive`
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

## Session Findings 2026-06-02

### Player

- long fighter silhouettes expose turn and pivot problems more clearly than shorter ships
- a plain rotation does not automatically communicate a real roll on a top-down shooter sprite
- perspective on the aircraft sprite is critical; a slightly 3/4-looking jet can conflict with a strict top-down world even when it is detailed
- exhaust asymmetry should be completely neutral when the player is not turning, then only appear during actual left/right movement
- aggressive color flattening can make a fighter read as a gray blob, so any cleanup should stay minimal, symmetric, and detail-preserving
- the fourth June 2 fighter candidate, once tightly cropped, became the active player sprite and was saved as `assets/sprites/player_fighter.png`
- the discarded June 2 player candidates were archived to `C:\Future\CyberSpider_Archive\dev_unused\player_sprite_candidates_2026-06-02`

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
