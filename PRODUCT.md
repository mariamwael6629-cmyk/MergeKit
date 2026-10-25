# Product

<!-- impeccable:product-schema 1 -->

> Inferred from the README and code. The owner asked the redesign to proceed on inferred context; treat each line as an assumption until confirmed.

## Platform

web

## Users
Developers who contribute to open source and want a running record of it: what they merged, where, how often, and what to pick up next. They check it at their desk, often between other work.

## Product Purpose
MergeKit aggregates a developer's pull requests across repositories into a dashboard (totals, heatmap, streak, languages, impact score, AI suggestions, recent activity), a filterable PR portfolio, a repository discovery list ranked by match, a community page (weekly leaderboard, challenges, live feed) and analytics charts.

## Capabilities and Constraints
- Zero-build static SPA (HTML/CSS/vanilla JS, Tabler icons, Chart.js from cdnjs) on a FastAPI backend.
- Tabs switch with `switchTab()`; all data comes from `/api/*`.
- "Connect GitHub" is a button; the seed data is demo data.

## Brand Commitments
- Name "MergeKit" (with "Kit" in the brand colour) and the pull-request logo mark in green.

## Evidence on Hand
- Seeded demo user "Amir Khalil" and demo repos, PRs and leaderboard in the backend. Scores and percentages are demo values.

## Product Principles
1. Numbers first: the figures are the content, so set them large and tabular.
2. Every list is a standings table someone can scan in seconds.
3. Suggestions point at something concrete to do next.
