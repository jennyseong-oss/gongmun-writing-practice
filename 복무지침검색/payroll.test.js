import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./payroll.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const {
  PROFILE,
  NUTRITIONIST_PROFILE,
  prorate,
  longevityAmount,
  familyAllowanceAmount,
  calculateEducationPracticeWorkerGrossPay,
  calculateNutritionistGrossPay,
  calculateGrossPay,
} = globalThis.PayrollCalculator;

const profile = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "profiles", "education-practice-worker.json"), "utf8")
);
const profileComponents = Object.fromEntries(profile.payComponents.map((component) => [component.id, component]));
assert.equal(PROFILE.basePayWon, profileComponents.base_pay.amountWon);
assert.equal(PROFILE.mealAllowanceWon, profileComponents.meal_allowance.amountWon);
assert.equal(PROFILE.longevityIncrementWon, profileComponents.longevity_allowance.amountRule.incrementWonPerYear);
assert.equal(PROFILE.holidayBonusInstallmentWon, profileComponents.holiday_bonus.installments[0].amountWon);
assert.equal(PROFILE.regularBonusInstallmentWon, profileComponents.regular_bonus.installments[0].amountWon);

const nutritionistProfile = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "profiles", "nutritionist.json"), "utf8")
);
const nutritionistComponents = Object.fromEntries(
  nutritionistProfile.payComponents.map((component) => [component.id, component])
);
assert.equal(NUTRITIONIST_PROFILE.basePayWon, nutritionistComponents.base_pay.amountWon);
assert.equal(NUTRITIONIST_PROFILE.mealAllowanceWon, nutritionistComponents.meal_allowance.amountWon);
assert.equal(NUTRITIONIST_PROFILE.licenseAllowanceWon, nutritionistComponents.license_additional_allowance.amountRule.leadNutritionistWon);
assert.equal(
  NUTRITIONIST_PROFILE.assistantNutritionistLicenseAllowanceWon,
  nutritionistComponents.license_additional_allowance.amountRule.otherNutritionistWhenMultipleWon
);
assert.equal(NUTRITIONIST_PROFILE.hazardAllowanceWon, nutritionistComponents.hazard_allowance.amountWon);
assert.equal(
  NUTRITIONIST_PROFILE.dietaryGuidanceAllowanceWon,
  nutritionistComponents.dietary_guidance_allowance.amountWon
);

assert.equal(prorate(2144500, 31, 1), 2075323);
assert.equal(prorate(160000, 31, 1), 154839);
assert.equal(longevityAmount(0), 0);
assert.equal(longevityAmount(5), 205000);
assert.equal(longevityAmount(30), 984000);
assert.equal(familyAllowanceAmount({ spouse: true, linealAscendants: 1, children: 3 }), 310000);

const unpaidOneDay = calculateEducationPracticeWorkerGrossPay({
  daysInMonth: 31,
  unpaidSickLeaveDays: 1,
  weeklyContractHours: 40,
  recognizedServiceYears: 0,
  family: {},
});
assert.equal(unpaidOneDay.grossPayWon, 2230162);

const paidLeaveOnly = calculateEducationPracticeWorkerGrossPay({
  daysInMonth: 31,
  unpaidSickLeaveDays: 0,
  weeklyContractHours: 40,
  recognizedServiceYears: 0,
  family: {},
});
assert.equal(paidLeaveOnly.grossPayWon, 2304500);

const allCommonAllowances = calculateEducationPracticeWorkerGrossPay({
  daysInMonth: 30,
  unpaidSickLeaveDays: 0,
  weeklyContractHours: 40,
  recognizedServiceYears: 5,
  family: { spouse: true, linealAscendants: 0, children: 2 },
  holidayBonusEligible: true,
  regularBonusEligible: true,
});
assert.equal(allCommonAllowances.grossPayWon, 4251750);

assert.throws(
  () => calculateEducationPracticeWorkerGrossPay({ daysInMonth: 31, unpaidSickLeaveDays: 32, weeklyContractHours: 40 }),
  /무급 병가일수/
);

const nutritionistUnpaidOneDay = calculateNutritionistGrossPay({
  daysInMonth: 31,
  unpaidSickLeaveDays: 1,
  weeklyContractHours: 40,
  recognizedServiceYears: 0,
  family: {},
  nutritionistLicenseAllowanceRole: "none",
});
assert.equal(nutritionistUnpaidOneDay.grossPayWon, 2423710);

const nutritionistAllOccupationAllowances = calculateNutritionistGrossPay({
  daysInMonth: 30,
  unpaidSickLeaveDays: 0,
  weeklyContractHours: 40,
  recognizedServiceYears: 0,
  family: {},
  nutritionistLicenseAllowanceRole: "chief_or_sole",
  directMealServiceManagement: true,
  worksAtInstitutionOrSchool: true,
});
assert.equal(nutritionistAllOccupationAllowances.grossPayWon, 2741730);

const assistantNutritionist = calculateGrossPay({
  occupationId: "nutritionist",
  daysInMonth: 30,
  unpaidSickLeaveDays: 0,
  weeklyContractHours: 40,
  recognizedServiceYears: 0,
  family: {},
  nutritionistLicenseAllowanceRole: "assistant",
});
assert.equal(assistantNutritionist.grossPayWon, 2524500);
assert.equal(assistantNutritionist.occupationName, "영양사");

assert.throws(
  () => calculateNutritionistGrossPay({
    daysInMonth: 31,
    unpaidSickLeaveDays: 0,
    weeklyContractHours: 40,
    nutritionistLicenseAllowanceRole: "unknown",
  }),
  /면허가산수당/
);

console.log("교육실무사·영양사 급여 계산 및 프로필 연결 테스트 26건 통과");
