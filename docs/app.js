import { workspaceUri } from "./workspace.js";

const repository = "https://github.com/JaerryLee/krafton-cofa";
const storagePrefix = "krafton-cofa:";
const session = new Map();
const byId = (id) => document.getElementById(id);

let exercises;
let currentExercise;
const exerciseLinks = new Map();

function readStorage(key) {
  if (session.has(key)) return session.get(key);
  try {
    return JSON.parse(localStorage.getItem(storagePrefix + key));
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(storagePrefix + key, JSON.stringify(value));
    session.delete(key);
    return true;
  } catch {
    session.set(key, value);
    return false;
  }
}

function exerciseKey(field) {
  return field + ":" + currentExercise.id;
}

function replaceList(id, values, tagName, className) {
  byId(id).replaceChildren(...values.map((value) => {
    const item = document.createElement(tagName);
    item.textContent = value;
    if (className) item.className = className;
    return item;
  }));
}

function renderCatalog() {
  let completedCount = 0;
  for (const exercise of exercises) {
    const link = exerciseLinks.get(exercise.id);
    const completed = readStorage("complete:" + exercise.id) === true;
    link.querySelector(".exercise-done").hidden = !completed;
    if (completed) completedCount += 1;
    if (exercise === currentExercise) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  }
  byId("completion-count").textContent = completedCount + "/" + exercises.length + " 완료";

  const completed = readStorage(exerciseKey("complete")) === true;
  byId("progress-status").textContent = completed ? "풀이 완료" : "풀이 후 완료로 표시하세요.";
  byId("toggle-completion").textContent = completed ? "완료 취소" : "완료로 표시";
}

function buildCatalog() {
  for (const exercise of exercises) {
    const link = document.createElement("a");
    link.href = "#" + exercise.id;
    link.className = "exercise-link";
    const title = document.createElement("strong");
    title.textContent = exercise.title;
    const meta = document.createElement("small");
    meta.textContent = exercise.topic + " · " + exercise.minutes + "분";
    const done = document.createElement("span");
    done.className = "exercise-done";
    done.textContent = "완료";
    link.append(title, meta, done);
    byId("exercise-list").append(link);
    exerciseLinks.set(exercise.id, link);
  }
}

function readTimer(now) {
  const duration = currentExercise.minutes * 60_000;
  const timer = readStorage(exerciseKey("timer"));
  const end = timer?.endsAt;
  const remaining = Number.isFinite(end) ? end - now : timer?.remaining;
  return {
    duration,
    remaining: Number.isFinite(remaining) ? Math.max(0, remaining) : duration,
    running: Number.isFinite(end) && end > now,
  };
}

function setText(id, text) {
  const node = byId(id);
  if (node.textContent !== text) node.textContent = text;
}

function renderTimer() {
  const { duration, remaining, running } = readTimer(Date.now());
  const expired = remaining === 0;
  const seconds = Math.ceil(remaining / 1000);
  const time = [Math.floor(seconds / 60), seconds % 60].map((value) => String(value).padStart(2, "0"));
  const paused = !running && !expired && remaining < duration;
  const state = running ? "진행 중" : paused ? "일시정지" : expired ? "시간 종료" : "대기";
  setText("timer-display", time.join(":"));
  setText("timer-state", state);
  setText("timer-toggle", running ? "일시정지" : paused ? "계속하기" : "시작");
  byId("timer-state").dataset.running = running;
  byId("timer-display").dataset.expired = expired;
  byId("timer-toggle").disabled = expired;
  byId("timer-reset").disabled = remaining === duration && !running;
}

function normalizeWorkspace(input) {
  const trimmed = input.trim();
  if (/^[a-z]:[\\/]/i.test(trimmed)) {
    return trimmed.replaceAll("\\", "/").replace(/\/+$/, "") + "/";
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed.replace(/\/+$/, "") + "/";
  }
  return null;
}

function renderWorkspace() {
  const path = readStorage("workspace");
  byId("workspace-indicator").dataset.configured = Boolean(path);
  byId("workspace-status").textContent = path
    ? path + "exercises/" + currentExercise.id
    : "복제한 저장소의 경로를 저장하면 VS Code에서 과제 폴더를 열 수 있습니다.";
  const link = byId("open-vscode");
  link.hidden = !path;
  if (path) {
    link.href = workspaceUri(path, "exercises/" + currentExercise.id);
  } else {
    link.removeAttribute("href");
  }
  byId("connect-workspace").hidden = Boolean(path);
}

