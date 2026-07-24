import { test } from "node:test";
import assert from "node:assert/strict";
import { checkA2, checkA3, checkA4, checkA5, checkA6, checkAll } from "../checker.js";

test("A2: 관용구 있는 대외 공문은 통과", () => {
  const result = checkA2("2026학년도 직무연수 계획을 다음과 같이 안내합니다.");
  assert.equal(result.status, "pass");
});

test("A2: 품의/구입 문서는 관용구 없이도 통과", () => {
  const result = checkA2("교직원 복무관리 프로그램 구입을 위해 품의합니다.");
  assert.equal(result.status, "pass");
});

test("A2: 관용구도 없고 예외 사유도 없으면 경고", () => {
  const result = checkA2("신규자 연수가 있어서 안내드립니다.");
  assert.equal(result.status, "warn");
});

test("A3: 올바른 붙임 표기는 통과", () => {
  const result = checkA3("붙임  2026학년도 직무연수 계획서 1부.  끝.");
  assert.equal(result.status, "pass");
});

test("A3: '첨부' 표현은 경고", () => {
  const result = checkA3("첨부: 계획서 1부.");
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "첨부");
  assert.equal(result.matchIndex, 0);
});

test("A3: '붙임' 뒤 한 칸만 띄우면 경고", () => {
  const result = checkA3("붙임 계획서 1부.");
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "붙임 계");
  assert.equal(result.matchIndex, 0);
});

test("A3: 붙임 표기가 없으면 안내(info)", () => {
  const result = checkA3("참석하여 주시기 바랍니다.  끝.");
  assert.equal(result.status, "info");
});

test("A4: 경어체 문장은 통과", () => {
  const result = checkA4("붙임 서식을 작성하여 제출하여 주시기 바랍니다.");
  assert.equal(result.status, "pass");
});

test("A4: 명령형 문장은 경고", () => {
  const text = "붙임 서식을 작성하여 제출할 것.";
  const result = checkA4(text);
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "할 것.");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), "할 것.");
});

test("A5: 두 칸 띄우고 끝. 있으면 통과", () => {
  const result = checkA5("참석하여 주시기 바랍니다.  끝.");
  assert.equal(result.status, "pass");
});

test("A5: 끝. 표시가 없으면 경고", () => {
  const result = checkA5("참석하여 주시기 바랍니다.");
  assert.equal(result.status, "warn");
});

test("A5: 끝. 앞에 한 칸만 있으면 경고", () => {
  const text = "참석하여 주시기 바랍니다. 끝.";
  const result = checkA5(text);
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "끝.");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), "끝.");
});

test("A6: 올바른 관련문서 표시는 통과", () => {
  const result = checkA6("교육운영과-1234(2026. 3. 10.)호와 관련됩니다.");
  assert.equal(result.status, "pass");
});

test("A6: 붙임표 누락·날짜 오류는 경고", () => {
  const result = checkA6("교육운영과 1234(2026.3.10)호와 관련됩니다.");
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "관련됩니다");
});

test("A6: 관련문서 인용이 없으면 안내(info)", () => {
  const result = checkA6("참석하여 주시기 바랍니다.  끝.");
  assert.equal(result.status, "info");
});

test("checkAll: A1을 포함해 6개 항목을 순서대로 반환", () => {
  const results = checkAll("2026학년도 직무연수 계획을 다음과 같이 안내합니다.\n참석하여 주시기 바랍니다.  끝.");
  assert.equal(results.length, 6);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    ["A1", "A2", "A3", "A4", "A5", "A6"],
  );
  assert.equal(results[0].status, "info");
});
