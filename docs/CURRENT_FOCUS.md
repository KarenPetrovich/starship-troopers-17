# CURRENT FOCUS

CURRENT COURSE
- The accepted UI direction is now `panel.png` as the shared shell for settings, controls, sound, language, leaders, titles, results, and detailed results.
- HTML/CSS owns non-game screens. Canvas stays for gameplay, HUD, warnings, and combat overlays.
- PC is the source of truth. Mobile work is valid only when PC behavior stays unchanged.
- Mobile development is local-only until explicit release approval. Use the local dev server and real-device LAN testing; do not push mobile iteration work to GitHub Pages during the stabilization phase.
- Mobile is UI-only. Do not let device logic modify gameplay core: player size, enemy size, camera scale, gameplay viewport, canvas internal resolution, or the rendering pipeline.
- Canvas CSS fit may adapt to the screen, but internal gameplay rendering must stay device-agnostic.
- Mobile layer must stay removable: disabling touch/mobile UI must not change PC gameplay or rendering behavior.
- `BoldPixels` is the chosen UI font, but its size, spacing, and hierarchy still need a dedicated revision pass.
- The controls screen is functional, but its composition and density still need improvement.
- The results screen is connected to real game data, but the typography is still too small in places and the panel space can be used better.
- The next UI session should start with typography, then controls layout, then results readability.

APPROVED
- `panel.png` as the main UI container.
- One shared screen model for the non-game UI.
- Unified button states: `NORMAL`, `HOVER`, `CLICK`.
- Real game data feeding the results screen.

NEXT SESSION
- Typography audit for `BoldPixels`.
- Controls composition pass.
- Results readability pass.
- Continue the screen-by-screen UI approach after the current baseline is stable.
