(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PayrollCalculator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PROFILE = Object.freeze({
    occupationName: "교육실무사",
    year: 2026,
    basePayWon: 2144500,
    mealAllowanceWon: 160000,
    mealAllowanceMinimumWeeklyHours: 20,
    longevityIncrementWon: 41000,
    longevityMaximumYears: 24,
    holidayBonusInstallmentWon: 1072250,
    regularBonusInstallmentWon: 500000,
    computerCertificateAllowanceWon: 50000,
  });

  const NUTRITIONIST_PROFILE = Object.freeze({
    occupationName: "영양사",
    year: 2026,
    basePayWon: 2344500,
    mealAllowanceWon: 160000,
    mealAllowanceMinimumWeeklyHours: 20,
    licenseAllowanceWon: 117230,
    assistantNutritionistLicenseAllowanceWon: 20000,
    hazardAllowanceWon: 70000,
    dietaryGuidanceAllowanceWon: 50000,
    holidayBonusInstallmentWon: 1072250,
    regularBonusInstallmentWon: 500000,
  });

  function integer(value, field, minimum, maximum) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
      throw new Error(`${field} 값은 ${minimum}~${maximum} 사이의 정수여야 합니다.`);
    }
    return parsed;
  }

  function prorate(amountWon, daysInMonth, deductionDays) {
    return Math.ceil((amountWon * (daysInMonth - deductionDays)) / daysInMonth);
  }

  function longevityAmount(recognizedServiceYears) {
    const years = Math.min(Math.max(Math.floor(Number(recognizedServiceYears) || 0), 0), PROFILE.longevityMaximumYears);
    return years * PROFILE.longevityIncrementWon;
  }

  function familyAllowanceAmount(family) {
    const safe = family || {};
    const ascendants = integer(safe.linealAscendants || 0, "직계존속 수", 0, 20);
    const children = integer(safe.children || 0, "자녀 수", 0, 20);
    let amount = safe.spouse ? 40000 : 0;
    amount += ascendants * 20000;
    if (children >= 1) amount += 50000;
    if (children >= 2) amount += 80000;
    if (children >= 3) amount += (children - 2) * 120000;
    return amount;
  }

  function calculateEducationPracticeWorkerGrossPay(input) {
    const daysInMonth = integer(input.daysInMonth, "해당 월 총일수", 28, 31);
    const unpaidSickLeaveDays = integer(input.unpaidSickLeaveDays || 0, "무급 병가일수", 0, daysInMonth);
    const weeklyContractHours = Number(input.weeklyContractHours);
    if (!Number.isFinite(weeklyContractHours) || weeklyContractHours < 0 || weeklyContractHours > 40) {
      throw new Error("주당 소정근로시간은 0~40시간이어야 합니다.");
    }

    const monthlyComponents = [
      { id: "base_pay", name: "기본급(2유형)", originalWon: PROFILE.basePayWon },
    ];

    if (weeklyContractHours >= PROFILE.mealAllowanceMinimumWeeklyHours) {
      monthlyComponents.push({ id: "meal_allowance", name: "급식비", originalWon: PROFILE.mealAllowanceWon });
    }

    const longevityWon = longevityAmount(input.recognizedServiceYears);
    if (longevityWon > 0) {
      monthlyComponents.push({ id: "longevity_allowance", name: "근속수당", originalWon: longevityWon });
    }

    const familyWon = familyAllowanceAmount(input.family);
    if (familyWon > 0) {
      monthlyComponents.push({ id: "family_allowance", name: "가족수당", originalWon: familyWon });
    }

    if (input.computerVariantEligible) {
      monthlyComponents.push({
        id: "computer_practice_certificate_allowance",
        name: "전산실무사 자격수당",
        originalWon: PROFILE.computerCertificateAllowanceWon,
      });
    }

    const components = monthlyComponents.map((component) => ({
      ...component,
      paidWon: prorate(component.originalWon, daysInMonth, unpaidSickLeaveDays),
      policy: "일할계산",
    }));

    if (input.holidayBonusEligible) {
      components.push({
        id: "holiday_bonus",
        name: "명절휴가비",
        originalWon: PROFILE.holidayBonusInstallmentWon,
        paidWon: PROFILE.holidayBonusInstallmentWon,
        policy: "자격 충족 시 전액",
      });
    }

    if (input.regularBonusEligible) {
      components.push({
        id: "regular_bonus",
        name: "정기상여금",
        originalWon: PROFILE.regularBonusInstallmentWon,
        paidWon: PROFILE.regularBonusInstallmentWon,
        policy: "자격 충족 시 전액",
      });
    }

    return {
      occupationName: PROFILE.occupationName,
      year: PROFILE.year,
      daysInMonth,
      unpaidSickLeaveDays,
      components,
      grossPayWon: components.reduce((sum, component) => sum + component.paidWon, 0),
      scope: "세전 지급액",
    };
  }

  function calculateNutritionistGrossPay(input) {
    const daysInMonth = integer(input.daysInMonth, "해당 월 총일수", 28, 31);
    const unpaidSickLeaveDays = integer(input.unpaidSickLeaveDays || 0, "무급 병가일수", 0, daysInMonth);
    const weeklyContractHours = Number(input.weeklyContractHours);
    if (!Number.isFinite(weeklyContractHours) || weeklyContractHours < 0 || weeklyContractHours > 40) {
      throw new Error("주당 소정근로시간은 0~40시간이어야 합니다.");
    }

    const licenseRole = input.nutritionistLicenseAllowanceRole || "none";
    if (!["none", "chief_or_sole", "assistant"].includes(licenseRole)) {
      throw new Error("면허가산수당 구분을 확인해 주세요.");
    }

    const monthlyComponents = [
      { id: "base_pay", name: "기본급(1유형)", originalWon: NUTRITIONIST_PROFILE.basePayWon },
    ];

    if (weeklyContractHours >= NUTRITIONIST_PROFILE.mealAllowanceMinimumWeeklyHours) {
      monthlyComponents.push({ id: "meal_allowance", name: "급식비", originalWon: NUTRITIONIST_PROFILE.mealAllowanceWon });
    }

    const longevityWon = longevityAmount(input.recognizedServiceYears);
    if (longevityWon > 0) {
      monthlyComponents.push({ id: "longevity_allowance", name: "근속수당", originalWon: longevityWon });
    }

    const familyWon = familyAllowanceAmount(input.family);
    if (familyWon > 0) {
      monthlyComponents.push({ id: "family_allowance", name: "가족수당", originalWon: familyWon });
    }

    if (licenseRole === "chief_or_sole") {
      monthlyComponents.push({
        id: "license_additional_allowance",
        name: "면허가산수당",
        originalWon: NUTRITIONIST_PROFILE.licenseAllowanceWon,
      });
    } else if (licenseRole === "assistant") {
      monthlyComponents.push({
        id: "license_additional_allowance",
        name: "면허가산수당(부영양사)",
        originalWon: NUTRITIONIST_PROFILE.assistantNutritionistLicenseAllowanceWon,
      });
    }

    if (input.directMealServiceManagement) {
      monthlyComponents.push({
        id: "nutritionist_hazard_allowance",
        name: "위험수당",
        originalWon: NUTRITIONIST_PROFILE.hazardAllowanceWon,
      });
    }

    if (input.worksAtInstitutionOrSchool) {
      monthlyComponents.push({
        id: "nutritionist_dietary_guidance_allowance",
        name: "식생활지도수당",
        originalWon: NUTRITIONIST_PROFILE.dietaryGuidanceAllowanceWon,
      });
    }

    const components = monthlyComponents.map((component) => ({
      ...component,
      paidWon: prorate(component.originalWon, daysInMonth, unpaidSickLeaveDays),
      policy: "일할계산",
    }));

    if (input.holidayBonusEligible) {
      components.push({
        id: "holiday_bonus",
        name: "명절휴가비",
        originalWon: NUTRITIONIST_PROFILE.holidayBonusInstallmentWon,
        paidWon: NUTRITIONIST_PROFILE.holidayBonusInstallmentWon,
        policy: "자격 충족 시 전액",
      });
    }

    if (input.regularBonusEligible) {
      components.push({
        id: "regular_bonus",
        name: "정기상여금",
        originalWon: NUTRITIONIST_PROFILE.regularBonusInstallmentWon,
        paidWon: NUTRITIONIST_PROFILE.regularBonusInstallmentWon,
        policy: "자격 충족 시 전액",
      });
    }

    return {
      occupationName: NUTRITIONIST_PROFILE.occupationName,
      year: NUTRITIONIST_PROFILE.year,
      daysInMonth,
      unpaidSickLeaveDays,
      components,
      grossPayWon: components.reduce((sum, component) => sum + component.paidWon, 0),
      scope: "세전 지급액",
    };
  }

  function calculateGrossPay(input) {
    if (input.occupationId === "nutritionist") return calculateNutritionistGrossPay(input);
    if (input.occupationId === "education_practice_worker") return calculateEducationPracticeWorkerGrossPay(input);
    throw new Error("지원하는 직종을 선택해 주세요.");
  }

  return {
    PROFILE,
    NUTRITIONIST_PROFILE,
    prorate,
    longevityAmount,
    familyAllowanceAmount,
    calculateEducationPracticeWorkerGrossPay,
    calculateNutritionistGrossPay,
    calculateGrossPay,
  };
});
