#!/usr/bin/env node

// src/commands/archive.ts
import { mkdir as mkdir4, readdir as readdir2, rename, stat as stat2 } from "node:fs/promises";
import { dirname as dirname3, join as join8, relative } from "node:path";

// src/lib/archive-index.ts
function withIndexLine(text, entry) {
  const lines = text.split(`
`);
  const start = lines.findIndex((line) => /^##\s+closed\b/i.test(line));
  if (start === -1)
    return `${text.replace(/\n+$/, "")}

${entry}
`;
  const rest = lines.slice(start + 1);
  const next = rest.findIndex((line) => /^##\s/.test(line));
  const end = next === -1 ? lines.length : start + 1 + next;
  const head = lines.slice(0, end);
  while (head.length > start + 1 && (head.at(-1) ?? "").trim() === "")
    head.pop();
  return `${[...head, entry, ...lines.slice(end)].join(`
`).replace(/\n+$/, "")}
`;
}

// src/lib/ask.ts
import { join as join4 } from "node:path";
import * as p from "@clack/prompts";

// src/lib/disk.ts
import { chmod, copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
async function exists(path) {
  return stat(path).then((entry) => entry.isFile()).catch(() => false);
}
async function modeOf(path) {
  return stat(path).then((entry) => entry.mode & 511).catch(() => null);
}
async function readText(path) {
  return readFile(path, "utf8");
}
async function readJson(path) {
  return JSON.parse(await readText(path));
}
async function writeText(path, text, mode) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, "utf8");
  if (mode !== undefined)
    await chmod(path, mode);
}
async function setMode(path, mode) {
  await chmod(path, mode);
}
async function copyTo(from, to) {
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
}

// src/lib/paths.ts
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname as dirname2, join } from "node:path";
import { fileURLToPath } from "node:url";
function home() {
  return process.env.HOME ?? homedir();
}
function expandHome(input) {
  if (input === "~")
    return home();
  if (input.startsWith("~/"))
    return join(home(), input.slice(2));
  return input;
}
function contractHome(input) {
  const dir = home();
  return input.startsWith(dir) ? `~${input.slice(dir.length)}` : input;
}
function configDir() {
  return join(home(), ".config", "personal-config");
}
function configFile() {
  return join(configDir(), "config.json");
}
function backupsDir() {
  return join(configDir(), "backups");
}
function claudeDir() {
  return join(home(), ".claude");
}
function claudeRulesDir() {
  return join(claudeDir(), "rules");
}
function claudeSkillsDir() {
  return join(claudeDir(), "skills");
}
function claudeSettingsFile() {
  return join(claudeDir(), "settings.json");
}
function claudeHooksDir() {
  return join(claudeDir(), "hooks", "personal-config");
}
function repoRoot() {
  const start = dirname2(fileURLToPath(import.meta.url));
  let dir = start;
  while (!existsSync(join(dir, "package.json"))) {
    const parent = dirname2(dir);
    if (parent === dir)
      throw new Error(`No package.json above ${start}`);
    dir = parent;
  }
  return dir;
}
function claudeProjectsDir(cwd) {
  return join(claudeDir(), "projects", projectSlug(cwd));
}
function projectSlug(cwd) {
  return cwd.replace(/[^A-Za-z0-9]/g, "-");
}

// src/lib/resume.ts
import { existsSync as existsSync2 } from "node:fs";
import { mkdir as mkdir2, rm } from "node:fs/promises";
import { join as join3 } from "node:path";

// src/lib/date.ts
function today(now = new Date) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// src/lib/version.ts
import { join as join2 } from "node:path";
async function version() {
  const pkg = await readJson(join2(repoRoot(), "package.json"));
  return pkg.version ?? "0.0.0";
}

// src/lib/resume.ts
function checkpointFile() {
  return join3(configDir(), "run.json");
}
async function readCheckpoint() {
  const path = checkpointFile();
  if (!await exists(path))
    return { kind: "none" };
  const checkpoint = parseCheckpoint(await readJson(path).catch(() => null));
  if (checkpoint === null || checkpoint.entries.length === 0)
    return { kind: "none" };
  if (checkpoint.version !== await version()) {
    return { kind: "stale", version: checkpoint.version };
  }
  return { kind: "ready", checkpoint };
}
async function writeCheckpoint(entries) {
  const checkpoint = { version: await version(), date: today(), entries };
  try {
    await mkdir2(configDir(), { recursive: true });
    await writeText(checkpointFile(), `${JSON.stringify(checkpoint, null, 2)}
`);
  } catch {}
}
async function clearCheckpoint() {
  await rm(checkpointFile(), { force: true });
}
function retiresCheckpoint(outcome) {
  return outcome === "written" || outcome === "already-current";
}
function hasCheckpoint() {
  return existsSync2(checkpointFile());
}
function describeCheckpoint(checkpoint) {
  return `${checkpoint.entries.length} answer(s), last saved ${checkpoint.date}`;
}
function answerTape(replay) {
  const kept = [];
  let replaying = replay.length > 0;
  return {
    replayed(id, value) {
      const next = replaying ? replay[kept.length] : undefined;
      if (next !== undefined && next.id === id && (value === undefined || next.value === value)) {
        kept.push(next);
        return next;
      }
      replaying = false;
      return null;
    },
    async record(entry) {
      kept.push(entry);
      await writeCheckpoint(kept);
    },
    async rewind() {
      if (kept.length === 0)
        return;
      kept.pop();
      await writeCheckpoint(kept);
    }
  };
}
function parseCheckpoint(parsed) {
  if (!isRecord(parsed) || !Array.isArray(parsed.entries))
    return null;
  const entries = parsed.entries;
  if (!entries.every(isEntry))
    return null;
  return {
    version: typeof parsed.version === "string" ? parsed.version : "",
    date: typeof parsed.date === "string" ? parsed.date : "",
    entries
  };
}
function isEntry(value) {
  return isRecord(value) && typeof value.id === "string" && isAnswerValue(value.value);
}
function isAnswerValue(value) {
  if (Array.isArray(value))
    return value.every((item) => typeof item === "string");
  return typeof value === "string" || typeof value === "boolean";
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/lib/ask.ts
var READ_MORE = "__read_more__";
var BACK = "__back__";
function defaultsPrompter(scripted = {}) {
  return {
    async ask(question, fallback) {
      return scripted[question.id] ?? fallback;
    },
    async confirm(_message, fallback) {
      return fallback;
    },
    async pick(scans) {
      return scans;
    }
  };
}
function clackPrompter() {
  return {
    async ask(question, fallback, canGoBack = false) {
      return askInteractively(question, fallback, canGoBack);
    },
    async confirm(message, fallback) {
      return unwrap(await p.confirm({ message, initialValue: fallback }));
    },
    async pick(scans) {
      return pickInteractively(scans);
    }
  };
}
async function pickInteractively(scans) {
  const chosen = await p.multiselect({
    message: "Which repos should be set up?",
    options: scans.map((s) => ({
      value: s.path,
      label: s.name,
      hint: [...s.kind === "folder" ? ["folder"] : [], ...s.languages].join(", ")
    })),
    required: false
  });
  if (p.isCancel(chosen))
    cancelRun();
  return scans.filter((s) => chosen.includes(s.path));
}
function checkpointing(inner, replay = []) {
  const tape = answerTape(replay);
  return {
    async ask(question, fallback, canGoBack) {
      const replayed = tape.replayed(question.id);
      if (replayed !== null)
        return replayed.value;
      const value = await inner.ask(question, fallback, canGoBack);
      if (value === BACK) {
        await tape.rewind();
        return BACK;
      }
      await tape.record({ id: question.id, value });
      return value;
    },
    async confirm(message, fallback) {
      return inner.confirm(message, fallback);
    },
    async pick(scans) {
      return inner.pick(scans);
    },
    async mark(id, value) {
      if (tape.replayed(id, value) !== null)
        return;
      await tape.record({ id, value });
    }
  };
}
async function askInteractively(question, fallback, canGoBack) {
  if (question.kind === "text")
    return askText(question, fallback);
  if (question.kind === "confirm") {
    return unwrap(await p.confirm({ message: question.ask, initialValue: fallback === true }));
  }
  return askChoice(question, fallback, canGoBack);
}
async function askText(question, fallback) {
  const answer = unwrap(await p.text({
    message: question.ask,
    placeholder: question.placeholder ?? "",
    initialValue: typeof fallback === "string" ? fallback : ""
  }));
  return answer;
}
async function askChoice(question, fallback, canGoBack) {
  const options = choiceOptions(question, canGoBack);
  for (;; ) {
    const answer = question.kind === "multiselect" ? unwrap(await p.multiselect({ message: question.ask, options, required: false })) : unwrap(await p.select({
      message: question.ask,
      options,
      initialValue: typeof fallback === "string" ? fallback : options[0]?.value
    }));
    if (wantsBack(answer))
      return BACK;
    if (!wantsMore(answer))
      return answer;
    p.note(await readMore(question.readMore), `More on: ${question.ask}`);
  }
}
function choiceOptions(question, canGoBack) {
  return [
    ...(question.options ?? []).map((o) => ({
      value: o.value,
      label: o.recommended ? `${o.label}  (recommended)` : o.label,
      hint: o.example
    })),
    {
      value: READ_MORE,
      label: "Read more…",
      hint: "what each option means, and how to undo it"
    },
    ...canGoBack ? [{ value: BACK, label: "← back", hint: "change the answer before this one" }] : []
  ];
}
function wantsMore(answer) {
  return answer === READ_MORE || Array.isArray(answer) && answer.includes(READ_MORE);
}
function wantsBack(answer) {
  return answer === BACK || Array.isArray(answer) && answer.includes(BACK);
}
async function readMore(id) {
  const path = join4(repoRoot(), "docs", "choices", `${id}.md`);
  if (!await exists(path))
    return `No long form written yet for "${id}".`;
  return (await readText(path)).trim();
}
function unwrap(value) {
  if (p.isCancel(value))
    cancelRun();
  return value;
}
function cancelRun() {
  p.cancel(cancelMessage());
  process.exit(0);
}
function cancelMessage() {
  if (!hasCheckpoint())
    return "Nothing was written.";
  return [
    "Nothing was written. Your answers so far are saved —",
    "run `personal-config setup` again to pick up where you left off."
  ].join(" ");
}
async function confirmWrite(message, force) {
  if (force || process.stdin.isTTY !== true)
    return true;
  return clackPrompter().confirm(message, true);
}

// src/lib/git.ts
import { execFile } from "node:child_process";
import { join as join5, resolve } from "node:path";
import { promisify } from "node:util";
var run = promisify(execFile);
var MAX_OUTPUT = 64 * 1024 * 1024;
async function git(cwd, args) {
  try {
    const { stdout } = await run("git", args, { cwd, maxBuffer: MAX_OUTPUT });
    return stdout.trim();
  } catch {
    return null;
  }
}
async function isGitRepo(dir) {
  return await exists(join5(dir, ".git", "HEAD")) || await exists(join5(dir, ".git"));
}
async function excludeFile(dir) {
  const out = await git(dir, ["rev-parse", "--git-path", "info/exclude"]);
  return out ? resolve(dir, out) : join5(dir, ".git", "info", "exclude");
}
async function remoteUrl(dir) {
  return git(dir, ["remote", "get-url", "origin"]);
}
async function isIgnored(dir, path) {
  try {
    await run("git", ["check-ignore", "-q", "--", path], { cwd: dir, maxBuffer: MAX_OUTPUT });
    return true;
  } catch {
    return false;
  }
}
function ownerFromRemote(url) {
  if (!url)
    return null;
  const match = url.match(/[:/]([^/:]+)\/[^/]+?(?:\.git)?$/);
  return match?.[1] ?? null;
}
async function worktreeCount(dir) {
  const out = await git(dir, ["worktree", "list"]);
  return out ? out.split(`
`).filter(Boolean).length : 0;
}
async function githubLogin() {
  try {
    const { stdout } = await run("gh", ["api", "user", "--jq", ".login"]);
    const out = stdout.trim();
    if (out)
      return out;
  } catch {}
  return git(process.cwd(), ["config", "github.user"]);
}
function ownsRepo(login, owner) {
  if (!login || !owner)
    return false;
  return login.toLowerCase() === owner.toLowerCase();
}
async function currentBranch(dir) {
  return git(dir, ["rev-parse", "--abbrev-ref", "HEAD"]);
}
async function topLevel(dir) {
  return git(dir, ["rev-parse", "--show-toplevel"]);
}
async function lastCommit(dir, paths) {
  const out = await git(dir, ["log", "-1", "--format=%h", "--", ...paths]);
  return out === null || out === "" ? null : out;
}
async function uncommittedUnder(dir, path) {
  const out = await git(dir, ["status", "--porcelain", "--", path]);
  return out === null || out === "" ? [] : out.split(`
`).filter(Boolean);
}
async function trackedReferrers(dir, needle) {
  const out = await git(dir, ["grep", "-n", "-F", "-e", needle]);
  return out === null || out === "" ? [] : out.split(`
`).filter(Boolean);
}
async function diffAgainstHead(dir) {
  return git(dir, ["diff", "HEAD", "-U0", "--relative", "--", "."]);
}
async function gitMove(dir, from, to) {
  return await git(dir, ["mv", from, to]) !== null;
}

// src/lib/repo-config.ts
import { join as join6 } from "node:path";
var DEFAULT_DOC_NAMES = { ledger: "HANDOFF.md", board: "PASSOFF.md" };
async function readDocNames(repoDir) {
  const parsed = await readRepoJson(repoDir);
  if (parsed === null)
    return DEFAULT_DOC_NAMES;
  return {
    ledger: stringAt(parsed, "ledgerFile") ?? DEFAULT_DOC_NAMES.ledger,
    board: stringAt(parsed, "boardFile") ?? DEFAULT_DOC_NAMES.board
  };
}
async function readStandardPath(repoDir) {
  return stringAt(await readRepoJson(repoDir), "standardPath");
}
async function readWorktreePath(repoDir) {
  return stringAt(await readRepoJson(repoDir), "worktreePath");
}
async function readArchiveHome(repoDir) {
  return stringAt(await readRepoJson(repoDir), "archiveHome");
}
async function readTrackMode(repoDir) {
  const value = stringAt(await readRepoJson(repoDir), "trackMode");
  return value === "tracked" || value === "untracked" ? value : null;
}
async function readWorkProfile(repoDir) {
  const value = stringAt(await readRepoJson(repoDir), "workProfile");
  return value === "ledger" || value === "folders" ? value : null;
}
async function readRecordedTrackMode(repoDir) {
  const value = stringAt(await readRepoJson(repoDir), "trackMode");
  return value === "tracked" || value === "untracked" || value === "n/a" ? value : null;
}
async function readRepoJson(repoDir) {
  const path = join6(repoDir, ".personal-config.json");
  if (!await exists(path))
    return null;
  return readJson(path).catch(() => null);
}
function docStem(fileName) {
  return fileName.replace(/\.md$/i, "");
}
function stringAt(parsed, key) {
  if (!isRecord2(parsed))
    return null;
  const value = parsed[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/lib/diff.ts
function diffLines(before, after) {
  const oldLines = before.length === 0 ? [] : before.split(`
`);
  const newLines = after.split(`
`);
  let head = 0;
  while (head < oldLines.length && head < newLines.length && oldLines[head] === newLines[head]) {
    head += 1;
  }
  let tail = 0;
  while (tail < oldLines.length - head && tail < newLines.length - head && oldLines[oldLines.length - 1 - tail] === newLines[newLines.length - 1 - tail]) {
    tail += 1;
  }
  return [
    ...oldLines.slice(head, oldLines.length - tail).map((text2) => ({ kind: "-", text: text2 })),
    ...newLines.slice(head, newLines.length - tail).map((text2) => ({ kind: "+", text: text2 }))
  ];
}
function diffSummary(before, after) {
  if (before.length === 0)
    return `new file, ${countLines(after)} lines`;
  if (before === after)
    return "unchanged";
  const lines = diffLines(before, after);
  const removed = lines.filter((l) => l.kind === "-").length;
  const added = lines.filter((l) => l.kind === "+").length;
  return `+${added} −${removed}`;
}
function countLines(text2) {
  return text2.split(`
`).filter((_, index, all) => index < all.length - 1 || all[index] !== "").length;
}

// src/lib/ui.ts
function say(line = "") {
  console.log(line);
}
function short(path) {
  return contractHome(path);
}
var FOLDER_LIST_MAX = 12;
function targetList(scans, where, max = FOLDER_LIST_MAX) {
  const repos = scans.filter((s) => s.kind === "git");
  const folders = scans.filter((s) => s.kind === "folder");
  const sections = [
    ...repos.length > 0 ? [scanTable("repo", repos)] : [],
    ...folders.length > 0 ? [folderSection(folders, max)] : []
  ];
  return [`
${foundLine(repos.length, folders.length, where)}
`, sections.join(`

`)].join(`
`);
}
function foundLine(repos, folders, where) {
  const counted = [
    ...repos > 0 || folders === 0 ? [`${repos} repo(s)`] : [],
    ...folders > 0 ? [`${folders} folder(s)`] : []
  ];
  return `Found ${counted.join(" and ")} under ${where}:`;
}
function folderSection(folders, max) {
  const shown = folders.slice(0, max);
  const rest = folders.length - shown.length;
  const table = scanTable("folder", shown);
  return rest > 0 ? `${table}
  … and ${rest} more` : table;
}
function scanTable(heading, scans) {
  const rows = scans.map((s) => {
    const langs = s.languages.join("+") || "—";
    const docs = s.existingDocs.length > 0 ? s.existingDocs.join(",") : "—";
    return `  ${s.name.padEnd(22)} ${langs.padEnd(18)} ${(s.packageManager ?? "—").padEnd(6)} ${s.hasCi ? "CI" : "  "}  ${docs}`;
  });
  return [
    `  ${heading.padEnd(22)} ${"languages".padEnd(18)} ${"pm".padEnd(6)}      existing`,
    ...rows
  ].join(`
`);
}
function previewTree(changes) {
  const groups = new Map;
  for (const change of changes) {
    const key = groupOf(change.file.path);
    groups.set(key, [...groups.get(key) ?? [], change]);
  }
  const lines = [];
  for (const [group, items] of groups) {
    lines.push(group);
    for (const item of items) {
      lines.push(`  ${leafOf(item.file.path)}  — ${item.file.label}  [${markOf(item)}]`);
    }
  }
  return lines.join(`
`);
}
function markOf(change) {
  if (change.guard === "no-stamp")
    return "no stamp — left alone";
  if (change.before.length === 0)
    return "new";
  if (change.before === change.after)
    return modeMark(change);
  return change.summary;
}
function modeMark(change) {
  return change.chmod === undefined ? change.summary : `mode → ${change.chmod.toString(8)}`;
}
function groupOf(path) {
  const shortened = short(path);
  const cut = shortened.lastIndexOf("/");
  return cut === -1 ? "." : shortened.slice(0, cut);
}
function leafOf(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}
function renderDiff(change, maxLines = 40) {
  if (change.guard === "no-stamp")
    return `${short(change.file.path)}: no stamp — left alone`;
  if (change.before === change.after)
    return `${short(change.file.path)}: ${unchangedNote(change)}`;
  const lines = diffLines(change.before, change.after);
  const shown = lines.slice(0, maxLines).map((l) => `${l.kind} ${l.text}`);
  const rest = lines.length - shown.length;
  const tail = rest > 0 ? [`… ${rest} more lines`] : [];
  return [`--- ${short(change.file.path)}`, ...shown, ...tail].join(`
`);
}
function unchangedNote(change) {
  if (change.chmod === undefined)
    return "unchanged";
  return `contents unchanged; mode → ${change.chmod.toString(8)}`;
}

// src/lib/backup.ts
import { mkdir as mkdir3, readdir } from "node:fs/promises";
import { join as join7 } from "node:path";
var RESTORED = "restored-at";
function timestampDir(now = new Date) {
  return now.toISOString().replace(/\..+$/, "").replaceAll(":", "-");
}
async function claimDir(stamp) {
  await mkdir3(backupsDir(), { recursive: true });
  for (let n = 0;; n += 1) {
    const dir = join7(backupsDir(), `${stamp}-${String(n).padStart(3, "0")}`);
    try {
      await mkdir3(dir);
      return dir;
    } catch (error) {
      if (!alreadyClaimed(error))
        throw error;
    }
  }
}
function alreadyClaimed(error) {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}
async function backupFiles(paths, stamp = timestampDir()) {
  const dir = await claimDir(stamp);
  const entries = [];
  for (const [index, original] of paths.entries()) {
    if (!await exists(original))
      continue;
    const stored = join7(dir, "files", `${index}-${original.replaceAll("/", "_")}`);
    await copyTo(original, stored);
    entries.push({ original, stored });
  }
  const manifest = { timestamp: stamp, entries };
  await writeText(join7(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}
`);
  return manifest;
}
async function latestBackup() {
  const dirs = await readdir(backupsDir()).catch(() => []);
  const newest = dirs.sort().at(-1);
  if (!newest)
    return null;
  const dir = join7(backupsDir(), newest);
  const path = join7(dir, "manifest.json");
  if (!await exists(path))
    return null;
  return {
    dir,
    manifest: asManifest(await readJson(path), path),
    restoredAt: await restoredAt(dir)
  };
}
function asManifest(parsed, path) {
  if (!isRecord3(parsed))
    throw new Error(`${path} is not a backup manifest`);
  if (typeof parsed.timestamp !== "string") {
    throw new Error(`${path}: "timestamp" is not a string`);
  }
  if (!Array.isArray(parsed.entries)) {
    throw new Error(`${path}: "entries" is not a list`);
  }
  return { timestamp: parsed.timestamp, entries: parsed.entries.map((e) => asEntry(e, path)) };
}
function asEntry(value, path) {
  if (!isRecord3(value))
    throw new Error(entryProblem(path));
  const { original, stored } = value;
  if (typeof original !== "string" || typeof stored !== "string") {
    throw new Error(entryProblem(path));
  }
  return { original, stored };
}
function entryProblem(path) {
  return `${path}: "entries" holds something that is not a backed-up file`;
}
function isRecord3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
async function restoredAt(dir) {
  const path = join7(dir, RESTORED);
  if (!await exists(path))
    return null;
  const stamp = (await readText(path)).trim();
  return stamp === "" ? "an earlier run" : stamp;
}
async function restore(backup, now = new Date) {
  const restored = [];
  for (const entry of backup.manifest.entries) {
    if (!await exists(entry.stored))
      continue;
    await copyTo(entry.stored, entry.original);
    restored.push(entry.original);
  }
  await writeText(join7(backup.dir, RESTORED), `${now.toISOString()}
`);
  return restored;
}

// src/lib/stamp.ts
var ADAPTED_MARKER = " · adapted";
var STYLES = {
  md: { open: "<!--", close: "-->" },
  json: { open: "//", close: "" },
  ts: { open: "//", close: "" },
  sh: { open: "#", close: "" },
  yml: { open: "#", close: "" }
};
function stampLine(parts, extension = "md") {
  const style = STYLES[extension] ?? STYLES.md;
  const body = `personal-config v${parts.version} · ${parts.date} · config ${parts.configHash} · standard v${parts.standardVersion}${parts.adapted ? ADAPTED_MARKER : ""}`;
  if (!style)
    return body;
  return style.close ? `${style.open} ${body} ${style.close}` : `${style.open} ${body}`;
}
function withStamp(contents, parts, extension = "md") {
  return stampAfterShebang(contents, stampLine(parts, extension));
}
function stampAfterShebang(contents, stamp) {
  if (!contents.startsWith("#!"))
    return `${stamp}
${contents}`;
  const end = contents.indexOf(`
`);
  if (end === -1)
    return `${contents}
${stamp}
`;
  return `${contents.slice(0, end + 1)}${stamp}
${contents.slice(end + 1)}`;
}
var STAMP_PATTERN = /personal-config v(\S+) · (\d{4}-\d{2}-\d{2}) · config ([0-9a-f]{8}) · standard v(\S+?)( · adapted)?\s*(?:-->)?$/m;
function stampIndex(lines) {
  const first = lines[0]?.trimEnd() ?? "";
  if (first.startsWith("#!"))
    return 1;
  if (first !== "---")
    return 0;
  const close = lines.findIndex((line, i) => i > 0 && line.trimEnd() === "---");
  if (close === -1)
    return null;
  const after = lines.findIndex((line, i) => i > close && line.trim() !== "");
  return after === -1 ? null : after;
}
function findStamp(contents) {
  const lines = contents.split(`
`);
  const index = stampIndex(lines);
  if (index === null)
    return null;
  const match = lines[index]?.match(STAMP_PATTERN);
  if (!match)
    return null;
  const [, version2, date, configHash, standardVersion, marker] = match;
  if (!version2 || !date || !configHash || !standardVersion)
    return null;
  return {
    index,
    parts: { version: version2, date, configHash, standardVersion, adapted: marker !== undefined }
  };
}
function readStamp(contents) {
  return findStamp(contents)?.parts ?? null;
}
function replaceLine(text2, index, change) {
  const lines = text2.split(`
`);
  const line = lines[index];
  if (line === undefined)
    return text2;
  lines[index] = change(line);
  return lines.join(`
`);
}
function isOurs(contents) {
  return readStamp(contents) !== null;
}
function markAdapted(text2, line) {
  const stamp = findStamp(text2);
  if (stamp === null)
    return stampAfterShebang(text2, line);
  if (stamp.parts.adapted)
    return text2;
  return replaceLine(text2, stamp.index, (found) => found.replace(STAMP_PATTERN, (whole) => whole.replace(/(\s*(?:-->)?)$/, `${ADAPTED_MARKER}$1`)));
}
function blankStampDate(text2) {
  const index = stampIndex(text2.split(`
`));
  if (index === null)
    return text2;
  return replaceLine(text2, index, (line) => line.replace(/(personal-config v\S+ · )\d{4}-\d{2}-\d{2}( · config )/, "$1····-··-··$2"));
}
function sameButForStampDate(before, after) {
  if (before.length === 0)
    return false;
  return blankStampDate(before) === blankStampDate(after);
}

// src/lib/write-plan.ts
async function resolvePlan(files) {
  return Promise.all(files.map(resolveOne));
}
async function resolveOne(file) {
  const before = await exists(file.path) ? await readText(file.path) : "";
  const guard = stampGuard(file, before);
  const rendered = guard === "none" ? applyStrategy(file, before) : before;
  const after = sameButForStampDate(before, rendered) ? before : rendered;
  const chmod2 = guard === "none" ? await pendingMode(file) : undefined;
  return { file, before, after, guard, chmod: chmod2, summary: diffSummary(before, after) };
}
async function pendingMode(file) {
  if (file.mode === undefined)
    return;
  return await modeOf(file.path) === file.mode ? undefined : file.mode;
}
function willWrite(change) {
  return change.before !== change.after || change.chmod !== undefined;
}
function stampGuard(file, before) {
  if (before.length === 0)
    return "none";
  if (file.strategy === "mark-adapted")
    return "none";
  if (!isOurs(file.contents))
    return "none";
  const stamp = readStamp(before);
  if (stamp === null)
    return "no-stamp";
  return stamp.adapted ? "adapted" : "none";
}
function applyStrategy(file, before) {
  if (file.strategy === "overwrite")
    return file.contents;
  if (file.strategy === "append-lines")
    return appendMissingLines(before, file.contents);
  if (file.strategy === "mark-adapted")
    return markAdapted(before, adaptedLine(file));
  return mergeJson(before, file.contents);
}
function adaptedLine(file) {
  if (readStamp(file.contents)?.adapted !== true) {
    throw new Error(`mark-adapted needs an adapted stamp line as its contents: ${file.path}`);
  }
  return file.contents;
}
function appendMissingLines(before, additions) {
  const existing = new Set(before.split(`
`).map((l) => l.trim()));
  const missing = additions.split(`
`).filter((l) => l.trim() && !existing.has(l.trim()));
  if (missing.length === 0)
    return before;
  const base = before.length === 0 || before.endsWith(`
`) ? before : `${before}
`;
  return `${base}${missing.join(`
`)}
`;
}
function mergeJson(before, additions) {
  const base = before.trim() ? JSON.parse(before) : {};
  const merged = mergeValues(base, JSON.parse(additions));
  return `${JSON.stringify(merged, null, 2)}
`;
}
function mergeValues(base, next) {
  if (Array.isArray(base) && Array.isArray(next))
    return mergeArrays(base, next);
  if (isRecord4(base) && isRecord4(next)) {
    const out = { ...base };
    for (const [key, value] of Object.entries(next)) {
      out[key] = key in base ? mergeValues(base[key], value) : value;
    }
    return out;
  }
  return next;
}
function mergeArrays(base, next) {
  const seen = new Set(base.map((item) => JSON.stringify(item)));
  return [...base, ...next.filter((item) => !seen.has(JSON.stringify(item)))];
}
function isRecord4(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
async function commitPlan(changes) {
  const real = changes.filter(willWrite);
  const overwritten = await onDiskNow(real.filter((c) => c.before !== c.after));
  const manifest = overwritten.length > 0 ? await backupFiles(overwritten) : null;
  for (const change of real) {
    if (change.before !== change.after) {
      await writeText(change.file.path, change.after, change.chmod);
    } else if (change.chmod !== undefined) {
      await setMode(change.file.path, change.chmod);
    }
  }
  return {
    written: real.map((c) => c.file.path),
    skipped: changes.filter((c) => !willWrite(c)).map((c) => c.file.path),
    manifest
  };
}
async function onDiskNow(real) {
  const checked = await Promise.all(real.map(async (c) => await exists(c.file.path) ? c.file.path : null));
  return checked.filter((path) => path !== null);
}

// src/render/context.ts
function answer(ctx, key, fallback = "") {
  const value = ctx.answers[key];
  return typeof value === "string" ? value : fallback;
}
function planned(ctx, path, label, contents, options = {}) {
  const { extension = "md", strategy = "overwrite", stamp = true } = options;
  return {
    path,
    label,
    strategy,
    mode: modeFor(extension),
    contents: stamp ? withStamp(contents, ctx.stamp, extension) : contents
  };
}
function modeFor(extension) {
  return extension === "sh" ? 493 : undefined;
}
function edit(path, label, contents) {
  return { path, label, contents, strategy: "overwrite" };
}
function trackOf(ctx) {
  return {
    workKind: answer(ctx, "workKind", "code") === "non-code" ? "non-code" : "code",
    weight: answer(ctx, "configWeight", "full") === "light" ? "light" : "full",
    usesGit: answer(ctx, "usesGit", "yes") !== "no"
  };
}
function isShortTrack(ctx) {
  const track = trackOf(ctx);
  return track.workKind === "non-code" || track.weight === "light";
}
function hasBoard(ctx) {
  return trackOf(ctx).weight === "full";
}
function workRecordShape(ctx) {
  if (isShortTrack(ctx))
    return "ledger";
  return ctx.repo?.workProfile ?? "ledger";
}
function ledgerFile(ctx) {
  return ctx.repo?.scan.ledgerDoc ?? DEFAULT_DOC_NAMES.ledger;
}
function boardFile(ctx) {
  return ctx.repo?.scan.boardDoc ?? DEFAULT_DOC_NAMES.board;
}
function routerFile(ctx) {
  return ctx.repo?.trackMode === "untracked" ? "CLAUDE.local.md" : "CLAUDE.md";
}
function standardPath(ctx) {
  return ctx.repo?.trackMode === "untracked" ? "AGENT-PRACTICES.local.md" : "docs/AGENT-PRACTICES.md";
}
function conventionsPath(ctx, language) {
  return ctx.repo?.scan.conventionsDocs[language] ?? `docs/conventions-${language}.md`;
}
function projectName(ctx) {
  return ctx.repo?.scan.name ?? "your project";
}
function proofLine(ctx) {
  return answer(ctx, "proofLine").trim();
}
function offLimits(ctx) {
  return answer(ctx, "offLimits").trim();
}
function targetAnswers(answers, repo) {
  return repo ? { ...answers, proofLine: repo.proofLine, offLimits: repo.offLimits } : answers;
}
function commitRuleLine(answers) {
  const policy = answers.commitPolicy;
  if (policy === "agent-commits")
    return "Commit in small slices; never `git push`, never `git add -A`.";
  if (policy === "no-rule")
    return "";
  return "Never run `git commit`, `git push`, `git add -A` or `git add .` — print the two blocks instead.";
}

// src/commands/archive.ts
var USAGE = [
  "usage: personal-config archive <slug> [--move]",
  "",
  "<slug> is a folder under `docs/incomplete/` (Profile P) or any path in the repo (Profile L).",
  "Run it before the move to see what the move costs; run it again after, to write the two index",
  "lines. `--move` does both halves in one go."
].join(`
`);
var IN_PROGRESS = join8("docs", "incomplete");
async function runArchive(cli) {
  const slug = cli.paths[0];
  if (slug === undefined)
    return refuse(USAGE);
  const root = process.cwd();
  if (!await isGitRepo(root))
    return refuse(`${short(root)} is not a git repository.`);
  const plan = await prepare(root, slug);
  if (typeof plan === "string")
    return refuse(plan);
  report(plan);
  return plan.moved ? afterMove(cli, root, plan) : beforeMove(cli, root, plan);
}
async function prepare(root, slug) {
  const home2 = await readArchiveHome(root);
  if (home2 === null)
    return noArchiveHome(root);
  const archiveHome = expandHome(home2);
  if (!await exists2(join8(archiveHome, "INDEX.md")))
    return noIndex(archiveHome);
  const inRepo = await findInRepo(root, slug);
  const name = inRepo?.name ?? slug;
  const destination = join8(archiveHome, name);
  const inArchive = await exists2(destination);
  if (inRepo && inArchive)
    return bothPlaces(inRepo.path, destination);
  if (!inRepo && !inArchive)
    return notFound(root, slug, archiveHome);
  const target = inRepo ?? await archived(destination, name);
  return {
    target,
    destination,
    archiveHome,
    moved: inRepo === null,
    ...await facts(root, target)
  };
}
async function facts(root, target) {
  const referrers = await trackedReferrers(root, target.name);
  const own = target.repoPaths.map((path) => `${path}/`);
  const outside = referrers.filter((line) => !own.some((path) => line.startsWith(path)));
  return {
    runtimeReferrers: outside.filter((line) => !isProse(line)),
    proseReferrers: outside.filter(isProse),
    uncommitted: await uncommitted(root, target),
    commit: await lastCommit(root, target.repoPaths),
    topic: await topicOf(target)
  };
}
async function uncommitted(root, target) {
  const first = target.repoPaths[0];
  return first === undefined ? [] : uncommittedUnder(root, first);
}
function isProse(line) {
  return /\.(md|mdx|txt)$/i.test(line.split(":")[0] ?? "");
}
async function findInRepo(root, slug) {
  for (const candidate of [join8(root, IN_PROGRESS, slug), join8(root, slug)]) {
    const info = await stat2(candidate).catch(() => null);
    if (!info)
      continue;
    return {
      path: candidate,
      name: basenameOf(candidate),
      repoPaths: [relative(root, candidate)],
      files: info.isDirectory() ? await filesUnder(candidate) : []
    };
  }
  return null;
}
async function archived(destination, name) {
  const info = await stat2(destination).catch(() => null);
  return {
    path: destination,
    name,
    repoPaths: [join8(IN_PROGRESS, name), name],
    files: info?.isDirectory() === true ? await filesUnder(destination) : []
  };
}
function basenameOf(path) {
  return path.slice(path.lastIndexOf("/") + 1);
}
async function filesUnder(dir, prefix = "") {
  const entries = await readdir2(dir, { withFileTypes: true }).catch(() => []);
  const found = [];
  for (const entry of entries) {
    const at = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory())
      found.push(...await filesUnder(join8(dir, entry.name), at));
    else
      found.push(at);
  }
  return found;
}
async function topicOf(target) {
  const candidates = target.files.length === 0 ? [target.path] : ["SCOPE.md", "README.md", "DESIGN.md"].map((name) => join8(target.path, name));
  for (const path of candidates) {
    const text2 = await readText(path).catch(() => "");
    const heading = text2.split(`
`).find((line) => line.startsWith("# "));
    if (heading)
      return heading.slice(2).trim();
  }
  return target.name;
}
function report(plan) {
  const { target, destination, commit, topic, moved } = plan;
  const size = target.files.length === 0 ? "one file" : `${target.files.length} file(s)`;
  const where = moved ? `already at ${short(destination)}` : `${short(target.path)} → ${short(destination)}`;
  say(`archive: ${where}`);
  say(`  ${size} · last commit ${commit ? `\`${commit}\`` : "(none — never committed)"} · "${topic}"
`);
  say(referrerReport(plan));
  if (!moved)
    say(commitStateReport(plan));
}
function referrerReport(plan) {
  const { runtimeReferrers, proseReferrers, target, moved } = plan;
  if (runtimeReferrers.length === 0 && proseReferrers.length === 0) {
    return `Referrers (step 1): no tracked file outside it cites \`${target.name}\`.`;
  }
  const prose = moved ? "prose citations — each of these now points at nothing:" : "prose citations — these do not block, but they will point at nothing:";
  return [
    `Referrers (step 1) — tracked files citing \`${target.name}\`:`,
    ...section("read at runtime — these block the move:", runtimeReferrers),
    ...section(prose, proseReferrers)
  ].join(`
`);
}
function section(title, lines) {
  return lines.length === 0 ? [] : [`  ${title}`, ...lines.map((line) => `    ${line}`)];
}
function commitStateReport(plan) {
  if (plan.uncommitted.length === 0) {
    return `
Commit state (step 2): clean — the repo already records how it ended.`;
  }
  return [
    `
Commit state (step 2): ${plan.uncommitted.length} uncommitted change(s) under it.`,
    "The repo must record its final state before the move. Run:",
    "",
    "```bash",
    `git add ${plan.target.repoPaths[0]}`,
    "```",
    "",
    "```bash",
    `git commit ${plan.target.repoPaths[0]} -m "close out ${plan.target.name}"`,
    "```"
  ].join(`
`);
}
async function beforeMove(cli, root, plan) {
  say(`
${moveBlock(root, plan, await sameRepo(root, plan))}`);
  const changes = await resolvePlan(await indexEdits(root, plan));
  say(`
${preview(changes)}`);
  if (!cli.move) {
    say(`
Neither line is written yet. An index line pointing at a folder that is not there is`);
    say("worse than no line at all (§8.2), so they are written on the run *after* the move —");
    say(`\`personal-config archive ${plan.target.name}\` again, once it has landed.`);
    return 0;
  }
  const blocker = blocking(plan);
  if (blocker !== null)
    return refuse(blocker);
  if (cli.dryRun)
    return note2(`
--dry-run: nothing was moved, nothing was written.`);
  if (!await confirmWrite("Move it and write both index lines?", cli.force)) {
    return note2("Nothing was moved.");
  }
  const failure = await move(root, plan);
  if (failure !== null)
    return refuse(failure);
  return write(root, plan, await resolvePlan(await indexEdits(root, plan)));
}
async function afterMove(cli, root, plan) {
  const changes = await resolvePlan(await indexEdits(root, plan));
  say(`
${preview(changes)}`);
  if (cli.dryRun)
    return note2(`
--dry-run: nothing was written.`);
  if (changes.every((change) => change.before === change.after)) {
    return note2(`
Both index lines already say this. Nothing to write.`);
  }
  if (!await confirmWrite("Write the index lines?", cli.force)) {
    return note2("Nothing was written.");
  }
  return write(root, plan, changes);
}
async function write(root, plan, changes) {
  const result = await commitPlan(changes);
  say(`
Wrote ${result.written.length} file(s).`);
  if (result.manifest)
    say("`personal-config undo` restores the index files as they were.");
  say(await reminders(root, plan));
  return 0;
}
function preview(changes) {
  const real = changes.filter((change) => change.before !== change.after);
  if (real.length === 0)
    return "Index lines: both already say this.";
  return [
    "The index lines (steps 4 and 5):",
    "",
    previewTree(real),
    ...real.map((change) => `
${renderDiff(change)}`)
  ].join(`
`);
}
function blocking(plan) {
  if (plan.uncommitted.length > 0) {
    return `
--move refused: commit it first (step 2 above). Moving now loses how it ended.`;
  }
  if (plan.runtimeReferrers.length > 0) {
    return `
--move refused: something reads that path at runtime (step 1 above). Repoint it first.`;
  }
  return null;
}
async function move(root, plan) {
  await mkdir4(dirname3(plan.destination), { recursive: true });
  const from = plan.target.repoPaths[0] ?? plan.target.path;
  const moved = await sameRepo(root, plan) ? await gitMove(root, from, relative(root, plan.destination)) : await rename(plan.target.path, plan.destination).then(() => true, () => false);
  if (!moved)
    return `the move failed — ${short(plan.target.path)} is still where it was.`;
  const missing = await missingAfterMove(plan);
  if (missing.length > 0) {
    return `moved, but ${missing.length} file(s) did not arrive: ${missing.slice(0, 5).join(", ")}. Nothing was indexed.`;
  }
  say(`
Moved, and verified ${plan.target.files.length || 1} file(s) arrived (step 3).`);
  return null;
}
async function missingAfterMove(plan) {
  if (plan.target.files.length === 0) {
    return await exists2(plan.destination) ? [] : [plan.target.name];
  }
  const arrived = new Set(await filesUnder(plan.destination));
  return plan.target.files.filter((file) => !arrived.has(file));
}
async function sameRepo(root, plan) {
  const here = await topLevel(root);
  const there = await topLevel(await nearestExisting(plan.archiveHome));
  return here !== null && here === there;
}
async function nearestExisting(dir) {
  let current = dir;
  while (!await exists2(current) && dirname3(current) !== current)
    current = dirname3(current);
  return current;
}
function moveBlock(root, plan, same) {
  const from = plan.target.repoPaths[0] ?? plan.target.path;
  const line = same ? `git mv ${from} ${relative(root, plan.destination)}` : `mv ${short(plan.target.path)} ${short(plan.destination)}`;
  return [
    "The move (step 3) — run it yourself, or re-run this with --move:",
    "",
    "```bash",
    line,
    "```"
  ].join(`
`);
}
async function reminders(root, plan) {
  const top = await topLevel(await nearestExisting(plan.archiveHome));
  const commit = top === null || top === await topLevel(root) ? [] : [
    "",
    "The archive is its own repository, so its commit is rooted there and names its own files:",
    "",
    "```bash",
    `git -C ${short(top)} add ${relative(top, plan.destination)}`,
    "```",
    "",
    "```bash",
    `git -C ${short(top)} commit ${relative(top, plan.destination)} -m "archive ${plan.target.name}"`,
    "```"
  ];
  return [
    ...commit,
    "",
    "Left to you, and neither is a formality:",
    `  step 6 — anything ${plan.target.name} leaves behind that still governs the code moves to`,
    '           "Standing rules that outlived their doc" (§8.3). A rule nobody can find is a',
    "           rule nobody follows.",
    "  step 7 — the memory entry (Part 10) gets its final state and what was left owed.",
    "",
    `\`personal-config doctor ${short(plan.archiveHome)}\` checks the index both ways.`
  ].join(`
`);
}
async function indexEdits(root, plan) {
  return [...await archiveIndexEdit(plan), ...await docsIndexEdit(root, plan)];
}
async function archiveIndexEdit(plan) {
  const path = join8(plan.archiveHome, "INDEX.md");
  const text2 = await readText(path);
  const slash = plan.target.files.length === 0 ? "" : "/";
  if (text2.includes(`**${plan.target.name}${slash}**`))
    return [];
  const entry = `- **${plan.target.name}${slash}** ✅ — ${plan.topic}. Closed ${today()}, last commit \`${plan.commit ?? "none"}\`.`;
  return [edit(path, "archive index — one line for this entry", withIndexLine(text2, entry))];
}
async function docsIndexEdit(root, plan) {
  const path = join8(root, "docs", "README.md");
  const text2 = await readText(path).catch(() => null);
  if (text2 === null)
    return [];
  const updated = withDocsNote(text2, plan);
  if (updated === null)
    return [];
  return [edit(path, "docs index — the line for this doc, marked archived", updated)];
}
var ENTRY = /^\s*([-*]|\|)/;
function withDocsNote(text2, plan) {
  let changed = false;
  const lines = text2.split(`
`).map((line) => {
    if (!ENTRY.test(line) || !line.includes(plan.target.name) || /archived/i.test(line)) {
      return line;
    }
    changed = true;
    return `${line.trimEnd()} **Archived ${today()}** → \`${short(plan.destination)}\`.`;
  });
  return changed ? lines.join(`
`) : null;
}
async function exists2(path) {
  return stat2(path).then(() => true, () => false);
}
function notFound(root, slug, archiveHome) {
  return [
    `Nothing to archive under \`${slug}\`. Looked for:`,
    `  ${join8(IN_PROGRESS, slug)}/ — a Profile P effort's folder`,
    `  ${slug} — any path in ${short(root)}`,
    `  ${short(join8(archiveHome, slug))} — already moved, waiting to be indexed`
  ].join(`
`);
}
function bothPlaces(inRepo, destination) {
  return [
    "It is in both places:",
    `  ${short(inRepo)}`,
    `  ${short(destination)}`,
    "Compare them and delete one before archiving; nothing here can tell which is the real one."
  ].join(`
`);
}
function noArchiveHome(root) {
  return [
    `${short(root)} has no archive home recorded in .personal-config.json.`,
    "Run `personal-config setup` in this repo and answer the archive question first —",
    "without it there is nowhere to move this to."
  ].join(`
`);
}
function noIndex(archiveHome) {
  return [
    `${short(archiveHome)} has no INDEX.md.`,
    "An archive without its index is a folder of orphans (§8.2), and seeding one is",
    "`personal-config setup`'s job, not this command's."
  ].join(`
`);
}
function note2(message) {
  say(message);
  return 0;
}
function refuse(message) {
  say(message);
  return 1;
}

// src/lib/catalog.ts
import { createHash } from "node:crypto";
import { join as join9 } from "node:path";

// src/lib/when.ts
function matchesWhen(spec, answers) {
  if (spec === undefined)
    return true;
  if ("never" in spec)
    return false;
  if ("all" in spec)
    return spec.all.every((inner) => matchesWhen(inner, answers));
  const actual = answers[spec.key];
  return "is" in spec ? sameAnswer(actual, spec.is) : !sameAnswer(actual, spec.isNot);
}
function sameAnswer(actual, expected) {
  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual))
      return false;
    return actual.length === expected.length && actual.every((v, i) => v === expected[i]);
  }
  return actual === expected;
}

