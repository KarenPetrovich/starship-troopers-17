Cyber Spider Shooter — Project Notes
Project Overview

Small HTML5 Canvas arcade shooter prototype.

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

Project documentation lives in `docs/`.
Utility scripts live in `tools/`.

Genre:

2D vertical scrolling shooter
cyber-spider arcade shooter
gameplay-first arcade prototype

Main goal:
Create a short but polished and satisfying arcade experience instead of a huge game.

The project is intentionally small in scope.

## UI Session Close 2026-06-16

Accepted UI direction:
- `panel.png` is now the main shell for the non-game screens.
- The accepted screens are settings, controls, sound, language, leaders, titles, results, and detailed results.
- The background remains visible behind the panel.
- The screen content lives inside the panel.
- Metal buttons remain the shared button style.
- `BoldPixels` is the chosen UI font, but the size and hierarchy still need a dedicated revision pass.
- The results screen is connected to real game data.

Remaining UI issues for the next session:
- `BoldPixels` needs a readability pass, especially on controls and results.
- `УПРАВЛЕНИЕ` needs a better composition pass.
- `РЕЗУЛЬТАТЫ` needs larger text and better use of the available panel space.

Cleanup rule:
- temporary UI screenshots, experiments, and scratch exports should be moved to `C:\Future\CyberSpider_Archive` after they are no longer needed
- keep the active tree limited to used assets, code, current docs, and current UI art

Main Development Philosophy

Priority order:

gameplay
readability
game feel
pacing
UI polish
visual polish
audio polish

Important rules:

small safe iterations
avoid huge refactors
avoid premature optimization
avoid overengineering
keep code understandable for a beginner
preserve working gameplay whenever possible

Do NOT add large systems unless explicitly requested.

Current Project State

The game is already fully playable.

Mobile readability constraint for future visual work:

- the lower part of the screen must stay easy to read on small displays
- the player, player hitbox, bullets, and nearby threats must not be covered by decorative effects
- clouds, wind, smoke, particles, and any overlay-style effect must be designed with small-screen readability in mind
- any new visual effect must be checked for whether it makes smartphone readability worse before it is accepted

Player exhaust status:

- the current player exhaust for `player_fighter.png` is approved and treated as the final base
- do not use older exhaust variants for future work unless a separate decision explicitly reopens the topic
- further exhaust edits are forbidden without a new, explicit decision

Current visual lock:

- the active player speed effect is local to the fighter, is driven by movement, and keeps inertial carry so the streaks do not snap on and off
- the older speed-effect approach that read too globally or too stiffly is rejected
- enemy ships are intentionally larger now, and their collision shapes / hitboxes must stay aligned with the updated draw sizes
- the active cloud layer is scenario-based and scripted, not procedural; the cloud pass is meant to read as large set-piece atmosphere
- the old cloud-blimp / round procedural cloud direction is rejected
- boss missile is currently the working black-rocket path and should stay on its present behavior
- tank missile uses the gray rocket asset and must keep the older working movement model; do not reintroduce the boss-style launch phase
- the current tank dangerous zone implementation is not approved
- the last tank dangerous zone pass may be related to a freeze after tank missile hits the player
- the next session must start with the blocker `Freeze after tank missile hits player`
- the tank dangerous zone direction is currently rejected in favor of a future electric-storm redesign with short sharp discharges and an organic boundary
- boss leg destruction is back on the stable `boss_2.png` render path; the damaged-asset replacement attempt was rolled back after it produced fragmented geometry and broken rectangles
- the failed crop-based lower-leg stage experiments and the hybrid stage1/stage2 path are closed; they remain only in history, not in the live render path
- the damaged-boss replacement experiment was later judged a failure: clip + mask + debug iterations produced fragmented geometry, so the live boss render was returned to the stable `boss_2` pipeline and the damaged render branch was disabled
- boss segmentation is now complete in the permanent folder `assets/sprites/boss_segments/`
- the accepted segmented set is:
  - `upperLeft.png`
  - `middleLeft.png`
  - `lowerLeft.png`
  - `upperRight.png`
  - `middleRight.png`
  - `lowerRight.png`
- Boss Lab is a permanent project tool and must stay in the project:
  - `boss_lab.html`
  - `js/boss_lab.js`
- Boss Lab files are not temporary experiment debris and must not be archived

Current results / ranking direction:

- the end-of-run summary must always report the full run, not only win/lose state
- the boss body must become a score source and one of the high-value score sources
- letter ranks are no longer the primary ranking direction
- the current ranking direction is a Russian school-grade scale with short variants, with `2 / 3- / 3 / 4- / 4 / 5- / 5 / 5+` as the recommended final form
- `FINAL_RANK_SYSTEM.md` is the current approval target for the rank table
- `RUN_ANALYTICS_RUNTIME.md` is the shared data source for results, commentary, and ranking
- rank balancing must stay tied to the actual economy of the current demo, not to invented thresholds

Current close-out priority overrides the older blocker list:

- the project focus is now shared between the results / ranking documentation stage and the boss verification track
- the roadmap is the source of truth for which branch is active next
- the next session should start from the current roadmap sequence, not from old blocker notes

## Boss Segmentation Final 2026-06-09

Final result:

- all 6 detachable boss legs are segmented
- the permanent live segment folder is `assets/sprites/boss_segments/`
- files in `assets/sprites/boss_segments/` are the accepted detachable leg ownership exports for boss reassembly, Boss Lab validation, and future gameplay integration
- final reverse assembly against `assets/sprites/boss_2.png` passes with `missing = 0`, `extra = 0`, `changed = 0`
- final `body-only` is one connected visible component with `disconnected = 0`
- every leg PNG is one connected visible component with `disconnected = 0`
- the validated leg workflow is now explicit and reusable
- the lower-leg `socket-only` destroyed concept is found and approved as the target read

What worked:

- reverse assembly validation
- explicit ownership workflow
- assembly-safe checks after each accepted leg
- destruction-safe checks on removed-leg previews
- component analysis
- `body-only` validation
- disconnected-fragment search
- using `upperLeft` as the validated reference before scaling to the other legs

What did not work:

- ownership boundaries cut through the visible form of a leg instead of the joint
- pixel diff without destruction-safe review
- accepting a leg without checking `body-only`
- accepting a leg without disconnected-fragment analysis
- approving a seam before checking the real destroyed-state read
- vertical leg cuts
- treating stump PNGs as the primary fix for lower-leg destroyed read
- trying to solve destroyed-state problems by reopening segmentation

Validated Leg Segmentation Workflow:

1. define the real joint boundary before export
2. keep single ownership for every visible pixel
3. export only the leg's own connected visible component
4. verify `body-only` immediately after that leg
5. require assembly-safe: `missing = 0`, `extra = 0`, `changed = 0`
6. require destruction-safe: no surviving live-leg silhouette, no hanging emissive leftovers, readable socket
7. require component analysis: correct count and `disconnected = 0`

Boss Production Workflow:

1. add or revise one leg at a time
2. validate ownership against `body` and neighboring legs
3. check assembly-safe
4. check destruction-safe
5. check `body-only`
6. move the accepted result into the live asset folder only after all checks pass

Important scope note:

