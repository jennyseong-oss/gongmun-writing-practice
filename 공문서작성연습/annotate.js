// 종합 실습 첨삭 결과를 원문 위에 표시하기 위한 순수 함수.
// "확인 필요(warn)"이면서 위치 정보(matchIndex/matchText)가 있는 항목만
// 원문에서 겹치지 않게 <mark>로 감싼다. 위치를 짚을 수 없는 항목
// (예: '끝. 표시 없음'처럼 없어서 지적하는 경우)은 표시 대상에서 제외된다.

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function annotateText(text, results) {
  const candidates = results.filter(
    (r) => r.status === "warn" && typeof r.matchIndex === "number" && typeof r.matchText === "string" && r.matchText.length > 0,
  );

  // 겹치는 구간은 먼저 나온 항목(A→E, 모듈 내 규칙 순서)이 우선한다.
  const accepted = [];
  for (const r of candidates) {
    const start = r.matchIndex;
    const end = r.matchIndex + r.matchText.length;
    const overlaps = accepted.some((a) => start < a.end && a.start < end);
    if (!overlaps) accepted.push({ start, end, ruleId: r.ruleId, message: r.message });
  }
  accepted.sort((a, b) => a.start - b.start);

  let html = "";
  let cursor = 0;
  for (const span of accepted) {
    html += escapeHtml(text.slice(cursor, span.start));
    const tooltip = escapeHtml(`${span.ruleId} · ${span.message}`);
    html += `<mark class="issue-mark" data-rule="${span.ruleId}" title="${tooltip}">${escapeHtml(text.slice(span.start, span.end))}</mark>`;
    cursor = span.end;
  }
  html += escapeHtml(text.slice(cursor));
  return html;
}

export { annotateText, escapeHtml };
