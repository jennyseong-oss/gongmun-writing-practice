export const PROFILES = {
  education: {
    id: "education", label: "교육실무사", kind: "monthly", schedule: "continuous", paidSickLeaveLimit: 40,
    reviewStatus: "approved",
    components: [
      { id: "base", label: "기본급 2유형", amount: 2144500 },
      { id: "meal", label: "급식비", amount: 160000 },
      { id: "longevity", label: "근속수당", amount: 0, vacationException: true, note: "실제 지급액을 입력하세요" },
      { id: "family", label: "가족수당", amount: 0, vacationException: true, note: "실제 지급액을 입력하세요" },
    ], holidayBonus: 1072250, regularBonus: 500000,
  },
  nutritionist: {
    id: "nutritionist", label: "영양사", kind: "monthly", schedule: "continuous", paidSickLeaveLimit: 40,
    reviewStatus: "pending",
    components: [
      { id: "base", label: "기본급 1유형", amount: 2344500 },
      { id: "meal", label: "급식비", amount: 160000 },
      { id: "license", label: "면허가산수당", amount: 117230, note: "책임·부영양사 여부 확인" },
      { id: "hazard", label: "위험수당", amount: 70000, note: "급식업무 직접 관리 시" },
      { id: "dietary", label: "식생활지도수당", amount: 50000 },
      { id: "longevity", label: "근속수당", amount: 0, vacationException: true, note: "실제 지급액을 입력하세요" },
      { id: "family", label: "가족수당", amount: 0, vacationException: true, note: "실제 지급액을 입력하세요" },
    ], holidayBonus: 1072250, regularBonus: 500000,
  },
  specialEducation: {
    id: "specialEducation", label: "특수교육실무사", kind: "monthly", schedule: "vacation", paidSickLeaveLimit: 40,
    reviewStatus: "pending",
    components: [
      { id: "base", label: "기본급 2유형", amount: 2144500 },
      { id: "meal", label: "급식비", amount: 160000 },
      { id: "special", label: "특수교육지원수당", amount: 20000 },
      { id: "longevity", label: "근속수당", amount: 0, vacationException: true, note: "방학 월 예외 적용" },
      { id: "family", label: "가족수당", amount: 0, vacationException: true, note: "방학 월 예외 적용" },
    ], holidayBonus: 1072250, regularBonus: 500000,
  },
  cook: {
    id: "cook", label: "조리사", kind: "monthly", schedule: "vacation", paidSickLeaveLimit: 40,
    reviewStatus: "pending",
    components: [
      { id: "base", label: "기본급 2유형", amount: 2144500 },
      { id: "meal", label: "급식비", amount: 160000 },
      { id: "license", label: "조리사면허수당", amount: 107230, note: "면허·선임 지급조건 확인" },
      { id: "hazard", label: "위험수당", amount: 70000 },
      { id: "longevity", label: "근속수당", amount: 0, vacationException: true },
      { id: "family", label: "가족수당", amount: 0, vacationException: true },
    ], holidayBonus: 1072250, regularBonus: 500000,
  },
  cookingWorker: {
    id: "cookingWorker", label: "조리실무사", kind: "monthly", schedule: "vacation", paidSickLeaveLimit: 40,
    reviewStatus: "pending",
    components: [
      { id: "base", label: "기본급 2유형", amount: 2144500 },
      { id: "meal", label: "급식비", amount: 160000 },
      { id: "hazard", label: "위험수당", amount: 70000 },
      { id: "longevity", label: "근속수당", amount: 0, vacationException: true },
      { id: "family", label: "가족수당", amount: 0, vacationException: true },
    ], holidayBonus: 1072250, regularBonus: 500000,
  },
  hourly: {
    id: "hourly", label: "시급제 단시간 근로자", kind: "hourly", schedule: "hourly", paidSickLeaveLimit: 40,
    reviewStatus: "pending",
    hourlyWage: 12570, components: [],
  },
};

export function roundHalfUp(value) {
  return Math.floor(value + 0.5);
}

export function getSickLeaveAllocation({ employmentType, contractMonths, previousSickDays, currentSickDays, paidLimit = 40 }) {
  if (employmentType === "ultra-short") {
    return { eligible: false, totalLimit: 0, paidLimit: 0, paidCurrent: 0, unpaidCurrent: currentSickDays };
  }

  if (employmentType === "fixed" && contractMonths <= 3) {
    return { eligible: false, totalLimit: 0, paidLimit: 0, paidCurrent: 0, unpaidCurrent: currentSickDays };
  }

  const factor = employmentType === "fixed" && contractMonths < 12 ? contractMonths / 12 : 1;
  const proratedPaidLimit = roundHalfUp(paidLimit * factor);
  const totalLimit = roundHalfUp(60 * factor);
  const paidBefore = Math.min(previousSickDays, proratedPaidLimit);
  const paidAfter = Math.min(previousSickDays + currentSickDays, proratedPaidLimit);
  const paidCurrent = Math.max(0, paidAfter - paidBefore);
  const unpaidCurrent = Math.max(0, currentSickDays - paidCurrent);
  return { eligible: true, totalLimit, paidLimit: proratedPaidLimit, paidCurrent, unpaidCurrent };
}