- `lowerLeft` destroyed-state visual polishing is still a separate task
- segmentation itself is complete and should not be reopened unless a new real artifact is found
- destroyed-state work is separate from segmentation and ownership

Current post-segmentation state:

- gameplay now uses the segmented boss render path
- lower-leg destroyed read in gameplay uses the `socket-only` runtime direction and is the correct long-term path
- lower-leg destroyed read in gameplay still needs final visual polish so the last remnants read exactly as intended at play distance
- Boss Lab is not the source of truth for destroyed-state approval
- Boss Lab currently can still show a destroyed-state that does not match the approved preview
- Boss Lab also requires local `http` serving and should not be treated as the final judge of runtime destruction

Existing systems:

main menu
pause system
score system
rank/title system
mission timer
victory screen
defeat screen
boss intro
multiple enemy types
full boss fight
dev shortcuts
mouse + keyboard menu navigation

DEV GODMODE:

toggle with Z during gameplay
ignores damage
ignores web slow effects while active
turning godmode on immediately clears any active player slow / attached web overlay
normal web slow behavior must remain unchanged when godmode is off

Current stage:
Polish / game feel / production structure.

Latest checkpoint:

- the active background is now the provided single-scene village image: `assets/background/village_level_main.png`
- the background is rendered as a direct vertical scroll with no parallax, no extra objects, no blur, and no image cutting or stitching
- the first-pass runtime measurements are: 120 seconds from the bottom portion of the image to the top portion, and about 176.7 seconds for one full repeat loop at the current viewport size
- the top of the image, which contains the spider lair area, reaches the screen around the 2:00 boss moment with the current scroll tuning
- the scene reads best when treated as a pure background base; no gameplay changes were made for the integration pass
- the earlier tileset-assembled village pass was rejected as visually too synthetic for the goal of this level
- the unused candidate images `1.1.png`, `2.png`, `3.png`, `4.png`, `5.png`, the prior `ChatGPT Image Jun 1, 2026, 08_40_14 PM.png`, and the older `assets/background/village_long_map.png` have been moved into `C:\\Future\\CyberSpider_Archive\\background_experiments\\village_level_candidates`
- the main background asset has been normalized into `assets/background/village_level_main.png` so the working tree no longer depends on a root-level experimental filename
- local browser audit of the current app viewport measured `window.innerWidth = 627`, `window.innerHeight = 558`, `devicePixelRatio = 1.5`, and canvas buffer/client size `366x558`
- `assets/background/village_level_main.png` is `741x2121`; the background draw path uses it 1:1 with no scaling, so the current viewport shows `366x558` of the image at a time
- the horizontal placement is `x = -188`, which means `188px` are hidden on the left and `187px` are hidden on the right; the visible width share is `49.39%`
- no live references to the old root-level `1.png` filename were found in code, docs, notes, or comments during this pass
- the remaining visual wobble is now most plausibly explained by the source art itself and the intentional stepped scroll cadence, not by fractional background positioning
- current asset cleanup is complete and the project is ready for further image-based level validation if needed

## Village Background Atmosphere Pass 1

Current runtime layer:

- the active village scene uses `assets/background/village_level_main.png` as a baked single-image level background
- the atmosphere layer is world-anchored to the same cover/scroll transform as the background, so the effect stays pinned to the image coordinates
- render order is background -> atmosphere -> gameplay objects -> UI

Boss-zone anchor points inside the source PNG (`741x2121`):

- main lair: `x: 370, y: 150`
- small pit left: `x: 230, y: 245`
- small pit right: `x: 575, y: 260`
- left ruins / gorge: `x: 285, y: 355`
- right ruins / gorge: `x: 535, y: 315`

First atmosphere pass:

- stronger red-dark pulse inside the main lair, visible during active play
- 3 to 5 energy crack flickers around the lair, with more length and contrast than the first pass
- slow smoke from the main lair and the two pits
- very rare sparks near the lair only

Second composition pass:

- the main visual emphasis is now the infected ground around the lair, not the center of the lair itself
- the strongest readable points are the surrounding ruined areas and pits, so the effect stays visible while the boss sits over the center
- the lair is now only a weak secondary source with a soft pulse and light smoke
- the fractures are the main cue and read more like a cracked contaminated zone than a central glow

Updated energy points:

- left ruined zone: `x: 285, y: 355`
- right ruined zone: `x: 535, y: 315`
- left pit: `x: 230, y: 245`
- right pit: `x: 575, y: 260`

Boss intro sync:

- the lair pulse briefly intensifies during boss intro, then returns to the normal level
- the fracture flashes also spike briefly during boss intro for a stronger first read
- smoke remains a background element and is not the focus of the pass

Performance rules for this pass:

- atmosphere particles are capped at about 60 total
- the system uses a simple spawn/update/draw loop
- no canvas blur filters
- no heavy shadowBlur pass
- no global map fog or noise
- no new tileset system
- no gameplay changes

Intent:

- make the boss approach area feel alive without touching the village, clouds, or wind yet
- keep the effect subtle enough that it reads as part of the world, not as a combat UI effect

## Environment Experiments

Current environment prototype:

- `Stellar Space Environment` is the current test object for a minimal vertical flyby.
- The chosen asset is the ring-station / megastructure preview, because it reads as one concrete place instead of a generic background.
- Only one large Stellar object is used in the prototype.

Experiment result:

- the main hypothesis is confirmed: one large recognizable environment object works better than abstract geometry and panels
- the player starts reading the object as a real сооружение instead of a decorative shape set
- open космос around the object improves scale perception and helps the stage read as a place
- the flyby approach works for Cyber Spider Shooter
- the principle of `place, not geometry` is valid for this project

What this prototype should answer:

- how large should megastructures be relative to the ship and the screen
- how long should the player fly beside each major structure
- how many major objects should appear in a roughly 2 minute demo
- how to distribute 2-3 memorable environment objects without turning the stage into a stream of decorations

Current problems to carry forward:

- the current object passes too quickly and still feels more like a large decoration than a place the player travels beside
- the object is not yet large enough for the final demo goals
- the center of the object shares some color overlap with the player ship and needs to be watched in the next iteration
- the prototype confirms the direction, but not yet the final scale or duration targets

## Level Composition Rules

These rules are the base for all future environment decisions in Cyber Spider Shooter.

### MUST

- Large level masses must sit to the side, below, or in the depth of the scene.
- The center of the screen must remain a clear combat zone.
- Space must always be visible in at least one part of the screen.
- Large forms must read as part of the world, not as separate flying objects.
- Movement must be created by small elements, not by the megastructure itself.
- Scale must be created through the contrast between the small player ship and huge forms.
- The scene must change every 10-20 seconds through a change in large forms.

### MUST NOT

- Large forms must not cross through the center of the screen.
- Two dense parallel masses must not form a corridor.
- A solid "floor" must not appear under the player.
- The megastructure must not behave like a drifting flyby object.
- The scene must not turn into a tunnel.
- The center must not become overloaded with detail and architecture.
- The whole screen must not be filled by a single texture or image.

### ACCEPTABLE

