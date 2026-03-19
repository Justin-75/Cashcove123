import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { createDefaultSessionState, spinCashCove } from "../engine/cashCove243.js";
const PORT = 4173;
const sessions = new Map();
const mime = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
};
const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (req.method === "POST" && url.pathname === "/api/deposit") {
        const body = await readBody(req);
        const payload = JSON.parse(body);
        const sessionId = payload.sessionId ?? "default";
        const amountCents = Math.max(0, Math.trunc(Number(payload.amountCents) || 0));
        const session = sessions.get(sessionId) ?? { engine: createDefaultSessionState(), balanceCents: 0 };
        session.balanceCents += amountCents;
        sessions.set(sessionId, session);
        res.writeHead(200, { "content-type": mime[".json"] });
        res.end(JSON.stringify({ sessionId, balanceCents: session.balanceCents, remainingFreeSpins: session.engine.remainingFreeSpins }));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/withdraw") {
        const body = await readBody(req);
        const payload = JSON.parse(body);
        const sessionId = payload.sessionId ?? "default";
        const amountCents = Math.max(0, Math.trunc(Number(payload.amountCents) || 0));
        const session = sessions.get(sessionId) ?? { engine: createDefaultSessionState(), balanceCents: 0 };
        const withdrawn = Math.min(session.balanceCents, amountCents);
        session.balanceCents -= withdrawn;
        sessions.set(sessionId, session);
        res.writeHead(200, { "content-type": mime[".json"] });
        res.end(JSON.stringify({
            sessionId,
            withdrawnCents: withdrawn,
            balanceCents: session.balanceCents,
            remainingFreeSpins: session.engine.remainingFreeSpins,
        }));
        return;
    }
    if (req.method === "GET" && url.pathname === "/api/state") {
        const sessionId = url.searchParams.get("sessionId") ?? "default";
        const session = sessions.get(sessionId) ?? { engine: createDefaultSessionState(), balanceCents: 0 };
        sessions.set(sessionId, session);
        res.writeHead(200, { "content-type": mime[".json"] });
        res.end(JSON.stringify({ sessionId, balanceCents: session.balanceCents, remainingFreeSpins: session.engine.remainingFreeSpins }));
        return;
    }
    if (req.method === "POST" && url.pathname === "/api/spin") {
        const body = await readBody(req);
        const payload = JSON.parse(body);
        const sessionId = payload.sessionId ?? "default";
        const betCredits = Math.max(1, Math.trunc(Number(payload.betCredits) || 1));
        const denominationDollars = payload.denominationDollars === 2 ? 2 : 1;
        const betCents = betCredits * denominationDollars * 100;
        const session = sessions.get(sessionId) ?? { engine: createDefaultSessionState(), balanceCents: 0 };
        sessions.set(sessionId, session);
        if (session.engine.remainingFreeSpins <= 0) {
            if (session.balanceCents < betCents) {
                res.writeHead(400, { "content-type": mime[".json"] });
                res.end(JSON.stringify({ error: "INSUFFICIENT_FUNDS", balanceCents: session.balanceCents }));
                return;
            }
            session.balanceCents -= betCents;
        }
        const outcome = spinCashCove(Math.random, session.engine, betCredits);
        // Winnings are credited in the same "credit" unit; convert to cents using denomination.
        const winCents = Math.round(outcome.totalWin * denominationDollars * 100);
        session.balanceCents += winCents;
        res.writeHead(200, { "content-type": mime[".json"] });
        res.end(JSON.stringify({
            sessionId,
            denominationDollars,
            betCredits,
            betCents,
            winCents,
            balanceCents: session.balanceCents,
            outcome,
        }));
        return;
    }
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = join(process.cwd(), "app/public", path);
    try {
        const data = await readFile(filePath);
        res.writeHead(200, { "content-type": mime[extname(filePath)] ?? "application/octet-stream" });
        res.end(data);
    }
    catch {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        res.end("Not found");
    }
});
server.listen(PORT, () => {
    console.log(`Cash Cove app running at http://localhost:${PORT}`);
});
async function readBody(req) {
    return new Promise((resolve) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(String(chunk)));
        req.on("end", () => resolve(chunks.join("")));
    });
}
