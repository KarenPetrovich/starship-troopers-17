# Boss Segmentation Plan

## Scope

This plan applies only to the segmentation of `assets/sprites/boss_2.png`.

Goal:

- replace the current broken mask-first direction with a clean segmented ownership model
- define stable boss parts, anchors, and attachment points before any export pass
- prove that the segmented boss can be reassembled back into the original visual without drift

Hard stop:

- do not export PNG parts before the reverse-assembly check passes

## Core Rules

### 1. Reverse Assembly First

The first proof is not destruction.
The first proof is that all planned parts can be reassembled into the original `boss_2.png` read with no visible drift, no missing pixels, and no accidental doubles.

Required before export:

- source regions are defined
- attachment points are defined
- part order is defined
- reverse-assembly check is visually approved

### 2. Single Ownership Rule

Every visible boss pixel must have exactly one owner.

Rules:

- one visible piece, one owner
- no shared live pixels between two exported parts
- no “temporary overlap for now” ownership
- if two parts seem to need the same pixels, ownership must be decided before export

### 3. Attachment Point System

Every detachable boss piece needs explicit attachment metadata.

Each part must define:

- `partId`
- `parentId`
- `attachLocal`
- `attachParent`
- `pivot`
- `zOrder`

Minimum intended part set for planning:

- `body`
- `upperLeft`
- `middleLeft`
- `lowerLeft`
- `upperRight`
- `middleRight`
- `lowerRight`

### 4. Body Owns Hidden Pixels

If a seam creates ambiguity, the body owns the hidden or covered pixels unless a different owner is explicitly justified.

Meaning:

- leg roots do not steal buried body pixels just to make destruction easier
- parts should separate cleanly at readable break lines
- any pixel not meant to appear as a detached leg silhouette should stay with the body by default

### 5. Breathing Test

Segmentation must survive small motion.

Check:

- a subtle body breathing offset
- a subtle leg sway / idle offset
- no seam tearing
- no hole flicker
- no double-dark edge where parts meet

If breathing breaks the seams, ownership or attachment points are wrong.

### 6. Visual Debug Mode

Segmentation work must be inspectable in a debug view before export.

Debug mode must be able to show:

- part bounds
- attachment points
- pivots
- parent-child links
- draw order
- toggled isolation of each part
- reverse-assembly comparison against the untouched source

### 7. Pixel Ownership Map

Before export, produce an explicit ownership map for the boss image.

The map can be a planning document or debug overlay, but it must answer:

- which region belongs to body
- which region belongs to each leg
- where the break line is
- where hidden support pixels remain with the body

No ambiguous seam should remain undocumented.

## Execution Order

### Phase 1. Source Audit

- confirm the working source is `assets/sprites/boss_2.png`
- confirm image size and current live usage
- lock the untouched source as the segmentation baseline

Deliverable:

- approved source baseline

### Phase 2. Part Definition

- define the seven planned boss parts
- define tentative break lines
- define parent-child structure
- define attachment points and pivots

Deliverable:

- part table with ownership and anchors

### Phase 3. Reverse Assembly Check

- rebuild the boss from planned parts only
- compare against the original boss read
- inspect all seams at 1x and gameplay scale
- verify no missing pixels, no duplicates, and no drift

Gate:

- if reverse assembly fails, go back to Phase 2
- PNG export remains forbidden

### Phase 4. Breathing Test

- apply small body breathing
- apply small leg sway
- test seams under motion

Gate:

- if seams break under motion, go back to Phase 2

### Phase 5. Export Approval

PNG export is allowed only if both are true:

- reverse assembly is approved
- breathing test is approved

### Phase 6. Export

- export parts with stable names
- preserve pivots / attachment metadata separately
- keep naming technical and stable

## Planned Output Table

Each exported part should eventually have:

- `partId`
- `sourceRect`
- `pivot`
- `attachLocal`
- `attachParent`
- `parentId`
- `zOrder`
- `notes`

## Explicit Non-Goals For This Step

This step is not for:

- collision redesign
- danger zone changes
- boss missile changes
- attack logic changes
- destruction animation polish
- intermediate damaged states

Those are downstream tasks.
This task is only about obtaining a clean segmented boss ownership model from `boss_2.png`.

## Validated Leg Segmentation Workflow

`upperLeft` is the validated reference leg for the remaining segmentation work.

Every remaining leg must follow this exact workflow:

1. ownership boundary follows the real joint / readable mechanical seam
2. leg PNG contains only its own connected visible limb component
3. no disconnected components and no foreign pixel islands remain in the leg export
4. current `body-only` must remain clean after every accepted leg:
   - one main visible component
   - `disconnected = 0`
   - no foreign tip, plate, or emissive island left behind
5. assembly-safe must pass with:
   - `missing = 0`
   - `extra = 0`
   - `changed = 0`
6. destruction-safe must pass:
   - no surviving live-leg silhouette after removal
   - no long sharp leftovers
   - no hanging emissive fragments that read as the removed leg
   - remaining stump reads as a natural socket / cutoff
7. component analysis must pass:
   - correct visible component count
   - `disconnected = 0`

Additional execution rules for the remaining legs:

- do not use automatic mirroring
- validate each leg separately because body overlaps and seam shapes differ
- if a new artifact appears, stop on that leg, localize the cause, fix it, then continue

## Boss Production Workflow

Use this production order for any future boss leg addition or replacement:

1. define the leg crop / sourceRect before export
2. define ownership against `body` first, then against neighboring legs
3. export only the leg's own connected visible component
4. verify the updated `body-only` immediately after that leg
5. run assembly-safe on the updated `body + current accepted legs`
6. run destruction-safe on the removed-leg preview, not only on pixel diff
7. run component analysis on both the leg PNG and `body-only`
8. move the result into the live boss asset folder only after all checks pass

Mandatory pre-integration checks before anything moves into gameplay:

- ownership boundary follows a real joint, not an arbitrary silhouette cut
- `body-only` has no disconnected fragments
- the leg PNG has exactly one intended visible connected component
- reverse assembly is exact against `boss_2.png`
- the removed-leg preview leaves a readable socket with no fake surviving limb
- Boss Lab remains available for manual visual confirmation

## Approval Rule

Do not export PNG parts until:

1. reverse assembly is approved
2. breathing test is approved
3. pixel ownership map is explicit
4. attachment points are fixed

## Progress Log

### 2026-06-08 - Completed

Phase 1. Source Audit:

- confirmed working source: `assets/sprites/boss_2.png`
- confirmed full source image size: `1536x1024`
- confirmed current live boss source region in code: `182,168,1170,583`
- locked `boss_2.png` as the untouched segmentation baseline

Phase 2. Initial Part Definition:

- created the first segmentation plan for the 7-part boss structure
- established the owner set:
  - `body`
  - `upperLeft`
  - `middleLeft`
  - `lowerLeft`
  - `upperRight`
  - `middleRight`
  - `lowerRight`
- established the ownership rule that ambiguous hidden seam pixels stay with `body`
- established the initial attachment-point / pivot table in source space
- created `BOSS_PIXEL_OWNERSHIP_MAP.md` as the explicit ownership document for the current pass

### 2026-06-08 - In Progress

Phase 3. Reverse Assembly Check:

- started integrating a dedicated reverse-assembly / ownership debug pass into `boss_lab.html` + `js/boss_lab.js`
- current goal of this lab pass:
  - render boss from planned sourceRect parts
  - show ownership overlay
  - report reverse-assembly pixel differences against the untouched source region
- first playable reverse-assembly pass is now wired:
  - `V` / `Assembly V` toggles assembled-from-parts rendering
  - `M` / `Ownership M` toggles ownership overlay with attachment / pivot markers
  - the lab computes a pixel-difference report against the untouched boss source region
  - status text now reports assembly / ownership mode state and reverse-assembly diff counts
- local pixel-audit checkpoint:
  - the original coarse 7-rect coverage missed `2300` source pixels
  - after widening the planning coverage rects for the body and leg groups, the reverse-assembly coverage check reached `0 missing`
  - this proves the current 7-part planning set can cover the live boss source region
- created `BOSS_SEAM_WORKLIST.md` to track the remaining overlap conflicts that still block final single-ownership export
- recorded the first seam decisions for:
  - `body <-> upper/middle/lower` on both sides
  - left and right leg-chain ownership transitions
- added the first breathing-test implementation to `boss_lab`:
  - `N` toggles a subtle up/down idle motion for body and leg groups
  - the breathing test now exists as an explicit lab pass after reverse assembly, not as an export-side surprise
- added seam-conflict overlay support to `boss_lab`:
  - overlap pairs from the seam worklist are now represented in the lab data
  - ownership mode can now be extended to inspect exact overlap zones instead of relying on notes alone