function renderExercise() {
  currentExercise = exercises.find(({ id }) => "#" + id === location.hash) ?? currentExercise ?? exercises[0];
  const exercise = currentExercise;
  byId("exercise-title").textContent = exercise.title;
  byId("exercise-summary").textContent = exercise.summary;
  byId("exercise-signature").textContent = exercise.signature;
  byId("example-input").textContent = exercise.exampleInput;
  byId("example-output").textContent = exercise.exampleOutput;
  replaceList("exercise-tags", [exercise.topic, exercise.minutes + "분 연습"], "span", "tag");
  replaceList("exercise-requirements", exercise.requirements, "li");
  replaceList("review-questions", exercise.reviewQuestions, "li");
  byId("source-link").href = repository + "/tree/main/exercises/" + exercise.id;
  byId("exercise-guide").href = exercise.hasGuide ? "./guide.html#" + exercise.id : "./guide.html";
  renderNotes();
  renderCatalog();
  renderWorkspace();
  renderTimer();
}

function renderNotes() {
  const key = exerciseKey("notes");
  byId("review-notes").value = readStorage(key) ?? "";
  byId("notes-status").textContent = session.has(key)
    ? "브라우저 저장 공간을 사용할 수 없어 이 페이지에서만 유지됩니다."
    : "메모는 이 브라우저에 저장됩니다.";
}

function openSettings() {
  byId("workspace-path").value = readStorage("workspace") ?? "";
  byId("path-error").hidden = true;
  byId("clear-path").disabled = !readStorage("workspace");
  byId("settings-dialog").showModal();
  byId("workspace-path").focus();
}

function registerHandlers() {
  byId("open-settings").addEventListener("click", openSettings);
  byId("connect-workspace").addEventListener("click", openSettings);
  byId("close-settings").addEventListener("click", () => byId("settings-dialog").close());
  byId("settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const path = normalizeWorkspace(byId("workspace-path").value);
    if (!path) {
      byId("path-error").textContent = "저장소의 절대 경로를 입력하세요. 예시 /Users/me/work/krafton-cofa";
      byId("path-error").hidden = false;
      byId("workspace-path").focus();
      return;
    }
    writeStorage("workspace", path);
    renderWorkspace();
    byId("settings-dialog").close();
  });
  byId("clear-path").addEventListener("click", () => {
    writeStorage("workspace", null);
    renderWorkspace();
    byId("settings-dialog").close();
  });
  byId("timer-toggle").addEventListener("click", () => {
    const now = Date.now();
    const { remaining, running } = readTimer(now);
    if (remaining === 0) return;
    writeStorage(exerciseKey("timer"), running ? { remaining } : { endsAt: now + remaining });
    renderTimer();
  });
  byId("timer-reset").addEventListener("click", () => {
    writeStorage(exerciseKey("timer"), null);
    renderTimer();
  });
  byId("review-notes").addEventListener("input", (event) => {
    const saved = writeStorage(exerciseKey("notes"), event.target.value);
    setText("notes-status", saved
      ? "메모가 이 브라우저에 저장됐습니다."
      : "브라우저 저장 공간을 사용할 수 없어 이 페이지에서만 유지됩니다.");
  });
  byId("toggle-completion").addEventListener("click", () => {
    const key = exerciseKey("complete");
    writeStorage(key, readStorage(key) !== true);
    renderCatalog();
  });
  window.addEventListener("hashchange", renderExercise);
  window.addEventListener("storage", (event) => {
    if (event.key === null || event.key === storagePrefix + "workspace") renderWorkspace();
    if (event.key === null || event.key?.startsWith(storagePrefix + "complete:")) renderCatalog();
    if (event.key === storagePrefix + exerciseKey("notes") && document.activeElement !== byId("review-notes")) renderNotes();
  });
  window.setInterval(renderTimer, 250);
}

async function start() {
  try {
    const response = await fetch("./exercises.json");
    if (!response.ok) throw new Error("Failed to load exercises");
    exercises = await response.json();
    if (exercises.length === 0) throw new Error("No exercises configured");
    buildCatalog();
    renderExercise();
    registerHandlers();
    byId("load-status").hidden = true;
    byId("dashboard").hidden = false;
  } catch (error) {
    byId("load-status").textContent = "과제를 불러오지 못했습니다. 페이지를 새로고침하거나 HTTP 서버에서 열어주세요.";
    console.error(error);
  }
}

start();
