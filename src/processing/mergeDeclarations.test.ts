import { expect, it } from "@jest/globals";
import {
  assign,
  declare,
  group,
  scenario,
  string,
  test,
} from "~/src/convert/ast";
import { mergeDeclarations } from "~/src/processing/mergeDeclarations";

it("should do nothing when variable is re-declared in a child scope", () => {
  const input = test([
    scenario("root", [
      declare("const", "a", string("")),
      group("child", [declare("const", "a", string(""))]),
    ]),
  ]);

  const expected = test([
    scenario("root", [
      declare("const", "a", string("")),
      group("child", [declare("const", "a", string(""))]),
    ]),
  ]);

  expect(mergeDeclarations(input).unsafeUnwrap()).toEqual(expected);
});

it("should do nothing when variable is declared in a parent scope", () => {
  const input = test([
    scenario("root", [
      group("child", [declare("const", "a", string(""))]),
      declare("const", "a", string("")),
    ]),
  ]);

  const expected = test([
    scenario("root", [
      group("child", [declare("const", "a", string(""))]),
      declare("const", "a", string("")),
    ]),
  ]);

  expect(mergeDeclarations(input).unsafeUnwrap()).toEqual(expected);
});

it("should change declaration to a let-declaration and change other declarations to assignments", () => {
  const input = test([
    scenario("root", [
      declare("const", "a", string("")),
      declare("const", "a", string("")),
    ]),
  ]);

  const expected = test([
    scenario("root", [
      declare("let", "a", string("")),
      assign("a", string("")),
    ]),
  ]);

  expect(mergeDeclarations(input).unsafeUnwrap()).toEqual(expected);
});

it("should change declaration to a let-declaration and change other declarations to assignments in a child scope", () => {
  const input = test([
    scenario("root", [
      group("child", [
        declare("const", "a", string("")),
        declare("const", "a", string("")),
      ]),
    ]),
  ]);

  const expected = test([
    scenario("root", [
      group("child", [
        declare("let", "a", string("")),
        assign("a", string("")),
      ]),
    ]),
  ]);

  expect(mergeDeclarations(input).unsafeUnwrap()).toEqual(expected);
});
