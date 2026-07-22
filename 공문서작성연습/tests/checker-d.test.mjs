import { test } from "node:test";
import assert from "node:assert/strict";
import { checkD1, checkD2, checkD3, checkD4, checkD5, checkD6, checkD7, checkAllD } from "../checker-d.js";

test("D1: 어려운 말이 없으면 통과", () => {
  const result = checkD1("업무 효율을 높이기 위해 노력하겠습니다.");
  assert.equal(result.status, "pass");
});

test("D1: '제고'가 있으면 경고", () => {
  const result = checkD1("업무 효율 제고를 위해 노력하겠습니다.");
  assert.equal(result.status, "warn");
});

test("D2: 번역투가 없으면 통과", () => {
  const result = checkD2("예산 부족으로 사업이 지연되었습니다.");
  assert.equal(result.status, "pass");
});

test("D2: '~에 의해'가 있으면 경고", () => {
  const result = checkD2("예산 부족에 의해 사업이 지연되었습니다.");
  assert.equal(result.status, "warn");
});

test("D3: 중복 표현이 없으면 통과", () => {
  const result = checkD3("참석자 과반수가 찬성했습니다.");
  assert.equal(result.status, "pass");
});

test("D3: '과반수 이상'이 있으면 경고", () => {
  const result = checkD3("참석자 과반수 이상이 찬성했습니다.");
  assert.equal(result.status, "warn");
});

test("D4: 띄어쓰기가 올바르면 통과", () => {
  const result = checkD4("참석 여부를 알려 주시기 바랍니다.");
  assert.equal(result.status, "pass");
});

test("D4: '참석여부'처럼 붙여 쓰면 경고", () => {
  const result = checkD4("참석여부를 알려 주시기 바랍니다.");
  assert.equal(result.status, "warn");
});

test("D5: 정중한 요청 표현은 통과", () => {
  const result = checkD5("서식을 작성하여 제출하여 주시기 바랍니다.");
  assert.equal(result.status, "pass");
});

test("D5: '~할 것.'은 경고", () => {
  const result = checkD5("서식을 작성하여 제출할 것.");
  assert.equal(result.status, "warn");
});

test("D6: 수식어 중복이 없으면 통과", () => {
  const result = checkD6("많은 관심 부탁드립니다.");
  assert.equal(result.status, "pass");
});

test("D6: '매우 대단히'는 경고", () => {
  const result = checkD6("매우 대단히 많은 관심 부탁드립니다.");
  assert.equal(result.status, "warn");
});

test("D7: 올바른 외래어 표기는 통과", () => {
  const result = checkD7("마케팅 전략을 안내합니다.");
  assert.equal(result.status, "pass");
});

test("D7: '마켓팅'은 경고", () => {
  const result = checkD7("마켓팅 전략을 안내합니다.");
  assert.equal(result.status, "warn");
});

test("checkAllD: D1~D7을 순서대로 반환", () => {
  const results = checkAllD("업무 효율을 높이기 위해 노력하겠습니다.");
  assert.equal(results.length, 7);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
  );
});