- first real segment export completed:
  - exported `assets/sprites/boss_segments/upperLeft.png`
  - current exported `upperLeft` owns `16376` opaque pixels total
  - in the `body <-> upperLeft` overlap zone it owns `0` pixels, so that seam is currently assigned to body
  - it currently claims `15185` pixels in the `upperLeft <-> middleLeft` overlap zone and `608` pixels in the `upperLeft <-> lowerLeft` overlap zone
  - reverse-assembly test with this first real segment currently reports `missing = 1098`, `extra = 0`, `changed = 0`
- upper-left destruction check completed:
  - seam-only reconstruction for `body + upperLeft` still passes with `lost = 0` and `changed = 0` inside the `body <-> upperLeft` overlap zone
  - destruction behavior does not yet pass visual approval
  - removing the current exported `upperLeft` from the full boss leaves `44358` source pixels behind inside the `upperLeft` planning region
  - of those leftovers, `16684` are inside the body seam rectangle and can read as body-owned socket mass
  - but `27674` leftovers remain outside the body area and `6766` of them are red emissive-like pixels
  - this means the current `upperLeft` export is acceptable for seam diff validation but not yet acceptable for live leg destruction
  - segmentation must be revised before treating `upperLeft` as a production-ready detachable leg
- revised `upperLeft` ownership boundary completed:
  - moved the cut away from the rectangular body overlap and back to the visible shoulder joint / socket
  - exported the revised part to `assets/sprites/boss_segments/upperLeft.png`
  - the revised `upperLeft` now owns the full visible outer limb while body keeps only a compact socket stump
  - assembly-safe validation for the revised split now passes with `missing = 0`, `extra = 0`, `changed = 0`
  - destruction-safe validation for the revised split now removes the long outer silhouette
  - after deleting the revised `upperLeft`, only `3485` pixels remain outside the body rectangle in the planning crop and `740` of those are emissive-like
  - those remaining pixels read as the compact socket / stump area rather than a still-alive outer leg silhouette
  - `upperLeft` is now approved as the first part that passes both assembly-safe and destruction-safe checks
- preview bug root cause identified and cleaned:
  - the first revised `upperLeft` still contained large disconnected components from `middleLeft` and `lowerLeft`
  - those foreign components caused the apparent rectangular cut when the debug preview subtracted the whole `upperLeft` mask from the boss image
  - cleaned `upperLeft` to its own upper-leg connected component plus tiny shoulder fragments only
  - after cleanup, the rectangular preview cut disappears
  - revalidation after cleanup still passes with `missing = 0`, `extra = 0`, `changed = 0`
  - cleaned component export replaced `assets/sprites/boss_segments/upperLeft.png`
- disconnected left fragment ownership resolved:
  - the obvious floating fragment on the left was not foreign debris; it was the lower tip of the upper-left leg that had been cut off by a too-short `upperLeft` crop
  - before the fix, that tip stayed in `body` ownership and therefore appeared as a disconnected fragment after upper-left leg removal
  - expanded the `upperLeft` export downward and reassigned that tip back to `upperLeft`
  - removed the remaining tiny disconnected shoulder specks from `upperLeft` so the leg export is now a single visible connected component
  - visible-silhouette component analysis now reports:
    - `upperLeft`: `1` component, `0` disconnected, size `21355`
    - `body`: `1` component, `0` disconnected, size `247085`
    - `assembled`: `1` component, `0` disconnected, size `268440`
  - assembly-safe still passes with `missing = 0`, `extra = 0`, `changed = 0`
- `upperLeft` is now locked as the validated reference for the remaining leg workflow
- Stage 1 completed for:
  - `upperRight`
  - `middleLeft`
- exported:
  - `assets/sprites/boss_segments/upperRight.png`
  - `assets/sprites/boss_segments/middleLeft.png`
- both Stage 1 legs now use ownership boundaries at readable joint / socket transitions
- component analysis for the new leg exports now reports:
  - `upperRight`: `1` component, `0` disconnected, size `21732`
  - `middleLeft`: `1` component, `0` disconnected, size `20811`
- combined Stage 1 reassembly with `upperLeft + upperRight + middleLeft` now passes:
  - `missing = 0`
  - `extra = 0`
  - `changed = 0`
- destruction-safe review:
  - `boss without upperRight` leaves a readable shoulder stump and no surviving live-leg silhouette for `upperRight`
  - `boss without middleLeft` leaves a readable socket / stump and no surviving live-leg silhouette for `middleLeft`
