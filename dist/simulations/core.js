export function createSeededRng(seed) {
    let state = seed >>> 0;
    return () => {
        state ^= state << 13;
        state ^= state >>> 17;
        state ^= state << 5;
        return (state >>> 0) / 0x100000000;
    };
}
export async function runSimulationBatch(spin, config) {
    if (config.spins <= 0)
        throw new Error("spins must be > 0");
    if (config.betPerSpin <= 0)
        throw new Error("betPerSpin must be > 0");
    const rng = createSeededRng(config.seed);
    const wins = [];
    const multiplierHistogram = {};
    let hits = 0;
    let featureHits = 0;
    let totalReturned = 0;
    let baseReturned = 0;
    let featureReturned = 0;
    let maxWin = 0;
    let bonusTriggers = 0;
    let bonusRounds = 0;
    let totalBonusWin = 0;
    let freeSpins = 0;
    let highMultiplierSpins = 0;
    let freeSpinMultiplierSum = 0;
    for (let i = 0; i < config.spins; i += 1) {
        const result = await spin(rng, i);
        const win = Number(result.totalWin) || 0;
        wins.push(win);
        totalReturned += win;
        if (win > maxWin)
            maxWin = win;
        const isHit = typeof result.hit === "boolean" ? result.hit : win > 0;
        if (isHit)
            hits += 1;
        const baseWin = result.baseWin ?? (!result.inFreeSpin ? win : 0);
        const featureWin = result.featureWin ?? (result.inFreeSpin ? win : 0);
        baseReturned += baseWin;
        featureReturned += featureWin;
        if (featureWin > 0)
            featureHits += 1;
        if (result.isBonusTrigger)
            bonusTriggers += 1;
        const freeSpinCount = result.freeSpinCount ?? (result.inFreeSpin ? 1 : 0);
        if (freeSpinCount > 0) {
            bonusRounds += 1;
            totalBonusWin += featureWin;
        }
        const explicitMultipliers = result.freeSpinMultipliers ?? [];
        if (explicitMultipliers.length > 0) {
            freeSpins += explicitMultipliers.length;
            for (const multiplier of explicitMultipliers) {
                freeSpinMultiplierSum += multiplier;
                if (multiplier >= 5)
                    highMultiplierSpins += 1;
                const key = String(multiplier);
                multiplierHistogram[key] = (multiplierHistogram[key] ?? 0) + 1;
            }
        }
        else if (typeof result.freeSpinCount === "number" && result.freeSpinCount > 0) {
            freeSpins += result.freeSpinCount;
        }
        else if (result.inFreeSpin) {
            freeSpins += 1;
            const multiplier = result.freeSpinMultiplier ?? 1;
            freeSpinMultiplierSum += multiplier;
            if (multiplier >= 5)
                highMultiplierSpins += 1;
            const key = String(multiplier);
            multiplierHistogram[key] = (multiplierHistogram[key] ?? 0) + 1;
        }
    }
    wins.sort((a, b) => a - b);
    const wagered = config.spins * config.betPerSpin;
    const mean = totalReturned / config.spins;
    let varianceAcc = 0;
    for (const win of wins) {
        const diff = win - mean;
        varianceAcc += diff * diff;
    }
    const stdDevWin = Math.sqrt(varianceAcc / config.spins);
    const topWinThreshold = config.topWinThresholdMultiplier * config.betPerSpin;
    const topWins = wins.filter((w) => w >= topWinThreshold).length;
    const metrics = {
        spins: config.spins,
        seed: config.seed,
        betPerSpin: config.betPerSpin,
        wagered,
        totalReturned,
        rtp: totalReturned / wagered,
        baseRtp: baseReturned / wagered,
        featureRtp: featureReturned / wagered,
        hitRate: hits / config.spins,
        featureHitRate: featureHits / config.spins,
        bonusTriggerRate: bonusTriggers / config.spins,
        bonusRoundRate: bonusRounds / config.spins,
        freeSpinRate: freeSpins / config.spins,
        freeSpinsPerTrigger: bonusTriggers === 0 ? 0 : freeSpins / bonusTriggers,
        averageBonusWin: bonusRounds === 0 ? 0 : totalBonusWin / bonusRounds,
        averageWinPerSpin: mean,
        averageWinOnHit: hits === 0 ? 0 : totalReturned / hits,
        stdDevWin,
        coefficientOfVariation: mean === 0 ? 0 : stdDevWin / mean,
        maxWin,
        maxWinMultiplier: maxWin / config.betPerSpin,
        topWinThreshold,
        topWinFrequency: topWins / config.spins,
        averageFreeSpinMultiplier: freeSpins === 0 ? 0 : freeSpinMultiplierSum / freeSpins,
        highMultiplierSpinRate: freeSpins === 0 ? 0 : highMultiplierSpins / freeSpins,
        multiplierHistogram,
        p50Win: quantileSorted(wins, 0.5),
        p90Win: quantileSorted(wins, 0.9),
        p99Win: quantileSorted(wins, 0.99),
    };
    return { config, metrics };
}
function quantileSorted(sortedValues, q) {
    if (sortedValues.length === 0)
        return 0;
    const idx = (sortedValues.length - 1) * q;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper)
        return sortedValues[lower];
    const weight = idx - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}
export function metricsToCsvRow(metrics) {
    return [
        metrics.spins,
        metrics.seed,
        metrics.betPerSpin,
        metrics.wagered,
        metrics.totalReturned,
        metrics.rtp,
        metrics.baseRtp,
        metrics.featureRtp,
        metrics.hitRate,
        metrics.featureHitRate,
        metrics.bonusTriggerRate,
        metrics.bonusRoundRate,
        metrics.freeSpinRate,
        metrics.freeSpinsPerTrigger,
        metrics.averageBonusWin,
        metrics.averageWinPerSpin,
        metrics.averageWinOnHit,
        metrics.stdDevWin,
        metrics.coefficientOfVariation,
        metrics.maxWin,
        metrics.maxWinMultiplier,
        metrics.topWinThreshold,
        metrics.topWinFrequency,
        metrics.averageFreeSpinMultiplier,
        metrics.highMultiplierSpinRate,
        JSON.stringify(metrics.multiplierHistogram),
        metrics.p50Win,
        metrics.p90Win,
        metrics.p99Win,
    ].join(",");
}
export const CSV_HEADER = "spins,seed,betPerSpin,wagered,totalReturned,rtp,baseRtp,featureRtp,hitRate,featureHitRate,bonusTriggerRate,bonusRoundRate,freeSpinRate,freeSpinsPerTrigger,averageBonusWin,averageWinPerSpin,averageWinOnHit,stdDevWin,coefficientOfVariation,maxWin,maxWinMultiplier,topWinThreshold,topWinFrequency,averageFreeSpinMultiplier,highMultiplierSpinRate,multiplierHistogram,p50Win,p90Win,p99Win";
