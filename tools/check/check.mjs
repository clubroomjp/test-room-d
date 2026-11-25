// packages/check/src/check.ts
import { mkdir, readFile as readFile2, writeFile } from "node:fs/promises";
import { dirname as dirname2 } from "node:path";

// packages/protocol/src/result.ts
var ok = (value) => ({ ok: true, value });
var fail = (code, detail) => detail === undefined ? { ok: false, code } : { ok: false, code, detail };
// packages/protocol/src/record.ts
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var hasOnlyKeys = (value, allowed) => {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key))
      return false;
  }
  return true;
};

// packages/protocol/src/limits.ts
var NAME_PATTERN = /^(?!(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$)[a-z][a-z0-9-]{0,39}$/;
var SHA256_PATTERN = /^[0-9a-f]{64}$/;
var FLOORS = {
  codeChars: 48000,
  checkMs: 2000,
  describeBytes: 262144,
  canvasSize: 4096
};
var DEFAULTS = {
  codeChars: 24000,
  checkMs: 1000,
  describeBytes: 65536,
  canvasWidth: 960,
  canvasHeight: 540
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
var LIMIT_KEYS = [
  "codeChars",
  "checkMs",
  "describeBytes",
  "canvasWidth",
  "canvasHeight"
];
var LIMIT_RANGES = {
  codeChars: { min: 1, max: FLOORS.codeChars },
  checkMs: { min: 1, max: FLOORS.checkMs },
  describeBytes: { min: 1, max: FLOORS.describeBytes },
  canvasWidth: { min: 16, max: FLOORS.canvasSize },
  canvasHeight: { min: 16, max: FLOORS.canvasSize }
};
var isLimitKey = (key) => LIMIT_KEYS.includes(key);
var resolveLimits = (overrides) => {
  if (overrides === undefined)
    return ok({ ...DEFAULTS });
  if (!isRecord(overrides))
    return fail("bad-limits");
  try {
    for (const key of Object.keys(overrides)) {
      if (!isLimitKey(key))
        return fail("bad-limits");
    }
    const resolved = { ...DEFAULTS };
    for (const key of LIMIT_KEYS) {
      if (!Object.hasOwn(overrides, key))
        continue;
      const value = overrides[key];
      const range = LIMIT_RANGES[key];
      if (typeof value !== "number" || !Number.isInteger(value) || value < range.min || value > range.max) {
        return fail("bad-limits", key);
      }
      resolved[key] = value;
    }
    return ok({ ...resolved });
  } catch {
    return fail("bad-limits");
  }
};
// packages/protocol/src/digest.ts
var encoder = new TextEncoder;
var HEX = "0123456789abcdef";
var toHex = (bytes) => {
  let hex = "";
  for (const byte of bytes) {
    hex += HEX[byte >> 4] ?? "0";
    hex += HEX[byte & 15] ?? "0";
  }
  return hex;
};
var utf8Bytes = (text) => encoder.encode(text).length;
var sha256Hex = async (data) => {
  const bytes = typeof data === "string" ? encoder.encode(data) : new Uint8Array(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(new Uint8Array(digest));
};
var submissionDigest = (name, code) => sha256Hex(`${name}
${code}`);
// packages/protocol/src/imports.ts
var WORD_PATTERN = /(?<![A-Za-z0-9_])(?:import|export|from)(?![A-Za-z0-9_])/g;
var SPACE_PATTERN = /\s/y;
var NAME_CHAR_PATTERN = /[A-Za-z0-9_$\\\u0080-\uFFFF]/y;
var SPECIFIER_PATTERN = /(["'])((?:room|lib):[a-z][a-z0-9-]{0,39})\1/y;
var SEQUENCE_PATTERN = /[\sA-Za-z0-9_$,{}*\u0080-\uFFFF]*/y;
var FAIL = { kind: "fail" };
var pass = (span = null, skipUntil = 0) => ({ kind: "pass", span, skipUntil });
var isSpaceAt = (text, index) => {
  SPACE_PATTERN.lastIndex = index;
  return SPACE_PATTERN.test(text);
};
var skipSpaces = (code, from) => {
  let index = from;
  while (index < code.length && isSpaceAt(code, index))
    index += 1;
  return index;
};
var isQuoteAt = (code, index) => {
  const ch = code.charAt(index);
  return ch === '"' || ch === "'";
};
var isCommentAt = (code, index) => code.startsWith("//", index) || code.startsWith("/*", index);
var isNameCharAt = (code, index) => {
  if (index >= code.length)
    return false;
  NAME_CHAR_PATTERN.lastIndex = index;
  return NAME_CHAR_PATTERN.test(code);
};
var specifierAt = (code, index) => {
  SPECIFIER_PATTERN.lastIndex = index;
  const match = SPECIFIER_PATTERN.exec(code);
  if (match === null)
    return null;
  const specifier = match[2];
  if (specifier === undefined)
    return null;
  return { start: index + 1, end: index + specifier.length + 1, specifier };
};
var isWordChar = (ch) => {
  const code = ch.charCodeAt(0);
  return code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95;
};
var trimSpacesEnd = (text) => {
  let end = text.length;
  while (end > 0 && isSpaceAt(text, end - 1))
    end -= 1;
  return text.slice(0, end);
};
var endsWithWordFrom = (text) => text.length >= 4 && text.endsWith("from") && (text.length === 4 || !isWordChar(text.charAt(text.length - 5)));
var checkSequence = (code, from) => {
  SEQUENCE_PATTERN.lastIndex = from;
  const match = SEQUENCE_PATTERN.exec(code);
  if (match === null)
    return FAIL;
  const sequence = match[0];
  const end = from + sequence.length;
  if (!isQuoteAt(code, end))
    return FAIL;
  if (!endsWithWordFrom(trimSpacesEnd(sequence)))
    return FAIL;
  return pass(null, end);
};
var checkImport = (code, index) => {
  const afterWord = index + 6;
  const afterMeta = afterWord + 5;
  if (code.startsWith(".meta", afterWord) && !isNameCharAt(code, afterMeta)) {
    return pass();
  }
  const afterSpaces = skipSpaces(code, afterWord);
  if (isQuoteAt(code, afterSpaces)) {
    const span = specifierAt(code, afterSpaces);
    return span === null ? FAIL : pass(span, afterWord);
  }
  return checkSequence(code, afterWord);
};
var checkExport = (code, index) => {
  const afterWord = index + 6;
  const afterSpaces = skipSpaces(code, afterWord);
  if (isCommentAt(code, afterSpaces))
    return FAIL;
  if (code.charAt(afterSpaces) === "*")
    return checkSequence(code, afterWord);
  return pass();
};
var checkFrom = (code, index) => {
  const afterWord = index + 4;
  const before = code.charAt(index - 1);
  if (isQuoteAt(code, index - 1) && code.charAt(afterWord) === before)
    return pass();
  const afterSpaces = skipSpaces(code, afterWord);
  if (isCommentAt(code, afterSpaces))
    return FAIL;
  if (isQuoteAt(code, afterSpaces)) {
    const span = specifierAt(code, afterSpaces);
    return span === null ? FAIL : pass(span, afterWord);
  }
  return pass();
};
var checkWord = (code, word, index) => {
  if (word === "import")
    return checkImport(code, index);
  if (word === "export")
    return checkExport(code, index);
  return checkFrom(code, index);
};
var lineAt = (code, index) => {
  let line = 1;
  for (let i = 0;i < index; i += 1) {
    if (code.charCodeAt(i) === 10)
      line += 1;
  }
  return line;
};
var findSpecifiers = (code) => {
  const spans = [];
  let skipUntil = 0;
  let spanEnd = 0;
  WORD_PATTERN.lastIndex = 0;
  for (let match = WORD_PATTERN.exec(code);match !== null; match = WORD_PATTERN.exec(code)) {
    const word = match[0];
    const index = match.index;
    if (index < spanEnd)
      continue;
    if (word !== "from" && index < skipUntil)
      continue;
    const outcome = checkWord(code, word, index);
    if (outcome.kind === "fail") {
      return fail("bad-import", `line:${lineAt(code, index)}`);
    }
    if (outcome.span !== null) {
      spans.push(outcome.span);
      spanEnd = outcome.span.end;
    }
    if (outcome.skipUntil > skipUntil)
      skipUntil = outcome.skipUntil;
  }
  return ok(spans);
};
var findImports = (code) => {
  const found = findSpecifiers(code);
  if (!found.ok)
    return found;
  const room = [];
  const lib = [];
  const seen = new Set;
  for (const span of found.value) {
    if (seen.has(span.specifier))
      continue;
    seen.add(span.specifier);
    const colon = span.specifier.indexOf(":");
    const kind = span.specifier.slice(0, colon);
    const name = span.specifier.slice(colon + 1);
    if (kind === "room")
      room.push(name);
    else
      lib.push(name);
  }
  return ok({ room, lib });
};
// packages/protocol/src/submission.ts
var TITLE_PREFIX = "contribute: ";
var START_PATTERN = /^```js[ \t]*$/;
var END_PATTERN = /^ {0,3}```[ \t]*$/;
var TAG_PATTERN = /<[A-Za-z/!?]/;
var BACKTICKS_ONLY_PATTERN = /^`{3,}$/;
var FORBIDDEN_PATTERN = /(?![\n\t])[\p{Cc}\p{Zl}\p{Zp}\p{Bidi_Control}\p{Noncharacter_Code_Point}]/u;
var failure = (code) => ({ code: null, error: code });
var scanLines = (lines) => {
  const codeLines = [];
  let inBlock = false;
  let started = false;
  let closed = false;
  let code = null;
  for (const line of lines) {
    if (!inBlock) {
      if (START_PATTERN.test(line)) {
        if (started)
          return failure("many-code");
        started = true;
        inBlock = true;
        continue;
      }
      if (line.includes("```") || line.includes("~~~"))
        return failure("bad-body");
      if (TAG_PATTERN.test(line))
        return failure("bad-body");
      continue;
    }
    if (END_PATTERN.test(line)) {
      inBlock = false;
      closed = true;
      code = codeLines.join(`
`);
      continue;
    }
    if (BACKTICKS_ONLY_PATTERN.test(line.trim()))
      return failure("bad-body");
    codeLines.push(line);
  }
  if (!started || !closed)
    return failure("no-code");
  return { code, error: null };
};
var invalid = (code, name) => ({ kind: "invalid", code, name });
var parseSubmission = (input, options) => {
  const title = input.title;
  if (!title.startsWith(TITLE_PREFIX))
    return { kind: "skip" };
  const name = title.slice(TITLE_PREFIX.length);
  if (!NAME_PATTERN.test(name))
    return invalid("bad-name", null);
  if (name === options.entryName)
    return invalid("bad-name", name);
  const body = input.body;
  if (body.length > FIXED.bodyChars)
    return invalid("too-large", name);
  if (!body.isWellFormed())
    return invalid("bad-body", name);
  const text = body.replaceAll(`\r
`, `
`);
  if (text.includes("\r"))
    return invalid("bad-body", name);
  if (FORBIDDEN_PATTERN.test(text))
    return invalid("bad-body", name);
  const scanned = scanLines(text.split(`
`));
  if (scanned.error !== null)
    return invalid(scanned.error, name);
  const code = scanned.code ?? "";
  if (code.trim() === "")
    return invalid("no-code", name);
  if (code.length > options.codeCharsMax)
    return invalid("too-large", name);
  const found = findImports(code);
  if (!found.ok)
    return invalid("bad-import", name);
  const { room: roomDeps, lib: libDeps } = found.value;
  if (roomDeps.includes(name))
    return invalid("bad-import", name);
  if (roomDeps.length + libDeps.length > FIXED.depsMax)
    return invalid("too-many-deps", name);
  return { kind: "ok", submission: { name, code, roomDeps, libDeps } };
};
// packages/protocol/src/marker.ts
var CHECK_CODES = [
  "ok",
  "ok-static",
  "bad-name",
  "no-code",
  "many-code",
  "bad-body",
  "too-large",
  "bad-import",
  "missing-dep",
  "too-many-deps",
  "load-error",
  "timeout",
  "memory",
  "bad-describe",
  "internal"
];
var isCheckCode = (value) => typeof value === "string" && CHECK_CODES.includes(value);
// packages/protocol/src/room-config.ts
var CONFIG_KEYS = ["format", "title", "entry", "surface", "lib", "license", "limits"];
var LIB_KEYS = ["name", "path", "sha256", "bytes"];
var SURFACE_VALUES = ["2d", "webgl2"];
var LIB_PATH_PATTERN = /^lib\/[A-Za-z0-9._-]{1,80}\.js$/;
var isText = (value, maxChars) => typeof value === "string" && value.length >= 1 && value.length <= maxChars && value.isWellFormed();
var isSurface = (value) => typeof value === "string" && SURFACE_VALUES.includes(value);
var parseLibEntry = (value) => {
  if (!isRecord(value) || !hasOnlyKeys(value, LIB_KEYS))
    return fail("bad-config", "lib");
  const name = value["name"];
  if (typeof name !== "string" || !NAME_PATTERN.test(name))
    return fail("bad-config", "lib.name");
  const path = value["path"];
  if (typeof path !== "string" || !LIB_PATH_PATTERN.test(path) || path.includes("..")) {
    return fail("bad-config", "lib.path");
  }
  const sha256 = value["sha256"];
  if (typeof sha256 !== "string" || !SHA256_PATTERN.test(sha256))
    return fail("bad-config", "lib.sha256");
  const bytes = value["bytes"];
  if (typeof bytes !== "number" || !Number.isInteger(bytes) || bytes < 1 || bytes > FIXED.libBytesMax) {
    return fail("bad-config", "lib.bytes");
  }
  return ok({ name, path, sha256, bytes });
};
var parseLib = (value) => {
  if (!Array.isArray(value))
    return fail("bad-config", "lib");
  if (value.length > FIXED.libCountMax)
    return fail("bad-config", "lib");
  const entries = [];
  const names = new Set;
  let totalBytes = 0;
  for (const item of value) {
    const parsed = parseLibEntry(item);
    if (!parsed.ok)
      return parsed;
    if (names.has(parsed.value.name))
      return fail("bad-config", "lib.name");
    names.add(parsed.value.name);
    totalBytes += parsed.value.bytes;
    if (totalBytes > FIXED.libTotalBytesMax)
      return fail("bad-config", "lib.bytes");
    entries.push(parsed.value);
  }
  return ok(entries);
};
var parseRoomConfig = (json) => {
  if (!isRecord(json))
    return fail("bad-config");
  if (!hasOnlyKeys(json, CONFIG_KEYS))
    return fail("bad-config");
  if (json["format"] !== 1)
    return fail("bad-config", "format");
  const title = json["title"];
  if (!isText(title, FIXED.titleChars))
    return fail("bad-config", "title");
  const entry = json["entry"];
  if (typeof entry !== "string" || !NAME_PATTERN.test(entry))
    return fail("bad-config", "entry");
  const surface = json["surface"];
  if (!isSurface(surface))
    return fail("bad-config", "surface");
  const license = json["license"];
  if (!isText(license, FIXED.licenseChars))
    return fail("bad-config", "license");
  let lib = [];
  if (Object.hasOwn(json, "lib")) {
    const parsed = parseLib(json["lib"]);
    if (!parsed.ok)
      return parsed;
    lib = parsed.value;
  }
  const resolved = resolveLimits(Object.hasOwn(json, "limits") ? json["limits"] : undefined);
  if (!resolved.ok)
    return fail("bad-config", "limits");
  return ok({ format: 1, title, entry, surface, lib, license, limits: resolved.value });
};
// packages/protocol/src/manifest.ts
var MANIFEST_KEYS = ["format", "modules"];
var MODULE_KEYS = ["name", "path", "sha256", "bytes", "issue", "author", "adoptedAt"];
var AUTHOR_KEYS = ["login", "id"];
var LOGIN_PATTERN = /^[A-Za-z0-9-]{1,39}(\[bot\])?$/;
var ADOPTED_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
var modulePath = (name) => `modules/${name}.js`;
var parseAuthor = (value, index) => {
  if (!isRecord(value) || !hasOnlyKeys(value, AUTHOR_KEYS)) {
    return fail("bad-manifest", `modules[${index}].author`);
  }
  const login = value["login"];
  if (typeof login !== "string" || !LOGIN_PATTERN.test(login)) {
    return fail("bad-manifest", `modules[${index}].author.login`);
  }
  const id = value["id"];
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) {
    return fail("bad-manifest", `modules[${index}].author.id`);
  }
  return ok({ login, id });
};
var parseModuleEntry = (value, index) => {
  if (!isRecord(value) || !hasOnlyKeys(value, MODULE_KEYS)) {
    return fail("bad-manifest", `modules[${index}]`);
  }
  const name = value["name"];
  if (typeof name !== "string" || !NAME_PATTERN.test(name)) {
    return fail("bad-manifest", `modules[${index}].name`);
  }
  const path = value["path"];
  if (path !== modulePath(name))
    return fail("bad-manifest", `modules[${index}].path`);
  const sha256 = value["sha256"];
  if (typeof sha256 !== "string" || !SHA256_PATTERN.test(sha256)) {
    return fail("bad-manifest", `modules[${index}].sha256`);
  }
  const bytes = value["bytes"];
  if (typeof bytes !== "number" || !Number.isSafeInteger(bytes) || bytes < 0) {
    return fail("bad-manifest", `modules[${index}].bytes`);
  }
  const issue = value["issue"];
  if (issue !== null && (typeof issue !== "number" || !Number.isSafeInteger(issue) || issue < 1)) {
    return fail("bad-manifest", `modules[${index}].issue`);
  }
  const author = parseAuthor(value["author"], index);
  if (!author.ok)
    return author;
  const adoptedAt = value["adoptedAt"];
  if (typeof adoptedAt !== "string" || !ADOPTED_AT_PATTERN.test(adoptedAt) || Number.isNaN(Date.parse(adoptedAt))) {
    return fail("bad-manifest", `modules[${index}].adoptedAt`);
  }
  return ok({ name, path: modulePath(name), sha256, bytes, issue, author: author.value, adoptedAt });
};
var parseManifest = (json) => {
  try {
    if (!isRecord(json) || !hasOnlyKeys(json, MANIFEST_KEYS))
      return fail("bad-manifest");
    if (json["format"] !== 1)
      return fail("bad-manifest", "format");
    const rawModules = json["modules"];
    if (!Array.isArray(rawModules))
      return fail("bad-manifest", "modules");
    if (rawModules.length > FIXED.modulesMax)
      return fail("bad-manifest", "modules");
    const modules = [];
    const names = new Set;
    for (let index = 0;index < rawModules.length; index += 1) {
      const parsed = parseModuleEntry(rawModules[index], index);
      if (!parsed.ok)
        return parsed;
      const name = parsed.value.name;
      if (names.has(name))
        return fail("bad-manifest", `modules[${index}].name`);
      names.add(name);
      modules.push(parsed.value);
    }
    return ok({ format: 1, modules });
  } catch {
    return fail("bad-manifest");
  }
};
// packages/protocol/src/module-graph.ts
var heapPush = (heap, node) => {
  let position = heap.length;
  heap.push(node);
  while (position > 0) {
    const parentPosition = position - 1 >> 1;
    const parent = heap[parentPosition];
    if (parent === undefined || parent.index <= node.index)
      break;
    heap[position] = parent;
    position = parentPosition;
  }
  heap[position] = node;
};
var heapPop = (heap) => {
  const first = heap[0];
  const last = heap.pop();
  if (first === undefined || last === undefined)
    return;
  if (heap.length === 0)
    return first;
  const length = heap.length;
  let position = 0;
  for (;; ) {
    const leftPosition = position * 2 + 1;
    if (leftPosition >= length)
      break;
    const rightPosition = leftPosition + 1;
    let childPosition = leftPosition;
    const left = heap[leftPosition];
    const right = heap[rightPosition];
    if (left !== undefined && right !== undefined && right.index < left.index)
      childPosition = rightPosition;
    const child = heap[childPosition];
    if (child === undefined || child.index >= last.index)
      break;
    heap[position] = child;
    position = childPosition;
  }
  heap[position] = last;
  return first;
};
var prepare = (name, index, code, target, libNames) => {
  const found = findImports(code);
  if (!found.ok)
    return { name, index, deps: [], bad: true, remaining: 0, dependents: [] };
  const deps = [];
  let bad = false;
  for (const dep of found.value.room) {
    const position = target.get(dep);
    if (position === undefined)
      bad = true;
    else
      deps.push(position);
  }
  for (const lib of found.value.lib) {
    if (!libNames.has(lib))
      bad = true;
  }
  return { name, index, deps, bad, remaining: deps.length, dependents: [] };
};
var planLoad = (sources, libNames) => {
  const names = [...sources.keys()];
  const target = new Map;
  for (const [index, name] of names.entries())
    target.set(name, index);
  const nodes = [];
  for (const [index, name] of names.entries()) {
    nodes.push(prepare(name, index, sources.get(name) ?? "", target, libNames));
  }
  for (const node of nodes) {
    for (const dep of node.deps)
      nodes[dep]?.dependents.push(node.index);
  }
  const heap = [];
  for (const node of nodes) {
    if (!node.bad && node.remaining === 0)
      heapPush(heap, node);
  }
  const order = [];
  const emitted = new Set;
  for (;; ) {
    const node = heapPop(heap);
    if (node === undefined)
      break;
    if (emitted.has(node.index))
      continue;
    emitted.add(node.index);
    order.push(node.name);
    for (const dependent of node.dependents) {
      const next = nodes[dependent];
      if (next === undefined)
        continue;
      next.remaining -= 1;
      if (next.remaining === 0 && !next.bad)
        heapPush(heap, next);
    }
  }
  const floating = nodes.filter((node) => !emitted.has(node.index)).map((node) => node.name);
  return { order, floating };
};
// packages/protocol/src/candidate.ts
var withCandidate = (sources, candidate) => {
  const merged = new Map;
  let replaces = false;
  for (const [name, code] of sources) {
    if (name === candidate.name) {
      merged.set(name, candidate.code);
      replaces = true;
    } else {
      merged.set(name, code);
    }
  }
  if (!replaces)
    merged.set(candidate.name, candidate.code);
  return { merged, replaces };
};
var findMissing = (candidate, merged, libNames) => {
  const found = findImports(candidate.code);
  if (!found.ok)
    return [];
  const missing = [];
  for (const name of found.value.room) {
    if (!merged.has(name))
      missing.push(`room:${name}`);
  }
  for (const lib of found.value.lib) {
    if (!libNames.has(lib))
      missing.push(`lib:${lib}`);
  }
  return missing;
};
var reachableFrom = (candidateName, merged) => {
  const visited = new Set([candidateName]);
  const queue = [candidateName];
  let usesLib = false;
  for (let cursor = 0;cursor < queue.length; cursor += 1) {
    const name = queue[cursor];
    if (name === undefined)
      continue;
    const code = merged.get(name);
    if (code === undefined)
      continue;
    const found = findImports(code);
    if (!found.ok)
      continue;
    if (found.value.lib.length > 0)
      usesLib = true;
    for (const dep of found.value.room) {
      if (visited.has(dep) || !merged.has(dep))
        continue;
      visited.add(dep);
      queue.push(dep);
    }
  }
  return { visited, usesLib };
};
var planCandidate = (sources, libNames, candidate) => {
  const { merged, replaces } = withCandidate(sources, candidate);
  const before = planLoad(sources, libNames);
  const plan = planLoad(merged, libNames);
  const floats = plan.floating.includes(candidate.name);
  const floatingBefore = new Set(before.floating);
  const newlyFloating = plan.floating.filter((name) => name !== candidate.name && !floatingBefore.has(name));
  const missing = findMissing(candidate, merged, libNames);
  let closure = [];
  let usesLib = false;
  if (!floats) {
    const reach = reachableFrom(candidate.name, merged);
    usesLib = reach.usesLib;
    closure = plan.order.filter((name) => reach.visited.has(name));
  }
  return { sources: merged, plan, replaces, missing, floats, newlyFloating, closure, usesLib };
};
// packages/protocol/src/bundle.ts
var BUNDLE_KEYS = ["format", "config", "manifest", "sources"];
var manifestNames = (manifest) => new Set(manifest.modules.map((module) => module.name));
var matchesEntry = async (entry, code) => {
  if (!code.isWellFormed())
    return false;
  if (utf8Bytes(code) !== entry.bytes)
    return false;
  return await sha256Hex(code) === entry.sha256;
};
var checkBundleShape = (json) => {
  if (!isRecord(json) || !hasOnlyKeys(json, BUNDLE_KEYS))
    return fail("bad-bundle");
  if (json["format"] !== 1)
    return fail("bad-bundle", "format");
  return ok(json);
};
var checkSourceTexts = (sources, names) => {
  for (const name of Object.keys(sources)) {
    const code = sources[name];
    if (typeof code !== "string" || !code.isWellFormed()) {
      return fail("bad-bundle", names.has(name) ? name : "sources");
    }
  }
  return ok(null);
};
var hasSameNames = (sources, names) => {
  const keys = Object.keys(sources);
  if (keys.length !== names.size)
    return false;
  for (const key of keys) {
    if (!names.has(key))
      return false;
  }
  return true;
};
var parseBundle = async (text) => {
  if (typeof text !== "string")
    return fail("bad-bundle");
  if (text.length > FIXED.bundleBytesMax)
    return fail("too-large");
  if (utf8Bytes(text) > FIXED.bundleBytesMax)
    return fail("too-large");
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return fail("bad-bundle");
  }
  const shape = checkBundleShape(json);
  if (!shape.ok)
    return shape;
  const bundle = shape.value;
  const config = parseRoomConfig(bundle["config"]);
  if (!config.ok)
    return fail("bad-config", config.detail);
  const manifest = parseManifest(bundle["manifest"]);
  if (!manifest.ok)
    return fail("bad-manifest", manifest.detail);
  const rawSources = bundle["sources"];
  if (!isRecord(rawSources))
    return fail("bad-bundle", "sources");
  const names = manifestNames(manifest.value);
  const broken = checkSourceTexts(rawSources, names);
  if (!broken.ok)
    return broken;
  if (!hasSameNames(rawSources, names))
    return fail("bad-bundle", "sources");
  const sources = new Map;
  for (const entry of manifest.value.modules) {
    const code = rawSources[entry.name];
    if (typeof code !== "string" || !await matchesEntry(entry, code)) {
      return fail("hash-mismatch", entry.name);
    }
    sources.set(entry.name, code);
  }
  return ok({ config: config.value, manifest: manifest.value, sources });
};
// packages/protocol/src/reveal.ts
var BLANK_LOOKING = new Set(["⠀", "\uD81B\uDFE4", "\uD834\uDD59"]);
// packages/protocol/src/text.ts
var ALNUM = "0-9A-Za-z\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF41-\\uFF5A";
var CODE_CHAR = "[0-9A-Z\\uFF10-\\uFF19\\uFF21-\\uFF3A]";
var AUTH_CODE = new RegExp(`(?<![${ALNUM}])${CODE_CHAR}{4}\\s{0,3}[-\\u2010-\\u2015\\u2212\\uFE58\\uFE63\\uFF0D]\\s{0,3}` + `${CODE_CHAR}{4}(?![${ALNUM}])`, "gu");
// packages/check/src/event.ts
var isRecord2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var parseEvent = (text) => {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return;
  }
  if (!isRecord2(json))
    return;
  const issue = json["issue"];
  if (!isRecord2(issue))
    return;
  const title = issue["title"];
  if (typeof title !== "string")
    return;
  const rawBody = issue["body"];
  const body = rawBody === null || rawBody === undefined ? "" : rawBody;
  if (typeof body !== "string")
    return;
  return { title, body };
};