function ceilWon(value) {
  return Math.ceil(value - 1e-10) || 0;
}

function calculateMonthly(input) {
  const { profile, daysInMonth, scheduleType, allocation } = input;
  const warnings = [];
  if (profile.reviewStatus !== "approved") warnings.push("이 대표 프로필은 급여담당자 검토가 완료되지 않았습니다. 결과는 검증용 예상값이며 공개 계산에는 사용할 수 없습니다.");
  if (!allocation.eligible) warnings.push("현재 계약조건에서는 일반 병가가 부여되지 않을 수 있습니다.");
  if (input.currentSickDays + input.previousSickDays > allocation.totalLimit) warnings.push("연간 병가 총 한도를 초과하는 구간은 결근 등 별도 처리가 필요합니다.");
  if (input.inputMode === "standard") warnings.push("표준금액으로 계산했습니다. 실제 급여명세 금액과 다르면 직접 입력 모드를 사용하세요.");
  if (["nutritionist", "cook"].includes(profile.id)) warnings.push("자격·담당업무에 따른 직종수당 지급 여부를 확인하세요.");
  if (scheduleType === "vacation") warnings.push("학교 학사일정과 방학 중 지정 근무일을 급여담당자가 확인해야 합니다.");

  const unpaid = allocation.unpaidCurrent;
  const vacationOverlap = Math.min(unpaid, input.unpaidDaysInVacation);
  const lines = input.components.map((component) => {
    const deduction = scheduleType === "vacation" && component.vacationException ? Math.max(0, unpaid - vacationOverlap) : unpaid;
    const paid = ceilWon(component.amount * (daysInMonth - deduction) / daysInMonth);
    return { ...component, paid, formula: deduction ? `${formatWon(component.amount)} × (${daysInMonth}-${deduction}) ÷ ${daysInMonth}` : "유급 범위 · 전액" };
  });

  if (input.includeHolidayBonus) lines.push({ id: "holidayBonus", label: "명절휴가비", paid: profile.holidayBonus, formula: "지급기준 충족 · 전액" });
  if (input.includeRegularBonus) lines.push({ id: "regularBonus", label: "정기상여금", paid: profile.regularBonus, formula: "지급기준 충족 · 전액" });
  return { allocation, lines, gross: lines.reduce((sum, line) => sum + line.paid, 0), warnings };
}

function calculateHourly(input) {
  const warnings = [];
  if (input.profile.reviewStatus !== "approved") warnings.push("이 대표 프로필은 급여담당자 검토가 완료되지 않았습니다. 결과는 검증용 예상값이며 공개 계산에는 사용할 수 없습니다.");
  const wage = input.inputMode === "actual" ? Number(input.hourlyWage || input.profile.hourlyWage) : input.profile.hourlyWage;
  const eligibleForPaidSickLeave = input.weeklyHours >= 15 && input.allocation.eligible;
  const paidSickHours = eligibleForPaidSickLeave ? input.allocation.paidCurrent * input.dailyHours : 0;
  if (input.weeklyHours < 15) warnings.push("주 15시간 미만은 일반 주휴와 병가 적용 대상에서 제외될 수 있습니다.");
  if (!input.allocation.eligible) warnings.push("현재 계약조건에서는 일반 병가가 부여되지 않을 수 있습니다.");
  warnings.push("시급제는 실제 근로계약서와 주휴시간을 반드시 확인하세요.");
  const totalHours = input.actualWorkHours + input.paidHolidayHours + paidSickHours;
  const gross = roundHalfUp(wage * totalHours);
  return {
    allocation: input.allocation,
    lines: [{ label: "시급제 임금", paid: gross, formula: `${formatWon(wage)} × (${input.actualWorkHours}+${input.paidHolidayHours}+${paidSickHours})시간` }],
    gross,
    warnings,
  };
}

export function calculateGrossPay(input) {
  if (!input.profile) throw new Error("profile is required");
  if (!input.daysInMonth || input.daysInMonth < 1) throw new Error("daysInMonth must be positive");
  return input.profile.kind === "hourly" ? calculateHourly(input) : calculateMonthly(input);
}

export function formatWon(value) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}
