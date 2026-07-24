import { test } from "node:test";
import assert from "node:assert/strict";
import { searchRules } from "../search.js";

const rules = [
  {
    id: "D4",
    title: "띄어쓰기·조사",
    summary: "'여부'처럼 의존명사는 앞말과 띄어 씁니다.",
    basis: "「한글 맞춤법」 띄어쓰기 규정",
    tip: "'여부'는 의존명사이므로 앞말과 띄어 씁니다.",
  },
  {
    id: "C1",
    title: "날짜 형식",
    summary: "날짜는 온점과 띄어쓰기를 지켜 씁니다.",
    basis: "「행정 업무의 운영 및 혁신에 관한 규정 시행규칙」 제7조",
    tip: "월·일 앞에 0을 붙이지 않습니다.",
  },
  {
    id: "A3",
    title: "붙임(첨부물) 표기",
    summary: "붙임이 1개면 '붙임'과 내용 사이를 두 칸 띄웁니다.",
    basis: "「행정 업무의 운영 및 혁신에 관한 규정 시행규칙」 제4조제4항",
    tip: "'첨부', '붙임물' 같은 표현은 잘못된 표현입니다.",
  },
];

test("searchRules: 제목에 포함된 검색어로 찾는다", () => {
  const result = searchRules(rules, "날짜");
  assert.deepEqual(result.map((r) => r.id), ["C1"]);
});

test("searchRules: 요약문에 포함된 검색어로 찾는다", () => {
  const result = searchRules(rules, "여부");
  assert.deepEqual(result.map((r) => r.id), ["D4"]);
});

test("searchRules: 팁에만 포함된 검색어로도 찾는다", () => {
  const result = searchRules(rules, "첨부");
  assert.deepEqual(result.map((r) => r.id), ["A3"]);
});

test("searchRules: id로도 찾는다", () => {
  const result = searchRules(rules, "c1");
  assert.deepEqual(result.map((r) => r.id), ["C1"]);
});

test("searchRules: 대소문자를 구분하지 않는다", () => {
  const result = searchRules(rules, "D4");
  assert.deepEqual(result.map((r) => r.id), ["D4"]);
});

test("searchRules: 일치하는 항목이 없으면 빈 배열을 반환한다", () => {
  const result = searchRules(rules, "존재하지않는단어");
  assert.deepEqual(result, []);
});

test("searchRules: 빈 검색어는 빈 배열을 반환한다", () => {
  assert.deepEqual(searchRules(rules, ""), []);
  assert.deepEqual(searchRules(rules, "   "), []);
});

test("searchRules: 여러 항목에 걸리면 원래 순서대로 모두 반환한다", () => {
  const result = searchRules(rules, "규정 시행규칙");
  assert.deepEqual(result.map((r) => r.id), ["C1", "A3"]);
});
