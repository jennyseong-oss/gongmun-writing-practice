import { PROFILES, calculateGrossPay, formatWon, getSickLeaveAllocation } from "./calculator.js";

const $ = (selector) => document.querySelector(selector);
const form = $("#calculatorForm");
const profileSelect = $("#profileId");
const componentFields = $("#componentFields");

for (const profile of Object.values(PROFILES)) {
  const option = document.createElement("option");
  option.value = profile.id;
  option.textContent = profile.label;
  profileSelect.append(option);
}

function currentProfile() {
  return PROFILES[profileSelect.value];
}

function inputMode() {
  return form.elements.inputMode.value;
}

function numberValue(selector) {
  const value = Number($(selector)?.value ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function renderProfile() {
  const profile = currentProfile();
  const hourly = profile.kind === "hourly";
  $("#hourlyFields").classList.toggle("hidden", !hourly);
  $("#monthlyFields").classList.toggle("hidden", hourly);
  $("#scheduleField").classList.toggle("hidden", hourly);
  $("#scheduleType").value = profile.schedule;
  $("#contractMonths").value = hourly ? 1 : 12;
  if (hourly) $("#hourlyWage").value = profile.hourlyWage;
  renderComponents();
  toggleVacationField();
  clearResult();
}

function renderComponents() {
  const profile = currentProfile();
  componentFields.innerHTML = "";
  if (profile.kind === "hourly") return;

  for (const component of profile.components) {
    const row = document.createElement("label");
    row.className = "component-field";
    row.innerHTML = `
      <span><strong>${component.label}</strong><small>${component.note ?? "무급 병가 시 일할 계산"}</small></span>
      <span class="money-input"><input type="number" min="0" step="1" data-component-id="${component.id}" value="${component.amount}"><em>원</em></span>`;
    const input = row.querySelector("input");
    input.readOnly = inputMode() === "standard";
    componentFields.append(row);
  }
}

function toggleVacationField() {
  const show = $("#scheduleType").value === "vacation" && currentProfile().kind !== "hourly";
  document.querySelectorAll(".vacation-only").forEach((el) => el.classList.toggle("hidden", !show));
}

function clearResult() {
  $("#resultEmpty").classList.remove("hidden");
  $("#resultContent").classList.add("hidden");
  $("#resultContent").innerHTML = "";
}

function renderError(message) {
  $("#resultEmpty").classList.add("hidden");
  const target = $("#resultContent");
  target.classList.remove("hidden");
  target.innerHTML = `<div class="error-box">${message}</div>`;
}

function collectComponents() {
  return [...document.querySelectorAll("[data-component-id]")].map((input) => {
    const definition = currentProfile().components.find((item) => item.id === input.dataset.componentId);
    return { ...definition, amount: Number(input.value) || 0 };
  });
}

function buildInput() {
  const profile = currentProfile();
  const employmentType = $("#employmentType").value;
  const contractMonths = numberValue("#contractMonths");
  const previousSickDays = numberValue("#previousSickDays");
  const currentSickDays = numberValue("#currentSickDays");
  const scheduleType = profile.kind === "hourly" ? "hourly" : $("#scheduleType").value;

  const allocation = getSickLeaveAllocation({
    employmentType,
    contractMonths,
    previousSickDays,
    currentSickDays,
    paidLimit: profile.paidSickLeaveLimit,
  });

  return {
    profile,
    inputMode: inputMode(),
    employmentType,
    contractMonths,
    previousSickDays,
    currentSickDays,
    scheduleType,
    daysInMonth: numberValue("#daysInMonth"),
    unpaidDaysInVacation: numberValue("#unpaidDaysInVacation"),
    weeklyHours: numberValue("#weeklyHours"),
    dailyHours: numberValue("#dailyHours"),
    actualWorkHours: numberValue("#actualWorkHours"),
    paidHolidayHours: numberValue("#paidHolidayHours"),
    hourlyWage: numberValue("#hourlyWage"),
    components: collectComponents(),
    includeHolidayBonus: $("#includeHolidayBonus").checked,
    includeRegularBonus: $("#includeRegularBonus").checked,
    allocation,
  };
}

function renderResult(result, input) {
  $("#resultEmpty").classList.add("hidden");
  const target = $("#resultContent");
  target.classList.remove("hidden");

  const warningHtml = result.warnings.length
    ? `<div class="warning-box"><strong>확인이 필요합니다</strong><ul>${result.warnings.map((item) => `<li>${item}</li>`).join("")}</ul></div>`
    : `<div class="ok-box">입력값 기준으로 계산을 완료했습니다.</div>`;

  const rows = result.lines.map((line) => `
    <div class="result-line">
      <span><strong>${line.label}</strong><small>${line.formula}</small></span>
      <b>${formatWon(line.paid)}</b>
    </div>`).join("");

  const approved = input.profile.reviewStatus === "approved";
  const statusPill = approved
    ? `<span class="status-pill pale">세전 예상</span>`
    : `<span class="status-pill warn">검증용 예상액 · 검토 대기</span>`;

  target.innerHTML = `
    <div class="result-header">
      <div><p class="eyebrow">${input.profile.label}</p><h3>병가 급여 영향</h3></div>
      ${statusPill}
    </div>
    <div class="leave-summary">
      <div><span>이번 병가</span><strong>${input.currentSickDays}일</strong></div>
      <div><span>유급 처리</span><strong>${result.allocation.paidCurrent}일</strong></div>
      <div><span>무급 처리</span><strong class="danger">${result.allocation.unpaidCurrent}일</strong></div>
    </div>
    ${warningHtml}
    <div class="result-lines">${rows}</div>
    <div class="total-row"><span>이번 달 세전 지급액</span><strong>${formatWon(result.gross)}</strong></div>
    <div class="excluded-box"><strong>계산 제외</strong><span>소득세 · 지방소득세 · 4대보험 · 실수령액</span></div>
    <details>
      <summary>적용 근거와 계산 원칙</summary>
      <p>복무지침 병가 기준과 임금지침 표시 57~58쪽의 일할 계산식을 적용했습니다. 각 항목은 원 단위에서 절상합니다.</p>
    </details>`;
}

profileSelect.addEventListener("change", renderProfile);
form.addEventListener("change", (event) => {
  if (event.target.name === "inputMode") renderComponents();
  if (event.target.id === "scheduleType") toggleVacationField();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const input = buildInput();
    const result = calculateGrossPay(input);
    renderResult(result, input);
  } catch (error) {
    renderError(error.message);
  }
});

renderProfile();
