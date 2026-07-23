// 기안문 본문 실습 자동 첨삭 — 규칙 기반(정규식) 검사, 외부 API 호출 없음.
// A1(두괄식)은 문맥 판단이 필요해 자동 판정하지 않고 안내만 제공한다.

function checkA2(text) {
  const head = text.slice(0, 200);
  if (/(구입|품의|계획\s*\(?안\)?|실시)/.test(text.slice(0, 120))) {
    return {
      ruleId: "A2",
      status: "pass",
      message: "내부결재 문서 성격(구입·품의·계획(안)·실시)으로 보여 목적 직접 진술도 허용됩니다.",
    };
  }
  if (/(아래와\s*같이|다음과\s*같이)/.test(head)) {
    return {
      ruleId: "A2",
      status: "pass",
      message: "시작 관용구('아래와 같이'/'다음과 같이')를 사용하고 있습니다.",
    };
  }
  return {
    ruleId: "A2",
    status: "warn",
    message: "대외 발송 공문이라면 '아래와 같이' 또는 '다음과 같이' 관용구 사용을 검토하세요.",
  };
}

function checkA3(text) {
  const wrongTermMatch = text.match(/첨부|붙임물/);
  if (wrongTermMatch) {
    return {
      ruleId: "A3",
      status: "warn",
      message: "'첨부' 또는 '붙임물' 대신 '붙임'이라는 표현을 사용하세요.",
      matchText: wrongTermMatch[0],
      matchIndex: wrongTermMatch.index,
    };
  }
  const match = text.match(/붙임(\s*)(\S)/);
  if (!match) {
    return {
      ruleId: "A3",
      status: "info",
      message: "붙임(첨부물) 표기를 찾지 못했습니다. 첨부물이 있다면 붙임 표기를 추가하세요.",
    };
  }
  const [, spacing, nextChar] = match;
  if (nextChar === ":" || nextChar === "：") {
    return {
      ruleId: "A3",
      status: "warn",
      message: "'붙임' 뒤에는 콜론(:)을 쓰지 않고 두 칸을 띄웁니다.",
      matchText: match[0],
      matchIndex: match.index,
    };
  }
  if (spacing.length < 2) {
    return {
      ruleId: "A3",
      status: "warn",
      message: `'붙임' 뒤 띄어쓰기가 ${spacing.length}칸입니다. 두 칸을 띄우세요.`,
      matchText: match[0],
      matchIndex: match.index,
    };
  }
  return { ruleId: "A3", status: "pass", message: "'붙임' 표기가 올바릅니다." };
}

function checkA4(text) {
  const badMatch = text.match(/[^.\n]*(할\s*것|하시오)\./);
  if (badMatch) {
    const phrase = `${badMatch[1]}.`;
    const phraseStart = badMatch.index + badMatch[0].lastIndexOf(badMatch[1]);
    return {
      ruleId: "A4",
      status: "warn",
      message: `명령형 표현 '${badMatch[0].trim()}'이 있습니다. '~하여 주시기 바랍니다'처럼 경어체로 바꾸세요.`,
      matchText: phrase,
      matchIndex: phraseStart,
    };
  }
  if (/니다\./.test(text)) {
    return { ruleId: "A4", status: "pass", message: "경어체(합니다/습니다체)를 사용하고 있습니다." };
  }
  return {
    ruleId: "A4",
    status: "info",
    message: "경어체 종결 어미를 찾지 못했습니다. 문장을 확인해 보세요.",
  };
}

function checkA5(text) {
  let offset = 0;
  let lastLine = null;
  for (const rawLine of text.split("\n")) {
    const trimmedEnd = rawLine.replace(/\s+$/, "");
    if (trimmedEnd.trim().length > 0) {
      lastLine = { text: trimmedEnd, start: offset };
    }
    offset += rawLine.length + 1;
  }
  if (!lastLine) {
    return { ruleId: "A5", status: "info", message: "검사할 본문이 없습니다." };
  }
  const match = lastLine.text.match(/( *)끝\.$/);
  if (!match) {
    return { ruleId: "A5", status: "warn", message: "본문 마지막에 '끝.' 표시가 없습니다." };
  }
  if (match[1].length < 2) {
    return {
      ruleId: "A5",
      status: "warn",
      message: `'끝.' 앞 띄어쓰기가 ${match[1].length}칸입니다. 두 칸을 띄우세요.`,
      matchText: "끝.",
      matchIndex: lastLine.start + match.index + match[1].length,
    };
  }
  return { ruleId: "A5", status: "pass", message: "'끝.' 표시가 올바릅니다." };
}

function checkA6(text) {
  if (!/관련됩니다/.test(text)) {
    return { ruleId: "A6", status: "info", message: "관련문서 인용이 없는 문서로 보입니다." };
  }
  const goodPattern = /\S+-\d+\(\d{4}\.\s\d{1,2}\.\s\d{1,2}\.\)호와\s*관련됩니다/;
  if (goodPattern.test(text)) {
    return { ruleId: "A6", status: "pass", message: "관련문서 표시 형식이 올바릅니다." };
  }
  const anchor = text.match(/관련됩니다/);
  return {
    ruleId: "A6",
    status: "warn",
    message:
      "관련문서 표시는 '처리과명-번호(날짜)호와 관련됩니다.' 형식을 지켜야 합니다. (예: 교육운영과-1234(2026. 3. 10.)호와 관련됩니다.)",
    matchText: anchor[0],
    matchIndex: anchor.index,
  };
}

function checkAll(text) {
  return [
    {
      ruleId: "A1",
      status: "info",
      message: "두괄식 서술 여부는 자동 판정이 어렵습니다. 결론이 첫 문장에 나오는지 스스로 확인하세요.",
    },
    checkA2(text),
    checkA3(text),
    checkA4(text),
    checkA5(text),
    checkA6(text),
  ];
}

export { checkA2, checkA3, checkA4, checkA5, checkA6, checkAll };
