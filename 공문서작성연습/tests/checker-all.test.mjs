import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAllModules } from "../checker-all.js";

test("checkAllModules: 27개 항목(A6+B6+C4+D7+E4)을 모듈 순서대로 반환", () => {
  const results = checkAllModules("아무 텍스트");
  assert.equal(results.length, 27);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    [
      "A1", "A2", "A3", "A4", "A5", "A6",
      "B1", "B2", "B3", "B4", "B5", "B6",
      "C1", "C2", "C3", "C4",
      "D1", "D2", "D3", "D4", "D5", "D6", "D7",
      "E1", "E2", "E3", "E4",
    ],
  );
});

test("checkAllModules: 잘 쓴 기안문은 대부분 통과로 판정", () => {
  const text = [
    "2026학년도 신규자 직무연수 참가자를 다음과 같이 모집합니다.",
    "",
    "1. 목적",
    "  가. 신규 임용자의 행정업무 이해도 향상",
    "2. 일시: 2026. 8. 10.~8. 14. 09:00~18:00",
    "3. 참가 인원: 30명",
    "",
    "참석 여부를 알려 주시기 바랍니다.",
    "",
    "붙임  참가신청서 1부.  끝.",
  ].join("\n");
  const results = checkAllModules(text);
  const warnCount = results.filter((r) => r.status === "warn").length;
  assert.ok(warnCount === 0, `경고 없이 통과해야 하는데 ${warnCount}건 발생: ${JSON.stringify(results.filter((r) => r.status === "warn"))}`);
});

test("checkAllModules: 여러 모듈에 걸친 오류를 동시에 잡아낸다", () => {
  const text = [
    "신규자 연수가 있어서 안내드립니다.",
    "1.  목적",
    "가.내용",
    "2026년 4월 15일 오후 3시에 진행합니다.",
    "참석여부를 제출할 것.",
  ].join("\n");
  const results = checkAllModules(text);
  const warnRuleIds = results.filter((r) => r.status === "warn").map((r) => r.ruleId);
  assert.ok(warnRuleIds.includes("A2"));
  assert.ok(warnRuleIds.includes("B2"));
  assert.ok(warnRuleIds.includes("C1"));
  assert.ok(warnRuleIds.includes("C2"));
  assert.ok(warnRuleIds.includes("D4"));
  assert.ok(warnRuleIds.includes("D5"));
});
