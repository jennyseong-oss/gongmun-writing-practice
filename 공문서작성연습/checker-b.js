// 항목 번호 체계(B1~B6) 실습 자동 첨삭 — 규칙 기반(정규식) 검사, 외부 API 호출 없음.
// B4(두 줄 이상 항목 정렬)는 시각적 비교가 필요해 자동 판정하지 않고 안내만 제공한다.

// (?!\d) 뒤에 숫자가 이어지면 소수점 표기(예: '1.5킬로그램')로 보고 항목 기호로 인식하지 않는다.
// 그 밖의 경우(띄어쓰기 없이 바로 내용이 오는 경우 포함)는 기호로 인식해 B2 띄어쓰기 검사 대상이 되게 한다.
const LEVEL_PATTERNS = [
  { level: 1, regex: /^\d+\.(?!\d)/ },
  { level: 2, regex: /^[가-힣]\.(?!\d)/ },
  { level: 3, regex: /^\d+\)(?!\d)/ },
  { level: 4, regex: /^[가-힣]\)(?!\d)/ },
  { level: 5, regex: /^\(\d+\)(?!\d)/ },
  { level: 6, regex: /^\([가-힣]\)(?!\d)/ },
  { level: 7, regex: /^[①-⑳](?!\d)/ },
  { level: 8, regex: /^[㉮-㉻](?!\d)/ },
];

const FORBIDDEN_MARKER_REGEX = /^(-|·|Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ|[A-Za-z])[.)]?\s/;

function analyzeLines(text) {
  let offset = 0;
  return text.split("\n").map((rawLine) => {
    const leading = rawLine.match(/^ */)[0].length;
    const trimmed = rawLine.replace(/^ +/, "");
    const start = offset + leading;
    let level = null;
    let markerLength = 0;
    for (const pattern of LEVEL_PATTERNS) {
      const match = trimmed.match(pattern.regex);
      if (match) {
        level = pattern.level;
        markerLength = match[0].replace(/\s+$/, "").length;
        break;
      }
    }
    offset += rawLine.length + 1;
    return { trimmed, leading, level, markerLength, start };
  });
}

function checkB1(text) {
  const items = analyzeLines(text).filter((line) => line.level !== null);
  if (items.length === 0) {
    return { ruleId: "B1", status: "info", message: "항목 번호를 찾지 못했습니다." };
  }
  let highestSeen = 0;
  for (const item of items) {
    if (item.level > highestSeen + 1) {
      const marker = item.trimmed.slice(0, item.markerLength);
      return {
        ruleId: "B1",
        status: "warn",
        message: `'${marker}' 기호가 단계를 건너뛰었습니다. 순서(1.→가.→1)→가)…)를 확인하세요.`,
        matchText: marker,
        matchIndex: item.start,
      };
    }
    highestSeen = Math.max(highestSeen, item.level);
  }
  return { ruleId: "B1", status: "pass", message: "항목 번호 단계 순서가 올바릅니다." };
}

function checkB2(text) {
  const items = analyzeLines(text).filter((line) => line.level !== null);
  if (items.length === 0) {
    return { ruleId: "B2", status: "info", message: "항목 번호를 찾지 못했습니다." };
  }
  for (const item of items) {
    const rest = item.trimmed.slice(item.markerLength);
    const spaceMatch = rest.match(/^( *)/);
    const spacing = spaceMatch[1].length;
    const marker = item.trimmed.slice(0, item.markerLength);
    if (spacing === 0) {
      return {
        ruleId: "B2",
        status: "warn",
        message: `'${marker}' 뒤에 내용이 붙어 있습니다. 한 칸을 띄우세요.`,
        matchText: marker,
        matchIndex: item.start,
      };
    }
    if (spacing >= 2) {
      return {
        ruleId: "B2",
        status: "warn",
        message: `'${marker}' 뒤 띄어쓰기가 ${spacing}칸입니다. 한 칸만 띄우세요.`,
        matchText: marker,
        matchIndex: item.start,
      };
    }
  }
  return { ruleId: "B2", status: "pass", message: "항목기호와 내용 사이 띄어쓰기가 올바릅니다." };
}

function checkB3(text) {
  const items = analyzeLines(text).filter((line) => line.level !== null && line.level <= 4);
  if (items.length === 0) {
    return { ruleId: "B3", status: "info", message: "1~4단계(1., 가., 1), 가)) 항목을 찾지 못했습니다." };
  }
  for (const item of items) {
    const expected = (item.level - 1) * 2;
    if (item.leading !== expected) {
      const marker = item.trimmed.slice(0, item.markerLength);
      return {
        ruleId: "B3",
        status: "warn",
        message: `'${marker}' 들여쓰기가 ${item.leading}칸입니다. ${item.level}단계는 ${expected}칸 들여써야 합니다.`,
        matchText: marker,
        matchIndex: item.start,
      };
    }
  }
  return { ruleId: "B3", status: "pass", message: "들여쓰기가 단계에 맞게 되어 있습니다." };
}

function checkB5(text) {
  const items = analyzeLines(text).filter((line) => line.level !== null);
  if (items.length === 0) {
    return { ruleId: "B5", status: "info", message: "항목 번호를 찾지 못했습니다." };
  }
  if (items.length === 1) {
    const marker = items[0].trimmed.slice(0, items[0].markerLength);
    return {
      ruleId: "B5",
      status: "warn",
      message: "항목이 하나뿐입니다. 나열할 항목이 하나뿐이면 번호 없이 문장으로 씁니다.",
      matchText: marker,
      matchIndex: items[0].start,
    };
  }
  return { ruleId: "B5", status: "pass", message: "항목이 여러 개이므로 번호 사용이 적절합니다." };
}

function checkB6(text) {
  const lines = analyzeLines(text);
  for (const line of lines) {
    if (line.level === null && FORBIDDEN_MARKER_REGEX.test(line.trimmed)) {
      const marker = line.trimmed.match(FORBIDDEN_MARKER_REGEX)[0].trim();
      return {
        ruleId: "B6",
        status: "warn",
        message: `'${marker}'는 항목 번호로 쓸 수 없는 기호입니다. 1. 가. 1) 가) 같은 정식 기호를 사용하세요.`,
        matchText: marker,
        matchIndex: line.start,
      };
    }
  }
  const hasAnyMarker = lines.some((line) => line.level !== null);
  if (!hasAnyMarker) {
    return { ruleId: "B6", status: "info", message: "항목 기호를 찾지 못했습니다." };
  }
  return { ruleId: "B6", status: "pass", message: "금지된 기호가 발견되지 않았습니다." };
}

function checkAllB(text) {
  return [
    checkB1(text),
    checkB2(text),
    checkB3(text),
    {
      ruleId: "B4",
      status: "info",
      message: "두 줄 이상 항목의 정렬은 자동 판정이 어렵습니다. 정렬 방식을 문서 안에서 통일했는지 스스로 확인하세요.",
    },
    checkB5(text),
    checkB6(text),
  ];
}

export { checkB1, checkB2, checkB3, checkB5, checkB6, checkAllB };
