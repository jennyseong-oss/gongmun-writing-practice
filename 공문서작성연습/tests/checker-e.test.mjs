import { test } from "node:test";
import assert from "node:assert/strict";
import { checkE1, checkE2, checkE3, checkE4, checkAllE } from "../checker-e.js";

test("E1: 항상 안내(info)를 반환한다", () => {
  const result = checkE1();
  assert.equal(result.ruleId, "E1");
  assert.equal(result.status, "info");
});

test("E2: 항상 안내(info)를 반환한다", () => {
  const result = checkE2();
  assert.equal(result.ruleId, "E2");
  assert.equal(result.status, "info");
});

test("E3: 항상 안내(info)를 반환한다", () => {
  const result = checkE3();
  assert.equal(result.ruleId, "E3");
  assert.equal(result.status, "info");
});

test("E4: 항상 안내(info)를 반환한다", () => {
  const result = checkE4();
  assert.equal(result.ruleId, "E4");
  assert.equal(result.status, "info");
});

test("checkAllE: E1~E4를 순서대로 반환하며 모두 info", () => {
  const results = checkAllE("아무 텍스트나 넣어도 결과는 같다");
  assert.equal(results.length, 4);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    ["E1", "E2", "E3", "E4"],
  );
  assert.ok(results.every((r) => r.status === "info"));
});
