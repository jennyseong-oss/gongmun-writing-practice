import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeQuizzes, shuffle } from "../quiz-all.js";

const fixture = {
  A: [{ id: "A1-q1" }, { id: "A1-q2" }],
  B: [{ id: "B1-q1" }],
  C: [],
  D: [{ id: "D1-q1" }],
  E: [{ id: "E1-q1" }],
};

test("mergeQuizzes concatenates modules in A~E order", () => {
  const merged = mergeQuizzes(fixture);
  assert.deepEqual(merged.map((q) => q.id), ["A1-q1", "A1-q2", "B1-q1", "D1-q1", "E1-q1"]);
});

test("mergeQuizzes tolerates a missing module key", () => {
  const merged = mergeQuizzes({ A: [{ id: "A1-q1" }] });
  assert.deepEqual(merged.map((q) => q.id), ["A1-q1"]);
});

test("shuffle preserves every element (order-independent)", () => {
  const list = [1, 2, 3, 4, 5];
  const shuffled = shuffle(list);
  assert.deepEqual([...shuffled].sort(), [...list].sort());
});

test("shuffle does not mutate the input array", () => {
  const list = [1, 2, 3];
  shuffle(list, () => 0);
  assert.deepEqual(list, [1, 2, 3]);
});

test("shuffle is deterministic for a given rng", () => {
  const list = [1, 2, 3, 4];
  const rng = () => 0;
  assert.deepEqual(shuffle(list, rng), shuffle(list, rng));
});