// packages/check/src/inspect.ts
var internal = (name, digest) => ({ code: "internal", name, digest });
var skipped = () => ({ code: "skip", name: null, digest: null });
var inspect = async (input) => {
  let name = null;
  let digest = null;
  try {
    const event = parseEvent(input.eventText);
    if (event === undefined)
      return internal(null, null);
    if (!event.title.startsWith(TITLE_PREFIX))
      return skipped();
    const room = await input.loadRoom();
    if (room === undefined)
      return internal(null, null);
    const parsed = parseSubmission({ title: event.title, body: event.body }, { entryName: room.config.entry, codeCharsMax: room.config.limits.codeChars });
    if (parsed.kind === "skip")
      return skipped();
    if (parsed.kind === "invalid")
      return { code: parsed.code, name: parsed.name, digest: null };
    const submission = parsed.submission;
    name = submission.name;
    digest = await submissionDigest(name, submission.code);
    const libNames = new Set(room.config.lib.map((entry) => entry.name));
    const plan = planCandidate(room.sources, libNames, { name, code: submission.code });
    if (plan.missing.length > 0)
      return { code: "missing-dep", name, digest };
    if (plan.floats)
      return { code: "load-error", name, digest };
    if (plan.usesLib)
      return { code: "ok-static", name, digest };
    const deps = plan.closure.filter((dep) => dep !== name).map((dep) => ({ name: dep, source: room.sources.get(dep) ?? "" }));
    const outcome = await input.runSandbox({
      name,
      code: submission.code,
      deps,
      checkMs: room.config.limits.checkMs,
      describeBytes: room.config.limits.describeBytes
    });
    return { code: isCheckCode(outcome) ? outcome : "internal", name, digest };
  } catch {
    return internal(name, digest);
  }
};

