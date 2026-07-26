// 날짜·시간·숫자·금액 표기(C1~C4) 실습 자동 첨삭 — 규칙 기반(정규식) 검사, 외부 API 호출 없음.

const NATIVE_KOREAN_NUMBERS =
  "하나|둘|셋|넷|다섯|여섯|일곱|여덟|아홉|열|스물|서른|마흔|쉰|예순|일흔|여든|아흔";

function checkC1(text) {
  const ymdMatch = text.match(/\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/);
  if (ymdMatch) {
    return {
      ruleId: "C1",
      status: "warn",
      message: "'년/월/일' 대신 온점 표기를 사용하세요. (예: 2026. 4. 15.)",
      matchText: ymdMatch[0],
      matchIndex: ymdMatch.index,
    };
  }
  const noSpaceMatch = text.match(/\d{4}\.\d{1,2}\.\d{1,2}/);
  if (noSpaceMatch) {
    return {
      ruleId: "C1",
      status: "warn",
      message: "온점 뒤에 한 칸을 띄우세요. (예: 2026. 4. 15.)",
      matchText: noSpaceMatch[0],
      matchIndex: noSpaceMatch.index,
    };
  }
  const zeroPadMatch = text.match(/\.\s0\d\.(?!\d)/);
  if (zeroPadMatch) {
    return {
      ruleId: "C1",
      status: "warn",
      message: "월·일 앞에 0을 붙이지 않습니다. (예: 04 → 4)",
      matchText: zeroPadMatch[0],
      matchIndex: zeroPadMatch.index,
    };
  }
  const tildeMatch = text.match(/\d{1,2}\.\s~|~\s\d{1,2}\./);
  if (tildeMatch) {
    return {
      ruleId: "C1",
      status: "warn",
      message: "날짜 범위의 물결표(~) 앞뒤는 붙여 씁니다. (예: 4. 23.~6. 15.)",
      matchText: tildeMatch[0],
      matchIndex: tildeMatch.index,
    };
  }
  if (/\d{4}\.\s\d{1,2}\.\s\d{1,2}\./.test(text)) {
    return { ruleId: "C1", status: "pass", message: "날짜 표기가 올바릅니다." };
  }
  return { ruleId: "C1", status: "info", message: "날짜 표기를 찾지 못했습니다." };
}

function checkC2(text) {
  const hangulMatch = text.match(/\d{1,2}\s*시(?!간)(\s*\d{1,2}\s*분)?/);
  if (hangulMatch) {
    return {
      ruleId: "C2",
      status: "warn",
      message: "'시/분' 한글 표기 대신 24시각제 쌍점 표기를 사용하세요. (예: 15:20)",
      matchText: hangulMatch[0],
      matchIndex: hangulMatch.index,
    };
  }
  const ampmMatch = text.match(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/);
  if (ampmMatch) {
    return {
      ruleId: "C2",
      status: "warn",
      message: "AM/PM 대신 24시각제를 사용하세요. (예: 15:20)",
      matchText: ampmMatch[0],
      matchIndex: ampmMatch.index,
    };
  }
  const tildeMatch = text.match(/\d{1,2}:\d{2}\s+~|~\s+\d{1,2}:\d{2}/);
  if (tildeMatch) {
    return {
      ruleId: "C2",
      status: "warn",
      message: "시간 범위의 물결표(~) 앞뒤는 붙여 씁니다. (예: 09:00~18:00)",
      matchText: tildeMatch[0],
      matchIndex: tildeMatch.index,
    };
  }
  const singleDigitMatch = text.match(/\b\d{1}:\d{2}\b/);
  if (singleDigitMatch) {
    return {
      ruleId: "C2",
      status: "warn",
      message: "시각은 두 자리 숫자로 씁니다. (예: 9:00 → 09:00)",
      matchText: singleDigitMatch[0],
      matchIndex: singleDigitMatch.index,
    };
  }
  if (/\d{2}:\d{2}/.test(text)) {
    return { ruleId: "C2", status: "pass", message: "시간 표기가 올바릅니다." };
  }
  return { ruleId: "C2", status: "info", message: "시간 표기를 찾지 못했습니다." };
}

function checkC3(text) {
  const nativeNumberRegex = new RegExp(`(${NATIVE_KOREAN_NUMBERS})\\s*(명|개|건|부|회|번)`);
  const nativeMatch = text.match(nativeNumberRegex);
  if (nativeMatch) {
    return {
      ruleId: "C3",
      status: "warn",
      message: "한글 숫자 대신 아라비아 숫자를 사용하세요. (예: 서른 명 → 30명)",
      matchText: nativeMatch[0],
      matchIndex: nativeMatch.index,
    };
  }
  if (/\d/.test(text)) {
    return { ruleId: "C3", status: "pass", message: "아라비아 숫자를 사용하고 있습니다." };
  }
  return { ruleId: "C3", status: "info", message: "검사할 숫자를 찾지 못했습니다." };
}

function checkC4(text) {
  const moneyMatches = [...text.matchAll(/(\d[\d,]*)\s*원\s*(\(([^)]*)\))?/g)];
  if (moneyMatches.length === 0) {
    return { ruleId: "C4", status: "info", message: "금액 표기를 찾지 못했습니다." };
  }
  for (const match of moneyMatches) {
    const digits = match[1];
    const hangul = match[3];
    const rawDigits = digits.replace(/,/g, "");
    if (rawDigits.length >= 4 && !digits.includes(",")) {
      return {
        ruleId: "C4",
        status: "warn",
        message: `'${digits}원'에 천 단위 쉼표가 없습니다. (예: 1,500,000)`,
        matchText: match[0],
        matchIndex: match.index,
      };
    }
    if (!hangul) {
      return {
        ruleId: "C4",
        status: "warn",
        message: `'${digits}원' 뒤에 괄호로 한글 금액을 병기하세요. (예: 금1,500,000원(금일백오십만원))`,
        matchText: match[0],
        matchIndex: match.index,
      };
    }
    if (/^금?(억|만|천|백)/.test(hangul)) {
      return {
        ruleId: "C4",
        status: "warn",
        message: `한글 병기 '${hangul}'에서 억·만·천·백 앞에 '일'을 붙이세요. (예: 백오십만원 → 일백오십만원)`,
        matchText: match[0],
        matchIndex: match.index,
      };
    }
  }
  return { ruleId: "C4", status: "pass", message: "금액 표기가 올바릅니다." };
}

function checkAllC(text) {
  return [checkC1(text), checkC2(text), checkC3(text), checkC4(text)];
}

export { checkC1, checkC2, checkC3, checkC4, checkAllC };
