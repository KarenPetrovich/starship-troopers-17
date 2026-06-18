# UI Screen Map

Current active implementation:
- `index.html` owns the non-game UI screens.
- `js/game.js` owns gameplay, HUD, warnings, and combat overlays.
- the old canvas menu route is archived

Accepted screen family:
- `НАСТРОЙКИ`
- `УПРАВЛЕНИЕ`
- `ЗВУК`
- `ЯЗЫК`
- `ЛИДЕРЫ`
- `ТИТРЫ`
- `РЕЗУЛЬТАТЫ`
- `ПОДРОБНЫЕ РЕЗУЛЬТАТЫ`

Shared structure:
- background visible behind the panel
- `panel.png` as the screen shell
- content inside the panel
- metal buttons in the footer or panel area
- a single `BoldPixels`-based title style

Current screen notes:
- `НАСТРОЙКИ` is the layout template for the rest of the panel screens
- `УПРАВЛЕНИЕ` still needs a better density and hierarchy pass
- `РЕЗУЛЬТАТЫ` is already wired to real run data, but the typography still needs work
- `ЛИДЕРЫ` and `ТИТРЫ` should follow the same panel language, not a separate visual system

What is intentionally not separate anymore:
- victory and defeat are both part of the same results screen
- details are a second view of the same results screen, not a new screen family