// packages/check/src/result.ts
var serializeResult = (result) => `${JSON.stringify({ code: result.code, name: result.name, digest: result.digest })}
`;

// packages/check/src/room.ts
import { lstat, readFile } from "node:fs/promises";
import { join } from "node:path";
var decoder = new TextDecoder("utf-8", { fatal: true });
var readRoom = async (root) => {
  try {
    const path = join(root, "bundle.json");
    const info = await lstat(path);
    if (!info.isFile())
      return;
    if (info.size > FIXED.bundleBytesMax)
      return;
    const bytes = await readFile(path);
    if (bytes.byteLength > FIXED.bundleBytesMax)
      return;
    const text = decoder.decode(bytes);
    const parsed = await parseBundle(text);
    return parsed.ok ? parsed.value : undefined;
  } catch {
    return;
  }
};

// packages/check/src/sandbox/parent.ts
import { spawn } from "node:child_process";
import { Buffer } from "node:buffer";
import { dirname, join as join2 } from "node:path";
import { fileURLToPath } from "node:url";

// packages/check/src/sandbox/job.ts
var SANDBOX_OUTCOMES = ["ok", "load-error", "timeout", "memory", "bad-describe", "internal"];
var isSandboxOutcome = (value) => typeof value === "string" && SANDBOX_OUTCOMES.includes(value);
var MAX_JOB_BYTES = FIXED.bundleBytesMax * 2;
var isRecord3 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var parseReport = (text) => {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.includes(`
`) || trimmed.includes("\r"))
    return;
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return;
  }
  if (!isRecord3(parsed))
    return;
  const outcome = parsed["outcome"];
  return isSandboxOutcome(outcome) ? outcome : undefined;
};

