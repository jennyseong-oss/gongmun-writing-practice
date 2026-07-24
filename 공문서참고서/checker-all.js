// 종합 실습 — A~E 모든 규정을 한 번에 점검한다.
// 실제 기안문은 특정 모듈 하나만 지키면 되는 게 아니라 본문 내용·항목 번호·
// 날짜/숫자/금액·용어/표현·용지/여백/글자 규정을 동시에 지켜야 하므로,
// 각 모듈의 첨삭 엔진을 그대로 재사용해 한 번에 실행한다.

import { checkAll as checkAllA } from "./checker.js";
import { checkAllB } from "./checker-b.js";
import { checkAllC } from "./checker-c.js";
import { checkAllD } from "./checker-d.js";
import { checkAllE } from "./checker-e.js";

function checkAllModules(text) {
  return [
    ...checkAllA(text),
    ...checkAllB(text),
    ...checkAllC(text),
    ...checkAllD(text),
    ...checkAllE(text),
  ];
}

export { checkAllModules };
