import { createDefaultSessionState, playPaidSpinRound } from "../engine/cashCove243.js";
import { CSV_HEADER, metricsToCsvRow, runSimulationBatch } from "./core.js";
async function main() {
    const args = parseArgs(process.argv.slice(2));
    const spin = await resolveEngine(args.engineModule, args.bet);
    const output = await runSimulationBatch(spin, {
        spins: args.spins,
        betPerSpin: args.bet,
        seed: args.seed,
        topWinThresholdMultiplier: args.topWinMultiplier,
    });
    if (args.format === "csv") {
        console.log(CSV_HEADER);
        console.log(metricsToCsvRow(output.metrics));
        return;
    }
    console.log(JSON.stringify(output, null, 2));
}
async function resolveEngine(engineModule, bet) {
    if (engineModule === "cashcove") {
        const session = createDefaultSessionState();
        return (rng) => {
            const round = playPaidSpinRound(rng, session, bet);
            return {
                totalWin: round.totalWin,
                baseWin: round.baseWin,
                featureWin: round.featureWin,
                isBonusTrigger: round.isBonusTrigger,
                freeSpinCount: round.freeSpinCount,
                freeSpinMultipliers: round.freeSpinMultipliers,
            };
        };
    }
    const imported = await import(engineModule);
    const candidate = imported.spin;
    if (typeof candidate !== "function") {
        throw new Error("Engine module must export a named `spin(rng, spinIndex)` function that returns { totalWin, hit? }");
    }
    return candidate;
}
function parseArgs(argv) {
    const kv = new Map();
    for (let i = 0; i < argv.length; i += 1) {
        const key = argv[i];
        if (!key.startsWith("--"))
            continue;
        kv.set(key.slice(2), argv[i + 1] ?? "");
        i += 1;
    }
    const engineModule = kv.get("engine") ?? "cashcove";
    const formatArg = kv.get("format") ?? "json";
    if (formatArg !== "json" && formatArg !== "csv") {
        throw new Error("--format must be json or csv");
    }
    return {
        engineModule,
        spins: intArg(kv.get("spins"), 100_000),
        bet: numArg(kv.get("bet"), 1),
        seed: intArg(kv.get("seed"), 12345),
        topWinMultiplier: numArg(kv.get("topWinMultiplier"), 100),
        format: formatArg,
    };
}
function intArg(value, fallback) {
    if (!value)
        return fallback;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed))
        throw new Error(`Invalid integer argument: ${value}`);
    return parsed;
}
function numArg(value, fallback) {
    if (!value)
        return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed))
        throw new Error(`Invalid numeric argument: ${value}`);
    return parsed;
}
main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
