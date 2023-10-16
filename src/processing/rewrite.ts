import type { Statement } from "../ast";

interface InsertBefore {
  type: "InsertBefore";
  statement: Statement;
}

interface InsertAfter {
  type: "InsertAfter";
  statement: Statement;
}

interface Replace {
  type: "Replace";
  statement: Statement;
}

interface Remove {
  type: "Remove";
}

type Rewrite = InsertBefore | InsertAfter | Replace | Remove;

export function insertBefore(statement: Statement): Rewrite {
  return { type: "InsertBefore", statement };
}

export function insertAfter(statement: Statement): Rewrite {
  return { type: "InsertAfter", statement };
}

export function replace(statement: Statement): Rewrite {
  return { type: "Replace", statement };
}

export function remove(): Rewrite {
  return { type: "Remove" };
}

export type RewriteMap = Map<Statement, Rewrite>;

export function rewrite(statement: Statement, rewrites: RewriteMap): Statement {
  switch (statement.type) {
    case "GroupStatement":
      return {
        ...statement,
        statements: statement.statements.flatMap((s) => {
          const op = rewrites.get(s);

          switch (op?.type) {
            case "InsertBefore":
              return [op.statement, rewrite(s, rewrites)];

            case "InsertAfter":
              return [rewrite(s, rewrites), op.statement];

            case "Replace":
              return [op.statement];

            case "Remove":
              return [];
          }

          return [rewrite(s, rewrites)];
        }),
      };

    case "UserVariableDeclaration":
    case "AssignStatement":
    case "SleepStatement":
    case "LogStatement":
      return statement;
  }
}
