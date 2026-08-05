import { test } from "node:test";
import assert from "node:assert/strict";
import { checkE1, checkAllE } from "../checker-e.js";

test("E1: 항상 안내(info)를 반환한다", () => {
  const result = checkE1();
  assert.equal(result.ruleId, "E1");
  assert.equal(result.status, "info");
});

test("checkAllE: E1을 반환하며 info", () => {
  const results = checkAllE("아무 텍스트나 넣어도 결과는 같다");
  assert.equal(results.length, 1);
  assert.deepEqual(
    results.map((r) => r.ruleId),
    ["E1"],
  );
  assert.ok(results.every((r) => r.status === "info"));
});