- The player may fly above part of a mass if it does not form a solid floor.
- The player may partially enter breaks and openings if this does not become a corridor.
- Large elements may briefly enter the center if they do not break combat readability.
- The scene may become denser toward the end of a sector.
- A single strong object may dominate if space and readability remain intact.

Current Gameplay Structure
Mission pacing

0:00—0:15

basic enemies

0:15—0:45

basic + tank enemies

0:45—1:15

basic + tank + zigzag enemies

1:15—2:00

all enemy types

2:00

boss intro
Enemy Types
Basic Enemy
simple downward movement
occasional shooting
Tank Enemy
slow
high HP
launches homing missile
missile has limited turning speed
missile explosion leaves small danger zone
Zigzag Enemy
diagonal movement
direction switching
occasional shooting
Web Enemy
shoots slowing web projectiles
slows player movement
Boss

Large cyber-spider boss.

Boss structure:

main body
6 destructible legs

Leg groups:

Lower legs:

triple projectile attack

Middle legs:

web attacks
slow effects

Upper legs:

launch boss missile; the missile explosion creates the boss dangerous zone

Independent attack:

core laser attack
laser does not depend on legs

Boss mechanics:

attacks disable when related legs are destroyed
while legs are alive:
body receives reduced damage
after all legs are destroyed:
body receives bonus damage
boss enters aggressive legless mode

Important:
Boss should feel unstable and threatening, but NOT chaotic bullet hell.

Current Polish Direction

Current focus is NOT adding new mechanics.

Current focus:

readability
smoother transitions
hit feedback
explosions
UI feel
boss payoff
screen effects
pacing polish

Current project roadmap:

1. Boss Feedback Pass

Improve destroyed-leg feedback so damaged boss sides read clearly at normal play distance. This pass is about smoke, sparks, heat, and short-lived damage cues attached to fixed destroyed-leg origins.

2. Boss Attack Readability Pass

Sharpen the tell and silhouette of each boss attack group. Keep attack identity clear without increasing bullet chaos or changing attack logic.

Current status:

- lower-leg triple shot now spawns visually from a live lower leg with a short muzzle flash
- middle-leg web shot now spawns visually from a live middle leg with a pale thread/charge cue
- upper-leg missile launch now reads as the source of the later boss dangerous zone created by the missile explosion
- core laser charge/beam now reads from the core visual area
- attack balance, cooldowns, damage, leg damage anchors, smoke, and destroyed-leg states are unchanged
- the current level-assembly pass is active and focused on the structured village background; no gameplay or boss systems were changed

## 2026-06-04 Session Recap

- `tank_danger_zone.png` was introduced as the new tank missile danger-zone base and sliced into 3 frames for a looping animated zone
- `boss_danger_zone.png` was introduced with the same 3-frame animated danger-zone approach and scaled larger for the boss missile
- danger-zone logic now uses the sprite-based animated zones with a single gameplay collision shape per zone
- the boss missile start phase was lengthened and smoothed so the initial launch reads more naturally before homing begins
- boss dangerous zones are now documented as missile-created hazards, not as a direct old leg-spawned zone attack
- current boss missile behavior: upper legs launch the boss missile, the missile explodes on direct player collision or after proximity arming near the player, and that explosion creates the boss dangerous zone
- boss missile proximity detonation uses a clear activation radius and plays a short high-pitched warning beep before the proximity explosion
- tank missile behavior is intentionally unchanged by the boss missile proximity pass
- Boss Lab now prioritizes the new leg hitbox ownership model: each leg has independent state, visual region, and multiple non-overlapping hitbox segments
- Boss Lab must not keep simplified local copies of existing boss attacks, dangerous zones, destruction effects, or audio; those systems should be connected later through a minimal adapter to the main-game systems
- Main-game boss hit detection now uses the Boss Lab segmented hitbox model for body and legs
- body hits are resolved against 6 body segments instead of one broad body rectangle
- each boss leg uses 5 explicit non-overlapping segments from the Boss Lab geometry, and the gameplay debug overlay reports `legId`, `segmentId`, and damage for the last hit
- boss attacks, missiles, dangerous zones, smoke, sparks, explosions, audio, phases, leg destruction state, and visual rendering were intentionally left unchanged during this hitbox integration pass
- player contact with boss legs still uses the legacy contact-collision path for now; only player bullet hit detection and the `B` debug hitbox overlay were moved to the Boss Lab segmented model
- the `B` debug overlay was expanded into a three-mode gameplay overlay: `NORMAL`, `DEBUG_VISUAL`, and `DEBUG_TECH`
- the P3 lower-leg collision experiments were tried and then rejected: `legBox`, `drawRect`, assembled-basis, visual-axis, visual-chain, and `near/mid/far` variants did not produce a stable improvement
- those P3 collision experiments were rolled back to the stable pre-experiment collision path
- the lower-left leg visual audit then narrowed the missing internal segment problem to the assembled clip path, not to `sourceRect` or mask cleanup
- a small lower-left clip adjustment was applied so the missing internal visual piece stays visible without touching collision

## 2026-06-04 Boss Rebuild Audit

- the current boss in the main game is now treated as frozen for the rebuild phase
- the new work should happen in a separate `boss_lab.html` sandbox instead of inside the live boss path
- Boss_test is the main architectural reference, not a code drop target
- the strongest reference principle is a single ownership chain: geometry -> collision -> debug overlay -> rendering
- the rebuild must reuse existing boss art, missiles, danger zones, and damage feedback systems
- no new sprites or new art pipeline are allowed for the rebuild branch

## 2026-06-05 Boss Lab Close-Out

- Boss Lab is now the accepted boss verification environment because it allows boss geometry and hit ownership work without destabilizing the live fight in `index.html`
- the new segmented boss collision model is established: body uses 6 segments, and each of the 6 legs uses 5 explicit segments
- the Boss Lab leg segments were built as non-overlapping ownership zones, and the main-game bullet-hit path now uses the same segmented model
- per-leg hits are now diagnosable through the shared debug overlay, including leg id, segment id, and last-hit damage
- the lower-leg missing visual segment is now restored in the main game
- the earlier regression where destroying a middle leg corrupted the upper-leg visual was fixed and should be preserved
- boss missile behavior was improved with boss-only proximity detonation plus a warning beep before the proximity explosion
- destroyed-leg smoke was restored after a regression where the effect disappeared from view
- smoke render-style tuning is now underway without intentionally reducing emitter intensity, spawn rate, motion, or lifetime

Successful results from this phase:

- Boss Lab creation and continued use as a practical diagnosis tool
- segmented boss hitbox model
- 6 body hitbox segments
- 5 hitbox segments per leg
- elimination of cross-leg overlap for the new bullet-hit geometry
- integration of the segmented hitbox model into the main game
- lower-leg full visual restored
- middle-leg destruction no longer damages the upper-leg visual
- honest and diagnosable per-leg hit confirmation

Failed or risky experiments from this phase:

- multiple attempts to repair the old lower-leg visual through partial visual / mask pipeline fixes were not a good direction
- several partial lower-leg recovery attempts failed before the Boss Lab visual-region path solved the missing segment
- temporary stump experiments worsened the destroyed-leg visuals and made them too large, too sharp, and too artificial
- one smoke pass weakened the effect too aggressively and temporarily made destroyed-leg smoke disappear visually
- early Boss Lab iterations were too technical and not comfortable enough as a direct user-facing verification tool

