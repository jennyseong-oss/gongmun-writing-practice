import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROFILES } from "../calculator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profilesDir = path.join(__dirname, "..", "data", "profiles");

function readProfileJson(file) {
  return JSON.parse(fs.readFileSync(path.join(profilesDir, file), "utf8"));
}

function installmentAmount(component) {
  return component.installmentAmountWon
    ?? component.installments?.[0]?.amountWon
    ?? Math.round(component.annualAmountWon / 2);
}

// 화면 계산 엔진(calculator.js)의 각 대표 프로필이 근거문서에서 구조화한
// data/profiles/*.json 의 표준 금액과 어긋나지 않는지 대조한다.
const MONTHLY_PROFILE_JSON_MAP = {
  education: {
    file: "education-practice-worker.json",
    components: [["base", "base_pay"], ["meal", "meal_allowance"]],
  },
  nutritionist: {
    file: "nutritionist.json",
    components: [["base", "base_pay"], ["meal", "meal_allowance"], ["hazard", "hazard_allowance"], ["dietary", "dietary_guidance_allowance"]],
    ruleComponents: [["license", "license_additional_allowance", "leadNutritionistWon"]],
  },
  specialEducation: {
    file: "special-education-practice-worker.json",
    components: [["base", "base_pay"], ["meal", "meal_allowance"], ["special", "special_education_support_allowance"]],
  },
  cook: {
    file: "cook.json",
    components: [["base", "base_pay"], ["meal", "meal_allowance"], ["license", "cook_license_allowance"], ["hazard", "hazard_allowance"]],
  },
  cookingWorker: {
    file: "cooking-practice-worker.json",
    components: [["base", "base_pay"], ["meal", "meal_allowance"], ["hazard", "hazard_allowance"]],
  },
};

for (const [profileId, mapping] of Object.entries(MONTHLY_PROFILE_JSON_MAP)) {
  const json = readProfileJson(mapping.file);
  const calcProfile = PROFILES[profileId];
  assert.equal(calcProfile.label, json.occupationName, `${profileId}.label ↔ occupationName`);

  const jsonComponents = Object.fromEntries(json.payComponents.map((component) => [component.id, component]));
  const calcComponents = Object.fromEntries(calcProfile.components.map((component) => [component.id, component]));

  for (const [calcId, jsonId] of mapping.components) {
    assert.equal(
      calcComponents[calcId].amount,
      jsonComponents[jsonId].amountWon,
      `${profileId}.${calcId} 금액이 ${mapping.file}의 ${jsonId}.amountWon과 다릅니다`
    );
  }

  for (const [calcId, jsonId, ruleField] of mapping.ruleComponents ?? []) {
    assert.equal(
      calcComponents[calcId].amount,
      jsonComponents[jsonId].amountRule[ruleField],
      `${profileId}.${calcId} 금액이 ${mapping.file}의 ${jsonId}.amountRule.${ruleField}와 다릅니다`
    );
  }

  assert.equal(
    calcProfile.holidayBonus,
    installmentAmount(jsonComponents.holiday_bonus),
    `${profileId}.holidayBonus가 ${mapping.file}의 명절휴가비 회당 지급액과 다릅니다`
  );
  assert.equal(
    calcProfile.regularBonus,
    installmentAmount(jsonComponents.regular_bonus),
    `${profileId}.regularBonus가 ${mapping.file}의 정기상여금 회당 지급액과 다릅니다`
  );
}

const hourlyJson = readProfileJson("hourly-part-time-worker.json");
assert.equal(PROFILES.hourly.label, hourlyJson.occupationName, "hourly.label ↔ occupationName");
assert.equal(
  PROFILES.hourly.hourlyWage,
  hourlyJson.classification.baseHourlyWageWon,
  "hourly.hourlyWage가 hourly-part-time-worker.json의 baseHourlyWageWon과 다릅니다"
);

console.log("6개 대표 프로필 표준 급여항목이 구조화 JSON과 모두 일치함을 확인했습니다");
