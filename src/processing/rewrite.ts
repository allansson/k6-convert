import type { ScopedStatement } from "../analysis/analysis";
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

function insertBefore(statement: Statement): Rewrite {
  return { type: "InsertBefore", statement };
}

function insertAfter(statement: Statement): Rewrite {
  return { type: "InsertAfter", statement };
}

function replace(statement: Statement): Rewrite {
  return { type: "Replace", statement };
}

function remove(): Rewrite {
  return { type: "Remove" };
}

type RewriteMap = Map<Statement, Rewrite>;

function rewrite(statement: Statement, rewrites: RewriteMap): Statement {
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

function applyRewrites(
  statement: ScopedStatement
): (rewrites: RewriteMap) => Statement {
  return (rewrites) => {
    return rewrite(statement, rewrites);
  };
}

export {
  applyRewrites,
  insertAfter,
  insertBefore,
  remove,
  replace,
  rewrite,
  type RewriteMap,
};