- no new blocking artifact at the `upperLeft` severity level remains in Stage 1 outputs
- Stage 1 right-side disconnected fragment resolved:
  - the fragment at source coordinates approximately `1322..1335, 506..517` belonged to `upperRight`
  - the previous `upperRight` export was only `338` pixels high and ended at source row `505`, cutting off the final tip of the leg
  - expanded `upperRight` from `430x338` to `430x352` and reassigned the complete tip from `body` to `upperRight`
  - returned one unrelated visible `2`-pixel island near the joint to `body`
  - updated `assets/sprites/boss_segments/upperRight.png`
  - final visible-silhouette component analysis now reports:
    - `upperRight`: `1` component, `0` disconnected, size `21849`
    - Stage 1 `body-only`: `1` component, `0` disconnected, size `204425`
    - Stage 1 `assembled`: `1` component, `0` disconnected, size `268440`
  - corrected Stage 1 assembly still passes with `missing = 0`, `extra = 0`, `changed = 0`
- Stage 2 completed for:
  - `middleRight`
  - `lowerLeft`
- exported:
  - `assets/sprites/boss_segments/middleRight.png`
  - `assets/sprites/boss_segments/lowerLeft.png`
- sequential body-only validation was added to the production workflow:
  - after adding `middleRight`, body-only reports `1` component, `0` disconnected, size `187197`
  - after adding `lowerLeft`, Stage 2 body-only reports `1` component, `0` disconnected, size `176054`
- final Stage 2 leg component analysis reports:
  - `middleRight`: `1` component, `0` disconnected, size `17228`
  - `lowerLeft`: `1` component, `0` disconnected, size `11143`
- destruction-safe review:
  - removing `middleRight` leaves only the readable side socket with no leg tip, pixel island, or hanging emissive fragment
  - removing `lowerLeft` leaves only the lower socket / cutoff with no surviving sharp leg silhouette
- combined Stage 2 reassembly now passes:
  - `missing = 0`
  - `extra = 0`
  - `changed = 0`
- Stage 2 assembled boss reports `1` visible component and `0` disconnected components
- Stage 2 visual review corrections:
  - `middleRight` previously left the first exposed armor plate after the luminous socket in body ownership
  - transferred `2959` visible pixels from body to `middleRight`
  - body now keeps only the round socket and its short buried transition
  - updated `assets/sprites/boss_segments/middleRight.png`
  - corrected `middleRight` reports `1` component, `0` disconnected, size `20187`
  - corrected Stage 2 body-only reports `1` component, `0` disconnected, size `173095`
  - corrected Stage 2 assembly still passes with `missing = 0`, `extra = 0`, `changed = 0`
- `lowerLeft` live ownership and PNG remain unchanged
- prepared a destroyed-state-only hide mask candidate for `lowerLeft`:
  - suppresses `1329` body-owned pixels from the long external stump
  - leaves the compact socket / root nearest the hull
  - does not alter the live leg or reverse assembly
  - review files are stored under `.codex_tmp/lowerLeft_destroyed_review`
- revised the `lowerLeft` destroyed-state mask to v2 after visual review:
  - v1 still left a long plate and a narrow sharp tail below the mount
  - v2 suppresses `5509` body-owned pixels covering the complete external plate and lower spike
  - the destroyed state now leaves only the compact round mount directly below the hull
  - live `lowerLeft.png` remains unchanged
  - live boss assembly remains unchanged
  - final v2 review and mask files are stored under `.codex_tmp/lowerLeft_destroyed_v2`
- prepared `lowerLeft` destroyed-state v3:
  - starts from the short socket established by v2
  - restores `1598` body-owned pixels, approximately `29%` of the area hidden by v2
  - restores only a compact upper armor fragment next to the socket
  - uses a tapered diagonal silhouette with small irregular notches instead of a vertical or rectangular edge
  - keeps the long lower plate and spike hidden
  - live `lowerLeft.png` and live assembly remain unchanged
  - v3 review files are stored under `.codex_tmp/lowerLeft_destroyed_v3`
- prepared `lowerLeft` destroyed-state v4:
  - keeps approximately the same restored area as v3 (`1562` visible pixels versus `1598`)
  - shifts the fragment mass upward and closer to the round mount
  - removes the sharp lower projection
  - uses three irregular edge notches to create a blunt broken-joint silhouette
  - does not restore the long outer plate
  - live `lowerLeft.png` and live assembly remain unchanged
  - v4 review files are stored under `.codex_tmp/lowerLeft_destroyed_v4`
