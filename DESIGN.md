# Design — MergeKit

**World: the box score.** MergeKit is a page of standings: totals, streaks, leaderboards and weekly challenges. It borrows the sports almanac's grammar: crisp white paper, black ink, a heavy rule over every table, narrow scoreboard numerals, and one team colour (MergeKit green) for what counts. The generic dark dashboard with glowing green accents is gone.

## Tokens (`frontend/css/style.css` `:root`)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FAFAF7` | ground |
| `--sheet` | `#FFFFFF` | panels |
| `--rule` / `--rule-strong` | `#E3E3DC` / `#1B1F23` | table rules / the 2–3px heavy rule over each table and the masthead |
| `--well` | `#F0F0EA` | bar tracks, empty heatmap cells |
| `--ink` / `--ink-2` / `--ink-3` | `#15191D` / `#4A5056` / `#6A7076` | text levels |
| `--accent` / `--accent-2` / `--accent-tint` | `#0B7A55` / `#08613F` / `#E2F1EA` | brand, merged, primary |
| `--open` / `--open-tint` | `#2457C5` / `#E5ECFA` | open PRs |
| `--closed` / `--closed-tint` | `#C4382F` / `#F9E6E4` | closed PRs, deletions |
| `--gold` | `#A77700` | first place, stars, pending |

PR status is always green = merged, blue = open, red = closed, across chips, timeline markers, the donut and the legend.

Heatmap scale: `--well` → `#BFE2D1` → `#7EC4A5` → `#2E9A6E` → `#08613F`.

### Type
One family: **Archivo** with its width axis.
- Numerals and headings: weight 800, width 70–85% (`font-stretch`), tabular figures.
- Page titles: `clamp(30px, 4vw, 48px)`. Section titles: `clamp(24px, 2.6vw, 32px)`.
- Body 15px; labels 14px in sentence case, never tiny uppercase.

### Shape and space
- Radius 6px; chips and badges are pills.
- Page padding `clamp(16px, 2.4vw, 32px)`, gaps 16px between panels.

## Components
- **Masthead nav:** a 3px ink rule underneath; the active tab is underlined in green and the underline scales in.
- **Stat strip:** one table row of figures split by 1px rules. The first figure (total contributions) is larger and green. It reflows to 3, then 2 columns.
- **Standings tables** (leaderboard, discovery list): a heavy top rule and row rules, with the rank in narrow numerals. Your own row is tinted green.
- **Card titles:** a 2px ink rule under each title, like a newspaper table header.
- **AI panel:** an inverted ink block, three columns split by rules.
- **Charts:** flat green bars, a thin line without points, and a donut in the three status colours, with pale gridlines and no axis border.

## Motion
- Tab switches fade and rise 6px.
- The nav underline scales in. The impact ring animates its stroke.
- Reduced motion turns these off.
