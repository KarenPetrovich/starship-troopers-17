# Boss Seam Worklist

## Purpose

This file tracks the remaining work after the reverse-assembly coverage proof.

Current state:

- the 7-part planning set can cover the full live boss source region
- reverse-assembly coverage can reach `0 missing`
- final single-ownership segmentation is still not approved because the current planning rectangles overlap heavily

## Overlap Pairs

Computed from the current reverse-assembly planning rectangles:

- `body <-> upperLeft` -> `490,168,60,338`
- `body <-> middleLeft` -> `490,260,60,444`
- `body <-> lowerLeft` -> `490,382,8,368`
- `body <-> upperRight` -> `986,168,60,338`
- `body <-> middleRight` -> `986,260,60,444`
- `body <-> lowerRight` -> `1038,382,8,368`
- `upperLeft <-> middleLeft` -> `120,260,430,246`
- `upperLeft <-> lowerLeft` -> `300,382,198,124`
- `middleLeft <-> lowerLeft` -> `300,382,198,322`
- `upperRight <-> middleRight` -> `986,260,430,246`
- `upperRight <-> lowerRight` -> `1038,382,198,124`
- `middleRight <-> lowerRight` -> `1038,382,198,322`

## Resolution Order

### 1. Body vs Legs

Priority:

- resolve `body <-> upperLeft`
- resolve `body <-> middleLeft`
- resolve `body <-> upperRight`
- resolve `body <-> middleRight`
- keep ambiguous hidden seam pixels with `body`

Rule:

- body keeps buried socket mass
- leg keeps only visibly detached exposed structure

Initial decisions:

- `body <-> upperLeft`
  - body owns the covered shoulder socket and the inner shadow pocket behind the first exposed top-left joint
  - upperLeft owns the first fully exposed armored cylinder and everything beyond it
- `body <-> middleLeft`
  - body owns the hull pocket and any pixels directly tucked under the side armor
  - middleLeft owns the bright exposed joint bulb and the leg chain after it
- `body <-> lowerLeft`
  - body owns the underside belly pocket and the hidden mount pixels
  - lowerLeft owns the exposed hanging lower chain only after it clears the belly silhouette
- `body <-> upperRight`
  - mirror of `body <-> upperLeft`
- `body <-> middleRight`
  - mirror of `body <-> middleLeft`
- `body <-> lowerRight`
  - mirror of `body <-> lowerLeft`

Current implementation status:

- revised `upperLeft` segment now gives `0` missing, `0` extra, and `0` changed when reassembled with body
- the boundary was moved from the raw rectangular overlap to the visible shoulder joint / socket
- deleting the revised `upperLeft` no longer leaves a long outer leg silhouette behind
- this pair is now approved for `body <-> upperLeft`
- the revised `upperLeft` still needs neighboring seams to be honored by future `middleLeft` / `lowerLeft` exports

### 2. Left-Side Leg Chain

Priority:

- resolve `upperLeft <-> middleLeft`
- resolve `middleLeft <-> lowerLeft`
- resolve `upperLeft <-> lowerLeft`

Rule:

- each exposed joint belongs to exactly one leg owner
- no double-owned red glow around adjacent joints

Initial decisions:

- `upperLeft <-> middleLeft`
  - upperLeft ends at the outer descending chain before the middle-left bulb becomes the dominant visible owner
  - middleLeft starts at the exposed hot joint bulb that visually reads as its shoulder
- `middleLeft <-> lowerLeft`
  - middleLeft owns the upper hanging chain and the visible knee transition above the lower hook
  - lowerLeft starts only at the clearly separated lower hanging chain
- `upperLeft <-> lowerLeft`
  - no direct final seam should remain visible after the middle-left ownership is resolved
  - any current overlap here is a planning-rect artifact, not a final seam

### 3. Right-Side Leg Chain

Priority:

- resolve `upperRight <-> middleRight`
- resolve `middleRight <-> lowerRight`
- resolve `upperRight <-> lowerRight`

Rule:

- mirror the approved left-side ownership decisions

Initial decisions:

- `upperRight <-> middleRight`
  - mirror of `upperLeft <-> middleLeft`
- `middleRight <-> lowerRight`
  - mirror of `middleLeft <-> lowerLeft`
- `upperRight <-> lowerRight`
  - mirror of `upperLeft <-> lowerLeft`

## Required Output For Each Resolved Seam

For every overlap pair, record:

- approved owner on each side of the seam
- whether the seam is visible or hidden
- whether body owns the ambiguous pixels
- whether the final export must clip inside the current planning rect

## Approval Condition

This worklist is complete only when:

- all overlap pairs have an ownership decision
- the final ownership map no longer relies on broad overlapping planning rectangles
- the export table can be written with single ownership