- finalized `lowerLeft` destroyed-state v5 after ownership localization:
  - the disputed plate and thin lower tail are body-owned pixels
  - v5 hides the complete plate and tail, including the final sharp tip below the joint
  - only the compact round red socket remains visible
  - `5742` opaque source pixels are suppressed by the destroyed-state mask
  - live `lowerLeft.png` and live assembly remain unchanged
  - final mask, transparent result, checker preview, and ownership comparison are stored under `.codex_tmp/lowerLeft_destroyed_v5`
- Stage 3 completed for:
  - `lowerRight`
- exported:
  - `assets/sprites/boss_segments/lowerRight.png`
- `lowerRight` final ownership result:
  - the accepted export keeps only the lower hanging chain from the `198x368` sourceRect
  - the overlapping `middleRight` chain and the tiny foreign top fragment were excluded from the final leg PNG
  - `lowerRight` reports `1` component, `0` disconnected, size `12176`
  - final `body-only` reports `1` component, `0` disconnected, size `160919`
  - final assembled boss reports `1` component, `0` disconnected, size `268440`
  - final reverse assembly passes with `missing = 0`, `extra = 0`, `changed = 0`
  - removing `lowerRight` leaves a readable lower-right socket with no surviving live-leg silhouette, no hanging tip, and no disconnected island
- final permanent segmented outputs now live in:
  - `assets/sprites/boss_segments/upperLeft.png`
  - `assets/sprites/boss_segments/middleLeft.png`
  - `assets/sprites/boss_segments/lowerLeft.png`
  - `assets/sprites/boss_segments/upperRight.png`
  - `assets/sprites/boss_segments/middleRight.png`
  - `assets/sprites/boss_segments/lowerRight.png`

## What Worked

- reverse assembly validation against the untouched `boss_2.png`
- explicit pixel ownership workflow instead of cut-first masking
- assembly-safe checks after every accepted leg
- destruction-safe checks on the removed-leg preview
- component analysis on both the leg export and the updated `body-only`
- body-only validation after every accepted leg
- explicit search for disconnected fragments and foreign islands
- using `upperLeft` as the validated reference before scaling the workflow

## What Did Not Work

- drawing the ownership boundary through the visible form of the leg instead of through the real joint
- accepting pixel diff alone without checking the destroyed state
- skipping `body-only` validation after a leg export
- skipping disconnected-fragment analysis
- treating a leg as accepted before checking how the removed-leg state actually reads

## Completion Status

Segmentation is complete for all six legs.

Final acceptance criteria:

- all 6 legs are segmented
- final `body` contains no detached-leg ownership leaks
- no disconnected fragments remain in the final leg PNGs or in final `body-only`
- final assembled boss is visually and pixel-identical to `assets/sprites/boss_2.png`
- final pixel diff is `0`
- final component state for every segment is `1` visible component with `disconnected = 0`
- final workflow is now locked as the validated segmentation workflow for future similar work

Open follow-up:

- lower-leg `socket-only` destroyed preview is the approved direction
- lower-leg destroyed-state polishing remains a separate runtime task
- Boss Lab can still display a destroyed-state that does not match the approved preview and is therefore not the source of truth
- Boss Lab also requires local `http` serving and is a separate maintenance task, not a segmentation blocker
- segmentation itself must not be reopened in order to solve destroyed-state polish

## Post-Completion State 2026-06-09

Confirmed complete:

- full segmentation of all 6 detachable legs
- assembly-safe final: `missing = 0`, `extra = 0`, `changed = 0`
- all segment exports: component count `1`, `disconnected = 0`
- validated workflow: `ownership -> component cleanup -> assembly-safe -> destruction-safe -> validation`

Current known problems outside segmentation:

- lower destroyed legs can still show extra visual forms if runtime falls back toward stump-like or elongated remnants
- stump and broad mask attempts for lower-leg destroyed read were unstable
- Boss Lab currently does not guarantee the approved lower destroyed preview and should not be treated as truth
- gameplay destruction works, but lower-leg destroyed read still needs final polish at runtime scale

Failed approaches now explicitly closed:

- vertical leg cuts
- stump-PNG-first lower destroyed fixes
- ignoring disconnected fragments
- changing segmentation when the real remaining problem is destroyed-state rendering
