// 라운드 정답률에 따라 결과 화면에 보여줄 문구를 고르는 순수 함수.

function resultMessage(pct) {
  if (pct === 100) return "완벽해요! 다음 라운드도 도전해 보세요.";
  if (pct >= 80) return "잘하셨어요! 조금만 더 다듬으면 완벽해요.";
  if (pct >= 50) return "절반 이상 맞혔어요. 틀린 규정 위주로 참고서에서 다시 확인해 보세요.";
  return "아직 낯선 규정이 많네요. 참고서에서 근거·예시를 먼저 훑어보고 다시 도전해 보세요.";
}

export { resultMessage };
