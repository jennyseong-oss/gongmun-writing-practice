import { checkAllModules } from "./checker-all.js";
import { annotateText } from "./annotate.js";

const MODULES = {
  START: { title: "기안문 구조", mode: "intro" },
  A: { title: "본문 내용", rulesFile: "data/rules.json", quizFile: "data/quiz.json" },
  B: { title: "항목 번호 체계", rulesFile: "data/rules-b.json", quizFile: "data/quiz-b.json" },
  C: { title: "날짜·숫자·금액", rulesFile: "data/rules-c.json", quizFile: "data/quiz-c.json" },
  D: { title: "용어·표현", rulesFile: "data/rules-d.json", quizFile: "data/quiz-d.json" },
  E: { title: "용지·여백·글자", rulesFile: "data/rules-e.json", quizFile: "data/quiz-e.json" },
  ALL: {
    title: "종합 실습",
    mode: "practice",
    rulesFile: "data/rules-all.json",
    check: checkAllModules,
    defaultPlaceholder: "완성된 기안문 전체를 제목 아래부터 붙여넣어 보세요.",
    defaultHint: "A~E 27개 규정을 한 번에 점검합니다.",
    practiceHeading: "완성된 기안문 전체를 붙여넣어 보세요",
  },
};

const state = {
  moduleId: "ALL",
  rules: [],
  quiz: [],
  quizIndex: 0,
  quizScore: 0,
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function storageKey(suffix) {
  return `gongmun-${state.moduleId.toLowerCase()}-${suffix}`;
}

function getBestScore() {
  return Number(localStorage.getItem(storageKey("quiz-best")) || 0);
}

function saveBestScore(pct) {
  if (pct > getBestScore()) localStorage.setItem(storageKey("quiz-best"), String(pct));
}

function getPracticeCount() {
  return Number(localStorage.getItem(storageKey("practice-count")) || 0);
}

function bumpPracticeCount() {
  const next = getPracticeCount() + 1;
  localStorage.setItem(storageKey("practice-count"), String(next));
  return next;
}

function statusLabel(status) {
  return { pass: "통과", warn: "확인 필요", info: "참고" }[status] || status;
}

function renderRuleCards() {
  const container = document.getElementById("ruleCards");
  container.innerHTML = state.rules
    .map(
      (rule) => `
    <article class="rule-card">
      <button class="rule-card-head" type="button" data-rule-toggle aria-expanded="false">
        <span class="rule-id">${rule.id}</span>
        <span class="rule-card-title-group">
          <h3>${escapeHtml(rule.title)}</h3>
          <span class="rule-card-summary">${escapeHtml(rule.summary)}</span>
        </span>
        <span class="rule-card-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="rule-card-body hidden">
        <p class="basis">근거: ${escapeHtml(rule.basis)}</p>
        <div class="example-grid">
          <div class="example-box good"><span class="example-label">좋은 예</span>${escapeHtml(rule.good)}</div>
          <div class="example-box bad"><span class="example-label">나쁜 예</span>${escapeHtml(rule.bad)}</div>
        </div>
        <p class="tip">${escapeHtml(rule.tip)}</p>
        ${rule.autoCheck === false ? `<p class="auto-check-note">${escapeHtml(rule.autoCheckNote)}</p>` : ""}
      </div>
    </article>
  `,
    )
    .join("");
}

function bindRuleCards() {
  document.getElementById("ruleCards").addEventListener("click", (event) => {
    const head = event.target.closest("[data-rule-toggle]");
    if (!head) return;
    const body = head.nextElementSibling;
    const expanded = head.getAttribute("aria-expanded") === "true";
    head.setAttribute("aria-expanded", String(!expanded));
    body.classList.toggle("hidden", expanded);
  });
}

function renderQuizQuestion() {
  const quizBody = document.getElementById("quizBody");
  const progress = document.getElementById("quizProgress");
  const summary = document.getElementById("quizSummary");

  if (state.quizIndex >= state.quiz.length) {
    quizBody.classList.add("hidden");
    progress.classList.add("hidden");
    summary.classList.remove("hidden");
    renderQuizSummary();
    return;
  }

  quizBody.classList.remove("hidden");
  progress.classList.remove("hidden");
  summary.classList.add("hidden");

  const q = state.quiz[state.quizIndex];
  progress.textContent = `${state.quizIndex + 1} / ${state.quiz.length} 문항 · 맞은 개수 ${state.quizScore}`;
  quizBody.innerHTML = `
    <div class="quiz-card">
      <p class="quiz-question">${escapeHtml(q.question)}</p>
      <div class="quiz-choices">
        ${q.choices.map((choice, idx) => `<button class="quiz-choice" data-idx="${idx}" type="button">${escapeHtml(choice)}</button>`).join("")}
      </div>
      <div class="quiz-explanation hidden" id="quizExplanation">${escapeHtml(q.explanation)}</div>
      <div class="quiz-next-row hidden" id="quizNextRow">
        <button class="primary-button" id="quizNextButton" type="button">다음 문항</button>
      </div>
    </div>
  `;

  quizBody.querySelectorAll(".quiz-choice").forEach((button) => {
    button.addEventListener("click", () => handleQuizChoice(Number(button.dataset.idx), q));
  });
}

function handleQuizChoice(idx, question) {
  const buttons = document.querySelectorAll(".quiz-choice");
  buttons.forEach((button) => {
    button.disabled = true;
  });
  buttons[idx].classList.add(idx === question.answerIndex ? "correct" : "incorrect");
  buttons[question.answerIndex].classList.add("correct");
  if (idx === question.answerIndex) state.quizScore += 1;

  document.getElementById("quizExplanation").classList.remove("hidden");
  document.getElementById("quizNextRow").classList.remove("hidden");
  document.getElementById("quizProgress").textContent =
    `${state.quizIndex + 1} / ${state.quiz.length} 문항 · 맞은 개수 ${state.quizScore}`;
  document.getElementById("quizNextButton").addEventListener("click", () => {
    state.quizIndex += 1;
    renderQuizQuestion();
  });
}

function renderChipScores() {
  document.querySelectorAll(".module-chip[data-module]").forEach((chip) => {
    const moduleId = chip.dataset.module;
    if (moduleId === "ALL" || moduleId === "START") return;
    const stored = localStorage.getItem(`gongmun-${moduleId.toLowerCase()}-quiz-best`);
    let badge = chip.querySelector(".chip-score");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "chip-score";
      chip.appendChild(badge);
    }
    if (stored && Number(stored) > 0) {
      badge.textContent = `최고 ${stored}%`;
      badge.classList.remove("hidden");
    } else {
      badge.textContent = "";
      badge.classList.add("hidden");
    }
  });
}