Current good state:

- boss leg hitboxes are significantly more honest
- leg hits are now diagnosable instead of guessed from the old broad boxes
- the lower leg once again renders fully
- destroyed-leg smoke is visible again and much closer to the intended intensity

Current unfinished problems:

- destroyed-leg stump visuals are still not approved
- boss leg stumps are still too large, too sharp, and not organic enough
- smoke style still needs refinement so it keeps intensity without reading as a glowing cloudy blur
- the boss missile still needs another focused verification pass

Tomorrow plan:

1. Develop a strategy for fixing destroyed-leg visuals without breaking the segmented hitbox model.
2. Re-check boss missile collision, proximity detonation, warning beep, and dangerous-zone creation after explosion.
3. Add enemy collision explosions so normal, zigzag, and web enemies die on player collision, while tank takes 50% max HP damage instead of dying.
4. Create more readable projectile visuals for zigzag, web, and the remaining boss attacks except the missile.

## Knowledge Usage Policy

The project uses a permanent knowledge-first workflow.
This is a standing rule for Cyber Spider Shooter, not a temporary instruction for one task.

Sources of truth:

- `docs/PROJECT_KNOWLEDGE.md`
- the external knowledge shelf in `C:\\Future\\Codex_Skills\\external\\`
- the project notes in this file
- any connected thematic knowledge used for the current task

Required workflow:

`Knowledge -> Analysis -> Decision -> Implementation`

The following order is not allowed:

`Guess -> Implementation`

Mandatory knowledge check:

Any task touching gameplay, game feel, level design, environment, composition, readability, visual design, effects, projectiles, UI, audio, performance, or architecture must begin by identifying the relevant knowledge areas.

Required report format for design, visual, and research tasks:

Used knowledge:

- ...
- ...

Key takeaways:

- ...
- ...

If the relevant knowledge is missing:

Missing knowledge:

- ...

Then either create the missing knowledge or ask the user for clarification.

Large decisions always require a knowledge review for:

- structure of levels
- environment
- scene composition
- visual readability
- bosses
- enemies
- effects
- interface
- game feel

Allowed exceptions:

- moving files
- renaming files
- deleting temporary files
- organizing folders
- fixing typos
- updating links
- other technical operations that do not affect player experience

New Codex sessions must:

1. read `docs/PROJECT_NOTES.md`
2. read `docs/PROJECT_KNOWLEDGE.md`
3. only then start work

When a repeated insight is important enough to help future work, propose adding it to the knowledge system so the project keeps getting smarter over time.

3. Danger Zone Visual Pass

Improve danger-zone clarity and timing readability for boss threats. Focus on visual warning strength, consistency, and player recognition.

4. Project Cleanup / Reset

The experimental background-system work was attempted, tested, and then rejected. The project was rolled back to the pre-experiment game state, and all experimental materials were moved out of the project tree into `C:\\Future\\CyberSpider_Archive\\`.

Notes:

- the rejected background work included the new background packs and temporary visual-test outputs
- the lunar pack was preserved in `C:\\Future\\CyberSpider_Archive\\lunar_background_pack\\`
- the project tree now keeps only the real game files that are needed for the build and runtime

5. Projectile Readability Pass

Tune player and enemy projectile readability where needed. Keep hit clarity strong without making the screen noisy.

6. UI Pass

Clean up HUD, mission presentation, and combat-state readability. Favor quick scanning over decorative polish.

7. Audio Pass

Finish the core arcade sound layer: shots, impacts, explosions, boss reactions, and a stronger overall combat bed.

8. Final Game Feel Pass

Do a final cross-check of pacing, impact, screen feedback, attack timing feel, and boss payoff once the major readability work is stable.

Avoid:

scope creep
unnecessary new enemies
giant feature additions
overcomplicated systems
Final Visual Goal

Target visual style:

2D pixel art
animated sprites
layered/parallax backgrounds
arcade cyber aesthetic
readable silhouettes
strong gameplay clarity

Visual direction:
Stylized arcade readability is more important than ultra-detailed art.

CURRENT VISUAL STATE

The game now uses a coherent arcade sprite pack for player, enemies, projectiles, explosions, and exhaust.

Player:

orange ship variant
dual-wing fire presentation
player bullet visuals are tuned and considered final for now
DEV GODMODE uses the blue shield sprite from `assets/sprites/Barrier-0001.png`
godmode shield is a separate visual layer behind/around the player
shield center is aligned to the measured visual center of the rendered player sprite, including tilt/pitch transforms
shield uses a gentle alpha/scale pulse only; no aggressive blinking, giant glow, or smoothing

Enemies:

all regular enemies use 3-frame sprite animation
basic and zigzag are enlarged for readability
hitboxes and draw sizes remain separate so collisions stay readable without forcing exact sprite bounds

Projectiles:

player projectile visuals are tuned and considered final for now
enemy projectile visuals are locally polished, not fully locked
tank missile visual should remain unchanged unless explicitly requested
normal web enemy uses a dedicated `web_bullet` sprite with transparent background
normal web projectile grows during flight and its collision box scales with the visible web
normal web hit applies slow immediately, then transitions into a short visual impact/attached web state on the player
boss web projectile still uses its separate older path and should not be changed casually

Explosion system:

sprite-based explosion cores
supporting particles, lightning, sparks, and debris
boss chain explosions
no square-look explosions
late ring artifact frames are avoided

EXHAUST SYSTEM (FINAL)

Exhaust is implemented as sprite animation, not particles.

Source:

assets/sprites/Exhaust-0001.png

Rules:

fixed frame animation at about 10 fps
explicit 16x32 frame rects from the sheet
no alpha flicker
no random frame selection
no scaling animation
no particle trails
no spawned exhaust objects

Configuration:

Player:

2 exhaust flames
left and right nozzles
manual offsets tuned to the orange ship

Tank:

1 exhaust flame
centered on the main engine

Zigzag:

1 exhaust flame
manual offset tuned to touch the hull

Web:

1 exhaust flame
manual offset tuned to touch the hull
larger exhaust scale than zigzag for readability

IMPORTANT VISUAL RULES

Do NOT replace exhaust with particles.
Do NOT auto-position exhaust from sprite bounds.
Use manual exhaust offsets.
Do NOT add random flicker, alpha pulsing, or procedural flame effects.
Sprite fidelity is more important than decorative effects.
Animation should follow the asset frames.
Hitboxes and draw sizes are separate concerns.

ANIMATION / SPRITE WORKFLOW

This section documents the current production pipeline for animation, sprite integration, segmented visuals, layered rendering, and destroyable parts.

Primary goals:

gameplay first
readability first
visual honesty
small safe iterations
working visuals before polish
stable rendering before decorative complexity

Core production rule:
Do NOT break working gameplay for prettier rendering.

Visual feedback rule:
If a hit, attack, state change, or destroy state is not readable in motion, the effect is not finished yet even if the asset itself looks good.

GENERAL ANIMATION / GAME-FEEL PIPELINE

The project uses a practical pipeline:

1. Make the gameplay state work first.
2. Add a readable visual representation of that state.
3. Verify hit feedback / attack readability / silhouette clarity in motion.
4. Add polish only after the visual state is stable.

