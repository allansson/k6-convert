import { expect, it } from "@jest/globals";
import {
  declare,
  defaultScenario,
  expression,
  fragment,
  identifier,
  jsonEncodedBody,
  member,
  object,
  safeHttp,
  scenario,
  string,
  test,
  unsafeHttp,
} from "~/src/convert/ast";
import { fromTest } from "~/src/convert/test";
import type {
  DefaultScenario,
  HttpRequestStep,
  JsonEncodedBody,
  Test,
} from "~/src/convert/test/types";

it("should return an empty test when the input is empty", () => {
  const input: Test = {
    scenarios: {},
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(test([]));
});

it("should return a test with a default scenario", () => {
  const input: Test = {
    defaultScenario: {
      name: "default",
      steps: [],
    },
    scenarios: {},
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([], defaultScenario("default", [])),
  );
});

it("should return a test with a named scenario", () => {
  const input: Test = {
    scenarios: {
      scenario1: {
        name: "scenario1",
        steps: [],
      },
    },
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([scenario("scenario1", [])]),
  );
});

it("should return a test with a default and a named scenario", () => {
  const input: Test = {
    defaultScenario: {
      name: "default",
      steps: [],
    },
    scenarios: {
      scenario1: {
        name: "scenario1",
        steps: [],
      },
    },
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([scenario("scenario1", [])], defaultScenario("default", [])),
  );
});

it("should return a test with multiple named scenarios", () => {
  const input: Test = {
    scenarios: {
      scenario1: {
        name: "scenario1",
        steps: [],
      },
      scenario2: {
        name: "scenario2",
        steps: [],
      },
    },
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([scenario("scenario1", []), scenario("scenario2", [])]),
  );
});

it("should report a problem when json body of a request is malformed", () => {
  const body: JsonEncodedBody = {
    mimeType: "application/json",
    content: "{",
  };

  const step: HttpRequestStep = {
    type: "http-request",
    method: "POST",
    url: "https://example.com",
    body,
    variables: {},
  };

  const defaultScenario: DefaultScenario = {
    steps: [step],
  };

  const input: Test = {
    defaultScenario,
    scenarios: {},
  };

  const result = fromTest(input);

  expect(result.issues).toEqual([
    {
      type: "InvalidJsonBody",
      content: "{",
      node: body,
    },
  ]);
});

describe("http variable declarations", () => {
  it("should not emit a response declaration when safe http response is not used", () => {
    const step: HttpRequestStep = {
      type: "http-request",
      method: "GET",
      url: "https://example.com",
      variables: {},
    };

    const input: Test = {
      defaultScenario: {
        steps: [step],
      },
      scenarios: {},
    };

    expect(fromTest(input).unsafeUnwrap()).toEqual(
      test(
        defaultScenario(undefined, [
          expression(safeHttp("GET", "https://example.com")),
        ]),
      ),
    );
  });

  it("should emit variable declaration when safe http request has a variable", () => {
    const step: HttpRequestStep = {
      type: "http-request",
      method: "GET",
      url: "https://example.com",
      variables: {
        myVariable: {
          type: "raw",
        },
      },
    };

    const input: Test = {
      defaultScenario: {
        steps: [step],
      },
      scenarios: {},
    };

    expect(fromTest(input).unsafeUnwrap()).toEqual(
      test(
        defaultScenario(undefined, [
          declare("const", "response", safeHttp("GET", "https://example.com")),
          fragment([
            declare(
              "const",
              "myVariable",
              member(identifier("response"), identifier("body")),
            ),
          ]),
        ]),
      ),
    );
  });

  it("should not emit a response declaration when unsafe http response is not used", () => {
    const step: HttpRequestStep = {
      type: "http-request",
      method: "POST",
      url: "https://example.com",
      body: {
        mimeType: "application/json",
        content: "{}",
      },
      variables: {},
    };

    const input: Test = {
      defaultScenario: {
        steps: [step],
      },
      scenarios: {},
    };

    expect(fromTest(input).unsafeUnwrap()).toEqual(
      test(
        defaultScenario(undefined, [
          declare("const", "body", jsonEncodedBody(object({}))),
          expression(
            unsafeHttp(
              "POST",
              "https://example.com",
              identifier("body"),
              object({
                "Content-Type": string("application/json"),
              }),
            ),
          ),
        ]),
      ),
    );
  });

  it("should emit variable declaration when unsafe http request has a variable", () => {
    const step: HttpRequestStep = {
      type: "http-request",
      method: "POST",
      url: "https://example.com",
      body: {
        mimeType: "application/json",
        content: "{}",
      },
      variables: {
        myVariable: {
          type: "raw",
        },
      },
    };

    const input: Test = {
      defaultScenario: {
        steps: [step],
      },
      scenarios: {},
    };

    expect(fromTest(input).unsafeUnwrap()).toEqual(
      test(
        defaultScenario(undefined, [
          declare("const", "body", jsonEncodedBody(object({}))),
          declare(
            "const",
            "response",
            unsafeHttp(
              "POST",
              "https://example.com",
              identifier("body"),
              object({
                "Content-Type": string("application/json"),
              }),
            ),
          ),
          fragment([
            declare(
              "const",
              "myVariable",
              member(identifier("response"), identifier("body")),
            ),
          ]),
        ]),
      ),
    );
  });
});
