import { searchRules } from "../search.js";

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
  bindSearch();
  const data = await fetch("../data/rules-all.json").then((res) => res.json());
  allRules = data.rules;
}

init();
