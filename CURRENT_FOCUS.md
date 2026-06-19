# CURRENT FOCUS

CURRENT COURSE
- The accepted UI direction is now `panel.png` as the common shell for settings, controls, sound, language, leaders, titles, results, and detailed results.
- HTML/CSS owns all non-game screens. Canvas stays for gameplay, HUD, warnings, and combat overlays.
- PC is the source of truth. Mobile work is valid only when PC behavior stays unchanged.
- Mobile development is local-only until explicit release approval. Use the local dev server and real-device LAN testing; do not push mobile iteration work to GitHub Pages during the stabilization phase.
- Mobile is UI-only. Do not let device logic modify gameplay core: player size, enemy size, camera scale, gameplay viewport, canvas internal resolution, or the rendering pipeline.
- Canvas CSS fit may adapt to the screen, but internal gameplay rendering must stay device-agnostic.
- Mobile layer must stay removable: disabling touch/mobile UI must not change PC gameplay or rendering behavior.
- `BoldPixels` is the chosen UI font, but its sizes, spacing, and hierarchy still need a dedicated revision pass.
- The current highest-priority open bug is the unified button activation path: the real interface still does not consistently show the red click phase, glow, and delay for keyboard activation.
- The next session must start by fixing button activation consistency before any more UI composition work.
- The next gameplay-facing step after that is the live game/HUD readability pass.
- Temporary UI experiments, screenshots, and scratch exports should be kept out of the active project tree and moved to `C:\Future\CyberSpider_Archive`.

APPROVED
- `panel.png` as the main UI container.
- One shared screen model for the non-game UI.
- Unified button states: `NORMAL`, `HOVER`, `CLICK`.
- Real game data feeding the results screen.

NEXT SESSION
- Fix unified button activation so mouse, Enter, and Space share the same delayed click-state path in the real interface.
- Verify ESC pause behavior during active gameplay.
- Then switch the focus to gameplay canvas / HUD readability.
