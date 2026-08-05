// 용지 규격(E1)은 종이 크기처럼 문서 프로그램의 실제 설정값을
// 봐야 확인할 수 있는 항목이라, 텍스트 입력만으로는 판정할 수 없다.
// 그래서 항상 안내(info)만 반환하고, 실제 확인은 문서 프로그램에서 직접 하도록 안내한다.

function checkE1() {
  return {
    ruleId: "E1",
    status: "info",
    message: "용지 규격은 문서 프로그램의 '쪽 설정'에서 직접 확인하세요. 기본값은 A4(210×297mm) 세로 방향입니다.",
  };
}

function checkAllE() {
  return [checkE1()];
}

export { checkE1, checkAllE };