This means:

temporary simple rendering is acceptable
simple stable visuals are preferred over fancy unstable visuals
local polish passes should not rewrite working systems
animation timing should support readability, not just spectacle

SPRITE SYSTEM PRINCIPLES

The project mixes several sprite approaches depending on the feature:

assembled sprites
sheet-based frame animation
layered overlays
independent sprite parts
supporting particles around sprite cores

Important rendering rules:

render order matters
body / core / detachable parts should be treated as separate rendering concerns
gameplay ownership and sprite ownership must match
intact, damaged, and destroyed states must use explicit rendering branches
destroyable parts should never depend on accidental visibility from unrelated layers

Sprite ownership rule:
Every visual piece must belong to exactly one gameplay part.

If a piece looks like part of a specific leg, engine, projectile, or effect, then its render ownership must be tied to that one system and one state branch.

SEGMENTED VISUALS

Segmented visuals are used whenever a single gameplay object is made of readable sub-parts or destroyable pieces.

This includes:

boss legs
destroyable boss parts
layered explosions with separate cores and support effects
projectiles with separate visible growth / impact states
exhaust visuals that are attached to specific nozzles rather than generic particles

Rules for segmented visuals:

each gameplay part should have its own state
each visual part should have its own owner
hitboxes may be separate from draw bounds
destroyed state should follow gameplay state directly
adjacent pieces must not share hidden masks or side effects unless explicitly intended

Gameplay state to visual state rule:

working gameplay state first
then direct visual mapping
then local polish

Do NOT invent shared damage masks, partial destruction overlays, or side-group visibility rules unless the gameplay model actually owns such a state.

ANIMATION DECISION RULES

How to choose the rendering approach:

Use frame animation when:

the asset already exists as a sheet
the motion is self-contained
the frames are clean and readable

Use segmented rendering when:

the object has independent gameplay parts
parts can be destroyed separately
parts need isolated hit feedback or state changes
ownership needs to stay explicit

Use layered overlays when:

the base sprite is stable
the overlay is local and readable
the overlay does not create ambiguity about ownership

Use crop / sourceRect rendering when:

the crop belongs cleanly to one part
the crop can be mapped predictably to one gameplay owner
the crop does not depend on accidental overlap from neighboring pieces

Prefer simplification when:

partial broken states create artifacts
ownership becomes unclear
shared masks cause bleed between parts
root-cause is not yet understood

If a fancy damaged state creates unstable results, prefer a simpler intact / destroyed branch.

LAYERED EFFECTS AND POLISH

Current effect approach:

projectiles use dedicated sprites first, particles second
explosions use sprite cores with support particles
exhaust uses fixed sprite animation, not procedural particles
flash / hit feedback should stay local to the struck object
alpha and tint are support tools, not replacements for correct ownership

Rules:

do not use debug-looking rectangles as final hit feedback
do not use broad overlays that can affect neighboring parts
do not hide gameplay information under decorative effects
do not add layered effects until the base sprite state is correct

Animation timing rules:

fixed sheet timing is preferred over random frame jumping
feedback timing should feel crisp and readable
timing changes must not silently change gameplay balance

ASSET INTEGRATION WORKFLOW

When integrating a new asset or replacing a placeholder:

1. Verify the asset as an assembled visual first.
2. Identify which pieces belong to body, detachable parts, effects, and optional overlays.
3. Map gameplay ownership to visual ownership.
4. Confirm render order.
5. Define intact / damaged / destroyed branches.
6. Add local effects and polish.
7. Run manual tests in real gameplay, not only static inspection.

Integration rules:

do not begin with fragmented slicing experiments
do not assume a giant assembled sprite can support destroyable gameplay parts without ownership planning
do not rely on accidental overlap from neighboring pieces
do not patch visual bugs repeatedly without first finding the owner of the pixels

LESSONS LEARNED / PITFALLS

Known failure patterns that must be avoided:

giant assembled sprite over gameplay geometry without per-part ownership
fragmented slicing chaos
overlapping source rects with unclear ownership
shared side masks
visual bleed between adjacent destroyable parts
dangling fragments after destruction
cosmetic patching without root-cause analysis
using one broad erase / tint / clip region for multiple neighboring parts
letting a destroyed state depend on pixels from a separate intact layer

If a rendering bug affects neighboring parts, stop and inspect ownership, source rects, draw order, and layer boundaries before changing effect sizes.

Recent boss leg hitbox redesign outcome:

the redesign failed
overlay and sprites drifted apart
hitboxes became less honest
boss leg visuals regressed
a one-leg test legPart pipeline also produced visual regression

Project decision after that pass:

rollback to the pre-redesign visual state
keep boss visuals stable
accept that current boss leg hitboxes may still be inaccurate for now
prefer visual stability over hitbox experimentation until a new plan exists

BOSS LEG SYSTEM

The boss has 6 independent gameplay legs:

upper-left
middle-left
lower-left
upper-right
middle-right
lower-right

Gameplay ownership:

each leg has its own HP
each leg has its own alive / destroyed state
each leg has its own hit feedback timer

Visual ownership:

each leg should render through its own leg branch
pair logic is separate from visual ownership
attack disable logic is role-based
leg rendering must remain per-leg

Important separation:

pair logic decides which attack groups are still active
visual ownership decides which exact leg pixels are visible

These are not the same system and should not be merged.

Boss leg rendering rules:

intact leg must render through its own intact branch
destroyed leg must not be allowed to leak neighboring pixels
destroyed branch should prefer stable hiding over fancy broken fragments
debug investigation should log which parts are owned, hidden, or still drawn

Known boss leg pitfalls already encountered:

shared assembled leg pixels causing bleed
destroyed lower affecting middle visuals
destroyed middle affecting upper visuals
dangling claw / tip fragments from partial erase logic
intact legs losing far segments when ownership crops are too small
hitbox redesign work accidentally destabilizing intact and destroyed visuals

Boss visual safety rule:

never degrade boss visuals for hitbox experiments

Any future boss leg hitbox pass must:

be isolated
avoid changing rendering ownership
avoid changing the boss sprite pipeline
preserve stable visuals first
keep a fast rollback path

Preferred future boss hitbox direction:

make a separate plan first
keep one shared HP / state per leg
use several small rectangular collision segments per leg
leave visual rendering unchanged
make overlay show the real collision boxes
prove the approach on one leg without changing visual render

Boss Pipeline (new approach)

Main principle:
Do NOT push hitboxes to match the sprite.
Do NOT break the visual.

Pipeline:

1. Fix the visual baseline first. Keep `boss_2.png` untouched.
2. Define leg geometry with anchors and structure.
3. Add only a simple, minimal animation layer.
4. Build hitboxes from that geometry.
5. Use the debug overlay to show the real collision boxes.

Forbidden:

do not change boss sourceRect / crop boxes
do not fix hitboxes with render offsets
do not mix the old and new boss systems
do not do "by eye" alignment passes
do not use visual patching as a substitute for geometry

BOSS COLLISION FINDINGS

The current boss collision work has confirmed a real mismatch between the boss visual silhouette and the leg collision model.

Key findings:

