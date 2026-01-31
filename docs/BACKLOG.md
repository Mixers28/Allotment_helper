# docs/BACKLOG.md

## Backlog rules
- This file is the only place to add features once the MVP sprints are underway.
- During Sprint 0–5: **no backlog item is implemented** unless it fixes a P0/P1 bug blocking the Initial Milestone.
- Every item should remain small, testable, and ideally independent.

---

## Epics
- E1: Geometry & editor upgrades
- E2: Season planning UX
- E3: Crop intelligence (timelines, harvest)
- E4: Forecast overlays (weed/nutrients/growth)
- E5: Data import/export & portability
- E6: Collaboration & accounts
- E7: Mobile/PWA & offline-first

---

## Backlog items (post-milestone)

### P1 — High value next
1) **Clone season plan**
   - Epic: E2
   - Description: Create new season using previous season’s sections + optionally plantings.
   - Notes: Must not modify base geometry.
   - Depends: Seasons + sections stable.

2) **Harvest window estimate (simple)**
   - Epic: E3
   - Description: Use days-to-maturity min/max to show estimated harvest window on timeline.
   - Notes: No weather/GDD yet; include confidence band.

3) **Timeline view**
   - Epic: E3
   - Description: Per bed and per planting timeline with stages + events overlay.
   - Notes: MVP can be a single list view before a full chart.

4) **Sectioning: grid mode**
   - Epic: E2
   - Description: Allow rows × cols section plans for square-foot style layouts.

5) **Plant placement: manual snap mode**
   - Epic: E2
   - Description: Click-to-place plants snapping to spacing lattice; allow per-group origin.
   - Notes: Keep placement engine pure.

---

### P2 — Medium value / moderate complexity
6) **Polygon plot boundary**
   - Epic: E1
   - Description: Draw plot boundary as polygon (multi-point).
   - Notes: Bed placement and measurement overlay updates required.

7) **Bed adjacency snapping and alignment tools**
   - Epic: E1
   - Description: Snap bed edges, distribute spacing, align rotation.
   - Notes: Editor UX improvement.

8) **Import crop catalog from CSV**
   - Epic: E5
   - Description: Upload CSV of crops/varieties with spacing + timing fields.
   - Notes: Validate and preview before import.

9) **Export season plan**
   - Epic: E5
   - Description: Export season as JSON and optionally printable PDF (layout + plantings + events).
   - Notes: PDF generation can be server-side or client-side.

10) **Photo attachments**
   - Epic: E5
   - Description: Attach photos to events/plantings.
   - Notes: Start with local object storage; later S3.

---

### P3 — Forecasting (rules-based first)
11) **Weed pressure overlay (rules-based)**
   - Epic: E4
   - Description: Heatmap by bed/section using seasonal baseline + disturbance + mulch + canopy approximation.
   - Notes: Must be explainable and configurable.

12) **Nutrient demand overlay (rules-based)**
   - Epic: E4
   - Description: Demand curve per crop stage + fertilizer “credits” timeline.
   - Notes: Start with low/med/high categories.

13) **Growth stage overlay (rules-based)**
   - Epic: E4
   - Description: Germination → veg → harvest windows from crop timeline.
   - Notes: No weather integration initially.

---

### P4 — Weather and higher fidelity
14) **Weather integration**
   - Epic: E4
   - Description: Pull local temperature/rainfall for forecasting context.
   - Notes: Requires plot location and user consent.

15) **GDD-based growth**
   - Epic: E4
   - Description: Adjust maturity timing using Growing Degree Days.
   - Notes: Needs crop-specific base temps.

---

### P5 — Multi-user / sharing
16) **Accounts + login**
   - Epic: E6
   - Description: Auth + per-user plots and seasons.
   - Notes: Only after core UX is stable.

17) **Sharing read-only link**
   - Epic: E6
   - Description: Share a season plan with someone else as read-only.

---

### P6 — Mobile & offline
18) **PWA offline-first**
   - Epic: E7
   - Description: Offline event logging at the allotment; sync when online.
   - Notes: Requires careful conflict strategy.

---

## Parking lot (ideas, not tickets yet)
- Companion planting suggestions
- Rotation warnings by plant family
- Yield tracking + expected yield next year
- Task reminders / calendar export (iCal)
- Barcode/QR seed packet scanning
- Multi-plot support (multiple allotments/gardens)
