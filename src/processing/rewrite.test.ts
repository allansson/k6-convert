import { expect, it } from "@jest/globals";
import { group, log, nil, sleep } from "~/src/convert/ast";
import { Rewriter, rewrite } from "~/src/processing/rewrite";

it("should insert statement before node in group", () => {
  const target = sleep(1);
  const newNode = log(nil());

  const tree = group("root", [target]);

  const rewrites = new Rewriter().insertBefore(target, newNode).done();

  const expected = group("root", [newNode, target]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should insert statement after node in group", () => {
  const target = sleep(1);
  const newNode = log(nil());

  const tree = group("root", [target]);

  const rewrites = new Rewriter().insertAfter(target, newNode).done();

  const expected = group("root", [target, newNode]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should replace statement in group", () => {
  const target = sleep(1);
  const newNode = log(nil());

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