function renderQuizSummary() {
  const summary = document.getElementById("quizSummary");
  const total = state.quiz.length;
  const pct = total > 0 ? Math.round((state.quizScore / total) * 100) : 0;
  saveBestScore(pct);
  renderChipScores();
  summary.innerHTML = `
    <div class="quiz-summary">
      <p>모듈 ${state.moduleId} 퀴즈 결과</p>
      <p class="score">${state.quizScore} / ${total}</p>
      <p>정답률 ${pct}% · 최고 기록 ${getBestScore()}%</p>
      <button class="ghost-button" id="quizRetryButton" type="button">다시 풀기</button>
    </div>
  `;
  document.getElementById("quizRetryButton").addEventListener("click", () => {
    state.quizIndex = 0;
    state.quizScore = 0;
    renderQuizQuestion();
  });
}

function updatePracticeCount() {
  const count = getPracticeCount();
  document.getElementById("practiceCount").textContent =
    count > 0 ? `지금까지 ${count}번 첨삭해 봤어요.` : "";
}

function renderReportRow(result, ruleTitleMap) {
  return `
    <div class="report-row">
      <span class="badge ${result.status}">${statusLabel(result.status)}</span>
      <div>
        <p class="rule-name">${result.ruleId} · ${escapeHtml(ruleTitleMap[result.ruleId] || "")}</p>
        <p class="message">${escapeHtml(result.message)}</p>
      </div>
    </div>
  `;
}

function renderPracticeReport(results) {
  const ruleTitleMap = Object.fromEntries(state.rules.map((rule) => [rule.id, rule.title]));
  const report = document.getElementById("practiceReport");
  report.classList.remove("hidden");

  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const summaryLine = `<p class="report-summary">총 ${results.length}개 항목 · 통과 ${counts.pass || 0} · 확인 필요 ${counts.warn || 0} · 참고 ${counts.info || 0}</p>`;

  const moduleLetters = [...new Set(results.map((r) => r.ruleId.charAt(0)))];
  const groups = moduleLetters
    .map((letter) => {
      const groupResults = results.filter((r) => r.ruleId.charAt(0) === letter);
      const groupTitle = (MODULES[letter] && MODULES[letter].title) || letter;
      const attentionRows = groupResults.filter((r) => r.status === "warn");
      const otherRows = groupResults.filter((r) => r.status !== "warn");

      const attentionHtml = attentionRows.length
        ? `<div class="report-table">${attentionRows.map((r) => renderReportRow(r, ruleTitleMap)).join("")}</div>`
        : `<p class="report-all-clear">확인이 필요한 항목이 없습니다.</p>`;

      const moreHtml = otherRows.length
        ? `
          <button class="report-more-toggle" type="button" data-more-toggle aria-expanded="false">${otherRows.length}개 더 보기 (통과·참고)</button>
          <div class="report-table hidden">${otherRows.map((r) => renderReportRow(r, ruleTitleMap)).join("")}</div>
        `
        : "";

      return `
        <div class="report-group">
          <h4 class="report-group-title">${letter}. ${escapeHtml(groupTitle)}</h4>
          ${attentionHtml}
          ${moreHtml}
        </div>
      `;
    })
    .join("");

  report.innerHTML = summaryLine + groups;
}

