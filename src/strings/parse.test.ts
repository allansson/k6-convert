import { expect, it } from "vitest";
import { parse } from "~/src/strings/parse";

it("should parse an empty string", () => {
  expect(parse("")).toEqual({
    strings: [""],
    variables: [],
  });
});

it("should parse a string with no variables", () => {
  expect(parse("hello world")).toEqual({
    strings: ["hello world"],
    variables: [],
  });
});

it("should parse a string with a single variable", () => {
  expect(parse("hello ${world}")).toEqual({
    strings: ["hello ", ""],
    variables: ["world"],
  });
});

it("should parse a string with multiple variables", () => {
  expect(parse("hello ${world}, ${foo}")).toEqual({
    strings: ["hello ", ", ", ""],
    variables: ["world", "foo"],
  });
});

it("should parse a string with a variable at the start", () => {
  expect(parse("${world} hello")).toEqual({
    strings: ["", " hello"],
    variables: ["world"],
  });
});

it("should parse a string with a variable at the end", () => {
  expect(parse("hello ${world}")).toEqual({
    strings: ["hello ", ""],
    variables: ["world"],
  });
});

it("should parse a string with a variable at the start and end", () => {
  expect(parse("${world} hello ${foo}")).toEqual({
    strings: ["", " hello ", ""],
    variables: ["world", "foo"],
  });
});

it("should parse a string with a variable at the start and end with no space", () => {
  expect(parse("${world}hello${foo}")).toEqual({
    strings: ["", "hello", ""],
    variables: ["world", "foo"],
  });
});

it("should parse an unclosed variable as a string up until the end", () => {
  expect(parse("hello ${world")).toEqual({
    strings: ["hello ${world"],
    variables: [],
  });
});

it("should parse an unclosed variable as a string up until the next variable", () => {
  expect(parse("hello ${world ${foo}")).toEqual({
    strings: ["hello ${world ", ""],
    variables: ["foo"],
  });
});

it("should parse an empty variable as a string", () => {
  expect(parse("hello ${}")).toEqual({
    strings: ["hello ${}"],
    variables: [],
  });
});

it("should not parse variable when encountering second opening brace", () => {
  expect(parse("hello ${world {foo")).toEqual({
    strings: ["hello ${world {foo"],
    variables: [],
  });
});
