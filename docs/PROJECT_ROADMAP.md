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

Цель документа:
- быть единым центром управления проектом Cyber Spider Shooter
- показывать текущий статус, принятые решения, актуальные документы и следующий шаг
- не давать контексту теряться после пауз

## 1. Текущий статус проекта

### Gameplay
- Статус: завершено базовое проектирование
- Кратко: основная игра playable; сейчас прорабатываются только результаты забега, оценка и пользовательские сценарии вокруг финала

### Boss
- Статус: в работе
- Кратко: бой стабилен, сегментация и читаемость уже зафиксированы; дальше только точечная проверка score-экономики и итоговой аналитики

### UI
- Статус: закрыто до нового решения
- Кратко: HTML/CSS остаётся основным способом строить экраны вокруг игры, Canvas остаётся для gameplay/HUD/оверлеев, а следующая UI-ветка начинает с главного меню и рисованного тематического задника

### Audio
- Статус: не начато
- Кратко: аудио-этап отложен до стабилизации структуры UI и итогов забега

### Ranking
- Статус: в балансе
- Кратко: шкала оценок и runtime-набор данных зафиксированы в `FINAL_RANK_SYSTEM.md` и `RUN_ANALYTICS_RUNTIME.md`, но теперь требуют живой проверки после смягчения порогов

### Mobile
- Статус: в работе
- Кратко: мобильный сценарий учтён в UI-планировании, но отдельная полировка ещё не выполнена

### Release
- Статус: не начато
- Кратко: релизная упаковка и стабилизация пока не запускались как отдельный этап

## 2. Карта документации

| Документ | Назначение | Статус | Используется дальше |
|---|---|---|---|
| [PROJECT_ROADMAP.md](/C:/Future/cyberspider/PROJECT_ROADMAP.md) | Единый центр управления проектом | активный | да |
| [CURRENT_FOCUS.md](/C:/Future/cyberspider/CURRENT_FOCUS.md) | Короткая оперативная сводка | активный | да |
| [PROJECT_NOTES.md](/C:/Future/cyberspider/PROJECT_NOTES.md) | Долгосрочные проектные заметки и история решений | активный | да |
| [PROJECT_KNOWLEDGE.md](/C:/Future/cyberspider/PROJECT_KNOWLEDGE.md) | Ядро проектных правил и знаний | активный | да |
| [UI_SCREEN_MAP.md](/C:/Future/cyberspider/docs/UI_SCREEN_MAP.md) | Карта экранов UI | активный | да |
| [UI_FLOW.md](/C:/Future/cyberspider/docs/UI_FLOW.md) | Карта переходов между экранами | активный | да |
| [RUN_RESULTS_AND_RANKING_DESIGN.md](/C:/Future/cyberspider/docs/RUN_RESULTS_AND_RANKING_DESIGN.md) | Концепция итогов забега, статистики и комментариев | активный | да |
| [RANK_BALANCING_PLAN.md](/C:/Future/cyberspider/docs/RANK_BALANCING_PLAN.md) | Балансировка рангов на основе экономики игры | активный | да |
| [FINAL_RANK_SYSTEM.md](/C:/Future/cyberspider/docs/FINAL_RANK_SYSTEM.md) | Финальная шкала оценок | активный | да |
| [RUN_ANALYTICS_RUNTIME.md](/C:/Future/cyberspider/docs/RUN_ANALYTICS_RUNTIME.md) | Минимальный runtime-набор данных забега | активный | да |
| [RUN_COMMENTARY_SYSTEM.md](/C:/Future/cyberspider/docs/RUN_COMMENTARY_SYSTEM.md) | Система живых комментариев игры | активный | да |
| [BOSS_REBUILD_PLAN.md](/C:/Future/cyberspider/docs/BOSS_REBUILD_PLAN.md) | Исторический контекст по перестройке босса | reference | только как фон |
| [BOSS_SEGMENTATION_PLAN.md](/C:/Future/cyberspider/docs/BOSS_SEGMENTATION_PLAN.md) | Исторический контекст по сегментации босса | reference | только как фон |
| [BOSS_PIXEL_OWNERSHIP_MAP.md](/C:/Future/cyberspider/docs/BOSS_PIXEL_OWNERSHIP_MAP.md) | Исторический контекст по ownership-карте босса | reference | только как фон |
| [BOSS_SEAM_WORKLIST.md](/C:/Future/cyberspider/docs/BOSS_SEAM_WORKLIST.md) | Старый список seam-задач | reference | нет |
| [SEGMENTATION_RETROSPECTIVE.md](/C:/Future/cyberspider/docs/SEGMENTATION_RETROSPECTIVE.md) | Память о решениях по сегментации | reference | да, как контекст |

## 3. Дерево ближайших задач

### Текущий этап
- проверка реальной сложности игры и корректности системы оценок на живых забегах
- подтверждение, что `Таран` учитывается в статистике убийств

### Следующий этап
- `BALANCE & PLAYTEST PASS`
- проверка score economy после смягчения порогов

### После этого
- утверждение `FINAL_RANK_SYSTEM.md`
- утверждение точной награды за тело босса
- утверждение `RUN_COMMENTARY_SYSTEM.md`
- утверждение `RUN_ANALYTICS_RUNTIME.md`
- затем возврат к UI
- UI Wireframe
- Google Stitch
- UI Kit
- базовая реализация интерфейса
- UI POLISH

