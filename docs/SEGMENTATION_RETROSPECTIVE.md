# Boss Segmentation Retrospective

## Why This Took Many Iterations

The boss legs are not independent sprites in the source art. `boss_2.png` is a flattened illustration with overlapping limbs, shared glow, and body-owned seam pixels. That meant a clean result could not come from a fast crop or a mask-first pass. Each leg had to be validated not only against reverse assembly, but also against its destroyed read after removal.

The biggest cost driver was that several checks were introduced late instead of at the start. Pixel-perfect reassembly alone was not enough, because a leg could pass diff validation and still leave a fake live-limb silhouette inside `body`. Once destruction-safe and `body-only` validation became mandatory after every leg, the workflow stabilized and iterations dropped.

## Checks That Should Have Happened Earlier

- `body-only` review after every single leg
- connected-component analysis for both the leg export and the updated body
- destruction-safe preview before accepting a seam
- exact reverse-assembly check with `missing = 0`, `extra = 0`, `changed = 0`
- explicit ownership decisions at the joint before exporting PNGs

## Errors That Created Extra Cycles

- treating the visible outer silhouette as the seam instead of the real mechanical joint
- accepting a leg because seam diff looked correct without checking the destroyed state
- allowing foreign pixel islands to survive inside a leg crop
- not checking whether `body` inherited a tip, plate, or emissive fragment from the removed leg
- expanding infrastructure and preview work before producing a real validated segment
- vertical leg cuts
- trying to solve lower destroyed read through stump PNGs
- ignoring disconnected components during acceptance
- trying to repair destroyed-state by reopening segmentation instead of isolating the runtime problem

## Mandatory Workflow From Now On

### Validated Leg Segmentation Workflow

1. Define the sourceRect and the real joint boundary first.
2. Assign every visible pixel to exactly one owner.
3. Export only the leg's own connected visible component.
4. Validate the updated `body-only` immediately.
5. Run assembly-safe and require `missing = 0`, `extra = 0`, `changed = 0`.
6. Run destruction-safe and inspect the removed-leg preview.
7. Run component analysis on both the leg PNG and `body-only`.
8. Only then move the leg into the permanent asset folder.

## How To Do Similar Work Faster Next Time

- start with one reference leg and lock the workflow before touching the rest
- run `body-only`, component analysis, and destruction-safe checks after every leg, not at the end
- prefer exact ownership decisions over temporary overlap or "good enough" masks
- keep Boss Lab available as the permanent manual verification tool
- archive only confirmed temp/debug exports, and never move active assets by assumption
- write progress notes immediately after each accepted stage so a new session can resume without rereading the entire history

## Current Fixed State

- full segmentation is complete for all 6 legs
- final reverse assembly is exact: `missing = 0`, `extra = 0`, `changed = 0`
- all final segment exports have component count `1` and `disconnected = 0`
- the validated segmentation workflow is now explicit and reusable
- the lower-leg `socket-only` destroyed concept is found and approved as the target read

## Current Open Problems

- lower destroyed legs can still leave extra visual forms such as elongated remnants or awkward cutoffs if runtime falls back toward stump-style solutions
- Boss Lab currently can still show a destroyed-state that does not match the approved preview
- Boss Lab also requires local `http` serving and is not the source of truth for final destroyed-state approval
- gameplay destruction works, but lower-leg destroyed read still needs final polish at runtime scale

## Short Correct Workflow

- `ownership -> component cleanup -> assembly-safe -> destruction-safe -> validation`
- destroyed-state solving is separate from segmentation

## Next Steps

1. Finish lower-leg destroyed-state polish in runtime with the `socket-only` direction.
2. Continue segmented boss integration in gameplay.
3. Repair Boss Lab separately later; it is not the current blocker.
