import { checkAllModules } from "./checker-all.js";
import { annotateText } from "./annotate.js";
import { searchRules } from "./search.js";

const MODULE_TITLES = {
  A: "본문 내용",
  B: "항목 번호 체계",
  C: "날짜·숫자·금액",
  D: "용어·표현",
  E: "용지 규격",
};

const state = { rules: [] };
let allRules = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function getPracticeCount() {
  return Number(localStorage.getItem("gongmun-ref-practice-count") || 0);
}

function bumpPracticeCount() {
  const next = getPracticeCount() + 1;
  localStorage.setItem("gongmun-ref-practice-count", String(next));
  return next;
}

function updatePracticeCount() {
  const count = getPracticeCount();
  document.getElementById("practiceCount").textContent =
    count > 0 ? `지금까지 ${count}번 첨삭해 봤어요.` : "";
}

function statusLabel(status) {
  return { pass: "통과", warn: "확인 필요", info: "참고" }[status] || status;
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
      const groupTitle = MODULE_TITLES[letter] || letter;
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
    const results = checkAllModules(text);
    document.getElementById("practicePreview").innerHTML = annotateText(text, results);
    previewBlock.classList.remove("hidden");
    renderPracticeReport(results);
    const count = bumpPracticeCount();
    document.getElementById("practiceCount").textContent = `지금까지 ${count}번 첨삭해 봤어요.`;
  });
}

function renderRuleDetail(rule) {
  return `
    <div class="search-result-detail hidden">
      <p class="basis">근거: ${escapeHtml(rule.basis)}</p>
      <div class="example-grid">
        <div class="example-box good"><span class="example-label">좋은 예</span>${escapeHtml(rule.good)}</div>
        <div class="example-box bad"><span class="example-label">나쁜 예</span>${escapeHtml(rule.bad)}</div>
      </div>
      <p class="tip">${escapeHtml(rule.tip)}</p>
      ${rule.autoCheck === false ? `<p class="auto-check-note">${escapeHtml(rule.autoCheckNote)}</p>` : ""}
    </div>
  `;
}

function renderSearchResults(query) {
  const resultsBox = document.getElementById("ruleSearchResults");
  const matches = searchRules(allRules, query).slice(0, 8);

  if (!query.trim()) {
    resultsBox.classList.add("hidden");
    resultsBox.innerHTML = "";
    return;
  }

  if (matches.length === 0) {
    resultsBox.innerHTML = `<p class="search-empty">'${escapeHtml(query.trim())}'에 해당하는 규정을 찾지 못했습니다.</p>`;
    resultsBox.classList.remove("hidden");
    return;
  }

  resultsBox.innerHTML = matches
    .map(
      (rule) => `
    <div class="search-result-item">
      <button class="search-result" type="button" data-rule-toggle data-rule-id="${rule.id}" aria-expanded="false">
        <span class="search-result-id">${rule.id}</span>
        <span class="search-result-body">
          <strong>${escapeHtml(rule.title)}</strong>
          <span>${escapeHtml(rule.summary)}</span>
        </span>
        <span class="search-result-chevron" aria-hidden="true">▾</span>
      </button>
      ${renderRuleDetail(rule)}
    </div>
  `,
    )
    .join("");
  resultsBox.classList.remove("hidden");
}

function bindSearch() {
  const input = document.getElementById("ruleSearchInput");
  const resultsBox = document.getElementById("ruleSearchResults");

  input.addEventListener("input", () => renderSearchResults(input.value));
  input.addEventListener("focus", () => {
    if (input.value.trim()) renderSearchResults(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      renderSearchResults("");
      input.blur();
    }
    if (event.key === "Enter") {
      const first = resultsBox.querySelector(".search-result");
      if (first) first.click();
    }
  });
  resultsBox.addEventListener("click", (event) => {
    const head = event.target.closest("[data-rule-toggle]");
    if (!head) return;
    const detail = head.nextElementSibling;
    const expanded = head.getAttribute("aria-expanded") === "true";
    head.setAttribute("aria-expanded", String(!expanded));
    detail.classList.toggle("hidden", expanded);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-bar")) resultsBox.classList.add("hidden");
  });
}

async function init() {
  bindPractice();
  bindReportToggles();
  bindSearch();
  const data = await fetch("data/rules-all.json").then((res) => res.json());
  state.rules = data.rules;
  allRules = data.rules;
  document.getElementById("practiceHint").textContent = data.practiceHint || "";
  document.getElementById("practiceInput").placeholder = data.practicePlaceholder || "";
  updatePracticeCount();
}

init();