## 4. Рабочая цепочка

`RUN_RESULTS_AND_RANKING_DESIGN.md`
↓
`RANK_BALANCING_PLAN.md`
↓
`FINAL_RANK_SYSTEM.md`
↓
`RUN_ANALYTICS_RUNTIME.md`
↓
`RUN_COMMENTARY_SYSTEM.md`
↓
`BALANCE & PLAYTEST PASS`
↓
утверждение финальной шкалы оценок
↓
возврат к UI
↓
Wireframe
↓
Google Stitch
↓
UI Kit
↓
реализация интерфейса
↓
`UI POLISH`

## 5. Зафиксированные решения

- тело босса должно давать очки
- точная награда за тело босса уже зафиксирована
- буквенные ранги больше не являются основным вариантом
- основной кандидат ранговой системы: русскоязычная шкала на базе школьных оценок
- runtime-набор данных для итогов, комментариев и рейтинга закреплён в `RUN_ANALYTICS_RUNTIME.md`
- система живых комментариев закреплена в `RUN_COMMENTARY_SYSTEM.md`
- этап `BALANCE & PLAYTEST PASS` нужен до финального UI POLISH
- UI-эксперименты сегодняшней сессии закрыты и не должны перезапускаться без отдельного решения

## 6. Что уже завершено

- базовая игра playable
- бой с боссом стабилизирован на уровне проекта
- карты экранов UI и flow-карта подготовлены
- концепция итогов забега и рейтинга подготовлена
- ранговая экономика проанализирована на основе текущего демо
- финальная шкала оценок закреплена в `FINAL_RANK_SYSTEM.md`
- runtime-набор данных подготовлен в `RUN_ANALYTICS_RUNTIME.md`
- система живых комментариев подготовлена в `RUN_COMMENTARY_SYSTEM.md`

## 7. Что ещё не завершено

- подтверждение `FINAL_RANK_SYSTEM.md`
- проверка точного веса очков за тело босса в живой игре
- подтверждение `RUN_COMMENTARY_SYSTEM.md`
- подтверждение `RUN_ANALYTICS_RUNTIME.md`
- серия живых забегов на этапе `BALANCE & PLAYTEST PASS`
- финальная UI-полировка
- визуальный UI wireframe
- Google Stitch prototype
- реализация интерфейса
- audio-план
- release-план

## 8. Правило использования roadmap

Перед началом любой следующей крупной задачи сначала проверить:
1. текущий статус раздела
2. соответствующий документ в карте документации
3. ближайшую задачу из дерева
4. новые решения, чтобы не повторять закрытые споры

## 9. UI Strategy Reset 2026-06-14

- Canvas stays for gameplay, HUD placeholder, battle warnings, and in-game overlays.
- HTML/CSS is the main framework for main menu, settings, titles, results, and other non-game screens.
- The UI foundation is a drawn thematic background plus HTML/CSS interface plus game typography plus custom button shapes.
- `Space_Game_GUI_PNG` is no longer the direction anchor; it may remain only as a source for individual components.
- `UI_KIT_V2` is legacy and archived.
- The attempts around `Start_BTN`, `Table`, and menu assembly from the asset pack are rejected.
- One screen at a time: main menu is the next UI target.

## 10. Current Override 2026-06-14

- The restored gameplay branch is the active baseline again.
- Enemy naming is canonical in runtime as `Таран`, `Паучок`, and `Зигзаг`.
- The run-results system is implemented and includes the summary view, the details view, random commentary, score, time, battle result, and leaderboard placeholder.
- The approved rating scale is `2 / 3- / 3 / 4- / 4 / 4+ / 5- / 5 / 5+`.
- Victory guarantees at least `4`.
- Canvas remains the gameplay layer, HUD stub, battle warnings, and combat overlays.
- HTML/CSS remains the framework for non-game screens.
- One screen at a time remains the operating rule.
- The next UI target is still the main menu, after the gameplay baseline and result screen are stable.
- `Space_Game_GUI_PNG` is component stock only, not the foundation.
- `UI_KIT_V2`, CSS-first as a separate philosophy, pack-centered menu assembly, and the ideal-pack search are archived.

## 11. Backup Rule 2026-06-14

- Any rollback, restore, large-file replacement, or mass refactor must start with a full backup in `C:\Future\CyberSpider_Archive`.
- The backup report must name the archive path, the files saved separately, and the way to restore the previous state.
- No future rollback should use the working project tree as the backup location.

### Current UI Roadmap State

Gameplay restoration state:

- The active gameplay branch has been restored from `C:\Future\CyberSpider_Archive\game.js.20260613_133518.bak`.
- The 13.06 UI rollback is the confirmed cause of the stale canvas-shell in the main project.
- UI work is paused until gameplay verification is complete.

1. Build the main menu as the next screen.
2. Canvas remains responsible for gameplay, HUD, warnings, and in-game overlays.
3. HTML/CSS is the shell for non-game screens.
4. The visual style should come from illustrated backgrounds, game typography, and custom button shapes.
5. `Space_Game_GUI_PNG` is only a component pool, not the foundation.
6. `UI_KIT_V2` and pack-centered menu assembly are archived directions.
7. The old CSS-first philosophy is archived.
