import assert from "node:assert/strict";
import { PROFILES, calculateGrossPay, getSickLeaveAllocation } from "../calculator.js";

const allocation40 = getSickLeaveAllocation({ employmentType: "indefinite", contractMonths: 12, previousSickDays: 40, currentSickDays: 1, paidLimit: 40 });
assert.equal(allocation40.paidCurrent, 0);
assert.equal(allocation40.unpaidCurrent, 1);

const fixedSixMonths = getSickLeaveAllocation({ employmentType: "fixed", contractMonths: 6, previousSickDays: 0, currentSickDays: 30, paidLimit: 40 });
assert.equal(fixedSixMonths.totalLimit, 30);
assert.equal(fixedSixMonths.paidLimit, 20);
assert.equal(fixedSixMonths.paidCurrent, 20);
assert.equal(fixedSixMonths.unpaidCurrent, 10);

const educationResult = calculateGrossPay({
  profile: PROFILES.education, inputMode: "standard", employmentType: "indefinite", currentSickDays: 1,
  daysInMonth: 31, scheduleType: "continuous", unpaidDaysInVacation: 0,
  components: PROFILES.education.components.slice(0, 2), includeHolidayBonus: false, includeRegularBonus: false,
  allocation: allocation40,
});
assert.equal(educationResult.gross, 2230162);

const hourlyAllocation = getSickLeaveAllocation({ employmentType: "fixed", contractMonths: 6, previousSickDays: 0, currentSickDays: 1, paidLimit: 40 });
const hourlyResult = calculateGrossPay({
  profile: PROFILES.hourly, inputMode: "standard", daysInMonth: 31, weeklyHours: 20, dailyHours: 4,
  actualWorkHours: 60, paidHolidayHours: 12, components: [], allocation: hourlyAllocation,
});
assert.equal(hourlyResult.gross, 955320);

const ultraShortResult = calculateGrossPay({
  profile: PROFILES.hourly, inputMode: "actual", daysInMonth: 31, weeklyHours: 14, dailyHours: 4,
  actualWorkHours: 60, paidHolidayHours: 0, hourlyWage: 13000, components: [], allocation: hourlyAllocation,
});
assert.equal(ultraShortResult.gross, 780000);
assert.match(ultraShortResult.warnings.join(" "), /15시간 미만/);

console.log("calculator tests passed");
