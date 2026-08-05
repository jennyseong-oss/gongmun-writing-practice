// 24개 규정 전체에서 검색어와 일치하는 항목을 찾는 순수 함수.
// id/제목/요약/팁/근거를 한꺼번에 붙여 대소문자 구분 없이 부분 일치로 찾는다.

function searchRules(rules, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return rules.filter((rule) => {
    const haystack = `${rule.id} ${rule.title} ${rule.summary} ${rule.tip} ${rule.basis}`.toLowerCase();
    return haystack.includes(trimmed);
  });
}

export { searchRules };
