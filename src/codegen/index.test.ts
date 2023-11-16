import { expect, it } from "@jest/globals";
import dedent from "dedent";
import { emit } from "~/src/codegen";
import { defaultScenario, scenario, test, type Test } from "~/src/convert/ast";

function runEmit(input: Test): Promise<string> {
  return emit(input).then(dedent);
}

it("should emit an empty program when there are no scenarios", async () => {
  expect(await runEmit(test([]))).toEqual(``);
});

it("should emit a program with an unnamed default scenario", async () => {
  const input = test([], defaultScenario(undefined, []));

  const expected = dedent`
    export default function () {}

  `;

  expect(await runEmit(input)).toEqual(expected);
});

it("should emit a program with a named default scenario", async () => {
  const input = test([], defaultScenario("name", []));

  const expected = dedent` 
    export default function name() {}
  `;

  expect(await runEmit(input)).toEqual(expected);
});

it("should emit named exports for each named scenario", async () => {
  const input = test([scenario("scenario1", []), scenario("scenario2", [])]);

  const expected = dedent`
    export function scenario1() {}

    export function scenario2() {}
  `;

  expect(await runEmit(input)).toEqual(expected);
});

it("should emit both named and default scenarios", async () => {
  const input = test(
    [scenario("scenario1", []), scenario("scenario2", [])],
    defaultScenario("scenario3", [])
  );

  const expected = dedent`
    export function scenario1() {}

    export function scenario2() {}
 
    export default function scenario3() {}
  `;

  expect(await runEmit(input)).toEqual(expected);
});
