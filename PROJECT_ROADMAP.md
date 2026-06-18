# Project Roadmap

## Current Direction
- Gameplay is stable enough for UI work to continue in parallel.
- The accepted non-game UI foundation is `panel.png` with HTML/CSS screens built around it.
- The main supported screens are:
  - `НАСТРОЙКИ`
  - `УПРАВЛЕНИЕ`
  - `ЗВУК`
  - `ЯЗЫК`
  - `ЛИДЕРЫ`
  - `ТИТРЫ`
  - `РЕЗУЛЬТАТЫ`
  - `ПОДРОБНЫЕ РЕЗУЛЬТАТЫ`

## Accepted UI Model
- Background remains visible behind the panel.
- `panel.png` is the main container for each screen.
- Content lives inside the panel.
- Metal-style buttons live below or inside the panel footer, depending on the screen.
- `BoldPixels` is the current UI font family.

## Current UI Problems
- `BoldPixels` still needs a size and hierarchy pass. It is sometimes too small and sometimes too heavy.
- `УПРАВЛЕНИЕ` needs a better composition pass so the information blocks feel denser and more readable.
- `РЕЗУЛЬТАТЫ` needs larger, clearer typography and more efficient use of panel space.

## Next Session Order
1. Typography review for `BoldPixels`.
2. Controls composition pass.
3. Results readability pass.
4. Then continue with the remaining screens using the same panel system.

## Cleanup Rule
- Keep active assets, code, and current docs in the main tree.
- Move temporary screenshots, UI experiments, and abandoned variants to `C:\Future\CyberSpider_Archive` after verifying they are not referenced by the active build.
