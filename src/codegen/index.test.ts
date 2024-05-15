import dedent from "dedent";
import { describe, expect, it } from "vitest";
import { emit } from "~/src/codegen";
import {
  assign,
  declare,
  defaultScenario,
  expression,
  group,
  identifier,
  log,
  nil,
  safeHttp,
  scenario,
  sleep,
  string,
  test,
  urlEncodedBody,
  type TestDefinition,
} from "~/src/convert/ast";

async function runEmit(input: TestDefinition): Promise<string> {
  const result = await emit(input);

  return result.map((value) => value.trimEnd()).unsafeUnwrap();
}

function js(strings: TemplateStringsArray): string {
  // Remove trailing whitespace on each line
  const trimmed = strings
    .join("")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  return dedent(trimmed);
}

describe("scenarios", () => {
  it("should emit an empty program when there are no scenarios", async () => {
    const expected = ``;

    const actual = await runEmit(test([]));

    expect(actual).toEqual(expected);
  });

  it("should emit a program with an unnamed default scenario", async () => {
    const input = test(defaultScenario([]));

    const expected = js`
      export default function () {}
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit a program with a named default scenario", async () => {
    const input = test(defaultScenario("name", []));

    const expected = js` 
      export default function name() {}
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit named exports for each named scenario", async () => {
    const input = test([scenario("scenario1", []), scenario("scenario2", [])]);

    const expected = js`
      export function scenario1() {}

      export function scenario2() {}
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit both named and default scenarios", async () => {
    const input = test(
      [scenario("scenario1", []), scenario("scenario2", [])],
      defaultScenario("scenario3", []),
    );

    const expected = js`
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
      defaultScenario([sleep(4), sleep(3), sleep(2), sleep(1), sleep(0)]),
    );

    const expected = js`
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
      defaultScenario([sleep(4), sleep(4), sleep(4), sleep(4), sleep(4)]),
    );

    const expected = js`
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

    const expected = js`
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

    const expected = js`
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
      defaultScenario([group("name", [group("nested", [group("leaf", [])])])]),
    );

    const expected = js`
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
      ]),
    );

    const expected = js`
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

    const expected = js`
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

    const expected = js`
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

    const expected = js`
      export default function () {
        const myVar = null;
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit a let variable declaration", async () => {
    const input = test(defaultScenario([declare("let", "myVar", nil())]));

    const expected = js`
      export default function () {
        let myVar = null;
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("assignments", () => {
  it("should assign expression to variable", async () => {
    const input = test(defaultScenario([assign("name", nil())]));

    const expected = js`
      export default function () {
        name = null;
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });
});

describe("http", () => {
  it("should import default export as http", async () => {
    const input = test(
      defaultScenario([expression(safeHttp("GET", "https://test.k6.io"))]),
    );

    const expected = js`
      import http from "k6/http";

      export default function () {
        http.get("https://test.k6.io");
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  it("should emit safe http methods", async () => {
    const input = test(
      defaultScenario([
        expression(safeHttp("GET", "https://test.k6.io")),
        expression(safeHttp("HEAD", "https://test.k6.io")),
        expression(safeHttp("OPTIONS", "https://test.k6.io")),
      ]),
    );

    const expected = js`
      import http from "k6/http";

      export default function () {
        http.get("https://test.k6.io");

        http.head("https://test.k6.io");

        http.options("https://test.k6.io");
      }
    `;

    const actual = await runEmit(input);

    expect(actual).toEqual(expected);
  });

  describe("bodies", () => {
    describe("url-encoded", () => {
      it("should emit an object literal with the fields", async () => {
        const input = test(
          defaultScenario([
            declare(
              "const",
              "body",
              urlEncodedBody({
                field1: string("value1"),
                field2: string("value2"),
                field3: identifier("someVar"),
              }),
            ),
          ]),
        );

        const expected = js`
          export default function () { 
            const body = { field1: "value1", field2: "value2", field3: someVar };
          }
        `;

        const actual = await runEmit(input);

        expect(actual).toEqual(expected);
      });
    });
  });
});
