import { expect, it } from "@jest/globals";
import dedent from "dedent";
import { emit } from "~/src/codegen";
import {
  defaultScenario,
  group,
  scenario,
  sleep,
  test,
  type Test,
} from "~/src/convert/ast";

function runEmit(input: Test): Promise<string> {
  return emit(input).then((result) => result.trimEnd());
}

it("should emit an empty program when there are no scenarios", async () => {
  const expected = ``;

  const actual = await runEmit(test([]));

  expect(actual).toEqual(expected);
});

it("should emit a program with an unnamed default scenario", async () => {
  const input = test([], defaultScenario(undefined, []));

  const expected = dedent`
    export default function () {}
  `;

  const actual = await runEmit(input);

  expect(actual).toEqual(expected);
});

it("should emit a program with a named default scenario", async () => {
  const input = test([], defaultScenario("name", []));

  const expected = dedent` 
    export default function name() {}
  `;

  const actual = await runEmit(input);

  expect(actual).toEqual(expected);
});

it("should emit named exports for each named scenario", async () => {
  const input = test([scenario("scenario1", []), scenario("scenario2", [])]);

  const expected = dedent`
    export function scenario1() {}

    export function scenario2() {}
  `;

  const actual = await runEmit(input);

  expect(actual).toEqual(expected);
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

  const actual = await runEmit(input);

  expect(actual).toEqual(expected);
});

it('should emit an import of "group" and call it when scenario has a group statement', async () => {
  const input = test([], defaultScenario(undefined, [group("name", [])]));

  const expected = dedent`
    import { group } from "k6";

    export default function () {
      group("name", () => {});
    }
  `;

  const actual = await runEmit(input);

  expect(actual).toEqual(expected);
});

it('should emit an import of "sleep" and call it when scenario has a sleep statement', async () => {
  const input = test([], defaultScenario(undefined, [sleep(4)]));

  const expected = dedent`
    import { sleep } from "k6";

    export default function () {
      sleep(4);
    }
  `;

  const actual = await runEmit(input);

  expect(actual).toEqual(expected);
});
