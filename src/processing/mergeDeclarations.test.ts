import { expect, it } from "@jest/globals";
import { assign, declare, group, string } from "../ast";
import { mergeDeclarations } from "./mergeDeclarations";

it("should do nothing when variable is re-declared in a child scope", () => {
  const input = group("root", [
    declare("const", "a", string("")),
    group("child", [declare("const", "a", string(""))]),
  ]);

  const expected = group("root", [
    declare("const", "a", string("")),
    group("child", [declare("const", "a", string(""))]),
  ]);

  expect(mergeDeclarations(input)).toEqual(expected);
});

it("should do nothing when variable is declared in a parent scope", () => {
  const input = group("root", [
    group("child", [declare("const", "a", string(""))]),
    declare("const", "a", string("")),
  ]);

  const expected = group("root", [
    group("child", [declare("const", "a", string(""))]),
    declare("const", "a", string("")),
  ]);

  expect(mergeDeclarations(input)).toEqual(expected);
});

it("should change declaration to a let-declaration and change other declarations to assignments", () => {
  const input = group("root", [
    declare("const", "a", string("")),
    declare("const", "a", string("")),
  ]);

  const expected = group("root", [
    declare("let", "a", string("")),
    assign("a", string("")),
  ]);

  expect(mergeDeclarations(input)).toEqual(expected);
});

it("should change declaration to a let-declaration and change other declarations to assignments in a child scope", () => {
  const input = group("root", [
    group("child", [
      declare("const", "a", string("")),
      declare("const", "a", string("")),
    ]),
  ]);

  const expected = group("root", [
    group("child", [declare("let", "a", string("")), assign("a", string(""))]),
  ]);

  expect(mergeDeclarations(input)).toEqual(expected);
});
