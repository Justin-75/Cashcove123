const SYMBOLS = ['F4', 'F3', 'F2', 'F1', 'A', 'K', 'Q', 'J', '10', '9', 'W', 'S'];
const ROWS = 3;
const REELS = 5;

const spinBtn = document.getElementById('spinBtn');
const statusEl = document.getElementById('status');
const gridEl = document.getElementById('grid');
const logEl = document.getElementById('log');
const lastWinEl = document.getElementById('lastWin');
const remainingFsEl = document.getElementById('remainingFs');
const sessionEl = document.getElementById('sessionValue');
const balanceEl = document.getElementById('balanceValue');
const denomButtons = Array.from(document.querySelectorAll('.denom-btn'));
const chipButtons = Array.from(document.querySelectorAll('.chip-btn[data-denom]'));
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const walletAmountInput = document.getElementById('walletAmount');
const paytableListEl = document.getElementById('paytableList');

const sessionId = localStorage.getItem('cashCoveSessionId') || crypto.randomUUID();
localStorage.setItem('cashCoveSessionId', sessionId);
sessionEl.textContent = sessionId.slice(0, 8);

let cells = [];
let selectedBet = 30;
let denominationDollars = 1;
let balanceCents = 0;
initGrid();
renderRandomGrid();
statusEl.textContent = 'Ready to spin';
initDenominations();
initWallet();
renderPaytable();
refreshState().catch(() => {});

spinBtn.addEventListener('click', async () => {
  spinBtn.disabled = true;
  spinBtn.textContent = 'Spinning...';
  statusEl.textContent = 'Reels spinning...';

  try {
    const betCredits = selectedBet;

    const request = fetch('/api/spin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, betCredits, denominationDollars }),
    });

    await runSpinAnimation(1100);

    const response = await request;
    const data = await response.json();
    if (!response.ok) {
      statusEl.textContent = data?.error === 'INSUFFICIENT_FUNDS' ? 'Insufficient balance. Deposit to continue.' : 'Spin failed';
      return;
    }
    const { outcome } = data;

    renderGrid(outcome.windows);
    statusEl.textContent = outcome.inFreeSpin
      ? `Free Spin x${outcome.freeSpinMultiplier} resolved`
      : outcome.isBonusTrigger
      ? 'Bonus triggered! 12 free spins queued.'
      : 'Base spin resolved';

    lastWinEl.textContent = outcome.totalWin.toFixed(2);
    balanceCents = Number(data.balanceCents) || balanceCents;
    renderBalance();
    remainingFsEl.textContent = String(outcome.remainingFreeSpins);
    logEl.textContent = JSON.stringify(outcome, null, 2);
  } catch (err) {
    statusEl.textContent = `Spin failed: ${String(err)}`;
  } finally {
    spinBtn.disabled = false;
    spinBtn.textContent = 'Spin';
  }
});

function initGrid() {
  gridEl.innerHTML = '';
  cells = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let reel = 0; reel < REELS; reel += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.reel = String(reel);
      cell.textContent = '-';
      gridEl.appendChild(cell);
      cells.push(cell);
    }
  }
}

function initDenominations() {
  denomButtons.forEach((btn) => {
    const bet = Number(btn.dataset.bet);
    if (bet === selectedBet) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      selectedBet = bet;
      denomButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      statusEl.textContent = `Bet set to ${selectedBet} credits per spin`;
    });
  });
}

function initWallet() {
  chipButtons.forEach((btn) => {
    const denom = Number(btn.dataset.denom);
    if (denom === denominationDollars) btn.classList.add('active');
    btn.addEventListener('click', () => {
      denominationDollars = denom === 2 ? 2 : 1;
      chipButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      statusEl.textContent = `Denomination set to $${denominationDollars}`;
      renderBalance();
    });
  });

  depositBtn.addEventListener('click', async () => {
    const amountDollars = Math.max(1, Math.trunc(Number(walletAmountInput.value) || 0));
    const amountCents = amountDollars * 100;
    const res = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, amountCents }),
    });
    const data = await res.json();
    balanceCents = Number(data.balanceCents) || balanceCents;
    renderBalance();
    statusEl.textContent = `Deposited $${amountDollars}`;
  });

  withdrawBtn.addEventListener('click', async () => {
    const amountDollars = Math.max(1, Math.trunc(Number(walletAmountInput.value) || 0));
    const amountCents = amountDollars * 100;
    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId, amountCents }),
    });
    const data = await res.json();
    balanceCents = Number(data.balanceCents) || balanceCents;
    renderBalance();
    const withdrawn = (Number(data.withdrawnCents) || 0) / 100;
    statusEl.textContent = `Withdrew $${withdrawn.toFixed(2)}`;
  });
}

async function refreshState() {
  const res = await fetch(`/api/state?sessionId=${encodeURIComponent(sessionId)}`);
  const data = await res.json();
  balanceCents = Number(data.balanceCents) || 0;
  renderBalance();
  remainingFsEl.textContent = String(Number(data.remainingFreeSpins) || 0);
}

function renderBalance() {
  balanceEl.textContent = `$${(balanceCents / 100).toFixed(2)}`;
}

function renderPaytable() {
  if (!paytableListEl) return;
  const rows = [
    ['F3', '3=20   4=90    5=600'],
    ['F4', '3=55   4=240   5=560'],
    ['F2', '3=22   4=75    5=340'],
    ['F1', '3=15   4=55    5=270'],
    ['A', '3=40   4=110   5=450'],
    ['K', '3=40   4=110   5=450'],
    ['Q/J/10/9', '4=100   5=500'],
    ['Scatter', '3+ triggers 12 free spins'],
    ['Wild', 'Substitutes (not scatter)'],
  ];
  paytableListEl.innerHTML = '';
  rows.forEach(([sym, pays]) => {
    const li = document.createElement('li');
    const left = document.createElement('span');
    left.textContent = sym;
    const right = document.createElement('span');
    right.textContent = pays;
    li.appendChild(left);
    li.appendChild(right);
    paytableListEl.appendChild(li);
  });
}

function renderGrid(reels) {
  for (let row = 0; row < ROWS; row += 1) {
    for (let reel = 0; reel < REELS; reel += 1) {
      const idx = row * REELS + reel;
      const sym = reels[reel][row];
      cells[idx].dataset.symbol = sym;
      cells[idx].textContent = sym;
      cells[idx].classList.remove('spinning');
      cells[idx].classList.add('settled');
      setTimeout(() => cells[idx].classList.remove('settled'), 250);
    }
  }
}

function renderRandomGrid() {
  for (const cell of cells) {
    const sym = randomSymbol();
    cell.dataset.symbol = sym;
    cell.textContent = sym;
  }
}

async function runSpinAnimation(totalMs) {
  const start = Date.now();
  while (Date.now() - start < totalMs) {
    for (let row = 0; row < ROWS; row += 1) {
      for (let reel = 0; reel < REELS; reel += 1) {
        const idx = row * REELS + reel;
        const shouldTick = (Date.now() + reel * 40 + row * 20) % 120 < 70;
        if (shouldTick) {
          cells[idx].textContent = randomSymbol();
          cells[idx].classList.add('spinning');
        }
      }
    }
    await sleep(45);
  }
}

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
