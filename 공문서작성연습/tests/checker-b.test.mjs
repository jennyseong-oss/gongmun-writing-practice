import { test } from "node:test";
import assert from "node:assert/strict";
import { checkB1, checkB2, checkB3, checkB5, checkB6, checkAllB } from "../checker-b.js";

test("B1: 단계를 건너뛰지 않으면 통과", () => {
  const result = checkB1("1. 목적\n  가. 세부 목적\n2. 일시");
  assert.equal(result.status, "pass");
});

test("B1: 둘째 단계를 건너뛰고 다섯째 단계를 쓰면 경고", () => {
  const result = checkB1("1. 목적\n  (1) 세부 사항\n2. 일시");
  assert.equal(result.status, "warn");
});

test("B2: 기호 뒤 한 칸이면 통과", () => {
  const result = checkB2("1. 목적");
  assert.equal(result.status, "pass");
});

test("B2: 기호 뒤 두 칸 이상이면 경고", () => {
  const result = checkB2("1.  목적");
  assert.equal(result.status, "warn");
});

test("B2: 기호 뒤 붙여 쓰면 경고", () => {
  const result = checkB2("가.내용");
  assert.equal(result.status, "warn");
});

test("B3: 단계별 들여쓰기가 올바르면 통과", () => {
  const result = checkB3("1. 목적\n  가. 세부 목적");
  assert.equal(result.status, "pass");
});

test("B3: 둘째 단계인데 들여쓰기가 없으면 경고", () => {
  const result = checkB3("1. 목적\n가. 세부 목적");
  assert.equal(result.status, "warn");
});

test("B5: 항목이 여러 개면 통과", () => {
  const result = checkB5("1. 목적\n2. 일시");
  assert.equal(result.status, "pass");
});

test("B5: 항목이 하나뿐이면 경고", () => {
  const result = checkB5("1. 참가 대상은 신규 임용자입니다.");
  assert.equal(result.status, "warn");
});

test("B5: 항목 기호가 없으면 안내(info)", () => {
  const result = checkB5("본문 문장만 있는 경우입니다.");
  assert.equal(result.status, "info");
});

test("B6: 정식 기호만 쓰면 통과", () => {
  const result = checkB6("1. 목적\n가. 세부 내용");
  assert.equal(result.status, "pass");
});

test("B6: '-'를 항목 기호로 쓰면 경고", () => {
  const result = checkB6("- 목적");
  assert.equal(result.status, "warn");
});

test("B6: 영문자를 항목 기호로 쓰면 경고", () => {
  const result = checkB6("A. 세부 내용");
  assert.equal(result.status, "warn");
});

test("checkAllB: B1~B6을 순서대로 반환하며 B4는 항상 info", () => {
  const results = checkAllB("1. 목적\n  가. 세부 목적\n2. 일시");
  assert.equal(results.length, 6);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    ["B1", "B2", "B3", "B4", "B5", "B6"],
  );
  assert.equal(results[3].status, "info");
});
