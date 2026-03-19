import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultSessionState, playPaidSpinRound, spinCashCove, type EngineConfig } from "../engine/cashCove243.js";
import { createSeededRng, runSimulationBatch, type EngineSpin } from "../simulations/core.js";

const sequenceRng = (values: number[]): (() => number) => {
  let index = 0;
  return () => {
    const value = values[index] ?? 0;
    index += 1;
    return value;
  };
};

const deterministicConfig: EngineConfig = {
  rows: 3,
  reels: [["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"]],
  paytable: { A: { 3: 1, 4: 1, 5: 1 } },
  scatterSymbol: "S",
  wildSymbol: "W",
  triggerScatterCount: 3,
  freeSpinsAwarded: 12,
  allowRetriggerInFreeSpins: false,
  multiplierWeights: [{ value: 3, weight: 1 }],
};

test("fixed seed yields reproducible stream", () => {
  const a = createSeededRng(42);
  const b = createSeededRng(42);
  const seqA = Array.from({ length: 8 }, () => a());
  const seqB = Array.from({ length: 8 }, () => b());
  assert.deepEqual(seqA, seqB);
});

test("ways evaluation pays all reel combinations for a full screen symbol", () => {
  const state = createDefaultSessionState();
  const outcome = spinCashCove(sequenceRng([0, 0, 0, 0, 0]), state, 1, {
    ...deterministicConfig,
    paytable: { A: { 3: 5, 4: 10, 5: 20 } },
  });

  assert.equal(outcome.totalWin, 20);
  assert.equal(outcome.winningWays[0].ways, 243);
});

test("scatter threshold triggers only at 3+ symbols", () => {
  const state = createDefaultSessionState();

  const noTrigger = spinCashCove(sequenceRng([0, 0, 0, 0, 0]), state, 1, {
    ...deterministicConfig,
    reels: [["S", "S", "A"], ["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"]],
  });
  assert.equal(noTrigger.isBonusTrigger, false);
  assert.equal(noTrigger.triggeredFreeSpins, 0);

  const trigger = spinCashCove(sequenceRng([0, 0, 0, 0, 0]), state, 1, {
    ...deterministicConfig,
    reels: [["S", "S", "A"], ["S", "A", "A"], ["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"]],
  });
  assert.equal(trigger.isBonusTrigger, true);
  assert.equal(trigger.triggeredFreeSpins, 12);
});

test("paid round resolves trigger and all awarded free spins", () => {
  const state = createDefaultSessionState();
  const round = playPaidSpinRound(
    sequenceRng([
      0, 0, 0, 0, 0,
      ...Array.from({ length: 12 * 6 }, () => 0),
    ]),
    state,
    1,
    {
      ...deterministicConfig,
      reels: [["S", "S", "S"], ["S", "S", "S"], ["S", "S", "S"], ["A", "A", "A"], ["A", "A", "A"]],
      paytable: { A: { 3: 1, 4: 1, 5: 1 } },
    },
  );

  assert.equal(round.isBonusTrigger, true);
  assert.equal(round.freeSpinCount, 12);
  assert.equal(round.freeSpinMultipliers.length, 12);
  assert.equal(state.remainingFreeSpins, 0);
});

test("no retrigger occurs inside free spins when disabled", () => {
  const state = { remainingFreeSpins: 1 };
  const outcome = spinCashCove(sequenceRng([0, 0, 0, 0, 0, 0]), state, 1, {
    ...deterministicConfig,
    reels: [["S", "S", "S"], ["S", "S", "S"], ["S", "S", "S"], ["A", "A", "A"], ["A", "A", "A"]],
    allowRetriggerInFreeSpins: false,
  });

  assert.equal(outcome.inFreeSpin, true);
  assert.equal(outcome.triggeredFreeSpins, 0);
  assert.equal(state.remainingFreeSpins, 0);
});

test("simulation reports phase-3 bonus metrics", async () => {
  const scripted: EngineSpin = (_rng, index) => {
    if (index === 0) {
      return {
        totalWin: 50,
        baseWin: 10,
        featureWin: 40,
        isBonusTrigger: true,
        freeSpinCount: 4,
        freeSpinMultipliers: [2, 5, 3, 7],
      };
    }
    if (index === 1) {
      return {
        totalWin: 20,
        baseWin: 20,
        featureWin: 0,
      };
    }
    return {
      totalWin: 0,
      baseWin: 0,
      featureWin: 0,
    };
  };

  const output = await runSimulationBatch(scripted, {
    spins: 4,
    betPerSpin: 1,
    seed: 9,
    topWinThresholdMultiplier: 5,
  });

  assert.equal(output.metrics.totalReturned, 70);
  assert.equal(output.metrics.baseRtp, 30 / 4);
  assert.equal(output.metrics.featureRtp, 40 / 4);
  assert.equal(output.metrics.bonusTriggerRate, 1 / 4);
  assert.equal(output.metrics.bonusRoundRate, 1 / 4);
  assert.equal(output.metrics.freeSpinRate, 1);
  assert.equal(output.metrics.freeSpinsPerTrigger, 4);
  assert.equal(output.metrics.averageBonusWin, 40);
  assert.equal(output.metrics.featureHitRate, 1 / 4);
  assert.equal(output.metrics.averageFreeSpinMultiplier, 17 / 4);
  assert.equal(output.metrics.highMultiplierSpinRate, 2 / 4);
  assert.deepEqual(output.metrics.multiplierHistogram, { "2": 1, "3": 1, "5": 1, "7": 1 });
});
