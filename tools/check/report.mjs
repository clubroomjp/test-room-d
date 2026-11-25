// packages/protocol/src/limits.ts
var NAME_PATTERN = /^(?!(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$)[a-z][a-z0-9-]{0,39}$/;
var SHA256_PATTERN = /^[0-9a-f]{64}$/;
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
var isPassing = (code) => code === "ok" || code === "ok-static";
var MARKER_PATTERN = /^<!-- jamroom-check v1 code=(?<code>[a-z][a-z0-9-]*) sha256=(?<digest>[0-9a-f]{64}|-) name=(?<name>[a-z][a-z0-9-]{0,39}|-) -->$/;
var MARKER_HEAD = "<!-- jamroom-check v1 code=";
var MARKER_TAIL = " -->";
var SHAPE_SEPARATOR = " ";
var SHA256_ABSENT = "-";
var NAME_ABSENT = "-";
var formatMarker = (marker) => {
  const digest = marker.digest !== null && SHA256_PATTERN.test(marker.digest) ? marker.digest : SHA256_ABSENT;
  const name = marker.name !== null && NAME_PATTERN.test(marker.name) ? marker.name : NAME_ABSENT;
  return `${MARKER_HEAD}${marker.code}${SHAPE_SEPARATOR}sha256=${digest}${SHAPE_SEPARATOR}name=${name}${MARKER_TAIL}`;
};
var parseLine = (line) => {
  const groups = MARKER_PATTERN.exec(line)?.groups;
  if (groups === undefined)
    return null;
  const code = groups["code"];
  const digest = groups["digest"];
  const name = groups["name"];
  if (code === undefined || digest === undefined || name === undefined)
    return null;
  if (!isCheckCode(code))
    return null;
  return {
    code,
    digest: digest === SHA256_ABSENT ? null : digest,
    name: name === NAME_ABSENT ? null : name
  };
};
var parseMarker = (commentBody) => {
  let found = null;
  for (const rawLine of commentBody.split(/\r\n|\r|\n/)) {
    const marker = parseLine(rawLine.trim());
    if (marker === null)
      continue;
    if (found !== null)
      return null;
    found = marker;
  }
  return found;
};
var BOT_LOGIN = "github-actions[bot]";
// packages/protocol/src/reveal.ts
var BLANK_LOOKING = new Set(["⠀", "\uD81B\uDFE4", "\uD834\uDD59"]);
// packages/protocol/src/text.ts
var ALNUM = "0-9A-Za-z\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF41-\\uFF5A";
var CODE_CHAR = "[0-9A-Z\\uFF10-\\uFF19\\uFF21-\\uFF3A]";
var AUTH_CODE = new RegExp(`(?<![${ALNUM}])${CODE_CHAR}{4}\\s{0,3}[-\\u2010-\\u2015\\u2212\\uFE58\\uFE63\\uFF0D]\\s{0,3}` + `${CODE_CHAR}{4}(?![${ALNUM}])`, "gu");
// packages/check/src/report-text.ts
var TEXT = {
  ok: {
    ja: "検査に通りました。採否はホストが決めます。",
    en: "The check passed. The host will decide whether to accept it."
  },
  "ok-static": {
    ja: "形の検査に通りました。外部のライブラリを読み込むため、実行の検査はしていません。",
    en: "The shape check passed. It was not run because it uses an external library."
  },
  "bad-name": {
    ja: "名前の形が正しくありません。小文字で始まり、小文字・数字・ハイフンだけを使えます。",
    en: "The name is not in the allowed form: start with a lowercase letter, then lowercase letters, digits or hyphens."
  },
  "no-code": {
    ja: "コードブロックがありません。```js で始まるブロックを 1 つ書いてください。",
    en: "No code block was found. Add exactly one block that starts with ```js."
  },
  "many-code": {
    ja: "コードブロックが複数あります。1 つだけにしてください。",
    en: "More than one code block was found. Keep exactly one."
  },
  "bad-body": {
    ja: "本文の形が正しくありません。コードブロックの外の HTML、別のコードブロック、画面に出ない制御文字は使えません。",
    en: "The body is not in the allowed form. Outside the code block, HTML, other code blocks and invisible control characters are not allowed."
  },
  "too-large": {
    ja: "本文またはコードが大きすぎます。短くしてください。",
    en: "The body or the code is too large. Please shorten it."
  },
  "bad-import": {
    ja: "読み込みの指定が使えません。静的な `room:<名前>` と `lib:<名前>` だけを使えます。import という語は、コメントや文字列にも書けません。",
    en: "The import is not allowed. Only static `room:<name>` and `lib:<name>` can be used, and the word import cannot appear in comments or strings."
  },
  "missing-dep": {
    ja: "読み込もうとしたモジュールが部屋にありません。",
    en: "A module you tried to import does not exist in this room."
  },
  "too-many-deps": {
    ja: `依存先が多すぎます。${FIXED.depsMax} 個までにしてください。`,
    en: `Too many dependencies. Keep it to ${FIXED.depsMax} or fewer.`
  },
  "load-error": {
    ja: "コードを読み込めませんでした。読み込みが、ほかの貢献と循環している場合や、読み込む先が宙に浮いている場合も含みます。",
    en: "The code could not be loaded. This includes circular imports with other contributions and dependencies that cannot be resolved."
  },
  timeout: {
    ja: "時間切れになりました。処理を短くしてください。",
    en: "The check timed out. Please make the work shorter."
  },
  memory: {
    ja: "メモリを使いすぎました。確保する量を減らしてください。",
    en: "The code used too much memory. Please allocate less."
  },
  "bad-describe": {
    ja: "describe() の戻り値が大きすぎるか、JSON にできません。",
    en: "The value returned by describe() is too large or cannot be turned into JSON."
  },
  internal: {
    ja: "検査の仕組みが止まりました。ホストが確認します。",
    en: "The check itself failed. The host will look into it."
  }
};
var reportText = (code, name, digest) => {
  const safeName = name !== null && NAME_PATTERN.test(name) ? name : null;
  const safeDigest = digest !== null && SHA256_PATTERN.test(digest) ? digest : null;
  const details = [];
  if (safeName !== null)
    details.push(`名前: ${safeName}`);
  if (safeDigest !== null)
    details.push(`コード: ${safeDigest.slice(0, 12)}`);
  const lines = [TEXT[code].ja, TEXT[code].en];
  if (details.length > 0)
    lines.push(details.join(" / "));
  lines.push(formatMarker({ code, name: safeName, digest: safeDigest }));
  return `${lines.join(`
`)}
`;
};

// packages/check/src/report.ts
var ISSUE_PATTERN = /^[1-9][0-9]{0,9}$/;
var REPO_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]{1,100}$/;
var API_PREFIX = "https://";
var PER_PAGE = 100;
var PAGES_MAX = 20;
var REQUEST_TIMEOUT_MS = 15000;
var STAGES = {
  unlabelOk: "ラベル check:ok の削除",
  unlabelNg: "ラベル check:ng の削除",
  comments: "コメントの一覧",
  commentCreate: "コメントの追加",
  commentUpdate: "コメントの書き換え",
  labelAdd: "ラベルの付与"
};
var fail2 = (stage, status) => {
  const state = status === undefined ? "不明" : `${status}`;
  const error = new Error(`${stage}に失敗しました（状態 ${state}）`);
  error.name = "ReportStageError";
  throw error;
};
var isRecord2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var normalizeApiUrl = (raw) => {
  let url = raw;
  while (url.endsWith("/"))
    url = url.slice(0, -1);
  if (!url.startsWith(API_PREFIX) || url.length <= API_PREFIX.length)
    return;
  return url;
};
var isValidRepo = (repo) => {
  if (!REPO_PATTERN.test(repo))
    return false;
  const name = repo.slice(repo.indexOf("/") + 1);
  return name !== "." && name !== "..";
};
var readComment = (value) => {
  if (!isRecord2(value))
    return;
  const id = value["id"];
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0)
    return;
  const user = value["user"];
  if (!isRecord2(user))
    return;
  const login = user["login"];
  const type = user["type"];
  if (typeof login !== "string" || typeof type !== "string")
    return;
  const body = value["body"];
  return { id, login, type, body: typeof body === "string" ? body : null };
};
var report = async (input, fetchImpl) => {
  const rawCode = input.code;
  if (rawCode === "" || rawCode === "skip")
    return "skipped";
  if (!isCheckCode(rawCode))
    return "bad-input";
  if (!ISSUE_PATTERN.test(input.issue))
    return "bad-input";
  if (!isValidRepo(input.repo))
    return "bad-input";
  if (input.token === "")
    return "bad-input";
  const apiUrl = normalizeApiUrl(input.apiUrl);
  if (apiUrl === undefined)
    return "bad-input";
  const request = async (stage, url, method, body) => {
    try {
      return await fetchImpl(url, {
        method,
        headers: {
          authorization: `Bearer ${input.token}`,
          accept: "application/vnd.github+json",
          "content-type": "application/json",
          "user-agent": "check-report"
        },
        ...body === undefined ? {} : { body },
        redirect: "error",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
    } catch {
      return fail2(stage, undefined);
    }
  };
  const ensureOk = (stage, response, allowNotFound = false) => {
    if (allowNotFound && response.status === 404)
      return;
    if (response.status < 200 || response.status > 299)
      fail2(stage, response.status);
  };
  const readPage = async (url) => {
    const response = await request(STAGES.comments, url, "GET");
    ensureOk(STAGES.comments, response);
    const json = await response.json().catch(() => fail2(STAGES.comments, undefined));
    if (!Array.isArray(json))
      return fail2(STAGES.comments, undefined);
    const entries = [];
    for (const item of json) {
      const entry = readComment(item);
      if (entry !== undefined)
        entries.push(entry);
    }
    return { count: json.length, entries };
  };
  const findBotComment = async (issueUrl2) => {
    let found;
    for (let page = 1;page <= PAGES_MAX; page += 1) {
      const { count, entries } = await readPage(`${issueUrl2}/comments?per_page=${PER_PAGE}&page=${page}`);
      for (const entry of entries) {
        if (entry.login !== BOT_LOGIN || entry.type !== "Bot")
          continue;
        if (entry.body === null || parseMarker(entry.body) === null)
          continue;
        found = entry.id;
      }
      if (count < PER_PAGE)
        break;
    }
    return found;
  };
  const issueUrl = `${apiUrl}/repos/${input.repo}/issues/${input.issue}`;
  const text = reportText(rawCode, input.name, input.digest);
  ensureOk(STAGES.unlabelOk, await request(STAGES.unlabelOk, `${issueUrl}/labels/check%3Aok`, "DELETE"), true);
  ensureOk(STAGES.unlabelNg, await request(STAGES.unlabelNg, `${issueUrl}/labels/check%3Ang`, "DELETE"), true);
  const botComment = await findBotComment(issueUrl);
  if (botComment === undefined) {
    const created = await request(STAGES.commentCreate, `${issueUrl}/comments`, "POST", JSON.stringify({ body: text }));
    ensureOk(STAGES.commentCreate, created);
  } else {
    const updated = await request(STAGES.commentUpdate, `${apiUrl}/repos/${input.repo}/issues/comments/${botComment}`, "PATCH", JSON.stringify({ body: text }));
    ensureOk(STAGES.commentUpdate, updated);
  }
  const label = isPassing(rawCode) ? "check:ok" : "check:ng";
  ensureOk(STAGES.labelAdd, await request(STAGES.labelAdd, `${issueUrl}/labels`, "POST", JSON.stringify({ labels: [label] })));
  return "done";
};

// packages/check/src/report-main.ts
var DEFAULT_API_URL = "https://api.github.com";
var readEnv = (name) => process.env[name] ?? "";
var main = async () => {
  try {
    const result = await report({
      code: readEnv("CODE"),
      name: readEnv("NAME"),
      digest: readEnv("SHA256"),
      issue: readEnv("ISSUE"),
      repo: readEnv("GITHUB_REPOSITORY"),
      token: readEnv("GH_TOKEN"),
      apiUrl: process.env["GITHUB_API_URL"] ?? DEFAULT_API_URL
    }, fetch);
    process.stdout.write(`${result}
`);
    process.exitCode = result === "done" || result === "skipped" ? 0 : 1;
  } catch (error) {
    const safe = error instanceof Error && error.name === "ReportStageError";
    process.stderr.write(`${safe ? error.message : "結果を書けませんでした"}
`);
    process.exitCode = 1;
  }
};
main();
