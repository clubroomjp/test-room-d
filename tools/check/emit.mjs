// packages/check/src/emit-main.ts
import { readFile, stat } from "node:fs/promises";
// packages/protocol/src/limits.ts
var NAME_PATTERN = /^(?!(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$)[a-z][a-z0-9-]{0,39}$/;
var SHA256_PATTERN = /^[0-9a-f]{64}$/;
var FLOORS = {
  codeChars: 48000,
  checkMs: 2000,
  describeBytes: 262144,
  canvasSize: 4096
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
// packages/protocol/src/reveal.ts
var BLANK_LOOKING = new Set(["⠀", "\uD81B\uDFE4", "\uD834\uDD59"]);
// packages/protocol/src/text.ts
var ALNUM = "0-9A-Za-z\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF41-\\uFF5A";
var CODE_CHAR = "[0-9A-Z\\uFF10-\\uFF19\\uFF21-\\uFF3A]";
var AUTH_CODE = new RegExp(`(?<![${ALNUM}])${CODE_CHAR}{4}\\s{0,3}[-\\u2010-\\u2015\\u2212\\uFE58\\uFE63\\uFF0D]\\s{0,3}` + `${CODE_CHAR}{4}(?![${ALNUM}])`, "gu");
// packages/check/src/result.ts
var RESULT_KEYS = ["code", "name", "digest"];
var isRecord2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var parseResult = (json) => {
  if (!isRecord2(json))
    return;
  if (Object.keys(json).length !== RESULT_KEYS.length)
    return;
  for (const key of RESULT_KEYS) {
    if (!Object.hasOwn(json, key))
      return;
  }
  const code = json["code"];
  if (code !== "skip" && !isCheckCode(code))
    return;
  const name = json["name"];
  if (name !== null && (typeof name !== "string" || !NAME_PATTERN.test(name)))
    return;
  const digest = json["digest"];
  if (digest !== null && (typeof digest !== "string" || !SHA256_PATTERN.test(digest)))
    return;
  return { code, name, digest };
};

// packages/check/src/emit.ts
var RESULT_BYTES_MAX = 64 * 1024;
var INTERNAL_LINES = `code=internal
name=
sha256=
`;
var toLines = (code, name, digest) => `code=${code}
name=${name ?? ""}
sha256=${digest ?? ""}
`;
var emitLines = (text) => {
  if (text === undefined)
    return INTERNAL_LINES;
  if (text.length > RESULT_BYTES_MAX)
    return INTERNAL_LINES;
  if (utf8Bytes(text) > RESULT_BYTES_MAX)
    return INTERNAL_LINES;
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return INTERNAL_LINES;
  }
  const result = parseResult(json);
  if (result === undefined)
    return INTERNAL_LINES;
  return toLines(result.code, result.name, result.digest);
};

// packages/check/src/emit-main.ts
var decoder = new TextDecoder("utf-8", { fatal: true });
var readResultText = async (path) => {
  if (path === undefined)
    return;
  try {
    const info = await stat(path);
    if (!info.isFile() || info.size > RESULT_BYTES_MAX)
      return;
    return decoder.decode(await readFile(path));
  } catch {
    return;
  }
};
var main = async () => {
  const text = await readResultText(process.argv[2]);
  process.stdout.write(emitLines(text));
};
main().catch(() => {
  process.stdout.write(INTERNAL_LINES);
});
