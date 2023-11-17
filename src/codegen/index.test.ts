import { describe, expect, it } from "@jest/globals";
import dedent from "dedent";
import { emit } from "~/src/codegen";
import {
  declare,
  defaultScenario,
  group,
  log,
  nil,
  scenario,
  sleep,
  string,
  test,
  type Test,
} from "~/src/convert/ast";

function runEmit(input: Test): Promise<string> {
  return emit(input).then((result) => result.trimEnd());
}

describe("scenarios", () => {
  it("should emit an empty program when there are no scenarios", async () => {
    const expected = ``;

    const actual = await runEmit(test([]));

    expect(actual).toEqual(expected);
  });

  it("should emit a program with an unnamed default scenario", async () => {
    const input = test(defaultScenario([]));

    const expected = dedent`
      export default function () {}
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit a program with a named default scenario", async () => {
    const input = test(defaultScenario("name", []));

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

  it("should add spacing between statements", async () => {
    const input = test(
      [],
      defaultScenario([sleep(4), sleep(3), sleep(2), sleep(1), sleep(0)])
    );

    const expected = dedent`
      import { sleep } from "k6";

      export default function () {
        sleep(4);

        sleep(3);

        sleep(2);

        sleep(1);

        sleep(0);
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("imports", () => {
  it("should emit import once regardless of the times it is used", async () => {
    const input = test(
      defaultScenario([sleep(4), sleep(4), sleep(4), sleep(4), sleep(4)])
    );

    const expected = dedent`
      import { sleep } from "k6";
      
      export default function () {
        sleep(4);

        sleep(4);

        sleep(4);

        sleep(4);

        sleep(4);
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should merge imports from same module", async () => {
    const input = test([], defaultScenario([group("name", []), sleep(4)]));

    const expected = dedent`
      import { group, sleep } from "k6";

      export default function () {
        group("name", () => {});

        sleep(4);
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("groups", () => {
  it('should emit an import of "group" and call it when scenario has a group statement', async () => {
    const input = test(defaultScenario([group("name", [])]));

    const expected = dedent`
      import { group } from "k6";

      export default function () {
        group("name", () => {});
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit nested groups", async () => {
    const input = test(
      defaultScenario([group("name", [group("nested", [group("leaf", [])])])])
    );

    const expected = dedent`
      import { group } from "k6";

      export default function () {
        group("name", () => {
          group("nested", () => {
            group("leaf", () => {});
          });
        });
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should add spacing between statements", async () => {
    const input = test(
      defaultScenario([
        group("name", [sleep(4), sleep(3), sleep(2), sleep(1), sleep(0)]),
      ])
    );

    const expected = dedent`
      import { group, sleep } from "k6";

      export default function () {
        group("name", () => {
          sleep(4);

          sleep(3);
  
          sleep(2);
  
          sleep(1);
  
          sleep(0);
        });
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("sleep", () => {
  it('should emit an import of "sleep" and call it', async () => {
    const input = test(defaultScenario([sleep(4)]));

    const expected = dedent`
      import { sleep } from "k6";
  
      export default function () {
        sleep(4);
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("log", () => {
  it("should emit a log statement using console.log when level is 'log'", async () => {
    const input = test(defaultScenario([log("log", string("message"))]));

    const expected = dedent`
      export default function () {
        console.log("message");
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("user variable declarations", () => {
  it("should emit a const variable declaration", async () => {
    const input = test(defaultScenario([declare("const", "myVar", nil())]));

    const expected = dedent`
      export default function () {
        const myVar = null;
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit a let variable declaration", async () => {
    const input = test(defaultScenario([declare("let", "myVar", nil())]));

    const expected = dedent`
      export default function () {
        let myVar = null;
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});
