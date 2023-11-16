import type * as es from "estree";
import { literal } from "~/src/codegen/builders/expressions";

function importDeclaration(
  specifiers: es.ImportDeclaration["specifiers"],
  from: string
): es.ImportDeclaration {
  return {
    type: "ImportDeclaration",
    specifiers,
    source: literal(from),
  };
}

function namedImport(name: string, alias?: string): es.ImportSpecifier {
  return {
    type: "ImportSpecifier",
    imported: {
      type: "Identifier",
      name,
    },
    local: (alias && {
      type: "Identifier",
      name: alias,
    }) as es.Identifier,
  };
}

function defaultImport(name: string): es.ImportDefaultSpecifier {
  return {
    type: "ImportDefaultSpecifier",
    local: {
      type: "Identifier",
      name,
    },
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

function program(body: es.Program["body"]): es.Program {
  return {
    type: "Program",
    sourceType: "module",
    body,
  };
}

export {
  defaultExport,
  defaultImport,
  importDeclaration,
  namedExport,
  namedImport,
  program,
};
