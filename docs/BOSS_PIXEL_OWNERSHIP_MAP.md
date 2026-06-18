# Boss Pixel Ownership Map

## Scope

This map applies only to `assets/sprites/boss_2.png`.

The purpose is to define pixel ownership before any PNG export.

## Source Baseline

- source image: `assets/sprites/boss_2.png`
- full image size: `1536x1024`
- active boss source region: `sx: 182, sy: 168, sw: 1170, sh: 583`
- planned owner set:
  - `body`
  - `upperLeft`
  - `middleLeft`
  - `lowerLeft`
  - `upperRight`
  - `middleRight`
  - `lowerRight`

## Ownership Rules For This Map

- each visible pixel has one owner only
- no shared live pixels between body and leg parts
- body owns ambiguous hidden pixels at every seam
- attachment points are fixed source-space points, not hitbox-derived values
- export remains forbidden until reverse assembly passes

## Parent Structure

- `body` -> root
- `upperLeft` -> child of `body`
- `middleLeft` -> child of `body`
- `lowerLeft` -> child of `body`
- `upperRight` -> child of `body`
- `middleRight` -> child of `body`
- `lowerRight` -> child of `body`

## Source-Space Attachment Table

These coordinates are the initial planning set derived from the current assembled boss configuration and converted into source-space points.
They are meant for reverse-assembly validation first, not for export approval yet.

Important:

- the current sourceRect table is now tuned for reverse-assembly coverage
- this coverage table can overlap and therefore is not yet the final single-ownership export table
- reverse-assembly success does not yet mean the segmentation is export-ready

| partId | parentId | sourceRect | attachParent | attachLocal | pivot | zOrder |
| --- | --- | --- | --- | --- | --- | --- |
| `body` | `null` | `490,168,556,582` | `null` | `null` | `278,144` | `2` |
| `upperLeft` | `body` | `120,168,430,338` | `515,258` | `395,90` | `395,90` | `1` |
| `middleLeft` | `body` | `120,260,430,444` | `457,384` | `337,124` | `337,124` | `3` |
| `lowerLeft` | `body` | `300,382,198,368` | `457,506` | `157,124` | `157,124` | `4` |
| `upperRight` | `body` | `986,168,430,338` | `1019,258` | `33,90` | `33,90` | `1` |
| `middleRight` | `body` | `986,260,430,444` | `1073,384` | `87,124` | `87,124` | `3` |
| `lowerRight` | `body` | `1038,382,198,368` | `1073,506` | `35,124` | `35,124` | `4` |

## Ownership Notes By Part

### `body`

Owns:

- the central armored chassis
- the core housing and visible underside body mass
- all hidden socket pixels under the shoulder and hip armor
- any ambiguous seam pixels where a leg appears to disappear under the hull

Must not own:

- exposed articulated leg segments outside the seam
- visible tip claws

### `upperLeft`

Owns:

- the full exposed top-left leg silhouette from the first visible shoulder joint outward
- all exposed outer plates, glow slits, and claw pixels on that leg

Body keeps:

- buried shoulder-root pixels hidden behind the top-left body armor
- any inner seam shadow that reads as hull depth rather than exposed leg surface

Break line intent:

- split at the first readable exposed shoulder joint
- prefer a seam slightly inside the body cover rather than stealing hull pixels into the leg

### `middleLeft`

Owns:

- the exposed middle-left leg from the first visible hot joint outward
- the bright joint bulb only if it reads as part of the exposed leg, not the hull socket

Body keeps:

- the buried bridge where the leg passes behind side armor
- any seam shadow that supports body depth

Break line intent:

- the exposed orange joint is the leg owner
- the pocket behind it remains body-owned

### `lowerLeft`

Owns:

- the exposed lower-left leg from the first visible lower socket outward
- all visible claw and chain segments

Body keeps:

- underside socket pixels hidden by the belly armor
- any dark transition pixels that visually belong to the abdomen rather than the leg

Break line intent:

- the seam should favor the body on the inner underside
- no red inner-glow duplication between belly and leg

### `upperRight`

Mirror of `upperLeft`.

### `middleRight`

Mirror of `middleLeft`.

### `lowerRight`

Mirror of `lowerLeft`.

## Reverse-Assembly Expectations

The reverse-assembly pass must prove:

- 0 missing pixels
- 0 extra pixels
- no double-owned seam pixels
- no visible drift at 1x
- no visible drift at gameplay scale

If any seam fails:

- revise ownership first
- revise attachment points second
- export still stays blocked

## Breathing Test Expectations

After reverse assembly passes:

- apply a light body breathing offset
- apply a light leg sway around the fixed pivot
- inspect every seam for holes
- inspect every seam for double contour darkening
- inspect every seam for red-glow duplication

If motion creates seam damage, this ownership map is not approved yet.
