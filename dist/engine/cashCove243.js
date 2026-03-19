const DEFAULT_CONFIG = {
    rows: 3,
    // Reels are intentionally rebalanced to reduce hit-rate and control RTP.
    // Wild (W) and Scatter (S) are kept relatively rare.
    reels: [
        [
            "9", "10", "J", "Q", "K", "A", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K",
            "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10",
            "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "K", "9", "10",
            "A", "K", "Q", "J", "10", "9",
            "F1", "F1", "F1",
            "F2", "F2",
            "F4",
            "F3", "F3",
            "W", "W",
            "S",
        ],
        [
            "9", "10", "J", "Q", "K", "A", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K",
            "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10",
            "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "K", "9", "10",
            "A", "K", "Q", "J", "10", "9",
            "F1", "F1",
            "F2", "F2",
            "F4",
            "F3", "F3",
            "W", "W",
            // no scatter on this reel (tightens bonus frequency)
            "S",
        ],
        [
            "9", "10", "J", "Q", "K", "A", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K",
            "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10",
            "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "K", "9", "10",
            "A", "K", "Q", "J", "10", "9",
            "F1", "F1",
            "F2", "F2",
            "F4",
            "F3", "F3",
            "W", "W",
            "S",
        ],
        [
            "9", "10", "J", "Q", "K", "A", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K",
            "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10",
            "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "K", "9", "10",
            "A", "K", "Q", "J", "10", "9",
            "F1", "F1",
            "F2",
            "F4",
            "F3", "F3",
            "W", "W",
            // no scatter on this reel (tightens bonus frequency)
            "S",
        ],
        [
            "9", "10", "J", "Q", "K", "A", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K",
            "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10",
            "J", "Q", "K", "9", "10", "J", "Q", "9", "10", "J", "Q", "K", "9", "10", "J", "Q", "K", "9", "10",
            "A", "K", "Q", "J", "10", "9",
            "F1",
            "F2",
            "F4",
            "F3", "F3",
            "W", "W",
            "S",
        ],
    ],
    paytable: {
        // Cabinet-style multipliers (approx. from your reference image).
        // With this engine, betPerSpin is TOTAL bet, and payouts scale by betPerWay (bet/243).
        // RTP tuning pass: scale cabinet multipliers up to a playable return.
        // Volatility pass:
        // - Make 5OAK capable of ~400-600x outcomes on a normal spin.
        // - Shift more EV into rare 5OAK; reduce 3/4OAK for high symbols.
        F3: { 3: 20, 4: 90, 5: 600 }, // top fish (rare) -> $5 bet can hit ~$3,000 (600x)
        F4: { 3: 55, 4: 240, 5: 560 },
        F2: { 3: 22, 4: 75, 5: 340 },
        F1: { 3: 15, 4: 55, 5: 270 },
        A: { 3: 40, 4: 110, 5: 450 },
        K: { 3: 40, 4: 110, 5: 450 },
        // Low symbols require 4+ consecutive reels to reduce "too easy" small hits.
        Q: { 4: 100, 5: 500 },
        J: { 4: 100, 5: 500 },
        "10": { 4: 100, 5: 500 },
        "9": { 4: 100, 5: 500 },
    },
    scatterPaytable: { 3: 0, 4: 0, 5: 0 },
    scatterSymbol: "S",
    wildSymbol: "W",
    triggerScatterCount: 3,
    freeSpinsAwarded: 12,
    allowRetriggerInFreeSpins: false,
    multiplierWeights: [
        { value: 1, weight: 30 },
        { value: 2, weight: 25 },
        { value: 3, weight: 18 },
        { value: 4, weight: 10 },
        { value: 5, weight: 7 },
        { value: 6, weight: 5 },
        { value: 7, weight: 3 },
        { value: 8, weight: 1.5 },
        { value: 9, weight: 0.5 },
        { value: 10, weight: 0.25 },
    ],
};
export function createDefaultSessionState() {
    return { remainingFreeSpins: 0 };
}
export function getDefaultConfig() {
    return DEFAULT_CONFIG;
}
export function playPaidSpinRound(rng, state, betPerSpin = 1, config = DEFAULT_CONFIG) {
    const firstSpin = spinCashCove(rng, state, betPerSpin, config);
    const freeSpinOutcomes = [];
    while (state.remainingFreeSpins > 0) {
        const outcome = spinCashCove(rng, state, betPerSpin, config);
        if (!outcome.inFreeSpin)
            break;
        freeSpinOutcomes.push(outcome);
    }
    const freeSpinMultipliers = freeSpinOutcomes.map((spin) => spin.freeSpinMultiplier);
    const featureWin = freeSpinOutcomes.reduce((sum, spin) => sum + spin.featureWin, 0);
    return {
        totalWin: firstSpin.baseWin + featureWin,
        baseWin: firstSpin.baseWin,
        featureWin,
        isBonusTrigger: firstSpin.isBonusTrigger,
        freeSpinCount: freeSpinOutcomes.length,
        freeSpinMultipliers,
        totalSpinsResolved: 1 + freeSpinOutcomes.length,
        firstSpin,
        freeSpinOutcomes,
    };
}
export function spinCashCove(rng, state, betPerSpin = 1, config = DEFAULT_CONFIG) {
    const inFreeSpin = state.remainingFreeSpins > 0;
    if (inFreeSpin) {
        state.remainingFreeSpins -= 1;
    }
    const windows = buildWindow(rng, config);
    const scatterCount = countSymbols(windows, config.scatterSymbol);
    const baseWaysWin = evaluate243Ways(windows, config.paytable, betPerSpin, config.wildSymbol, config.scatterSymbol);
    const scatterPayMultiplier = config.scatterPaytable?.[scatterCount] ?? 0;
    const scatterPay = scatterPayMultiplier > 0 ? scatterPayMultiplier * betPerSpin : 0;
    const baseWin = baseWaysWin.totalPayout + scatterPay;
    let triggeredFreeSpins = 0;
    const canTrigger = !inFreeSpin || config.allowRetriggerInFreeSpins;
    if (canTrigger && scatterCount >= config.triggerScatterCount) {
        state.remainingFreeSpins += config.freeSpinsAwarded;
        triggeredFreeSpins = config.freeSpinsAwarded;
    }
    const multiplier = inFreeSpin ? drawWeightedValue(rng, config.multiplierWeights) : 1;
    const featureWin = inFreeSpin ? baseWin * multiplier : 0;
    const totalWin = inFreeSpin ? featureWin : baseWin;
    return {
        totalWin,
        baseWin,
        featureWin,
        scatterCount,
        triggeredFreeSpins,
        isBonusTrigger: !inFreeSpin && triggeredFreeSpins > 0,
        inFreeSpin,
        freeSpinMultiplier: multiplier,
        remainingFreeSpins: state.remainingFreeSpins,
        windows,
        winningWays: baseWaysWin.winningWays,
    };
}
export function buildWindow(rng, config) {
    return config.reels.map((strip) => {
        const start = Math.floor(rng() * strip.length);
        const symbols = [];
        for (let i = 0; i < config.rows; i += 1) {
            symbols.push(strip[(start + i) % strip.length]);
        }
        return symbols;
    });
}
export function evaluate243Ways(window, paytable, betPerSpin, wildSymbol, scatterSymbol) {
    const winningWays = [];
    let totalPayout = 0;
    const totalWays = window.length === 0 ? 0 : window[0].length ** window.length; // rows^reels (3^5 = 243)
    const betPerWay = totalWays > 0 ? betPerSpin / totalWays : 0;
    for (const symbol of Object.keys(paytable)) {
        if (symbol === scatterSymbol || symbol === wildSymbol)
            continue;
        // "Connected paylines" (ways) logic:
        // - A pay is valid only if reels are consecutive from reel 1 with no gaps.
        // - Each distinct left-to-right path across matching symbols is one "payline".
        //   This is counted by multiplying the number of matching positions per reel.
        let ways = 1;
        let count = 0;
        for (let reelIdx = 0; reelIdx < window.length; reelIdx += 1) {
            let matchesOnReel = 0;
            for (const reelSymbol of window[reelIdx]) {
                if (reelSymbol === symbol || reelSymbol === wildSymbol) {
                    matchesOnReel += 1;
                }
            }
            if (matchesOnReel === 0)
                break;
            count += 1;
            ways *= matchesOnReel;
        }
        if (count < 3)
            continue;
        const payMultiplier = paytable[symbol][count] ?? 0;
        if (payMultiplier <= 0)
            continue;
        // betPerSpin is treated as TOTAL wager for the spin (not per-way).
        // Each winning way pays proportionally using betPerWay.
        const payout = ways * payMultiplier * betPerWay;
        totalPayout += payout;
        winningWays.push({ symbol, count, ways, payMultiplier, payout });
    }
    return { totalPayout, winningWays };
}
export function countSymbols(window, symbol) {
    let count = 0;
    for (const reel of window) {
        for (const reelSymbol of reel) {
            if (reelSymbol === symbol)
                count += 1;
        }
    }
    return count;
}
export function drawWeightedValue(rng, table) {
    const totalWeight = table.reduce((acc, item) => acc + item.weight, 0);
    let roll = rng() * totalWeight;
    for (const entry of table) {
        roll -= entry.weight;
        if (roll <= 0)
            return entry.value;
    }
    return table[table.length - 1].value;
}
