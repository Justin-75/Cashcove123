# Cash Cove simulation + validation notes

## Current scope
- 5x3 reel window with 243 ways evaluation.
- Scatter trigger: 3+ scatters in base game awards 12 free spins.
- Free spins: each spin draws one **independent weighted multiplier** (1x-9x).
- Multipliers are applied to that spin's ways payout only.
- Scatter symbols are trigger-only in this implementation (no direct scatter pay).

## Phase 3 reporting metrics
- `rtp`, `baseRtp`, `featureRtp`: total and contribution split.
- `bonusTriggerRate`: triggers per paid spin.
- `bonusRoundRate`: paid rounds that actually contained free spins.
- `freeSpinRate`: executed free spins per paid spin.
- `freeSpinsPerTrigger`: realized feature length per trigger.
- `averageBonusWin`: average feature win per bonus round.
- `featureHitRate`: paid rounds with positive feature return.
- `averageFreeSpinMultiplier` and `highMultiplierSpinRate` (>=5x).
- `multiplierHistogram` to compare observed results vs configured multiplier weights.

## Phase 4 deterministic validation
- Reproducible RNG stream checks.
- 243-way combinatorics test (full-screen symbol case).
- Scatter threshold test (exactly below and at trigger threshold).
- Bonus round test (trigger + full 12 free-spin resolution).
- Retrigger guard test (no retrigger in free spins when disabled).
- Simulation aggregation test for phase-3 metrics.

## Statistical limitations
- Small runs produce noisy RTP and volatility estimates.
- Use at least 1M+ paid rounds before tuning paytable/reel strips.
- Tail metrics (`p99`, top-win frequency) converge slowly and should be tracked with confidence intervals in production math signoff.

## Playable app
A minimal app is included:
1. Build: `npm run build`
2. Run: `npm run app`
3. Open `http://localhost:4173`

The app keeps a per-browser session state so free spins carry over after a trigger.

## Phase 5 app layer status
- Demo app now includes a client spin lifecycle with visual reel-spinning animation and settle highlight states.
- Session HUD shows last win and remaining free spins from engine responses.
- Audio hooks are intentionally deferred until assets are provided.