1. The mismatch is real and repeatable.
2. The problem is not a simple hitbox offset issue.
3. The problem is not solved by only expanding the current segments.
4. The current leg model is skeleton-oriented: `near`, `mid`, and `far` describe the internal leg structure, not the full visible silhouette.
5. Readability of hits is roughly:
   - upper legs: about 6/10
   - middle legs: about 3/10
   - lower legs: about 2/10
6. Player expectation is to hit the visible leg silhouette, not the inner skeleton.
7. The silhouette prototype showed that the problem is deeper than changing the size of a few boxes.
8. For battle quality, a silhouette-first direction is preferred over preserving the old skeleton model at any cost.

Known remaining issues:

- the leg destruction "stair-step" problem is still unresolved
- boss breathing is still barely visible
- sparks are still too subtle
- the body hit reaction still looks weak
- gradual core color change from blue to red remains a promising idea
- spark particles in the project still feel too soft and may need a later sharpness pass

Boss leg damage-state research summary:

- intermediate leg damage states were investigated and rejected
- `boss_2.png` has a fundamental visual interdependence between leg parts
- the project is returned to the two-state model: `Alive -> Destroyed`
- no further work on Lower Damaged / Middle Damaged is planned
- the current stable direction is to keep final destroyed remnants only

Current Phase 1 collision direction:

- middle and lower boss legs now use silhouette-oriented rectangular collision groups
- upper legs remain on the older `near` / `mid` / `far` layout as the control group
- all middle / lower collision boxes still belong to the existing per-leg HP / alive / hitFlash owners
- boss visual rendering, assembled source rects, damage states, attack ownership, body hitbox, and core hitbox are unchanged
- debug overlays must draw the same leg collision data used by gameplay

Current boss leg damage-state direction:

- intermediate leg damage-state experiments were rejected and removed from the active implementation
- rejected approaches included broad destroyed-lower covers, cleanup masks, decorative break cues, floating stumps, and temporary damaged-leg prototypes
- the active boss leg model is simplified back to two states only: `Alive` -> `Destroyed`
- current alive legs and current final destroyed remnants are the intended shipped visual states for now
- do not add Lower Damaged, Middle Damaged, or other intermediate visual states without an explicit new direction
- collision, source rects, clip paths, HP, and attack logic remain separate from leg damage visuals

Next stage:

the next project phase starts with a full review of the boss collision model
the boss collision direction should be revisited before continuing polish on the leg pipeline

DEBUG OVERLAYS

Debug overlays are for development only.

Rules:

show overlays only in debug mode
normal gameplay visual must remain clean
debug markers must not become part of final hit feedback
debug overlays should explain ownership, anchors, pivots, and hitboxes without changing final rendering behavior

PRODUCTION RULES FOR FUTURE BRANCHES

Before changing a complex visual system:

1. identify the gameplay owner
2. identify the visual owner
3. inspect source rects / draw order / clip rules
4. isolate the failing branch
5. apply the smallest stable local fix
6. run a manual test list

Workflow rules:

prefer root-cause analysis over cosmetic tweaking
do not walk in circles changing crop sizes blindly
do not touch unrelated systems during visual cleanup
prefer stable simple rendering over clever unstable rendering
always leave a manual verification checklist after meaningful rendering changes

Communication / task rule:

game-dev and Codex requests should stay shorter
do not bloat context with repeated long restatements
prefer concise scope, clear constraints, and a short checklist

CURRENT PRIORITY

VISUAL POLISH / JUICE PHASE

Current focus:

visual readability
feedback for hit, fire, and movement
polish without changing gameplay

NEXT STEPS

1. Boss collision model review:

revisit the boss leg collision direction before further polish

2. Boss geometry:

anchors and leg structure

3. Boss animation:

simple leg motion only

4. Boss hitboxes:

derive collision from geometry and expose it in debug overlay

5. VFX polish:

muzzle flashes, carefully
hit sparks
optional engine trails
first-wave boss VFX are limited to subtle core pulse, attack warning flashes, small hit reactions, and light sparks from destroyed legs
destroyed legs may also use a very light smoke / ember feedback pass, but only as a visual cue attached to the destroyed leg itself
that feedback must come from a fixed damage origin near the final destroyed remnant, not from the moving silhouette of the remaining leg parts
do not change hitboxes, damage logic, attack timings, or boss assembled source rects for these polish passes
lower-leg collision coverage may be widened slightly for readability, but only within the lower-leg collision layout and without touching upper legs, body, or core

Current Boss Feedback Pass status:

- the current smoke / ember / spark feedback exists
- at normal gameplay distance the effect is still not consistently readable enough
- the problem is still open and may need another design or asset-level pass later
- for now, keep the effect minimal, fixed to the damage origin, and subordinate to the fight

6. Minor UI/game feel polish:

screen feedback
subtle transitions

KNOWLEDGE SYSTEM

The project no longer relies on local helper docs as the primary decision system.

Instead, all meaningful work flows through the unified knowledge system in `docs/PROJECT_KNOWLEDGE.md` and the external notes under `C:\\Future\\Codex_Skills\\external\\`.

Required decision filters:

- readability
- visual priority
- gameplay impact

Before any non-trivial task, identify which knowledge areas are involved.

Use the knowledge system like this:

- background work -> level design + environment + composition
- projectile work -> projectiles + composition + game feel
- UI work -> composition + ui + readability
- audio work -> audio + game feel
- collision work -> collision + readability
- heavy rendering or effect work -> rendering + performance

Local helper docs are no longer the main workflow and should not be treated as the system of record for this project.

Documentation Maintenance

Keep this file updated after meaningful project changes.

Good updates:
current implemented systems
changed polish direction
new known constraints
next-pass priorities

Avoid:
long changelogs
tiny implementation details
duplicating code comments

Audio Direction

Planned audio style:

retro arcade feel
16-bit inspired sound
synth / electronic atmosphere

Planned sounds:

shooting
explosions
laser charge
warning sounds
hit sounds
boss destruction

Future audio notes:

later add different shooting sounds for different enemy types
add warning / activation sounds for danger zones
check that sounds do not turn into noisy audio clutter
audio polish should be a separate small pass after testing the current new sounds
Codex Workflow Rules

Codex should:

prefer small safe edits
preserve gameplay flow
avoid unrelated changes
avoid architecture rewrites
avoid huge code dumps
avoid adding systems without request

After changes:
prefer short testing instructions instead of long technical explanations.

Backup Policy

Folder:

backup_versions/

contains archived stable versions of the project.

Important:
These files are backups only and should NOT be treated as active working files.

Project Structure Rules

Target structure:

/assets
/assets/sprites
/assets/background
/assets/ui
/assets/audio
/js
/backup_versions
/dev_unused
index.html
docs/PROJECT_NOTES.md

Current interpretation for this project:

active gameplay code stays in `js/`
all runtime sprites stay in `assets/sprites/`
background art should live in `assets/background/`
UI art should live in `assets/ui/`
music and sound assets should live in `assets/audio/`
archived stable snapshots stay in `backup_versions/`
retired experiments and unused working assets should move to `dev_unused/`
short-lived scratch work can stay in `.codex_tmp/` during active editing, but it is not part of the final asset structure
the external knowledge shelf lives in `C:\\Future\\Codex_Skills\\external\\`

