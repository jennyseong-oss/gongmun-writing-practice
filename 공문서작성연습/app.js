import { checkAll as checkAllA } from "./checker.js";
import { checkAllB } from "./checker-b.js";
import { checkAllC } from "./checker-c.js";

const MODULES = {
  A: {
    title: "본문 내용",
    rulesFile: "data/rules.json",
    quizFile: "data/quiz.json",
    check: checkAllA,
    defaultPlaceholder:
      "예) 2026학년도 신규자 직무연수 참가자를 다음과 같이 모집합니다.\n\n붙임  참가신청서 1부.  끝.",
    defaultHint: "제목 아래 본문만 입력해도 됩니다. 붙임과 끝 표시까지 포함해서 써 보면 더 많은 항목을 검사할 수 있습니다.",
  },
  B: {
    title: "항목 번호 체계",
    rulesFile: "data/rules-b.json",
    quizFile: "data/quiz-b.json",
    check: checkAllB,
    defaultPlaceholder: "예) 1. 목적\n  가. 신규 임용자의 행정업무 이해도 제고\n2. 일시",
    defaultHint: "항목 번호와 들여쓰기를 포함해 두 단계 이상으로 써 보세요.",
  },
  C: {
    title: "날짜·숫자·금액",
    rulesFile: "data/rules-c.json",
    quizFile: "data/quiz-c.json",
    check: checkAllC,
    defaultPlaceholder:
      "예) 2026. 8. 10.부터 8. 14.까지 09:00~18:00 운영합니다.\n\n소요 예산은 금1,500,000원(금일백오십만원)입니다.",
    defaultHint: "날짜·시간·금액 표기를 하나 이상 포함해 써 보세요.",
  },
};

const state = {
  moduleId: "A",
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
      <div class="rule-card-head">
        <span class="rule-id">${rule.id}</span>
        <h3>${escapeHtml(rule.title)}</h3>
      </div>
      <p class="summary">${escapeHtml(rule.summary)}</p>
      <p class="basis">근거: ${escapeHtml(rule.basis)}</p>
      <div class="example-grid">
        <div class="example-box good"><span class="example-label">좋은 예</span>${escapeHtml(rule.good)}</div>
        <div class="example-box bad"><span class="example-label">나쁜 예</span>${escapeHtml(rule.bad)}</div>
      </div>
      <p class="tip">${escapeHtml(rule.tip)}</p>
      ${rule.autoCheck === false ? `<p class="auto-check-note">${escapeHtml(rule.autoCheckNote)}</p>` : ""}
    </article>
  `,
    )
    .join("");
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

function renderQuizSummary() {
  const summary = document.getElementById("quizSummary");
  const total = state.quiz.length;
  const pct = total > 0 ? Math.round((state.quizScore / total) * 100) : 0;
  saveBestScore(pct);
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

function renderPracticeReport(results) {
  const ruleTitleMap = Object.fromEntries(state.rules.map((rule) => [rule.id, rule.title]));
  const report = document.getElementById("practiceReport");
  report.classList.remove("hidden");
  report.innerHTML = `<div class="report-table">${results
    .map(
      (result) => `
    <div class="report-row">
      <span class="badge ${result.status}">${statusLabel(result.status)}</span>
      <div>
        <p class="rule-name">${result.ruleId} · ${escapeHtml(ruleTitleMap[result.ruleId] || "")}</p>
        <p class="message">${escapeHtml(result.message)}</p>
      </div>
    </div>
  `,
    )
    .join("")}</div>`;
}

function bindPractice() {
  document.getElementById("checkButton").addEventListener("click", () => {
    const text = document.getElementById("practiceInput").value.trim();
    const report = document.getElementById("practiceReport");
    if (!text) {
      report.classList.remove("hidden");
      report.innerHTML = `<p class="module-intro">본문을 입력한 뒤 첨삭하기를 눌러 주세요.</p>`;
      return;
    }
    renderPracticeReport(MODULES[state.moduleId].check(text));
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

  const [rulesData, quizData] = await Promise.all([
    fetch(module.rulesFile).then((res) => res.json()),
    fetch(module.quizFile).then((res) => res.json()),
  ]);
  state.rules = rulesData.rules;
  state.quiz = quizData;
  state.quizIndex = 0;
  state.quizScore = 0;

  document.getElementById("modulePill").textContent = `모듈 ${moduleId} · ${module.title}`;
  document.getElementById("moduleIntro").textContent = rulesData.moduleIntro;
  document.getElementById("practiceHeading").textContent = `${rulesData.moduleTitle} 부분을 직접 써 보세요`;
  document.getElementById("practiceHint").textContent = rulesData.practiceHint || module.defaultHint;
  document.getElementById("practiceInput").placeholder = rulesData.practicePlaceholder || module.defaultPlaceholder;
  document.getElementById("practiceInput").value = "";
  document.getElementById("practiceReport").classList.add("hidden");
  document.getElementById("practiceReport").innerHTML = "";

  renderRuleCards();
  renderQuizQuestion();
  updatePracticeCount();
  switchToLearnTab();
}

function bindModuleRail() {
  document.querySelectorAll(".module-chip[data-module]").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.disabled || chip.dataset.module === state.moduleId) return;
      document.querySelectorAll(".module-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      loadModule(chip.dataset.module);
    });
  });
}

async function init() {
  bindTabs();
  bindPractice();
  bindModuleRail();
  await loadModule(state.moduleId);
}

init();
