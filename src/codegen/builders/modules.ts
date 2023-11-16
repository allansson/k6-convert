import * as es from "estree";

function functionDeclaration(
  name: string | undefined,
  body: es.Statement[]
): es.FunctionDeclaration {
  return {
    type: "FunctionDeclaration",
    id: name !== undefined ? { type: "Identifier", name } : null,
    params: [],
    body: {
      type: "BlockStatement",
      body: body,
    },
    generator: false,
    async: false,
  };
}

function namedExport(declaration: es.Declaration): es.ExportNamedDeclaration {
  return {
    type: "ExportNamedDeclaration",
    declaration,
    specifiers: [],
    source: null,
  };
}

function defaultExport(
  declaration: es.Declaration
): es.ExportDefaultDeclaration {
  return {
    type: "ExportDefaultDeclaration",
    declaration,
  };
}

function program(body: Array<es.ModuleDeclaration | es.Statement>): es.Program {
  return {
    type: "Program",
    sourceType: "module",
    body,
  };
}

export { defaultExport, functionDeclaration, namedExport, program };