// packages/check/src/sandbox/parent.ts
var OUTPUT_CAP_BYTES = 64 * 1024;
var defaultDir = () => dirname(fileURLToPath(import.meta.url));
var commandFor = (dir, nodePath) => [
  nodePath,
  "--permission",
  `--allow-fs-read=${dir}`,
  "--allow-worker",
  join2(dir, "child.mjs")
];
var runSandbox = (job, options) => new Promise((resolveOutcome) => {
  const payload = `${JSON.stringify(job)}
`;
  if (Buffer.byteLength(payload, "utf8") > MAX_JOB_BYTES) {
    resolveOutcome("internal");
    return;
  }
  let settled = false;
  let timer;
  const finish = (outcome) => {
    if (settled)
      return;
    settled = true;
    if (timer !== undefined)
      clearTimeout(timer);
    resolveOutcome(outcome);
  };
  const dir = options?.dir ?? defaultDir();
  const nodePath = options?.nodePath ?? process.execPath;
  const command = commandFor(dir, nodePath);
  let child;
  try {
    child = spawn(command[0] ?? nodePath, command.slice(1), {
      cwd: dir,
      env: {},
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
  } catch {
    resolveOutcome("internal");
    return;
  }
  let killed = false;
  let overflowed = false;
  let total = 0;
  const stdout = [];
  const stderr = [];
  const kill = () => {
    killed = true;
    try {
      child.kill("SIGKILL");
    } catch {}
  };
  const collect = (chunks) => (chunk) => {
    total += chunk.length;
    if (total > OUTPUT_CAP_BYTES) {
      overflowed = true;
      kill();
      return;
    }
    chunks.push(chunk);
  };
  timer = setTimeout(kill, job.checkMs + FIXED.parentGraceMs);
  child.stdout?.on("data", collect(stdout));
  child.stderr?.on("data", collect(stderr));
  child.on("error", () => {
    kill();
    finish("internal");
  });
  child.on("close", () => {
    if (overflowed) {
      finish("internal");
      return;
    }
    if (killed) {
      finish("timeout");
      return;
    }
    finish(parseReport(Buffer.concat(stdout).toString("utf8")) ?? "internal");
  });
  child.stdin?.on("error", () => {
    return;
  });
  try {
    child.stdin?.end(payload);
  } catch {
    kill();
    finish("internal");
  }
});

// packages/check/src/check.ts
var FALLBACK = { code: "internal", name: null, digest: null };
var decoder2 = new TextDecoder("utf-8", { fatal: true });
var readEventText = async (path) => {
  if (path === undefined)
    return "";
  try {
    return decoder2.decode(await readFile2(path));
  } catch {
    return "";
  }
};
var writeResult = async (path, result) => {
  if (path === undefined)
    return;
  try {
    await mkdir(dirname2(path), { recursive: true });
    await writeFile(path, serializeResult(result), "utf8");
  } catch {}
};
var main = async () => {
  const eventPath = process.argv[2];
  const root = process.argv[3];
  const outPath = process.argv[4];
  let result = FALLBACK;
  try {
    const eventText = await readEventText(eventPath);
    result = await inspect({
      eventText,
      loadRoom: async () => root === undefined ? undefined : readRoom(root),
      runSandbox
    });
  } catch {
    result = FALLBACK;
  }
  await writeResult(outPath, result);
  process.stdout.write(`${result.code}
`);
};
main().catch(() => {
  return;
});
