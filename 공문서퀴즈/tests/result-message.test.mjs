import { test } from "node:test";
import assert from "node:assert/strict";
import { resultMessage } from "../result-message.js";

test("100%: 만점 문구", () => {
  assert.equal(resultMessage(100), "완벽해요! 다음 라운드도 도전해 보세요.");
});

test("80~99%: 잘함 문구", () => {
  assert.equal(resultMessage(80), "잘하셨어요! 조금만 더 다듬으면 완벽해요.");
  assert.equal(resultMessage(99), "잘하셨어요! 조금만 더 다듬으면 완벽해요.");
});

test("50~79%: 절반 이상 문구", () => {
  assert.equal(resultMessage(50), "절반 이상 맞혔어요. 틀린 규정 위주로 참고서에서 다시 확인해 보세요.");
  assert.equal(resultMessage(79), "절반 이상 맞혔어요. 틀린 규정 위주로 참고서에서 다시 확인해 보세요.");
});

test("0~49%: 격려 문구", () => {
  assert.equal(resultMessage(0), "아직 낯선 규정이 많네요. 참고서에서 근거·예시를 먼저 훑어보고 다시 도전해 보세요.");
  assert.equal(resultMessage(49), "아직 낯선 규정이 많네요. 참고서에서 근거·예시를 먼저 훑어보고 다시 도전해 보세요.");
});
