import { test } from "node:test";
import assert from "node:assert/strict";
import { checkC1, checkC2, checkC3, checkC4, checkAllC } from "../checker-c.js";

test("C1: 올바른 날짜 표기는 통과", () => {
  const result = checkC1("행사는 2026. 4. 15.에 진행합니다.");
  assert.equal(result.status, "pass");
});

test("C1: '년/월/일' 표기는 경고", () => {
  const text = "2026년 4월 15일에 진행합니다.";
  const result = checkC1(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
  assert.equal(result.matchText, "2026년 4월 15일");
});

test("C1: 온점 뒤 띄어쓰기가 없으면 경고", () => {
  const text = "2026.4.15에 진행합니다.";
  const result = checkC1(text);
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "2026.4.15");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C1: 월·일 앞에 0을 붙이면 경고", () => {
  const text = "2026. 04. 15.에 진행합니다.";
  const result = checkC1(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C1: 날짜 범위 물결표 앞뒤에 공백이 있으면 경고", () => {
  const text = "행사 기간은 4. 23. ~ 6. 15. 입니다.";
  const result = checkC1(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C1: 날짜 표기가 없으면 안내(info)", () => {
  const result = checkC1("특별한 날짜 언급이 없는 문장입니다.");
  assert.equal(result.status, "info");
});

test("C2: 올바른 시간 표기는 통과", () => {
  const result = checkC2("행사는 15:20에 시작합니다.");
  assert.equal(result.status, "pass");
});

test("C2: 한글 시각 표기는 경고", () => {
  const text = "오후 3시 20분에 시작합니다.";
  const result = checkC2(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C2: AM/PM 표기는 경고", () => {
  const text = "9:30 AM에 시작합니다.";
  const result = checkC2(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C2: 물결표 앞뒤 공백이 있으면 경고", () => {
  const text = "09:00 ~ 18:00 운영합니다.";
  const result = checkC2(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C2: 시가 한 자리 숫자면 경고", () => {
  const text = "9:00부터 진행합니다.";
  const result = checkC2(text);
  assert.equal(result.status, "warn");
  assert.equal(result.matchText, "9:00");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C2: 시간 표기가 없으면 안내(info)", () => {
  const result = checkC2("오늘 회의가 있습니다.");
  assert.equal(result.status, "info");
});

test("C2: '24시간'처럼 기간을 뜻하는 표현은 시각으로 오인하지 않음", () => {
  const result = checkC2("접수기간 내 24시간 접수 가능합니다.");
  assert.equal(result.status, "info");
});

test("C2: '시간' 오탐이 없으면 뒤에 나오는 올바른 시각 표기로 통과 판정", () => {
  const result = checkC2("24시간 접수 가능하며, 09:00부터 18:00까지 운영합니다.");
  assert.equal(result.status, "pass");
});

test("C3: 아라비아 숫자는 통과", () => {
  const result = checkC3("참가 인원은 30명입니다.");
  assert.equal(result.status, "pass");
});

test("C3: 한글 숫자는 경고", () => {
  const text = "참가 인원은 서른 명입니다.";
  const result = checkC3(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C3: 숫자가 없으면 안내(info)", () => {
  const result = checkC3("특별한 숫자가 없는 문장입니다.");
  assert.equal(result.status, "info");
});

test("C4: 쉼표·한글 병기·'일' 접두가 모두 맞으면 통과", () => {
  const result = checkC4("금1,500,000원(금일백오십만원)입니다.");
  assert.equal(result.status, "pass");
});

test("C4: 자리 숫자가 1이 아니면 '일' 없이도 통과", () => {
  const result = checkC4("금2,000,000원(금이백만원)입니다.");
  assert.equal(result.status, "pass");
});

test("C4: 천 단위 쉼표가 없으면 경고", () => {
  const text = "금1500000원(금일백오십만원)입니다.";
  const result = checkC4(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C4: 한글 병기가 없으면 경고", () => {
  const text = "1,500,000원 정도가 필요합니다.";
  const result = checkC4(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C4: 자리 숫자가 1인데 '일'이 빠지면 경고", () => {
  const text = "금1,500,000원(금백오십만원)입니다.";
  const result = checkC4(text);
  assert.equal(result.status, "warn");
  assert.equal(text.slice(result.matchIndex, result.matchIndex + result.matchText.length), result.matchText);
});

test("C4: '십' 자리 숫자가 1인데 '일'이 빠지면 경고", () => {
  const text = "금113,560원(금십일만삼천오백육십원)입니다.";
  const result = checkC4(text);
  assert.equal(result.status, "warn");
});

test("C4: '십' 자리까지 '일'을 갖추면 통과 (실제 시행규칙 예시)", () => {
  const result = checkC4("금113,560원(금일십일만삼천오백육십원)입니다.");
  assert.equal(result.status, "pass");
});

test("C4: 금액 표기가 없으면 안내(info)", () => {
  const result = checkC4("예산 관련 언급이 없습니다.");
  assert.equal(result.status, "info");
});

test("checkAllC: C1~C4를 순서대로 반환", () => {
  const results = checkAllC("행사는 2026. 4. 15. 15:20에 진행하며, 참가 인원은 30명이고 예산은 금1,500,000원(금일백오십만원)입니다.");
  assert.equal(results.length, 4);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    ["C1", "C2", "C3", "C4"],
  );
});
