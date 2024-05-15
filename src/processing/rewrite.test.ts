import { expect, it } from "vitest";
import { fragment, group, log, nil, sleep } from "~/src/convert/ast";
import { Rewriter, rewrite } from "~/src/processing/rewrite";

it("should insert statement before node in group", () => {
  const target = sleep(1);
  const newNode = log("log", nil());

  const tree = group("root", [target]);

  const rewrites = new Rewriter().insertBefore(target, newNode).done();

  const expected = group("root", [newNode, target]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should insert statement after node in group", () => {
  const target = sleep(1);
  const newNode = log("log", nil());

  const tree = group("root", [target]);

  const rewrites = new Rewriter().insertAfter(target, newNode).done();

  const expected = group("root", [target, newNode]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should replace statement in group", () => {
  const target = sleep(1);
  const newNode = log("log", nil());

  const tree = group("root", [target]);

  const rewrites = new Rewriter().replace(target, newNode).done();

  const expected = group("root", [newNode]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should remove statement from group", () => {
  const target = sleep(1);

  const tree = group("root", [target]);

  const rewrites = new Rewriter().remove(target).done();

  const expected = group("root", []);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should process nodes inside a fragment", () => {
  const sleep1 = sleep(1);
  const sleep2 = sleep(2);
  const sleep3 = sleep(3);

  const target = fragment([sleep1, sleep2]);

  const tree = group("root", [target]);

  const rewrites = new Rewriter().remove(sleep1).replace(sleep2, sleep3).done();

  const expected = group("root", [fragment([sleep3])]);
  const actual = rewrite(tree, rewrites);

  expect(actual).toEqual(expected);
});
