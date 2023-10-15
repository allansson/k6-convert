import { it, expect } from "@jest/globals";
import {
  type RewriteMap,
  rewrite,
  insertBefore,
  insertAfter,
  replace,
  remove,
} from "./rewrite";
import { group, log, nil, sleep } from "./ast";

it("should insert statement before node in group", () => {
  const target = sleep(1);
  const newNode = log(nil());

  const tree = group("root", [target]);

  const rewrites: RewriteMap = new Map([[target, insertBefore(newNode)]]);

  const expected = group("root", [newNode, target]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should insert statement after node in group", () => {
  const target = sleep(1);
  const newNode = log(nil());

  const tree = group("root", [target]);

  const rewrites: RewriteMap = new Map([[target, insertAfter(newNode)]]);

  const expected = group("root", [target, newNode]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should replace statement in group", () => {
  const target = sleep(1);
  const newNode = log(nil());

  const tree = group("root", [target]);

  const rewrites: RewriteMap = new Map([[target, replace(newNode)]]);

  const expected = group("root", [newNode]);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});

it("should remove statement from group", () => {
  const target = sleep(1);

  const tree = group("root", [target]);

  const rewrites: RewriteMap = new Map([[target, remove()]]);

  const expected = group("root", []);

  expect(rewrite(tree, rewrites)).toEqual(expected);
});
