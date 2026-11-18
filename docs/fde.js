import { scenarios } from "./fde-scenarios.js";
import { workspaceUri } from "./workspace.js";

const byId = (id) => document.getElementById(id);
const scenarioIds = Object.keys(scenarios);
const storagePrefix = "krafton-cofa:fde:";
const offline = new Map();
const plans = {
  75: [
    "0–10분 · 질문하고 핵심 성공 조건 한 가지 합의",
    "10–15분 · 서버 실행과 샘플 하나 확인",
    "15–45분 · 사용자가 처음부터 끝까지 수행할 경로 구현",
    "45–60분 · 순서·누락·중복 중 위험한 반례를 실행",
    "60–75분 · 새 세션에 넘긴 뒤 제출용 검증 근거 정리",
  ],
  225: [
    "0–25분 · 최근 실패, 현재 기준값, 성공 기준과 범위 합의",
    "25–45분 · 환경 확인과 샘플이 보이는 첫 화면",
    "45–130분 · 핵심 경로 구현과 중간 시연",
    "130–180분 · 반례·재실행·실무자 수용 확인",
    "180–205분 · 인수인계 후 새 세션에서 실행 재현",
    "205–225분 · 최종 diff, 제출 절차, 남은 위험 정리",
  ],
};

let scenarioId;
let build;
let qa;

function read(field, fallback) {
  const key = storagePrefix + scenarioId + ":" + field;
  if (offline.has(key)) return offline.get(key);
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(field, value) {
  const key = storagePrefix + scenarioId + ":" + field;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    offline.delete(key);
  } catch {
    offline.set(key, value);
    byId("storage-message").textContent = "브라우저 저장을 사용할 수 없습니다. 이 탭을 닫기 전에 기록을 내보내세요.";
  }
}

function element(tag, content) {
  const node = document.createElement(tag);
  node.textContent = content;
  return node;
}

function setText(id, text) {
  const node = byId(id);
  if (node.textContent !== text) node.textContent = text;
}

function renderInterview() {
  const selected = read("interview", []);
  const entries = scenarios[scenarioId].interview;
  byId("interview-questions").replaceChildren(...entries.map(([question], index) => {
    const button = element("button", question);
    button.className = "button";
    button.type = "button";
    button.disabled = selected.includes(index);
    button.addEventListener("click", () => {
      save("interview", [...read("interview", []), index]);
      renderInterview();
      byId("interview-log").lastElementChild.focus();
    });
    return button;
  }));
  byId("interview-log").replaceChildren(...selected.map((index) => {
    const [question, answer] = entries[index];
    const entry = document.createElement("li");
    entry.tabIndex = -1;
    entry.append(element("strong", question), element("p", answer));
    return entry;
  }));
}

function renderPlan() {
  byId("phase-plan").replaceChildren(...plans[build.minutes].map((step) => element("li", step)));
}

function secondsLeft(end) {
  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}