// src/questions/model-ids.ts
var POPULAR_MODEL_IDS = [
  { value: "opus", label: "claude-opus (latest)", example: "Opus family, any version" },
  {
    value: "sonnet",
    label: "claude-sonnet (latest)",
    example: "Sonnet family, any version"
  },
  {
    value: "haiku",
    label: "claude-haiku (latest)",
    example: "Haiku family, any version"
  },
  { value: "fable", label: "claude-fable (latest)", example: "Fable family, any version" },
  {
    value: "claude-opus-5-5",
    label: "claude-opus-5-5 (specific)",
    example: "Exactly Opus 5.5, nothing else"
  },
  {
    value: "claude-sonnet-5",
    label: "claude-sonnet-5 (specific)",
    example: "Exactly Sonnet 5, nothing else"
  },
  {
    value: "claude-haiku-4-5",
    label: "claude-haiku-4-5 (specific)",
    example: "Exactly Haiku 4.5, nothing else"
  },
  {
    value: "claude-fable-5-1",
    label: "claude-fable-5-1 (specific)",
    example: "Exactly Fable 5.1, nothing else"
  }
];

// src/questions/discover.ts
var firstPopularModelWithRecommended = {
  value: "opus",
  label: "claude-opus (latest)",
  example: "Opus family, any version",
  recommended: true
};
var CAPPED = {
  all: [
    { key: "workKind", is: "code" },
    { key: "tierCeiling", isNot: "deep" }
  ]
};
var DISCOVER_QUESTIONS = [
  {
    id: "projects-dir",
    phase: "discover",
    kind: "text",
    ask: "Which directory holds the projects you want to set up?",
    configKey: "projectsDir",
    readMore: "projects-dir",
    placeholder: "."
  },
  {
    id: "work-profile",
    phase: "discover",
    kind: "select",
    ask: "How does work arrive in this project?",
    configKey: "workProfile",
    readMore: "work-profile",
    options: [
      {
        value: "ledger",
        label: "A stream of mostly independent items",
        example: "Fix a flaky test, add an endpoint, bump a dep — a ledger and a board",
        recommended: true
      },
      {
        value: "folders",
        label: "A few big efforts that each span many sessions",
        example: 'One "checkout rewrite" folder: scope → design → plan → runtime pass',
        recommended: false
      }
    ],
    when: {
      all: [
        { key: "workKind", is: "code" },
        { key: "configWeight", is: "full" }
      ]
    }
  },
  {
    id: "track-mode",
    phase: "discover",
    kind: "select",
    ask: "Should these files be committed to this repo, or kept private to you?",
    configKey: "trackMode",
    readMore: "track-mode",
    options: [
      {
        value: "tracked",
        label: "Committed — it is my repo",
        example: "`HANDOFF.md` is in `git ls-files`; a teammate or a future you reads it",
        recommended: true
      },
      {
        value: "untracked",
        label: "Private — git-ignored",
        example: "A course fork or a client repo: files land in `.git/info/exclude`",
        recommended: false
      }
    ],
    when: {
      all: [
        { key: "owned", isNot: false },
        { key: "usesGit", is: "yes" }
      ]
    }
  },
  {
    id: "proof-line",
    phase: "discover",
    kind: "text",
    ask: "What proves work here is sound?",
    configKey: "proofLine",
    readMore: "proof-line",
    placeholder: "e.g. the reconciliation balances to the bank statement, or someone who didn’t write it read it"
  },
  {
    id: "off-limits",
    phase: "discover",
    kind: "text",
    ask: "Is there anything here the agent must not read or copy?",
    configKey: "offLimits",
    readMore: "off-limits",
    placeholder: "e.g. a folder of other people’s records — or leave this empty",
    when: { key: "workKind", is: "non-code" }
  },
  {
    id: "archive-home",
    phase: "discover",
    kind: "text",
    ask: "Where should closed work go when it leaves the repo?",
    configKey: "archiveHome",
    readMore: "archive-home",
    placeholder: "~/archive/<repo>/, or docs/archive/ to keep closed work in-tree",
    when: {
      all: [
        { key: "workKind", is: "code" },
        { key: "configWeight", is: "full" }
      ]
    }
  },
  {
    id: "mode",
    phase: "discover",
    kind: "select",
    ask: "Does one person decide things here, or several?",
    configKey: "mode",
    readMore: "mode",
    options: [
      {
        value: "solo",
        label: "One person — me",
        example: "Questions go to you in chat; the standard ships without its teams part",
        recommended: true
      },
      {
        value: "team",
        label: "Several people merge code here",
        example: "Questions go to a named decider on a tracker item, not into a doc",
        recommended: false
      }
    ],
    when: {
      all: [
        { key: "workKind", is: "code" },
        { key: "configWeight", is: "full" }
      ]
    }
  },
  {
    id: "tracker",
    phase: "discover",
    kind: "text",
    ask: "Where are items and decisions visible to the team?",
    configKey: "tracker",
    readMore: "tracker",
    placeholder: "e.g. GitHub Issues on this repo",
    when: { key: "mode", is: "team" }
  },
  {
    id: "tier-ceiling",
    phase: "discover",
    kind: "select",
    ask: "What is the most expensive model this repo may run?",
    configKey: "tierCeiling",
    readMore: "tier-ceiling",
    when: { key: "workKind", is: "code" },
    options: [
      {
        value: "deep",
        label: "Deep — no ceiling (the default)",
        example: "This repo can run any model you configure",
        recommended: true
      },
      {
        value: "default",
        label: "Default",
        example: "Deep-tier work is delegated to subagents; expensive operations are capped",
        recommended: false
      },
      {
        value: "mechanical",
        label: "Mechanical",
        example: "Only sweeps, renames, and mechanical work — no reasoning tiers",
        recommended: false
      }
    ]
  },
  {
    id: "model-ids-default",
    phase: "discover",
    kind: "select",
    ask: "Which model ID represents your Default tier (for repos with a Default ceiling)?",
    configKey: "modelIds.default",
    readMore: "model-ids",
    options: [
      firstPopularModelWithRecommended,
      ...POPULAR_MODEL_IDS.slice(1),
      {
        value: "other",
        label: "Other — type it",
        example: "A model ID not listed above"
      }
    ],
    when: CAPPED
  },
  {
    id: "model-ids-default-other",
    phase: "discover",
    kind: "text",
    ask: "Which Default model ID?",
    configKey: "modelIds.default",
    readMore: "model-ids",
    placeholder: "e.g. claude-opus-5-5",
    when: {
      all: [...CAPPED.all, { key: "modelIds.default", is: "other" }]
    }
  },
  {
    id: "model-ids-mechanical",
    phase: "discover",
    kind: "select",
    ask: "Which model ID represents your Mechanical tier (for repos with a ceiling)?",
    configKey: "modelIds.mechanical",
    readMore: "model-ids",
    options: [
      firstPopularModelWithRecommended,
      ...POPULAR_MODEL_IDS.slice(1),
      {
        value: "other",
        label: "Other — type it",
        example: "A model ID not listed above"
      }
    ],
    when: CAPPED
  },
  {
    id: "model-ids-mechanical-other",
    phase: "discover",
    kind: "text",
    ask: "Which Mechanical model ID?",
    configKey: "modelIds.mechanical",
    readMore: "model-ids",
    placeholder: "e.g. claude-sonnet-5",
    when: {
      all: [...CAPPED.all, { key: "modelIds.mechanical", is: "other" }]
    }
  },
  {
    id: "model-ids-light",
    phase: "discover",
    kind: "select",
    ask: "Which model ID represents your Light tier (for repos with a ceiling)?",
    configKey: "modelIds.light",
    readMore: "model-ids",
    options: [
      firstPopularModelWithRecommended,
      ...POPULAR_MODEL_IDS.slice(1),
      {
        value: "other",
        label: "Other — type it",
        example: "A model ID not listed above"
      }
    ],
    when: {
      all: [...CAPPED.all, { key: "modelLightEnabled", is: "yes" }]
    }
  },
  {
    id: "model-ids-light-other",
    phase: "discover",
    kind: "text",
    ask: "Which Light model ID?",
    configKey: "modelIds.light",
    readMore: "model-ids",
    placeholder: "e.g. claude-haiku-4-5",
    when: {
      all: [
        ...CAPPED.all,
        { key: "modelLightEnabled", is: "yes" },
        { key: "modelIds.light", is: "other" }
      ]
    }
  }
];

