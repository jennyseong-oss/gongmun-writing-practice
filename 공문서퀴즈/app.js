import { mergeQuizzes, shuffle } from "./quiz-all.js";
import { resultMessage } from "./result-message.js";

const QUIZ_FILES = {
  A: "data/quiz-a.json",
  B: "data/quiz-b.json",
  C: "data/quiz-c.json",
  D: "data/quiz-d.json",
  E: "data/quiz-e.json",
};

const BEST_SCORE_KEY = "gongmun-quiz-all-best";
const ROUND_SIZE = 10;

const state = { quiz: [], quizIndex: 0, quizScore: 0 };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function getBestScore() {
  return Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
}

function saveBestScore(pct) {
  if (pct > getBestScore()) localStorage.setItem(BEST_SCORE_KEY, String(pct));
}

function renderProgress(completed) {
  const total = state.quiz.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById("quizProgress").innerHTML = `
    <div class="quiz-progress-row">
      <span>${state.quizIndex + 1} / ${total} 문항</span>
      <span>맞은 개수 ${state.quizScore}</span>
    </div>
    <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
  `;
}

function renderQuizQuestion() {
  const quizBody = document.getElementById("quizBody");
  const progress = document.getElementById("quizProgress");
  const summary = document.getElementById("quizSummary");

  if (state.quizIndex >= state.quiz.length) {
    quizBody.classList.add("hidden");
    progress.classList.add("hidden");
    summary.classList.remove("hidden");
    renderQuizSummary();
    return;
  }

  quizBody.classList.remove("hidden");
  progress.classList.remove("hidden");
  summary.classList.add("hidden");

  const q = state.quiz[state.quizIndex];
  renderProgress(state.quizIndex);
  quizBody.innerHTML = `
    <div class="quiz-card">
      <p class="quiz-question">${escapeHtml(q.question)}</p>
      <div class="quiz-choices">
        ${q.choices.map((choice, idx) => `<button class="quiz-choice" data-idx="${idx}" type="button">${escapeHtml(choice)}</button>`).join("")}
      </div>
      <div class="quiz-explanation hidden" id="quizExplanation">${escapeHtml(q.explanation)}</div>
      <div class="quiz-next-row hidden" id="quizNextRow">
        <button class="primary-button" id="quizNextButton" type="button">다음 문항</button>
      </div>
    </div>
  `;

  quizBody.querySelectorAll(".quiz-choice").forEach((button) => {
    button.addEventListener("click", () => handleQuizChoice(Number(button.dataset.idx), q));
  });
}

function handleQuizChoice(idx, question) {
  const buttons = document.querySelectorAll(".quiz-choice");
  buttons.forEach((button) => {
    button.disabled = true;
  });
  buttons[idx].classList.add(idx === question.answerIndex ? "correct" : "incorrect");
  buttons[question.answerIndex].classList.add("correct");
  if (idx === question.answerIndex) state.quizScore += 1;

  document.getElementById("quizExplanation").classList.remove("hidden");
  document.getElementById("quizNextRow").classList.remove("hidden");
  renderProgress(state.quizIndex + 1);
  document.getElementById("quizNextButton").addEventListener("click", () => {
    state.quizIndex += 1;
    renderQuizQuestion();
  });
}

function renderQuizSummary() {
  const summary = document.getElementById("quizSummary");
  const total = state.quiz.length;
  const pct = total > 0 ? Math.round((state.quizScore / total) * 100) : 0;
  saveBestScore(pct);
  summary.innerHTML = `
    <div class="quiz-summary">
      <p>이번 라운드 결과</p>
      <p class="score">${state.quizScore} / ${total}</p>
      <p>정답률 ${pct}% · 최고 기록 ${getBestScore()}%</p>
      <p class="result-message">${resultMessage(pct)}</p>
      <button class="ghost-button" id="quizRetryButton" type="button">다른 ${ROUND_SIZE}문항 풀기</button>
    </div>
  `;
  document.getElementById("quizRetryButton").addEventListener("click", startQuiz);
}

function startQuiz() {
  state.quiz = shuffle(state.fullQuiz).slice(0, ROUND_SIZE);
  state.quizIndex = 0;
  state.quizScore = 0;
  renderQuizQuestion();
}

async function init() {
  const quizByModule = {};
  for (const [letter, file] of Object.entries(QUIZ_FILES)) {
    quizByModule[letter] = await fetch(file).then((res) => res.json());
  }
  state.fullQuiz = mergeQuizzes(quizByModule);
  startQuiz();
}

init();