function bindReportToggles() {
  document.getElementById("practiceReport").addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-more-toggle]");
    if (!toggle) return;
    const table = toggle.nextElementSibling;
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    const count = table.querySelectorAll(".report-row").length;
    toggle.setAttribute("aria-expanded", String(!expanded));
    table.classList.toggle("hidden", expanded);
    toggle.textContent = expanded ? `${count}개 더 보기 (통과·참고)` : "접기";
  });
}

function bindPractice() {
  document.getElementById("checkButton").addEventListener("click", () => {
    const text = document.getElementById("practiceInput").value.trim();
    const report = document.getElementById("practiceReport");
    const previewBlock = document.getElementById("practicePreviewBlock");
    if (!text) {
      report.classList.remove("hidden");
      report.innerHTML = `<p class="module-intro">본문을 입력한 뒤 첨삭하기를 눌러 주세요.</p>`;
      previewBlock.classList.add("hidden");
      return;
    }
    const results = MODULES[state.moduleId].check(text);
    document.getElementById("practicePreview").innerHTML = annotateText(text, results);
    previewBlock.classList.remove("hidden");
    renderPracticeReport(results);
    const count = bumpPracticeCount();
    document.getElementById("practiceCount").textContent = `지금까지 ${count}번 첨삭해 봤어요.`;
  });
}

function bindTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.add("hidden"));
      document.getElementById(`tab-${button.dataset.tab}`).classList.remove("hidden");
    });
  });
}

function switchToLearnTab() {
  document.querySelectorAll(".tab-button").forEach((b) => {
    const isLearn = b.dataset.tab === "learn";
    b.classList.toggle("active", isLearn);
    b.setAttribute("aria-selected", String(isLearn));
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("hidden", panel.id !== "tab-learn");
  });
}

async function loadModule(moduleId) {
  const module = MODULES[moduleId];
  if (!module) return;
  state.moduleId = moduleId;
  const mode = module.mode || "standard";

  document.getElementById("modulePill").textContent =
    mode === "intro" ? module.title : `모듈 ${moduleId} · ${module.title}`;
  document.getElementById("introPanel").classList.toggle("hidden", mode !== "intro");
  document.getElementById("moduleTabs").classList.toggle("hidden", mode !== "standard");
  document.getElementById("comprehensivePanel").classList.toggle("hidden", mode !== "practice");

  if (mode === "intro") return;

  const rulesData = await fetch(module.rulesFile).then((res) => res.json());
  state.rules = rulesData.rules;

  if (mode === "practice") {
    document.getElementById("practiceHeading").textContent = module.practiceHeading || module.title;
    document.getElementById("practiceHint").textContent = rulesData.practiceHint || module.defaultHint;
    document.getElementById("practiceInput").placeholder = rulesData.practicePlaceholder || module.defaultPlaceholder;
    document.getElementById("practiceInput").value = "";
    document.getElementById("practiceReport").classList.add("hidden");
    document.getElementById("practiceReport").innerHTML = "";
    document.getElementById("practicePreviewBlock").classList.add("hidden");
    document.getElementById("practicePreview").innerHTML = "";
    updatePracticeCount();
  } else {
    const quizData = await fetch(module.quizFile).then((res) => res.json());
    state.quiz = quizData;
    state.quizIndex = 0;
    state.quizScore = 0;

    document.getElementById("moduleIntro").textContent = rulesData.moduleIntro;
    renderRuleCards();
    renderQuizQuestion();
    switchToLearnTab();
  }
}

function selectModule(moduleId) {
  if (moduleId === state.moduleId) return;
  document.querySelectorAll(".module-chip").forEach((c) => c.classList.toggle("active", c.dataset.module === moduleId));
  loadModule(moduleId);
}

function bindModuleRail() {
  document.querySelectorAll(".module-chip[data-module]").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.disabled) return;
      selectModule(chip.dataset.module);
    });
  });
}

function bindIntroStart() {
  const button = document.getElementById("introStartButton");
  if (button) button.addEventListener("click", () => selectModule("A"));
}

async function init() {
  bindTabs();
  bindPractice();
  bindModuleRail();
  bindIntroStart();
  bindRuleCards();
  bindReportToggles();
  renderChipScores();
  await loadModule(state.moduleId);
}

init();
