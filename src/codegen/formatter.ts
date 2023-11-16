import type * as es from "estree";
import type { AstPath, Plugin, Printer } from "prettier";
import { builders } from "prettier/doc";
import * as estreePlugin from "prettier/plugins/estree";
import { format as formatWithPrettier } from "prettier/standalone";

const { hardline } = builders;

declare module "prettier/plugins/estree" {
  const printers: {
    estree: Printer<es.Node>;
  };
}

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
    printers: {
      estree: {
        print(path: AstPath<es.Node>, options, print) {
          const doc = estreePlugin.printers.estree.print(path, options, print);
          const node = path.getNode();

          if (node?.newLine === "before") {
            return [hardline, doc];
          }

          if (node?.newLine === "after") {
            return [doc, hardline];
          }

          if (node?.newLine === "both") {
            return [hardline, doc, hardline];
          }

          return doc;
        },
      },
    },
  };
}

async function format(ast: es.Program): Promise<string> {
  return await formatWithPrettier("i", {
    filepath: "test.js",
    parser: "k6-convert",
    plugins: [createPlugin(ast)],
  });
}

export { format };
