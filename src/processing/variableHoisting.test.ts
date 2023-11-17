import { expect, it } from "@jest/globals";
import {
  assign,
  declare,
  group,
  identifier,
  log,
  nil,
  string,
} from "~/src/convert/ast";
import { hoistVariables } from "~/src/processing/variableHoisting";

it("should do nothing when variable is only referenced in the same scope", () => {
  const input = group("root", [
    declare("const", "a", string("")),
    log("log", identifier("a")),
  ]);

  const expected = group("root", [
    declare("const", "a", string("")),
    log("log", identifier("a")),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("should do nothing when variable is referenced in a child scope", () => {
  const input = group("root", [
    declare("const", "a", string("")),

    group("child", [log("log", identifier("a"))]),
  ]);

  const expected = group("root", [
    declare("const", "a", string("")),

    group("child", [log("log", identifier("a"))]),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("it should do nothing when variable is re-declared in child scope and not referenced outside it", () => {
  const input = group("root", [
    declare("const", "a", string("")),

    group("child", [
      declare("const", "a", string("")),
      log("log", identifier("a")),
    ]),
  ]);

  const expected = group("root", [
    declare("const", "a", string("")),

    group("child", [
      declare("const", "a", string("")),
      log("log", identifier("a")),
    ]),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("should hoist declaration to same scope as the variabled reference", () => {
  const input = group("root", [
    group("child", [declare("const", "a", string(""))]),

    log("log", identifier("a")),
  ]);

  const expected = group("root", [
    declare("let", "a", nil()),

    group("child", [assign("a", string(""))]),

    log("log", identifier("a")),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("it should hoist declaration to a scope so that all references can access it", () => {
  const input = group("root", [
    group("child", [declare("const", "a", string(""))]),

    group("child2", [log("log", identifier("a"))]),
  ]);

  const expected = group("root", [
    declare("let", "a", nil()),

    group("child", [assign("a", string(""))]),

    group("child2", [log("log", identifier("a"))]),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("it should insert declaration before the group where it was hoisted from", () => {
  const input = group("root", [
    declare("const", "a", string("")),

    group("child", [declare("const", "b", string(""))]),

    group("child", [declare("const", "c", string(""))]),

    log("log", identifier("c")),
  ]);

  const expected = group("root", [
    declare("const", "a", string("")),

    group("child", [declare("const", "b", string(""))]),

    declare("let", "c", nil()),

    group("child", [assign("c", string(""))]),

    log("log", identifier("c")),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("it should hoist declaration from nested scopes", () => {
  const input = group("root", [
    group("child", [group("child2", [declare("const", "a", string(""))])]),

    log("log", identifier("a")),
  ]);

  const expected = group("root", [
    declare("let", "a", nil()),

    group("child", [group("child2", [assign("a", string(""))])]),

    log("log", identifier("a")),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});

it("should hoist re-declared variables to the scope where they are visible to the remaining references", () => {
  const input = group("root", [
    group("child", [declare("const", "a", string(""))]),

    group("child2", [log("log", identifier("a"))]),

    group("child3", [
      group("child4", [declare("const", "a", string(""))]),

      group("child5", [log("log", identifier("a"))]),
    ]),

    group("child6", [declare("const", "b", string(""))]),

    log("log", identifier("b")),
  ]);

  const expected = group("root", [
    declare("let", "a", nil()),

    group("child", [assign("a", string(""))]),

    group("child2", [log("log", identifier("a"))]),

    group("child3", [
      declare("let", "a", nil()),

      group("child4", [assign("a", string(""))]),

      group("child5", [log("log", identifier("a"))]),
    ]),

    declare("let", "b", nil()),

    group("child6", [assign("b", string(""))]),

    log("log", identifier("b")),
  ]);

  expect(hoistVariables(input)).toEqual(expected);
});
