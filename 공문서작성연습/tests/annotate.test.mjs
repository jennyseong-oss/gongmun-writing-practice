import { test } from "node:test";
import assert from "node:assert/strict";
import { annotateText } from "../annotate.js";

test("annotateText: 위치 정보가 있는 warn 항목을 <mark>로 감싼다", () => {
  const text = "가.내용";
  const results = [{ ruleId: "B2", status: "warn", message: "띄어쓰기 문제", matchText: "가.", matchIndex: 0 }];
  const html = annotateText(text, results);
  assert.equal(html, `<mark class="issue-mark" data-rule="B2" title="B2 · 띄어쓰기 문제">가.</mark>내용`);
});

test("annotateText: pass/info 항목은 표시하지 않는다", () => {
  const text = "정상 문장입니다.";
  const results = [
    { ruleId: "A4", status: "pass", message: "정상" },
    { ruleId: "A1", status: "info", message: "안내" },
  ];
  const html = annotateText(text, results);
  assert.equal(html, "정상 문장입니다.");
});

test("annotateText: 위치 정보가 없는 warn 항목은 표시하지 않는다", () => {
  const text = "참석하여 주시기 바랍니다.";
  const results = [{ ruleId: "A5", status: "warn", message: "끝. 표시가 없습니다." }];
  const html = annotateText(text, results);
  assert.equal(html, "참석하여 주시기 바랍니다.");
});

test("annotateText: 여러 항목을 원문 순서대로 표시한다", () => {
  const text = "가.내용과 참석여부를 확인하세요.";
  const results = [
    { ruleId: "D4", status: "warn", message: "여부 띄어쓰기", matchText: "참석여부", matchIndex: 6 },
    { ruleId: "B2", status: "warn", message: "기호 띄어쓰기", matchText: "가.", matchIndex: 0 },
  ];
  const html = annotateText(text, results);
  assert.equal(
    html,
    `<mark class="issue-mark" data-rule="B2" title="B2 · 기호 띄어쓰기">가.</mark>내용과 <mark class="issue-mark" data-rule="D4" title="D4 · 여부 띄어쓰기">참석여부</mark>를 확인하세요.`,
  );
});

test("annotateText: 겹치는 구간은 먼저 나온 항목이 우선한다", () => {
  const text = "가나다라";
  const results = [
    { ruleId: "A2", status: "warn", message: "첫번째", matchText: "가나", matchIndex: 0 },
    { ruleId: "B1", status: "warn", message: "두번째(겹침)", matchText: "나다", matchIndex: 1 },
  ];
  const html = annotateText(text, results);
  assert.equal(html, `<mark class="issue-mark" data-rule="A2" title="A2 · 첫번째">가나</mark>다라`);
});

test("annotateText: HTML 특수문자를 이스케이프한다", () => {
  const text = "5 < 6 & 6 > 5";
  const html = annotateText(text, []);
  assert.equal(html, "5 &lt; 6 &amp; 6 &gt; 5");
});

test("annotateText: 표시할 항목이 없으면 이스케이프된 원문 그대로 반환한다", () => {
  const text = "완전히 정상적인 문서입니다.";
  const html = annotateText(text, []);
  assert.equal(html, text);
});
