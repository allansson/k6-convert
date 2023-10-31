import { expect, it } from "@jest/globals";
import { emit } from "src/codegen";
import { test, type Test } from "src/convert/ast";

function strip(input: string) {
  return input.replace(/^\s+/, "");
}

it("should emit an empty program when there are no scenarios", async () => {
  expect(await emit(test([]))).toEqual(``);
});

it("should emit a program with a named default scenario", async () => {
  const input: Test = {
    type: "Test",
    scenarios: [
      {
        type: "Scenario",
        name: "name",
        statements: [],
      },
    ],
  };

  const expected = strip(/* ts */ `
    export default function name () {}
  `);

  expect(await emit(input)).toEqual(expected);
});