function timeLabel(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

function tick() {
  const buildSeconds = build.endsAt ? secondsLeft(build.endsAt) : build.minutes * 60;
  setText("build-time", timeLabel(buildSeconds));
  byId("build-time").dataset.expired = buildSeconds === 0;
  const buildLocked = Boolean(build.endsAt);
  byId("build-duration").disabled = buildLocked;
  byId("start-build").disabled = buildLocked;
  byId("reset-build").disabled = !buildLocked;

  if (qa.index < 0 || qa.finished) return;
  const questionSeconds = secondsLeft(qa.endsAt);
  setText("qa-time", timeLabel(questionSeconds));
  byId("qa-time").dataset.expired = questionSeconds === 0;
  byId("qa-answer").readOnly = questionSeconds === 0;
  setText("qa-status", questionSeconds === 0 ? "응답 시간이 끝났습니다. 저장된 답변을 확인하고 다음으로 이동하세요." : "");
}

function renderQa() {
  const { questions } = scenarios[scenarioId];
  const active = qa.index >= 0 && !qa.finished;
  byId("start-qa").hidden = qa.index >= 0;
  byId("qa-active").hidden = !active;
  byId("qa-review").hidden = !qa.finished;
  if (active) {
    byId("qa-question").textContent = questions[qa.index];
    byId("qa-count").textContent = (qa.index + 1) + " / " + questions.length;
    byId("qa-answer").value = qa.answers[qa.index] ?? "";
    byId("next-qa").textContent = qa.index + 1 === questions.length ? "답변 저장 후 마치기" : "답변 저장 후 다음";
  }
  if (qa.finished) {
    byId("qa-summary").replaceChildren(...questions.map((question, index) => {
      const entry = document.createElement("li");
      entry.append(element("strong", question), element("p", qa.answers[index]?.trim() || "작성한 답변 없음"));
      return entry;
    }));
  }
  tick();
}

function loadScenario(nextId) {
  scenarioId = Object.hasOwn(scenarios, nextId) ? nextId : scenarioIds[0];
  const scenario = scenarios[scenarioId];
  const data = byId("scenario-data");
  data.href = "./fde-kit/data/" + scenario.data;
  data.download = scenario.data;
  byId("scenario").value = scenarioId;
  byId("scenario-title").textContent = scenario.title;
  byId("scenario-brief").textContent = scenario.brief;
  byId("agreement").value = read("agreement", "");
  byId("handoff").value = read("handoff", "");
  build = read("build", { minutes: 75, endsAt: 0 });
  qa = read("qa", { index: -1, endsAt: 0, answers: [], finished: false });
  byId("build-duration").value = build.minutes;
  renderInterview();
  renderPlan();
  renderQa();
}

function openQuestion(index) {
  qa.index = index;
  qa.endsAt = Date.now() + 180_000;
  save("qa", qa);
  renderQa();
  byId("qa-answer").focus();
}

function exportLog() {
  const scenario = scenarios[scenarioId];
  const transcript = read("interview", []).map((index) => {
    const [question, answer] = scenario.interview[index];
    return "- 질문: " + question + "\n  - 답변: " + answer;
  }).join("\n");
  const qaLog = scenario.questions.slice(0, qa.index + 1).map((question, index) =>
    "### " + (index + 1) + ". " + question + "\n\n" + (qa.answers[index]?.trim() || "작성한 답변 없음")
  ).join("\n\n");
  const markdown = [
    "# " + scenario.title,
    "## 인터뷰\n\n" + (transcript || "기록 없음"),
    "## 성공 조건 합의\n\n" + (byId("agreement").value.trim() || "기록 없음"),
    "## 구현·검증·인수인계\n\n" + (byId("handoff").value.trim() || "기록 없음"),
    "## 사후 확인 질문\n\n" + (qaLog || "기록 없음"),
  ].join("\n\n") + "\n";
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "fde-" + scenarioId + "-rehearsal.md";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderWorkspaceLink() {
  const link = byId("open-fde-vscode");
  try {
    const path = JSON.parse(localStorage.getItem("krafton-cofa:workspace"));
    if (typeof path === "string" && path.trim()) {
      link.href = workspaceUri(path, "docs/fde-kit");
      link.hidden = false;
      return;
    }
  } catch {
    // The download stays available if browser storage is blocked.
  }
  link.hidden = true;
  link.removeAttribute("href");
}

for (const id of scenarioIds) {
  const option = element("option", scenarios[id].title);
  option.value = id;
  byId("scenario").append(option);
}

byId("scenario").addEventListener("change", (event) => {
  history.replaceState(null, "", "#" + event.target.value);
  loadScenario(event.target.value);
});
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (Object.hasOwn(scenarios, id)) loadScenario(id);
});
window.addEventListener("storage", (event) => {
  if (event.key === null || event.key === "krafton-cofa:workspace") renderWorkspaceLink();
});
byId("build-duration").addEventListener("change", (event) => {
  build.minutes = Number(event.target.value);
  save("build", build);
  renderPlan();
  tick();
});
byId("start-build").addEventListener("click", () => {
  build.endsAt = Date.now() + build.minutes * 60_000;
  save("build", build);
  tick();
});
byId("reset-build").addEventListener("click", () => {
  build.endsAt = 0;
  save("build", build);
  tick();
});

for (const field of ["agreement", "handoff"]) {
  byId(field).addEventListener("input", (event) => save(field, event.target.value));
}
byId("download-log").addEventListener("click", exportLog);
byId("start-qa").addEventListener("click", () => openQuestion(0));
byId("qa-answer").addEventListener("input", (event) => {
  if (secondsLeft(qa.endsAt) === 0) {
    event.target.value = qa.answers[qa.index] ?? "";
    tick();
    return;
  }
  qa.answers[qa.index] = event.target.value;
  save("qa", qa);
});
byId("next-qa").addEventListener("click", () => {
  const lastIndex = scenarios[scenarioId].questions.length - 1;
  if (qa.index < lastIndex) {
    openQuestion(qa.index + 1);
  } else {
    qa.finished = true;
    save("qa", qa);
    renderQa();
    byId("qa-review").tabIndex = -1;
    byId("qa-review").focus();
  }
});
byId("retry-qa").addEventListener("click", () => {
  if (!window.confirm("이 과제의 기존 확인 질문 답변을 지우고 다시 시작할까요?")) return;
  qa = { index: -1, endsAt: 0, answers: [], finished: false };
  save("qa", qa);
  renderQa();
  byId("start-qa").focus();
});

loadScenario(location.hash.slice(1));
renderWorkspaceLink();
window.setInterval(tick, 250);
