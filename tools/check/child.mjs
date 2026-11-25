// packages/check/src/sandbox/child.ts
import { Buffer } from "node:buffer";
import { Worker } from "node:worker_threads";
// packages/protocol/src/limits.ts
var FLOORS = {
  codeChars: 48000,
  checkMs: 2000,
  describeBytes: 262144,
  canvasSize: 4096
};
var FIXED = {
  bodyChars: 65536,
  manualChars: 48000,
  depsMax: 16,
  libCountMax: 16,
  libBytesMax: 4194304,
  libTotalBytesMax: 16777216,
  bundleBytesMax: 16777216,
  modulesMax: 2000,
  wasmMemoryBytes: 67108864,
  childExtraBytes: 134217728,
  messagesPerSecond: 1000,
  textCharsPerCall: 2000,
  textTotalBytes: 65536,
  titleChars: 200,
  licenseChars: 100,
  watchIntervalMs: 25,
  childGraceMs: 500,
  parentGraceMs: 2000,
  watchLoadMs: 1e4,
  watchSilenceMs: 2000,
  pingMs: 250,
  fetchTimeoutMs: 30000,
  apiBytesMax: 8388608,
  frameGapMs: 1000,
  frameTickMs: 100,
  frameTickSlackMs: 500,
  errorsMax: 20,
  errorChars: 300,
  frameReadyMs: 1e4,
  textLinesMax: 200,
  keyChars: 32
};
var LIMIT_RANGES = {
  codeChars: { min: 1, max: FLOORS.codeChars },
  checkMs: { min: 1, max: FLOORS.checkMs },
  describeBytes: { min: 1, max: FLOORS.describeBytes },
  canvasWidth: { min: 16, max: FLOORS.canvasSize },
  canvasHeight: { min: 16, max: FLOORS.canvasSize }
};
// packages/protocol/src/digest.ts
var encoder = new TextEncoder;
var utf8Bytes = (text) => encoder.encode(text).length;
// packages/protocol/src/reveal.ts
var BLANK_LOOKING = new Set(["⠀", "\uD81B\uDFE4", "\uD834\uDD59"]);
// packages/protocol/src/text.ts
var ALNUM = "0-9A-Za-z\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF41-\\uFF5A";
var CODE_CHAR = "[0-9A-Z\\uFF10-\\uFF19\\uFF21-\\uFF3A]";
var AUTH_CODE = new RegExp(`(?<![${ALNUM}])${CODE_CHAR}{4}\\s{0,3}[-\\u2010-\\u2015\\u2212\\uFE58\\uFE63\\uFF0D]\\s{0,3}` + `${CODE_CHAR}{4}(?![${ALNUM}])`, "gu");
// packages/check/src/sandbox/job.ts
var SANDBOX_OUTCOMES = ["ok", "load-error", "timeout", "memory", "bad-describe", "internal"];
var isSandboxOutcome = (value) => typeof value === "string" && SANDBOX_OUTCOMES.includes(value);
var MAX_JOB_BYTES = FIXED.bundleBytesMax * 2;
var isRecord2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var isPositiveInteger = (value) => typeof value === "number" && Number.isInteger(value) && value > 0;
var parseJob = (value) => {
  if (!isRecord2(value))
    return;
  const name = value["name"];
  const code = value["code"];
  const deps = value["deps"];
  const checkMs = value["checkMs"];
  const describeBytes = value["describeBytes"];
  if (typeof name !== "string" || typeof code !== "string" || !Array.isArray(deps))
    return;
  if (!isPositiveInteger(checkMs) || checkMs > FLOORS.checkMs)
    return;
  if (!isPositiveInteger(describeBytes) || describeBytes > FLOORS.describeBytes)
    return;
  let total = utf8Bytes(name) + utf8Bytes(code);
  const parsed = [];
  for (const item of deps) {
    if (!isRecord2(item))
      return;
    const depName = item["name"];
    const source = item["source"];
    if (typeof depName !== "string" || typeof source !== "string")
      return;
    total += utf8Bytes(depName) + utf8Bytes(source);
    if (total > MAX_JOB_BYTES)
      return;
    parsed.push({ name: depName, source });
  }
  if (total > MAX_JOB_BYTES)
    return;
  return { name, code, deps: parsed, checkMs, describeBytes };
};

// packages/check/src/sandbox/child.ts
var EXIT_GRACE_MS = 500;
var isRecord3 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var readStdin = async () => {
  const chunks = [];
  let total = 0;
  for await (const chunk of process.stdin) {
    const bytes = typeof chunk === "string" ? Buffer.from(chunk, "utf8") : Buffer.from(chunk);
    total += bytes.byteLength;
    if (total > MAX_JOB_BYTES)
      return;
    chunks.push(bytes);
  }
  return Buffer.concat(chunks).toString("utf8");
};
var writeReport = (outcome) => {
  process.stdout.write(`${JSON.stringify({ outcome })}
`, () => process.exit(0));
  setTimeout(() => process.exit(0), EXIT_GRACE_MS);
};
var tick = (state, deadlineMs, stop) => {
  if (!state.armed || state.finished)
    return;
  const rssBytes = process.memoryUsage().rss;
  if (rssBytes > state.baselineRssBytes + FIXED.childExtraBytes) {
    stop("memory");
    return;
  }
  if (Date.now() - state.startedAt >= deadlineMs) {
    stop("timeout");
  }
};
var startWorker = (job) => new Worker(new URL("./worker.mjs", import.meta.url), {
  workerData: job,
  stdout: true,
  stderr: true
});
var main = async () => {
  const text = await readStdin();
  if (text === undefined) {
    writeReport("internal");
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    writeReport("internal");
    return;
  }
  const job = parseJob(parsed);
  if (!job) {
    writeReport("internal");
    return;
  }
  const state = {
    armed: false,
    finished: false,
    startedAt: Date.now(),
    baselineRssBytes: process.memoryUsage().rss
  };
  const deadlineMs = job.checkMs + FIXED.childGraceMs;
  let timer;
  let worker;
  const stop = (outcome) => {
    if (state.finished)
      return;
    state.finished = true;
    if (timer !== undefined)
      clearInterval(timer);
    worker?.terminate().catch(() => {
      return;
    });
    writeReport(outcome);
  };
  worker = startWorker(job);
  timer = setInterval(() => tick(state, deadlineMs, stop), FIXED.watchIntervalMs);
  worker.on("message", (message) => {
    if (!isRecord3(message))
      return;
    if (message["type"] === "ready") {
      state.startedAt = Date.now();
      state.baselineRssBytes = process.memoryUsage().rss;
      state.armed = true;
      worker?.postMessage({ type: "go" });
      return;
    }
    if (message["type"] === "report") {
      const outcome = message["outcome"];
      stop(isSandboxOutcome(outcome) ? outcome : "internal");
    }
  });
  worker.on("error", () => stop("internal"));
  worker.on("exit", () => {
    if (!state.finished)
      stop("internal");
  });
};
await main();
