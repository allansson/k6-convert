import type * as es from "estree";
import type { Plugin } from "prettier";
import * as estreePlugin from "prettier/plugins/estree";
import { format } from "prettier/standalone";

import type { Test } from "~/src/convert/ast";

function createPlugin(program: es.Program): Plugin {
  return {
    languages: [
      {
        name: "k6-convert",
        parsers: ["k6-convert"],
      },
    ],
    parsers: {
      "k6-convert": {
        locStart(node) {
          return node.start;
        },
        locEnd(node) {
          return node.end;
        },
        parse() {
          return program;
        },
        astFormat: "estree",
      },
    },
  };
}

async function emit(test: Test): Promise<string> {
  const ast: es.Program = {
    type: "Program",
    sourceType: "module",
    body: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "Literal",
          value: "use strict",
          raw: '"use strict"',
        },
        directive: "use strict",
      },
    ],
  };

  return await format("i", {
    filepath: "test.js",
    parser: "k6-convert",
    plugins: [createPlugin(ast), estreePlugin],
  });
}

export { emit };
