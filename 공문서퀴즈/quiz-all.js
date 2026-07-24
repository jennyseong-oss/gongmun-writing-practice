// A~E 모듈별로 나뉘어 있던 퀴즈 문항을 하나로 합치고 섞는 순수 함수.

function mergeQuizzes(quizByModule) {
  return ["A", "B", "C", "D", "E"].flatMap((letter) => quizByModule[letter] || []);
}

function shuffle(list, rng = Math.random) {
  const result = list.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export { mergeQuizzes, shuffle };