// src/questions/practices-code.ts
var SEEDED = "review";
function pairFor(pairs, language) {
  return pairs[language] ?? pairs.generic ?? null;
}
function question(id, ask, options, configKey = `practices.${id}`) {
  return {
    id,
    phase: "practices",
    kind: "select",
    ask,
    options,
    readMore: id,
    configKey,
    when: { key: "workKind", is: "code" }
  };
}
function ruleFrom(spec, pairs, language) {
  const pair = pairFor(pairs, language);
  return pair ? { ...spec, ...pair } : null;
}
var COMMENTS = {
  target: "conventions",
  languages: [],
  question: question("comments", "What may a code comment say?", [
    {
      value: "why-only",
      label: "Why only — never what",
      example: "`// the API 404s on an empty cart, so we send one dummy line`",
      recommended: true
    },
    {
      value: "why-plus-headers",
      label: "Why, plus section headers in long files",
      example: "Same rule, but `// ---- validation ----` banners are allowed"
    },
    {
      value: "none",
      label: "No rule",
      example: "Nothing is written; the agent comments as it sees fit"
    }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    return ruleFrom({
      id: "C1",
      title: "Comments say why, never what",
      body: "A comment restating the line below it is banned — rename or extract instead. A comment recording *why* is required where the reason is not derivable from the code. **Never bulk-delete comments**, and never strip one in a protected category: product or design rationale, a lint-suppression justification, an external-constraint workaround, or documentation on a public export." + (value === "why-plus-headers" ? " Section banners in a long file are exempt." : ""),
      enforcement: SEEDED,
      provenance: "OURS"
    }, {
      generic: {
        correct: "// the vendor API 404s on an empty cart, so we send one dummy line",
        incorrect: "// loop over the items"
      },
      go: {
        correct: "// Retry once: the upstream returns 502 on its first call after a deploy.",
        incorrect: "// increment i"
      },
      python: {
        correct: "# tz is naive here because the vendor sends local time with no offset",
        incorrect: "# set the value to 3"
      }
    }, language);
  }
};
var FUNCTION_LENGTH = {
  target: "conventions",
  languages: [],
  question: question("function-length", "How long may a function get before it is split?", [
    {
      value: "house-6-15",
      label: "Roughly 6–15 lines; extract helpers",
      example: "A 30-line handler becomes a 10-line handler plus two named helpers",
      recommended: true
    },
    {
      value: "typical-20-ceiling-40",
      label: "5–20 typical, 40 a hard ceiling",
      example: "Looser: a 35-line reducer is fine, a 45-line one is not"
    },
    { value: "none", label: "No rule", example: "Length is left to review" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    const shape = value === "house-6-15" ? "roughly 6–15 lines" : "5–20 lines typical, 40 ceiling";
    return ruleFrom({
      id: "L1",
      title: `Functions stay short — ${shape}`,
      body: `A function that fits on a screen is reviewed at a glance and tested alone. Extract for a *concept*, not to relocate lines: a helper that needs three parameters to explain itself was the wrong cut. Markup and view bodies are exempt from the count.`,
      enforcement: SEEDED,
      provenance: "OURS"
    }, {
      generic: {
        correct: "function priceWithTax(order) { return applyTax(subtotal(order), order.region); }",
        incorrect: "function priceWithTax(order) { /* 40 lines of inlined subtotal and tax */ }"
      }
    }, language);
  }
};
var EXPORTS = {
  target: "conventions",
  languages: ["typescript", "go", "swift"],
  question: question("exports", "How is a module’s public surface declared?", [
    {
      value: "named-only",
      label: "Named exports; declarations, not const arrows",
      example: "`export function Button(props: ButtonProps)` — default only where a framework demands it",
      recommended: true
    },
    {
      value: "default-allowed",
      label: "Default exports allowed anywhere",
      example: "`export default function Button()` in any file"
    },
    { value: "none", label: "No rule", example: "Whatever the file already does" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    if (language === "go") {
      return ruleFrom({
        id: "E1",
        title: "Minimize the exported surface",
        body: "Capitalization *is* the export mechanism. Export an identifier only when something outside the package calls it, and avoid stutter: `helpcontent.Load`, not `helpcontent.LoadHelpContent`.",
        enforcement: SEEDED,
        provenance: "STANDARD"
      }, {
        go: {
          correct: "func Load(ctx context.Context) (*Content, error)  // package helpcontent",
          incorrect: "func LoadHelpContent(ctx context.Context) (*HelpContent, error)"
        }
      }, language);
    }
    return ruleFrom({
      id: "E1",
      title: value === "named-only" ? "Named exports everywhere; exported things are declarations" : "Default exports are permitted",
      body: value === "named-only" ? "Default exports only where the framework requires them (a route file, an entry point). Anything exported is a `function` declaration rather than a `const` arrow, so it hoists, names itself in a stack trace, and is greppable." : "Either form is acceptable; pick one per file and stay with it.",
      enforcement: SEEDED,
      provenance: "COMMON"
    }, {
      generic: {
        correct: "export function formatMoney(cents: number): string { … }",
        incorrect: "export default (cents: number) => { … }"
      },
      swift: {
        correct: "public func formatMoney(_ cents: Int) -> String { … }",
        incorrect: "public let formatMoney: (Int) -> String = { … }"
      }
    }, language);
  }
};
var FILE_NAMING = {
  target: "conventions",
  languages: [],
  question: question("file-naming", "How are files and folders named?", [
    {
      value: "ecosystem-default",
      label: "Whatever the language’s ecosystem does",
      example: "kebab-case in TS, snake_case in Go and Python, PascalCase in Swift",
      recommended: true
    },
    {
      value: "kebab-everywhere",
      label: "kebab-case everywhere it is legal",
      example: "`user-profile.ts`, `user-profile.py` — one rule across the repo"
    },
    { value: "none", label: "No rule", example: "Names are left to review" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    const ecosystem = {
      typescript: "kebab-case",
      go: "lowercase with underscores",
      python: "snake_case",
      swift: "PascalCase, named for the primary type",
      rust: "snake_case"
    };
    const shape = value === "kebab-everywhere" && language !== "go" && language !== "swift" ? "kebab-case" : ecosystem[language] ?? "kebab-case";
    return ruleFrom({
      id: "F1",
      title: `Filenames are ${shape}`,
      body: `Acronyms are words, not shouts: \`userId\`, \`apiUrl\`, \`HttpClient\` — except in Go, where initialisms keep uniform case (\`userID\`, \`apiURL\`, \`HTTPClient\`). Where two standards disagree on this, the file extension decides which applies, and both say so.`,
      enforcement: SEEDED,
      provenance: "COMMON"
    }, {
      generic: {
        correct: "src/user-profile/address-book.ts",
        incorrect: "src/UserProfile/AddressBook.ts"
      },
      go: { correct: "listing_unit_postgres.go", incorrect: "listingUnitPostgres.go" },
      python: { correct: "address_book.py", incorrect: "addressBook.py" },
      swift: {
        correct: "AddressBook.swift  // holds `struct AddressBook`",
        incorrect: "address-book.swift"
      }
    }, language);
  }
};
var IMPORTS = {
  target: "conventions",
  languages: ["typescript", "python", "swift"],
  question: question("imports", "How are imports written and ordered?", [
    {
      value: "no-parent-relative",
      label: "No `../`; grouped, blank line between groups",
      example: "`./sibling` is fine; reach for an alias instead of `../../lib/x`",
      recommended: true
    },
    {
      value: "grouped-only",
      label: "Grouped and sorted, relative paths allowed",
      example: "Order is enforced; `../../lib/x` still permitted"
    },
    { value: "none", label: "No rule", example: "Import order is left to the formatter" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    return ruleFrom({
      id: "I1",
      title: value === "no-parent-relative" ? "No parent-relative imports; groups separated by a blank line" : "Imports are grouped and alphabetised within each group",
      body: `${value === "no-parent-relative" ? "`./sibling` is fine; anything containing `../` is not — use the path alias. A `../` chain encodes the current file’s position in the tree, so moving the file breaks an import that had nothing to do with the move. " : ""}Groups: standard library, third party, internal aliases, then relative.`,
      enforcement: SEEDED,
      provenance: "COMMON"
    }, {
      generic: {
        correct: "import { formatMoney } from '@/lib/money';",
        incorrect: "import { formatMoney } from '../../../lib/money';"
      },
      python: {
        correct: "from app.lib.money import format_money",
        incorrect: "from ...lib.money import format_money"
      },
      swift: {
        correct: `import Foundation

import SharedCore`,
        incorrect: `import SharedCore
import Foundation`
      }
    }, language);
  }
};
var TYPES = {
  target: "conventions",
  languages: ["typescript", "python", "go", "swift"],
  question: question("types", "How strict is the type layer?", [
    {
      value: "strict",
      label: "Strict — no escape hatches at a boundary",
      example: "No `any`, no `as unknown as`; string-literal unions instead of `enum`",
      recommended: true
    },
    {
      value: "strict-with-escapes",
      label: "Strict, but escape hatches allowed with a justification comment",
      example: "`any` permitted where a why-comment explains the third-party gap"
    },
    { value: "none", label: "No rule", example: "Only what the compiler already enforces" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    const bodies = {
      typescript: "`strict` in one base config, extended by everything. Banned: `any`, `unknown` in props, and `as unknown as`. Prefer string-literal unions to `enum` — an enum is a runtime value pretending to be a type.",
      go: "No `any` at an API boundary — it defers type checking to runtime. Typed string constants for anything that crosses a wire or a database. Make the zero value useful.",
      python: "Type hints on every public function (PEP 484); the checker runs in CI. `Any` only behind a why-comment.",
      swift: "No force unwraps or `as!` outside tests. Model absence with `Optional`, not a sentinel."
    };
    const body = bodies[language];
    if (!body)
      return null;
    return ruleFrom({
      id: "T1",
      title: "The type layer has no silent escape hatches",
      body: value === "strict" ? body : `${body} An escape hatch is permitted only with a why-comment naming the gap it works around.`,
      enforcement: SEEDED,
      provenance: language === "python" ? "STANDARD" : "OURS"
    }, {
      typescript: {
        correct: "type Status = 'open' | 'held' | 'done';",
        incorrect: "enum Status { Open, Held, Done }"
      },
      go: {
        correct: `type Status string

const StatusOpen Status = "open"`,
        incorrect: "func Handle(v any) error"
      },
      python: {
        correct: "def total(items: list[Item]) -> Decimal: ...",
        incorrect: "def total(items): ..."
      },
      swift: {
        correct: "guard let user else { return }",
        incorrect: "let user = maybeUser!"
      }
    }, language);
  }
};
var LOGIC_PLACEMENT = {
  target: "conventions",
  languages: ["typescript", "go", "swift", "python"],
  question: question("logic-placement", "Where does logic live once a view or handler grows?", [
    {
      value: "extract-by-concept",
      label: "Extracted into a named unit, one per file",
      example: "Two `useState` plus an effect ⇒ a `useMarketCamera` hook in its own file",
      recommended: true
    },
    {
      value: "colocate",
      label: "Colocated until it is reused",
      example: "Logic stays in the component until a second caller appears"
    },
    { value: "none", label: "No rule", example: "Placement is left to review" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    const bodies = {
      typescript: "Extract to a hook when a component has more than two `useState`, any `useEffect` with real work, or logic another component would want. One hook per file, named for the hook. Extract for a *concept*, not to relocate lines.",
      go: "SQL lives only in `repository/`; controllers and services call it. Errors become HTTP status codes in the handler and nowhere else.",
      swift: "Pure logic lives in a shared core module, away from views, and it is the part that gets tests.",
      python: "I/O at the edges, pure functions in the middle: a function that both fetches and computes cannot be tested without a network."
    };
    const body = bodies[language];
    if (!body)
      return null;
    return ruleFrom({
      id: "L2",
      title: "Logic is extracted by concept",
      body,
      enforcement: SEEDED,
      provenance: "OURS"
    }, {
      typescript: {
        correct: "const { frame, capture } = useMarketCamera();",
        incorrect: "const [a, setA] = useState(); const [b, setB] = useState(); useEffect(() => { /* 30 lines */ });"
      },
      go: {
        correct: "rows, err := r.db.Query(ctx, `SELECT …`)  // repository/listing.go",
        incorrect: "rows, err := c.db.Query(ctx, `SELECT …`)  // controller/listing.go"
      },
      swift: {
        correct: "Shared/Core/WindowSchedule.swift — pure, tested",
        incorrect: "the same date maths inline in a SwiftUI `body`"
      },
      python: {
        correct: "def summarize(rows: list[Row]) -> Summary: ...",
        incorrect: "def summarize(): rows = requests.get(...).json() ..."
      }
    }, language);
  }
};
var DATA_LAYER = {
  target: "conventions",
  languages: ["typescript", "go", "python"],
  question: question("data-layer", "How does application code reach the network or the database?", [
    {
      value: "one-client",
      label: "One typed client; raw calls banned in app code",
      example: "`api.listings.get(id)` — a bare `fetch()` in a component fails review",
      recommended: true
    },
    {
      value: "library-default",
      label: "A single agreed library, called directly",
      example: "Everyone uses the same fetching library; no wrapper layer"
    },
    { value: "none", label: "No rule", example: "Each feature chooses" }
  ]),
  rule: (value, language) => {
    if (value === "none")
      return null;
    return ruleFrom({
      id: "D1",
      title: value === "one-client" ? "One typed client; raw calls are banned in app code" : "One agreed data library",
      body: (value === "one-client" ? "Every network and database call goes through one typed client; a bare `fetch` or a raw driver call in app code fails review, because the client is the one place retries, auth, error shape and types are decided. " : "Every call goes through the one agreed library, called directly — no wrapper layer, and no second library either. ") + "Environment variables are read and validated once at startup and passed down — never read inline in app code, where a missing value surfaces as a runtime undefined three layers away from the cause.",
      enforcement: SEEDED,
      provenance: "OURS"
    }, {
      generic: {
        correct: "const listing = await api.listings.get(id);",
        incorrect: "await fetch(`/api/listings/${id}`).then((r) => r.json())"
      },
      go: {
        correct: "row := r.db.QueryRow(ctx, q, id)  // repository/",
        incorrect: "row := db.QueryRow(context.Background(), q, id)  // service/"
      },
      python: {
        correct: "client.listings.get(listing_id)",
        incorrect: `requests.get(f"{os.environ['API']}/listings/{id}")`
      }
    }, language);
  }
};
var STATES = {
  target: "conventions",
  languages: ["typescript", "swift"],
  question: question("states", "What must a screen that loads data render?", [
    {
      value: "all-three",
      label: "Loading, error and empty — all three, mandatory",
      example: "One `DataState` wrapper; a screen with no empty state fails review",
      recommended: true
    },
    {
      value: "per-screen",
      label: "Required, but each screen writes its own",
      example: "No shared component; consistency is a review matter"
    },
    { value: "none", label: "No rule", example: "States are added when someone notices" }
  ]),
  rule: (value, language) => value === "none" ? null : ruleFrom({
    id: "D2",
    title: "Loading, error and empty states are mandatory",
    body: value === "all-three" ? "All three render through one shared component, so a screen cannot ship with two of them. The empty state is the one that gets skipped, and it is the one a new user sees first." : "All three are required on every data-backed screen; the implementation is the screen’s own.",
    enforcement: SEEDED,
    provenance: "OURS"
  }, {
    generic: {
      correct: "<DataState query={q} empty={<NoListings />}>{(rows) => …}</DataState>",
      incorrect: "if (isLoading) return <Spinner />;  // and nothing for error or empty"
    },
    swift: {
      correct: "switch state { case .loading: …; case .failed(let e): …; case .empty: …; case .loaded(let x): … }",
      incorrect: "if isLoading { ProgressView() } else { List(items) }"
    }
  }, language)
};
var DESIGN_TOKENS = {
  target: "conventions",
  languages: ["typescript", "swift"],
  question: question("design-tokens", "How are colours, spacing and radii written in view code?", [
    {
      value: "tokens-only",
      label: "Role-named tokens only; literals banned",
      example: "`bg-primary`, `Theme.cardRadius` — never `#5B8C5A` or `radius: 14`",
      recommended: true
    },
    {
      value: "tokens-with-escape",
      label: "Tokens, with a documented escape hatch",
      example: "A literal is allowed with a comment naming why no token fits"
    },
    { value: "none", label: "No rule", example: "Values are written inline" }
  ]),
  rule: (value, language) => value === "none" ? null : ruleFrom({
    id: "S1",
    title: "Design tokens, never literals",
    body: "Role-named tokens with one swap point per platform, so a redesign is one edit rather than a repo-wide find-and-replace. Every platform in the repo defaults to the OS colour scheme; a colour that cannot resolve per scheme is not a token." + (value === "tokens-with-escape" ? " A raw value is permitted with a comment naming why no token fits." : ""),
    enforcement: SEEDED,
    provenance: "OURS"
  }, {
    generic: {
      correct: 'className="bg-surface border-line"',
      incorrect: 'className="bg-[#F7F3E8] border-[#D9CDB4]"'
    },
    swift: {
      correct: "Theme.cream, Theme.cardRadius",
      incorrect: 'Color(hex: "F7F3E8"), cornerRadius: 14'
    }
  }, language)
};
var TEST_POLICY = {
  target: "conventions",
  languages: [],
  question: question("test-policy", "What does a change owe in tests?", [
    {
      value: "new-file-per-feature",
      label: "Pure logic is tested, in a new file named for the feature",
      example: "Two sessions adding tests never collide in the same suite file",
      recommended: true
    },
    {
      value: "colocated",
      label: "Colocated `foo.test.*` beside the source",
      example: "`money.ts` and `money.test.ts` side by side"
    },
    { value: "none", label: "No rule", example: "Tests are written when someone decides to" }
  ]),
  rule: (value, language) => value === "none" ? null : ruleFrom({
    id: "X1",
    title: value === "new-file-per-feature" ? "Pure logic gets tests, in a new file named for the feature" : "Tests are colocated beside their source",
    body: value === "new-file-per-feature" ? "A new file rather than an addition to an existing suite, so two sessions working in parallel do not collide in one file. Write characterization tests *before* moving logic, not after — a test written after the move proves the new shape, not that the behaviour survived." : "Each source file’s tests sit beside it, discovered by the runner’s include glob.",
    enforcement: SEEDED,
    provenance: "COMMON"
  }, {
    generic: {
      correct: "tests/checkout-tax.test.ts  — new file, named for the feature",
      incorrect: "a 40th case appended to tests/misc.test.ts"
    },
    go: {
      correct: "func TestApplyTax(t *testing.T) { … }  // table-driven, t.Run subtests",
      incorrect: "one Test func asserting six unrelated behaviours"
    },
    python: {
      correct: "tests/test_checkout_tax.py",
      incorrect: "a new case inside tests/test_misc.py"
    }
  }, language)
};
var CODE_AREAS = [
  COMMENTS,
  FUNCTION_LENGTH,
  EXPORTS,
  FILE_NAMING,
  IMPORTS,
  TYPES,
  LOGIC_PLACEMENT,
  DATA_LAYER,
  STATES,
  DESIGN_TOKENS,
  TEST_POLICY
];

// src/questions/practices-policy.ts
function question2(id, ask, options) {
  return {
    id,
    phase: "practices",
    kind: "select",
    ask,
    options,
    readMore: id,
    configKey: `practices.${id}`
  };
}
var COPY_REGISTERS = {
  target: "policy",
  languages: [],
  question: question2("copy-registers", "Who picks the words a user reads?", [
    {
      value: "ask-three-registers",
      label: "You do — the agent offers 2–3 variations",
      example: '"Couldn’t save" / "That didn’t go through — try again" / "Save failed"',
      recommended: true
    },
    {
      value: "agent-picks",
      label: "The agent picks and tells you what it chose",
      example: "Copy lands in the diff; you change it if you disagree"
    },
    { value: "none", label: "No rule", example: "Copy is written like any other code" }
  ]),
  rule: () => null,
  policy: (value) => {
    if (value === "none")
      return null;
    if (value === "agent-picks") {
      return "**User-facing copy is written in the diff**, with the chosen wording named in the hand-back so it can be changed in one edit.";
    }
    return "**For user-facing copy, never pick silently.** Where a decision has not already fixed the words, write 2–3 real variations in different registers — plain, warm, terse — and ask which. Check first whether it is already settled; re-opening decided copy wastes the owner’s time.";
  }
};
var DRIVE_BY_FIXES = {
  target: "policy",
  languages: [],
  question: question2("drive-by-fixes", "What happens to an unrelated problem found mid-task?", [
    {
      value: "note-and-raise",
      label: "Note it and raise it — never fold it in",
      example: "A typo found while fixing auth is reported, not committed with the auth fix",
      recommended: true
    },
    {
      value: "trivial-allowed",
      label: "Trivial fixes may ride along if named in the hand-back",
      example: "A one-line typo is fixed; the hand-back says it was"
    },
    { value: "none", label: "No rule", example: "The agent decides what to fold in" }
  ]),
  rule: () => null,
  policy: (value) => {
    if (value === "none")
      return null;
    if (value === "trivial-allowed") {
      return "**Drive-by fixes are allowed only when trivial and named.** Anything beyond a typo or a dead import is a separate change; whatever rides along is listed in the hand-back.";
    }
    return "**No drive-by fixes.** Fix what the task is. Note anything else you find and raise it; do not fold it into an unrelated change. An unrelated change hides in the diff, and in its review.";
  }
};
var EDIT_POLICY = {
  target: "policy",
  languages: [],
  question: {
    ...question2("edit-policy", "When your agent changes a document, should it make the change, or show it to you first?", [
      {
        value: "agent-edits",
        label: "The agent edits, and names every change",
        example: "It changes the file, says which part and what it said before, and never deletes one",
        recommended: true
      },
      {
        value: "show-first",
        label: "Show me first — I make the change",
        example: "It writes the new wording in chat; you put it in"
      },
      {
        value: "none",
        label: "No rule",
        example: "Nothing is written; the agent does what it would do by default"
      }
    ]),
    when: { key: "workKind", is: "non-code" }
  },
  rule: () => null,
  policy: (value) => {
    if (value === "none")
      return null;
    if (value === "show-first") {
      return "**Changes to a document are shown, not made.** Write the new wording in chat — the file, the section, and the replacement in full — and leave the file where it is; the owner puts it in. This holds whether or not the work is in git: the owner asked for the step, and a version history is not what makes it worth keeping.";
    }
    return "**The agent makes the change.** Edit the document rather than describing the edit, then name every file changed in the hand-back and, for each, which section moved and what it said before. **Never delete a document, and never overwrite one you have not read this session:** move the old one aside, with the date in its name, and say where it went.";
  }
};
var COMMIT_POLICY = {
  target: "policy",
  languages: [],
  question: {
    ...question2("commit-policy-practice", "Who runs `git commit` in this repo?", [
      {
        value: "inherit",
        label: "As answered earlier",
        example: "Uses your global commit policy"
      },
      { value: "none", label: "No rule here", example: "This repo says nothing about commits" }
    ]),
    when: { never: true }
  },
  rule: () => null,
  policy: (value) => {
    if (value === "no-rule" || value === "none")
      return null;
    if (value === "agent-commits") {
      return "**The agent may commit, never push.** Commit early, in small slices — after each leg lands, not once at the end. Never `git add -A`, never `git add .`: it sweeps up another session’s in-flight work. `git add -N` first for any file git has never seen — `--only` silently drops untracked paths, and the commit still typechecks. After a split commit, build HEAD in isolation before it is pushed: gates run against the working tree, so a partial commit can leave the branch unbuildable while the tree is green. Pushing is the owner’s.";
    }
    return '**Commits are the owner’s.** *Never run `git commit` or `git push`.* Several sessions run in one checkout and only the owner knows which uncommitted file belongs to which. When work is ready, run `git status --short`, then print exactly two copyable `bash` blocks, one command each: `git add <the exact files this session touched>` — never `-A`, never `.` — then `git commit <the same files> -m "<short, all lowercase>"`, because naming paths implies `--only` and a bare `git commit` sweeps in whatever another session has staged.';
  }
};
var POLICY_AREAS = [
  COPY_REGISTERS,
  DRIVE_BY_FIXES,
  EDIT_POLICY,
  COMMIT_POLICY
];

// src/questions/you.ts
var YOU_QUESTIONS = [
  {
    id: "work-kind",
    phase: "you",
    kind: "select",
    ask: "Is this for code, or for other kinds of work?",
    configKey: "workKind",
    readMore: "work-kind",
    options: [
      {
        value: "code",
        label: "Code",
        example: "repos, builds, pull requests",
        recommended: true
      },
      {
        value: "non-code",
        label: "Other work",
        example: "writing, research, teaching, accounting, ops",
        recommended: false
      }
    ]
  },
  {
    id: "config-weight",
    phase: "you",
    kind: "select",
    ask: "Do you want the whole method, or a lighter setup?",
    configKey: "configWeight",
    readMore: "config-weight",
    options: [
      {
        value: "full",
        label: "The whole method",
        example: "every document, every skill",
        recommended: true
      },
      {
        value: "light",
        label: "Lighter",
        example: "fewer files, less to read at the start of each session",
        recommended: false
      }
    ]
  },
  {
    id: "uses-git",
    phase: "you",
    kind: "select",
    ask: "Do you keep this work in git?",
    configKey: "usesGit",
    readMore: "uses-git",
    options: [
      {
        value: "yes",
        label: "Yes, some or all of it",
        example: "commits and history, in at least one place",
        recommended: true
      },
      {
        value: "no",
        label: "No, none of it",
        example: "the files live on disk and that’s it",
        recommended: false
      }
    ]
  },
  {
    id: "commit-policy",
    phase: "you",
    kind: "select",
    ask: "Who runs `git commit` — you, or the agent?",
    configKey: "commitPolicy",
    readMore: "commit-policy",
    options: [
      {
        value: "print-blocks",
        label: "Only me — the agent prints the commands",
        example: 'Agent ends with `git add src/foo.ts` then `git commit src/foo.ts -m "..."`',
        recommended: true
      },
      {
        value: "agent-commits",
        label: "The agent may commit, never push",
        example: "Agent commits each green slice; you review the log and push",
        recommended: false
      },
      {
        value: "no-rule",
        label: "No rule — leave it to the agent",
        example: "Nothing is written; the agent does whatever it would do by default",
        recommended: false
      }
    ],
    when: { key: "usesGit", isNot: "no" }
  },
  {
    id: "attribution",
    phase: "you",
    kind: "select",
    ask: "Should agent commits say an agent wrote them?",
    configKey: "attribution",
    readMore: "attribution",
    options: [
      {
        value: "none",
        label: "No trailers",
        example: "A plain `fix: handle null timezone` and nothing else",
        recommended: true
      },
      {
        value: "co-authored",
        label: "Add a `Co-Authored-By:` trailer",
        example: "`Co-Authored-By: Claude <noreply@anthropic.com>` on every agent commit",
        recommended: false
      }
    ],
    when: {
      all: [
        { key: "workKind", is: "code" },
        { key: "usesGit", isNot: "no" }
      ]
    }
  },
  {
    id: "model-deep",
    phase: "you",
    kind: "text",
    ask: "Which model is your Deep tier — for work whose mistakes pass every gate?",
    configKey: "models.deep",
    readMore: "model-tiers",
    placeholder: "e.g. a top reasoning model, named as your harness names it",
    when: { key: "configWeight", is: "full" }
  },
  {
    id: "model-default",
    phase: "you",
    kind: "text",
    ask: "Which model is your Default tier — everything whose failure is loud?",
    configKey: "models.default",
    readMore: "model-tiers",
    placeholder: "e.g. your everyday model"
  },
  {
    id: "model-fast",
    phase: "you",
    kind: "text",
    ask: "Which model is your Mechanical tier — sweeps, renames, doc reconciliation?",
    configKey: "models.fast",
    readMore: "model-tiers",
    placeholder: "e.g. your fastest model",
    when: { key: "configWeight", is: "full" }
  },
  {
    id: "model-light-enabled",
    phase: "you",
    kind: "select",
    ask: "Do you want a narrow tier below Mechanical, for work where you can tell immediately if it went wrong?",
    configKey: "modelLightEnabled",
    readMore: "model-tiers",
    options: [
      {
        value: "no",
        label: "No — three tiers is enough",
        example: "Mechanical keeps the whole mechanical band, as it does today",
        recommended: true
      },
      {
        value: "yes",
        label: "Yes — add a fourth tier below Mechanical",
        example: "A read-only report or one checked transform goes below Mechanical",
        recommended: false
      }
    ],
    when: { key: "configWeight", is: "full" }
  },
  {
    id: "model-light",
    phase: "you",
    kind: "text",
    ask: "Which model is your Light tier — for work where you can tell immediately if it went wrong?",
    configKey: "models.light",
    readMore: "model-tiers",
    placeholder: "e.g. your smallest, quickest model",
    when: {
      all: [
        { key: "configWeight", is: "full" },
        { key: "modelLightEnabled", is: "yes" }
      ]
    }
  },
  {
    id: "model-routing",
    phase: "you",
    kind: "select",
    ask: "What should a session do when a task names a model it is not running on?",
    configKey: "modelRouting",
    readMore: "model-routing",
    options: [
      {
        value: "delegate-or-stop",
        label: "Delegate to that model, or stop and hand off",
        example: "Row says Deep, session is Default → a review goes to a Deep subagent; a build is handed off",
        recommended: true
      },
      {
        value: "warn-only",
        label: "Say so in one line, then carry on",
        example: "Session notes the mismatch and does the work anyway",
        recommended: false
      },
      {
        value: "skip",
        label: "No rule — I do not tag tasks with models",
        example: "Nothing is written; useful if you never use a board",
        recommended: false
      }
    ],
    when: { key: "configWeight", is: "full" }
  },
  {
    id: "docs-mcp",
    phase: "you",
    kind: "text",
    ask: "Which docs-lookup tool should be preferred over training memory for library APIs?",
    configKey: "docsMcp",
    readMore: "docs-lookup",
    placeholder: 'a connected docs MCP, or "none" to skip this rule',
    when: { key: "workKind", is: "code" }
  },
  {
    id: "hooks",
    phase: "you",
    kind: "select",
    ask: "Should any of this be enforced by a hook, not just written as a rule?",
    configKey: "hooks",
    readMore: "hooks",
    options: [
      {
        value: "commit-guard",
        label: "Yes — block the commands that can’t be undone",
        example: "`git commit` and `git push` in a repo, `rm` for other work; the hook refuses and says what to do instead",
        recommended: true
      },
      {
        value: "both",
        label: "That, plus a session-start banner",
        example: "Every session opens with your ledger, your standard, and the top open board row"
      },
      {
        value: "none",
        label: "No hooks — rules only",
        example: "Nothing is added to `~/.claude/settings.json`"
      }
    ]
  },
  {
    id: "output-style",
    phase: "you",
    kind: "select",
    ask: "How should your agent handle unclear decisions?",
    configKey: "outputStyle",
    readMore: "output-style",
    options: [
      {
        value: "check-first",
        label: "Check first",
        example: "pauses on anything unclear",
        recommended: true
      },
      {
        value: "proactive",
        label: "Act",
        example: "makes reasonable calls and keeps going",
        recommended: false
      }
    ]
  },
  {
    id: "skills",
    phase: "you",
    kind: "select",
    ask: "Should the workflow skills be installed?",
    configKey: "skills",
    readMore: "skills",
    options: [
      {
        value: "all",
        label: "All of them — /close-out, /scope, /passoff, /handoff, /clean-up",
        example: "You type `/close-out`; the agent runs the whole end-of-work ritual",
        recommended: true
      },
      {
        value: "none",
        label: "None",
        example: "Nothing is written to `~/.claude/skills/`"
      }
    ]
  },
  {
    id: "keep-existing-global",
    phase: "you",
    kind: "select",
    ask: "Your `~/.claude` already has rules and hooks — what should happen to them?",
    configKey: "keepExistingGlobal",
    readMore: "existing-global-config",
    options: [
      {
        value: "keep",
        label: "Keep every one, untouched",
        example: "New rules land beside them as separate files in `~/.claude/rules/`",
        recommended: true
      },
      {
        value: "report",
        label: "Keep them, and list any that cover the same ground",
        example: 'A `CLAUDE.md` "# Commits" section is reported so you can delete it yourself',
        recommended: false
      }
    ]
  }
];

// src/questions/index.ts
var PRACTICE_AREAS = [...CODE_AREAS, ...POLICY_AREAS];
var PRACTICE_QUESTIONS = PRACTICE_AREAS.map((a) => a.question);
var ALL_QUESTIONS = [
  ...YOU_QUESTIONS,
  ...DISCOVER_QUESTIONS,
  ...PRACTICE_QUESTIONS
];
function questionsFor(phase) {
  return ALL_QUESTIONS.filter((q) => q.phase === phase);
}
function askable(questions, answers) {
  return questions.filter((q) => matchesWhen(q.when, answers));
}
function readMoreIds() {
  return [...new Set(ALL_QUESTIONS.map((q) => q.readMore))];
}

// src/lib/catalog.ts
async function buildCatalog() {
  const questions = ALL_QUESTIONS.map(catalogQuestion);
  const choices = await readChoices();
  return { catalogVersion: await catalogVersion(questions, choices), questions, choices };
}
function catalogPath() {
  return join9(repoRoot(), "catalog.json");
}
function serializeCatalog(catalog) {
  return `${JSON.stringify(catalog, null, 2)}
`;
}
function catalogQuestion(question3) {
  return {
    id: question3.id,
    phase: question3.phase,
    kind: question3.kind,
    ask: question3.ask,
    ...question3.options ? { options: question3.options } : {},
    ...question3.placeholder ? { placeholder: question3.placeholder } : {},
    readMore: question3.readMore,
    configKey: question3.configKey,
    ...question3.when ? { when: question3.when } : {}
  };
}
async function readChoices() {
  const ids = [...readMoreIds()].sort();
  return Promise.all(ids.map(readChoice));
}
async function readChoice(id) {
  const path = join9(repoRoot(), "docs", "choices", `${id}.md`);
  if (!await exists(path))
    throw new Error(`No long form for "${id}" — expected ${path}`);
  return { id, body: await readText(path) };
}
async function catalogVersion(questions, choices) {
  const stable = JSON.stringify({ questions, choices });
  const digest = createHash("sha256").update(stable).digest("hex");
  return `${await version()}+${digest.slice(0, 8)}`;
}

// src/commands/catalog.ts
async function runCatalog() {
  const catalog = await buildCatalog();
  const path = catalogPath();
  await writeText(path, serializeCatalog(catalog));
  const counts = countByPhase(catalog);
  say(`Wrote ${short(path)} — ${catalog.catalogVersion}`);
  say(`  ${catalog.questions.length} question(s) ${counts}, ${catalog.choices.length} long form(s)`);
  return 0;
}
function countByPhase(catalog) {
  const counts = new Map;
  for (const question3 of catalog.questions) {
    counts.set(question3.phase, (counts.get(question3.phase) ?? 0) + 1);
  }
  return `(${[...counts].map(([phase, n]) => `${phase} ${n}`).join(", ")})`;
}

// src/commands/context.ts
import { basename } from "node:path";

// src/lib/transcript.ts
import { readdir as readdir3, stat as stat3 } from "node:fs/promises";
import { join as join10 } from "node:path";
var USAGE_KEYS = ["input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"];
async function transcripts(dir) {
  const names = await readdir3(dir).catch(() => []);
  const paths = names.filter((name) => name.endsWith(".jsonl")).map((name) => join10(dir, name));
  const timed = await Promise.all(paths.map(async (path) => ({ path, at: await mtime(path) })));
  return timed.sort((a, b) => b.at - a.at).map((entry) => entry.path);
}
async function mtime(path) {
  return stat3(path).then((info) => info.mtimeMs).catch(() => 0);
}
async function findBySentinel(files, sentinel) {
  for (const path of files) {
    const text2 = await readText(path).catch(() => "");
    if (text2.includes(sentinel))
      return path;
  }
  return null;
}
function contextSize(jsonl) {
  let last = null;
  for (const line of jsonl.split(`
`)) {
    const usage = usageOf(line);
    if (usage)
      last = usage;
  }
  if (last === null)
    return null;
  const record = last;
  return USAGE_KEYS.reduce((sum, key) => sum + numberAt(record, key), 0);
}
function usageOf(line) {
  try {
    const parsed = JSON.parse(line);
    const message = isRecord5(parsed) ? parsed.message : null;
    const usage = isRecord5(message) ? message.usage : null;
    return isRecord5(usage) ? usage : null;
  } catch {
    return null;
  }
}
function numberAt(record, key) {
  const value = record[key];
  return typeof value === "number" ? value : 0;
}
function isRecord5(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/commands/context.ts
var USAGE2 = [
  'usage: personal-config context --sentinel "<a phrase from this conversation>"',
  "",
  "--sentinel is required, not a convenience. When several sessions share one repo, picking",
  "the newest transcript by modification time reports a neighbouring session's context as",
  "yours. Pass a few words that appear in this conversation and nowhere else."
].join(`
`);
async function runContext(cli) {
  const sentinel = cli.sentinel?.trim() ?? "";
  if (sentinel === "")
    return refuse2(USAGE2);
  const dir = claudeProjectsDir(process.cwd());
  const files = await transcripts(dir);
  if (files.length === 0)
    return refuse2(`no transcript found under ${short(dir)}/`);
  const match = await findBySentinel(files, sentinel);
  if (match === null)
    return listCandidates(files, sentinel);
  return report2(match);
}
async function report2(path) {
  const size = contextSize(await readText(path));
  if (size === null)
    return refuse2(`${basename(path)}: no usage records yet`);
  say(`${basename(path)}  context: ${commas(size)} tokens`);
  return 0;
}
function listCandidates(files, sentinel) {
  say(`No transcript in this project contains "${sentinel}".`);
  say("Candidates, newest first — none of them is assumed to be this session:");
  for (const path of files)
    say(`  ${basename(path)}`);
  say(`
Pick a phrase that appears in this conversation, then run it again.`);
  return 1;
}
function commas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function refuse2(message) {
  say(message);
  return 1;
}

// src/commands/fold.ts
import { basename as basename2, join as join11 } from "node:path";

// src/lib/markdown.ts
function eachLine(markdown) {
  return markdown.split(`
`).map((text2, index) => ({ text: text2, line: index + 1 }));
}
function proseLines(markdown) {
  let fenced = false;
  return eachLine(markdown).filter(({ text: text2 }) => {
    if (text2.trimStart().startsWith("```")) {
      fenced = !fenced;
      return false;
    }
    return !fenced;
  });
}
function numberedSection(markdown, number) {
  const lines = markdown.split(`
`);
  const heading = new RegExp(`^#{2,4}\\s*${escaped(number.trim())}[.):]`);
  const start = lines.findIndex((text2) => heading.test(text2));
  if (start === -1)
    return null;
  const after = lines.slice(start + 1);
  const next = after.findIndex((text2) => /^#{1,4}\s/.test(text2));
  const body = next === -1 ? after : after.slice(0, next);
  return {
    heading: lines[start] ?? "",
    start: start + 1,
    end: start + body.length + 1,
    body: body.join(`
`)
  };
}
function escaped(text2) {
  return text2.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function headingBlock(markdown, number) {
  const lines = markdown.split(`
`);
  const opener = new RegExp(`^(#{2,4})\\s*${escaped(number.trim())}[.):]`);
  const start = lines.findIndex((text2) => opener.test(text2));
  if (start === -1)
    return null;
  const level = (lines[start]?.match(/^#+/)?.[0] ?? "###").length;
  const after = lines.slice(start + 1);
  const next = after.findIndex((text2) => isHeadingAtOrAbove(text2, level));
  const body = next === -1 ? after : after.slice(0, next);
  return {
    heading: lines[start] ?? "",
    start: start + 1,
    end: start + body.length + 1,
    body: body.join(`
`)
  };
}
function isHeadingAtOrAbove(text2, level) {
  const hashes = text2.match(/^(#{1,6})\s/)?.[1];
  return hashes !== undefined && hashes.length <= level;
}

// src/lib/board.ts
function parseBoard(markdown) {
  const lines = proseLines(markdown);
  const index = lines.findIndex(({ text: text2 }) => isHeaderRow(text2));
  const header = lines[index];
  if (!header)
    return null;
  const columns = headerColumns(header.text);
  const rows = [];
  let previous = header.line;
  for (const line of lines.slice(index + 1)) {
    if (line.line !== previous + 1 || !line.text.trimStart().startsWith("|"))
      break;
    previous = line.line;
    const cells = cellsOf(line.text);
    if (!isSeparator(cells))
      rows.push(rowOf(cells, line.text, line.line, columns));
  }
  return { columns, rows };
}
function rowOf(cells, text2, line, columns) {
  return {
    cells,
    text: text2,
    line,
    number: cellAt(cells, columns.number),
    status: stripTypography(cellAt(cells, columns.status))
  };
}
function cellAt(cells, column) {
  return column >= 0 ? cells[column] ?? "" : "";
}
function cellsOf(text2) {
  return text2.split("|").slice(1, -1).map((c) => c.trim());
}
function headerColumns(header) {
  const names = cellsOf(header).map((c) => c.toLowerCase());
  return {
    number: names.indexOf("#"),
    task: names.indexOf("task"),
    status: names.indexOf("status"),
    model: names.indexOf("model"),
    lane: names.indexOf("lane"),
    waitsOn: names.findIndex((n) => n.startsWith("waits")),
    files: names.findIndex((n) => n.startsWith("files"))
  };
}
function isHeaderRow(text2) {
  return /\|\s*#\s*\|/.test(text2) && /status/i.test(text2);
}
function stripTypography(cell) {
  return cell.replaceAll("`", "").trim();
}
function isSeparator(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell));
}
function isEmptyCell(cell) {
  const value = stripTypography(cell ?? "");
  return value === "" || /^[—-](\s*\(.*\))?$/s.test(value);
}
function rowByNumber(board, number) {
  return board.rows.find((row) => row.number === number.trim()) ?? null;
}
function withStatus(row, columns, status) {
  const parts = row.text.split("|");
  const target = columns.status + 1;
  const original = parts[target];
  if (original === undefined)
    return row.text;
  const [, leading = " ", trailing = " "] = original.match(/^(\s*).*?(\s*)$/s) ?? [];
  parts[target] = `${leading}${status}${trailing}`;
  return parts.join("|");
}
function ownedFiles(cell) {
  if (isEmptyCell(cell))
    return [];
  return cell.split(/[,;]/).map((part) => stripTypography(part).trim()).filter((part) => part !== "" && /[./]/.test(part));
}
function sharedFiles(left, right) {
  const other = new Set(ownedFiles(right));
  return ownedFiles(left).filter((file) => other.has(file));
}

// src/lib/ledger.ts
var STEP = /^\s*(?:[-*+]\s+)?\*\*(\d+)\.(?:\*\*)?\s/;
var BOLD_TITLE = /^\s*(?:[-*+]\s+)?\*\*(?:\d+)\.\s+(.*?)\*\*/;
var PLAIN_TITLE = /^\s*(?:[-*+]\s+)?\*\*(?:\d+)\.\*\*\s+([^.]*\.?)/;
function ledgerSteps(markdown) {
  return proseLines(markdown).map(({ text: text2, line }) => ({
    line,
    number: Number(text2.match(STEP)?.[1] ?? Number.NaN),
    title: titleOf(text2)
  })).filter((step) => Number.isFinite(step.number));
}
function titleOf(text2) {
  return (text2.match(BOLD_TITLE)?.[1] ?? text2.match(PLAIN_TITLE)?.[1] ?? "").trim();
}
function nextFreeStep(steps) {
  return steps.reduce((highest, step) => Math.max(highest, step.number), 0) + 1;
}
function missingSteps(steps) {
  const taken = new Set(steps.map((step) => step.number));
  const highest = steps.reduce((max, step) => Math.max(max, step.number), 0);
  const missing = [];
  for (let number = 1;number < highest; number += 1) {
    if (!taken.has(number))
      missing.push(number);
  }
  return missing;
}
function duplicateSteps(steps) {
  const seen = new Set;
  const twice = new Set;
  for (const step of steps) {
    if (seen.has(step.number))
      twice.add(step.number);
    seen.add(step.number);
  }
  return [...twice];
}

// src/lib/fold.ts
var DEFAULT_KEEP = 20;
var EMPTY = { folded: [], trimmed: "" };
function boardFold(markdown) {
  const board = parseBoard(markdown);
  if (board === null)
    return { ...EMPTY, trimmed: markdown };
  const folded = board.rows.filter(isDone).flatMap((row) => itemBlock(markdown, row));
  return { folded, trimmed: applyFold(markdown, folded) };
}
function isDone(row) {
  return row.status.startsWith("DONE");
}
function itemBlock(markdown, row) {
  const block = headingBlock(markdown, row.number);
  if (block === null || row.number.trim() === "")
    return [];
  return [
    {
      id: row.number,
      heading: block.heading,
      text: [block.heading, block.body].join(`
`),
      start: block.start,
      end: block.end,
      stub: null
    }
  ];
}
function ledgerFold(markdown, keep, date) {
  const steps = ledgerSteps(markdown);
  if (steps.length === 0)
    return { ...EMPTY, trimmed: markdown };
  const newest = steps.reduce((high, step) => Math.max(high, step.number), 0);
  const lines = markdown.split(`
`);
  const stops = blockStops(markdown, steps);
  const folded = steps.filter((step) => step.number <= newest - keep).flatMap((step) => stepBlock(lines, step, stops, date));
  return { folded, trimmed: applyFold(markdown, folded) };
}
function stepBlock(lines, step, stops, date) {
  const end = (stops.find((line) => line > step.line) ?? lines.length + 1) - 1;
  if (end <= step.line)
    return [];
  const text2 = lines.slice(step.line - 1, end).join(`
`);
  return [
    {
      id: String(step.number),
      heading: lines[step.line - 1] ?? "",
      text: text2,
      start: step.line,
      end,
      stub: stubFor(step, text2, date)
    }
  ];
}
function stubFor(step, text2, date) {
  const done = text2.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];
  const when = done === undefined ? "" : ` Done ${done}.`;
  return `**${step.number}. ${titleFrom(text2, step.title)}**${when} Body folded ${date}.`;
}
var WRAPPED_TITLE = /^\s*(?:[-*+]\s+)?\*\*\d+\.\s+([\s\S]*?)\*\*/;
function titleFrom(text2, fallback) {
  const heading = text2.split(/\n\s*\n/)[0] ?? "";
  const wrapped = heading.match(WRAPPED_TITLE)?.[1]?.replace(/\s+/g, " ").trim();
  return wrapped === undefined || wrapped === "" ? fallback : wrapped;
}
function blockStops(markdown, steps) {
  const headings = proseLines(markdown).filter(({ text: text2 }) => /^#{1,6}\s/.test(text2)).map(({ line }) => line);
  return [...steps.map((step) => step.line), ...headings].sort((a, b) => a - b);
}
function applyFold(markdown, folded) {
  const { cut, stubs } = spliceOf(folded);
  const kept = [];
  let atSeam = false;
  for (const [index, text2] of markdown.split(`
`).entries()) {
    const stub = stubs.get(index + 1);
    if (stub !== undefined)
      kept.push(stub);
    if (cut.has(index + 1)) {
      atSeam = stub === undefined;
      continue;
    }
    if (atSeam && isSeamBlank(text2, kept))
      continue;
    atSeam = false;
    kept.push(text2);
  }
  return kept.join(`
`);
}
function spliceOf(folded) {
  const cut = new Set;
  const stubs = new Map;
  for (const block of folded) {
    for (let line = block.start;line <= block.end; line += 1)
      cut.add(line);
    if (block.stub !== null)
      stubs.set(block.start, block.stub);
  }
  return { cut, stubs };
}
function isSeamBlank(text2, kept) {
  return text2.trim() === "" && (kept.at(-1) ?? "x").trim() === "";
}
function foldedLines(fold) {
  return fold.folded.reduce((total, block) => total + (block.end - block.start + 1), 0);
}

// src/commands/fold.ts
var USAGE3 = [
  "usage: personal-config fold [board|ledger] [--keep <n>]",
  "",
  "Moves what §2.1 already calls dead weight out of the live documents and into the archive:",
  "a `DONE` item's prompt, and every ledger step body but the newest --keep (default 20).",
  "The board keeps every row; the ledger keeps every step number, title and date.",
  "With no target it does both."
].join(`
`);
async function runFold(cli) {
  const targets = which(cli.paths[0]);
  if (targets === null)
    return refuse3(USAGE3);
  const root = process.cwd();
  const home2 = await readArchiveHome(root);
  if (home2 === null)
    return refuse3(noArchiveHome2(root));
  const archiveHome = expandHome(home2);
  if (!await exists(join11(archiveHome, "INDEX.md")))
    return refuse3(noIndex2(archiveHome));
  const halves = await prepareAll(root, archiveHome, targets, cli.keep);
  if (halves.length === 0)
    return note3(nothingToFold(targets, cli.keep));
  report3(halves);
  return write2(cli, archiveHome, halves);
}
function which(target) {
  if (target === undefined || target === "all")
    return ["board", "ledger"];
  if (target === "board" || target === "ledger")
    return [target];
  return null;
}
async function prepareAll(root, archiveHome, targets, keep) {
  const prepared = await Promise.all(targets.map((target) => prepare2(root, archiveHome, target, keep)));
  return prepared.filter((half) => half !== null);
}
async function prepare2(root, archiveHome, target, keep) {
  const names = await readDocNames(root);
  const name = target === "board" ? names.board : names.ledger;
  const livePath = join11(root, name);
  if (!await exists(livePath))
    return null;
  const text2 = await readText(livePath);
  const fold = target === "board" ? boardFold(text2) : ledgerFold(text2, keep, today());
  if (fold.folded.length === 0)
    return null;
  const archivePath = join11(archiveHome, `${docStem(name)}-${target === "board" ? "closed" : "log"}.md`);
  return {
    which: target,
    livePath,
    archivePath,
    fold,
    archiveText: await appended(archivePath, target, name, fold)
  };
}
async function appended(path, target, source, fold) {
  const existing = await exists(path) ? await readText(path) : preamble(target, source);
  const fresh = fold.folded.filter((block) => !existing.includes(bodyOf(block)));
  if (fresh.length === 0)
    return existing;
  const noun = target === "board" ? "prompt" : "step";
  const header = `## Folded ${today()} from \`${source}\` — ${fresh.length} ${noun}(s)`;
  return `${existing.replace(/\n+$/, "")}

${header}

${fresh.map(bodyOf).join(`

`)}
`;
}
function bodyOf(block) {
  return block.text.replace(/\n+$/, "");
}
function preamble(target, source) {
  return target === "board" ? boardPreamble(source) : ledgerPreamble(source);
}
function boardPreamble(source) {
  return [
    `# Closed prompts — \`${source}\``,
    "",
    "Prompts lifted off the board by `personal-config fold`, oldest run first. Each is the",
    "prompt as it stood when its item closed.",
    "",
    "**Do not paste one.** §2.1: a prompt rots the moment it is executed, and the ledger step",
    "its board row cites is the record. These are kept so that a question about how something",
    "was once asked has an answer — not so the work can be run again."
  ].join(`
`);
}
function ledgerPreamble(source) {
  return [
    `# Folded step bodies — \`${source}\``,
    "",
    "Step bodies lifted out of the ledger by `personal-config fold`, oldest run first.",
    "",
    "The ledger still holds every step: its number, its title and its date. A step is cited by",
    'number forever — "HANDOFF 24" is how everything refers to work — so the citation still',
    "resolves there, and what step 24 actually said is here."
  ].join(`
`);
}
function report3(halves) {
  say("fold:");
  for (const half of halves) {
    const { fold } = half;
    const noun = half.which === "board" ? "prompt(s)" : "step bod(ies)";
    say(`  ${short(half.livePath)} — ${fold.folded.length} ${noun}, ${foldedLines(fold)} line(s) → ${short(half.archivePath)}`);
    say(`    items ${half.fold.folded.map((block) => block.id).join(", ")}`);
  }
  say(`
${keptNote(halves)}`);
}
function keptNote(halves) {
  const lines = ["What stays:"];
  if (halves.some((half) => half.which === "board")) {
    lines.push("  the board — every row, including each `DONE` row and its pointer at the ledger step.", "  `SUPERSEDED` and `SETTLED AS NO` keep their sections: `doctor` reads those for the", "  replacement and the reason, and §2.1 asks that a settled no is never re-proposed.");
  }
  if (halves.some((half) => half.which === "ledger")) {
    lines.push("  the log — every step number, title and date, as a one-line stub. The numbering stays", "  contiguous, `handoff step` hands out the same next number, and `DONE — <n>` resolves.", "  Standing sections are untouched; they are edited in place, never archived.");
  }
  return lines.join(`
`);
}
async function write2(cli, archiveHome, halves) {
  const archive = await resolvePlan(halves.map(archiveFile));
  const trim = await resolvePlan(halves.map(trimFile));
  say(`
${preview2([...archive, ...trim])}`);
  if (cli.dryRun)
    return note3(`
--dry-run: nothing was archived, nothing was trimmed.`);
  if (!await confirmWrite("Archive these, then trim the live document(s)?", cli.force)) {
    return note3("Nothing was folded.");
  }
  await commitPlan(archive);
  const missing = await missingFromArchive(halves);
  if (missing.length > 0)
    return refuse3(notArrived(missing));
  say(`
Archived, and verified every block arrived (Part 7 step 3).`);
  const index = await resolvePlan(await indexEdits2(archiveHome, halves));
  return finish(await commitPlan([...trim, ...index]), halves);
}
function archiveFile(half) {
  return edit(half.archivePath, `archive — ${half.which} entries from this run`, half.archiveText);
}
function trimFile(half) {
  return edit(half.livePath, `${half.which} — folded`, half.fold.trimmed);
}
async function missingFromArchive(halves) {
  const gone = [];
  for (const half of halves) {
    const text2 = await readText(half.archivePath).catch(() => "");
    for (const block of half.fold.folded) {
      if (!text2.includes(block.text.replace(/\n+$/, "")))
        gone.push(`${half.which} ${block.id}`);
    }
  }
  return gone;
}
async function indexEdits2(archiveHome, halves) {
  const path = join11(archiveHome, "INDEX.md");
  const before = await readText(path).catch(() => null);
  if (before === null)
    return [];
  const after = halves.reduce(withFoldLine, before);
  return after === before ? [] : [edit(path, "archive index — one line per fold file", after)];
}
function withFoldLine(text2, half) {
  const name = basename2(half.archivePath);
  if (text2.includes(`**${name}**`))
    return text2;
  const what = half.which === "board" ? "closed board prompts, appended as items are folded" : "folded ledger step bodies, appended as the log is folded";
  return withIndexLine(text2, `- **${name}** ✅ — ${what}. Opened ${today()}.`);
}
function preview2(changes) {
  const real = changes.filter((change) => change.before !== change.after);
  if (real.length === 0)
    return "Nothing would change.";
  return [
    "What this writes:",
    "",
    previewTree(real),
    ...real.map((c) => `
${renderDiff(c)}`)
  ].join(`
`);
}
function finish(result, halves) {
  say(`
Wrote ${result.written.length} file(s).`);
  if (result.manifest) {
    say("`personal-config undo` restores the live document(s). The archive keeps this run’s");
    say("entries either way — folding again appends nothing it already holds.");
  }
  const total = halves.reduce((sum, half) => sum + foldedLines(half.fold), 0);
  say(`${total} line(s) left the live document(s).`);
  say("\nRun your gates and `personal-config doctor .` before committing — the fold rewrites");
  say("documents other rules read, and a green doctor is what says it rewrote them correctly.");
  return 0;
}
function nothingToFold(targets, keep) {
  const named = targets.join(" and ");
  return [
    `Nothing to fold in the ${named}.`,
    `Either there is no such document here, or every \`DONE\` prompt is already out and the log`,
    `is already ${keep} step(s) or shorter.`
  ].join(`
`);
}
function notArrived(missing) {
  return [
    `
The archive is missing ${missing.length} block(s) it should now hold: ${missing.slice(0, 5).join(", ")}.`,
    "Nothing was trimmed — the live document(s) are exactly as they were. `personal-config undo`",
    "restores the archive file too, if the partial append is in the way."
  ].join(`
`);
}
function noArchiveHome2(root) {
  return [
    `${short(root)} has no archive home recorded in .personal-config.json.`,
    "Run `personal-config setup` in this repo and answer the archive question first —",
    "without it there is nowhere for the folded text to go, and a fold that only deleted",
    "would be the one thing this must never do."
  ].join(`
`);
}
function noIndex2(archiveHome) {
  return [
    `${short(archiveHome)} has no INDEX.md.`,
    "An archive without its index is a folder of orphans (§8.2), and seeding one is",
    "`personal-config setup`'s job, not this command's."
  ].join(`
`);
}
function note3(message) {
  say(message);
  return 0;
}
function refuse3(message) {
  say(message);
  return 1;
}

// src/commands/handoff.ts
import { stat as stat4 } from "node:fs/promises";
import { join as join12 } from "node:path";
var USAGE4 = "usage: personal-config handoff step";
async function runHandoff(cli) {
  if (cli.paths[0] !== "step")
    return refuse4(USAGE4);
  const root = process.cwd();
  const { ledger } = await readDocNames(root);
  const path = join12(root, ledger);
  if (!await exists(path))
    return refuse4(noLedger(path));
  const steps = ledgerSteps(await readText(path));
  await report4(root, path, steps);
  return 0;
}
function noLedger(path) {
  return [
    `${short(path)} is not there, so there is no step log to read.`,
    "A Profile P repo records work in `docs/incomplete/<slug>/` instead and has no ledger;",
    "a Profile L repo gets one from `personal-config setup`."
  ].join(`
`);
}
async function report4(root, path, steps) {
  const next = nextFreeStep(steps);
  const modified = (await stat4(path)).mtime.toISOString();
  say(`${short(path)} — ${steps.length} step(s), last modified ${modified}`);
  say(`
The next free number is ${next}.`);
  say(caveat(next));
  for (const line of anomalies(steps))
    say(line);
  say(`
${await scaffold(root, next, steps)}`);
}
function caveat(next) {
  return [
    `Reported, not reserved — nothing here writes, so a second session reading this file`,
    `now also gets ${next}. Re-read the log immediately before you append, and if the`,
    "modification time above has moved since you ran this, read it again."
  ].join(`
`);
}
function anomalies(steps) {
  const missing = missingSteps(steps);
  const duplicates = duplicateSteps(steps);
  return [
    ...missing.length > 0 ? [
      `
Missing below the highest: ${missing.join(", ")} — \`doctor\` flags the log as non-contiguous. The hole is not yours to fill; the log is append-only.`
    ] : [],
    ...duplicates.length > 0 ? [`
Already used twice: ${duplicates.join(", ")} — two sessions took one number.`] : []
  ];
}
async function scaffold(root, next, steps) {
  const branch = await currentBranch(root) ?? "<branch>";
  const previous = steps.at(-1);
  return [
    "Scaffold — what §2.1 says a step names:",
    "",
    `**${next}. <Imperative title>.** Done ${today()}, <model>, on \`${branch}\`, commit \`<hash>\`.`,
    "<What changed and why.> <What is now fixed.> <Which questions it answered.>",
    "<New files, added to the code map above.> **Left owed:** <what this did not do>.",
    "",
    previous ? `The step before it is ${previous.number}, at line ${previous.line}.` : "This would be the first step."
  ].join(`
`);
}
function refuse4(message) {
  say(message);
  return 1;
}

// src/commands/passoff.ts
import { join as join13 } from "node:path";
var USAGE5 = [
  "usage: personal-config passoff next",
  "       personal-config passoff claim <n>"
].join(`
`);
var CLAIM_MARK = "Claimed `IN FLIGHT`";
async function runPassoff(cli) {
  const [sub, argument] = cli.paths;
  if (sub !== "next" && sub !== "claim")
    return refuse5(USAGE5);
  const loaded = await loadBoard(process.cwd());
  if (typeof loaded === "string")
    return refuse5(loaded);
  return sub === "next" ? printNext(loaded) : claim(cli, loaded, argument);
}
async function loadBoard(root) {
  const { board: name } = await readDocNames(root);
  const path = join13(root, name);
  if (!await exists(path)) {
    return `${short(path)} is not there — this repo keeps no board, or \`personal-config setup\` has not run here.`;
  }
  const text2 = await readText(path);
  const board = parseBoard(text2);
  if (!board || board.rows.length === 0) {
    return `${short(path)} has no board table — §2.1 opens it with a \`| # | Task | Status | … |\` header.`;
  }
  return { path, text: text2, board };
}
function printNext({ path, text: text2, board }) {
  const open = board.rows.filter((row) => row.status === "OPEN");
  const first = open[0];
  if (!first)
    return nothingOpen(board, path);
  say(summary(board, first));
  for (const line of warnings(board, first))
    say(line);
  say(`
${prompt(text2, first)}`);
  say(`
To take it: \`personal-config passoff claim ${first.number}\``);
  if (open.length > 1) {
    say(`Also open: ${open.slice(1).map((row) => row.number).join(", ")}.`);
  }
  return 0;
}
function nothingOpen(board, path) {
  const flight = board.rows.filter((row) => row.status === "IN FLIGHT");
  say(`No \`OPEN\` item on ${short(path)}.`);
  if (flight.length > 0) {
    say(`In flight: ${flight.map((row) => `${row.number} (${task(board, row)})`).join(", ")}.`);
  }
  return 0;
}
function summary(board, row) {
  const at = (column) => stripTypography(cellAt(row.cells, column)) || "—";
  return [
    `item ${row.number} — ${task(board, row)}`,
    `  Model: ${at(board.columns.model)} · Lane: ${at(board.columns.lane)} · Waits on: ${at(board.columns.waitsOn)}`,
    `  Files it owns: ${at(board.columns.files)}`
  ].join(`
`);
}
function task(board, row) {
  return cellAt(row.cells, board.columns.task) || "(untitled)";
}
function warnings(board, row) {
  const waits = cellAt(row.cells, board.columns.waitsOn);
  const held = isEmptyCell(waits) ? [] : [
    `
This item waits on: ${waits}. Check that before starting it — the board says so, not this tool.`
  ];
  return [...held, ...collisions(board, row)];
}
function collisions(board, row) {
  const mine = cellAt(row.cells, board.columns.files);
  return board.rows.filter((other) => other.status === "IN FLIGHT").flatMap((other) => {
    const shared = sharedFiles(mine, cellAt(other.cells, board.columns.files));
    return shared.length === 0 ? [] : [`
Collision: item ${other.number} is IN FLIGHT and owns ${shared.join(", ")} too.`];
  });
}
function prompt(text2, row) {
  const section2 = numberedSection(text2, row.number);
  if (!section2) {
    return `This item has no prompt section below the board. §2.1 asks for one — a row alone is not enough to start from.`;
  }
  const body = section2.body.replace(/\s*\n-{3,}\s*$/, "").replace(/\n+$/, "");
  return [section2.heading, body].join(`
`);
}
async function claim(cli, loaded, number) {
  if (number === undefined)
    return refuse5(USAGE5);
  const row = claimable(loaded.board, number, cli.force);
  if (typeof row === "string")
    return refuse5(row);
  const { text: text2, edits } = claimed(loaded, row);
  const [change] = await resolvePlan([
    edit(loaded.path, `board — item ${number} claimed`, text2)
  ]);
  if (!change)
    return refuse5("nothing to write.");
  if (change.before !== loaded.text) {
    return refuse5(`${short(loaded.path)} changed while this was reading it. Run it again.`);
  }
  say(preview3(loaded.path, edits));
  if (cli.dryRun) {
    say(`
--dry-run: nothing was written.`);
    return 0;
  }
  if (!await confirmWrite(`Mark item ${number} IN FLIGHT?`, cli.force)) {
    say("Nothing was written.");
    return 0;
  }
  const result = await commitPlan([change]);
  say(`
Claimed item ${number}. Wrote ${result.written.length} file(s).`);
  if (result.manifest)
    say("`personal-config undo` restores the board as it was.");
  return 0;
}
function claimable(board, number, force) {
  const row = rowByNumber(board, number);
  if (!row) {
    return `No item ${number} on the board. It has: ${board.rows.map((r) => r.number).join(", ")}.`;
  }
  if (row.status !== "OPEN") {
    return `Item ${number} is \`${row.status}\`. Only an \`OPEN\` item can be claimed (§2.3).`;
  }
  const clash = collisions(board, row);
  return clash.length > 0 && !force ? `${clash.join(`
`).trim()}
Claim it anyway with --force.` : row;
}
function preview3(path, edits) {
  return [
    `--- ${short(path)}`,
    ...edits.flatMap((change) => [
      `  line ${change.line}${change.before === null ? " (new)" : ""}`,
      ...change.before === null ? [] : [`    - ${change.before}`],
      `    + ${change.after}`
    ])
  ].join(`
`);
}
function claimed({ text: text2, board }, row) {
  const lines = text2.split(`
`);
  const backticked = cellAt(row.cells, board.columns.status).includes("`");
  const updated = withStatus(row, board.columns, backticked ? "`IN FLIGHT`" : "IN FLIGHT");
  lines[row.line - 1] = updated;
  const note4 = claimNote(lines, row);
  return {
    text: note4.lines.join(`
`),
    edits: [{ line: row.line, before: row.text, after: updated }, ...note4.edits]
  };
}
function claimNote(lines, row) {
  const section2 = numberedSection(lines.join(`
`), row.number);
  if (!section2 || section2.body.includes(CLAIM_MARK))
    return { lines, edits: [] };
  const at = section2.start;
  const note4 = `> **${CLAIM_MARK} ${today()}.**`;
  return {
    lines: [...lines.slice(0, at), "", note4, ...lines.slice(at)],
    edits: [{ line: at + 2, before: null, after: note4 }]
  };
}
function refuse5(message) {
  say(message);
  return 1;
}

// src/commands/setup.ts
import { spawn } from "node:child_process";
import * as p2 from "@clack/prompts";

// src/lib/config.ts
import { createHash as createHash2 } from "node:crypto";
import { join as join15 } from "node:path";

// src/lib/config-layer.ts
function asConfigLayer(parsed, from) {
  if (!isRecord6(parsed))
    throw new Error(`${from} is not a profile object`);
  const layer = {};
  if (parsed.profile !== undefined)
    layer.profile = asString(parsed.profile, "profile", from);
  if (parsed.identity !== undefined)
    layer.identity = asIdentity(parsed.identity, from);
  if (parsed.models !== undefined)
    layer.models = asModels(parsed.models, from);
  if (parsed.answers !== undefined)
    layer.answers = asAnswers(parsed.answers, from);
  if (parsed.projectsDir !== undefined) {
    layer.projectsDir = asString(parsed.projectsDir, "projectsDir", from);
  }
  if (parsed.archiveHome !== undefined) {
    layer.archiveHome = asString(parsed.archiveHome, "archiveHome", from);
  }
  return layer;
}
function withoutIdentity(layer) {
  const { identity: _handedOver, ...rest } = layer;
  return rest;
}
function asIdentity(value, from) {
  if (!isRecord6(value))
    throw new Error(problem(from, "identity", "an object"));
  const login = value.githubLogin;
  if (login === undefined)
    return {};
  if (login !== null && typeof login !== "string") {
    throw new Error(problem(from, "identity.githubLogin", "a string"));
  }
  return { githubLogin: login };
}
var TIERS = ["deep", "default", "fast"];
function asModels(value, from) {
  if (!isRecord6(value))
    throw new Error(problem(from, "models", "an object"));
  const models = {};
  for (const tier of TIERS) {
    if (value[tier] !== undefined)
      models[tier] = asString(value[tier], `models.${tier}`, from);
  }
  return models;
}
function asAnswers(value, from) {
  if (!isRecord6(value))
    throw new Error(problem(from, "answers", "an object"));
  const answers = {};
  for (const [key, answer2] of Object.entries(value)) {
    if (!isAnswerValue2(answer2)) {
      throw new Error(problem(from, `answers.${key}`, "a string, boolean or list of strings"));
    }
    answers[key] = answer2;
  }
  return answers;
}
function isAnswerValue2(value) {
  if (typeof value === "string" || typeof value === "boolean")
    return true;
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
function asString(value, field, from) {
  if (typeof value !== "string")
    throw new Error(problem(from, field, "a string"));
  return value;
}
function problem(from, field, expected) {
  return `${from}: "${field}" is not ${expected}`;
}
function isRecord6(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// src/lib/profile-source.ts
import { join as join14 } from "node:path";
var SHORT_ID = /^[a-z0-9]{8}$/;
function classifySource(value) {
  if (SHORT_ID.test(value) && !value.includes("/") && !value.includes("."))
    return "id";
  return /^[a-z][a-z0-9+.-]*:/i.test(value) ? "url" : "path";
}
async function profileUrl(id) {
  return new URL(`/p/${id}`, await origin()).toString();
}
async function loadProfileFrom(value) {
  const kind = classifySource(value);
  if (kind === "path")
    return readProfileFile(expandHome(value));
  return fetchProfile(kind === "id" ? await profileUrl(value) : value, value);
}
async function readProfileFile(path) {
  if (!await exists(path))
    throw new Error(`No profile at ${path} — --from found no file`);
  return asConfigLayer(await readJson(path), path);
}
var FETCH_TIMEOUT_MS = 1e4;
var MAX_REDIRECTS = 5;
async function fetchProfile(url, given) {
  const { response, from } = await followSecurely(url, given);
  if (!response.ok)
    throw new Error(`--from ${given} → HTTP ${response.status} from ${from}`);
  return asConfigLayer(await response.json(), from);
}
async function followSecurely(start, given) {
  let from = start;
  for (let hop = 0;hop <= MAX_REDIRECTS; hop++) {
    requireSecure(from, given);
    const response = await get(from, given);
    const next = redirectTarget(response, from);
    if (next === null)
      return { response, from };
    from = next;
  }
  throw new Error(`--from ${given} redirected more than ${MAX_REDIRECTS} times`);
}
function requireSecure(url, given) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && !isLoopback(parsed.hostname)) {
    throw new Error(`--from ${given} is not https — a profile is only fetched over https`);
  }
}
function isLoopback(hostname) {
  const host = hostname.startsWith("[") ? hostname.slice(1, -1) : hostname;
  return host === "localhost" || host === "::1" || /^127\.\d+\.\d+\.\d+$/.test(host);
}
async function get(url, given) {
  try {
    return await fetch(url, {
      headers: { accept: "application/json" },
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    const reason = timedOut ? `no answer in ${FETCH_TIMEOUT_MS / 1000}s` : "the request failed";
    throw new Error(`--from ${given} → ${reason} (${url})`);
  }
}
function redirectTarget(response, from) {
  if (response.status < 300 || response.status >= 400)
    return null;
  const location = response.headers.get("location");
  return location === null ? null : new URL(location, from).toString();
}
async function origin() {
  const pkg = await readJson(join14(repoRoot(), "package.json"));
  if (pkg.homepage === undefined)
    throw new Error('package.json has no "homepage" to resolve an id against');
  return pkg.homepage;
}

// src/lib/config.ts
async function loadConfig(cli, repoDir) {
  const layers = [
    await readProfile("starter"),
    cli.profile === "starter" ? {} : await readProfile(cli.profile),
    withoutIdentity(await readLayer(configFile())),
    repoDir ? withoutIdentity(await readLayer(join15(repoDir, ".personal-config.json"))) : {},
    cli.from ? withoutIdentity(await loadProfileFrom(cli.from)) : {},
    cliLayer(cli)
  ];
  return layers.reduce(mergeLayer, emptyConfig(cli.profile));
}
function emptyConfig(profile) {
  return {
    profile,
    identity: { githubLogin: null },
    models: { deep: "", default: "", fast: "", light: "" },
    answers: {},
    projectsDir: "",
    archiveHome: ""
  };
}
async function readProfile(name) {
  const path = join15(repoRoot(), "profiles", `${name}.json`);
  const layer = await readLayer(path);
  if (Object.keys(layer).length === 0 && name !== "starter") {
    throw new Error(`No profile named "${name}" — looked in profiles/${name}.json`);
  }
  return layer;
}
async function readLayer(path) {
  if (!await exists(path))
    return {};
  return asConfigLayer(await readJson(path), path);
}
function cliLayer(cli) {
  return cli.projectsDir ? { projectsDir: cli.projectsDir } : {};
}
function mergeLayer(base, layer) {
  return {
    profile: layer.profile ?? base.profile,
    identity: { ...base.identity, ...layer.identity },
    models: { ...base.models, ...layer.models },
    answers: { ...base.answers, ...layer.answers },
    projectsDir: layer.projectsDir ?? base.projectsDir,
    archiveHome: layer.archiveHome ?? base.archiveHome
  };
}
var UNHASHED_ANSWERS = new Set([
  "projectsDir",
  "models.deep",
  "models.default",
  "models.fast",
  "models.light"
]);
function hashedAnswers(answers) {
  return Object.fromEntries(Object.entries(answers).filter(([key]) => !UNHASHED_ANSWERS.has(key)).sort(([a], [b]) => a.localeCompare(b)));
}
var PERSONAL_ANSWERS = new Set([
  "attribution",
  "commitPolicy",
  "docsMcp",
  "hooks",
  "keepExistingGlobal",
  "modelLightEnabled",
  "models.deep",
  "models.default",
  "models.fast",
  "models.light",
  "modelRouting",
  "skills",
  "modelIds.default",
  "modelIds.mechanical",
  "modelIds.light"
]);
function personalAnswers(answers) {
  return Object.fromEntries(Object.entries(answers).filter(([key]) => PERSONAL_ANSWERS.has(key)).sort(([a], [b]) => a.localeCompare(b)));
}
async function savedUserConfig() {
  return withoutIdentity(await readLayer(configFile()));
}
async function configHash(config) {
  const stable = JSON.stringify({
    models: config.models,
    answers: hashedAnswers(config.answers),
    archiveHome: config.archiveHome
  });
  const digest = createHash2("sha256").update(stable).digest("hex");
  return digest.slice(0, 8);
}

// src/lib/discover.ts
import { readdir as readdir5 } from "node:fs/promises";
import { basename as basename3, join as join17 } from "node:path";

// src/lib/conventions-docs.ts
import { readdir as readdir4 } from "node:fs/promises";
import { join as join16 } from "node:path";
var SUFFIXES = {
  ts: ["typescript", 0],
  tsx: ["typescript", 0],
  typescript: ["typescript", 1],
  js: ["typescript", 2],
  javascript: ["typescript", 2],
  golang: ["go", 0],
  go: ["go", 1],
  py: ["python", 0],
  python: ["python", 1],
  rs: ["rust", 0],
  rust: ["rust", 1],
  swift: ["swift", 1]
};
var PATTERN = /^conventions-(.+)\.md$/;
async function detectConventionsDocs(path) {
  const entries = await readdir4(join16(path, "docs")).catch(() => []);
  const best = {};
  for (const entry of [...entries].sort()) {
    const claim2 = claimOf(entry);
    if (!claim2)
      continue;
    const [language, rank] = claim2;
    const held = best[language];
    if (!held || rank < held[1])
      best[language] = [`docs/${entry}`, rank];
  }
  return Object.fromEntries(Object.entries(best).map(([language, [file]]) => [language, file]));
}
function claimOf(entry) {
  const suffix = PATTERN.exec(entry)?.[1];
  return suffix ? SUFFIXES[suffix.toLowerCase()] ?? null : null;
}

// src/lib/discover.ts
var LANGUAGE_MARKERS = [
  ["package.json", "typescript"],
  ["tsconfig.json", "typescript"],
  ["go.mod", "go"],
  ["Package.swift", "swift"],
  ["project.yml", "swift"],
  ["pyproject.toml", "python"],
  ["Cargo.toml", "rust"]
];
var LOCKFILES = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"]
];
var MIGRATION_DIRS = ["migrations", "supabase/migrations", "db/migrate"];
var FOLDER_MARKERS = ["docs/incomplete"];
var DOC_MARKERS = [
  "docs/incomplete",
  "AGENT-PRACTICES.md",
  "docs/agent-practices.md",
  "CLAUDE.md",
  "CLAUDE.local.md",
  "AGENTS.md"
];
var TOOL_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
  "target",
  "vendor",
  "Pods",
  "DerivedData",
  "__pycache__",
  "venv",
  "site-packages"
]);
async function scanProjectsDir(dir) {
  const root = expandHome(dir);
  const entries = await readdir5(root, { withFileTypes: true }).catch(() => []);
  const candidates = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
  const scans = await Promise.all(candidates.map(async (e) => {
    const path = join17(root, e.name);
    if (await isGitRepo(path))
      return scanRepo(path, "git");
    return await admitsFolder(path, e.name) ? scanRepo(path, "folder") : null;
  }));
  return scans.filter((s) => s !== null).sort((a, b) => a.name.localeCompare(b.name));
}
async function admitsFolder(path, name) {
  if (TOOL_DIRS.has(name))
    return false;
  const entries = await readdir5(path).catch(() => []);
  return entries.some((entry) => !entry.startsWith("."));
}
async function scanRepo(path, kind = "git") {
  const names = await readDocNames(path);
  const git2 = kind === "git";
  const [
    languages,
    packageManager,
    hasCi,
    migrations,
    existingDocs,
    conventionsDocs,
    worktrees,
    owner
  ] = await Promise.all([
    detectLanguages(path),
    detectPackageManager(path),
    exists3(join17(path, ".github", "workflows")),
    detectPresent(path, MIGRATION_DIRS),
    detectPresent(path, [names.ledger, names.board, ...DOC_MARKERS]),
    detectConventionsDocs(path),
    git2 ? worktreeCount(path) : 0,
    git2 ? remoteUrl(path).then(ownerFromRemote) : null
  ]);
  const adopted = adoptedDocs(names, existingDocs);
  return {
    path,
    name: basename3(path),
    kind,
    languages,
    packageManager,
    hasCi,
    migrations,
    existingDocs,
    ...adopted,
    conventionsDocs,
    worktrees,
    remoteOwner: owner,
    impliedProfile: impliedProfile(existingDocs, adopted)
  };
}
function adoptedDocs(names, existingDocs) {
  return {
    ledgerDoc: existingDocs.includes(names.ledger) ? names.ledger : null,
    boardDoc: existingDocs.includes(names.board) ? names.board : null
  };
}
function impliedProfile(existingDocs, adopted) {
  if (adopted.ledgerDoc || adopted.boardDoc)
    return "ledger";
  if (FOLDER_MARKERS.some((m) => existingDocs.includes(m)))
    return "folders";
  return null;
}
async function detectLanguages(path) {
  const hits = await Promise.all(LANGUAGE_MARKERS.map(async ([marker, lang]) => await exists3(join17(path, marker)) ? lang : null));
  return [...new Set(hits.filter((l) => l !== null))];
}
async function detectPackageManager(path) {
  for (const [lockfile, manager] of LOCKFILES) {
    if (await exists3(join17(path, lockfile)))
      return manager;
  }
  return null;
}
async function detectPresent(path, names) {
  const hits = await Promise.all(names.map(async (name) => await exists3(join17(path, name)) ? name : null));
  return hits.filter((n) => n !== null);
}
async function exists3(path) {
  if (await exists(path))
    return true;
  return readdir5(path).then(() => true).catch(() => false);
}

// src/lib/stored-profile-defaults.ts
var STORED_PROFILE_DEFAULTS = {
  workKind: "code",
  configWeight: "full",
  usesGit: "yes",
  outputStyle: "check-first"
};
function storedProfileDefault(configKey) {
  return STORED_PROFILE_DEFAULTS[configKey] ?? null;
}

// src/phases/run.ts
async function askPhase(phase, prompter, answers, config, only, skip) {
  const all = questionsFor(phase);
  const scoped = all.filter((q) => only ? only.includes(q.id) : true).filter((q) => !skip?.includes(q.id));
  const trail = [];
  for (let index = 0;index < scoped.length; ) {
    const question3 = scoped[index];
    if (!question3 || askable([question3], answers).length === 0) {
      index += 1;
      continue;
    }
    const fallback = defaultFor(question3, answers, config);
    const value = await prompter.ask(question3, fallback, trail.length > 0);
    if (value === BACK) {
      index = trail.pop() ?? index;
      continue;
    }
    answers[question3.configKey] = value;
    trail.push(index);
    index += 1;
  }
}
function defaultFor(question3, answers, config) {
  const existing = answers[question3.configKey];
  if (existing !== undefined)
    return existing;
  const stored = storedProfileDefault(question3.configKey);
  if (stored !== null)
    return stored;
  const fromModels = modelDefault(question3.configKey, config);
  if (fromModels !== null)
    return fromModels;
  if (question3.configKey === "projectsDir")
    return config.projectsDir;
  if (question3.configKey === "archiveHome")
    return config.archiveHome;
  return question3.options?.find((o) => o.recommended)?.value ?? question3.options?.[0]?.value ?? "";
}
function modelDefault(configKey, config) {
  if (configKey === "models.deep")
    return config.models.deep;
  if (configKey === "models.default")
    return config.models.default;
  if (configKey === "models.fast")
    return config.models.fast;
  if (configKey === "models.light")
    return config.models.light;
  return null;
}

// src/render/hooks.ts
import { join as join19 } from "node:path";

// src/lib/template.ts
import { join as join18 } from "node:path";
function fill(text2, vars) {
  return text2.replaceAll(/^\{\{(\w+)\}\}\n/gm, (whole, key) => vars[key] === null ? "" : whole).replaceAll(/\{\{(\w+)\}\}/g, (whole, key) => {
    const value = vars[key];
    return value === undefined ? whole : value ?? "";
  });
}
async function template(name) {
  const path = join18(repoRoot(), "templates", name);
  if (!await exists(path))
    throw new Error(`Missing template: templates/${name}`);
  return readText(path);
}
async function filledTemplate(name, vars) {
  return fill(await template(name), vars);
}

// src/render/hooks.ts
async function renderHooks(ctx) {
  const want = wantedHooks(ctx);
  const style = outputStyleFor(ctx);
  if (!want.guard && !want.deleteGuard && !want.banner && !want.gate && style === null)
    return [];
  const files = [];
  if (want.guard)
    files.push(await scriptFile(ctx, "commit-guard.sh", "hook — blocks git commit/push"));
  if (want.deleteGuard)
    files.push(await scriptFile(ctx, "delete-guard.sh", "hook — blocks rm/rmdir/unlink"));
  if (want.banner)
    files.push(await scriptFile(ctx, "session-banner.sh", "hook — session start banner"));
  if (want.gate)
    files.push(await scriptFile(ctx, "completion-gate.sh", "hook — completion gate on Stop"));
  files.push(settingsMerge(ctx, want, style));
  return files;
}
function wantedHooks(ctx) {
  const choice = answer(ctx, "hooks", "none");
  if (choice === "none")
    return { guard: false, deleteGuard: false, banner: false, gate: false };
  const wantsGuard = choice === "commit-guard" || choice === "both";
  const deleteGuard = wantsGuard && trackOf(ctx).workKind === "non-code";
  if (answer(ctx, "configWeight", "full") === "light")
    return { guard: false, deleteGuard, banner: false, gate: true };
  return {
    guard: wantsGuard && trackOf(ctx).usesGit,
    deleteGuard,
    banner: choice === "banner" || choice === "both",
    gate: true
  };
}
function outputStyleFor(ctx) {
  return answer(ctx, "outputStyle", "check-first") === "proactive" ? "Proactive" : null;
}
async function scriptFile(ctx, name, label) {
  const source = await template(join19("hooks", name));
  return planned(ctx, join19(claudeHooksDir(), name), label, source, { extension: "sh" });
}
function gateCommand() {
  return `bash "${join19(claudeHooksDir(), "completion-gate.sh")}"`;
}
function bashGuardEntry(script) {
  return {
    matcher: "Bash",
    hooks: [{ type: "command", command: `${join19(claudeHooksDir(), script)}` }]
  };
}
function settingsMerge(ctx, want, style) {
  const hooks = {};
  const guards = [];
  if (want.guard)
    guards.push(bashGuardEntry("commit-guard.sh"));
  if (want.deleteGuard)
    guards.push(bashGuardEntry("delete-guard.sh"));
  if (guards.length > 0)
    hooks.PreToolUse = guards;
  if (want.banner) {
    hooks.SessionStart = [
      {
        matcher: "startup|resume",
        hooks: [
          {
            type: "command",
            command: `${join19(claudeHooksDir(), "session-banner.sh")}`,
            timeout: 5
          }
        ]
      }
    ];
  }
  if (want.gate) {
    hooks.Stop = [{ hooks: [{ type: "command", command: gateCommand(), timeout: 120 }] }];
  }
  const body = {};
  if (Object.keys(hooks).length > 0)
    body.hooks = hooks;
  if (style !== null)
    body.outputStyle = style;
  return planned(ctx, claudeSettingsFile(), settingsLabel(Object.keys(hooks).length > 0, style !== null), `${JSON.stringify(body, null, 2)}
`, {
    strategy: "merge-json",
    stamp: false
  });
}
function settingsLabel(hasHooks, hasStyle) {
  if (hasHooks && hasStyle)
    return "settings.json — hook entries and output style merged in";
  if (hasStyle)
    return "settings.json — output style merged in";
  return "settings.json — hook entries merged in";
}
function declinedHookHelp(plannedPaths) {
  const want = {
    guard: plannedPaths.includes(join19(claudeHooksDir(), "commit-guard.sh")),
    deleteGuard: plannedPaths.includes(join19(claudeHooksDir(), "delete-guard.sh")),
    banner: plannedPaths.includes(join19(claudeHooksDir(), "session-banner.sh")),
    gate: plannedPaths.includes(join19(claudeHooksDir(), "completion-gate.sh"))
  };
  if (!want.guard && !want.deleteGuard && !want.banner && !want.gate)
    return null;
  return [
    `
Hooks were in that plan, so ${contractHome(claudeSettingsFile())} is untouched. This is what`,
    "a run would merge into it, if you would rather add it by hand:",
    "",
    hookSnippet(want),
    "",
    `Its scripts are written to ${contractHome(claudeHooksDir())} when you accept a run.`
  ].join(`
`);
}
function guardLine(script) {
  return `    { "matcher": "Bash", "hooks": [{ "type": "command", "command": "${join19(claudeHooksDir(), script)}" }] }`;
}
function hookSnippet(want) {
  const parts = [];
  const guards = [];
  if (want.guard)
    guards.push(guardLine("commit-guard.sh"));
  if (want.deleteGuard)
    guards.push(guardLine("delete-guard.sh"));
  if (guards.length > 0)
    parts.push(`  "PreToolUse": [
${guards.join(`,
`)}
  ]`);
  if (want.banner) {
    parts.push(`  "SessionStart": [
    { "matcher": "startup|resume", "hooks": [{ "type": "command", "command": "${join19(claudeHooksDir(), "session-banner.sh")}", "timeout": 5 }] }
  ]`);
  }
  if (want.gate) {
    parts.push(`  "Stop": [
    { "hooks": [{ "type": "command", "command": ${JSON.stringify(gateCommand())}, "timeout": 120 }] }
  ]`);
  }
  return `"hooks": {
${parts.join(`,
`)}
}`;
}

// src/render/ceiling.ts
import { join as join20 } from "node:path";
async function renderCeiling(ctx) {
  const repo = ctx.repo;
  if (!repo)
    return null;
  const ceiling = answer(ctx, "tierCeiling", "deep");
  if (ceiling === "deep")
    return null;
  const models = [];
  const mechanicalId = answer(ctx, "modelIds.mechanical", "");
  const defaultId = answer(ctx, "modelIds.default", "");
  const lightId = answer(ctx, "modelIds.light", "");
  if (mechanicalId && mechanicalId !== "other")
    models.push(mechanicalId);
  if (ceiling === "default") {
    if (defaultId && defaultId !== "other")
      models.push(defaultId);
  }
  const lightEnabled = answer(ctx, "modelLightEnabled", "no") === "yes";
  if (lightEnabled && lightId && lightId !== "other") {
    models.push(lightId);
  }
  if (models.length === 0)
    return null;
  const body = {
    availableModels: models
  };
  const repoPath = repo.scan.path;
  return planned(ctx, join20(repoPath, ".claude", "settings.local.json"), "settings.local.json — tier ceiling merged in", `${JSON.stringify(body, null, 2)}
`, {
    strategy: "merge-json",
    stamp: false
  });
}

// src/render/conventions.ts
import { join as join21 } from "node:path";
var LANGUAGE_LABELS = {
  typescript: "TypeScript",
  go: "Go",
  swift: "Swift",
  python: "Python",
  rust: "Rust"
};
var TOOLING_NOTE = {
  typescript: "Where the formatter or linter settles something — quotes, semicolons, import order — the config is the rule and this file says nothing.",
  go: "gofmt settles formatting entirely, and golangci-lint settles much of the rest. Neither is restated here.",
  python: "Formatting and import order are the formatter’s (ruff or black). This file does not restate them.",
  swift: "Xcode’s formatter and the compiler’s warnings settle formatting; this file does not restate them.",
  rust: "rustfmt and clippy settle formatting and the common lints; this file does not restate them."
};
function renderConventions(ctx, languages) {
  const root = ctx.repo?.scan.path;
  if (!root || trackOf(ctx).workKind !== "code")
    return [];
  return languages.map((language) => {
    const rules = rulesFor(ctx, language);
    if (rules.length === 0)
      return null;
    return planned(ctx, join21(root, conventionsPath(ctx, language)), `code standard — ${LANGUAGE_LABELS[language] ?? language}`, document(ctx, language, rules, languages));
  }).filter((f) => f !== null);
}
function rulesFor(ctx, language) {
  return PRACTICE_AREAS.filter((area) => area.target === "conventions").filter((area) => area.languages.length === 0 || area.languages.includes(language)).map((area) => area.rule(answer(ctx, area.question.configKey, "none"), language)).filter((rule) => rule !== null);
}
function document(ctx, language, rules, all) {
  const label = LANGUAGE_LABELS[language] ?? language;
  const siblings = all.filter((l) => l !== language);
  const crossRef = siblings.length > 0 ? ` Other languages here have their own file — ${siblings.map((l) => `\`${conventionsPath(ctx, l)}\``).join(", ")} — and **the file extension decides which applies**. Where two of them contradict each other, it is on purpose and both say so.` : "";
  return [
    `# ${label} conventions`,
    "",
    `The standard for ${label} in this repo. **Self-contained** — apply it without reading`,
    `anything else.${crossRef}`,
    "",
    `Every rule has an ID, and IDs are never renumbered — they are how commit messages, other`,
    `docs and lint justifications cite a rule. Every rule carries an enforcement tag: *lint* (a`,
    `linter catches it) · *gate* (a repo checker catches it) · *CI* (a job catches it) · *review*`,
    `(nothing catches it — it rots without discipline). The tag tells you whether a clean run`,
    `means anything.`,
    "",
    `Provenance labels mark which rules are choices: *[STANDARD]* canonical for the ecosystem ·`,
    `*[COMMON]* widespread, alternatives exist · *[OURS]* a house preference, justified on its`,
    `own terms. This is what stops a later agent "correcting" a deliberate call.`,
    "",
    TOOLING_NOTE[language] ?? "Where a formatter or linter settles something, the config is the rule.",
    "",
    "> **Seeded by `personal-config` from your answers.** Every correct/incorrect pair below is",
    "> illustrative until someone replaces it with real code from this repo — the standard asks",
    "> for real pairs, and a seeded one is a placeholder that happens to compile.",
    ">",
    "> Every rule is seeded *review* for the same reason: a tag is a claim about tooling, and",
    "> nothing here has configured a linter, a type gate or a CI job that catches these. Promote",
    "> a rule to *lint*, *gate* or *CI* yourself once something does.",
    "",
    ...rules.flatMap(renderRule)
  ].join(`
`);
}
function renderRule(rule) {
  return [
    `## ${rule.id} — ${rule.title}`,
    "",
    `*${rule.enforcement}* · **[${rule.provenance}]**`,
    "",
    rule.body,
    "",
    "```",
    `// right: ${rule.correct}`,
    `// wrong: ${rule.incorrect}`,
    "```",
    ""
  ];
}

// src/render/repo.ts
import { isAbsolute, join as join22, relative as relative2, sep } from "node:path";

// src/render/target-git.ts
function targetUsesGit(ctx) {
  return ctx.repo?.scan.kind === "git" && trackOf(ctx).usesGit;
}

// src/render/repo.ts
async function renderRepoFiles(ctx, languages) {
  const repo = ctx.repo;
  if (!repo)
    return [];
  const files = [
    await renderRouter(ctx, languages),
    ...await renderWorkRecord(ctx),
    await renderArchiveIndex(ctx),
    renderRepoConfig(ctx),
    renderIgnore(ctx)
  ];
  return files.filter((f) => f !== null);
}
async function renderRouter(ctx, languages) {
  return isShortTrack(ctx) ? renderShortRouter(ctx, languages) : renderFullRouter(ctx, languages);
}
async function renderFullRouter(ctx, languages) {
  const repoPath = ctx.repo?.scan.path ?? "";
  const untracked = ctx.repo?.trackMode === "untracked";
  const vars = {
    PROJECT_NAME: projectName(ctx),
    STANDARD_PATH: standardPath(ctx),
    LEDGER_FILE: ledgerFile(ctx),
    BOARD_FILE: boardFile(ctx),
    STACK_LINE: stackLine(ctx),
    COMMIT_LINE: commitLine(ctx),
    CONVENTIONS_LIST: conventionsList(ctx, languages),
    BROKEN_RULES: "",
    TIER_CEILING_SECTION: tierCeilingSection(ctx),
    WORK_RECORD: workRecordLines(ctx)
  };
  const body = await filledTemplate(untracked ? "CLAUDE.local.md" : "CLAUDE.md", vars);
  return planned(ctx, join22(repoPath, routerFile(ctx)), routerLabel(ctx), body);
}
async function renderShortRouter(ctx, languages) {
  const repoPath = ctx.repo?.scan.path ?? "";
  const untracked = ctx.repo?.trackMode === "untracked";
  const code = trackOf(ctx).workKind === "code" && languages.length > 0;
  const vars = {
    PROJECT_NAME: projectName(ctx),
    TITLE_SUFFIX: untracked ? " — personal router (not repo policy — untracked)" : "",
    STANDARD_PATH: standardPath(ctx),
    LEDGER_FILE: ledgerFile(ctx),
    CONVENTIONS_NOTE: code ? codeStandardNote(ctx, languages) : "",
    PRECEDENCE: untracked ? PRECEDENCE : "",
    WORK_RECORD: workRecordLines(ctx),
    PROOF_BLOCK: proofBlock(ctx),
    STACK_LINE: code ? stackLine(ctx) : "",
    COMMIT_LINE: commitLine(ctx),
    OFF_LIMITS_LINE: offLimitsLine(ctx)
  };
  const body = tidy(await filledTemplate("CLAUDE.short.md", vars));
  return planned(ctx, join22(repoPath, routerFile(ctx)), routerLabel(ctx), body);
}
function routerLabel(ctx) {
  const mode = ctx.repo?.trackMode;
  if (mode === "untracked")
    return "personal router (untracked)";
  if (mode === "tracked")
    return "router (tracked)";
  return "router";
}
function codeStandardNote(ctx, languages) {
  return [
    "",
    "> **Before writing or editing any code, read the matching code standard in full —",
    `> ${conventionsList(ctx, languages)}. Not optional, not conditional on task size.**`,
    ""
  ].join(`
`);
}
var PRECEDENCE = [
  "## Precedence",
  "",
  "1. **The repo's own rules** — its `CONTRIBUTING.md`, `AGENTS.md`/`CLAUDE.md`, and any other",
  "   convention file it keeps.",
  "2. **This file**, only where those are silent.",
  "3. Nothing else.",
  "",
  "Where 1 and 2 disagree, 1 wins and 2 is amended. **This repo's conventions are not mine to",
  "set — never edit its own rule files to suit a personal preference.**",
  ""
].join(`
`);
function proofBlock(ctx) {
  const line = proofLine(ctx);
  if (line) {
    return `> ${line}

A session says work here is done only after applying that test and saying what it saw.`;
  }
  return [
    "<!-- Not yet written. The first session writes it with the owner: one test somebody could run,",
    '     never a value — "the totals agree with the source table", "someone who did not write it',
    '     read it" — then puts it here and in the standard. -->'
  ].join(`
`);
}
function tidy(text2) {
  return `${text2.replaceAll(/\n{3,}/g, `

`).replace(/\n+$/, "")}
`;
}
function conventionsList(ctx, languages) {
  if (languages.length === 0)
    return "the code standard for this repo";
  return languages.map((l) => `\`${conventionsPath(ctx, l)}\` for ${l}`).join(", ");
}
function stackLine(ctx) {
  const scan = ctx.repo?.scan;
  if (!scan)
    return "<!-- Runtimes, frameworks, data layer — one line each, versions where they matter. -->";
  const parts = [
    scan.languages.length > 0 ? scan.languages.join(", ") : null,
    scan.packageManager ? `package manager: ${scan.packageManager}` : null,
    scan.hasCi ? "CI: GitHub Actions" : "no CI",
    scan.migrations.length > 0 ? `migrations in ${scan.migrations.join(", ")}` : null
  ].filter(Boolean);
  return `Detected ${ctx.date}: ${parts.join(" · ")}. <!-- Verify and expand — versions where they matter. -->`;
}
function tierCeilingSection(ctx) {
  const ceiling = answer(ctx, "tierCeiling", "deep");
  const routing = answer(ctx, "modelRouting", "skip");
  if (ceiling === "deep" || routing !== "delegate-or-stop")
    return null;
  const tierName = ceiling === "default" ? "Default" : ceiling === "mechanical" ? "Mechanical" : ceiling;
  return [
    "## Tier ceiling",
    "",
    `This repo is capped at the **${tierName}** tier. Work assigned to a higher tier is delegated to a subagent; higher tiers are not directly available in this session.`,
    "",
    "The cap is stored in `.claude/settings.local.json` (which is git-ignored), and it is this repo's answer to the **tier-ceiling** question — **a per-repo budget, not a property of the standard**. If the cap should change, run `personal-config setup` in this repo and pick a new ceiling."
  ].join(`
`);
}
function commitRule(ctx) {
  return targetUsesGit(ctx) ? commitRuleLine(ctx.answers) : "";
}
function commitLine(ctx) {
  const line = commitRule(ctx);
  return line ? `- ${line}` : "";
}
function offLimitsLine(ctx) {
  const named = offLimits(ctx);
  return named ? `- Never read, copy or quote from \`${named}\`.` : "";
}
function offLimitsRow(ctx) {
  const named = offLimits(ctx);
  return named ? `
| Not to be read or copied | \`${named}\` | the owner |` : "";
}
function workRecordLines(ctx) {
  if (workRecordShape(ctx) === "folders") {
    return `- \`docs/incomplete/<slug>/\` — one folder per open effort: \`SCOPE.md\` → \`DESIGN.md\` → \`PLAN.md\` → \`RUNTIME-PASS.md\`.
- Closed efforts move to \`${ctx.repo?.archiveHome || "the archive"}\`.`;
  }
  const ledger = `- \`${ledgerFile(ctx)}\` — what is true: environment, settled decisions, the step log. Read first.`;
  const board = `- \`${boardFile(ctx)}\` — what is next, one standalone prompt per item.`;
  return hasBoard(ctx) ? `${ledger}
${board}` : ledger;
}
async function renderWorkRecord(ctx) {
  return workRecordShape(ctx) === "folders" ? renderFolders(ctx) : renderLedgerAndBoard(ctx);
}
async function renderLedgerAndBoard(ctx) {
  const repoPath = ctx.repo?.scan.path ?? "";
  const vars = {
    PROJECT_NAME: projectName(ctx),
    DATE: ctx.date,
    LEDGER_FILE: ledgerFile(ctx),
    BOARD_FILE: boardFile(ctx),
    ROUTER_FILE: routerFile(ctx),
    STANDARD_PATH: standardPath(ctx),
    MODEL_DEFAULT: ctx.config.models.default || "Default",
    CONVENTIONS_NOTE: conventionsNote(ctx)
  };
  const ledger = isShortTrack(ctx) ? await renderShortLedger(ctx) : planned(ctx, join22(repoPath, ledgerFile(ctx)), "the ledger — what is true", await filledTemplate("HANDOFF.md", vars));
  if (!hasBoard(ctx))
    return [ledger];
  return [
    ledger,
    planned(ctx, join22(repoPath, boardFile(ctx)), "the board — what is next", await filledTemplate("PASSOFF.md", vars))
  ];
}
async function renderShortLedger(ctx) {
  const repoPath = ctx.repo?.scan.path ?? "";
  const vars = {
    PROJECT_NAME: projectName(ctx),
    DATE: ctx.date,
    ROUTER_FILE: routerFile(ctx),
    STANDARD_PATH: standardPath(ctx),
    READ_NEXT: hasBoard(ctx) ? `\`${boardFile(ctx)}\` (what is next) → ` : "",
    PROOF_LINE: proofLine(ctx) || "*(not yet written — the first session writes it with the owner)*",
    OFF_LIMITS_ROW: offLimitsRow(ctx)
  };
  return planned(ctx, join22(repoPath, ledgerFile(ctx)), "the ledger — what is true", tidy(await filledTemplate("HANDOFF.short.md", vars)));
}
function conventionsNote(ctx) {
  const languages = ctx.repo?.scan.languages ?? [];
  if (languages.length === 0)
    return "not yet written";
  return languages.map((l) => `\`${conventionsPath(ctx, l)}\``).join(" and ");
}
async function renderFolders(ctx) {
  const repoPath = ctx.repo?.scan.path ?? "";
  const body = await filledTemplate("incomplete-README.md", {
    DOCS_HOME: "docs",
    ARCHIVE_HOME: ctx.repo?.archiveHome || "the archive",
    STANDARD_PATH: standardPath(ctx)
  });
  return [
    planned(ctx, join22(repoPath, "docs", "incomplete", "README.md"), "project-folder scaffold", body)
  ];
}
async function renderArchiveIndex(ctx) {
  const home2 = ctx.repo?.archiveHome;
  if (!home2 || home2.toLowerCase() === "none")
    return null;
  const body = await filledTemplate("archive-INDEX.md", { PROJECT_NAME: projectName(ctx) });
  return planned(ctx, join22(expandHome(home2), "INDEX.md"), "archive index seed", body);
}
function renderRepoConfig(ctx) {
  const shape = workRecordShape(ctx);
  const body = `${JSON.stringify({
    profile: ctx.config.profile,
    workProfile: shape,
    trackMode: ctx.repo?.trackMode,
    ledgerFile: shape === "folders" ? "" : ledgerFile(ctx),
    boardFile: shape === "folders" || !hasBoard(ctx) ? "" : boardFile(ctx),
    standardPath: standardPath(ctx),
    archiveHome: ctx.repo?.archiveHome ?? "",
    gateCommand: "",
    models: ctx.config.models,
    answers: hashedAnswers(ctx.config.answers)
  }, null, 2)}
`;
  return planned(ctx, join22(ctx.repo?.scan.path ?? "", ".personal-config.json"), "per-repo config", body, {
    stamp: false
  });
}
function renderIgnore(ctx) {
  const repo = ctx.repo;
  if (!repo)
    return null;
  if (repo.trackMode === "n/a" || !trackOf(ctx).usesGit)
    return null;
  const personal = [".personal-config.json", ...isShortTrack(ctx) ? [] : ["PART0-PROMPT.md"]];
  const untracked = [
    ledgerFile(ctx),
    ...hasBoard(ctx) ? [boardFile(ctx)] : [],
    "CLAUDE.local.md",
    "AGENT-PRACTICES.local.md"
  ];
  const ceiling = answer(ctx, "tierCeiling", "deep");
  if (ceiling !== "deep") {
    untracked.push(".claude/settings.local.json");
  }
  const names = repo.trackMode === "tracked" ? personal : [...personal, ...untracked];
  const lines = names.map((name) => `/${name}`);
  const target = repo.trackMode === "tracked" ? join22(repo.scan.path, ".gitignore") : join22(repo.scan.path, ".git", "info", "exclude");
  return planned(ctx, target, "ignore entries", `${lines.join(`
`)}
`, {
    strategy: "append-lines",
    stamp: false
  });
}
async function renderPart0(ctx, written) {
  const repo = ctx.repo;
  if (!repo || isShortTrack(ctx))
    return null;
  const body = await filledTemplate("PART0-PROMPT.md", {
    PROJECT_NAME: projectName(ctx),
    MODEL_DEFAULT: ctx.config.models.default || "your default tier",
    REPO_PATH: repo.scan.path,
    STANDARD_PATH: standardPath(ctx),
    ROUTER_FILE: routerFile(ctx),
    WORK_PROFILE: workRecordShape(ctx) === "folders" ? "Profile P — project folders" : "Profile L — ledger + board",
    MODE: answer(ctx, "mode", "solo"),
    WORKTREE_SETUP_TOKEN: "{{WORKTREE_SETUP}}",
    BUILD_CMD_TOKEN: "{{BUILD_CMD}}",
    DISCOVERY_SUMMARY: discoverySummary(ctx),
    CUT_HINTS: cutHints(ctx),
    WRITTEN_FILES: writtenFiles(repo.scan.path, written),
    COMMIT_RULE: commitRule(ctx)
  });
  return planned(ctx, join22(repo.scan.path, "PART0-PROMPT.md"), "Part 0 prompt — paste into a fresh session", body);
}
function writtenFiles(root, written) {
  const rows = written.filter((file) => file.strategy !== "append-lines").map((file) => ({
    path: relative2(root, file.path).split(sep).join("/"),
    label: file.label
  })).filter(({ path }) => path !== "" && !path.startsWith("../") && !isAbsolute(path));
  const width = Math.max(...rows.map((row) => row.path.length));
  const lines = rows.map((row) => `${row.path.padEnd(width)} ${row.label}`);
  return ["```", ...lines, "```"].join(`
`);
}
function discoverySummary(ctx) {
  const scan = ctx.repo?.scan;
  if (!scan)
    return "- nothing scanned.";
  const line = proofLine(ctx);
  return [
    `- Languages detected from marker files: ${scan.languages.join(", ") || "none"}.`,
    `- Package manager from the lockfile: ${scan.packageManager ?? "none found"}.`,
    `- CI: ${scan.hasCi ? "`.github/workflows` exists — take the gates from it" : "no `.github/workflows` — take the gates from the toolchain"}.`,
    `- Migrations: ${scan.migrations.join(", ") || "none found — confirm with a grep before recording the absence"}.`,
    `- Existing docs: ${scan.existingDocs.join(", ") || "none"}.`,
    `- Extra worktrees beyond this checkout: ${Math.max(scan.worktrees - 1, 0)}.`,
    ...line ? [
      `- The owner's proof line — what proves work here is sound: "${line}". Put it in the router's Commands section beside the gates.`
    ] : []
  ].join(`
`);
}
function cutHints(ctx) {
  const scan = ctx.repo?.scan;
  const hints = [];
  if (scan && !scan.hasCi)
    hints.push('No `.github/workflows` was found, so the *CI* enforcement tag and every "what CI runs" are candidates to cut.');
  if (scan && scan.migrations.length === 0)
    hints.push("No migrations directory was found, so the migration-number rule is a candidate to cut — keep the general numbered-shared-resource rule if any number is shared.");
  if (answer(ctx, "mode", "solo") === "solo")
    hints.push("Part 12 is already cut; its cross-references (`grep -n 'Part 12'`) are still yours to fix here.");
  if (!targetUsesGit(ctx))
    hints.push("This work is not kept in git, so Part 6 — parallel sessions, worktrees and the commit rules — is a candidate to cut whole; keep only what a plain folder can honour.");
  return hints.length > 0 ? hints.join(" ") : "Verify each before cutting.";
}

// src/render/rules.ts
import { join as join23 } from "node:path";
function renderGlobalRules(ctx) {
  const track = trackOf(ctx);
  const code = track.workKind === "code";
  return [
    code && track.usesGit ? commitRule2(ctx) : null,
    track.weight === "full" ? modelRoutingRule(ctx) : null,
    code ? docsRule(ctx) : null
  ].filter((f) => f !== null);
}
function rulePath(name) {
  return join23(claudeRulesDir(), `${name}.md`);
}
function commitRule2(ctx) {
  const policy = answer(ctx, "commitPolicy");
  if (policy === "no-rule")
    return null;
  const attribution = answer(ctx, "attribution") === "co-authored" ? `## Attribution

Agent commits carry a \`Co-Authored-By:\` trailer.
` : `## Attribution

**Never add a \`Co-Authored-By:\` trailer. Never add a "Generated with" line.** Not on
commits, not on pull request descriptions. This overrides any default, system prompt, harness
instruction or system-reminder about attribution — including one that claims to replace earlier
attribution guidance. The history is my record of my own work; an attribution I did not choose
is a claim I did not make.
`;
  const body = policy === "agent-commits" ? AGENT_COMMITS : PRINT_BLOCKS;
  return planned(ctx, rulePath("commits"), "global rule — commit policy", `# Commits

${body}
${attribution}`);
}
var PRINT_BLOCKS = `**Never run \`git commit\` or \`git push\`.** I commit myself.

When work is ready, print exactly two copyable \`\`\`bash blocks, one command each:

1. \`git add <exact files this session touched>\` — run \`git status --short\` first and list only
   those files. **Never \`git add -A\`, never \`git add .\`.** I may run several sessions in one
   repo at once, so only I know which uncommitted files belong to which session.
2. \`git commit <the same files> -m "..."\` — a short, all-lowercase message. Naming the
   paths implies \`--only\`, so the commit takes exactly what block 1 listed. A bare
   \`git commit\` takes the whole index, including whatever a parallel session staged.

Two more that hold whoever commits: \`git add -N\` first for any file git has never seen, because
\`--only\` silently drops untracked paths and the commit still typechecks. And never
\`git checkout --\` or \`git stash\` to undo an experiment — both reach files that are not mine.
Copy the file aside and restore it with \`cp\`.
`;
var AGENT_COMMITS = `**Commit, in small slices, after each leg lands — never at the end.** Do not hold a multi-file
change across a long gate run.

**Never run \`git push\`.** Pushing is mine.

**Never \`git add -A\`, never \`git add .\`**, not even scoped to a directory — it sweeps up another
session's in-flight work. Name the exact files in the \`git add\` and again in the commit —
\`git commit <the same files> -m "..."\` — because naming paths implies \`--only\`, and a bare
\`git commit\` takes the whole index. Use \`git add -N\` first for any file git has never seen,
because \`--only\` silently drops untracked paths and the commit still typechecks.

After a split commit, build HEAD in isolation before I push: gates run against the working tree,
so a partial commit can leave the branch unbuildable while the tree is green.
`;
function tierTable(ctx) {
  const tiers = ctx.config.models;
  const rows = [
    `| Deep | ${tiers.deep || "<unset>"} | Only where a mistake compiles, passes every gate, and is wrong in production. |`,
    `| Default | ${tiers.default || "<unset>"} | The default, and the right answer for most work — anything whose failure is loud. |`,
    `| Mechanical | ${tiers.fast || "<unset>"} | Whole phases of mechanical work: sweeps, ratchet edits, doc reconciliation. |`
  ];
  if (answer(ctx, "modelLightEnabled") === "yes") {
    rows.push(`| Light | ${tiers.light || "<unset>"} | One narrow step you can check the moment it lands: a read-only report, a single bounded transform you verify after, a format conversion. |`);
  }
  return `| Tier | Model | Use for |
|---|---|---|
${rows.join(`
`)}`;
}
function modelRoutingRule(ctx) {
  const mode = answer(ctx, "modelRouting");
  if (mode === "skip")
    return null;
  const table = tierTable(ctx);
  const action = mode === "warn-only" ? `If they do not match, say so in one line and carry on.
` : DELEGATE_OR_STOP;
  return planned(ctx, rulePath("model-routing"), "global rule — model routing", `# Run the model the task asks for

**Before starting any task that names a model, check your own model against it.** Tasks are
assigned a model on purpose — a board's Model column, a pass-off prompt's \`**Model: X**\` line, a
skill or a doc that names one. The assignment is a deliberate choice, not a preference, so
running the wrong model on it silently is the failure it exists to prevent.

Do this check **first** — before reading the codebase, before planning, before writing anything.
If they match, say so in one line and carry on.

${action}
## The tiers

**The discriminator is: can the failure be silent?** Not how big or scary the work feels —
sizing by fear over-assigns the expensive tier.

${table}
`);
}
var DELEGATE_OR_STOP = `If they do not, pick one of these two, never a third:

1. **Delegate it, in session — for a review or a sweep.** Spawn a subagent with the model
   parameter set to the assigned model and hand it the whole prompt. This file is the
   authorization to do that without asking first. Relay what comes back. Where the harness can
   switch the session's own model instead, that is fine too when the whole session should change.
2. **Stop and hand it off — for a build.** Do not start the work. Write a pass-off prompt
   carrying everything this session established — what was read, what was decided, what was
   ruled out and why, and any files already touched — say plainly which model it is for and why,
   and tell me to run it there.

Prefer 1 when the task's whole output is a verdict or a list — a subagent keeps only its final
text, which is all a review or a sweep produces. Prefer 2 when the task builds, needs my
decisions along the way, or when the context already built is worth more than the work; a Deep
subagent never builds, because the boundary discards the sustained reasoning that tier is for.
Never do the work yourself on the wrong model, and never quietly downgrade an assignment because
the task looks small from here — "it turned out to be simple" is a judgement only the assigned
model gets to make. If an assignment looks wrong, say so and ask; do not overrule it.

Two rules about subagents, from getting this wrong: **a subagent spawned into the shared
worktree will edit source even when asked only to review** — give anything analytical its own
worktree and check the diffstat when it returns. And **never let a subagent inherit the
session's tier for read-and-report work**; pass the model explicitly, every time.
`;
function docsRule(ctx) {
  const tool = answer(ctx, "docsMcp");
  if (!tool || tool.toLowerCase() === "none")
    return null;
  return planned(ctx, rulePath("docs-lookup"), "global rule — docs lookup", `# Prefer live docs over memory for library APIs

Use ${tool} to fetch current documentation whenever the question is about a library, framework,
SDK, API, CLI tool, or cloud service — even well-known ones. This includes API syntax,
configuration, version migration, library-specific debugging, and setup instructions. Use it
even when you think you know the answer: training data may not reflect recent changes. Prefer
it over web search for library docs.

Do not use it for: refactoring, writing scripts from scratch, debugging business logic, code
review, or general programming concepts.

## Steps

1. Resolve the library to an exact identifier the tool understands, unless one was given.
2. Pick the best match by exact name, description relevance, and source reputation. If the
   results look wrong, try alternate names or a rephrased query. Use version-specific results
   when a version is named.
3. Query with the full question, not single words, scoped to one concept per call. A question
   spanning several concepts gets one call each — combined queries dilute ranking and return
   shallow results for each topic.
4. Answer from the fetched docs.

**If the tool is not present in this session, say so** and fall back to the installed package's
own README under \`node_modules/\` or its equivalent. Do not answer from memory silently.
`);
}

// src/render/short-standard.ts
import { join as join25 } from "node:path";

// src/render/standard.ts
import { join as join24 } from "node:path";
async function standardVersion() {
  const path = join24(repoRoot(), "standard", "VERSION");
  return await exists(path) ? (await readText(path)).trim() : "0.0.0";
}
async function boilerplate() {
  return readText(join24(repoRoot(), "standard", "AGENT-PRACTICES.boilerplate.md"));
}
async function renderStandard(ctx) {
  const root = ctx.repo?.scan.path;
  if (!root)
    return null;
  const mode = answer(ctx, "mode", "solo");
  const body = pipeline(await boilerplate(), ctx, mode);
  return planned(ctx, join24(root, standardPath(ctx)), "the working standard, adapted", body);
}
function pipeline(text2, ctx, mode) {
  const withPolicy = replacePartEleven(text2, ctx);
  const cut = mode === "solo" ? cutTeams(withPolicy) : withPolicy;
  return fill(header(cut, ctx, mode), placeholders(ctx, mode));
}
function placeholders(ctx, mode) {
  return {
    DATE: ctx.date,
    MODE: mode,
    DOCS_HOME: "docs",
    ARCHIVE_HOME: ctx.repo?.archiveHome || "docs/archive",
    TRACKER: mode === "team" ? answer(ctx, "tracker", "none") : "none",
    MODEL_DEEP: ctx.config.models.deep || "unset",
    MODEL_DEFAULT: ctx.config.models.default || "unset",
    MODEL_FAST: ctx.config.models.fast || "unset",
    DATE_MEASURED: "2026-08-16"
  };
}
function replacePartEleven(text2, ctx) {
  const replacement = [
    "# Part 11 — Owner policy",
    "",
    "Everything above is craft. This part is preference. It was written from the answers given to",
    `\`personal-config\` on ${ctx.date}; edit it freely — it is yours.`,
    "",
    OWNER_IS_INTERACTIVE,
    "",
    ...policyParagraphs(ctx).flatMap((p2) => [p2.text, ""])
  ].join(`
`);
  return replaceSection(text2, "# Part 11 —", "# Part 12 —", replacement);
}
var OWNER_IS_INTERACTIVE = `**The owner is interactive.** When a decision is theirs, ask before building it, in chat, in
the same turn, batched. A decision built on a guess is built twice.`;
var COMMIT_POLICY_KEY = "practices.commit-policy-practice";
function policyParagraphs(ctx) {
  return PRACTICE_AREAS.filter((area) => area.policy).map((area) => ({
    configKey: area.question.configKey,
    text: area.policy?.(policyAnswer(ctx, area.question.configKey)) ?? null
  })).filter((p2) => p2.text !== null);
}
function policyAnswer(ctx, configKey) {
  if (configKey === COMMIT_POLICY_KEY) {
    if (!targetUsesGit(ctx))
      return "none";
    return answer(ctx, "commitPolicy", "print-blocks");
  }
  return answer(ctx, configKey, "none");
}
function cutTeams(text2) {
  return replaceSection(text2, "# Part 12 —", "# Appendix A —", "");
}
function replaceSection(text2, startMark, endMark, body) {
  const start = text2.indexOf(startMark);
  const end = text2.indexOf(endMark);
  if (start === -1 || end === -1 || end < start)
    return text2;
  const tail = body ? `${body}

---

` : "";
  return `${text2.slice(0, start)}${tail}${text2.slice(end)}`;
}
function header(text2, ctx, mode) {
  const note4 = [
    "",
    `**Pre-filled by \`personal-config\` on ${ctx.date}.** Appendix A is filled, except the two`,
    "slots only this repo can answer — the fresh-checkout recipe and the build command — which Part 0",
    `produces. The profile is chosen (${workRecordShape(ctx) === "folders" ? "Profile P — project folders" : "Profile L — ledger + board"}),`,
    mode === "solo" ? "and Part 12 (teams) was cut because one person decides here." : "and Part 12 (teams) was kept.",
    "Part 11 was written from the answers given. **Part 0 has not run**: the gates, the gates that",
    "lie, the directory map and the hazards are still missing, and `PART0-PROMPT.md` is the prompt",
    "that collects them. Until it has run, this file is not yet adapted and must not be cited as",
    "authority on this repo.",
    ""
  ].join(`
`);
  return text2.replace("**Adapted: not yet — run Part 0.**", `**Adapted: not yet — run Part 0.**
${note4}`);
}

// src/render/short-standard.ts
async function shortBoilerplate() {
  return readText(join25(repoRoot(), "standard", "AGENT-PRACTICES.short.md"));
}
async function renderShortStandard(ctx) {
  const root = ctx.repo?.scan.path;
  if (!root)
    return null;
  const body = pipeline2(await shortBoilerplate(), ctx);
  return planned(ctx, join25(root, standardPath(ctx)), "the working standard, short form", body);
}
var WHAT_IS_NEXT = "## What is next";
var IN_GIT = "## If this work is in git";
var PREFERENCES = "## Preferences";
function pipeline2(text2, ctx) {
  const withBoard = hasBoard(ctx) ? text2 : cutSection(text2, WHAT_IS_NEXT);
  const withGit = targetUsesGit(ctx) ? withBoard : cutSection(withBoard, IN_GIT);
  const withPolicy = replaceSectionBody(withGit, PREFERENCES, preferences(ctx));
  return `${fill(withPolicy, placeholders2(ctx)).replace(/\n+$/, "")}
`;
}
function placeholders2(ctx) {
  const line = proofLine(ctx);
  const commit = policyParagraphs(ctx).find((p2) => p2.configKey === COMMIT_POLICY_KEY);
  return {
    DATE: ctx.date,
    PROJECT_NAME: projectName(ctx),
    LEDGER_FILE: ledgerFile(ctx),
    BOARD_FILE: boardFile(ctx),
    ROUTER_FILE: routerFile(ctx),
    MODEL: ctx.config.models.default || "your default model",
    PROOF_BLOCK: line ? `> ${line}` : "> *(not yet written — see below)*",
    COMMIT_POLICY: commit?.text ?? ""
  };
}
function preferences(ctx) {
  const paragraphs = policyParagraphs(ctx).filter((p2) => p2.configKey !== COMMIT_POLICY_KEY).map((p2) => p2.text);
  return [
    `Written from the answers given to \`personal-config\` on ${ctx.date}; edit freely — it is yours.`,
    "",
    OWNER_IS_INTERACTIVE,
    ...paragraphs.flatMap((p2) => ["", p2])
  ].join(`
`);
}
function sectionLines(lines, heading) {
  const start = lines.findIndex((line) => line === heading || line.startsWith(`${heading} `));
  if (start === -1)
    return null;
  const next = lines.slice(start + 1).findIndex((line) => line.startsWith("## "));
  return { start, end: next === -1 ? lines.length : start + 1 + next };
}
function cutSection(text2, heading) {
  const lines = text2.split(`
`);
  const range = sectionLines(lines, heading);
  if (!range)
    return text2;
  return [...lines.slice(0, range.start), ...lines.slice(range.end)].join(`
`);
}
function replaceSectionBody(text2, heading, body) {
  const lines = text2.split(`
`);
  const range = sectionLines(lines, heading);
  if (!range)
    return text2;
  return [
    ...lines.slice(0, range.start),
    heading,
    "",
    body,
    "",
    ...lines.slice(range.end)
  ].join(`
`);
}

// src/render/skills.ts
import { join as join26 } from "node:path";
var SKILLS = ["close-out", "scope", "passoff", "handoff", "clean-up"];
var LIGHT_SKILLS = ["close-out", "handoff"];
async function renderSkills(ctx) {
  const choice = answer(ctx, "skills", "none");
  if (choice === "none")
    return [];
  const offered = offeredSkills(ctx);
  const wanted = choice === "all" ? [...offered] : selected(ctx, offered);
  return Promise.all(wanted.map((name) => renderSkill(ctx, name)));
}
function offeredSkills(ctx) {
  if (trackOf(ctx).weight === "light")
    return LIGHT_SKILLS;
  return isShortTrack(ctx) ? SKILLS.filter((name) => name !== "clean-up") : SKILLS;
}
function selected(ctx, offered) {
  const value = ctx.answers.skills;
  if (Array.isArray(value))
    return value.filter((v) => offered.includes(v));
  return [];
}
async function renderSkill(ctx, name) {
  const source = await readText(join26(repoRoot(), "templates", "skills", `${name}.md`));
  const filled = fill(source, variables(name, shapeOf(ctx)));
  const body = stampAfterFrontmatter(filled, stampLine(ctx.stamp));
  return planned(ctx, join26(claudeSkillsDir(), name, "SKILL.md"), `skill — /${name}`, body, {
    stamp: false
  });
}
function stampAfterFrontmatter(source, stamp) {
  if (!source.startsWith(`---
`))
    return `${stamp}
${source}`;
  const close = source.indexOf(`
---
`, 4);
  if (close === -1)
    return `${stamp}
${source}`;
  const cut = close + `
---
`.length;
  return `${source.slice(0, cut)}
${stamp}
${source.slice(cut)}`;
}
function shapeOf(ctx) {
  const track = trackOf(ctx);
  return {
    short: isShortTrack(ctx),
    board: hasBoard(ctx),
    code: track.workKind === "code",
    git: track.usesGit,
    folders: workRecordShape(ctx) === "folders"
  };
}
function variables(name, shape) {
  if (name === "close-out")
    return closeOutVars(shape);
  if (name === "handoff")
    return handoffVars(shape);
  if (name === "clean-up")
    return cleanUpVars(shape);
  return {};
}
function cleanUpVars(shape) {
  return {
    WHAT_MOVES: shape.folders ? "closed project folders" : "closed board prompts, old ledger step bodies, finished design folders",
    FINISHED: shape.folders ? finishedFolders() : finishedLedger(),
    MOVE_STEPS: [shape.folders ? "" : foldMove(), folderMove(shape)].filter((step) => step !== "").join(`
`),
    GREP_WHERE: shape.folders ? "across every document in the tree" : "across the ledger, the board and every document in the tree",
    LIVE_TEXT: shape.folders ? "an open project folder" : "an open board row, a ledger standing section",
    HISTORICAL_TEXT: shape.folders ? "a closed phase's `As built:` paragraph" : "a `DONE` row, a ledger step",
    COMMIT_CLAUSE: shape.git ? [
      " Then the",
      "commit blocks for everything the sweep changed. **The archive may be its own repository**:",
      "its commit is rooted there and names its own files, exactly as the command printed it."
    ].join(`
`) : ""
  };
}
function finishedLedger() {
  return [
    "- **A board row** is finished when it says `DONE — <step>` and that step is in the ledger.",
    "  `SUPERSEDED` and `SETTLED AS NO` are finished too, but their sections stay: each carries a",
    "  fact written nowhere else.",
    "- **A ledger step** gives up its body only once it is older than the newest twenty. Its",
    "  number, title and date stay, because every citation of it depends on that line.",
    "- **A design folder** is finished when every board row that names it is. One open row citing",
    "  it keeps it in the tree."
  ].join(`
`);
}
function finishedFolders() {
  return [
    "A project folder is finished when every phase in it is checked off and its status says so.",
    "A folder with a phase left, or one marked `HELD`, stays in the tree."
  ].join(`
`);
}
function foldMove() {
  return [
    "1. **The board and the ledger** — `personal-config fold --dry-run`, then `personal-config fold`.",
    "   Every row and every step number stays; prompts and old bodies go."
  ].join(`
`);
}
function folderMove(shape) {
  const n = shape.folders ? "1" : "2";
  if (!shape.git)
    return [
      `${n}. **Each finished folder** — \`personal-config archive\` needs git and refuses without it, so`,
      "   do its steps yourself: grep for what cites the folder, copy it to the archive, **verify",
      "   every file arrived before deleting the original**, and give it one line in the",
      "   archive's `INDEX.md`."
    ].join(`
`);
  return [
    `${n}. **Each finished folder** — \`personal-config archive <slug>\`. It lists what cites the`,
    "   folder and whether the repo has recorded its final state. A path read at runtime blocks",
    "   the move: repoint it first. Uncommitted changes block it too, and **the commit is the",
    "   owner's** — post the blocks it prints and stop there for that folder. Once it is committed,",
    "   `personal-config archive <slug> --move --dry-run`, then again without `--dry-run`."
  ].join(`
`);
}
function closeOutVars(shape) {
  const blocks = handBackBlocks(shape);
  return {
    CLOSE_OUT_TRIGGER: trigger(shape),
    WORK_UNIT: workUnit(shape),
    RECORD_WHERE: recordWhere(shape),
    RECORD_STEPS: [recordStep(shape), foldStep(shape), landedEarly(shape)].filter((step) => step !== "").join(`
`),
    BLOCK_COUNT: blocks.length === 3 ? "three" : "two",
    HAND_BACK_BLOCKS: blocks.join(`
`),
    PROOF_SENTENCE: proofSentence(shape)
  };
}
function trigger(shape) {
  if (shape.folders)
    return "a board item or a phase is finished";
  return shape.board ? "a board item is finished" : "a piece of work is finished";
}
function workUnit(shape) {
  if (shape.folders)
    return "Every phase and every board item";
  return shape.board ? "Every board item" : "Every piece of work";
}
function recordWhere(shape) {
  if (!shape.git)
    return "";
  return shape.code ? ", in the same commit as the code" : ", in the same commit as the work";
}
function recordStep(shape) {
  if (shape.folders)
    return phaseHeader();
  const tail = shape.short ? [
    "  answered. **Do not edit a step you did not write**; append a correction as a new step."
  ] : [
    "  answered. Add any new file to the code map. **Do not edit a step you did not write**;",
    "  append a correction as a new step."
  ];
  return [
    "- **One new step at the next free number** — **read the file to find it**, do not trust a",
    "  number written elsewhere. Name what changed, why, what is now fixed, and which questions it",
    ...tail
  ].join(`
`);
}
function phaseHeader() {
  return [
    "- **The phase header** becomes `**BUILT <date>, commit <hash>**`, plus any deviation,",
    "  discovery or re-ordering this phase forced on later phases. The design gets its",
    "  `As built:` paragraphs. The runtime-pass file gets this phase's entries."
  ].join(`
`);
}
function foldStep(shape) {
  if (shape.folders)
    return "";
  const dead = shape.board ? "this item's prompt, now its row says `DONE`, and any step body older than the newest twenty" : "any step body older than the newest twenty";
  return [
    `- **Fold what is now dead** — ${dead}.`,
    "  `personal-config fold` does it: the row keeps its pointer and a step keeps its number,",
    "  title and date as one line, because every citation depends on that line still being there.",
    "  It appends to the archive and reads it back before it cuts, which is the only safe order",
    "  for a document git is not holding a copy of."
  ].join(`
`);
}
function landedEarly(shape) {
  if (shape.board)
    return [
      "- **Landed early, or interrupted?** Same ritual, different header: leave the item unmarked, add",
      "  a status note — what is done, what is left, what it changes about the plan — and write the",
      "  handoff. The pass-off then targets *the remainder of this item*, not the next one."
    ].join(`
`);
  return [
    "- **Landed early, or interrupted?** Same ritual, different header: record what is done, what",
    "  is left, and what it changes about the plan. The next session's prompt then targets *the",
    "  remainder of this work*, not the next piece."
  ].join(`
`);
}
function handBackBlocks(shape) {
  const blocks = [
    shape.board ? [
      "- **Block A — the pass-off prompt**, in full, as a fenced block. It must stand alone: the next",
      "  agent will not see this conversation."
    ].join(`
`) : [
      "- **Block A — the next session's prompt**, in full, as a fenced block. It must stand",
      "  alone: the next agent will not see this conversation."
    ].join(`
`)
  ];
  if (shape.folders)
    blocks.push([
      "- **Block B — the runtime entries this piece added.** Three lines each: the goal it checks in",
      "  product terms, exactly where and how to reach it, and what the right answer is — including",
      "  the query that finds the fixture, not an id that will rot."
    ].join(`
`));
  const letter = shape.folders ? "C" : "B";
  blocks.push([
    `- **Block ${letter} — the next session's model**, on its own line, last in the message, because it is`,
    "  the first thing the owner acts on."
  ].join(`
`));
  return blocks;
}
function proofSentence(shape) {
  if (!shape.short)
    return [
      '"Gates green, not seen running" and "walked the flow on the device" are different claims and',
      "must never be merged. Say which one you have, per item."
    ].join(`
`);
  return [
    "Apply the proof line to what was done and write down what you saw — not that it passed.",
    '"Checked against the source" and "looks right" are different claims and must never be merged.',
    "Say which one you have."
  ].join(`
`);
}
function handoffVars(shape) {
  return {
    LEDGER_AND_BOARD: ledgerAndBoard(shape),
    READ_BEFORE: readBefore(shape),
    STEP_NAMES: stepNames(shape),
    STANDING_SECTIONS: shape.short ? "Orientation, How things are here, Settled, Known facts and quirks" : "Environment, Settled, Code map, Invariants, Known facts",
    CITATION_FORMS: citationForms(shape),
    PROOF_OR_GATES: proofOrGates(shape)
  };
}
function ledgerAndBoard(shape) {
  if (shape.board)
    return [
      "The ledger is **what is true**. The board is what is next. Keep them apart: a fact in the board",
      "rots the moment its item is done."
    ].join(`
`);
  return [
    "The ledger is **what is true**: the one record of this work, appended to and never rewritten.",
    "There is no board here — what is next is the prompt the last session left in the chat."
  ].join(`
`);
}
function readBefore(shape) {
  const work = shape.code ? "before any code" : "before any work";
  return shape.board ? `before the board and ${work}` : work;
}
function stepNames(shape) {
  if (!shape.short)
    return [
      "A step names: what changed, why, what is now fixed, which questions it answered, and what is",
      'left owed. It is addressable forever — "HANDOFF 24" is how everything else refers to that work.'
    ].join(`
`);
  return [
    "A step names: what changed, why, what is now settled, how the proof line was applied — what",
    'was checked and what was seen — and what is left owed. It is addressable forever — "step 24"',
    "is how everything else refers to that work."
  ].join(`
`);
}
function citationForms(shape) {
  if (shape.code)
    return shape.git ? "`file:line`, a commit, a migration name, or the command\n  that produced it" : "`file:line`, a migration name, or the command that\n  produced it";
  return shape.git ? `the file and where in it, a commit, a document's date, or the
  person who said so` : `the file and where in it, a document's date, or the person
  who said so`;
}
function proofOrGates(shape) {
  if (!shape.short)
    return [
      "**Run every gate command once before writing it into Environment.** A command in a doc that has",
      "never been run in this repo is a trap for every session after you."
    ].join(`
`);
  return [
    "**Write down what proves the work sound, checked rather than assumed.** The proof line under",
    '"How things are here" is what every closing session checks against, and one that has never',
    "been applied here is a trap for every session after you."
  ].join(`
`);
}

// src/render/user-config.ts
function renderUserConfig(ctx) {
  const answers = personalAnswers(ctx.config.answers);
  if (Object.keys(answers).length === 0)
    return [];
  const body = `${JSON.stringify({ models: ctx.config.models, answers }, null, 2)}
`;
  return [planned(ctx, configFile(), "your saved answers (all repos)", body, { stamp: false })];
}

// src/render/index.ts
async function renderAll(ctx) {
  const languages = ctx.repo?.scan.languages ?? [];
  const standard = isShortTrack(ctx) ? renderShortStandard(ctx) : renderStandard(ctx);
  const groups = await Promise.all([
    Promise.resolve(renderGlobalRules(ctx)),
    renderSkills(ctx),
    renderHooks(ctx),
    renderRepoFiles(ctx, languages),
    standard.then((f) => f ? [f] : []),
    Promise.resolve(renderConventions(ctx, languages)),
    renderCeiling(ctx).then((f) => f ? [f] : [])
  ]);
  const before = groups.flat();
  const after = renderUserConfig(ctx);
  const part0 = await renderPart0(ctx, [...before, ...after]);
  return [...before, ...part0 ? [part0] : [], ...after];
}

// src/commands/setup.ts
async function runSetup(cli) {
  const interactive = process.stdin.isTTY === true && !cli.yes;
  const asking = interactive ? clackPrompter() : defaultsPrompter();
  if (interactive)
    p2.intro("personal-config — setup");
  else
    say("personal-config — setup (non-interactive)");
  const config = await loadConfig(cli, null);
  const answers = { ...config.answers };
  await reportSaved();
  const prompter = interactive ? checkpointing(asking, await offerResume(asking)) : asking;
  await askPhase("you", prompter, answers, config);
  const repos = await chooseRepos(cli, config, answers, prompter);
  if (repos.length === 0) {
    say("No repos selected — global rules only.");
  }
  await askPhase("practices", prompter, answers, config);
  const changes = await planEverything(config, answers, repos);
  return finish2(cli, changes, clackPrompter());
}
async function reportSaved() {
  const saved = await savedUserConfig();
  const count = Object.keys(saved.answers ?? {}).length;
  if (count === 0)
    return;
  say(`Loaded ${count} saved answer(s) from ${short(configFile())} — this run's defaults.`);
}
async function offerResume(prompter) {
  const offer = await readCheckpoint();
  if (offer.kind === "stale") {
    say(`Discarded an unfinished run from v${offer.version} — its questions were a different set.`);
    await clearCheckpoint();
    return [];
  }
  if (offer.kind === "none")
    return [];
  const found = describeCheckpoint(offer.checkpoint);
  if (await prompter.confirm(`Pick up the run you left unfinished (${found})?`, true)) {
    return offer.checkpoint.entries;
  }
  await clearCheckpoint();
  return [];
}
async function chooseRepos(cli, config, answers, prompter) {
  await askPhase("discover", prompter, answers, config, ["projects-dir"]);
  const dir = cli.projectsDir ?? String(answers.projectsDir ?? config.projectsDir);
  const scans = await scanProjectsDir(dir);
  if (scans.length === 0) {
    say(`No repos or folders found one level under ${short(expandHome(dir))}.`);
    return [];
  }
  say(targetList(scans, short(expandHome(dir))));
  const picked = await prompter.pick(scans);
  say(`Configuring ${picked.length} of ${scans.length} found.`);
  await prompter.mark?.("repos", repoKey(picked));
  const login = config.identity.githubLogin ?? await githubLogin();
  const plans = [];
  for (const scan of picked) {
    plans.push(await planRepo(scan, login, answers, config, prompter));
  }
  return plans;
}
function repoKey(scans) {
  return scans.map((s) => s.path).sort().join(",");
}
async function planRepo(scan, login, answers, config, prompter) {
  const folder = scan.kind === "folder";
  const owned = folder ? true : ownsRepo(login, scan.remoteOwner);
  const perRepo = { ...answers, owned };
  if (scan.impliedProfile) {
    perRepo.workProfile = scan.impliedProfile;
    say(`  ${scan.name}: existing ${scan.existingDocs.join(", ")} — keeping that shape, not renaming.`);
  }
  if (folder) {
    perRepo.trackMode = "n/a";
    say(`  ${scan.name}: a folder, not a repo — nothing to track or exclude.`);
  }
  if (!owned) {
    perRepo.trackMode = "untracked";
    say(`  ${scan.name}: remote owner ${scan.remoteOwner ?? "unknown"} ≠ you — untracked mode.`);
  }
  const unasked = folder ? ["projects-dir", "track-mode"] : ["projects-dir"];
  await askPhase("discover", prompter, perRepo, config, undefined, unasked);
  Object.assign(answers, pickShared(perRepo));
  return {
    scan,
    workProfile: perRepo.workProfile === "folders" ? "folders" : "ledger",
    trackMode: trackModeFor(perRepo, folder),
    archiveHome: archiveFor(perRepo, scan.name),
    owned,
    proofLine: String(perRepo.proofLine ?? "").trim(),
    offLimits: String(perRepo.offLimits ?? "").trim(),
    tierCeiling: perRepo.tierCeiling === "default" || perRepo.tierCeiling === "mechanical" ? perRepo.tierCeiling : "deep"
  };
}
function trackModeFor(perRepo, folder) {
  if (folder)
    return "n/a";
  return perRepo.trackMode === "untracked" ? "untracked" : "tracked";
}
function pickShared(perRepo) {
  return {
    mode: perRepo.mode ?? "solo",
    tracker: perRepo.tracker ?? "",
    ...pickModelIds(perRepo)
  };
}
function pickModelIds(perRepo) {
  const keys = ["modelIds.default", "modelIds.mechanical", "modelIds.light"];
  return Object.fromEntries(keys.flatMap((key) => perRepo[key] === undefined ? [] : [[key, perRepo[key]]]));
}
function archiveFor(answers, repoName) {
  const raw = String(answers.archiveHome ?? "");
  return raw.replaceAll("<repo>", repoName);
}
async function planEverything(config, answers, repos) {
  const merged = { ...config, answers, models: modelsFrom(answers, config) };
  const targets = repos.length > 0 ? repos : [null];
  const contexts = await Promise.all(targets.map((repo) => contextFor(merged, answers, repo)));
  const planned2 = (await Promise.all(contexts.map(renderAll))).flat();
  return resolvePlan(dedupe(planned2));
}
async function contextFor(merged, answers, repo) {
  const forTarget = targetAnswers(answers, repo);
  const config = repo ? { ...merged, archiveHome: repo.archiveHome, answers: forTarget } : merged;
  const stamp = {
    version: await version(),
    date: today(),
    configHash: await configHash(config),
    standardVersion: await standardVersion(),
    adapted: false
  };
  return { config, answers: forTarget, stamp, date: today(), repo };
}
function dedupe(files) {
  const seen = new Set;
  return files.filter((file) => {
    if (seen.has(file.path))
      return false;
    seen.add(file.path);
    return true;
  });
}
function modelsFrom(answers, config) {
  return {
    deep: String(answers["models.deep"] ?? config.models.deep),
    default: String(answers["models.default"] ?? config.models.default),
    fast: String(answers["models.fast"] ?? config.models.fast),
    light: String(answers["models.light"] ?? config.models.light)
  };
}
async function checkTierCeilingOverrides(changes) {
  const global = await savedUserConfig();
  const globalModels = global.models;
  if (!globalModels)
    return null;
  const hasMismatch = changes.some((change) => {
    if (!change.file.path.includes(".claude/settings.local.json"))
      return false;
    const globalDeep = globalModels.deep;
    return globalDeep && globalDeep.length > 0;
  });
  if (!hasMismatch)
    return null;
  return [
    `
⚠️  Tier ceiling override detected:`,
    "Your global `~/.claude/settings.json` has a Deep model configured.",
    "This will silently override the tier ceilings in any repo that sets them.",
    "To enforce the ceilings, remove the Deep model from your global settings.json or adjust your model assignments.",
    ""
  ].join(`
`);
}
async function finish2(cli, changes, prompter) {
  const real = changes.filter(willWrite);
  const guarded = changes.filter((c) => c.guard === "no-stamp");
  say(`
This run would write:
`);
  say(previewTree(changes));
  const current = changes.length - real.length - guarded.length;
  say(`
${real.length} file(s) to write, ${current} already current.`);
  if (guarded.length > 0)
    say(leftAlone(guarded));
  const ceilingWarning = await checkTierCeilingOverrides(changes);
  if (ceilingWarning)
    say(ceilingWarning);
  if (cli.dryRun) {
    say(`
--dry-run: nothing was written.`);
    return endRun("dry-run");
  }
  if (real.length === 0) {
    say(guarded.length > 0 ? `
Nothing left to write.` : `
Everything is already current.`);
    return endRun("already-current");
  }
  if (!await confirmBatch(cli, real, prompter)) {
    say(cancelMessage());
    const hookHelp = declinedHookHelp(changes.map((c) => c.file.path));
    if (hookHelp !== null)
      say(hookHelp);
    return endRun("declined");
  }
  const result = await commitPlan(changes);
  say(`
Wrote ${result.written.length} file(s).`);
  if (result.manifest) {
    say(`Backed up ${result.manifest.entries.length} overwritten file(s) — \`personal-config undo\` restores them.`);
  }
  await copyPart0(changes);
  return endRun("written");
}
async function endRun(outcome) {
  if (retiresCheckpoint(outcome))
    await clearCheckpoint();
  return 0;
}
function leftAlone(guarded) {
  return [
    `
${guarded.length} file(s) left alone — no stamp, so this tool did not write them:`,
    ...guarded.map((c) => `  ${short(c.file.path)}`),
    "Delete one to have it generated fresh; leave it and no re-run will touch it."
  ].join(`
`);
}
async function confirmBatch(cli, real, prompter) {
  if (cli.force || process.stdin.isTTY !== true)
    return true;
  const seeDiffs = await prompter.confirm("Show the per-file diff first?", false);
  if (seeDiffs) {
    for (const change of real) {
      p2.note(renderDiff(change), short(change.file.path));
    }
  }
  return prompter.confirm(`Write these ${real.length} file(s)?`, true);
}
async function copyPart0(changes) {
  const part0 = changes.find((c) => c.file.path.endsWith("PART0-PROMPT.md"));
  if (!part0)
    return;
  try {
    await toClipboard(part0.after);
    say(`
${short(part0.file.path)} is on your clipboard — paste it into a fresh session in that repo.`);
  } catch {
    say(`
Paste ${short(part0.file.path)} into a fresh session in that repo.`);
  }
}
async function toClipboard(text2) {
  const proc = spawn("pbcopy", { stdio: ["pipe", "ignore", "ignore"] });
  const finished = new Promise((resolve2, reject) => {
    proc.on("error", reject);
    proc.on("close", (code) => code === 0 ? resolve2() : reject(new Error(`pbcopy exited ${code}`)));
  });
  proc.stdin?.end(text2);
  await finished;
}

// src/commands/undo.ts
async function runUndo(prompter = clackPrompter()) {
  const backup = await latestBackup();
  if (!backup || backup.manifest.entries.length === 0) {
    say("No backup to restore — the last run overwrote nothing.");
    return 0;
  }
  if (backup.restoredAt !== null) {
    say(alreadySpent(backup));
    return 1;
  }
  say(preview4(backup));
  if (!await confirmed(prompter, backup)) {
    say(`
Nothing was restored.`);
    return 0;
  }
  say(report5(backup, await restore(backup)));
  return 0;
}
function preview4(backup) {
  return [
    `
The backup taken at ${backup.manifest.timestamp} holds ${backup.manifest.entries.length} file(s):`,
    ...backup.manifest.entries.map((entry) => `  ${short(entry.original)}`),
    "\nRestoring is one-way: `undo` keeps no backup of its own, so anything changed in those",
    "files since that run is overwritten and gone."
  ].join(`
`);
}
async function confirmed(prompter, backup) {
  if (process.stdin.isTTY !== true)
    return true;
  return prompter.confirm(`Restore these ${backup.manifest.entries.length} file(s)?`, true);
}
function alreadySpent(backup) {
  return [
    `That backup has already been restored, at ${backup.restoredAt}:`,
    `  ${short(backup.dir)}`,
    "\n`undo` restores a backup once. Applying it again would write those files over whatever",
    "has changed since, and there is no backup of that. Nothing was restored."
  ].join(`
`);
}
function report5(backup, restored) {
  return [
    `
Restored ${restored.length} file(s) from the backup taken at ${backup.manifest.timestamp}:`,
    ...restored.map((path) => `  ${short(path)}`),
    `
Files this tool created new were not deleted — remove any you do not want.`
  ].join(`
`);
}

// src/commands/upgrade.ts
import { join as join30, relative as relative4 } from "node:path";

// src/doctor/rules/ignored.ts
import { join as join27, relative as relative3 } from "node:path";
var PERSONAL = [".personal-config.json", "PART0-PROMPT.md", "UPGRADE-PROMPT.md"];
async function ignoredFiles(repoRoot2, extra = []) {
  const wanted = [...PERSONAL, ...extra];
  const present = await Promise.all(wanted.map(async (name) => await exists(join27(repoRoot2, name)) ? name : null));
  const candidates = present.filter((name) => name !== null);
  const covered = await Promise.all(candidates.map((name) => isIgnored(repoRoot2, name)));
  return candidates.filter((_, i) => !covered[i]).map((name) => ({
    rule: "ignored",
    standardId: null,
    file: join27(repoRoot2, name),
    line: 1,
    message: `personal file is not covered by .gitignore or .git/info/exclude`,
    fixable: true
  }));
}
async function ignoreTarget(repoRoot2) {
  const mode = await readTrackMode(repoRoot2);
  return mode === "tracked" ? join27(repoRoot2, ".gitignore") : excludeFile(repoRoot2);
}
function ignoreFix(repoRoot2, target, findings) {
  const lines = findings.map((f) => `/${relative3(repoRoot2, f.file)}`);
  return {
    path: target,
    contents: `${lines.join(`
`)}
`,
    label: "ignore entries",
    strategy: "append-lines"
  };
}

// src/doctor/rules/unstamped-adaptation.ts
var HEADER = /^\*\*Adapted to this repo\b/;
var NAMED_VERSION = /\bstandard\b[^\n]*?(?:\bversion:?\s*v?|\bv)(\d+\.\d+\.\d+)\b/i;
var PREAMBLE_LIMIT = 120;
var UNSTAMPED_ADAPTATION = "unstamped-adaptation";
var unstampedAdaptation = {
  id: UNSTAMPED_ADAPTATION,
  standardId: "§0.7",
  appliesTo: () => true,
  check(doc) {
    if (readStamp(doc.text) !== null)
      return [];
    const header2 = eachLine(doc.text).find(({ text: text2 }) => HEADER.test(text2));
    if (!header2)
      return [];
    return [
      {
        rule: UNSTAMPED_ADAPTATION,
        standardId: "§0.7",
        file: doc.path,
        line: header2.line,
        message: messageFor(adaptedStandardVersion(doc.text)),
        fixable: true
      }
    ];
  }
};
function messageFor(named) {
  const from = named === "unknown" ? "from a standard version its header does not name" : `from standard v${named}`;
  return `adapted by Part 0 ${from} and carries no stamp, so nothing can report when that standard moves — \`doctor --fix\` writes an adapted stamp, which \`setup\` never overwrites`;
}
function adaptedStandardVersion(text2) {
  for (const { text: line } of preamble2(text2)) {
    const match = line.match(NAMED_VERSION);
    if (match?.[1])
      return match[1];
  }
  return "unknown";
}
function preamble2(text2) {
  const lines = eachLine(text2);
  const body = lines.findIndex(({ text: line }) => /^# Part\b/.test(line));
  return lines.slice(0, body === -1 ? PREAMBLE_LIMIT : body);
}
var UNKNOWN_HASH = "00000000";
function adaptationFix(path, text2, at) {
  const contents = stampLine({
    version: at.version,
    date: at.date,
    configHash: UNKNOWN_HASH,
    standardVersion: adaptedStandardVersion(text2),
    adapted: true
  });
  return { path, contents, label: "adapted stamp", strategy: "mark-adapted" };
}

// src/doctor/scan.ts
import { readdir as readdir6 } from "node:fs/promises";
import { basename as basename4, join as join28 } from "node:path";
function isTemplateSource(path) {
  const normalized = path.replaceAll("\\", "/");
  return normalized.startsWith("templates/") || normalized.includes("/templates/") || normalized.startsWith("standard/") || normalized.includes("/standard/") || normalized.includes(".boilerplate.");
}
function eachLine2(doc) {
  return eachLine(doc.text);
}
function proseLines2(doc) {
  return proseLines(doc.text);
}
var NAMES = [
  [/^HANDOFF\.md$/, "ledger"],
  [/^PASSOFF\.md$/, "board"],
  [/^AGENT-PRACTICES(\.local|\.boilerplate|\.short)?\.md$/, "standard"],
  [/^agent-practices.*\.md$/, "standard"],
  [/^conventions-.*\.md$/, "conventions"],
  [/^INDEX\.md$/, "archive-index"],
  [/^(SCOPE|DESIGN|PLAN|RUNTIME-PASS)\.md$/, "project"]
];
var IN_PROGRESS2 = /(^|\/)incomplete\/.+\.md$/;
var DOCS_INDEX = /(^|\/)docs\/README\.md$/i;
function kindOf(path, names = DEFAULT_DOC_NAMES) {
  const name = basename4(path);
  if (name === names.ledger)
    return "ledger";
  if (name === names.board)
    return "board";
  const normalized = path.replaceAll("\\", "/");
  if (IN_PROGRESS2.test(normalized))
    return "project";
  if (DOCS_INDEX.test(normalized))
    return "docs-index";
  return NAMES.find(([pattern]) => pattern.test(name))?.[1] ?? "other";
}
var SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "vendor",
  "worktrees"
]);
async function collectDocs(root, depth = 4) {
  const [paths, names] = await Promise.all([walk(root, depth), readDocNames(root)]);
  const ledgerStem = docStem(names.ledger);
  return Promise.all(paths.map(async (path) => {
    const text2 = await readText(path);
    return {
      path,
      kind: kindOf(path, names),
      text: text2,
      lines: text2.split(`
`),
      isTemplate: isTemplateSource(path),
      ledgerStem
    };
  }));
}
async function walk(dir, depth) {
  if (depth < 0)
    return [];
  const entries = await readdir6(dir, { withFileTypes: true }).catch(() => []);
  const found = [];
  for (const entry of entries) {
    const path = join28(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name))
        found.push(...await walk(path, depth - 1));
    } else if (entry.name.endsWith(".md")) {
      found.push(path);
    }
  }
  return found;
}
function stripMentions(text2) {
  return text2.replaceAll(/`[^`]*`/g, "").replaceAll(/"[\w -]{1,20}"/g, "");
}

// src/lib/semver.ts
function parseVersion(text2) {
  const match = text2.trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (!match)
    return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}
function compareVersions(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (left === null || right === null)
    return null;
  for (let i = 0;i < 3; i += 1) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0)
      return difference;
  }
  return 0;
}
function isOlder(a, b) {
  const order = compareVersions(a, b);
  return order !== null && order < 0;
}
function versionsBetween(versions, from, to) {
  return versions.filter((v) => isOlder(from, v) && !isOlder(to, v)).sort((a, b) => compareVersions(b, a) ?? 0);
}

// src/lib/changelog.ts
var ENTRY2 = /^## (\S+) — (\d{4}-\d{2}-\d{2})\s*$/;
function parseChangelog(text2) {
  const lines = text2.split(`
`);
  const headings = proseLines(text2).filter(({ text: line }) => /^## /.test(line));
  return headings.flatMap((heading, index) => {
    const match = heading.text.match(ENTRY2);
    if (!match?.[1] || !match[2])
      return [];
    const end = headings[index + 1]?.line ?? lines.length + 1;
    const body = lines.slice(heading.line, end - 1).join(`
`);
    return [{ version: match[1], date: match[2], body: trimBlankLines(body) }];
  });
}
function entriesBetween(entries, from, to) {
  const wanted = versionsBetween(entries.map((entry) => entry.version), from, to);
  return wanted.flatMap((version2) => entries.filter((entry) => entry.version === version2));
}
function trimBlankLines(text2) {
  return text2.replace(/^\s*\n/, "").replace(/\s+$/, "");
}

// src/lib/upgrade.ts
function assess(stamped, installed, entries) {
  if (stamped === "unknown")
    return { kind: "unnamed" };
  const order = compareVersions(stamped, installed);
  if (order === null)
    return { kind: "unreadable", from: stamped };
  if (order === 0)
    return { kind: "current", version: installed };
  if (order > 0)
    return { kind: "ahead", from: stamped, to: installed };
  return {
    kind: "behind",
    from: stamped,
    to: installed,
    entries: entriesBetween(entries, stamped, installed)
  };
}
function isFailure(verdict) {
  return verdict.kind === "ahead" || verdict.kind === "unreadable";
}
function verdictLine(path, verdict) {
  switch (verdict.kind) {
    case "current":
      return `${path} — adapted from standard v${verdict.version}, which is the installed one. Nothing to do.`;
    case "behind":
      return `${path} — adapted from standard v${verdict.from}; v${verdict.to} is installed. ${entryCount(verdict.entries.length)}`;
    case "ahead":
      return `${path} — adapted from standard v${verdict.from}, newer than the v${verdict.to} this copy of personal-config ships. Update the package (\`npm install -g personal-config@latest\`, or clear the \`npx\` cache) and run this again; reading the changelog backwards would tell you to undo a change.`;
    case "unnamed":
      return `${path} — adapted, but its stamp names no standard version. Write the one it was adapted from into the stamp as \`standard v<x>\` and run this again.`;
    case "unreadable":
      return `${path} — adapted from standard v${verdict.from}, which is not a version this can compare. Correct the stamp to \`standard v<major>.<minor>.<patch>\`.`;
  }
}
function entryCount(count) {
  if (count === 0) {
    return "The standard's changelog has no entry between the two — it is missing one, so nothing below says what changed.";
  }
  return count === 1 ? "One changelog entry between:" : `${count} changelog entries between:`;
}
function entriesText(entries, level = "##") {
  return entries.map((entry) => `${level} ${entry.version} — ${entry.date}

${entry.body}`).join(`

`);
}

// src/render/upgrade-prompt.ts
import { basename as basename5, join as join29, resolve as resolve2 } from "node:path";
var UPGRADE_PROMPT = "UPGRADE-PROMPT.md";
function renderUpgradePrompt(ctx, root, behind) {
  const body = [
    `# Upgrade the adapted standard — ${basename5(resolve2(root))}`,
    "",
    `Written by \`personal-config upgrade --write\` on ${ctx.date}. Hand it to a fresh session in`,
    'this repo — paste it, or say "read UPGRADE-PROMPT.md and do what it asks". Delete it once the',
    "work is recorded.",
    "",
    ...behind.flatMap(section2),
    "## How to apply it",
    "",
    ...steps(behind)
  ].join(`
`);
  return planned(ctx, join29(root, UPGRADE_PROMPT), "upgrade prompt", `${body}
`);
}
function section2(item) {
  return [
    `## \`${item.path}\` — v${item.from} to v${item.to}`,
    "",
    `This file was adapted from standard v${item.from}. The installed standard is v${item.to}.`,
    "Below is the standard's own changelog for every version after the first, up to and",
    "including the second, newest first — as shipped in `standard/CHANGELOG.md` of the",
    "personal-config package that wrote this file.",
    "",
    item.entries.length === 0 ? "_The changelog has no entry between these versions. It is missing one, so ask the owner what changed rather than guessing from the boilerplate._" : entriesText(item.entries, "###"),
    ""
  ];
}
function steps(behind) {
  const files = behind.map((item) => `\`${item.path}\``).join(" and ");
  const bumps = behind.map((item) => `   - in \`${item.path}\`: \`standard v${item.from}\` becomes \`standard v${item.to}\``);
  return [
    `1. Read ${files} in full, then the entries above **oldest first** —`,
    "   each one assumes the ones before it.",
    "2. Make each change in the adapted file the way Part 0 made the rest of it: fill what the",
    "   entry names from this repo, cut what does not apply here, and keep this repo's own names",
    "   and citations. Where an entry changes something this repo already cut, say so in the",
    "   ledger step and move on.",
    "3. Do not replace the file with the new boilerplate. It is this repo's document; the",
    "   changelog says what moved, and the adaptation is exactly what a copy would lose.",
    "4. When every entry is applied, edit the stamp line at the top of the file, keeping",
    "   ` · adapted` on the end — that edit is what tells `personal-config doctor` the upgrade",
    "   happened:",
    ...bumps,
    "5. Record it as one ledger step naming each version applied, then delete this file.",
    "",
    "Done when `personal-config doctor` reports no advisory finding on the adapted file, and",
    "`personal-config upgrade` says there is nothing to do."
  ];
}

// src/commands/upgrade.ts
var SCOPE_NOTE = "This covers the adapted standard only. `personal-config doctor` reports the generated files a `setup` re-run would change.";
async function runUpgrade(cli) {
  const roots = cli.paths.length > 0 ? cli.paths.map(expandHome) : [process.cwd()];
  const installed = {
    version: await standardVersion(),
    entries: parseChangelog(await readText(join30(repoRoot(), "standard", "CHANGELOG.md")))
  };
  let code = 0;
  for (const root of roots)
    code = Math.max(code, await upgradeOne(cli, root, installed));
  return code;
}
async function upgradeOne(cli, root, installed) {
  say(`
${short(root)}`);
  const standards = await standardDocs(root);
  const adapted = standards.filter((doc) => readStamp(doc.text)?.adapted === true);
  if (adapted.length === 0) {
    say(`  ${notAdapted(root, standards)}`);
    return 0;
  }
  const verdicts = adapted.map((doc) => ({
    path: relative4(root, doc.path),
    verdict: assess(readStamp(doc.text)?.standardVersion ?? "", installed.version, installed.entries)
  }));
  for (const { path, verdict } of verdicts)
    report6(path, verdict);
  const behind = verdicts.flatMap(({ path, verdict }) => verdict.kind === "behind" ? [{ path, ...verdict }] : []);
  const wrote = behind.length > 0 && cli.write ? await writePrompt(cli, root, behind) : 0;
  if (behind.length > 0 && !cli.write) {
    say(`
Run with --write to save this as ${UPGRADE_PROMPT} at the repo root, for a fresh session to act on.`);
  }
  say(`
${SCOPE_NOTE}`);
  return Math.max(wrote, verdicts.some(({ verdict }) => isFailure(verdict)) ? 1 : 0);
}
async function standardDocs(root) {
  const docs = await collectDocs(root);
  return docs.filter((doc) => doc.kind === "standard" && !doc.isTemplate);
}
function notAdapted(root, standards) {
  const unstamped = standards.find((doc) => unstampedAdaptation.check(doc).length > 0);
  if (unstamped) {
    return `${relative4(root, unstamped.path)} was adapted by Part 0 but carries no stamp, so its version cannot be read. \`personal-config doctor --fix\` writes one; then run this again.`;
  }
  if (standards.some((doc) => readStamp(doc.text) !== null)) {
    return "No adapted standard here — the standard is still the one `setup` wrote, so re-running `setup` brings it up to date. `personal-config doctor` says whether it is behind.";
  }
  return "No adapted standard here — nothing carries a standard stamp marked ` · adapted`, so there is nothing for `upgrade` to compare.";
}
function report6(path, verdict) {
  say(`  ${verdictLine(path, verdict)}`);
  if (verdict.kind === "behind" && verdict.entries.length > 0) {
    say(`
${entriesText(verdict.entries)}`);
  }
}
async function writePrompt(cli, root, behind) {
  const ctx = await promptContext(cli, root);
  const files = [renderUpgradePrompt(ctx, root, behind)];
  if (await isGitRepo(root) && !await isIgnored(root, UPGRADE_PROMPT)) {
    files.push(planned(ctx, await ignoreTarget(root), "ignore entries", `/${UPGRADE_PROMPT}
`, {
      strategy: "append-lines",
      stamp: false
    }));
  }
  const changes = await resolvePlan(files);
  say(`
${preview5(changes)}`);
  return commitIfConfirmed(cli, changes);
}
async function commitIfConfirmed(cli, changes) {
  if (changes.some((change) => change.guard !== "none")) {
    say(`
${UPGRADE_PROMPT} is already there and this tool did not write it. Move it aside and run this again.`);
    return 1;
  }
  if (!changes.some(willWrite)) {
    say(`
${UPGRADE_PROMPT} already says this. Nothing to write.`);
    return 0;
  }
  if (cli.dryRun) {
    say(`
--dry-run: nothing was written.`);
    return 0;
  }
  if (!await confirmWrite(`Write ${UPGRADE_PROMPT}?`, cli.force)) {
    say("Nothing was written.");
    return 0;
  }
  const result = await commitPlan(changes);
  say(`
Wrote ${result.written.length} file(s).`);
  if (result.manifest)
    say("`personal-config undo` restores what was there before.");
  return 0;
}
async function promptContext(cli, root) {
  const config = await loadConfig(cli, root);
  const date = today();
  return {
    config,
    answers: config.answers,
    date,
    repo: null,
    stamp: {
      version: await version(),
      date,
      configHash: await configHash(config),
      standardVersion: await standardVersion(),
      adapted: false
    }
  };
}
function preview5(changes) {
  const real = changes.filter(willWrite);
  if (real.length === 0)
    return previewTree(changes);
  return [previewTree(changes), ...real.map((change) => `
${renderDiff(change)}`)].join(`
`);
}

// src/commands/worktree.ts
import { basename as basename6, resolve as resolve3 } from "node:path";

// src/lib/recipe.ts
var HEADING = "## The fresh-checkout recipe";
var UNFILLED = "{{WORKTREE_SETUP}}";
function recipeBlocks(markdown) {
  const body = sectionBody(markdown);
  if (body === null)
    return [];
  const fences = [...body.matchAll(/```[a-z]*\n([\s\S]*?)```/g)];
  return fences.map((match) => (match[1] ?? "").trim()).filter((block) => block !== "");
}
function sectionBody(markdown) {
  const lines = markdown.split(`
`);
  const start = lines.findIndex((line) => line.startsWith(HEADING));
  if (start === -1)
    return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? rest : rest.slice(0, end)).join(`
`);
}
function fillWorktree(block, path) {
  return block.replaceAll("<worktree>", path);
}

// src/commands/worktree.ts
var DEFAULT_PATH = "../<repo>-<lane>";
async function runWorktree(cli) {
  const root = process.cwd();
  const lane = cli.paths[0];
  if (lane === undefined)
    return refuse6("usage: personal-config worktree <lane>");
  if (!await isGitRepo(root))
    return refuse6(`${short(root)} is not a git repository.`);
  const found = await findStandard(root);
  if (!found.ok)
    return refuse6(found.reason);
  const blocks = recipeBlocks(found.standard.text);
  const problem2 = recipeProblem(blocks, found.standard.path);
  if (problem2 !== null)
    return refuse6(problem2);
  const template2 = await readWorktreePath(root) ?? DEFAULT_PATH;
  printPlan(lane, resolve3(root, fill2(template2, basename6(root), lane)), blocks, found.standard);
  return 0;
}
async function findStandard(root) {
  const relative5 = await readStandardPath(root);
  if (relative5 === null) {
    return {
      ok: false,
      reason: [
        `${short(root)} has no .personal-config.json recording where its adapted standard lives.`,
        "Run `personal-config setup` in this repo first."
      ].join(`
`)
    };
  }
  const path = resolve3(root, relative5);
  const text2 = await readText(path).catch(() => null);
  if (text2 === null) {
    return {
      ok: false,
      reason: `${short(path)} is recorded as this repo's standard, but nothing is there.`
    };
  }
  return { ok: true, standard: { path, text: text2 } };
}
function recipeProblem(blocks, path) {
  if (blocks.length === 0) {
    return [
      `${short(path)} has no "## The fresh-checkout recipe" section.`,
      "It predates Part 6 of the standard, or it is not the standard."
    ].join(`
`);
  }
  if (blocks.some((block) => block.includes(UNFILLED))) {
    return [
      `${short(path)} still carries the unfilled ${UNFILLED} placeholder.`,
      "Part 0 fills it from what .gitignore hides and what the toolchain generates;",
      "until it does, there is no recipe here to run."
    ].join(`
`);
  }
  return null;
}
function fill2(template2, repo, lane) {
  return template2.replaceAll("<repo>", repo).replaceAll("<lane>", lane);
}
function printPlan(lane, path, blocks, standard) {
  say(`lane ${lane} → ${short(path)}
`);
  say(`  git worktree add ${short(path)} -b ${lane}
`);
  say(`Then, inside it — the fresh-checkout recipe from ${short(standard.path)}:
`);
  for (const block of blocks)
    say(`${indent(fillWorktree(block, short(path)))}
`);
  say("Run every one of these before believing any gate in that worktree: a fresh checkout");
  say("fails gates for environmental reasons before it fails a real one (standard, Part 6).");
}
function indent(block) {
  return block.split(`
`).map((line) => `  ${line}`).join(`
`);
}
function refuse6(message) {
  say(message);
  return 1;
}

// src/doctor/index.ts
import { readdir as readdir8 } from "node:fs/promises";
import { join as join33 } from "node:path";

// src/doctor/rerender.ts
import { basename as basename7, resolve as resolve4 } from "node:path";
async function rerender(root, config, docs) {
  const stamps = plainStamps(docs);
  if (stamps.size === 0)
    return () => null;
  const repo = await recordedPlan(root, config);
  const byStamp = new Map;
  for (const [key, stamp] of stamps)
    byStamp.set(key, await renderAt(config, repo, stamp));
  return (doc) => {
    const stamp = readStamp(doc.text);
    if (stamp === null || stamp.adapted)
      return null;
    return byStamp.get(stampKey(stamp))?.get(resolve4(doc.path)) ?? null;
  };
}
function plainStamps(docs) {
  const found = new Map;
  for (const doc of docs) {
    const stamp = readStamp(doc.text);
    if (stamp !== null && !stamp.adapted)
      found.set(stampKey(stamp), stamp);
  }
  return found;
}
function stampKey(stamp) {
  return [stamp.version, stamp.date, stamp.configHash, stamp.standardVersion].join(" ");
}
async function renderAt(config, repo, stamp) {
  const answers = targetAnswers(config.answers, repo);
  const ctx = {
    config: { ...config, answers },
    answers,
    stamp,
    date: stamp.date,
    repo
  };
  const files = await renderAll(ctx);
  return new Map(files.filter(isCompared).map((file) => [file.path, file.contents]));
}
function isCompared(file) {
  return file.path.endsWith(".md") && basename7(file.path) !== "PART0-PROMPT.md";
}
async function recordedPlan(root, config) {
  const path = resolve4(root);
  const kind = await isGitRepo(path) ? "git" : "folder";
  const [scan, workProfile, trackMode] = await Promise.all([
    scanRepo(path, kind),
    readWorkProfile(root),
    readRecordedTrackMode(root)
  ]);
  const ceiling = config.answers.tierCeiling;
  return {
    scan,
    workProfile: workProfile ?? "ledger",
    trackMode: trackMode ?? (kind === "folder" ? "n/a" : "untracked"),
    archiveHome: config.archiveHome,
    owned: true,
    proofLine: String(config.answers.proofLine ?? "").trim(),
    offLimits: String(config.answers.offLimits ?? "").trim(),
    tierCeiling: ceiling === "default" || ceiling === "mechanical" ? ceiling : "deep"
  };
}

// src/doctor/rules/absence-evidence.ts
var ABSENCE = /\b(there is no|nothing does)\b/i;
var EVIDENCE = /`[^`]*\b(grep|rg|ripgrep|ag|ast-grep|find|git|ls|select|query|psql|sqlite3)\b[^`]*`/i;
var absenceEvidence = {
  id: "absence-evidence",
  standardId: "R4",
  appliesTo: (doc) => doc.kind !== "other",
  check(doc) {
    return proseLines2(doc).filter(({ text: text2 }) => !isQuotation(text2)).filter(({ text: text2 }) => ABSENCE.test(stripMentions(text2))).filter(({ text: text2, line }) => !EVIDENCE.test(text2) && !EVIDENCE.test(nextNonEmpty(doc, line))).map(({ text: text2, line }) => ({
      rule: "absence-evidence",
      standardId: "R4",
      file: doc.path,
      line,
      message: `"${stripMentions(text2).match(ABSENCE)?.[0]}" with no search beside it — R4 asks for the grep or query that produced the absence`,
      fixable: false
    }));
  }
};
function isQuotation(text2) {
  return text2.trimStart().startsWith(">");
}
function nextNonEmpty(doc, line) {
  return doc.lines.slice(line).find((text2) => text2.trim() !== "") ?? "";
}

// src/doctor/rules/archive-index.ts
import { readdir as readdir7 } from "node:fs/promises";
import { dirname as dirname4 } from "node:path";
var archiveIndex = {
  id: "archive-index",
  standardId: "§8.2",
  appliesTo: (doc) => doc.kind === "archive-index",
  async check(doc) {
    const root = dirname4(doc.path);
    const onDisk = await folders(root);
    const cited = citedFolders(doc);
    return [
      ...[...cited].filter(([name]) => !onDisk.has(name)).map(([name, line]) => finding(doc, line, `index cites \`${name}/\`, which is not in ${root}`)),
      ...[...onDisk].filter((name) => !cited.has(name)).map((name) => finding(doc, 1, `\`${name}/\` exists but has no line in this index`))
    ];
  }
};
async function folders(root) {
  const entries = await readdir7(root, { withFileTypes: true }).catch(() => []);
  return new Set(entries.filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name));
}
function citedFolders(doc) {
  const found = new Map;
  for (const { text: text2, line } of proseLines2(doc)) {
    const match = text2.match(/^\s*[-*]\s+\*\*([^*/]+)\/\*\*/);
    const name = match?.[1];
    if (name && !found.has(name))
      found.set(name, line);
  }
  return found;
}
function finding(doc, line, message) {
  return {
    rule: "archive-index",
    standardId: "§8.2",
    file: doc.path,
    line,
    message,
    fixable: false
  };
}

// src/doctor/rules/archived-citations.ts
import { basename as basename8 } from "node:path";
function archivedCitations(docs, archived2) {
  if (archived2.names.length === 0)
    return [];
  const names = new Set(archived2.names.map((n) => basename8(n)));
  return docs.filter((doc) => !archived2.dirs.some((dir) => doc.path.startsWith(`${dir}/`))).flatMap((doc) => proseLines2(doc).filter(({ text: text2 }) => [...names].some((name) => text2.includes(name))).map(({ text: text2, line }) => ({
    rule: "archived-citations",
    standardId: "§7",
    file: doc.path,
    line,
    message: `cites \`${[...names].find((n) => text2.includes(n))}\`, which now lives in the archive`,
    fixable: false
  })));
}

// src/doctor/rules/board-status.ts
import { readFileSync } from "node:fs";
import { dirname as dirname5, join as join31 } from "node:path";
var boardStatus = {
  id: "board-status",
  standardId: "§2.3",
  appliesTo: (doc) => doc.kind === "board",
  check(doc) {
    const board = parseBoard(doc.text);
    if (!board)
      return [];
    const steps2 = ledgerNumbers(doc);
    return board.rows.flatMap((row) => checkRow(doc, board, row, steps2));
  }
};
var STANDALONE = new Set(["OPEN", "IN FLIGHT", "HELD", "SETTLED AS NO", "SUPERSEDED"]);
function checkRow(doc, board, row, steps2) {
  const problem2 = rowProblem(doc, board, row, steps2);
  return problem2 === null ? [] : [finding2(doc, row.line, problem2)];
}
function rowProblem(doc, board, row, steps2) {
  const status = row.status;
  if (status.startsWith("DONE"))
    return doneProblem(doc, status, steps2);
  if (!STANDALONE.has(status))
    return unknownMessage(status);
  if (status === "HELD")
    return heldProblem(board, row);
  if (status === "SUPERSEDED")
    return supersededProblem(doc, board, row);
  if (status === "SETTLED AS NO")
    return settledProblem(doc, row);
  return null;
}
function unknownMessage(status) {
  const seen = status === "" ? "this row carries no status" : `\`${status}\` is not a status word`;
  return `${seen} — §2.3 allows OPEN, IN FLIGHT, DONE — <ledger step>, HELD, SETTLED AS NO, SUPERSEDED, and no others`;
}
function doneProblem(doc, status, steps2) {
  const cited = citedStep(status, doc.ledgerStem);
  if (cited === null) {
    return `\`DONE\` must point at the ledger step — write \`DONE — ${doc.ledgerStem} <n>\``;
  }
  if (!cited.ours || steps2 === null || steps2.size === 0 || steps2.has(cited.step))
    return null;
  const highest = Math.max(...steps2);
  return `\`DONE — ${doc.ledgerStem} ${cited.step}\` cites a step the ledger does not have — its log ends at ${highest}`;
}
function citedStep(status, stem) {
  const cited = status.match(new RegExp(`(\\w+\\s+)?${escaped(stem)}\\s+(\\d+)`, "i"));
  if (!cited)
    return null;
  return { step: Number(cited[2]), ours: cited[1] === undefined };
}
var NAMES_SOMETHING = /\d|\/|\.\w/;
function heldProblem(board, row) {
  const cell = stripTypography(cellAt(row.cells, board.columns.waitsOn));
  if (!isEmptyCell(cell) && NAMES_SOMETHING.test(cell))
    return null;
  return '`HELD` must name what it waits on in the "Waits on" column — a row number, or the artifact an external dependency turns on';
}
function supersededProblem(doc, board, row) {
  const elsewhere = row.cells.filter((_, index) => index !== board.columns.status && index !== board.columns.task);
  const named = [...elsewhere, sectionBody2(doc, row.number)].join(" ");
  return /supersed|replac/i.test(named) ? null : "`SUPERSEDED` must name what replaced it";
}
function settledProblem(doc, row) {
  if (row.number.trim() === "")
    return null;
  const body = sectionBody2(doc, row.number);
  if (!/\d{4}-\d{2}-\d{2}/.test(body)) {
    return "`SETTLED AS NO` must carry its reason in a dated paragraph below the board, so it is not re-proposed";
  }
  if (explains(body))
    return null;
  return "`SETTLED AS NO`'s paragraph must say why the answer was no — a date and an item number is a stamp, not a reason";
}
var REASON_WORDS = 6;
function explains(body) {
  const prose = body.replaceAll(/`[^`]*`/g, " ").replaceAll(/\d{4}-\d{2}-\d{2}/g, " ").replaceAll(/\b(SETTLED AS NO|SUPERSEDED|IN FLIGHT|OPEN|HELD|DONE|item|row)\b/gi, " ").replaceAll(/[^A-Za-z]+/g, " ");
  return prose.split(" ").filter((word) => word.length > 2).length >= REASON_WORDS;
}
function sectionBody2(doc, item) {
  if (item.trim() === "")
    return "";
  return numberedSection(doc.text, item)?.body ?? "";
}
function ledgerNumbers(doc) {
  const text2 = readLedger(join31(dirname5(doc.path), `${doc.ledgerStem}.md`));
  return text2 === null ? null : new Set(ledgerSteps(text2).map((step) => step.number));
}
function readLedger(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}
function finding2(doc, line, message) {
  return {
    rule: "board-status",
    standardId: "§2.3",
    file: doc.path,
    line,
    message,
    fixable: false
  };
}

// src/doctor/rules/placeholders.ts
var placeholders3 = {
  id: "placeholders",
  standardId: "§0.3",
  appliesTo: (doc) => doc.kind !== "other",
  check(doc) {
    const appendixA = doc.text.indexOf("# Appendix A");
    const boilerplate2 = doc.path.includes("boilerplate");
    return proseLines2(doc).filter(({ text: text2 }) => /\{\{\w+\}\}/.test(stripMentions(text2))).filter(({ line }) => !boilerplate2 && !inAppendixA(doc, line, appendixA)).map(({ text: text2, line }) => ({
      rule: "placeholders",
      standardId: "§0.3",
      file: doc.path,
      line,
      message: `unfilled placeholder ${stripMentions(text2).match(/\{\{\w+\}\}/)?.[0]} outside Appendix A`,
      fixable: false
    }));
  }
};
function inAppendixA(doc, line, appendixStart) {
  if (appendixStart === -1)
    return false;
  const offset = doc.lines.slice(0, line - 1).join(`
`).length;
  return offset >= appendixStart;
}

// src/doctor/rules/relative-dates.ts
var PATTERN2 = /\b(today|yesterday|tomorrow|recently|currently|last (?:week|month|year)|this (?:week|month|year)|(?:days|weeks|months) ago)\b/i;
var relativeDates = {
  id: "relative-dates",
  standardId: "R1",
  appliesTo: (doc) => doc.kind !== "other",
  check(doc) {
    return eachLine2(doc).filter(({ text: text2 }) => PATTERN2.test(stripMentions(text2))).map(({ text: text2, line }) => ({
      rule: "relative-dates",
      standardId: "R1",
      file: doc.path,
      line,
      message: `relative date "${stripMentions(text2).match(PATTERN2)?.[0]}" — use an absolute date (YYYY-MM-DD)`,
      fixable: false
    }));
  }
};

// src/doctor/rules/settled-supersession.ts
import { join as join32 } from "node:path";
var SETTLED = /^(#{2,6})\s+Settled\b/i;
var HEADING2 = /^#{1,6}\s/;
var SUPERSESSION = /supersed/i;
async function settledSupersession(root, docs) {
  const diff = await diffAgainstHead(root);
  if (!diff)
    return [];
  return parseDiff(diff).filter((file) => !file.supersedes).flatMap((file) => {
    const doc = docs.find((candidate) => candidate.path === join32(root, file.path));
    return doc && !doc.isTemplate && doc.kind !== "other" ? findingsIn(doc, file.hunks) : [];
  });
}
function findingsIn(doc, hunks) {
  const ranges = settledRanges(doc);
  if (ranges.length === 0)
    return [];
  return hunks.filter((hunk) => hunk.removes).map((hunk) => Math.max(hunk.newStart, 1)).filter((line) => ranges.some(([start, end]) => line >= start && line <= end)).map((line) => ({
    rule: "settled-supersession",
    standardId: "R8",
    file: doc.path,
    line,
    message: "a Settled entry changed with no supersession in this file — R8 asks for a dated supersession naming what it replaces",
    fixable: false
  }));
}
function settledRanges(doc) {
  const headings = proseLines2(doc).filter(({ text: text2 }) => HEADING2.test(text2));
  return headings.flatMap(({ text: text2, line }, index) => {
    const level = text2.match(SETTLED)?.[1]?.length;
    if (level === undefined)
      return [];
    const next = headings.slice(index + 1).find((after) => headingLevel(after.text) <= level);
    return [[line, next ? next.line - 1 : doc.lines.length]];
  });
}
function headingLevel(text2) {
  return text2.match(/^#{1,6}/)?.[0].length ?? 0;
}
function parseDiff(text2) {
  const reader = { files: [], file: null, inHunk: false };
  for (const line of text2.split(`
`))
    read(reader, line);
  return reader.files;
}
function read(reader, line) {
  if (line.startsWith("diff --git ")) {
    reader.file = null;
    reader.inHunk = false;
  } else if (!reader.inHunk && line.startsWith("+++ ")) {
    reader.file = openFile(line);
    if (reader.file)
      reader.files.push(reader.file);
  } else if (reader.file && line.startsWith("@@")) {
    reader.inHunk = true;
    openHunk(reader.file, line);
  } else if (reader.file && reader.inHunk) {
    record(reader.file, line);
  }
}
function openFile(header2) {
  const path = header2.slice(4).trim();
  return path === "/dev/null" ? null : { path: path.replace(/^b\//, ""), hunks: [], supersedes: false };
}
function openHunk(file, header2) {
  const start = header2.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)?.[1];
  if (start !== undefined)
    file.hunks.push({ newStart: Number(start), removes: false });
}
function record(file, line) {
  if (line.startsWith("-")) {
    const hunk = file.hunks.at(-1);
    if (hunk)
      hunk.removes = true;
  } else if (line.startsWith("+") && SUPERSESSION.test(line)) {
    file.supersedes = true;
  }
}

// src/doctor/rules/stamp-drift.ts
function stampDrift(doc, expected) {
  const stamp = readStamp(doc.text);
  if (!stamp)
    return [];
  if (stamp.adapted)
    return adaptedLag(doc, stamp, expected.standardVersion);
  if (!expected.configured)
    return [];
  return [
    ...renderDrift(doc, expected.rendered),
    ...standardLag(doc, stamp, expected.standardVersion)
  ];
}
function renderDrift(doc, rendered) {
  if (rendered === null || rendered === doc.text)
    return [];
  return [
    finding3(doc, `\`setup\` would now write this file differently (${diffSummary(doc.text, rendered)}) — re-run it; or, if Part 0 rewrote this file, add \` · adapted\` to its stamp to keep it`)
  ];
}
function standardLag(doc, stamp, current) {
  if (!isOlder(stamp.standardVersion, current))
    return [];
  return [finding3(doc, `standard v${stamp.standardVersion} is behind v${current}`)];
}
function adaptedLag(doc, stamp, current) {
  if (stamp.standardVersion === "unknown") {
    return [
      advisory(doc, "adapted from a standard version the stamp does not name — write it in as `standard v<x>` so a lag can be reported")
    ];
  }
  if (!isOlder(stamp.standardVersion, current))
    return [];
  return [
    advisory(doc, `adapted from standard v${stamp.standardVersion}; v${current} is installed — \`personal-config upgrade\` prints what changed, and \`setup\` will not touch an adapted file`)
  ];
}
function finding3(doc, message) {
  return {
    rule: "stamp-drift",
    standardId: null,
    file: doc.path,
    line: 1,
    message,
    fixable: false
  };
}
function advisory(doc, message) {
  return { ...finding3(doc, message), advisory: true };
}

// src/doctor/rules/step-numbers.ts
var stepNumbers = {
  id: "step-numbers",
  standardId: "§2.1",
  appliesTo: (doc) => doc.kind === "ledger",
  check(doc) {
    const steps2 = ledgerSteps(doc.text);
    return [...duplicates(doc, steps2), ...gaps(doc, steps2)];
  }
};
function duplicates(doc, steps2) {
  return duplicateSteps(steps2).flatMap((number) => {
    const [first, ...repeats] = steps2.filter((step) => step.number === number);
    if (!first)
      return [];
    return repeats.map((step) => finding4(doc, step.line, `step ${number} is already used at line ${first.line}`));
  });
}
function gaps(doc, steps2) {
  const sorted = [...new Set(steps2.map((s) => s.number))].sort((a, b) => a - b);
  for (const [index, number] of sorted.entries()) {
    if (number !== index + 1) {
      const at = steps2.find((s) => s.number === number)?.line ?? 1;
      return [finding4(doc, at, `step ${number} is not contiguous — expected ${index + 1}`)];
    }
  }
  return [];
}
function finding4(doc, line, message) {
  return {
    rule: "step-numbers",
    standardId: "§2.1",
    file: doc.path,
    line,
    message,
    fixable: false
  };
}

// src/doctor/rules/unfolded.ts
var unfolded = {
  id: "unfolded",
  standardId: "§2.1",
  appliesTo: (doc) => doc.kind === "board" || doc.kind === "ledger",
  check(doc) {
    const fold = doc.kind === "board" ? boardFold(doc.text) : ledgerFold(doc.text, DEFAULT_KEEP, "");
    const lines = foldedLines(fold);
    return lines < THRESHOLD ? [] : [finding5(doc, fold, lines)];
  }
};
var THRESHOLD = 400;
function finding5(doc, fold, lines) {
  return {
    rule: "unfolded",
    standardId: "§2.1",
    file: doc.path,
    line: firstLine(fold),
    message: message(doc, fold, lines),
    fixable: false
  };
}
function message(doc, fold, lines) {
  const what = doc.kind === "board" ? `${fold.folded.length} closed prompt(s) still on the board` : `${fold.folded.length} step bod(ies) older than the newest ${DEFAULT_KEEP}`;
  return `${what}, ${lines} line(s) — \`personal-config fold ${doc.kind}\` moves them to the archive, keeping every ${doc.kind === "board" ? "row" : "step number, title and date"}`;
}
function firstLine(fold) {
  return fold.folded.reduce((first, block) => Math.min(first, block.start), Number.MAX_SAFE_INTEGER);
}

// src/doctor/index.ts
var DOC_RULES = [
  relativeDates,
  absenceEvidence,
  placeholders3,
  stepNumbers,
  boardStatus,
  unfolded,
  unstampedAdaptation
];
async function runDoctorOn(root, expectation) {
  const docs = await collectDocs(root);
  const fromDocs = docs.filter((doc) => !doc.isTemplate).flatMap((doc) => DOC_RULES.filter((rule) => rule.appliesTo(doc)).flatMap((rule) => rule.check(doc)));
  const fromArchive = (await Promise.all(docs.filter(archiveIndex.appliesTo).map((doc) => archiveIndex.check(doc)))).flat();
  const configured = await exists(join33(root, ".personal-config.json"));
  const fromStamps = await stampFindings(root, docs, expectation, configured);
  const fromCitations = archivedCitations(docs, await archivedInfo(docs));
  const fromIgnore = configured && await isGitRepo(root) ? await ignoredFiles(root) : [];
  const fromSettled = await settledSupersession(root, docs);
  return {
    findings: sort([
      ...fromDocs,
      ...fromArchive,
      ...fromStamps,
      ...fromCitations,
      ...fromIgnore,
      ...fromSettled
    ]),
    checked: docs.length
  };
}
async function stampFindings(root, docs, expectation, configured) {
  const render = configured ? await rerender(root, expectation.config, docs) : () => null;
  return docs.flatMap((doc) => stampDrift(doc, {
    standardVersion: expectation.standardVersion,
    rendered: render(doc),
    configured
  }));
}
async function archivedInfo(docs) {
  const dirs = docs.filter((d) => d.kind === "archive-index").map((doc) => doc.path.slice(0, doc.path.lastIndexOf("/")));
  const names = await Promise.all(dirs.map(async (dir) => {
    const entries = await readdir8(dir, { withFileTypes: true }).catch(() => []);
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }));
  return { names: names.flat(), dirs };
}
function sort(findings) {
  return [...findings].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}
async function runDoctor(cli) {
  const roots = cli.paths.length > 0 ? cli.paths.map(expandHome) : [process.cwd()];
  const standard = await standardVersion();
  let failing = 0;
  let advisory2 = 0;
  for (const root of roots) {
    const config = await loadConfig(cli, root);
    const report7 = await runDoctorOn(root, { standardVersion: standard, config });
    printReport(root, report7);
    const fixed = await fixIfAsked(cli, root, report7.findings);
    failing += report7.findings.filter((f) => !f.advisory).length - fixed;
    advisory2 += report7.findings.filter((f) => f.advisory).length;
  }
  console.log(`
${summary2(failing, advisory2)}`);
  return failing === 0 ? 0 : 1;
}
function summary2(failing, advisory2) {
  const tail = advisory2 > 0 ? `, ${advisory2} advisory` : "";
  if (failing === 0 && advisory2 === 0)
    return "doctor: no findings.";
  if (failing === 0)
    return `doctor: nothing failing; ${advisory2} advisory finding(s).`;
  return `doctor: ${failing} finding(s)${tail}.`;
}
async function fixIfAsked(cli, root, findings) {
  const fixable = findings.filter((finding6) => finding6.fixable);
  if (!cli.fix || fixable.length === 0)
    return 0;
  const fixes = await fixPlan(root, fixable);
  const described = fixes.map(describeFix).join(", ");
  if (cli.dryRun) {
    console.log(`  would fix ${fixable.length} — ${described}, but --dry-run writes nothing`);
    return 0;
  }
  const { written } = await commitPlan(await resolvePlan(fixes.map((fix) => fix.file)));
  const cleared = fixes.filter((fix) => written.includes(fix.file.path)).reduce((count, fix) => count + fix.clears.length, 0);
  if (cleared === 0)
    return 0;
  console.log(`  fixed ${cleared} — ${described}`);
  return cleared;
}
async function fixPlan(root, fixable) {
  const ignored = fixable.filter((f) => f.rule === "ignored");
  const adapted = fixable.filter((f) => f.rule === unstampedAdaptation.id);
  const fixes = [];
  if (ignored.length > 0) {
    fixes.push({ file: ignoreFix(root, await ignoreTarget(root), ignored), clears: ignored });
  }
  const at = { version: await version(), date: today() };
  for (const finding6 of adapted) {
    const file = adaptationFix(finding6.file, await readText(finding6.file), at);
    fixes.push({ file, clears: [finding6] });
  }
  return fixes;
}
function describeFix(fix) {
  const what = fix.file.strategy === "mark-adapted" ? "adapted stamp" : "ignore lines";
  return `${fix.file.path} (${what})`;
}
function printReport(root, report7) {
  console.log(`
${root} — ${report7.checked} markdown file(s) checked`);
  for (const finding6 of report7.findings) {
    const id = finding6.standardId ? ` [${finding6.standardId}]` : "";
    const tag = finding6.advisory ? " (advisory)" : "";
    console.log(`  ${finding6.file}:${finding6.line}  ${finding6.rule}${id} — ${finding6.message}${tag}`);
  }
}

// src/lib/args.ts
import { parseArgs } from "node:util";
var COMMANDS = [
  "setup",
  "catalog",
  "doctor",
  "undo",
  "archive",
  "fold",
  "passoff",
  "handoff",
  "worktree",
  "context",
  "upgrade",
  "help",
  "version"
];
var OPTIONS = {
  profile: { type: "string" },
  yes: { type: "boolean", default: false },
  "dry-run": { type: "boolean", default: false },
  force: { type: "boolean", default: false },
  fix: { type: "boolean", default: false },
  move: { type: "boolean", default: false },
  write: { type: "boolean", default: false },
  keep: { type: "string" },
  "projects-dir": { type: "string" },
  from: { type: "string" },
  sentinel: { type: "string" },
  help: { type: "boolean", default: false },
  version: { type: "boolean", default: false }
};
function parseCli(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: OPTIONS
  });
  const [first, ...rest] = positionals;
  return {
    command: resolveCommand(first, values.help === true, values.version === true),
    profile: values.profile ?? "starter",
    yes: values.yes === true,
    dryRun: values["dry-run"] === true,
    force: values.force === true,
    fix: values.fix === true,
    move: values.move === true,
    write: values.write === true,
    keep: keepValue(values.keep) ?? DEFAULT_KEEP,
    projectsDir: values["projects-dir"] ?? null,
    from: values.from ?? null,
    sentinel: values.sentinel ?? null,
    paths: rest
  };
}
function checkUsage(argv) {
  let positionals;
  try {
    positionals = parseArgs({
      args: argv,
      allowPositionals: true,
      options: OPTIONS
    }).positionals;
  } catch (error) {
    return optionProblem(error);
  }
  const [first] = positionals;
  if (first === undefined || isCommand(first))
    return keepProblem(argv);
  return commandProblem(first);
}
function keepProblem(argv) {
  const raw = parseArgs({ args: argv, allowPositionals: true, options: OPTIONS }).values.keep;
  if (raw === undefined || keepValue(raw) !== null)
    return null;
  return [
    `personal-config: --keep needs a whole number of steps, not '${raw}'`,
    "",
    "Run `personal-config --help` to see the options it takes."
  ].join(`
`);
}
function keepValue(raw) {
  if (raw === undefined)
    return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : null;
}
function optionProblem(error) {
  const text2 = error instanceof Error ? error.message : "";
  const detail = text2.split(". ")[0] ?? "";
  return [
    `personal-config: ${detail === "" ? "could not read those arguments" : detail}`,
    "",
    "Run `personal-config --help` to see the options it takes."
  ].join(`
`);
}
function commandProblem(token) {
  const runnable = COMMANDS.filter((name) => name !== "help" && name !== "version");
  return [
    `personal-config: unknown command '${token}'`,
    "",
    `Commands: ${runnable.join(", ")}`,
    "Run `personal-config --help` for what each one does."
  ].join(`
`);
}
function isCommand(value) {
  return COMMANDS.includes(value);
}
function resolveCommand(first, help, version2) {
  if (version2)
    return "version";
  if (help || first === undefined)
    return "help";
  return isCommand(first) ? first : "help";
}

// src/cli.ts
var HELP = `personal-config — set up an agent-driven working style in your repos

  personal-config setup                        ask, preview, then write
  personal-config doctor                       check what is written, against the rules it follows
  personal-config upgrade [path…]             what changed in the standard since a repo adapted it
  personal-config undo                         restore the files the last run overwrote
  personal-config passoff next                 the next OPEN board item, with its prompt
  personal-config passoff claim <n>            mark item <n> IN FLIGHT, dated
  personal-config handoff step                 the next free ledger step number
  personal-config archive <slug>               plan Part 7's archiving steps for closed work
  personal-config fold [board|ledger]          move closed prompts and old step bodies to the archive
  personal-config worktree <lane>              plan a lane's worktree, with its checkout recipe
  personal-config context --sentinel <phrase>  this session's context size, from its transcript
  personal-config catalog                      regenerate catalog.json — the questions, as data

Options
  --profile <name>     start from profiles/<name>.json          (default: starter)
  --from <src>         setup only: start from a profile you already have —
                       ./profile.json, an https URL, or the 8-character id the site gives you
  --projects-dir <dir> where to look for repos                  (default: profiles/starter.json)
  --yes                accept every default without asking       (still previews, still confirms)
                       setup: configures every target found under --projects-dir
  --dry-run            print the preview and write nothing
  --force              skip the confirm (implies you have read the preview)
  --fix                doctor only: apply the mechanical fixes
  --move               archive only: perform the move, not just the plan
  --write              upgrade only: also save it as UPGRADE-PROMPT.md at the repo root
  --keep <n>           fold only: ledger steps left whole, newest first  (default: 20)
  --sentinel <phrase>  context only: a phrase unique to this conversation  (required)
  --help, --version

Nothing leaves your machine — --from <url|id> is the one exception, and it only fetches the
profile you ask for. Every run previews the whole file tree before writing, backs up anything it
overwrites, and can be undone.`;
var DISPATCH = {
  setup: runSetup,
  catalog: () => runCatalog(),
  doctor: runDoctor,
  undo: () => runUndo(),
  archive: runArchive,
  fold: runFold,
  passoff: runPassoff,
  handoff: runHandoff,
  worktree: runWorktree,
  context: runContext,
  upgrade: runUpgrade
};
async function main() {
  const argv = process.argv.slice(2);
  const problem2 = checkUsage(argv);
  if (problem2 !== null) {
    console.error(problem2);
    return 1;
  }
  const cli = parseCli(argv);
  if (cli.command === "version") {
    console.log(await version());
    return 0;
  }
  if (cli.command === "help") {
    console.log(HELP);
    return 0;
  }
  const run2 = DISPATCH[cli.command];
  return run2 === undefined ? 1 : run2(cli);
}
async function run2() {
  try {
    return await main();
  } catch (error) {
    console.error(`personal-config: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}
process.exit(await run2());
