// 용지·여백·글자(E1~E4)는 종이 크기·여백·글꼴·글자 크기처럼 문서 프로그램의 실제 설정값을
// 봐야 확인할 수 있는 항목이라, 텍스트 입력만으로는 판정할 수 없다.
// 그래서 항상 안내(info)만 반환하고, 실제 확인은 문서 프로그램에서 직접 하도록 안내한다.

function checkE1() {
  return {
    ruleId: "E1",
    status: "info",
    message: "용지 규격은 문서 프로그램의 '쪽 설정'에서 직접 확인하세요. 기본값은 A4(210×297mm) 세로 방향입니다.",
  };
}

function checkE2() {
  return {
    ruleId: "E2",
    status: "info",
    message:
      "여백은 문서 프로그램의 '쪽 설정 > 여백'에서 직접 확인하세요. 기본값은 위 30mm·아래 15mm·좌 20mm·우 15mm입니다.",
  };
}

function checkE3() {
  return {
    ruleId: "E3",
    status: "info",
    message:
      "글자체는 문서 프로그램에서 실제 적용된 글꼴을 직접 확인하세요. 기본값은 명조체(바탕체·HY신명조 계열)이며, 전자문서시스템 기본 글자체는 예외로 인정됩니다.",
  };
}

function checkE4() {
  return {
    ruleId: "E4",
    status: "info",
    message:
      "글자 크기는 문서 프로그램에서 실제 적용된 크기를 직접 확인하세요. 기본 범위는 10.5pt~12pt이며, 전자문서시스템 기본 크기는 예외로 인정됩니다.",
  };
}

function checkAllE() {
  return [checkE1(), checkE2(), checkE3(), checkE4()];
}

export { checkE1, checkE2, checkE3, checkE4, checkAllE };
