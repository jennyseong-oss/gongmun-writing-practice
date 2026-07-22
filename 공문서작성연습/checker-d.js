// 용어·표현(D1~D7) 실습 자동 첨삭 — 사전(정규식) 기반 검사, 외부 API 호출 없음.
// 문장에 지적할 표현이 없으면 통과(pass)로 판정한다.

const DICTIONARIES = {
  D1: [
    { pattern: /제고/, suggestion: "높임" },
    { pattern: /도래자/, suggestion: "되는 사람" },
    { pattern: /득하여/, suggestion: "받아/얻어" },
    { pattern: /익일/, suggestion: "다음 날" },
  ],
  D2: [
    { pattern: /에\s?의해/, suggestion: "~으로" },
    { pattern: /함에\s?있어서/, suggestion: "~할 때" },
    { pattern: /고취\s?시키/, suggestion: "고취하" },
    { pattern: /어르신\s?분들/, suggestion: "어르신들" },
  ],
  D3: [
    { pattern: /과반수\s?이상/, suggestion: "과반수" },
    { pattern: /더불어\s?함께/, suggestion: "함께" },
    { pattern: /매\s?단계마다/, suggestion: "단계마다" },
  ],
  D4: [
    { pattern: /기재여부/, suggestion: "기재 여부" },
    { pattern: /참석여부/, suggestion: "참석 여부" },
    { pattern: /가능여부/, suggestion: "가능 여부" },
    { pattern: /제출여부/, suggestion: "제출 여부" },
  ],
  D5: [
    { pattern: /할\s?것\./, suggestion: "~하여 주시기 바랍니다" },
    { pattern: /하시오\./, suggestion: "~하여 주시기 바랍니다" },
  ],
  D6: [
    { pattern: /매우\s?대단히/, suggestion: "매우 (또는 대단히 중 하나만)" },
    { pattern: /여러\s?가지\s?다양한/, suggestion: "여러 가지 (또는 다양한 중 하나만)" },
  ],
  D7: [
    { pattern: /마켓팅/, suggestion: "마케팅" },
    { pattern: /포털싸이트/, suggestion: "포털사이트" },
    { pattern: /악세사리/, suggestion: "액세서리" },
    { pattern: /리더쉽/, suggestion: "리더십" },
    { pattern: /컨텐츠/, suggestion: "콘텐츠" },
  ],
};

function checkWithDictionary(ruleId, text) {
  for (const entry of DICTIONARIES[ruleId]) {
    const match = text.match(entry.pattern);
    if (match) {
      return {
        ruleId,
        status: "warn",
        message: `'${match[0]}' 대신 '${entry.suggestion}'을(를) 사용하세요.`,
      };
    }
  }
  return { ruleId, status: "pass", message: "지적할 표현이 없습니다." };
}

function checkD1(text) {
  return checkWithDictionary("D1", text);
}
function checkD2(text) {
  return checkWithDictionary("D2", text);
}
function checkD3(text) {
  return checkWithDictionary("D3", text);
}
function checkD4(text) {
  return checkWithDictionary("D4", text);
}
function checkD5(text) {
  return checkWithDictionary("D5", text);
}
function checkD6(text) {
  return checkWithDictionary("D6", text);
}
function checkD7(text) {
  return checkWithDictionary("D7", text);
}

function checkAllD(text) {
  return [checkD1(text), checkD2(text), checkD3(text), checkD4(text), checkD5(text), checkD6(text), checkD7(text)];
}

export { checkD1, checkD2, checkD3, checkD4, checkD5, checkD6, checkD7, checkAllD };