Naming rules:

use descriptive lowercase names
prefer `snake_case` or consistent project-style names
use version suffixes only when the role is clear
do not keep random source names in active folders
do not keep files named like `VGcYMK.gif`, `nxeHTF.gif`, or `sbxljd.png` in the active asset tree
if a file is still needed but its purpose is unclear, rename it before it becomes part of the active structure

What goes where:

active sprites and sheets go to `assets/sprites/`
background layers and background experiments go to `assets/background/`
UI icons, panels, and HUD art go to `assets/ui/`
audio assets go to `assets/audio/`
temporary scratch exports and inspection images stay in `.codex_tmp/` only while being evaluated
old experiments, abandoned variants, and one-off test exports should be archived into `dev_unused/` instead of staying mixed with active assets
stable historical snapshots remain in `backup_versions/`

Tools Workflow

Aseprite:

use for sprite editing, frame animation, slices, and export

Tiled:

use for leg geometry, anchors, collision shapes, and other boss data

Verification:

hitboxes come only from data
overlay must draw the same data used by collision
check alignment in `control-in-app-browser`
use Playwright for repeatable visual checks when needed

Rules:

do not align hitboxes with offset tricks
do not maintain separate coordinate systems for render and collision
do not let overlay and collision diverge

Player ship replacement:

current player art is the `we_05` fighter research path from `C:\Future\CyberSpider_Archive\fighter_jet`
active asset file: `assets/sprites/player_fighter.png`
source sprite size: `811x953`
final tested visual scale: `125%`
render size at 125%: `60x80`
final visible nozzle points in the cleaned sprite: `(301,705)` and `(511,705)`
the existing exhaust system stays in use; only the player exhaust placement, layering, and neutrality behavior were adapted
hitbox size and shooting architecture remain unchanged
the old `assets/sprites/1.png` and `assets/sprites/player_ships.png` assets were archived after the replacement stabilized
the previous `assets/sprites/2.png` candidate and the discarded `ChatGPT Image Jun 2, 2026, 11_31_11 PM.png`, `ChatGPT Image Jun 2, 2026, 11_35_53 PM.png`, and `ChatGPT Image Jun 2, 2026, 11_38_50 PM.png` files were moved into `C:\Future\CyberSpider_Archive\dev_unused\player_sprite_candidates_2026-06-02`

Player replacement findings:

- the earlier `we_05` preview looked good in detail but too much like a 3/4 aircraft for this game
- the more top-down `we_19`, `we_15`, and `we_21` candidates were better aligned with the camera, but they were not adopted in the active build
- a long fighter silhouette makes turn readability problems more obvious than a shorter craft
- a simple rotation alone does not create convincing roll on a large jet
- the aircraft perspective matters more than raw detail for `Cyber Spider Shooter`
- aggressive color flattening on the new player sprite made it feel too gray, so future cleanup should stay minimal and symmetric
- exhaust asymmetry should disappear in neutral movement and only appear on actual left/right input
- enlarging the godmode bubble was necessary several times before the new aircraft fit comfortably inside it

Archived player tuning artifacts were moved out of the working tree after the session into `C:\Future\CyberSpider_Archive\temp_artifacts\2026-06-02_player_tuning`

2026-06-02 session recap:

- successful decisions:
  - the player replacement moved to the fighter-derived `assets/sprites/player_fighter.png` asset path
  - the exhaust stayed as a lightweight in-engine system instead of a GIF extraction
  - the godmode bubble was enlarged until the new fighter fit comfortably inside it
  - the environment work kept the boss-zone atmosphere as the only readable active village VFX path
- unsuccessful / abandoned directions:
  - direct `we_05` presentation was too 3/4-looking for the camera
  - heavy roll or yaw-style sideways bias made the ship feel like it was trying to fly sideways
  - the gray color pass on the player sprite flattened the silhouette too much
  - random village fires, window flicker, sparks, and weak pseudo-parallax did not read as useful world detail
- current WIP state at session end:
  - active player art remains `assets/sprites/player_fighter.png`
  - the current visual tuning task is still focused on the player silhouette, roll feel, exhaust balance, and shield fit
  - the fourth June 2 fighter candidate became the shipped active sprite after a clean crop and asset rename
  - all temporary screenshots and comparison files from the day were archived out of the working tree

## 2026-06-07 Housekeeping Close-Out

Successful work from this session:

- Boss Lab is now the separate boss verification path for rebuilding and checking boss geometry safely
- the main game now uses the Boss Lab segmented hitbox model instead of the old broad boss-body approximation
- the boss body is split into 6 segments
- each boss leg is split into 5 segments
- cross-leg hitbox overlap was removed
- the lower leg is fully visible again in the main game
- middle-leg destruction no longer corrupts the upper-leg visual
- the boss missile now has proximity detonation plus a warning beep
- destroyed-leg smoke was restored
- smoke tuning has started in render-style terms without intentionally lowering intensity

Unsuccessful or problematic experiments:

- attempts to repair the old lower-leg visual through the visual / mask pipeline
- partial-fix attempts to restore the missing lower-leg segment
- stump experiments that made the destroyed-leg ends too large, too sharp, and too artificial
- over-weakening the smoke effect until it disappeared visually
- early Boss Lab UX that was too technical and not comfortable enough for a normal inspection workflow

Current state:

- hitbox accuracy is now much better and leg hits are diagnosable
- the lower leg renders fully again
- smoke is back and closer to the target intensity
- the remaining weak points are destroyed-leg visual style, smoke styling, and final boss missile verification

Housekeeping result:

- unused top-level danger-zone source atlases were moved out of the active tree into `C:\Future\CyberSpider_Archive\cyberspider_housekeeping_2026-06-07\assets\sprites`
- the active project folder now keeps only files that are currently used by the game or by project documentation

## Boss Segmentation Close-Out 2026-06-09

Confirmed completed:

- full boss segmentation for all 6 legs
- assembly-safe final: `missing = 0`, `extra = 0`, `changed = 0`
- all segment PNGs: component count `1`, `disconnected = 0`
- validated segmentation workflow is formed and should be reused
- lower-leg `socket-only` destroyed concept is the approved direction

Known remaining problems:

- lower destroyed legs can still leave extra visual forms if the runtime path regresses toward stump-style remnants or long body-owned extensions
- stump-first and mask-first lower-leg fixes were unstable
- the final correct direction for lower destroyed legs is `socket-only` through a body-side runtime mask, not through segmentation edits
- Boss Lab can still display a destroyed-state that does not match the approved preview and is therefore not the source of truth

Next steps:

1. Final lower-leg destroyed-state polish in runtime using the `socket-only` direction.
2. Continue segmented-boss integration in gameplay.
3. Repair Boss Lab separately later; it is not the current blocker.

## Local Boss Lab Run

Use the local dev server for Boss Lab instead of opening `file://` directly.

Primary command:

- `.\tools\run_boss_lab.cmd`

Optional npm command when npm is available:

- `npm run dev`

Boss Lab URL:

- `http://localhost:3000/boss_lab.html`

Tomorrow plan:

1. Develop a strategy for fixing the destroyed-leg visuals without breaking the segmented hitbox model.
   - goal: remove the ugly sharp stumps
   - do not break the new hitbox system
2. Improve the boss missile behavior.
   - check collision
   - check proximity detonation
   - check warning beep
   - check the dangerous zone after the explosion
3. Add collision-triggered explosions for regular enemies.
   - normal enemy dies
   - zigzag enemy dies
   - web enemy dies
   - tank does not die, but takes 50% of its max HP as damage
4. Create readable projectile visuals for:
   - zigzag enemy
   - web enemy
   - the remaining boss attacks except the missile

## Session Close 2026-06-11

### Successful gameplay changes

- doubled HP for the ordinary enemies:
  - basic
  - tank
  - zigzag
  - web
- increased tank missile attack frequency by 20 percent
- increased boss missile launch frequency by 100 percent
- kept boss HP, boss legs, and boss segments unchanged
- preserved the existing collision behaviors for player versus basic, zigzag, web, tank, and boss

### Cleanup

- archived only clearly temporary zigzag crop exports into `C:\Future\CyberSpider_Archive`
- left used assets, boss segments, Boss Lab, project docs, and working tools in place

### Failed or temporary experiments

- boss laser audio diagnostics were noisy and did not converge on a stable one-shot tuning
- the boss laser audio path was temporarily muted during diagnosis so the real source could be isolated later if needed

### Current State

- boss body and leg geometry remain unchanged
- ordinary enemies are tougher than before
- tank missiles now appear more often without changing missile speed, turn rate, or damage
- boss missiles now appear more often without changing missile behavior or damage
- boss laser visual work remains in the game, but its audio path is currently in diagnostic mute state

### Session Close Workflow

After every completed session:

1. Update the project documentation.
2. Record successful and failed experiments.
3. Perform cleanup as an orderly docs/tools layout pass plus moving only truly temporary materials into `C:\Future\CyberSpider_Archive`.
4. Do not archive used assets, Boss Lab, or tools by assumption.
5. Verify that the project still runs correctly.

## Session Close 2026-06-12

### Boss Attack Systems

- Spread Attack now uses two independent lower-body sources.
- Spread Attack disables per side, so destroying one lower leg only removes that side's spread source.
- Web Attack now uses the bright socket pair on the middle legs.
- Web Attack disables per side, so destroying one middle leg only removes that side's web source.
- Missile Attack now uses the inner sockets of the upper legs near the body.
- Missile Attack disables per side, so destroying one upper leg only removes that side's missile source.
- Existing danger zones no longer block new boss missile launches or new boss web shots from firing.
- Boss Rage is now global and is driven by the total number of destroyed legs.
- Laser was intentionally left unchanged.

### Current Rage Coefficients

- 0 destroyed legs = 100%
- 1 destroyed leg = 110%
- 2 destroyed legs = 125%
- 3 destroyed legs = 145%
- 4 destroyed legs = 170%
- 5 destroyed legs = 200%

### Successful Experiments

- split spread attack into two side-specific sources
- moved web attack to the middle-leg sockets
- moved missile attack to the upper-leg sockets
- confirmed side-based disabling for spread, web, and missile
- confirmed global Boss Rage should be based on any destroyed leg, not only matching pairs

### Failed / Rejected Experiments

- repeated boss spread anchor-star overlay tuning did not help once the runtime sources were correct
- pair-based rage timing made the boss feel less consistent than the global leg-count version
- blocking new missile launches behind old danger zones made the attack feel too slow and unresponsive
- using extra diagnostic PNGs as active reference material did not solve the source-selection problem

### Cleanup

- moved temporary boss spread and boss web debug/check/proof PNGs into `C:\Future\CyberSpider_Archive\session_2026-06-12_cleanup`
- removed those temporary check images from the active project root
- left the real assets, source code, Boss Lab, and project docs in place

### Next Priority

1. Laser Attack boss pass.
2. Final Boss Rage playtest and coefficient polish if needed.
3. UI pass.
4. Music.
### UI Session Closeout 2026-06-14

- Canvas stays for gameplay, HUD stub, battle warnings, and in-game overlays.
- HTML/CSS is the main route for main menu, settings, titles, results, and other non-game screens.
- The UI foundation is a thematic drawn background plus HTML/CSS interface plus game typography plus custom button shapes.
- `Space_Game_GUI_PNG` is not the foundation; it remains only a source of individual components if needed.
- `Start_BTN`, `Table`, and menu assembly around the asset pack were unsuccessful experiments.
- `UI_KIT_V2` is an archived course, not an active direction.
- The CSS-first philosophy is archived as a separate branch, but HTML/CSS itself remains the active screen-building approach.
- The next UI priority is the main menu.
- Work should continue one screen at a time.

Cleanup review:

- Keep: `assets/ui/Space_Game_GUI_PNG/`, `css/html-ui.css`, `js/html-ui.js`, and the runtime HTML UI in `index.html`.
- Archive or treat as legacy: `UI_KIT_V2` as an active course, pack-centered menu assembly, and the ideal-pack search.
- Archived earlier and still valid: `docs/UI_KIT_V1.md` and `docs/UI_STYLE_BRIEF.md`.

## Session Close 2026-06-13

- `normal` enemy kills are now tracked as `Таран` in runtime kill statistics.
- the result screen now reports total enemy kills and the `Таран` bucket.
- the ranking curve was softened so a strong run should no longer get stuck on `3`.
- today's UI experiments were rolled back and the old canvas-first shell was restored.
- the next check is a live playtest of the new score / rank curve, not another UI experiment.

## Session Close 2026-06-14

- The main project gameplay branch was restored from `C:\Future\CyberSpider_Archive\game.js.20260613_133518.bak`.
- The 13.06 UI rollback is the confirmed reason the main project briefly fell back to the older canvas-shell.
- UI work is paused until the restored gameplay branch is verified stable.

## Gameplay / Results Update 2026-06-14

- The restored gameplay branch is the active baseline again.
- Canonical enemy names in runtime are now `Таран`, `Паучок`, and `Зигзаг`.
- The enemy sizing pass is locked in as part of the current gameplay state.
- The run-results system is now implemented with a summary view and a details view.
- The summary view shows grade, commentary, score, run time, battle result, and leaderboard placeholder.
- The details view shows kill counts by type, total damage, hit count, slowdown count, missile and danger-zone survival counts, critical HP time, and death reason.
- The current grade target is the school-style scale `2 / 3- / 3 / 4- / 4 / 4+ / 5- / 5 / 5+`.
- Victory guarantees at least `4`.
- `UI_KIT_V2` remains archived as an active course.
- `Space_Game_GUI_PNG` remains only a component source, not the UI foundation.
- The pack-centered menu experiments (`Start_BTN`, `Table`) remain rejected.

## Backup Policy 2026-06-14

- Rollback, restore, large-file replacement, and mass-refactor actions must only happen after a full project backup.
- Full backups must be created in the external archive tree under `C:\Future\CyberSpider_Archive`.
- The working project tree should not be used as the storage location for rollback checkpoints.
- Before any such action:
  - save the files that will be modified separately
  - record the archive path used for the backup
  - include the reverse-restore procedure in the report
