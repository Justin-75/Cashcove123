## Cash Cove math model (current)

### Window and "ways"
- **Window**: 5 reels × 3 rows.
- **Ways**: each reel has 3 visible positions, so total ways is \(3^5 = 243\).
- A win for a symbol is valid only if it is **connected left-to-right**:
  - It must start on **reel 1**.
  - Reels must be **consecutive** (no gaps).
  - A wild substitutes on any reel for any paying symbol.

### Bet meaning (important)
In this project, the engine’s `betPerSpin` is the **total bet for the spin** (in *credits*).

For ways evaluation, the total bet is distributed equally over all ways:
\[
\text{betPerWay} = \frac{\text{betPerSpin}}{243}.
\]

Each winning way pays:
\[
\text{payout} = \text{ways} \times \text{payMultiplier} \times \text{betPerWay}.
\]

This prevents the classic bug where you accidentally multiply all wins by 243 by treating
`betPerSpin` as "per-way bet".

### Scatters / feature
- Scatter count is counted anywhere in the 5×3 window.
- 3+ scatters award **12 free spins**.
- Free spins do not deduct a bet; they apply a per-spin **random multiplier** (currently 1–10x weighted).

### Denomination, balance, and dollars
- The client selects a denomination: **$1** or **$2**.
- Server stores **balance in cents** (`balanceCents`).
- Client sends:
  - `betCredits` (e.g. 30/60/150/300/600)
  - `denominationDollars` (1 or 2)
- Server charges (only on paid spins):
  \[
  \text{betCents} = \text{betCredits} \times \text{denominationDollars} \times 100.
  \]
- Winnings are credited in cents:
  \[
  \text{winCents} = \text{outcome.totalWin} \times \text{denominationDollars} \times 100.
  \]

### Current tuning snapshot
The paytable and reels are tuned via simulation to target:
- RTP around **0.93–0.96**
- Hit-rate around **0.50–0.55** (ways games still hit frequently, but not “every spin feels like a win”)

