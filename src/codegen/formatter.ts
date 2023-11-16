import type * as es from "estree";
import type { AstPath, Plugin, Printer, SupportOption } from "prettier";
import { builders } from "prettier/doc";
import * as estreePlugin from "prettier/plugins/estree";
import { format as formatWithPrettier } from "prettier/standalone";

const { hardline } = builders;
const estree = estreePlugin.printers.estree;

declare module "prettier/plugins/estree" {
  const printers: {
    estree: Printer<es.Node>;
  };

  const defaultOptions: Record<string, unknown>;
  const options: Record<string, SupportOption>;
}

function createPlugin(program: es.Program): Plugin {
  return {
    languages: [
      {
        name: "estree",
        parsers: ["estree"],
      },
    ],
    parsers: {
      estree: {
        locStart() {
          return 0;
        },
        locEnd() {
          return 0;
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
          const doc = estree.print(path, options, print);
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
    defaultOptions: estreePlugin.defaultOptions,
    options: estreePlugin.options,
  };
}

async function format(ast: es.Program): Promise<string> {
  return await formatWithPrettier("i", {
    filepath: "test.js",
    parser: "estree",
    plugins: [createPlugin(ast)],
  });
}

export { format };
